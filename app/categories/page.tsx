"use client";

import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { useCategories } from "../lib/hooks";

const colorPalette = ["#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#14b8a6", "#a855f7", "#6366f1"];

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();

  return (
    <div className="min-h-dvh bg-surface-card pb-nav">
      <div className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-xl border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-dim">
            <span className="material-icons-round text-[20px]">arrow_back</span>
          </Link>
          <h1 className="text-lg font-bold text-text-primary">Categories</h1>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4 stagger">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="w-full h-24 bg-border/20 rounded-2xl animate-pulse" />
          ))
        ) : isError ? (
          <div className="py-12 text-center text-error">
             <span className="material-icons-round text-4xl mb-2">error_outline</span>
             <p className="font-bold">Failed to load categories</p>
          </div>
        ) : (
          categories?.map((cat: any, i: number) => {
            const color = colorPalette[i % colorPalette.length];
            return (
              <Link
                key={cat._id}
                href={`/search?category=${cat.slug}`}
                className="block card p-4 animate-fadeInUp hover:shadow-md transition-all border border-border"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: `${color}12` }}
                  >
                    <span
                      className="material-icons-round text-[28px]"
                      style={{ color }}
                    >
                      {cat.icon}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-[16px] text-text-primary">
                          {cat.name}
                        </h3>
                        <p className="text-[12px] text-text-tertiary mt-0.5">Explore the best {cat.name.toLowerCase()} salons</p>
                      </div>
                      <span className="material-icons-round text-[20px] text-text-tertiary">
                        chevron_right
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
