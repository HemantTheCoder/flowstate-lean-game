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

    const currentScore = day === 16 ? evaluate5S() : (depotScore || 0);
    const grade = get5SGrade(currentScore);
    const unassignedItems = depotItems.filter(i => i.currentZoneId === 'unassigned');

    return (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-100 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-4 border-slate-300 relative"
            >
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b-2 border-slate-200">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
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
                            className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors"
                        >
                            Back to Site
                        </button>
                    </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">

                        {/* THE CLUTTERED DEPOT FLOOR / UNASSIGNED */}
                        <div className="md:col-span-2 bg-slate-200/50 rounded-2xl p-6 border-4 border-slate-300 border-double relative min-h-[450px] shadow-inner overflow-hidden">
                            {/* Visual Floor Texture - Warehouse vibe */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 0)', backgroundSize: '24px 24px' }}
                            />

                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h3 className="font-black text-slate-500 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    The Shop Floor
                                </h3>

                                <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-300 flex items-center gap-2 shadow-sm text-xs font-bold text-slate-600">
                                    <Info className="w-3.5 h-3.5 text-blue-500" />
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
                                                    <motion.div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => item.type === 'hazard' ? handleHazardClick(item.id) : null}
                                                        className={`
                                                            bg-white border-2 rounded-xl p-4 shadow-md w-36 flex flex-col items-center gap-3 cursor-grab active:cursor-grabbing relative
                                                            ${snapshot.isDragging ? 'shadow-2xl ring-4 ring-blue-400 z-50 !rotate-6 !bg-blue-50' : 'hover:shadow-lg transition-transform'}
                                                            ${item.type === 'hazard' ? 'border-red-400 bg-red-50 cursor-pointer' : 'border-slate-200'}
                                                        `}
                                                    >
                                                        {item.type === 'hazard' && (
                                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full animate-pulse">
                                                                <Flame className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        <div className={`p-3 rounded-full ${item.type === 'hazard' ? 'bg-red-100' : 'bg-slate-50'}`}>
                                                            {renderItemIcon(item)}
                                                        </div>
                                                        <span className="text-sm font-black text-slate-700 text-center leading-tight">{item.name}</span>
                                                        {item.isBroken && (
                                                            <div className="absolute -bottom-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full shadow-sm">
                                                                RE TAG
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>

                            {/* Character Feedback Bubble */}
                            <div className="absolute bottom-4 right-4 max-w-xs transition-opacity duration-300">
                                <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-slate-200 flex gap-3 items-start relative translate-y-[-10px]">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center border-2 border-blue-200">
                                        <HardHat className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 italic">
                                        "{day === 12 ? "Only keep what matters. The rest is waste." :
                                            day === 13 ? "If it doesn't have a label, it's invisible." :
                                                day === 14 ? "If you see a spill, own it!" :
                                                    "Discipline is the key to 5S."}"
                                    </p>
                                    <div className="absolute bottom-[-10px] left-8 w-4 h-4 bg-white border-b-2 border-r-2 border-slate-200 rotate-45" />
                                </div>
                            </div>
                        </div>

                        {/* ZONES SIDEBAR */}
                        <div className="flex flex-col gap-4">
                            {depotZones.map(zone => {
                                const zoneItems = depotItems.filter(i => i.currentZoneId === zone.id);
                                let bgClass = "bg-white";
                                let borderClass = "border-slate-200";

                                if (zone.acceptsType === 'trash') {
                                    bgClass = "bg-red-50";
                                    borderClass = "border-red-300";
                                } else if (zone.acceptsType === 'tool') {
                                    bgClass = "bg-blue-50";
                                    borderClass = "border-blue-300 border-dashed"; // Shadow board vibe
                                } else if (zone.acceptsType === 'material') {
                                    bgClass = "bg-amber-50";
                                    borderClass = "border-amber-300";
                                }

                                return (
                                    <Droppable key={zone.id} droppableId={zone.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`
                                                        rounded-xl p-4 border-2 flex flex-col min-h-[150px] transition-colors
                                                        ${bgClass} ${borderClass}
                                                        ${snapshot.isDraggingOver ? 'bg-indigo-50 ring-2 ring-indigo-400 border-solid' : ''}
                                                    `}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-bold text-slate-700 text-sm">{zone.name}</h3>
                                                    <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                                        {zoneItems.length} / {zone.capacity}
                                                    </span>
                                                </div>

                                                <div className="flex-1 flex flex-col gap-2">
                                                    {zoneItems.map((item, idx) => (
                                                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`
                                                                            bg-white border rounded p-2 flex items-center gap-2 shadow-sm
                                                                            ${snapshot.isDragging ? 'shadow-md ring-1 ring-blue-400' : ''}
                                                                        `}
                                                                >
                                                                    {renderItemIcon(item)}
                                                                    <span className="text-xs font-semibold text-slate-700 truncate">{item.name}</span>
                                                                    {item.type !== zone.acceptsType && day >= 13 && (
                                                                        <AlertTriangle className="w-4 h-4 text-red-500 ml-auto" />
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
