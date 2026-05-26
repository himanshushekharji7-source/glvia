"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMembershipPlans, usePurchaseMembership } from "../../lib/hooks";

export default function MembershipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const { data: dbPlans, isLoading } = useMembershipPlans();
  const { mutateAsync: purchaseMembership, isPending: isPurchasing } = usePurchaseMembership();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#ec4899]/30 border-t-[#ec4899] rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback in case DB hasn't been populated yet
  const fallbackPlans = [
    { id: "gold", name: "GLIVAJI GOLD", duration: "12 Month", price: 299, discount: "15%" },
    { id: "silver", name: "GLIVAJI SILVER", duration: "6 Month", price: 199, discount: "15%" },
  ];

  const plans = dbPlans && dbPlans.length > 0 ? dbPlans : fallbackPlans;
  const planId = (id as string).toLowerCase();
  const plan = plans.find((p: any) => p.id.toLowerCase() === planId);

  if (!plan) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <span className="material-icons-round text-5xl text-gray-400 mb-4">error_outline</span>
        <h2 className="text-xl font-bold mb-2">Plan not found</h2>
        <button onClick={() => router.back()} className="px-6 py-2 bg-black text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  const isGold = plan.name.toLowerCase().includes("gold");
  const headerClasses = isGold 
    ? "bg-gradient-to-r from-[#e11d48] via-[#ec4899] to-[#d946ef]" 
    : "bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#020617]";
  const textColor = isGold ? "text-[#fde047]" : "text-[#e2e8f0]";

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePurchase = async () => {
    // ⚠️ RAZORPAY/STRIPE INTEGRATION POINT ⚠️
    // In the future, initialize payment gateway here.
    // On payment success callback, trigger the purchaseMembership hook.
    try {
      await purchaseMembership(plan);
      router.push("/profile");
    } catch (err) {
      console.error("Purchase failed", err);
      alert("Failed to process payment. Please try again.");
    }
  };

  const faqs = [
    { question: "How can I purchase a Membership?", answer: "You can purchase a membership directly from this page by clicking the 'Buy Now' button." },
    { question: "What are the responsibilities of a member?", answer: "As a member, you simply need to show your active membership at the time of booking to avail discounts." },
    { question: "What benefits are included in a Membership?", answer: "You get flat discounts on all services at home and at the salon, priority support, and extra cash points." },
    { question: "What is a Membership?", answer: "A membership is a premium subscription that gives you exclusive discounts and perks on all our grooming services." }
  ];

  return (
    <div className="min-h-dvh bg-white pb-24">
      {/* Header */}
      <div className={`${headerClasses} p-4 pt-6 pb-8 relative overflow-hidden`}>
        <button onClick={() => router.back()} className="absolute top-4 left-4 z-10 text-white">
          <span className="material-icons-round text-[28px]">chevron_left</span>
        </button>
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            <span className="material-icons-round text-white text-[28px]">receipt_long</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">!</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center px-4 relative z-10">
          {/* Sparkles effect */}
          <div className="absolute left-4 top-2 text-[#fde047] opacity-80 animate-pulse">✦</div>
          <div className="absolute right-6 top-0 text-[#fde047] opacity-60 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>✧</div>
          <div className="absolute right-2 bottom-2 text-[#fde047] opacity-80 text-sm animate-pulse" style={{ animationDelay: '1s' }}>✦</div>
          
          <h1 className={`text-4xl font-black drop-shadow-md tracking-wide ${textColor}`} style={{ textShadow: isGold ? '0 2px 4px rgba(202, 138, 4, 0.5)' : '0 2px 4px rgba(0,0,0,0.5)' }}>
            {plan.name}
          </h1>
          <h2 className="text-xl font-extrabold text-white mt-1 tracking-widest uppercase">
            Membership Plan
          </h2>
        </div>
        
        {/* Glow overlay at bottom of header */}
        <div className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-white/20 to-transparent blur-xl"></div>
      </div>

      {/* Plan Cards Side-by-Side */}
      <div className="px-4 -mt-4 relative z-20 flex gap-3">
        {/* At Home Card */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 shadow-sm" style={{ background: "linear-gradient(to bottom, #f8fafc, #ffffff)" }}>
          <div className="flex justify-center -mt-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-black border-4 border-white flex items-center justify-center shadow-sm">
              <span className="material-icons-round text-white text-lg">home</span>
            </div>
          </div>
          <div className="text-center px-2 pb-3">
            <h3 className="text-black font-bold text-sm mb-2">At Home</h3>
            <p className="text-gray-800 font-bold text-[13px]">Flat {plan.discount || "15%"} OFF</p>
            <p className="text-gray-900 font-black text-[13px] mb-3">On all services</p>
            <div className="bg-black text-white text-[11px] font-bold py-1 w-full text-center uppercase">
              Unisex PLAN
            </div>
            <div className="bg-white border-b border-gray-100 text-gray-800 text-[13px] font-bold py-2">
              {plan.duration}
            </div>
            <div className="bg-white text-gray-800 text-[13px] font-medium py-2 rounded-b-lg">
              On all bookings
            </div>
          </div>
        </div>

        {/* At the Salon Card */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 shadow-sm" style={{ background: "linear-gradient(to bottom, #f8fafc, #ffffff)" }}>
           <div className="flex justify-center -mt-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#ec4899] border-4 border-white flex items-center justify-center shadow-sm">
              <span className="material-icons-round text-white text-lg">storefront</span>
            </div>
          </div>
          <div className="text-center px-2 pb-3">
            <h3 className="text-[#ec4899] font-bold text-sm mb-2">At the Salon</h3>
            <p className="text-gray-800 font-bold text-[13px]">Flat {plan.discount || "15%"} OFF</p>
            <p className="text-gray-900 font-black text-[13px] mb-3">On all services</p>
            <div className="bg-[#ec4899] text-white text-[11px] font-bold py-1 w-full text-center uppercase">
              Unisex PLAN
            </div>
            <div className="bg-white border-b border-gray-100 text-gray-800 text-[13px] font-bold py-2">
              {plan.duration}
            </div>
            <div className="bg-white text-gray-800 text-[13px] font-medium py-2 rounded-b-lg">
              On all bookings
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-5 mt-8">
        <div className="flex items-center justify-center mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <h3 className="px-4 text-sm font-bold tracking-widest text-gray-800">BENEFITS</h3>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
               <span className="material-icons-round text-gray-600 text-3xl">chair_alt</span>
            </div>
            <div>
              <h4 className="text-[15px] font-black text-gray-900 mb-1">Salon At Home</h4>
              <p className="text-gray-500 text-sm leading-snug">
                Unlock a flat {plan.discount || "15%"} savings on all At home bookings with your membership.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
               <span className="material-icons-round text-gray-600 text-3xl">store</span>
            </div>
            <div>
              <h4 className="text-[15px] font-black text-gray-900 mb-1">At the Salon</h4>
              <p className="text-gray-500 text-sm leading-snug">
                Unlock a flat {plan.discount || "15%"} savings on all salon bookings with your membership.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
               <span className="material-icons-round text-gray-600 text-3xl">support_agent</span>
            </div>
            <div>
              <h4 className="text-[15px] font-black text-gray-900 mb-1">Priority Support</h4>
              <p className="text-gray-500 text-sm leading-snug">
                VIP support with faster responses and quick solutions.
              </p>
            </div>
          </div>

           <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
               <span className="text-gray-800 font-black text-3xl italic">B</span>
            </div>
            <div>
              <h4 className="text-[15px] font-black text-gray-900 mb-1">Extra BCP (Cash Points)</h4>
              <p className="text-gray-500 text-sm leading-snug">
                Earn extra BCP and save more on services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Salons Banner */}
      <div className="mt-10 relative w-full h-[200px]">
        <Image
          src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80"
          alt="Available Salons"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        <div className="absolute top-0 left-0 p-6 max-w-[70%]">
          <h3 className="text-lg font-black tracking-widest text-black mb-2">AVAILABLE SALONS</h3>
          <p className="text-gray-800 text-sm font-medium mb-4">
            Enjoy benefits at our partner salons.
          </p>
          <Link href="/search" className="inline-block bg-black text-white text-xs font-bold px-4 py-2 rounded-md">
            View Salon List
          </Link>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="px-5 mt-8 mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <h3 className="px-4 text-sm font-bold tracking-widest text-gray-800">FAQs</h3>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="space-y-0 border-t border-gray-200">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-gray-200">
              <button 
                className="w-full py-4 flex items-center justify-between text-left"
                onClick={() => toggleFaq(idx)}
              >
                <span className="flex gap-2 text-sm font-bold text-gray-900 pr-4">
                  <span className="text-black text-lg -mt-1">•</span>
                  {faq.question}
                </span>
                <span className="material-icons-round text-gray-600 transition-transform" style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0)' }}>
                  expand_more
                </span>
              </button>
              {openFaq === idx && (
                <div className="pb-4 pl-5 pr-4 text-sm text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Buy Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 animate-slideUp">
        <button 
          onClick={handlePurchase}
          disabled={isPurchasing}
          className="w-full bg-black text-white font-bold text-[17px] py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {isPurchasing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            `Pay ₹${plan.price} & Buy Now`
          )}
        </button>
      </div>
    </div>
  );
}
