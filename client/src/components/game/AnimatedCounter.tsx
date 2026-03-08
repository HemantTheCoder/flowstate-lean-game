import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
    target: number;
    duration?: number;
    suffix?: string;
    className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    target,
    duration = 1500,
    suffix = '%',
    className = '',
}) => {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * target));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration]);

    return (
        <span data-testid="animated-counter" className={className}>
            {display}{suffix}
        </span>
    );
};

interface PerformanceGradeProps {
    score: number;
    className?: string;
}

const getGradeInfo = (score: number) => {
    if (score >= 90) return { letter: 'S', color: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.6)' };
    if (score >= 70) return { letter: 'A', color: 'text-green-400', glow: 'rgba(74, 222, 128, 0.6)' };
    if (score >= 50) return { letter: 'B', color: 'text-blue-400', glow: 'rgba(96, 165, 250, 0.6)' };
    if (score >= 30) return { letter: 'C', color: 'text-orange-400', glow: 'rgba(251, 146, 60, 0.6)' };
    return { letter: 'D', color: 'text-red-400', glow: 'rgba(248, 113, 113, 0.6)' };
};

export const PerformanceGrade: React.FC<PerformanceGradeProps> = ({
    score,
    className = '',
}) => {
    const { letter, color, glow } = getGradeInfo(score);

    return (
        <motion.div
            data-testid="performance-grade"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
            className={`inline-flex items-center justify-center ${className}`}
        >
            <motion.span
                className={`text-5xl font-black ${color} drop-shadow-lg`}
                animate={{
                    textShadow: [
                        `0 0 8px ${glow}`,
                        `0 0 20px ${glow}`,
                        `0 0 8px ${glow}`,
                    ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                {letter}
            </motion.span>
        </motion.div>
    );
};
