import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useGame } from '@/hooks/use-game';
import {
    Map, Truck, Activity, Save, Settings,
    Layers, Zap, CheckCircle, Navigation,
    Timer, AlertCircle
} from 'lucide-react';
import { CaseTutorialOverlay } from '../CaseTutorialOverlay';
import { CaseSmartAdvisor } from '../CaseSmartAdvisor';
import { SettingsModal } from './../SettingsModal';
import soundManager from '@/lib/soundManager';

export function CoastalView({ objective }: { objective?: string }) {
    const { day, trafficImpact, flags } = useGameStore();
    const { saveGame } = useGame();
    const [showSettings, setShowSettings] = useState(false);

    // Derived flags for guidance
    const isDay1 = day === 1;
    const showGuidance = isDay1 && !flags.case2_tutorial_seen;

    return (
        <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-slate-950 text-slate-200">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-cyan-900/10 blur-[150px] rounded-full" />
                <div className="absolute inset-0 bg-[url('/noise.png')] bg-center opacity-5 mix-blend-overlay" />
            </div>

            {/* ── SLIM HEADER ──────────────────────────────────────── */}
            <header className="relative z-10 h-14 px-4 lg:px-6 border-b border-cyan-500/20 bg-slate-900/60 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                        <Map className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm md:text-base font-black text-white tracking-tight truncate">Coastal Highway Link</h1>
                        <p className="text-cyan-400 font-bold text-[9px] uppercase tracking-widest leading-none">Case Study 2</p>
                    </div>
                </div>

                {/* Metrics strip */}
                <div className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-1.5">
                    <div className="flex items-center gap-1.5 px-2.5 border-r border-slate-700/50">
                        <Timer className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-black text-white">Day {day}</span>
                        <span className="text-slate-600 text-[10px]">/14</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5">
                        <Activity className={`w-3.5 h-3.5 ${trafficImpact > 50 ? 'text-rose-400' : 'text-emerald-400'}`} />
                        <span className={`text-xs font-black ${trafficImpact > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{trafficImpact}%</span>
                        <span className="text-slate-500 text-[10px]">Traffic</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('case-end-day'));
                            soundManager.playSFX('click');
                        }}
                        className={`bg-cyan-600 hover:bg-cyan-500 text-white font-black py-1.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-all active:scale-95 border-b-2 border-cyan-800 ${showGuidance ? 'animate-pulse ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}`}
                    >
                        End Day
                    </button>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('case-save-game'))}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700 active:scale-95"
                    >
                        <Save className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700 active:scale-95"
                    >
                        <Settings className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </header>

            {/* ── MAIN AREA (3-column layout) ── */}
            <main className="relative z-10 flex-1 flex flex-row gap-0 overflow-hidden min-h-0">
                {/* COL 1: Map (40%) */}
                <section className="flex-[40] flex flex-col border-r border-slate-700/40 min-h-0">
                    <div className="px-4 py-2.5 border-b border-slate-700/40 bg-slate-900/30 flex items-center gap-2 shrink-0">
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highway Segment Map</h2>
                    </div>
                    <div className="flex-1 p-6 relative overflow-hidden flex items-center justify-center">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-2xl">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((seg) => (
                                <motion.div
                                    key={seg}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all shadow-lg ${seg <= 2 ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-900/40 border-slate-800'}`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${seg <= 2 ? 'text-blue-300' : 'text-slate-600'}`}>Segment</span>
                                    <span className={`text-2xl font-black ${seg <= 2 ? 'text-white' : 'text-slate-700'}`}>{seg}</span>
                                    {seg <= 2 && (
                                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                                            <div className="h-full bg-blue-400 w-1/3" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* COL 2: Controls (35%) */}
                <section className="flex-[35] flex flex-col border-r border-slate-700/40 min-h-0 overflow-hidden bg-slate-900/10">
                    {/* Logistics */}
                    <div className="flex-[45] flex flex-col border-b border-slate-700/40 min-h-0">
                        <div className="px-4 py-2.5 border-b border-slate-700/40 bg-slate-900/30 flex items-center gap-2 shrink-0">
                            <Truck className="w-3.5 h-3.5 text-cyan-400" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics Dispatch</h2>
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-center gap-3">
                            <p className="text-slate-400 text-xs leading-relaxed">Sequence trucks to S1/S2 to build up buffers.</p>
                            <button
                                onClick={() => soundManager.playSFX('click')}
                                className={`w-full py-3 bg-cyan-600/15 hover:bg-cyan-600/30 border border-cyan-500/40 rounded-xl text-cyan-300 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-3 group ${showGuidance ? 'animate-bounce shadow-[0_0_20px_rgba(6,182,212,0.3)]' : ''}`}
                            >
                                <Truck className="w-4 h-4 group-hover:text-cyan-200" />
                                Dispatch Trucks to S1/S2
                            </button>
                        </div>
                    </div>

                    {/* Staging */}
                    <div className="flex-[55] flex flex-col min-h-0 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-slate-700/40 bg-slate-900/30 flex items-center gap-2 shrink-0">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staging Buffers</h2>
                        </div>
                        <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
                            {[1, 2].map((seg) => (
                                <div key={seg} className="p-3 bg-slate-900/50 border border-slate-700/60 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">S{seg} Material Buffer</span>
                                        <span className={`text-[10px] font-black ${seg === 1 && showGuidance ? 'text-amber-400 animate-pulse' : 'text-blue-400'}`}>Target: 5m</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-1/2" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-bold">-</button>
                                            <span className="text-xs font-mono text-white w-6 text-center">3m</span>
                                            <button className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-bold">+</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* COL 3: Advisor (25%) */}
                <section className="flex-[25] flex flex-col min-h-0 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-700/40 bg-slate-900/30 shrink-0">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-400" /> Smart Advisor
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <CaseSmartAdvisor caseId={2} objective={objective} accentColor="cyan" />
                    </div>
                </section>
            </main>

            <CaseTutorialOverlay caseId={2} />
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
