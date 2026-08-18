import React, { useState } from 'react';
import { 
  X, CheckCircle2, PauseCircle, XCircle, DollarSign, Sparkles, 
  ShieldCheck, AlertTriangle, Building, Store, User, Calendar, 
  Clock, FileText, ArrowUpRight, Percent, Download, Trash2, 
  Loader2, RefreshCw, Check, Eye, EyeOff, Shield, Wallet, Layers
} from 'lucide-react';
import RiskAssessmentBadge from './RiskAssessmentBadge';
import { useAuth } from '../../context/AuthContext';

export const LoanDetailsModal = ({
  isOpen,
  onClose,
  loan,
  onStatusUpdate,
  onAssessRisk,
  onDisburse,
  onDelete
}) => {
  const { user } = useAuth();
  const [actionReason, setActionReason] = useState('');
  const [activeActionPrompt, setActiveActionPrompt] = useState(null); // 'approved' | 'on_hold' | 'rejected' | null
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isTaxIdVisible, setIsTaxIdVisible] = useState(false);

  if (!isOpen || !loan) return null;

  const loanIdStr = (loan.id || 'c0000000').slice(0, 8);
  const fullId = loan.id || 'N/A';
  const applicantName = loan.applicant_name || (loan.customer ? `${loan.customer.first_name || ''} ${loan.customer.last_name || ''}`.trim() : 'Applicant');
  const category = loan.applicant_category || loan.customer?.client_category || 'corporate';
  const principal = Number(loan.principal_amount || 0);
  const rate = Number(loan.interest_rate || 6.5);
  const term = Number(loan.term_months || 36);
  const score = Number(loan.risk_score || 35);
  const purpose = loan.purpose || 'Commercial Growth';
  const status = loan.status || 'draft';

  // Calculate Financial Amortization Estimates
  const monthlyRate = (rate / 100) / 12;
  const monthlyPayment = term > 0 && principal > 0
    ? Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1))
    : Math.round(principal / Math.max(term, 1));
  const totalRepayment = monthlyPayment * term;
  const totalInterest = Math.max(totalRepayment - principal, 0);

  // Applicant Financials
  const annualRevenue = Number(loan.customer?.annual_revenue || loan.annual_revenue || 5000000);
  const nationalId = loan.customer?.national_id || 'US-TAX-ID-991823';
  const accountNumber = loan.customer?.account_number || `KSBC-ACC-${loanIdStr.slice(0, 6)}`;

  const maskedTaxId = isTaxIdVisible 
    ? nationalId 
    : nationalId.replace(/\d(?=\d{4})/g, '*');

  // AI Assessment Data
  const aiData = loan.ai_risk_assessment || {};
  const dtiRatio = aiData.dtiRatio || Number(((monthlyPayment) / (annualRevenue / 12)).toFixed(2));
  const collateralValue = Number(principal * 1.25);
  const defaultProb = aiData.defaultProbability || Number((score * 0.26).toFixed(1));
  const maxRecommended = aiData.maxRecommendedLoan || Math.round(annualRevenue * 0.42);
  const recommendation = aiData.recommendation || (score <= 40 ? 'APPROVE' : score <= 70 ? 'CONDITIONAL_APPROVE' : 'REJECT');

  // Trigger Action Execution
  const handleConfirmAction = async (targetStatus) => {
    setIsProcessing(true);
    setFeedbackMsg('');
    try {
      if (onStatusUpdate) {
        await onStatusUpdate(loan.id, targetStatus, actionReason || `Outcome action set to ${targetStatus.toUpperCase()} inside Loan Details Modal`);
        setFeedbackMsg(`✅ Status successfully updated to "${targetStatus.toUpperCase()}".`);
        setActiveActionPrompt(null);
        setActionReason('');
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      setFeedbackMsg(`❌ Failed: ${err.message || 'Action failed'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Live AI Risk Assessment
  const handleTriggerAiRisk = async () => {
    setIsProcessing(true);
    try {
      if (onAssessRisk) {
        await onAssessRisk(loan.id);
        setFeedbackMsg('⚡ Gemini AI Risk assessment re-calculated successfully.');
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      setFeedbackMsg('❌ AI assessment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Disbursement
  const handleTriggerDisbursement = async () => {
    setIsProcessing(true);
    try {
      if (onDisburse) {
        await onDisburse(loan.id);
        setFeedbackMsg('🎉 Loan disbursed into General Ledger Vault Cash!');
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      setFeedbackMsg('❌ Disbursement failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export Summary Slip
  const handleExportSlip = () => {
    const slip = `=====================================================
KSBC DIGITAL BANKING ERP - COMMERCIAL LOAN MEMORANDUM
=====================================================
Loan Reference ID : #${loanIdStr} (UUID: ${fullId})
Applicant Name    : ${applicantName}
Account Number    : ${accountNumber}
Category          : ${category.toUpperCase()}
Tax ID / SSN      : ${nationalId}

LOAN FINANCIAL SPECIFICATIONS:
-----------------------------------------------------
Principal Amount  : $${principal.toLocaleString()} USD
Interest Rate     : ${rate}% Fixed Annual
Term Length       : ${term} Months (${(term / 12).toFixed(1)} Years)
Est. Monthly EMI  : $${monthlyPayment.toLocaleString()}/month
Total Interest    : $${totalInterest.toLocaleString()}
Total Repayment   : $${totalRepayment.toLocaleString()}
Facility Purpose  : ${purpose}

CREDIT RISK & UNDERWRITING TELEMETRY:
-----------------------------------------------------
Calculated Risk   : ${score}/100 (${aiData.riskLevel || (score > 70 ? 'HIGH' : score > 40 ? 'MODERATE' : 'LOW')})
Default Prob.     : ${defaultProb}%
Debt-to-Income    : ${(dtiRatio * 100).toFixed(1)}%
Max Limit (Cap)   : $${maxRecommended.toLocaleString()}
Recommendation    : ${recommendation}

STATUS & DECISION:
-----------------------------------------------------
Current Status    : ${status.toUpperCase()}
Decision Notes    : ${loan.decision_notes || 'Standard Underwriting Flow'}
Audit Timestamp   : ${new Date().toISOString()}
Underwriter ID    : ${user?.id || 'SYSTEM-ADMIN'}
=====================================================`;

    const blob = new Blob([slip], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KSBC_Loan_Memorandum_${loanIdStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl p-6 rounded-3xl border border-[#1E2748]/15 bg-[#F6F2E3] text-[#1E2748] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-xs text-[#53627C]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2748]/15">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] rounded-2xl border border-[#1E2748]/15 shadow-md">
              <Landmark className="w-6 h-6 text-[#1E2748]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-[#1E2748]">
                  {applicantName}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] font-bold border border-[#1E2748]/15">
                  Ref #{loanIdStr}
                </span>
              </div>
              <p className="text-[11px] text-[#1E2748] font-mono mt-0.5">
                Full UUID: <span className="text-[#1E2748] select-all">{fullId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <div className="text-right space-y-1">
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border inline-flex items-center space-x-1 ${
                status === 'approved'
                  ? 'bg-[#58b388]/20 text-[#58b388] border-[#58b388]/40'
                  : status === 'on_hold' || status === 'onhold'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : status === 'rejected'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : status === 'disbursed'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-[#EBE4CD]/10 text-[#1E2748] border-[#1E2748]/15'
              }`}>
                {status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                {status === 'on_hold' && <PauseCircle className="w-3 h-3" />}
                {status === 'rejected' && <XCircle className="w-3 h-3" />}
                {status === 'disbursed' && <DollarSign className="w-3 h-3" />}
                <span>{status === 'on_hold' ? 'ON HOLD' : status.toUpperCase()}</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-[#F6F2E3] text-[#1E2748] text-[#53627C] hover:text-white rounded-xl border border-[#1E2748]/15 transition cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className="p-3 bg-[#F6F2E3] text-[#1E2748] border border-[#1E2748]/15 rounded-xl text-xs font-bold text-[#1E2748] flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg('')} className="text-[#53627C] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Financial Overview 4-Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#F6F2E3] text-[#1E2748]/90 rounded-2xl border border-[#1E2748]/15">
            <span className="text-[10px] text-[#53627C] uppercase font-bold block">PRINCIPAL REQUESTED</span>
            <p className="text-xl font-black text-[#1E2748] font-mono mt-1">
              ${principal.toLocaleString()}
            </p>
            <span className="text-[10px] text-[#53627C]">Commercial Facility</span>
          </div>

          <div className="p-3.5 bg-[#F6F2E3] text-[#1E2748]/90 rounded-2xl border border-[#1E2748]/15">
            <span className="text-[10px] text-[#53627C] uppercase font-bold block">RATE & TERM</span>
            <p className="text-xl font-black text-[#1E2748] font-mono mt-1">
              {rate}% <span className="text-xs font-normal">({term}m)</span>
            </p>
            <span className="text-[10px] text-[#53627C]">{(term / 12).toFixed(1)} Year Amortization</span>
          </div>

          <div className="p-3.5 bg-[#F6F2E3] text-[#1E2748]/90 rounded-2xl border border-[#1E2748]/15">
            <span className="text-[10px] text-[#53627C] uppercase font-bold block">MONTHLY PAYMENT (EMI)</span>
            <p className="text-xl font-black text-[#58b388] font-mono mt-1">
              ${monthlyPayment.toLocaleString()}
            </p>
            <span className="text-[10px] text-[#53627C]">Est. Debt Service</span>
          </div>

          <div className="p-3.5 bg-[#F6F2E3] text-[#1E2748]/90 rounded-2xl border border-[#1E2748]/15">
            <span className="text-[10px] text-[#53627C] uppercase font-bold block">TOTAL REPAYMENT</span>
            <p className="text-xl font-black text-[#1E2748] font-mono mt-1">
              ${totalRepayment.toLocaleString()}
            </p>
            <span className="text-[10px] text-[#1E2748]">Interest: ${totalInterest.toLocaleString()}</span>
          </div>
        </div>

        {/* 2-Column Deep Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Left Panel: Applicant & Facility Credentials */}
          <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/70 rounded-2xl border border-[#1E2748]/15 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2748]/15">
              <h3 className="font-extrabold text-[#1E2748] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-[#1E2748]" />
                <span>Borrower Profile & Facility Credentials</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] border border-[#1E2748]/15">
                {category.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#53627C]">Account Holder:</span>
                <span className="font-bold text-[#1E2748]">{applicantName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#53627C]">Master Account #:</span>
                <span className="font-mono font-bold text-[#1E2748]">{accountNumber}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#53627C]">National Tax / EIN ID:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-[#1E2748]">{maskedTaxId}</span>
                  <button
                    type="button"
                    onClick={() => setIsTaxIdVisible(!isTaxIdVisible)}
                    className="text-[#1E2748] hover:text-white p-0.5 cursor-pointer"
                    title={isTaxIdVisible ? 'Hide Tax ID' : 'Reveal Tax ID'}
                  >
                    {isTaxIdVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#53627C]">Annual Revenue / Income:</span>
                <span className="font-mono font-bold text-[#58b388]">${annualRevenue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#53627C]">Loan Purpose:</span>
                <span className="font-semibold text-[#1E2748] text-right max-w-[200px] truncate">{purpose}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#53627C]">Collateral Valuation:</span>
                <span className="font-mono text-[#1E2748]">${collateralValue.toLocaleString()} (125% Buffer)</span>
              </div>

              <div className="pt-2 border-t border-[#1E2748]/15/15">
                <span className="text-[10px] text-[#53627C] block mb-1 font-bold uppercase">Decision Notes / Status Rationale:</span>
                <p className="text-[11px] italic text-[#1E2748] bg-[#F6F2E3] text-[#1E2748] p-2 rounded-xl border border-[#1E2748]/15">
                  "{loan.decision_notes || 'Application processed under automated underwriting criteria.'}"
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: AI Credit Risk & Underwriting Engine */}
          <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/70 rounded-2xl border border-[#1E2748]/15 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2748]/15">
              <h3 className="font-extrabold text-[#1E2748] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#1E2748]" />
                <span>AI Credit Risk Model & Decision Engine</span>
              </h3>
              <button
                onClick={handleTriggerAiRisk}
                disabled={isProcessing}
                className="px-2 py-0.5 bg-[#EBE4CD]/10 hover:bg-[#EBE4CD]/30 text-[#1E2748] rounded text-[10px] font-bold border border-[#1E2748]/15 flex items-center space-x-1 transition cursor-pointer"
              >
                {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                <span>Re-Score</span>
              </button>
            </div>

            {/* Score & Recommendation Banner */}
            <div className="p-3 bg-[#F6F2E3] text-[#1E2748] rounded-xl border border-[#1E2748]/15 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#53627C] font-bold uppercase block">AI RISK SCORE</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className={`text-2xl font-black font-mono ${
                    score > 70 ? 'text-red-400' : score > 40 ? 'text-[#1E2748]' : 'text-emerald-400'
                  }`}>
                    {score}
                  </span>
                  <span className="text-xs text-[#53627C] font-mono">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-[#53627C] font-bold uppercase block">UNDERWRITING ADVISORY</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase inline-block mt-0.5 ${
                  recommendation === 'APPROVE'
                    ? 'bg-[#58b388]/20 text-[#58b388] border border-[#58b388]/40'
                    : recommendation === 'REJECT'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-[#EBE4CD]/10 text-[#1E2748] border border-[#1E2748]/15'
                }`}>
                  {recommendation}
                </span>
              </div>
            </div>

            {/* Risk Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#F6F2E3] text-[#1E2748]/80 rounded-lg border border-[#1E2748]/15">
                <span className="text-[9px] text-[#53627C] block">DEFAULT PROBABILITY</span>
                <span className="font-mono font-bold text-[#1E2748]">{defaultProb}%</span>
              </div>
              <div className="p-2 bg-[#F6F2E3] text-[#1E2748]/80 rounded-lg border border-[#1E2748]/15">
                <span className="text-[9px] text-[#53627C] block">DTI BURDEN RATIO</span>
                <span className="font-mono font-bold text-[#1E2748]">{(dtiRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2 bg-[#F6F2E3] text-[#1E2748]/80 rounded-lg border border-[#1E2748]/15">
                <span className="text-[9px] text-[#53627C] block">RECOMMENDED BORROWING CAP</span>
                <span className="font-mono font-bold text-[#58b388]">${maxRecommended.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-[#F6F2E3] text-[#1E2748]/80 rounded-lg border border-[#1E2748]/15">
                <span className="text-[9px] text-[#53627C] block">LOAN-TO-VALUE (LTV)</span>
                <span className="font-mono font-bold text-[#1E2748]">80.0%</span>
              </div>
            </div>

            {/* AI Summary Quote */}
            {aiData.summaryAdvisory && (
              <p className="text-[10px] italic text-[#53627C] bg-[#F6F2E3] text-[#1E2748] p-2 rounded-lg border border-[#1E2748]/15/15">
                🤖 "{aiData.summaryAdvisory}"
              </p>
            )}
          </div>
        </div>

        {/* Action Decision Prompt Drawer (If triggered) */}
        {activeActionPrompt && (
          <div className="p-4 bg-[#F6F2E3] text-[#1E2748] rounded-2xl border border-[#1E2748]/15 space-y-3 animate-fadeIn shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-[#1E2748] text-xs uppercase flex items-center space-x-2">
                <span>Confirm Action: {activeActionPrompt.toUpperCase().replace('_', ' ')}</span>
              </h4>
              <button onClick={() => setActiveActionPrompt(null)} className="text-[#53627C] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-[#1E2748] font-bold uppercase">
                Underwriting Audit Notes / Reason *
              </label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={`Provide reason for marking as ${activeActionPrompt}...`}
                className="w-full glass-input bg-[#EBE4CD] text-white rounded-xl p-2.5 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveActionPrompt(null)}
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleConfirmAction(activeActionPrompt)}
                className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center space-x-1 cursor-pointer ${
                  activeActionPrompt === 'approved'
                    ? 'bg-[#58b388] text-[#1E2748] hover:bg-emerald-400'
                    : activeActionPrompt === 'on_hold'
                    ? 'bg-amber-500 text-[#1E2748] hover:bg-amber-400'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                <span>Execute {activeActionPrompt.toUpperCase().replace('_', ' ')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Action Controls */}
        <div className="pt-4 border-t border-[#1E2748]/15 flex flex-wrap items-center justify-between gap-3">
          {/* Left Utilities */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportSlip}
              className="px-3 py-2 bg-[#F6F2E3] text-[#1E2748] hover:bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] rounded-xl border border-[#1E2748]/15 font-bold transition flex items-center space-x-1.5 cursor-pointer text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Loan Memorandum</span>
            </button>

            {status === 'approved' && onDisburse && (
              <button
                type="button"
                onClick={handleTriggerDisbursement}
                disabled={isProcessing}
                className="px-3.5 py-2 bg-gradient-to-r from-[#1E2748] to-[#58b388] hover:from-[#1E2748] hover:to-emerald-400 text-[#1E2748] rounded-xl font-black transition flex items-center space-x-1.5 cursor-pointer text-xs disabled:opacity-50"
              >
                <DollarSign className="w-3.5 h-3.5 text-[#1E2748]" />
                <span>Disburse Treasury Payout</span>
              </button>
            )}
          </div>

          {/* Right Action Outcome Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Approve Button */}
            <button
              type="button"
              onClick={() => {
                setActiveActionPrompt('approved');
                setActionReason('Approved by Underwriting Officer');
              }}
              disabled={isProcessing || status === 'approved' || status === 'disbursed'}
              className="px-3.5 py-2 bg-[#58b388] hover:bg-emerald-400 text-[#1E2748] text-xs font-black rounded-xl transition flex items-center space-x-1.5 disabled:opacity-30 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Loan</span>
            </button>

            {/* On Hold Button */}
            <button
              type="button"
              onClick={() => {
                setActiveActionPrompt('on_hold');
                setActionReason('Placed on hold pending financial verification / collateral appraisal');
              }}
              disabled={isProcessing || status === 'on_hold'}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-[#1E2748] text-xs font-black rounded-xl transition flex items-center space-x-1.5 disabled:opacity-30 cursor-pointer shadow-md"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Place On Hold</span>
            </button>

            {/* Reject Button */}
            <button
              type="button"
              onClick={() => {
                setActiveActionPrompt('rejected');
                setActionReason('Adverse action reject: elevated default probability');
              }}
              disabled={isProcessing || status === 'rejected'}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition flex items-center space-x-1.5 disabled:opacity-30 cursor-pointer shadow-md"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Application</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoanDetailsModal;
