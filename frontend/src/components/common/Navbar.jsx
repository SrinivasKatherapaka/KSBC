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
      <header className="h-16 glass-panel border-b border-rose-900/30 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">KSBC Live</span>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini 2.5 Flash KSBC Underwriting Engine Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Persona Shift Dropdown with Authentication */}
          <div className="relative group">
            <button className="flex items-center space-x-2 bg-rose-950/70 hover:bg-rose-900/50 px-3 py-1.5 rounded-xl border border-rose-800/60 text-xs font-bold text-slate-200 transition">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Shift Account Clearance</span>
            </button>

            <div className="absolute right-0 mt-1 w-56 glass-panel p-2 rounded-2xl border border-rose-900/40 shadow-2xl hidden group-hover:block z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-rose-300/60 uppercase tracking-wider">
                Shift Account View (Requires Auth):
              </div>
              {demoPersonas.map((p) => (
                <button
                  key={p.email}
                  onClick={() => handleTriggerShift(p.email)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    user?.email === p.email
                      ? 'bg-rose-900/60 text-amber-300 font-bold border border-rose-600/40'
                      : 'text-slate-300 hover:bg-rose-950 hover:text-white'
                  }`}
                >
                  <span>{p.label}</span>
                  {user?.email === p.email && <span className="text-[9px] font-mono text-emerald-400">Active</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-800/60 text-xs">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-medium">Clearance:</span>
            <span className="text-amber-400 font-mono font-bold capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>

          <button 
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-1.5 bg-rose-900/20 hover:bg-rose-900/40 border border-rose-600/40 text-rose-300 rounded-xl text-xs font-semibold transition"
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
