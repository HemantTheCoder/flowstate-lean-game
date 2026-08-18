import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  LayoutGrid,
  ClipboardList,
  Target
} from 'lucide-react';
import { useGameStore, formatCurrency } from '@/store/gameStore';
import { CONSTRUCTION_TASKS, TaskType } from '@/data/tasks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectStatusSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectStatusSheet: React.FC<ProjectStatusSheetProps> = ({ isOpen, onClose }) => {
  const { 
    chapter, 
    columns, 
    funds, 
    currency, 
    lpi,
    day,
    playerName,
    designation
  } = useGameStore();

  const doneTasks = columns.find(c => c.id === 'done')?.tasks || [];
  const doingTasks = columns.find(c => c.id === 'doing')?.tasks || [];
  const backlogTasks = columns.find(c => c.id === 'backlog')?.tasks || [];
  
  const allTasksCount = CONSTRUCTION_TASKS.length;
  const completedCount = doneTasks.length;
  const completionPercentage = Math.round((completedCount / allTasksCount) * 100);

  // Derive "Timeline" based on step number for realism
  // Step 1-5: Month 1, 6-10: Month 2, 11-15: Month 3, 16-22: Month 4
  const getPlannedMonth = (step: number) => {
    if (step <= 5) return 1;
    if (step <= 10) return 2;
    if (step <= 15) return 3;
    return 4;
  };

  const getActualMonth = (step: number) => {
    // If we're pre-kanban (chapter 1 usually represents chaotic start), actual month is delayed by 1 sometimes
    return chapter === 1 && step > 2 ? getPlannedMonth(step) + 1 : getPlannedMonth(step);
  };

  const calculateActualCost = (costToStart: number) => {
    if (chapter === 1) return costToStart * 1.15; // 15% overrun pre-Kanban
    return costToStart * 1.02; // Minor variance post-Kanban
  };

  const getStatusBadge = (taskId: string) => {
    const cls = "text-[10px] px-2 py-0.5 whitespace-nowrap";
    if (doneTasks.some(t => t.originalId === taskId)) {
      return <Badge className={`bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ${cls}`}>Completed</Badge>;
    }
    if (doingTasks.some(t => t.originalId === taskId)) {
      return <Badge className={`bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse ${cls}`}>In Progress</Badge>;
    }
    return <Badge variant="outline" className={`text-slate-400 border-slate-700 ${cls}`}>Planned</Badge>;
  };

  // Calculate Planned Value (PV) time-phased by current day/month
  const PV = CONSTRUCTION_TASKS.reduce((acc, task, idx) => {
    const pMonth = getPlannedMonth(idx + 1);
    if (pMonth <= day) {
      return acc + (task.costToStart || 0);
    }
    return acc;
  }, 0);

  // Calculate Earned Value (EV) as BCWP (sum of planned costs of completed tasks)
  const EV = doneTasks.reduce((acc, task) => {
    const origTask = CONSTRUCTION_TASKS.find(t => t.id === (task.originalId || task.id));
    return acc + (origTask?.costToStart || 0);
  }, 0);

  const AC = 15000000 - funds;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-[1700px] h-[96dvh] sm:h-[94dvh] bg-slate-900/90 border border-slate-700/50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col glass-panel"
          >
            {/* Header — kept compact so vertical space goes to the task list */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 bg-blue-500/20 rounded-xl shrink-0">
                  <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">Project Status Sheet</h2>
                  <p className="text-slate-400 text-[11px] sm:text-xs font-medium truncate">
                    {playerName} — {designation} | Project: Affordable Housing Villa
                  </p>
                </div>
              </div>
              <Button
                id="btn-close-project-sheet"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0 min-w-[40px] min-h-[40px]"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row min-h-0">

              {/* Left Sidebar: Site Conditions & Metrics */}
              <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-slate-900/40 p-4 sm:p-5 space-y-5 md:overflow-y-auto md:min-h-0">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Site Conditions
                  </h3>
                  <div className="space-y-3">
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-3">
                        <p className="text-sm font-semibold text-red-400 leading-snug">
                          {chapter === 1 ? "Traditional methods causing 15% cost overrun." : "Kanban implementation helping stabilize flow."}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-500/10 border-amber-500/20">
                      <CardContent className="p-3">
                        <p className="text-sm font-semibold text-amber-400 leading-snug">
                          {chapter === 1 ? "High inventory waste detected in structural phase." : "Materials being pulled as per need (Just-In-Time)."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Lean Performance
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-slate-400 mb-1">Flow Efficiency</p>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-white">{lpi.flowEfficiency}%</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${lpi.flowEfficiency > 60 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {lpi.flowEfficiency > 60 ? 'Optimal' : 'Low'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-slate-400 mb-1">Project Progress</p>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-white">{completionPercentage}%</span>
                        <span className="text-[10px] text-slate-500 font-bold">{completedCount}/{allTasksCount} Tasks</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Impact Summary
                  </h3>
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <p className="text-sm text-blue-200/80 leading-relaxed italic">
                      "Moving from traditional 'Push' to Lean 'Pull' has reduced unnecessary site movement and improved coordination between trades."
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content: Tasks Excel Table.
                  flex-1/min-h-0 are md-only on purpose: on mobile this column must take its
                  natural content height so the parent scroller can scroll it, otherwise
                  flex-1 + min-h-0 inside the scrolling column collapses it to ~0 and clips the list. */}
              <div className="md:flex-1 p-3 sm:p-5 flex flex-col md:overflow-hidden bg-slate-900/20 md:min-h-0">
                {/* Title + EVM readout on one compact row, so the task list keeps the vertical space */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                    <LayoutGrid className="w-4 h-4 text-purple-400" /> Project Scope &amp; Timeline
                  </h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 rounded-lg text-[11px] font-medium text-slate-300 border border-slate-700">
                    <IndianRupee className="w-3 h-3" /> Budget: {formatCurrency(15000000, currency)}
                  </div>
                </div>

                <div
                  className="flex items-stretch gap-2 mb-3 shrink-0"
                  title="Earned Value Management: Earned Value (EV) = % of planned work actually completed, valued in ₹."
                >
                  <div className="flex-1 min-w-0 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Planned (PV)</span>
                    <span className="text-sm font-mono font-bold text-slate-200 truncate">{formatCurrency(PV, currency)}</span>
                  </div>
                  <div className="flex-1 min-w-0 bg-cyan-950/20 px-3 py-2 rounded-lg border border-cyan-800/50 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold shrink-0">Earned (EV)</span>
                    <span className="text-sm font-mono font-black text-cyan-400 truncate">{formatCurrency(EV, currency)}</span>
                  </div>
                  <div className="flex-1 min-w-0 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Actual (AC)</span>
                    <span className="text-sm font-mono font-bold text-slate-200 truncate">{formatCurrency(AC, currency)}</span>
                  </div>
                </div>

                {/* Mobile: card list, flows naturally so the outer panel scrolls as one column (table below is desktop-only) */}
                <div className="md:hidden border border-white/5 rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
                  <div className="divide-y divide-white/5">
                    {CONSTRUCTION_TASKS.map((task, idx) => {
                        const plannedCost = task.costToStart || 0;
                        const actualCost = calculateActualCost(plannedCost);
                        const isOverBudget = actualCost > plannedCost;
                        const pMonth = getPlannedMonth(idx + 1);
                        const aMonth = getActualMonth(idx + 1);
                        const isDelayed = aMonth > pMonth;

                        const matSummary = (task.materialsRequired || [])
                          .map(m => `${m.amount} ${m.name}`)
                          .join(' · ');

                        return (
                          <div key={task.id} className="px-3 py-2.5 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 min-w-0">
                                <span className="text-[10px] text-slate-500 font-mono shrink-0 mt-0.5">{idx + 1}</span>
                                <div className="min-w-0">
                                  <div className="text-[13px] font-semibold text-slate-100 leading-snug">{task.title}</div>
                                  <div className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-0.5">{task.description}</div>
                                </div>
                              </div>
                              {getStatusBadge(task.id)}
                            </div>
                            {matSummary && (
                              <div className="pl-6 text-[10px] text-amber-200/70 truncate">Req: {matSummary}</div>
                            )}
                            <div className="flex items-center justify-between gap-2 pl-6">
                              <span className={`font-bold px-1.5 py-0.5 rounded uppercase text-[9px] whitespace-nowrap
                                ${task.type === 'Structural' ? 'bg-blue-500/10 text-blue-400' :
                                  task.type === 'Interior' ? 'bg-purple-500/10 text-purple-400' :
                                  task.type === 'Systems' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-slate-500/10 text-slate-400'}
                              `}>
                                {task.type}
                              </span>
                              <div className="flex items-center gap-1.5 font-mono text-[11px] whitespace-nowrap">
                                <span className="text-slate-400">{formatCurrency(plannedCost, currency)}</span>
                                <span className="text-slate-600">→</span>
                                <span className={isOverBudget && chapter === 1 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                                  {formatCurrency(actualCost, currency)}
                                </span>
                                <span className="text-slate-600 mx-0.5">|</span>
                                <span className="text-slate-400">M{pMonth}</span>
                                <span className="text-slate-600">/</span>
                                <span className={isDelayed ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>M{aMonth}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Desktop: full table */}
                <div className="flex-1 min-h-0 hidden md:block border border-white/5 rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
                  <ScrollArea className="h-full">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-800 text-slate-400 text-[10px] uppercase tracking-widest font-bold shadow-md">
                        <tr>
                          <th className="px-3 py-2.5 border-b border-white/5 w-10">#</th>
                          <th className="px-3 py-2.5 border-b border-white/5">Task Name &amp; Materials</th>
                          <th className="px-3 py-2.5 border-b border-white/5 w-28">Category</th>
                          <th className="px-3 py-2.5 border-b border-white/5 text-right w-28">Planned (PV)</th>
                          <th className="px-3 py-2.5 border-b border-white/5 text-right w-32">Actual (AC)</th>
                          <th className="px-3 py-2.5 border-b border-white/5 text-center w-28">Month P/A</th>
                          <th className="px-3 py-2.5 border-b border-white/5 text-center w-28">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {CONSTRUCTION_TASKS.map((task, idx) => {
                          const plannedCost = task.costToStart || 0;
                          const actualCost = calculateActualCost(plannedCost);
                          const isOverBudget = actualCost > plannedCost;
                          const pMonth = getPlannedMonth(idx + 1);
                          const aMonth = getActualMonth(idx + 1);
                          const isDelayed = aMonth > pMonth;
                          const matSummary = (task.materialsRequired || [])
                            .map(m => `${m.amount} ${m.name}`)
                            .join(' · ');

                          return (
                          <tr key={task.id} className="group hover:bg-white/[0.03] transition-colors">
                            <td className="px-3 py-2.5 text-[11px] text-slate-500 font-mono">{idx + 1}</td>
                            <td className="px-3 py-2.5">
                              {/* Single-line title + meta keeps rows dense so many tasks stay visible at once;
                                  full text is available on hover via title attributes. */}
                              <div className="max-w-[22rem] xl:max-w-[30rem]">
                                <div
                                  className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition-colors truncate"
                                  title={task.title}
                                >
                                  {task.title}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] leading-tight">
                                  <span className="text-slate-500 truncate" title={task.description}>
                                    {task.description}
                                  </span>
                                </div>
                                {matSummary && (
                                  <div
                                    className="text-[10px] text-amber-200/70 truncate mt-0.5"
                                    title={matSummary}
                                  >
                                    Req: {matSummary}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase whitespace-nowrap
                                ${task.type === 'Structural' ? 'bg-blue-500/10 text-blue-400' :
                                  task.type === 'Interior' ? 'bg-purple-500/10 text-purple-400' :
                                  task.type === 'Systems' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-slate-500/10 text-slate-400'}
                              `}>
                                {task.type}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap">
                                {formatCurrency(plannedCost, currency)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              <span className={`text-[11px] font-mono font-bold ${isOverBudget && chapter === 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {formatCurrency(actualCost, currency)}
                              </span>
                              {isOverBudget && chapter === 1 && (
                                <span className="text-[10px] text-red-500/70 ml-1.5">Overrun</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium whitespace-nowrap">
                                <span className="text-slate-400">M{pMonth}</span>
                                <span className="text-slate-600">/</span>
                                <span className={isDelayed ? "text-red-400 font-bold" : "text-emerald-400"}>
                                  M{aMonth}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex justify-center">
                                {getStatusBadge(task.id)}
                              </div>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 px-4 sm:px-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 shrink-0">
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Site Data</span>
                </div>
                {completionPercentage === 100 && (
                  <div className="flex items-center gap-2 text-emerald-400 animate-bounce">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Chapter Goal Achieved!</span>
                  </div>
                )}
              </div>
              <Button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-8 font-bold border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all w-full sm:w-auto"
              >
                Close Sheet
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
