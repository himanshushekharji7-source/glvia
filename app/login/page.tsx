"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { supabase, TABLES } from "../lib/supabase";
import { useAdminAuth } from "../lib/adminAuth";
import Link from "next/link";
import Image from "next/image";

type Persona = null | "customer" | "owner";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { loginWithGoogle: ownerLoginWithGoogle, isAuthenticated, admin } = useAdminAuth();
  
  const [persona, setPersona] = useState<Persona>(null);
  
  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(0);

  // Status
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, route correctly
  useEffect(() => {
    if (isAuthenticated && admin) {
      if (admin.role === "super_admin") {
        router.replace("/admin");
      } else if (admin.role === "salon_owner") {
        router.replace("/salon-owner/dashboard");
      }
    }
  }, [isAuthenticated, admin, router]);

  // Timer for OTP Resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const cleanupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.error("Recaptcha clear error", e);
      }
      window.recaptchaVerifier = null;
    }
    const container = document.getElementById("recaptcha-container");
    if (container) container.innerHTML = "";
  };

  // --- Phone OTP Logic ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    // Format and validate phone
    const formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (formattedPhone.length < 11 || !formattedPhone.startsWith("+")) {
      setErrorMessage("Please enter a valid phone number with country code (e.g. +91).");
      return;
    }

    setIsLoading(true);
    try {
      cleanupRecaptcha();
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      setTimer(30);
      setSuccessMessage(`OTP sent successfully to ${phoneNumber}`);
    } catch (err: any) {
      console.error("OTP send error:", err);
      cleanupRecaptcha();
      
      if (err.code === "auth/too-many-requests") {
        setErrorMessage("Too many requests. Please try again later.");
      } else if (err.code === "auth/invalid-phone-number") {
        setErrorMessage("Invalid phone number format.");
      } else {
        setErrorMessage(err.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (otpCode.length < 6) {
      setErrorMessage("Please enter the 6-digit OTP.");
      return;
    }

    if (!confirmationResult) {
      setErrorMessage("OTP session expired. Please request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otpCode);
      const user = result.user;
      localStorage.setItem("token", user.uid);
      
      const sanitizedPhone = user.phoneNumber || phoneNumber.replace(/\s+/g, '');

      if (persona === "customer") {
        // Sync Customer
        const { data: existingUser } = await supabase
          .from(TABLES.USERS)
          .select("*")
          .eq("firebase_uid", user.uid)
          .maybeSingle();

        if (!existingUser) {
          // Provide a dummy email because the database schema requires email NOT NULL
          const dummyEmail = `${sanitizedPhone.replace("+", "")}@glvia.com`;
          const { error: insertError } = await supabase.from(TABLES.USERS).insert({
            firebase_uid: user.uid,
            phone_number: sanitizedPhone,
            first_name: "Customer",
            email: dummyEmail
          });
          
          if (insertError) {
             console.error("Supabase Customer Sync Error:", insertError);
             throw new Error("Failed to create customer profile.");
          }
        }
        router.push("/");
      } else if (persona === "owner") {
        // Sync Owner
        const { data: existingOwner } = await supabase
          .from("admin_users")
          .select("id, role, approval_status")
          .eq("firebase_uid", user.uid)
          .maybeSingle();

        if (!existingOwner) {
          // Check if they exist by phone number in case they were added by super admin manually
          const { data: byPhone } = await supabase
            .from("admin_users")
            .select("id, role, approval_status")
            .eq("phone", sanitizedPhone)
            .maybeSingle();
            
          if (byPhone) {
            // Link firebase_uid to the existing owner account
            await supabase.from("admin_users").update({ firebase_uid: user.uid }).eq("id", byPhone.id);
            if (byPhone.approval_status === "rejected" || byPhone.approval_status === "suspended") {
              setErrorMessage(`Your account is ${byPhone.approval_status}.`);
              return;
            }
            router.push(byPhone.role === "super_admin" ? "/admin" : "/salon-owner/dashboard");
          } else {
            // New owner -> must register
            router.push("/salon-owner/register");
          }
        } else {
          if (existingOwner.approval_status === "rejected" || existingOwner.approval_status === "suspended") {
            setErrorMessage(`Your account is ${existingOwner.approval_status}.`);
          } else {
            router.push(existingOwner.role === "super_admin" ? "/admin" : "/salon-owner/dashboard");
          }
        }
      }
    } catch (err: any) {
      console.error("OTP verify error:", err);
      setErrorMessage(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setIsOtpSent(false);
    setOtpCode("");
    setTimer(0);
    setErrorMessage("");
    setSuccessMessage("");
    cleanupRecaptcha();
  };

  // --- Google Auth Logic ---
  const handleGoogleSignIn = async (isOwner: boolean = false) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    if (isOwner) {
      const result = await ownerLoginWithGoogle();
      setIsLoading(false);
      
      if (!result.success) {
        if (result.error?.includes("No account found")) {
          router.push("/salon-owner/register");
        } else {
          setErrorMessage(result.error || "Google login failed");
        }
      } else {
        if (admin?.role === "super_admin") {
          router.push("/admin");
        } else {
          router.push("/salon-owner/dashboard");
        }
      }
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      localStorage.setItem("token", user.uid);

      const { data: existingUser } = await supabase
        .from(TABLES.USERS)
        .select("*")
        .eq("firebase_uid", user.uid)
        .maybeSingle();

      if (!existingUser) {
        await supabase.from(TABLES.USERS).insert({
          firebase_uid: user.uid,
          first_name: user.displayName?.split(" ")[0] || "User",
          last_name: user.displayName?.split(" ").slice(1).join(" ") || "",
          email: user.email || `${user.uid}@glvia.com`,
          phone_number: user.phoneNumber || "",
        });
      }

      router.push("/");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        setErrorMessage(error.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Persona Selection ---
  if (persona === null) {
    return (
      <div className="min-h-dvh flex flex-col md:flex-row bg-slate-950 overflow-hidden">
        {/* Customer Side */}
        <div 
          onClick={() => setPersona("customer")}
          className="relative flex-1 group cursor-pointer overflow-hidden transition-all duration-700 hover:flex-[1.2]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] opacity-90 transition-opacity group-hover:opacity-100 z-10" />
          <Image 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
            alt="Customer"
            fill
            className="object-cover mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20 text-white text-center transform transition-transform duration-500 group-hover:-translate-y-2">
            <span className="material-icons-round text-[64px] mb-4 drop-shadow-lg">face_retouching_natural</span>
            <h2 className="text-4xl font-black tracking-tight mb-3 drop-shadow-md">I am a Customer</h2>
            <p className="text-lg font-medium text-white/90 max-w-sm drop-shadow">Book premium salon services and explore beauty near you.</p>
            <div className="mt-8 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
              Continue as Customer
            </div>
          </div>
        </div>

        {/* Separator / OR Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:flex w-14 h-14 bg-slate-950 rounded-full items-center justify-center border-4 border-slate-900 shadow-2xl">
          <span className="text-sm font-black text-slate-400">OR</span>
        </div>

        {/* Owner Side */}
        <div 
          onClick={() => setPersona("owner")}
          className="relative flex-1 group cursor-pointer overflow-hidden transition-all duration-700 hover:flex-[1.2]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 opacity-95 transition-opacity group-hover:opacity-100 z-10" />
          <Image 
            src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80"
            alt="Salon Owner"
            fill
            className="object-cover mix-blend-overlay transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20 text-white text-center transform transition-transform duration-500 group-hover:-translate-y-2">
            <span className="material-icons-round text-[64px] mb-4 drop-shadow-lg text-pink-500">storefront</span>
            <h2 className="text-4xl font-black tracking-tight mb-3 drop-shadow-md">I am a Salon Owner</h2>
            <p className="text-lg font-medium text-slate-300 max-w-sm drop-shadow">Grow your business, manage bookings, and reach more clients.</p>
            <div className="mt-8 px-6 py-3 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-500/30 text-pink-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
              Go to Partner Portal
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Auth UI ---
  const isOwner = persona === "owner";
  
  return (
    <div className={`min-h-dvh flex flex-col select-none overflow-x-hidden transition-colors duration-500 ${isOwner ? "bg-slate-950" : "bg-surface-card"}`}>
      <div id="recaptcha-container"></div>
      
      {/* Header Background */}
      <div className={`relative h-[260px] flex flex-col items-center justify-end pb-10 overflow-hidden transition-colors duration-500 ${isOwner ? "bg-gradient-to-br from-slate-900 to-slate-950 border-b border-white/5" : "bg-gradient-to-br from-[#ec4899] via-[#b546cc] to-[#8b5cf6]"}`}>
        <div className={`absolute -top-12 -left-12 w-44 h-44 rounded-full blur-2xl animate-pulse ${isOwner ? "bg-pink-500/20" : "bg-white/10"}`} style={{ animationDuration: '4s' }} />
        <div className={`absolute -top-6 -right-6 w-32 h-32 rounded-full blur-xl ${isOwner ? "bg-purple-500/10" : "bg-white/5"}`} />
        
        <button 
          onClick={() => { setPersona(null); setErrorMessage(""); resetPhoneFlow(); }}
          className={`absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md transition-all ${isOwner ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-black/20 text-white hover:bg-black/30"}`}
        >
          <span className="material-icons-round text-[16px]">arrow_back</span>
          Back
        </button>

        <div className="relative z-10 text-center flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-2xl backdrop-blur-md ${isOwner ? "bg-pink-500/20 border border-pink-500/30" : "bg-white/15 border border-white/25"}`}>
            <span className={`material-icons-round text-[30px] ${isOwner ? "text-pink-400" : "text-white"}`}>
              {isOwner ? "storefront" : "phone_iphone"}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
            {isOwner ? "Salon Manager" : "glvia"}
          </h1>
          <p className={`text-[13px] mt-1 font-medium ${isOwner ? "text-slate-400" : "text-white/80"}`}>
            {isOwner ? "Partner Portal Access" : "Welcome to your beauty space"}
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-12 flex flex-col max-w-md w-full mx-auto">
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-500 text-[13px] font-bold rounded-2xl border border-red-500/20 flex items-start gap-3 shadow-lg">
            <span className="material-icons-round text-[18px]">error_outline</span>
            <span className="flex-1 mt-0.5 leading-snug">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-500 text-[13px] font-bold rounded-2xl border border-emerald-500/20 flex items-center gap-3">
            <span className="material-icons-round text-[18px]">check_circle_outline</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* ======================= PHONE OTP FLOW ======================= */}
        <div className="space-y-4">
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="group">
                <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block ${isOwner ? "text-slate-400" : "text-text-secondary"}`}>Mobile Number</label>
                <div className="relative flex items-center">
                  <span className={`material-icons-round absolute left-4 text-[19px] ${isOwner ? "text-slate-500" : "text-text-tertiary"}`}>phone</span>
                  <input 
                    type="tel" 
                    placeholder="+91 9876543210" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    required 
                    disabled={isLoading} 
                    className={`w-full pl-11 pr-4 py-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${isOwner ? "bg-white/[0.05] border border-white/10 text-white placeholder-slate-600 focus:border-pink-500/60 focus:ring-pink-500/15" : "input focus:bg-white focus:border-[#ec4899] focus:ring-[#ec4899]/20"}`} 
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className={`w-full py-4 mt-2 rounded-2xl text-white font-bold text-[14.5px] active:scale-[0.98] disabled:opacity-75 transition-all flex items-center justify-center gap-2 shadow-xl ${isOwner ? "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-pink-500/20" : "bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] shadow-[#ec4899]/30"}`}>
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Send OTP via SMS</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-scaleIn">
              <div className={`p-4 rounded-2xl mb-4 border flex items-center justify-between ${isOwner ? "bg-white/5 border-white/10" : "bg-surface-dim border-border/50"}`}>
                <div>
                  <p className={`text-[11px] font-bold uppercase ${isOwner ? "text-slate-400" : "text-text-secondary"}`}>Sending to</p>
                  <p className={`font-medium ${isOwner ? "text-white" : "text-text-primary"}`}>{phoneNumber}</p>
                </div>
                <button type="button" onClick={resetPhoneFlow} disabled={isLoading} className={`text-[12px] font-bold ${isOwner ? "text-pink-400 hover:text-pink-300" : "text-[#ec4899] hover:text-[#db2777]"}`}>Change</button>
              </div>

              <div className="group">
                <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block text-center ${isOwner ? "text-slate-400" : "text-text-secondary"}`}>Enter 6-Digit Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="• • • • • •" 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                  required 
                  disabled={isLoading} 
                  className={`w-full text-center tracking-[1em] text-2xl font-bold py-4 rounded-xl transition-all focus:outline-none focus:ring-2 ${isOwner ? "bg-white/[0.05] border border-white/10 text-white placeholder-slate-600 focus:border-pink-500/60 focus:ring-pink-500/15" : "input focus:bg-white focus:border-[#ec4899] focus:ring-[#ec4899]/20"}`} 
                />
              </div>

              <button type="submit" disabled={isLoading || otpCode.length < 6} className={`w-full py-4 mt-2 rounded-2xl text-white font-bold text-[14.5px] active:scale-[0.98] disabled:opacity-75 transition-all flex items-center justify-center gap-2 shadow-xl ${isOwner ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20" : "bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] shadow-[#8b5cf6]/30"}`}>
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Verify & Continue</span>}
              </button>

              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={handleSendOtp} 
                  disabled={timer > 0 || isLoading} 
                  className={`text-[12px] font-bold transition-colors ${timer > 0 ? (isOwner ? "text-slate-600" : "text-text-tertiary") : (isOwner ? "text-pink-400 hover:text-pink-300" : "text-[#ec4899] hover:text-[#db2777]")}`}
                >
                  {timer > 0 ? `Resend Code in ${timer}s` : "Resend OTP Code"}
                </button>
              </div>
            </form>
          )}

          {isOwner && (
            <div className="mt-8 animate-scaleIn">
              <div className="flex items-center gap-3 py-4">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">New to glvia?</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <Link href="/salon-owner/register" className="w-full py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl font-bold text-[14.5px] hover:bg-white/[0.08] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <span className="material-icons-round text-[18px] text-slate-400">storefront</span>
                Register New Salon
              </Link>
            </div>
          )}
        </div>

        {/* ======================= GOOGLE AUTH ======================= */}
        {!isOtpSent && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className={`flex-1 h-px ${isOwner ? "bg-white/10" : "bg-border"}`}></div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isOwner ? "text-slate-500" : "text-text-tertiary"}`}>Or Sign in with</span>
              <div className={`flex-1 h-px ${isOwner ? "bg-white/10" : "bg-border"}`}></div>
            </div>

            <button type="button" onClick={() => handleGoogleSignIn(isOwner)} disabled={isLoading} className={`w-full py-4 rounded-2xl font-bold text-[14px] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-md ${isOwner ? "bg-white text-slate-900 hover:bg-gray-100" : "bg-white text-slate-800 border border-gray-200 hover:bg-gray-50"}`}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google
            </button>
          </>
        )}

        <p className={`text-center text-[11px] mt-8 leading-normal ${isOwner ? "text-slate-500" : "text-text-tertiary"}`}>
          By continuing, you agree to glvia's{" "}
          <span className={`${isOwner ? "text-pink-400" : "text-[#ec4899]"} font-semibold hover:underline cursor-pointer`}>Terms of Service</span>
          {" "}and{" "}
          <span className={`${isOwner ? "text-pink-400" : "text-[#ec4899]"} font-semibold hover:underline cursor-pointer`}>Privacy Policy</span>
        </p>

      </div>
    </div>
  );
}
