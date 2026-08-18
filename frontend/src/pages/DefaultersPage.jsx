import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { AlertOctagon, Sparkles, ShieldAlert, FileText, CheckCircle2, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export const DefaultersPage = () => {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzingId, setAnalyzingId] = useState(null);
  const [activeStrategy, setActiveStrategy] = useState(null);

  const fetchDefaulters = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/ai/defaulters');
      if (res.data.success) {
        setDefaulters(res.data.defaulters);
      }
    } catch (err) {
      setError('Failed to retrieve NPA defaulters dataset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaulters();
  }, []);

  const handleAnalyzeWorkout = async (defaulter) => {
    setAnalyzingId(defaulter.id);
    setError('');
    try {
      const res = await apiClient.post('/ai/defaulters/analyze', defaulter);
      if (res.data.success) {
        setActiveStrategy(res.data.strategy);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'AI Defaulter Workout Strategy generation failed');
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#53627C]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">Loan Defaulters & NPA Risk Manager</h1>
              <p className="text-xs text-[#1E2748]/70">Early Warning Indicator & AI Non-Performing Asset (NPA) Restructuring Workout Plans</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400 font-bold">
              <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
              <span>{defaulters.length} Accounts Under Watch</span>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Retrieving non-performing asset (NPA) accounts..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Defaulter Table */}
              <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-[#1E2748]/15 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2 pb-2 border-b border-[#1E2748]/15">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Active Past-Due & NPA Accounts ({defaulters.length})</span>
                </h3>

                <div className="space-y-3">
                  {defaulters.map((d) => (
                    <div key={d.id} className="p-4 bg-[#FFFFFF]/60 rounded-xl border border-[#1E2748]/15 space-y-3 hover:border-red-600/50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm">{d.borrowerName}</h4>
                          <span className="text-[10px] font-mono text-[#1E2748]/70">ID: {d.id} | Collateral: {d.collateralType}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono uppercase ${
                          d.daysPastDue > 90
                            ? 'bg-red-500/10 text-red-400 border-red-500/40'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                        }`}>
                          {d.status} ({d.daysPastDue}d DPD)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono p-2.5 bg-[#FFFFFF] rounded-lg">
                        <div>
                          <span className="text-[9px] text-slate-400 font-sans block">ORIGINAL PRINCIPAL</span>
                          <span className="font-bold text-slate-200">${Number(d.originalPrincipal).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-sans block">REMAINING PAST DUE BALANCE</span>
                          <span className="font-extrabold text-red-400">${Number(d.remainingBalance).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#1E2748]/15 flex justify-end">
                        <button
                          onClick={() => handleAnalyzeWorkout(d)}
                          disabled={analyzingId === d.id}
                          className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-rose-800 hover:from-amber-500 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          {analyzingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                          <span>Generate AI Workout Plan</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workout Plan Strategy Card */}
              <div className="lg:col-span-5 space-y-4">
                {activeStrategy ? (
                  <div className="glass-panel p-6 rounded-2xl border border-[#1E2748]/15 space-y-4 shadow-2xl bg-rose-950/20">
                    <div className="flex justify-between items-center pb-3 border-b border-[#1E2748]/15">
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>AI NPA Workout Strategy</span>
                      </h3>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {activeStrategy.recoveryProbability}% Est. Recovery
                      </span>
                    </div>

                    <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#1E2748]/15 text-xs font-mono space-y-1">
                      <span className="text-slate-400 font-sans text-[10px] block">BORROWER ACCOUNT</span>
                      <span className="font-bold text-white text-sm block">{activeStrategy.borrowerName}</span>
                      <span className="text-amber-400 block font-bold">NPA Stage: {activeStrategy.npaClassification}</span>
                    </div>

                    <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/30 text-xs text-amber-200 space-y-1">
                      <span className="font-bold block text-amber-300">Suggested Workout Plan:</span>
                      <p>{activeStrategy.suggestedWorkoutPlan}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="font-bold text-[#1E2748] block text-[11px] uppercase tracking-wider">Recommended Loss Mitigation Actions:</span>
                      {activeStrategy.recommendedActions?.map((act, i) => (
                        <div key={i} className="p-2 bg-rose-950/50 rounded-lg border border-[#1E2748]/15 text-slate-200 flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs italic text-slate-300">
                      🤖 <span className="font-bold text-amber-400 not-italic">Gemini AI Executive Summary:</span> "{activeStrategy.aiExecutiveSummary}"
                    </div>

                    <div className="pt-2 border-t border-[#1E2748]/15 grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => alert(`✅ 90-Day Workout Plan & Restructure initiated for ${activeStrategy.borrowerName}. General Ledger NPA Provision updated.`)}
                        className="py-2 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow transition"
                      >
                        Execute 90-Day Workout Plan
                      </button>
                      <button
                        onClick={() => alert(`🚨 Asset Seizure Legal Notice generated for ${activeStrategy.borrowerName}. Transmitted to Legal Counsel.`)}
                        className="py-2 bg-rose-900/80 hover:bg-[#FAF7E6] text-rose-200 font-bold rounded-xl border border-rose-700 transition"
                      >
                        Initiate Asset Legal Recovery
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-8 rounded-2xl border border-[#1E2748]/15 text-center text-slate-400 text-xs space-y-2">
                    <FileText className="w-8 h-8 text-rose-500/40 mx-auto" />
                    <p>Select any defaulting account on the left and click "Generate AI Workout Plan" to build a Gemini recovery strategy.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default DefaultersPage;
