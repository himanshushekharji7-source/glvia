"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { 
    href: "/", 
    label: "glvia", 
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 8C14 5.79086 12.2091 4 10 4H7C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H11C13.2091 20 15 18.2091 15 16C15 14.5028 14.1751 13.1979 12.9866 12.5C14.7865 11.9686 16 10.1257 16 8C16 5.79086 14.2091 4 12 4H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="opacity-30" />
      </svg>
    )
  },
  { 
    href: "/at-home", 
    label: "At Home", 
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10L12 3L21 10V21H3V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 16V13C7 11.8954 7.89543 11 9 11H15C16.1046 11 17 11.8954 17 13V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6 16H18C18.5523 16 19 16.4477 19 17V18H5V17C5 16.4477 5.44772 16 6 16Z" fill="currentColor"/>
      </svg>
    )
  },
  { 
    href: "/at-the-salon", 
    label: "At the Salon", 
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 8V11C8 13.2091 9.79086 15 12 15C14.2091 15 16 13.2091 16 11V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 15V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M7 20H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15 8H17C18.1046 8 19 7.10457 19 6C19 4.89543 18.1046 4 17 4H7C5.89543 4 5 4.89543 5 6C5 7.10457 5.89543 8 7 8H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  { 
    href: "/profile", 
    label: "Profile", 
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white/85 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around h-[68px] px-2">
        {tabs.map((tab) => {
          // Determine if tab is active based on exact match for root, or startsWith for others
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 min-w-[70px] px-2 py-2 transition-all duration-200 ${
                isActive ? "text-[#E11D48]" : "text-gray-500"
              }`}
            >
              <div className={`transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                {tab.svg}
              </div>
              <span
                className={`text-[11px] tracking-wide ${
                  isActive ? "font-bold" : "font-medium"
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
