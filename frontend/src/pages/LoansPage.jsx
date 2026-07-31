import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoanApplicationModal from '../components/loans/LoanApplicationModal';
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

  // Category & Status Filters
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
      if (loansRes.data?.success) setLoans(loansRes.data.loans || []);
      if (customersRes.data?.success) setCustomers(customersRes.data.customers || []);
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
    setSuccessMsg('Loan application created successfully.');
    fetchData();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAssessRisk = async (loanId) => {
    if (!loanId) return;
    setProcessingId(loanId);
    try {
      await apiClient.post(`/loans/${loanId}/assess-risk`);
      setSuccessMsg(`⚡ Gemini AI Risk assessment completed for Loan #${loanId.slice(0, 8)}`);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'AI Risk assessment failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveLoan = async (loanId) => {
    if (!loanId) return;
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
    if (!loanId) return;
    setProcessingId(loanId);
    try {
      const res = await apiClient.post(`/treasury/loans/${loanId}/disburse`);
      if (res.data?.success) {
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
    if (!editingLoan || !editingLoan.id) return;
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

      if (res.data?.success) {
        setEditingLoan(null);
        setSuccessMsg(`✅ Loan record #${(editingLoan.id || '').slice(0, 8)} updated successfully.`);
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
    if (!loanId) return;
    const refStr = loanId.slice(0, 8);
    if (!window.confirm(`Are you sure you want to delete loan record #${refStr} for "${applicantName}"?`)) return;

    setProcessingId(loanId);
    try {
      const res = await apiClient.delete(`/loans/${loanId}`);
      if (res.data?.success) {
        setSelectedLoanIds(prev => prev.filter(id => id !== loanId));
        setSuccessMsg(`🗑️ Loan record #${refStr} deleted successfully.`);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete loan record');
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered Loans by Search and Category
  const activeFilteredLoans = loans.filter((l) => {
    if (!l) return false;
    const name = (l.applicant_name || (l.customer ? `${l.customer.first_name || ''} ${l.customer.last_name || ''}` : '')).toLowerCase();
    const idStr = (l.id || '').toLowerCase();
    const purpose = (l.purpose || '').toLowerCase();
    const accNum = (l.customer?.account_number || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesQuery = !q || name.includes(q) || idStr.includes(q) || purpose.includes(q) || accNum.includes(q);
    const matchesCategory = categoryFilter === 'all' || (l.applicant_category || l.customer?.client_category || 'corporate') === categoryFilter;

    return matchesQuery && matchesCategory;
  });

  // Segregated Pipeline Loan Groups
  const appliedLoans = activeFilteredLoans.filter((l) => l.status === 'draft' || l.status === 'applied');
  const inProcessLoans = activeFilteredLoans.filter((l) => l.status === 'underwriting' || l.status === 'compliance_review');
  const approvedLoans = activeFilteredLoans.filter((l) => l.status === 'approved');
  const disbursedLoans = activeFilteredLoans.filter((l) => l.status === 'disbursed');
  const rejectedLoans = activeFilteredLoans.filter((l) => l.status === 'rejected');

  const calcGroupTotal = (group) => group.reduce((sum, l) => sum + Number(l.principal_amount || 0), 0);

  const renderCategoryBadge = (cat) => {
    if (cat === 'private_individual') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">👤 Private Account</span>;
    }
    if (cat === 'sme') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-[#073642] text-[#ffd700] border border-[#ffd700]/30">🏬 SME Business</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-[#073642] text-[#2aa198] border border-[#2aa198]/30">🏢 Corporate Enterprise</span>;
  };

  const renderLoanCard = (loan) => {
    if (!loan) return null;
    const loanIdStr = (loan.id || 'c0000000').slice(0, 8);
    const displayName = loan.applicant_name || (loan.customer ? `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim() : 'Applicant');
    const category = loan.applicant_category || loan.customer?.client_category || 'corporate';

    return (
      <div key={loan.id || Math.random()} className="p-4 bg-[#002129] rounded-2xl border border-[#2aa198]/30 space-y-3 shadow-lg hover:border-[#ffd700]/50 transition">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-extrabold text-[#fdf6e3] text-sm">{displayName}</h4>
            <div className="flex items-center space-x-1.5 mt-1">
              {renderCategoryBadge(category)}
              <span className="text-[10px] text-[#2aa198] font-mono">ID: #{loanIdStr}</span>
            </div>
          </div>
          <RiskAssessmentBadge score={loan.risk_score || 35} level={loan.ai_risk_assessment?.riskLevel} />
        </div>

        <div className="p-2.5 bg-[#002129]/80 rounded-xl border border-[#2aa198]/30 font-mono text-xs flex justify-between">
          <div>
            <span className="text-[9px] text-[#93a1a1] font-sans block">PRINCIPAL</span>
            <span className="font-extrabold text-[#ffd700]">${Number(loan.principal_amount || 0).toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-[#93a1a1] font-sans block">RATE / TERM</span>
            <span className="font-bold text-[#fdf6e3]">{loan.interest_rate || 6.5}% ({loan.term_months || 36}m)</span>
          </div>
        </div>

        <p className="text-[11px] text-[#93a1a1] line-clamp-2">
          <span className="text-[#2aa198] font-semibold">Purpose:</span> {loan.purpose || 'Commercial Growth'}
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#fdf6e3] font-heading flex items-center space-x-2">
                <Landmark className="w-6 h-6 text-[#ffd700]" />
                <span>Categorized Commercial Loans Portfolio Pipeline</span>
              </h1>
              <p className="text-xs text-[#2aa198]">
                Segregated Underwriting Pipeline & Portfolio Reconciliations ({loans.length} Total Loans)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#b58900] via-[#d4af37] to-[#b58900] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-2 border border-[#ffd700]/50"
              >
                <Plus className="w-4 h-4 text-[#002b36]" />
                <span>Intake Loan Application</span>
              </button>
            </div>
          </div>

          {/* Categorized Filter Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#002129] p-3.5 rounded-2xl border border-[#2aa198]/30 shadow-lg">
            <div className="flex items-center space-x-2 w-full sm:w-80">
              <Search className="w-4 h-4 text-[#ffd700]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Loan ID, Name, Account #, Purpose..."
                className="w-full bg-transparent text-xs text-[#fdf6e3] placeholder-[#93a1a1] focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto text-xs">
              <span className="text-[10px] text-[#2aa198] font-bold uppercase">FILTER BY CATEGORY:</span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  categoryFilter === 'all' ? 'bg-[#ffd700] text-[#002b36]' : 'bg-[#073642] text-[#93a1a1] hover:text-[#fdf6e3]'
                }`}
              >
                All Categories ({loans.length})
              </button>
              <button
                onClick={() => setCategoryFilter('corporate')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  categoryFilter === 'corporate' ? 'bg-[#2aa198] text-[#002b36]' : 'bg-[#073642] text-[#93a1a1] hover:text-[#fdf6e3]'
                }`}
              >
                🏢 Corporate Enterprise
              </button>
              <button
                onClick={() => setCategoryFilter('sme')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  categoryFilter === 'sme' ? 'bg-[#b58900] text-[#002b36]' : 'bg-[#073642] text-[#93a1a1] hover:text-[#fdf6e3]'
                }`}
              >
                🏬 SME Business
              </button>
              <button
                onClick={() => setCategoryFilter('private_individual')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  categoryFilter === 'private_individual' ? 'bg-purple-500 text-white' : 'bg-[#073642] text-[#93a1a1] hover:text-[#fdf6e3]'
                }`}
              >
                👤 Private Accounts
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-[#859900]/20 border border-[#859900]/50 rounded-xl text-xs text-[#859900] font-bold flex items-center justify-between shadow">
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
            <LoadingSpinner text="Loading categorized commercial loans pipeline..." />
          ) : (
            /* Categorized 5-Column Underwriting Lifecycle Kanban Pipeline */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              {/* Column 1: Applied / Draft */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/30 space-y-3 bg-[#073642]/50 shadow-xl">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs uppercase flex items-center space-x-1">
                      <span>1. Applied / Draft</span>
                    </span>
                    <span className="px-2 py-0.5 bg-[#002129] text-[#ffd700] rounded-full text-[10px] font-mono font-bold">
                      {appliedLoans.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#2aa198] font-mono font-bold mt-1">
                    Volume: ${calcGroupTotal(appliedLoans).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                  {appliedLoans.length === 0 ? (
                    <div className="p-4 text-center text-[#93a1a1] text-xs italic bg-[#002129]/40 rounded-xl">
                      No applied applications in this category filter.
                    </div>
                  ) : (
                    appliedLoans.map(renderLoanCard)
                  )}
                </div>
              </div>

              {/* Column 2: In Process / Underwriting */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/30 space-y-3 bg-[#073642]/50 shadow-xl">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs uppercase flex items-center space-x-1">
                      <span>2. Underwriting</span>
                    </span>
                    <span className="px-2 py-0.5 bg-[#002129] text-[#ffd700] rounded-full text-[10px] font-mono font-bold">
                      {inProcessLoans.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#2aa198] font-mono font-bold mt-1">
                    Volume: ${calcGroupTotal(inProcessLoans).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                  {inProcessLoans.length === 0 ? (
                    <div className="p-4 text-center text-[#93a1a1] text-xs italic bg-[#002129]/40 rounded-xl">
                      No loans in underwriting review.
                    </div>
                  ) : (
                    inProcessLoans.map(renderLoanCard)
                  )}
                </div>
              </div>

              {/* Column 3: Approved */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/30 space-y-3 bg-[#073642]/50 shadow-xl">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs uppercase flex items-center space-x-1">
                      <span>3. Approved</span>
                    </span>
                    <span className="px-2 py-0.5 bg-[#002129] text-[#859900] rounded-full text-[10px] font-mono font-bold">
                      {approvedLoans.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#859900] font-mono font-bold mt-1">
                    Volume: ${calcGroupTotal(approvedLoans).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                  {approvedLoans.length === 0 ? (
                    <div className="p-4 text-center text-[#93a1a1] text-xs italic bg-[#002129]/40 rounded-xl">
                      No approved loans pending payout.
                    </div>
                  ) : (
                    approvedLoans.map(renderLoanCard)
                  )}
                </div>
              </div>

              {/* Column 4: Disbursed Active Portfolio */}
              <div className="glass-panel p-4 rounded-2xl border border-[#859900]/40 space-y-3 bg-[#073642]/70 shadow-2xl">
                <div className="pb-2 border-b border-[#859900]/30">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#859900] text-xs uppercase flex items-center space-x-1">
                      <span>4. Disbursed</span>
                    </span>
                    <span className="px-2 py-0.5 bg-[#002129] text-[#859900] rounded-full text-[10px] font-mono font-bold">
                      {disbursedLoans.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#859900] font-mono font-bold mt-1">
                    Volume: ${calcGroupTotal(disbursedLoans).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                  {disbursedLoans.length === 0 ? (
                    <div className="p-4 text-center text-[#93a1a1] text-xs italic bg-[#002129]/40 rounded-xl">
                      No disbursed loans.
                    </div>
                  ) : (
                    disbursedLoans.map(renderLoanCard)
                  )}
                </div>
              </div>

              {/* Column 5: Rejected Applications */}
              <div className="glass-panel p-4 rounded-2xl border border-red-500/30 space-y-3 bg-[#073642]/40 shadow-xl">
                <div className="pb-2 border-b border-red-500/20">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-red-400 text-xs uppercase flex items-center space-x-1">
                      <span>5. Rejected</span>
                    </span>
                    <span className="px-2 py-0.5 bg-[#002129] text-red-400 rounded-full text-[10px] font-mono font-bold">
                      {rejectedLoans.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-red-400 font-mono font-bold mt-1">
                    Volume: ${calcGroupTotal(rejectedLoans).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                  {rejectedLoans.length === 0 ? (
                    <div className="p-4 text-center text-[#93a1a1] text-xs italic bg-[#002129]/40 rounded-xl">
                      No rejected applications.
                    </div>
                  ) : (
                    rejectedLoans.map(renderLoanCard)
                  )}
                </div>
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
    </div>
  );
};

export default LoansPage;
