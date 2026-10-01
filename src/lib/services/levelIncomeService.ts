import { db } from "../db";
import { executeLedgerTransaction, WalletType } from "../ledger";
import { getNumericConfig } from "../configService";
import { APP_CONFIG } from "../constants";
import Decimal from "decimal.js";

/**
 * Slide 16 & 17: 10-Level Team Daily Royalty
 * Earn daily passive royalties calculated on the daily ROI generation of downline team members.
 * Level 1: 10% (1 active direct)
 * Level 2: 5% (2 active directs)
 * Level 3-5: 2% each (3, 4, 5 active directs)
 * Level 6-10: 1% each (6, 7, 8, 9, 10 active directs)
 */
export async function processLevelIncomeForRoi(
  sourceUserId: string,
  contractId: string,
  packageType: "BASIC_SAVING" | "FIX_DEPOSIT",
  dailyRoiUsdt: Decimal,
  dateStr: string
) {
  let currentUserId = sourceUserId;
  const targetWallet: WalletType = "INCOME";

  for (let level = 1; level <= 10; level++) {
    // Find upline sponsor
    const currentUser = await db.user.findUnique({
      where: { id: currentUserId },
      select: { sponsorId: true },
    });

    if (!currentUser || !currentUser.sponsorId) {
      break; // Reached root of tree
    }

    const sponsorId = currentUser.sponsorId;
    const sponsor: {
      id: string;
      customId: string;
      status: any;
      contracts: { id: string }[];
    } | null = await db.user.findUnique({
      where: { id: sponsorId },
      select: {
        id: true,
        customId: true,
        status: true,
        contracts: {
          where: { status: "ACTIVE" },
          select: { id: true },
        },
      },
    });

    if (!sponsor) break;

    // Check Qualification: Sponsor must have an ACTIVE ID and required Direct Active Referrals
    const isSponsorActive = sponsor.status === "ACTIVE" && Boolean(sponsor.contracts && sponsor.contracts.length > 0);
    const activeDirectsCount = await db.user.count({
      where: { sponsorId: sponsor.id, status: "ACTIVE" },
    });
    const isQualified = isSponsorActive && activeDirectsCount >= level;

    if (isQualified) {
      // Dynamic Level Royalty rate from System Config or APP_CONFIG
      const defaultRate = APP_CONFIG.levelRates.find((r) => r.level === level)?.percent ?? 1.0;
      const ratePercent = await getNumericConfig(`LEVEL_${level}_PERCENT`, defaultRate);

      const levelIncomeUsdt = dailyRoiUsdt.times(ratePercent / 100);

      if (levelIncomeUsdt.isPositive() && !levelIncomeUsdt.isZero()) {
        const referenceKey = `LEVEL_${contractId}_${sponsor.id}_L${level}_${dateStr}`;

        await executeLedgerTransaction({
          userId: sponsor.id,
          type: "BASIC_LEVEL_INCOME",
          wallet: targetWallet,
          amount: levelIncomeUsdt,
          referenceKey,
          description: `Level ${level} Team Royalty (${ratePercent}%) from ${sourceUserId}`,
          sourceUserId,
          levelNumber: level,
        });
      }
    }

    currentUserId = sponsorId;
  }
}