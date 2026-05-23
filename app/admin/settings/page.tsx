"use client";

import { useState } from "react";
import { useAdminAuth } from "../../lib/adminAuth";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const { admin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("general"); // 'general' or 'security'
  
  // Security PIN states
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [pinLoading, setPinLoading] = useState("");

  const handlePinChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    setPinSuccess("");

    if (!admin) {
      setPinError("Not authenticated");
      return;
    }

    if (currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      setPinError("All PIN fields must be exactly 4 digits.");
      return;
    }

    if (newPin !== confirmPin) {
      setPinError("New PIN and Confirm PIN do not match.");
      return;
    }

    setPinLoading("saving");
    try {
      const { data: success, error } = await supabase.rpc("change_admin_pin", {
        input_email: admin.email,
        old_pin: currentPin,
        new_pin: newPin
      });

      if (error) throw error;

      if (success === true) {
        setPinSuccess("Security PIN updated successfully!");
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
      } else {
        setPinError("Failed to update PIN. Please verify your current PIN is correct.");
      }
    } catch (err: any) {
      console.error("Error changing PIN:", err);
      setPinError(err.message || "Failed to update Security PIN.");
    } finally {
      setPinLoading("");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your salon profile and configuration.</p>
      </div>

      <div className="card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-border overflow-x-auto bg-gray-50/50">
          <button 
            onClick={() => setActiveTab("general")}
            className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "general" 
                ? "text-primary border-primary" 
                : "text-text-secondary border-transparent hover:text-text-primary"
            }`}
          >
            General
          </button>
          
          {admin?.role === "super_admin" && (
            <button 
              onClick={() => setActiveTab("security")}
              className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === "security" 
                  ? "text-primary border-primary" 
                  : "text-text-secondary border-transparent hover:text-text-primary"
              }`}
            >
              Security Settings
            </button>
          )}

          <button className="px-6 py-4 text-sm font-semibold text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors opacity-50 cursor-not-allowed">Business Hours</button>
          <button className="px-6 py-4 text-sm font-semibold text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors opacity-50 cursor-not-allowed">Services Menu</button>
          <button className="px-6 py-4 text-sm font-semibold text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors opacity-50 cursor-not-allowed">Notifications</button>
        </div>
        
        {/* General Tab Content */}
        {activeTab === "general" && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-text-primary mb-4">Salon Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-text-secondary">Salon Name</label>
                  <input type="text" defaultValue="Aura Beauty Lounge" className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2.5 text-text-primary focus:border-primary outline-none transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-text-secondary">Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 987-6543" className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2.5 text-text-primary focus:border-primary outline-none transition-colors" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-semibold text-text-secondary">Email Address</label>
                  <input type="email" defaultValue="hello@aurabeauty.com" className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2.5 text-text-primary focus:border-primary outline-none transition-colors" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-semibold text-text-secondary">Address</label>
                  <input type="text" defaultValue="124 Beauty Avenue, Beverly Hills, CA 90210" className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2.5 text-text-primary focus:border-primary outline-none transition-colors" />
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border">
              <h2 className="text-base font-bold text-text-primary mb-4">Booking Settings</h2>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-6 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-text-primary">Auto-Confirm Bookings</div>
                    <div className="text-[12px] text-text-secondary">Automatically accept bookings that fit your schedule</div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-6 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-text-primary">Require Deposit</div>
                    <div className="text-[12px] text-text-secondary">Require a 20% deposit for services over ₹100</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border flex justify-end gap-3">
              <button className="btn-secondary py-2.5 px-4">Cancel</button>
              <button className="btn-primary py-2.5 px-6">Save Changes</button>
            </div>
          </div>
        )}

        {/* Security Tab Content */}
        {activeTab === "security" && admin?.role === "super_admin" && (
          <form onSubmit={handlePinChangeSubmit} className="p-6 space-y-6 max-w-md">
            <div>
              <h2 className="text-base font-bold text-text-primary mb-1">Change Security PIN</h2>
              <p className="text-xs text-text-secondary mb-4">Provide your current Security PIN and configure a new 4-digit code.</p>
            </div>

            {pinError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="material-icons-round text-[16px]">error</span>
                {pinError}
              </div>
            )}

            {pinSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="material-icons-round text-[16px]">check_circle</span>
                {pinSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-text-secondary">Current PIN</label>
                <input 
                  type="password" 
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="••••"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2.5 text-text-primary focus:border-primary outline-none transition-colors tracking-widest text-lg font-bold" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-text-secondary">New PIN</label>
                <input 
                  type="password" 
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2.5 text-text-primary focus:border-primary outline-none transition-colors tracking-widest text-lg font-bold" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-text-secondary">Confirm New PIN</label>
                <input 
                  type="password" 
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2.5 text-text-primary focus:border-primary outline-none transition-colors tracking-widest text-lg font-bold" 
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button 
                type="submit"
                disabled={!!pinLoading}
                className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
              >
                {pinLoading === "saving" && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Security PIN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
