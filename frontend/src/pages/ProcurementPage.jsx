import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { ShoppingBag, Plus, Building2, CheckCircle2, DollarSign, X } from 'lucide-react';

export const ProcurementPage = () => {
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);

  // PO Form State
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('150000');
  const [description, setDescription] = useState('Core Server Hardware & Network Upgrade');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, poRes] = await Promise.all([
        apiClient.get('/procurement/vendors'),
        apiClient.get('/procurement/pos')
      ]);
      if (vRes.data.success) {
        setVendors(vRes.data.vendors);
        if (vRes.data.vendors.length > 0) setVendorId(vRes.data.vendors[0].id);
      }
      if (poRes.data.success) setPurchaseOrders(poRes.data.purchaseOrders);
    } catch (err) {
      setError('Failed to fetch procurement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePo = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await apiClient.post('/procurement/pos', {
        vendorId,
        amount: Number(amount),
        description
      });
      if (res.data.success) {
        setIsPoModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">Procurement & Vendors</h1>
              <p className="text-xs text-slate-400">Vendor Management, Requisitions & Automated Expense Ledger Postings</p>
            </div>

            <button
              onClick={() => setIsPoModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center space-x-2 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Purchase Order (PO)</span>
            </button>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Loading vendors & purchase orders..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Approved Vendors Panel */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Approved Banking Vendors ({vendors.length})</span>
                </h3>

                <div className="space-y-3 text-xs">
                  {vendors.map((v) => (
                    <div key={v.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{v.vendor_name}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded">
                          Approved
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">Tax ID: {v.tax_id}</p>
                      <p className="text-[11px] text-slate-400">{v.contact_email}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Orders Feed */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Issued Purchase Orders</span>
                </h3>

                {purchaseOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No purchase orders issued yet. Click "Issue Purchase Order" to create a requisition.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-900/60">
                          <th className="py-3 px-3">PO ID</th>
                          <th className="py-3 px-3">Description</th>
                          <th className="py-3 px-3 text-right">Amount ($)</th>
                          <th className="py-3 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {purchaseOrders.map((po) => (
                          <tr key={po.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-3 font-mono font-bold text-blue-400">{po.id.slice(0, 8)}</td>
                            <td className="py-3 px-3 text-slate-200">{po.description}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                              ${Number(po.amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                                {po.status} (GL 5010 Debited)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New PO Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Issue Procurement Purchase Order</h3>
              <button onClick={() => setIsPoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Vendor *</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full glass-input bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.vendor_name} ({v.tax_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">PO Requisition Amount ($) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full glass-input bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Goods Specification *</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Creating PO...' : 'Issue PO & Write GL Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProcurementPage;
