import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Sparkles, User, Loader2, Minus } from 'lucide-react';

import { API_BASE } from '../api/client';

export default function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey Preetam! 👋 Ask me anything about your data — birthdays, notes, events, or preferences!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = data.detail || data.error || `Server error: ${res.status}`;
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errorMsg}` }]);
        return;
      }

      const reply = data.reply || 'Sorry, I got an empty response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t connect to the server. Please check if the backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-2xl shadow-primary/30 text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Sparkles size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center md:items-end md:justify-end md:p-6 pointer-events-none">
            {/* Backdrop for mobile */}
            <motion.div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm md:hidden pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="relative flex flex-col w-full md:w-[400px] h-[85vh] md:h-[600px] bg-white/70 dark:bg-surface-dark/70 border border-white/20 dark:border-white/10 shadow-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] pointer-events-auto overflow-hidden"
              style={{ backdropFilter: 'blur(32px) saturate(180%)' }}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Grabber for Mobile */}
              <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mt-3 md:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text dark:text-text-dark">Assistant</h3>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      <span className="text-[10px] font-medium text-text-muted dark:text-text-muted-dark uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-text-muted dark:text-text-muted-dark" />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className={`max-w-[85%] rounded-[1.8rem] px-5 py-3 text-sm font-medium shadow-sm break-words ${
                        msg.role === 'user' 
                          ? 'bg-primary text-white rounded-br-md self-end' 
                          : 'bg-white/10 text-white rounded-bl-md self-start border border-white/10'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {msg.content.split('\n').map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </motion.div>
                  </motion.div>
                ))}
                
                {loading && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-[1.25rem] rounded-tl-none px-4 py-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-6 bg-white/30 dark:bg-white/5 backdrop-blur-md border-t border-black/5 dark:border-white/5">
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Assistant..."
                    className="w-full bg-black/5 dark:bg-white/5 text-text dark:text-text-dark placeholder:text-text-muted/60 dark:placeholder:text-text-muted-dark/40 rounded-[1.5rem] pl-5 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[15px]"
                    disabled={loading}
                  />
                  <motion.button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="absolute right-1.5 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    <Send size={18} />
                  </motion.button>
                </div>
                <p className="mt-3 text-[10px] text-center text-text-muted dark:text-text-muted-dark opacity-50 uppercase tracking-widest font-medium">
                  he knows you 💀
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
