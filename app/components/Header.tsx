"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  merged?: boolean;
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
  merged = false,
}: HeaderProps) {
  const [locationName, setLocationName] = useState("Fetching Location...");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!merged) return;
    
    // Check initial scroll position
    setIsScrolled(window.scrollY > 10);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [merged]);


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

  const isTransparent = merged ? !isScrolled : transparent;

  return (
    <>
      <header
        className={`sticky top-0 z-40 px-5 py-3 flex items-center justify-between h-[64px] transition-all duration-300 ${
          isTransparent
            ? "bg-transparent border-b border-transparent"
            : "bg-surface-card/90 backdrop-blur-xl border-b border-border shadow-sm"
        }`}
      >
        {/* Left: Back or Location */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {!showBack && showLocation && (
            <Link href="/" className="shrink-0 flex items-center justify-center">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-100/20 bg-white shadow-sm hover:scale-105 transition-transform shrink-0">
                <Image src="/logo.png" alt="Glvia Logo" fill className="object-cover" />
              </div>
            </Link>
          )}
          {showBack && (
            <Link
              href="/"
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors shrink-0 ${
                isTransparent
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-surface-dim hover:bg-border-strong text-text-primary"
              }`}
            >
              <span className={`material-icons-round text-[20px] transition-colors ${
                isTransparent ? "text-white" : "text-text-primary"
              }`}>
                arrow_back
              </span>
            </Link>
          )}
          {showLocation && !title && (
            <div 
              className="flex flex-col cursor-pointer group min-w-0"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <div className={`flex items-center gap-1 text-[11px] font-medium uppercase tracking-widest transition-colors ${
                isTransparent
                  ? "text-white/80 group-hover:text-white"
                  : "text-text-tertiary group-hover:text-primary"
              }`}>
                <span className="material-icons-round text-[12px]">location_on</span>
                Current Location
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[14px] font-bold truncate max-w-[140px] transition-colors ${
                  isTransparent ? "text-white" : "text-text-primary"
                }`}>
                  {locationName}
                </span>
                <span className={`material-icons-round text-[16px] shrink-0 group-hover:translate-y-0.5 transition-all ${
                  isTransparent ? "text-white/90" : "text-text-secondary"
                }`}>
                  keyboard_arrow_down
                </span>
              </div>
            </div>
          )}
          {title && (
            <h1 className={`text-lg font-bold transition-colors ${
              isTransparent ? "text-white" : "text-text-primary"
            }`}>{title}</h1>
          )}
        </div>

        {/* Right: Gender Toggle + Cart + Notification */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Gender Toggle */}
          {showGenderToggle && (
            <div className={`flex items-center rounded-full p-0.5 border transition-all ${
              isTransparent
                ? "bg-white/10 backdrop-blur-md border-white/20"
                : "bg-surface-dim border-border"
            }`}>
              <button
                onClick={() => onGenderChange?.("male")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide transition-all duration-300 cursor-pointer ${
                  gender === "male"
                    ? (isTransparent ? "bg-white text-primary-dark shadow-md" : "bg-primary text-white shadow-md")
                    : (isTransparent ? "text-white hover:text-white/80" : "text-text-secondary hover:text-text-primary")
                }`}
              >
                M
              </button>
              <button
                onClick={() => onGenderChange?.("female")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide transition-all duration-300 cursor-pointer ${
                  gender === "female"
                    ? (isTransparent ? "bg-white text-primary-dark shadow-md" : "bg-primary text-white shadow-md")
                    : (isTransparent ? "text-white hover:text-white/80" : "text-text-secondary hover:text-text-primary")
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
              className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all border ${
                isTransparent
                  ? "bg-white/10 border-white/20 hover:bg-white/20"
                  : "bg-surface-dim hover:bg-border-strong border-transparent"
              }`}
            >
              <span className={`material-icons-round text-[22px] transition-colors ${
                isTransparent ? "text-white" : "text-text-primary"
              }`}>
                shopping_cart
              </span>
              {cartCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg transition-colors ${
                  isTransparent ? "bg-white text-primary" : "bg-primary text-white"
                }`}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Notification */}
          {showNotification && !showCart && (
            <Link
              href="/notifications"
              className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all border ${
                isTransparent
                  ? "bg-white/10 border-white/20 hover:bg-white/20"
                  : "bg-surface-dim hover:bg-border-strong border-transparent"
              }`}
            >
              <span className={`material-icons-round text-[20px] transition-colors ${
                isTransparent ? "text-white" : "text-text-primary"
              }`}>
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
