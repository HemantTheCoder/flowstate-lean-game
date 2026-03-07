import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save, Trash2, Replace, HardHat, Wrench, Cpu, Paintbrush, ClipboardList, AlertTriangle, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { TaskType } from '@/data/tasks';
import { TaskIconDisplay } from './TaskIconDisplay';
import { v4 as uuidv4 } from 'uuid';
import soundManager from '@/lib/soundManager';

const TASK_TYPES = ['Structural', 'Systems', 'Interior', 'Management'] as const;
const CONSTRAINT_OPTIONS: { value: 'material' | 'crew' | 'approval' | 'weather'; label: string; icon: string }[] = [
    { value: 'material', label: 'Material', icon: '📦' },
    { value: 'crew', label: 'Crew', icon: '👷' },
    { value: 'approval', label: 'Approval', icon: '📋' },
    { value: 'weather', label: 'Weather', icon: '🌧️' },
];

const TYPE_ICONS = {
    Structural: HardHat,
    Systems: Cpu,
    Interior: Paintbrush,
    Management: ClipboardList,
};

interface CustomTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    editTask?: TaskType | null;        // If set, editing an existing custom task
    replaceTaskId?: string | null;     // If set, replacing a default task (originalId)
    onSaveCustom?: (task: TaskType) => void; // If set, passes task to parent instead of store
}

