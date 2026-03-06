import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
    ArrowUpCircle, Building2, Clock, CheckCircle2, ChevronRight,
    Route, Truck, Layers, X, BookOpen, Zap
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────
interface TutorialStep {
    icon: React.ReactNode;
    title: string;
    body: string;
    tip?: string;
    color: string; // tailwind color key (e.g. "purple", "cyan")
}

interface CaseTutorialOverlayProps {
    caseId: 1 | 2;
}

// ─── Case Study 1 Steps ──────────────────────────────────────────────────
const CS1_STEPS: TutorialStep[] = [
    {
        icon: <Building2 className="w-8 h-8" />,
        title: "Welcome to Terminal T-Upgrade",
        body: "You are the Flow Architect for a midfield terminal expansion. Your job is to sequence construction work across 3 levels, use hoists efficiently, and minimize passenger disruption over 12 simulated days.",
        color: "purple"
    },
    {
        icon: <ArrowUpCircle className="w-8 h-8" />,
        title: "Hoist Scheduler",
        body: "The two freight elevators are your critical shared resource. Choose between a Dedicated Night Run (reduces PDI) or adding a JIT Slot (adds hoist capacity).\n\nEach action has trade-offs — night runs reduce passenger disruption but cost more.\nJIT slots speed up supply flow but add congestion risk.",
        tip: "🏗️ Lean Principle: Shared resources should be scheduled to prevent bottlenecks. Never let a hoist sit idle.",
        color: "purple"
    },
    {
        icon: <Layers className="w-8 h-8" />,
        title: "Floor Kanban",
        body: "Each row in the Floor Kanban represents a live task on a construction level. Use the action buttons to:\n• Push to QA → reduces rework rate\n• Expedite → fast-tracks delivery at the cost of an extra day\n• Mark Material Arrived → unlocks the next task on that floor",
        tip: "📋 Only push tasks when constraints are cleared. Pushing mid-constraint creates rework!",
        color: "indigo"
    },
    {
        icon: <Clock className="w-8 h-8" />,
        title: "End Day & Day Timeline",
        body: "Click End Day when you have made your decisions for the day. The timeline bar at the bottom shows your progress across the 12-day programme.\n\nThe goal: reach Day 12 with PDI under 20% and Rework Rate under 10%.",
        tip: "⏱️ Don't rush! Each decision carries over to the next day. Plan ahead.",
        color: "violet"
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Your First Shift: Guided Actions",
        body: "To get started on Day 1, try these specific actions:\n1. Click **Dedicated Night Run** in the Hoist Scheduler to clear the morning backlog.\n2. In the Floor Kanban, click **Push to QA** for the L2 Security task to prevent rework.\n3. Then, click **End Day** to see your first results.",
        tip: "💡 This initial sequence sets a stable baseline for the terminal expansion.",
        color: "amber"
    },
    {
        icon: <CheckCircle2 className="w-8 h-8" />,
        title: "You're Ready!",
        body: "Watch your 3 key metrics in the top bar:\n• Hoist Slots — how many elevator runs you have scheduled\n• Passenger Disruption Index (PDI) — keep it low!\n• Rework Rate — bad quality compounds daily\n\nGood luck, Architect. Terminal T-Upgrade begins now.",
        color: "emerald"
    }
];

// ─── Case Study 2 Steps ──────────────────────────────────────────────────
const CS2_STEPS: TutorialStep[] = [
    {
        icon: <Route className="w-8 h-8" />,
        title: "Welcome to Coastal Link Rehab",
        body: "You are the Flow Architect for a coastal highway rehabilitation across 8 segments (S1–S8). You must coordinate trucks, set staging buffers, and manage live traffic over 14 simulated days.",
        color: "cyan"
    },
    {
        icon: <Truck className="w-8 h-8" />,
        title: "Logistics Dispatch",
        body: "Your segment map shows each highway section. Click Dispatch Trucks to move materials to the highest-priority segments.\n\nEach segment has a Progress bar — fill it to 100% to complete rehabilitation of that section. Some segments are blocked until the previous one is cleared.",
        tip: "🚛 Lean Principle: Pull-based logistics — only dispatch when the downstream segment is ready to receive.",
        color: "cyan"
    },
    {
        icon: <Layers className="w-8 h-8" />,
        title: "Buffer Configuration",
        body: "Each active segment has a configurable staging buffer. Use the slider to set how many days of materials you keep on-site.\n\n• Too small → starvation risk (segment stops if trucks are delayed)\n• Too large → waste (excess materials block the road shoulder)",
        tip: "📦 Lean Principle: Right-sized buffers protect flow without creating waste.",
        color: "teal"
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Traffic Impact & End Day",
        body: "Every active segment creates traffic disruption. The Traffic Impact % climbs as you run more simultaneous work zones. Try to sequence segments to keep disruption under 30%.\n\nClick End Day when ready. Progress is locked in and the next day begins.",
        tip: "🚦 Never open more than 3 work zones at once unless you have enough buffers to sustain them.",
        color: "sky"
    },
    {
        icon: <Truck className="w-8 h-8" />,
        title: "Your First Shift: Guided Actions",
        body: "For Day 1, follow this logistics plan:\n1. Click **Dispatch Trucks** on the map for Segment 1 and Segment 2.\n2. Check **Buffers**—ensure S1 has at least 5m of materials to prevent starvation.\n3. Click **End Day** to lock in your supply run.",
        tip: "💡 Pull-based supply: only dispatch what the road can handle without causing gridlock.",
        color: "amber"
    },
    {
        icon: <CheckCircle2 className="w-8 h-8" />,
        title: "You're Ready!",
        body: "Monitor your key metrics at the top:\n• Active Segments — work zones currently open\n• Traffic Impact — keep it manageable\n• Trucks Dispatched — your supply rate\n\nComplete all 8 segments by Day 14. Good luck, Architect.",
        color: "emerald"
    }
];

