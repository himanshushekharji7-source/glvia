"use client";

import { useEffect } from "react";

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  onAdd: () => void;
  isAdded: boolean;
  onNext: () => void;
}

export default function ServiceDetailModal({
  isOpen,
  onClose,
  service,
  onAdd,
  isAdded,
  onNext
}: ServiceDetailModalProps) {
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

  if (!isOpen || !service) return null;

  // Extract description lines for formatting
  const descriptionLines = service.description
    ? service.description
        .split("\n")
        .map((l: string) => {
          let clean = l.trim();
          // Remove leading bullet/dash points if any
          if (clean.startsWith("•") || clean.startsWith("*") || clean.startsWith("-")) {
            clean = clean.substring(1).trim();
          }
          return clean;
        })
        .filter((l: string) => l.length > 0)
    : [];

  // Parse products used
  let products: string[] = [];
  if (service.products_used) {
    if (Array.isArray(service.products_used)) {
      products = service.products_used;
    } else if (typeof service.products_used === "string") {
      products = service.products_used
        .split(",")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);
    }
  }

  // Fallback products used based on service name/category for premium visual experience
  if (products.length === 0) {
    const nameLower = (service.name || "").toLowerCase();
    const catLower = (service.category || "").toLowerCase();
    
    if (
      nameLower.includes("spa") ||
      nameLower.includes("treatment") ||
      catLower.includes("spa") ||
      catLower.includes("treatment")
    ) {
      products = ["Shampoo", "Hair spa cream"];
    } else if (nameLower.includes("color") || catLower.includes("color")) {
      products = ["Hair Color Cream", "Developer", "Color Conditioner"];
    } else if (
      nameLower.includes("facial") ||
      nameLower.includes("cleanup") ||
      catLower.includes("skin") ||
      nameLower.includes("detan")
    ) {
      products = ["Cleansing Gel", "Scrub", "Face Mask"];
    } else if (
      nameLower.includes("manicure") ||
      nameLower.includes("pedicure") ||
      catLower.includes("nail") ||
      catLower.includes("hygiene")
    ) {
      products = ["Nail Cleanser", "Moisturizer", "Cuticle Oil"];
    } else if (
      nameLower.includes("shave") ||
      nameLower.includes("beard") ||
      catLower.includes("beard")
    ) {
      products = ["Shaving Cream", "Aftershave Lotion", "Beard Oil"];
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[32px] z-[101] max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        
        {/* Floating Close button overlapping the top border */}
        <button 
          onClick={onClose}
          className="absolute -top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-gray-200/80 z-[102] active:scale-90 transition-transform cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Top Drag Handle */}
        <div className="w-14 h-1 bg-black rounded-full mx-auto mt-4 mb-2 shrink-0" />

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-28 pt-2 flex-1 no-scrollbar">
          
          {/* Service Header Card */}
          <div className="relative border border-pink-200 rounded-2xl p-5 mb-6 overflow-hidden bg-white">
            {/* Decorative background circle on the right side */}
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-pink-100/30 rounded-full pointer-events-none" />
            
            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4 relative z-10 pr-12">
              {service.name}
            </h2>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-pink-50 text-pink-500 text-xs font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1">
                {/* SVG Clock Icon */}
                <svg className="w-3.5 h-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
                {service.duration ? `${service.duration} min.` : "15 min."}
              </div>
              <div className="text-primary font-black text-lg">
                ₹{service.price}
              </div>
            </div>
          </div>

          {/* Products Used Section */}
          {products.length > 0 && (
            <div className="mb-6">
              {/* Header with line on the right */}
              <div className="flex items-center gap-3 mb-4 mt-6">
                <span className="text-xs font-black tracking-wider text-gray-900 uppercase shrink-0">
                  PRODUCTS USED
                </span>
                <div className="h-[1px] bg-gray-200 flex-1" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {products.map((product, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-pink-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-800">{product}</span>
                    {/* SVG Info Icon */}
                    <svg className="w-4 h-4 text-pink-500 shrink-0 select-none ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Service Section */}
          <div className="mb-6">
            {/* Header with line on the right */}
            <div className="flex items-center gap-3 mb-4 mt-6">
              <span className="text-xs font-black tracking-wider text-gray-900 uppercase shrink-0">
                ABOUT SERVICE
              </span>
              <div className="h-[1px] bg-gray-200 flex-1" />
            </div>

            <div className="bg-[#f9fafb] rounded-2xl p-5 space-y-2">
              {descriptionLines.length > 0 ? (
                descriptionLines.map((line: string, idx: number) => (
                  <p key={idx} className="text-gray-800 text-[14px] leading-relaxed font-semibold">
                    {line}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-gray-800 text-[14px] leading-relaxed font-semibold">Deep Nourishment & Hydration.</p>
                  <p className="text-gray-800 text-[14px] leading-relaxed font-semibold">Hygienic.</p>
                  <p className="text-gray-800 text-[14px] leading-relaxed font-semibold">Trained Professionals.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white flex gap-3 z-10">
          <button
            onClick={onAdd}
            className="flex-1 py-3 bg-black hover:bg-neutral-900 text-[14px] font-bold text-white rounded-lg border border-black transition-all active:scale-95 cursor-pointer"
          >
            {isAdded ? "Remove" : "Add To Cart"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-black hover:bg-neutral-900 text-[14px] font-bold text-white rounded-lg border border-black transition-all active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
