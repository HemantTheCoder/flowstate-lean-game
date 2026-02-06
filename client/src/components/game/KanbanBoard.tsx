import React, { useState, useEffect } from 'react';
import { useGameStore, Column, Task } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import soundManager from '@/lib/soundManager';
import { AlertTriangle, Gauge, Minus, Plus, Cloud, Sparkles, Flame, CloudRain, PackageX } from 'lucide-react';

const WipSlider: React.FC<{ column: Column; onChangeWip: (id: string, limit: number) => void }> = ({ column, onChangeWip }) => {
    const currentCount = column.tasks.length;
    const isOverLimit = currentCount > column.wipLimit;
    const isAtLimit = currentCount >= column.wipLimit;
    const fillPercent = column.wipLimit > 0 ? Math.min(100, (currentCount / column.wipLimit) * 100) : 0;

    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> WIP Limit
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onChangeWip(column.id, Math.max(1, column.wipLimit - 1))}
                        className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                        data-testid={`button-wip-decrease-${column.id}`}
                    >
                        <Minus className="w-3 h-3 text-slate-600" />
                    </button>
                    <span className={`text-sm font-black min-w-[20px] text-center ${isOverLimit ? 'text-red-600' : isAtLimit ? 'text-amber-600' : 'text-blue-600'}`}>
                        {column.wipLimit}
                    </span>
                    <button
                        onClick={() => onChangeWip(column.id, Math.min(6, column.wipLimit + 1))}
                        className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                        data-testid={`button-wip-increase-${column.id}`}
                    >
                        <Plus className="w-3 h-3 text-slate-600" />
                    </button>
                </div>
            </div>
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full transition-colors ${
                        isOverLimit ? 'bg-red-500' : isAtLimit ? 'bg-amber-400' : 'bg-blue-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${fillPercent}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>
            <AnimatePresence>
                {isOverLimit && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[9px] text-red-600 font-bold flex items-center gap-1"
                    >
                        <AlertTriangle className="w-3 h-3" /> Over capacity! Workers slowing down.
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CongestionCloud: React.FC<{ intensity: number }> = ({ intensity }) => {
    if (intensity <= 0) return null;
    return (
        <div className="absolute -top-3 -right-3 pointer-events-none z-20">
            {Array.from({ length: Math.min(intensity, 3) }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.8, 1.1, 0.8],
                        y: [0, -4, 0],
                    }}
                    transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                    }}
                    className="absolute"
                    style={{ right: i * 10, top: i * 2 }}
                >
                    <Cloud className="w-5 h-5 text-red-400/60" />
                </motion.div>
            ))}
        </div>
    );
};

const BottleneckPulse: React.FC<{ isBottleneck: boolean }> = ({ isBottleneck }) => {
    if (!isBottleneck) return null;
    return (
        <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
            animate={{
                boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0)',
                    '0 0 0 6px rgba(239, 68, 68, 0.2)',
                    '0 0 0 0 rgba(239, 68, 68, 0)',
                ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
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
                    className="absolute inset-0 rounded-xl"
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            initial={{ opacity: 0, y: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                y: [-5, -20],
                                x: [-10 + i * 10, -15 + i * 15],
                            }}
                            transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity, repeatDelay: 2 }}
                            style={{ left: `${20 + i * 25}%`, top: '20%' }}
                        >
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
                className="absolute top-1 right-1"
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
            >
                <Flame className="w-4 h-4 text-orange-500/70" />
            </motion.div>
        </div>
    );
};

const ConstraintBanner: React.FC<{ day: number; materials: number }> = ({ day, materials }) => {
    if (day === 2 && materials <= 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-3 mb-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg"
            >
                <PackageX className="w-6 h-6 flex-shrink-0" />
                <div>
                    <div className="font-black text-sm uppercase tracking-wide">Material Shortage</div>
                    <div className="text-xs text-amber-100">Concrete delivery delayed. Only zero-cost tasks (Management/Prep) can enter Doing. Adapt your workflow!</div>
                </div>
            </motion.div>
        );
    }
    if (day === 3) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-3 mb-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg"
            >
                <CloudRain className="w-6 h-6 flex-shrink-0" />
                <div>
                    <div className="font-black text-sm uppercase tracking-wide">Monsoon Warning</div>
                    <div className="text-xs text-blue-100">Heavy rain blocks all Structural work. Only Interior, Systems, and Management tasks can enter Doing.</div>
                </div>
            </motion.div>
        );
    }
    return null;
};