// ─── Color Map ──────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { bg: string; border: string; text: string; btn: string; progress: string }> = {
    purple: { bg: 'bg-purple-900/20', border: 'border-purple-500/50', text: 'text-purple-300', btn: 'bg-purple-600 hover:bg-purple-500', progress: 'bg-purple-500' },
    indigo: { bg: 'bg-indigo-900/20', border: 'border-indigo-500/50', text: 'text-indigo-300', btn: 'bg-indigo-600 hover:bg-indigo-500', progress: 'bg-indigo-500' },
    violet: { bg: 'bg-violet-900/20', border: 'border-violet-500/50', text: 'text-violet-300', btn: 'bg-violet-600 hover:bg-violet-500', progress: 'bg-violet-500' },
    cyan: { bg: 'bg-cyan-900/20', border: 'border-cyan-500/50', text: 'text-cyan-300', btn: 'bg-cyan-600 hover:bg-cyan-500', progress: 'bg-cyan-500' },
    teal: { bg: 'bg-teal-900/20', border: 'border-teal-500/50', text: 'text-teal-300', btn: 'bg-teal-600 hover:bg-teal-500', progress: 'bg-teal-500' },
    sky: { bg: 'bg-sky-900/20', border: 'border-sky-500/50', text: 'text-sky-300', btn: 'bg-sky-600 hover:bg-sky-500', progress: 'bg-sky-500' },
    emerald: { bg: 'bg-emerald-900/20', border: 'border-emerald-500/50', text: 'text-emerald-300', btn: 'bg-emerald-600 hover:bg-emerald-500', progress: 'bg-emerald-500' },
};

// ─── Component ─────────────────────────────────────────────────────────
export function CaseTutorialOverlay({ caseId }: CaseTutorialOverlayProps) {
    const { flags, setFlag } = useGameStore();
    const [step, setStep] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    const steps = caseId === 1 ? CS1_STEPS : CS2_STEPS;
    const flagKey = `case${caseId}_tutorial_seen`;

    // Don't show if already seen this session OR dismissed
    if (flags[flagKey] || dismissed) return null;

    const current = steps[step];
    const colors = COLOR_MAP[current.color] ?? COLOR_MAP['purple'];
    const isLast = step === steps.length - 1;
    const progress = ((step + 1) / steps.length) * 100;

    const handleNext = () => {
        if (isLast) {
            setFlag(flagKey, true);
            setDismissed(true);
        } else {
            setStep(s => s + 1);
        }
    };

    const handleSkip = () => {
        setFlag(flagKey, true);
        setDismissed(true);
    };

    return (
        <div className="absolute inset-0 z-[80] flex items-center justify-center pointer-events-none">
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm pointer-events-auto" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.97 }}
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.45 }}
                    className={`relative pointer-events-auto w-full max-w-md mx-4 rounded-3xl border-2 ${colors.border} ${colors.bg} backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden`}
                >
                    {/* Top progress bar */}
                    <div className="h-1 w-full bg-slate-800/80">
                        <motion.div
                            className={`h-full ${colors.progress}`}
                            initial={{ width: `${((step) / steps.length) * 100}%` }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>

                    {/* Header */}
                    <div className="p-6 pb-0">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border} ${colors.text}`}>
                                    {current.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <BookOpen className="w-3 h-3 text-slate-500" />
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            Case Study {caseId} Tutorial • Step {step + 1}/{steps.length}
                                        </span>
                                    </div>
                                    <h2 className={`text-lg font-black ${colors.text} leading-tight`}>{current.title}</h2>
                                </div>
                            </div>
                            <button
                                onClick={handleSkip}
                                className="text-slate-600 hover:text-slate-400 transition-colors p-1"
                                title="Skip tutorial"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                            {current.body}
                        </p>

                        {current.tip && (
                            <div className={`rounded-xl p-3 border ${colors.border} ${colors.bg}`}>
                                <p className={`text-xs font-bold ${colors.text} leading-relaxed`}>
                                    {current.tip}
                                </p>
                            </div>
                        )}

                        {/* Step dots */}
                        <div className="flex items-center justify-center gap-1.5 pt-1">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? `w-6 ${colors.progress}` : i < step ? `w-3 ${colors.progress} opacity-40` : 'w-3 bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* CTA button */}
                        <button
                            onClick={handleNext}
                            className={`w-full flex items-center justify-center gap-2 ${colors.btn} text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg`}
                        >
                            {isLast ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Let's Go!
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        {!isLast && (
                            <button
                                onClick={handleSkip}
                                className="w-full text-slate-600 hover:text-slate-400 text-xs font-bold uppercase tracking-widest transition-colors py-1"
                            >
                                Skip Tutorial
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
