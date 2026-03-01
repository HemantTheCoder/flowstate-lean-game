import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, User, Users, Settings, ExternalLink, HardHat, Info } from 'lucide-react';
import soundManager from '@/lib/soundManager';

import { ComingSoonModal } from '../components/game/ComingSoonModal';
import { AuthModal } from '@/components/ui/AuthModal';

const buttonVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  hover: {
    scale: 1.03,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.97 }
};

export default function Home() {
  const [pendingFeature, setPendingFeature] = useState<'multiplayer' | 'cases' | null>(null);

  useEffect(() => {
    soundManager.playBGM('menu', 0.3);
    const handleInteraction = () => {
      soundManager.resumeAudio();
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">

      {/* Premium Twilight Industrial Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/20 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 3 }}
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-15 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        />
        <div className="absolute top-0 right-0 w-[200%] h-[200%] rotate-45 bg-gradient-to-t from-transparent via-cyan-500/[0.03] to-transparent transform -translate-x-[50%] -translate-y-[50%]" />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <AuthModal />
      </div>

      {/* Main Content Container - Visual Novel Title Screen Layout */}
      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative h-[80vh]">

        {/* Left Side: Title & Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col justify-center text-center md:text-left h-full pt-10"
        >
          {/* Tagline pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 mb-6 backdrop-blur-md self-center md:self-start shadow-md shadow-slate-900/50">
            <HardHat className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">A Lean Construction Story</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-indigo-400 tracking-tight mb-2 drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            FLOW
            <span className="block text-4xl md:text-6xl lg:text-7xl mt-[-10px] text-cyan-400 opacity-90 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">STATE</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-medium mb-12 tracking-widest uppercase mt-4 max-w-lg mx-auto md:mx-0">
            Master the Flow. Eliminate the Waste.
          </p>
        </motion.div>

        {/* Right Side: Clear, User-Friendly Navigation */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-xs md:max-w-sm flex flex-col gap-4 self-center md:self-end mb-10 md:mb-20"
        >
          {/* Primary Action */}
          <Link href="/chapters" className="w-full">
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              data-testid="button-play"
              className="w-full relative px-6 py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl flex items-center justify-between text-white font-black text-xl uppercase tracking-wider shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_40px_rgba(34,211,238,0.4)] overflow-hidden group border border-cyan-400/30"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700 ease-out z-0" />
              <span className="relative z-10 flex items-center gap-3 drop-shadow-md">
                <Play className="w-6 h-6 fill-current" />
                Play Game
              </span>
            </motion.button>
          </Link>

          {/* Main Menu Grid */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Link href="/dashboard" className="w-full">
              <motion.button
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                custom={1}
                className="w-full flex-col items-center justify-center p-4 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800 hover:border-cyan-500/50 transition-all flex shadow-lg hover:shadow-cyan-900/20"
              >
                <User className="w-6 h-6 mb-2 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-center">My Profile & Stats</span>
              </motion.button>
            </Link>

            <Link href="/leaderboard" className="w-full">
              <motion.button
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                custom={2}
                className="w-full flex-col items-center justify-center p-4 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800 hover:border-yellow-500/50 transition-all flex shadow-lg hover:shadow-yellow-900/20"
              >
                <Trophy className="w-6 h-6 mb-2 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-center">Leaderboard</span>
              </motion.button>
            </Link>
          </div>

          {/* Secondary Option Menu */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={() => setPendingFeature('cases')}
              className="w-full group relative flex items-center justify-between px-6 py-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all shadow-md"
            >
              <span className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                Case Studies
              </span>
              <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-500 font-bold border border-slate-800">COMING SOON</span>
            </button>

            <button
              onClick={() => setPendingFeature('multiplayer')}
              className="w-full group relative flex items-center justify-between px-6 py-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all shadow-md"
            >
              <span className="flex items-center gap-3">
                <Users className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                Multiplayer
              </span>
              <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-500 font-bold border border-slate-800">COMING SOON</span>
            </button>

            <Link href="/credits" className="w-full">
              <button className="w-full group relative flex items-center justify-between px-6 py-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all shadow-md">
                <span className="flex items-center gap-3">
                  <Info className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  Credits
                </span>
              </button>
            </Link>
          </div>

          <p className="mt-8 text-slate-500 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center transition-colors">
            Made by <a href="https://www.linkedin.com/in/hemant-kumar-b2b512300" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Hemant Kumar</a>
          </p>

        </motion.div>
      </div>

      <ComingSoonModal
        isOpen={pendingFeature !== null}
        onClose={() => setPendingFeature(null)}
        mode={pendingFeature || 'multiplayer'}
      />
    </div>
  );
}
