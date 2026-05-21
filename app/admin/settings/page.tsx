"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your salon profile and configuration.</p>
      </div>

      <div className="card">
        <div className="flex border-b border-border overflow-x-auto">
          <button className="px-6 py-4 text-sm font-bold text-primary border-b-2 border-primary whitespace-nowrap">General</button>
          <button className="px-6 py-4 text-sm font-semibold text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors">Business Hours</button>
          <button className="px-6 py-4 text-sm font-semibold text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors">Services Menu</button>
          <button className="px-6 py-4 text-sm font-semibold text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors">Notifications</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-text-primary mb-4">Salon Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-text-secondary">Salon Name</label>
                <input type="text" defaultValue="Aura Beauty Lounge" className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2 text-text-primary focus:border-primary outline-none transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-text-secondary">Phone Number</label>
                <input type="tel" defaultValue="+1 (555) 987-6543" className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2 text-text-primary focus:border-primary outline-none transition-colors" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-text-secondary">Email Address</label>
                <input type="email" defaultValue="hello@aurabeauty.com" className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2 text-text-primary focus:border-primary outline-none transition-colors" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-text-secondary">Address</label>
                <input type="text" defaultValue="124 Beauty Avenue, Beverly Hills, CA 90210" className="w-full bg-surface-dim border border-border rounded-xl px-4 py-2 text-text-primary focus:border-primary outline-none transition-colors" />
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
                  <div className="text-[12px] text-text-secondary">Require a 20% deposit for services over $100</div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <button className="btn-secondary py-2 px-4">Cancel</button>
            <button className="btn-primary py-2 px-6">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
