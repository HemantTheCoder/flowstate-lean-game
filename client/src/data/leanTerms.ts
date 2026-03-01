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
  { term: '5S', keywords: ['5S', '5s'], definition: 'A workplace organization method consisting of Sort, Set in Order, Shine, Standardize, and Sustain.' },
  { term: 'Sort (Seiri)', keywords: ['Sort', 'Seiri', 'sort', 'seiri'], definition: 'Separating needed tools, parts, and instructions from unneeded materials and removing the latter.' },
  { term: 'Set in Order (Seiton)', keywords: ['Set in Order', 'Seiton', 'set in order', 'seiton'], definition: 'Arranging and labeling items so they are easy to use and find by anyone (e.g., Shadow Boards).' },
  { term: 'Shine (Seiso)', keywords: ['Shine', 'Seiso', 'shine', 'seiso'], definition: 'Cleaning the workspace and equipment as a form of inspection to find abnormalities early.' },
  { term: 'Standardize (Seiketsu)', keywords: ['Standardize', 'Seiketsu', 'standardize', 'seiketsu'], definition: 'Creating strict guidelines, schedules, and visual controls to maintain the first 3S phases.' },
  { term: 'Sustain (Shitsuke)', keywords: ['Sustain', 'Shitsuke', 'sustain', 'shitsuke'], definition: 'Building the discipline and culture to uphold the rules of 5S over the long term without backsliding.' },
  { term: 'Red Tag', keywords: ['Red Tag', 'red tag', 'Red tag'], definition: 'A visual method to identify unneeded items during the "Sort" phase for removal from the workspace.' },
  { term: 'Shadow Board', keywords: ['Shadow Board', 'shadow board', 'Shadow board'], definition: 'A visual management tool where outlines of tools are drawn to indicate exactly where they belong.' },
];
