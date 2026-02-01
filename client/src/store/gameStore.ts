import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getRandomTask, TaskType, CONSTRUCTION_TASKS } from '@/data/tasks';

export interface DialogueLine {
  character: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'stressed' | 'angry';
}

export interface Task extends TaskType {
  status: 'backlog' | 'ready' | 'doing' | 'done';
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  wipLimit: number; // 0 for no limit
}

export interface GameState {
  // Progression
  chapter: number;
  day: number;
  week: number;
  phase: 'planning' | 'action' | 'review';

  // Player Profile
  playerName: string;
  playerGender: 'male' | 'female';
  setPlayerProfile: (name: string, gender: 'male' | 'female') => void;

  // Tutorial
  tutorialActive: boolean;
  tutorialStep: number;

  // Dialogue logic
  currentDialogue: DialogueLine[] | null;
  dialogueIndex: number;

  // Metrics (LPI - Lean Performance Index)
  lpi: {
    flowEfficiency: number;
    ppc: number; // Percent Plan Complete
    wipCompliance: number;
    wasteRemoved: number;
    teamMorale: number;
  };

  // Kanban State
  columns: Column[];

  // Resources
  funds: number;
  materials: number;

  // Flags
  flags: Record<string, boolean>;

  // Actions
  setChapter: (chapter: number) => void;
  advanceDay: () => void;
  updateLPI: (metric: keyof GameState['lpi'], value: number) => void;

  // Logs
  log: string[];
  addLog: (msg: string) => void;

  setFlag: (key: string, value: boolean) => void; // Generic flag setter
  updateMorale: (delta: number) => void;

  // Dialogue Actions
  startDialogue: (lines: DialogueLine[]) => void;
  advanceDialogue: () => void;
  closeDialogue: () => void;

  // Kanban Actions
  moveTask: (taskId: string, sourceColId: string, destColId: string) => boolean; // Return success/fail
  setWipLimit: (colId: string, limit: number) => void;
  addTask: () => void;

  // Tutorial Actions
  setTutorialStep: (step: number) => void;
  completeTutorial: () => void;

  // Resource Actions
  addMaterials: (amount: number) => void; // For debug or events
  injectWaste: () => void;
  addDailyTasks: (count: number) => void;
}

const INITIAL_COLUMNS: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      { ...CONSTRUCTION_TASKS[0], id: 'init-1', status: 'backlog' },
      { ...CONSTRUCTION_TASKS[3], id: 'init-2', status: 'backlog' },
      { ...CONSTRUCTION_TASKS[6], id: 'init-3', status: 'backlog' }
    ],
    wipLimit: 0
  },
  { id: 'ready', title: 'Ready', tasks: [], wipLimit: 3 },
  { id: 'doing', title: 'Doing', tasks: [], wipLimit: 2 },
  { id: 'done', title: 'Done', tasks: [], wipLimit: 0 },
];

