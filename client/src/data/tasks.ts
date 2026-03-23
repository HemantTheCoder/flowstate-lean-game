
export interface TaskIcon {
    src: string;
    alt: string;
}

export interface TaskType {
    id: string;
    title: string;
    description: string;
    type: 'Structural' | 'Systems' | 'Interior' | 'Management' | 'Exterior';
    cost: number; // Materials needed
    reward: number; // Funds gained
    difficulty: number; // 1-5, affects time?
    leanTip?: string; // Educational context
    constraints?: ('material' | 'crew' | 'approval' | 'weather' | 'space')[]; // Chapter 2: LPS Constraints
    icon?: TaskIcon;
    stepNumber?: number;
    materialsRequired?: { name: string; amount: number }[];
    completionWeight?: number;
    costToStart?: number;
}

export const CONSTRUCTION_TASKS: TaskType[] = [
    {
        id: 'task-1', stepNumber: 1, title: 'Site Clearance & Preparation',
        description: 'Level the ground, remove debris, and setup fences. This is the first step to ensure a safe and organized workspace.',
        type: 'Exterior', difficulty: 1, materialsRequired: [],
        completionWeight: 2, costToStart: 85000, cost: 0, reward: 97750,
        leanTip: 'Standardizing site layout prevents future transport waste.'
    },
    {
        id: 'task-2', stepNumber: 2, title: 'Excavation & Trenching',
        description: 'Digging deep trenches for the building foundations. Vital for stability.',
        type: 'Structural', difficulty: 2, materialsRequired: [],
        completionWeight: 3, costToStart: 150000, cost: 0, reward: 172500,
        leanTip: 'Sequential excavation prevents unstable earth walls.'
    },
    {
        id: 'task-3', stepNumber: 3, title: 'Anti-Termite Treatment',
        description: 'Applying chemicals to the soil to prevent future structural damage from pests.',
        type: 'Exterior', difficulty: 1, materialsRequired: [{ name: 'Chemicals', amount: 20 }],
        completionWeight: 1, costToStart: 45000, cost: 20, reward: 51750
    },
    {
        id: 'task-4', stepNumber: 4, title: 'Foundation Concrete Pour',
        description: 'Pouring the heavy concrete base of the building. This is where the real structure begins.',
        type: 'Structural', difficulty: 4, materialsRequired: [{ name: 'Concrete', amount: 100 }, { name: 'Steel', amount: 50 }],
        completionWeight: 6, costToStart: 450000, cost: 150, reward: 517500, constraints: ['crew', 'approval']
    },
    {
        id: 'task-5', stepNumber: 5, title: 'Foundation Curing',
        description: 'Keeping the concrete wet so it reaches maximum strength. A critical waiting period.',
        type: 'Structural', difficulty: 1, materialsRequired: [{ name: 'Water', amount: 500 }],
        completionWeight: 2, costToStart: 12000, cost: 10, reward: 13800
    },
    {
        id: 'task-6', stepNumber: 6, title: 'Plinth Beam Construction',
        description: 'Building the horizontal support beams that connect foundation columns.',
        type: 'Structural', difficulty: 3, materialsRequired: [{ name: 'Concrete', amount: 60 }, { name: 'Steel', amount: 80 }],
        completionWeight: 5, costToStart: 280000, cost: 140, reward: 322000
    },
    {
        id: 'task-7', stepNumber: 7, title: 'Backfilling & Compaction',
        description: 'Filling soil back into foundation gaps and packing it tight.',
        type: 'Structural', difficulty: 2, materialsRequired: [{ name: 'Sand/Soil', amount: 200 }],
        completionWeight: 3, costToStart: 75000, cost: 40, reward: 86250
    },
    {
        id: 'task-8', stepNumber: 8, title: 'Ground Floor Slab Casting',
        description: 'Creating the floor surface for the ground level.',
        type: 'Structural', difficulty: 5, materialsRequired: [{ name: 'Concrete', amount: 120 }, { name: 'Steel', amount: 100 }],
        completionWeight: 7, costToStart: 550000, cost: 220, reward: 632500, constraints: ['material']
    },
    {
        id: 'task-9', stepNumber: 9, title: 'Column Erection',
        description: 'Setting up the vertical pillars for the next floor.',
        type: 'Structural', difficulty: 4, materialsRequired: [{ name: 'Concrete', amount: 80 }, { name: 'Steel', amount: 120 }],
        completionWeight: 6, costToStart: 380000, cost: 200, reward: 437000
    },
    {
        id: 'task-10', stepNumber: 10, title: 'First Floor Slab & Beams',
        description: 'Casting the ceiling of the ground floor / floor of the first level.',
        type: 'Structural', difficulty: 5, materialsRequired: [{ name: 'Concrete', amount: 120 }, { name: 'Steel', amount: 100 }],
        completionWeight: 7, costToStart: 550000, cost: 220, reward: 632500, constraints: ['weather']
    },
    {
        id: 'task-11', stepNumber: 11, title: 'Superstructure Brickwork',
        description: 'Laying out the walls using bricks/blocks.',
        type: 'Structural', difficulty: 3, materialsRequired: [{ name: 'Bricks', amount: 5000 }, { name: 'Cement', amount: 50 }],
        completionWeight: 10, costToStart: 650000, cost: 150, reward: 747500
    },
    {
        id: 'task-12', stepNumber: 12, title: 'Lintel & Chajja Casting',
        description: 'Horizontal supports over door/window openings.',
        type: 'Structural', difficulty: 2, materialsRequired: [{ name: 'Concrete', amount: 30 }, { name: 'Steel', amount: 20 }],
        completionWeight: 3, costToStart: 120000, cost: 50, reward: 138000
    },
    {
        id: 'task-13', stepNumber: 13, title: 'Roofing / Top Slab',
        description: 'The final concrete slab for the top of the house.',
        type: 'Structural', difficulty: 5, materialsRequired: [{ name: 'Concrete', amount: 120 }, { name: 'Steel', amount: 100 }],
        completionWeight: 6, costToStart: 550000, cost: 220, reward: 632500
    },
    {
        id: 'task-14', stepNumber: 14, title: 'Internal Electrical Rough-in',
        description: 'Installing internal wiring paths before wall finishing.',
        type: 'Systems', difficulty: 3, materialsRequired: [{ name: 'Wiring', amount: 200 }, { name: 'Conduits', amount: 50 }],
        completionWeight: 4, costToStart: 250000, cost: 60, reward: 287500, constraints: ['approval']
    },
    {
        id: 'task-15', stepNumber: 15, title: 'Internal Plumbing Rough-in',
        description: 'Laying internal water and sewage pipes.',
        type: 'Systems', difficulty: 3, materialsRequired: [{ name: 'PVC Pipes', amount: 100 }],
        completionWeight: 4, costToStart: 220000, cost: 50, reward: 253000
    },
    {
        id: 'task-16', stepNumber: 16, title: 'Internal Plastering',
        description: 'Smoothing out the interior brick walls with a cement mix.',
        type: 'Interior', difficulty: 3, materialsRequired: [{ name: 'Cement', amount: 80 }, { name: 'Sand', amount: 150 }],
        completionWeight: 6, costToStart: 350000, cost: 100, reward: 402500
    },
    {
        id: 'task-17', stepNumber: 17, title: 'External Plastering',
        description: 'Applying protective plaster to the outside of the house.',
        type: 'Exterior', difficulty: 4, materialsRequired: [{ name: 'Cement', amount: 100 }, { name: 'Sand', amount: 200 }],
        completionWeight: 6, costToStart: 450000, cost: 120, reward: 517500
    },
    {
        id: 'task-18', stepNumber: 18, title: 'Waterproofing',
        description: 'Sealing the roof and bathrooms to prevent leaks.',
        type: 'Systems', difficulty: 2, materialsRequired: [{ name: 'Chemicals', amount: 40 }],
        completionWeight: 3, costToStart: 180000, cost: 40, reward: 207000
    },
    {
        id: 'task-19', stepNumber: 19, title: 'Flooring & Tiling',
        description: 'Laying tiles on the floors and walls.',
        type: 'Interior', difficulty: 4, materialsRequired: [{ name: 'Tiles', amount: 400 }, { name: 'Cement', amount: 40 }],
        completionWeight: 7, costToStart: 650000, cost: 150, reward: 747500
    },
    {
        id: 'task-20', stepNumber: 20, title: 'Doors & Windows',
        description: 'Installing door frames, doors, and glass windows.',
        type: 'Interior', difficulty: 3, materialsRequired: [{ name: 'Wood/Alum', amount: 50 }, { name: 'Glass', amount: 20 }],
        completionWeight: 4, costToStart: 450000, cost: 80, reward: 517500
    },
    {
        id: 'task-21', stepNumber: 21, title: 'Painting & Finishing',
        description: 'Final coats of paint to make things look beautiful.',
        type: 'Interior', difficulty: 2, materialsRequired: [{ name: 'Paint', amount: 100 }, { name: 'Putty', amount: 50 }],
        completionWeight: 3, costToStart: 250000, cost: 60, reward: 287500
    },
    {
        id: 'task-22', stepNumber: 22, title: 'Final Fixtures',
        description: 'Installing light switches, faucets, and bathroom fittings.',
        type: 'Systems', difficulty: 2, materialsRequired: [{ name: 'Fixtures', amount: 60 }],
        completionWeight: 2, costToStart: 180000, cost: 70, reward: 207000
    }
];

