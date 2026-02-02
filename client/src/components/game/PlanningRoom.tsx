import React, { useState } from 'react';
import { useGameStore, Task } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export const PlanningRoom: React.FC = () => {
    const { columns, weeklyPlan, addLog, phase, removeConstraint, commitPlan, moveTask } = useGameStore();

    // Local state for the planning session before commit
    const backlog = columns.find(c => c.id === 'backlog')?.tasks || [];
    const ready = columns.find(c => c.id === 'ready')?.tasks || [];

    // Helper to move task to Ready (simulating drag and drop for now)
    const moveToReady = (taskId: string) => {
        if (ready.length >= 5) {
            alert("Capacity Limit Reached! Only 5 tasks allowed in Lookahead.");
            return;
        }
        moveTask(taskId, 'backlog', 'ready');
    };

    const moveToBacklog = (taskId: string) => {
        moveTask(taskId, 'ready', 'backlog');
    };

    const handleCommit = () => {
        if (ready.length === 0) {
            alert("You must commit to at least one task!");
            return;
        }

        // Check for Red Constraints
        const riskyTasks = ready.filter(t => (t.constraints?.length || 0) > 0 || t.cost > useGameStore.getState().materials);

        if (riskyTasks.length > 0) {
            if (!confirm(`⚠️ WARNING: ${riskyTasks.length} tasks have unresolved constraints (RED). They are likely to fail. Commit anyway?`)) {
                return;
            }
        }

        const taskIds = ready.map(t => t.id);
        commitPlan(taskIds);
        addLog("Weekly Plan Committed! 📝");
    };

    // Constraints Visualizer Helper
    const ConstraintIcon = ({ type }: { type: string }) => {
        const icons: Record<string, string> = {
            material: '🧱',
            crew: '👷',
            approval: '📝',
            weather: '☔'
        };
        return <span className="text-xl" title={`Blocked by ${type}`}>{icons[type]}</span>;
    };

    if (phase !== 'planning') return null;

    return (
        <div className="absolute inset-0 z-[50] bg-slate-900 flex flex-col font-sans text-slate-100">
            {/* Header */}
            <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shadow-md">
                <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                    🗓️ The Planning Room <span className="text-sm text-slate-500 font-normal uppercase tracking-wider">| Week {useGameStore(s => s.week)} Lookahead</span>
                </h1>
                <div className="flex gap-4">
                    <button className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm font-bold border border-slate-600">
                        Rules ❓
                    </button>
                </div>
            </div>

            {/* Main Content: 3 Columns (Master Plan -> Lookahead Window -> Commitment) */}
            <div className="flex-1 flex p-6 gap-6 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')]">

                {/* COL 1: MASTER SCHEDULE (Should Do) */}
                <div className="w-1/3 bg-slate-800/90 rounded-2xl flex flex-col border border-slate-700 shadow-xl backdrop-blur">
                    <div className="p-4 bg-slate-700/50 rounded-t-2xl border-b border-slate-600">
                        <h2 className="font-bold text-slate-300 uppercase tracking-widest text-sm">Master Schedule (Should Do)</h2>
                        <p className="text-xs text-slate-500">All remaining work.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {backlog.map(task => (
                            <div key={task.id} className="p-3 bg-slate-700 rounded border border-slate-600 hover:border-blue-500 cursor-pointer flex justify-between items-center group">
                                <div>
                                    <div className="font-bold text-slate-200">{task.title}</div>
                                    <div className="text-xs text-slate-400">{task.type} | Cost: {task.cost}</div>
                                </div>
                                <button
                                    onClick={() => moveToReady(task.id)}
                                    className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-blue-600 rounded text-xs font-bold transition-all hover:scale-105">
                                    Move ➡️
                                </button>
                            </div>
                        ))}
                        {backlog.length === 0 && <div className="text-center text-slate-500 italic mt-10">No tasks in backlog.</div>}
                    </div>
                </div>

                {/* COL 2: LOOKAHEAD (Can Do?) - This is the "Ready" column context */}
                <div className="w-1/3 bg-slate-800/90 rounded-2xl flex flex-col border-2 border-blue-500/30 shadow-2xl backdrop-blur relative overflow-hidden">
                    <div className="p-4 bg-blue-900/20 rounded-t-2xl border-b border-blue-500/30 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-blue-300 uppercase tracking-widest text-sm">Lookahead Window</h2>
                            <p className="text-xs text-blue-400">Next 2-3 Weeks. Identify Constraints.</p>
                        </div>
                        <div className="text-xs font-mono bg-blue-900/50 px-2 py-1 rounded text-blue-300 border border-blue-500/30">
                            Limit: 5
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-blue-500/5">
                        {ready.map(task => (
                            <div key={task.id} className="p-3 bg-slate-700 rounded border-l-4 border-l-green-500 border-slate-600 flex justify-between items-start group relative">
                                <button
                                    onClick={() => moveToBacklog(task.id)}
                                    className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    ⬅️ Remove
                                </button>
                                <div>
                                    <div className="font-bold text-slate-200">{task.title}</div>

                                    {/* Constraints Visualization */}
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {/* Material Check */}
                                        {task.cost > useGameStore.getState().materials && (
                                            <div className="flex items-center gap-1 text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded border border-red-500/30">
                                                🧱 Low Material ({task.cost})
                                            </div>
                                        )}

                                        {/* Explicit Constraints */}
                                        {task.constraints?.map(c => (
                                            <div key={c} className="flex items-center gap-1 text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded border border-red-500/30">
                                                <ConstraintIcon type={c} /> {c}
                                                <button
                                                    onClick={() => removeConstraint(task.id, c)}
                                                    className="ml-1 px-1 bg-red-800 hover:bg-green-600 text-[10px] rounded border border-red-500 text-white">
                                                    Fix
                                                </button>
                                            </div>
                                        ))}

                                        {(!task.constraints?.length && task.cost <= useGameStore.getState().materials) && (
                                            <div className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded border border-green-500/30">
                                                ✅ Sound
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {ready.length === 0 && <div className="text-center text-blue-300/50 italic mt-10">Drag tasks here to plan.</div>}
                    </div>
                </div>

                {/* COL 3: WEEKLY PLAN (Will Do - Commitment) */}
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="bg-green-900/20 rounded-2xl flex-1 border border-green-500/30 p-6 flex flex-col items-center justify-center text-center">
                        <h2 className="text-2xl font-black text-green-400 uppercase italic">The Promise</h2>
                        <p className="text-green-200/60 mb-8 max-w-xs">
                            "I commit to finishing these tasks by Friday. No excuses."
                        </p>

                        <div className="text-6xl mb-4">🤝</div>

                        <button
                            onClick={handleCommit}
                            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/50 transition-all text-xl active:scale-95">
                            Commit Plan
                        </button>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 relative overflow-hidden">
                        <h3 className="font-bold text-slate-400 mb-2 z-10 relative">PPC Forecast (Reliability)</h3>

                        {/* Anime Style Gauge Background */}
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="text-6xl">📊</span>
                        </div>

                        <div className="w-full bg-slate-900 h-6 rounded-full overflow-hidden border border-slate-600 relative">
                            {/* Gradient Bar */}
                            <div className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 h-full w-[0%] transition-all duration-1000 ease-out relative" style={{ width: '0%' }}>
                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/50 animate-pulse"></div>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs mt-2 font-mono font-bold">
                            <span className="text-slate-500">Current: 0%</span>
                            <span className="text-green-400">Target: 80%+</span>
                        </div>
                    </div>

                    {/* Commitment Warning */}
                    {ready.some(t => t.constraints?.length || t.cost > useGameStore.getState().materials) && (
                        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                            <div className="text-2xl">💔</div>
                            <div>
                                <div className="text-red-400 text-xs font-bold uppercase">Broken Promise Risk</div>
                                <div className="text-red-300 text-[10px]">Unresolved constraints will lower PPC!</div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
