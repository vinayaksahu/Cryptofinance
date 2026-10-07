"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Wallet, 
  Clock, 
  TrendingUp, 
  Crown,
  ArrowLeftRight,
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Loader2,
  Sparkles,
  Users,
  Upload,
  QrCode,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  Power,
  Activity,
  Gift,
  Zap,
} from "lucide-react";
import { getWithdrawalWindowStatus } from "@/lib/constants";

interface ConfigItem {
  value: string;
  description: string;
  category: string;
  updatedAt?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  plan: Zap,
  bonus: Gift,
  royalty: Crown,
  withdrawal: Clock,
  transfers: ArrowLeftRight,
  wallet: Wallet,
  company: Building2,
  system_mode: Power,
};

const CATEGORY_NAMES: Record<string, string> = {
  all: "All Configurations",
  plan: "Stake Engine & 2X Pool",
  bonus: "Bonus Wallet Utility (10%)",
  royalty: "10-Level Daily Royalties",
  withdrawal: "Withdrawal & 10% Fee",
  transfers: "P2P & Multi-Wallet",
  wallet: "USDT (BEP-20) Vault & QR",
  company: "Protocol Foundation",
  system_mode: "Platform Access Mode",
};

const FRIENDLY_NAMES: Record<string, string> = {
  // Financial & Wallet
  COMPANY_USDT_ADDRESS: "Official USDT (BEP-20) Receiving Wallet",
  COMPANY_USDT_QR: "Official USDT (BEP-20) Receiving QR Code Image",

  // Stake Engine & 2X Allocation Pool
  BASIC_PLAN_DAILY_ROI: "Protocol Daily Stake Yield (%) [Default: 4.0%]",
  BASIC_PLAN_TENURE_DAYS: "Standard Tenure Horizon [Default: 50 Days / 200% Cap]",
  BASIC_PLAN_MIN_USDT: "Minimum Activation Stake (USDT) [Default: $2.00]",
  BASIC_PLAN_MAX_USDT: "Maximum Activation Stake (USDT) [Default: $10,000.00]",

  // Bonus Wallet Utility
  BONUS_UTILITY_PERCENT: "Max Bonus Utility Rate for Activations (%) [Default: 10.0%]",
  SIGNUP_BONUS_USDT: "Self Welcome Bonus to Bonus Wallet ($1.00 USDT)",
  SIGNUP_LEVEL_BOUNTY_USDT: "Downline Registration Bounty ($0.40 USDT / level)",

  // Direct Referral & 10-Level Daily Royalty
  DIRECT_REFERRAL_PERCENT: "Direct Sponsor Referral Commission (%) [Default: 10.0%]",
  LEVEL_1_PERCENT: "Level 1 Daily Royalty % (Req: 1 Direct) [Default: 10.0%]",
  LEVEL_2_PERCENT: "Level 2 Daily Royalty % (Req: 2 Directs) [Default: 5.0%]",
  LEVEL_3_PERCENT: "Level 3 Daily Royalty % (Req: 3 Directs) [Default: 2.0%]",
  LEVEL_4_PERCENT: "Level 4 Daily Royalty % (Req: 4 Directs) [Default: 2.0%]",
  LEVEL_5_PERCENT: "Level 5 Daily Royalty % (Req: 5 Directs) [Default: 2.0%]",
  LEVEL_6_PERCENT: "Level 6 Daily Royalty % (Req: 6 Directs) [Default: 1.0%]",
  LEVEL_7_PERCENT: "Level 7 Daily Royalty % (Req: 7 Directs) [Default: 1.0%]",
  LEVEL_8_PERCENT: "Level 8 Daily Royalty % (Req: 8 Directs) [Default: 1.0%]",
  LEVEL_9_PERCENT: "Level 9 Daily Royalty % (Req: 9 Directs) [Default: 1.0%]",
  LEVEL_10_PERCENT: "Level 10 Daily Royalty % (Req: 10 Directs - Full Unlocked) [Default: 1.0%]",

  // Withdrawal Rules & Timings
  WITHDRAWAL_24H_OPEN: "24/7 Unlimited Withdrawal Window (Always Open)",
  WITHDRAWAL_START_TIME: "Daily Withdrawal Start Time (HH:MM)",
  WITHDRAWAL_END_TIME: "Daily Withdrawal Close Time (HH:MM)",
  MIN_WITHDRAWAL_USDT: "Minimum Withdrawal Amount (USDT) [Default: $2.00]",
  MAX_WITHDRAWAL_USDT: "Maximum Single Withdrawal (USDT)",
  WITHDRAWAL_FEE_PERCENT: "Protocol Liquidity Fee / Retained Admin Fee (%) [Default: 10.0%]",

  // Transfers & Multi-Wallet
  MIN_P2P_TRANSFER_USDT: "Minimum P2P Transfer (USDT) [Default: $1.00]",
  P2P_FEE_PERCENT: "P2P Member Transfer Fee (%) [Default: 0.0%]",
  WALLET_TRANSFER_FEE_PERCENT: "Internal Multi-Wallet Transfer Fee (%) [Default: 0.0%]",

  // Corporate Information
  OFFICIAL_EMAIL: "Official Support & Technical Care Email",
  HEADQUARTERS: "Registered Protocol Foundation Headquarters",

  // Platform Status & Emergency
  MAINTENANCE_MODE: "System Maintenance Mode (true / false)",
  MAINTENANCE_NOTICE_TEXT: "System Maintenance Public Visitor Notice",
};

