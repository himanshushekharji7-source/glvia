"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";

interface Salon {
  id: string;
  name: string;
  images: string[];
  rating: number;
  totalReviews: number;
  address: { street: string; city: string; state: string };
  priceRange: string;
  tags: string[];
  description: string;
}

interface ServiceClientProps {
  serviceName: string;
  serviceSlug: string;
  serviceIcon: string;
  salons: Salon[];
  minPrice: number;
}

const sortOptions = ["Relevance", "Top Rated", "Lowest Price"];

export default function ServiceClient({ serviceName, serviceSlug, serviceIcon, salons, minPrice }: ServiceClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState("Relevance");

  const filteredSalons = useMemo(() => {
    let list = salons;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.city.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    if (activeSort === "Top Rated") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (activeSort === "Lowest Price") {
      list = [...list].sort((a, b) => {
        const aPrice = parseInt(a.priceRange.match(/\d+/)?.[0] || "999");
        const bPrice = parseInt(b.priceRange.match(/\d+/)?.[0] || "999");
        return aPrice - bPrice;
      });
    }

    return list;
  }, [salons, searchQuery, activeSort]);

  return (
    <div className="min-h-dvh bg-slate-50 pb-nav">
      {/* ─── Hero Header ─── */}
      <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 px-5 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/categories"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          >
            <span className="material-icons-round text-white text-[20px]">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="material-icons-round text-white text-[24px]">{serviceIcon}</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                {serviceName}
              </h1>
              <p className="text-white/80 text-[12px] font-medium">
                {salons.length} salons • Starting ₹{minPrice}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder={`Search ${serviceName.toLowerCase()} salons...`}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl text-[13px] text-slate-800 font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ─── Sort Chips ─── */}
      <div className="px-5 py-3 overflow-x-auto no-scrollbar flex gap-2">
        {sortOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setActiveSort(opt)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-bold border whitespace-nowrap transition-all ${
              activeSort === opt
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* ─── Results ─── */}
      <div className="px-5 pb-2">
        <p className="text-[13px] text-slate-500">
          <span className="font-bold text-slate-800">{filteredSalons.length}</span> salons for {serviceName}
        </p>
      </div>

      {/* ─── Salon Listings ─── */}
      <div className="px-5 pb-24 space-y-4">
        {filteredSalons.length > 0 ? (
          filteredSalons.map((salon, i) => (
            <Link
              href={`/salon/${salon.id}`}
              key={salon.id}
              className="block border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer bg-white animate-fadeInUp"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-full h-[160px] relative">
                <Image
                  src={
                    salon.images?.[0] ||
                    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={`${salon.name} ${serviceName} Services in ${salon.address.city || "Uttar Pradesh"}`}
                  fill
                  className="object-cover"
                  loading={i < 3 ? "eager" : "lazy"}
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400 material-icons-round text-[14px]">star</span>
                    <span className="text-[12px] font-extrabold text-slate-800">
                      {salon.rating.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({salon.totalReviews})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-extrabold text-[15px] text-slate-900 mb-1 leading-snug">
                  {salon.name}
                </h3>

                {salon.address.city && (
                  <p className="text-[12px] text-slate-400 font-medium truncate flex items-center gap-1">
                    <span className="material-icons-round text-[14px]">location_on</span>
                    {salon.address.street ? `${salon.address.street}, ` : ""}
                    {salon.address.city}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-icons-round text-[14px] text-indigo-500">{serviceIcon}</span>
                    <p className="text-[12px] text-indigo-600 font-bold">
                      {serviceName}
                    </p>
                  </div>
                  <p className="text-[14px] text-slate-900 font-black">
                    {salon.priceRange.match(/\d+/)?.[0] ? `₹${salon.priceRange.match(/\d+/)?.[0]}` : salon.priceRange}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-100 rounded-3xl shadow-sm px-6">
            <span className="material-icons-round text-5xl text-indigo-200 mb-4">spa</span>
            <h3 className="text-lg font-extrabold text-slate-800 mb-1">
              No salons found for {serviceName}
            </h3>
            <p className="text-[13px] text-slate-500 max-w-[280px] leading-relaxed mb-5">
              We&apos;re adding more salons for this service. Explore other categories meanwhile.
            </p>
            <Link
              href="/categories"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-opacity active:scale-95 transform"
            >
              Browse Categories
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
