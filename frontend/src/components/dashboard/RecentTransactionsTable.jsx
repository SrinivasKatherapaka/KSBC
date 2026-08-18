import React from 'react';

export const RecentTransactionsTable = ({ transactions = [] }) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-[#DFBD84]/20 bg-[#15203B]/85 shadow-2xl text-[#FAF7E6]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 
            className="text-base font-black text-[#FAF7E6]"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            General Ledger Postings & Audit Trail
          </h3>
          <p className="text-xs text-[#94A3B8] font-medium">Live feed of double-entry debit & credit movements</p>
        </div>
        <span className="text-xs font-mono font-bold text-[#DFBD84] bg-[#0F172A] px-2.5 py-1 rounded-lg border border-[#DFBD84]/25">
          {transactions.length} Postings
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center text-[#94A3B8] text-xs font-medium bg-[#0F172A] rounded-xl border border-[#DFBD84]/15">
          No General Ledger postings registered yet. Disburse a loan or process a PO to create ledger records.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DFBD84]/20 text-[#DFBD84] uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-2">Account Code</th>
                <th className="py-3 px-2">Reference ID</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-right">Debit ($)</th>
                <th className="py-3 px-2 text-right">Credit ($)</th>
                <th className="py-3 px-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFBD84]/10 font-mono">
              {transactions.slice(0, 8).map((tx) => {
                const isDebit = Number(tx.debit_amount) > 0;
                return (
                  <tr key={tx.id} className="hover:bg-[#1E2D4E]/50 transition-colors">
                    <td className="py-3 px-2 font-bold text-[#DFBD84]">{tx.account_code}</td>
                    <td className="py-3 px-2 text-[#94A3B8] text-[11px]">{tx.reference_id}</td>
                    <td className="py-3 px-2 text-[#FAF7E6] font-sans font-medium">{tx.description}</td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-400">
                      {isDebit ? `$${Number(tx.debit_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-[#FAF7E6]">
                      {!isDebit ? `$${Number(tx.credit_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right text-[10px] text-[#94A3B8] font-sans font-medium">
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


