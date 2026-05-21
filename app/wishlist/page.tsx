"use client";

import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { useWishlist } from "../lib/hooks";

export default function WishlistPage() {
  const { data: wishlist, isLoading, isError } = useWishlist();

  return (
    <div className="min-h-dvh bg-surface-card pb-nav">
      <div className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-xl border-b border-border px-5 py-3">
        <h1 className="text-lg font-bold text-text-primary">My Wishlist</h1>
      </div>

      {isLoading ? (
        <div className="px-5 pt-4 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="w-full h-24 bg-border/20 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-error">
           <span className="material-icons-round text-4xl mb-2">error_outline</span>
           <p className="font-bold">Failed to load wishlist</p>
        </div>
      ) : wishlist?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-icons-round text-[36px] text-primary">favorite</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-1">No saved salons yet</h3>
          <p className="text-sm text-text-secondary text-center mb-6">Start exploring and save your favorite salons</p>
          <Link href="/search"><button className="btn-primary">Explore Salons</button></Link>
        </div>
      ) : (
        <div className="px-5 pt-4 space-y-3 stagger">
          {wishlist.map((item: any, i: number) => (
            <div key={item._id} className="flex gap-3 p-3 rounded-2xl border border-border animate-fadeInUp hover:shadow-sm transition-all" style={{ animationDelay: `${i * 60}ms` }}>
              <Link href={`/salon/${item._id}`} className="shrink-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-dim">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop'})` }} />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/salon/${item._id}`}>
                  <h3 className="font-bold text-[14px] text-text-primary truncate">{item.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="material-icons-round text-[12px] text-amber-500">star</span>
                  <span className="text-[12px] font-semibold text-text-primary">{item.rating || '4.8'}</span>
                  <span className="text-[11px] text-text-tertiary">• {item.address?.city || 'Nearby'}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                   <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/5 text-primary">Salon</span>
                </div>
              </div>
              <button className="self-start shrink-0 w-8 h-8 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-icons-round text-[16px] text-error">favorite</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
