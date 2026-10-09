import { db } from "./db";
import { APP_CONFIG } from "./constants";

export const DEFAULT_SYSTEM_CONFIGS: Record<string, { value: string; description: string; category: string }> = {
  // 1. Receiving Wallet & Financial (BEP-20 Architecture)
  COMPANY_USDT_ADDRESS: {
    value: APP_CONFIG.depositAddress,
    description: "Official USDT (BEP-20) receiving wallet address for protocol deposits",
    category: "wallet",
  },
  COMPANY_USDT_QR: {
    value: "",
    description: "Official USDT (BEP-20) deposit QR code image (Uploaded file or custom URL)",
    category: "wallet",
  },

  // 2. Stake Engine & 2X Contract Allocation Pool (Slides 10 - 14)
  BASIC_PLAN_DAILY_ROI: {
    value: "4.0",
    description: "Daily quantitative yield rate percentage (4.0% daily on principal stake / 2.0% daily release from 2X pool)",
    category: "plan",
  },
  BASIC_PLAN_TENURE_DAYS: {
    value: "50",
    description: "Standard tenure duration until 200% pool cap is reached (50 days / ~35 days with daily compounding)",
    category: "plan",
  },
  BASIC_PLAN_MIN_USDT: {
    value: "2",
    description: "Minimum package stake amount in USDT ($2.00)",
    category: "plan",
  },
  BASIC_PLAN_MAX_USDT: {
    value: "10000",
    description: "Maximum package stake amount in USDT ($10,000.00)",
    category: "plan",
  },
  CLOSING_MODE: {
    value: "AUTO",
    description: "Daily protocol closing execution mode ('AUTO' for scheduled midnight automated cycle, 'MANUAL' for manual on-demand execution)",
    category: "plan",
  },

  // 3. Bonus Wallet Utility & Registration Bounties (Slides 05 & 06)
  BONUS_UTILITY_PERCENT: {
    value: "10.0",
    description: "Maximum percentage of stake that can be funded from Non-Withdrawable Bonus Wallet (10.0% max)",
    category: "bonus",
  },
  SIGNUP_BONUS_USDT: {
    value: "1.00",
    description: "Welcome signup bonus credited to member's Bonus Wallet ($1.00 USDT)",
    category: "bonus",
  },
  SIGNUP_LEVEL_BOUNTY_USDT: {
    value: "0.40",
    description: "Downline referral registration bounty credited to upline Bonus Wallet ($0.40 per level up to 10 levels)",
    category: "bonus",
  },

  // 4. Direct Sponsor Commission & 10-Level Daily Royalties (Slides 15, 16 & 17)
  DIRECT_REFERRAL_PERCENT: {
    value: "10.0",
    description: "Instant Direct Sponsor Referral Commission percentage (10.0% flat)",
    category: "royalty",
  },
  LEVEL_1_PERCENT: {
    value: "10.0",
    description: "Level 1 Daily Royalty % (Requires 1 Active Direct Referral)",
    category: "royalty",
  },
  LEVEL_2_PERCENT: {
    value: "5.0",
    description: "Level 2 Daily Royalty % (Requires 2 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_3_PERCENT: {
    value: "2.0",
    description: "Level 3 Daily Royalty % (Requires 3 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_4_PERCENT: {
    value: "2.0",
    description: "Level 4 Daily Royalty % (Requires 4 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_5_PERCENT: {
    value: "2.0",
    description: "Level 5 Daily Royalty % (Requires 5 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_6_PERCENT: {
    value: "1.0",
    description: "Level 6 Daily Royalty % (Requires 6 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_7_PERCENT: {
    value: "1.0",
    description: "Level 7 Daily Royalty % (Requires 7 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_8_PERCENT: {
    value: "1.0",
    description: "Level 8 Daily Royalty % (Requires 8 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_9_PERCENT: {
    value: "1.0",
    description: "Level 9 Daily Royalty % (Requires 9 Active Direct Referrals)",
    category: "royalty",
  },
  LEVEL_10_PERCENT: {
    value: "1.0",
    description: "Level 10 Daily Royalty % (Requires 10 Active Direct Referrals - Full Matrix Unlocked)",
    category: "royalty",
  },

  // 5. Withdrawal Rules & Protocol Liquidity Fee (Slide 21)
  WITHDRAWAL_24H_OPEN: {
    value: "true",
    description: "Allow 24/7 withdrawals anytime without timing restriction (true / false)",
    category: "withdrawal",
  },
  WITHDRAWAL_START_TIME: {
    value: "10:00",
    description: "Daily withdrawal window start time in HH:MM IST (e.g. 10:00)",
    category: "withdrawal",
  },
  WITHDRAWAL_END_TIME: {
    value: "14:00",
    description: "Daily withdrawal window close time in HH:MM IST (e.g. 14:00 or 23:59)",
    category: "withdrawal",
  },
  MIN_WITHDRAWAL_USDT: {
    value: "2.00",
    description: "Minimum single external withdrawal amount in USDT ($2.00 USDT)",
    category: "withdrawal",
  },
  MAX_WITHDRAWAL_USDT: {
    value: "5000",
    description: "Maximum single external withdrawal amount in USDT ($5,000.00 USDT)",
    category: "withdrawal",
  },
  WITHDRAWAL_FEE_PERCENT: {
    value: "10.0",
    description: "Protocol liquidity fee / retained admin fee deducted upon external cashouts (10.0%)",
    category: "withdrawal",
  },

  // 6. P2P & Internal Wallet Transfers (Slide 04)
  MIN_P2P_TRANSFER_USDT: {
    value: "1",
    description: "Minimum P2P fund transfer amount between members in USDT ($1.00)",
    category: "transfers",
  },
  P2P_FEE_PERCENT: {
    value: "0.0",
    description: "Member-to-member P2P transfer fee percentage (0.0% free transfer)",
    category: "transfers",
  },
  WALLET_TRANSFER_FEE_PERCENT: {
    value: "0.0",
    description: "Internal wallet transfer fee from ROI / Working to Main / P2P wallet (0.0% free)",
    category: "transfers",
  },

  // 7. Corporate Headquarters & Customer Support
  OFFICIAL_EMAIL: {
    value: "support@cryptonova.world",
    description: "Official customer care & technical support email",
    category: "company",
  },
  HEADQUARTERS: {
    value: "Crypto Valley Tower, Zug, Switzerland",
    description: "Registered corporate protocol foundation headquarters",
    category: "company",
  },

  // 8. Platform Operational Mode & Emergency Controls
  MAINTENANCE_MODE: {
    value: "false",
    description: "Enable System Maintenance mode (locks member access, admin can still login via /adminlogin)",
    category: "system_mode",
  },
  MAINTENANCE_NOTICE_TEXT: {
    value: "CryptoNova Protocol is undergoing scheduled infrastructure upgrades. All assets and ledger balances are completely safe.",
    description: "Notice message displayed to visitors when Maintenance mode is active",
    category: "system_mode",
  },

  // 9. Crypto & Blockchain Deposit Processing
  DEPOSIT_PROCESSING_MODE: {
    value: "MANUAL",
    description: "Global USDT BEP-20 deposit processing mode (AUTOMATIC or MANUAL)",
    category: "crypto_deposit",
  },
  DEPOSIT_AUTOMATIC_CREDIT_ENABLED: {
    value: "true",
    description: "Automatic crediting pause/resume switch (true or false)",
    category: "crypto_deposit",
  },
  DEPOSIT_MONITOR_ENABLED: {
    value: "true",
    description: "BSC blockchain monitor active status (true or false)",
    category: "crypto_deposit",
  },
  REQUIRED_CONFIRMATIONS: {
    value: "3",
    description: "Required BSC block confirmations before crediting USDT deposit",
    category: "crypto_deposit",
  },
  USDT_BEP20_CONTRACT: {
    value: "0x55d398326f99059ff775485246999027b3197955",
    description: "Official USDT BEP-20 token contract address on BSC",
    category: "crypto_deposit",
  },
};

