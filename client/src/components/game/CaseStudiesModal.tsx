import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, BookOpen, X, User, UserCircle, Hexagon, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import soundManager from '@/lib/soundManager';
import { useGameStore } from '@/store/gameStore';
import { useGame } from '@/hooks/use-game';
import { useAuth } from '@/hooks/use-auth.tsx';

export interface ChapterDef {
    id: number;
    title: string;
    description: string;
    isLocked: boolean;
    theme: string;
}

const CASE_STUDIES: ChapterDef[] = [
    {
        id: 3, // Maps to chapter 4 in store
        title: "Case Study 1: Terminal T-Upgrade",
        description: "Manage logistics and minimize passenger disruption in a constrained airport midfield expansion.",
        isLocked: false,
        theme: "purple"
    },
    {
        id: 4, // Maps to chapter 5 in store
        title: "Case Study 2: Coastal Link",
        description: "Handle linear-project flow, staging buffers, and traffic management on a coastal highway.",
        isLocked: false,
        theme: "cyan"
    }
];

interface CaseStudiesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalStep = 'select' | 'create-profile';

export function CaseStudiesModal({ isOpen, onClose }: CaseStudiesModalProps) {
    const [, setLocation] = useLocation();
    const { startChapter, setBypassHydration, setPlayerProfile, setFlag, flags } = useGameStore();
    const { gameState } = useGame();
    const { user } = useAuth();

    const [hoveredCase, setHoveredCase] = useState<number | null>(null);
    const [step, setStep] = useState<ModalStep>('select');
    const [pendingCaseId, setPendingCaseId] = useState<number | null>(null);

    // Profile form state
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');

    // Detect an existing saved profile from DB
    const savedName = gameState?.playerName && gameState.playerName !== 'Architect'
        ? gameState.playerName : null;
    const savedGender = (gameState as any)?.playerGender as 'male' | 'female' | undefined;
    const hasExistingProfile = !!user && !!savedName;

    const launchCase = (storeChapterId: number) => {
        soundManager.playSFX('success');
        startChapter(storeChapterId);
        setBypassHydration(true);
        setLocation('/game');
    };

    const handleSelectCase = (caseStudy: ChapterDef) => {
        soundManager.playSFX('click');
        const storeChapterId = caseStudy.id + 1; // 3→4, 4→5

        if (flags['character_created'] || hasExistingProfile) {
            // Profile exists — resume it (set it in store if not already set) then launch
            if (hasExistingProfile && !flags['character_created']) {
                setPlayerProfile(savedName!, savedGender ?? 'male');
                setFlag('character_created', true);
            }
            launchCase(storeChapterId);
        } else {
            // No profile — show inline creation
            setPendingCaseId(storeChapterId);
            setStep('create-profile');
        }
    };

    const handleProfileConfirm = () => {
        if (!name.trim() || pendingCaseId === null) return;
        setPlayerProfile(name, gender);
        setFlag('character_created', true);
        launchCase(pendingCaseId);
    };

    const handleClose = () => {
        setStep('select');
        setPendingCaseId(null);
        setName('');
        setGender('male');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                onClick={handleClose}
            />

            <AnimatePresence mode="wait">
                {step === 'select' ? (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-slate-800/95 backdrop-blur-2xl border border-slate-600/50 rounded-3xl flex flex-col max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 md:p-8 border-b border-white/5 flex justify-between items-start shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                                    Premium Scenarios
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 tracking-tight mb-2 drop-shadow-md uppercase">Case Studies</h2>
                                <p className="text-lg text-slate-300 font-light">Test your lean construction knowledge in realistic, complex scenarios.</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="relative z-10 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 font-sans bg-slate-900/50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {CASE_STUDIES.map((caseStudy, index) => {
                                    const isHovered = hoveredCase === caseStudy.id;
                                    const theme = {
                                        color: caseStudy.theme === 'purple' ? 'text-purple-400' : 'text-cyan-400',
                                        border: caseStudy.theme === 'purple' ? 'border-purple-500/40' : 'border-cyan-500/40',
                                        bg: 'bg-slate-800/80',
                                        glow: caseStudy.theme === 'purple' ? 'rgba(168,85,247,0.25)' : 'rgba(34,211,238,0.25)',
                                        button: caseStudy.theme === 'purple' ? 'bg-purple-600' : 'bg-cyan-600'
                                    };

                                    return (
                                        <motion.div
                                            key={caseStudy.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                                            onMouseEnter={() => setHoveredCase(caseStudy.id)}
                                            onMouseLeave={() => setHoveredCase(null)}
                                            onClick={() => handleSelectCase(caseStudy)}
                                            className={`group relative p-6 backdrop-blur-xl border-2 rounded-3xl flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden ${theme.bg} ${theme.border}`}
                                            style={{
                                                boxShadow: isHovered ? `0 20px 40px -10px ${theme.glow}` : '0 10px 30px -10px rgba(0,0,0,0.5)'
                                            }}
                                        >
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                                style={{ background: `radial-gradient(circle at 100% 0%, ${theme.glow} 0%, transparent 60%)` }} />

                                            <div className="relative z-10 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 bg-black/40 border ${theme.border} ${theme.color}`}>
                                                            <BookOpen className="w-3 h-3" /> Case Study {index + 1}
                                                        </span>
                                                        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md">
                                                            {caseStudy.title.split(': ')[1] || caseStudy.title}
                                                        </h3>
                                                    </div>

                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isHovered ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'shadow-lg'} ${theme.button}`}>
                                                        <Play className="w-5 h-5 fill-white text-white ml-1" />
                                                    </div>
                                                </div>

                                                <p className="text-slate-300 font-light text-sm md:text-base leading-relaxed mb-6 flex-1 opacity-90">
                                                    {caseStudy.description}
                                                </p>

                                                <div className="pt-4 border-t border-white/10 flex justify-between items-center relative">
                                                    <span className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs bg-white/10 px-4 py-2 rounded-full border border-white/20 group-hover:bg-white/20 transition-all">
                                                        Start Scenario
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="create-profile"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl border border-blue-500/20 rounded-3xl shadow-[0_0_80px_-15px_rgba(99,102,241,0.3)] overflow-hidden"
                    >
                        {/* Back button + header */}
                        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 p-6 md:p-8 relative overflow-hidden border-b border-blue-500/20">
                            <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                            <button
                                onClick={() => setStep('select')}
                                className="relative z-10 flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-5 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Cases
                            </button>
                            <div className="relative z-10 text-center">
                                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4 shadow-inner text-blue-400">
                                    <Hexagon className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Create Your Profile</h2>
                                <p className="text-blue-400/80 text-xs font-bold uppercase tracking-widest mt-2">Before entering the case study</p>
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
                                    onKeyDown={(e) => e.key === 'Enter' && handleProfileConfirm()}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-blue-500 rounded-xl px-5 py-4 text-white text-lg font-bold outline-none placeholder-slate-600 transition-all shadow-inner"
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
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                            <User className="w-6 h-6" />
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${gender === 'male' ? 'text-blue-400' : 'text-slate-500'}`}>Male Avatar</span>
                                    </button>
                                    <button
                                        onClick={() => setGender('female')}
                                        className={`flex-1 p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 ${gender === 'female' ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-slate-950/40 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${gender === 'female' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${gender === 'female' ? 'text-indigo-400' : 'text-slate-500'}`}>Female Avatar</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleProfileConfirm}
                                disabled={!name.trim()}
                                className="w-full bg-blue-600/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] active:scale-[0.98]"
                            >
                                Enter Case Study
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
