import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock, ChevronRight, ArrowLeft, BookOpen, AlertTriangle, Target, HardHat, Gauge, Timer } from 'lucide-react';
import soundManager from '@/lib/soundManager';
import { useGameStore } from '@/store/gameStore';
import { CharacterCreationModal } from '@/components/game/CharacterCreationModal';

export interface ChapterDef {
    id: number;
    title: string;
    description: string;
    isLocked: boolean;
    theme: string;
    playtime?: string;
    isComingSoon?: boolean;
}

const CHAPTERS: ChapterDef[] = [
    {
        id: 0,
        title: "Episode 1: The Basics of Flow",
        description: "Learn the fundamentals of Lean Construction by completing simple tasks efficiently.",
        isLocked: false, // Always unlocked
        theme: "blue",
        playtime: "~15 min"
    },
    {
        id: 1,
        title: "Episode 2: The Last Planner",
        description: "Experience the Last Planner System. Manage promises, handle constraints, and track PPC.",
        isLocked: true, // Will be dynamically checked
        theme: "emerald",
        playtime: "~25 min"
    },
    {
        id: 2,
        title: "Episode 3: The 5S Principles",
        description: "Organize the chaotic depot. Sort, Set in order, Shine, Standardize, and Sustain.",
        isLocked: true,
        theme: "amber",
        playtime: "~20 min"
    },
    {
        id: 3,
        title: "Episode 4: Pull & JIT Systems",
        description: "Master Pull Systems and JIT (Just-in-Time) delivery to eliminate overproduction waste.",
        isLocked: true,
        theme: "purple",
        playtime: "~30 min"
    }
];

// Enhanced content for Chapter 5 overview (Coming Soon)
const CHAPTER_5_PREVIEW = {
    title: "Episode 5: Heijunka & Takt",
    subtitle: "Leveling the Load",
    overview: "Once the work is pulled Just-In-Time, the next challenge is creating stability. Learn to level production (Heijunka) and maintain a steady beat (Takt Time) to avoid the cycle of 'hurry up and wait'.",
    learningGoals: [
        "Calculate Takt Time based on customer demand",
        "Implement Heijunka boxes for production leveling",
        "Manage changeover times between different types of work",
        "Apply the Yamazumi technique for task balancing",
        "Create rhythmic production cycles to reduce stress"
    ],
    gameplay: [
        "Distribute complex tasks evenly across the work week",
        "Balance crew assignments to match the site beat",
        "Adjust production rate to avoid over-pacing downstream trades",
        "Handle mix-model production (Drywall vs. Electrical vs. Plumbing)"
    ],
    scenario: "The project has entered the repeating floor phase. Instead of chaos, you must create a 'Production Train' where every crew moves at the same speed, floor by floor. Any break in the beat causes the whole train to derail. Can you hold the Takt?"
};

const DUMMY_CHAPTERS: ChapterDef[] = [
    ...CHAPTERS,
    {
        id: 4,
        title: "Episode 5: Coming Soon",
        description: "Experience Heijunka (Production Leveling) and Takt Time to create a smooth, rhythmic site beat.",
        isLocked: true,
        isComingSoon: true,
        theme: "cyan"
    }
];

