import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoanApplicationModal from '../components/loans/LoanApplicationModal';
import LoanLifecycleTracker from '../components/loans/LoanLifecycleTracker';
import RiskAssessmentBadge from '../components/loans/RiskAssessmentBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  Landmark, Plus, Sparkles, CheckCircle2, DollarSign, Filter, LayoutGrid, List,
  Loader2, User, Building, Store, Database, Trash2, Edit, Search, CheckSquare, Square,
  X, Check, Download, AlertTriangle, ShieldCheck
} from 'lucide-react';

export const LoansPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialView = searchParams.get('view') || 'SEGREGATED';

  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(initialView);

  // Database Tab States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedLoanIds, setSelectedLoanIds] = useState([]);
  const [editingLoan, setEditingLoan] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, customersRes] = await Promise.all([
        apiClient.get('/loans'),
        apiClient.get('/customers')
      ]);
      if (loansRes.data.success) setLoans(loansRes.data.loans);
      if (customersRes.data.success) setCustomers(customersRes.data.customers);
    } catch (err) {
      setError('Failed to fetch commercial loans portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const v = new URLSearchParams(location.search).get('view');
    if (v) setViewMode(v);
  }, [location.search]);

  const handleCreateLoan = async (loanData) => {
    await apiClient.post('/loans', loanData);
    fetchData();
  };

  const handleAssessRisk = async (loanId) => {
    setProcessingId(loanId);
    try {
      await apiClient.post(`/loans/${loanId}/assess-risk`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'AI Risk assessment failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveLoan = async (loanId) => {
    setProcessingId(loanId);
    try {
      await apiClient.patch(`/loans/${loanId}/approve`);
      setSuccessMsg(`✅ Loan #${loanId.slice(0, 8)} approved in underwriting pipeline!`);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Loan approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDisburseLoan = async (loanId) => {
    setProcessingId(loanId);
    try {
      const res = await apiClient.post(`/treasury/loans/${loanId}/disburse`);
      if (res.data.success) {
        setSuccessMsg(`🎉 Loan #${loanId.slice(0, 8)} disbursed into General Ledger Vault Cash!`);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Treasury disbursement failed');
    } finally {
      setProcessingId(null);
    }
  };

  // Modify Loan Record Submit
  const handleUpdateLoanRecord = async (e) => {
    e.preventDefault();
    if (!editingLoan) return;
    setProcessingId(editingLoan.id);

    try {
      const res = await apiClient.put(`/loans/${editingLoan.id}`, {
        applicant_name: editingLoan.applicant_name,
        applicant_category: editingLoan.applicant_category,
        principal_amount: Number(editingLoan.principal_amount),
        interest_rate: Number(editingLoan.interest_rate),
        term_months: Number(editingLoan.term_months),
        purpose: editingLoan.purpose,
        status: editingLoan.status,
        risk_score: Number(editingLoan.risk_score || 35)
      });

      if (res.data.success) {
        setEditingLoan(null);
        setSuccessMsg(`✅ Loan record #${editingLoan.id.slice(0, 8)} updated successfully.`);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update loan record');
    } finally {
      setProcessingId(null);
    }
  };

  // Single Delete Loan Record
  const handleDeleteLoanRecord = async (loanId, applicantName) => {
    if (!window.confirm(`Are you sure you want to delete loan record #${loanId.slice(0, 8)} for "${applicantName}"? This action is permanent.`)) {
      return;
    }

    setProcessingId(loanId);
    try {
      const res = await apiClient.delete(`/loans/${loanId}`);
      if (res.data.success) {
        setSelectedLoanIds(prev => prev.filter(id => id !== loanId));
        setSuccessMsg(`🗑️ Loan record #${loanId.slice(0, 8)} deleted successfully.`);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete loan record');
    } finally {
      setProcessingId(null);
    }
  };

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedLoanIds.length === filteredDatabaseLoans.length) {
      setSelectedLoanIds([]);
    } else {
      setSelectedLoanIds(filteredDatabaseLoans.map(l => l.id));
    }
  };

  const handleToggleSelectRow = (loanId) => {
    setSelectedLoanIds(prev =>
      prev.includes(loanId) ? prev.filter(id => id !== loanId) : [...prev, loanId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedLoanIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedLoanIds.length} selected loan records?`)) return;

    try {
      setLoading(true);
      await Promise.all(selectedLoanIds.map(id => apiClient.delete(`/loans/${id}`)));
      setSuccessMsg(`🗑️ ${selectedLoanIds.length} loan records deleted from database.`);
      setSelectedLoanIds([]);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError('Bulk delete operation encountered errors.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedLoanIds.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(selectedLoanIds.map(id => apiClient.patch(`/loans/${id}/approve`)));
      setSuccessMsg(`✅ ${selectedLoanIds.length} loan applications approved.`);
      setSelectedLoanIds([]);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError('Bulk approval operation encountered errors.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Database Loans
  const filteredDatabaseLoans = loans.filter((l) => {
    const name = (l.applicant_name || l.customer?.first_name || '').toLowerCase();
    const idStr = (l.id || '').toLowerCase();
    const purpose = (l.purpose || '').toLowerCase();
    const accNum = (l.customer?.account_number || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesQuery = !q || name.includes(q) || idStr.includes(q) || purpose.includes(q) || accNum.includes(q);
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (l.applicant_category || l.customer?.client_category) === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  // Segregated Loan Groups for Kanban
  const appliedLoans = loans.filter((l) => l.status === 'draft' || l.status === 'applied');
  const inProcessLoans = loans.filter((l) => l.status === 'underwriting' || l.status === 'compliance_review');
  const approvedLoans = loans.filter((l) => l.status === 'approved');
  const disbursedLoans = loans.filter((l) => l.status === 'disbursed');
  const rejectedLoans = loans.filter((l) => l.status === 'rejected');

  const renderCategoryBadge = (cat) => {
    if (cat === 'private_individual') {
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">👤 Private Account</span>;
    }
    if (cat === 'sme') {
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#073642] text-[#ffd700] border border-[#ffd700]/30">🏬 SME Business</span>;
    }
    return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#073642] text-[#2aa198] border border-[#2aa198]/30">🏢 Corporate</span>;
  };

  const renderLoanCard = (loan) => {
    const displayName = loan.applicant_name || (loan.customer ? `${loan.customer.first_name} ${loan.customer.last_name}` : 'Applicant');
    const category = loan.applicant_category || (loan.customer?.client_category) || 'corporate';

    return (
      <div key={loan.id} className="p-4 bg-[#002129] rounded-2xl border border-[#2aa198]/30 space-y-3 shadow-lg hover:border-[#ffd700]/50 transition">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-extrabold text-[#fdf6e3] text-sm">{displayName}</h4>
            <div className="flex items-center space-x-1.5 mt-1">
              {renderCategoryBadge(category)}
              <span className="text-[10px] text-[#2aa198] font-mono">ID: {loan.id.slice(0, 8)}</span>
            </div>
          </div>
          <RiskAssessmentBadge score={loan.risk_score} level={loan.ai_risk_assessment?.riskLevel} />
        </div>

        <div className="p-2.5 bg-[#002129]/80 rounded-xl border border-[#2aa198]/30 font-mono text-xs flex justify-between">
          <div>
            <span className="text-[9px] text-[#93a1a1] font-sans block">PRINCIPAL</span>
            <span className="font-extrabold text-[#ffd700]">${Number(loan.principal_amount).toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-[#93a1a1] font-sans block">RATE / TERM</span>
            <span className="font-bold text-[#fdf6e3]">{loan.interest_rate}% ({loan.term_months}m)</span>
          </div>
        </div>

        <p className="text-[11px] text-[#93a1a1]">
          <span className="text-[#2aa198] font-semibold">Purpose:</span> {loan.purpose}
        </p>

        {loan.ai_risk_assessment?.summaryAdvisory && (
          <div className="p-2 bg-[#002b36]/80 rounded-lg text-[10px] italic text-[#93a1a1] border border-[#2aa198]/20">
            🤖 "{loan.ai_risk_assessment.summaryAdvisory}"
          </div>
        )}

        {/* Action Triggers */}
        <div className="pt-2 border-t border-[#2aa198]/20 flex flex-col space-y-1.5 text-xs">
          {(loan.status === 'draft' || loan.status === 'applied' || loan.status === 'compliance_review' || loan.status === 'underwriting') && (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAssessRisk(loan.id)}
                disabled={processingId === loan.id}
                className="w-full py-1.5 bg-gradient-to-r from-[#b58900] to-[#d4af37] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] text-[10px] font-black rounded-lg shadow transition flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                {processingId === loan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-[#002b36]" />}
                <span>AI Risk</span>
              </button>

              <button
                onClick={() => handleApproveLoan(loan.id)}
                disabled={processingId === loan.id}
                className="w-full py-1.5 bg-[#859900] hover:bg-emerald-500 text-[#002b36] text-[10px] font-black rounded-lg shadow transition flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Approve</span>
              </button>
            </div>
          )}

          {loan.status === 'approved' && (
            <button
              onClick={() => handleDisburseLoan(loan.id)}
              disabled={processingId === loan.id}
              className="w-full py-2 bg-gradient-to-r from-[#b58900] to-[#859900] hover:from-[#d4af37] hover:to-emerald-500 text-[#002b36] text-[11px] font-black rounded-xl shadow transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {processingId === loan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5 text-[#002b36]" />}
              <span>Authorize Treasury Payout</span>
            </button>
          )}

          {loan.status === 'disbursed' && (
            <span className="w-full text-center py-1.5 bg-[#859900]/20 border border-[#859900]/40 text-[#859900] font-bold rounded-xl text-[10px]">
              Disbursed & Reconciled
            </span>
          )}

          {loan.status === 'rejected' && (
            <span className="w-full text-center py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl text-[10px]">
              ✕ Application Rejected
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#002b36] text-[#93a1a1]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#fdf6e3] font-heading flex items-center space-x-2">
                <Landmark className="w-6 h-6 text-[#ffd700]" />
                <span>Commercial & Private Loans Portfolio</span>
              </h1>
              <p className="text-xs text-[#2aa198]">
                Master Database & Underwriting Lifecycle Pipeline ({loans.length} Total Loans)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle Buttons */}
              <div className="flex bg-[#002129] p-1 rounded-xl border border-[#2aa198]/30 text-xs">
                <button
                  onClick={() => setViewMode('DATABASE')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    viewMode === 'DATABASE' ? 'bg-[#073642] text-[#ffd700] shadow border border-[#ffd700]/30' : 'text-[#93a1a1] hover:text-[#fdf6e3]'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>Loans Database Hub</span>
                </button>
                <button
                  onClick={() => setViewMode('SEGREGATED')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    viewMode === 'SEGREGATED' ? 'bg-[#073642] text-[#ffd700] shadow border border-[#ffd700]/30' : 'text-[#93a1a1] hover:text-[#fdf6e3]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Segregated Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    viewMode === 'LIST' ? 'bg-[#073642] text-[#ffd700] shadow border border-[#ffd700]/30' : 'text-[#93a1a1] hover:text-[#fdf6e3]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Pipeline List</span>
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#b58900] via-[#d4af37] to-[#b58900] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-2 border border-[#ffd700]/50"
              >
                <Plus className="w-4 h-4 text-[#002b36]" />
                <span>Intake Loan Application</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-[#859900]/20 border border-[#859900]/50 rounded-xl text-xs text-[#859900] font-bold flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </span>
              <button onClick={() => setSuccessMsg('')} className="text-[#859900] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Loading loans database master records..." />
          ) : viewMode === 'DATABASE' ? (
            /* ========================================================================= */
            /* 🗄️ LOANS DATABASE MASTER HUB TAB WITH ROW SELECTION, EDIT & DELETE         */
            /* ========================================================================= */
            <div className="glass-panel p-6 rounded-2xl border border-[#2aa198]/30 space-y-4 bg-[#073642]/60 shadow-2xl">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#002129] p-3 rounded-xl border border-[#2aa198]/30">
                <div className="flex items-center space-x-2 w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#2aa198]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Loan ID, Name, Account #, Purpose..."
                    className="w-full bg-transparent text-xs text-[#fdf6e3] placeholder-[#93a1a1] focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto text-xs">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#073642] text-[#fdf6e3] border border-[#2aa198]/40 rounded-lg p-2 font-semibold"
                  >
                    <option value="all">All Loan Statuses</option>
                    <option value="draft">Applied / Draft</option>
                    <option value="underwriting">In Underwriting</option>
                    <option value="approved">Approved</option>
                    <option value="disbursed">Disbursed</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#073642] text-[#fdf6e3] border border-[#2aa198]/40 rounded-lg p-2 font-semibold"
                  >
                    <option value="all">All Categories</option>
                    <option value="corporate">Corporate</option>
                    <option value="sme">SME</option>
                    <option value="private_individual">Private Individual</option>
                  </select>
                </div>
              </div>

              {/* Bulk Action Toolbar */}
              {selectedLoanIds.length > 0 && (
                <div className="p-3 bg-[#b58900]/20 border border-[#ffd700]/40 rounded-xl flex items-center justify-between text-xs text-[#ffd700]">
                  <span className="font-bold flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-[#ffd700]" />
                    <span>{selectedLoanIds.length} Loan Row(s) Selected</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkApprove}
                      className="px-3 py-1.5 bg-[#859900] text-[#002b36] font-black rounded-lg hover:bg-emerald-400 transition"
                    >
                      Approve Selected ({selectedLoanIds.length})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-red-600 text-white font-black rounded-lg hover:bg-red-700 transition"
                    >
                      Delete Selected ({selectedLoanIds.length})
                    </button>
                  </div>
                </div>
              )}

              {/* Loans Database Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2aa198]/30 text-[#2aa198] uppercase tracking-wider text-[10px] bg-[#002129]">
                      <th className="py-3 px-3 w-10 text-center">
                        <button onClick={handleToggleSelectAll} className="text-[#ffd700]">
                          {selectedLoanIds.length === filteredDatabaseLoans.length && filteredDatabaseLoans.length > 0 ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-3">Loan ID / Ref</th>
                      <th className="py-3 px-3">Applicant & Account</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-right">Principal ($)</th>
                      <th className="py-3 px-3 text-center">Rate / Term</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Risk Score</th>
                      <th className="py-3 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2aa198]/15">
                    {filteredDatabaseLoans.map((l) => {
                      const isSelected = selectedLoanIds.includes(l.id);
                      const name = l.applicant_name || (l.customer ? `${l.customer.first_name} ${l.customer.last_name}` : 'Applicant');
                      const accNum = l.customer?.account_number || `KSBC-ACC-${l.id.slice(0, 6)}`;

                      return (
                        <tr key={l.id} className={`hover:bg-[#002129]/60 transition ${isSelected ? 'bg-[#002129]/80 border-l-4 border-l-[#ffd700]' : ''}`}>
                          <td className="py-3 px-3 text-center">
                            <button onClick={() => handleToggleSelectRow(l.id)} className="text-[#ffd700]">
                              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-[#93a1a1]" />}
                            </button>
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-[#ffd700]">
                            #{l.id.slice(0, 8)}
                          </td>

                          <td className="py-3 px-3 space-y-0.5">
                            <span className="font-bold text-[#fdf6e3] block">{name}</span>
                            <span className="text-[10px] text-[#2aa198] font-mono block">{accNum}</span>
                          </td>

                          <td className="py-3 px-3">
                            {renderCategoryBadge(l.applicant_category || l.customer?.client_category)}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-extrabold text-[#fdf6e3]">
                            ${Number(l.principal_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-3 text-center font-mono text-[11px]">
                            {l.interest_rate}% ({l.term_months}m)
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              l.status === 'disbursed'
                                ? 'bg-[#859900]/20 text-[#859900] border-[#859900]/40'
                                : l.status === 'approved'
                                ? 'bg-[#268bd2]/20 text-[#268bd2] border-[#268bd2]/40'
                                : l.status === 'rejected'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-[#b58900]/20 text-[#ffd700] border-[#ffd700]/40'
                            }`}>
                              {l.status}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-bold">
                            <span className={l.risk_score > 70 ? 'text-red-400' : l.risk_score > 40 ? 'text-[#ffd700]' : 'text-[#859900]'}>
                              {l.risk_score || 35}/100
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              {/* Edit / Modify Button */}
                              <button
                                onClick={() => setEditingLoan(l)}
                                className="p-1.5 bg-[#073642] text-[#ffd700] hover:bg-[#ffd700] hover:text-[#002b36] rounded-lg transition border border-[#ffd700]/30"
                                title="Modify Loan Record"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteLoanRecord(l.id, name)}
                                className="p-1.5 bg-red-950/60 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition border border-red-500/30"
                                title="Delete Loan Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Assess Risk Button */}
                              <button
                                onClick={() => handleAssessRisk(l.id)}
                                className="p-1.5 bg-[#2aa198]/20 text-[#2aa198] hover:bg-[#2aa198] hover:text-[#002b36] rounded-lg transition border border-[#2aa198]/30"
                                title="Run Gemini AI Risk Model"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
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
          ) : viewMode === 'SEGREGATED' ? (
            /* Segregated Columns Layout (5 Segregated Columns) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              {/* Column 1: Applied / Draft */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/20 space-y-3 bg-[#073642]/50">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs uppercase">1. Applied</span>
                    <span className="px-2 py-0.5 bg-[#002129] text-[#ffd700] rounded text-[10px] font-mono font-bold">{appliedLoans.length}</span>
                  </div>
                  <p className="text-[10px] text-[#2aa198] font-mono font-bold mt-1">Total: ${calcGroupTotal(appliedLoans).toLocaleString()}</p>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {appliedLoans.map(renderLoanCard)}
                </div>
              </div>

              {/* Column 2: In Process / Underwriting */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/20 space-y-3 bg-[#073642]/50">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs uppercase">2. In Process</span>
                    <span className="px-2 py-0.5 bg-[#002129] text-[#ffd700] rounded text-[10px] font-mono font-bold">{inProcessLoans.length}</span>
                  </div>
                  <p className="text-[10px] text-[#2aa198] font-mono font-bold mt-1">Total: ${calcGroupTotal(inProcessLoans).toLocaleString()}</p>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {inProcessLoans.map(renderLoanCard)}
                </div>
              </div>

              {/* Column 3: Approved */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/20 space-y-3 bg-[#073642]/50">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs uppercase">3. Approved</span>
                    <span className="px-2 py-0.5 bg-[#002129] text-[#859900] rounded text-[10px] font-mono font-bold">{approvedLoans.length}</span>
                  </div>
                  <p className="text-[10px] text-[#859900] font-mono font-bold mt-1">Total: ${calcGroupTotal(approvedLoans).toLocaleString()}</p>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {approvedLoans.map(renderLoanCard)}
                </div>
              </div>

              {/* Column 4: Disbursed */}
              <div className="glass-panel p-4 rounded-2xl border border-[#859900]/30 space-y-3 bg-[#073642]/70 shadow-lg">
                <div className="pb-2 border-b border-[#859900]/30">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#859900] text-xs uppercase">4. Disbursed</span>
                    <span className="px-2 py-0.5 bg-[#002129] text-[#859900] rounded text-[10px] font-mono font-bold">{disbursedLoans.length}</span>
                  </div>
                  <p className="text-[10px] text-[#859900] font-mono font-bold mt-1">Total: ${calcGroupTotal(disbursedLoans).toLocaleString()}</p>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {disbursedLoans.map(renderLoanCard)}
                </div>
              </div>

              {/* Column 5: Rejected */}
              <div className="glass-panel p-4 rounded-2xl border border-red-500/20 space-y-3 bg-[#073642]/40">
                <div className="pb-2 border-b border-red-500/20">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-red-400 text-xs uppercase">5. Rejected</span>
                    <span className="px-2 py-0.5 bg-[#002129] text-red-400 rounded text-[10px] font-mono font-bold">{rejectedLoans.length}</span>
                  </div>
                  <p className="text-[10px] text-red-400 font-mono font-bold mt-1">Total: ${calcGroupTotal(rejectedLoans).toLocaleString()}</p>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {rejectedLoans.map(renderLoanCard)}
                </div>
              </div>
            </div>
          ) : (
            /* Full Pipeline List Mode */
            <div className="glass-panel p-6 rounded-2xl border border-[#2aa198]/30 space-y-4 bg-[#073642]/60">
              <h3 className="text-sm font-bold text-white">Full Commercial Loans Pipeline List ({loans.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loans.map(renderLoanCard)}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Intake Loan Modal */}
      <LoanApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLoan}
        customers={customers}
      />

      {/* Modify Loan Record Modal */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-[#ffd700]/40 bg-[#073642] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2aa198]/20">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-[#ffd700]" />
                <div>
                  <h3 className="text-base font-bold text-[#fdf6e3]">Modify Loan Database Record</h3>
                  <p className="text-[11px] text-[#2aa198]">Loan Ref: #{editingLoan.id.slice(0, 8)}</p>
                </div>
              </div>
              <button onClick={() => setEditingLoan(null)} className="text-[#93a1a1] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLoanRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#2aa198] font-bold mb-1 uppercase text-[10px]">Applicant Full Name</label>
                <input
                  type="text"
                  value={editingLoan.applicant_name || ''}
                  onChange={(e) => setEditingLoan({ ...editingLoan, applicant_name: e.target.value })}
                  className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2.5 text-[#fdf6e3] font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2aa198] font-bold mb-1 uppercase text-[10px]">Principal Amount ($)</label>
                  <input
                    type="number"
                    value={editingLoan.principal_amount || 0}
                    onChange={(e) => setEditingLoan({ ...editingLoan, principal_amount: e.target.value })}
                    className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2.5 text-[#ffd700] font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#2aa198] font-bold mb-1 uppercase text-[10px]">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingLoan.interest_rate || 6.5}
                    onChange={(e) => setEditingLoan({ ...editingLoan, interest_rate: e.target.value })}
                    className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2.5 text-[#fdf6e3] font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2aa198] font-bold mb-1 uppercase text-[10px]">Term (Months)</label>
                  <input
                    type="number"
                    value={editingLoan.term_months || 36}
                    onChange={(e) => setEditingLoan({ ...editingLoan, term_months: e.target.value })}
                    className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2.5 text-[#fdf6e3] font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#2aa198] font-bold mb-1 uppercase text-[10px]">Loan Status</label>
                  <select
                    value={editingLoan.status || 'draft'}
                    onChange={(e) => setEditingLoan({ ...editingLoan, status: e.target.value })}
                    className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2.5 text-[#ffd700] font-bold"
                  >
                    <option value="draft">Draft / Applied</option>
                    <option value="underwriting">In Underwriting</option>
                    <option value="approved">Approved</option>
                    <option value="disbursed">Disbursed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#2aa198] font-bold mb-1 uppercase text-[10px]">Requisition Purpose</label>
                <input
                  type="text"
                  value={editingLoan.purpose || ''}
                  onChange={(e) => setEditingLoan({ ...editingLoan, purpose: e.target.value })}
                  className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2.5 text-[#fdf6e3]"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#2aa198]/20">
                <button
                  type="button"
                  onClick={() => setEditingLoan(null)}
                  className="px-4 py-2 bg-[#002129] text-[#93a1a1] rounded-xl font-semibold hover:bg-[#073642]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === editingLoan.id}
                  className="px-5 py-2 bg-gradient-to-r from-[#b58900] via-[#d4af37] to-[#b58900] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] font-black rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {processingId === editingLoan.id ? 'Saving Record...' : 'Save Database Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansPage;
