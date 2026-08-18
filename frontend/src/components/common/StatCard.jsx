import React from 'react';

export const StatCard = ({ title, value, change, icon: Icon, color = 'navy', description }) => {
  const colorMap = {
    navy: 'bg-[#FFFFFF] text-[#1E2748] border-[#1E2748]/15',
    gold: 'bg-[#FFFFFF] text-[#1E2748] border-[#C59E5F]/30',
    blue: 'bg-[#FFFFFF] text-[#1E2748] border-blue-500/20',
    emerald: 'bg-[#FFFFFF] text-[#1E2748] border-emerald-500/20',
    amber: 'bg-[#FFFFFF] text-[#1E2748] border-amber-500/20',
    purple: 'bg-[#FFFFFF] text-[#1E2748] border-purple-500/20',
    indigo: 'bg-[#FFFFFF] text-[#1E2748] border-indigo-500/20'
  };

  const iconBgMap = {
    navy: 'bg-[#FAF7E6] text-[#1E2748] border-[#1E2748]/20',
    gold: 'bg-[#FAF7E6] text-[#C59E5F] border-[#C59E5F]/30',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };

  return (
    <div className={`glass-card p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colorMap[color] || colorMap.navy}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#53627C] uppercase tracking-wider mb-1.5">{title}</p>
          <h3 
            className="text-2xl font-black text-[#1E2748] tracking-tight leading-none"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            {value}
          </h3>
          {description && <p className="text-xs text-[#7E8DA4] mt-1.5">{description}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border ${iconBgMap[color] || iconBgMap.navy} shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3.5 flex items-center space-x-2 text-xs font-semibold">
          <span className={change.startsWith('+') ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200' : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'}>
            {change}
          </span>
          <span className="text-[#7E8DA4]">vs last cycle</span>
        </div>
      )}
    </div>
  );
};
export default StatCard;

