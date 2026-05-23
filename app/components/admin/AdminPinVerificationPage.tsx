"use client";

import { useState, useRef, useEffect } from "react";
import { useAdminAuth } from "../../lib/adminAuth";

export default function AdminPinVerificationPage() {
  const { verifyPin, logout } = useAdminAuth();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on load
    pinRefs.current[0]?.focus();
  }, []);

  const handlePinChange = async (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const digit = val.slice(-1);
    
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    // Auto-focus next input
    if (digit && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }

    // Auto-verify if fully entered
    const updatedPinStr = newPin.join("");
    if (updatedPinStr.length === 4) {
      setIsLoading(true);
      setError("");
      const res = await verifyPin(updatedPinStr);
      setIsLoading(false);

      if (!res.success) {
        setError(res.error || "Incorrect Security PIN");
        setPin(["", "", "", ""]);
        pinRefs.current[0]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
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
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/20">
            <span className="material-icons-round text-white text-[32px]">lock_person</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Unlock Admin Panel</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your session is locked. Please enter your 4-digit Security PIN to continue.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="material-icons-round text-[16px]">error</span>
            {error}
          </div>
        )}

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
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-bold bg-white/[0.06] border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10 transition-all text-center"
              />
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center items-center gap-2 text-sm text-gray-400 font-medium">
              <div className="w-4 h-4 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
              Verifying PIN...
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors mt-8 font-semibold flex items-center justify-center gap-1.5"
        >
          <span className="material-icons-round text-[14px]">logout</span>
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}
