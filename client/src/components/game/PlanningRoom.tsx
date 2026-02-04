import { useState, useEffect } from 'react';
import { useGameStore, Task, ConstraintType } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Package, Users, FileCheck, Cloud, ArrowRight, Briefcase, Target, Lock } from 'lucide-react';

const constraintConfig: Record<ConstraintType, { icon: React.ReactNode, label: string, color: string, action: string, cost: string }> = {
    material: { icon: <Package className="w-4 h-4" />, label: 'Material', color: 'red', action: 'Call Supplier', cost: '$200' },
    crew: { icon: <Users className="w-4 h-4" />, label: 'Crew', color: 'orange', action: 'Reassign Crew', cost: '-5% Morale' },
    approval: { icon: <FileCheck className="w-4 h-4" />, label: 'Approval', color: 'purple', action: 'Expedite Approval', cost: '$50' },
    weather: { icon: <Cloud className="w-4 h-4" />, label: 'Weather', color: 'blue', action: 'Wait for Clear', cost: 'Time' }
};

export const PlanningRoom: React.FC = () => {
    const {
        columns, weeklyPlan, phase, removeConstraint, commitPlan, moveTask,
        week, tutorialActive, tutorialStep, setTutorialStep, flags, setFlag,
        funds, lpi, chapter
    } = useGameStore();

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialIndex, setTutorialIndex] = useState(0);

    const backlog = columns.find(c => c.id === 'backlog')?.tasks || [];
    const ready = columns.find(c => c.id === 'ready')?.tasks || [];
    const lookaheadTasks = ready;
    const masterPlanTasks = backlog;

    const selectedTask = [...backlog, ...ready].find(t => t.id === selectedTaskId);
    const readyTasksCount = lookaheadTasks.filter(t => (t.constraints?.length || 0) === 0).length;

    useEffect(() => {
        if (phase === 'planning' && chapter === 2 && !flags['planning_tutorial_seen']) {
            setShowTutorial(true);
        }
    }, [phase, chapter, flags]);

    const tutorialSteps = [
        { title: "Master Schedule", content: "This is your Master Schedule - tasks that SHOULD happen this week. Click a task to pull it into the Lookahead.", highlight: "master" },
        { title: "Lookahead Window", content: "Tasks you're evaluating for readiness. RED tasks have constraints that block execution.", highlight: "lookahead" },
        { title: "Task Inspector", content: "Select a task to see its details and remove constraints. Each fix has a cost.", highlight: "inspector" },
        { title: "Weekly Work Plan", content: "GREEN tasks (no constraints) appear here. These are your PROMISES for the week.", highlight: "weekly" },
        { title: "Make Your Commitment", content: "Click 'Start Week' when ready. Only commit what you CAN deliver!", highlight: "commit" }
    ];

    const handleTutorialNext = () => {
        if (tutorialIndex < tutorialSteps.length - 1) {
            setTutorialIndex(tutorialIndex + 1);
        } else {
            setShowTutorial(false);
            setFlag('planning_tutorial_seen', true);
        }
    };

    const moveToReady = (taskId: string) => {
        if (ready.length >= 5) {
            return;
        }
        moveTask(taskId, 'backlog', 'ready');
    };

    const moveToBacklog = (taskId: string) => {
        moveTask(taskId, 'ready', 'backlog');
        if (selectedTaskId === taskId) {
            setSelectedTaskId(null);
        }
    };

    const handleCommitPlan = () => {
        const committedTasks = lookaheadTasks.filter(t => (t.constraints?.length || 0) === 0);

        if (committedTasks.length === 0) {
            return;
        }

        commitPlan(committedTasks.map(t => t.id));
    };

    const handleSelectTask = (taskId: string) => {
        setSelectedTaskId(taskId);
    };

    const handleConstraintRemoval = (type: ConstraintType) => {
        if (!selectedTask) return;
        removeConstraint(selectedTask.id, type);
    };

    if (phase !== 'planning' || chapter !== 2) return null;

    return (
        <div
            className="absolute inset-0 z-[50] flex flex-col font-sans text-slate-800 pointer-events-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        >
            {/* Header */}
            <div className="relative z-10 h-16 bg-white/95 border-b border-slate-200 flex items-center justify-between px-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800">The Planning Room</h1>
                        <p className="text-xs text-slate-500">Week {week} - Last Planner System</p>
                    </div>
                </div>
                <div className="flex gap-6 text-sm">
                    <div className="flex flex-col items-center px-4 py-1 bg-slate-50 rounded-lg">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Budget</span>
                        <span className="text-blue-600 font-mono font-bold">${funds}</span>
                    </div>
                    <div className="flex flex-col items-center px-4 py-1 bg-slate-50 rounded-lg">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Morale</span>
                        <span className="text-green-600 font-mono font-bold">{lpi.teamMorale}%</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex overflow-hidden">
                {/* LPS Workflow Sidebar */}
                <div className="w-56 bg-slate-800/90 backdrop-blur text-slate-200 border-r border-slate-700 flex flex-col p-4">
                    <h3 className="text-blue-400 font-black uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        LPS Workflow
                    </h3>

                    <div className="space-y-4 flex-1">
                        <div className={`p-3 rounded-xl border transition-all ${lookaheadTasks.length === 0 ? 'bg-blue-900/60 border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-700 opacity-60'}`}>
                            <div className="text-lg font-bold mb-1 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm">1</span>
                                SHOULD
                            </div>
                            <p className="text-xs leading-snug text-slate-400">Review Master Schedule. Pull tasks to Lookahead.</p>
                        </div>

                        <div className={`p-3 rounded-xl border transition-all ${lookaheadTasks.length > 0 && readyTasksCount < lookaheadTasks.length ? 'bg-orange-900/60 border-orange-500 shadow-lg shadow-orange-500/20' : 'border-slate-700 opacity-60'}`}>
                            <div className="text-lg font-bold mb-1 flex items-center gap-2">
                                <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-sm">2</span>
                                CAN
                            </div>
                            <p className="text-xs leading-snug text-slate-400">Check constraints. Fix blockers to make tasks Sound.</p>
                        </div>

                        <div className={`p-3 rounded-xl border transition-all ${readyTasksCount > 0 ? 'bg-green-900/60 border-green-500 shadow-lg shadow-green-500/20' : 'border-slate-700 opacity-60'}`}>
                            <div className="text-lg font-bold mb-1 flex items-center gap-2">
                                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">3</span>
                                WILL
                            </div>
                            <p className="text-xs leading-snug text-slate-400">Commit GREEN tasks only. This is your promise!</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                        <p className="text-[10px] text-slate-500 italic leading-relaxed">"The Last Planner protects the crew from bad plans."</p>
                    </div>
                </div>

                {/* Main 3-Column Grid */}
                <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">

                    {/* LEFT: Master Plan */}
                    <div className={`col-span-3 bg-white/95 backdrop-blur rounded-2xl shadow-xl border-2 ${showTutorial && tutorialSteps[tutorialIndex].highlight === 'master' ? 'border-blue-500 ring-4 ring-blue-500/30' : 'border-slate-200'} flex flex-col overflow-hidden transition-all`}>
                        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-4 h-4 text-slate-600" />
                                </div>
                                <h3 className="font-bold text-slate-700">Master Schedule</h3>
                            </div>
                            <p className="text-xs text-slate-500 bg-slate-100 py-1 px-2 rounded text-center mt-2">What we SHOULD do</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {masterPlanTasks.map(task => (
                                <motion.div 
                                    key={task.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-3 bg-white border-l-4 border-slate-300 rounded-lg shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
                                    onClick={() => moveToReady(task.id)}
                                    data-testid={`task-master-${task.id}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-sm text-slate-700 leading-tight">{task.title}</span>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] text-slate-400">{task.type}</span>
                                        {(task.constraints?.length || 0) > 0 && (
                                            <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                                {task.constraints?.length} BLOCK
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {masterPlanTasks.length === 0 && (
                                <div className="text-center text-slate-400 italic py-10 text-sm">
                                    All tasks moved to Lookahead
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CENTER: Lookahead + Weekly Plan */}
                    <div className="col-span-6 flex flex-col gap-4">
                        {/* Lookahead Board */}
                        <div className={`flex-1 bg-white/95 backdrop-blur rounded-2xl shadow-xl border-2 ${showTutorial && tutorialSteps[tutorialIndex].highlight === 'lookahead' ? 'border-orange-500 ring-4 ring-orange-500/30' : 'border-slate-200'} flex flex-col overflow-hidden transition-all`}>
                            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Target className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-blue-900">Lookahead Window</h3>
                                        <p className="text-xs text-blue-600">What we CAN do (Check Constraints)</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                        {lookaheadTasks.filter(t => (t.constraints?.length || 0) > 0).length} Blocked
                                    </span>
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                        {readyTasksCount} Ready
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start">
                                <AnimatePresence>
                                    {lookaheadTasks.map(task => {
                                        const hasConstraints = (task.constraints?.length || 0) > 0;
                                        const isSelected = selectedTaskId === task.id;
                                        return (
                                            <motion.div
                                                key={task.id}
                                                layoutId={task.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => handleSelectTask(task.id)}
                                                className={`p-3 rounded-xl border-l-4 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                                                    hasConstraints ? 'border-red-500 bg-red-50 hover:bg-red-100' : 'border-green-500 bg-green-50 hover:bg-green-100'
                                                } ${isSelected ? 'ring-2 ring-blue-400 scale-[1.02]' : ''}`}
                                                data-testid={`task-lookahead-${task.id}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-sm text-slate-800 leading-tight">{task.title}</span>
                                                    {hasConstraints ? (
                                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {task.constraints?.map(c => (
                                                        <span key={c} className={`px-1.5 py-0.5 bg-${constraintConfig[c].color}-200 text-${constraintConfig[c].color}-800 text-[9px] font-bold rounded uppercase flex items-center gap-1`}>
                                                            {constraintConfig[c].icon}
                                                            {constraintConfig[c].label}
                                                        </span>
                                                    ))}
                                                    {!hasConstraints && <span className="text-[10px] text-green-600 font-bold">SOUND - Ready to Commit</span>}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                {lookaheadTasks.length === 0 && (
                                    <div className="col-span-2 text-center text-slate-400 italic py-10">
                                        <ArrowRight className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        Pull tasks from Master Schedule to begin
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Weekly Commitment Bar */}
                        <div className={`h-36 bg-slate-800/95 backdrop-blur rounded-2xl border-2 ${showTutorial && (tutorialSteps[tutorialIndex].highlight === 'weekly' || tutorialSteps[tutorialIndex].highlight === 'commit') ? 'border-green-500 ring-4 ring-green-500/30' : 'border-slate-700'} p-4 flex flex-col transition-all`}>
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Weekly Work Plan (Your Promises)
                                    </h3>
                                    <p className="text-[10px] text-slate-400">What we WILL do - Only GREEN tasks qualify</p>
                                </div>
                                <button
                                    onClick={handleCommitPlan}
                                    disabled={readyTasksCount === 0}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 ${
                                        readyTasksCount > 0 
                                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-900/30' 
                                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                    }`}
                                    data-testid="button-start-week"
                                >
                                    Start Week ({readyTasksCount} tasks)
                                </button>
                            </div>
                            <div className="flex-1 flex gap-2">
                                {lookaheadTasks.filter(t => (t.constraints?.length || 0) === 0).slice(0, 5).map((t) => (
                                    <motion.div
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1 }}
                                        key={t.id}
                                        className="flex-1 bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center justify-center p-2 text-center"
                                    >
                                        <span className="text-[10px] font-bold text-green-100 leading-tight">{t.title}</span>
                                    </motion.div>
                                ))}
                                {Array.from({ length: Math.max(0, 5 - readyTasksCount) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="flex-1 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center">
                                        <span className="text-slate-600 text-xs">Empty</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Task Inspector */}
                    <div className={`col-span-3 bg-white/95 backdrop-blur rounded-2xl shadow-xl border-2 ${showTutorial && tutorialSteps[tutorialIndex].highlight === 'inspector' ? 'border-purple-500 ring-4 ring-purple-500/30' : 'border-slate-200'} flex flex-col overflow-hidden transition-all`}>
                        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FileCheck className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">Task Inspector</h3>
                                    <p className="text-xs text-slate-400">Details & Constraint Removal</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto">
                            {selectedTask ? (
                                <div className="space-y-5">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 leading-tight">{selectedTask.title}</h2>
                                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{selectedTask.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <span className="text-[10px] text-slate-400 uppercase block">Cost</span>
                                            <span className="font-mono font-bold text-slate-700">${selectedTask.cost}</span>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded-lg">
                                            <span className="text-[10px] text-green-600 uppercase block">Revenue</span>
                                            <span className="font-mono font-bold text-green-700">+${selectedTask.reward}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-200 pt-4">
                                        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            Constraints
                                            {(selectedTask.constraints?.length || 0) === 0 && (
                                                <span className="text-green-500 text-xs flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> CLEAR
                                                </span>
                                            )}
                                        </h4>

                                        <div className="space-y-2">
                                            {selectedTask.constraints?.map(c => {
                                                const config = constraintConfig[c];
                                                return (
                                                    <button
                                                        key={c}
                                                        onClick={() => handleConstraintRemoval(c)}
                                                        className={`w-full bg-${config.color}-50 hover:bg-${config.color}-100 border border-${config.color}-200 p-3 rounded-lg text-left flex justify-between items-center group transition-all`}
                                                        data-testid={`button-fix-${c}`}
                                                    >
                                                        <span className={`text-${config.color}-700 font-bold text-sm flex items-center gap-2`}>
                                                            {config.icon}
                                                            {config.label}
                                                        </span>
                                                        <span className={`bg-${config.color}-200 group-hover:bg-${config.color}-300 text-${config.color}-800 text-[10px] px-2 py-1 rounded font-bold`}>
                                                            {config.action} ({config.cost})
                                                        </span>
                                                    </button>
                                                );
                                            })}

                                            {(selectedTask.constraints?.length || 0) === 0 && (
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                                    <p className="text-green-700 font-bold text-sm">Task is Sound!</p>
                                                    <p className="text-green-600 text-xs mt-1">Added to Weekly Work Plan</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => moveToBacklog(selectedTask.id)}
                                        className="w-full text-center text-xs text-slate-400 hover:text-red-500 transition-colors py-2"
                                    >
                                        Return to Master Schedule
                                    </button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                                    <FileCheck className="w-12 h-12 mb-3 text-slate-300" />
                                    <p className="text-sm">Select a task from Lookahead to inspect constraints and prepare it for commitment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tutorial Overlay */}
            <AnimatePresence>
                {showTutorial && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {tutorialIndex + 1}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">{tutorialSteps[tutorialIndex].title}</h3>
                            </div>
                            <p className="text-slate-600 mb-6 leading-relaxed">{tutorialSteps[tutorialIndex].content}</p>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-1">
                                    {tutorialSteps.map((_, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${i === tutorialIndex ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                    ))}
                                </div>
                                <button
                                    onClick={handleTutorialNext}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                                    data-testid="button-tutorial-next"
                                >
                                    {tutorialIndex < tutorialSteps.length - 1 ? 'Next' : 'Got It!'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
