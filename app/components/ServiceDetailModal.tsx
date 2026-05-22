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
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl z-[101] max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Floating Close button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-[102]"
        >
          <span className="material-icons-round text-black text-xl">close</span>
        </button>

        {/* Top Drag Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-3 shrink-0" />

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-28 pt-2 flex-1 no-scrollbar">
          {/* Service Header Card */}
          <div className="relative border border-pink-200 rounded-2xl p-5 mb-6 overflow-hidden bg-white">
            {/* Decorative background circle */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-24 h-24 bg-pink-100/30 rounded-full pointer-events-none" />
            <div className="absolute right-4 bottom-2 w-12 h-12 bg-pink-50/20 rounded-full pointer-events-none" />
            
            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4 relative z-10 pr-12">
              {service.name}
            </h2>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-pink-50 text-pink-500 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                <span className="material-icons-round text-xs">access_time</span>
                {service.duration ? `${service.duration} min.` : "15 min."}
              </div>
              <div className="text-primary font-extrabold text-lg">
                ₹{service.price}
              </div>
            </div>
          </div>

          {/* Products Used Section */}
          {products.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-extrabold tracking-wider text-gray-900 uppercase whitespace-nowrap">
                  PRODUCTS USED
                </span>
                <div className="h-[1px] bg-gray-200 flex-1" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {products.map((product, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-pink-100 rounded-lg text-sm font-semibold text-gray-700 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>{product}</span>
                    <span className="material-icons-round text-pink-500 text-[14px] ml-1">info</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Service Section */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-extrabold tracking-wider text-gray-900 uppercase whitespace-nowrap">
                ABOUT SERVICE
              </span>
              <div className="h-[1px] bg-gray-200 flex-1" />
            </div>

            <div className="bg-[#f9fafb] border border-gray-100 rounded-2xl p-5 space-y-2">
              {descriptionLines.length > 0 ? (
                descriptionLines.map((line: string, idx: number) => (
                  <p key={idx} className="text-[#1f2937] text-[14px] leading-relaxed font-semibold">
                    {line}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-[#1f2937] text-[14px] leading-relaxed font-semibold">Sanitized tools.</p>
                  <p className="text-[#1f2937] text-[14px] leading-relaxed font-semibold">Mess free.</p>
                  <p className="text-[#1f2937] text-[14px] leading-relaxed font-semibold">Hygienic.</p>
                  <p className="text-[#1f2937] text-[14px] leading-relaxed font-semibold">Experienced professionals.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3 z-10">
          <button
            onClick={onAdd}
            className={`flex-1 py-3 text-[14px] font-bold rounded-lg transition-colors border ${
              isAdded 
                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                : "bg-black border-black text-white hover:bg-neutral-900"
            }`}
          >
            {isAdded ? "Remove" : "Add To Cart"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-black hover:bg-neutral-900 text-[14px] font-bold text-white rounded-lg border border-black transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
