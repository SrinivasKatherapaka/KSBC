import React from 'react';
import { Link } from 'react-router-dom';

export const KSBCTallRectangleLogoIcon = ({ className = "w-9 h-9" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_14px_rgba(249,115,22,0.75)] ${className}`}
  >
    <defs>
      {/* Front Face Gradient (Vibrant Gold to Orange) */}
      <linearGradient id="rectFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="45%" stopColor="#ff6b00" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>

      {/* Side View Perspective Face Gradient (Deep Rich Orange to Burnt Copper) */}
      <linearGradient id="rectSideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="60%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#9a3412" />
      </linearGradient>

      {/* Top Bevel Cap Gradient */}
      <linearGradient id="rectTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff5c0" />
        <stop offset="100%" stopColor="#ffd700" />
      </linearGradient>

      {/* Line Art Outie Stroke Gradient */}
      <linearGradient id="rectLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#ff6b00" />
      </linearGradient>
    </defs>

    {/* 3D Isometric Side View Perspective Tall Rectangles */}
    <g transform="translate(4, 2)">
      {/* Secondary Background Pillar Accent (Depth Structure) */}
      <path 
        d="M 20 28 L 36 20 L 36 82 L 20 90 Z" 
        fill="url(#rectFrontGrad)" 
        opacity="0.55"
      />
      <path 
        d="M 36 20 L 46 24 L 46 86 L 36 82 Z" 
        fill="url(#rectSideGrad)" 
        opacity="0.55"
      />

      {/* Primary Hero Tall Rectangle - Front Face */}
      <path 
        d="M 34 14 L 60 4 L 60 76 L 34 86 Z" 
        fill="url(#rectFrontGrad)"
        stroke="url(#rectLineGrad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Primary Hero Tall Rectangle - Side View Perspective Wall */}
      <path 
        d="M 60 4 L 78 12 L 78 84 L 60 76 Z" 
        fill="url(#rectSideGrad)"
        stroke="url(#rectLineGrad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Top Roof Cap (Isometric Side View Angle) */}
      <path 
        d="M 34 14 L 52 6 L 78 12 L 60 4 Z" 
        fill="url(#rectTopGrad)"
        stroke="url(#rectLineGrad)"
        strokeWidth="1.2"
      />

      {/* Geometric Monogram Line Art Accents on Front Face */}
      <path 
        d="M 42 26 L 42 66 M 42 46 L 54 34 M 42 46 L 54 58" 
        stroke="#002129" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Sleek Metallic Accent Lines on Side View Face */}
      <line x1="60" y1="24" x2="78" y2="32" stroke="#ffd700" strokeWidth="1.6" opacity="0.85" />
      <line x1="60" y1="44" x2="78" y2="52" stroke="#ffd700" strokeWidth="1.6" opacity="0.85" />
      <line x1="60" y1="64" x2="78" y2="72" stroke="#ffd700" strokeWidth="1.6" opacity="0.85" />
    </g>
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
      {/* KSBC Tall Rectangle Side-View Logo Icon */}
      <div className="relative flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
        <KSBCTallRectangleLogoIcon className={iconSizeClasses[size] || iconSizeClasses.md} />
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
export const KSBCShieldLogoIcon = KSBCTallRectangleLogoIcon;
export const PolarBearLogo = FlyingMatLogo;

export default FlyingMatLogo;




