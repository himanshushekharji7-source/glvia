"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);

    // Auto-reload on chunk loading and fetch network errors to recover instantly
    const errorMsg = error?.message || "";
    const isChunkError =
      /loading.*chunk/i.test(errorMsg) ||
      /failed to fetch/i.test(errorMsg) ||
      /dynamically imported module/i.test(errorMsg) ||
      /load failed/i.test(errorMsg);

    if (isChunkError) {
      const lastReload = sessionStorage.getItem("last_chunk_error_reload");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("last_chunk_error_reload", now.toString());
        console.warn("Chunk loading error detected in error boundary. Auto-recovering...");
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-dvh bg-surface-card flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6">
        <span className="material-icons-round text-5xl text-error">wifi_off</span>
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Page could not load</h2>
      <p className="text-text-secondary text-sm mb-8">
        There was a connection problem or the server is busy. Please try again.
      </p>
      <div className="flex gap-4 w-full max-w-[300px]">
        <button 
          onClick={() => window.history.back()}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-surface-dim text-text-primary hover:bg-border-strong transition-colors"
        >
          Go Back
        </button>
        <button 
          onClick={() => {
            // clear router cache
            window.location.reload();
          }}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-sm btn-primary"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
