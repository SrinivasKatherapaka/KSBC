import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import RiskAssessmentBadge from '../components/loans/RiskAssessmentBadge';
import { Calculator, Sparkles, TrendingUp, ShieldCheck, DollarSign, AlertCircle } from 'lucide-react';

export const LoanCalculatorPage = () => {
  const [revenue, setRevenue] = useState(12500000);
  const [existingDebt, setExistingDebt] = useState(1800000);
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [termMonths, setTermMonths] = useState(36);

  // Math Calculations
  const annualDebtService = existingDebt + (loanAmount / (termMonths / 12));
  const dtiRatio = Number((annualDebtService / Math.max(revenue, 1)).toFixed(2));
  
  const rawRisk = Math.min(Math.round((loanAmount / Math.max(revenue, 1)) * 40 + dtiRatio * 30), 95);
  const riskScore = Math.max(rawRisk, 12);
  const riskLevel = riskScore > 70 ? 'HIGH' : (riskScore > 40 ? 'MODERATE' : 'LOW');
  const dscr = Number(((revenue * 0.3) / Math.max(annualDebtService, 1)).toFixed(2));

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-heading">AI Credit & Risk Simulator</h1>
            <p className="text-xs text-slate-400">Interactive Underwriting Engine & Debt Service Exposure Modeler</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                <Calculator className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Commercial Application Variables</h3>
              </div>

              <div className="space-y-5 text-xs">
                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span className="text-slate-300">Annual Business Revenue</span>
                    <span className="text-blue-400 font-mono">${revenue.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="50000000"
                    step="250000"
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span className="text-slate-300">Requested Principal Amount</span>
                    <span className="text-emerald-400 font-mono">${loanAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="25000000"
                    step="100000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold">
                    <span className="text-slate-300">Existing Annual Debt Obligations</span>
                    <span className="text-amber-400 font-mono">${existingDebt.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={existingDebt}
                    onChange={(e) => setExistingDebt(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full glass-input bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Term Length (Months)</label>
                    <select
                      value={termMonths}
                      onChange={(e) => setTermMonths(Number(e.target.value))}
                      className="w-full glass-input bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    >
                      <option value="12">12 Months</option>
                      <option value="24">24 Months</option>
                      <option value="36">36 Months</option>
                      <option value="60">60 Months</option>
                      <option value="120">120 Months</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Risk Output Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Calculated Risk Metrics</span>
                </div>

                <div className="text-center p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Calculated Risk Score</span>
                  <div className="text-4xl font-extrabold font-mono text-white">
                    {riskScore}<span className="text-xs text-slate-500">/100</span>
                  </div>
                  <RiskAssessmentBadge score={riskScore} level={riskLevel} />
                </div>

                <div className="mt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2.5 bg-slate-900/50 rounded-xl">
                    <span className="text-slate-400">Debt-To-Income (DTI):</span>
                    <span className="font-bold text-white">{dtiRatio}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-900/50 rounded-xl">
                    <span className="text-slate-400">Debt Service Coverage (DSCR):</span>
                    <span className="font-bold text-emerald-400">{dscr}x</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-900/50 rounded-xl">
                    <span className="text-slate-400">Max Safe Exposure:</span>
                    <span className="font-bold text-blue-400">${Math.round(revenue * 0.45).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300">
                <span className="font-bold block mb-1">Underwriting Recommendation:</span>
                {riskScore <= 40 
                  ? '✓ APPROVE - Strong cash flow coverage and low debt ratio.' 
                  : (riskScore <= 70 
                  ? '⚠️ CONDITIONAL APPROVE - Require additional collateral guarantee.' 
                  : '❌ REJECT - Excessive debt-to-income leverage.')}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default LoanCalculatorPage;
