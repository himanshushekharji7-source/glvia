"use client";

import { usePathname } from "next/navigation";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return isAdmin ? (
    <div className="min-h-dvh bg-surface w-full">{children}</div>
  ) : (
    <div className="app-shell">{children}</div>
  );
}
