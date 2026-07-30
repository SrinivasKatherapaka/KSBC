import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import {
  Zap, Play, CheckCircle2, ShieldCheck, Landmark, Building, AlertOctagon,
  FileCheck, ArrowRight, Sparkles, RefreshCw, Cpu
} from 'lucide-react';

export const WorkflowAutomationPage = () => {
  const [runningWorkflow, setRunningWorkflow] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState('');

  const workflowTriggers = [
    {
      id: 'AUTOMATED_LOAN_DISBURSEMENT',
      title: 'Automated Loan Underwriting & Disbursement Workflow',
      category: 'COMMERCIAL CREDIT',
      icon: Landmark,
      description: 'Executes Gemini AI Credit Risk Assessment -> CFO Executive Clearance -> Vault Cash Verification -> Double-Entry GL Ledger Posting in a single automated step.'
    },
    {
      id: 'AUTOMATED_KYC_VERIFICATION',
      title: 'Automated Customer Onboarding & KYC OCR Workflow',
      category: 'BSA / AML COMPLIANCE',
      icon: ShieldCheck,
      description: 'Batch scans customer tax documents via OCR, screens OFAC watchlists, mutates KYC status to VERIFIED, and registers audit log.'
    },
    {
      id: 'AUTOMATED_PROCUREMENT_PO',
      title: 'Automated Procurement Requisition & PO Workflow',
      category: 'VENDOR OPERATIONS',
      icon: Building,
      description: 'Validates vendor approval status, checks IT budget allocations, generates Purchase Order, and posts expense entries to General Ledger.'
    },
    {
      id: 'AUTOMATED_NPA_RECOVERY',
      title: 'Automated NPA Early Warning & Recovery Workflow',
      category: 'RISK MANAGEMENT',
      icon: AlertOctagon,
      description: 'Monitors delinquent loans past 60 days, classifies SMA-2 status, dispatches automated Cure Notice to borrower, and structures 90-day workout plan.'
    }
  ];

  const handleTriggerWorkflow = async (workflowId) => {
    try {
      setRunningWorkflow(workflowId);
      setExecutionResult(null);
      setError('');

      const res = await apiClient.post('/ai/workflow/execute', {
        workflowType: workflowId,
        targetId: 'KSBC-AUTO-EXEC'
      });

      if (res.data.success) {
        setExecutionResult(res.data.result);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Workflow execution failed');
    } finally {
      setRunningWorkflow(null);
    }
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
                <Zap className="w-6 h-6 text-[#ffd700]" />
                <span>KSBC AI Workflow Automation Engine</span>
              </h1>
              <p className="text-xs text-[#2aa198]">
                Autonomous Enterprise Execution across Loans, Treasury, General Ledger & BSA/AML Compliance
              </p>
            </div>

            <div className="px-3.5 py-1.5 bg-[#859900]/20 border border-[#859900]/40 text-[#859900] rounded-xl text-xs font-bold flex items-center space-x-2">
              <Cpu className="w-4 h-4" />
              <span>4 Autonomous Workflows Active</span>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* Workflow Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflowTriggers.map((wf) => {
              const Icon = wf.icon;
              const isRunning = runningWorkflow === wf.id;

              return (
                <div
                  key={wf.id}
                  className="glass-panel p-6 rounded-2xl border border-[#2aa198]/30 bg-[#073642]/60 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#ffd700]/50 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[9px] font-bold border uppercase bg-[#002129] text-[#ffd700] border-[#ffd700]/30 font-mono">
                        {wf.category}
                      </span>
                      <Icon className="w-5 h-5 text-[#2aa198]" />
                    </div>

                    <h3 className="text-base font-bold text-[#fdf6e3] leading-snug">{wf.title}</h3>
                    <p className="text-xs text-[#93a1a1] leading-relaxed">{wf.description}</p>
                  </div>

                  <button
                    onClick={() => handleTriggerWorkflow(wf.id)}
                    disabled={isRunning}
                    className="w-full py-2.5 bg-gradient-to-r from-[#b58900] via-[#d4af37] to-[#b58900] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#002b36]" />
                        <span>Executing Autonomous AI Steps...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-[#002b36] fill-current" />
                        <span>Trigger AI Workflow Execution</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Execution Results Feedback Window */}
          {executionResult && (
            <div className="glass-panel p-6 rounded-2xl border border-[#859900]/40 bg-[#002129] shadow-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#2aa198]/20 pb-3">
                <div className="flex items-center space-x-2 text-[#859900]">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-base font-bold text-[#fdf6e3]">Workflow Execution Log Output</h3>
                </div>
                <span className="text-[10px] font-mono text-[#ffd700] uppercase font-bold px-2 py-0.5 bg-[#073642] rounded border border-[#2aa198]/30">
                  {executionResult.status}
                </span>
              </div>

              <p className="text-xs text-[#fdf6e3] font-medium leading-relaxed bg-[#073642]/60 p-3 rounded-xl border border-[#2aa198]/30">
                {executionResult.summary}
              </p>

              {/* Execution Steps Stepper */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-[#2aa198] uppercase block">Executed Automation Pipeline Steps:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {executionResult.executionSteps?.map((s, idx) => (
                    <div key={idx} className="p-3 bg-[#073642] rounded-xl border border-[#2aa198]/20 text-xs space-y-1">
                      <span className="text-[9px] text-[#ffd700] font-mono font-bold block">STEP {s.step}</span>
                      <p className="font-bold text-white text-[11px]">{s.action}</p>
                      <span className="text-[10px] text-[#859900] font-mono block font-bold">{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkflowAutomationPage;
