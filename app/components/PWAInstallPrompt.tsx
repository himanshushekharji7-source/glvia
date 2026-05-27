"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    outcome_platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Standalone / Installed Check
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      localStorage.setItem("glvia_pwa_installed", "true");
      return;
    }

    // 2. Mobile Device Check
    const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (!isMobileDevice) return;

    // 3. iOS Detection
    const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(isAppleMobile);

    // 4. Temporary Dismissal Check (24 Hours)
    const dismissedAt = localStorage.getItem("glvia_pwa_prompt_dismissed_at");
    if (dismissedAt) {
      const parsedTime = parseInt(dismissedAt, 10);
      const currentTime = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (currentTime - parsedTime < twentyFourHours) {
        return;
      }
    }

    // 5. Event Listener for Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delayed trigger to gracefully appear after home page loads
      setTimeout(() => {
        const isAlreadyInstalled = localStorage.getItem("glvia_pwa_installed") === "true";
        if (!isAlreadyInstalled) {
          setShowPrompt(true);
        }
      }, 1500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5b. Event Listener for Manual App Trigger (e.g. from Profile page)
    const handleManualTrigger = () => {
      setShowPrompt(true);
      setShowIOSInstructions(false);
    };
    window.addEventListener("trigger-pwa-install", handleManualTrigger);

    // 6. Graceful fallback trigger for other browsers/devices (like iOS Safari)
    const generalTimer = setTimeout(() => {
      const isAlreadyInstalled = localStorage.getItem("glvia_pwa_installed") === "true";
      // On iOS Safari, beforeinstallprompt never fires, so we show the prompt using our custom generalTimer
      if (!isAlreadyInstalled) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("trigger-pwa-install", handleManualTrigger);
      clearTimeout(generalTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, direct installation is impossible, show premium fallback instructions
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      try {
        // Trigger the native install prompt immediately
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          localStorage.setItem("glvia_pwa_installed", "true");
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Installation prompt failed:", err);
      }
    } else {
      // Fallback for browsers that don't support custom prompt trigger but support PWA
      alert("To install, open your browser menu (the three dots) and click 'Add to Home screen'.");
    }
  };

  const handleDismiss = () => {
    // Store current timestamp for 24-hour temporary suppression
    localStorage.setItem("glvia_pwa_prompt_dismissed_at", Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/40 backdrop-blur-[2px] font-sans antialiased select-none animate-fadeIn">
      {/* Tap outside sheet to dismiss */}
      <div className="absolute inset-0" onClick={handleDismiss} />

      {/* Premium Bottom-Sheet Popup Card */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-[32px] shadow-[0_-16px_40px_rgba(0,0,0,0.06)] p-6 max-h-[85vh] overflow-y-auto transform transition-all duration-300 animate-slideUp z-10">
        
        {/* Native Sheet Drag Handle */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />

        {/* Content View: Guidelines or Main Install Info */}
        {!showIOSInstructions ? (
          <div>
            {/* Header: Logo + Title Side-by-Side */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-12 h-12 rounded-[14px] overflow-hidden shrink-0 border border-slate-100 shadow-sm bg-white">
                <Image src="/logo.png" alt="Glvia App Logo" fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">Install Glvia App</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Install Glvia for a faster, smoother, and better salon booking experience.</p>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-2.5 my-5">
              {[
                { title: "Faster performance", icon: "bolt" },
                { title: "App-like experience", icon: "touch_app" },
                { title: "Quick booking access", icon: "calendar_month" },
                { title: "Home screen access", icon: "home" }
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-50 bg-slate-50/40">
                  <div className="w-6 h-6 rounded-full bg-[#fff0f4] text-[#e11d48] flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-xs font-bold">{benefit.icon}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 leading-tight">{benefit.title}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2.5 mt-6">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#9333ea] text-white text-xs font-extrabold shadow-md active:scale-[0.98] transition-all hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-icons-round text-sm">download_for_offline</span>
                Install App
              </button>

              <button
                onClick={handleDismiss}
                className="w-full py-3 text-slate-400 hover:text-slate-600 text-xs font-extrabold transition-colors cursor-pointer text-center"
              >
                Continue in Browser
              </button>
            </div>
          </div>
        ) : (
          /* iOS Safari Step-by-Step Instructions view */
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">Install on iOS Safari</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Follow 3 quick steps to add Glvia to your Home Screen</p>
              </div>
              <button 
                onClick={() => setShowIOSInstructions(false)}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="material-icons-round text-sm">close</span>
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-4 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-xs shadow-sm">1</span>
                <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5 flex-wrap">
                  Tap the Share button 
                  <span className="material-icons-round text-[18px] text-[#007aff] bg-white p-1 rounded-lg border border-slate-100 shadow-sm leading-none shrink-0">ios_share</span>
                  in Safari's toolbar.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-xs shadow-sm">2</span>
                <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5 flex-wrap">
                  Scroll down and tap
                  <span className="font-extrabold text-slate-950 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm leading-none">Add to Home Screen</span>.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-xs shadow-sm">3</span>
                <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                  Tap <span className="font-extrabold text-slate-950">Add</span> in the top right corner.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mt-6">
              <button
                onClick={() => {
                  setShowIOSInstructions(false);
                  handleDismiss();
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-extrabold shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Okay, I understand
              </button>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full py-3 text-slate-400 hover:text-slate-600 text-xs font-extrabold transition-colors cursor-pointer text-center"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
