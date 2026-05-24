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
    className={`relative overflow-hidden w-full py-4 rounded-2xl font-bold text-[14.5px] shadow-xl disabled:opacity-70 transition-all flex items-center justify-center gap-2 group ${className}`}
  >
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

export default function SalonOwnerRegisterPage() {
  const router = useRouter();
  
  const [view, setView] = useState<"form" | "otp" | "success">("form");
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [salonName, setSalonName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
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

  const uploadFiles = async (files: File[], bucket: string, folder: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      urls.push(publicUrl);
    }
    return urls;
  };

  const processRegistration = async (firebaseUid: string, userEmail: string) => {
    const imageUrls = await uploadFiles(images, 'salon-images', firebaseUid);
    const kycUrls = await uploadFiles(kycDocs, 'salon-kyc', firebaseUid);
    const { data: salonId, error: rpcError } = await supabase.rpc("auto_create_salon_account", {
      p_firebase_uid: firebaseUid, p_owner_name: name.trim(), p_email: userEmail.toLowerCase().trim(),
      p_salon_name: salonName.trim(), p_phone: phone.trim().replace(/\s+/g, ''), p_city: city.trim(),
      p_address_street: address.trim(), p_salon_images: imageUrls, p_kyc_documents: { documents: kycUrls }
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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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
      
      setTimeout(() => { if (otpInputRef.current) otpInputRef.current.focus(); }, 400);
    } catch (err: any) {
      cleanupRecaptcha();
      setError(err.message || "Failed to send OTP.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") setError(err.message || "Google signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSuccessRedirect = () => {
    router.push("/salon-owner/dashboard");
  };

  const containerVariants: any = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.3, duration: 0.8, staggerChildren: 0.08, delayChildren: 0.1 } },
    exit: { opacity: 0, y: -20, scale: 0.95, filter: "blur(8px)", transition: { duration: 0.4 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans antialiased">
      <div id="recaptcha-container"></div>

      {/* Luxury Background Elements */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-br from-pink-600 via-rose-500 to-purple-700" />
      <div className="absolute top-0 left-0 right-0 h-80 bg-[url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none" />
      
      <div className="relative w-full max-w-2xl mt-12 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
          <h1 className="text-[40px] font-black text-white tracking-tight mb-2 drop-shadow-md">Join the Marketplace</h1>
          <p className="text-white/90 text-[15px] font-medium tracking-wide">Register your salon on GLVIA and start accepting bookings.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ======================= FORM VIEW ======================= */}
          {view === "form" && (
            <motion.div 
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-[36px] p-6 sm:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.1)] space-y-12 relative overflow-hidden"
            >
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/70 backdrop-blur-md z-20 flex flex-col items-center justify-center"
                  >
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin mb-4 shadow-lg" />
                    <span className="text-sm font-bold text-slate-800 animate-pulse">Processing...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-[13px] font-bold rounded-2xl border border-red-100 flex items-start gap-3">
                    <span className="material-icons-round text-[20px]">error_outline</span>
                    <span className="flex-1 leading-snug">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Owner Details */}
              <motion.section variants={itemVariants}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center text-pink-600 shadow-sm border border-pink-100/50">
                    <span className="material-icons-round text-[20px]">person</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Owner Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Full Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all shadow-sm" disabled={isLoading} />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Email Address *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@salon.com" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 focus:bg-white transition-all shadow-sm" disabled={isLoading} />
                  </div>
                </div>
              </motion.section>

              {/* Salon Details */}
              <motion.section variants={itemVariants}>
                <div className="flex items-center gap-4 mb-6 border-t border-slate-100 pt-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100/50">
                    <span className="material-icons-round text-[20px]">storefront</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Salon & Location</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Salon Name *</label>
                    <input type="text" value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Elegance Beauty" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all shadow-sm" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Mobile Number *</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all shadow-sm" disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">City *</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New Delhi" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all shadow-sm" disabled={isLoading} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Full Address *</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Sector 4" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all shadow-sm" disabled={isLoading} />
                  </div>
                </div>
              </motion.section>

              {/* Uploads */}
              <motion.section variants={itemVariants}>
                <div className="flex items-center gap-4 mb-6 border-t border-slate-100 pt-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100/50">
                    <span className="material-icons-round text-[20px]">cloud_upload</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Verification Documents</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-[24px] transition-colors">
                    <label className="block text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-widest">Salon Images (Public) *</label>
                    <input type="file" multiple accept="image/*" onChange={(e) => handleImageChange(e, setImages)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-[13px] file:font-bold file:bg-white file:text-pink-600 file:shadow-sm hover:file:shadow-md transition-all cursor-pointer" disabled={isLoading} />
                    <p className="text-[12px] font-medium text-slate-400 mt-4">Select 1 or more images of your salon interior/exterior.</p>
                  </div>
                  <div className="p-6 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-[24px] transition-colors">
                    <label className="block text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-widest">KYC Documents (Private) *</label>
                    <input type="file" multiple accept="image/*,.pdf" onChange={(e) => handleImageChange(e, setKycDocs)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-[13px] file:font-bold file:bg-white file:text-purple-600 file:shadow-sm hover:file:shadow-md transition-all cursor-pointer" disabled={isLoading} />
                    <p className="text-[12px] font-medium text-slate-400 mt-4">Upload Aadhaar, PAN, or GST Certificate for verification.</p>
                  </div>
                </div>
              </motion.section>

              {/* Submit Buttons */}
              <motion.div variants={itemVariants} className="pt-8 border-t border-slate-100">
                <PremiumButton onClick={handleSendOtp} isLoading={isLoading} className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-white shadow-pink-500/25">
                  Send OTP <span className="opacity-80 font-normal ml-1 hidden sm:inline">to verify & register</span>
                  <span className="material-icons-round text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </PremiumButton>
                
                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-px bg-slate-100" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">OR</p>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <motion.button 
                  type="button" 
                  onClick={handleGoogleSignup} 
                  disabled={isLoading} 
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                >
                  <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Register with Google
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center pt-4">
                <p className="text-slate-500 text-[13.5px] font-medium">
                  Already have an account?{" "}
                  <Link href="/login" className="text-pink-600 font-bold hover:text-pink-500 transition-colors">
                    Log in
                  </Link>
                </p>
              </motion.div>
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
              className="bg-white rounded-[36px] p-8 sm:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative overflow-hidden max-w-md mx-auto"
            >
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setView("form")}
                className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 border border-slate-100 shadow-sm transition-colors"
              >
                <span className="material-icons-round text-[18px]">arrow_back</span>
              </motion.button>

              <motion.div variants={itemVariants} className="text-center mt-6 mb-10">
                <h2 className="text-[26px] font-black text-slate-900 mb-2 tracking-tight">Verify Phone</h2>
                <p className="text-[14px] text-slate-500 font-medium px-4 leading-relaxed">
                  Enter the 6-digit code sent to <br/><span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">{phone}</span>
                </p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                    <div className="text-center text-red-600 text-[13px] font-bold bg-red-50 py-3 px-4 rounded-xl border border-red-100">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <motion.div variants={itemVariants} className="relative group">
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
                    className="relative w-full text-center tracking-[1.5em] pl-[1.5em] text-[32px] font-black py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 placeholder-slate-200 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.1)] transition-all" 
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <PremiumButton type="submit" disabled={otpCode.length < 6} isLoading={isLoading} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25">
                    Verify & Register
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
              className="bg-white rounded-[36px] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.15)] text-center relative overflow-hidden max-w-sm mx-auto"
            >
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
                Your salon account has been successfully created and verified. Welcome to the GLVIA marketplace.
              </motion.p>

              <motion.div variants={itemVariants}>
                <PremiumButton onClick={handleSuccessRedirect} className="bg-slate-900 text-white shadow-slate-900/20">
                  Go to Dashboard <span className="material-icons-round text-[18px]">arrow_forward</span>
                </PremiumButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
