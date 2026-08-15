import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, formatCurrency } from '@/store/gameStore';
import { CONSTRUCTION_TASKS } from '@/data/tasks';
import { ClipboardList, ArrowRight, IndianRupee, Target, Play } from 'lucide-react';
import soundManager from '@/lib/soundManager';

export const MasterPlanModal: React.FC = () => {
  const { chapter, day, flags, setFlag, currency } = useGameStore();

  // Show only on Chapter 1 Day 1, once the intro has been seen, and before gameplay starts.
  const isVisible = chapter === 1 && day === 1 && flags['chapter_intro_seen'] && !flags['master_plan_seen'];

  if (!isVisible) return null;

  const handleStart = () => {
    soundManager.playSFX('whoosh', 0.6);
    setFlag('master_plan_seen', true);
  };

  const startingBudget = 15000000;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-6 bg-slate-950/90 backdrop-blur-md pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div 
          className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
          initial={{ y: 20, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
            <div>
              <h2 className="text-blue-400 font-bold text-sm tracking-wider uppercase mb-1 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Project Initiation
              </h2>
              <h1 className="text-2xl font-black text-white">Master Schedule & Baseline</h1>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Starting Budget (Baseline)</div>
              <div className="text-2xl font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <IndianRupee className="w-5 h-5 opacity-50" />
                {formatCurrency(startingBudget, currency)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
              <p className="text-blue-200 text-sm leading-relaxed">
                Before you step onto the site, review the master plan. This is your scope of work. Tasks must flow smoothly to stay within your baseline budget. Remember: Starting work costs money, finishing work earns value.
              </p>
            </div>

            <div>
              <h3 className="text-slate-300 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" /> Planned Tasks
              </h3>
              <div className="space-y-3">
                {CONSTRUCTION_TASKS.slice(0, 5).map((task, idx) => (
                  <div 
                    key={task.id} 
                    className={`p-4 rounded-xl border ${idx === 0 ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20' : 'bg-slate-800/30 border-slate-700/50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-start">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-cyan-500 text-cyan-950' : 'bg-slate-700 text-slate-400'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className={`font-bold ${idx === 0 ? 'text-cyan-300' : 'text-slate-200'}`}>{task.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                          {idx === 0 && (
                            <div className="mt-2 text-xs font-bold text-cyan-400 flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" /> FIRST ACTIVITY — Start here!
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Planned Cost</div>
                        <div className="text-sm font-mono text-slate-300">{formatCurrency(task.costToStart || 0, currency)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-3 text-center text-xs text-slate-500 font-bold bg-slate-800/10 rounded-lg border border-slate-800/50 border-dashed">
                  + {CONSTRUCTION_TASKS.length - 5} more tasks scheduled...
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end">
            <button
              onClick={handleStart}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Project
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
