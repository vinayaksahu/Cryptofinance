"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  RotateCcw,
  RefreshCw,
  Copy,
  Check,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  ChevronDown,
  Download,
} from "lucide-react";

interface TableExportToolbarProps {
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onRefresh?: () => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onCopy: () => void;
  onExcel: () => void;
  onPdf: () => void;
  onPrint: () => void;
  isCopied?: boolean;
}

export function TableExportToolbar({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onSearch,
  onReset,
  onRefresh,
  pageSize,
  setPageSize,
  onCopy,
  onExcel,
  onPdf,
  onPrint,
  isCopied = false,
}: TableExportToolbarProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="space-y-4">
      {/* 1. Date Filter Controls Bar */}
      <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="dd-mm-yyyy"
              className="w-full pl-3 pr-2 py-2 rounded-xl bg-background border border-input text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <span className="text-muted-foreground text-xs font-semibold">to</span>
          <div className="relative flex-1">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="dd-mm-yyyy"
              className="w-full pl-3 pr-2 py-2 rounded-xl bg-background border border-input text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Action Buttons: Search, Reset, Refresh */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSearch}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-muted border border-border hover:bg-muted/80 text-foreground font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* 2. Table Controls Bar: Entries Per Page & Copy/Excel/PDF/Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Entries per page */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-background border border-input rounded-xl px-3 py-1.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="font-medium">entries per page</span>
        </div>

        {/* Export dropdown menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${exportMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-card border border-border shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              {/* Copy button */}
              <button
                type="button"
                onClick={() => {
                  onCopy();
                  setExportMenuOpen(false);
                }}
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

              {/* Excel button */}
              <button
                type="button"
                onClick={() => {
                  onExcel();
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Excel</span>
              </button>

              {/* PDF button */}
              <button
                type="button"
                onClick={() => {
                  onPdf();
                  setExportMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-muted text-foreground flex items-center gap-2 transition-colors font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span>PDF</span>
              </button>

              <div className="my-1 border-t border-border" />

              {/* Print button */}
              <button
                type="button"
                onClick={() => {
                  onPrint();
                  setExportMenuOpen(false);
                }}
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
  );
}
