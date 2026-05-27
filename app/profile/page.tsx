"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import { useUser, useMembershipPlans } from "../lib/hooks";

const menuItems = [
  { icon: "calendar_today", label: "My Bookings", href: "/bookings", badge: "" },
  { icon: "location_on", label: "Manage Addresses", href: "#", badge: "" },
  { icon: "redeem", label: "Refer & Earn", href: "#", badge: "Earn ₹100" },
  { icon: "favorite", label: "Wishlist", href: "/wishlist", badge: "" },
  { icon: "notifications", label: "Notifications", href: "/notifications", badge: "" },
  { icon: "account_balance_wallet", label: "Wallet", href: "/wallet", badge: "" },
  { icon: "support_agent", label: "Help & Support (8004642110)", href: "tel:8004642110", badge: "" },
  { icon: "download_for_offline", label: "Install App", href: "#", badge: "Install Now", isInstall: true },
  { icon: "settings", label: "Settings", href: "#", badge: "" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: membershipPlans, isLoading: isMembershipLoading } = useMembershipPlans();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("glvia_user_profile");
    router.push("/login");
  };

  if (isUserLoading) {
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

  const activeMembership = user?.active_membership_id && membershipPlans 
    ? membershipPlans.find((p: any) => p.id === user.active_membership_id) 
    : null;
  const firstName = user.first_name || user.firstName || "User";
  const lastName = user.last_name || user.lastName || "";
  const initial = firstName.charAt(0) || user.email?.charAt(0) || "U";
  const points = user.loyalty_points || 0;
  const bookings = user.total_bookings || 0;

  return (
    <div className="min-h-dvh bg-surface-card pb-nav">
      <div className="relative">
        <div className="h-[160px]" style={{ background: "var(--gradient-primary)" }}>
          <div className="absolute top-4 right-4">
            <Link href="/profile/edit" className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
              <span className="material-icons-round text-[18px] text-white">edit</span>
            </Link>
          </div>
        </div>
        <div className="px-5 -mt-16 relative z-10">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg shrink-0">
              <div className="w-full h-full rounded-xl gradient-primary flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <div className="relative w-full h-full">
                    <Image src={user.avatar} alt="Avatar" fill className="object-cover" />
                  </div>
                ) : (
                  <span className="text-white text-3xl font-bold uppercase">{initial}</span>
                )}
              </div>
            </div>
            <div className="pb-1.5 flex-1 min-w-0">
              <h1 className="text-xl font-extrabold text-text-primary truncate">{firstName} {lastName}</h1>
              <p className="text-[13px] text-text-secondary truncate">{user.email}</p>
              {user.phone_number && (
                <p className="text-[12px] text-text-tertiary mt-0.5">{user.phone_number}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: bookings, label: "Bookings" },
            { value: "4.9", label: "Rating" },
            { value: points, label: "Points" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-2xl bg-surface-dim">
              <div className="text-lg font-extrabold text-text-primary">{s.value}</div>
              <div className="text-[11px] text-text-secondary font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Membership Section */}
      <div className="px-5 mt-5">
        <Link href="/profile/membership" className="block relative rounded-2xl overflow-hidden p-4 shadow-sm active:scale-[0.98] transition-transform" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Active Membership</div>
              {isMembershipLoading ? (
                 <div className="h-6 w-32 bg-white/20 rounded animate-pulse mt-1"></div>
              ) : activeMembership ? (
                <>
                  <div className="text-white text-xl font-bold mt-1">{activeMembership.name}</div>
                  <div className="text-white/80 text-[12px] mt-0.5 font-medium">{activeMembership.discount || "Enjoy exclusive benefits"}</div>
                </>
              ) : (
                <>
                  <div className="text-white text-xl font-bold mt-1">No Membership</div>
                  <div className="text-white/90 text-[12px] mt-0.5 underline">Explore Plans</div>
                </>
              )}
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
              <span className="material-icons-round text-[28px] text-white">workspace_premium</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="px-5 mt-6 space-y-1">
        {menuItems.map((item) => {
          const handleClick = (e: React.MouseEvent) => {
            if (item.isInstall) {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
            }
          };

          return (
            <Link 
              key={item.label} 
              href={item.href} 
              onClick={handleClick}
              className="flex items-center gap-3.5 py-3.5 px-1 rounded-xl hover:bg-surface-dim transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                 <span className="material-icons-round text-[18px] text-primary">{item.icon}</span>
              </div>
              <span className="flex-1 text-[14px] font-medium text-text-primary">{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  item.isInstall 
                    ? "bg-purple-100 text-purple-600" 
                    : "bg-pink-100 text-pink-600"
                }`}>
                  {item.badge}
                </span>
              )}
              <span className="material-icons-round text-[18px] text-text-tertiary group-hover:text-primary transition-colors">chevron_right</span>
            </Link>
          );
        })}
      </div>

      <div className="px-5 mt-6 mb-6">
        <button 
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl text-error font-bold text-[14px] bg-error/5 hover:bg-error/10 border border-error/10 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-icons-round text-[18px]">logout</span>
          Log Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
