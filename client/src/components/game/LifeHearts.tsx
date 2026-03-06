import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export function LifeHearts() {
    const { lives } = useGameStore();

    return (
        <div className="flex items-center gap-1.5 bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/5 shadow-inner">
            <AnimatePresence mode="popLayout">
                {[1, 2, 3].map((heart) => (
                    <motion.div
                        key={heart}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                            scale: heart <= lives ? 1 : 0.85,
                            opacity: heart <= lives ? 1 : 0.3,
                            filter: heart <= lives ? 'drop-shadow(0 0 8px rgba(244,63,94,0.4))' : 'grayscale(1)'
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <Heart
                            className={`w-5 h-5 ${heart <= lives ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
            <div className="ml-1 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:block">
                System Health
            </div>
        </div>
    );
}
