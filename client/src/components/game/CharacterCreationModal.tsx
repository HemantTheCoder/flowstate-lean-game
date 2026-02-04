import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { User, UserCircle } from 'lucide-react';

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
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/95 px-4 pointer-events-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="bg-blue-600 p-8 text-white text-center">
                    <h1 className="text-3xl font-black uppercase tracking-widest">New Hire</h1>
                    <p className="opacity-80 mt-2">Create your Engineer Profile</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Engineer Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full text-2xl font-bold border-b-4 border-slate-200 focus:border-blue-500 outline-none py-2 text-slate-800 placeholder-slate-300"
                            placeholder="Enter Name..."
                            autoFocus
                        />
                    </div>

                    {/* Gender Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-4">Select Avatar</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setGender('male')}
                                className={`flex-1 p-4 rounded-xl border-4 transition-all ${gender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                data-testid="button-select-male"
                            >
                                <div className="flex justify-center mb-2">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${gender === 'male' ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className={`font-bold ${gender === 'male' ? 'text-blue-600' : 'text-slate-400'}`}>Male</div>
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                className={`flex-1 p-4 rounded-xl border-4 transition-all ${gender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 hover:border-slate-200'}`}
                                data-testid="button-select-female"
                            >
                                <div className="flex justify-center mb-2">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${gender === 'female' ? 'bg-pink-500' : 'bg-slate-300'}`}>
                                        <UserCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className={`font-bold ${gender === 'female' ? 'text-pink-600' : 'text-slate-400'}`}>Female</div>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!name.trim()}
                        className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-xl shadow-lg transition-all transform hover:scale-[1.02]"
                        data-testid="button-start-career"
                    >
                        Start Career
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
