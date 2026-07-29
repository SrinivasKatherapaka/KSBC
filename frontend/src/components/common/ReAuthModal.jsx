import React, { useState } from 'react';
import { Lock, Shield, KeyRound, X, ArrowRight } from 'lucide-react';
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
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-rose-900/40 shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-900/30">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-900/30 text-rose-400 rounded-xl border border-rose-600/30">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">KSBC Security Clearance Re-Authentication</h3>
              <p className="text-[11px] text-rose-300/70">Verify password to shift account clearance context</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-600/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-900/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-300/60 block">Target Account Persona:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{targetEmail}</span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase text-[10px] tracking-wider">
              Enter Personnel Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-rose-400/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input bg-[#1a030b] border border-rose-900/40 text-white text-xs rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-rose-600"
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-rose-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-rose-950 text-slate-300 rounded-xl font-semibold hover:bg-rose-900/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-rose-800 to-rose-950 hover:from-rose-700 hover:to-rose-900 text-white font-bold rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50 border border-rose-600/40"
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
