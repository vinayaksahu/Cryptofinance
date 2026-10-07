"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Wallet,
  Globe,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  History,
  Send,
} from "lucide-react";
import { APP_CONFIG, getWithdrawalWindowStatus } from "@/lib/constants";

interface WithdrawalViewProps {
  user: any;
  onRefresh?: () => void;
  onNavigateTab?: (tab: string) => void;
  initialTab?: "request" | "history";
}

export function WithdrawalView({
  user,
  onRefresh,
  onNavigateTab,
  initialTab = "request",
}: WithdrawalViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"request" | "history">(initialTab);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPin, setWithdrawPin] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState(user?.usdtAddress || "");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [txOtpSending, setTxOtpSending] = useState(false);
  const [txOtpSent, setTxOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "PENDING" | "PROCESSED" | "REJECTED">("ALL");
  const [historySearch, setHistorySearch] = useState("");

  // Wallets data
  const wallets = user?.wallets || {};
  const mainWalletBal = Number(wallets.mainBalance ?? user?.mainBalance ?? user?.withdrawableBalance ?? 0);
  const totalWithdrawnBal = Number(wallets.totalWithdrawn ?? user?.totalWithdrawn ?? 0);
  const roiBal = Number(wallets.roiBalance ?? user?.roiBalance ?? 0);
  const workingBal = Number(wallets.workingBalance ?? user?.workingBalance ?? 0);

  // System config & window status
  const cfg = user?.systemConfig || {};
  const [windowStatus, setWindowStatus] = useState(() => getWithdrawalWindowStatus(cfg));

  useEffect(() => {
    setWindowStatus(getWithdrawalWindowStatus(cfg));
    const interval = setInterval(() => {
      setWindowStatus(getWithdrawalWindowStatus(cfg));
    }, 5000);
    return () => clearInterval(interval);
  }, [cfg]);

  const minWithdraw = cfg.MIN_WITHDRAWAL_USDT !== undefined ? Number(cfg.MIN_WITHDRAWAL_USDT) : APP_CONFIG.minWithdrawalUsdt;
  const maxWithdraw = cfg.MAX_WITHDRAWAL_USDT !== undefined ? Number(cfg.MAX_WITHDRAWAL_USDT) : APP_CONFIG.maxWithdrawalUsdt;
  const adminFeePercent = cfg.WITHDRAWAL_FEE_PERCENT || cfg.WITHDRAWAL_ADMIN_FEE_PERCENT
    ? Number(cfg.WITHDRAWAL_FEE_PERCENT || cfg.WITHDRAWAL_ADMIN_FEE_PERCENT)
    : APP_CONFIG.withdrawalAdminFeePercent;

  const withdrawals: any[] = user?.withdrawals || [];

  const pendingWithdrawals = withdrawals.filter(
    (w) => w.status?.toUpperCase() === "PENDING"
  );
  const pendingAmount = pendingWithdrawals.reduce(
    (acc, w) => acc + Number(w.amountInUsdt ?? w.amountUsdt ?? 0),
    0
  );

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTxOtp = async () => {
    if (!user?.email) return;
    setTxOtpSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, purpose: "TRANSACTION" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setTxOtpSent(true);
      setMessage({
        text: `Security OTP sent to ${user.email}. Please check your inbox or spam folder.`,
        error: false,
      });
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setTxOtpSending(false);
    }
  };

  const handleQuickPercent = (pct: number) => {
    if (mainWalletBal <= 0) return;
    const calculated = Math.floor(mainWalletBal * pct * 10) / 1000;
    const finalAmount = Math.min(calculated, maxWithdraw);
    setWithdrawAmount(finalAmount > 0 ? finalAmount.toString() : "");
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const amountNum = Number(withdrawAmount);
    if (!amountNum || amountNum <= 0) {
      setMessage({ text: "Please enter a valid withdrawal amount.", error: true });
      return;
    }

    if (amountNum < minWithdraw) {
      setMessage({ text: `Minimum withdrawal amount is $${minWithdraw} USDT.`, error: true });
      return;
    }

    if (amountNum > maxWithdraw) {
      setMessage({ text: `Maximum withdrawal amount is $${maxWithdraw.toLocaleString()} USDT.`, error: true });
      return;
    }

    if (amountNum > mainWalletBal) {
      setMessage({
        text: `Insufficient Main Wallet balance. You have $${mainWalletBal.toFixed(2)} USDT available.`,
        error: true,
      });
      return;
    }

    if (!withdrawAddress.trim()) {
      setMessage({ text: "Please enter your BEP-20 receiving address.", error: true });
      return;
    }

    if (!withdrawPin.trim() || withdrawPin.trim().length !== 6) {
      setMessage({ text: "Please enter your 6-digit Transaction PIN or OTP.", error: true });
      return;
    }

    if (!windowStatus.isOpen) {
      setMessage({
        text: `Withdrawal window is closed. Official window: ${windowStatus.gstLabel} (UTC) / ${windowStatus.istLabel} (IST).`,
        error: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInUsdt: amountNum,
          amount: amountNum,
          toAddress: withdrawAddress.trim(),
          transactionPin: withdrawPin.trim(),
          otp: withdrawPin.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed.");

      setShowWithdrawSuccessModal(true);
      setWithdrawAmount("");
      setWithdrawPin("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered withdrawals for history
  const filteredWithdrawals = withdrawals.filter((w) => {
    const status = (w.status || "").toUpperCase();
    if (historyFilter === "PENDING" && status !== "PENDING") return false;
    if (historyFilter === "PROCESSED" && status !== "PROCESSED" && status !== "COMPLETED") return false;
    if (historyFilter === "REJECTED" && status !== "REJECTED") return false;

    if (historySearch.trim()) {
      const query = historySearch.trim().toLowerCase();
      const addr = (w.toAddress || "").toLowerCase();
      const tx = (w.txHash || "").toLowerCase();
      const id = (w.id || "").toLowerCase();
      return addr.includes(query) || tx.includes(query) || id.includes(query);
    }
    return true;
  });

  const parsedAmount = Number(withdrawAmount) || 0;
  const calculatedFee = (parsedAmount * adminFeePercent) / 100;
  const calculatedNet = Math.max(0, parsedAmount - calculatedFee);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <ArrowUpRight className="w-6 h-6 text-primary" />
            <span>Main Wallet Withdrawal</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Cash out earnings directly to your external BEP-20 USDT wallet address &bull; 100% On-Chain Liquidity
          </p>
        </div>

        {/* Action button to internal transfer */}
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab("wallets")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer self-start sm:self-auto"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
            <span>Transfer to Main Wallet &rarr;</span>
          </button>
        )}
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Main Wallet Balance */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col justify-between space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Main Wallet Balance
            </span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-foreground">
              ${mainWalletBal.toFixed(2)}{" "}
              <span className="text-xs font-semibold text-muted-foreground">USDT</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Available for instant withdrawal
            </p>
          </div>
          <div className="pt-2 border-t border-primary/10 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Withdrawable
            </span>
          </div>
        </div>

        {/* 2. Total Withdrawn */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Total Withdrawn
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-foreground">
              ${totalWithdrawnBal.toFixed(2)}{" "}
              <span className="text-xs font-semibold text-muted-foreground">USDT</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Lifetime successfully paid out
            </p>
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Successful Payouts:</span>
            <span className="font-semibold text-foreground">
              {withdrawals.filter((w) => w.status?.toUpperCase() === "PROCESSED" || w.status?.toUpperCase() === "COMPLETED").length} Requests
            </span>
          </div>
        </div>

        {/* 3. Pending Payouts */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Pending Payouts
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-foreground">
              ${pendingAmount.toFixed(2)}{" "}
              <span className="text-xs font-semibold text-muted-foreground">USDT</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Currently awaiting blockchain execution
            </p>
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Pending Queue:</span>
            <span className={`font-bold ${pendingWithdrawals.length > 0 ? "text-amber-500" : "text-foreground"}`}>
              {pendingWithdrawals.length} {pendingWithdrawals.length === 1 ? "Request" : "Requests"}
            </span>
          </div>
        </div>

        {/* 4. Limits & Admin Fee */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Rules &amp; Limits
            </span>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Min Withdrawal:</span>
              <span className="font-bold text-foreground">${minWithdraw} USDT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Max Withdrawal:</span>
              <span className="font-bold text-foreground">${maxWithdraw.toLocaleString()} USDT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Admin Fee:</span>
              <span className="font-bold text-amber-500">{adminFeePercent}% Flat</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Network:</span>
            <span className="font-bold text-primary">BSC (BEP-20)</span>
          </div>
        </div>
      </div>

      {/* Official Withdrawal Window Notice Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl text-xs font-semibold transition-all border shadow-sm ${
          windowStatus.isOpen
            ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
        }`}
      >
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Official Withdrawal Window</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    windowStatus.isOpen
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {windowStatus.isOpen ? "OPEN NOW" : "CURRENTLY CLOSED"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                <span>
                  UTC: <strong className="text-foreground">{windowStatus.currentUtcTime || "Live"}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  IST: <strong className="text-foreground">{windowStatus.currentIstTime || "Live"}</strong>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
              {windowStatus.is24h
                ? "24/7 withdrawals active. You can request withdrawals anytime."
                : windowStatus.isOpen
                ? `Withdrawal requests are currently accepted. Active window: ${windowStatus.utcLabel || windowStatus.gstLabel} UTC / ${windowStatus.istLabel} IST.`
                : `Withdrawals open daily during ${windowStatus.utcLabel || windowStatus.gstLabel} UTC / ${windowStatus.istLabel} IST. Requests submitted outside this window will be rejected.`}
            </p>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
            message.error
              ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
          }`}
        >
          {message.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Container with Tab Switcher */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 space-y-6 shadow-sm">
        {/* Sub-Tabs: Request vs History */}
        <div className="flex items-center justify-between pb-4 border-b border-border flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted border border-border">
            <button
              type="button"
              onClick={() => setActiveSubTab("request")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "request"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Withdrawal</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("history")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "history"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Withdrawal History ({withdrawals.length})</span>
            </button>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secured with 6-Digit PIN &amp; Email OTP</span>
          </div>
        </div>

        {/* TAB 1: WITHDRAWAL REQUEST FORM */}
        {activeSubTab === "request" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Informational Callout for transferring to Main Wallet */}
            {(roiBal > 0 || workingBal > 0) && (
              <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowRightLeft className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    You have <strong>${roiBal.toFixed(2)} USDT</strong> in ROI Wallet &amp;{" "}
                    <strong>${workingBal.toFixed(2)} USDT</strong> in Working Wallet.
                  </span>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab("wallets")}
                    className="text-primary hover:underline font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Transfer to Main Wallet &rarr;
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleWithdrawal} className="space-y-5 max-w-2xl">
              {/* 1. Destination Address */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    1. USDT BEP-20 Receiving Address (BSC)
                  </label>
                  <span className="text-[11px] text-muted-foreground">Binance Smart Chain</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder="0x... Enter your BEP-20 receiving wallet address"
                    className="w-full bg-background border border-input focus:border-primary rounded-xl px-4 py-3 text-sm font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary pr-20"
                    required
                  />
                  {user?.usdtAddress && withdrawAddress !== user.usdtAddress && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAddress(user.usdtAddress)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-muted text-[10px] font-bold text-primary hover:bg-muted/80 transition"
                    >
                      Use Saved
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ensure this is a personal BEP-20 wallet address. Do not withdraw to smart contracts or exchange contract addresses that reject incoming BEP-20 transactions.
                </p>
              </div>

              {/* 2. Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    2. Withdrawal Amount (USDT)
                  </label>
                  <div className="text-xs text-muted-foreground">
                    Available:{" "}
                    <strong className="text-foreground">${mainWalletBal.toFixed(2)} USDT</strong>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={minWithdraw}
                    max={maxWithdraw}
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Min $${minWithdraw} - Max $${maxWithdraw.toLocaleString()}`}
                    className="w-full bg-background border border-input focus:border-primary rounded-xl px-4 py-3 text-xl font-bold text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <span className="absolute right-4 inset-y-0 flex items-center text-xs font-bold text-muted-foreground">
                    USDT
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-2 pt-1">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickPercent(pct)}
                      className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                    >
                      {pct === 100 ? "MAX" : `${pct}%`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(minWithdraw.toString())}
                    className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
                  >
                    Min (${minWithdraw})
                  </button>
                </div>
              </div>

              {/* Real-Time Fee & Net Payout Calculation Card */}
              {parsedAmount > 0 && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Requested Gross Amount:</span>
                    <span className="font-bold text-foreground">${parsedAmount.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Admin Processing Charge ({adminFeePercent}%):</span>
                    <span className="font-bold text-amber-500">-${calculatedFee.toFixed(2)} USDT</span>
                  </div>
                  <div className="pt-2 border-t border-primary/20 flex justify-between items-center text-sm font-bold">
                    <span className="text-foreground">Net Payout to Your Address:</span>
                    <span className="text-emerald-500 font-extrabold text-base">
                      ${calculatedNet.toFixed(2)} USDT
                    </span>
                  </div>
                </div>
              )}

              {/* 3. Security Verification (PIN or OTP) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    3. Security Verification (6-Digit PIN / Email OTP)
                  </label>
                  <button
                    type="button"
                    onClick={handleSendTxOtp}
                    disabled={txOtpSending}
                    className="text-xs font-bold text-primary hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {txOtpSending ? "Sending OTP..." : txOtpSent ? "Resend OTP" : "Get OTP on Email"}
                  </button>
                </div>

                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={withdrawPin}
                  onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Transaction PIN or Email OTP"
                  className="w-full sm:w-80 bg-background border border-input focus:border-primary rounded-xl px-4 py-2.5 text-center text-sm font-semibold tracking-widest placeholder:text-xs placeholder:tracking-normal placeholder:font-normal placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  You can enter your 6-digit Transaction PIN or click &quot;Get OTP on Email&quot; to receive a one-time passcode.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  submitting ||
                  !windowStatus.isOpen ||
                  parsedAmount <= 0 ||
                  parsedAmount < minWithdraw ||
                  parsedAmount > maxWithdraw ||
                  parsedAmount > mainWalletBal ||
                  !withdrawAddress.trim() ||
                  withdrawPin.length !== 6
                }
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Withdrawal Request...</span>
                  </>
                ) : !windowStatus.isOpen ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Withdrawal Window Closed ({windowStatus.istLabel} IST)</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>
                      Withdraw ${parsedAmount > 0 ? parsedAmount.toFixed(2) : "0.00"} USDT from Main Wallet
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Recent Withdrawals Snapshot in Request Tab */}
            {withdrawals.length > 0 && (
              <div className="pt-6 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">Recent Withdrawals</h3>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("history")}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    View All ({withdrawals.length}) &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs text-muted-foreground">
                    <thead className="bg-muted/50 text-[11px] font-semibold text-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Gross Amount</th>
                        <th className="py-2.5 px-3">Net Payout</th>
                        <th className="py-2.5 px-3">Receiving Address</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {withdrawals.slice(0, 3).map((w, idx) => {
                        const amt = Number(w.amountInUsdt ?? w.amountUsdt ?? 0);
                        const net = w.netAmount != null ? Number(w.netAmount) : amt * (1 - adminFeePercent / 100);
                        const status = (w.status || "PENDING").toUpperCase();
                        return (
                          <tr key={w.id || idx} className="hover:bg-muted/30">
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-foreground">${amt.toFixed(2)} USDT</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-500">${net.toFixed(2)} USDT</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] truncate max-w-[140px]">
                              {w.toAddress}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  status === "COMPLETED" || status === "PROCESSED"
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                                    : status === "PENDING"
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                                    : "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WITHDRAWAL HISTORY */}
        {activeSubTab === "history" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["ALL", "PENDING", "PROCESSED", "REJECTED"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      historyFilter === filter
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === "ALL"
                      ? "All Withdrawals"
                      : filter === "PROCESSED"
                      ? "Completed"
                      : filter.charAt(0) + filter.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search by address or txHash..."
                  className="w-full bg-background border border-input rounded-xl px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Table of Withdrawals */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs text-muted-foreground">
                <thead className="bg-muted/60 text-foreground text-[11px] uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-3.5">#</th>
                    <th className="py-3 px-3.5">Date &amp; Time</th>
                    <th className="py-3 px-3.5">Gross Amount</th>
                    <th className="py-3 px-3.5">Admin Fee</th>
                    <th className="py-3 px-3.5">Net Payout</th>
                    <th className="py-3 px-3.5">Receiving Address</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5">TxHash / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <History className="w-8 h-8 opacity-40 text-muted-foreground" />
                          <p className="font-semibold text-sm">No withdrawal records found</p>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            {historyFilter !== "ALL" || historySearch
                              ? "Try adjusting your filter or search query."
                              : "You haven't requested any withdrawals from your Main Wallet yet."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredWithdrawals.map((w: any, idx: number) => {
                      const grossAmt = Number(w.amountInUsdt ?? w.amountUsdt ?? 0);
                      const fee = w.feeAmount != null ? Number(w.feeAmount) : grossAmt * (adminFeePercent / 100);
                      const net = w.netAmount != null ? Number(w.netAmount) : Math.max(0, grossAmt - fee);
                      const status = (w.status || "PENDING").toUpperCase();
                      const dateStr = w.createdAt
                        ? new Date(w.createdAt).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-";

                      return (
                        <tr key={w.id || idx} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3.5 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-3 px-3.5 whitespace-nowrap text-foreground">{dateStr}</td>
                          <td className="py-3 px-3.5 font-bold text-foreground whitespace-nowrap">
                            ${grossAmt.toFixed(2)} USDT
                          </td>
                          <td className="py-3 px-3.5 text-amber-500 font-semibold whitespace-nowrap">
                            -${fee.toFixed(2)}
                          </td>
                          <td className="py-3 px-3.5 font-extrabold text-emerald-500 whitespace-nowrap">
                            ${net.toFixed(2)} USDT
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] max-w-[140px] truncate">
                              <span className="truncate">{w.toAddress}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(w.toAddress, `addr_${w.id || idx}`)}
                                className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                title="Copy receiving address"
                              >
                                {copiedId === `addr_${w.id || idx}` ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                status === "COMPLETED" || status === "PROCESSED"
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                                  : status === "PENDING"
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                                  : "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                              }`}
                            >
                              {status === "PENDING" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              )}
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-3.5">
                            {w.txHash ? (
                              <div className="flex items-center gap-1 font-mono text-[11px]">
                                <a
                                  href={`https://bscscan.com/tx/${w.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-0.5 truncate max-w-[110px]"
                                  title={w.txHash}
                                >
                                  <span>{w.txHash.slice(0, 8)}...</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(w.txHash, `tx_${w.id || idx}`)}
                                  className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                >
                                  {copiedId === `tx_${w.id || idx}` ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : w.adminNote ? (
                              <span className="text-[11px] text-muted-foreground italic truncate max-w-[120px] block" title={w.adminNote}>
                                {w.adminNote}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Success Modal */}
      {showWithdrawSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowWithdrawSuccessModal(false)}
        >
          <div
            className="relative w-full max-w-[360px] bg-card rounded-3xl p-6 pt-8 pb-5 text-center shadow-2xl border border-border animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Green Checkmark Badge */}
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-emerald-500/40 flex items-center justify-center bg-emerald-500/10 mb-4">
              <Check className="w-8 h-8 text-emerald-500 stroke-[3]" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
              Withdrawal Submitted!
            </h3>

            {/* Message */}
            <p className="text-xs sm:text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed mb-6">
              Your withdrawal request has been placed and will be processed on the blockchain within 24 hours.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowWithdrawSuccessModal(false);
                  setActiveSubTab("history");
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition cursor-pointer"
              >
                View History
              </button>
              <button
                type="button"
                onClick={() => setShowWithdrawSuccessModal(false)}
                className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-semibold text-xs hover:bg-muted/80 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
