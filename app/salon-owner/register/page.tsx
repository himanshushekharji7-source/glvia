"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function SalonOwnerRegisterPage() {
  const router = useRouter();
  
  // Owner Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Salon Details
  const [salonName, setSalonName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!name.trim()) return setError("Owner Name is required");
    if (!email.trim() || !email.includes("@")) return setError("Valid Email is required");
    if (password.length < 6) return setError("Password must be at least 6 characters long");
    if (!salonName.trim()) return setError("Salon Name is required");
    if (!phone.trim()) return setError("Phone Number is required");
    if (!city.trim()) return setError("City is required");

    setIsLoading(true);

    try {
      const { data, error: rpcError } = await supabase.rpc("register_salon_owner", {
        p_name: name.trim(),
        p_email: email.toLowerCase().trim(),
        p_password: password,
        p_salon_name: salonName.trim(),
        p_phone: phone.trim(),
        p_city: city.trim()
      });

      if (rpcError) {
        console.error("Registration error:", rpcError);
        throw new Error(rpcError.message || "Failed to register. Email might already exist.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/salon-owner/login");
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <span className="material-icons-round text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-slate-400 mb-6">
            Your salon account has been created successfully. Redirecting you to login...
          </p>
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative w-full max-w-md my-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Join the Marketplace</h1>
          <p className="text-slate-400 text-sm font-medium">Register your salon on glvia</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2.5 mb-6">
              <span className="material-icons-round text-[18px] flex-shrink-0">error_outline</span>
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Owner Details */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                <span className="material-icons-round text-pink-500 text-[18px]">person</span>
                Owner Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@salon.com"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-4 pr-12 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      tabIndex={-1}
                    >
                      <span className="material-icons-round text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Salon Details */}
            <div className="pt-2">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                <span className="material-icons-round text-pink-500 text-[18px]">storefront</span>
                Salon Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Salon Name</label>
                  <input
                    type="text"
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    placeholder="e.g. Elegance Beauty Salon"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Delhi"
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/15 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register Salon</span>
                  <span className="material-icons-round text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Already registered?{" "}
            <Link href="/salon-owner/login" className="text-pink-500 font-bold hover:text-pink-400 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
