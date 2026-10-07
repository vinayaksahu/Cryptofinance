import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ROOT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin access required." }, { status: 403 });
    }

    const [
      totalAdmins,
      totalUsers,
      activeUsers,
      totalContracts,
      activeContracts,
      pendingDepositsCount,
      pendingWithdrawalsCount,
      depositsAgg,
      withdrawalsAgg,
      contractsAgg,
      ledgerIncomeAgg,
    ] = await Promise.all([
      db.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, NOT: { role: "SUPER_ROOT_ADMIN" } } }),
      db.user.count({ where: { role: "USER" } }),
      db.user.count({ where: { role: "USER", status: "ACTIVE" } }),
      db.investmentContract.count(),
      db.investmentContract.count({ where: { status: "ACTIVE" } }),
      db.depositRequest.count({ where: { status: "PENDING" } }),
      db.withdrawalRequest.count({ where: { status: "PENDING" } }),
      db.depositRequest.aggregate({
        where: { status: "APPROVED" },
        _sum: { amountInUsdt: true },
      }),
      db.withdrawalRequest.aggregate({
        where: { status: "PROCESSED" },
        _sum: { amountInUsdt: true, feeAmount: true },
      }),
      db.investmentContract.aggregate({
        _sum: { amountInUsdt: true },
      }),
      db.ledgerEntry.groupBy({
        by: ["type"],
        where: {
          type: { in: ["BASIC_ROI", "FD_ROI", "DIRECT_REFERRAL", "BASIC_LEVEL_INCOME", "FD_LEVEL_INCOME"] },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalApprovedDepositsUsdt = Number(depositsAgg._sum.amountInUsdt || 0);
    const totalProcessedWithdrawalsUsdt = Number(withdrawalsAgg._sum.amountInUsdt || 0);
    const totalAdminFeeUsdt = Number(withdrawalsAgg._sum.feeAmount || 0);
    const totalBusinessVolumeUsdt = Number(contractsAgg._sum.amountInUsdt || 0);

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

    return NextResponse.json({
      stats: {
        totalAdmins,
        totalUsers,
        activeUsers,
        totalContracts,
        activeContracts,
        pendingDepositsCount,
        pendingWithdrawalsCount,
        totalApprovedDepositsUsdt,
        totalProcessedWithdrawalsUsdt,
        totalAdminFeeUsdt,
        totalBusinessVolumeUsdt,
        totalRoiIncomeDistributed,
        totalDirectReferralIncome,
        totalLevelIncomeDistributed,
        totalMemberIncomeDistributedUsdt: totalRoiIncomeDistributed + totalDirectReferralIncome + totalLevelIncomeDistributed,
      },
    });
  } catch (error: any) {
    console.error("[SuperAdmin Stats Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch superadmin stats" }, { status: 500 });
  }
}
