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
  const capBal = pool * 2; // 2X of pool = 4X of original investment

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
      const roi = +(tempBal * 0.02);
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

  // Run simulation engine from index.html
  const simData: SimRow[] = useMemo(() => {
    const rows: SimRow[] = [];
    let bal = pool;
    let cumW = 0;
    let cumR = 0;

    for (let d = 0; d < 1500; d++) {
      if (bal <= 0.005) break;
      const roi = +(bal * 0.02);

      let action: "W" | "R" = "W";
      let capLocked = false;

      if (mode === "withdraw") {
        action = "W";
      } else if (mode === "reinvest") {
        if (bal + roi >= capBal) {
          action = "W";
          capLocked = true;
        } else {
          action = "R";
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

      let after = 0;
      if (action === "R") {
        after = +(bal + roi);
        cumR += roi;
      } else {
        after = +(bal - roi);
        cumW += roi;
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
    }

    return rows;
  }, [pool, capBal, mode, manualActions]);

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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/25 text-[#00FFA3] text-xs font-bold uppercase tracking-wider font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OFFICIAL ROI PLAN SIMULATOR &bull; SLIDES 10 - 14</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
          Live Yield &amp; Compounding Engine
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3 font-medium">
          Experience the mathematical precision of Crypto Finance: dynamic 4% daily yield, 10% bonus subsidy, 2X decaying balance pool, and 35-day exponential compounding.
        </p>
      </div>

      {/* Main Glass Simulation Station */}
      <div className="glass-card-elevated glass-glow-top p-6 sm:p-8 max-w-5xl mx-auto shadow-2xl">
        {/* Preset Amount Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-6 border-b border-white/10">
          <span className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#00D2FF]" />
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  capital === val
                    ? "bg-[#00FFA3] text-slate-950 font-black shadow-lg shadow-[#00FFA3]/25 scale-105"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:border-[#00FFA3]/40 hover:text-white"
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
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Investment / Stake (USDT)
              </label>
              <span className="text-xs font-bold text-[#00FFA3] font-mono">Min $2.00</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-lg font-bold text-[#00FFA3] font-mono">$</span>
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
                className="w-full bg-slate-950/80 border border-white/15 focus:border-[#00FFA3] rounded-xl py-3 pl-8 pr-4 text-white font-mono text-xl font-bold outline-none transition-all shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Creates instant <strong className="text-white">${pool.toLocaleString()} (2X)</strong> Contract Pool
            </p>
          </div>

          {/* 10% Bonus Wallet Subsidy */}
          <div className="p-4 rounded-2xl bg-[#FFB800]/5 border border-[#FFB800]/20">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Bonus Wallet (10% Usable)
              </label>
              <span className="text-xs font-bold text-[#FFB800] font-mono">
                ${maxBonusUsable.toFixed(2)} Max
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-lg font-bold text-[#FFB800] font-mono">$</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={bonusInput}
                onChange={(e) => setBonusInput(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-[#FFB800]/30 focus:border-[#FFB800] rounded-xl py-3 pl-8 pr-4 text-[#FFB800] font-mono text-xl font-bold outline-none transition-all shadow-inner"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-300 mt-2 font-mono">
              <span>Bonus Used: <strong className="text-[#FFB800]">${bonusUsed.toFixed(2)}</strong></span>
              <span>Net USDT: <strong className="text-[#00FFA3]">${netUsdt.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Strategy Control: Withdraw / Reinvest / Manual */}
        <div className="mb-8 p-5 rounded-2xl bg-slate-900/50 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#00D2FF]" />
              Select Strategy Mode:
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {mode === "withdraw" && "Daily Payout • Starts 4% on Principal"}
              {mode === "reinvest" && "Exponential Compounding • 35-Day 2X Doubling"}
              {mode === "manual" && "Custom Strategy • Day-by-Day Control"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-white/10">
            <button
              type="button"
              onClick={() => handleSetMode("withdraw")}
              className={`py-3 px-2 rounded-xl text-center transition-all ${
                mode === "withdraw"
                  ? "bg-[#00D2FF]/20 border border-[#00D2FF]/40 text-[#00D2FF] font-bold shadow-md shadow-[#00D2FF]/10"
                  : "text-slate-400 hover:text-white"
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
                  ? "bg-[#00FFA3]/20 border border-[#00FFA3]/40 text-[#00FFA3] font-bold shadow-md shadow-[#00FFA3]/10"
                  : "text-slate-400 hover:text-white"
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
                  ? "bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] font-bold shadow-md shadow-[#FFB800]/10"
                  : "text-slate-400 hover:text-white"
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
                <span className="font-mono text-xs font-bold text-[#00FFA3] min-w-16 text-right">
                  {quickDays} Days
                </span>
              </div>
            </div>
          )}

          {/* 2X Cap Progress Bar */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Peak Balance &rarr; 2X Cap Lock (${(capBal).toLocaleString()})</span>
              <span className="font-bold text-white">{capPct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  capPct >= 95
                    ? "bg-gradient-to-r from-[#FFB800] to-[#FF3366]"
                    : "bg-gradient-to-r from-[#00FFA3] to-[#00D2FF]"
                }`}
                style={{ width: `${capPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <div className="glass-panel p-3.5 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Investment
            </p>
            <p className="text-lg sm:text-xl font-black text-white font-mono">
              ${safeCap.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#00FFA3] font-mono mt-0.5">
              ${bonusUsed}B + ${netUsdt}U
            </p>
          </div>

          <div className="glass-panel p-3.5 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              2X Contract Pool
            </p>
            <p className="text-lg sm:text-xl font-black text-[#00D2FF] font-mono">
              ${pool.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Initial Release Base
            </p>
          </div>

          <div className="glass-panel p-3.5 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Total Withdrawn
            </p>
            <p className="text-lg sm:text-xl font-black text-[#00D2FF] font-mono">
              ${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {((totalWithdrawn / pool) * 100).toFixed(1)}% of Pool
            </p>
          </div>

          <div className="glass-panel p-3.5 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Active Days
            </p>
            <p className="text-lg sm:text-xl font-black text-[#00FFA3] font-mono">
              {totalDays}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Until $0.005 Bal
            </p>
          </div>

          <div className="glass-panel p-3.5 text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Peak Balance
            </p>
            <p className="text-lg sm:text-xl font-black text-[#FFB800] font-mono">
              ${peakBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              ${totalReinvested.toFixed(0)} Reinvested
            </p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <TrendingUp className="w-4 h-4 text-[#00FFA3]" />
              Simulation Curve: Balance vs Cumulative Cashout
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-[#00FFA3]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3]" /> Pool Balance
              </span>
              <span className="flex items-center gap-1 text-[#00D2FF]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00D2FF]" /> Cumulative Cashout
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
                  <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00FFA3" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="cumGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00D2FF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="60" x2="800" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="180" x2="800" y2="180" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

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
                    stroke="#00FFA3"
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
                    stroke="#00D2FF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Day-by-Day Ledger Table */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Day-by-Day Financial Ledger
              </h3>
              <p className="text-xs text-slate-400">
                {mode === "manual" ? "Click any row's action to toggle Withdraw / Reinvest" : "Automated release protocol"}
              </p>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition font-mono"
            >
              <Download className="w-3.5 h-3.5 text-[#00FFA3]" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/60">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-[#0B132B] text-[#00FFA3] border-b border-white/10 uppercase text-[10px] tracking-wider z-10">
                <tr>
                  <th className="py-2.5 px-3 text-center">Day</th>
                  <th className="py-2.5 px-3 text-right">Start Pool</th>
                  <th className="py-2.5 px-3 text-right">2% Daily ROI</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                  <th className="py-2.5 px-3 text-right">End Pool</th>
                  <th className="py-2.5 px-3 text-right">Cum. Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {simData.slice(0, visibleRows).map((r, i) => (
                  <tr
                    key={r.day}
                    className={`hover:bg-white/[0.02] transition ${
                      r.capLocked ? "bg-[#FFB800]/10" : ""
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-slate-400 font-bold">{r.day}</td>
                    <td className="py-2 px-3 text-right text-slate-200">${r.bal.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-[#00FFA3] font-bold">+${r.roi.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center">
                      {r.capLocked ? (
                        <span className="toggle-pill locked">
                          <Lock className="w-3 h-3 text-[#FFB800]" /> Cap Lock
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
                    <td className="py-2 px-3 text-right text-slate-300">${r.after.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-[#00D2FF] font-bold">${r.cumW.toFixed(2)}</td>
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
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#00FFA3] transition font-mono"
              >
                Load More Days ({visibleRows} / {simData.length}) &darr;
              </button>
            </div>
          )}
        </div>

        {/* 4 Info Explainer Cards from index.html & PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10">
            <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-mono">
              <Layers className="w-4 h-4 text-[#FFB800]" />
              10% Bonus Utility Rule
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Up to 10% of any activation or compounding can be funded from your non-withdrawable Bonus Wallet. The remaining 90% is funded in external BEP-20 USDT, eliminating bank-run risks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10">
            <h4 className="text-xs font-bold text-[#00D2FF] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-mono">
              <TrendingUp className="w-4 h-4 text-[#00D2FF]" />
              Decaying Pool Balance
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              2.00% daily is released from the <em>remaining</em> 2X pool balance each day. Day 1 starts at an exact 4.00% on your capital stake, gradually decaying until 100% of the 2X pool is claimed.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10">
            <h4 className="text-xs font-bold text-[#00FFA3] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-[#00FFA3]" />
              35-Day Doubling Engine
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              By reinvesting your 2% daily release, the mathematical formula $(1.02)^{35} \approx 2.000$ doubles your principal in exactly 35 days, accelerating your capital exponentially.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10">
            <h4 className="text-xs font-bold text-[#FF3366] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-mono">
              <Lock className="w-4 h-4 text-[#FF3366]" />
              2X Cap Lock &amp; 4X Profit
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              When compounding reaches 2X of initial stake, compounding enters an automated safety freeze. The investor MUST take at least 1 withdrawal, unlocking up to ~400% (4X) total extraction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}