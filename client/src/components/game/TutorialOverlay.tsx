import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ChevronRight, Ban, ArrowRight, Gauge, ClipboardList } from 'lucide-react';
import soundManager from '@/lib/soundManager';

const TOOLTIP_MARGIN = 12;

function clampToViewport(
    style: { top?: number; bottom?: number; left?: number; right?: number },
    tooltipW: number,
    tooltipH: number
): React.CSSProperties {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const result: React.CSSProperties = {};

    if (style.top !== undefined) {
        result.top = Math.max(TOOLTIP_MARGIN, Math.min(style.top, vh - tooltipH - TOOLTIP_MARGIN));
    }
    if (style.bottom !== undefined) {
        result.bottom = Math.max(TOOLTIP_MARGIN, Math.min(style.bottom, vh - tooltipH - TOOLTIP_MARGIN));
    }
    if (style.left !== undefined) {
        result.left = Math.max(TOOLTIP_MARGIN, Math.min(style.left, vw - tooltipW - TOOLTIP_MARGIN));
    }
    if (style.right !== undefined) {
        result.right = Math.max(TOOLTIP_MARGIN, Math.min(style.right, vw - tooltipW - TOOLTIP_MARGIN));
    }

    return result;
}

interface Props {
    showKanban: boolean;
}

