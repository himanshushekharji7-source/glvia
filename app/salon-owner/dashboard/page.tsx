"use client";

import { useSalonOwnerStats } from "../../lib/hooks";

export default function SalonOwnerDashboard() {
  const { data: stats, isLoading, isError } = useSalonOwnerStats();

  if (isLoading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar / Top Nav for desktop */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <span className="material-icons-round text-white text-2xl">content_cut</span>
            </div>
            <span className="text-xl font-bold text-slate-900 hidden md:block">Salon Manager</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
               <span className="material-icons-round">notifications</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              SO
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening at your salon today.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { label: "Total Bookings", value: stats?.totalBookings || '0', icon: "calendar_month", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Daily Revenue", value: `₹${stats?.dailyRevenue || '0'}`, icon: "payments", color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Active Staff", value: stats?.activeStaff || '0', icon: "badge", color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Cancellations", value: stats?.cancellationRate || '0%', icon: "cancel", color: "text-rose-600", bg: "bg-rose-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <span className="material-icons-round">{stat.icon}</span>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Appointments */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Recent Appointments</h3>
              <button className="text-sm font-bold text-primary">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats?.recentBookings?.map((booking: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                            {booking.userId?.firstName?.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{booking.userId?.firstName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{booking.services?.[0]?.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{booking.timeSlot}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{booking.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions / Staff */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Add Service", icon: "add_circle" },
                  { label: "Manage Staff", icon: "people" },
                  { label: "Offers", icon: "local_offer" },
                  { label: "Settings", icon: "settings" },
                ].map((action, i) => (
                  <button key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors gap-2">
                    <span className="material-icons-round text-slate-600">{action.icon}</span>
                    <span className="text-xs font-bold text-slate-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Earnings Overview</h3>
              <div className="h-[200px] w-full bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <span className="material-icons-round text-4xl mb-2">bar_chart</span>
                <span className="text-sm font-medium">Chart Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
