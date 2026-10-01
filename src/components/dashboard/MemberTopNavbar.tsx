"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  User,
  Key,
  Wallet,
  X,
  CheckCircle,
  AlertCircle,
  Lock,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface MemberTopNavbarProps {
  user: any;
  onToggleSidebar: () => void;
  isCollapsed?: boolean;
  onRefresh?: () => void;
}

export function MemberTopNavbar({
  user,
  onToggleSidebar,
  isCollapsed = false,
  onRefresh,
}: MemberTopNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"profile" | "password" | "wallet" | null>(null);

  // Edit Profile Form State
  const [profileName, setProfileName] = useState(user.fullName || "");
  const [profilePhone, setProfilePhone] = useState(user.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Wallet Address Form State
  const [walletAddress, setWalletAddress] = useState(user.usdtAddress || "");
  const [walletOtp, setWalletOtp] = useState("");
  const [walletOtpSent, setWalletOtpSent] = useState(false);
  const [walletOtpSending, setWalletOtpSending] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletMsg, setWalletMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const handleSendWalletOtp = async () => {
    setWalletOtpSending(true);
    setWalletMsg(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, purpose: "TRANSACTION" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setWalletOtpSent(true);
      setWalletMsg({ text: `Security OTP sent to ${user.email}. Check inbox/spam.` });
    } catch (err: any) {
      setWalletMsg({ text: err.message, error: true });
    } finally {
      setWalletOtpSending(false);
    }
  };

  useEffect(() => {
    setProfileName(user.fullName || "");
    setProfilePhone(user.phone || "");
    setWalletAddress(user.usdtAddress || "");
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#user-profile-menu-container")) {
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
      window.location.href = "/login";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: profileName, phone: profilePhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setProfileMsg({ text: "Profile updated successfully!" });
      onRefresh?.();
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
    setPwdLoading(true);
    setPwdMsg(null);
    try {
      const res = await fetch("/api/member/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPwdMsg({ text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdMsg({ text: err.message, error: true });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletLoading(true);
    setWalletMsg(null);
    try {
      const res = await fetch("/api/member/wallet-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usdtAddress: walletAddress,
          otp: walletOtp.trim(),
          transactionPin: walletOtp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update wallet address");
      setWalletMsg({ text: "USDT BEP-20 address updated successfully!" });
      setWalletOtp("");
      onRefresh?.();
    } catch (err: any) {
      setWalletMsg({ text: err.message, error: true });
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white/80 dark:bg-[#090e1a]/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200 shadow-sm dark:shadow-none">
        {/* Left: Sidebar Slide/Collapse Toggle & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Side Panel"
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            )}
          </button>

          <ThemeToggle variant="compact" dropdownAlign="left" />
        </div>

        {/* Right: Glass Capsule Profile Pill */}
        <div className="relative" id="user-profile-menu-container">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/15 backdrop-blur-xl transition-all text-left shadow-sm cursor-pointer"
          >
            {/* Sleek Modern Monogram Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
              {(user.fullName || "M")[0]}
            </div>

            {/* Full Name & UID Pill */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {user.fullName || "Member"}
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-medium">
                {user.customId}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Frosted Glass Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-card-elevated p-2 text-slate-700 dark:text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-xl">
              {/* Header: UID & Level */}
              <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10">
                <p className="text-xs font-bold text-slate-900 dark:text-white tracking-wide font-mono">
                  UID: {user.customId}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {user.status === "ACTIVE" ? "Active Account" : "Pending Activation"}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setProfileMsg(null);
                    setActiveModal("profile");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                  <span>Edit Profile</span>
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

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setWalletMsg(null);
                    setActiveModal("wallet");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>BEP-20 Wallet Address</span>
                </button>
              </div>

              {/* Sign out */}
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
      </header>

      {/* MODAL 1: EDIT PROFILE */}
      {activeModal === "profile" && (
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
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Update your protocol account details</p>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">User ID</label>
                <input
                  type="text"
                  value={user.customId}
                  disabled
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-slate-500 dark:text-slate-400 font-mono opacity-80 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-slate-500 dark:text-slate-400 opacity-80 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. +971 50 123 4567"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
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
                  disabled={profileLoading}
                  className="w-1/2 py-2.5 rounded-2xl crypto-btn font-bold text-xs transition disabled:opacity-50"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE PASSWORD */}
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Update your account authentication credentials</p>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  minLength={6}
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono"
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

      {/* MODAL 3: WALLET ADDRESS */}
      {activeModal === "wallet" && (
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
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">USDT BEP-20 Wallet</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Set or change your withdrawal destination address</p>
              </div>
            </div>

            {walletMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2 ${
                  walletMsg.error
                    ? "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                    : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {walletMsg.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                )}
                {walletMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateWallet} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xs">
                <span className="text-slate-600 dark:text-slate-400 block mb-1">Current Receiving Address:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 break-all select-all font-semibold">
                  {user.usdtAddress || "No wallet address linked yet"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  USDT BEP-20 Receiving Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x... USDT BEP-20 Wallet Address"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Security Code (Email OTP)
                  </label>
                  <button
                    type="button"
                    onClick={handleSendWalletOtp}
                    disabled={walletOtpSending}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 underline disabled:opacity-50"
                  >
                    {walletOtpSending ? "Sending OTP..." : walletOtpSent ? "Resend OTP" : "Request OTP"}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={walletOtp}
                  onChange={(e) => setWalletOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP code"
                  className="w-full glass-input px-3.5 py-2.5 text-sm text-sky-300 placeholder-slate-500 font-mono text-center tracking-widest font-bold"
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
                  disabled={walletLoading}
                  className="w-1/2 py-2.5 rounded-2xl glass-btn-emerald font-bold text-xs transition disabled:opacity-50"
                >
                  {walletLoading ? "Updating..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
