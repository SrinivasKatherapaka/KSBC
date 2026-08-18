import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { Bot, Send, User, Sparkles, HelpCircle, Shield, ArrowRight, Landmark, DollarSign, TrendingUp, Vault } from 'lucide-react';

export const CfoAiAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "**Welcome to the KSBC CFO Executive AI Intelligence Desk.**\n\nI am your real-time financial advisor powered server-side by **Gemini 2.5 Flash**. I maintain continuous telemetry across Vault Cash Reserves (Account 1010), Commercial Loan Portfolios (Account 1200), and Customer Deposit Liabilities (Account 2010).\n\nSelect a preset executive query below or enter a custom balance sheet question.",
      suggestedQueries: [
        'Give me the exact amount disbursed in figures',
        'What is our current Tier-1 Liquidity & Vault Reserve status?',
        'Run double-entry GL audit & balance check',
        'Show Commercial Credit Yield & Basel III Capital Adequacy'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    vaultReserves: 50000000,
    loanPortfolio: 2500000,
    capitalAdequacyRatio: '18.4%',
    netNpaRatio: '1.2%'
  });
  const chatEndRef = useRef(null);

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
      const res = await apiClient.post('/ai/cfo-chat', {
        message: query,
        history: updatedMessages.map(m => ({ sender: m.sender, text: m.text }))
      });

      if (res.data.success) {
        setMessages([
          ...updatedMessages,
          {
            sender: 'ai',
            text: res.data.message,
            suggestedQueries: res.data.suggestedQueries
          }
        ]);

        if (res.data.executiveMetrics) {
          setMetrics(prev => ({ ...prev, ...res.data.executiveMetrics }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'CFO Executive AI Service temporary unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#53627C]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#1E2748] font-heading flex items-center space-x-2">
                <span>KSBC Executive CFO AI Chatbot</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E2748]/10 text-[#1E2748] border border-[#1E2748]/15 font-mono font-bold">
                  CFO Clearance Only
                </span>
              </h1>
              <p className="text-xs text-[#1E2748]">Gemini 2.5 Flash Executive Balance Sheet & Liquidity Intelligence</p>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#FFFFFF] border border-[#1E2748]/15 rounded-xl text-xs text-[#1E2748] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#1E2748] animate-pulse"></span>
              <span>Gemini Telemetry Active</span>
            </div>
          </div>

          {/* Executive Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-[#1E2748]/10 bg-[#FFFFFF]/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#1E2748] flex items-center space-x-1">
                <Vault className="w-3.5 h-3.5 text-[#1E2748]" />
                <span>Vault Reserves (1010)</span>
              </span>
              <p className="text-lg font-mono font-extrabold text-[#1E2748]">
                ${Number(metrics.vaultReserves).toLocaleString()}
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-[#1E2748]/10 bg-[#FFFFFF]/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#1E2748] flex items-center space-x-1">
                <Landmark className="w-3.5 h-3.5 text-[#1E2748]" />
                <span>Loan Portfolio (1200)</span>
              </span>
              <p className="text-lg font-mono font-extrabold text-[#1E2748]">
                ${Number(metrics.loanPortfolio).toLocaleString()}
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-[#1E2748]/10 bg-[#FFFFFF]/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#1E2748] flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-[#58b388]" />
                <span>Capital Adequacy (CAR)</span>
              </span>
              <p className="text-lg font-mono font-extrabold text-[#58b388]">
                {metrics.capitalAdequacyRatio}
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-[#1E2748]/10 bg-[#FFFFFF]/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#1E2748] flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Net NPA Watchlist</span>
              </span>
              <p className="text-lg font-mono font-extrabold text-amber-400">
                {metrics.netNpaRatio}
              </p>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* Interactive Chat Container */}
          <div className="flex-1 glass-panel rounded-2xl border border-[#1E2748]/15 flex flex-col h-[550px] overflow-hidden bg-[#FFFFFF]/80 shadow-2xl">
            <div className="p-4 border-b border-[#1E2748]/10 bg-[#FFFFFF]/90 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1E2748] via-[#1E2748] to-[#1E2748] flex items-center justify-center shadow-lg p-0.5">
                  <div className="w-full h-full bg-[#FAF7E6] rounded-[14px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#1E2748]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E2748]">CFO Executive Intelligence AI</h3>
                  <p className="text-[10px] text-[#1E2748] font-mono">Gemini 2.5 Flash Financial Advisory Agent</p>
                </div>
              </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xl p-4 rounded-2xl text-xs space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-[#FFFFFF] text-[#1E2748] rounded-tr-none shadow-lg border border-[#1E2748]/15'
                      : 'bg-[#FAF7E6]/90 text-[#1E2748] rounded-tl-none border border-[#1E2748]/15 shadow-lg'
                  }`}>
                    <div className="flex items-center space-x-2 font-bold text-[10px] uppercase">
                      {m.sender === 'user' ? (
                        <span className="text-[#1E2748] flex items-center space-x-1">
                          <User className="w-3.5 h-3.5" />
                          <span>CFO Executive</span>
                        </span>
                      ) : (
                        <span className="text-[#1E2748] flex items-center space-x-1">
                          <Bot className="w-3.5 h-3.5 text-[#1E2748]" />
                          <span>KSBC AI Financial Advisor</span>
                        </span>
                      )}
                    </div>

                    <div className="leading-relaxed whitespace-pre-line text-xs font-sans">
                      {m.text}
                    </div>

                    {/* Suggested Query Buttons */}
                    {m.suggestedQueries && m.suggestedQueries.length > 0 && (
                      <div className="pt-3 flex flex-wrap gap-1.5 border-t border-[#1E2748]/10 mt-2">
                        {m.suggestedQueries.map((query, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSendMessage(query)}
                            className="px-2.5 py-1.5 bg-[#FFFFFF] hover:bg-[#FFFFFF] text-[#1E2748] rounded-xl text-[10px] font-semibold transition border border-[#1E2748]/15 flex items-center space-x-1.5 text-left"
                          >
                            <span>{query}</span>
                            <ArrowRight className="w-3 h-3 text-[#1E2748] flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#FAF7E6] p-4 rounded-2xl rounded-tl-none border border-[#1E2748]/15">
                    <LoadingSpinner text="Gemini AI analyzing financial telemetry & GL balances..." />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-[#1E2748]/10 bg-[#FFFFFF]/90 flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about Vault Reserves, Loan Portfolio Yield, CAR, or NPA provisions..."
                className="flex-1 glass-input bg-[#FAF7E6] border border-[#1E2748]/15 text-xs rounded-xl p-3 text-[#1E2748] focus:outline-none focus:ring-2 focus:ring-[#1E2748]"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="px-5 py-3 bg-[#1E2748] hover:bg-[#141C33] text-[#FAF7E6] font-black rounded-xl shadow-lg transition flex items-center justify-center space-x-1 disabled:opacity-50 border border-[#1E2748]/20"
              >
                <Send className="w-4 h-4 text-[#FAF7E6]" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CfoAiAssistantPage;
