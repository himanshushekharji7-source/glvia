"use client";

import { useRouter } from "next/navigation";

export default function TermsAndConditionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-white flex flex-col justify-between text-slate-800 antialiased select-text">
      
      {/* ─── Header (Exactly like the Privacy Policy header) ─── */}
      <header className="bg-white text-slate-900 px-4 py-4 flex items-center border-b border-slate-100 sticky top-0 z-50 shrink-0">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all mr-2"
          aria-label="Go Back"
        >
          <span className="material-icons-round text-[28px] text-slate-900 font-medium">chevron_left</span>
        </button>
        <span className="font-extrabold text-[20px] tracking-tight text-slate-900">Terms & Conditions</span>
      </header>

      {/* ─── Content (Minimalist Document Style matching the mockup) ─── */}
      <main className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto space-y-8">
        
        {/* Title Block */}
        <div className="border-b border-slate-100 pb-5">
          <h1 className="text-[15px] font-black text-slate-900 tracking-wider uppercase">
            GLVIA TERMS & CONDITIONS
          </h1>
          <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
            Last Updated: May 2026
          </p>
        </div>

        {/* Intro Notification */}
        <div className="text-[13px] leading-relaxed text-slate-600 font-semibold space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-[11px] text-slate-500 space-y-1.5">
            <span className="font-black text-slate-800 uppercase block tracking-wide">⚠️ IMPORTANT NOTICE:</span>
            <p>
              These Terms & Conditions govern your use of GLVIA, including salon discovery, Salon-at-Home and At-Salon bookings, salon owner business services, reviews, and related platform features. By accessing or using GLVIA, you agree to be bound by these terms in their entirety.
            </p>
          </div>
          
          <p>
            GLVIA is owned and operated by GLVIA, a company incorporated under the Companies Act 2013, vide CIN U93000RJ2019PTC066995 and having its registered office at Sitapura Industrial Area, Ballia, Uttar Pradesh, India (hereinafter referred to as the “Company”, “we”, “us”, “our”, “ourselves”).
          </p>
          
          <p>
            These Terms and Conditions (“T&Cs”) along with the Privacy Policy comprise the terms under which you shall be permitted to use the Company’s website and mobile application (together referred to as the “Platform”).
          </p>
        </div>

        {/* Clause Details */}
        <div className="space-y-6 text-[13px] leading-relaxed text-slate-600 font-semibold">
          
          {/* Definitions */}
          <div className="space-y-3 pt-5 border-t border-slate-50">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              DEFINITIONS
            </h2>
            <p>Unless repugnant to the context, the terms used in these T&Cs have the following meaning:</p>
            
            <div className="space-y-2.5 pl-3">
              <div>
                <span className="text-[12px] font-black text-slate-800">Account:</span> The account created by a User on the Platform at the time of registration.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Appointment Slot:</span> A specific time and date allocated to the User, contingent upon the Service Provider’s availability and selection during the booking process on the Platform.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Booking:</span> An accepted and confirmed reservation of an Appointment Slot accepted by the User for availing of the Services.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Booking Details:</span> The details relating to the Booking, including the description of Services, Service Provider, date, price, slot, mode of payment, and designated location.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Booking Fee:</span> A nominal fee paid by the Client to secure and reserve the Appointment Slot.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Client:</span> Any User who makes a successful Booking through the Platform and pays a nominal Booking Fee.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Convenience Fee:</span> A fee paid to the Service Professional for the convenience of booking the slot, compensating them for their time, effort, and resources for either Salon-at-Home or At-Salon services.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Platform Fee:</span> The nominal fee charged and retained by the Company for facilitating the booking process, maintenance, customer support, and Platform development.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Services:</span> Collectively refers to both Salon-At-Home and At-Salon services offered by Service Professionals listed on the Platform (hairstyling, haircuts, facials, pedicures, manicures, waxing, threading, and beauty treatments).
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Service Professionals / Providers:</span> Individual professionals engaged for rendering Services to the Clients.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Service Fee:</span> The total fee payable by the Client, inclusive of applicable taxes, Platform Fee, Convenience Fee, and any transaction processing fees.
              </div>
              <div>
                <span className="text-[12px] font-black text-slate-800">Force Majeure Event:</span> Acts of God, lockdowns, pandemics, server break-downs, network/internet failures, or other conditions beyond the control of the Company.
              </div>
            </div>
          </div>

          {/* Acceptance of Terms */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              ACCEPTANCE OF TERMS
            </h2>
            <p>
              By accessing, browsing, or using the Platform, you acknowledge that you have read, understood, and agreed to be bound by these T&Cs. The onus of ensuring the completeness and accuracy of registration information lies with the User.
            </p>
            <p>
              The Company reserves the right to reject the request for creation of the Account, at its sole discretion, if the data submitted appears to be incomplete, incorrect, or inaccurate.
            </p>
          </div>

          {/* Our Services */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              OUR SERVICES
            </h2>
            <p>
              Through our Platform, we specialize in offering both, ‘Salon-at-Home’ and ‘At-Salon’ services. Style categories include haircuts, coloring, skincare treatments, manicures, pedicures, threading, waxing, makeup application, and special occasion grooming.
            </p>
            <p>
              Stylists are assigned subject to slot availability, location proximity, and their specific beauty expertise.
            </p>
          </div>

          {/* Conditions and Booking */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              CONDITIONS & THE BOOKING PROCESS
            </h2>
            <p>
              Once you place a Booking Request, the Company shall assign the Service Professional within two (2) hours if submitted during regular business hours. Bookings made after business hours will be assigned the following working day.
            </p>
            <p>
              Upon successful assignment, you will receive a confirmation alert on your registered email and mobile number, detailing the appointment and assigned stylist.
            </p>
          </div>

          {/* Re-booking Stylist */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              RE-BOOKING PREFERRED STYLISTS
            </h2>
            <p>
              If you had a high-quality experience with a specific Service Professional, you will have the option to select them again for future reservations, subject to their active calendar schedule and slot availability.
            </p>
          </div>

          {/* Prohibited Activities */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              PROHIBITED ACTIVITIES
            </h2>
            <p>Users and visitors are strictly prohibited from:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-500">
              <li>Systematically retrieving data or catalog details to compile directories or databases without prior written permission from us.</li>
              <li>Attempting to trick, defraud, or mislead us and other users, especially to learn sensitive account information or bypass security.</li>
              <li>Circumventing, disabling, or interfering with security-related features of the Platform or restricting access permissions.</li>
              <li>Engaging in unauthorized framing of or linking to the Platform.</li>
              <li>Using automated systems, scrapers, bots, or buying agents to book services.</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="space-y-2 border-t border-slate-50 pt-5">
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
              CONTACT GLVIA SUPPORT
            </h2>
            <p>For any complaints, security notifications, or disputes regarding appointments, reach out to our team:</p>
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
