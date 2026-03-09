import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useGame } from '@/hooks/use-game';
import { useAuth } from '@/hooks/use-auth.tsx';
import { User, UserCircle, Hexagon, Play, RefreshCcw, BookOpen, Trophy, Calendar, Zap } from 'lucide-react';

type Step = 'choice' | 'create';

const CHAPTER_NAMES: Record<number, string> = {
    1: 'The Foundations',
    2: 'The Overpromised Mall',
    3: 'The Tangled Depot',
    4: 'Pull & JIT Systems',
};

const maleAvatarSrc = '/assets/architect.jpg';
const femaleAvatarSrc = '/assets/architect_female.jpg';

export const CharacterCreationModal: React.FC = () => {
    const { setPlayerProfile, setFlag, flags, startChapter } = useGameStore();
    const { gameState } = useGame();
    const { user } = useAuth();

    const [step, setStep] = useState<Step>('choice');
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [avatarLoaded, setAvatarLoaded] = useState(false);

    useEffect(() => {
        setAvatarLoaded(false);
        const img = new Image();
        img.src = gender === 'female' ? femaleAvatarSrc : maleAvatarSrc;
        img.onload = () => setAvatarLoaded(true);
    }, [gender]);

    if (flags['character_created']) return null;

    const savedName = gameState?.playerName && gameState.playerName !== 'Architect'
        ? gameState.playerName : null;
    const savedGender = (gameState as any)?.playerGender as 'male' | 'female' | undefined;
    const savedChapter = gameState?.chapter ?? 1;
    const savedDay = (gameState as any)?.kanbanState?.day ?? (gameState as any)?.day ?? 1;
    const savedBadges = (gameState as any)?.unlockedBadges?.length ?? 0;
    const savedLpi = (gameState as any)?.lpi;

    const hasExistingProfile = !!user && !!savedName;

    const handleResumeProfile = () => {
        if (!savedName) return;
        setPlayerProfile(savedName, savedGender ?? 'male');
        setFlag('character_created', true);
    };

    const handleConfirm = () => {
        if (!name.trim()) return;
        setPlayerProfile(name, gender);
        setFlag('character_created', true);
    };

    const showChoice = hasExistingProfile && step === 'choice';

    const floatingParticles = Array.from({ length: 6 }, (_, i) => i);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050812]/90 backdrop-blur-xl p-4 md:p-6 pointer-events-auto font-sans">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {floatingParticles.map((i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-blue-500/30"
                        initial={{
                            x: `${20 + i * 12}%`,
                            y: '110%',
                            opacity: 0,
                        }}
                        animate={{
                            y: '-10%',
                            opacity: [0, 0.6, 0],
                        }}
                        transition={{
                            duration: 6 + i * 1.5,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: 'linear',
                        }}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {showChoice ? (
                    <motion.div
                        key="choice"
                        initial={{ scale: 0.92, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                        className="bg-slate-900/90 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-[0_0_80px_-15px_rgba(59,130,246,0.15)] border border-blue-500/20 overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 p-6 md:p-8 relative overflow-hidden border-b border-blue-500/20">
                            <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                            <motion.div
                                className="relative z-10 text-center"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.15 }}
                            >
                                <motion.div
                                    className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4 text-blue-400"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Hexagon className="w-8 h-8" />
                                </motion.div>
                                <h1 data-testid="text-welcome-back" className="text-2xl md:text-3xl font-black text-white tracking-tight">Welcome Back!</h1>
                                <p className="text-blue-400/80 text-xs font-bold uppercase tracking-widest mt-2">Architect Profile Found</p>
                            </motion.div>
                        </div>

                        <div className="p-6 md:p-8 space-y-4">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-4"
                            >
                                <div className="w-14 h-14 rounded-full shrink-0 overflow-hidden border-2 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                    <img
                                        src={(savedGender ?? 'male') === 'female' ? femaleAvatarSrc : maleAvatarSrc}
                                        alt="Saved avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Saved Architect</p>
                                    <h2 data-testid="text-saved-name" className="text-xl font-black text-white">{savedName}</h2>
                                    <p className="text-xs text-slate-500 capitalize mt-0.5">
                                        Chapter {savedChapter} • Day {savedDay}
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.35 }}
                                className="rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-700/30 p-4 space-y-3"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                                    Story So Far
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
                                        <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Chapter</p>
                                            <p data-testid="text-recap-chapter" className="text-sm font-bold text-white leading-tight">{CHAPTER_NAMES[savedChapter] ?? `Chapter ${savedChapter}`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
                                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Day</p>
                                            <p data-testid="text-recap-day" className="text-sm font-bold text-white leading-tight">Day {savedDay}</p>
                                        </div>
                                    </div>
                                    {savedLpi && (
                                        <>
                                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
                                                <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Efficiency</p>
                                                    <p data-testid="text-recap-efficiency" className="text-sm font-bold text-white leading-tight">{savedLpi.flowEfficiency ?? 50}%</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
                                                <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Badges</p>
                                                    <p data-testid="text-recap-badges" className="text-sm font-bold text-white leading-tight">{savedBadges} Earned</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={handleResumeProfile}
                                data-testid="button-continue-profile"
                                className="w-full flex items-center justify-center gap-3 bg-blue-600/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/50 font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] active:scale-[0.98]"
                            >
                                <Play className="w-4 h-4 fill-current" /> Continue as {savedName}
                            </motion.button>

                            <motion.button
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                onClick={() => setStep('create')}
                                data-testid="button-start-fresh"
                                className="w-full flex items-center justify-center gap-3 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/50 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
                            >
                                <RefreshCcw className="w-3.5 h-3.5" /> Start Fresh — New Profile
                            </motion.button>

                            <p className="text-center text-slate-600 text-[10px]">
                                Starting fresh creates a new playthrough. Your chapter progress and badges are always linked to your account.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="create"
                        initial={{ scale: 0.92, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                        className="bg-slate-900/90 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-[0_0_80px_-15px_rgba(59,130,246,0.15)] border border-blue-500/20 flex flex-col overflow-hidden max-h-[90vh]"
                    >
                        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 p-4 md:p-6 relative overflow-hidden shrink-0 border-b border-blue-500/20">
                            <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                            {hasExistingProfile && (
                                <button
                                    onClick={() => setStep('choice')}
                                    data-testid="button-back-to-choice"
                                    className="relative z-10 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-1 transition-colors"
                                >
                                    ← Back
                                </button>
                            )}
                            <motion.div
                                className="relative z-10 text-center"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <motion.div
                                    className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4 shadow-inner text-blue-400"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Hexagon className="w-8 h-8" />
                                </motion.div>
                                <h1 data-testid="text-create-profile" className="text-2xl md:text-3xl font-black text-white tracking-tight">Lean Architect Profile</h1>
                                <p className="text-blue-400/80 text-xs font-bold uppercase tracking-widest mt-2">Create Lean Architect Profile</p>
                            </motion.div>
                        </div>

                        <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
                            <motion.div
                                initial={{ x: -15, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-3"
                            >
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                                    Engineer Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                    data-testid="input-player-name"
                                    className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-base md:text-lg font-bold outline-none placeholder-slate-600 transition-all shadow-inner focus:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                    placeholder="Enter Name..."
                                    autoFocus
                                />
                            </motion.div>

                            <motion.div
                                initial={{ x: -15, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                                    Select Avatar
                                </label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setGender('male')}
                                        data-testid="button-gender-male"
                                        className={`flex-1 p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${gender === 'male' ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-slate-950/40 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${gender === 'male' ? 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-slate-700'}`}>
                                            <img
                                                src={maleAvatarSrc}
                                                alt="Male architect avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${gender === 'male' ? 'text-blue-400' : 'text-slate-500'}`}>Male Avatar</span>
                                    </button>
                                    <button
                                        onClick={() => setGender('female')}
                                        data-testid="button-gender-female"
                                        className={`flex-1 p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${gender === 'female' ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-slate-950/40 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${gender === 'female' ? 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'border-slate-700'}`}>
                                            <img
                                                src={femaleAvatarSrc}
                                                alt="Female architect avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${gender === 'female' ? 'text-indigo-400' : 'text-slate-500'}`}>Female Avatar</span>
                                    </button>
                                </div>
                            </motion.div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={gender}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center gap-2 py-1"
                                >
                                    <div className={`w-16 h-16 rounded-full overflow-hidden border-3 shadow-lg ${gender === 'female' ? 'border-indigo-400/60 shadow-indigo-500/20' : 'border-blue-400/60 shadow-blue-500/20'}`}>
                                        <motion.img
                                            src={gender === 'female' ? femaleAvatarSrc : maleAvatarSrc}
                                            alt="Selected avatar preview"
                                            className="w-full h-full object-cover"
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                        />
                                    </div>
                                    <p data-testid="text-avatar-preview-label" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        {name.trim() || 'Your Architect'} — {gender === 'female' ? 'Female' : 'Male'} Avatar
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            <motion.button
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={handleConfirm}
                                disabled={!name.trim()}
                                data-testid="button-start-simulation"
                                className="w-full bg-blue-600/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600/20 disabled:hover:text-blue-400 font-bold py-3 md:py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] active:scale-[0.98]"
                            >
                                Start Simulation
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
