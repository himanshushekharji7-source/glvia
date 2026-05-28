"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, TABLES } from "../../lib/supabase";
import { useUser } from "../../lib/hooks";

interface Ticket {
  id: string;
  topic: string;
  description: string;
  attachment_url?: string;
  request_callback: boolean;
  status: "open" | "closed";
  created_at: string;
}

export default function SupportTicketsPage() {
  const router = useRouter();
  const { data: user } = useUser();
  
  // View states
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedTopic, setSelectedTopic] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [requestCallback, setRequestCallback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom bottom sheet selector state
  const [sheetOpen, setSheetOpen] = useState(false);

  const topics = [
    "Issue On Booking!",
    "Offers",
    "Salons",
    "Transaction & Refund",
    "Other"
  ];

  // Fetch tickets
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
      console.warn("Supabase fetch tickets failed, using localStorage backup:", err);
      const local = localStorage.getItem("glvia_support_tickets");
      if (local) {
        setTickets(JSON.parse(local));
      } else {
        // Seed default fallback tickets
        const defaultTickets: Ticket[] = [];
        setTickets(defaultTickets);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Handle support ticket creation
  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) {
      alert("Please choose a topic.");
      return;
    }
    if (!description.trim()) {
      alert("Please write a brief description of your query.");
      return;
    }

    setSubmitting(true);
    const newTicket = {
      id: crypto.randomUUID(),
      customer_id: user?.id || "anonymous_user",
      customer_name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "Anonymous",
      customer_email: user?.email || "anonymous@glvia.com",
      topic: selectedTopic,
      description: description,
      attachment_url: attachmentName || null,
      request_callback: requestCallback,
      status: "open" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from(TABLES.SUPPORT_TICKETS).insert(newTicket);
      if (error) throw error;
      
      // Update state and refresh
      setTickets(prev => [newTicket, ...prev]);
      
      // Sync local storage as backup
      const currentLocal = localStorage.getItem("glvia_support_tickets");
      const updated = currentLocal ? [newTicket, ...JSON.parse(currentLocal)] : [newTicket];
      localStorage.setItem("glvia_support_tickets", JSON.stringify(updated));

      // Reset Form
      setSelectedTopic("");
      setDescription("");
      setAttachment(null);
      setAttachmentName("");
      setRequestCallback(false);
      setIsAdding(false);
      
      alert("Support Ticket added successfully!");
    } catch (err: any) {
      console.warn("Could not insert ticket to DB, saving to local state fallback:", err);
      // Local Fallback
      setTickets(prev => [newTicket, ...prev]);
      const currentLocal = localStorage.getItem("glvia_support_tickets");
      const updated = currentLocal ? [newTicket, ...JSON.parse(currentLocal)] : [newTicket];
      localStorage.setItem("glvia_support_tickets", JSON.stringify(updated));

      // Reset Form
      setSelectedTopic("");
      setDescription("");
      setAttachment(null);
      setAttachmentName("");
      setRequestCallback(false);
      setIsAdding(false);

      alert("Support Ticket added locally!");
    } finally {
      setSubmitting(false);
    }
  };

  // Mock file selector click helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment(file);
      setAttachmentName(file.name);
    }
  };

  // Filter tickets by active tab
  const filteredTickets = tickets.filter(t => t.status === activeTab);

  if (isAdding) {
    // ─── ADD TICKET FORM VIEW (Screenshot 1 & 2) ───
    return (
      <div className="min-h-dvh bg-white flex flex-col justify-between text-slate-800 antialiased select-text">
        <div>
          {/* Header */}
          <header className="bg-white text-slate-900 px-4 py-4 flex items-center border-b border-slate-100 sticky top-0 z-50 shrink-0">
            <button 
              onClick={() => setIsAdding(false)} 
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all mr-2"
            >
              <span className="material-icons-round text-[28px] text-slate-900 font-medium">chevron_left</span>
            </button>
            <span className="font-extrabold text-[20px] tracking-tight text-slate-900">Add Ticket</span>
          </header>

          <form onSubmit={handleAddTicket} className="px-5 py-6 space-y-6 max-w-md mx-auto">
            {/* Topic dropdown selection */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-900">Choose a topic</label>
              <div 
                onClick={() => setSheetOpen(true)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
              >
                <span className={`text-[13px] font-semibold ${selectedTopic ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
                  {selectedTopic || "Select"}
                </span>
                <span className="material-icons-round text-slate-400 text-[20px]">unfold_more</span>
              </div>
            </div>

            {/* Query Description Area */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-900">Write a brief description of your query</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add text"
                rows={5}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold focus:outline-none focus:border-pink-500 placeholder-slate-400 text-slate-800 transition-colors resize-none"
              />
            </div>

            {/* File Upload Mock/Active Box */}
            <div className="space-y-2">
              <label className="relative block w-full">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-[13px] font-semibold text-slate-500 truncate max-w-[80%]">
                    {attachmentName || "Click here to upload file"}
                  </span>
                  <span className="material-icons-round text-slate-500 text-[20px]">upload</span>
                </div>
              </label>
            </div>

            {/* Request Callback Trigger */}
            <div className="flex items-center gap-3">
              <label className="relative flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={requestCallback}
                  onChange={(e) => setRequestCallback(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-6 h-6 border-2 border-slate-300 rounded-lg flex items-center justify-center peer-checked:border-pink-600 peer-checked:bg-pink-600 transition-colors">
                  {requestCallback && (
                    <span className="material-icons-round text-white text-[16px] font-bold">check</span>
                  )}
                </div>
                <span className="text-[13px] font-black text-slate-800 ml-3">Request A Call Back</span>
              </label>
            </div>

            {/* CTA add support ticket button */}
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Add Support Ticket"
              )}
            </button>
          </form>
        </div>

        {/* ─── CUSTOM BOTTOM SHEET DRAWER (Screenshot 2) ─── */}
        {sheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300" onClick={() => setSheetOpen(false)} />
            
            {/* Sheet Content Container */}
            <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-xl overflow-hidden animate-slideUp z-10 border-t border-slate-100">
              
              {/* Drag Handle indicator */}
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-3" />
              
              <div className="px-5 pb-5">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-2">
                  <span className="text-sm font-black text-slate-900">Choose a topic</span>
                  <button 
                    onClick={() => setSheetOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95"
                  >
                    <span className="material-icons-round text-[16px]">close</span>
                  </button>
                </div>
                
                {/* Topic list options */}
                <div className="divide-y divide-slate-50">
                  {topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(t);
                        setSheetOpen(false);
                      }}
                      className="w-full text-left py-3.5 text-slate-800 font-bold hover:bg-slate-50 active:bg-slate-100 text-[13px] transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ─── TICKET DASHBOARD VIEW (Screenshot 3) ───
  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col justify-between text-slate-800 antialiased select-text">
      
      <div>
        {/* Header with back chevron and Add ticket CTA pill */}
        <header className="bg-white text-slate-950 px-4 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-40 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => router.push("/profile")} 
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all mr-2"
            >
              <span className="material-icons-round text-[28px] text-slate-900 font-medium">chevron_left</span>
            </button>
            <span className="font-extrabold text-[20px] tracking-tight text-slate-900">Support Ticket</span>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 active:scale-95 text-xs font-bold text-slate-900 transition-all shadow-xs"
          >
            <span className="material-icons-round text-[16px] text-slate-800 font-black">add</span>
            Add Ticket
          </button>
        </header>

        {/* Segment Tabs with custom pink border indicator */}
        <div className="bg-white border-b border-slate-100 flex shadow-xs">
          <button
            onClick={() => setActiveTab("open")}
            className="flex-1 py-4 text-center text-xs font-black tracking-wide relative"
            style={{ color: activeTab === "open" ? "#ec4899" : "#64748b" }}
          >
            Open Queries ({tickets.filter(t => t.status === "open").length})
            {activeTab === "open" && (
              <div className="absolute bottom-0 left-4 right-4 h-1 bg-pink-500 rounded-t-full transition-all" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("closed")}
            className="flex-1 py-4 text-center text-xs font-black tracking-wide relative"
            style={{ color: activeTab === "closed" ? "#ec4899" : "#64748b" }}
          >
            Close Queries ({tickets.filter(t => t.status === "closed").length})
            {activeTab === "closed" && (
              <div className="absolute bottom-0 left-4 right-4 h-1 bg-pink-500 rounded-t-full transition-all" />
            )}
          </button>
        </div>

        {/* Queries Feed content */}
        <main className="px-5 py-6 max-w-md mx-auto space-y-4">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="space-y-4">
              {filteredTickets.map((t) => (
                <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(t.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      t.status === "open" ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[13px] font-black text-slate-900">
                      {t.topic}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      {t.description}
                    </p>
                  </div>

                  {/* Foot attributes: file attachment and callback requested status */}
                  {(t.attachment_url || t.request_callback) && (
                    <div className="flex flex-wrap gap-2 pt-2.5 border-t border-slate-50">
                      {t.attachment_url && (
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          <span className="material-icons-round text-[12px]">attachment</span>
                          {t.attachment_url}
                        </div>
                      )}
                      {t.request_callback && (
                        <div className="flex items-center gap-1 bg-pink-50 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          <span className="material-icons-round text-[12px]">phone_callback</span>
                          Callback Requested
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY QUERY STATE (Screenshot 3) */
            <div className="text-center py-28 flex flex-col items-center justify-center">
              <span className="material-icons-round text-slate-200 text-6xl mb-4 font-light">confirmation_number</span>
              <p className="text-[14px] text-slate-400 font-black">No data found</p>
            </div>
          )}

        </main>
      </div>

      {/* Footer copyright */}
      <footer className="w-full py-4 text-center text-[10px] text-slate-400 font-bold border-t border-slate-100 bg-white shrink-0">
        © 2026 GLVIA Support. All rights reserved.
      </footer>

    </div>
  );
}
