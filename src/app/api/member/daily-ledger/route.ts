import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDubaiTimeInfo } from "@/lib/services/roiService";
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

    // Query ledger entries for this contract's daily ROI
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

    // Determine how many days have elapsed since contract activation in Dubai days
    const contractCreatedDubai = getDubaiTimeInfo(contract.createdAt);
    const msSinceStart = Math.max(0, dubaiInfo.startOfDayMs - contractCreatedDubai.startOfDayMs);
    const isLaunchDateContract = contractCreatedDubai.dateStr <= "2026-09-21";
    const calendarDaysElapsed = isLaunchDateContract
      ? Math.floor(msSinceStart / (24 * 60 * 60 * 1000)) + 1
      : Math.floor(msSinceStart / (24 * 60 * 60 * 1000));

    // Activation Day Rule: New contracts have zero ROI on investment day (Day 0)
    // Day 1 starts only after activation day closes at 00:00 GST
    const isActivationDay = calendarDaysElapsed === 0;

    // Maximum cycle number that can be claimed or active by today
    const maxEligibleDays = Math.min(calendarDaysElapsed, contract.tenureDays);

    // If it's activation day, countdown is to 00:00:00 GST tomorrow (Day 1 start)
    if (isActivationDay) {
      targetClosingTimestamp = dubaiInfo.endOfDayMs;
    }

    const completedDaysCount = contract.daysPaid;
    const isMatured = contract.daysPaid >= contract.tenureDays || contract.status === "COMPLETED";

    // Find any ledger entry created on today's Dubai date for this contract
    const todayEntry = roiLedgers.find(
      (l) =>
        l.referenceKey.includes(`_${dubaiInfo.dateStr}`) ||
        l.referenceKey.startsWith(`ROI_${contract.id}_${dubaiInfo.dateStr}`) ||
        l.referenceKey.startsWith(`ROI_CLAIM_${contract.id}_${dubaiInfo.dateStr}`) ||
        l.referenceKey.startsWith(`ROI_REINVEST_${contract.id}_${dubaiInfo.dateStr}`)
    );
    const isTodayProcessed = Boolean(todayEntry);

    // Build the Day-by-Day Ledger Rows strictly containing:
    // 1. Completed Days
    // 2. Today's Row (Active / Ready for Action - only if elapsed >= 1)
    // 3. Upcoming Row(s)
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
      const isReinvested = dayLedger?.referenceKey.includes("REINVEST");
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

      // Is this day the one completed today?
      const isThisDayToday = isTodayProcessed && dayNum === completedDaysCount;

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
        isToday: isThisDayToday,
        canAction: false,
      });

      currentBalance = afterBalance;
    }

    // 2. Active / Upcoming Rows
    if (isActivationDay) {
      // Contract was activated TODAY: Day 1 begins tomorrow at 00:00 GST
      const day1Roi = dailyRoiAmount;
      rows.push({
        day: 1,
        balance: currentBalance,
        roi: day1Roi,
        action: "UPCOMING",
        after: +(currentBalance - day1Roi).toFixed(4),
        cumPayout: +(runningCumPayout + day1Roi).toFixed(4),
        date: "Starts Tomorrow (00:00 GST)",
        isToday: false,
        canAction: false,
      });

      if (contract.tenureDays >= 2) {
        const day2Balance = +(currentBalance - day1Roi).toFixed(4);
        rows.push({
          day: 2,
          balance: day2Balance,
          roi: day1Roi,
          action: "UPCOMING",
          after: +(day2Balance - day1Roi).toFixed(4),
          cumPayout: +(runningCumPayout + 2 * day1Roi).toFixed(4),
          date: "Upcoming (00:00 GST)",
          isToday: false,
          canAction: false,
        });
      }
    } else if (!isMatured) {
      // Calendar day >= 1: contract is eligible for active daily cycle
      // If today has NOT been claimed or reinvested yet, and daysPaid < maxEligibleDays:
      if (completedDaysCount < maxEligibleDays && !isTodayProcessed) {
        const activeDayNum = completedDaysCount + 1;
        rows.push({
          day: activeDayNum,
          balance: currentBalance,
          roi: dailyRoiAmount,
          action: "PENDING_ACTION",
          after: +(currentBalance - dailyRoiAmount).toFixed(4),
          cumPayout: +(runningCumPayout + dailyRoiAmount).toFixed(4),
          date: `${dubaiInfo.dateStr} (Today)`,
          isToday: true,
          canAction: true,
        });

        currentBalance = +(currentBalance - dailyRoiAmount).toFixed(4);
        runningCumPayout = +(runningCumPayout + dailyRoiAmount).toFixed(4);
      }

      // Next scheduled upcoming day (if tenure permits)
      const upcomingDayNum = rows.length + 1;
      if (upcomingDayNum <= contract.tenureDays) {
        rows.push({
          day: upcomingDayNum,
          balance: currentBalance,
          roi: dailyRoiAmount,
          action: "UPCOMING",
          after: +(currentBalance - dailyRoiAmount).toFixed(4),
          cumPayout: +(runningCumPayout + dailyRoiAmount).toFixed(4),
          date: "Upcoming (00:00 GST)",
          isToday: false,
          canAction: false,
        });
      }
    }

    return NextResponse.json({
      hasActiveContract: true,
      contractId: contract.id,
      principalUsdt,
      poolBalance,
      roiRate,
      dailyRoiAmount,
      tenureDays: contract.tenureDays,
      daysPaid: contract.daysPaid,
      closingTimestamp: targetClosingTimestamp,
      closingGstFormatted: isActivationDay ? "Tomorrow 00:00 GST" : "23:59:59 GST",
      currentGstFormatted: dubaiInfo.currentDubaiFormatted,
      isActivationDay,
      calendarDaysElapsed,
      isTodayProcessed,
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

    if (!contractId || !action || (action !== "REINVEST" && action !== "CLAIM")) {
      return NextResponse.json(
        { error: "Valid contract ID and action (REINVEST or CLAIM) are required." },
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

    if (calendarDaysElapsed === 0) {
      return NextResponse.json(
        { error: "Daily ROI begins on the next day (00:00 GST) following your stake activation. No yield is available today." },
        { status: 400 }
      );
    }

    const maxEligibleDays = Math.min(calendarDaysElapsed, contract.tenureDays);

    const amountUsdtDec = new Decimal(contract.amountInUsdt.toString());
    const rateDec = new Decimal(contract.dailyRoiRate.toString());
    const dailyRoiUsdt = amountUsdtDec.times(rateDec.dividedBy(100));

    // Check if an action was already taken today
    const todayRefKey = `ROI_${contract.id}_${dubaiInfo.dateStr}`;
    const claimRefKey = `ROI_CLAIM_${contract.id}_${dubaiInfo.dateStr}`;
    const reinvestRefKey = `ROI_REINVEST_${contract.id}_${dubaiInfo.dateStr}`;

    const existingClaim = await db.ledgerEntry.findFirst({
      where: {
        userId: session.userId,
        OR: [{ referenceKey: claimRefKey }, { referenceKey: todayRefKey }],
      },
    });

    const existingReinvest = await db.ledgerEntry.findFirst({
      where: {
        userId: session.userId,
        referenceKey: reinvestRefKey,
      },
    });

    if (action === "CLAIM") {
      if (existingClaim) {
        return NextResponse.json(
          { error: "Today's daily ROI has already been claimed into your ROI Wallet." },
          { status: 400 }
        );
      }

      // IF USER PREVIOUSLY REINVESTED TODAY, SWITCH FROM REINVEST TO CLAIM:
      if (existingReinvest) {
        // 1. Remove the reinvestment ledger entry
        await db.ledgerEntry.delete({ where: { id: existingReinvest.id } });

        // 2. Revert the principal compounding on the contract
        const revertedPrincipal = amountUsdtDec.minus(dailyRoiUsdt);
        await db.investmentContract.update({
          where: { id: contract.id },
          data: {
            amountInUsdt: revertedPrincipal.toFixed(8),
            amountInInr: revertedPrincipal.toFixed(2),
          },
        });

        // 3. Credit dailyRoiUsdt directly to ROI Wallet
        const ledgerRes = await executeLedgerTransaction({
          userId: session.userId,
          type: "BASIC_ROI",
          wallet: "INCOME",
          amount: dailyRoiUsdt,
          referenceKey: claimRefKey,
          description: `Member Claimed Daily ROI (${rateDec}%) on Contract ${contract.id} (Day ${contract.daysPaid}/${contract.tenureDays})`,
        });

        if (!ledgerRes.success) {
          return NextResponse.json({ error: "Failed to credit ROI Wallet." }, { status: 500 });
        }

        // 4. Distribute Level Royalties for claimed ROI
        try {
          await processLevelIncomeForRoi(
            session.userId,
            contract.id,
            contract.packageType,
            dailyRoiUsdt,
            dubaiInfo.dateStr
          );
        } catch (levelErr) {
          console.error("Level income distribution error on claim switch:", levelErr);
        }

        await recordActivity({
          userId: session.userId,
          action: "ROI_CLAIMED",
          category: "FINANCIAL",
          description: `Switched today's ROI to Claim: Credited $${dailyRoiUsdt.toFixed(4)} USDT into ROI Wallet (Day ${contract.daysPaid})`,
          req,
        });

        return NextResponse.json({
          success: true,
          action: "CLAIM",
          message: `Successfully claimed $${dailyRoiUsdt.toFixed(2)} USDT into your ROI Wallet!`,
          claimedAmount: dailyRoiUsdt.toNumber(),
          daysPaid: contract.daysPaid,
        });
      }

      // Normal first claim today:
      if (contract.daysPaid >= maxEligibleDays) {
        return NextResponse.json(
          { error: "Today's daily ROI cycle has already been completed. Next cycle begins at 00:00 GST." },
          { status: 400 }
        );
      }

      const nextDaysPaid = contract.daysPaid + 1;
      const isMatured = nextDaysPaid >= contract.tenureDays;

      // 1. Credit ROI directly to member's Available / ROI Wallet
      const ledgerRes = await executeLedgerTransaction({
        userId: session.userId,
        type: "BASIC_ROI",
        wallet: "INCOME",
        amount: dailyRoiUsdt,
        referenceKey: claimRefKey,
        description: `Member Claimed Daily ROI (${rateDec}%) on Contract ${contract.id} (Day ${nextDaysPaid}/${contract.tenureDays})`,
      });

      if (!ledgerRes.success) {
        return NextResponse.json({ error: "Failed to claim today's ROI." }, { status: 500 });
      }

      // Update contract progress
      await db.investmentContract.update({
        where: { id: contract.id },
        data: {
          daysPaid: nextDaysPaid,
          totalEarned: new Decimal(contract.totalEarned.toString()).plus(dailyRoiUsdt).toFixed(8),
          lastRoiAt: now,
          status: isMatured ? "COMPLETED" : "ACTIVE",
        },
      });

      // Distribute Level Royalties for claimed ROI
      try {
        await processLevelIncomeForRoi(
          session.userId,
          contract.id,
          contract.packageType,
          dailyRoiUsdt,
          dubaiInfo.dateStr
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
      if (existingReinvest) {
        return NextResponse.json(
          { error: "Today's daily ROI is already reinvested and compounded." },
          { status: 400 }
        );
      }
      if (existingClaim) {
        return NextResponse.json(
          { error: "Today's daily ROI was already claimed into your ROI Wallet." },
          { status: 400 }
        );
      }
      if (contract.daysPaid >= maxEligibleDays) {
        return NextResponse.json(
          { error: "Today's daily ROI cycle has already been completed. Next cycle begins at 00:00 GST." },
          { status: 400 }
        );
      }

      const nextDaysPaid = contract.daysPaid + 1;
      const newPrincipal = amountUsdtDec.plus(dailyRoiUsdt);
      const isMatured = nextDaysPaid >= contract.tenureDays;

      // Create tracking ledger entry for reinvestment with the exact ROI amount
      await db.ledgerEntry.create({
        data: {
          userId: session.userId,
          type: "PACKAGE_PURCHASE",
          wallet: "INCOME",
          amount: dailyRoiUsdt.toFixed(8),
          balanceAfter: new Decimal(0),
          referenceKey: reinvestRefKey,
          description: `Reinvested & Compounded $${dailyRoiUsdt.toFixed(4)} USDT into Contract ${contract.id} (Day ${nextDaysPaid})`,
        },
      });

      await db.investmentContract.update({
        where: { id: contract.id },
        data: {
          amountInUsdt: newPrincipal.toFixed(8),
          amountInInr: newPrincipal.toFixed(2),
          daysPaid: nextDaysPaid,
          totalEarned: new Decimal(contract.totalEarned.toString()).plus(dailyRoiUsdt).toFixed(8),
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
