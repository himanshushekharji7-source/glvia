"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ServiceCard from "../../components/ServiceCard";
import { useSalon } from "../../lib/hooks";

export default function SalonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: salon, isLoading, isError } = useSalon(id as string);
  
  const [activeTab, setActiveTab] = useState("Services");
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const tabs = ["Services", "Reviews", "About"];

  const handleServiceToggle = (service: any, added: boolean) => {
    if (added) {
      setSelectedServices([...selectedServices, service]);
      setTotalPrice((t) => t + service.price);
    } else {
      setSelectedServices(selectedServices.filter(s => s._id !== service._id));
      setTotalPrice((t) => t - service.price);
    }
  };

  const handleBookNow = () => {
    // Save selected services to local storage or state management for checkout
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
    <div className="min-h-dvh bg-surface-card">
      {/* Hero Image */}
      <div className="relative h-[280px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${salon.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <Link
            href="/search"
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
          >
            <span className="material-icons-round text-[20px] text-white">arrow_back</span>
          </Link>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
              <span className="material-icons-round text-[20px] text-white">share</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
              <span className="material-icons-round text-[20px] text-white">favorite_border</span>
            </button>
          </div>
        </div>

        {/* Gallery dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {salon.images?.map((_: any, i: number) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === 0 ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Salon Info */}
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-2xl font-extrabold text-text-primary">{salon.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="material-icons-round text-[14px] text-text-tertiary">location_on</span>
          <span className="text-[13px] text-text-secondary">
            {salon.address.street}, {salon.address.city}, {salon.address.state}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="badge badge-rating">
            <span className="material-icons-round text-[12px] text-amber-500">star</span>
            <span className="text-amber-700 font-bold">{salon.rating}</span>
            <span className="text-amber-600/60">({salon.totalReviews})</span>
          </div>
          <span className="text-[13px] text-text-secondary flex items-center gap-1">
            <span className="material-icons-round text-[14px]">schedule</span>
            {salon.openingHours?.[0]?.open || '9:00 AM'} – {salon.openingHours?.[0]?.close || '8:00 PM'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-2">
        <div className="tab-bar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-item ${activeTab === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`px-5 pt-5 ${selectedServices.length > 0 ? "pb-28" : "pb-8"}`}>
        {activeTab === "Services" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Available Services</h3>
              <div className="space-y-3">
                {salon.services?.map((service: any) => (
                  <ServiceCard
                    key={service._id}
                    name={service.name}
                    description={service.description}
                    price={service.price}
                    duration={`${service.duration} min`}
                    popular={service.isPopular}
                    onToggle={(added) => handleServiceToggle(service, added)}
                  />
                ))}
                {salon.services?.length === 0 && (
                  <p className="text-center py-8 text-text-tertiary font-medium">No services listed yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Reviews" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dim">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-text-primary">{salon.rating}</div>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-icons-round text-[14px] star-filled">star</span>
                  ))}
                </div>
                <div className="text-xs text-text-secondary mt-1">{salon.totalReviews} reviews</div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary w-3">{star}</span>
                    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: star === 5 ? "85%" : star === 4 ? "10%" : "2%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center py-8 text-text-tertiary font-medium italic">Reviews coming soon!</p>
          </div>
        )}

        {activeTab === "About" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-bold text-[15px] text-text-primary mb-2">About</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                {salon.description || "A premium salon experience tailored for you."}
              </p>
            </div>
            <div className="divider" />
            <div>
              <h3 className="font-bold text-[15px] text-text-primary mb-3">Contact</h3>
              <div className="space-y-2.5">
                {salon.contactPhone && (
                  <a href={`tel:${salon.contactPhone}`} className="flex items-center gap-3 text-[13px] text-text-secondary">
                    <span className="material-icons-round text-[18px] text-primary">phone</span>
                    {salon.contactPhone}
                  </a>
                )}
                {salon.contactEmail && (
                  <a href={`mailto:${salon.contactEmail}`} className="flex items-center gap-3 text-[13px] text-text-secondary">
                    <span className="material-icons-round text-[18px] text-primary">email</span>
                    {salon.contactEmail}
                  </a>
                )}
                <div className="flex items-center gap-3 text-[13px] text-text-secondary">
                  <span className="material-icons-round text-[18px] text-primary">location_on</span>
                  {salon.address.street}, {salon.address.city}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 p-4 animate-slideUp">
          <button onClick={handleBookNow} className="w-full">
            <div className="gradient-primary rounded-2xl p-4 flex items-center justify-between shadow-[0_-4px_30px_rgba(236,72,153,0.3)]">
              <div>
                <div className="text-white/80 text-xs font-medium">
                  {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} selected
                </div>
                <div className="text-white text-lg font-bold">₹{totalPrice}</div>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold">
                Proceed to Checkout
                <span className="material-icons-round text-[20px]">arrow_forward</span>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
