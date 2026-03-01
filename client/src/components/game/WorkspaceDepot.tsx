import React, { useState, useEffect } from 'react';
import { useGameStore, DepotItem, DepotZone } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import soundManager from '@/lib/soundManager';
import { Trash2, Wrench, Package, AlertTriangle, CheckCircle, Flame, Info, HardHat, MousePointerClick, X, Focus, Star } from 'lucide-react';

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

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState<boolean>(() => {
        const seen = localStorage.getItem('hasSeenDepotTutorial');
        return !seen;
    });

    const markTutorialSeen = () => {
        localStorage.setItem('hasSeenDepotTutorial', 'true');
        setShowTutorial(false);
        soundManager.playSFX('click', 0.5);
    };

    // Initial evaluation on mount if it's day 16 (Sustain audit)
    useEffect(() => {
        if (day === 16) {
            evaluate5S();
        }
    }, [day, evaluate5S]);

    // Handle selecting an item
    const handleItemClick = (item: DepotItem) => {
        if (item.type === 'hazard') {
            if (day < 14) return; // Only allow cleaning from day 14 (Shine) onwards
            cleanDepotHazard(item.id);
            soundManager.playSFX('quiz_correct', 0.6);
            if (day === 16) evaluate5S();
            return;
        }

        if (selectedItemId === item.id) {
            setSelectedItemId(null); // Deselect if already selected
            soundManager.playSFX('click', 0.3);
            return;
        }

        setSelectedItemId(item.id);
        soundManager.playSFX('click', 0.6);
    };

    // Handle dropping/moving item to a zone
    const handleZoneClick = (zoneId: string) => {
        if (!selectedItemId) return;

        moveDepotItem(selectedItemId, zoneId);
        setSelectedItemId(null);
        soundManager.playSFX('success', 0.4);

        if (day === 16) evaluate5S();
    };

    const renderItemIcon = (item: DepotItem) => {
        switch (item.type) {
            case 'tool': return <Wrench className={`w-8 h-8 ${item.isBroken ? 'text-red-500' : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`} />;
            case 'material': return <Package className="w-8 h-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />;
            case 'trash': return <Trash2 className="w-8 h-8 text-slate-400" />;
            case 'hazard': return <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />;
            default: return null;
        }
    };

    const get5SGrade = (s: number) => {
        if (s >= 90) return { label: 'S (Expert)', color: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' };
        if (s >= 70) return { label: 'A (Clean)', color: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' };
        if (s >= 50) return { label: 'B (Fair)', color: 'text-blue-400' };
        return { label: 'C (Cluttered)', color: 'text-slate-400' };
    };

    const currentScore = depotScore || 0;
    const grade = get5SGrade(currentScore);
    const unassignedItems = depotItems.filter(i => i.currentZoneId === 'unassigned');
    const selectedItemObj = depotItems.find(i => i.id === selectedItemId);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex flex-col pointer-events-auto bg-[#0A0F1C] overflow-hidden"
        >
            {/* Immersive Industrial Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #1e293b 1px, transparent 1px),
                        linear-gradient(to bottom, #1e293b 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none radial-gradient-vignette opacity-50 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />

            {/* Glowing Top Nav */}
            <div className="relative z-10 bg-slate-900/80 backdrop-blur-2xl border-b border-slate-700/50 shadow-2xl py-3 px-4 md:py-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div className="bg-slate-800/80 p-2 md:p-3 rounded-2xl border border-slate-700/50 shadow-inner hidden sm:block">
                        <Package className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">WORKSPACE DEPOT</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mt-1 text-xs md:text-sm font-bold text-slate-400">
                            <span className="bg-slate-800 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-slate-700/50 text-cyan-400 uppercase tracking-widest flex items-center gap-2 w-max">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 animate-pulse" />
                                Day {day} Phase
                            </span>
                            <span className="italic truncate max-w-[200px] md:max-w-md hidden sm:block">
                                {day === 12 && "Sort (Seiri) - Discard waste."}
                                {day === 13 && "Set in Order (Seiton) - Move to zones."}
                                {day === 14 && "Shine (Seiso) - Clean hazards."}
                                {day === 15 && "Standardize (Seiketsu) - Follow rules."}
                                {day === 16 && "Sustain (Shitsuke) - Final Audit."}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8 bg-slate-800/50 py-2 px-4 md:px-6 rounded-3xl border border-slate-700/50">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">5S Grade</span>
                        <motion.span
                            key={grade.label}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-lg md:text-2xl font-black ${grade.color}`}
                        >
                            {grade.label}
                        </motion.span>
                    </div>
                    <div className="w-px h-8 md:h-10 bg-slate-700" />
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-xl transition-colors md:hidden"
                        title="Help"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 md:px-8 py-2 md:py-3 rounded-2xl text-sm md:text-base font-black transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.8)]"
                    >
                        SITE
                    </button>
                </div>
            </div>

            {/* Main Interactive Play Area */}
            <div className="flex-1 relative z-10 flex flex-col lg:flex-row p-4 md:p-8 gap-4 md:gap-8 overflow-hidden h-full">

                {/* Left Side: The Unassigned Floor (Shop Floor) */}
                <div className="flex-[3] flex flex-col bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hazard-stripes opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }} />

                    <div className="p-6 flex justify-between items-end border-b border-slate-700/50 bg-slate-900/40">
                        <div>
                            <h2 className="text-xl font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Unassigned Items & Hazards
                            </h2>
                            <p className="text-sm font-semibold text-slate-400 mt-1">
                                {unassignedItems.length} items spread across the shop floor.
                            </p>
                        </div>

                        {/* Interactive Hint */}
                        <AnimatePresence mode="popLayout">
                            {!selectedItemId ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="hidden md:flex bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl items-center gap-2 text-sm font-bold shadow-lg"
                                >
                                    <MousePointerClick className="w-5 h-5 animate-pulse" />
                                    {day >= 14 ? "Click hazards to clean, or items to select." : "Select an item to assign it."}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-amber-500/20 border border-amber-500/50 text-amber-400 px-3 md:px-6 py-1.5 md:py-2 rounded-xl flex items-center gap-2 md:gap-3 text-sm md:text-lg font-black shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
                                >
                                    <Focus className="w-4 h-4 md:w-6 md:h-6" />
                                    <span className="hidden sm:inline">SELECT A DESTINATION ZONE</span>
                                    <span className="sm:hidden">SELECT ZONE</span>
                                    <button
                                        onClick={() => setSelectedItemId(null)}
                                        className="ml-2 bg-slate-800/80 p-1 md:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-red-500/80 transition-colors"
                                    >
                                        <X className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative min-h-[50vh] lg:min-h-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 relative z-10">
                            <AnimatePresence>
                                {unassignedItems.map((item) => {
                                    const isSelected = selectedItemId === item.id;
                                    const isHazard = item.type === 'hazard';

                                    return (
                                        <motion.div
                                            layoutId={item.id}
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{
                                                opacity: 1,
                                                scale: isSelected ? 1.05 : 1,
                                                y: isSelected ? -5 : 0
                                            }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            onClick={() => handleItemClick(item)}
                                            className={`
                                                relative flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl md:rounded-3xl cursor-pointer transition-all duration-300 group
                                                ${isHazard
                                                    ? 'bg-red-950/40 border-2 border-red-500/50 hover:bg-red-900/60 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]'
                                                    : 'bg-slate-800 border-2 border-slate-600 shadow-xl hover:bg-slate-700 hover:border-slate-500 hover:shadow-2xl'
                                                }
                                                ${isSelected ? 'ring-2 md:ring-4 ring-amber-500 !border-amber-500 !bg-slate-700 shadow-[0_10px_30px_rgba(245,158,11,0.3)]' : ''}
                                            `}
                                        >
                                            {/* Glow effect behind item */}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-amber-500/10 rounded-2xl md:rounded-3xl blur-md md:blur-xl" />
                                            )}

                                            {isHazard && (
                                                <div className="absolute top-0 right-0 p-3 text-red-400">
                                                    <Flame className="w-6 h-6 animate-bounce" />
                                                </div>
                                            )}

                                            <div className="relative z-10 mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                                {renderItemIcon(item)}
                                            </div>

                                            <span className="relative z-10 font-bold text-center text-slate-200 text-lg leading-tight w-full truncate px-2">
                                                {item.name}
                                            </span>

                                            {item.isBroken && (
                                                <div className="absolute bottom-4 bg-red-500 text-white px-3 py-1 text-[10px] font-black rounded-lg shadow-lg tracking-widest uppercase mt-4">
                                                    Broken / Scrap
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {unassignedItems.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center text-slate-500 pt-20">
                                    <Star className="w-20 h-20 mb-6 text-emerald-500/30 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                                    <h3 className="text-3xl font-black text-slate-400 tracking-tight">SHOP FLOOR IS CLEAR</h3>
                                    <p className="font-semibold text-lg mt-2">Excellent Sort phase. Zero unassigned items.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Deployment Zones */}
                <div className="flex-[1.5] flex flex-col gap-6 overflow-y-auto">
                    {depotZones.map((zone, index) => {
                        const zoneItems = depotItems.filter(i => i.currentZoneId === zone.id);

                        let themeClass = "from-slate-800 to-slate-900 border-slate-600/60";
                        let textClass = "text-slate-300";
                        let glowClass = "shadow-[0_0_20px_rgba(0,0,0,0.5)]";
                        let focusBorderClass = "ring-4 ring-emerald-500 border-emerald-500";

                        if (zone.acceptsType === 'trash') {
                            themeClass = "from-red-950/60 to-red-900/20 border-red-500/30";
                            textClass = "text-red-300";
                            glowClass = "shadow-[0_0_20px_rgba(239,68,68,0.15)]";
                            focusBorderClass = "ring-4 ring-red-500 border-red-500";
                        } else if (zone.acceptsType === 'tool') {
                            themeClass = "from-cyan-950/60 to-cyan-900/20 border-cyan-500/30";
                            textClass = "text-cyan-300";
                            glowClass = "shadow-[0_0_20px_rgba(34,211,238,0.15)]";
                            focusBorderClass = "ring-4 ring-cyan-500 border-cyan-500";
                        } else if (zone.acceptsType === 'material') {
                            themeClass = "from-amber-950/60 to-amber-900/20 border-amber-500/30";
                            textClass = "text-amber-300";
                            glowClass = "shadow-[0_0_20px_rgba(245,158,11,0.15)]";
                            focusBorderClass = "ring-4 ring-amber-500 border-amber-500";
                        }

                        // Should unassigned block interaction if it's the unassigned zone? No, unassigned is not rendered here.

                        return (
                            <motion.div
                                key={zone.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => selectedItemId && handleZoneClick(zone.id)}
                                className={`
                                    relative p-6 rounded-3xl border-2 bg-gradient-to-br backdrop-blur-md overflow-hidden transition-all duration-300 flex flex-col
                                    ${themeClass} ${glowClass}
                                    ${selectedItemId
                                        ? `cursor-pointer hover:scale-[1.02] hover:brightness-125 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] ${focusBorderClass}`
                                        : 'opacity-80 scale-100'}
                                    min-h-[200px]
                                `}
                            >
                                {/* Zone Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className={`text-xl font-black uppercase tracking-wider ${textClass} drop-shadow-md`}>
                                        {zone.name}
                                    </h3>
                                    <div className={`
                                        px-3 py-1 rounded-lg text-sm font-black border backdrop-blur-sm
                                        ${zoneItems.length >= zone.capacity ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-900/50 text-slate-300 border-slate-600/50'}
                                    `}>
                                        {zoneItems.length} / {zone.capacity}
                                    </div>
                                </div>

                                {/* Zone Items Grid */}
                                <div className="flex-1 rounded-2xl bg-black/30 border border-white/5 p-4
                                    flex flex-wrap gap-3 content-start">
                                    <AnimatePresence>
                                        {zoneItems.map(item => (
                                            <motion.div
                                                layoutId={`zone-${item.id}`} // Unique ID for layout animation within zone
                                                key={item.id}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={`
                                                    p-2 rounded-xl border flex items-center gap-2 bg-slate-800 shadow-md w-full sm:w-[calc(50%-6px)] xl:w-full 2xl:w-[calc(50%-6px)] h-[48px] md:h-[56px] relative
                                                    ${item.isBroken && zone.acceptsType !== 'trash' ? 'border-red-500/50' : 'border-slate-600/50'}
                                                `}
                                            >
                                                <div className="scale-75 origin-left">
                                                    {renderItemIcon(item)}
                                                </div>
                                                <div className="text-xs font-bold text-slate-200 leading-tight truncate">
                                                    {item.name}
                                                </div>

                                                {/* Error Indicator if wrong item in zone */}
                                                {item.type !== zone.acceptsType && day >= 13 && (
                                                    <div className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2 animate-ping" title="Misplaced Item!" />
                                                )}
                                            </motion.div>
                                        ))}

                                        {/* Empty State Instructions if no items and selected */}
                                        {zoneItems.length === 0 && selectedItemId && (
                                            <div className="w-full h-full flex items-center justify-center absolute inset-0 text-white/40 font-black animate-pulse text-lg tracking-widest">
                                                CLICK TO ASSIGN
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Active Selection Overlay Indicator */}
                                {selectedItemId && (
                                    <div className="absolute inset-0 border-[6px] border-dashed border-white/20 rounded-3xl pointer-events-none animate-[spin_20s_linear_infinite]"
                                        style={{ animationPlayState: 'paused' /* Keeps dashed look */ }} />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Tutorial Overlay */}
            <AnimatePresence>
                {showTutorial && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={markTutorialSeen}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-800 border-2 border-cyan-500/50 rounded-3xl p-8 max-w-xl shadow-[0_0_50px_rgba(34,211,238,0.2)] text-center relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                <div className="bg-cyan-500 p-4 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                                    <MousePointerClick className="w-10 h-10 text-slate-900" />
                                </div>
                            </div>

                            <h2 className="text-3xl font-black text-white mt-4 mb-2">HOW TO PLAY</h2>
                            <p className="text-cyan-400 font-bold tracking-widest uppercase mb-8 text-sm">Workspace Depot System</p>

                            <div className="space-y-6 text-left">
                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                                        <MousePointerClick className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">1. Click to Select</h3>
                                        <p className="text-slate-400 text-sm mt-1">Click any tool, material, or piece of trash on the shop floor to select it.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                                        <Package className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">2. Assign to a Zone</h3>
                                        <p className="text-slate-400 text-sm mt-1">Once selected, click heavily glowing zones on the right panel to instantly assign the item.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                                        <Flame className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">3. Clean Hazards</h3>
                                        <p className="text-slate-400 text-sm mt-1">If you see a red flashing hazard (spill, fire), just click it once directly to clean it up.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={markTutorialSeen}
                                className="mt-10 bg-cyan-500 hover:bg-cyan-400 text-slate-900 w-full py-4 rounded-2xl font-black text-lg transition-colors shadow-lg"
                            >
                                GOT IT!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
