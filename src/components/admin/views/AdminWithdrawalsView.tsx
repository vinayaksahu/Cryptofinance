"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Send, XCircle, Copy, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatUsdt, formatInr } from '@/lib/utils';

interface AdminWithdrawalsViewProps {
  onRefresh: () => void;
}

type WithdrawalStatus = 'PENDING' | 'PROCESSED' | 'REJECTED';

interface Withdrawal {
  id: string;
  userId: string;
  user?: {
    name?: string;
    fullName?: string;
    customId?: string;
    email?: string;
  };
  amountInr?: number;
  amountUsdt?: number;
  amountInUsdt?: number;
  grossAmount?: number;
  amountGross?: number;
  feePercent?: number;
  feeAmount?: number;
  netAmount?: number;
  netPayout?: number;
  payoutAddress?: string;
  toAddress?: string;
  status: WithdrawalStatus;
  createdAt: string;
  txHash?: string;
  adminNote?: string;
}

export default function AdminWithdrawalsView({ onRefresh }: AdminWithdrawalsViewProps) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [summary, setSummary] = useState<any>({
    totalProcessedGross: 0,
    totalProcessedFee: 0,
    totalProcessedNet: 0,
    pendingGross: 0,
    pendingFee: 0,
    pendingNet: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PROCESSED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/withdrawals');
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.withdrawals || []);
      setWithdrawals(list);
      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("fetchWithdrawals error:", error);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleDispatch = async (w: Withdrawal) => {
    const gross = w.grossAmount ?? w.amountGross ?? w.amountInUsdt ?? w.amountUsdt ?? 0;
    const fee = w.feeAmount ?? (gross * 0.1);
    const net = w.netPayout ?? w.netAmount ?? (gross - fee);
    const address = w.payoutAddress || w.toAddress || "";

    const txHash = prompt(
      `DISPATCH PAYOUT CONFIRMATION:\n\n` +
      `• Member: ${w.user?.fullName || "Member"} (${w.user?.customId || "N/A"})\n` +
      `• Gross Requested: $${gross.toFixed(2)} USDT\n` +
      `• 10% Admin Fee Deducted: -$${fee.toFixed(2)} USDT\n` +
      `• NET AMOUNT TO SEND: $${net.toFixed(2)} USDT\n` +
      `• Destination Address: ${address}\n\n` +
      `Please transfer $${net.toFixed(2)} USDT and enter the Transaction Hash (TxHash):`
    );
    if (txHash === null) return; // Cancelled
    if (!txHash.trim()) {
      alert('TxHash is required to dispatch payout');
      return;
    }

    const adminNote = prompt('Enter optional admin note:');
    if (adminNote === null) return;

    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: w.id, action: 'APPROVE', txHash, adminNote }),
      });

      if (!res.ok) throw new Error('Failed to process withdrawal');
      
      await fetchWithdrawals();
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Error processing withdrawal');
    }
  };

  const handleReject = async (withdrawalId: string) => {
    const adminNote = prompt('Enter reason for rejection (Admin Note):');
    if (adminNote === null) return;

    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action: 'REJECT', adminNote }),
      });

      if (!res.ok) throw new Error('Failed to reject withdrawal');
      
      await fetchWithdrawals();
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Error rejecting withdrawal');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const filteredWithdrawals = useMemo(() => {
    if (!Array.isArray(withdrawals)) return [];
    return withdrawals.filter(w => {
      if (!w) return false;
      const matchesFilter = filter === 'ALL' || w.status === filter;
      const searchLower = search.toLowerCase();
      const userName = (w.user?.fullName || w.user?.name || '').toLowerCase();
      const customId = (w.user?.customId || '').toLowerCase();
      const address = (w.payoutAddress || w.toAddress || '').toLowerCase();
      const matchesSearch = search === '' || 
        userName.includes(searchLower) || 
        customId.includes(searchLower) ||
        address.includes(searchLower);
      return matchesFilter && matchesSearch;
    });
  }, [withdrawals, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredWithdrawals.length / itemsPerPage));
  const paginatedWithdrawals = filteredWithdrawals.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusColor = (status: WithdrawalStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'PROCESSED': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'REJECTED': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Withdrawal & Fee Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
            Total Net Dispatched (90%)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-500">
            {formatUsdt(summary.totalProcessedNet || 0)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Actual USDT sent to members ($450 base)
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
            Admin Fee Income (10%)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary">
            {formatUsdt(summary.totalProcessedFee || 0)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            10% platform profit retained from withdrawals
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">
            Pending Net to Dispatch
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-500">
            {formatUsdt(summary.pendingNet || 0)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Queue waiting for TxHash confirmation
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-1.5 bg-muted p-1 rounded-xl border border-border">
            {['ALL', 'PENDING', 'PROCESSED', 'REJECTED'].map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f as any); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user or address..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-xs">Loading withdrawals...</p>
            </div>
          ) : paginatedWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs font-medium">
              No withdrawals found matching your criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-muted-foreground text-[11px] uppercase tracking-wider border-b border-border pb-3 font-semibold">
                  <th className="pb-3 px-2">SR</th>
                  <th className="pb-3 px-2">Member</th>
                  <th className="pb-3 px-2">Gross Request</th>
                  <th className="pb-3 px-2 text-primary">Fee (10%)</th>
                  <th className="pb-3 px-2 text-emerald-600 dark:text-emerald-400">Net Payout (To Dispatch)</th>
                  <th className="pb-3 px-2">Payout Address</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedWithdrawals.map((withdrawal, index) => {
                  const gross = withdrawal.grossAmount ?? withdrawal.amountGross ?? withdrawal.amountInUsdt ?? withdrawal.amountUsdt ?? 0;
                  const fee = withdrawal.feeAmount ?? (gross * 0.1);
                  const net = withdrawal.netPayout ?? withdrawal.netAmount ?? (gross - fee);
                  const address = withdrawal.payoutAddress || withdrawal.toAddress || '';

                  return (
                    <tr key={withdrawal.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 px-2 text-muted-foreground font-mono">
                        {(page - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold">{withdrawal.user?.fullName || withdrawal.user?.name || "Member"}</span>
                          <span className="text-[11px] text-muted-foreground font-mono">{withdrawal.user?.customId || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-foreground font-semibold">
                        {formatUsdt(gross)}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                          -{formatUsdt(fee)}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg inline-block">
                          {formatUsdt(net)}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        {address ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground font-mono text-[11px]">
                              {address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(address)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy address"
                            >
                              {copiedAddress === address ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-muted-foreground text-xs">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="flex justify-end gap-1.5">
                          {withdrawal.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleDispatch(withdrawal)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 flex items-center gap-1 text-xs font-bold"
                                title={`Dispatch Net Payout of ${formatUsdt(net)}`}
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Dispatch {formatUsdt(net)}</span>
                              </button>
                              <button
                                onClick={() => handleReject(withdrawal.id)}
                                className="p-1.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20"
                                title="Reject & Refund"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
            <p>
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredWithdrawals.length)} of {filteredWithdrawals.length} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
