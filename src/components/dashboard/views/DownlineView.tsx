"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Users, Search, Download, ChevronDown, Copy, Check, FileSpreadsheet, FileText, Printer, UserCheck, UserX, Sparkles } from "lucide-react";
import { copyTableToClipboard, exportToExcel, printOrExportPdf, ExportColumn } from "@/lib/exportUtils";

interface DownlineViewProps {
  user: any;
  mode: "direct" | "team";
  onNavigateTab?: (tab: string) => void;
}

export function DownlineView({ user, mode, onNavigateTab }: DownlineViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  const title = mode === "direct" ? "Direct Team" : "Team List";
  const rawList = mode === "direct" ? (user.directs || []) : (user.teamList || []);

  const filteredList = rawList.filter((item: any) => {
    const q = searchTerm.toLowerCase();
    return (
      item.id?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.referralId?.toLowerCase().includes(q)
    );
  });

  // Calculate Network Overview stats matching Genealogy Tree
  const { totalNetwork, activeMembers, inactiveMembers, directTeamCount } = useMemo(() => {
    const directs = (user?.directs || []) as any[];
    const team = (user?.teamList || []) as any[];
    
    // Total Network count = team list length (or user.totalTeamCount)
    // If user has teamList, use that, else fallback to user.totalTeamCount
    const allMembers = team.length > 0 ? team : directs;
    const totalCount = user?.totalTeamCount ?? (team.length > 0 ? team.length : directs.length);

    let activeCount = 0;
    let inactiveCount = 0;

    allMembers.forEach((m) => {
      if (m.activation === "Active" || Number(m.amount || 0) > 0) {
        activeCount++;
      } else {
        inactiveCount++;
      }
    });

    // If user.activeTeamCount is explicitly present, prefer it
    if (user?.activeTeamCount !== undefined) {
      activeCount = user.activeTeamCount;
      inactiveCount = Math.max(0, totalCount - activeCount);
    }

    const dCount = user?.directTeamCount ?? directs.length;

    return {
      totalNetwork: totalCount,
      activeMembers: activeCount,
      inactiveMembers: Math.max(0, totalCount - activeCount),
      directTeamCount: dCount,
    };
  }, [user]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportColumns: ExportColumn[] = [
    { header: "SR", key: "sr", format: (_, idx) => (idx !== undefined ? idx + 1 : 1) },
    { header: "DATE", key: "date" },
    { header: "ID", key: "id" },
    { header: "NAME", key: "name" },
    { header: "REFERRAL ID", key: "referralId" },
    { header: "LEVEL", key: "level", format: (r) => `L${r.level || 1}` },
    { header: "DOA", key: "doa" },
    { header: "ACTIVATION", key: "activation" },
  ];

  const handleCopy = async () => {
    const ok = await copyTableToClipboard(exportColumns, filteredList);
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      setExportMenuOpen(false);
    }
  };

  const handleExcel = () => {
    exportToExcel(mode === "direct" ? "direct_team" : "team_list", exportColumns, filteredList);
    setExportMenuOpen(false);
  };

  const handlePdf = () => {
    printOrExportPdf(title, exportColumns, filteredList, `Total Members: ${filteredList.length}`, user?.fullName || user?.username);
    setExportMenuOpen(false);
  };

  const handlePrint = () => {
    printOrExportPdf(title, exportColumns, filteredList, `Total Members: ${filteredList.length}`, user?.fullName || user?.username);
    setExportMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb / Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
            <span>Downline</span>
            <span>/</span>
            <span className="text-foreground font-semibold">{title}</span>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 border border-border bg-card p-1 rounded-xl shadow-sm">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-direct")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              mode === "direct"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Direct Team
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-team")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              mode === "team"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Team List
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("downline-tree")}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Tree View
          </button>
        </div>
      </div>

      {/* Network Overview Stats Cards - Exactly matching Genealogy Tree */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Network */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-border/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">Total Network</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground">
            {totalNetwork}
          </p>
        </div>

        {/* Active Members */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Members
            </span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-500">
            {activeMembers}
          </p>
        </div>

        {/* Inactive Members */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Inactive Members
            </span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-500">
            {inactiveMembers}
          </p>
        </div>

        {/* Direct Team */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-primary font-medium">Direct Team</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-primary">
            {directTeamCount}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-5 bg-primary rounded-full" />
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>

        {/* Controls: Per-Page, Search, Export Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <select className="bg-background border border-input rounded-lg px-2.5 py-1 text-foreground text-xs focus:outline-none">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>entries per page</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border border-input rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48"
              />
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
            </div>

            {/* Export Dropdown Menu */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Export</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${exportMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-card border border-border shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {/* Copy option */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Excel option */}
                  <button
                    type="button"
                    onClick={handleExcel}
                    className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Excel</span>
                  </button>

                  {/* PDF option */}
                  <button
                    type="button"
                    onClick={handlePdf}
                    className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    <span>PDF</span>
                  </button>

                  <div className="my-1 border-t border-border" />

                  {/* Print option */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
                  >
                    <Printer className="w-3.5 h-3.5 text-primary" />
                    <span>Print</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/60 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">SR</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-4">REFERRAL ID</th>
                <th className="py-3 px-4">LEVEL</th>
                <th className="py-3 px-4">DOA</th>
                <th className="py-3 px-4">ACTIVATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground font-medium">
                    No data available in table
                  </td>
                </tr>
              ) : (
                filteredList.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">{idx + 1}</td>
                    <td className="py-3 px-4">{row.date}</td>
                    <td className="py-3 px-4 font-bold text-primary">{row.id}</td>
                    <td className="py-3 px-4 font-semibold text-foreground capitalize">{row.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.referralId}</td>
                    <td className="py-3 px-4 font-bold text-primary">L{row.level}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.doa}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.activation === "Active"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                      }`}>
                        {row.activation}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-xs text-muted-foreground">
          <p>Showing {filteredList.length > 0 ? 1 : 0} to {filteredList.length} of {filteredList.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>«</button>
            <button className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>‹</button>
            <span className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-bold">1</span>
            <button className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>›</button>
            <button className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
