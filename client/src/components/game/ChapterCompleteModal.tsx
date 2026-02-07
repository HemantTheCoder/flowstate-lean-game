import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';
import { apiRequest } from '@/lib/queryClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { Play, CheckCircle2, AlertTriangle, TrendingUp, Target, Award, Lightbulb, ChevronRight, Zap, Users, Hammer, CloudRain, Shield, Download } from 'lucide-react';
import { exportChapterReport } from '@/lib/exportPDF';

interface DayBreakdown {
  day: number;
  efficiency: number;
  tasksCompletedToday: number;
  potentialCapacity: number;
  cumulativeEfficiency: number;
  insight: string;
}

const BeforeAfterComparison: React.FC<{ pushed: boolean }> = ({ pushed }) => {
    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bg-red-500/80 text-white text-[10px] font-bold text-center py-0.5 uppercase tracking-wider">
                    Before Kanban
                </div>
                <div className="mt-5 space-y-2">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <motion.div
                                key={i}
                                className="h-6 w-full bg-red-200 rounded border border-red-300"
                                animate={{ opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                className="h-4 w-full bg-orange-200 rounded border border-orange-300"
                                animate={{ opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                            />
                        ))}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1 text-center">
                        Congested queues, idle workers
                    </div>
                </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bg-green-500/80 text-white text-[10px] font-bold text-center py-0.5 uppercase tracking-wider">
                    After Kanban
                </div>
                <div className="mt-5 space-y-2">
                    <div className="flex gap-1">
                        {[1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="h-6 w-full bg-green-300 rounded border border-green-400"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.3 }}
                            />
                        ))}
                    </div>
                    <motion.div
                        className="h-4 w-1/2 bg-blue-200 rounded border border-blue-300"
                        initial={{ width: 0 }}
                        animate={{ width: '50%' }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    />
                    <div className="text-[10px] text-green-700 font-medium mt-1 text-center">
                        {pushed ? 'Flow improved, but waste created' : 'Smooth flow, focused teams'}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CharacterReactions: React.FC<{ pushed: boolean; efficiency: number }> = ({ pushed, efficiency }) => {
    const reactions = [
        {
            name: 'Mira',
            text: efficiency >= 80
                ? "See how limiting work helped everything move?"
                : "We have room to improve, but the system works.",
            color: 'bg-blue-50 border-blue-200 text-blue-800'
        },
        {
            name: 'Old Foreman',
            text: "Finish beats busy. Always has, always will.",
            color: 'bg-amber-50 border-amber-200 text-amber-800'
        },
        {
            name: 'Rao',
            text: pushed
                ? "Fine. Maybe pushing wasn't the answer. But I still want results!"
                : "I hate to admit it... the site IS calmer. And the Inspector was impressed.",
            color: pushed ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
        }
    ];

    return (
        <div className="space-y-2">
            <h4 className="font-bold text-slate-700 text-sm uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" /> Team Reactions
            </h4>
            {reactions.map((r, i) => (
                <motion.div
                    key={r.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.0 + i * 0.2 }}
                    className={`p-3 rounded-lg border text-sm ${r.color}`}
                >
                    <span className="font-bold">{r.name}:</span> "{r.text}"
                </motion.div>
            ))}
        </div>
    );
};

const KanbanBadge: React.FC<{ tier: { label: string; color: string } }> = ({ tier }) => {
    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 2.5, type: "spring", bounce: 0.5 }}
            className="flex flex-col items-center gap-2 py-3"
        >
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                        boxShadow: [
                            '0 0 0 0 rgba(251, 191, 36, 0)',
                            '0 0 0 8px rgba(251, 191, 36, 0.3)',
                            '0 0 0 0 rgba(251, 191, 36, 0)',
                        ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>
            <div className="text-center">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Badge Earned</div>
                <div className={`text-lg font-black ${tier.color}`}>{tier.label}</div>
            </div>
        </motion.div>
    );
};

