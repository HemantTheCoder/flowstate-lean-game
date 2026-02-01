import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { WEEK_1_SCHEDULE } from '@/data/chapters/chapter1';
import { motion, AnimatePresence } from 'framer-motion';

export const DayBriefingModal: React.FC = () => {
    const { day, flags, setFlag } = useGameStore();
    const dayConfig = WEEK_1_SCHEDULE.find(d => d.day === day);
    const dayKey = `day_${day}_briefing_seen`;
    const introKey = `chapter_intro_seen`;

    // Show only if:
    // 1. Chapter intro seen
    // 2. We have config for this day
    // 3. Briefing NOT seen yet for this day
    if (!flags[introKey] || !dayConfig || !dayConfig.briefing || flags[dayKey]) return null;

    const handleAcknowledge = () => {
        setFlag(dayKey, true);
    };

    return (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border-2 border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 text-white"
            >
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Day {day} Briefing</h2>
                        <h1 className="text-2xl font-black text-white">{dayConfig.title}</h1>
                    </div>
                    <div className="text-4xl">📋</div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Context</label>
                        <p className="text-slate-300 italic">"{dayConfig.description}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-800">
                            <label className="text-xs font-bold text-blue-300 uppercase mb-2 block">Objective</label>
                            <p className="font-bold text-white text-lg leading-tight">{dayConfig.briefing.objective}</p>
                        </div>
                        <div className="bg-orange-900/30 p-4 rounded-xl border border-orange-800">
                            <label className="text-xs font-bold text-orange-300 uppercase mb-2 block">Action Plan</label>
                            <p className="text-white text-sm font-medium">{dayConfig.briefing.action}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleAcknowledge}
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/50"
                >
                    Let's Work 🛠️
                </button>
            </motion.div>
        </div>
    );
};
