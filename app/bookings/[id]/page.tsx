"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBookingDetails } from "../../lib/hooks";

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { data: booking, isLoading, isError, error } = useBookingDetails(id as string);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-gray-50 p-5 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <span className="material-icons-round text-[40px]">security</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6 max-w-xs">
          {error?.message === "Unauthorized" 
            ? "You don't have permission to view this booking." 
            : "We couldn't find the booking you're looking for."}
        </p>
        <button onClick={() => router.push("/bookings")} className="btn-primary w-full max-w-[200px]">
          Go to My Bookings
        </button>
      </div>
    );
  }

  const statusVal = (booking.status || 'pending').toLowerCase();
  
  // Setup Timeline
  const steps = [
    { id: 'pending', label: 'Booking Received' },
    { id: 'confirmed', label: 'Confirmed by Salon' },
    { id: 'completed', label: 'Service Completed' },
  ];
  
  let currentStepIndex = 0;
  if (statusVal === 'confirmed') currentStepIndex = 1;
  if (statusVal === 'completed') currentStepIndex = 2;

  const salon = booking.salons || {};

  return (
    <div className="min-h-dvh bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-4 sticky top-0 z-50 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-800 hover:text-black transition-colors">
          <span className="material-icons-round text-[24px]">arrow_back_ios_new</span>
        </button>
        <h1 className="text-[17px] font-bold text-gray-900">Booking Receipt</h1>
        <button className="ml-auto text-gray-500">
          <span className="material-icons-round">share</span>
        </button>
      </div>

      <div className="px-4 pt-6 space-y-6">
        
        {/* Status Card & QR Code Area */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Background decorative blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-60"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-gray-500 text-[13px] font-medium mb-1">Status</p>
              <h2 className="text-2xl font-black text-gray-900 capitalize">
                {statusVal === 'cancelled' ? (
                  <span className="text-red-500 flex items-center gap-2">
                    <span className="material-icons-round text-2xl">cancel</span>
                    Cancelled
                  </span>
                ) : (
                  <span className="text-green-500 flex items-center gap-2">
                    <span className="material-icons-round text-2xl">check_circle</span>
                    {booking.status}
                  </span>
                )}
              </h2>
            </div>
            
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl p-1 shadow-sm flex items-center justify-center">
              {/* Fake QR Code */}
              <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png')] bg-cover opacity-80" />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase">Reference ID</p>
              <p className="text-[15px] font-mono font-bold text-gray-800 mt-0.5">{booking.booking_reference || `#GLV-${booking.id.substring(0,6).toUpperCase()}`}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase">Amount Paid</p>
              <p className="text-[15px] font-bold text-gray-800 mt-0.5">₹{booking.total_amount}</p>
            </div>
          </div>
        </div>

        {/* Timeline Tracking (Only if not cancelled) */}
        {statusVal !== 'cancelled' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-900 mb-5">Track Status</h3>
            <div className="relative">
              {/* Track Line */}
              <div className="absolute left-3.5 top-2 bottom-4 w-[2px] bg-gray-100"></div>
              {/* Active Track Line */}
              <div 
                className="absolute left-3.5 top-2 w-[2px] bg-black transition-all duration-500"
                style={{ height: currentStepIndex === 0 ? '10%' : currentStepIndex === 1 ? '50%' : '100%' }}
              ></div>

              <div className="space-y-6 relative z-10">
                {steps.map((step, idx) => {
                  const isCompleted = currentStepIndex >= idx;
                  const isActive = currentStepIndex === idx;
                  return (
                    <div key={step.id} className="flex gap-4 items-start">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-[3px] bg-white transition-colors duration-300 ${
                        isCompleted ? "border-black" : "border-gray-200"
                      }`}>
                        {isCompleted && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                      <div>
                        <p className={`text-[14px] font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {isActive && idx === 0 && <p className="text-[12px] text-gray-500 mt-0.5">Waiting for salon to accept.</p>}
                        {isActive && idx === 1 && <p className="text-[12px] text-gray-500 mt-0.5">Your slot is reserved.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Appointment Details</h3>
          
          <div className="flex gap-4 items-center mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
               <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${salon.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop'})` }} 
              />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-gray-900">{salon.name || 'Glivaji Salon'}</h4>
              <p className="text-[13px] text-gray-500 leading-snug mt-1">{salon.address_street}, {salon.address_city}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-center">
              <span className="material-icons-round text-pink-500">calendar_month</span>
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase">Date</p>
                <p className="text-[13px] font-bold text-gray-900">{new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-center">
              <span className="material-icons-round text-blue-500">schedule</span>
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase">Time</p>
                <p className="text-[13px] font-bold text-gray-900">{booking.time_slot}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Bill */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Services ({booking.services?.length || 0})</h3>
          
          <div className="space-y-4 border-b border-gray-100 pb-4 mb-4">
            {booking.services?.map((svc: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-[16px] text-pink-500">{idx === 0 ? "content_cut" : "spa"}</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-800">{svc.name}</p>
                    <p className="text-[12px] text-gray-400">{svc.duration || '30'} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Payment Method</span>
              <span className="font-medium text-gray-900">{booking.payment_method}</span>
            </div>
            <div className="flex justify-between text-[15px] font-black text-gray-900 pt-2">
              <span>Total Amount</span>
              <span>₹{booking.total_amount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Bar for Active Bookings */}
      {statusVal === 'confirmed' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 flex gap-3 animate-slideUp">
           <button 
            onClick={() => router.push(`https://maps.google.com/?q=${salon.address_street},${salon.address_city}`)}
            className="flex-1 bg-gray-100 text-gray-800 font-bold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span className="material-icons-round text-[18px]">directions</span>
            Get Directions
          </button>
        </div>
      )}
    </div>
  );
}
