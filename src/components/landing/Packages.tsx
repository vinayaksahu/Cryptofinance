"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles, RefreshCw, Layers, TrendingUp, Lock } from "lucide-react";

export function Packages() {
  const [activeStrategy, setActiveStrategy] = useState<"cashout" | "compounding">("cashout");

  // Audited Stake Benchmark Walkthroughs strictly from Protocol Math
  const benchmarks = [
    {
      stake: 2,
      pool: 4,
      bonusUtility: 0.20,
      usdtRequired: 1.80,
      day1Roi: 0.08,
      duration: "331 Days",
      totalExtracted: 3.999,
      tier: "Starter",
      tag: "Min Entry",
      featured: false,
    },
    {
      stake: 20,
      pool: 40,
      bonusUtility: 2.00,
      usdtRequired: 18.00,
      day1Roi: 0.80,
      duration: "445 Days",
      totalExtracted: 39.995,
      tier: "Growth",
      tag: "Popular",
      featured: false,
    },
    {
      stake: 100,
      pool: 200,
      bonusUtility: 10.00,
      usdtRequired: 90.00,
      day1Roi: 4.00,
      duration: "525 Days",
      totalExtracted: 199.995,
      tier: "Standard",
      tag: "Recommended ★",
      featured: true,
    },
    {
      stake: 1000,
      pool: 2000,
      bonusUtility: 100.00,
      usdtRequired: 900.00,
      day1Roi: 40.00,
      duration: "639 Days",
      totalExtracted: 1999.995,
      tier: "VIP",
      tag: "High Yield",
      featured: false,
    },
    {
      stake: 5000,
      pool: 10000,
      bonusUtility: 500.00,
      usdtRequired: 4500.00,
      day1Roi: 200.00,
      duration: "720 Days",
      totalExtracted: 9999.995,
      tier: "Whale Tier",
      tag: "Institutional",
      featured: true,
    },
  ];

  return (
    <section id="packages" className="relative z-10 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="glass-pill px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-400/25">
            DYNAMIC ALLOCATION &bull; ZERO PACKAGES &bull; PROTOCOL RULES
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">
            Dynamic 4% Daily Yield &bull; 2X Pool Protocol
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mt-3 font-normal">
            No rigid packages. Stake any amount starting from <strong>$2.00 USDT</strong>. Utilize up to <strong>10% from your Bonus Wallet</strong> and unlock an automated <strong>2X Contract Allocation Pool</strong>.
          </p>

          {/* Strategy Toggle */}
          <div className="inline-flex p-1.5 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 mt-8 backdrop-blur-xl shadow-lg">
            <button
              type="button"
              onClick={() => setActiveStrategy("cashout")}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeStrategy === "cashout"
                  ? "crypto-btn text-white shadow-md shadow-sky-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Dynamic Daily Cashout (4% Daily &bull; 200% Payout)
            </button>
            <button
              type="button"
              onClick={() => setActiveStrategy("compounding")}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeStrategy === "compounding"
                  ? "crypto-btn text-white shadow-md shadow-sky-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              35-Day Compounding Engine (2X Doubling &bull; 4X Max)
            </button>
          </div>
        </div>

        {/* 10% Bonus Utility Rule Banner */}
        <div className="glass-card-elevated p-6 sm:p-7 rounded-[28px] mb-12 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0 shadow-md shadow-sky-500/20">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                    Protocol Utility Rule
                  </span>
                  <span className="glass-pill px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 border-emerald-500/30">
                    10% Free Subsidy
                  </span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  10% Bonus Wallet Utility On Every Stake
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed font-normal">
                  Community sign-up credits ($1.00 Self + $0.40/Level down 10 tiers) fund up to <strong>10% of any ID activation or compounding</strong>. The remaining 90% is funded in external USDT. Zero company bank-runs guaranteed!
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col gap-2 shrink-0 text-center sm:text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Minimum Entry</span>
              <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">$2.00 USDT</span>
            </div>
          </div>
        </div>

        {/* Strategy Explainer Box */}
        {activeStrategy === "cashout" ? (
          <div className="glass-panel p-5 rounded-2xl mb-10 text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-sky-500 dark:text-sky-400 shrink-0" />
              <span>
                <strong>Dynamic 4% Daily Formula:</strong> Capital Stake unlocks an instant 2X Contract Allocation Pool. Daily payout releases 2.00% of remaining pool balance ($100 stake ➔ Day 1 pays $4.00, exact 4.00% daily ROI). Continues until 100% of the 2X pool ($200.00) is extracted!
              </span>
            </div>
            <span className="glass-pill px-3 py-1 text-sky-600 dark:text-sky-400 font-mono font-bold shrink-0">
              Dual Perspective Math
            </span>
          </div>
        ) : (
          <div className="glass-panel p-5 rounded-2xl mb-10 text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>The 35-Day Compounding Engine:</strong> Reinvesting 2% daily pool returns doubles your principal in exactly 35 days: <code className="text-emerald-600 dark:text-emerald-400 font-bold">(1.02)^35 ≈ 2.000</code>. At 2X, the <strong>2X Cap Lock Rule</strong> engages: execute 1 withdrawal to resume and unlock up to <strong>~400% (4X) Total Extraction</strong>!
              </span>
            </div>
            <span className="glass-pill px-3 py-1 text-emerald-600 dark:text-emerald-400 font-mono font-bold shrink-0">
              4X Profit Potential
            </span>
          </div>
        )}

        {/* Audited Benchmark Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-14">
          {benchmarks.map((b) => (
            <div
              key={b.stake}
              className={`glass-card-elevated p-6 flex flex-col justify-between relative transition duration-200 hover:-translate-y-1 ${
                b.featured ? "border-sky-400/50 shadow-xl shadow-sky-500/20" : ""
              }`}
            >
              {b.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                  {b.tag}
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest font-mono">
                    {b.tier}
                  </span>
                  {!b.featured && (
                    <span className="glass-pill text-[9px] px-2 py-0.5 text-slate-500 dark:text-slate-400 font-mono font-semibold">
                      {b.tag}
                    </span>
                  )}
                </div>

                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  ${b.stake.toLocaleString()}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono ml-1">USDT</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/10 mb-4 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Bonus (10%):</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">-${b.bonusUtility.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">External USDT:</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">${b.usdtRequired.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-200/80 dark:border-white/10 pt-3 mb-5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">2X Pool:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">${b.pool.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Day 1 Payout:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${b.day1Roi.toFixed(2)}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Tenure:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{b.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Total Yield:</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-300">${b.totalExtracted.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  b.featured
                    ? "crypto-btn text-white shadow-md shadow-sky-500/30"
                    : "glass-btn-secondary"
                }`}
              >
                Stake ${b.stake} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Highlights & Rules Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-center text-xs">
          <div className="glass-panel p-5">
            <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">Zero Lock On Earnings</span>
            <span className="text-slate-500 dark:text-slate-400">ROI and Working Wallets are 100% withdrawable with minimum $2.00 cashout.</span>
          </div>
          <div className="glass-panel p-5">
            <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">Free Internal P2P</span>
            <span className="text-slate-500 dark:text-slate-400">Instant 0% fee peer-to-peer transfers from Working Wallet to any member.</span>
          </div>
          <div className="glass-panel p-5">
            <span className="font-bold text-sky-600 dark:text-sky-400 block mb-1">Triple-Isolated Solvency</span>
            <span className="text-slate-500 dark:text-slate-400">Non-withdrawable Bonus Wallet ensures permanent company liquidity protection.</span>
          </div>
        </div>
      </div>
    </section>
  );
}