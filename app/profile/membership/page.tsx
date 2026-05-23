"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MyMembershipPlanPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-4 bg-white sticky top-0 z-50">
        <button onClick={() => router.back()} className="text-text-primary hover:text-primary transition-colors">
          <span className="material-icons-round text-[24px]">arrow_back_ios_new</span>
        </button>
        <h1 className="text-[17px] font-bold text-text-primary">My Membership Plan</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 pb-20 pt-10">
        {/* Overlapping Images Container */}
        <div className="relative w-full max-w-[320px] aspect-[4/3] mb-12 flex justify-center items-center">
          {/* Subtle dotted background pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ec4899 2px, transparent 2px)", backgroundSize: "20px 20px" }}></div>
          
          {/* Image 1: At the Salon (Bottom Left) */}
          <div className="absolute left-0 bottom-4 w-[180px] h-[180px] rounded-2xl overflow-hidden border-[6px] border-white shadow-lg transform -rotate-6 z-10 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <Image 
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80" 
              alt="Salon Service" 
              fill 
              className="object-cover" 
            />
          </div>
          
          {/* Image 2: At Home (Top Right) */}
          <div className="absolute right-0 top-0 w-[200px] h-[200px] rounded-3xl overflow-hidden border-[6px] border-white shadow-xl transform rotate-3 z-20 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <Image 
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80" 
              alt="At Home Service" 
              fill 
              className="object-cover" 
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center w-full max-w-[300px] animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-[28px] font-black leading-tight text-text-primary tracking-tight">
            Get a membership<br/>
            for <span className="text-[#ec4899]">At Home</span> & <span className="text-[#ec4899]">At<br/>the Salon</span>.
          </h2>
        </div>

        {/* Explore Button */}
        <div className="w-full mt-10 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          <Link href="/membership" className="block w-full py-4 rounded-xl bg-black text-white font-bold text-[15px] text-center hover:bg-gray-900 active:scale-[0.98] transition-all">
            Explore Membership Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
