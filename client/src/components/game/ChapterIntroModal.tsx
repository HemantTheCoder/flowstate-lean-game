import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import soundManager from '@/lib/soundManager';

export const ChapterIntroModal: React.FC = () => {
    const { flags, setFlag, chapter } = useGameStore();

    // Condition: Character created, but Intro NOT seen yet.
    // Also ensuring we are actually in Chapter 1 context (default).
    if (!flags['character_created'] || flags['chapter_intro_seen']) return null;

    const handleStart = () => {
        soundManager.playSFX('whoosh', 0.6);
        setFlag('chapter_intro_seen', true);
    };

    // Content could be dynamic based on 'chapter' number later.
    const content = {
        1: {
            title: "The Jam at Juniper Pier",
            subtitle: "Chapter 1: Flow vs. Chaos",
            description: "You are the new Lean Engineer. The project is behind schedule, over budget, and chaotic. Manager Rao wants to 'Push' harder, but that only creates waste.",
            objectives: [
                "MISSION: Stabilize the project before the Client Inspector arrives on Day 5.",
                "LEARN: Manage WIP Limits to stop 'Starvation' and 'Bottlenecks'.",
                "MASTER: The difference between 'Pushing' work and 'Pulling' value."
            ]
        },
        2: {
            title: "The Overpromised Mall",
            subtitle: "Episode 2: Last Planner System",
            description: "Stop planning what “should” be done. Start committing to what “can” be done. The foundation is ready, but the constraints are hidden.",
            objectives: [
                "MISSION: Deliver the 'Soft Opening' without breaking promises.",
                "LEARN: Plan in layers. Remove constraints. Commit only what’s ready.",
                "MASTER: The difference between 'Should', 'Can', and 'Will'."
            ]
        },
        3: {
            title: "The Cluttered Depot",
            subtitle: "Episode 3: The 5S Principles",
            description: "Production is grinding to a halt because workers cannot find their materials. The depot is a disaster zone of misplaced tools and wasted motion.",
            objectives: [
                "MISSION: Turn the cluttered depot into a visual, high-performance workspace.",
                "LEARN: Implement Sort, Set in Order, Shine, Standardize, and Sustain.",
                "MASTER: Visual Management and eliminating search waste."
            ]
        }
    }[chapter] || { title: "Unknown Chapter", subtitle: "", description: "", objectives: [] };

    // Determine theme colors based on chapter
    const getThemeColors = () => {
        switch (chapter) {
            case 2: return 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600';
            case 3: return 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500';
            default: return 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600';
        }
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md px-4 pointer-events-auto font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-100 flex flex-col"
            >
                {/* Header Image/Banner Area */}
                <div className={`${getThemeColors()} h-36 flex flex-col items-center justify-center relative overflow-hidden shrink-0`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]"></div>
                    <h1 className="text-3xl md:text-4xl font-black text-white z-10 text-center px-4 tracking-tighter">
                        {content.subtitle.toUpperCase()}
                    </h1>
                    <p className="text-white/80 text-sm font-bold z-10 mt-1 uppercase tracking-widest">{content.title}</p>
                </div>

                <div className="p-8 md:p-12 overflow-y-auto">
                    <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                        {content.description}
                    </p>

                    {chapter === 2 && (
                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 mb-6 shadow-inner">
                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">You Will Learn</h3>
                            <ul className="space-y-2 text-sm text-emerald-800 font-medium">
                                <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">{'>'}</span> How to make reliable commitments</li>
                                <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">{'>'}</span> How to remove constraints before promising</li>
                                <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">{'>'}</span> Why overcommitment fails</li>
                                <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">{'>'}</span> How PPC measures trust</li>
                            </ul>
                        </div>
                    )}

                    {chapter === 3 && (
                        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 mb-6 shadow-inner">
                            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-3">You Will Learn</h3>
                            <ul className="space-y-2 text-sm text-amber-800 font-medium">
                                <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">{'>'}</span> Sort: Keep only what is needed</li>
                                <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">{'>'}</span> Set in Order: A place for everything</li>
                                <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">{'>'}</span> Shine: Clean means to inspect</li>
                                <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">{'>'}</span> Standardize & Sustain: Make it a habit</li>
                            </ul>
                        </div>
                    )}

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Core Objectives</h3>
                        <ul className="space-y-3">
                            {content.objectives.map((obj, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${chapter === 3 ? 'bg-amber-100 text-amber-600' :
                                        chapter === 2 ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-blue-100 text-blue-600'}
                                    `}>
                                        {i + 1}
                                    </div>
                                    {obj}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={handleStart}
                        className={`w-full text-white text-xl font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 uppercase tracking-wide
                            ${chapter === 3 ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' :
                                chapter === 2 ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' :
                                    'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
                        `}
                        data-testid="button-start-chapter"
                    >
                        {chapter === 3 ? 'Begin 5S Simulation' : chapter === 2 ? 'Begin Day 6 Planning' : 'Start Simulation'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
