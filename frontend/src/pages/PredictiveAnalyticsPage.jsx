import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import {
  TrendingUp, BarChart3, ShieldAlert, DollarSign, Activity, Sparkles, Filter
} from 'lucide-react';

export const PredictiveAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scenario, setScenario] = useState('baseline');
  const [analytics, setAnalytics] = useState(null);

  const fetchPredictiveData = async (selectedScenario) => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.post('/ai/predictive-analytics', {
        forecastMonths: 12,
        scenario: selectedScenario
      });

      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      setError('Failed to fetch predictive analytics modeling');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictiveData(scenario);
  }, [scenario]);

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#1E2748] text-[#53627C]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#1E2748] font-heading flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-[#1E2748]" />
                <span>KSBC AI Predictive Analytics & Stress Testing</span>
              </h1>
              <p className="text-xs text-[#1E2748]">
                12-Month Horizon Forecasts for Treasury Liquidity, Portfolio Defaults & NIM Rate Sensitivity
              </p>
            </div>

            {/* Scenario Selector */}
            <div className="flex items-center space-x-2 bg-[#F6F2E3] text-[#1E2748] p-1.5 rounded-xl border border-[#1E2748]/15 text-xs">
              <span className="text-[10px] font-bold text-[#1E2748] uppercase px-2">Stress Scenario:</span>
              {[
                { id: 'baseline', label: 'Baseline Growth' },
                { id: 'adverse', label: 'Adverse Economic' },
                { id: 'severe', label: 'Severe Recession' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                    scenario === s.id
                      ? 'bg-[#F6F2E3] text-[#1E2748] text-[#1E2748] border border-[#1E2748]/15 shadow'
                      : 'text-[#53627C] hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Simulating 12-month predictive Monte Carlo trajectory..." />
          ) : analytics ? (
            <div className="space-y-6">
              {/* Executive Predictive Advisory Panel */}
              <div className="glass-panel p-5 rounded-2xl border border-[#1E2748]/15 bg-[#F6F2E3] text-[#1E2748]/80 space-y-2 shadow-xl">
                <div className="flex items-center space-x-2 text-[#1E2748]">
                  <Sparkles className="w-5 h-5 text-[#1E2748]" />
                  <h3 className="text-sm font-bold text-[#1E2748]">Gemini AI 12-Month Predictive Executive Summary</h3>
                </div>
                <div className="text-xs text-[#1E2748] whitespace-pre-line leading-relaxed font-sans bg-[#F6F2E3] text-[#1E2748] p-4 rounded-xl border border-[#1E2748]/15">
                  {analytics.aiExecutiveSummary}
                </div>
              </div>

              {/* Stress Test KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/60 rounded-2xl border border-[#1E2748]/15 space-y-1">
                  <span className="text-[10px] font-bold text-[#1E2748] uppercase block">PROJECTED DEPOSITS (12M)</span>
                  <span className="text-xl font-black text-[#1E2748] font-mono">
                    ${(analytics.projectedDepositCurve[11] / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-[10px] text-[#58b388] block font-bold">+18.0% Cumulative Growth</span>
                </div>

                <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/60 rounded-2xl border border-[#1E2748]/15 space-y-1">
                  <span className="text-[10px] font-bold text-[#1E2748] uppercase block">PROJECTED PORTFOLIO (12M)</span>
                  <span className="text-xl font-black text-[#1E2748] font-mono">
                    ${(analytics.projectedPortfolioCurve[11] / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-[10px] text-[#58b388] block font-bold">+26.4% Expansion</span>
                </div>

                <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/60 rounded-2xl border border-[#1E2748]/15 space-y-1">
                  <span className="text-[10px] font-bold text-[#1E2748] uppercase block">PROBABILITY OF DEFAULT (PD)</span>
                  <span className="text-xl font-black text-amber-300 font-mono">
                    {analytics.stressTestMetrics.probabilityOfDefault}
                  </span>
                  <span className="text-[10px] text-[#53627C] block font-medium">ECL Provision: ${analytics.stressTestMetrics.expectedCreditLossAmount.toLocaleString()}</span>
                </div>

                <div className="p-4 bg-[#F6F2E3] text-[#1E2748]/60 rounded-2xl border border-[#1E2748]/15 space-y-1">
                  <span className="text-[10px] font-bold text-[#1E2748] uppercase block">TIER-1 CAPITAL ADEQUACY</span>
                  <span className="text-xl font-black text-[#58b388] font-mono">
                    {analytics.stressTestMetrics.tier1CapitalCoverage}
                  </span>
                  <span className="text-[10px] text-[#58b388] block font-bold">LCR: {analytics.stressTestMetrics.liquidityCoverageRatio}</span>
                </div>
              </div>

              {/* 12-Month Predictive Monthly Trajectory Table */}
              <div className="glass-panel p-5 rounded-2xl border border-[#1E2748]/15 bg-[#F6F2E3] text-[#1E2748]/60 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-[#1E2748] flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#1E2748]" />
                  <span>12-Month Projected Trajectory Breakdown ({scenario.toUpperCase()} Scenario)</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1E2748]/15 text-[#1E2748] uppercase tracking-wider text-[10px] bg-[#F6F2E3] text-[#1E2748]">
                        <th className="py-3 px-3">Month</th>
                        <th className="py-3 px-3 text-right">Projected Deposits ($)</th>
                        <th className="py-3 px-3 text-right">Projected Portfolio ($)</th>
                        <th className="py-3 px-3 text-center">NIM Rate Yield (% APR)</th>
                        <th className="py-3 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2748]/15">
                      {analytics.months.map((m, idx) => (
                        <tr key={idx} className="hover:bg-[#F6F2E3] text-[#1E2748]/40 transition font-mono">
                          <td className="py-3 px-3 font-bold text-[#1E2748] font-sans">{m}</td>
                          <td className="py-3 px-3 text-right font-extrabold text-[#1E2748]">
                            ${analytics.projectedDepositCurve[idx].toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-[#58b388]">
                            ${analytics.projectedPortfolioCurve[idx].toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center text-[#1E2748] font-bold">
                            {analytics.netInterestMarginCurve[idx]}% APR
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold border uppercase bg-[#58b388]/20 text-[#58b388] border-[#58b388]/40 font-sans">
                              Forecast
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsPage;
