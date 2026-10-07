export const APP_CONFIG = {
  name: "Crypto Finance",
  tagline: "Decentralized Quantitative Yield Protocol • Swiss Algo & DeFi Arbitrage",
  domain: "cryptofinance.online",
  officialEmail: "support@cryptofinance.online",
  cmd: "Mr. Alex Rivera",
  cmdTitle: "Chairman & Managing Director (CMD)",
  cmdBio: "Veteran quantitative architect and FinTech strategist with over 15 years directing algorithmic trading desks across Zurich, London, and Singapore.",
  headquarters: "Crypto Valley Tower, Zug, Switzerland",
  hqDetails: "Headquartered in the world's premier digital finance and blockchain jurisdiction, operating under rigorous Swiss FinTech regulatory standards.",
  depositAddress: "0x71C25e3F62985149C9031024D984F49a786EB47e", // Company USDT BEP-20
  depositNetwork: "USDT BEP-20 (Binance Smart Chain)",
  
  // Slide 05: Free Registration Rewards
  signupBonusUsdt: 1.00, // $1.00 Free Self Signup Bonus in Bonus Wallet
  signupLevelBonusPerTierUsdt: 0.40, // $0.40 USDT per level across 10 referral tiers
  signupLevelBonusTotalUsdt: 4.00, // $4.00 total distributed across 10 tiers
  bonusMaxUtilityPercent: 10.0, // Slide 06: Funds up to 10% of any activation or compounding
  
  usdtToInrRate: 1, // 1:1 Pure USDT throughout
  directReferralPercent: 10.0, // Slide 15: 10% INSTANT DIRECT to Working Wallet
  minWithdrawalUsdt: 2.0, // Slide 08 & 20: Min $2 USDT
  maxWithdrawalUsdt: 5000.0, // Slide 20: Max $5,000 USDT per Tx
  withdrawalAdminFeePercent: 10.0, // Slide 08 & 20: Flat 10% System Liquidity Fee
  p2pTransferFeePercent: 0.0, // Slide 08 & 20: Free Instant Internal P2P Transfers
  
  withdrawalWindow: {
    startHour: 10,
    endHour: 14,
    timezone: "UTC", // Global 24/7 or window
  },

  // Slide 07, 10, 11: Dynamic 4% Daily ROI / 2X Contract Allocation Pool
  dailyRoiInitialPercent: 4.0, // Starts at 4.00% daily on principal stake
  poolAllocationMultiplier: 2.0, // Stake converts to 2X Contract Pool ($100 -> $200)
  poolDailyReleasePercent: 2.0, // 2.00% daily released from remaining pool balance
  compoundingDoublingDays: 35, // Slide 13: (1.02)^35 ≈ 2.000 doubles capital in 35 days
  compoundingCapMultiplier: 2.0, // Slide 14: 2X Cap Lock Rule (Maximum 200% return)
  maxExtractionMultiplier: 2.0, // Maximum 2X (200%) Total Extraction Power

  minStakeUsdt: 2.0, // Slide 07 & 20: Minimum entry $2.00 USDT (Zero fixed packages)
  
  // Audited Stake Benchmark Walkthroughs (Slide 12)
  stakeBenchmarks: [
    { stake: 2.0, pool: 4.0, days: 331, extracted: 3.999, tier: "Min Entry", status: "AUDITED ✓" },
    { stake: 20.0, pool: 40.0, days: 445, extracted: 39.995, tier: "Growth Entry", status: "AUDITED ✓" },
    { stake: 100.0, pool: 200.0, days: 525, extracted: 199.995, tier: "Core Tier", status: "CORE ★" },
    { stake: 1000.0, pool: 2000.0, days: 639, extracted: 1999.995, tier: "VIP Platinum", status: "VIP TIER" },
    { stake: 5000.0, pool: 10000.0, days: 720, extracted: 9999.995, tier: "Whale Tier", status: "WHALE TIER" },
  ],

  basicPlan: {
    minUsdt: 2.0,
    maxUsdt: 100000.0,
    dailyRoiRate: 4.0, // Initial 4% daily on capital (2% of 2X pool)
    poolMultiplier: 2.0,
    poolReleaseRate: 2.0,
    tenureDays: 525,
    netProfitPercent: 100.0, // 200% Gross Return (2X)
    principalPercent: 100.0,
    totalReturnPercent: 200.0,
  },

  // Slide 16 & 17: Official 10-Level Team Daily Royalty (on Downline Daily ROI)
  levelRates: [
    { level: 1, percent: 10.0, directsNeeded: 1 }, // Level 1: 10% Daily (1 Active Direct)
    { level: 2, percent: 5.0, directsNeeded: 2 },  // Level 2: 5% Daily (2 Active Directs)
    { level: 3, percent: 2.0, directsNeeded: 3 },  // Level 3: 2% Daily (3 Active Directs)
    { level: 4, percent: 2.0, directsNeeded: 4 },  // Level 4: 2% Daily (4 Active Directs)
    { level: 5, percent: 2.0, directsNeeded: 5 },  // Level 5: 2% Daily (5 Active Directs)
    { level: 6, percent: 1.0, directsNeeded: 6 },  // Level 6: 1% Daily (6 Active Directs)
    { level: 7, percent: 1.0, directsNeeded: 7 },  // Level 7: 1% Daily (7 Active Directs)
    { level: 8, percent: 1.0, directsNeeded: 8 },  // Level 8: 1% Daily (8 Active Directs)
    { level: 9, percent: 1.0, directsNeeded: 9 },  // Level 9: 1% Daily (9 Active Directs)
    { level: 10, percent: 1.0, directsNeeded: 10 }, // Level 10: 1% Daily (10 Active Directs - Full Unlock)
  ],

  // Slide 18 & 19: Milestone Rank Rewards (Ranks 1 - 10, 50:50 Ratio Criteria)
  milestoneRanks: [
    {
      id: 1,
      rankNumber: 1,
      title: "STARTER",
      icon: "⭐",
      teamVolume: 100,
      strongRatio: 50,
      weakRatio: 50,
      cashBonus: 5.0,
      rewardGift: "Official Welcome Kit",
    },
    {
      id: 2,
      rankNumber: 2,
      title: "BRONZE",
      icon: "⭐⭐",
      teamVolume: 250,
      strongRatio: 125,
      weakRatio: 125,
      cashBonus: 12.5,
      rewardGift: "Branded Polo / Merchandise",
    },
    {
      id: 3,
      rankNumber: 3,
      title: "SILVER",
      icon: "⭐⭐⭐",
      teamVolume: 500,
      strongRatio: 250,
      weakRatio: 250,
      cashBonus: 25.0,
      rewardGift: "Wireless Bluetooth Earbuds",
    },
    {
      id: 4,
      rankNumber: 4,
      title: "GOLD",
      icon: "🥇",
      teamVolume: 1000,
      strongRatio: 500,
      weakRatio: 500,
      cashBonus: 50.0,
      rewardGift: "Smart Fitness Tracker Band",
      featured: true,
    },
    {
      id: 5,
      rankNumber: 5,
      title: "PLATINUM",
      icon: "💎",
      teamVolume: 2500,
      strongRatio: 1250,
      weakRatio: 1250,
      cashBonus: 125.0,
      rewardGift: "Smart Android Tablet",
    },
    {
      id: 6,
      rankNumber: 6,
      title: "SAPPHIRE",
      icon: "🔷",
      teamVolume: 10000,
      strongRatio: 5000,
      weakRatio: 5000,
      cashBonus: 500.0,
      rewardGift: "Latest Flagship Smartphone",
      featured: true,
    },
    {
      id: 7,
      rankNumber: 7,
      title: "RUBY",
      icon: "♦️",
      teamVolume: 25000,
      strongRatio: 12500,
      weakRatio: 12500,
      cashBonus: 1250.0,
      rewardGift: "Apple MacBook Pro",
    },
    {
      id: 8,
      rankNumber: 8,
      title: "EMERALD",
      icon: "🟢",
      teamVolume: 50000,
      strongRatio: 25000,
      weakRatio: 25000,
      cashBonus: 2500.0,
      rewardGift: "Dubai 5-Star VIP Tour",
      featured: true,
    },
    {
      id: 9,
      rankNumber: 9,
      title: "DIAMOND",
      icon: "💠",
      teamVolume: 100000,
      strongRatio: 50000,
      weakRatio: 50000,
      cashBonus: 5000.0,
      rewardGift: "Rolex Luxury Timepiece",
    },
    {
      id: 10,
      rankNumber: 10,
      title: "CROWN",
      icon: "👑",
      teamVolume: 10000000,
      strongRatio: 5000000,
      weakRatio: 5000000,
      cashBonus: 500000.0,
      rewardGift: "Luxury Waterfront Villa (Dubai)",
      featured: true,
    },
  ],
};

