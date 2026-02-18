import { DayConfig } from './types';
import { DialogueLine } from '@/store/gameStore';
export type { DayConfig } from './types';

export const CHAPTER_2_INTRO: DialogueLine[] = [
    { character: 'Client', text: "Last week, your Kanban flow improved the site. But I need more than flow. I need DATES. Reliable dates.", emotion: 'neutral' },
    { character: 'Isha', text: "I have prepared the full schedule, sir. Every task has a start date and end date.", emotion: 'happy' },
    { character: 'Mira', text: "A schedule is not a promise, Isha. I've seen a hundred beautiful schedules collapse on site.", emotion: 'neutral' },
    { character: 'Old Foreman', text: "She's right. Promises break faster than concrete around here. I've been on sites where the plan said 'done in March' and we finished in August.", emotion: 'neutral' },
    { character: 'Engineer', text: "That's why we need the Last Planner System. It teaches us to commit only to what we CAN do - not what we SHOULD do.", emotion: 'neutral' },
    { character: 'Advisor', text: "Think of it this way: A schedule is a wish. A plan is a guess. But a COMMITMENT is a promise backed by proof that you CAN deliver.", emotion: 'happy' },
    { character: 'Client', text: "Then show me this system. The Riverside Market Mall soft opening is in two weeks. Don't disappoint me.", emotion: 'stressed' }
];

export const WEEK_2_SCHEDULE: DayConfig[] = [
    {
        day: 6,
        title: "The Planning Room",
        description: "You enter the Planning Room for the first time. Here, promises are made—or broken.",
        lesson: "Concept: Should, Can, Will — The Three Levels of Planning.",
        dialogue: [
            { character: 'Advisor', text: "Welcome to the Planning Room. This is the heart of the Last Planner System.", emotion: 'happy' },
            { character: 'Advisor', text: "On the LEFT is your Master Schedule - this shows what SHOULD happen this week. Think of it as the architect's dream.", emotion: 'neutral' },
            { character: 'Advisor', text: "In the CENTER is the Lookahead Window. When you pull a task here, you're asking: CAN this actually be done? Do we have everything we need?", emotion: 'neutral' },
            { character: 'Advisor', text: "On the RIGHT is the Task Inspector. Click any task to see its constraints - the reasons it might FAIL.", emotion: 'neutral' },
            { character: 'Old Foreman', text: "See those red icons? Those mean BLOCKED. Missing materials, no crew, waiting on approval. Don't you dare promise a red task.", emotion: 'neutral' },
            { character: 'Mira', text: "And green means 'Sound' - all prerequisites are met. Only Sound tasks should become promises.", emotion: 'happy' },
            { character: 'Advisor', text: "Your job today: Pull 3-4 tasks from the Master Schedule into the Lookahead. See which ones are ready and which have constraints.", emotion: 'happy' }
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
            { character: 'Old Foreman', text: "Morning, Engineer. I spent last night reviewing your Lookahead plan.", emotion: 'neutral' },
            { character: 'Old Foreman', text: "Half these tasks ain't ready. Missing structural drawings. Steel delivery stuck at the port. Crew double-booked with the parking lot job.", emotion: 'angry' },
            { character: 'Isha', text: "But the Master Schedule says they should happen this week! We'll fall behind!", emotion: 'stressed' },
            { character: 'Engineer', text: "The schedule says SHOULD, Isha. Today we find out what we actually CAN do.", emotion: 'neutral' },
            { character: 'Advisor', text: "This is the most important step in LPS: Constraint Analysis. Every task that fails has a reason. Find the reason BEFORE it fails, not after.", emotion: 'neutral' },
            { character: 'Advisor', text: "Click on each RED task in your Lookahead. Read the constraint. Understanding WHY something is blocked is the first step to making it ready.", emotion: 'happy' }
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
            { character: 'Isha', text: "We are 'Making Ready', sir. Ensuring the work can flow without interruption when we start.", emotion: 'neutral' },
            { character: 'Client', text: "Making ready? That sounds like an excuse for delay!", emotion: 'angry' },
            { character: 'Engineer', text: "Preventing failure is not delay, sir. It is reliability. Starting work that isn't ready wastes MORE time than preparing properly.", emotion: 'neutral' },
            { character: 'Mira', text: "Remember last month? We started the waterproofing before the membrane arrived. Crew stood idle for two days. That cost us $3,000.", emotion: 'stressed' },
            { character: 'Advisor', text: "The Make Ready process is your secret weapon. Click 'Fix' on each constraint. Call the supplier. Reassign the crew. Expedite the approval. Each fix has a cost - choose wisely.", emotion: 'happy' },
            { character: 'Old Foreman', text: "Turn those reds to green, Engineer. Only then can we make honest promises.", emotion: 'neutral' }
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
            { character: 'Rao', text: "Enough planning! I need a commitment. What WILL be done by Friday? Give me a number!", emotion: 'angry' },
            { character: 'Mira', text: "Only commit what's green, Engineer. Every red task you promise will hurt our PPC when it fails.", emotion: 'stressed' },
            { character: 'Engineer', text: "PPC - Percent Plan Complete. It measures how many promises we KEEP, not how many we MAKE.", emotion: 'neutral' },
            { character: 'Client', text: "Wait. Can you also finish the cafe roofing this week? The investors are visiting Friday. I need to show them something impressive.", emotion: 'neutral' },
            { character: 'Isha', text: "That was scheduled for next week, sir. We haven't checked its constraints yet...", emotion: 'stressed' },
            { character: 'Client', text: "I'm asking if you CAN. It would mean a lot to the project's future funding.", emotion: 'neutral' },
            { character: 'Advisor', text: "This is the hardest moment in LPS. The pressure to overcommit is real. You must decide whether to accept the risk or protect the plan.", emotion: 'neutral' },
            { character: 'Advisor', text: "The choice is yours. Ensure your Weekly Work Plan contains only sound tasks, then click 'Start Week' to lock in your promises.", emotion: 'happy' }
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
            { character: 'Old Foreman', text: "The crew knows exactly what to do today. Materials are staged. Drawings are posted. No confusion.", emotion: 'happy' },
            { character: 'Mira', text: "This is what good planning feels like. When you Make Ready properly, execution day is smooth.", emotion: 'happy' },
            { character: 'Engineer', text: "Every task on the Kanban board today was a PROMISE. Let's keep every one of them.", emotion: 'happy' },
            { character: 'Advisor', text: "Notice the difference? When work is Sound, crews don't search for materials, don't wait for approvals, don't improvise. They BUILD.", emotion: 'happy' },
            { character: 'Isha', text: "If we complete everything we committed, our PPC will be strong. The Inspector will see a reliable team.", emotion: 'neutral' }
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
            { character: 'Inspector', text: "Let me see your Weekly Work Plan... and compare it to what was actually completed.", emotion: 'neutral' },
            { character: 'Inspector', text: "In the Last Planner System, I don't just count completed tasks. I count KEPT PROMISES.", emotion: 'neutral' },
            { character: 'Isha', text: "We committed to {promised} tasks in our Weekly Work Plan. We completed {completed} of them.", emotion: 'neutral' },
            { character: 'Inspector', text: "Your Percent Plan Complete this week is {ppc}%. Let me explain what this means.", emotion: 'neutral' },
            { character: 'Advisor', text: "PPC above 80% means your planning is reliable. Between 50-80% means you need better constraint analysis. Below 50% means serious overcommitment.", emotion: 'neutral' }
        ],
        event: 'inspection',
        briefing: {
            objective: "Review Your Performance.",
            action: "Your PPC is calculated. 80%+ is excellent. Below 50% damages trust. Learn from what failed."
        }
    }
];

