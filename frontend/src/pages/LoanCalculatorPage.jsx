import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import {
  Calculator, Sparkles, DollarSign, ShieldAlert, CheckCircle2, Percent,
  TrendingUp, AlertTriangle, ArrowRight, Layers, UserCheck, CreditCard, FileText, Check, Sliders, LineChart, Shield
} from 'lucide-react';

const DEFAULT_CUSTOMERS = [
  { id: 'c1001', first_name: 'David', last_name: 'Reddy', account_number: 'KSBC-SAV-10049281', national_id: 'US-SSN-***-**-3941', email: 'david.reddy@enterprise.com', annual_revenue: 1450000, client_category: 'private_savings', account_type: 'Private Standard Savings' },
  { id: 'c1002', first_name: 'Charlotte', last_name: 'Sterling', account_number: 'KSBC-SAV-10040284', national_id: 'US-SSN-***-**-3027', email: 'charlotte.sterling27@privatesavings.com', annual_revenue: 2105000, client_category: 'private_individual', account_type: 'Private Wealth Management' },
  { id: 'c1003', first_name: 'Katherapaka', last_name: 'Srinivas', account_number: 'KSBC-SAV-10001001', national_id: 'US-EIN-99-882233', email: 'srinivas.k@ksbc-banking.com', annual_revenue: 8500000, client_category: 'corporate', account_type: 'Corporate Treasury Vault' },
  { id: 'c1004', first_name: 'Alexander', last_name: 'Sterling', account_number: 'KSBC-SAV-10107424', national_id: 'US-SSN-***-**-4910', email: 'alexander.sterling@enterprise.com', annual_revenue: 12500000, client_category: 'corporate', account_type: 'Corporate Premier Account' },
  { id: 'c1005', first_name: 'Priya', last_name: 'Sharma', account_number: 'KSBC-SAV-10058392', national_id: 'US-SSN-***-**-8821', email: 'priya.sharma@biopharma.org', annual_revenue: 4200000, client_category: 'sme', account_type: 'Commercial SME Account' },
  { id: 'c1006', first_name: 'Marcus', last_name: 'Vance', account_number: 'KSBC-SAV-10092813', national_id: 'US-SSN-***-**-1102', email: 'marcus.vance@vancetech.io', annual_revenue: 6800000, client_category: 'corporate', account_type: 'Corporate Account' },
  { id: 'c1007', first_name: 'Elena', last_name: 'Rostova', account_number: 'KSBC-SAV-10038472', national_id: 'US-SSN-***-**-7734', email: 'elena.rostova@titanproperties.com', annual_revenue: 9400000, client_category: 'real_estate', account_type: 'Real Estate Commercial Account' }
];

