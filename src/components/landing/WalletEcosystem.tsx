"use client";

import React from "react";
import {
  Layers,
  Gift,
  Zap,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Percent,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export function WalletEcosystem() {
  return (
    <section id="wallets" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Glow Orbs */}
      <div className="bg-glow-purple top-1/3 -left-20" />
      <div className="bg-glow-cyan bottom-10 -right-20" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/25 text-[#00D2FF] text-xs font-bold uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>TRIPLE-ISOLATED ARCHITECTURE &bull; SLIDES 04 - 09</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
          The 3-Wallet Ecosystem
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3 font-medium">
          Triple-isolated ledgers designed to eliminate bank-run risks, guarantee mathematical solvency, and give members complete financial sovereignty.
        </p>
      </div>

      {/* 3 Wallets Cards Grid (Slide 04) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Wallet 1: Bonus Wallet */}
        <div className="glass-card-elevated glass-glow-top p-6 sm:p-8 flex flex-col justify-between border-t-2 border-t-[#FFB800] relative overflow-hidden group hover:-translate-y-1 transition duration-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30">
                NON-WITHDRAWABLE
              </span>
              <Gift className="w-5 h-5 text-[#FFB800]" />
            </div>

            <h3 className="font-display text-2xl font-black text-white mb-2">
              BONUS WALLET
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Holds free community signup bonuses: <strong>$1.00 Self</strong> + <strong>$0.40/Level</strong> across 10 referral tiers. Dedicated exclusively to subsidizing investments.
            </p>

            <div className="p-4 rounded-2xl bg-[#FFB800]/5 border border-[#FFB800]/20 mb-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Self Signup Gift:</span>
                <span className="text-[#FFB800] font-bold">$1.00 USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">10-Level Team Gift:</span>
                <span className="text-[#FFB800] font-bold">$0.40 / Level</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10">
                <span className="text-slate-400">Tx Utility Limit:</span>
                <span className="text-[#00FFA3] font-bold">Up to 10%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <span className="text-[#FFB800] font-bold">★ Utility:</span>
            <span>Funds up to 10% of any activation or compounding!</span>
          </div>
        </div>

        {/* Wallet 2: ROI Wallet */}
        <div className="glass-card-elevated glass-glow-top p-6 sm:p-8 flex flex-col justify-between border-t-2 border-t-[#00FFA3] relative overflow-hidden group hover:-translate-y-1 transition duration-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
                100% WITHDRAWABLE
              </span>
              <Zap className="w-5 h-5 text-[#00FFA3]" />
            </div>

            <h3 className="font-display text-2xl font-black text-white mb-2">
              ROI WALLET
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Receives your automated <strong>4.00% daily returns</strong> (2% daily release from your 2X contract allocation pool) whenever you select withdrawal mode.
            </p>

            <div className="p-4 rounded-2xl bg-[#00FFA3]/5 border border-[#00FFA3]/20 mb-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Daily Payout:</span>
                <span className="text-[#00FFA3] font-bold">2.00% of 2X Pool</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Initial Stake ROI:</span>
                <span className="text-[#00FFA3] font-bold">4.00% Daily</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10">
                <span className="text-slate-400">Min Cashout:</span>
                <span className="text-white font-bold">$2.00 USDT</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <span className="text-[#00FFA3] font-bold">★ Cashout:</span>
            <span>Direct to BEP-20 USDT with flat 10% liquidity fee.</span>
          </div>
        </div>

        {/* Wallet 3: Working Wallet */}
        <div className="glass-card-elevated glass-glow-top p-6 sm:p-8 flex flex-col justify-between border-t-2 border-t-[#00D2FF] relative overflow-hidden group hover:-translate-y-1 transition duration-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30">
                100% WITHDRAWABLE
              </span>
              <Briefcase className="w-5 h-5 text-[#00D2FF]" />
            </div>

            <h3 className="font-display text-2xl font-black text-white mb-2">
              WORKING WALLET
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Collects all network earnings: <strong>10% Direct Referral</strong>, <strong>10-Level Daily Team Royalty</strong>, and <strong>Milestone Rank Rewards</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-[#00D2FF]/5 border border-[#00D2FF]/20 mb-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Direct Commission:</span>
                <span className="text-[#00D2FF] font-bold">10% Instant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Team Royalty:</span>
                <span className="text-[#00D2FF] font-bold">10 Levels Daily</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10">
                <span className="text-slate-400">Internal Transfers:</span>
                <span className="text-[#00FFA3] font-bold">P2P Transfer</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <span className="text-[#00D2FF] font-bold">★ Zero Lock:</span>
            <span>Instant cashout anytime with min $2.00 USDT!</span>
          </div>
        </div>
      </div>

      {/* Stake Allocation Structure 60% / 35% / 5% (Slide 09) */}
      <div className="glass-card-elevated p-8 sm:p-10 rounded-3xl border border-white/10 mb-16 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold text-[#00D2FF] uppercase tracking-wider">
              SLIDE 09 &bull; DISCIPLINED CAPITAL DEPLOYMENT
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white mt-1">
              Stake Allocation Structure
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Balancing high-yield quantitative arbitrage with automated smart contract liquidity buffers and audited solvency.
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3] text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> 100% Solvency Audited
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 60% Quant Arbitrage */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center relative group hover:border-[#00D2FF]/50 transition">
            <div className="text-4xl sm:text-5xl font-black text-[#00D2FF] mb-2">
              60%
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Quant Arbitrage
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Deployed across multi-exchange AI arbitrage bots and triangular liquidity spreads capturing risk-free yield.
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/25">
              Proven Revenue
            </span>
          </div>

          {/* 35% Liquidity Reserve */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center relative group hover:border-[#00FFA3]/50 transition">
            <div className="text-4xl sm:text-5xl font-black text-[#00FFA3] mb-2">
              35%
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Liquidity Reserve
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Locked in smart contracts to guarantee instant 24/7 user cashouts and total protocol liquidity solvency.
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/25">
              Instant Cashouts
            </span>
          </div>

          {/* 5% Dev & Security */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-center relative group hover:border-[#FFB800]/50 transition">
            <div className="text-4xl sm:text-5xl font-black text-[#FFB800] mb-2">
              5%
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Dev &amp; Security
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Dedicated to continuous smart contract security audits, Swiss FinTech compliance, and 24/7 tech maintenance.
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/25">
              Swiss Compliance
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
