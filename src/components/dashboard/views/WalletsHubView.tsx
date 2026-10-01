"use client";

import React, { useState } from "react";
import {
  Wallet,
  Zap,
  Gift,
  Repeat,
  ArrowUpRight,
  ShieldCheck,
  Check,
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  ChevronRight,
  Info,
} from "lucide-react";

interface WalletsHubViewProps {
  user: any;
  initialWallet?: "all" | "bonus" | "roi" | "working" | "p2p" | "main";
  onNavigateTab?: (tab: string) => void;
  onRefresh?: () => void;
}

export function WalletsHubView({
  user,
  initialWallet = "all",
  onNavigateTab,
  onRefresh,
}: WalletsHubViewProps) {
  const [selectedWalletTab, setSelectedWalletTab] = useState<string>(initialWallet);

  // Transfer modal / form state for ROI or Working wallet
  const [transferSource, setTransferSource] = useState<"ROI" | "WORKING">("ROI");
  const [transferTarget, setTransferTarget] = useState<"MAIN" | "P2P">("P2P");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transactionPin, setTransactionPin] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Balances
  const wallets = user?.wallets || {};
  const bonusBalance = Number(wallets.bonusBalance ?? user?.bonusBalance ?? user?.lockedBonus ?? 0);
  const roiBalance = Number(wallets.roiBalance ?? user?.roiBalance ?? user?.incomeBreakdown?.basicTodayRoi ?? 0);
  const workingBalance = Number(wallets.workingBalance ?? user?.workingBalance ?? user?.incomeBalance ?? 0);
  const p2pBalance = Number(wallets.p2pBalance ?? user?.p2pBalance ?? user?.fundBalance ?? 0);
  const mainBalance = Number(wallets.mainBalance ?? user?.mainBalance ?? 0);

  const availableSourceBalance = transferSource === "ROI" ? roiBalance : workingBalance;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const numAmt = Number(transferAmount);
    if (!numAmt || numAmt <= 0) {
      setError("Please enter a valid transfer amount.");
      return;
    }

    if (numAmt > availableSourceBalance) {
      setError(
        `Insufficient ${transferSource} balance ($${availableSourceBalance.toFixed(2)} USDT available).`
      );
      return;
    }

    if (transactionPin.length !== 6) {
      setError("Please enter your 6-digit Transaction PIN.");
      return;
    }

    setLoading(true);

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

      setSuccess(
        data.message ||
          `Successfully transferred $${numAmt.toFixed(2)} USDT from ${transferSource} to ${transferTarget === "MAIN" ? "Main" : "P2P"} Wallet!`
      );
      setTransferAmount("");
      setTransactionPin("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to process transfer.");
    } finally {
      setLoading(false);
    }
  };

  const setPercentAmount = (pct: number) => {
    const val = +((availableSourceBalance * pct) / 100).toFixed(2);
    setTransferAmount(val.toString());
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#00D2FF]" />
            <span>Multi-Wallet Ecosystem</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Triple-Isolated Liquidity &bull; Bonus Utility &bull; P2P Transfers &bull; External Cashouts
          </p>
        </div>

        {/* Wallet Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 overflow-x-auto">
          {[
            { id: "all", label: "All Wallets" },
            { id: "bonus", label: "Bonus Wallet" },
            { id: "roi", label: "ROI Wallet" },
            { id: "working", label: "Working Wallet" },
            { id: "p2p", label: "P2P Wallet" },
            { id: "main", label: "Main Wallet" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedWalletTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap ${
                selectedWalletTab === tab.id
                  ? "bg-[#00D2FF] text-slate-950 shadow-md shadow-[#00D2FF]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-3">
          <Check className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* =========================================================================
          WALLET CARDS GRID
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. BONUS WALLET */}
        {(selectedWalletTab === "all" || selectedWalletTab === "bonus") && (
          <div className="glass-card-elevated glass-glow-top p-6 flex flex-col justify-between border-t-2 border-t-[#FFB800] relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFB800] bg-[#FFB800]/10 px-2.5 py-0.5 rounded-full border border-[#FFB800]/30 font-mono">
                  NON-WITHDRAWABLE &bull; 10% UTILITY
                </span>
                <Gift className="w-5 h-5 text-[#FFB800]" />
              </div>

              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
                BONUS WALLET
              </h3>

              <div className="text-3xl sm:text-4xl font-black text-[#FFB800] font-mono my-2">
                ${bonusBalance.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USDT</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-2 mt-3 font-mono">
                <div className="flex items-start gap-1.5">
                  <span className="text-[#FFB800] font-bold">&bull;</span>
                  <span><strong>Rule:</strong> Only usable for ID activation &amp; reinvestment.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#FFB800] font-bold">&bull;</span>
                  <span><strong>Max Utility:</strong> Up to 10% of total investment amount per stake.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#FFB800] font-bold">&bull;</span>
                  <span><strong>Sources:</strong> $1.00 Self Signup + $0.40/Level downline signups.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab("stake-activate")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FFB800]/15 hover:bg-[#FFB800] text-[#FFB800] hover:text-slate-950 font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 border border-[#FFB800]/30 shadow-md"
              >
                <Zap className="w-4 h-4" />
                <span>Activate ID Using Bonus (10%)</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. ROI WALLET */}
        {(selectedWalletTab === "all" || selectedWalletTab === "roi") && (
          <div className="glass-card-elevated glass-glow-top p-6 flex flex-col justify-between border-t-2 border-t-[#00FFA3] relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00FFA3] bg-[#00FFA3]/10 px-2.5 py-0.5 rounded-full border border-[#00FFA3]/30 font-mono">
                  DAILY 4% YIELD
                </span>
                <Zap className="w-5 h-5 text-[#00FFA3]" />
              </div>

              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
                ROI WALLET
              </h3>

              <div className="text-3xl sm:text-4xl font-black text-[#00FFA3] font-mono my-2">
                ${roiBalance.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USDT</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-2 mt-3 font-mono">
                <div className="flex items-start gap-1.5">
                  <span className="text-[#00FFA3] font-bold">&bull;</span>
                  <span><strong>Source:</strong> Automated 4.00% daily returns from 2X pool.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#00FFA3] font-bold">&bull;</span>
                  <span><strong>Options:</strong> Transfer to Main (Withdrawal) OR P2P Wallet.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#00FFA3] font-bold">&bull;</span>
                  <span><strong>Internal Fee:</strong> 0% fee on all internal wallet transfers.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTransferSource("ROI");
                  setTransferTarget("MAIN");
                  setTransferAmount(roiBalance.toString());
                  const element = document.getElementById("transfer-engine-section");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-900/70 hover:bg-white/10 border border-white/15 text-white font-bold text-xs font-mono transition-all text-center"
              >
                &rarr; Main Wallet
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransferSource("ROI");
                  setTransferTarget("P2P");
                  setTransferAmount(roiBalance.toString());
                  const element = document.getElementById("transfer-engine-section");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="py-2.5 px-3 rounded-xl bg-[#00FFA3]/20 hover:bg-[#00FFA3] text-[#00FFA3] hover:text-slate-950 font-bold text-xs font-mono transition-all text-center border border-[#00FFA3]/30"
              >
                &rarr; P2P Wallet
              </button>
            </div>
          </div>
        )}

        {/* 3. WORKING WALLET */}
        {(selectedWalletTab === "all" || selectedWalletTab === "working") && (
          <div className="glass-card-elevated glass-glow-top p-6 flex flex-col justify-between border-t-2 border-t-[#00D2FF] relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00D2FF] bg-[#00D2FF]/10 px-2.5 py-0.5 rounded-full border border-[#00D2FF]/30 font-mono">
                  DIRECT + ROYALTY + REWARDS
                </span>
                <Wallet className="w-5 h-5 text-[#00D2FF]" />
              </div>

              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
                WORKING WALLET
              </h3>

              <div className="text-3xl sm:text-4xl font-black text-[#00D2FF] font-mono my-2">
                ${workingBalance.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USDT</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-2 mt-3 font-mono">
                <div className="flex items-start gap-1.5">
                  <span className="text-[#00D2FF] font-bold">&bull;</span>
                  <span><strong>Sources:</strong> 10% Direct Referrals + 10-Level Downline Royalties.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#00D2FF] font-bold">&bull;</span>
                  <span><strong>Options:</strong> Transfer to Main (Withdrawal) OR P2P Wallet.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#00D2FF] font-bold">&bull;</span>
                  <span><strong>Milestones:</strong> Cashout rank rewards directly here.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTransferSource("WORKING");
                  setTransferTarget("MAIN");
                  setTransferAmount(workingBalance.toString());
                  const element = document.getElementById("transfer-engine-section");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-900/70 hover:bg-white/10 border border-white/15 text-white font-bold text-xs font-mono transition-all text-center"
              >
                &rarr; Main Wallet
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransferSource("WORKING");
                  setTransferTarget("P2P");
                  setTransferAmount(workingBalance.toString());
                  const element = document.getElementById("transfer-engine-section");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="py-2.5 px-3 rounded-xl bg-[#00D2FF]/20 hover:bg-[#00D2FF] text-[#00D2FF] hover:text-slate-950 font-bold text-xs font-mono transition-all text-center border border-[#00D2FF]/30"
              >
                &rarr; P2P Wallet
              </button>
            </div>
          </div>
        )}

        {/* 4. P2P WALLET */}
        {(selectedWalletTab === "all" || selectedWalletTab === "p2p") && (
          <div className="glass-card-elevated glass-glow-top p-6 flex flex-col justify-between border-t-2 border-t-purple-400 relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-400/10 px-2.5 py-0.5 rounded-full border border-purple-400/30 font-mono">
                  P2P TRANSFER &bull; ACTIVATION
                </span>
                <Repeat className="w-5 h-5 text-purple-400" />
              </div>

              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
                P2P WALLET
              </h3>

              <div className="text-3xl sm:text-4xl font-black text-purple-400 font-mono my-2">
                ${p2pBalance.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USDT</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-2 mt-3 font-mono">
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">&bull;</span>
                  <span><strong>P2P Transfer:</strong> Send to another member's P2P wallet (0% fee).</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">&bull;</span>
                  <span><strong>ID Activation:</strong> Activate any member ID using 10% Bonus Wallet utility.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">&bull;</span>
                  <span><strong>Funded By:</strong> BEP-20 USDT deposits, ROI transfers, Working transfers.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab("tx-transfer")}
                className="py-2.5 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/30 font-bold text-xs font-mono transition-all text-center"
              >
                Send P2P (0% Fee)
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab("stake-activate")}
                className="py-2.5 px-3 rounded-xl bg-[#00FFA3]/20 hover:bg-[#00FFA3] text-[#00FFA3] hover:text-slate-950 border border-[#00FFA3]/30 font-bold text-xs font-mono transition-all text-center"
              >
                Activate Member ID
              </button>
            </div>
          </div>
        )}

        {/* 5. MAIN WALLET (WITHDRAWAL WALLET) */}
        {(selectedWalletTab === "all" || selectedWalletTab === "main") && (
          <div className="glass-card-elevated glass-glow-top p-6 flex flex-col justify-between border-t-2 border-t-emerald-400 relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                  EXTERNAL CASHOUT WALLET
                </span>
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              </div>

              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
                MAIN WALLET (WITHDRAWAL)
              </h3>

              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono my-2">
                ${mainBalance.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USDT</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-2 mt-3 font-mono">
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong>Cashout:</strong> Withdraw directly to your personal BEP-20 address.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong>Threshold:</strong> Minimum withdrawal is $2.00 USDT.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong>Protocol Fee:</strong> 10% liquidity fee on external cashouts.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab("tx-withdraw")}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Request BEP-20 Withdrawal ($2 Min)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          INTERACTIVE WALLET TRANSFER ENGINE SECTION
          ========================================================================= */}
      <div id="transfer-engine-section" className="glass-card-elevated glass-glow-top p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#00D2FF]" />
              <span>Internal Wallet Transfer Engine (0% Fee)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Convert your ROI or Working Wallet earnings to Main (Withdrawal) Wallet or P2P Wallet.
            </p>
          </div>
          <div className="glass-pill border-[#00FFA3]/30 bg-[#00FFA3]/10 text-[#00FFA3] text-xs font-bold font-mono">
            0% Transfer Fee &bull; Instant Execution
          </div>
        </div>

        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Source Wallet Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                1. Select Source Wallet
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTransferSource("ROI")}
                  className={`p-3.5 rounded-2xl border text-left font-mono transition-all ${
                    transferSource === "ROI"
                      ? "bg-[#00FFA3]/15 border-[#00FFA3] text-white shadow-lg shadow-[#00FFA3]/10"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold block text-slate-400">ROI WALLET</span>
                  <span className="text-lg font-extrabold text-[#00FFA3] block mt-0.5">
                    ${roiBalance.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Daily 4% Returns</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransferSource("WORKING")}
                  className={`p-3.5 rounded-2xl border text-left font-mono transition-all ${
                    transferSource === "WORKING"
                      ? "bg-[#00D2FF]/15 border-[#00D2FF] text-white shadow-lg shadow-[#00D2FF]/10"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold block text-slate-400">WORKING WALLET</span>
                  <span className="text-lg font-extrabold text-[#00D2FF] block mt-0.5">
                    ${workingBalance.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Direct &amp; Royalties</span>
                </button>
              </div>
            </div>

            {/* Target Destination Wallet Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                2. Select Destination Wallet
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTransferTarget("MAIN")}
                  className={`p-3.5 rounded-2xl border text-left font-mono transition-all ${
                    transferTarget === "MAIN"
                      ? "bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold block text-slate-400">MAIN WALLET</span>
                  <span className="text-lg font-extrabold text-emerald-400 block mt-0.5">
                    Cashout USDT
                  </span>
                  <span className="text-[10px] text-slate-500 block">BEP-20 External Withdrawal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransferTarget("P2P")}
                  className={`p-3.5 rounded-2xl border text-left font-mono transition-all ${
                    transferTarget === "P2P"
                      ? "bg-purple-500/15 border-purple-400 text-white shadow-lg shadow-purple-500/10"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold block text-slate-400">P2P WALLET</span>
                  <span className="text-lg font-extrabold text-purple-400 block mt-0.5">
                    P2P / Stake
                  </span>
                  <span className="text-[10px] text-slate-500 block">Transfer to members or activate ID</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transfer Amount Input & Presets */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <label className="font-bold text-slate-300 uppercase tracking-wider">
                3. Transfer Amount ($ USDT)
              </label>
              <span className="text-slate-400">
                Available in {transferSource} Wallet:{" "}
                <strong className="text-white">${availableSourceBalance.toFixed(2)}</strong>
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
                className="w-full bg-slate-950/70 border border-white/15 focus:border-[#00D2FF] rounded-2xl px-4 py-3.5 text-xl font-black text-white font-mono placeholder-slate-600 focus:outline-none"
                required
              />
              <span className="absolute right-4 inset-y-0 flex items-center text-xs font-extrabold text-slate-400 font-mono">
                USDT
              </span>
            </div>

            {/* Quick Percentage Presets */}
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPercentAmount(pct)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:border-[#00D2FF] transition font-mono"
                >
                  {pct === 100 ? "MAX" : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* 6-Digit PIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
              4. 6-Digit Security Transaction PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={transactionPin}
              onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit PIN"
              className="w-full sm:w-80 bg-slate-950/70 border border-white/15 focus:border-[#00D2FF] rounded-xl px-4 py-2.5 text-center tracking-[0.3em] text-base font-mono text-white font-extrabold placeholder-slate-600 focus:outline-none"
              required
            />
          </div>

          {/* Submit Transfer Button */}
          <button
            type="submit"
            disabled={loading || !transferAmount || Number(transferAmount) <= 0 || transactionPin.length !== 6}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00D2FF] to-indigo-600 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#00D2FF]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] font-mono"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Transfer...</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                <span>
                  Transfer ${Number(transferAmount || 0).toFixed(2)} USDT from {transferSource} to {transferTarget === "MAIN" ? "Main" : "P2P"} Wallet
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
