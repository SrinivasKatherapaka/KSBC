import React from 'react';
import { Link } from 'react-router-dom';

export const FlyingMatLogo = ({ size = 'md', className = '', linkTo = '/dashboard' }) => {
  const sizeMap = {
    sm: { imgHeight: 'h-8' },
    md: { imgHeight: 'h-10' },
    lg: { imgHeight: 'h-12' },
    xl: { imgHeight: 'h-16' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center cursor-pointer group select-none ${className}`}>
      {/* Classical Greek/Roman Banking Temple Insignia as a unified single unit */}
      <div className="relative flex-shrink-0 transition-all duration-300 group-hover:scale-105">
        <img 
          src="/ksbc_logo.png" 
          alt="KSBC Banking Enterprise" 
          className={`${currentSize.imgHeight} w-auto object-contain rounded-lg shadow-md hover:drop-shadow-[0_0_12px_rgba(223,189,132,0.4)] transition-all`}
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
      className="inline-block" 
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


