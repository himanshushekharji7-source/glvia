"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "../lib/adminAuth";

const ALLOWED_ROLES = ["salon_owner", "super_admin"];

function SalonOwnerGuard({ children }: { children: React.ReactNode }) {
  const { admin, isLoading, isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === "/salon-owner/login";

  useEffect(() => {
    if (isLoading) return;

    if (isPublicPage) {
      if (isAuthenticated && admin && ALLOWED_ROLES.includes(admin.role)) {
        if (admin.approval_status !== "rejected" && admin.approval_status !== "suspended") {
          router.replace("/salon-owner/dashboard");
        }
      }
      return;
    }

    if (!isAuthenticated) {
      router.replace("/salon-owner/login");
      return;
    }

    if (admin && !ALLOWED_ROLES.includes(admin.role)) {
      router.replace("/salon-owner/login");
    }
  }, [isLoading, isAuthenticated, admin, router, isPublicPage]);

  const isRedirectingToDashboard = isPublicPage && isAuthenticated && admin && ALLOWED_ROLES.includes(admin.role) && admin.approval_status !== "rejected" && admin.approval_status !== "suspended";
  const isRedirectingToLogin = !isPublicPage && (!isAuthenticated || (admin && !ALLOWED_ROLES.includes(admin.role)));

  if (isLoading || isRedirectingToDashboard) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-secondary font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isRedirectingToLogin) {
    // Will redirect, show loading in the meantime
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function SalonOwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <SalonOwnerGuard>{children}</SalonOwnerGuard>
    </AdminAuthProvider>
  );
}
