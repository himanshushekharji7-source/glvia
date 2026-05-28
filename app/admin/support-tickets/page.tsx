"use client";

import { useState, useEffect } from "react";
import { supabase, TABLES } from "../../lib/supabase";

interface Ticket {
  id: string;
  ticket_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  topic: string;
  description: string;
  attachment_url?: string;
  request_callback: boolean;
  status: "open" | "closed";
  admin_reply?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("open");
  const [search, setSearch] = useState("");
  
  // Drawer Detail State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch all support tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error("Supabase admin fetch tickets failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Update Status from Drawer or Table
  const handleUpdateStatus = async (ticketId: string, newStatus: "open" | "closed") => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", ticketId);

      if (error) throw error;

      // Update state
      setTickets(prev => 
        prev.map(t => t.id === ticketId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t)
      );

      // Update drawer
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : null);
      }

      alert(`Ticket marked as ${newStatus === "closed" ? "Resolved!" : "Re-opened!"}`);
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Submit Admin Reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!replyText.trim()) {
      alert("Please enter a reply.");
      return;
    }

    setSubmittingReply(true);
    try {
      const { error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .update({ admin_reply: replyText, updated_at: new Date().toISOString() })
        .eq("id", selectedTicket.id);

      if (error) throw error;

      // Update state
      setTickets(prev => 
        prev.map(t => t.id === selectedTicket.id ? { ...t, admin_reply: replyText, updated_at: new Date().toISOString() } : t)
      );

      // Update drawer
      setSelectedTicket(prev => prev ? { ...prev, admin_reply: replyText, updated_at: new Date().toISOString() } : null);
      setReplyText("");
      alert("Reply sent successfully!");
    } catch (err) {
      console.error("Reply submission failed:", err);
      alert("Failed to send reply. Please try again.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Filter & Search
  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === "all" || t.status === filter;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      t.customer_name?.toLowerCase().includes(searchLower) ||
      t.customer_email?.toLowerCase().includes(searchLower) ||
      t.ticket_number?.toLowerCase().includes(searchLower) ||
      t.topic.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  // Stats Counters
  const totalQueries = tickets.length;
  const openQueries = tickets.filter(t => t.status === "open").length;
  const closedQueries = tickets.filter(t => t.status === "closed").length;
  const callbackPending = tickets.filter(t => t.request_callback && t.status === "open").length;

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Support Tickets</h1>
        <p className="text-sm text-text-secondary mt-1">
          Review, manage, and resolve customer queries and callbacks in real-time
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tickets", value: totalQueries, icon: "confirmation_number", color: "text-blue-500 bg-blue-50" },
          { label: "Open Queries", value: openQueries, icon: "pending_actions", color: "text-amber-500 bg-amber-50" },
          { label: "Resolved Queries", value: closedQueries, icon: "check_circle", color: "text-emerald-500 bg-emerald-50" },
          { label: "Callbacks Pending", value: callbackPending, icon: "phone_callback", color: "text-pink-500 bg-pink-50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <span className="material-icons-round text-2xl">{stat.icon}</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stat.value}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2">
          {[
            { id: "all", label: `All (${totalQueries})` },
            { id: "open", label: `Open Queries (${openQueries})` },
            { id: "closed", label: `Resolved (${closedQueries})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by customer, ticket #, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 text-slate-700 font-semibold"
          />
        </div>
      </div>

      {/* Table Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Ticket Number</th>
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4">Category / Topic</th>
                  <th className="px-6 py-4">Callback</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr 
                    key={t.id} 
                    onClick={() => {
                      setSelectedTicket(t);
                      setReplyText("");
                    }}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-black text-pink-600 font-mono">
                      {t.ticket_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900">{t.customer_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.customer_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-bold">
                        {t.topic}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.request_callback ? (
                        <span className="flex items-center gap-1 text-pink-600 font-black">
                          <span className="material-icons-round text-[16px]">phone_callback</span>
                          Callback
                        </span>
                      ) : (
                        <span className="text-slate-300 font-normal">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider text-[9px] ${
                        t.status === "open" ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setReplyText("");
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1 mx-auto"
                      >
                        <span className="material-icons-round text-[14px]">visibility</span>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-icons-round text-slate-200 text-6xl mb-3">confirmation_number</span>
            <h3 className="text-sm font-bold text-slate-500">No support tickets found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
              No matching tickets fit the current filter or search criteria.
            </p>
          </div>
        )}
      </div>

      {/* ─── PREMIUM TICKET DETAIL DRAWER OVERLAY (Right absolute slide-in) ─── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn" onClick={() => setSelectedTicket(null)} />
          
          {/* Drawer Frame */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between animate-slideLeft border-l border-slate-100 z-10 select-text">
            
            {/* Drawer Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between sticky top-0 z-20 shadow-md">
              <div>
                <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest block font-mono">Support Details</span>
                <h3 className="font-extrabold text-base leading-none mt-1 font-mono">{selectedTicket.ticket_number}</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-white"
              >
                <span className="material-icons-round text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Body details */}
            <div className="flex-1 p-6 space-y-6">
              
              {/* Customer details info block */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Customer Info</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Customer Name</span>
                    <span className="text-slate-800 font-extrabold text-[13px]">{selectedTicket.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Mobile Number</span>
                    <span className="text-slate-800 font-extrabold text-[13px]">{selectedTicket.customer_phone || "Not provided"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-bold block">Email Address</span>
                    <span className="text-slate-800 font-extrabold text-[13px] break-all">{selectedTicket.customer_email}</span>
                  </div>
                </div>
              </div>

              {/* Ticket details queries info block */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Query Details</h4>
                <div className="grid grid-cols-2 gap-4 text-xs mb-2">
                  <div>
                    <span className="text-slate-400 font-bold block">Topic Category</span>
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-black mt-1 inline-block">{selectedTicket.topic}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Ticket Status</span>
                    <span className={`px-2 py-0.5 rounded font-black uppercase tracking-wider text-[10px] mt-1 inline-block ${
                      selectedTicket.status === "open" ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Callback Request</span>
                    <span className={`font-black ${selectedTicket.request_callback ? 'text-pink-600' : 'text-slate-400'}`}>
                      {selectedTicket.request_callback ? "YES (Required Call)" : "NO"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Created Date</span>
                    <span className="text-slate-700 font-bold">
                      {new Date(selectedTicket.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2">
                  <span className="text-slate-400 text-[10px] font-black uppercase block tracking-wider mb-1.5">Query Description:</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Attachment Preview Card */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Attachment Preview</h4>
                {selectedTicket.attachment_url ? (
                  <div className="flex items-center gap-3 p-3 bg-sky-50/50 border border-sky-100 rounded-2xl">
                    <span className="material-icons-round text-sky-600 text-3xl shrink-0">attachment</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-slate-800 text-xs font-extrabold truncate block">{selectedTicket.attachment_url}</span>
                      <span className="text-[10px] text-sky-500 font-bold">Attachment Uploaded</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold italic">No files attached to this support query.</span>
                )}
              </div>

              {/* Active Admin Reply Box */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Reply History</h4>
                {selectedTicket.admin_reply ? (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-b border-emerald-100/50 pb-2">
                      <span className="text-emerald-700 font-black flex items-center gap-1">
                        <span className="material-icons-round text-[14px]">reply</span>
                        Admin Reply Sent
                      </span>
                      <span>
                        {new Date(selectedTicket.updated_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      {selectedTicket.admin_reply}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold italic">No reply has been submitted yet. Use the action block below.</span>
                )}
              </div>

            </div>

            {/* Action panel footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-5 space-y-4">
              
              {/* Submit Reply form */}
              <form onSubmit={handleSubmitReply} className="space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your support reply here..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-500 placeholder-slate-400 text-slate-800 transition-colors resize-none shadow-inner"
                />
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {submittingReply ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-icons-round text-[16px]">send</span>
                      Send Reply
                    </>
                  )}
                </button>
              </form>

              {/* Status Action Buttons: Reply, Close, Reopen */}
              <div className="flex gap-3">
                {selectedTicket.status === "open" ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, "closed")}
                    disabled={updatingStatus}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-icons-round text-[16px]">done</span>
                    Close Ticket
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, "open")}
                    disabled={updatingStatus}
                    className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-icons-round text-[16px]">undo</span>
                    Reopen Ticket
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
