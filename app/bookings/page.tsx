"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { useMyBookings } from "../lib/hooks";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Pending" },
  confirmed: { bg: "bg-success/10", text: "text-success", label: "Confirmed" },
  completed: { bg: "bg-primary/10", text: "text-primary", label: "Completed" },
  cancelled: { bg: "bg-error/10", text: "text-error", label: "Cancelled" },
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const { data: bookings, isLoading, isError } = useMyBookings();

  const filteredBookings = bookings?.filter((b: any) => {
    const isPast = b.status === "completed" || b.status === "cancelled";
    return activeTab === "upcoming" ? !isPast : isPast;
  }) || [];

  return (
    <div className="min-h-dvh bg-surface-card pb-nav">
      <div className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-xl border-b border-border px-5 py-3">
        <h1 className="text-lg font-bold text-text-primary mb-3">My Bookings</h1>
        <div className="tab-bar">
          <button onClick={() => setActiveTab("upcoming")} className={`tab-item ${activeTab === "upcoming" ? "active" : ""}`}>
            Upcoming
          </button>
          <button onClick={() => setActiveTab("past")} className={`tab-item ${activeTab === "past" ? "active" : ""}`}>
            Past
          </button>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3 stagger">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="w-full h-32 bg-border/20 rounded-2xl animate-pulse" />
          ))
        ) : isError ? (
          <div className="py-12 text-center text-error">
             <span className="material-icons-round text-4xl mb-2">error_outline</span>
             <p className="font-bold">Failed to load bookings</p>
          </div>
        ) : filteredBookings.map((booking: any, i: number) => {
          const status = statusConfig[booking.status] || statusConfig.pending;
          return (
            <div
              key={booking._id}
              className="p-4 rounded-2xl border border-border animate-fadeInUp hover:shadow-sm transition-all"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-dim">
                  <div 
                    className="w-full h-full bg-cover bg-center" 
                    style={{ backgroundImage: `url(${booking.salonId?.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop'})` }} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="text-[14px] font-bold text-text-primary truncate">{booking.salonId?.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-text-secondary mt-0.5 truncate">
                    {booking.services?.map((s: any) => s.name).join(", ")}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[12px] text-text-tertiary flex items-center gap-1">
                      <span className="material-icons-round text-[12px]">calendar_today</span>
                      {new Date(booking.date).toLocaleDateString()}
                    </span>
                    <span className="text-[12px] text-text-tertiary flex items-center gap-1">
                      <span className="material-icons-round text-[12px]">schedule</span>
                      {booking.timeSlot}
                    </span>
                    <span className="text-[13px] font-bold text-text-primary ml-auto">${booking.totalAmount}</span>
                  </div>
                </div>
              </div>

              {booking.status === "confirmed" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button className="btn-ghost flex-1 text-[12px] py-2">
                    <span className="material-icons-round text-[14px]">edit</span>
                    Reschedule
                  </button>
                  <button className="btn-ghost flex-1 text-[12px] py-2 !text-error">
                    <span className="material-icons-round text-[14px]">close</span>
                    Cancel
                  </button>
                  <Link href={`/salon/${booking.salonId?._id}`} className="flex-1">
                    <button className="btn-primary w-full text-[12px] py-2 !px-2">
                      View Details
                    </button>
                  </Link>
                </div>
              )}

              {booking.status === "completed" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button className="btn-ghost flex-1 text-[12px] py-2">
                    <span className="material-icons-round text-[14px]">rate_review</span>
                    Review
                  </button>
                  <Link href={`/salon/${booking.salonId?._id}`} className="flex-1">
                    <button className="btn-primary w-full text-[12px] py-2 !px-2">
                      Book Again
                    </button>
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {!isLoading && filteredBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-surface-dim flex items-center justify-center mb-4">
              <span className="material-icons-round text-[36px] text-text-tertiary">event_busy</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">No bookings yet</h3>
            <p className="text-sm text-text-secondary text-center">Start exploring salons and book your first appointment</p>
            <Link href="/search" className="mt-4"><button className="btn-primary">Find Salons</button></Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
