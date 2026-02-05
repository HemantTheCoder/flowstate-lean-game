import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';
import { useGame } from '@/hooks/use-game';
import { Volume2, VolumeX, Download, Upload } from 'lucide-react';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { audioSettings, setAudioVolume, toggleMute, importState } = useGameStore();
    const [activeTab, setActiveTab] = React.useState<'audio' | 'system'>('audio');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Save/Load Hooks
    // We need to re-import useGame hook inside component or pass it down. 
    // Since useGame is a hook, we can use it here if SettingsModal is inside QueryProvider context (it is).
    // Note: SettingsModal is imported in Game.tsx, checks out.
    // However, hooks rules: import at top level.
    // Let's assume we can import useGame here. 
    // Wait, useGame is custom hook. I need to add import { useGame } from '@/hooks/use-game' at top level.
    // For now, I will assume the user has passed necessary props OR I can use the store.
    // Actually, saving requires server interaction ($saveGame mutation).
    // The Game.tsx handles save. Ideally SettingsModal should trigger it.
    // Refactoring: I will use window.location.reload logic for Reset if needed, but for Save I need the mutation.
    // Let's use the mutation from useGame here.

    // We need to add the import statement at the top of the file separately, but this tool replaces content block.
    // I will include the hook usage logic assuming I can fix imports in next step or assuming they exist?
    // No, I must be careful.
    // Current imports: React, motion, useGameStore, soundManager.
    // I will use a simple "Save" button that calls a prop or useGame().

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 pointer-events-auto">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-4 border-slate-100 overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="bg-slate-800 p-6 text-white flex justify-between items-center shrink-0">
                            <h2 className="text-2xl font-black uppercase tracking-wider">Settings</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                                <span className="text-3xl">×</span>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('audio')}
                                className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'audio' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                <Volume2 className="w-4 h-4 inline mr-1" /> Audio
                            </button>
                            <button
                                onClick={() => setActiveTab('system')}
                                className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'system' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                <Download className="w-4 h-4 inline mr-1" /> System
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto">
                            {activeTab === 'audio' ? (
                                <>
                                    {/* BGM Volume */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-slate-500 uppercase">Music Volume</label>
                                            <span className="font-mono font-bold text-blue-600">{Math.round(audioSettings.bgmVolume * 100)}%</span>
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
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>

                                    {/* SFX Volume */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-slate-500 uppercase">SFX Volume</label>
                                            <span className="font-mono font-bold text-blue-600">{Math.round(audioSettings.sfxVolume * 100)}%</span>
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
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>

                                    {/* Mute Toggle */}
                                    <button
                                        onClick={() => {
                                            toggleMute();
                                            soundManager.updateVolumes(audioSettings.bgmVolume, audioSettings.sfxVolume, !audioSettings.isMuted);
                                        }}
                                        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 border-4 ${audioSettings.isMuted ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}
                                    >
                                        {audioSettings.isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                        {audioSettings.isMuted ? 'UNMUTE AUDIO' : 'MUTE ALL AUDIO'}
                                    </button>
                                </>
                            ) : (
                                <SystemSettings importState={importState} />
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                            <button
                                onClick={onClose}
                                className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all"
                            >
                                BACK TO WORK
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Sub-component for System Settings to use hooks cleanly

const SystemSettings: React.FC<{ importState: (data: any) => void }> = ({ importState }) => {
    const { saveGame, resetGame, gameState } = useGame();
    const { lpi, funds, day, week, columns, flags, playerName } = useGameStore();

    const handleManualSave = async () => {
        // Cloud Save disabled for now per user request.
        // await saveGame.mutateAsync({...});
        alert("Cloud Save is currently disabled. Please use 'Export Save' to backup your data locally.");
    };

    const handleExport = () => {
        const data = {
            timestamp: Date.now(),
            chapter: useGameStore.getState().chapter,
            day,
            week,
            playerName,
            resources: {
                budget: funds,
                morale: lpi.teamMorale
            },
            kanbanState: { columns },
            flags,
            metrics: lpi
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flowstate_save_day${day}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                importState(json);
                alert("Save file loaded successfully! 📂");
                window.location.reload(); // Reload to refresh state fully
            } catch (err) {
                alert("Failed to load save file. Invalid format.");
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirm("Are you sure? This will WIPE all progress and start from Day 1.")) {
            resetGame.mutate();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">💾</span> Save & Load
                </h4>
                <p className="text-sm text-blue-700 mb-4">
                    FlowState currently uses <strong>Local JSON Files</strong> for saving.
                    Export your save daily to keep it safe!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleExport}
                        className="bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                    >
                        <Download className="w-5 h-5" /> Export Save
                    </button>

                    <label className="bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer">
                        <Upload className="w-5 h-5" /> Import Save
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                </div>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h4 className="font-bold text-red-900 mb-2">Danger Zone</h4>
                <button
                    onClick={handleReset}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-4 rounded-xl border border-red-200 transition-colors"
                >
                    ⚠️ Reset Progress
                </button>
            </div>

            <div className="text-xs text-slate-400 text-center">
                User ID: {playerName} | Session: Local
            </div>
        </div>
    );
};
