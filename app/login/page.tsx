"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { supabase, TABLES } from "../lib/supabase";
import { useAdminAuth } from "../lib/adminAuth";
import Link from "next/link";
import Image from "next/image";

type Persona = null | "customer" | "owner";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { loginWithGoogle: ownerLoginWithGoogle, isAuthenticated, admin } = useAdminAuth();
  
  const [persona, setPersona] = useState<Persona>(null);
  
  // Customer Auth State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated as owner, go to dashboard
  useEffect(() => {
    if (isAuthenticated && admin && admin.role === "salon_owner") {
      router.replace("/salon-owner/dashboard");
    }
  }, [isAuthenticated, admin, router]);

  // --- Customer Auth Logic ---
  const executeCustomerAuth = async (signUpMode: boolean) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!email.trim() || !password) {
      setErrorMessage("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    if (signUpMode && !fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      setIsLoading(false);
      return;
    }

    try {
      let user;
      if (signUpMode) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        user = userCredential.user;

        const { data: existingUser } = await supabase
          .from(TABLES.USERS)
          .select("*")
          .eq("firebase_uid", user.uid)
          .maybeSingle();

        if (!existingUser) {
          await supabase.from(TABLES.USERS).insert({
            firebase_uid: user.uid,
            first_name: fullName.split(" ")[0] || "User",
            last_name: fullName.split(" ").slice(1).join(" ") || "",
            email: user.email || email.trim(),
          });
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        user = userCredential.user;

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
            email: user.email || email.trim(),
            phone_number: user.phoneNumber || "",
          });
        }
      }

      localStorage.setItem("token", user.uid);

      if (signUpMode) {
        router.push(`/verify?type=email&email=${encodeURIComponent(email.trim())}`);
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error with customer authentication:", error);
      let friendlyMessage = "Failed to authenticate. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already in use. Please log in instead.";
      } else if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        friendlyMessage = "Incorrect email or password.";
      } else if (error.code === "auth/user-not-found") {
        friendlyMessage = "No user found with this email.";
      }
      setErrorMessage(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address to reset password.");
      return;
    }
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage("Password reset link sent! Check your inbox.");
      setTimeout(() => {
        router.push(`/verify?type=reset&email=${encodeURIComponent(email.trim())}`);
      }, 1500);
    } catch (err: any) {
      setErrorMessage("Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerGoogleSignIn = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

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
          email: user.email || "",
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

  // --- Owner Auth Logic ---
  const handleOwnerGoogleSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);
    const result = await ownerLoginWithGoogle();
    setIsLoading(false);
    
    if (!result.success) {
      if (result.error?.includes("No account found")) {
        // Not registered as a salon owner yet
        router.push("/salon-owner/register");
      } else {
        setErrorMessage(result.error || "Google login failed");
      }
    } else {
      router.push("/salon-owner/dashboard");
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

  // --- Render Customer / Owner Flows ---
  return (
    <div className={`min-h-dvh flex flex-col select-none overflow-x-hidden transition-colors duration-500 ${persona === "owner" ? "bg-slate-950" : "bg-surface-card"}`}>
      
      {/* Header Background */}
      <div className={`relative h-[260px] flex flex-col items-center justify-end pb-10 overflow-hidden transition-colors duration-500 ${persona === "owner" ? "bg-gradient-to-br from-slate-900 to-slate-950 border-b border-white/5" : "bg-gradient-to-br from-[#ec4899] via-[#b546cc] to-[#8b5cf6]"}`}>
        {/* Glow Spheres */}
        <div className={`absolute -top-12 -left-12 w-44 h-44 rounded-full blur-2xl animate-pulse ${persona === "owner" ? "bg-pink-500/20" : "bg-white/10"}`} style={{ animationDuration: '4s' }} />
        <div className={`absolute -top-6 -right-6 w-32 h-32 rounded-full blur-xl ${persona === "owner" ? "bg-purple-500/10" : "bg-white/5"}`} />
        
        {/* Back Button */}
        <button 
          onClick={() => { setPersona(null); setErrorMessage(""); }}
          className={`absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm backdrop-blur-md transition-all ${persona === "owner" ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-black/20 text-white hover:bg-black/30"}`}
        >
          <span className="material-icons-round text-[16px]">arrow_back</span>
          Back
        </button>

        {/* Brand Content */}
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-2xl backdrop-blur-md ${persona === "owner" ? "bg-pink-500/20 border border-pink-500/30" : "bg-white/15 border border-white/25"}`}>
            <span className={`material-icons-round text-[30px] ${persona === "owner" ? "text-pink-400" : "text-white"}`}>
              {persona === "owner" ? "storefront" : (isSignUp ? "person_add" : "lock")}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
            {persona === "owner" ? "Salon Manager" : "glvia"}
          </h1>
          <p className={`text-[13px] mt-1 font-medium ${persona === "owner" ? "text-slate-400" : "text-white/80"}`}>
            {persona === "owner" ? "Partner Portal Access" : (isSignUp ? "Create a premium account" : "Welcome back to your beauty space")}
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-12 flex flex-col max-w-md w-full mx-auto">
        
        {/* Alerts */}
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

        {/* ======================= CUSTOMER FLOW ======================= */}
        {persona === "customer" && (
          <>
            <div className="relative flex bg-surface-dim p-1.5 rounded-2xl w-full mb-6 border border-border/40 shadow-inner">
              <div 
                className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
                style={{ transform: isSignUp ? "translateX(100%)" : "translateX(0%)" }}
              />
              <button type="button" onClick={() => { setIsSignUp(false); setErrorMessage(""); }} className={`relative z-10 flex-1 py-2.5 text-center text-[13.5px] font-bold transition-colors duration-300 ${!isSignUp ? "text-text-primary" : "text-text-secondary"}`}>Log In</button>
              <button type="button" onClick={() => { setIsSignUp(true); setErrorMessage(""); }} className={`relative z-10 flex-1 py-2.5 text-center text-[13.5px] font-bold transition-colors duration-300 ${isSignUp ? "text-text-primary" : "text-text-secondary"}`}>Sign Up</button>
            </div>

            {/* Google Quick Sign In for Customer */}
            <button type="button" onClick={handleCustomerGoogleSignIn} disabled={isLoading} className="w-full py-3.5 mb-6 bg-white text-slate-800 rounded-2xl font-bold text-[14px] border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Or with Email</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); executeCustomerAuth(isSignUp); }} className="space-y-4">
              {isSignUp && (
                <div className="group">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <div className="relative flex items-center">
                    <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary">person</span>
                    <input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={isLoading} className="input focus:bg-white" style={{ paddingLeft: "44px" }} />
                  </div>
                </div>
              )}

              <div className="group">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Email Address</label>
                <div className="relative flex items-center">
                  <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary">mail</span>
                  <input type="email" placeholder="hello@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="input focus:bg-white" style={{ paddingLeft: "44px" }} />
                </div>
              </div>

              <div className="group">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Password</label>
                <div className="relative flex items-center">
                  <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary">lock</span>
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="input focus:bg-white" style={{ paddingLeft: "44px", paddingRight: "48px" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-text-tertiary hover:text-text-secondary">
                    <span className="material-icons-round text-[19px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex justify-end">
                  <button type="button" onClick={handleCustomerForgotPassword} disabled={isLoading} className="text-[12px] font-bold text-[#ec4899] hover:underline">Forgot Password?</button>
                </div>
              )}

              <button type="submit" disabled={isLoading} className={`w-full py-4 mt-4 rounded-2xl text-white font-bold text-[14.5px] active:scale-[0.98] disabled:opacity-75 transition-all flex items-center justify-center gap-2 ${isSignUp ? "bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] shadow-[0_6px_20px_-3px_rgba(139,92,246,0.35)]" : "bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] shadow-[0_6px_20px_-3px_rgba(236,72,153,0.35)]"}`}>
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>{isSignUp ? "Sign Up" : "Log In"}</span>}
              </button>
            </form>
          </>
        )}

        {/* ======================= OWNER FLOW ======================= */}
        {persona === "owner" && (
          <div className="space-y-4 pt-4">
            {/* Google Login for Owner */}
            <button type="button" onClick={handleOwnerGoogleSignIn} disabled={isLoading} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-[14.5px] hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-white/5">
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Sign in with Google
                </>
              )}
            </button>

            <Link href="/salon-owner/login" className="w-full py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl font-bold text-[14.5px] hover:bg-white/[0.08] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <span className="material-icons-round text-[18px] text-slate-400">mail</span>
              Sign in with Email
            </Link>

            <div className="flex items-center gap-3 py-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">New to glvia?</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <Link href="/salon-owner/register" className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white rounded-2xl font-bold text-[14.5px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20">
              <span className="material-icons-round text-[18px]">storefront</span>
              Register New Salon
            </Link>
          </div>
        )}

        <p className={`text-center text-[11px] mt-8 leading-normal ${persona === "owner" ? "text-slate-500" : "text-text-tertiary"}`}>
          By continuing, you agree to glvia's{" "}
          <span className="text-pink-500 font-semibold hover:underline cursor-pointer">Terms of Service</span>
          {" "}and{" "}
          <span className="text-pink-500 font-semibold hover:underline cursor-pointer">Privacy Policy</span>
        </p>

      </div>
    </div>
  );
}
