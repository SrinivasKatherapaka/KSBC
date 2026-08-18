import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ArrowRight } from 'lucide-react';
import ErrorAlert from '../components/common/ErrorAlert';
import FlyingMatLogo from '../components/common/FlyingMatLogo';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'customer_ops'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#182423] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#273a39]/90 via-[#1e2e2d] to-[#141d1c] flex flex-col items-center justify-center p-6 text-[#a4b8b5]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center space-y-2">
          <FlyingMatLogo size="xl" />
          <p className="text-xs text-[#dfbd84] uppercase tracking-widest font-bold">Personnel Registration & Clearance Onboarding</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-[#dfbd84]/30 shadow-2xl space-y-6 bg-[#20302f]/85">
          <div className="flex items-center justify-between pb-4 border-b border-[#dfbd84]/20">
            <h2 className="text-lg font-bold text-[#f4eee2] flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-[#dfbd84]" />
              <span>Create KSBC Account</span>
            </h2>
            <span className="text-[10px] font-bold text-[#dfbd84] bg-[#182423] px-2 py-0.5 rounded border border-[#dfbd84]/30">
              RBAC Clearance
            </span>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#dfbd84] uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full glass-input bg-[#182423] border border-[#dfbd84]/35 text-[#f4eee2] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#dfbd84]"
                  required
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#dfbd84] uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full glass-input bg-[#182423] border border-[#dfbd84]/35 text-[#f4eee2] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#dfbd84]"
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dfbd84] uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full glass-input bg-[#182423] border border-[#dfbd84]/35 text-[#f4eee2] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#dfbd84]"
                required
                placeholder="j.doe@banking.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dfbd84] uppercase tracking-wider mb-1">
                Password (min 8 chars)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full glass-input bg-[#182423] border border-[#dfbd84]/35 text-[#f4eee2] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#dfbd84]"
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dfbd84] uppercase tracking-wider mb-1">
                Select Banking Role Clearance
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full glass-input bg-[#182423] border border-[#dfbd84]/35 text-[#f4eee2] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#dfbd84] font-medium"
              >
                <option value="customer_ops">Customer Operations</option>
                <option value="compliance_officer">Compliance & KYC Officer</option>
                <option value="loan_officer">Loan Underwriting Officer</option>
                <option value="treasury_manager">Treasury Manager</option>
                <option value="finance_manager">Finance GL Manager</option>
                <option value="cfo_executive">CFO Executive</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-[#c59e5f] via-[#dfbd84] to-[#c59e5f] hover:from-[#dfbd84] hover:to-[#eed29e] text-[#182423] text-xs font-black rounded-xl shadow-lg shadow-black/40 transition flex items-center justify-center space-x-2 disabled:opacity-50 border border-[#dfbd84]/50"
            >
              <span>{submitting ? 'Registering Account...' : 'Register KSBC Credentials'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-[#a4b8b5]">
              Already registered?{' '}
              <Link to="/login" className="text-[#dfbd84] hover:underline font-bold">
                Sign In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
