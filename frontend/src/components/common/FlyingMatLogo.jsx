import React from 'react';
import { Link } from 'react-router-dom';

export const KSBCShieldLogoIcon = ({ className = "w-9 h-9" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_2px_12px_rgba(249,115,22,0.7)] ${className}`}
  >
    <defs>
      <linearGradient id="ksbcShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="40%" stopColor="#ff6b00" />
        <stop offset="80%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
      <linearGradient id="ksbcInnerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#002129" stopOpacity="0.8" />
      </linearGradient>
    </defs>

    {/* Modern Financial Shield Outie Line Art Silhouette */}
    <path 
      d="M 50 8 L 86 24 C 86 54, 70 78, 50 92 C 30 78, 14 54, 14 24 Z" 
      fill="url(#ksbcInnerGlow)"
      stroke="url(#ksbcShieldGrad)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Inner Precision Diamond Grid Line Art */}
    <path 
      d="M 50 18 L 76 30 C 76 54, 64 72, 50 82 C 36 72, 24 54, 24 30 Z" 
      stroke="url(#ksbcShieldGrad)"
      strokeWidth="2"
      strokeDasharray="4 2"
      opacity="0.85"
    />

    {/* Stylized 'K' Banking Monogram */}
    <path 
      d="M 40 32 L 40 68 M 40 50 L 60 32 M 40 50 L 60 68" 
      stroke="url(#ksbcShieldGrad)" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />

    {/* Metallic Gold Crown Accent Nodes */}
    <circle cx="50" cy="18" r="2.5" fill="#ffd700" />
    <circle cx="50" cy="82" r="2" fill="#ff6b00" />
  </svg>
);

export const FlyingMatLogo = ({ size = 'md', className = '' }) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const textSizeClasses = {
    sm: 'text-xl tracking-wider',
    md: 'text-2xl tracking-widest',
    lg: 'text-3xl tracking-widest',
    xl: 'text-4xl tracking-widest'
  };

  return (
    <Link 
      to="/dashboard" 
      className={`inline-flex items-center space-x-3 cursor-pointer group ${className}`} 
      title="KSBC Digital Banking ERP - Return to Dashboard"
    >
      {/* KSBC Corporate Shield Logo Icon */}
      <div className="relative flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
        <KSBCShieldLogoIcon className={iconSizeClasses[size] || iconSizeClasses.md} />
      </div>

      {/* KSBC Brand Text */}
      <div className="flex flex-col">
        <h1
          className={`font-black uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] via-[#f97316] to-[#ea580c] drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)] group-hover:scale-105 group-hover:drop-shadow-[0_2px_18px_rgba(255,107,0,0.85)] transition-all duration-300 ${textSizeClasses[size] || textSizeClasses.md}`}
          style={{ fontFamily: "'Roboto', sans-serif" }}
        >
          KSBC
        </h1>
      </div>
    </Link>
  );
};

// Aliases for clean semantic imports
export const KSBCLogo = FlyingMatLogo;
export const PolarBearLogo = FlyingMatLogo;

export default FlyingMatLogo;



