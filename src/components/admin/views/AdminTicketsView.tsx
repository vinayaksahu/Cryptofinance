"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare, CheckCircle, XCircle, Search, Reply, ChevronDown, ChevronUp } from 'lucide-react';


interface AdminTicketsViewProps {}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    customId: string;
    fullName: string;
  };
}

export function AdminTicketsView({}: AdminTicketsViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'ANSWERED' | 'CLOSED'>('ALL');
  
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/tickets');
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      } else {
        alert(data.error || 'Failed to fetch tickets');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAction = async (ticketId: string, action: 'REPLY' | 'CLOSE', reply?: string) => {
    try {
      setProcessing(true);
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, action, reply }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setReplyModalOpen(false);
        fetchTickets();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const openReplyModal = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setReplyText(ticket.adminReply || '');
    setReplyModalOpen(true);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTickets = tickets.filter(t => activeTab === 'ALL' || t.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'ANSWERED': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'CLOSED': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Tickets' },
    { id: 'OPEN', label: 'Open' },
    { id: 'ANSWERED', label: 'Answered' },
    { id: 'CLOSED', label: 'Closed' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Support Tickets</h2>
        
        <div className="flex bg-muted p-1 rounded-xl border border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold w-12"></th>
                <th className="px-6 py-4 font-semibold">SR</th>
                <th className="px-6 py-4 font-semibold">Ticket ID</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground text-xs">Loading tickets...</p>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-xs font-medium">
                    No tickets found in this category.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => (
                  <React.Fragment key={ticket.id}>
                    <tr className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-4 text-center cursor-pointer" onClick={() => toggleRow(ticket.id)}>
                        {expandedRows[ticket.id] ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">{index + 1}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground" title={ticket.id}>
                        {ticket.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold">{ticket.user.fullName}</span>
                          <span className="text-xs text-primary font-mono">{ticket.user.customId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground max-w-[200px] truncate" title={ticket.subject}>
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {ticket.category}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ticket.status !== 'CLOSED' && (
                            <>
                              <button
                                onClick={() => openReplyModal(ticket)}
                                className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                                title="Reply"
                              >
                                <Reply className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(ticket.id, 'CLOSE')}
                                disabled={processing}
                                className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20"
                                title="Close Ticket"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRows[ticket.id] && (
                      <tr className="bg-muted/20">
                        <td colSpan={8} className="px-6 py-4 border-t border-border">
                          <div className="pl-8 space-y-4">
                            <div>
                              <span className="text-xs font-semibold text-muted-foreground uppercase">Message</span>
                              <p className="mt-1 text-sm text-foreground bg-background p-3.5 rounded-xl border border-border">
                                {ticket.message}
                              </p>
                            </div>
                            {ticket.adminReply && (
                              <div>
                                <span className="text-xs font-semibold text-primary uppercase">Admin Reply</span>
                                <p className="mt-1 text-sm text-foreground bg-primary/10 p-3.5 rounded-xl border border-primary/20">
                                  {ticket.adminReply}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {replyModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border text-card-foreground rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="text-lg font-bold text-foreground">Reply to Ticket</h3>
              <button 
                onClick={() => setReplyModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground uppercase font-semibold mb-1">User's Message</label>
                <div className="text-sm text-foreground p-3.5 bg-muted rounded-xl border border-border">
                  {activeTicket.message}
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-primary uppercase font-semibold mb-1">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  rows={5}
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
              <button
                onClick={() => setReplyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(activeTicket.id, 'REPLY', replyText)}
                disabled={processing || !replyText.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {processing && <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />}
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
