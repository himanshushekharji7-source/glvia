"use client";

import Link from "next/link";
import { useAdminStats } from "../lib/hooks";

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-6 bg-error/10 text-error rounded-xl">
        <h3 className="font-bold">Error loading dashboard</h3>
        <p className="text-sm mt-1">Please ensure the backend server is running and you are logged in as an Admin.</p>
      </div>
    );
  }

  const kpiData = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, trend: "+12.5%", positive: true, icon: "account_balance_wallet", color: "#ec4899" },
    { label: "Total Bookings", value: stats.totalBookings.toLocaleString(), trend: "+8.2%", positive: true, icon: "event_available", color: "#8b5cf6" },
    { label: "Active Salons", value: stats.activeSalons.toString(), trend: "+3", positive: true, icon: "storefront", color: "#10b981" },
    { label: "Total Customers", value: stats.totalUsers.toLocaleString(), trend: "+15.4%", positive: true, icon: "group", color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Dashboard Overview</h1>
          <p className="text-sm text-text-secondary mt-1">Here's what's happening across your platform today.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary py-2.5 px-4 text-sm flex items-center gap-2">
            <span className="material-icons-round text-[16px]">file_download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <div key={i} className="card p-5 animate-fadeInUp" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                <span className="material-icons-round text-[24px]" style={{ color: kpi.color }}>{kpi.icon}</span>
              </div>
              <span className={`text-[12px] font-bold px-2 py-1 rounded-md ${kpi.positive ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                {kpi.trend}
              </span>
            </div>
            <div className="text-[13px] text-text-secondary font-medium uppercase tracking-wider mb-1">{kpi.label}</div>
            <div className="text-2xl font-extrabold text-text-primary">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Mockup */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-text-primary">Revenue Analytics</h2>
            <select className="bg-surface-dim border-none text-sm text-text-secondary rounded-lg px-3 py-1.5 outline-none">
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end gap-2 sm:gap-4 pt-4 border-b border-border relative">
            {/* Grid lines */}
            <div className="absolute top-0 left-0 w-full border-t border-border border-dashed"></div>
            <div className="absolute top-1/4 left-0 w-full border-t border-border border-dashed"></div>
            <div className="absolute top-2/4 left-0 w-full border-t border-border border-dashed"></div>
            <div className="absolute top-3/4 left-0 w-full border-t border-border border-dashed"></div>
            
            {/* Bars */}
            {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group z-10 h-full pb-4">
                <div 
                  className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80 relative"
                  style={{ height: `${height}%`, background: "var(--gradient-primary)" }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-card shadow-lg text-[10px] font-bold px-2 py-1 rounded transition-opacity whitespace-nowrap">
                    ₹{(height * 120).toFixed(0)}
                  </div>
                </div>
                <div className="text-[10px] text-text-tertiary text-center mt-2 font-medium">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Salons */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-text-primary">Top Salons</h2>
            <Link href="/admin/users" className="text-sm font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {stats.topSalons.length > 0 ? stats.topSalons.map((salon: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-text-tertiary font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-semibold text-text-primary truncate">{salon.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] text-text-secondary">{salon.bookings} bookings</span>
                    <span className="text-[10px] text-text-tertiary">•</span>
                    <span className="text-[12px] text-amber-500 flex items-center">
                      <span className="material-icons-round text-[12px] mr-0.5">star</span>{salon.rating}
                    </span>
                  </div>
                </div>
                <div className="text-[14px] font-bold text-text-primary">₹{salon.revenue.toLocaleString()}</div>
              </div>
            )) : (
              <div className="text-sm text-text-tertiary text-center py-4">No salon data available yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
