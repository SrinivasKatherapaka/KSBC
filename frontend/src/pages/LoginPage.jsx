import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import ErrorAlert from '../components/common/ErrorAlert';
import FlyingMatLogo from '../components/common/FlyingMatLogo';

export const LoginPage = () => {
  const [email, setEmail] = useState('cfo@banking.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Invalid banking credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const setDemoRole = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#FAF7E6] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FAF7E6] via-[#F3EEDC] to-[#EBE4CD] flex flex-col items-center justify-center p-6 text-[#1E2748]">
      <div className="w-full max-w-md">
        {/* KSBC Header Branding with Single-Unit Temple Logo */}
        <div className="text-center mb-8 flex flex-col items-center space-y-3">
          <FlyingMatLogo size="xl" />
          <p className="text-xs text-[#53627C] uppercase tracking-widest font-black font-archivo">Enterprise Banking ERP</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-[#1E2748]/15 shadow-2xl space-y-6 bg-[#F3EEDC]/95">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2748]/10">
            <h2 className="text-lg font-archivo font-extrabold text-[#1E2748] flex items-center space-x-2">
              <Lock className="w-4 h-4 text-[#1E2748]" />
              <span>KSBC Personnel Sign-In</span>
            </h2>
            <span className="text-[10px] font-archivo font-bold text-[#FAF7E6] bg-[#1E2748] px-2.5 py-0.5 rounded-full">
              JWT Secured
            </span>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2748] uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#53627C]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input bg-[#EBE4CD] border border-[#1E2748]/20 text-[#1E2748] text-xs rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
                  required
                  placeholder="personnel@banking.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2748] uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#53627C]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input bg-[#EBE4CD] border border-[#1E2748]/20 text-[#1E2748] text-xs rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] text-xs font-archivo font-extrabold rounded-xl shadow-lg shadow-[#1E2748]/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating KSBC Credentials...' : 'Authenticate & Access KSBC ERP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Preset Persona Quick Fill */}
          <div className="pt-4 border-t border-[#1E2748]/15">
            <span className="block text-[10px] font-archivo font-extrabold text-[#53627C] uppercase tracking-wider mb-2">
              Select Demo Clearance Persona:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button 
                type="button" 
                onClick={() => setDemoRole('cfo@banking.com')} 
                className="p-2 text-left rounded-lg bg-[#EBE4CD] hover:bg-[#E3DCBF] border border-[#1E2748]/15 text-[#1E2748] transition"
              >
                <div className="font-bold text-[#1E2748]">👔 CFO Executive</div>
                <div className="text-[9px] text-[#53627C]">cfo@banking.com</div>
              </button>
              <button 
                type="button" 
                onClick={() => setDemoRole('loan@banking.com')} 
                className="p-2 text-left rounded-lg bg-[#EBE4CD] hover:bg-[#E3DCBF] border border-[#1E2748]/15 text-[#1E2748] transition"
              >
                <div className="font-bold text-[#1E2748]">📋 Loan Officer</div>
                <div className="text-[9px] text-[#53627C]">loan@banking.com</div>
              </button>
              <button 
                type="button" 
                onClick={() => setDemoRole('treasury@banking.com')} 
                className="p-2 text-left rounded-lg bg-[#EBE4CD] hover:bg-[#E3DCBF] border border-[#1E2748]/15 text-[#1E2748] transition"
              >
                <div className="font-bold text-[#1E2748]">🏛️ Treasury Manager</div>
                <div className="text-[9px] text-[#53627C]">treasury@banking.com</div>
              </button>
              <button 
                type="button" 
                onClick={() => setDemoRole('compliance@banking.com')} 
                className="p-2 text-left rounded-lg bg-[#EBE4CD] hover:bg-[#E3DCBF] border border-[#1E2748]/15 text-[#1E2748] transition"
              >
                <div className="font-bold text-[#1E2748]">🛡️ Compliance Officer</div>
                <div className="text-[9px] text-[#53627C]">compliance@banking.com</div>
              </button>
              <button 
                type="button" 
                onClick={() => setDemoRole('customerops@banking.com')} 
                className="p-2 text-left rounded-lg bg-[#EBE4CD] hover:bg-[#E3DCBF] border border-[#1E2748]/15 text-[#1E2748] transition"
              >
                <div className="font-bold text-[#1E2748]">👥 Customer Ops</div>
                <div className="text-[9px] text-[#53627C]">customerops@banking.com</div>
              </button>
              <button 
                type="button" 
                onClick={() => setDemoRole('finance@banking.com')} 
                className="p-2 text-left rounded-lg bg-[#EBE4CD] hover:bg-[#E3DCBF] border border-[#1E2748]/15 text-[#1E2748] transition"
              >
                <div className="font-bold text-[#1E2748]">📊 Finance Manager</div>
                <div className="text-[9px] text-[#53627C]">finance@banking.com</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link to="/register" className="text-xs text-[#1E2748] hover:underline font-semibold">
              New personnel? Request ERP credentials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
