import React from 'react';
import { Link } from 'react-router-dom';

export const FlyingMatLogo = ({ size = 'md', className = '', linkTo = '/dashboard' }) => {
  const sizeMap = {
    sm: { imgClass: 'h-8 w-auto' },
    md: { imgClass: 'h-11 w-auto' },
    lg: { imgClass: 'h-14 w-auto' },
    sidebar: { imgClass: 'h-16 w-full max-w-[216px] object-contain' },
    xl: { imgClass: 'h-20 w-auto max-w-[240px] object-contain' },
    banner: { imgClass: 'h-24 w-auto object-contain' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center justify-center cursor-pointer group select-none ${className}`}>
      {/* Classical Greek/Roman Banking Temple Insignia as a prominent single unit */}
      <div className="relative flex items-center justify-center w-full transition-all duration-300 group-hover:scale-105">
        <img 
          src="/ksbc_logo.png" 
          alt="KSBC Banking Enterprise" 
          className={`${currentSize.imgClass} object-contain rounded-xl shadow-md hover:drop-shadow-[0_0_15px_rgba(197,158,95,0.45)] transition-all`}
          onError={(e) => {
            e.currentTarget.src = '/ksbc_logo.svg';
          }}
        />
      </div>
    </div>
  );

  if (!linkTo) {
    return content;
  }

  return (
    <Link 
      to={linkTo} 
      className="w-full flex items-center justify-center" 
      title="KSBC Digital Banking ERP - Return to Dashboard"
    >
      {content}
    </Link>
  );
};

// Semantic exports
export const KSBCLogo = FlyingMatLogo;
export const PolarBearLogo = FlyingMatLogo;
export const KSBCTallRectangleLogoIcon = () => null;
export const KSBCShieldLogoIcon = () => null;

export default FlyingMatLogo;



