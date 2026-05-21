"use client";

import Image from "next/image";
import Link from "next/link";
import { useSalons, useCategories } from "./lib/hooks";

export default function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: salons, isLoading: salonsLoading } = useSalons();

  const featuredSalons = salons?.filter((s: any) => s.rating >= 4.5).slice(0, 4);

  return (
    <div className="min-h-dvh bg-surface-card pb-20 overflow-x-hidden">
      {/* Header Section */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Current Location</div>
            <div className="flex items-center gap-1.5 cursor-pointer group">
              <span className="material-icons-round text-primary text-[20px]">location_on</span>
              <span className="font-extrabold text-text-primary text-base">New York, USA</span>
              <span className="material-icons-round text-text-tertiary text-[18px] transition-transform group-hover:rotate-180">expand_more</span>
            </div>
          </div>
          <Link href="/notifications" className="relative group">
            <div className="w-11 h-11 rounded-2xl bg-white border border-border flex items-center justify-center shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md">
              <span className="material-icons-round text-text-secondary text-[22px]">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </div>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="relative h-44 rounded-[28px] overflow-hidden group animate-fadeInUp">
          <Image
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80"
            alt="Hero"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8">
            <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-2 border border-white/30">Limited Offer</div>
            <h2 className="text-2xl font-black text-white leading-tight max-w-[180px]">Get 30% Off Beauty Services</h2>
            <Link href="/search">
              <button className="mt-4 bg-white text-black text-[11px] font-bold px-5 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all shadow-lg">Book Now</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-8">
        <Link href="/search" className="flex items-center gap-3 bg-white border border-border p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <span className="material-icons-round text-text-tertiary group-hover:text-primary transition-colors">search</span>
          <span className="text-text-tertiary text-sm font-medium">Search for salons, spas, or stylists...</span>
        </Link>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between px-6 mb-4">
          <h3 className="text-lg font-black text-text-primary tracking-tight">Categories</h3>
          <Link href="/categories" className="text-xs font-bold text-primary hover:underline">View All</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2">
          {categoriesLoading ? (
            [1, 2, 3, 4].map((n) => (
              <div key={n} className="flex-shrink-0 w-16 h-24 bg-border/30 rounded-2xl animate-pulse" />
            ))
          ) : (
            categories?.map((cat: any) => (
              <Link key={cat._id} href={`/search?category=${cat.slug}`} className="flex-shrink-0 group">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-[22px] bg-white border border-border flex items-center justify-center shadow-sm group-hover:bg-primary transition-all group-hover:scale-105 group-hover:shadow-lg">
                    <span className="material-icons-round text-text-secondary text-[28px] group-hover:text-white transition-colors">{cat.icon}</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-text-secondary group-hover:text-primary transition-colors uppercase tracking-widest">{cat.name}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Featured Salons */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-text-primary tracking-tight">Featured Salons</h3>
          <Link href="/search" className="text-xs font-bold text-primary hover:underline">See All</Link>
        </div>
        <div className="space-y-4">
          {salonsLoading ? (
            [1, 2].map((n) => (
              <div key={n} className="w-full h-32 bg-border/30 rounded-3xl animate-pulse" />
            ))
          ) : (
            featuredSalons?.map((salon: any) => (
              <Link key={salon._id} href={`/salon/${salon._id}`} className="block">
                <div className="card p-4 flex gap-4 hover:shadow-xl transition-all group border-none bg-white shadow-sm ring-1 ring-border/50">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-inner">
                    <Image
                      src={salon.images?.[0] || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80"}
                      alt={salon.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 py-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="material-icons-round text-amber-500 text-[14px]">star</span>
                      <span className="text-[12px] font-black text-text-primary">{salon.rating}</span>
                      <span className="text-[10px] text-text-tertiary font-bold">({salon.totalReviews})</span>
                    </div>
                    <h4 className="font-extrabold text-text-primary text-[15px] mb-1.5 group-hover:text-primary transition-colors">{salon.name}</h4>
                    <div className="flex items-center gap-1 text-text-tertiary mb-2">
                      <span className="material-icons-round text-[14px]">location_on</span>
                      <span className="text-[11px] font-bold truncate">{salon.address?.city || 'City'}, {salon.address?.state || 'State'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-primary/5 text-primary text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ring-1 ring-primary/10">Top Rated</span>
                      <span className="bg-success/5 text-success text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ring-1 ring-success/10">Open Now</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Special Offers */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-black text-text-primary tracking-tight mb-4">Special Offers</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative h-48 rounded-3xl overflow-hidden shadow-sm group">
            <Image
              src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80"
              alt="Facial"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Skincare</span>
              <h5 className="text-white font-black text-sm">Glow Facial Special</h5>
              <div className="mt-2 text-white font-black text-xs">Save 20%</div>
            </div>
          </div>
          <div className="relative h-48 rounded-3xl overflow-hidden shadow-sm group">
            <Image
              src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80"
              alt="Hair"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Haircare</span>
              <h5 className="text-white font-black text-sm">Full Color Pack</h5>
              <div className="mt-2 text-white font-black text-xs">Save $40</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
