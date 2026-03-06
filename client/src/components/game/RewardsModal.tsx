import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Medal, Star, Sparkles, Lock, Gift, Crown, Hexagon } from 'lucide-react';
import soundManager from '@/lib/soundManager';

interface RewardsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-slate-900 border border-amber-500/30 w-full max-w-2xl rounded-[2.5rem] shadow-[0_0_100px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col"
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent" />
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 blur-[80px] rounded-full" />

                    {/* Header */}
                    <div className="relative z-10 p-8 sm:p-10 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                <Gift className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Season 1 Rewards</h2>
                                <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Architect Recognition Program</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8 sm:p-10 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">

                        <div className="bg-slate-800/40 border border-white/5 rounded-3xl p-6">
                            <p className="text-slate-300 text-sm font-medium leading-relaxed italic text-center">
                                "To the top performers who master the flow of production—exclusive honors await at the conclusion of Season 1."
                            </p>
                        </div>

                        {/* Reward Tiers */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] pl-2">Elite Tiers</h3>

                            {/* Tier 1-3 */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-slate-800/60 border border-amber-500/30 p-6 rounded-3xl flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                        <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-amber-400 font-black text-sm uppercase tracking-widest">Rank #1 — #3</span>
                                            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/20 uppercase">Legendary</span>
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-2">Prime Architect Package</h4>
                                        <ul className="text-slate-400 text-xs space-y-1.5 font-medium">
                                            <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-amber-400" /> Exclusive "Master Flow" Tool Skins</li>
                                            <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-amber-400" /> Global Hall of Fame Spotlight</li>
                                            <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-amber-400" /> Early Access: High-Rise Case Study</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Tier 4-10 */}
                            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-700/50 border border-slate-600 flex items-center justify-center shrink-0">
                                    <Hexagon className="w-8 h-8 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-slate-400 font-black text-sm uppercase tracking-widest">Rank #4 — #10</span>
                                        <span className="bg-slate-700/50 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-white/5 uppercase">Master</span>
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-2">Senior Architect Badge</h4>
                                    <ul className="text-slate-400 text-xs space-y-1.5 font-medium">
                                        <li className="flex items-center gap-2"><Star className="w-3 h-3 text-slate-500" /> Profile Medal & Avatar Frame</li>
                                        <li className="flex items-center gap-2"><Star className="w-3 h-3 text-slate-500" /> Premium Dashboard Theme Unlock</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Coming Soon Footer */}
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex items-center gap-4">
                            <Lock className="w-6 h-6 text-amber-500/50" />
                            <div>
                                <p className="text-amber-500 font-black text-xs uppercase tracking-widest">Reward Calculation in Progress</p>
                                <p className="text-slate-500 text-[10px] font-bold mt-1">Status: SEASON 1 ACTIVE — Distributions begin in 24 Days.</p>
                            </div>
                        </div>

                    </div>

                    {/* Footer Action */}
                    <div className="relative z-10 p-8 pt-0">
                        <button
                            onClick={onClose}
                            className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl text-sm uppercase tracking-[0.2em] hover:bg-amber-50 transition-colors shadow-lg active:scale-[0.98]"
                        >
                            Back to Rankings
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
