export interface ConstructionMaterial {
    name: string;
    amount: number;
}

export interface ConstructionTaskData {
    id: string; // e.g., 'task-1'
    stepNumber: number; // 1 to 22
    title: string;
    description: string;
    type: 'Structural' | 'Interior' | 'Systems' | 'Exterior';
    difficulty: number; // 1-5 scale for duration/complexity
    materialsRequired: ConstructionMaterial[];
    completionWeight: number; // Percentage contribution (0-100)
    costToStart: number; // Cost in Rupees deducted when moving to In Progress
}

export const MASTER_CONSTRUCTION_TASKS: ConstructionTaskData[] = [
    {
        id: 'task-1', stepNumber: 1, title: 'Site Clearance & Preparation',
        description: 'Level the ground, remove debris, and setup the perimeter.',
        type: 'Exterior', difficulty: 1, materialsRequired: [],
        completionWeight: 2, costToStart: 50000000
    },
    {
        id: 'task-2', stepNumber: 2, title: 'Excavation & Trenching',
        description: 'Digging trenches for the foundation footing.',
        type: 'Structural', difficulty: 2, materialsRequired: [],
        completionWeight: 3, costToStart: 80000000
    },
    {
        id: 'task-3', stepNumber: 3, title: 'Anti-Termite Treatment',
        description: 'Chemical treatment of foundation soil.',
        type: 'Exterior', difficulty: 1, materialsRequired: [{ name: 'Chemicals', amount: 20 }],
        completionWeight: 1, costToStart: 30000000
    },
    {
        id: 'task-4', stepNumber: 4, title: 'Foundation Concrete Pouring',
        description: 'Pouring PCC and footing concrete.',
        type: 'Structural', difficulty: 4, materialsRequired: [{ name: 'Concrete', amount: 100 }, { name: 'Steel', amount: 50 }],
        completionWeight: 6, costToStart: 250000000
    },
    {
        id: 'task-5', stepNumber: 5, title: 'Foundation Curing',
        description: 'Water curing period for the foundation concrete to gain strength.',
        type: 'Structural', difficulty: 1, materialsRequired: [{ name: 'Water', amount: 500 }],
        completionWeight: 2, costToStart: 10000000
    },
    {
        id: 'task-6', stepNumber: 6, title: 'Plinth Beam Construction',
        description: 'Tying rebars and pouring concrete for plinth beams.',
        type: 'Structural', difficulty: 3, materialsRequired: [{ name: 'Concrete', amount: 60 }, { name: 'Steel', amount: 80 }],
        completionWeight: 5, costToStart: 180000000
    },
    {
        id: 'task-7', stepNumber: 7, title: 'Backfilling & Compaction',
        description: 'Filling soil back into foundation gaps and compacting it.',
        type: 'Structural', difficulty: 2, materialsRequired: [{ name: 'Sand/Soil', amount: 200 }],
        completionWeight: 3, costToStart: 60000000
    },
    {
        id: 'task-8', stepNumber: 8, title: 'Ground Floor Slab Casting',
        description: 'Formwork, bar bending, and concrete pour for the ground slab.',
        type: 'Structural', difficulty: 5, materialsRequired: [{ name: 'Concrete', amount: 120 }, { name: 'Steel', amount: 100 }],
        completionWeight: 7, costToStart: 350000000
    },
    {
        id: 'task-9', stepNumber: 9, title: 'Column Erection',
        description: 'Raising columns from ground to first floor level.',
        type: 'Structural', difficulty: 4, materialsRequired: [{ name: 'Concrete', amount: 80 }, { name: 'Steel', amount: 120 }],
        completionWeight: 6, costToStart: 280000000
    },
    {
        id: 'task-10', stepNumber: 10, title: 'First Floor Slab & Beams',
        description: 'Casting the first floor roof slab.',
        type: 'Structural', difficulty: 5, materialsRequired: [{ name: 'Concrete', amount: 120 }, { name: 'Steel', amount: 100 }],
        completionWeight: 7, costToStart: 350000000
    },
    {
        id: 'task-11', stepNumber: 11, title: 'Superstructure Brickwork',
        description: 'Laying the external and internal brick walls.',
        type: 'Structural', difficulty: 3, materialsRequired: [{ name: 'Bricks', amount: 5000 }, { name: 'Cement', amount: 50 }],
        completionWeight: 10, costToStart: 450000000
    },
    {
        id: 'task-12', stepNumber: 12, title: 'Lintel & Chajja Casting',
        description: 'Casting lintels over doors and windows.',
        type: 'Structural', difficulty: 2, materialsRequired: [{ name: 'Concrete', amount: 30 }, { name: 'Steel', amount: 20 }],
        completionWeight: 3, costToStart: 120000000
    },
    {
        id: 'task-13', stepNumber: 13, title: 'Roofing / Top Slab',
        description: 'Final structural slab casting.',
        type: 'Structural', difficulty: 5, materialsRequired: [{ name: 'Concrete', amount: 120 }, { name: 'Steel', amount: 100 }],
        completionWeight: 6, costToStart: 350000000
    },
    {
        id: 'task-14', stepNumber: 14, title: 'Internal Electrical Rough-in',
        description: 'Laying conduits and wiring paths in walls.',
        type: 'Systems', difficulty: 3, materialsRequired: [{ name: 'Wiring', amount: 200 }, { name: 'Conduits', amount: 50 }],
        completionWeight: 4, costToStart: 150000000
    },
    {
        id: 'task-15', stepNumber: 15, title: 'Internal Plumbing Rough-in',
        description: 'Laying PVC pipes for water and drainage.',
        type: 'Systems', difficulty: 3, materialsRequired: [{ name: 'PVC Pipes', amount: 100 }],
        completionWeight: 4, costToStart: 180000000
    },
    {
        id: 'task-16', stepNumber: 16, title: 'Internal Plastering',
        description: 'Plastering the inside brick walls.',
        type: 'Interior', difficulty: 3, materialsRequired: [{ name: 'Cement', amount: 80 }, { name: 'Sand', amount: 150 }],
        completionWeight: 6, costToStart: 250000000
    },
    {
        id: 'task-17', stepNumber: 17, title: 'External Plastering',
        description: 'Plastering the outside envelope of the building.',
        type: 'Exterior', difficulty: 4, materialsRequired: [{ name: 'Cement', amount: 100 }, { name: 'Sand', amount: 200 }],
        completionWeight: 6, costToStart: 300000000
    },
    {
        id: 'task-18', stepNumber: 18, title: 'Waterproofing',
        description: 'Applying waterproof membrane on roof and wet areas.',
        type: 'Systems', difficulty: 2, materialsRequired: [{ name: 'Chemicals', amount: 40 }],
        completionWeight: 3, costToStart: 120000000
    },
    {
        id: 'task-19', stepNumber: 19, title: 'Flooring & Tiling',
        description: 'Laying floor tiles and bathroom wall tiles.',
        type: 'Interior', difficulty: 4, materialsRequired: [{ name: 'Tiles', amount: 400 }, { name: 'Cement', amount: 40 }],
        completionWeight: 7, costToStart: 400000000
    },
    {
        id: 'task-20', stepNumber: 20, title: 'Doors & Windows',
        description: 'Fixing frames, doors, and glass windows.',
        type: 'Interior', difficulty: 3, materialsRequired: [{ name: 'Wood/Alum', amount: 50 }, { name: 'Glass', amount: 20 }],
        completionWeight: 4, costToStart: 250000000
    },
    {
        id: 'task-21', stepNumber: 21, title: 'Painting & Finishing',
        description: 'Applying putty, primer, and final paint coats.',
        type: 'Interior', difficulty: 2, materialsRequired: [{ name: 'Paint', amount: 100 }, { name: 'Putty', amount: 50 }],
        completionWeight: 3, costToStart: 180000000
    },
    {
        id: 'task-22', stepNumber: 22, title: 'Final Fixtures',
        description: 'Installing electrical faceplates, lights, and plumbing taps.',
        type: 'Systems', difficulty: 2, materialsRequired: [{ name: 'Fixtures', amount: 60 }],
        completionWeight: 2, costToStart: 200000000
    }
];
