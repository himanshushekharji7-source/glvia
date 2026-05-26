"use client";

import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import { useNotifications } from "../lib/hooks";

const typeConfig: Record<string, { icon: string; color: string }> = {
  booking: { icon: "calendar_today", color: "#ec4899" },
  promo: { icon: "local_offer", color: "#8b5cf6" },
  reward: { icon: "star", color: "#f59e0b" },
  reminder: { icon: "alarm", color: "#3b82f6" },
  review: { icon: "rate_review", color: "#10b981" },
  default: { icon: "notifications", color: "#64748b" },
};

export default function NotificationsPage() {
  const { data: notifications, isLoading, isError } = useNotifications();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (notifications) {
      setItems(notifications);
    }
  }, [notifications]);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    // In a real app, you'd call an API here
  };

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-dvh bg-surface-card pb-nav">
      <div className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-xl border-b border-border px-5 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-text-primary">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-semibold text-primary">
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="px-5 pt-4 space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="w-full h-20 bg-border/20 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-error">
           <span className="material-icons-round text-4xl mb-2">error_outline</span>
           <p className="font-bold">Failed to load notifications</p>
        </div>
      ) : (
        <>
          {unreadCount > 0 && (
            <div className="px-5 pt-3 pb-1">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                New ({unreadCount})
              </span>
            </div>
          )}

          <div className="px-5 pt-2 space-y-2 stagger">
            {items.map((n, i) => {
              const config = typeConfig[n.type] || typeConfig.default;
              return (
                <div
                  key={n._id}
                  className={`flex gap-3 p-3.5 rounded-2xl transition-all animate-fadeInUp ${
                    !n.isRead ? "bg-primary/[0.03] border border-primary/10" : "border border-transparent hover:bg-surface-dim"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${config.color}15` }}>
                    <span className="material-icons-round text-[20px]" style={{ color: config.color }}>{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-[13px] truncate ${!n.isRead ? "font-bold text-text-primary" : "font-semibold text-text-primary"}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-[12px] text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-[11px] text-text-tertiary mt-1 block">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
            
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-surface-dim flex items-center justify-center mb-4">
                  <span className="material-icons-round text-[36px] text-text-tertiary">notifications_off</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1">No notifications</h3>
                <p className="text-sm text-text-secondary text-center">We'll notify you about your bookings and offers</p>
              </div>
            )}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
