import React from 'react';
import { Link } from 'react-router-dom';

export const FlyingMatLogo = ({ size = 'md', className = '', showSubtitle = true, linkTo = '/dashboard', light = false }) => {
  const sizeMap = {
    sm: { height: 'h-8', imgHeight: 'h-8', titleSize: 'text-lg', subSize: 'text-[7px]' },
    md: { height: 'h-10', imgHeight: 'h-10', titleSize: 'text-xl', subSize: 'text-[8px]' },
    lg: { height: 'h-12', imgHeight: 'h-12', titleSize: 'text-2xl', subSize: 'text-[9px]' },
    xl: { height: 'h-16', imgHeight: 'h-16', titleSize: 'text-4xl', subSize: 'text-[11px]' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const textColor = light ? 'text-[#FAF7E6]' : 'text-[#1E2748]';
  const subColor = light ? 'text-[#FAF7E6]/80' : 'text-[#53627C]';

  const content = (
    <div className={`inline-flex items-center space-x-3 cursor-pointer group select-none ${className}`}>
      {/* Classical Greek/Roman Banking Temple Insignia with Laurel & Stars */}
      <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
        <img 
          src="/ksbc_logo.png" 
          alt="KSBC Banking Crest" 
          className={`${currentSize.imgHeight} w-auto object-contain rounded-md shadow-sm`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Authoritative KSBC Archivo Black Typography */}
      <div className="flex flex-col justify-center">
        <span 
          className={`font-heading uppercase leading-none tracking-tight ${textColor} group-hover:opacity-90 transition-opacity ${currentSize.titleSize}`}
          style={{ fontFamily: "'Archivo Black', sans-serif" }}
        >
          KSBC
        </span>
        {showSubtitle && (
          <span 
            className={`font-extrabold tracking-[0.22em] ${subColor} group-hover:opacity-100 transition-opacity mt-0.5 uppercase ${currentSize.subSize}`}
            style={{ fontFamily: "'Archivo Black', 'Inter', sans-serif" }}
          >
            SINCE 2026
          </span>
        )}
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

