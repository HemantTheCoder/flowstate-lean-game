import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore, Column, Task, formatCurrency } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import soundManager from '@/lib/soundManager';
import { AlertTriangle, Gauge, Minus, Plus, Cloud, Sparkles, Flame, CloudRain, PackageX, Replace, ChevronLeft, ChevronRight, GripVertical, Package, Info, CheckCircle2, Droplets, Cuboid, Hammer, Zap } from 'lucide-react';
import { TaskIconDisplay } from './TaskIconDisplay';
import { CustomTaskModal } from './CustomTaskModal';
import { LifeHearts } from './LifeHearts';
import { useToast } from '@/hooks/use-toast';

const CongestionCloud: React.FC<{ intensity: number }> = ({ intensity }) => {
    if (intensity <= 0) return null;
    return (
        <div className="absolute -top-4 -right-4 pointer-events-none z-20">
            {Array.from({ length: Math.min(intensity, 3) }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.8, 1.2, 0.8],
                        y: [0, -6, 0],
                    }}
                    transition={{
                        duration: 2.5 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.4,
                    }}
                    className="absolute"
                    style={{ right: i * 12, top: i * 3 }}
                >
                    <Cloud className="w-6 h-6 text-red-400/50 filter blur-[1px]" />
                </motion.div>
            ))}
        </div>
    );
};

const BottleneckPulse: React.FC<{ isBottleneck: boolean }> = ({ isBottleneck }) => {
    if (!isBottleneck) return null;
    return (
        <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none z-10"
            animate={{
                boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0)',
                    '0 0 0 8px rgba(239, 68, 68, 0.15)',
                    '0 0 0 0 rgba(239, 68, 68, 0)',
                ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
        />
    );
};

const WasteTaskOverlay: React.FC<{ isWaste: boolean; isInDone: boolean }> = ({ isWaste, isInDone }) => {
    if (!isWaste) return null;

    if (isInDone) {
        return (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 rounded-2xl"
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            initial={{ opacity: 0, y: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                y: [-5, -25],
                                x: [-12 + i * 12, -18 + i * 18],
                            }}
                            transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, repeatDelay: 2.5 }}
                            style={{ left: `${25 + i * 25}%`, top: '15%' }}
                        >
                            <Sparkles className="w-5 h-5 text-yellow-400/80 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-500/15 to-orange-500/10 rounded-2xl"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
                className="absolute top-2 right-2"
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <Flame className="w-5 h-5 text-orange-500/60 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
            </motion.div>
        </div>
    );
};

const ConstraintBanner: React.FC<{ day: number; materials: number }> = ({ day, materials }) => {
    if (day === 2 && materials <= 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mx-4 md:mx-8 mt-4 mb-2 bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)]"
            >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-inner">
                    <PackageX className="w-7 h-7 text-amber-500" />
                </div>
                <div className="flex-1">
                    <div className="font-black text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        Material Shortage Detected
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] border border-amber-500/30 animate-pulse">Critical</span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium leading-relaxed mt-1">Concrete delivery delayed. Only zero-cost tasks (Management/Prep) can enter Doing. Adapt your workflow!</div>
                </div>
            </motion.div>
        );
    }
    if (day === 3) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mx-4 md:mx-8 mt-4 mb-2 bg-slate-900/60 backdrop-blur-xl border border-blue-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.2)]"
            >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-inner">
                    <CloudRain className="w-7 h-7 text-blue-400" />
                </div>
                <div className="flex-1">
                    <div className="font-black text-sm uppercase tracking-wider text-blue-400 flex items-center gap-2">
                        Monsoon Season Alert
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[10px] border border-blue-500/30 animate-pulse">Safety Sync</span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium leading-relaxed mt-1">Heavy rain blocks all Structural work. Only Interior, Systems, and Management tasks can enter Doing.</div>
                </div>
            </motion.div>
        );
    }
    return null;
};

