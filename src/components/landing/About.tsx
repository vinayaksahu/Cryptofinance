import Image from "next/image";
import { Building, TrendingUp, DollarSign, Globe, MapPin, Calendar, Mail, CheckCircle2, Shield, Cpu, Lock, PieChart } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function About() {
  return (
    <section id="about" className="relative z-10 py-20 border-t border-cyan-500/20 bg-[var(--bg-secondary)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 font-mono">
            SWISS JURISDICTION &bull; QUANTITATIVE ARCHITECTURE &bull; SLIDES 02-03
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] mt-3">
            About Crypto Finance
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Pioneering algorithmic quantitative arbitrage, autonomous liquidity protocols, and mathematical solvency.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 4 Pillars (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Pillar 1 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-cyan-400/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                  Institutional Algo Arbitrage
                </h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Operates high-frequency algorithmic arbitrage across major blockchain liquidity venues, capturing risk-neutral price differentials 24/7.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-cyan-400 font-semibold flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" /> Zero Emotional Trading
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-emerald-400/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <PieChart className="w-6 h-6" />
                </div>
                <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                  Audited Capital Allocation
                </h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Disciplined 60% Quant Arbitrage deployment, 35% Smart Contract Liquidity Reserve for instant user cashouts, and 5% Security maintenance.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-emerald-400 font-semibold flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" /> 35% Instant Cashout Reserve
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-amber-400/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                  3-Wallet Solvency Engine
                </h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Triple-isolated ledgers completely eliminate bank-run risks. Promotional community credits are isolated from withdrawable yield reserves.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-amber-400 font-semibold flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" /> 10% Utility &bull; Zero Deficit
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-sky-400/50 transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="font-display text-lg font-bold text-[var(--text-main)] mb-2">
                  100% On-Chain Standard
                </h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Binance Smart Chain (BEP-20 USDT) native architecture. Zero fiat delays, automated instant Web3 payouts, and 100% verifiable mathematical logic.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-sky-400 font-semibold flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" /> Code Is Law &bull; Min $2 Payout
              </div>
            </div>
          </div>

          {/* Right Leadership & HQ Card (5 Cols) from Slide 03 */}
          <div className="lg:col-span-5 glass-card-gold p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
            {/* Header Badge */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6 font-mono">
                <Building className="w-3.5 h-3.5" />
                <span>CORPORATE LEADERSHIP &bull; SWISS JURISDICTION</span>
              </div>

              {/* Managing Leadership Details */}
              <div className="mb-6">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block font-mono">
                  MANAGING LEADERSHIP
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-[var(--text-main)] mt-1">
                  Mr. Alex Rivera
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-amber-400 mt-0.5">
                  Chairman &amp; Managing Director (CMD)
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                  Veteran quantitative architect and FinTech strategist with over 15 years directing algorithmic trading desks across Zurich, London, and Singapore.
                </p>
              </div>

              {/* Physical Corporate Presence */}
              <div className="p-4 rounded-2xl bg-inner-panel mb-6 border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[var(--text-main)] block">
                      Global Headquarters
                    </span>
                    <span className="text-xs text-[var(--text-muted)] leading-relaxed mt-0.5 block">
                      Crypto Valley Tower, Zug, Switzerland
                    </span>
                    <span className="text-[11px] text-cyan-400 font-semibold mt-1 block">
                      Operating under rigorous Swiss FinTech regulatory standards.
                    </span>
                  </div>
                </div>
              </div>

              {/* Stake Allocation Breakdown (Slide 09) */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[var(--text-subtle)] uppercase tracking-wider block font-mono">
                  Audited Stake Deployment (Slide 09)
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[var(--text-main)]">Quant Arbitrage AI Bots</span>
                    <span className="font-mono font-bold text-cyan-400">60%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full w-[60%]" />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-semibold text-[var(--text-main)]">Smart Contract Liquidity Reserve</span>
                    <span className="font-mono font-bold text-emerald-400">35%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[35%]" />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-semibold text-[var(--text-main)]">Compliance &amp; Dev Security</span>
                    <span className="font-mono font-bold text-amber-400">5%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-[5%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Official Support Footer */}
            <div className="mt-8 pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-subtle)]">
              <span className="flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                support@cryptofinance.online
              </span>
              <span className="font-mono font-bold text-cyan-400">
                cryptofinance.online
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}