"use client";

import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAdminAuth } from "../../lib/adminAuth";
import {
  useSalonOwnerStats, useMyBookings, useUpdateBookingStatus,
  useSalonStaff, useAddStaff, useUpdateStaff, useDeleteStaff,
  useSalonServices, useAddService, useUpdateService, useDeleteService,
  useSalon, useUpdateSalonProfile,
  useOwnerReply, useReviewsModeration, useUpdateReviewStatus,
} from "../../lib/hooks";
import SalonOnboardingWizard from "../../components/admin/SalonOnboardingWizard";
import MediaUploader from "../../components/admin/MediaUploader";

type Tab = "overview" | "bookings" | "services" | "staff" | "settings" | "reviews" | "preview";
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    completed: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    pending: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    cancelled: "bg-red-500/15 text-red-400 border border-red-500/20",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${map[status] || map.pending}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, gradient }: { label: string; value: string | number; icon: string; gradient: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/[0.06] transition-all">
      <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
        <span className="material-icons-round text-white text-[22px]">{icon}</span>
      </div>
      <p className="text-sm text-slate-400 font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-extrabold text-white">{value}</h3>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#191c1d]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="glass-card border border-[#e1e3e4] rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-ambient"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e1e3e4]">
          <h2 className="text-lg font-bold text-[#191c1d]">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f3f4f5] flex items-center justify-center text-[#574048] hover:text-[#191c1d] transition-colors">
            <span className="material-icons-round text-[20px]">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
function Input({ label, ...props }: { label: string; [key: string]: any }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#574048] mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-white border border-[#e1e3e4] rounded-xl text-[#191c1d] placeholder-[#8b7079] text-sm focus:outline-none focus:border-[#b10e6b] focus:ring-2 focus:ring-[#ffd9e4] transition-all"
      />
    </div>
  );
}


// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ salon, salonId, stats, statsLoading, onStartWizard, onTabSwitch }: {
  salon: any; salonId: string; stats: any; statsLoading: boolean; onStartWizard?: () => void; onTabSwitch: (t: Tab) => void;
}) {
  const steps = [
    { label: "Salon details", done: !!(salon?.name && salon.name !== "My Salon" && salon?.address_city) },
    { label: "Services", done: salon?.services && salon.services.length > 0 },
    { label: "Timings", done: !!salon?.timings },
    { label: "Photos", done: salon?.images && salon.images.length > 0 && !salon.images[0].includes("1521590832167") },
    { label: "Branding", done: !!salon?.description },
    { label: "Verification", done: salon?.status === "approved" }
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const percentage = Math.round((completedCount / steps.length) * 100) || 0;
  const isComplete = completedCount === steps.length;

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#191c1d]">Overview</h1>
        <p className="text-base text-[#574048] mt-2">Welcome back. Here's what's happening today.</p>
      </header>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-4 md:p-6 border border-[#e1e3e4] shadow-ambient hover:shadow-ambient-primary transition-shadow">
          <div className="w-10 h-10 rounded-full bg-[#d23284]/20 flex items-center justify-center mb-4">
            <span className="material-icons-round text-[#b10e6b]">payments</span>
          </div>
          <p className="text-xs text-[#574048] uppercase tracking-wider mb-1 font-semibold">Today's Revenue</p>
          <p className="text-2xl md:text-3xl font-bold text-[#191c1d]">₹{statsLoading ? "—" : stats?.dailyRevenue ?? 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 md:p-6 border border-[#e1e3e4] shadow-ambient hover:shadow-ambient-primary transition-shadow">
          <div className="w-10 h-10 rounded-full bg-[#8455ef]/20 flex items-center justify-center mb-4">
            <span className="material-icons-round text-[#6b38d4]">calendar_month</span>
          </div>
          <p className="text-xs text-[#574048] uppercase tracking-wider mb-1 font-semibold">Today's Bookings</p>
          <p className="text-2xl md:text-3xl font-bold text-[#191c1d]">{statsLoading ? "—" : stats?.recentBookings?.filter((b:any)=>b.status!=='cancelled').length ?? 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 md:p-6 border border-[#e1e3e4] shadow-ambient hover:shadow-ambient-primary transition-shadow">
          <div className="w-10 h-10 rounded-full bg-[#c0488a]/20 flex items-center justify-center mb-4">
            <span className="material-icons-round text-[#a12e70]">groups</span>
          </div>
          <p className="text-xs text-[#574048] uppercase tracking-wider mb-1 font-semibold">Active Staff</p>
          <p className="text-2xl md:text-3xl font-bold text-[#191c1d]">{statsLoading ? "—" : stats?.activeStaff ?? 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 md:p-6 border border-[#e1e3e4] shadow-ambient hover:shadow-ambient-primary transition-shadow relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-[#d23284]/10 flex items-center justify-center">
              <span className="material-icons-round text-[#b10e6b]">stars</span>
            </div>
          </div>
          <p className="text-xs text-[#574048] uppercase tracking-wider mb-1 font-semibold">Total Revenue</p>
          <p className="text-2xl md:text-3xl font-bold text-[#191c1d]">₹{statsLoading ? "—" : stats?.totalRevenue?.toLocaleString() ?? 0}</p>
        </div>
      </section>

      {/* Middle Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Actionable Insights */}
        <div className="lg:col-span-2 rounded-2xl p-[1px] bg-gradient-to-br from-[#b10e6b] to-[#6b38d4] shadow-ambient-primary">
          <div className="bg-white rounded-2xl h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-icons-round text-[#b10e6b]">lightbulb</span>
                <h3 className="text-xl font-bold text-[#191c1d]">Actionable Insights</h3>
              </div>
              <ul className="space-y-4">
                {!isComplete ? (
                   <li className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#b10e6b] shrink-0"></div>
                    <div>
                      <p className="text-base font-semibold text-[#191c1d]">Complete your Salon Profile</p>
                      <p className="text-sm text-[#574048]">Your profile is only {percentage}% complete. Finish setup to rank higher on GLVIA.</p>
                    </div>
                  </li>
                ) : (
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#b10e6b] shrink-0"></div>
                    <div>
                      <p className="text-base font-semibold text-[#191c1d]">Your salon is live!</p>
                      <p className="text-sm text-[#574048]">Add more photos and services to attract new customers.</p>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#6b38d4] shrink-0"></div>
                  <div>
                    <p className="text-base font-semibold text-[#191c1d]">Unlock Badges</p>
                    <p className="text-sm text-[#574048]">Get more reviews and respond faster to unlock Top Rated badges.</p>
                  </div>
                </li>
              </ul>
            </div>
            {!isComplete && onStartWizard && (
              <button onClick={onStartWizard} className="mt-6 w-full py-3 rounded-lg bg-[#d23284]/10 text-[#b10e6b] font-semibold text-sm hover:bg-[#d23284]/20 transition-colors">
                Continue Setup ({percentage}% Complete)
              </button>
            )}
          </div>
        </div>

        {/* Gamification: Health Score */}
        <div className="glass-card rounded-2xl border border-[#e1e3e4] shadow-ambient p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-bold text-[#191c1d] mb-2 w-full text-left">Salon Health</h3>
          <div className="relative w-32 h-32 my-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="#e1e3e4" strokeWidth="10"></circle>
              <motion.circle 
                cx="50" cy="50" fill="none" r="45" stroke="#b10e6b" strokeWidth="10"
                strokeDasharray="282.7" 
                strokeDashoffset={282.7 - (282.7 * percentage) / 100}
                strokeLinecap="round"
                initial={{ strokeDashoffset: 282.7 }}
                animate={{ strokeDashoffset: 282.7 - (282.7 * percentage) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#b10e6b]">{percentage}%</span>
            </div>
          </div>
          <div className="flex gap-2 justify-center mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${salon?.status === "approved" ? "bg-green-100 border-green-200 text-green-600" : "bg-gray-100 border-gray-200 text-gray-400"}`} title="Verified">
              <span className="material-icons-round text-sm">verified</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shadow-sm text-blue-600" title="Fast Responder">
              <span className="material-icons-round text-sm">bolt</span>
            </div>
          </div>
          <p className="text-sm text-[#574048]">Improve profile completeness to reach 100%.</p>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Appointments */}
        <div className="glass-card rounded-2xl border border-[#e1e3e4] shadow-ambient p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#191c1d]">Recent Appointments</h3>
            <button onClick={() => onTabSwitch("bookings")} className="text-[#b10e6b] text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {statsLoading ? (
              <div className="flex justify-center p-8"><div className="w-8 h-8 border-3 border-[#b10e6b]/30 border-t-[#b10e6b] rounded-full animate-spin" /></div>
            ) : (stats?.recentBookings?.length ?? 0) === 0 ? (
              <p className="text-sm text-[#574048] text-center p-8">No recent bookings found.</p>
            ) : (
              stats.recentBookings.slice(0, 4).map((b: any, i: number) => (
                <div key={b.id || i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f3f4f5] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e1e3e4] flex items-center justify-center text-[#574048] font-bold shrink-0">
                      {(b.customerName || "G").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#191c1d]">{b.customerName || "Guest"}</p>
                      <p className="text-sm text-[#574048]">{b.services?.[0]?.name || "Service"} • {b.timeSlot}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-[#191c1d]">₹{b.totalAmount}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider mt-1 font-bold ${
                      b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      b.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>{b.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revenue Chart Mockup */}
        <div className="glass-card rounded-2xl border border-[#e1e3e4] shadow-ambient p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#191c1d]">Revenue Trends</h3>
            <span className="text-xs font-semibold text-[#574048] bg-[#f3f4f5] px-2 py-1 rounded">Last 7 Days</span>
          </div>
          <div className="flex-1 relative min-h-[200px] flex items-end pt-8">
            <div className="absolute inset-0 flex items-end justify-between px-2 pb-6">
              <div className="absolute inset-0 flex flex-col justify-between border-b border-[#e1e3e4] pb-6">
                <div className="w-full border-t border-[#e1e3e4]/50 h-0"></div>
                <div className="w-full border-t border-[#e1e3e4]/50 h-0"></div>
                <div className="w-full border-t border-[#e1e3e4]/50 h-0"></div>
              </div>
              <div className="w-2 h-[40%] bg-[#d23284]/20 rounded-t-sm z-10 relative"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#574048]">Mon</span></div>
              <div className="w-2 h-[60%] bg-[#d23284]/20 rounded-t-sm z-10 relative"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#574048]">Tue</span></div>
              <div className="w-2 h-[45%] bg-[#d23284]/20 rounded-t-sm z-10 relative"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#574048]">Wed</span></div>
              <div className="w-2 h-[80%] bg-[#d23284]/20 rounded-t-sm z-10 relative"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#574048]">Thu</span></div>
              <div className="w-2 h-[65%] bg-[#d23284]/20 rounded-t-sm z-10 relative"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#574048]">Fri</span></div>
              <div className="w-2 h-[90%] bg-[#d23284]/20 rounded-t-sm z-10 relative"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#574048]">Sat</span></div>
              <div className="w-2 h-[70%] bg-[#b10e6b] rounded-t-sm z-10 relative shadow-[0_0_10px_rgba(177,14,107,0.5)]"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#b10e6b] font-bold">Sun</span></div>
              
              <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M 5,60 C 20,60 15,40 30,40 C 45,40 40,55 55,55 C 70,55 65,20 80,20 C 95,20 90,35 100,35" fill="none" stroke="#b10e6b" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                <path d="M 5,60 C 20,60 15,40 30,40 C 45,40 40,55 55,55 C 70,55 65,20 80,20 C 95,20 90,35 100,35 L 100,100 L 5,100 Z" fill="url(#chart-gradient)" opacity="0.1" vectorEffect="non-scaling-stroke"></path>
                <defs>
                  <linearGradient id="chart-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#b10e6b"></stop>
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab({ salonId }: { salonId: string }) {
  const { data: bookings = [], isLoading } = useMyBookings(salonId);
  const updateStatus = useUpdateBookingStatus();
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = filter === "all" ? bookings : bookings.filter((b: any) => b.status === filter);
  const filters: { value: "all" | BookingStatus; label: string }[] = [
    { value: "all", label: "All" }, { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" }, { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await updateStatus.mutateAsync({ id, status });
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d]">Bookings</h2>
        <p className="text-sm text-[#574048] mt-1">Manage your appointments and schedule.</p>
      </header>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap pb-4">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === f.value
                ? "bg-[#b10e6b] text-white shadow-ambient-primary"
                : "bg-white text-[#574048] hover:bg-[#f3f4f5] border border-[#e1e3e4]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#b10e6b]/30 border-t-[#b10e6b] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card border border-[#e1e3e4] rounded-2xl">
          <span className="material-icons-round text-5xl text-[#574048] mb-4">event_busy</span>
          <p className="text-[#191c1d] font-semibold text-lg">No bookings found</p>
          <p className="text-sm text-[#574048]">Try changing your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((b: any) => (
            <div key={b.id} className="glass-card border border-[#e1e3e4] rounded-2xl p-5 hover:shadow-ambient transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f3f4f5] border border-[#e1e3e4] flex items-center justify-center text-sm font-bold text-[#b10e6b]">
                      {(b.customerName || "G").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#191c1d] text-base">{b.customerName || "Guest"}</h4>
                      {b.customerPhone && <p className="text-xs text-[#574048]">{b.customerPhone}</p>}
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    b.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>{b.status}</span>
                </div>

                <div className="bg-[#f8f9fa] rounded-xl p-3 mb-4 border border-[#e1e3e4]">
                  <div className="grid grid-cols-2 gap-y-3">
                    <div>
                      <p className="text-[10px] text-[#574048] uppercase tracking-wider mb-0.5">Date & Time</p>
                      <p className="text-sm font-semibold text-[#191c1d]">{b.date} · {b.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#574048] uppercase tracking-wider mb-0.5">Amount</p>
                      <p className="text-sm font-bold text-[#b10e6b]">₹{b.totalAmount}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-[#574048] uppercase tracking-wider mb-0.5">Services</p>
                      <p className="text-sm font-semibold text-[#191c1d]">{b.services?.map((s: any) => s.name).join(", ") || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              {b.status !== "completed" && b.status !== "cancelled" && (
                <div className="flex gap-2 flex-wrap">
                  {b.status === "pending" && (
                    <button
                      onClick={() => handleStatus(b.id, "confirmed")}
                      disabled={updatingId === b.id}
                      className="flex-1 py-2 rounded-lg bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  )}
                  {b.status === "confirmed" && (
                    <button
                      onClick={() => handleStatus(b.id, "completed")}
                      disabled={updatingId === b.id}
                      className="flex-1 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => handleStatus(b.id, "cancelled")}
                    disabled={updatingId === b.id}
                    className="flex-1 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}const getCategoryLabel = (slug: string, gender: string) => {
  const list = gender === "male" ? [
    { label: "Hair Cut & Style", slug: "hair-cut-style" },
    { label: "Skin Care", slug: "skin-care" },
    { label: "Hair Colour", slug: "hair-colour" },
    { label: "Hair Chemical", slug: "hair-chemical" },
    { label: "Mani Pedi & Hygiene", slug: "mani-pedi-hygiene" },
    { label: "Spa & Massage", slug: "spa-massage" },
    { label: "Body Polishing", slug: "body-polishing" },
    { label: "Hair Treatments", slug: "hair-treatments" },
    { label: "Pre Groom", slug: "pre-groom" },
    { label: "Makeup", slug: "makeup" },
  ] : [
    { label: "Hair Cut & Style", slug: "hair-cut-style" },
    { label: "Hair Colour", slug: "hair-colour" },
    { label: "Hair Treatments", slug: "hair-treatments" },
    { label: "Hair Chemical", slug: "hair-chemical" },
    { label: "Mani Pedi & Hygiene", slug: "mani-pedi-hygiene" },
    { label: "Skin Care", slug: "skin-care" },
    { label: "Spa & Massage", slug: "spa-massage" },
    { label: "Makeup", slug: "makeup" },
    { label: "Nail Art", slug: "nail-art" },
    { label: "Bridal Packages", slug: "bridal-packages" },
  ];
  const found = list.find(c => c.slug === slug);
  return found ? found.label : (slug || "Unassigned");
};

const normalizeCategorySlug = (category: string) => {
  if (!category) return "";
  const clean = category.trim().toLowerCase();
  if (clean.includes("cut") && clean.includes("style")) return "hair-cut-style";
  if (clean.includes("skin") && clean.includes("care")) return "skin-care";
  if (clean.includes("clour") || clean.includes("colour") || clean.includes("color")) return "hair-colour";
  if (clean.includes("chemical")) return "hair-chemical";
  if (clean.includes("mani") || clean.includes("pedi") || clean.includes("hygiene")) return "mani-pedi-hygiene";
  if (clean.includes("spa") || clean.includes("massage")) return "spa-massage";
  if (clean.includes("body") && clean.includes("polishing")) return "body-polishing";
  if (clean.includes("treatments") || clean.includes("treatment")) return "hair-treatments";
  if (clean.includes("pre") && clean.includes("groom")) return "pre-groom";
  if (clean.includes("makeup")) return "makeup";
  if (clean.includes("nail") && clean.includes("art")) return "nail-art";
  if (clean.includes("bridal") && clean.includes("package")) return "bridal-packages";
  return clean.replace(/\s+/g, "-").replace(/&/g, "and").replace(/[^a-z0-9\-]/g, "");
};

// ─── Services Tab ─────────────────────────────────────────────────────────────
function ServicesTab({ salonId }: { salonId: string }) {
  const { data: services = [], isLoading } = useSalonServices(salonId);
  const addSvc = useAddService();
  const updateSvc = useUpdateService();
  const deleteSvc = useDeleteService();

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: "", price: "", duration: "", category: "", gender: "female", description: "", image: "", old_price: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setForm({ name: "", price: "", duration: "", category: "", gender: "female", description: "", image: "", old_price: "" });
    setModal("add");
  };

  const openEdit = (svc: any) => {
    setSelected(svc);
    setForm({
      name: svc.name || "", price: String(svc.price || ""), duration: String(svc.duration || ""),
      category: svc.category || "", gender: svc.gender || "female",
      description: svc.description || "", image: svc.image || "",
      old_price: String(svc.old_price || ""),
    });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    try {
      const payload: any = {
        salon_id: salonId,
        name: form.name,
        price: Number(form.price),
        duration: form.duration,
        category: normalizeCategorySlug(form.category),
        gender: form.gender,
        description: form.description,
        image: form.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80",
        old_price: form.old_price ? Number(form.old_price) : null,
      };
      if (modal === "edit" && selected) {
        await updateSvc.mutateAsync({ id: selected.id, ...payload });
      } else {
        await addSvc.mutateAsync(payload);
      }
      setModal(null);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try { await deleteSvc.mutateAsync({ id, salon_id: salonId }); } finally { setDeleteId(null); }
  };

  const formFields = (
    <div className="space-y-4">
      <Input label="Service Name *" value={form.name} onChange={(e: any) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Haircut" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Price (₹) *" type="number" value={form.price} onChange={(e: any) => setForm(p => ({ ...p, price: e.target.value }))} placeholder="350" />
        <Input label="Old Price (₹)" type="number" value={form.old_price} onChange={(e: any) => setForm(p => ({ ...p, old_price: e.target.value }))} placeholder="500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Duration (min)" type="number" value={form.duration} onChange={(e: any) => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="30" />
        <div>
          <label className="block text-xs font-bold text-[#574048] mb-1.5 uppercase tracking-wider">Gender</label>
          <select
            value={form.gender}
            onChange={(e: any) => setForm(p => ({ ...p, gender: e.target.value }))}
            className="w-full px-4 py-3 bg-white border border-[#e1e3e4] rounded-xl text-[#191c1d] text-sm focus:outline-none focus:border-[#b10e6b] transition-all"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-[#574048] mb-1.5 uppercase tracking-wider">Category</label>
        <select
          value={form.category}
          onChange={(e: any) => setForm(p => ({ ...p, category: e.target.value }))}
          className="w-full px-4 py-3 bg-white border border-[#e1e3e4] rounded-xl text-[#191c1d] text-sm focus:outline-none focus:border-[#b10e6b] transition-all"
        >
          <option value="">Select Category</option>
          {form.gender === "male" ? (
            <>
              <option value="hair-cut-style">Hair Cut & Style</option>
              <option value="skin-care">Skin Care</option>
              <option value="hair-colour">Hair Colour</option>
              <option value="hair-chemical">Hair Chemical</option>
              <option value="mani-pedi-hygiene">Mani Pedi & Hygiene</option>
              <option value="spa-massage">Spa & Massage</option>
              <option value="body-polishing">Body Polishing</option>
              <option value="hair-treatments">Hair Treatments</option>
              <option value="pre-groom">Pre Groom</option>
              <option value="makeup">Makeup</option>
            </>
          ) : (
            <>
              <option value="hair-cut-style">Hair Cut & Style</option>
              <option value="hair-colour">Hair Colour</option>
              <option value="hair-treatments">Hair Treatments</option>
              <option value="hair-chemical">Hair Chemical</option>
              <option value="mani-pedi-hygiene">Mani Pedi & Hygiene</option>
              <option value="skin-care">Skin Care</option>
              <option value="spa-massage">Spa & Massage</option>
              <option value="makeup">Makeup</option>
              <option value="nail-art">Nail Art</option>
              <option value="bridal-packages">Bridal Packages</option>
            </>
          )}
        </select>
      </div>
      <MediaUploader
        label="Service Image (optional)"
        value={form.image}
        onChange={(url) => setForm(p => ({ ...p, image: url }))}
        folder="services"
      />
      <div>
        <label className="block text-xs font-bold text-[#574048] mb-1.5 uppercase tracking-wider">Description</label>
        <textarea
          value={form.description}
          onChange={(e: any) => setForm(p => ({ ...p, description: e.target.value }))}
          rows={2}
          placeholder="Brief description of this service..."
          className="w-full px-4 py-3 bg-white border border-[#e1e3e4] rounded-xl text-[#191c1d] placeholder-[#8b7079] text-sm focus:outline-none focus:border-[#b10e6b] focus:ring-2 focus:ring-[#ffd9e4] transition-all resize-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || !form.name.trim() || !form.price}
        className="w-full py-3 rounded-xl bg-[#b10e6b] hover:bg-[#a12e70] text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
      >
        {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <>{modal === "edit" ? "Update Service" : "Add Service"}</>}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d]">Services</h2>
          <p className="text-sm text-[#574048] mt-1">{services.length} service{services.length !== 1 ? "s" : ""} configured</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#b10e6b] text-white text-sm font-bold shadow-ambient-primary hover:bg-[#a12e70] transition-colors">
          <span className="material-icons-round text-[18px]">add</span>Add Service
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-[#b10e6b]/30 border-t-[#b10e6b] rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card border border-[#e1e3e4] rounded-2xl">
          <span className="material-icons-round text-5xl text-[#574048] mb-4">spa</span>
          <p className="text-[#191c1d] font-semibold text-lg mb-2">No services added yet</p>
          <button onClick={openAdd} className="text-sm text-[#b10e6b] font-bold hover:underline">+ Add your first service</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc: any) => (
            <div key={svc.id} className="glass-card border border-[#e1e3e4] rounded-2xl p-4 flex gap-4 hover:shadow-ambient transition-shadow group">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#f3f4f5] border border-[#e1e3e4]">
                {svc.image ? (
                  <div className="relative w-full h-full"><Image src={svc.image} alt={svc.name} fill className="object-cover" /></div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-icons-round text-[#8b7079]">spa</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[#191c1d] text-base truncate">{svc.name}</h4>
                  <p className="text-xs text-[#574048] mt-0.5">{getCategoryLabel(svc.category, svc.gender)} · {svc.duration} min · <span className="capitalize">{svc.gender}</span></p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#b10e6b]">₹{svc.price}</span>
                    {svc.old_price && <span className="text-xs text-[#8b7079] line-through">₹{svc.old_price}</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(svc)} className="w-8 h-8 rounded-lg bg-white border border-[#e1e3e4] flex items-center justify-center text-[#574048] hover:text-[#b10e6b] hover:border-[#b10e6b] transition-colors" title="Edit">
                      <span className="material-icons-round text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(svc.id)}
                      disabled={deleteId === svc.id}
                      className="w-8 h-8 rounded-lg bg-white border border-[#e1e3e4] flex items-center justify-center text-[#574048] hover:text-red-500 hover:border-red-500 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleteId === svc.id
                        ? <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        : <span className="material-icons-round text-[16px]">delete</span>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === "add" ? "Add New Service" : "Edit Service"} onClose={() => setModal(null)}>
          {formFields}
        </Modal>
      )}
    </div>
  );
}


// ─── Staff Tab ────────────────────────────────────────────────────────────────
function StaffTab({ salonId }: { salonId: string }) {
  const { data: staff = [], isLoading } = useSalonStaff(salonId);
  const addStaff = useAddStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: "", role: "Stylist" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal === "edit" && selected) {
        await updateStaff.mutateAsync({ id: selected.id, salon_id: salonId, name: form.name, role: form.role });
      } else {
        await addStaff.mutateAsync({ salon_id: salonId, name: form.name, role: form.role });
      }
      setModal(null);
    } finally { setSaving(false); }
  };

  const handleToggle = async (member: any) => {
    setTogglingId(member.id);
    await updateStaff.mutateAsync({ id: member.id, salon_id: salonId, is_available: !member.is_available });
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteStaff.mutateAsync({ id, salon_id: salonId });
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d]">Staff</h2>
          <p className="text-sm text-[#574048] mt-1">{staff.length} staff member{staff.length !== 1 ? "s" : ""} active</p>
        </div>
        <button
          onClick={() => { setForm({ name: "", role: "Stylist" }); setModal("add"); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#b10e6b] text-white text-sm font-bold shadow-ambient-primary hover:bg-[#a12e70] transition-colors"
        >
          <span className="material-icons-round text-[18px]">person_add</span>Add Staff
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-[#b10e6b]/30 border-t-[#b10e6b] rounded-full animate-spin" />
        </div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card border border-[#e1e3e4] rounded-2xl">
          <span className="material-icons-round text-5xl text-[#574048] mb-4">people</span>
          <p className="text-[#191c1d] font-semibold text-lg mb-2">No staff added yet</p>
          <button onClick={() => { setForm({ name: "", role: "Stylist" }); setModal("add"); }} className="text-sm text-[#b10e6b] font-bold hover:underline">+ Add your first staff member</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {staff.map((member: any) => (
            <div key={member.id} className="glass-card border border-[#e1e3e4] rounded-2xl p-5 hover:shadow-ambient transition-shadow flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#f3f4f5] border border-[#e1e3e4] flex items-center justify-center text-lg font-bold text-[#b10e6b] flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#191c1d] truncate">{member.name}</h4>
                  <p className="text-xs text-[#574048]">{member.role}</p>
                </div>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${member.is_available ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-400"}`} />
              </div>

              <div className="mt-auto pt-4 border-t border-[#e1e3e4] flex items-center gap-2">
                {/* Toggle availability */}
                <button
                  onClick={() => handleToggle(member)}
                  disabled={togglingId === member.id}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    member.is_available
                      ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      : "bg-white border-[#e1e3e4] text-[#574048] hover:border-[#b10e6b]"
                  }`}
                >
                  {togglingId === member.id
                    ? <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                    : <span className="material-icons-round text-[14px]">{member.is_available ? "check_circle" : "radio_button_unchecked"}</span>}
                  {member.is_available ? "Available" : "Unavailable"}
                </button>

                <button
                  onClick={() => { setSelected(member); setForm({ name: member.name, role: member.role }); setModal("edit"); }}
                  className="w-9 h-9 rounded-xl bg-white border border-[#e1e3e4] flex items-center justify-center text-[#574048] hover:text-[#b10e6b] hover:border-[#b10e6b] transition-colors"
                >
                  <span className="material-icons-round text-[16px]">edit</span>
                </button>

                <button
                  onClick={() => handleDelete(member.id)}
                  disabled={deletingId === member.id}
                  className="w-9 h-9 rounded-xl bg-white border border-[#e1e3e4] flex items-center justify-center text-[#574048] hover:text-red-500 hover:border-red-500 transition-colors disabled:opacity-50"
                >
                  {deletingId === member.id
                    ? <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    : <span className="material-icons-round text-[16px]">delete</span>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === "add" ? "Add Staff Member" : "Edit Staff Member"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Input label="Full Name *" value={form.name} onChange={(e: any) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Priya Sharma" />
            <div>
              <label className="block text-xs font-bold text-[#574048] mb-1.5 uppercase tracking-wider">Role</label>
              <select
                value={form.role}
                onChange={(e: any) => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-[#e1e3e4] rounded-xl text-[#191c1d] text-sm focus:outline-none focus:border-[#b10e6b] transition-all"
              >
                {["Stylist", "Senior Stylist", "Beautician", "Nail Tech", "Makeup Artist", "Receptionist", "Manager"].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="w-full py-3 rounded-xl bg-[#b10e6b] hover:bg-[#a12e70] text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <>{modal === "edit" ? "Update Member" : "Add Member"}</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}


// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ salonId }: { salonId: string }) {
  const { data: salon, isLoading } = useSalon(salonId);
  const updateProfile = useUpdateSalonProfile();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Populate form when salon loads
  if (salon && !form) {
    const s = salon as any;
    setForm({
      name: s.name || "",
      description: s.description || "",
      contact_phone: s.contactPhone || s.contact_phone || "",
      contact_email: s.contactEmail || s.contact_email || "",
      address_street: s.address_street || s.address?.street || "",
      address_city: s.address_city || s.address?.city || "",
      address_state: s.address_state || s.address?.state || "",
      price_range: s.priceRange || s.price_range || "",
      timings: s.timings || "",
      google_map_url: s.google_map_url || "",
    });
  }


  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ id: salonId, ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-[#b10e6b]/30 border-t-[#b10e6b] rounded-full animate-spin" />
      </div>
    );
  }

  const field = (key: string, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-bold text-[#574048] mb-1.5 uppercase tracking-wider">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={form[key] || ""}
          onChange={(e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
          rows={3}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white border border-[#e1e3e4] rounded-xl text-[#191c1d] placeholder-[#8b7079] text-sm focus:outline-none focus:border-[#b10e6b] focus:ring-2 focus:ring-[#ffd9e4] transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[key] || ""}
          onChange={(e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white border border-[#e1e3e4] rounded-xl text-[#191c1d] placeholder-[#8b7079] text-sm focus:outline-none focus:border-[#b10e6b] focus:ring-2 focus:ring-[#ffd9e4] transition-all"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d]">Settings</h2>
        <p className="text-sm text-[#574048] mt-1">Manage your salon profile and public details.</p>
      </header>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2">
          <span className="material-icons-round text-[18px]">check_circle</span>
          Salon profile updated successfully!
        </div>
      )}

      {/* Basic Info */}
      <div className="glass-card border border-[#e1e3e4] rounded-3xl p-6 md:p-8 space-y-5">
        <h3 className="font-bold text-[#191c1d] flex items-center gap-2 pb-3 border-b border-[#e1e3e4]">
          <span className="material-icons-round text-[20px] text-[#b10e6b]">store</span>Basic Information
        </h3>
        {field("name", "Salon Name", "text", "My Salon Name")}
        {field("description", "Description", "textarea", "Brief description of your salon...")}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field("contact_phone", "Phone Number", "tel", "+91 98765 43210")}
          {field("contact_email", "Email Address", "email", "salon@email.com")}
          {field("price_range", "Price Range", "text", "₹99 - ₹2999")}
        </div>
      </div>

      {/* Address */}
      <div className="glass-card border border-[#e1e3e4] rounded-3xl p-6 md:p-8 space-y-5">
        <h3 className="font-bold text-[#191c1d] flex items-center gap-2 pb-3 border-b border-[#e1e3e4]">
          <span className="material-icons-round text-[20px] text-[#b10e6b]">location_on</span>Address & Map
        </h3>
        {field("address_street", "Street Address", "text", "123 Main Street, Area")}
        <div className="grid grid-cols-2 gap-5">
          {field("address_city", "City", "text", "City")}
          {field("address_state", "State", "text", "State")}
        </div>
        {field("google_map_url", "Google Maps URL", "url", "https://maps.google.com/...")}
      </div>

      {/* Timings */}
      <div className="glass-card border border-[#e1e3e4] rounded-3xl p-6 md:p-8 space-y-5">
        <h3 className="font-bold text-[#191c1d] flex items-center gap-2 pb-3 border-b border-[#e1e3e4]">
          <span className="material-icons-round text-[20px] text-[#b10e6b]">schedule</span>Working Hours
        </h3>
        {field("timings", "Timings (JSON or text)", "textarea", 'e.g., {"Mon-Sat": "9 AM – 8 PM", "Sun": "10 AM – 6 PM"}')}
      </div>

      {/* Save */}
      <div className="pt-4 pb-10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto md:min-w-[200px] float-right py-3.5 px-6 rounded-xl bg-[#b10e6b] hover:bg-[#a12e70] text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-ambient-primary transition-colors"
        >
          {saving ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><span className="material-icons-round text-[18px]">save</span>Save Changes</>}
        </button>
      </div>
    </div>
  );
}


// ─── Preview Tab ──────────────────────────────────────────────────────────────
function PreviewTab({ salonId }: { salonId: string }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[85vh] flex flex-col pb-10">
      <header className="mb-2 flex-shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d]">Customer Preview</h2>
        <p className="text-sm text-[#574048] mt-1">See exactly how your salon appears to customers on GLVIA.</p>
      </header>

      <div className="glass-card border border-[#e1e3e4] rounded-3xl overflow-hidden flex-1 relative shadow-ambient flex flex-col min-h-[500px]">
        <div className="bg-[#f8f9fa] border-b border-[#e1e3e4] px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <div className="bg-white border border-[#e1e3e4] px-4 py-1.5 rounded-full flex items-center gap-2 max-w-sm w-full mx-auto justify-center shadow-sm">
            <span className="material-icons-round text-[14px] text-[#8b7079]">lock</span>
            <span className="text-xs text-[#574048] font-mono truncate">glvia.com/salon/{salonId}</span>
          </div>
          <a href={`/salon/${salonId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#b10e6b] hover:text-[#a12e70] font-semibold transition-colors">
            Open App<span className="material-icons-round text-[14px]">open_in_new</span>
          </a>
        </div>
        <div className="flex-1 bg-white relative">
          <iframe 
            src={`/salon/${salonId}`} 
            className="w-full h-full border-none"
            title="Salon Preview"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    </div>
  );
}



// ─── Dashboard Component with Params ──────────────────────────────────────────
function DashboardContent() {
  const { admin, logout, isSalonOwner, isAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const searchParams = useSearchParams();
  const querySalonId = searchParams.get("salon_id");

  const salonId = (isSalonOwner ? admin?.salon_id : (isAdmin ? querySalonId || admin?.salon_id : "")) ?? "";
  const { data: salon, isLoading: salonLoading } = useSalon(salonId);
  const { data: stats, isLoading: statsLoading } = useSalonOwnerStats(salonId || undefined);
  const [showWizard, setShowWizard] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleShare = () => {
    if (!salonId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/salon/${salonId}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(publicUrl)
        .then(() => {
          setShowCopiedToast(true);
          setTimeout(() => setShowCopiedToast(false), 2000);
        })
        .catch(err => {
          console.error("Failed to copy link: ", err);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = publicUrl;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed: ", err);
      }
      document.body.removeChild(textArea);
    }
  };

  if (showWizard) {
    return <SalonOnboardingWizard salonId={salonId} initialData={salon} onComplete={() => setShowWizard(false)} />;
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "bookings", label: "Bookings", icon: "event" },
    { id: "services", label: "Services", icon: "content_cut" },
    { id: "staff", label: "Staff", icon: "groups" },
    { id: "settings", label: "Settings", icon: "settings" },
    { id: "reviews", label: "Reviews", icon: "rate_review" },
    { id: "preview", label: "Preview", icon: "visibility" },
  ];

  if (!salonId) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#f8f9fa] px-5">
        <div className="text-center p-8 max-w-sm w-full glass-card border border-[#e1e3e4] rounded-3xl shadow-ambient">
          <span className="material-icons-round text-6xl text-[#b10e6b] mb-5 block">store_mall_directory</span>
          <h2 className="text-xl font-bold text-[#191c1d] mb-3">
            {isAdmin ? "Admin Preview Mode" : "No Salon Linked"}
          </h2>
          <p className="text-[#574048] text-sm mb-6">
            {isAdmin 
              ? "Please select a salon from the Admin Panel to access its full dashboard." 
              : "Your account is not linked to any salon yet. Please complete registration."}
          </p>
          {isAdmin ? (
            <a href="/admin/salons" className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#b10e6b] hover:bg-[#a12e70] text-white rounded-xl font-bold text-sm transition-colors">
              <span className="material-icons-round text-[18px]">admin_panel_settings</span>
              Go to Admin Panel
            </a>
          ) : (
            <a href="/salon-owner/register" className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-[#b10e6b] border border-[#e1e3e4] hover:bg-[#f3f4f5] rounded-xl font-bold text-sm transition-colors">
              Complete Registration
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="stitch-dashboard flex flex-col h-[100dvh] overflow-hidden bg-[#f8f9fa] text-[#191c1d]">
      {/* TopAppBar */}
      <header className="flex-none w-full z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-[#e1e3e4]">
        <div className="flex justify-between items-center px-5 h-16 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-white shrink-0">
              <Image src="/logo.png" alt="GLVIA Logo" fill className="object-cover" />
            </div>
            <span className="text-xl font-bold text-[#b10e6b] tracking-tight mr-1">GLVIA</span>
            {salon?.name && (
              <>
                <span className="text-[#e1e3e4]">|</span>
                <span className="text-sm font-bold text-[#191c1d] truncate max-w-[120px] sm:max-w-[200px]" title={salon.name}>
                  {salon.name}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f3f4f5] text-[#574048] hover:text-[#b10e6b] hover:bg-[#ffd9e4] transition-all cursor-pointer"
                  title="Share Salon Link"
                >
                  <span className="material-icons-round text-[16px]">share</span>
                </button>
              </>
            )}
            {isAdmin && <span className="ml-2 text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Admin View</span>}
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-[#b10e6b] hover:opacity-80 transition-opacity">
              <span className="material-icons-round">notifications</span>
            </button>
            <button onClick={logout} className="text-[#191c1d] hover:text-[#b10e6b] text-sm font-semibold flex items-center gap-1">
              <span className="material-icons-round text-[18px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-[1280px] mx-auto w-full">
        {/* NavigationDrawer (Web) */}
        <aside className="hidden md:flex flex-col h-full w-72 rounded-r-xl bg-[#f8f9fa] border-r border-[#e1e3e4] p-4 shrink-0 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#e7e8e9] flex items-center justify-center text-xl font-bold text-[#b10e6b]">
              {(salon?.name || admin?.name || "Owner").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h2 className="text-sm font-bold text-[#b10e6b] truncate" title={salon?.name || admin?.name || "GLVIA Premium"}>
                  {salon?.name || admin?.name || "GLVIA Premium"}
                </h2>
                {salonId && (
                  <button
                    onClick={handleShare}
                    className="p-1 rounded-full hover:bg-[#ffd9e4] text-[#574048] hover:text-[#b10e6b] transition-all cursor-pointer shrink-0"
                    title="Share Salon Link"
                  >
                    <span className="material-icons-round text-[16px]">share</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-[#574048]">Owner Dashboard</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-[#ffd9e4] text-[#b10e6b] font-semibold"
                    : "text-[#574048] hover:bg-[#e7e8e9]"
                }`}
              >
                <span className="material-icons-round">{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto px-5 md:px-10 py-8 pb-32 md:pb-8 w-full bg-[#f8f9fa]">
          {activeTab === "overview" && <OverviewTab salon={salon} salonId={salonId} stats={stats} statsLoading={statsLoading} onStartWizard={() => setShowWizard(true)} onTabSwitch={setActiveTab} />}
          {activeTab === "bookings" && <BookingsTab salonId={salonId} />}
          {activeTab === "services" && <ServicesTab salonId={salonId} />}
          {activeTab === "staff" && <StaffTab salonId={salonId} />}
          {activeTab === "settings" && <SettingsTab salonId={salonId} />}
          {activeTab === "reviews" && <ReviewsTab salonId={salonId} />}
          {activeTab === "preview" && <PreviewTab salonId={salonId} />}
        </main>
      </div>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden flex-none w-full z-50 bg-white/90 backdrop-blur-xl border-t border-[#e1e3e4] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-2 pb-5 pt-3">
          {tabs.slice(0, 6).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all ${
                activeTab === tab.id
                  ? "bg-[#ffd9e4] text-[#b10e6b]"
                  : "text-[#574048]"
              }`}
            >
              <span className="material-icons-round text-[20px]">{tab.icon}</span>
              <span className="text-[10px] mt-1 font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showCopiedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/95 backdrop-blur-md border border-white/10 px-5 py-3 rounded-full text-white text-[11px] font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-icons-round text-green-400 text-[14px]">check_circle</span>
          Salon link copied to clipboard!
        </div>
      )}
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab({ salonId }: { salonId: string }) {
  const { data: reviews = [], isLoading, refetch } = useReviewsModeration(salonId);
  const ownerReplyMutation = useOwnerReply();
  const updateStatusMutation = useUpdateReviewStatus();
  
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | "all">("all");

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;
    setSubmittingId(reviewId);
    try {
      await ownerReplyMutation.mutateAsync({
        id: reviewId,
        salon_id: salonId,
        owner_reply: text
      });
      alert("Reply posted successfully!");
      refetch();
    } catch (err: any) {
      alert("Failed to submit reply: " + err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleHideToggle = async (review: any) => {
    const newStatus = review.status === 'hidden' ? 'approved' : 'hidden';
    try {
      await updateStatusMutation.mutateAsync({
        id: review.id,
        salon_id: salonId,
        status: newStatus
      });
      alert(`Review status set to ${newStatus}`);
      refetch();
    } catch (err: any) {
      alert("Failed: " + err.message);
    }
  };

  const filteredReviews = filterRating === "all"
    ? reviews
    : reviews.filter((r: any) => Math.round(r.rating) === filterRating);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d]">Customer Reviews</h2>
          <p className="text-sm text-[#574048] mt-1">Review feedback and respond directly to verified visits.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#574048]">Filter Rating:</span>
          <select
            value={filterRating}
            onChange={(e: any) => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-3 py-1.5 bg-white border border-[#e1e3e4] rounded-xl text-xs font-bold focus:outline-none focus:border-[#b10e6b]"
          >
            <option value="all">All Stars</option>
            {[5, 4, 3, 2, 1].map(s => (
              <option key={s} value={s}>{s} Stars</option>
            ))}
          </select>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-[#b10e6b]/30 border-t-[#b10e6b] rounded-full animate-spin" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#e1e3e4] rounded-2xl p-6">
          <span className="material-icons-round text-5xl text-[#574048] mb-4">rate_review</span>
          <p className="text-[#191c1d] font-semibold text-lg">No reviews found</p>
          <p className="text-sm text-[#574048]">Reviews appear here once guests complete visits.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          {filteredReviews.map((r: any) => (
            <div key={r.id} className="bg-white border border-[#e1e3e4] rounded-3xl p-5 hover:shadow-ambient transition-all space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f3f4f5] border border-[#e1e3e4] flex items-center justify-center text-sm font-bold text-[#b10e6b]">
                    {(r.customerName || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-[#191c1d] text-sm">{r.customerName || "Verified Guest"}</h4>
                      {r.isVerifiedBooking !== false && (
                        <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <span className="material-icons-round text-[10px]">verified</span>Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#574048] mt-0.5">
                      Service: <strong className="text-[#191c1d]">{r.serviceName || "Salon Service"}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-icons-round text-[16px]">
                        {i < r.rating ? "star" : "star_border"}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8b7079]">
                    {new Date(r.createdAt || r.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-sm text-[#191c1d] leading-relaxed bg-[#f8f9fa] rounded-2xl p-3 border border-[#e1e3e4]/60">
                {r.reviewText || r.comment}
              </p>

              {/* Photos */}
              {r.images && r.images.length > 0 && (
                <div className="flex gap-2 pb-1 overflow-x-auto">
                  {r.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-[#e1e3e4] shrink-0">
                      <img src={img} alt="" className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Section */}
              <div className="border-t border-[#e1e3e4] pt-4 mt-2">
                {r.ownerReply ? (
                  <div className="bg-[#ffd9e4]/10 border border-[#ffd9e4]/30 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#b10e6b] flex items-center justify-center shrink-0">
                      <span className="material-icons-round text-white text-[14px]">spa</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#b10e6b] uppercase tracking-wider">Your Reply</span>
                        <button 
                          onClick={() => setReplyText(p => ({ ...p, [r.id]: r.ownerReply }))}
                          className="text-[11px] font-bold text-[#b10e6b] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-xs text-[#574048] mt-1.5 leading-relaxed italic">
                        "{r.ownerReply}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#574048]">Post a Reply to Guest:</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Thank the guest or address their concerns..."
                        value={replyText[r.id] || ""}
                        onChange={(e) => setReplyText(p => ({ ...p, [r.id]: e.target.value }))}
                        className="flex-1 px-4 py-2 bg-white border border-[#e1e3e4] rounded-xl text-xs focus:outline-none focus:border-[#b10e6b] transition-all"
                      />
                      <button
                        onClick={() => handleReplySubmit(r.id)}
                        disabled={submittingId === r.id || !replyText[r.id]?.trim()}
                        className="px-4 py-2 bg-[#b10e6b] hover:bg-[#a12e70] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                      >
                        {submittingId === r.id ? "Posting..." : "Reply"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Abuse flag reporting */}
                <div className="flex justify-end gap-3 mt-3.5">
                  <button
                    onClick={() => handleHideToggle(r)}
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
                      r.status === 'hidden' 
                        ? 'bg-amber-100 border-amber-200 text-amber-800' 
                        : 'bg-white border-[#e1e3e4] text-[#574048] hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <span className="material-icons-round text-[11px] mr-1 align-middle">
                      {r.status === 'hidden' ? "visibility" : "visibility_off"}
                    </span>
                    {r.status === 'hidden' ? "Hidden (Spam)" : "Hide Review"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SalonOwnerDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
