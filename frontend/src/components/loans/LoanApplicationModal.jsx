import React, { useState } from 'react';
import { X, DollarSign, Calendar, Layers, Percent, UserCheck, User, Building, Store, Landmark } from 'lucide-react';

export const LoanApplicationModal = ({ isOpen, onClose, customers = [], onSubmit }) => {
  const [customerId, setCustomerId] = useState('');
  const [applicantName, setApplicantName] = useState('Katherapaka Srinivas');
  const [applicantCategory, setApplicantCategory] = useState('private_individual');
  const [principalAmount, setPrincipalAmount] = useState('2500000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [termMonths, setTermMonths] = useState('36');
  const [purpose, setPurpose] = useState('Working Capital');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCustomerSelect = (selectedId) => {
    setCustomerId(selectedId);
    if (selectedId) {
      const cust = customers.find(c => c.id === selectedId);
      if (cust) {
        setApplicantName(`${cust.first_name} ${cust.last_name}`);
        if (cust.client_category) {
          setApplicantCategory(cust.client_category);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!applicantName.trim() && !customerId) {
      setError('Please provide an Applicant Name or select a Corporate Customer.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        customerId: customerId || undefined,
        applicantName: applicantName.trim() || 'Private Account Holder',
        applicantCategory,
        principalAmount: Number(principalAmount),
        interestRate: Number(interestRate),
        termMonths: Number(termMonths),
        purpose
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit loan application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-rose-900/40 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-rose-900/30 mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-900/30 text-rose-400 rounded-xl border border-rose-600/30">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">New Loan Application Intake</h2>
              <p className="text-xs text-rose-300/60">Private Account Holder & Commercial Underwriting Intake</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-950/80 border border-rose-600/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
                Applicant Name / Entity *
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g. Katherapaka Srinivas"
                className="w-full glass-input bg-[#1a030b] border border-rose-900/40 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
                Applicant Category *
              </label>
              <select
                value={applicantCategory}
                onChange={(e) => setApplicantCategory(e.target.value)}
                className="w-full glass-input bg-[#1a030b] border border-rose-900/40 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-600 font-medium"
              >
                <option value="private_individual">👤 Private / Individual Account Holder</option>
                <option value="corporate">🏢 Corporate / Enterprise Commercial</option>
                <option value="sme">🏬 SME / Small Business</option>
                <option value="institutional">🏛️ Institutional Entity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
              Select Existing Onboarded Account (Optional)
            </label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full glass-input bg-[#1a030b] border border-rose-900/40 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-600"
            >
              <option value="">-- Choose Existing Account ({customers.length}) --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name} ({c.client_category ? c.client_category.replace('_', ' ') : 'Account'}) - {c.national_id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
                Principal Amount ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500 text-xs">$</span>
                <input
                  type="number"
                  min="10000"
                  max="50000000"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  className="w-full glass-input bg-[#1a030b] border border-rose-900/40 text-white text-xs rounded-xl p-3 pl-7 focus:outline-none focus:ring-2 focus:ring-rose-600 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
                Interest Rate (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="30"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full glass-input bg-[#1a030b] border border-rose-900/40 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-600 font-mono"
                  required
                />
                <Percent className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
                Term Length *
              </label>
              <select
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                className="w-full glass-input bg-[#1a030b] border border-rose-900/40 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-600"
              >
                <option value="12">12 Months (1 Year)</option>
                <option value="24">24 Months (2 Years)</option>
                <option value="36">36 Months (3 Years)</option>
                <option value="60">60 Months (5 Years)</option>
                <option value="120">120 Months (10 Years)</option>
                <option value="240">240 Months (20 Years)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-200/80 uppercase tracking-wider mb-1.5">
                Loan Purpose *
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full glass-input bg-[#1a030b] border border-rose-900/40 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-600"
              >
                <option value="Working Capital">Working Capital</option>
                <option value="Equipment Purchase">Equipment Purchase & Automation</option>
                <option value="Real Estate">Commercial / Private Real Estate</option>
                <option value="Personal Wealth Portfolio">Personal Wealth Portfolio Scaling</option>
                <option value="Debt Refinancing">Debt Refinancing & Consolidation</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-rose-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900/50 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-800 to-rose-950 hover:from-rose-700 hover:to-rose-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/30 transition disabled:opacity-50 border border-rose-600/40"
            >
              {submitting ? 'Submitting Application...' : 'Create Loan Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LoanApplicationModal;
