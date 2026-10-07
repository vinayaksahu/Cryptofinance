"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Banknote,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
  Unlock,
  Sliders,
  Users,
  Check,
  Copy,
  Clock,
  Play,
  Pause,
  AlertCircle
} from "lucide-react";
import { formatUsdt } from "@/lib/utils";

export default function SuperRootCryptoDepositsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Settings & Health
  const [settingsData, setSettingsData] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [showModeModal, setShowModeModal] = useState(false);
  const [pendingModeChange, setPendingModeChange] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [confirmationsInput, setConfirmationsInput] = useState("3");
  const [usdtContractInput, setUsdtContractInput] = useState("");
  const [rpcUrlInput, setRpcUrlInput] = useState("");

  // RBAC permissions state
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [selectedAdminMode, setSelectedAdminMode] = useState<"GLOBAL" | "AUTOMATIC" | "MANUAL">("GLOBAL");
  const [adminPermsMap, setAdminPermsMap] = useState<Record<string, boolean>>({});
  const [savingPerms, setSavingPerms] = useState(false);

  // Deposits list
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/crypto-deposits/settings");
      if (res.ok) {
        const data = await res.json();
        setSettingsData(data);
        setSelectedMode(data.settings.depositProcessingMode);
        setConfirmationsInput(String(data.settings.requiredConfirmations));
        setUsdtContractInput(data.settings.usdtContract);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/crypto-deposits/permissions");
      if (res.ok) {
        const data = await res.json();
        setAdminsList(data.admins || []);
        setAvailablePermissions(data.availablePermissions || []);
        if (data.admins?.length > 0 && !selectedAdminId) {
          const firstAdmin = data.admins[0];
          setSelectedAdminId(firstAdmin.id);
          setSelectedAdminMode(firstAdmin.depositMode || "GLOBAL");
          const currentMap: Record<string, boolean> = {};
          (firstAdmin.permissions || []).forEach((p: string) => {
            currentMap[p] = true;
          });
          setAdminPermsMap(currentMap);
        } else if (selectedAdminId) {
          const currentAdmin = data.admins?.find((a: any) => a.id === selectedAdminId);
          if (currentAdmin) {
            setSelectedAdminMode(currentAdmin.depositMode || "GLOBAL");
          }
        }
      }
    } catch (err) {
      console.error("Error loading permissions:", err);
    }
  }, [selectedAdminId]);

  const fetchRecentDeposits = useCallback(async () => {
    setLoadingDeposits(true);
    try {
      const res = await fetch("/api/admin/crypto-deposits");
      if (res.ok) {
        const data = await res.json();
        setDeposits(data.deposits || []);
      }
    } catch (err) {
      console.error("Error loading deposits:", err);
    } finally {
      setLoadingDeposits(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchPermissions(), fetchRecentDeposits()]).finally(() => {
      setLoading(false);
    });
    const interval = setInterval(fetchSettings, 15000);
    return () => clearInterval(interval);
  }, [fetchSettings, fetchPermissions, fetchRecentDeposits]);

  const handleAdminSelect = (adminId: string) => {
    setSelectedAdminId(adminId);
    const adm = adminsList.find((a) => a.id === adminId);
    setSelectedAdminMode(adm?.depositMode || "GLOBAL");
    const currentMap: Record<string, boolean> = {};
    (adm?.permissions || []).forEach((p: string) => {
      currentMap[p] = true;
    });
    setAdminPermsMap(currentMap);
  };

  const handleTogglePermission = (permId: string) => {
    setAdminPermsMap((prev) => ({
      ...prev,
      [permId]: !prev[permId],
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedAdminId) return;
    setSavingPerms(true);
    setStatusMsg(null);
    try {
      const activePerms = Object.keys(adminPermsMap).filter((k) => adminPermsMap[k]);
      const res = await fetch("/api/superadmin/crypto-deposits/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: selectedAdminId,
          permissions: activePerms,
          depositMode: selectedAdminMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update permissions");
      setStatusMsg({ text: `Settings saved successfully for selected admin! (Branch Mode: ${selectedAdminMode})` });
      fetchPermissions();
    } catch (err: any) {
      setStatusMsg({ text: err.message, error: true });
    } finally {
      setSavingPerms(false);
    }
  };

  const initiateModeChange = (newMode: "AUTOMATIC" | "MANUAL") => {
    if (newMode === selectedMode) return;
    setPendingModeChange(newMode);
    setShowModeModal(true);
  };

  const confirmModeChange = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/superadmin/crypto-deposits/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositProcessingMode: pendingModeChange,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change deposit mode");
      setSelectedMode(pendingModeChange);
      setShowModeModal(false);
      setStatusMsg({ text: `Deposit mode switched to ${pendingModeChange}. Recorded in audit logs.` });
      fetchSettings();
    } catch (err: any) {
      setStatusMsg({ text: err.message, error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePause = async () => {
    const currentPauseState = settingsData?.settings?.automaticCreditEnabled;
    const newState = !currentPauseState;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/superadmin/crypto-deposits/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          automaticCreditEnabled: newState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle crediting state");
      setStatusMsg({
        text: newState
          ? "Automatic crediting RESUMED."
          : "Automatic crediting PAUSED. Incoming transfers will be held in safe queue.",
      });
      fetchSettings();
    } catch (err: any) {
      setStatusMsg({ text: err.message, error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleReconcile = async () => {
    if (!confirm("Trigger blockchain reconciliation scan across BSC blocks?")) return;
    setReconciling(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/crypto-deposits/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reconciliation failed");
      setStatusMsg({
        text: `Reconciliation scan complete! Detected: ${data.result.detectedCount} | Credited: ${data.result.creditedCount}`,
      });
      fetchSettings();
      fetchRecentDeposits();
    } catch (err: any) {
      setStatusMsg({ text: err.message, error: true });
    } finally {
      setReconciling(false);
    }
  };

  const handleSaveAdvancedSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/superadmin/crypto-deposits/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requiredConfirmations: Number(confirmationsInput),
          usdtContract: usdtContractInput,
          bscRpcUrl: rpcUrlInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save configuration");
      setStatusMsg({ text: "Blockchain configuration saved successfully!" });
      fetchSettings();
    } catch (err: any) {
      setStatusMsg({ text: err.message, error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDepositAction = async (depositId: string, action: "APPROVE" | "REJECT") => {
    const notes = prompt(`Enter note for ${action.toLowerCase()}:`);
    if (notes === null) return;
    try {
      const res = await fetch("/api/admin/crypto-deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId, action, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      alert(data.message || `Deposit ${action.toLowerCase()}ed.`);
      fetchRecentDeposits();
      fetchSettings();
    } catch (err: any) {
      alert(err.message || "Failed to process deposit");
    }
  };

  const health = settingsData?.health || {};
  const stats = settingsData?.stats || {};
  const autoCreditActive = settingsData?.settings?.automaticCreditEnabled ?? true;

  return (
    <div className="space-y-6">
      {/* Top Banner & Status Message */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${
          statusMsg.error
            ? "bg-rose-950/60 text-rose-300 border-rose-500/40"
            : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
        }`}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* SECTION 1: GLOBAL DEPOSIT PROCESSING MODE & PAUSE CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mode Selector Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Global Deposit Processing Mode</h2>
                <p className="text-xs text-muted-foreground">Controls how incoming USDT BEP-20 deposits are handled platform-wide.</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              selectedMode === "AUTOMATIC"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}>
              {selectedMode} Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Automatic Mode Box */}
            <div
              onClick={() => initiateModeChange("AUTOMATIC")}
              className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                selectedMode === "AUTOMATIC"
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-muted/30 border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  1. Fully Automatic Mode
                </span>
                <input
                  type="radio"
                  checked={selectedMode === "AUTOMATIC"}
                  onChange={() => initiateModeChange("AUTOMATIC")}
                  className="accent-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Blockchain monitor detects USDT transfers, validates contract &amp; confirmations, and <strong>automatically credits Fund Wallet</strong> without manual intervention.
              </p>
            </div>

            {/* Manual Approval Mode Box */}
            <div
              onClick={() => initiateModeChange("MANUAL")}
              className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                selectedMode === "MANUAL"
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-muted/30 border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  2. Manual Approval Mode
                </span>
                <input
                  type="radio"
                  checked={selectedMode === "MANUAL"}
                  onChange={() => initiateModeChange("MANUAL")}
                  className="accent-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Transactions are independently verified on-chain and queued into <strong>Pending Approval</strong>. Requires authorized admin with <code className="text-primary text-[10px]">deposit.approve</code> to credit.
              </p>
            </div>
          </div>
        </div>

        {/* System Pause & Quick Stats Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Emergency Crediting Pause</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Instantly pause all automatic crediting while keeping blockchain monitoring active. Deposits will be held safely in <code className="text-foreground">CREDIT_PENDING_PAUSED</code>.
            </p>

            <button
              onClick={handleTogglePause}
              disabled={saving}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                autoCreditActive
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
              }`}
            >
              {autoCreditActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Automatic Crediting</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Resume Automatic Crediting</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted p-2 rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground block font-semibold">Credited</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats.creditedCount || 0}</span>
            </div>
            <div className="bg-muted p-2 rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground block font-semibold">Review</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{stats.pendingReviewCount || 0}</span>
            </div>
            <div className="bg-muted p-2 rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground block font-semibold">Confirming</span>
              <span className="text-sm font-bold text-primary">{stats.confirmingCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BLOCKCHAIN MONITOR HEALTH DASHBOARD */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">BNB Smart Chain (BSC) Monitor Health</h2>
              <p className="text-xs text-muted-foreground">Direct real-time monitoring of USDT BEP-20 contract Transfer events.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReconcile}
              disabled={reconciling}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? "animate-spin" : ""}`} />
              <span>{reconciling ? "Scanning Blocks..." : "Run Reconciliation"}</span>
            </button>
            <button
              onClick={fetchSettings}
              className="p-1.5 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80"
              title="Refresh Health"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="bg-muted/40 border border-border rounded-xl p-3.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Network</span>
            <span className="text-xs font-bold text-foreground">BNB Smart Chain</span>
            <span className="text-[10px] text-muted-foreground block">Chain ID: 56</span>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-3.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">RPC Status</span>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              health.connected ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
            }`}>
              <span className={`w-2 h-2 rounded-full ${health.connected ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
              {health.connected ? "Connected" : "Error"}
            </span>
            <span className="text-[9px] text-muted-foreground block truncate mt-0.5">{health.currentRpc}</span>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-3.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Latest BSC Block</span>
            <span className="text-sm font-bold text-foreground">{health.latestBlock || "0"}</span>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-3.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Last Processed</span>
            <span className="text-sm font-bold text-foreground">{health.lastProcessedBlock || "0"}</span>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-3.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Block Lag</span>
            <span className={`text-sm font-bold ${
              health.blockLag <= 5 ? "text-emerald-600 dark:text-emerald-400" : health.blockLag <= 20 ? "text-amber-500" : "text-destructive"
            }`}>
              {health.blockLag} blocks
            </span>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-3.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Monitor Status</span>
            <span className="text-xs font-bold text-foreground uppercase">{health.status || "IDLE"}</span>
          </div>
        </div>

        {/* USDT Contract Display */}
        <div className="bg-muted/40 border border-border rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">Configured USDT BEP-20 Contract:</span>
            <span className="text-foreground font-bold select-all">{settingsData?.settings?.usdtContract}</span>
          </div>
          <a
            href={`https://bscscan.com/token/${settingsData?.settings?.usdtContract}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1 font-semibold text-xs"
          >
            <span>View on BscScan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* SECTION 3: ADMIN-WISE DEPOSIT MODE & GRANULAR RBAC PERMISSIONS */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Admin-Wise Mode Control &amp; RBAC Permissions</h2>
              <p className="text-xs text-muted-foreground">
                Configure deposit processing per admin (e.g. Admin A = Manual Approval, Admin B = Automatic) and grant granular permissions.
              </p>
            </div>
          </div>

          <button
            onClick={handleSavePermissions}
            disabled={savingPerms || !selectedAdminId}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {savingPerms ? "Saving..." : "Save Admin Settings"}
          </button>
        </div>

        {/* Sub-Admins Branch Overview Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">All Sub-Admins Branch Modes &amp; Status</span>
            <span className="text-[11px] text-muted-foreground">Click any admin below or select from dropdown to configure</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border text-[10px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3">Team / Branch</th>
                  <th className="py-2.5 px-3">Active Deposit Mode</th>
                  <th className="py-2.5 px-3">Permissions</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {adminsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">No sub-admins found.</td>
                  </tr>
                ) : (
                  adminsList.map((adm) => {
                    const isSelected = adm.id === selectedAdminId;
                    const mode = adm.depositMode || "GLOBAL";
                    return (
                      <tr
                        key={adm.id}
                        onClick={() => handleAdminSelect(adm.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{adm.fullName}</span>
                            <span className="text-[10px] text-muted-foreground">{adm.customId} ({adm.role})</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-foreground">
                          {adm.teamPrefix || "Default Branch"}
                        </td>
                        <td className="py-2.5 px-3">
                          {mode === "AUTOMATIC" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <Zap className="w-3 h-3" /> ⚡ Automatic (Instant)
                            </span>
                          ) : mode === "MANUAL" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <ShieldCheck className="w-3 h-3" /> 🛡️ Manual Approval
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                              🌐 Inherit Global ({selectedMode})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {adm.permissions?.length || 0} granted
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdminSelect(adm.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary border border-border text-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {isSelected ? "Selected" : "Configure"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Admin Configuration Panel */}
        <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-muted-foreground">Editing Settings For:</label>
              <select
                value={selectedAdminId}
                onChange={(e) => handleAdminSelect(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
              >
                {adminsList.map((adm) => (
                  <option key={adm.id} value={adm.id}>
                    {adm.customId} — {adm.fullName} ({adm.role})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Active Permissions: <strong className="text-primary">{Object.values(adminPermsMap).filter(Boolean).length}</strong> / {availablePermissions.length}
            </span>
          </div>

          {/* Admin Deposit Mode Override Controls */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span>Admin Branch Deposit Processing Mode:</span>
            </label>
            <p className="text-[11px] text-muted-foreground mb-3">
              Choose whether deposits for users assigned to this admin are processed automatically or require manual review.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Inherit Global */}
              <div
                onClick={() => setSelectedAdminMode("GLOBAL")}
                className={`cursor-pointer rounded-xl p-3 border transition-all ${
                  selectedAdminMode === "GLOBAL"
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    🌐 Global Default
                  </span>
                  <input
                    type="radio"
                    checked={selectedAdminMode === "GLOBAL"}
                    onChange={() => setSelectedAdminMode("GLOBAL")}
                    className="accent-primary"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Follows platform-wide global mode (currently <strong className="text-primary uppercase">{selectedMode}</strong>).
                </p>
              </div>

              {/* Force Automatic */}
              <div
                onClick={() => setSelectedAdminMode("AUTOMATIC")}
                className={`cursor-pointer rounded-xl p-3 border transition-all ${
                  selectedAdminMode === "AUTOMATIC"
                    ? "bg-emerald-500/10 border-emerald-500 shadow-sm"
                    : "bg-background border-border hover:border-emerald-500/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    ⚡ Force Automatic
                  </span>
                  <input
                    type="radio"
                    checked={selectedAdminMode === "AUTOMATIC"}
                    onChange={() => setSelectedAdminMode("AUTOMATIC")}
                    className="accent-emerald-600"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Deposits for this admin&apos;s users are <strong>instantly credited</strong> upon blockchain confirmation.
                </p>
              </div>

              {/* Force Manual Approval */}
              <div
                onClick={() => setSelectedAdminMode("MANUAL")}
                className={`cursor-pointer rounded-xl p-3 border transition-all ${
                  selectedAdminMode === "MANUAL"
                    ? "bg-amber-500/10 border-amber-500 shadow-sm"
                    : "bg-background border-border hover:border-amber-500/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    🛡️ Force Manual Approval
                  </span>
                  <input
                    type="radio"
                    checked={selectedAdminMode === "MANUAL"}
                    onChange={() => setSelectedAdminMode("MANUAL")}
                    className="accent-amber-600"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Deposits for this admin&apos;s users are queued into <strong>Pending Review</strong> and require admin approval.
                </p>
              </div>
            </div>
          </div>

          {/* Granular Permissions Section */}
          <div className="pt-2">
            <label className="text-xs font-bold text-foreground block mb-2">
              Assigned Authorities for Selected Admin:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availablePermissions.map((perm) => {
                const isChecked = !!adminPermsMap[perm.id];
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission(perm.id)}
                    className={`cursor-pointer rounded-xl p-3 border transition-all flex items-start gap-2.5 ${
                      isChecked
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(perm.id)}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-foreground block">{perm.label}</span>
                      <span className="text-[10px] text-muted-foreground block leading-tight mt-0.5">{perm.description}</span>
                      <code className="text-[9px] text-primary block mt-1">{perm.id}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: RECENT DEPOSITS LOG & INSTANT REVIEW */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 bg-primary rounded-sm" />
            <h2 className="text-base font-bold text-foreground">Live Deposit Stream &amp; Master Actions</h2>
          </div>
          <button
            onClick={fetchRecentDeposits}
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border text-[11px] uppercase tracking-wider font-semibold bg-muted/30">
                <th className="py-3 px-3">SR</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">TxHash</th>
                <th className="py-3 px-3">Confirmations</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">SuperRoot Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground font-medium">
                    No crypto deposits recorded yet.
                  </td>
                </tr>
              ) : (
                deposits.slice(0, 15).map((dep: any, index: number) => {
                  const isPending = dep.status === "PENDING" || dep.status === "PENDING_REVIEW" || dep.status === "MANUAL_REVIEW";
                  return (
                    <tr key={dep.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3 text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold">{dep.user?.fullName || "Member"}</span>
                          <span className="text-[10px] text-muted-foreground">{dep.user?.customId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatUsdt(dep.amountInUsdt || dep.amountUsdt || 0)}
                      </td>
                      <td className="py-3 px-3">
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
                          <span className="text-muted-foreground">Manual</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-foreground">
                        {dep.confirmations || 0} / {settingsData?.settings?.requiredConfirmations || 3}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {dep.processingMode || "MANUAL"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          dep.status === "CREDITED" || dep.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : dep.status === "PENDING" || dep.status === "PENDING_REVIEW"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}>
                          {dep.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDepositAction(dep.id, "APPROVE")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDepositAction(dep.id, "REJECT")}
                              className="px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 text-[10px] font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Processed</span>
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

      {/* CONFIRMATION MODAL FOR MODE SWITCH */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border text-card-foreground rounded-2xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Confirm Deposit Mode Switch
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Are you sure you want to change the platform deposit processing mode to{" "}
              <strong className="text-primary uppercase">{pendingModeChange}</strong>?
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-5 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              <strong>Notice:</strong> Changing the deposit processing mode affects <strong>NEW</strong> deposits. Existing deposits retain their current processing state and historical mode.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModeModal(false)}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmModeChange}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:bg-primary/90"
              >
                {saving ? "Saving..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
