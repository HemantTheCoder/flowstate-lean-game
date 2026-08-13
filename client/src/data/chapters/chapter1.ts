import { DayConfig } from './types';
import { DialogueLine } from '@/store/gameStore';
import { GAME_CONSTANTS } from '@/config/constants';
export type { DayConfig } from './types';

export const WEEK_1_SCHEDULE: DayConfig[] = [
    {
        day: 1,
        title: `The Jam at ${GAME_CONSTANTS.CHAPTER_1_PROJECT}`,
        description: "The site is a total mess. Everyone is busy starting new things, but nothing is getting finished. This 'traffic jam' of tasks is slowing us down to a crawl.",
        lesson: "Concept: Kanban & Work In Progress (WIP) Limits.",
        dialogue: [
            { character: 'Mira', text: `Welcome to the construction site of ${GAME_CONSTANTS.CHAPTER_1_PROJECT}, Lean Champion. The project is behind schedule. We have two weeks until the ${GAME_CONSTANTS.CHAPTER_1_MILESTONE}.`, emotion: 'stressed' },
            { character: 'Rao', text: "My teams are working at 100% capacity! Look at the number of active work fronts!", emotion: 'angry' },
            { character: 'Engineer', text: "Excessive active fronts lead to congestion, Rajiv. We need to focus on handover and throughput (how many tasks we finish), not just activity.", emotion: 'neutral' },
            { character: 'Engineer', text: "We will implement a Kanban system to limit our WIP — Work In Progress. This restricts how many things we start at once so we don't stall the site.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Establish Stable Flow.",
            action: "Control the 'In Progress' (Doing) column. Keep your Work-In-Progress (WIP) low — think of it as a maximum site capacity. Focus on finishing current work before pulling new tasks from the Backlog (To-Do List)."
        }
    },
    {
        day: 2,
        title: "Supply Chain Variability",
        description: "A concrete truck overturned on the highway. We have no materials to continue structural work, forcing us to find other productive ways to use our crews.",
        lesson: "Concept: Material Constraints & Buffer Management.",
        dialogue: [
            { character: 'Mira', text: "Bad news. The concrete mixer is stuck on the highway—overturned truck blocking three lanes.", emotion: 'stressed' },
            { character: 'Rao', text: "What?! The men are standing around! This idle time is a disaster!", emotion: 'angry' },
            { character: 'Engineer', text: "Calm down, Rajiv. This is 'Resource Starvation' — the waste that happens when crews have to wait because they're missing materials.", emotion: 'neutral' },
            { character: 'Engineer', text: "In a 'Push' system, we'd panic. But in a 'Pull' system, we only pull work that's actually ready to be done.", emotion: 'neutral' },
            { character: 'Mira', text: "We have site surveys and safety inspections pending. Zero material cost.", emotion: 'neutral' },
            { character: 'Engineer', text: "Exactly. Pull those into the queue. We maintain value-added activity while we wait for the concrete.", emotion: 'happy' }
        ],
        event: 'supply_delay',
        briefing: {
            objective: "Mitigate Starvation.",
            action: "Material inventory is zero — you have no concrete. Execute 'Management' or 'Prep' tasks (0 Material Cost) to keep crews busy with high-value work while we wait for the delivery."
        }
    },
    {
        day: 3,
        title: "The Monsoon Drift",
        description: "The clouds have opened up. Heavy rain makes outdoor work dangerous and impossible, so we must pivot to indoor tasks to keep our momentum.",
        lesson: "Concept: Variation & Robustness.",
        dialogue: [
            { character: 'Old Foreman', text: "Sky's turning grey. Smells like rain coming down hard.", emotion: 'neutral' },
            { character: 'Isha', text: "But the schedule says 'Erect Steel Beams' today! The crane is already on-site!", emotion: 'stressed' },
            { character: 'Engineer', text: "The rain doesn't care about your schedule, Isha. And neither does gravity when steel is wet.", emotion: 'neutral' },
            { character: 'Mira', text: "Crane operations in rain are a safety violation. We have no choice but to stand down on structural.", emotion: 'stressed' },
            { character: 'Engineer', text: "This is 'Variation' — the unpredictable events like weather that disrupt our flow. A robust system always has 'backup' indoor work ready.", emotion: 'neutral' },
            { character: 'Engineer', text: "Pull interior fit-out or systems work into the queue. We keep the crew productive, even when the sky disagrees.", emotion: 'happy' }
        ],
        event: 'rain',
        briefing: {
            objective: "Adapt to Variation.",
            action: "Rain blocks all Structural (outdoor) work today. Pivot to Interior or Systems tasks (which aren't affected by rain) to keep the project moving forward."
        }
    },
    {
        day: 4,
        title: "The Push to Finish",
        description: "Rajiv is panicking about the upcoming inspection. He wants us to start 'fake' work just to look busy, even if it's not ready yet.",
        lesson: "Concept: Push vs Pull.",
        dialogue: [
            { character: 'Rao', text: "The Client's Chief Inspector is coming tomorrow! I walked the site—it looks empty!", emotion: 'angry' },
            { character: 'Mira', text: "We are prepping drainage, Rajiv. Use your eyes. Digging now creates a mud pit.", emotion: 'stressed' },
            { character: 'Rao', text: "I don't care about mud! I care about optics! If the Inspector sees idle workers, we are fired!", emotion: 'angry' },
            { character: 'Rao', text: "PUSH everyone to the South Lawn! Make it look busy! Now!", emotion: 'angry' },
            { character: 'Engineer', text: "That's false demand. Rushing unready work creates 'Waste' — which just means we'll have to pay to fix the mistakes later.", emotion: 'neutral' },
            { character: 'Rao', text: "Waste? I see completed tasks! Make a choice, Engineer. My way, or the highway.", emotion: 'angry' }
        ],
        event: 'decision_push',
        briefing: {
            objective: "Resist Pressure.",
            action: "Rajiv wants to 'Push' unready work just to look busy. REFUSE him! Choose the 'Pull' logic to keep the site clean and organized for the Inspector."
        }
    },
    {
        day: 5,
        title: "The Inspection",
        description: "The big day is here. The Chief Inspector is walking the site to see if we've built a stable, reliable workflow or just a chaotic mess.",
        lesson: "Concept: Reliability (PPC).",
        dialogue: [
            { character: 'Isha', text: "She's here. The Inspector. Everyone look sharp.", emotion: 'stressed' },
            { character: 'Rao', text: "Just smile and show her the activity.", emotion: 'neutral' }
        ],
        event: 'inspection',
        briefing: {
            objective: "Review Performance.",
            action: "The Manager will judge your project flow. Did you work on ready tasks (Value) or just create a mess to look busy (Waste)?"
        }
    }
];

export const DAY_5_GOOD: DialogueLine[] = [
    { character: 'Inspector', text: "I see a clean site. No piles of material blocking paths. Workers are focused.", emotion: 'happy' },
    { character: 'Rao', text: "Yes! exactly as planned! We run a tight ship!", emotion: 'happy' },
    { character: 'Inspector', text: "Your Lead Engineer deserves credit, Rajiv. They resisted the urge to clutter the site for show.", emotion: 'happy' },
    { character: 'Inspector', text: "This is true 'Flow'. Phase 1 is officially APPROVED. I've authorized your Phase Bonus of ₹5,000 to be added to the project budget immediately.", emotion: 'happy' },
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