export const CustomTaskModal: React.FC<CustomTaskModalProps> = ({
    isOpen,
    onClose,
    editTask,
    replaceTaskId,
    onSaveCustom,
}) => {
    const { addCustomTask, editCustomTask, deleteCustomTask, replaceTask, columns } = useGameStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<typeof TASK_TYPES[number]>('Structural');
    const [cost, setCost] = useState(50);
    const [reward, setReward] = useState(1500);
    const [difficulty, setDifficulty] = useState(3);
    const [leanTip, setLeanTip] = useState('');
    const [constraints, setConstraints] = useState<Set<'material' | 'crew' | 'approval' | 'weather'>>(new Set());
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEditing = !!editTask;
    const isReplacing = !!replaceTaskId;

    // Find the task being replaced for display
    const replacedTask = isReplacing
        ? columns.flatMap(c => c.tasks).find(t => t.originalId === replaceTaskId)
        : null;

    // Populate form when editing
    useEffect(() => {
        if (editTask) {
            setTitle(editTask.title);
            setDescription(editTask.description);
            setType(editTask.type);
            setCost(editTask.cost);
            setReward(editTask.reward);
            setDifficulty(editTask.difficulty);
            setLeanTip(editTask.leanTip || '');
            setConstraints(new Set(editTask.constraints || []));
        } else {
            resetForm();
        }
    }, [editTask, isOpen]);

    function resetForm() {
        setTitle('');
        setDescription('');
        setType('Structural');
        setCost(50);
        setReward(1500);
        setDifficulty(3);
        setLeanTip('');
        setConstraints(new Set());
        setErrors({});
    }

    function validate(): boolean {
        const errs: Record<string, string> = {};
        if (!title.trim()) errs.title = 'Title is required';
        if (title.length > 50) errs.title = 'Title too long (max 50 chars)';
        if (!description.trim()) errs.description = 'Description is required';
        if (cost < 0) errs.cost = 'Cost cannot be negative';
        if (reward < 0) errs.reward = 'Reward cannot be negative';
        if (difficulty < 1 || difficulty > 5) errs.difficulty = 'Difficulty must be 1-5';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleSave() {
        if (!validate()) return;

        const taskData: TaskType = {
            id: isEditing ? editTask!.id : `custom-${uuidv4()}`,
            title: title.trim(),
            description: description.trim(),
            type,
            cost,
            reward,
            difficulty,
            leanTip: leanTip.trim() || undefined,
            constraints: constraints.size > 0 ? Array.from(constraints) : undefined,
        };

        if (isEditing) {
            editCustomTask(editTask!.id, taskData);
            soundManager.playSFX('click');
        } else if (isReplacing && replaceTaskId) {
            replaceTask(replaceTaskId, taskData);
            soundManager.playSFX('success');
        } else if (onSaveCustom) {
            onSaveCustom(taskData);
            soundManager.playSFX('success');
        } else {
            addCustomTask(taskData);
            soundManager.playSFX('success');
        }

        resetForm();
        onClose();
    }

    function handleDelete() {
        if (isEditing && editTask) {
            deleteCustomTask(editTask.id);
            soundManager.playSFX('click');
            resetForm();
            onClose();
        }
    }

    function toggleConstraint(c: 'material' | 'crew' | 'approval' | 'weather') {
        setConstraints(prev => {
            const next = new Set(prev);
            if (next.has(c)) next.delete(c);
            else next.add(c);
            return next;
        });
    }

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const TypeIcon = TYPE_ICONS[type];

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="modal-backdrop"
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
                                    {isReplacing ? (
                                        <Replace className="w-5 h-5 text-amber-400" />
                                    ) : isEditing ? (
                                        <Wrench className="w-5 h-5 text-cyan-400" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-emerald-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-200">
                                        {isReplacing ? 'Replace Task' : isEditing ? 'Edit Task' : 'Create Custom Task'}
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        {isReplacing
                                            ? `Replacing: ${replacedTask?.title || replaceTaskId}`
                                            : 'Build your own construction task'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        {/* Replacing info banner */}
                        {isReplacing && replacedTask && (
                            <div className="mx-5 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-amber-300">
                                    This will replace <strong>"{replacedTask.title}"</strong> on the board with your custom task. The original task can be re-added later.
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <div className="p-5 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Task Title *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Install Solar Panels"
                                    className={`w-full px-3 py-2.5 bg-slate-800/80 border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${errors.title ? 'border-red-500/50' : 'border-slate-700/50'}`}
                                    maxLength={50}
                                />
                                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                                <p className="text-[10px] text-slate-500 mt-1">{title.length}/50</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Description *
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe what this construction task involves..."
                                    rows={3}
                                    className={`w-full px-3 py-2.5 bg-slate-800/80 border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none ${errors.description ? 'border-red-500/50' : 'border-slate-700/50'}`}
                                />
                                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                            </div>

                            {/* Task Type */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Task Type
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {TASK_TYPES.map(t => {
                                        const Icon = TYPE_ICONS[t];
                                        const colorMap: Record<string, string> = {
                                            Structural: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/40 text-cyan-400',
                                            Systems: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/40 text-emerald-400',
                                            Interior: 'from-amber-500/20 to-amber-600/20 border-amber-500/40 text-amber-400',
                                            Management: 'from-purple-500/20 to-purple-600/20 border-purple-500/40 text-purple-400',
                                        };
                                        const isActive = type === t;
                                        return (
                                            <button
                                                key={t}
                                                onClick={() => setType(t)}
                                                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wide transition-all ${isActive
                                                    ? `bg-gradient-to-br ${colorMap[t]} scale-105 shadow-lg`
                                                    : 'bg-slate-800/50 border-slate-700/30 text-slate-500 hover:bg-slate-800'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {t}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Cost / Reward / Difficulty Row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                        Cost
                                    </label>
                                    <input
                                        type="number"
                                        value={cost}
                                        onChange={(e) => setCost(Number(e.target.value))}
                                        min={0}
                                        className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${errors.cost ? 'border-red-500/50' : 'border-slate-700/50'}`}
                                    />
                                    {errors.cost && <p className="text-[10px] text-red-400 mt-1">{errors.cost}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                        Reward
                                    </label>
                                    <input
                                        type="number"
                                        value={reward}
                                        onChange={(e) => setReward(Number(e.target.value))}
                                        min={0}
                                        className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${errors.reward ? 'border-red-500/50' : 'border-slate-700/50'}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                        Difficulty
                                    </label>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setDifficulty(d)}
                                                className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${d <= difficulty
                                                    ? 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20'
                                                    : 'bg-slate-800 border border-slate-700/50 text-slate-500 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Constraints */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Constraints (optional)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CONSTRAINT_OPTIONS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => toggleConstraint(c.value)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${constraints.has(c.value)
                                                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                                                : 'bg-slate-800/50 border-slate-700/30 text-slate-500 hover:bg-slate-800'
                                                }`}
                                        >
                                            <span>{c.icon}</span>
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lean Tip */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Lean Tip (optional)
                                </label>
                                <input
                                    type="text"
                                    value={leanTip}
                                    onChange={(e) => setLeanTip(e.target.value)}
                                    placeholder="e.g., Pull-based scheduling reduces installation waste"
                                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Educational tip shown when this task is completed
                                </p>
                            </div>

                            {/* Preview */}
                            <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Preview</p>
                                <div className="flex items-start gap-2">
                                    <TaskIconDisplay type={type} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-slate-200">{title || 'Task Title'}</h4>
                                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{description || 'Task description...'}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] font-mono text-slate-500">{type}</span>
                                            <span className="text-[9px] text-emerald-400">+${reward}</span>
                                            <span className="text-[9px] text-red-400">-${cost}</span>
                                            {Array.from(constraints).map(c => (
                                                <span key={c} className="text-[9px] bg-red-500/20 text-red-300 px-1 rounded">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-5 border-t border-slate-700/50">
                            {isEditing ? (
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            ) : (
                                <div />
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700/50 hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {isReplacing ? 'Replace Task' : isEditing ? 'Save Changes' : 'Add Task'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};
