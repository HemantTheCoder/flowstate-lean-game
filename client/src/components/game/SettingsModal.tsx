import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { audioSettings, setAudioVolume, toggleMute } = useGameStore();

    if (!isOpen) return null;

    const handleVolumeChange = (type: 'bgm' | 'sfx', value: number) => {
        setAudioVolume(type, value);
        soundManager.updateVolumes(
            type === 'bgm' ? value : audioSettings.bgmVolume,
            type === 'sfx' ? value : audioSettings.sfxVolume,
            audioSettings.isMuted
        );

        // Play test sound for SFX move
        if (type === 'sfx') {
            soundManager.playSFX('click', value);
        }
    };

    const handleToggleMute = () => {
        toggleMute();
        soundManager.updateVolumes(
            audioSettings.bgmVolume,
            audioSettings.sfxVolume,
            !audioSettings.isMuted
        );
    };

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 pointer-events-auto">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-4 border-slate-100 overflow-hidden"
                >
                    <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
                        <h2 className="text-2xl font-black uppercase tracking-wider">Settings</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <span className="text-3xl">×</span>
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
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
                                onChange={(e) => handleVolumeChange('bgm', parseFloat(e.target.value))}
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
                                onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Mute Toggle */}
                        <button
                            onClick={handleToggleMute}
                            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 border-4 ${audioSettings.isMuted
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : 'bg-green-50 border-green-200 text-green-600'
                                }`}
                        >
                            <span className="text-2xl">{audioSettings.isMuted ? '🔇' : '🔊'}</span>
                            {audioSettings.isMuted ? 'UNMUTE AUDIO' : 'MUTE ALL AUDIO'}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all"
                        >
                            BACK TO WORK
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
