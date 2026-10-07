import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUpcomingCycleForecast } from "@/lib/services/roiService";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  const adminId = session.userId;
  const userFilter = { adminId, role: "USER" as const };
  const userRelationFilter = {
    OR: [
      { user: { adminId } },
      { userId: adminId },
    ],
  };

  const [
    totalUsers,
    activeUsers,
    pendingDeposits,
    pendingWithdrawals,
    activeContracts,
    totalContracts,
    contractsAgg,
    activeContractsAgg,
    ledgerIncomeAgg,
  ] = await Promise.all([
    db.user.count({ where: userFilter }),
    db.user.count({ where: { ...userFilter, status: "ACTIVE" } }),
    db.depositRequest.count({ where: { status: "PENDING", ...userRelationFilter } }),
    db.withdrawalRequest.count({ where: { status: "PENDING", ...userRelationFilter } }),
    db.investmentContract.count({ where: { status: "ACTIVE", ...userRelationFilter } }),
    db.investmentContract.count({ where: userRelationFilter }),
    db.investmentContract.aggregate({
      where: userRelationFilter,
      _sum: { amountInUsdt: true, totalEarned: true },
    }),
    db.investmentContract.aggregate({
      where: { status: "ACTIVE", ...userRelationFilter },
      _sum: { amountInUsdt: true },
    }),
    db.ledgerEntry.groupBy({
      by: ["type"],
      where: {
        type: { in: ["BASIC_ROI", "FD_ROI", "DIRECT_REFERRAL", "BASIC_LEVEL_INCOME", "FD_LEVEL_INCOME", "SIGNUP_BONUS"] },
        user: { adminId },
      },
      _sum: { amount: true },
    }),
  ]);

  const depositsAgg = await db.depositRequest.aggregate({
    where: { status: "APPROVED", ...userRelationFilter },
    _sum: { amountInUsdt: true },
  });

  const totalDepositsCount = await db.depositRequest.count({
    where: { status: "APPROVED", ...userRelationFilter },
  });

  const totalWithdrawalsCount = await db.withdrawalRequest.count({
    where: { status: "PROCESSED", ...userRelationFilter },
  });

  // Calculate detailed withdrawal stats including 10% admin fee income
  const allWithdrawals = await db.withdrawalRequest.findMany({
    where: { status: { in: ["PROCESSED", "PENDING"] }, ...userRelationFilter },
    select: {
      status: true,
      amountInUsdt: true,
      feePercent: true,
      feeAmount: true,
      netAmount: true,
    },
  });

  let totalGrossWithdrawalsUsdt = 0;
  let adminFeeIncomeUsdt = 0; // Processed 10% fee income
  let totalNetDispatchedUsdt = 0; // Processed net payouts
  let pendingGrossWithdrawalsUsdt = 0;
  let pendingAdminFeeUsdt = 0;
  let pendingNetPayoutsUsdt = 0;

  for (const w of allWithdrawals) {
    const gross = Number(w.amountInUsdt);
    const feeP = w.feePercent != null ? Number(w.feePercent) : 10;
    const feeA = w.feeAmount != null && Number(w.feeAmount) > 0 ? Number(w.feeAmount) : (gross * (feeP / 100));
    const netA = w.netAmount != null && Number(w.netAmount) > 0 ? Number(w.netAmount) : (gross - feeA);

    if (w.status === "PROCESSED") {
      totalGrossWithdrawalsUsdt += gross;
      adminFeeIncomeUsdt += feeA;
      totalNetDispatchedUsdt += netA;
    } else if (w.status === "PENDING") {
      pendingGrossWithdrawalsUsdt += gross;
      pendingAdminFeeUsdt += feeA;
      pendingNetPayoutsUsdt += netA;
    }
  }

  // Calculate breakdown of incomes distributed to members
  let totalRoiIncomeDistributed = 0;
  let totalDirectReferralIncome = 0;
  let totalLevelIncomeDistributed = 0;

  for (const g of ledgerIncomeAgg) {
    const val = Math.abs(Number(g._sum.amount || 0));
    if (g.type === "BASIC_ROI" || g.type === "FD_ROI") {
      totalRoiIncomeDistributed += val;
    } else if (g.type === "DIRECT_REFERRAL") {
      totalDirectReferralIncome += val;
    } else if (g.type === "BASIC_LEVEL_INCOME" || g.type === "FD_LEVEL_INCOME") {
      totalLevelIncomeDistributed += val;
    }
  }

  const totalBusinessVolumeUsdt = Number(contractsAgg._sum.amountInUsdt || 0);
  const activeStakesVolumeUsdt = Number(activeContractsAgg._sum.amountInUsdt || 0);
  const totalMemberIncomeDistributedUsdt = totalRoiIncomeDistributed + totalDirectReferralIncome + totalLevelIncomeDistributed;

  // Fetch upcoming cycle forecast for next 12:01 AM Dubai cycle scoped to this admin's team
  let upcomingCycle = null;
  try {
    upcomingCycle = await getUpcomingCycleForecast(adminId);
  } catch (err) {
    console.error("Failed to compute upcoming cycle forecast:", err);
  }

  return NextResponse.json({
    stats: {
      totalUsers,
      activeUsers,
      pendingDeposits,
      pendingWithdrawals,
      activeContracts,
      totalContracts,
      // Deposits
      totalApprovedDepositsUsdt: Number(depositsAgg._sum.amountInUsdt || 0),
      totalDepositsCount,
      // Withdrawals
      totalProcessedWithdrawalsUsdt: totalGrossWithdrawalsUsdt,
      totalWithdrawalsCount,
      totalNetDispatchedUsdt,
      pendingGrossWithdrawalsUsdt,
      pendingNetPayoutsUsdt,
      // Admin Income / Revenue from 10% fee
      adminFeeIncomeUsdt,
      pendingAdminFeeUsdt,
      // Business Turnovers & Staking Volumes
      totalBusinessVolumeUsdt,
      activeStakesVolumeUsdt,
      // Member Income Distributions
      totalMemberIncomeDistributedUsdt,
      totalRoiIncomeDistributed,
      totalDirectReferralIncome,
      totalLevelIncomeDistributed,
      // Next upcoming Dubai 12:01 AM cycle forecast
      upcomingCycle,
    },
  });
}