"use client";

import { useMyBookings } from "../../lib/hooks";

const statusConfig: Record<string, { bg: string; label: string }> = {
  Pending: { bg: "bg-amber-500/10 text-amber-600", label: "Pending" },
  Confirmed: { bg: "bg-emerald-500/10 text-emerald-600", label: "Confirmed" },
  Completed: { bg: "bg-pink-500/10 text-pink-600", label: "Completed" },
  Cancelled: { bg: "bg-rose-500/10 text-rose-600", label: "Cancelled" },
};

export default function AppointmentsPage() {
  const { data: bookings, isLoading, isError } = useMyBookings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Appointments Management</h1>
          <p className="text-sm text-text-secondary mt-1">View and manage all customer appointments.</p>
        </div>
      </div>

      <div className="card overflow-hidden border border-border">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading appointments...</div>
        ) : isError ? (
          <div className="p-8 text-center text-error">Failed to load appointments</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dim/50 border-b border-border">
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Booking ID</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Salon / Provider</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Services</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Date & Time</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings?.map((booking: any) => {
                  const status = statusConfig[booking.status] || statusConfig.Pending;
                  return (
                    <tr key={booking._id} className="hover:bg-surface-dim/30 transition-colors">
                      <td className="px-5 py-4 text-[13px] font-bold text-text-primary">
                        {booking._id.toUpperCase()}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] font-bold text-text-primary">
                          {booking.salonId?.name || "glvia Salon at Home"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-text-secondary">
                        {booking.services?.map((s: any) => s.name).join(", ") || "Beauty Service"}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-text-secondary">
                        {booking.date ? new Date(booking.date).toLocaleDateString() : "Today"} at {booking.startTime || "10:00 AM"}
                      </td>
                      <td className="px-5 py-4 text-[13px] font-extrabold text-text-primary">
                        ₹{booking.totalAmount}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.bg}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {(!bookings || bookings.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-text-tertiary">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
