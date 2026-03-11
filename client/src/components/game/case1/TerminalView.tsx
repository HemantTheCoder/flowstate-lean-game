import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useGame } from '@/hooks/use-game';
import soundManager from '@/lib/soundManager';
import {
    Building2, ArrowUpCircle, Users, AlertTriangle,
    Save, Settings, Clock, CheckCircle, Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { SettingsModal } from './../SettingsModal';
import { CaseSmartAdvisor } from '../CaseSmartAdvisor';

export function TerminalView({ objective }: { objective?: string }) {
    const { day, hoistSlots, pdi, reworkRate, flags, currentDialogue } = useGameStore();
    const { saveGame } = useGame();
    const [showSettings, setShowSettings] = useState(false);

    // Derived flags for guidance
    const isDay1 = day === 1;
    const showGuidance = isDay1 && !flags.case1_tutorial_seen && !currentDialogue && flags.day_1_started;

    // Tutorial sequence: 0 = Click Hoist, 1 = Click Kanban, 2 = Click End Day
    const [tutorialStep, setTutorialStep] = useState(0);
    const [spotlightPos, setSpotlightPos] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

    useEffect(() => {
        if (!showGuidance) return;
        let animationFrameId: number;

        const updateSpotlight = () => {
            let targetId = '';
            if (tutorialStep === 0) targetId = 'btn-hoist-night';
            if (tutorialStep === 1) targetId = 'task-t1';
            if (tutorialStep === 2) targetId = 'btn-end-day';

            if (targetId) {
                const el = document.getElementById(targetId);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const newPos = { x: rect.left - 10, y: rect.top - 10, w: rect.width + 20, h: rect.height + 20 };
                    setSpotlightPos(prev => {
                        if (prev && Math.abs(prev.x - newPos.x) < 1 && Math.abs(prev.y - newPos.y) < 1 && Math.abs(prev.w - newPos.w) < 1 && Math.abs(prev.h - newPos.h) < 1) return prev;
                        return newPos;
                    });
                }
            } else { setSpotlightPos(null); }
            animationFrameId = requestAnimationFrame(updateSpotlight);
        };
        updateSpotlight();
        return () => cancelAnimationFrame(animationFrameId);
    }, [showGuidance, tutorialStep]);

    const getMaskPath = () => {
        if (!spotlightPos) return `M0 0 h${window.innerWidth} v${window.innerHeight} h-${window.innerWidth} z`;
        const { x, y, w, h } = spotlightPos;
        return `M0 0 h${window.innerWidth} v${window.innerHeight} h-${window.innerWidth} z M${x} ${y} v${h} h${w} v-${h} z`;
    };

    const handleEndDay = () => {
        if (showGuidance && tutorialStep < 2) return; // Block early end day
        window.dispatchEvent(new CustomEvent('case-end-day'));
        soundManager.playSFX('click');
        if (showGuidance) {
            useGameStore.setState(state => ({
                flags: { ...state.flags, case1_tutorial_seen: true }
            }));
        }
    };

    // Derived visual state
    const pdiColor = pdi > 40 ? 'text-rose-400' : pdi > 20 ? 'text-amber-400' : 'text-emerald-400';
    const reworkColor = reworkRate > 15 ? 'text-rose-400' : reworkRate > 8 ? 'text-amber-400' : 'text-emerald-400';

    return (
        <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-slate-950 text-slate-200">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[50%] h-[50%] bg-indigo-900/10 blur-[150px] rounded-full" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            {/* ── SLIM HEADER ──────────────────────────────────────── */}
            <header className="relative z-10 h-14 px-4 lg:px-6 border-b border-purple-500/20 bg-slate-900/60 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
                {/* Left: title */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm md:text-base font-black text-white tracking-tight truncate">Midfield Terminal Expansion</h1>
                        <p className="text-purple-400 font-bold text-[9px] uppercase tracking-widest leading-none">Case Study 1</p>
                    </div>
                </div>

                {/* Centre: Metric pill strip */}
                <div className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-1.5">
                    {/* Day */}
                    <div className="flex items-center gap-1.5 px-2.5 border-r border-slate-700/50">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-black text-white">Day {day}</span>
                        <span className="text-slate-600 text-[10px]">/5</span>
                    </div>
                    {/* Hoist */}
                    <div className="flex items-center gap-1.5 px-2.5 border-r border-slate-700/50">
                        <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-black text-white">{hoistSlots}</span>
                        <span className="text-slate-500 text-[10px]">slots</span>
                    </div>
                    {/* PDI */}
                    <div className="flex items-center gap-1.5 px-2.5 border-r border-slate-700/50">
                        <Users className={`w-3.5 h-3.5 ${pdiColor}`} />
                        <span className={`text-xs font-black ${pdiColor}`}>{pdi}%</span>
                        <span className="text-slate-500 text-[10px]">PDI</span>
                    </div>
                    {/* Rework */}
                    <div className="flex items-center gap-1.5 px-2.5">
                        <AlertTriangle className={`w-3.5 h-3.5 ${reworkColor}`} />
                        <span className={`text-xs font-black ${reworkColor}`}>{reworkRate}%</span>
                        <span className="text-slate-500 text-[10px]">Rework</span>
                    </div>
                </div>

                {/* Right: controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        id="btn-end-day"
                        onClick={handleEndDay}
                        className={`relative z-50 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all active:scale-95 border-b-4 border-indigo-800 ${showGuidance && tutorialStep === 2 ? 'animate-pulse ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 pointer-events-auto' : ''}`}
                    >
                        End Day
                    </button>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('case-save-game'))}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700 active:scale-95"
                        title="Save"
                    >
                        <Save className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700 active:scale-95"
                        title="Settings"
                    >
                        <Settings className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </header>

            {/* ── MAIN AREA (3-column: building | panels | advisor) ── */}
            <main className="relative z-10 flex-1 flex flex-row gap-0 overflow-hidden min-h-0">

                {/* COL 1: Building Cutaway (40%) */}
                <section className="flex-[40] flex flex-col border-r border-slate-700/40 min-h-0">
                    <div className="px-4 py-2.5 border-b border-slate-700/40 bg-slate-900/30 flex items-center gap-2 shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Work Zones</h2>
                    </div>
                    <div className="flex-1 p-4 flex items-end justify-center overflow-hidden">
                        <div className="w-full max-w-xs h-full max-h-[85%] border-2 border-slate-600/30 rounded-t-2xl bg-slate-800/50 flex flex-col justify-end gap-2 p-3 relative shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]">
                            {/* Hoist shaft indicator */}
                            <div className="absolute top-1/2 left-[-18px] w-8 h-28 border-2 border-emerald-500/30 bg-emerald-500/10 rounded flex flex-col items-center justify-center gap-1 -translate-y-1/2">
                                <ArrowUpCircle className="w-3 h-3 text-emerald-400 animate-bounce" />
                                <span className="text-[7px] text-emerald-500 font-bold -rotate-90 whitespace-nowrap">HOIST</span>
                            </div>
                            {/* Levels */}
                            <div className="flex-1 min-h-0 flex flex-col gap-2">
                                <div className="flex-1 border border-slate-600/50 rounded-xl flex items-center justify-center bg-slate-700/20 text-slate-500 font-bold tracking-widest text-[10px]">
                                    Level 3 — Roof
                                </div>
                                <div className="flex-[1.4] border-2 border-indigo-500/50 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-300 font-bold tracking-widest text-[10px] relative overflow-hidden">
                                    Level 2 — Concourse
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 bg-indigo-500/15 h-1/3"
                                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                                <div className="flex-1 border border-slate-600/50 rounded-xl flex items-center justify-center bg-slate-700/20 text-slate-500 font-bold tracking-widest text-[10px]">
                                    Level 1 — Apron
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Day timeline strip at bottom of col 1 */}
                    <div className="shrink-0 px-4 py-2.5 border-t border-slate-700/40 bg-slate-900/30">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Programme</span>
                            <span className="text-[9px] text-purple-400 font-black">{Math.round((day / 5) * 100)}% Complete</span>
                        </div>
                        <div className="relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(day / 5) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            {[1, 2, 3, 4, 5].map(d => (
                                <span key={d} className={`text-[8px] font-bold ${day >= d ? 'text-purple-400' : 'text-slate-600'}`}>D{d}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* COL 2: Control Panels (35%) */}
                <section className="flex-[35] flex flex-col gap-0 border-r border-slate-700/40 min-h-0 overflow-hidden">

                    {/* Hoist Scheduler */}
                    <div className="flex-[45] flex flex-col border-b border-slate-700/40 min-h-0 overflow-hidden relative">
                        <div className="px-4 py-2.5 border-b border-slate-700/40 bg-slate-900/30 flex items-center gap-2 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoist Scheduler</h2>
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-center gap-4 relative z-20">
                            <p className="text-slate-400 text-sm">Allocate hoist time to reduce contractor delays.</p>
                            <div className="flex items-center gap-4">
                                <button
                                    id="btn-hoist-night"
                                    className={`relative z-50 flex-1 py-3 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded-xl text-purple-300 font-bold transition-all ${showGuidance && tutorialStep === 0 ? 'animate-bounce border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] pointer-events-auto' : ''}`}
                                    onClick={() => {
                                        if (showGuidance && tutorialStep !== 0) return;
                                        useGameStore.setState({ pdi: Math.max(0, useGameStore.getState().pdi - 5) });
                                        soundManager.playSFX('click');
                                        if (showGuidance && tutorialStep === 0) setTutorialStep(1);
                                    }}
                                >
                                    Dedicated Night Run (-5% PDI)
                                </button>
                                <button
                                    className={`flex-1 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 rounded-xl text-indigo-300 font-bold transition-all ${showGuidance && tutorialStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => {
                                        if (showGuidance) return; // Completely blocked during Day 1 tutorial
                                        useGameStore.setState({ hoistSlots: useGameStore.getState().hoistSlots + 1 });
                                        soundManager.playSFX('ding');
                                    }}
                                >
                                    Add JIT Slot (+1 Slot)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Floor Kanban */}
                    <div className="flex-[55] flex flex-col min-h-0 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-slate-700/40 bg-slate-900/30 flex items-center gap-2 shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Floor Kanban</h2>
                        </div>
                        <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto min-h-0 relative">

                            {(() => {
                                let tasks = [];
                                if (day <= 4) {
                                    tasks = [
                                        {
                                            id: 't1',
                                            label: 'L2 Security Screening Fitout',
                                            action: 'Push to QA',
                                            color: 'emerald',
                                            onClick: () => {
                                                if (showGuidance && tutorialStep !== 1) return;
                                                useGameStore.setState({ reworkRate: Math.max(0, useGameStore.getState().reworkRate - 2) });
                                                soundManager.playSFX('success');
                                                if (showGuidance && tutorialStep === 1) setTutorialStep(2);
                                            },
                                            effect: '−2% Rework',
                                            isTutorialTarget: showGuidance && tutorialStep === 1
                                        },
                                        {
                                            id: 't2',
                                            label: 'L3 Core Drilling',
                                            action: 'Expedite',
                                            color: 'amber',
                                            onClick: () => {
                                                if (showGuidance) return;
                                                useGameStore.setState({ pdi: Math.min(100, useGameStore.getState().pdi + 3) });
                                                soundManager.playSFX('click');
                                            },
                                            effect: '+3% PDI'
                                        },
                                        {
                                            id: 't3',
                                            label: 'L1 Demolition Clearance',
                                            action: 'Clear Area',
                                            color: 'blue',
                                            onClick: () => {
                                                if (showGuidance) return;
                                                soundManager.playSFX('click');
                                            },
                                            effect: 'Unlocks L1 Framing'
                                        },
                                    ];
                                } else if (day <= 8) {
                                    tasks = [
                                        {
                                            id: 't4',
                                            label: 'L2 HVAC Duct Installation',
                                            action: 'QA Inspect',
                                            color: 'emerald',
                                            onClick: () => { useGameStore.setState({ reworkRate: Math.max(0, useGameStore.getState().reworkRate - 1) }); soundManager.playSFX('success'); },
                                            effect: '−1% Rework'
                                        },
                                        {
                                            id: 't5',
                                            label: 'L3 Lounge Framing',
                                            action: 'Expedite',
                                            color: 'amber',
                                            onClick: () => { useGameStore.setState({ pdi: Math.min(100, useGameStore.getState().pdi + 2) }); soundManager.playSFX('click'); },
                                            effect: '+2% PDI'
                                        },
                                        {
                                            id: 't6',
                                            label: 'L1 Baggage Belts (Rough-in)',
                                            action: 'Material Arrived',
                                            color: 'blue',
                                            onClick: () => { soundManager.playSFX('click'); },
                                            effect: 'Unlocks Motors'
                                        },
                                    ];
                                } else {
                                    tasks = [
                                        {
                                            id: 't7',
                                            label: 'L2 Security Scanners Install',
                                            action: 'Final QA',
                                            color: 'emerald',
                                            onClick: () => { useGameStore.setState({ reworkRate: Math.max(0, useGameStore.getState().reworkRate - 3) }); soundManager.playSFX('success'); },
                                            effect: '−3% Rework'
                                        },
                                        {
                                            id: 't8',
                                            label: 'L3 VIP Carpet',
                                            action: 'Expedite',
                                            color: 'amber',
                                            onClick: () => { useGameStore.setState({ pdi: Math.min(100, useGameStore.getState().pdi + 5) }); soundManager.playSFX('click'); },
                                            effect: '+5% PDI'
                                        },
                                        {
                                            id: 't9',
                                            label: 'L1 Terrazzo Flooring Polish',
                                            action: 'Commission',
                                            color: 'purple',
                                            onClick: () => { soundManager.playSFX('success'); },
                                            effect: 'Area Complete'
                                        },
                                    ];
                                }

                                return tasks.map((task) => (
                                    <div id={`task-${task.id}`} key={task.id} className={`flex items-center justify-between gap-2 p-3 bg-slate-900/50 border rounded-xl transition-all relative ${task.isTutorialTarget ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] z-50 pointer-events-auto' : 'border-slate-700/60'}`}>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{task.label}</p>
                                            <p className={`text-[10px] font-bold text-${task.color}-400/70 mt-0.5`}>{task.effect}</p>
                                        </div>
                                        <button
                                            onClick={task.onClick}
                                            className={`shrink-0 px-3 py-1.5 bg-${task.color}-600/15 text-${task.color}-400 border border-${task.color}-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-${task.color}-600/30 transition-all active:scale-95 flex items-center gap-1 ${task.isTutorialTarget ? 'animate-bounce' : ''}`}
                                        >
                                            <CheckCircle className="w-3 h-3" />
                                            {task.action}
                                        </button>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </section>

                {/* COL 3: Smart Advisor sidebar (25%) */}
                <section className="flex-[25] flex flex-col min-h-0 overflow-hidden bg-slate-900/20">
                    <div className="px-4 py-2.5 border-b border-slate-700/40 bg-slate-900/30 shrink-0">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Advisor</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {/* Render the advisor content inline — no extra wrapping padding */}
                        <CaseSmartAdvisor caseId={1} objective={objective} accentColor="purple" />
                    </div>
                </section>
            </main>

            {/* Spotlight guidance overlay */}
            {showGuidance && (
                <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden text-white font-bold text-shadow-lg">
                    <svg className="absolute inset-0 w-full h-full opacity-75 pointer-events-none">
                        <path d={getMaskPath()} fill="black" fillRule="evenodd" />
                    </svg>

                    <AnimatePresence>
                        {tutorialStep === 0 && spotlightPos && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ top: spotlightPos.y - 80, left: spotlightPos.x }}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="bg-purple-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white text-center">
                                    <p className="font-bold text-lg">Step 1: Night Run</p>
                                    <p className="text-sm">Click here to clear the morning backlog!</p>
                                </div>
                            </motion.div>
                        )}
                        {tutorialStep === 1 && spotlightPos && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ top: spotlightPos.y - 80, left: spotlightPos.x }}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white text-center">
                                    <p className="font-bold text-lg">Step 2: Push Work</p>
                                    <p className="text-sm">Complete available tasks to keep flow moving.</p>
                                </div>
                            </motion.div>
                        )}
                        {tutorialStep === 2 && spotlightPos && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ top: spotlightPos.y + spotlightPos.h + 20, left: spotlightPos.x - 150 }}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white text-center">
                                    <p className="font-bold text-lg">Step 3: End Day</p>
                                    <p className="text-sm">Advance the schedule when no more work can be done.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal
                    isOpen={true}
                    onClose={() => setShowSettings(false)}
                    onSaveAndExit={() => window.location.href = '/'}
                />
            )}
        </div>
    );
}
