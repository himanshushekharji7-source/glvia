"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";

export default function GlviaBrandPage() {
  const router = useRouter();

  // For now, redirect to At Home or just act as a placeholder.
  // Uncomment the following to auto-redirect:
  // useEffect(() => { router.push('/'); }, [router]);

  return (
    <div className="min-h-dvh bg-white pb-nav flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl font-black text-pink-600 font-serif">G</span>
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Glvia Dashboard</h1>
      <p className="text-gray-500 text-sm">This is a placeholder for the brand home tab.</p>
      <button onClick={() => router.push('/')} className="mt-8 bg-black text-white px-6 py-2 rounded-lg font-bold">
        Go to At Home
      </button>
      <BottomNav />
    </div>
  );
}
