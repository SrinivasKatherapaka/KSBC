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
import { Landmark, Plus, Sparkles, CheckCircle2, DollarSign, Filter, LayoutGrid, List, Loader2, User, Building, Store } from 'lucide-react';

export const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('SEGREGATED');

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
      fetchData();
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
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Treasury disbursement failed');
    } finally {
      setProcessingId(null);
    }
  };

  // Segregated Loan Groups
  const appliedLoans = loans.filter((l) => l.status === 'draft');
  const inProcessLoans = loans.filter((l) => l.status === 'underwriting' || l.status === 'compliance_review');
  const approvedLoans = loans.filter((l) => l.status === 'approved');
  const disbursedLoans = loans.filter((l) => l.status === 'disbursed');
  const rejectedLoans = loans.filter((l) => l.status === 'rejected');

  const calcGroupTotal = (group) => group.reduce((sum, l) => sum + Number(l.principal_amount), 0);

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
      <div key={loan.id} className="glass-panel p-4 rounded-2xl border border-[#2aa198]/20 space-y-3 hover:border-[#ffd700]/50 transition shadow-lg bg-[#073642]/60">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="font-bold text-[#fdf6e3] text-xs sm:text-sm tracking-tight">{displayName}</h4>
            <div className="mt-1 flex items-center space-x-2">
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
              Disbursed
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
              <h1 className="text-2xl font-extrabold text-[#fdf6e3] font-heading">Commercial & Private Loans Portfolio</h1>
              <p className="text-xs text-[#2aa198]">Segregated Underwriting Lifecycle Pipeline ({loans.length} Total Applications)</p>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex bg-[#002129] p-1 rounded-xl border border-[#2aa198]/30">
                <button
                  onClick={() => setViewMode('SEGREGATED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    viewMode === 'SEGREGATED' ? 'bg-[#073642] text-[#ffd700] shadow' : 'text-[#93a1a1] hover:text-[#fdf6e3]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Segregated Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    viewMode === 'LIST' ? 'bg-[#073642] text-[#ffd700] shadow' : 'text-[#93a1a1] hover:text-[#fdf6e3]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Full Pipeline List</span>
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#b58900] via-[#d4af37] to-[#b58900] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] text-xs font-black rounded-xl shadow-lg shadow-amber-950/40 transition flex items-center space-x-2 border border-[#ffd700]/50"
              >
                <Plus className="w-4 h-4 text-[#002b36]" />
                <span>Intake Loan Application</span>
              </button>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Loading segregated commercial loan pipeline..." />
          ) : viewMode === 'SEGREGATED' ? (
            /* Segregated Columns Layout (5 Segregated Columns) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              {/* Column 1: Applied / Draft */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/20 space-y-3 bg-[#073642]/50">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#fdf6e3] text-xs uppercase tracking-wider">1. Applied</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#002129] text-[#2aa198] font-bold">{appliedLoans.length}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#ffd700] font-bold block mt-1">
                    Total: ${calcGroupTotal(appliedLoans).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {appliedLoans.map(renderLoanCard)}
                </div>
              </div>

              {/* Column 2: In Process */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/20 space-y-3 bg-[#073642]/50">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#ffd700] text-xs uppercase tracking-wider">2. In Process</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] font-bold">{inProcessLoans.length}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#ffd700] font-bold block mt-1">
                    Total: ${calcGroupTotal(inProcessLoans).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {inProcessLoans.map(renderLoanCard)}
                </div>
              </div>

              {/* Column 3: Approved */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/20 space-y-3 bg-[#073642]/50">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#2aa198] text-xs uppercase tracking-wider">3. Approved</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2aa198]/20 text-[#2aa198] font-bold">{approvedLoans.length}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#2aa198] font-bold block mt-1">
                    Total: ${calcGroupTotal(approvedLoans).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {approvedLoans.map(renderLoanCard)}
                </div>
              </div>

              {/* Column 4: Disbursed */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/20 space-y-3 bg-[#073642]/50">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#859900] text-xs uppercase tracking-wider">4. Disbursed</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#859900]/20 text-[#859900] font-bold">{disbursedLoans.length}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#859900] font-bold block mt-1">
                    Total: ${calcGroupTotal(disbursedLoans).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {disbursedLoans.map(renderLoanCard)}
                </div>
              </div>

              {/* Column 5: Rejected */}
              <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/20 space-y-3 bg-[#073642]/50">
                <div className="pb-2 border-b border-[#2aa198]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-400 text-xs uppercase tracking-wider">5. Rejected</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">{rejectedLoans.length}</span>
                  </div>
                  <span className="text-[10px] font-mono text-red-400 font-bold block mt-1">
                    Total: ${calcGroupTotal(rejectedLoans).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {rejectedLoans.map(renderLoanCard)}
                </div>
              </div>
            </div>
          ) : (
            /* Full List View */
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="glass-panel p-6 rounded-2xl border border-[#2aa198]/20 space-y-4 bg-[#073642]/60">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base font-bold text-[#fdf6e3]">
                        {loan.applicant_name || (loan.customer ? `${loan.customer.first_name} ${loan.customer.last_name}` : 'Applicant')}
                      </h3>
                      {renderCategoryBadge(loan.applicant_category || loan.customer?.client_category)}
                      <RiskAssessmentBadge score={loan.risk_score} level={loan.ai_risk_assessment?.riskLevel} />
                    </div>
                    <span className="font-mono font-bold text-[#ffd700] text-lg">${Number(loan.principal_amount).toLocaleString()}</span>
                  </div>
                  <LoanLifecycleTracker currentStatus={loan.status} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <LoanApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customers={customers}
        onSubmit={handleCreateLoan}
      />
    </div>
  );
};
export default LoansPage;
