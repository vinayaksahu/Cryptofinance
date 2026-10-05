"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, ChevronRight, Zap } from "lucide-react";

interface MemberBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
}

export function MemberBottomNav({ activeTab, setActiveTab, user }: MemberBottomNavProps) {
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rewardWon, setRewardWon] = useState<string | null>(null);

  // Check which tab group is currently active
  const isHome = activeTab === "dashboard";
  const isActivity = activeTab === "joining-bonus" || activeTab === "milestones";
  const isPromotion = activeTab.startsWith("downline-");
  const isAccount = activeTab.startsWith("wallet") || activeTab === "wallets-hub";

  const handleCenterAction = () => {
    setSpinModalOpen(true);
  };

  const handleSpinGo = () => {
    if (spinning) return;
    setSpinning(true);
    setRewardWon(null);
    setTimeout(() => {
      setSpinning(false);
      setRewardWon("$500 Yield Allocation");
    }, 2400);
  };

  return (
    <>
      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION DOCK (Exact Match to Uploaded Images)
          Image 1 (Dark Mode): Charcoal background, Golden/Amber active accents
          Image 2 (Light Mode): Pure white background, Coral/Rose Red active accents
          ========================================================================= */}
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
            onClick={() => setActiveTab("joining-bonus")}
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
              {/* Red notification dot from screenshot */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#1a1b1e]" />
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-0.5">
              Activity
            </span>
          </button>

          {/* 3. CENTER HERO WHEEL BUTTON ("Get $500" / "GO") */}
          <div className="relative -top-4 sm:-top-5 flex-1 flex flex-col items-center justify-center pointer-events-auto">
            <button
              type="button"
              onClick={handleCenterAction}
              className="group relative flex flex-col items-center cursor-pointer focus:outline-none select-none transition-transform active:scale-95"
              aria-label="Get $500 Reward Wheel"
            >
              {/* Outer Golden/Red Glow Aura */}
              <div className="absolute -inset-1 rounded-t-full bg-gradient-to-t from-amber-500/20 via-yellow-400/30 to-amber-500/40 dark:from-amber-500/30 dark:to-yellow-300/40 blur-sm pointer-events-none" />

              {/* Semicircular Wheel Arch Graphic */}
              <div className="relative w-16 h-10 sm:w-18 sm:h-11 overflow-hidden flex items-end justify-center rounded-t-full border-2 border-b-0 border-amber-400 dark:border-amber-400/90 shadow-md">
                {/* Wheel Ray Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 dark:from-yellow-400 dark:via-amber-500 dark:to-amber-600 flex items-center justify-center">
                  {/* Subtle Wheel Radiating Segments SVG */}
                  <svg className="w-full h-full opacity-35" viewBox="0 0 100 50">
                    <polygon points="50,50 0,0 25,0" fill="#ffffff" />
                    <polygon points="50,50 25,0 50,0" fill="#f59e0b" />
                    <polygon points="50,50 50,0 75,0" fill="#ffffff" />
                    <polygon points="50,50 75,0 100,0" fill="#f59e0b" />
                  </svg>
                </div>

                {/* Center "GO" Button Hub */}
                <div className="relative -bottom-1 z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-red-500 to-amber-500 border-2 border-white dark:border-amber-200 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-[11px] font-black tracking-tight text-white drop-shadow-sm font-sans">
                    GO
                  </span>
                </div>
              </div>

              {/* Label below wheel */}
              <span className="text-[11px] font-black tracking-tight mt-0.5 text-rose-500 dark:text-amber-400 drop-shadow-sm whitespace-nowrap">
                Get $500
              </span>
            </button>
          </div>

          {/* 4. PROMOTION TAB */}
          <button
            type="button"
            onClick={() => setActiveTab("downline-direct")}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
              isPromotion
                ? "text-rose-500 dark:text-[#d4a359] font-bold"
                : "text-slate-400 dark:text-[#80838d] hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <div className="relative">
              {/* Money Sack / Dollar Bag Icon from screenshot */}
              <svg
                className={`w-6 h-6 transition-transform ${isPromotion ? "scale-110" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={isPromotion ? "2.2" : "1.8"}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4c-2.5 0-4 1.5-4 2.5 0 .5.5 1.5 2 2h4c1.5-.5 2-1.5 2-2 0-1-1.5-2.5-4-2.5z" />
                <path d="M6.5 8.5c-1.5 2-2.5 4.5-2.5 7.5 0 3.5 3.5 6 8 6s8-2.5 8-6c0-3-1-5.5-2.5-7.5" />
                <path d="M12 11.5v5" />
                <path d="M10 13.5a1.5 1.5 0 013 0c0 1-1 1-2 1.5a1.5 1.5 0 000 3h2" />
              </svg>
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-0.5">
              Promotion
            </span>
          </button>

          {/* 5. ACCOUNT TAB (Active in screenshot with smile circle) */}
          <button
            type="button"
            onClick={() => setActiveTab("wallets-hub")}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
              isAccount
                ? "text-rose-500 dark:text-[#d4a359] font-bold"
                : "text-slate-400 dark:text-[#80838d] hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <div className="relative">
              {/* Smiling face outline avatar icon from screenshot */}
              <svg
                className={`w-6 h-6 transition-transform ${isAccount ? "scale-110" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={isAccount ? "2.2" : "1.8"}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                {/* Winking/smiling curve line inside */}
                <path d="M8 13.5c1 1.5 2.5 2 4 2s3-.5 4-2" />
                <circle cx="9" cy="9.5" r="1" fill="currentColor" />
                <circle cx="15" cy="9.5" r="1" fill="currentColor" />
              </svg>
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-0.5">
              Account
            </span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          INTERACTIVE "GET $500" REWARD WHEEL POPUP (Gamified Experience)
          ========================================================================= */}
      {spinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#1a1b1e] border border-slate-200 dark:border-[#2a2b30] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white overflow-hidden text-center">
            {/* Header / Close */}
            <button
              onClick={() => setSpinModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing wheel header */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fortune Lucky Wheel</span>
            </div>

            <h3 className="text-xl font-black tracking-tight">
              Spin &amp; Claim <span className="text-rose-500 dark:text-amber-400">$500 Package</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Unlock daily 2.00% quantitative ROI yield and contract pool allocation.
            </p>

            {/* Interactive Spinning Wheel Visual */}
            <div className="my-6 relative flex items-center justify-center">
              <div
                className={`relative w-44 h-44 rounded-full border-4 border-amber-400 dark:border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-1000 ${
                  spinning ? "animate-spin" : ""
                }`}
                style={{
                  background:
                    "conic-gradient(#f59e0b 0deg 45deg, #fbbf24 45deg 90deg, #f59e0b 90deg 135deg, #fbbf24 135deg 180deg, #f59e0b 180deg 225deg, #fbbf24 225deg 270deg, #f59e0b 270deg 315deg, #fbbf24 315deg 360deg)",
                }}
              >
                {/* Inner Ring */}
                <div className="w-32 h-32 rounded-full border-2 border-white/60 dark:border-white/30 flex items-center justify-center">
                  <span className="text-white font-black text-xs drop-shadow uppercase tracking-wider">
                    $500 POOL
                  </span>
                </div>
              </div>

              {/* Center GO Push Button */}
              <button
                type="button"
                onClick={handleSpinGo}
                disabled={spinning}
                className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-red-500 to-amber-500 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                {spinning ? (
                  <Zap className="w-5 h-5 animate-bounce" />
                ) : (
                  <span>GO</span>
                )}
              </button>
            </div>

            {/* Outcome Display or Action */}
            {rewardWon ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-4 animate-in zoom-in-90 duration-200">
                <div className="flex items-center justify-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Congratulations! You Unlocked:</span>
                </div>
                <p className="text-base font-black mt-0.5 text-foreground">{rewardWon}</p>
                <button
                  onClick={() => {
                    setSpinModalOpen(false);
                    setActiveTab("activation");
                  }}
                  className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Activate Stake Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSpinModalOpen(false);
                    setActiveTab("recharge");
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2a2b30] bg-slate-100 dark:bg-[#232429] text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-[#2c2d34] transition-colors"
                >
                  Deposit USDT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpinModalOpen(false);
                    setActiveTab("activation");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:bg-primary/90 transition-all"
                >
                  Stake $500
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
