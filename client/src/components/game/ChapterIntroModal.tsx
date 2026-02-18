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
            subtitle: "Chapter 2: Last Planner System",
            description: "Stop planning what “should” be done. Start committing to what “can” be done. The foundation is ready, but the constraints are hidden.",
            objectives: [
                "MISSION: Deliver the 'Soft Opening' without breaking promises.",
                "LEARN: Plan in layers. Remove constraints. Commit only what’s ready.",
                "MASTER: The difference between 'Should', 'Can', and 'Will'."
            ]
        }
    }[chapter] || { title: "Unknown Chapter", subtitle: "", description: "", objectives: [] };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md px-4 pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-100 flex flex-col"
            >
                {/* Header Image/Banner Area */}
                <div className={`${chapter === 2 ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600' : 'bg-blue-600'} h-36 flex flex-col items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]"></div>
                    <h1 className="text-3xl md:text-4xl font-black text-white z-10 text-center px-4 tracking-tighter">
                        {content.subtitle.toUpperCase()}
                    </h1>
                    <p className="text-white/70 text-sm font-bold z-10 mt-1 uppercase tracking-widest">{content.title}</p>
                </div>

                <div className="p-8 md:p-12 overflow-y-auto">
                    <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                        {content.description}
                    </p>

                    {chapter === 2 && (
                        <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200 mb-6">
                            <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-3">You Will Learn</h3>
                            <ul className="space-y-2 text-sm text-indigo-800">
                                <li className="flex items-center gap-2"><span className="text-indigo-400">{'>'}</span> How to make reliable commitments</li>
                                <li className="flex items-center gap-2"><span className="text-indigo-400">{'>'}</span> How to remove constraints before promising</li>
                                <li className="flex items-center gap-2"><span className="text-indigo-400">{'>'}</span> Why overcommitment fails</li>
                                <li className="flex items-center gap-2"><span className="text-indigo-400">{'>'}</span> How PPC measures trust</li>
                            </ul>
                        </div>
                    )}

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Core Objectives</h3>
                        <ul className="space-y-3">
                            {content.objectives.map((obj, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <div className={`w-6 h-6 rounded-full ${chapter === 2 ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'} flex items-center justify-center text-xs font-bold`}>
                                        {i + 1}
                                    </div>
                                    {obj}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={handleStart}
                        className={`w-full ${chapter === 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'bg-black hover:bg-slate-800'} text-white text-xl font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
                        data-testid="button-start-chapter"
                    >
                        {chapter === 2 ? 'Begin Day 6 Planning' : 'Start Chapter'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
