import React, { useState } from 'react';
import { Lock, KeyRound, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ReAuthModal = ({ isOpen, onClose, targetEmail, onAuthenticate }) => {
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (onAuthenticate) {
        await onAuthenticate(targetEmail, password);
      } else {
        await login(targetEmail, password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Security clearance authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141C33]/60 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-[#1E2748]/15 shadow-2xl relative space-y-4 bg-[#F6F2E3] text-[#1E2748]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2748]/15">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FAF7E6] text-[#1E2748] rounded-xl border border-[#1E2748]/15">
              <KeyRound className="w-5 h-5 text-[#1E2748]" />
            </div>
            <div>
              <h3 className="text-base font-archivo font-extrabold text-[#1E2748]">Personnel Clearance Shift</h3>
              <p className="text-[11px] text-[#53627C]">Verify password to switch security clearance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#53627C] hover:text-[#1E2748]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-[#EBE4CD] rounded-xl border border-[#1E2748]/15 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#53627C] block">Target Clearance Persona:</span>
            <span className="font-mono font-bold text-[#1E2748] text-sm">{targetEmail}</span>
          </div>

          <div>
            <label className="block text-[#1E2748] font-bold mb-1 uppercase text-[10px] tracking-wider">
              Enter Personnel Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#1E2748]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input bg-[#F6F2E3] text-[#1E2748] border border-[#1E2748]/15 text-[#1E2748] text-xs rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-[#1E2748]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-[#EBE4CD] text-[#53627C] rounded-xl font-bold hover:bg-[#EBE4CD] hover:text-[#1E2748]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] font-archivo font-extrabold font-archivo font-extrabold rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Authenticate & Shift Persona'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReAuthModal;

