"use client";

import React, { useState, useEffect } from "react";
import { 
  LogOut, 
  Crown, 
  ArrowRight, 
  PanelLeftClose, 
  PanelLeft, 
  ShieldCheck, 
  ChevronDown, 
  User, 
  Key, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Send, 
  Loader2, 
  ShieldAlert,
  Tag
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface AdminTopNavbarProps {
  user: any;
  onToggleSidebar: () => void;
  isCollapsed?: boolean;
  onRefresh?: () => void;
}

export function AdminTopNavbar({ user, onToggleSidebar, isCollapsed = false, onRefresh }: AdminTopNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"profile" | "password" | null>(null);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.fullName || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpMsg, setOtpMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || "");
      setProfileEmail(user.email || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#admin-profile-menu-container")) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      window.location.href = "/adminlogin";
    }
  };

  const handleSendOtp = async () => {
    if (otpCooldown > 0 || otpSending) return;

    setOtpSending(true);
    setOtpMsg(null);

    try {
      const res = await fetch("/api/admin/profile/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");

      setOtpMsg({ text: data.message || `OTP code sent to your registered email ${user?.email}!` });
      setOtpCooldown(60);
    } catch (err: any) {
      setOtpMsg({ text: err.message, error: true });
    } finally {
      setOtpSending(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!otp.trim()) {
      setProfileMsg({
        text: "Security verification required. Please click 'Send OTP' and enter the 6-digit code received on your email.",
        error: true,
      });
      return;
    }

    setProfileLoading(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profileName,
          email: profileEmail,
          phone: profilePhone,
          otp: otp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setProfileMsg({ text: data.message || "Profile updated successfully with OTP verification!" });
      setOtp("");
      setOtpMsg(null);
      onRefresh?.();
      setTimeout(() => {
        setActiveModal(null);
        setProfileMsg(null);
      }, 1200);
    } catch (err: any) {
      setProfileMsg({ text: err.message, error: true });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: "New password and confirmation do not match", error: true });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ text: "New password must be at least 6 characters", error: true });
      return;
    }
    setPwdLoading(true);
    setPwdMsg(null);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPwdMsg({ text: data.message || "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setActiveModal(null);
        setPwdMsg(null);
      }, 1200);
    } catch (err: any) {
      setPwdMsg({ text: err.message, error: true });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white/80 dark:bg-[#090e1a]/80 backdrop-blur-2xl px-4 sm:px-6 border-b border-slate-200/80 dark:border-white/10 transition-colors duration-200 shadow-sm dark:shadow-none">
        {/* Left: Sidebar Toggle & Console Badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Side Panel"
          >
            {isCollapsed ? (
              <PanelLeft className="h-5 w-5 text-sky-500 dark:text-sky-400" />
            ) : (
              <PanelLeftClose className="h-5 w-5 text-sky-500 dark:text-sky-400" />
            )}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 border border-sky-500/25 rounded-2xl">
            <Crown className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
            <span className="text-xs font-bold text-sky-600 dark:text-sky-300 tracking-wide uppercase whitespace-nowrap">
              Admin Console
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold border-l border-slate-200 dark:border-white/10 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              BEP-20 LIVE
            </span>
          </div>
        </div>

        {/* Right: Controls, Member View, User, Theme & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle variant="compact" dropdownAlign="right" />

          <Link 
            href="/member"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white/80 dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-full transition-all border border-slate-200 dark:border-white/15 whitespace-nowrap"
          >
            Member View
            <ArrowRight className="h-3 w-3 text-sky-500 dark:text-sky-400" />
          </Link>
          
          {/* Admin Profile Dropdown Menu */}
          <div className="relative" id="admin-profile-menu-container">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/15 backdrop-blur-xl transition-all cursor-pointer shadow-sm"
              title="Admin Profile Menu"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm text-white font-black text-xs">
                {(user?.fullName || "A")[0]}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white hidden md:inline truncate max-w-[140px]">
                {user?.fullName || user?.name || "Admin"}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 font-black border border-sky-500/30 uppercase">
                {user?.role === "SUPER_ADMIN" ? "SUPER" : "ADMIN"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-card-elevated p-2 text-slate-700 dark:text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-xl">
                <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10">
                  <p className="text-xs font-bold text-slate-900 dark:text-white tracking-wide font-mono flex items-center justify-between">
                    <span>ID: {user?.customId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/40">
                      {user?.role || "ADMIN"}
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                    {user?.fullName}
                  </p>
                  {user?.teamPrefix && (
                    <p className="text-[10px] text-sky-600 dark:text-sky-400 font-mono mt-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                      Branch Prefix: CF{user.teamPrefix}xxxxx
                    </p>
                  )}
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setProfileMsg(null);
                      setOtpMsg(null);
                      setActiveModal("profile");
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                    <span>Edit Admin Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setPwdMsg(null);
                      setActiveModal("password");
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span>Change Password</span>
                  </button>
                </div>

                <div className="border-t border-slate-200 dark:border-white/10 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={handleLogout}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* MODAL 1: EDIT ADMIN PROFILE */}
      {activeModal === "profile" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-md glass-card-elevated p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Admin Profile</h3>
                <p className="text-xs text-slate-400">Update admin details with security verification</p>
              </div>
            </div>

            {profileMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2 ${
                  profileMsg.error
                    ? "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                    : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {profileMsg.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                )}
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono uppercase">Admin ID</label>
                <input
                  type="text"
                  value={user?.customId || ""}
                  disabled
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-slate-400 font-mono opacity-80 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-white placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address <span className="text-sky-400">*</span>
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="admin@cryptofinance.online"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone / Contact Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. +971 50 123 4567"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono"
                />
              </div>

              {/* Security OTP Verification */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25 space-y-2.5 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-bold text-sky-300 uppercase tracking-wider font-mono text-[10px]">
                      Email OTP Verification
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Required</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Verification OTP will be sent to registered email: <strong className="text-sky-400 font-mono">{user?.email}</strong>
                </p>

                {otpMsg && (
                  <div
                    className={`p-2 rounded-xl text-[11px] flex items-center gap-1.5 ${
                      otpMsg.error
                        ? "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                        : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {otpMsg.error ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{otpMsg.text}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit OTP"
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-white text-xs font-mono font-bold tracking-widest text-center"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || otpCooldown > 0}
                    className="px-3.5 py-2 rounded-xl crypto-btn font-bold text-xs transition disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    {otpSending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : otpCooldown > 0 ? (
                      <span>Resend ({otpCooldown}s)</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 py-2.5 rounded-2xl glass-btn-secondary font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-1/2 py-2.5 rounded-2xl crypto-btn font-bold text-xs transition disabled:opacity-50"
                >
                  {profileLoading ? "Verifying..." : "Verify & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE ADMIN PASSWORD */}
      {activeModal === "password" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-md glass-card-elevated p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <p className="text-xs text-slate-400">Update admin security credentials</p>
              </div>
            </div>

            {pwdMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2 ${
                  pwdMsg.error
                    ? "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                    : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {pwdMsg.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                )}
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Password <span className="text-sky-400">*</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password <span className="text-sky-400">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm New Password <span className="text-sky-400">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 py-2.5 rounded-2xl glass-btn-secondary font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-1/2 py-2.5 rounded-2xl crypto-btn font-bold text-xs transition disabled:opacity-50"
                >
                  {pwdLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
