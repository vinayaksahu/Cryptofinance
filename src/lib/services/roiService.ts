import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import { processLevelIncomeForRoi } from "./levelIncomeService";
import { getSystemConfigValue } from "../configService";
import Decimal from "decimal.js";

/**
 * Returns accurate Dubai Time (GST = UTC+4) information and next cycle schedule (12:01 AM GST)
 */
export function getDubaiTimeInfo(date: Date = new Date()) {
  const gstMs = date.getTime() + 4 * 60 * 60 * 1000; // Shift UTC to GST (+4h)
  const gstDate = new Date(gstMs);

  const year = gstDate.getUTCFullYear();
  const month = gstDate.getUTCMonth();
  const day = gstDate.getUTCDate();
  const hours = gstDate.getUTCHours();
  const minutes = gstDate.getUTCMinutes();
  const seconds = gstDate.getUTCSeconds();

  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  // Exact UTC timestamp when 00:00:00 GST started on this Dubai calendar day
  const startOfDayMs = Date.UTC(year, month, day, 0, 0, 0) - 4 * 60 * 60 * 1000;
  const endOfDayMs = startOfDayMs + 24 * 60 * 60 * 1000;

  // Next cycle is at 12:01 AM GST
  // If current Dubai time is 00:00, next cycle is at 00:01 today.
  // If current Dubai time is past 00:01, next cycle is at 00:01 tomorrow.
  let nextCycleGstDate: Date;
  if (hours === 0 && minutes < 1) {
    nextCycleGstDate = new Date(Date.UTC(year, month, day, 0, 1, 0));
  } else {
    nextCycleGstDate = new Date(Date.UTC(year, month, day + 1, 0, 1, 0));
  }

  // Convert GST timestamp back to real UTC timestamp (-4h)
  const nextCycleUtcTimestamp = nextCycleGstDate.getTime() - 4 * 60 * 60 * 1000;
  const nextCycleUtc = new Date(nextCycleUtcTimestamp);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDubaiFormatted = `${day} ${monthNames[month]} ${year}, ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} GST`;
  const nextCycleDubaiFormatted = `${nextCycleGstDate.getUTCDate()} ${monthNames[nextCycleGstDate.getUTCMonth()]} ${nextCycleGstDate.getUTCFullYear()}, 12:01 AM GST`;

  // IST = UTC + 5:30 (GST + 1h 30m)
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const currentIstFormatted = `${istDate.getUTCDate()} ${monthNames[istDate.getUTCMonth()]} ${istDate.getUTCFullYear()}, ${String(istDate.getUTCHours()).padStart(2, "0")}:${String(istDate.getUTCMinutes()).padStart(2, "0")} IST`;
  const nextCycleIstFormatted = "01:31 AM IST";

  // UTC = UTC + 0
  const utcDate = new Date(date.getTime());
  const currentUtcFormatted = `${utcDate.getUTCDate()} ${monthNames[utcDate.getUTCMonth()]} ${utcDate.getUTCFullYear()}, ${String(utcDate.getUTCHours()).padStart(2, "0")}:${String(utcDate.getUTCMinutes()).padStart(2, "0")} UTC`;
  const nextCycleUtcFormatted = "08:01 PM UTC";

  return {
    dateStr,
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    startOfDayMs,
    endOfDayMs,
    currentDubaiFormatted,
    currentIstFormatted,
    currentUtcFormatted,
    nextCycleUtc,
    nextCycleUtcTimestamp,
    nextCycleDubaiFormatted,
    nextCycleIstFormatted,
    nextCycleUtcFormatted,
  };
}

/**
 * Distributes daily ROI for all eligible active contracts based on Dubai midnight cycle (12:01 AM GST).
 * New contracts activated today do NOT receive Day 1 ROI immediately; Day 1 is credited at the first 12:01 AM cycle.
 */
