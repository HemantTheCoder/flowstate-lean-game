import { useState, useEffect } from 'react';
import { useGameStore, Task, ConstraintType } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Package, Users, FileCheck, Cloud, ArrowRight, Briefcase, Target, Lock, Calendar, ClipboardCheck, Wrench, HandshakeIcon, Play, BarChart3, Sun, ShieldAlert, Eye, Ban, Save } from 'lucide-react';
import soundManager from '@/lib/soundManager';

const constraintConfig: Record<ConstraintType, { icon: React.ReactNode, label: string, color: string, action: string, cost: string }> = {
    material: { icon: <Package className="w-4 h-4" />, label: 'Material', color: 'red', action: 'Call Supplier', cost: '$200' },
    crew: { icon: <Users className="w-4 h-4" />, label: 'Crew', color: 'orange', action: 'Reassign Crew', cost: '-5% Morale' },
    approval: { icon: <FileCheck className="w-4 h-4" />, label: 'Approval', color: 'purple', action: 'Expedite Approval', cost: '$50' },
    weather: { icon: <Cloud className="w-4 h-4" />, label: 'Weather', color: 'blue', action: 'Wait for Clear', cost: 'Time' }
};

const colorClassMap: Record<string, { bg: string, border: string }> = {
    blue: { bg: 'bg-blue-500/30', border: 'border-blue-400/50' },
    orange: { bg: 'bg-orange-500/30', border: 'border-orange-400/50' },
    purple: { bg: 'bg-purple-500/30', border: 'border-purple-400/50' },
    green: { bg: 'bg-green-500/30', border: 'border-green-400/50' },
    slate: { bg: 'bg-slate-500/30', border: 'border-slate-400/50' },
    amber: { bg: 'bg-amber-500/30', border: 'border-amber-400/50' }
};

const DAY_OBJECTIVES: Record<number, { icon: React.ReactNode, title: string, objective: string, action: string, color: string }> = {
    6: {
        icon: <Calendar className="w-5 h-5" />,
        title: "The Planning Room",
        objective: "Learn the Last Planner System layout",
        action: "Pull 4-6 tasks from Master Schedule to Lookahead Window",
        color: "blue"
    },
    7: {
        icon: <Eye className="w-5 h-5" />,
        title: "Constraint Discovery",
        objective: "Identify all blockers on your tasks",
        action: "Click each RED task to inspect its constraints. You cannot fix them yet!",
        color: "orange"
    },
    8: {
        icon: <Wrench className="w-5 h-5" />,
        title: "Making Work Ready",
        objective: "Remove constraints to make tasks Sound",
        action: "Click 'Fix' on constraints. New complications may appear!",
        color: "purple"
    },
    9: {
        icon: <HandshakeIcon className="w-5 h-5" />,
        title: "The Weekly Promise",
        objective: "Commit only what you CAN deliver",
        action: "Fix remaining constraints, then click 'Start Week' to commit GREEN tasks",
        color: "green"
    },
    10: {
        icon: <Play className="w-5 h-5" />,
        title: "Execution Day",
        objective: "Deliver on your promises",
        action: "Complete the tasks you committed to in the Weekly Plan",
        color: "blue"
    },
    11: {
        icon: <BarChart3 className="w-5 h-5" />,
        title: "PPC Review",
        objective: "Measure your reliability",
        action: "Review your Percent Plan Complete - did you keep your promises?",
        color: "slate"
    }
};

interface PlanningRoomProps {
    onSave: () => void;
}

