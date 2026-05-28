"use client";

import { useState, useEffect } from "react";
import { supabase, TABLES } from "../../lib/supabase";

interface Ticket {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  topic: string;
  description: string;
  attachment_url?: string;
  request_callback: boolean;
  status: "open" | "closed";
  created_at: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("open");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch all support tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setTickets(data);
      }
    } catch (err) {
      console.warn("Supabase fetch failed in Admin panel, reading localStorage fallback:", err);
      const local = localStorage.getItem("glvia_support_tickets");
      if (local) {
        setTickets(JSON.parse(local));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Update support ticket status
  const handleUpdateStatus = async (ticketId: string, newStatus: "open" | "closed") => {
    setUpdatingId(ticketId);
    try {
      // 1. Update Supabase
      const { error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", ticketId);

      if (error) throw error;

      // 2. Update local state
      setTickets(prev => 
        prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
      );

      // 3. Update localStorage backup
      const local = localStorage.getItem("glvia_support_tickets");
      if (local) {
        const parsed: Ticket[] = JSON.parse(local);
        const updated = parsed.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
        localStorage.setItem("glvia_support_tickets", JSON.stringify(updated));
      }

      alert(`Ticket successfully ${newStatus === "closed" ? "marked as Resolved!" : "re-opened!"}`);
    } catch (err: any) {
      console.warn("Database status update failed, fallback to local state change:", err);
      // Fallback local update
      setTickets(prev => 
        prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
      );
      const local = localStorage.getItem("glvia_support_tickets");
      if (local) {
        const parsed: Ticket[] = JSON.parse(local);
        const updated = parsed.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
        localStorage.setItem("glvia_support_tickets", JSON.stringify(updated));
      }
      alert(`Local ticket status updated to ${newStatus}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter & Search Tickets logic
  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === "all" || t.status === filter;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      t.customer_name?.toLowerCase().includes(searchLower) ||
      t.customer_email?.toLowerCase().includes(searchLower) ||
      t.topic.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics counters
  const totalQueries = tickets.length;
  const openQueries = tickets.filter(t => t.status === "open").length;
  const closedQueries = tickets.filter(t => t.status === "closed").length;
  const callbackPending = tickets.filter(t => t.request_callback && t.status === "open").length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Support Tickets</h1>
        <p className="text-sm text-text-secondary mt-1">
          Review, manage, and resolve customer queries and callbacks in real-time
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Queries Raised", value: totalQueries, icon: "confirmation_number", color: "text-blue-500 bg-blue-50" },
          { label: "Open Tickets", value: openQueries, icon: "pending_actions", color: "text-amber-500 bg-amber-50" },
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

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status segment filters */}
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

        {/* Keyword Search Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by customer, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 text-slate-700"
          />
        </div>
      </div>

      {/* Tickets Table / Feed Panel */}
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
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4">Category / Topic</th>
                  <th className="px-6 py-4 max-w-xs">Description</th>
                  <th className="px-6 py-4">Callback</th>
                  <th className="px-6 py-4">Attachment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* Customer info */}
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900">{t.customer_name || "Anonymous"}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.customer_email}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-bold">
                        {new Date(t.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </td>

                    {/* Topic */}
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-bold">
                        {t.topic}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                        {t.description}
                      </p>
                    </td>

                    {/* Callback indicator badge */}
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

                    {/* Attachment Mock file info */}
                    <td className="px-6 py-4">
                      {t.attachment_url ? (
                        <div className="flex items-center gap-1.5 text-sky-600 font-bold hover:underline cursor-pointer">
                          <span className="material-icons-round text-[14px]">attachment</span>
                          <span className="truncate max-w-[120px] inline-block">{t.attachment_url}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-normal">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-[9px] ${
                        t.status === "open" ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    {/* Resolve actions */}
                    <td className="px-6 py-4 text-center">
                      {updatingId === t.id ? (
                        <div className="w-5 h-5 border-2 border-slate-200 border-t-pink-500 rounded-full animate-spin mx-auto" />
                      ) : t.status === "open" ? (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "closed")}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1 mx-auto"
                        >
                          <span className="material-icons-round text-[14px]">done</span>
                          Resolve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "open")}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-transform active:scale-95 flex items-center gap-1 mx-auto"
                        >
                          <span className="material-icons-round text-[14px]">undo</span>
                          Re-open
                        </button>
                      )}
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

    </div>
  );
}
