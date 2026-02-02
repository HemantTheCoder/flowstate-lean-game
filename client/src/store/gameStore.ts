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
  originalId?: string;
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

  // Audio Preferences
  audioSettings: {
    bgmVolume: number;
    sfxVolume: number;
    isMuted: boolean;
  };

  // Actions
  setAudioVolume: (type: 'bgm' | 'sfx', volume: number) => void;
  toggleMute: () => void;
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
  addDailyTasks: (count: number, currentDay?: number) => void;

  // Persistence
  importState: (data: any) => void;
}

const INITIAL_COLUMNS: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: CONSTRUCTION_TASKS.map(t => ({ ...t, id: uuidv4(), status: 'backlog', originalId: t.id })),
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

  audioSettings: {
    bgmVolume: 0.5,
    sfxVolume: 0.7,
    isMuted: false,
  },

  setAudioVolume: (type, volume) => set((state) => ({
    audioSettings: { ...state.audioSettings, [`${type}Volume`]: volume }
  })),

  toggleMute: () => set((state) => ({
    audioSettings: { ...state.audioSettings, isMuted: !state.audioSettings.isMuted }
  })),

  setChapter: (chapter) => set({ chapter }),

  advanceDay: () => set((state) => {
    const nextDay = state.day + 1;
    const dailyCost = 150; // Daily Overhead (Salaries, Rent)
    return {
      day: nextDay,
      week: Math.ceil(nextDay / 5),
      materials: state.materials + 150, // Daily delivery
      funds: state.funds - dailyCost
    };
  }),

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

    if (!sourceCol || !destCol || sourceColId === destColId) return false;

    // 1. Check WIP Limit (Only for Ready and Doing)
    if ((destColId === 'ready' || destColId === 'doing') && destCol.tasks.length >= destCol.wipLimit) {
      return false; // WIP Violation
    }

    const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;
    const task = sourceCol.tasks[taskIndex];

    // 2. Resource Logic
    let newMaterials = state.materials;
    let newFunds = state.funds;

    // Moving TO DOING consumes Materials (unless coming from Doing)
    if (destColId === 'doing' && sourceColId !== 'doing') {
      if (state.materials < task.cost) {
        return false;
      }
      newMaterials -= task.cost;
    }

    // Moving FROM DOING to anything else (except Done) refunds materials (Undo logic)
    if (sourceColId === 'doing' && destColId !== 'doing' && destColId !== 'done') {
      newMaterials += task.cost;
    }

    // Moving TO DONE rewards Funds (unless already coming from Done)
    if (destColId === 'done' && sourceColId !== 'done') {
      newFunds += task.reward;
    }

    // Moving FROM DONE to anything else (Undo logic) removes funds
    if (sourceColId === 'done' && destColId !== 'done') {
      newFunds = Math.max(0, newFunds - task.reward);
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
      // Tutorial Progression logic can be refined later if needed
    });

    return true;
  },

  setWipLimit: (colId, limit) => set((state) => ({
    columns: state.columns.map(col =>
      col.id === colId ? { ...col, wipLimit: limit } : col
    )
  })),

  addTask: () => set((state) => {
    // Attempt to find a unique task that isn't already on the board
    let template = getRandomTask();
    let attempts = 0;
    const existingIds = new Set(state.columns.flatMap(c => c.tasks.map(t => t.originalId)));

    while (existingIds.has(template.id) && attempts < 10) {
      template = getRandomTask();
      attempts++;
    }

    // If we couldn't find a unique one, we might just not add one, or duplicate if strictly needed.
    // For now, let's respect "Unique Only" strictly.
    if (existingIds.has(template.id)) {
      return {}; // Do nothing if all tasks taken
    }

    const newTask: Task = {
      ...template,
      id: uuidv4(),
      status: 'backlog',
      originalId: template.id
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
  addDailyTasks: (count: number, currentDay?: number) => set((state) => {
    // User Request: "Unique Only".
    // Filter out tasks that are already present in ANY column.

    const existingIds = new Set(state.columns.flatMap(c => c.tasks.map(t => t.originalId)));

    const newTasks: Task[] = CONSTRUCTION_TASKS
      .filter(t => !existingIds.has(t.id))
      .map(template => ({
        ...template,
        id: uuidv4(),
        status: 'backlog',
        originalId: template.id
      }));

    return {
      columns: state.columns.map(col =>
        col.id === 'backlog'
          ? { ...col, tasks: [...col.tasks, ...newTasks] }
          : col
      )
    };
  }),

  importState: (data: any) => set((state) => ({
    chapter: data.chapter ?? state.chapter,
    day: data.day ?? state.day,
    week: data.week ?? state.week,
    playerName: data.playerName ?? state.playerName,
    playerGender: data.playerGender ?? state.playerGender,
    funds: data.resources?.budget ?? state.funds,
    materials: data.materials ?? state.materials,
    flags: data.flags ?? state.flags,
    columns: data.kanbanState?.columns ?? state.columns,
    lpi: data.metrics ?? state.lpi,
  }))
}));
