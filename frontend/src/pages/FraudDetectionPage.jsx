import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { ShieldAlert, AlertTriangle, CheckCircle2, Lock, Sparkles, Loader2, Globe, ArrowRight } from 'lucide-react';

export const FraudDetectionPage = () => {
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzingTxId, setAnalyzingTxId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [frozenAccounts, setFrozenAccounts] = useState([]);

  const fetchFraudAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/ai/fraud-transactions');
      if (res.data.success) {
        setFraudAlerts(res.data.fraudAlerts);
      }
    } catch (err) {
      setError('Failed to retrieve fraud monitoring feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const handleAnalyzeFraud = async (tx) => {
    setAnalyzingTxId(tx.transactionId);
    setError('');
    try {
      const res = await apiClient.post('/ai/fraud-detection/analyze', tx);
      if (res.data.success) {
        setAnalysisResult(res.data.fraudAnalysis);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'AI Fraud detection analysis failed');
    } finally {
      setAnalyzingTxId(null);
    }
  };

  const handleFreezeAccount = (accNo) => {
    if (!frozenAccounts.includes(accNo)) {
      setFrozenAccounts([...frozenAccounts, accNo]);
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
              <h1 className="text-2xl font-extrabold text-white font-heading">AI Fraudulent Transaction Engine</h1>
              <p className="text-xs text-[#1E2748]/70">Real-Time Gemini 2.5 Anomaly Scoring & Anti-Money Laundering (AML) Sentinel</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400 font-bold">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Real-Time Security Sentinel Active</span>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Connecting to real-time transaction fraud monitoring stream..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Suspicious Transactions Feed */}
              <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-[#1E2748]/15 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2 pb-2 border-b border-[#1E2748]/15">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Flagged Suspicious Transactions ({fraudAlerts.length})</span>
                </h3>

                <div className="space-y-3">
                  {fraudAlerts.map((tx) => {
                    const isFrozen = frozenAccounts.includes(tx.accountNumber);
                    return (
                      <div key={tx.transactionId} className="p-4 bg-[#FFFFFF]/60 rounded-xl border border-[#1E2748]/15 space-y-3 hover:border-rose-600/50 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm">{tx.accountHolder}</h4>
                            <span className="text-[10px] font-mono text-amber-300">
                              {tx.accountNumber} | {tx.transactionType}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono uppercase ${
                              tx.riskTag === 'HIGH_RISK_FRAUD'
                                ? 'bg-red-500/10 text-red-400 border-red-500/40'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                            }`}>
                              {tx.riskTag.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono p-2.5 bg-[#FFFFFF] rounded-lg">
                          <div>
                            <span className="text-[9px] text-slate-400 font-sans block">AMOUNT</span>
                            <span className="font-extrabold text-red-400">${Number(tx.amount).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-sans block">LOCATION & IP</span>
                            <span className="font-bold text-slate-200 text-[11px] truncate block">{tx.location}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-sans block">FRAUD SCORE</span>
                            <span className="font-extrabold text-amber-400">{tx.fraudScore}/100</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-[#1E2748]/15 flex items-center justify-between">
                          {isFrozen ? (
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg text-xs flex items-center space-x-1 border border-red-500/40">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Account Frozen & Assets Locked</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleFreezeAccount(tx.accountNumber)}
                              className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 font-bold rounded-xl text-xs transition border border-red-600/40"
                            >
                              Freeze Account Immediately
                            </button>
                          )}

                          <button
                            onClick={() => handleAnalyzeFraud(tx)}
                            disabled={analyzingTxId === tx.transactionId}
                            className="px-3.5 py-1.5 bg-[#1E2748] hover:bg-[#141C33] text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5 disabled:opacity-50 border border-[#1E2748]/20"
                          >
                            {analyzingTxId === tx.transactionId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                            <span>Run AI Fraud Audit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Fraud Analysis Result Box */}
              <div className="lg:col-span-5 space-y-4">
                {analysisResult ? (
                  <div className="glass-panel p-6 rounded-2xl border border-[#1E2748]/15 space-y-4 shadow-2xl bg-rose-950/20">
                    <div className="flex justify-between items-center pb-3 border-b border-[#1E2748]/15">
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Gemini AI Fraud Audit</span>
                      </h3>
                      <span className="text-xs font-mono font-bold text-red-400">
                        {analysisResult.fraudScore}/100 Score
                      </span>
                    </div>

                    <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#1E2748]/15 text-xs font-mono space-y-1">
                      <span className="text-slate-400 font-sans text-[10px] block">TRANSACTION AUDIT VERDICT</span>
                      <span className="font-bold text-white text-sm block">{analysisResult.transactionId}</span>
                      <span className="text-red-400 block font-bold">Risk Tag: {analysisResult.riskTag}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="font-bold text-[#1E2748] block text-[11px] uppercase tracking-wider">Detected Anomaly Signals:</span>
                      {analysisResult.anomalyFactors?.map((f, i) => (
                        <div key={i} className="p-2 bg-red-950/40 rounded-lg border border-red-900/30 text-red-300 flex items-center space-x-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs italic text-slate-300 space-y-1">
                      <span className="font-bold text-amber-400 not-italic block">🤖 Gemini Fraud Summary:</span>
                      <p>"{analysisResult.aiFraudSummary}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-8 rounded-2xl border border-[#1E2748]/15 text-center text-slate-400 text-xs space-y-2">
                    <ShieldAlert className="w-8 h-8 text-rose-500/40 mx-auto" />
                    <p>Click "Run AI Fraud Audit" on any flagged transaction to generate deep Gemini anomaly diagnostic signals.</p>
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
export default FraudDetectionPage;
