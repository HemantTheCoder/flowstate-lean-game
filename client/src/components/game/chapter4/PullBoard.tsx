import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Settings, CheckCircle2, Factory, Activity } from 'lucide-react';
import soundManager from '@/lib/soundManager';

const TRADES = [
    { id: 'carpentry', name: 'Carpentry', icon: Factory, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { id: 'finish', name: 'Finishing', icon: CheckCircle2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
    { id: 'electrical', name: 'Electrical', icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
];

export const PullBoard: React.FC = () => {
    const kanbanLimits = useGameStore(s => s.kanbanLimits);
    const setKanbanLimit = useGameStore(s => s.setKanbanLimit);

    const handleLimitChange = (tradeId: string, value: number) => {
        setKanbanLimit(tradeId, value);
        soundManager.playSFX('click', 0.5);
    };

    return (
        <div id="tutorial-wip-limits" className="space-y-6">
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Pull systems restrict work from starting until downstream processes signal capacity. Adjust WIP (Work In Progress) limits below to manage site congestion.
            </p>

            {TRADES.map((trade) => {
                const Icon = trade.icon;
                const currentLimit = kanbanLimits[trade.id] || 0;

                return (
                    <div key={trade.id} className={`p-4 rounded-xl border ${trade.border} bg-slate-950/40 relative overflow-hidden group`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${trade.bg} ${trade.border} border`}>
                                    <Icon className={`w-4 h-4 ${trade.color}`} />
                                </div>
                                <h3 className="text-white font-bold text-sm tracking-wide">{trade.name}</h3>
                            </div>
                            <div className="px-3 py-1 bg-slate-900 rounded-full border border-slate-700 font-mono text-xs text-slate-300">
                                WIP Limit: <span className="text-white font-bold ml-1">{currentLimit}</span>
                            </div>
                        </div>

                        {/* Tappable 10-segment row (was a range slider - a 2px drag target
                            is unreliable on touch; tapping a segment sets the limit directly) */}
                        <div className="relative z-10 flex gap-1.5">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleLimitChange(trade.id, i + 1)}
                                    className={`h-11 flex-1 rounded text-[10px] flex items-center justify-center font-bold transition-all touch-manipulation ${i < currentLimit
                                        ? `${trade.bg} ${trade.color} border ${trade.border}`
                                        : 'bg-slate-900/50 border border-slate-800 text-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    {i < currentLimit && `#${i + 1}`}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold px-1 relative z-10">
                            <span>1 (Strict)</span>
                            <span>10 (Overcrowded)</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