export const PPC_GOOD: DialogueLine[] = [
    { character: 'Inspector', text: "Impressive. You promised carefully and delivered reliably. This is exactly what the Last Planner System is designed to achieve.", emotion: 'happy' },
    { character: 'Old Foreman', text: "The crew is proud. When the plan is honest, the work flows. No scrambling, no excuses.", emotion: 'happy' },
    { character: 'Mira', text: "High PPC means every trade on site can trust our schedule. Electricians know the walls will be ready. Plumbers know the trenches will be dug.", emotion: 'happy' },
    { character: 'Client', text: "This is professional reliability. I can plan the investor tour with confidence now. Proceed to the next phase.", emotion: 'happy' },
    { character: 'Advisor', text: "You've grasped the core of Last Planner: Promise only what you CAN deliver. Every kept promise builds trust. Every broken promise destroys it.", emotion: 'happy' }
];

export const PPC_AVERAGE: DialogueLine[] = [
    { character: 'Inspector', text: "Acceptable, but there's room for improvement. Some promises were broken this week.", emotion: 'neutral' },
    { character: 'Mira', text: "We need to do a Reasons Analysis. WHY did those tasks fail? Was it a hidden constraint we missed? An unrealistic commitment?", emotion: 'stressed' },
    { character: 'Old Foreman', text: "In my experience, broken promises usually mean we didn't look hard enough for constraints during planning.", emotion: 'neutral' },
    { character: 'Advisor', text: "Every broken promise has a root cause. In LPS, we track these reasons weekly. Over time, patterns emerge - and THAT is how you improve.", emotion: 'neutral' }
];

export const PPC_BAD: DialogueLine[] = [
    { character: 'Inspector', text: "This is concerning. More than half your promises were broken. The team cannot rely on your plans.", emotion: 'angry' },
    { character: 'Rao', text: "I told you to commit more! Now we look unreliable AND slow!", emotion: 'angry' },
    { character: 'Engineer', text: "That's the trap, Rao. You pushed me to promise more than we could deliver. That's exactly why PPC exists - to expose overcommitment.", emotion: 'stressed' },
    { character: 'Mira', text: "When PPC is low, every trade downstream suffers. The electricians waited for walls that weren't ready. The tilers waited for plumbing that wasn't done.", emotion: 'stressed' },
    { character: 'Advisor', text: "Overcommitment is the #1 enemy of reliable planning. Next time, promise LESS and deliver MORE. A smaller plan that's 100% complete is better than a big plan that's 40% complete.", emotion: 'neutral' }
];

export const CHAPTER_2_END: DialogueLine[] = [
    { character: 'Old Foreman', text: "The crew trusts the plan now. When we say something WILL be done, it gets done. That's the power of honest promises.", emotion: 'happy' },
    { character: 'Mira', text: "Our PPC is improving. But the site still has too much clutter. Workers waste time searching for tools and materials.", emotion: 'stressed' },
    { character: 'Isha', text: "I measured it - crews spend 30% of their time just LOOKING for things. That's pure waste.", emotion: 'stressed' },
    { character: 'Advisor', text: "Excellent observation. Next, we tackle workplace organization. Chapter 3 introduces 5S - Sort, Set in Order, Shine, Standardize, Sustain.", emotion: 'happy' }
];
