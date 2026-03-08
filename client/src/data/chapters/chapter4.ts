import { GamePhase } from '@/store/gameStore';

export const CHAPTER_4_SCHEDULE = {
    title: "Case Study 1: Midfield Terminal",
    description: "Introduction to Pull Systems and Just-in-Time (JIT) deliveries. Space is limited, and you must schedule deliveries precisely.",

    days: [
        {
            day: 1,
            phase: 'planning' as GamePhase,
            dialogue: [
                { character: 'Mira', text: "Welcome to the Midfield Terminal expansion. We've got major space constraints here.", emotion: 'neutral' },
                { character: 'Mira', text: "We can't just push materials to the site. If the site is full, we pay penalties. We need a Pull System.", emotion: 'worried' },
                { character: 'Old Foreman', text: "Sounds pretty in theory. But if my guys run out of timber, the whole floor stops. You better not starve my crew.", emotion: 'angry' },
                { character: 'Mira', text: "That's why we use Just-In-Time (JIT) scheduling with small safety buffers. Let's set up the Kanban limits and schedule our first delivery.", emotion: 'happy' }
            ]
        },
        {
            day: 2,
            phase: 'planning' as GamePhase,
            dialogue: [
                { character: 'Rao', text: "The client wants the VIP lounge finished early. We're seeing a sudden spike in demand for finish materials.", emotion: 'stressed' },
                { character: 'Mira', text: "We can increase our Kanban limit temporarily, or pay extra to expedite a shipment. What's your call?", emotion: 'neutral' }
            ]
        },
        {
            day: 3,
            phase: 'planning' as GamePhase,
            dialogue: [
                { character: 'Old Foreman', text: "The second floor crew pulled double their usual amount yesterday. Do we panic and order a massive shipment?", emotion: 'worried' },
                { character: 'Mira', text: "Wait! If we overreact to a small fluctuation, we'll cause a huge spike upstream at the supplier. This is the Bullwhip Effect.", emotion: 'neutral' },
                { character: 'Mira', text: "We should use Demand Smoothing instead. Don't let a local panic ruin the whole chain.", emotion: 'happy' }
            ]
        },
        {
            day: 4,
            phase: 'planning' as GamePhase,
            dialogue: [
                { character: 'Supplier', text: "Bad news. The truck broke down. Your primary delivery is delayed by 24 hours.", emotion: 'stressed' },
                { character: 'Rao', text: "Disaster! See, this is why I hate JIT! Everything is too fragile!", emotion: 'angry' },
                { character: 'Mira', text: "This is exactly what the Safety Buffer is for. Let's see if our buffer holds, or if we need to call an emergency substitute supplier.", emotion: 'worried' }
            ]
        },
        {
            day: 5,
            phase: 'review' as GamePhase,
            dialogue: [
                { character: 'Rao', text: "The client is here for the final inspection of the week's progress.", emotion: 'neutral' },
                { character: 'Mira', text: "Let's review our flow metrics, inventory turns, and how much 'bullwhip' we caused our suppliers.", emotion: 'happy' }
            ]
        }
    ]
};
