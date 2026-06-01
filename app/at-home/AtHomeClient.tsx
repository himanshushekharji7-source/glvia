"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import { supabase, TABLES } from "../lib/supabase";

import { MALE_CATEGORIES, MALE_SERVICES, FEMALE_CATEGORIES, FEMALE_SERVICES, getPredefinedServiceImage } from "../lib/predefinedServices";

/* ─── Service Price and Duration Defaults Helper ─── */
function getServiceDefaults(name: string, categorySlug: string) {
  let price = 299;
  let duration = "30 mins";

  const lowerName = name.toLowerCase();
  
  // Threading / small skin care
  if (lowerName.includes("threading")) {
    price = 99;
    duration = "15 mins";
  } else if (lowerName.includes("upper lip") || lowerName.includes("forehead") || lowerName.includes("side locks")) {
    price = 79;
    duration = "10 mins";
  }
  // Waxing / Rica
  else if (lowerName.includes("wax") || lowerName.includes("waxing")) {
    if (lowerName.includes("full body")) {
      price = 1399;
      duration = "90 mins";
    } else if (lowerName.includes("full arms") || lowerName.includes("full legs")) {
      price = 499;
      duration = "40 mins";
    } else if (lowerName.includes("half")) {
      price = 249;
      duration = "25 mins";
    } else {
      price = 399;
      duration = "30 mins";
    }
  }
  // Facials / Cleanup / Skin Care
  else if (lowerName.includes("facial") || lowerName.includes("cleanup") || lowerName.includes("clean-up") || lowerName.includes("d-tan") || lowerName.includes("detan")) {
    if (lowerName.includes("gold") || lowerName.includes("shine") || lowerName.includes("korean") || lowerName.includes("radiant") || lowerName.includes("o3+")) {
      price = 1349;
      duration = "75 mins";
    } else if (lowerName.includes("pearl") || lowerName.includes("whitening") || lowerName.includes("charcoal")) {
      price = 999;
      duration = "60 mins";
    } else {
      price = 499;
      duration = "45 mins";
    }
  }
  // Haircuts
  else if (lowerName.includes("haircut") || lowerName.includes("hair cut")) {
    if (lowerName.includes("beard") && (lowerName.includes("facial") || lowerName.includes("massage"))) {
      price = 999;
      duration = "110 mins";
    } else if (lowerName.includes("massage") || lowerName.includes("beard")) {
      price = 499;
      duration = "45 mins";
    } else {
      price = 299;
      duration = "30 mins";
    }
  }
  // Beard / Shave
  else if (lowerName.includes("beard") || lowerName.includes("shave") || lowerName.includes("shaving") || lowerName.includes("headshave")) {
    price = 149;
    duration = "20 mins";
  }
  // Massages / Spa
  else if (lowerName.includes("massage") || lowerName.includes("spa")) {
    if (lowerName.includes("deep tissue") || lowerName.includes("swedish") || lowerName.includes("aroma")) {
      price = 1299;
      duration = "60 mins";
    } else {
      price = 799;
      duration = "45 mins";
    }
  }
  // Makeup / Bridal
  else if (lowerName.includes("makeup") || lowerName.includes("bridal") || lowerName.includes("reception")) {
    if (lowerName.includes("package") || lowerName.includes("bridal")) {
      price = 2999;
      duration = "120 mins";
    } else {
      price = 1499;
      duration = "90 mins";
    }
  }
  // Mani-Pedi
  else if (categorySlug === "mani-pedi-hygiene" || lowerName.includes("pedicure") || lowerName.includes("manicure")) {
    price = 399;
    duration = "45 mins";
  }
  // Hair Treatments
  else if (lowerName.includes("keratin") || lowerName.includes("botox") || lowerName.includes("smoothening")) {
    price = 1999;
    duration = "120 mins";
  }

  return { price, duration };
}

