import React from 'react';

export const FlyingMatLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`relative ${sizeClasses[size] || sizeClasses.md} rounded-2xl bg-gradient-to-br from-rose-700 via-rose-900 to-amber-600 flex items-center justify-center font-bold text-white shadow-xl shadow-rose-900/40 border border-rose-500/30 group hover:scale-105 transition-transform duration-300`}>
        {/* Flying Mat Motion trails SVG */}
        <svg className="w-3/5 h-3/5 text-amber-300 drop-shadow-md animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Aerodynamic Flying Mat Carpet paths */}
          <path d="M2 17c3-3 8-6 13-3s7 4 7 4" />
          <path d="M4 12c3-3 8-5 13-2s5 3 5 3" />
          <path d="M6 7c3-3 7-4 12-1s4 2 4 2" />
          {/* Tassel trailing accents */}
          <circle cx="2" cy="17" r="1" fill="currentColor" />
          <circle cx="4" cy="12" r="1" fill="currentColor" />
          <circle cx="6" cy="7" r="1" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <h1 className="font-heading font-extrabold text-white text-base tracking-wider leading-none">
            KSBC <span className="text-rose-500 font-normal text-xs uppercase tracking-widest block">BANKING ERP</span>
          </h1>
        </div>
      )}
    </div>
  );
};

export default FlyingMatLogo;
