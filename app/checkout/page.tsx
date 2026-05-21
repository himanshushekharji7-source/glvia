"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateBooking, useUser } from "../lib/hooks";

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

export default function CheckoutPage() {
  const router = useRouter();
  const { data: user } = useUser();
  const createBookingMutation = useCreateBooking();

  const [cart, setCart] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(dates[0].full);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (parsed && Array.isArray(parsed.services)) {
          setCart(parsed);
        } else {
          localStorage.removeItem('cart');
          router.push("/search");
        }
      } catch (e) {
        console.error("Checkout cart parse error:", e);
        localStorage.removeItem('cart');
        router.push("/search");
      }
    } else {
      router.push("/search");
    }
  }, [router]);

  if (!cart) return null;

  const subtotal = cart.totalPrice;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    try {
      await createBookingMutation.mutateAsync({
        salonId: cart.salonId,
        services: cart.services.map((s: any) => s._id),
        serviceNames: cart.services.map((s: any) => s.name),
        date: selectedDate,
        timeSlot: selectedTime,
        totalAmount: total,
        paymentMethod: paymentMethod === 'cash' ? 'Pay at Salon' : 'Online',
      });
      
      // Save details of the confirmed booking for the success screen
      localStorage.setItem('lastBooking', JSON.stringify({
        salonName: cart.salonName,
        salonAddress: cart.salonAddress || "124 Elite Avenue, Beverly Hills",
        bookingId: '#GLV-' + Math.floor(100000 + Math.random() * 900000),
        date: selectedDate,
        timeSlot: selectedTime,
        services: cart.services.map((s: any) => s.name).join(", "),
        totalAmount: total
      }));

      localStorage.removeItem('cart');
      router.push("/booking-confirmed");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create booking");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface-card pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-xl border-b border-border px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-dim"
        >
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>

      <div className="px-5 pt-5 space-y-6">
        {/* Selected Services */}
        <section>
          <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
            <span className="material-icons-round text-[18px] text-primary">shopping_bag</span>
            Selected Services
          </h2>
          <div className="space-y-2.5">
            {cart.services.map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-icons-round text-[18px] text-primary">
                      {i === 0 ? "content_cut" : "brush"}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-text-primary">{item.name}</h4>
                    <p className="text-[12px] text-text-tertiary">{item.duration} min</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[15px] font-bold text-text-primary">₹{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Date Selection */}
        <section>
          <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
            <span className="material-icons-round text-[18px] text-primary">calendar_today</span>
            Select Date
          </h2>
          <div className="scroll-x !px-0 !gap-2">
            {dates.map((d) => (
              <button
                key={d.full}
                onClick={() => setSelectedDate(d.full)}
                className={`flex flex-col items-center min-w-[64px] py-3 px-2 rounded-2xl border transition-all ${
                  selectedDate === d.full
                    ? "gradient-primary text-white border-transparent shadow-[0_4px_16px_rgba(236,72,153,0.3)]"
                    : "border-border bg-surface-card text-text-primary hover:border-primary/30"
                }`}
              >
                <span className={`text-[10px] font-medium ${selectedDate === d.full ? "text-white/70" : "text-text-tertiary"}`}>
                  {d.day}
                </span>
                <span className="text-xl font-bold mt-0.5">{d.date}</span>
                <span className={`text-[10px] font-medium ${selectedDate === d.full ? "text-white/70" : "text-text-tertiary"}`}>
                  {d.month}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Time Selection */}
        <section>
          <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
            <span className="material-icons-round text-[18px] text-primary">schedule</span>
            Select Time
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-2.5 rounded-xl text-[12px] font-semibold border transition-all ${
                  selectedTime === time
                    ? "gradient-primary text-white border-transparent"
                    : "border-border text-text-secondary hover:border-primary/30"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
            <span className="material-icons-round text-[18px] text-primary">payment</span>
            Payment Method
          </h2>
          <div className="space-y-2">
            {[
              { id: "card", label: "Credit / Debit Card", icon: "credit_card", sub: "Online Payment" },
              { id: "cash", label: "Pay at Salon", icon: "attach_money", sub: "Cash after service" },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                  paymentMethod === method.id
                    ? "border-primary/40 bg-primary/[0.03]"
                    : "border-border"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentMethod === method.id ? "gradient-primary" : "bg-surface-dim"
                }`}>
                  <span className={`material-icons-round text-[20px] ${
                    paymentMethod === method.id ? "text-white" : "text-text-secondary"
                  }`}>
                    {method.icon}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[14px] font-semibold text-text-primary">{method.label}</div>
                  {method.sub && (
                    <div className="text-[12px] text-text-tertiary">{method.sub}</div>
                  )}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === method.id ? "border-primary" : "border-border-strong"
                }`}>
                  {paymentMethod === method.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Price Summary */}
        <section className="p-4 rounded-2xl bg-surface-dim">
          <h2 className="text-base font-bold text-text-primary mb-3">Price Summary</h2>
          <div className="space-y-2 text-[14px]">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary font-medium">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tax</span>
              <span className="text-text-primary font-medium">₹{tax}</span>
            </div>
            <div className="divider !my-2.5" />
            <div className="flex justify-between text-[16px]">
              <span className="font-bold text-text-primary">Total</span>
              <span className="font-extrabold text-text-primary">₹{total}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 p-4 glass-strong border-t border-border">
        <button 
          onClick={handleConfirmBooking}
          disabled={isProcessing}
          className="btn-primary w-full py-4 text-base disabled:opacity-70 flex items-center justify-center"
        >
          {isProcessing ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            `Confirm Booking — ₹${total}`
          )}
        </button>
      </div>
    </div>
  );
}
