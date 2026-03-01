import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, XCircle, AlertTriangle, Award, TrendingUp, Users, Target, Lightbulb, BookOpen, ChevronDown, ChevronUp, Download, Trophy } from 'lucide-react';
import { exportChapterReport } from '@/lib/exportPDF';

interface Chapter2CompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
    quizScore?: number;
}

const DAY_INSIGHTS: Record<number, { title: string; concept: string; lesson: string; example: string }> = {
    6: {
        title: "The Planning Room",
        concept: "Should / Can / Will",
        lesson: "You learned the three levels of planning: what SHOULD happen, what CAN happen, and what WILL happen.",
        example: "Real LPS projects use weekly planning meetings where foremen review the Lookahead and commit only to Sound tasks."
    },
    7: {
        title: "Constraint Discovery",
        concept: "Constraint Analysis",
        lesson: "You identified hidden blockers that would have caused failures during execution.",
        example: "On real sites, 30-50% of planned tasks have at least one constraint. Finding them early prevents costly delays."
    },
    8: {
        title: "Making Work Ready",
        concept: "Make Ready Process",
        lesson: "You actively removed constraints to turn blocked tasks into Sound activities.",
        example: "Make Ready meetings happen weekly. Planners call suppliers, coordinate crews, and chase approvals to ensure tasks are executable."
    },
    9: {
        title: "The Weekly Promise",
        concept: "Reliable Commitments",
        lesson: "You made a commitment based on what you CAN do, not just what you SHOULD do.",
        example: "Top-performing sites protect their commitments. When a client asks for extra work, they negotiate timelines rather than overcommitting."
    },
    10: {
        title: "Execution Day",
        concept: "Promise Keeping",
        lesson: "You executed your plan. Sound tasks flow smoothly; unready tasks create chaos.",
        example: "When Make Ready is done well, crews spend 70%+ of their time on value-adding work instead of searching, waiting, or improvising."
    },
    11: {
        title: "PPC Review",
        concept: "Percent Plan Complete",
        lesson: "Your PPC was measured - the ratio of promises kept to promises made.",
        example: "World-class construction projects maintain 80%+ PPC. Every broken promise is analyzed in a 'Reasons Analysis' to prevent repeat failures."
    }
};

