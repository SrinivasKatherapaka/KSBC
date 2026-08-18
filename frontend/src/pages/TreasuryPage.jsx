import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { Vault, Landmark, DollarSign, ShieldCheck, PieChart } from 'lucide-react';

export const TreasuryPage = () => {
  const [metrics, setMetrics] = useState({
    vaultCashReserves: 50000000,
    loanPortfolioBalance: 0,
    customerDeposits: 50000000,
    totalDisbursedAmount: 0,
    totalDisbursedLoansCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTreasury = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/treasury/reserves');
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (err) {
        setError('Failed to fetch treasury metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchTreasury();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#1E2748] text-[#53627C]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-heading">Treasury & Capital Management</h1>
            <p className="text-xs text-slate-400">Vault Cash Reserves, Liquidity Ratios & Payout Authorization</p>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Retrieving vault cash reserves & Basel III ratios..." />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title="Vault Cash Reserves"
                  value={`$${metrics.vaultCashReserves.toLocaleString()}`}
                  icon={Vault}
                  color="blue"
                  description="GL Account 1010"
                />
                <StatCard
                  title="Loan Earning Portfolio"
                  value={`$${metrics.loanPortfolioBalance.toLocaleString()}`}
                  icon={Landmark}
                  color="emerald"
                  description="GL Account 1200"
                />
                <StatCard
                  title="Disbursed Loans"
                  value={metrics.totalDisbursedLoansCount.toString()}
                  icon={DollarSign}
                  color="purple"
                  description="Active Commercial Outlays"
                />
                <StatCard
                  title="Capital Adequacy Ratio"
                  value="18.4%"
                  icon={ShieldCheck}
                  color="indigo"
                  description="Regulatory Liquidity Floor"
                />
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  <span>Treasury Reserve Allocation Breakdown</span>
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-sans">Vault & Central Bank Liquid Reserves</span>
                      <span className="text-blue-400 font-bold">
                        {((metrics.vaultCashReserves / (metrics.vaultCashReserves + metrics.loanPortfolioBalance)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${((metrics.vaultCashReserves / (metrics.vaultCashReserves + metrics.loanPortfolioBalance)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 font-sans">Commercial Earning Loans Asset Ratio</span>
                      <span className="text-emerald-400 font-bold">
                        {((metrics.loanPortfolioBalance / (metrics.vaultCashReserves + metrics.loanPortfolioBalance)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${((metrics.loanPortfolioBalance / (metrics.vaultCashReserves + metrics.loanPortfolioBalance)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
export default TreasuryPage;