export const KanbanBoard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { columns, moveTask, setWipLimit, funds, materials, tutorialStep, setTutorialStep, day, audioSettings, chapter } = useGameStore();

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

        const sourceCol = columns.find(c => c.id === sourceColId);
        const task = sourceCol?.tasks.find(t => t.id === draggableId);

        if (!task) return;

        if (day === 3 && task.type === 'Structural' && destColId === 'doing' && sourceColId !== 'doing') {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            alert("ENVIRONMENTAL VARIATION DETECTED!\n\nPrecipitation exceeds safety thresholds for structural work. Continuing would compromise quality and safety standards.\n\nLEAN RESPONSE: Pivot to interior fit-out or MEP systems in the Ready column to maintain throughput.");
            return;
        }

        if (destColId === 'doing' && sourceColId !== 'doing' && materials < task.cost) {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            const isDay2 = day === 2;
            const reason = isDay2 ? "Logistics failure: Concrete delivery delayed" : "Resource constraint detected.";

            alert(`RESOURCE CONSTRAINT!\n\n${reason}\nAvailable Materials: ${materials} units. Required: ${task.cost} units.\n\nLEAN RESPONSE: Identify non-material dependent tasks (Management/Prep) to minimize idle time waste.`);
            return;
        }

        const flowOrder = ['backlog', 'ready', 'doing', 'done'];
        const sourceIndex = flowOrder.indexOf(sourceColId);
        const destIndex = flowOrder.indexOf(destColId);

        if (Math.abs(destIndex - sourceIndex) !== 1) {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            alert("INVALID MOVE!\n\nYou must follow the flow:\nBacklog > Ready > Doing > Done\n\nYou cannot skip steps!");
            return;
        }

        const success = moveTask(draggableId, sourceColId, destColId);

        if (success) {
            if (destColId === 'done') {
                soundManager.playSFX('money', audioSettings.sfxVolume);
            } else {
                soundManager.playSFX('click', audioSettings.sfxVolume);
            }

            if (tutorialStep === 2 && sourceColId === 'backlog' && destColId === 'ready') setTutorialStep(3);
            if (tutorialStep === 3 && sourceColId === 'ready' && destColId === 'doing') setTutorialStep(4);
            if (tutorialStep === 4 && sourceColId === 'doing' && destColId === 'done') setTutorialStep(5);
        } else {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            alert("Cannot move task! Check WIP limits or project constraints.");
        }
    };

    const doingCol = columns.find(c => c.id === 'doing');
    const doingCongestion = doingCol ? Math.max(0, doingCol.tasks.length - doingCol.wipLimit) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 md:p-8"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={`w-full h-full max-w-6xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto ${chapter > 1 ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-slate-100'}`}>

                <div className={`p-4 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center z-10 gap-2 md:gap-4 ${chapter > 1 ? 'bg-gradient-to-r from-indigo-900 to-purple-900 border-b border-indigo-600/50' : 'bg-white'}`}>
                    <div>
                        <h2 className={`text-xl md:text-3xl font-black flex items-center gap-2 ${chapter > 1 ? 'text-white' : 'text-slate-800'}`}>
                            {chapter > 1 ? 'Week 2 Execution Board' : 'Project Kanban Board'}
                        </h2>
                        <p className={`text-xs mt-1 ${chapter > 1 ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {chapter > 1 ? 'Execute your committed Weekly Work Plan' : 'Drag tasks through the flow. Keep WIP under control.'}
                        </p>
                        <div className="flex gap-2 md:gap-4 mt-1 md:mt-2">
                            <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-lg font-mono font-bold border text-[10px] md:text-sm ${chapter > 1 ? 'bg-white/10 text-white border-white/20' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                Funds: ${funds}
                            </div>
                            <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-lg font-mono font-bold border text-[10px] md:text-sm ${chapter > 1 ? 'bg-white/10 text-white border-white/20' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                Materials: {materials}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`px-4 md:px-6 py-1.5 md:py-2 rounded-xl font-bold transition-colors w-full md:w-auto text-sm md:text-base ${chapter > 1 ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                        data-testid="button-close-kanban"
                    >
                        Close View
                    </button>
                </div>

                <ConstraintBanner day={day} materials={materials} />

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className={`flex-1 flex flex-row gap-4 md:gap-6 p-4 md:p-6 overflow-x-auto overflow-y-hidden ${chapter > 1 ? 'bg-slate-800/50' : 'bg-slate-200/50'}`}>
                        {columns.map(col => {
                            let highlightClass = "border-slate-200";
                            let adviceText: string | null = null;

                            let displayTitle = col.title;
                            if (day > 5) {
                                if (col.id === 'backlog') displayTitle = "Master Plan (Locked)";
                                if (col.id === 'ready') displayTitle = "Weekly Plan (Committed)";
                            }

                            const isOverWip = col.id === 'doing' && col.tasks.length > col.wipLimit;
                            const isAtWip = col.id === 'doing' && col.tasks.length >= col.wipLimit;
                            const isBottleneck = isOverWip || isAtWip;

                            if (isOverWip) {
                                highlightClass = "border-red-400 ring-4 ring-red-100";
                                adviceText = "Bottleneck! Workers are overloaded.";
                            } else if (isAtWip) {
                                highlightClass = "border-amber-300 ring-2 ring-amber-100";
                                adviceText = "At WIP limit. Finish before pulling more.";
                            }

                            if (col.id === 'ready' && col.tasks.length === 0) {
                                highlightClass = "border-orange-300 ring-4 ring-orange-100";
                                adviceText = "Starved! No tasks ready.";
                            }

                            const isBlurred = day > 5 && col.id === 'backlog';
                            const congestion = col.id === 'doing' ? Math.max(0, col.tasks.length - col.wipLimit) : 0;

                            return (
                                <Droppable key={col.id} droppableId={col.id} isDropDisabled={isBlurred}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            id={`col-${col.id}`}
                                            className={`min-w-[280px] md:w-[320px] flex flex-col h-full bg-slate-50 rounded-2xl border-2 transition-all relative ${highlightClass} ${snapshot.isDraggingOver ? 'bg-blue-50/50 border-blue-300' : ''} overflow-visible shrink-0 ${isBlurred ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                                        >
                                            <BottleneckPulse isBottleneck={isBottleneck} />
                                            {col.id === 'doing' && <CongestionCloud intensity={congestion} />}

                                            <div className={`${col.id === 'done' ? 'bg-green-100' : 'bg-white'} p-4 border-b border-slate-100 rounded-t-2xl`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-bold text-slate-700">{displayTitle}</h3>
                                                    {col.wipLimit > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold px-2 py-1 rounded ${isOverWip ? 'bg-red-100 text-red-600 animate-pulse' : isAtWip ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                {col.tasks.length} / {col.wipLimit}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {adviceText && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isOverWip ? 'text-red-500' : 'text-amber-600'}`}
                                                        >
                                                            <AlertTriangle className="w-3 h-3" /> {adviceText}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {col.id === 'doing' && chapter <= 1 && (
                                                    <WipSlider column={col} onChangeWip={setWipLimit} />
                                                )}
                                            </div>

                                            <div className="flex-1 bg-slate-100 p-3 space-y-3 overflow-y-auto rounded-b-2xl">
                                                {col.tasks.map((task, index) => {
                                                    const hasRedConstraints = chapter > 1 && (task.constraints?.length || 0) > 0;
                                                    const isWasteTask = task.id.includes('waste') || task.title === 'REWORK';
                                                    const isInDoneCol = col.id === 'done';

                                                    return (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`relative bg-white p-3 rounded-xl shadow-sm border-l-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${
                                                                        isWasteTask
                                                                            ? 'border-red-500 bg-red-50/80'
                                                                            : hasRedConstraints
                                                                                ? 'border-red-500 bg-red-50'
                                                                                : 'border-blue-400'
                                                                    } ${snapshot.isDragging ? 'shadow-2xl ring-2 rotate-2' : ''} ${
                                                                        isOverWip && col.id === 'doing' ? 'opacity-80' : ''
                                                                    }`}
                                                                >
                                                                    <WasteTaskOverlay isWaste={isWasteTask} isInDone={isInDoneCol} />

                                                                    <div className="flex justify-between items-start">
                                                                        <h4 className={`font-bold group-hover:text-blue-600 transition-colors text-sm md:text-base flex-1 ${isWasteTask ? 'text-red-700' : 'text-slate-700'}`}>
                                                                            {task.title}
                                                                        </h4>
                                                                        {hasRedConstraints && <span className="text-xs font-black text-red-600 animate-pulse" title="Blocked by Constraints">BLOCKED</span>}
                                                                        {isWasteTask && !isInDoneCol && (
                                                                            <span className="text-[9px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded animate-pulse">WASTE</span>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-[10px] md:text-xs text-slate-400 line-clamp-2 mt-1">{task.description}</p>

                                                                    {chapter > 1 && task.constraints?.map(c => (
                                                                        <span key={c} className="inline-block bg-red-100 text-red-700 text-[9px] px-1 py-0.5 rounded mr-1 mt-1 font-bold border border-red-200 uppercase">
                                                                            Blocked: {c}
                                                                        </span>
                                                                    ))}

                                                                    <div className="mt-2 flex flex-wrap gap-1 md:gap-2 text-[10px] font-mono font-bold">
                                                                        <span className={`px-1 rounded border ${task.type === 'Structural' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                                            task.type === 'Management' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                                                'bg-sky-100 text-sky-800 border-sky-200'
                                                                            }`}>
                                                                            {task.type}
                                                                        </span>
                                                                        <span className="text-slate-600 bg-slate-50 border border-slate-200 px-1 rounded">-{task.cost}</span>
                                                                        <span className="text-green-600 bg-green-50 border border-green-200 px-1 rounded">+${task.reward}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>
        </motion.div>
    );
};
