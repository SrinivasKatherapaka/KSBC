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
    loanPortfolio: 55060000,
    customerDeposits: 314980000,
    customerCount: 220,
    loansCount: 54
  });
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const moduleTabs = [
    { label: 'KSBC Overview', path: '/dashboard', icon: TrendingUp },
    { label: 'Accounts Database', path: '/accounts', icon: Wallet },
    { label: 'AI Risk Calculator', path: '/loan-calculator', icon: Calculator },
    { label: 'Loan Defaulters (NPA)', path: '/defaulters', icon: AlertOctagon },
    { label: 'AI Fraud Sentinel', path: '/fraud-detection', icon: ShieldAlert },
    { label: '24/7 AI Support', path: '/customer-service', icon: MessageSquare },
    { label: 'Loans Portfolio', path: '/loans', icon: Landmark },
    { label: 'Customer Ops', path: '/customers', icon: Users },
    { label: 'Compliance & KYC', path: '/compliance', icon: ShieldCheck },
    { label: 'Treasury Reserves', path: '/treasury', icon: Vault },
    { label: 'General Ledger', path: '/finance', icon: BookOpen },
    { label: 'Procurement POs', path: '/procurement', icon: ShoppingBag },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'Advisory Audit', path: '/advisory-history', icon: History }
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
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#1E2748]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 
                  className="text-2xl md:text-3xl font-black text-[#1E2748]"
                  style={{ fontFamily: "'Archivo Black', sans-serif" }}
                >
                  KSBC Executive Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#1E2748] text-[#FAF7E6] uppercase">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#53627C] font-medium">Unified Real-Time KSBC Banking Operations & AI Intelligence Hub</p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/loan-calculator"
                className="px-4 py-2.5 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] text-xs font-archivo font-extrabold rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <Calculator className="w-4 h-4 text-[#FAF7E6]" />
                <span>AI Risk Calculator</span>
              </Link>
            </div>
          </div>

          {/* Quick Module Tabs Bar */}
          <div className="glass-panel p-2 rounded-2xl border border-[#1E2748]/15 overflow-x-auto scrollbar-none bg-[#FFFFFF]">
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
                        ? 'bg-[#1E2748] text-[#FAF7E6] shadow-md font-extrabold'
                        : 'bg-[#FAF7E6] hover:bg-[#F2EDE0] text-[#53627C] border border-[#1E2748]/10'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C59E5F]' : 'text-[#1E2748]'}`} />
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
                  color="navy"
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
                  color="navy"
                  description="Private & Corporate Accounts"
                />
                <StatCard
                  title="Capital Adequacy Ratio"
                  value="18.4%"
                  icon={ShieldCheck}
                  color="gold"
                  description="Basel III Compliant Level"
                />
              </div>

              {/* 💳 KSBC Official Corporate Executive Debit Card Banner */}
              <div className="glass-card p-6 md:p-8 rounded-3xl border border-[#1E2748]/15 bg-gradient-to-br from-[#FFFFFF] via-[#FAF7E6] to-[#FFFFFF] shadow-2xl overflow-hidden relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Card Details */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-[#1E2748] text-[#FAF7E6] rounded-full text-[10px] font-archivo font-extrabold uppercase tracking-wider">
                        ⚡ KSBC Metallic Debit Card
                      </span>
                      <span className="text-xs text-[#53627C] font-mono font-bold">Basel III Vault Cash Access</span>
                    </div>

                    <h2 
                      className="text-xl md:text-2xl font-black text-[#1E2748] leading-tight"
                      style={{ fontFamily: "'Archivo Black', sans-serif" }}
                    >
                      KSBC Corporate Platinum Metallic Debit Card
                    </h2>

                    <p className="text-xs text-[#53627C] leading-relaxed font-medium">
                      Issued directly for executive treasury disbursement, commercial credit clearance, and instant liquidity access across 220 onboarded master bank accounts.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                      <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#1E2748]/15 shadow-sm">
                        <span className="text-[9px] text-[#53627C] block font-sans font-bold">CARD HOLDER</span>
                        <span className="font-bold text-[#1E2748]">KSBC TREASURY</span>
                      </div>

                      <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#1E2748]/15 shadow-sm">
                        <span className="text-[9px] text-[#53627C] block font-sans font-bold">CARD NUMBER</span>
                        <span className="font-bold text-[#1E2748]">4092 •••• 8821</span>
                      </div>

                      <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#1E2748]/15 shadow-sm">
                        <span className="text-[9px] text-[#53627C] block font-sans font-bold">DAILY LIMIT</span>
                        <span className="font-bold text-emerald-700">$10,000,000.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Generated Debit Card Image */}
                  <div className="lg:col-span-5 flex justify-center items-center">
                    <div className="relative group cursor-pointer">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#1E2748] to-[#C59E5F] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                      <img
                        src="/ksbc_debit_card.png"
                        alt="KSBC Bank Commercial Executive Debit Card"
                        className="relative w-full max-w-sm rounded-2xl shadow-2xl border border-[#1E2748]/20 transform group-hover:scale-105 transition duration-500 object-cover"
                      />
                    </div>
                  </div>
                </div>
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
                <div className="glass-card p-6 rounded-2xl border border-[#1E2748]/15 flex flex-col justify-between bg-[#FFFFFF] shadow-xl">
                  <div>
                    <h3 
                      className="text-base font-black text-[#1E2748] mb-1"
                      style={{ fontFamily: "'Archivo Black', sans-serif" }}
                    >
                      Commercial Loan Pipeline
                    </h3>
                    <p className="text-xs text-[#53627C] mb-4 font-medium">Active KSBC applications by status ({loans.length} total)</p>
                    
                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/10 flex justify-between items-center">
                        <span className="text-[#53627C] font-semibold">Applied (Draft)</span>
                        <span className="font-bold text-[#1E2748] font-mono">
                          {loans.filter(l => l.status === 'draft').length} Loans
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/10 flex justify-between items-center">
                        <span className="text-[#53627C] font-semibold">In Process (Compliance / Risk)</span>
                        <span className="font-bold text-[#1E2748] font-mono">
                          {loans.filter(l => l.status === 'underwriting' || l.status === 'compliance_review').length} Loans
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/10 flex justify-between items-center">
                        <span className="text-[#53627C] font-semibold">Approved (Awaiting Payout)</span>
                        <span className="font-bold text-[#1E2748] font-mono">
                          {loans.filter(l => l.status === 'approved').length} Loans
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/10 flex justify-between items-center">
                        <span className="text-[#53627C] font-semibold">Disbursed to Portfolio</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {loans.filter(l => l.status === 'disbursed').length} Loans
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#1E2748]/10">
                    <Link
                      to="/customer-service"
                      className="w-full py-2.5 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] text-xs font-archivo font-extrabold rounded-xl flex items-center justify-center space-x-2 transition shadow-md"
                    >
                      <MessageSquare className="w-4 h-4 text-[#FAF7E6]" />
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