export async function executeDailyRoiDistribution(adminId?: string, forceManual: boolean = false) {
  const now = new Date();
  const nowInfo = getDubaiTimeInfo(now);

  const whereClause: any = { status: "ACTIVE" };
  if (adminId) {
    whereClause.user = {
      OR: [{ adminId }, { id: adminId }],
    };
  }

  // Find active investment contracts
  const activeContracts = await db.investmentContract.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, customId: true, status: true, adminId: true } },
    },
  });

  let processedCount = 0;
  let totalDistributedUsdt = new Decimal(0);

  for (const contract of activeContracts) {
    if (contract.daysPaid >= contract.tenureDays) {
      await db.investmentContract.update({
        where: { id: contract.id },
        data: { status: "COMPLETED" },
      });
      continue;
    }

    // Dubai calendar day calculation:
    // 1. Launch Date Contracts (<= 2026-09-21): Started Day 1 on launch day.
    // 2. New Contracts (>= 2026-09-22): Zero ROI on activation day.
    //    Day 1 ROI unlocks only AFTER activation day closes at 12:00 AM GST (next day).
    const createdInfo = getDubaiTimeInfo(new Date(contract.createdAt));
    const msDiff = Math.max(0, nowInfo.startOfDayMs - createdInfo.startOfDayMs);
    const isLaunchDateContract = createdInfo.dateStr <= "2026-09-21";
    const calendarDaysElapsed = isLaunchDateContract
      ? Math.floor(msDiff / (1000 * 60 * 60 * 24)) + 1
      : Math.floor(msDiff / (1000 * 60 * 60 * 24));

    // Calculate how many cycles to unlock for this contract
    const currentUnlocked = (contract as any).daysUnlocked ?? 0;
    let newDaysUnlocked = currentUnlocked;

    if (forceManual) {
      newDaysUnlocked = Math.min(contract.tenureDays, Math.max(currentUnlocked, contract.daysPaid) + 1);
    } else {
      const eligibleDaysTotal = Math.min(calendarDaysElapsed, contract.tenureDays);
      newDaysUnlocked = Math.min(contract.tenureDays, Math.max(currentUnlocked, eligibleDaysTotal));
    }

    // Auto-claim rule:
    // If next cycle arrives (closing executed), all previous cycles that user did not claim/reinvest
    // are automatically claimed into ROI Wallet!
    if (contract.daysPaid < newDaysUnlocked - 1) {
      await autoClaimPreviousCycles(contract.id, newDaysUnlocked - 1);
    }

    if (newDaysUnlocked > currentUnlocked) {
      const additionalCycles = newDaysUnlocked - currentUnlocked;
      const amountUsdtDec = new Decimal(contract.amountInUsdt.toString());
      const rateDec = new Decimal(contract.dailyRoiRate.toString());
      const standardDailyRoiUsdt = amountUsdtDec.times(rateDec.dividedBy(100));
      const unlockedRoiAmount = standardDailyRoiUsdt.times(additionalCycles);

      await db.investmentContract.update({
        where: { id: contract.id },
        data: {
          daysUnlocked: newDaysUnlocked,
          lastRoiAt: now,
        },
      });

      processedCount++;
      totalDistributedUsdt = totalDistributedUsdt.plus(unlockedRoiAmount);
    }
  }

  return {
    date: nowInfo.dateStr,
    dubaiTime: nowInfo.currentDubaiFormatted,
    totalContracts: activeContracts.length,
    processedCount,
    totalDistributedUsdt: totalDistributedUsdt.toFixed(8),
  };
}

/**
 * Auto-claims all previous cycles for a contract that were left unclaimed
 * when a new cycle arrives. Only the single latest cycle remains pending for user choice.
 */
