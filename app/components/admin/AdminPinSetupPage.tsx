"use client";

import { useState, useRef, useEffect } from "react";
import { useAdminAuth } from "../../lib/adminAuth";

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
    <div className="min-h-dvh bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/20">
            <span className="material-icons-round text-white text-[32px]">security</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Set Security PIN</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            {step === 1 
              ? "Create a 4-digit Security PIN to protect your administrator session." 
              : "Please confirm your 4-digit Security PIN."}
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
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
                  className="w-12 h-14 text-center text-2xl font-bold bg-white/[0.06] border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10 transition-all text-center"
                />
              ))}
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-3.5 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 animate-fadeInUp"
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
                  className="w-12 h-14 text-center text-2xl font-bold bg-white/[0.06] border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10 transition-all text-center"
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep(1); setConfirmPin(["", "", "", ""]); setError(""); }}
                className="flex-1 py-3.5 text-sm font-bold text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSetup}
                disabled={isLoading}
                className="flex-1 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {isLoading ? "Setting up..." : "Confirm PIN"}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors mt-6 font-semibold flex items-center justify-center gap-1.5"
        >
          <span className="material-icons-round text-[14px]">logout</span>
          Cancel and Log Out
        </button>
      </div>
    </div>
  );
}
