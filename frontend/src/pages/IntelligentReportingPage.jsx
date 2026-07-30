import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import {
  FileText, Download, Copy, Check, Sparkles, ShieldCheck, Printer, RefreshCw
} from 'lucide-react';

export const IntelligentReportingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('EXECUTIVE_FINANCIAL_SUMMARY');
  const [period, setPeriod] = useState('Q3 2026');
  const [reportData, setReportData] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchReport = async (selectedType, selectedPeriod) => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.post('/ai/intelligent-reporting/generate', {
        reportType: selectedType,
        period: selectedPeriod
      });

      if (res.data.success) {
        setReportData(res.data.report);
      }
    } catch (err) {
      setError('Failed to generate intelligent report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportType, period);
  }, [reportType, period]);

  const handleCopyMarkdown = () => {
    if (!reportData?.contentMarkdown) return;
    navigator.clipboard.writeText(reportData.contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrintReport = () => {
    window.print();
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
              <h1 className="text-2xl font-black text-[#fdf6e3] font-heading flex items-center space-x-2">
                <FileText className="w-6 h-6 text-[#ffd700]" />
                <span>KSBC AI Intelligent Reporting Engine</span>
              </h1>
              <p className="text-xs text-[#2aa198]">
                Automated Publication-Ready Financial Summaries, Regulatory Audits & Stress Test Reports
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center space-x-2 self-start md:self-auto">
              <button
                onClick={handleCopyMarkdown}
                className="px-3.5 py-2 bg-[#073642] hover:bg-[#002129] text-[#ffd700] text-xs font-bold rounded-xl border border-[#ffd700]/30 transition flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-[#859900]" /> : <Copy className="w-4 h-4 text-[#ffd700]" />}
                <span>{copied ? 'Copied Markdown!' : 'Copy Markdown Report'}</span>
              </button>

              <button
                onClick={handlePrintReport}
                className="px-4 py-2 bg-gradient-to-r from-[#b58900] via-[#d4af37] to-[#b58900] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4 text-[#002b36]" />
                <span>Export / Print PDF</span>
              </button>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* Controls Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/30 bg-[#073642]/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-[#2aa198] uppercase">Select Report Module:</span>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2 text-[#fdf6e3] font-bold"
              >
                <option value="EXECUTIVE_FINANCIAL_SUMMARY">📋 Board Executive Financial Summary</option>
                <option value="BASEL_III_REGULATORY_AUDIT">🏛️ Basel III Regulatory Compliance Audit</option>
                <option value="QUARTERLY_NPA_STRESS_TEST">⚠️ Quarterly NPA Credit Risk & Provisions</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-[#2aa198] uppercase">Audit Period:</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2 text-[#ffd700] font-mono font-bold"
              >
                <option value="Q3 2026">Q3 2026 (Current Period)</option>
                <option value="Q2 2026">Q2 2026</option>
                <option value="FY 2025-2026">FY 2025-2026 Annual Audit</option>
              </select>
            </div>
          </div>

          {/* Main Report Document View */}
          {loading ? (
            <LoadingSpinner text="Synthesizing publication-ready Gemini AI intelligent report..." />
          ) : reportData ? (
            <div className="glass-panel p-8 rounded-2xl border border-[#2aa198]/30 bg-[#073642]/70 shadow-2xl space-y-6 text-xs leading-relaxed font-sans">
              <div className="flex items-center justify-between border-b border-[#2aa198]/20 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#ffd700] font-bold uppercase px-2 py-0.5 bg-[#002129] rounded border border-[#ffd700]/30">
                    AUTOMATED AI REPORT SYNTHESIS
                  </span>
                  <h2 className="text-xl font-extrabold text-[#fdf6e3] mt-2">{reportData.title}</h2>
                  <p className="text-[11px] text-[#2aa198]">Generated on {new Date(reportData.generatedAt).toLocaleString()}</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-[10px] text-[#93a1a1] block font-sans uppercase">Security Clearance</span>
                  <span className="text-[#859900] font-bold">RESTRICTED EXECUTIVE</span>
                </div>
              </div>

              {/* Formatted Markdown Content Render */}
              <div className="prose prose-invert max-w-none text-[#fdf6e3] space-y-4 font-sans text-xs">
                <div className="p-5 bg-[#002129] rounded-2xl border border-[#2aa198]/30 space-y-3 whitespace-pre-line">
                  {reportData.contentMarkdown}
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default IntelligentReportingPage;
