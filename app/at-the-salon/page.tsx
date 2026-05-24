"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { useSalons } from "../lib/hooks";

const maleCategories = [
  { id: "mc1", name: "Hair Cut &\nStyle", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=200&q=80" },
  { id: "mc2", name: "Skin Care", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { id: "mc3", name: "Hair Color", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=200&q=80" },
  { id: "mc4", name: "Hair\nTreatments", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80" },
];

const femaleCategories = [
  { id: "fc1", name: "Hair Cut &\nStyle", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80" },
  { id: "fc2", name: "Hair Color", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=200&q=80" },
  { id: "fc3", name: "Hair\nTreatments", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=200&q=80" },
  { id: "fc4", name: "Hair\nChemicals", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&q=80" },
];



export default function AtTheSalonPage() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: dbSalons, isLoading } = useSalons(searchQuery);

  const categories = gender === "male" ? maleCategories : femaleCategories;

  const salonsList = useMemo(() => {
    let list = dbSalons || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s: any) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [dbSalons, searchQuery]);

  return (
    <div className="min-h-dvh bg-white pb-nav">
      {/* ─── Hero Banner ─── */}
      <div className="relative w-full h-[180px]">
        {/* Placeholder for the real image */}
        <div className="absolute inset-0 bg-blue-600">
          <Image 
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"
            alt="Go Go Free Haircut"
            fill
            className="object-cover opacity-80 mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 p-5 flex flex-col justify-center items-end text-white">
          <h2 className="text-xl font-bold italic tracking-wide mb-1">GO GO!</h2>
          <h1 className="text-2xl font-black italic tracking-widest text-right leading-tight">
            GIVE ONE<br/>AND<br/>GET ONE
          </h1>
          <div className="bg-[#FFE87C] text-black font-black text-xl px-4 py-1 italic mt-2 transform -skew-x-12">
            FREE HAIRCUT
          </div>
        </div>
      </div>

      {/* ─── Gender Toggle ─── */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="font-medium text-gray-700">Select Gender</span>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${gender === 'male' ? 'text-pink-600 font-bold' : 'text-gray-500'}`}>Male</span>
          <button 
            className="w-12 h-6 rounded-full bg-gray-200 relative flex items-center transition-colors shadow-inner"
            onClick={() => setGender(gender === "male" ? "female" : "male")}
            style={{ backgroundColor: gender === "female" ? "#E11D48" : "#A78BFA" }}
          >
            <div 
              className={`w-6 h-6 rounded-full absolute bg-white shadow-md transform transition-transform duration-300 ${gender === "male" ? "left-0 bg-[#A78BFA]" : "translate-x-6 bg-white"}`}
              style={gender === "male" ? { backgroundColor: "#A78BFA" } : {}}
            ></div>
          </button>
          <span className={`text-sm ${gender === 'female' ? 'text-pink-600 font-bold' : 'text-gray-500'}`}>Female</span>
        </div>
      </div>

      {/* ─── Categories ─── */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-[#F3E8FF]">
                <Image src={cat.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'} alt={cat.name} fill className="object-cover" />
              </div>
              <span className="text-[11px] text-center font-medium leading-tight text-gray-700 whitespace-pre-line">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="px-5 py-3">
        <div className="relative">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Search for the Style you want" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] shadow-sm focus:outline-none focus:border-pink-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="px-5 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-white text-[16px]">tune</span>
        </button>
        <button className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1.5 shrink-0">
          <span className="text-[13px] text-gray-600">Near Me</span>
          <span className="material-icons-round text-[16px] text-gray-400">close</span>
        </button>
        <button className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1.5 shrink-0">
          <span className="text-[13px] text-gray-600">Price</span>
          <span className="material-icons-round text-[16px] text-gray-400">close</span>
        </button>
        <button className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-1.5 shrink-0">
          <span className="text-[13px] text-gray-600 capitalize">{gender}</span>
          <span className="material-icons-round text-[16px] text-gray-400">close</span>
        </button>
      </div>

      {/* ─── Salons List ─── */}
      <div className="px-5 py-4 pb-24 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          </div>
        ) : salonsList.length > 0 ? (
          salonsList.map((salonItem) => {
            const salon = salonItem as any;
            return (
              <Link 
                href={`/salon/${salon.id}`} 
                key={salon.id} 
                className="block border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-pink-200 transition-all cursor-pointer"
              >
                <div className="w-full h-[160px] relative">
                  <Image 
                    src={salon.images?.[0] || salon.image || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'} 
                    alt={salon.name} 
                    fill
                    className="object-cover" 
                  />
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-bold text-[15px] text-gray-900 mb-1">{salon.name}</h3>
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-1">
                    <span>{salon.distance}</span>
                    <span>|</span>
                    <span className="text-green-600 material-icons-round text-[14px]">star</span>
                    <span className="text-green-600 font-bold">
                      {salon.reviews || (salon.totalReviews ? `${salon.rating} (${salon.totalReviews})` : 'No reviews')}
                    </span>
                  </div>
                  {(salon.location || salon.address?.city) && (
                    <p className="text-[12px] text-gray-500 mb-3">
                      {salon.location || `${salon.address?.street}, ${salon.address?.city}`}
                    </p>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[12px] text-pink-500 font-medium">
                      Services starting from ₹{salon.startingPrice || (salon.priceRange ? salon.priceRange.match(/\d+/)?.[0] : '199')}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-gray-100 rounded-2xl shadow-sm px-6">
            <span className="material-icons-round text-5xl text-gray-300 mb-4">store_mall_directory</span>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No salons available right now</h3>
            <p className="text-[13px] text-gray-500 max-w-[200px] leading-relaxed">
              New premium salons are joining us soon. Check back later to book your appointment!
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
