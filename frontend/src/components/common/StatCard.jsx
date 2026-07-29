import React from 'react';

export const StatCard = ({ title, value, change, icon: Icon, color = 'blue', description }) => {
  const colorMap = {
    blue: 'from-blue-600/20 to-blue-900/10 text-blue-400 border-blue-500/20',
    emerald: 'from-emerald-600/20 to-emerald-900/10 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-900/10 text-amber-400 border-amber-500/20',
    purple: 'from-purple-600/20 to-purple-900/10 text-purple-400 border-purple-500/20',
    indigo: 'from-indigo-600/20 to-indigo-900/10 text-indigo-400 border-indigo-500/20'
  };

  return (
    <div className={`glass-panel bg-gradient-to-br ${colorMap[color] || colorMap.blue} p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">{value}</h3>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        {Icon && (
          <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3 flex items-center space-x-2 text-xs font-medium">
          <span className={change.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}>{change}</span>
          <span className="text-slate-400">vs last cycle</span>
        </div>
      )}
    </div>
  );
};
export default StatCard;
