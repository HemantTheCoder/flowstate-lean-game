import { LucideIcon, Trophy, Target, Zap, Shield, Rocket, Brain, Award } from 'lucide-react';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string; // Tailwind color class for icon
}

export const BADGES: Badge[] = [
    {
        id: 'first_day',
        name: 'First Steps',
        description: 'Complete the tutorial & finish Day 1.',
        icon: Rocket,
        color: 'text-blue-500'
    },
    {
        id: 'flow_master',
        name: 'Flow Master',
        description: 'Complete Chapter 1: The Jam.',
        icon: Zap,
        color: 'text-amber-500'
    },
    {
        id: 'reliable_promise',
        name: 'Reliable Promise',
        description: 'Complete Chapter 2: The Promise.',
        icon: Shield,
        color: 'text-purple-500'
    },
    {
        id: 'lean_thinker',
        name: 'Lean Thinker',
        description: 'Make the correct "Pull" decision on Day 4.',
        icon: Brain,
        color: 'text-emerald-500'
    },
    {
        id: 'perfect_week',
        name: 'Perfect Execution',
        description: 'Achieve 100% PPC in a weekly plan.',
        icon: Target,
        color: 'text-red-500'
    },
    {
        id: 'efficiency_expert',
        name: 'Efficiency Expert',
        description: 'Achieve >80% Flow Efficiency on any day.',
        icon: Award,
        color: 'text-indigo-500'
    }
];
