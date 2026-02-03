import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    isOpen: boolean;
    onComplete: () => void;
    title: string;
    subtitle: string;
    description: string;
    type?: 'planning' | 'review' | 'execution';
}

export const TransitionScreen: React.FC<Props> = ({ isOpen, onComplete, title, subtitle, description, type = 'execution' }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            // Auto-advance after 3 seconds for smooth flow, or let user click?
            // Let's make it click to continue so they read it.
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const bgColors = {
        planning: 'bg-blue-900',
        execution: 'bg-slate-900',
        review: 'bg-green-900'
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-[100] ${bgColors[type]} flex items-center justify-center p-8 text-white`}
                    onClick={onComplete}
                >
                    <div className="max-w-2xl text-center space-y-6 pointer-events-none">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="uppercase tracking-[0.2em] text-blue-300 font-bold"
                        >
                            {subtitle}
                        </motion.div>

                        <motion.h1
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-5xl md:text-7xl font-black"
                        >
                            {title}
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-xl md:text-2xl text-slate-300 max-w-xl mx-auto leading-relaxed"
                        >
                            {description}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, repeat: Infinity, repeatType: 'reverse' }}
                            className="pt-12 text-sm text-slate-500"
                        >
                            Click anywhere to continue...
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
