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
    if (doneTasks.some(t => t.originalId === taskId)) {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Completed</Badge>;
    }
    if (doingTasks.some(t => t.originalId === taskId)) {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse">In Progress</Badge>;
    }
    return <Badge variant="outline" className="text-slate-400 border-slate-700">Planned</Badge>;
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-6xl h-[90vh] bg-slate-900/90 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col glass-panel"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl">
                  <ClipboardList className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Project Status Sheet</h2>
                  <p className="text-slate-400 text-sm font-medium">
                    {playerName} — {designation} | Project: Affordable Housing Villa
                  </p>
                </div>
              </div>
              <Button 
                id="btn-close-project-sheet"
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              
              {/* Left Sidebar: Site Conditions & Metrics */}
              <div className="w-full md:w-80 border-r border-white/5 bg-slate-900/40 p-6 space-y-6 overflow-y-auto">
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

              {/* Main Content: Tasks Excel Table */}
              <div className="flex-1 p-6 flex flex-col overflow-hidden bg-slate-900/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                    <LayoutGrid className="w-5 h-5 text-purple-400" /> Project Scope & Timeline
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-lg text-xs font-medium text-slate-300 border border-slate-700">
                      <IndianRupee className="w-3 h-3" /> Budget: {formatCurrency(15000000, currency)}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl mb-4 border border-slate-700/50 shrink-0">
                  <p className="text-sm text-slate-300 italic mb-3">Earned Value Management: Earned Value (EV) = % of planned work actually completed, valued in ₹.</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 text-center">
                       <div className="text-[10px] text-slate-400 uppercase font-bold">Planned Value (PV)</div>
                       <div className="text-lg font-mono font-bold text-slate-200">{formatCurrency(PV, currency)}</div>
                    </div>
                    <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-800/50 text-center shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                       <div className="text-[10px] text-cyan-400 uppercase font-bold">Earned Value (EV)</div>
                       <div className="text-lg font-mono font-black text-cyan-400">{formatCurrency(EV, currency)}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 text-center">
                       <div className="text-[10px] text-slate-400 uppercase font-bold">Actual Cost (AC)</div>
                       <div className="text-lg font-mono font-bold text-slate-200">{formatCurrency(AC, currency)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 border border-white/5 rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
                  <ScrollArea className="h-full">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-800 text-slate-400 text-[10px] uppercase tracking-widest font-bold shadow-md">
                        <tr>
                          <th className="px-4 py-3 border-b border-white/5">#</th>
                          <th className="px-4 py-3 border-b border-white/5">Task Name & Materials</th>
                          <th className="px-4 py-3 border-b border-white/5">Category</th>
                          <th className="px-4 py-3 border-b border-white/5 text-right w-32">Planned Value (PV)</th>
                          <th className="px-4 py-3 border-b border-white/5 text-right w-32">Actual Cost (AC)</th>
                          <th className="px-4 py-3 border-b border-white/5 text-center">Month (Plan vs Act)</th>
                          <th className="px-4 py-3 border-b border-white/5 text-center">Status</th>
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

                          return (
                          <tr key={task.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-4 text-xs text-slate-500 font-mono">{idx + 1}</td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                  {task.title}
                                </span>
                                <span className="text-[10px] text-slate-500 line-clamp-1 max-w-xs italic mb-1">
                                  {task.description}
                                </span>
                                {task.materialsRequired && task.materialsRequired.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {task.materialsRequired.map((mat, i) => (
                                      <span key={i} className="text-[9px] bg-slate-800 text-amber-200/80 px-1.5 py-0.5 rounded border border-amber-500/20">
                                        Req: {mat.amount} {mat.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                                ${task.type === 'Structural' ? 'bg-blue-500/10 text-blue-400' : 
                                  task.type === 'Interior' ? 'bg-purple-500/10 text-purple-400' : 
                                  task.type === 'Systems' ? 'bg-amber-500/10 text-amber-400' : 
                                  'bg-slate-500/10 text-slate-400'}
                              `}>
                                {task.type}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="text-xs font-mono text-slate-300">
                                {formatCurrency(plannedCost, currency)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className={`text-xs font-mono font-bold ${isOverBudget && chapter === 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {formatCurrency(actualCost, currency)}
                              </span>
                              {isOverBudget && chapter === 1 && (
                                <div className="text-[9px] text-red-500/70">Overrun!</div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
                                <span className="text-slate-400">P: Month {pMonth}</span>
                                <span className={isDelayed ? "text-red-400 font-bold" : "text-emerald-400"}>
                                  A: Month {aMonth}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
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
            <div className="p-4 px-6 border-t border-white/10 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-6">
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
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-8 font-bold border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
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
