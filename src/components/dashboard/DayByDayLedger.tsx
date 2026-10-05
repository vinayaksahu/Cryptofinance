"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Clock,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface DayByDayLedgerProps {
  user: any;
  onRefresh?: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface LedgerRow {
  day: number;
  balance: number;
  roi: number;
  action: "REINVESTED" | "CLAIMED" | "PENDING_ACTION" | "UPCOMING";
  after: number;
  cumPayout: number;
  date: string;
  isToday: boolean;
  canAction: boolean;
}

export function DayByDayLedger({ user, onRefresh, onNavigateTab }: DayByDayLedgerProps) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [data, setData] = useState<{
    hasActiveContract: boolean;
    contractId?: string;
    principalUsdt?: number;
    poolBalance?: number;
    roiRate?: number;
    dailyRoiAmount?: number;
    closingTimestamp?: number;
    closingGstFormatted?: string;
    currentGstFormatted?: string;
    isActivationDay?: boolean;
    calendarDaysElapsed?: number;
    isTodayProcessed?: boolean;
    rows?: LedgerRow[];
  } | null>(null);

  const [selectedAction, setSelectedAction] = useState<"REINVEST" | "CLAIM">("REINVEST");
  const [actionMessage, setActionMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Live Countdown State
  const [countdown, setCountdown] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isClosed: boolean;
  }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
    isClosed: false,
  });

  const fetchLedger = useCallback(async () => {
    try {
      const res = await fetch("/api/member/daily-ledger");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load daily ledger:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // Live Countdown Timer to 23:59:59 GST
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const target = data?.closingTimestamp || (now + 6 * 3600 * 1000);
      const diff = target - now;

      if (diff <= 0) {
        setCountdown({
          hours: "00",
          minutes: "00",
          seconds: "00",
          isClosed: true,
        });
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({
          hours: String(h).padStart(2, "0"),
          minutes: String(m).padStart(2, "0"),
          seconds: String(s).padStart(2, "0"),
          isClosed: false,
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data?.closingTimestamp]);

  // Execute Reinvest or Claim
  const handleExecuteAction = async (action: "REINVEST" | "CLAIM") => {
    if (!data?.contractId) return;

    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/member/daily-ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: data.contractId,
          action,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Action failed to execute.");
      }

      setActionMessage({
        text: resData.message || (action === "REINVEST" ? "Reinvested successfully!" : "Claimed to ROI Wallet!"),
        error: false,
      });

      await fetchLedger();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setActionMessage({
        text: err.message || "Failed to process action.",
        error: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const handleDownloadCSV = () => {
    const rows = data?.rows || [];
    if (rows.length === 0) return;

    const headers = ["Day", "Date", "Start Balance (USDT)", "Daily ROI (USDT)", "Action", "End Balance (USDT)", "Cumulative Payout (USDT)"];
    const csvLines = [headers.join(",")];

    rows.forEach((r) => {
      csvLines.push([
        r.day,
        `"${r.date}"`,
        r.balance.toFixed(4),
        r.roi.toFixed(4),
        r.action,
        r.after.toFixed(4),
        r.cumPayout.toFixed(4),
      ].join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvLines.join("\n"));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `Day-by-Day-Ledger-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const rows = data?.rows || [];
  const roiPercentLabel = data?.roiRate ? `${data.roiRate / 2}% ROI` : "2% ROI";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 space-y-5 shadow-sm relative overflow-hidden">
      {/* Header matching index.html */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📋</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight font-mono">
              Day-by-Day Ledger
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Only completed cycles and active upcoming days are displayed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchLedger}
            title="Refresh Ledger"
            className="p-1.5 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>&darr; CSV</span>
          </button>
        </div>
      </div>

      {/* Auto-Claim Closing Countdown Banner (GST Time) */}
      <div className="rounded-2xl p-4 bg-muted/40 border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            {data?.isActivationDay ? (
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-primary animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                {data?.isActivationDay
                  ? "Stake Activation Period (Day 0) • 0% ROI Today"
                  : "Auto-Claim Closing Countdown (GST)"}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {data?.isActivationDay
                ? "Your stake is active! Day 1 yield cycle begins tomorrow at 00:00 GST (Dubai Midnight). Today is the activation period, so zero ROI is deducted or claimed today."
                : "Daily closing occurs at 23:59:59 GST (Dubai Midnight). Unclaimed returns automatically auto-claim to your ROI Wallet!"}
            </p>
          </div>
        </div>

        {/* Big Countdown Pill */}
        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">
            {data?.isActivationDay ? "Day 1 Starts In" : "Auto-Claim In"}
          </span>
          <div className="flex items-center gap-1 self-start md:self-auto bg-card px-4 py-2 rounded-2xl border border-border shadow-sm">
            <div className="text-center px-1">
              <span className="text-base sm:text-lg font-black text-primary">{countdown.hours}</span>
              <span className="text-[9px] block text-muted-foreground font-sans">HRS</span>
            </div>
            <span className="text-muted-foreground font-bold text-base pb-3">:</span>
            <div className="text-center px-1">
              <span className="text-base sm:text-lg font-black text-primary">{countdown.minutes}</span>
              <span className="text-[9px] block text-muted-foreground font-sans">MIN</span>
            </div>
            <span className="text-muted-foreground font-bold text-base pb-3">:</span>
            <div className="text-center px-1">
              <span className="text-base sm:text-lg font-black text-primary">{countdown.seconds}</span>
              <span className="text-[9px] block text-muted-foreground font-sans">SEC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-mono flex items-center gap-2.5 animate-in fade-in ${
            actionMessage.error
              ? "bg-rose-500/10 border border-rose-500/30 text-rose-500"
              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
          }`}
        >
          {actionMessage.error ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-muted/60 text-muted-foreground border-b border-border uppercase text-[11px] tracking-wider font-bold select-none">
            <tr>
              <th className="py-3 px-4 text-center">DAY</th>
              <th className="py-3 px-4 text-right">BALANCE</th>
              <th className="py-3 px-4 text-right">{roiPercentLabel}</th>
              <th className="py-3 px-4 text-center min-w-[200px]">ACTION</th>
              <th className="py-3 px-4 text-right">AFTER</th>
              <th className="py-3 px-4 text-right">CUM. PAYOUT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted-foreground font-mono">
                  <div className="space-y-3">
                    <p className="text-sm">No active quantitative stake found yet.</p>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab("stake-activate")}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider font-mono shadow-sm cursor-pointer"
                      >
                        Activate Stake to Begin Yield
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                return (
                  <tr
                    key={row.day}
                    className={`transition-colors hover:bg-muted/30 ${
                      row.isToday ? "bg-amber-500/10 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    {/* Day Column */}
                    <td className="py-3.5 px-4 text-center font-bold text-foreground">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{row.day}</span>
                        {row.isToday && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-black uppercase">
                            TODAY
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Balance Column */}
                    <td className="py-3.5 px-4 text-right text-foreground font-mono font-medium">
                      ${row.balance.toFixed(4)}
                    </td>

                    {/* ROI Column */}
                    <td className="py-3.5 px-4 text-right text-emerald-500 font-bold font-mono">
                      +${row.roi.toFixed(4)}
                    </td>

                    {/* Action Column (Exact 1 Button ReInvest / Claim as requested) */}
                    <td className="py-3 px-4 text-center">
                      {row.action === "REINVESTED" && (
                        <div className="inline-flex items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold font-mono">
                            <span>🔄</span>
                            <span>Reinvested</span>
                          </div>
                          {row.isToday && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleExecuteAction("CLAIM")}
                              className="px-2.5 py-1 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 text-[11px] font-bold font-mono transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer"
                              title="Claim into ROI Wallet instead"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Claim to ROI Wallet</span>
                            </button>
                          )}
                        </div>
                      )}

                      {row.action === "CLAIMED" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-500 text-xs font-bold font-mono">
                          <span>💸</span>
                          <span>Claimed</span>
                        </div>
                      )}

                      {row.action === "PENDING_ACTION" && (
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-muted/50 border border-border">
                          {/* Segmented 1-button toggle interface */}
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleExecuteAction("REINVEST")}
                            className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold font-mono transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                            title="Compound today's returns into your active 2X stake pool"
                          >
                            <RefreshCw className={`w-3 h-3 ${actionLoading ? "animate-spin" : ""}`} />
                            <span>Reinvest</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleExecuteAction("CLAIM")}
                            className="px-3 py-1 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 text-xs font-bold font-mono transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="Instantly credit today's ROI to your ROI Wallet"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Claim</span>
                          </button>
                        </div>
                      )}

                      {row.action === "UPCOMING" && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono ${
                          row.date.includes("Tomorrow") || (row.day === 1 && data?.isActivationDay)
                            ? "bg-primary/10 border border-primary/30 text-primary font-bold"
                            : "bg-muted border border-border text-muted-foreground"
                        }`}>
                          <span>⏳</span>
                          <span>{row.date.includes("Tomorrow") ? "Starts Tomorrow (00:00 GST)" : "Upcoming (00:00 GST)"}</span>
                        </div>
                      )}
                    </td>

                    {/* After Balance Column */}
                    <td className="py-3.5 px-4 text-right text-muted-foreground font-mono">
                      ${row.after.toFixed(4)}
                    </td>

                    {/* Cumulative Payout Column */}
                    <td className="py-3.5 px-4 text-right text-primary font-bold font-mono">
                      ${row.cumPayout.toFixed(4)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Auto-Claim Rule Note */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#00D2FF]" />
          <span>
            {data?.isActivationDay
              ? "Stake activated today. Daily 2% yield and Reinvest/Claim actions will unlock starting tomorrow at 00:00 GST."
              : "If not manually reinvested, today's return will auto-credit to ROI Wallet at 23:59 GST."}
          </span>
        </div>
        <span className="text-slate-500">2X Contract Allocation Engine &bull; Slide 10-12</span>
      </div>
    </div>
  );
}
