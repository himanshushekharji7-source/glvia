"use client";

const campaigns = [
  { id: 1, name: "Summer Glow 2026", code: "SUMMERGLOW20", status: "Active", uses: 342, revenue: "$12,450", roi: "+245%", endDate: "Aug 31, 2026" },
  { id: 2, name: "Welcome Offer", code: "WELCOME50", status: "Active", uses: 890, revenue: "$24,100", roi: "+180%", endDate: "Ongoing" },
  { id: 3, name: "Mother's Day Special", code: "MOMSPA", status: "Ended", uses: 156, revenue: "$8,900", roi: "+310%", endDate: "May 12, 2026" },
];

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Campaign Performance</h1>
          <p className="text-sm text-text-secondary mt-1">Track marketing ROI and manage promo codes.</p>
        </div>
        <button className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <span className="material-icons-round text-[18px]">campaign</span>
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="text-text-tertiary text-[13px] font-semibold uppercase tracking-wider mb-2">Total Attributed Revenue</div>
          <div className="text-3xl font-extrabold text-text-primary mb-1">$45,450.00</div>
          <div className="text-success text-sm font-semibold flex items-center gap-1">
            <span className="material-icons-round text-[16px]">trending_up</span> 18% of total revenue
          </div>
        </div>
        
        <div className="card p-6">
          <div className="text-text-tertiary text-[13px] font-semibold uppercase tracking-wider mb-2">Active Promo Codes</div>
          <div className="text-3xl font-extrabold text-text-primary mb-1">12</div>
          <div className="text-text-secondary text-sm">across 4 active campaigns</div>
        </div>
        
        <div className="card p-6 bg-surface-dim">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white">
              <span className="material-icons-round text-[20px]">tips_and_updates</span>
            </div>
            <h3 className="font-bold text-text-primary">Optimization Tip</h3>
          </div>
          <p className="text-sm text-text-secondary">Your "Welcome Offer" is driving 60% of new customer acquisition. Consider increasing its visibility on social media.</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-text-primary mt-8 mb-4">All Campaigns</h2>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {campaigns.map((campaign, i) => (
          <div key={campaign.id} className="card overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-start">
              <div>
                <h3 className="font-bold text-text-primary text-lg">{campaign.name}</h3>
                <div className="inline-block bg-surface-dim px-2 py-1 rounded border border-border border-dashed font-mono text-xs text-text-secondary mt-2">
                  CODE: {campaign.code}
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                campaign.status === "Active" ? "bg-success/10 text-success" : "bg-text-tertiary/20 text-text-secondary"
              }`}>
                {campaign.status}
              </span>
            </div>
            
            <div className="p-5 grid grid-cols-2 gap-4 flex-1">
              <div>
                <div className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider mb-1">Total Uses</div>
                <div className="font-bold text-text-primary">{campaign.uses}</div>
              </div>
              <div>
                <div className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider mb-1">Revenue</div>
                <div className="font-bold text-text-primary">{campaign.revenue}</div>
              </div>
              <div>
                <div className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider mb-1">ROI</div>
                <div className="font-bold text-success">{campaign.roi}</div>
              </div>
              <div>
                <div className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider mb-1">Ends</div>
                <div className="font-bold text-text-secondary text-sm">{campaign.endDate}</div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border flex justify-between items-center bg-surface-dim/30">
              <button className="text-sm font-semibold text-primary hover:underline">View Analytics</button>
              <button className="text-text-tertiary hover:text-text-primary transition-colors">
                <span className="material-icons-round text-[20px]">more_vert</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
