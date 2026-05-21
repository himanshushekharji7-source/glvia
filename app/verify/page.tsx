"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function VerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((d) => d !== "")) {
      setTimeout(() => setVerified(true), 600);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (verified) {
    return (
      <div className="min-h-dvh bg-surface-card flex flex-col items-center justify-center px-6">
        <div className="animate-bounceIn mb-6">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-[0_8px_40px_rgba(236,72,153,0.3)]">
            <span className="material-icons-round text-[48px] text-white">check</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
          Verified!
        </h1>
        <p className="text-text-secondary text-center mb-8 animate-fadeInUp" style={{ animationDelay: "300ms" }}>
          Your account has been verified successfully.
        </p>
        <Link href="/" className="animate-fadeInUp w-full" style={{ animationDelay: "400ms" }}>
          <button className="btn-primary w-full py-4">Get Started</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-card flex flex-col">
      {/* Header */}
      <div className="px-5 py-4">
        <Link
          href="/login"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-dim hover:bg-border-strong transition-colors"
        >
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6">
        <div className="animate-fadeInUp">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <span className="material-icons-round text-[32px] text-primary">
              mark_email_read
            </span>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Verify your email
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            We sent a 6-digit verification code to{" "}
            <span className="text-text-primary font-semibold">hello@example.com</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex gap-3 justify-center mt-10 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`otp-input ${digit ? "border-primary bg-white" : ""}`}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mt-8 animate-fadeInUp" style={{ animationDelay: "300ms" }}>
          {timer > 0 ? (
            <p className="text-sm text-text-secondary">
              Resend code in{" "}
              <span className="text-primary font-bold">
                0:{timer.toString().padStart(2, "0")}
              </span>
            </p>
          ) : (
            <button
              onClick={() => setTimer(45)}
              className="text-sm text-primary font-semibold hover:underline"
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Verify Button */}
        <button
          className="btn-primary w-full mt-8 py-4 text-base animate-fadeInUp"
          style={{ animationDelay: "400ms" }}
          onClick={() => {
            if (otp.every((d) => d !== "")) setVerified(true);
          }}
        >
          Verify
        </button>
      </div>
    </div>
  );
}
