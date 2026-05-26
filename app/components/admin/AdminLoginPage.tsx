"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../lib/adminAuth";
import { useRouter } from "next/navigation";

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
    <div className="min-h-dvh bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/20">
            <span className="material-icons-round text-white text-[32px]">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">glvia Admin</h1>
          <p className="text-gray-400 text-sm">Sign in to manage your website</p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-icons-round text-[16px]">error</span>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
            <div className="relative">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@glvia.com"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10 transition-all"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
            <div className="relative">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10 transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <span className="material-icons-round text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-300">Security PIN</label>
              <span className="text-[10px] text-gray-500 font-medium">Leave blank for first login</span>
            </div>
            <div className="relative">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
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
                className="w-full pl-10 pr-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10 transition-all text-center tracking-[0.5em] font-bold text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">or</p>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-md"
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
      </div>
    </div>
  );
}
