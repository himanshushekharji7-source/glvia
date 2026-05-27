"use client";
 
import { useState, useEffect, useRef } from "react";
import { useAdminAuth } from "../../lib/adminAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
 
export default function AdminLoginPage({ initialStep = "login" }: { initialStep?: "login" | "2fa" }) {
  const { 
    loginWithGoogle, 
    isAuthenticated, 
    admin, 
    challengeAdmin2FA, 
    verifyAdmin2FASession 
  } = useAdminAuth();
  
  const router = useRouter();
  
  const [step, setStep] = useState<"login" | "2fa">(initialStep);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
 
  // Firebase 2FA OTP State
  const [otpArray, setOtpArray] = useState<string[]>(["", "", "", "", "", ""]);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
 
  // 1. Invisible reCAPTCHA Cleanup Helper
  const cleanupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    const container = document.getElementById("admin-recaptcha-container");
    if (container) container.innerHTML = "";
  };
 
  // 2. Trigger Firebase Phone Auth OTP
  const sendFirebaseOTP = async (targetEmail: string) => {
    setError("");
    setIsLoading(true);
 
    try {
      // Step A: Request server challenge to retrieve phone securely
      const challengeRes = await challengeAdmin2FA(targetEmail);
      if (!challengeRes.success || !challengeRes.adminPhone) {
        throw new Error(challengeRes.error || "Failed to retrieve authorized admin credentials.");
      }
 
      const { adminPhone, maskedPhone: serverMaskedPhone } = challengeRes;
      setMaskedPhone(serverMaskedPhone || "your authorized number");
 
      // Step B: Set up invisible reCAPTCHA
      cleanupRecaptcha();
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "admin-recaptcha-container", {
        size: "invisible"
      });
 
      // Step C: Trigger Firebase SMS OTP
      const confirmation = await signInWithPhoneNumber(auth, adminPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      
      setOtpArray(["", "", "", "", "", ""]);
      setOtpTimer(120); // 2 minutes standard countdown
      setStep("2fa");
    } catch (err: any) {
      cleanupRecaptcha();
      console.error("2FA initialization error:", err);
      setError(err.message || "Failed to send 2-Factor OTP. Please try again.");
      setStep("login");
    } finally {
      setIsLoading(false);
    }
  };
 
  // 3. Automatic Recovery State Trigger (for refreshes during OTP entry)
  useEffect(() => {
    if (initialStep === "2fa" && isAuthenticated && admin && !confirmationResult && !isLoading) {
      sendFirebaseOTP(admin.email);
    }
  }, [initialStep, isAuthenticated, admin]);
 
  // 4. OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "2fa" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);
 
  // 5. Auto-focus split input boxes
  useEffect(() => {
    if (step === "2fa") {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);
 
  // Google Auth submission (Step 1)
  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
 
    if (result.success && auth.currentUser?.email) {
      await sendFirebaseOTP(auth.currentUser.email);
    } else {
      setError(result.error || "Google login failed. Please verify your email is authorized.");
    }
  };
 
  // Split OTP digit inputs state changes
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
 
  // OTP Verification Submission (Step 2)
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const code = otpArray.join("");
    if (code.length < 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
 
    if (!confirmationResult) {
      setError("OTP session expired. Please resend a new code.");
      return;
    }
 
    setIsLoading(true);
    try {
      // Step A: Verify phone OTP securely inside Firebase Auth client-side
      const result = await confirmationResult.confirm(code);
      
      const adminEmail = admin?.email || auth.currentUser?.email || "";
 
      // Step B: Query server-side to set HttpOnly Secure session cookies
      const sessionRes = await verifyAdmin2FASession(adminEmail, result.user.uid);
      if (sessionRes.success) {
        // Establish state and refresh layout view to enter dashboard
        window.location.reload();
      } else {
        setError(sessionRes.error || "Session verification failed on backend.");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError("Invalid or expired 2-Factor OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleResendOTP = async () => {
    const targetEmail = admin?.email || auth.currentUser?.email;
    if (targetEmail) {
      await sendFirebaseOTP(targetEmail);
    }
  };
 
  return (
    <div className="min-h-dvh bg-[#f5f6f8] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Invisible reCAPTCHA target element required by Firebase Auth */}
      <div id="admin-recaptcha-container"></div>
 
      {/* Ambient soft glow background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
 
      <div className="relative w-full max-w-md">
 
        {/* Logo + Title Header */}
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100 shrink-0">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image src="/logo.png" alt="GLVIA Admin" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-[22px] font-black text-[#111827] tracking-tight mb-1">Admin Portal</h1>
          <p className="text-[13px] text-[#6b7280] font-semibold">
            {step === "login" ? "Authorized Admin Authentication" : "Two-Factor SMS Verification"}
          </p>
        </div>
 
        {/* ================= STEP 1: GOOGLE AUTHENTICATION ================= */}
        {step === "login" ? (
          <div
            className="bg-white border border-[#e5e7eb] rounded-3xl p-8 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-center relative"
          >
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-4 rounded-xl flex items-start gap-2.5 shadow-sm text-left leading-snug">
                <span className="material-icons-round text-[16px] shrink-0">error</span>
                {error}
              </div>
            )}
 
            {/* Lock illustration */}
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f3f0ff] text-[#7c3aed] flex items-center justify-center border border-purple-100 shadow-inner mb-2">
              <span className="material-icons-round text-[30px]">admin_panel_settings</span>
            </div>
 
            <div>
              <h2 className="text-[17px] font-extrabold text-[#111827] leading-tight">Admin Google Sign-in</h2>
              <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto mt-1.5">
                Press the button below to sign in using your authorized Gmail account.
              </p>
            </div>
 
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-4 bg-white text-[#111827] border border-[#e5e7eb] hover:bg-[#f9fafb] hover:border-[#d1d5db] active:scale-[0.98] rounded-2xl font-black text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-[#7c3aed] rounded-full animate-spin shrink-0" />
                  Connecting with Google...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        ) : (
          /* ================= STEP 2: TWO-FACTOR SMS OTP ================= */
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
              <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center mb-4 relative shadow-sm">
                <span className="material-icons-round text-[32px] animate-pulse">sms</span>
              </div>
              <h3 className="text-base font-extrabold text-[#111827] tracking-tight">Enter SMS Code</h3>
              <p className="text-[12px] text-[#6b7280] font-medium leading-relaxed max-w-[280px] mt-1">
                A 6-digit verification code has been dispatched to:
                <span className="block font-bold text-slate-800 bg-slate-50 border border-slate-100 px-3 py-1 rounded mt-1 select-text">
                  {maskedPhone}
                </span>
              </p>
            </div>
 
            {/* Split 6-digit OTP code boxes */}
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
                  Verifying OTP...
                </>
              ) : (
                <>
                  <span className="material-icons-round text-[18px]">verified_user</span>
                  Verify SMS Code
                </>
              )}
            </button>
 
            {/* SMS Resend Timer & Button */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={otpTimer > 0 || isLoading}
                className={`text-xs font-bold transition-all cursor-pointer ${
                  otpTimer > 0 ? "text-slate-400" : "text-slate-700 hover:text-pink-600"
                }`}
              >
                {otpTimer > 0 
                  ? `Resend SMS in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` 
                  : "Resend SMS Code"
                }
              </button>
            </div>
 
            {/* Go back to Step 1 */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  cleanupRecaptcha();
                  setConfirmationResult(null);
                  setStep("login");
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
 
        {/* Footer restricted access note */}
        <p className="text-center text-[11px] text-[#9ca3af] font-medium mt-6">
          Restricted access — Authorized Admin only
        </p>
      </div>
    </div>
  );
}
