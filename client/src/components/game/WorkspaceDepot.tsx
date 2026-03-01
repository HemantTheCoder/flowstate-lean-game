import React, { useState, useEffect } from 'react';
import { useGameStore, DepotItem, DepotZone } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import soundManager from '@/lib/soundManager';
import { Trash2, Wrench, Package, AlertTriangle, CheckCircle, Flame, Info, Star, HardHat } from 'lucide-react';

interface WorkspaceDepotProps {
    onClose?: () => void;
}

export const WorkspaceDepot: React.FC<WorkspaceDepotProps> = ({ onClose }) => {
    const day = useGameStore(s => s.day);
    const depotItems = useGameStore(s => s.depotItems);
    const depotZones = useGameStore(s => s.depotZones);
    const moveDepotItem = useGameStore(s => s.moveDepotItem);
    const cleanDepotHazard = useGameStore(s => s.cleanDepotHazard);
    const evaluate5S = useGameStore(s => s.evaluate5S);
    const depotScore = useGameStore(s => s.depotScore);

    const [scorePulse, setScorePulse] = useState(false);

    // Initial evaluation on mount if it's day 16 (Sustain audit)
    useEffect(() => {
        if (day === 16) {
            evaluate5S();
        }
    }, [day, evaluate5S]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        moveDepotItem(draggableId, destination.droppableId);
        soundManager.playSFX('click', 0.5);

        if (day === 16) {
            evaluate5S(); // Re-evaluate instantly during audit
        }
    };

    const handleHazardClick = (itemId: string) => {
        if (day < 14) return; // Only allow cleaning from day 14 (Shine) onwards
        cleanDepotHazard(itemId);
        soundManager.playSFX('quiz_correct', 0.6);
        setScorePulse(true);
        setTimeout(() => setScorePulse(false), 500);

        if (day === 16) {
            evaluate5S();
        }
    };

    const renderItemIcon = (item: DepotItem) => {
        switch (item.type) {
            case 'tool': return <Wrench className={`w-6 h-6 ${item.isBroken ? 'text-red-500' : 'text-blue-500'}`} />;
            case 'material': return <Package className="w-6 h-6 text-amber-600" />;
            case 'trash': return <Trash2 className="w-6 h-6 text-slate-400" />;
            case 'hazard': return <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />;
            default: return null;
        }
    };

    const get5SGrade = (s: number) => {
        if (s >= 90) return { label: 'S (Expert)', color: 'text-amber-500' };
        if (s >= 70) return { label: 'A (Clean)', color: 'text-emerald-500' };
        if (s >= 50) return { label: 'B (Fair)', color: 'text-blue-500' };
        return { label: 'C (Cluttered)', color: 'text-slate-400' };
    };

    const currentScore = depotScore || 0;
    const grade = get5SGrade(currentScore);
    const unassignedItems = depotItems.filter(i => i.currentZoneId === 'unassigned');

    return (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex items-center justify-center p-4 pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-800/95 backdrop-blur-xl w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/50 relative"
            >
                {/* Header */}
                <div className="bg-slate-900/50 px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <Package className="w-8 h-8 text-amber-500" />
                            Workspace Depot
                        </h2>
                        <div className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            {day === 12 && "Sort (Seiri): Clear the waste and broken tools."}
                            {day === 13 && "Set in Order (Seiton): A place for everything."}
                            {day === 14 && "Shine (Seiso): Proactive cleaning is inspection."}
                            {day === 15 && "Standardize (Seiketsu): Follow the visual rules."}
                            {day === 16 && "Sustain (Shitsuke): The Safety Audit is live."}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">5S Grade</div>
                            <div className={`text-xl font-black ${grade.color}`}>{grade.label}</div>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-slate-700/50 text-slate-300 border border-slate-600/50 px-4 py-2 rounded-xl font-bold hover:bg-slate-600/50 hover:text-white transition-colors"
                        >
                            Back to Site
                        </button>
                    </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">

                        {/* THE CLUTTERED DEPOT FLOOR / UNASSIGNED */}
                        <div className="md:col-span-2 bg-slate-900/60 rounded-3xl p-6 border border-slate-700/50 relative min-h-[450px] shadow-inner overflow-hidden">
                            {/* Visual Floor Texture - Warehouse vibe */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 0)', backgroundSize: '24px 24px' }}
                            />

                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h3 className="font-black text-slate-300 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    The Shop Floor
                                </h3>

                                <div className="bg-slate-800/80 backdrop-blur px-3 py-1 rounded-full border border-slate-700/50 flex items-center gap-2 shadow-sm text-xs font-bold text-slate-300">
                                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                                    {day === 14 ? "Click Hazards to clean" : "Drag items to zones"}
                                </div>
                            </div>

                            <Droppable droppableId="unassigned" direction="horizontal">
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex flex-wrap gap-6 min-h-[250px] relative z-10"
                                    >
                                        {unassignedItems.map((item, idx) => (
                                            <Draggable key={item.id} draggableId={item.id} index={idx} isDragDisabled={item.type === 'hazard'}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...(provided.draggableProps as any)}
                                                        {...(provided.dragHandleProps as any)}
                                                        onClick={() => item.type === 'hazard' ? handleHazardClick(item.id) : null}
                                                        className={`
                                                                bg-slate-800/90 backdrop-blur border rounded-xl p-3 shadow-md w-[200px] flex items-center gap-3 relative
                                                                ${item.type !== 'hazard' ? 'cursor-grab active:cursor-grabbing hover:bg-slate-700/80 transition-colors' : 'cursor-pointer'}
                                                                ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-cyan-500/50 z-50 !rotate-2 !bg-slate-700' : ''}
                                                                ${item.type === 'hazard' ? 'border-red-500/50 bg-red-900/30' : 'border-slate-600/50'}
                                                            `}
                                                    >
                                                        {item.type === 'hazard' && (
                                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full animate-pulse shadow-md">
                                                                <Flame className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        <div className={`p-2 rounded-lg flex-shrink-0 ${item.type === 'hazard' ? 'bg-red-500/20' : 'bg-slate-700/50'}`}>
                                                            {renderItemIcon(item)}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-200 leading-tight truncate flex-1">{item.name}</span>
                                                        {item.isBroken && (
                                                            <div className="absolute -bottom-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full shadow-sm">
                                                                RE TAG
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>

                            <div className="absolute bottom-4 right-4 max-w-xs transition-opacity duration-300">
                                <div className="bg-slate-800/90 p-4 rounded-2xl shadow-xl border border-slate-700/50 flex gap-3 items-start relative translate-y-[-10px]">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex-shrink-0 flex items-center justify-center border border-cyan-500/30">
                                        <HardHat className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-300 italic">
                                        "{day === 12 ? "Only keep what matters. The rest is waste." :
                                            day === 13 ? "If it doesn't have a label, it's invisible." :
                                                day === 14 ? "If you see a spill, own it!" :
                                                    "Discipline is the key to 5S."}"
                                    </p>
                                    <div className="absolute bottom-[-10px] left-8 w-4 h-4 bg-slate-800 border-b border-r border-slate-700/50 rotate-45" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {depotZones.map(zone => {
                                const zoneItems = depotItems.filter(i => i.currentZoneId === zone.id);
                                let bgClass = "bg-slate-800/50";
                                let borderClass = "border-slate-700/50";

                                if (zone.acceptsType === 'trash') {
                                    bgClass = "bg-red-900/10";
                                    borderClass = "border-red-500/30";
                                } else if (zone.acceptsType === 'tool') {
                                    bgClass = "bg-cyan-900/10";
                                    borderClass = "border-cyan-500/30 border-dashed"; // Shadow board vibe
                                } else if (zone.acceptsType === 'material') {
                                    bgClass = "bg-amber-900/10";
                                    borderClass = "border-amber-500/30";
                                }

                                return (
                                    <Droppable key={zone.id} droppableId={zone.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                className={`
                                                        rounded-2xl p-4 border flex flex-col min-h-[150px] transition-colors
                                                        ${bgClass} ${borderClass}
                                                        ${snapshot.isDraggingOver ? 'bg-indigo-500/10 ring-2 ring-indigo-400/50 border-solid' : ''}
                                                    `}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-bold text-slate-300 text-sm">{zone.name}</h3>
                                                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                                                        {zoneItems.length} / {zone.capacity}
                                                    </span>
                                                </div>

                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className="flex-1 flex flex-col gap-2 min-h-[100px]"
                                                >
                                                    {zoneItems.map((item, idx) => (
                                                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...(provided.draggableProps as any)}
                                                                    {...(provided.dragHandleProps as any)}
                                                                    className={`
                                                                            bg-slate-800/90 backdrop-blur border rounded-xl p-3 shadow-md w-[200px] flex items-center gap-3 relative cursor-grab active:cursor-grabbing hover:bg-slate-700/80 transition-colors
                                                                            ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-cyan-500/50 z-50 !rotate-2 !bg-slate-700' : ''}
                                                                            border-slate-600/50
                                                                        `}
                                                                >
                                                                    <div className={`p-2 rounded-lg flex-shrink-0 bg-slate-700/50`}>
                                                                        {renderItemIcon(item)}
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-200 leading-tight truncate flex-1">{item.name}</span>
                                                                    {item.isBroken && (
                                                                        <div className="absolute -bottom-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full shadow-sm">
                                                                            RE TAG
                                                                        </div>
                                                                    )}
                                                                    {item.type !== zone.acceptsType && day >= 13 && (
                                                                        <span title="Wrong Zone!" className="absolute -top-2 -right-2 bg-slate-900 rounded-full border border-amber-500/50">
                                                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                );
                            })}
                        </div>
                    </div>
                </DragDropContext>
            </motion.div>
        </div>
    );
};
