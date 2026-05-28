"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-white flex flex-col justify-between text-slate-800 antialiased select-text">
      
      {/* ─── Header ─── */}
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

      {/* ─── Body Content ─── */}
      <main className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto space-y-8">
        
        {/* Title Block */}
        <div className="border-b border-slate-100 pb-5">
          <h1 className="text-[15px] font-black text-slate-900 tracking-wider uppercase">
            GLVIA PRIVACY POLICY
          </h1>
          <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
            Last Updated: May 2026
          </p>
        </div>

        {/* Intro */}
        <div className="text-[13px] leading-relaxed text-slate-600 font-semibold space-y-4">
          <p>
            Welcome to GLVIA (“GLVIA”, “we”, “our”, “us”). This Privacy Policy explains how we collect, use, disclose, protect, and process your information when you use our website{" "}
            <a href="https://glvia.com" className="text-sky-500 hover:underline">https://glvia.com</a>, mobile browser experience, installed Progressive Web App (PWA), salon marketplace, booking services, review systems, support tools, and associated services (“Platform”).
          </p>
          <p className="text-[12px] text-red-500 font-bold uppercase tracking-wide">
            PLEASE READ THIS POLICY CAREFULLY BEFORE USING GLVIA.
          </p>
        </div>

        {/* Content Clauses */}
        <div className="space-y-6 text-[13px] leading-relaxed text-slate-600 font-semibold">
          
          {/* Section 1 */}
          <div className="space-y-2">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              1. WHO WE ARE
            </h2>
            <p>
              GLVIA is a luxury beauty-tech salon discovery and booking marketplace connecting customers with salons, beauty professionals, and personal care services.
            </p>
            <p>GLVIA enables:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>Salon discovery</li>
              <li>Instant salon bookings</li>
              <li>Verified customer reviews & ratings</li>
              <li>Salon owner business management</li>
              <li>Media and gallery management</li>
              <li>Customer support & help center</li>
              <li>Promotional campaigns and offers</li>
            </ul>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] space-y-1 mt-2 text-slate-500 font-bold">
              <div><span className="text-slate-800">Website:</span> https://glvia.com</div>
              <div><span className="text-slate-800">Email:</span> care@glvia.com</div>
              <div><span className="text-slate-800">Location:</span> Ballia, Uttar Pradesh, India</div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              2. APPLICABILITY OF THIS POLICY
            </h2>
            <p>This policy applies to:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>Customers</li>
              <li>Salon owners and business partners</li>
              <li>Administrative users</li>
              <li>Visitors browsing GLVIA</li>
            </ul>
            <p className="mt-2">It covers:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li>Website access</li>
              <li>Installed web app (PWA)</li>
              <li>Login systems</li>
              <li>Bookings</li>
              <li>Reviews & ratings</li>
              <li>Media uploads</li>
              <li>Customer support</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              3. INFORMATION WE COLLECT
            </h2>
            
            <div className="space-y-1">
              <span className="text-[12px] font-black text-slate-800">A. ACCOUNT INFORMATION:</span>
              <p>We may collect: Name, Mobile number, Email address, Profile image (optional), Gender preferences, and Account role (customer, salon owner, admin).</p>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[12px] font-black text-slate-800">B. AUTHENTICATION INFORMATION:</span>
              <div className="pl-3 space-y-1">
                <span className="text-[11px] font-black text-slate-700">1. Mobile OTP Login:</span>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
                  <li>Phone number</li>
                  <li>OTP verification status</li>
                  <li>Authentication logs</li>
                  <li>Session information</li>
                </ul>
                <span className="text-[11px] font-black text-slate-700 block pt-1.5">2. Google Sign-In (If you sign in using Google):</span>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
                  <li>Name</li>
                  <li>Email</li>
                  <li>Profile image</li>
                  <li>Basic account information allowed by Google</li>
                </ul>
                <p className="text-[11px] text-slate-400 italic">GLVIA never accesses your Google password.</p>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[12px] font-black text-slate-800">C. BOOKING INFORMATION:</span>
              <p>When booking services: Salon selected, Services selected, Booking ID, Appointment date/time, Booking status, Customer preferences, Visit history, and Cancellation details.</p>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[12px] font-black text-slate-800">D. VERIFIED REVIEWS & RATINGS:</span>
              <p>GLVIA supports verified customer reviews. We may collect: Star rating, Review text, Review images, Booking verification status, Owner replies, and Moderation status.</p>
              <p className="text-xs text-slate-500 italic">Only completed bookings may submit verified reviews. GLVIA may moderate, approve, reject, hide, or remove harmful, misleading, abusive, fake, or spam content.</p>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[12px] font-black text-slate-800">E. SALON OWNER INFORMATION:</span>
              <p>Salon partners may provide: Salon name, Logo, Address, Contact number, Email, Service details, Pricing, Timings, Staff information, Business description, and Portfolio/gallery uploads.</p>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[12px] font-black text-slate-800">F. MEDIA & IMAGE UPLOADS:</span>
              <p>Users and salon owners may upload profile images, review images, salon gallery photos, service images, and branding assets.</p>
              <p className="text-xs text-slate-500 italic">You confirm that you own the uploaded content or have permission to upload it. GLVIA reserves moderation rights.</p>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[12px] font-black text-slate-800">G. SUPPORT & HELP CENTER INFORMATION:</span>
              <p>We may collect: Support requests, Help center messages, Feedback, Complaint details, Chat information, and FAQ usefulness ratings.</p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              4. INFORMATION COLLECTED AUTOMATICALLY
            </h2>
            <p>We may automatically collect browser type, device information, operating system, device identifiers, session logs, IP address, usage behavior, app interaction behavior, and crash logs.</p>
            <p>We use this to improve security, improve speed, detect abuse, improve UI/UX, and improve reliability.</p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              5. LOCATION SERVICES
            </h2>
            <p>GLVIA may request approximate location access to recommend nearby salons, improve search relevance, show nearby services, and improve booking experience.</p>
            <p className="text-xs text-slate-400 italic">Location access is optional and can be disabled anytime.</p>
          </div>

          {/* Section 6 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              6. PWA / WEB APP INSTALLATION
            </h2>
            <p>GLVIA supports Progressive Web App (PWA) installation. If installed, we may collect browser compatibility, installation status, device type, and app performance behavior.</p>
            <p className="text-red-500 text-xs uppercase">GLVIA DOES NOT access photos, messages, device storage, or private files unless explicitly uploaded by you.</p>
          </div>

          {/* Section 7 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              7. PAYMENTS
            </h2>
            <p>Currently GLVIA supports: Cash payments at the salon.</p>
            <p>Future payment support may include: UPI, Razorpay, Credit/Debit Cards, and Wallet payments.</p>
            <p className="text-xs text-slate-400 italic">Payment processing will be handled securely. GLVIA does not store complete card credentials.</p>
          </div>

          {/* Section 8 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              8. COOKIES & TRACKING
            </h2>
            <p>We may use cookies to remember preferences, keep users signed in, improve performance, improve personalization, and improve loading speeds.</p>
          </div>

          {/* Section 9 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              9. HOW WE USE YOUR INFORMATION
            </h2>
            <p>We use data to provide bookings, authenticate users, send OTP messages, improve recommendations, prevent fraud, improve platform performance, enable customer support, moderate reviews, and improve security.</p>
          </div>

          {/* Section 10 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              10. COMMUNICATIONS
            </h2>
            <p>GLVIA may contact users regarding: OTP verification, booking confirmation, appointment reminders, booking cancellation, support replies, platform updates, and promotional notifications (where applicable).</p>
          </div>

          {/* Section 11 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              11. SHARING OF INFORMATION
            </h2>
            <p>GLVIA does NOT sell user data under any circumstances.</p>
            <p>Limited information may be shared:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
              <li><strong>With Salon Partners:</strong> For bookings (customer name, appointment details, selected services).</li>
              <li><strong>With Service Providers:</strong> Trusted infrastructure and analytics providers (Firebase, Google services).</li>
              <li><strong>For Legal Requirements:</strong> If required by courts, law enforcement, or fraud investigations.</li>
            </ul>
          </div>

          {/* Section 12 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              12. VERIFIED REVIEWS & MODERATION
            </h2>
            <p>GLVIA operates a verified review system. Only completed appointments may review. Fake or spam reviews will be removed. Salon owners may respectfully reply.</p>
          </div>

          {/* Section 13 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              13. USER GENERATED CONTENT
            </h2>
            <p>Users retain ownership of uploaded content. However, you grant GLVIA limited rights to display it for platform functionality. Prohibited uploads include illegal content, hate speech, or copyright violations.</p>
          </div>

          {/* Section 14 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              14. DATA SECURITY
            </h2>
            <p>We implement security practices including OTP verification, Google OAuth, role-based permissions, and secure database encryption. However, no online system is 100% secure.</p>
          </div>

          {/* Section 15 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              15. DATA RETENTION
            </h2>
            <p>We retain information only as necessary for active account maintenance, booking history, legal obligations, fraud prevention, and support operations.</p>
          </div>

          {/* Section 16 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              16. ACCOUNT DELETION
            </h2>
            <p>Users may request account deletion (profile removal, login termination, data cleanup) by contacting us at: <a href="mailto:care@glvia.com" className="text-sky-500 hover:underline">care@glvia.com</a></p>
          </div>

          {/* Section 17 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              17. CHILDREN’S PRIVACY
            </h2>
            <p>GLVIA is not intended for persons under 18 years of age. We do not knowingly collect information from minors.</p>
          </div>

          {/* Section 18 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              18. THIRD-PARTY SERVICES
            </h2>
            <p>GLVIA may include links to third-party services. We are not responsible for their privacy practices.</p>
          </div>

          {/* Section 19 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              19. POLICY CHANGES
            </h2>
            <p>GLVIA may modify this Privacy Policy at any time. Continued use of GLVIA means acceptance of revised policies.</p>
          </div>

          {/* Section 20 */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              20. CONTACT US
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
