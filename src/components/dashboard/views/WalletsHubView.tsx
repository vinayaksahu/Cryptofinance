"use client";

import React, { useState, useEffect } from "react";
import {
  Repeat,
  Check,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  UserCheck,
  UserX,
} from "lucide-react";

interface WalletsHubViewProps {
  user: any;
  initialWallet?: string;
  initialEngine?: "internal" | "external";
  onNavigateTab?: (tab: string) => void;
  onRefresh?: () => void;
}

export function WalletsHubView({
  user,
  initialWallet = "all",
  initialEngine = "internal",
  onNavigateTab,
  onRefresh,
}: WalletsHubViewProps) {
  const [activeEngine, setActiveEngine] = useState<"internal" | "external">(
    initialEngine === "external" || initialWallet === "p2p" ? "external" : "internal"
  );

  // Sync initialEngine if passed differently
  useEffect(() => {
    if (initialEngine) {
      setActiveEngine(initialEngine);
    } else if (initialWallet === "p2p") {
      setActiveEngine("external");
    }
  }, [initialEngine, initialWallet]);

  // Internal Transfer state (ROI / Working to Main / P2P)
  const [transferSource, setTransferSource] = useState<"ROI" | "WORKING">("ROI");
  const [transferTarget, setTransferTarget] = useState<"MAIN" | "P2P">("P2P");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transactionPin, setTransactionPin] = useState<string>("");
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState("");
  const [internalSuccess, setInternalSuccess] = useState("");

  // External P2P Transfer state (P2P to P2P between members)
  const [p2pRecipientId, setP2pRecipientId] = useState<string>("");
  const [p2pRecipientName, setP2pRecipientName] = useState<string>("");
  const [p2pLookupLoading, setP2pLookupLoading] = useState(false);
  const [p2pLookupError, setP2pLookupError] = useState("");
  const [p2pAmount, setP2pAmount] = useState<string>("");
  const [p2pPin, setP2pPin] = useState<string>("");
  const [p2pLoading, setP2pLoading] = useState(false);
  const [p2pError, setP2pError] = useState("");
  const [p2pSuccess, setP2pSuccess] = useState("");

  // Balances
  const wallets = user?.wallets || {};
  const bonusBalance = Number(wallets.bonusBalance ?? user?.bonusBalance ?? user?.lockedBonus ?? 0);
  const roiBalance = Number(wallets.roiBalance ?? user?.roiBalance ?? user?.incomeBreakdown?.basicTodayRoi ?? 0);
  const workingBalance = Number(wallets.workingBalance ?? user?.workingBalance ?? user?.incomeBalance ?? 0);
  const p2pBalance = Number(wallets.p2pBalance ?? user?.p2pBalance ?? user?.fundBalance ?? 0);
  const mainBalance = Number(wallets.mainBalance ?? user?.mainBalance ?? 0);

  const availableSourceBalance = transferSource === "ROI" ? roiBalance : workingBalance;

  // Debounced recipient lookup for External P2P Transfer
  useEffect(() => {
    const cleanId = p2pRecipientId.trim().toUpperCase();
    if (!cleanId || cleanId.length < 3) {
      setP2pRecipientName("");
      setP2pLookupError("");
      return;
    }

    if (cleanId === user?.customId?.toUpperCase()) {
      setP2pRecipientName("");
      setP2pLookupError("Cannot transfer to your own ID.");
      return;
    }

    const timer = setTimeout(async () => {
      setP2pLookupLoading(true);
      setP2pLookupError("");
      try {
        const res = await fetch(`/api/user/lookup?customId=${encodeURIComponent(cleanId)}`);
        const data = await res.json();
        if (res.ok && data.user) {
          setP2pRecipientName(data.user.fullName || data.user.customId);
          setP2pLookupError("");
        } else {
          setP2pRecipientName("");
          setP2pLookupError(data.error || "Recipient member not found.");
        }
      } catch {
        setP2pRecipientName("");
        setP2pLookupError("Failed to verify recipient ID.");
      } finally {
        setP2pLookupLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [p2pRecipientId, user?.customId]);

  // Handle Internal Wallet Transfer
  const handleInternalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError("");
    setInternalSuccess("");

    const numAmt = Number(transferAmount);
    if (!numAmt || numAmt <= 0) {
      setInternalError("Please enter a valid transfer amount.");
      return;
    }

    if (numAmt > availableSourceBalance) {
      setInternalError(
        `Insufficient ${transferSource} balance ($${availableSourceBalance.toFixed(2)} USDT available).`
      );
      return;
    }

    if (transactionPin.length !== 6) {
      setInternalError("Please enter your 6-digit Transaction PIN.");
      return;
    }

    setInternalLoading(true);

    try {
      const res = await fetch("/api/wallet/transfer-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceWallet: transferSource,
          targetWallet: transferTarget,
          amount: numAmt,
          transactionPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to transfer wallet funds.");
      }

      setInternalSuccess(
        data.message ||
          `Successfully transferred $${numAmt.toFixed(2)} USDT from ${transferSource} to ${transferTarget === "MAIN" ? "Main" : "Secondary"} Wallet!`
      );
      setTransferAmount("");
      setTransactionPin("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setInternalError(err.message || "Failed to process internal transfer.");
    } finally {
      setInternalLoading(false);
    }
  };

  // Handle External P2P Transfer
  const handleExternalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setP2pError("");
    setP2pSuccess("");

    const cleanId = p2pRecipientId.trim().toUpperCase();
    if (!cleanId) {
      setP2pError("Please enter a recipient Member ID.");
      return;
    }

    if (cleanId === user?.customId?.toUpperCase()) {
      setP2pError("You cannot transfer funds to yourself.");
      return;
    }

    const numAmt = Number(p2pAmount);
    if (!numAmt || numAmt <= 0) {
      setP2pError("Please enter a valid transfer amount.");
      return;
    }

    if (numAmt > p2pBalance) {
      setP2pError(`Insufficient Secondary Wallet balance ($${p2pBalance.toFixed(2)} USDT available).`);
      return;
    }

    if (p2pPin.length !== 6) {
      setP2pError("Please enter your 6-digit Transaction PIN.");
      return;
    }

    setP2pLoading(true);

    try {
      const res = await fetch("/api/wallet/p2p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientCustomId: cleanId,
          amount: numAmt,
          transactionPin: p2pPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process P2P transfer.");
      }

      setP2pSuccess(
        data.message ||
          `Successfully sent $${numAmt.toFixed(2)} USDT to ${p2pRecipientName ? `${p2pRecipientName} (${cleanId})` : cleanId}!`
      );
      setP2pRecipientId("");
      setP2pRecipientName("");
      setP2pAmount("");
      setP2pPin("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setP2pError(err.message || "Failed to process P2P transfer.");
    } finally {
      setP2pLoading(false);
    }
  };

  const setInternalPercentAmount = (pct: number) => {
    const val = +((availableSourceBalance * pct) / 100).toFixed(2);
    setTransferAmount(val.toString());
  };

  const setP2pPercentAmount = (pct: number) => {
    const val = +((p2pBalance * pct) / 100).toFixed(2);
    setP2pAmount(val.toString());
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-primary" />
            <span>Multi-Wallet Ecosystem</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Triple-Isolated Liquidity &bull; Bonus Utility &bull; P2P Transfers &bull; External Cashouts
          </p>
        </div>
      </div>

      {/* =========================================================================
          TRANSFER ENGINES: INTERNAL & EXTERNAL (P2P)
          ========================================================================= */}
      <div id="transfer-engine-section" className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Engine Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted border border-border w-fit">
            <button
              type="button"
              onClick={() => setActiveEngine("internal")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeEngine === "internal"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Internal Transfer Engine</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEngine("external")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeEngine === "external"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>Secondary Wallet P2P Transfer</span>
            </button>
          </div>

          <div className="text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto">
            Instant Execution &bull; Direct Liquidity
          </div>
        </div>

        {/* -------------------------------------------------------------
            ENGINE 1: INTERNAL WALLET TRANSFER (ROI & Working -> Main/Secondary)
            ------------------------------------------------------------- */}
        {activeEngine === "internal" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                <span>Internal Wallet Transfer Engine</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Convert your ROI or Working Wallet earnings to Main (Withdrawal) Wallet or Secondary Wallet.
              </p>
            </div>

            {/* Notifications */}
            {internalSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-sm flex items-center gap-3">
                <Check className="w-5 h-5 shrink-0" />
                <span className="font-semibold">{internalSuccess}</span>
              </div>
            )}

            {internalError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-semibold">{internalError}</span>
              </div>
            )}

            <form onSubmit={handleInternalTransfer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Source Wallet Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    1. Select Source Wallet
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTransferSource("ROI")}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        transferSource === "ROI"
                          ? "bg-primary/10 border-primary text-foreground shadow-sm"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block text-muted-foreground">ROI WALLET</span>
                      <span className="text-lg font-bold text-emerald-500 block mt-0.5">
                        ${roiBalance.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">Daily 4% Returns</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransferSource("WORKING")}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        transferSource === "WORKING"
                          ? "bg-primary/10 border-primary text-foreground shadow-sm"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block text-muted-foreground">WORKING WALLET</span>
                      <span className="text-lg font-bold text-primary block mt-0.5">
                        ${workingBalance.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">Direct &amp; Royalties</span>
                    </button>
                  </div>
                </div>

                {/* Target Destination Wallet Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    2. Select Destination Wallet
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTransferTarget("MAIN")}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        transferTarget === "MAIN"
                          ? "bg-primary/10 border-primary text-foreground shadow-sm"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block text-muted-foreground">MAIN WALLET</span>
                      <span className="text-lg font-bold text-emerald-500 block mt-0.5">
                        Cashout USDT
                      </span>
                      <span className="text-[10px] text-muted-foreground block">BEP-20 External Withdrawal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransferTarget("P2P")}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        transferTarget === "P2P"
                          ? "bg-primary/10 border-primary text-foreground shadow-sm"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block text-muted-foreground">SECONDARY WALLET</span>
                      <span className="text-lg font-bold text-primary block mt-0.5">
                        Deposit / Activation
                      </span>
                      <span className="text-[10px] text-muted-foreground block">Activate any ID or send P2P</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Transfer Amount Input & Presets */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-foreground uppercase tracking-wider">
                    3. Transfer Amount ($ USDT)
                  </label>
                  <span className="text-muted-foreground">
                    Available in {transferSource} Wallet:{" "}
                    <strong className="text-foreground">${availableSourceBalance.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-background border border-input focus:border-primary rounded-xl px-4 py-3 text-xl font-bold text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <span className="absolute right-4 inset-y-0 flex items-center text-xs font-bold text-muted-foreground">
                    USDT
                  </span>
                </div>

                {/* Quick Percentage Presets */}
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setInternalPercentAmount(pct)}
                      className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-bold text-foreground hover:bg-muted transition"
                    >
                      {pct === 100 ? "MAX" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6-Digit PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  4. 6-Digit Security Transaction PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit PIN"
                  className="w-full sm:w-72 bg-background border border-input focus:border-primary rounded-xl px-4 py-2 text-center text-sm font-semibold tracking-widest placeholder:text-xs placeholder:tracking-normal placeholder:font-normal placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>

              {/* Submit Transfer Button */}
              <button
                type="submit"
                disabled={internalLoading || !transferAmount || Number(transferAmount) <= 0 || transactionPin.length !== 6}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                {internalLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Internal Transfer...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-semibold">
                      Transfer ${Number(transferAmount || 0).toFixed(2)} USDT from {transferSource} to {transferTarget === "MAIN" ? "Main" : "Secondary"} Wallet
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* -------------------------------------------------------------
            ENGINE 2: EXTERNAL WALLET TRANSFER (Secondary Wallet P2P Between Members)
            ------------------------------------------------------------- */}
        {activeEngine === "external" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <Repeat className="w-5 h-5 text-primary" />
                <span>Secondary Wallet P2P Transfer Engine</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Transfer Secondary Wallet funds directly to any member&apos;s Secondary Wallet for peer activations and team coordination.
              </p>
            </div>

            {/* Notifications */}
            {p2pSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-sm flex items-center gap-3">
                <Check className="w-5 h-5 shrink-0" />
                <span className="font-semibold">{p2pSuccess}</span>
              </div>
            )}

            {p2pError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-semibold">{p2pError}</span>
              </div>
            )}

            <form onSubmit={handleExternalTransfer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Source Wallet Summary */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    1. Source Wallet
                  </label>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-primary">SECONDARY WALLET</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                        SOURCE
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-1">
                      ${p2pBalance.toFixed(2)} <span className="text-xs text-muted-foreground font-sans">USDT</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Available balance for deposit recharges, peer transfers, and member activations.
                    </p>
                  </div>
                </div>

                {/* Recipient Member ID & Live Verification */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    2. Recipient Member ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={p2pRecipientId}
                      onChange={(e) => setP2pRecipientId(e.target.value.toUpperCase())}
                      placeholder="e.g. CF10001"
                      className="w-full bg-background border border-input focus:border-primary rounded-xl px-4 py-3 text-base font-bold text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                    {p2pLookupLoading && (
                      <span className="absolute right-4 inset-y-0 flex items-center text-xs text-primary">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      </span>
                    )}
                  </div>

                  {/* Recipient Verification Status */}
                  {p2pRecipientName && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>
                        Verified Member: <strong>{p2pRecipientName}</strong>
                      </span>
                    </div>
                  )}

                  {p2pLookupError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                      <UserX className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{p2pLookupError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer Amount Input & Presets */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-foreground uppercase tracking-wider">
                    3. Transfer Amount ($ USDT)
                  </label>
                  <span className="text-muted-foreground">
                    Available in Secondary Wallet: <strong className="text-foreground">${p2pBalance.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={p2pAmount}
                    onChange={(e) => setP2pAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-background border border-input focus:border-primary rounded-xl px-4 py-3 text-xl font-bold text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <span className="absolute right-4 inset-y-0 flex items-center text-xs font-bold text-muted-foreground">
                    USDT
                  </span>
                </div>

                {/* Quick Percentage Presets */}
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setP2pPercentAmount(pct)}
                      className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-bold text-foreground hover:bg-muted transition"
                    >
                      {pct === 100 ? "MAX" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6-Digit PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  4. 6-Digit Security Transaction PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={p2pPin}
                  onChange={(e) => setP2pPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit PIN"
                  className="w-full sm:w-72 bg-background border border-input focus:border-primary rounded-xl px-4 py-2 text-center text-sm font-semibold tracking-widest placeholder:text-xs placeholder:tracking-normal placeholder:font-normal placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>

              {/* Submit P2P Transfer Button */}
              <button
                type="submit"
                disabled={
                  p2pLoading ||
                  !p2pRecipientId ||
                  !p2pAmount ||
                  Number(p2pAmount) <= 0 ||
                  p2pPin.length !== 6 ||
                  Boolean(p2pLookupError)
                }
                className="w-full py-2.5 sm:py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                {p2pLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Secondary Wallet Transfer...</span>
                  </>
                ) : (
                  <>
                    <Repeat className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-semibold">
                      Transfer ${Number(p2pAmount || 0).toFixed(2)} USDT to {p2pRecipientName ? `${p2pRecipientName} (${p2pRecipientId})` : p2pRecipientId || "Member"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
