"use client";

import { useState, useEffect } from "react";

interface LocationInfo {
  name: string;
  lat: string;
  lon: string;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationName: string;
  onSelectLocation: (name: string, lat: string, lon: string) => void;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  currentLocationName,
  onSelectLocation,
}: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: string; lon: string } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchQuery
            )}&addressdetails=1&limit=5`
          );
          const data = await res.json();
          setResults(data);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 500); // debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUseLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedCoords({ lat: String(latitude), lon: String(longitude) });
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            if (data && data.address) {
              const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.state_district ||
                "Unknown";
              const state = data.address.state || "";
              onSelectLocation(`${city}${state ? `, ${state}` : ""}`, String(latitude), String(longitude));
            }
          } catch (error) {
            console.error(error);
          }
        },
        (error) => {
          alert("Location access denied. Please type your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-surface-card md:rounded-3xl rounded-t-3xl z-50 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-card">
          <h3 className="font-bold text-text-primary text-lg">Select Location</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-dim text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="material-icons-round text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Current Location Button */}
          <button
            onClick={handleUseLiveLocation}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 transition-colors mb-5"
          >
            <span className="material-icons-round">my_location</span>
            <div className="text-left">
              <div className="font-bold text-sm">Use Live Location</div>
              <div className="text-xs text-primary/70 mt-0.5">Using GPS & OpenStreetMap</div>
            </div>
          </button>

          {/* Search Input */}
          <div className="relative mb-4">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              search
            </span>
            <input
              type="text"
              placeholder="Search city, area, or zip code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-dim border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-tertiary"
            />
            {isSearching && (
              <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin text-[18px]">
                refresh
              </span>
            )}
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="space-y-2 mb-6">
              {results.map((result, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const city =
                      result.address?.city ||
                      result.address?.town ||
                      result.address?.village ||
                      result.address?.state_district ||
                      result.name;
                    const state = result.address?.state || "";
                    const displayName = `${city}${state ? `, ${state}` : ""}`;
                    setSelectedCoords({ lat: result.lat, lon: result.lon });
                    onSelectLocation(displayName, result.lat, result.lon);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-dim transition-colors text-left"
                >
                  <span className="material-icons-round text-text-tertiary">place</span>
                  <div>
                    <div className="text-sm font-bold text-text-primary">
                      {result.address?.city || result.address?.town || result.address?.village || result.name}
                    </div>
                    <div className="text-xs text-text-secondary truncate">
                      {result.display_name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Map Preview */}
          {selectedCoords && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-border h-[200px] relative bg-surface-dim">
              <iframe
                title="Location Map Preview"
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(selectedCoords.lon) - 0.05},${parseFloat(selectedCoords.lat) - 0.05},${parseFloat(selectedCoords.lon) + 0.05},${parseFloat(selectedCoords.lat) + 0.05}&layer=mapnik&marker=${selectedCoords.lat},${selectedCoords.lon}`}
                className="w-full h-full"
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
