import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDubaiTimeInfo, autoClaimPreviousCycles } from "@/lib/services/roiService";
import { executeLedgerTransaction } from "@/lib/ledger";
import { processLevelIncomeForRoi } from "@/lib/services/levelIncomeService";
import { recordActivity } from "@/lib/auditLogger";
import Decimal from "decimal.js";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const dubaiInfo = getDubaiTimeInfo(now);

    // Calculate Closing Time for today at 23:59:59 GST (Dubai is UTC+4)
    const closingUtcTimestamp =
      Date.UTC(dubaiInfo.year, dubaiInfo.month, dubaiInfo.day, 23, 59, 59) - 4 * 60 * 60 * 1000;

    let targetClosingTimestamp = closingUtcTimestamp;
    if (now.getTime() > closingUtcTimestamp) {
      targetClosingTimestamp = closingUtcTimestamp + 24 * 60 * 60 * 1000;
    }

    // Find the member's most recent active contract (or last completed)
    const contract = await db.investmentContract.findFirst({
      where: {
        userId: session.userId,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!contract) {
      return NextResponse.json({
        hasActiveContract: false,
        closingTimestamp: targetClosingTimestamp,
        closingGstFormatted: "23:59:59 GST",
        currentGstFormatted: dubaiInfo.currentDubaiFormatted,
        rows: [],
      });
    }

    const principalUsdt = Number(contract.amountInUsdt || contract.amountInInr || 0);
    const poolBalance = +(principalUsdt * 2.0).toFixed(4); // 2X pool allocation
    const roiRate = Number(contract.dailyRoiRate || 4.0); // e.g. 4% on capital = 2% on 2X pool
    const dailyRoiAmount = +(principalUsdt * (roiRate / 100)).toFixed(4);

    // Determine how many days have elapsed since contract activation in Dubai days
    const contractCreatedDubai = getDubaiTimeInfo(contract.createdAt);
    const msSinceStart = Math.max(0, dubaiInfo.startOfDayMs - contractCreatedDubai.startOfDayMs);
    const isLaunchDateContract = contractCreatedDubai.dateStr <= "2026-09-21";
    const calendarDaysElapsed = isLaunchDateContract
      ? Math.floor(msSinceStart / (24 * 60 * 60 * 1000)) + 1
      : Math.floor(msSinceStart / (24 * 60 * 60 * 1000));

    // Calculate total unlocked cycles (from admin manual closing or calendar elapsed days)
    const contractDaysUnlocked = (contract as any).daysUnlocked ?? 0;
    const totalUnlockedDays = Math.min(
      contract.tenureDays,
      Math.max(contractDaysUnlocked, contract.daysPaid, calendarDaysElapsed)
    );

    // Auto-claim previous cycles rule:
    // If next cycle has arrived (totalUnlockedDays) and user has not claimed or reinvested
    // previous cycles (daysPaid < totalUnlockedDays - 1), auto-claim all prior unclaimed cycles
    // directly into ROI Wallet so only the single current cycle remains pending!
    if (contract.status === "ACTIVE" && totalUnlockedDays > contract.daysPaid + 1) {
      const autoRes = await autoClaimPreviousCycles(contract.id, totalUnlockedDays - 1);
      if (autoRes?.contract) {
        contract.daysPaid = autoRes.contract.daysPaid;
        contract.totalEarned = autoRes.contract.totalEarned;
        contract.status = autoRes.contract.status;
      }
    }

    // Query ledger entries for this contract's daily ROI (after auto-claiming previous cycles)
    const roiLedgers = await db.ledgerEntry.findMany({
      where: {
        userId: session.userId,
        OR: [
          { referenceKey: { startsWith: `ROI_${contract.id}_` } },
          { referenceKey: { startsWith: `ROI_CLAIM_${contract.id}_` } },
          { referenceKey: { startsWith: `ROI_REINVEST_${contract.id}_` } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    // Activation Day Rule: New contracts have zero ROI on investment day (Day 0) if not manually closed
    const isActivationDay = calendarDaysElapsed === 0 && totalUnlockedDays === 0;

    // If it's activation day, countdown is to 00:00:00 GST tomorrow (Day 1 start)
    if (isActivationDay) {
      targetClosingTimestamp = dubaiInfo.endOfDayMs;
    }

    const completedDaysCount = contract.daysPaid;
    const max2xCap = +(principalUsdt * 2.0).toFixed(4); // Strict 2X maximum allowable payout

    // Build the Day-by-Day Ledger Rows:
    // 1. Completed Days (Claimed or Reinvested by member)
    // 2. Pending Days (Unlocked upon closing, waiting for user to click Claim/Withdraw or Reinvest)
    // 3. Upcoming Days (Scheduled future days)
    const rows: Array<{
      day: number;
      balance: number;
      roi: number;
      action: "REINVESTED" | "CLAIMED" | "PENDING_ACTION" | "UPCOMING";
      after: number;
      cumPayout: number;
      date: string;
      isToday: boolean;
      canAction: boolean;
    }> = [];

    let currentBalance = poolBalance;
    let runningCumPayout = 0;

    // 1. Process all completed days (Day 1 to completedDaysCount)
    for (let dayNum = 1; dayNum <= completedDaysCount; dayNum++) {
      const dayLedger = roiLedgers[dayNum - 1];
      const isReinvested = dayLedger?.referenceKey?.includes("REINVEST");
      const roiAmount =
        dayLedger && Number(dayLedger.amount) > 0
          ? Math.abs(Number(dayLedger.amount))
          : dailyRoiAmount;

      let afterBalance = currentBalance;
      if (isReinvested) {
        afterBalance = +(currentBalance + roiAmount).toFixed(4);
      } else {
        runningCumPayout = +(runningCumPayout + roiAmount).toFixed(4);
        afterBalance = +(currentBalance - roiAmount).toFixed(4);
      }

      rows.push({
        day: dayNum,
        balance: currentBalance,
        roi: roiAmount,
        action: isReinvested ? "REINVESTED" : "CLAIMED",
        after: afterBalance,
        cumPayout: runningCumPayout,
        date: dayLedger?.createdAt
          ? new Date(dayLedger.createdAt).toISOString().split("T")[0]
          : `Day ${dayNum}`,
        isToday: false,
        canAction: false,
      });

      currentBalance = afterBalance;
    }

    // 2. Process all unlocked UNCLAIMED days (Day completedDaysCount + 1 to totalUnlockedDays)
    if (totalUnlockedDays > completedDaysCount) {
      for (let dayNum = completedDaysCount + 1; dayNum <= totalUnlockedDays; dayNum++) {
        const remainingTo2X = Math.max(0, +(max2xCap - runningCumPayout).toFixed(4));
        if (remainingTo2X <= 0) break;

        let activeRoi = dailyRoiAmount;
        if (activeRoi > remainingTo2X) {
          activeRoi = remainingTo2X;
        }

        const afterBalance = Math.max(0, +(currentBalance - activeRoi).toFixed(4));
        const projectedCum = +(runningCumPayout + activeRoi).toFixed(4);

        rows.push({
          day: dayNum,
          balance: currentBalance,
          roi: activeRoi,
          action: "PENDING_ACTION",
          after: afterBalance,
          cumPayout: projectedCum,
          date: `Day ${dayNum} (Ready to Claim)`,
          isToday: dayNum === completedDaysCount + 1,
          canAction: true,
        });

        currentBalance = afterBalance;
        runningCumPayout = projectedCum;
      }
    }

    const isMatured =
      contract.daysPaid >= contract.tenureDays ||
      contract.status === "COMPLETED" ||
      runningCumPayout >= max2xCap;

    // 3. Process Upcoming Days
    if (!isMatured) {
      const startUpcomingDay = Math.max(totalUnlockedDays, completedDaysCount) + 1;
      const remainingTo2X = Math.max(0, +(max2xCap - runningCumPayout).toFixed(4));

      if (startUpcomingDay <= contract.tenureDays && remainingTo2X > 0) {
        const up1Roi = Math.min(dailyRoiAmount, remainingTo2X);
        const up1After = Math.max(0, +(currentBalance - up1Roi).toFixed(4));
        const up1Cum = +(runningCumPayout + up1Roi).toFixed(4);

        rows.push({
          day: startUpcomingDay,
          balance: currentBalance,
          roi: up1Roi,
          action: "UPCOMING",
          after: up1After,
          cumPayout: up1Cum,
          date: isActivationDay ? "Starts Tomorrow (00:00 GST)" : "Upcoming (00:00 GST)",
          isToday: false,
          canAction: false,
        });

        currentBalance = up1After;
        runningCumPayout = up1Cum;

        const nextUpcomingDay = startUpcomingDay + 1;
        const remForUp2 = Math.max(0, +(max2xCap - runningCumPayout).toFixed(4));
        if (nextUpcomingDay <= contract.tenureDays && remForUp2 > 0) {
          const up2Roi = Math.min(dailyRoiAmount, remForUp2);
          const up2After = Math.max(0, +(currentBalance - up2Roi).toFixed(4));
          const up2Cum = +(runningCumPayout + up2Roi).toFixed(4);

          rows.push({
            day: nextUpcomingDay,
            balance: currentBalance,
            roi: up2Roi,
            action: "UPCOMING",
            after: up2After,
            cumPayout: up2Cum,
            date: "Upcoming (00:00 GST)",
            isToday: false,
            canAction: false,
          });
        }
      }
    }

    const pendingDaysCount = Math.max(0, totalUnlockedDays - completedDaysCount);

    return NextResponse.json({
      hasActiveContract: true,
      contractId: contract.id,
      principalUsdt,
      poolBalance,
      roiRate,
      dailyRoiAmount,
      tenureDays: contract.tenureDays,
      daysPaid: contract.daysPaid,
      daysUnlocked: totalUnlockedDays,
      pendingDaysCount,
      closingTimestamp: targetClosingTimestamp,
      closingGstFormatted: isActivationDay ? "Tomorrow 00:00 GST" : "23:59:59 GST",
      currentGstFormatted: dubaiInfo.currentDubaiFormatted,
      isActivationDay,
      calendarDaysElapsed,
      rows,
    });
  } catch (error: any) {
    console.error("Error fetching daily ledger:", error);
    return NextResponse.json({ error: error.message || "Failed to load daily ledger" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contractId, action } = await req.json();

    if (!contractId || !action || (action !== "REINVEST" && action !== "CLAIM" && action !== "CLAIM_ALL")) {
      return NextResponse.json(
        { error: "Valid contract ID and action (CLAIM, REINVEST, or CLAIM_ALL) are required." },
        { status: 400 }
      );
    }

    const now = new Date();
    const dubaiInfo = getDubaiTimeInfo(now);

    const contract = await db.investmentContract.findFirst({
      where: {
        id: contractId,
        userId: session.userId,
        status: "ACTIVE",
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Active contract not found." }, { status: 404 });
    }

    if (contract.daysPaid >= contract.tenureDays) {
      return NextResponse.json({ error: "Contract has already completed full tenure." }, { status: 400 });
    }

    // Calculate calendar days elapsed since contract activation in Dubai days
    const contractCreatedDubai = getDubaiTimeInfo(contract.createdAt);
    const msSinceStart = Math.max(0, dubaiInfo.startOfDayMs - contractCreatedDubai.startOfDayMs);
    const isLaunchDateContract = contractCreatedDubai.dateStr <= "2026-09-21";
    const calendarDaysElapsed = isLaunchDateContract
      ? Math.floor(msSinceStart / (24 * 60 * 60 * 1000)) + 1
      : Math.floor(msSinceStart / (24 * 60 * 60 * 1000));

    // Calculate total unlocked days
    const contractDaysUnlocked = (contract as any).daysUnlocked ?? 0;
    const totalUnlockedDays = Math.min(
      contract.tenureDays,
      Math.max(contractDaysUnlocked, contract.daysPaid, calendarDaysElapsed)
    );

    if (contract.daysPaid >= totalUnlockedDays) {
      return NextResponse.json(
        { error: "No pending unlocked cycles to claim or reinvest. Next yield cycle begins at 00:00 GST." },
        { status: 400 }
      );
    }

    const amountUsdtDec = new Decimal(contract.amountInUsdt.toString());
    const rateDec = new Decimal(contract.dailyRoiRate.toString());
    const standardDailyRoiUsdt = amountUsdtDec.times(rateDec.dividedBy(100));

    // Strict 2X Cap check:
    const initialStakeDec = amountUsdtDec;
    const max2xCapDec = initialStakeDec.times(2.0);
    const earnedSoFarDec = new Decimal(contract.totalEarned.toString());
    const remainingTo2XDec = max2xCapDec.minus(earnedSoFarDec);

    if (remainingTo2XDec.lessThanOrEqualTo(0)) {
      await db.investmentContract.update({
        where: { id: contract.id },
        data: { status: "COMPLETED" },
      });
      return NextResponse.json(
        { error: "Contract has already achieved its exact 2X maximum return cap." },
        { status: 400 }
      );
    }

    // CLAIM_ALL action: Claim all pending cycles at once
    if (action === "CLAIM_ALL") {
      const cyclesToClaim = totalUnlockedDays - contract.daysPaid;
      let totalClaimed = new Decimal(0);
      let currentEarned = earnedSoFarDec;
      let currentDaysPaid = contract.daysPaid;

      for (let i = 0; i < cyclesToClaim; i++) {
        const rem = max2xCapDec.minus(currentEarned);
        if (rem.lessThanOrEqualTo(0)) break;

        let cycleRoi = standardDailyRoiUsdt;
        if (cycleRoi.greaterThan(rem)) {
          cycleRoi = rem;
        }

        const targetDay = currentDaysPaid + 1;
        const claimRefKey = `ROI_CLAIM_${contract.id}_Day${targetDay}_${dubaiInfo.dateStr}`;

        const ledgerRes = await executeLedgerTransaction({
          userId: session.userId,
          type: "BASIC_ROI",
          wallet: "INCOME",
          amount: cycleRoi,
          referenceKey: claimRefKey,
          description: `Member Claimed Daily ROI (${rateDec}%) on Contract ${contract.id} (Day ${targetDay}/${contract.tenureDays})`,
        });

        if (ledgerRes.success) {
          totalClaimed = totalClaimed.plus(cycleRoi);
          currentEarned = currentEarned.plus(cycleRoi);
          currentDaysPaid = targetDay;

          // Distribute 10-level royalties for this claimed daily ROI
          try {
            await processLevelIncomeForRoi(
              session.userId,
              contract.id,
              contract.packageType,
              cycleRoi,
              `${dubaiInfo.dateStr}_D${targetDay}`
            );
          } catch (levelErr) {
            console.error("Level income distribution error on claim:", levelErr);
          }
        }
      }

      const isMatured = currentDaysPaid >= contract.tenureDays || currentEarned.greaterThanOrEqualTo(max2xCapDec);
      await db.investmentContract.update({
        where: { id: contract.id },
        data: {
          daysPaid: currentDaysPaid,
          totalEarned: currentEarned.toFixed(8),
          lastRoiAt: now,
          status: isMatured ? "COMPLETED" : "ACTIVE",
        },
      });

      await recordActivity({
        userId: session.userId,
        action: "ROI_CLAIMED_ALL",
        category: "FINANCIAL",
        description: `Claimed all ${cyclesToClaim} pending cycles ($${totalClaimed.toFixed(4)} USDT) into ROI Wallet`,
        req,
      });

      return NextResponse.json({
        success: true,
        action: "CLAIM_ALL",
        message: `Successfully claimed $${totalClaimed.toFixed(2)} USDT across ${cyclesToClaim} cycles into your ROI Wallet!`,
        claimedAmount: totalClaimed.toNumber(),
        daysPaid: currentDaysPaid,
      });
    }

    // Exact single cycle claim/reinvest: targetDay is next pending day
    const nextDaysPaid = contract.daysPaid + 1;
    let dailyRoiUsdt = standardDailyRoiUsdt;
    let isFinalCapped2x = false;
    if (dailyRoiUsdt.greaterThan(remainingTo2XDec)) {
      dailyRoiUsdt = remainingTo2XDec;
      isFinalCapped2x = true;
    }

    const claimRefKey = `ROI_CLAIM_${contract.id}_Day${nextDaysPaid}_${dubaiInfo.dateStr}`;
    const reinvestRefKey = `ROI_REINVEST_${contract.id}_Day${nextDaysPaid}_${dubaiInfo.dateStr}`;

    if (action === "CLAIM") {
      // 1. Credit ROI directly to member's Available / ROI Wallet
      const ledgerRes = await executeLedgerTransaction({
        userId: session.userId,
        type: "BASIC_ROI",
        wallet: "INCOME",
        amount: dailyRoiUsdt,
        referenceKey: claimRefKey,
        description: isFinalCapped2x
          ? `Member Claimed Final 2X Capped Daily ROI on Contract ${contract.id} (Exact $${dailyRoiUsdt.toFixed(4)} USDT to complete 2X)`
          : `Member Claimed Daily ROI (${rateDec}%) on Contract ${contract.id} (Day ${nextDaysPaid}/${contract.tenureDays})`,
      });

      if (!ledgerRes.success) {
        return NextResponse.json({ error: "Failed to claim today's ROI into your wallet." }, { status: 500 });
      }

      const newEarned = earnedSoFarDec.plus(dailyRoiUsdt);
      const isMatured = isFinalCapped2x || nextDaysPaid >= contract.tenureDays || newEarned.greaterThanOrEqualTo(max2xCapDec);

      // Update contract progress
      await db.investmentContract.update({
        where: { id: contract.id },
        data: {
          daysPaid: nextDaysPaid,
          totalEarned: newEarned.toFixed(8),
          lastRoiAt: now,
          status: isMatured ? "COMPLETED" : "ACTIVE",
        },
      });

      // 2. Distribute 10-level royalties for this claimed daily ROI
      try {
        await processLevelIncomeForRoi(
          session.userId,
          contract.id,
          contract.packageType,
          dailyRoiUsdt,
          `${dubaiInfo.dateStr}_D${nextDaysPaid}`
        );
      } catch (levelErr) {
        console.error("Level income processing error on manual claim:", levelErr);
      }

      await recordActivity({
        userId: session.userId,
        action: "ROI_CLAIMED",
        category: "FINANCIAL",
        description: `Claimed $${dailyRoiUsdt.toFixed(4)} USDT Daily ROI into ROI Wallet (Day ${nextDaysPaid})`,
        req,
      });

      return NextResponse.json({
        success: true,
        action: "CLAIM",
        message: `Successfully claimed $${dailyRoiUsdt.toFixed(2)} USDT into your ROI Wallet!`,
        claimedAmount: dailyRoiUsdt.toNumber(),
        daysPaid: nextDaysPaid,
      });
    } else {
      // action === "REINVEST"
      const newPrincipal = amountUsdtDec.plus(dailyRoiUsdt);
      const newEarned = earnedSoFarDec.plus(dailyRoiUsdt);
      const isMatured = isFinalCapped2x || nextDaysPaid >= contract.tenureDays;

      // Create tracking ledger entry for reinvestment
      await db.ledgerEntry.create({
        data: {
          userId: session.userId,
          type: "PACKAGE_PURCHASE",
          wallet: "INCOME",
          amount: dailyRoiUsdt.toFixed(8),
          balanceAfter: new Decimal(0),
          referenceKey: reinvestRefKey,
          description: isFinalCapped2x
            ? `Reinvested Final 2X Capped $${dailyRoiUsdt.toFixed(4)} USDT into Contract ${contract.id} (Day ${nextDaysPaid})`
            : `Reinvested & Compounded $${dailyRoiUsdt.toFixed(4)} USDT into Contract ${contract.id} (Day ${nextDaysPaid})`,
        },
      });

      await db.investmentContract.update({
        where: { id: contract.id },
        data: {
          amountInUsdt: newPrincipal.toFixed(8),
          amountInInr: newPrincipal.toFixed(2),
          daysPaid: nextDaysPaid,
          totalEarned: newEarned.toFixed(8),
          lastRoiAt: now,
          status: isMatured ? "COMPLETED" : "ACTIVE",
        },
      });

      await recordActivity({
        userId: session.userId,
        action: "ROI_REINVESTED",
        category: "FINANCIAL",
        description: `Reinvested $${dailyRoiUsdt.toFixed(4)} USDT daily yield into active stake pool (New Stake: $${newPrincipal.toFixed(2)} USDT)`,
        req,
      });

      return NextResponse.json({
        success: true,
        action: "REINVEST",
        message: `Successfully reinvested $${dailyRoiUsdt.toFixed(2)} USDT into your stake pool! (New Principal: $${newPrincipal.toFixed(2)} USDT)`,
        reinvestedAmount: dailyRoiUsdt.toNumber(),
        newPrincipal: newPrincipal.toNumber(),
        daysPaid: nextDaysPaid,
      });
    }
  } catch (error: any) {
    console.error("Error executing daily ledger action:", error);
    return NextResponse.json({ error: error.message || "Failed to process action" }, { status: 500 });
  }
}
