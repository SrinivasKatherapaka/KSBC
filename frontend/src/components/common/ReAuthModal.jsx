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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-[#dfbd84]/40 shadow-2xl relative space-y-4 bg-[#20302f]">
        <div className="flex items-center justify-between pb-3 border-b border-[#dfbd84]/20">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#182423] text-[#dfbd84] rounded-xl border border-[#dfbd84]/30">
              <KeyRound className="w-5 h-5 text-[#dfbd84]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f4eee2]">KSBC Security Clearance Re-Authentication</h3>
              <p className="text-[11px] text-[#dfbd84]">Verify password to shift account clearance context</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#a4b8b5] hover:text-[#f4eee2]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#182423] border border-red-500/40 rounded-xl text-xs text-[#dfbd84]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-[#182423]/80 rounded-xl border border-[#dfbd84]/25 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#dfbd84] block">Target Account Persona:</span>
            <span className="font-mono font-bold text-[#dfbd84] text-sm">{targetEmail}</span>
          </div>

          <div>
            <label className="block text-[#dfbd84] font-semibold mb-1 uppercase text-[10px] tracking-wider">
              Enter Personnel Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#dfbd84]" />
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

          <div className="pt-3 flex justify-end space-x-2 border-t border-[#dfbd84]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-[#182423] text-[#a4b8b5] rounded-xl font-semibold hover:bg-[#273a39] hover:text-[#f4eee2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-[#c59e5f] via-[#dfbd84] to-[#c59e5f] hover:from-[#dfbd84] hover:to-[#eed29e] text-[#182423] font-black rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50 border border-[#dfbd84]/50"
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
