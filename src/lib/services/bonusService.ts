import { db } from "../db";
import { executeLedgerTransaction } from "../ledger";
import { getNumericConfig } from "../configService";
import { APP_CONFIG } from "../constants";
import Decimal from "decimal.js";

/**
 * Distributes the $0.50 / 12-Level Registration Bounty equally across the upper
 * 12 sponsor generations whenever a new user signs up.
 * Total: $0.50 USDT => ~$0.04166667 USDT per upline level.
 */
export async function distribute12LevelSignupBonus(
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

    // Configurable total 12-level bounty (Default: 0.50 USDT)
    const totalBountyUsdt = await getNumericConfig(
      "SIGNUP_LEVEL_BONUS_TOTAL_USDT",
      APP_CONFIG.signupLevelBonusTotalUsdt ?? 0.50
    );

    const totalBountyDec = new Decimal(totalBountyUsdt);
    if (!totalBountyDec.isPositive() || totalBountyDec.isZero()) return;

    const levelAmountDec = totalBountyDec.dividedBy(12);
    if (!levelAmountDec.isPositive() || levelAmountDec.isZero()) return;

    let currentSponsorId: string | null = initialSponsorId;

    for (let level = 1; level <= 12; level++) {
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
        description: `12-Level Registration Bounty ($${levelAmountDec.toFixed(4)} USDT) from ${newUser.customId} (Level ${level})`,
        sourceUserId: newUser.id,
        levelNumber: level,
      });

      currentSponsorId = sponsor.sponsorId;
    }
  } catch (error) {
    console.error("[12-Level Signup Bonus Error]:", error);
  }
}

/**
 * Returns accurate bonus lock status and withdrawable balance for a user.
 * Single source of truth for auth/me, dashboard, and transactional views.
 */
export async function getUserBonusAndWithdrawableStatus(userId: string) {
  const minActiveRequired = await getNumericConfig(
    "BONUS_REDEMPTION_MIN_ACTIVE_USDT",
    APP_CONFIG.bonusRedemptionMinActiveUsdt ?? 20.0
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

  const isBonusLocked = activeTotalUsdt.lessThan(minActiveDec);
  const currentIncomeBal = new Decimal(user.incomeBalance.toString());

  const lockedBonusDec = isBonusLocked
    ? Decimal.min(totalBonusReceived, currentIncomeBal)
    : new Decimal(0);

  // Available withdrawable floored strictly to 1 decimal place (never rounded up)
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
 * Validates whether a user meets the "$20+ Active IDs" criteria for using/redeeming
 * their Signup and 12-Level Registration Bounty balance.
 *
 * Rules:
 * 1. If user's active packages total >= $20 (or config), 100% of balance is unlocked.
 * 2. If user's active packages total < $20, bonus funds are reserved/locked.
 *    Any requested amount that dips into the bonus portion is blocked until they activate a $20+ package.
 */
export async function validateBonusUsageEligibility(
  userId: string,
  requestedAmount: Decimal | number | string
): Promise<{ allowed: boolean; error?: string; activeTotalUsdt: Decimal; bonusBalanceUsdt: Decimal }> {
  const reqAmountDec = new Decimal(requestedAmount.toString());

  // Get min active package requirement from config (Default: $20.00 USDT)
  const minActiveRequired = await getNumericConfig(
    "BONUS_REDEMPTION_MIN_ACTIVE_USDT",
    APP_CONFIG.bonusRedemptionMinActiveUsdt ?? 20.0
  );
  const minActiveDec = new Decimal(minActiveRequired);

  // 1. Fetch user's active investment contracts
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

  // Calculate total active contract investment
  let activeTotalUsdt = new Decimal(0);
  for (const c of user.contracts) {
    const amt = c.amountInUsdt
      ? new Decimal(c.amountInUsdt.toString())
      : c.amountInInr
      ? new Decimal(c.amountInInr.toString())
      : new Decimal(0);
    activeTotalUsdt = activeTotalUsdt.plus(amt);
  }

  // If user has $20+ active package, they are 100% eligible
  if (activeTotalUsdt.greaterThanOrEqualTo(minActiveDec)) {
    return {
      allowed: true,
      activeTotalUsdt,
      bonusBalanceUsdt: new Decimal(0),
    };
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

  // If the user has received no bonus, no restrictions apply
  if (totalBonusReceived.isZero() || !totalBonusReceived.isPositive()) {
    return {
      allowed: true,
      activeTotalUsdt,
      bonusBalanceUsdt: new Decimal(0),
    };
  }

  const currentIncomeBalance = new Decimal(user.incomeBalance.toString());
  // The available income that does NOT come from the bonus, floored to 1 decimal place (never rounded up)
  const nonBonusAvailable = Decimal.max(0, currentIncomeBalance.minus(totalBonusReceived)).toDecimalPlaces(1, Decimal.ROUND_DOWN);

  // If requested amount exceeds non-bonus income, it requires using the bonus funds
  if (reqAmountDec.greaterThan(nonBonusAvailable)) {
    return {
      allowed: false,
      error: `Bonus funds are usable only on active IDs with $${minActiveDec.toFixed(2)}+ active package. You have $${totalBonusReceived.toFixed(2)} USDT in Signup/Level Bonus. Maximum withdrawable without activating a $${minActiveDec.toFixed(2)}+ package is $${nonBonusAvailable.toFixed(1)} USDT.`,
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
