import React from 'react';

export const RecentTransactionsTable = ({ transactions = [] }) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-[#1E2748]/15 bg-[#FFFFFF] shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 
            className="text-base font-black text-[#1E2748]"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            General Ledger Postings & Audit Trail
          </h3>
          <p className="text-xs text-[#53627C] font-medium">Live feed of double-entry debit & credit movements</p>
        </div>
        <span className="text-xs font-mono font-bold text-[#1E2748] bg-[#FAF7E6] px-2.5 py-1 rounded-lg border border-[#1E2748]/20">
          {transactions.length} Postings
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center text-[#7E8DA4] text-xs font-medium bg-[#FAF7E6] rounded-xl border border-[#1E2748]/10">
          No General Ledger postings registered yet. Disburse a loan or process a PO to create ledger records.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2748]/15 text-[#53627C] uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-2">Account Code</th>
                <th className="py-3 px-2">Reference ID</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-right">Debit ($)</th>
                <th className="py-3 px-2 text-right">Credit ($)</th>
                <th className="py-3 px-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2748]/10 font-mono">
              {transactions.slice(0, 8).map((tx) => {
                const isDebit = Number(tx.debit_amount) > 0;
                return (
                  <tr key={tx.id} className="hover:bg-[#FAF7E6] transition-colors">
                    <td className="py-3 px-2 font-bold text-[#1E2748]">{tx.account_code}</td>
                    <td className="py-3 px-2 text-[#53627C] text-[11px]">{tx.reference_id}</td>
                    <td className="py-3 px-2 text-[#1E2748] font-sans font-medium">{tx.description}</td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-700">
                      {isDebit ? `$${Number(tx.debit_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-[#1E2748]">
                      {!isDebit ? `$${Number(tx.credit_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right text-[10px] text-[#53627C] font-sans font-medium">
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

