import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { User, UserCircle, Hexagon } from 'lucide-react';

export const CharacterCreationModal: React.FC = () => {
    const { setPlayerProfile, setFlag, flags } = useGameStore();
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');

    // Only show if not created yet
    if (flags['character_created']) return null;

    const handleConfirm = () => {
        if (!name.trim()) return;
        setPlayerProfile(name, gender);
        setFlag('character_created', true);
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#050812]/90 backdrop-blur-xl p-4 md:p-6 pointer-events-auto font-sans">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className="bg-slate-900/90 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-[0_0_80px_-15px_rgba(59,130,246,0.15)] border border-blue-500/20 flex flex-col overflow-hidden"
            >
                {/* Premium Header */}
                <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 p-6 md:p-8 relative overflow-hidden shrink-0 border-b border-blue-500/20">
                    <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4 shadow-inner text-blue-400">
                            <Hexagon className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Lean Architect Profile</h1>
                        <p className="text-blue-400/80 text-xs font-bold uppercase tracking-widest mt-2">Create Lean Architect Profile</p>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Name Input */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                            Engineer Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-blue-500 rounded-xl px-5 py-4 text-white text-lg font-bold outline-none placeholder-slate-600 transition-all shadow-inner focus:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                            placeholder="Enter Name..."
                            autoFocus
                        />
                    </div>

                    {/* Gender Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                            Select Avatar
                        </label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setGender('male')}
                                className={`flex-1 p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 ${gender === 'male' ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-slate-950/40 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900'}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${gender === 'male' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                                    <User className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${gender === 'male' ? 'text-blue-400' : 'text-slate-500'}`}>Male Avatar</span>
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                className={`flex-1 p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 ${gender === 'female' ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-slate-950/40 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900'}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${gender === 'female' ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                                    <UserCircle className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${gender === 'female' ? 'text-indigo-400' : 'text-slate-500'}`}>Female Avatar</span>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!name.trim()}
                        className="w-full bg-blue-600/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600/20 disabled:hover:text-blue-400 font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] active:scale-[0.98]"
                    >
                        Start Simulation
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
