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
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-[#DFBD84]/15 shadow-2xl relative space-y-4 bg-[#15203B]/85 text-[#FAF7E6]">
        <div className="flex items-center justify-between pb-3 border-b border-[#DFBD84]/15">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0B1120] text-[#FAF7E6] rounded-xl border border-[#DFBD84]/15">
              <KeyRound className="w-5 h-5 text-[#FAF7E6]" />
            </div>
            <div>
              <h3 className="text-base font-archivo font-extrabold text-[#FAF7E6]">Personnel Clearance Shift</h3>
              <p className="text-[11px] text-[#94A3B8]">Verify password to switch security clearance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#FAF7E6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-[#0F172A] rounded-xl border border-[#DFBD84]/15 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Target Clearance Persona:</span>
            <span className="font-mono font-bold text-[#FAF7E6] text-sm">{targetEmail}</span>
          </div>

          <div>
            <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px] tracking-wider">
              Enter Personnel Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#FAF7E6]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/20 text-[#FAF7E6] text-xs rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#DFBD84]"
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-[#DFBD84]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-[#1E2D4E] text-[#94A3B8] rounded-xl font-bold hover:bg-[#1E2D4E] hover:text-[#FAF7E6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-[#C59E5F] via-[#DFBD84] to-[#C59E5F] hover:from-[#DFBD84] hover:to-[#EED29E] text-[#0B1120] font-black font-archivo font-extrabold rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
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