export const Chapter2CompleteModal: React.FC<Chapter2CompleteModalProps> = ({ isOpen, onClose, onContinue, quizScore }) => {
    const { funds, lpi, weeklyPlan, columns, flags, playerName, dailyMetrics } = useGameStore();
    const [animatedPPC, setAnimatedPPC] = useState(0);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    const doneTasks = columns.find(c => c.id === 'done')?.tasks || [];
    const completedPromises = doneTasks.filter(t => weeklyPlan.includes(t.id) || weeklyPlan.includes(t.originalId || '')).length;
    const totalPromises = weeklyPlan.length;
    const ppc = totalPromises > 0 ? Math.round((completedPromises / totalPromises) * 100) : 0;

    const ppcLevel = ppc >= 80 ? 'excellent' : ppc >= 50 ? 'average' : 'poor';
    const overcommitted = flags['overcommitment_accepted'];

    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (isOpen) {
            soundManager.playSFX(ppcLevel === 'excellent' ? 'success' : 'complete', 0.8);

            // Auto-submit score to update Career Stats & Leaderboard
            handleSubmitScore();

            let current = 0;
            const interval = setInterval(() => {
                current += 2;
                if (current >= ppc) {
                    setAnimatedPPC(ppc);
                    clearInterval(interval);
                } else {
                    setAnimatedPPC(current);
                }
            }, 30);
            return () => clearInterval(interval);
        } else {
            setSubmissionStatus('idle');
        }
    }, [isOpen, ppc, ppcLevel]);

    const handleSubmitScore = async () => {
        if (submissionStatus === 'success' || submissionStatus === 'submitting') return;

        setSubmissionStatus('submitting');
        const totalScore = Math.round(ppc * 0.5 + (lpi.flowEfficiency || 0) * 0.3 + (quizScore || 0) * 8);

        try {
            await apiRequest('POST', '/api/leaderboard', {
                playerName: playerName || 'Architect',
                chapter: 2,
                efficiency: lpi.flowEfficiency || 0,
                ppc,
                quizScore: quizScore || 0,
                totalScore,
            });
            setSubmissionStatus('success');
            soundManager.playSFX('success', 0.5);
        } catch (error) {
            console.error(error);
            setSubmissionStatus('error');
            soundManager.playSFX('warning', 0.5);
        }
    };

    const unlockBadge = useGameStore(s => s.unlockBadge);

    useEffect(() => {
        if (isOpen) {
            // Basic completion badge
            unlockBadge('reliable_promise');

            // Perfect Week badge (100% PPC)
            if (ppc === 100) {
                unlockBadge('perfect_week');
            }
        }
    }, [isOpen, ppc, unlockBadge]);

    const handleContinue = () => {
        onClose();
        onContinue();
    };

    const getPPCColor = () => {
        if (ppc >= 80) return 'text-green-500';
        if (ppc >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getPPCBg = () => {
        if (ppc >= 80) return 'from-green-400 to-emerald-600';
        if (ppc >= 50) return 'from-yellow-400 to-orange-500';
        return 'from-red-400 to-rose-600';
    };

    const getPerformanceTier = () => {
        if (ppc >= 90 && !overcommitted) return { title: "Master Planner", desc: "You promised carefully and delivered reliably. The crew trusts your word completely." };
        if (ppc >= 80) return { title: "Reliable Leader", desc: "Strong planning with solid execution. Your team can depend on your commitments." };
        if (ppc >= 60) return { title: "Growing Planner", desc: "Decent reliability with room for improvement. Focus on better constraint analysis." };
        return { title: "Learning Planner", desc: "Overcommitment hurt your reliability. Next time, promise less and deliver more." };
    };

    const tier = getPerformanceTier();

    const fragileTasks = doneTasks.filter(t => t.fragile);
    const failedFragile = columns.flatMap(c => c.tasks).filter(t => t.failed);
    const unfinishedPromises = weeklyPlan.length - completedPromises;

    const failureReasons: { reason: string; count: number; icon: React.ReactNode }[] = [];
    if (failedFragile.length > 0) failureReasons.push({ reason: 'Fragile tasks failed (unresolved constraints)', count: failedFragile.length, icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> });
    if (overcommitted) failureReasons.push({ reason: 'Unplanned work added under pressure', count: 1, icon: <XCircle className="w-4 h-4 text-red-500" /> });
    if (unfinishedPromises > 0 && !overcommitted && failedFragile.length === 0) failureReasons.push({ reason: 'Not enough time to complete all promised tasks', count: unfinishedPromises, icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> });

    const constraintsRemoved = flags['constraints_discovered'] ? true : false;

    const badges: { name: string; icon: React.ReactNode; color: string }[] = [];
    if (ppc >= 80) badges.push({ name: 'Promise Keeper', icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-500' });
    if (!overcommitted) badges.push({ name: 'Reliable Planner', icon: <Target className="w-6 h-6" />, color: 'bg-blue-500' });
    if (constraintsRemoved && failedFragile.length === 0) badges.push({ name: 'Constraint Crusher', icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-orange-500' });
    if (ppc === 100) badges.push({ name: 'Perfect Week', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-500' });
    if (quizScore !== undefined && quizScore >= 5) badges.push({ name: 'LPS Scholar', icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-500' });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md px-4 pointer-events-auto">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative"
                    >
                        <div className={`bg-gradient-to-r ${getPPCBg()} h-32 flex flex-col items-center justify-center relative overflow-hidden`}>
                            <h1 className="text-4xl font-black text-white z-10 drop-shadow-lg text-center">
                                Chapter 2 Complete
                            </h1>
                            <p className="text-white/80 font-bold tracking-widest uppercase mt-1">{tier.title}</p>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                            <div className="flex flex-col items-center">
                                <div className="relative w-44 h-44">
                                    <svg className="w-44 h-44 transform -rotate-90">
                                        <circle cx="88" cy="88" r="74" stroke="#e5e7eb" strokeWidth="14" fill="none" />
                                        <motion.circle
                                            cx="88" cy="88" r="74"
                                            stroke={ppc >= 80 ? '#22c55e' : ppc >= 50 ? '#eab308' : '#ef4444'}
                                            strokeWidth="14" fill="none" strokeLinecap="round"
                                            strokeDasharray={465}
                                            initial={{ strokeDashoffset: 465 }}
                                            animate={{ strokeDashoffset: 465 - (465 * animatedPPC / 100) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-4xl font-black ${getPPCColor()}`}>{animatedPPC}%</span>
                                        <span className="text-slate-400 text-sm font-bold uppercase">PPC</span>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-center mt-2">
                                    You promised <strong>{totalPromises}</strong> tasks and completed <strong>{completedPromises}</strong>.
                                </p>
                                <p className="text-slate-400 text-sm text-center mt-1 italic">{tier.desc}</p>
                            </div>

                            <div className={`p-4 rounded-xl ${ppcLevel === 'excellent' ? 'bg-green-900/20 border border-green-500/30' :
                                ppcLevel === 'average' ? 'bg-yellow-900/20 border border-yellow-500/30' :
                                    'bg-red-900/20 border border-red-500/30'
                                }`}>
                                {ppcLevel === 'excellent' && (
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-green-400">Excellent Reliability!</h4>
                                            <p className="text-green-300 text-sm">You promised carefully and delivered reliably. Every trade downstream can trust your schedule.</p>
                                        </div>
                                    </div>
                                )}
                                {ppcLevel === 'average' && (
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-yellow-400">Room for Improvement</h4>
                                            <p className="text-yellow-300 text-sm">Some promises were broken. Analyze what went wrong - were there hidden constraints you missed during the Lookahead?</p>
                                        </div>
                                    </div>
                                )}
                                {ppcLevel === 'poor' && (
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-red-400">Trust Damaged</h4>
                                            <p className="text-red-300 text-sm">More than half your promises were broken. Overcommitment and insufficient Make Ready led to unreliable execution.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {overcommitted && (
                                <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-xl">
                                    <h4 className="font-bold text-orange-400 text-sm uppercase mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Overcommitment Detected
                                    </h4>
                                    <p className="text-orange-300 text-sm">
                                        You accepted extra work under client pressure. This increased your promise count and made failure more likely. In real projects, protecting your commitments is a sign of professionalism, not weakness.
                                    </p>
                                </div>
                            )}

                            {failureReasons.length > 0 && (
                                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
                                    <h4 className="font-bold text-slate-300 text-sm uppercase mb-3 flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-red-400" />
                                        Reasons Analysis - Why Promises Failed
                                    </h4>
                                    <div className="space-y-2">
                                        {failureReasons.map((r, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm">
                                                {r.icon}
                                                <span className="text-slate-300">{r.reason}</span>
                                                <span className="text-slate-500 text-xs ml-auto">x{r.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3 italic border-t border-slate-700 pt-2">
                                        In real LPS projects, teams conduct weekly Reasons Analysis to track WHY promises were broken. Over time, patterns emerge - and that is how reliability improves.
                                    </p>
                                </div>
                            )}

                            {fragileTasks.length > 0 && (
                                <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl">
                                    <h4 className="font-bold text-amber-400 text-sm uppercase mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Fragile Tasks Report
                                    </h4>
                                    <p className="text-amber-300 text-sm">
                                        {fragileTasks.length} task{fragileTasks.length > 1 ? 's were' : ' was'} committed with unresolved constraints (fragile).
                                        {failedFragile.length > 0
                                            ? ` ${failedFragile.length} failed during execution - this is why Make Ready matters!`
                                            : ' All survived execution - you got lucky, but next time fix constraints first!'
                                        }
                                    </p>
                                </div>
                            )}

                            {quizScore !== undefined && (
                                <div className={`rounded-xl p-4 border ${quizScore >= 5 ? 'bg-green-900/20 border-green-500/30' : quizScore >= 3 ? 'bg-blue-900/20 border-blue-500/30' : 'bg-amber-900/20 border-amber-500/30'}`}>
                                    <h4 className={`font-bold text-sm uppercase mb-2 flex items-center gap-2 ${quizScore >= 5 ? 'text-green-400' : quizScore >= 3 ? 'text-blue-400' : 'text-amber-400'}`}>
                                        <Award className="w-4 h-4" /> Reflection Quiz: {quizScore}/5
                                    </h4>
                                    <p className={`text-sm ${quizScore >= 5 ? 'text-green-300' : quizScore >= 3 ? 'text-blue-300' : 'text-amber-300'}`}>
                                        {quizScore >= 5 ? 'Perfect understanding of Last Planner System concepts!' : quizScore >= 3 ? 'Good grasp of LPS principles. Review the missed concepts.' : 'Consider replaying to strengthen your understanding of LPS.'}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-300 text-sm uppercase flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> Day-by-Day Breakdown
                                </h4>
                                {[6, 7, 8, 9, 10, 11].map(d => {
                                    const insight = DAY_INSIGHTS[d];
                                    const isExpanded = expandedDay === d;
                                    return (
                                        <div key={d} className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-800/40">
                                            <button
                                                onClick={() => setExpandedDay(isExpanded ? null : d)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 transition-colors text-left"
                                                data-testid={`day-breakdown-${d}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-sm font-black">{d}</span>
                                                    <div>
                                                        <span className="font-bold text-slate-200 text-sm">{insight.title}</span>
                                                        <span className="text-slate-400 text-xs ml-2">{insight.concept}</span>
                                                    </div>
                                                </div>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                            </button>
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-slate-700/50"
                                                    >
                                                        <div className="p-3 space-y-2">
                                                            <p className="text-sm text-slate-300">{insight.lesson}</p>
                                                            <div className="flex items-start gap-2 text-xs text-indigo-300 bg-indigo-500/10 rounded-lg p-2 border border-indigo-500/20">
                                                                <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                                <span className="italic">{insight.example}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>

                            {badges.length > 0 && (
                                <div>
                                    <h4 className="text-slate-300 font-bold text-sm uppercase mb-3">Badges Earned</h4>
                                    <div className="flex gap-3 flex-wrap">
                                        {badges.map((badge, i) => (
                                            <motion.div
                                                key={badge.name}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.5 + i * 0.2 }}
                                                className={`${badge.color} text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg`}
                                            >
                                                {badge.icon}
                                                <span className="font-bold text-sm">{badge.name}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <TrendingUp className="w-3 h-3" />
                                        Budget
                                    </div>
                                    <div className="text-2xl font-mono font-bold text-slate-200">${funds}</div>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <Users className="w-3 h-3" />
                                        Morale
                                    </div>
                                    <div className={`text-2xl font-mono font-bold ${lpi.teamMorale >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                        {lpi.teamMorale}%
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                                <h4 className="font-bold text-indigo-400 text-sm uppercase mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" /> Key Learnings
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-bold text-indigo-300 text-sm">Planning is not promising.</span>
                                            <p className="text-indigo-200 text-xs">A schedule says SHOULD. Only after removing constraints can you say WILL.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-bold text-indigo-300 text-sm">PPC measures reliability, not productivity.</span>
                                            <p className="text-indigo-200 text-xs">Keeping 5 out of 5 promises (100% PPC) is better than keeping 7 out of 10 (70% PPC).</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-bold text-indigo-300 text-sm">Overcommitment destroys trust.</span>
                                            <p className="text-indigo-200 text-xs">Say no to protect your promises. A reliable "not yet" is better than a broken "yes".</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-bold text-indigo-300 text-sm">Make Ready prevents failure.</span>
                                            <p className="text-indigo-200 text-xs">Proactively removing constraints during planning prevents 80% of execution failures.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        const metricsData = (dailyMetrics as { day: number; efficiency: number; tasksCompletedToday: number; potentialCapacity: number; cumulativeEfficiency: number; insight: string }[]);
                                        exportChapterReport({
                                            playerName,
                                            chapter: 2,
                                            chapterTitle: 'The Promise System',
                                            dailyMetrics: metricsData,
                                            finalEfficiency: ppc,
                                            ppc,
                                            quizScore,
                                            quizTotal: quizScore !== undefined ? 5 : undefined,
                                            keyLearnings: [
                                                'Planning is not promising - a schedule says SHOULD. Only after removing constraints can you say WILL.',
                                                'PPC measures reliability, not productivity - keeping 5 out of 5 promises (100% PPC) is better than keeping 7 out of 10 (70% PPC).',
                                                'Overcommitment destroys trust - say no to protect your promises. A reliable "not yet" is better than a broken "yes".',
                                                'Make Ready prevents failure - proactively removing constraints during planning prevents 80% of execution failures.',
                                                'Should / Can / Will framework separates what the master schedule demands from what is actually executable.',
                                            ],
                                            badges: badges.map(b => b.name),
                                        });
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-800/50 text-slate-300 font-bold hover:bg-slate-700/50 transition-colors w-full shadow-md"
                                    data-testid="button-export-report-ch2"
                                >
                                    <Download className="w-4 h-4" /> Export Report
                                </button>

                                <button
                                    onClick={() => window.location.href = '/leaderboard'}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-600/50 bg-slate-800/50 text-slate-300 font-bold hover:bg-slate-700/50 transition-colors w-full shadow-md"
                                >
                                    <Trophy className="w-4 h-4" /> View Leaderboard
                                </button>

                                <button
                                    onClick={handleSubmitScore}
                                    disabled={submissionStatus === 'submitting' || submissionStatus === 'success'}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors font-bold w-full ${submissionStatus === 'success' ? 'bg-green-900/30 border-green-500/50 text-green-400' :
                                        submissionStatus === 'error' ? 'bg-red-900/30 border-red-500/50 text-red-400' :
                                            'border-slate-700 text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    {submissionStatus === 'submitting' && <span className="animate-spin">⏳</span>}
                                    {submissionStatus === 'success' && <CheckCircle className="w-4 h-4" />}
                                    {submissionStatus === 'success' ? 'Score Submitted!' :
                                        submissionStatus === 'error' ? 'Try Again' : 'Submit Score'}
                                </button>

                                <button
                                    onClick={handleContinue}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg font-black py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3 w-full"
                                    data-testid="button-continue-chapter"
                                >
                                    Continue to Chapter 3
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
