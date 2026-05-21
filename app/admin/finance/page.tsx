"use client";

const transactions = [
  { id: "TRX-8921", date: "Today, 10:45 AM", customer: "Sarah Johnson", service: "Balayage & Tone", amount: "$180.00", status: "Completed" },
  { id: "TRX-8920", date: "Today, 09:30 AM", customer: "Michael Chen", service: "Precision Cut", amount: "$75.00", status: "Completed" },
  { id: "TRX-8919", date: "Yesterday, 4:15 PM", customer: "Emma Davis", service: "Gel Manicure", amount: "$45.00", status: "Completed" },
  { id: "TRX-8918", date: "Yesterday, 2:00 PM", customer: "James Wilson", service: "Deep Tissue Massage", amount: "$120.00", status: "Refunded" },
  { id: "TRX-8917", date: "May 10, 11:00 AM", customer: "Olivia Martinez", service: "Hydra Facial", amount: "$150.00", status: "Completed" },
];

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Finance & Payouts</h1>
          <p className="text-sm text-text-secondary mt-1">Track your earnings, payouts, and taxes.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary py-2.5 px-4 text-sm">Download CSV</button>
          <button className="btn-primary py-2.5 px-4 text-sm">Request Payout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 gradient-primary text-white">
          <div className="text-white/80 text-[13px] font-semibold uppercase tracking-wider mb-2">Available for Payout</div>
          <div className="text-4xl font-extrabold mb-1">$4,250.00</div>
          <div className="text-white/80 text-sm">Next scheduled payout: Friday</div>
        </div>
        
        <div className="card p-6">
          <div className="text-text-tertiary text-[13px] font-semibold uppercase tracking-wider mb-2">Total Earnings (YTD)</div>
          <div className="text-3xl font-extrabold text-text-primary mb-1">$142,850.50</div>
          <div className="text-success text-sm font-semibold flex items-center gap-1">
            <span className="material-icons-round text-[16px]">trending_up</span> +24% vs last year
          </div>
        </div>
        
        <div className="card p-6">
          <div className="text-text-tertiary text-[13px] font-semibold uppercase tracking-wider mb-2">Pending Clearance</div>
          <div className="text-3xl font-extrabold text-text-primary mb-1">$840.00</div>
          <div className="text-text-secondary text-sm">From 7 recent transactions</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">Recent Transactions</h2>
          <div className="flex gap-2">
            <select className="bg-surface-dim border-none text-sm text-text-secondary rounded-lg px-3 py-1.5 outline-none">
              <option>All Statuses</option>
              <option>Completed</option>
              <option>Refunded</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-dim/50 border-b border-border">
                <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Transaction ID</th>
                <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Service</th>
                <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((trx, i) => (
                <tr key={trx.id} className="hover:bg-surface-dim/30 transition-colors">
                  <td className="px-5 py-4 text-[13px] font-medium text-text-primary">{trx.id}</td>
                  <td className="px-5 py-4 text-[13px] text-text-secondary">{trx.date}</td>
                  <td className="px-5 py-4 text-[13px] font-medium text-text-primary">{trx.customer}</td>
                  <td className="px-5 py-4 text-[13px] text-text-secondary">{trx.service}</td>
                  <td className="px-5 py-4 text-[14px] font-bold text-text-primary">{trx.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      trx.status === "Completed" ? "bg-success/10 text-success" : "bg-text-tertiary/20 text-text-secondary"
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm">
          <span className="text-text-secondary">Showing 1-5 of 248 transactions</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-surface-dim disabled:opacity-50" disabled>
              <span className="material-icons-round text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-surface-dim">
              <span className="material-icons-round text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
