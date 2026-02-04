import React from 'react';
import { useGameStore, Column, Task } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import soundManager from '@/lib/soundManager';

export const KanbanBoard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { columns, moveTask, setWipLimit, funds, materials, tutorialStep, setTutorialStep, day, audioSettings, chapter } = useGameStore();

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // 1. If dropped outside or in same spot
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

        // Find the task object from the store for narrative validation
        const sourceCol = columns.find(c => c.id === sourceColId);
        const task = sourceCol?.tasks.find(t => t.id === draggableId);

        if (!task) return;

        // 2. NARRATIVE VALIDATION (User requested smart alerts on drop)

        // Block Structural in Rain (Moving to Doing)
        if (day === 3 && task.type === 'Structural' && destColId === 'doing' && sourceColId !== 'doing') {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            alert("🌧️ ENVIRONMENTAL VARIATION DETECTED!\n\nPrecipitation exceeds safety thresholds for structural work. Continuing would compromise quality and safety standards.\n\n✅ LEAN RESPONSE: Pivot to interior fit-out or MEP systems in the Ready column to maintain throughput.");
            return;
        }

        // Block costly tasks if no materials (Moving to Doing)
        if (destColId === 'doing' && sourceColId !== 'doing' && materials < task.cost) {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            const isDay2 = day === 2;
            const reason = isDay2 ? "Logistics failure: Concrete delivery delayed 🚚" : "Resource constraint detected.";

            alert(`⛔ RESOURCE CONSTRAINT!\n\n${reason}\nAvailable Materials: ${materials} units. Required: ${task.cost} units.\n\n✅ LEAN RESPONSE: Identify non-material dependent tasks (Management/Prep) to minimize idle time waste.`);
            return;
        }

        // 3. FLOW VALIDATION (Prevent skipping columns)
        // Allowed moves: Backlog -> Ready -> Doing -> Done (and backward one step for undo)
        const flowOrder = ['backlog', 'ready', 'doing', 'done'];
        const sourceIndex = flowOrder.indexOf(sourceColId);
        const destIndex = flowOrder.indexOf(destColId);

        // Allow moving forward by exactly 1 step OR backward by exactly 1 step
        if (Math.abs(destIndex - sourceIndex) !== 1) {
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            alert("⛔ INVALID MOVE!\n\nYou must follow the flow:\nBacklog ➡️ Ready ➡️ Doing ➡️ Done\n\nYou cannot skip steps!");
            return;
        }

        // 4. EXECUTE MOVE
        const success = moveTask(draggableId, sourceColId, destColId);

        if (success) {
            // Audio Feedback
            if (destColId === 'done') {
                soundManager.playSFX('money', audioSettings.sfxVolume);
            } else {
                soundManager.playSFX('click', audioSettings.sfxVolume);
            }

            // Tutorial Logic
            if (tutorialStep === 2 && sourceColId === 'backlog' && destColId === 'ready') setTutorialStep(3);
            if (tutorialStep === 3 && sourceColId === 'ready' && destColId === 'doing') setTutorialStep(4);
            if (tutorialStep === 4 && sourceColId === 'doing' && destColId === 'done') setTutorialStep(5);
        } else {
            // Fail Feedback (WIP Limit etc)
            soundManager.playSFX('alert', audioSettings.sfxVolume);
            alert("Cannot move task! Check WIP limits or project constraints.");
        }
    };

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
            <div className="bg-slate-100 w-full h-full max-w-6xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">

                {/* Header */}
                <div className="bg-white p-4 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center z-10 gap-2 md:gap-4">
                    <div>
                        <h2 className="text-xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
                            {day > 5 ? '🚧 Site Execution Board (Week Work)' : '📋 Project Kanban Board'}
                        </h2>
                        <div className="flex gap-2 md:gap-4 mt-1 md:mt-2">
                            <div className="px-2 md:px-3 py-0.5 md:py-1 bg-blue-50 text-blue-700 rounded-lg font-mono font-bold border border-blue-100 text-[10px] md:text-sm">
                                Funds: ${funds}
                            </div>
                            <div className="px-2 md:px-3 py-0.5 md:py-1 bg-amber-50 text-amber-700 rounded-lg font-mono font-bold border border-amber-100 text-[10px] md:text-sm">
                                Materials: {materials}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 md:px-6 py-1.5 md:py-2 rounded-xl font-bold transition-colors w-full md:w-auto text-sm md:text-base"
                    >
                        Close View
                    </button>
                </div>

                {/* Columns Grid with DragDropContext */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 flex flex-row gap-4 md:gap-6 p-4 md:p-6 overflow-x-auto overflow-y-hidden bg-slate-200/50">
                        {columns.map(col => {
                            let highlightClass = "border-slate-200";
                            let adviceText = null;

                            // Chapter 2 Customizations
                            let displayTitle = col.title;
                            if (day > 5) {
                                if (col.id === 'backlog') displayTitle = "Master Plan (Locked)";
                                if (col.id === 'ready') displayTitle = "Weekly Plan (Committed)";
                            }

                            if (col.id === 'doing' && col.tasks.length >= col.wipLimit) {
                                highlightClass = "border-red-400 ring-4 ring-red-100";
                                adviceText = "Bottleneck!";
                            }
                            if (col.id === 'ready' && col.tasks.length === 0) {
                                highlightClass = "border-orange-300 ring-4 ring-orange-100";
                                adviceText = "Starved!";
                            }

                            // Blur Backlog in Ch2 (Execution Phase)
                            const isBlurred = day > 5 && col.id === 'backlog';

                            return (
                                <Droppable key={col.id} droppableId={col.id} isDropDisabled={isBlurred}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            id={`col-${col.id}`}
                                            className={`min-w-[280px] md:w-[320px] flex flex-col h-full bg-slate-50 rounded-2xl border-2 transition-all ${highlightClass} ${snapshot.isDraggingOver ? 'bg-blue-50/50 border-blue-300' : ''} overflow-hidden shrink-0 ${isBlurred ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                                        >
                                            {/* Column Header */}
                                            <div className={`${col.id === 'done' ? 'bg-green-100' : 'bg-white'} p-4 border-b border-slate-100`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-bold text-slate-700">{displayTitle}</h3>
                                                    {col.wipLimit > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold px-2 py-1 rounded ${col.tasks.length >= col.wipLimit ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                {col.tasks.length} / {col.wipLimit}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {adviceText && (
                                                    <div className="text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-wide">
                                                        ⚠️ {adviceText}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Draggable Task List */}
                                            <div className="flex-1 bg-slate-100 p-3 space-y-3 overflow-y-auto">
                                                {col.tasks.map((task, index) => {
                                                    // Check for Red Constraints (Chapter 2)
                                                    const hasRedConstraints = chapter > 1 && (task.constraints?.length || 0) > 0;

                                                    return (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`bg-white p-3 rounded-xl shadow-sm border-l-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative ${hasRedConstraints ? 'border-red-500 bg-red-50' : 'border-blue-400'} ${snapshot.isDragging ? 'shadow-2xl ring-2 rotate-2' : ''}`}
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <h4 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-sm md:text-base flex-1">{task.title}</h4>
                                                                        {hasRedConstraints && <span className="text-lg animate-pulse" title="Blocked by Constraints">⛔</span>}
                                                                    </div>

                                                                    <p className="text-[10px] md:text-xs text-slate-400 line-clamp-2 mt-1">{task.description}</p>

                                                                    {/* Constraint Tags */}
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
