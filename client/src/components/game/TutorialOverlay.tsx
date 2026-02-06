import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ChevronRight, Ban, ArrowRight, Gauge } from 'lucide-react';

interface Props {
    showKanban: boolean;
}

export const TutorialOverlay: React.FC<Props> = ({ showKanban }) => {
    const { tutorialStep, tutorialActive, completeTutorial, setTutorialStep, setFlag } = useGameStore();
    const [spotlightPos, setSpotlightPos] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

    useEffect(() => {
        if (!tutorialActive) return;

        let animationFrameId: number;

        const updateSpotlight = () => {
            let targetId = '';
            if (tutorialStep === 0 || tutorialStep === 1) targetId = 'btn-kanban';
            if (tutorialStep === 2) targetId = 'col-backlog';
            if (tutorialStep === 3) targetId = 'col-ready';
            if (tutorialStep === 4) targetId = 'col-doing';
            if (tutorialStep === 5) targetId = 'col-doing';
            if (tutorialStep === 6) targetId = 'smart-advisor-box';
            if (tutorialStep === 7) targetId = 'stats-box';
            if (tutorialStep === 8) targetId = 'btn-settings';

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


    if (!tutorialActive || tutorialStep === 0) return null;

    const getMaskPath = () => {
        if (!spotlightPos) return "M0 0 h100% v100% h-100% z";
        const { x, y, w, h } = spotlightPos;
        return `
            M0 0 h${window.innerWidth} v${window.innerHeight} h-${window.innerWidth} z 
            M${x} ${y} v${h} h${w} v-${h} z
        `;
    };

    return (
        <div className="absolute inset-0 z-[70] pointer-events-none overflow-hidden text-white font-bold text-shadow-lg">

            <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
                <path d={getMaskPath()} fill="black" fillRule="evenodd" />
            </svg>

            <AnimatePresence>

                {/* Step 1: Open Board */}
                {tutorialStep === 1 && !showKanban && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        style={{ top: spotlightPos.y + 20, left: spotlightPos.x - 320 }}
                        className="absolute flex items-center gap-4"
                    >
                        <div className="bg-blue-600 px-4 py-2 rounded-xl text-lg shadow-xl text-right">
                            Click the Chart <br /> to open Kanban!
                        </div>
                        <ArrowRight className="w-10 h-10 text-blue-400 animate-bounce-horizontal" />
                    </motion.div>
                )}

                {/* Board Open - Guidance (Steps 2-4) */}
                {showKanban && spotlightPos && (
                    <>
                        {/* Step 2: Backlog -> Ready */}
                        {tutorialStep === 2 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ top: spotlightPos.y - 100, left: spotlightPos.x }}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="flex justify-center mb-2">
                                    <ArrowDown className="w-12 h-12 text-orange-400 animate-bounce" />
                                </div>
                                <div className="bg-orange-500 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                    <p className="font-bold text-lg">Step 1: PULL</p>
                                    <p className="text-sm"><b>Drag</b> a task from here to <b>Ready</b>.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Ready -> Doing */}
                        {tutorialStep === 3 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ top: spotlightPos.y - 120, left: spotlightPos.x }}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="flex justify-center mb-2">
                                    <ArrowDown className="w-12 h-12 text-purple-400 animate-bounce" />
                                </div>
                                <div className="bg-purple-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                    <p className="font-bold text-lg">Step 2: START</p>
                                    <p className="text-sm"><b>Drag</b> it to <b>Doing</b> to start work. <br />(Commits Materials)</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Doing -> Done */}
                        {tutorialStep === 4 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ top: spotlightPos.y - 120, left: spotlightPos.x }}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="flex justify-center mb-2">
                                    <ArrowDown className="w-12 h-12 text-green-400 animate-bounce" />
                                </div>
                                <div className="bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                    <p className="font-bold text-lg">Step 3: FINISH</p>
                                    <p className="text-sm"><b>Drag</b> it to <b>Done</b> to get Paid! <br />(Value Added)</p>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

                {/* Step 5: WIP Slider Explanation */}
                {tutorialStep === 5 && showKanban && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{ top: spotlightPos.y + spotlightPos.h + 20, left: spotlightPos.x }}
                        className="absolute z-[90] w-80 pointer-events-auto"
                    >
                        <div className="bg-white text-slate-800 px-5 py-4 rounded-xl shadow-2xl border-4 border-cyan-500 relative">
                            <div className="absolute -top-3 left-6 w-6 h-6 bg-white border-t-4 border-l-4 border-cyan-500 transform rotate-45"></div>
                            <h3 className="font-black text-cyan-600 text-lg mb-1 flex items-center gap-2">
                                <Gauge className="w-5 h-5" /> WIP Limit Slider
                            </h3>
                            <ul className="text-sm font-medium mb-3 space-y-2 leading-snug">
                                <li>
                                    Use the <b>+/-</b> buttons on the Doing column to set your <b>Work-In-Progress limit</b>.
                                </li>
                                <li>
                                    <b>Lower WIP</b> = fewer tasks at once, but faster flow and higher <span className="text-green-600 font-bold">Morale</span>.
                                </li>
                                <li>
                                    <b>Higher WIP</b> = more tasks at once, but risk overloading workers. <span className="text-red-500 font-bold">Morale drops -5</span> if you exceed it!
                                </li>
                                <li>
                                    Your <b>Flow Efficiency</b> is measured against this limit &mdash; it defines how many tasks you <i>could</i> complete each day.
                                </li>
                            </ul>
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2 text-xs text-cyan-800 mb-3">
                                <b>Lean Principle:</b> Limiting WIP prevents congestion and helps work flow smoothly &mdash; just like limiting cars on a highway reduces traffic jams.
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
                )}

                {/* Step 6: Smart Advisor Spotlight */}
                {tutorialStep === 6 && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{ top: spotlightPos.y + spotlightPos.h + 20, left: spotlightPos.x }}
                        className="absolute z-[90] w-72 pointer-events-auto"
                    >
                        <div className="bg-white text-slate-800 px-5 py-4 rounded-xl shadow-2xl border-4 border-blue-500 relative">
                            <div className="absolute -top-3 left-6 w-6 h-6 bg-white border-t-4 border-l-4 border-blue-500 transform rotate-45"></div>
                            <h3 className="font-black text-blue-600 text-lg mb-1">Smart Advisor</h3>
                            <p className="text-sm font-medium mb-3 leading-snug">
                                Always check here! I will warn you about <b>Bottlenecks</b> (Too much WIP) and <b>Starvation</b> (Idle workers).
                            </p>
                            <button
                                onClick={() => setTutorialStep(7)}
                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold w-full hover:bg-blue-700 transition-colors"
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
                        style={{ top: spotlightPos.y + spotlightPos.h + 20, left: spotlightPos.x }}
                        className="absolute z-[90] w-72 pointer-events-auto"
                    >
                        <div className="bg-white text-slate-800 px-5 py-4 rounded-xl shadow-2xl border-4 border-green-500 relative">
                            <div className="absolute -top-3 left-6 w-6 h-6 bg-white border-t-4 border-l-4 border-green-500 transform rotate-45"></div>
                            <h3 className="font-black text-green-600 text-lg mb-1">Project Health</h3>
                            <ul className="text-sm font-medium mb-3 space-y-2">
                                <li><b>Funds</b>: You earn money when tasks reach <b>Done</b>. Each day costs $250 overhead. Don't run out!</li>
                                <li><b>Morale</b>: Stays high with steady flow. <span className="text-red-500">Drops</span> if you exceed WIP limits or push workers. <span className="text-green-600">Rises</span> when you complete tasks within limits.</li>
                                <li><b>Efficiency</b>: Tasks completed vs. what was possible (set by your WIP limit). Higher WIP limit = higher bar to reach!</li>
                            </ul>
                            <button
                                onClick={() => setTutorialStep(8)}
                                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold w-full hover:bg-green-700 transition-colors"
                            >
                                Next: Saving
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 8: Settings & Save */}
                {tutorialStep === 8 && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{ top: spotlightPos.y + spotlightPos.h + 20, left: spotlightPos.x - 150 }}
                        className="absolute z-[90] w-72 pointer-events-auto"
                    >
                        <div className="bg-white text-slate-800 px-5 py-4 rounded-xl shadow-2xl border-4 border-purple-500 relative">
                            <div className="absolute -top-3 right-6 w-6 h-6 bg-white border-t-4 border-l-4 border-purple-500 transform rotate-45"></div>
                            <h3 className="font-black text-purple-600 text-lg mb-1">Save Your Game</h3>
                            <p className="text-sm font-medium mb-3 leading-snug">
                                Click the Gear icon to access <b>Settings</b>. <br /> From there, you can <b>Export</b> your save file to keep it safe!
                            </p>
                            <button
                                onClick={() => setTutorialStep(9)}
                                className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold w-full hover:bg-purple-700 transition-colors"
                            >
                                Finish Tutorial
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 9: Complete */}
                {tutorialStep === 9 && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto z-[90]"
                    >
                        <div className="bg-yellow-400 text-black px-8 py-6 rounded-3xl shadow-2xl text-center border-4 border-white max-w-md">
                            <h2 className="text-3xl font-black mb-2">Great Job!</h2>
                            <p className="mb-4 font-medium">You've learned the flow of work! <br /> Respect WIP limits to keep the workers happy and efficiency high.</p>
                            <button
                                onClick={() => completeTutorial()}
                                className="bg-black text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                                data-testid="button-tutorial-complete"
                            >
                                Close Tutorial
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* --- CHAPTER 2: PLANNING ROOM TUTORIAL --- */}

                {/* Step 10: Lookahead Window (Red/Green) */}
                {tutorialStep === 10 && (
                    <div className="absolute top-20 right-20 z-[90] w-72 pointer-events-auto">
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
                {tutorialStep === 11 && (
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
                {tutorialStep === 12 && (
                    <div className="absolute bottom-20 right-20 z-[90] w-72 pointer-events-auto">
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
            </AnimatePresence>

        </div>
    );
};
