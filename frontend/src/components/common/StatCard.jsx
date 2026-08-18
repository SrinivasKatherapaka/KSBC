import React from 'react';

export const StatCard = ({ title, value, change, icon: Icon, color = 'navy', description }) => {
  const colorMap = {
    navy: 'bg-[#F6F2E3] text-[#1E2748] border-[#1E2748]/15',
    gold: 'bg-[#F6F2E3] text-[#1E2748] border-[#C59E5F]/35',
    blue: 'bg-[#F6F2E3] text-[#1E2748] border-blue-500/25',
    emerald: 'bg-[#F6F2E3] text-[#1E2748] border-emerald-600/25',
    amber: 'bg-[#F6F2E3] text-[#1E2748] border-amber-600/25',
    purple: 'bg-[#F6F2E3] text-[#1E2748] border-purple-600/25',
    indigo: 'bg-[#F6F2E3] text-[#1E2748] border-indigo-600/25'
  };

  const iconBgMap = {
    navy: 'bg-[#EBE4CD] text-[#1E2748] border-[#1E2748]/20',
    gold: 'bg-[#EBE4CD] text-[#C59E5F] border-[#C59E5F]/35',
    blue: 'bg-blue-100/60 text-blue-800 border-blue-300',
    emerald: 'bg-emerald-100/60 text-emerald-800 border-emerald-300',
    amber: 'bg-amber-100/60 text-amber-800 border-amber-300',
    purple: 'bg-purple-100/60 text-purple-800 border-purple-300',
    indigo: 'bg-indigo-100/60 text-indigo-800 border-indigo-300'
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
          {description && <p className="text-xs text-[#53627C]/80 mt-1.5">{description}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border ${iconBgMap[color] || iconBgMap.navy} shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3.5 flex items-center space-x-2 text-xs font-semibold">
          <span className={change.startsWith('+') ? 'text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300' : 'text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300'}>
            {change}
          </span>
          <span className="text-[#53627C]">vs last cycle</span>
        </div>
      )}
    </div>
  );
};
export default StatCard;



