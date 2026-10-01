"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X, Download, ShieldCheck, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemMode, setSystemMode] = useState<"LIVE" | "PRELAUNCH" | "MAINTENANCE">("LIVE");
  const { resolvedTheme } = useTheme();

  const isLight = resolvedTheme === "light";
  const pdfHref = `/api/download-presentation?theme=${isLight ? "light" : "dark"}&v=20261001`;
  const pdfFileName = "Crypto_Finance_Presentation.pdf";

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

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "3-Wallets", href: "#wallets" },
    { name: "Protocol", href: "#packages" },
    { name: "Calculator", href: "#calculator" },
    { name: "10-Levels", href: "#referrals" },
    { name: "Milestones", href: "#ranks" },
    { name: "Rules", href: "#terms" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <>
      {/* Floating Frosted Glass Capsule Navbar */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 max-w-7xl mx-auto pointer-events-none">
        <header className="pointer-events-auto h-16 rounded-full bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 px-4 sm:px-6 flex items-center justify-between shadow-[0_12px_40px_rgba(2,132,199,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all">
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-9 h-9 rounded-2xl overflow-hidden bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 p-0.5 shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <Image
                  src="/crypto_coin_hero.png"
                  alt="Crypto Finance Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="flex flex-col justify-center shrink-0">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white uppercase whitespace-nowrap leading-none">
                CRYPTO FINANCE
              </span>
              <span className="text-[9px] text-sky-600 dark:text-sky-400 font-bold tracking-widest uppercase mt-0.5 whitespace-nowrap leading-none font-mono">
                QUANTITATIVE PROTOCOL
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 rounded-full hover:text-slate-950 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/[0.08] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right: Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle variant="compact" />

            {/* Official PDF Deck */}
            <a
              href={pdfHref}
              download={pdfFileName}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-bold text-sky-600 dark:text-sky-300 hover:text-sky-800 dark:hover:text-white transition whitespace-nowrap"
              title="Download Presentation Deck"
            >
              <Download className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Deck (PDF)</span>
            </a>

            {/* Auth Buttons */}
            {systemMode === "MAINTENANCE" ? (
              <div className="glass-pill px-3 py-1.5 text-rose-500 dark:text-rose-400 text-xs font-bold whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Maintenance</span>
              </div>
            ) : systemMode === "PRELAUNCH" ? (
              <div className="glass-pill px-3 py-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span>Pre-Launch</span>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-full glass-btn-secondary text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition whitespace-nowrap"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="crypto-btn px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md whitespace-nowrap"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full glass-btn-secondary text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-sky-500 dark:text-sky-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/80 backdrop-blur-2xl pt-24 px-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="max-w-md mx-auto space-y-4 pb-20">
            <div className="p-4 rounded-3xl glass-card flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Theme Mode
              </span>
              <ThemeToggle variant="segmented" />
            </div>

            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-2xl glass-card text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white flex items-center justify-between group transition"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
                </a>
              ))}
            </nav>

            <a
              href={pdfHref}
              download={pdfFileName}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-2xl glass-btn-secondary font-bold flex items-center justify-center gap-2 text-xs text-sky-600 dark:text-sky-400"
            >
              <Download className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              Download Official Deck (PDF)
            </a>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 rounded-2xl glass-btn-secondary text-center font-bold text-xs text-slate-800 dark:text-slate-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="crypto-btn py-3 px-4 rounded-2xl text-center font-bold text-xs flex items-center justify-center gap-1.5"
              >
                Join Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}