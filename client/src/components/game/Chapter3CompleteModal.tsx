import React from 'react';
import { motion } from 'framer-motion';
import { Award, Target, Brain, ArrowRight, ShieldCheck, Flame, Medal } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';

interface Chapter3CompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
    quizScore: number;
}

export const Chapter3CompleteModal: React.FC<Chapter3CompleteModalProps> = ({
    isOpen,
    onContinue,
    quizScore
}) => {
    const depotScore = useGameStore(s => s.depotScore) || 0;
    const evaluate5S = useGameStore(s => s.evaluate5S);

    if (!isOpen) return null;

    // Ensure final score is calculated if not yet done
    const finalScore = depotScore > 0 ? depotScore : (evaluate5S() ?? 0);

    const getGrade = (score: number) => {
        if (score >= 90) return { letter: 'S', color: 'text-amber-500', phrase: 'Master Organizer' };
        if (score >= 70) return { letter: 'A', color: 'text-emerald-500', phrase: 'Clean & Efficient' };
        if (score >= 50) return { letter: 'B', color: 'text-blue-500', phrase: 'Making Progress' };
        return { letter: 'C', color: 'text-slate-500', phrase: 'Needs Improvement' };
    };

    const gradeInfo = getGrade(finalScore);

    return (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md px-4 font-sans pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden border border-amber-500/30 flex flex-col"
            >
                {/* Header Banner - Amber Theme for 5S */}
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 h-40 flex flex-col items-center justify-center relative shadow-inner overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]"></div>

                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="bg-slate-900 p-3 rounded-2xl shadow-xl z-10 mb-2 border border-amber-500/50"
                    >
                        <ShieldCheck className="w-10 h-10 text-amber-500" />
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-black text-white z-10 tracking-tighter uppercase drop-shadow-md">
                        Episode 3 Cleared
                    </h1>
                </div>

                <div className="p-8 md:p-10 overflow-y-auto">
                    <div className="text-center mb-8">
                        <p className="text-lg text-slate-300 font-medium">
                            You brought order to chaos. By applying the 5S principles, you transformed a cluttered depot into a visual, high-performance workspace.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        {/* 5S Score Card */}
                        <div className="flex-1 bg-slate-800/80 rounded-2xl p-6 border border-amber-500/30 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-2 z-10">5S Audit Score</h3>
                            <div className="flex items-end justify-center gap-2 z-10 mb-1">
                                <span className={`text-6xl font-black ${gradeInfo.color} drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]`}>{finalScore}%</span>
                            </div>
                            <span className={`text-sm font-black uppercase tracking-widest ${gradeInfo.color} px-3 py-1 bg-amber-950/50 rounded-full z-10 shadow-md border border-amber-500/20`}>
                                {gradeInfo.phrase}
                            </span>
                        </div>

                        {/* Quiz Score Card */}
                        <div className="flex-1 bg-slate-800/80 rounded-2xl p-6 border border-blue-500/30 flex flex-col items-center justify-center shadow-inner">
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Knowledge Check</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-8 h-8 text-blue-500" />
                                <span className="text-4xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{quizScore}%</span>
                            </div>
                            <p className="text-xs text-blue-500 font-bold text-center px-4 uppercase tracking-widest">Principles Understood</p>
                        </div>
                    </div>

                    {/* Unlocked Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 mb-8 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-300 transform group-hover:rotate-12 transition-transform">
                                <Medal className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-amber-400 text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                    New Badge Unlocked <Flame className="w-4 h-4 text-orange-500" />
                                </h3>
                                <p className="text-white font-bold text-xl">The 5S Auditor</p>
                                <p className="text-slate-400 text-sm mt-1">Awarded for mastering Workplace Organization.</p>
                            </div>
                        </div>
                    </motion.div>

                    <button
                        onClick={() => {
                            soundManager.playSFX('success', 0.6);
                            onContinue();
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg py-5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider group"
                    >
                        Return to Chapters
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
