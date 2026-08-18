import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ReAuthModal from '../components/common/ReAuthModal';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Mail, Phone, Search, Lock, ShieldCheck, KeyRound, X } from 'lucide-react';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, login } = useAuth();

  // New Customer Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    annualRevenue: '5000000'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      setError('Failed to fetch customers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOnboardCustomer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await apiClient.post('/customers', {
        ...formData,
        annualRevenue: Number(formData.annualRevenue)
      });
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          nationalId: '',
          annualRevenue: '5000000'
        });
        fetchCustomers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to onboard customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReAuthenticate = async (targetEmail, password) => {
    await login(targetEmail, password);
    setIsUnlocked(true);
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.national_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#53627C]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">Authenticated Customer Database</h1>
              <p className="text-xs text-[#1E2748]/70">KSBC Corporate Client Records ({customers.length} Accounts Onboarded)</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-2 bg-rose-950 hover:bg-[#E5DFCE] text-amber-300 text-xs font-bold rounded-xl border border-rose-800/60 transition flex items-center space-x-1.5"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Re-Verify Password Clearance</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-[#1E2748] hover:bg-[#141C33] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FFFFFF]/30 transition flex items-center space-x-2 border border-[#1E2748]/20"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Onboard Corporate Client</span>
              </button>
            </div>
          </div>

          {/* Authenticated Security Clearance Banner */}
          <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>🔐 Security Clearance Authenticated: Viewing Encrypted KSBC Corporate Client Ledger ({user?.role?.replace('_', ' ')})</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 font-semibold hidden sm:inline">
              Session JWT Token Validated
            </span>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Retrieving authenticated KSBC corporate customer database..." />
          ) : (
            <div className="glass-panel rounded-2xl border border-[#1E2748]/15 overflow-hidden space-y-4 p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#1E2748]" />
                  <span>Onboarded Corporate Accounts ({filteredCustomers.length} displayed of {customers.length})</span>
                </h3>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#1E2748]/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search client, EIN, or email..."
                    className="w-full glass-input bg-[#1a030b] border border-[#1E2748]/15 text-xs rounded-xl p-2 pl-9 text-white focus:outline-none focus:ring-2 focus:ring-rose-600"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1E2748]/15 text-[#1E2748]/70 uppercase tracking-wider text-[10px] bg-[#FFFFFF]">
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Tax / EIN ID</th>
                      <th className="py-3 px-4">Contact Details</th>
                      <th className="py-3 px-4 text-right">Annual Revenue / Deposits ($)</th>
                      <th className="py-3 px-4 text-center">KYC Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-950/40">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-rose-950/30 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block">{c.first_name} {c.last_name}</span>
                          <span className="text-[10px] text-[#1E2748]/60 font-mono">ID: {c.id.slice(0, 8)}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {isUnlocked ? c.national_id : '••••••••••••'}
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center space-x-1.5 text-slate-300">
                            <Mail className="w-3 h-3 text-[#1E2748]/60" />
                            <span>{c.email}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3 text-[#1E2748]/60" />
                            <span>{c.phone}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Onboarding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-[#1E2748]/15 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2748]/15 mb-4">
              <h3 className="text-base font-bold text-white">Onboard New Corporate Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full glass-input bg-[#1a030b] border border-[#1E2748]/15 rounded-xl p-2.5 text-white"
                  required
                  placeholder="Apex Industrial"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Entity Type / Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full glass-input bg-[#1a030b] border border-[#1E2748]/15 rounded-xl p-2.5 text-white"
                  required
                  placeholder="Corporation"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full glass-input bg-[#1a030b] border border-[#1E2748]/15 rounded-xl p-2.5 text-white"
                  required
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full glass-input bg-[#1a030b] border border-[#1E2748]/15 rounded-xl p-2.5 text-white"
                  required
                  placeholder="+1-555-019-2831"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">National Tax ID / EIN</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full glass-input bg-[#1a030b] border border-[#1E2748]/15 rounded-xl p-2.5 text-white"
                  required
                  placeholder="US-EIN-9920194"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Annual Revenue / Deposits ($)</label>
                <input
                  type="number"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                  className="w-full glass-input bg-[#1a030b] border border-[#1E2748]/15 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#1E2748]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 bg-rose-950 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#FAF7E6] hover:bg-rose-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Onboard Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
export default CustomersPage;
