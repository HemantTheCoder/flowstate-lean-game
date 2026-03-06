import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Advisor Hint Types ─────────────────────────────────────────────────────
type Severity = 'critical' | 'warning' | 'good' | 'info';

interface Hint {
    severity: Severity;
    headline: string;
    detail: string;
    leanPrinciple?: string;
}

const SEVERITY_CONFIG: Record<Severity, { icon: React.ReactNode; color: string; border: string; bg: string }> = {
    critical: { icon: <AlertTriangle className="w-4 h-4 shrink-0" />, color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-900/20' },
    warning: { icon: <TrendingDown className="w-4 h-4 shrink-0" />, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-900/20' },
    good: { icon: <CheckCircle2 className="w-4 h-4 shrink-0" />, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-900/20' },
    info: { icon: <TrendingUp className="w-4 h-4 shrink-0" />, color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-900/20' },
};

// ─── CS1 Advisor Logic ──────────────────────────────────────────────────────
function getCS1Hints(day: number, pdi: number, reworkRate: number, hoistSlots: number): Hint[] {
    const hints: Hint[] = [];

    // PDI assessment
    if (pdi > 40) {
        hints.push({
            severity: 'critical',
            headline: 'PDI is critically high!',
            detail: `At ${pdi}%, passenger disruption is unacceptable. Prioritize Dedicated Night Runs to move work out of peak hours.`,
            leanPrinciple: 'Separate high-disruption activities from operating hours — protect the customer!'
        });
    } else if (pdi > 20) {
        hints.push({
            severity: 'warning',
            headline: 'Disruption rising — take action',
            detail: `PDI is at ${pdi}%. Add a night hoist run or reduce concurrent floor activity to bring it down.`,
        });
    } else {
        hints.push({
            severity: 'good',
            headline: 'PDI is healthy',
            detail: `Passenger disruption at ${pdi}% — keep scheduling night runs to maintain this.`,
        });
    }

    // Rework assessment
    if (reworkRate > 15) {
        hints.push({
            severity: 'critical',
            headline: 'Rework rate dangerously high!',
            detail: `${reworkRate}% rework means you are re-doing completed tasks. Use Push to QA before marking work done.`,
            leanPrinciple: 'Quality at source — fix root causes, not symptoms.'
        });
    } else if (reworkRate > 8) {
        hints.push({
            severity: 'warning',
            headline: 'Rework accumulating',
            detail: `${reworkRate}% rework rate. Push pending floor tasks to QA before ending the day.`,
        });
    }

    // Hoist slots
    if (hoistSlots < 2) {
        hints.push({
            severity: 'warning',
            headline: 'Hoist capacity low',
            detail: `Only ${hoistSlots} hoist slot(s) available. Consider adding a JIT slot to prevent material starvation on upper floors.`,
            leanPrinciple: 'Just-In-Time — ensure the right resource is available exactly when needed.'
        });
    }

    // Day-based narrative hint
    if (day === 1) {
        hints.push({
            severity: 'info',
            headline: 'Day 1 — Establish the baseline',
            detail: 'Start by scheduling at least one night hoist run. Do not move floor tasks until materials are confirmed.',
        });
    } else if (day === 6) {
        hints.push({
            severity: 'info',
            headline: 'Mid-programme checkpoint',
            detail: 'You are at the halfway point. Review PDI and rework trends — small corrections now avoid cascading problems in the final days.',
        });
    } else if (day >= 10) {
        hints.push({
            severity: 'info',
            headline: 'Final stretch — stabilise flow',
            detail: 'With 2–3 days left, avoid opening new work. Focus on clearing in-progress tasks and reducing rework to below 10%.',
        });
    }

    return hints.slice(0, 3); // Max 3 hints at once
}

// ─── CS2 Advisor Logic ──────────────────────────────────────────────────────
function getCS2Hints(day: number, trafficImpact: number): Hint[] {
    const hints: Hint[] = [];

    if (trafficImpact > 60) {
        hints.push({
            severity: 'critical',
            headline: 'Traffic impact critical!',
            detail: `${trafficImpact}% disruption — you have too many simultaneous work zones. Pause the lowest-priority segment and let it buffer before re-opening.`,
            leanPrinciple: 'WIP Limit — never open more work zones than you can sustain with your truck capacity.'
        });
    } else if (trafficImpact > 35) {
        hints.push({
            severity: 'warning',
            headline: 'Traffic disruption building up',
            detail: `Impact at ${trafficImpact}%. Limit active segments to 3 maximum, and ensure each has at least 2 days of buffered materials.`,
        });
    } else {
        hints.push({
            severity: 'good',
            headline: 'Traffic is flowing well',
            detail: `Impact at ${trafficImpact}% — manageable. This is a great time to open the next priority segment.`,
        });
    }

    if (day === 1) {
        hints.push({
            severity: 'info',
            headline: 'Day 1 — Start with S1 and S2',
            detail: 'Open Segments 1 and 2 first. Dispatch trucks to both. Do not open S3 until S1 is at least 50% complete.',
        });
    } else if (day === 7) {
        hints.push({
            severity: 'info',
            headline: 'Week 2 — check buffer levels',
            detail: 'Halfway through. Inspect every active segment buffer — if any is below 5m, it risks starvation. Dispatch trucks before ending the day.',
            leanPrinciple: 'Buffer sizing: protect against variability without creating waste.'
        });
    } else if (day >= 11) {
        hints.push({
            severity: 'info',
            headline: 'Final days — close completed segments',
            detail: 'Complete any segments above 90% first. Do not open new ones unless you have truck capacity to sustain them to 100%.',
        });
    }

    return hints.slice(0, 3);
}

// ─── Main Component ─────────────────────────────────────────────────────────
interface CaseSmartAdvisorProps {
    caseId: 1 | 2;
    objective?: string;
    accentColor?: 'purple' | 'cyan';
}

export function CaseSmartAdvisor({ caseId, objective, accentColor = 'purple' }: CaseSmartAdvisorProps) {
    const { day, pdi = 0, reworkRate = 0, hoistSlots = 2, trafficImpact = 0 } = useGameStore();
    const [expanded, setExpanded] = useState(true);

    const hints = useMemo(
        () => caseId === 1
            ? getCS1Hints(day, pdi, reworkRate, hoistSlots)
            : getCS2Hints(day, trafficImpact),
        [caseId, day, pdi, reworkRate, hoistSlots, trafficImpact]
    );

    const topHint = hints[0];
    const isUrgent = topHint?.severity === 'critical' || topHint?.severity === 'warning';

    const accentClass = accentColor === 'cyan' ? 'border-cyan-500/30' : 'border-purple-500/30';
    const accentText = accentColor === 'cyan' ? 'text-cyan-400' : 'text-purple-400';
    const accentBg = accentColor === 'cyan' ? 'bg-cyan-900/10' : 'bg-purple-900/10';

    return (
        <div className={`relative z-10 mx-4 lg:mx-6 my-3 rounded-2xl border ${accentClass} ${accentBg} backdrop-blur-sm overflow-hidden`}>
            {/* Objective Banner */}
            {objective && (
                <div className={`px-4 py-2 border-b ${accentClass} flex items-center gap-2`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${accentColor === 'cyan' ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                    <p className={`text-xs font-bold ${accentText} leading-tight`}>
                        <span className="text-slate-500 font-normal uppercase tracking-widest text-[10px] mr-2">Objective</span>
                        {objective}
                    </p>
                </div>
            )}

            {/* Advisor Header */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <div className={`${isUrgent ? 'animate-pulse' : ''} ${topHint ? SEVERITY_CONFIG[topHint.severity].color : accentText}`}>
                        <Lightbulb className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                        Smart Advisor
                    </span>
                    {isUrgent && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${topHint?.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            {topHint?.severity === 'critical' ? '⚠ Action Required' : 'Heads Up'}
                        </span>
                    )}
                </div>
                {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Hints */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-2">
                            {hints.map((hint, i) => {
                                const cfg = SEVERITY_CONFIG[hint.severity];
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.07 }}
                                        className={`rounded-xl p-3 border ${cfg.border} ${cfg.bg}`}
                                    >
                                        <div className={`flex items-center gap-2 ${cfg.color} font-black text-xs mb-1`}>
                                            {cfg.icon}
                                            {hint.headline}
                                        </div>
                                        <p className="text-slate-300 text-[11px] leading-relaxed">
                                            {hint.detail}
                                        </p>
                                        {hint.leanPrinciple && (
                                            <p className="text-slate-500 text-[10px] italic mt-1.5 border-t border-slate-700/50 pt-1.5">
                                                💡 {hint.leanPrinciple}
                                            </p>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
