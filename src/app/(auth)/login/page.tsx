"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, ChevronDown, Eye, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [systemMode, setSystemMode] = useState<"LIVE" | "PRELAUNCH" | "MAINTENANCE">("LIVE");
  const [noticeText, setNoticeText] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.configs) {
          if (data.configs.MAINTENANCE_MODE === "true") {
            setSystemMode("MAINTENANCE");
            setNoticeText(
              data.configs.MAINTENANCE_NOTICE_TEXT ||
                "Crypto Finance is currently undergoing scheduled infrastructure upgrades. Public member access will resume shortly."
            );
          } else if (data.configs.PRELAUNCH_MODE === "true") {
            setSystemMode("PRELAUNCH");
            setNoticeText(
              data.configs.PRELAUNCH_NOTICE_TEXT ||
                "Crypto Finance is currently in its official Pre-Launch phase. Public member registration and user dashboards will open shortly."
            );
          } else {
            setSystemMode("LIVE");
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const rawInput = mobileNumber.trim();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: rawInput,
          password,
          portal: "member",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      window.location.replace(data.redirectTo || "/member");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (systemMode === "MAINTENANCE") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#08090C] text-white">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#12141A] border border-white/10 text-center shadow-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>System Maintenance</span>
          </div>
          <h2 className="text-2xl font-black text-white">Maintenance in Progress</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{noticeText}</p>
          <Link
            href="/"
            className="w-full py-3 mt-6 rounded-xl bg-gradient-to-r from-sky-400 to-pink-500 text-xs font-bold flex items-center justify-center gap-2 text-white shadow-md"
          >
            <span>Return to Homepage</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-between items-center relative overflow-hidden selection:bg-pink-500 selection:text-white">
      {/* Background Ambience with glowing Bitcoin Coin in upper right */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div className="absolute top-10 right-0 w-64 h-64 rounded-full bg-pink-500/20 blur-2xl" />
        <div className="absolute -top-20 left-0 w-72 h-72 rounded-full bg-indigo-600/15 blur-3xl" />

        {/* Realistic Bitcoin 3D Coin Image placed at the top-right matching screenshot */}
        <div className="absolute top-0 right-0 w-[260px] sm:w-[320px] h-[220px] sm:h-[260px] pointer-events-none overflow-hidden">
          <img
            src="/crypto_login_bg.jpg"
            alt="Bitcoin Hologram"
            className="w-full h-full object-cover object-top opacity-55 mix-blend-screen scale-110 translate-x-4 -translate-y-4"
          />
          {/* Soft vignette gradients to fade naturally into dark background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07090E]/60 to-[#07090E]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-transparent to-transparent" />
        </div>
      </div>

      {/* Main Container - Mobile Centered Frame */}
      <div className="w-full max-w-[420px] min-h-screen flex flex-col justify-between relative z-10 px-6 pt-5 pb-8">
        <div>
          {/* Top Bar: Back Arrow & Globe Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Back"
              className="text-white hover:text-slate-300 transition-colors p-1 -ml-1 cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>

            <button
              type="button"
              aria-label="Language Selector"
              className="w-9 h-9 rounded-full bg-[#181A22] border border-white/10 flex items-center justify-center text-slate-200 hover:text-white hover:border-white/25 transition-all shadow-sm cursor-pointer"
            >
              <Globe className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>

          {/* Heading Section */}
          <div className="pt-2">
            <h1 className="text-[34px] font-black text-white tracking-tight leading-none">
              Login
            </h1>
            <div className="mt-3 space-y-1">
              <p className="text-[13px] font-bold text-slate-200 tracking-normal">
                Welcome to login!
              </p>
              <p className="text-[12px] text-slate-300 font-normal leading-relaxed">
                please login to start your crypto trading journey!
              </p>
            </div>
          </div>

          {/* Glowing Gradient Divider Line */}
          <div className="relative my-7 w-full h-[1.5px] bg-gradient-to-r from-pink-500 via-purple-400 to-sky-400 opacity-90 shadow-[0_0_12px_rgba(244,114,182,0.6)]" />

          {/* Error Message Box */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: Mobile number */}
            <div>
              <label className="block text-[13px] font-bold text-white mb-2 tracking-wide">
                Mobile number
              </label>
              <div className="flex items-center gap-2.5">
                {/* Country Code Dropdown */}
                <div className="relative shrink-0">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    aria-label="Country Code"
                    className="h-[50px] pl-3.5 pr-8 rounded-2xl bg-[#12141A] border border-white/10 text-white font-bold text-sm appearance-none focus:outline-none focus:border-pink-500/60 cursor-pointer shadow-inner"
                  >
                    <option value="+91">+91</option>
                    <option value="+971">+971</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+65">+65</option>
                    <option value="+60">+60</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Mobile / User ID Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Please enter your Mobile number"
                    className="w-full h-[50px] px-4 rounded-2xl bg-[#12141A] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-pink-500/60 transition-colors shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <label className="block text-[13px] font-bold text-white mb-2 tracking-wide">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Please enter a password"
                  className="w-full h-[50px] pl-4 pr-12 rounded-2xl bg-[#12141A] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-pink-500/60 transition-colors shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 text-slate-300" />
                  ) : (
                    /* Closed eye eyelash icon matching 2nd screenshot */
                    <svg
                      className="w-5 h-5 text-slate-400 hover:text-slate-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 13c3.6-8 14.4-8 18 0" />
                      <path d="M12 17a3 3 0 0 1-3-3" />
                      <line x1="3" y1="13" x2="2" y2="17" />
                      <line x1="7" y1="14.5" x2="6" y2="18.5" />
                      <line x1="12" y1="15" x2="12" y2="19.5" />
                      <line x1="17" y1="14.5" x2="18" y2="18.5" />
                      <line x1="21" y1="13" x2="22" y2="17" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons Container */}
            <div className="pt-6 space-y-3.5">
              {/* Primary Gradient Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] rounded-2xl font-bold text-base text-white shadow-[0_4px_20px_rgba(244,114,182,0.35)] bg-gradient-to-r from-[#85C4FF] via-[#F472B6] to-[#FB7185] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </button>

              {/* Secondary Register Pill Button */}
              <Link
                href="/register"
                className="w-full h-[50px] rounded-2xl bg-[#12141A] border border-white/5 hover:border-white/15 flex items-center justify-center text-sm transition-all text-center group cursor-pointer"
              >
                <span className="text-white font-bold">No account,</span>
                <span className="text-[#FF6B9D] group-hover:text-pink-400 font-bold ml-1 transition-colors">
                  Register Now
                </span>
              </Link>
            </div>
          </form>
        </div>

        {/* Bottom footer text */}
        <div className="text-center pt-8 text-[11px] text-slate-500 font-medium">
          Catalyst Capital Trading Platform
        </div>
      </div>
    </div>
  );
}