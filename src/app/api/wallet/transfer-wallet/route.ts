import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeWalletTransfer, getUserWalletBalances } from "@/lib/services/walletService";
import { verifyOtp } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordActivity } from "@/lib/auditLogger";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 wallet transfers per 5 minutes per user
    const rateLimitRes = await checkRateLimit({
      key: `wallet_transfer:${session.userId}`,
      limit: 10,
      windowSeconds: 300,
    });
    if (!rateLimitRes.success) {
      return NextResponse.json(
        { error: "Too many transfer requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { sourceWallet, targetWallet, amount, transactionPin, otp } = body;

    if (!sourceWallet || !targetWallet || !amount) {
      return NextResponse.json(
        { error: "Source wallet, target wallet, and amount are required." },
        { status: 400 }
      );
    }

    if (sourceWallet !== "ROI" && sourceWallet !== "WORKING") {
      return NextResponse.json(
        { error: "Invalid source wallet. Only ROI and Working Wallets can be transferred." },
        { status: 400 }
      );
    }

    if (targetWallet !== "MAIN" && targetWallet !== "P2P") {
      return NextResponse.json(
        { error: "Invalid target wallet. You can only transfer to Main Wallet or P2P Wallet." },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid positive transfer amount." },
        { status: 400 }
      );
    }

    const verificationCode = (otp || transactionPin || "").trim();
    if (!verificationCode) {
      return NextResponse.json(
        { error: "Transaction PIN or OTP is required to authorize wallet transfer." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, transactionPin: true, customId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // PIN / OTP verification
    let isAuthorized = false;
    if (verificationCode) {
      isAuthorized = await verifyOtp(user.email, verificationCode, "TRANSACTION");
      if (!isAuthorized && user.transactionPin) {
        isAuthorized = await comparePin(verificationCode, user.transactionPin);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Invalid Transaction PIN or Security OTP." },
        { status: 401 }
      );
    }

    // Execute transfer
    const result = await executeWalletTransfer({
      userId: user.id,
      sourceWallet,
      targetWallet,
      amount: numAmount,
    });

    await recordActivity({
      userId: user.id,
      action: "WALLET_TRANSFER",
      category: "FINANCIAL",
      description: `Transferred $${numAmount.toFixed(2)} USDT from ${sourceWallet} Wallet to ${targetWallet} Wallet`,
      req,
      metadata: {
        sourceWallet,
        targetWallet,
        amount: numAmount,
      },
    });

    const updatedBalances = await getUserWalletBalances(user.id);

    return NextResponse.json({
      success: true,
      message: `Successfully transferred $${numAmount.toFixed(2)} USDT from ${sourceWallet} Wallet to ${targetWallet === "MAIN" ? "Main (Withdrawal)" : "P2P"} Wallet!`,
      transferredAmount: numAmount,
      balances: updatedBalances,
    });
  } catch (error: any) {
    console.error("Wallet transfer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process wallet transfer." },
      { status: 500 }
    );
  }
}
