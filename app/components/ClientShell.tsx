"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import PWAInstallPrompt from "./PWAInstallPrompt";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const errorMsg = event.message || "";
      const isChunkError =
        /loading.*chunk/i.test(errorMsg) ||
        /failed to fetch/i.test(errorMsg) ||
        /dynamically imported module/i.test(errorMsg) ||
        /load failed/i.test(errorMsg);

      if (isChunkError) {
        const lastReload = sessionStorage.getItem("last_chunk_error_reload");
        const now = Date.now();
        // Prevent infinite loops by allowing only 1 reload every 10 seconds
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem("last_chunk_error_reload", now.toString());
          console.warn("Chunk loading error intercepted globally. Reloading page...");
          window.location.reload();
        }
      }
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason || "";
      const reasonStr = typeof reason === "string" ? reason : reason.toString();
      
      const isChunkError =
        /loading.*chunk/i.test(reasonStr) ||
        /failed to fetch/i.test(reasonStr) ||
        /dynamically imported module/i.test(reasonStr) ||
        /load failed/i.test(reasonStr);

      if (isChunkError) {
        const lastReload = sessionStorage.getItem("last_chunk_error_reload");
        const now = Date.now();
        // Prevent infinite loops by allowing only 1 reload every 10 seconds
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem("last_chunk_error_reload", now.toString());
          console.warn("Chunk loading promise rejection intercepted. Reloading page...");
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError, true);
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    return () => {
      window.removeEventListener("error", handleChunkError, true);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, []);

  return isAdmin ? (
    <div className="min-h-dvh bg-surface w-full">{children}</div>
  ) : (
    <div className="app-shell">
      {children}
      <PWAInstallPrompt />
    </div>
  );
}
