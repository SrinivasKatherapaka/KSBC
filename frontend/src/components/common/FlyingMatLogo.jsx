import React from 'react';
import { Link } from 'react-router-dom';

export const FlyingMatLogo = ({ size = 'md', className = '', showSubtitle = true, linkTo = '/dashboard' }) => {
  const sizeMap = {
    sm: { height: 'h-8', iconSize: 28, titleSize: 'text-lg', subSize: 'text-[7px]' },
    md: { height: 'h-10', iconSize: 34, titleSize: 'text-xl', subSize: 'text-[8px]' },
    lg: { height: 'h-12', iconSize: 42, titleSize: 'text-2xl', subSize: 'text-[9px]' },
    xl: { height: 'h-16', iconSize: 56, titleSize: 'text-4xl', subSize: 'text-[11px]' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center space-x-3 cursor-pointer group select-none ${className}`}>
      {/* Classical Greek/Roman Banking Temple Insignia with Laurel Leaves */}
      <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
        <svg 
          viewBox="0 0 190 160" 
          className={`${currentSize.height} w-auto drop-shadow-[0_2px_10px_rgba(223,189,132,0.35)] group-hover:drop-shadow-[0_0_16px_rgba(223,189,132,0.65)] transition-all duration-300`}
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pediment Roof */}
          <path d="M 95 18 L 22 60 L 168 60 Z" fill="none" stroke="#dfbd84" strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M 95 28 L 38 60 L 152 60 Z" fill="#dfbd84" fillOpacity="0.2" />
          <rect x="16" y="60" width="158" height="7" rx="1.5" fill="#dfbd84" />
          
          {/* 6 Fluted Columns */}
          {/* Col 1 */}
          <rect x="27" y="71" width="12" height="42" rx="1.5" fill="#dfbd84" />
          <rect x="25" y="67" width="16" height="4" rx="1" fill="#dfbd84" />
          <rect x="25" y="113" width="16" height="4" rx="1" fill="#dfbd84" />

          {/* Col 2 */}
          <rect x="50" y="71" width="12" height="42" rx="1.5" fill="#dfbd84" />
          <rect x="48" y="67" width="16" height="4" rx="1" fill="#dfbd84" />
          <rect x="48" y="113" width="16" height="4" rx="1" fill="#dfbd84" />

          {/* Col 3 */}
          <rect x="73" y="71" width="12" height="42" rx="1.5" fill="#dfbd84" />
          <rect x="71" y="67" width="16" height="4" rx="1" fill="#dfbd84" />
          <rect x="71" y="113" width="16" height="4" rx="1" fill="#dfbd84" />

          {/* Col 4 */}
          <rect x="105" y="71" width="12" height="42" rx="1.5" fill="#dfbd84" />
          <rect x="103" y="67" width="16" height="4" rx="1" fill="#dfbd84" />
          <rect x="103" y="113" width="16" height="4" rx="1" fill="#dfbd84" />

          {/* Col 5 */}
          <rect x="128" y="71" width="12" height="42" rx="1.5" fill="#dfbd84" />
          <rect x="126" y="67" width="16" height="4" rx="1" fill="#dfbd84" />
          <rect x="126" y="113" width="16" height="4" rx="1" fill="#dfbd84" />

          {/* Col 6 */}
          <rect x="151" y="71" width="12" height="42" rx="1.5" fill="#dfbd84" />
          <rect x="149" y="67" width="16" height="4" rx="1" fill="#dfbd84" />
          <rect x="149" y="113" width="16" height="4" rx="1" fill="#dfbd84" />

          {/* Multi-tier Base Steps */}
          <rect x="14" y="117" width="162" height="6" rx="1.5" fill="#dfbd84" />
          <rect x="7" y="125" width="176" height="6.5" rx="1.5" fill="#dfbd84" />
          <rect x="2" y="133.5" width="186" height="5" rx="1.5" fill="#dfbd84" />

          {/* Left Laurel Stalk */}
          <g transform="translate(-6, 68)" fill="#dfbd84">
            <ellipse cx="6" cy="6" rx="4.5" ry="8" transform="rotate(-35 6 6)" />
            <ellipse cx="14" cy="18" rx="4.5" ry="8" transform="rotate(-15 14 18)" />
            <ellipse cx="2" cy="22" rx="4.5" ry="8" transform="rotate(-45 2 22)" />
            <ellipse cx="12" cy="34" rx="4.5" ry="8" transform="rotate(-20 12 34)" />
            <ellipse cx="0" cy="38" rx="4.5" ry="8" transform="rotate(-50 0 38)" />
            <ellipse cx="10" cy="50" rx="4" ry="7" transform="rotate(-25 10 50)" />
            <ellipse cx="0" cy="54" rx="4" ry="7" transform="rotate(-55 0 54)" />
          </g>

          {/* Right Laurel Stalk */}
          <g transform="translate(176, 68)" fill="#dfbd84">
            <ellipse cx="14" cy="6" rx="4.5" ry="8" transform="rotate(35 14 6)" />
            <ellipse cx="6" cy="18" rx="4.5" ry="8" transform="rotate(15 6 18)" />
            <ellipse cx="18" cy="22" rx="4.5" ry="8" transform="rotate(45 18 22)" />
            <ellipse cx="8" cy="34" rx="4.5" ry="8" transform="rotate(20 8 34)" />
            <ellipse cx="20" cy="38" rx="4.5" ry="8" transform="rotate(50 20 38)" />
            <ellipse cx="10" cy="50" rx="4" ry="7" transform="rotate(25 10 50)" />
            <ellipse cx="20" cy="54" rx="4" ry="7" transform="rotate(55 20 54)" />
          </g>

          {/* Bottom Accent Line */}
          <line x1="8" y1="145" x2="182" y2="145" stroke="#dfbd84" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {/* Authoritative KSBC Gold Typography */}
      <div className="flex flex-col justify-center">
        <span 
          className={`font-black uppercase leading-none tracking-wider text-[#dfbd84] group-hover:text-[#eed29e] transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(223,189,132,0.3)] ${currentSize.titleSize}`}
          style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
        >
          KSBC
        </span>
        {showSubtitle && (
          <span 
            className={`font-bold tracking-[0.25em] text-[#dfbd84]/90 group-hover:text-[#dfbd84] transition-colors mt-0.5 uppercase ${currentSize.subSize}`}
            style={{ fontFamily: "'Outfit', sans-serif" }}
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
