import React, { useState } from 'react';
import { useGameStore, Task, ConstraintType } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export const PlanningRoom: React.FC = () => {
    const {
        columns, weeklyPlan, addLog, phase, removeConstraint, commitPlan, moveTask,
        week, tutorialActive, tutorialStep, setTutorialStep, flags, setFlag,
        funds, lpi // Added missing destructuring
    } = useGameStore();

    // Local State
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Derived State
    const backlog = columns.find(c => c.id === 'backlog')?.tasks || []; // Master Plan
    const ready = columns.find(c => c.id === 'ready')?.tasks || [];     // Lookahead candidates

    // Alias 'ready' to 'lookaheadTasks' for clarity in the UI logic as per new design
    const lookaheadTasks = ready;
    const masterPlanTasks = backlog;

    const selectedTask = [...backlog, ...ready].find(t => t.id === selectedTaskId);

    // Trigger Tutorial on First Visit
    React.useEffect(() => {
        if (phase === 'planning' && !flags['tutorial_planning_seen'] && tutorialActive) {
            setFlag('tutorial_planning_seen', true);
            setTutorialStep(10); // Start Planning Tutorial
        }
    }, [phase, flags, tutorialActive, setFlag, setTutorialStep]);
    // ... (rest of component)

    // ... inside return ...
    // <h1 ...> ... Week {week} Lookahead ... </h1>
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
        if (selectedTaskId === taskId) {
            setSelectedTaskId(null); // Deselect if moved out
        }
    };

    // Commit Logic
    const handleCommitPlan = () => {
        const committedTasks = lookaheadTasks.filter(t => !t.constraints?.length);

        if (committedTasks.length === 0) {
            alert("Your plan is empty! Prepare at least one task.");
            return;
        }

        if (confirm(`Commit ${committedTasks.length} tasks to the Weekly Plan? This cannot be changed!`)) {
            commitPlan(committedTasks.map(t => t.id));
        }
    };

    // Task Inspector Handlers
    const handleSelectTask = (taskId: string) => {
        setSelectedTaskId(taskId);
    };

    const handleConstraintRemoval = (type: string) => {
        if (!selectedTask) return;
        const constraintType = type as ConstraintType;

        // Example logic for removing constraints (this would interact with gameStore)
        // For now, just simulate removal
        let cost = 0;
        let moraleImpact = 0;

        switch (constraintType) {
            case 'material':
                cost = 200;
                if (funds < cost) {
                    alert("Not enough funds to resolve material constraint!");
                    return;
                }
                // Deduct funds, remove constraint
                // useGameStore.getState().deductFunds(cost);
                break;
            case 'crew':
                moraleImpact = 5;
                // Reduce morale, remove constraint
                // useGameStore.getState().reduceMorale(moraleImpact);
                break;
            case 'approval':
                cost = 50;
                if (funds < cost) {
                    alert("Not enough funds to expedite approval!");
                    return;
                }
                // Deduct funds, remove constraint
                // useGameStore.getState().deductFunds(cost);
                break;
            default:
                break;
        }

        removeConstraint(selectedTask.id, constraintType);
        // Re-select task to refresh UI if needed
        setSelectedTaskId(selectedTask.id);
    };

    if (phase !== 'planning' || useGameStore.getState().chapter === 1) return null;

    return (
        <div
            className="absolute inset-0 z-[50] flex flex-col font-sans text-slate-800 pointer-events-auto bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/bg_meeting_room.png')" }}
        >
            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

            {/* Header */}
            <div className="relative z-10 h-16 bg-white/90 border-b border-slate-200 flex items-center justify-between px-6 shadow-md backdrop-blur-md">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    🗓️ The Planning Room <span className="text-sm text-slate-500 font-normal uppercase tracking-wider border-l border-slate-300 pl-3">Week {week} Strategy</span>
                </h1>
                <div className="flex gap-6 text-sm font-bold text-slate-600">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase text-slate-400">Budget</span>
                        <span className="text-blue-600 font-mono">${funds}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase text-slate-400">Morale</span>
                        <span className="text-green-600 font-mono">{lpi.teamMorale}%</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="relative z-10 flex-1 flex overflow-hidden">

                {/* PERSISTENT GUIDE SIDEBAR */}
                <div className="w-64 bg-slate-800 text-slate-200 border-r border-slate-700 flex flex-col p-4 shadow-2xl z-20">
                    <h3 className="text-blue-400 font-black uppercase tracking-wider text-xs mb-4">LPS Workflow</h3>

                    <div className="space-y-6">
                        <div className={`p-3 rounded-xl border ${lookaheadTasks.length === 0 ? 'bg-blue-900/50 border-blue-500' : 'border-slate-700 opacity-50'}`}>
                            <div className="text-xl font-bold mb-1">1. SHOULD</div>
                            <p className="text-xs leading-snug text-slate-400">Review <b>Master Schedule</b>. Identify tasks that <i>should</i> happen this week.</p>
                            <div className="mt-2 text-[10px] bg-slate-700 px-2 py-1 rounded inline-block">Ref: Master Plan</div>
                        </div>

                        <div className={`p-3 rounded-xl border ${lookaheadTasks.length > 0 ? 'bg-blue-900/50 border-blue-500' : 'border-slate-700 opacity-50'}`}>
                            <div className="text-xl font-bold mb-1">2. CAN</div>
                            <p className="text-xs leading-snug text-slate-400">Check for blockage (red icons). Remove constraints (pay/fix) so tasks become <b>Sound</b>.</p>
                            <div className="mt-2 text-[10px] bg-red-900/50 text-red-200 px-2 py-1 rounded inline-block">Action: Fix Constraints</div>
                        </div>

                        <div className={`p-3 rounded-xl border ${lookaheadTasks.length > 0 && lookaheadTasks.some(t => (t.constraints?.length || 0) === 0) ? 'bg-green-900/50 border-green-500 text-white' : 'border-slate-700 opacity-50'}`}>
                            <div className="text-xl font-bold mb-1">3. WILL</div>
                            <p className="text-xs leading-snug text-slate-300"><b>Commit</b> only safe tasks. This is your promise to the crew.</p>
                            <div className="mt-2 text-[10px] bg-green-800 text-green-100 px-2 py-1 rounded inline-block">Action: Commit</div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-700">
                        <p className="text-[10px] text-slate-500 italic">"The Last Planner protects the crew from bad plans."</p>
                    </div>
                </div>

                {/* Main 3-Column Grid */}
                <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">

                    {/* LEFT: Master Plan (Read Only) */}
                    <div className="col-span-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-700">📂 Master Schedule</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1 text-center bg-slate-200 py-1 rounded">"What we <span className="font-bold">SHOULD</span> do"</p>
                            <p className="text-[10px] text-slate-400 mt-2">All Project Tasks</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {masterPlanTasks.map(task => (
                                <div key={task.id} className="p-3 bg-slate-100 rounded-lg border border-slate-200 opacity-70 hover:opacity-100 transition-opacity">
                                    <div className="font-bold text-sm text-slate-600">{task.title}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">{task.type} | Cost: {task.cost}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CENTER: Lookahead Board (Interactive) */}
                    <div className="col-span-6 flex flex-col gap-4">
                        <div className="flex-1 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-blue-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-blue-900">🔭 Lookahead Window</h3>
                                    <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-100 py-1 px-2 rounded inline-block">"What we <span className="font-bold">CAN</span> do" (Check Constraints)</p>
                                </div>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{lookaheadTasks.length} Candidates</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start">
                                {lookaheadTasks.map(task => { // ... map content ...
                                    const hasConstraints = (task.constraints?.length || 0) > 0;
                                    const isSelected = selectedTaskId === task.id;
                                    return (
                                        <motion.div
                                            key={task.id}
                                            layoutId={task.id}
                                            onClick={() => handleSelectTask(task.id)}
                                            className={`p-3 rounded-xl border-l-4 cursor-pointer transition-all shadow-sm hover:shadow-md ${hasConstraints ? 'border-red-500 bg-red-50' : 'border-green-500 bg-white'
                                                } ${isSelected ? 'ring-2 ring-blue-400 scale-[1.02]' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-sm text-slate-800 leading-tight">{task.title}</span>
                                                {hasConstraints ? (
                                                    <span className="text-red-500 text-xs font-bold animate-pulse">STOP</span>
                                                ) : (
                                                    <span className="text-green-500 text-xs font-bold">READY</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {task.constraints?.map(c => (
                                                    <span key={c} className="px-1.5 py-0.5 bg-red-200 text-red-800 text-[9px] font-bold rounded uppercase">{c}</span>
                                                ))}
                                                {!hasConstraints && <span className="text-[9px] text-slate-400 italic">No blockers</span>}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {lookaheadTasks.length === 0 && (
                                    <div className="col-span-2 text-center text-slate-400 italic py-10">
                                        No tasks in Lookahead. Pull from Master Plan first.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* WEEKLY COMMITMENT BAR */}
                        <div className="h-32 bg-slate-800/90 backdrop-blur rounded-2xl border-2 border-slate-700 p-4 flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wide">Weekly Work Plan (Promises)</h3>
                                    <p className="text-[10px] text-slate-400">"What we <span className="font-bold text-green-400">WILL</span> do"</p>
                                </div>
                                <button
                                    onClick={handleCommitPlan}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95"
                                >
                                    ▶ RUN WEEK
                                </button>
                            </div>
                            <div className="flex-1 flex gap-3">
                                {/* Visual Slots showing GREEN tasks only */}
                                {lookaheadTasks.filter(t => !t.constraints?.length).map((t, i) => (
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        key={t.id}
                                        className="flex-1 bg-green-100 border-2 border-green-400 rounded-lg flex items-center justify-center p-2 text-center"
                                    >
                                        <span className="text-[10px] font-bold text-green-900 leading-tight">{t.title}</span>
                                    </motion.div>
                                ))}
                                {/* Empty Slots filler */}
                                {Array.from({ length: Math.max(0, 5 - lookaheadTasks.filter(t => !t.constraints?.length).length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="flex-1 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center">
                                        <span className="text-slate-600 text-xs font-bold">SLOT {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Task Inspector */}
                    <div className="col-span-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-700">🔎 Inspector</h3>
                            <p className="text-xs text-slate-400">Task Details & Constraints</p>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto">
                            {selectedTask ? (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 leading-tight">{selectedTask.title}</h2>
                                        <p className="text-xs text-slate-500 mt-1">{selectedTask.description}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Cost</span>
                                            <span className="font-mono font-bold text-slate-700">${selectedTask.cost}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Revenue</span>
                                            <span className="font-mono font-bold text-green-600">+${selectedTask.reward}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Type</span>
                                            <span className="font-bold text-blue-600">{selectedTask.type}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-200 pt-4">
                                        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            Constraints
                                            {(selectedTask.constraints?.length || 0) === 0 && <span className="text-green-500 text-xs">✅ CLEAR</span>}
                                        </h4>

                                        <div className="space-y-2">
                                            {/* Material Constraint */}
                                            {selectedTask.constraints?.includes('material') && (
                                                <button
                                                    onClick={() => handleConstraintRemoval('material')}
                                                    className="w-full bg-red-50 hover:bg-red-100 border border-red-200 p-2 rounded-lg text-left flex justify-between items-center group transition-colors"
                                                >
                                                    <span className="text-red-700 font-bold text-sm">🧱 Material</span>
                                                    <span className="bg-red-200 group-hover:bg-red-300 text-red-800 text-[10px] px-2 py-1 rounded font-bold">PAY $200</span>
                                                </button>
                                            )}
                                            {/* Crew Constraint */}
                                            {selectedTask.constraints?.includes('crew') && (
                                                <button
                                                    onClick={() => handleConstraintRemoval('crew')}
                                                    className="w-full bg-orange-50 hover:bg-orange-100 border border-orange-200 p-2 rounded-lg text-left flex justify-between items-center group transition-colors"
                                                >
                                                    <span className="text-orange-700 font-bold text-sm">👷 Crew</span>
                                                    <span className="bg-orange-200 group-hover:bg-orange-300 text-orange-800 text-[10px] px-2 py-1 rounded font-bold">-5% MORALE</span>
                                                </button>
                                            )}
                                            {/* Approval Constraint */}
                                            {selectedTask.constraints?.includes('approval') && (
                                                <button
                                                    onClick={() => handleConstraintRemoval('approval')}
                                                    className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 p-2 rounded-lg text-left flex justify-between items-center group transition-colors"
                                                >
                                                    <span className="text-purple-700 font-bold text-sm">📝 Approval</span>
                                                    <span className="bg-purple-200 group-hover:bg-purple-300 text-purple-800 text-[10px] px-2 py-1 rounded font-bold">EXPEDITE ($50)</span>
                                                </button>
                                            )}

                                            {(selectedTask.constraints?.length || 0) === 0 && (
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                                    <p className="text-green-700 font-bold text-sm">Task is Ready!</p>
                                                    <p className="text-green-600 text-xs mt-1">Added to Weekly Plan</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                                    <span className="text-4xl mb-2">👈</span>
                                    <p>Select a task from Lookahead<br />to inspect constraints.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
