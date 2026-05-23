"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../lib/adminAuth";
import { supabase } from "../../lib/supabase";
import Image from "next/image";

export default function AdminApprovalsPage() {
  const router = useRouter();
  const { admin, isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
  const [pendingSalons, setPendingSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !["admin", "super_admin"].includes(admin?.role || "")) {
        router.replace("/");
        return;
      }
      fetchPendingSalons();
    }
  }, [authLoading, isAuthenticated, admin, router]);

  const fetchPendingSalons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("salons")
        .select(`
          *,
          admin_users (id, name, email)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingSalons(data || []);
    } catch (err) {
      console.error("Error fetching pending salons", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (salonId: string, newStatus: string) => {
    setActionLoading(salonId);
    try {
      // 1. Update Salon status
      const { error: salonError } = await supabase
        .from("salons")
        .update({ status: newStatus })
        .eq("id", salonId);
      
      if (salonError) throw salonError;

      // 2. Update the Owner's access status
      const { error: adminError } = await supabase
        .from("admin_users")
        .update({ approval_status: newStatus })
        .eq("salon_id", salonId);

      if (adminError) throw adminError;

      // Optimistically remove from list if approved/rejected
      if (newStatus !== "pending") {
         setPendingSalons(prev => prev.filter(s => s.id !== salonId));
      }

    } catch (err) {
      console.error(`Failed to ${newStatus} salon:`, err);
      alert(`Error updating status. See console.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-dvh bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-200">
      {/* Topbar */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <span className="material-icons-round text-white">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">Admin Portal</h1>
            <p className="text-xs text-slate-400 font-medium">Pending Approvals</p>
          </div>
        </div>
        <button onClick={() => router.push("/salon-owner/dashboard")} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors">
          Exit to Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Pending Marketplace Salons</h2>
            <p className="text-slate-400 mt-1">Review KYC and approve salons to go live on the platform.</p>
          </div>
          <div className="bg-pink-500/10 text-pink-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-pink-500/20">
            <span className="material-icons-round text-[18px]">pending_actions</span>
            {pendingSalons.length} Pending
          </div>
        </div>

        {pendingSalons.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
            <span className="material-icons-round text-6xl text-slate-700 mb-4">task_alt</span>
            <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-slate-500">No salons are waiting for approval right now.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingSalons.map((salon) => (
              <div key={salon.id} className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  
                  {/* Left Column: Basics & Checklist */}
                  <div className="col-span-1 space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-white">{salon.name}</h3>
                      <p className="text-sm text-slate-400 mt-1 flex items-start gap-1">
                        <span className="material-icons-round text-[16px] mt-0.5">place</span>
                        {salon.address_street}, {salon.address_city}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Owner Details</h4>
                      {salon.admin_users && salon.admin_users[0] && (
                        <div className="space-y-2 text-sm">
                          <p className="text-white"><span className="text-slate-400 mr-2">Name:</span> {salon.admin_users[0].name}</p>
                          <p className="text-white"><span className="text-slate-400 mr-2">Email:</span> {salon.admin_users[0].email}</p>
                          <p className="text-white"><span className="text-slate-400 mr-2">Phone:</span> {salon.contact_phone}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Readiness Checklist</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`material-icons-round text-[18px] ${salon.images?.length > 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {salon.images?.length > 0 ? "check_circle" : "cancel"}
                        </span>
                        <span className="text-slate-300">Images Uploaded ({salon.images?.length || 0})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`material-icons-round text-[18px] ${salon.kyc_documents?.documents?.length > 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {salon.kyc_documents?.documents?.length > 0 ? "check_circle" : "cancel"}
                        </span>
                        <span className="text-slate-300">KYC Provided</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`material-icons-round text-[18px] ${salon.address_street ? "text-emerald-500" : "text-red-500"}`}>
                          {salon.address_street ? "check_circle" : "cancel"}
                        </span>
                        <span className="text-slate-300">Full Address Set</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: KYC & Images Review */}
                  <div className="col-span-1 md:col-span-2 space-y-5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Salon Images</h4>
                      <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                        {salon.images?.map((img: string, i: number) => (
                          <div key={i} className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 snap-start border border-white/10">
                            <Image src={img} alt={`Salon image ${i}`} fill className="object-cover" unoptimized />
                          </div>
                        )) || <p className="text-sm text-slate-500">No images provided.</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">KYC Documents</h4>
                      <div className="flex flex-wrap gap-3">
                        {salon.kyc_documents?.documents?.map((doc: string, i: number) => (
                          <a key={i} href={doc} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-colors">
                            <span className="material-icons-round text-[18px] text-blue-400">description</span>
                            View Document {i + 1}
                          </a>
                        )) || <p className="text-sm text-slate-500">No KYC documents provided.</p>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                      <button 
                        onClick={() => handleAction(salon.id, "approved")}
                        disabled={actionLoading === salon.id}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading === salon.id ? <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> : <><span className="material-icons-round text-[18px]">verified</span> Approve & Go Live</>}
                      </button>
                      
                      <button 
                        onClick={() => handleAction(salon.id, "rejected")}
                        disabled={actionLoading === salon.id}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
