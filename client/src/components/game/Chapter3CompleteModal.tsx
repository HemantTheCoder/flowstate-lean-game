import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Target, Brain, ArrowRight, ShieldCheck, Flame, Medal, Download } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { AnimatedCounter, PerformanceGrade } from '@/components/game/AnimatedCounter';
import soundManager from '@/lib/soundManager';
import { apiRequest } from '@/lib/queryClient';
import { exportChapterReport } from '@/lib/exportPDF';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

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
    const playerName = useGameStore(s => s.playerName);
    const dailyMetrics = (useGameStore(s => s.dailyMetrics) ?? []) as { day: number; efficiency: number }[];

    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (isOpen && depotScore === 0) {
            evaluate5S();
        }
    }, [isOpen]);

    const finalScore = depotScore;

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
        const calculatedTotalScore = finalScore + Math.round((quizScore || 0) * 20);

        try {
            await apiRequest('POST', '/api/leaderboard', {
                playerName: playerName || 'Architect',
                chapter: 3,
                efficiency: finalScore, // Store 5S score as efficiency for simplicity
                ppc: 0,
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

                    <div className="bg-slate-800/40 rounded-2xl border border-amber-500/20 p-4 mb-6" data-testid="chart-5s-radar">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" /> 5S Audit Breakdown
                        </h3>
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={(() => {
                                    const principles = ['Sort', 'Set in Order', 'Shine', 'Standardize', 'Sustain'];
                                    const days = [12, 13, 14, 15, 16];
                                    return principles.map((name, i) => {
                                        const metric = dailyMetrics.find(m => m.day === days[i]);
                                        return { principle: name, score: metric?.efficiency ?? 0, target: 80 };
                                    });
                                })()}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="principle" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} tickCount={5} />
                                    <Radar name="Target" dataKey="target" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.08} strokeDasharray="4 4" strokeWidth={1.5} />
                                    <Radar name="Your Score" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: '#22c55e', stroke: '#fff', strokeWidth: 1 }} />
                                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1 bg-slate-800/80 rounded-2xl p-6 border border-amber-500/30 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-2 z-10">5S Audit Score</h3>
                            <div className="flex items-end justify-center gap-2 z-10 mb-1">
                                <AnimatedCounter target={finalScore} className={`text-6xl font-black ${gradeInfo.color} drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]`} />
                            </div>
                            <PerformanceGrade score={finalScore} />
                            <span className={`text-sm font-black uppercase tracking-widest ${gradeInfo.color} px-3 py-1 bg-amber-950/50 rounded-full z-10 shadow-md border border-amber-500/20`}>
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

                    <div className={`p-4 rounded-xl mb-6 border ${finalScore >= 90 ? 'bg-green-900/20 border-green-500/30' : finalScore >= 70 ? 'bg-blue-900/20 border-blue-500/30' : finalScore >= 50 ? 'bg-amber-900/20 border-amber-500/30' : 'bg-red-900/20 border-red-500/30'}`} data-testid="text-performance-context">
                        <p className={`text-sm font-bold ${finalScore >= 90 ? 'text-green-300' : finalScore >= 70 ? 'text-blue-300' : finalScore >= 50 ? 'text-amber-300' : 'text-red-300'}`}>
                            {finalScore >= 90 ? "Outstanding! You've mastered the 5S principles. Your workspace is a model of efficiency."
                                : finalScore >= 70 ? "Good work. The workspace is well-organized, but there's room to optimize further."
                                : finalScore >= 50 ? "You're learning. Review the 5S concepts and focus on maintaining standards."
                                : "This area needs attention. Re-read the 5S lessons and practice organizing more thoroughly."}
                        </p>
                    </div>

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

                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => {
                                    const metricsData = (dailyMetrics as { day: number; efficiency: number; tasksCompletedToday?: number; potentialCapacity?: number; cumulativeEfficiency?: number; insight?: string }[]);
                                    const principles = ['Sort', 'Set in Order', 'Shine', 'Standardize', 'Sustain'];
                                    const days = [12, 13, 14, 15, 16];
                                    exportChapterReport({
                                        playerName: playerName || 'Architect',
                                        chapter: 3,
                                        chapterTitle: 'The Tangled Depot - 5S Workplace Organization',
                                        dailyMetrics: days.map((d, i) => {
                                            const metric = metricsData.find(m => m.day === d);
                                            return {
                                                day: d,
                                                efficiency: metric?.efficiency ?? 0,
                                                tasksCompletedToday: metric?.tasksCompletedToday ?? 0,
                                                potentialCapacity: metric?.potentialCapacity ?? 0,
                                                cumulativeEfficiency: metric?.cumulativeEfficiency ?? 0,
                                                insight: metric?.insight ?? `${principles[i]} phase`,
                                            };
                                        }),
                                        finalEfficiency: finalScore,
                                        quizScore: quizScore,
                                        quizTotal: 5,
                                        keyLearnings: [
                                            'Sort (Seiri) - Remove unnecessary items from the workspace. If in doubt, tag it and decide later.',
                                            'Set in Order (Seiton) - A place for everything and everything in its place. Minimize search time.',
                                            'Shine (Seiso) - Clean the workspace regularly. Cleaning is inspection - it reveals hidden problems.',
                                            'Standardize (Seiketsu) - Create visual standards so anyone can tell normal from abnormal at a glance.',
                                            'Sustain (Shitsuke) - Build habits and discipline. 5S is not a one-time event but a daily practice.',
                                            'Visual management makes problems visible immediately, reducing response time from hours to minutes.',
                                            'An organized workspace reduces waste from searching, waiting, and unnecessary motion.',
                                        ],
                                        badges: ['The 5S Auditor'],
                                    });
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-800/50 text-slate-300 font-bold hover:bg-slate-700/50 transition-colors shadow-md"
                                data-testid="button-export-report-ch3"
                            >
                                <Download className="w-4 h-4" /> Export Report
                            </button>
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
                                        'border-amber-500/50 text-amber-500 hover:bg-amber-900/20'
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
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg py-5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider group"
                        >
                            Return to Chapters
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