export const useGameStore = create<GameState>((set, get) => ({
  chapter: 1,
  day: 1,
  week: 1,
  phase: 'action',

  playerName: 'Engineer',
  playerGender: 'male',
  setPlayerProfile: (name, gender) => set({ playerName: name, playerGender: gender }),

  tutorialActive: true,
  tutorialStep: 0,

  currentDialogue: null,
  dialogueIndex: 0,

  lpi: {
    flowEfficiency: 50,
    ppc: 0,
    wipCompliance: 100,
    wasteRemoved: 0,
    teamMorale: 50,
  },

  columns: INITIAL_COLUMNS,

  funds: 5000,
  materials: 300,

  flags: {},

  setChapter: (chapter) => set({ chapter }),

  advanceDay: () => set((state) => ({
    day: state.day + 1,
    week: Math.floor((state.day + 1) / 5) + 1,
    materials: state.materials + 150 // Daily delivery of materials
  })),

  updateLPI: (metric, value) => set((state) => ({
    lpi: { ...state.lpi, [metric]: value }
  })),

  log: [],

  addLog: (msg) => set((state) => ({ log: [msg, ...state.log].slice(0, 50) })),

  setFlag: (key, value) => set((state) => ({
    flags: { ...state.flags, [key]: value }
  })),

  updateMorale: (delta) => set((state) => ({
    lpi: {
      ...state.lpi,
      teamMorale: Math.max(0, Math.min(100, state.lpi.teamMorale + delta))
    }
  })),

  // Dialogue Implementation
  startDialogue: (lines) => set({ currentDialogue: lines, dialogueIndex: 0 }),
  advanceDialogue: () => set((state) => {
    if (!state.currentDialogue) return {};
    if (state.dialogueIndex < state.currentDialogue.length - 1) {
      return { dialogueIndex: state.dialogueIndex + 1 };
    }
    // End dialogue
    if (state.tutorialActive && state.tutorialStep === 0) {
      return { currentDialogue: null, dialogueIndex: 0, tutorialStep: 1 };
    }
    return { currentDialogue: null, dialogueIndex: 0 };
  }),
  closeDialogue: () => set({ currentDialogue: null, dialogueIndex: 0 }),

  // Kanban Implementation
  moveTask: (taskId, sourceColId, destColId) => {
    const state = get();
    const sourceCol = state.columns.find(c => c.id === sourceColId);
    const destCol = state.columns.find(c => c.id === destColId);

    if (!sourceCol || !destCol) return false;

    // 1. Check WIP Limit
    if (destColId !== 'done' && destColId !== 'backlog' && destCol.tasks.length >= destCol.wipLimit) {
      return false; // WIP Violation
    }

    const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;
    const task = sourceCol.tasks[taskIndex];

    // 2. Resource Logic
    let newMaterials = state.materials;
    let newFunds = state.funds;

    // Moving to DOING consumes Materials
    if (destColId === 'doing' && sourceColId !== 'doing') {
      if (state.materials < task.cost) {
        // Not enough materials!
        return false;
      }
      newMaterials -= task.cost;
    }

    // Moving to DONE rewards Funds
    if (destColId === 'done' && sourceColId !== 'done') {
      newFunds += task.reward;
    }

    set({
      materials: newMaterials,
      funds: newFunds,
      columns: state.columns.map(col => {
        if (col.id === sourceColId) {
          return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
        }
        if (col.id === destColId) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      }),
      // Tutorial Progression: 2->3 (To Ready), 3->4 (To Doing), 4->5 (To Done)
      tutorialStep:
        state.tutorialActive && state.tutorialStep === 2 && destColId === 'ready' ? 3 :
          state.tutorialActive && state.tutorialStep === 3 && destColId === 'doing' ? 4 :
            state.tutorialActive && state.tutorialStep === 4 && destColId === 'done' ? 5 :
              state.tutorialStep
    });

    return true;
  },

  setWipLimit: (colId, limit) => set((state) => ({
    columns: state.columns.map(col =>
      col.id === colId ? { ...col, wipLimit: limit } : col
    )
  })),

  addTask: () => set((state) => {
    const template = getRandomTask();
    const newTask: Task = {
      ...template,
      id: uuidv4(),
      status: 'backlog'
    };

    return {
      columns: state.columns.map(col =>
        col.id === 'backlog'
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    };
  }),

  setTutorialStep: (step) => set({ tutorialStep: step }),
  completeTutorial: () => set({ tutorialActive: false, tutorialStep: 99 }),
  addMaterials: (amount) => set((s) => ({ materials: s.materials + amount })),

  injectWaste: () => set((state) => {
    const wasteTask: Task = {
      id: `waste-${Date.now()}`,
      title: "⚠️ Rework",
      description: "Defects caused by rushing.",
      cost: 0,
      reward: 0,
      status: 'doing',
      type: 'defect' as any, // Cast if not in TaskType union yet
      leanTip: "Pushing work creates defects!",
      difficulty: 2 // Difficulty is a number (1-3)
    };

    return {
      columns: state.columns.map(col =>
        col.id === 'doing' ? { ...col, tasks: [wasteTask, ...col.tasks] } : col
      ),
      lpi: { ...state.lpi, teamMorale: Math.max(0, state.lpi.teamMorale - 10) }
    };
  }),

  // Gameplay Loop - Day 2+ Refill
  addDailyTasks: (count: number) => set((state) => {
    const newTasks: Task[] = Array.from({ length: count }, () => ({
      ...getRandomTask(),
      id: uuidv4(),
      status: 'backlog'
    }));

    return {
      columns: state.columns.map(col =>
        col.id === 'backlog'
          ? { ...col, tasks: [...col.tasks, ...newTasks] }
          : col
      )
    };
  })
}));
