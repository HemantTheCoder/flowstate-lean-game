import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Debrief() {
  const { lpi, chapter, week, dailyMetrics } = useGameStore();
  const [location, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation('/game');
  };

  const chartData = dailyMetrics.length > 0 ? dailyMetrics : [
    { day: 1, efficiency: 40, tasksDone: 2 },
    { day: 2, efficiency: 60, tasksDone: 3 },
    { day: 3, efficiency: 50, tasksDone: 2 },
    { day: 4, efficiency: 75, tasksDone: 5 },
    { day: 5, efficiency: 90, tasksDone: 6 },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 text-white overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-slate-900 rounded-[2rem] p-6 md:p-12 shadow-[0_0_80px_rgba(59,130,246,0.15)] border border-slate-800"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 uppercase tracking-tighter">
              Site Performance Report
            </h1>
            <div className="flex items-center gap-3">
               <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400 text-xs font-bold border border-slate-700 uppercase">Chapter {chapter}</span>
               <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400 text-xs font-bold border border-slate-700 uppercase">Week {week}</span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LPI Score</div>
              <div className="text-3xl font-black text-blue-400">{(lpi.flowEfficiency + lpi.teamMorale) / 2}%</div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 flex items-center justify-center">
               <span className="text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Main Visual: Flow Trend */}
          <div className="lg:col-span-2 bg-slate-800/30 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
            <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
               <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Flow Efficiency Trend
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                    activeDot={{ r: 6 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Stats: Radial/Bar progress */}
          <div className="flex flex-col gap-4">
             <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 flex-1">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Site Throughput</span>
                  <span className="text-emerald-400 font-mono text-xs font-bold">{chartData.reduce((acc, d) => acc + d.tasksDone, 0)} Units</span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <Bar dataKey="tasksDone" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 flex-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Workfront Health</span>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-400">TEAM MORALE</span>
                      <span className="text-green-400">{lpi.teamMorale}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${lpi.teamMorale}%` }}
                        className="h-full bg-gradient-to-r from-green-600 to-green-400" 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-400">WIP COMPLIANCE</span>
                      <span className="text-yellow-400">{lpi.wipCompliance}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${lpi.wipCompliance}%` }}
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" 
                      />
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-blue-600/5 p-8 rounded-[2rem] border border-blue-500/20 gap-6">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="text-5xl">👷</div>
            <div>
              <h4 className="font-black text-white text-xl uppercase tracking-tight">"Stability is the foundation of Improvement."</h4>
              <p className="text-blue-400/80 text-sm font-bold uppercase tracking-widest mt-1">Site Engineer's Observation</p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            className="group relative px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest text-sm"
          >
            Advance to Next Phase
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
