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
        title: "The Monsoon Drift",
        description: "Dark clouds gather. Variation is coming.",
        dialogue: [
            { character: 'Inspector', text: "Welcome back. You stabilized the flow in calm weather. Now, let's see how you handle a storm.", emotion: 'neutral' },
            { character: 'Mira', text: "Forecast says heavy rain all week. It's going to slow down our 'Structural' tasks.", emotion: 'stressed' },
            { character: 'Rao', text: "Rain?! We can't stop! We have deadlines! Just... work faster when it stops!", emotion: 'stressed' },
            { character: 'Engineer', text: "We can't just 'work faster'. We need buffers. We need to plan for the variation.", emotion: 'neutral' },
            { character: 'Inspector', text: "Exactly. Chapter 2 is about 'Variation'. Systems that are too lean break when things go wrong.", emotion: 'happy' }
        ]
    },
    {
        day: 7,
        title: "Muddy Roads",
        description: "Supply trucks are stuck.",
        event: 'supply_delay',
        dialogue: [
            { character: 'Mira', text: "boss, the roads are mud. The supply truck is delayed.", emotion: 'stressed' },
            { character: 'Rao', text: "What?! But we have zero inventory! We are STARVING!", emotion: 'angry' },
            { character: 'Engineer', text: "This is why we need a 'Buffer' of materials. Zero inventory + Variation = Starvation.", emotion: 'neutral' }
        ]
    },
    // More days to be added...
];
