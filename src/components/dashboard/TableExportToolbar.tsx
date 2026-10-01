"use client";

import React, { useState } from "react";
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
  return (
    <div className="space-y-4">
      {/* 1. Date Filter Controls Bar */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="dd-mm-yyyy"
              className="w-full pl-3 pr-2 py-2 rounded-xl bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500/50 dark:focus:border-[#00D2FF]/50 dark:[color-scheme:dark]"
            />
          </div>
          <span className="text-slate-500 text-xs font-semibold">to</span>
          <div className="relative flex-1">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="dd-mm-yyyy"
              className="w-full pl-3 pr-2 py-2 rounded-xl bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500/50 dark:focus:border-[#00D2FF]/50 dark:[color-scheme:dark]"
            />
          </div>
        </div>

        {/* Action Buttons: Search, Reset, Refresh */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSearch}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-[#00D2FF] hover:from-sky-400 hover:to-[#00D2FF]/80 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
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
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 font-medium focus:outline-none focus:border-sky-500/50 dark:focus:border-[#00D2FF]/50 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="font-medium">entries per page</span>
        </div>

        {/* Export action group */}
        <div className="inline-flex rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 p-0.5 overflow-hidden">
          {/* Copy button */}
          <button
            type="button"
            onClick={onCopy}
            title="Copy table data to clipboard"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              isCopied
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Copy
              </>
            )}
          </button>

          <div className="w-[1px] bg-slate-200 dark:bg-slate-800 my-1" />

          {/* Excel button */}
          <button
            type="button"
            onClick={onExcel}
            title="Export as Excel / CSV spreadsheet"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            Excel
          </button>

          <div className="w-[1px] bg-slate-200 dark:bg-slate-800 my-1" />

          {/* PDF button */}
          <button
            type="button"
            onClick={onPdf}
            title="Export or Save as PDF"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            PDF
          </button>

          <div className="w-[1px] bg-slate-200 dark:bg-slate-800 my-1" />

          {/* Print button */}
          <button
            type="button"
            onClick={onPrint}
            title="Print Report"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
