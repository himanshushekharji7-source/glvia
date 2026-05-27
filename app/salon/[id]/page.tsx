"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useSalon, useSalonReviews } from "../../lib/hooks";
import ServiceDetailModal from "../../components/ServiceDetailModal";
import SalonInfoModal from "../../components/SalonInfoModal";

export default function SalonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: salon, isLoading, isError } = useSalon(id as string);

  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleShare = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/salon/${id}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(publicUrl)
        .then(() => {
          setShowCopiedToast(true);
          setTimeout(() => setShowCopiedToast(false), 2000);
        })
        .catch(err => {
          console.error("Failed to copy link: ", err);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = publicUrl;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed: ", err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Get services and categories based on gender
  const services = useMemo(() => {
    if (!salon) return [];
    return gender === "male"
      ? (salon.maleServices || salon.services || [])
      : (salon.femaleServices || salon.services || []);
  }, [salon, gender]);

  const categories = useMemo(() => {
    if (!salon) return [];
    return gender === "male"
      ? (salon.maleServiceCategories || [])
      : (salon.femaleServiceCategories || []);
  }, [salon, gender]);

  // Auto-select first category when gender changes
  useMemo(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // Filter services by category and search
  const filteredServices = useMemo(() => {
    let filtered = services;
    if (selectedCategory) {
      filtered = filtered.filter((s: any) => s.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((s: any) => s.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [services, selectedCategory, searchQuery]);

  // Group filtered services by category
  const groupedServices = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredServices.forEach((svc: any) => {
      if (!groups[svc.category]) groups[svc.category] = [];
      groups[svc.category].push(svc);
    });
    return groups;
  }, [filteredServices]);

  // Get minimum starting price
  const startingPrice = useMemo(() => {
    if (services.length === 0) return 0;
    return Math.min(...services.map((s: any) => s.price));
  }, [services]);

  // --- Real verified customer reviews queries & statistics ---
  const { data: reviews = [] } = useSalonReviews(id as string);

  const reviewStats = useMemo(() => {
    if (reviews.length === 0) {
      return { 
        avg: Number(salon?.rating) || 0.0, 
        total: Number(salon?.total_reviews) || 0, 
        breakdown: [0, 0, 0, 0, 0] 
      };
    }
    const total = reviews.length;
    let sum = 0;
    const breakdown = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
    reviews.forEach((r: any) => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating)));
      sum += rating;
      breakdown[5 - rating] += 1;
    });
    return {
      avg: (sum / total).toFixed(1),
      total,
      breakdown: breakdown.map(c => Math.round((c / total) * 100))
    };
  }, [reviews, salon]);

  const isServiceAdded = (serviceId: string) => selectedServices.some(s => s._id === serviceId);

  const handleServiceToggle = (service: any) => {
    if (isServiceAdded(service._id)) {
      setSelectedServices(prev => prev.filter(s => s._id !== service._id));
      setTotalPrice(t => t - service.price);
    } else {
      setSelectedServices(prev => [...prev, service]);
      setTotalPrice(t => t + service.price);
    }
  };

  const handleGenderChange = (g: "male" | "female") => {
    setGender(g);
    setSelectedCategory("");
    setSearchQuery("");
    // Don't clear cart — preserve selections across gender switches
  };

  const handleContinue = () => {
    localStorage.setItem('cart', JSON.stringify({
      salonId: salon?._id || salon?.id,
      salonName: salon?.name,
      salonAddress: salon?.address ? `${salon.address.street}, ${salon.address.city}` : "",
      services: selectedServices,
      totalPrice
    }));
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-surface-card flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !salon) {
    return (
      <div className="min-h-dvh bg-surface-card flex flex-col items-center justify-center p-6 text-center">
        <span className="material-icons-round text-5xl text-error mb-4">error_outline</span>
        <h2 className="text-xl font-bold text-text-primary mb-2">Salon not found</h2>
        <Link href="/search">
          <button className="btn-primary px-6 py-2.5">Back to Search</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      {/* ─── Top Header ─── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-text-primary">
            <span className="material-icons-round text-[20px]">chevron_left</span>
            <span className="text-sm font-semibold">Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            {selectedServices.length > 0 && (
              <Link href="/checkout" className="flex items-center gap-1.5 text-primary font-bold text-sm">
                <span className="material-icons-round text-[18px]">shopping_cart</span>
                Cart: {selectedServices.length} Item
              </Link>
            )}
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 text-text-primary hover:text-primary hover:bg-pink-50 transition-all border border-gray-100 cursor-pointer"
              title="Share Salon"
            >
              <span className="material-icons-round text-[18px]">share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Salon Info Card ─── */}
      <div className="mx-4 mt-3 p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100">
        <h1 className="text-xl font-black text-text-primary">{salon.name}</h1>
        <p className="text-sm text-text-secondary mt-1">
          Service Starting from <span className="text-primary font-bold">₹{startingPrice}</span>
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button 
            onClick={() => setInfoModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm font-medium text-text-primary active:bg-gray-50 transition-colors"
          >
            <span className="material-icons-round text-[16px]">info</span>
            More Info
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 text-sm font-medium">
            <span className="text-green-600 font-semibold">Open</span>
            <span className="text-text-secondary">till {salon.openingHours?.[0]?.close || '8:00 PM'}</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
            <span className="material-icons-round text-white text-[16px]">navigation</span>
          </button>
        </div>
      </div>

      {/* ─── Service Category Section ─── */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-text-primary">Service Category</h2>
          {/* Gender Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenderChange("female")}
              className={`text-sm font-bold transition-colors ${gender === "female" ? "text-primary" : "text-text-tertiary"}`}
            >
              Female
            </button>
            <button
              onClick={() => handleGenderChange(gender === "male" ? "female" : "male")}
              className="relative w-10 h-5 rounded-full bg-gray-200 transition-colors"
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-primary transition-all duration-200 ${
                  gender === "male" ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
            <button
              onClick={() => handleGenderChange("male")}
              className={`text-sm font-bold transition-colors ${gender === "male" ? "text-primary" : "text-text-tertiary"}`}
            >
              Male
            </button>
          </div>
        </div>

        {/* Search Bar + Brand Services */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white">
            <span className="material-icons-round text-text-tertiary text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search for the Style you want"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm outline-none text-text-primary placeholder:text-text-tertiary bg-transparent"
            />
          </div>
          <button className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-black leading-tight text-center shrink-0">
            BRAND<br />SERVICES
          </button>
        </div>

        {/* Category Chips with Images */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {categories.map((cat: any) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center gap-1.5 shrink-0 w-[72px] group"
              >
                <div className={`relative w-[68px] h-[68px] rounded-2xl overflow-hidden border-2 transition-all ${
                  isActive ? "border-primary shadow-[0_0_0_2px_rgba(236,72,153,0.2)]" : "border-transparent"
                }`}>
                  <Image
                    src={cat.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className={`text-[10px] font-bold text-center leading-tight transition-colors ${
                  isActive ? "text-primary" : "text-text-secondary"
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Service List (Grouped by Category) ─── */}
      <div className={`px-4 pb-4 ${selectedServices.length > 0 ? "pb-28" : "pb-8"}`}>
        {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
          <div key={categoryName} className="mb-6">
            <h3 className="text-base font-black text-text-primary mb-4">
              {categoryName} <span className="text-text-tertiary font-medium">({(categoryServices as any[]).length})</span>
            </h3>
            <div className="space-y-0">
              {(categoryServices as any[]).map((svc: any, idx: number) => {
                const added = isServiceAdded(svc._id);
                return (
                  <div key={svc._id}>
                    <div className="flex gap-3 py-4">
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[15px] font-semibold text-text-primary leading-snug">{svc.name}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          {svc.oldPrice && (
                            <span className="text-text-tertiary text-sm line-through">₹{svc.oldPrice}</span>
                          )}
                          <span className="text-primary font-bold text-sm">₹{svc.price}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2.5">
                          <button
                            onClick={() => handleServiceToggle(svc)}
                            className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                              added
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-text-primary border-gray-300 hover:border-primary"
                            }`}
                          >
                            {added ? "✓ Added" : "Add"}
                          </button>
                          <span className="flex items-center gap-1 text-text-tertiary text-xs">
                            <span className="material-icons-round text-[14px]">schedule</span>
                            {svc.duration} mins.
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedService(svc)}
                          className="text-primary text-xs font-bold mt-2 hover:underline"
                        >
                          View Details
                        </button>
                      </div>
                      {/* Right: Image */}
                      {svc.image && (
                        <div className="relative w-[90px] h-[90px] rounded-xl overflow-hidden bg-surface-dim shrink-0">
                          <Image
                            src={svc.image}
                            alt={svc.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    {idx < (categoryServices as any[]).length - 1 && (
                      <div className="border-b border-gray-100" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <span className="material-icons-round text-4xl text-text-tertiary mb-3">search_off</span>
            <p className="text-text-tertiary font-medium">No services found</p>
          </div>
        )}
      </div>

      {/* ─── Real Customer Reviews & Ratings System Section ─── */}
      <div className="px-4 border-t border-gray-100 pt-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-text-primary">Verified Reviews & Ratings</h2>
          <span className="text-xs font-extrabold text-primary bg-pink-50 border border-pink-100 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
            100% Real
          </span>
        </div>

        {/* Reviews Bento Summary block */}
        <div className="grid grid-cols-3 gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
          <div className="flex flex-col items-center justify-center border-r border-gray-200/80">
            <div className="text-3xl font-black text-text-primary tracking-tight leading-none">
              {reviewStats.avg}
            </div>
            <div className="flex items-center gap-0.5 mt-1 text-amber-500">
              <span className="material-icons-round text-[14px]">star</span>
              <span className="text-[10px] font-extrabold text-text-primary">/ 5.0</span>
            </div>
            <div className="text-[9px] text-text-secondary mt-1.5 font-bold leading-none text-center">
              Based on {reviewStats.total} verified visits
            </div>
          </div>

          <div className="col-span-2 space-y-1.5 flex flex-col justify-center pl-1">
            {[5, 4, 3, 2, 1].map((stars, idx) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-text-secondary w-2 text-right">{stars}</span>
                <span className="material-icons-round text-[10px] text-amber-500">star</span>
                <div className="flex-1 h-1.5 bg-gray-200/80 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" 
                    style={{ width: `${reviewStats.breakdown[idx]}%` }}
                  />
                </div>
                <span className="text-[9px] font-medium text-text-tertiary w-6 text-right">
                  {reviewStats.breakdown[idx]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Deck */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
              <span className="material-icons-round text-3xl text-text-tertiary mb-1">rate_review</span>
              <p className="text-xs text-text-secondary font-medium">No customer feedback yet.</p>
              <p className="text-[10px] text-text-tertiary mt-0.5">Reviews appear automatically after completed visits.</p>
            </div>
          ) : (
            reviews.map((r: any) => (
              <div key={r.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black shrink-0">
                      {r.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-text-primary">{r.customerName}</span>
                        {r.isVerifiedBooking && (
                          <span className="bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <span className="material-icons-round text-[9px]">verified</span>Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-text-secondary mt-0.5">
                        Service: <strong className="text-text-primary">{r.serviceName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-icons-round text-[13px]">
                        {i < r.rating ? "star" : "star_border"}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-text-primary mt-2 leading-relaxed">
                  {r.reviewText}
                </p>

                {/* Review Images */}
                {r.images && r.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2 pb-1">
                    {r.images.map((img: string, idx: number) => (
                      <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Nested Owner Reply */}
                {r.ownerReply && (
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 mt-3 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="material-icons-round text-white text-[12px]">spa</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-primary">Response from Salon Manager</div>
                      <p className="text-[11px] text-text-primary mt-1 leading-normal italic">
                        "{r.ownerReply}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Sticky Bottom Cart Bar ─── */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 animate-slideUp">
          {/* Drag Handle */}
          <div className="flex justify-center pt-2 pb-1 bg-gray-900 rounded-t-2xl">
            <div className="w-10 h-1 rounded-full bg-gray-600" />
          </div>
          <div className="bg-gray-900 px-5 pb-5 pt-1 flex items-center justify-between"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
          >
            <div>
              <div className="text-white text-lg font-black">
                {selectedServices.length} Item <span className="text-gray-500 font-light">|</span>
              </div>
              <p className="text-gray-400 text-[11px] mt-0.5">Discount will be applied at checkout.</p>
            </div>
            <button
              onClick={handleContinue}
              className="text-white text-base font-bold px-1 py-2"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ─── Service Detail Modal ─── */}
      <ServiceDetailModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService}
        isAdded={selectedService ? isServiceAdded(selectedService._id) : false}
        onAdd={() => selectedService && handleServiceToggle(selectedService)}
        onNext={handleContinue}
      />

      <SalonInfoModal 
        isOpen={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        salon={salon} 
      />

      {showCopiedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/95 backdrop-blur-md border border-white/10 px-5 py-3 rounded-full text-white text-[11px] font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-icons-round text-green-400 text-[14px]">check_circle</span>
          Salon link copied to clipboard!
        </div>
      )}
    </div>
  );
}
