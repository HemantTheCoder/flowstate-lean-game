import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Home, XCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/soundManager';

interface GameOverOverlayProps {
    reason: string;
    chapter: number;
}

export function GameOverOverlay({ reason, chapter }: GameOverOverlayProps) {
    const { startChapter } = useGameStore();

    const handleRestart = () => {
        soundManager.playSFX('click');
        startChapter(chapter);
    };

    const handleExit = () => {
        soundManager.playSFX('click');
        window.location.href = '/';
    };

    return (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-6 font-sans">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                className="bg-slate-900 border-2 border-rose-500/30 w-full max-w-xl rounded-[2.5rem] shadow-[0_0_100px_rgba(244,63,94,0.15)] overflow-hidden flex flex-col relative"
            >
                {/* Glow Effects */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 blur-[80px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/10 blur-[80px] rounded-full" />

                {/* Content */}
                <div className="relative z-10 p-10 sm:p-14 text-center">
                    <div className="mx-auto w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                        <XCircle className="w-10 h-10 text-rose-500" />
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                        System Failure
                    </h1>

                    <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-6 mb-10">
                        <div className="flex items-center gap-2 justify-center mb-2 text-rose-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diagnostic Report</span>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed font-medium">
                            "{reason}"
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">
                            The project has been cancelled. Re-evaluation required.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={handleRestart}
                                className="group relative flex items-center justify-center gap-3 bg-white text-slate-950 hover:bg-rose-50 font-black py-5 px-8 rounded-2xl text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                Attempt Chapter {chapter} Again
                            </button>

                            <button
                                onClick={handleExit}
                                className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-5 px-8 rounded-2xl text-sm uppercase tracking-widest transition-all active:scale-[0.98] border border-slate-700"
                            >
                                <Home className="w-4 h-4" />
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
