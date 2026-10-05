"use client";

import React, { useState } from "react";
import { Headphones, MessageCircle, Send, Mail, Check } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function SupportTicketView() {
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubject("");
      setMsg("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Support Ticket
        </h1>
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <span>Helpdesk</span>
          <span>/</span>
          <span className="text-foreground font-semibold">Support Ticket</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-2">Create New Support Ticket</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Our 24/7 VIP Support Desk resolves all queries in priority.
          </p>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-emerald-500">Ticket Submitted Successfully!</h3>
              <p className="text-xs text-muted-foreground">Our customer support manager will respond shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Deposit confirmation inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or question in detail..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-sm transition-all"
              >
                Submit Ticket
              </button>
            </form>
          )}
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Instant Channels</h3>
            <div className="space-y-3">
              <a
                href="https://chat.whatsapp.com/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">WhatsApp VIP Community</p>
                  <p className="text-[11px] text-muted-foreground">Instant leader broadcasts</p>
                </div>
              </a>

              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Send className="w-5 h-5 ml-0.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Telegram Official Channel</p>
                  <p className="text-[11px] text-muted-foreground">Daily news & payouts</p>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/40 text-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Official Support Email</p>
                  <p className="text-[11px] text-muted-foreground">{APP_CONFIG.officialEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