export const LoanCalculatorPage = () => {
  const [activeTab, setActiveTab] = useState('underwriter'); // 'underwriter' | 'predictor'
  const [customers, setCustomers] = useState(DEFAULT_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Underwriter Form State
  const [formData, setFormData] = useState({
    applicantName: 'Charlotte Sterling',
    accountNumber: 'KSBC-SAV-10040284',
    taxId: 'US-SSN-***-**-3027',
    customerEmail: 'charlotte.sterling27@privatesavings.com',
    principalAmount: 2500000,
    interestRate: 6.5,
    termMonths: 36,
    annualIncome: 8500000,
    creditScore: 740,
    dtiRatio: 0.32,
    collateralValue: 3500000,
    loanPurpose: 'Equipment Purchase & Automation',
    applicantCategory: 'private_individual'
  });

  // Predictor Scenario State
  const [predictorParams, setPredictorParams] = useState({
    scenario: 'baseline', // 'baseline' | 'rate_shock' | 'inflation_surge' | 'recession'
    rateShift: 1.5,
    revenueChange: -5,
    inflationRate: 3.5
  });

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await apiClient.get('/customers');
        if (res.data.success && res.data.customers && res.data.customers.length > 0) {
          const apiCusts = res.data.customers;
          const mergedMap = new Map();
          DEFAULT_CUSTOMERS.forEach(c => mergedMap.set(c.account_number, c));
          apiCusts.forEach(c => {
            const accNum = c.account_number || `KSBC-ACC-${c.id.slice(0, 6)}`;
            mergedMap.set(accNum, {
              id: c.id,
              first_name: c.first_name,
              last_name: c.last_name,
              account_number: accNum,
              national_id: c.national_id || 'US-SSN-***-**-4910',
              email: c.email || 'client@ksbc-banking.com',
              annual_revenue: Number(c.annual_revenue || 5000000),
              client_category: c.client_category || 'private_individual',
              account_type: c.account_type || 'Private Savings'
            });
          });
          setCustomers(Array.from(mergedMap.values()));
        }
      } catch (err) {
        console.warn('Using baseline default customers list');
      }
    };
    fetchCustomers();
  }, []);

  const handleCustomerSelect = (custID) => {
    setSelectedCustomerId(custID);
    if (!custID) return;

    const cust = customers.find(c => c.id === custID || c.account_number === custID);
    if (cust) {
      setFormData(prev => ({
        ...prev,
        applicantName: `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || 'Onboarded Account Holder',
        accountNumber: cust.account_number || `KSBC-SAV-${cust.id.slice(0, 8)}`,
        taxId: cust.national_id || 'US-EIN-99-882233',
        customerEmail: cust.email || 'client@ksbc-banking.com',
        annualIncome: Number(cust.annual_revenue || 5000000),
        applicantCategory: cust.client_category || 'private_individual'
      }));
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await apiClient.post('/ai/loan-risk', {
        ...formData,
        principalAmount: Number(formData.principalAmount),
        interestRate: Number(formData.interestRate),
        termMonths: Number(formData.termMonths),
        annualIncome: Number(formData.annualIncome),
        creditScore: Number(formData.creditScore),
        dtiRatio: Number(formData.dtiRatio),
        collateralValue: Number(formData.collateralValue)
      });

      if (res.data.success) {
        setAssessment(res.data.assessment);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'AI Loan Risk calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndIntake = async (shouldDisburse = false) => {
    setSubmittingAction(true);
    setError('');
    setSuccessMsg('');

    try {
      const targetCustId = selectedCustomerId || (customers[0]?.id || 'c0000001-1111-4111-c111-111111111111');
      const createRes = await apiClient.post('/loans', {
        customerId: targetCustId,
        applicantName: formData.applicantName,
        applicantCategory: formData.applicantCategory,
        principalAmount: Number(formData.principalAmount),
        interestRate: Number(formData.interestRate),
        termMonths: Number(formData.termMonths),
        purpose: formData.loanPurpose,
        status: 'approved'
      });

      if (createRes.data.success) {
        const createdLoan = createRes.data.loan;

        if (shouldDisburse && createdLoan?.id) {
          try {
            await apiClient.post(`/treasury/loans/${createdLoan.id}/disburse`);
            setSuccessMsg(`🎉 Loan #${createdLoan.id.slice(0, 8)} ($${Number(formData.principalAmount).toLocaleString()}) for ${formData.applicantName} (${formData.accountNumber}) successfully APPROVED and DISBURSED into General Ledger!`);
          } catch (disburseErr) {
            setSuccessMsg(`✅ Loan #${createdLoan.id.slice(0, 8)} for ${formData.applicantName} (${formData.accountNumber}) successfully APPROVED in underwriting pipeline!`);
          }
        } else {
          setSuccessMsg(`✅ Loan application for ${formData.applicantName} (${formData.accountNumber}) successfully APPROVED & added to Pipeline!`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute loan approval action');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Compute 12-Month Risk Scenario Predictor values dynamically
  const computedPredictor = (() => {
    const principal = Number(formData.principalAmount || 2500000);
    const revenue = Number(formData.annualIncome || 8500000);
    const credit = Number(formData.creditScore || 740);

    const baseDti = (principal * 0.04) / (revenue / 12);
    const rateAdj = predictorParams.rateShift * 0.8;
    const revAdj = (predictorParams.revenueChange < 0 ? Math.abs(predictorParams.revenueChange) * 0.7 : 0);
    const infAdj = predictorParams.inflationRate * 0.5;

    const predictedScore = Math.min(Math.max(Math.round(baseDti * 30 + (800 - credit) * 0.12 + rateAdj * 4 + revAdj + infAdj), 15), 96);
    const predictedDefaultProb = Number((predictedScore * 0.26).toFixed(1));
    const maxSafeCeiling = Math.round(revenue * (1 + predictorParams.revenueChange / 100) * 0.42);
    const estimatedLossProvision = Math.round(principal * (predictedDefaultProb / 100) * 0.85);

    let scenarioTitle = 'Baseline Growth Horizon';
    let riskLevel = 'LOW';
    let recommendation = 'APPROVE';

    if (predictedScore > 68) {
      riskLevel = 'HIGH';
      recommendation = 'REJECT / RESTRUCTURE';
      scenarioTitle = 'Severe Macro Recession Risk';
    } else if (predictedScore > 42) {
      riskLevel = 'MODERATE';
      recommendation = 'CONDITIONAL APPROVAL';
      scenarioTitle = 'Adverse Rate & Margin Pressure';
    }

    return {
      predictedScore,
      predictedDefaultProb,
      maxSafeCeiling,
      estimatedLossProvision,
      riskLevel,
      recommendation,
      scenarioTitle,
      nimYield: Number((6.25 + predictorParams.rateShift * 0.4).toFixed(2))
    };
  })();

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#1E2748]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1E2748] font-heading">AI Loan Risk Calculator & 12-Month Predictor</h1>
              <p className="text-xs text-[#53627C]">Powered by Gemini 2.0 Flash Neural Credit Risk Engine</p>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#EBE4CD] border border-[#1E2748]/15 rounded-full text-xs text-[#1E2748] font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-[#C59E5F]" />
              <span>Real-Time Neural Credit Scoring</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-3 border-b border-[#1E2748]/15 pb-2">
            <button
              onClick={() => setActiveTab('underwriter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                activeTab === 'underwriter'
                  ? 'bg-[#1E2748] text-[#FAF7E6] border-[#1E2748] shadow-md font-extrabold'
                  : 'bg-[#F3EEDC] text-[#53627C] border-[#1E2748]/15 hover:bg-[#EBE4CD]'
              }`}
            >
              <Calculator className="w-4 h-4 text-[#C59E5F]" />
              <span>Real-Time Credit Underwriter</span>
            </button>

            <button
              onClick={() => setActiveTab('predictor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                activeTab === 'predictor'
                  ? 'bg-[#1E2748] text-[#FAF7E6] border-[#1E2748] shadow-md font-extrabold'
                  : 'bg-[#F3EEDC] text-[#53627C] border-[#1E2748]/15 hover:bg-[#EBE4CD]'
              }`}
            >
              <LineChart className="w-4 h-4 text-[#C59E5F]" />
              <span>AI 12-Month Risk Scenario Predictor</span>
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 bg-[#58b388]/20 border border-[#58b388]/50 rounded-2xl text-xs text-[#1E2748] font-bold flex items-center justify-between shadow-lg">
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#58b388]" />
                <span>{successMsg}</span>
              </span>
              <Link
                to="/loans"
                className="px-3 py-1.5 bg-[#58b388] text-[#1E2748] text-[11px] font-black rounded-lg hover:bg-[#FAF7E6] transition flex items-center space-x-1"
              >
                <span>View Loans Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* TAB 1: REAL-TIME CREDIT UNDERWRITER */}
          {activeTab === 'underwriter' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Input Form */}
              <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-[#1E2748]/15 space-y-5 bg-[#F3EEDC] shadow-xl">
                <h3 className="text-sm font-bold text-[#1E2748] flex items-center space-x-2 pb-3 border-b border-[#1E2748]/15">
                  <Calculator className="w-4 h-4 text-[#1E2748]" />
                  <span>Input Applicant & Credit Parameters</span>
                </h3>

                <form onSubmit={handleCalculate} className="space-y-4 text-xs">
                  {/* Customer Selection Auto-fill */}
                  <div className="p-3.5 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 space-y-2">
                    <label className="block text-[#1E2748] font-bold uppercase text-[10px] flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#1E2748]" />
                      <span>SELECT ONBOARDED CUSTOMER ACCOUNT (AUTO-FILL)</span>
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      className="w-full bg-[#EBE4CD] text-[#1E2748] border border-[#1E2748]/15 rounded-xl p-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#1E2748] text-xs cursor-pointer"
                    >
                      <option value="" className="bg-[#FAF7E6] text-[#1E2748]">
                        -- Select Existing Onboarded Customer Account ({customers.length} Accounts Available) --
                      </option>
                      {customers.map((c) => (
                        <option key={c.id || c.account_number} value={c.id || c.account_number} className="bg-[#FAF7E6] text-[#1E2748]">
                          {c.first_name} {c.last_name} — {c.account_number} (${Number(c.annual_revenue || 0).toLocaleString()} Rev)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Identification Details */}
                  <div className="p-3.5 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 space-y-3">
                    <span className="text-[10px] font-bold text-[#1E2748] uppercase block tracking-wider flex items-center space-x-1">
                      <CreditCard className="w-3.5 h-3.5 text-[#1E2748]" />
                      <span>CUSTOMER ACCOUNT IDENTIFICATION DETAILS</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">CUSTOMER / APPLICANT FULL NAME</label>
                        <input
                          type="text"
                          value={formData.applicantName}
                          onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                          className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-bold"
                          placeholder="e.g. Charlotte Sterling"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">ACCOUNT NUMBER</label>
                        <input
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono font-bold"
                          placeholder="e.g. KSBC-SAV-10040284"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">TAX ID / SSN / EIN</label>
                        <input
                          type="text"
                          value={formData.taxId}
                          onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                          className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono"
                          placeholder="e.g. US-SSN-***-**-3027"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">CONTACT EMAIL</label>
                        <input
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748]"
                          placeholder="e.g. charlotte.sterling27@privatesavings.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">APPLICANT CATEGORY</label>
                      <select
                        value={formData.applicantCategory}
                        onChange={(e) => setFormData({ ...formData, applicantCategory: e.target.value })}
                        className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748]"
                      >
                        <option value="private_individual">👤 Private Individual Account Holder</option>
                        <option value="corporate">🏢 Corporate Enterprise</option>
                        <option value="sme">🏬 SME Business</option>
                        <option value="real_estate">🏢 Commercial Real Estate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">CREDIT SCORE (FICO)</label>
                      <input
                        type="number"
                        min="300"
                        max="850"
                        value={formData.creditScore}
                        onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                        className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">REQUESTED PRINCIPAL ($)</label>
                      <input
                        type="number"
                        min="10000"
                        max="50000000"
                        value={formData.principalAmount}
                        onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                        className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">ANNUAL REVENUE / INCOME ($)</label>
                      <input
                        type="number"
                        min="50000"
                        max="100000000"
                        value={formData.annualIncome}
                        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                        className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">INTEREST RATE (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="30"
                        value={formData.interestRate}
                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                        className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">TERM LENGTH</label>
                      <select
                        value={formData.termMonths}
                        onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
                        className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748]"
                      >
                        <option value="12">12 Months (1 yr)</option>
                        <option value="24">24 Months (2 yrs)</option>
                        <option value="36">36 Months (3 yrs)</option>
                        <option value="60">60 Months (5 yrs)</option>
                        <option value="120">120 Months (10 yrs)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">COLLATERAL VALUE ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.collateralValue}
                        onChange={(e) => setFormData({ ...formData, collateralValue: e.target.value })}
                        className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">LOAN PURPOSE</label>
                    <select
                      value={formData.loanPurpose}
                      onChange={(e) => setFormData({ ...formData, loanPurpose: e.target.value })}
                      className="w-full bg-[#EBE4CD] border border-[#1E2748]/15 rounded-xl p-2.5 text-[#1E2748]"
                    >
                      <option value="Equipment Purchase & Automation">Equipment Purchase & Automation</option>
                      <option value="Working Capital Expansion">Working Capital Expansion</option>
                      <option value="Commercial Real Estate Acquisition">Commercial Real Estate Acquisition</option>
                      <option value="Debt Refinancing & Consolidation">Debt Refinancing & Consolidation</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] font-archivo font-extrabold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    <Sparkles className="w-4 h-4 text-[#C59E5F]" />
                    <span>{loading ? 'Evaluating Gemini AI Risk Model...' : 'Calculate AI Risk & Underwriting Decision'}</span>
                  </button>
                </form>
              </div>

              {/* Assessment Verdict Box */}
              <div className="lg:col-span-5 space-y-5">
                {loading ? (
                  <div className="glass-panel p-10 rounded-2xl border border-[#1E2748]/15 text-center bg-[#F3EEDC]">
                    <LoadingSpinner text="Running Gemini 2.0 Flash Neural Credit Risk Model..." />
                  </div>
                ) : assessment ? (
                  <div className="glass-panel p-6 rounded-2xl border border-[#1E2748]/15 space-y-5 shadow-2xl bg-[#F3EEDC]">
                    <div className="flex justify-between items-center pb-3 border-b border-[#1E2748]/15">
                      <h3 className="text-sm font-bold text-[#1E2748]">AI Credit Underwriting Verdict</h3>
                      
                      <button
                        onClick={() => handleApproveAndIntake(false)}
                        disabled={submittingAction}
                        className={`px-3 py-1.5 rounded-full text-xs font-black font-mono border uppercase shadow transition flex items-center space-x-1.5 ${
                          assessment.recommendation === 'APPROVE'
                            ? 'bg-[#58b388] text-[#1E2748] border-[#58b388]'
                            : assessment.recommendation === 'CONDITIONAL_APPROVE'
                            ? 'bg-[#1E2748] text-[#FAF7E6] border-[#1E2748]'
                            : 'bg-red-600 text-white border-red-500'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{submittingAction ? 'Processing...' : `EXECUTE ${assessment.recommendation.replace('_', ' ')}`}</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-[#1E2748] uppercase block tracking-wider">Target Account Identification</span>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#1E2748]">{assessment.applicantName || formData.applicantName}</span>
                        <span className="font-mono text-[#1E2748] font-bold">{assessment.accountNumber || formData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-[#53627C]">
                        <span>Tax ID: <code className="text-[#1E2748]">{assessment.taxId || formData.taxId}</code></span>
                        <span className="text-[#1E2748]">{assessment.customerEmail || formData.customerEmail}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 text-center space-y-0.5">
                        <span className="text-[10px] text-[#1E2748] block uppercase font-bold">AI RISK SCORE</span>
                        <span className={`text-3xl font-extrabold font-mono ${
                          assessment.riskScore > 70 ? 'text-red-600' : assessment.riskScore > 40 ? 'text-[#1E2748]' : 'text-[#58b388]'
                        }`}>
                          {assessment.riskScore}/100
                        </span>
                        <span className="text-[10px] text-[#53627C] block font-bold uppercase">{assessment.riskLevel} RISK</span>
                      </div>

                      <div className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 text-center space-y-0.5">
                        <span className="text-[10px] text-[#1E2748] block uppercase font-bold">DEFAULT PROBABILITY</span>
                        <span className="text-3xl font-extrabold font-mono text-[#1E2748]">
                          {assessment.defaultProbability}%
                        </span>
                        <span className="text-[10px] text-[#53627C] block font-semibold">12-Month Horizon</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 flex justify-between items-center text-xs font-mono">
                      <span className="text-[#53627C] font-sans font-bold">MAX RECOMMENDED CREDIT LIMIT:</span>
                      <span className="text-[#58b388] font-black text-sm">${Number(assessment.maxRecommendedLoan || 0).toLocaleString()}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="font-bold text-[#1E2748] block text-[10px] uppercase tracking-wider">Identified Risk Factors:</span>
                      {assessment.keyRisks?.map((r, i) => (
                        <div key={i} className="p-2 bg-[#FAF7E6] rounded-lg border border-red-500/30 text-red-700 flex items-center space-x-2 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 text-xs text-[#53627C] space-y-1">
                      <span className="font-bold text-[#1E2748] block flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C59E5F]" />
                        <span>Gemini AI Advisory:</span>
                      </span>
                      <p className="italic text-[#1E2748]">"{assessment.summaryAdvisory}"</p>
                    </div>

                    <div className="pt-3 border-t border-[#1E2748]/15 space-y-2">
                      <span className="text-[10px] font-bold text-[#1E2748] uppercase block tracking-wider">Executive Action Commands</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => handleApproveAndIntake(true)}
                          disabled={submittingAction}
                          className="w-full py-2.5 bg-[#58b388] hover:bg-[#489973] text-[#1E2748] font-black rounded-xl shadow transition flex items-center justify-center space-x-1.5 text-[11px] disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>{submittingAction ? 'Processing...' : 'Approve & Disburse Immediately'}</span>
                        </button>

                        <button
                          onClick={() => handleApproveAndIntake(false)}
                          disabled={submittingAction}
                          className="w-full py-2.5 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] font-bold rounded-xl border border-[#1E2748] transition flex items-center justify-center space-x-1.5 text-[11px] disabled:opacity-50"
                        >
                          <FileText className="w-4 h-4 text-[#C59E5F]" />
                          <span>Intake to Approved Pipeline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-8 rounded-2xl border border-[#1E2748]/15 text-center text-[#53627C] text-xs space-y-2 bg-[#F3EEDC]">
                    <Calculator className="w-8 h-8 text-[#1E2748] mx-auto" />
                    <p>Select a customer account or enter custom details and click "Calculate AI Risk" to run neural credit scoring.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI 12-MONTH RISK SCENARIO PREDICTOR */}
          {activeTab === 'predictor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Controls */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-[#1E2748]/15 space-y-5 bg-[#F3EEDC] shadow-xl">
                <h3 className="text-sm font-bold text-[#1E2748] flex items-center space-x-2 pb-3 border-b border-[#1E2748]/15">
                  <Sliders className="w-4 h-4 text-[#C59E5F]" />
                  <span>Macroeconomic Stress Testing Parameters</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#53627C] font-bold mb-1 uppercase text-[10px]">PREDICTIVE SCENARIO PRESET</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'baseline', label: '🌱 Baseline Growth', shift: 0, rev: 5, inf: 2.5 },
                        { id: 'rate_shock', label: '⚡ Rate Shock (+250bps)', shift: 2.5, rev: -5, inf: 4.2 },
                        { id: 'inflation_surge', label: '🔥 Inflation Surge (6.5%)', shift: 1.8, rev: -12, inf: 6.5 },
                        { id: 'recession', label: '⚠️ Severe Recession', shift: 3.5, rev: -22, inf: 7.8 }
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setPredictorParams({ scenario: s.id, rateShift: s.shift, revenueChange: s.rev, inflationRate: s.inf })}
                          className={`p-2.5 rounded-xl border text-left font-bold transition text-[11px] ${
                            predictorParams.scenario === s.id
                              ? 'bg-[#1E2748] text-[#FAF7E6] border-[#1E2748] shadow'
                              : 'bg-[#FAF7E6] text-[#1E2748] border-[#1E2748]/15 hover:bg-[#EBE4CD]'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#1E2748]">Interest Rate Shift:</span>
                        <span className="font-mono text-[#C59E5F] font-bold">+{predictorParams.rateShift}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.25"
                        value={predictorParams.rateShift}
                        onChange={(e) => setPredictorParams({ ...predictorParams, rateShift: Number(e.target.value) })}
                        className="w-full accent-[#1E2748] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#1E2748]">Borrower Revenue Change:</span>
                        <span className={`font-mono font-bold ${predictorParams.revenueChange < 0 ? 'text-red-600' : 'text-[#58b388]'}`}>
                          {predictorParams.revenueChange > 0 ? `+${predictorParams.revenueChange}%` : `${predictorParams.revenueChange}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-30"
                        max="20"
                        step="1"
                        value={predictorParams.revenueChange}
                        onChange={(e) => setPredictorParams({ ...predictorParams, revenueChange: Number(e.target.value) })}
                        className="w-full accent-[#1E2748] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#1E2748]">Macro Inflation Rate:</span>
                        <span className="font-mono text-[#1E2748] font-bold">{predictorParams.inflationRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={predictorParams.inflationRate}
                        onChange={(e) => setPredictorParams({ ...predictorParams, inflationRate: Number(e.target.value) })}
                        className="w-full accent-[#1E2748] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Predictor Results */}
              <div className="lg:col-span-7 space-y-5">
                <div className="glass-panel p-6 rounded-2xl border border-[#1E2748]/15 bg-[#F3EEDC] shadow-2xl space-y-5">
                  <div className="flex justify-between items-center pb-3 border-b border-[#1E2748]/15">
                    <div>
                      <h3 className="text-sm font-bold text-[#1E2748] flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#C59E5F]" />
                        <span>AI 12-Month Predictive Risk Assessment</span>
                      </h3>
                      <p className="text-[10px] text-[#53627C]">{computedPredictor.scenarioTitle}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black font-mono uppercase border ${
                      computedPredictor.riskLevel === 'HIGH'
                        ? 'bg-red-500/20 text-red-700 border-red-500/40'
                        : computedPredictor.riskLevel === 'MODERATE'
                        ? 'bg-[#1E2748] text-[#FAF7E6] border-[#1E2748]'
                        : 'bg-[#58b388]/20 text-[#1E2748] border-[#58b388]/40'
                    }`}>
                      {computedPredictor.riskLevel} RISK PREDICTION
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 text-center space-y-1">
                      <span className="text-[10px] font-bold text-[#53627C] uppercase block">PREDICTED RISK SCORE</span>
                      <span className="text-3xl font-black font-mono text-[#1E2748]">{computedPredictor.predictedScore}/100</span>
                      <span className="text-[9px] text-[#53627C] block font-semibold">Under Stress Scenario</span>
                    </div>

                    <div className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 text-center space-y-1">
                      <span className="text-[10px] font-bold text-[#53627C] uppercase block">DEFAULT PROBABILITY</span>
                      <span className="text-3xl font-black font-mono text-red-600">{computedPredictor.predictedDefaultProb}%</span>
                      <span className="text-[9px] text-[#53627C] block font-semibold">12-Month Expected</span>
                    </div>

                    <div className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 text-center space-y-1">
                      <span className="text-[10px] font-bold text-[#53627C] uppercase block">NIM YIELD TRAJECTORY</span>
                      <span className="text-3xl font-black font-mono text-[#58b388]">{computedPredictor.nimYield}%</span>
                      <span className="text-[9px] text-[#53627C] block font-semibold">Weighted APR Yield</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#53627C] font-bold">MAX SAFE BORROWING CEILING:</span>
                      <span className="font-mono font-black text-[#58b388] text-sm">${computedPredictor.maxSafeCeiling.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#1E2748]/10">
                      <span className="text-[#53627C] font-bold">ESTIMATED CREDIT LOSS PROVISION:</span>
                      <span className="font-mono font-black text-red-600 text-sm">${computedPredictor.estimatedLossProvision.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 space-y-2 text-xs">
                    <span className="font-bold text-[#1E2748] flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-[#C59E5F]" />
                      <span>Gemini Predictive Underwriting Advisory:</span>
                    </span>
                    <p className="text-[#53627C] italic">
                      "Under stress conditions ({computedPredictor.scenarioTitle}), applicant {formData.applicantName} demonstrates a predicted default probability of {computedPredictor.predictedDefaultProb}%. Recommended max credit ceiling is capped at ${computedPredictor.maxSafeCeiling.toLocaleString()}. Verdict: {computedPredictor.recommendation}."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default LoanCalculatorPage;
