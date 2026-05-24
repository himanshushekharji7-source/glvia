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

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { loginWithGoogle: ownerLoginWithGoogle, isAuthenticated, admin } = useAdminAuth();
  
  const [persona, setPersona] = useState<Persona>(null);
  const [view, setView] = useState<ViewState>("role-selection");
  
  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(0);

  // Status
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

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
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setView("otp");
      setTimer(30);
      
      // Auto focus OTP input after a slight delay for transition
      setTimeout(() => {
        if (otpInputRef.current) otpInputRef.current.focus();
      }, 300);
      
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

  const processSuccessfulLogin = async (user: any) => {
    localStorage.setItem("token", user.uid);
    const sanitizedPhone = user.phoneNumber || phoneNumber.replace(/\s+/g, '');

    try {
      if (persona === "customer") {
        const { data: existingUser } = await supabase
          .from(TABLES.USERS)
          .select("*")
          .eq("firebase_uid", user.uid)
          .maybeSingle();

        if (!existingUser) {
          const dummyEmail = `${sanitizedPhone.replace("+", "")}@glvia.com`;
          const { error: insertError } = await supabase.from(TABLES.USERS).insert({
            firebase_uid: user.uid,
            phone_number: sanitizedPhone,
            first_name: "Customer",
            email: dummyEmail
          });
          
          if (insertError) throw new Error("Failed to create customer profile.");
        }
      } else if (persona === "owner") {
        const { data: existingOwner } = await supabase
          .from("admin_users")
          .select("id, role, approval_status")
          .eq("firebase_uid", user.uid)
          .maybeSingle();

        if (!existingOwner) {
          const { data: byPhone } = await supabase
            .from("admin_users")
            .select("id, role, approval_status")
            .eq("phone", sanitizedPhone)
            .maybeSingle();
            
          if (byPhone) {
            await supabase.from("admin_users").update({ firebase_uid: user.uid }).eq("id", byPhone.id);
            if (byPhone.approval_status === "rejected" || byPhone.approval_status === "suspended") {
              setErrorMessage(`Your account is ${byPhone.approval_status}.`);
              return false;
            }
          } else {
            router.push("/salon-owner/register");
            return false; // don't show success screen, redirecting to register
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
      console.error("Profile sync error:", err);
      setErrorMessage(err.message || "Failed to sync profile.");
      return false;
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
      const isSuccess = await processSuccessfulLogin(result.user);
      if (isSuccess) setView("success");
    } catch (err: any) {
      console.error("OTP verify error:", err);
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
        if (result.error?.includes("No account found")) {
          router.push("/salon-owner/register");
        } else {
          setErrorMessage(result.error || "Google login failed");
        }
      } else {
        if (admin?.role === "super_admin") {
          router.push("/admin");
        } else {
          setView("success");
        }
      }
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const isSuccess = await processSuccessfulLogin(result.user);
      if (isSuccess) setView("success");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        setErrorMessage(error.message || "Failed to sign in with Google.");
      }
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
    "role-selection": { filter: "brightness(1) blur(0px)", scale: 1 },
    "login": { filter: "brightness(0.6) blur(4px)", scale: 1.05 },
    "otp": { filter: "brightness(0.5) blur(8px)", scale: 1.1 },
    "success": { filter: "brightness(0.8) blur(2px)", scale: 1 }
  };

  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      <div id="recaptcha-container"></div>
      
      {/* Dynamic Background Image */}
      <motion.div 
        className="absolute inset-0 z-0"
        animate={backgroundVariants[view]}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
          alt="Luxury Salon Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        {/* Soft Gold Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ======================= ROLE SELECTION ======================= */}
        {view === "role-selection" && (
          <motion.div 
            key="role-selection"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md px-5"
          >
            <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/50 text-center">
              <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tight">Glvia.com</h1>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8 px-2">
                Elevate your beauty experience. Choose how you want to connect today.
              </p>

              <div className="space-y-4">
                <button 
                  onClick={() => { setPersona("owner"); setView("login"); }}
                  className="w-full group bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-5 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-500/5 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-100 transition-colors">
                    <span className="material-icons-round text-[24px]">content_cut</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-slate-900 mb-0.5">I'm a Beauty Professional</h3>
                    <p className="text-xs text-slate-500 font-medium">Manage bookings & clients</p>
                  </div>
                  <span className="material-icons-round text-slate-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all">arrow_forward</span>
                </button>

                <button 
                  onClick={() => { setPersona("customer"); setView("login"); }}
                  className="w-full group bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-5 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                    <span className="material-icons-round text-[24px]">face_retouching_natural</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-slate-900 mb-0.5">I'm looking for a Stylist</h3>
                    <p className="text-xs text-slate-500 font-medium">Book top tier beauty services</p>
                  </div>
                  <span className="material-icons-round text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================= LOGIN VIEW ======================= */}
        {view === "login" && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full px-4 fixed bottom-6 sm:static sm:max-w-md sm:bottom-auto"
          >
            <div className="text-center mb-6 drop-shadow-lg">
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">GLVIA</h1>
              <p className="text-white/80 text-sm font-medium tracking-wide">
                {persona === "owner" ? "Partner Portal" : "Welcome to GLVIA"}
              </p>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
              {/* Loader Overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center"
                  >
                    <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center mb-6">
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {persona === "owner" ? "Salon Partner Login" : "Customer Login"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {persona === "owner" ? "Manage your bookings and grow your business." : "Enter your phone number to continue"}
                </p>
              </div>

              {errorMessage && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-start gap-2">
                  <span className="material-icons-round text-[16px]">error</span>
                  <span className="flex-1 leading-snug">{errorMessage}</span>
                </motion.div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative flex items-center">
                  <span className="material-icons-round absolute left-4 text-[18px] text-slate-400">phone_iphone</span>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number (+91...)" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    required 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" 
                  />
                </div>
                
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold text-[14px] shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative overflow-hidden">
                  <span className="relative z-10">Send OTP</span>
                  <span className="material-icons-round text-[18px] relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">OR</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <button 
                type="button" 
                onClick={handleGoogleSignIn} 
                className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-bold text-[13px] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>

              <div className="mt-6 text-center">
                <button onClick={switchPersona} className="text-xs font-bold text-pink-600 hover:text-pink-500 transition-colors">
                  {persona === "owner" ? "Login as Customer" : "Login as Salon Partner"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================= OTP VIEW ======================= */}
        {view === "otp" && (
          <motion.div 
            key="otp"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full px-4 fixed bottom-6 sm:static sm:max-w-md sm:bottom-auto"
          >
            <div className="bg-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setView("login")}
                className="absolute top-6 left-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <span className="material-icons-round text-[18px]">arrow_back</span>
              </button>

              <div className="text-center mt-4 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Phone</h2>
                <p className="text-xs text-slate-500 font-medium px-4 leading-relaxed">
                  Enter the 6-digit code sent to <br/><span className="text-slate-800 font-bold">{phoneNumber}</span>
                </p>
              </div>

              {errorMessage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-center text-red-500 text-xs font-bold bg-red-50 py-2 rounded-lg">
                  {errorMessage}
                </motion.div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="relative">
                  <input 
                    ref={otpInputRef}
                    type="text" 
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="------" 
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                    required 
                    className="w-full text-center tracking-[1.5em] pl-[1.5em] text-3xl font-black py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" 
                  />
                </div>

                <button type="submit" disabled={isLoading || otpCode.length < 6} className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 disabled:opacity-50 text-white rounded-2xl font-bold text-[14px] shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Verify Code</span>}
                </button>

                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    disabled={timer > 0 || isLoading} 
                    className={`text-[12px] font-bold transition-colors ${timer > 0 ? "text-slate-400" : "text-purple-600 hover:text-purple-500"}`}
                  >
                    {timer > 0 ? `Resend code in 00:${timer.toString().padStart(2, '0')}` : "Resend SMS"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ======================= SUCCESS VIEW ======================= */}
        {view === "success" && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full px-4 fixed bottom-6 sm:static sm:max-w-sm sm:bottom-auto"
          >
            <div className="bg-white rounded-[32px] p-10 shadow-2xl text-center relative overflow-hidden">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30"
              >
                <motion.span 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="material-icons-round text-white text-5xl"
                >
                  check
                </motion.span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3"
              >
                Success!
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-medium text-slate-500 mb-8 px-2"
              >
                Your account has been verified. Welcome to the premium GLVIA experience.
              </motion.p>

              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handleSuccessRedirect}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                Get Started 
                <span className="material-icons-round text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
