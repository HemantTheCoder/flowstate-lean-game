import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export const ChapterIntroModal: React.FC = () => {
    const { flags, setFlag, chapter } = useGameStore();

    // Condition: Character created, but Intro NOT seen yet.
    // Also ensuring we are actually in Chapter 1 context (default).
    if (!flags['character_created'] || flags['chapter_intro_seen']) return null;

    const handleStart = () => {
        setFlag('chapter_intro_seen', true);
    };

    // Content could be dynamic based on 'chapter' number later.
    const content = {
        1: {
            title: "The Jam at Juniper Pier",
            subtitle: "Chapter 1: Flow & Friction",
            description: "You've been hired to fix a stalled pier construction project. The previous manager, Rao, believes in 'pushing' work to keep people busy. The result? Chaos.",
            objectives: [
                "Visualization: See the work.",
                "WIP Limits: Stop starting, start finishing.",
                "Flow: Move from Chaos to Order."
            ]
        }
    }[chapter] || { title: "Unknown Chapter", subtitle: "", description: "", objectives: [] };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md px-4 pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-100"
            >
                {/* Header Image/Banner Area */}
                <div className="bg-blue-600 h-32 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]"></div>
                    <h1 className="text-4xl md:text-5xl font-black text-white z-10 text-center px-4 tracking-tighter">
                        {content.subtitle.toUpperCase()}
                    </h1>
                </div>

                <div className="p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{content.title}</h2>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        {content.description}
                    </p>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Core Objectives</h3>
                        <ul className="space-y-3">
                            {content.objectives.map((obj, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    {obj}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full bg-black text-white text-xl font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        Start Chapter 🚀
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
