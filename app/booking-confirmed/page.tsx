import Link from "next/link";

export default function BookingConfirmedPage() {
  return (
    <div className="min-h-dvh bg-surface-card flex flex-col items-center justify-center px-6 py-12">
      {/* Success Animation */}
      <div className="animate-bounceIn mb-6">
        <div className="relative">
          {/* Glow ring */}
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="w-28 h-28 rounded-full gradient-primary flex items-center justify-center shadow-[0_8px_40px_rgba(236,72,153,0.35)]">
            <span className="material-icons-round text-[56px] text-white">check</span>
          </div>
        </div>
      </div>

      <h1
        className="text-2xl font-extrabold text-text-primary mb-2 animate-fadeInUp"
        style={{ animationDelay: "200ms" }}
      >
        Booking Confirmed!
      </h1>
      <p
        className="text-text-secondary text-center max-w-xs animate-fadeInUp"
        style={{ animationDelay: "300ms" }}
      >
        Your appointment has been booked successfully. Get ready for a premium experience!
      </p>

      {/* Booking Details Card */}
      <div
        className="w-full mt-8 card-elevated p-5 animate-fadeInUp"
        style={{ animationDelay: "400ms" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <span className="material-icons-round text-[24px] text-white">auto_awesome</span>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-text-primary">Aura Prestige</h3>
            <p className="text-[12px] text-text-secondary">124 Elite Avenue, Beverly Hills</p>
          </div>
        </div>

        <div className="divider mb-4" />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="material-icons-round text-[18px] text-primary">confirmation_number</span>
            <div>
              <div className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium">Booking ID</div>
              <div className="text-[14px] font-bold text-text-primary">#LXS-2024-8742</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-icons-round text-[18px] text-primary">calendar_today</span>
            <div>
              <div className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium">Date & Time</div>
              <div className="text-[14px] font-bold text-text-primary">Today, 10:00 AM</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-icons-round text-[18px] text-primary">shopping_bag</span>
            <div>
              <div className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium">Services</div>
              <div className="text-[14px] font-semibold text-text-primary">Signature Blowout, Gel Manicure</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-icons-round text-[18px] text-primary">payment</span>
            <div>
              <div className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium">Total Paid</div>
              <div className="text-[14px] font-bold text-text-primary">₹119</div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code placeholder */}
      <div
        className="mt-6 w-32 h-32 rounded-2xl bg-surface-dim flex items-center justify-center animate-fadeInUp"
        style={{ animationDelay: "500ms" }}
      >
        <div className="text-center">
          <span className="material-icons-round text-[36px] text-text-tertiary">qr_code_2</span>
          <p className="text-[10px] text-text-tertiary mt-1">Show at salon</p>
        </div>
      </div>

      {/* Actions */}
      <div
        className="w-full mt-8 space-y-3 animate-fadeInUp"
        style={{ animationDelay: "600ms" }}
      >
        <Link href="/bookings">
          <button className="btn-primary w-full py-4 text-base">
            View My Bookings
          </button>
        </Link>
        <Link href="/">
          <button className="btn-secondary w-full py-3.5 mt-3">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
