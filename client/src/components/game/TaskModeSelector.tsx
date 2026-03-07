import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat, Wrench, Building2, Zap, Factory, Home, Landmark, TreePine, Plus, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { TaskType, CONSTRUCTION_TASKS, CHAPTER_2_TASKS } from '@/data/tasks';
import { CustomTaskModal } from './CustomTaskModal';
import { TaskIconDisplay } from './TaskIconDisplay';
import soundManager from '@/lib/soundManager';
import { v4 as uuidv4 } from 'uuid';

/** Construction type presets with category descriptions */
const CONSTRUCTION_TYPES = [
    { id: 'commercial', label: 'Commercial Building', icon: Building2, description: 'Office, retail, or mixed-use construction', color: 'cyan' },
    { id: 'residential', label: 'Residential Housing', icon: Home, description: 'Single or multi-family dwellings', color: 'emerald' },
    { id: 'industrial', label: 'Industrial / Factory', icon: Factory, description: 'Warehouses, factories, and plants', color: 'amber' },
    { id: 'infrastructure', label: 'Infrastructure', icon: Landmark, description: 'Roads, bridges, and public works', color: 'purple' },
    { id: 'renovation', label: 'Renovation / Retrofit', icon: Wrench, description: 'Remodeling and structural upgrades', color: 'rose' },
    { id: 'custom', label: 'Fully Custom', icon: Plus, description: 'Build your task list from scratch', color: 'sky' },
] as const;

