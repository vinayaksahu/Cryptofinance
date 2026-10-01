import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import Decimal from "decimal.js";

export interface WalletBalances {
  bonusBalance: number;
  roiBalance: number;
  workingBalance: number;
  p2pBalance: number;
  secondaryBalance?: number;
  mainBalance: number;
  totalWithdrawn: number;
}

/**
 * Calculates accurate real-time balances for all ledgers in the Crypto Finance ecosystem:
 * 1. Bonus Wallet (Non-withdrawable, max 10% utility for ID activations)
 * 2. ROI Wallet (Daily 4% returns from 2X pool, can transfer to Main or Secondary)
 * 3. Working Wallet (Direct + 10-Level Royalty + Milestones, can transfer to Main or Secondary)
 * 4. Secondary Wallet (Credited by deposit requests, used for self/peer ID activations with 10% bonus, P2P transfers)
 * 5. Main Wallet (Withdrawable wallet, cashout to BEP-20 USDT)
 */
export async function getUserWalletBalances(userId: string): Promise<WalletBalances> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fundBalance: true,
      incomeBalance: true,
      totalWithdrawn: true,
    },
  });

  if (!user) {
    return {
      bonusBalance: 0,
      roiBalance: 0,
      workingBalance: 0,
      p2pBalance: 0,
      mainBalance: 0,
      totalWithdrawn: 0,
    };
  }

  // 1. Bonus Wallet: Sum of all SIGNUP_BONUS entries (includes credits + any debits used for activations)
  const bonusAgg = await db.ledgerEntry.aggregate({
    where: {
      userId,
      type: "SIGNUP_BONUS",
    },
    _sum: { amount: true },
  });
  const bonusBalance = Math.max(0, Number(bonusAgg._sum.amount?.toString() ?? "0"));

  // 2. ROI Wallet:
  // Credits: BASIC_ROI and FD_ROI
  const roiCreditsAgg = await db.ledgerEntry.aggregate({
    where: {
      userId,
      type: { in: ["BASIC_ROI", "FD_ROI"] },
    },
    _sum: { amount: true },
  });
  const totalRoiEarned = Math.max(0, Number(roiCreditsAgg._sum.amount?.toString() ?? "0"));

  // Debits: Ledgers with referenceKey starting with ROI_TO_
  const roiDebitsAgg = await db.ledgerEntry.aggregate({
    where: {
      userId,
      OR: [
        { referenceKey: { startsWith: "ROI_TO_MAIN_" } },
        { referenceKey: { startsWith: "ROI_TO_P2P_" } },
      ],
    },
    _sum: { amount: true },
  });
  const totalRoiDebited = Math.abs(Number(roiDebitsAgg._sum.amount?.toString() ?? "0"));
  const roiBalance = Math.max(0, +(totalRoiEarned - totalRoiDebited).toFixed(2));

  // 3. Working Wallet:
  // Credits: DIRECT_REFERRAL, BASIC_LEVEL_INCOME, FD_LEVEL_INCOME, RANK_REWARD_CASHOUT
  const workingCreditsAgg = await db.ledgerEntry.aggregate({
    where: {
      userId,
      type: { in: ["DIRECT_REFERRAL", "BASIC_LEVEL_INCOME", "FD_LEVEL_INCOME", "RANK_REWARD_CASHOUT"] },
    },
    _sum: { amount: true },
  });
  const totalWorkingEarned = Math.max(0, Number(workingCreditsAgg._sum.amount?.toString() ?? "0"));

  // Debits: Ledgers with referenceKey starting with WORKING_TO_
  const workingDebitsAgg = await db.ledgerEntry.aggregate({
    where: {
      userId,
      OR: [
        { referenceKey: { startsWith: "WORKING_TO_MAIN_" } },
        { referenceKey: { startsWith: "WORKING_TO_P2P_" } },
      ],
    },
    _sum: { amount: true },
  });
  const totalWorkingDebited = Math.abs(Number(workingDebitsAgg._sum.amount?.toString() ?? "0"));
  const workingBalance = Math.max(0, +(totalWorkingEarned - totalWorkingDebited).toFixed(2));

  // 4. Main Wallet (Withdrawal Wallet):
  // Credits: Transfers from ROI and Working to Main
  const mainCreditsAgg = await db.ledgerEntry.aggregate({
    where: {
      userId,
      OR: [
        { referenceKey: { startsWith: "ROI_TO_MAIN_" } },
        { referenceKey: { startsWith: "WORKING_TO_MAIN_" } },
      ],
    },
    _sum: { amount: true },
  });
  const totalTransferredToMain = Math.abs(Number(mainCreditsAgg._sum.amount?.toString() ?? "0"));

  // Total Withdrawn from Main Wallet
  const withdrawalsAgg = await db.withdrawalRequest.aggregate({
    where: {
      userId,
      status: { in: ["PROCESSED", "PENDING"] },
    },
    _sum: { amountInUsdt: true },
  });
  const totalWithdrawn = Number(withdrawalsAgg._sum.amountInUsdt?.toString() ?? user.totalWithdrawn?.toString() ?? "0");

  // Backwards compatibility: If user has incomeBalance and hasn't transferred yet,
  // ensure they can access their available income, but if transfers occurred, respect transferred amount.
  let mainBalance = 0;
  if (totalTransferredToMain > 0) {
    mainBalance = Math.max(0, +(totalTransferredToMain - totalWithdrawn).toFixed(2));
  } else {
    // Legacy fallback to incomeBalance minus locked bonus
    const currentIncome = Number(user.incomeBalance?.toString() ?? "0");
    mainBalance = Math.max(0, +(currentIncome - bonusBalance).toFixed(2));
  }

  // 5. Secondary Wallet (Fund Balance - Deposits & Activations):
  const p2pBalance = Math.max(0, Number(user.fundBalance?.toString() ?? "0"));

  return {
    bonusBalance,
    roiBalance,
    workingBalance,
    p2pBalance,
    secondaryBalance: p2pBalance,
    mainBalance,
    totalWithdrawn,
  };
}

