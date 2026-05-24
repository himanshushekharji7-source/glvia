"use client";

import { useState, useEffect, useRef } from "react";
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
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Persona = null | "customer" | "owner";
type ViewState = "role-selection" | "login" | "otp" | "success";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

// Reusable Shimmer Button
const PremiumButton = ({ 
  children, 
  onClick, 
  disabled, 
  type = "button", 
  className = "", 
  isLoading = false 
}: any) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled || isLoading}
    whileHover={{ scale: 1.015, y: -1 }}
    whileTap={{ scale: 0.97 }}
    className={`relative overflow-hidden w-full py-4 rounded-2xl font-bold text-[14px] shadow-xl disabled:opacity-70 transition-all flex items-center justify-center gap-2 group ${className}`}
  >
    {/* Shimmer Effect */}
    <motion.div 
      initial={{ x: "-100%" }}
      animate={{ x: "200%" }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      className="absolute inset-0 z-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
    />
    <span className="relative z-10 flex items-center gap-2">
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </span>
  </motion.button>
);

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { loginWithGoogle: ownerLoginWithGoogle, isAuthenticated, admin } = useAdminAuth();
  
  const [persona, setPersona] = useState<Persona>(null);
  const [view, setView] = useState<ViewState>("role-selection");
  
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated && admin) {
      if (admin.role === "super_admin") router.replace("/admin");
      else if (admin.role === "salon_owner") router.replace("/salon-owner/dashboard");
    }
  }, [isAuthenticated, admin, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const cleanupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (e) {}
      window.recaptchaVerifier = null;
    }
    const container = document.getElementById("recaptcha-container");
    if (container) container.innerHTML = "";
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    
    const formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (formattedPhone.length < 11 || !formattedPhone.startsWith("+")) {
      setErrorMessage("Please enter a valid phone number with country code (e.g. +91).");
      return;
    }

    setIsLoading(true);
    try {
      cleanupRecaptcha();
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setView("otp");
      setTimer(30);
      
      setTimeout(() => {
        if (otpInputRef.current) otpInputRef.current.focus();
      }, 400);
      
    } catch (err: any) {
      cleanupRecaptcha();
      if (err.code === "auth/too-many-requests") setErrorMessage("Too many requests. Please try again later.");
      else if (err.code === "auth/invalid-phone-number") setErrorMessage("Invalid phone number format.");
      else setErrorMessage(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const processSuccessfulLogin = async (user: any) => {
    localStorage.setItem("token", user.uid);
    const sanitizedPhone = user.phoneNumber || phoneNumber.replace(/\s+/g, '');

    try {
      if (persona === "customer") {
        const { data: existingUser } = await supabase.from(TABLES.USERS).select("*").eq("firebase_uid", user.uid).maybeSingle();
        if (!existingUser) {
          const dummyEmail = `${sanitizedPhone.replace("+", "")}@glvia.com`;
          const { error: insertError } = await supabase.from(TABLES.USERS).insert({
            firebase_uid: user.uid, phone_number: sanitizedPhone, first_name: "Customer", email: dummyEmail
          });
          if (insertError) throw new Error("Failed to create customer profile.");
        }
      } else if (persona === "owner") {
        const { data: existingOwner } = await supabase.from("admin_users").select("id, role, approval_status").eq("firebase_uid", user.uid).maybeSingle();
        if (!existingOwner) {
          const { data: byPhone } = await supabase.from("admin_users").select("id, role, approval_status").eq("phone", sanitizedPhone).maybeSingle();
          if (byPhone) {
            await supabase.from("admin_users").update({ firebase_uid: user.uid }).eq("id", byPhone.id);
            if (byPhone.approval_status === "rejected" || byPhone.approval_status === "suspended") {
              setErrorMessage(`Your account is ${byPhone.approval_status}.`);
              return false;
            }
          } else {
            router.push("/salon-owner/register");
            return false;
          }
        } else {
          if (existingOwner.approval_status === "rejected" || existingOwner.approval_status === "suspended") {
            setErrorMessage(`Your account is ${existingOwner.approval_status}.`);
            return false;
          }
        }
      }
      return true;
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sync profile.");
      return false;
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (otpCode.length < 6) return setErrorMessage("Please enter the 6-digit OTP.");
    if (!confirmationResult) return setErrorMessage("OTP session expired. Please request a new one.");

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otpCode);
      const isSuccess = await processSuccessfulLogin(result.user);
      if (isSuccess) setView("success");
    } catch (err: any) {
      setErrorMessage("Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);

    if (persona === "owner") {
      const result = await ownerLoginWithGoogle();
      setIsLoading(false);
      if (!result.success) {
        if (result.error?.includes("No account found")) router.push("/salon-owner/register");
        else setErrorMessage(result.error || "Google login failed");
      } else {
        if (admin?.role === "super_admin") router.push("/admin");
        else setView("success");
      }
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const isSuccess = await processSuccessfulLogin(result.user);
      if (isSuccess) setView("success");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") setErrorMessage(error.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessRedirect = () => {
    if (persona === "customer") router.push("/");
    else if (persona === "owner") router.push("/salon-owner/dashboard");
  };

  const switchPersona = () => {
    setPersona(persona === "customer" ? "owner" : "customer");
    setErrorMessage("");
  };

  const backgroundVariants = {
    "role-selection": { filter: "brightness(1.0) blur(0px)", scale: 1 },
    "login": { filter: "brightness(0.5) blur(6px)", scale: 1.05 },
    "otp": { filter: "brightness(0.4) blur(10px)", scale: 1.1 },
    "success": { filter: "brightness(0.7) blur(4px)", scale: 1.02 }
  };

  const containerVariants: any = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", bounce: 0.3, duration: 0.8, staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0, y: -20, scale: 0.95, filter: "blur(8px)", transition: { duration: 0.4 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-slate-950 font-sans antialiased">
      <div id="recaptcha-container"></div>
      
      {/* Dynamic Background Image */}
      <motion.div 
        className="absolute inset-0 z-0 origin-center"
        animate={backgroundVariants[view]}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
          alt="Luxury Salon Background"
          fill
          className="object-cover opacity-90"
          priority
        />
        {/* Luxury Vignette & Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.6)_100%)]" />
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ======================= ROLE SELECTION ======================= */}
        {view === "role-selection" && (
          <motion.div 
            key="role-selection"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-[420px] px-5"
          >
            <div className="bg-white/90 backdrop-blur-3xl p-8 sm:p-10 rounded-[36px] shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-white/60 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
              
              <motion.h1 variants={itemVariants} className="text-[40px] font-black bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tighter drop-shadow-sm">
                Glvia.com
              </motion.h1>
              <motion.p variants={itemVariants} className="text-slate-600 text-[14px] font-medium leading-relaxed mb-10 px-2">
                Elevate your beauty experience.<br/>Choose how you want to connect today.
              </motion.p>

              <div className="space-y-4 relative z-10">
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setPersona("owner"); setView("login"); }}
                  className="w-full group bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-5 hover:border-pink-200 hover:shadow-[0_15px_30px_-5px_rgba(236,72,153,0.15)] transition-all duration-300 text-left"
                >
                  <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-pink-50 to-rose-50 text-pink-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-inner transition-transform duration-300">
                    <span className="material-icons-round text-[28px]">content_cut</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-bold text-slate-900 tracking-tight mb-1">I'm a Beauty Professional</h3>
                    <p className="text-[12px] text-slate-500 font-medium leading-tight">Grow your salon business with Glvia</p>
                  </div>
                  <span className="material-icons-round text-slate-300 group-hover:text-pink-500 group-hover:translate-x-1.5 transition-all duration-300">arrow_forward_ios</span>
                </motion.button>

                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setPersona("customer"); setView("login"); }}
                  className="w-full group bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-5 hover:border-purple-200 hover:shadow-[0_15px_30px_-5px_rgba(168,85,247,0.15)] transition-all duration-300 text-left"
                >
                  <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-inner transition-transform duration-300">
                    <span className="material-icons-round text-[28px]">face_retouching_natural</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-bold text-slate-900 tracking-tight mb-1">I'm looking for a Stylist</h3>
                    <p className="text-[12px] text-slate-500 font-medium leading-tight">Book premium beauty services near you</p>
                  </div>
                  <span className="material-icons-round text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1.5 transition-all duration-300">arrow_forward_ios</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================= LOGIN VIEW ======================= */}
        {view === "login" && (
          <motion.div 
            key="login"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full px-4 fixed bottom-6 sm:static sm:max-w-[420px] sm:bottom-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-8 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
              <h1 className="text-5xl font-black text-white tracking-tighter mb-2">GLVIA</h1>
              <p className="text-white/90 text-[15px] font-medium tracking-wide">
                {persona === "owner" ? "Partner Portal" : "Welcome to GLVIA"}
              </p>
            </motion.div>

            <div className="bg-white/95 backdrop-blur-3xl rounded-[36px] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.25)] border border-white/20 relative overflow-hidden">
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/70 backdrop-blur-md z-20 flex flex-col items-center justify-center"
                  >
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-pink-500 rounded-full animate-spin mb-4 shadow-lg" />
                    <span className="text-sm font-bold text-slate-800 animate-pulse">Securing connection...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants} className="text-center mb-8">
                <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                <h2 className="text-[22px] font-black text-slate-900 tracking-tight mb-2">
                  {persona === "owner" ? "Salon Partner Login" : "Customer Login"}
                </h2>
                <p className="text-[13px] text-slate-500 font-medium">
                  {persona === "owner" ? "Manage your bookings and grow your business." : "Enter your phone number to continue."}
                </p>
              </motion.div>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-[13px] font-bold rounded-2xl border border-red-100 flex items-start gap-3 shadow-sm"
                  >
                    <span className="material-icons-round text-[18px]">error</span>
                    <span className="flex-1 leading-snug">{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendOtp} className="space-y-5 relative z-10">
                <motion.div variants={itemVariants} className="relative group">
                  <span className="material-icons-round absolute left-4.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 group-focus-within:text-pink-500 transition-colors z-10">phone_iphone</span>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number (+91...)" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    required 
                    className="w-full pl-[50px] pr-5 py-4.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all shadow-sm" 
                  />
                  {/* Subtle input glow */}
                  <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-md bg-pink-500/20 transition-opacity duration-500" />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <PremiumButton type="submit" className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-white shadow-pink-500/25">
                    Send OTP <span className="material-icons-round text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </PremiumButton>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="flex items-center gap-4 my-7">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">OR</span>
                <div className="flex-1 h-px bg-slate-100" />
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button 
                  type="button" 
                  onClick={handleGoogleSignIn} 
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                >
                  <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Continue with Google
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8 text-center">
                <button onClick={switchPersona} className="text-[13px] font-bold text-slate-500 hover:text-pink-600 transition-colors">
                  {persona === "owner" ? "Login as Customer" : "Login as Salon Partner"}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ======================= OTP VIEW ======================= */}
        {view === "otp" && (
          <motion.div 
            key="otp"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full px-4 fixed bottom-6 sm:static sm:max-w-[420px] sm:bottom-auto"
          >
            <div className="bg-white/95 backdrop-blur-3xl rounded-[36px] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.25)] border border-white/20 relative overflow-hidden">
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setView("login")}
                className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 border border-slate-100 shadow-sm transition-colors"
              >
                <span className="material-icons-round text-[18px]">arrow_back</span>
              </motion.button>

              <motion.div variants={itemVariants} className="text-center mt-6 mb-10">
                <h2 className="text-[26px] font-black text-slate-900 mb-2 tracking-tight">Verify Phone</h2>
                <p className="text-[14px] text-slate-500 font-medium px-4 leading-relaxed">
                  Enter the 6-digit code sent to <br/><span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">{phoneNumber}</span>
                </p>
              </motion.div>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                    <div className="text-center text-red-600 text-[13px] font-bold bg-red-50 py-3 px-4 rounded-xl border border-red-100">
                      {errorMessage}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <motion.div variants={itemVariants} className="relative group">
                  {/* Premium OTP Input styling */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500" />
                  <input 
                    ref={otpInputRef}
                    type="text" 
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="------" 
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                    required 
                    className="relative w-full text-center tracking-[1em] pl-[1em] text-[32px] font-black py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 placeholder-slate-200 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.1)] transition-all" 
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <PremiumButton type="submit" disabled={otpCode.length < 6} isLoading={isLoading} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25">
                    Verify Code
                  </PremiumButton>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center">
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    disabled={timer > 0 || isLoading} 
                    className={`text-[13px] font-bold transition-all ${timer > 0 ? "text-slate-400" : "text-slate-700 hover:text-pink-600"}`}
                  >
                    {timer > 0 ? `Resend code in 00:${timer.toString().padStart(2, '0')}` : "Resend SMS Code"}
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ======================= SUCCESS VIEW ======================= */}
        {view === "success" && (
          <motion.div 
            key="success"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full px-4 fixed bottom-6 sm:static sm:max-w-[400px] sm:bottom-auto"
          >
            <div className="bg-white/95 backdrop-blur-3xl rounded-[36px] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.25)] border border-white/20 text-center relative overflow-hidden">
              {/* Confetti / Glow effects in background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[200px] bg-gradient-to-b from-pink-500/20 to-transparent blur-3xl pointer-events-none" />
              
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-28 h-28 mx-auto mb-8 rounded-[32px] bg-gradient-to-br from-pink-600 via-rose-500 to-purple-600 flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(236,72,153,0.5)] rotate-3"
              >
                <motion.span 
                  initial={{ opacity: 0, scale: 0, pathLength: 0 }}
                  animate={{ opacity: 1, scale: 1, pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.4, type: "spring" }}
                  className="material-icons-round text-white text-[64px]"
                >
                  check
                </motion.span>
              </motion.div>
              
              <motion.h2 
                variants={itemVariants}
                className="text-[32px] font-black text-slate-900 tracking-tight mb-3"
              >
                Success!
              </motion.h2>
              
              <motion.p 
                variants={itemVariants}
                className="text-[14.5px] font-medium text-slate-500 leading-relaxed mb-10 px-2"
              >
                Your account has been verified. Welcome to the premium GLVIA experience.
              </motion.p>

              <motion.div variants={itemVariants}>
                <PremiumButton onClick={handleSuccessRedirect} className="bg-slate-900 text-white shadow-slate-900/20">
                  Get Started <span className="material-icons-round text-[18px]">arrow_forward</span>
                </PremiumButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
