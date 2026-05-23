"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract flow metadata from parameters
  const type = searchParams.get("type") || "email"; // 'email' or 'reset'
  const emailParam = searchParams.get("email") || "hello@example.com";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState(1); // 1 = OTP code entry, 2 = New password creation (only for reset type)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0 && step === 1) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, step]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-trigger completion check
    if (newOtp.every((d) => d !== "")) {
      handleVerifyCode(newOtp.join(" "));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeString?: string) => {
    const finalOtp = codeString || otp.join("");
    if (finalOtp.replace(/\s/g, "").length < 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    // Simulate OTP server validation
    setTimeout(() => {
      setIsLoading(false);
      if (type === "reset") {
        setStep(2); // Go to Reset Password input step
      } else {
        setVerified(true); // Email verified successfully
      }
    }, 1200);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    // Simulate updating password in Firebase / Database
    setTimeout(() => {
      setIsLoading(false);
      setVerified(true);
    }, 1200);
  };

  // ── Success State Screen ──
  if (verified) {
    return (
      <div className="min-h-dvh bg-surface-card flex flex-col items-center justify-center px-6 select-none animate-fadeIn">
        <div className="animate-bounceIn mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] flex items-center justify-center shadow-[0_8px_40px_rgba(236,72,153,0.3)]">
            <span className="material-icons-round text-[48px] text-white">
              {type === "reset" ? "lock_open" : "done"}
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-text-primary mb-2 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
          {type === "reset" ? "Password Updated!" : "Account Verified!"}
        </h1>
        <p className="text-text-secondary text-sm text-center mb-8 px-4 leading-relaxed animate-fadeInUp" style={{ animationDelay: "300ms" }}>
          {type === "reset"
            ? "Your new password has been successfully configured. You can now log in."
            : "Your email address has been successfully verified. Welcome to glvia."}
        </p>

        <Link 
          href={type === "reset" ? "/login" : "/"} 
          className="w-full animate-fadeInUp" 
          style={{ animationDelay: "400ms" }}
        >
          <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-bold text-[14.5px] shadow-[0_6px_20px_-3px_rgba(236,72,153,0.35)] active:scale-[0.98] transition-all hover:brightness-105">
            {type === "reset" ? "Back to Log In" : "Get Started"}
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-card flex flex-col select-none overflow-x-hidden">
      {/* Top Header */}
      <div className="relative h-[220px] flex flex-col items-center justify-end pb-7 bg-gradient-to-br from-[#ec4899] via-[#b546cc] to-[#8b5cf6] overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 blur-lg" />

        {/* Back Button */}
        <Link
          href="/login"
          className="absolute top-5 left-5 w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 border border-white/20 backdrop-blur-md hover:bg-white/25 active:scale-95 transition-all text-white"
        >
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </Link>

        {/* Header Icon Content */}
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-15 h-15 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg">
            <span className="material-icons-round text-[28px] text-white animate-pulse">
              {step === 2 ? "lock" : type === "reset" ? "vpn_key" : "mark_email_read"}
            </span>
          </div>
          <h1 className="text-2.5xl font-black text-white tracking-tight">
            {step === 2 
              ? "Set New Password" 
              : type === "reset" 
                ? "Reset Code" 
                : "Verify Email"}
          </h1>
          <p className="text-white/80 text-[12px] mt-1 font-medium">
            {step === 2 ? "Enter a strong password" : "We sent a 6-digit verification code"}
          </p>
        </div>

        {/* Curved Wave Bottom */}
        <div className="absolute -bottom-1 left-0 right-0 z-0">
          <svg viewBox="0 0 430 40" fill="none" className="w-full h-8">
            <path d="M0 40V20C60 10 130 0 215 0C300 0 370 10 430 20V40H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 px-6 pt-6 pb-8 flex flex-col justify-between">
        <div>
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-error/10 text-error text-[12px] font-bold rounded-2xl border border-error/10 animate-scaleIn flex items-center gap-2">
              <span className="material-icons-round text-[16px]">error_outline</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            /* ──── STEP 1: OTP VERIFICATION CODE ──── */
            <div className="animate-fadeInUp">
              <p className="text-text-secondary text-sm leading-relaxed text-center px-2">
                We sent it to <span className="text-text-primary font-bold">{emailParam}</span>. Please enter the code below to proceed.
              </p>

              {/* OTP Digit Input Boxes */}
              <div className="flex gap-2.5 justify-center mt-10">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className={`w-12 h-14 text-center text-xl font-extrabold border-2 rounded-2xl bg-surface-dim outline-none transition-all duration-200 ${
                      digit 
                        ? "border-[#ec4899] bg-white shadow-[0_0_0_4px_rgba(236,72,153,0.08)] scale-105" 
                        : "border-transparent focus:border-[#ec4899] focus:bg-white focus:shadow-[0_0_0_4px_rgba(236,72,153,0.08)]"
                    }`}
                  />
                ))}
              </div>

              {/* Resend Timer Block */}
              <div className="text-center mt-9">
                {timer > 0 ? (
                  <p className="text-xs text-text-tertiary font-medium">
                    Resend code in{" "}
                    <span className="text-[#ec4899] font-bold">
                      0:{timer.toString().padStart(2, "0")}
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      setTimer(45);
                      setOtp(["", "", "", "", "", ""]);
                      inputRefs.current[0]?.focus();
                    }}
                    disabled={isLoading}
                    className="text-xs text-[#ec4899] font-bold hover:text-[#db2777] active:scale-95 transition-all inline-flex items-center gap-1"
                  >
                    <span className="material-icons-round text-[14px]">refresh</span>
                    <span>Resend Verification Code</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ──── STEP 2: PASSWORD CONFIGURATION (For Reset) ──── */
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-fadeInUp">
              <p className="text-text-secondary text-sm leading-relaxed text-center px-4 mb-2">
                Configure a secure password that you don't use elsewhere.
              </p>

              {/* Password Input */}
              <div className="group">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block transition-colors group-focus-within:text-[#ec4899]">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary transition-colors group-focus-within:text-[#ec4899]">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input pl-11 pr-12 focus:bg-white"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-text-tertiary hover:text-text-secondary transition-colors"
                    tabIndex={-1}
                  >
                    <span className="material-icons-round text-[19px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="group">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block transition-colors group-focus-within:text-[#ec4899]">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary transition-colors group-focus-within:text-[#ec4899]">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input pl-11 pr-12 focus:bg-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Submit Actions */}
        <div className="mt-8">
          {step === 1 ? (
            <button
              onClick={() => handleVerifyCode()}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-bold text-[14.5px] shadow-[0_6px_20px_-3px_rgba(236,72,153,0.35)] active:scale-[0.98] transition-all hover:brightness-105 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Code</span>
              )}
            </button>
          ) : (
            <button
              onClick={handleResetPasswordSubmit}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-bold text-[14.5px] shadow-[0_6px_20px_-3px_rgba(236,72,153,0.35)] active:scale-[0.98] transition-all hover:brightness-105 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-surface-card">
        <div className="w-10 h-10 border-4 border-[#ec4899]/30 border-t-[#ec4899] rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
