import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, Plus, Building2, CheckCircle2, DollarSign, X, Check, FileText,
  Clock, CreditCard, ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';

export const ProcurementPage = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [processingPoId, setProcessingPoId] = useState(null);

  // PO Form State
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('150000');
  const [description, setDescription] = useState('Core Bank Hardware & Cloud Infrastructure Upgrade');
  const [submitting, setSubmitting] = useState(false);

  const canManageProcurement = ['cfo_executive', 'finance_manager', 'admin'].includes(user?.role);

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
      if (poRes.data.success) {
        setPurchaseOrders(poRes.data.purchaseOrders);
      }
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

  const handleProcessPayment = async (poId) => {
    if (!canManageProcurement) {
      setError('Only CFO, Finance Manager, or Administrator can process PO payments.');
      return;
    }

    try {
      setProcessingPoId(poId);
      setError('');
      const res = await apiClient.put(`/procurement/pos/${poId}/pay`);
      if (res.data.success) {
        setSuccessMsg('Vendor payment processed successfully and debited to General Ledger Vault Cash.');
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process PO payment');
    } finally {
      setProcessingPoId(null);
    }
  };

  // Metrics Calculations
  const totalIssuedValue = purchaseOrders.reduce((sum, po) => sum + Number(po.amount || 0), 0);
  const pendingPaymentsDue = purchaseOrders
    .filter(po => po.status === 'pending_payment' || po.status === 'approved' || po.status === 'submitted')
    .reduce((sum, po) => sum + Number(po.amount || 0), 0);
  const totalPaidToDate = purchaseOrders
    .filter(po => po.status === 'paid')
    .reduce((sum, po) => sum + Number(po.amount || 0), 0);

  // Filtered List
  const filteredOrders = purchaseOrders.filter(po => {
    if (activeTab === 'pending_payment') return po.status === 'pending_payment' || po.status === 'submitted';
    if (activeTab === 'paid') return po.status === 'paid';
    if (activeTab === 'approved') return po.status === 'approved';
    if (activeTab === 'in_review') return po.status === 'in_review';
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-[#FAF7E6] text-[#94A3B8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#FAF7E6] font-heading flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-[#FAF7E6]" />
                <span>KSBC Procurement & Purchase Orders</span>
              </h1>
              <p className="text-xs text-[#FAF7E6]">
                Live Orders, Vendor Management & Automated General Ledger Payments Due Reconciliations
              </p>
            </div>

            {canManageProcurement && (
              <button
                onClick={() => setIsPoModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#C59E5F] via-[#DFBD84] to-[#C59E5F] hover:from-[#DFBD84] hover:to-[#EED29E] text-[#0B1120] font-black text-xs font-black rounded-xl shadow-lg transition flex items-center space-x-2 self-start md:self-auto"
              >
                <Plus className="w-4 h-4 text-[#FAF7E6]" />
                <span>Issue Purchase Order (PO)</span>
              </button>
            )}
          </div>

          {/* Success Notification */}
          {successMsg && (
            <div className="p-3.5 bg-[#58b388]/20 border border-[#58b388]/50 rounded-xl text-xs text-[#58b388] font-bold flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </span>
              <button onClick={() => setSuccessMsg('')} className="text-[#58b388] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* Executive Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#15203B]/85 text-[#FAF7E6]/60 rounded-2xl border border-[#DFBD84]/15 space-y-1">
              <span className="text-[10px] font-bold text-[#FAF7E6] uppercase block">TOTAL ISSUED POs VALUE</span>
              <span className="text-xl font-black text-[#FAF7E6] font-mono">
                ${totalIssuedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[#94A3B8] block font-medium">{purchaseOrders.length} Commercial Purchase Orders</span>
            </div>

            <div className="p-4 bg-[#15203B]/85 text-[#FAF7E6]/80 rounded-2xl border border-[#DFBD84]/15 space-y-1 shadow-lg">
              <span className="text-[10px] font-bold text-[#FAF7E6] uppercase block flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#FAF7E6]" />
                <span>PENDING PAYMENTS DUE</span>
              </span>
              <span className="text-xl font-black text-[#FAF7E6] font-mono">
                ${pendingPaymentsDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[#FAF7E6]/80 block font-bold">Vendor Liabilities Active</span>
            </div>

            <div className="p-4 bg-[#15203B]/85 text-[#FAF7E6]/60 rounded-2xl border border-[#DFBD84]/15 space-y-1">
              <span className="text-[10px] font-bold text-[#FAF7E6] uppercase block">APPROVED BANKING VENDORS</span>
              <span className="text-xl font-black text-[#58b388] font-mono">
                {vendors.length} Vendors
              </span>
              <span className="text-[10px] text-[#58b388] block font-bold">100% Tax & BSA Cleared</span>
            </div>

            <div className="p-4 bg-[#15203B]/85 text-[#FAF7E6]/60 rounded-2xl border border-[#DFBD84]/15 space-y-1">
              <span className="text-[10px] font-bold text-[#FAF7E6] uppercase block">TOTAL PAID TO DATE</span>
              <span className="text-xl font-black text-[#58b388] font-mono">
                ${totalPaidToDate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-[#94A3B8] block font-medium">Reconciled in Vault Cash</span>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading vendors, live purchase orders & payments due..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Approved Vendors Panel */}
              <div className="glass-panel p-5 rounded-2xl border border-[#DFBD84]/15 space-y-4 bg-[#15203B]/85 text-[#FAF7E6]/60 shadow-xl">
                <h3 className="text-sm font-bold text-[#FAF7E6] flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#FAF7E6]" />
                  <span>Approved Banking Vendors ({vendors.length})</span>
                </h3>

                <div className="space-y-3 text-xs max-h-[500px] overflow-y-auto pr-1">
                  {vendors.map((v) => (
                    <div key={v.id} className="p-3.5 bg-[#15203B]/85 text-[#FAF7E6] rounded-xl border border-[#DFBD84]/15 space-y-1 hover:border-[#DFBD84]/15 transition">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#FAF7E6]">{v.vendor_name}</span>
                        <span className="px-2 py-0.5 bg-[#58b388]/20 text-[#58b388] text-[10px] font-bold rounded border border-[#58b388]/40">
                          Approved
                        </span>
                      </div>
                      <p className="text-[10px] text-[#94A3B8] font-mono">Tax ID: {v.tax_id}</p>
                      <p className="text-[11px] text-[#FAF7E6]">{v.contact_email}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Orders & Payments Due Main Hub */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#DFBD84]/15 space-y-4 bg-[#15203B]/85 text-[#FAF7E6]/60 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFBD84]/15 pb-3">
                  <h3 className="text-sm font-bold text-[#FAF7E6] flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-[#FAF7E6]" />
                    <span>Live Purchase Orders & Payments Due</span>
                  </h3>

                  {/* Filter Tabs */}
                  <div className="flex items-center space-x-1 bg-[#15203B]/85 text-[#FAF7E6] p-1 rounded-xl border border-[#DFBD84]/15 text-[11px]">
                    {[
                      { id: 'all', label: 'All POs' },
                      { id: 'pending_payment', label: 'Payments Due' },
                      { id: 'paid', label: 'Paid' },
                      { id: 'approved', label: 'Approved' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          activeTab === t.id
                            ? 'bg-[#15203B]/85 text-[#FAF7E6] text-[#FAF7E6] border border-[#DFBD84]/15 shadow'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-[#94A3B8] text-xs">
                    No purchase orders matching selected status.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#DFBD84]/15 text-[#FAF7E6] uppercase tracking-wider text-[10px] bg-[#15203B]/85 text-[#FAF7E6]">
                          <th className="py-3.5 px-3">PO Number</th>
                          <th className="py-3.5 px-3">Vendor / Requisition</th>
                          <th className="py-3.5 px-3 text-right">Amount ($)</th>
                          <th className="py-3.5 px-3 text-center">Status</th>
                          <th className="py-3.5 px-3 text-center">Payment Due</th>
                          <th className="py-3.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFBD84]/15">
                        {filteredOrders.map((po) => {
                          const vendorName = po.vendor?.vendor_name || 'Approved Vendor';
                          const isPaid = po.status === 'paid';
                          const isPendingDue = po.status === 'pending_payment' || po.status === 'submitted';
                          const isProcessing = processingPoId === po.id;

                          return (
                            <tr key={po.id} className="hover:bg-[#15203B]/85 text-[#FAF7E6]/40 transition">
                              <td className="py-3.5 px-3 font-mono font-bold text-[#FAF7E6]">
                                {po.po_number || `PO-${po.id.slice(0, 8)}`}
                              </td>
                              <td className="py-3.5 px-3 space-y-0.5">
                                <span className="font-bold text-[#FAF7E6] block">{vendorName}</span>
                                <span className="text-[11px] text-[#94A3B8] block">{po.description}</span>
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#FAF7E6]">
                                ${Number(po.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                {isPaid ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#58b388]/20 text-[#58b388] border border-[#58b388]/40">
                                    PAID
                                  </span>
                                ) : isPendingDue ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#1E2D4E]/30 text-[#FAF7E6] border border-[#DFBD84]/15 animate-pulse">
                                    PAYMENT DUE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#268bd2]/20 text-[#268bd2] border border-[#268bd2]/40">
                                    {po.status || 'APPROVED'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-center font-mono text-[10px]">
                                {po.due_date ? new Date(po.due_date).toLocaleDateString() : 'Immediate'}
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                {isPaid ? (
                                  <span className="text-[10px] text-[#58b388] font-bold flex items-center justify-center space-x-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Settled</span>
                                  </span>
                                ) : canManageProcurement ? (
                                  <button
                                    onClick={() => handleProcessPayment(po.id)}
                                    disabled={isProcessing}
                                    className="px-2.5 py-1 bg-[#1E2D4E] hover:bg-[#141C33]  text-[#FAF7E6] font-black text-[10px] rounded-lg shadow transition disabled:opacity-50"
                                  >
                                    {isProcessing ? 'Processing...' : 'Process Payment'}
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-[#94A3B8]">Pending CFO</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
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
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-[#DFBD84]/15 bg-[#15203B]/85 text-[#FAF7E6] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFBD84]/15">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#15203B]/85 text-[#FAF7E6] text-[#FAF7E6] rounded-xl border border-[#DFBD84]/15">
                  <ShoppingBag className="w-5 h-5 text-[#FAF7E6]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#FAF7E6]">Issue Vendor Purchase Order</h3>
                  <p className="text-[11px] text-[#FAF7E6]">Procurement & Expense General Ledger Posting</p>
                </div>
              </div>
              <button onClick={() => setIsPoModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">Select Vendor</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                  required
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.vendor_name} ({v.tax_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">Requisition Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#FAF7E6] font-bold mb-1 uppercase text-[10px]">Total Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full glass-input bg-[#15203B]/85 text-[#FAF7E6] border border-[#DFBD84]/15 rounded-xl p-2.5 text-[#FAF7E6] font-mono font-bold"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#DFBD84]/15">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-4 py-2 bg-[#15203B]/85 text-[#FAF7E6] text-[#94A3B8] rounded-xl font-semibold hover:bg-[#15203B]/85 text-[#FAF7E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#C59E5F] via-[#DFBD84] to-[#C59E5F] hover:from-[#DFBD84] hover:to-[#EED29E] text-[#0B1120] font-black font-black rounded-xl shadow-lg transition disabled:opacity-50"
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
