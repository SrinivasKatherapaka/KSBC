import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPortalAccess } from '../../config/permissions';
import LoadingSpinner from './LoadingSpinner';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-[#FAF7E6] flex items-center justify-center text-[#FAF7E6]">
        <LoadingSpinner text="Authenticating KSBC credentials..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const effectiveRole = user.role || 'cfo_executive';

  // Check explicit roles prop or dynamic portal path permissions
  const isAllowed = roles.length > 0
    ? (effectiveRole === 'admin' || effectiveRole === 'cfo_executive' || roles.includes(effectiveRole))
    : hasPortalAccess(effectiveRole, location.pathname);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-[#FAF7E6] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-red-500/30 bg-[#15203B]/85 text-[#FAF7E6] shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto text-red-600 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div>
            <span className="text-[10px] font-archivo font-black uppercase tracking-widest text-red-600 block mb-1">
              403 Security Barrier
            </span>
            <h2 className="text-xl font-heading font-black text-[#FAF7E6]">Portal Access Restricted</h2>
            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed font-medium">
              Your active personnel clearance role (<strong className="text-[#FAF7E6] capitalize">{effectiveRole.replace('_', ' ')}</strong>) is not authorized to access this KSBC ERP Portal.
            </p>
          </div>

          <div className="p-3 bg-[#0F172A] rounded-xl border border-[#DFBD84]/15 text-[11px] text-[#94A3B8] flex items-center justify-center space-x-2">
            <Lock className="w-4 h-4 text-[#FAF7E6]" />
            <span>Switch clearance role via top navbar to access.</span>
          </div>

          <Link
            to="/dashboard"
            className="w-full py-3 bg-gradient-to-r from-[#C59E5F] via-[#DFBD84] to-[#C59E5F] hover:from-[#DFBD84] hover:to-[#EED29E] text-[#0B1120] font-black text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Executive Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;


