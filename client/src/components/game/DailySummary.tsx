import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Lightbulb } from 'lucide-react';
import soundManager from '@/lib/soundManager';

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
    }
};

export const DailySummary: React.FC<Props> = ({ isOpen, onClose, completedTasks }) => {
    useEffect(() => {
        if (isOpen) {
            soundManager.playSFX('day_transition', 0.6);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const day = useGameStore(s => s.day);
    const chapter = useGameStore(s => s.chapter);
    const funds = useGameStore(s => s.funds);
    const dailyMetrics = useGameStore(s => s.dailyMetrics);

    const displayDay = day - 1;

    const latestMetric = dailyMetrics.length > 0 ? dailyMetrics[dailyMetrics.length - 1] : null;
    const dailyEfficiency = latestMetric?.efficiency ?? 0;
    const cumulativeEfficiency = latestMetric?.cumulativeEfficiency ?? 0;
    const insight = latestMetric?.insight ?? '';

    const lesson = LEAN_LESSONS[displayDay];

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-200 flex flex-col"
            >
                <div className="bg-blue-600 p-6 text-center shrink-0">
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider">Day {displayDay} Complete</h2>
                    <p className="text-blue-100 font-medium mt-1">Site Report</p>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div className="text-slate-500 font-bold">Tasks Finished</div>
                        <div className="text-3xl font-black text-slate-800">{completedTasks}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Daily Efficiency</div>
                            <div className={`text-2xl font-black ${dailyEfficiency >= 80 ? 'text-green-500' : dailyEfficiency >= 50 ? 'text-blue-500' : 'text-orange-500'}`}>
                                {dailyEfficiency}%
                            </div>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Cumulative
                            </div>
                            <div className={`text-2xl font-black ${cumulativeEfficiency >= 80 ? 'text-green-500' : cumulativeEfficiency >= 50 ? 'text-blue-500' : 'text-orange-500'}`}>
                                {cumulativeEfficiency}%
                            </div>
                        </div>
                    </div>

                    {insight && (
                        <div className={`p-3 rounded-xl text-sm font-bold border ${dailyEfficiency >= 80 ? 'bg-green-50 border-green-200 text-green-700' : dailyEfficiency >= 50 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                            {insight}
                        </div>
                    )}

                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-red-800 font-bold text-sm">Daily Overhead</span>
                            <span className="text-red-600 font-mono font-bold">-$250</span>
                        </div>
                        <p className="text-xs text-red-600">Salaries, Equipment, Rent.</p>
                    </div>

                    <div className={`text-center font-bold text-sm ${funds < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        Current Funds: <span className="font-mono">${funds}</span>
                    </div>

                    {lesson && (
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                            <h4 className="font-bold text-indigo-800 text-sm uppercase mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Today's Lesson: {lesson.concept}
                            </h4>
                            <p className="text-sm text-indigo-700 leading-relaxed mb-2">
                                {lesson.explanation}
                            </p>
                            <div className="flex items-start gap-2 text-xs text-indigo-600 bg-indigo-100/50 rounded-lg p-2 border border-indigo-200/50">
                                <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                <span className="italic">{lesson.example}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        data-testid="button-next-day"
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform"
                    >
                        {(displayDay >= 5 && chapter === 1) || (displayDay >= 11 && chapter === 2) ? 'View Results' : `Start Day ${displayDay + 1}`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
