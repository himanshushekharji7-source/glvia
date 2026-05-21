"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import SalonCard from "../components/SalonCard";
import { useSalons } from "../lib/hooks";

const filters = ["All", "Nearby", "Top Rated", "Budget", "Premium", "Available Now"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: salons, isLoading, isError } = useSalons(query);

  return (
    <div className="min-h-dvh bg-surface-card pb-nav">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-xl border-b border-border px-5 pt-4 pb-3">
        <div className="relative">
          <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-text-tertiary">
            search
          </span>
          <input
            type="text"
            placeholder="Search salons, services..."
            className="input pl-11 pr-24"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button className="w-9 h-9 rounded-xl bg-surface-dim flex items-center justify-center hover:bg-border-strong transition-colors">
              <span className="material-icons-round text-[18px] text-text-secondary">mic</span>
            </button>
            <button className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <span className="material-icons-round text-[18px] text-white">tune</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="scroll-x mt-3 !px-0 !gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`chip ${activeFilter === filter ? "chip-active" : ""}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-secondary">
            {isLoading ? (
              <span className="animate-pulse">Loading salons...</span>
            ) : (
              <><span className="font-bold text-text-primary">{salons?.length || 0}</span> salons found</>
            )}
          </p>
          <button className="flex items-center gap-1 text-xs font-semibold text-text-secondary">
            <span className="material-icons-round text-[14px]">sort</span>
            Sort by
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-full h-32 bg-border/20 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-error">
             <span className="material-icons-round text-4xl mb-2">error_outline</span>
             <p className="font-bold">Failed to load salons</p>
          </div>
        ) : (
          <div className="space-y-4 stagger">
            {salons?.map((salon: any, i: number) => (
              <div key={salon._id} className="animate-fadeInUp" style={{ animationDelay: `${i * 80}ms` }}>
                <SalonCard 
                  id={salon._id}
                  name={salon.name}
                  image={salon.images?.[0] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=450&fit=crop"}
                  rating={salon.rating}
                  reviews={salon.totalReviews}
                  distance="1.2 km" // Placeholder for distance
                  address={`${salon.address.street}, ${salon.address.city}`}
                  tags={["Hair", "Spa"]} // Placeholder or map from services
                  priceRange="₹45" // Placeholder
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && salons?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-surface-dim flex items-center justify-center mb-4">
              <span className="material-icons-round text-[36px] text-text-tertiary">search_off</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">No results found</h3>
            <p className="text-sm text-text-secondary text-center">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
