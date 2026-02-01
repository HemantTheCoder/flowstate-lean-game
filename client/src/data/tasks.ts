
export interface TaskType {
    id: string;
    title: string;
    description: string;
    type: 'Structural' | 'Systems' | 'Interior' | 'Management';
    cost: number; // Materials needed
    reward: number; // Funds gained
    difficulty: number; // 1-5, affects time?
    leanTip?: string; // Educational context
}

export const CONSTRUCTION_TASKS: TaskType[] = [
    // STRUCTURAL (High Cost, High Reward)
    {
        id: 'struct_1',
        title: 'Pour Foundation Zone A',
        description: 'Complete concrete pour for the main lobby foundation.',
        type: 'Structural',
        cost: 100,
        reward: 3500,
        difficulty: 4
    },
    {
        id: 'struct_3',
        title: 'Laying Subflooring',
        description: 'Install plywood sheeting for floors.',
        type: 'Structural',
        cost: 30,
        reward: 1200,
        difficulty: 2
    },

    // SYSTEMS (MEP)
    {
        id: 'sys_1',
        title: 'Rough-in Plumbing',
        description: 'Install initial sewage and water lines.',
        type: 'Systems',
        cost: 40,
        reward: 1800,
        difficulty: 3
    },
    {
        id: 'sys_2',
        title: 'Electrical Wiring',
        description: 'Run main electrical conduits and wires.',
        type: 'Systems',
        cost: 45,
        reward: 1900,
        difficulty: 3
    },
    {
        id: 'sys_3',
        title: 'HVAC Ductwork',
        description: 'Install air conditioning and heating ducts.',
        type: 'Systems',
        cost: 60,
        reward: 2200,
        difficulty: 3
    },

    // INTERIOR / FINISHING
    {
        id: 'int_1',
        title: 'Drywall Installation',
        description: 'Hang gypsum boards on walls and ceilings.',
        type: 'Interior',
        cost: 25,
        reward: 1000,
        difficulty: 2
    },
    {
        id: 'int_2',
        title: 'Painting Walls',
        description: 'Apply primer and finish coat.',
        type: 'Interior',
        cost: 15,
        reward: 800,
        difficulty: 1
    },
    {
        id: 'int_3',
        title: 'Install Fixtures',
        description: 'Mount lights, faucets, and switches.',
        type: 'Interior',
        cost: 50,
        reward: 1500,
        difficulty: 2
    },

    // PREP / MANAGEMENT (Low Cost, for Starvation/Delay days)
    {
        id: 'prep_1',
        title: 'Inspect Formwork',
        description: 'Verify forms while waiting for concrete.',
        type: 'Management',
        cost: 0,
        reward: 200,
        difficulty: 1,
        leanTip: 'Use downtime to ensure quality.'
    },
    {
        id: 'prep_2',
        title: 'Safety Audit',
        description: 'Review site safety protocols.',
        type: 'Management',
        cost: 0,
        reward: 300,
        difficulty: 1
    },
    {
        id: 'prep_3',
        title: 'Organize Tool Crib',
        description: 'Sort and maintain equipment.',
        type: 'Management',
        cost: 5,
        reward: 150,
        difficulty: 1
    }
];

export const getRandomTask = (): TaskType => {
    return CONSTRUCTION_TASKS[Math.floor(Math.random() * CONSTRUCTION_TASKS.length)];
};
