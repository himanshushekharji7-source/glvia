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
} from "../../lib/hooks";
import SalonOnboardingWizard from "../../components/admin/SalonOnboardingWizard";
import MediaUploader from "../../components/admin/MediaUploader";

type Tab = "overview" | "bookings" | "services" | "staff" | "settings" | "preview";
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
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
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
      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
      />
    </div>
  );
}

// ─── Gamification & Psychology Components ─────────────────────────────────────
function HealthScoreCard({ score, isComplete, salon, stats }: { score: number, isComplete: boolean, salon: any, stats: any }) {
  // Logic for smart growth suggestions
  const suggestions = [];
  if (salon?.images?.length < 3) {
    suggestions.push("Add 5 more service photos to increase profile clicks by 32%");
  }
  if (!salon?.timings?.toLowerCase().includes("sun")) {
    suggestions.push("Enable weekend timings to get more bookings");
  }
  if (salon?.services?.length < 5) {
    suggestions.push("Add top services trending in your area");
  }
  if (suggestions.length === 0) {
    suggestions.push("Offer a first-time discount to double your conversion rate");
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <span className="material-icons-round text-[160px] text-pink-500">health_and_safety</span>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 relative z-10">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
            <motion.circle 
              cx="50" cy="50" r="40" stroke="url(#score-gradient)" strokeWidth="8" fill="none" 
              strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * score) / 100}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white leading-none">{score}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/100</span>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-white mb-1">Salon Health Score</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Based on profile completion, photos, reviews, response time, and active booking status.
          </p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative z-10">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-icons-round text-[18px] text-pink-400">auto_awesome</span>
          Smart Growth Suggestions
        </h3>
        <ul className="space-y-3">
          {suggestions.slice(0, 2).map((sugg, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <div className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-pink-500/20 transition-colors">
                <span className="material-icons-round text-[14px]">insights</span>
              </div>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">{sugg}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FirstBookingMotivation({ salon, onTabSwitch }: { salon: any, onTabSwitch: (t: Tab) => void }) {
  const tasks = [
    { label: "Add 5 photos", done: salon?.images?.length > 4 },
    { label: "Add 10 services", done: salon?.services?.length > 9 },
    { label: "Enable instant booking", done: true }, // Mocked for psychology
    { label: "Add opening offers", done: false } // Mocked for psychology
  ];
  return (
    <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-3xl p-6 relative overflow-hidden shadow-xl">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
          <span className="material-icons-round text-white text-[24px]">rocket_launch</span>
        </div>
        <div>
          <h3 className="text-lg font-black text-white">Get your first booking faster</h3>
          <p className="text-pink-400 text-xs font-bold">87% chance to rank higher on GLVIA</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {tasks.map((task, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${task.done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500'}`}>
              {task.done ? <span className="material-icons-round text-[12px]">check</span> : null}
            </div>
            <span className={`text-sm ${task.done ? 'text-slate-300 line-through opacity-70' : 'text-slate-200 font-medium'}`}>{task.label}</span>
          </div>
        ))}
      </div>
      <button onClick={() => onTabSwitch("services")} className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors border border-white/10">
        Review Checklist
      </button>
    </div>
  );
}

function AchievementsCard({ salon, stats }: { salon: any, stats: any }) {
  const badges = [
    { id: 'verified', label: "Verified Salon", icon: "verified", active: salon?.status === "approved", color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/30" },
    { id: 'top_rated', label: "Top Rated", icon: "star", active: salon?.rating >= 4.5, color: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/30" },
    { id: 'fast_response', label: "Fast Response", icon: "bolt", active: true, color: "from-blue-400 to-indigo-500", shadow: "shadow-blue-500/30" }, // Mock active
    { id: 'premium', label: "Premium Partner", icon: "diamond", active: stats?.totalBookings > 20, color: "from-fuchsia-400 to-pink-500", shadow: "shadow-pink-500/30" }
  ];

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-1">Achievement Badges</h3>
      <p className="text-slate-400 text-xs mb-6">Unlock badges to increase customer trust.</p>
      
      <div className="grid grid-cols-2 gap-4">
        {badges.map(b => (
          <div key={b.id} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${b.active ? 'bg-white/[0.05] border-white/10' : 'bg-white/[0.02] border-white/5 opacity-50 grayscale'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${b.active ? `bg-gradient-to-br ${b.color} shadow-lg ${b.shadow} text-white` : 'bg-white/10 text-slate-500'}`}>
              <span className="material-icons-round text-[24px]">{b.icon}</span>
            </div>
            <span className="text-xs font-bold text-center text-slate-300">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialProofCard() {
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-blue-600/10 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/40 transition-colors shadow-xl">
      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
        <span className="material-icons-round text-[20px]">groups</span>
      </div>
      <h4 className="font-bold text-white mb-3">Community Growth</h4>
      <div className="space-y-3 mb-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Joined this week</span>
          <span className="text-white font-bold">+12 Salons</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Top city earners</span>
          <span className="text-emerald-400 font-bold">₹45,000/mo</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-indigo-300 font-medium">You're in the top 30% of new salons! Keep it up.</p>
      </div>
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
  const completedCount = steps.filter(s => s.done).length;
  const percentage = Math.round((completedCount / steps.length) * 100);
  const isComplete = completedCount === steps.length;

  if (!isComplete) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress & Checklist Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <span className="material-icons-round text-[160px] text-pink-500">trending_up</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Setup Completion Progress</h2>
            <p className="text-pink-400 font-bold mb-6 text-sm sm:text-base">Your Salon Profile is {percentage}% Complete</p>
            
            <div className="w-full bg-white/5 rounded-full h-3 mb-10 overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 relative z-10">
              {steps.map((item, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${item.done ? 'bg-white/[0.02] border-white/10 shadow-inner' : 'bg-white/[0.05] border-white/5 opacity-70'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-slate-500'}`}>
                    {item.done ? <span className="material-icons-round text-[14px]">check</span> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                  </div>
                  <span className={`font-semibold text-sm ${item.done ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
                </div>
              ))}
            </div>

            <button onClick={onStartWizard} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white font-bold text-sm shadow-xl shadow-pink-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 group">
              Continue Setup <span className="material-icons-round text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Unlock Psychology Column */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-1">Complete setup to unlock:</h3>
            <p className="text-slate-400 text-xs mb-6">Get these premium features instantly.</p>
            
            <ul className="space-y-4">
              {[
                "Receive Bookings",
                "Appear in Search",
                "Premium Visibility",
                "Staff Management",
                "Earnings Dashboard"
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-500 shadow-inner group-hover:bg-slate-700 transition-colors">
                    <span className="material-icons-round text-[14px]">lock</span>
                  </div>
                  <span className="text-sm font-medium text-slate-400">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Smart Reminder Card */}
          <div className="bg-gradient-to-br from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-3xl p-6 relative overflow-hidden group hover:border-pink-500/40 transition-colors shadow-xl">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-[20px]">notifications_active</span>
            </div>
            <h4 className="font-bold text-white mb-2">Start receiving bookings</h4>
            <ul className="space-y-2 mb-6">
              <li className="flex gap-2 text-xs text-slate-300"><span className="text-pink-400">✓</span> Get discovered by nearby customers</li>
              <li className="flex gap-2 text-xs text-slate-300"><span className="text-pink-400">✓</span> Receive automatic appointments</li>
              <li className="flex gap-2 text-xs text-slate-300"><span className="text-pink-400">✓</span> Build trust with reviews</li>
            </ul>
            <button onClick={onStartWizard} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors border border-white/10">
              Complete Setup →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If complete, show normal overview BUT with a "Success Psychology" header at the top
  const getHealthScore = () => {
    let score = 20; // Base score for being complete
    if (salon?.images?.length > 1) score += 20;
    if (salon?.services?.length > 3) score += 20;
    if (stats?.totalReviews > 0) score += 10;
    if (stats?.activeStaff > 0) score += 10;
    if (stats?.totalBookings > 0) score += 20;
    return Math.min(score, 100);
  };
  const healthScore = getHealthScore();

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute -top-10 -right-10 opacity-10 blur-2xl w-40 h-40 bg-emerald-500 rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 flex-shrink-0 relative">
            <span className="material-icons-round text-[40px] text-white">verified</span>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 border-2 border-slate-900 rounded-full w-8 h-8 flex items-center justify-center text-[10px] font-bold text-emerald-400">100%</div>
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-black text-white mb-1">Your salon is now LIVE on GLVIA ✨</h2>
            <p className="text-emerald-400 text-sm font-bold mb-3">Profile Completion: 100% — Estimated Visibility Boost: 3x</p>
            <p className="text-slate-400 text-xs max-w-lg">Next recommended action: Add your top staff members and set up your full service menu to attract more customers.</p>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
             <button onClick={() => onTabSwitch("services")} className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors border border-white/10 group flex justify-center items-center gap-2">
               Start Growing <span className="material-icons-round text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
             </button>
          </div>
        </div>
      </motion.div>

      {/* Gamification & Growth Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <HealthScoreCard score={healthScore} isComplete={isComplete} salon={salon} stats={stats} />
            {(stats?.totalBookings === 0 || !stats) && <FirstBookingMotivation salon={salon} onTabSwitch={onTabSwitch} />}
         </div>
         <div className="space-y-6">
            <AchievementsCard salon={salon} stats={stats} />
            <SocialProofCard />
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={statsLoading ? "—" : stats?.totalBookings ?? 0} icon="calendar_month" gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <StatCard label="Today Revenue" value={statsLoading ? "—" : `₹${stats?.dailyRevenue ?? 0}`} icon="payments" gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard label="Active Staff" value={statsLoading ? "—" : stats?.activeStaff ?? 0} icon="badge" gradient="bg-gradient-to-br from-purple-500 to-violet-600" />
        <StatCard label="Cancellations" value={statsLoading ? "—" : stats?.cancellationRate ?? "0%"} icon="cancel" gradient="bg-gradient-to-br from-rose-500 to-pink-600" />
      </div>

      {/* Total revenue highlight */}
      <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/20 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Lifetime Revenue</p>
            <h2 className="text-4xl font-extrabold text-white">₹{statsLoading ? "—" : stats?.totalRevenue?.toLocaleString() ?? 0}</h2>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-500/20">
            <span className="material-icons-round text-white text-[28px]">trending_up</span>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white/[0.03] border border-white/8 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recent Appointments</h3>
          <button onClick={() => onTabSwitch("bookings")} className="text-sm font-bold text-pink-400 hover:text-pink-300 transition-colors">
            View All →
          </button>
        </div>
        {statsLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (stats?.recentBookings?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <span className="material-icons-round text-4xl text-slate-700 mb-3">event_busy</span>
            <p className="text-slate-500 text-sm">No bookings yet</p>
            <p className="text-slate-600 text-xs mt-1">Bookings from the app will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Service</th>
                  <th className="px-6 py-3 text-left">Date / Time</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentBookings.map((b: any, i: number) => (
                  <tr key={b.id || i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-white">
                          {(b.customerName || "G").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-white">{b.customerName || "Guest"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-[160px] truncate">
                      {b.services?.[0]?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-400">{b.date}</p>
                      <p className="text-xs text-slate-600">{b.timeSlot}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-white">₹{b.totalAmount}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
    <div className="space-y-5">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === f.value
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20"
                : "bg-white/[0.05] text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-icons-round text-5xl text-slate-700 mb-4">event_available</span>
          <p className="text-slate-400">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b: any) => (
            <div key={b.id} className="bg-white/[0.03] border border-white/8 rounded-3xl p-5 hover:bg-white/[0.05] transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-white">
                      {(b.customerName || "G").charAt(0).toUpperCase()}
                    </div>
                    <h4 className="font-bold text-white text-sm">{b.customerName || "Guest"}</h4>
                  </div>
                  {b.customerPhone && <p className="text-xs text-slate-500 ml-10">{b.customerPhone}</p>}
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 ml-10">
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Date & Time</p>
                  <p className="text-sm text-slate-300">{b.date} · {b.timeSlot}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Amount</p>
                  <p className="text-sm font-bold text-white">₹{b.totalAmount}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Services</p>
                  <p className="text-sm text-slate-300">{b.services?.map((s: any) => s.name).join(", ") || "—"}</p>
                </div>
              </div>

              {/* Status Actions */}
              {b.status !== "completed" && b.status !== "cancelled" && (
                <div className="flex gap-2 ml-10 flex-wrap">
                  {b.status === "pending" && (
                    <button
                      onClick={() => handleStatus(b.id, "confirmed")}
                      disabled={updatingId === b.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  )}
                  {b.status === "confirmed" && (
                    <button
                      onClick={() => handleStatus(b.id, "completed")}
                      disabled={updatingId === b.id}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/15 text-blue-400 text-xs font-bold border border-blue-500/20 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
                    >
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => handleStatus(b.id, "cancelled")}
                    disabled={updatingId === b.id}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  {updatingId === b.id && <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin self-center" />}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
        category: form.category,
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
          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Gender</label>
          <select
            value={form.gender}
            onChange={(e: any) => setForm(p => ({ ...p, gender: e.target.value }))}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-pink-500/60 transition-all"
          >
            <option value="female" className="bg-slate-900">Female</option>
            <option value="male" className="bg-slate-900">Male</option>
          </select>
        </div>
      </div>
      <Input label="Category" value={form.category} onChange={(e: any) => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g., Hair Cut & Style" />
      <MediaUploader
        label="Service Image (optional)"
        value={form.image}
        onChange={(url) => setForm(p => ({ ...p, image: url }))}
        folder="services"
      />
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
        <textarea
          value={form.description}
          onChange={(e: any) => setForm(p => ({ ...p, description: e.target.value }))}
          rows={2}
          placeholder="Brief description of this service..."
          className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all resize-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || !form.name.trim() || !form.price}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <>{modal === "edit" ? "Update Service" : "Add Service"}</>}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-slate-400">{services.length} service{services.length !== 1 ? "s" : ""} configured</h3>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:opacity-90 transition-opacity">
          <span className="material-icons-round text-[18px]">add</span>Add Service
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-icons-round text-5xl text-slate-700 mb-4">spa</span>
          <p className="text-slate-400 mb-2">No services added yet</p>
          <button onClick={openAdd} className="text-sm text-pink-400 font-bold">+ Add your first service</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((svc: any) => (
            <div key={svc.id} className="bg-white/[0.03] border border-white/8 rounded-3xl p-4 flex gap-3 hover:bg-white/[0.06] transition-all group">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800">
                {svc.image ? (
                  <div className="relative w-full h-full"><Image src={svc.image} alt={svc.name} fill className="object-cover" /></div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-icons-round text-slate-600">spa</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm truncate">{svc.name}</h4>
                    <p className="text-xs text-slate-500">{svc.category} · {svc.duration} min · <span className="capitalize">{svc.gender}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-base font-extrabold text-white">₹{svc.price}</span>
                  {svc.old_price && <span className="text-xs text-slate-600 line-through">₹{svc.old_price}</span>}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(svc)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-pink-400 transition-colors font-semibold">
                    <span className="material-icons-round text-[14px]">edit</span>Edit
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    disabled={deleteId === svc.id}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors font-semibold"
                  >
                    {deleteId === svc.id
                      ? <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      : <span className="material-icons-round text-[14px]">delete</span>}
                    {deleteId === svc.id ? "Deleting…" : "Delete"}
                  </button>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-slate-400">{staff.length} staff member{staff.length !== 1 ? "s" : ""}</h3>
        <button
          onClick={() => { setForm({ name: "", role: "Stylist" }); setModal("add"); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:opacity-90 transition-opacity"
        >
          <span className="material-icons-round text-[18px]">person_add</span>Add Staff
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-icons-round text-5xl text-slate-700 mb-4">people</span>
          <p className="text-slate-400 mb-2">No staff added yet</p>
          <button onClick={() => { setForm({ name: "", role: "Stylist" }); setModal("add"); }} className="text-sm text-pink-400 font-bold">+ Add your first staff member</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {staff.map((member: any) => (
            <div key={member.id} className="bg-white/[0.03] border border-white/8 rounded-3xl p-5 hover:bg-white/[0.06] transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{member.name}</h4>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </div>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${member.is_available ? "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/50" : "bg-slate-600"}`} />
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle availability */}
                <button
                  onClick={() => handleToggle(member)}
                  disabled={togglingId === member.id}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    member.is_available
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "border-slate-700 bg-white/5 text-slate-400 hover:border-pink-500/30"
                  }`}
                >
                  {togglingId === member.id
                    ? <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                    : <span className="material-icons-round text-[14px]">{member.is_available ? "check_circle" : "radio_button_unchecked"}</span>}
                  {member.is_available ? "Available" : "Unavailable"}
                </button>

                <button
                  onClick={() => { setSelected(member); setForm({ name: member.name, role: member.role }); setModal("edit"); }}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-pink-400 hover:border-pink-500/30 transition-colors"
                >
                  <span className="material-icons-round text-[16px]">edit</span>
                </button>

                <button
                  onClick={() => handleDelete(member.id)}
                  disabled={deletingId === member.id}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-50"
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
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Role</label>
              <select
                value={form.role}
                onChange={(e: any) => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-pink-500/60 transition-all"
              >
                {["Stylist", "Senior Stylist", "Beautician", "Nail Tech", "Makeup Artist", "Receptionist", "Manager"].map(r => (
                  <option key={r} value={r} className="bg-slate-900">{r}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="w-8 h-8 border-3 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  const field = (key: string, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={form[key] || ""}
          onChange={(e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
          rows={3}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[key] || ""}
          onChange={(e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold px-4 py-3 rounded-2xl flex items-center gap-2">
          <span className="material-icons-round text-[18px]">check_circle</span>
          Salon profile updated successfully!
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-icons-round text-[18px] text-pink-400">store</span>Basic Information
        </h3>
        {field("name", "Salon Name", "text", "My Salon Name")}
        {field("description", "Description", "textarea", "Brief description of your salon...")}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("contact_phone", "Phone Number", "tel", "+91 98765 43210")}
          {field("contact_email", "Email Address", "email", "salon@email.com")}
          {field("price_range", "Price Range", "text", "₹99 - ₹2999")}
        </div>
      </div>

      {/* Address */}
      <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-icons-round text-[18px] text-pink-400">location_on</span>Address & Map
        </h3>
        {field("address_street", "Street Address", "text", "123 Main Street, Area")}
        <div className="grid grid-cols-2 gap-4">
          {field("address_city", "City", "text", "City")}
          {field("address_state", "State", "text", "State")}
        </div>
        {field("google_map_url", "Google Maps URL", "url", "https://maps.google.com/...")}
      </div>

      {/* Timings */}
      <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-icons-round text-[18px] text-pink-400">schedule</span>Working Hours
        </h3>
        {field("timings", "Timings (JSON or text)", "textarea", 'e.g., {"Mon-Sat": "9 AM – 8 PM", "Sun": "10 AM – 6 PM"}')}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20 hover:opacity-90 transition-opacity"
      >
        {saving ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><span className="material-icons-round text-[18px]">save</span>Save Changes</>}
      </button>
    </div>
  );
}

// ─── Preview Tab ──────────────────────────────────────────────────────────────
function PreviewTab({ salonId }: { salonId: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-3xl overflow-hidden h-[80vh] relative shadow-2xl flex flex-col">
      <div className="bg-slate-900 border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
        </div>
        <div className="bg-slate-800/80 px-4 py-1.5 rounded-full flex items-center gap-2 max-w-sm w-full mx-auto justify-center">
          <span className="material-icons-round text-[14px] text-slate-500">lock</span>
          <span className="text-xs text-slate-400 font-mono truncate">glvia.com/salon/{salonId}</span>
        </div>
        <a href={`/salon/${salonId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 font-semibold transition-colors">
          Open in New Tab<span className="material-icons-round text-[14px]">open_in_new</span>
        </a>
      </div>
      <div className="flex-1 bg-white relative">
        {/* Iframe renders the exact customer view without surrounding layout */}
        <iframe 
          src={`/salon/${salonId}`} 
          className="w-full h-full border-none"
          title="Salon Preview"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
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

  // Only allow Super Admins to use query params. 
  // Salon Owners MUST use their linked salon_id.
  const salonId = (isSalonOwner ? admin?.salon_id : (isAdmin ? querySalonId || admin?.salon_id : "")) ?? "";
  const { data: salon, isLoading: salonLoading } = useSalon(salonId);
  const { data: stats, isLoading: statsLoading } = useSalonOwnerStats(salonId || undefined);
  const [showWizard, setShowWizard] = useState(false);
  const isSalonIncomplete = !!salon && (salon.name === "My Salon" || !salon.address_city);

  if (showWizard) {
    return <SalonOnboardingWizard salonId={salonId} initialData={salon} onComplete={() => setShowWizard(false)} />;
  }


  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "bookings", label: "Bookings", icon: "event" },
    { id: "services", label: "Services", icon: "spa" },
    { id: "staff", label: "Staff", icon: "people" },
    { id: "settings", label: "Settings", icon: "settings" },
    { id: "preview", label: "Preview", icon: "visibility" },
  ];

  if (!salonId) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-5">
        <div className="text-center p-8 max-w-sm w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl">
          <span className="material-icons-round text-6xl text-slate-600 mb-5 block">store_mall_directory</span>
          <h2 className="text-xl font-bold text-white mb-3">
            {isAdmin ? "Admin Preview Mode" : "No Salon Linked"}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {isAdmin 
              ? "Please select a salon from the Admin Panel to access its full dashboard." 
              : "Your account is not linked to any salon yet. Please complete registration or contact support."}
          </p>
          {isAdmin ? (
            <a href="/admin/salons" className="inline-flex items-center justify-center gap-2 w-full py-3 bg-pink-500 hover:bg-pink-400 text-white rounded-xl font-bold text-sm transition-colors">
              <span className="material-icons-round text-[18px]">admin_panel_settings</span>
              Go to Admin Panel
            </a>
          ) : (
            <a href="/salon-owner/register" className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-sm transition-colors border border-white/10">
              Complete Registration
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-white/8">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <span className="material-icons-round text-white text-[20px]">content_cut</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 font-medium">Salon Manager</p>
              <h1 className="text-sm font-extrabold text-white leading-none">{admin?.name || "Owner"}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">Live</span>
            </div>
            <button
              onClick={logout}
              className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
              title="Logout"
            >
              <span className="material-icons-round text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="sticky top-[73px] z-30 bg-slate-950/80 backdrop-blur-2xl border-b border-white/8">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/20"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                <span className="material-icons-round text-[16px]">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-5 py-6 pb-24">
        {/* Role badge */}
        {isAdmin && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <span className="material-icons-round text-purple-400 text-[14px]">admin_panel_settings</span>
            <span className="text-xs text-purple-400 font-bold">Admin View</span>
          </div>
        )}

        {activeTab === "overview" && <OverviewTab salon={salon} salonId={salonId} stats={stats} statsLoading={statsLoading} onStartWizard={() => setShowWizard(true)} onTabSwitch={setActiveTab} />}
        {activeTab === "bookings" && <BookingsTab salonId={salonId} />}
        {activeTab === "services" && <ServicesTab salonId={salonId} />}
        {activeTab === "staff" && <StaffTab salonId={salonId} />}
        {activeTab === "settings" && <SettingsTab salonId={salonId} />}
        {activeTab === "preview" && <PreviewTab salonId={salonId} />}
      </main>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
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