const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    cyan: { bg: 'from-cyan-500/20 to-cyan-600/20', border: 'border-cyan-500/40', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    amber: { bg: 'from-amber-500/20 to-amber-600/20', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/40', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
    rose: { bg: 'from-rose-500/20 to-rose-600/20', border: 'border-rose-500/40', text: 'text-rose-400', glow: 'shadow-rose-500/20' },
    sky: { bg: 'from-sky-500/20 to-sky-600/20', border: 'border-sky-500/40', text: 'text-sky-400', glow: 'shadow-sky-500/20' },
};

interface TaskModeSelectorProps {
    isOpen: boolean;
    onSelect: (mode: 'predefined' | 'custom') => void;
}

export const TaskModeSelector: React.FC<TaskModeSelectorProps> = ({ isOpen, onSelect }) => {
    const { chapter, addCustomTask, columns } = useGameStore();
    const [step, setStep] = useState<'choose' | 'type' | 'tasks'>('choose');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [customTasks, setCustomTasks] = useState<TaskType[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    const currentTasks = chapter <= 1 ? CONSTRUCTION_TASKS : CHAPTER_2_TASKS;

    function handleUsePredefined() {
        soundManager.playSFX('click');
        onSelect('predefined');
    }

    function handleUseCustom() {
        soundManager.playSFX('click');
        setStep('type');
    }

    function handleSelectType(typeId: string) {
        soundManager.playSFX('click');
        setSelectedType(typeId);
        setStep('tasks');
    }

    function handleAddCustomTaskToList(task: TaskType) {
        setCustomTasks(prev => [...prev, task]);
    }

    function handleFinalize() {
        // Add all custom tasks to the game board
        customTasks.forEach(task => {
            addCustomTask(task);
        });
        soundManager.playSFX('success');
        onSelect('custom');
    }

    if (!isOpen) return null;

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {step === 'choose' && (
                        <motion.div
                            key="choose"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl"
                        >
                            {/* Header */}
                            <div className="text-center mb-8">
                                <motion.div
                                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <HardHat className="w-8 h-8 text-cyan-400" />
                                </motion.div>
                                <h1 className="text-2xl font-black text-white mb-2">Choose Your Task Mode</h1>
                                <p className="text-sm text-slate-400 max-w-md mx-auto">
                                    Use the default construction tasks, or create your own based on your project type
                                </p>
                            </div>

                            {/* Two main options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Pre-defined */}
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUsePredefined}
                                    className="group p-6 rounded-3xl bg-slate-900/90 border border-slate-700/50 hover:border-emerald-500/50 transition-all text-left shadow-lg hover:shadow-emerald-500/10"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Building2 className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-1">Pre-defined Tasks</h3>
                                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                        Use the standard commercial construction tasks — foundation, framing, MEP, fixtures, and more.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                                            {currentTasks.length} TASKS READY
                                        </span>
                                        <span className="text-[10px] text-slate-500">Recommended for first play</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-4 text-xs text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Start with defaults <ArrowRight className="w-3 h-3" />
                                    </div>
                                </motion.button>

                                {/* Custom */}
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUseCustom}
                                    className="group p-6 rounded-3xl bg-slate-900/90 border border-slate-700/50 hover:border-cyan-500/50 transition-all text-left shadow-lg hover:shadow-cyan-500/10"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-1">Custom Tasks</h3>
                                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                        Create tasks based on your construction type — residential, industrial, infrastructure, renovation, or fully custom.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-full">
                                            CUSTOMIZABLE
                                        </span>
                                        <span className="text-[10px] text-slate-500">For domain experts</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-4 text-xs text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Choose your project type <ArrowRight className="w-3 h-3" />
                                    </div>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'type' && (
                        <motion.div
                            key="type"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="w-full max-w-2xl"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-black text-white mb-1">Select Construction Type</h2>
                                <p className="text-sm text-slate-400">What type of project are you working on?</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {CONSTRUCTION_TYPES.map(ct => {
                                    const Icon = ct.icon;
                                    const c = colorClasses[ct.color];
                                    return (
                                        <motion.button
                                            key={ct.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleSelectType(ct.id)}
                                            className={`p-4 rounded-2xl bg-slate-900/90 border border-slate-700/50 hover:${c.border} transition-all text-left group`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} border ${c.border} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                                <Icon className={`w-5 h-5 ${c.text}`} />
                                            </div>
                                            <h4 className="font-bold text-sm text-white">{ct.label}</h4>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{ct.description}</p>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setStep('choose')}
                                className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors mx-auto block"
                            >
                                ← Back to mode selection
                            </button>
                        </motion.div>
                    )}

                    {step === 'tasks' && (
                        <motion.div
                            key="tasks"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="w-full max-w-2xl"
                        >
                            <div className="text-center mb-4">
                                <h2 className="text-xl font-black text-white mb-1">
                                    Build Your Task List
                                </h2>
                                <p className="text-sm text-slate-400">
                                    {selectedType === 'custom'
                                        ? 'Add tasks from scratch for your custom project'
                                        : `Add tasks for your ${CONSTRUCTION_TYPES.find(t => t.id === selectedType)?.label || ''} project`}
                                </p>
                                <div className="mt-2 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg inline-block">
                                    <Sparkles className="w-3 h-3 inline mr-1.5 mb-0.5" />
                                    Recommendation: Create 8-12 tasks for optimal pacing and resource management gameplay.
                                </div>
                            </div>

                            {/* Task list */}
                            <div className="bg-slate-900/90 border border-slate-700/50 rounded-2xl p-4 max-h-[50vh] overflow-y-auto mb-4">
                                {customTasks.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm font-bold">No tasks yet</p>
                                        <p className="text-xs mt-1">Click "Add Task" below to start building your list</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {customTasks.map((task, i) => (
                                            <motion.div
                                                key={task.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`flex items-start gap-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700/30 ${task.type === 'Structural' ? 'border-l-4 border-l-cyan-500/50'
                                                    : task.type === 'Systems' ? 'border-l-4 border-l-emerald-500/50'
                                                        : task.type === 'Interior' ? 'border-l-4 border-l-amber-500/50'
                                                            : 'border-l-4 border-l-purple-500/50'
                                                    }`}
                                            >
                                                <TaskIconDisplay type={task.type} size="sm" className="mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-bold text-sm text-slate-200">{task.title}</span>
                                                        <button
                                                            onClick={() => setCustomTasks(prev => prev.filter(t => t.id !== task.id))}
                                                            className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-mono text-slate-500">{task.type}</span>
                                                        <span className="text-[9px] text-emerald-400">+${task.reward}</span>
                                                        <span className="text-[9px] text-red-400">-${task.cost}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setStep('type')}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    ← Back
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Task
                                    </button>
                                    <button
                                        onClick={handleFinalize}
                                        disabled={customTasks.length === 0}
                                        className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white shadow-lg transition-all ${customTasks.length > 0
                                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105'
                                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Start with {customTasks.length} Task{customTasks.length !== 1 ? 's' : ''}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Custom Task Modal for adding individual tasks */}
            <CustomTaskModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSaveCustom={handleAddCustomTaskToList}
            />
        </>
    );
};
