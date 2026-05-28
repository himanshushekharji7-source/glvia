"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col justify-between text-slate-800">
      
      {/* ─── Header ─── */}
      <header className="bg-zinc-800 text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-50 shrink-0">
        <button 
          onClick={() => router.back()} 
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all mr-3"
        >
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </button>
        <span className="font-bold text-[16px] tracking-tight">Privacy Policy</span>
      </header>

      {/* ─── Content ─── */}
      <main className="flex-1 overflow-y-auto px-5 py-6 max-w-2xl mx-auto space-y-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-4 text-center">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-snug">GLVIA Privacy Policy</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Last Updated: May 2026</p>
          </div>

          <div className="space-y-4 text-[13px] leading-relaxed text-slate-600 font-semibold">
            <p>
              Welcome to <strong>GLVIA</strong> ("we," "our," or "us"). We value your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or use our mobile application and website.
            </p>

            <h2 className="text-sm font-black text-slate-900 pt-2 border-t border-slate-50">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you create an account, complete a booking, submit settings configurations, 
              or interact with our help center. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong>Personal details:</strong> Name, email address, phone number, and location address.</li>
              <li><strong>Booking Details:</strong> Selected salon services, date, time slots, and pricing details.</li>
              <li><strong>Payment Information:</strong> Transaction identifiers and payment status (we do not store raw credit card details).</li>
            </ul>

            <h2 className="text-sm font-black text-slate-900 pt-2 border-t border-slate-50">2. How We Use Your Information</h2>
            <p>
              We use the collected information for various purposes to provide a seamless beauty-tech discovery experience:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>To facilitate instant booking schedules and dispatch service providers.</li>
              <li>To manage your referral rewards and GLVIA Cash Points (GCP) balance.</li>
              <li>To send you transactional notifications, booking confirmations, and priority customer care responses.</li>
            </ul>

            <h2 className="text-sm font-black text-slate-900 pt-2 border-t border-slate-50">3. Data Protection and Security</h2>
            <p>
              Your data is 100% secure with us. We use industry-standard encryption protocols (SSL/TLS) and secure databases via Supabase 
              to prevent unauthorized access, alteration, or leakage of your personal data. We never sell your personal information to third parties.
            </p>

            <h2 className="text-sm font-black text-slate-900 pt-2 border-t border-slate-50">4. Cookies and Device Identifiers</h2>
            <p>
              We use cookies, secure local storage, and device tokens to authenticate user sessions, remember active catalog categories, 
              and store local cart selections for on-the-go checkout bookings.
            </p>

            <h2 className="text-sm font-black text-slate-900 pt-2 border-t border-slate-50">5. Your Choices and Rights</h2>
            <p>
              You can access, edit, or delete your profile information directly from your Account settings screen. 
              If you have questions regarding data deletion or wish to withdraw consent, please contact GLVIA Customer Support using our "Message Us" tool.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs mt-6 space-y-2 text-slate-500">
              <span className="font-bold text-slate-700 block uppercase tracking-wider">💡 Want to edit this text?</span>
              You can easily edit, customize, or replace the entire privacy policy text in your codebase at 
              <code className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono ml-1 text-sky-600 font-bold break-all">app/profile/privacy/page.tsx</code>.
            </div>

          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full py-4 text-center text-[10px] text-slate-400 font-bold border-t border-slate-100 bg-white">
        © 2026 GLVIA. All rights reserved.
      </footer>

    </div>
  );
}
