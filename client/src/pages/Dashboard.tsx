import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ArrowLeft, Target, GitBranch, Activity, Clock, Layers, HardHat } from 'lucide-react';

interface RunEntry {
  id: number;
  playerName: string;
  chapter: number;
  day: number;
  totalScore: number;
  completedAt: string;
  stats: Record<string, unknown>;
  logs: string[];
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const gameState = useGameStore();

  const { data: runs = [], isLoading } = useQuery<RunEntry[]>({
    queryKey: ['/api/runs/recent'],
  });

  const generateMockDailyMetrics = () => {
    return Array.from({ length: 14 }).map((_, i) => {
      const day = i + 1;
      const baseEff = Math.min(45 + (day * 3.5) + (Math.random() * 10 - 5), 98);
      return {
        day,
        efficiency: Math.round(baseEff),
        tasksCompletedToday: Math.floor(baseEff / 2),
        potentialCapacity: 50,
        cumulativeEfficiency: Math.round(baseEff * 0.9 + 5),
        insight: baseEff > 80 ? 'Optimal Flow. Waste eliminated.' : baseEff > 60 ? 'Bottlenecks forming at trade handoffs.' : 'Critical Mura (unevenness) detected.',
      };
    });
  };

  const dailyMetrics = useMemo(() => generateMockDailyMetrics(), []);

