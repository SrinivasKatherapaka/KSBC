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
    <div className="min-h-screen bg-[#182423] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#273a39]/90 via-[#1e2e2d] to-[#141d1c] flex flex-col items-center justify-center p-6 text-[#a4b8b5]">
      <div className="w-full max-w-md">
        {/* KSBC Header Branding with Temple Logo */}
        <div className="text-center mb-8 flex flex-col items-center space-y-2">
          <FlyingMatLogo size="xl" />
          <p className="text-xs text-[#dfbd84] uppercase tracking-widest font-bold">Enterprise Banking ERP</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-[#dfbd84]/30 shadow-2xl space-y-6 bg-[#20302f]/85">
          <div className="flex items-center justify-between pb-4 border-b border-[#dfbd84]/20">
            <h2 className="text-lg font-bold text-[#f4eee2] flex items-center space-x-2">
              <Lock className="w-4 h-4 text-[#dfbd84]" />
              <span>KSBC Personnel Sign-In</span>
            </h2>
            <span className="text-[10px] font-bold text-[#dfbd84] bg-[#182423] px-2 py-0.5 rounded border border-[#dfbd84]/30">
              JWT Secured
            </span>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#dfbd84] uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#dfbd84]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input bg-[#182423] border border-[#dfbd84]/35 text-[#f4eee2] text-xs rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#dfbd84]"
                  required
                  placeholder="personnel@banking.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dfbd84] uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#dfbd84]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input bg-[#182423] border border-[#dfbd84]/35 text-[#f4eee2] text-xs rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#dfbd84]"
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-[#c59e5f] via-[#dfbd84] to-[#c59e5f] hover:from-[#dfbd84] hover:to-[#eed29e] text-[#182423] text-xs font-black rounded-xl shadow-lg shadow-black/40 transition flex items-center justify-center space-x-2 disabled:opacity-50 border border-[#dfbd84]/50"
            >
              <span>{submitting ? 'Authenticating KSBC Credentials...' : 'Authenticate & Access KSBC ERP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Preset Demo Role Selectors */}
          <div className="pt-4 border-t border-[#dfbd84]/20 space-y-2">
            <span className="text-[10px] font-bold text-[#dfbd84] uppercase tracking-wider block">
              Quick KSBC Personnel Switcher (Demo):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
              <button type="button" onClick={() => setDemoRole('cfo@banking.com')} className="p-2 bg-[#182423] hover:bg-[#273a39] rounded-lg text-[#f4eee2] text-left border border-[#dfbd84]/25 font-medium transition">
                👔 CFO Executive
              </button>
              <button type="button" onClick={() => setDemoRole('loan@banking.com')} className="p-2 bg-[#182423] hover:bg-[#273a39] rounded-lg text-[#f4eee2] text-left border border-[#dfbd84]/25 font-medium transition">
                📋 Loan Officer
              </button>
              <button type="button" onClick={() => setDemoRole('treasury@banking.com')} className="p-2 bg-[#182423] hover:bg-[#273a39] rounded-lg text-[#f4eee2] text-left border border-[#dfbd84]/25 font-medium transition">
                🏛️ Treasury Manager
              </button>
              <button type="button" onClick={() => setDemoRole('compliance@banking.com')} className="p-2 bg-[#182423] hover:bg-[#273a39] rounded-lg text-[#f4eee2] text-left border border-[#dfbd84]/25 font-medium transition">
                🛡️ Compliance Officer
              </button>
              <button type="button" onClick={() => setDemoRole('customerops@banking.com')} className="p-2 bg-[#182423] hover:bg-[#273a39] rounded-lg text-[#f4eee2] text-left border border-[#dfbd84]/25 font-medium transition">
                👥 Customer Ops
              </button>
              <button type="button" onClick={() => setDemoRole('finance@banking.com')} className="p-2 bg-[#182423] hover:bg-[#273a39] rounded-lg text-[#f4eee2] text-left border border-[#dfbd84]/25 font-medium transition">
                📊 Finance Manager
              </button>
              <button type="button" onClick={() => setDemoRole('admin@banking.com')} className="p-2 bg-[#182423] hover:bg-[#273a39] rounded-lg text-[#f4eee2] text-left border border-[#dfbd84]/25 font-medium col-span-2 sm:col-span-1 transition">
                ⚡ System Admin
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#a4b8b5]">
              New KSBC employee?{' '}
              <Link to="/register" className="text-[#dfbd84] hover:underline font-bold">
                Register Clearance Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
