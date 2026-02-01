import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    showKanban: boolean;
}

export const TutorialOverlay: React.FC<Props> = ({ showKanban }) => {
    const { tutorialStep, tutorialActive, completeTutorial } = useGameStore();

    if (!tutorialActive || tutorialStep === 0) return null;

    return (
        <div className="absolute inset-0 z-[70] pointer-events-none overflow-hidden text-white font-bold text-shadow-lg">
            <AnimatePresence>

                {/* Step 1: Open Board */}
                {tutorialStep === 1 && !showKanban && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute top-20 right-8 flex flex-col items-end"
                    >
                        <div className="text-4xl">⬆️</div>
                        <div className="bg-blue-600 px-4 py-2 rounded-xl text-xl shadow-xl mt-2">
                            Click here to open the Project Board!
                        </div>
                    </motion.div>
                )}

                {/* Board Open - Guidance */}
                {showKanban && (
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        {/* Matches KanbanBoard container size/padding */}
                        <div className="w-full h-full max-w-6xl flex flex-col pointer-events-none">
                            {/* Header Spacer */}
                            <div className="h-[100px] w-full" />

                            {/* Columns Container */}
                            <div className="flex-1 flex gap-6 px-6">

                                {/* Backlog Column Overlay */}
                                <div className="flex-1 relative flex flex-col items-center justify-center">
                                    {tutorialStep === 2 && (
                                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                                            <div className="text-5xl animate-bounce mb-2">⬇️</div>
                                            <div className="bg-orange-500 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                                <p className="font-bold text-lg">Step 1: PULL Work</p>
                                                <p className="text-sm opacity-90">Click a card to move it to <b>Ready</b>.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Ready Column Overlay */}
                                <div className="flex-1 relative flex flex-col items-center justify-center">
                                    {tutorialStep === 3 && (
                                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                                            <div className="text-5xl animate-bounce mb-2">⬇️</div>
                                            <div className="bg-purple-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                                <p className="font-bold text-lg">Step 2: START Work</p>
                                                <p className="text-sm opacity-90">Move to <b>Doing</b>. <br />This commits Materials.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Doing Column Overlay */}
                                <div className="flex-1 relative flex flex-col items-center justify-center">
                                    {/* No specific step here for this tutorial flow, maybe skipped? 
                            Wait, logic in store was: Ready -> Doing (Step 3 to 4) matches above.
                            Doing -> Done (Step 4 to 5).
                        */}
                                    {tutorialStep === 4 && (
                                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                                            <div className="text-5xl animate-bounce mb-2">⬇️</div>
                                            <div className="bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                                <p className="font-bold text-lg">Step 3: FINISH Work</p>
                                                <p className="text-sm opacity-90">Move to <b>Done</b> to get Paid!</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Done Column Overlay */}
                                <div className="flex-1 relative">
                                    {/* Done Column usually doesn't need input, just destination */}
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Complete */}
                {tutorialStep === 5 && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-32 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
                    >
                        <div className="bg-yellow-400 text-black px-8 py-6 rounded-3xl shadow-2xl text-center border-4 border-white">
                            <h2 className="text-3xl font-black mb-2">🎉 Great Job!</h2>
                            <p className="mb-4 font-medium">You've learned the flow of work!</p>
                            <button
                                onClick={() => completeTutorial()}
                                className="bg-black text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                            >
                                Close Tutorial
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Fallback if board closed during steps */}
                {showKanban === false && tutorialStep > 1 && tutorialStep < 5 && (
                    <motion.div className="absolute top-20 right-8 flex flex-col items-end">
                        <div className="text-4xl">⬆️</div>
                        <div className="bg-red-500 px-4 py-2 rounded-xl text-xl shadow-xl mt-2">
                            Open the Board to continue!
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};
