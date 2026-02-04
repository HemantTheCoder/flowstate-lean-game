import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';
import { CheckCircle, XCircle, AlertTriangle, Award, TrendingUp, Users, Target } from 'lucide-react';

interface Chapter2CompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
}

export const Chapter2CompleteModal: React.FC<Chapter2CompleteModalProps> = ({ isOpen, onClose, onContinue }) => {
    const { funds, lpi, weeklyPlan, columns, flags } = useGameStore();
    const [animatedPPC, setAnimatedPPC] = useState(0);

    const doneTasks = columns.find(c => c.id === 'done')?.tasks || [];
    const completedPromises = doneTasks.filter(t => weeklyPlan.includes(t.id) || weeklyPlan.includes(t.originalId || '')).length;
    const totalPromises = weeklyPlan.length;
    const ppc = totalPromises > 0 ? Math.round((completedPromises / totalPromises) * 100) : 0;

    const ppcLevel = ppc >= 80 ? 'excellent' : ppc >= 50 ? 'average' : 'poor';
    const overcommitted = flags['overcommitment_accepted'];

    useEffect(() => {
        if (isOpen) {
            soundManager.playSFX(ppcLevel === 'excellent' ? 'success' : 'complete', 0.8);
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
        }
    }, [isOpen, ppc, ppcLevel]);

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

    const badges = [];
    if (ppc >= 80) badges.push({ name: 'Promise Keeper', icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-500' });
    if (!overcommitted) badges.push({ name: 'Reliable Planner', icon: <Target className="w-6 h-6" />, color: 'bg-blue-500' });
    if (ppc === 100) badges.push({ name: 'Perfect Week', icon: <Award className="w-6 h-6" />, color: 'bg-yellow-500' });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 pointer-events-auto">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${getPPCBg()} h-32 flex flex-col items-center justify-center relative overflow-hidden`}>
                            <h1 className="text-4xl font-black text-white z-10 drop-shadow-lg text-center">
                                PPC Review
                            </h1>
                            <p className="text-white/80 font-bold tracking-widest uppercase mt-1">Week 2 Complete</p>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {/* PPC Gauge */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative w-48 h-48">
                                    <svg className="w-48 h-48 transform -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="80"
                                            stroke="#e5e7eb"
                                            strokeWidth="16"
                                            fill="none"
                                        />
                                        <motion.circle
                                            cx="96"
                                            cy="96"
                                            r="80"
                                            stroke={ppc >= 80 ? '#22c55e' : ppc >= 50 ? '#eab308' : '#ef4444'}
                                            strokeWidth="16"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={502}
                                            initial={{ strokeDashoffset: 502 }}
                                            animate={{ strokeDashoffset: 502 - (502 * animatedPPC / 100) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-5xl font-black ${getPPCColor()}`}>{animatedPPC}%</span>
                                        <span className="text-slate-400 text-sm font-bold uppercase">PPC</span>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-center mt-2">
                                    You promised <strong>{totalPromises}</strong> tasks and completed <strong>{completedPromises}</strong>.
                                </p>
                            </div>

                            {/* Result Message */}
                            <div className={`p-4 rounded-xl mb-6 ${
                                ppcLevel === 'excellent' ? 'bg-green-50 border border-green-200' :
                                ppcLevel === 'average' ? 'bg-yellow-50 border border-yellow-200' :
                                'bg-red-50 border border-red-200'
                            }`}>
                                {ppcLevel === 'excellent' && (
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-green-800">Excellent Reliability!</h4>
                                            <p className="text-green-700 text-sm">You promised carefully and delivered reliably. The crew trusts your plans.</p>
                                        </div>
                                    </div>
                                )}
                                {ppcLevel === 'average' && (
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-yellow-800">Room for Improvement</h4>
                                            <p className="text-yellow-700 text-sm">Some promises were broken. Were there hidden constraints you missed?</p>
                                        </div>
                                    </div>
                                )}
                                {ppcLevel === 'poor' && (
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-red-800">Trust Damaged</h4>
                                            <p className="text-red-700 text-sm">More than half your promises were broken. Overcommitment destroys trust.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Failure Analysis */}
                            {overcommitted && (
                                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg mb-6">
                                    <h4 className="font-bold text-orange-800 text-sm uppercase mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Overcommitment Detected
                                    </h4>
                                    <p className="text-orange-700 text-sm">
                                        You accepted extra work under client pressure. This increased your PPC denominator and made failure more likely.
                                    </p>
                                </div>
                            )}

                            {/* Badges */}
                            {badges.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-slate-700 font-bold text-sm uppercase mb-3">Badges Earned</h4>
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

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <TrendingUp className="w-3 h-3" />
                                        Budget
                                    </div>
                                    <div className="text-2xl font-mono font-bold text-slate-800">${funds}</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <Users className="w-3 h-3" />
                                        Morale
                                    </div>
                                    <div className={`text-2xl font-mono font-bold ${lpi.teamMorale >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                                        {lpi.teamMorale}%
                                    </div>
                                </div>
                            </div>

                            {/* Learning Summary */}
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                                <h4 className="font-bold text-blue-800 text-sm uppercase mb-2">Last Planner System Takeaways</h4>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    <li>Planning is not promising. Remove constraints before committing.</li>
                                    <li>PPC measures reliability, not productivity.</li>
                                    <li>Overcommitment destroys trust. Say no to protect your promises.</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xl font-black py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                data-testid="button-continue-chapter"
                            >
                                Continue to Chapter 3
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