export const TutorialOverlay: React.FC<Props> = ({ showKanban }) => {
    const { chapter, day, flags, tutorialStep, tutorialActive, completeTutorial, setTutorialStep, setFlag } = useGameStore();
    const [spotlightPos, setSpotlightPos] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
    // Below md, KanbanBoard swaps drag-and-drop for tap-to-select + tap-destination
    // (nested-scroll drag is unsupported/flaky on touch) - mirror that in the copy.
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (!tutorialActive) return;

        let animationFrameId: number;

        const updateSpotlight = () => {
            let targetId = '';
            if (tutorialStep === 0 || tutorialStep === 1) targetId = 'btn-project-sheet';
            if (tutorialStep === 1.2) targetId = 'btn-close-project-sheet';
            if (tutorialStep === 1.5) targetId = 'btn-kanban';
            if (tutorialStep === 2) targetId = 'col-backlog';
            // Was 'col-ready', which does not exist: chapter 1 renders backlog/doing/done only.
            // The step teaches crew capacity, so it belongs on the In Progress column.
            if (tutorialStep === 3) targetId = 'col-doing';
            if (tutorialStep === 4) targetId = 'col-doing';
            if (tutorialStep === 5) targetId = 'col-doing';
            if (tutorialStep === 6) targetId = 'smart-advisor-box';
            if (tutorialStep === 7) targetId = 'stats-box';
            if (tutorialStep === 8) targetId = 'lives-box';
            if (tutorialStep === 9) targetId = 'btn-save';

            if (tutorialStep === 20) targetId = 'pull-board-title';
            if (tutorialStep === 21) targetId = 'tutorial-wip-limits';
            if (tutorialStep === 22) targetId = 'jit-scheduler-title';
            if (tutorialStep === 23) targetId = 'tutorial-jit-scheduler';
            if (tutorialStep === 24) targetId = 'button-end-day-ch4';

            if (targetId) {
                const el = document.getElementById(targetId);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const newPos = {
                        x: rect.left - 10,
                        y: rect.top - 10,
                        w: rect.width + 20,
                        h: rect.height + 20
                    };

                    setSpotlightPos(prev => {
                        if (prev && Math.abs(prev.x - newPos.x) < 1 && Math.abs(prev.y - newPos.y) < 1 && Math.abs(prev.w - newPos.w) < 1 && Math.abs(prev.h - newPos.h) < 1) {
                            return prev;
                        }
                        return newPos;
                    });
                } else {
                    // Previously this branch did nothing, so a step whose target was missing kept
                    // the *previous* step's rectangle — the spotlight and its tooltip stayed
                    // anchored to the wrong element instead of the one being described. Clearing
                    // is the honest failure mode, and it is loud in dev so missing ids get fixed.
                    if (import.meta.env.DEV) {
                        console.warn(`[Tutorial] step ${tutorialStep}: no element with id "${targetId}" — spotlight cleared.`);
                    }
                    setSpotlightPos(prev => (prev ? null : prev));
                }
            } else {
                setSpotlightPos(prev => prev ? null : prev);
            }

            animationFrameId = requestAnimationFrame(updateSpotlight);
        };

        updateSpotlight();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [tutorialStep, tutorialActive, showKanban]);


    if (!tutorialActive || tutorialStep === 0 || (chapter === 1 && day === 1 && !flags['master_plan_seen'])) return null;

    const RADIUS = 14;

    /**
     * Dim path with a rounded cut-out for the target. Rounded corners plus the soft feather and
     * pulsing ring below turn the previous hard rectangular hole into something that actually
     * reads as a spotlight on the element being described.
     */
    const getMaskPath = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const outer = `M0 0 H${vw} V${vh} H0 Z`;
        if (!spotlightPos) return outer;
        const { x, y, w, h } = spotlightPos;
        const r = Math.max(0, Math.min(RADIUS, w / 2, h / 2));
        const hole =
            `M${x + r} ${y}` +
            `H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r}` +
            `V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
            `H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
            `V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
        return `${outer} ${hole}`;
    };

    return (
        <div className="absolute inset-0 z-[70] pointer-events-none overflow-hidden text-white font-bold text-shadow-lg">

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    {/* Feathers the cut-out edge so the dim layer falls off gradually. */}
                    <filter id="tut-feather" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" />
                    </filter>
                </defs>
                <path
                    d={getMaskPath()}
                    fill="rgba(2,6,23,0.72)"
                    fillRule="evenodd"
                    filter={spotlightPos ? 'url(#tut-feather)' : undefined}
                />
            </svg>

            {/* Pulsing ring around the spotlit element, so the eye is drawn to the target itself
                rather than just to a gap in the dimming. */}
            {spotlightPos && (
                <motion.div
                    className="absolute rounded-2xl pointer-events-none"
                    style={{
                        left: spotlightPos.x,
                        top: spotlightPos.y,
                        width: spotlightPos.w,
                        height: spotlightPos.h,
                    }}
                    animate={{
                        boxShadow: [
                            '0 0 0 2px rgba(34,211,238,0.85), 0 0 22px 4px rgba(34,211,238,0.30)',
                            '0 0 0 3px rgba(34,211,238,1), 0 0 40px 10px rgba(34,211,238,0.50)',
                            '0 0 0 2px rgba(34,211,238,0.85), 0 0 22px 4px rgba(34,211,238,0.30)',
                        ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}

            <AnimatePresence>

                {/* Step 1: Open Project Sheet */}
                {tutorialStep === 1 && !showKanban && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        style={clampToViewport({ top: spotlightPos.y - 100, left: spotlightPos.x - 120 }, 320, 100)}
                        className="absolute flex flex-col items-center gap-2 z-[90] pointer-events-none"
                    >
                        <div className="bg-blue-600 px-4 py-2 rounded-xl text-sm shadow-xl text-center font-bold border-2 border-white pointer-events-auto">
                            Check the <b>Project Status</b><br />before starting work!
                        </div>
                        <ArrowDown className="w-8 h-8 text-blue-400 animate-bounce" />
                    </motion.div>
                )}

                {/* Step 1.2: Close Project Sheet (Reading) */}
                {tutorialStep === 1.2 && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        style={clampToViewport({ top: spotlightPos.y - 120, left: spotlightPos.x }, 320, 120)}
                        className="absolute z-[90] w-72 pointer-events-none"
                    >
                        <div className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                            <p className="font-bold text-lg mb-1 flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Project Sheet</p>
                            <p className="text-sm font-medium">Review your tasks, tracking <b>costs and overruns</b> (in red). You can also see the core materials required.<br/><br/>Close this window when done.</p>
                        </div>
                    </motion.div>
                )}

                {/* Step 1.5: Open Kanban */}
                {tutorialStep === 1.5 && !showKanban && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        style={clampToViewport({ top: spotlightPos.y + 20, left: spotlightPos.x - 320 }, 360, 80)}
                        className="absolute flex items-center gap-4 z-[90] pointer-events-none"
                    >
                        <div className="bg-cyan-600 px-4 py-2 rounded-xl text-lg shadow-xl text-right font-bold border-2 border-white pointer-events-auto">
                            Click here to open<br />the <b>Construction Site!</b>
                        </div>
                        <ArrowRight className="w-10 h-10 text-cyan-400 animate-bounce-horizontal" />
                    </motion.div>
                )}

                {/* Board Open - Guidance (Steps 2-4) */}
                {showKanban && spotlightPos && (
                    <>
                        {/* Step 2: Backlog -> In Progress */}
                        {tutorialStep === 2 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={clampToViewport({ top: spotlightPos.y - 100, left: spotlightPos.x }, 256, 160)}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="flex justify-center mb-2">
                                    <ArrowDown className="w-12 h-12 text-orange-400 animate-bounce" />
                                </div>
                                <div className="bg-orange-500 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                    <p className="font-bold text-lg">Step 1: DISPATCH</p>
                                    <p className="text-sm">{isMobile ? <><b>Tap</b> a task in the Backlog, then <b>tap</b> In Progress to start building it.</> : <><b>Drag</b> a task from the Backlog to <b>In Progress</b> to start building it.</>}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Parallel Logic */}
                        {tutorialStep === 3 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={clampToViewport({ top: spotlightPos.y - 120, left: spotlightPos.x }, 256, 180)}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="flex justify-center mb-2">
                                    <ArrowDown className="w-12 h-12 text-purple-400 animate-bounce" />
                                </div>
                                <div className="bg-purple-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                    <p className="font-bold text-lg">Step 2: CREW CAPACITY</p>
                                    <p className="text-sm">This board represents one crew's capacity. Real sites run many crews in parallel — but each crew shouldn't juggle more than a few active tasks at once, or quality and speed both suffer.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Doing -> Done */}
                        {tutorialStep === 4 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={clampToViewport({ top: spotlightPos.y - 120, left: spotlightPos.x }, 256, 180)}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="flex justify-center mb-2">
                                    <ArrowDown className="w-12 h-12 text-green-400 animate-bounce" />
                                </div>
                                <div className="bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                    <p className="font-bold text-lg">Step 3: HANDOVER</p>
                                    <p className="text-sm">{isMobile ? <><b>Tap</b> a finished task, then <b>tap</b> Completed to advance the schedule!</> : <><b>Drag</b> finished works to <b>Completed</b> to advance the schedule!</>} <br />(Increases Efficiency)</p>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

                {/* Step 5: Cost & Constraints - centered on screen */}
                {tutorialStep === 5 && showKanban && (
                    <div className="absolute inset-0 flex items-center justify-center z-[90] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="w-80 pointer-events-auto"
                        >
                            <div className="bg-slate-900 text-slate-200 px-5 py-4 rounded-xl shadow-2xl border-4 border-cyan-500 relative">
                                <h3 className="font-black text-cyan-400 text-lg mb-1 flex items-center gap-2">
                                    <Gauge className="w-5 h-5" /> Managing Chaos (Lean 101)
                                </h3>
                                <ul className="text-sm font-medium mb-3 space-y-2 leading-snug text-slate-300">
                                    <li>
                                        In real life, <b>multiple crews</b> work at the same time. You decide how many!
                                    </li>
                                    <li>
                                        But beware: Every time you start a task, you <b>deduct money (Activation Cost)</b> and consume physical materials!
                                    </li>
                                    <li>
                                        <b>Don't start everything at once.</b> Construction is not sequential; you <i>should</i> work in parallel! However, if you exceed your crew's <b>WIP Limit (Work-In-Progress)</b>, flow stalls and you'll run out of money before finishing. Your <b>Efficiency score</b> measures finishing things, not just starting them!
                                    </li>
                                </ul>
                                <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-cyan-300 mb-3">
                                    <b>The Secret:</b> Focus on finishing what you start! Accumulating unfinished tasks drives up your overhead and destroys your efficiency score!
                                </div>
                                <button
                                    onClick={() => setTutorialStep(6)}
                                    className="bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold w-full hover:bg-cyan-700 transition-colors"
                                    data-testid="button-tutorial-wip-next"
                                >
                                    Next: Smart Advisor
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Step 6: Smart Advisor Spotlight */}
                {tutorialStep === 6 && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={clampToViewport({ top: spotlightPos.y + spotlightPos.h + 20, left: spotlightPos.x }, 288, 200)}
                        className="absolute z-[90] w-72 pointer-events-auto"
                    >
                        <div className="bg-slate-900 text-slate-200 px-5 py-4 rounded-xl shadow-2xl border-4 border-blue-500 relative">
                            <div className="absolute -top-3 left-6 w-6 h-6 bg-slate-900 border-t-4 border-l-4 border-blue-500 transform rotate-45"></div>
                            <h3 className="font-black text-blue-400 text-lg mb-1">Smart Advisor</h3>
                            <p className="text-sm font-medium mb-3 leading-snug text-slate-300">
                                Always check here! I will warn you about <b>Bottlenecks</b> (Too much WIP) and <b>Starvation</b> (Idle workers).
                            </p>
                            <button
                                onClick={() => setTutorialStep(7)}
                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold w-full hover:bg-blue-500 transition-colors"
                            >
                                Next: Stats
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 7: Funds & Morale */}
                {tutorialStep === 7 && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={clampToViewport({ top: spotlightPos.y + spotlightPos.h + 20, left: spotlightPos.x }, 288, 280)}
                        className="absolute z-[90] w-72 pointer-events-auto"
                    >
                        <div className="bg-slate-900 text-slate-200 px-5 py-4 rounded-xl shadow-2xl border-4 border-green-500 relative">
                            <div className="absolute -top-3 left-6 w-6 h-6 bg-slate-900 border-t-4 border-l-4 border-green-500 transform rotate-45"></div>
                            <h3 className="font-black text-green-400 text-lg mb-1">Project Health</h3>
                            <ul className="text-sm font-medium mb-3 space-y-2 text-slate-300">
                                <li><b>Funds</b>: Starting a task costs money up front. You are only paid back — with a margin — when it reaches <b>Completed</b>. Every day also charges overhead, so unfinished work bleeds cash.</li>
                                <li><b>Morale</b>: <span className="text-red-400">Drops</span> when you exceed your crew's WIP limit, leave waste in Completed, or push unready work.</li>
                                <li><b>% Complete</b>: Rises only as tasks reach Completed — starting work moves it not at all.</li>
                            </ul>
                            <button
                                onClick={() => setTutorialStep(8)}
                                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold w-full hover:bg-green-500 transition-colors"
                            >
                                Next: Project Health
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 8: Lives (Hearts) (Bottom Bar - Tooltip Above) */}
                {tutorialStep === 8 && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={clampToViewport({ bottom: window.innerHeight - spotlightPos.y + 20, left: spotlightPos.x - 100 }, 288, 220)}
                        className="absolute z-[90] w-72 pointer-events-auto"
                    >
                        <div className="bg-slate-900 text-slate-200 px-5 py-4 rounded-xl shadow-2xl border-4 border-rose-500 relative">
                            {/* Arrow pointing DOWN */}
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-rose-500 animate-bounce"></div>
                            </div>

                            <h3 className="font-black text-rose-400 text-lg mb-1">Project Health</h3>
                            <p className="text-sm font-medium mb-3 leading-snug text-slate-300">
                                You have <b>3 Lives</b> <span className="text-rose-400">♥♥♥</span>. <br />
                                If your <b>Funds</b> drop below zero, or your <b>Morale</b> crashes, you lose a life. Lose all 3, and it's Game Over!
                            </p>
                            <button
                                onClick={() => setTutorialStep(9)}
                                className="bg-rose-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold w-full hover:bg-rose-500 transition-colors"
                            >
                                Next: Saving
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 9: Settings & Save (Bottom Bar - Tooltip Below) */}
                {tutorialStep === 9 && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={clampToViewport({ top: spotlightPos.y + spotlightPos.h + 20, left: spotlightPos.x - 150 }, 288, 280)}
                        className="absolute z-[90] w-72 pointer-events-auto"
                    >
                        <div className="bg-slate-900 text-slate-200 px-5 py-4 rounded-xl shadow-2xl border-4 border-purple-500 relative">
                            {/* Arrow pointing UP */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-purple-500 animate-bounce"></div>
                            </div>

                            <h3 className="font-black text-purple-400 text-lg mb-1">Save Your Progress</h3>
                            <p className="text-sm font-medium mb-3 leading-snug text-slate-300">
                                Click the <b>Save</b> icon to manually save your game to the cloud. <br /><br />
                                <span className="text-cyan-400">⚡ Auto-Save:</span> The game will also automatically save at the end of every day! <br /><br />
                                You'll need to <b>Login</b> or <b>Register</b> to keep your progress safe.
                            </p>
                            <button
                                onClick={() => setTutorialStep(10)}
                                className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold w-full hover:bg-purple-500 transition-colors"
                            >
                                Finish Tutorial
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 10: Complete */}
                {tutorialStep === 10 && chapter === 1 && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto z-[90]"
                    >
                        <div className="bg-slate-900 text-slate-200 px-8 py-6 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.2)] text-center border border-yellow-500/50 max-w-md">
                            <h2 className="text-3xl font-black mb-2 text-yellow-400">Great Job!</h2>
                            <p className="mb-4 font-medium text-slate-300">You've learned the flow of work! <br /> Respect WIP limits to keep the workers happy and efficiency high.</p>
                            <button
                                onClick={() => completeTutorial()}
                                className="bg-yellow-500 text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition-colors shadow-lg"
                                data-testid="button-tutorial-complete"
                            >
                                Close Tutorial
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* --- CHAPTER 2: PLANNING ROOM TUTORIAL --- */}

                {/* Step 10: Lookahead Window (Red/Green) */}
                {tutorialStep === 10 && chapter === 2 && (
                    <div className="absolute z-[90] w-72 max-w-[calc(100vw-24px)] pointer-events-auto" style={clampToViewport({ top: 80, right: 80 }, 288, 200)}>
                        <div className="bg-blue-900 text-white px-5 py-4 rounded-xl shadow-2xl border-2 border-blue-400">
                            <h3 className="font-bold text-blue-300 text-lg mb-1">Lookahead Window</h3>
                            <p className="text-sm mb-3">
                                Tasks here are <b>planned</b> but not yet ready. <br />
                                <span className="text-red-400 font-bold">RED Icons</span> = Constraints (Blocked). <br />
                                <span className="text-green-400 font-bold">GREEN</span> = Ready to Commit.
                            </p>
                            <button
                                onClick={() => setTutorialStep(11)}
                                className="bg-blue-500 w-full py-1 rounded text-sm font-bold"
                            >
                                Next: Fix Constraints
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 11: Removing Constraints */}
                {tutorialStep === 11 && chapter === 2 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-80 pointer-events-auto">
                        <div className="bg-red-900 text-white px-5 py-4 rounded-xl shadow-2xl border-2 border-red-500">
                            <h3 className="font-bold text-red-300 text-lg mb-1 flex items-center gap-2"><Ban className="w-5 h-5" /> Remove Constraints!</h3>
                            <p className="text-sm mb-3">
                                You cannot do work with missing materials or approvals! <br />
                                Click the <span className="text-xs bg-red-700 px-1 rounded border border-red-500">Fix</span> button on a task to pay for removal.
                            </p>
                            <button
                                onClick={() => setTutorialStep(12)}
                                className="bg-red-500 w-full py-1 rounded text-sm font-bold"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 12: Weekly Commitment */}
                {tutorialStep === 12 && chapter === 2 && (
                    <div className="absolute z-[90] w-72 max-w-[calc(100vw-24px)] pointer-events-auto" style={clampToViewport({ bottom: 80, right: 80 }, 288, 200)}>
                        <div className="bg-green-900 text-white px-5 py-4 rounded-xl shadow-2xl border-2 border-green-500">
                            <h3 className="font-bold text-green-300 text-lg mb-1">The Weekly Promise</h3>
                            <p className="text-sm mb-3">
                                Only commit to tasks that are <b>Sound</b> (Green). <br />
                                If you commit to Red tasks, they will likely fail and hurt Morale!
                            </p>
                            <button
                                onClick={() => {
                                    setTutorialStep(99);
                                    setFlag('tutorial_planning_complete', true);
                                }}
                                className="bg-green-500 w-full py-1 rounded text-sm font-bold"
                            >
                                Let's Plan!
                            </button>
                        </div>
                    </div>
                )}

                {/* --- CHAPTER 4: PULL & JIT TUTORIAL --- */}

                {/* Step 20: Pull Board WIP Limits */}
                {tutorialStep === 20 && chapter === 4 && (
                    <div className="absolute z-[90] w-80 max-w-[calc(100vw-24px)] pointer-events-auto" style={clampToViewport({ top: 80, left: 80 }, 320, 260)}>
                        <div className="bg-indigo-900 text-white px-5 py-4 rounded-xl shadow-2xl border-2 border-indigo-400 relative">
                            <h3 className="font-bold text-indigo-300 text-lg mb-2">Welcome to Pull Systems</h3>
                            <p className="text-sm mb-3">
                                You are now in a <b>Pull System</b>. Unlike Chapters 1-3, you don't drag tasks on a board.<br /><br />
                                Instead, you manage <b>WIP Limits</b>, <b>material deliveries</b>, and <b>safety buffers</b> across three panels.
                            </p>
                            <div className="text-[10px] text-indigo-300/70 mb-3 font-bold uppercase tracking-widest">Step 1 of 5</div>
                            <button
                                onClick={() => setTutorialStep(21)}
                                className="bg-indigo-500 w-full py-2 rounded text-sm font-bold shadow-lg"
                            >
                                Next: WIP Limits
                            </button>
                        </div>
                    </div>
                )}

                {tutorialStep === 21 && chapter === 4 && (
                    <div className="absolute z-[90] w-80 max-w-[calc(100vw-24px)] pointer-events-auto" style={clampToViewport({ top: 200, left: 80 }, 320, 280)}>
                        <div className="bg-indigo-900 text-white px-5 py-4 rounded-xl shadow-2xl border-2 border-indigo-400 relative">
                            <h3 className="font-bold text-indigo-300 text-lg mb-2">Trade WIP Limits</h3>
                            <p className="text-sm mb-3">
                                Each trade (Carpentry, Finishing, Electrical) has a <b>WIP Limit</b> slider.<br /><br />
                                <b>Low limits</b> = less congestion, better flow.<br />
                                <b>High limits</b> = more work in progress, risk of overcrowding.
                            </p>
                            <div className="text-[10px] text-indigo-300/70 mb-3 font-bold uppercase tracking-widest">Step 2 of 5</div>
                            <button
                                onClick={() => setTutorialStep(22)}
                                className="bg-indigo-500 w-full py-2 rounded text-sm font-bold shadow-lg"
                            >
                                Next: JIT Scheduler
                            </button>
                        </div>
                    </div>
                )}

                {tutorialStep === 22 && chapter === 4 && (
                    <div className="absolute z-[90] w-80 max-w-[calc(100vw-24px)] pointer-events-auto" style={clampToViewport({ top: 80, right: 370 }, 320, 280)}>
                        <div className="bg-emerald-900 text-white px-5 py-4 rounded-xl shadow-2xl border-2 border-emerald-400 relative">
                            <h3 className="font-bold text-emerald-300 text-lg mb-2">JIT Scheduler</h3>
                            <p className="text-sm mb-3">
                                As trades pull work, they consume materials. You must order deliveries <b>Just-In-Time</b> to arrive before they run out!<br /><br />
                                Use the Scheduler panel to dispatch material trucks.
                            </p>
                            <div className="text-[10px] text-emerald-300/70 mb-3 font-bold uppercase tracking-widest">Step 3 of 5</div>
                            <button
                                onClick={() => setTutorialStep(23)}
                                className="bg-emerald-500 w-full py-2 rounded text-sm font-bold shadow-lg"
                            >
                                Next: Safety Buffers
                            </button>
                        </div>
                    </div>
                )}

                {tutorialStep === 23 && chapter === 4 && (
                    <div className="absolute z-[90] w-80 max-w-[calc(100vw-24px)] pointer-events-auto" style={clampToViewport({ top: 200, right: 370 }, 320, 280)}>
                        <div className="bg-emerald-900 text-white px-5 py-4 rounded-xl shadow-2xl border-2 border-emerald-400 relative">
                            <h3 className="font-bold text-emerald-300 text-lg mb-2">Safety Buffers</h3>
                            <p className="text-sm mb-3">
                                Set a <b>Safety Buffer</b> for each material to ensure you always have minimum stock on site.<br /><br />
                                But watch out — large buffers waste money and space. Balance protection vs. lean inventory.
                            </p>
                            <div className="text-[10px] text-emerald-300/70 mb-3 font-bold uppercase tracking-widest">Step 4 of 5</div>
                            <button
                                onClick={() => setTutorialStep(24)}
                                className="bg-emerald-500 w-full py-2 rounded text-sm font-bold shadow-lg"
                            >
                                Next: End Day
                            </button>
                        </div>
                    </div>
                )}

                {tutorialStep === 24 && chapter === 4 && (
                    <div className="absolute z-[90] w-80 max-w-[calc(100vw-24px)] pointer-events-auto" style={clampToViewport({ top: 20, right: 30 }, 320, 260)}>
                        <div className="bg-cyan-900 text-white px-5 py-4 rounded-xl shadow-2xl border-2 border-cyan-400 relative">
                            <h3 className="font-bold text-cyan-300 text-lg mb-2">End Day</h3>
                            <p className="text-sm mb-3">
                                When you've set your WIP limits and scheduled deliveries, press <b>End Day</b> to advance.<br /><br />
                                Deliveries arrive, materials get consumed, and you'll face decisions on Days 2-4. Good luck!
                            </p>
                            <div className="text-[10px] text-cyan-300/70 mb-3 font-bold uppercase tracking-widest">Step 5 of 5</div>
                            <button
                                onClick={() => {
                                    completeTutorial();
                                    setFlag('chapter4_tutorial_seen', true);
                                    useGameStore.setState({ phase: 'action' });
                                    soundManager.playSFX('success');
                                }}
                                className="bg-cyan-500 w-full py-2 rounded text-sm font-bold shadow-lg"
                            >
                                Begin Day 1
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
