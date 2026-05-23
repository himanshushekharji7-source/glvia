"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../../lib/adminAuth";
import Image from "next/image";

export default function SalonOwnerLoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, isAuthenticated, admin } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && admin) {
      if (admin.approval_status !== "approved") {
        setError("Your account is pending approval by an admin.");
      } else {
        const allowedRoles = ["salon_owner", "admin", "super_admin"];
        if (allowedRoles.includes(admin.role)) {
          router.replace("/salon-owner/dashboard");
        }
      }
    }
  }, [isAuthenticated, admin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required"); return; }
    if (!password.trim()) { setError("Password is required"); return; }

    setIsLoading(true);
    const result = await loginWithEmail(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.error || "Google login failed");
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/30">
              <span className="material-icons-round text-white text-[38px]">content_cut</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-slate-950">
              <span className="material-icons-round text-slate-950 text-[14px]">verified</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Salon Manager</h1>
          <p className="text-slate-400 text-sm font-medium">Sign in to your owner portal</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-5 shadow-2xl"
        >
          {/* Error alert */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2.5">
              <span className="material-icons-round text-[18px] flex-shrink-0">error_outline</span>
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-md"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Sign in with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">or sign in with email</p>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                mail_outline
              </span>
              <input
                id="owner-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@glvia.com"
                className="w-full pl-12 pr-4 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
                lock_outline
              </span>
              <input
                id="owner-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-14 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                <span className="material-icons-round text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="owner-login-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span className="material-icons-round text-[18px]">login</span>
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Back to main site */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
          >
            <span className="material-icons-round text-[14px]">arrow_back</span>
            Back to glvia
          </a>
        </div>
      </div>
    </div>
  );
}
