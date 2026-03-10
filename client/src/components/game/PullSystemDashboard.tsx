import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { PullBoard } from './chapter4/PullBoard';
import { SiteMapOverlay } from './chapter4/SiteMapOverlay';
import { JITScheduler } from './chapter4/JITScheduler';
import { Package, Truck, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import soundManager from '@/lib/soundManager';

const tabs = [
    { key: 'board' as const, label: 'Pull Board', icon: LayoutDashboard, activeClass: 'bg-indigo-600 text-white shadow-lg' },
    { key: 'site' as const, label: 'Site Flow', icon: Truck, activeClass: 'bg-cyan-600 text-white shadow-lg' },
    { key: 'scheduler' as const, label: 'Scheduler', icon: Package, activeClass: 'bg-emerald-600 text-white shadow-lg' },
] as const;

export const PullSystemDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'board' | 'site' | 'scheduler'>('board');
    const { phase } = useGameStore();

    const activeIndex = tabs.findIndex(t => t.key === activeTab);

    const swipePrev = () => {
        if (activeIndex > 0) {
            soundManager.playSFX('click');
            setActiveTab(tabs[activeIndex - 1].key);
        }
    };
    const swipeNext = () => {
        if (activeIndex < tabs.length - 1) {
            soundManager.playSFX('click');
            setActiveTab(tabs[activeIndex + 1].key);
        }
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-4 p-4 font-sans text-slate-200">
            <div className="flex flex-col md:hidden gap-2">
                <div className="flex gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { soundManager.playSFX('click'); setActiveTab(tab.key); }}
                            className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors min-h-[44px] touch-manipulation ${activeTab === tab.key ? tab.activeClass : 'text-slate-400'}`}
                            data-testid={`button-tab-${tab.key}`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center justify-between px-2">
                    <button
                        onClick={swipePrev}
                        disabled={activeIndex === 0}
                        className={`p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation transition-opacity ${activeIndex === 0 ? 'opacity-30' : 'opacity-70'}`}
                        data-testid="button-tab-prev"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        {activeIndex + 1} / {tabs.length}
                    </span>
                    <button
                        onClick={swipeNext}
                        disabled={activeIndex === tabs.length - 1}
                        className={`p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation transition-opacity ${activeIndex === tabs.length - 1 ? 'opacity-30' : 'opacity-70'}`}
                        data-testid="button-tab-next"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>

            <div id="pull-board-title" className={`flex-1 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl flex-col overflow-hidden ${activeTab === 'board' ? 'flex' : 'hidden'} md:flex`}>
                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-indigo-900/40 to-transparent flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-lg tracking-tight">Trade Pull Board</h2>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-none mt-1">Set Kanban Limits</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <PullBoard />
                </div>
            </div>

            <div className={`flex-1 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl flex-col overflow-hidden ${activeTab === 'site' ? 'flex' : 'hidden'} md:flex`}>
                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-cyan-900/40 to-transparent flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-xl">
                        <Truck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-lg tracking-tight">Zone Map</h2>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none mt-1">Track Delivery & Staging</p>
                    </div>
                </div>
                <div className="flex-1 p-0 relative">
                    <SiteMapOverlay />
                </div>
            </div>

            <div id="jit-scheduler-title" className={`w-full md:w-[350px] bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl flex-col overflow-hidden shadow-2xl ${activeTab === 'scheduler' ? 'flex' : 'hidden'} md:flex`}>
                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-emerald-900/40 to-transparent flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                        <Package className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-lg tracking-tight">JIT Scheduler</h2>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-1">Manage Deliveries</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <JITScheduler />
                </div>
            </div>
        </div>
    );
};
