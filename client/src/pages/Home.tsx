import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-200 to-purple-100 flex flex-col items-center justify-center p-4">
      {/* Animated Background Placeholder - Could be SVG or Canvas later */}
      <div className="absolute inset-0 -z-10 opacity-30">
        {/* Add moving clouds/cityscape here later */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 drop-shadow-sm">
          FLOWSTATE
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 font-light mb-12 tracking-wide">
          Saga of the Flow Architect
        </p>

        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
          <Link href="/chapters">
            <button className="w-full py-4 text-xl font-bold text-white bg-blue-500 rounded-2xl shadow-lg hover:bg-blue-600 hover:shadow-xl hover:scale-105 transition-all transform active:scale-95">
              START GAME
            </button>
          </Link>

          <button
            className="w-full py-4 text-xl font-bold text-slate-500 bg-white/50 rounded-2xl border-2 border-slate-200 cursor-not-allowed"
            disabled
          >
            MULTIPLAYER — Coming Soon
          </button>

          <Link href="/settings">
            <button className="w-full py-3 text-lg font-medium text-slate-700 bg-white rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
              SETTINGS
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Footer Credits */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-4 text-center w-full"
      >
        <p className="text-slate-500 text-sm font-medium">
          Made by <a href="https://www.linkedin.com/in/hemantkumar2430/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline">Hemant Kumar</a>
        </p>
      </motion.footer>
    </div>
  );
}
