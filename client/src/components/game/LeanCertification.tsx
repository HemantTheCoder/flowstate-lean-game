import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Shield, Zap, LayoutList, Package, Truck, ArrowLeft, X, Share2 } from 'lucide-react';
import { LeaderboardEntry } from '@shared/schema';
import ShareableCard from '@/components/game/ShareableCard';

interface ChapterMastery {
  chapter: number;
  title: string;
  principle: string;
  icon: typeof Award;
  iconColor: string;
  barColor: string;
  efficiency: number;
  quizScore: number;
  mastery: number;
  completed: boolean;
}

type CertLevel = 'None' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

function getCertificationLevel(avgMastery: number, completedCount: number): CertLevel {
  if (completedCount === 0) return 'None';
  if (avgMastery >= 90 && completedCount >= 4) return 'Platinum';
  if (avgMastery >= 75 && completedCount >= 3) return 'Gold';
  if (avgMastery >= 60 && completedCount >= 2) return 'Silver';
  return 'Bronze';
}

const CERT_STYLES: Record<CertLevel, { bg: string; border: string; text: string; glow: string }> = {
  None: { bg: 'from-slate-700/20 to-slate-800/20', border: 'border-slate-700/50', text: 'text-slate-400', glow: '' },
  Bronze: { bg: 'from-orange-700/20 to-amber-900/20', border: 'border-orange-500/40', text: 'text-orange-400', glow: 'shadow-[0_0_30px_rgba(234,88,12,0.15)]' },
  Silver: { bg: 'from-slate-400/20 to-slate-600/20', border: 'border-slate-400/40', text: 'text-slate-300', glow: 'shadow-[0_0_30px_rgba(148,163,184,0.2)]' },
  Gold: { bg: 'from-amber-500/20 to-yellow-600/20', border: 'border-amber-400/50', text: 'text-amber-400', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]' },
  Platinum: { bg: 'from-cyan-400/20 to-indigo-500/20', border: 'border-cyan-400/50', text: 'text-cyan-300', glow: 'shadow-[0_0_50px_rgba(34,211,238,0.25)]' },
};

const CHAPTER_DEFS = [
  { chapter: 1, title: 'The Jam', principle: 'Kanban & Flow', icon: LayoutList, iconColor: 'text-amber-400', barColor: 'bg-amber-500' },
  { chapter: 2, title: 'The Promise', principle: 'Last Planner System', icon: Shield, iconColor: 'text-purple-400', barColor: 'bg-purple-500' },
  { chapter: 3, title: 'The Tangled Depot', principle: '5S Methodology', icon: Package, iconColor: 'text-emerald-400', barColor: 'bg-emerald-500' },
  { chapter: 4, title: 'Pull & JIT', principle: 'Just-in-Time & Pull', icon: Truck, iconColor: 'text-cyan-400', barColor: 'bg-cyan-500' },
];

interface LeanCertificationProps {
  scores: LeaderboardEntry[];
  localGameState: any;
  playerName: string;
  onClose: () => void;
}

