"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Gauge,
  Briefcase,
  Package,
  Users,
  Banknote,
  BarChart3,
  Headphones,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  ShieldAlert,
  Sparkles,
  Zap,
  Layers,
  Wallet,
} from "lucide-react";

interface MemberSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  userRole?: string;
}

export function MemberSidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isCollapsed = false,
  setIsCollapsed,
  userRole,
}: MemberSidebarProps) {
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    wallets: false,
    downline: false,
    income: false,
    reports: false,
  });

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    const parentKey = tab.startsWith("wallet")
      ? "wallets"
      : tab.startsWith("downline-")
      ? "downline"
      : tab.startsWith("income-")
      ? "income"
      : tab.startsWith("report-")
      ? "reports"
      : null;
    setOpenMenus({
      wallets: parentKey === "wallets",
      downline: parentKey === "downline",
      income: parentKey === "income",
      reports: parentKey === "reports",
    });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Frosted Glass Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white/85 dark:bg-[#090e1a]/85 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } shadow-[0_20px_50px_rgba(2,132,199,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-2xl overflow-hidden bg-gradient-to-br from-sky-400 to-indigo-600 p-0.5 shadow-md shadow-sky-500/20 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <Image
                  src="/crypto_coin_hero.png"
                  alt="Crypto Finance Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className={`flex flex-col ${isCollapsed ? "lg:hidden" : "block"}`}>
              <span className="text-slate-900 dark:text-white font-bold tracking-wider text-sm uppercase leading-tight whitespace-nowrap">
                CRYPTO FINANCE
              </span>
              <span className="text-[9px] text-sky-600 dark:text-sky-400 font-bold tracking-widest uppercase whitespace-nowrap font-mono">
                QUANTITATIVE PROTOCOL
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => handleSelectTab("dashboard")}
            title={isCollapsed ? "Dashboard" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "gap-3.5 px-3.5"
            } py-2.5 rounded-2xl font-semibold text-xs transition-all text-left ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-transparent text-white border border-sky-400/40 shadow-lg shadow-sky-500/15"
                : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Gauge className="w-4 h-4 text-sky-400 shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Dashboard</span>
          </button>

          {/* Recharge */}
          <button
            type="button"
            onClick={() => handleSelectTab("recharge")}
            title={isCollapsed ? "Deposit USDT" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "gap-3.5 px-3.5"
            } py-2.5 rounded-2xl font-semibold text-xs transition-all text-left ${
              activeTab === "recharge"
                ? "bg-gradient-to-r from-emerald-500/25 via-emerald-500/10 to-transparent text-white border border-emerald-400/40 shadow-lg shadow-emerald-500/15"
                : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Deposit USDT</span>
          </button>

          {/* Activate Stake (Single Unified Entry Point) */}
          <button
            type="button"
            onClick={() => handleSelectTab("stake-activate")}
            title={isCollapsed ? "Activate Stake" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "gap-3.5 px-3.5"
            } py-2.5 rounded-2xl font-semibold text-xs transition-all text-left ${
              activeTab === "stake-activate" || activeTab === "package-base" || activeTab === "package-fd"
                ? "bg-gradient-to-r from-[#00FFA3]/25 via-[#00FFA3]/10 to-transparent text-white border border-[#00FFA3]/40 shadow-lg shadow-[#00FFA3]/15"
                : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Zap className="w-4 h-4 text-[#00FFA3] shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Activate Stake</span>
          </button>

          {/* Dedicated Wallet System Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("wallets")}
              title={isCollapsed ? "Wallet System" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-2xl font-semibold text-xs transition-all text-left ${
                activeTab.startsWith("wallet")
                  ? "bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-transparent text-white border border-sky-400/40 shadow-lg shadow-sky-500/15"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Wallet System</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.wallets ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </span>
            </button>
            {openMenus.wallets && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-10 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("wallets-internal")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "wallets-internal" || activeTab === "wallets"
                      ? "text-[#00FFA3] bg-[#00FFA3]/20 border-l-2 border-[#00FFA3]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • Internal Wallet Transfer Engine
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("wallets-external")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "wallets-external"
                      ? "text-purple-300 bg-purple-500/20 border-l-2 border-purple-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • External Wallet Transfer Engine
                </button>
              </div>
            )}
          </div>

          {/* Downline Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("downline")}
              title={isCollapsed ? "Downline & Team" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-2xl font-semibold text-xs transition-all text-left ${
                activeTab.startsWith("downline-")
                  ? "bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-transparent text-white border border-sky-400/40 shadow-lg shadow-sky-500/15"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Downline Team</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.downline ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </span>
            </button>
            {openMenus.downline && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-10 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("downline-direct")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "downline-direct"
                      ? "text-sky-300 bg-sky-500/20 border-l-2 border-sky-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • Direct Referral List
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("downline-team")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "downline-team"
                      ? "text-sky-300 bg-sky-500/20 border-l-2 border-sky-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • 10-Level Team View
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("downline-tree")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "downline-tree"
                      ? "text-sky-300 bg-sky-500/20 border-l-2 border-sky-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • Visual Tree Genealogy
                </button>
              </div>
            )}
          </div>

          {/* Income Streams Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("income")}
              title={isCollapsed ? "Income Streams" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-2xl font-semibold text-xs transition-all text-left ${
                activeTab.startsWith("income-")
                  ? "bg-gradient-to-r from-emerald-500/25 via-emerald-500/10 to-transparent text-white border border-emerald-400/40 shadow-lg shadow-emerald-500/15"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Income Streams</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.income ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </span>
            </button>
            {openMenus.income && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-10 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-bonus")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "income-bonus"
                      ? "text-emerald-300 bg-emerald-500/20 border-l-2 border-emerald-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • $50 Joining Bonus
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-roi")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "income-roi"
                      ? "text-emerald-300 bg-emerald-500/20 border-l-2 border-emerald-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • Daily ROI Income
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-referral")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "income-referral"
                      ? "text-emerald-300 bg-emerald-500/20 border-l-2 border-emerald-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • Direct Referral Bonus
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-level")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "income-level"
                      ? "text-emerald-300 bg-emerald-500/20 border-l-2 border-emerald-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • 10-Level Daily Royalty
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-rewards")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "income-rewards"
                      ? "text-purple-300 bg-purple-500/20 border-l-2 border-purple-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • Milestone Rewards
                </button>
              </div>
            )}
          </div>



          {/* Audit Reports Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("reports")}
              title={isCollapsed ? "Audit Reports" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-2xl font-semibold text-xs transition-all text-left ${
                activeTab.startsWith("report-")
                  ? "bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-transparent text-white border border-sky-400/40 shadow-lg shadow-sky-500/15"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BarChart3 className="w-4 h-4 text-sky-400 shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Audit Reports</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.reports ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </span>
            </button>
            {openMenus.reports && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-10 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("report-daily")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "report-daily"
                      ? "text-sky-300 bg-sky-500/20 border-l-2 border-sky-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • Daily Ledger
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("report-statement")}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "report-statement"
                      ? "text-sky-300 bg-sky-500/20 border-l-2 border-sky-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  • Complete Statement
                </button>
              </div>
            )}
          </div>

          {/* Support Ticket */}
          <button
            type="button"
            onClick={() => handleSelectTab("support")}
            title={isCollapsed ? "Support Desk" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "lg:justify-center lg:px-2" : "gap-3.5 px-3.5"
            } py-2.5 rounded-2xl font-semibold text-xs transition-all text-left ${
              activeTab === "support"
                ? "bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-transparent text-white border border-sky-400/40 shadow-lg shadow-sky-500/15"
                : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Headphones className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Support Desk</span>
          </button>
        </div>

        {/* Sidebar Footer: Sign Out & Collapse Button */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-semibold text-xs ${
              isCollapsed ? "lg:hidden" : "flex-1"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>

          {setIsCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition shrink-0"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