export function AdminConfigView() {
  const [configs, setConfigs] = useState<Record<string, ConfigItem>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [, setTimeTick] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);

  const handleQrUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/png", 0.9);
          handleInputChange("COMPANY_USDT_QR", dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const timer = setInterval(() => setTimeTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const previewStatus = getWithdrawalWindowStatus(formValues);
  const is24hActive = 
    formValues.WITHDRAWAL_24H_OPEN === "true" || 
    (formValues.WITHDRAWAL_START_TIME === "00:00" && (formValues.WITHDRAWAL_END_TIME === "23:59" || formValues.WITHDRAWAL_END_TIME === "24:00"));

  const currentStartTime = formValues.WITHDRAWAL_START_TIME || "10:00";
  const currentEndTime = formValues.WITHDRAWAL_END_TIME || "14:00";

  const toggle24h = () => {
    const willBe24h = !is24hActive;
    setFormValues((prev) => ({
      ...prev,
      WITHDRAWAL_24H_OPEN: willBe24h ? "true" : "false",
      WITHDRAWAL_START_TIME: willBe24h ? "00:00" : "10:00",
      WITHDRAWAL_END_TIME: willBe24h ? "23:59" : "14:00",
    }));
  };

  const updateStartTime = (timeStr: string) => {
    setFormValues((prev) => ({
      ...prev,
      WITHDRAWAL_START_TIME: timeStr,
      WITHDRAWAL_24H_OPEN: "false",
    }));
  };

  const updateEndTime = (timeStr: string) => {
    setFormValues((prev) => ({
      ...prev,
      WITHDRAWAL_END_TIME: timeStr,
      WITHDRAWAL_24H_OPEN: "false",
    }));
  };

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load configurations");

      setConfigs(data.configs || {});
      const initialForm: Record<string, string> = {};
      for (const [key, item] of Object.entries(data.configs || {})) {
        initialForm[key] = (item as ConfigItem).value;
      }
      setFormValues(initialForm);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to fetch configurations" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "WITHDRAWAL_24H_OPEN" && value === "true") {
        next.WITHDRAWAL_START_TIME = "00:00";
        next.WITHDRAWAL_END_TIME = "23:59";
      }
      return next;
    });
  };

  const isMaintenanceActive = formValues.MAINTENANCE_MODE === "true";

  const handleSetPlatformMode = async (isMaint: boolean) => {
    const updated = { ...formValues, MAINTENANCE_MODE: isMaint ? "true" : "false" };
    setFormValues(updated);

    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: updated }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to switch platform mode");
      setStatusMessage({
        type: "success",
        text: `Platform operational mode switched to ${isMaint ? "System Maintenance" : "Live Normal Mode"}!`,
      });
      await fetchConfigs();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to update platform mode" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const initialForm: Record<string, string> = {};
    for (const [key, item] of Object.entries(configs)) {
      initialForm[key] = item.value;
    }
    setFormValues(initialForm);
    setStatusMessage({ type: "success", text: "Changes reset to saved values." });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: formValues }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save configuration");

      setStatusMessage({
        type: "success",
        text: data.message || "Configurations saved successfully and applied across all user portals!",
      });
      await fetchConfigs();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Error saving configurations" });
    } finally {
      setSaving(false);
    }
  };

  // Filter keys by category and search query
  const filteredKeys = Object.keys(configs).filter((key) => {
    if (key === "COMPANY_USDT_QR") return false;
    const item = configs[key];
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      query === "" || 
      key.toLowerCase().includes(query) || 
      (FRIENDLY_NAMES[key] || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const hasUnsavedChanges = Object.keys(formValues).some(
    (key) => configs[key] && configs[key].value !== formValues[key]
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-card-elevated glass-glow-top p-6 sm:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D2FF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-[#00D2FF] text-xs font-bold uppercase tracking-widest mb-1.5">
              <Settings className="w-4 h-4 animate-spin-slow" />
              <span>Real-Time Protocol Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Protocol Configuration &amp; Governance
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Configure parameters strictly matching the Crypto Finance Protocol plan: 4% Daily Yield, 2X Allocation Pool, 10% Bonus Wallet utility, 10-Level Royalties, and 10% Liquidity Fee.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving || !hasUnsavedChanges}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Discard</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving || !hasUnsavedChanges}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00FFA3] to-[#00D2FF] hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00FFA3]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Toast Message */}
        {statusMessage && (
          <div
            className={`mt-5 p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-3 transition-all animate-in fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/60 border border-rose-500/40 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {hasUnsavedChanges && !statusMessage && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Unsaved modifications detected. Click &quot;Save Changes&quot; to apply immediately.</span>
          </div>
        )}
      </div>

      {/* Filter and Category Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 overflow-x-auto max-w-full">
          {["all", "plan", "bonus", "royalty", "withdrawal", "transfers", "wallet", "company", "system_mode"].map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Settings;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#00D2FF] text-slate-950 shadow-md shadow-[#00D2FF]/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{CATEGORY_NAMES[cat] || cat}</span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search configuration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00D2FF] transition-colors"
          />
        </div>
      </div>

      {/* Dedicated Platform Status Controller */}
      {(activeCategory === "system_mode" || activeCategory === "all") && !searchQuery && (
        <div className="glass-card-elevated glass-glow-top p-6 sm:p-7 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                <Power className="w-4 h-4" />
                <span>Platform Operational Access Mode</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex flex-wrap items-center gap-3">
                <span>System Access Controller</span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase border flex items-center gap-1.5 ${
                  !isMaintenanceActive
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${!isMaintenanceActive ? "bg-emerald-400" : "bg-rose-400 animate-ping"}`} />
                  {!isMaintenanceActive ? "Normal Live Operations" : "Maintenance Mode Active"}
                </span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                When Maintenance Mode is ON, member login and registrations are safely paused. Administrators can always log in directly via the direct admin link.
              </p>
            </div>

            {/* Direct Admin Link Security Guarantee Callout */}
            <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl max-w-sm shrink-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Direct Admin Login Link
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const url = `${window.location.origin}/adminlogin`;
                      navigator.clipboard.writeText(url);
                      setCopiedAdminLink(true);
                      setTimeout(() => setCopiedAdminLink(false), 2500);
                    }
                  }}
                  className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition"
                >
                  {copiedAdminLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAdminLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 bg-black/40 px-2.5 py-1.5 rounded-lg border border-slate-800 break-all select-all">
                /adminlogin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              !isMaintenanceActive
                ? "bg-emerald-950/30 border-emerald-500/50"
                : "bg-slate-900/40 border-white/10"
            }`}>
              <div>
                <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5" /> Normal Live Status
                </span>
                <p className="text-xs text-slate-400 mb-4">
                  All member activations, wallet transfers, P2P, and withdrawals operate normally without restriction.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSetPlatformMode(false)}
                disabled={saving || !isMaintenanceActive}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                  !isMaintenanceActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {!isMaintenanceActive ? "Currently Active" : "Switch to Live Normal Mode"}
              </button>
            </div>

            <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isMaintenanceActive
                ? "bg-rose-950/30 border-rose-500/50"
                : "bg-slate-900/40 border-white/10"
            }`}>
              <div>
                <span className="text-xs font-black uppercase text-rose-400 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> System Maintenance
                </span>
                <p className="text-xs text-slate-400 mb-4">
                  Member login and user registration are temporarily locked with maintenance notice while upgrades occur.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSetPlatformMode(true)}
                disabled={saving || isMaintenanceActive}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                  isMaintenanceActive
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-default"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                }`}
              >
                {isMaintenanceActive ? "Currently Active" : "Activate Maintenance Mode"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Withdrawal Window & 24/7 Hours Controller */}
      {(activeCategory === "withdrawal" || activeCategory === "all") && !searchQuery && (
        <div className="glass-card-elevated glass-glow-top p-6 sm:p-7 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-[#00FFA3] text-xs font-bold uppercase tracking-widest mb-1.5">
                <Clock className="w-4 h-4" />
                <span>Withdrawal Timing &amp; Liquidity Schedule</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <span>Withdrawal Hours &amp; 24/7 Operations</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${
                  previewStatus.isOpen
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}>
                  {previewStatus.isOpen ? "● Open Now" : "● Closed"}
                </span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                Set custom withdrawal window or toggle 24/7 mode. Minimum withdrawal is $2.00 USDT, with 10% Protocol Liquidity fee retained.
              </p>
            </div>

            {/* 24/7 Mode Switch */}
            <div className="flex items-center gap-4 bg-slate-950/80 border border-white/10 p-4 rounded-2xl shadow-lg">
              <div className="text-left sm:text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 sm:justify-end">
                  <Sparkles className="w-3.5 h-3.5 text-[#00FFA3]" />
                  <span>24/7 Mode (Always Open)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {is24hActive ? "Members can withdraw anytime 24h" : "Strict daily window active"}
                </div>
              </div>
              <button
                type="button"
                onClick={toggle24h}
                className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  is24hActive ? "bg-[#00FFA3] shadow-lg shadow-[#00FFA3]/30" : "bg-slate-700"
                }`}
                title="Toggle 24/7 withdrawals"
              >
                <span
                  className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] font-black tracking-tighter ${
                    is24hActive ? "translate-x-9 text-slate-950" : "translate-x-0 text-slate-700"
                  }`}
                >
                  {is24hActive ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          {/* Timing Pickers & Live Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Daily Window Start Time (HH:MM)
              </label>
              <input
                type="time"
                value={currentStartTime}
                disabled={is24hActive}
                onChange={(e) => updateStartTime(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D2FF] disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Daily Window Close Time (HH:MM)
              </label>
              <input
                type="time"
                value={currentEndTime}
                disabled={is24hActive}
                onChange={(e) => updateEndTime(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D2FF] disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-white/10">
          <Loader2 className="w-8 h-8 text-[#00D2FF] animate-spin mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading protocol configurations...</p>
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-white/10 text-slate-400 text-sm">
          No configurations match your search or filter.
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredKeys.map((key) => {
            const item = configs[key];

            // Custom unified card for COMPANY_USDT_ADDRESS with Address + QR Code Upload
            if (key === "COMPANY_USDT_ADDRESS") {
              const currentAddress = formValues["COMPANY_USDT_ADDRESS"] ?? item.value;
              const customQr = formValues["COMPANY_USDT_QR"] ?? configs["COMPANY_USDT_QR"]?.value ?? "";
              const activeQrUrl = customQr || (currentAddress ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentAddress)}` : "");
              const isQrModified = formValues["COMPANY_USDT_QR"] !== undefined && formValues["COMPANY_USDT_QR"] !== (configs["COMPANY_USDT_QR"]?.value ?? "");
              const isAddressModified = formValues["COMPANY_USDT_ADDRESS"] !== item.value;

              return (
                <div
                  key={key}
                  className="col-span-1 md:col-span-2 lg:col-span-3 glass-card-elevated glass-glow-top p-6 sm:p-8 relative overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2 text-[#00D2FF] text-xs font-bold uppercase tracking-widest mb-1">
                        <Wallet className="w-4 h-4" />
                        <span>Official Protocol Receiving Vault</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        USDT (BEP-20) Receiving Wallet &amp; QR Code
                      </h2>
                      <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                        This receiving address and QR code are displayed to members when making USDT deposits.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {(isAddressModified || isQrModified) && (
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40">
                          Unsaved Edits
                        </span>
                      )}
                      <span className="text-xs px-3 py-1 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-500/30">
                        BEP-20 Network
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
                    <div className="lg:col-span-7 space-y-4">
                      <div>
                        <div className="text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                          <span>Deposit Wallet Address (BSC BEP-20)</span>
                          {currentAddress && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(currentAddress);
                                setCopiedAddress(true);
                                setTimeout(() => setCopiedAddress(false), 2000);
                              }}
                              className="text-[11px] text-[#00D2FF] hover:text-white flex items-center gap-1 font-semibold"
                            >
                              {copiedAddress ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Address</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={currentAddress}
                          onChange={(e) => handleInputChange("COMPANY_USDT_ADDRESS", e.target.value.trim())}
                          className="w-full bg-slate-950/70 border border-white/15 focus:border-[#00D2FF] rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none"
                          placeholder="e.g. 0x1234567890abcdef..."
                          required
                        />
                      </div>

                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-200 mb-2">
                          Manage Deposit QR Code
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg transition-all">
                            <Upload className="w-4 h-4" />
                            <span>Upload Custom QR Image</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/jpg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleQrUpload(file);
                              }}
                              className="hidden"
                            />
                          </label>

                          {customQr && (
                            <button
                              type="button"
                              onClick={() => handleInputChange("COMPANY_USDT_QR", "")}
                              className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Reset to Auto QR</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/60 border border-white/10 rounded-2xl p-6 text-center">
                      <div className="relative p-3 bg-white rounded-2xl shadow-xl border border-slate-200 mb-3">
                        {activeQrUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={activeQrUrl}
                            alt="Deposit QR Code"
                            className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-44 h-44 sm:w-48 sm:h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                            <QrCode className="w-10 h-10 mb-2 opacity-40 text-slate-600" />
                            <span>No address or QR</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {customQr ? "Custom Uploaded QR Active" : "Auto-Generated from Address"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            const isRoyaltyLevel = key.startsWith("LEVEL_") && key.endsWith("_PERCENT");
            const levelNum = isRoyaltyLevel ? key.split("_")[1] : null;
            const is24hToggle = key === "WITHDRAWAL_24H_OPEN";
            const isTimePicker = key === "WITHDRAWAL_START_TIME" || key === "WITHDRAWAL_END_TIME";
            const isNumber = 
              !isTimePicker &&
              !is24hToggle &&
              (key.includes("RATE") || 
              key.includes("PERCENT") || 
              key.includes("MIN") || 
              key.includes("MAX") || 
              key.includes("BONUS") ||
              key.includes("DAYS") ||
              key.includes("ROI"));

            return (
              <div
                key={key}
                className="glass-card-elevated p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <label className="text-sm font-bold text-white tracking-tight block">
                      {FRIENDLY_NAMES[key] || key}
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-950/60 text-sky-300 border border-sky-500/30 shrink-0">
                      {key}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  {isRoyaltyLevel && (
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/30 rounded-lg px-2.5 py-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Unlock: Requires {levelNum} Active Direct Member{Number(levelNum) > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <div className="relative">
                    {is24hToggle ? (
                      <select
                        value={formValues[key] ?? item.value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF] font-semibold"
                      >
                        <option value="true">24/7 Open (Always Accessible)</option>
                        <option value="false">Scheduled Daily Window</option>
                      </select>
                    ) : isTimePicker ? (
                      <input
                        type="time"
                        value={formValues[key] ?? item.value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF] font-semibold"
                        required
                      />
                    ) : (
                      <input
                        type={isNumber ? "number" : "text"}
                        step={key.includes("PERCENT") || key.includes("ROI") ? "any" : "1"}
                        value={formValues[key] ?? item.value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF] font-semibold"
                        placeholder={`Enter ${FRIENDLY_NAMES[key] || key}`}
                        required
                      />
                    )}

                    {formValues[key] !== item.value && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 pointer-events-none">
                        Modified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </form>
      )}

      {/* Floating Save Footer Bar when changes exist */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 sm:right-10 z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-[#090e1a]/95 border border-[#00FFA3]/50 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Unsaved changes detected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#00D2FF] text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
