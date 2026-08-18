import { useEffect } from 'react';
import { useGameStore, formatCurrency } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Lightbulb, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';
import soundManager from '@/lib/soundManager';
import { ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { GAME_CONSTANTS } from '@/config/constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    completedTasks: number;
}

const LEAN_LESSONS: Record<number, { concept: string; explanation: string; example: string }> = {
    1: {
        concept: "WIP Limits & Kanban",
        explanation: "Limiting Work-In-Progress prevents bottlenecks and keeps the team focused on finishing tasks, not just starting them.",
        example: "On a real site, limiting active work fronts to 2-3 zones prevents crews from spreading too thin across the building."
    },
    2: {
        concept: "Buffer Management & Adaptation",
        explanation: "When materials are constrained, a Pull system pivots to available work. Never let workers stand idle when there are zero-cost tasks available.",
        example: "When concrete delivery is delayed, smart site managers redirect crews to safety inspections, formwork checks, or tool organization."
    },
    3: {
        concept: "Variation & Robustness",
        explanation: "Weather, supply delays, and equipment failures are inevitable variations. A robust system has backup tasks ready to maintain flow.",
        example: "During monsoon season, experienced contractors keep a backlog of interior work (MEP rough-in, drywall) ready for rainy days."
    },
    4: {
        concept: "Push vs Pull Systems",
        explanation: "Pushing unready work creates waste and rework. Pulling only ready work creates genuine value and avoids false progress.",
        example: "Excavating trenches before drainage pipes arrive creates mud pits that need re-grading. Pull-based scheduling waits for materials."
    },
    5: {
        concept: "Reliability & Flow",
        explanation: "Reliability comes from finishing what you start, not from looking busy. Consistent, predictable output builds trust with clients and inspectors.",
        example: "A site with 2 completed zones beats a site with 5 half-finished zones. Inspectors judge completion, not activity."
    },
    6: {
        concept: "Should / Can / Will Planning",
        explanation: "The Last Planner System uses three levels of planning. The Master Schedule shows what SHOULD happen. The Lookahead Window checks what CAN happen (by identifying constraints). The Weekly Work Plan commits to what WILL happen.",
        example: "Before pouring a foundation, the Master Schedule says it SHOULD happen this week. But the Lookahead reveals the rebar delivery is late (constraint). So it CAN'T happen yet. Only when the rebar arrives do you commit: it WILL happen Thursday."
    },
    7: {
        concept: "Constraints & Prerequisites",
        explanation: "A constraint is anything that prevents a task from being executed: missing materials, unavailable crew, pending approvals, or bad weather. Identifying constraints BEFORE committing is what separates reliable planning from wishful thinking.",
        example: "On a real site, the foreman checks: Do we have drawings? Are materials on site? Is the crew available? Is the previous task complete? If ANY answer is no, the task has a constraint and is NOT ready."
    },
    8: {
        concept: "Make Ready Process",
        explanation: "Making work ready means actively removing constraints so tasks become 'Sound' (executable). This is proactive management - don't wait for problems to appear during execution. Fix them during planning.",
        example: "If steel delivery is the constraint, the planner calls the supplier, confirms delivery date, arranges crane time, and ensures the crew is briefed. Only when ALL prerequisites are met is the task 'Sound' and ready for commitment."
    },
    9: {
        concept: "Reliable Commitments",
        explanation: "In LPS, a commitment is a promise to complete specific tasks this week. Only promise what you CAN deliver - tasks that are 'Sound' (green, no constraints). Overcommitting under pressure destroys trust and reliability.",
        example: "A superintendent who promises 10 tasks but delivers 6 has a PPC of 60%. One who promises 7 and delivers 7 has 100% PPC. The second is MORE valuable because the team can depend on their promises."
    },
    10: {
        concept: "Execution & Promise Keeping",
        explanation: "Execution day reveals the truth of your planning. If you made work ready and committed only to Sound tasks, execution should flow smoothly. Broken promises indicate planning failures, not worker failures.",
        example: "When a crew arrives Monday morning and all materials, drawings, and prerequisites are in place, they can focus 100% on building. No searching, no waiting, no improvising. That's the power of Make Ready."
    },
    11: {
        concept: "PPC - Percent Plan Complete",
        explanation: "PPC measures reliability: (Tasks Completed / Tasks Promised) x 100. It's NOT about how much work you did - it's about how many PROMISES you kept. High PPC means the team can trust your plans.",
        example: "World-class construction projects target 80%+ PPC. Every broken promise is analyzed: Why did it fail? Was there a hidden constraint? This weekly learning cycle is what makes LPS powerful."
    },
    12: {
        concept: "Sort (Seiri) - The First S",
        explanation: "Sort means separating the necessary from the unnecessary. Red-tag items that are broken, expired, or unused. Removing clutter is the first step to an organized workspace.",
        example: "On a real construction site, sorting means red-tagging broken scaffolding, expired chemicals, and obsolete drawings. If it hasn't been used in 30 days and isn't scheduled, it goes."
    },
    13: {
        concept: "Set in Order (Seiton) - The Second S",
        explanation: "Everything should have a designated place, and everything should be in its place. The goal is '30-second retrieval' - any tool or material should be findable within 30 seconds.",
        example: "Shadow boards for tools (outlines showing where each tool belongs), labeled bins for fasteners, and color-coded zones for materials. Workers never waste time searching."
    },
    14: {
        concept: "Shine (Seiso) - The Third S",
        explanation: "Cleaning is not just about appearance - it's a form of inspection. When you clean equipment, you notice oil leaks, cracks, and wear before they become failures.",
        example: "A crew sweeping a concrete floor notices hairline cracks that would have been missed. Cleaning the crane reveals a hydraulic leak. Shine prevents expensive breakdowns."
    },
    15: {
        concept: "Standardize (Seiketsu) - The Fourth S",
        explanation: "Standardize means creating consistent rules and visual cues so that the first 3S become routine. Without standards, improvements fade within days.",
        example: "Posting zone maps, creating checklists for end-of-shift cleanup, and using color-coded labels so new workers can follow the system without training."
    },
    16: {
        concept: "Sustain (Shitsuke) - The Fifth S",
        explanation: "Sustain is the hardest S - it means building discipline so the standards stick. Regular audits, team accountability, and management support keep the system alive.",
        example: "Weekly 5S audits score each zone. Teams that score above 80% earn recognition. The goal is making 5S a habit, not a one-time event."
    }
};

