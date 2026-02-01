import { DialogueLine } from '@/store/gameStore';

export interface DayConfig {
    day: number;
    title: string;
    description: string;
    lesson: string; // The Civil Engineering/Lean concept
    dialogue: DialogueLine[];
    event?: 'rain' | 'supply_delay' | 'inspection' | 'decision_push';
    briefing?: {
        objective: string;
        action: string;
    };
}

export const WEEK_1_SCHEDULE: DayConfig[] = [
    {
        day: 1,
        title: "The Jam at Juniper Pier",
        description: "The site is chaotic. Workers are starting everywhere but finishing nothing.",
        lesson: "Concept: Work In Progress (WIP).",
        dialogue: [
            { character: 'Mira', text: "Welcome to Juniper Pier, Engineer. It's a mess. We have 2 weeks to open.", emotion: 'stressed' },
            { character: 'Rao', text: "We are working hard! 100% utilization! Look at all the open trenches!", emotion: 'angry' },
            { character: 'Engineer', text: "Open trenches don't pay bills, Rao. Completed piers do.", emotion: 'neutral' },
            { character: 'Engineer', text: "Today, we simply observe and stop starting new things. Let's set WIP limits.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Visualize the Flow.",
            action: "Open the Kanban Board and follow the Tutorial."
        }
    },
    {
        day: 2,
        title: "The Material Shortage",
        description: "A truck broke down. Concrete delivery is delayed.",
        lesson: "Concept: Constraints & Inventory.",
        dialogue: [
            { character: 'Mira', text: "Bad news. The concrete mixer is stuck on the highway.", emotion: 'stressed' },
            { character: 'Rao', text: "What?! The men are standing idle! This is costing me money!", emotion: 'angry' },
            { character: 'Engineer', text: "This is 'Starvation'. If we had a Pull system, we would see this coming.", emotion: 'neutral' }
        ],
        event: 'supply_delay',
        briefing: {
            objective: "Survivability.",
            action: "You have 0 Materials. Clear existing work from 'Doing' to 'Done' to generate cash."
        }
    },
    {
        day: 3,
        title: "The Monsoon Drift",
        description: "Heavy rains make outdoor painting impossible.",
        lesson: "Concept: Variation & Robustness.",
        dialogue: [
            { character: 'Old Foreman', text: "Sky's turning grey. Smells like rain.", emotion: 'neutral' },
            { character: 'Isha', text: "But the schedule says 'Paint Decking' today! We can't delay!", emotion: 'stressed' },
            { character: 'Engineer', text: "The rain doesn't care about your schedule, Isha.", emotion: 'neutral' }
        ],
        event: 'rain',
        briefing: {
            objective: "Adapt to Variation.",
            action: "Rain slows down work. Don't start new outdoor tasks. Focus on finishing what you can."
        }
    },
    {
        day: 4,
        title: "The Push to Finish",
        description: "Rao wants to rush tasks to look good for the client.",
        lesson: "Concept: Push vs Pull.",
        dialogue: [
            { character: 'Rao', text: "Client visits tomorrow! We need to look busy! Start the landscaping!", emotion: 'angry' },
            { character: 'Mira', text: "We aren't ready! The path isn't paved!", emotion: 'stressed' }
        ],
        event: 'decision_push',
        briefing: {
            objective: "Maintain Discipline.",
            action: "Rao will ask to 'Push' work. Refuse him to avoid Defects (Waste)."
        }
    },
    {
        day: 5,
        title: "The Inspection",
        description: "The Weekly Review. Did we keep our promises?",
        lesson: "Concept: Reliability (PPC).",
        dialogue: [
            { character: 'Isha', text: "The inspector is here. Everyone look sharp.", emotion: 'stressed' },
            { character: 'Old Foreman', text: "Work speaks for itself. If it's done right, no need to hide.", emotion: 'happy' }
        ],
        event: 'inspection',
        briefing: {
            objective: "Review Performance.",
            action: "Clear the board and check your Morale score."
        }
    }
];
