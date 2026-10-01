"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, DollarSign, Calculator as CalcIcon, RefreshCw, Layers, Lock, ShieldCheck } from "lucide-react";

export function Calculator() {
  const [calcAmount, setCalcAmount] = useState<number>(100);

  const presets = [2, 20, 50, 100, 250, 500, 1000, 2500, 5000];

  // Mathematical formulas strictly from Slides 06, 10, 11, 12, 13 & 14
  const bonusDiscount = calcAmount * 0.10; // 10% Bonus Utility
  const externalUsdt = calcAmount * 0.90; // 90% External USDT
  const allocationPool = calcAmount * 2.0; // 2X Contract Allocation Pool
  const day1Payout = allocationPool * 0.02; // 2.00% of 2X Pool = 4.00% Daily on Stake
  const day2Payout = (allocationPool - day1Payout) * 0.02;
  const day3Payout = (allocationPool - day1Payout - day2Payout) * 0.02;
  const day4Payout = (allocationPool - day1Payout - day2Payout - day3Payout) * 0.02;

  // 35-Day Compounding Engine: (1.02)^35 ≈ 1.99989
  const compounded35Days = calcAmount * Math.pow(1.02, 35);
  const max4xExtraction = calcAmount * 4.0; // 400% Max Extraction Power

  return (
    <section id="calculator" className="relative z-10 py-20 border-t border-cyan-500/20 bg-[var(--bg-secondary)]/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 font-mono">
            DYNAMIC 4% ROI &bull; 35-DAY COMPOUNDING &bull; SLIDES 10 - 14
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Interactive Yield &amp; Compounding Calculator
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base mt-2 font-medium">
            Simulate your exact daily payouts, 10% bonus utility savings, 2X allocation pool, and 35-day doubling math.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="glass-card-gold p-6 sm:p-10 rounded-3xl shadow-2xl border border-cyan-500/30">
          {/* Preset buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="text-xs font-bold text-[var(--text-muted)] mr-2 flex items-center gap-1 font-mono">
              <CalcIcon className="w-3.5 h-3.5 text-cyan-400" /> Presets:
            </span>
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCalcAmount(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition font-mono ${
                  calcAmount === val
                    ? "crypto-btn text-slate-950 font-black shadow-md"
                    : "bg-inner-panel text-[var(--text-main)] hover:border-cyan-400/50"
                }`}
              >
                ${val} USDT
              </button>
            ))}
          </div>

          {/* Slider input */}
          <div className="mb-10 p-6 rounded-2xl bg-inner-panel border border-cyan-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <label className="text-sm font-bold text-[var(--text-main)] font-mono">
                Selected Capital Stake:
              </label>
              <div className="font-display text-3xl sm:text-4xl font-black text-cyan-400">
                ${calcAmount.toLocaleString()} <span className="text-sm font-bold text-[var(--text-subtle)] font-mono">USDT BEP-20</span>
              </div>
            </div>

            <input
              type="range"
              min="2"
              max="5000"
              step="2"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 transition"
            />
            <div className="flex justify-between text-xs text-[var(--text-subtle)] mt-2 font-mono font-semibold">
              <span>Min: $2</span>
              <span>$100</span>
              <span>$500</span>
              <span>$1,000</span>
              <span>Max: $5,000 USDT</span>
            </div>
          </div>

          {/* 4 Metric Cards Grid strictly following Slides 06, 10 & 13 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* 1: 10% Bonus Utility */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider font-mono">
                10% Bonus Subsidy
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-amber-400 mt-2 font-mono">
                -${bonusDiscount.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-subtle)] mt-1 font-mono">
                External: ${externalUsdt.toFixed(2)} USDT
              </div>
            </div>

            {/* 2: 2X Allocation Pool */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider font-mono">
                2X Contract Pool
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-cyan-400 mt-2 font-mono">
                ${allocationPool.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-subtle)] mt-1 font-mono">
                200% Smart Contract Allocation
              </div>
            </div>

            {/* 3: Day 1 Payout */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider font-mono">
                Day 1 Return (4%)
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono">
                ${day1Payout.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-subtle)] mt-1 font-mono">
                Exact 4.00% Daily on Stake
              </div>
            </div>

            {/* 4: 35-Day Doubled Capital */}
            <div className="glass-card p-5 rounded-2xl text-center">
              <div className="text-xs text-[var(--text-subtle)] font-bold uppercase tracking-wider font-mono">
                35-Day Compounding
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-sky-400 mt-2 font-mono">
                ${compounded35Days.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text-subtle)] mt-1 font-mono">
                2X Principal Doubling (1.02^35)
              </div>
            </div>
          </div>

          {/* Dual Perspective Walkthrough Box (Slide 11) */}
          <div className="p-6 rounded-2xl bg-inner-panel border border-cyan-500/20">
            <h4 className="text-sm font-bold text-[var(--text-main)] mb-3 flex items-center gap-2 font-mono">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Live Walkthrough: Dual Perspective ROI Math (Slide 11)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[var(--border-subtle)]">
                <span className="font-bold text-cyan-400 block mb-1 uppercase font-mono">1. Capital Perspective</span>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  On your <strong>${calcAmount.toFixed(2)} Capital Stake</strong>, daily return starts at <strong>${day1Payout.toFixed(2)} USDT / day</strong>, representing an exact <strong>4.00% Daily ROI</strong>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[var(--border-subtle)]">
                <span className="font-bold text-amber-400 block mb-1 uppercase font-mono">2. 2X Pool Perspective</span>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Smart contract creates a <strong>${allocationPool.toFixed(2)} (2X) Pool</strong> releasing <strong>2.00% daily</strong>: ${allocationPool.toFixed(2)} &times; 2% = <strong>${day1Payout.toFixed(2)} USDT</strong>.
                </p>
              </div>
            </div>

            {/* Daily Decaying Step Breakdown */}
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-slate-900/40">
                <span className="text-[10px] text-[var(--text-subtle)] block">Day 1 Payout</span>
                <span className="font-bold text-emerald-400 text-xs">${day1Payout.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/40">
                <span className="text-[10px] text-[var(--text-subtle)] block">Day 2 Payout</span>
                <span className="font-bold text-emerald-400 text-xs">${day2Payout.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/40">
                <span className="text-[10px] text-[var(--text-subtle)] block">Day 3 Payout</span>
                <span className="font-bold text-emerald-400 text-xs">${day3Payout.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/40">
                <span className="text-[10px] text-[var(--text-subtle)] block">Max 4X Extraction</span>
                <span className="font-bold text-cyan-300 text-xs">${max4xExtraction.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}