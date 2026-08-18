import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import soundManager from '@/lib/soundManager';
import { LeanTooltipText } from './LeanTooltip';
import { CHARACTERS } from '@/data/characters';

const DialogueBoxInner: React.FC = () => {
    const { currentDialogue, dialogueIndex, advanceDialogue, playerName, playerGender, weeklyPlan, columns, lpi } = useGameStore();

    const line = currentDialogue![dialogueIndex];

    // Calculate Dynamic Stats for Text Replacement
    const promised = weeklyPlan.length;
    const doneTasks = columns.find(c => c.id === 'done')?.tasks || [];
    const completed = doneTasks.filter(t =>
        weeklyPlan.includes(t.id) || weeklyPlan.includes(t.originalId || '')
    ).length;
    const ppc = promised > 0 ? Math.round((completed / promised) * 100) : 0;

    // Replace Placeholders
    const processedText = line.text
        .replace(/Engineer|Architect|Lean Champion/g, playerName)
        .replace(/{promised}/g, promised.toString())
        .replace(/{completed}/g, completed.toString())
        .replace(/{ppc}/g, ppc.toString());

    // Typewriter State
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        setDisplayedText('');
        setIsTyping(true);
        let currentText = '';
        let charIndex = 0;
        
        const interval = setInterval(() => {
            if (charIndex < processedText.length) {
                currentText += processedText[charIndex];
                setDisplayedText(currentText);
                charIndex++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 20); // Fast typing speed

        return () => clearInterval(interval);
    }, [processedText, dialogueIndex]);

    const handleClick = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (isTyping) {
            setDisplayedText(processedText);
            setIsTyping(false);
        } else {
            soundManager.playSFX('typing', 0.6);
            advanceDialogue();
        }
    };

    // Logic to determine character side (Left/Right) or Color based on name
    const isPlayer = line.character === 'Engineer' || line.character === 'Architect';

    // Dynamic Name Display
    const displayName = isPlayer ? playerName : (CHARACTERS[line.character]?.name || line.character);

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
        'Inspector': 'bg-amber-600',
        'Owner': 'bg-fuchsia-700'
    };

    const bgColor = colorMap[line.character] || 'bg-slate-700';

    // Mapping for character images (filenames in public/assets)
    const imageMap: Record<string, string> = {
        'Mira': 'mira.png',
        'Rao': 'rao.jpg',
        'Engineer': playerGender === 'female' ? 'architect_female.jpg' : 'architect.jpg',
        'Architect': playerGender === 'female' ? 'architect_female.jpg' : 'architect.jpg',
        'Isha': 'isha.jpg',
        'Foreman': 'foreman.jpg',
        'Old Foreman': 'foreman.jpg',
        'Advisor': 'lps_advisor.jpg',
        'Client': 'client_rep.jpg',
        'Inspector': 'quality_inspector.jpg',
        'Owner': 'client_owner.jpg'
    };

    const portrait = imageMap[line.character];

    /**
     * Focal point (object-position) per portrait, because the source art is full scenes rather
     * than busts and the subject sits in a different place in each one. A single shared
     * object-position meant e.g. Mira's portrait framed sky and crane jibs instead of a face.
     * Values below are eyeballed against the actual assets; default is a safe upper-centre.
     */
    const PORTRAIT_FOCUS: Record<string, string> = {
        'mira.png': '68% 50%',
        'rao.jpg': '50% 34%',
        'architect.jpg': '52% 17%',
        'architect_female.jpg': '52% 17%',
    };
    const focus = portrait ? (PORTRAIT_FOCUS[portrait] ?? '50% 24%') : '50% 24%';

    /**
     * Every dialogue line in the chapter data already carries an `emotion`, but nothing rendered
     * it, so characters read as static regardless of what they were saying. There is only one
     * portrait per character, so emotion is conveyed through colour grading, ring colour and
     * idle motion rather than swapped art.
     */
    const emotion = line.emotion ?? 'neutral';
    const EMOTION_STYLE: Record<string, {
        filter: string; ring: string; label: string; anim: any;
    }> = {
        neutral: {
            filter: 'none',
            ring: isPlayer ? 'ring-cyan-400/50' : 'ring-slate-300/40',
            label: '',
            anim: { y: [0, -2, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
        },
        happy: {
            filter: 'saturate(1.15) brightness(1.08)',
            ring: 'ring-emerald-400/70',
            label: 'PLEASED',
            anim: { y: [0, -6, 0], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
        },
        stressed: {
            filter: 'saturate(0.8) brightness(0.95)',
            ring: 'ring-amber-400/70',
            label: 'UNDER PRESSURE',
            anim: { y: [0, -1.5, 0, 1.5, 0], transition: { duration: 0.45, repeat: Infinity, ease: 'linear' } },
        },
        angry: {
            filter: 'saturate(1.25) brightness(0.95) hue-rotate(-8deg)',
            ring: 'ring-red-500/80',
            label: 'ANGRY',
            anim: { x: [0, -3, 3, -2, 2, 0], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 1.1 } },
        },
        worried: {
            filter: 'saturate(0.7) brightness(0.93)',
            ring: 'ring-indigo-400/70',
            label: 'WORRIED',
            anim: { rotate: [0, -1.5, 0, 1.5, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } },
        },
    };
    const mood = EMOTION_STYLE[emotion] ?? EMOTION_STYLE.neutral;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute left-4 right-4 md:left-20 md:right-20 z-50 pointer-events-auto flex items-end justify-center"
                style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
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
                            className={`absolute bottom-16 sm:bottom-20 ${isPlayer ? 'right-2 sm:right-8' : 'left-2 sm:left-0 md:-left-6'} z-0 bg-transparent hidden sm:block`}
                        >
                            {/* Framed bust rather than a tall full-figure crop: the source art is a
                                full construction scene, so a large rectangle showed cranes and
                                background workers competing with the real scene behind the UI.
                                A tight round frame plus a soft edge fade keeps attention on the
                                face and lets the busy background dissolve into the panel. */}
                            <motion.div className="relative" animate={mood.anim}>
                                <div
                                    className={`w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden ring-2 ${mood.ring} shadow-[0_12px_30px_-8px_rgba(0,0,0,0.75)] bg-slate-800 transition-all duration-500`}
                                    style={{
                                        WebkitMaskImage: 'radial-gradient(circle at 50% 45%, #000 62%, transparent 100%)',
                                        maskImage: 'radial-gradient(circle at 50% 45%, #000 62%, transparent 100%)',
                                    }}
                                >
                                    <img
                                        src={`/assets/${portrait}`}
                                        alt={line.character}
                                        className="w-full h-full object-cover scale-[1.15] transition-[filter] duration-500"
                                        style={{ objectPosition: focus, filter: mood.filter }}
                                    />
                                </div>
                                {mood.label && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950/85 border border-white/10 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-300 whitespace-nowrap">
                                        {mood.label}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Text Box Container */}
                    <div
                        className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(30,58,138,0.3)] border border-slate-700/50 p-4 sm:p-6 md:p-8 cursor-pointer z-10 min-h-[120px] sm:min-h-[160px] flex flex-col justify-center"
                        onClick={handleClick}
                    >
                        {/* Progress Counter */}
                        <div className="absolute -top-3 right-6 bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-t-md border-x border-t border-slate-700/50 uppercase tracking-widest">
                            {dialogueIndex + 1} / {currentDialogue.length}
                        </div>

                        {/* Character Name Tag — carries the mood too, since the portrait is hidden
                            on small screens and would otherwise be the only emotion cue. */}
                        <div className={`absolute -top-4 sm:-top-5 left-4 sm:left-8 flex items-center gap-2 px-3 sm:px-6 py-1 sm:py-2 rounded-xl text-white font-black text-sm sm:text-base md:text-lg shadow-lg transform -rotate-1 ${bgColor}`}>
                            {displayName.toUpperCase()}
                            {mood.label && (
                                <span className="sm:hidden text-[8px] font-black uppercase tracking-widest opacity-80">
                                    · {mood.label}
                                </span>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="text-base sm:text-lg md:text-2xl text-slate-200 font-medium leading-relaxed font-sans mt-2">
                            <LeanTooltipText text={displayedText} />
                        </div>

                        {/* Continue Indicator */}
                        {!isTyping && (
                            <div className="absolute bottom-2 sm:bottom-4 right-4 sm:right-6 text-slate-400 text-xs sm:text-sm animate-pulse font-bold tracking-widest uppercase flex items-center gap-1">
                                Next <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export const DialogueBox: React.FC = () => {
    const currentDialogue = useGameStore(s => s.currentDialogue);
    if (!currentDialogue) return null;
    return <DialogueBoxInner />;
};
