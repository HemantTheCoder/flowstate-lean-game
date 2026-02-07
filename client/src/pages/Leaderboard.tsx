import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ArrowLeft, Star } from 'lucide-react';
import type { LeaderboardEntry } from '@shared/schema';

const TABS = [
  { label: 'All Chapters', value: null },
  { label: 'Chapter 1', value: 1 },
  { label: 'Chapter 2', value: 2 },
];

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const queryKey = selectedChapter
    ? ['/api/leaderboard', String(selectedChapter)]
    : ['/api/leaderboard'];

  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey,
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-slate-500 font-mono text-sm w-5 text-center">{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30';
    if (rank === 2) return 'bg-slate-400/10 border-slate-400/30';
    if (rank === 3) return 'bg-amber-600/10 border-amber-600/30';
    return 'bg-slate-800/50 border-slate-700/50';
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none" />

      <div className="z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/')}
            data-testid="button-back"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Leaderboard
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 flex-wrap"
        >
          {TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setSelectedChapter(tab.value)}
              data-testid={`tab-${tab.value ?? 'all'}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedChapter === tab.value
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4" data-testid="loading-state">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm font-medium">Loading leaderboard...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4" data-testid="empty-state">
              <Star className="w-12 h-12 text-slate-600" />
              <p className="text-slate-500 text-lg font-medium">No entries yet</p>
              <p className="text-slate-600 text-sm">Complete a chapter to appear on the leaderboard</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-[3rem_1fr_5rem_4.5rem_4.5rem_4.5rem_5rem_6rem] gap-2 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Rank</span>
                <span>Player</span>
                <span>Ch.</span>
                <span>Eff%</span>
                <span>PPC%</span>
                <span>Quiz</span>
                <span>Score</span>
                <span>Date</span>
              </div>

              {entries.map((entry, index) => {
                const rank = index + 1;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    data-testid={`row-entry-${entry.id}`}
                    className={`grid grid-cols-[3rem_1fr_5rem_4.5rem_4.5rem_4.5rem_5rem_6rem] gap-2 items-center px-4 py-3 rounded-xl border transition-all ${getRankStyle(rank)}`}
                  >
                    <div className="flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                    <span className={`font-bold truncate ${rank <= 3 ? 'text-white' : 'text-slate-300'}`} data-testid={`text-player-${entry.id}`}>
                      {entry.playerName}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">
                      Ch. {entry.chapter}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {entry.efficiency ?? 0}%
                    </span>
                    <span className="text-slate-400 text-sm">
                      {entry.ppc ?? 0}%
                    </span>
                    <span className="text-slate-400 text-sm">
                      {entry.quizScore ?? 0}
                    </span>
                    <span className={`font-bold text-sm ${rank <= 3 ? 'text-yellow-400' : 'text-white'}`} data-testid={`text-score-${entry.id}`}>
                      {entry.totalScore ?? 0}
                    </span>
                    <span className="text-slate-500 text-xs">
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
          <p className="text-slate-600 text-xs italic">Top 50 scores displayed</p>
        </motion.div>
      </div>
    </div>
  );
}
