import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Package, Truck, AlertCircle, Clock, Plus, Minus } from 'lucide-react';
import soundManager from '@/lib/soundManager';
import { v4 as uuidv4 } from 'uuid';

const MATERIAL_TYPES = [
    { id: 'timber', name: 'Timber & Framework', baseLead: 1, cost: 500 },
    { id: 'pipes', name: 'Plumbing & Pipes', baseLead: 2, cost: 800 },
    { id: 'electrical', name: 'Electrical Wiring', baseLead: 1, cost: 1200 },
];

export const JITScheduler: React.FC = () => {
    const {
        day,
        buffers,
        setBuffer,
        materialsInventory,
        orderMaterial,
        deliveries,
        funds
    } = useGameStore();

    const [selectedMat, setSelectedMat] = useState(MATERIAL_TYPES[0]);
    const [orderQty, setOrderQty] = useState(10);
    const [isExpediting, setIsExpediting] = useState(false);

    const handleOrder = () => {
        const totalCost = selectedMat.cost * (orderQty / 10) * (isExpediting ? 1.5 : 1);
        if (funds < totalCost) {
            soundManager.playSFX('alert');
            return;
        }

        const eta = day + (isExpediting ? Math.max(0, selectedMat.baseLead - 1) : selectedMat.baseLead);

        // Deduct funds immediately (handled by generic state for now, assuming orderMaterial handles it or we do it here)
        // Simplification: we'll just track deliveries for the demo.
        useGameStore.setState(s => ({ funds: s.funds - totalCost }));
        orderMaterial(selectedMat.id, orderQty, eta);

        soundManager.playSFX('success');
        setOrderQty(10); // Reset UI
    };

    return (
        <div id="tutorial-jit-scheduler" className="space-y-6 flex flex-col h-full">
            {/* Context / Lore */}
            <p className="text-xs text-slate-400 leading-relaxed">
                Just-In-Time delivery reduces inventory holdings. Order materials precisely when needed. Set small safety buffers to handle supply shocks.
            </p>

            {/* Inventory Overview */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Current On-Site Level</h3>
                {MATERIAL_TYPES.map(mat => {
                    const currentStock = materialsInventory[mat.id] || 0;
                    const bufferTarget = buffers[mat.id] || 0;
                    const status = currentStock <= bufferTarget ? 'text-rose-400' : 'text-emerald-400';

                    return (
                        <div key={mat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                            <div>
                                <span className="text-sm font-bold text-slate-300">{mat.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs font-mono font-bold ${status}`}>
                                        {currentStock} units
                                    </span>
                                    {currentStock <= bufferTarget && currentStock > 0 && (
                                        <AlertCircle className="w-3 h-3 text-amber-500" />
                                    )}
                                </div>
                            </div>

                            {/* Buffer Control */}
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Safety Buffer</span>
                                <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700 font-mono text-xs">
                                    <button
                                        onClick={() => { setBuffer(mat.id, Math.max(0, bufferTarget - 5)); soundManager.playSFX('click', 0.5); }}
                                        className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 touch-manipulation"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-6 text-center text-slate-300">{bufferTarget}</span>
                                    <button
                                        onClick={() => { setBuffer(mat.id, bufferTarget + 5); soundManager.playSFX('click', 0.5); }}
                                        className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 touch-manipulation"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex-1 mt-4 border-t border-white/10 pt-6">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Schedule New Delivery
                </h3>

                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-inner space-y-4">
                    {/* Material Select */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Material</label>
                        <select
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 min-h-11 text-base md:text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                            value={selectedMat.id}
                            onChange={(e) => setSelectedMat(MATERIAL_TYPES.find(m => m.id === e.target.value)!)}
                        >
                            {MATERIAL_TYPES.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Quantity</label>
                            <input
                                type="number"
                                min="10"
                                step="10"
                                value={orderQty}
                                onChange={(e) => setOrderQty(parseInt(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base md:text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Logistics</label>
                            <button
                                onClick={() => setIsExpediting(!isExpediting)}
                                className={`w-full min-h-11 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${isExpediting ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                            >
                                {isExpediting ? 'Expedite (1.5x Cost)' : 'Standard Delivery'}
                            </button>
                        </div>
                    </div>

                    {/* Summary & Dispatch */}
                    <div className="bg-black/40 rounded-xl p-3 flex items-center justify-between border border-white/5">
                        <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Est. Arrival</span>
                            <span className="text-sm font-bold text-emerald-400 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Day {day + (isExpediting ? Math.max(0, selectedMat.baseLead - 1) : selectedMat.baseLead)}
                            </span>
                        </div>
                        <button
                            onClick={handleOrder}
                            disabled={orderQty <= 0}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Dispatch Truck
                        </button>
                    </div>
                </div>
            </div>

            {/* Pending Deliveries Board */}
            {deliveries.length > 0 && (
                <div className="pt-4 mt-auto">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                        <span>In Transit</span>
                        <span className="text-emerald-400">{deliveries.length} Trucks</span>
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {deliveries.map(d => {
                            const mat = MATERIAL_TYPES.find(m => m.id === d.material);
                            return (
                                <div key={d.id} className="flex justify-between items-center bg-slate-900/40 p-2 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs text-slate-300 font-bold">{mat?.name}</span>
                                    </div>
                                    <div className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                                        ETA Day {d.etaDay} ({d.amount}u)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
