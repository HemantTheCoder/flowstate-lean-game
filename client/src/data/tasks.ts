
export interface TaskType {
    id: string;
    title: string;
    description: string;
    type: 'Structural' | 'Systems' | 'Interior' | 'Management';
    cost: number; // Materials needed
    reward: number; // Funds gained
    difficulty: number; // 1-5, affects time?
    leanTip?: string; // Educational context
    constraints?: ('material' | 'crew' | 'approval' | 'weather')[]; // Chapter 2: LPS Constraints
}

export const CONSTRUCTION_TASKS: TaskType[] = [
    // STRUCTURAL (Outdoor, High Cost/Reward, Blocked by Rain)
    { id: 'struct_1', title: 'Pour Foundation Zone A', description: 'Complete concrete pour for main lobby. Requires precise schedule coordination.', type: 'Structural', cost: 100, reward: 3500, difficulty: 4, leanTip: 'Foundation is a critical bottleneck. Ensure readiness before mobilizing.', constraints: ['approval', 'crew'] }, // Complex start
    { id: 'struct_2', title: 'Erect Steel Beams', description: 'Crane operation for 2nd floor framing. High resource intensity.', type: 'Structural', cost: 150, reward: 4000, difficulty: 5, leanTip: 'Just-in-Time delivery of steel avoids site congestion.', constraints: ['material'] },
    { id: 'struct_3', title: 'Laying Subflooring', description: 'Install structural plywood sheeting for main floors.', type: 'Structural', cost: 30, reward: 1200, difficulty: 2, leanTip: 'Standardized work instructions reduce variability in install times.' },
    { id: 'struct_4', title: 'Roof Truss Assembly', description: 'Assemble timber trusses on-site for roof structure.', type: 'Structural', cost: 80, reward: 2500, difficulty: 3, leanTip: 'Pre-assembly is a form of off-site lean manufacturing.', constraints: ['weather'] },
    { id: 'struct_5', title: 'Ext. Wall Framing', description: 'Frame exterior load-bearing walls with 2x6 studs.', type: 'Structural', cost: 60, reward: 2000, difficulty: 3, leanTip: 'Limit inventory of lumber to match the pace of framing.' },
    { id: 'struct_6', title: 'Window Installation', description: 'Install weather-sealed glazing units.', type: 'Structural', cost: 90, reward: 2800, difficulty: 2, leanTip: 'Wait for structural settlement before final window fit-out.', constraints: ['material'] },

    // SYSTEMS (Indoor, Rain Safe, Med Cost)
    { id: 'sys_1', title: 'Rough-in Plumbing', description: 'Install core sewage and water lines through foundations.', type: 'Systems', cost: 40, reward: 1800, difficulty: 3, leanTip: 'Multi-trade coordination prevents rework in MEP systems.', constraints: ['approval'] },
    { id: 'sys_2', title: 'Electrical Wiring', description: 'Run main conduits and distribution wiring.', type: 'Systems', cost: 45, reward: 1900, difficulty: 3, leanTip: 'Visual management of conduit runs speeds up inspection.' },
    { id: 'sys_3', title: 'HVAC Ductwork', description: 'Install ventilation and air handling ducts.', type: 'Systems', cost: 60, reward: 2200, difficulty: 3, leanTip: 'Large ductwork is bulky inventory; pull it only when needed.' },
    { id: 'sys_4', title: 'Fire Sprinklers', description: 'Install overhead fire suppression piping.', type: 'Systems', cost: 55, reward: 2100, difficulty: 3, leanTip: 'Sequential installation avoids trade interference with HVAC.' },
    { id: 'sys_5', title: 'Data Cabling', description: 'Run CAT6 networking and low-voltage control lines.', type: 'Systems', cost: 20, reward: 1400, difficulty: 1, leanTip: 'Batching cable pulls can lead to hidden rework if specs change.' },

    // INTERIOR (Indoor, Rain Safe, Finishing)
    { id: 'int_1', title: 'Drywall Installation', description: 'Hang gypsum wallboards. Requires clear MEP rough-in.', type: 'Interior', cost: 25, reward: 1000, difficulty: 2, leanTip: 'A stable work environment is required for quality drywall finish.' },
    { id: 'int_2', title: 'Painting Walls', description: 'Apply high-durability primer and architectural finish.', type: 'Interior', cost: 15, reward: 800, difficulty: 1, leanTip: '5S cleanliness is vital before final architectural painting.' },
    { id: 'int_3', title: 'Install Fixtures', description: 'Mount lighting, switches, and device plates.', type: 'Interior', cost: 50, reward: 1500, difficulty: 2, leanTip: 'Standardizing fixture types reduces supply chain complexity.' },
    { id: 'int_4', title: 'Flooring Install', description: 'Lay technical ceramic tiles and modular carpet.', type: 'Interior', cost: 70, reward: 2400, difficulty: 2, leanTip: 'Protect finished floors to avoid late-stage rework waste.' },
    { id: 'int_5', title: 'Door Hanging', description: 'Install interior commercial door sets and hardware.', type: 'Interior', cost: 30, reward: 1100, difficulty: 1, leanTip: 'Last-minute door hanging prevents damage during main construction.' },

    // MANAGEMENT / PREP (0 Cost, for Supply Delay days)
    { id: 'prep_1', title: 'Inspect Formwork', description: 'Verify forms waiting for concrete.', type: 'Management', cost: 0, reward: 200, difficulty: 1, leanTip: 'Quality at source!' },
    { id: 'prep_2', title: 'Safety Audit', description: 'Review site safety protocols.', type: 'Management', cost: 0, reward: 300, difficulty: 1 },
    { id: 'prep_3', title: 'Organize Tool Crib', description: 'Sort and maintain equipment.', type: 'Management', cost: 5, reward: 150, difficulty: 1 },
    { id: 'prep_4', title: 'Review Blueprints', description: 'Check drawings for conflicts.', type: 'Management', cost: 0, reward: 250, difficulty: 2 },
    { id: 'prep_5', title: 'Clean Site', description: 'Remove debris and hazards.', type: 'Management', cost: 0, reward: 100, difficulty: 1 },
    { id: 'prep_6', title: 'Team Stretching', description: 'Morning warm-up for safety.', type: 'Management', cost: 0, reward: 50, difficulty: 1, leanTip: 'Respect for people.' }
];

export const getRandomTask = (): TaskType => {
    return CONSTRUCTION_TASKS[Math.floor(Math.random() * CONSTRUCTION_TASKS.length)];
};
