import React from 'react';
import { useGameStore, Column, Task } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export const KanbanBoard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { columns, moveTask, setWipLimit, funds, materials, tutorialStep, setTutorialStep, day } = useGameStore();

    const handleTaskClick = (task: Task, currentColumn: Column) => {
        // Simple logic: move to next column if possible
        const colIndex = columns.findIndex(c => c.id === currentColumn.id);
        if (colIndex < columns.length - 1) {
            const nextCol = columns[colIndex + 1];
            // 1. STORY CONSTRAINT: Day 3 Rain (Blocks Structural)
            if (day === 3 && task.type === 'Structural' && nextCol.id === 'doing') {
                alert("🌧️ STORM WARNING!\n\nIt is raining heavily! Structural work (Outdoor) is unsafe and impossible right now.\n\n✅ ACTION: Focus on 'Indoor' or 'System' tasks until the weather clears.");
                return;
            }

            // 2. STORY CONSTRAINT: Material Shortage (Day 2 or general)
            if (nextCol.id === 'doing' && materials < task.cost) {
                const isDay2 = day === 2;
                const reason = isDay2 ? "The Concrete Truck 🚚 is delayed!" : "Insufficient resources.";

                alert(`⛔ MATERIAL SHORTAGE!\n\n${reason}\nNeed ${task.cost}, Have ${materials}.\n\n✅ ACTION: You cannot start this task. Pull 'Prep' or 'Management' tasks (0 Cost) instead!`);
                return;
            }

            const success = moveTask(task.id, currentColumn.id, nextCol.id);
            if (!success) {
                // Generic fallback if move failed (e.g. WIP limit) - though WIP usually blocked by UI logic or store
                // If we want to be safe:
                if (nextCol.id !== 'done') {
                    alert("Cannot move task! Check WIP limits or constraints.");
                }
                return;
            }

            // Tutorial Logic: Advance Steps based on moves
            if (tutorialStep === 2 && currentColumn.id === 'backlog' && nextCol.id === 'ready') {
                setTutorialStep(3); // Moved to Ready
            }
            if (tutorialStep === 3 && currentColumn.id === 'ready' && nextCol.id === 'doing') {
                setTutorialStep(4); // Moved to Doing
            }
            if (tutorialStep === 4 && currentColumn.id === 'doing' && nextCol.id === 'done') {
                setTutorialStep(5); // Moved to Done (Finish)
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8"
            onClick={(e) => {
                // Close if clicking outside
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-slate-100 w-full h-full max-w-6xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">

                {/* Header */}
                <div className="bg-white p-4 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center z-10 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800">Project Board</h2>
                        <div className="flex gap-4 mt-2">
                            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-mono font-bold border border-blue-100 text-xs md:text-sm">
                                Funds: ${funds}
                            </div>
                            <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-mono font-bold border border-amber-100 text-xs md:text-sm">
                                Materials: {materials}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-xl font-bold transition-colors w-full md:w-auto"
                    >
                        Close
                    </button>
                </div>
                {/* Columns Grid */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 overflow-x-auto overflow-y-auto">
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
                            <div key={col.id} id={`col-${col.id}`} className={`min-w-full md:min-w-[280px] md:max-w-sm flex flex-col h-auto md:h-full bg-slate-50 rounded-2xl border-2 transition-all ${highlightClass} overflow-hidden shrink-0`}>
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
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono font-bold">
                                                    {/* Type Tag */}
                                                    <span className={`px-1.5 py-0.5 rounded border ${task.type === 'Structural' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                        task.type === 'Management' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                            'bg-sky-100 text-sky-800 border-sky-200'
                                                        }`}>
                                                        {task.type}
                                                    </span>
                                                    <span className="text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">-{task.cost} Mat</span>
                                                    <span className="text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">+${task.reward}</span>
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
