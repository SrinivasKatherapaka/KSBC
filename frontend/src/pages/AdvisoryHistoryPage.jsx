import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { History, Trash2, Sparkles, FileText, Calendar } from 'lucide-react';

export const AdvisoryHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/ai/history');
      if (res.data.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      setError('Failed to fetch AI advisory history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/ai/history/${id}`);
      fetchHistory();
    } catch (err) {
      setError('Failed to delete session log');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-[#FAF7E6] text-[#94A3B8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-heading">AI Advisory Audit History</h1>
            <p className="text-xs text-slate-400">Historical Log of Credit Underwriting Evaluations, Compliance Scans & Advisory Reports</p>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {loading ? (
            <LoadingSpinner text="Retrieving AI session audit history..." />
          ) : (
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="glass-panel p-8 text-center text-slate-500 text-xs rounded-2xl border border-white/10">
                  No AI advisory sessions logged yet. Trigger a loan risk assessment or OCR scan to populate history.
                </div>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white uppercase tracking-wider">{s.session_type.replace('_', ' ')}</span>
                          <p className="text-[10px] text-slate-400">{new Date(s.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-lg transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl text-xs space-y-1">
                      <span className="text-slate-400 font-bold block text-[10px]">Prompt Context:</span>
                      <p className="text-slate-300 font-sans">{s.prompt_context}</p>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-xl text-xs font-mono overflow-x-auto text-emerald-400 border border-slate-800">
                      <pre className="text-[11px]">{JSON.stringify(s.ai_response, null, 2)}</pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default AdvisoryHistoryPage;
