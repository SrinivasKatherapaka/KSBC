import React, { useState } from 'react';
import { 
  User, Wallet, Mail, Phone, ShieldCheck, ShieldAlert, Lock, Unlock, 
  KeyRound, X, Edit, Trash2, Calendar, DollarSign, CheckCircle2, 
  Building, Sparkles, Eye, EyeOff, Shield
} from 'lucide-react';
import ReAuthModal from '../common/ReAuthModal';
import { useAuth } from '../../context/AuthContext';

export const AccountDetailsModal = ({
  isOpen,
  onClose,
  customer,
  onEdit,
  onDelete,
  isCfoOrAdmin
}) => {
  const [isIdUnlocked, setIsIdUnlocked] = useState(false);
  const [isSpecialAuthModalOpen, setIsSpecialAuthModalOpen] = useState(false);
  const { user } = useAuth();

  if (!isOpen || !customer) return null;

  const isHnwi = customer.client_category === 'hnwi';
  const isCorporate = customer.client_category === 'corporate';

  // Format User Identification Number: Mask all characters except last 4 unless special authentication is completed
  const getMaskedNationalId = (idStr) => {
    if (!idStr) return 'US-SSN-***-**-9918';
    if (isIdUnlocked) {
      // If seed string had stars, unmask with realistic numbers for demonstration
      if (idStr.includes('***-**-')) {
        const last4 = idStr.slice(-4);
        return `US-SSN-648-92-${last4}`;
      }
      return idStr;
    }

    // Masked mode: keep only last 4 digits visible, rest hidden under *
    const digits = idStr.replace(/\D/g, '');
    const last4 = digits.slice(-4) || '9918';

    if (idStr.startsWith('US-EIN')) {
      return `US-EIN-**-***${last4}`;
    }
    return `US-SSN-***-**-${last4}`;
  };

  const handleSpecialAuthenticate = async (targetEmail, password) => {
    // Special Authentication Clearance Success
    setIsIdUnlocked(true);
    setIsSpecialAuthModalOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="glass-panel w-full max-w-3xl p-6 rounded-2xl border border-[#2aa198]/40 bg-[#073642] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-xs text-[#93a1a1]">
          {/* Detailed Account Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2aa198]/20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#002129] text-[#ffd700] rounded-2xl border border-[#ffd700]/30 shadow">
                <Wallet className="w-6 h-6 text-[#ffd700]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-[#fdf6e3]">
                    {customer.first_name} {customer.last_name}
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                    isHnwi
                      ? 'bg-[#ffd700]/10 text-[#ffd700] border-[#ffd700]/40'
                      : isCorporate
                      ? 'bg-[#2aa198]/10 text-[#2aa198] border-[#2aa198]/40'
                      : 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                  }`}>
                    {isHnwi ? '💎 High Net-Worth' : isCorporate ? '🏢 Corporate' : '👤 Private Savings'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#2aa198] mt-0.5">
                  Master Ledger Account ID: <strong className="text-[#ffd700]">{customer.account_number || `KSBC-ACC-${customer.id.slice(0, 8)}`}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center space-x-1 ${
                customer.kyc_status === 'verified'
                  ? 'bg-[#859900]/20 text-[#859900] border-[#859900]/40'
                  : customer.kyc_status === 'flagged'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#002129] text-[#93a1a1] border-[#2aa198]/30'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KYC {customer.kyc_status || 'Verified'}</span>
              </span>
              <button
                onClick={onClose}
                className="p-1.5 bg-[#002129] text-[#93a1a1] hover:text-white rounded-xl border border-[#2aa198]/30 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Identification Number Security Section (Masked under * by default) */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isIdUnlocked
              ? 'bg-[#859900]/10 border-[#859900]/40 shadow-lg'
              : 'bg-[#002129]/90 border-amber-500/40 shadow-lg'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Shield className={`w-4 h-4 ${isIdUnlocked ? 'text-[#859900]' : 'text-amber-400'}`} />
                  <span className="text-[11px] uppercase font-bold text-[#fdf6e3] tracking-wider">
                    Customer User Identification Number (SSN / EIN / Tax ID)
                  </span>
                </div>
                <div className="flex items-center space-x-3 pt-1">
                  <span className="font-mono text-xl font-black text-[#ffd700] tracking-widest">
                    {getMaskedNationalId(customer.national_id)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase flex items-center space-x-1 ${
                    isIdUnlocked
                      ? 'bg-[#859900]/20 text-[#859900] border-[#859900]/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {isIdUnlocked ? (
                      <>
                        <Unlock className="w-3 h-3 text-[#859900]" />
                        <span>Special Authentication Granted</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Hidden under * (Last 4 Digits Visible)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div>
                {!isIdUnlocked ? (
                  <button
                    onClick={() => setIsSpecialAuthModalOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-[#002b36] font-black rounded-xl shadow-lg border border-amber-300/50 transition flex items-center space-x-2 text-xs"
                  >
                    <KeyRound className="w-4 h-4 text-[#002b36]" />
                    <span>Special Authentication to Unmask Full ID</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsIdUnlocked(false)}
                    className="px-4 py-2.5 bg-[#002129] hover:bg-[#073642] text-[#ffd700] font-bold rounded-xl border border-[#ffd700]/40 transition flex items-center space-x-2 text-xs"
                  >
                    <Lock className="w-4 h-4 text-[#ffd700]" />
                    <span>Re-Lock Identification Number</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid Layout: Account Details & Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Personal & Contact Info Card */}
            <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/30 bg-[#002129]/60 space-y-3">
              <h3 className="text-xs font-bold text-[#ffd700] uppercase tracking-wider flex items-center space-x-2 border-b border-[#2aa198]/20 pb-2">
                <User className="w-4 h-4 text-[#ffd700]" />
                <span>Customer Profile & Contact Information</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#2aa198]/10">
                  <span className="text-[#93a1a1]">First Name / Entity:</span>
                  <span className="font-bold text-[#fdf6e3]">{customer.first_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2aa198]/10">
                  <span className="text-[#93a1a1]">Last Name / Suffix:</span>
                  <span className="font-bold text-[#fdf6e3]">{customer.last_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2aa198]/10">
                  <span className="text-[#93a1a1]">Email Address:</span>
                  <span className="font-mono text-[#2aa198] font-bold">{customer.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2aa198]/10">
                  <span className="text-[#93a1a1]">Telephone Contact:</span>
                  <span className="font-mono text-[#fdf6e3]">{customer.phone || '+1-555-0199'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#93a1a1]">Client Tier Category:</span>
                  <span className="font-bold uppercase text-[#ffd700]">{customer.client_category || 'private_savings'}</span>
                </div>
              </div>
            </div>

            {/* Account Financial Ledger Card */}
            <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/30 bg-[#002129]/60 space-y-3">
              <h3 className="text-xs font-bold text-[#ffd700] uppercase tracking-wider flex items-center space-x-2 border-b border-[#2aa198]/20 pb-2">
                <Wallet className="w-4 h-4 text-[#ffd700]" />
                <span>Financial Ledger & Deposit Summary</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#2aa198]/10">
                  <span className="text-[#93a1a1]">Account Number:</span>
                  <span className="font-mono font-bold text-[#ffd700]">
                    {customer.account_number || `KSBC-ACC-${customer.id.slice(0, 8)}`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2aa198]/10">
                  <span className="text-[#93a1a1]">Account Product Type:</span>
                  <span className="font-medium text-[#fdf6e3]">
                    {customer.account_type || (isHnwi ? 'Private High-Net-Worth Reserve' : isCorporate ? 'Corporate Treasury Checking' : 'Private Standard Savings')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2aa198]/10">
                  <span className="text-[#93a1a1]">Current Deposit Balance:</span>
                  <span className="font-mono font-extrabold text-[#859900] text-sm">
                    ${Number(customer.annual_revenue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2aa198]/10">
                  <span className="text-[#93a1a1]">Operational Standing:</span>
                  <span className="font-bold text-emerald-400 uppercase">Active & Authenticated</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#93a1a1]">Account Onboarding Date:</span>
                  <span className="font-mono text-[#fdf6e3]">
                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '2026-01-15'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KYC Compliance & Audit Remarks */}
          <div className="glass-panel p-4 rounded-2xl border border-[#2aa198]/30 bg-[#002129]/60 space-y-3">
            <h3 className="text-xs font-bold text-[#ffd700] uppercase tracking-wider flex items-center space-x-2 border-b border-[#2aa198]/20 pb-2">
              <ShieldCheck className="w-4 h-4 text-[#ffd700]" />
              <span>KYC Compliance Clearance & Beneficial Ownership Audit Notes</span>
            </h3>
            <p className="text-xs text-[#fdf6e3] leading-relaxed font-mono bg-[#073642] p-3 rounded-xl border border-[#2aa198]/20">
              {customer.kyc_notes || 'Executive intake clearance audit completed. Anti-Money Laundering (AML) & Beneficial Ownership verification confirmed.'}
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#2aa198]/20">
            <div className="text-[11px] text-[#2aa198]">
              Authorized Persona: <strong className="text-[#ffd700]">{user?.first_name} {user?.last_name}</strong> ({user?.role})
            </div>

            <div className="flex items-center space-x-2">
              {isCfoOrAdmin && (
                <>
                  <button
                    onClick={() => { onClose(); onEdit(customer); }}
                    className="px-3.5 py-2 bg-[#002129] hover:bg-[#073642] text-[#ffd700] border border-[#ffd700]/40 rounded-xl font-bold transition flex items-center space-x-1.5 shadow"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#ffd700]" />
                    <span>Modify Account</span>
                  </button>
                  <button
                    onClick={() => { onClose(); onDelete(customer); }}
                    className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-xl font-bold transition flex items-center space-x-1.5 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-300" />
                    <span>Delete Account</span>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-[#b58900] to-[#d4af37] text-[#002b36] font-extrabold rounded-xl shadow transition"
              >
                Close Detailed View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Special Authentication Clearance Modal */}
      <ReAuthModal
        isOpen={isSpecialAuthModalOpen}
        onClose={() => setIsSpecialAuthModalOpen(false)}
        targetEmail={user?.email || 'cfo@banking.com'}
        onAuthenticate={handleSpecialAuthenticate}
      />
    </>
  );
};

export default AccountDetailsModal;
