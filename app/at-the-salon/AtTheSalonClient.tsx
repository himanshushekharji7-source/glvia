"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { useSalons } from "../lib/hooks";
import { supabase, TABLES } from "../lib/supabase";

// Predefined categories with unified slug structure and premium visuals
const maleCategories = [
  { label: "Hair Cut & Style", slug: "hair-cut-style", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80" },
  { label: "Skin Care", slug: "skin-care", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=300&q=80" },
  { label: "Hair Colour", slug: "hair-colour", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=300&q=80" },
  { label: "Hair Chemical", slug: "hair-chemical", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=300&q=80" },
  { label: "Mani Pedi & Hygiene", slug: "mani-pedi-hygiene", image: "https://images.unsplash.com/photo-1610992015732-2449b76344cc?auto=format&fit=crop&w=300&q=80" },
  { label: "Spa & Massage", slug: "spa-massage", image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=300&q=80" },
  { label: "Body Polishing", slug: "body-polishing", image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=300&q=80" },
  { label: "Hair Treatments", slug: "hair-treatments", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80" },
  { label: "Pre Groom", slug: "pre-groom", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=300&q=80" },
  { label: "Makeup", slug: "makeup", image: "https://images.unsplash.com/photo-1457972729786-0411a8b271d8?auto=format&fit=crop&w=300&q=80" },
];

const femaleCategories = [
  { label: "Hair Cut & Style", slug: "hair-cut-style", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=250&q=80" },
  { label: "Hair Colour", slug: "hair-colour", image: "https://images.unsplash.com/photo-1605497746444-12d733b8395c?auto=format&fit=crop&w=250&q=80" },
  { label: "Hair Treatments", slug: "hair-treatments", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=250&q=80" },
  { label: "Hair Chemical", slug: "hair-chemical", image: "https://images.unsplash.com/photo-1595891298406-ef9c95037f53?auto=format&fit=crop&w=250&q=80" },
  { label: "Mani Pedi & Hygiene", slug: "mani-pedi-hygiene", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=250&q=80" },
  { label: "Skin Care", slug: "skin-care", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=250&q=80" },
  { label: "Spa & Massage", slug: "spa-massage", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=250&q=80" },
  { label: "Makeup", slug: "makeup", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=250&q=80" },
  { label: "Nail Art", slug: "nail-art", image: "https://images.unsplash.com/photo-1604654894610-df4906b241af?auto=format&fit=crop&w=250&q=80" },
  { label: "Bridal Packages", slug: "bridal-packages", image: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=250&q=80" },
];

const CATEGORY_VARIANTS: Record<string, string[]> = {
  "hair-cut-style": ["hair-cut-style", "Hair Cut & Style", "Hair Cut & Stlye"],
  "skin-care": ["skin-care", "Skin care", "Skin Care"],
  "hair-colour": ["hair-colour", "Hair Clour", "Hair Colour", "Hair Color"],
  "hair-chemical": ["hair-chemical", "Hair Chemical", "Hair Chemicals"],
  "mani-pedi-hygiene": ["mani-pedi-hygiene", "Mani Pedi & HYgiene", "Mani Pedi & Hygiene"],
  "spa-massage": ["spa-massage", "Spa & massage", "Spa & Massage"],
  "body-polishing": ["body-polishing", "Body Polishing"],
  "hair-treatments": ["hair-treatments", "Hair Treatments"],
  "pre-groom": ["pre-groom", "Pre Groom"],
  "makeup": ["makeup", "Makeup"],
  "nail-art": ["nail-art", "Nail Art"],
  "bridal-packages": ["bridal-packages", "Bridal Packages"]
};

export default function AtTheSalonClient() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Holds the selected category slug
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtering & Banner states
  const [matchingSalonIds, setMatchingSalonIds] = useState<string[] | null>(null);
  const [isFilteringLoading, setIsFilteringLoading] = useState(false);
  const [activeBanner, setActiveBanner] = useState<any>(null);

  // Fetch salons and main list
  const { data: dbSalons, isLoading } = useSalons(searchQuery);

  const categories = gender === "male" ? maleCategories : femaleCategories;

  // 1. Fetch dynamic banners from site_settings (key: at_the_salon_banners)
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data: row } = await supabase
          .from(TABLES.SITE_SETTINGS)
          .select("value")
          .eq("key", "at_the_salon_banners")
          .single();
          
        if (row?.value) {
          const parsed = JSON.parse(row.value);
          if (Array.isArray(parsed)) {
            const today = new Date().toISOString().split("T")[0];
            const active = parsed.find((b: any) => 
              b.active_status === "active" && 
              (b.target_gender === gender || b.target_gender === "all") &&
              (!b.expiry || b.expiry >= today)
            );
            setActiveBanner(active || null);
          }
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
      }
    };
    fetchBanners();
  }, [gender]);

  // Reset selected category if gender changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [gender]);

  // 2. Database-first filtering: query matching salon_ids offering services of target category & gender
  useEffect(() => {
    if (!selectedCategory) {
      setMatchingSalonIds(null);
      return;
    }

    const fetchMatchingSalons = async () => {
      setIsFilteringLoading(true);
      try {
        const variants = CATEGORY_VARIANTS[selectedCategory] || [selectedCategory];
        const { data, error } = await supabase
          .from(TABLES.SALON_SERVICES)
          .select("salon_id")
          .eq("gender", gender)
          .in("category", variants);
          
        if (error) throw error;
        
        if (data) {
          const ids = Array.from(new Set(data.map((item: any) => item.salon_id)));
          setMatchingSalonIds(ids);
        } else {
          setMatchingSalonIds([]);
        }
      } catch (err) {
        console.error("Error filtering salons by category slug:", err);
        setMatchingSalonIds([]);
      } finally {
        setIsFilteringLoading(false);
      }
    };
    
    fetchMatchingSalons();
  }, [selectedCategory, gender]);

  // Compute final salons list
  const salonsList = useMemo(() => {
    let list = dbSalons || [];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s: any) => s.name.toLowerCase().includes(q));
    }
    
    if (matchingSalonIds !== null) {
      list = list.filter((s: any) => matchingSalonIds.includes(s.id));
    }
    
    return list;
  }, [dbSalons, searchQuery, matchingSalonIds]);

  // Helper to find selected category label
  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) return null;
    const cat = categories.find((c) => c.slug === selectedCategory);
    return cat ? cat.label : null;
  }, [selectedCategory, categories]);

  return (
    <div className="min-h-dvh bg-slate-50 pb-nav">
      
      {/* ─── Hero Banner ─── */}
      <div className="w-full px-4 pt-4">
        {activeBanner ? (
          // Dynamic database-loaded banner
          <div className="relative w-full h-[180px] rounded-2xl overflow-hidden shadow-md flex flex-col justify-between group transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700">
              <Image 
                src={activeBanner.image}
                alt={activeBanner.title}
                fill
                className="object-cover opacity-80 mix-blend-overlay"
              />
            </div>
            {/* Dotted pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            
            {/* Banner Text Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-center items-end text-white z-10">
              <h2 className="text-lg font-bold tracking-wide mb-0.5 text-yellow-300 drop-shadow-sm uppercase">
                {activeBanner.title}
              </h2>
              <h1 className="text-xl font-black italic tracking-wider text-right leading-tight drop-shadow-md">
                {activeBanner.subtitle.split(' AND ').map((str: string, index: number) => (
                  <span key={index}>
                    {str}
                    {index === 0 && <span className="text-yellow-200"><br/>AND<br/></span>}
                  </span>
                ))}
              </h1>
              <div className="bg-yellow-300 text-slate-900 font-extrabold text-[13px] px-4 py-1.5 rounded-lg shadow-md mt-3 transform hover:scale-105 transition-transform uppercase tracking-wider">
                {activeBanner.cta}
              </div>
            </div>

            {/* Platform disclaimer footer strip */}
            <div className="absolute bottom-0 inset-x-0 bg-red-600 text-white font-extrabold text-[9px] py-1 text-center uppercase tracking-widest z-15 shadow-inner">
              DASHO SALONS * PLATFORM FEE ₹10 WILL APPLY
            </div>
          </div>
        ) : (
          // Luxury Fallback Banner matching screenshot
          <div className="relative w-full h-[180px] rounded-2xl overflow-hidden shadow-md flex flex-col justify-between transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#075985]">
              <Image 
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"
                alt="Go Go Free Haircut"
                fill
                className="object-cover opacity-85 mix-blend-overlay"
              />
            </div>
            {/* Dotted pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:12px_12px] opacity-15 pointer-events-none" />
            
            {/* Banner Text Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-center items-end text-white z-10">
              <h2 className="text-[15px] font-black tracking-widest text-[#FFF] drop-shadow-sm mb-1">GO GO!</h2>
              <h1 className="text-2xl font-black italic tracking-wider text-right leading-tight drop-shadow-md">
                GIVE ONE<br/>
                <span className="text-yellow-200 text-lg not-italic font-bold">AND</span><br/>
                GET ONE
              </h1>
              <div className="bg-[#FFE87C] text-slate-900 font-black text-[13px] px-4 py-1 italic mt-2 transform -skew-x-12 shadow-sm uppercase">
                FREE HAIRCUT
              </div>
            </div>

            {/* Platform disclaimer footer strip */}
            <div className="absolute bottom-0 inset-x-0 bg-red-600 text-white font-bold text-[9px] py-1 text-center uppercase tracking-widest z-15">
              DASHO SALONS * PLATFORM FEE ₹10 WILL APPLY
            </div>
          </div>
        )}
      </div>

      {/* ─── Gender Toggle ─── */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-semibold text-[15px] text-slate-800 tracking-tight">Select Gender</span>
        <div className="flex items-center gap-3">
          <span className={`text-[13px] font-bold transition-colors ${gender === 'male' ? 'text-pink-600 font-black' : 'text-slate-400'}`}>Male</span>
          <button 
            className="w-12 h-6 rounded-full bg-slate-200 relative flex items-center transition-colors shadow-inner shrink-0"
            onClick={() => setGender(gender === "male" ? "female" : "male")}
            style={{ backgroundColor: gender === "female" ? "#E11D48" : "#8B5CF6" }}
          >
            <div 
              className={`w-5 h-5 rounded-full absolute bg-white shadow-md transform transition-transform duration-300 ${gender === "male" ? "left-0.5 bg-[#8B5CF6]" : "translate-x-6.5 bg-white"}`}
            ></div>
          </button>
          <span className={`text-[13px] font-bold transition-colors ${gender === 'female' ? 'text-pink-600 font-black' : 'text-slate-400'}`}>Female</span>
        </div>
      </div>

      {/* ─── Categories Horizontal Scroll ─── */}
      <div className="px-5 pb-5 overflow-x-auto no-scrollbar flex gap-4 scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <div 
              key={cat.slug} 
              className="flex flex-col items-center gap-2 cursor-pointer shrink-0 transition-transform active:scale-95"
              onClick={() => {
                if (isSelected) {
                  setSelectedCategory(null);
                } else {
                  setSelectedCategory(cat.slug);
                }
              }}
            >
              <div 
                className={`w-[72px] h-[72px] relative rounded-2xl overflow-hidden bg-[#FDF2F8] border-2 transition-all duration-300 ${
                  isSelected 
                    ? 'border-pink-600 scale-105 shadow-md shadow-pink-100' 
                    : 'border-transparent hover:border-slate-200 shadow-sm'
                }`}
              >
                <Image 
                  src={cat.image} 
                  alt={cat.label} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <span className={`text-[11px] text-center leading-snug max-w-[80px] transition-colors ${
                isSelected ? 'text-pink-600 font-bold' : 'text-slate-500 font-semibold'
              }`}>
                {cat.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ─── Search Bar ─── */}
      <div className="px-5 py-1">
        <div className="relative">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input 
            type="text" 
            placeholder="Search for the Style you want" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] shadow-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 placeholder-slate-400 text-slate-800 transition-all font-medium"
          />
        </div>
      </div>

      {/* ─── Filters pills ─── */}
      <div className="px-5 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-icons-round text-white text-[16px]">tune</span>
        </button>
        <button className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3.5 py-1.5 shrink-0 shadow-sm">
          <span className="text-[12px] font-semibold text-slate-600">Near Me</span>
          <span className="material-icons-round text-[14px] text-slate-400">close</span>
        </button>
        <button className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3.5 py-1.5 shrink-0 shadow-sm">
          <span className="text-[12px] font-semibold text-slate-600">Price</span>
          <span className="material-icons-round text-[14px] text-slate-400">close</span>
        </button>
        
        {/* Dynamic Category Pill with Clear Option */}
        {selectedCategory && (
          <button 
            className="flex items-center gap-1.5 border border-pink-200 bg-pink-50 rounded-xl px-3.5 py-1.5 shrink-0 shadow-sm animate-scaleIn"
            onClick={() => setSelectedCategory(null)}
          >
            <span className="text-[12px] font-bold text-pink-700">{selectedCategoryLabel}</span>
            <span className="material-icons-round text-[14px] text-pink-500 font-extrabold">close</span>
          </button>
        )}
        
        <button className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3.5 py-1.5 shrink-0 shadow-sm">
          <span className="text-[12px] font-semibold text-slate-600 capitalize">{gender}</span>
          <span className="material-icons-round text-[14px] text-slate-400">close</span>
        </button>
      </div>

      {/* ─── Salons List ─── */}
      <div className="px-5 py-3 pb-24 space-y-4">
        {isLoading || isFilteringLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-slate-100 rounded-2xl overflow-hidden bg-white p-4 space-y-3 animate-pulse shadow-sm">
                <div className="w-full h-[160px] bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : salonsList.length > 0 ? (
          salonsList.map((salonItem) => {
            const salon = salonItem as any;
            return (
              <Link 
                href={`/salon/${salon.id}`} 
                key={salon.id} 
                className="block border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-pink-200 hover:shadow-md transition-all cursor-pointer bg-white"
              >
                <div className="w-full h-[160px] relative">
                  <Image 
                    src={salon.images?.[0] || salon.image || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'} 
                    alt={`${salon.name} - Premium Salon in ${salon.address?.city || 'Uttar Pradesh'}`} 
                    fill
                    className="object-cover" 
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-800 shadow-sm uppercase tracking-wider">
                    {salon.distance || "1.2 KM"}
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <h3 className="font-extrabold text-[15px] text-slate-900 mb-1 leading-snug">{salon.name}</h3>
                  <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-2">
                    <div className="flex items-center gap-0.5">
                      <span className="text-amber-400 material-icons-round text-[14px] leading-none">star</span>
                      <span className="text-slate-800 font-extrabold leading-none">
                        {Number(salon.rating || 4.5).toFixed(1)}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="font-semibold text-slate-500">
                      {salon.totalReviews ? `${salon.totalReviews} reviews` : 'No reviews'}
                    </span>
                  </div>
                  
                  {(salon.location || salon.address?.city) && (
                    <p className="text-[12px] text-slate-400 font-medium truncate">
                      {salon.location || `${salon.address?.street}, ${salon.address?.city}`}
                    </p>
                  )}
                  
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[12px] text-pink-500 font-bold uppercase tracking-wider">
                      Services starting from
                    </p>
                    <p className="text-[14px] text-slate-900 font-black">
                      ₹{salon.startingPrice || (salon.priceRange ? salon.priceRange.match(/\d+/)?.[0] : '199')}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-100 rounded-3xl shadow-sm px-6 animate-scaleIn">
            <span className="material-icons-round text-5xl text-pink-200 mb-4">storefront</span>
            <h3 className="text-lg font-extrabold text-slate-800 mb-1">No salons found</h3>
            <p className="text-[13px] text-slate-500 max-w-[240px] leading-relaxed mb-5">
              Try another category or explore nearby salons.
            </p>
            <button 
              onClick={() => { setSelectedCategory(null); setSearchQuery(""); }} 
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-100 hover:opacity-90 transition-opacity active:scale-95 transform"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
