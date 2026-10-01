"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Download, ShieldCheck, Sparkles, TrendingUp, Award, Building2, Zap, Layers, RefreshCw } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function Hero() {
  const { resolvedTheme } = useTheme();
  const [isPrelaunch, setIsPrelaunch] = useState(false);

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
    <section className="relative z-10 pt-10 sm:pt-16 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Cyber Glow & Grid */}
      <div className="absolute inset-0 -z-10 rounded-3xl overflow-hidden opacity-20 pointer-events-none bg-cyber-grid" />
      <div className="bg-glow-cyan top-0 left-1/2 -translate-x-1/2" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Official Brand Badge from Slide 1 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 shadow-sm font-mono">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>CRYPTO FINANCE &bull; DYNAMIC 4% DAILY YIELD &bull; BEP-20 PROTOCOL</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-[var(--text-main)]">
          Quantitative Algo &amp; <br />
          <span className="crypto-gradient">DeFi Arbitrage Protocol.</span>
        </h1>

        {/* Subtitle & Value Proposition from Slide 01 & 02 */}
        <p className="text-base sm:text-xl text-[var(--text-muted)] leading-relaxed mb-8 max-w-3xl mx-auto font-medium">
          Start with as low as <strong className="text-cyan-400 font-bold">$2.00 USDT</strong>.
          Next-generation quantitative wealth protocol engineered for mathematical certainty, sustainable{" "}
          <span className="text-cyan-400 font-bold">4.00% Daily Yields</span> (via 2% daily release from your 2X contract allocation pool),{" "}
          <span className="text-amber-400 font-bold">35-Day 2X Compounding Engine</span>, and{" "}
          <span className="text-emerald-400 font-bold">10-Level Daily Team Royalty</span>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
          {isPrelaunch ? (
            <a
              href="#packages"
              className="w-full sm:w-auto crypto-btn px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20"
            >
              Explore Protocol ($2 Min Entry) <ArrowRight className="w-5 h-5" />
            </a>
          ) : (
            <Link
              href="/register"
              className="w-full sm:w-auto crypto-btn px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20"
            >
              Start with $2 USDT <ArrowRight className="w-5 h-5" />
            </Link>
          )}

          {/* Dynamic Theme PDF Download Button */}
          <a
            href={pdfHref}
            download={pdfFileName}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-cyan-500/30 bg-[var(--bg-card)] hover:border-cyan-400 text-[var(--text-main)] text-base font-semibold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-5 h-5 text-cyan-400" />
            Official Presentation Deck (PDF)
          </a>

          <a
            href="#calculator"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-cyan-500/40 text-[var(--text-muted)] text-base font-semibold transition flex items-center justify-center gap-2"
          >
            ROI Calculator
          </a>
        </div>

        {/* Live Trust Bar from Slide 1 & 3 */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-[var(--text-subtle)] mb-12 font-medium">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Crypto Valley Tower, Zug, Switzerland
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            100% USDT (BEP-20) Binance Smart Chain
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Audited Triple-Isolated Solvency
          </span>
        </div>
      </div>

      {/* 4 Core Pillars Metric Cards from Slide 01 & 04 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {/* Card 1: 4% Daily ROI */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-cyan-400 mb-1">
            4.00% Daily
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Dynamic Capital Yield
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1 font-mono">
            2% Daily from 2X Pool
          </div>
        </div>

        {/* Card 2: 3-Wallet Engine */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-amber-400 mb-1">
            3-Wallet Engine
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Isolated Liquidity
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1 font-mono">
            10% Utility &bull; Zero Leakage
          </div>
        </div>

        {/* Card 3: 35-Day Compounding */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-emerald-400 mb-1">
            35 Days
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            2X Doubling Engine
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1 font-mono">
            (1.02)^35 ≈ 2.000 &bull; 4X Max
          </div>
        </div>

        {/* Card 4: Team Royalties */}
        <div className="glass-card p-5 rounded-2xl text-center group hover:-translate-y-1 transition duration-200">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-sky-400 mb-1">
            10 Tiers
          </div>
          <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            Daily Team Royalty
          </div>
          <div className="text-[11px] text-[var(--text-subtle)] mt-1 font-mono">
            10% - 5% - 2% - 1% Matrix
          </div>
        </div>
      </div>
    </section>
  );
}