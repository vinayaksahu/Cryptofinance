"use client";

import React from "react";
import { Wallet, Coins, ArrowDownLeft, ArrowUpRight, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";

export function BalanceCards({ user }: { user: any }) {
  const fundBal = Number(user?.fundBalance || 0);
  const incomeBal = Number(user?.incomeBalance || 0);
  const totalWithdrawn = Number(user?.totalWithdrawn || 0);
  const fdLocked = Number(user?.fdLockedBalance || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Available Fund Card (Glassmorphism with layered sheets) */}
      <div className="relative group">
        {/* Floating Stack Sheet Behind */}
        <div className="absolute inset-0 bg-sky-500/10 rounded-[28px] translate-x-1.5 translate-y-1.5 blur-[2px] transition-transform group-hover:translate-y-2 pointer-events-none" />
        
        <div className="relative glass-card-elevated p-5 sm:p-6 overflow-hidden flex flex-col justify-between h-full">
          {/* Top Row: Tracked Micro-Label & Status Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              FUND WALLET
            </span>
            <span className="glass-pill text-[10px] font-bold text-sky-600 dark:text-sky-400 border-sky-400/30 bg-sky-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
              USDT (BEP-20)
            </span>
          </div>

          {/* Value Display */}
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
              <span>${fundBal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Available for package recharge
            </p>
          </div>

          {/* Bottom Accent Decorator with Neon Curve & Floating Icon */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Instant Deposit Ready</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-sky-500/15 dark:bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-300 shadow-sm shadow-sky-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Available Income (Sales & Yield) */}
      <div className="relative group">
        {/* Floating Stack Sheet Behind */}
        <div className="absolute inset-0 bg-emerald-500/10 rounded-[28px] translate-x-1.5 translate-y-1.5 blur-[2px] transition-transform group-hover:translate-y-2 pointer-events-none" />

        <div className="relative glass-card-elevated p-5 sm:p-6 overflow-hidden flex flex-col justify-between h-full">
          {/* Top Row: Tracked Micro-Label & Growth Pill */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              SALES & YIELD
            </span>
            <span className="glass-pill text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-400/30 bg-emerald-500/15">
              <span>+4.0%</span>
              <span className="text-[10px]">↗</span>
            </span>
          </div>

          {/* Value Display */}
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ${incomeBal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Net Withdrawable Balance
            </p>
          </div>

          {/* Bottom Accent Decorator */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily ROI & Royalty</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shadow-sm shadow-emerald-500/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. FD Staking Vault */}
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-500/10 rounded-[28px] translate-x-1.5 translate-y-1.5 blur-[2px] transition-transform group-hover:translate-y-2 pointer-events-none" />

        <div className="relative glass-card-elevated p-5 sm:p-6 overflow-hidden flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              STAKING VAULT
            </span>
            <span className="glass-pill text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border-indigo-400/30 bg-indigo-500/10">
              35-Day Lock
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ${fdLocked.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              2X Compounding Principal
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Double Asset Guarantee</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-sm shadow-indigo-500/20">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Total Withdrawn */}
      <div className="relative group">
        <div className="absolute inset-0 bg-purple-500/10 rounded-[28px] translate-x-1.5 translate-y-1.5 blur-[2px] transition-transform group-hover:translate-y-2 pointer-events-none" />

        <div className="relative glass-card-elevated p-5 sm:p-6 overflow-hidden flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              TOTAL WITHDRAWN
            </span>
            <span className="glass-pill text-[10px] font-bold text-purple-600 dark:text-purple-400 border-purple-400/30 bg-purple-500/10">
              Dispatched
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ${totalWithdrawn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Sent to personal wallet
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>BEP-20 Processed</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-500/15 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-sm shadow-purple-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}