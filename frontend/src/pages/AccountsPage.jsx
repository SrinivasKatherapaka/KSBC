import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import ReAuthModal from '../components/common/ReAuthModal';
import AccountDetailsModal from '../components/accounts/AccountDetailsModal';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users, Search, ShieldCheck, KeyRound, Edit, Trash2, CheckSquare, Square,
  X, AlertTriangle, ShieldAlert, Check, Plus, DollarSign, Lock, Building, User, Sparkles, UserPlus, Eye
} from 'lucide-react';

export const AccountsPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Account Selection & Modals State
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    annualRevenue: '',
    clientCategory: 'private_savings',
    kycStatus: 'verified'
  });

  // Create New Account Form State (10 Fields)
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    annualRevenue: '1000000',
    clientCategory: 'private_savings',
    accountType: 'Private Standard Savings',
    kycStatus: 'verified',
    kycNotes: 'Executive clearance & beneficial ownership audit completed.'
  });

  const { user, login } = useAuth();

  // CFO and Admin Role Verification
  const isCfoOrAdmin = user?.role === 'cfo' || user?.role === 'admin' || user?.email === 'cfo@banking.com' || user?.email === 'admin@banking.com';
  // CFO, Compliance, and Admin Clearance for New Account Creation
  const canCreateAccount = (
    user?.role === 'cfo' ||
    user?.role === 'compliance' ||
    user?.role === 'admin' ||
    user?.email === 'cfo@banking.com' ||
    user?.email === 'compliance@banking.com' ||
    user?.email === 'admin@banking.com'
  );

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

  // Checkbox Selection Logic
  const handleToggleSelectAll = (filteredList) => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(c => c.id));
    }
  };

  const handleToggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Open Create Account Modal with Role Authorization Guard
  const handleOpenCreateModal = () => {
    if (!canCreateAccount) {
      setAccessDeniedMsg(`Access Denied: Creating new customer accounts is restricted to CFO (cfo@banking.com), Compliance Officer (compliance@banking.com), and System Administrator (admin@banking.com) credentials only. Current persona: ${user?.first_name || 'Personnel'} (${user?.role || 'user'}).`);
      return;
    }
    setIsCreateModalOpen(true);
  };

  // Create New Account Submit Handler
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const res = await apiClient.post('/customers', createForm);
      if (res.data.success) {
        setSuccessMsg(`New customer account for ${createForm.firstName} ${createForm.lastName} created successfully.`);
        setIsCreateModalOpen(false);
        setCreateForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          nationalId: '',
          annualRevenue: '1000000',
          clientCategory: 'private_savings',
          accountType: 'Private Standard Savings',
          kycStatus: 'verified',
          kycNotes: 'Executive clearance & beneficial ownership audit completed.'
        });
        fetchAccounts();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create customer account');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Account Modal with Role Authorization Guard
  const handleOpenEdit = (customer) => {
    if (!isCfoOrAdmin) {
      setAccessDeniedMsg(`Access Denied: Account modification privileges are restricted to CFO (cfo@banking.com) and System Administrator (admin@banking.com) credentials only. Current user: ${user?.first_name || 'Personnel'} (${user?.role || 'user'}).`);
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

  // Save Account Modifications
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await apiClient.put(`/customers/${editingCustomer.id}`, editForm);
      if (res.data.success) {
        setSuccessMsg(`Account for ${editForm.firstName} ${editForm.lastName} updated successfully.`);
        setEditingCustomer(null);
        fetchAccounts();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update account');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Confirmation Modal with Role Guard
  const handleOpenDelete = (customer) => {
    if (!isCfoOrAdmin) {
      setAccessDeniedMsg(`Access Denied: Account deletion privileges are restricted to CFO (cfo@banking.com) and System Administrator (admin@banking.com) credentials only. Current user: ${user?.first_name || 'Personnel'} (${user?.role || 'user'}).`);
      return;
    }
    setDeletingCustomer(customer);
  };

  // Confirm Account Deletion
  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;

    try {
      setSubmitting(true);
      setError('');
      const targetId = deletingCustomer.id;
      const targetName = `${deletingCustomer.first_name} ${deletingCustomer.last_name}`;

      const res = await apiClient.delete(`/customers/${targetId}`);
      if (res.data.success) {
        setCustomers(prev => prev.filter(c => c.id !== targetId));
        setSelectedIds(prev => prev.filter(id => id !== targetId));
        setDeletingCustomer(null);
        setSuccessMsg(`Account for ${targetName} deleted successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setSubmitting(false);
      fetchAccounts();
    }
  };

  // Bulk Delete Selected Accounts
  const handleBulkDelete = async () => {
    if (!isCfoOrAdmin) {
      setAccessDeniedMsg(`Access Denied: Bulk account deletion is restricted to CFO and Admin logins only.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected accounts?`)) return;

    try {
      setSubmitting(true);
      setError('');
      const idsToDelete = [...selectedIds];

      const res = await apiClient.post('/customers/bulk-delete', { ids: idsToDelete });
      if (res.data.success) {
        setCustomers(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        setSelectedIds([]);
        setSuccessMsg(`${idsToDelete.length} accounts deleted successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to bulk delete selected accounts');
    } finally {
      setSubmitting(false);
      fetchAccounts();
    }
  };

  const privateSavingsCount = customers.filter(c => c.client_category === 'private_savings' || c.client_category === 'private_individual' || !c.client_category).length;
  const hnwiCount = customers.filter(c => c.client_category === 'hnwi').length;
  const corporateCount = customers.filter(c => c.client_category === 'corporate').length;

  const filteredAccounts = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      (c.first_name && c.first_name.toLowerCase().includes(q)) ||
      (c.last_name && c.last_name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
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
    <div className="flex min-h-screen bg-[#0B1120] text-[#FAF7E6] text-[#94A3B8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header & Intake Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#FAF7E6] font-heading">KSBC Accounts Database</h1>
              <p className="text-xs text-[#FAF7E6]">
                Authenticated Master Ledger ({customers.length} Accounts: {privateSavingsCount} Private Savings, {hnwiCount} HNWI & {corporateCount} Corporate)
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 bg-gradient-to-r from-[#C59E5F] via-[#DFBD84] to-[#C59E5F] hover:from-[#DFBD84] hover:to-[#EED29E] text-[#0B1120] font-black text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4 text-[#FAF7E6]" />
                <span>Create New Account</span>
              </button>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2.5 bg-[#15203B]/85 text-[#FAF7E6] hover:bg-[#15203B]/85 text-[#FAF7E6] text-[#FAF7E6] text-xs font-bold rounded-xl border border-[#DFBD84]/15 transition flex items-center space-x-2 shadow-lg"
              >
                <KeyRound className="w-4 h-4 text-[#FAF7E6]" />
                <span>Re-Verify Password Clearance</span>
              </button>
            </div>
          </div>

          {/* Authorization Status Banner */}
          <div className={`glass-panel p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            canCreateAccount
              ? 'border-[#58b388]/40 bg-[#15203B]/85 text-[#FAF7E6]/80 text-[#58b388]'
              : 'border-amber-500/40 bg-[#15203B]/85 text-[#FAF7E6]/80 text-amber-300'
          }`}>
            <div className="flex items-center space-x-3 font-bold">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#FAF7E6]" />
              <div>
                <span className="text-[#FAF7E6]">
                  {canCreateAccount
                    ? '🔐 Executive Intake Clearance Authenticated: CFO, Compliance & Admin Account Creation Unlocked'
                    : '👁️ Read-Only Operational View: Creating / Modifying Accounts Requires CFO, Compliance or Admin Clearance'}
                </span>
                <p className="text-[11px] text-[#94A3B8] font-normal mt-0.5">
                  Active Persona: <strong className="text-[#FAF7E6]">{user?.first_name} {user?.last_name}</strong> ({user?.email}) — Role: <span className="uppercase text-[#FAF7E6]">{user?.role}</span>
                </p>
              </div>
            </div>

            <div className="font-mono text-xs text-right">
              <span className="text-[10px] text-[#94A3B8] block font-sans">TOTAL DEPOSITS IN DATABASE</span>
              <span className="font-extrabold text-[#FAF7E6] text-base">${calcTotalDeposits(customers).toLocaleString()}</span>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-[#58b388]/20 border border-[#58b388]/50 rounded-xl text-xs text-[#58b388] font-bold flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </span>
              <button onClick={() => setSuccessMsg('')} className="text-[#58b388] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* Category Filter & Search Bar */}
          <div className="glass-panel p-3.5 rounded-2xl border border-[#DFBD84]/15 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#15203B]/85 text-[#FAF7E6]/60">
            <div className="flex space-x-2 font-mono text-xs overflow-x-auto">
              {[
                { id: 'ALL', label: `All Accounts (${customers.length})` },
                { id: 'PRIVATE_SAVINGS', label: `👤 Private Savings (${privateSavingsCount})` },
                { id: 'HNWI', label: `💎 High Net-Worth (${hnwiCount})` },
                { id: 'CORPORATE', label: `🏢 Corporate (${corporateCount})` }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id)}
                  className={`px-3.5 py-2 rounded-xl font-semibold transition text-xs flex-shrink-0 ${
                    categoryFilter === f.id
                      ? 'bg-[#15203B]/85 text-[#FAF7E6] text-[#FAF7E6] border border-[#DFBD84]/15 shadow-md font-bold'
                      : 'bg-[#15203B]/85 text-[#FAF7E6]/60 text-[#94A3B8] hover:text-[#FAF7E6] border border-[#DFBD84]/15'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#FAF7E6]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search account, name, or SSN/EIN..."
                className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 text-xs rounded-xl p-2 pl-9 text-[#FAF7E6] focus:outline-none focus:ring-2 focus:ring-[#DFBD84]"
              />
            </div>
          </div>

          {/* Bulk Selection Operations Bar */}
          {selectedIds.length > 0 && (
            <div className="p-3.5 bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-2xl flex items-center justify-between text-xs text-[#FAF7E6] shadow-xl">
              <div className="flex items-center space-x-2 font-bold">
                <CheckSquare className="w-4 h-4 text-[#FAF7E6]" />
                <span>Selected {selectedIds.length} Accounts</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkDelete}
                  disabled={submitting}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected Accounts</span>
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 bg-[#15203B]/85 text-[#FAF7E6] text-[#94A3B8] hover:text-white rounded-xl font-semibold"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Main Accounts Table */}
          {loading ? (
            <LoadingSpinner text="Retrieving authenticated master accounts database..." />
          ) : (
            <div className="glass-panel rounded-2xl border border-[#DFBD84]/15 overflow-hidden p-5 space-y-4 bg-[#15203B]/85 text-[#FAF7E6]/60 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#DFBD84]/15 text-[#FAF7E6] uppercase tracking-wider text-[10px] bg-[#15203B]/85 text-[#FAF7E6]">
                      <th className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleSelectAll(filteredAccounts)}
                          className="text-[#FAF7E6] hover:text-white transition"
                          title="Select All Accounts"
                        >
                          {selectedIds.length > 0 && selectedIds.length === filteredAccounts.length ? (
                            <CheckSquare className="w-4 h-4 text-[#FAF7E6]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#FAF7E6]" />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 px-4">Account Number</th>
                      <th className="py-3.5 px-4">Client Name & Category</th>
                      <th className="py-3.5 px-4">Account Type</th>
                      <th className="py-3.5 px-4">Tax / SSN / EIN ID</th>
                      <th className="py-3.5 px-4 text-right">Deposit Balance ($)</th>
                      <th className="py-3.5 px-4 text-center">KYC Status</th>
                      <th className="py-3.5 px-4 text-center font-bold text-[#FAF7E6]">Actions / Modify</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFBD84]/15">
                    {filteredAccounts.map((c) => {
                      const isSelected = selectedIds.includes(c.id);
                      const isHnwi = c.client_category === 'hnwi';
                      const isCorporate = c.client_category === 'corporate';

                      return (
                        <tr
                          key={c.id}
                          onClick={() => { setViewingCustomer(c); navigate(`/accounts/${c.id}`); }}
                          className={`transition cursor-pointer ${isSelected ? 'bg-[#15203B]/85 text-[#FAF7E6]/90' : 'hover:bg-[#15203B]/85 text-[#FAF7E6]/70 hover:shadow-inner'}`}
                          title="Click row to view detailed customer account information"
                        >
                          {/* Selection Checkbox Cell */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleSelectRow(c.id)}
                              className="text-[#FAF7E6] hover:text-white"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#FAF7E6]" />
                              ) : (
                                <Square className="w-4 h-4 text-[#94A3B8]" />
                              )}
                            </button>
                          </td>

                          {/* Account Number */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#FAF7E6]">
                            <span onClick={(e) => { e.stopPropagation(); navigate(`/accounts/${c.id}`); }} className="hover:underline cursor-pointer">
                              {c.account_number || `KSBC-ACC-${c.id.slice(0, 8)}`}
                            </span>
                          </td>

                          {/* Client Name & Category Badge */}
                          <td className="py-3.5 px-4">
                            <span onClick={(e) => { e.stopPropagation(); navigate(`/accounts/${c.id}`); }} className="font-bold text-[#FAF7E6] hover:underline cursor-pointer block">
                              {c.first_name} {c.last_name}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border uppercase mt-1 ${
                              isHnwi
                                ? 'bg-[#1E2D4E]/10 text-[#FAF7E6] border-[#DFBD84]/15'
                                : isCorporate
                                ? 'bg-[#1E2D4E]/10 text-[#FAF7E6] border-[#DFBD84]/15'
                                : 'bg-[#15203B]/85 text-[#FAF7E6] text-purple-300 border-purple-500/30'
                            }`}>
                              {isHnwi ? '💎 High Net-Worth (HNWI)' : isCorporate ? '🏢 Corporate Client' : '👤 Private Savings Account'}
                            </span>
                          </td>

                          {/* Account Type */}
                          <td className="py-3.5 px-4 text-[#94A3B8] font-medium">
                            {c.account_type || (isHnwi ? 'Private High-Net-Worth Reserve' : isCorporate ? 'Corporate Treasury Checking' : 'Private Standard Savings')}
                          </td>

                          {/* SSN / EIN (Displays last 4 digits, rest masked under *) */}
                          <td className="py-3.5 px-4 font-mono text-[#94A3B8]">
                            {isUnlocked
                              ? (c.national_id || 'US-SSN-648-92-9918')
                              : (c.national_id && c.national_id.length >= 4
                                  ? `${c.national_id.slice(0, 6).includes('EIN') ? 'US-EIN-**-***' : 'US-SSN-***-**-'}${c.national_id.slice(-4)}`
                                  : 'US-SSN-***-**-9918')}
                          </td>

                          {/* Deposit Balance */}
                          <td className="py-3.5 px-4 text-right font-mono font-extrabold text-[#58b388]">
                            ${Number(c.annual_revenue || 0).toLocaleString()}
                          </td>

                          {/* KYC Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                              c.kyc_status === 'verified'
                                ? 'bg-[#58b388]/20 text-[#58b388] border-[#58b388]/40'
                                : c.kyc_status === 'flagged'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-[#15203B]/85 text-[#FAF7E6] text-[#94A3B8] border-[#DFBD84]/15'
                            }`}>
                              {c.kyc_status}
                            </span>
                          </td>

                          {/* Action Buttons: View Details Page, Modify & Delete Account */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => { setViewingCustomer(c); navigate(`/accounts/${c.id}`); }}
                                className="px-2.5 py-1 bg-[#15203B]/85 text-[#FAF7E6] hover:bg-[#15203B]/85 text-[#FAF7E6] text-[#FAF7E6] hover:text-white border border-[#DFBD84]/15 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 shadow"
                                title="View Detailed Account Information"
                              >
                                <Eye className="w-3 h-3 text-[#FAF7E6]" />
                                <span>Details</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(c)}
                                className="px-2.5 py-1 bg-[#15203B]/85 text-[#FAF7E6] hover:bg-[#15203B]/85 text-[#FAF7E6] text-[#FAF7E6] border border-[#DFBD84]/15 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 shadow"
                                title="Modify Account Details (CFO / Admin Only)"
                              >
                                <Edit className="w-3 h-3 text-[#FAF7E6]" />
                                <span>Modify</span>
                              </button>
                              <button
                                onClick={() => handleOpenDelete(c)}
                                className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 shadow"
                                title="Delete Account (CFO / Admin Only)"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                                <span>Delete</span>
                              </button>
                            </div>
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

      {/* Create New Account Modal (All 10 Fields - CFO, Compliance & Admin Only) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-[#DFBD84]/15 bg-[#15203B]/85 text-[#FAF7E6] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFBD84]/15">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#15203B]/85 text-[#FAF7E6] text-[#FAF7E6] rounded-xl border border-[#DFBD84]/15">
                  <UserPlus className="w-5 h-5 text-[#FAF7E6]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#FAF7E6]">Create New Customer Account</h3>
                  <p className="text-[11px] text-[#FAF7E6]">CFO, Compliance & Admin Executive Intake Clearance</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">1. First Name / Corporate Entity *</label>
                  <input
                    type="text"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    placeholder="e.g. Apex Global"
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">2. Last Name / Suffix *</label>
                  <input
                    type="text"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    placeholder="e.g. Enterprises LLC"
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">3. Contact Email Address *</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="e.g. treasury@apexglobal.com"
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">4. Contact Phone Number</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="e.g. +1-555-849-3012"
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">5. Tax ID / SSN / EIN</label>
                  <input
                    type="text"
                    value={createForm.nationalId}
                    onChange={(e) => setCreateForm({ ...createForm, nationalId: e.target.value })}
                    placeholder="e.g. US-EIN-9481903"
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">6. Initial Deposit Balance ($) *</label>
                  <input
                    type="number"
                    value={createForm.annualRevenue}
                    onChange={(e) => setCreateForm({ ...createForm, annualRevenue: e.target.value })}
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6] font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">7. Client Category</label>
                  <select
                    value={createForm.clientCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const defaultType = cat === 'hnwi' ? 'Private High-Net-Worth Reserve' : cat === 'corporate' ? 'Corporate Treasury Checking' : 'Private Standard Savings';
                      setCreateForm({ ...createForm, clientCategory: cat, accountType: defaultType });
                    }}
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                  >
                    <option value="private_savings">👤 Private Savings</option>
                    <option value="hnwi">💎 High Net-Worth (HNWI)</option>
                    <option value="corporate">🏢 Corporate Client</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">8. Account Product Type</label>
                  <input
                    type="text"
                    value={createForm.accountType}
                    onChange={(e) => setCreateForm({ ...createForm, accountType: e.target.value })}
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">9. KYC Clearance Status</label>
                  <select
                    value={createForm.kycStatus}
                    onChange={(e) => setCreateForm({ ...createForm, kycStatus: e.target.value })}
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending Audit</option>
                    <option value="flagged">Flagged Watchlist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">10. KYC & Audit Notes</label>
                  <input
                    type="text"
                    value={createForm.kycNotes}
                    onChange={(e) => setCreateForm({ ...createForm, kycNotes: e.target.value })}
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#DFBD84]/15">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#15203B]/85 text-[#FAF7E6] text-[#94A3B8] rounded-xl font-semibold hover:bg-[#15203B]/85 text-[#FAF7E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#C59E5F] via-[#DFBD84] to-[#C59E5F] hover:from-[#DFBD84] hover:to-[#EED29E] text-[#0B1120] font-black font-black rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify Account Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-[#DFBD84]/15 bg-[#15203B]/85 text-[#FAF7E6] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFBD84]/15">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#15203B]/85 text-[#FAF7E6] text-[#FAF7E6] rounded-xl border border-[#DFBD84]/15">
                  <Edit className="w-5 h-5 text-[#FAF7E6]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#FAF7E6]">Modify Customer Account Details</h3>
                  <p className="text-[11px] text-[#FAF7E6]">CFO & System Admin Executive Modification Clearance</p>
                </div>
              </div>
              <button onClick={() => setEditingCustomer(null)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">First Name / Entity</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">Last Name / Suffix</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">Deposit Balance ($)</label>
                <input
                  type="number"
                  value={editForm.annualRevenue}
                  onChange={(e) => setEditForm({ ...editForm, annualRevenue: e.target.value })}
                  className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6] font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">Account Category</label>
                  <select
                    value={editForm.clientCategory}
                    onChange={(e) => setEditForm({ ...editForm, clientCategory: e.target.value })}
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                  >
                    <option value="private_savings">Private Savings</option>
                    <option value="hnwi">High Net-Worth (HNWI)</option>
                    <option value="corporate">Corporate Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">KYC Clearance Status</label>
                  <select
                    value={editForm.kycStatus}
                    onChange={(e) => setEditForm({ ...editForm, kycStatus: e.target.value })}
                    className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="flagged">Flagged Watchlist</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#DFBD84]/15">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-[#15203B]/85 text-[#FAF7E6] text-[#94A3B8] rounded-xl font-semibold hover:bg-[#15203B]/85 text-[#FAF7E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#C59E5F] via-[#DFBD84] to-[#C59E5F] hover:from-[#DFBD84] hover:to-[#EED29E] text-[#0B1120] font-black font-black rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving Changes...' : 'Save Account Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Account Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-red-500/40 bg-[#15203B]/85 text-[#FAF7E6] shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400 border-b border-red-500/20 pb-3">
              <div className="p-2 bg-red-950/60 rounded-xl border border-red-500/40">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Permanent Account Deletion</h3>
                <p className="text-[11px] text-red-300/70">Restricted Executive Action</p>
              </div>
            </div>

            <p className="text-xs text-[#FAF7E6] leading-relaxed">
              Are you sure you want to permanently delete the account of <strong className="text-[#FAF7E6]">{deletingCustomer.first_name} {deletingCustomer.last_name}</strong> ({deletingCustomer.account_number || deletingCustomer.id.slice(0, 8)})?
            </p>

            <div className="pt-3 flex justify-end space-x-2 border-t border-[#DFBD84]/15">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 bg-[#15203B]/85 text-[#FAF7E6] text-[#94A3B8] rounded-xl font-semibold"
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

      {/* Access Denied Warning Modal */}
      {accessDeniedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-amber-500/40 bg-[#15203B]/85 text-[#FAF7E6] shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400 border-b border-amber-500/20 pb-3">
              <div className="p-2 bg-[#15203B]/85 text-[#FAF7E6] rounded-xl border border-amber-500/40">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#FAF7E6]">Executive Security Clearance Required</h3>
                <p className="text-[11px] text-amber-300/80">CFO, Compliance & Admin Access Privilege Only</p>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">{accessDeniedMsg}</p>

            <div className="p-3 bg-[#15203B]/85 text-[#FAF7E6] rounded-xl border border-[#DFBD84]/15 text-xs space-y-1">
              <span className="text-[10px] text-[#FAF7E6] font-bold uppercase block">Authorized Clearance Personas:</span>
              <p className="font-mono text-[#FAF7E6] text-[11px] font-bold">1. CFO Executive: cfo@banking.com (password123)</p>
              <p className="font-mono text-[#FAF7E6] text-[11px] font-bold">2. Compliance Officer: compliance@banking.com (password123)</p>
              <p className="font-mono text-[#FAF7E6] text-[11px] font-bold">3. System Admin: admin@banking.com (password123)</p>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => { setAccessDeniedMsg(''); setIsAuthModalOpen(true); }}
                className="px-4 py-2 bg-[#15203B]/85 text-[#FAF7E6] hover:bg-[#15203B]/85 text-[#FAF7E6] text-[#FAF7E6] font-bold rounded-xl text-xs border border-[#DFBD84]/15"
              >
                Switch Credentials Persona
              </button>
              <button
                onClick={() => setAccessDeniedMsg('')}
                className="px-4 py-2 bg-gradient-to-r from-[#C59E5F] via-[#DFBD84] to-[#C59E5F] hover:from-[#DFBD84] hover:to-[#EED29E] text-[#0B1120] font-black font-bold rounded-xl text-xs"
              >
                Dismiss
              </button>
            </div>
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

      {/* Account Details & Customer Information Modal */}
      <AccountDetailsModal
        isOpen={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        customer={viewingCustomer}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isCfoOrAdmin={isCfoOrAdmin}
      />
    </div>
  );
};

export default AccountsPage;
