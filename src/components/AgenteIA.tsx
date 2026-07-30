import React, { useState, useRef, useEffect } from "react";
import { AppContextType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, Bot, User, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

export const AgenteIA: React.FC<{ context: AppContextType }> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", parts: [{ text: "Olá! Sou seu assistente do Compra Esperta. Como posso te ajudar com o planejamento da casa hoje?" }] }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { role: "user", parts: [{ text: input.trim() }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Calculate context
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthHistory = context.history.filter(h => {
      const d = new Date(h.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const spentThisMonth = currentMonthHistory.reduce((acc, h) => acc + h.totalSpent, 0);
    const remaining = (context.settings.budget || 0) - spentThisMonth;
    
    const contextData = {
      budget: context.settings.budget || 0,
      spent: spentThisMonth,
      remaining: remaining,
      listItems: context.items.map(i => `${i.name} (${i.qty}${i.unit})`).join(', ')
    };

    try {
      // Exclude the initial greeting from history if we want, but sending it is fine.
      // The API expects 'user' or 'model'.
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages,
          contextData
        }),
      });

      const data = await response.json();
      
      if (data.error) {
         setMessages(prev => [...prev, { role: "model", parts: [{ text: "Desculpe, ocorreu um erro na IA: " + data.error }] }]);
      } else {
         setMessages(prev => [...prev, { role: "model", parts: [{ text: data.text }] }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", parts: [{ text: "Desculpe, ocorreu um erro de conexão." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-40 right-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm flex items-center justify-center z-40 transition-colors"
          >
            <Sparkles size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-[90] md:hidden"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-zinc-50 dark:bg-zinc-900 rounded-t-[28px] shadow-sm z-[100] flex flex-col md:w-[400px] md:h-[600px] md:bottom-24 md:left-auto md:right-6 md:rounded-3xl border border-zinc-200 dark:border-zinc-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 md:rounded-t-[28px] rounded-t-[28px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Agente Inteligente</h3>
                    <p className="text-[11px] text-slate-500">Planejamento & Dicas</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChevronDown size={24} className="md:hidden" />
                  <X size={24} className="hidden md:block" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user' 
                          ? 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-300' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-3 rounded-2xl text-[14px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-zinc-700 rounded-tl-sm shadow-sm'
                      }`}>
                        {msg.parts[0].text}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[85%] gap-2 flex-row">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-tl-sm shadow-sm flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 md:rounded-b-3xl pb-[calc(env(safe-area-inset-bottom)+16px)] md:pb-4">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2 relative"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte algo..."
                    className="flex-1 bg-slate-100 dark:bg-zinc-900 border-none rounded-full px-4 py-3 text-[14px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-zinc-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0"
                  >
                    <Send size={18} className="ml-1" />
                  </button>
                </form>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
