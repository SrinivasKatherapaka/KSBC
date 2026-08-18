import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { Bot, Send, User, Sparkles, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';

export const CustomerServicePage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! Welcome to KSBC Customer Support. How can I assist you with your accounts, commercial credit, or banking operations today?',
      suggestedTopics: ['Check Loan Eligibility', 'View Accounts Database', 'KSBC Interest Rates', 'Security Clearance Help']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  return (
    <div className="flex min-h-screen bg-[#FAF7E6] text-[#53627C]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">KSBC 24/7 AI Customer Service</h1>
              <p className="text-xs text-[#1E2748]/70">Powered by Gemini 2.5 Flash Banking Assistant</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Virtual Assistant Online</span>
            </div>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* Chat Container */}
          <div className="flex-1 glass-panel rounded-2xl border border-[#1E2748]/15 flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 border-b border-[#1E2748]/15 bg-[#FFFFFF]/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-700 to-amber-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">KSBC Virtual Representative</h3>
                  <p className="text-[10px] text-[#1E2748]/70 font-mono">Gemini 2.5 Flash Neural Support</p>
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xl p-4 rounded-2xl text-xs space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-[#FAF7E6] text-white rounded-tr-none shadow-lg border border-[#1E2748]/20'
                      : 'bg-rose-950/80 text-slate-200 rounded-tl-none border border-[#1E2748]/15 shadow-lg'
                  }`}>
                    <div className="flex items-center space-x-2 font-bold text-[10px] text-[#1E2748]/80 uppercase">
                      {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{m.sender === 'user' ? 'You' : 'KSBC AI Assistant'}</span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-line">{m.text}</p>

                    {/* Suggested Topic Pills */}
                    {m.suggestedTopics && m.suggestedTopics.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {m.suggestedTopics.map((topic, tIdx) => (
                          <button
                            key={tIdx}
                            onClick={() => handleSendMessage(topic)}
                            className="px-2.5 py-1 bg-[#E5DFCE] hover:bg-[#FAF7E6] text-amber-300 rounded-lg text-[10px] font-semibold transition border border-rose-700/50 flex items-center space-x-1"
                          >
                            <span>{topic}</span>
                            <ArrowRight className="w-3 h-3 text-amber-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-rose-950/80 p-4 rounded-2xl rounded-tl-none border border-[#1E2748]/15">
                    <LoadingSpinner text="KSBC AI is generating support response..." />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-[#1E2748]/15 bg-[#FFFFFF] flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about accounts, commercial loans, interest rates, or clearance..."
                className="flex-1 glass-input bg-[#1a030b] border border-[#1E2748]/15 text-xs rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="px-4 py-3 bg-[#1E2748] hover:bg-[#141C33] text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-1 disabled:opacity-50 border border-[#1E2748]/20"
              >
                <Send className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
export default CustomerServicePage;