export const PlanningRoom: React.FC<PlanningRoomProps> = ({ onSave }) => {
    const {
        columns, weeklyPlan, phase, removeConstraint, commitPlan, moveTask,
        week, tutorialActive, tutorialStep, setTutorialStep, flags, setFlag,
        funds, lpi, chapter, day, currentDialogue, advanceDay
    } = useGameStore();

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialIndex, setTutorialIndex] = useState(0);
    const [showEventBanner, setShowEventBanner] = useState(false);
    const [eventMessage, setEventMessage] = useState('');

    const backlog = columns.find(c => c.id === 'backlog')?.tasks || [];
    const ready = columns.find(c => c.id === 'ready')?.tasks || [];
    const lookaheadTasks = ready;
    const masterPlanTasks = backlog;

    const selectedTask = [...backlog, ...ready].find(t => t.id === selectedTaskId);
    const readyTasksCount = lookaheadTasks.filter(t => (t.constraints?.length || 0) === 0).length;
    const constrainedCount = lookaheadTasks.filter(t => (t.constraints?.length || 0) > 0).length;

    const dayObjective = DAY_OBJECTIVES[day] || DAY_OBJECTIVES[6];

    const canPullTasks = day >= 6;
    const canInspectConstraints = day >= 7;
    const canFixConstraints = day >= 8;
    const canCommit = day >= 9;

    const constraintsDiscovered = flags['constraints_discovered'] || false;

    useEffect(() => {
        if (phase === 'planning' && chapter === 2 && !flags['planning_tutorial_seen'] && !currentDialogue && day === 6 && flags[`day_6_started`]) {
            const timer = setTimeout(() => setShowTutorial(true), 500);
            return () => clearTimeout(timer);
        }
    }, [phase, chapter, flags, currentDialogue, day]);

    useEffect(() => {
        if (day === 8 && !flags['day_8_event_applied'] && flags['day_8_started']) {
            const timer = setTimeout(() => {
                useGameStore.getState().applyDayEvent(8);
                setFlag('day_8_event_applied', true);
                setEventMessage('Complications discovered! Weather warnings and crew scheduling conflicts have added NEW constraints to some of your tasks. You\'ll need to fix these before committing.');
                setShowEventBanner(true);
                setTimeout(() => setShowEventBanner(false), 8000);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [day, flags, setFlag]);

    useEffect(() => {
        if (day === 7 && lookaheadTasks.length > 0 && constrainedCount > 0 && !flags['constraints_discovered']) {
            if (selectedTaskId) {
                const task = lookaheadTasks.find(t => t.id === selectedTaskId);
                if (task && (task.constraints?.length || 0) > 0) {
                    const inspectedKey = `inspected_${selectedTaskId}`;
                    if (!flags[inspectedKey]) {
                        setFlag(inspectedKey, true);
                    }
                    const allInspected = lookaheadTasks
                        .filter(t => (t.constraints?.length || 0) > 0)
                        .every(t => flags[`inspected_${t.id}`] || t.id === selectedTaskId);
                    if (allInspected) {
                        setFlag('constraints_discovered', true);
                    }
                }
            }
        }
    }, [selectedTaskId, day, flags, setFlag, lookaheadTasks, constrainedCount]);

    const tutorialSteps = [
        { title: "Master Schedule", content: "This is your Master Schedule - tasks that SHOULD happen this week. Click a task to pull it into the Lookahead.", highlight: "master" },
        { title: "Lookahead Window", content: "Tasks you're evaluating for readiness. RED tasks have constraints that block execution.", highlight: "lookahead" },
        { title: "Task Inspector", content: "Select a task to see its details. On Day 7 you'll discover constraints, and on Day 8 you can remove them.", highlight: "inspector" },
        { title: "Weekly Work Plan", content: "GREEN tasks (no constraints) appear here. On Day 9, you'll commit these as your PROMISES for the week.", highlight: "weekly" },
        { title: "Day-by-Day Workflow", content: "Each day has a specific focus: Day 6 = Pull, Day 7 = Discover, Day 8 = Fix, Day 9 = Commit. Learn LPS step by step!", highlight: "commit" }
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
        if (!canPullTasks) return;
        if (ready.length >= 8) return;
        moveTask(taskId, 'backlog', 'ready');
        soundManager.playSFX('drop', 0.5);
    };

    const moveToBacklog = (taskId: string) => {
        moveTask(taskId, 'ready', 'backlog');
        soundManager.playSFX('drag', 0.4);
        if (selectedTaskId === taskId) {
            setSelectedTaskId(null);
        }
    };

    const [showForceWarning, setShowForceWarning] = useState(false);
    const [forceCommitIds, setForceCommitIds] = useState<string[]>([]);

    const riskyTasks = lookaheadTasks.filter(t => (t.constraints?.length || 0) === 1);
    const riskyCount = riskyTasks.length;

    const handleCommitPlan = () => {
        if (!canCommit) return;
        const greenTasks = lookaheadTasks.filter(t => (t.constraints?.length || 0) === 0);
        if (greenTasks.length === 0 && riskyCount === 0) return;

        if (riskyCount > 0 && forceCommitIds.length === 0) {
            setShowForceWarning(true);
            soundManager.playSFX('warning', 0.6);
            return;
        }

        const allCommitIds = [...greenTasks.map(t => t.id), ...forceCommitIds];
        commitPlan(allCommitIds);
        soundManager.playSFX('success', 0.7);
    };

    const handleForceCommitConfirm = (includeRisky: boolean) => {
        setShowForceWarning(false);
        const greenTasks = lookaheadTasks.filter(t => (t.constraints?.length || 0) === 0);
        const riskyIds = includeRisky ? riskyTasks.map(t => t.id) : [];
        setForceCommitIds(riskyIds);
        const allCommitIds = [...greenTasks.map(t => t.id), ...riskyIds];
        if (allCommitIds.length === 0) return;
        commitPlan(allCommitIds);
        soundManager.playSFX(includeRisky ? 'alert' : 'success', 0.7);
    };

    const handleSelectTask = (taskId: string) => {
        soundManager.playSFX('card_flip', 0.5);
        setSelectedTaskId(taskId);
    };

    const handleConstraintRemoval = (type: ConstraintType) => {
        if (!selectedTask || !canFixConstraints) return;
        removeConstraint(selectedTask.id, type);
        soundManager.playSFX('constraint', 0.6);
    };

    const getInspectorMessage = () => {
        if (day === 6) return "You can see task details here. Tomorrow, you'll discover what's really blocking these tasks.";
        if (day === 7 && !canFixConstraints) return "Click each RED task to discover its constraints. You can't fix them yet - first understand the problem!";
        if (day === 8) return "Fix constraints by clicking the action buttons below. Each fix has a cost!";
        if (day === 9) return "Last chance to fix constraints before committing. Only GREEN tasks become promises!";
        return "";
    };

    const getEndDayTooltip = () => {
        if (day === 6 && lookaheadTasks.length < 3) return "Pull at least 3 tasks to Lookahead before ending the day";
        if (day === 7 && constrainedCount > 0 && !constraintsDiscovered) return "Click on each constrained task to discover its constraints first";
        if (day === 9 && phase === 'planning') return "You must click 'Start Week' to commit your promises before ending the day";
        return "";
    };

    const canEndDay = () => {
        if (day === 6) return lookaheadTasks.length >= 3;
        if (day === 7) return constraintsDiscovered || constrainedCount === 0;
        if (day === 9) return phase === 'action';
        return true;
    };

    if (phase !== 'planning' || chapter !== 2) return null;

    return (
        <div className="absolute inset-0 z-[50] flex flex-col font-sans text-slate-800 pointer-events-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Event Banner */}
            <AnimatePresence>
                {showEventBanner && (
                    <motion.div
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -80, opacity: 0 }}
                        className="absolute top-0 left-0 right-0 z-[200] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white px-6 py-4 shadow-2xl flex items-center gap-3"
                    >
                        <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                        <div className="flex-1">
                            <span className="font-bold text-sm">NEW EVENT: </span>
                            <span className="text-sm">{eventMessage}</span>
                        </div>
                        <button onClick={() => setShowEventBanner(false)} className="text-white/70 hover:text-white text-xs font-bold" data-testid="button-dismiss-event">Dismiss</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header with Day Objective */}
            <div className="relative z-10 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border-b border-indigo-700 shadow-lg">
                <div className="h-14 flex items-center justify-between px-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white">The Planning Room</h1>
                            <p className="text-xs text-indigo-200">Week {week} - Last Planner System</p>
                        </div>
                    </div>
                    <div className="flex gap-4 text-sm items-center">
                        <div className="flex flex-col items-center px-4 py-1 bg-white/10 backdrop-blur rounded-lg">
                            <span className="text-[10px] uppercase text-indigo-200 font-bold">Budget</span>
                            <span className="text-white font-mono font-bold">${funds}</span>
                        </div>
                        <div className="flex flex-col items-center px-4 py-1 bg-white/10 backdrop-blur rounded-lg">
                            <span className="text-[10px] uppercase text-indigo-200 font-bold">Morale</span>
                            <span className="text-green-300 font-mono font-bold">{lpi.teamMorale}%</span>
                        </div>
                        <div className="relative group">
                            <button
                                onClick={onSave}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-indigo-100 font-bold rounded-lg shadow-lg transition-colors border border-indigo-500"
                                title="Save Game"
                            >
                                <Save className="w-4 h-4" />
                                <span className="hidden sm:inline">Save</span>
                            </button>
                        </div>

                        <div className="relative group">
                            <button
                                onClick={() => {
                                    if (canEndDay()) advanceDay();
                                }}
                                disabled={!canEndDay()}
                                className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg shadow-lg transition-colors ${canEndDay()
                                    ? 'bg-amber-500 hover:bg-amber-400 text-white'
                                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                    }`}
                                data-testid="button-end-planning-day"
                            >
                                <Sun className="w-4 h-4" />
                                End Day
                            </button>
                            {getEndDayTooltip() && !canEndDay() && (
                                <div className="invisible group-hover:visible absolute top-full right-0 mt-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 border border-slate-600">
                                    {getEndDayTooltip()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Day Objective Banner */}
                <div className="h-12 flex items-center px-6 gap-4 bg-black/20">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${colorClassMap[dayObjective.color]?.bg || 'bg-blue-500/30'} ${colorClassMap[dayObjective.color]?.border || 'border-blue-400/50'}`}>
                        <span className="text-white">{dayObjective.icon}</span>
                        <span className="text-white font-bold text-sm">Day {day}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{dayObjective.title}:</span>
                            <span className="text-indigo-200 text-sm">{dayObjective.objective}</span>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur px-4 py-1.5 rounded-lg">
                        <span className="text-xs text-indigo-100 font-medium">Action: </span>
                        <span className="text-xs text-yellow-300 font-bold">{dayObjective.action}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex overflow-hidden">
                {/* LPS Workflow Sidebar */}
                <div className="w-56 bg-gradient-to-b from-indigo-900/95 to-purple-900/95 backdrop-blur text-slate-200 border-r border-indigo-600/50 flex flex-col p-4">
                    <h3 className="text-indigo-300 font-black uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        LPS Workflow
                    </h3>

                    <div className="space-y-3 flex-1">
                        {/* SHOULD Phase */}
                        <div className={`p-3 rounded-xl border transition-all ${day === 6 ? 'bg-blue-600/40 border-blue-400 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/50' : day > 6 ? 'border-green-600/40 bg-green-800/20' : 'border-indigo-600/40 bg-indigo-800/30'}`}>
                            <div className="text-base font-bold mb-1 flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-black ${day === 6 ? 'bg-blue-500 text-white' : day > 6 ? 'bg-green-600 text-white' : 'bg-indigo-700 text-indigo-300'}`}>
                                    {day > 6 ? <CheckCircle className="w-4 h-4" /> : '1'}
                                </span>
                                <span className={day === 6 ? 'text-white' : day > 6 ? 'text-green-300' : 'text-indigo-300'}>SHOULD</span>
                            </div>
                            <p className="text-[11px] leading-snug text-indigo-200/70 ml-8">
                                {day === 6 ? 'Pull tasks now!' : day > 6 ? `${lookaheadTasks.length} tasks pulled` : 'Pull tasks to Lookahead'}
                            </p>
                        </div>

                        {/* CAN Phase */}
                        <div className={`p-3 rounded-xl border transition-all ${day === 7 ? 'bg-orange-600/40 border-orange-400 shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/50' : day === 8 ? 'bg-purple-600/40 border-purple-400 shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/50' : day > 8 ? 'border-green-600/40 bg-green-800/20' : 'border-indigo-600/40 bg-indigo-800/30'}`}>
                            <div className="text-base font-bold mb-1 flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-black ${day === 7 ? 'bg-orange-500 text-white' : day === 8 ? 'bg-purple-500 text-white' : day > 8 ? 'bg-green-600 text-white' : 'bg-indigo-700 text-indigo-300'}`}>
                                    {day > 8 ? <CheckCircle className="w-4 h-4" /> : '2'}
                                </span>
                                <span className={day === 7 || day === 8 ? 'text-white' : day > 8 ? 'text-green-300' : 'text-indigo-300'}>CAN</span>
                            </div>
                            <p className="text-[11px] leading-snug text-indigo-200/70 ml-8">
                                {day === 7 ? 'Discover constraints!' : day === 8 ? 'Fix constraints now!' : day > 8 ? `${readyTasksCount} tasks sound` : 'Check & fix constraints'}
                            </p>
                        </div>

                        {/* WILL Phase */}
                        <div className={`p-3 rounded-xl border transition-all ${day === 9 ? 'bg-green-600/40 border-green-400 shadow-lg shadow-green-500/30 ring-2 ring-green-400/50' : day > 9 ? 'border-green-600/40 bg-green-800/20' : 'border-indigo-600/40 bg-indigo-800/30'}`}>
                            <div className="text-base font-bold mb-1 flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-black ${day === 9 ? 'bg-green-500 text-white' : day > 9 ? 'bg-green-600 text-white' : 'bg-indigo-700 text-indigo-300'}`}>
                                    {day > 9 ? <CheckCircle className="w-4 h-4" /> : '3'}
                                </span>
                                <span className={day === 9 ? 'text-white' : day > 9 ? 'text-green-300' : 'text-indigo-300'}>WILL</span>
                            </div>
                            <p className="text-[11px] leading-snug text-indigo-200/70 ml-8">
                                {day === 9 ? 'Commit your promises!' : day > 9 ? 'Plan committed!' : 'Commit to your promise'}
                            </p>
                        </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="pt-4 border-t border-indigo-600/50 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-indigo-300">In Lookahead:</span>
                            <span className="text-white font-mono font-bold">{lookaheadTasks.length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-red-300">Blocked:</span>
                            <span className="text-red-400 font-mono font-bold">{lookaheadTasks.filter(t => (t.constraints?.length || 0) > 1).length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-amber-300">Risky:</span>
                            <span className="text-amber-400 font-mono font-bold">{riskyCount}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-green-300">Sound:</span>
                            <span className="text-green-400 font-mono font-bold">{readyTasksCount}</span>
                        </div>

                        {/* Day Progress Indicator */}
                        <div className="pt-3 border-t border-indigo-600/30">
                            <div className="text-[10px] text-indigo-300 uppercase font-bold mb-2">Planning Progress</div>
                            <div className="flex gap-1">
                                {[6, 7, 8, 9].map(d => (
                                    <div key={d} className={`flex-1 h-2 rounded-full ${d < day ? 'bg-green-500' : d === day ? 'bg-yellow-400 animate-pulse' : 'bg-indigo-700'}`} />
                                ))}
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[8px] text-indigo-400">Pull</span>
                                <span className="text-[8px] text-indigo-400">Find</span>
                                <span className="text-[8px] text-indigo-400">Fix</span>
                                <span className="text-[8px] text-indigo-400">Commit</span>
                            </div>
                        </div>
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
                                    className={`p-3 bg-white border-l-4 rounded-lg shadow-sm transition-all cursor-pointer group ${day >= 6 ? 'border-slate-300 hover:shadow-md hover:border-blue-400' : 'border-slate-200 opacity-50'
                                        }`}
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
                                        {lookaheadTasks.filter(t => (t.constraints?.length || 0) > 1).length} Blocked
                                    </span>
                                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                                        {riskyCount} Risky
                                    </span>
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                        {readyTasksCount} Sound
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start">
                                <AnimatePresence>
                                    {lookaheadTasks.map(task => {
                                        const constraintCount = task.constraints?.length || 0;
                                        const isBlocked = constraintCount > 1;
                                        const isRisky = constraintCount === 1;
                                        const isSound = constraintCount === 0;
                                        const isSelected = selectedTaskId === task.id;
                                        const isInspected = flags[`inspected_${task.id}`];
                                        return (
                                            <motion.div
                                                key={task.id}
                                                layoutId={task.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => handleSelectTask(task.id)}
                                                className={`p-3 rounded-xl border-l-4 cursor-pointer transition-all shadow-sm hover:shadow-md ${isBlocked ? 'border-red-500 bg-red-50 hover:bg-red-100' :
                                                    isRisky ? 'border-amber-500 bg-amber-50 hover:bg-amber-100' :
                                                        'border-green-500 bg-green-50 hover:bg-green-100'
                                                    } ${isSelected ? 'ring-2 ring-blue-400 scale-[1.02]' : ''}`}
                                                data-testid={`task-lookahead-${task.id}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-sm text-slate-800 leading-tight">{task.title}</span>
                                                    {isBlocked ? (
                                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    ) : isRisky ? (
                                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {day >= 7 ? (
                                                        <>
                                                            {task.constraints?.map(c => (
                                                                <span key={c} className={`px-1.5 py-0.5 bg-${constraintConfig[c].color}-200 text-${constraintConfig[c].color}-800 text-[9px] font-bold rounded uppercase flex items-center gap-1`}>
                                                                    {constraintConfig[c].icon}
                                                                    {constraintConfig[c].label}
                                                                </span>
                                                            ))}
                                                            {isSound && <span className="text-[10px] text-green-600 font-bold">SOUND - Ready to Commit</span>}
                                                            {isRisky && <span className="text-[10px] text-amber-600 font-bold ml-1">RISKY - Can force commit</span>}
                                                        </>
                                                    ) : (
                                                        constraintCount > 0 ? (
                                                            <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                                                                <Ban className="w-3 h-3" />
                                                                {constraintCount} hidden constraint{constraintCount > 1 ? 's' : ''} - discover tomorrow
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-green-600 font-bold">No constraints detected</span>
                                                        )
                                                    )}
                                                </div>
                                                {day === 7 && constraintCount > 0 && isInspected && (
                                                    <div className="mt-1">
                                                        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">INSPECTED</span>
                                                    </div>
                                                )}
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
                        <div className={`h-36 bg-gradient-to-r from-indigo-900/95 to-purple-900/95 backdrop-blur rounded-2xl border-2 ${showTutorial && (tutorialSteps[tutorialIndex].highlight === 'weekly' || tutorialSteps[tutorialIndex].highlight === 'commit') ? 'border-green-500 ring-4 ring-green-500/30' : 'border-indigo-600/50'} p-4 flex flex-col transition-all`}>
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-indigo-300" />
                                        Weekly Work Plan
                                    </h3>
                                    <p className="text-[10px] text-indigo-300">
                                        {canCommit
                                            ? `${readyTasksCount} Sound (GREEN)${riskyCount > 0 ? ` + ${riskyCount} Risky (YELLOW)` : ''} - Click Start Week to commit`
                                            : `Commitment unlocks on Day 9 (currently Day ${day})`
                                        }
                                    </p>
                                </div>
                                <button
                                    onClick={handleCommitPlan}
                                    disabled={!canCommit || (readyTasksCount === 0 && riskyCount === 0)}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 ${canCommit && (readyTasksCount > 0 || riskyCount > 0)
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-green-900/30 ring-2 ring-green-400/50'
                                        : 'bg-indigo-800/50 text-indigo-400 cursor-not-allowed'
                                        }`}
                                    data-testid="button-start-week"
                                >
                                    {!canCommit ? (
                                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Day 9</span>
                                    ) : (
                                        `Start Week (${readyTasksCount + riskyCount} tasks)`
                                    )}
                                </button>
                            </div>
                            <div className="flex-1 flex gap-2">
                                {canCommit ? (
                                    <>
                                        {lookaheadTasks.filter(t => (t.constraints?.length || 0) === 0).slice(0, 8).map((t) => (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                key={t.id}
                                                className="flex-1 bg-green-500/30 border-2 border-green-400 rounded-lg flex items-center justify-center p-2 text-center shadow-lg shadow-green-500/20"
                                            >
                                                <span className="text-[10px] font-bold text-green-100 leading-tight">{t.title}</span>
                                            </motion.div>
                                        ))}
                                        {riskyTasks.slice(0, Math.max(0, 8 - readyTasksCount)).map((t) => (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                key={t.id}
                                                className="flex-1 bg-amber-500/30 border-2 border-amber-400 border-dashed rounded-lg flex items-center justify-center p-2 text-center"
                                            >
                                                <span className="text-[10px] font-bold text-amber-100 leading-tight">{t.title}</span>
                                            </motion.div>
                                        ))}
                                        {Array.from({ length: Math.max(0, 8 - readyTasksCount - riskyCount) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="flex-1 border-2 border-dashed border-indigo-600/50 rounded-lg flex items-center justify-center bg-indigo-800/20">
                                                <span className="text-indigo-500 text-xs">Empty</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-indigo-600/30 rounded-lg">
                                        <div className="text-center">
                                            <Lock className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                                            <p className="text-indigo-400 text-xs">
                                                {day === 6 && "Step 1: Pull tasks to Lookahead first"}
                                                {day === 7 && "Step 2: Discover constraints on your tasks"}
                                                {day === 8 && "Step 3: Fix constraints to make tasks Sound"}
                                            </p>
                                        </div>
                                    </div>
                                )}
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
                                    <p className="text-xs text-slate-400">
                                        {day < 7 ? 'Task Details' : day < 8 ? 'Discover Constraints' : 'Fix Constraints'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto">
                            {/* Day-specific guidance message */}
                            {getInspectorMessage() && (
                                <div className={`mb-4 p-3 rounded-lg text-xs font-medium ${day === 7 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                    day === 8 ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                        day === 9 ? 'bg-green-50 text-green-700 border border-green-200' :
                                            'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}>
                                    {getInspectorMessage()}
                                </div>
                            )}

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

                                    {selectedTask.leanTip && (
                                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                            <span className="text-[10px] text-indigo-500 uppercase font-bold block mb-1">Lean Insight</span>
                                            <p className="text-xs text-indigo-700">{selectedTask.leanTip}</p>
                                        </div>
                                    )}

                                    <div className="border-t border-slate-200 pt-4">
                                        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            Constraints
                                            {(selectedTask.constraints?.length || 0) === 0 && (
                                                <span className="text-green-500 text-xs flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> CLEAR
                                                </span>
                                            )}
                                        </h4>

                                        {day < 7 ? (
                                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                                                <Eye className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-slate-500 text-sm font-medium">Constraints Hidden</p>
                                                <p className="text-slate-400 text-xs mt-1">Come back tomorrow to discover what's blocking your tasks</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedTask.constraints?.map(c => {
                                                    const config = constraintConfig[c];
                                                    return (
                                                        <button
                                                            key={c}
                                                            onClick={() => canFixConstraints ? handleConstraintRemoval(c) : null}
                                                            disabled={!canFixConstraints}
                                                            className={`w-full p-3 rounded-lg text-left flex justify-between items-center group transition-all border ${canFixConstraints
                                                                ? `bg-${config.color}-50 hover:bg-${config.color}-100 border-${config.color}-200 cursor-pointer`
                                                                : 'bg-slate-50 border-slate-200 cursor-not-allowed'
                                                                }`}
                                                            data-testid={`button-fix-${c}`}
                                                        >
                                                            <span className={`font-bold text-sm flex items-center gap-2 ${canFixConstraints ? `text-${config.color}-700` : 'text-slate-500'}`}>
                                                                {config.icon}
                                                                {config.label}
                                                            </span>
                                                            <span className={`text-[10px] px-2 py-1 rounded font-bold ${canFixConstraints
                                                                ? `bg-${config.color}-200 group-hover:bg-${config.color}-300 text-${config.color}-800`
                                                                : 'bg-slate-200 text-slate-500'
                                                                }`}>
                                                                {canFixConstraints ? `${config.action} (${config.cost})` : 'Fix on Day 8'}
                                                            </span>
                                                        </button>
                                                    );
                                                })}

                                                {(selectedTask.constraints?.length || 0) === 0 && (
                                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                                        <p className="text-green-700 font-bold text-sm">Task is Sound!</p>
                                                        <p className="text-green-600 text-xs mt-1">
                                                            {canCommit ? 'Will be included in Weekly Work Plan' : 'Ready for commitment on Day 9'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {ready.some(t => t.id === selectedTask.id) && (
                                        <button
                                            onClick={() => moveToBacklog(selectedTask.id)}
                                            className="w-full text-center text-xs text-slate-400 hover:text-red-500 transition-colors py-2"
                                            data-testid="button-return-to-master"
                                        >
                                            Return to Master Schedule
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                                    <FileCheck className="w-12 h-12 mb-3 text-slate-300" />
                                    <p className="text-sm">
                                        {day === 6 && "Pull tasks from the Master Schedule first, then select one to inspect."}
                                        {day === 7 && "Select a RED task from Lookahead to discover its constraints."}
                                        {day === 8 && "Select a constrained task to fix its blockers."}
                                        {day === 9 && "Review your tasks. Fix any remaining constraints before committing."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Force Commit Warning */}
            <AnimatePresence>
                {showForceWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[150] bg-black/70 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg mx-4"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Risky Tasks Detected</h3>
                                    <p className="text-sm text-slate-500">You have {riskyCount} task{riskyCount > 1 ? 's' : ''} with unresolved constraints</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                <p className="text-sm text-amber-800 leading-relaxed">
                                    <strong>YELLOW tasks</strong> have 1 remaining constraint. You CAN force-commit them, but they become <strong>FRAGILE</strong> -
                                    there's a <strong>30% chance they'll fail</strong> during execution and hurt your PPC.
                                </p>
                                <p className="text-xs text-amber-600 mt-2 italic">
                                    "A smaller plan that's 100% complete is better than a big plan that's 40% complete." - Lean Principle
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleForceCommitConfirm(true)}
                                    className="w-full p-3 rounded-xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-left transition-colors"
                                    data-testid="button-force-commit-risky"
                                >
                                    <span className="font-bold text-amber-800 text-sm">Include Risky Tasks (Overcommit)</span>
                                    <p className="text-xs text-amber-600 mt-1">Commit {readyTasksCount + riskyCount} tasks total. {riskyCount} may fail. Higher risk, higher reward.</p>
                                </button>
                                <button
                                    onClick={() => handleForceCommitConfirm(false)}
                                    className="w-full p-3 rounded-xl border-2 border-green-300 bg-green-50 hover:bg-green-100 text-left transition-colors"
                                    data-testid="button-commit-safe"
                                >
                                    <span className="font-bold text-green-800 text-sm">Only Sound Tasks (Safe)</span>
                                    <p className="text-xs text-green-600 mt-1">Commit {readyTasksCount} reliable tasks. Safer PPC. More reliable promises.</p>
                                </button>
                                <button
                                    onClick={() => setShowForceWarning(false)}
                                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-2"
                                    data-testid="button-cancel-commit"
                                >
                                    Go back and fix more constraints
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
