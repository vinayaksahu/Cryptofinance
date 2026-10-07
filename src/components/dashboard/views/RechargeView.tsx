"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Copy, Check, QrCode, X, RefreshCw, ExternalLink, ShieldAlert, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

interface RechargeViewProps {
  user: any;
  onRefresh: () => void;
}

export function RechargeView({ user, onRefresh }: RechargeViewProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [showOptionalTxHash, setShowOptionalTxHash] = useState(false);

  // Crypto deposit dynamic state
  const [cryptoData, setCryptoData] = useState<{
    address: string;
    network: string;
    asset: string;
    qrUrl: string;
    mode: "AUTOMATIC" | "MANUAL";
    requiredConfirmations: number;
    deposits: any[];
  } | null>(null);
  const [loadingCrypto, setLoadingCrypto] = useState(true);

  const fetchCryptoDetails = useCallback(async () => {
    try {
      const res = await fetch("/api/member/crypto-deposit");
      if (res.ok) {
        const data = await res.json();
        setCryptoData(data);
      }
    } catch (err) {
      console.error("Error fetching deposit details:", err);
    } finally {
      setLoadingCrypto(false);
    }
  }, []);

  useEffect(() => {
    fetchCryptoDetails();
    // Poll for live confirmation updates every 12 seconds
    const interval = setInterval(fetchCryptoDetails, 12000);
    return () => clearInterval(interval);
  }, [fetchCryptoDetails]);

  const depositAddress = cryptoData?.address || user?.usdtAddress || APP_CONFIG.depositAddress;
  const qrImage = cryptoData?.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${depositAddress}`;
  const isAutomatic = cryptoData?.mode === "AUTOMATIC";

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) {
      if (isAutomatic) {
        // In automatic mode, TxHash is optional — don't block submission
        setMessage({ text: "Please enter a TxHash to submit for instant verification.", error: true });
        return;
      }
      setMessage({ text: "Please enter your USDT BEP-20 transaction hash (TxHash).", error: true });
      return;
    }

    // Manual mode: validate recharge amount
    if (!isAutomatic) {
      const amt = parseFloat(rechargeAmount);
      if (!rechargeAmount || isNaN(amt) || amt < 5) {
        setMessage({ text: "Please enter a valid recharge amount (minimum 5 USDT).", error: true });
        return;
      }
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/member/crypto-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: txHash.trim(),
          ...((!isAutomatic && rechargeAmount) ? { declaredAmount: parseFloat(rechargeAmount) } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Deposit verification failed");
      }
      setMessage({ text: data.message || "Deposit submitted and verified on blockchain!" });
      setTxHash("");
      setRechargeAmount("");
      fetchCryptoDetails();
      onRefresh();
      setTimeout(() => {
        setShowQrModal(false);
        setMessage(null);
      }, 3500);
    } catch (err: any) {
      setMessage({ text: err.message, error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const deposits = cryptoData?.deposits && cryptoData.deposits.length > 0
    ? cryptoData.deposits
    : (user.deposits || []);

  const latestPending = deposits.find(
    (d: any) => d.status === "PENDING" || d.status === "CONFIRMING" || d.status === "PENDING_REVIEW"
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <span>Recharge USDT</span>
            {isAutomatic && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Instant Automatic Mode
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Deposit USDT on BNB Smart Chain (BEP-20) to credit your <strong>Secondary Wallet</strong> for ID activations &amp; P2P transfers.
          </p>
        </div>
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <span>Package</span>
          <span>/</span>
          <span className="text-foreground font-semibold">Deposit USDT</span>
        </div>
      </div>

      {/* Safety Warning & Wallet Utility Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-foreground/90 leading-relaxed">
          <strong className="text-amber-500 font-bold block mb-0.5">Secondary Wallet Deposit Information:</strong>
          Approved USDT deposits will directly credit your <span className="font-bold text-foreground">Secondary Wallet</span>. Use your Secondary Wallet balance to activate your own ID, activate any member's ID (with up to 10% Bonus Wallet utility), or transfer to peers via P2P.
        </div>
      </div>

      {/* Main Address Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isAutomatic ? "Your Dedicated Deposit Address" : "Official Deposit Address"}
              </span>
              <button
                onClick={fetchCryptoDetails}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-muted/40 border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <span className="text-[11px] text-muted-foreground block font-semibold mb-1">BEP-20 (BNB Smart Chain)</span>
                <p className="text-sm sm:text-base font-bold text-foreground break-all select-all">
                  {depositAddress}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyAddress}
                  className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mode Explainer Footer */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {isAutomatic
                  ? "Automatic Monitoring Active: 3 Block Confirmations Required"
                  : "USDT BEP-20 Network Supported"}
              </span>
            </div>
            <button
              onClick={() => setShowQrModal(true)}
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>Submit TxHash</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Live Deposit Status Tracker Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Live Deposit Tracker</span>
            </h3>

            {latestPending ? (
              <div className="border border-border bg-muted/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <span className="font-bold text-amber-500 uppercase tracking-wider text-[11px]">
                    {latestPending.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Amount:</span>
                  <span className="font-bold text-emerald-500">
                    ${Number(latestPending.amountInUsdt).toFixed(2)} USDT
                  </span>
                </div>
                {isAutomatic && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Confirmations:</span>
                    <span className="text-foreground">
                      {latestPending.confirmations || 0} / {cryptoData?.requiredConfirmations || 3}
                    </span>
                  </div>
                )}
                {latestPending.txHash && (
                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">TxHash:</span>
                    <a
                      href={`https://bscscan.com/tx/${latestPending.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{latestPending.txHash.slice(0, 6)}...{latestPending.txHash.slice(-4)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                <p className="mb-2">No pending deposits detected.</p>
                <p className="text-[11px] text-muted-foreground/80">
                  Send USDT BEP-20 to your address above. Incoming transfers will automatically appear here.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border text-center">
            <span className="text-[10px] text-muted-foreground">
              Blockchain: BNB Smart Chain (Chain ID: 56)
            </span>
          </div>
        </div>
      </div>

      {/* Payment History Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-foreground">
              Deposit History
            </h2>
          </div>
          <button
            onClick={fetchCryptoDetails}
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/60 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">SR</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">TX HASH</th>
                {isAutomatic && <th className="py-3 px-4">CONFIRMATIONS</th>}
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={isAutomatic ? 6 : 5} className="py-8 text-center text-muted-foreground font-medium">
                    No deposits recorded yet.
                  </td>
                </tr>
              ) : (
                deposits.map((dep: any, index: number) => (
                  <tr key={dep.id || index} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{new Date(dep.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-emerald-500">
                      ${Number(dep.amountInUsdt ?? dep.amountUsdt ?? 0).toFixed(2)} USDT
                    </td>
                    <td className="py-3 px-4">
                      {dep.txHash ? (
                        <a
                          href={`https://bscscan.com/tx/${dep.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <span>{dep.txHash.slice(0, 6)}...{dep.txHash.slice(-4)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Direct</span>
                      )}
                    </td>
                    {isAutomatic && (
                      <td className="py-3 px-4 text-muted-foreground">
                        {dep.confirmations || 0} / {cryptoData?.requiredConfirmations || 3}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        dep.status === "CONFIRMED" || dep.status === "CREDITED" || dep.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          : dep.status === "PENDING" || dep.status === "CONFIRMING" || dep.status === "PENDING_REVIEW"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR & TxHash Submission Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="border border-border bg-card rounded-2xl p-6 sm:p-8 max-w-md w-full relative shadow-xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-1">
              Deposit USDT (BEP-20)
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Send USDT BEP-20 directly to the deposit address shown below.
            </p>

            {/* QR Code Container */}
            <div className="flex flex-col items-center bg-muted/40 border border-border rounded-xl p-4 mb-5">
              <div className="w-48 h-48 bg-white p-2.5 rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-border">
                <img
                  src={qrImage}
                  alt="USDT Deposit QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                <span>BEP-20 Network Only</span>
              </div>
              <p className="text-[11px] text-foreground mt-3 break-all text-center px-2 select-all">
                {depositAddress}
              </p>
              <button
                onClick={copyAddress}
                className="mt-3 px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Address"}</span>
              </button>
            </div>

            {/* Auto-Detect Info Banner — AUTOMATIC mode only */}
            {isAutomatic && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-500">Auto-Credit Enabled</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Simply send USDT to the address above. Your deposit will be <span className="font-bold text-foreground">automatically detected and credited</span> within 1-3 minutes. No further action needed.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{cryptoData?.requiredConfirmations || 3} block confirmations required (~{(cryptoData?.requiredConfirmations || 3) * 3}s on BSC)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TxHash Submission Form */}
            <form onSubmit={handleSubmitDeposit} className="space-y-4">
              {/* Recharge Amount - Manual Mode Only */}
              {!isAutomatic && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-foreground">
                      Recharge Amount (USDT)
                    </label>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      Min. 5 USDT
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="Enter amount (min. 5 USDT)"
                      min="5"
                      step="0.01"
                      className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary pr-16"
                      required
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-muted-foreground select-none">
                      USDT
                    </span>
                  </div>
                  {/* Quick preset amount buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[5, 10, 25, 50, 100, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmount(String(amt))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          rechargeAmount === String(amt)
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted border-border text-foreground hover:bg-muted/80"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AUTOMATIC mode: optional collapsible TxHash section */}
              {isAutomatic ? (
                <div className="border border-border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowOptionalTxHash((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-muted/40 hover:bg-muted transition-colors"
                  >
                    <span className="text-xs text-muted-foreground">
                      <span className="text-primary">⚡</span> Already sent? Submit TxHash for instant credit{" "}
                      <span className="text-[10px] text-muted-foreground font-semibold ml-1 bg-muted px-1.5 py-0.5 rounded border border-border">OPTIONAL</span>
                    </span>
                    <span className={`text-muted-foreground text-xs transition-transform ${showOptionalTxHash ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {showOptionalTxHash && (
                    <div className="p-3.5 pt-2 space-y-3 border-t border-border">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          BSC Transaction Hash (TxHash)
                        </label>
                        <input
                          type="text"
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          placeholder="Paste 0x... BSC TxHash"
                          className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          Skip this — your deposit will still be auto-credited. Use only for instant verification.
                        </span>
                      </div>

                      {message && (
                        <div className={`p-3 rounded-xl text-xs font-semibold ${
                          message.error
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                        }`}>
                          {message.text}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting || !txHash.trim()}
                        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-sm transition-all disabled:opacity-40"
                      >
                        {submitting ? "Verifying on Blockchain..." : "Submit TxHash for Instant Credit"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* MANUAL mode: TxHash is required */
                <>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Enter BSC Transaction Hash (TxHash)
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Paste 0x... BSC TxHash"
                      className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                    <span className="text-[10px] text-muted-foreground block mt-1">
                      Our backend independently verifies the transaction on the BSC blockchain.
                    </span>
                  </div>

                  {message && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${
                      message.error
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-sm transition-all disabled:opacity-50"
                  >
                    {submitting ? "Verifying on Blockchain..." : "Submit Transaction for Verification"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
