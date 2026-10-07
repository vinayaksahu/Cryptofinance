"use client";

import React, { useState } from "react";
import { Users, Search } from "lucide-react";

interface DownlineViewProps {
  user: any;
  mode: "direct" | "team";
  onNavigateTab?: (tab: string) => void;
}

export function DownlineView({ user, mode, onNavigateTab }: DownlineViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
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
                className="bg-background border border-input rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
              />
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["Copy", "Excel", "PDF", "Print"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => alert(`${btn} export feature triggered.`)}
                  className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-medium hover:bg-muted transition-colors"
                >
                  {btn}
                </button>
              ))}
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
