"use client";

import { useEffect } from "react";

interface WeeklyTimingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  timings: string; // The single timing string like "11:15 AM - 09:00 PM"
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WeeklyTimingsModal({ isOpen, onClose, timings }: WeeklyTimingsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Split string if user typed "11:15 AM - 09:00 PM"
  let openTime = "10:00 AM";
  let closeTime = "08:00 PM";
  if (timings && timings.includes("-")) {
    const parts = timings.split("-");
    openTime = parts[0].trim();
    closeTime = parts[1].trim();
  } else if (timings) {
    openTime = timings;
    closeTime = timings; // fallback
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[110] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[32px] z-[111] max-h-[80vh] flex flex-col animate-slideUp">
        
        {/* Top Drag Handle */}
        <div className="w-14 h-1 bg-gray-300 rounded-full mx-auto mt-4 mb-4 shrink-0 cursor-grab" />

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-12 pt-2 flex-1 no-scrollbar space-y-6">
          {DAYS.map((day) => (
            <div key={day} className="flex flex-col gap-1.5">
              <span className="text-pink-600 font-bold text-sm tracking-wide">{day}</span>
              <span className="text-gray-800 text-sm font-medium">
                Opens, {openTime} - Closes, {closeTime}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
