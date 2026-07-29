import React from 'react';

export const RiskAssessmentBadge = ({ score, level }) => {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
        Pending AI Evaluation
      </span>
    );
  }

  const scoreNum = Number(score);
  let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let levelText = level || 'LOW';

  if (scoreNum > 70) {
    colorClass = 'bg-red-500/10 text-red-400 border-red-500/30';
    levelText = level || 'HIGH / CRITICAL';
  } else if (scoreNum > 40) {
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    levelText = level || 'MODERATE';
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
      <span className="font-mono">{scoreNum}/100</span>
      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/30">{levelText}</span>
    </span>
  );
};
export default RiskAssessmentBadge;
