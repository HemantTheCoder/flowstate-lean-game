import { DayConfig } from './types';
import { DialogueLine } from '@/store/gameStore';
export type { DayConfig } from './types';

export const CHAPTER_2_INTRO: DialogueLine[] = [
    { character: 'Client', text: "Last week, your Kanban flow improved the site. But I need more than flow. I need DATES. Reliable dates.", emotion: 'neutral' },
    { character: 'Isha', text: "I have prepared the full schedule, sir. Every task has a start date and end date.", emotion: 'happy' },
    { character: 'Mira', text: "A schedule is not a promise, Isha. I've seen a hundred beautiful schedules collapse on site.", emotion: 'neutral' },
    { character: 'Old Foreman', text: "She's right. Promises break faster than concrete around here. I've been on sites where the plan said 'done in March' and we finished in August.", emotion: 'neutral' },
    { character: 'Engineer', text: "That's why we need the Last Planner System. It's a way to ensure we only commit to what we CAN do — not just what the schedule says we SHOULD do.", emotion: 'neutral' },
    { character: 'Advisor', text: "Think of it this way: A schedule is a wish. A plan is a guess. But a COMMITMENT is a reliable promise backed by proof that you're ready.", emotion: 'happy' },
    { character: 'Client', text: "Then show me this system. The Riverside Market Mall soft opening is in two weeks. Don't disappoint me.", emotion: 'stressed' }
];

export const WEEK_2_SCHEDULE: DayConfig[] = [
    {
        day: 6,
        title: "The Planning Room",
        description: "Welcome to the Planning Room. This is where we stop guessing and start making 'Reliable Promises' about what we can actually finish this week.",
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
            action: "Drag 3-4 tasks from the Master Schedule (The Goal) into the Lookahead Window (The Preparation). Identify which have Constraints (Red Blockers)."
        }
    },
    {
        day: 7,
        title: "Constraint Discovery",
        description: "The Foreman found hidden problems. Many tasks we wanted to do are 'Blocked' because drawings are missing or materials haven't arrived.",
        lesson: "Concept: Constraints — The reasons tasks fail.",
        dialogue: [
            { character: 'Old Foreman', text: "Morning, Engineer. I spent last night reviewing your Lookahead plan.", emotion: 'neutral' },
            { character: 'Old Foreman', text: "Half these tasks ain't ready. Missing structural drawings. Steel delivery stuck at the port. Crew double-booked with the parking lot job.", emotion: 'angry' },
            { character: 'Isha', text: "But the Master Schedule says they should happen this week! We'll fall behind!", emotion: 'stressed' },
            { character: 'Engineer', text: "The schedule says SHOULD, Isha. Today we use our 'Lookahead' to find out what we actually CAN do.", emotion: 'neutral' },
            { character: 'Advisor', text: "This is the core of the system: 'Constraint Analysis' — finding the hidden reasons (like missing drawings or material) why a task might fail before it even starts.", emotion: 'neutral' },
            { character: 'Advisor', text: "Click on each RED task in your Lookahead. Read the constraint. Understanding WHY something is blocked is the first step to making it ready.", emotion: 'happy' }
        ],
        event: 'constraints_visible',
        briefing: {
            objective: "Identify All Constraints.",
            action: "Click on each Red Task in the Lookahead. These are blocked by missing materials, crews, or approvals. Note the blocker type for each, but don't spend budget yet."
        }
    },
    {
        day: 8,
        title: "Making Work Ready",
        description: "We need to clear the path. By spending some time and budget now to 'Fix' these blockers, we ensure the work flows smoothly when it hits the site.",
        lesson: "Concept: Make Ready — The art of removing blockers before they cause failure.",
        dialogue: [
            { character: 'Client', text: "I want to see progress! Why isn't the steel framework going up?", emotion: 'angry' },
            { character: 'Isha', text: "We are 'Making Ready', sir. Ensuring the work can flow without interruption when we start.", emotion: 'neutral' },
            { character: 'Client', text: "Making ready? That sounds like an excuse for delay!", emotion: 'angry' },
            { character: 'Engineer', text: "Preventing failure is not delay, sir. It is reliability. Starting work that isn't ready wastes MORE time than preparing properly.", emotion: 'neutral' },
            { character: 'Mira', text: "Remember last month? We started the waterproofing before the membrane arrived. Crew stood idle for two days. That cost us ₹3,000.", emotion: 'stressed' },
            { character: 'Advisor', text: "The Make Ready process is your secret weapon. Click 'Fix' on each constraint. Call the supplier. Reassign the crew. Expedite the approval. Each fix has a cost - choose wisely.", emotion: 'happy' },
            { character: 'Old Foreman', text: "Turn those reds to green, Engineer. Only then can we make honest promises.", emotion: 'neutral' }
        ],
        briefing: {
            objective: "Remove Constraints.",
            action: "Use the Inspector panel to 'Fix' and remove at least 2 constraints. Every fix costs money or morale—spend your budget wisely to clear the path."
        }
    },
    {
        day: 9,
        title: "The Weekly Promise",
        description: "The pressure is on. Rajiv and the Client want big promises, but you must only commit to what is 'Ready' (Green) to protect our reliability.",
        lesson: "Concept: Weekly Work Plan — Only promise what you CAN deliver.",
        dialogue: [
            { character: 'Rao', text: "Enough planning! I need a commitment. What WILL be done by Friday? Give me a number!", emotion: 'angry' },
            { character: 'Mira', text: "Only commit what's green, Engineer. Every 'Blocked' task you promise will hurt our PPC (Percent Plan Complete) when it inevitably fails.", emotion: 'stressed' },
            { character: 'Engineer', text: "PPC is simply our reliability score. It measures how many promises we actually KEPT this week.", emotion: 'neutral' },
            { character: 'Client', text: "Wait. Can you also finish the cafe roofing this week? The investors are visiting Friday. I need to show them something impressive.", emotion: 'neutral' },
            { character: 'Isha', text: "That was scheduled for next week, sir. We haven't checked its constraints yet...", emotion: 'stressed' },
            { character: 'Client', text: "I'm asking if you CAN. It would mean a lot to the project's future funding.", emotion: 'neutral' },
            { character: 'Advisor', text: "This is the hardest moment in LPS. The pressure to overcommit is real. You must decide whether to accept the risk or protect the plan.", emotion: 'neutral' },
            { character: 'Advisor', text: "The choice is yours. Ensure your Weekly Work Plan contains only sound tasks, then click 'Start Week' to lock in your promises.", emotion: 'happy' }
        ],
        event: 'client_pressure',
        briefing: {
            objective: "Make Your Commitment.",
            action: "Move Green (Ready) tasks to your Weekly Work Plan. The Client is pushing for an extra task—it's risky! Only promise what you are SURE you can finish."
        }
    },
    {
        day: 10,
        title: "Execution Day",
        description: "The plan is set and the crews are moving. Since we properly cleared the blockers yesterday, today should be about smooth execution and kept promises.",
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
            action: "Work through the Kanban site. Since you 'Made Ready' properly, focus on finishing every task you promised. A kept promise is a win for the team!"
        }
    },
    {
        day: 11,
        title: "The PPC Review",
        description: "The Inspector returns to check our 'PPC'—our score for kept promises. Did we do what we said we would, or did we over-promise and under-deliver?",
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
            action: "Your reliability score (PPC) is calculated by comparing your promises to your results. Aim for 80%+. Learn from the tasks that failed."
        }
    }
];

