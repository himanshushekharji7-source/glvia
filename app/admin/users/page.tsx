"use client";

import { useAdminUsers } from "../../lib/hooks";

export default function UsersPage() {
  const { data: users, isLoading, isError } = useAdminUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">User Management</h1>
          <p className="text-sm text-text-secondary mt-1">Customer database and booking history.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary">search</span>
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-[14px] text-text-primary outline-none focus:border-primary"
            />
          </div>
          <button className="btn-secondary py-2 px-3 rounded-xl flex items-center justify-center">
            <span className="material-icons-round text-[20px]">filter_list</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-5 md:col-span-1 border border-border">
          <div className="text-[12px] font-bold text-text-tertiary uppercase tracking-wider mb-2">Total Customers</div>
          <div className="text-3xl font-extrabold text-text-primary mb-1">{users?.length || '0'}</div>
          <div className="text-success text-sm font-semibold flex items-center gap-1">
            <span className="material-icons-round text-[16px]">trending_up</span> +12% this month
          </div>
        </div>
        <div className="card p-5 md:col-span-3 border border-border flex flex-col justify-center">
          <div className="text-[12px] font-bold text-text-tertiary uppercase tracking-wider mb-4">Customer Tiers</div>
          <div className="flex items-center h-4 rounded-full overflow-hidden w-full">
            <div className="h-full bg-text-tertiary" style={{ width: "60%" }}></div>
            <div className="h-full bg-zinc-400" style={{ width: "25%" }}></div>
            <div className="h-full bg-amber-400" style={{ width: "10%" }}></div>
            <div className="h-full bg-slate-800" style={{ width: "5%" }}></div>
          </div>
          <div className="flex items-center justify-between mt-3 text-[12px] text-text-secondary font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-text-tertiary"></span> Basic</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-400"></span> Silver</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Gold</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-800"></span> Platinum</span>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden border border-border">
        {isLoading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : isError ? (
          <div className="p-8 text-center text-error">Failed to load users</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dim/50 border-b border-border">
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Bookings</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Wallet</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users?.map((user: any, i: number) => (
                  <tr key={user._id} className="hover:bg-surface-dim/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[12px]">
                          {user.firstName?.charAt(0)}
                        </div>
                        <span className="text-[13px] font-bold text-text-primary">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[13px] text-text-primary">{user.email}</div>
                      <div className="text-[11px] text-text-secondary">{user.phoneNumber}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                        user.role === 'admin' ? 'bg-slate-800 text-white' : 
                        user.role === 'salon_owner' ? 'bg-amber-400/20 text-amber-600' : 'bg-surface-dim text-text-secondary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-medium text-text-primary text-center">0</td>
                    <td className="px-5 py-4 text-[13px] font-bold text-text-primary">${user.walletBalance || '0'}</td>
                    <td className="px-5 py-4 text-[12px] text-text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-text-tertiary hover:text-primary transition-colors">
                        <span className="material-icons-round text-[18px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm">
          <span className="text-text-secondary">Showing {users?.length || 0} customers</span>
        </div>
      </div>
    </div>
  );
}
