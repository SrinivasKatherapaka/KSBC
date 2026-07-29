import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { ShoppingBag, Plus, Building2, CheckCircle2, DollarSign, X, Check, FileText } from 'lucide-react';

export const ProcurementPage = () => {
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);

  // PO Form State
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('150000');
  const [description, setDescription] = useState('Core Bank Hardware & Cloud Infrastructure Upgrade');
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
        setSuccessMsg('Purchase Order issued successfully and posted to General Ledger.');
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#002b36] text-[#93a1a1]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#fdf6e3] font-heading">KSBC Procurement & Vendors</h1>
              <p className="text-xs text-[#2aa198]">Vendor Management, Requisitions & Automated General Ledger Expense Postings</p>
            </div>

            <button
              onClick={() => setIsPoModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#b58900] via-[#d4af37] to-[#b58900] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-2 self-start md:self-auto"
            >
              <Plus className="w-4 h-4 text-[#002b36]" />
              <span>Issue Purchase Order (PO)</span>
            </button>
          </div>

          {/* Success Notification */}
          {successMsg && (
            <div className="p-3.5 bg-[#859900]/20 border border-[#859900]/50 rounded-xl text-xs text-[#859900] font-bold flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </span>
              <button onClick={() => setSuccessMsg('')} className="text-[#859900] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Loading vendors & purchase orders..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Approved Vendors Panel */}
              <div className="glass-panel p-5 rounded-2xl border border-[#2aa198]/30 space-y-4 bg-[#073642]/60 shadow-xl">
                <h3 className="text-sm font-bold text-[#fdf6e3] flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#2aa198]" />
                  <span>Approved Banking Vendors ({vendors.length})</span>
                </h3>

                <div className="space-y-3 text-xs">
                  {vendors.map((v) => (
                    <div key={v.id} className="p-3.5 bg-[#002129] rounded-xl border border-[#2aa198]/20 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#fdf6e3]">{v.vendor_name}</span>
                        <span className="px-2 py-0.5 bg-[#859900]/20 text-[#859900] text-[10px] font-bold rounded border border-[#859900]/40">
                          Approved
                        </span>
                      </div>
                      <p className="text-[10px] text-[#93a1a1] font-mono">Tax ID: {v.tax_id}</p>
                      <p className="text-[11px] text-[#2aa198]">{v.contact_email}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Orders Feed */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#2aa198]/30 space-y-4 bg-[#073642]/60 shadow-xl">
                <h3 className="text-sm font-bold text-[#fdf6e3] flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-[#ffd700]" />
                  <span>Issued Purchase Orders</span>
                </h3>

                {purchaseOrders.length === 0 ? (
                  <div className="p-8 text-center text-[#93a1a1] text-xs">
                    No purchase orders issued yet. Click "Issue Purchase Order" to create a requisition.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#2aa198]/20 text-[#2aa198] uppercase tracking-wider text-[10px] bg-[#002129]">
                          <th className="py-3.5 px-3">PO ID</th>
                          <th className="py-3.5 px-3">Description</th>
                          <th className="py-3.5 px-3 text-right">Amount ($)</th>
                          <th className="py-3.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2aa198]/15">
                        {purchaseOrders.map((po) => (
                          <tr key={po.id} className="hover:bg-[#002129]/40 transition">
                            <td className="py-3.5 px-3 font-mono font-bold text-[#ffd700]">
                              {po.po_number || `PO-${po.id.slice(0, 8)}`}
                            </td>
                            <td className="py-3.5 px-3 text-[#fdf6e3] font-medium">{po.description}</td>
                            <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#859900]">
                              ${Number(po.amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase bg-[#859900]/20 text-[#859900] border-[#859900]/40">
                                {po.status || 'Approved'}
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

      {/* Issue PO Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-[#ffd700]/40 bg-[#073642] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2aa198]/20">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#002129] text-[#ffd700] rounded-xl border border-[#ffd700]/30">
                  <ShoppingBag className="w-5 h-5 text-[#ffd700]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#fdf6e3]">Issue Vendor Purchase Order</h3>
                  <p className="text-[11px] text-[#2aa198]">Procurement & Expense General Ledger Posting</p>
                </div>
              </div>
              <button onClick={() => setIsPoModalOpen(false)} className="text-[#93a1a1] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#2aa198] font-bold mb-1 uppercase text-[10px]">Select Vendor</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2.5 text-[#fdf6e3]"
                  required
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.vendor_name} ({v.tax_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#2aa198] font-bold mb-1 uppercase text-[10px]">Requisition Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2.5 text-[#fdf6e3]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2aa198] font-bold mb-1 uppercase text-[10px]">Total Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full glass-input bg-[#002129] border border-[#2aa198]/40 rounded-xl p-2.5 text-[#ffd700] font-mono font-bold"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#2aa198]/20">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-4 py-2 bg-[#002129] text-[#93a1a1] rounded-xl font-semibold hover:bg-[#073642]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#b58900] via-[#d4af37] to-[#b58900] hover:from-[#d4af37] hover:to-[#ffd700] text-[#002b36] font-black rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Issuing PO...' : 'Issue Purchase Order'}
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