export default function AtHomeClient() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activeCategory, setActiveCategory] = useState<string>("hair-cut-style");
  const [cart, setCart] = useState<string[]>([]);
  const [appName, setAppName] = useState<string>("glvia");

  // Compute lists based on gender & predefined source
  const categories = useMemo(() => {
    const sourceCats = gender === "male" ? MALE_CATEGORIES : FEMALE_CATEGORIES;
    return sourceCats.map(c => ({
      id: c.slug,
      name: c.label,
      image: `/categories/${gender}/${c.slug}.svg`
    }));
  }, [gender]);

  const packages = useMemo(() => {
    if (gender === "male") {
      return [
        {
          id: "pkg-classic-grooming",
          title: "Classic Grooming Package",
          desc: "Haircut + Beard/Shaving\n10 Minutes Head Massage",
          price: 499,
          oldPrice: 699,
          image: "/male service/hair cut and style/Haircut + Beard:Shaving + 10 Minutes Head Massage.svg"
        },
        {
          id: "pkg-premium-care",
          title: "Premium Care Package",
          desc: "Haircut + Beard Trimming\nO3+ Shine & Glow Facial",
          price: 1349,
          oldPrice: 1999,
          image: "/male service/skin care /O3+ Shine & Glow Facial.svg"
        }
      ];
    } else {
      return [
        {
          id: "pkg-luxe-wax-glow",
          title: "The Luxe Wax & Glow Package",
          desc: "Full Body Rica Waxing\nO3+ D-Tan Face Glow",
          price: 1399,
          oldPrice: 1999,
          image: "/Female Service/Skin Care/O3+ D-Tan.svg"
        },
        {
          id: "pkg-radiance",
          title: "The Radiance Package",
          desc: "Sara Detan Pedicure\nLotus Radiant Gold Facial",
          price: 1899,
          oldPrice: 2499,
          image: "/Female Service/Skin Care/Lotus Herbals Radiant Gold Facial.svg"
        }
      ];
    }
  }, [gender]);

  const rawServicesList = useMemo(() => {
    const servicesMap = gender === "male" ? MALE_SERVICES : FEMALE_SERVICES;
    const list: any[] = [];
    
    Object.entries(servicesMap).forEach(([categorySlug, serviceNames]) => {
      serviceNames.forEach((svcName) => {
        const { price, duration } = getServiceDefaults(svcName, categorySlug);
        const resolvedImage = getPredefinedServiceImage(gender, categorySlug, svcName);
        
        list.push({
          id: `${gender}-${categorySlug}-${svcName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          name: svcName,
          category_id: categorySlug,
          price,
          duration,
          image: resolvedImage
        });
      });
    });
    
    return list;
  }, [gender]);

  // Load app name on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: settings } = await supabase.from(TABLES.SITE_SETTINGS).select('*');
        if (settings && settings.length > 0) {
          const appNameSetting = settings.find(s => s.key === 'app_name');
          if (appNameSetting) setAppName(appNameSetting.value);
        }
      } catch (err) {
        console.error("Error loading At Home data from Supabase:", err);
      }
    }
    loadData();
  }, []);

  // Update active category when gender or categories change
  useEffect(() => {
    if (categories.length > 0) {
      const isValid = categories.some(c => c.id === activeCategory);
      if (!isValid) {
        setActiveCategory(categories[0].id);
      }
    }
  }, [gender, categories, activeCategory]);

  // Filter servicesList by active category
  const servicesList = useMemo(() => {
    return rawServicesList.filter(service => {
      return service.category_id === activeCategory;
    });
  }, [rawServicesList, activeCategory]);

  // Load cart from localStorage under key 'cart'
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (parsed && parsed.salonId === "glvia-home" && Array.isArray(parsed.services)) {
          setCart(parsed.services.map((s: any) => s?._id || s?.id).filter(Boolean));
        }
      } catch (e) {
        console.error("Cart parse error in At Home page:", e);
      }
    }
  }, []);

  // Update cart in state + localStorage
  const toggleCart = (id: string) => {
    setCart((prev) => {
      const next = prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id];
      
      if (next.length === 0) {
        localStorage.removeItem('cart');
      } else {
        // Find selected service details
        const selectedSvcs = next.map(cartId => rawServicesList.find(s => (s.id || s._id) === cartId)).filter(Boolean);
        const totalPrice = selectedSvcs.reduce((sum, s: any) => sum + s.price, 0);
        localStorage.setItem('cart', JSON.stringify({
          salonId: "glvia-home",
          salonName: `${appName.toUpperCase()} Salon at Home`,
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
          <h1 className="text-2xl font-black leading-tight drop-shadow-md">
            Salon At Home <br />
            In <span className="text-3xl px-3 py-1 bg-white text-pink-600 rounded-full mx-1 shadow-md animate-zoomWave">30</span> Minutes
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
                  <Image src={pkg.image} alt={pkg.title} fill className="object-cover" unoptimized />
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
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" unoptimized />
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
                  <Image src={service.image} alt={service.name} fill className="object-cover" unoptimized />
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
