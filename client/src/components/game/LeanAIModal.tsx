import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Brain, Lightbulb, MessageCircle, Sparkles, BookOpen, HelpCircle, Wrench } from 'lucide-react';

interface LeanAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeanAIModal: React.FC<LeanAIModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center bg-[#0A0B1A]/80 backdrop-blur-md p-4 pointer-events-auto overflow-hidden">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 md:p-8 flex justify-between items-center shrink-0 relative overflow-hidden border-b border-white/5">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600" />
              <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')]" />
              <div className="relative z-10 flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                >
                  <Brain className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                    <Sparkles className="w-3 h-3" />
                    Coming Soon
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                    Lean AI <span className="text-emerald-400">Assistant</span>
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                data-testid="button-close-lean-ai"
                className="relative z-10 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar text-slate-200">
              <div className="text-lg text-slate-300 leading-relaxed font-light">
                Your personal AI companion for mastering Lean Construction. Ask anything about the game,
                Lean principles, or real-world construction management — and get instant, context-aware answers.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full opacity-10 bg-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-emerald-400">
                    <MessageCircle className="w-4 h-4" />
                    What You Can Ask
                  </h3>
                  <div className="space-y-4 relative z-10">
                    {[
                      { icon: <HelpCircle className="w-5 h-5" />, title: "Game Help", desc: "\"How do I improve my PPC score?\" or \"What does the WIP limit do?\"" },
                      { icon: <BookOpen className="w-5 h-5" />, title: "Lean Concepts", desc: "\"Explain the Last Planner System\" or \"What are the 7 wastes in Lean?\"" },
                      { icon: <Wrench className="w-5 h-5" />, title: "Real-World Applications", desc: "\"How is Kanban used in construction?\" or \"What is takt time planning?\"" },
                      { icon: <Lightbulb className="w-5 h-5" />, title: "Strategy Tips", desc: "\"Should I prioritize structural or MEP tasks?\" or \"How to handle weather delays?\"" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-400 leading-relaxed italic">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full opacity-10 bg-cyan-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                    AI Features
                  </h3>
                  <div className="space-y-4 relative z-10">
                    {[
                      { icon: "1", title: "Context-Aware Answers", desc: "The AI knows your current chapter, day, and decisions — giving you relevant advice." },
                      { icon: "2", title: "Lean Knowledge Base", desc: "Powered by comprehensive Lean Construction literature and industry best practices." },
                      { icon: "3", title: "Interactive Learning", desc: "Ask follow-up questions, explore concepts deeper, and connect theory to gameplay." },
                      { icon: "4", title: "Real-World Bridge", desc: "See how game mechanics map to actual construction project management techniques." },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border relative overflow-hidden bg-emerald-900/20 border-emerald-500/30">
                <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-emerald-400 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Preview: What a conversation might look like
                  </h3>
                  <div className="space-y-3 mt-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-xs font-bold text-slate-300">You</div>
                      <div className="bg-slate-800/60 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-300 max-w-[80%]">
                        My WIP limit is at 3 but tasks keep piling up in the Ready column. What should I do?
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-emerald-100/90 max-w-[80%]">
                        That's actually a good sign — your WIP limit is working! It's exposing a bottleneck. In Lean terms, this is called "making problems visible." Focus on completing in-progress tasks before pulling new ones. Check if any tasks in "Doing" have unresolved constraints blocking their completion.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5 text-center shrink-0">
              <p className="text-xs text-slate-500 mb-4">Lean AI is currently in development. Stay tuned for updates!</p>
              <button
                onClick={onClose}
                data-testid="button-close-lean-ai-footer"
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl uppercase tracking-widest text-xs transition-colors shadow-lg shadow-emerald-900/30"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
