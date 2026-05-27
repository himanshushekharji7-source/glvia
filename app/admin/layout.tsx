"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../lib/adminAuth";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import AdminLoginPage from "../components/admin/AdminLoginPage";
import AdminPinSetupPage from "../components/admin/AdminPinSetupPage";
import AdminPinVerificationPage from "../components/admin/AdminPinVerificationPage";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, isPinVerified, isLoading, admin, is2FAVerified } = useAdminAuth();
  const router = useRouter();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-secondary font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated, not a super admin, or 2FA is not verified
  if (!isAuthenticated || !isAdmin || !is2FAVerified) {
    return <AdminLoginPage initialStep={isAuthenticated && isAdmin ? "2fa" : "login"} />;
  }

  // Authenticated & 2FA Verified — show admin dashboard
  return (
    <div className="min-h-dvh bg-surface flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
