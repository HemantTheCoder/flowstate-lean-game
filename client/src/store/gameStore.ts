import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getRandomTask, TaskType, CONSTRUCTION_TASKS } from '@/data/tasks';

export interface DialogueLine {
  character: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'stressed' | 'angry' | 'worried';
}

export type ConstraintType = 'material' | 'crew' | 'approval' | 'weather'; // red icon if present
export type GamePhase = 'planning' | 'action' | 'review';

export interface Task extends TaskType {
  status: 'backlog' | 'ready' | 'doing' | 'done';
  originalId?: string;
  constraints?: ConstraintType[]; // If empty, task is "Sound" (Green)
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  wipLimit: number; // 0 for owners
}

export interface GameState {
  // Progression
  chapter: number;
  day: number;
  week: number;
  phase: GamePhase; // New: Tracks if we are in Planning Room or Site
  unlockedChapters: number[];
  completeChapter: (chapter: number) => void;

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
    ppc: number; // Percent Plan Complete (Last Week)
    wipCompliance: number;
    wasteRemoved: number;
    teamMorale: number;
  };

  // NEW: Historical daily metrics for end-of-chapter charts
  dailyMetrics: {
    day: number;
    efficiency: number;
    tasksCompletedToday: number;
    potentialCapacity: number;
    cumulativeEfficiency: number; // Running total efficiency
    insight: string; // What happened this day
  }[];

  // Track previous done count for delta calculation
  previousDoneCount: number;
  previousWasteCount: number;

  // Cumulative tracking for progressive efficiency
  cumulativeTasksCompleted: number;
  cumulativePotentialCapacity: number;

  // NEW: Historical PPC for trending
  ppcHistory: { week: number, ppc: number }[];

  // NEW: Last Planner Commitments
  weeklyPlan: string[]; // IDs of tasks committed to "Ready" this week

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
  startChapter: (chapter: number) => void;
  // setChapter: (chapter: number) => void; // Deprecated, use startChapter
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

  // Chapter 2: LPS Actions
  removeConstraint: (taskId: string, constraint: ConstraintType) => void;
  commitPlan: (taskIds: string[]) => void;
  enterPlanningPhase: () => void;
  calculatePPC: () => number;
  // Generic Task Update (for events)
  updateTask: (taskId: string, updates: Partial<Task>) => void;
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
  unlockedChapters: [1],

  playerName: 'Engineer',
  playerGender: 'male',
  setPlayerProfile: (name, gender) => set({ playerName: name, playerGender: gender }),

  tutorialActive: true,
  tutorialStep: 0,



  weeklyPlan: [],
  ppcHistory: [],
  dailyMetrics: [],
  previousDoneCount: 0,
  previousWasteCount: 0,
  cumulativeTasksCompleted: 0,
  cumulativePotentialCapacity: 0,

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
  funds: 2500,
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

  startChapter: (chapter) => set((state) => {
    const commonUpdates = {
      chapter,
      currentDialogue: null,
      dialogueIndex: 0,
    };

    if (chapter === 1) {
      return {
        ...commonUpdates,
        day: 1,
        week: 1,
        phase: 'action',
        columns: INITIAL_COLUMNS,
        funds: 2500,
        materials: 300,
        dailyMetrics: [],
        previousDoneCount: 0,
        previousWasteCount: 0,
        cumulativeTasksCompleted: 0,
        cumulativePotentialCapacity: 0,
        weeklyPlan: [],
        flags: { ...state.flags, chapter_intro_seen: false }
      };
    }

    if (chapter === 2) {
      const chapter2Tasks: Task[] = CONSTRUCTION_TASKS.slice(0, 10).map(t => ({
        ...t,
        id: uuidv4(),
        status: 'backlog' as const,
        originalId: t.id,
        constraints: t.constraints || []
      }));

      const chapter2Columns: Column[] = [
        { id: 'backlog', title: 'Master Schedule', tasks: chapter2Tasks, wipLimit: 0 },
        { id: 'ready', title: 'Lookahead', tasks: [], wipLimit: 5 },
        { id: 'doing', title: 'Doing', tasks: [], wipLimit: 3 },
        { id: 'done', title: 'Done', tasks: [], wipLimit: 0 },
      ];

      return {
        ...commonUpdates,
        day: 6,
        week: 2,
        phase: 'planning',
        columns: chapter2Columns,
        funds: 3000,
        materials: 400,
        dailyMetrics: [],
        previousDoneCount: 0,
        previousWasteCount: 0,
        cumulativeTasksCompleted: 0,
        cumulativePotentialCapacity: 0,
        weeklyPlan: [],
        ppcHistory: state.ppcHistory,
        flags: { ...state.flags, chapter_intro_seen: false, day_6_started: false }
      };
    }

    return { ...commonUpdates };
  }),

  completeChapter: (chapter) => set((state) => {
    if (!state.unlockedChapters.includes(chapter + 1)) {
      return { unlockedChapters: [...state.unlockedChapters, chapter + 1] };
    }
    return {};
  }),

  advanceDay: () => set((state) => {
    const nextDay = state.day + 1;
    const dailyCost = 250; // Daily Overhead

    // 1. Calculate WIP Compliance
    const violatingCols = state.columns.filter(c => c.wipLimit > 0 && c.tasks.length > c.wipLimit);
    const compliance = violatingCols.length > 0 ? 50 : 100;

    // 2. Calculate actual tasks completed TODAY (delta from previous day)
    const doneTasks = state.columns.find(c => c.id === 'done')?.tasks || [];
    const currentDoneCount = doneTasks.length;
    const rawTasksCompleted = currentDoneCount - state.previousDoneCount;

    // Count waste/rework tasks in done - these don't count as VALUE
    const wasteTasksInDone = doneTasks.filter(t =>
      t.title === 'REWORK' || t.id?.startsWith('waste-')
    ).length;

    // Track previous waste count to calculate new waste completed today
    const previousWasteCount = state.previousWasteCount || 0;
    const newWasteCompleted = Math.max(0, wasteTasksInDone - previousWasteCount);

    // Effective tasks = actual value-adding work (subtract waste from raw completed)
    const valueAddingCompleted = Math.max(0, rawTasksCompleted - newWasteCompleted);
    const tasksCompletedToday = valueAddingCompleted;

    // 3. Calculate POTENTIAL capacity for today
    // Based on: WIP limit in Doing column + constraints
    const doingCol = state.columns.find(c => c.id === 'doing');
    const doingLimit = doingCol?.wipLimit || 2;
    const doingTasks = doingCol?.tasks || [];
    const readyTasks = state.columns.find(c => c.id === 'ready')?.tasks || [];
    const backlogTasks = state.columns.find(c => c.id === 'backlog')?.tasks || [];

    // Non-waste tasks still in Doing (could have been finished)
    const doingNonWaste = doingTasks.filter(t => !t.id?.startsWith('waste-') && t.title !== 'REWORK').length;

    // Total tasks available across the pipeline (remaining + already completed today)
    const totalAvailableNonWaste = readyTasks.length + backlogTasks.length + doingNonWaste + valueAddingCompleted;

    // Base potential: WIP limit, but capped by total available tasks
    let potentialCapacity = Math.min(doingLimit, totalAvailableNonWaste);

    // Day 2: Material shortage - only 0-cost tasks can ENTER Doing
    // But tasks already in Doing (from prior day) can still finish
    if (state.day === 2) {
      const zeroCostReady = readyTasks.filter(t => t.cost === 0).length;
      const zeroCostBacklog = backlogTasks.filter(t => t.cost === 0).length;
      // Available = tasks already in pipeline (doing + completed today) + constrained new entries
      const availableForDay2 = doingNonWaste + valueAddingCompleted + zeroCostReady + zeroCostBacklog;
      potentialCapacity = Math.min(doingLimit, availableForDay2);
    }

    // Day 3: Weather blocks Structural - only non-structural can ENTER Doing
    // Tasks already in Doing can still finish regardless of type
    if (state.day === 3) {
      const nonStructuralReady = readyTasks.filter(t => t.type !== 'Structural').length;
      const nonStructuralBacklog = backlogTasks.filter(t => t.type !== 'Structural').length;
      const availableForDay3 = doingNonWaste + valueAddingCompleted + nonStructuralReady + nonStructuralBacklog;
      potentialCapacity = Math.min(doingLimit, availableForDay3);
    }

    // Ensure at least 1 potential (to avoid division by zero)
    potentialCapacity = Math.max(1, potentialCapacity);

    // 4. Calculate CUMULATIVE efficiency
    // Flow efficiency = (total tasks completed / total possible) * 100
    // This increases progressively if player completes all available work each day

    // Check for waste tasks anywhere (Doing, Ready, or Done)
    const allTasks = state.columns.flatMap(c => c.tasks);
    const wasteTasksInSystem = allTasks.filter(t =>
      t.title === 'REWORK' || t.id?.startsWith('waste-')
    ).length;

    // Adjust potential for Day 4/5 decision impact
    let adjustedPotential = potentialCapacity;
    let adjustedCompleted = tasksCompletedToday;
    let dayInsight = '';

    // Special Override Flag for Pull Decision
    let forceSafeFlow = false;

    // Day-specific insights and adjustments
    // Only subtract NEW waste created today (not total waste in system)
    if (state.day === 1) {
      dayInsight = tasksCompletedToday >= potentialCapacity
        ? 'Great start! WIP limits respected - Flow Logic engaged.'
        : 'Tutorial day - learning the ropes!';
      forceSafeFlow = true;
    } else if (state.day === 2) {
      dayInsight = tasksCompletedToday > 0
        ? 'Adapted to constraints! Efficiency rising.'
        : 'Bottleneck detected. Zero throughput hurts efficiency.';
    } else if (state.day === 3) {
      dayInsight = tasksCompletedToday > 0
        ? 'Variation managed. Consistent output rewards Flow.'
        : 'Weather stopped work. Idle teams kill efficiency.';
    } else if (state.day === 4) {
      if (state.flags['decision_push_made']) {
        // Push decision: Waste was created and consumed player capacity
        dayInsight = 'Push decision created rework - Flow crashes.';
        // Add waste penalty to potential (they could have done real work instead)
        adjustedPotential = potentialCapacity + wasteTasksInSystem;
      } else {
        // Pull decision: This is the "God Mode" choice for Lean
        dayInsight = 'Pull decision confirmed! Perfect Flow achieved!';
        forceSafeFlow = true; // FORCE 100%
      }
    } else if (state.day === 5) {
      if (state.flags['decision_push_made']) {
        dayInsight = 'Inspection failed. Rework destroys efficiency.';
        adjustedPotential = potentialCapacity + wasteTasksInSystem;
      } else {
        dayInsight = 'Inspection passed. Consistent reliability!';
      }
    }

    // Clamp adjustedCompleted to not exceed adjustedPotential
    adjustedCompleted = Math.min(adjustedCompleted, adjustedPotential);

    // Daily efficiency for the graph
    let dailyEff = 0;

    if (forceSafeFlow) {
      dailyEff = 100;
      adjustedCompleted = adjustedPotential; // Pretend we did everything perfect
    } else {
      dailyEff = adjustedPotential > 0
        ? Math.round((adjustedCompleted / adjustedPotential) * 100)
        : 0;
    }
    dailyEff = Math.min(100, Math.max(0, dailyEff));

    // Update cumulative totals
    // If Forced (Day 4 Pull), we RESET the cumulative framing to match the "Perfect State"
    // This ensures the graph jumps to 100% and stays high if they keep performing
    let newCumulativeCompleted = state.cumulativeTasksCompleted + adjustedCompleted;
    let newCumulativePotential = state.cumulativePotentialCapacity + adjustedPotential;

    if (forceSafeFlow) {
      // Reset history to perfect ratio to force the cumulative to 100%
      // We preserve the scale, but align completed to potential
      newCumulativePotential = newCumulativePotential > 0 ? newCumulativePotential : 10;
      newCumulativeCompleted = newCumulativePotential;
    }

    // Calculate CUMULATIVE efficiency as running average
    let cumulativeEff = newCumulativePotential > 0
      ? Math.round((newCumulativeCompleted / newCumulativePotential) * 100)
      : 0;
    cumulativeEff = Math.min(100, Math.max(0, cumulativeEff)); // Clamp 0-100

    // 5. Morale logic
    const doingCount = state.columns.find(c => c.id === 'doing')?.tasks.length || 0;
    let moraleDelta = 0;
    if (doingCount > doingLimit) {
      moraleDelta = -5; // Stress
    } else if (tasksCompletedToday > 0) {
      moraleDelta = 3; // Achievement
    } else if (doingCount > 0) {
      moraleDelta = 1; // Maintenance
    }

    if (wasteTasksInDone > 0 || state.flags['decision_push_made']) {
      moraleDelta -= 2;
    }

    // Bonus Morale for Pull
    if (forceSafeFlow) moraleDelta += 10;

    const newDailyMetric = {
      day: state.day,
      efficiency: dailyEff,
      tasksCompletedToday: adjustedCompleted,
      potentialCapacity: adjustedPotential,
      cumulativeEfficiency: cumulativeEff,
      insight: dayInsight
    };

    return {
      day: nextDay,
      week: Math.ceil(nextDay / 5),
      materials: state.materials + 150,
      funds: state.funds - dailyCost,
      dailyMetrics: [...state.dailyMetrics, newDailyMetric],
      previousDoneCount: currentDoneCount,
      previousWasteCount: wasteTasksInDone,
      cumulativeTasksCompleted: newCumulativeCompleted,
      cumulativePotentialCapacity: newCumulativePotential,
      lpi: {
        ...state.lpi,
        wipCompliance: compliance,
        flowEfficiency: cumulativeEff,
        teamMorale: Math.max(0, Math.min(100, state.lpi.teamMorale + moraleDelta))
      }
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
      title: "REWORK",
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

  importState: (data: any) => set((state) => {
    const ks = data.kanbanState || {};
    const restoredDay = ks.day ?? data.day ?? state.day;
    return {
      chapter: data.chapter ?? state.chapter,
      unlockedChapters: data.completedChapters
        ? [1, ...data.completedChapters.map((c: number) => c + 1)]
        : [1],
      day: restoredDay,
      week: data.week ?? state.week,
      playerName: data.playerName ?? state.playerName,
      playerGender: data.playerGender ?? state.playerGender,
      funds: data.resources?.budget ?? state.funds,
      materials: data.resources?.materials ?? data.materials ?? state.materials,
      flags: data.flags ?? state.flags,
      columns: ks.columns ?? state.columns,
      lpi: data.metrics ?? state.lpi,
      ppcHistory: (data.metrics?.ppcHistory as any) ?? state.ppcHistory,
      weeklyPlan: data.weeklyPlan ?? state.weeklyPlan,
      previousDoneCount: ks.previousDoneCount ?? data.previousDoneCount ?? 0,
      previousWasteCount: ks.previousWasteCount ?? data.previousWasteCount ?? 0,
      cumulativeTasksCompleted: ks.cumulativeTasksCompleted ?? data.cumulativeTasksCompleted ?? 0,
      cumulativePotentialCapacity: ks.cumulativePotentialCapacity ?? data.cumulativePotentialCapacity ?? 0,
      dailyMetrics: ks.dailyMetrics ?? data.dailyMetrics ?? state.dailyMetrics,
      tutorialActive: ks.tutorialActive ?? (restoredDay > 1 ? false : true),
      tutorialStep: ks.tutorialStep ?? (restoredDay > 1 ? 99 : 0),
    };
  }),

  // Chapter 2 Actions
  removeConstraint: (taskId, constraint) => set((state) => {
    const costs = { material: 200, crew: 0, approval: 50, weather: 0 };
    const cost = costs[constraint] || 0;

    if (state.funds < cost) return {};

    const newMorale = constraint === 'crew' ? Math.max(0, state.lpi.teamMorale - 5) : state.lpi.teamMorale;

    return {
      funds: state.funds - cost,
      lpi: { ...state.lpi, teamMorale: newMorale },
      columns: state.columns.map(col => ({
        ...col,
        tasks: col.tasks.map(t =>
          t.id === taskId
            ? { ...t, constraints: t.constraints?.filter(c => c !== constraint) }
            : t
        )
      }))
    };
  }),

  commitPlan: (taskIds) => set((state) => ({
    weeklyPlan: taskIds,
    phase: 'action', // Start the week!
    // Move committed tasks to Ready if not there (Drag and Drop handles this visually, but store ensures)
    // For now, we assume UI put them in Ready/Lookahead column.
  })),

  enterPlanningPhase: () => set({ phase: 'planning' }),

  calculatePPC: () => {
    const state = get();
    const plannedDetails = state.columns
      .flatMap(c => c.tasks)
      .filter(t => state.weeklyPlan.includes(t.id) || state.weeklyPlan.includes(t.originalId || ''));

    // In a real scenario, we'd track exactly which were committed. 
    // Simplified: Check if tasks in weeklyPlan are in 'done' column.

    const doneTasks = state.columns.find(c => c.id === 'done')?.tasks || [];
    const completedCount = doneTasks.filter(t =>
      state.weeklyPlan.includes(t.id) || state.weeklyPlan.includes(t.originalId || '')
    ).length;

    const totalPromised = state.weeklyPlan.length;
    if (totalPromised === 0) return 0;

    const ppc = Math.round((completedCount / totalPromised) * 100);

    // Save history
    set(s => ({
      lpi: { ...s.lpi, ppc },
      ppcHistory: [...s.ppcHistory, { week: s.week, ppc }]
    }));

    return ppc;
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    set(s => ({
      columns: s.columns.map(c => ({
        ...c,
        tasks: c.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      }))
    }));
  }
}));
