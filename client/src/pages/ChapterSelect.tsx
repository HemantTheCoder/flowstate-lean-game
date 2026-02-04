import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { CharacterCreationModal } from '@/components/game/CharacterCreationModal';
import { useGame } from '@/hooks/use-game';

const CHAPTERS = [
    {
        id: 1,
        title: "Chapter 1: The Jam",
        description: "Juniper Pier is in chaos. Learn to see the Flow, limit Work-In-Progress (WIP), and stop the madness.",
        concept: "Concept: Kanban, WIP Limits & Flow",
        color: "from-blue-500 to-cyan-400"
    },
    {
        id: 2,
        title: "Chapter 2: The Promise",
        description: "The Inspector demands reliability. Use the Last Planner System to make commitments you can keep.",
        concept: "Concept: Last Planner System (LPS) & Reliability",
        color: "from-purple-500 to-indigo-400"
    }
];

export default function ChapterSelect() {
    // Selectors
    const unlockedChapters = useGameStore(s => s.unlockedChapters);
    const startChapter = useGameStore(s => s.startChapter);
    const flags = useGameStore(s => s.flags);

    // Hooks
    const [_, navigate] = useLocation();
    const { saveGame } = useGame();

    const handleSelect = async (id: number) => {
        // Prevent starting if character not created (though Modal should block this)
        if (!flags['character_created']) return;

        console.log(`Starting Chapter ${id}...`);

        // 1. Initialize Local State
        startChapter(id);

        // 2. Persist to Server IMMEDIATELY
        // This ensures Game.tsx receives the correct state upon loading
        try {
            const state = useGameStore.getState();
            await saveGame.mutateAsync({
                sessionId: '', // Handled by hook
                playerName: state.playerName,
                chapter: id, // Explicitly ensure chapter set
                week: state.week,
                resources: {
                    morale: state.lpi.teamMorale,
                    stress: 0,
                    trust: 50,
                    productivity: 40,
                    quality: 80,
                    budget: state.funds,
                    materials: state.materials
                },
                kanbanState: { columns: state.columns } as any,
                flags: state.flags,
                metrics: { ...state.lpi, ppcHistory: state.ppcHistory },
                weeklyPlan: state.weeklyPlan,
                completedChapters: state.unlockedChapters.filter(c => c !== 1).map(c => c - 1),
                unlockedBadges: []
            });

            // 3. Navigate
            navigate('/game');

        } catch (error) {
            console.error("Failed to start chapter:", error);
            alert("Failed to save game state. Please check connection.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none" />

            {/* Character Creation Modal - Will show if needed */}
            <CharacterCreationModal />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 text-center mb-12"
            >
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                    Select Chapter
                </h1>
                <p className="text-slate-400 text-lg">Choose your simulation scenario</p>
            </motion.div>

            <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
                {CHAPTERS.map((chapter) => {
                    const isUnlocked = unlockedChapters.includes(chapter.id);

                    return (
                        <motion.button
                            key={chapter.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={isUnlocked ? { scale: 1.02, y: -5 } : {}}
                            whileTap={isUnlocked ? { scale: 0.98 } : {}}
                            onClick={() => isUnlocked && handleSelect(chapter.id)}
                            disabled={!isUnlocked}
                            className={`relative group text-left overflow-hidden rounded-3xl border-2 transition-all duration-300 w-full
                                ${isUnlocked
                                    ? 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:shadow-2xl hover:shadow-blue-900/20 cursor-pointer'
                                    : 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed grayscale'
                                }
                            `}
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${chapter.color}`} />

                            <div className="p-8 relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isUnlocked ? 'bg-white/10 text-white border-white/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                        Episode {chapter.id}
                                    </span>
                                    {!isUnlocked && <span className="text-sm font-bold text-slate-500 uppercase">[LOCKED]</span>}
                                </div>

                                <h2 className={`text-3xl font-black mb-2 ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                                    {chapter.title}
                                </h2>
                                <p className={`text-sm font-bold mb-4 ${isUnlocked ? 'text-blue-400' : 'text-slate-700'}`}>
                                    {chapter.concept}
                                </p>
                                <p className={`text-sm leading-relaxed ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {chapter.description}
                                </p>

                                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                    <span className={`text-sm font-bold ${isUnlocked ? 'text-white group-hover:underline' : 'text-slate-700'}`}>
                                        {isUnlocked ? 'Play Scenario' : 'Locked'}
                                    </span>
                                    {isUnlocked && <span className="text-xl">➔</span>}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="z-10 mt-12"
            >
                <button
                    onClick={() => navigate('/')}
                    className="text-slate-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
                >
                    ← Back to Title
                </button>
            </motion.div>
        </div>
    );
}
