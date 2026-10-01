import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { processDirectReferralReward } from "@/lib/services/referralService";
import { getNumericConfig } from "@/lib/configService";
import { APP_CONFIG } from "@/lib/constants";
import { verifyOtp } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordActivity } from "@/lib/auditLogger";
import { getUserWalletBalances } from "@/lib/services/walletService";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 package activations per 5 minutes per user
    const rateLimitRes = await checkRateLimit({
      key: `activate_usr:${session.userId}`,
      limit: 10,
      windowSeconds: 300,
    });
    if (!rateLimitRes.success) {
      return NextResponse.json(
        { error: "Too many activation requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const {
      packageType = "BASIC_SAVING",
      amountInInr,
      amountInUsdt,
      amount,
      targetCustomId,
      transactionPin,
      otp,
      fdTenureDays,
      useBonus = true,
    } = await req.json();

    const rawAmount = amountInUsdt ?? amount ?? amountInInr;
    const verificationCode = (otp || transactionPin || "").trim();

    if (!rawAmount || !verificationCode) {
      return NextResponse.json({ error: "Amount and Security OTP / PIN are required." }, { status: 400 });
    }

    let parsedUsdt = Number(rawAmount);
    if (!amountInUsdt && !amount && Number(amountInInr) > 5000) {
      parsedUsdt = Number(amountInInr) / 110;
    }

    // Strict boundary & NaN validation against financial tampering (min $2 USDT)
    if (!Number.isFinite(parsedUsdt) || isNaN(parsedUsdt) || parsedUsdt < 2) {
      return NextResponse.json({ error: "Minimum activation stake is $2.00 USDT." }, { status: 400 });
    }

    // Verify caller user PIN or OTP
    const caller = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, customId: true, email: true, transactionPin: true, fundBalance: true, status: true, adminId: true, role: true },
    });

    if (!caller) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    let isAuthorized = false;
    if (verificationCode) {
      isAuthorized = await verifyOtp(caller.email, verificationCode, "TRANSACTION");
      if (!isAuthorized && caller.transactionPin) {
        isAuthorized = await comparePin(verificationCode, caller.transactionPin);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Invalid or expired Security PIN / OTP code." }, { status: 401 });
    }

    // Target beneficiary (Self or another member)
    let beneficiary = caller;
    if (targetCustomId && targetCustomId.trim().toUpperCase() !== caller.customId.toUpperCase()) {
      const found = await db.user.findUnique({ 
        where: { customId: targetCustomId.trim().toUpperCase() },
        select: { id: true, customId: true, fullName: true, email: true, status: true, adminId: true },
      });
      if (!found) {
        return NextResponse.json({ error: `Beneficiary ID ${targetCustomId} not found.` }, { status: 404 });
      }
      if (caller.role !== "SUPER_ROOT_ADMIN" && caller.adminId && found.adminId && found.adminId !== caller.adminId) {
        return NextResponse.json({ error: `Beneficiary ID ${targetCustomId} not found.` }, { status: 404 });
      }
      beneficiary = found as any;
    }

    const amountUsdtDec = new Decimal(parsedUsdt.toString());
    const amountInrDec = amountUsdtDec; // 1:1 Pure USDT throughout

    // Daily ROI Rate & Tenure: 4% daily returns, 2X pool allocation (50 days simple or compounding)
    const dailyRoi = await getNumericConfig("BASIC_PLAN_DAILY_ROI", APP_CONFIG.basicPlan.dailyRoiRate || 4.0);
    const tenure = await getNumericConfig("BASIC_PLAN_TENURE_DAYS", APP_CONFIG.basicPlan.tenureDays || 50);
    const dailyRoiRate = new Decimal(dailyRoi);
    const tenureDays = tenure;

    // Fetch caller's multi-wallet balances
    const callerBalances = await getUserWalletBalances(caller.id);

    // Calculate Bonus Wallet utility (up to 10% of investment amount from Bonus Wallet)
    const maxBonusUtility = +(amountUsdtDec.times(0.10).toNumber()).toFixed(2);
    let bonusUsed = 0;
    if (useBonus && callerBalances.bonusBalance > 0) {
      bonusUsed = Math.min(callerBalances.bonusBalance, maxBonusUtility);
    }
    const bonusUsedDec = new Decimal(bonusUsed.toString());
    const fundRequiredDec = amountUsdtDec.minus(bonusUsedDec);

    // Check caller Secondary Wallet (Fund balance)
    const callerFundDec = new Decimal(caller.fundBalance.toString());
    if (callerFundDec.lessThan(fundRequiredDec)) {
      return NextResponse.json({
        error: `Insufficient Secondary Wallet balance. Required: $${fundRequiredDec.toFixed(2)} USDT (${bonusUsed > 0 ? `$${bonusUsed.toFixed(2)} funded from Bonus Wallet` : "no bonus"}), but you have $${callerFundDec.toFixed(2)} USDT in Secondary Wallet.`,
      }, { status: 400 });
    }

    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + tenureDays);

    // Create contract
    const contract = await db.investmentContract.create({
      data: {
        userId: beneficiary.id,
        packageType: packageType === "FIX_DEPOSIT" ? "FIX_DEPOSIT" : "BASIC_SAVING",
        amountInInr: amountInrDec.toFixed(2),
        amountInUsdt: amountUsdtDec.toFixed(8),
        dailyRoiRate: dailyRoiRate.toFixed(2),
        tenureDays,
        daysPaid: 0,
        status: "ACTIVE",
        maturityDate,
      },
    });

    // 1. Deduct Bonus Wallet if used (creates SIGNUP_BONUS debit ledger entry)
    if (bonusUsed > 0) {
      await db.ledgerEntry.create({
        data: {
          userId: caller.id,
          type: "SIGNUP_BONUS",
          wallet: "INCOME",
          amount: bonusUsedDec.negated().toFixed(8),
          balanceAfter: Math.max(0, callerBalances.bonusBalance - bonusUsed).toFixed(8),
          referenceKey: `BONUS_UTIL_${contract.id}_${caller.id}`,
          description: `Used $${bonusUsed.toFixed(2)} USDT (10%) from Bonus Wallet to activate Stake for ${beneficiary.customId}`,
          sourceUserId: beneficiary.id,
        },
      });
    }

    // 2. Deduct P2P/Fund Wallet of caller
    await executeLedgerTransaction({
      userId: caller.id,
      type: "PACKAGE_PURCHASE",
      wallet: "FUND",
      amount: fundRequiredDec.negated(),
      referenceKey: `PKG_PURCHASE_${contract.id}_${caller.id}`,
      description: `Activated Stake ($${amountUsdtDec.toFixed(2)} USDT) for ${beneficiary.customId} [Secondary: $${fundRequiredDec.toFixed(2)}, Bonus: $${bonusUsed.toFixed(2)}]`,
      sourceUserId: beneficiary.id,
    });

    // Ensure beneficiary status is ACTIVE
    if (beneficiary.status === "INACTIVE") {
      await db.user.update({
        where: { id: beneficiary.id },
        data: { status: "ACTIVE" },
      });
    }

    // Process instant direct referral commission for beneficiary sponsor (Slide 15: 10% Direct)
    await processDirectReferralReward(beneficiary.id, contract.id, amountUsdtDec.toNumber());

    await recordActivity({
      userId: caller.id,
      action: "PACKAGE_ACTIVATION",
      category: "FINANCIAL",
      description: `Activated Stake of $${amountUsdtDec.toFixed(2)} USDT for ${beneficiary.customId} (Bonus: $${bonusUsed.toFixed(2)}, Secondary: $${fundRequiredDec.toFixed(2)})`,
      req,
      metadata: {
        contractId: contract.id,
        packageType,
        amountInUsdt: amountUsdtDec.toNumber(),
        bonusUsed,
        p2pPaid: fundRequiredDec.toNumber(),
        beneficiaryCustomId: beneficiary.customId,
        tenureDays,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Stake of $${amountUsdtDec.toFixed(2)} USDT activated successfully for ${beneficiary.customId}!`,
      contractId: contract.id,
      bonusUsed,
      p2pPaid: fundRequiredDec.toNumber(),
    });
  } catch (error: any) {
    console.error("Activation error:", error);
    return NextResponse.json({ error: error.message || "Failed to activate stake." }, { status: 500 });
  }
}