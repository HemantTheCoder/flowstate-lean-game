import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterCreationModal } from '@/components/game/CharacterCreationModal';
import { useGame } from '@/hooks/use-game';
import { Lock, Construction, X, BookOpen, Gamepad2, Target, Lightbulb, ArrowRight, ChevronRight } from 'lucide-react';

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
    const unlockedChapters = useGameStore(s => s.unlockedChapters);
    const startChapter = useGameStore(s => s.startChapter);
    const flags = useGameStore(s => s.flags);
    const [showCh3Modal, setShowCh3Modal] = useState(false);

    const [_, navigate] = useLocation();
    const { saveGame } = useGame();

    const handleSelect = async (id: number) => {
        if (!flags['character_created']) return;

        console.log(`Starting Chapter ${id}...`);

        startChapter(id);

        try {
            const state = useGameStore.getState();
            await saveGame.mutateAsync({
                sessionId: '',
                playerName: state.playerName,
                chapter: id,
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

            navigate('/game');

        } catch (error) {
            console.error("Failed to start chapter:", error);
            alert("Failed to save game state. Please check connection.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none" />

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

            <div className="z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
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
                            data-testid={`card-chapter-${chapter.id}`}
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${chapter.color}`} />

                            <div className="p-8 relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isUnlocked ? 'bg-white/10 text-white border-white/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                        Episode {chapter.id}
                                    </span>
                                    {!isUnlocked && <span className="text-sm font-bold text-slate-500 uppercase">[LOCKED]</span>}
                                </div>

                                <h2 className={`text-2xl font-black mb-2 ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                                    {chapter.title}
                                </h2>
                                <p className={`text-sm font-bold mb-4 ${isUnlocked ? 'text-blue-400' : 'text-slate-700'}`}>
                                    {chapter.concept}
                                </p>
                                <p className={`text-sm leading-relaxed flex-1 ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {chapter.description}
                                </p>

                                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className={`text-sm font-bold ${isUnlocked ? 'text-white group-hover:underline' : 'text-slate-700'}`}>
                                        {isUnlocked ? 'Play Scenario' : 'Locked'}
                                    </span>
                                    {isUnlocked && <ArrowRight className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}

                {/* Chapter 3 - Coming Soon */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCh3Modal(true)}
                    className="relative group text-left overflow-hidden rounded-3xl border-2 border-amber-800/40 bg-slate-800/60 cursor-pointer transition-all duration-300 w-full"
                    data-testid="card-chapter-3"
                >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-amber-500 to-orange-400" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />

                    <div className="p-8 relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-amber-900/30 text-amber-400 border-amber-700/40">
                                Episode 3
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase bg-amber-900/30 px-3 py-1 rounded-full border border-amber-700/40">
                                <Construction className="w-3 h-3" />
                                Coming Soon
                            </span>
                        </div>

                        <h2 className="text-2xl font-black text-white/80 mb-1">
                            Chapter 3: The Tangled Depot
                        </h2>
                        <p className="text-sm font-bold mb-4 text-amber-400/80">
                            Concept: 5S &mdash; Order Creates Energy
                        </p>
                        <p className="text-sm leading-relaxed text-slate-400 flex-1">
                            Organize the site. Reduce wasted motion. Build stability.
                        </p>

                        <div className="mt-6 pt-4 border-t border-amber-800/30 flex items-center justify-between">
                            <span className="text-sm font-bold text-amber-400/70 group-hover:text-amber-300 transition-colors">
                                View Overview
                            </span>
                            <ChevronRight className="w-4 h-4 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
                        </div>
                    </div>
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="z-10 mt-12"
            >
                <p className="text-slate-600 text-xs text-center mb-4 italic">Build flow. Keep promises. Create order.</p>
                <button
                    onClick={() => navigate('/')}
                    className="text-slate-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
                    data-testid="button-back-title"
                >
                    &larr; Back to Title
                </button>
            </motion.div>

            {/* Chapter 3 Overview Modal */}
            <AnimatePresence>
                {showCh3Modal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowCh3Modal(false)}
                        data-testid="overlay-chapter-3-modal"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border-2 border-amber-700/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-amber-900/20"
                            data-testid="modal-chapter-3-overview"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 p-8 relative overflow-hidden rounded-t-3xl">
                                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]" />
                                <button
                                    onClick={() => setShowCh3Modal(false)}
                                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                                    data-testid="button-close-ch3-modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="relative z-10">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white mb-3 border border-white/20">
                                        <Construction className="w-3 h-3" />
                                        Coming Soon
                                    </span>
                                    <h2 className="text-3xl font-black text-white mb-1">The Tangled Depot</h2>
                                    <p className="text-amber-200/80 font-bold text-sm">Chapter 3 &mdash; 5S: Order Creates Energy</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Story Preview */}
                                <div>
                                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Story Preview
                                    </h3>
                                    <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                                        <p>
                                            After improving flow (Kanban) and making reliable promises (Last Planner), you arrive at the mall's material depot.
                                        </p>
                                        <p>
                                            Tools are scattered. Walk paths are blocked. Materials are stacked randomly. Workers spend more time searching than building.
                                        </p>
                                        <p className="text-slate-400 italic border-l-2 border-amber-600/40 pl-4">
                                            Old Foreman looks around and sighs: "We fixed promises. Now fix the chaos."
                                        </p>
                                        <p>
                                            Your next challenge is to transform a cluttered depot into an organized, efficient work environment.
                                        </p>
                                    </div>
                                </div>

                                {/* What You'll Learn */}
                                <div className="bg-amber-950/30 border border-amber-800/30 rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-3.5 h-3.5" />
                                        What You'll Learn
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-3">
                                        This chapter introduces <strong className="text-amber-300">5S</strong>, the Lean method for workplace organization.
                                    </p>
                                    <ul className="space-y-2">
                                        {[
                                            "Reduce wasted motion and searching",
                                            "Improve productivity through layout",
                                            "Create visual order on site",
                                            "Support reliable execution with organized workspaces"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 pt-3 border-t border-amber-800/30">
                                        <p className="text-xs font-bold text-amber-500/80 uppercase tracking-wide mb-2">You'll Practice:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                "Sorting unnecessary materials",
                                                "Setting fixed locations for tools",
                                                "Cleaning work zones",
                                                "Standardizing layouts",
                                                "Sustaining improvements"
                                            ].map((item, i) => (
                                                <span key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                                                    <span className="text-amber-600">&#x25B8;</span> {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Planned Gameplay */}
                                <div>
                                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Gamepad2 className="w-3.5 h-3.5" />
                                        Planned Gameplay
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            "Drag-and-drop organization of tools and materials",
                                            "Creating storage zones and walk paths",
                                            "Before/after site transformation",
                                            "Daily mini-challenges for each S",
                                            "Visual feedback on speed, safety, and morale"
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-400 bg-slate-800/50 rounded-xl p-3">
                                                <span className="text-amber-500 font-bold text-xs mt-0.5">{i + 1}</span>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-3 italic">
                                        This chapter focuses on physical workspace optimization, not planning boards.
                                    </p>
                                </div>

                                {/* Learning Outcome */}
                                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5" />
                                        Learning Outcome
                                    </h3>
                                    <p className="text-sm text-white font-medium">
                                        By the end of Chapter 3, you will understand how site organization directly affects productivity, safety, and flow.
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-xs font-bold text-amber-400/70 uppercase tracking-widest">Under Development</span>
                                    </div>
                                    <button
                                        onClick={() => setShowCh3Modal(false)}
                                        className="px-5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-bold transition-all"
                                        data-testid="button-close-ch3-overview"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
