import React from 'react';

export const StatCard = ({ title, value, change, icon: Icon, color = 'gold', description }) => {
  const colorMap = {
    gold: 'from-[#dfbd84]/20 to-[#dfbd84]/5 text-[#dfbd84] border-[#dfbd84]/30',
    blue: 'from-[#dfbd84]/20 to-[#dfbd84]/5 text-[#dfbd84] border-[#dfbd84]/30',
    emerald: 'from-emerald-500/20 to-emerald-900/10 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-900/10 text-amber-300 border-amber-500/30',
    purple: 'from-purple-500/20 to-purple-900/10 text-purple-300 border-purple-500/30',
    indigo: 'from-[#dfbd84]/25 to-[#273a39]/80 text-[#dfbd84] border-[#dfbd84]/35'
  };

  return (
    <div className={`glass-panel bg-gradient-to-br ${colorMap[color] || colorMap.gold} p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] shadow-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#a4b8b5] uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-[#f4eee2] tracking-tight">{value}</h3>
          {description && <p className="text-xs text-[#a4b8b5] mt-1">{description}</p>}
        </div>
        {Icon && (
          <div className="p-3 bg-[#182423]/80 rounded-xl border border-[#dfbd84]/30 text-[#dfbd84]">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {change && (
        <div className="mt-3 flex items-center space-x-2 text-xs font-medium">
          <span className={change.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}>{change}</span>
          <span className="text-[#a4b8b5]">vs last cycle</span>
        </div>
      )}
    </div>
  );
};
export default StatCard;
