"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Download, ShieldCheck, Sparkles, TrendingUp, Award, Building2, Zap, Layers, RefreshCw, ChevronDown, Check } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function Hero() {
  const { resolvedTheme } = useTheme();
  const [isPrelaunch, setIsPrelaunch] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("USDT Yields");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.configs) {
          if (data.configs.PRELAUNCH_MODE === "true") {
            const targetDateStr = data.configs.PRELAUNCH_TARGET_DATE || "2026-10-01T20:00";
            let targetTime: number;
            if (/[+-]\d{2}(:\d{2})?$|Z$/i.test(targetDateStr)) {
              targetTime = new Date(targetDateStr).getTime();
            } else {
              targetTime = new Date(`${targetDateStr}:00+00:00`).getTime();
            }

            const evaluateMode = () => {
              if (!isNaN(targetTime) && Date.now() >= targetTime) {
                setIsPrelaunch(false);
              } else {
                setIsPrelaunch(true);
              }
            };

            evaluateMode();
            timer = setInterval(evaluateMode, 1000);
          } else {
            setIsPrelaunch(false);
          }
        }
      })
      .catch(() => {});

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const isLight = resolvedTheme === "light";
  const pdfHref = `/api/download-presentation?theme=${isLight ? "light" : "dark"}&v=20261001`;
  const pdfFileName = "Crypto_Finance_Presentation.pdf";

  return (
    <section className="relative z-10 pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Ambient Glow Lights */}
      <div className="bg-glow-cyan top-10 left-1/4 -translate-x-1/2 opacity-70" />
      <div className="bg-glow-purple top-32 right-1/4 opacity-60" />
      <div className="bg-glow-emerald bottom-10 left-1/3 opacity-40" />

      <div className="max-w-4xl mx-auto text-center relative z-10 mb-16">
        {/* Floating Glass Protocol Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-sky-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>CRYPTO FINANCE &bull; DYNAMIC 4% DAILY YIELD &bull; BEP-20 PROTOCOL</span>
        </div>

        {/* High-Impact Modern Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900 dark:text-white">
          Quantitative Algo &amp; <br />
          <span className="crypto-gradient">DeFi Arbitrage Protocol.</span>
        </h1>

        {/* Subtitle & Value Proposition */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-3xl mx-auto font-normal">
          Start with as low as <strong className="text-slate-900 dark:text-white font-bold">$2.00 USDT</strong>.
          Next-generation quantitative wealth protocol engineered for mathematical certainty, sustainable{" "}
          <span className="text-sky-600 dark:text-sky-400 font-bold">4.00% Daily Yields</span> (via 2% daily release from your 2X contract allocation pool),{" "}
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">35-Day 2X Compounding Engine</span>, and{" "}
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">10-Level Daily Team Royalty</span>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
          {isPrelaunch ? (
            <a
              href="#packages"
              className="w-full sm:w-auto crypto-btn px-8 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25"
            >
              Explore Protocol ($2 Min Entry) <ArrowRight className="w-4 h-4" />
            </a>
          ) : (
            <Link
              href="/register"
              className="w-full sm:w-auto crypto-btn px-8 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25"
            >
              Start with $2 USDT <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {/* Presentation Deck PDF */}
          <a
            href={pdfHref}
            download={pdfFileName}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full glass-btn-secondary text-sm font-semibold flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300"
          >
            <Download className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            Presentation Deck (PDF)
          </a>

          <a
            href="#calculator"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full glass-btn-secondary text-sm font-semibold flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300"
          >
            ROI Calculator
          </a>
        </div>

        {/* Live Trust Bar */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            Crypto Valley Tower, Zug, Switzerland
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            100% USDT (BEP-20) Binance Smart Chain
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Audited Triple-Isolated Solvency
          </span>
        </div>
      </div>

      {/* =========================================================================
          HERO GLASS SHOWCASE (Direct recreation of user uploaded reference image!)
          ========================================================================= */}
      <div className="max-w-4xl mx-auto my-12 relative">
        {/* Layered Stacked Sheets Behind Main Tablet (Exact depth from uploaded picture) */}
        <div className="absolute inset-x-8 -inset-y-4 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-emerald-500/10 rounded-[36px] blur-xl -z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-white/40 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 rounded-[36px] translate-x-3 translate-y-3 pointer-events-none -z-10" />

        {/* Main Floating Frosted Glass Tablet */}
        <div className="relative glass-card-elevated p-6 sm:p-10 overflow-hidden shadow-[0_20px_50px_rgba(2,132,199,0.12)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
          {/* Top Row: Tracked Micro-Label & Rounded Dropdown Selector */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                SALES REPORT
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Glass Dropdown Styled directly like "Accessories ⌄" in uploaded image */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="glass-pill px-4 py-1.5 text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-200/50 dark:hover:bg-white/15 transition flex items-center gap-2 cursor-pointer"
              >
                <span>{selectedAsset}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 glass-card-elevated p-1.5 z-30 shadow-2xl animate-in zoom-in-95 duration-100">
                  {["USDT Yields", "FD Staking", "Level Royalty"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedAsset(option);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition flex items-center justify-between"
                    >
                      <span>{option}</span>
                      {selectedAsset === option && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Central Highlight: Big Bold $1,024 Currency & Neon Growth Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-4">
            <div className="sm:col-span-6">
              <div className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
                <span>$1,024</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Net volume</span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span className="glass-pill px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30">
                  <span>3.2%</span>
                  <span className="text-xs">↗</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 leading-relaxed max-w-sm">
                Triple-isolated liquidity engine automatically calculating high-frequency quantitative yield releases every 24 hours.
              </p>
            </div>

            {/* Glowing 3D Vector Graphic: Neon Green & Royal Blue Waves (From Uploaded Photo) */}
            <div className="sm:col-span-6 relative flex items-center justify-center">
              <div className="w-full h-36 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 relative overflow-hidden flex items-center justify-center p-3 shadow-inner">
                {/* Horizontal Dashed Measurement Lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 px-6 opacity-30 pointer-events-none">
                  <div className="w-full border-b border-dashed border-slate-400 dark:border-white/40" />
                  <div className="w-full border-b border-dashed border-slate-400 dark:border-white/40" />
                  <div className="w-full border-b border-dashed border-slate-400 dark:border-white/40" />
                </div>

                {/* SVG 3D Glowing Curves */}
                <svg
                  viewBox="0 0 400 120"
                  className="w-full h-full absolute inset-0 preserve-3d"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="neon-glow-green" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#22c55e" floodOpacity="0.75" />
                    </filter>
                    <filter id="neon-glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#38bdf8" floodOpacity="0.75" />
                    </filter>
                  </defs>

                  {/* Electric Blue Curve */}
                  <path
                    d="M 15 90 Q 90 100, 160 65 T 280 45 T 385 20"
                    stroke="#0284c7"
                    strokeWidth="6"
                    strokeLinecap="round"
                    filter="url(#neon-glow-blue)"
                  />

                  {/* Neon Lime Green Curve (Intersecting in front) */}
                  <path
                    d="M 15 75 Q 100 110, 180 60 T 300 30 T 385 15"
                    stroke="#16a34a"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    filter="url(#neon-glow-green)"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Floating Action Dock at Bottom of Card (Like in reference picture!) */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Live Mathematical Proof</span>
            </div>

            {/* Pill Capsule Action Dock */}
            <div className="glass-dock py-1.5 px-4 flex items-center gap-3">
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">BEP-20 Validated</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Zero Slippage</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Isolated 10% Fee</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="glass-card-elevated p-6 text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-500 dark:text-sky-400 mx-auto mb-3 shadow-md shadow-sky-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1 font-mono">
            4.00% Daily
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Dynamic Capital Yield
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            2% Daily from 2X Pool
          </div>
        </div>

        <div className="glass-card-elevated p-6 text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mx-auto mb-3 shadow-md shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight mb-1 font-mono">
            3-Wallet Engine
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Isolated Liquidity
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            10% Utility &bull; Zero Leakage
          </div>
        </div>

        <div className="glass-card-elevated p-6 text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3 shadow-md shadow-emerald-500/20">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mb-1 font-mono">
            35 Days
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            2X Doubling Engine
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            (1.02)^35 ≈ 2.000 &bull; 4X Max
          </div>
        </div>

        <div className="glass-card-elevated p-6 text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-3 shadow-md shadow-purple-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight mb-1 font-mono">
            10 Tiers
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Daily Team Royalty
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            10% - 5% - 2% - 1% Matrix
          </div>
        </div>
      </div>
    </section>
  );
}