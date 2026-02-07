export interface LeanTerm {
  term: string;
  keywords: string[];
  definition: string;
}

export const LEAN_TERMS: LeanTerm[] = [
  { term: 'WIP', keywords: ['WIP', 'Work-In-Progress', 'Work In Progress'], definition: 'Tasks currently being worked on. Limiting WIP prevents bottlenecks.' },
  { term: 'WIP Limit', keywords: ['WIP Limit', 'WIP limit', 'wip limit'], definition: 'Maximum tasks allowed in a column at once to prevent overload.' },
  { term: 'Kanban', keywords: ['Kanban', 'kanban'], definition: 'Visual workflow management using cards and columns to control WIP.' },
  { term: 'Pull System', keywords: ['Pull System', 'Pull system', 'pull system', 'Pull-based'], definition: 'Work is pulled into production only when there is capacity.' },
  { term: 'Push System', keywords: ['Push System', 'Push system', 'push system', 'Push-based'], definition: 'Work forced into production regardless of capacity, creating waste.' },
  { term: 'Flow', keywords: ['Flow'], definition: 'Smooth movement of work through the system from start to finish.' },
  { term: 'Bottleneck', keywords: ['Bottleneck', 'bottleneck'], definition: 'A point where work piles up because capacity is exceeded.' },
  { term: 'Waste', keywords: ['Waste', 'Muda', 'waste'], definition: 'Any activity that consumes resources but does not add value.' },
  { term: 'Throughput', keywords: ['Throughput', 'throughput'], definition: 'The rate at which tasks are completed.' },
  { term: 'Cycle Time', keywords: ['Cycle Time', 'cycle time'], definition: 'Time from when a task starts to when it finishes.' },
  { term: 'PPC', keywords: ['PPC', 'Percent Plan Complete'], definition: 'Measures planning reliability: Tasks Completed / Tasks Promised.' },
  { term: 'LPS', keywords: ['LPS', 'Last Planner System', 'Last Planner'], definition: 'A production planning system based on reliable commitments.' },
  { term: 'Constraint', keywords: ['Constraint', 'constraint'], definition: 'Any prerequisite preventing a task from being executed.' },
  { term: 'Make Ready', keywords: ['Make Ready', 'make ready'], definition: 'Actively removing constraints so tasks become executable.' },
  { term: 'Sound Activity', keywords: ['Sound Activity', 'Sound activity', 'sound activity'], definition: 'A task with all constraints removed, fully ready to execute.' },
  { term: 'Should/Can/Will', keywords: ['Should/Can/Will', 'SHOULD/CAN/WILL'], definition: 'Three planning levels: what SHOULD happen, what CAN happen, what WILL happen.' },
  { term: 'Reliable Promise', keywords: ['Reliable Promise', 'reliable promise'], definition: 'A commitment made only after verifying all prerequisites are met.' },
  { term: 'Starvation', keywords: ['Starvation', 'starvation'], definition: 'When workers have no tasks because upstream has not delivered.' },
];
