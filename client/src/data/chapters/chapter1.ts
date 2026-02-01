import { DialogueLine } from '@/store/gameStore';

export interface DayConfig {
    day: number;
    title: string;
    description: string;
    lesson: string; // The Civil Engineering/Lean concept
    dialogue: DialogueLine[];
    event?: 'rain' | 'supply_delay' | 'inspection' | 'decision_push';
}

export const WEEK_1_SCHEDULE: DayConfig[] = [
    {
        day: 1,
        title: "The Jam at Juniper Pier",
        description: "The site is chaotic. Workers are starting everywhere but finishing nothing.",
        lesson: "Concept: Work In Progress (WIP). Limit what you start to finish faster.",
        dialogue: [
            { character: 'Mira', text: "Welcome to Juniper Pier, Architect. It's a mess. We have 2 weeks to open.", emotion: 'stressed' },
            { character: 'Rao', text: "We are working hard! 100% utilization! Look at all the open trenches!", emotion: 'angry' },
            { character: 'Architect', text: "Open trenches don't pay bills, Rao. Completed piers do.", emotion: 'neutral' },
            { character: 'Architect', text: "Today, we simply observe and stop starting new things. Let's set WIP limits.", emotion: 'happy' }
        ]
    },
    {
        day: 2,
        title: "The Material Shortage",
        description: "A truck broke down. Concrete delivery is delayed.",
        lesson: "Concept: Inventory & Constraints. You can't build without materials.",
        dialogue: [
            { character: 'Mira', text: "Bad news. The concrete mixer is stuck on the highway.", emotion: 'stressed' },
            { character: 'Rao', text: "What?! The men are standing idle! This is costing me money!", emotion: 'angry' },
            { character: 'Architect', text: "This is 'Starvation'. If we had a Pull system, we would see this coming.", emotion: 'neutral' },
            { character: 'Architect', text: "Don't just look busy. Do prep work for tomorrow. Clean the site.", emotion: 'neutral' }
        ],
        event: 'supply_delay'
    },
    {
        day: 3,
        title: "The Monsoon Drift",
        description: "Heavy rains make outdoor painting impossible.",
        lesson: "Concept: Variation. Weather is inevitable; our process must be robust.",
        dialogue: [
            { character: 'Old Foreman', text: "Sky's turning grey. Smells like rain.", emotion: 'neutral' },
            { character: 'Isha', text: "But the schedule says 'Paint Decking' today! We can't delay!", emotion: 'stressed' },
            { character: 'Architect', text: "The rain doesn't care about your schedule, Isha.", emotion: 'neutral' },
            { character: 'Architect', text: "Stop outdoor work. Move crew to the indoor electrical tasks. Flow around the obstacle.", emotion: 'happy' }
        ],
        event: 'rain'
    },
    {
        day: 4,
        title: "The Push to Finish",
        description: "Rao wants to rush tasks to look good for the client.",
        lesson: "Concept: Push vs Pull. Rushing creates defects.",
        dialogue: [
            { character: 'Rao', text: "Client visits tomorrow! We need to look busy! Start the landscaping!", emotion: 'angry' },
            { character: 'Mira', text: "We aren't ready! The path isn't paved!", emotion: 'stressed' },
            { character: 'Architect', text: "If we start landscaping now, we'll just trample the mud. It's waste.", emotion: 'neutral' }
        ],
        event: 'decision_push'
    },
    {
        day: 5,
        title: "The Inspection",
        description: "The Weekly Review. Did we keep our promises?",
        lesson: "Concept: Reliability. PPC (Percent Plan Complete).",
        dialogue: [
            { character: 'Isha', text: "The inspector is here. Everyone look sharp.", emotion: 'stressed' },
            { character: 'Old Foreman', text: "Work speaks for itself. If it's done right, no need to hide.", emotion: 'happy' },
            { character: 'Architect', text: "Let's review our flow. Did we finish what we started?", emotion: 'neutral' }
        ],
        event: 'inspection'
    }
];
