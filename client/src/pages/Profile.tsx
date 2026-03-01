import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Loader2, Trophy, Play, Calendar, LogOut, Award, BarChart3, Clock, ArrowLeft, Target, ShieldCheck, HardHat, Info, BookOpen } from 'lucide-react';
import { useLocation } from 'wouter';
import { UserProfile } from '@shared/schema';
import { format } from 'date-fns';
import { BADGES } from '@/data/badges';

export default function Profile() {
    const { user, logoutMutation, isLoading: isAuthLoading } = useAuth();
    const [, setLocation] = useLocation();
    const { importState, ...localGameState } = useGameStore();

    const { data: profile, isLoading: isProfileLoading } = useQuery<UserProfile>({
        queryKey: ['/api/user/profile'],
        enabled: !!user,
    });

    if (isAuthLoading || (user && isProfileLoading)) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="flex flex-col items-center gap-6 z-10">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-cyan-500 animate-spin" />
                    </div>
                    <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Accessing Profile...</p>
                </div>
            </div>
        );
    }

    // What to display: If logged in with a DB save, use that. Otherwise, use local.
    const savedGameState = profile?.gameState;
    const scores = profile?.scores || [];

    // Choose which state to display in the UI cards: Server or Local
    const displayState = savedGameState || localGameState;

    const handleResume = async () => {
        if (savedGameState) {
            importState(savedGameState);
            setLocation('/game');
        } else if (localGameState) {
            setLocation('/game');
        }
    };

    const handleLogout = async () => {
        logoutMutation.mutate();
        setLocation('/');
    };

    // Calculate stats based on DB profile FIRST, fallback to local gameStore if not logged in
    let totalScore = 0;
    let bestPpc = 0;
    let completedChapters = 0;

    if (user && profile) {
        totalScore = scores.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
        bestPpc = Math.max(...scores.map(s => s.ppc || 0), 0);
        completedChapters = scores.length;
    } else {
        // Local fallback calculations from GameStore
        completedChapters = Math.max(0, localGameState.unlockedChapters.length - 1); // If 2 unlocked, 1 is completed
        totalScore = localGameState.funds; // proxy for score locally
        // PPC history available locally now
        if (localGameState.ppcHistory && localGameState.ppcHistory.length > 0) {
            bestPpc = Math.max(...localGameState.ppcHistory.map(p => p.ppc));
        }
    }

    const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();
    const displayUsername = user?.username || localGameState.playerName || 'Guest Engineer';

    return (
        <div className="min-h-screen bg-slate-900 p-4 md:p-8 font-sans relative overflow-x-hidden text-slate-200">

            {/* Premium Twilight Industrial Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 blur-[150px] rounded-full"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/20 blur-[150px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-15 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.1)] gap-6 relative overflow-hidden"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex flex-col items-center justify-center text-cyan-400 text-4xl font-black border border-cyan-500/30 rounded-full shrink-0 shadow-inner">
                            {displayUsername.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{displayUsername}</h1>
                                {user?.role === 'admin' && (
                                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-500/30 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Root Admin
                                    </span>
                                )}
                                {!user && (
                                    <span className="bg-slate-500/20 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-500/30">
                                        Local Profile
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-400 flex items-center gap-2 mt-2 text-xs md:text-sm font-light">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                Lean Architect since {format(joinDate, 'MMMM yyyy')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setLocation('/')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest text-slate-300"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return Home
                        </button>
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest text-red-400"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        ) : (
                            <button
                                onClick={() => setLocation('/auth')}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest text-cyan-400"
                            >
                                Create Account to Auto-Save
                            </button>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Left Column: Stats & Resume */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="md:col-span-5 space-y-8">

                        {/* Current Game Card */}
                        <div className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden relative">
                            {/* Glowing orb behind active project section */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full" />

                            <div className="bg-slate-900/50 p-5 border-b border-slate-700/50 relative flex justify-between items-center">
                                <h3 className="relative z-10 flex items-center gap-2 text-white font-bold uppercase tracking-widest text-xs">
                                    <Play className="w-4 h-4 fill-current text-cyan-400" />
                                    Active Project
                                </h3>
                                {displayState && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                            </div>
                            <div className="p-8">
                                {displayState ? (
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Sector</p>
                                            <p className="text-3xl font-black text-white uppercase drop-shadow-md">Episode {displayState.chapter}</p>
                                            <p className="text-sm text-cyan-400 mt-1 font-bold">Sim Day {displayState.day}</p>
                                        </div>
                                        <div className="space-y-4 p-5 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400 tracking-wide font-bold">Funds</span>
                                                <span className="font-bold text-emerald-400">${((displayState as any).funds || (displayState as any).resources?.budget || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400 tracking-wide font-bold">Engineer</span>
                                                <span className="font-bold text-slate-200">{displayState.playerName}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleResume}
                                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                                        >
                                            Resume Project
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 mx-auto bg-slate-900/50 rounded-full flex flex-col items-center justify-center border border-slate-700/50 mb-4">
                                            <Info className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <p className="text-slate-400 mb-8 text-sm">No active project detected.</p>
                                        <button
                                            onClick={() => setLocation('/chapters')}
                                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-colors w-full"
                                        >
                                            Start New Project
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Aggregate Stats */}
                        <div className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 shadow-xl rounded-3xl overflow-hidden">
                            <div className="p-5 border-b border-slate-700/50 bg-slate-900/50">
                                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-4 h-4 text-emerald-400" /> Career Analytics
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 text-center flex flex-col items-center justify-center shadow-inner hover:bg-slate-800 transition-colors">
                                    <Trophy className="w-6 h-6 text-amber-500 mb-3 drop-shadow-md" />
                                    <div className="text-2xl font-black text-white">{totalScore.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Score</div>
                                </div>
                                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 text-center flex flex-col items-center justify-center shadow-inner hover:bg-slate-800 transition-colors">
                                    <BarChart3 className="w-6 h-6 text-cyan-500 mb-3 drop-shadow-md" />
                                    <div className="text-2xl font-black text-white">{bestPpc}%</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Best PPC</div>
                                </div>
                                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 text-center flex flex-col items-center justify-center shadow-inner hover:bg-slate-800 transition-colors">
                                    <Award className="w-6 h-6 text-purple-500 mb-3 drop-shadow-md" />
                                    <div className="text-2xl font-black text-white">{completedChapters}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Episodes Done</div>
                                </div>
                                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 text-center flex flex-col items-center justify-center shadow-inner hover:bg-slate-800 transition-colors">
                                    <Clock className="w-6 h-6 text-emerald-500 mb-3 drop-shadow-md" />
                                    <div className="text-2xl font-black text-white">{displayState ? Math.floor((Date.now() - new Date((displayState as any).lastPlayed || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) : 0}<span className="text-sm text-slate-500 mx-1">days</span></div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Since Last Play</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Badges & History */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="md:col-span-7 space-y-8">

                        {/* Achievements Section */}
                        <div className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 p-6 md:p-8 rounded-3xl shadow-xl">
                            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-3 mb-6">
                                <Award className="w-5 h-5 text-amber-400 drop-shadow-md" />
                                Credentials & Certifications
                            </h2>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                                {BADGES.map((badge, i) => {
                                    const isUnlocked = displayState?.unlockedBadges?.includes(badge.id);
                                    const Icon = badge.icon;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + (i * 0.05) }}
                                            key={badge.id}
                                            className={`p-6 rounded-2xl flex flex-col items-center text-center justify-center gap-3 transition-colors backdrop-blur-md border ${isUnlocked ? 'bg-slate-800/80 border border-slate-600 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-slate-900/40 border-slate-800/50 opacity-50 hover:opacity-80'}`}
                                        >
                                            <div className={`p-4 rounded-full border ${isUnlocked ? 'bg-slate-900/50 border-slate-700 shadow-inner' : 'bg-slate-900/80 border-slate-800'}`}>
                                                <Icon className={`w-8 h-8 ${isUnlocked ? badge.color : 'text-slate-600'}`} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-xs uppercase tracking-wider mb-2 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{badge.name}</h3>
                                                <p className="text-[11px] text-slate-400 leading-relaxed font-light">{badge.description}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Completion History */}
                        <div className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 p-6 md:p-8 shadow-xl rounded-3xl">
                            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-3 mb-6">
                                <HardHat className="w-5 h-5 text-blue-400" />
                                Project History Log
                            </h2>

                            {scores.length > 0 ? (
                                <div className="grid gap-4">
                                    {scores.map((score, idx) => (
                                        <motion.div
                                            key={score.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 + (idx * 0.1) }}
                                            className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-800 transition-colors shadow-inner"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-300 font-black text-2xl border border-blue-500/30">
                                                    {score.chapter}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white uppercase tracking-widest text-sm">Episode {score.chapter}</h3>
                                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-slate-500" />
                                                        {score.completedAt ? new Date(score.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 sm:gap-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                                <div className="text-center">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Efficiency</p>
                                                    <p className="text-sm font-bold text-emerald-400">{score.efficiency}%</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">PPC</p>
                                                    <p className="text-sm font-bold text-blue-400">{score.ppc}%</p>
                                                </div>
                                                <div className="text-center pl-6 sm:pl-8 border-l border-slate-700/50">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Final Score</p>
                                                    <p className="font-black text-emerald-400 text-xl drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{score.totalScore?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-900/50 p-10 rounded-2xl border border-slate-700/50 border-dashed text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex flex-col items-center justify-center border border-slate-700/50 mb-6">
                                        <BookOpen className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 tracking-tight">No History Found</h3>
                                    <p className="text-slate-400 mb-8 max-w-md text-sm leading-relaxed">Complete simulation episodes to earn Lean credentials and establish a permanent track record of your projects.</p>
                                    <button
                                        onClick={() => setLocation('/chapters')}
                                        className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-500 hover:to-indigo-500 font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                    >
                                        Execute Project
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
