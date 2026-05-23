"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { auth, googleProvider } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

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
  const [address, setAddress] = useState("");
  
  // Files
  const [images, setImages] = useState<File[]>([]);
  const [kycDocs, setKycDocs] = useState<File[]>([]);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Helper to upload files to Supabase Storage
  const uploadFiles = async (files: File[], bucket: string, folder: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      urls.push(publicUrl); // Note: For private KYC, publicUrl won't work publicly, but we store the path
    }
    return urls;
  };

  const processRegistration = async (firebaseUid: string, userEmail: string) => {
    // 1. Upload Images
    const imageUrls = await uploadFiles(images, 'salon-images', firebaseUid);
    
    // 2. Upload KYC Docs
    const kycUrls = await uploadFiles(kycDocs, 'salon-kyc', firebaseUid);
    const kycJson = { documents: kycUrls };

    // 3. Call RPC to auto-create backend infrastructure
    const { data: salonId, error: rpcError } = await supabase.rpc("auto_create_salon_account", {
      p_firebase_uid: firebaseUid,
      p_owner_name: name.trim(),
      p_email: userEmail.toLowerCase().trim(),
      p_salon_name: salonName.trim(),
      p_phone: phone.trim(),
      p_city: city.trim(),
      p_address_street: address.trim(),
      p_salon_images: imageUrls,
      p_kyc_documents: kycJson
    });

    if (rpcError) throw new Error(rpcError.message || "Failed to build backend infrastructure.");
    return salonId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name.trim()) return setError("Owner Name is required");
    if (!email.trim() || !email.includes("@")) return setError("Valid Email is required");
    if (password.length < 6) return setError("Password must be at least 6 characters long");
    if (!salonName.trim()) return setError("Salon Name is required");
    if (!phone.trim()) return setError("Phone Number is required");
    if (!city.trim() || !address.trim()) return setError("Full Address & City are required");
    if (images.length === 0) return setError("Please upload at least one salon image");
    if (kycDocs.length === 0) return setError("Please upload KYC documents (Aadhaar/PAN)");

    setIsLoading(true);

    try {
      // 1. Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Process Data & Uploads
      await processRegistration(firebaseUser.uid, firebaseUser.email || email);

      setSuccess(true);
      setTimeout(() => {
        router.push("/salon-owner/dashboard");
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    if (!name.trim() || !salonName.trim() || !phone.trim() || !city.trim() || !address.trim()) {
       return setError("Please fill out all Owner and Salon details before clicking Google Sign-In.");
    }
    if (images.length === 0) return setError("Please upload at least one salon image");
    if (kycDocs.length === 0) return setError("Please upload KYC documents");

    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      await processRegistration(firebaseUser.uid, firebaseUser.email || "");
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/salon-owner/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Google signup failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
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
            Your salon account has been created. Redirecting you to the dashboard...
          </p>
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-5 relative overflow-hidden py-12">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Join the Marketplace</h1>
          <p className="text-slate-400 text-sm font-medium">Register your salon on glvia and start accepting bookings.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2.5">
              <span className="material-icons-round text-[18px] flex-shrink-0">error_outline</span>
              {error}
            </div>
          )}

          {/* Owner Details */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="material-icons-round text-pink-500 text-[18px]">person</span>
              Owner Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 transition-all" disabled={isLoading} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@salon.com" className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 transition-all" disabled={isLoading} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full pl-4 pr-12 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 transition-all" disabled={isLoading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    <span className="material-icons-round text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Salon Details */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="material-icons-round text-pink-500 text-[18px]">storefront</span>
              Salon & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Salon Name *</label>
                <input type="text" value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Elegance Beauty" className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 transition-all" disabled={isLoading} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Phone *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 transition-all" disabled={isLoading} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">City *</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New Delhi" className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 transition-all" disabled={isLoading} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Full Address *</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Sector 4" className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 transition-all" disabled={isLoading} />
              </div>
            </div>
          </div>

          {/* Uploads */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="material-icons-round text-pink-500 text-[18px]">cloud_upload</span>
              Verification Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Salon Images (Public) *</label>
                <input type="file" multiple accept="image/*" onChange={(e) => handleImageChange(e, setImages)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-500/10 file:text-pink-400 hover:file:bg-pink-500/20" disabled={isLoading} />
                <p className="text-xs text-slate-500 mt-2">Select 1 or more images of your salon interior/exterior.</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">KYC Documents (Private) *</label>
                <input type="file" multiple accept="image/*,.pdf" onChange={(e) => handleImageChange(e, setKycDocs)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" disabled={isLoading} />
                <p className="text-xs text-slate-500 mt-2">Upload Aadhaar, PAN, or GST Certificate for verification.</p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 space-y-4">
            <button type="submit" disabled={isLoading} className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20">
              {isLoading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing Registration...</span></>
              ) : (
                <><span>Register via Email</span><span className="material-icons-round text-[18px]">arrow_forward</span></>
              )}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">OR</p>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <button type="button" onClick={handleGoogleSignup} disabled={isLoading} className="w-full py-3.5 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-md">
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Register with Google
            </button>
          </div>
        </form>

        <div className="text-center mt-8">
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
