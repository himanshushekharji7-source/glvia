"use client";

export default function AdminHeader() {
  return (
    <header className="h-16 bg-surface-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-surface-dim hover:bg-border-strong text-text-secondary">
          <span className="material-icons-round text-[20px]">menu</span>
        </button>

        {/* Global Search */}
        <div className="hidden md:flex relative w-80">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary">search</span>
          <input 
            type="text" 
            placeholder="Search bookings, users, or staff..." 
            className="w-full bg-surface-dim border-none rounded-xl pl-10 pr-4 py-2 text-[14px] text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-dim text-text-secondary transition-colors relative">
          <span className="material-icons-round text-[20px]">notifications_none</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-dim text-text-secondary transition-colors">
          <span className="material-icons-round text-[20px]">help_outline</span>
        </button>
      </div>
    </header>
  );
}
