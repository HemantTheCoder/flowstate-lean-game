import { DialogueLine } from '@/store/gameStore';

export interface DayConfig {
    day: number;
    title: string;
    description: string;
    event?: string;
    dialogue: DialogueLine[];
}

export const WEEK_2_SCHEDULE: DayConfig[] = [
    {
        day: 6,
        title: "The Overpromised Mall",
        description: "Reviewing the Master Plan. Constraints are hidden everywhere.",
        dialogue: [
            { character: 'Client', text: "We have announced the soft opening already. Next Friday. You'll be ready, yes?", emotion: 'neutral' },
            { character: 'Isha', text: "Yes! Everything is already planned.", emotion: 'happy' },
            { character: 'Mira', text: "(quietly) Planned... or promised?", emotion: 'worried' },
            { character: 'Rao', text: "This is big visibility. Let's go all in.", emotion: 'happy' },
            { character: 'Advisor', text: "Welcome to the Planning Room. We need the Last Planner System.", emotion: 'neutral' },
            { character: 'Advisor', text: "The Master Schedule shows what we SHOULD do. The Lookahead checks if we CAN do it (Constraints).", emotion: 'neutral' },
            { character: 'Advisor', text: "Only move tasks to 'Weekly Plan' if they are fully sound. That is what we WILL do.", emotion: 'happy' }
        ],
        // Special Phase: Planning
    },
    {
        day: 7,
        title: "Execution Starts",
        description: "The team starts working on the committed plan.",
        dialogue: [
            // Day 7 - Intro to pulling work
            { character: 'Foreman', text: "The crew appreciates the clear plan. We know exactly what to do today.", emotion: 'happy' },
            { character: 'Isha', text: "It feels slower than usual... but smoother.", emotion: 'neutral' },
            { character: 'Advisor', text: "That is Flow. Fast is not rushing. Fast is never stopping.", emotion: 'happy' }
        ]
    },
    {
        day: 8,
        title: "The Surprise",
        description: "Hidden constraints emerge.",
        dialogue: [
            { character: 'Foreman', text: "Boss, the electrical Inspector just showed up. We don't have the approval papers!", emotion: 'stressed' },
            { character: 'Isha', text: "I thought we had that! It was green on the plan!", emotion: 'worried' },
            { character: 'Advisor', text: "We failed our Constraint Analysis. We hoped, we didn't check.", emotion: 'neutral' },
            { character: 'Advisor', text: "A task with a red constraint is NOT Ready. Never promise what you can't start.", emotion: 'angry' }
        ],
        event: 'surprise_inspection'
    },
    {
        day: 9,
        title: "Rao's Pressure",
        description: "Management wants to push more work.",
        dialogue: [
            { character: 'Rao', text: "The client is asking about the Roof Café. Promise it for tomorrow.", emotion: 'neutral' },
            { character: 'Mira', text: "We don't have the tiles. If we promise, we fail.", emotion: 'worried' },
            { character: 'Rao', text: "Just promise it! We'll figure it out.", emotion: 'angry' },
            { character: 'Advisor', text: "Protect the plan, Engineer. Reliability is trust. Don't break it.", emotion: 'neutral' }
        ],
        event: 'rao_push_ch2'
    },
    {
        day: 10,
        title: "The Reckoning",
        description: "Weekly Review. Did we keep our promises?",
        dialogue: [
            { character: 'Advisor', text: "It's Friday. Let's calculate our PPC (Percent Plan Complete).", emotion: 'neutral' },
            { character: 'Advisor', text: "This metric tells us how reliable we are. High PPC = High Trust.", emotion: 'happy' }
        ]
        // Triggers PPC Modal
    }
];
