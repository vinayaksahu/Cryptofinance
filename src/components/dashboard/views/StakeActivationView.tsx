"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Check,
  AlertCircle,
  ShieldCheck,
  Sliders,
  DollarSign,
  Gift,
  Wallet,
  ArrowRight,
  UserCheck,
  UserX,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface StakeActivationViewProps {
  user: any;
  onRefresh?: () => void;
  onRefreshUser?: () => void;
}

const PRESET_AMOUNTS = [2, 20, 50, 100, 250, 500, 1000, 2500, 5000];

export function StakeActivationView({ user, onRefresh, onRefreshUser }: StakeActivationViewProps) {
  // Amount & Slider state
  const [amount, setAmount] = useState<number>(100);
  const [useBonus, setUseBonus] = useState<boolean>(true);

  // Beneficiary state: "self" vs "other"
  const [beneficiaryType, setBeneficiaryType] = useState<"self" | "other">("self");
  const [targetCustomId, setTargetCustomId] = useState<string>("");
  const [verifyingId, setVerifyingId] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState<string | null>(null);
  const [beneficiaryError, setBeneficiaryError] = useState<string | null>(null);

  // Transaction PIN & submission state
  const [transactionPin, setTransactionPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Balances
  const p2pBalance = Number(user?.wallets?.p2pBalance ?? user?.fundBalance ?? 0);
  const bonusBalance = Number(user?.wallets?.bonusBalance ?? user?.lockedBonus ?? 0);

  // Dynamic system configurations set by Admin
  const cfg = user?.systemConfig || {};
  const dailyRoiRate = cfg.BASIC_PLAN_DAILY_ROI !== undefined ? Number(cfg.BASIC_PLAN_DAILY_ROI) : 4.0;
  const tenureDays = cfg.BASIC_PLAN_TENURE_DAYS !== undefined ? Number(cfg.BASIC_PLAN_TENURE_DAYS) : 50;

  // Debounced Member ID Verification
  useEffect(() => {
    if (beneficiaryType === "self" || !targetCustomId.trim()) {
      setBeneficiaryName(null);
      setBeneficiaryError(null);
      return;
    }

    const trimmedId = targetCustomId.trim().toUpperCase();
    if (trimmedId === user?.customId?.toUpperCase()) {
      setBeneficiaryName(`${user?.fullName} (You)`);
      setBeneficiaryError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setVerifyingId(true);
      setBeneficiaryError(null);
      try {
        const res = await fetch(`/api/user/lookup?customId=${encodeURIComponent(trimmedId)}`);
        const data = await res.json();
        if (res.ok && data.user) {
          setBeneficiaryName(data.user.fullName || data.user.name || "Verified Member");
          setBeneficiaryError(null);
        } else {
          setBeneficiaryName(null);
          setBeneficiaryError(data.error || "Member ID not found");
        }
      } catch {
        // Fallback validation if lookup endpoint doesn't exist
        setBeneficiaryName(null);
      } finally {
        setVerifyingId(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [targetCustomId, beneficiaryType, user]);

  // Calculations
  const validAmount = Math.max(2, Number(amount) || 2);
  const maxBonusAllowed = +(validAmount * 0.10).toFixed(2);
  const bonusUsed = useBonus ? Math.min(bonusBalance, maxBonusAllowed) : 0;
  const p2pToPay = +(validAmount - bonusUsed).toFixed(2);

  // 2X Contract Allocation Pool simulation
  const allocationPool = +(validAmount * 2.0).toFixed(2);
  const dailyRoi = +(validAmount * (dailyRoiRate / 100)).toFixed(2);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (validAmount < 2) {
      setError("Minimum activation amount is $2.00 USDT.");
      return;
    }

    if (p2pBalance < p2pToPay) {
      setError(
        `Insufficient P2P Wallet balance ($${p2pBalance.toFixed(2)} USDT available). You need $${p2pToPay.toFixed(2)} USDT.`
      );
      return;
    }

    if (beneficiaryType === "other" && !targetCustomId.trim()) {
      setError("Please enter the Member ID to activate.");
      return;
    }

    if (transactionPin.length !== 6) {
      setError("Please enter your 6-digit Transaction PIN.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/packages/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInUsdt: validAmount,
          targetCustomId: beneficiaryType === "other" ? targetCustomId.trim().toUpperCase() : undefined,
          useBonus,
          transactionPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to activate stake.");
      }

      setSuccess(
        data.message ||
          `Successfully activated $${validAmount.toFixed(2)} USDT stake! ($${bonusUsed.toFixed(2)} from Bonus Wallet, $${p2pToPay.toFixed(2)} from P2P Wallet).`
      );
      setTransactionPin("");
      if (beneficiaryType === "other") {
        setTargetCustomId("");
        setBeneficiaryName(null);
      }
      if (onRefresh) onRefresh();
      if (onRefreshUser) onRefreshUser();
    } catch (err: any) {
      setError(err.message || "Something went wrong while activating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-[#00FFA3]" />
            <span>Stake Activation Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Direct Quantitative Stake &bull; 4.00% Daily Yield &bull; 2X Contract Allocation Pool &bull; Up to 10% Bonus Utility
          </p>
        </div>

        {/* Live Wallet Balances Pill */}
        <div className="flex items-center gap-2.5">
          <div className="glass-panel px-3.5 py-1.5 flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">P2P WALLET:</span>
            <span className="text-sm font-extrabold text-[#00D2FF] font-mono">${p2pBalance.toFixed(2)}</span>
          </div>
          <div className="glass-panel px-3.5 py-1.5 flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">BONUS:</span>
            <span className="text-sm font-extrabold text-[#FFB800] font-mono">${bonusBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Stake Input & Activation Form */}
        <div className="lg:col-span-7 glass-card-elevated glass-glow-top p-6 sm:p-7 space-y-6">
          {/* Section 1: Beneficiary Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono block mb-2.5">
              Select Beneficiary Account
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setBeneficiaryType("self");
                  setBeneficiaryError(null);
                }}
                className={`py-3 px-4 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 ${
                  beneficiaryType === "self"
                    ? "bg-[#00FFA3] text-slate-950 shadow-lg shadow-[#00FFA3]/20"
                    : "bg-slate-900/60 border border-white/10 text-slate-500 dark:text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>My Account ({user?.customId})</span>
              </button>

              <button
                type="button"
                onClick={() => setBeneficiaryType("other")}
                className={`py-3 px-4 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 ${
                  beneficiaryType === "other"
                    ? "bg-[#00D2FF] text-slate-950 shadow-lg shadow-[#00D2FF]/20"
                    : "bg-slate-900/60 border border-white/10 text-slate-500 dark:text-slate-400 hover:text-white"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Activate Another Member</span>
              </button>
            </div>

            {/* Other Member ID Input */}
            {beneficiaryType === "other" && (
              <div className="mt-3.5 space-y-1.5 animate-in fade-in">
                <div className="relative">
                  <input
                    type="text"
                    value={targetCustomId}
                    onChange={(e) => setTargetCustomId(e.target.value)}
                    placeholder="Enter Member ID (e.g. CF478752)"
                    className="w-full bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 focus:border-[#00D2FF] rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm uppercase placeholder-slate-500 focus:outline-none"
                  />
                  {verifyingId && (
                    <span className="absolute right-3.5 top-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono animate-pulse">
                      Verifying...
                    </span>
                  )}
                </div>
                {beneficiaryName && (
                  <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Member: <strong>{beneficiaryName}</strong></span>
                  </p>
                )}
                {beneficiaryError && (
                  <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
                    <UserX className="w-3.5 h-3.5" />
                    <span>{beneficiaryError}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Manual Input & Slider */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Investment Stake Amount ($ USDT)
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Min $2.00 USDT</span>
            </div>

            {/* Big Numeric Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#00FFA3] font-bold text-xl font-mono">
                $
              </div>
              <input
                type="number"
                min="2"
                max="10000"
                step="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount (min $2)"
                className="w-full bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 focus:border-[#00FFA3] rounded-2xl pl-10 pr-20 py-3.5 text-2xl font-black text-slate-900 dark:text-slate-100 placeholder-slate-600 focus:outline-none"
              />
              <span className="absolute right-4 inset-y-0 flex items-center text-xs font-extrabold text-slate-500 dark:text-slate-400 font-mono">
                USDT
              </span>
            </div>

            {/* Smooth Range Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="2"
                max="5000"
                step="2"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00FFA3]"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>$2 (Min)</span>
                <span>$1,000</span>
                <span>$2,500</span>
                <span>$5,000</span>
              </div>
            </div>

            {/* Quick Presets Underneath */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono mb-2">
                Quick Presets
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      amount === preset
                        ? "bg-[#00FFA3] text-slate-950 border-[#00FFA3] shadow-md shadow-[#00FFA3]/20 font-black"
                        : "bg-slate-900/60 border-white/10 text-slate-700 dark:text-slate-300 hover:text-white hover:border-white/20"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: 10% Bonus Wallet Utility Toggle */}
          <div className="p-4 rounded-2xl bg-[#FFB800]/10 border border-[#FFB800]/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-[#FFB800] shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase text-[#FFB800] tracking-wider font-mono">
                    10% Bonus Wallet Utility
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                    Subsidize up to 10% of this stake using your Non-Withdrawable Bonus balance!
                  </p>
                </div>
              </div>

              {/* Checkbox toggle */}
              <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={useBonus}
                  onChange={(e) => setUseBonus(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FFB800] accent-[#FFB800] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Apply 10%</span>
              </label>
            </div>

            {/* Deduction breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#FFB800]/20 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Investment</span>
                <span className="font-extrabold text-white">${validAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">From Bonus Wallet</span>
                <span className="font-extrabold text-[#FFB800]">
                  {bonusUsed > 0 ? `-$${bonusUsed.toFixed(2)}` : "$0.00"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">From P2P Wallet</span>
                <span className="font-extrabold text-[#00D2FF]">${p2pToPay.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: 6-Digit PIN & Action Form */}
          <form onSubmit={handleActivate} className="space-y-4 pt-3 border-t border-white/10">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono block mb-1.5">
                6-Digit Security Transaction PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={transactionPin}
                onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit PIN"
                className="w-full bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 focus:border-[#00FFA3] rounded-xl px-4 py-3 text-center tracking-[0.3em] text-lg font-mono text-white font-extrabold placeholder-slate-600 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || transactionPin.length !== 6 || p2pBalance < p2pToPay}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00FFA3] to-[#00D2FF] hover:opacity-95 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-slate-200/50 dark:shadow-black/20 shadow-[#00FFA3]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Activating Protocol Stake...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>
                    Activate Stake (${validAmount.toFixed(2)} USDT)
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: 2X Contract Allocation Pool Showcase */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card-elevated glass-glow-top p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                2X ALLOCATION POOL PREVIEW
              </span>
              <span className="glass-pill text-[10px] font-bold text-[#00FFA3] border-[#00FFA3]/30 bg-[#00FFA3]/10 font-mono">
                Slide 10-12
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total 2X Target Pool:</span>
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  ${allocationPool} USDT
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-500 dark:text-slate-400">Daily Return (4%):</span>
                <span className="font-extrabold text-[#00FFA3] font-mono">
                  +${dailyRoi} USDT / day
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-500 dark:text-slate-400">Tenure Horizon:</span>
                <span className="font-semibold text-slate-200 font-mono">
                  50 Days (or ~35 Days with Compounding)
                </span>
              </div>
            </div>

            {/* Protocol Rules Checklist */}
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#00FFA3] shrink-0 mt-0.5" />
                <span>
                  <strong>4.00% Daily Returns:</strong> Released everyday until 200% pool cap is reached.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" />
                <span>
                  <strong>10% Direct Commission:</strong> Instantly credited to the beneficiary sponsor's Working Wallet.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                <span>
                  <strong>Bonus Wallet Integration:</strong> Use up to 10% from Bonus Wallet for any activation or reinvestment.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>P2P Funded:</strong> Balance deducted instantly from your P2P/Fund Wallet (0% transfer fee).
                </span>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-[#00D2FF]" />
              Need P2P Wallet Funds?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If your P2P Wallet balance is low, you can recharge using BEP-20 USDT deposit, or receive P2P funds from another member with 0% fee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
