"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import { useUser } from "../lib/hooks";

const menuItems = [
  { icon: "calendar_today", label: "My Bookings", href: "/bookings", badge: "" },
  { icon: "favorite", label: "Wishlist", href: "/wishlist", badge: "" },
  { icon: "notifications", label: "Notifications", href: "/notifications", badge: "" },
  { icon: "account_balance_wallet", label: "Wallet", href: "/wallet", badge: "" },
  { icon: "card_membership", label: "Membership", href: "#", badge: "Gold" },
  { icon: "star", label: "Glow Rewards", href: "#", badge: "1,250 pts" },
  { icon: "payment", label: "Payment Methods", href: "#", badge: "" },
  { icon: "location_on", label: "Saved Addresses", href: "#", badge: "" },
  { icon: "help_outline", label: "Help & Support", href: "#", badge: "" },
  { icon: "settings", label: "Settings", href: "#", badge: "" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-surface-card flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-dvh bg-surface-card pb-nav">
      <div className="relative">
        <div className="h-[160px]" style={{ background: "var(--gradient-primary)" }}>
          <div className="absolute top-4 right-4">
            <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="material-icons-round text-[18px] text-white">edit</span>
            </button>
          </div>
        </div>
        <div className="px-5 -mt-16 relative z-10">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.firstName?.charAt(0) || user.lastName?.charAt(0) || "U"}
                </span>
              </div>
            </div>
            <div className="pb-1.5">
              <h1 className="text-xl font-extrabold text-text-primary">{user.firstName} {user.lastName}</h1>
              <p className="text-[13px] text-text-secondary">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "12", label: "Bookings" },
            { value: "4.9", label: "Rating" },
            { value: user.walletBalance || "0", label: "Points" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-2xl bg-surface-dim">
              <div className="text-lg font-extrabold text-text-primary">{s.value}</div>
              <div className="text-[11px] text-text-secondary font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="relative rounded-2xl overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Membership</div>
              <div className="text-white text-xl font-bold mt-1">Gold Member</div>
              <div className="text-white/70 text-[12px] mt-0.5">Enjoy 15% off all bookings</div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-icons-round text-[28px] text-white">workspace_premium</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href} className="flex items-center gap-3.5 py-3.5 px-1 rounded-xl hover:bg-surface-dim transition-colors">
            <span className="material-icons-round text-[22px] text-text-secondary">{item.icon}</span>
            <span className="flex-1 text-[14px] font-medium text-text-primary">{item.label}</span>
            {item.badge && <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{item.badge}</span>}
            <span className="material-icons-round text-[18px] text-text-tertiary">chevron_right</span>
          </Link>
        ))}
      </div>

      <div className="px-5 mt-4 mb-6">
        <button 
          onClick={handleLogout}
          className="w-full py-3 rounded-xl text-error font-semibold text-[14px] bg-error/5 hover:bg-error/10 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-icons-round text-[18px]">logout</span>
          Log Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
