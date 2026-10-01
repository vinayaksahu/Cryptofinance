"use client";

import { Download, ExternalLink, FileText, CheckCircle2, Sparkles, Layers, ShieldCheck } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function PresentationDownload() {
  const downloadFeatures = [
    "Complete 21 High-Definition Slides (1920x1080 Landscape Vector Deck)",
    "Swiss Leadership & Crypto Valley Corporate HQ Governance (Zug, Switzerland)",
    "Triple-Isolated 3-Wallet Solvency Architecture (Bonus, ROI, Working Wallets)",
    "Free Community Signup Rewards ($1.00 Self + $0.40/Level down 10 tiers)",
    "10% Bonus Utility Protocol (Reduces external activation & compounding capital by 10%)",
    "Dynamic 4.00% Daily Yield Math (2% daily decaying release from 2X contract allocation pool)",
    "The 35-Day Compounding Engine ((1.02)^35 ≈ 2.000 doubles principal with 2X safety cap lock)",
    "10-Level Team Daily Royalty Matrix & 10 Milestone Leadership Rank Rewards",
  ];

  return (
    <section id="download" className="relative z-10 py-20 border-t border-cyan-500/20 bg-[var(--bg-secondary)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>OFFICIAL PRESENTATION DECK &bull; 21 SLIDES (BEP-20)</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-main)] tracking-tight">
            Download Business Presentation
          </h2>
          <p className="text-[var(--text-muted)] text-base sm:text-lg mt-3 font-medium">
            Get the official <strong>Crypto Finance</strong> institutional pitch deck featuring the dynamic 4% daily yield formula, 2X allocation pool, 35-day compounding engine, and complete 10-tier compensation blueprints.
          </p>
        </div>

        {/* Main Presentation Download Card */}
        <div className="max-w-4xl mx-auto glass-card-gold p-8 sm:p-10 rounded-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider font-mono">
                  Official Master Edition
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  21 Slides &bull; 1920x1080 Ultra-HD
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl font-black text-[var(--text-main)]">
                Crypto Finance Presentation Deck
              </h3>

              <p className="text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
                Full-color high-definition slide deck covering the quantitative algo arbitrage model, corporate leadership (Zug, Switzerland), 3-wallet ecosystem, stake walkthroughs, and official rules.
              </p>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex items-center gap-1.5 text-[var(--text-main)]">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Dynamic 4% Daily Yield Math</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-main)]">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>35-Day Compounding Engine</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-main)]">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>10% Bonus Utility Rule</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-main)]">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>10 Ranks &bull; 50:50 Ratio</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-64 shrink-0">
              <a
                href="/api/download-presentation"
                download="Crypto_Finance_Presentation.pdf"
                className="w-full crypto-btn py-4 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25"
              >
                <Download className="w-5 h-5 text-slate-950" /> Download PDF Deck
              </a>
              <a
                href="/Crypto_Finance_Presentation.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl border border-cyan-500/30 bg-[var(--bg-card)] hover:border-cyan-400 text-[var(--text-main)] text-sm font-bold flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" /> View in Browser
              </a>
            </div>
          </div>
        </div>

        {/* Feature List Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {downloadFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-inner-panel border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}