import { DayConfig } from '../chapters/types';

export const CASE_2_SCHEDULE: DayConfig[] = [
    {
        day: 1,
        title: "The Coastal Link",
        description: "Welcome to the Coastal Highway Rehabilitation project. A 2.8km linear project with strict traffic requirements.",
        lesson: "Concept: Linear Project Flow.",
        dialogue: [
            { character: 'Rao', text: "2.8 kilometers of road to resurface, and we can only close one lane at a time. This is a nightmare.", emotion: 'stressed' },
            { character: 'Engineer', text: "It's a classic linear flow problem. Our depot is 8km away. The key is managing the buffer sizes.", emotion: 'neutral' },
            { character: 'Mira', text: "If we hold too much material on-site, we block traffic. Too little, and the paving crew starves.", emotion: 'neutral' }
        ],
        briefing: {
            objective: "Balance the Buffers.",
            action: "Configure staging zones carefully. Optimize truck dispatches to keep the paving crews working without causing traffic jams."
        }
    },
    {
        day: 2,
        title: "Setting the Pace",
        description: "The crews start to find their rhythm along the coast.",
        lesson: "Concept: Takt Time.",
        dialogue: [
            { character: 'Engineer', text: "We need the milling machine, the sweeper, and the paver moving at a continuous pace.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Maintain Continuous Flow.",
            action: "Ensure upstream operations don't outpace downstream ones."
        }
    },
    {
        day: 3,
        title: "Storm Surge",
        description: "Heavy coastal rain postpones paving operations.",
        lesson: "Concept: Weather Variation.",
        dialogue: [
            { character: 'Isha', text: "The rain is coming down in sheets. The asphalt will cool too fast if we lay it now.", emotion: 'worried' },
            { character: 'Engineer', text: "Halt paving. Divert the asphalt trucks and focus the crew on drainage clearing.", emotion: 'neutral' }
        ],
        event: 'rain',
        briefing: {
            objective: "Pivot Operations.",
            action: "Paving is blocked. Shift to weather-independent tasks to maintain productivity."
        }
    },
    {
        day: 4,
        title: "Drying Out",
        description: "The team resumes work after the storm.",
        lesson: "Concept: Catching up vs Standard Work.",
        dialogue: [
            { character: 'Rao', text: "We lost nearly a whole day! Double the truck orders!", emotion: 'angry' },
            { character: 'Engineer', text: "No, Rao. That will cause a traffic collapse. We return to standard work.", emotion: 'neutral' }
        ],
        briefing: {
            objective: "Resist the Rush.",
            action: "Avoid over-dispatching trucks which will spike your Traffic Impact penalty."
        }
    },
    {
        day: 5,
        title: "Supplier Delay",
        description: "The aggregate truck arrives a day late.",
        lesson: "Concept: Managing Starvation.",
        dialogue: [
            { character: 'Mira', text: "The quarry called. The crusher broke. Aggregate will be a day late.", emotion: 'stressed' },
            { character: 'Engineer', text: "This is why we have buffers. Let's hope our Segment 2 buffer holds.", emotion: 'neutral' }
        ],
        event: 'supply_delay',
        briefing: {
            objective: "Use Buffers Effectively.",
            action: "If your buffers were too small, your crews will starve today."
        }
    },
    {
        day: 6,
        title: "Rolling Along",
        description: "Midway through the project.",
        lesson: "Concept: Flow Efficiency.",
        dialogue: [
            { character: 'Inspector', text: "Traffic is flowing well despite the lane closure. The public isn't complaining much.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Keep the Traffic Impact low.",
            action: "Maintain operations."
        }
    },
    {
        day: 7,
        title: "Segment 4 Approaches",
        description: "Nearing the halfway mark of the corridor.",
        lesson: "Concept: Staging Management.",
        dialogue: [
            { character: 'Engineer', text: "We're moving staging to Segment 4 now. Careful with the transition.", emotion: 'neutral' }
        ],
        briefing: {
            objective: "Transition Staging.",
            action: "Adjust your buffers for the new segment."
        }
    },
    {
        day: 8,
        title: "Public Protest",
        description: "A local group protests the construction, slowing traffic further.",
        lesson: "Concept: Public Relations & Flow.",
        dialogue: [
            { character: 'Isha', text: "There's a group protesting the removal of the old coastal barrier. Traffic is crawling.", emotion: 'worried' },
            { character: 'Engineer', text: "Our truck travel time just doubled. We'll have to rely heavily on on-site inventory today.", emotion: 'neutral' }
        ],
        event: 'decision_push',
        briefing: {
            objective: "Survive the Protest.",
            action: "Truck dispatches are heavily penalized today due to congestion."
        }
    },
    {
        day: 9,
        title: "Clearing the Jam",
        description: "Protest is over, work resumes.",
        lesson: "Concept: System Recovery.",
        dialogue: [
            { character: 'Mira', text: "Road is clear. Let's get moving.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Recover.",
            action: "Return to normal operations."
        }
    },
    {
        day: 10,
        title: "Emergency Pipe Repair",
        description: "A surprise urgent work order is added on Segment 4.",
        lesson: "Concept: Unplanned Work.",
        dialogue: [
            { character: 'Rao', text: "The milling machine hit an unmapped culvert pipe! It's shattered!", emotion: 'angry' },
            { character: 'Engineer', text: "We have to fix that before we can pave. Deploy the emergency crew.", emotion: 'neutral' }
        ],
        event: 'constraints_visible',
        briefing: {
            objective: "Immediate Action Required.",
            action: "An urgent repair task must be handled before paving can advance on Segment 4."
        }
    },
    {
        day: 11,
        title: "The Home Stretch",
        description: "Pushing through the final segments.",
        lesson: "Concept: Consistency.",
        dialogue: [
            { character: 'Engineer', text: "Almost there. Keep the rhythm steady.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Steady Flow.",
            action: "Maintain your paving speed."
        }
    },
    {
        day: 12,
        title: "Inspector Early Audit",
        description: "The inspector arrives early to check quality.",
        lesson: "Concept: Built-in Quality.",
        dialogue: [
            { character: 'Inspector', text: "I'm here for a core sample on the new asphalt.", emotion: 'neutral' },
            { character: 'Rao', text: "But we haven't finished rolling it yet!", emotion: 'stressed' },
            { character: 'Engineer', text: "If we followed standard procedures, the quality will be there, Rao.", emotion: 'neutral' }
        ],
        event: 'inspection',
        briefing: {
            objective: "Pass the Audit.",
            action: "Your rework rate metrics will be tested."
        }
    },
    {
        day: 13,
        title: "Final Fixes",
        description: "Addressing any minor issues found by the inspector.",
        lesson: "Concept: Continuous Improvement.",
        dialogue: [
            { character: 'Mira', text: "Just a few minor drainage adjustments needed based on the audit.", emotion: 'happy' }
        ],
        briefing: {
            objective: "Complete Adjustments.",
            action: "Finish the final tasks."
        }
    },
    {
        day: 14,
        title: "Road Open",
        description: "The coastal link is completed.",
        lesson: "Concept: Project Delivery.",
        dialogue: [
            { character: 'Inspector', text: "Excellent work. You completed a 2.8km resurfacing with minimal disruption to the city.", emotion: 'happy' },
            { character: 'Engineer', text: "That's the result of carefully balanced buffers and continuous flow.", emotion: 'happy' }
        ],
        event: 'chapter_complete',
        briefing: {
            objective: "Project Complete.",
            action: "Congratulations. You have completed the Coastal Link case study."
        }
    }
];
