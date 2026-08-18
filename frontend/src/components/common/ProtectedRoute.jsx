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
      <div className="min-h-screen bg-[#FAF7E6] text-[#1E2748] flex items-center justify-center text-[#1E2748]">
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
      <div className="min-h-screen bg-[#FAF7E6] text-[#1E2748] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-red-500/30 bg-[#F6F2E3] text-[#1E2748] shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto text-red-600 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div>
            <span className="text-[10px] font-archivo font-black uppercase tracking-widest text-red-600 block mb-1">
              403 Security Barrier
            </span>
            <h2 className="text-xl font-heading font-black text-[#1E2748]">Portal Access Restricted</h2>
            <p className="text-xs text-[#53627C] mt-2 leading-relaxed font-medium">
              Your active personnel clearance role (<strong className="text-[#1E2748] capitalize">{effectiveRole.replace('_', ' ')}</strong>) is not authorized to access this KSBC ERP Portal.
            </p>
          </div>

          <div className="p-3 bg-[#EBE4CD] rounded-xl border border-[#1E2748]/15 text-[11px] text-[#53627C] flex items-center justify-center space-x-2">
            <Lock className="w-4 h-4 text-[#1E2748]" />
            <span>Switch clearance role via top navbar to access.</span>
          </div>

          <Link
            to="/dashboard"
            className="w-full py-3 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] font-archivo font-extrabold text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
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


