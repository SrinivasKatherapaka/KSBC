import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, ArrowRight, DollarSign } from 'lucide-react';

export const LoanLifecycleTracker = ({ currentStatus }) => {
  const steps = [
    { key: 'draft', label: '1. Customer Ops Draft' },
    { key: 'compliance_review', label: '2. Compliance & KYC' },
    { key: 'underwriting', label: '3. AI Risk Scoring' },
    { key: 'approved', label: '4. Loan Officer Approval' },
    { key: 'disbursed', label: '5. Treasury Disbursement & GL' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'draft': return 0;
      case 'compliance_review': return 1;
      case 'underwriting': return 2;
      case 'approved': return 3;
      case 'disbursed': return 4;
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  if (currentStatus === 'rejected') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center space-x-2 text-red-400 text-xs font-bold">
        <ShieldAlert className="w-4 h-4" />
        <span>Application Rejected by Underwriting / Compliance</span>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                isDone 
                  ? 'bg-emerald-500 text-black border-emerald-400' 
                  : isCurrent 
                  ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/20' 
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-[10px] font-semibold mt-1 text-center truncate max-w-[100px] ${
                isCurrent ? 'text-blue-400 font-bold' : (isDone ? 'text-emerald-400' : 'text-slate-500')
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default LoanLifecycleTracker;
