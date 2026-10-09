"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, ShieldCheck, Mail, MapPin, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [systemMode, setSystemMode] = useState<"LIVE" | "PRELAUNCH" | "MAINTENANCE">("LIVE");

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.configs) {
          if (data.configs.MAINTENANCE_MODE === "true") {
            setSystemMode("MAINTENANCE");
          } else if (data.configs.PRELAUNCH_MODE === "true") {
            const targetDateStr = data.configs.PRELAUNCH_TARGET_DATE || "2026-10-01T20:00";
            let targetTime: number;
            if (/[+-]\d{2}(:\d{2})?$|Z$/i.test(targetDateStr)) {
              targetTime = new Date(targetDateStr).getTime();
            } else {
              targetTime = new Date(`${targetDateStr}:00+00:00`).getTime();
            }

            const evaluateMode = () => {
              if (!isNaN(targetTime) && Date.now() >= targetTime) {
                setSystemMode("LIVE");
              } else {
                setSystemMode("PRELAUNCH");
              }
            };

            evaluateMode();
            timer = setInterval(evaluateMode, 1000);
          } else {
            setSystemMode("LIVE");
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
    <footer className="relative z-10 border-t border-slate-200/80 dark:border-cyan-500/20 bg-transparent transition-colors duration-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-200/80 dark:border-cyan-500/20">
          {/* Brand & Address (5 Cols) from Slide 03 & 21 */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/30">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo_transparent.png"
                    alt="CryptoNova Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-wider text-sky-600 dark:text-cyan-400 uppercase">
                  CRYPTONOVA
                </span>
                <span className="block text-[10px] text-[var(--text-subtle)] tracking-widest uppercase">
                  QUANTITATIVE ALGO PROTOCOL &bull; BEP-20
                </span>
              </div>
            </Link>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md font-medium">
              Next-generation quantitative wealth protocol engineered for mathematical certainty, sustainable 4% daily yields, and triple-isolated liquidity. Powered by USDT on Binance Smart Chain.
            </p>

            <div className="space-y-2 text-xs text-[var(--text-subtle)] pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-500 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>{APP_CONFIG.headquarters}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-500 dark:text-cyan-400 shrink-0" />
                <span>{APP_CONFIG.officialEmail}</span>
              </div>
            </div>
          </div>

          {/* Quick Links (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-widest block">
              Ecosystem Navigation
            </span>
            <ul className="space-y-2 text-xs font-medium text-[var(--text-muted)]">
              <li>
                <a href="#about" className="hover:text-sky-600 dark:hover:text-cyan-400 transition">About Protocol &amp; Swiss HQ</a>
              </li>
              <li>
                <a href="#packages" className="hover:text-sky-600 dark:hover:text-cyan-400 transition">2X Pool &bull; 4% Dynamic Yield</a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-sky-600 dark:hover:text-cyan-400 transition">Interactive Yield Calculator</a>
              </li>
              <li>
                <a href="#referrals" className="hover:text-sky-600 dark:hover:text-cyan-400 transition">10-Level Daily Team Royalty</a>
              </li>
              <li>
                <a href="#ranks" className="hover:text-sky-600 dark:hover:text-cyan-400 transition">Milestone Rank Rewards (50:50)</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-sky-600 dark:hover:text-cyan-400 transition">Official Rules &amp; Regulations</a>
              </li>
            </ul>
          </div>

          {/* Official Deck & Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-widest block">
              Presentation &bull; Controls
            </span>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-inner-panel border border-slate-200/80 dark:border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-main)] font-semibold">Theme Mode:</span>
                <ThemeToggle variant="segmented" />
              </div>

              <a
                href={pdfHref}
                download={pdfFileName}
                className="w-full crypto-btn py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>Download Presentation (PDF)</span>
              </a>
            </div>

            <div className="text-[11px] text-[var(--text-subtle)] space-y-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Audited BEP-20 Smart Contract Standard
              </span>
              <span className="block">
                Official Portal: cryptonova.world
              </span>
            </div>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-subtle)]">
          <p>
            &copy; {new Date().getFullYear()} CryptoNova Protocol. All Rights Reserved. Headquartered in Zug, Switzerland.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Minimum Entry: $2 USDT</span>
            <span>&bull;</span>
            <span>Cashout Min: $2 USDT</span>
            <span>&bull;</span>
            <span>24/7 Automated Web3</span>
          </div>
        </div>
      </div>
    </footer>
  );
}