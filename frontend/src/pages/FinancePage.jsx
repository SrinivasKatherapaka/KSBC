import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { BookOpen, CheckCircle2, AlertOctagon, Scale, Layers } from 'lucide-react';

export const FinancePage = () => {
  const [ledger, setLedger] = useState({ accounts: [], transactions: [], auditSummary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/finance/ledger');
        if (res.data.success) {
          setLedger(res.data.ledger);
        }
      } catch (err) {
        setError('Failed to fetch General Ledger data');
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#1E2748] text-[#53627C]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1E2748] font-heading">Finance General Ledger (GL)</h1>
              <p className="text-xs text-slate-400">Double-Entry Accounting, Chart of Accounts & Trial Balance Audit</p>
            </div>

            {ledger.auditSummary && (
              <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border ${
                ledger.auditSummary.isBalanced 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                <Scale className="w-4 h-4" />
                <span>
                  {ledger.auditSummary.isBalanced ? '✓ Double-Entry Ledger Balanced (Equal Debits/Credits)' : '⚠️ Unbalanced Ledger Warning'}
                </span>
              </div>
            )}
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Querying Chart of Accounts and General Ledger postings..." />
          ) : (
            <>
              {/* Chart of Accounts Grid */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-[#1E2748] flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Chart of Accounts</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ledger.accounts.map((acc) => (
                    <div key={acc.account_code} className="p-4 bg-slate-900/70 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-blue-400">{acc.account_code}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                          {acc.account_type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1E2748]">{acc.account_name}</h4>
                      <p className="text-lg font-mono font-extrabold text-emerald-400">
                        ${Number(acc.balance).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-[#1E2748] flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>General Ledger Journal Entries ({ledger.transactions.length})</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-900/60">
                        <th className="py-3 px-3">GL Code</th>
                        <th className="py-3 px-3">Reference ID</th>
                        <th className="py-3 px-3">Description</th>
                        <th className="py-3 px-3 text-right">Debit ($)</th>
                        <th className="py-3 px-3 text-right">Credit ($)</th>
                        <th className="py-3 px-3 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {ledger.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3 font-bold text-blue-400">{tx.account_code}</td>
                          <td className="py-3 px-3 text-slate-300 text-[11px]">{tx.reference_id}</td>
                          <td className="py-3 px-3 text-slate-200 font-sans">{tx.description}</td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-400">
                            {Number(tx.debit_amount) > 0 ? `$${Number(tx.debit_amount).toLocaleString()}` : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-amber-400">
                            {Number(tx.credit_amount) > 0 ? `$${Number(tx.credit_amount).toLocaleString()}` : '-'}
                          </td>
                          <td className="py-3 px-3 text-right text-[10px] text-slate-500 font-sans">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
export default FinancePage;
