"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import WeeklyTimingsModal from "./WeeklyTimingsModal";

interface SalonInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: any;
}

type TabType = "info" | "reviews" | "portfolio";

export default function SalonInfoModal({ isOpen, onClose, salon }: SalonInfoModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [timingsOpen, setTimingsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset tab when closed
      setTimeout(() => setActiveTab("info"), 300);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !salon) return null;

  const bgImage = salon.images && salon.images.length > 0 ? salon.images[0] : "";
  const facilities = salon.facilities || [];
  const addressStreet = salon.address_street || salon.address?.street || "";
  const addressCity = salon.address_city || salon.address?.city || "";
  const addressState = salon.address_state || salon.address?.state || "";

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[32px] z-[101] h-[95vh] flex flex-col animate-slideUp overflow-hidden">
        
        {/* Top Header with Image */}
        <div className="relative h-[250px] shrink-0 bg-gray-200">
          {bgImage && (
            <Image src={bgImage} alt={salon.name} fill className="object-cover" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          
          {/* Back Button */}
          <button 
            onClick={onClose}
            className="absolute top-5 left-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md z-10 active:scale-95 transition-transform"
          >
            <span className="material-icons-round text-black text-lg">chevron_left</span>
          </button>

          {/* Salon Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <h1 className="text-xl font-bold text-white mb-1.5 leading-tight shadow-sm">{salon.name}</h1>
            <p className="text-xs text-gray-200 line-clamp-1 mb-2">
              {addressStreet}, {addressCity}{addressState ? `, ${addressState}` : ""}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <span className="material-icons-round text-[14px]">star</span>
                {salon.rating || "0.0"} ({salon.total_reviews || 0} reviews)
              </div>
              <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                <span className="material-icons-round text-[14px]">near_me</span>
                {salon.distance || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button 
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "info" ? "text-pink-600 border-pink-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}
          >
            Salon Info
          </button>
          <button 
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "reviews" ? "text-pink-600 border-pink-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}
          >
            Reviews
          </button>
          <button 
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === "portfolio" ? "text-pink-600 border-pink-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}
          >
            Portfolio
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          
          {/* Salon Info Tab */}
          {activeTab === "info" && (
            <div className="p-6 space-y-8 animate-fadeIn">
              
              <div className="space-y-4">
                <h3 className="text-[#c2185b] font-bold text-sm">Location and Timings</h3>
                
                <div className="flex gap-3">
                  <span className="material-icons-round text-gray-400 text-[18px] mt-0.5 shrink-0">location_on</span>
                  <div>
                    <a 
                      href={salon.google_map_url || `https://maps.google.com/?q=${encodeURIComponent(`${addressStreet || ''}, ${addressCity || ''}, ${addressState || ''}`)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <p className="text-[#c2185b] text-[13px] font-bold flex items-center gap-1 group-hover:underline">
                        View on map
                        <span className="material-icons-round text-[14px]">open_in_new</span>
                      </p>
                      <p className="text-gray-600 text-[13px] leading-relaxed mt-1">
                        {addressStreet}, {addressCity}{addressState ? `, ${addressState}` : ""}
                      </p>
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <span className="material-icons-round text-gray-400 text-[18px] mt-0.5 shrink-0">schedule</span>
                  <div>
                    <p className="text-gray-600 text-[13px] mb-2">Open - Close Timing</p>
                    <button onClick={() => setTimingsOpen(true)} className="text-pink-600 text-xs font-bold underline underline-offset-2">
                      See weekly timings
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gray-100" />

              <div className="space-y-4">
                <h3 className="text-[#c2185b] font-bold text-sm">Facilities</h3>
                {facilities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {facilities.map((fac: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                        <span className="text-[13px] text-gray-800 font-medium">{fac}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No facilities listed.</p>
                )}
              </div>
              
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="p-6 animate-fadeIn">
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-2xl font-black text-gray-900">{salon.rating || "0.0"}</span>
                  <span className="text-lg font-bold text-gray-400 pb-0.5">/ 5</span>
                </div>
                <div className="flex text-amber-400 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="material-icons-round text-[20px]">
                      {star <= (salon.rating || 0) ? "star" : "star_border"}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-bold text-gray-900 mb-2">Overall Rating</p>
                <div className="inline-block bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {salon.total_reviews || 0} Reviews
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
                <button className="px-5 py-1.5 rounded-full border border-amber-400 text-amber-500 text-sm font-semibold whitespace-nowrap bg-amber-50/30">
                  All
                </button>
                {[5, 4, 3, 2].map(star => (
                  <button key={star} className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold whitespace-nowrap bg-gray-50 hover:bg-gray-100">
                    <span className="material-icons-round text-[14px]">star</span> {star}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {/* Mock Review Placeholder */}
                <div className="border border-gray-100 rounded-xl p-4 bg-[#f9fafb]">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="material-icons-round text-blue-500 text-xl">person</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Alok</h4>
                        <div className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                          <span className="material-icons-round text-[10px]">star</span> 1.0
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-1">17 May, 2026</span>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 bg-[#f9fafb]">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="material-icons-round text-blue-500 text-xl">person</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Alok</h4>
                        <div className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                          <span className="material-icons-round text-[10px]">star</span> 1.0
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-1">17 May, 2026</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <div className="p-4 animate-fadeIn">
              {salon.images && salon.images.length > 0 ? (
                <div className="columns-2 gap-3 space-y-3">
                  {salon.images.map((img: string, i: number) => (
                    <div key={i} className="relative w-full h-48 rounded-xl overflow-hidden mb-3 inline-block">
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No portfolio images available.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <WeeklyTimingsModal 
        isOpen={timingsOpen} 
        onClose={() => setTimingsOpen(false)} 
        timings={salon.timings} 
      />
    </>
  );
}
