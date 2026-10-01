import { CreditCard, Clock, ShieldCheck, Unlock, ArrowRightLeft, Coins, Sparkles, Percent, Lock, RefreshCw, Layers } from "lucide-react";

export function Terms() {
  // Official Rules & Regulations strictly from Slide 20
  const termsList = [
    {
      icon: CreditCard,
      title: "Minimum $2 Entry",
      desc: "Minimum stake is $2.00 USDT with no rigid packages. Enter with any custom capital amount on Binance Smart Chain (BEP-20).",
      tag: "Slide 20 Rule",
      color: "text-cyan-400",
    },
    {
      icon: Layers,
      title: "2X Contract Pool",
      desc: "Every stake allocates an instant 200% payout pool releasing 2.00% daily decaying returns (starts at 4.00% daily on your capital).",
      tag: "2X Pool",
      color: "text-sky-400",
    },
    {
      icon: Sparkles,
      title: "10% Bonus Wallet Utility",
      desc: "Bonus Wallet funds up to 10% of any ID activation or compounding transaction. Non-withdrawable to guarantee company solvency.",
      tag: "10% Utility",
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: RefreshCw,
      title: "35-Day 2X Compounding",
      desc: "Reinvesting 2% daily pool returns doubles principal in 35 days ((1.02)^35 ≈ 2.000). At 2X, 1 mandatory withdrawal is required before resuming.",
      tag: "2X Safety Lock",
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      icon: Percent,
      title: "10% Liquidity Fee",
      desc: "Flat 10% system liquidity fee on external withdrawals. Funds the smart contract reserve pool and 24/7 arbitrage liquidity.",
      tag: "Solvency Fee",
      color: "text-sky-500 dark:text-cyan-400",
    },
    {
      icon: ArrowRightLeft,
      title: "Secondary Wallet P2P",
      desc: "Instant peer transfers from Secondary Wallet to any member ID for peer activations and team coordination.",
      tag: "P2P Utility",
      color: "text-purple-500 dark:text-purple-400",
    },
    {
      icon: ShieldCheck,
      title: "Cashout Limits",
      desc: "Minimum cashout is $2.00 USDT. Maximum per transaction is $5,000 USDT. Automated Web3 dispatches 24/7.",
      tag: "Min $2 | Max $5,000",
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      icon: Lock,
      title: "50:50 Rank Ratio Criteria",
      desc: "Rank milestone rewards require a 50:50 ratio of team volume between Strong and Weak legs. Turnover accumulates permanently.",
      tag: "50:50 Leg Ratio",
      color: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <section id="terms" className="relative z-10 py-20 border-t border-slate-200/80 dark:border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sky-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 font-mono">
            IMMUTABLE PROTOCOL STANDARDS &bull; SLIDE 20
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Official Rules &amp; Regulations
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Transparent on-chain rules ensuring system sustainability, fairness, and mathematical solvency. Code is law.
          </p>
        </div>

        {/* 8 Rules Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {termsList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-sky-400/50 hover:-translate-y-1 transition duration-200 border border-slate-200/80 dark:border-cyan-500/25"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-cyan-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900/60 text-sky-600 dark:text-cyan-400 border border-slate-200 dark:border-cyan-500/20 uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                    {item.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-subtle)] font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Audited Smart Protocol
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}