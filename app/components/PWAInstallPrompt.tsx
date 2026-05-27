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
      // Already installed or running in standalone mode -> Never show again
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
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in ms
      if (currentTime - parsedTime < twentyFourHours) {
        // Dismissed within last 24 hours, keep hidden
        return;
      }
    }

    // 5. Event Listener for Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait a short delay after homepage load to make it look premium
      setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 6. Handle iOS or general browsers where beforeinstallprompt doesn't fire
    // Wait a brief delay to gracefully slide in
    const generalTimer = setTimeout(() => {
      const isAlreadyInstalled = localStorage.getItem("glvia_pwa_installed") === "true";
      if (!isAlreadyInstalled) {
        setShowPrompt(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(generalTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      try {
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
    <div className="fixed inset-0 z-[200] flex flex-col justify-between bg-white px-6 py-10 font-sans antialiased select-none overflow-y-auto animate-fadeIn">
      {/* Background Soft Glow Blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-pink-500/[0.04] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-500/[0.04] blur-[80px] pointer-events-none" />

      {/* Top Section - Logo & Header */}
      <div className="flex flex-col items-center text-center mt-6">
        {/* Shiny App Logo Card */}
        <div className="relative w-24 h-24 rounded-3xl p-1 bg-white border border-slate-100 shadow-[0_16px_36px_rgba(0,0,0,0.06)] flex items-center justify-center mb-6 hover:scale-105 transition-transform duration-300">
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#e11d48] to-[#9333ea] flex items-center justify-center shadow-inner overflow-hidden">
            <span className="material-icons-round text-white text-[48px] font-bold">spa</span>
          </div>
        </div>

        <h1 className="text-2.5xl font-black text-slate-900 tracking-tight mb-2">
          Install Glvia App
        </h1>
        <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-[280px]">
          Install the Glvia Web App for a faster, smoother, and more seamless beauty booking experience.
        </p>
      </div>

      {/* Middle Section - Benefits List */}
      <div className="my-8 max-w-sm mx-auto w-full px-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
          Premium Benefits
        </h3>
        
        <div className="space-y-4">
          {[
            { title: "Faster performance", desc: "Instant loading and zero friction" },
            { title: "App-like experience", desc: "Borderless, beautiful full-screen views" },
            { title: "One-tap booking access", desc: "Get straight to your stylists instantly" },
            { title: "Better browsing experience", desc: "Clean interface without web browser bars" },
            { title: "Quick access from home screen", desc: "Launches right from your home app layout" }
          ].map((benefit, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-2xl border border-slate-50 bg-slate-50/30 hover:border-pink-100 transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#fff0f4] text-[#e11d48] flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-icons-round text-xs font-bold">check</span>
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-950 mb-0.5">{benefit.title}</h4>
                <p className="text-[10px] text-slate-400 font-semibold">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section - Action CTAs */}
      <div className="flex flex-col gap-3 w-full max-w-sm mx-auto mt-auto">
        <button
          onClick={handleInstallClick}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#9333ea] text-white text-xs font-extrabold shadow-md active:scale-[0.98] transition-all hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-icons-round text-sm">download_for_offline</span>
          Install App
        </button>

        <button
          onClick={handleDismiss}
          className="w-full py-3.5 text-slate-400 hover:text-slate-600 text-xs font-extrabold transition-colors cursor-pointer text-center"
        >
          Continue in Browser
        </button>
      </div>

      {/* Premium iOS share drawer helper */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[250] flex items-end justify-center p-4">
          {/* Blur Overlay */}
          <div 
            className="absolute inset-0 bg-[#191c1d]/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowIOSInstructions(false)}
          />
          
          {/* iOS Guidelines Drawer Card */}
          <div className="relative w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-2xl border-t border-slate-100 flex flex-col gap-6 animate-slideUp z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 leading-tight">Install on iOS Safari</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Add to your Home Screen in 3 quick steps</p>
              </div>
              <button 
                onClick={() => setShowIOSInstructions(false)}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="material-icons-round text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-xs shadow-sm">1</span>
                <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                  Tap the Share button 
                  <span className="material-icons-round text-[18px] text-[#007aff] bg-white p-1 rounded-lg border border-slate-100 shadow-sm leading-none shrink-0">ios_share</span>
                  in Safari.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-xs shadow-sm">2</span>
                <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                  Scroll down and choose
                  <span className="font-extrabold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm leading-none">Add to Home Screen</span>.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-xs shadow-sm">3</span>
                <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                  Tap <span className="font-extrabold text-slate-900">Add</span> in the top right corner.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSInstructions(false);
                handleDismiss();
              }}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-extrabold shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              Okay, I understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
