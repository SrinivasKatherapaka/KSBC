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
    <div className="min-h-screen bg-[#FAF7E6] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FAF7E6] via-[#F3EEDC] to-[#EBE4CD] flex flex-col items-center justify-center p-6 text-[#1E2748]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center space-y-3">
          <FlyingMatLogo size="xl" />
          <p className="text-xs text-[#53627C] uppercase tracking-widest font-black font-archivo">Personnel Registration & Clearance</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-[#1E2748]/15 shadow-2xl space-y-6 bg-[#F3EEDC]/95">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2748]/10">
            <h2 className="text-lg font-archivo font-extrabold text-[#1E2748] flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-[#1E2748]" />
              <span>Create KSBC Account</span>
            </h2>
            <span className="text-[10px] font-archivo font-bold text-[#FAF7E6] bg-[#1E2748] px-2.5 py-0.5 rounded-full">
              RBAC Clearance
            </span>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1E2748] uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full glass-input bg-[#EBE4CD] border border-[#1E2748]/20 text-[#1E2748] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
                  required
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E2748] uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full glass-input bg-[#EBE4CD] border border-[#1E2748]/20 text-[#1E2748] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2748] uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full glass-input bg-[#EBE4CD] border border-[#1E2748]/20 text-[#1E2748] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
                required
                placeholder="personnel@banking.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2748] uppercase tracking-wider mb-1">
                Security Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full glass-input bg-[#EBE4CD] border border-[#1E2748]/20 text-[#1E2748] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2748] uppercase tracking-wider mb-1">
                Personnel Clearance Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full glass-input bg-[#EBE4CD] border border-[#1E2748]/20 text-[#1E2748] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
              >
                <option value="customer_ops">Customer Operations Specialist</option>
                <option value="loan_officer">Underwriting Loan Officer</option>
                <option value="treasury_manager">Treasury Reserves Manager</option>
                <option value="compliance_officer">Compliance & AML Officer</option>
                <option value="finance_manager">Finance General Ledger Manager</option>
                <option value="cfo_executive">CFO Executive Clearance</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] text-xs font-archivo font-extrabold rounded-xl shadow-lg shadow-[#1E2748]/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Registering Account Clearance...' : 'Create Account & Access KSBC ERP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-[#1E2748] hover:underline font-semibold">
              Already have credentials? Sign in to KSBC ERP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
