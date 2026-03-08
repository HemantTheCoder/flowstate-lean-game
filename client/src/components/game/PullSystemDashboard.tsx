import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { PullBoard } from './chapter4/PullBoard';
import { SiteMapOverlay } from './chapter4/SiteMapOverlay';
import { JITScheduler } from './chapter4/JITScheduler';
import { Package, Truck, LayoutDashboard } from 'lucide-react';
import soundManager from '@/lib/soundManager';

export const PullSystemDashboard: React.FC = () => {
    // Top-level layout container for Chapter 4
    // 3 Columns: Kanban (Pull Board) | Site Map (Visual staging) | JIT Scheduler (Inventory & Orders)

    const [activeTab, setActiveTab] = useState<'board' | 'site' | 'scheduler'>('board');
    const { phase } = useGameStore();

    // In a wider screen, we might show columns side-by-side, but tabs work better safely for responsiveness
    // For now, let's make it a tabbed interface on smaller screens, and grid on larger screens
    // But since the user wants a 3-panel layout, we'll strive for a flexible grid.

    return (
        <div className="w-full h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 p-4 font-sans text-slate-200">
            {/* Desktop: 3 Columns. Mobile: Tabbed */}

            {/* Mobile Tab Selectors */}
            <div className="flex md:hidden gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                <button
                    onClick={() => { soundManager.playSFX('click'); setActiveTab('board'); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'board' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'}`}
                >
                    <LayoutDashboard className="w-4 h-4" /> Pull Board
                </button>
                <button
                    onClick={() => { soundManager.playSFX('click'); setActiveTab('site'); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'site' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'}`}
                >
                    <Truck className="w-4 h-4" /> Site Flow
                </button>
                <button
                    onClick={() => { soundManager.playSFX('click'); setActiveTab('scheduler'); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'scheduler' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'}`}
                >
                    <Package className="w-4 h-4" /> Scheduler
                </button>
            </div>

            {/* Left Column: Pull Board (Kanban limits and flow) */}
            <div className={`flex-1 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden ${(activeTab === 'board' || typeof window !== 'undefined' && window.innerWidth >= 768) ? 'flex' : 'hidden md:flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-indigo-900/40 to-transparent flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-lg tracking-tight">Trade Pull Board</h2>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-none mt-1">Set Kanban Limits</p>
                    </div>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <PullBoard />
                </div>
            </div>

            {/* Center Column: Site Map (Visual flow) */}
            <div className={`flex-1 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden ${(activeTab === 'site' || typeof window !== 'undefined' && window.innerWidth >= 768) ? 'flex' : 'hidden md:flex'}`}>
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

            {/* Right Column: JIT Scheduler (Logistics and inventory) */}
            <div className={`w-full md:w-[350px] bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden shadow-2xl ${(activeTab === 'scheduler' || typeof window !== 'undefined' && window.innerWidth >= 768) ? 'flex' : 'hidden md:flex'}`}>
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
