import React from 'react';
import { Link } from 'react-router-dom';

export const FlyingMatLogo = ({ size = 'md', className = '' }) => {
  const textSizeClasses = {
    sm: 'text-xl tracking-wider',
    md: 'text-2xl tracking-widest',
    lg: 'text-3xl tracking-widest',
    xl: 'text-4xl tracking-widest'
  };

  return (
    <Link to="/dashboard" className={`inline-flex items-center cursor-pointer group ${className}`} title="KSBC Banking ERP - Return to Executive Dashboard">
      {/* Orange KSBC Brand Logo in ROBOTO font */}
      <h1
        className={`font-black uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] via-[#f97316] to-[#ea580c] drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)] group-hover:scale-105 group-hover:drop-shadow-[0_2px_16px_rgba(255,107,0,0.8)] transition-all duration-300 ${textSizeClasses[size] || textSizeClasses.md}`}
        style={{ fontFamily: "'Roboto', sans-serif" }}
      >
        KSBC
      </h1>
    </Link>
  );
};

export default FlyingMatLogo;
