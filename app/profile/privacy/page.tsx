"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-white flex flex-col justify-between text-slate-800 antialiased">
      
      {/* ─── Header (Exactly like the provided screenshot) ─── */}
      <header className="bg-white text-slate-900 px-4 py-4 flex items-center border-b border-slate-100 sticky top-0 z-50 shrink-0">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all mr-2"
          aria-label="Go Back"
        >
          <span className="material-icons-round text-[28px] text-slate-900 font-medium">chevron_left</span>
        </button>
        <span className="font-extrabold text-[20px] tracking-tight text-slate-900">Privacy Policy</span>
      </header>

      {/* ─── Content (Minimalist Document Style matching the mockup) ─── */}
      <main className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto space-y-8 select-text">
        
        {/* Main Title Header */}
        <div className="border-b border-slate-100 pb-5">
          <h1 className="text-[15px] font-black text-slate-900 tracking-wider uppercase">
            GLVIA PRIVACY POLICY
          </h1>
          <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
            Last Updated: May 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="text-[13px] leading-relaxed text-slate-600 font-semibold space-y-4">
          <p>
            Welcome to GLVIA (“GLVIA”, “we”, “our”, “us”), accessible through{" "}
            <a href="https://glvia.com" className="text-sky-500 hover:underline">
              https://glvia.com
            </a>.
          </p>
          <p>
            At GLVIA, we respect your privacy and are committed to protecting your
            personal information. This Privacy Policy explains how we collect, use,
            process, store, and protect your information when you access or use our
            website, web application, installed Progressive Web App (PWA), services,
            booking platform, salon marketplace, support systems, and associated
            technologies (collectively referred to as the “Platform”).
          </p>
        </div>

        {/* Section Blocks */}
        <div className="space-y-6 text-[13px] leading-relaxed text-slate-600 font-semibold">
          
          {/* Who We Are */}
          <div className="space-y-2">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              WHO WE ARE
            </h2>
            <p>
              GLVIA is a luxury beauty-tech salon discovery and booking platform that connects 
              customers with salons, beauty professionals, and personal care services.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] space-y-1 mt-1 text-slate-500 font-bold">
              <div><span className="text-slate-700">Support Email:</span> care@glvia.com</div>
              <div><span className="text-slate-700">Website:</span> https://glvia.com</div>
              <div><span className="text-slate-700">Location:</span> Ballia, Uttar Pradesh, India</div>
            </div>
          </div>

          {/* Applicability */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              APPLICABILITY
            </h2>
            <p>This policy applies to:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>Customers</li>
              <li>Salon Owners / Business Partners</li>
              <li>Administrative Users</li>
            </ul>
          </div>

          {/* Information We Collect */}
          <div className="space-y-3 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              INFORMATION WE COLLECT
            </h2>
            
            <div className="space-y-1">
              <span className="text-[12px] font-black text-slate-800">Account Information:</span>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
                <li>Full name</li>
                <li>Mobile number</li>
                <li>Email address</li>
                <li>Profile photo (optional)</li>
                <li>Gender preferences</li>
                <li>Account role</li>
              </ul>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[12px] font-black text-slate-800">Authentication:</span>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
                <li>Mobile OTP login</li>
                <li>Google Sign-In</li>
              </ul>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[12px] font-black text-slate-800">Booking Information:</span>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
                <li>Salon details</li>
                <li>Appointment time/date</li>
                <li>Services selected</li>
                <li>Booking history</li>
              </ul>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[12px] font-black text-slate-800">Reviews & Ratings:</span>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
                <li>Star ratings</li>
                <li>Review text</li>
                <li>Uploaded images</li>
                <li>Verified booking information</li>
              </ul>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[12px] font-black text-slate-800">Salon Owner Information:</span>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
                <li>Salon/business name</li>
                <li>Logo</li>
                <li>Address</li>
                <li>Phone/email</li>
                <li>Services and pricing</li>
                <li>Staff information</li>
                <li>Media uploads</li>
              </ul>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              LOCATION INFORMATION
            </h2>
            <p>GLVIA may request approximate location to:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>Recommend nearby salons</li>
              <li>Improve search experience</li>
            </ul>
          </div>

          {/* PWA / Web App */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              PWA / WEB APP
            </h2>
            <p>
              GLVIA supports Progressive Web App installation. We may collect limited 
              device information to improve app performance.
            </p>
          </div>

          {/* Payments */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              PAYMENTS
            </h2>
            <p>
              Currently GLVIA supports cash payments at the salon. Future integrated digital payment 
              methods may include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>UPI</li>
              <li>Razorpay</li>
              <li>Debit/Credit Cards</li>
            </ul>
          </div>

          {/* Cookies */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              COOKIES
            </h2>
            <p>We may use cookies to:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>Remember login preferences</li>
              <li>Improve performance</li>
              <li>Save custom settings</li>
            </ul>
          </div>

          {/* How We Use Information */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              HOW WE USE INFORMATION
            </h2>
            <p>We use data to:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>Provide and facilitate salon bookings</li>
              <li>Verify OTP logins securely</li>
              <li>Improve platform performance and database query speed</li>
              <li>Send booking confirmation and slot updates</li>
              <li>Prevent fraud and ensure marketplace safety</li>
            </ul>
          </div>

          {/* Data Sharing */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              DATA SHARING
            </h2>
            <p>GLVIA does not sell personal information under any circumstances.</p>
            <p>We may share limited information with:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>Salon partners for executing booking reservations</li>
              <li>Secure authentication providers</li>
              <li>Legal authorities if required by active regulations</li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              DATA SECURITY
            </h2>
            <p>We implement security protocols including:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>Secure Mobile OTP verification</li>
              <li>Google OAuth credentials</li>
              <li>Role-based operational permissions</li>
              <li>Secure encryption layers for data transmittal</li>
            </ul>
          </div>

          {/* Verified Reviews */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              VERIFIED REVIEWS
            </h2>
            <p>
              Only customers with completed appointments may submit reviews on salons. GLVIA 
              may moderate, approve, reject, or remove reviews that violate community policies.
            </p>
          </div>

          {/* Account Deletion */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              ACCOUNT DELETION
            </h2>
            <p>
              Users may request account deletion at any time by contacting our support team at:{" "}
              <a href="mailto:care@glvia.com" className="text-sky-500 hover:underline">
                care@glvia.com
              </a>
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              CHILDREN’S PRIVACY
            </h2>
            <p>GLVIA is not intended for users under 18 years of age.</p>
          </div>

          {/* Changes to Policy */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              CHANGES TO POLICY
            </h2>
            <p>We may update this policy from time to time to match legal guidelines.</p>
          </div>

          {/* Contact */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              CONTACT GLVIA SUPPORT
            </h2>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-500 font-bold space-y-1.5">
              <div><span className="text-slate-800">Support Team Email:</span> care@glvia.com</div>
              <div><span className="text-slate-800">Website:</span> https://glvia.com</div>
              <div><span className="text-slate-800">Location:</span> Ballia, Uttar Pradesh, India</div>
            </div>
          </div>

        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full py-5 text-center text-[10px] text-slate-400 font-bold border-t border-slate-100 bg-white">
        © 2026 GLVIA. All rights reserved.
      </footer>

    </div>
  );
}
