import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import soundManager from '@/lib/soundManager';
import { LeanTooltipText } from './LeanTooltip';

export const DialogueBox: React.FC = () => {
    const { currentDialogue, dialogueIndex, advanceDialogue, playerName, playerGender, weeklyPlan, columns, lpi } = useGameStore();

    if (!currentDialogue) return null;

    const line = currentDialogue[dialogueIndex];

    // Calculate Dynamic Stats for Text Replacement
    const promised = weeklyPlan.length;
    const doneTasks = columns.find(c => c.id === 'done')?.tasks || [];
    const completed = doneTasks.filter(t =>
        weeklyPlan.includes(t.id) || weeklyPlan.includes(t.originalId || '')
    ).length;
    const ppc = lpi.ppc;

    // Replace Placeholders
    const processedText = line.text
        .replace(/Engineer/g, playerName)
        .replace(/{promised}/g, promised.toString())
        .replace(/{completed}/g, completed.toString())
        .replace(/{ppc}/g, ppc.toString());

    // Logic to determine character side (Left/Right) or Color based on name
    const isPlayer = line.character === 'Engineer' || line.character === 'Architect';

    // Dynamic Name Display
    const displayName = isPlayer ? playerName : line.character;

    const colorMap: Record<string, string> = {
        'Engineer': 'bg-blue-500',
        'Architect': 'bg-blue-500',
        'Mira': 'bg-pink-500',
        'Rao': 'bg-orange-600',
        'Isha': 'bg-teal-500',
        'Old Foreman': 'bg-slate-600',
        'Foreman': 'bg-slate-600',
        'Advisor': 'bg-indigo-500',
        'Client': 'bg-rose-600',
        'Inspector': 'bg-rose-600'
    };

    const bgColor = colorMap[line.character] || 'bg-slate-700';

    // Mapping for character images (filenames in public/assets)
    const imageMap: Record<string, string> = {
        'Mira': 'mira.png',
        'Rao': 'rao.png',
        'Engineer': playerGender === 'female' ? 'architect_female.png' : 'architect.png',
        'Architect': playerGender === 'female' ? 'architect_female.png' : 'architect.png',
        'Isha': 'isha.png',
        'Foreman': 'foreman.png',
        'Old Foreman': 'foreman.png',
        'Advisor': 'advisor.png',
        'Client': 'client.png',
        'Inspector': 'client.png'
    };

    const portrait = imageMap[line.character];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-4 left-4 right-4 md:left-20 md:right-20 z-50 pointer-events-auto flex items-end justify-center"
            >
                {/* Character Portrait (Left or Right based on speaker?) 
                 For now, let's keep it simple: Image pops up behind the text box
             */}
                <div className="relative w-full max-w-4xl">

                    {/* Portrait Image */}
                    {portrait && (
                        <motion.div
                            key={line.character}
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`absolute bottom-24 ${isPlayer ? 'right-10' : 'left-0 md:-left-10'} z-0 bg-transparent`}
                        >
                            <img
                                src={`/assets/${portrait}`}
                                alt={line.character}
                                className="h-64 md:h-80 object-contain drop-shadow-xl"
                            />
                        </motion.div>
                    )}

                    {/* Text Box Container */}
                    <div
                        className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(30,58,138,0.3)] border border-slate-700/50 p-6 md:p-8 cursor-pointer z-10 min-h-[160px] flex flex-col justify-center"
                        onClick={() => {
                            soundManager.playSFX('typing', 0.6);
                            advanceDialogue();
                        }}
                    >
                        {/* Character Name Tag */}
                        <div className={`absolute -top-5 left-8 px-6 py-2 rounded-xl text-white font-black text-lg shadow-lg transform -rotate-1 ${bgColor}`}>
                            {displayName.toUpperCase()}
                        </div>

                        {/* Text Content */}
                        <div className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed font-sans mt-2">
                            <LeanTooltipText text={processedText} />
                        </div>

                        {/* Continue Indicator */}
                        <div className="absolute bottom-4 right-6 text-slate-400 text-sm animate-pulse font-bold tracking-widest uppercase flex items-center gap-1">
                            Next <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