export const ChapterCompleteModal: React.FC<{ isOpen: boolean; onClose: () => void; onContinue: () => void; quizScore?: number }> = ({ isOpen, onClose, onContinue, quizScore }) => {
    const { funds, lpi, dailyMetrics, flags, cumulativeTasksCompleted, cumulativePotentialCapacity, playerName } = useGameStore();
    const [activeDay, setActiveDay] = useState<number | null>(null);
    const [showInsights, setShowInsights] = useState(false);
    const submittedRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            soundManager.playSFX('success', 0.8);
            const timer = setTimeout(() => setShowInsights(true), 1500);
            if (!submittedRef.current) {
                submittedRef.current = true;
                const eff = cumulativePotentialCapacity > 0
                    ? Math.min(100, Math.round((cumulativeTasksCompleted / cumulativePotentialCapacity) * 100))
                    : lpi.flowEfficiency;
                const totalScore = Math.round(eff * 0.6 + (quizScore || 0) * 8);
                apiRequest('POST', '/api/leaderboard', {
                    playerName: playerName || 'Architect',
                    chapter: 1,
                    efficiency: eff,
                    ppc: 0,
                    quizScore: quizScore || 0,
                    totalScore,
                }).catch(() => {});
            }
            return () => clearTimeout(timer);
        } else {
            setShowInsights(false);
            setActiveDay(null);
        }
    }, [isOpen]);

    const handleContinue = () => {
        onClose();
        onContinue();
    };

    const finalEfficiency = cumulativePotentialCapacity > 0 
        ? Math.min(100, Math.max(0, Math.round((cumulativeTasksCompleted / cumulativePotentialCapacity) * 100)))
        : lpi.flowEfficiency;

    const getPerformanceTier = (eff: number) => {
        if (eff >= 90) return { label: 'Master Flow Architect', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
        if (eff >= 70) return { label: 'Skilled Practitioner', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
        if (eff >= 50) return { label: 'Developing Leader', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
        return { label: 'Learning Journey', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    };

    const tier = getPerformanceTier(finalEfficiency);
    const pushed = !!flags['decision_push_made'];

    const getImprovementSuggestions = () => {
        const suggestions: { icon: any; text: string; priority: 'high' | 'medium' | 'low' }[] = [];
        
        const metrics = dailyMetrics as DayBreakdown[];
        
        metrics.forEach((m) => {
            if (m.efficiency < 50) {
                if (m.day === 1) {
                    suggestions.push({ 
                        icon: Target, 
                        text: 'Day 1: Complete tasks up to WIP limit for maximum throughput', 
                        priority: 'high' 
                    });
                }
                if (m.day === 2) {
                    suggestions.push({ 
                        icon: Zap, 
                        text: 'Day 2: When materials run out, pivot to zero-cost tasks', 
                        priority: 'high' 
                    });
                }
                if (m.day === 3) {
                    suggestions.push({ 
                        icon: AlertTriangle, 
                        text: 'Day 3: Rain blocks structural work - adapt with indoor tasks', 
                        priority: 'medium' 
                    });
                }
            }
        });

        if (pushed) {
            suggestions.push({ 
                icon: Lightbulb, 
                text: 'Day 4: Choosing Pull over Push avoids creating rework waste', 
                priority: 'high' 
            });
        }

        if (suggestions.length === 0 && finalEfficiency >= 80) {
            suggestions.push({ 
                icon: Award, 
                text: 'Excellent flow management! You understood WIP limits and adaptation.', 
                priority: 'low' 
            });
        }

        return suggestions.slice(0, 3);
    };

    const suggestions = getImprovementSuggestions();
    
    const getSuccesses = () => {
        const successes: string[] = [];
        const metrics = dailyMetrics as DayBreakdown[];
        
        metrics.forEach((m) => {
            if (m.efficiency >= 80) {
                if (m.day === 1) successes.push('Mastered WIP limits on Day 1');
                if (m.day === 2) successes.push('Adapted to material constraints');
                if (m.day === 3) successes.push('Handled weather variation');
                if (m.day === 4 && !pushed) successes.push('Made the right Pull decision');
                if (m.day === 5) successes.push('Passed inspection with clean flow');
            }
        });
        
        return successes.length > 0 ? successes : ['Completed the chapter - keep learning!'];
    };

    const successes = getSuccesses();

    const chartData = (dailyMetrics as DayBreakdown[]).map(m => ({
        ...m,
        dayLabel: `Day ${m.day}`,
        fill: m.efficiency >= 80 ? '#22c55e' : m.efficiency >= 50 ? '#3b82f6' : '#f59e0b'
    }));

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 perspective-[1000px] pointer-events-auto">
                    <motion.div
                        initial={{ scale: 0.5, rotateX: 45, opacity: 0 }}
                        animate={{ scale: 1, rotateX: 0, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0, rotateX: -45 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="bg-white w-full max-w-3xl max-h-[95vh] rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.3)] overflow-hidden border-4 border-green-400 relative flex flex-col"
                    >
                        <div className="bg-gradient-to-r from-green-400 to-emerald-600 px-6 py-8 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30"></div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                                className="mb-2"
                            >
                                <Award className="w-12 h-12 text-white drop-shadow-lg" />
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black text-white z-10 drop-shadow-lg text-center tracking-tighter">
                                CHAPTER 1 COMPLETE
                            </h1>
                            <p className="text-green-100 font-bold tracking-widest uppercase mt-1 text-sm">The Kanban Chronicles</p>
                            
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className={`mt-4 px-6 py-2 rounded-full ${tier.bg} ${tier.border} border-2 flex items-center gap-2`}
                            >
                                <TrendingUp className={`w-5 h-5 ${tier.color}`} />
                                <span className={`font-black text-2xl ${tier.color}`}>{finalEfficiency}%</span>
                                <span className="text-white/80 text-sm font-medium">Flow Score</span>
                            </motion.div>
                            <p className={`mt-2 text-sm font-bold ${tier.color}`}>{tier.label}</p>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-5">

                            <BeforeAfterComparison pushed={pushed} />

                            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 shadow-inner">
                                <h3 className="text-slate-800 font-bold text-sm uppercase mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    Your Flow Journey
                                </h3>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} onMouseMove={(e) => {
                                            if (e.activePayload) {
                                                setActiveDay(e.activePayload[0]?.payload?.day);
                                            }
                                        }} onMouseLeave={() => setActiveDay(null)}>
                                            <defs>
                                                <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis 
                                                dataKey="dayLabel" 
                                                tick={{ fontSize: 11, fontWeight: 500 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis 
                                                domain={[0, 100]}
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(v) => `${v}%`}
                                            />
                                            <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    borderRadius: '12px', 
                                                    border: 'none', 
                                                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)', 
                                                    fontSize: '12px',
                                                    padding: '12px'
                                                }}
                                                formatter={(value: number, name: string) => {
                                                    if (name === 'cumulativeEfficiency') return [`${value}%`, 'Cumulative'];
                                                    return [`${value}%`, 'Daily'];
                                                }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="cumulativeEfficiency"
                                                name="cumulativeEfficiency"
                                                stroke="#10b981" 
                                                strokeWidth={3}
                                                fill="url(#cumulativeGradient)"
                                                dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2 }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="efficiency"
                                                name="efficiency"
                                                stroke="#3b82f6" 
                                                strokeWidth={2}
                                                strokeDasharray="4 4"
                                                dot={{ r: 3, fill: '#3b82f6' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-6 mt-3">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                        <div className="w-4 h-1 bg-emerald-500 rounded"></div> Cumulative Efficiency
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-500">
                                        <div className="w-4 h-0.5 bg-blue-500 border-t border-dashed"></div> Daily Rate
                                    </div>
                                </div>
                                
                                <AnimatePresence>
                                    {activeDay && chartData.find(d => d.day === activeDay) && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800"
                                        >
                                            <strong>Day {activeDay}:</strong> {chartData.find(d => d.day === activeDay)?.insight}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                                {chartData.map((day, i) => (
                                    <motion.div
                                        key={day.day}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 + i * 0.1 }}
                                        className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all
                                            ${day.efficiency >= 80 
                                                ? 'bg-green-50 border-green-200 hover:border-green-400' 
                                                : day.efficiency >= 50 
                                                    ? 'bg-blue-50 border-blue-200 hover:border-blue-400'
                                                    : 'bg-orange-50 border-orange-200 hover:border-orange-400'
                                            }`}
                                        onClick={() => setActiveDay(activeDay === day.day ? null : day.day)}
                                        data-testid={`card-day-${day.day}`}
                                    >
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Day {day.day}</div>
                                        <div className={`text-xl font-black ${
                                            day.efficiency >= 80 ? 'text-green-600' : 
                                            day.efficiency >= 50 ? 'text-blue-600' : 'text-orange-600'
                                        }`}>
                                            {day.tasksCompletedToday}/{day.potentialCapacity}
                                        </div>
                                        <div className="text-[10px] text-slate-500">tasks</div>
                                    </motion.div>
                                ))}
                            </div>

                            <AnimatePresence>
                                {showInsights && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                            <h4 className="font-bold text-green-800 text-sm uppercase mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> What Went Well
                                            </h4>
                                            <ul className="space-y-2">
                                                {successes.map((s, i) => (
                                                    <motion.li 
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 1.8 + i * 0.15 }}
                                                        className="flex items-center gap-2 text-green-700 text-sm"
                                                    >
                                                        <ChevronRight className="w-3 h-3 text-green-500" />
                                                        {s}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>

                                        {finalEfficiency < 100 && suggestions.length > 0 && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                <h4 className="font-bold text-amber-800 text-sm uppercase mb-3 flex items-center gap-2">
                                                    <Lightbulb className="w-4 h-4" /> How to Improve
                                                </h4>
                                                <ul className="space-y-2">
                                                    {suggestions.map((s, i) => (
                                                        <motion.li 
                                                            key={i}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 2.2 + i * 0.15 }}
                                                            className="flex items-start gap-2 text-amber-700 text-sm"
                                                        >
                                                            <s.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                                                s.priority === 'high' ? 'text-red-500' : 
                                                                s.priority === 'medium' ? 'text-amber-500' : 'text-green-500'
                                                            }`} />
                                                            {s.text}
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <CharacterReactions pushed={pushed} efficiency={finalEfficiency} />

                                        {quizScore !== undefined && (
                                            <div className={`rounded-xl p-4 border ${quizScore >= 5 ? 'bg-green-50 border-green-200' : quizScore >= 3 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                                                <h4 className={`font-bold text-sm uppercase mb-2 flex items-center gap-2 ${quizScore >= 5 ? 'text-green-800' : quizScore >= 3 ? 'text-blue-800' : 'text-amber-800'}`}>
                                                    <Award className="w-4 h-4" /> Reflection Quiz: {quizScore}/5
                                                </h4>
                                                <p className={`text-sm ${quizScore >= 5 ? 'text-green-700' : quizScore >= 3 ? 'text-blue-700' : 'text-amber-700'}`}>
                                                    {quizScore >= 5 ? 'Perfect understanding of Lean concepts!' : quizScore >= 3 ? 'Good grasp of core principles. Review the missed concepts.' : 'Consider replaying to strengthen your understanding.'}
                                                </p>
                                            </div>
                                        )}

                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                            <h4 className="font-bold text-purple-800 text-sm uppercase mb-3 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4" /> Key Learnings
                                            </h4>
                                            <div className="space-y-3 text-sm text-purple-700">
                                                <div className="flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <strong>WIP Limits prevent congestion.</strong>
                                                        <p className="text-xs text-purple-600 mt-0.5 italic">In construction: limiting active work fronts to 2-3 zones keeps crews focused and prevents spreading resources too thin across the site.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <strong>Pull systems eliminate waste from rushing.</strong>
                                                        <p className="text-xs text-purple-600 mt-0.5 italic">In construction: excavating before pipes arrive creates mud pits needing re-work. Pull-based scheduling waits until materials and prerequisites are ready.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <strong>Adaptation keeps flow alive under constraints.</strong>
                                                        <p className="text-xs text-purple-600 mt-0.5 italic">In construction: experienced contractors keep indoor work (MEP, drywall) ready for rainy days instead of idling crews.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <KanbanBadge tier={tier} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Funds</div>
                                    <div className="text-xl font-mono font-bold text-slate-800">${funds}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Morale</div>
                                    <div className="text-xl font-mono font-bold text-green-500">{lpi.teamMorale}%</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tasks Done</div>
                                    <div className="text-xl font-mono font-bold text-blue-500">{cumulativeTasksCompleted}/{cumulativePotentialCapacity}</div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                                <h4 className="font-bold text-indigo-800 text-sm uppercase mb-1">Coming Up: Chapter 2</h4>
                                <p className="text-indigo-700 text-sm italic">
                                    "The Promise System". Master the Last Planner System with <strong>Should/Can/Will</strong> planning and constraint management.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        const metrics = dailyMetrics as DayBreakdown[];
                                        const keyDecisions: { label: string; outcome: 'good' | 'bad' }[] = [];
                                        if (pushed) {
                                            keyDecisions.push({ label: 'Chose to Push work on Day 4 (created rework waste)', outcome: 'bad' });
                                        } else if (flags['decision_pull_made']) {
                                            keyDecisions.push({ label: 'Chose Pull over Push on Day 4 (avoided waste)', outcome: 'good' });
                                        }
                                        exportChapterReport({
                                            playerName,
                                            chapter: 1,
                                            chapterTitle: 'The Kanban Chronicles',
                                            dailyMetrics: metrics,
                                            finalEfficiency,
                                            quizScore,
                                            quizTotal: quizScore !== undefined ? 5 : undefined,
                                            keyDecisions,
                                            keyLearnings: [
                                                'WIP Limits prevent congestion - limiting active work fronts keeps crews focused and prevents spreading resources too thin.',
                                                'Pull systems eliminate waste from rushing - wait until materials and prerequisites are ready before starting work.',
                                                'Adaptation keeps flow alive under constraints - keep alternative work ready for disruptions like weather or material shortages.',
                                                'Flow Efficiency measures value-adding completion vs. potential capacity across all days.',
                                            ],
                                            badges: [tier.label],
                                        });
                                    }}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                                    data-testid="button-export-report-ch1"
                                >
                                    <Download className="w-4 h-4" /> Export Report
                                </button>
                                <button
                                    onClick={handleContinue}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xl font-black py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                    data-testid="button-start-chapter-2"
                                >
                                    Start Chapter 2 <Play className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
