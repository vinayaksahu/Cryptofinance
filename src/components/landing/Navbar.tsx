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
  const pdfPillLabel = "Deck (PDF)";
  const pdfDrawerLabel = "Download Official Presentation Deck (21 Slides)";

  // Fetch live system mode with target countdown expiry check
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  // Clean, non-wrapping navigation links
  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Protocol", href: "#packages" },
    { name: "Calculator", href: "#calculator" },
    { name: "10-Levels", href: "#referrals" },
    { name: "Milestones", href: "#ranks" },
    { name: "Official Deck", href: "#download" },
    { name: "Rules", href: "#terms" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-20 bg-[var(--bg-main)]/95 backdrop-blur-2xl border-b border-cyan-500/20 shadow-lg shadow-black/20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo & Title Lockup */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <Image
                  src="/crypto_coin_hero.png"
                  alt="Crypto Finance Logo"
                  width={38}
                  height={38}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="flex flex-col justify-center shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display font-black text-base sm:text-xl tracking-wider text-cyan-400 dark:text-cyan-300 uppercase whitespace-nowrap leading-none">
                  CRYPTO FINANCE
                </span>
                <span className="hidden md:inline-block text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 dark:text-amber-400 font-black border border-amber-500/30 uppercase leading-none">
                  SWISS HQ
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-[var(--text-subtle)] tracking-widest uppercase font-semibold mt-1 whitespace-nowrap leading-none font-mono">
                QUANTITATIVE DEFI PROTOCOL
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-2 rounded-xl whitespace-nowrap hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right: Controls & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Compact Theme Dropdown */}
            <ThemeToggle variant="compact" />

            {/* Official PDF Deck Download (Desktop only) */}
            <a
              href={pdfHref}
              download={pdfFileName}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cyan-500/30 text-cyan-500 dark:text-cyan-300 hover:bg-cyan-400/10 text-xs font-bold transition whitespace-nowrap"
              title="Download Official Crypto Finance Presentation Deck"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{pdfPillLabel}</span>
            </a>

            {/* Auth Buttons or Mode Badges */}
            {systemMode === "MAINTENANCE" ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold whitespace-nowrap shadow-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="hidden sm:inline">System Maintenance</span>
                <span className="sm:hidden">Maintenance</span>
              </div>
            ) : systemMode === "PRELAUNCH" ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 text-xs font-bold whitespace-nowrap shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">Pre-Launching Phase</span>
                <span className="sm:hidden">Pre-Launch</span>
              </div>
            ) : (
              <>
                {/* Login Button */}
                <Link
                  href="/login"
                  className="flex items-center px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-cyan-500/40 text-cyan-500 dark:text-cyan-300 text-xs font-bold hover:bg-cyan-400/10 transition whitespace-nowrap shadow-sm"
                >
                  <span className="sm:hidden">Login</span>
                  <span className="hidden sm:inline">Sign In</span>
                </Link>

                {/* Get Started / Join Button */}
                <Link
                  href="/register"
                  className="crypto-btn px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md whitespace-nowrap"
                >
                  <span className="sm:hidden">Join</span>
                  <span className="hidden sm:inline">Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 rounded-xl border border-cyan-500/30 text-[var(--text-main)] hover:bg-cyan-400/10 transition shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-20 bottom-0 z-40 bg-[var(--bg-main)] border-t border-cyan-500/20 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="max-w-md mx-auto px-5 py-6 space-y-5 pb-20">
            {/* Theme switcher card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-cyan-500/20 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                Theme Mode
              </span>
              <ThemeToggle variant="segmented" />
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-main)] hover:border-cyan-400 hover:text-cyan-400 transition flex items-center justify-between group shadow-sm"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-subtle)] group-hover:text-cyan-400 transition-colors" />
                </a>
              ))}
            </nav>

            {/* Dynamic Theme PDF Download Button in Drawer */}
            <a
              href={pdfHref}
              download={pdfFileName}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-xl border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm bg-cyan-400/5 hover:bg-cyan-400/10 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              {pdfDrawerLabel}
            </a>

            {/* Auth Buttons */}
            {systemMode === "MAINTENANCE" ? (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center text-xs text-rose-300 font-bold">
                System Maintenance in Progress &bull; Member Login Paused
              </div>
            ) : systemMode === "PRELAUNCH" ? (
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center text-xs text-cyan-400 font-bold">
                Pre-Launching Phase Active &bull; Public Access Opening Soon
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-4 rounded-xl border border-cyan-500/30 text-center font-bold text-xs sm:text-sm text-cyan-400 hover:bg-cyan-400/10 transition"
                >
                  Login / Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="crypto-btn py-3 px-4 rounded-xl text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md"
                >
                  Join Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Trust footer */}
            <div className="pt-4 text-center">
              <span className="text-[11px] text-[var(--text-subtle)] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Crypto Valley Tower &bull; Zug, Switzerland
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}