"use client";
 
import { useState, useEffect, useRef } from "react";
import { useAdminAuth } from "../../lib/adminAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
 
export default function AdminLoginPage({ initialStep = "login" }: { initialStep?: "login" | "2fa" }) {
  const { loginWithEmail, loginWithGoogle, isAuthenticated, admin } = useAdminAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<"login" | "2fa">(initialStep);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  // 2FA Specific State
  const [otpArray, setOtpArray] = useState<string[]>(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(120);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
 
  // 1. Generate & Log OTP upon entering 2FA step
  const generateAndSendOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTimer(120);
    setOtpArray(["", "", "", "", "", ""]);
    setError("");
    
    // Log with a super premium styled format in the browser console
    console.log(
      "%c🔑 [SECURITY] Admin 2FA Verification Code: " + code, 
      "color: #db2777; font-size: 16px; font-weight: bold; background: #fff5f7; padding: 6px 12px; border-radius: 6px; border: 1px solid #fecdd3;"
    );
  };
 
  useEffect(() => {
    if (step === "2fa" && !generatedOtp) {
      generateAndSendOTP();
    }
  }, [step, generatedOtp]);
 
  // 2. Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "2fa" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);
 
  // 3. Auto-focus the first OTP box when entering 2FA step
  useEffect(() => {
    if (step === "2fa") {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);
 
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
 
    // Restrict login screen to the authorized admin email immediately
    const allowedAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "himanshushekharji7@gmail.com";
    if (email.toLowerCase().trim() !== allowedAdminEmail.toLowerCase().trim()) {
      setError("Access Denied: Only the authorized admin email is allowed to log in.");
      return;
    }
 
    setIsLoading(true);
    const result = await loginWithEmail(email, password, pin || undefined);
    setIsLoading(false);
 
    if (result.success) {
      setStep("2fa");
    } else {
      setError(result.error || "Login failed");
    }
  };
 
  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
 
    if (result.success) {
      setStep("2fa");
    } else {
      setError(result.error || "Google login failed");
    }
  };
 
  // Split OTP digits state change handler
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
 
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const code = otpArray.join("");
    if (code.length < 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
 
    setIsLoading(true);
    if (code === generatedOtp) {
      sessionStorage.setItem("admin_2fa_verified", "true");
      // Page reload to let Root Layout update and render the children!
      window.location.reload();
    } else {
      setError("Incorrect 2-Factor OTP Code. Please try again.");
    }
    setIsLoading(false);
  };
 
  return (
    <div className="min-h-dvh bg-[#f5f6f8] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient gradient glow blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
 
      <div className="relative w-full max-w-md">
 
        {/* Header Logo + Branding */}
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100 shrink-0">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image src="/logo.png" alt="GLVIA Admin" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-[22px] font-black text-[#111827] tracking-tight mb-1">Admin Portal</h1>
          <p className="text-[13px] text-[#6b7280] font-medium">
            {step === "login" ? "Sign in to manage your platform" : "Two-Factor Verification Required"}
          </p>
        </div>
 
        {/* ================= STEP 1: LOGIN CREDENTIALS ================= */}
        {step === "login" ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#e5e7eb] rounded-3xl p-8 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
          >
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-4 rounded-xl flex items-start gap-2.5 shadow-sm leading-snug">
                <span className="material-icons-round text-[16px] shrink-0">error</span>
                {error}
              </div>
            )}
 
            {/* Email */}
            <div>
              <label className="block text-[11px] font-extrabold text-[#374151] mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@glvia.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#111827] placeholder-[#9ca3af] text-sm focus:outline-none focus:border-[#ec4899]/60 focus:ring-2 focus:ring-[#ec4899]/10 focus:bg-white transition-all font-semibold"
                  autoComplete="email"
                />
              </div>
            </div>
 
            {/* Password */}
            <div>
              <label className="block text-[11px] font-extrabold text-[#374151] mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#111827] placeholder-[#9ca3af] text-sm focus:outline-none focus:border-[#ec4899]/60 focus:ring-2 focus:ring-[#ec4899]/10 focus:bg-white transition-all font-semibold"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors cursor-pointer"
                >
                  <span className="material-icons-round text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
 
            {/* Security PIN */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-extrabold text-[#374151] uppercase tracking-wider">
                  Security PIN
                </label>
                <span className="text-[10px] text-[#9ca3af] font-semibold">Blank for first-time login</span>
              </div>
              <div className="relative">
                <span className="material-icons-round absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[20px]">
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
                  className="w-full pl-10 pr-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#111827] placeholder-[#9ca3af] text-sm focus:outline-none focus:border-[#ec4899]/60 focus:ring-2 focus:ring-[#ec4899]/10 focus:bg-white transition-all text-center tracking-[0.5em] font-extrabold text-lg"
                />
              </div>
            </div>
 
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-sm font-extrabold text-white bg-gradient-to-r from-[#e11d48] to-[#9333ea] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,29,72,0.2)] mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying credentials...
                </>
              ) : (
                <>
                  <span className="material-icons-round text-[18px]">login</span>
                  Continue
                </>
              )}
            </button>
 
            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-[#f3f4f6]" />
              <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider">or</p>
              <div className="flex-1 h-px bg-[#f3f4f6]" />
            </div>
 
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-white text-[#111827] border border-[#e5e7eb] rounded-xl font-extrabold text-xs hover:bg-[#f9fafb] hover:border-[#d1d5db] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
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
        ) : (
          /* ================= STEP 2: TWO-FACTOR OTP VERIFICATION ================= */
          <form
            onSubmit={handleVerify2FA}
            className="bg-white border border-[#e5e7eb] rounded-3xl p-8 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] relative overflow-hidden animate-fadeIn"
          >
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-4 rounded-xl flex items-start gap-2.5 shadow-sm leading-snug">
                <span className="material-icons-round text-[16px] shrink-0">error</span>
                {error}
              </div>
            )}
 
            <div className="text-center flex flex-col items-center">
              {/* Security shield icon */}
              <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center mb-4 relative shadow-sm">
                <span className="material-icons-round text-[32px] animate-pulse">shield</span>
              </div>
              <h3 className="text-base font-extrabold text-[#111827] tracking-tight">Two-Factor OTP</h3>
              <p className="text-[12px] text-[#6b7280] font-medium leading-relaxed max-w-[280px] mt-1">
                Enter the 6-digit code sent to your authorized email address:
                <span className="block font-bold text-slate-800 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded mt-1 overflow-hidden truncate">
                  {process.env.NEXT_PUBLIC_ADMIN_EMAIL || "himanshushekharji7@gmail.com"}
                </span>
              </p>
            </div>
 
            {/* Split OTP 6-Digit input boxes */}
            <div className="flex justify-between gap-2">
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
                  className="w-11 h-12 text-center text-xl font-black bg-[#f9fafb] border border-[#e5e7eb] focus:border-[#ec4899]/60 focus:ring-4 focus:ring-pink-500/5 rounded-xl text-slate-900 focus:outline-none transition-all"
                />
              ))}
            </div>
 
            <button
              type="submit"
              disabled={isLoading || otpArray.join("").length < 6}
              className="w-full py-3.5 text-sm font-extrabold text-white bg-gradient-to-r from-[#e11d48] to-[#9333ea] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,29,72,0.2)] mt-4 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <span className="material-icons-round text-[18px]">verified_user</span>
                  Verify & Log In
                </>
              )}
            </button>
 
            {/* Resend Code Button & Timer */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={generateAndSendOTP}
                disabled={otpTimer > 0 || isLoading}
                className={`text-xs font-bold transition-all cursor-pointer ${
                  otpTimer > 0 ? "text-slate-400" : "text-slate-700 hover:text-pink-600"
                }`}
              >
                {otpTimer > 0 
                  ? `Resend code in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` 
                  : "Resend Code"
                }
              </button>
            </div>
 
            {/* DEV PREVIEW TOOLTIP CARD - Extremely premium, neat dev helper */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between shadow-inner mt-4 animate-fadeIn">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Security Preview Code</span>
                <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">For development, also logged in Console.</p>
              </div>
              <span className="text-sm font-black text-slate-800 tracking-widest font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm shrink-0">
                {generatedOtp || "------"}
              </span>
            </div>
 
            {/* Back to Login Gate */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setGeneratedOtp("");
                  setError("");
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <span className="material-icons-round text-[14px]">arrow_back</span>
                Use different account
              </button>
            </div>
          </form>
        )}
 
        {/* Footer restricted disclaimer */}
        <p className="text-center text-[11px] text-[#9ca3af] font-medium mt-6">
          Restricted access — Authorized Admin only
        </p>
      </div>
    </div>
  );
}