export const CHAPTER_2_TASKS: TaskType[] = [
    { id: 'ch2_struct_1', title: 'Mall Entrance Canopy', description: 'Install steel and glass canopy structure over main entrance.', type: 'Structural', cost: 120, reward: 380, difficulty: 4, leanTip: 'Complex assemblies need all prerequisites cleared before starting.', constraints: ['material', 'approval'] },
    { id: 'ch2_struct_2', title: 'Parking Deck Ramp', description: 'Pour concrete ramp connecting parking levels.', type: 'Structural', cost: 100, reward: 320, difficulty: 4, leanTip: 'Concrete pours are time-critical - crew readiness is essential.', constraints: ['crew'] },
    { id: 'ch2_struct_3', title: 'Escalator Pit Prep', description: 'Excavate and form escalator machine room pit.', type: 'Structural', cost: 80, reward: 260, difficulty: 3, leanTip: 'Equipment foundations require precise tolerances - no rework allowed.' },
    { id: 'ch2_struct_4', title: 'Loading Dock Frame', description: 'Erect steel frame for rear loading dock area.', type: 'Structural', cost: 90, reward: 280, difficulty: 3, leanTip: 'Sequencing steel erection prevents trade stacking.', constraints: ['weather'] },
    { id: 'ch2_struct_5', title: 'Food Court Slab', description: 'Pour reinforced concrete slab for food court area.', type: 'Structural', cost: 110, reward: 350, difficulty: 4, leanTip: 'Slab-on-grade needs soil compaction verified first.', constraints: ['material'] },
    { id: 'ch2_sys_1', title: 'Elevator Shaft Wiring', description: 'Run power and control cables for passenger elevators.', type: 'Systems', cost: 55, reward: 220, difficulty: 3, leanTip: 'Elevator work is on the critical path - delays cascade everywhere.', constraints: ['approval'] },
    { id: 'ch2_sys_2', title: 'Sprinkler Main Loop', description: 'Install main fire suppression loop for all floors.', type: 'Systems', cost: 65, reward: 240, difficulty: 3, leanTip: 'Fire safety systems need inspection approvals before walls close.' },
    { id: 'ch2_sys_3', title: 'Chiller Plant Hookup', description: 'Connect central HVAC chiller to distribution system.', type: 'Systems', cost: 70, reward: 260, difficulty: 4, leanTip: 'Mechanical equipment needs tested before handover.', constraints: ['crew', 'material'] },
    { id: 'ch2_sys_4', title: 'Security System Rough-in', description: 'Install conduit and wiring for CCTV and access control.', type: 'Systems', cost: 35, reward: 160, difficulty: 2, leanTip: 'Low-voltage systems are often forgotten until too late.' },
    { id: 'ch2_int_1', title: 'Retail Storefront Glass', description: 'Install frameless glass facades for anchor tenant spaces.', type: 'Interior', cost: 85, reward: 300, difficulty: 3, leanTip: 'Glass installation requires clean, controlled environment.', constraints: ['material'] },
    { id: 'ch2_int_2', title: 'Food Court Tiling', description: 'Lay anti-slip ceramic tiles in food court service area.', type: 'Interior', cost: 40, reward: 140, difficulty: 2, leanTip: 'Floor finishes must follow MEP rough-in completion.' },
    { id: 'ch2_int_3', title: 'Mall Signage Install', description: 'Mount wayfinding signs and tenant directory boards.', type: 'Interior', cost: 25, reward: 90, difficulty: 1, leanTip: 'Signage installation is a downstream task - keep it for last.' },
    { id: 'ch2_int_4', title: 'Washroom Fit-out', description: 'Install public washroom fixtures, partitions and mirrors.', type: 'Interior', cost: 45, reward: 180, difficulty: 2, leanTip: 'Washrooms have many trades overlapping - coordination is key.', constraints: ['crew'] },
    { id: 'ch2_int_5', title: 'Ceiling Grid Install', description: 'Hang suspended ceiling grid and acoustic tiles.', type: 'Interior', cost: 30, reward: 120, difficulty: 2, leanTip: 'Ceiling work must wait for above-ceiling MEP to be inspected.' },
    { id: 'ch2_mgmt_1', title: 'Permit Coordination', description: 'Coordinate with city inspectors for occupancy permits.', type: 'Management', cost: 0, reward: 40, difficulty: 2, leanTip: 'Proactive permit coordination prevents schedule delays.' },
    { id: 'ch2_mgmt_2', title: 'Subcontractor Alignment', description: 'Hold coordination meeting with all active subcontractors.', type: 'Management', cost: 0, reward: 35, difficulty: 1, leanTip: 'Weekly coordination meetings are the heartbeat of LPS.' },
    { id: 'ch2_mgmt_3', title: 'Material Staging Plan', description: 'Organize laydown area and material delivery sequence.', type: 'Management', cost: 0, reward: 30, difficulty: 1, leanTip: 'Just-in-time material delivery reduces site congestion.' },
];

export const getRandomTask = (): TaskType => {
    return CONSTRUCTION_TASKS[Math.floor(Math.random() * CONSTRUCTION_TASKS.length)];
};
