import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Sparkles, Shield, KeyRound, UserCheck } from 'lucide-react';
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
      <header className="h-16 glass-panel border-b border-[#dfbd84]/20 px-6 flex items-center justify-between sticky top-0 z-20 bg-[#1b2827]/85 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-[#dfbd84]/10 border border-[#dfbd84]/30 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#dfbd84] animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#dfbd84] uppercase tracking-wider">KSBC Live</span>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs text-[#a4b8b5]">
            <Sparkles className="w-3.5 h-3.5 text-[#dfbd84]" />
            <span>Gemini KSBC Underwriting Engine Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Persona Shift Dropdown with Authentication */}
          <div className="relative group">
            <button className="flex items-center space-x-2 bg-[#273a39] hover:bg-[#324846] px-3 py-1.5 rounded-xl border border-[#dfbd84]/35 text-xs font-bold text-[#f4eee2] transition">
              <KeyRound className="w-3.5 h-3.5 text-[#dfbd84]" />
              <span>Shift Account Clearance</span>
            </button>

            <div className="absolute right-0 mt-1 w-56 glass-panel p-2 rounded-2xl border border-[#dfbd84]/30 shadow-2xl hidden group-hover:block z-50 space-y-1 bg-[#20302f]">
              <div className="px-2 py-1 text-[10px] font-bold text-[#dfbd84] uppercase tracking-wider">
                Shift Account View (Requires Auth):
              </div>
              {demoPersonas.map((p) => (
                <button
                  key={p.email}
                  onClick={() => handleTriggerShift(p.email)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    user?.email === p.email
                      ? 'bg-[#273a39] text-[#dfbd84] font-bold border border-[#dfbd84]/40'
                      : 'text-[#a4b8b5] hover:bg-[#273a39]/70 hover:text-[#f4eee2]'
                  }`}
                >
                  <span>{p.label}</span>
                  {user?.email === p.email && <span className="text-[9px] font-mono text-[#58b388]">Active</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-[#273a39]/80 px-3 py-1.5 rounded-xl border border-[#dfbd84]/25 text-xs">
            <Shield className="w-3.5 h-3.5 text-[#dfbd84]" />
            <span className="text-[#a4b8b5] font-medium">Clearance:</span>
            <span className="text-[#dfbd84] font-mono font-bold capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>

          <button 
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-1.5 bg-[#273a39] hover:bg-[#182423] border border-[#dfbd84]/30 text-[#dfbd84] hover:text-[#eed29e] rounded-xl text-xs font-semibold transition"
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
