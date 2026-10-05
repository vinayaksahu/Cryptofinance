"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Gauge,
  Briefcase,
  Users,
  Banknote,
  BarChart3,
  Headphones,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  Layers,
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

  const getNavItemClass = (isActive: boolean) => {
    return `w-full flex items-center ${
      isCollapsed ? "lg:justify-center lg:px-2" : "gap-3.5 px-3.5"
    } py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
      isActive
        ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;
  };

  const getSubItemClass = (isActive: boolean) => {
    return `w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
      isActive
        ? "text-primary bg-primary/10 border-l-2 border-primary font-bold"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SuperWarrior30 Style Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } shadow-sm`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-500/40 bg-black p-0.5 shadow-sm shrink-0 flex items-center justify-center">
              <Image
                src="/crypto_coin_hero.png"
                alt="Crypto Finance Logo"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <div className={`flex flex-col leading-none ${isCollapsed ? "lg:hidden" : "block"}`}>
              <span className="text-sm font-black tracking-tight text-foreground uppercase whitespace-nowrap">
                CRYPTO <span className="text-amber-500 dark:text-amber-400">FINANCE</span>
              </span>
              <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest whitespace-nowrap mt-0.5">
                QUANTITATIVE PROTOCOL
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1.5">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => handleSelectTab("dashboard")}
            title={isCollapsed ? "Dashboard" : undefined}
            className={getNavItemClass(activeTab === "dashboard")}
          >
            <Gauge className={`w-4 h-4 shrink-0 ${activeTab === "dashboard" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Dashboard</span>
          </button>

          {/* Recharge */}
          <button
            type="button"
            onClick={() => handleSelectTab("recharge")}
            title={isCollapsed ? "Deposit USDT" : undefined}
            className={getNavItemClass(activeTab === "recharge")}
          >
            <Briefcase className={`w-4 h-4 shrink-0 ${activeTab === "recharge" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Deposit USDT</span>
          </button>

          {/* Activate Stake */}
          <button
            type="button"
            onClick={() => handleSelectTab("stake-activate")}
            title={isCollapsed ? "Activate Stake" : undefined}
            className={getNavItemClass(
              activeTab === "stake-activate" || activeTab === "package-base" || activeTab === "package-fd"
            )}
          >
            <Zap className={`w-4 h-4 shrink-0 ${
              activeTab === "stake-activate" || activeTab === "package-base" || activeTab === "package-fd"
                ? "text-primary-foreground"
                : "text-muted-foreground"
            }`} />
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
              } py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
                activeTab.startsWith("wallet")
                  ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Layers className={`w-4 h-4 shrink-0 ${activeTab.startsWith("wallet") ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Wallet System</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.wallets ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
            {openMenus.wallets && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-9 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("wallets-internal")}
                  className={getSubItemClass(activeTab === "wallets-internal" || activeTab === "wallets")}
                >
                  • Internal Wallet Transfer
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("wallets-external")}
                  className={getSubItemClass(activeTab === "wallets-external")}
                >
                  • External Wallet Transfer
                </button>
              </div>
            )}
          </div>

          {/* Downline Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleMenu("downline")}
              title={isCollapsed ? "Downline Team" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
              } py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
                activeTab.startsWith("downline-")
                  ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Users className={`w-4 h-4 shrink-0 ${activeTab.startsWith("downline-") ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Downline Team</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.downline ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
            {openMenus.downline && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-9 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("downline-direct")}
                  className={getSubItemClass(activeTab === "downline-direct")}
                >
                  • Direct Referral List
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("downline-team")}
                  className={getSubItemClass(activeTab === "downline-team")}
                >
                  • 10-Level Team View
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("downline-tree")}
                  className={getSubItemClass(activeTab === "downline-tree")}
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
              } py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
                activeTab.startsWith("income-")
                  ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Banknote className={`w-4 h-4 shrink-0 ${activeTab.startsWith("income-") ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Income Streams</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.income ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
            {openMenus.income && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-9 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-bonus")}
                  className={getSubItemClass(activeTab === "income-bonus")}
                >
                  • $50 Joining Bonus
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-roi")}
                  className={getSubItemClass(activeTab === "income-roi")}
                >
                  • Daily ROI Income
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-referral")}
                  className={getSubItemClass(activeTab === "income-referral")}
                >
                  • Direct Referral Bonus
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-level")}
                  className={getSubItemClass(activeTab === "income-level")}
                >
                  • 10-Level Daily Royalty
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("income-rewards")}
                  className={getSubItemClass(activeTab === "income-rewards")}
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
              } py-2.5 rounded-xl font-semibold text-xs transition-all text-left cursor-pointer ${
                activeTab.startsWith("report-")
                  ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab.startsWith("report-") ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span className={isCollapsed ? "lg:hidden" : "inline"}>Audit Reports</span>
              </div>
              <span className={isCollapsed ? "lg:hidden" : "inline"}>
                {openMenus.reports ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
            {openMenus.reports && (
              <div className={`${isCollapsed ? "lg:hidden" : "block"} pl-9 pr-2 py-1 space-y-1`}>
                <button
                  type="button"
                  onClick={() => handleSelectTab("report-daily")}
                  className={getSubItemClass(activeTab === "report-daily")}
                >
                  • Daily Ledger
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab("report-statement")}
                  className={getSubItemClass(activeTab === "report-statement")}
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
            className={getNavItemClass(activeTab === "support")}
          >
            <Headphones className={`w-4 h-4 shrink-0 ${activeTab === "support" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            <span className={isCollapsed ? "lg:hidden" : "inline"}>Support Desk</span>
          </button>
        </div>

        {/* Sidebar Footer: Sign Out & Collapse Button */}
        <div className="p-3 border-t border-border bg-card flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all font-semibold text-xs cursor-pointer ${
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
              className="hidden lg:flex p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition shrink-0 cursor-pointer"
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
