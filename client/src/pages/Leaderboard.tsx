import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Shield, ArrowLeft, Loader2, Sparkles, User, Target } from 'lucide-react';
import { useLocation } from 'wouter';

interface LeaderboardEntry {
  id: number;
  playerName: string;
  totalScore: number;
  chapter: number;
  efficiency: number;
  ppc: number;
  quizScore: number;
  completedAt: string;
}

export default function Leaderboard() {
  const [, setLocation] = useLocation();

  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />;
      case 2:
        return <Medal className="w-7 h-7 text-slate-300 drop-shadow-[0_0_15px_rgba(203,213,225,0.4)]" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_15px_rgba(217,119,6,0.4)]" />;
      default:
        return <span className="text-sm font-bold text-slate-500 font-mono">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-500/10 to-amber-900/10 border-amber-500/30 text-amber-100 shadow-[0_0_30px_rgba(250,204,21,0.1)] scale-[1.02] z-10 border backdrop-blur-md";
      case 2:
        return "bg-gradient-to-r from-slate-400/10 to-slate-800/10 border-slate-400/20 text-slate-100 scale-[1.01] z-10 border backdrop-blur-md";
      case 3:
        return "bg-gradient-to-r from-orange-700/10 to-orange-900/10 border-orange-700/20 text-orange-100 z-10 border backdrop-blur-md";
      default:
        return "bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 border backdrop-blur-md";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans relative overflow-x-hidden">

      {/* Premium Twilight Industrial Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/20 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/20 blur-[150px] rounded-full"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-15 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-700/50 pb-6"
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => setLocation('/')}
              data-testid="button-back"
              className="px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all flex items-center gap-2 font-bold uppercase tracking-widest text-xs shadow-lg backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 tracking-tight drop-shadow-md">Global Rankings</h1>
              </div>
              <p className="text-amber-500/80 text-xs font-bold uppercase tracking-widest mt-1">Top Lean Architects</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400 uppercase tracking-widest text-[10px] font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Sparkles className="w-3 h-3" /> Season 1 Active
          </div>
        </motion.div>

        {/* Leaderboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="p-6 md:p-8 bg-gradient-to-b from-slate-700/10 to-transparent border-b border-slate-700/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-3 tracking-wide">
              <Trophy className="w-5 h-5 text-amber-400" /> Complete Episodes to secure your rank
            </h2>
          </div>

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Rankings...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-center px-6 bg-slate-900/50">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700/50 mb-2">
                <Shield className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">No Entries Found</h3>
              <p className="text-slate-400 max-w-sm text-sm">
                The leaderboard is currently empty. Be the first to complete an episode and claim the top spot!
              </p>
            </div>
          ) : (
            <div className="p-4 md:p-6 space-y-3">
              {/* Column Headers */}
              <div className="hidden md:grid grid-cols-[4rem_1fr_6rem_6rem_6rem_8rem] gap-4 px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900/50 rounded-2xl border border-slate-700/50 mb-4">
                <span className="text-center">Rank</span>
                <span>Engineer</span>
                <span className="text-center">Episode</span>
                <span className="text-center">Efficiency</span>
                <span className="text-center text-amber-400">Total Score</span>
                <span className="text-right">Timestamp</span>
              </div>

              {/* Rows */}
              {entries.map((entry, index) => {
                const rank = index + 1;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    data-testid={`row-entry-${entry.id}`}
                    className={`grid grid-cols-[3rem_1fr_auto] md:grid-cols-[4rem_1fr_6rem_6rem_6rem_8rem] gap-4 items-center px-6 py-4 rounded-2xl backdrop-blur-md transition-all duration-300 ${getRankStyle(rank)}`}
                  >
                    <div className="flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>

                    <div className="flex flex-col">
                      <span className={`font-bold truncate text-lg tracking-tight ${rank <= 3 ? 'text-white' : 'text-slate-200'}`} data-testid={`text-player-${entry.id}`}>
                        {entry.playerName}
                      </span>
                      <span className="md:hidden text-xs text-amber-400/80 mt-1 font-bold">Score: {entry.totalScore ?? 0}</span>
                    </div>

                    <span className="hidden md:flex justify-center">
                      <span className="text-slate-300 bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-600/50 text-xs font-bold leading-none">
                        Ep. {entry.chapter}
                      </span>
                    </span>

                    <span className="hidden md:block text-slate-300 text-center text-sm font-bold">
                      {entry.efficiency ?? 0}%
                    </span>

                    <span className={`hidden md:block font-black text-center text-xl ${rank === 1 ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]' : rank === 2 ? 'text-slate-100' : rank === 3 ? 'text-orange-500' : 'text-white'}`} data-testid={`text-score-${entry.id}`}>
                      {entry.totalScore?.toLocaleString() ?? 0}
                    </span>

                    <span className="text-slate-500 text-[10px] text-right uppercase tracking-widest hidden md:block font-bold">
                      {formatDate(entry.completedAt)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(34,211,238,0.8)] animate-pulse" />
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Displaying Top 50 Architects</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
