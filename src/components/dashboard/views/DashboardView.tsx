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
  Wallet,
  ChevronRight,
  Lock,
  Gift,
  Award,
  RefreshCw,
  Sliders,
  DollarSign,
  PieChart,
  CheckCircle2,
  Bell,
  Ticket,
  FileText,
  Crown,
  History,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { DayByDayLedger } from "@/components/dashboard/DayByDayLedger";

interface DashboardViewProps {
  user: any;
  setActiveTab: (tab: string) => void;
  onRefresh?: () => void;
}

export function DashboardView({ user, setActiveTab, onRefresh }: DashboardViewProps) {
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
  const totalCapLimit = allocationPoolTotal;
  const day1Payout = +(allocationPoolTotal * 0.02).toFixed(2); // 2.00% daily from 2X pool = 4% on capital

  // 3-Wallet Balances strictly from Slide 04:
  const wallets = user?.wallets || {};
  const b = user?.incomeBreakdown || {};
  const bonusWalletBalance = Number(wallets.bonusBalance ?? user?.bonusBalance ?? user?.lockedBonus ?? b.joiningBonus ?? 1.0);
  const roiWalletBalance = Number(wallets.roiBalance ?? user?.roiBalance ?? b.basicTodayRoi ?? 0);
  const workingWalletBalance = Number(wallets.workingBalance ?? user?.workingBalance ?? user?.incomeBalance ?? 0);
  const p2pWalletBalance = Number(wallets.p2pBalance ?? user?.p2pBalance ?? user?.fundBalance ?? 0);
  const mainWalletBalance = Number(wallets.mainBalance ?? user?.mainBalance ?? 0);

  const totalRoiEarnings = Number(b.basicTotalRoi ?? b.totalRoi ?? roiWalletBalance);
  const totalReferralIncome = Number(b.directReferral ?? b.referralBonus ?? 0) + Number(b.basicLevelIncome ?? b.levelIncome ?? 0);

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
          MOBILE-SPECIFIC HERO HEADER & WALLET DASHBOARD (Matching Uploaded Images)
          Image 1 (Dark Mode): Charcoal card + Golden Amber active accents
          Image 2 (Light Mode): Vibrant Coral/Rose Red gradient + White cards
          ========================================================================= */}
      <div className="block lg:hidden space-y-4">
        {/* User Profile Bar */}
        <div className="rounded-3xl p-5 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent dark:from-amber-500/20 dark:via-[#1e1f23] dark:to-[#17181c] light:from-rose-500 light:to-red-400 border border-amber-500/30 dark:border-[#2a2b30] shadow-sm">
          <div className="flex items-center gap-3.5">
            {/* Avatar Circle */}
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 dark:from-amber-600 dark:to-yellow-400 p-0.5 shadow-md shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-900 dark:bg-black flex items-center justify-center text-amber-300 font-black text-xl">
                {(user?.fullName || "M")[0]}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-black tracking-tight uppercase shadow">
                VIP 1
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold text-foreground truncate tracking-tight">
                {user?.fullName || "MEMBER"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground font-mono">
                <span>UID | {customId}</span>
                <button
                  type="button"
                  onClick={copyReferral}
                  className="text-amber-500 dark:text-amber-400 hover:text-amber-300"
                  title="Copy UID / Referral"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Last login: {joinDateStr}
              </p>
            </div>
          </div>
        </div>

        {/* Total Balance Card with Enter Wallet & 4 Quick Actions */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground block">
                Total balance
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-foreground font-mono tracking-tight">
                  {currency} {(mainWalletBalance + p2pWalletBalance).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => onRefresh?.()}
                  className="text-muted-foreground hover:text-foreground transition-transform active:rotate-180"
                  title="Refresh Balance"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Enter Wallet Pill Button */}
            <button
              type="button"
              onClick={() => setActiveTab("wallets-hub")}
              className="px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Enter wallet
            </button>
          </div>

          {/* 4 Quick Actions (ARWallet, Deposit, Withdraw, VIP) */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
            {/* 1. ARWallet / P2P */}
            <button
              type="button"
              onClick={() => setActiveTab("wallets-p2p")}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-muted/60 transition-colors text-center cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground tracking-tight">
                P2P Wallet
              </span>
            </button>

            {/* 2. Deposit */}
            <button
              type="button"
              onClick={() => setActiveTab("recharge")}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-muted/60 transition-colors text-center cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-sm">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground tracking-tight">
                Deposit
              </span>
            </button>

            {/* 3. Withdraw */}
            <button
              type="button"
              onClick={() => setActiveTab("wallets-withdraw")}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-muted/60 transition-colors text-center cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground tracking-tight">
                Withdraw
              </span>
            </button>

            {/* 4. VIP / Stake */}
            <button
              type="button"
              onClick={() => setActiveTab("activation")}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-muted/60 transition-colors text-center cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-sm">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground tracking-tight">
                VIP Stake
              </span>
            </button>
          </div>
        </div>

        {/* 2x2 Grid: History & Ledger Cards matching screenshot */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("activation")}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border hover:bg-muted/60 text-left transition-all shadow-sm cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight truncate">Yield History</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">My daily contracts</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("report-statement")}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border hover:bg-muted/60 text-left transition-all shadow-sm cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight truncate">Transactions</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Account ledger</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("report-fund-wallet")}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border hover:bg-muted/60 text-left transition-all shadow-sm cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight truncate">Deposit Log</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">My deposit history</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("report-income-wallet")}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border hover:bg-muted/60 text-left transition-all shadow-sm cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight truncate">Withdraw Log</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">My payout history</p>
            </div>
          </button>
        </div>

        {/* List Menu from Screenshot (Notification, Gifts, Coupons, Statistics) */}
        <div className="rounded-3xl border border-border bg-card divide-y divide-border overflow-hidden shadow-sm">
          {/* Notification item */}
          <button
            type="button"
            onClick={() => setActiveTab("support")}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground">Notification</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                30
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>

          {/* Gifts item */}
          <button
            type="button"
            onClick={() => setActiveTab("joining-bonus")}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
                <Gift className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground">Gifts &amp; Welcome Bonus</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Coupons item */}
          <button
            type="button"
            onClick={() => setActiveTab("recharge")}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground">My Top-Up Coupons</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Statistics item */}
          <button
            type="button"
            onClick={() => setActiveTab("milestones")}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-foreground">Yield &amp; Community Statistics</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP WELCOME HEADER (Shown on lg: screens)
          ========================================================================= */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.fullName || "Member"}!
          </h1>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500 font-mono">
            {user?.status === "ACTIVE" || activeStake > 0 ? "Active Protocol ID" : "Pending Stake"}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Continue your quantitative yield journey, review daily ROI returns, and track affiliate earnings.
        </p>
      </div>

      {/* =========================================================================
          4-CARD QUICK STATS GRID (Matching SuperWarrior30 Images 3 & 4)
          ========================================================================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Stake */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">ACTIVE STAKE</span>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
            {currency} {activeStake.toFixed(2)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            2X Pool Cap: {currency} {totalCapLimit.toFixed(2)}
          </p>
        </div>

        {/* Card 2: Available Balance */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">AVAILABLE BALANCE</span>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
            {currency} {p2pWalletBalance.toFixed(2)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Secondary Deposit & Activation Wallet
          </p>
        </div>

        {/* Card 3: Total Earned */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">TOTAL EARNED</span>
            <Activity className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
            {currency} {(totalRoiEarnings + totalReferralIncome).toFixed(2)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            ROI: {currency} {totalRoiEarnings.toFixed(2)} &bull; Royalties: {currency} {totalReferralIncome.toFixed(2)}
          </p>
        </div>

        {/* Card 4: Total Community */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">TOTAL COMMUNITY</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
            {totalTeamCount}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {activeTeamCount} Active Staked Members
          </p>
        </div>
      </div>

      {/* =========================================================================
          REFERRAL WELCOME BONUS COUPON SECTION (Matching SuperWarrior30 Images 1 & 2)
          ========================================================================= */}
      <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-inner">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Referral Welcome Bonus & Invite Station
                </h3>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-500">
                  10% Direct
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share your referral link with new members to earn 10% direct sponsor bonus + 10-level daily passive royalties.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            UID: {customId}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Your Referral Coupon Code / Invitation Link:
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="border border-dashed border-primary/50 bg-primary/10 rounded-xl px-4 py-2.5 font-mono text-xs sm:text-sm font-bold text-primary flex items-center justify-between gap-3 flex-1 overflow-hidden">
              <span className="truncate">{referralUrl}</span>
            </div>
            <button
              onClick={copyReferral}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join Crypto Finance quantitative protocol: ${referralUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MULTI-WALLET ENGINE SECTION (Colored Cards matching SuperWarrior30 Images 1 & 2)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight uppercase font-mono">
              The Protocol Wallet Engine
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Multi-Wallet Isolation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Bonus Wallet (Amber) */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                  Bonus Wallet
                </span>
                <Gift className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
                {currency} {bonusWalletBalance.toFixed(2)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Holds $1.00 Self + $0.40/Level bonuses. Subsidizes up to <strong>10% of any ID activation or compounding</strong>!
              </p>
            </div>
            <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground font-mono">10% Subsidy</span>
              <button
                onClick={() => setActiveTab("stake-activate")}
                className="text-amber-500 hover:text-amber-400 font-bold font-mono flex items-center gap-1 transition cursor-pointer"
              >
                <span>Use for Stake &rarr;</span>
              </button>
            </div>
          </div>

          {/* Card 2: ROI Wallet (Emerald) */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">
                  ROI Wallet
                </span>
                <Zap className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-500 font-mono">
                {currency} {roiWalletBalance.toFixed(2)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Automated 4% daily returns from 2X pool. Transfer directly to <strong>Main Wallet</strong> or <strong>Secondary Wallet</strong>.
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground font-mono">0% Fee</span>
              <button
                onClick={() => setActiveTab("wallet-roi")}
                className="text-emerald-500 hover:text-emerald-400 font-bold font-mono flex items-center gap-1 transition cursor-pointer"
              >
                <span>Transfer &rarr;</span>
              </button>
            </div>
          </div>

          {/* Card 3: Working Wallet (Sky) */}
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">
                  Working Wallet
                </span>
                <Wallet className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-sky-500 font-mono">
                {currency} {workingWalletBalance.toFixed(2)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Direct referrals &amp; royalties. Transfer directly to <strong>Main Wallet</strong> or <strong>Secondary Wallet</strong>.
              </p>
            </div>
            <div className="pt-2 border-t border-sky-500/20 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground font-mono">0% Fee</span>
              <button
                onClick={() => setActiveTab("wallet-working")}
                className="text-sky-500 hover:text-sky-400 font-bold font-mono flex items-center gap-1 transition cursor-pointer"
              >
                <span>Transfer &rarr;</span>
              </button>
            </div>
          </div>

          {/* Card 4: Secondary Wallet (Neutral Card) */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-2 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Secondary Wallet
                </span>
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                {currency} {p2pWalletBalance.toFixed(2)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Deposit request funds credit here. Use to activate your own stake, activate any member ID, or send P2P transfers.
              </p>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <button
                onClick={() => setActiveTab("recharge")}
                className="text-primary hover:underline font-bold font-mono flex items-center gap-1 transition cursor-pointer"
              >
                <span>+ Deposit</span>
              </button>
              <button
                onClick={() => setActiveTab("stake-activate")}
                className="text-emerald-500 hover:underline font-bold font-mono flex items-center gap-1 transition cursor-pointer"
              >
                <span>Activate ID &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FLOATING QUICK-ACTIONS DOCK
          ========================================================================= */}
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-card border border-border py-2 px-4 sm:px-6 flex items-center gap-3 sm:gap-4 overflow-x-auto max-w-full shadow-sm">
          <button
            onClick={() => setActiveTab("recharge")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Deposit USDT</span>
          </button>

          <button
            onClick={() => setActiveTab("package-base")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Activate Stake</span>
          </button>

          <button
            onClick={() => setActiveTab("downline-tree")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>Genealogy Tree</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          📋 DAY-BY-DAY LEDGER WITH GST AUTO-CLAIM TIMER (Slides 10-12 & index.html)
          ========================================================================= */}
      <DayByDayLedger user={user} onRefresh={onRefresh} onNavigateTab={setActiveTab} />

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
          <div className="p-4 rounded-2xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
              CURRENT RANK
            </span>
            <div className="text-xl font-black text-foreground font-mono mt-1 flex items-center gap-2">
              <span>{currentRank.icon}</span>
              <span>{currentRank.title}</span>
            </div>
            <p className="text-xs text-primary font-mono mt-1 font-bold">
              Active Leadership Tier
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
              NEXT MILESTONE: {nextRank.title}
            </span>
            <div className="text-xl font-black text-foreground font-mono mt-1">
              ${nextRank.teamVolume.toLocaleString()} Turnover
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Option A: <strong className="text-primary font-bold">${nextRank.cashBonus} USDT</strong> | Option B: {nextRank.rewardGift}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
              50:50 LEG VOLUME RATIO
            </span>
            <div className="flex justify-between items-baseline text-xs font-mono mt-1">
              <span className="text-muted-foreground">Strong Leg: <strong className="text-foreground">${strongLegVolume}</strong></span>
              <span className="text-muted-foreground">Weak Leg: <strong className="text-foreground">${weakLegVolume}</strong></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          NETWORK ROYALTY MATRIX (10-Level Daily Downline ROI - Slide 16 & 17)
          ========================================================================= */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground tracking-tight font-mono">
              10-Level Daily Team Royalty Status
            </h3>
          </div>
          <span className="text-xs text-primary font-mono font-bold">
            {activeDirectCount} Active Directs Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
            <span className="text-[10px] text-muted-foreground block">LEVEL 1</span>
            <span className="text-base font-bold text-primary">10% Daily</span>
            <span className="text-[10px] text-muted-foreground block mt-1">1 Direct Req.</span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
            <span className="text-[10px] text-muted-foreground block">LEVEL 2</span>
            <span className="text-base font-bold text-primary">5% Daily</span>
            <span className="text-[10px] text-muted-foreground block mt-1">2 Directs Req.</span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
            <span className="text-[10px] text-muted-foreground block">LEVELS 3 - 5</span>
            <span className="text-base font-bold text-primary">2% Daily</span>
            <span className="text-[10px] text-muted-foreground block mt-1">3 - 5 Directs</span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
            <span className="text-[10px] text-muted-foreground block">LEVELS 6 - 9</span>
            <span className="text-base font-bold text-primary">1% Daily</span>
            <span className="text-[10px] text-muted-foreground block mt-1">6 - 9 Directs</span>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-primary block font-bold">LEVEL 10</span>
            <span className="text-base font-bold text-primary">1% Daily</span>
            <span className="text-[10px] text-muted-foreground block mt-1">10 Directs (Full)</span>
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
