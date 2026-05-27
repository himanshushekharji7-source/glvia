"use client";

import { useState, useRef, useEffect } from "react";
import { useAdminAuth } from "../../lib/adminAuth";
import Image from "next/image";

export default function AdminPinSetupPage() {
  const { setupPin, logout } = useAdminAuth();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [step, setStep] = useState(1); // 1 = Enter PIN, 2 = Confirm PIN
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on load
    if (step === 1) {
      pinRefs.current[0]?.focus();
    } else {
      confirmRefs.current[0]?.focus();
    }
  }, [step]);

  const handlePinChange = (index: number, val: string, isConfirm: boolean) => {
    if (!/^\d*$/.test(val)) return;
    const digit = val.slice(-1);
    
    if (isConfirm) {
      const newConfirm = [...confirmPin];
      newConfirm[index] = digit;
      setConfirmPin(newConfirm);
      if (digit && index < 3) {
        confirmRefs.current[index + 1]?.focus();
      }
    } else {
      const newPin = [...pin];
      newPin[index] = digit;
      setPin(newPin);
      if (digit && index < 3) {
        pinRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm: boolean) => {
    if (e.key === "Backspace") {
      if (isConfirm) {
        if (!confirmPin[index] && index > 0) {
          const newConfirm = [...confirmPin];
          newConfirm[index - 1] = "";
          setConfirmPin(newConfirm);
          confirmRefs.current[index - 1]?.focus();
        } else {
          const newConfirm = [...confirmPin];
          newConfirm[index] = "";
          setConfirmPin(newConfirm);
        }
      } else {
        if (!pin[index] && index > 0) {
          const newPin = [...pin];
          newPin[index - 1] = "";
          setPin(newPin);
          pinRefs.current[index - 1]?.focus();
        } else {
          const newPin = [...pin];
          newPin[index] = "";
          setPin(newPin);
        }
      }
    }
  };

  const handleNextStep = () => {
    const pinStr = pin.join("");
    if (pinStr.length < 4) {
      setError("Please enter a 4-digit PIN.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSetup = async () => {
    const pinStr = pin.join("");
    const confirmStr = confirmPin.join("");
    
    if (pinStr !== confirmStr) {
      setError("PINs do not match. Try again.");
      setConfirmPin(["", "", "", ""]);
      setStep(1);
      return;
    }

    setIsLoading(true);
    setError("");
    const res = await setupPin(pinStr);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to set up PIN");
    }
  };

  return (
    <div className="min-h-dvh bg-[#f5f6f8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle ambient blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image src="/logo.png" alt="GLVIA Admin" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-[22px] font-black text-[#111827] tracking-tight mb-1">Set Security PIN</h1>
          <p className="text-[13px] text-[#6b7280] font-medium leading-relaxed">
            {step === 1 
              ? "Create a 4-digit Security PIN to protect your administrator session." 
              : "Please confirm your 4-digit Security PIN."}
          </p>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-icons-round text-[16px]">error</span>
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <div className="flex gap-4 justify-center">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { pinRefs.current[index] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value, false)}
                    onKeyDown={(e) => handleKeyDown(index, e, false)}
                    disabled={isLoading}
                    className="w-14 h-16 text-center text-2xl font-bold bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#111827] focus:outline-none focus:border-[#ec4899]/60 focus:ring-2 focus:ring-[#ec4899]/10 focus:bg-white transition-all"
                  />
                ))}
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#e11d48] to-[#9333ea] rounded-xl hover:opacity-90 transition-opacity"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-4 justify-center">
                {confirmPin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { confirmRefs.current[index] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value, true)}
                    onKeyDown={(e) => handleKeyDown(index, e, true)}
                    disabled={isLoading}
                    className="w-14 h-16 text-center text-2xl font-bold bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-[#111827] focus:outline-none focus:border-[#ec4899]/60 focus:ring-2 focus:ring-[#ec4899]/10 focus:bg-white transition-all"
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(1); setConfirmPin(["", "", "", ""]); setError(""); }}
                  className="flex-1 py-3.5 text-sm font-bold text-[#374151] bg-[#f9fafb] border border-[#e5e7eb] rounded-xl hover:bg-[#f3f4f6] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSetup}
                  disabled={isLoading}
                  className="flex-1 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#e11d48] to-[#9333ea] rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Confirm PIN"}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full text-center text-xs text-[#9ca3af] hover:text-[#6b7280] transition-colors mt-6 font-semibold flex items-center justify-center gap-1.5"
          >
            <span className="material-icons-round text-[14px]">logout</span>
            Cancel and Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
