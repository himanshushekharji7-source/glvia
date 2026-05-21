"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/search", icon: "search", label: "Search" },
  { href: "/bookings", icon: "calendar_today", label: "Bookings" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 glass-strong"
      style={{
        borderTop: "1px solid rgba(243, 244, 246, 0.8)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-200"
            >
              <span
                className={`material-icons-round text-[22px] transition-all duration-200 ${
                  isActive
                    ? "gradient-text !text-[22px]"
                    : "text-text-tertiary"
                }`}
                style={
                  isActive
                    ? {
                        background: "var(--gradient-primary)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }
                    : {}
                }
              >
                {isActive ? tab.icon : tab.icon + (tab.icon === "home" ? "" : "")}
              </span>
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  isActive ? "text-primary" : "text-text-tertiary"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
