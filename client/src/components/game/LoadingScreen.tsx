import { motion } from 'framer-motion';
import { HardHat } from 'lucide-react';

const LEAN_TIPS = [
  "Kanban: Limit Work-In-Progress to maximize flow and reduce bottlenecks.",
  "Last Planner System: Only commit to work that CAN be done, not what SHOULD be done.",
  "5S: Sort, Set in Order, Shine, Standardize, Sustain — the foundation of workplace organization.",
  "Pull Systems: Let downstream demand trigger upstream production. Never push unready work.",
  "Muda (Waste): Overproduction is the worst form of waste — it creates all other wastes.",
  "Takt Time: The heartbeat of production — match your pace to customer demand.",
  "PPC: Percent Plan Complete measures reliability, not productivity.",
  "Constraint Analysis: Finding blockers before they find you is the key to reliable planning.",
  "Visual Management: If you can see it, you can manage it. Make work visible.",
  "Continuous Improvement: Small daily gains compound into transformational change.",
];

export const LoadingScreen: React.FC = () => {
  const tip = LEAN_TIPS[Math.floor(Math.random() * LEAN_TIPS.length)];

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-slate-950" data-testid="loading-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-8 max-w-md px-6 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]"
        >
          <HardHat className="w-10 h-10 text-white" />
        </motion.div>

        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            FLOW<span className="text-cyan-400">STATE</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">
            A Lean Construction Story
          </p>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-blue-500"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 max-w-sm"
        >
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Lean Tip</p>
          <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
