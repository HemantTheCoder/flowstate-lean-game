import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    completedTasks: number;
}

export const DailySummary: React.FC<Props> = ({ isOpen, onClose, completedTasks }) => {
    if (!isOpen) return null;

    const { day, funds } = useGameStore();
    const efficiency = Math.min(100, Math.floor(completedTasks * 25)); // Mock satisfaction logic

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-200"
            >
                <div className="bg-blue-600 p-6 text-center">
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider">Day {day} Complete</h2>
                    <p className="text-blue-100 font-medium mt-1">Site Report</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div className="text-slate-500 font-bold">Tasks Finished</div>
                        <div className="text-4xl font-black text-slate-800">{completedTasks}</div>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div className="text-slate-500 font-bold">Flow Efficiency</div>
                        <div className={`text-4xl font-black ${efficiency > 50 ? 'text-green-500' : 'text-orange-500'}`}>
                            {efficiency}%
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 italic border-l-4 border-blue-400">
                        "Lean Construction isn't just about speed. It's about consistency. A steady flow beats a rushed chaos."
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform"
                    >
                        Start Day {day + 1} ☀️
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
