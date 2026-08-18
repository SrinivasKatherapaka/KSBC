import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const RecentTransactionsTable = ({ transactions = [] }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-[#dfbd84]/30 bg-[#20302f]/80 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#f4eee2]">General Ledger Postings & Audit Trail</h3>
          <p className="text-xs text-[#a4b8b5]">Live feed of double-entry debit & credit movements</p>
        </div>
        <span className="text-xs font-mono font-bold text-[#dfbd84] bg-[#182423] px-2.5 py-1 rounded-lg border border-[#dfbd84]/30">
          {transactions.length} Postings
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center text-[#a4b8b5]/60 text-xs font-medium">
          No General Ledger postings registered yet. Disburse a loan or process a PO to create ledger records.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#dfbd84]/20 text-[#dfbd84] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Account Code</th>
                <th className="py-3 px-2">Reference ID</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-right">Debit ($)</th>
                <th className="py-3 px-2 text-right">Credit ($)</th>
                <th className="py-3 px-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfbd84]/10 font-mono">
              {transactions.slice(0, 8).map((tx) => {
                const isDebit = Number(tx.debit_amount) > 0;
                return (
                  <tr key={tx.id} className="hover:bg-[#273a39]/60 transition-colors">
                    <td className="py-3 px-2 font-bold text-[#dfbd84]">{tx.account_code}</td>
                    <td className="py-3 px-2 text-[#a4b8b5] text-[11px]">{tx.reference_id}</td>
                    <td className="py-3 px-2 text-[#f4eee2] font-sans">{tx.description}</td>
                    <td className="py-3 px-2 text-right font-bold text-[#58b388]">
                      {isDebit ? `$${Number(tx.debit_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-[#dfbd84]">
                      {!isDebit ? `$${Number(tx.credit_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right text-[10px] text-[#a4b8b5] font-sans">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default RecentTransactionsTable;
