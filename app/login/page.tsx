"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

type Persona = null | "customer" | "owner";
type ViewState = "role-selection" | "login" | "otp" | "success";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

function UnifiedLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPersona = searchParams.get("persona");
  
  const { loginWithGoogle: ownerLoginWithGoogle, isAuthenticated, admin } = useAdminAuth();
  
  const [persona, setPersona] = useState<Persona>(
    queryPersona === "owner" ? "owner" : (queryPersona === "customer" ? "customer" : null)
  );
  const [view, setView] = useState<ViewState>(queryPersona ? "login" : "role-selection");
  
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [otpCode, setOtpCode] = useState("");
  const [otpArray, setOtpArray] = useState<string[]>(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && admin) {
      if (admin.role === "super_admin") router.replace("/admin");
      else if (admin.role === "salon_owner") router.replace("/salon-owner/dashboard");
    }
  }, [isAuthenticated, admin, router]);

  // Resend SMS countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus the first OTP input when view shifts to OTP screen
  useEffect(() => {
    if (view === "otp") {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 50);
    }
  }, [view]);

  // Combine single digits into otpCode string and auto-submit on 6 digits
  useEffect(() => {
    const code = otpArray.join("");
    setOtpCode(code);
    if (code.length === 6) {
      verifyCode(code);
    }
  }, [otpArray]);

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
    if (formattedPhone.length < 11 || !formattedPhone.startsWith("+91")) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      cleanupRecaptcha();
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpArray(["", "", "", "", "", ""]);
      setOtpCode("");
      setView("otp");
      setTimer(30);
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
            // NEW FLOW: Auto-create minimal salon account instantly
            const dummyEmail = user.email || `${sanitizedPhone.replace("+", "")}@glvia.com`;
            const { error: rpcError } = await supabase.rpc("auto_create_salon_account", {
              p_firebase_uid: user.uid,
              p_owner_name: user.displayName || "Salon Owner",
              p_email: dummyEmail,
              p_salon_name: "My Salon",
              p_phone: sanitizedPhone,
              p_city: "",
              p_address_street: "",
              p_salon_images: [],
              p_kyc_documents: {}
            });
            if (rpcError) throw new Error(rpcError.message || "Failed to create partner account.");
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

  const verifyCode = async (code: string) => {
    setErrorMessage("");
    if (!confirmationResult) {
      setErrorMessage("OTP session expired. Please request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(code);
      const isSuccess = await processSuccessfulLogin(result.user);
      if (isSuccess) setView("success");
    } catch (err: any) {
      setErrorMessage("Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) return setErrorMessage("Please enter the 6-digit OTP.");
    await verifyCode(otpCode);
  };

  // Handle individual split OTP input transitions
  const handleOtpBoxChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return;

    const newOtp = [...otpArray];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtpArray(newOtp);

    // Auto-focus next box
    if (index < 5 && cleanValue !== "") {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newOtp = [...otpArray];
      if (newOtp[index] !== "") {
        newOtp[index] = "";
        setOtpArray(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtpArray(newOtp);
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otpArray];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setOtpArray(newOtp);
      const targetIndex = Math.min(pastedData.length, 5);
      otpRefs.current[targetIndex]?.focus();
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
          try {
            const provider = new GoogleAuthProvider();
            const gResult = await signInWithPopup(auth, provider);
            const isSuccess = await processSuccessfulLogin(gResult.user);
            if (isSuccess) setView("success");
          } catch (gErr: any) {
             if (gErr.code !== "auth/popup-closed-by-user") setErrorMessage(gErr.message || "Failed to sign in with Google.");
          }
        }
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
    if (persona === "customer") router.push("/profile");
    else if (persona === "owner") router.push("/salon-owner/dashboard");
  };

  const switchPersona = () => {
    setPersona(persona === "customer" ? "owner" : "customer");
    setErrorMessage("");
  };

  const handleBackToLogin = () => {
    setView("login");
    setOtpCode("");
    setOtpArray(["", "", "", "", "", ""]);
    setErrorMessage("");
  };

  const handleBackToRoleSelection = () => {
    setView("role-selection");
    setPersona(null);
    setErrorMessage("");
  };

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-[#f8f9fa] font-sans antialiased py-12 px-4 overflow-hidden select-none">
      <div id="recaptcha-container"></div>
      
      {/* Dynamic ambient soft-glowing premium blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-pink-500/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/[0.03] blur-[120px] pointer-events-none" />

      {/* Header Logo - Always visible at the top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none">
        <h1 className="text-3.5xl font-black bg-gradient-to-r from-[#e11d48] to-[#9333ea] bg-clip-text text-transparent tracking-tight">
          Glvia.com
        </h1>
        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Premium Beauty Gateway</p>
      </div>

      {/* ======================= ROLE SELECTION ======================= */}
      {view === "role-selection" && (
        <div className="relative w-full max-w-[440px] bg-white rounded-[32px] border border-slate-100 p-8 sm:p-10 shadow-[0_24px_50px_rgba(0,0,0,0.02)] text-center transition-all duration-300 transform scale-100">
          <div className="mt-4 mb-10">
            <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight mb-2">
              Elevate Your Beauty Experience
            </h2>
            <p className="text-slate-400 text-[13px] font-medium leading-relaxed max-w-[320px] mx-auto">
              Please choose how you want to connect today to discover premium services or scale your brand.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <button 
              onClick={() => { setPersona("customer"); setView("login"); }}
              className="w-full group bg-white border border-slate-100 hover:border-pink-200 hover:shadow-[0_12px_32px_rgba(236,72,153,0.05)] p-5 rounded-2xl flex items-center gap-4.5 transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-[16px] bg-[#fff0f4] text-[#e11d48] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <span className="material-icons-round text-[24px]">face_retouching_natural</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-extrabold text-slate-900 mb-0.5">I'm looking for a Stylist</h3>
                <p className="text-[11px] text-slate-400 font-semibold leading-tight">Book premium beauty & salon services near you</p>
              </div>
              <span className="material-icons-round text-slate-300 group-hover:text-[#e11d48] group-hover:translate-x-1 transition-all duration-300 text-[18px] shrink-0">arrow_forward_ios</span>
            </button>

            <button 
              onClick={() => { setPersona("owner"); setView("login"); }}
              className="w-full group bg-white border border-slate-100 hover:border-purple-200 hover:shadow-[0_12px_32px_rgba(124,58,237,0.05)] p-5 rounded-2xl flex items-center gap-4.5 transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-[16px] bg-[#f3f0ff] text-[#7c3aed] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <span className="material-icons-round text-[24px]">content_cut</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-extrabold text-slate-900 mb-0.5">I'm a Beauty Professional</h3>
                <p className="text-[11px] text-slate-400 font-semibold leading-tight">Scale your business, manage schedules & get booked</p>
              </div>
              <span className="material-icons-round text-slate-300 group-hover:text-[#7c3aed] group-hover:translate-x-1 transition-all duration-300 text-[18px] shrink-0">arrow_forward_ios</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================= LOGIN VIEW ======================= */}
      {view === "login" && (
        <div className="relative w-full max-w-[440px] bg-white rounded-[32px] border border-slate-100 p-8 sm:p-10 shadow-[0_24px_50px_rgba(0,0,0,0.02)] transition-all duration-300 transform scale-100">
          
          {/* Back Button */}
          <button 
            type="button"
            onClick={handleBackToRoleSelection}
            className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-icons-round text-[16px]">arrow_back</span>
            Back
          </button>

          {/* Loader Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[32px]">
              <div className="w-8 h-8 border-3 border-slate-100 border-t-[#e11d48] rounded-full animate-spin mb-3" />
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">Connecting...</span>
            </div>
          )}

          <div className="text-center mt-6 mb-8">
            <h2 className="text-[22px] font-black text-slate-900 tracking-tight mb-2">
              {persona === "owner" ? "Salon Partner Login" : "Customer Login"}
            </h2>
            <p className="text-[12px] text-slate-400 font-semibold px-2">
              {persona === "owner" ? "Enter your phone number to access your dashboard." : "Enter your phone number to continue."}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 flex items-start gap-2.5 shadow-sm">
              <span className="material-icons-round text-[16px] shrink-0">error</span>
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative group flex items-center border border-slate-200 rounded-2xl bg-white shadow-sm focus-within:border-[#e11d48]/50 focus-within:ring-4 focus-within:ring-pink-500/5 transition-all overflow-hidden px-4">
              <span className="material-icons-round text-[18px] text-slate-400 shrink-0">phone_iphone</span>
              <span className="text-[14px] font-black text-slate-900 ml-2 shrink-0">+91</span>
              <input 
                type="tel" 
                placeholder="Enter 10-digit number" 
                value={phoneNumber.replace(/^\+91\s*/, "")} 
                onChange={(e) => {
                  const num = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhoneNumber(`+91 ${num}`);
                }} 
                required 
                className="w-full pl-2 pr-2 py-4 bg-transparent text-[14px] font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none" 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#9333ea] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Send OTP <span className="material-icons-round text-[16px]">arrow_forward</span>
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-300">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <button 
            type="button" 
            onClick={handleGoogleSignIn} 
            className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>

          <div className="mt-8 text-center">
            <button onClick={switchPersona} className="text-xs font-bold text-slate-400 hover:text-[#e11d48] transition-colors cursor-pointer">
              {persona === "owner" ? "Login as Customer" : "Login as Salon Partner"}
            </button>
          </div>
        </div>
      )}

      {/* ======================= OTP VIEW ======================= */}
      {view === "otp" && (
        <div className="relative w-full max-w-[440px] bg-white rounded-[32px] border border-slate-100 p-8 sm:p-10 shadow-[0_24px_50px_rgba(0,0,0,0.02)] transition-all duration-300 transform scale-100">
          
          {/* Back Button */}
          <button 
            type="button" 
            onClick={handleBackToLogin}
            className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-icons-round text-[16px]">arrow_back</span>
            Back
          </button>

          {/* Loader Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[32px]">
              <div className="w-8 h-8 border-3 border-slate-100 border-t-[#e11d48] rounded-full animate-spin mb-3" />
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">Verifying code...</span>
            </div>
          )}

          <div className="text-center mt-6 mb-8">
            <h2 className="text-[22px] font-black text-slate-900 mb-2 tracking-tight">Verify Code</h2>
            <p className="text-[12px] text-slate-400 font-semibold px-4 leading-relaxed">
              Enter the 6-digit code sent to <br/>
              <span className="text-slate-800 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block mt-1">
                {phoneNumber}
              </span>
              <button 
                type="button" 
                onClick={handleBackToLogin} 
                className="ml-2 text-xs font-extrabold text-[#e11d48] hover:underline cursor-pointer"
              >
                Change
              </button>
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 flex items-start gap-2.5 shadow-sm">
              <span className="material-icons-round text-[16px] shrink-0">error</span>
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* Split 6-digit OTP fields */}
            <div className="flex justify-between gap-2.5 sm:gap-3.5">
              {otpArray.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={digit}
                  onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpBoxKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-[22px] sm:text-[24px] font-black bg-white border border-slate-200 focus:border-[#e11d48]/50 focus:ring-4 focus:ring-pink-500/5 rounded-2xl text-slate-900 focus:outline-none transition-all"
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={otpCode.length < 6}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#9333ea] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              Verify Code
            </button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={handleSendOtp} 
                disabled={timer > 0 || isLoading} 
                className={`text-xs font-bold transition-all cursor-pointer ${timer > 0 ? "text-slate-400" : "text-slate-700 hover:text-[#e11d48]"}`}
              >
                {timer > 0 ? `Resend code in 00:${timer.toString().padStart(2, '0')}` : "Resend SMS Code"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================= SUCCESS VIEW ======================= */}
      {view === "success" && (
        <div className="relative w-full max-w-[400px] bg-white rounded-[32px] border border-slate-100 p-8 sm:p-10 shadow-[0_24px_50px_rgba(0,0,0,0.02)] text-center transition-all duration-300 transform scale-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
            <span className="material-icons-round text-[36px] font-bold animate-bounce">check</span>
          </div>
          
          <h2 className="text-[24px] font-black text-slate-900 tracking-tight mb-2">
            Success!
          </h2>
          
          <p className="text-[13px] font-medium text-slate-400 leading-relaxed mb-8 px-2">
            Your account has been verified. Welcome to the premium GLVIA experience.
          </p>

          <button 
            onClick={handleSuccessRedirect} 
            className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-extrabold shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {persona === "owner" ? "Go to Dashboard" : "Get Started"} 
            <span className="material-icons-round text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-8 h-8 border-3 border-slate-100 border-t-[#e11d48] rounded-full animate-spin" />
      </div>
    }>
      <UnifiedLoginContent />
    </Suspense>
  );
}
