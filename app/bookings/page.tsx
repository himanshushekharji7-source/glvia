"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { useMyBookings, useUpdateBookingStatus, useRescheduleBooking } from "../lib/hooks";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Pending" },
  confirmed: { bg: "bg-green-500/10", text: "text-green-600", label: "Confirmed" },
  completed: { bg: "bg-blue-500/10", text: "text-blue-600", label: "Completed" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-600", label: "Cancelled" },
};

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "2:00 PM",
  "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM",
];

const dates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    full: d.toISOString().split("T")[0],
  };
});

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const { data: bookings, isLoading, isError } = useMyBookings();
  const updateStatus = useUpdateBookingStatus();
  const reschedule = useRescheduleBooking();

  const [cancelModal, setCancelModal] = useState<string | null>(null);
  
  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(dates[0].full);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");

  const filteredBookings = bookings?.filter((b: any) => {
    const status = (b.status || 'pending').toLowerCase();
    const isPast = status === "completed" || status === "cancelled";
    return activeTab === "upcoming" ? !isPast : isPast;
  }) || [];

  const handleCancel = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'cancelled' });
      setCancelModal(null);
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleModal) return;
    try {
      await reschedule.mutateAsync({ 
        id: rescheduleModal.id, 
        date: selectedDate, 
        timeSlot: selectedTime 
      });
      setRescheduleModal(null);
      alert("Booking rescheduled successfully!");
    } catch (err) {
      alert("Failed to reschedule.");
    }
  };

  const isActionAllowed = (dateStr: string, timeStr: string) => {
    const now = new Date();
    // Parse time like "10:30 AM"
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    
    const bookingDate = new Date(`${dateStr}T${h.toString().padStart(2, '0')}:${minutes}:00`);
    
    // Check if current time is BEFORE the booking time
    return now < bookingDate;
  };

  return (
    <div className="min-h-dvh bg-surface-card pb-nav relative">
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

      <div className="px-5 pt-4 space-y-3 stagger pb-8">
        {isLoading ? (
           <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
           </div>
        ) : isError ? (
          <div className="py-12 text-center text-error">
             <span className="material-icons-round text-4xl mb-2">error_outline</span>
             <p className="font-bold">Failed to load bookings</p>
          </div>
        ) : filteredBookings.map((booking: any, i: number) => {
          const statusVal = (booking.status || 'pending').toLowerCase();
          const status = statusConfig[statusVal] || statusConfig.pending;
          const allowed = isActionAllowed(booking.date, booking.timeSlot);

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
                    <h3 className="text-[14px] font-bold text-text-primary truncate">{booking.salonId?.name || "Glivaji Salon"}</h3>
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
                    <span className="text-[13px] font-bold text-text-primary ml-auto">₹{booking.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Ref ID Badge */}
              {booking.bookingReference && (
                <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg py-1.5 px-3 flex justify-between items-center">
                   <span className="text-[11px] text-gray-500 font-medium">Reference ID</span>
                   <span className="text-[12px] font-mono font-bold text-gray-800">{booking.bookingReference}</span>
                </div>
              )}

              {statusVal === "confirmed" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button 
                    onClick={() => setRescheduleModal(booking)}
                    disabled={!allowed || updateStatus.isPending}
                    className="btn-ghost flex-1 text-[12px] py-2 disabled:opacity-50"
                  >
                    <span className="material-icons-round text-[14px]">edit</span>
                    Reschedule
                  </button>
                  <button 
                    onClick={() => setCancelModal(booking._id)}
                    disabled={!allowed || updateStatus.isPending}
                    className="btn-ghost flex-1 text-[12px] py-2 !text-error disabled:opacity-50"
                  >
                    <span className="material-icons-round text-[14px]">close</span>
                    Cancel
                  </button>
                  <Link href={`/bookings/${booking._id}`} className="flex-1">
                    <button className="btn-primary w-full text-[12px] py-2 !px-2 bg-black text-white hover:bg-gray-800">
                      View Details
                    </button>
                  </Link>
                </div>
              )}

              {statusVal !== "confirmed" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Link href={`/bookings/${booking._id}`} className="flex-1">
                    <button className="btn-ghost border border-gray-200 w-full text-[12px] py-2 !px-2">
                      View Receipt
                    </button>
                  </Link>
                  {statusVal === "completed" && (
                    <button className="btn-primary w-full text-[12px] py-2 !px-2 flex-1">
                      Book Again
                    </button>
                  )}
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
            <h3 className="text-lg font-bold text-text-primary mb-1">No {activeTab} bookings</h3>
            <p className="text-sm text-text-secondary text-center">Start exploring salons and book your first appointment</p>
            <Link href="/search" className="mt-4"><button className="btn-primary">Find Salons</button></Link>
          </div>
        )}
      </div>

      <BottomNav />

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-scaleIn">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons-round text-3xl">warning_amber</span>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Cancel Booking?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)} className="flex-1 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl active:scale-95 transition-transform">
                Keep It
              </button>
              <button 
                onClick={() => handleCancel(cancelModal)} 
                disabled={updateStatus.isPending}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl active:scale-95 transition-transform flex justify-center items-center"
              >
                {updateStatus.isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md shadow-2xl animate-slideUp sm:animate-scaleIn h-[80vh] sm:h-auto overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Reschedule Booking</h3>
              <button onClick={() => setRescheduleModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <span className="material-icons-round text-[20px]">close</span>
              </button>
            </div>
            
            {/* Date Selection */}
            <section className="mb-6">
              <h2 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
                <span className="material-icons-round text-[18px] text-[#ec4899]">calendar_today</span>
                Select New Date
              </h2>
              <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                {dates.map((d) => (
                  <button
                    key={d.full}
                    onClick={() => setSelectedDate(d.full)}
                    className={`flex flex-col items-center min-w-[64px] py-3 px-2 rounded-2xl border transition-all shrink-0 ${
                      selectedDate === d.full
                        ? "bg-gradient-to-r from-[#e11d48] to-[#ec4899] text-white border-transparent shadow-md"
                        : "border-gray-200 bg-white text-gray-800"
                    }`}
                  >
                    <span className={`text-[10px] font-medium ${selectedDate === d.full ? "text-white/80" : "text-gray-500"}`}>
                      {d.day}
                    </span>
                    <span className="text-xl font-bold mt-0.5">{d.date}</span>
                    <span className={`text-[10px] font-medium ${selectedDate === d.full ? "text-white/80" : "text-gray-500"}`}>
                      {d.month}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Time Selection */}
            <section className="mb-8">
              <h2 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-2">
                <span className="material-icons-round text-[18px] text-[#ec4899]">schedule</span>
                Select New Time
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-xl text-[13px] font-bold border transition-all ${
                      selectedTime === time
                        ? "bg-gradient-to-r from-[#e11d48] to-[#ec4899] text-white border-transparent shadow-sm"
                        : "border-gray-200 text-gray-600 bg-gray-50 hover:border-pink-300"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </section>

            <button 
              onClick={handleReschedule}
              disabled={reschedule.isPending}
              className="w-full py-4 bg-black text-white font-bold text-[16px] rounded-2xl shadow-lg active:scale-95 transition-transform flex justify-center items-center"
            >
              {reschedule.isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm New Slot"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
