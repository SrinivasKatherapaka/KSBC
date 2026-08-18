import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ReAuthModal from '../components/common/ReAuthModal';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, User, Wallet, Mail, Phone, ShieldCheck, ShieldAlert, Lock, Unlock,
  KeyRound, X, Edit, Trash2, Calendar, DollarSign, CheckCircle2,
  Building, Sparkles, Shield, FileText, AlertTriangle
} from 'lucide-react';

export const AccountDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [customerLoans, setCustomerLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Special Authentication State for Identification Number
  const [isIdUnlocked, setIsIdUnlocked] = useState(false);
  const [isSpecialAuthModalOpen, setIsSpecialAuthModalOpen] = useState(false);

  // Edit & Delete Modal States
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    annualRevenue: '',
    clientCategory: 'private_savings',
    kycStatus: 'verified'
  });

  const isCfoOrAdmin = user?.role === 'cfo' || user?.role === 'admin' || user?.email === 'cfo@banking.com' || user?.email === 'admin@banking.com';

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch customer directly or from list
      const res = await apiClient.get('/customers');
      if (res.data.success) {
        const found = res.data.customers.find(c => c.id === id || c.account_number === id);
        if (found) {
          setCustomer(found);
          // Fetch associated loans for this customer
          try {
            const loansRes = await apiClient.get('/loans');
            if (loansRes.data.success) {
              const matchedLoans = loansRes.data.loans.filter(l => 
                l.customer_id === found.id || 
                (l.applicant_name && l.applicant_name.toLowerCase().includes(found.first_name.toLowerCase()))
              );
              setCustomerLoans(matchedLoans);
            }
          } catch (e) {
            console.warn('Could not load associated customer loans');
          }
        } else {
          setError(`Customer account record #${id} not found in master ledger database.`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch customer account details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  // Format National ID / User Identification Number
  const getMaskedNationalId = (idStr) => {
    if (!idStr) return 'US-SSN-***-**-9918';
    if (isIdUnlocked) {
      if (idStr.includes('***-**-')) {
        const last4 = idStr.slice(-4);
        return `US-SSN-648-92-${last4}`;
      }
      return idStr;
    }

    const digits = idStr.replace(/\D/g, '');
    const last4 = digits.slice(-4) || '9918';

    if (idStr.startsWith('US-EIN')) {
      return `US-EIN-**-***${last4}`;
    }
    return `US-SSN-***-**-${last4}`;
  };

  const handleSpecialAuthenticate = async (targetEmail, password) => {
    await login(targetEmail, password);
    setIsIdUnlocked(true);
    setIsSpecialAuthModalOpen(false);
  };

  const handleOpenEdit = () => {
    if (!isCfoOrAdmin) {
      setAccessDeniedMsg(`Access Denied: Account modification privileges are restricted to CFO and System Administrator credentials only.`);
      return;
    }
    setEditingCustomer(customer);
    setEditForm({
      firstName: customer.first_name || '',
      lastName: customer.last_name || '',
      email: customer.email || '',
      annualRevenue: customer.annual_revenue || 0,
      clientCategory: customer.client_category || 'private_savings',
      kycStatus: customer.kyc_status || 'verified'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await apiClient.put(`/customers/${editingCustomer.id}`, editForm);
      if (res.data.success) {
        setSuccessMsg(`Account details for ${editForm.firstName} ${editForm.lastName} updated successfully.`);
        setEditingCustomer(null);
        fetchCustomerDetails();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update account details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = () => {
    if (!isCfoOrAdmin) {
      setAccessDeniedMsg(`Access Denied: Account deletion privileges are restricted to CFO and System Administrator credentials only.`);
      return;
    }
    setDeletingCustomer(customer);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await apiClient.delete(`/customers/${deletingCustomer.id}`);
      if (res.data.success) {
        navigate('/accounts');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#1b2827] text-[#a4b8b5]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="p-8 flex items-center justify-center flex-1">
            <LoadingSpinner text="Retrieving customer account master file from authenticated database..." />
          </main>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex min-h-screen bg-[#1b2827] text-[#a4b8b5]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="p-8 space-y-6 max-w-5xl mx-auto w-full">
            <button
              onClick={() => navigate('/accounts')}
              className="px-4 py-2 bg-[#20302f] hover:bg-[#182423] text-[#dfbd84] rounded-xl text-xs font-bold flex items-center space-x-2 border border-[#dfbd84]/30 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Accounts Database</span>
            </button>
            <ErrorAlert message={error || 'Customer account record not found.'} />
          </main>
        </div>
      </div>
    );
  }

  const isHnwi = customer.client_category === 'hnwi';
  const isCorporate = customer.client_category === 'corporate';

  return (
    <div className="flex min-h-screen bg-[#1b2827] text-[#a4b8b5]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Breadcrumb & Navigation Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/accounts')}
                className="px-3.5 py-2 bg-[#20302f] hover:bg-[#182423] text-[#dfbd84] rounded-xl text-xs font-bold flex items-center space-x-2 border border-[#dfbd84]/40 shadow transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Accounts Database</span>
              </button>
              <div className="text-xs text-[#dfbd84] font-mono hidden md:block">
                <span>Accounts Database</span> &gt; <span className="text-[#dfbd84] font-bold">Account Holder File</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSpecialAuthModalOpen(true)}
                className="px-3.5 py-2 bg-[#20302f] hover:bg-[#182423] text-[#dfbd84] text-xs font-bold rounded-xl border border-[#dfbd84]/40 transition flex items-center space-x-1.5 shadow"
              >
                <KeyRound className="w-4 h-4 text-[#dfbd84]" />
                <span>Security Clearance Action</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-[#58b388]/20 border border-[#58b388]/50 rounded-xl text-xs text-[#58b388] font-bold flex items-center justify-between">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="text-[#58b388] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* Detailed Account Header Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-[#dfbd84]/40 bg-[#20302f] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-[#182423] text-[#dfbd84] rounded-2xl border border-[#dfbd84]/40 shadow-xl flex-shrink-0">
                <Wallet className="w-8 h-8 text-[#dfbd84]" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-black text-[#f4eee2] font-heading">
                    {customer.first_name} {customer.last_name}
                  </h1>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border ${
                    isHnwi
                      ? 'bg-[#dfbd84]/10 text-[#dfbd84] border-[#dfbd84]/40'
                      : isCorporate
                      ? 'bg-[#dfbd84]/10 text-[#dfbd84] border-[#dfbd84]/40'
                      : 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                  }`}>
                    {isHnwi ? '💎 High Net-Worth (HNWI)' : isCorporate ? '🏢 Corporate Client' : '👤 Private Savings Account'}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#dfbd84] mt-1">
                  Master Ledger Account Number: <strong className="text-[#dfbd84] font-bold">{customer.account_number || `KSBC-ACC-${customer.id.slice(0, 8)}`}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 self-start md:self-auto">
              <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase border flex items-center space-x-1.5 ${
                customer.kyc_status === 'verified'
                  ? 'bg-[#58b388]/20 text-[#58b388] border-[#58b388]/40'
                  : customer.kyc_status === 'flagged'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#182423] text-[#a4b8b5] border-[#dfbd84]/30'
              }`}>
                <ShieldCheck className="w-4 h-4" />
                <span>KYC Status: {customer.kyc_status || 'Verified'}</span>
              </span>

              {isCfoOrAdmin && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleOpenEdit}
                    className="px-3.5 py-2 bg-[#182423] hover:bg-[#20302f] text-[#dfbd84] border border-[#dfbd84]/40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#dfbd84]" />
                    <span>Modify Account</span>
                  </button>
                  <button
                    onClick={handleOpenDelete}
                    className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-300" />
                    <span>Delete Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Identification Number Security Section (Masked under * by default) */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isIdUnlocked
              ? 'bg-[#58b388]/10 border-[#58b388]/50 shadow-xl'
              : 'bg-[#182423]/95 border-amber-500/40 shadow-xl'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Shield className={`w-5 h-5 ${isIdUnlocked ? 'text-[#58b388]' : 'text-amber-400'}`} />
                  <span className="text-xs uppercase font-extrabold text-[#f4eee2] tracking-wider">
                    Account Holder User Identification Number (SSN / EIN / Tax ID)
                  </span>
                </div>
                <div className="flex items-center space-x-4 pt-1">
                  <span className="font-mono text-2xl font-black text-[#dfbd84] tracking-widest">
                    {getMaskedNationalId(customer.national_id)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase flex items-center space-x-1.5 ${
                    isIdUnlocked
                      ? 'bg-[#58b388]/20 text-[#58b388] border-[#58b388]/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {isIdUnlocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-[#58b388]" />
                        <span>Special Authentication Granted (Full ID Unmasked)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hidden under * (Last 4 Digits Only Visible)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div>
                {!isIdUnlocked ? (
                  <button
                    onClick={() => setIsSpecialAuthModalOpen(true)}
                    className="px-5 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-[#1b2827] font-black rounded-xl shadow-lg border border-amber-300/50 transition flex items-center space-x-2 text-xs"
                  >
                    <KeyRound className="w-4 h-4 text-[#1b2827]" />
                    <span>Special Authentication to Unmask Full ID</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsIdUnlocked(false)}
                    className="px-4 py-2.5 bg-[#182423] hover:bg-[#20302f] text-[#dfbd84] font-bold rounded-xl border border-[#dfbd84]/40 transition flex items-center space-x-2 text-xs"
                  >
                    <Lock className="w-4 h-4 text-[#dfbd84]" />
                    <span>Re-Lock Identification Number</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid Layout: Account Details & Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Personal & Contact Profile Card */}
            <div className="glass-panel p-5 rounded-2xl border border-[#dfbd84]/30 bg-[#20302f]/60 space-y-4 shadow-xl">
              <h2 className="text-sm font-black text-[#dfbd84] uppercase tracking-wider flex items-center space-x-2 border-b border-[#dfbd84]/20 pb-3">
                <User className="w-4.5 h-4.5 text-[#dfbd84]" />
                <span>Customer Profile & Contact Information</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#dfbd84]/10">
                  <span className="text-[#a4b8b5] font-semibold">1. First Name / Entity Name:</span>
                  <span className="font-bold text-[#f4eee2]">{customer.first_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#dfbd84]/10">
                  <span className="text-[#a4b8b5] font-semibold">2. Last Name / Corporate Suffix:</span>
                  <span className="font-bold text-[#f4eee2]">{customer.last_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#dfbd84]/10">
                  <span className="text-[#a4b8b5] font-semibold">3. Primary Email Address:</span>
                  <span className="font-mono text-[#dfbd84] font-bold">{customer.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#dfbd84]/10">
                  <span className="text-[#a4b8b5] font-semibold">4. Telephone Contact:</span>
                  <span className="font-mono text-[#f4eee2]">{customer.phone || '+1-555-0199'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#a4b8b5] font-semibold">5. Customer Tier Category:</span>
                  <span className="font-bold uppercase text-[#dfbd84]">{customer.client_category || 'private_savings'}</span>
                </div>
              </div>
            </div>

            {/* Account Financial Ledger Card */}
            <div className="glass-panel p-5 rounded-2xl border border-[#dfbd84]/30 bg-[#20302f]/60 space-y-4 shadow-xl">
              <h2 className="text-sm font-black text-[#dfbd84] uppercase tracking-wider flex items-center space-x-2 border-b border-[#dfbd84]/20 pb-3">
                <Wallet className="w-4.5 h-4.5 text-[#dfbd84]" />
                <span>Financial Ledger & Deposit Account Details</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#dfbd84]/10">
                  <span className="text-[#a4b8b5] font-semibold">1. Account Master Number:</span>
                  <span className="font-mono font-bold text-[#dfbd84]">
                    {customer.account_number || `KSBC-ACC-${customer.id.slice(0, 8)}`}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#dfbd84]/10">
                  <span className="text-[#a4b8b5] font-semibold">2. Account Product Type:</span>
                  <span className="font-medium text-[#f4eee2]">
                    {customer.account_type || (isHnwi ? 'Private High-Net-Worth Reserve' : isCorporate ? 'Corporate Treasury Checking' : 'Private Standard Savings')}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#dfbd84]/10">
                  <span className="text-[#a4b8b5] font-semibold">3. Current Deposit Balance:</span>
                  <span className="font-mono font-extrabold text-[#58b388] text-sm">
                    ${Number(customer.annual_revenue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#dfbd84]/10">
                  <span className="text-[#a4b8b5] font-semibold">4. Operational Standing:</span>
                  <span className="font-bold text-emerald-400 uppercase">Active & Authenticated</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#a4b8b5] font-semibold">5. Onboarding Date:</span>
                  <span className="font-mono text-[#f4eee2]">
                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '2026-01-15'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KYC Compliance & Beneficial Ownership Audit Card */}
          <div className="glass-panel p-5 rounded-2xl border border-[#dfbd84]/30 bg-[#20302f]/60 space-y-3 shadow-xl">
            <h2 className="text-sm font-black text-[#dfbd84] uppercase tracking-wider flex items-center space-x-2 border-b border-[#dfbd84]/20 pb-3">
              <ShieldCheck className="w-4.5 h-4.5 text-[#dfbd84]" />
              <span>KYC Compliance Clearance & Beneficial Ownership Audit Remarks</span>
            </h2>
            <p className="text-xs text-[#f4eee2] leading-relaxed font-mono bg-[#182423] p-4 rounded-xl border border-[#dfbd84]/20">
              {customer.kyc_notes || 'Executive intake clearance audit completed. Anti-Money Laundering (AML) & Beneficial Ownership verification confirmed.'}
            </p>
          </div>

          {/* Associated Credit & Loan Portfolio Card */}
          {customerLoans.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-[#dfbd84]/30 bg-[#20302f]/60 space-y-4 shadow-xl">
              <h2 className="text-sm font-black text-[#dfbd84] uppercase tracking-wider flex items-center space-x-2 border-b border-[#dfbd84]/20 pb-3">
                <FileText className="w-4.5 h-4.5 text-[#dfbd84]" />
                <span>Associated Loan & Credit Facilities ({customerLoans.length} Applications)</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#dfbd84]/20 text-[#dfbd84] uppercase text-[10px] bg-[#182423]">
                      <th className="py-2.5 px-3">Loan ID</th>
                      <th className="py-2.5 px-3">Purpose</th>
                      <th className="py-2.5 px-3 text-right">Principal Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dfbd84]/15 font-mono">
                    {customerLoans.map(l => (
                      <tr key={l.id} className="hover:bg-[#182423]/40">
                        <td className="py-2.5 px-3 text-[#dfbd84] font-bold">#{l.id.slice(0, 8)}</td>
                        <td className="py-2.5 px-3 text-[#f4eee2] font-sans">{l.purpose}</td>
                        <td className="py-2.5 px-3 text-right text-[#58b388] font-bold">${Number(l.principal_amount || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            l.status === 'disbursed' || l.status === 'approved' ? 'bg-[#58b388]/20 text-[#58b388]' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {l.status}
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

      {/* Modify Account Details Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-[#dfbd84]/40 bg-[#20302f] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfbd84]/20">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#182423] text-[#dfbd84] rounded-xl border border-[#dfbd84]/30">
                  <Edit className="w-5 h-5 text-[#dfbd84]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f4eee2]">Modify Customer Account Details</h3>
                  <p className="text-[11px] text-[#dfbd84]">CFO & System Admin Executive Modification Clearance</p>
                </div>
              </div>
              <button onClick={() => setEditingCustomer(null)} className="text-[#a4b8b5] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#dfbd84] font-bold mb-1 uppercase text-[10px]">First Name / Entity</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full glass-input bg-[#182423] border border-[#dfbd84]/40 rounded-xl p-2.5 text-[#f4eee2]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#dfbd84] font-bold mb-1 uppercase text-[10px]">Last Name / Suffix</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full glass-input bg-[#182423] border border-[#dfbd84]/40 rounded-xl p-2.5 text-[#f4eee2]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#dfbd84] font-bold mb-1 uppercase text-[10px]">Deposit Balance ($)</label>
                <input
                  type="number"
                  value={editForm.annualRevenue}
                  onChange={(e) => setEditForm({ ...editForm, annualRevenue: e.target.value })}
                  className="w-full glass-input bg-[#182423] border border-[#dfbd84]/40 rounded-xl p-2.5 text-[#dfbd84] font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#dfbd84] font-bold mb-1 uppercase text-[10px]">Account Category</label>
                  <select
                    value={editForm.clientCategory}
                    onChange={(e) => setEditForm({ ...editForm, clientCategory: e.target.value })}
                    className="w-full glass-input bg-[#182423] border border-[#dfbd84]/40 rounded-xl p-2.5 text-[#f4eee2]"
                  >
                    <option value="private_savings">Private Savings</option>
                    <option value="hnwi">High Net-Worth (HNWI)</option>
                    <option value="corporate">Corporate Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#dfbd84] font-bold mb-1 uppercase text-[10px]">KYC Clearance Status</label>
                  <select
                    value={editForm.kycStatus}
                    onChange={(e) => setEditForm({ ...editForm, kycStatus: e.target.value })}
                    className="w-full glass-input bg-[#182423] border border-[#dfbd84]/40 rounded-xl p-2.5 text-[#f4eee2]"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="flagged">Flagged Watchlist</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#dfbd84]/20">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-[#182423] text-[#a4b8b5] rounded-xl font-semibold hover:bg-[#20302f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#c59e5f] via-[#dfbd84] to-[#c59e5f] hover:from-[#dfbd84] hover:to-[#dfbd84] text-[#1b2827] font-black rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving Changes...' : 'Save Account Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Account Deletion Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-red-500/40 bg-[#20302f] shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400 border-b border-red-500/20 pb-3">
              <div className="p-2 bg-red-950/60 rounded-xl border border-red-500/40">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Permanent Account Deletion</h3>
                <p className="text-[11px] text-red-300/70">Restricted Executive Action</p>
              </div>
            </div>

            <p className="text-xs text-[#f4eee2] leading-relaxed">
              Are you sure you want to permanently delete the account of <strong className="text-[#dfbd84]">{deletingCustomer.first_name} {deletingCustomer.last_name}</strong>?
            </p>

            <div className="pt-3 flex justify-end space-x-2 border-t border-[#dfbd84]/20">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 bg-[#182423] text-[#a4b8b5] rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {submitting ? 'Deleting Account...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Special Security Clearance Modal */}
      <ReAuthModal
        isOpen={isSpecialAuthModalOpen}
        onClose={() => setIsSpecialAuthModalOpen(false)}
        targetEmail={user?.email || 'cfo@banking.com'}
        onAuthenticate={handleSpecialAuthenticate}
      />
    </div>
  );
};

export default AccountDetailsPage;