const ScrollHint: React.FC<{ containerRef: React.RefObject<HTMLDivElement | null> }> = ({ containerRef }) => {
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const check = () => {
            setShowLeft(el.scrollLeft > 15);
            setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
        };
        check();
        el.addEventListener('scroll', check, { passive: true });
        const ro = new ResizeObserver(check);
        ro.observe(el);
        return () => { el.removeEventListener('scroll', check); ro.disconnect(); };
    }, [containerRef]);

    return (
        <>
            <AnimatePresence>
                {showLeft && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950/90 to-transparent z-20 pointer-events-none flex items-center justify-start pl-3 hidden md:flex"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-500/50 animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showRight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950/90 to-transparent z-20 pointer-events-none flex items-center justify-end pr-3 hidden md:flex"
                    >
                        <ChevronRight className="w-6 h-6 text-slate-500/50 animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export const KanbanBoard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { columns, moveTask, funds, materials, tutorialStep, setTutorialStep, day, audioSettings, chapter, currency } = useGameStore();
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [replaceTaskId, setReplaceTaskId] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [wipBlockedColId, setWipBlockedColId] = useState<string | null>(null);
    const [droppedTaskId, setDroppedTaskId] = useState<string | null>(null);
    const { toast } = useToast();

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;
        const sourceCol = columns.find(c => c.id === sourceColId);
        const task = sourceCol?.tasks.find(t => t.id === draggableId);

        if (!task) return;

        if (day === 3 && task.type === 'Structural' && destColId === 'doing' && sourceColId !== 'doing') {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            return;
        }

        if (destColId === 'doing' && sourceColId !== 'doing' && materials < task.cost) {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            return;
        }

        const success = moveTask(draggableId, sourceColId, destColId);
        if (success) {
            setDroppedTaskId(draggableId);
            setTimeout(() => setDroppedTaskId(null), 300);
            if (destColId === 'done') {
                soundManager.playSFX('money', audioSettings.sfxVolume);
                
                // Deterministic Milestone Flavors
                if (task.id === 'task-4') {
                    toast({ title: '👷 Foreman', description: 'Foundation poured! The site is officially taking shape.', duration: 5000 });
                } else if (task.id === 'task-9') {
                    toast({ title: '👷 Site Manager', description: 'Columns are up. Good pace. Keep the flow steady.', duration: 5000 });
                } else if (task.id === 'task-13') {
                    toast({ title: '👔 Client', description: 'Roofing complete! We are dry inside. Excellent work.', duration: 5000 });
                } else if (task.id === 'task-21') {
                    toast({ title: '📋 Inspector', description: 'Finishes look clean. Quality is holding up.', duration: 5000 });
                }
            } else {
                soundManager.playSFX('click', audioSettings.sfxVolume);
            }
            if (tutorialStep === 2 && sourceColId === 'backlog' && destColId === 'doing') setTutorialStep(4);
            if (tutorialStep === 4 && sourceColId === 'doing' && destColId === 'done') setTutorialStep(5);
        } else {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            const destCol = columns.find(c => c.id === destColId);
            if (destCol && destCol.wipLimit > 0 && destCol.tasks.length >= destCol.wipLimit) {
                const wipFlavors = [
                    "Where are you going to put that? Finish your active work first!",
                    "A blocked system creates waste. Clear the active tasks first.",
                    "We don't have the space or hands for this right now. Clear the board!"
                ];
                const flavor = wipFlavors[Math.floor(Math.random() * wipFlavors.length)];
                toast({ title: 'WIP Limit Reached!', description: flavor, variant: 'destructive', duration: 4000 });
                setWipBlockedColId(destColId);
                setTimeout(() => setWipBlockedColId(null), 500);
            }
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="fixed inset-2 sm:inset-4 md:inset-6 lg:inset-8 z-[60] flex items-center justify-center bg-slate-950/75 backdrop-blur-xl border border-white/10 rounded-3xl sm:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] pointer-events-none blueprint-bg hud-corners hud-tint-cyan"
            >
                <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />
                
                <div className="w-full h-full max-w-[1700px] flex flex-col pointer-events-auto relative z-10 mx-auto overflow-hidden">
                    
                    {/* Header Section */}
                    <div className="px-4 py-3 md:px-8 md:py-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-3 bg-gradient-to-b from-slate-950/40 to-transparent">
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md">
                                    {chapter > 1 ? 'Weekly Execution' : 'Project Flux Board'}
                                </h2>
                                <div className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[9px] uppercase font-black tracking-widest text-cyan-400 whitespace-nowrap">
                                    Active Simulation
                                </div>
                            </div>
                            {/* Hidden on short viewports so the board itself gets the vertical space */}
                            <p className="hidden lg:block text-xs font-medium text-slate-400/80 max-w-xl">
                                {chapter > 1 ? 'Execute your committed Weekly Work Plan to ensure smooth site flow and zero downtime.' : 'Drag tasks through the construction flow. Maintain continuous throughput to avoid overhead waste.'}
                            </p>
                        </div>

                        <div className="relative flex flex-wrap items-center gap-2 md:gap-4 metal-panel backdrop-blur-md p-1.5 rounded-xl border border-slate-700/30">
                            <div className="flex -space-x-1 pl-1">
                                <LifeHearts />
                            </div>
                            <div className="h-7 w-px bg-slate-700/50 hidden md:block" />
                            <div className="flex items-center gap-3 px-1">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Funds</span>
                                    <span className="text-sm md:text-base font-black text-cyan-400 font-mono tracking-tight leading-tight">
                                        {formatCurrency(funds, useGameStore.getState().currency)}
                                    </span>
                                </div>
                                <div className="flex flex-col border-l border-slate-700/50 pl-3">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Materials</span>
                                    <span className="text-sm md:text-base font-black text-amber-500 font-mono tracking-tight leading-tight">
                                        {materials.toLocaleString()} <span className="text-[9px] text-slate-600">UNITS</span>
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 min-h-[40px] rounded-lg font-black text-[11px] uppercase tracking-widest transition-all bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 shadow-lg active:scale-95 shadow-black/20 whitespace-nowrap"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <ConstraintBanner day={day} materials={materials} />

                    {/* Board Content */}
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex-1 relative min-h-0 px-3 md:px-6 pb-4">
                            <ScrollHint containerRef={scrollContainerRef} />
                            <div
                                ref={scrollContainerRef}
                                className="flex flex-row gap-4 h-full overflow-x-auto overflow-y-hidden pb-2 pt-1 snap-x snap-mandatory no-scrollbar"
                            >
                                {columns.map(col => {
                                    const isOverWip = col.id === 'doing' && col.tasks.length > col.wipLimit;
                                    const isAtWip = col.id === 'doing' && col.tasks.length >= col.wipLimit;
                                    const isBottleneck = isOverWip || isAtWip;
                                    const isBlurred = day > 5 && col.id === 'backlog';
                                    const congestion = col.id === 'doing' ? Math.max(0, col.tasks.length - col.wipLimit) : 0;

                                    return (
                                        <Droppable key={col.id} droppableId={col.id} isDropDisabled={isBlurred}>
                                            {(provided, snapshot) => (
                                                <div
                                                    id={`col-${col.id}`}
                                                    className={`w-[320px] md:w-[420px] shrink-0 flex flex-col h-full snap-start transition-all duration-300 relative group ${wipBlockedColId === col.id ? 'animate-shake' : ''}`}
                                                >
                                                    {/* Column Frame */}
                                                    <div className={`flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-[28px] border-2 transition-all duration-500 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_-10px_rgba(0,0,0,0.6)] ${
                                                        snapshot.isDraggingOver ? 'bg-cyan-500/5 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.1)]' :
                                                        isBottleneck ? 'border-red-500/40' : 'border-slate-800/60'
                                                    } ${isBlurred ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                                        
                                                        {/* Header */}
                                                        <div className={`px-4 py-3 shrink-0 border-b border-white/5 flex items-center justify-between ${
                                                            col.id === 'done' ? 'bg-emerald-500/5' :
                                                            col.id === 'doing' ? 'bg-cyan-500/5' : ''
                                                        }`}>
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={`w-1.5 h-5 rounded-full ${
                                                                    col.id === 'done' ? 'bg-emerald-500' :
                                                                    col.id === 'doing' ? 'bg-cyan-500' : 'bg-slate-500'
                                                                }`} />
                                                                <h3 className="font-black text-base uppercase tracking-wider text-slate-100 italic">
                                                                    {day > 5 && col.id === 'backlog' ? 'Master Plan' : col.title}
                                                                </h3>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/50 text-xs font-black font-mono text-slate-400">
                                                                    {col.tasks.length}
                                                                </div>
                                                                {col.id === 'doing' && col.wipLimit > 0 && (
                                                                    <div className="flex flex-col items-end gap-0.5">
                                                                        <div className={`px-2.5 py-1 rounded-lg border text-xs font-black font-mono ${
                                                                            col.tasks.length >= col.wipLimit
                                                                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                                                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                                                        }`}>
                                                                            WIP {col.tasks.length}/{col.wipLimit}
                                                                        </div>
                                                                        {col.tasks.length < col.wipLimit && (
                                                                            <span 
                                                                                className="text-[9px] text-cyan-400/80 font-bold uppercase tracking-wider cursor-help border-b border-dashed border-cyan-400/30 pb-0.5"
                                                                                title="This board represents one crew's capacity. Real sites run many crews in parallel — but each crew shouldn't juggle more than a few active tasks at once, or quality and speed both suffer."
                                                                            >
                                                                                Parallel tasks permitted
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Task Area */}
                                                        <div
                                                            {...provided.droppableProps}
                                                            ref={provided.innerRef}
                                                            className="flex-1 p-3 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar-thin"
                                                        >
                                                            {col.tasks.map((task, index) => {
                                                                const isWaste = task.id.includes('waste') || task.title === 'REWORK';
                                                                const isDone = col.id === 'done';
                                                                const isDoing = col.id === 'doing';
                                                                const hasConstraints = chapter > 1 && (task.constraints?.length || 0) > 0;
                                                                
                                                                const pMonth = (task.stepNumber || 1) <= 5 ? 1 : (task.stepNumber || 1) <= 10 ? 2 : (task.stepNumber || 1) <= 15 ? 3 : 4;
                                                                const isDelayed = chapter === 1 && (task.stepNumber || 1) > 2 ? day > (pMonth + 1) : day > pMonth;
                                                                const isAtRisk = isDoing && isDelayed;
                                                                const isOnTrack = isDoing && !isDelayed;
                                                                const isJustDropped = droppedTaskId === task.id;

                                                                return (
                                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                                        {(provided, snapshot) => {
                                                                            const child = (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    {...provided.dragHandleProps}
                                                                                    style={provided.draggableProps.style}
                                                                                    className={`group relative bg-slate-800/90 backdrop-blur-xl p-3.5 rounded-xl border transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_10px_-4px_rgba(0,0,0,0.5)] ${
                                                                                        snapshot.isDragging
                                                                                            ? 'bg-slate-700 border-cyan-400 shadow-[0_25px_60px_-15px_rgba(0,0,0,1)] ring-4 ring-cyan-500/20 z-50 scale-[1.05] cursor-grabbing'
                                                                                            : isDone ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/60 hover:shadow-xl hover:-translate-y-1'
                                                                                            : isAtRisk ? 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-500/80 hover:-translate-y-1'
                                                                                            : isOnTrack ? 'border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-500/60 hover:shadow-xl hover:-translate-y-1'
                                                                                            : 'border-slate-700/50 hover:border-slate-500 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1'
                                                                                    } ${isWaste ? 'border-red-900/50 bg-red-950/40' : ''} ${isJustDropped ? 'animate-card-snap' : ''}`}
                                                                                >
                                                                                    <WasteTaskOverlay isWaste={isWaste} isInDone={isDone} />
                                                                                    <BottleneckPulse isBottleneck={isBottleneck && isDoing && index === 0} />
                                                                                    
                                                                                    <div className="flex items-start gap-3">
                                                                                        <div className="shrink-0 mt-0.5">
                                                                                            <TaskIconDisplay
                                                                                                icon={task.icon}
                                                                                                type={task.type}
                                                                                                size="sm"
                                                                                                className={`shadow-lg drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110 ${isDone ? 'opacity-50 grayscale' : ''}`} 
                                                                                            />
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <div className="flex justify-between items-start gap-2">
                                                                                                <h4 className={`text-sm font-black tracking-tight leading-snug transition-colors truncate ${
                                                                                                    isWaste ? 'text-red-400' : 
                                                                                                    isDone ? 'text-slate-500 line-through' :
                                                                                                    'text-slate-100 group-hover:text-cyan-400'
                                                                                                }`}>
                                                                                                    {task.title}
                                                                                                </h4>
                                                                                                {hasConstraints && <div className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                                                                                                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                                                                                                {chapter === 1 && day === 1 && tutorialStep <= 3 && col.id === 'backlog' && index === 0 && (
                                                                                                    <div className="shrink-0 px-2 py-0.5 bg-amber-500 text-amber-950 text-[10px] font-black rounded-full animate-bounce shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                                                                                        DRAG ME
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <p className={`text-[11px] mt-1 font-medium leading-snug line-clamp-2 transition-opacity ${isDone ? 'opacity-30' : 'text-slate-400/90'}`}>
                                                                                                {task.description}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Tags & Meta — kept on a single wrapping row so cards stay short
                                                                                        and more of the queue is visible at once */}
                                                                                    <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                                                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                                                                            task.type === 'Structural' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                                                                            task.type === 'Systems' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                                            task.type === 'Interior' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                                            task.type === 'Management' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                                            'bg-slate-700/30 text-slate-400 border-slate-700/50'
                                                                                        }`}>
                                                                                            {task.type}
                                                                                        </span>
                                                                                        <span className="flex items-center gap-1 bg-slate-900/40 rounded-md px-2 py-0.5 border border-slate-700/30 text-[9px] font-black font-mono text-red-400">
                                                                                            -{formatCurrency(task.costToStart || task.cost || 0, currency)}
                                                                                        </span>
                                                                                        {task.materialsRequired && task.materialsRequired.length > 0 && (() => {
                                                                                            const first = task.materialsRequired[0];
                                                                                            let MatIcon = Package;
                                                                                            if (first.name.includes('Concrete') || first.name.includes('Water') || first.name.includes('Chemicals') || first.name.includes('Paint')) MatIcon = Droplets;
                                                                                            else if (first.name.includes('Bricks') || first.name.includes('Tiles') || first.name.includes('Sand')) MatIcon = Cuboid;
                                                                                            else if (first.name.includes('Steel') || first.name.includes('Wood')) MatIcon = Hammer;
                                                                                            else if (first.name.includes('Wiring') || first.name.includes('Electrical')) MatIcon = Zap;
                                                                                            const summary = task.materialsRequired.map(m => `${m.amount} ${m.name}`).join(' · ');
                                                                                            return (
                                                                                                <span
                                                                                                    className="flex items-center gap-1 min-w-0 bg-slate-900/40 rounded-md px-2 py-0.5 border border-amber-500/20 text-[9px] font-bold text-amber-400"
                                                                                                    title={`Requires: ${summary}`}
                                                                                                >
                                                                                                    <MatIcon className="w-3 h-3 text-amber-500 shrink-0" />
                                                                                                    <span className="truncate max-w-[10rem]">{summary}</span>
                                                                                                </span>
                                                                                            );
                                                                                        })()}
                                                                                    </div>

                                                                                    {/* Replace Button */}
                                                                                    {!isWaste && col.id === 'backlog' && (
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); setReplaceTaskId(task.originalId || task.id); setShowCustomModal(true); }}
                                                                                            className="absolute top-2 right-2 min-w-[36px] min-h-[36px] flex items-center justify-center opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all p-2 bg-slate-700/90 hover:bg-cyan-500/20 border border-slate-600/50 rounded-xl hover:border-cyan-500/40 touch-manipulation"
                                                                                        >
                                                                                            <Replace className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                            return snapshot.isDragging ? createPortal(child, document.body) : child;
                                                                        }}
                                                                    </Draggable>
                                                                );
                                                            })}
                                                            {provided.placeholder}
                                                            
                                                            {col.id === 'backlog' && (
                                                                <button
                                                                    onClick={() => { setReplaceTaskId(null); setShowCustomModal(true); }}
                                                                    className="w-full py-6 mt-2 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-700/40 text-slate-500 hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all group"
                                                                >
                                                                    <div className="p-2 rounded-full bg-slate-800 border border-slate-700 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
                                                                        <Plus className="w-5 h-5" />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Inject Custom Order</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="h-6 shrink-0" /> {/* Spacer */}
                                                </div>
                                            )}
                                        </Droppable>
                                    );
                                })}
                            </div>
                        </div>
                    </DragDropContext>
                </div>
            </motion.div>

            <CustomTaskModal
                isOpen={showCustomModal}
                onClose={() => { setShowCustomModal(false); setReplaceTaskId(null); }}
                replaceTaskId={replaceTaskId}
            />
        </>
    );
};
