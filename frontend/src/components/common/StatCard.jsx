import React from 'react';

export const StatCard = ({ title, value, change, icon: Icon, color = 'navy', description }) => {
  const colorMap = {
    navy: 'bg-[#15203B]/85 text-[#FAF7E6] border-[#DFBD84]/20',
    gold: 'bg-[#15203B]/85 text-[#DFBD84] border-[#DFBD84]/35',
    blue: 'bg-[#15203B]/85 text-[#FAF7E6] border-blue-500/30',
    emerald: 'bg-[#15203B]/85 text-[#FAF7E6] border-emerald-500/30',
    amber: 'bg-[#15203B]/85 text-[#FAF7E6] border-amber-500/30',
    purple: 'bg-[#15203B]/85 text-[#FAF7E6] border-purple-500/30',
    indigo: 'bg-[#15203B]/85 text-[#FAF7E6] border-indigo-500/30'
  };

  const iconBgMap = {
    navy: 'bg-[#0F172A] text-[#DFBD84] border-[#DFBD84]/25',
    gold: 'bg-[#0F172A] text-[#DFBD84] border-[#DFBD84]/40',
    blue: 'bg-blue-950/60 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-950/60 text-purple-400 border-purple-500/30',
    indigo: 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30'
  };

  return (
    <div className={`glass-card p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${colorMap[color] || colorMap.navy}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">{title}</p>
          <h3 
            className="text-2xl font-black text-[#FAF7E6] tracking-tight leading-none"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            {value}
          </h3>
          {description && <p className="text-xs text-[#94A3B8]/80 mt-1.5">{description}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border ${iconBgMap[color] || iconBgMap.navy} shadow-md`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3.5 flex items-center space-x-2 text-xs font-semibold">
          <span className={change.startsWith('+') ? 'text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30' : 'text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30'}>
            {change}
          </span>
          <span className="text-[#94A3B8]">vs last cycle</span>
        </div>
      )}
    </div>
  );
};
export default StatCard;


