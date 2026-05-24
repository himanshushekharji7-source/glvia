"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { auth, googleProvider } from "../../lib/firebase";
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

export default function SalonOwnerRegisterPage() {
  const router = useRouter();
  
  // View State: "form" | "otp" | "success"
  const [view, setView] = useState<"form" | "otp" | "success">("form");
  
  // Owner Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Salon Details
  const [salonName, setSalonName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  
  // Files
  const [images, setImages] = useState<File[]>([]);
  const [kycDocs, setKycDocs] = useState<File[]>([]);
  
  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const cleanupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (e) { console.error(e); }
      window.recaptchaVerifier = null;
    }
    const container = document.getElementById("recaptcha-container");
    if (container) container.innerHTML = "";
  };

  // Helper to upload files to Supabase Storage
  const uploadFiles = async (files: File[], bucket: string, folder: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      urls.push(publicUrl);
    }
    return urls;
  };

  const processRegistration = async (firebaseUid: string, userEmail: string) => {
    const imageUrls = await uploadFiles(images, 'salon-images', firebaseUid);
    const kycUrls = await uploadFiles(kycDocs, 'salon-kyc', firebaseUid);
    const kycJson = { documents: kycUrls };

    const { data: salonId, error: rpcError } = await supabase.rpc("auto_create_salon_account", {
      p_firebase_uid: firebaseUid,
      p_owner_name: name.trim(),
      p_email: userEmail.toLowerCase().trim(),
      p_salon_name: salonName.trim(),
      p_phone: phone.trim().replace(/\s+/g, ''),
      p_city: city.trim(),
      p_address_street: address.trim(),
      p_salon_images: imageUrls,
      p_kyc_documents: kycJson
    });

    if (rpcError) throw new Error(rpcError.message || "Failed to build backend infrastructure.");
    return salonId;
  };

  const validateForm = () => {
    if (!name.trim()) return "Full Name is required.";
    if (!email.trim() || !email.includes("@")) return "Valid Email is required.";
    if (!salonName.trim()) return "Salon Name is required.";
    const formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.length < 11 || !formattedPhone.startsWith("+")) return "Valid Phone Number with country code (+91) is required.";
    if (!city.trim()) return "City is required.";
    if (!address.trim()) return "Full Address is required.";
    if (images.length === 0) return "Please upload at least one salon image.";
    if (kycDocs.length === 0) return "Please upload KYC documents.";
    return null;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      // scroll to top to see error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    try {
      cleanupRecaptcha();
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      const formattedPhone = phone.replace(/\s+/g, '');
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      
      setConfirmationResult(confirmation);
      setView("otp");
      setTimer(30);
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      setTimeout(() => {
        if (otpInputRef.current) otpInputRef.current.focus();
      }, 300);
    } catch (err: any) {
      console.error(err);
      cleanupRecaptcha();
      setError(err.message || "Failed to send OTP.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Process Registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (otpCode.length < 6) return setError("Please enter the 6-digit OTP.");
    if (!confirmationResult) return setError("OTP session expired. Please go back and request a new one.");

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otpCode);
      const firebaseUser = result.user;
      localStorage.setItem("token", firebaseUser.uid);

      await processRegistration(firebaseUser.uid, firebaseUser.email || email);
      
      setView("success");
    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      localStorage.setItem("token", firebaseUser.uid);
      
      await processRegistration(firebaseUser.uid, firebaseUser.email || email);
      
      setView("success");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google signup failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSuccessRedirect = () => {
    router.push("/salon-owner/dashboard");
  };

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div id="recaptcha-container"></div>

      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-pink-600 via-rose-500 to-purple-600" />
      
      <div className="relative w-full max-w-2xl mt-12 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">Join the Marketplace</h1>
          <p className="text-white/90 text-sm font-medium">Register your salon on GLVIA and start accepting bookings.</p>
        </div>

        <AnimatePresence mode="wait">
          {/* ======================= FORM VIEW ======================= */}
          {view === "form" && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[32px] p-6 sm:p-10 shadow-2xl space-y-10 relative overflow-hidden"
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                </div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-start gap-3">
                  <span className="material-icons-round text-[20px]">error_outline</span>
                  <span className="flex-1 leading-snug">{error}</span>
                </motion.div>
              )}

              {/* Owner Details */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                    <span className="material-icons-round text-[18px]">person</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Owner Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Full Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Email Address *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@salon.com" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" disabled={isLoading} />
                  </div>
                </div>
              </section>

              {/* Salon Details */}
              <section>
                <div className="flex items-center gap-3 mb-6 border-t border-slate-100 pt-8">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <span className="material-icons-round text-[18px]">storefront</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Salon & Location</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Salon Name *</label>
                    <input type="text" value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Elegance Beauty" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Mobile Number *</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">City *</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New Delhi" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" disabled={isLoading} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Full Address *</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Sector 4" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" disabled={isLoading} />
                  </div>
                </div>
              </section>

              {/* Uploads */}
              <section>
                <div className="flex items-center gap-3 mb-6 border-t border-slate-100 pt-8">
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    <span className="material-icons-round text-[18px]">cloud_upload</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Verification Documents</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <label className="block text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">Salon Images (Public) *</label>
                    <input type="file" multiple accept="image/*" onChange={(e) => handleImageChange(e, setImages)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-[13px] file:font-bold file:bg-pink-100 file:text-pink-600 hover:file:bg-pink-200 transition-colors cursor-pointer" disabled={isLoading} />
                    <p className="text-[11px] font-medium text-slate-400 mt-3">Select 1 or more images of your salon interior/exterior.</p>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <label className="block text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">KYC Documents (Private) *</label>
                    <input type="file" multiple accept="image/*,.pdf" onChange={(e) => handleImageChange(e, setKycDocs)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-[13px] file:font-bold file:bg-purple-100 file:text-purple-600 hover:file:bg-purple-200 transition-colors cursor-pointer" disabled={isLoading} />
                    <p className="text-[11px] font-medium text-slate-400 mt-3">Upload Aadhaar, PAN, or GST Certificate for verification.</p>
                  </div>
                </div>
              </section>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-slate-100">
                <button type="button" onClick={handleSendOtp} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold text-[14.5px] shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative overflow-hidden">
                  <span className="relative z-10">Send OTP <span className="opacity-80 font-normal ml-1">to verify & register</span></span>
                  <span className="material-icons-round text-[18px] relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-slate-100" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</p>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <button type="button" onClick={handleGoogleSignup} disabled={isLoading} className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-bold text-[13px] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Register with Google
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-slate-500 text-[13px] font-medium">
                  Already have an account?{" "}
                  <Link href="/login" className="text-pink-600 font-bold hover:text-pink-500 transition-colors">
                    Log in
                  </Link>
                </p>
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
              className="bg-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden max-w-md mx-auto"
            >
              <button 
                onClick={() => setView("form")}
                className="absolute top-6 left-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <span className="material-icons-round text-[18px]">arrow_back</span>
              </button>

              <div className="text-center mt-4 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Phone</h2>
                <p className="text-xs text-slate-500 font-medium px-4 leading-relaxed">
                  Enter the 6-digit code sent to <br/><span className="text-slate-800 font-bold">{phone}</span>
                </p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-center text-red-500 text-xs font-bold bg-red-50 py-2 rounded-lg">
                  {error}
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
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Verify & Register</span>}
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
            </motion.div>
          )}

          {/* ======================= SUCCESS VIEW ======================= */}
          {view === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[32px] p-10 shadow-2xl text-center relative overflow-hidden max-w-sm mx-auto"
            >
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
                className="text-sm font-medium text-slate-500 mb-8 px-2 leading-relaxed"
              >
                Your salon account has been successfully created and verified. Welcome to the GLVIA marketplace.
              </motion.p>

              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handleSuccessRedirect}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                Go to Dashboard
                <span className="material-icons-round text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
