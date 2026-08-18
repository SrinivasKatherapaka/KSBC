import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoanApplicationModal from '../components/loans/LoanApplicationModal';
import LoanDetailsModal from '../components/loans/LoanDetailsModal';
import RiskAssessmentBadge from '../components/loans/RiskAssessmentBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Database, Plus, Sparkles, CheckCircle2, DollarSign, Filter, LayoutGrid, List,
  Loader2, User, Building, Store, Trash2, Edit, Search, CheckSquare, Square,
  X, Check, Download, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, FileText,
  Eye, ArrowUpRight
} from 'lucide-react';

export const LoansDatabasePage = () => {
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedDetailLoan, setSelectedDetailLoan] = useState(null);

  // Search & Filter States
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
      setError('Failed to fetch master loans database records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLoan = async (loanData) => {
    await apiClient.post('/loans', loanData);
    setSuccessMsg('New loan application record created in database.');
    fetchData();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAssessRisk = async (loanId) => {
    setProcessingId(loanId);
    try {
      await apiClient.post(`/loans/${loanId}/assess-risk`);
      setSuccessMsg(`⚡ Gemini AI Risk Scoring completed for Loan #${loanId.slice(0, 8)}`);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
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
      setSuccessMsg(`✅ Loan record #${loanId.slice(0, 8)} approved by Underwriting.`);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Loan approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusUpdate = async (loanId, targetStatus, reasonNotes) => {
    try {
      const res = await apiClient.patch(`/loans/${loanId}/status`, {
        status: targetStatus,
        action: targetStatus,
        notes: reasonNotes
      });
      if (res.data?.success) {
        setSuccessMsg(`✅ Action Recorded: Loan #${loanId.slice(0, 8)} status set to "${targetStatus.toUpperCase()}".`);
        fetchData();
        if (selectedDetailLoan && selectedDetailLoan.id === loanId) {
          setSelectedDetailLoan(res.data.loan || { ...selectedDetailLoan, status: targetStatus, decision_notes: reasonNotes });
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update loan status');
    }
  };

  const handleDisburseLoan = async (loanId) => {
    setProcessingId(loanId);
    try {
      const res = await apiClient.post(`/treasury/loans/${loanId}/disburse`);
      if (res.data.success) {
        setSuccessMsg(`🎉 Loan #${loanId.slice(0, 8)} disbursed into General Ledger Vault Cash.`);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Treasury disbursement failed');
    } finally {
      setProcessingId(null);
    }
  };

  // Modify / Edit Loan Record
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
      setError(err.response?.data?.error || 'Failed to modify loan record');
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Loan Record
  const handleDeleteLoanRecord = async (loanId, applicantName) => {
    if (!window.confirm(`Are you sure you want to delete loan record #${loanId.slice(0, 8)} for "${applicantName}"? This action permanently removes the record.`)) {
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

  // Multi-Row Checkbox Selection & Bulk Actions
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
      setSuccessMsg(`🗑️ ${selectedLoanIds.length} loan database records deleted.`);
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

  // Export Selected or All Records to CSV
  const handleExportCSV = () => {
    const recordsToExport = selectedLoanIds.length > 0
      ? filteredDatabaseLoans.filter(l => selectedLoanIds.includes(l.id))
      : filteredDatabaseLoans;

    const headers = ['Loan ID', 'Applicant Name', 'Account Number', 'Category', 'Principal ($)', 'Interest Rate (%)', 'Term (Months)', 'Purpose', 'Status', 'Risk Score', 'Created At'];
    const rows = recordsToExport.map(l => [
      l.id,
      `"${l.applicant_name || (l.customer ? `${l.customer.first_name} ${l.customer.last_name}` : 'Applicant')}"`,
      `"${l.customer?.account_number || ''}"`,
      l.applicant_category || l.customer?.client_category || 'corporate',
      l.principal_amount,
      l.interest_rate,
      l.term_months,
      `"${l.purpose || ''}"`,
      l.status,
      l.risk_score || 35,
      l.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KSBC_Loans_Database_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMsg(`📥 Exported ${recordsToExport.length} loan records to CSV.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Filtering Logic
  const filteredDatabaseLoans = loans.filter((l) => {
    const name = (l.applicant_name || (l.customer ? `${l.customer.first_name} ${l.customer.last_name}` : '')).toLowerCase();
    const idStr = (l.id || '').toLowerCase();
    const purpose = (l.purpose || '').toLowerCase();
    const accNum = (l.customer?.account_number || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesQuery = !q || name.includes(q) || idStr.includes(q) || purpose.includes(q) || accNum.includes(q);
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (l.applicant_category || l.customer?.client_category) === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  // Calculate Metrics
  const totalPrincipalSum = loans.reduce((sum, l) => sum + Number(l.principal_amount || 0), 0);
  const totalDisbursedSum = loans.filter(l => l.status === 'disbursed').reduce((sum, l) => sum + Number(l.principal_amount || 0), 0);
  const totalApprovedSum = loans.filter(l => l.status === 'approved').reduce((sum, l) => sum + Number(l.principal_amount || 0), 0);
  const totalPendingSum = loans.filter(l => l.status !== 'disbursed' && l.status !== 'rejected').reduce((sum, l) => sum + Number(l.principal_amount || 0), 0);

  const renderCategoryBadge = (cat) => {
    if (cat === 'private_individual') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">👤 Private Account</span>;
    }
    if (cat === 'sme') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] border border-[#1E2748]/15">🏬 SME Business</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] border border-[#1E2748]/15">🏢 Corporate</span>;
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#1E2748] text-[#53627C]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1E2748] font-heading flex items-center space-x-2">
                <Database className="w-6 h-6 text-[#1E2748]" />
                <span>KSBC Commercial Loans Master Database</span>
              </h1>
              <p className="text-xs text-[#1E2748]">
                Master Record Repository, Multi-Row Operations & Underwriting Reconciliations ({loans.length} Total Loans)
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/loans?view=SEGREGATED"
                className="px-3.5 py-2 bg-[#F6F2E3] text-[#1E2748] border border-[#1E2748]/15 text-[#1E2748] hover:text-[#1E2748] text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>View Kanban Pipeline</span>
              </Link>

              <button
                onClick={() => setIsIntakeModalOpen(true)}
                className="px-4 py-2.5 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] font-archivo font-extrabold text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-2 border border-[#1E2748]/15"
              >
                <Plus className="w-4 h-4 text-[#1E2748]" />
                <span>Intake Loan Application</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-[#58b388]/20 border border-[#58b388]/50 rounded-xl text-xs text-[#58b388] font-bold flex items-center justify-between shadow-md">
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

          {/* Executive Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/60 rounded-2xl border border-[#1E2748]/15 space-y-1">
              <span className="text-[10px] font-bold text-[#1E2748] uppercase block">TOTAL PORTFOLIO VOLUME</span>
              <span className="text-xl font-black text-[#1E2748] font-mono">
                ${totalPrincipalSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[#53627C] block font-medium">{loans.length} Total Master Database Records</span>
            </div>

            <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/80 rounded-2xl border border-[#58b388]/50 space-y-1 shadow-lg">
              <span className="text-[10px] font-bold text-[#58b388] uppercase block">DISBURSED EARNING ASSETS</span>
              <span className="text-xl font-black text-[#58b388] font-mono">
                ${totalDisbursedSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[#58b388] block font-bold">Reconciled in General Ledger (1200)</span>
            </div>

            <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/60 rounded-2xl border border-[#1E2748]/15 space-y-1">
              <span className="text-[10px] font-bold text-[#1E2748] uppercase block">APPROVED AWAITING DISBURSEMENT</span>
              <span className="text-xl font-black text-[#268bd2] font-mono">
                ${totalApprovedSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[#268bd2] block font-bold">Ready for Treasury Authorization</span>
            </div>

            <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/60 rounded-2xl border border-[#1E2748]/15 space-y-1">
              <span className="text-[10px] font-bold text-[#1E2748] uppercase block">PENDING PIPELINE VOLUME</span>
              <span className="text-xl font-black text-[#1E2748] font-mono">
                ${totalPendingSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[#1E2748]/80 block font-bold">In Underwriting Review</span>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading master loans database records..." />
          ) : (
            /* ========================================================================= */
            /* 🗄️ FULL MASTER LOANS DATABASE TABLE WITH SELECTION, EDIT & DELETE         */
            /* ========================================================================= */
            <div className="glass-panel p-6 rounded-2xl border border-[#1E2748]/15 space-y-4 bg-[#F6F2E3] text-[#1E2748]/60 shadow-2xl">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F6F2E3] text-[#1E2748] p-3.5 rounded-xl border border-[#1E2748]/15">
                <div className="flex items-center space-x-2 w-full sm:w-96">
                  <Search className="w-4 h-4 text-[#1E2748]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Loan Ref #, Applicant Name, Account #, Purpose..."
                    className="w-full bg-transparent text-xs text-[#1E2748] placeholder-[#53627C] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] border border-[#1E2748]/15 rounded-lg p-2 font-semibold cursor-pointer"
                  >
                    <option value="all" className="bg-[#F6F2E3] text-[#1E2748]">All Loan Statuses</option>
                    <option value="draft" className="bg-[#F6F2E3] text-[#1E2748]">Applied / Draft</option>
                    <option value="underwriting" className="bg-[#F6F2E3] text-[#1E2748]">In Underwriting</option>
                    <option value="on_hold" className="bg-[#F6F2E3] text-[#1E2748]">On Hold</option>
                    <option value="approved" className="bg-[#F6F2E3] text-[#1E2748]">Approved</option>
                    <option value="disbursed" className="bg-[#F6F2E3] text-[#1E2748]">Disbursed</option>
                    <option value="rejected" className="bg-[#F6F2E3] text-[#1E2748]">Rejected</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] border border-[#1E2748]/15 rounded-lg p-2 font-semibold cursor-pointer"
                  >
                    <option value="all" className="bg-[#F6F2E3] text-[#1E2748]">All Categories</option>
                    <option value="corporate" className="bg-[#F6F2E3] text-[#1E2748]">Corporate Enterprise</option>
                    <option value="sme" className="bg-[#F6F2E3] text-[#1E2748]">SME Business</option>
                    <option value="private_individual" className="bg-[#F6F2E3] text-[#1E2748]">Private Individual</option>
                  </select>

                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-2 bg-[#F6F2E3] text-[#1E2748] hover:bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] rounded-lg border border-[#1E2748]/15 font-bold transition flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Bulk Operations Bar */}
              {selectedLoanIds.length > 0 && (
                <div className="p-3 bg-[#EBE4CD]/20 border border-[#1E2748]/15 rounded-xl flex items-center justify-between text-xs text-[#1E2748] shadow-lg">
                  <span className="font-bold flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-[#1E2748]" />
                    <span>{selectedLoanIds.length} Loan Record(s) Selected</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkApprove}
                      className="px-3 py-1.5 bg-[#58b388] text-[#1E2748] font-black rounded-lg hover:bg-emerald-400 transition"
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

              {/* Master Loans Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1E2748]/15 text-[#1E2748] uppercase tracking-wider text-[10px] bg-[#F6F2E3] text-[#1E2748]">
                      <th className="py-3 px-3 w-10 text-center">
                        <button onClick={handleToggleSelectAll} className="text-[#1E2748]" title="Select All">
                          {selectedLoanIds.length === filteredDatabaseLoans.length && filteredDatabaseLoans.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-[#1E2748]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#53627C]" />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 px-3">Loan Ref #</th>
                      <th className="py-3.5 px-3">Applicant Name & Account #</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3 text-right">Principal ($)</th>
                      <th className="py-3.5 px-3 text-center">Rate / Term</th>
                      <th className="py-3.5 px-3">Loan Purpose</th>
                      <th className="py-3.5 px-3 text-center">Status</th>
                      <th className="py-3.5 px-3 text-center">AI Risk</th>
                      <th className="py-3.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2748]/15">
                    {filteredDatabaseLoans.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="py-8 text-center text-[#53627C] italic text-xs">
                          No loan records matching selected search query or filters.
                        </td>
                      </tr>
                    ) : (
                      filteredDatabaseLoans.map((l) => {
                        if (!l) return null;
                        const loanIdStr = (l.id || 'c0000000').slice(0, 8);
                        const isSelected = selectedLoanIds.includes(l.id);
                        const name = l.applicant_name || (l.customer ? `${l.customer.first_name || ''} ${l.customer.last_name || ''}`.trim() : 'Applicant');
                        const accNum = l.customer?.account_number || `KSBC-ACC-${loanIdStr.slice(0, 6)}`;

                        return (
                          <tr key={l.id || Math.random()} className={`hover:bg-[#F6F2E3] text-[#1E2748]/60 transition ${isSelected ? 'bg-[#F6F2E3] text-[#1E2748]/80 border-l-4 border-l-[#1E2748]' : ''}`}>
                            <td className="py-3.5 px-3 text-center">
                              <button onClick={() => handleToggleSelectRow(l.id)} className="text-[#1E2748]">
                                {isSelected ? <CheckSquare className="w-4 h-4 text-[#1E2748]" /> : <Square className="w-4 h-4 text-[#53627C]" />}
                              </button>
                            </td>

                            <td className="py-3.5 px-3 font-mono font-bold">
                              <button
                                onClick={() => setSelectedDetailLoan(l)}
                                className="text-[#1E2748] hover:text-[#1E2748] hover:underline flex items-center space-x-1 cursor-pointer group"
                                title="Click to view complete loan details and outcome actions"
                              >
                                <span>#{loanIdStr}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                              </button>
                            </td>

                            <td className="py-3.5 px-3 space-y-0.5">
                              <button
                                onClick={() => setSelectedDetailLoan(l)}
                                className="font-bold text-[#1E2748] hover:text-[#1E2748] text-left block cursor-pointer transition"
                              >
                                {name}
                              </button>
                              <span className="text-[10px] text-[#1E2748] font-mono block">{accNum}</span>
                            </td>

                            <td className="py-3.5 px-3">
                              {renderCategoryBadge(l.applicant_category || l.customer?.client_category)}
                            </td>

                            <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#1E2748]">
                              ${Number(l.principal_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>

                            <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                              {l.interest_rate}% ({l.term_months}m)
                            </td>

                            <td className="py-3.5 px-3 text-[11px] text-[#53627C] max-w-xs truncate">
                              {l.purpose}
                            </td>

                            <td className="py-3.5 px-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                l.status === 'disbursed'
                                  ? 'bg-[#58b388]/20 text-[#58b388] border-[#58b388]/40'
                                  : l.status === 'approved'
                                  ? 'bg-[#268bd2]/20 text-[#268bd2] border-[#268bd2]/40'
                                  : l.status === 'on_hold' || l.status === 'onhold'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  : l.status === 'rejected'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                  : 'bg-[#EBE4CD]/20 text-[#1E2748] border-[#1E2748]/15'
                              }`}>
                                {l.status === 'on_hold' ? 'ON HOLD' : l.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-center font-mono font-bold">
                              <span className={l.risk_score > 70 ? 'text-red-400' : l.risk_score > 40 ? 'text-[#1E2748]' : 'text-[#58b388]'}>
                                {l.risk_score || 35}/100
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                {/* View Details Modal Button */}
                                <button
                                  onClick={() => setSelectedDetailLoan(l)}
                                  className="p-1.5 bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] hover:bg-[#EBE4CD] hover:text-[#1E2748] rounded-lg transition border border-[#1E2748]/15 cursor-pointer"
                                  title="View Full Loan Details & Outcome Actions"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Modify Button */}
                                <button
                                  onClick={() => setEditingLoan(l)}
                                  className="p-1.5 bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] hover:bg-[#EBE4CD] hover:text-[#1E2748] rounded-lg transition border border-[#1E2748]/15 cursor-pointer"
                                  title="Modify Loan Record"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteLoanRecord(l.id, name)}
                                  className="p-1.5 bg-red-950/60 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition border border-red-500/30 cursor-pointer"
                                  title="Delete Loan Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Run AI Risk Button */}
                                <button
                                  onClick={() => handleAssessRisk(l.id)}
                                  className="p-1.5 bg-[#EBE4CD]/10 text-[#1E2748] hover:bg-[#EBE4CD] hover:text-[#1E2748] rounded-lg transition border border-[#1E2748]/15 cursor-pointer"
                                  title="Run Gemini AI Risk Model"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Intake Loan Modal */}
      <LoanApplicationModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSubmit={handleCreateLoan}
        customers={customers}
      />

      {/* Modify Loan Record Modal */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-[#1E2748]/15 bg-[#F6F2E3] text-[#1E2748] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2748]/15">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-[#1E2748]" />
                <div>
                  <h3 className="text-base font-bold text-[#1E2748]">Modify Loan Database Record</h3>
                  <p className="text-[11px] text-[#1E2748]">Loan Ref: #{editingLoan.id.slice(0, 8)}</p>
                </div>
              </div>
              <button onClick={() => setEditingLoan(null)} className="text-[#53627C] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLoanRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#1E2748] font-bold mb-1 uppercase text-[10px]">Applicant Full Name</label>
                <input
                  type="text"
                  value={editingLoan.applicant_name || ''}
                  onChange={(e) => setEditingLoan({ ...editingLoan, applicant_name: e.target.value })}
                  className="w-full glass-input bg-[#F6F2E3] text-[#1E2748] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1E2748] font-bold mb-1 uppercase text-[10px]">Principal Amount ($)</label>
                  <input
                    type="number"
                    value={editingLoan.principal_amount || 0}
                    onChange={(e) => setEditingLoan({ ...editingLoan, principal_amount: e.target.value })}
                    className="w-full glass-input bg-[#F6F2E3] text-[#1E2748] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#1E2748] font-bold mb-1 uppercase text-[10px]">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingLoan.interest_rate || 6.5}
                    onChange={(e) => setEditingLoan({ ...editingLoan, interest_rate: e.target.value })}
                    className="w-full glass-input bg-[#F6F2E3] text-[#1E2748] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1E2748] font-bold mb-1 uppercase text-[10px]">Term (Months)</label>
                  <input
                    type="number"
                    value={editingLoan.term_months || 36}
                    onChange={(e) => setEditingLoan({ ...editingLoan, term_months: e.target.value })}
                    className="w-full glass-input bg-[#F6F2E3] text-[#1E2748] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#1E2748] font-bold mb-1 uppercase text-[10px]">Loan Status</label>
                  <select
                    value={editingLoan.status || 'draft'}
                    onChange={(e) => setEditingLoan({ ...editingLoan, status: e.target.value })}
                    className="w-full glass-input bg-[#F6F2E3] text-[#1E2748] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-bold"
                  >
                    <option value="draft" className="bg-[#F6F2E3] text-[#1E2748]">Draft / Applied</option>
                    <option value="underwriting" className="bg-[#F6F2E3] text-[#1E2748]">In Underwriting</option>
                    <option value="approved" className="bg-[#F6F2E3] text-[#1E2748]">Approved</option>
                    <option value="disbursed" className="bg-[#F6F2E3] text-[#1E2748]">Disbursed</option>
                    <option value="rejected" className="bg-[#F6F2E3] text-[#1E2748]">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#1E2748] font-bold mb-1 uppercase text-[10px]">Requisition Purpose</label>
                <input
                  type="text"
                  value={editingLoan.purpose || ''}
                  onChange={(e) => setEditingLoan({ ...editingLoan, purpose: e.target.value })}
                  className="w-full glass-input bg-[#F6F2E3] text-[#1E2748] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748]"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#1E2748]/15">
                <button
                  type="button"
                  onClick={() => setEditingLoan(null)}
                  className="px-4 py-2 bg-[#F6F2E3] text-[#1E2748] text-[#53627C] rounded-xl font-semibold hover:bg-[#F6F2E3] text-[#1E2748]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === editingLoan.id}
                  className="px-5 py-2 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] font-archivo font-extrabold font-black rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {processingId === editingLoan.id ? 'Saving Record...' : 'Save Database Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Full Details & Outcome Actions Modal */}
      {selectedDetailLoan && (
        <LoanDetailsModal
          isOpen={!!selectedDetailLoan}
          onClose={() => setSelectedDetailLoan(null)}
          loan={selectedDetailLoan}
          onStatusUpdate={handleStatusUpdate}
          onAssessRisk={handleAssessRisk}
          onDisburse={handleDisburseLoan}
          onDelete={handleDeleteLoanRecord}
        />
      )}
    </div>
  );
};

export default LoansDatabasePage;
