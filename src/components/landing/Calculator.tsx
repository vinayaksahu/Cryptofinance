"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Sparkles,
  TrendingUp,
  Download,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  HelpCircle,
  RotateCcw,
  Sliders,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

interface SimRow {
  day: number;
  bal: number;
  roi: number;
  action: "W" | "R";
  after: number;
  cumW: number;
  cumR: number;
  capLocked: boolean;
}

export function Calculator() {
  const [capital, setCapital] = useState<number>(100);
  const [bonusInput, setBonusInput] = useState<number>(10);
  const [mode, setMode] = useState<"withdraw" | "reinvest" | "manual">("withdraw");
  const [quickDays, setQuickDays] = useState<number>(10);
  const [manualActions, setManualActions] = useState<Record<number, "W" | "R">>({});
  const [visibleRows, setVisibleRows] = useState<number>(40);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const presets = [2, 20, 50, 100, 250, 500, 1000, 2500, 5000];

  const safeCap = Math.max(2, Number(capital) || 2);
  const pool = safeCap * 2;
  const capBal = pool * 2; // Compounding Peak Balance Cap: 2X of starting pool ($400 on $100 stake)
  const maxPayout = safeCap * 2; // Strict 2X Max Payout Cap of original investment (200% return = $200 on $100 stake)

  const maxBonusUsable = +(safeCap * 0.1).toFixed(2);
  const bonusUsed = Math.min(Number(bonusInput) || 0, maxBonusUsable);
  const netUsdt = +(safeCap - bonusUsed).toFixed(2);

  // When capital or mode changes, reset manual actions appropriately
  const handleSetMode = (newMode: "withdraw" | "reinvest" | "manual") => {
    setMode(newMode);
    if (newMode === "manual") {
      applyQuickSetDays(quickDays);
    }
  };

  const applyQuickSetDays = (days: number) => {
    setQuickDays(days);
    const newActions: Record<number, "W" | "R"> = {};
    let tempBal = pool;
    for (let d = 0; d < 1200; d++) {
      let roi = +(tempBal * 0.02);
      if (d < days && tempBal + roi < capBal) {
        newActions[d] = "R";
        tempBal += roi;
      } else {
        newActions[d] = "W";
        tempBal -= roi;
      }
      if (tempBal <= 0.005) break;
    }
    setManualActions(newActions);
  };

  // Run simulation engine with exact 2X payout capping matching index.html
  const simData: SimRow[] = useMemo(() => {
    const rows: SimRow[] = [];
    let bal = pool;
    let cumW = 0;
    let cumR = 0;
    let hasHitCompCap = false;

    for (let d = 0; d < 1500; d++) {
      if (bal <= 0.005 || cumW >= maxPayout) break;
      let roi = +(bal * 0.02);

      let action: "W" | "R" = "W";
      let capLocked = false;

      if (mode === "withdraw") {
        action = "W";
      } else if (mode === "reinvest") {
        // Compound until 2X pool cap is reached (Day 35), then switch to withdrawal cashout
        if (!hasHitCompCap) {
          if (bal + roi >= capBal) {
            action = "W";
            capLocked = true;
            hasHitCompCap = true;
          } else {
            action = "R";
          }
        } else {
          action = "W";
        }
      } else {
        const userAction = manualActions[d] || "W";
        if (userAction === "R" && bal + roi >= capBal) {
          action = "W";
          capLocked = true;
        } else {
          action = userAction;
        }
      }

      let isLastCappedRoi = false;
      if (action === "W") {
        // Strict 2X Cap rule: cumulative payout cannot exceed 2X of initial stake
        const remainingTo2X = +(maxPayout - cumW);
        if (remainingTo2X <= 0) break;
        if (roi > remainingTo2X) {
          roi = remainingTo2X;
          isLastCappedRoi = true;
        }
      }

      let after = 0;
      if (action === "R") {
        after = +(bal + roi);
        cumR += roi;
      } else {
        after = Math.max(0, +(bal - roi));
        cumW = Math.min(maxPayout, +(cumW + roi));
      }

      rows.push({
        day: d + 1,
        bal: +bal.toFixed(4),
        roi: +roi.toFixed(4),
        action,
        after: +after.toFixed(4),
        cumW: +cumW.toFixed(4),
        cumR: +cumR.toFixed(4),
        capLocked,
      });

      bal = after;
      if (isLastCappedRoi && action === "W") {
        // Exact 2X completed at Day 69-70!
        break;
      }
    }

    return rows;
  }, [pool, capBal, maxPayout, mode, manualActions]);

  // Aggregate Metrics
  const totalDays = simData.length;
  const totalWithdrawn = simData[simData.length - 1]?.cumW || 0;
  const totalReinvested = simData[simData.length - 1]?.cumR || 0;
  const peakBalance = useMemo(() => {
    let p = pool;
    for (const r of simData) {
      if (r.bal > p) p = r.bal;
      if (r.after > p) p = r.after;
    }
    return p;
  }, [simData, pool]);

  const capPct = Math.min(100, (peakBalance / capBal) * 100);

  const toggleDayAction = (index: number) => {
    if (mode !== "manual") return;
    const current = manualActions[index] || "W";
    setManualActions((prev) => ({
      ...prev,
      [index]: current === "R" ? "W" : "R",
    }));
  };

  const handleDownloadCSV = () => {
    let csv = "Day,Starting Balance,2% Daily ROI,Action,Remaining Balance,Cumulative Withdrawal,Cumulative Reinvested\n";
    simData.forEach((r) => {
      csv += `${r.day},${r.bal},${r.roi},${r.action === "R" ? "Reinvest" : "Withdrawal"},${r.after},${r.cumW},${r.cumR}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CryptoFinance_Simulator_${safeCap}USDT_${mode}.csv`;
    a.click();
  };

  // Sample points for smooth SVG chart
  const chartPoints = useMemo(() => {
    if (simData.length === 0) return { balPath: "", cumPath: "", points: [] };
    const step = Math.max(1, Math.floor(simData.length / 60));
    const sampled: SimRow[] = [];
    for (let i = 0; i < simData.length; i += step) {
      sampled.push(simData[i]);
    }
    if (sampled[sampled.length - 1]?.day !== simData[simData.length - 1]?.day) {
      sampled.push(simData[simData.length - 1]);
    }

    const maxVal = Math.max(capBal, peakBalance, totalWithdrawn) * 1.05;
    const width = 800;
    const height = 240;

    const coords = sampled.map((s, idx) => {
      const x = (idx / (sampled.length - 1)) * width;
      const yBal = height - (s.bal / maxVal) * height;
      const yCum = height - (s.cumW / maxVal) * height;
      return { x, yBal, yCum, row: s };
    });

    const balD = coords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.yBal}` : `${acc} L ${pt.x} ${pt.yBal}`;
    }, "");

    const cumD = coords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.yCum}` : `${acc} L ${pt.x} ${pt.yCum}`;
    }, "");

    return { balPath: balD, cumPath: cumD, points: coords, width, height, maxVal };
  }, [simData, capBal, peakBalance, totalWithdrawn]);

  return (
    <section id="calculator" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background ambient orbs */}
      <div className="bg-glow-cyan top-1/4 -left-20" />
      <div className="bg-glow-emerald bottom-1/4 -right-20" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-[#00FFA3] text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OFFICIAL ROI PLAN SIMULATOR &bull; SLIDES 10 - 14</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Live Yield &amp; Compounding Engine
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3 font-medium">
          Experience the mathematical precision of Crypto Finance: dynamic 4% daily yield, 10% bonus subsidy, 2X decaying balance pool, and 35-day exponential compounding.
        </p>
      </div>

      {/* Main Glass Simulation Station */}
      <div className="glass-card-elevated glass-glow-top p-6 sm:p-8 max-w-5xl mx-auto shadow-2xl">
        {/* Preset Amount Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-6 border-b border-slate-200/80 dark:border-white/10">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-sky-500 dark:text-[#00D2FF]" />
            Quick Preset Stakes:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setCapital(val);
                  setBonusInput(+(val * 0.1).toFixed(2));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  capital === val
                    ? "bg-emerald-500 dark:bg-[#00FFA3] text-white dark:text-slate-950 font-black shadow-lg shadow-emerald-500/25 scale-105"
                    : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                ${val} USDT
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid: Capital Stake + 10% Bonus Wallet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {/* Capital Stake */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Investment / Stake (USDT)
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-[#00FFA3]">Min $2.00</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-lg font-bold text-emerald-600 dark:text-[#00FFA3]">$</span>
              <input
                type="number"
                min="2"
                step="1"
                value={capital}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCapital(val);
                  setBonusInput(+(val * 0.1).toFixed(2));
                }}
                className="w-full bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-white/15 focus:border-emerald-500 rounded-xl py-3 pl-8 pr-4 text-slate-900 dark:text-white text-xl font-bold outline-none transition-all shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Creates instant <strong className="text-slate-900 dark:text-white">${pool.toLocaleString()} (2X)</strong> Contract Pool
            </p>
          </div>

          {/* 10% Bonus Wallet Subsidy */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/25">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Bonus Wallet (10% Usable)
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                ${maxBonusUsable.toFixed(2)} Max
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-lg font-bold text-indigo-600 dark:text-indigo-400">$</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={bonusInput}
                onChange={(e) => setBonusInput(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-950/80 border border-indigo-300 dark:border-indigo-500/30 focus:border-indigo-500 rounded-xl py-3 pl-8 pr-4 text-indigo-700 dark:text-indigo-300 text-xl font-bold outline-none transition-all shadow-inner"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 mt-2">
              <span>Bonus Used: <strong className="text-indigo-600 dark:text-indigo-400">${bonusUsed.toFixed(2)}</strong></span>
              <span>Net USDT: <strong className="text-emerald-600 dark:text-[#00FFA3]">${netUsdt.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Strategy Control: Withdraw / Reinvest / Manual */}
        <div className="mb-8 p-5 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-500 dark:text-[#00D2FF]" />
              Select Strategy Mode:
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {mode === "withdraw" && "Daily Payout • Starts 4% on Principal"}
              {mode === "reinvest" && "Exponential Compounding • 35-Day 2X Doubling"}
              {mode === "manual" && "Custom Strategy • Day-by-Day Control"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => handleSetMode("withdraw")}
              className={`py-3 px-2 rounded-xl text-center transition-all ${
                mode === "withdraw"
                  ? "bg-sky-500/20 border border-sky-500/40 text-sky-600 dark:text-[#00D2FF] font-bold shadow-md shadow-sky-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <div className="text-base mb-0.5">📉</div>
              <div className="text-xs font-bold">All Withdraw</div>
              <div className="text-[10px] opacity-70 hidden sm:block">Daily payout</div>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode("reinvest")}
              className={`py-3 px-2 rounded-xl text-center transition-all ${
                mode === "reinvest"
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-[#00FFA3] font-bold shadow-md shadow-emerald-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <div className="text-base mb-0.5">🚀</div>
              <div className="text-xs font-bold">All Reinvest</div>
              <div className="text-[10px] opacity-70 hidden sm:block">Compound → 2X Cap</div>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode("manual")}
              className={`py-3 px-2 rounded-xl text-center transition-all ${
                mode === "manual"
                  ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-600 dark:text-indigo-300 font-bold shadow-md shadow-indigo-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <div className="text-base mb-0.5">🎛️</div>
              <div className="text-xs font-bold">Manual</div>
              <div className="text-[10px] opacity-70 hidden sm:block">Day-by-Day Control</div>
            </button>
          </div>

          {/* Quick-Set Slider for Manual Mode */}
          {mode === "manual" && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#00FFA3]/5 border border-[#00FFA3]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-300">
                Reinvest First X Days:
              </span>
              <div className="flex items-center gap-3 flex-1 sm:max-w-md">
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={quickDays}
                  onChange={(e) => applyQuickSetDays(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00FFA3]"
                />
                <span className="text-xs font-bold text-[#00FFA3] min-w-16 text-right">
                  {quickDays} Days
                </span>
              </div>
            </div>
          )}

          {/* 2X Cap Progress Bar */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500 dark:text-slate-400">Peak Balance &rarr; 2X Cap Lock (${(capBal).toLocaleString()})</span>
              <span className="font-bold text-slate-900 dark:text-white">{capPct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  capPct >= 95
                    ? "bg-gradient-to-r from-rose-500 to-indigo-600"
                    : "bg-gradient-to-r from-emerald-500 to-sky-500"
                }`}
                style={{ width: `${capPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <div className="glass-panel p-3.5 text-center">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Investment
            </p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              ${safeCap.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-[#00FFA3] mt-0.5">
              ${bonusUsed}B + ${netUsdt}U
            </p>
          </div>

          <div className="glass-panel p-3.5 text-center">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              2X Contract Pool
            </p>
            <p className="text-lg sm:text-xl font-black text-sky-600 dark:text-[#00D2FF]">
              ${pool.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Initial Release Base
            </p>
          </div>

          <div className="glass-panel p-3.5 text-center">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Total Withdrawn
            </p>
            <p className="text-lg sm:text-xl font-black text-sky-600 dark:text-[#00D2FF]">
              ${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {((totalWithdrawn / pool) * 100).toFixed(1)}% of Pool
            </p>
          </div>

          <div className="glass-panel p-3.5 text-center">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Active Days
            </p>
            <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-[#00FFA3]">
              {totalDays}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Until $0.005 Bal
            </p>
          </div>

          <div className="glass-panel p-3.5 text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Peak Balance
            </p>
            <p className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
              ${peakBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              ${totalReinvested.toFixed(0)} Reinvested
            </p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-[#00FFA3]" />
              Simulation Curve: Balance vs Cumulative Cashout
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-[#00FFA3]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-[#00FFA3]" /> Pool Balance
              </span>
              <span className="flex items-center gap-1 text-sky-600 dark:text-[#00D2FF]">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 dark:bg-[#00D2FF]" /> Cumulative Cashout
              </span>
            </div>
          </div>

          {/* Interactive Responsive SVG Line Chart */}
          <div className="relative w-full h-56 sm:h-64">
            <svg
              viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="balGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="cumGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="60" x2="800" y2="60" stroke="currentColor" className="text-slate-300 dark:text-white/10" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="currentColor" className="text-slate-300 dark:text-white/10" strokeDasharray="4 4" />
              <line x1="0" y1="180" x2="800" y2="180" stroke="currentColor" className="text-slate-300 dark:text-white/10" strokeDasharray="4 4" />

              {/* Balance Curve Area & Line */}
              {chartPoints.balPath && (
                <>
                  <path
                    d={`${chartPoints.balPath} L ${chartPoints.width} ${chartPoints.height} L 0 ${chartPoints.height} Z`}
                    fill="url(#balGlow)"
                  />
                  <path
                    d={chartPoints.balPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Cumulative Payout Curve Area & Line */}
              {chartPoints.cumPath && (
                <>
                  <path
                    d={`${chartPoints.cumPath} L ${chartPoints.width} ${chartPoints.height} L 0 ${chartPoints.height} Z`}
                    fill="url(#cumGlow)"
                  />
                  <path
                    d={chartPoints.cumPath}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Day-by-Day Ledger Table */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Day-by-Day Financial Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === "manual" ? "Click any row's action to toggle Withdraw / Reinvest" : "Automated release protocol"}
              </p>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00FFA3]" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 dark:bg-[#0B132B] text-slate-800 dark:text-[#00FFA3] border-b border-slate-200 dark:border-white/10 uppercase text-[10px] tracking-wider z-10">
                <tr>
                  <th className="py-2.5 px-3 text-center">Day</th>
                  <th className="py-2.5 px-3 text-right">Start Pool</th>
                  <th className="py-2.5 px-3 text-right">2% Daily ROI</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                  <th className="py-2.5 px-3 text-right">End Pool</th>
                  <th className="py-2.5 px-3 text-right">Cum. Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {simData.slice(0, visibleRows).map((r, i) => (
                  <tr
                    key={r.day}
                    className={`hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition ${
                      r.capLocked ? "bg-indigo-500/10" : ""
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400 font-bold">{r.day}</td>
                    <td className="py-2 px-3 text-right text-slate-800 dark:text-slate-200">${r.bal.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-emerald-600 dark:text-[#00FFA3] font-bold">+${r.roi.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">
                      {r.capLocked ? (
                        <span className="toggle-pill locked">
                          <Lock className="w-3 h-3 text-indigo-500" /> Cap Lock
                        </span>
                      ) : r.action === "R" ? (
                        <span
                          onClick={() => toggleDayAction(i)}
                          className={`toggle-pill reinvest ${mode === "manual" ? "cursor-pointer" : ""}`}
                        >
                          🔄 Reinvest
                        </span>
                      ) : (
                        <span
                          onClick={() => toggleDayAction(i)}
                          className={`toggle-pill withdraw ${mode === "manual" ? "cursor-pointer" : ""}`}
                        >
                          💸 Withdraw
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">${r.after.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-sky-600 dark:text-[#00D2FF] font-bold">${r.cumW.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {visibleRows < simData.length && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleRows((v) => Math.min(simData.length, v + 40))}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-emerald-600 dark:text-[#00FFA3] transition"
              >
                Load More Days ({visibleRows} / {simData.length}) &darr;
              </button>
            </div>
          )}
        </div>

        {/* 4 Info Explainer Cards from index.html & PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              10% Bonus Utility Rule
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Up to 10% of any activation or compounding can be funded from your non-withdrawable Bonus Wallet. The remaining 90% is funded in external BEP-20 USDT, eliminating bank-run risks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10">
            <h4 className="text-xs font-bold text-sky-600 dark:text-[#00D2FF] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sky-500 dark:text-[#00D2FF]" />
              Decaying Pool Balance
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              2.00% daily is released from the <em>remaining</em> 2X pool balance each day. Day 1 starts at an exact 4.00% on your capital stake, gradually decaying until 100% of the 2X pool is claimed.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-[#00FFA3] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500 dark:text-[#00FFA3]" />
              35-Day Doubling Engine
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              By reinvesting your 2% daily release, the mathematical formula $(1.02)^{35} \approx 2.000$ doubles your principal in exactly 35 days, accelerating your capital exponentially.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10">
            <h4 className="text-xs font-bold text-rose-600 dark:text-[#FF3366] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-rose-500 dark:text-[#FF3366]" />
              2X Cap Lock &amp; 200% Payout
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              When compounding or payouts reach 2X of initial stake, returns are strictly capped. The final daily ROI pays only the exact remaining balance required to complete 2X (200%), preventing any over-extraction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}