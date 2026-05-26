"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMembershipPlans } from "../lib/hooks";

export default function MembershipPlansPage() {
  const router = useRouter();
  const { data: dbPlans, isLoading } = useMembershipPlans();

  // Fallback dummy plans if DB is empty to match the design requirements
  const fallbackPlans = [
    { id: "gold", name: "GLIVAJI GOLD", duration: "12 Month", price: 299, discount: "15%", type: "Unisex Plan" },
    { id: "silver", name: "GLIVAJI SILVER", duration: "6 Month", price: 199, discount: "15%", type: "Unisex Plan" },
  ];

  const plans = dbPlans && dbPlans.length > 0 ? dbPlans.map(p => ({
    id: p.id,
    name: p.name,
    duration: p.duration.replace(/[()]/g, '').trim(), // Clean "(12 Months)" to "12 Months"
    price: p.price,
    discount: p.discount?.replace('off', '').trim() || "10%",
    type: "Unisex Plan"
  })) : fallbackPlans;

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-4 bg-white sticky top-0 z-50">
        <button onClick={() => router.back()} className="text-text-primary hover:text-primary transition-colors">
          <span className="material-icons-round text-[24px]">arrow_back_ios_new</span>
        </button>
        <h1 className="text-[17px] font-bold text-text-primary">Membership Plan</h1>
      </div>

      <div className="px-5 pt-4 pb-20 space-y-6">
        {isLoading ? (
           <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
           </div>
        ) : (
          plans.map((plan) => {
            const isGold = plan.name.toLowerCase().includes("gold");
            // Gold uses pink gradient, Silver uses black/dark gradient
            const headerClasses = isGold 
              ? "bg-gradient-to-r from-[#e11d48] via-[#ec4899] to-[#d946ef]" 
              : "bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#020617]";
            const textColor = isGold ? "text-[#fde047]" : "text-[#e2e8f0]";
            
            return (
              <div key={plan.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white animate-fadeInUp">
                {/* Card Header */}
                <div className={`relative h-[130px] flex flex-col items-center justify-center ${headerClasses}`}>
                  {/* Subtle repeating line texture for Silver */}
                  {!isGold && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)" }}></div>
                  )}

                  {/* Top Right Badge */}
                  <div className="absolute top-0 right-0 bg-[#ec4899] text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl">
                    {plan.type || "Unisex Plan"}
                  </div>

                  {/* Sparkles Decoration */}
                  <div className="absolute top-4 left-6 text-[#fde047] opacity-80 animate-pulse">✦</div>
                  <div className="absolute top-8 left-10 text-[#fde047] opacity-60 text-sm animate-pulse" style={{ animationDelay: '0.5s' }}>✧</div>
                  <div className="absolute bottom-6 right-8 text-[#fde047] opacity-80 animate-pulse" style={{ animationDelay: '1s' }}>✦</div>

                  {/* Title */}
                  <div className="text-center relative z-10 px-4">
                    <h2 className={`text-3xl font-black tracking-wider drop-shadow-md ${textColor}`} style={{ textShadow: isGold ? '0 2px 4px rgba(202, 138, 4, 0.5)' : '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {plan.name.split(' ')[0]} {plan.name.split(' ')[1]}
                    </h2>
                    <div className="text-white font-black text-[15px] tracking-[0.1em] mt-0.5 uppercase drop-shadow">
                      Membership Plan
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 bg-white relative">
                  <h3 className="text-[15px] font-semibold text-text-primary uppercase tracking-wide">{plan.name}</h3>
                  <div className="text-[13px] text-text-secondary mt-1">Plan Duration: {plan.duration}</div>
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[15px]">🎁</span>
                    <span className="text-[13px] text-text-secondary">Flat OFF: <span className="font-bold text-text-primary">{plan.discount}</span></span>
                  </div>

                  <div className="flex items-center justify-between mt-5">
                    <div className="text-xl font-bold text-text-primary">₹ {plan.price}</div>
                    <Link 
                      href={`/membership/${plan.id}`}
                      className="px-6 py-2 rounded-lg border border-[#ec4899] text-[#ec4899] font-semibold text-[14px] hover:bg-pink-50 active:scale-95 transition-all"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
