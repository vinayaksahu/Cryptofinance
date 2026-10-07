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
  onNavigateTab?: (tab: string) => void;
}

const PRESET_AMOUNTS = [2, 20, 50, 100, 250, 500, 1000, 2500, 5000];

export function StakeActivationView({ user, onRefresh, onRefreshUser, onNavigateTab }: StakeActivationViewProps) {
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
        `Insufficient Secondary Wallet balance ($${p2pBalance.toFixed(2)} USDT available). You need $${p2pToPay.toFixed(2)} USDT.`
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
          `Successfully activated $${validAmount.toFixed(2)} USDT stake! ($${bonusUsed.toFixed(2)} from Bonus Wallet, $${p2pToPay.toFixed(2)} from Secondary Wallet).`
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-primary" />
            <span>Stake Activation Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Direct Quantitative Stake &bull; 4.00% Daily Yield &bull; 2X Contract Allocation Pool &bull; Up to 10% Bonus Utility
          </p>
        </div>

        {/* Live Wallet Balances Pill */}
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-border bg-card px-3.5 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">SECONDARY:</span>
            <span className="text-sm font-bold text-foreground">${p2pBalance.toFixed(2)}</span>
          </div>
          <div className="rounded-xl border border-border bg-card px-3.5 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">BONUS:</span>
            <span className="text-sm font-bold text-primary">${bonusBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-sm flex items-center gap-3 animate-in fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Stake Input & Activation Form */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-6 shadow-sm">
          {/* Section 1: Beneficiary Selector */}
          <div>
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">
              Select Beneficiary Account
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setBeneficiaryType("self");
                  setBeneficiaryError(null);
                }}
                className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  beneficiaryType === "self"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/40 border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>My Account ({user?.customId})</span>
              </button>

              <button
                type="button"
                onClick={() => setBeneficiaryType("other")}
                className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  beneficiaryType === "other"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/40 border border-border text-muted-foreground hover:text-foreground"
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
                    className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-foreground text-sm uppercase placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {verifyingId && (
                    <span className="absolute right-3.5 top-3 text-[11px] text-muted-foreground animate-pulse">
                      Verifying...
                    </span>
                  )}
                </div>
                {beneficiaryName && (
                  <p className="text-xs text-emerald-500 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Member: <strong>{beneficiaryName}</strong></span>
                  </p>
                )}
                {beneficiaryError && (
                  <p className="text-xs text-rose-500 flex items-center gap-1.5">
                    <UserX className="w-3.5 h-3.5" />
                    <span>{beneficiaryError}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Manual Input & Slider */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Investment Stake Amount ($ USDT)
              </label>
              <span className="text-xs text-muted-foreground">Min $2.00 USDT</span>
            </div>

            {/* Big Numeric Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary font-bold text-xl">
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
                className="w-full bg-background border border-input focus:border-primary rounded-2xl pl-10 pr-20 py-3.5 text-2xl font-black text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="absolute right-4 inset-y-0 flex items-center text-xs font-bold text-muted-foreground">
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
                className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>$2 (Min)</span>
                <span>$1,000</span>
                <span>$2,500</span>
                <span>$5,000</span>
              </div>
            </div>

            {/* Quick Presets Underneath */}
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Quick Presets
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                      amount === preset
                        ? "bg-primary text-primary-foreground border-primary shadow-sm font-black"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: 10% Bonus Wallet Utility Toggle */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">
                    10% Bonus Wallet Utility
                  </h4>
                  <p className="text-[11px] text-foreground/90 mt-0.5">
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
                  className="w-4 h-4 rounded text-primary accent-primary focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground">Apply 10%</span>
              </label>
            </div>

            {/* Deduction breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block">Total Investment</span>
                <span className="font-extrabold text-foreground">${validAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">From Bonus Wallet</span>
                <span className="font-extrabold text-amber-500">
                  {bonusUsed > 0 ? `-$${bonusUsed.toFixed(2)}` : "$0.00"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">From Secondary Wallet</span>
                <span className="font-extrabold text-primary">${p2pToPay.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: 6-Digit PIN & Action Form */}
          <form onSubmit={handleActivate} className="space-y-4 pt-3 border-t border-border">
            <div>
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1.5">
                6-Digit Security Transaction PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={transactionPin}
                onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit PIN"
                className="w-full bg-background border border-input focus:border-primary rounded-xl px-4 py-3 text-center tracking-[0.3em] text-lg text-foreground font-extrabold placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || transactionPin.length !== 6 || p2pBalance < p2pToPay}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm uppercase tracking-wider transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
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
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2X ALLOCATION POOL PREVIEW
              </span>
              <span className="text-[10px] font-bold text-primary border border-primary/20 bg-primary/10 px-2 py-0.5 rounded-full">
                Slide 10-12
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Total 2X Target Pool:</span>
                <span className="text-2xl font-bold text-foreground">
                  ${allocationPool} USDT
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-muted-foreground">Daily Return (4%):</span>
                <span className="font-bold text-emerald-500">
                  +${dailyRoi} USDT / day
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-muted-foreground">Tenure Horizon:</span>
                <span className="font-semibold text-foreground">
                  50 Days (or ~35 Days with Compounding)
                </span>
              </div>
            </div>

            {/* Protocol Rules Checklist */}
            <div className="space-y-2.5 text-xs text-foreground">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>4.00% Daily Returns:</strong> Released everyday until 200% pool cap is reached.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>10% Direct Commission:</strong> Instantly credited to the beneficiary sponsor's Working Wallet.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Bonus Wallet Integration:</strong> Use up to 10% from Bonus Wallet for any activation or reinvestment.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Secondary Wallet Funded:</strong> Balance deducted instantly from your Secondary Wallet (deposit request, transfer, or P2P).
                </span>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-primary" />
                Need Secondary Wallet Funds?
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If your Secondary Wallet balance is low, submit a Deposit Request using BEP-20 USDT, transfer from ROI/Working Wallet, or receive funds from another member via P2P.
            </p>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("recharge")}
                className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/20 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Deposit USDT (Recharge Secondary Wallet)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
