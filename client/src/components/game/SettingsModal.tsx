import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';
import { useGame } from '@/hooks/use-game';
import { Volume2, VolumeX, Cloud, LogOut } from 'lucide-react';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; onSaveAndExit: () => void }> = ({ isOpen, onClose, onSaveAndExit }) => {
    // ... existing hooks ...
    const { audioSettings, setAudioVolume, toggleMute } = useGameStore();
    const [activeTab, setActiveTab] = React.useState<'audio' | 'system'>('audio');

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
                                <Cloud className="w-4 h-4 inline mr-1" /> System
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
                                <SystemSettings />
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 grid grid-cols-2 gap-4">
                            <button
                                onClick={onSaveAndExit}
                                className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 py-4 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Save & Exit
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all"
                            >
                                Resume Game
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Sub-component for System Settings to use hooks cleanly

const SystemSettings: React.FC = () => {
    const { resetGame } = useGame();
    const { playerName } = useGameStore();

    const handleReset = () => {
        if (confirm("Are you sure? This will WIPE all progress and start from Day 1.")) {
            resetGame.mutate();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">☁️</span> Cloud Save Active
                </h4>
                <p className="text-sm text-blue-700 mb-4">
                    Your progress is saved to your account automatically at the end of each day, or manually via the Save button in the HUD.
                </p>
                <div className="text-xs text-blue-500 font-mono bg-blue-100 p-2 rounded">
                    Player: {playerName}
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
        </div>
    );
};
