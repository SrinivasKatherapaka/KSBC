import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ReAuthModal from '../components/common/ReAuthModal';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Mail, Phone, Search, ShieldCheck, KeyRound, User, Building, Store, Landmark, Lock, Wallet, Gem } from 'lucide-react';

export const AccountsPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const { user, login } = useAuth();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      setError('Failed to fetch accounts database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleReAuthenticate = async (targetEmail, password) => {
    await login(targetEmail, password);
    setIsUnlocked(true);
  };

  const privateSavingsCount = customers.filter(c => c.client_category === 'private_savings' || c.client_category === 'private_individual' || !c.client_category).length;
  const hnwiCount = customers.filter(c => c.client_category === 'hnwi').length;
  const corporateCount = customers.filter(c => c.client_category === 'corporate').length;

  const filteredAccounts = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.national_id && c.national_id.toLowerCase().includes(q)) ||
      (c.account_number && c.account_number.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'PRIVATE_SAVINGS') return c.client_category === 'private_savings' || c.client_category === 'private_individual' || !c.client_category;
    if (categoryFilter === 'HNWI') return c.client_category === 'hnwi';
    if (categoryFilter === 'CORPORATE') return c.client_category === 'corporate';
    return true;
  });

  const calcTotalDeposits = (accList) => accList.reduce((sum, a) => sum + Number(a.annual_revenue || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#120207] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">KSBC Accounts Database</h1>
              <p className="text-xs text-rose-300/60">
                Authenticated Master Ledger ({customers.length} Accounts: {privateSavingsCount} Private Savings, {hnwiCount} HNWI & {corporateCount} Corporate)
              </p>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900/60 text-amber-300 text-xs font-bold rounded-xl border border-rose-800/60 transition flex items-center space-x-2"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Re-Verify Password Security Clearance</span>
            </button>
          </div>

          {/* Authenticated Security Clearance Status Banner */}
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 text-emerald-400 font-bold">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <div>
                <span>🔐 Security Clearance Authenticated: Master Accounts Database Unlocked</span>
                <p className="text-[11px] text-slate-300 font-normal">Active Session: {user?.first_name} {user?.last_name} ({user?.role?.replace('_', ' ')})</p>
              </div>
            </div>

            <div className="font-mono text-xs text-right">
              <span className="text-[10px] text-slate-400 block font-sans">TOTAL DEPOSITS IN DATABASE</span>
              <span className="font-extrabold text-emerald-400 text-base">${calcTotalDeposits(customers).toLocaleString()}</span>
            </div>
          </div>

          {/* Category Filter Bar with 4 Distinct Tabs */}
          <div className="glass-panel p-3 rounded-2xl border border-rose-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex space-x-2 font-mono text-xs overflow-x-auto">
              {[
                { id: 'ALL', label: `All Accounts (${customers.length})` },
                { id: 'PRIVATE_SAVINGS', label: `👤 Private Savings (${privateSavingsCount})` },
                { id: 'HNWI', label: `💎 High Net-Worth Individuals (${hnwiCount})` },
                { id: 'CORPORATE', label: `🏢 Corporate Clients (${corporateCount})` }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id)}
                  className={`px-3.5 py-2 rounded-xl font-semibold transition text-xs flex-shrink-0 ${
                    categoryFilter === f.id
                      ? 'bg-rose-800 text-white border border-rose-500/50 shadow-md'
                      : 'bg-rose-950/40 text-slate-400 hover:text-slate-200 border border-rose-900/30'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-rose-400/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search account, name, or SSN/EIN..."
                className="w-full glass-input bg-[#1a030b] border border-rose-900/40 text-xs rounded-xl p-2 pl-9 text-white focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Retrieving authenticated master accounts database..." />
          ) : (
            <div className="glass-panel rounded-2xl border border-rose-900/30 overflow-hidden p-5 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-rose-900/30 text-rose-300/70 uppercase tracking-wider text-[10px] bg-rose-950/60">
                      <th className="py-3 px-4">Account Number</th>
                      <th className="py-3 px-4">Client Name & Category</th>
                      <th className="py-3 px-4">Account Type</th>
                      <th className="py-3 px-4">Tax / SSN / EIN ID</th>
                      <th className="py-3 px-4 text-right">Deposit Balance ($)</th>
                      <th className="py-3 px-4 text-center">KYC Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-950/40">
                    {filteredAccounts.map((c) => {
                      const isHnwi = c.client_category === 'hnwi';
                      const isCorporate = c.client_category === 'corporate';
                      const isPrivateSavings = c.client_category === 'private_savings' || c.client_category === 'private_individual' || !c.client_category;

                      return (
                        <tr key={c.id} className="hover:bg-rose-950/30 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                            {c.account_number || `KSBC-ACC-${c.id.slice(0, 8)}`}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{c.first_name} {c.last_name}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border uppercase mt-1 ${
                              isHnwi
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : isCorporate
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}>
                              {isHnwi ? '💎 High Net-Worth (HNWI)' : isCorporate ? '🏢 Corporate Client' : '👤 Private Savings Account'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-300 font-medium">
                            {c.account_type || (isHnwi ? 'Private High-Net-Worth Reserve' : isCorporate ? 'Corporate Treasury Checking' : 'Private Standard Savings')}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {isUnlocked ? (c.national_id || 'US-SSN-***-**-9918') : '••••••••••••'}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-400">
                            ${Number(c.annual_revenue || 0).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                              c.kyc_status === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : c.kyc_status === 'flagged'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {c.kyc_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Security Re-Authentication Modal */}
      <ReAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        targetEmail={user?.email || 'cfo@banking.com'}
        onAuthenticate={handleReAuthenticate}
      />
    </div>
  );
};
export default AccountsPage;