export async function autoClaimPreviousCycles(
  contractId: string,
  targetUpToDay: number
) {
  const contract = await db.investmentContract.findUnique({
    where: { id: contractId },
  });
  if (!contract || contract.status !== "ACTIVE") return null;

  const dubInfo = getDubaiTimeInfo(new Date());
  const amountUsdtDec = new Decimal(contract.amountInUsdt.toString());
  const rateDec = new Decimal(contract.dailyRoiRate.toString());
  const standardDailyRoiUsdt = amountUsdtDec.times(rateDec.dividedBy(100));
  const max2xCapDec = amountUsdtDec.times(2.0);

  let currentDaysPaid = contract.daysPaid;
  let currentEarned = new Decimal(contract.totalEarned.toString());
  let totalAutoClaimed = new Decimal(0);

  while (currentDaysPaid < targetUpToDay) {
    if (currentDaysPaid >= contract.tenureDays) break;

    const remainingTo2X = max2xCapDec.minus(currentEarned);
    if (remainingTo2X.lessThanOrEqualTo(0)) break;

    let roiToPay = standardDailyRoiUsdt;
    let isCapped = false;
    if (roiToPay.greaterThan(remainingTo2X)) {
      roiToPay = remainingTo2X;
      isCapped = true;
    }

    const nextDayNum = currentDaysPaid + 1;
    const refKey = `ROI_CLAIM_${contract.id}_Day${nextDayNum}_${dubInfo.dateStr}`;

    const ledgerRes = await executeLedgerTransaction({
      userId: contract.userId,
      type: "BASIC_ROI",
      wallet: "INCOME",
      amount: roiToPay,
      referenceKey: refKey,
      description: isCapped
        ? `Auto-Claimed Final 2X Capped Daily ROI on Contract ${contract.id} (Day ${nextDayNum}/${contract.tenureDays})`
        : `Auto-Claimed Daily ROI (${rateDec}%) on Contract ${contract.id} (Day ${nextDayNum}/${contract.tenureDays})`,
    });

    if (ledgerRes.success || ledgerRes.alreadyProcessed) {
      currentDaysPaid = nextDayNum;
      currentEarned = currentEarned.plus(roiToPay);
      totalAutoClaimed = totalAutoClaimed.plus(roiToPay);

      try {
        await processLevelIncomeForRoi(
          contract.userId,
          contract.id,
          contract.packageType,
          roiToPay,
          `${dubInfo.dateStr}_D${nextDayNum}`
        );
      } catch (err) {
        console.error("Level income error during auto-claim:", err);
      }
    } else {
      break;
    }

    if (isCapped || currentEarned.greaterThanOrEqualTo(max2xCapDec)) {
      break;
    }
  }

  const isMatured = currentDaysPaid >= contract.tenureDays || currentEarned.greaterThanOrEqualTo(max2xCapDec);

  const updatedContract = await db.investmentContract.update({
    where: { id: contract.id },
    data: {
      daysPaid: currentDaysPaid,
      totalEarned: currentEarned.toFixed(8),
      status: isMatured ? "COMPLETED" : "ACTIVE",
    },
  });

  return {
    contract: updatedContract,
    daysPaid: currentDaysPaid,
    totalAutoClaimed: totalAutoClaimed.toFixed(4),
  };
}

/**
 * Computes exact upcoming cycle payout forecast for the next 12:01 AM Dubai Time execution.
 */
