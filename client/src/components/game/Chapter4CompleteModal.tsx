import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Target, Brain, ArrowRight, ShieldCheck, Flame, Medal, Truck, BarChart3 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';
import { apiRequest } from '@/lib/queryClient';

interface Chapter4CompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
    quizScore: number;
}

export const Chapter4CompleteModal: React.FC<Chapter4CompleteModalProps> = ({
    isOpen,
    onContinue,
    quizScore
}) => {
    const lpi = useGameStore(s => s.lpi);
    const playerName = useGameStore(s => s.playerName);

    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (isOpen) {
            handleSubmitScore();
        } else {
            setSubmissionStatus('idle');
        }
    }, [isOpen]);

    const handleSubmitScore = async () => {
        if (submissionStatus === 'success' || submissionStatus === 'submitting') return;

        setSubmissionStatus('submitting');
        const calculatedTotalScore = lpi.flowEfficiency + Math.round((quizScore || 0) * 20);

        try {
            await apiRequest('POST', '/api/leaderboard', {
                playerName: playerName || 'Architect',
                chapter: 4,
                efficiency: lpi.flowEfficiency,
                ppc: lpi.ppc || 0,
                quizScore: quizScore || 0,
                totalScore: calculatedTotalScore,
            });
            setSubmissionStatus('success');
            soundManager.playSFX('success', 0.5);
        } catch (error) {
            console.error(error);
            setSubmissionStatus('error');
            soundManager.playSFX('warning', 0.5);
        }
    };

    if (!isOpen) return null;

    const getGrade = (score: number) => {
        if (score >= 90) return { letter: 'S', color: 'text-purple-500', phrase: 'Supply Chain Master' };
        if (score >= 70) return { letter: 'A', color: 'text-indigo-500', phrase: 'Lean Logistician' };
        if (score >= 50) return { letter: 'B', color: 'text-blue-500', phrase: 'Flow Optimizer' };
        return { letter: 'C', color: 'text-slate-500', phrase: 'Getting Started' };
    };

    const gradeInfo = getGrade(lpi.flowEfficiency);

    return (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md px-4 font-sans pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden border border-purple-500/30 flex flex-col"
            >
                {/* Header Banner - Purple Theme for Pull/JIT */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 h-40 flex flex-col items-center justify-center relative shadow-inner overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]"></div>

                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="bg-slate-900 p-3 rounded-2xl shadow-xl z-10 mb-2 border border-purple-500/50"
                    >
                        <Truck className="w-10 h-10 text-purple-500" />
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-black text-white z-10 tracking-tighter uppercase drop-shadow-md">
                        Episode 4 Cleared
                    </h1>
                </div>

                <div className="p-8 md:p-10 overflow-y-auto">
                    <div className="text-center mb-8">
                        <p className="text-lg text-slate-300 font-medium">
                            The Midfield Terminal is live! By implementing Pull systems and JIT delivery, you synchronized the supply chain with site demand, eliminating the overproduction waste that threatened the project.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        {/* Flow Efficiency Score Card */}
                        <div className="flex-1 bg-slate-800/80 rounded-2xl p-6 border border-purple-500/30 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                            <h3 className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-2 z-10">Flow Efficiency</h3>
                            <div className="flex items-end justify-center gap-2 z-10 mb-1">
                                <span className={`text-6xl font-black ${gradeInfo.color} drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]`}>{lpi.flowEfficiency}%</span>
                            </div>
                            <span className={`text-sm font-black uppercase tracking-widest ${gradeInfo.color} px-3 py-1 bg-purple-950/50 rounded-full z-10 shadow-md border border-purple-500/20`}>
                                {gradeInfo.phrase}
                            </span>
                        </div>

                        {/* Quiz Score Card */}
                        <div className="flex-1 bg-slate-800/80 rounded-2xl p-6 border border-blue-500/30 flex flex-col items-center justify-center shadow-inner">
                            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Knowledge Check</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-8 h-8 text-blue-500" />
                                <span className="text-4xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{quizScore * 20}%</span>
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
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 border border-purple-300 transform group-hover:rotate-12 transition-transform">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-purple-400 text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                    New Badge Unlocked <Flame className="w-4 h-4 text-pink-500" />
                                </h3>
                                <p className="text-white font-bold text-xl">The JIT Strategist</p>
                                <p className="text-slate-400 text-sm mt-1">Awarded for mastering Pull-based material flow.</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => window.location.href = '/leaderboard'}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-800/50 text-slate-300 font-bold hover:bg-slate-700/50 transition-colors shadow-md"
                            >
                                <Award className="w-4 h-4" /> Leaderboard
                            </button>
                            <button
                                onClick={handleSubmitScore}
                                disabled={submissionStatus === 'submitting' || submissionStatus === 'success'}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors font-bold shadow-md ${submissionStatus === 'success' ? 'bg-green-900/30 border-green-500/50 text-green-400' :
                                    submissionStatus === 'error' ? 'bg-red-900/30 border-red-500/50 text-red-400' :
                                        'border-purple-500/50 text-purple-500 hover:bg-purple-900/20'
                                    }`}
                            >
                                {submissionStatus === 'submitting' && <span className="animate-spin">⏳</span>}
                                {submissionStatus === 'success' ? 'Score Submitted!' :
                                    submissionStatus === 'error' ? 'Try Again' : 'Submit Score'}
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                soundManager.playSFX('success', 0.6);
                                onContinue();
                            }}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-lg py-5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider group"
                        >
                            Complete Episode 4
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
