import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import { getNumericConfig } from "../configService";
import { APP_CONFIG } from "../constants";
import Decimal from "decimal.js";

/**
 * Distributes the $0.40 / Tier Team Registration Bonus across 10 referral tiers
 * whenever a new user registers (Slide 05: 10-Level Team Signup Bonus).
 */
export async function distribute10LevelSignupBonus(
  newUserId: string,
  initialSponsorId: string | null
) {
  if (!initialSponsorId) return;

  try {
    const newUser = await db.user.findUnique({
      where: { id: newUserId },
      select: { id: true, customId: true, fullName: true },
    });
    if (!newUser) return;

    // Configurable per-tier bounty (Default: $0.40 USDT per tier)
    const perTierUsdt = await getNumericConfig(
      "SIGNUP_LEVEL_BONUS_PER_TIER_USDT",
      APP_CONFIG.signupLevelBonusPerTierUsdt ?? 0.40
    );

    const levelAmountDec = new Decimal(perTierUsdt);
    if (!levelAmountDec.isPositive() || levelAmountDec.isZero()) return;

    let currentSponsorId: string | null = initialSponsorId;

    for (let level = 1; level <= 10; level++) {
      if (!currentSponsorId) break;

      const sponsor: {
        id: string;
        customId: string;
        sponsorId: string | null;
        status: any;
      } | null = await db.user.findUnique({
        where: { id: currentSponsorId },
        select: { id: true, customId: true, sponsorId: true, status: true },
      });

      if (!sponsor) break;

      const referenceKey = `SIGNUP_LEVEL_BONUS_${newUser.id}_${sponsor.id}_L${level}`;

      await executeLedgerTransaction({
        userId: sponsor.id,
        type: "SIGNUP_BONUS",
        wallet: "INCOME",
        amount: levelAmountDec,
        referenceKey,
        description: `10-Tier Team Signup Bonus ($${levelAmountDec.toFixed(2)} USDT) from ${newUser.customId} (Tier ${level})`,
        sourceUserId: newUser.id,
        levelNumber: level,
      });

      currentSponsorId = sponsor.sponsorId;
    }
  } catch (error) {
    console.error("[10-Level Signup Bonus Error]:", error);
  }
}

// Backward-compatible alias
export const distribute12LevelSignupBonus = distribute10LevelSignupBonus;

/**
 * Returns accurate bonus lock status and withdrawable balance for a user.
 * Single source of truth for auth/me, dashboard, and transactional views.
 * Slide 06: Bonus Wallet is non-withdrawable and subsidizes up to 10% of activations/compounding.
 */
export async function getUserBonusAndWithdrawableStatus(userId: string) {
  const minActiveRequired = await getNumericConfig(
    "BONUS_REDEMPTION_MIN_ACTIVE_USDT",
    APP_CONFIG.minStakeUsdt ?? 2.0
  );
  const minActiveDec = new Decimal(minActiveRequired);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      incomeBalance: true,
      contracts: {
        where: { status: "ACTIVE" },
        select: { amountInUsdt: true, amountInInr: true },
      },
    },
  });

  if (!user) {
    return {
      activeTotalUsdt: 0,
      totalBonusReceived: 0,
      lockedBonus: 0,
      withdrawableBalance: 0,
      isBonusLocked: false,
      minActiveBonusRequired: minActiveRequired,
    };
  }

  let activeTotalUsdt = new Decimal(0);
  for (const c of user.contracts) {
    const amt = c.amountInUsdt
      ? new Decimal(c.amountInUsdt.toString())
      : c.amountInInr
      ? new Decimal(c.amountInInr.toString())
      : new Decimal(0);
    activeTotalUsdt = activeTotalUsdt.plus(amt);
  }

  // Aggregate ALL signup bonus entries across user's history
  const bonusAgg = await db.ledgerEntry.aggregate({
    where: {
      userId: user.id,
      type: "SIGNUP_BONUS",
    },
    _sum: { amount: true },
  });

  const totalBonusReceived = bonusAgg._sum.amount
    ? new Decimal(bonusAgg._sum.amount.toString())
    : new Decimal(0);

  // Bonus is strictly non-withdrawable (Slide 06 & 08)
  const isBonusLocked = true;
  const currentIncomeBal = new Decimal(user.incomeBalance.toString());

  const lockedBonusDec = Decimal.min(totalBonusReceived, currentIncomeBal);

  // Available withdrawable floored strictly to 1 decimal place
  const rawWithdrawable = Decimal.max(0, currentIncomeBal.minus(lockedBonusDec));
  const withdrawableBalDec = rawWithdrawable.toDecimalPlaces(1, Decimal.ROUND_DOWN);

  return {
    activeTotalUsdt: activeTotalUsdt.toNumber(),
    totalBonusReceived: totalBonusReceived.toNumber(),
    lockedBonus: lockedBonusDec.toNumber(),
    withdrawableBalance: withdrawableBalDec.toNumber(),
    isBonusLocked,
    minActiveBonusRequired: minActiveRequired,
  };
}

