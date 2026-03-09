import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, User, Users, Settings, ExternalLink, HardHat, Info, MessageSquare, Terminal, LogOut, ChevronRight } from 'lucide-react';
import soundManager from '@/lib/soundManager';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

import { ComingSoonModal } from '../components/game/ComingSoonModal';
import { AuthModal } from '@/components/ui/AuthModal';
import { CaseStudiesModal } from '@/components/game/CaseStudiesModal';

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
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [pendingFeature, setPendingFeature] = useState<'multiplayer' | null>(null);
  const [showCaseStudies, setShowCaseStudies] = useState(false);

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
    <div className="relative w-full min-h-screen overflow-x-hidden bg-slate-900 flex flex-col items-center justify-center p-3 sm:p-6 font-sans">

      {/* Premium Twilight Industrial Ambient Background */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        style={{
          backgroundImage: `url('/assets/bg_title_screen.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'crisp-edges'
        }}
      >
        <div className="absolute inset-0 bg-slate-950/40" /> {/* Darkening overlay so UI pops */}

        {/* Restored ambient blurs to keep options nicely visible and add atmosphere */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/20 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
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

      <div className="absolute top-4 right-4 z-50">
        {!user ? (
          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all shadow-lg"
            >
              <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700 group-hover:bg-slate-700 transition-colors">
                <User className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Portal</span>
                <span className="text-[10px] font-bold uppercase tracking-tight">Login</span>
              </div>
            </motion.button>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            {/* Compact Authenticated User Status */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setLocation('/profile')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white shadow-lg group hover:border-cyan-500/40 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex flex-col items-start leading-none pr-1">
                <span className="text-[7px] font-black text-cyan-500 uppercase tracking-widest">Architect</span>
                <span className="text-[11px] font-bold uppercase tracking-tight truncate max-w-[80px]">{user.username}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-all" />
            </motion.button>

            {/* Compact Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundManager.playSFX('click');
                logoutMutation.mutate();
              }}
              className="p-2 bg-slate-900/80 backdrop-blur-xl border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 hover:border-red-500/40 transition-all shadow-lg"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Main Content Container - Visual Novel Title Screen Layout */}
      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 relative min-h-0 md:min-h-[80vh]">

        {/* Left Side: Title & Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col justify-center text-center md:text-left"
        >
          <div className="bg-slate-900/40 backdrop-blur-md p-5 sm:p-8 md:p-12 rounded-2xl md:rounded-3xl border border-slate-700/50 shadow-2xl inline-block w-fit mx-auto md:mx-0">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/50 mb-6 shadow-md shadow-slate-900/50">
              <HardHat className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">A Lean Construction Story</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-indigo-400 tracking-tight mb-2 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              FLOW
              <span className="block text-2xl sm:text-4xl md:text-6xl lg:text-7xl mt-[-6px] sm:mt-[-10px] text-cyan-400 opacity-100 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">STATE</span>
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-slate-300 font-bold mb-4 tracking-widest uppercase mt-4 max-w-lg mx-auto md:mx-0 drop-shadow-md">
              Master the Flow. Eliminate the Waste.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Clear, User-Friendly Navigation */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-xs md:max-w-sm flex flex-col gap-4 self-center pt-8 md:pt-0"
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
              className="w-full relative px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl flex items-center justify-between text-white font-black text-lg sm:text-xl uppercase tracking-wider shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_40px_rgba(34,211,238,0.4)] overflow-hidden group border border-cyan-400/30"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700 ease-out z-0" />
              <span className="relative z-10 flex items-center gap-3 drop-shadow-md">
                <Play className="w-6 h-6 fill-current" />
                Play Game
              </span>
            </motion.button>
          </Link>

          {/* Main Menu Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2">
            <Link href="/profile" className="w-full">
              <motion.button
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                custom={1}
                className="w-full flex-col items-center justify-center p-3 sm:p-4 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800 hover:border-cyan-500/50 transition-all flex shadow-lg hover:shadow-cyan-900/20"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 mb-2 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
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
                className="w-full flex-col items-center justify-center p-3 sm:p-4 bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800 hover:border-yellow-500/50 transition-all flex shadow-lg hover:shadow-yellow-900/20"
              >
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mb-2 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-center">Leaderboard</span>
              </motion.button>
            </Link>
          </div>

          {/* Secondary Option Menu */}
          <div className="flex flex-col gap-2 sm:gap-3 mt-2">
            <button
              onClick={() => setShowCaseStudies(true)}
              className="w-full group relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-300 font-bold uppercase tracking-widest text-xs hover:text-white hover:bg-slate-700 hover:border-slate-500 transition-all shadow-md"
            >
              <span className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
                Case Studies
              </span>
            </button>

            <button
              onClick={() => setPendingFeature('multiplayer')}
              className="w-full group relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all shadow-md"
            >
              <span className="flex items-center gap-3">
                <Users className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                Multiplayer
              </span>
              <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-500 font-bold border border-slate-800">COMING SOON</span>
            </button>

            <Link href="/feedback" className="w-full">
              <button className="w-full group relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-300 font-bold uppercase tracking-widest text-xs hover:text-white hover:bg-slate-700 hover:border-slate-500 transition-all shadow-md">
                <span className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
                  Feedback & Report
                </span>
              </button>
            </Link>

            <Link href="/credits" className="w-full">
              <button className="w-full group relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all shadow-md">
                <span className="flex items-center gap-3">
                  <Info className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  Credits
                </span>
              </button>
            </Link>
          </div>

          <div className="mt-4 sm:mt-8 flex flex-col items-center gap-2">
            <p className="text-slate-500 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center transition-colors">
              Made by <a href="https://www.linkedin.com/in/hemant-kumar-b2b512300" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 transition-colors drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Hemant Kumar</a>
            </p>
            <Link href="/dev" className="group flex items-center gap-1 opacity-20 hover:opacity-100 transition-opacity">
              <Terminal className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
              <span className="text-[8px] uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 font-bold">Dev Console</span>
            </Link>
          </div>

        </motion.div>
      </div>

      <ComingSoonModal
        isOpen={pendingFeature !== null}
        onClose={() => setPendingFeature(null)}
        mode={pendingFeature || 'multiplayer'}
      />

      <AnimatePresence>
        {showCaseStudies && (
          <CaseStudiesModal
            isOpen={showCaseStudies}
            onClose={() => setShowCaseStudies(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
