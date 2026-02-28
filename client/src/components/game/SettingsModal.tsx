import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';
import { useGame } from '@/hooks/use-game';
import { Volume2, VolumeX, Cloud, LogOut, Settings, AlertTriangle } from 'lucide-react';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; onSaveAndExit: () => void }> = ({ isOpen, onClose, onSaveAndExit }) => {
    const { audioSettings, setAudioVolume, toggleMute } = useGameStore();
    const [activeTab, setActiveTab] = React.useState<'audio' | 'system'>('audio');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#050812]/80 backdrop-blur-xl p-4 pointer-events-auto font-sans">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        className="bg-slate-900/90 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-[0_0_80px_-15px_rgba(59,130,246,0.15)] border border-blue-500/20 overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Premium Header */}
                        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 p-6 text-white flex justify-between items-center shrink-0 border-b border-blue-500/20 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                            <div className="relative z-10 flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-500/20 border border-blue-500/30">
                                    <Settings className="w-5 h-5 text-blue-400" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">System Core</h2>
                            </div>
                            <button onClick={onClose} className="relative z-10 w-8 h-8 rounded-full bg-black/20 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/40 transition-all">
                                <XIcon />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10 bg-slate-900/50">
                            <button
                                onClick={() => setActiveTab('audio')}
                                className={`flex-1 py-4 font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'audio' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-500 shadow-[inset_0_-2px_10px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                            >
                                <Volume2 className="w-4 h-4 inline mr-2 mb-0.5" /> Audio Subsystem
                            </button>
                            <button
                                onClick={() => setActiveTab('system')}
                                className={`flex-1 py-4 font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-indigo-900/20 text-indigo-400 border-b-2 border-indigo-500 shadow-[inset_0_-2px_10px_rgba(99,102,241,0.1)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                            >
                                <Cloud className="w-4 h-4 inline mr-2 mb-0.5" /> Data Sync
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                            {activeTab === 'audio' ? (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    {/* BGM Volume */}
                                    <div className="space-y-4 bg-slate-800/30 p-5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                                                Music Levels
                                            </label>
                                            <span className="font-mono font-bold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/50">{Math.round(audioSettings.bgmVolume * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={audioSettings.bgmVolume}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setAudioVolume('bgm', val);
                                                soundManager.updateVolumes(val, audioSettings.sfxVolume, audioSettings.isMuted);
                                            }}
                                            className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all border border-slate-600/50"
                                        />
                                    </div>

                                    {/* SFX Volume */}
                                    <div className="space-y-4 bg-slate-800/30 p-5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                                                SFX Levels
                                            </label>
                                            <span className="font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900/50">{Math.round(audioSettings.sfxVolume * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={audioSettings.sfxVolume}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setAudioVolume('sfx', val);
                                                soundManager.updateVolumes(audioSettings.bgmVolume, val, audioSettings.isMuted);
                                                soundManager.playSFX('click', val);
                                            }}
                                            className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all border border-slate-600/50"
                                        />
                                    </div>

                                    {/* Mute Toggle */}
                                    <button
                                        onClick={() => {
                                            toggleMute();
                                            soundManager.updateVolumes(audioSettings.bgmVolume, audioSettings.sfxVolume, !audioSettings.isMuted);
                                        }}
                                        className={`w-full py-4 rounded-xl font-bold tracking-widest text-xs uppercase transition-all flex items-center justify-center gap-3 border shadow-lg ${audioSettings.isMuted ? 'bg-red-950/40 border-red-500/30 text-red-400 hover:bg-red-900/40 hover:border-red-400/50 hover:shadow-red-500/10' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-400/50 hover:shadow-emerald-500/10'}`}
                                    >
                                        {audioSettings.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        {audioSettings.isMuted ? 'UNMUTE MASTER AUDIO' : 'MUTE MASTER AUDIO'}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                                    <SystemSettings />
                                </motion.div>
                            )}
                        </div>

                        {/* Footer Controls */}
                        <div className="p-6 border-t border-white/5 bg-slate-900/80 shrink-0 grid grid-cols-2 gap-4">
                            <button
                                onClick={onSaveAndExit}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-300 hover:bg-red-950/50 hover:text-red-400 hover:border-red-500/30 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 group"
                            >
                                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Save & Exit
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full border border-blue-500/50 bg-blue-600/20 text-blue-300 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:bg-blue-500 hover:text-white transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                            >
                                Resume Simulation
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const SystemSettings: React.FC = () => {
    const { resetGame } = useGame();
    const { playerName } = useGameStore();

    const handleReset = () => {
        if (confirm("CRITICAL WARNING: This will WIPE all local and cloud progress. You will start entirely from Day 1. Proceed?")) {
            resetGame.mutate();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-indigo-950/30 p-5 rounded-2xl border border-indigo-500/20 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full" />
                <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2 text-sm uppercase tracking-widest">
                    <Cloud className="w-4 h-4" /> Cloud Sync Active
                </h4>
                <p className="text-xs text-indigo-200/60 mb-5 leading-relaxed font-light">
                    Your simulation progress is continuously uplinked to the central database at the end of each operational day.
                </p>
                <div className="flex items-center justify-between border-t border-indigo-500/20 pt-4 mt-2">
                    <span className="text-[10px] text-indigo-400/50 uppercase tracking-widest font-bold">Current Operator</span>
                    <span className="text-xs text-indigo-300 font-mono bg-indigo-900/50 px-3 py-1 rounded border border-indigo-800/50">
                        {playerName || "UNKNOWN"}
                    </span>
                </div>
            </div>

            <div className="bg-red-950/20 p-5 rounded-2xl border border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-2xl rounded-full" />
                <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-widest">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h4>
                <p className="text-xs text-slate-400 mb-4 font-light">
                    Irreversible action. Wipes all metrics, completed chapters, and acquired capabilities completely.
                </p>
                <button
                    onClick={handleReset}
                    className="w-full bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-red-100 font-bold py-3 pr-4 pl-3 text-xs tracking-widest uppercase rounded-xl border border-red-500/30 hover:border-red-400/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex justify-center items-center gap-2"
                >
                    <AlertTriangle className="w-3.5 h-3.5" /> Core Reset
                </button>
            </div>
        </div>
    );
};

const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
