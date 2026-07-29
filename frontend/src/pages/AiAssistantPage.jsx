import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import ErrorAlert from '../components/common/ErrorAlert';
import { apiClient } from '../api/client';
import { Bot, Send, Sparkles, User, Loader2, ArrowRight } from 'lucide-react';

export const AiAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "### Welcome to KSBC ERP Assistant\n\nI am your Enterprise Banking AI Agent powered server-side by **Gemini 2.5 Flash**. I have continuous access to our General Ledger balances, commercial loan portfolio metrics, and customer compliance logs.\n\nHow may I assist you today?",
      suggestedActions: [
        'What is our current Vault Cash Reserve balance?',
        'Summarize commercial credit exposure',
        'Check Basel III liquidity ratios'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (queryText = null) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/ai/assistant', { message: textToSend });
      if (res.data.success) {
        const aiMsg = {
          sender: 'assistant',
          text: res.data.aiResponse.answer,
          suggestedActions: res.data.aiResponse.suggestedActions || []
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to communicate with Gemini ERP Assistant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#002b36] text-[#93a1a1]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar />

        <main className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full min-h-0 overflow-hidden">
          <div className="mb-4">
            <h1 className="text-2xl font-extrabold text-white font-heading flex items-center space-x-2">
              <Bot className="w-6 h-6 text-blue-400" />
              <span>AI ERP Assistant</span>
            </h1>
            <p className="text-xs text-slate-400">Context-Aware Natural Language Interface powered by Gemini 2.5 Flash</p>
          </div>

          <ErrorAlert message={error} onClose={() => setError('')} />

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto glass-panel p-6 rounded-2xl border border-white/10 space-y-4 mb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl p-4 rounded-2xl text-xs space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-br-none'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Suggested Quick Queries:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleSend(action)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-[10px] font-semibold transition border border-slate-700"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs text-blue-400 p-3 bg-slate-900/60 rounded-xl w-fit">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini 2.5 Flash is generating banking response...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Gemini about loan portfolios, General Ledger entries, or compliance..."
              className="flex-1 bg-transparent px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
export default AiAssistantPage;
