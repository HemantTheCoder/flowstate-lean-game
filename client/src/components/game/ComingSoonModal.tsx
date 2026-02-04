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
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 pointer-events-auto overflow-hidden">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border-4 border-slate-100 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className={`p-6 text-white flex justify-between items-center shrink-0 ${mode === 'multiplayer' ? 'bg-indigo-600' : 'bg-orange-600'}`}>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-wider">{content.title}</h2>
                                <p className="text-white/80 font-medium">{content.subtitle}</p>
                            </div>
                            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                                <span className="text-4xl">×</span>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">

                            {/* Intro */}
                            <div className="text-lg text-slate-600 leading-relaxed font-medium">
                                {content.intro}
                            </div>

                            {/* Main Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {content.sections.map((section, idx) => (
                                    <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                                            {section.title}
                                        </h3>
                                        <div className="space-y-4">
                                            {section.items.map((item, i) => (
                                                <div key={i} className="flex gap-3">
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <div>
                                                        <h4 className="font-bold text-slate-700">{item.title}</h4>
                                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Special Section */}
                            <div className={`p-6 rounded-2xl border-l-8 ${mode === 'multiplayer' ? 'bg-indigo-50 border-indigo-500' : 'bg-orange-50 border-orange-500'}`}>
                                <h3 className={`text-xl font-black mb-2 ${mode === 'multiplayer' ? 'text-indigo-800' : 'text-orange-800'}`}>
                                    {content.roleThinking.title}
                                </h3>
                                <p className={`${mode === 'multiplayer' ? 'text-indigo-700' : 'text-orange-700'}`}>
                                    {content.roleThinking.desc}
                                </p>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 uppercase tracking-widest font-bold shrink-0">
                            {content.footer}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
