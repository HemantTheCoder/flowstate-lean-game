import { DayConfig } from './types';

export const CHAPTER_3_SCHEDULE: DayConfig[] = [
    {
        day: 12,
        title: "Sort (Seiri)",
        description: "The depot is a disaster zone. Time to separate the value from the waste.",
        lesson: "Concept: Sort — If you don't use it, Red Tag it.",
        dialogue: [
            { character: 'Rao', text: "Where is my power drill? I had it here five minutes ago!", emotion: 'angry' },
            { character: 'Mira', text: "Look at this floor, Rao. It's covered in scrap metal, empty pallets, and... is that a broken saw?", emotion: 'stressed' },
            { character: 'Rao', text: "It's a construction site, not a palace! We work, we move on!", emotion: 'angry' },
            { character: 'Advisor', text: "Wait. Rao is right that we move fast, but Mira is right that the mess is slowing us down.", emotion: 'neutral' },
            { character: 'Advisor', text: "If we can't find tools, we aren't working. If we trip over trash, we're in danger.", emotion: 'neutral' },
            { character: 'Advisor', text: "Today, we Sort. If it's broken or useless, it goes to the Red Tag Area.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Red Tag the Waste.",
            action: "Open the Depot. Drag all 'Trash' and 'Broken' items to the Red Tag Area (Zone-Trash)."
        }
    },
    {
        day: 13,
        title: "Set in Order (Seiton)",
        description: "A place for everything, and everything in its place.",
        lesson: "Concept: Set in Order — Visual locations for tools and materials.",
        dialogue: [
            { character: 'Isha', text: "I cleared the trash, but the tools are still piled in a bucket.", emotion: 'neutral' },
            { character: 'Advisor', text: "That's Seiton. 'A place for everything, and everything in its place.'", emotion: 'happy' },
            { character: 'Mira', text: "I've labeled the Material Requisition zone and the Shadow Board for the tools.", emotion: 'happy' },
            { character: 'Rao', text: "Labels? I know where a hammer goes!", emotion: 'angry' },
            { character: 'Advisor', text: "Maybe you do, Rao. But does the new guy? Visual management means anyone can find anything in 30 seconds.", emotion: 'neutral' }
        ],
        briefing: {
            objective: "Organize the Depot.",
            action: "Drag 'Tools' to the Shadow Board and 'Materials' to the Requisition Zone."
        }
    },
    {
        day: 14,
        title: "Shine (Seiso)",
        description: "Cleaning is inspection. Find the leaks before they cause failures.",
        lesson: "Concept: Shine — Safety and preventative maintenance.",
        dialogue: [
            { character: 'Mira', text: "The organization is better, but there's an oil spill near the generator. It's a major slip risk.", emotion: 'stressed' },
            { character: 'Advisor', text: "Shine isn't just cleaning; it's an inspection. When we clean, we notice leaks before they become failures.", emotion: 'neutral' },
            { character: 'Isha', text: "I'll grab the spill kit. Let's make this place safe.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Clean the Workplace.",
            action: "Identify hazards (oil spills, trip wires) on the depot floor and click them to clean them up."
        }
    },
    {
        day: 15,
        title: "Standardize (Seiketsu)",
        description: "Formalize the rules. Don't let the chaos return.",
        lesson: "Concept: Standardize — Checklists and visual standards.",
        dialogue: [
            { character: 'Rao', text: "It's clean. It's organized. Can we go back to building now?", emotion: 'neutral' },
            { character: 'Advisor', text: "Not yet. We need to Standardize. If we don't have a schedule for cleaning, it will be a mess again by Monday.", emotion: 'neutral' },
            { character: 'Isha', text: "I've created a 5S Checklist. Five minutes at the end of every shift.", emotion: 'happy' },
            { character: 'Mira', text: "Standardizing makes the 'Shine' step a habit, not a special event.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Audit the Setup.",
            action: "Ensure all items are currently in their correct zones. Standardize the layout by removing any out-of-place items."
        }
    },
    {
        day: 16,
        title: "Sustain (Shitsuke)",
        description: "The Big Audit. Can you maintain the standard?",
        lesson: "Concept: Sustain — The discipline of long-term optimization.",
        dialogue: [
            { character: 'Advisor', text: "Today is the final test. The Safety Auditor is coming.", emotion: 'neutral' },
            { character: 'Mira', text: "Everything is in its zone. Hazards are cleared. Standards are posted.", emotion: 'happy' },
            { character: 'Rao', text: "I actually found my drill in 5 seconds this morning. Maybe there's something to this...", emotion: 'happy' },
            { character: 'Advisor', text: "That is Sustain. It's the hardest step—keeping the discipline when no one is watching.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Final 5S Audit.",
            action: "Perform a final check. Your organization score will determine your Chapter 3 grade. Click 'Finish Chapter' when ready."
        }
    }
];