// In-memory cache with 60-second TTL (invalidated instantly on admin update)
let cachedConfigs: Record<string, string> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000;

export function invalidateConfigCache() {
  cachedConfigs = null;
  lastFetchTime = 0;
}

export async function getAllSystemConfigs(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedConfigs && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfigs;
  }

  const result: Record<string, string> = {};

  // 1. Fill defaults
  for (const [key, item] of Object.entries(DEFAULT_SYSTEM_CONFIGS)) {
    result[key] = item.value;
  }

  // 2. Fetch from database (all valid database overrides)
  try {
    const dbRows = await db.systemConfig.findMany();
    for (const row of dbRows) {
      if (row.value != null && row.value !== "") {
        result[row.key] = row.value;
      }
    }
  } catch (error) {
    console.error("[configService] Error loading systemConfig from db:", error);
  }

  cachedConfigs = result;
  lastFetchTime = now;
  return result;
}

export async function getSystemConfigValue(key: string, fallback?: string): Promise<string> {
  const all = await getAllSystemConfigs();
  if (all[key] != null) {
    return all[key];
  }
  return fallback ?? DEFAULT_SYSTEM_CONFIGS[key]?.value ?? "";
}

export async function getNumericConfig(key: string, fallback: number): Promise<number> {
  const val = await getSystemConfigValue(key, String(fallback));
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

export async function getStringConfig(key: string, fallback: string): Promise<string> {
  return getSystemConfigValue(key, fallback);
}
