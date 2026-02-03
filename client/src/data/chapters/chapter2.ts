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
        title: "The Master Schedule",
        description: "Isha introduces the Master Schedule and the concept of Pull planning.",
        dialogue: [
            {
                character: "Isha",
                text: "Welcome to the Mall Project, Architect. This is a much bigger site than the Villa.",
                emotion: "neutral"
            },
            {
                character: "Isha",
                text: "We have a strictly defined 'Master Schedule' (The SHOULD). Check the Backlog.",
                emotion: "neutral"
            },
            {
                character: "Advisor",
                text: "Your goal today is simple: Review the Master Plan and 'Pull' tasks into the Lookahead window.",
                emotion: "happy"
            },
            {
                character: "Advisor",
                text: "Don't commit yet! Just identify what we SHOULD do.",
                emotion: "neutral"
            }
        ],
        event: "tutorial_start"
    },
    {
        day: 7,
        title: "Constraint Discovery",
        description: "The team identifies blockers preventing tasks from being ready.",
        dialogue: [
            {
                character: "Foreman",
                text: "Ey boss. We got a problem. I looked at that 'Lookahead' plan you made.",
                emotion: "worried"
            },
            {
                character: "Foreman",
                text: "Half these tasks ain't ready! We got missing drawings and no steel.",
                emotion: "angry"
            },
            {
                character: "Advisor",
                text: "He's right. In LPS, we call these 'Constraints'. Look for reasonable RED icons on the tasks.",
                emotion: "neutral"
            },
            {
                character: "Advisor",
                text: "You cannot build what isn't ready. Today, just identify the blockers.",
                emotion: "neutral"
            }
        ]
    },
    {
        day: 8,
        title: "Making It Ready",
        description: "Resolving constraints to make tasks sound.",
        dialogue: [
            {
                character: "Client",
                text: "I want to see progress! Why isn't the steel going up?",
                emotion: "angry"
            },
            {
                character: "Isha",
                text: "We are 'Making Ready', sir. Ensuring flow prevents delays later.",
                emotion: "neutral"
            },
            {
                character: "Advisor",
                text: "Time to fix those Constraints! Click 'Fix' on the Red tasks in Lookahead.",
                emotion: "happy"
            },
            {
                character: "Advisor",
                text: "This turns them GREEN (Sound). Only then are they safe to commit.",
                emotion: "happy"
            }
        ]
    },
    {
        day: 9,
        title: "The Weekly Promise",
        description: "Committing to a reliable weekly work plan.",
        dialogue: [
            {
                character: "Rao",
                text: "Enough planning. I want a commitment. What will be done by Friday?",
                emotion: "neutral"
            },
            {
                character: "Advisor",
                text: "This is the moment of truth. Move GREEN tasks to the 'Weekly Plan'.",
                emotion: "neutral"
            },
            {
                character: "Advisor",
                text: "WARNING: If you commit a Red task now, it WILL fail, and Rao will be furious.",
                emotion: "worried"
            },
            {
                character: "Isha",
                text: "Commit only what we CAN do. That is our Promise (The WILL).",
                emotion: "neutral"
            }
        ],
        event: "rao_push_ch2"
    },
    {
        day: 10,
        title: "PPC Review",
        description: "Reviewing Percent Plan Complete (PPC).",
        dialogue: [
            {
                character: "Isha",
                text: "The week is over. Let's look at our Percent Plan Complete (PPC).",
                emotion: "neutral"
            },
            {
                character: "Advisor",
                text: "If we hit 100%, we are Learning! If we failed, we must analyze why.",
                emotion: "happy"
            },
            {
                character: "Client",
                text: "Professional flow. I like it. Proceed to the next phase.",
                emotion: "happy"
            }
        ],
        event: "chapter_complete"
    }
];
