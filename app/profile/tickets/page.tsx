"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase, TABLES } from "../../lib/supabase";
import { useUser, useSupportTickets, useCreateSupportTicket } from "../../lib/hooks";
import axios from "axios";

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

export default function SupportTicketsPage() {
  const router = useRouter();
  const { data: user } = useUser();

  // Navigation tab: matching 'Open Queries' and 'Close Queries' exactly
  const [currentTab, setCurrentTab] = useState<"open" | "closed">("open");
  const [isAdding, setIsAdding] = useState(false);

  // TanStack React Query synchronization
  const ticketsQuery = useSupportTickets(user?.id);
  const createTicketMutation = useCreateSupportTicket();

  const tickets = ticketsQuery.data || [];
  const loadingTickets = ticketsQuery.isLoading;
  const dbError = ticketsQuery.isError;
  const fetchTickets = () => ticketsQuery.refetch();

  // Form states
  const [selectedTopic, setSelectedTopic] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [requestCallback, setRequestCallback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const topics = [
    "Issue On Booking!",
    "Offers",
    "Salons",
    "Transaction & Refund",
    "Other"
  ];

  // Submit Support Ticket Flow (Supabase first & atomic DB sequence)
  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || uploading) return;

    if (!selectedTopic) {
      alert("Please choose a topic.");
      return;
    }
    if (!description.trim()) {
      alert("Please write a brief description of your query.");
      return;
    }

    setSubmitting(true);
    let finalAttachmentUrl = null;

    if (selectedFile) {
      setUploading(true);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const folderPath = `support-tickets/${year}/${month}`;
        
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("folder", folderPath);

        const uploadRes = await axios.post("/api/media", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        if (uploadRes.data && uploadRes.data.success) {
          finalAttachmentUrl = uploadRes.data.file.url;
        } else {
          throw new Error("File manager upload failed");
        }
      } catch (err: any) {
        console.error("Physical uploader failure:", err);
        alert("Upload failed. Please check file properties and network connections.");
        setSubmitting(false);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Dynamic Client-side atomic ticket number sequence generator
    let ticketNumber = "";
    try {
      const { data: maxTicketData, error: maxErr } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .select("ticket_number")
        .order("ticket_number", { ascending: false })
        .limit(1);
      
      let nextSeqNum = 1;
      if (!maxErr && maxTicketData && maxTicketData.length > 0) {
        const maxNumStr = maxTicketData[0].ticket_number;
        if (maxNumStr && maxNumStr.startsWith("GLVIA-2026-")) {
          const lastSeq = parseInt(maxNumStr.replace("GLVIA-2026-", ""), 10);
          if (!isNaN(lastSeq)) {
            nextSeqNum = lastSeq + 1;
          }
        }
      }
      ticketNumber = `GLVIA-2026-${String(nextSeqNum).padStart(4, "0")}`;
    } catch (e) {
      console.error("Max ticket query failed, generating fallback:", e);
      ticketNumber = `GLVIA-2026-${Date.now().toString().slice(-4)}`;
    }

    const newTicket = {
      id: crypto.randomUUID(),
      ticket_number: ticketNumber,
      customer_id: user?.id || "anonymous",
      customer_name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Customer",
      customer_email: user?.email || "customer@glvia.com",
      customer_phone: user?.phone_number || "",
      topic: selectedTopic,
      description: description,
      attachment_url: finalAttachmentUrl,
      request_callback: requestCallback,
      status: "open" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await createTicketMutation.mutateAsync(newTicket);
      
      // Reset form states
      setSelectedTopic("");
      setDescription("");
      setAttachmentName("");
      setSelectedFile(null);
      setPreviewUrl("");
      setValidationError("");
      setRequestCallback(false);
      setIsAdding(false);
      setCurrentTab("open");
      
      alert("Support Ticket raised successfully! Our support agents will respond shortly.");
    } catch (err: any) {
      console.error("Failed to add support ticket in Supabase:", err);
      alert("Unable to submit support ticket. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Uploader file validations
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      
      if (!allowedExtensions.includes(ext) || !allowedMimes.includes(file.type.toLowerCase())) {
        setValidationError("Upload Rejected: File format is unsupported. Allowed formats: JPG, JPEG, PNG, PDF");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setValidationError("Upload Rejected: File size exceeds the 5MB maximum limit");
        return;
      }

      setSelectedFile(file);
      setAttachmentName(file.name);
      
      if (file.type.toLowerCase().startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl("");
      }
    }
  };

  const handleBack = () => {
    if (isAdding) {
      setIsAdding(false);
    } else {
      router.push("/profile");
    }
  };

  const activeQueries = tickets.filter(t => t.status === (currentTab === "open" ? "open" : "closed"));

  return (
    <div className="min-h-dvh bg-white flex flex-col justify-between text-slate-800 antialiased select-none">
      
      {/* ─── Premium Header (Strictly matching the mock screenshot) ─── */}
      <header className="bg-white text-slate-900 px-4 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleBack} 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
          >
            <span className="material-icons-round text-[28px] text-slate-900 font-medium">chevron_left</span>
          </button>
          <span className="font-extrabold text-[20px] tracking-tight text-slate-900">
            {isAdding ? "Add Ticket" : "Support Ticket"}
          </span>
        </div>
        
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.8 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-xl active:scale-95 text-xs font-black transition-all shadow-xs"
          >
            <span className="material-icons-round text-[16px] text-slate-900 font-black">add</span>
            Add Ticket
          </button>
        )}
      </header>

      {/* ─── Tabs Navigator (Matches open queries and close queries with solid pink line) ─── */}
      {!isAdding && (
        <div className="bg-white border-b border-slate-100 flex sticky top-[73px] z-30">
          <button
            onClick={() => setCurrentTab("open")}
            className="flex-1 py-4 text-center text-xs font-black tracking-wide relative transition-colors"
            style={{ color: currentTab === "open" ? "#ec4899" : "#64748b" }}
          >
            Open Queries ({tickets.filter(t => t.status === "open").length})
            {currentTab === "open" && (
              <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-pink-500 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setCurrentTab("closed")}
            className="flex-1 py-4 text-center text-xs font-black tracking-wide relative transition-colors"
            style={{ color: currentTab === "closed" ? "#ec4899" : "#64748b" }}
          >
            Close Queries ({tickets.filter(t => t.status === "closed").length})
            {currentTab === "closed" && (
              <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-pink-500 rounded-t-full" />
            )}
          </button>
        </div>
      )}

      {/* ─── Main Content Canvas ─── */}
      <main className="flex-1 overflow-y-auto px-5 py-6 max-w-md mx-auto w-full space-y-4">
        
        {/* CASE A: ADD TICKET VIEW (SPA Form) */}
        {isAdding && (
          <form onSubmit={handleAddTicket} className="space-y-6">
            
            {/* Topic dropdown trigger */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">Choose a topic</label>
              <div 
                onClick={() => setSheetOpen(true)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
              >
                <span className={`text-[13px] font-bold ${selectedTopic ? 'text-slate-800' : 'text-slate-400'}`}>
                  {selectedTopic || "Select"}
                </span>
                <span className="material-icons-round text-slate-400 text-[20px]">unfold_more</span>
              </div>
            </div>

            {/* Description Area */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">Write a brief description of your query</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add text"
                rows={5}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-semibold focus:outline-none focus:border-pink-500 placeholder-slate-400 text-slate-800 transition-colors resize-none"
              />
            </div>

            {/* File Selector & Interactive Preview Card */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">Attachment (Optional)</label>
              
              {validationError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-red-600 text-xs font-bold animate-fadeIn">
                  <span className="material-icons-round text-[18px] shrink-0 mt-0.5">error_outline</span>
                  <div>
                    <div className="font-extrabold text-[12px]">Validation Failed</div>
                    <div className="text-[10px] text-red-500 font-bold mt-0.5">{validationError}</div>
                  </div>
                </div>
              )}

              {!selectedFile ? (
                <label className="relative block w-full">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                  <div className="w-full px-4 py-4 bg-white border-2 border-slate-200 border-dashed rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-icons-round text-slate-400 text-3xl">upload_file</span>
                      <div className="text-left">
                        <span className="text-[13px] font-black text-slate-800 block">Click here to upload file</span>
                        <span className="text-[10px] text-slate-400 font-bold">Supports JPG, PNG, PDF up to 5MB</span>
                      </div>
                    </div>
                    <span className="material-icons-round text-slate-400 text-[20px]">upload</span>
                  </div>
                </label>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-3 relative shadow-sm animate-scaleIn">
                  {previewUrl ? (
                    <div className="relative w-full rounded-xl overflow-hidden border border-slate-100 max-h-[140px] flex items-center justify-center bg-slate-50">
                      <img src={previewUrl} alt="Preview" className="object-cover max-h-[140px] w-full" />
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {previewUrl ? (
                        <span className="material-icons-round text-pink-500 text-2xl shrink-0">image</span>
                      ) : (
                        <span className="material-icons-round text-sky-500 text-2xl shrink-0">picture_as_pdf</span>
                      )}
                      <div className="min-w-0">
                        <span className="text-[12px] font-extrabold text-slate-800 block truncate max-w-[200px]">{selectedFile.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {previewUrl ? "Image ready" : "PDF ready"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setAttachmentName("");
                        setPreviewUrl("");
                        setValidationError("");
                      }}
                      className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-all shrink-0"
                    >
                      <span className="material-icons-round text-sm font-bold">close</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {uploading && (
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
                <div className="w-5 h-5 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-black text-sky-800 block">Uploading attachment...</span>
                  <span className="text-[10px] text-sky-500 font-bold">Saving file securely to Hostinger file manager...</span>
                </div>
              </div>
            )}

            {/* Callback request */}
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

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={submitting || uploading}
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-md active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Add Support Ticket"
              )}
            </button>
          </form>
        )}

        {/* CASE B: TICKET RESOLVED / OPEN FEEDS */}
        {!isAdding && (
          <div className="space-y-4">
            
            {loadingTickets ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
              </div>
            ) : dbError ? (
              /* Error Retry Card */
              <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col items-center">
                <span className="material-icons-round text-red-500 text-5xl mb-4">cloud_off</span>
                <h3 className="text-[14px] font-black text-slate-900">Unable to load support tickets</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-1 max-w-xs">
                  Please try again shortly. Our databases are undergoing scheduled synchronization.
                </p>
                <button
                  onClick={fetchTickets}
                  className="mt-5 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95"
                >
                  Retry
                </button>
              </div>
            ) : activeQueries.length > 0 ? (
              <div className="space-y-4 animate-fadeInUp">
                {activeQueries.map((t) => (
                  <div key={t.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                    
                    {/* Ticket Header details */}
                    <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                      <div>
                        <span className="text-[11px] font-black text-pink-600 tracking-wider font-mono">
                          {t.ticket_number}
                        </span>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                          {new Date(t.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        t.status === "open" ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    {/* Topic details */}
                    <div className="space-y-1.5">
                      <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
                        {t.topic}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {t.description}
                      </p>
                    </div>

                    {/* Attachments */}
                    {(t.attachment_url || t.request_callback) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {t.attachment_url && (
                          <button
                            onClick={() => window.open(t.attachment_url, "_blank")}
                            className="flex items-center gap-1 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <span className="material-icons-round text-[12px]">attachment</span>
                            {t.attachment_url.split("/").pop()}
                          </button>
                        )}
                        {t.request_callback && (
                          <div className="flex items-center gap-1 bg-pink-50 text-pink-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                            <span className="material-icons-round text-[12px]">phone_callback</span>
                            Callback Requested
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Replies */}
                    {t.status === "open" ? (
                      t.admin_reply && (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1 mt-2 animate-scaleIn">
                          <span className="text-[10px] font-black text-pink-600 uppercase tracking-wider block">GLVIA Support Reply Preview:</span>
                          <p className="text-xs text-slate-600 font-semibold leading-relaxed line-clamp-2">
                            {t.admin_reply}
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 space-y-2 mt-2 animate-scaleIn">
                        <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-black">
                          <span className="material-icons-round text-[16px]">verified</span>
                          Resolved by GLVIA Support
                        </div>
                        {t.admin_reply && (
                          <p className="text-xs text-slate-600 font-semibold leading-relaxed border-t border-emerald-100/50 pt-2">
                            {t.admin_reply}
                          </p>
                        )}
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                          Closed on: {new Date(t.updated_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            ) : (
              /* NO DATA FOUND (Centered precisely matching the screenshot) */
              <div className="flex flex-col items-center justify-center py-40 select-none animate-fadeIn">
                <span className="text-base font-semibold text-slate-900 tracking-tight">No data found</span>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ─── Topic Bottom Sheet Sheet ─── */}
      {sheetOpen && isAdding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn" onClick={() => setSheetOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-xl overflow-hidden animate-slideUp z-10 border-t border-slate-100">
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-3" />
            <div className="px-5 pb-5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-2">
                <span className="text-sm font-black text-slate-900">Choose a topic</span>
                <button onClick={() => setSheetOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <span className="material-icons-round text-[16px]">close</span>
                </button>
              </div>
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

      {/* ─── Footer ─── */}
      <footer className="w-full p-4 bg-white border-t border-slate-100 flex flex-col items-center gap-1.5 shrink-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
          Powered by <span className="text-slate-600 font-extrabold flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 inline-block"></span>freshworks</span>
        </span>
      </footer>

    </div>
  );
}
