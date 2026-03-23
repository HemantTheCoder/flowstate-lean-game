import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, formatCurrency } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, MessageCircle } from 'lucide-react';
import soundManager from '@/lib/soundManager';

interface ChatMessage {
    id: string;
    sender: 'ai' | 'user';
    text: string | React.ReactNode;
}

export const LeanAiChat: React.FC = () => {
    const { funds, columns, day, currency, chapter } = useGameStore();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'welcome', sender: 'ai', text: "Welcome to the site! I'm your Lean AI Advisor. I'll watch your flow, but you can also ask me anything about Kanban, WIP, Efficiency (PPC), or your budget." }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Tracking warnings to avoid spam
    const warnedWipLimitRef = useRef(-1);
    const warnedStarvationRef = useRef(-1);
    const warnedLowFundsRef = useRef(-1);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    // ─── Passive Monitoring Logic ──────────────────────────────────────────
    useEffect(() => {
        if (!columns || columns.length === 0) return;

        const doingCol = columns.find(c => c.id === 'doing');
        const readyCol = columns.find(c => c.id === 'ready' || c.id === 'backlog');
        
        let shouldOpen = false;

        // 1. WIP Violation Check
        if (doingCol) {
            const limit = Math.max(doingCol.wipLimit || 0, 5); // Fallback to 5 if no limit set
            if (doingCol.tasks.length > limit && warnedWipLimitRef.current !== day) {
                warnedWipLimitRef.current = day;
                addAiMessage(
                    <span className="text-red-400">
                        <b>⚠️ Traffic Jam Detected!</b> You have {doingCol.tasks.length} tasks in progress, exceeding your capacity of {limit}. This splits your crew's focus and slows everything down. Try to move tasks to "Completed"!
                    </span>
                );
                shouldOpen = true;
            }
        }

        // 2. Starvation Check
        if (doingCol && doingCol.tasks.length === 0 && readyCol && readyCol.tasks.length > 0) {
            if (warnedStarvationRef.current !== day) {
                warnedStarvationRef.current = day;
                addAiMessage(
                    <span className="text-amber-400">
                        <b>⚡ Starvation Warning!</b> Your workers have nothing to do right now, but there are {readyCol.tasks.length} tasks ready. Pull a task into the "Doing" column to maintain flow!
                    </span>
                );
                shouldOpen = true; // Auto open on starvation
            }
        }

        // 3. Low Funds Check
        if (funds < 500000 && funds > 0) {
            if (warnedLowFundsRef.current !== day) {
                warnedLowFundsRef.current = day;
                addAiMessage(
                    <span className="text-red-500 font-bold">
                        🚨 Critical Alert: Your funds are extremely low ({formatCurrency(funds, currency)}). Stop starting new tasks (which costs money) and focus 100% on moving current tasks to "Completed" to earn revenue!
                    </span>
                );
                shouldOpen = true;
            }
        }

        if (shouldOpen && !isOpen) {
            setIsOpen(true);
            soundManager.playSFX('ding', 0.5); // Provide an audio cue
        }
    }, [columns, funds, day]);

    // ─── Active Chat Logic / NLP Simulation ──────────────────────────────
    const addAiMessage = (text: string | React.ReactNode) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text }]);
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = inputText.trim();
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
        setInputText('');
        setIsTyping(true);

        try {
            let formattedHistory = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: typeof m.text === 'string' ? m.text : 'System UI Alert' }] 
                }));

            // Google Gemini strictly requires the first history item to be from 'user'.
            // If the AI sent an unsolicited warning alert first, drop it from the training history.
            while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
                formattedHistory.shift();
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: formattedHistory,
                    gameState: {
                        day,
                        chapter,
                        funds,
                        columns: columns.map(c => ({ 
                             id: c.id, 
                             wipLimit: c.wipLimit, 
                             tasks: c.tasks.map(t => t.id) 
                        }))
                    }
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // Simple parser for Gemini's markdown (bolding and line breaks)
            const parseMarkdown = (text: string) => {
                return text.split('\n').map((line, i) => {
                    const parts = line.split('**');
                    return (
                        <p key={i} className="mb-2 last:mb-0">
                            {parts.map((part, j) => j % 2 === 1 ? <b key={j} className="text-white">{part}</b> : part)}
                        </p>
                    );
                });
            };

            addAiMessage(<div className="text-slate-300 leading-relaxed">{parseMarkdown(data.text)}</div>);
        } catch (error) {
            console.error("AI Error:", error);
            addAiMessage(<span className="text-red-400">⚠️ Connection to Lean AI lost. Please check your internet or API key.</span>);
        } finally {
            setIsTyping(false);
            soundManager.playSFX('ding', 0.5);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col items-end pointer-events-none">
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-slate-900 border border-slate-700/50 shadow-2xl rounded-2xl w-80 sm:w-96 overflow-hidden mb-4 pointer-events-auto flex flex-col"
                        style={{ height: '400px', maxHeight: '70vh' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-3 flex items-center justify-between border-b border-blue-500/30">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-500/20 p-1.5 rounded-lg border border-blue-400/30">
                                    <Sparkles className="w-4 h-4 text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm leading-none">Lean AI Advisor</h3>
                                    <p className="text-[10px] text-blue-300">Smart Monitoring Active</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about Kanban, PPC, WIP..."
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-colors pointer-events-auto border-2 ${
                    isOpen 
                        ? 'bg-slate-800 border-slate-600 text-slate-400' 
                        : 'bg-blue-600 border-blue-400 text-white animate-pulse'
                }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>
        </div>
    );
};
