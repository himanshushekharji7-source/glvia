
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateSalonProfile } from "../../lib/hooks";

const STEPS = [
  "Owner Details",
  "Brand Profile",
  "Location",
  "Services",
  "Business Hours",
  "Branding",
  "Verification"
];

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
    ownerName: "Salon Owner",
    tagline: ""
  });
  
  const [saving, setSaving] = useState(false);
  const updateProfile = useUpdateSalonProfile();

  const handleNext = () => {
    if (currentStep < 7) setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
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
        status: "approved"
      });
      setCurrentStep(7);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const slideVariants: any = {
    enter: (direction: number) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 30 : -30, opacity: 0 }),
  };

  return (
    <div className="bg-background text-on-background min-h-dvh flex flex-col antialiased font-['Plus_Jakarta_Sans']">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full bg-surface/80 backdrop-blur-xl shadow-sm z-50">
        <div className="flex items-center justify-between px-5 md:px-10 h-16 w-full max-w-7xl mx-auto">
          <button onClick={() => {}} className="text-on-surface-variant hover:opacity-80 active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full hover:bg-surface-variant/50">
            <span className="material-icons-round">close</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-primary">GLVIA</h1>
          <button className="text-on-surface-variant hover:opacity-80 active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full hover:bg-surface-variant/50">
            <span className="material-icons-round">help</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow pt-24 pb-32 px-5 md:px-10 flex items-center justify-center relative overflow-hidden">
        
        {/* Abstract Glow Background */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-primary-container/10 to-secondary-container/10 rounded-full blur-3xl -translate-y-1/2 opacity-50 z-0"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-tertiary-container/10 to-primary-container/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/3 opacity-50 z-0"></div>

        {/* Central Card */}
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 relative z-10 flex flex-col gap-6">
          
          {currentStep < 7 && (
            <>
              <div className="text-center flex flex-col gap-2">
                <p className="text-[12px] font-semibold text-primary uppercase tracking-widest">Step {currentStep + 1} of 7: {STEPS[currentStep]}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-on-background">
                  {currentStep === 0 && "Complete Your Salon Setup"}
                  {currentStep === 1 && "Brand Profile"}
                  {currentStep === 2 && "Where are you located?"}
                  {currentStep === 3 && "Configure Services Later"}
                  {currentStep === 4 && "Business Hours & Pricing"}
                  {currentStep === 5 && "Upload Photos Later"}
                  {currentStep === 6 && "Ready to go live!"}
                </h2>
                <p className="text-[16px] text-on-surface-variant mt-1">
                  {currentStep === 0 && "Let's start with the basics to verify your account."}
                  {currentStep === 1 && "Establish how clients will see you on the marketplace."}
                  {currentStep === 2 && "Help clients find your physical location easily."}
                  {currentStep === 3 && "You can skip adding services for now."}
                  {currentStep === 4 && "Set client expectations."}
                  {currentStep === 5 && "You can add interior photos and logos from your dashboard."}
                  {currentStep === 6 && "Click finish to access your dashboard."}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-1 w-full mt-2">
                {STEPS.map((_, idx) => (
                  <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= currentStep ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-surface-variant'}`}></div>
                ))}
              </div>
            </>
          )}

          {/* Step Content */}
          <div className="relative overflow-hidden min-h-[350px]">
            <AnimatePresence mode="wait" custom={1}>
              <motion.div
                key={currentStep}
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full flex flex-col gap-4"
              >
                {currentStep === 0 && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Full Name</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
                        <input value={formData.ownerName} onChange={(e: any) => setFormData(p => ({...p, ownerName: e.target.value}))} className="w-full h-14 pl-12 pr-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background transition-shadow shadow-sm placeholder:text-outline-variant outline-none" placeholder="Enter your full name" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Mobile Number</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-outline">call</span>
                        <input value={formData.contact_phone} onChange={(e: any) => setFormData(p => ({...p, contact_phone: e.target.value}))} className="w-full h-14 pl-12 pr-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background transition-shadow shadow-sm placeholder:text-outline-variant outline-none" placeholder="+91 Enter mobile number" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Email Address</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
                        <input value={formData.contact_email} onChange={(e: any) => setFormData(p => ({...p, contact_email: e.target.value}))} className="w-full h-14 pl-12 pr-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background transition-shadow shadow-sm placeholder:text-outline-variant outline-none" placeholder="owner@example.com" />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Salon Name</label>
                      <input value={formData.name} onChange={(e: any) => setFormData(p => ({...p, name: e.target.value}))} className="w-full h-14 px-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background outline-none placeholder:text-outline-variant" placeholder="e.g. Aura Aesthetics" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Tagline (Optional)</label>
                      <input value={formData.tagline} onChange={(e: any) => setFormData(p => ({...p, tagline: e.target.value}))} className="w-full h-14 px-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background outline-none placeholder:text-outline-variant" placeholder="e.g. Redefining modern beauty." />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">About Salon</label>
                      <textarea value={formData.description} onChange={(e: any) => setFormData(p => ({...p, description: e.target.value}))} className="w-full p-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background outline-none placeholder:text-outline-variant resize-none" rows={3} placeholder="Brief description..."></textarea>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Street Address</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                        <input value={formData.address_street} onChange={(e: any) => setFormData(p => ({...p, address_street: e.target.value}))} className="w-full h-14 pl-12 pr-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background outline-none placeholder:text-outline-variant" placeholder="Shop No, Building..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-semibold text-on-surface-variant">City</label>
                        <input value={formData.address_city} onChange={(e: any) => setFormData(p => ({...p, address_city: e.target.value}))} className="w-full h-14 px-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background outline-none placeholder:text-outline-variant" placeholder="Mumbai" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[12px] font-semibold text-on-surface-variant">State</label>
                        <input value={formData.address_state} onChange={(e: any) => setFormData(p => ({...p, address_state: e.target.value}))} className="w-full h-14 px-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background outline-none placeholder:text-outline-variant" placeholder="Maharashtra" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Google Maps Link</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-outline">map</span>
                        <input value={formData.google_map_url} onChange={(e: any) => setFormData(p => ({...p, google_map_url: e.target.value}))} className="w-full h-14 pl-12 pr-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background outline-none placeholder:text-outline-variant" placeholder="https://maps.google.com/..." />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto bg-primary-fixed rounded-2xl flex items-center justify-center text-primary mb-4">
                      <span className="material-icons-round text-[32px]">content_cut</span>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Business Hours</label>
                      <textarea value={formData.timings} onChange={(e: any) => setFormData(p => ({...p, timings: e.target.value}))} className="w-full p-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background outline-none placeholder:text-outline-variant resize-none" rows={3} placeholder="e.g. Mon-Sun: 10:00 AM - 8:00 PM"></textarea>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-on-surface-variant">Price Range</label>
                      <div className="relative">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-outline">payments</span>
                        <input value={formData.price_range} onChange={(e: any) => setFormData(p => ({...p, price_range: e.target.value}))} className="w-full h-14 pl-12 pr-4 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-[16px] text-on-background outline-none placeholder:text-outline-variant" placeholder="e.g. ₹200 - ₹5000" />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto bg-primary-fixed rounded-2xl flex items-center justify-center text-primary mb-4">
                      <span className="material-icons-round text-[32px]">add_photo_alternate</span>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto bg-primary-fixed rounded-2xl flex items-center justify-center text-primary mb-4">
                      <span className="material-icons-round text-[32px]">verified_user</span>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="text-center py-8">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-6"
                    >
                      <span className="material-icons-round text-5xl">celebration</span>
                    </motion.div>
                    <h2 className="text-3xl font-black text-on-background mb-3">Congratulations!</h2>
                    <p className="text-on-surface-variant mb-8 max-w-sm mx-auto">Your salon is now live on GLVIA.</p>
                    
                    <button onClick={onComplete} className="w-full max-w-sm mx-auto h-14 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-bold text-[16px] shadow-[0_8px_16px_rgba(177,14,107,0.2)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                      Go To Dashboard <span className="material-icons-round">arrow_forward</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Bottom Nav Action Bar */}
      {currentStep < 7 && (
        <div className="fixed bottom-0 w-full bg-surface/80 backdrop-blur-xl border-t border-outline-variant/20 shadow-lg z-50 px-5 py-4">
          <div className="max-w-md mx-auto flex justify-between items-center gap-4">
            <button onClick={handleBack} disabled={currentStep === 0 || saving} className={`text-[16px] font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center h-14 px-6 rounded-lg ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
              Back
            </button>
            <button onClick={currentStep === 6 ? handleFinish : handleNext} disabled={saving} className="bg-gradient-to-r from-primary to-secondary text-white font-semibold text-[16px] h-14 px-8 rounded-full flex-grow flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(177,14,107,0.2)] hover:-translate-y-0.5 transition-all">
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : currentStep === 6 ? (
                <>Finish Setup <span className="material-icons-round">check</span></>
              ) : (
                <>Continue <span className="material-icons-round">arrow_forward</span></>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