  const ppcData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      name: `Week ${i + 1}`,
      ppc: Math.round(50 + (i * 8) + (Math.random() * 10 - 5))
    }));
  }, []);

  const decisions = [
    { label: 'Implemented 5S in Storage Area', positive: true },
    { label: 'Ignored Daily Huddle', positive: false },
    { label: 'Used Last Planner System for Lookahead', positive: true },
    { label: 'Batched sheetrock delivery (Overproduction)', positive: false },
  ];

  const recentLogs = runs.flatMap(r => r.logs).slice(0, 15).filter(Boolean);

  const getEfficiencyBarColor = (eff: number) => {
    if (eff >= 80) return 'bg-emerald-500';
    if (eff >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (!gameState && runs.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-200 font-sans relative overflow-hidden">
        {/* Premium Twilight Industrial Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] right-[20%] w-[50%] h-[50%] bg-indigo-500/20 blur-[150px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg z-10 bg-slate-800/80 backdrop-blur-2xl border border-slate-700/50 p-10 rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden"
        >
          <div className="w-20 h-20 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/30 mb-8 shadow-inner">
            <Activity className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">No Site Data Recorded</h2>
          <p className="text-slate-400 mb-10 text-base leading-relaxed">
            There is no performance data to display yet. Complete a simulated day to populate your site analytics and metrics.
          </p>
          <button
            data-testid="button-go-chapters"
            onClick={() => setLocation('/chapters')}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
          >
            Go to Episodes
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 md:p-8 relative overflow-hidden">
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

      <main className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-700/50">
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
                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 tracking-tight">Performance Metrics</h1>
              </div>
              <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mt-1">Flowstate Analytics</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 px-6 py-3 rounded-2xl flex flex-col items-end shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Episode</span>
              <span className="font-black text-white text-lg leading-none mt-1">Ep {gameState?.chapter || 1}</span>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 px-6 py-3 rounded-2xl flex flex-col items-end shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sim Day</span>
              <span className="font-black text-cyan-400 text-lg leading-none mt-1">{gameState?.day || 0}</span>
            </div>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 flex flex-col relative overflow-hidden rounded-3xl shadow-lg group">
            <div className="absolute right-[-10px] top-[-10px] text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors duration-500">
              <Activity className="w-32 h-32" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">Overall Score</p>
            <p className="text-4xl font-black text-white z-10 drop-shadow-md">{runs.reduce((acc, curr) => acc + (curr.totalScore || 0), 0)}</p>
          </motion.div>

          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 flex flex-col relative overflow-hidden rounded-3xl shadow-lg group">
            <div className="absolute right-[-10px] top-[-10px] text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors duration-500">
              <Layers className="w-32 h-32" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">Current Efficiency</p>
            <div className="flex items-end gap-1 z-10">
              <p className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{dailyMetrics[dailyMetrics.length - 1].efficiency}</p>
              <span className="text-emerald-500 font-bold mb-1">%</span>
            </div>
          </motion.div>

          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 flex flex-col relative overflow-hidden rounded-3xl shadow-lg group">
            <div className="absolute right-[-10px] top-[-10px] text-amber-500/10 group-hover:text-amber-500/20 transition-colors duration-500">
              <Target className="w-32 h-32" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">Avg PPC</p>
            <div className="flex items-end gap-1 z-10">
              <p className="text-4xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">75.4</p>
              <span className="text-amber-500 font-bold mb-1">%</span>
            </div>
          </motion.div>

          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 flex flex-col relative overflow-hidden rounded-3xl shadow-lg group">
            <div className="absolute right-[-10px] top-[-10px] text-purple-500/10 group-hover:text-purple-500/20 transition-colors duration-500">
              <Clock className="w-32 h-32" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">Days Completed</p>
            <p className="text-4xl font-black text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] z-10">{runs.length || 0}</p>
          </motion.div>
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Efficiency Trend */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 p-6 md:p-8 flex flex-col rounded-3xl shadow-xl"
          >
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              Efficiency Trend
            </h2>
            <div className="flex-1 min-h-[300px] w-full ml-[-20px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyMetrics}>
                  <defs>
                    <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" tickLine={false} axisLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: '#f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#cbd5e1' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    name="Daily Efficiency"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDaily)"
                    activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Area
                    type="step"
                    dataKey="cumulativeEfficiency"
                    name="Cumulative"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorCumulative)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* PPC Trend */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 p-6 md:p-8 flex flex-col rounded-3xl shadow-xl"
          >
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              PPC Analytics
            </h2>
            <div className="flex-1 min-h-[250px] w-full ml-[-15px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ppcData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" tickLine={false} axisLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" tickLine={false} axisLine={false} dx={-10} hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: '#f8fafc' }}
                    itemStyle={{ color: '#cbd5e1' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ppc"
                    name="PPC %"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#059669', r: 5, stroke: '#10b981', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#34d399', stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        </div>

        {/* Detailed Breakdown */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 p-6 md:p-8 rounded-3xl shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              Daily Performance Log
            </h2>
          </div>

          <div className="overflow-x-auto max-h-96 rounded-2xl border border-slate-700/50 custom-scrollbar bg-slate-900/50">
            <table className="w-full text-sm text-left" data-testid="table-daily-breakdown">
              <thead className="sticky top-0 bg-slate-800 backdrop-blur-md z-10 border-b border-slate-700/50">
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-5">Day</th>
                  <th className="px-5 py-5">Output</th>
                  <th className="px-5 py-5">Capacity</th>
                  <th className="px-5 py-5 min-w-[150px]">Efficiency</th>
                  <th className="px-5 py-5">Cumul.</th>
                  <th className="px-5 py-5 min-w-[250px]">Lean Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {dailyMetrics.map((m, idx) => (
                  <tr
                    key={m.day}
                    data-testid={`row-day-${m.day}`}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-5 py-4 font-bold text-white">Day {m.day}</td>
                    <td className="px-5 py-4 text-slate-300">{m.tasksCompletedToday}</td>
                    <td className="px-5 py-4 text-slate-400">{m.potentialCapacity}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-black/50 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${getEfficiencyBarColor(m.efficiency)}`}
                            style={{ width: `${m.efficiency}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${m.efficiency >= 80 ? 'text-emerald-400' : m.efficiency >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{m.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/10">{m.cumulativeEfficiency}%</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300 leading-relaxed">{m.insight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Logs and Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 p-6 md:p-8 rounded-3xl shadow-xl"
          >
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <GitBranch className="w-4 h-4" />
              </div>
              Key Decisions
            </h2>

            {decisions.length > 0 ? (
              <div className="space-y-3 mb-4">
                {decisions.map((d, i) => (
                  <div
                    key={i}
                    data-testid={`decision-${i}`}
                    className={`px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-3 bg-black/20 ${d.positive
                      ? 'border-emerald-500/30 text-emerald-400'
                      : 'border-red-500/30 text-red-400'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${d.positive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                    {d.label}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Project Decisions</p>
              </div>
            )}
          </motion.section>

          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 p-6 md:p-8 rounded-3xl shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
                  <Activity className="w-4 h-4" />
                </div>
                Activity Log
              </h2>
              <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 font-bold">LATEST {recentLogs.length}</span>
            </div>

            {recentLogs.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {recentLogs.map((entry, i) => (
                  <div
                    key={i}
                    data-testid={`log-entry-${i}`}
                    className="text-xs text-slate-300 py-3 px-4 bg-slate-900/50 rounded-xl border border-slate-700/50 flex gap-3 leading-relaxed hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-slate-600 font-bold">{(i + 1).toString().padStart(2, '0')}</span>
                    {entry}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Events Recorded</p>
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </div>
  );
}
