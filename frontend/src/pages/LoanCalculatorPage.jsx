import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { Calculator, Sparkles, DollarSign, ShieldAlert, CheckCircle2, Percent, TrendingUp, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

export const LoanCalculatorPage = () => {
  const [formData, setFormData] = useState({
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

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

  return (
    <div className="flex min-h-screen bg-[#002b36] text-[#93a1a1]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">AI Loan Risk Calculator</h1>
              <p className="text-xs text-rose-300/60">Powered by Gemini 2.5 Flash Underwriting & Credit Risk Engine</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Real-Time Neural Credit Scoring</span>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Form */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-rose-900/30 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-rose-900/30">
                <Calculator className="w-4 h-4 text-rose-400" />
                <span>Input Applicant Credit Parameters</span>
              </h3>

              <form onSubmit={handleCalculate} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Applicant Category</label>
                    <select
                      value={formData.applicantCategory}
                      onChange={(e) => setFormData({ ...formData, applicantCategory: e.target.value })}
                      className="w-full glass-input bg-[#1a030b] border border-rose-900/40 rounded-xl p-2.5 text-white"
                    >
                      <option value="private_individual">👤 Private / Individual Account Holder</option>
                      <option value="corporate">🏢 Corporate Enterprise</option>
                      <option value="sme">🏬 SME Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Credit Score (FICO/FICO-B)</label>
                    <input
                      type="number"
                      min="300"
                      max="850"
                      value={formData.creditScore}
                      onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                      className="w-full glass-input bg-[#1a030b] border border-rose-900/40 rounded-xl p-2.5 text-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Requested Principal ($)</label>
                    <input
                      type="number"
                      min="10000"
                      max="50000000"
                      value={formData.principalAmount}
                      onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                      className="w-full glass-input bg-[#1a030b] border border-rose-900/40 rounded-xl p-2.5 text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Annual Revenue / Income ($)</label>
                    <input
                      type="number"
                      min="50000"
                      max="100000000"
                      value={formData.annualIncome}
                      onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                      className="w-full glass-input bg-[#1a030b] border border-rose-900/40 rounded-xl p-2.5 text-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="30"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      className="w-full glass-input bg-[#1a030b] border border-rose-900/40 rounded-xl p-2.5 text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Term Length</label>
                    <select
                      value={formData.termMonths}
                      onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
                      className="w-full glass-input bg-[#1a030b] border border-rose-900/40 rounded-xl p-2.5 text-white"
                    >
                      <option value="12">12 Months (1 yr)</option>
                      <option value="24">24 Months (2 yrs)</option>
                      <option value="36">36 Months (3 yrs)</option>
                      <option value="60">60 Months (5 yrs)</option>
                      <option value="120">120 Months (10 yrs)</option>
                      <option value="240">240 Months (20 yrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Collateral Value ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.collateralValue}
                      onChange={(e) => setFormData({ ...formData, collateralValue: e.target.value })}
                      className="w-full glass-input bg-[#1a030b] border border-rose-900/40 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Loan Purpose</label>
                  <select
                    value={formData.loanPurpose}
                    onChange={(e) => setFormData({ ...formData, loanPurpose: e.target.value })}
                    className="w-full glass-input bg-[#1a030b] border border-rose-900/40 rounded-xl p-2.5 text-white"
                  >
                    <option value="Equipment Purchase & Automation">Equipment Purchase & Automation</option>
                    <option value="Working Capital Expansion">Working Capital Expansion</option>
                    <option value="Commercial Real Estate Acquisition">Commercial Real Estate Acquisition</option>
                    <option value="Debt Refinancing & Consolidation">Debt Refinancing & Consolidation</option>
                    <option value="Personal Wealth Portfolio Scaling">Personal Wealth Portfolio Scaling</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-rose-800 via-rose-700 to-amber-600 hover:from-rose-700 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 border border-rose-500/40"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{loading ? 'Evaluating Gemini AI Credit Model...' : 'Calculate AI Risk & Underwriting Decision'}</span>
                </button>
              </form>
            </div>

            {/* Assessment Output Gauge */}
            <div className="lg:col-span-5 space-y-5">
              {loading ? (
                <div className="glass-panel p-10 rounded-2xl border border-rose-900/30 text-center">
                  <LoadingSpinner text="Running Gemini 2.5 Flash Neural Risk Model..." />
                </div>
              ) : assessment ? (
                <div className="glass-panel p-6 rounded-2xl border border-rose-900/40 space-y-5 shadow-2xl bg-rose-950/20">
                  <div className="flex justify-between items-center pb-3 border-b border-rose-900/30">
                    <h3 className="text-base font-bold text-white">AI Credit Underwriting Verdict</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border uppercase ${
                      assessment.recommendation === 'APPROVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                        : assessment.recommendation === 'CONDITIONAL_APPROVE'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                        : 'bg-red-500/10 text-red-400 border-red-500/40'
                    }`}>
                      {assessment.recommendation.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Score Dial */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-950/60 rounded-xl border border-rose-900/40 text-center">
                      <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">AI RISK SCORE</span>
                      <span className={`text-3xl font-extrabold font-mono ${
                        assessment.riskScore > 70 ? 'text-red-400' : assessment.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {assessment.riskScore}/100
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-semibold">{assessment.riskLevel} RISK</span>
                    </div>

                    <div className="p-4 bg-rose-950/60 rounded-xl border border-rose-900/40 text-center">
                      <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">DEFAULT PROBABILITY</span>
                      <span className="text-3xl font-extrabold font-mono text-amber-400">
                        {assessment.defaultProbability}%
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-semibold">12-Month Horizon</span>
                    </div>
                  </div>

                  {/* Recommended Limit */}
                  <div className="p-3.5 bg-rose-950/80 rounded-xl border border-rose-900/40 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-sans">MAX RECOMMENDED CREDIT LIMIT:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">${Number(assessment.maxRecommendedLoan || 0).toLocaleString()}</span>
                  </div>

                  {/* Key Risks */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-rose-300 block text-[11px] uppercase tracking-wider">Identified Risk Factors:</span>
                    {assessment.keyRisks?.map((r, i) => (
                      <div key={i} className="p-2 bg-red-950/30 rounded-lg border border-red-900/30 text-red-300 flex items-center space-x-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Executive Advisory */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs italic text-slate-300 space-y-1">
                    <span className="font-bold text-amber-400 not-italic block">🤖 Gemini AI Advisory:</span>
                    <p>"{assessment.summaryAdvisory}"</p>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-8 rounded-2xl border border-rose-900/30 text-center text-slate-400 text-xs space-y-2">
                  <Calculator className="w-8 h-8 text-rose-500/40 mx-auto" />
                  <p>Input credit parameters and click "Calculate AI Risk" to run neural credit scoring.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default LoanCalculatorPage;
