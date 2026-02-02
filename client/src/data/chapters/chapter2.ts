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
            { character: 'Foreman', text: "Paper plans don't pour concrete.", emotion: 'neutral' },
            { character: 'Advisor', text: "Welcome to the Planning Room. Stop planning what 'should' be done. Start committing to what 'can' be done.", emotion: 'neutral' }
        ],
        // Special Phase: Planning
    },
    {
        day: 7,
        title: "Execution Starts",
        description: "The team starts working on the committed plan.",
        dialogue: [
            // Day 7 - Intro to pulling work
            { character: 'Foreman', text: "The crew appreciates the clear plan. No running around looking for materials.", emotion: 'happy' }
        ]
    },
    {
        day: 8,
        title: "The Surprise",
        description: "Hidden constraints emerge.",
        dialogue: [
            { character: 'Foreman', text: "Boss, the electrical Inspector just showed up. We don't have the approval papers!", emotion: 'stressed' },
            { character: 'Isha', text: "I thought we had that! It was green on the plan!", emotion: 'worried' },
            { character: 'Mira', text: "We checked materials, not approvals. Constraints don't announce themselves.", emotion: 'neutral' }
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
            { character: 'Rao', text: "Just promise it! We'll figure it out.", emotion: 'angry' }
        ],
        event: 'rao_push_ch2'
    },
    {
        day: 10,
        title: "The Reckoning",
        description: "Weekly Review. Did we keep our promises?",
        dialogue: [
            { character: 'Advisor', text: "It's Friday. Let's see our PPC (Percent Plan Complete).", emotion: 'neutral' }
        ]
        // Triggers PPC Modal
    }
];
