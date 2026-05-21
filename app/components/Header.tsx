"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LocationPickerModal from "./LocationPickerModal";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLocation?: boolean;
  showNotification?: boolean;
  showGenderToggle?: boolean;
  showCart?: boolean;
  transparent?: boolean;
  gender?: "male" | "female";
  onGenderChange?: (g: "male" | "female") => void;
  cartCount?: number;
}

export default function Header({
  title,
  showBack = false,
  showLocation = true,
  showNotification = true,
  showGenderToggle = false,
  showCart = false,
  transparent = false,
  gender = "male",
  onGenderChange,
  cartCount = 0,
}: HeaderProps) {
  const [locationName, setLocationName] = useState("Fetching Location...");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    if (showLocation && !title) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "Unknown";
                const state = data.address.state || "";
                setLocationName(`${city}${state ? `, ${state}` : ''}`);
              } else {
                setLocationName("Location not found");
              }
            } catch (error) {
              setLocationName("Location Error");
            }
          },
          (error) => {
            setLocationName("Select Location");
          }
        );
      } else {
        setLocationName("Select Location");
      }
    }
  }, [showLocation, title]);

  const handleSelectLocation = (name: string, lat: string, lon: string) => {
    setLocationName(name);
    setIsLocationModalOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 px-5 py-3 flex items-center justify-between ${
          transparent
            ? ""
            : "bg-surface-card/90 backdrop-blur-xl border-b border-border"
        }`}
      >
        {/* Left: Back or Location */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBack && (
            <Link
              href="/"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-dim hover:bg-border-strong transition-colors shrink-0"
            >
              <span className="material-icons-round text-[20px] text-text-primary">
                arrow_back
              </span>
            </Link>
          )}
          {showLocation && !title && (
            <div 
              className="flex flex-col cursor-pointer group min-w-0"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <div className="flex items-center gap-1 text-text-tertiary text-[11px] font-medium uppercase tracking-widest group-hover:text-primary transition-colors">
                <span className="material-icons-round text-[12px]">location_on</span>
                Current Location
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-bold text-text-primary truncate max-w-[140px]">
                  {locationName}
                </span>
                <span className="material-icons-round text-[16px] text-text-secondary shrink-0 group-hover:translate-y-0.5 transition-transform">
                  keyboard_arrow_down
                </span>
              </div>
            </div>
          )}
          {title && (
            <h1 className="text-lg font-bold text-text-primary">{title}</h1>
          )}
        </div>

        {/* Right: Gender Toggle + Cart + Notification */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Gender Toggle */}
          {showGenderToggle && (
            <div className="flex items-center bg-surface-dim rounded-full p-0.5 border border-border">
              <button
                onClick={() => onGenderChange?.("male")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide transition-all duration-300 ${
                  gender === "male"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                M
              </button>
              <button
                onClick={() => onGenderChange?.("female")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide transition-all duration-300 ${
                  gender === "female"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                F
              </button>
            </div>
          )}

          {/* Cart Icon */}
          {showCart && (
            <Link
              href="/checkout"
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-surface-dim hover:bg-border-strong transition-colors"
            >
              <span className="material-icons-round text-[22px] text-text-primary">
                shopping_cart
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Notification */}
          {showNotification && !showCart && (
            <Link
              href="/notifications"
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-surface-dim hover:bg-border-strong transition-colors"
            >
              <span className="material-icons-round text-[20px] text-text-primary">
                notifications_none
              </span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Link>
          )}
        </div>
      </header>

      <LocationPickerModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        currentLocationName={locationName}
        onSelectLocation={handleSelectLocation}
      />
    </>
  );
}
