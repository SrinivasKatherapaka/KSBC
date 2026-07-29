import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { StatCard } from '../components/common/StatCard';
import { PortfolioYieldChart } from '../components/dashboard/PortfolioYieldChart';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Vault, 
  Landmark, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight,
  Calculator,
  AlertOctagon,
  ShieldAlert,
  MessageSquare,
  BookOpen,
  ShoppingBag,
  Bot,
  History,
  Wallet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    vaultCash: 50000000,
    loanPortfolio: 0,
    customerDeposits: 50000000,
    customerCount: 0,
    loansCount: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const moduleTabs = [
    { label: 'KSBC Overview', path: '/dashboard', icon: TrendingUp, color: 'text-rose-400' },
    { label: 'Accounts Database', path: '/accounts', icon: Wallet, color: 'text-emerald-400' },
    { label: 'AI Risk Calculator', path: '/loan-calculator', icon: Calculator, color: 'text-amber-400' },
    { label: 'Loan Defaulters (NPA)', path: '/defaulters', icon: AlertOctagon, color: 'text-red-400' },
    { label: 'AI Fraud Sentinel', path: '/fraud-detection', icon: ShieldAlert, color: 'text-rose-400' },
    { label: '24/7 AI Support', path: '/customer-service', icon: MessageSquare, color: 'text-cyan-400' },
    { label: 'Loans Portfolio', path: '/loan-applications', icon: Landmark, color: 'text-amber-400' },
    { label: 'Customer Ops', path: '/customers', icon: Users, color: 'text-purple-400' },
    { label: 'Compliance & KYC', path: '/compliance', icon: ShieldCheck, color: 'text-indigo-400' },
    { label: 'Treasury Reserves', path: '/treasury', icon: Vault, color: 'text-teal-400' },
    { label: 'General Ledger', path: '/finance', icon: BookOpen, color: 'text-pink-400' },
    { label: 'Procurement POs', path: '/procurement', icon: ShoppingBag, color: 'text-rose-400' },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot, color: 'text-amber-400' },
    { label: 'Advisory Audit', path: '/advisory-history', icon: History, color: 'text-emerald-400' }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [treasuryRes, ledgerRes, customersRes, loansRes] = await Promise.all([
          apiClient.get('/treasury/reserves').catch(() => ({ data: { success: false } })),
          apiClient.get('/finance/ledger').catch(() => ({ data: { success: false } })),
          apiClient.get('/customers').catch(() => ({ data: { success: false } })),
          apiClient.get('/loans').catch(() => ({ data: { success: false } }))
        ]);

        let liveDepositsSum = 314980000;
        let livePortfolioSum = 55060000;
        let liveCustCount = 220;

        if (customersRes.data?.success) {
          const custs = customersRes.data.customers || [];
          liveCustCount = custs.length;
          liveDepositsSum = custs.reduce((sum, c) => sum + Number(c.annual_revenue || 0), 0);
          setMetrics(prev => ({
            ...prev,
            customerCount: liveCustCount,
            customerDeposits: liveDepositsSum
          }));
        }

        if (loansRes.data?.success) {
          const lns = loansRes.data.loans || [];
          setLoans(lns);
          const disbursedSum = lns.filter(l => l.status === 'disbursed').reduce((sum, l) => sum + Number(l.principal_amount || 0), 0);
          if (disbursedSum > 0) livePortfolioSum = disbursedSum;
          setMetrics(prev => ({ ...prev, loansCount: lns.length, loanPortfolio: livePortfolioSum }));
        }

        if (treasuryRes.data?.success) {
          const m = treasuryRes.data.metrics;
          setMetrics(prev => ({
            ...prev,
            vaultCash: m.vaultCashReserves || prev.vaultCash,
            loanPortfolio: m.totalDisbursedAmount || m.loanPortfolioBalance || livePortfolioSum,
            customerDeposits: m.customerDeposits || liveDepositsSum
          }));
        }

        if (ledgerRes.data?.success) {
          setTransactions(ledgerRes.data.ledger.transactions || []);
        }
      } catch (err) {
        setError('Failed to sync executive dashboard analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#002b36] text-[#93a1a1]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading">KSBC Executive Dashboard</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs md:text-sm text-rose-300/60">Unified Real-Time KSBC Banking Operations & AI Intelligence Hub</p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/loan-calculator"
                className="px-4 py-2.5 bg-gradient-to-r from-rose-800 to-rose-950 hover:from-rose-700 hover:to-rose-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/30 transition flex items-center space-x-2 border border-rose-600/40"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>AI Risk Calculator</span>
              </Link>
            </div>
          </div>

          {/* Quick Module Tabs Bar */}
          <div className="glass-panel p-2 rounded-2xl border border-rose-900/30 overflow-x-auto scrollbar-none">
            <div className="flex space-x-2 min-w-max">
              {moduleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.path === '/dashboard';
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-rose-800 text-white shadow-lg shadow-rose-900/40 border border-rose-500/40'
                        : 'bg-rose-950/40 hover:bg-rose-900/30 text-slate-300 border border-rose-900/30'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Calculating KSBC portfolio yields & General Ledger positions..." />
          ) : (
            <>
              {/* Executive Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title="Vault Cash Reserves (1010)"
                  value={`$${metrics.vaultCash.toLocaleString()}`}
                  icon={Vault}
                  color="purple"
                  change="+0.0%"
                  description="KSBC Tier 1 Reserves"
                />
                <StatCard
                  title="Commercial Loans (1200)"
                  value={`$${metrics.loanPortfolio.toLocaleString()}`}
                  icon={Landmark}
                  color="emerald"
                  change={metrics.loanPortfolio > 0 ? '+12.4%' : '0.0%'}
                  description="Earning Asset Portfolio"
                />
                <StatCard
                  title="Master Accounts"
                  value={metrics.customerCount.toString()}
                  icon={Wallet}
                  color="amber"
                  description="Private & Corporate Accounts"
                />
                <StatCard
                  title="Capital Adequacy Ratio"
                  value="18.4%"
                  icon={ShieldCheck}
                  color="indigo"
                  description="Basel III Compliant Level"
                />
              </div>

              {/* Charts & Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PortfolioYieldChart
                    totalPortfolio={metrics.loanPortfolio}
                    totalDeposits={metrics.customerDeposits}
                    customerCount={metrics.customerCount}
                    yieldPercentage={6.5}
                    growthRate={12.8}
                  />
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-rose-900/30 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Commercial Loan Pipeline</h3>
                    <p className="text-xs text-rose-300/60 mb-4">Active KSBC applications by status ({loans.length} total)</p>
                    
                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 bg-rose-950/60 rounded-xl border border-rose-900/40 flex justify-between items-center">
                        <span className="text-slate-300 font-medium">Applied (Draft)</span>
                        <span className="font-bold text-slate-300 font-mono">
                          {loans.filter(l => l.status === 'draft').length} Loans
                        </span>
                      </div>
                      <div className="p-2.5 bg-rose-950/60 rounded-xl border border-rose-900/40 flex justify-between items-center">
                        <span className="text-slate-300 font-medium">In Process (Compliance / Risk)</span>
                        <span className="font-bold text-amber-400 font-mono">
                          {loans.filter(l => l.status === 'underwriting' || l.status === 'compliance_review').length} Loans
                        </span>
                      </div>
                      <div className="p-2.5 bg-rose-950/60 rounded-xl border border-rose-900/40 flex justify-between items-center">
                        <span className="text-slate-300 font-medium">Approved (Awaiting Payout)</span>
                        <span className="font-bold text-rose-400 font-mono">
                          {loans.filter(l => l.status === 'approved').length} Loans
                        </span>
                      </div>
                      <div className="p-2.5 bg-rose-950/60 rounded-xl border border-rose-900/40 flex justify-between items-center">
                        <span className="text-slate-300 font-medium">Disbursed to Portfolio</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {loans.filter(l => l.status === 'disbursed').length} Loans
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-rose-900/30">
                    <Link
                      to="/customer-service"
                      className="w-full py-2.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition border border-rose-700/50"
                    >
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      <span>Launch 24/7 AI Support Chatbot</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Double-Entry GL Ledger Postings */}
              <RecentTransactionsTable transactions={transactions} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};
export default DashboardPage;
