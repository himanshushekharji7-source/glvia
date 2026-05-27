"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import axios from "axios";
import Image from "next/image";
import { supabase, TABLES } from "../lib/supabase";
import { useMyBookings, useUpdateBookingStatus, useRescheduleBooking, useSubmitReview } from "../lib/hooks";

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

  // Verified Customer Review Composability State
  const [reviewModal, setReviewModal] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const submitReview = useSubmitReview();

  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    
    setUploadingImage(true);
    try {
      const res = await axios.post("/api/media", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        const fileUrl = res.data.file.url;
        setReviewImages(prev => [...prev, fileUrl]);
        showToast("Photo attached successfully!");
      } else {
        alert("Upload failed: " + res.data.error);
      }
    } catch (error: any) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewModal) return;
    try {
      const firebaseUid = localStorage.getItem("token") || "";
      let customerId = "";
      try {
        const { data: usr } = await supabase
          .from(TABLES.USERS)
          .select("id")
          .eq("firebase_uid", firebaseUid)
          .single();
        if (usr) customerId = usr.id;
      } catch (e) {
        console.error(e);
      }

      await submitReview.mutateAsync({
        booking_id: reviewModal.id || reviewModal._id,
        salon_id: reviewModal.salonId?._id || reviewModal.salonId,
        customer_id: customerId || undefined,
        service_id: reviewModal.services?.[0]?.id || null,
        rating: reviewRating,
        review_text: reviewText,
        images: reviewImages,
        is_verified_booking: true
      });

      alert("Review submitted successfully! Thank you.");
      setReviewModal(null);
      setReviewText("");
      setReviewImages([]);
      setReviewRating(5);
    } catch (err: any) {
      alert("Failed to submit review: " + err.message);
    }
  };

  // Toast helper for profile
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

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
    if (!dateStr || !timeStr) return false;
    try {
      const now = new Date();
      // Parse time like "10:30 AM"
      const parts = timeStr.split(' ');
      if (parts.length !== 2) return false;
      
      const [time, period] = parts;
      const timeParts = time.split(':');
      if (timeParts.length !== 2) return false;
      
      const [hours, minutes] = timeParts;
      let h = parseInt(hours);
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      
      const bookingDate = new Date(`${dateStr}T${h.toString().padStart(2, '0')}:${minutes}:00`);
      if (isNaN(bookingDate.getTime())) return false;
      
      // Check if current time is BEFORE the booking time
      return now < bookingDate;
    } catch (e) {
      return false;
    }
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
                    {Array.isArray(booking.services) ? booking.services.map((s: any) => s.name).join(", ") : "Salon Service"}
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
                <div className="mt-3 bg-surface-dim border border-border rounded-lg py-1.5 px-3 flex justify-between items-center">
                   <span className="text-[11px] text-text-secondary font-medium">Reference ID</span>
                   <span className="text-[12px] font-mono font-bold text-text-primary">{booking.bookingReference}</span>
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
                    <button className="btn-ghost border border-border w-full text-[12px] py-2 !px-2">
                      View Receipt
                    </button>
                  </Link>
                  {statusVal === "completed" && (
                    <div className="flex gap-2 w-full flex-1">
                      <button 
                        onClick={() => {
                          setReviewModal(booking);
                          setReviewRating(5);
                          setReviewText("");
                          setReviewImages([]);
                        }}
                        className="btn-primary flex-1 text-[11px] py-2 !px-2 bg-gradient-to-r from-[#e11d48] to-[#ec4899] text-white font-extrabold flex items-center justify-center gap-1 shadow-pink"
                      >
                        <span className="material-icons-round text-[13px]">rate_review</span>
                        Leave Review
                      </button>
                      <button className="btn-ghost border border-border flex-1 text-[11px] py-2 !px-2 text-text-secondary font-bold">
                        Book Again
                      </button>
                    </div>
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
            <h3 className="text-xl font-bold text-center text-text-primary mb-2">Cancel Booking?</h3>
            <p className="text-sm text-text-secondary text-center mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)} className="flex-1 py-3 bg-surface-dim text-text-primary font-bold rounded-xl active:scale-95 transition-transform">
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
              <h3 className="text-xl font-bold text-text-primary">Reschedule Booking</h3>
              <button onClick={() => setRescheduleModal(null)} className="w-8 h-8 bg-surface-dim rounded-full flex items-center justify-center text-text-secondary">
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
                        : "border-border bg-surface-card text-text-primary"
                    }`}
                  >
                    <span className={`text-[10px] font-medium ${selectedDate === d.full ? "text-white/80" : "text-text-tertiary"}`}>
                      {d.day}
                    </span>
                    <span className="text-xl font-bold mt-0.5">{d.date}</span>
                    <span className={`text-[10px] font-medium ${selectedDate === d.full ? "text-white/80" : "text-text-tertiary"}`}>
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
                        : "border-border text-text-secondary bg-surface-dim hover:border-primary/30"
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
      {/* Leaves Review Sheet / Bottom Drawer */}
      {reviewModal && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md shadow-2xl animate-slideUp sm:animate-scaleIn h-[85vh] sm:h-auto overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                <h3 className="text-base font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-icons-round text-[#ec4899]">rate_review</span>
                  Leave Verified Review
                </h3>
                <button onClick={() => setReviewModal(null)} className="w-8 h-8 bg-surface-dim rounded-full flex items-center justify-center text-text-secondary">
                  <span className="material-icons-round text-[20px]">close</span>
                </button>
              </div>

              {/* Verified Visit Summary */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 mb-5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <span className="material-icons-round text-[18px]">verified</span>
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-800 uppercase tracking-wide">Verified Booking</div>
                  <div className="text-sm font-bold text-text-primary mt-0.5">{reviewModal.salonId?.name || "Glivaji Salon"}</div>
                  <div className="text-[10px] text-text-secondary mt-0.5">
                    {reviewModal.services?.[0]?.name || "Salon Service"} • Visited on {reviewModal.date}
                  </div>
                </div>
              </div>

              {/* Star rating selector */}
              <div className="mb-5 text-center">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-2.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400 active:scale-125 transition-transform"
                    >
                      <span className="material-icons-round text-3xl">
                        {star <= reviewRating ? "star" : "star_border"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text comment */}
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                  Share Your Experience
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you like or dislike? How was the service, staff cleanliness, etc.?"
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-dim border border-border rounded-2xl text-text-primary text-sm focus:outline-none focus:border-primary/50 placeholder:text-text-tertiary transition-all resize-none"
                />
              </div>

              {/* Image attachment deck */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-2">
                  Attach Photo (Optional)
                </label>
                <div className="flex gap-2 flex-wrap items-center">
                  {reviewImages.map((img, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <Image src={img} alt="" fill className="object-cover" />
                      <button 
                        onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white"
                      >
                        <span className="material-icons-round text-[9px]">close</span>
                      </button>
                    </div>
                  ))}

                  <label className={`w-14 h-14 rounded-xl border border-dashed border-gray-300 bg-surface-dim/40 flex flex-col items-center justify-center text-text-tertiary hover:text-primary hover:border-primary/50 transition-colors cursor-pointer shrink-0 ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                    <span className="material-icons-round text-[20px]">{uploadingImage ? "hourglass_top" : "add_a_photo"}</span>
                    <input type="file" accept="image/*" onChange={handleReviewImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleReviewSubmit}
              disabled={submitReview.isPending || !reviewText.trim()}
              className="w-full py-3.5 bg-black text-white font-extrabold text-sm rounded-2xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-1.5 disabled:opacity-50"
            >
              {submitReview.isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span className="material-icons-round text-[16px]">send</span>Submit Verified Review</>}
            </button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/95 backdrop-blur-md border border-white/10 px-5 py-3 rounded-full text-white text-[11px] font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-icons-round text-green-400 text-[14px]">check_circle</span>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
