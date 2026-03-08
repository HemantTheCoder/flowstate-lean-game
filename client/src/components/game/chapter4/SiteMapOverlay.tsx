import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Truck, MapPin, PackageOpen, AlertTriangle } from 'lucide-react';

const ZONES = [
    { id: 'zone-1', name: 'Level 1: Baggage Claim', x: 20, y: 30, capacity: 50 },
    { id: 'zone-2', name: 'Level 2: Security Hall', x: 60, y: 45, capacity: 30 },
    { id: 'zone-3', name: 'Level 3: VIP Lounges', x: 40, y: 70, capacity: 20 },
];

export const SiteMapOverlay: React.FC = () => {
    const { materialsInventory, kanbanLimits, deliveries, day } = useGameStore();

    // Calculate total materials on site for a rough visual representation
    const totalMaterials = Object.values(materialsInventory).reduce((a, b) => a + b, 0);
    const inTransit = deliveries.filter(d => d.etaDay === day).length;

    return (
        <div className="absolute inset-0 bg-slate-950 p-4">
            {/* Background Map Graphic (Conceptual Grid) */}
            <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />

            <div className="relative h-full w-full border-2 border-slate-800/50 rounded-xl bg-slate-900 overflow-hidden shadow-inner">

                {/* Site Entry Point / Logistics Gate */}
                <div className="absolute bottom-4 right-4 bg-slate-800 p-3 rounded-xl border border-dashed border-slate-600 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Gate 4</span>
                    <div className="relative">
                        <Truck className={`w-8 h-8 ${inTransit > 0 ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
                        {inTransit > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                {inTransit}
                            </span>
                        )}
                    </div>
                </div>

                {/* Staging Zones */}
                {ZONES.map((zone) => {
                    // Very rough logic: distribute inventory across zones visually
                    // In a real simulation, we'd track exact inventory per zone. Here we approximate for visual effect.
                    const utilRatio = Math.min(100, Math.round((totalMaterials / 3) / zone.capacity * 100));

                    let statusColor = 'text-cyan-400';
                    let bgColor = 'bg-cyan-500/20';
                    let borderColor = 'border-cyan-500/40';

                    if (utilRatio > 80) {
                        statusColor = 'text-amber-400';
                        bgColor = 'bg-amber-500/20';
                        borderColor = 'border-amber-500/40';
                    }
                    if (utilRatio > 100) {
                        statusColor = 'text-rose-400';
                        bgColor = 'bg-rose-500/20';
                        borderColor = 'border-rose-500/40';
                    }

                    return (
                        <div
                            key={zone.id}
                            className={`absolute flex flex-col items-center p-3 rounded-2xl border backdrop-blur-md transition-all ${bgColor} ${borderColor}`}
                            style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <MapPin className={`w-5 h-5 mb-1 ${statusColor}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap bg-black/50 px-2 py-1 rounded">
                                {zone.name}
                            </span>

                            <div className="mt-2 w-24 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                <motion.div
                                    className={`h-full ${statusColor.replace('text', 'bg')}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, utilRatio)}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>

                            <div className="flex gap-2 mt-2">
                                {utilRatio > 100 && (
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-rose-400 uppercase bg-rose-500/20 px-1.5 py-0.5 rounded">
                                        <AlertTriangle className="w-3 h-3" /> Overcap
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Legend Overlay */}
                <div className="absolute top-4 left-4 p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-1 mb-2">Total Laydown</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <PackageOpen className="w-4 h-4 text-cyan-400" />
                        <span>{totalMaterials} Units</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
