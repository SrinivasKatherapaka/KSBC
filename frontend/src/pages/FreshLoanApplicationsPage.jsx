import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import RiskAssessmentBadge from '../components/loans/RiskAssessmentBadge';
import LoanDetailsModal from '../components/loans/LoanDetailsModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Landmark, Plus, Sparkles, CheckCircle2, DollarSign, Filter, LayoutGrid, List,
  Loader2, User, Building, Store, Trash2, Edit, Search, CheckSquare, Square,
  X, Check, Download, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, FileText,
  Clock, PauseCircle, XCircle, ShieldAlert, ArrowUpRight, HelpCircle, FileCheck,
  TrendingUp, BarChart2, CheckCheck, AlertOctagon, Layers, Database, Eye
} from 'lucide-react';

export const FreshLoanApplicationsPage = () => {
  const { user } = useAuth();
  
  // Navigation & Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState('intake'); // 'intake' | 'queue' | 'audit'

  // Data States
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // Selected Loan for Full Details Modal
  const [selectedDetailLoan, setSelectedDetailLoan] = useState(null);

  // Intake Form Inputs
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [applicantName, setApplicantName] = useState('Katherapaka Srinivas');
  const [applicantCategory, setApplicantCategory] = useState('corporate');
  const [accountNumber, setAccountNumber] = useState('KSBC-CORP-90048192');
  const [nationalId, setNationalId] = useState('US-EIN-8800412');
  const [principalAmount, setPrincipalAmount] = useState('3500000');
  const [interestRate, setInterestRate] = useState('6.25');
  const [termMonths, setTermMonths] = useState('36');
  const [purpose, setPurpose] = useState('Commercial Real Estate Acquisition');
  const [annualRevenue, setAnnualRevenue] = useState('12000000');
  const [creditScore, setCreditScore] = useState('740');
  const [collateralValue, setCollateralValue] = useState('4500000');
  const [initialAction, setInitialAction] = useState('underwriting'); // 'underwriting' | 'approved' | 'on_hold' | 'rejected'
  const [decisionNotes, setDecisionNotes] = useState('');

  // Queue Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [viewLayout, setViewLayout] = useState('cards'); // 'cards' | 'table'

  // Action Modal State for Quick Outcome Decisions in Queue
  const [actionModalLoan, setActionModalLoan] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approved' | 'on_hold' | 'rejected'
  const [actionReason, setActionReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);

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
      setError('Failed to fetch loan intake records and customer repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Customer Selection in Intake Form
  const handleCustomerSelect = (id) => {
    setSelectedCustomerId(id);
    if (!id) return;
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setApplicantName(`${cust.first_name} ${cust.last_name}`.trim());
      setApplicantCategory(cust.client_category || 'corporate');
      setAccountNumber(cust.account_number || '');
      setNationalId(cust.national_id || '');
      if (cust.annual_revenue) {
        setAnnualRevenue(String(cust.annual_revenue));
      }
    }
  };

  // Real-Time Dynamic Risk Calculation (Computed live on client + synced with server formula)
  const liveRiskCalculation = useMemo(() => {
    const principal = Number(principalAmount) || 0;
    const revenue = Number(annualRevenue) || 1;
    const score = Number(creditScore) || 700;
    const collateral = Number(collateralValue) || (principal * 1.25);
    const rate = Number(interestRate) || 6.0;
    const term = Number(termMonths) || 36;

    const monthlyRate = (rate / 100) / 12;
    const monthlyPayment = term > 0 && principal > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)
      : (principal / Math.max(term, 1));
    const monthlyRevenue = revenue / 12;
    const dtiRatio = Number((monthlyPayment / Math.max(monthlyRevenue, 1)).toFixed(3));
    const collateralRatio = principal > 0 ? Number((collateral / principal).toFixed(2)) : 1.25;

    let baseScore = 20;
    if (dtiRatio > 0.5) baseScore += 35;
    else if (dtiRatio > 0.35) baseScore += 20;
    else if (dtiRatio > 0.2) baseScore += 10;
    else baseScore += 2;

    if (score < 620) baseScore += 30;
    else if (score < 680) baseScore += 18;
    else if (score < 740) baseScore += 8;
    else baseScore -= 10;

    if (collateralRatio < 1.0) baseScore += 20;
    else if (collateralRatio >= 1.5) baseScore -= 10;

    if (principal > 10000000) baseScore += 15;
    else if (principal > 5000000) baseScore += 8;

    const calculatedScore = Math.min(Math.max(Math.round(baseScore), 8), 96);

    let riskLevel = 'LOW';
    let recommendation = 'APPROVE';
    let riskColor = 'text-emerald-400';
    let riskBg = 'bg-emerald-500/10 border-emerald-500/30';

    if (calculatedScore > 70) {
      riskLevel = 'HIGH';
      recommendation = 'REJECT';
      riskColor = 'text-red-400';
      riskBg = 'bg-red-500/10 border-red-500/30';
    } else if (calculatedScore > 40) {
      riskLevel = 'MODERATE';
      recommendation = 'CONDITIONAL_APPROVE';
      riskColor = 'text-[#dfbd84]';
      riskBg = 'bg-[#dfbd84]/10 border-[#dfbd84]/30';
    }

    const defaultProb = Number((calculatedScore * 0.26).toFixed(1));
    const maxRecommended = Math.round(revenue * 0.42);

    return {
      riskScore: calculatedScore,
      riskLevel,
      recommendation,
      riskColor,
      riskBg,
      dtiRatio,
      collateralRatio,
      monthlyPayment: Math.round(monthlyPayment),
      defaultProbability: defaultProb,
      maxRecommendedLoan: maxRecommended,
      keyRisks: [
        dtiRatio > 0.38 ? `High Monthly Debt Burden (${(dtiRatio * 100).toFixed(1)}% of Revenue)` : `Macroeconomic Rate Sensitivity at ${rate}%`,
        collateralRatio < 1.1 ? `Low Collateral Coverage (${(collateralRatio * 100).toFixed(0)}%)` : `Term Duration Concentration (${term} Months)`
      ],
      mitigatingFactors: [
        score >= 720 ? `High Institutional Credit Score (${score})` : `Established KSBC Banking Profile`,
        collateralRatio >= 1.2 ? `Solid Asset Collateral Buffer ($${collateral.toLocaleString()})` : `Verified Account Inflows`
      ]
    };
  }, [principalAmount, annualRevenue, creditScore, collateralValue, interestRate, termMonths]);

  // Submit Fresh Loan Application Intake
  const handleSubmitIntake = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!applicantName.trim()) {
      setError('Please provide an Applicant or Entity Name.');
      return;
    }
    if (Number(principalAmount) <= 0) {
      setError('Principal amount must be a positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId || undefined,
        applicantName: applicantName.trim(),
        applicantCategory,
        principalAmount: Number(principalAmount),
        interestRate: Number(interestRate),
        termMonths: Number(termMonths),
        purpose,
        status: initialAction,
        actionTaken: initialAction,
        annualRevenue: Number(annualRevenue),
        creditScore: Number(creditScore),
        collateralValue: Number(collateralValue),
        dtiRatio: liveRiskCalculation.dtiRatio,
        decisionNotes: decisionNotes.trim() || `Intake submitted with initial action: ${initialAction.toUpperCase()}. Risk Score: ${liveRiskCalculation.riskScore}/100.`
      };

      const res = await apiClient.post('/loans', payload);

      if (res.data?.success) {
        setSuccessMsg(`🎉 Fresh Loan Application #${(res.data.loan?.id || '').slice(0, 8)} registered successfully with AI Risk Score: ${res.data.loan?.risk_score || liveRiskCalculation.riskScore}/100!`);
        fetchData();
        setDecisionNotes('');
        setTimeout(() => {
          setSuccessMsg('');
          setActiveSubTab('queue'); // Jump to queue sub-tab
        }, 1800);
      }
    } catch (err) {
      console.error('Loan submit error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to register loan application');
    } finally {
      setSubmitting(false);
    }
  };

  // Execute Outcome Action (Approved, On Hold, Rejected)
  const handleExecuteOutcomeAction = async (loanId, targetStatus, reasonText) => {
    if (!loanId) return;
    setProcessingId(loanId);
    setActionProcessing(true);

    try {
      const res = await apiClient.patch(`/loans/${loanId}/status`, {
        status: targetStatus,
        action: targetStatus,
        notes: reasonText || `Action executed: ${targetStatus.toUpperCase()} by Underwriting Officer`
      });

      if (res.data?.success) {
        setSuccessMsg(`✅ Action Recorded: Loan #${loanId.slice(0, 8)} status set to "${targetStatus.toUpperCase()}".`);
        setActionModalLoan(null);
        setActionReason('');
        fetchData();
        if (selectedDetailLoan && selectedDetailLoan.id === loanId) {
          setSelectedDetailLoan(res.data.loan || { ...selectedDetailLoan, status: targetStatus, decision_notes: reasonText });
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update loan outcome action');
    } finally {
      setProcessingId(null);
      setActionProcessing(false);
    }
  };

  // Re-Assess AI Risk with Gemini
  const handleAssessAiRisk = async (loanId) => {
    if (!loanId) return;
    setProcessingId(loanId);
    try {
      const res = await apiClient.post(`/loans/${loanId}/assess-risk`);
      if (res.data?.success) {
        setSuccessMsg(`⚡ Gemini AI Risk Engine updated score for Loan #${loanId.slice(0, 8)} to ${res.data.riskAssessment?.riskScore}/100!`);
        fetchData();
        if (selectedDetailLoan && selectedDetailLoan.id === loanId) {
          setSelectedDetailLoan({
            ...selectedDetailLoan,
            risk_score: res.data.riskAssessment?.riskScore,
            ai_risk_assessment: res.data.riskAssessment
          });
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run AI risk assessment');
    } finally {
      setProcessingId(null);
    }
  };

  // Single Delete Record
  const handleDeleteLoan = async (loanId, name) => {
    if (!window.confirm(`Are you sure you want to delete loan record #${loanId.slice(0, 8)} for "${name}"?`)) return;
    setProcessingId(loanId);
    try {
      const res = await apiClient.delete(`/loans/${loanId}`);
      if (res.data?.success) {
        setSuccessMsg(`🗑️ Loan record #${loanId.slice(0, 8)} deleted successfully.`);
        if (selectedDetailLoan && selectedDetailLoan.id === loanId) {
          setSelectedDetailLoan(null);
        }
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete loan record');
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered Queue Loans
  const filteredQueueLoans = useMemo(() => {
    return loans.filter((l) => {
      if (!l) return false;
      const name = (l.applicant_name || (l.customer ? `${l.customer.first_name || ''} ${l.customer.last_name || ''}` : '')).toLowerCase();
      const idStr = (l.id || '').toLowerCase();
      const purposeText = (l.purpose || '').toLowerCase();
      const accNum = (l.customer?.account_number || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesQuery = !q || name.includes(q) || idStr.includes(q) || purposeText.includes(q) || accNum.includes(q);
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter || (statusFilter === 'fresh' && (l.status === 'draft' || l.status === 'applied' || l.status === 'underwriting'));
      const matchesCategory = categoryFilter === 'all' || (l.applicant_category || l.customer?.client_category || 'corporate') === categoryFilter;
      
      let matchesRisk = true;
      const score = Number(l.risk_score || 35);
      if (riskFilter === 'low') matchesRisk = score <= 40;
      else if (riskFilter === 'moderate') matchesRisk = score > 40 && score <= 70;
      else if (riskFilter === 'high') matchesRisk = score > 70;

      return matchesQuery && matchesStatus && matchesCategory && matchesRisk;
    });
  }, [loans, searchQuery, statusFilter, categoryFilter, riskFilter]);

  // Statistics for Audit & Metric Highlights
  const auditMetrics = useMemo(() => {
    const totalCount = loans.length;
    const totalVolume = loans.reduce((acc, l) => acc + Number(l.principal_amount || 0), 0);
    const approvedList = loans.filter(l => l.status === 'approved' || l.status === 'disbursed');
    const onHoldList = loans.filter(l => l.status === 'on_hold' || l.status === 'onhold');
    const rejectedList = loans.filter(l => l.status === 'rejected');
    const underwritingList = loans.filter(l => l.status === 'underwriting' || l.status === 'draft' || l.status === 'applied');

    return {
      totalCount,
      totalVolume,
      approvedCount: approvedList.length,
      approvedVolume: approvedList.reduce((acc, l) => acc + Number(l.principal_amount || 0), 0),
      onHoldCount: onHoldList.length,
      onHoldVolume: onHoldList.reduce((acc, l) => acc + Number(l.principal_amount || 0), 0),
      rejectedCount: rejectedList.length,
      rejectedVolume: rejectedList.reduce((acc, l) => acc + Number(l.principal_amount || 0), 0),
      underwritingCount: underwritingList.length,
      underwritingVolume: underwritingList.reduce((acc, l) => acc + Number(l.principal_amount || 0), 0)
    };
  }, [loans]);

  // Render Category Tag
  const renderCategoryBadge = (cat) => {
    if (cat === 'private_individual' || cat === 'private_savings') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">👤 Private Account</span>;
    }
    if (cat === 'hnwi') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">👑 HNWI Wealth</span>;
    }
    if (cat === 'sme') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#20302f] text-[#dfbd84] border border-[#dfbd84]/30">🏬 SME Business</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#20302f] text-[#dfbd84] border border-[#dfbd84]/30">🏢 Corporate</span>;
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#58b388]/20 text-[#58b388] border border-[#58b388]/40">✓ APPROVED</span>;
      case 'on_hold':
      case 'onhold':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">⏳ ON HOLD</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/40">✕ REJECTED</span>;
      case 'disbursed':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">💰 DISBURSED</span>;
      case 'underwriting':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#dfbd84]/20 text-[#dfbd84] border border-[#dfbd84]/40">⚙️ UNDERWRITING</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40">📝 FRESH INTAKE</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#1b2827] text-[#a4b8b5]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#20302f] text-[#dfbd84] rounded-xl border border-[#dfbd84]/30 shadow-md">
                  <FileCheck className="w-6 h-6 text-[#dfbd84]" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-[#f4eee2] font-heading flex items-center space-x-2">
                    <span>Fresh Loan Applications & Intake Studio</span>
                    <span className="px-2 py-0.5 bg-[#dfbd84] text-[#1b2827] rounded-md text-[10px] font-black uppercase tracking-wider">
                      Live AI Risk Engine
                    </span>
                  </h1>
                  <p className="text-xs text-[#dfbd84]">
                    Real-time algorithmic risk calculation, dynamic underwriting decisioning & instant outcome action triggers
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/loans?view=SEGREGATED"
                className="px-3.5 py-2 bg-[#182423] border border-[#dfbd84]/30 text-[#dfbd84] hover:text-[#f4eee2] text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Kanban Pipeline</span>
              </Link>
              <Link
                to="/loans-database"
                className="px-3.5 py-2 bg-[#182423] border border-[#dfbd84]/30 text-[#dfbd84] hover:text-[#f4eee2] text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                <Database className="w-4 h-4" />
                <span>Master Database</span>
              </Link>
            </div>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex items-center space-x-2 border-b border-[#dfbd84]/20 pb-3">
            <button
              onClick={() => setActiveSubTab('intake')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
                activeSubTab === 'intake'
                  ? 'bg-gradient-to-r from-[#c59e5f] via-[#dfbd84] to-[#c59e5f] text-[#1b2827] shadow-lg shadow-[#182423]/40 border border-[#dfbd84]'
                  : 'bg-[#20302f]/70 text-[#a4b8b5] hover:text-[#f4eee2] hover:bg-[#20302f] border border-transparent'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>📝 Intake Application & Live Risk</span>
            </button>

            <button
              onClick={() => setActiveSubTab('queue')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
                activeSubTab === 'queue'
                  ? 'bg-gradient-to-r from-[#c59e5f] via-[#dfbd84] to-[#c59e5f] text-[#1b2827] shadow-lg shadow-[#182423]/40 border border-[#dfbd84]'
                  : 'bg-[#20302f]/70 text-[#a4b8b5] hover:text-[#f4eee2] hover:bg-[#20302f] border border-transparent'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>⚡ Fresh Applications Queue</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#182423] text-[#dfbd84] text-[10px] font-mono font-bold">
                {loans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center space-x-2 cursor-pointer ${
                activeSubTab === 'audit'
                  ? 'bg-gradient-to-r from-[#c59e5f] via-[#dfbd84] to-[#c59e5f] text-[#1b2827] shadow-lg shadow-[#182423]/40 border border-[#dfbd84]'
                  : 'bg-[#20302f]/70 text-[#a4b8b5] hover:text-[#f4eee2] hover:bg-[#20302f] border border-transparent'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>📊 Decisioned Outcomes & Action Audit</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {successMsg && (
            <div className="p-4 bg-[#58b388]/20 border border-[#58b388]/50 rounded-2xl text-xs text-[#58b388] font-bold flex items-center justify-between shadow-lg">
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{successMsg}</span>
              </span>
              <button onClick={() => setSuccessMsg('')} className="text-[#58b388] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* ========================================================================= */}
          {/* SUB-TAB 1: INTAKE APPLICATION WITH LIVE RISK PREVIEW */}
          {/* ========================================================================= */}
          {activeSubTab === 'intake' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Intake Form */}
              <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-[#dfbd84]/30 space-y-5 bg-[#20302f]/60 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#dfbd84]/20">
                  <div>
                    <h3 className="font-extrabold text-[#f4eee2] text-base flex items-center space-x-2">
                      <span>Commercial & Private Loan Intake Form</span>
                    </h3>
                    <p className="text-xs text-[#dfbd84]">
                      Enter applicant details and loan specifications to calculate credit metrics
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#dfbd84] bg-[#182423] px-2.5 py-1 rounded-lg border border-[#dfbd84]/30">
                    Step 1 of 1: Intake & Action
                  </span>
                </div>

                <form onSubmit={handleSubmitIntake} className="space-y-4 text-xs">
                  {/* Account Selector Preset */}
                  <div className="p-3 bg-[#182423]/90 rounded-xl border border-[#dfbd84]/30 space-y-2">
                    <label className="block text-[11px] font-bold text-[#dfbd84] uppercase tracking-wider">
                      Select Existing Onboarded Account (Optional Auto-Fill)
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      className="w-full glass-input bg-[#1b2827] text-[#f4eee2] rounded-xl p-2.5 font-medium"
                    >
                      <option value="">-- Choose Account ({customers.length} Seeded Accounts) or Enter Custom Below --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.first_name} {c.last_name} ({c.client_category || 'account'}) - {c.account_number || c.national_id} [Balance: ${Number(c.annual_revenue || 0).toLocaleString()}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Applicant Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#f4eee2] mb-1">
                        Applicant / Legal Entity Name *
                      </label>
                      <input
                        type="text"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="e.g. Srinivas Katherapaka or Apex Corporation"
                        className="w-full glass-input bg-[#182423] text-white rounded-xl p-2.5"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#f4eee2] mb-1">
                        Applicant Category *
                      </label>
                      <select
                        value={applicantCategory}
                        onChange={(e) => setApplicantCategory(e.target.value)}
                        className="w-full glass-input bg-[#182423] text-white rounded-xl p-2.5 font-medium"
                      >
                        <option value="corporate">🏢 Corporate / Enterprise Commercial</option>
                        <option value="sme">🏬 SME / Small Business Commercial</option>
                        <option value="private_individual">👤 Private Savings / Standard Individual</option>
                        <option value="hnwi">👑 High Net-Worth Individual (HNWI)</option>
                        <option value="institutional">🏛️ Institutional & Sovereign Credit</option>
                      </select>
                    </div>
                  </div>

                  {/* Loan Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-[#f4eee2] mb-1">
                        Principal Amount ($) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-[#dfbd84] font-bold">$</span>
                        <input
                          type="number"
                          min="1000"
                          max="100000000"
                          value={principalAmount}
                          onChange={(e) => setPrincipalAmount(e.target.value)}
                          className="w-full glass-input bg-[#182423] text-white rounded-xl p-2.5 pl-7 font-mono font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#f4eee2] mb-1">
                        Interest Rate (%) *
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        max="30"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="w-full glass-input bg-[#182423] text-white rounded-xl p-2.5 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#f4eee2] mb-1">
                        Term Length (Months) *
                      </label>
                      <select
                        value={termMonths}
                        onChange={(e) => setTermMonths(e.target.value)}
                        className="w-full glass-input bg-[#182423] text-white rounded-xl p-2.5 font-medium"
                      >
                        <option value="12">12 Months (1 Year)</option>
                        <option value="24">24 Months (2 Years)</option>
                        <option value="36">36 Months (3 Years)</option>
                        <option value="60">60 Months (5 Years)</option>
                        <option value="120">120 Months (10 Years)</option>
                        <option value="240">240 Months (20 Years)</option>
                      </select>
                    </div>
                  </div>

                  {/* Loan Purpose */}
                  <div>
                    <label className="block font-bold text-[#f4eee2] mb-1">
                      Loan Purpose / Utilization Facility *
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full glass-input bg-[#182423] text-white rounded-xl p-2.5 font-medium"
                    >
                      <option value="Working Capital Expansion">Working Capital Expansion</option>
                      <option value="Equipment Purchase & Automation">Equipment Purchase & Automation</option>
                      <option value="Commercial Real Estate Acquisition">Commercial Real Estate Acquisition</option>
                      <option value="Debt Refinancing & Consolidation">Debt Refinancing & Consolidation</option>
                      <option value="Personal Wealth Portfolio Scaling">Personal Wealth Portfolio Scaling</option>
                      <option value="R&D Facility Upgrade">R&D Facility Upgrade</option>
                    </select>
                  </div>

                  {/* Financial Parameters for Risk Calculation */}
                  <div className="p-3.5 bg-[#182423]/70 rounded-xl border border-[#dfbd84]/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#dfbd84] uppercase tracking-wider flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#dfbd84]" />
                        <span>Applicant Financial Verification Telemetry</span>
                      </span>
                      <span className="text-[10px] text-[#a4b8b5]">Used for Live Risk Engine</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#a4b8b5] font-semibold mb-1">
                          Annual Revenue / Income ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={annualRevenue}
                          onChange={(e) => setAnnualRevenue(e.target.value)}
                          className="w-full glass-input bg-[#1b2827] text-white rounded-lg p-2 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#a4b8b5] font-semibold mb-1">
                          Credit Score (300 - 850)
                        </label>
                        <input
                          type="number"
                          min="300"
                          max="850"
                          value={creditScore}
                          onChange={(e) => setCreditScore(e.target.value)}
                          className="w-full glass-input bg-[#1b2827] text-white rounded-lg p-2 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#a4b8b5] font-semibold mb-1">
                          Collateral Value ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={collateralValue}
                          onChange={(e) => setCollateralValue(e.target.value)}
                          className="w-full glass-input bg-[#1b2827] text-white rounded-lg p-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Initial Action Outcome Selector */}
                  <div className="p-4 bg-[#273a39]/70 rounded-2xl border border-[#dfbd84]/40 space-y-3">
                    <label className="block font-bold text-[#dfbd84] text-xs uppercase tracking-wider flex items-center justify-between">
                      <span>Immediate Action Outcome On Registration</span>
                      <span className="text-[10px] font-normal text-[#f4eee2]">Choose initial underwriting state</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setInitialAction('underwriting')}
                        className={`p-2.5 rounded-xl border text-center font-extrabold text-[11px] transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                          initialAction === 'underwriting'
                            ? 'bg-[#dfbd84] text-[#1b2827] border-[#dfbd84] shadow-md'
                            : 'bg-[#182423] text-[#a4b8b5] border-[#dfbd84]/25 hover:text-white'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>Queue Underwrite</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInitialAction('approved')}
                        className={`p-2.5 rounded-xl border text-center font-extrabold text-[11px] transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                          initialAction === 'approved'
                            ? 'bg-[#58b388] text-[#1b2827] border-[#58b388] shadow-md'
                            : 'bg-[#182423] text-[#a4b8b5] border-[#dfbd84]/25 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Fast-Track Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInitialAction('on_hold')}
                        className={`p-2.5 rounded-xl border text-center font-extrabold text-[11px] transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                          initialAction === 'on_hold'
                            ? 'bg-amber-500 text-[#1b2827] border-amber-500 shadow-md'
                            : 'bg-[#182423] text-[#a4b8b5] border-[#dfbd84]/25 hover:text-white'
                        }`}
                      >
                        <PauseCircle className="w-4 h-4" />
                        <span>Place On Hold</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInitialAction('rejected')}
                        className={`p-2.5 rounded-xl border text-center font-extrabold text-[11px] transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                          initialAction === 'rejected'
                            ? 'bg-red-500 text-white border-red-500 shadow-md'
                            : 'bg-[#182423] text-[#a4b8b5] border-[#dfbd84]/25 hover:text-white'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Direct Reject</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#a4b8b5] font-semibold mb-1">
                        Underwriting Decision Notes / Hold Reason
                      </label>
                      <input
                        type="text"
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        placeholder="e.g. Cleared automated risk baseline; awaiting collateral deed filing."
                        className="w-full glass-input bg-[#182423] text-white rounded-lg p-2"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end space-x-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#c59e5f] via-[#dfbd84] to-[#c59e5f] hover:from-[#dfbd84] hover:to-[#eed29e] text-[#1b2827] text-xs font-black rounded-xl shadow-xl shadow-[#182423]/50 transition disabled:opacity-50 border border-[#dfbd84]/60 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#1b2827]" />
                          <span>Registering Fresh Loan Application...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#1b2827]" />
                          <span>Register Loan with Live AI Risk ({liveRiskCalculation.riskScore}/100)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live AI Risk Calculation Preview Panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="glass-panel p-6 rounded-2xl border border-[#dfbd84]/40 bg-[#20302f]/80 shadow-2xl space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-[#dfbd84]/20">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-[#182423] text-[#dfbd84] rounded-xl border border-[#dfbd84]/30">
                        <Sparkles className="w-5 h-5 text-[#dfbd84]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#f4eee2] text-sm">Calculated Risk Engine Output</h4>
                        <p className="text-[10px] text-[#dfbd84]">Real-time underwriting analysis</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#182423] text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                      LIVE COMPUTED
                    </span>
                  </div>

                  {/* Main Score Gauge */}
                  <div className="p-4 bg-[#182423] rounded-2xl border border-[#dfbd84]/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#a4b8b5] font-bold uppercase tracking-wider block">
                        CALCULATED RISK SCORE
                      </span>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className={`text-4xl font-black font-mono ${liveRiskCalculation.riskColor}`}>
                          {liveRiskCalculation.riskScore}
                        </span>
                        <span className="text-sm text-[#a4b8b5] font-mono">/ 100</span>
                      </div>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${liveRiskCalculation.riskBg} ${liveRiskCalculation.riskColor}`}>
                        {liveRiskCalculation.riskLevel} RISK LEVEL
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-[#a4b8b5] font-bold uppercase tracking-wider block">
                        AI RECOMMENDATION
                      </span>
                      <span className={`text-xs font-black px-3 py-1 rounded-xl uppercase inline-block ${
                        liveRiskCalculation.recommendation === 'APPROVE'
                          ? 'bg-[#58b388]/20 text-[#58b388] border border-[#58b388]/40'
                          : liveRiskCalculation.recommendation === 'REJECT'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-[#dfbd84]/20 text-[#dfbd84] border border-[#dfbd84]/40'
                      }`}>
                        {liveRiskCalculation.recommendation}
                      </span>
                      <p className="text-[9px] text-[#a4b8b5] font-mono">
                        Default Prob: {liveRiskCalculation.defaultProbability}%
                      </p>
                    </div>
                  </div>

                  {/* Metric Chips */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#182423]/80 rounded-xl border border-[#dfbd84]/20">
                      <span className="text-[9px] text-[#a4b8b5] block">DEBT-TO-INCOME (DTI)</span>
                      <span className="text-sm font-extrabold text-[#f4eee2] font-mono">
                        {(liveRiskCalculation.dtiRatio * 100).toFixed(1)}%
                      </span>
                      <span className="text-[9px] text-[#dfbd84] block mt-0.5">
                        ${liveRiskCalculation.monthlyPayment.toLocaleString()}/mo
                      </span>
                    </div>

                    <div className="p-3 bg-[#182423]/80 rounded-xl border border-[#dfbd84]/20">
                      <span className="text-[9px] text-[#a4b8b5] block">COLLATERAL COVERAGE</span>
                      <span className="text-sm font-extrabold text-[#f4eee2] font-mono">
                        {(liveRiskCalculation.collateralRatio * 100).toFixed(0)}%
                      </span>
                      <span className="text-[9px] text-[#dfbd84] block mt-0.5">
                        ${Number(collateralValue || 0).toLocaleString()} Asset
                      </span>
                    </div>

                    <div className="p-3 bg-[#182423]/80 rounded-xl border border-[#dfbd84]/20">
                      <span className="text-[9px] text-[#a4b8b5] block">MAX RECOMMENDED LOAN</span>
                      <span className="text-sm font-extrabold text-[#58b388] font-mono">
                        ${liveRiskCalculation.maxRecommendedLoan.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-[#a4b8b5] block mt-0.5">42% Revenue Cap</span>
                    </div>

                    <div className="p-3 bg-[#182423]/80 rounded-xl border border-[#dfbd84]/20">
                      <span className="text-[9px] text-[#a4b8b5] block">REQUEST RATIO</span>
                      <span className="text-sm font-extrabold text-[#dfbd84] font-mono">
                        {((Number(principalAmount) / Math.max(Number(annualRevenue), 1)) * 100).toFixed(1)}%
                      </span>
                      <span className="text-[9px] text-[#a4b8b5] block mt-0.5">Principal / Revenue</span>
                    </div>
                  </div>

                  {/* Key Risks & Mitigations */}
                  <div className="space-y-2 pt-2 border-t border-[#dfbd84]/20">
                    <h5 className="text-[11px] font-bold text-[#dfbd84] uppercase tracking-wider">
                      Identified Risk & Mitigating Strengths
                    </h5>
                    
                    <div className="space-y-1.5">
                      {liveRiskCalculation.keyRisks.map((risk, i) => (
                        <div key={i} className="flex items-start space-x-2 text-[11px] text-red-300/90 bg-red-950/20 p-2 rounded-lg border border-red-500/20">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                          <span>{risk}</span>
                        </div>
                      ))}
                      {liveRiskCalculation.mitigatingFactors.map((factor, i) => (
                        <div key={i} className="flex items-start space-x-2 text-[11px] text-[#58b388] bg-emerald-950/20 p-2 rounded-lg border border-[#58b388]/20">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#58b388] flex-shrink-0 mt-0.5" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 2: FRESH APPLICATIONS QUEUE WITH ACTION TRIGGERS */}
          {/* ========================================================================= */}
          {activeSubTab === 'queue' && (
            <div className="space-y-4">
              {/* Queue Controls & Filters */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#182423] p-4 rounded-2xl border border-[#dfbd84]/30 shadow-lg">
                <div className="flex items-center space-x-2 w-full md:w-96">
                  <Search className="w-4 h-4 text-[#dfbd84]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Fresh Applications by Name, ID, Purpose..."
                    className="w-full bg-transparent text-xs text-[#f4eee2] placeholder-[#a4b8b5] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#20302f] text-[#f4eee2] border border-[#dfbd84]/40 rounded-lg p-2 font-semibold cursor-pointer text-xs"
                  >
                    <option value="all">All Statuses ({loans.length})</option>
                    <option value="fresh">Fresh Intake / Underwriting</option>
                    <option value="on_hold">On Hold</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="disbursed">Disbursed</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#20302f] text-[#f4eee2] border border-[#dfbd84]/40 rounded-lg p-2 font-semibold cursor-pointer text-xs"
                  >
                    <option value="all">All Categories</option>
                    <option value="corporate">Corporate</option>
                    <option value="sme">SME Business</option>
                    <option value="private_individual">Private Account</option>
                    <option value="hnwi">HNWI Wealth</option>
                  </select>

                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="bg-[#20302f] text-[#f4eee2] border border-[#dfbd84]/40 rounded-lg p-2 font-semibold cursor-pointer text-xs"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low Risk (≤40)</option>
                    <option value="moderate">Moderate Risk (41-70)</option>
                    <option value="high">High Risk (&gt;70)</option>
                  </select>

                  <div className="flex items-center space-x-1 bg-[#20302f] p-1 rounded-lg border border-[#dfbd84]/30">
                    <button
                      onClick={() => setViewLayout('cards')}
                      className={`p-1.5 rounded cursor-pointer ${viewLayout === 'cards' ? 'bg-[#dfbd84] text-[#1b2827]' : 'text-[#a4b8b5]'}`}
                      title="Card Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewLayout('table')}
                      className={`p-1.5 rounded cursor-pointer ${viewLayout === 'table' ? 'bg-[#dfbd84] text-[#1b2827]' : 'text-[#a4b8b5]'}`}
                      title="Table List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <LoadingSpinner text="Loading Fresh Applications Intake Queue..." />
              ) : filteredQueueLoans.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl border border-[#dfbd84]/30 bg-[#20302f]/40 space-y-3">
                  <FileText className="w-12 h-12 text-[#dfbd84]/50 mx-auto" />
                  <h4 className="text-base font-bold text-[#f4eee2]">No Loan Applications Match Filters</h4>
                  <p className="text-xs text-[#a4b8b5]">Try adjusting your search criteria or register a new loan application in the Intake tab.</p>
                  <button
                    onClick={() => setActiveSubTab('intake')}
                    className="px-4 py-2 bg-[#dfbd84] text-[#1b2827] font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Intake Fresh Loan Now
                  </button>
                </div>
              ) : viewLayout === 'cards' ? (
                /* Card Layout */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredQueueLoans.map((loan) => {
                    const idStr = (loan.id || 'c0000000').slice(0, 8);
                    const displayName = loan.applicant_name || (loan.customer ? `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim() : 'Applicant');
                    const category = loan.applicant_category || loan.customer?.client_category || 'corporate';
                    const score = Number(loan.risk_score || 35);

                    return (
                      <div
                        key={loan.id}
                        className="glass-panel p-4 rounded-2xl border border-[#dfbd84]/30 space-y-3 bg-[#20302f]/60 hover:border-[#dfbd84]/60 transition shadow-xl relative flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <button
                                onClick={() => setSelectedDetailLoan(loan)}
                                className="font-extrabold text-[#f4eee2] hover:text-[#dfbd84] text-sm text-left line-clamp-1 cursor-pointer transition"
                                title="Click to view full loan details modal"
                              >
                                {displayName}
                              </button>
                              <div className="flex items-center space-x-1.5 mt-1">
                                {renderCategoryBadge(category)}
                                <button
                                  onClick={() => setSelectedDetailLoan(loan)}
                                  className="text-[10px] text-[#dfbd84] hover:text-[#eed29e] hover:underline font-mono font-bold flex items-center space-x-1 cursor-pointer group"
                                  title="Click to view full loan details modal"
                                >
                                  <span>#{idStr}</span>
                                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition" />
                                </button>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              {renderStatusBadge(loan.status)}
                              <div className="mt-1">
                                <RiskAssessmentBadge score={score} level={loan.ai_risk_assessment?.riskLevel} />
                              </div>
                            </div>
                          </div>

                          {/* Loan Numbers Box */}
                          <div className="mt-3 p-2.5 bg-[#182423]/90 rounded-xl border border-[#dfbd84]/25 font-mono text-xs flex justify-between">
                            <div>
                              <span className="text-[9px] text-[#a4b8b5] font-sans block">PRINCIPAL</span>
                              <span className="font-extrabold text-[#dfbd84] text-sm">
                                ${Number(loan.principal_amount || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-[#a4b8b5] font-sans block">RATE / TERM</span>
                              <span className="font-bold text-[#f4eee2]">
                                {loan.interest_rate || 6.5}% ({loan.term_months || 36}m)
                              </span>
                            </div>
                          </div>

                          {/* Purpose & Notes */}
                          <div className="mt-2.5 space-y-1 text-xs">
                            <p className="text-[11px] text-[#a4b8b5] line-clamp-1">
                              <span className="text-[#dfbd84] font-bold">Purpose:</span> {loan.purpose || 'Commercial Growth'}
                            </p>
                            {loan.decision_notes && (
                              <p className="text-[10px] italic text-[#dfbd84]/80 line-clamp-2 bg-[#182423]/50 p-1.5 rounded border border-[#dfbd84]/15">
                                💬 "{loan.decision_notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Outcome Bar */}
                        <div className="pt-3 border-t border-[#dfbd84]/20 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-[#dfbd84] font-bold uppercase">
                            <span>Execute Outcome Action:</span>
                            <button
                              onClick={() => setSelectedDetailLoan(loan)}
                              className="text-[10px] text-[#dfbd84] hover:text-[#eed29e] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Details</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            {/* Approve Button */}
                            <button
                              onClick={() => {
                                setActionModalLoan(loan);
                                setActionType('approved');
                                setActionReason('Approved by Underwriting Officer for Disbursement');
                              }}
                              disabled={processingId === loan.id || loan.status === 'approved' || loan.status === 'disbursed'}
                              className="py-1.5 bg-[#58b388] hover:bg-emerald-400 text-[#1b2827] text-[10px] font-black rounded-lg transition flex items-center justify-center space-x-1 disabled:opacity-30 cursor-pointer"
                              title="Approve Application"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>

                            {/* Put On Hold Button */}
                            <button
                              onClick={() => {
                                setActionModalLoan(loan);
                                setActionType('on_hold');
                                setActionReason('Pending additional collateral appraisal / KYC documentation');
                              }}
                              disabled={processingId === loan.id || loan.status === 'on_hold'}
                              className="py-1.5 bg-amber-500 hover:bg-amber-400 text-[#1b2827] text-[10px] font-black rounded-lg transition flex items-center justify-center space-x-1 disabled:opacity-30 cursor-pointer"
                              title="Place on Hold"
                            >
                              <PauseCircle className="w-3 h-3" />
                              <span>On Hold</span>
                            </button>

                            {/* Reject Button */}
                            <button
                              onClick={() => {
                                setActionModalLoan(loan);
                                setActionType('rejected');
                                setActionReason('Exceeds institutional risk appetite / high default probability');
                              }}
                              disabled={processingId === loan.id || loan.status === 'rejected'}
                              className="py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black rounded-lg transition flex items-center justify-center space-x-1 disabled:opacity-30 cursor-pointer"
                              title="Reject Application"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>

                          {/* Secondary Utilities: Re-Assess AI Risk & Delete */}
                          <div className="flex items-center justify-between pt-1 text-[10px]">
                            <button
                              onClick={() => handleAssessAiRisk(loan.id)}
                              disabled={processingId === loan.id}
                              className="text-[#dfbd84] hover:text-[#f4eee2] flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
                            >
                              {processingId === loan.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-[#dfbd84]" />
                              )}
                              <span>Re-Calculate AI Risk</span>
                            </button>

                            <button
                              onClick={() => handleDeleteLoan(loan.id, displayName)}
                              disabled={processingId === loan.id}
                              className="text-red-400/80 hover:text-red-300 flex items-center space-x-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table Layout */
                <div className="glass-panel rounded-2xl border border-[#dfbd84]/30 overflow-hidden shadow-2xl bg-[#20302f]/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#dfbd84]/30 text-[#dfbd84] uppercase tracking-wider text-[10px] bg-[#182423]">
                          <th className="py-3 px-3">Loan ID</th>
                          <th className="py-3 px-3">Applicant & Category</th>
                          <th className="py-3 px-3 text-right">Principal ($)</th>
                          <th className="py-3 px-3 text-center">Rate / Term</th>
                          <th className="py-3 px-3">Purpose</th>
                          <th className="py-3 px-3 text-center">Risk Score</th>
                          <th className="py-3 px-3 text-center">Status</th>
                          <th className="py-3 px-3 text-center">Action Outcomes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dfbd84]/15">
                        {filteredQueueLoans.map((loan) => {
                          const idStr = (loan.id || 'c0000000').slice(0, 8);
                          const displayName = loan.applicant_name || (loan.customer ? `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim() : 'Applicant');
                          const category = loan.applicant_category || loan.customer?.client_category || 'corporate';
                          const score = Number(loan.risk_score || 35);

                          return (
                            <tr key={loan.id} className="hover:bg-[#182423]/60 transition">
                              <td className="py-3.5 px-3 font-mono font-bold">
                                <button
                                  onClick={() => setSelectedDetailLoan(loan)}
                                  className="text-[#dfbd84] hover:text-[#eed29e] hover:underline flex items-center space-x-1 cursor-pointer group"
                                  title="Click to view complete loan details and outcome actions"
                                >
                                  <span>#{idStr}</span>
                                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition" />
                                </button>
                              </td>
                              <td className="py-3.5 px-3 space-y-1">
                                <button
                                  onClick={() => setSelectedDetailLoan(loan)}
                                  className="font-bold text-[#f4eee2] hover:text-[#dfbd84] text-left block cursor-pointer transition"
                                >
                                  {displayName}
                                </button>
                                {renderCategoryBadge(category)}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#dfbd84]">
                                ${Number(loan.principal_amount || 0).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                                {loan.interest_rate}% ({loan.term_months}m)
                              </td>
                              <td className="py-3.5 px-3 text-[11px] text-[#a4b8b5] max-w-xs truncate">
                                {loan.purpose}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <RiskAssessmentBadge score={score} level={loan.ai_risk_assessment?.riskLevel} />
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                {renderStatusBadge(loan.status)}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <button
                                    onClick={() => setSelectedDetailLoan(loan)}
                                    className="p-1 bg-[#182423] text-[#dfbd84] border border-[#dfbd84]/30 hover:bg-[#dfbd84] hover:text-[#1b2827] rounded text-[10px] font-bold cursor-pointer"
                                    title="View Full Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActionModalLoan(loan);
                                      setActionType('approved');
                                      setActionReason('Approved in Table View');
                                    }}
                                    disabled={loan.status === 'approved' || loan.status === 'disbursed'}
                                    className="px-2 py-1 bg-[#58b388] text-[#1b2827] rounded text-[10px] font-black disabled:opacity-30 cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActionModalLoan(loan);
                                      setActionType('on_hold');
                                      setActionReason('Placed on hold for verification');
                                    }}
                                    disabled={loan.status === 'on_hold'}
                                    className="px-2 py-1 bg-amber-500 text-[#1b2827] rounded text-[10px] font-black disabled:opacity-30 cursor-pointer"
                                  >
                                    On Hold
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActionModalLoan(loan);
                                      setActionType('rejected');
                                      setActionReason('Adverse action reject');
                                    }}
                                    disabled={loan.status === 'rejected'}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-black disabled:opacity-30 cursor-pointer"
                                  >
                                    Reject
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
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 3: DECISIONED OUTCOMES & ACTION AUDIT */}
          {/* ========================================================================= */}
          {activeSubTab === 'audit' && (
            <div className="space-y-6">
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-[#dfbd84]/30 bg-[#20302f]/60 space-y-1 shadow-lg">
                  <div className="flex justify-between items-center text-[#dfbd84]">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Intake Volume</span>
                    <FileText className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-extrabold text-[#f4eee2] font-mono">
                    ${auditMetrics.totalVolume.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#dfbd84] font-mono">
                    {auditMetrics.totalCount} Total Applications Registered
                  </p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-[#58b388]/30 bg-[#20302f]/60 space-y-1 shadow-lg">
                  <div className="flex justify-between items-center text-[#58b388]">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Approved Volume</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-extrabold text-[#58b388] font-mono">
                    ${auditMetrics.approvedVolume.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#58b388] font-mono">
                    {auditMetrics.approvedCount} Applications Approved
                  </p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-[#20302f]/60 space-y-1 shadow-lg">
                  <div className="flex justify-between items-center text-amber-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">On-Hold Watchlist</span>
                    <PauseCircle className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-extrabold text-amber-400 font-mono">
                    ${auditMetrics.onHoldVolume.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono">
                    {auditMetrics.onHoldCount} Applications On Hold
                  </p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-[#20302f]/60 space-y-1 shadow-lg">
                  <div className="flex justify-between items-center text-red-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Rejected Applications</span>
                    <XCircle className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-extrabold text-red-400 font-mono">
                    ${auditMetrics.rejectedVolume.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-red-400 font-mono">
                    {auditMetrics.rejectedCount} Adverse Action Rejections
                  </p>
                </div>
              </div>

              {/* Action Log History Table */}
              <div className="glass-panel p-6 rounded-2xl border border-[#dfbd84]/30 bg-[#20302f]/70 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#dfbd84]/20">
                  <div>
                    <h3 className="font-extrabold text-[#f4eee2] text-base">Underwriting Action Decision Logs & Audit Trail</h3>
                    <p className="text-xs text-[#dfbd84]">Chronological record of status changes, reasons, and underwriting actions</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#dfbd84] bg-[#182423] px-2.5 py-1 rounded-lg border border-[#dfbd84]/30">
                    Compliance & SOX Audit Protected
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#dfbd84]/30 text-[#dfbd84] uppercase tracking-wider text-[10px] bg-[#182423]">
                        <th className="py-3 px-3">Loan Ref</th>
                        <th className="py-3 px-3">Applicant Entity</th>
                        <th className="py-3 px-3 text-right">Principal</th>
                        <th className="py-3 px-3 text-center">Calculated AI Risk</th>
                        <th className="py-3 px-3 text-center">Outcome Status</th>
                        <th className="py-3 px-3">Decision Notes & Rationale</th>
                        <th className="py-3 px-3 text-right">Action Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfbd84]/15">
                      {loans.map((l) => {
                        const idStr = (l.id || 'c0000000').slice(0, 8);
                        const displayName = l.applicant_name || (l.customer ? `${l.customer.first_name || ''} ${l.customer.last_name || ''}`.trim() : 'Applicant');
                        const score = Number(l.risk_score || 35);

                        return (
                          <tr key={l.id} className="hover:bg-[#182423]/60 transition">
                            <td className="py-3 px-3 font-mono font-bold">
                              <button
                                onClick={() => setSelectedDetailLoan(l)}
                                className="text-[#dfbd84] hover:text-[#eed29e] hover:underline flex items-center space-x-1 cursor-pointer group"
                                title="Click to view complete loan details and outcome actions"
                              >
                                <span>#{idStr}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition" />
                              </button>
                            </td>
                            <td className="py-3 px-3 font-bold text-[#f4eee2]">
                              <button
                                onClick={() => setSelectedDetailLoan(l)}
                                className="hover:text-[#dfbd84] text-left cursor-pointer transition"
                              >
                                {displayName}
                              </button>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-extrabold text-[#f4eee2]">
                              ${Number(l.principal_amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <RiskAssessmentBadge score={score} level={l.ai_risk_assessment?.riskLevel} />
                            </td>
                            <td className="py-3 px-3 text-center">
                              {renderStatusBadge(l.status)}
                            </td>
                            <td className="py-3 px-3 text-[11px] text-[#a4b8b5]">
                              {l.decision_notes || (l.action_logs?.[0]?.notes) || 'Underwriting intake record recorded'}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-[10px] text-[#dfbd84]">
                              {l.updated_at ? new Date(l.updated_at).toLocaleString() : new Date().toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Quick Action Prompt Modal from Queue */}
      {actionModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-[#dfbd84]/40 shadow-2xl relative bg-[#20302f] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfbd84]/20">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#182423] text-[#dfbd84] rounded-xl border border-[#dfbd84]/30">
                  <CheckCircle2 className="w-5 h-5 text-[#dfbd84]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#f4eee2] text-sm">
                    Execute Outcome Action: {actionType.toUpperCase().replace('_', ' ')}
                  </h3>
                  <p className="text-[10px] text-[#dfbd84]">
                    Loan #{actionModalLoan.id?.slice(0, 8)} - {actionModalLoan.applicant_name}
                  </p>
                </div>
              </div>
              <button onClick={() => setActionModalLoan(null)} className="text-[#a4b8b5] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#182423] rounded-xl border border-[#dfbd84]/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#a4b8b5]">Requested Principal:</span>
                <span className="font-mono font-bold text-[#dfbd84]">${Number(actionModalLoan.principal_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a4b8b5]">Calculated AI Risk Score:</span>
                <span className="font-mono font-bold text-[#f4eee2]">{actionModalLoan.risk_score || 35}/100</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-[#f4eee2]">
                Decision Rationale / Action Notes *
              </label>
              <textarea
                rows="3"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter mandatory audit rationale for this underwriting decision..."
                className="w-full glass-input bg-[#182423] text-white rounded-xl p-2.5 text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setActionModalLoan(null)}
                className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={() => handleExecuteOutcomeAction(actionModalLoan.id, actionType, actionReason)}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  actionType === 'approved'
                    ? 'bg-[#58b388] text-[#1b2827] hover:bg-emerald-400'
                    : actionType === 'on_hold'
                    ? 'bg-amber-500 text-[#1b2827] hover:bg-amber-400'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {actionProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Confirm {actionType.toUpperCase().replace('_', ' ')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Loan Details & Outcome Actions Modal */}
      {selectedDetailLoan && (
        <LoanDetailsModal
          isOpen={!!selectedDetailLoan}
          onClose={() => setSelectedDetailLoan(null)}
          loan={selectedDetailLoan}
          onStatusUpdate={(id, targetStatus, reason) => handleExecuteOutcomeAction(id, targetStatus, reason)}
          onAssessRisk={handleAssessAiRisk}
          onDelete={handleDeleteLoan}
        />
      )}
    </div>
  );
};

export default FreshLoanApplicationsPage;
