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
            <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900/95 backdrop-blur-md w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col"
                >
                    <div className="bg-slate-900/50 p-3 sm:p-6 text-white border-b border-slate-700/50">
                        <h2 className="text-base sm:text-2xl font-black uppercase tracking-wider text-amber-500 mb-1 sm:mb-2" data-testid="text-decision-header">
                            Critical Decision
                        </h2>
                        <h3 className="text-sm sm:text-xl font-bold" data-testid="text-decision-title">{title}</h3>
                    </div>

                    <div className="p-4 sm:p-8 overflow-y-auto">
                        <p className="text-sm sm:text-xl text-slate-200 font-medium mb-4 sm:mb-8 leading-relaxed" data-testid="text-decision-prompt">
                            {prompt}
                        </p>

                        <div className="flex flex-col gap-3 sm:gap-4">
                            {options.map((opt) => (
                                <button
                                    key={opt.id}
                                    data-testid={`button-decision-${opt.id}`}
                                    onClick={() => onSelect(opt.id)}
                                    className={`
                                        group relative p-3 sm:p-6 rounded-2xl border-l-8 text-left transition-all hover:-translate-y-1 shadow-md hover:shadow-lg
                                        ${opt.type === 'risky' ? 'bg-red-900/20 border-red-500 hover:bg-red-900/40 text-red-200' : ''}
                                        ${opt.type === 'safe' ? 'bg-cyan-900/20 border-cyan-500 hover:bg-cyan-900/40 text-cyan-200' : ''}
                                        ${opt.type === 'neutral' ? 'bg-slate-800/50 border-slate-500 hover:bg-slate-800 text-slate-200' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <span className={`text-sm sm:text-lg font-bold ${opt.type === 'risky' ? 'text-red-400' : opt.type === 'safe' ? 'text-cyan-400' : 'text-slate-300'}`}>
                                            {opt.text}
                                        </span>
                                        <span className={`opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-xs sm:text-sm font-black uppercase tracking-widest shrink-0 ${opt.type === 'risky' ? 'text-red-500' : opt.type === 'safe' ? 'text-cyan-500' : 'text-slate-400'}`}>
                                            {opt.type === 'risky' ? 'RISK' : opt.type === 'safe' ? 'SAFE' : 'GO'}
                                        </span>
                                    </div>
                                    {opt.description && (
                                        <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2 font-medium">
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
