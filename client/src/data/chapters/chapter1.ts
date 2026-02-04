import { DayConfig } from './types';
import { DialogueLine } from '@/store/gameStore';
export type { DayConfig } from './types';

export const WEEK_1_SCHEDULE: DayConfig[] = [
    {
        day: 1,
        title: "The Jam at Juniper Pier",
        description: "The site is congested. Workers are starting multiple activities but finishing nothing, leading to high work-in-progress and low throughput.",
        lesson: "Concept: Kanban & Work In Progress (WIP) Limits.",
        dialogue: [
            { character: 'Mira', text: "Welcome to Juniper Pier, Engineer. The project is behind schedule. We have two weeks until the grand opening.", emotion: 'stressed' },
            { character: 'Rao', text: "My teams are working at 100% capacity! Look at the number of active work fronts!", emotion: 'angry' },
            { character: 'Engineer', text: "Excessive active fronts lead to congestion, Rao. We need to focus on handover and throughput, not just activity.", emotion: 'neutral' },
            { character: 'Engineer', text: "We will implement a Kanban system to limit our Work In Progress (WIP). This will stabilize the site and improve our cycle time.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Establish Stable Flow.",
            action: "Control the 'Doing' column. Maintain WIP limits to prevent site congestion. Focus on finishing current tasks before pulling from the backlog."
        }
    },
    {
        day: 2,
        title: "Supply Chain Variability",
        description: "A logistics failure has delayed the concrete delivery, exposing the vulnerability of our current inventory levels.",
        lesson: "Concept: Material Constraints & Buffer Management.",
        dialogue: [
            { character: 'Mira', text: "Bad news. The concrete mixer is stuck on the highway—overturned truck blocking three lanes.", emotion: 'stressed' },
            { character: 'Rao', text: "What?! The men are standing around! This idle time is a disaster!", emotion: 'angry' },
            { character: 'Engineer', text: "Calm down, Rao. This is 'Resource Starvation'—a classic supply chain failure.", emotion: 'neutral' },
            { character: 'Engineer', text: "In a Push system, we'd panic. But in a Pull system, we pivot to tasks that don't need the delayed material.", emotion: 'neutral' },
            { character: 'Mira', text: "We have site surveys and safety inspections pending. Zero material cost.", emotion: 'neutral' },
            { character: 'Engineer', text: "Exactly. Pull those into the queue. We maintain value-added activity while we wait.", emotion: 'happy' }
        ],
        event: 'supply_delay',
        briefing: {
            objective: "Mitigate Starvation.",
            action: "Material inventory is zero 🚚. Execute 'Management' or 'Prep' tasks (0 Cost) to maintain value-added activity while we wait for the delivery."
        }
    },
    {
        day: 3,
        title: "The Monsoon Drift",
        description: "Unexpected heavy rain disrupts all outdoor structural work, testing your ability to adapt.",
        lesson: "Concept: Variation & Robustness.",
        dialogue: [
            { character: 'Old Foreman', text: "Sky's turning grey. Smells like rain coming down hard.", emotion: 'neutral' },
            { character: 'Isha', text: "But the schedule says 'Erect Steel Beams' today! The crane is already on-site!", emotion: 'stressed' },
            { character: 'Engineer', text: "The rain doesn't care about your schedule, Isha. And neither does gravity when steel is wet.", emotion: 'neutral' },
            { character: 'Mira', text: "Crane operations in rain are a safety violation. We have no choice but to stand down on structural.", emotion: 'stressed' },
            { character: 'Engineer', text: "This is 'Variation'—the unpredictable events that disrupt flow. A robust system has backup work ready.", emotion: 'neutral' },
            { character: 'Engineer', text: "Pull interior fit-out or systems work into the queue. We keep the crew productive, even when the sky disagrees.", emotion: 'happy' }
        ],
        event: 'rain',
        briefing: {
            objective: "Adapt to Variation.",
            action: "Rain 🌧️ blocks all Structural (outdoor) work today. Pivot to Interior or Systems tasks to maintain throughput."
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
