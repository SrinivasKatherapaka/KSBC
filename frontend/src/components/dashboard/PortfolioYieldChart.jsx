import React from 'react';
import { TrendingUp } from 'lucide-react';

export const PortfolioYieldChart = ({ totalPortfolio = 2500000, yieldPercentage = 6.5 }) => {
  // SVG Chart representation for banking portfolio yield curve
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const values = [40, 55, 62, 70, 85, 92, 100];
  const points = values.map((val, idx) => `${idx * 60 + 20},${140 - val * 1.1}`).join(' ');

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Commercial Loan Portfolio Yield & Asset Trajectory</h3>
          <p className="text-xs text-slate-400">Real-time interest accrued & capital growth</p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
          <TrendingUp className="w-4 h-4" />
          <span>+{yieldPercentage}% Annual Yield</span>
        </div>
      </div>

      <div className="relative w-full h-44 bg-slate-900/40 rounded-xl p-4 flex flex-col justify-end">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 140">
          <defs>
            <linearGradient id="gradientYield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polyline
            fill="url(#gradientYield)"
            stroke="none"
            points={`20,140 ${points} 380,140`}
          />
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            points={points}
          />
          {values.map((val, idx) => (
            <circle
              key={idx}
              cx={idx * 60 + 20}
              cy={140 - val * 1.1}
              r="4"
              className="fill-blue-400 stroke-slate-900 stroke-2"
            />
          ))}
        </svg>
        <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2 px-2">
          {months.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">TOTAL DISBURSED PORTFOLIO</span>
          <span className="text-lg font-extrabold text-white font-mono">${Number(totalPortfolio).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">ESTIMATED MONTHLY INTEREST REVENUE</span>
          <span className="text-lg font-extrabold text-emerald-400 font-mono">
            ${Math.round((totalPortfolio * yieldPercentage) / 100 / 12).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
export default PortfolioYieldChart;
