import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';

export const DocumentOcrUploader = ({ customerId, onVerificationComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setError('Please select a document or image file first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert file to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        const res = await apiClient.post('/compliance/verify-doc', {
          customerId,
          documentName: file.name,
          documentBase64: base64Data
        });

        if (res.data.success) {
          setResult(res.data.ocrResult);
          if (onVerificationComplete) onVerificationComplete(res.data);
        }
      };
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Compliance verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#1E2748]">Gemini Multi-Modal OCR & Compliance Screener</h3>
          <p className="text-xs text-slate-400">Automated identity verification, balance sheet parsing & Sanctions/PEP screening</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-900/40 transition">
        <UploadCloud className="w-10 h-10 mx-auto text-blue-400 mb-2 animate-bounce" />
        <p className="text-xs font-semibold text-slate-300">Upload Identity Card, Balance Sheet PDF or Financial Statement Image</p>
        <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, WEBP & Documents</p>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
          id="doc-upload-input"
        />
        <label
          htmlFor="doc-upload-input"
          className="inline-block mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl cursor-pointer transition border border-slate-700"
        >
          {file ? `Selected: ${file.name}` : 'Browse Local Files'}
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleUploadAndAnalyze}
          disabled={!file || loading}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-[#1E2748] text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Document via Gemini...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Run Automated OCR & PEP Check</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-5 bg-slate-900/80 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Verification Result</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              result.verificationStatus === 'VERIFIED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {result.verificationStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px]">DOCUMENT TYPE</span>
              <span className="font-mono text-[#1E2748] font-semibold">{result.documentType}</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px]">PEP / SANCTIONS STATUS</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {result.pepScreening?.isPep ? '⚠️ PEP Flagged' : '✓ Clean (0 Matches)'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-300">
            <span className="text-slate-400 font-bold block mb-1">OCR Analysis Notes:</span>
            <p>{result.ocrNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocumentOcrUploader;
