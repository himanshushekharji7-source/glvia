"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateSalonProfile } from "../../lib/hooks";

const STEPS = [
  "Owner Details",
  "Salon Details",
  "Location",
  "Services",
  "Business Hours",
  "Branding",
  "Verification"
];

// Reusable animated input
const Input = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
    <input
      {...props}
      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-4 focus:ring-pink-500/10 focus:bg-white/10 transition-all shadow-inner"
    />
  </div>
);

export default function SalonOnboardingWizard({ 
  salonId, 
  initialData, 
  onComplete 
}: { 
  salonId: string, 
  initialData: any, 
  onComplete: () => void 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: initialData?.name === "My Salon" ? "" : (initialData?.name || ""),
    contact_phone: initialData?.contactPhone || "",
    contact_email: initialData?.contactEmail || "",
    address_street: initialData?.address_street || "",
    address_city: initialData?.address_city || "",
    address_state: initialData?.address_state || "",
    google_map_url: initialData?.google_map_url || "",
    timings: initialData?.timings || "",
    price_range: initialData?.priceRange || "",
    description: initialData?.description || "",
    ownerName: "Salon Owner", // Normally this is in admin_users, but we can collect it.
  });
  
  const [saving, setSaving] = useState(false);
  const updateProfile = useUpdateSalonProfile();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Save all accumulated data to the salon profile
      await updateProfile.mutateAsync({
        id: salonId,
        name: formData.name || "My Premium Salon",
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        address_street: formData.address_street,
        address_city: formData.address_city || "Unknown City",
        address_state: formData.address_state,
        google_map_url: formData.google_map_url,
        timings: formData.timings,
        price_range: formData.price_range,
        description: formData.description,
        status: "approved" // Optionally approve instantly or leave pending based on rules
      });
      // Trigger success animation inside wizard instead of instantly closing
      setCurrentStep(STEPS.length);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const slideVariants: any = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
  };

  const direction = 1; // Assuming forward for simplicity in animation

  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-950 p-4">
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[36px] shadow-2xl p-6 sm:p-12">
        {/* Header & Progress */}
        {currentStep < STEPS.length && (
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Complete Your Salon Setup</h2>
            <p className="text-slate-400 text-sm">Step {currentStep + 1} of {STEPS.length}: <span className="text-pink-400 font-bold">{STEPS[currentStep]}</span></p>
            
            <div className="flex gap-2 mt-6 max-w-sm mx-auto">
              {STEPS.map((_, idx) => (
                <div key={idx} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${idx <= currentStep ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="relative overflow-hidden min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <Input label="Your Full Name" value={formData.ownerName} onChange={(e: any) => setFormData(p => ({...p, ownerName: e.target.value}))} placeholder="e.g. Rahul Sharma" />
                  <Input label="Mobile Number" value={formData.contact_phone} onChange={(e: any) => setFormData(p => ({...p, contact_phone: e.target.value}))} placeholder="+91..." />
                  <Input label="Email Address" value={formData.contact_email} onChange={(e: any) => setFormData(p => ({...p, contact_email: e.target.value}))} placeholder="owner@example.com" />
                </div>
              )}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <Input label="Salon Name" value={formData.name} onChange={(e: any) => setFormData(p => ({...p, name: e.target.value}))} placeholder="e.g. The Glamour Studio" />
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">About Salon</label>
                    <textarea value={formData.description} onChange={(e: any) => setFormData(p => ({...p, description: e.target.value}))} placeholder="Brief description of your services..." className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:bg-white/10 transition-all resize-none" rows={3} />
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <Input label="Street Address" value={formData.address_street} onChange={(e: any) => setFormData(p => ({...p, address_street: e.target.value}))} placeholder="Shop No, Building, Street..." />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" value={formData.address_city} onChange={(e: any) => setFormData(p => ({...p, address_city: e.target.value}))} placeholder="Mumbai" />
                    <Input label="State" value={formData.address_state} onChange={(e: any) => setFormData(p => ({...p, address_state: e.target.value}))} placeholder="Maharashtra" />
                  </div>
                  <Input label="Google Maps Link (Optional)" value={formData.google_map_url} onChange={(e: any) => setFormData(p => ({...p, google_map_url: e.target.value}))} placeholder="https://maps.google.com/..." />
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-4 text-center py-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-pink-400 mb-4">
                    <span className="material-icons-round text-[32px]">content_cut</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Configure Services Later</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">You can skip adding services for now. Once you access your dashboard, you can build your full service menu with pricing and durations.</p>
                </div>
              )}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Business Hours</label>
                    <textarea value={formData.timings} onChange={(e: any) => setFormData(p => ({...p, timings: e.target.value}))} placeholder="e.g. Mon-Sun: 10:00 AM - 8:00 PM" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-pink-500/60 focus:bg-white/10 transition-all resize-none" rows={3} />
                  </div>
                  <Input label="General Price Range" value={formData.price_range} onChange={(e: any) => setFormData(p => ({...p, price_range: e.target.value}))} placeholder="e.g. ₹200 - ₹5000" />
                </div>
              )}
              {currentStep === 5 && (
                <div className="space-y-4 text-center py-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-pink-400 mb-4">
                    <span className="material-icons-round text-[32px]">add_photo_alternate</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload Photos Later</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">You can upload your salon logo and interior photos from your dashboard settings later.</p>
                </div>
              )}
              {currentStep === 6 && (
                <div className="space-y-4 text-center py-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-pink-400 mb-4">
                    <span className="material-icons-round text-[32px]">verified_user</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">You're almost there!</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">Business verification (GST/PAN) is optional. Click finish to access your premium salon dashboard and start accepting bookings.</p>
                </div>
              )}
              {currentStep === STEPS.length && (
                <div className="text-center py-8">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-6"
                  >
                    <span className="material-icons-round text-5xl">celebration</span>
                  </motion.div>
                  <h2 className="text-3xl font-black text-white mb-3">Congratulations!</h2>
                  <p className="text-slate-400 mb-8 max-w-sm mx-auto">Your salon is now live on GLVIA.</p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left max-w-sm mx-auto mb-8 shadow-inner">
                    <p className="font-bold text-white mb-4">You can now:</p>
                    <ul className="space-y-3">
                      {["Receive bookings", "Add staff", "Manage services", "Track earnings"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <span className="material-icons-round text-[12px]">check</span>
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button onClick={onComplete} className="w-full max-w-sm mx-auto py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white font-bold text-sm shadow-xl shadow-pink-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    Go To Dashboard <span className="material-icons-round text-[18px]">arrow_forward</span>
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {currentStep < STEPS.length && (
          <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/10"
              >
                Back
              </button>
            )}
            
            <button
              onClick={currentStep === STEPS.length - 1 ? handleFinish : handleNext}
              disabled={saving}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-xl shadow-pink-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : currentStep === STEPS.length - 1 ? (
                <>Finish Setup <span className="material-icons-round text-[18px]">check</span></>
              ) : (
                <>Continue <span className="material-icons-round text-[18px]">arrow_forward</span></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