export const DailySummary: React.FC<Props> = ({ isOpen, onClose, completedTasks }) => {
    const day = useGameStore(s => s.day);
    const chapter = useGameStore(s => s.chapter);
    const funds = useGameStore(s => s.funds);
    const currency = useGameStore(s => s.currency);
    const dailyMetrics = useGameStore(s => s.dailyMetrics) ?? [];
    const columns = useGameStore(s => s.columns);
    const dailyCommitments = useGameStore(s => s.dailyCommitments) ?? {};
    const [, setLocation] = useLocation();
    
    const allTasks = columns.flatMap(c => c.tasks);
    const doneTasksList = columns.find(c => c.id === 'done')?.tasks || [];
    const hasWeights = allTasks.some(t => t.completionWeight);

    let percentComplete = 0;
    if (hasWeights) {
        const totalWeight = allTasks.reduce((acc, t) => acc + (t.completionWeight || 0), 0);
        const doneWeight = doneTasksList.reduce((acc, t) => acc + (t.completionWeight || 0), 0);
        percentComplete = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;
    } else {
        const doneCount = doneTasksList.length;
        const totalCount = allTasks.length;
        percentComplete = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    }

    useEffect(() => {
        if (isOpen) {
            soundManager.playSFX('day_transition', 0.6);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const displayDay = day - 1;

    const latestMetric = dailyMetrics.length > 0 ? dailyMetrics[dailyMetrics.length - 1] : null;
    const dailyEfficiency = latestMetric?.efficiency ?? 0;
    const cumulativeEfficiency = latestMetric?.cumulativeEfficiency ?? 0;
    const insight = latestMetric?.insight ?? '';

    const lesson = LEAN_LESSONS[displayDay];

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4 pointer-events-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 w-full max-w-md max-h-[90vh] rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden border border-slate-700/50 flex flex-col"
            >
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 p-6 text-center shrink-0 border-b border-blue-500/30 relative overflow-hidden">
                    {dailyEfficiency >= 80 && (
                        <>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                                    animate={{ 
                                        opacity: [0, 1, 0], 
                                        x: Math.sin(i * 30) * 150, 
                                        y: Math.cos(i * 30) * 100 - 20,
                                        scale: [0, (i % 3) * 0.5 + 0.5, 0],
                                        rotate: i * 45
                                    }}
                                    transition={{ duration: 1.5 + (i % 2), ease: "easeOut" }}
                                    className={`absolute left-1/2 top-1/2 w-3 h-3 rounded-sm pointer-events-none z-0 ${i % 2 === 0 ? 'bg-yellow-400' : 'bg-cyan-400'}`}
                                />
                            ))}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.9], y: [20, -10, 0, -20] }}
                                transition={{ duration: 2.5, ease: "easeOut" }}
                                className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
                            >
                                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-black text-xl uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.5)] border-2 border-yellow-300 transform -rotate-6">
                                    🔥 Flow Streak!
                                </div>
                            </motion.div>
                        </>
                    )}

                    <h2 className="text-3xl font-black text-white uppercase tracking-wider relative z-20">{GAME_CONSTANTS.TIME_UNIT} {displayDay} Complete</h2>
                    <p className="text-blue-200 font-medium mt-1 relative z-20">Site Report</p>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                        <div className="text-slate-400 font-bold">Tasks Finished</div>
                        <div className="text-3xl font-black text-slate-200">{completedTasks}</div>
                    </div>

                    {/* The reveal against the morning's promise. Kept adjacent to the raw count so the
                        comparison — not the count — is what the player reads first. */}
                    {(() => {
                        const promised = dailyCommitments[displayDay];
                        if (promised === undefined) return null;
                        const kept = completedTasks >= promised;
                        const reliability = promised > 0
                            ? Math.min(100, Math.round((completedTasks / promised) * 100))
                            : 0;
                        return (
                            <div className={`rounded-xl p-4 border ${kept ? 'bg-emerald-900/20 border-emerald-500/40' : 'bg-amber-900/20 border-amber-500/40'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${kept ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {kept ? 'Promise Kept' : 'Promise Missed'}
                                    </span>
                                    <span className={`text-lg font-black font-mono ${kept ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {reliability}%
                                    </span>
                                </div>
                                <div className="text-sm text-slate-300 font-medium">
                                    You promised <b>{promised}</b>, delivered <b>{completedTasks}</b>.
                                </div>
                                <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                                    {kept
                                        ? 'This is reliability: a crew that hits its promise lets everyone downstream plan around it.'
                                        : 'A missed promise stalls every trade waiting on you. Next time, promise less and finish it — a smaller reliable number beats a bigger hopeful one.'}
                                </p>
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-900/20 rounded-xl p-3 border border-blue-500/30 text-center flex flex-col justify-center">
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Daily Efficiency</div>
                            <div className={`text-2xl font-black ${dailyEfficiency >= 80 ? 'text-green-400' : dailyEfficiency >= 50 ? 'text-blue-400' : 'text-orange-400'}`}>
                                {dailyEfficiency}%
                            </div>
                            <div className="text-[9px] text-blue-500 font-bold mt-1 uppercase tracking-widest">(Done vs Planned)</div>
                        </div>
                        <div className="bg-emerald-900/20 rounded-xl p-3 border border-emerald-500/30 text-center flex flex-col justify-center">
                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Cumulative
                            </div>
                            <div className={`text-2xl font-black ${cumulativeEfficiency >= 80 ? 'text-green-400' : cumulativeEfficiency >= 50 ? 'text-blue-400' : 'text-orange-400'}`}>
                                {cumulativeEfficiency}%
                            </div>
                        </div>
                    </div>

                    {dailyMetrics.length >= 2 && (() => {
                        const sparklineData = dailyMetrics.map(metric => ({ day: metric.day, eff: metric.efficiency }));
                        const currentEff = dailyMetrics[dailyMetrics.length - 1].efficiency;
                        const prevEff = dailyMetrics[dailyMetrics.length - 2].efficiency;
                        const diff = currentEff - prevEff;
                        const trendArrow = diff > 0 ? '\u2191' : diff < 0 ? '\u2193' : '\u2014';
                        const trendColor = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-slate-400';
                        const trendLabel = diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '0%';

                        return (
                            <div data-testid="sparkline-trend">
                                <div className={`text-xs ${trendColor} mb-1`}>
                                    Trend: {trendArrow} {trendLabel}
                                </div>
                                <div className="h-20">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={sparklineData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                                            <defs>
                                                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <ReferenceLine y={80} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Target', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
                                            <Area
                                                type="monotone"
                                                dataKey="eff"
                                                stroke="#06b6d4"
                                                fill="url(#sparklineGradient)"
                                                strokeWidth={2}
                                                dot={(props: any) => {
                                                    if (props.index === sparklineData.length - 1) {
                                                        return <circle cx={props.cx} cy={props.cy} r={4} fill="#06b6d4" stroke="#fff" strokeWidth={2} />;
                                                    }
                                                    return <circle cx={0} cy={0} r={0} fill="none" />;
                                                }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })()}

                    {insight && (
                        <div className={`p-3 rounded-xl text-sm font-bold border ${dailyEfficiency >= 80 ? 'bg-green-900/20 border-green-500/30 text-green-300' : dailyEfficiency >= 50 ? 'bg-blue-900/20 border-blue-500/30 text-blue-300' : 'bg-orange-900/20 border-orange-500/30 text-orange-300'}`}>
                            {insight}
                        </div>
                    )}

                    <div className="bg-red-900/20 p-3 rounded-xl border border-red-500/30">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-red-400 font-bold text-sm">Site Overhead</span>
                            <span className="text-red-400 font-mono font-bold">-{formatCurrency(250000, currency)}</span>
                        </div>
                        <p className="text-xs text-red-500">Salaries, Equipment Rental, Daily Setup.</p>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
                        <span className="text-blue-400 font-bold">What is Efficiency?</span><br />
                        It measures exactly how much work was <span className="text-green-400 font-bold">completed</span> compared to how much could possibly be completed today. A high percentage means your construction flow is highly reliable and predictable!
                    </div>

                    <div className="bg-slate-800 rounded-xl border border-slate-600 overflow-hidden shadow-inner font-sans mt-2">
                        <div className="bg-slate-700/50 px-3 py-1.5 border-b border-slate-600 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-600 flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-white font-serif font-black leading-none">X</span>
                                </div>
                                <span className="text-xs text-slate-200 font-bold tracking-wider uppercase">Project Tracker.xlsx</span>
                            </div>
                            <span className="text-xs text-cyan-400 font-mono font-bold">{percentComplete}% Complete</span>
                        </div>
                        <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 bg-slate-800 border-b border-slate-700 text-center divide-x divide-slate-700">
                            <div className="py-1.5 bg-slate-700/30">METRIC</div>
                            <div className="py-1.5 bg-slate-700/30">PLANNED</div>
                            <div className="py-1.5 bg-slate-700/30">ACTUAL (OVERRUN)</div>
                        </div>
                        <div className="grid grid-cols-3 text-xs text-slate-300 font-mono bg-slate-900 text-center divide-x divide-slate-800 border-b border-slate-800">
                            <div className="py-2 flex items-center justify-center font-sans font-medium text-slate-300">Time ({GAME_CONSTANTS.TIME_UNIT}s)</div>
                            <div className="py-2 text-slate-500">{chapter === 1 ? 5 : chapter === 2 ? 11 : 16}</div>
                            <div className={`py-2 font-bold ${displayDay > (chapter === 1 ? 5 : chapter === 2 ? 11 : 16) ? 'text-red-400' : 'text-emerald-400'}`}>
                                {displayDay} {displayDay > (chapter === 1 ? 5 : chapter === 2 ? 11 : 16) && `(+${displayDay - (chapter === 1 ? 5 : chapter === 2 ? 11 : 16)})`}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 text-xs text-slate-300 font-mono bg-slate-900 text-center divide-x divide-slate-800">
                            <div className="py-2 flex items-center justify-center font-sans font-medium text-slate-300">Budget</div>
                            <div className="py-2 text-slate-500">{formatCurrency((chapter === 1 ? 5 : chapter === 2 ? 11 : 16) * 3000000, currency)}</div>
                            <div className={`py-2 font-bold ${funds < (chapter === 1 ? 5 : chapter === 2 ? 11 : 16) * 3000000 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {formatCurrency(funds, currency)} {funds < (chapter === 1 ? 5 : chapter === 2 ? 11 : 16) * 3000000 && `(${formatCurrency(funds - (chapter === 1 ? 5 : chapter === 2 ? 11 : 16) * 3000000, currency)})`}
                            </div>
                        </div>
                    </div>

                    {lesson && (
                        <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30">
                            <h4 className="font-bold text-indigo-400 text-sm uppercase mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Today's Lesson: {lesson.concept}
                            </h4>
                            <p className="text-sm text-indigo-300 leading-relaxed mb-2">
                                {lesson.explanation}
                            </p>
                            <div className="flex items-start gap-2 text-xs text-indigo-300 bg-indigo-950/50 rounded-lg p-2 border border-indigo-500/20">
                                <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                                <span className="italic">{lesson.example}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        data-testid="button-next-day"
                        className="w-full bg-blue-600 border border-blue-500/50 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                    >
                        {(displayDay >= 5 && chapter === 1) || (displayDay >= 11 && chapter === 2) || (displayDay >= 16 && chapter === 3) ? 'View Results' : `Start ${GAME_CONSTANTS.TIME_UNIT} ${displayDay + 1}`}
                    </button>

                    {/* The full causal report. This page existed and was fully built but nothing in
                        the app ever linked to it, so no player could reach it. */}
                    {dailyMetrics.length >= 1 && (
                        <button
                            onClick={() => setLocation('/debrief')}
                            data-testid="button-view-debrief"
                            className="w-full mt-2 bg-slate-800/70 border border-slate-700 text-slate-300 py-3 rounded-xl font-bold text-sm hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" /> Why did this happen? — Full report
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
