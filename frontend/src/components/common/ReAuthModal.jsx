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
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-[#2aa198]/40 shadow-2xl relative space-y-4 bg-[#073642]">
        <div className="flex items-center justify-between pb-3 border-b border-[#2aa198]/20">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#002129] text-[#ffd700] rounded-xl border border-[#ffd700]/30">
              <KeyRound className="w-5 h-5 text-[#ffd700]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#fdf6e3]">KSBC Security Clearance Re-Authentication</h3>
              <p className="text-[11px] text-[#2aa198]">Verify password to shift account clearance context</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#93a1a1] hover:text-[#fdf6e3]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#002129] border border-red-500/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-[#002129]/80 rounded-xl border border-[#2aa198]/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#2aa198] block">Target Account Persona:</span>
            <span className="font-mono font-bold text-[#ffd700] text-sm">{targetEmail}</span>
          </div>

          <div>
            <label className="block text-[#2aa198] font-semibold mb-1 uppercase text-[10px] tracking-wider">
              Enter Personnel Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#2aa198]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 text-[#fdf6e3] text-xs rounded-xl p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-[#2aa198]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-[#002129] text-[#93a1a1] rounded-xl font-semibold hover:bg-[#073642]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-[#b58900] via-[#d4af37] to-[#b58900] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] font-black rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50 border border-[#ffd700]/40"
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
