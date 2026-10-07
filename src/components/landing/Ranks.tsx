import { Trophy, Award, Plane, Watch, Car, Crown, Smartphone, Laptop, Sparkles, CheckCircle2, Gift, Gem, Tablet, Home } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function Ranks() {
  // Exact 10 Milestone & Executive Ranks from Slides 18 & 19
  const ranks = [
    {
      id: 1,
      rank: "Rank 1 (Starter)",
      strong: "$50",
      weak: "$50",
      total: "$100",
      cash: "$5.00 USDT",
      reward: "Official Welcome Kit",
      icon: Gift,
      featured: false,
    },
    {
      id: 2,
      rank: "Rank 2 (Bronze)",
      strong: "$125",
      weak: "$125",
      total: "$250",
      cash: "$12.50 USDT",
      reward: "Branded Polo / Merchandise",
      icon: Award,
      featured: false,
    },
    {
      id: 3,
      rank: "Rank 3 (Silver)",
      strong: "$250",
      weak: "$250",
      total: "$500",
      cash: "$25.00 USDT",
      reward: "Wireless Bluetooth Earbuds",
      icon: Sparkles,
      featured: false,
    },
    {
      id: 4,
      rank: "Rank 4 (Gold)",
      strong: "$500",
      weak: "$500",
      total: "$1,000",
      cash: "$50.00 USDT",
      reward: "Smart Fitness Tracker Band",
      icon: Watch,
      featured: true,
    },
    {
      id: 5,
      rank: "Rank 5 (Platinum)",
      strong: "$1,250",
      weak: "$1,250",
      total: "$2,500",
      cash: "$125.00 USDT",
      reward: "Smart Android Tablet",
      icon: Tablet,
      featured: false,
    },
    {
      id: 6,
      rank: "Rank 6 (Sapphire)",
      strong: "$5,000",
      weak: "$5,000",
      total: "$10,000",
      cash: "$500.00 USDT",
      reward: "Latest Flagship Smartphone",
      icon: Smartphone,
      featured: true,
    },
    {
      id: 7,
      rank: "Rank 7 (Ruby)",
      strong: "$12,500",
      weak: "$12,500",
      total: "$25,000",
      cash: "$1,250.00 USDT",
      reward: "Apple MacBook Pro",
      icon: Laptop,
      featured: false,
    },
    {
      id: 8,
      rank: "Rank 8 (Emerald)",
      strong: "$25,000",
      weak: "$25,000",
      total: "$50,000",
      cash: "$2,500.00 USDT",
      reward: "Swiss Alps & Geneva VIP Tour",
      icon: Plane,
      featured: true,
    },
    {
      id: 9,
      rank: "Rank 9 (Diamond)",
      strong: "$50,000",
      weak: "$50,000",
      total: "$100,000",
      cash: "$5,000.00 USDT",
      reward: "Rolex Luxury Timepiece",
      icon: Gem,
      featured: false,
    },
    {
      id: 10,
      rank: "Rank 10 (Crown)",
      strong: "$5,000,000",
      weak: "$5,000,000",
      total: "$10,000,000",
      cash: "$500,000.00 USDT",
      reward: "Executive Waterfront Penthouse",
      icon: Crown,
      featured: true,
    },
  ];

  return (
    <section id="ranks" className="relative z-10 py-20 border-t border-slate-200/80 dark:border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sky-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25">
            LEADERSHIP RECOGNITION &bull; SLIDES 18 &amp; 19
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            Milestone &amp; Executive Rank Rewards
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Cumulative team business volume with <strong>50:50 Ratio Criteria</strong> (Strong Leg 50% : Weak Leg 50%). Choose between <strong>Instant Cash Bonus</strong> or <strong>Luxury Reward</strong>!
          </p>
        </div>

        {/* 50:50 Rule Notice Banner */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-cyan-500/30 max-w-3xl mx-auto mb-12 text-center text-xs sm:text-sm text-[var(--text-muted)] flex items-center justify-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-sky-500 dark:text-cyan-400 shrink-0" />
          <span>
            <strong>50:50 Ratio Rule:</strong> 50% team business volume from Strong Leg and 50% from other legs. Turnover accumulates permanently with zero time expiry!
          </span>
        </div>

        {/* Ranks Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ranks.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className={`glass-card p-5 rounded-3xl flex flex-col justify-between relative transition duration-200 hover:-translate-y-1 ${
                  r.featured ? "border-sky-400 dark:border-cyan-400 shadow-lg shadow-sky-500/15" : "border-slate-200/80 dark:border-cyan-500/25"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    {r.featured && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500 text-white font-black uppercase">
                        Featured
                      </span>
                    )}
                  </div>

                  <h4 className="font-display text-base font-black text-[var(--text-main)] mb-1">
                    {r.rank}
                  </h4>

                  <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-[var(--border-subtle)] text-[11px] space-y-1 mb-3">
                    <div className="flex justify-between text-[var(--text-subtle)]">
                      <span>Strong (50%):</span>
                      <span className="font-bold text-sky-600 dark:text-cyan-400">{r.strong}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-subtle)]">
                      <span>Weak (50%):</span>
                      <span className="font-bold text-sky-600 dark:text-cyan-400">{r.weak}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-main)] pt-1 border-t border-slate-200/80 dark:border-[var(--border-subtle)]">
                      <span>Total Volume:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{r.total}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-[var(--border-subtle)] space-y-1.5 text-xs">
                  <div className="text-[10px] text-[var(--text-subtle)] uppercase">Reward Option A:</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{r.cash}</div>
                  <div className="text-[10px] text-[var(--text-subtle)] uppercase pt-1">Reward Option B:</div>
                  <div className="font-bold text-[var(--text-main)] text-[11px]">{r.reward}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
