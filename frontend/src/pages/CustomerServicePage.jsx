import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { Bot, Send, User, Sparkles, HelpCircle, MessageSquare, ArrowRight, Search, CreditCard, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';

export const CustomerServicePage = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'eligibility' | 'faq'
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! Welcome to KSBC Customer Support. How can I assist you with your accounts, commercial credit, or banking operations today?',
      suggestedTopics: ['Check Loan Eligibility for KSBC-SAV-10049281', 'View Accounts Database', 'KSBC Interest Rates', 'Security Clearance Help']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  // Eligibility Lookup Tool State
  const [searchAccountNo, setSearchAccountNo] = useState('KSBC-SAV-10049281');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [searchingEligibility, setSearchingEligibility] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/ai/customer-service/chat', {
        message: query,
        history: updatedMessages.map(m => ({ sender: m.sender, text: m.text }))
      });

      if (res.data.success) {
        setMessages([
          ...updatedMessages,
          {
            sender: 'ai',
            text: res.data.message,
            suggestedTopics: res.data.suggestedTopics
          }
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'AI Assistant service unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleRunEligibilityLookup = async (e) => {
    e.preventDefault();
    if (!searchAccountNo.trim()) return;
    setSearchingEligibility(true);
    setError('');

    try {
      const res = await apiClient.post('/ai/customer-service/chat', {
        message: `Check loan eligibility for account ${searchAccountNo}`,
        history: []
      });

      if (res.data.success) {
        setEligibilityResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to lookup account eligibility');
    } finally {
      setSearchingEligibility(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#1E2748]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1E2748] font-heading">24/7 AI Customer Support & Eligibility Portal</h1>
              <p className="text-xs text-[#1E2748]">Powered by Gemini 2.5 Flash Banking Representative Engine</p>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#58b388]/20 border border-[#58b388]/40 rounded-full text-xs text-[#1E2748] font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#58b388] animate-pulse"></span>
              <span>Virtual Support Agent Online</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-3 border-b border-[#1E2748]/15 pb-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                activeTab === 'chat'
                  ? 'bg-[#1E2748] text-[#FAF7E6] border-[#1E2748] shadow-md font-extrabold'
                  : 'bg-[#F3EEDC] text-[#1E2748] border-[#1E2748]/15 hover:bg-[#EBE4CD]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#C59E5F]" />
              <span>Live Interactive AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('eligibility')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                activeTab === 'eligibility'
                  ? 'bg-[#1E2748] text-[#FAF7E6] border-[#1E2748] shadow-md font-extrabold'
                  : 'bg-[#F3EEDC] text-[#1E2748] border-[#1E2748]/15 hover:bg-[#EBE4CD]'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#C59E5F]" />
              <span>Loan Eligibility Lookup Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                activeTab === 'faq'
                  ? 'bg-[#1E2748] text-[#FAF7E6] border-[#1E2748] shadow-md font-extrabold'
                  : 'bg-[#F3EEDC] text-[#1E2748] border-[#1E2748]/15 hover:bg-[#EBE4CD]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#C59E5F]" />
              <span>Banking Knowledge Base & FAQ</span>
            </button>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* TAB 1: LIVE INTERACTIVE AI CHATBOT */}
          {activeTab === 'chat' && (
            <div className="flex-1 glass-panel rounded-2xl border border-[#1E2748]/15 flex flex-col h-[620px] overflow-hidden shadow-2xl bg-[#F3EEDC]">
              {/* Top Bar */}
              <div className="p-4 border-b border-[#1E2748]/15 bg-[#EBE4CD] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1E2748] flex items-center justify-center shadow-lg border border-[#C59E5F]/50">
                    <Bot className="w-5 h-5 text-[#C59E5F]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1E2748]">KSBC Virtual Representative</h3>
                    <p className="text-[10px] text-[#1E2748] font-mono">Gemini 2.5 Flash Neural Support</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#FAF7E6] px-2.5 py-1 rounded-full border border-[#1E2748]/15 text-[#1E2748]">
                  24/7 Multi-Role Session Active
                </span>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7E6]/70">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xl p-4 rounded-2xl text-xs space-y-2.5 shadow-md ${
                      m.sender === 'user'
                        ? 'bg-[#1E2748] text-[#FAF7E6] rounded-tr-none border border-[#1E2748]'
                        : 'bg-[#F3EEDC] text-[#1E2748] rounded-tl-none border border-[#1E2748]/15'
                    }`}>
                      <div className="flex items-center space-x-2 font-bold text-[10px] uppercase">
                        {m.sender === 'user' ? (
                          <User className="w-3.5 h-3.5 text-[#C59E5F]" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-[#1E2748]" />
                        )}
                        <span className={m.sender === 'user' ? 'text-[#C59E5F]' : 'text-[#1E2748]'}>
                          {m.sender === 'user' ? 'You' : 'KSBC AI Assistant'}
                        </span>
                      </div>

                      <p className="leading-relaxed whitespace-pre-line font-sans">{m.text}</p>

                      {/* Suggested Topics Pills */}
                      {m.suggestedTopics && m.suggestedTopics.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#1E2748]/10">
                          {m.suggestedTopics.map((topic, tIdx) => (
                            <button
                              key={tIdx}
                              onClick={() => handleSendMessage(topic)}
                              className="px-2.5 py-1 bg-[#FAF7E6] hover:bg-[#EBE4CD] text-[#1E2748] font-bold rounded-lg text-[10px] transition border border-[#1E2748]/15 flex items-center space-x-1 shadow-sm"
                            >
                              <span>{topic}</span>
                              <ArrowRight className="w-3 h-3 text-[#C59E5F]" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#F3EEDC] p-4 rounded-2xl rounded-tl-none border border-[#1E2748]/15">
                      <LoadingSpinner text="KSBC AI is evaluating query and backend records..." />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-[#1E2748]/15 bg-[#EBE4CD] flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about accounts, commercial loans, interest rates, or account numbers..."
                  className="flex-1 bg-[#FAF7E6] border border-[#1E2748]/20 text-xs rounded-xl p-3 text-[#1E2748] font-medium focus:outline-none focus:ring-2 focus:ring-[#1E2748] shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="px-4 py-3 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-1 disabled:opacity-50 border border-[#1E2748]"
                >
                  <Send className="w-4 h-4 text-[#C59E5F]" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: LOAN ELIGIBILITY LOOKUP ENGINE */}
          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-[#1E2748]/15 bg-[#F3EEDC] shadow-xl space-y-5">
                <h3 className="text-sm font-bold text-[#1E2748] flex items-center space-x-2 pb-3 border-b border-[#1E2748]/15">
                  <CreditCard className="w-4 h-4 text-[#C59E5F]" />
                  <span>Account Number Credit Capacity & Loan Pre-Approval Engine</span>
                </h3>

                <form onSubmit={handleRunEligibilityLookup} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={searchAccountNo}
                    onChange={(e) => setSearchAccountNo(e.target.value)}
                    placeholder="Enter Account Number (e.g. KSBC-SAV-10049281 or KSBC-SAV-10107424)"
                    className="flex-1 bg-[#FAF7E6] border border-[#1E2748]/20 text-xs rounded-xl p-3 text-[#1E2748] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={searchingEligibility}
                    className="px-6 py-3 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Search className="w-4 h-4 text-[#C59E5F]" />
                    <span>{searchingEligibility ? 'Searching Records...' : 'Check Pre-Approval'}</span>
                  </button>
                </form>
              </div>

              {eligibilityResult && (
                <div className="glass-panel p-6 rounded-2xl border border-[#1E2748]/15 bg-[#F3EEDC] shadow-2xl space-y-4">
                  <div className="flex items-center space-x-2 text-[#58b388] font-extrabold text-sm pb-2 border-b border-[#1E2748]/15">
                    <CheckCircle2 className="w-5 h-5 text-[#58b388]" />
                    <span>AI Pre-Approval Credit Evaluation Report</span>
                  </div>

                  <div className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 space-y-2 text-xs font-mono">
                    <p className="whitespace-pre-line leading-relaxed text-[#1E2748]">{eligibilityResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KNOWLEDGE BASE & FAQ */}
          {activeTab === 'faq' && (
            <div className="glass-panel p-6 rounded-2xl border border-[#1E2748]/15 bg-[#F3EEDC] shadow-xl space-y-5">
              <h3 className="text-sm font-bold text-[#1E2748] flex items-center space-x-2 pb-3 border-b border-[#1E2748]/15">
                <BookOpen className="w-4 h-4 text-[#C59E5F]" />
                <span>Frequently Asked Questions & Quick Prompts</span>
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  {
                    q: 'How does KSBC calculate maximum pre-approved loan limits?',
                    a: 'Pre-approved loan limits are calculated automatically based on 45% of verified customer deposit balances, credit rating, and Debt-to-Income (DTI) thresholds.'
                  },
                  {
                    q: 'What commercial loan interest rates are offered by KSBC?',
                    a: 'KSBC commercial loan rates start at 4.85% APR for low-risk private savings accounts up to 6.85% APR for large commercial real estate acquisitions.'
                  },
                  {
                    q: 'How are manual entry records saved and synced?',
                    a: 'All registered personnel accounts, customers, loans, and purchase orders are logged to a Write-Ahead Logging (WAL) engine and persisted across backend restarts.'
                  },
                  {
                    q: 'What security clearance is required to disburse loan funds?',
                    a: 'Loan fund disbursements require CFO Executive clearance (cfo@banking.com) or System Administrator credentials.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#FAF7E6] rounded-xl border border-[#1E2748]/15 space-y-1.5">
                    <span className="font-extrabold text-[#1E2748] block text-sm">{item.q}</span>
                    <p className="text-[#1E2748] leading-relaxed">{item.a}</p>
                    <button
                      onClick={() => { setActiveTab('chat'); handleSendMessage(item.q); }}
                      className="mt-2 text-[10px] font-bold text-[#1E2748] hover:underline flex items-center space-x-1"
                    >
                      <span>Ask AI Assistant about this</span>
                      <ArrowRight className="w-3 h-3 text-[#C59E5F]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default CustomerServicePage;
