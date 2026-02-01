import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';

export default function Debrief() {
  const { lpi, chapter, week } = useGameStore();
  const [location, setLocation] = useLocation();

  const handleContinue = () => {
    // Logic to start next week or chapter
    // For now, just go back to game
    setLocation('/game');
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-slate-800 rounded-3xl p-10 shadow-2xl border border-slate-700"
      >
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Week Report
        </h1>
        <p className="text-slate-400 mb-8 text-xl">Chapter {chapter} | Week {week}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Score Card */}
          <div className="bg-slate-700/50 p-6 rounded-2xl">
            <h3 className="text-slate-300 font-bold uppercase tracking-wider mb-4">Lean Performance Index (LPI)</h3>
            <div className="flex items-end gap-2">
              <span className="text-6xl font-black text-green-400">{(lpi.flowEfficiency + lpi.teamMorale) / 2}%</span>
              <span className="text-slate-400 mb-2">Efficiency Rating</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Flow Efficiency</span>
                <span className="font-mono">{lpi.flowEfficiency}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${lpi.flowEfficiency}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Team Morale</span>
                <span className="font-mono">{lpi.teamMorale}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${lpi.teamMorale}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">WIP Compliance</span>
                <span className="font-mono">{lpi.wipCompliance}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${lpi.wipCompliance}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
          <div>
            <h4 className="font-bold text-white mb-1">"The site is looking better, Architect!"</h4>
            <p className="text-slate-400 text-sm">- Mira (Site Engineer)</p>
          </div>
          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
          >
            Start Next Week
          </button>
        </div>

      </motion.div>
    </div>
  );
}
