"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  MessageCircle,
  Send,
  Users,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
  Repeat,
  Wallet,
  ChevronRight,
  Lock,
  Gift,
  Award,
  RefreshCw,
  Sliders,
  DollarSign,
  PieChart,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

interface DashboardViewProps {
  user: any;
  setActiveTab: (tab: string) => void;
}

export function DashboardView({ user, setActiveTab }: DashboardViewProps) {
  const [copied, setCopied] = useState(false);
  const [calcStake, setCalcStake] = useState<number>(100);
  const [calcMode, setCalcMode] = useState<"withdraw" | "reinvest">("withdraw");

  // Referral URL
  const origin =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? window.location.origin
      : "https://cryptofinance.online";
  const customId = user?.customId || "CF478752";
  const referralUrl = `${origin}/register?r=${customId}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Join Date
  const joinDateStr = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "19 Jul 2026";

  const currency = "$";

  // Active Stake & 2X Contract Allocation Pool (Slides 10-12)
  let activeStake = Number(user?.basicPackageTotal ?? 0);
  if (activeStake === 0 && Array.isArray(user?.contracts)) {
    for (const c of user.contracts) {
      if (c.status === "ACTIVE") {
        const amt = Number(
          c.amountInUsdt != null
            ? c.amountInUsdt
            : Number(c.amountInInr || 0) > 5000
            ? Number(c.amountInInr) / 110
            : Number(c.amountInInr || 0)
        );
        activeStake += amt;
      }
    }
  }

  // 2X Contract Allocation Pool
  const allocationPoolTotal = activeStake * 2.0;
  const day1Payout = +(allocationPoolTotal * 0.02).toFixed(2); // 2.00% daily from 2X pool = 4% on capital

  // 3-Wallet Balances strictly from Slide 04:
  const wallets = user?.wallets || {};
  const b = user?.incomeBreakdown || {};
  const bonusWalletBalance = Number(wallets.bonusBalance ?? user?.bonusBalance ?? user?.lockedBonus ?? b.joiningBonus ?? 1.0);
  const roiWalletBalance = Number(wallets.roiBalance ?? user?.roiBalance ?? b.basicTodayRoi ?? 0);
  const workingWalletBalance = Number(wallets.workingBalance ?? user?.workingBalance ?? user?.incomeBalance ?? 0);
  const p2pWalletBalance = Number(wallets.p2pBalance ?? user?.p2pBalance ?? user?.fundBalance ?? 0);
  const mainWalletBalance = Number(wallets.mainBalance ?? user?.mainBalance ?? 0);

  // Total Withdrawn
  const processedWithdrawnFromList = (user?.withdrawals || [])
    .filter((w: any) => w.status === "PROCESSED")
    .reduce((acc: number, w: any) => acc + Number(w.amountInUsdt ?? w.amountInInr ?? 0), 0);
  const totalWithdrawn = Math.max(Number(user?.totalWithdrawn ?? 0), processedWithdrawnFromList);
  const totalIncome = Number(user?.totalIncome ?? (workingWalletBalance + roiWalletBalance + totalWithdrawn));

  // Team counts & Volume
  const directTeamCount = user?.directTeamCount ?? (user?.directs?.length ?? 0);
  const activeDirectCount =
    user?.activeDirectCount ??
    (user?.directs || []).filter((d: any) => d.activation === "Active" || Number(d.amount || 0) > 0).length;
  const totalTeamCount = user?.totalTeamCount ?? (user?.teamList?.length ?? 0);
  const activeTeamCount =
    user?.activeTeamCount ??
    (user?.teamList || []).filter((t: any) => t.activation === "Active" || Number(t.amount || 0) > 0).length;

  const calculatedDirectBiz = (user?.directs || []).reduce(
    (acc: number, d: any) => acc + Number(d.amount || 0),
    0
  );
  const directBusiness = Math.max(Number(user?.directBusiness ?? 0), calculatedDirectBiz);

  // Total downline turnover estimate
  const totalDownlineVolume = (user?.teamList || []).reduce(
    (acc: number, m: any) => acc + Number(m.amount || 0),
    directBusiness
  );

  // Milestone Rank Calculation (50:50 Strong & Weak Leg Criteria - Slide 18 & 19)
  const strongLegVolume = +(totalDownlineVolume * 0.55).toFixed(2);
  const weakLegVolume = +(totalDownlineVolume * 0.45).toFixed(2);
  
  // Find current qualifying rank
  const milestoneRanks = APP_CONFIG.milestoneRanks || [];
  const currentRank = milestoneRanks.reduce((best, r) => {
    if (totalDownlineVolume >= r.teamVolume) return r;
    return best;
  }, milestoneRanks[0]);

  const nextRank = milestoneRanks.find((r) => r.teamVolume > totalDownlineVolume) || milestoneRanks[milestoneRanks.length - 1];
  const rankProgress = Math.min(100, (totalDownlineVolume / (nextRank.teamVolume || 1)) * 100);

  // Quick Mini-Simulator calculations from index.html
  const simPool = calcStake * 2;
  const simBonusSubsidy = +(calcStake * 0.1).toFixed(2);
  const simNetUsdt = +(calcStake - simBonusSubsidy).toFixed(2);
  const simDay1Roi = +(simPool * 0.02).toFixed(2);
  const sim35DaysDoubled = +(calcStake * Math.pow(1.02, 35)).toFixed(2);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* =========================================================================
          TOP SECTION: User Glass ID Card & Live Telemetry
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Glass User Identity & Referral Station */}
        <div className="lg:col-span-6 glass-card-elevated glass-glow-top p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Orb */}
          <div className="absolute -top-16 -left-16 w-44 h-44 bg-[#00D2FF]/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header with Avatar & Live Status Pill */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00FFA3] via-[#00D2FF] to-indigo-600 p-0.5 shadow-lg shadow-[#00FFA3]/20">
                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white font-extrabold text-xl font-mono">
                      {(user?.fullName || "M")[0]}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00FFA3] border-2 border-slate-950 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {user?.fullName || "Crypto Finance Member"}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-semibold text-[#00D2FF] bg-[#00D2FF]/10 px-2 py-0.5 rounded-md border border-[#00D2FF]/20">
                      {customId}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      Member since {joinDateStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <div className="glass-pill border-[#00FFA3]/30 bg-[#00FFA3]/10 text-emerald-600 dark:text-[#00FFA3] text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#00FFA3] animate-pulse" />
                <span>{user?.status === "ACTIVE" || activeStake > 0 ? "Active Protocol ID" : "Pending Stake"}</span>
              </div>
            </div>

            {/* Quick Metrics Bar in Frosted Glass */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="glass-panel p-3 text-center">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 font-mono">
                  DIRECT VOLUME
                </p>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                  {currency} {directBusiness.toFixed(2)}
                </p>
              </div>

              <div className="glass-panel p-3 text-center">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 font-mono">
                  DOWNLINE COMMUNITY
                </p>
                <p className="text-base sm:text-lg font-extrabold text-sky-600 dark:text-[#00D2FF] font-mono">
                  {activeTeamCount} / {totalTeamCount} Members
                </p>
              </div>
            </div>
          </div>

          {/* Referral Link Sharing Station */}
          <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Invite & Earn 10% Direct + 10-Level Royalty</span>
              <span className="text-sky-600 dark:text-[#00D2FF] text-[11px] font-medium font-mono">Slide 15-17</span>
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/15 backdrop-blur-xl">
              <span className="text-sky-500 dark:text-[#00D2FF] text-xs pl-2.5 font-mono">🔗</span>
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs flex-1 font-mono outline-none px-1 select-all"
              />
              <button
                onClick={copyReferral}
                className="px-3.5 py-1.5 rounded-xl bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#00D2FF]/25 active:scale-95 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Social Share Pills */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Join Crypto Finance quantitative protocol: ${referralUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-pill px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-emerald-500/40 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-[#00FFA3]" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent("Crypto Finance 4% Daily Yield Protocol")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-pill px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-sky-500/40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-sky-500 dark:text-[#00D2FF]" />
                  <span>Telegram</span>
                </a>
              </div>

              <button
                onClick={() => setActiveTab("downline-direct")}
                className="text-xs font-semibold text-sky-600 dark:text-[#00D2FF] hover:text-sky-500 flex items-center gap-1 transition-colors font-mono"
              >
                <span>Directs ({directTeamCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Protocol Telemetry & 2X Contract Allocation Pool Showcase */}
        <div className="lg:col-span-6 glass-card-elevated glass-glow-top p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500 dark:text-[#00FFA3]" />
                2X CONTRACT ALLOCATION POOL &bull; SLIDE 10
              </span>
              <span className="glass-pill text-[10px] font-bold text-emerald-600 dark:text-[#00FFA3] border-emerald-400/30 bg-emerald-500/10 font-mono">
                2.00% Daily Release
              </span>
            </div>

            {/* Big Bold Pool Balance Display */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 my-2">
              <div>
                <div className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1 font-mono">
                  <span>${allocationPoolTotal > 0 ? allocationPoolTotal.toFixed(2) : "0.00"}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-sans ml-1 font-normal">2X Pool Target</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <span>Principal Stake: <strong className="text-slate-900 dark:text-white">${activeStake.toFixed(2)}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-[#00FFA3] font-bold">Day 1 Release: ${day1Payout.toFixed(2)} (4% ROI)</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">Total Extracted:</span>
                <span className="text-lg font-black text-sky-600 dark:text-[#00D2FF] font-mono">
                  ${totalWithdrawn.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Smooth Vector Wave Simulation Lines */}
          <div className="relative my-4 py-2 flex items-center justify-center">
            <div className="w-full h-24 rounded-2xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col justify-between py-2 px-4 opacity-20 pointer-events-none">
                <div className="w-full border-b border-dashed border-slate-400 dark:border-white/40" />
                <div className="w-full border-b border-dashed border-slate-400 dark:border-white/40" />
                <div className="w-full border-b border-dashed border-slate-400 dark:border-white/40" />
              </div>

              <svg viewBox="0 0 400 90" className="w-full h-full absolute inset-0" fill="none">
                <defs>
                  <filter id="glow-mint" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00FFA3" floodOpacity="0.5" />
                  </filter>
                  <filter id="glow-sky" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00D2FF" floodOpacity="0.5" />
                  </filter>
                </defs>
                <path
                  d="M 10 70 Q 100 80, 180 50 T 300 35 T 390 15"
                  stroke="#0284C7"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glow-sky)"
                />
                <path
                  d="M 10 60 Q 110 85, 200 45 T 310 25 T 390 10"
                  stroke="#10B981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#glow-mint)"
                />
              </svg>
            </div>
          </div>

          {/* 35-Day Compounding Engine & 2X Cap Lock Alert */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500 dark:text-[#00FFA3]" />
              <span>35-Day Doubling Engine: <strong className="text-slate-900 dark:text-white">(1.02)^35 ≈ 2.000</strong></span>
            </div>
            <button
              onClick={() => setActiveTab("package-base")}
              className="text-xs font-bold text-emerald-600 dark:text-[#00FFA3] hover:text-emerald-700 dark:hover:text-white flex items-center gap-1 font-mono transition"
            >
              <span>Stake / Compound</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SLIDE 04: THE 3-WALLET ENGINE SECTION (Core Architecture)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-500 dark:text-[#00D2FF]" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight uppercase font-mono">
              The 3-Wallet Engine (Triple-Isolated Liquidity)
            </h3>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">Slide 04 - 08 Protocol</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Bonus Wallet */}
          <div className="glass-card-elevated p-5 flex flex-col justify-between border-t-2 border-t-indigo-500 relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-400/30 font-mono">
                  NON-WITHDRAWABLE
                </span>
                <Gift className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>

              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                BONUS WALLET
              </div>

              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono my-1">
                {currency} {bonusWalletBalance.toFixed(2)}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Holds $1.00 Self + $0.40/Level bonuses. Subsidizes up to <strong>10% of any activation or compounding</strong>!
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-mono">10% Utility Rate</span>
              <button
                onClick={() => setActiveTab("stake-activate")}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white font-bold font-mono flex items-center gap-1 transition"
              >
                <span>Use for Stake (10%)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: ROI Wallet */}
          <div className="glass-card-elevated p-5 flex flex-col justify-between border-t-2 border-t-emerald-500 relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#00FFA3] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                  DAILY 4% YIELD
                </span>
                <Zap className="w-4 h-4 text-emerald-500 dark:text-[#00FFA3]" />
              </div>

              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                ROI WALLET
              </div>

              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-[#00FFA3] font-mono my-1">
                {currency} {roiWalletBalance.toFixed(2)}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Automated 4% daily returns from 2X pool. Transfer directly to <strong>Main Wallet</strong> or <strong>P2P Wallet</strong>.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-mono">0% Transfer Fee</span>
              <button
                onClick={() => setActiveTab("wallet-roi")}
                className="text-emerald-600 dark:text-[#00FFA3] hover:text-emerald-700 dark:hover:text-white font-bold font-mono flex items-center gap-1 transition"
              >
                <span>Transfer &rarr; Main / P2P</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Working Wallet */}
          <div className="glass-card-elevated p-5 flex flex-col justify-between border-t-2 border-t-sky-500 relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-[#00D2FF] bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-400/30 font-mono">
                  DIRECT + ROYALTY + REWARDS
                </span>
                <Wallet className="w-4 h-4 text-sky-500 dark:text-[#00D2FF]" />
              </div>

              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                WORKING WALLET
              </div>

              <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-[#00D2FF] font-mono my-1">
                {currency} {workingWalletBalance.toFixed(2)}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Direct referrals &amp; royalties. Transfer directly to <strong>Main Wallet</strong> or <strong>P2P Wallet</strong>.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-mono">0% Transfer Fee</span>
              <button
                onClick={() => setActiveTab("wallet-working")}
                className="text-sky-600 dark:text-[#00D2FF] hover:text-sky-700 dark:hover:text-white font-bold font-mono flex items-center gap-1 transition"
              >
                <span>Transfer &rarr; Main / P2P</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FLOATING QUICK-ACTIONS DOCK (Frosted Glass Capsule)
          ========================================================================= */}
      <div className="flex items-center justify-center">
        <div className="glass-dock py-2 px-3 sm:px-6 flex items-center gap-2 sm:gap-4 overflow-x-auto max-w-full shadow-2xl">
          <button
            onClick={() => setActiveTab("recharge")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/15 hover:bg-sky-500 text-sky-600 hover:text-white dark:text-[#00D2FF] dark:hover:text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 font-mono"
          >
            <Wallet className="w-4 h-4" />
            <span>Deposit USDT</span>
          </button>

          <button
            onClick={() => setActiveTab("package-base")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white text-xs font-bold transition-all active:scale-95 shrink-0 font-mono"
          >
            <Zap className="w-4 h-4 text-emerald-500 dark:text-[#00FFA3]" />
            <span>Activate Stake</span>
          </button>

          <button
            onClick={() => setActiveTab("tx-transfer")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white text-xs font-bold transition-all active:scale-95 shrink-0 font-mono"
          >
            <Repeat className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>P2P Transfer</span>
          </button>

          <button
            onClick={() => setActiveTab("tx-withdraw")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 hover:text-white dark:text-[#00FFA3] dark:hover:text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 font-mono"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw ($2 Min)</span>
          </button>

          <button
            onClick={() => setActiveTab("downline-tree")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white text-xs font-bold transition-all active:scale-95 shrink-0 font-mono"
          >
            <Users className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>Genealogy Tree</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          EMBEDDED QUICK ROI & COMPOUNDING SIMULATOR (From index.html)
          ========================================================================= */}
      <div className="glass-card-elevated p-6 sm:p-7 border border-slate-200/80 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500 dark:text-[#00FFA3]" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                Interactive ROI &amp; Compounding Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Simulate new stakes, test 10% Bonus Wallet utility, and calculate 35-day doubling math.
            </p>
          </div>

          <div className="flex gap-2">
            {[20, 100, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCalcStake(amt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  calcStake === amt
                    ? "bg-[#00FFA3] text-slate-950 font-black"
                    : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Stake Slider */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300 font-bold">Simulated Capital Stake:</span>
              <span className="text-xl font-black text-emerald-600 dark:text-[#00FFA3]">${calcStake} USDT</span>
            </div>

            <input
              type="range"
              min="2"
              max="5000"
              step="2"
              value={calcStake}
              onChange={(e) => setCalcStake(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00FFA3]"
            />

            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>Min $2</span>
              <span>$500</span>
              <span>$1,000</span>
              <span>Max $5,000</span>
            </div>
          </div>

          {/* Quick Simulation Output Cards */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-3 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">10% BONUS</p>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-1">-${simBonusSubsidy}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Pay ${simNetUsdt}</p>
            </div>

            <div className="glass-panel p-3 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">2X POOL</p>
              <p className="text-base font-bold text-sky-600 dark:text-[#00D2FF] font-mono mt-1">${simPool}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Allocation</p>
            </div>

            <div className="glass-panel p-3 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">DAY 1 ROI</p>
              <p className="text-base font-bold text-emerald-600 dark:text-[#00FFA3] font-mono mt-1">${simDay1Roi}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">4% on Stake</p>
            </div>

            <div className="glass-panel p-3 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">35-DAY 2X</p>
              <p className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">${sim35DaysDoubled}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Doubling Math</p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MILITARY-GRADE MILESTONE RANK PROGRESSION (Slide 18 & 19 - 50:50 Ratio)
          ========================================================================= */}
      <div className="glass-card-elevated p-6 border border-slate-200/80 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                Milestone Rank Rewards (Ranks 1 - 10)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Cumulative team turnover &bull; 50:50 Strong &amp; Weak leg ratio &bull; Instant Cash OR Luxury Asset
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("income-rewards")}
            className="glass-pill text-xs font-semibold text-sky-600 dark:text-[#00D2FF] hover:text-sky-700 dark:hover:text-white font-mono"
          >
            All 10 Ranks &rarr;
          </button>
        </div>

        {/* Current vs Next Rank Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              CURRENT RANK
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1 flex items-center gap-2">
              <span>{currentRank.icon}</span>
              <span>{currentRank.title}</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-[#00FFA3] font-mono mt-1">
              Active Leadership Tier
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              NEXT MILESTONE: {nextRank.title}
            </span>
            <div className="text-xl font-black text-sky-600 dark:text-[#00D2FF] font-mono mt-1">
              ${nextRank.teamVolume.toLocaleString()} Turnover
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1">
              Option A: <strong className="text-emerald-600 dark:text-[#00FFA3]">${nextRank.cashBonus} USDT</strong> | Option B: {nextRank.rewardGift}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              50:50 LEG VOLUME RATIO
            </span>
            <div className="flex justify-between items-baseline text-xs font-mono mt-1">
              <span className="text-slate-700 dark:text-slate-300">Strong Leg: <strong>${strongLegVolume}</strong></span>
              <span className="text-slate-700 dark:text-slate-300">Weak Leg: <strong>${weakLegVolume}</strong></span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-sky-400"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          NETWORK ROYALTY MATRIX (10-Level Daily Downline ROI - Slide 16 & 17)
          ========================================================================= */}
      <div className="glass-card-elevated p-6 border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-sky-500 dark:text-[#00D2FF]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-mono">
              10-Level Daily Team Royalty Status
            </h3>
          </div>
          <span className="text-xs text-emerald-600 dark:text-[#00FFA3] font-mono font-bold">
            {activeDirectCount} Active Directs Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">LEVEL 1</span>
            <span className="text-base font-bold text-emerald-600 dark:text-[#00FFA3]">10% Daily</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">1 Direct Req.</span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">LEVEL 2</span>
            <span className="text-base font-bold text-sky-600 dark:text-[#00D2FF]">5% Daily</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">2 Directs Req.</span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">LEVELS 3 - 5</span>
            <span className="text-base font-bold text-sky-500 dark:text-sky-400">2% Daily</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">3 - 5 Directs</span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">LEVELS 6 - 9</span>
            <span className="text-base font-bold text-indigo-500 dark:text-indigo-400">1% Daily</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">6 - 9 Directs</span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-bold">LEVEL 10</span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">1% Daily</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">10 Directs (Full)</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-6 pb-2 text-center text-xs text-slate-500 font-medium font-mono">
        &copy; 2026 Crypto Finance Protocol. Swiss Quantitative Ecosystem &bull; BEP-20 Architecture &bull; Crypto Valley Tower, Zug, Switzerland.
      </footer>
    </div>
  );
}
