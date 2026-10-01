"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles, RefreshCw, Layers, TrendingUp, Lock } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function Packages() {
  const [activeStrategy, setActiveStrategy] = useState<"cashout" | "compounding">("cashout");

  // Audited Stake Benchmark Walkthroughs strictly from Slide 07 & 12
  const benchmarks = [
    {
      stake: 2,
      pool: 4,
      bonusUtility: 0.20,
      usdtRequired: 1.80,
      day1Roi: 0.08,
      duration: "331 Days",
      totalExtracted: 3.999,
      tier: "Min Starter",
      tag: "Zero Barrier",
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
      tier: "Growth Entry",
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
      tier: "Core Standard",
      tag: "Live Walkthrough ★",
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
      tier: "VIP Platinum",
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
    <section id="packages" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 font-mono">
            PROTOCOL ALLOCATION &bull; ZERO PACKAGES &bull; SLIDES 06 - 14
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Dynamic 4% Daily Yield &bull; 2X Pool Protocol
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            No rigid packages. Stake any amount starting from <strong>$2.00 USDT</strong>. Utilize up to <strong>10% from your Bonus Wallet</strong> and unlock an automated <strong>2X Contract Allocation Pool</strong>.
          </p>

          {/* Strategy Toggle */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[var(--bg-card)] border border-cyan-500/30 mt-8 shadow-md">
            <button
              type="button"
              onClick={() => setActiveStrategy("cashout")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeStrategy === "cashout"
                  ? "crypto-btn text-slate-950 shadow-md"
                  : "text-[var(--text-muted)] hover:text-cyan-400"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Dynamic Daily Cashout (4% Daily &bull; 200% Payout)
            </button>
            <button
              type="button"
              onClick={() => setActiveStrategy("compounding")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeStrategy === "compounding"
                  ? "crypto-btn text-slate-950 shadow-md"
                  : "text-[var(--text-muted)] hover:text-cyan-400"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              35-Day Compounding Engine (2X Doubling &bull; 4X Max)
            </button>
          </div>
        </div>

        {/* 10% Bonus Utility Rule Banner (Slide 06) */}
        <div className="glass-card-gold p-6 rounded-3xl mb-12 border border-cyan-500/30 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    Slide 06 Protocol Rule
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    10% Free Subsidy
                  </span>
                </div>
                <h4 className="font-display text-xl font-black text-[var(--text-main)] mt-1">
                  10% Bonus Wallet Utility On Every Stake
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
                  Community sign-up credits ($1.00 Self + $0.40/Level down 10 tiers) fund up to <strong>10% of any ID activation or compounding</strong>. The remaining 90% is funded in external USDT. Zero company bank-runs guaranteed!
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col gap-2 shrink-0 text-center sm:text-right">
              <span className="text-xs text-[var(--text-subtle)] font-mono">Minimum Entry</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">$2.00 USDT</span>
            </div>
          </div>
        </div>

        {/* Strategy Explainer Box */}
        {activeStrategy === "cashout" ? (
          <div className="p-6 rounded-3xl bg-inner-panel border border-cyan-500/20 mb-10 text-xs sm:text-sm text-[var(--text-muted)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>
                <strong>Dynamic 4% Daily Formula:</strong> Capital Stake unlocks an instant 2X Contract Allocation Pool. Daily payout releases 2.00% of remaining pool balance ($100 stake ➔ Day 1 pays $4.00, exact 4.00% daily ROI). Continues until 100% of the 2X pool ($200.00) is extracted!
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono font-bold shrink-0">
              Dual Perspective Math
            </span>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-inner-panel border border-emerald-500/20 mb-10 text-xs sm:text-sm text-[var(--text-muted)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>The 35-Day Compounding Engine:</strong> Reinvesting 2% daily pool returns doubles your principal in exactly 35 days: <code className="text-emerald-400 font-bold">(1.02)^35 ≈ 2.000</code>. At 2X, the <strong>2X Cap Lock Rule</strong> engages: execute 1 withdrawal to resume and unlock up to <strong>~400% (4X) Total Extraction</strong>!
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold shrink-0">
              4X Profit Potential
            </span>
          </div>
        )}

        {/* Audited Benchmark Cards Grid (Slides 07 & 12) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-14">
          {benchmarks.map((b) => (
            <div
              key={b.stake}
              className={`glass-card p-5 rounded-3xl flex flex-col justify-between relative transition duration-200 hover:-translate-y-1 ${
                b.featured ? "border-cyan-400 shadow-lg shadow-cyan-500/15" : "border-cyan-500/30"
              }`}
            >
              {b.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm font-mono">
                  {b.tag}
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    {b.tier}
                  </span>
                  {!b.featured && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-[var(--text-subtle)] font-mono font-semibold">
                      {b.tag}
                    </span>
                  )}
                </div>

                <div className="font-display text-3xl font-black text-[var(--text-main)] mb-1">
                  ${b.stake.toLocaleString()}
                  <span className="text-xs font-semibold text-[var(--text-subtle)] font-mono ml-1">USDT</span>
                </div>

                <div className="p-3 rounded-xl bg-inner-panel border border-[var(--border-subtle)] mb-4 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-subtle)]">Bonus (10%):</span>
                    <span className="font-mono font-bold text-amber-400">-${b.bonusUtility.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-subtle)]">External USDT:</span>
                    <span className="font-mono font-bold text-cyan-400">${b.usdtRequired.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-[var(--border-subtle)] pt-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">2X Pool Unlocked:</span>
                    <span className="font-mono font-bold text-cyan-400">${b.pool.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Day 1 Payout (4%):</span>
                    <span className="font-mono font-bold text-emerald-400">${b.day1Roi.toFixed(2)}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Active Tenure:</span>
                    <span className="font-mono font-bold text-[var(--text-main)]">{b.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Total Extracted:</span>
                    <span className="font-mono font-bold text-cyan-300">${b.totalExtracted.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  b.featured
                    ? "crypto-btn text-slate-950 font-black shadow-md"
                    : "crypto-btn-secondary"
                }`}
              >
                Stake ${b.stake} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Highlights & Rules Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-center text-xs">
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-cyan-500/20">
            <span className="font-bold text-cyan-400 block mb-1">Zero Lock On Earnings</span>
            <span className="text-[var(--text-subtle)]">ROI and Working Wallets are 100% withdrawable with minimum $2.00 cashout.</span>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-cyan-500/20">
            <span className="font-bold text-cyan-400 block mb-1">Free Internal P2P</span>
            <span className="text-[var(--text-subtle)]">Instant 0% fee peer-to-peer transfers from Working Wallet to any member.</span>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-cyan-500/20">
            <span className="font-bold text-cyan-400 block mb-1">Triple-Isolated Solvency</span>
            <span className="text-[var(--text-subtle)]">Non-withdrawable Bonus Wallet ensures permanent company liquidity protection.</span>
          </div>
        </div>
      </div>
    </section>
  );
}