import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';

export const ChapterCompleteModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { funds, lpi, setChapter, setFlag, setTutorialStep } = useGameStore();

    // Play sound on open
    useEffect(() => {
        if (isOpen) {
            soundManager.playSFX('success', 0.8);
        }
    }, [isOpen]);

    const handleContinue = () => {
        // Start Chapter 2 (Day 6, Week 2)
        useGameStore.setState(s => ({
            chapter: 2,
            day: 6,
            week: 2,
            flags: {
                ...s.flags,
                chapter_intro_seen: false, // Trigger Ch2 Intro
                [`day_6_started`]: false
            }
        }));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 perspective-[1000px]">
                <motion.div
                    initial={{ scale: 0.5, rotateX: 45, opacity: 0 }}
                    animate={{ scale: 1, rotateX: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.3)] overflow-hidden border-4 border-green-400 relative"
                >
                    {/* Confetti / Celebration Header */}
                    <div className="bg-gradient-to-r from-green-400 to-emerald-600 h-40 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 animate-slide"></div>
                        <h1 className="text-5xl md:text-6xl font-black text-white z-10 drop-shadow-lg text-center tracking-tighter transform -rotate-2">
                            VICTORY! 🏆
                        </h1>
                        <p className="text-green-100 font-bold tracking-widest uppercase mt-2">Chapter 1 Complete</p>
                    </div>

                    <div className="p-8 md:p-12 text-center">
                        <p className="text-xl text-slate-600 mb-8 font-medium">
                            The site flow is stable. The Inspector is impressed. Your crew is happy.
                        </p>

                        {/* Report Card */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="text-slate-400 text-xs font-bold uppercase">Funds Earned</div>
                                <div className="text-3xl font-mono font-bold text-slate-800">${funds}</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="text-slate-400 text-xs font-bold uppercase">Team Morale</div>
                                <div className="text-3xl font-mono font-bold text-green-500">{lpi.teamMorale}%</div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left rounded-r-lg mb-8">
                            <h4 className="font-bold text-yellow-800 text-sm uppercase mb-1">Coming Up in Chapter 2...</h4>
                            <p className="text-yellow-700 text-sm">
                                "The Monsoon Drift". Can your system handle random variation? Learn about <strong>Buffers</strong> and <strong>Robustness</strong>.
                            </p>
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl font-black py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                            Start Chapter 2 ▶
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
