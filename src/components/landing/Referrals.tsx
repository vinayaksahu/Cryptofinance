"use client";

import { useState } from "react";
import { Gift, Users, ShieldCheck, ArrowRight, CheckCircle2, Zap, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from "@/lib/constants";

export function Referrals() {
  // Exact 10-Level Royalty Matrix from Slide 16 & 17
  const levels = [
    { level: 1, percent: 10, rule: "1 Active Direct", totalDirects: "1 Direct", color: "text-sky-600 dark:text-cyan-400 font-bold" },
    { level: 2, percent: 5, rule: "2 Active Directs", totalDirects: "2 Directs", color: "text-sky-600 dark:text-sky-400 font-bold" },
    { level: 3, percent: 2, rule: "3 Active Directs", totalDirects: "3 Directs", color: "text-emerald-600 dark:text-emerald-400 font-bold" },
    { level: 4, percent: 2, rule: "4 Active Directs", totalDirects: "4 Directs", color: "text-emerald-600 dark:text-emerald-400 font-bold" },
    { level: 5, percent: 2, rule: "5 Active Directs", totalDirects: "5 Directs", color: "text-emerald-600 dark:text-emerald-400 font-bold" },
    { level: 6, percent: 1, rule: "6 Active Directs", totalDirects: "6 Directs", color: "text-indigo-600 dark:text-indigo-400 font-bold" },
    { level: 7, percent: 1, rule: "7 Active Directs", totalDirects: "7 Directs", color: "text-indigo-600 dark:text-indigo-400 font-bold" },
    { level: 8, percent: 1, rule: "8 Active Directs", totalDirects: "8 Directs", color: "text-indigo-600 dark:text-indigo-400 font-bold" },
    { level: 9, percent: 1, rule: "9 Active Directs", totalDirects: "9 Directs", color: "text-purple-600 dark:text-purple-400 font-bold" },
    { level: 10, percent: 1, rule: "10 Active Directs", totalDirects: "10 Directs (Full)", color: "text-sky-600 dark:text-cyan-300 font-bold" },
  ];

  return (
    <section id="referrals" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sky-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 font-mono">
            NETWORK INCENTIVES &bull; SLIDES 05, 15, 16 &amp; 17
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            10% Instant Direct &amp; 10-Tier Team Royalty
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Earn instant 10% cash commissions on every activation and repeat compounding, plus recurring daily royalties across 10 downline generations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Direct Bonus & Free Rewards Card (5 Cols) from Slide 05 & 15 */}
          <div className="lg:col-span-5 glass-card-elevated p-8 rounded-3xl flex flex-col justify-between border border-sky-500/30">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-cyan-400 mb-6 shadow-sm">
                <Gift className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-black uppercase tracking-wider font-mono">
                  Slide 15 Commission
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold font-mono">
                  Instant Working Wallet Credit
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl font-black text-[var(--text-main)]">
                10% Direct Referral Reward
              </h3>

              <p className="text-[var(--text-muted)] text-sm sm:text-base mt-3 leading-relaxed">
                The second your direct referral activates their stake or executes compounding, exactly <strong>10%</strong> is immediately credited to your Working Wallet with zero lockup!
              </p>

              {/* Free Registration Rewards Box (Slide 05) */}
              <div className="my-6 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-cyan-500/20 text-xs sm:text-sm space-y-3">
                <div className="font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-wider text-xs flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4 text-sky-500 dark:text-cyan-400" /> Free Community Signup Rewards (Slide 05)
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">Free Self Registration:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">$1.00 USDT Bonus</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">10-Tier Team Signup Bounty:</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-cyan-400">$0.40 / Tier (10 Levels)</span>
                </div>
                <div className="text-[11px] text-[var(--text-subtle)]">
                  ★ Stored in Bonus Wallet &bull; Funds up to 10% of any activation or compounding!
                </div>
              </div>

              {/* Affiliate Highlights from Slide 15 */}
              <div className="space-y-2.5 text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 dark:text-cyan-400 shrink-0" />
                  <span><strong>Zero Lockups:</strong> Withdrawable immediately with min $2.00 USDT.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 dark:text-cyan-400 shrink-0" />
                  <span><strong>Repeat Compounding:</strong> Earn 10% on every repeat compounding top-up!</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 dark:text-cyan-400 shrink-0" />
                  <span><strong>Unlimited Width:</strong> Refer as many direct members as you wish.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200/80 dark:border-cyan-500/20">
              <Link
                href="/register"
                className="w-full crypto-btn py-3.5 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                Join &bull; Build Your Team <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: 10-Level Royalty Matrix (7 Cols) from Slide 16 & 17 */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between border border-slate-200/80 dark:border-cyan-500/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-cyan-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-bold text-[var(--text-main)]">
                      10-Level Daily Team Royalty
                    </h4>
                    <span className="text-xs text-[var(--text-subtle)] font-mono">
                      Calculated on Downline Members&apos; Daily ROI (Slides 16 &amp; 17)
                    </span>
                  </div>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-cyan-400 text-xs font-mono font-bold">
                  10 Tiers
                </span>
              </div>

              {/* Levels Table */}
              <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 dark:bg-[#0B132B] text-[var(--text-muted)] font-mono">
                    <tr>
                      <th className="py-3 px-4 font-bold">Generation Tier</th>
                      <th className="py-3 px-4 font-bold text-center">Daily Royalty %</th>
                      <th className="py-3 px-4 font-bold">Earning Base</th>
                      <th className="py-3 px-4 font-bold text-right">Unlock Criteria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {levels.map((lvl) => (
                      <tr key={lvl.level} className="hover:bg-cyan-500/5 transition">
                        <td className="py-2.5 px-4 font-bold text-[var(--text-main)] font-mono">
                          Tier {lvl.level}
                        </td>
                        <td className={`py-2.5 px-4 text-center font-mono text-base ${lvl.color}`}>
                          {lvl.percent}%
                        </td>
                        <td className="py-2.5 px-4 text-[var(--text-muted)] text-xs">
                          Daily ROI of Tier {lvl.level}
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs font-semibold text-[var(--text-main)] font-mono">
                          {lvl.rule}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Qualification Note */}
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-subtle)] font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Paid 365 Days a Year &bull; 10 Active Directs unlocks all 10 Tiers
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}