"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "../../lib/adminAuth";

const adminNav = [
  { icon: "dashboard", label: "Dashboard", href: "/admin" },
  { icon: "perm_media", label: "Media Library", href: "/admin/media" },
  { icon: "home", label: "Home Content", href: "/admin/home-content" },
  { icon: "delivery_dining", label: "At Home Content", href: "/admin/at-home-content" },
  { icon: "storefront", label: "Salons", href: "/admin/salons" },
  { icon: "category", label: "Categories", href: "/admin/categories" },
  { icon: "card_membership", label: "Membership", href: "/admin/membership" },
  { icon: "featured_seasonal_and_gifts", label: "Banners & Trust", href: "/admin/banners" },
  { icon: "settings", label: "Site Settings", href: "/admin/site-settings" },
  { icon: "event_note", label: "Appointments", href: "/admin/appointments" },
  { icon: "group", label: "Users", href: "/admin/users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  return (
    <aside className="w-64 min-h-dvh bg-surface-card border-r border-border hidden lg:flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center mr-3">
          <span className="material-icons-round text-white text-[18px]">auto_awesome</span>
        </div>
        <span className="font-extrabold text-lg text-text-primary tracking-tight">glvia Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3 px-2">Menu</div>
        {adminNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-primary/[0.08] text-primary font-semibold"
                  : "text-text-secondary hover:bg-surface-dim hover:text-text-primary font-medium"
              }`}
            >
              <span className={`material-icons-round text-[20px] ${isActive ? "text-primary" : "text-text-tertiary"}`}>
                {item.icon}
              </span>
              <span className="text-[14px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {admin?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-text-primary truncate">{admin?.name || "Admin"}</div>
            <div className="text-[12px] text-text-tertiary truncate">{admin?.role || "super_admin"}</div>
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors group"
            title="Logout"
          >
            <span className="material-icons-round text-[18px] text-text-tertiary group-hover:text-red-500">
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
