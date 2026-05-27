"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../lib/adminAuth";
import Image from "next/image";

export default function SalonOwnerLoginPage() {
  const router = useRouter();
  const { isAuthenticated, admin } = useAdminAuth();

  // Redirect already-authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && admin) {
      if (admin.approval_status === "rejected" || admin.approval_status === "suspended") {
        // Blocked — send to unified login with error context
        router.replace("/login?persona=owner");
      } else {
        const allowedRoles = ["salon_owner", "super_admin"];
        if (allowedRoles.includes(admin.role)) {
          router.replace("/salon-owner/dashboard");
          return;
        }
      }
    } else if (!isAuthenticated) {
      // Not logged in — send to unified login gateway
      router.replace("/login?persona=owner");
    }
  }, [isAuthenticated, admin, router]);

  // While redirect is processing, show a clean premium light loading screen
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f8f9fa]">
      {/* Ambient glow blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-pink-500/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-5">
        {/* Logo */}
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shadow-md bg-white">
          <Image src="/logo.png" alt="Glvia Logo" fill className="object-cover" />
        </div>

        {/* Spinner */}
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />

        <p className="text-sm text-text-secondary font-medium">Redirecting to login...</p>
      </div>
    </div>
  );
}