export default function ChapterSelect() {
    const [, setLocation] = useLocation();
    const [hoveredChapter, setHoveredChapter] = useState<number | null>(null);
    const [showUpcomingModal, setShowUpcomingModal] = useState(false);

    // Get unlocked chapters from state
    const { unlockedChapters, setChapter, chapter: activeChapter, day: currentDay } = useGameStore();

    useEffect(() => {
        soundManager.playBGM('menu', 0.3);
    }, []);

    const handleBack = () => {
        soundManager.playSFX('click');
        setLocation('/');
    };

    const handleSelectChapter = (chapterId: number, isLocked?: boolean, isComingSoon?: boolean) => {
        soundManager.playSFX('click');
        if (isComingSoon) {
            setShowUpcomingModal(true);
            return;
        }

        if (!isLocked) {
            // chapterId is 0-indexed in DUMMY_CHAPTERS, so add 1 to get the store's chapter number
            setChapter(chapterId + 1);
            soundManager.playSFX('success');
            setLocation('/game');
        } else {
            soundManager.playSFX('alert');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-6 md:p-10 relative overflow-x-hidden font-sans vignette film-grain">
            {/* Character Creation for New Players */}
            <CharacterCreationModal />

            {/* Premium Twilight Industrial Ambient Background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Photographic Background Asset */}
                <div
                    className="absolute inset-0 bg-[url('/images/chapter_bg.jpg')] bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity"
                    style={{ filter: 'grayscale(0.5) contrast(1.2)' }}
                />
                {/* Dark Gradient Overlay for optimal contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-950" />

                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] right-[-20%] w-[70%] h-[70%] bg-indigo-500/20 blur-[150px] rounded-full"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
                    className="absolute bottom-[-20%] left-[-20%] w-[70%] h-[70%] bg-cyan-500/20 blur-[150px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-15 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 h-full flex flex-col">
                {/* Header - User Friendly Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6"
                >
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleBack}
                            data-testid="button-back"
                            className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 font-bold uppercase tracking-widest text-xs shadow-lg backdrop-blur-md"
                        >
                            <ArrowLeft className="w-4 h-4" /> Go Back
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 tracking-tight drop-shadow-sm">Select Episode</h1>
                            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mt-1">Lean Construction Story</p>
                        </div>
                    </div>
                </motion.div>

                {/* Chapters Grid - 2x2 Layout Anime/VN Style */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 content-start">
                    {DUMMY_CHAPTERS.map((chapter, index) => {
                        // The store uses 1-indexed chapters (1, 2, 3), but the DUMMY_CHAPTERS array uses 0-indexed IDs (0, 1, 2)
                        const storeChapterId = chapter.id + 1;
                        const isEffectivelyLocked = chapter.isComingSoon ? true : !unlockedChapters.includes(storeChapterId);
                        const isHovered = hoveredChapter === chapter.id;

                        let theme = {
                            color: 'text-slate-400',
                            border: 'border-slate-700/50',
                            bg: 'bg-slate-800/60',
                            glow: 'rgba(255,255,255,0)',
                            button: 'bg-slate-700',
                            corner: ''
                        };

                        if (!isEffectivelyLocked) {
                            if (chapter.id === 0) theme = { color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-slate-800/80', glow: 'rgba(34,211,238,0.25)', button: 'bg-cyan-600', corner: 'hud-tint-cyan' };
                            else if (chapter.id === 1) theme = { color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-slate-800/80', glow: 'rgba(16,185,129,0.25)', button: 'bg-emerald-600', corner: 'hud-tint-emerald' };
                            else if (chapter.id === 2) theme = { color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-slate-800/80', glow: 'rgba(245,158,11,0.25)', button: 'bg-amber-600', corner: 'hud-tint-amber' };
                            else if (chapter.id === 3) theme = { color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-slate-800/80', glow: 'rgba(168,85,247,0.25)', button: 'bg-purple-600', corner: 'hud-tint-purple' };
                        } else if (chapter.isComingSoon) {
                            theme = { color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-slate-800/60', glow: 'rgba(34,211,238,0.15)', button: 'bg-cyan-900/60', corner: 'hud-tint-cyan' };
                        }

                        return (
                            <motion.div
                                key={chapter.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                                onMouseEnter={() => setHoveredChapter(chapter.id)}
                                onMouseLeave={() => setHoveredChapter(null)}
                                onClick={() => handleSelectChapter(chapter.id, isEffectivelyLocked, chapter.isComingSoon)}
                                data-testid={`chapter-card-${chapter.id}`}
                                className={`group relative p-8 metal-panel backdrop-blur-xl border-2 rounded-3xl flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden hud-corners ${theme.bg} ${theme.border} ${theme.corner} ${isEffectivelyLocked && !chapter.isComingSoon ? 'opacity-70 hover:opacity-100 grayscale-[0.4] hover:grayscale-0' : ''}`}
                                style={{
                                    // Inline box-shadow wins over .metal-panel, so re-state its inset bevel
                                    // here or the cards lose their physical edge highlight.
                                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.5), ${
                                        isHovered && (!isEffectivelyLocked || chapter.isComingSoon)
                                            ? `0 20px 40px -10px ${theme.glow}`
                                            : '0 10px 30px -10px rgba(0,0,0,0.5)'
                                    }`
                                }}
                            >
                                {/* Internal Animated Gradient Glow */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                    style={{ background: `radial-gradient(circle at 50% 120%, ${theme.glow} 0%, transparent 70%)` }} />

                                {/* Hazard-stripe overlay for locked episodes — reads as "restricted" at a glance */}
                                {isEffectivelyLocked && !chapter.isComingSoon && (
                                    <div
                                        className="absolute top-0 left-0 right-0 h-2 opacity-70 pointer-events-none"
                                        style={{
                                            backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 8px, #eab308 8px, #eab308 16px)'
                                        }}
                                    />
                                )}

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-black/40 border ${theme.border} ${theme.color}`}>
                                                    Episode 0{index + 1}
                                                </span>
                                                {chapter.playtime && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-black/20 px-2 py-1 rounded-md border border-slate-700/50">
                                                        <Timer className="w-3 h-3" /> {chapter.playtime}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                                                {chapter.title}
                                            </h2>
                                        </div>

                                        {isEffectivelyLocked && !chapter.isComingSoon ? (
                                            <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-white/10 shadow-inner">
                                                <Lock className="w-5 h-5 text-slate-500" />
                                            </div>
                                        ) : (
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${isHovered ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'shadow-lg'} ${theme.button}`}>
                                                {chapter.isComingSoon ? <AlertTriangle className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 fill-white text-white ml-1" />}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-slate-300 font-light text-base md:text-lg leading-relaxed mb-6 flex-1 opacity-90">
                                        {chapter.description}
                                    </p>

                                    {/* Progress Bar */}
                                    {!isEffectivelyLocked && !chapter.isComingSoon && (
                                        <div className="mb-6">
                                            {(() => {
                                                let progress = 0;
                                                const maxUnlocked = Math.max(...unlockedChapters);
                                                if (storeChapterId < maxUnlocked) {
                                                    progress = 100; // Completed
                                                } else if (storeChapterId === activeChapter) {
                                                    // Estimate progress based on current day vs typical 5-day chapter length
                                                    // Day starts at 1, 6, 12, etc depending on chapter. 
                                                    // A simple proxy: we know the player has started it.
                                                    // We can cap it between 10% and 90% for a "started" chapter.
                                                    const dayOffset = ((currentDay - 1) % 5) + 1; 
                                                    progress = Math.min(90, Math.max(10, (dayOffset / 5) * 100));
                                                }

                                                return (
                                                    <div className="w-full bg-slate-900/50 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
                                                        <div 
                                                            className={`h-full ${progress === 100 ? theme.button : 'bg-slate-400'} transition-all duration-1000`} 
                                                            style={{ width: `${progress}%` }} 
                                                        />
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-white/10 flex justify-between items-center relative">
                                        {chapter.isComingSoon ? (
                                            <span className={`flex items-center gap-2 font-bold uppercase tracking-wider text-xs transition-colors ${theme.color}`}>
                                                View Briefing <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        ) : isEffectivelyLocked ? (
                                            <span className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs">
                                                <Lock className="w-4 h-4" /> Locked Episode
                                            </span>
                                        ) : (
                                            <span className={`flex items-center gap-2 text-white font-black uppercase tracking-wider text-xs px-5 py-2.5 rounded-full border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_12px_-4px_rgba(0,0,0,0.5)] group-hover:brightness-110 group-hover:-translate-y-0.5 transition-all ${theme.button}`}>
                                                Play Episode <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Coming Soon Feature Placeholders */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div
                        data-testid="feature-difficulty-coming-soon"
                        className="group relative flex items-center justify-between px-6 py-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-400 font-bold uppercase tracking-widest text-xs cursor-default shadow-md"
                    >
                        <span className="flex items-center gap-3">
                            <Gauge className="w-4 h-4 opacity-70" />
                            Difficulty Levels
                        </span>
                        <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-500 font-bold border border-slate-800">COMING SOON</span>
                    </div>

                    <div
                        data-testid="feature-timed-challenge-coming-soon"
                        className="group relative flex items-center justify-between px-6 py-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-400 font-bold uppercase tracking-widest text-xs cursor-default shadow-md"
                    >
                        <span className="flex items-center gap-3">
                            <Timer className="w-4 h-4 opacity-70" />
                            Timed Challenge Mode
                        </span>
                        <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-500 font-bold border border-slate-800">COMING SOON</span>
                    </div>
                </motion.div>
            </div>

            {/* Upcoming Episode Preview Modal - Visual Novel Readability */}
            <AnimatePresence>
                {showUpcomingModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            onClick={() => setShowUpcomingModal(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-slate-800/95 backdrop-blur-2xl border border-slate-600/50 rounded-3xl flex flex-col max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)]"
                        >
                            {/* Premium Header */}
                            <div className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 p-6 md:p-8 border-b border-white/5 flex justify-between items-start shrink-0 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                                        Upcoming Episode
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-md">{CHAPTER_5_PREVIEW.title}</h2>
                                    <p className="text-lg text-slate-300 font-light">{CHAPTER_5_PREVIEW.subtitle}</p>
                                </div>
                                <button
                                    onClick={() => setShowUpcomingModal(false)}
                                    className="relative z-10 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 md:p-8 overflow-y-auto flex-1 font-sans custom-scrollbar">
                                <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-3xl">
                                    {CHAPTER_5_PREVIEW.overview}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 relative">
                                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <BookOpen className="w-4 h-4" /> Learning Goals
                                        </h3>
                                        <ul className="space-y-3">
                                            {CHAPTER_5_PREVIEW.learningGoals.map((goal, i) => (
                                                <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                    {goal}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 relative">
                                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <Target className="w-4 h-4" /> Planned Gameplay
                                        </h3>
                                        <ul className="space-y-3">
                                            {CHAPTER_5_PREVIEW.gameplay.map((item, i) => (
                                                <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-cyan-900/30 to-slate-900/30 border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden">
                                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">Narrative Scenario</h3>
                                    <p className="text-slate-300 leading-relaxed text-sm italic">
                                        "{CHAPTER_5_PREVIEW.scenario}"
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-black/40 border-t border-white/5 shrink-0 flex justify-end">
                                <button
                                    onClick={() => setShowUpcomingModal(false)}
                                    className="w-full md:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl uppercase tracking-widest text-xs transition-colors shadow-lg shadow-purple-900/20"
                                >
                                    Close Briefing
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
