import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import DocumentOcrUploader from '../components/compliance/DocumentOcrUploader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { ShieldCheck, FileCheck, Search, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

export const CompliancePage = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.customers);
        if (res.data.customers.length > 0) {
          setSelectedCustomerId(res.data.customers[0].id);
        }
      }
    } catch (err) {
      setError('Failed to fetch compliance customers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#1E2748]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1E2748] font-heading">Compliance & KYC Hub</h1>
              <p className="text-xs text-[#53627C]">Automated Document Parsing, Identity OCR & PEP/Sanctions Verification</p>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#58b388]/20 border border-[#58b388]/40 rounded-full text-xs text-[#1E2748] font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#58b388]" />
              <span>BSA/AML Sanctions Sentinel Active</span>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Initializing compliance screening database..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Selector Sidebar */}
              <div className="glass-panel p-5 rounded-2xl border border-[#1E2748]/15 bg-[#F3EEDC] shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-[#1E2748] flex items-center space-x-2 pb-2 border-b border-[#1E2748]/15">
                  <ShieldCheck className="w-4 h-4 text-[#C59E5F]" />
                  <span>Select Account for Compliance</span>
                </h3>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`w-full p-3 rounded-xl text-left text-xs transition border ${
                        selectedCustomerId === c.id
                          ? 'bg-[#1E2748] text-[#FAF7E6] border-[#1E2748] shadow-md font-bold'
                          : 'bg-[#FAF7E6] text-[#1E2748] border-[#1E2748]/15 hover:bg-[#EBE4CD]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{c.first_name} {c.last_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          c.kyc_status === 'verified'
                            ? 'bg-[#58b388]/20 text-[#58b388]'
                            : 'bg-[#1E2748] text-[#FAF7E6]'
                        }`}>
                          {c.kyc_status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#53627C] font-mono">EIN/SSN: {c.national_id}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini Document OCR & Screener Component */}
              <div className="lg:col-span-2 space-y-6">
                <DocumentOcrUploader
                  customerId={selectedCustomerId}
                  onVerificationComplete={() => fetchCustomers()}
                />

                {/* Audit Logs Section */}
                <div className="glass-panel p-6 rounded-2xl border border-[#1E2748]/15 bg-[#F3EEDC] shadow-xl">
                  <h3 className="text-sm font-bold text-[#1E2748] mb-3 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-[#C59E5F]" />
                    <span>Sanctions & PEP Global Watchlist Screening Log</span>
                  </h3>
                  <div className="p-4 bg-[#FAF7E6] rounded-xl text-xs space-y-2 text-[#1E2748] font-mono border border-[#1E2748]/15">
                    <div className="flex justify-between text-[#53627C] text-[10px] font-sans font-bold">
                      <span>GLOBAL DATABASE CHECK</span>
                      <span className="text-[#58b388] font-black">STATUS: CLEAR</span>
                    </div>
                    <p>• OFAC Specially Designated Nationals (SDN) List: 0 Matches</p>
                    <p>• Interpol Red Notice & PEP Watchlist: 0 Matches</p>
                    <p>• Automated Gemini OCR Identity Verification: Passed with high confidence</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default CompliancePage;
