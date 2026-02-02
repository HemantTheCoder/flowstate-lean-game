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
        description: "Riverside Market Mall Project. A soft opening is promised in two weeks.",
        dialogue: [
            { character: 'Rao', text: "New client, big visibility! This Riverside Market project is our ticket to the big leagues!", emotion: 'happy' },
            { character: 'Isha', text: "I've already created the master schedule. It's aggressive, but everything fits perfectly on paper.", emotion: 'happy' },
            { character: 'Client', text: "We have announced the soft opening for next Friday. You will be finished by then, yes?", emotion: 'neutral' },
            { character: 'Isha', text: "Yes! Absolutely! Everything is already planned.", emotion: 'happy' },
            { character: 'Mira', text: "(whispering) Planned... or just promised? We haven't even checked materials yet.", emotion: 'worried' },
            { character: 'Foreman', text: "A plan without materials is just a wish.", emotion: 'neutral' },
            { character: 'Advisor', text: "Welcome to the Planning Room. Here, we don't just list tasks. We make reliable promises.", emotion: 'neutral' }
        ]
    },
    {
        day: 7,
        title: "Hidden Constraints",
        description: "The schedule looks green, but the site is full of red flags.",
        dialogue: [
            { character: 'Mira', text: "I checked the lookahead. We have 'Structural Supports' scheduled, but the steel hasn't been approved.", emotion: 'stressed' },
            { character: 'Rao', text: "Details! Just get the crew start working. We can get approval later!", emotion: 'angry' },
            { character: 'Advisor', text: "If you start without approval, you risk rework. Remove the constraint first.", emotion: 'neutral' }
        ]
    },
    // More days to be added...
];
