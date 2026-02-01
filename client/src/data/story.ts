import { DialogueLine } from '@/store/gameStore';

export const CHAPTER_1_INTRO: DialogueLine[] = [
    { character: 'Mira', text: "Thank goodness you're here, Architect! The site is a chaos. We are behind schedule!", emotion: 'stressed' },
    { character: 'Architect', text: "Chaos is just 'Waste' in disguise, Mira. Tell me, what are the workers doing?", emotion: 'neutral' },
    { character: 'Rao', text: "Working!! We are pouring concrete, fixing steel, moving bricks! Everyone is busy 100% of the time!", emotion: 'angry' },
    { character: 'Architect', text: "That is the problem, Rao. 'Busy' does not mean 'Productive'.", emotion: 'neutral' },
    { character: 'Architect', text: "In Lean Construction, we focus on FLOW, not just busyness. If a worker builds a wall but the painter isn't ready, that wall is just inventory. It's waste.", emotion: 'neutral' },
    { character: 'Mira', text: "So... we shouldn't work hard?", emotion: 'neutral' },
    { character: 'Architect', text: "Work smart. We need a KANBAN system. It visualizes the work.", emotion: 'happy' },
    { character: 'Architect', text: "It stops us from starting too many things (WIP) and forces us to finish what we started.", emotion: 'neutral' },
    { character: 'Architect', text: "Let's open the Board. I'll show you how to 'Pull' value.", emotion: 'happy' }
];

export const CHAPTER_1_MID: DialogueLine[] = [
    { character: 'Architect', text: "Stop! Look at the 'Doing' column. It's full.", emotion: 'stressed' },
    { character: 'Rao', text: "So? Start another task! I have idle men!", emotion: 'angry' },
    { character: 'Architect', text: "No. If you start more, you spread resources thin. Mistakes happen. Accidents happen.", emotion: 'neutral' },
    { character: 'Architect', text: "This is Little's Law: The more things you have in progress, the slower everything gets.", emotion: 'neutral' },
    { character: 'Architect', text: "Focus on moving a card to 'Done' first. Clear the bottleneck.", emotion: 'happy' }
];

export const CHAPTER_1_END: DialogueLine[] = [
    { character: 'Rao', text: "Okay... I admit. The site is calmer. And we actually got paid for the foundation today.", emotion: 'happy' },
    { character: 'Mira', text: "I can see exactly what material is needed for tomorrow because the 'Ready' column shows it.", emotion: 'happy' },
    { character: 'Architect', text: "That is Transparency. But we are just reacting.", emotion: 'neutral' },
    { character: 'Architect', text: "To really master Lean, we need Reliability. We need the 'Last Planner System'.", emotion: 'neutral' },
    { character: 'Architect', text: "Tomorrow, we stop guessing. We start Planning.", emotion: 'happy' }
];