export interface WithdrawalWindowStatus {
  isOpen: boolean;
  is24h: boolean;
  startTime: string;
  endTime: string;
  startFormatted: string;
  endFormatted: string;
  startFormattedGst: string;
  endFormattedGst: string;
  startFormattedIst: string;
  endFormattedIst: string;
  startFormattedUtc: string;
  endFormattedUtc: string;
  label: string;
  gstLabel: string;
  istLabel: string;
  utcLabel: string;
  multiZoneLabel: string;
  currentGstTime: string;
  currentIstTime: string;
  currentUtcTime: string;
}

export function getWithdrawalWindowStatus(config?: Record<string, any>): WithdrawalWindowStatus {
  const is24hFlag =
    config?.WITHDRAWAL_24H_OPEN === true ||
    config?.WITHDRAWAL_24H_OPEN === "true" ||
    config?.WITHDRAWAL_24H_OPEN === "1" ||
    true; // Default 24/7 automated Web3 withdrawals for Crypto Finance

  let startTime = "10:00";
  if (config?.WITHDRAWAL_START_TIME && String(config.WITHDRAWAL_START_TIME).includes(":")) {
    startTime = String(config.WITHDRAWAL_START_TIME).trim();
  } else if (config?.WITHDRAWAL_START_HOUR !== undefined && config?.WITHDRAWAL_START_HOUR !== "") {
    const h = Number(config.WITHDRAWAL_START_HOUR);
    startTime = `${String(isNaN(h) ? 10 : h).padStart(2, "0")}:00`;
  }

  let endTime = "14:00";
  if (config?.WITHDRAWAL_END_TIME && String(config.WITHDRAWAL_END_TIME).includes(":")) {
    endTime = String(config.WITHDRAWAL_END_TIME).trim();
  } else if (config?.WITHDRAWAL_END_HOUR !== undefined && config?.WITHDRAWAL_END_HOUR !== "") {
    const h = Number(config.WITHDRAWAL_END_HOUR);
    if (h === 23 || h === 24 || h === 0) {
      endTime = "23:59";
    } else {
      endTime = `${String(isNaN(h) ? 14 : h).padStart(2, "0")}:00`;
    }
  }

  const [startHRaw, startMRaw = 0] = startTime.split(":").map(Number);
  const [endHRaw, endMRaw = 0] = endTime.split(":").map(Number);
  const startH = isNaN(startHRaw) ? 10 : Math.min(23, Math.max(0, startHRaw));
  const startM = isNaN(startMRaw) ? 0 : Math.min(59, Math.max(0, startMRaw));
  const endH = isNaN(endHRaw) ? 14 : Math.min(23, Math.max(0, endHRaw));
  const endM = isNaN(endMRaw) ? 0 : Math.min(59, Math.max(0, endMRaw));

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  const isEffectively24h = is24hFlag || (startTotalMinutes === 0 && endTotalMinutes >= 1439);

  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;

  // Swiss Zurich Time (CET / CEST = UTC+1 / UTC+2)
  const cetDate = new Date(utcMs + 1 * 3600000);
  const curGstH = cetDate.getHours();
  const curGstM = cetDate.getMinutes();

  // IST (UTC+5:30)
  const istDate = new Date(utcMs + 5.5 * 3600000);
  const curIstH = istDate.getHours();
  const curIstM = istDate.getMinutes();
  const curTotalMinutes = curIstH * 60 + curIstM;

  // UTC
  const utcDate = new Date(utcMs);
  const curUtcH = utcDate.getHours();
  const curUtcM = utcDate.getMinutes();

  let isOpen = false;
  if (isEffectively24h) {
    isOpen = true;
  } else if (startTotalMinutes <= endTotalMinutes) {
    isOpen = curTotalMinutes >= startTotalMinutes && curTotalMinutes <= endTotalMinutes;
  } else {
    isOpen = curTotalMinutes >= startTotalMinutes || curTotalMinutes <= endTotalMinutes;
  }

  const formatTime12h = (hours: number, minutes: number) => {
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(h12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const minutesToH12 = (totalMinutes: number) => {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return formatTime12h(h, m);
  };

  const startFormattedIst = formatTime12h(startH, startM);
  const endFormattedIst = formatTime12h(endH, endM);

  const startFormattedGst = minutesToH12(startTotalMinutes - 90);
  const endFormattedGst = minutesToH12(endTotalMinutes - 90);

  const startFormattedUtc = minutesToH12(startTotalMinutes - 330);
  const endFormattedUtc = minutesToH12(endTotalMinutes - 330);

  const currentGstTime = formatTime12h(curGstH, curGstM);
  const currentIstTime = formatTime12h(curIstH, curIstM);
  const currentUtcTime = formatTime12h(curUtcH, curUtcM);

  const gstLabel = isEffectively24h ? "24/7 (Always Open)" : `${startFormattedGst} – ${endFormattedGst} CET`;
  const istLabel = isEffectively24h ? "24/7 (Always Open)" : `${startFormattedIst} – ${endFormattedIst} IST`;
  const utcLabel = isEffectively24h ? "24/7 (Always Open)" : `${startFormattedUtc} – ${endFormattedUtc} UTC`;
  const multiZoneLabel = "24/7 Instant Automated Web3 Dispatches";
  const label = "24/7 Instant Automated Web3 Dispatches";

  return {
    isOpen,
    is24h: isEffectively24h,
    startTime: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
    endTime: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
    startFormatted: startFormattedIst,
    endFormatted: endFormattedIst,
    startFormattedGst,
    endFormattedGst,
    startFormattedIst,
    endFormattedIst,
    startFormattedUtc,
    endFormattedUtc,
    label,
    gstLabel,
    istLabel,
    utcLabel,
    multiZoneLabel,
    currentGstTime,
    currentIstTime,
    currentUtcTime,
  };
}

export function isWithdrawalWindowOpen(config?: Record<string, any>): boolean {
  return getWithdrawalWindowStatus(config).isOpen;
}

export function inrToUsdt(inrAmount: number): number {
  return Number(Number(inrAmount).toFixed(2));
}

export function usdtToInr(usdtAmount: number): number {
  return Number(Number(usdtAmount).toFixed(2));
}
