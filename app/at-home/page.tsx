"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "../components/BottomNav";

/* ─── Data Arrays ─── */
const maleCategories = [
  { id: "mc1", name: "Haircut & styling", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80" },
  { id: "mc2", name: "Facials & Cleanups", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { id: "mc3", name: "Shave & Beard", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=200&q=80" },
  { id: "mc4", name: "Hair Color", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=200&q=80" },
];

const femaleCategories = [
  { id: "fc1", name: "Waxing", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&q=80" },
  { id: "fc2", name: "Facials & Cleanups", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=200&q=80" },
  { id: "fc3", name: "Threading & Face waxing", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=200&q=80" },
  { id: "fc4", name: "Hair", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80" },
];

const malePackages = [
  { id: "mp1", title: "Classic Grooming", desc: "Haircut & Beard/Shaving\n10 Minutes Head Massage", price: 499, oldPrice: 699, image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80" },
  { id: "mp2", title: "Premium Care", desc: "Haircut & Beard Trimming\nO3+ Shine & Glow Facial", price: 1349, oldPrice: 1999, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
];

const femalePackages = [
  { id: "fp1", title: "The Luxe Wax & Glow Package", desc: "Aloevera Wax - Fullbody Wax\nButterfly & Kiss - Fruit &...", price: 1399, oldPrice: 1999, image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80" },
  { id: "fp2", title: "The Radiance Package", desc: "Manicure & Pedicure\nComplete Facial Service", price: 1899, oldPrice: 2499, image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80" },
];

const maleServicesList = [
  { id: "ms1", name: "Haircut + Beard Trimming + Charcoal Facial", price: 999, duration: "110 mins", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80" },
  { id: "ms2", name: "Haircut + Beard Trimming + O3+ Shine & Glow Facial", price: 1349, duration: "125 mins", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  { id: "ms3", name: "Haircut", price: 299, duration: "30 mins", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80" },
];

const femaleServicesList = [
  { id: "fs1", name: "Full arms + Full Legs + Underarms", prefix: "Start's at", price: 499, options: "4 option", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=400&q=80" },
  { id: "fs2", name: "Full arms + Underarms", prefix: "Start's at", price: 199, options: "5 option", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80" },
  { id: "fs3", name: "Full Legs", prefix: "Start's at", price: 299, options: "5 option", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80" },
];

export default function AtHomePage() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activeCategory, setActiveCategory] = useState<string>("mc1");
  const [cart, setCart] = useState<string[]>([]);

  const categories = gender === "male" ? maleCategories : femaleCategories;
  const packages = gender === "male" ? malePackages : femalePackages;
  const servicesList = gender === "male" ? maleServicesList : femaleServicesList;

  // Update active category when gender changes
  useEffect(() => {
    setActiveCategory(gender === "male" ? "mc1" : "fc1");
  }, [gender]);

  const toggleCart = (id: string) => {
    setCart((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-dvh bg-white pb-nav">

      {/* ─── Hero Banner ─── */}
      <div className="relative w-full h-[200px] overflow-hidden rounded-b-3xl">
        <div className={`absolute inset-0 bg-gradient-to-r ${gender === 'male' ? 'from-pink-600 to-purple-600' : 'from-pink-500 to-pink-700'}`}>
          {/* Abstract wavy shapes for banner background */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="white" />
          </svg>
        </div>

        <div className="absolute top-8 left-6 z-10 text-white">
          <h1 className="text-2xl font-black leading-tight drop-shadow-md animate-wavePop">
            Salon At Home <br />
            In <span className="text-4xl px-2 py-0.5 bg-white/20 rounded-xl border border-white/30 backdrop-blur-sm text-white inline-block">30</span> Minutes
          </h1>
          <button className="mt-4 bg-[#FFE87C] text-black px-4 py-1.5 rounded-md font-bold text-sm shadow-lg">
            Book Now
          </button>
        </div>

        <div className="absolute bottom-0 right-0 h-full w-[50%] z-0 flex items-end justify-end">
          {/* Using a placeholder for the flying person illustration */}
          <div className="relative w-[180px] h-[150px] mr-[-20px] mb-[-10px]">
            <Image
              src={gender === 'male' ? "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80" : "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80"}
              alt="Flying professional"
              fill
              className="object-cover rounded-tl-full mix-blend-luminosity opacity-80"
            />
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
            style={{ backgroundColor: gender === "female" ? "#E11D48" : "#f3f4f6" }}
          >
            <div
              className={`w-6 h-6 rounded-full absolute bg-white shadow-md transform transition-transform duration-300 ${gender === "male" ? "left-0 bg-pink-600" : "translate-x-6 bg-white"}`}
              style={gender === "male" ? { backgroundColor: "#E11D48" } : {}}
            ></div>
          </button>
          <span className={`text-sm ${gender === 'female' ? 'text-pink-600 font-bold' : 'text-gray-500'}`}>Female</span>
        </div>
      </div>

      {/* ─── Grab Exciting Packages ─── */}
      <div className="bg-[#FFF8E7] py-6 relative">
        <div className="absolute inset-x-0 -top-2 h-4" style={{ backgroundImage: "radial-gradient(circle, #FFF8E7 6px, transparent 7px)", backgroundSize: "16px 16px", backgroundPosition: "bottom" }}></div>
        <div className="absolute inset-x-0 -bottom-2 h-4" style={{ backgroundImage: "radial-gradient(circle, #FFF8E7 6px, transparent 7px)", backgroundSize: "16px 16px", backgroundPosition: "top" }}></div>

        <h3 className="px-5 text-lg font-bold text-gray-900 mb-4">Grab Exciting Packages</h3>

        <div className="scroll-x px-5 !gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="w-[300px] shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between gap-2 mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1">{pkg.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-snug whitespace-pre-line">{pkg.desc}</p>
                </div>
                <div className="w-[80px] h-[70px] relative rounded-lg overflow-hidden shrink-0">
                  <Image src={pkg.image} alt={pkg.title} fill className="object-cover" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-pink-600 font-bold hover:underline cursor-pointer">Offer Details</span>
                  <span className="text-lg font-black text-green-700 mt-1">₹ {pkg.price}</span>
                </div>
                <button className="bg-pink-600 text-white text-xs font-bold px-5 py-2 rounded-lg">
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="px-5 py-5">
        <div className="relative">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* ─── Categories Square Blocks ─── */}
      <div className="px-5 pb-6">
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className={`w-full aspect-square relative rounded-xl overflow-hidden p-0.5 transition-all ${activeCategory === cat.id ? 'border-2 border-pink-500' : 'border border-transparent'}`}>
                <div className="w-full h-full relative rounded-lg overflow-hidden bg-gray-100">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                </div>
              </div>
              <span className={`text-[11px] text-center font-medium leading-tight ${activeCategory === cat.id ? 'text-pink-600 font-bold' : 'text-gray-700'}`}>
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-2 bg-gray-50"></div>

      {/* ─── Service List ─── */}
      <div className="px-5 py-5 pb-24">
        <h3 className="text-lg font-black text-gray-900 mb-4">
          {categories.find(c => c.id === activeCategory)?.name} <span className="font-normal text-gray-500 text-base">({servicesList.length})</span>
        </h3>

        <div className="space-y-5">
          {servicesList.map((service, idx) => (
            <div key={service.id}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-[14px] text-gray-900 leading-snug mb-1 pr-2">{service.name}</h4>

                  {(service as any).prefix && (
                    <span className="text-[11px] text-green-700 font-bold block mb-0.5">{(service as any).prefix}</span>
                  )}
                  <span className="text-[15px] font-black text-green-700 block mb-3">₹{service.price}</span>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleCart(service.id)}
                      className={`w-[70px] h-[32px] rounded border shadow-sm text-xs font-bold transition-all ${cart.includes(service.id) ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-black"
                        }`}
                    >
                      {cart.includes(service.id) ? "Added" : "Add"}
                    </button>
                    {(service as any).duration && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <span className="material-icons-round text-[14px]">schedule</span>
                        <span className="text-xs font-medium">{(service as any).duration}</span>
                      </div>
                    )}
                    {(service as any).options && (
                      <span className="text-xs font-medium text-gray-500">{(service as any).options}</span>
                    )}
                  </div>
                </div>

                <div className="w-[100px] h-[100px] relative rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <Image src={service.image} alt={service.name} fill className="object-cover" />
                </div>
              </div>

              <button className="text-[12px] font-bold text-pink-600 mt-3 hover:underline">
                View Details
              </button>

              {idx !== servicesList.length - 1 && (
                <div className="w-full h-px bg-gray-100 mt-5"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
