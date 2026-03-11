import { DayConfig } from '../chapters/types';

export const CASE_1_SCHEDULE: DayConfig[] = [
    {
        day: 1,
        title: "The Midfield Expansion",
        description: "Welcome to the Terminal T-Upgrade project. The concourse is live, space is constrained, and time is short.",
        lesson: "Concept: Pull Systems & Just-In-Time (JIT) Delivery.",
        dialogue: [
            { character: 'Mira', text: "Welcome to the Midfield Terminal expansion. We've got major space constraints here.", emotion: 'neutral' },
            { character: 'Mira', text: "We can't just push materials to the site. If the site is full, we pay penalties. We need a Pull System.", emotion: 'worried' },
            { character: 'Rao', text: "Sounds pretty in theory. But if my guys run out of timber, the whole floor stops. You better not starve my crew.", emotion: 'angry' },
            { character: 'Mira', text: "That's why we use Just-In-Time scheduling with small safety buffers. Let's set up the Kanban limits and schedule our first delivery.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Establish Flow in a Bottleneck.",
            action: "Set your Kanban WIP limits for each trade and schedule your first JIT material delivery. Don't pull material until it's ready to be installed."
        }
    },
    {
        day: 2,
        title: "VIP Demand Spike",
        description: "The client wants the VIP lounge finished early, doubling demand for finish materials.",
        lesson: "Concept: Capacity Constraints & Prioritization.",
        dialogue: [
            { character: 'Rao', text: "The client wants the VIP lounge finished early. We're seeing a sudden spike in demand for finish materials.", emotion: 'stressed' },
            { character: 'Mira', text: "We can increase our Kanban limit temporarily, or pay extra to expedite a shipment. What's your call?", emotion: 'neutral' }
        ],
        event: 'supply_delay',
        briefing: {
            objective: "Handle the Demand Spike.",
            action: "Decide how to respond to the VIP lounge rush. Balance cost against delivery risk."
        }
    },
    {
        day: 3,
        title: "Bullwhip Warning",
        description: "A local demand spike risks triggering the Bullwhip Effect upstream at suppliers.",
        lesson: "Concept: Bullwhip Effect & Demand Smoothing.",
        dialogue: [
            { character: 'Rao', text: "The second floor crew pulled double their usual amount yesterday. Do we panic and order a massive shipment?", emotion: 'worried' },
            { character: 'Mira', text: "Wait! If we overreact to a small fluctuation, we'll cause a huge spike upstream at the supplier. This is the Bullwhip Effect.", emotion: 'neutral' },
            { character: 'Mira', text: "We should use Demand Smoothing instead. Don't let a local panic ruin the whole chain.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Smooth the Demand Signal.",
            action: "Choose between ordering conservatively (demand smoothing) or panic-buying (safety surge). Watch the Bullwhip Index."
        }
    },
    {
        day: 4,
        title: "Truck Breakdown",
        description: "A major delivery is stuck on the highway. Your JIT system faces its biggest test.",
        lesson: "Concept: Safety Buffers & Supply Disruption.",
        dialogue: [
            { character: 'Rao', text: "Bad news. The truck broke down. Your primary delivery is delayed by 24 hours.", emotion: 'stressed' },
            { character: 'Rao', text: "Disaster! See, this is why I hate JIT! Everything is too fragile!", emotion: 'angry' },
            { character: 'Mira', text: "This is exactly what the Safety Buffer is for. Let's see if our buffer holds, or if we need to call an emergency substitute supplier.", emotion: 'worried' }
        ],
        event: 'recovery',
        briefing: {
            objective: "Survive the Disruption.",
            action: "Your JIT system is at breaking point. Rely on your safety buffer or pay for an emergency courier."
        }
    },
    {
        day: 5,
        title: "Stage 1 Opening",
        description: "The final day before hand-over. Time to review your flow metrics.",
        lesson: "Concept: Flow Review & Handover.",
        dialogue: [
            { character: 'Rao', text: "The client is here for the final inspection of the week's progress.", emotion: 'neutral' },
            { character: 'Mira', text: "Let's review our flow metrics, inventory turns, and how much 'bullwhip' we caused our suppliers.", emotion: 'happy' },
            { character: 'Inspector', text: "You did it. The concourse is safe, clean, and ready for passengers.", emotion: 'happy' },
            { character: 'Engineer', text: "That's the power of Lean. We minimized the disruption and maximized the flow of value.", emotion: 'happy' }
        ],
        event: 'chapter_complete',
        briefing: {
            objective: "Final Review.",
            action: "Complete the remaining tasks and prepare for the chapter review."
        }
    }
];
