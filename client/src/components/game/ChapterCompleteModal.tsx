import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ChapterCompleteModal: React.FC<{ isOpen: boolean; onClose: () => void; onContinue: () => void }> = ({ isOpen, onClose, onContinue }) => {
    const { funds, lpi, dailyMetrics } = useGameStore();

    // Play sound on open
    useEffect(() => {
        if (isOpen) {
            soundManager.playSFX('success', 0.8);
        }
    }, [isOpen]);

    const handleContinue = () => {
        onClose();
        onContinue();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 perspective-[1000px] pointer-events-auto">
                    <motion.div
                        initial={{ scale: 0.5, rotateX: 45, opacity: 0 }}
                        animate={{ scale: 1, rotateX: 0, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0, rotateX: -45 }}
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

                        <div className="p-6 md:p-8 text-center max-h-[80vh] overflow-y-auto">
                            <p className="text-lg text-slate-600 mb-6 font-medium">
                                The site flow is stable. The Inspector is impressed. Your crew is happy.
                            </p>

                            {/* Metrics Graph */}
                            <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                                <h3 className="text-slate-800 font-bold text-sm uppercase mb-4 flex items-center justify-center gap-2">
                                    📈 Weekly Flow Performance
                                </h3>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dailyMetrics.length > 0 ? dailyMetrics : [{ day: 1, efficiency: 50, tasksDone: 0 }]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis 
                                                dataKey="day" 
                                                label={{ value: 'Work Day', position: 'insideBottom', offset: -5, fontSize: 10 }} 
                                                tick={{ fontSize: 10 }}
                                            />
                                            <YAxis 
                                                label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft', fontSize: 10 }} 
                                                tick={{ fontSize: 10 }}
                                                domain={[0, 100]}
                                            />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="efficiency" 
                                                name="Efficiency %"
                                                stroke="#3b82f6" 
                                                strokeWidth={3} 
                                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6 }}
                                                animationDuration={1500}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="tasksDone" 
                                                name="Throughput"
                                                stroke="#10b981" 
                                                strokeWidth={2} 
                                                strokeDasharray="5 5"
                                                dot={{ r: 3, fill: '#10b981' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-4 mt-3">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600">
                                        <div className="w-3 h-0.5 bg-blue-600"></div> Efficiency
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                                        <div className="w-3 h-0.5 bg-emerald-600 border-t border-dashed"></div> Throughput
                                    </div>
                                </div>
                            </div>

                            {/* Report Card */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Funds Earned</div>
                                    <div className="text-2xl font-mono font-bold text-slate-800">${funds}</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Team Morale</div>
                                    <div className="text-2xl font-mono font-bold text-green-500">{lpi.teamMorale}%</div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left rounded-r-lg mb-6">
                                <h4 className="font-bold text-yellow-800 text-sm uppercase mb-1">Coming Up in Chapter 2...</h4>
                                <p className="text-yellow-700 text-sm italic">
                                    "The Monsoon Drift". Can your system handle random variation? Learn about <strong>Buffers</strong> and <strong>Robustness</strong>.
                                </p>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-black py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                                Start Chapter 2 ▶
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
