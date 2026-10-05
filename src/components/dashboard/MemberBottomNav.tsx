"use client";

import React from "react";
import { Zap, Users, Wallet } from "lucide-react";

interface MemberBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
}

export function MemberBottomNav({ activeTab, setActiveTab }: MemberBottomNavProps) {
  // Check which tab group is currently active
  const isHome = activeTab === "dashboard";
  const isActivity =
    activeTab === "income-bonus" ||
    activeTab === "joining-bonus" ||
    activeTab === "income-rewards" ||
    activeTab === "milestones" ||
    activeTab.startsWith("income-");
  const isStake =
    activeTab === "stake-activate" ||
    activeTab === "package-base" ||
    activeTab === "package-fd" ||
    activeTab === "activation" ||
    activeTab === "activate-stake";
  const isTeam =
    activeTab.startsWith("downline-") ||
    activeTab === "promotion" ||
    activeTab === "referral" ||
    activeTab === "team";
  const isWallet =
    activeTab.startsWith("wallet") ||
    activeTab === "wallets-hub" ||
    activeTab === "account";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pointer-events-auto"
    >
      <div className="relative bg-white dark:bg-[#1a1b1e] border-t border-slate-100 dark:border-[#2a2b30] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_35px_rgba(0,0,0,0.6)] rounded-t-3xl px-2 sm:px-4 h-[68px] flex items-center justify-between pb-[env(safe-area-inset-bottom,0px)]">
        {/* 1. HOME TAB */}
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
            isHome
              ? "text-rose-500 dark:text-[#d4a359] font-bold"
              : "text-slate-400 dark:text-[#80838d] hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            {/* Home Icon matching screenshot */}
            <svg
              className={`w-6 h-6 transition-transform ${isHome ? "scale-110" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={isHome ? "2.2" : "1.8"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10.5L12 3l9 7.5" />
              <path d="M5 9v11a1 1 0 001 1h12a1 1 0 001-1V9" />
              <path d="M9 21V12h6v9" />
            </svg>
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">
            Home
          </span>
        </button>

        {/* 2. ACTIVITY TAB (With red notification dot badge) */}
        <button
          type="button"
          onClick={() => setActiveTab("income-bonus")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
            isActivity
              ? "text-rose-500 dark:text-[#d4a359] font-bold"
              : "text-slate-400 dark:text-[#80838d] hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            {/* Shopping bag / Tote icon */}
            <svg
              className={`w-6 h-6 transition-transform ${isActivity ? "scale-110" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={isActivity ? "2.2" : "1.8"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="7" width="16" height="14" rx="3" />
              <path d="M9 7V5a3 3 0 016 0v2" />
              <path d="M10 12a2 2 0 004 0" />
            </svg>
            {/* Red notification dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#1a1b1e]" />
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">
            Activity
          </span>
        </button>

        {/* 3. CENTER HERO STAKE BUTTON (Stake Activation Engine) */}
        <div className="relative -top-4 sm:-top-5 flex-1 flex flex-col items-center justify-center pointer-events-auto">
          <button
            type="button"
            onClick={() => setActiveTab("stake-activate")}
            className="group relative flex flex-col items-center cursor-pointer focus:outline-none select-none transition-transform active:scale-95"
            aria-label="Stake Activation Engine"
          >
            {/* Outer Glowing Aura */}
            <div
              className={`absolute -inset-1 rounded-full ${
                isStake
                  ? "bg-gradient-to-t from-amber-500/40 via-yellow-400/50 to-amber-500/60 dark:from-amber-500/50 dark:to-yellow-300/60 blur-md"
                  : "bg-gradient-to-t from-amber-500/20 via-yellow-400/30 to-amber-500/40 dark:from-amber-500/30 dark:to-yellow-300/40 blur-sm"
              } pointer-events-none`}
            />

            {/* Elevated Central Action Circle */}
            <div
              className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
                isStake
                  ? "bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 border-white dark:border-amber-200 scale-105 shadow-amber-500/50"
                  : "bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 border-white dark:border-amber-400/80 shadow-md group-hover:scale-105"
              }`}
            >
              <Zap className="w-6 h-6 text-white fill-white drop-shadow-sm transition-transform group-hover:scale-110" />
            </div>

            {/* Label below Stake button */}
            <span
              className={`text-[11px] font-bold tracking-tight mt-1 whitespace-nowrap transition-colors ${
                isStake
                  ? "text-rose-500 dark:text-amber-400 font-black drop-shadow-sm"
                  : "text-slate-600 dark:text-[#d4a359]"
              }`}
            >
              Stake
            </span>
          </button>
        </div>

        {/* 4. TEAM TAB (Formerly Promotion) */}
        <button
          type="button"
          onClick={() => setActiveTab("downline-direct")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
            isTeam
              ? "text-rose-500 dark:text-[#d4a359] font-bold"
              : "text-slate-400 dark:text-[#80838d] hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Users
              className={`w-6 h-6 transition-transform ${isTeam ? "scale-110" : ""}`}
              strokeWidth={isTeam ? 2.2 : 1.8}
            />
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">
            Team
          </span>
        </button>

        {/* 5. WALLET TAB (Formerly Account) */}
        <button
          type="button"
          onClick={() => setActiveTab("wallets-internal")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
            isWallet
              ? "text-rose-500 dark:text-[#d4a359] font-bold"
              : "text-slate-400 dark:text-[#80838d] hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Wallet
              className={`w-6 h-6 transition-transform ${isWallet ? "scale-110" : ""}`}
              strokeWidth={isWallet ? 2.2 : 1.8}
            />
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-0.5">
            Wallet
          </span>
        </button>
      </div>
    </nav>
  );
}
