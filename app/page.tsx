"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ServiceDetailModal from "./components/ServiceDetailModal";
import { useRouter } from "next/navigation";

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

export default function HomePage() {
  const router = useRouter();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [cart, setCart] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Load cart from localStorage on mount (only for home-delivery services)
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (parsed.salonId === "glvia-home") {
          setCart(parsed.services.map((s: any) => s._id));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const services = gender === "male" ? maleServices : femaleServices;
  const categories = gender === "male" ? maleCategories : femaleCategories;
  const deals = gender === "male" ? maleSalonDeals : femaleSalonDeals;

  const handleBook = (id: string) => {
    setCart((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      
      // Update localStorage cart
      if (next.length === 0) {
        localStorage.removeItem('cart');
      } else {
        const selectedSvcs = next.map(cartId => services.find(s => s.id === cartId)).filter(Boolean);
        const totalPrice = selectedSvcs.reduce((sum, s: any) => sum + s.price, 0);
        localStorage.setItem('cart', JSON.stringify({
          salonId: "glvia-home",
          salonName: "glvia Salon at Home",
          salonAddress: "Delivered to your location",
          services: selectedSvcs.map((s: any) => ({
            _id: s.id,
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
          {deals.map((deal) => (
            <div key={deal.id} className="flex-shrink-0 w-[200px] animate-fadeInUp">
              <div className="relative w-full h-[130px] rounded-2xl overflow-hidden bg-surface-dim mb-3">
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  {Math.round(((deal.oldPrice - deal.price) / deal.oldPrice) * 100)}% Off
                </div>
              </div>
              <h4 className="text-[13px] font-bold text-text-primary mb-0.5">{deal.title}</h4>
              <p className="text-[11px] text-text-tertiary mb-1.5">{deal.desc}</p>
              <div className="flex items-center gap-2">
                <span className="text-primary font-black text-sm">₹{deal.price}</span>
                <span className="text-text-tertiary text-xs line-through">₹{deal.oldPrice}</span>
              </div>
            </div>
          ))}
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
