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
    <div className="min-h-screen bg-[#0B1120] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#15203B] via-[#0F172A] to-[#0B1120] flex flex-col items-center justify-center p-6 text-[#FAF7E6]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center space-y-3">
          <FlyingMatLogo size="xl" />
          <p className="text-xs text-[#DFBD84] uppercase tracking-widest font-black font-archivo">Personnel Registration & Clearance</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-[#DFBD84]/25 shadow-2xl space-y-6 bg-[#15203B]/90">
          <div className="flex items-center justify-between pb-4 border-b border-[#DFBD84]/15">
            <h2 className="text-lg font-archivo font-extrabold text-[#FAF7E6] flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-[#DFBD84]" />
              <span>Create KSBC Account</span>
            </h2>
            <span className="text-[10px] font-archivo font-bold text-[#0B1120] bg-[#DFBD84] px-2.5 py-0.5 rounded-full">
              RBAC Clearance
            </span>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#FAF7E6] uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full glass-input bg-[#0F172A] border border-[#DFBD84]/25 text-[#FAF7E6] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#DFBD84]"
                  required
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#FAF7E6] uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full glass-input bg-[#0F172A] border border-[#DFBD84]/25 text-[#FAF7E6] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#DFBD84]"
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FAF7E6] uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full glass-input bg-[#0F172A] border border-[#DFBD84]/25 text-[#FAF7E6] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#DFBD84]"
                required
                placeholder="personnel@banking.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FAF7E6] uppercase tracking-wider mb-1">
                Security Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full glass-input bg-[#0F172A] border border-[#DFBD84]/25 text-[#FAF7E6] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#DFBD84]"
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FAF7E6] uppercase tracking-wider mb-1">
                Personnel Clearance Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full glass-input bg-[#0F172A] border border-[#DFBD84]/25 text-[#FAF7E6] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#DFBD84]"
              >
                <option value="customer_ops" className="bg-[#0F172A] text-[#FAF7E6]">Customer Operations Specialist</option>
                <option value="loan_officer" className="bg-[#0F172A] text-[#FAF7E6]">Underwriting Loan Officer</option>
                <option value="treasury_manager" className="bg-[#0F172A] text-[#FAF7E6]">Treasury Reserves Manager</option>
                <option value="compliance_officer" className="bg-[#0F172A] text-[#FAF7E6]">Compliance & AML Officer</option>
                <option value="finance_manager" className="bg-[#0F172A] text-[#FAF7E6]">Finance General Ledger Manager</option>
                <option value="cfo_executive" className="bg-[#0F172A] text-[#FAF7E6]">CFO Executive Clearance</option>
                <option value="admin" className="bg-[#0F172A] text-[#FAF7E6]">System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-[#C59E5F] via-[#DFBD84] to-[#C59E5F] hover:from-[#DFBD84] hover:to-[#EED29E] text-[#0B1120] text-xs font-archivo font-extrabold rounded-xl shadow-lg shadow-[#DFBD84]/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Registering Account Clearance...' : 'Create Account & Access KSBC ERP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-[#DFBD84] hover:underline font-semibold">
              Already have credentials? Sign in to KSBC ERP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
