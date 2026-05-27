"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../lib/adminAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const { loginWithEmail, loginWithGoogle, isAuthenticated, admin } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && admin) {
      if (admin.role === "salon_owner") {
        router.replace("/salon-owner/dashboard");
      }
    }
  }, [isAuthenticated, admin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    const result = await loginWithEmail(email, password, pin || undefined);
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
    <div className="min-h-dvh bg-[#f5f6f8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle ambient blobs — professional, not playful */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Logo + Branding */}
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100 shrink-0">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image src="/logo.png" alt="GLVIA Admin" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-[22px] font-black text-[#111827] tracking-tight mb-1">Admin Portal</h1>
          <p className="text-[13px] text-[#6b7280] font-medium">Sign in to manage your platform</p>
        </div>

        {/* Login Card — elevated, authoritative */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#e5e7eb] rounded-3xl p-8 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
        >
          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-icons-round text-[16px] shrink-0">error</span>
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-2 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[20px]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@glvia.com"
                className="w-full pl-10 pr-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#111827] placeholder-[#9ca3af] text-sm focus:outline-none focus:border-[#ec4899]/60 focus:ring-2 focus:ring-[#ec4899]/10 focus:bg-white transition-all"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#111827] placeholder-[#9ca3af] text-sm focus:outline-none focus:border-[#ec4899]/60 focus:ring-2 focus:ring-[#ec4899]/10 focus:bg-white transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
              >
                <span className="material-icons-round text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Security PIN */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[12px] font-bold text-[#374151] uppercase tracking-wider">
                Security PIN
              </label>
              <span className="text-[11px] text-[#9ca3af] font-medium">Leave blank for first login</span>
            </div>
            <div className="relative">
              <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[20px]">
                security
              </span>
              <input
                type="password"
                maxLength={4}
                pattern="[0-9]*"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="4-digit PIN"
                className="w-full pl-10 pr-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#111827] placeholder-[#9ca3af] text-sm focus:outline-none focus:border-[#ec4899]/60 focus:ring-2 focus:ring-[#ec4899]/10 focus:bg-white transition-all text-center tracking-[0.5em] font-bold text-lg"
              />
            </div>
          </div>

          {/* Submit — authoritative gradient, not playful */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#e11d48] to-[#9333ea] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,29,72,0.2)] mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <span className="material-icons-round text-[18px]">login</span>
                Sign In
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#f3f4f6]" />
            <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider">or</p>
            <div className="flex-1 h-px bg-[#f3f4f6]" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-white text-[#111827] border border-[#e5e7eb] rounded-xl font-semibold text-sm hover:bg-[#f9fafb] hover:border-[#d1d5db] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Sign in with Google
          </button>
        </form>

        {/* Footer note — authority signal */}
        <p className="text-center text-[11px] text-[#9ca3af] font-medium mt-6">
          Restricted access — Super Admin only
        </p>
      </div>
    </div>
  );
}