export const PPC_GOOD: DialogueLine[] = [
    { character: 'Inspector', text: "Impressive. You promised carefully and delivered reliably. This is exactly what the Last Planner System is designed to achieve.", emotion: 'happy' },
    { character: 'Old Foreman', text: "The crew is proud. When the plan is honest, the work flows. No scrambling, no excuses.", emotion: 'happy' },
    { character: 'Mira', text: "High PPC means every trade on site can trust our schedule. Electricians know the walls will be ready. Plumbers know the trenches will be dug.", emotion: 'happy' },
    { character: 'Client', text: "This is professional reliability. I can plan the investor tour with confidence now. Proceed to the next phase—I've authorized a ₹10,000 performance bonus for your lean results.", emotion: 'happy' },
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
    { character: 'Engineer', text: "That's the trap, Rajiv. You pushed me to promise more than we could deliver. That's exactly why PPC exists - to expose overcommitment.", emotion: 'stressed' },
    { character: 'Mira', text: "When PPC is low, every trade downstream suffers. The electricians waited for walls that weren't ready. The tilers waited for plumbing that wasn't done.", emotion: 'stressed' },
    { character: 'Advisor', text: "Overcommitment is the #1 enemy of reliable planning. Next time, promise LESS and deliver MORE. A smaller plan that's 100% complete is better than a big plan that's 40% complete.", emotion: 'neutral' }
];

export const CHAPTER_2_END: DialogueLine[] = [
    { character: 'Old Foreman', text: "The crew trusts the plan now. When we say something WILL be done, it gets done. That's the power of honest promises.", emotion: 'happy' },
    { character: 'Mira', text: "Our PPC is improving. But the site still has too much clutter. Workers waste time searching for tools and materials.", emotion: 'stressed' },
    { character: 'Isha', text: "I measured it - crews spend 30% of their time just LOOKING for things. That's pure waste.", emotion: 'stressed' },
    { character: 'Advisor', text: "Excellent observation. Next, we tackle workplace organization using '5S' — a method to Sort, Set in Order, and Shine the site so work can flow without searching.", emotion: 'happy' }
];
