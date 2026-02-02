import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    id: string;
    text: string;
    description?: string;
    type: 'safe' | 'risky' | 'neutral';
}

interface Props {
    isOpen: boolean;
    title: string;
    prompt: string;
    options: Option[];
    onSelect: (optionId: string) => void;
}

export const DecisionModal: React.FC<Props> = ({ isOpen, title, prompt, options, onSelect }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-50 w-full max-w-2xl rounded-3xl shadow-2xl border-4 border-slate-200 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-slate-800 p-6 text-white">
                        <h2 className="text-2xl font-black uppercase tracking-wider text-yellow-400 mb-2">⚡ Critical Decision</h2>
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <p className="text-xl text-slate-700 font-medium mb-8 leading-relaxed">
                            {prompt}
                        </p>

                        <div className="flex flex-col gap-4">
                            {options.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => onSelect(opt.id)}
                                    className={`
                                        group relative p-6 rounded-2xl border-l-8 text-left transition-all hover:-translate-y-1 hover:shadow-lg
                                        ${opt.type === 'risky' ? 'bg-red-50 border-red-500 hover:bg-red-100' : ''}
                                        ${opt.type === 'safe' ? 'bg-blue-50 border-blue-500 hover:bg-blue-100' : ''}
                                        ${opt.type === 'neutral' ? 'bg-slate-50 border-slate-400 hover:bg-slate-100' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-lg font-bold ${opt.type === 'risky' ? 'text-red-700' : opt.type === 'safe' ? 'text-blue-700' : 'text-slate-700'}`}>
                                            {opt.text}
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
                                            {opt.type === 'risky' ? '🔥' : opt.type === 'safe' ? '🛡️' : '➡️'}
                                        </span>
                                    </div>
                                    {opt.description && (
                                        <p className="text-sm text-slate-500 mt-1 font-medium">
                                            {opt.description}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
