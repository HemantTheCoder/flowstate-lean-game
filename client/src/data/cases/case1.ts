import { DayConfig } from '../chapters/types';

export const CASE_1_SCHEDULE: DayConfig[] = [
    {
        day: 1,
        title: "The Midfield Expansion",
        description: "Welcome to the Terminal T-Upgrade project. The concourse is live, space is constrained, and time is short.",
        lesson: "Concept: Logistics in Constrained Environments.",
        dialogue: [
            { character: 'Mira', text: "Welcome to the Terminal T-Upgrade, Engineer. We have 12 days to complete a staged opening.", emotion: 'neutral' },
            { character: 'Rao', text: "It's impossible! We only have one access road and two freight elevators. How do we move anything?!", emotion: 'stressed' },
            { character: 'Engineer', text: "By using flow principles and JIT delivery, Rao. We can't use the apron as a dumping ground.", emotion: 'neutral' },
            { character: 'Engineer', text: "We need to schedule hoist slots strictly and keep the passenger zones clear. Disruption is our biggest risk.", emotion: 'neutral' }
        ],
        briefing: {
            objective: "Establish Flow in a Bottle-neck.",
            action: "Manage your freight elevator slots carefully. Don't pull material until it's actually ready to be installed."
        }
    },
    {
        day: 2,
        title: "Vertical Limits",
        description: "One of the freight elevators has broken down, halving vertical capacity.",
        lesson: "Concept: Capacity Constraints & Prioritization.",
        dialogue: [
            { character: 'Mira', text: "Elevator 2's winch motor just burnt out. The maintenance team says it will take 24 hours to replace.", emotion: 'stressed' },
            { character: 'Rao', text: "I have three trucks waiting downstairs! The drywallers are screaming at me!", emotion: 'angry' },
            { character: 'Engineer', text: "Cancel the drywall delivery. Reroute the remaining elevator capacity to the critical path only.", emotion: 'neutral' }
        ],
        event: 'supply_delay',
        briefing: {
            objective: "Prioritize the Hoist.",
            action: "With 50% hoist capacity, you must allocate slots only to critical path tasks. Other trades must do prep work or wait."
        }
    },
    {
        day: 3,
        title: "Finding the Rhythm",
        description: "The team is adjusting to the new constrained flow.",
        lesson: "Concept: Reliable Promising.",
        dialogue: [
            { character: 'Inspector', text: "The staging area looking much cleaner today. Good job keeping the access road clear.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Stabilize Throughput.",
            action: "Keep the hoist slots balanced with the floor installation teams."
        }
    },
    {
        day: 4,
        title: "Security Sweep",
        description: "TSA requires extra clearance for all workers today.",
        lesson: "Concept: External Variation.",
        dialogue: [
            { character: 'Isha', text: "Security audited our access logs. They are re-screening every worker entering the sterile area.", emotion: 'worried' },
            { character: 'Engineer', text: "This cuts our active work time. Focus on completing tasks already in progress rather than starting new ones.", emotion: 'neutral' }
        ],
        briefing: {
            objective: "Manage Reduced Capacity.",
            action: "Focus on finishing current WIP. Starting new tasks will only lead to incomplete work."
        }
    },
    {
        day: 5,
        title: "The Sweet Spot",
        description: "Things are moving smoothly.",
        lesson: "Concept: Maintaining Flow.",
        dialogue: [
            { character: 'Rao', text: "The boys are actually happy. They know exactly what's arriving and when.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Keep it up.",
            action: "Maintain the balance between material delivery and floor installation."
        }
    },
    {
        day: 6,
        title: "Supplier Mix-up",
        description: "The HVAC supplier sent the wrong duct fittings.",
        lesson: "Concept: Defect Management & Rework.",
        dialogue: [
            { character: 'Mira', text: "The ducting that just came up the hoist? It's round. We need rectangular.", emotion: 'stressed' },
            { character: 'Rao', text: "Oh no... they are already hanging them! Stop the crew!", emotion: 'angry' },
            { character: 'Engineer', text: "This is rework. We have to tear it down and wait for the correct parts.", emotion: 'neutral' }
        ],
        event: 'recovery',
        briefing: {
            objective: "Handle Rework.",
            action: "Some of your installed work has failed the QA gate. It must be reworked. Manage the morale hit."
        }
    },
    {
        day: 7,
        title: "Catching Up",
        description: "Recovering from the rework.",
        lesson: "Concept: Recovery.",
        dialogue: [
            { character: 'Engineer', text: "We lost a day to rework, but our processes caught the error before it was buried under ceiling tiles.", emotion: 'neutral' }
        ],
        briefing: {
            objective: "Recover Schedule.",
            action: "Carefully increase throughput without overwhelming the system."
        }
    },
    {
        day: 8,
        title: "Steady Progress",
        description: "The concourse is taking shape.",
        lesson: "Concept: Visual Management.",
        dialogue: [
            { character: 'Inspector', text: "I can almost see the finished concourse. Quality is holding up well.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Maintain Quality.",
            action: "Don't skip QA gates. Early detection prevents rework."
        }
    },
    {
        day: 9,
        title: "The VIP Surge",
        description: "A major conference is in town, creating a surge in passenger traffic.",
        lesson: "Concept: Minimizing Disruption.",
        dialogue: [
            { character: 'Isha', text: "The terminal is packed today! Operations just called—we must minimize noise and dust completely.", emotion: 'worried' },
            { character: 'Engineer', text: "Halt all demolition and heavy drilling. Shift resources to quiet tasks like wiring and painting.", emotion: 'neutral' }
        ],
        event: 'decision_push',
        briefing: {
            objective: "Minimize Disruption.",
            action: "Focus on low-impact tasks. The Passenger Disruption Index (PDI) penalty is doubled today."
        }
    },
    {
        day: 10,
        title: "The Final Push Starts",
        description: "Only a few days left.",
        lesson: "Concept: Pulling to Completion.",
        dialogue: [
            { character: 'Rao', text: "We are so close! Let's work double shifts!", emotion: 'happy' },
            { character: 'Engineer', text: "Only if the work is ready, Rao. Overproduction now will just create bottlenecks at commissioning.", emotion: 'neutral' }
        ],
        briefing: {
            objective: "Stay Disciplined.",
            action: "Don't abandon the system. Pull work only when needed."
        }
    },
    {
        day: 11,
        title: "Power Emergency",
        description: "A temporary power failure requires urgent rerouting.",
        lesson: "Concept: Emergency Response.",
        dialogue: [
            { character: 'Mira', text: "The temporary breaker panel just blew. We have no power on the East side.", emotion: 'stressed' },
            { character: 'Engineer', text: "Drop everything. We need the electrical crew to reroute power from the main feed immediately.", emotion: 'neutral' }
        ],
        event: 'constraints_visible',
        briefing: {
            objective: "Handle the Emergency.",
            action: "An urgent task has been added to the board. Complete it immediately to restore normal flow."
        }
    },
    {
        day: 12,
        title: "Stage 1 Opening",
        description: "The final day before hand-over.",
        lesson: "Concept: Handover.",
        dialogue: [
            { character: 'Inspector', text: "You did it. The concourse is safe, clean, and ready for passengers.", emotion: 'happy' },
            { character: 'Rao', text: "And we didn't have to close the whole terminal down to do it!", emotion: 'happy' },
            { character: 'Engineer', text: "That's the power of Lean. We minimized the disruption and maximized the flow of value.", emotion: 'happy' }
        ],
        event: 'chapter_complete',
        briefing: {
            objective: "Final Review.",
            action: "Complete the remaining tasks to trigger the Case Study review."
        }
    }
];
