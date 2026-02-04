import { DayConfig } from './types';
import { DialogueLine } from '@/store/gameStore';
export type { DayConfig } from './types';

export const CHAPTER_2_INTRO: DialogueLine[] = [
    { character: 'Client', text: "Last week, your flow improved. This time, I need dates. Reliable dates.", emotion: 'neutral' },
    { character: 'Isha', text: "I have already prepared the schedule, sir. All tasks are mapped out.", emotion: 'happy' },
    { character: 'Mira', text: "A schedule is not a promise, Isha. Anyone can write dates on paper.", emotion: 'neutral' },
    { character: 'Old Foreman', text: "Promises break faster than concrete, I say. Seen it too many times.", emotion: 'neutral' },
    { character: 'Engineer', text: "The Last Planner System teaches us to commit only to what we CAN do, not what we SHOULD do.", emotion: 'neutral' },
    { character: 'Client', text: "Then show me. The Riverside Market Mall soft opening is in two weeks. Don't disappoint me.", emotion: 'stressed' }
];

export const WEEK_2_SCHEDULE: DayConfig[] = [
    {
        day: 6,
        title: "The Planning Room",
        description: "You enter the Planning Room for the first time. Here, promises are made—or broken.",
        lesson: "Concept: Should, Can, Will — The Three Levels of Planning.",
        dialogue: [
            { character: 'Advisor', text: "Welcome to the Planning Room. This is where the Last Planner System begins.", emotion: 'happy' },
            { character: 'Advisor', text: "On the left is your Master Schedule—what SHOULD happen this week.", emotion: 'neutral' },
            { character: 'Advisor', text: "In the center is the Lookahead Window—tasks you're evaluating for readiness.", emotion: 'neutral' },
            { character: 'Advisor', text: "On the right is the Inspector—where you check and remove constraints.", emotion: 'neutral' },
            { character: 'Old Foreman', text: "Red means blocked. Green means ready. Don't promise what ain't green.", emotion: 'neutral' },
            { character: 'Advisor', text: "Pull tasks from Master to Lookahead. Then fix constraints to make them Sound.", emotion: 'happy' }
        ],
        event: 'tutorial_start',
        briefing: {
            objective: "Learn the Planning Room.",
            action: "Pull 3-4 tasks from Master Schedule into the Lookahead Window. Identify which have constraints (red icons)."
        }
    },
    {
        day: 7,
        title: "Constraint Discovery",
        description: "The Foreman reveals that half the planned tasks have hidden blockers.",
        lesson: "Concept: Constraints — The reasons tasks fail.",
        dialogue: [
            { character: 'Old Foreman', text: "Morning, Engineer. I reviewed your Lookahead plan last night.", emotion: 'neutral' },
            { character: 'Old Foreman', text: "Half these tasks ain't ready. Missing drawings. No steel delivery. Crew double-booked.", emotion: 'angry' },
            { character: 'Isha', text: "But the schedule says they should happen this week!", emotion: 'stressed' },
            { character: 'Engineer', text: "The schedule says SHOULD. We need to check if we CAN.", emotion: 'neutral' },
            { character: 'Advisor', text: "Constraints are the hidden reasons tasks fail. Today, we identify them all.", emotion: 'neutral' }
        ],
        event: 'constraints_visible',
        briefing: {
            objective: "Identify All Constraints.",
            action: "Click on each red task in the Lookahead. Note the constraint type (Material, Crew, Approval). Do NOT try to fix them yet."
        }
    },
    {
        day: 8,
        title: "Making Work Ready",
        description: "Time to remove constraints and prepare tasks for commitment.",
        lesson: "Concept: Make Ready — The art of removing blockers before they cause failure.",
        dialogue: [
            { character: 'Client', text: "I want to see progress! Why isn't the steel framework going up?", emotion: 'angry' },
            { character: 'Isha', text: "We are 'Making Ready', sir. Ensuring the work can flow without interruption.", emotion: 'neutral' },
            { character: 'Client', text: "Making ready? That sounds like an excuse for delay!", emotion: 'angry' },
            { character: 'Engineer', text: "Preventing failure is not delay. It is reliability.", emotion: 'neutral' },
            { character: 'Advisor', text: "Click 'Fix' on constraints. Each has a cost—money, time, or morale. Choose wisely.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Remove Constraints.",
            action: "Use the Inspector panel to remove at least 2 constraints. Watch your Budget and Morale—each fix has a cost."
        }
    },
    {
        day: 9,
        title: "The Weekly Promise",
        description: "Rao demands a commitment. The Client adds pressure. What will you promise?",
        lesson: "Concept: Weekly Work Plan — Only promise what you CAN deliver.",
        dialogue: [
            { character: 'Rao', text: "Enough planning! I need a commitment. What WILL be done by Friday?", emotion: 'angry' },
            { character: 'Mira', text: "Only commit what's green, Engineer. Red tasks will fail and hurt our PPC.", emotion: 'stressed' },
            { character: 'Client', text: "Wait. Can you also finish the cafe roofing this week? The investors want to see it.", emotion: 'neutral' },
            { character: 'Isha', text: "That was scheduled for next week, sir...", emotion: 'stressed' },
            { character: 'Client', text: "I'm asking if you CAN. It would mean a lot to the project.", emotion: 'neutral' }
        ],
        event: 'client_pressure',
        briefing: {
            objective: "Make Your Commitment.",
            action: "Move GREEN tasks to the Weekly Work Plan. The Client is asking for extra work—accepting adds risk. Declining is safer but may affect trust."
        }
    },
    {
        day: 10,
        title: "Execution Day",
        description: "Your commitments are locked. Now the work must flow.",
        lesson: "Concept: Reliable Promises — Execution reveals the truth of your planning.",
        dialogue: [
            { character: 'Old Foreman', text: "The crew knows their work for the week. They trust the plan.", emotion: 'happy' },
            { character: 'Mira', text: "If we prepared well, today should be smooth. If not... we'll see the cracks.", emotion: 'neutral' },
            { character: 'Engineer', text: "Let's execute. The Kanban board is open. Finish what we promised.", emotion: 'happy' }
        ],
        event: 'recovery',
        briefing: {
            objective: "Execute Your Plan.",
            action: "Work through the Kanban board. Complete as many promised tasks as possible. Any task that fails will hurt your PPC."
        }
    },
    {
        day: 11,
        title: "The PPC Review",
        description: "The Inspector arrives. Your Percent Plan Complete will be calculated.",
        lesson: "Concept: PPC (Percent Plan Complete) — The measure of promise reliability.",
        dialogue: [
            { character: 'Inspector', text: "Let me see your Weekly Work Plan... and what was actually completed.", emotion: 'neutral' },
            { character: 'Isha', text: "We promised {promised} tasks. We completed {completed}.", emotion: 'neutral' },
            { character: 'Inspector', text: "Your PPC this week is {ppc}%.", emotion: 'neutral' }
        ],
        event: 'inspection',
        briefing: {
            objective: "Review Your Performance.",
            action: "Your PPC is calculated. 80%+ is excellent. Below 50% damages trust. Learn from what failed."
        }
    }
];

export const PPC_GOOD: DialogueLine[] = [
    { character: 'Inspector', text: "Impressive. You promised carefully and delivered reliably.", emotion: 'happy' },
    { character: 'Old Foreman', text: "The crew is proud. When we promise, we deliver.", emotion: 'happy' },
    { character: 'Client', text: "This is what I wanted to see. Professional reliability. Proceed to Phase 2.", emotion: 'happy' },
    { character: 'Advisor', text: "You've mastered the core of Last Planner: Promise only what you CAN deliver.", emotion: 'happy' }
];

export const PPC_AVERAGE: DialogueLine[] = [
    { character: 'Inspector', text: "Acceptable, but there's room for improvement. Some promises were broken.", emotion: 'neutral' },
    { character: 'Mira', text: "We need to analyze what went wrong. Were there hidden constraints?", emotion: 'stressed' },
    { character: 'Advisor', text: "Every broken promise has a reason. Find it, and you'll improve.", emotion: 'neutral' }
];

export const PPC_BAD: DialogueLine[] = [
    { character: 'Inspector', text: "This is concerning. More than half your promises were broken.", emotion: 'angry' },
    { character: 'Rao', text: "I told you to commit more! Now we look unreliable!", emotion: 'angry' },
    { character: 'Engineer', text: "We committed to tasks that weren't ready. That's on us.", emotion: 'stressed' },
    { character: 'Advisor', text: "Overcommitment destroys trust. Next time, promise less and deliver more.", emotion: 'neutral' }
];

export const CHAPTER_2_END: DialogueLine[] = [
    { character: 'Old Foreman', text: "Now promises are honest. The crew trusts the plan.", emotion: 'happy' },
    { character: 'Mira', text: "But the site is still messy. Too much clutter, too much searching for tools.", emotion: 'stressed' },
    { character: 'Advisor', text: "Next, we clean the chaos. Chapter 3 teaches the 5S methodology.", emotion: 'happy' }
];