/**
 * Transfers funds from ROI or Working Wallet to Main (Withdrawal) Wallet or Secondary Wallet
 */
export async function executeWalletTransfer({
  userId,
  sourceWallet,
  targetWallet,
  amount,
}: {
  userId: string;
  sourceWallet: "ROI" | "WORKING";
  targetWallet: "MAIN" | "P2P";
  amount: number;
}) {
  const amountDec = new Decimal(amount.toString());
  if (amountDec.lessThanOrEqualTo(0)) {
    throw new Error("Please enter a valid positive transfer amount.");
  }

  const balances = await getUserWalletBalances(userId);
  const availableSource = sourceWallet === "ROI" ? balances.roiBalance : balances.workingBalance;

  if (amountDec.greaterThan(availableSource)) {
    throw new Error(
      `Insufficient ${sourceWallet === "ROI" ? "ROI" : "Working"} Wallet balance ($${availableSource.toFixed(2)} USDT available).`
    );
  }

  const timestamp = Date.now();
  const refKey = `${sourceWallet}_TO_${targetWallet}_${userId}_${timestamp}`;

  if (targetWallet === "P2P") {
    // Move from Income/Source ledger to Fund ledger (Secondary Wallet)
    // 1. Debit from Income with specialized reference key
    await executeLedgerTransaction({
      userId,
      type: "SWIPE_INCOME_TO_FUND",
      wallet: "INCOME",
      amount: amountDec.negated(),
      referenceKey: `${refKey}_DEBIT`,
      description: `Transferred $${amountDec.toFixed(2)} USDT from ${sourceWallet} Wallet to Secondary Wallet`,
    });

    // 2. Credit Fund (Secondary Wallet)
    await executeLedgerTransaction({
      userId,
      type: "SWIPE_INCOME_TO_FUND",
      wallet: "FUND",
      amount: amountDec,
      referenceKey: `${refKey}_CREDIT`,
      description: `Received $${amountDec.toFixed(2)} USDT into Secondary Wallet from ${sourceWallet} Wallet`,
    });
  } else {
    // Move to Main Wallet (Withdrawal Wallet)
    // Creates a tracking ledger record indicating funds are now in Main Wallet
    await executeLedgerTransaction({
      userId,
      type: "SWIPE_INCOME_TO_FUND",
      wallet: "INCOME",
      amount: new Decimal(0), // Zero balance change on aggregate income, but registers the transfer!
      referenceKey: `${refKey}_RECORD`,
      description: `Transferred $${amountDec.toFixed(2)} USDT from ${sourceWallet} Wallet to Main (Withdrawal) Wallet`,
    });

    // Also update ledger tracking so mainCreditsAgg records amount
    await db.ledgerEntry.create({
      data: {
        userId,
        type: "COMMISSION_WITHDRAWAL",
        wallet: "INCOME",
        amount: amountDec.toFixed(8),
        balanceAfter: (balances.mainBalance + amount).toFixed(8),
        referenceKey: `${sourceWallet}_TO_MAIN_${userId}_${timestamp}`,
        description: `Transferred $${amountDec.toFixed(2)} USDT from ${sourceWallet} to Main (Withdrawal) Wallet`,
      },
    });
  }

  return { success: true, transferredAmount: amountDec.toNumber() };
}