export default function LeanCertification({ scores, localGameState, playerName, onClose }: LeanCertificationProps) {
  const [showShareCard, setShowShareCard] = useState(false);
  const chapterMasteries: ChapterMastery[] = CHAPTER_DEFS.map(def => {
    const scoreEntry = scores.find(s => s.chapter === def.chapter);

    let efficiency = 0;
    let quizScore = 0;
    let completed = false;

    if (scoreEntry) {
      efficiency = scoreEntry.efficiency || 0;
      quizScore = scoreEntry.quizScore || 0;
      completed = true;
    } else if (localGameState) {
      const isCompleted = localGameState.unlockedChapters?.includes(def.chapter + 1) ||
        (localGameState.unlockedBadges?.includes('flow_master') && def.chapter === 1) ||
        (localGameState.unlockedBadges?.includes('reliable_promise') && def.chapter === 2);

      if (isCompleted) {
        completed = true;
        const metric = localGameState.dailyMetrics?.find((m: any) => m.day === def.chapter * 5);
        efficiency = metric?.cumulativeEfficiency || 50;
        quizScore = 70;
      }
    }

    const mastery = completed ? Math.round(efficiency * 0.6 + quizScore * 0.4) : 0;

    return {
      ...def,
      efficiency,
      quizScore,
      mastery,
      completed,
    };
  });

  const completedChapters = chapterMasteries.filter(c => c.completed);
  const avgMastery = completedChapters.length > 0
    ? Math.round(completedChapters.reduce((sum, c) => sum + c.mastery, 0) / completedChapters.length)
    : 0;

  const certLevel = getCertificationLevel(avgMastery, completedChapters.length);
  const style = CERT_STYLES[certLevel];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      data-testid="modal-lean-certification"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 p-5 flex items-center justify-between">
          <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            Lean Certification
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            data-testid="button-close-certification"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-gradient-to-br ${style.bg} border ${style.border} rounded-2xl p-6 text-center ${style.glow}`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-20 h-20 rounded-full bg-slate-900/50 border ${style.border} flex items-center justify-center`}>
                <Award className={`w-10 h-10 ${style.text}`} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Overall Level</p>
                <h3 className={`text-3xl font-black ${style.text} tracking-tight`} data-testid="text-cert-level">
                  {certLevel === 'None' ? 'Unranked' : certLevel}
                </h3>
              </div>
              <p className="text-slate-300 text-sm font-bold" data-testid="text-player-name">{playerName}</p>
              <div className="flex items-center gap-6 mt-2">
                <div className="text-center">
                  <p className="text-2xl font-black text-white" data-testid="text-avg-mastery">{avgMastery}%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg Mastery</p>
                </div>
                <div className="w-px h-8 bg-slate-700/50" />
                <div className="text-center">
                  <p className="text-2xl font-black text-white" data-testid="text-chapters-completed">{completedChapters.length}/4</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chapters</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Principle Mastery</h4>
            {chapterMasteries.map((cm, i) => {
              const Icon = cm.icon;
              return (
                <motion.div
                  key={cm.chapter}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className={`bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 ${!cm.completed ? 'opacity-50' : ''}`}
                  data-testid={`card-mastery-ch${cm.chapter}`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${cm.completed ? cm.iconColor : 'text-slate-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-bold text-white">Ch{cm.chapter}: {cm.principle}</p>
                          <p className="text-[10px] text-slate-400">{cm.title}</p>
                        </div>
                        <span className={`text-lg font-black ${cm.completed ? 'text-white' : 'text-slate-600'}`}>
                          {cm.completed ? `${cm.mastery}%` : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: cm.completed ? `${cm.mastery}%` : '0%' }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${cm.barColor}`}
                    />
                  </div>
                  {cm.completed && (
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Efficiency: {cm.efficiency}%</span>
                      <span>Quiz: {cm.quizScore}%</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Certification Thresholds</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {(['Bronze', 'Silver', 'Gold', 'Platinum'] as CertLevel[]).map(level => {
                const s = CERT_STYLES[level];
                const isActive = level === certLevel;
                return (
                  <div
                    key={level}
                    className={`py-2 px-3 rounded-lg border ${isActive ? `${s.border} bg-gradient-to-br ${s.bg}` : 'border-slate-700/30 bg-slate-900/30'}`}
                  >
                    <p className={`text-xs font-black ${isActive ? s.text : 'text-slate-500'}`}>{level}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      {level === 'Bronze' && '1 Ch, any %'}
                      {level === 'Silver' && '2 Ch, 60%+'}
                      {level === 'Gold' && '3 Ch, 75%+'}
                      {level === 'Platinum' && '4 Ch, 90%+'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setShowShareCard(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-900/20 text-cyan-300 font-bold hover:bg-cyan-800/30 transition-colors shadow-md"
            data-testid="button-share-certification"
          >
            <Share2 className="w-4 h-4" /> Share Certification
          </button>
        </div>
      </motion.div>

      <ShareableCard
        isOpen={showShareCard}
        onClose={() => setShowShareCard(false)}
        data={{
          playerName: playerName || 'Architect',
          mode: 'certification',
          certLevel,
          avgMastery,
          completedChapters: completedChapters.length,
          chapterMasteries: chapterMasteries.map(c => ({
            chapter: c.chapter,
            principle: c.principle,
            mastery: c.mastery,
            completed: c.completed,
          })),
        }}
      />
    </motion.div>
  );
}
