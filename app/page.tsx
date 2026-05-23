"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ServiceDetailModal from "./components/ServiceDetailModal";
import { useSalons } from "./lib/hooks";
import { useRouter } from "next/navigation";
import { supabase, TABLES } from "./lib/supabase";

/* ─── Gender-specific dummy data ─── */

const maleServices = [
  { id: "ms1", name: "Haircut + Beard", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80", price: 299, duration: "30 min" },
  { id: "ms2", name: "Haircut + Head Massage 10 Min", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80", price: 299, duration: "40 min" },
  { id: "ms3", name: "Haircut + Massage + Facial", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80", price: 349, duration: "50 min" },
  { id: "ms4", name: "Premium Hair Color", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80", price: 599, duration: "60 min" },
  { id: "ms5", name: "Royal Shave + Facial", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80", price: 449, duration: "45 min" },
];

const femaleServices = [
  { id: "fs1", name: "Full Face Threading", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80", price: 299, duration: "30 min" },
  { id: "fs2", name: "Basic Manicure", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80", price: 399, duration: "45 min" },
  { id: "fs3", name: "Basic Pedicure", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=400&q=80", price: 399, duration: "45 min" },
  { id: "fs4", name: "Bridal Makeup", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80", price: 2999, duration: "120 min" },
  { id: "fs5", name: "Hair Spa Treatment", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80", price: 799, duration: "60 min" },
];

const maleCategories = [
  { id: "mc1", name: "Haircut", icon: "content_cut" },
  { id: "mc2", name: "Beard", icon: "face_6" },
  { id: "mc3", name: "Massage", icon: "spa" },
  { id: "mc4", name: "Facial", icon: "face_retouching_natural" },
  { id: "mc5", name: "Hair Color", icon: "palette" },
  { id: "mc6", name: "Grooming", icon: "clean_hands" },
];

const femaleCategories = [
  { id: "fc1", name: "Threading", icon: "auto_fix_high" },
  { id: "fc2", name: "Facial", icon: "face" },
  { id: "fc3", name: "Waxing", icon: "spa" },
  { id: "fc4", name: "Nails", icon: "back_hand" },
  { id: "fc5", name: "Makeup", icon: "brush" },
  { id: "fc6", name: "Hair Spa", icon: "self_improvement" },
];

const maleSalonDeals = [
  { id: "md1", title: "Men's Grooming Pack", desc: "Haircut + Beard + Facial", price: 499, oldPrice: 749, image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80" },
  { id: "md2", title: "Premium Combo", desc: "Hair Color + Head Massage", price: 799, oldPrice: 1199, image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80" },
];

const femaleSalonDeals = [
  { id: "fd1", title: "Bridal Glow Pack", desc: "Facial + Manicure + Pedicure", price: 999, oldPrice: 1499, image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80" },
  { id: "fd2", title: "Self-Care Sunday", desc: "Hair Spa + Threading + Waxing", price: 699, oldPrice: 1099, image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80" },
];

/* ─── Popular At Home Services (horizontal scroll with Add to cart) ─── */
const malePopularServices = [
  { id: "mph1", name: "Haircut + Beard or Shave", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80", price: 299, duration: "45 min" },
  { id: "mph2", name: "Classic Grooming", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80", price: 499, duration: "60 min" },
  { id: "mph3", name: "Pedicure + Manicure", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80", price: 599, duration: "15 min" },
  { id: "mph4", name: "Head Massage + Oil", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", price: 249, duration: "30 min" },
];

const femalePopularServices = [
  { id: "fph1", name: "Full Face Threading", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80", price: 199, duration: "20 min" },
  { id: "fph2", name: "Facial & Cleanup", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80", price: 499, duration: "45 min" },
  { id: "fph3", name: "Manicure + Pedicure", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80", price: 399, duration: "60 min" },
  { id: "fph4", name: "Hair Spa Premium", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80", price: 799, duration: "60 min" },
];

/* ─── Service Combo Banner Cards ─── */
const maleComboBanners = [
  { id: "mcb1", label: "Haircut | Beard | Head Massage", prefix: "At just", price: 499, image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80" },
  { id: "mcb2", label: "Facial & Cleanup", prefix: "Starting at", price: 499, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80" },
  { id: "mcb3", label: "Manicure & Pedicure", prefix: "Starting at", price: 99, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=500&q=80" },
  { id: "mcb4", label: "Haircut Male & Female", prefix: "Starting at", price: 299, image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=500&q=80" },
];

const femaleComboBanners = [
  { id: "fcb1", label: "Facial | Full Body Wax | Threading", prefix: "At just", price: 1199, image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80" },
  { id: "fcb2", label: "Waxing Services", prefix: "Starting at", price: 99, image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=500&q=80" },
  { id: "fcb3", label: "Manicure & Pedicure", prefix: "Starting at", price: 99, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=500&q=80" },
  { id: "fcb4", label: "Haircut Male & Female", prefix: "Starting at", price: 299, image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80" },
];

/* ─── Membership Plans ─── */
const dummyMembershipPlans = [
  { id: "gold", name: "GLIVAJI GOLD", duration: "(12 Months)", price: 299, discount: "15% off" },
  { id: "silver", name: "GLIVAJI SILVER", duration: "(6 Months)", price: 199, discount: "15% off" },
];
/* ─── Trust Banners (Carousel) ─── */
const dummyTrustBanners = [
  { 
    id: "tb1", 
    title: "Verified Experts", 
    desc: "Our experts are KYC-verified and background-checked.", 
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="18" y="10" width="28" height="44" rx="4" stroke="#1E293B" strokeWidth="3" fill="white"/>
        <rect x="24" y="14" width="16" height="2" rx="1" fill="#CBD5E1"/>
        <path d="M42 32C42 26.4772 46.4772 22 52 22C57.5228 22 62 26.4772 62 32C62 37.5228 57.5228 42 52 42C46.4772 42 42 37.5228 42 32Z" fill="#3B82F6"/>
        <path d="M48 32L51 35L56 29" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="30" r="6" fill="#F1F5F9"/>
        <path d="M26 42C26 39 28 37 32 37C36 37 38 39 38 42" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    )
  },
  { 
    id: "tb2", 
    title: "Experienced Professional", 
    desc: "All GLIVAJI professionals have 5+ years of relevant experience.", 
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M22 64V50C22 45.5817 25.5817 42 30 42H42C46.4183 42 50 45.5817 50 50V64" fill="#334155"/>
        <path d="M26 64V54C26 50.6863 28.6863 48 32 48H40C43.3137 48 46 50.6863 46 54V64" fill="#EC4899"/>
        <circle cx="36" cy="24" r="12" fill="#FCD34D"/>
        <path d="M24 24C24 17.3726 29.3726 12 36 12C42.6274 12 48 17.3726 48 24" fill="#1E293B"/>
        <path d="M10 64V56C10 52.6863 12.6863 50 16 50H26C29.3137 50 32 52.6863 32 56V64" fill="#475569"/>
        <path d="M14 64V58C14 55.7909 15.7909 54 18 54H24C26.2091 54 28 55.7909 28 58V64" fill="#DB2777"/>
        <circle cx="21" cy="36" r="10" fill="#FDE68A"/>
        <path d="M11 36C11 30.4772 15.4772 26 21 26C26.5228 26 31 30.4772 31 36" fill="#0F172A"/>
      </svg>
    )
  },
  { 
    id: "tb3", 
    title: "Dedicated Support", 
    desc: "Our customer care team is always available to ensure quick resolution of your concerns.", 
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="8" y="54" width="48" height="6" fill="#CBD5E1"/>
        <path d="M20 54L14 44H26L32 54H20Z" fill="#94A3B8"/>
        <rect x="18" y="38" width="16" height="12" rx="1" fill="#64748B"/>
        <path d="M38 60V48C38 43.5817 41.5817 40 46 40H54C58.4183 40 62 43.5817 62 48V60" fill="#A855F7"/>
        <circle cx="50" cy="26" r="10" fill="#FCD34D"/>
        <path d="M40 26C40 20.4772 44.4772 16 50 16C55.5228 16 60 20.4772 60 26" fill="#1E293B"/>
        <path d="M38 26C38 19.3726 43.3726 14 50 14C56.6274 14 62 19.3726 62 26" stroke="#475569" strokeWidth="2"/>
        <circle cx="38" cy="28" r="3" fill="#475569"/>
        <path d="M38 31C38 34 40 36 44 36" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  }
];

export default function HomePage() {
  const router = useRouter();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [cart, setCart] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [activeTrustSlide, setActiveTrustSlide] = useState(0);
  const { data: salons } = useSalons();

  const [dbPopularServices, setDbPopularServices] = useState<any[]>([]);
  const [dbComboBanners, setDbComboBanners] = useState<any[]>([]);
  const [dbSalonDeals, setDbSalonDeals] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbMembershipPlans, setDbMembershipPlans] = useState<any[]>([]);
  const [dbTrustBanners, setDbTrustBanners] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({
    app_name: "glvia",
    referral_amount: "100",
    billu_cash_points: "1000",
    billu_cash_value: "10"
  });

  useEffect(() => {
    async function loadData() {
      try {
        const { data: svc } = await supabase.from(TABLES.HOME_SERVICES).select('*').order('sort_order', { ascending: true });
        if (svc && svc.length > 0) setDbPopularServices(svc);

        const { data: combo } = await supabase.from(TABLES.HOME_COMBO_BANNERS).select('*').order('sort_order', { ascending: true });
        if (combo && combo.length > 0) setDbComboBanners(combo);

        const { data: deals } = await supabase.from(TABLES.HOME_SALON_DEALS).select('*').order('sort_order', { ascending: true });
        if (deals && deals.length > 0) setDbSalonDeals(deals);

        const { data: cats } = await supabase.from(TABLES.HOME_CATEGORIES).select('*').order('sort_order', { ascending: true });
        if (cats && cats.length > 0) setDbCategories(cats);

        const { data: plans } = await supabase.from(TABLES.MEMBERSHIP_PLANS).select('*').order('sort_order', { ascending: true });
        if (plans && plans.length > 0) setDbMembershipPlans(plans);

        const { data: trust } = await supabase.from(TABLES.TRUST_BANNERS).select('*').order('sort_order', { ascending: true });
        if (trust && trust.length > 0) setDbTrustBanners(trust);

        const { data: settings } = await supabase.from(TABLES.SITE_SETTINGS).select('*');
        if (settings && settings.length > 0) {
          const mapped = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {} as Record<string, string>);
          setSiteSettings(prev => ({ ...prev, ...mapped }));
        }
      } catch (err) {
        console.error("Error loading homepage data from Supabase:", err);
      }
    }
    loadData();
  }, []);

  const services = gender === "male" ? maleServices : femaleServices;
  const categories = dbCategories.length > 0
    ? dbCategories.filter(c => c.gender === gender)
    : (gender === "male" ? maleCategories : femaleCategories);

  const deals = dbSalonDeals.length > 0
    ? dbSalonDeals.filter(d => d.gender === gender)
    : (gender === "male" ? maleSalonDeals : femaleSalonDeals);

  const popularServices = dbPopularServices.length > 0
    ? dbPopularServices.filter(s => s.gender === gender)
    : (gender === "male" ? malePopularServices : femalePopularServices);

  const comboBanners = dbComboBanners.length > 0
    ? dbComboBanners.filter(b => b.gender === gender)
    : (gender === "male" ? maleComboBanners : femaleComboBanners);

  const membershipPlans = dbMembershipPlans.length > 0 ? dbMembershipPlans : dummyMembershipPlans;
  
  const trustBanners = dbTrustBanners.length > 0 
    ? dbTrustBanners.map(tb => ({
        id: tb.id,
        title: tb.title,
        desc: tb.description,
        iconName: tb.icon_name,
      })) 
    : dummyTrustBanners;

  // Auto-slide trust banners
  useEffect(() => {
    if (trustBanners.length === 0) return;
    const interval = setInterval(() => {
      setActiveTrustSlide((prev) => (prev + 1) % trustBanners.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [trustBanners.length]);

  // Load cart from localStorage on mount (only for home-delivery services)
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (parsed && parsed.salonId === "glvia-home" && Array.isArray(parsed.services)) {
          setCart(parsed.services.map((s: any) => s?._id || s?.id).filter(Boolean));
        } else if (parsed && parsed.salonId) {
          // Keep valid carts from standard salons, but don't set homepage instant services cart
        } else {
          // Clear any corrupt/old cart structures
          localStorage.removeItem('cart');
        }
      } catch (e) {
        console.error("Cart parse error:", e);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  const handleBook = (id: string) => {
    setCart((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      
      // Update localStorage cart
      if (next.length === 0) {
        localStorage.removeItem('cart');
      } else {
        const selectedSvcs = next.map(cartId => popularServices.find(s => (s.id || s._id) === cartId)).filter(Boolean);
        const totalPrice = selectedSvcs.reduce((sum, s: any) => sum + s.price, 0);
        localStorage.setItem('cart', JSON.stringify({
          salonId: "glvia-home",
          salonName: `${siteSettings.app_name || 'glvia'} Salon at Home`,
          salonAddress: "Delivered to your location",
          services: selectedSvcs.map((s: any) => ({
            _id: s.id || s._id,
            name: s.name,
            price: s.price,
            duration: parseInt(s.duration) || 30
          })),
          totalPrice
        }));
      }
      return next;
    });
  };

  return (
    <div className="min-h-dvh bg-surface-card pb-20 overflow-x-hidden">
      {/* Header with M/F toggle + Cart */}
      <Header
        showBack={false}
        showGenderToggle
        showCart
        showNotification={false}
        gender={gender}
        onGenderChange={setGender}
        cartCount={cart.length}
        merged={true}
      />

      {/* ─── Hero Banner (100% width, like Billu) ─── */}
      <div className="relative w-full h-[260px] -mt-[64px] pt-[64px] bg-gradient-to-br from-[#db2777] via-[#ec4899] to-[#7c3aed] overflow-hidden animate-fadeInUp flex items-center">
        {/* Background Texture blended in */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
          <Image
            src={
              gender === "male"
                ? "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"
                : "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
            }
            alt="Hero Texture"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Container */}
        <div className="relative w-full h-full flex items-center justify-between px-6 z-10">
          <div className="flex flex-col justify-center max-w-[55%]">
            <h2 className="text-2xl font-black text-white leading-tight">
              Salon At Home
              <br />
              In <span className="bg-white text-primary px-2.5 py-0.5 rounded-lg inline-block mx-1 font-black shadow-sm">30</span> Minutes
            </h2>
            <Link href="/search" className="mt-4 w-fit">
              <button className="bg-[#fef08a] hover:bg-yellow-200 text-black text-[12px] font-black px-6 py-2.5 rounded-full active:scale-95 transition-all shadow-lg cursor-pointer">
                Book Now
              </button>
            </Link>
          </div>

          {/* Running Superhero Illustration */}
          <div className="absolute right-2 bottom-0 h-[210px] w-[180px] pointer-events-none flex items-end justify-end">
            <div className="relative w-full h-[95%] animate-fadeInUp">
              <Image
                src={
                  gender === "male"
                    ? "/male_hero_delivery.png"
                    : "/female_hero_delivery.png"
                }
                alt="Superhero Delivery"
                fill
                className="object-contain object-bottom transition-all duration-500"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Offer Strip ─── */}
      <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-white text-sm tracking-wider uppercase">glvia Silver</span>
          <span className="text-white/70 text-xs font-medium">
            {gender === "male" ? "Get 15% OFF on all bookings" : "@Just ₹199 — only for you"}
          </span>
        </div>
        <span className="material-icons-round text-white/50 text-[18px]">chevron_right</span>
      </div>

      {/* ─── Instant Services ─── */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-text-primary">
              <span className="text-primary">Insta</span> Salon At Home{" "}
              <span className="text-text-tertiary text-xs font-bold">
                ({gender === "male" ? "8:00 AM to 8:00 PM" : "9:00 AM to 7:00 PM"})
              </span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              🏍️ Arriving in <span className="text-primary font-bold">30 mins</span>
            </p>
          </div>
          <Link href="/search" className="text-xs font-bold text-primary hover:underline">See all</Link>
        </div>

        {/* Horizontal Service Cards */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {services.map((svc) => (
            <div 
              key={svc.id} 
              className="flex-shrink-0 w-[160px] animate-fadeInUp cursor-pointer"
              onClick={() => setSelectedService(svc)}
            >
              <div className="relative w-[160px] h-[140px] rounded-2xl overflow-hidden bg-surface-dim mb-2">
                <Image
                  src={svc.image}
                  alt={svc.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="text-[13px] font-bold text-text-primary leading-tight mb-1 line-clamp-2 min-h-[36px]">
                {svc.name}
              </h4>
              <div className="text-primary font-black text-sm mb-2">₹{svc.price}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBook(svc.id);
                }}
                className={`w-full py-2 rounded-full text-xs font-bold border-2 transition-all duration-200 ${
                  cart.includes(svc.id)
                    ? "bg-primary text-white border-primary"
                    : "border-primary text-primary hover:bg-primary hover:text-white"
                }`}
              >
                {cart.includes(svc.id) ? "✓ Added" : "Book"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Categories Grid ─── */}
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-text-primary">
            {gender === "male" ? "Men's Services" : "Women's Services"}
          </h3>
          <Link href="/categories" className="text-xs font-bold text-primary hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/search?category=${cat.name.toLowerCase()}`}>
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-icons-round text-primary text-[24px]">{cat.icon}</span>
                </div>
                <span className="text-[11px] font-bold text-text-secondary group-hover:text-primary transition-colors text-center">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── At the Salon Deals ─── */}
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-text-primary">At the Salon Deals</h3>
          <Link href="/search" className="text-xs font-bold text-primary hover:underline">See all</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {(!salons || salons.length === 0) ? (
            <div className="w-full flex flex-col items-center justify-center py-8 px-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center mx-2">
               <span className="material-icons-round text-4xl text-gray-300 mb-3">store_mall_directory</span>
               <h4 className="text-[14px] font-bold text-gray-800 mb-1">No salons available right now</h4>
               <p className="text-[12px] text-gray-500 max-w-[200px]">New premium salons coming soon in your area.</p>
            </div>
          ) : (
            salons.map((salon: any) => (
              <Link key={salon._id || salon.id} href={`/salon/${salon._id || salon.id}`} className="flex-shrink-0 w-[160px] animate-fadeInUp group">
                <div className="relative w-full h-[120px] rounded-2xl overflow-hidden bg-surface-dim mb-2">
                  <Image
                    src={salon.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'}
                    alt={salon.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="text-[13px] font-bold text-text-primary mb-0.5 line-clamp-1">{salon.name}</h4>
                <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                  <span>{salon.distance || "Near you"}</span>
                  {salon.rating && (
                    <>
                      <span>|</span>
                      <span className="flex items-center gap-0.5">
                        <span className="material-icons-round text-amber-500 text-[11px]">star</span>
                        {salon.rating}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ─── Popular At Home Services ─── */}
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-text-primary">Popular At Home Services</h3>
          <Link href="/search" className="text-xs font-bold text-primary hover:underline">See all</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {popularServices.map((svc) => (
            <div key={svc.id} className="flex-shrink-0 w-[160px] animate-fadeInUp">
              <div 
                className="relative w-[160px] h-[130px] rounded-2xl overflow-hidden bg-surface-dim mb-2 cursor-pointer"
                onClick={() => setSelectedService(svc)}
              >
                <Image
                  src={svc.image}
                  alt={svc.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="text-[13px] font-bold text-text-primary leading-tight mb-1 line-clamp-2 min-h-[36px]">
                {svc.name}
              </h4>
              <div className="flex items-center gap-1 text-text-tertiary text-xs mb-1">
                <span className="material-icons-round text-[13px]">schedule</span>
                {svc.duration}
              </div>
              <div className="text-primary font-black text-sm mb-2">₹{svc.price}</div>
              <button
                onClick={() => handleBook(svc.id)}
                className={`w-full py-2 rounded-full text-xs font-bold border-2 transition-all duration-200 ${
                  cart.includes(svc.id)
                    ? "bg-primary text-white border-primary"
                    : "border-primary text-primary hover:bg-primary hover:text-white"
                }`}
              >
                {cart.includes(svc.id) ? "✓ Added" : "Add to cart"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Service Combo Banner Cards ─── */}
      <div className="px-5 pb-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {comboBanners.map((banner) => (
            <Link key={banner.id} href="/search" className="flex-shrink-0 w-[200px] group">
              <div className="relative w-full h-[260px] rounded-2xl overflow-hidden">
                <Image
                  src={banner.image}
                  alt={banner.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Label and Price */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                  <div className="inline-block bg-primary/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md mb-1.5 leading-tight">
                    {banner.label}
                  </div>
                  <div className="text-white/80 text-[11px] font-medium">
                    {banner.prefix} <span className="text-white text-2xl font-black ml-1">₹{banner.price}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Membership Plans ─── */}
      <div className="px-5 pb-8">
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Membership Plans</h3>
          <div className="flex flex-col space-y-4">
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
              {membershipPlans.map((plan, idx) => (
                <div key={plan.id} className={`p-4 ${idx === 0 ? "border-b border-gray-200" : ""}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-[15px] font-black" style={{ color: plan.name.includes("GOLD") ? "#C026D3" : "#C026D3" }}>
                        {plan.name} <span className="text-text-primary font-bold">{plan.duration}</span>
                      </h4>
                    </div>
                    <span className="text-[15px] font-bold text-teal-800">₹{plan.price}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#2D6A4F] text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center">
                        {plan.discount}
                      </span>
                      <span className="text-[13px] text-text-secondary font-medium">On all bookings</span>
                    </div>
                    <Link href={`/membership/${plan.id}`} className="text-[13px] font-medium text-[#3B82F6] hover:underline flex items-center">
                      View Details <span className="material-icons-round text-[14px] ml-0.5">keyboard_double_arrow_right</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Banners Carousel */}
            <div className="relative mt-4">
              <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 h-[100px] relative">
                {trustBanners.map((bannerItem, idx) => {
                  const banner = bannerItem as any;
                  return (
                    <div 
                      key={banner.id}
                      className={`absolute inset-0 p-4 flex items-center gap-3 transition-opacity duration-300 ${
                        idx === activeTrustSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <h4 className="text-[15px] font-bold text-text-primary mb-1">{banner.title}</h4>
                        <p className="text-[12px] text-text-secondary leading-snug">
                          {banner.desc}
                        </p>
                      </div>
                      <div className="w-[70px] h-[70px] relative shrink-0 flex items-center justify-center">
                        {banner.svgIcon ? (
                          banner.svgIcon
                        ) : (
                          <span className="material-icons-round text-pink-500 text-4xl">{banner.iconName || 'verified'}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Dynamic Dots Indicator */}
              <div className="flex justify-center mt-3 gap-1.5">
                {trustBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTrustSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeTrustSlide ? 'w-4 bg-gray-400' : 'w-2 bg-gray-200'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Referral Banner */}
            <div className="rounded-xl overflow-hidden bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] p-4 flex items-center gap-4 shadow-md mt-4 relative">
              <div className="absolute inset-0 opacity-20">
                 <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                   <path d="M0,50 Q100,0 200,50 T400,50 L400,100 L0,100 Z" fill="none" stroke="white" strokeWidth="2" />
                   <path d="M0,70 Q100,20 200,70 T400,70 L400,100 L0,100 Z" fill="none" stroke="white" strokeWidth="1" />
                 </svg>
              </div>
              <div className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg border-2 border-pink-500">
                <span className="text-pink-500 font-black text-3xl italic font-serif">{(siteSettings.app_name || 'g').charAt(0).toUpperCase()}</span>
                {/* Circular text simulation */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]">
                  <path id="curve" d="M 10 50 A 40 40 0 1 1 10 50.01" fill="transparent" />
                  <text className="text-[10px] fill-pink-500 font-bold uppercase tracking-widest">
                    <textPath href="#curve" startOffset="0%">{(siteSettings.app_name || 'glvia').toUpperCase()} CASH POINTS • </textPath>
                  </text>
                </svg>
              </div>
              <p className="text-white text-[16px] font-medium z-10">
                Earn <span className="font-bold">₹ {siteSettings.referral_amount}</span> for every referral
              </p>
            </div>

            {/* Cash Points Card */}
            <div className="mt-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between relative">
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900 mb-1">{siteSettings.billu_cash_points}</div>
                  <div className="text-[11px] font-bold text-gray-800 tracking-wide">{(siteSettings.app_name || 'glvia').toUpperCase()} Cash Points</div>
                </div>
                
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="h-10 w-px bg-pink-200 absolute top-1/2 -translate-y-1/2 -z-10" />
                  <div className="w-8 h-8 rounded-full border border-pink-500 bg-white flex items-center justify-center">
                    <span className="text-pink-500 font-bold text-xl leading-none">=</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900 mb-1">₹{siteSettings.billu_cash_value}</div>
                  <div className="text-[11px] font-bold text-gray-800 tracking-wide">Real Money</div>
                </div>
              </div>

              <div className="text-center mt-6 mb-5">
                <h3 className="text-lg font-black text-[#1E293B] mb-1">Redeem Now</h3>
                <p className="text-[13px] text-gray-500 font-medium">Choose your preferred option</p>
              </div>

              <div className="flex gap-3">
                <Link href="/at-home" className="flex-1 bg-black text-white py-3 px-4 rounded-lg flex items-center justify-between hover:bg-gray-900 transition-colors">
                  <span className="text-sm font-bold">Salon At Home</span>
                  <span className="material-icons-round text-[16px]">chevron_right</span>
                </Link>
                <Link href="/at-the-salon" className="flex-1 bg-black text-white py-3 px-4 rounded-lg flex items-center justify-between hover:bg-gray-900 transition-colors">
                  <span className="text-sm font-bold">At the Salon</span>
                  <span className="material-icons-round text-[16px]">chevron_right</span>
                </Link>
              </div>
            </div>

            {/* 100% Secure Section */}
            <div className="mt-6 flex items-center gap-4 px-2">
              <div className="flex-1 pr-2">
                <h4 className="text-[15px] font-black text-gray-900 mb-1 leading-tight">Your data is 100% secure.</h4>
                <p className="text-[13px] text-gray-600 leading-snug">
                  We don't share your information with any third party.
                </p>
              </div>
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M32 4L10 12V28C10 41.5 19.5 54 32 60C44.5 54 54 41.5 54 28V12L32 4Z" stroke="#E11D48" strokeWidth="4" strokeLinejoin="round"/>
                  <path d="M32 8L14 14.5V28C14 39.5 21.5 50 32 55C42.5 50 50 39.5 50 28V14.5L32 8Z" fill="#E11D48"/>
                  <rect x="26" y="28" width="12" height="10" rx="2" fill="white"/>
                  <path d="M28 28V24C28 21.7909 29.7909 20 32 20C34.2091 20 36 21.7909 36 24V28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="32" cy="33" r="1.5" fill="#E11D48"/>
                  <path d="M32 33V35" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="px-5 pb-8">
        <Link href="/search" className="flex items-center gap-3 bg-white border border-border p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <span className="material-icons-round text-text-tertiary group-hover:text-primary transition-colors">search</span>
          <span className="text-text-tertiary text-sm font-medium">
            Search for {gender === "male" ? "barbers, grooming" : "salons, beauty"}...
          </span>
        </Link>
      </div>

      <BottomNav />

      <ServiceDetailModal 
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService}
        isAdded={selectedService ? cart.includes(selectedService.id) : false}
        onAdd={() => selectedService && handleBook(selectedService.id)}
        onNext={() => router.push("/checkout")}
      />
    </div>
  );
}
