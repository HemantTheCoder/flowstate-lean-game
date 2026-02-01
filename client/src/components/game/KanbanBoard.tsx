import React from 'react';
import { useGameStore, Column, Task } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export const KanbanBoard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { columns, moveTask, setWipLimit, funds, materials } = useGameStore();

    const handleTaskClick = (task: Task, currentColumn: Column) => {
        // Simple logic: move to next column if possible
        // In a real game, this might be drag and drop.
        const colIndex = columns.findIndex(c => c.id === currentColumn.id);
        if (colIndex < columns.length - 1) {
            const nextCol = columns[colIndex + 1];
            moveTask(task.id, currentColumn.id, nextCol.id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-8"
            onClick={(e) => {
                // Close if clicking outside
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-slate-100 w-full h-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">

                {/* Header */}
                <div className="bg-white p-6 shadow-sm flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Project Board</h2>
                        <div className="flex gap-4 mt-2">
                            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-mono font-bold border border-blue-100">
                                Funds: ${funds}
                            </div>
                            <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-mono font-bold border border-amber-100">
                                Materials: {materials}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-xl font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>
                {/* Columns Grid */}
                <div className="flex-1 flex gap-6 p-6 overflow-x-auto">
                    {columns.map(col => {
                        // Advisor Logic for Visual Cues
                        let highlightClass = "border-slate-200";
                        let adviceText = null;

                        if (col.id === 'doing' && col.tasks.length >= col.wipLimit) {
                            highlightClass = "border-red-400 ring-4 ring-red-100";
                            adviceText = "Bottleneck!";
                        }
                        if (col.id === 'ready' && col.tasks.length === 0) {
                            highlightClass = "border-orange-300 ring-4 ring-orange-100";
                            adviceText = "Starved!";
                        }

                        return (
                            <div key={col.id} id={`col-${col.id}`} className={`min-w-[280px] w-full max-w-sm flex flex-col h-full bg-slate-50 rounded-2xl border-2 transition-all ${highlightClass} overflow-hidden`}>
                                {/* Column Header */}
                                <div className={`${col.id === 'done' ? 'bg-green-100' : 'bg-white'} p-4 border-b border-slate-100`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-slate-700">{col.title}</h3>
                                        {col.wipLimit > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${col.tasks.length >= col.wipLimit ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {col.tasks.length} / {col.wipLimit}
                                                </span>
                                                <input
                                                    type="number"
                                                    className="w-10 text-xs bg-slate-100 text-center rounded hidden group-hover:block"
                                                    defaultValue={col.wipLimit}
                                                    onChange={(e) => setWipLimit(col.id, parseInt(e.target.value))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {adviceText && (
                                        <div className="text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-wide">
                                            ⚠️ {adviceText}
                                        </div>
                                    )}
                                </div>

                                {/* Task List */}
                                <div className="flex-1 bg-slate-100 p-4 space-y-3 overflow-y-auto">
                                    <AnimatePresence>
                                        {col.tasks.map(task => (
                                            <motion.div
                                                key={task.id}
                                                id={`task-${task.id}`}
                                                onClick={() => handleTaskClick(task, col)}
                                                layoutId={task.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-blue-400 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group relative"
                                            >
                                                <h4 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                                                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{task.description}</p>

                                                {/* Economy Tags */}
                                                <div className="mt-2 flex gap-2 text-xs font-mono font-bold">
                                                    <span className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">-{task.cost} Mat</span>
                                                    <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+${task.reward}</span>
                                                </div>

                                                {/* Lean Tip */}
                                                {task.leanTip && (
                                                    <div className="mt-3 text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                                        💡 {task.leanTip}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {col.tasks.length === 0 && (
                                        <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">
                                            Empty
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
