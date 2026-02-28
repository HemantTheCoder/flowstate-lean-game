import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'multiplayer' | 'cases';
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose, mode }) => {

    // Content Configuration
    const content = mode === 'multiplayer' ? {
        title: "Coming Soon — Collaborative Mode",
        subtitle: "Multiplayer (Under Development)",
        intro: "Construction is never a solo effort. Soon, FLOWSTATE will support collaborative project delivery, where multiple players manage the same project in real time — each responsible for a different part of the system.",
        sections: [
            {
                title: "Planned Features",
                items: [
                    { icon: "P", title: "Planner", desc: "Creates weekly commitments, manages lookahead, removes constraints." },
                    { icon: "S", title: "Site Manager", desc: "Controls crews, sequencing, daily execution, and site conditions." },
                    { icon: "L", title: "Supply Coordinator", desc: "Handles materials, deliveries, and logistics timing." },
                    { icon: "Q", title: "Quality & Safety Lead", desc: "Manages inspections, defects, and compliance." }
                ]
            },
            {
                title: "Multiplayer Modes",
                items: [
                    { icon: "CO", title: "Co-Op Mode", desc: "Work together to deliver projects with high Lean performance." },
                    { icon: "VS", title: "Challenge Mode", desc: "Teams compete on identical projects to achieve best PPC and flow." },
                    { icon: "ED", title: "Scenario Mode", desc: "Instructor-led simulations for classrooms and workshops." }
                ]
            }
        ],
        roleThinking: {
            title: "Role-Based Thinking (Single Player)",
            desc: "Even in single-player, future updates will allow you to switch perspectives. Learn to think like an integrated project team — not just an individual engineer."
        },
        footer: "These features are designed to reflect real-world construction collaboration and Lean project delivery."
    } : {
        title: "Real-World Project Scenarios",
        subtitle: "Case-Based Mini Levels (Under Development)",
        intro: "Soon, FLOWSTATE will include case-based project levels inspired by real civil engineering works. These are short, focused scenarios where you apply Lean concepts to realistic construction problems.",
        sections: [
            {
                title: "Planned Case Categories",
                items: [
                    { icon: "HW", title: "Highway Construction", desc: "Manage earthwork, paving, and traffic constraints while maintaining flow." },
                    { icon: "HR", title: "High-Rise Building", desc: "Coordinate multiple trades across floors with limited space and strict sequencing." },
                    { icon: "UD", title: "Urban Drainage System", desc: "Handle unpredictable weather, approvals, and underground utilities." },
                    { icon: "TC", title: "Transit Corridor", desc: "Deliver long linear projects with inspection dependencies and public disruption." }
                ]
            },
            {
                title: "How Case Levels Work",
                items: [
                    { icon: "1", title: "Project Brief", desc: "Specific scope, deadline, and risks." },
                    { icon: "2", title: "Limited Lean Tools", desc: "Test your skills with constraints." },
                    { icon: "3", title: "Performance Grading", desc: "Graded on PPC, Flow Efficiency, and Waste Reduction." }
                ]
            }
        ],
        roleThinking: {
            title: "🎯 Learning Purpose",
            desc: "Transfer Lean concepts to new contexts. Practice decision-making under uncertainty. Compare different strategies and understand system-wide impacts."
        },
        footer: "Designed to simulate real project environments and strengthen practical Lean thinking."
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0A0B1A]/80 backdrop-blur-md p-4 pointer-events-auto overflow-hidden">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className={`p-6 md:p-8 flex justify-between items-center shrink-0 relative overflow-hidden border-b border-white/5`}>
                            <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${mode === 'multiplayer' ? 'from-indigo-600 to-blue-600' : 'from-orange-600 to-amber-600'}`} />
                            <div className="relative z-10">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest mb-3`}>
                                    Upcoming Feature
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">{content.title}</h2>
                                <p className="text-slate-300 font-medium mt-1">{content.subtitle}</p>
                            </div>
                            <button onClick={onClose} className="relative z-10 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors">
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar text-slate-200">

                            {/* Intro */}
                            <div className="text-lg text-slate-300 leading-relaxed font-light">
                                {content.intro}
                            </div>

                            {/* Main Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {content.sections.map((section, idx) => (
                                    <div key={idx} className="bg-black/20 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full opacity-10 ${mode === 'multiplayer' ? 'bg-indigo-500' : 'bg-orange-500'}`} />
                                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${mode === 'multiplayer' ? 'text-indigo-400' : 'text-orange-400'}`}>
                                            {section.title}
                                        </h3>
                                        <div className="space-y-4 relative z-10">
                                            {section.items.map((item, i) => (
                                                <div key={i} className="flex gap-4 items-start">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${mode === 'multiplayer' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`}>
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
                                ))}
                            </div>

                            {/* Special Section */}
                            <div className={`p-6 rounded-2xl border relative overflow-hidden ${mode === 'multiplayer' ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-orange-900/20 border-orange-500/30'}`}>
                                <div className={`absolute inset-0 opacity-10 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]`} />
                                <div className="relative z-10">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${mode === 'multiplayer' ? 'text-indigo-400' : 'text-orange-400'}`}>
                                        {content.roleThinking.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed ${mode === 'multiplayer' ? 'text-indigo-200/80' : 'text-orange-200/80'}`}>
                                        {content.roleThinking.desc}
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-black/40 border-t border-white/5 text-center shrink-0">
                            <button
                                onClick={onClose}
                                className={`w-full md:w-auto px-8 py-4 text-white font-bold rounded-xl uppercase tracking-widest text-xs transition-colors shadow-lg ${mode === 'multiplayer' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20'}`}
                            >
                                Close Briefing
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