export async function getUpcomingCycleForecast(adminId?: string) {
  const now = new Date();
  const nowInfo = getDubaiTimeInfo(now);

  const whereClause: any = { status: "ACTIVE" };
  if (adminId) {
    whereClause.user = {
      OR: [{ adminId }, { id: adminId }],
    };
  }

  const activeContracts = await db.investmentContract.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          customId: true,
          fullName: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let projectedBasicRoiUsdt = new Decimal(0);
  let projectedFdRoiUsdt = new Decimal(0);
  let scheduledContractsCount = 0;
  const queuedContracts: any[] = [];

  for (const contract of activeContracts) {
    if (contract.daysPaid >= contract.tenureDays) {
      continue;
    }

    const createdInfo = getDubaiTimeInfo(new Date(contract.createdAt));
    const msDiff = Math.max(0, nowInfo.startOfDayMs - createdInfo.startOfDayMs);
    const isLaunchDateContract = createdInfo.dateStr <= "2026-09-21";
    const currentDaysElapsed = isLaunchDateContract
      ? Math.floor(msDiff / (1000 * 60 * 60 * 24)) + 1
      : Math.floor(msDiff / (1000 * 60 * 60 * 24));
    const nextDaysElapsed = currentDaysElapsed + 1;
    const nextEligibleDays = Math.min(nextDaysElapsed, contract.tenureDays);

    if (nextEligibleDays > contract.daysPaid) {
      const amountUsdtDec = new Decimal(contract.amountInUsdt.toString());
      const max2xCapDec = amountUsdtDec.times(2.0);
      const earnedSoFarDec = new Decimal(contract.totalEarned.toString());
      const remainingTo2X = max2xCapDec.minus(earnedSoFarDec);

      if (remainingTo2X.lessThanOrEqualTo(0)) {
        continue;
      }

      const rateDec = new Decimal(contract.dailyRoiRate.toString());
      let dailyRoiUsdt = amountUsdtDec.times(rateDec.dividedBy(100));
      let isFinalCapped2x = false;
      if (dailyRoiUsdt.greaterThan(remainingTo2X)) {
        dailyRoiUsdt = remainingTo2X;
        isFinalCapped2x = true;
      }

      const isBasic = contract.packageType === "BASIC_SAVING";
      if (isBasic) {
        projectedBasicRoiUsdt = projectedBasicRoiUsdt.plus(dailyRoiUsdt);
      } else {
        projectedFdRoiUsdt = projectedFdRoiUsdt.plus(dailyRoiUsdt);
      }

      scheduledContractsCount++;
      const nextCycleNumber = contract.daysPaid + 1;
      const isFirstCycle = contract.daysPaid === 0;
      const isFinalCycle = isFinalCapped2x || nextCycleNumber >= contract.tenureDays;

      queuedContracts.push({
        contractId: contract.id,
        userCustomId: contract.user?.customId || "Unknown",
        userFullName: contract.user?.fullName || "Member",
        packageType: contract.packageType,
        amountInUsdt: Number(contract.amountInUsdt),
        dailyRoiRate: Number(contract.dailyRoiRate),
        upcomingRoiUsdt: Number(dailyRoiUsdt.toFixed(2)),
        daysPaid: contract.daysPaid,
        tenureDays: contract.tenureDays,
        nextCycleNumber,
        isFirstCycle,
        isFinalCycle,
        cycleLabel: isFirstCycle
          ? "Cycle 1 (First Return)"
          : isFinalCycle
          ? `Final Cycle (Day ${contract.tenureDays} - Maturity)`
          : `Day ${nextCycleNumber} / ${contract.tenureDays}`,
        targetWallet: isBasic ? "Income Wallet" : "FD Locked Wallet",
      });
    }
  }

  const totalRoiDec = projectedBasicRoiUsdt.plus(projectedFdRoiUsdt);
  // Level royalties estimated at ~10-15% of daily ROI
  const projectedLevelIncomeUsdt = totalRoiDec.times(0.12);
  const totalProjectedPayoutUsdt = totalRoiDec.plus(projectedLevelIncomeUsdt);

  let pendingContractsToday = 0;
  for (const contract of activeContracts) {
    if (contract.daysPaid >= contract.tenureDays) continue;
    const createdInfo = getDubaiTimeInfo(new Date(contract.createdAt));
    const msDiff = Math.max(0, nowInfo.startOfDayMs - createdInfo.startOfDayMs);
    const isLaunchDateContract = createdInfo.dateStr <= "2026-09-21";
    const calendarDaysElapsed = isLaunchDateContract
      ? Math.floor(msDiff / (1000 * 60 * 60 * 24)) + 1
      : Math.floor(msDiff / (1000 * 60 * 60 * 24));
    const eligibleDaysTotal = Math.min(calendarDaysElapsed, contract.tenureDays);
    const daysToPay = Math.max(0, eligibleDaysTotal - contract.daysPaid);
    if (daysToPay > 0) {
      pendingContractsToday++;
    }
  }

  // Count ledger ROI transactions credited on today's Dubai date
  const ledgerWhere: any = {
    type: { in: ["BASIC_ROI", "FD_ROI"] },
    referenceKey: { contains: nowInfo.dateStr },
  };
  if (adminId) {
    ledgerWhere.user = { adminId };
  }

  const todayRoiTransactionsCount = await db.ledgerEntry.count({
    where: ledgerWhere,
  });

  const isClosingCompleteToday = pendingContractsToday === 0;
  const closingMode = await getSystemConfigValue("CLOSING_MODE", "AUTO");

  return {
    closingMode,
    activeContractsCount: activeContracts.length,
    currentDubaiTime: nowInfo.currentDubaiFormatted,
    currentIstTime: nowInfo.currentIstFormatted,
    currentUtcTime: nowInfo.currentUtcFormatted,
    nextCycleDubaiTime: nowInfo.nextCycleDubaiFormatted,
    nextCycleIstTime: nowInfo.nextCycleIstFormatted,
    nextCycleUtcTime: nowInfo.nextCycleUtcFormatted,
    nextCycleUtcTimestamp: nowInfo.nextCycleUtcTimestamp,
    totalScheduledContracts: scheduledContractsCount,
    pendingContractsToday,
    isClosingCompleteToday,
    todayRoiTransactionsCount,
    projectedBasicRoiUsdt: Number(projectedBasicRoiUsdt.toFixed(2)),
    projectedFdRoiUsdt: Number(projectedFdRoiUsdt.toFixed(2)),
    projectedTotalRoiUsdt: Number(totalRoiDec.toFixed(2)),
    projectedLevelIncomeUsdt: Number(projectedLevelIncomeUsdt.toFixed(2)),
    projectedTotalPayoutUsdt: Number(totalProjectedPayoutUsdt.toFixed(2)),
    queuedContracts,
  };
}