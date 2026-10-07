"use client";

import React from "react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Wallet, 
  Banknote, 
  Users, 
  Zap, 
  Headphones, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Landmark,
  Database,
  UserCog
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  pendingDepositsCount?: number;
  pendingWithdrawalsCount?: number;
  userRole?: string;
}

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  pendingDepositsCount = 0,
  pendingWithdrawalsCount = 0,
  userRole,
}: AdminSidebarProps) {
  const isSuper = userRole === "SUPER_ADMIN" || userRole === "SUPER_ROOT_ADMIN";
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "deposits", label: "Deposit Management", icon: Wallet, badge: pendingDepositsCount > 0 ? pendingDepositsCount : null, badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/40" },
    { id: "withdrawals", label: "Withdrawal Management", icon: Banknote, badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : null, badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
    { id: "admin-income", label: "Admin Fee Income", icon: Landmark, badge: "10%", badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
    { id: "users", label: "User Management", icon: Users },
    { id: "tickets", label: "Support Tickets", icon: Headphones },
    { id: "config", label: "System Config", icon: Settings },
    { id: "backup", label: "Database Backup", icon: Database },
    { id: "profile", label: "Admin Profile", icon: UserCog },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      window.location.href = "/adminlogin";
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
        className={`fixed top-0 left-0 bottom-0 z-50 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } shadow-lg`}
      >
        {/* Brand Header */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10 overflow-hidden">
            <div className="relative w-9 h-9 rounded-2xl overflow-hidden bg-primary/20 border border-primary/40 p-0.5 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center overflow-hidden">
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

            <div className={`flex flex-col transition-opacity duration-200 ${
              isCollapsed ? "lg:hidden" : "block"
            }`}>
              <div className="font-bold text-sm tracking-wider text-foreground uppercase whitespace-nowrap leading-none">
                CRYPTO FINANCE
              </div>
              <div className="text-[9px] font-bold tracking-widest text-primary uppercase mt-1 whitespace-nowrap flex items-center gap-1 leading-none">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                ADMIN CONSOLE
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Super Root Admin Floating Badge */}
        {isSuper && (
          <div className={`px-3 pt-3 ${isCollapsed ? "lg:hidden" : "block"}`}>
            <div className="w-full py-1.5 px-3 bg-primary/10 border border-primary/30 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              SUPER ROOT PRIVILEGES
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
                } py-2.5 rounded-xl font-semibold text-xs transition-all text-left ${
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? "gap-0" : "gap-3"}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  <span className={isCollapsed ? "lg:hidden" : "inline"}>
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span className={`${isCollapsed ? "lg:hidden" : "inline"} px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    isActive 
                      ? "bg-black/20 text-primary-foreground border-black/30" 
                      : item.badgeColor || "bg-primary/20 text-primary border-primary/30"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border bg-card flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all font-semibold text-xs ${
              isCollapsed ? "lg:hidden" : "flex-1"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