/**
 * Calculates 10% bonus wallet subsidy for activation or compounding (Slide 06)
 */
export function calculateBonusUtilityDiscount(
  stakeAmount: number | Decimal,
  availableBonus: number | Decimal
): { bonusDiscount: number; externalRequired: number } {
  const stake = new Decimal(stakeAmount.toString());
  const bonus = new Decimal(availableBonus.toString());

  const maxBonusAllowed = stake.times(0.10); // 10% Utility Rule
  const bonusDiscount = Decimal.min(maxBonusAllowed, bonus);
  const externalRequired = stake.minus(bonusDiscount);

  return {
    bonusDiscount: bonusDiscount.toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber(),
    externalRequired: externalRequired.toDecimalPlaces(2, Decimal.ROUND_UP).toNumber(),
  };
}

/**
 * Validates whether a user can withdraw, reserving non-withdrawable bonus wallet funds (Slide 08)
 */
export async function validateBonusUsageEligibility(
  userId: string,
  requestedAmount: Decimal | number | string
): Promise<{ allowed: boolean; error?: string; activeTotalUsdt: Decimal; bonusBalanceUsdt: Decimal }> {
  const reqAmountDec = new Decimal(requestedAmount.toString());

  const minActiveRequired = await getNumericConfig(
    "BONUS_REDEMPTION_MIN_ACTIVE_USDT",
    APP_CONFIG.minStakeUsdt ?? 2.0
  );
  const minActiveDec = new Decimal(minActiveRequired);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      customId: true,
      incomeBalance: true,
      contracts: {
        where: { status: "ACTIVE" },
        select: { amountInUsdt: true, amountInInr: true },
      },
    },
  });

  if (!user) {
    return {
      allowed: false,
      error: "User not found.",
      activeTotalUsdt: new Decimal(0),
      bonusBalanceUsdt: new Decimal(0),
    };
  }

  let activeTotalUsdt = new Decimal(0);
  for (const c of user.contracts) {
    const amt = c.amountInUsdt
      ? new Decimal(c.amountInUsdt.toString())
      : c.amountInInr
      ? new Decimal(c.amountInInr.toString())
      : new Decimal(0);
    activeTotalUsdt = activeTotalUsdt.plus(amt);
  }

  const bonusAgg = await db.ledgerEntry.aggregate({
    where: {
      userId: user.id,
      type: "SIGNUP_BONUS",
    },
    _sum: { amount: true },
  });

  const totalBonusReceived = bonusAgg._sum.amount
    ? new Decimal(bonusAgg._sum.amount.toString())
    : new Decimal(0);

  if (totalBonusReceived.isZero() || !totalBonusReceived.isPositive()) {
    return {
      allowed: true,
      activeTotalUsdt,
      bonusBalanceUsdt: new Decimal(0),
    };
  }

  const currentIncomeBalance = new Decimal(user.incomeBalance.toString());
  const nonBonusAvailable = Decimal.max(0, currentIncomeBalance.minus(totalBonusReceived)).toDecimalPlaces(1, Decimal.ROUND_DOWN);

  if (reqAmountDec.greaterThan(nonBonusAvailable)) {
    return {
      allowed: false,
      error: `Bonus Wallet is non-withdrawable (Slide 06 Liquidity Safeguard). You have $${totalBonusReceived.toFixed(2)} USDT in Bonus Wallet usable up to 10% for ID activations and compounding. Maximum withdrawable cash balance is $${nonBonusAvailable.toFixed(1)} USDT.`,
      activeTotalUsdt,
      bonusBalanceUsdt: totalBonusReceived,
    };
  }

  return {
    allowed: true,
    activeTotalUsdt,
    bonusBalanceUsdt: totalBonusReceived,
  };
}
