import { DialogueLine } from '@/store/gameStore';

export const CHAPTER_1_INTRO: DialogueLine[] = [
    { character: 'Mira', text: "We’ve been busy two weeks straight, but… look. The site is a mess.", emotion: 'stressed' },
    { character: 'Rao', text: "Mess? We are building! Client wants it open for the summer festival—two weeks!", emotion: 'angry' },
    { character: 'Isha', text: "I scheduled everything in the plan, Rao. We’ll be fine if we just follow the dates.", emotion: 'happy' },
    { character: 'Old Foreman', text: "Plans on paper are thin like rice paper. On site... it’s mud.", emotion: 'neutral' },
    { character: 'Architect', text: "Foreman is right. A schedule isn't reality. We need to visualize the actual constraints.", emotion: 'neutral' },
    { character: 'Architect', text: "Let's open the Kanban Board. It will show us the truth.", emotion: 'happy' }
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
