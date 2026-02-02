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
            action: "Clear the 'Doing' column. You DON'T need to empty the Backlog today! Just stabilize the work."
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
            objective: "Survive Shortage.",
            action: "Materials are ZERO 🚚. Do 'Prep' tasks (0 Cost) if possible. When you can't work, End Day."
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
            objective: "Adapt to Rain.",
            action: "Rain 🌧️ blocks Structural work. Do Indoor tasks only. If blocked, End Day."
        }
    },
    {
        day: 4,
        title: "The Push to Finish",
        description: "Rao wants to rush tasks to look good for the client.",
        lesson: "Concept: Push vs Pull.",
        dialogue: [
            { character: 'Rao', text: "The Client's Chief Inspector is coming tomorrow! I walked the site—it looks empty!", emotion: 'angry' },
            { character: 'Mira', text: "We are prepping drainage, Rao. Use your eyes. Digging now creates a mud pit.", emotion: 'stressed' },
            { character: 'Rao', text: "I don't care about mud! I care about optics! If the Inspector sees idle workers, we are fired!", emotion: 'angry' },
            { character: 'Rao', text: "PUSH everyone to the South Lawn! Make it look busy! Now!", emotion: 'angry' },
            { character: 'Engineer', text: "That's false demand. Pushing unready work creates 'Waste'—rework later.", emotion: 'neutral' },
            { character: 'Rao', text: "Waste? I see completed tasks! Make a choice, Engineer. My way, or the highway.", emotion: 'angry' }
        ],
        event: 'decision_push',
        briefing: {
            objective: "Resist Pressure.",
            action: "Rao wants to 'Push'. REFUSE him! Choose 'Pull' logic to keep the site clean for the Inspector."
        }
    },
    {
        day: 5,
        title: "The Inspection",
        description: "The Client Inspector arrives to judge our progress.",
        lesson: "Concept: Reliability (PPC).",
        dialogue: [
            { character: 'Isha', text: "She's here. The Inspector. Everyone look sharp.", emotion: 'stressed' },
            { character: 'Rao', text: "Just smile and show her the activity.", emotion: 'neutral' }
        ],
        event: 'inspection',
        briefing: {
            objective: "Review Performance.",
            action: "The Inspector will judge your flow. Did you Push (Waste) or Pull (Value)?"
        }
    }
];

export const DAY_5_GOOD: DialogueLine[] = [
    { character: 'Inspector', text: "I see a clean site. No piles of material blocking paths. Workers are focused.", emotion: 'happy' },
    { character: 'Rao', text: "Yes! exactly as planned! We run a tight ship!", emotion: 'happy' },
    { character: 'Inspector', text: "Your Lead Engineer deserves credit, Rao. They resisted the urge to clutter the site for show.", emotion: 'happy' },
    { character: 'Inspector', text: "This is true 'Flow'. Phase 1 is officially APPROVED.", emotion: 'happy' },
    { character: 'Mira', text: "Look around! The crew is happy, the site is safe, and we actually finished the foundation ahead of schedule.", emotion: 'happy' },
    { character: 'Engineer', text: "Thank you. Flow is about finishing, not just starting.", emotion: 'happy' },
    { character: 'Inspector', text: "But Flow is not enough if you can't be RELIABLE.", emotion: 'neutral' },
    { character: 'Inspector', text: "Chapter 2 is about 'Promises'. Can you deliver what you plan, even when the storm hits? See you at the Mall Project.", emotion: 'happy' }
];

export const DAY_5_BAD: DialogueLine[] = [
    { character: 'Inspector', text: "What is this mess? Why is the landscape dug up when the drains aren't in?", emotion: 'angry' },
    { character: 'Rao', text: "We... uh... we wanted to show progress!", emotion: 'stressed' },
    { character: 'Inspector', text: "This isn't progress. This is chaos. Now you have to redo the grading.", emotion: 'angry' },
    { character: 'Inspector', text: "I am flagging this project as 'At Risk'. Clean this up, or funding stops.", emotion: 'angry' },
    { character: 'Rao', text: "You embarrassed me, Engineer! I told you to make it look GOOD, not messy!", emotion: 'angry' }
];
