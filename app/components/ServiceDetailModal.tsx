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

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl z-[101] max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Close button outside the white box conceptually, but practically floating top right of the modal or screen */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="material-icons-round text-black text-xl">close</span>
        </button>

        <div className="p-6 relative pb-24">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <h2 className="text-xl font-bold text-text-primary leading-tight">{service.name}</h2>
              <div className="flex items-center gap-1 mt-1 text-sm">
                <span className="material-icons-round text-primary text-[16px]">star</span>
                <span className="text-primary font-semibold">{service.rating || "4.9"}</span>
                <span className="text-text-secondary">({service.reviews || "14"} reviews)</span>
              </div>
              <div className="text-2xl font-bold text-success mt-2">₹{service.price}</div>
            </div>
            
            <button 
              onClick={onAdd}
              className={`px-5 py-2 rounded-lg font-bold text-sm shrink-0 transition-colors ${
                isAdded ? "bg-error text-white" : "bg-black text-white"
              }`}
            >
              {isAdded ? "Remove" : "Add"}
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-text-primary mb-3">Overview</h3>
            <ul className="space-y-2 text-text-secondary text-sm">
              {service.overview ? (
                service.overview.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-secondary mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-text-secondary mt-1.5 shrink-0" /> Sanitized tools.</li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-text-secondary mt-1.5 shrink-0" /> Mess free.</li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-text-secondary mt-1.5 shrink-0" /> Hygienic.</li>
                  <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-text-secondary mt-1.5 shrink-0" /> Experienced professionals</li>
                </>
              )}
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-text-primary mb-4">How it Works</h3>
            <ul className="space-y-5 text-text-secondary text-sm">
              {service.howItWorks ? (
                service.howItWorks.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary mt-2 shrink-0" />
                    <span><strong className="text-text-primary">Consultation</strong> Professional understands customer needs and hair condition to suggest suitable options.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary mt-2 shrink-0" />
                    <span><strong className="text-text-primary">Set-up</strong> Sanitisation of tools and placement of cape, mirror, floor sheet.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary mt-2 shrink-0" />
                    <span><strong className="text-text-primary">Parting & sectioning</strong> Detangling of hair followed by dividing it into small sections.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary mt-2 shrink-0" />
                    <span><strong className="text-text-primary">Service</strong> Execution of the service as per desired style with high hygiene standards.</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Floating Next Button */}
      {isAdded && (
        <div className="fixed bottom-6 right-4 z-[102] animate-bounceIn">
          <button 
            onClick={onNext}
            className="w-16 h-16 bg-black text-white rounded-full flex flex-col items-center justify-center shadow-xl hover:bg-gray-900 transition-colors"
          >
            <span className="text-sm font-bold">Next</span>
          </button>
        </div>
      )}
    </>
  );
}
