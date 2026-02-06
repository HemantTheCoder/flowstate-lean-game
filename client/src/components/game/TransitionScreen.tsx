import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Target, ClipboardCheck, Hammer } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onComplete: () => void;
    title: string;
    subtitle: string;
    description: string;
    type?: 'planning' | 'review' | 'execution';
    committedTasks?: number;
}

export const TransitionScreen: React.FC<Props> = ({ isOpen, onComplete, title, subtitle, description, type = 'execution', committedTasks = 0 }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const steps = type === 'execution' ? [
        {
            icon: <ClipboardCheck className="w-12 h-12" />,
            title: "Planning Phase Complete",
            content: "You've evaluated your Master Schedule, identified constraints, and removed blockers to make tasks Sound.",
            color: "text-blue-300"
        },
        {
            icon: <Target className="w-12 h-12" />,
            title: `${committedTasks} Tasks Committed`,
            content: "Your Weekly Work Plan is locked. These are your PROMISES - the tasks you said WILL be done this week.",
            color: "text-green-300"
        },
        {
            icon: <Hammer className="w-12 h-12" />,
            title: "Execution Begins",
            content: "Move your committed tasks through the Kanban board: Ready > Doing > Done. Every task you complete is a KEPT promise.",
            color: "text-amber-300"
        }
    ] : [{
        icon: <CheckCircle className="w-12 h-12" />,
        title: title,
        content: description,
        color: "text-blue-300"
    }];

    const currentStep = steps[step];
    const isLastStep = step >= steps.length - 1;

    const handleClick = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setStep(s => s + 1);
        }
    };

    const bgColors: Record<string, string> = {
        planning: 'from-blue-900 via-indigo-900 to-blue-900',
        execution: 'from-slate-900 via-indigo-900 to-slate-900',
        review: 'from-green-900 via-emerald-900 to-green-900'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-[100] bg-gradient-to-br ${bgColors[type]} flex flex-col items-center justify-center p-8 text-white cursor-pointer`}
                    onClick={handleClick}
                >
                    {type === 'execution' && steps.length > 1 && (
                        <div className="absolute top-8 flex gap-2">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-all ${i <= step ? 'bg-white' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-2xl text-center space-y-6"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                                className={`mx-auto ${currentStep.color}`}
                            >
                                {currentStep.icon}
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="uppercase tracking-[0.2em] text-indigo-300 font-bold text-sm"
                            >
                                {subtitle}
                            </motion.div>

                            <motion.h1
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl md:text-6xl font-black"
                            >
                                {currentStep.title}
                            </motion.h1>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed"
                            >
                                {currentStep.content}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="pt-8 flex items-center justify-center gap-2 text-sm text-slate-400"
                            >
                                {isLastStep ? (
                                    <span className="flex items-center gap-2 animate-pulse">
                                        Click to start execution <ArrowRight className="w-4 h-4" />
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 animate-pulse">
                                        Click to continue <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
