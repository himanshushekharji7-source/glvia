"use client";

import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { useWallet } from "../lib/hooks";

export default function WalletPage() {
  const { data: wallet, isLoading, isError } = useWallet();

  return (
    <div className="min-h-dvh bg-surface-card pb-nav">
      <div className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-xl border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-dim">
            <span className="material-icons-round text-[20px]">arrow_back</span>
          </Link>
          <h1 className="text-lg font-bold text-text-primary">Wallet</h1>
        </div>
      </div>

      <div className="px-5 pt-6">
        {/* Wallet Card */}
        <div className="relative rounded-3xl overflow-hidden p-6 text-white shadow-xl" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full -ml-12 -mb-12 blur-2xl" />
          
          <div className="relative z-10">
            <p className="text-sm font-medium text-white/60">Available Balance</p>
            <h2 className="text-4xl font-extrabold mt-1">
              ${isLoading ? '...' : wallet?.balance || '0.00'}
            </h2>
            
            <div className="flex gap-3 mt-8">
              <button className="flex-1 py-3 px-4 rounded-xl bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                <span className="material-icons-round text-[18px]">add_circle</span>
                Add Money
              </button>
              <button className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
                <span className="material-icons-round text-[18px]">history</span>
                History
              </button>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-text-primary mb-4">Recent Transactions</h3>
          
          <div className="space-y-4">
            {isLoading ? (
               [1, 2, 3].map(n => <div key={n} className="w-full h-16 bg-border/20 rounded-2xl animate-pulse" />)
            ) : (wallet?.transactions?.length || 0) > 0 ? (
              wallet?.transactions?.map((tx: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-border">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-success/10' : 'bg-error/10'}`}>
                    <span className={`material-icons-round text-[20px] ${tx.type === 'credit' ? 'text-success' : 'text-error'}`}>
                      {tx.type === 'credit' ? 'south_west' : 'north_east'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-text-primary">{tx.description}</h4>
                    <p className="text-xs text-text-tertiary">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-sm font-bold ${tx.type === 'credit' ? 'text-success' : 'text-text-primary'}`}>
                    {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-text-tertiary">
                <span className="material-icons-round text-4xl mb-2 opacity-20">payments</span>
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
