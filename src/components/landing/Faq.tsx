"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Crypto Finance generate sustainable 4% daily yields?",
      a: "Our yields are backed by institutional quantitative excellence: high-frequency algorithmic arbitrage across major decentralized liquidity venues, triangular spreads, and multi-exchange AI bots. 60% of staked capital is deployed in quant arbitrage, 35% is locked in smart contract liquidity reserves to guarantee instant cashouts, and 5% is dedicated to compliance and dev security.",
    },
    {
      q: "How does the Dynamic 4% Daily ROI and 2X Contract Pool operate?",
      a: "Every stake instantly unlocks a 2X Contract Allocation Pool (e.g. $100 stake unlocks a $200 pool). The smart contract pays 2.00% daily calculated on the remaining pool balance. On Day 1, you receive $200 × 2% = $4.00 USDT (an exact 4.00% daily ROI on your stake). Payouts continue daily on the decaying balance until 100% of the 2X pool ($200) is extracted over 525 days!",
    },
    {
      q: "What is the 10% Bonus Utility Rule?",
      a: "Every member receives a free $1.00 USDT Self Signup Bonus plus $0.40 USDT per level across 10 referral tiers into their Bonus Wallet. Whenever you or your team activates a new stake or executes compounding, up to 10% can be funded directly from the Bonus Wallet, saving real capital while strictly preserving company liquidity reserves.",
    },
    {
      q: "What is the 35-Day Compounding Engine and 2X Cap Lock Rule?",
      a: "By choosing compounding instead of daily withdrawal, reinvesting your 2% daily pool returns doubles your principal in exactly 35 days: (1.02)^35 ≈ 2.000. When your total payout approaches 2X of initial stake, compounding reaches its cap and the final payout is capped to the exact balance needed to complete 2X (200%), ensuring exact doubling without exceeding protocol limits.",
    },
    {
      q: "What are the cashout rules and limits?",
      a: "Withdrawals are 100% automated on Binance Smart Chain (BEP-20 USDT) with minimum $2.00 USDT and maximum $5,000 USDT per transaction. A flat 10% system liquidity fee applies to external cashouts. Internal P2P transfers to other members are 100% instant.",
    },
    {
      q: "How does the 10-Level Daily Team Royalty work?",
      a: "Team royalty is paid daily based on the daily ROI generation of downline members. You earn 10% on Level 1, 5% on Level 2, 2% on Levels 3 through 5, and 1% on Levels 6 through 10. Sponsoring 1 active direct referral unlocks Level 1, and 10 active direct referrals unlocks all 10 tiers permanently.",
    },
  ];

  return (
    <section id="faq" className="relative z-10 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sky-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25">
            FREQUENTLY ASKED QUESTIONS &bull; PROTOCOL DECK
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Everything you need to know about the official Crypto Finance quantitative architecture and yield protocol.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="glass-card rounded-2xl overflow-hidden transition-all duration-200 border border-slate-200/80 dark:border-cyan-500/25"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-display font-bold text-base sm:text-lg text-[var(--text-main)] hover:text-sky-600 dark:hover:text-cyan-400 transition"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-sky-500 dark:text-cyan-400 shrink-0" />
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--text-subtle)] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-sky-500 dark:text-cyan-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-subtle)] pt-4 font-medium animate-in fade-in duration-150">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
