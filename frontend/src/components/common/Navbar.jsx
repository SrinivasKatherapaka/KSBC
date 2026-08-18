import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Sparkles, Shield, KeyRound } from 'lucide-react';
import ReAuthModal from './ReAuthModal';

export const Navbar = () => {
  const { user, login, logout } = useAuth();
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [selectedShiftEmail, setSelectedShiftEmail] = useState('cfo@banking.com');

  const demoPersonas = [
    { label: '👔 CFO Executive', email: 'cfo@banking.com' },
    { label: '📋 Loan Officer', email: 'loan@banking.com' },
    { label: '🏛️ Treasury Manager', email: 'treasury@banking.com' },
    { label: '🛡️ Compliance Officer', email: 'compliance@banking.com' },
    { label: '👥 Customer Ops', email: 'customerops@banking.com' },
    { label: '📊 Finance Manager', email: 'finance@banking.com' },
    { label: '⚡ System Admin', email: 'admin@banking.com' }
  ];

  const handleTriggerShift = (targetEmail) => {
    setSelectedShiftEmail(targetEmail);
    setIsReAuthOpen(true);
  };

  const handleAuthenticateShift = async (targetEmail, password) => {
    await login(targetEmail, password);
  };

  return (
    <>
      <header className="h-16 glass-panel border-b border-[#1E2748]/15 px-6 flex items-center justify-between sticky top-0 z-20 bg-[#FAF7E6]/95 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-[#1E2748] text-[#FAF7E6] rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-[11px] font-archivo font-black uppercase tracking-wider">KSBC Live</span>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs text-[#53627C] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C59E5F]" />
            <span>Gemini Underwriting Engine Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Persona Shift Dropdown with Authentication */}
          <div className="relative group">
            <button className="flex items-center space-x-2 bg-[#FFFFFF] hover:bg-[#F2EDE0] px-3.5 py-1.5 rounded-xl border border-[#1E2748]/20 text-xs font-bold text-[#1E2748] shadow-sm transition">
              <KeyRound className="w-3.5 h-3.5 text-[#1E2748]" />
              <span>Shift Clearance Role</span>
            </button>

            <div className="absolute right-0 mt-1 w-60 glass-panel p-2 rounded-2xl border border-[#1E2748]/20 shadow-2xl hidden group-hover:block z-50 space-y-1 bg-[#FFFFFF]">
              <div className="px-2.5 py-1.5 text-[10px] font-archivo font-extrabold text-[#1E2748] uppercase tracking-wider border-b border-[#1E2748]/10">
                Shift Account Persona:
              </div>
              {demoPersonas.map((p) => (
                <button
                  key={p.email}
                  onClick={() => handleTriggerShift(p.email)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    user?.email === p.email
                      ? 'bg-[#1E2748] text-[#FAF7E6] font-bold shadow-sm'
                      : 'text-[#53627C] hover:bg-[#FAF7E6] hover:text-[#1E2748]'
                  }`}
                >
                  <span>{p.label}</span>
                  {user?.email === p.email && <span className="text-[9px] font-mono text-[#10B981] font-bold">Active</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-[#FFFFFF] px-3 py-1.5 rounded-xl border border-[#1E2748]/20 text-xs shadow-sm">
            <Shield className="w-3.5 h-3.5 text-[#1E2748]" />
            <span className="text-[#53627C] font-medium">Clearance:</span>
            <span className="text-[#1E2748] font-mono font-bold capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>

          <button 
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-1.5 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] rounded-xl text-xs font-bold transition shadow-sm"
            title="Sign out of KSBC Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Security Re-Authentication Modal */}
      <ReAuthModal
        isOpen={isReAuthOpen}
        onClose={() => setIsReAuthOpen(false)}
        targetEmail={selectedShiftEmail}
        onAuthenticate={handleAuthenticateShift}
      />
    </>
  );
};

export default Navbar;

