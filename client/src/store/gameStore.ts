import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getRandomTask, TaskType, CONSTRUCTION_TASKS, CHAPTER_2_TASKS } from '@/data/tasks';
import { saveCustomTasks, loadCustomTasks } from '@/lib/customTaskStorage';

export interface DialogueLine {
  character: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'stressed' | 'angry' | 'worried';
}

export interface DepotItem {
  id: string;
  type: 'tool' | 'material' | 'trash' | 'hazard';
  name: string;
  isBroken?: boolean;
  idealZoneId?: string;
  currentZoneId?: string; // 'unassigned', 'trash', 'zone-x'
}

export interface DepotZone {
  id: string;
  name: string;
  acceptsType: 'tool' | 'material' | 'trash' | 'hazard';
  capacity: number;
}

export type ConstraintType = 'material' | 'crew' | 'approval' | 'weather' | 'space'; // red icon if present
export type GamePhase = 'planning' | 'action' | 'review';

export interface Task extends TaskType {
  status: 'backlog' | 'ready' | 'doing' | 'done';
  originalId?: string;
  constraints?: ConstraintType[];
  fragile?: boolean;
  failed?: boolean;
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
  unlockedBadges: string[];
  badgeDates: Record<string, string>;
  completeChapter: (chapter: number) => void;
  unlockBadge: (badgeId: string) => void;

  // Player Profile
  playerName: string;
  playerGender: 'male' | 'female';
  designation: string;
  currency: 'INR' | 'USD';
  setPlayerProfile: (name: string, gender: 'male' | 'female', designation: string, currency: 'INR' | 'USD') => void;
  lives: number;
  gameOverReason: string | null;
  loseLife: (reason: string) => void;
  resetLives: () => void;

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

  // EVM: Earned Value tracking (% completion weight accumulated on task done)
  earnedValue: number; // 0-100 cumulative completion %

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

  // Dev Tools
  setDay: (day: number) => void;
  setChapter: (chapter: number) => void;
  unlockAllChapters: () => void;

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

  // Custom Task Actions
  customTasks: TaskType[];
  taskModeSelected: boolean;
  taskMode: 'predefined' | 'custom';
  setTaskModeSelected: (val: boolean) => void;
  setTaskMode: (mode: 'predefined' | 'custom') => void;
  addCustomTask: (task: TaskType) => void;
  editCustomTask: (id: string, updates: Partial<TaskType>) => void;
  deleteCustomTask: (id: string) => void;
  replaceTask: (existingTaskOriginalId: string, newTask: TaskType) => void;
  clearBacklogForCustomTasks: () => void;

  // Tutorial Actions
  setTutorialStep: (step: number) => void;
  completeTutorial: () => void;

  // Resource Actions
  addMaterials: (amount: number) => void; // For debug or events
  injectWaste: () => void;
  addDailyTasks: (count: number, currentDay?: number) => void;

  // Persistence
  bypassHydration: boolean;
  setBypassHydration: (val: boolean) => void;
  importState: (data: any) => void;

  // Chapter 3: 5S Actions
  depotItems: DepotItem[];
  depotZones: DepotZone[];
  depotScore: number;
  moveDepotItem: (itemId: string, zoneId: string) => void;
  cleanDepotHazard: (itemId: string) => void;
  evaluate5S: () => void;

  // Chapter 2: LPS Actions
  removeConstraint: (taskId: string, constraint: ConstraintType) => void;
  commitPlan: (taskIds: string[]) => void;
  enterPlanningPhase: () => void;
  calculatePPC: () => number;
  applyDayEvent: (day: number) => void;
  addConstraintsToRandomTasks: (count: number, constraintType: ConstraintType) => void;
  // Generic Task Update (for events)
  updateTask: (taskId: string, updates: Partial<Task>) => void;

  // Chapter 4 (Case 1): Terminal T-Upgrade
  hoistSlots: number;
  pdi: number; // Passenger Disruption Index
  reworkRate: number;

  // Chapter 5 (Case 2): Coastal Link
  trafficImpact: number;
  segmentBuffers: Record<string, number>;

  // Chapter 4 (Core Version): Pull & JIT Systems
  bullwhipIndex: number;
  pullScore: number;
  inventoryTurns: number;
  jitOnTimeDelivery: number;
  buffers: Record<string, number>; // Safety stock per material
  materialsInventory: Record<string, number>; // current on-site stock
  kanbanLimits: Record<string, number>; // wip limit per trade
  deliveries: any[]; // active scheduled deliveries
  pullMetrics: { day: number; demand: number; ordersUpstream: number }[]; // Track variance over days

  // Chapter 4 Actions
  setKanbanLimit: (trade: string, limit: number) => void;
  setBuffer: (material: string, amount: number) => void;
  orderMaterial: (material: string, amount: number, etaDay: number) => void;
  receiveDeliveries: (currentDay: number) => void;
  consumeMaterial: (material: string, amount: number) => boolean;
}

const INITIAL_COLUMNS: Column[] = [
  {
    id: 'backlog',
    title: 'To-Do List',
    tasks: CONSTRUCTION_TASKS.map(t => ({ ...t, id: uuidv4(), status: 'backlog', originalId: t.id })),
    wipLimit: 0
  },
  { id: 'doing', title: 'In Progress', tasks: [], wipLimit: 3 },
  { id: 'done', title: 'Completed', tasks: [], wipLimit: 0 },
];

export const formatCurrency = (amount: number, currency: 'INR' | 'USD' = 'INR') => {
    if (currency === 'USD') {
        const usdAmount = amount / 83; // Approx conversion
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usdAmount);
    }
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const useGameStore = create<GameState>((set, get) => ({
  chapter: 1,
  day: 1,
  week: 1,
  phase: 'action',
  unlockedChapters: [1],
  unlockedBadges: [],
  badgeDates: {},

  playerName: 'Lean Champion',
  playerGender: 'male',
  designation: 'Lean Champion',
  currency: 'INR',
  setPlayerProfile: (name, gender, designation, currency) => set({ playerName: name, playerGender: gender, designation, currency }),
  lives: 3,
  gameOverReason: null,
  loseLife: (reason) => {
    const currentLives = get().lives;
    if (currentLives > 0) {
      const remaining = currentLives - 1;
      set({ lives: remaining });
      get().addLog(`⚠️ Life Lost: ${reason}`);
      if (remaining === 0) {
        set({ gameOverReason: reason, flags: { ...get().flags, game_over: true } });
      }
    }
  },
  resetLives: () => set({ lives: 3 }),

  // Dev Actions
  setDay: (day) => set((state) => ({ day, week: Math.ceil(day / 5) })),
  setChapter: (chapter) => get().startChapter(chapter),
  unlockAllChapters: () => set({ unlockedChapters: [1, 2, 3, 4] }),

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
  funds: 5000000, // 50 Lakhs starting funds
  materials: 1000,
  earnedValue: 0,

  // Chapter 3 State Defaults
  depotItems: [],
  depotZones: [],
  depotScore: 0,

  // Chapter 4 Defaults
  hoistSlots: 3,
  pdi: 0,
  reworkRate: 0,

  bullwhipIndex: 0,
  pullScore: 0,
  inventoryTurns: 0,
  jitOnTimeDelivery: 100,
  buffers: { timber: 0, pipes: 0, electrical: 0 },
  materialsInventory: { timber: 0, pipes: 0, electrical: 0 },
  kanbanLimits: { carpentry: 3, finish: 2, electrical: 2 },
  deliveries: [],
  pullMetrics: [],

  // Chapter 5 Defaults
  trafficImpact: 0,
  segmentBuffers: {},

  flags: {},
  bypassHydration: false,

  audioSettings: {
    bgmVolume: 0.5,
    sfxVolume: 0.7,
    isMuted: false,
  },

  setBypassHydration: (val) => set({ bypassHydration: val }),
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
      gameOverReason: null,
      bypassHydration: true, // Manual chapter start should ignore server state on next mount
    };

    // Reset lives only if starting fresh (Ch 1) or if following a Game Over
    const shouldResetLives = chapter === 1 || state.lives <= 0;
    const finalLives = shouldResetLives ? 3 : state.lives;

    if (chapter === 1) {
      return {
        ...commonUpdates,
        day: 1,
        week: 1,
        phase: 'action',
        columns: INITIAL_COLUMNS,
        funds: 15000000,
        materials: 300,
        earnedValue: 0,
        dailyMetrics: [],
        previousDoneCount: 0,
        previousWasteCount: 0,
        cumulativePotentialCapacity: 0,
        weeklyPlan: [],
        lives: 3,
        taskModeSelected: false,
        taskMode: 'predefined' as const,
        flags: { ...state.flags, chapter_intro_seen: false, character_cast_seen: false, game_over: false }
      };
    }

    if (chapter === 2) {
      const chapter2Tasks: Task[] = CHAPTER_2_TASKS.map(t => ({
        ...t,
        id: uuidv4(),
        status: 'backlog' as const,
        originalId: t.id,
        constraints: t.constraints ? [...t.constraints] : []
      }));

      const chapter2Columns: Column[] = [
        { id: 'backlog', title: 'Master Schedule', tasks: chapter2Tasks, wipLimit: 0 },
        { id: 'doing', title: 'In Progress', tasks: [], wipLimit: 4 },
        { id: 'done', title: 'Completed', tasks: [], wipLimit: 0 },
      ];

      return {
        ...commonUpdates,
        day: 6,
        week: 2,
        phase: 'planning',
        columns: chapter2Columns,
        funds: 25000000,
        materials: 500,
        dailyMetrics: [],
        previousDoneCount: 0,
        previousWasteCount: 0,
        cumulativeTasksCompleted: 0,
        cumulativePotentialCapacity: 0,
        weeklyPlan: [],
        ppcHistory: state.ppcHistory,
        lives: finalLives,
        taskModeSelected: false,
        taskMode: 'predefined' as const,
        flags: { ...state.flags, chapter_intro_seen: false, character_cast_seen: false, ch2_day_6_started: false, game_over: false }
      };
    }

    if (chapter === 3) {
      return {
        ...commonUpdates,
        day: 12,
        week: 3,
        phase: 'planning',
        columns: [
          { id: 'backlog', title: 'Master Schedule', tasks: [], wipLimit: 0 },
          { id: 'doing', title: 'In Progress', tasks: [], wipLimit: 2 },
          { id: 'done', title: 'Completed', tasks: [], wipLimit: 0 },
        ],
        funds: 40000000,
        materials: 1000,
        depotItems: [
          // Row 1
          { id: 'd-1', type: 'tool', name: 'Power Drill', idealZoneId: 'zone-tools', currentZoneId: 'unassigned' },
          { id: 'd-2', type: 'material', name: 'Copper Wiring', idealZoneId: 'zone-mats', currentZoneId: 'unassigned' },
          { id: 'd-3', type: 'trash', name: 'Broken Saw Blade', isBroken: true, currentZoneId: 'unassigned' },
          { id: 'd-4', type: 'trash', name: 'Shattered Tile', currentZoneId: 'unassigned' },

          // Row 2
          { id: 'd-5', type: 'tool', name: 'Socket Wrench', idealZoneId: 'zone-tools', currentZoneId: 'unassigned' },
          { id: 'd-6', type: 'hazard', name: 'Oil Spill', currentZoneId: 'unassigned' },
          { id: 'd-7', type: 'material', name: 'PVC Pipes', idealZoneId: 'zone-mats', currentZoneId: 'unassigned' },
          { id: 'd-8', type: 'tool', name: 'Measuring Tape', idealZoneId: 'zone-tools', currentZoneId: 'unassigned' },

          // Row 3
          { id: 'd-9', type: 'trash', name: 'Rusted Screws', currentZoneId: 'unassigned' },
          { id: 'd-10', type: 'hazard', name: 'Frayed Cable', currentZoneId: 'unassigned' },
          { id: 'd-11', type: 'material', name: 'Cement Bag', idealZoneId: 'zone-mats', currentZoneId: 'unassigned' },
          { id: 'd-12', type: 'tool', name: 'Spirit Level', idealZoneId: 'zone-tools', currentZoneId: 'unassigned' },

          // Row 4
          { id: 'd-13', type: 'trash', name: 'Empty Paint Can', currentZoneId: 'unassigned' },
          { id: 'd-14', type: 'material', name: 'Lumber', idealZoneId: 'zone-mats', currentZoneId: 'unassigned' },
          { id: 'd-15', type: 'hazard', name: 'Tripping Wire', currentZoneId: 'unassigned' },
          { id: 'd-16', type: 'tool', name: 'Screwdriver Set', idealZoneId: 'zone-tools', currentZoneId: 'unassigned' },
        ],
        depotZones: [
          { id: 'zone-tools', name: 'Tool Shadow Board', acceptsType: 'tool', capacity: 6 },
          { id: 'zone-mats', name: 'Material Storage', acceptsType: 'material', capacity: 6 },
          { id: 'zone-trash', name: 'Red Tag Area', acceptsType: 'trash', capacity: 6 },
        ],
        depotScore: 0,
        dailyMetrics: [],
        previousDoneCount: 0,
        previousWasteCount: 0,
        cumulativeTasksCompleted: 0,
        cumulativePotentialCapacity: 0,
        weeklyPlan: [],
        lives: finalLives,
        flags: { ...state.flags, chapter_intro_seen: false, character_cast_seen: false, game_over: false }
      };
    }

    if (chapter === 4) {
      return {
        ...commonUpdates,
        day: 1,
        week: 1,
        phase: 'planning',
        columns: INITIAL_COLUMNS,
        funds: 10000,
        materials: 500,
        hoistSlots: 3,
        pdi: 0,
        reworkRate: 0,
        pullScore: 0,
        bullwhipIndex: 0,
        inventoryTurns: 0,
        jitOnTimeDelivery: 100,
        pullMetrics: [],
        materialsInventory: { timber: 30, pipes: 20, electrical: 20 },
        buffers: { timber: 0, pipes: 0, electrical: 0 },
        kanbanLimits: { carpentry: 3, finish: 2, electrical: 2 },
        deliveries: [],
        dailyMetrics: [],
        previousDoneCount: 0,
        previousWasteCount: 0,
        cumulativeTasksCompleted: 0,
        cumulativePotentialCapacity: 0,
        lives: finalLives,
        tutorialStep: state.flags['chapter4_tutorial_seen'] ? 0 : 20,
        tutorialActive: !state.flags['chapter4_tutorial_seen'],
        flags: { ...state.flags, case_intro_seen: false, character_cast_seen: true, chapter_intro_seen: true, game_over: false }
      };
    }

    if (chapter === 5) {
      return {
        ...commonUpdates,
        day: 1,
        week: 1,
        phase: 'action',
        columns: INITIAL_COLUMNS,
        funds: 20000,
        materials: 1000,
        trafficImpact: 0,
        segmentBuffers: {
          's1': 0, 's2': 0, 's3': 0, 's4': 0, 's5': 0, 's6': 0, 's7': 0, 's8': 0
        },
        lives: finalLives,
        flags: { ...state.flags, case_intro_seen: false, character_cast_seen: true, chapter_intro_seen: true, game_over: false }
      };
    }

    return { ...commonUpdates };
  }),

  completeChapter: (chapterId) => {
    const nextChapter = chapterId + 1;

    // First reset state to the beginning of the next chapter
    get().startChapter(nextChapter);

    // Then ensure the next chapter is marked as unlocked
    set((state) => {
      if (!state.unlockedChapters.includes(nextChapter)) {
        return { unlockedChapters: [...state.unlockedChapters, nextChapter] };
      }
      return {};
    });
  },

  unlockBadge: (badgeId) => set((state) => {
    if (!state.unlockedBadges.includes(badgeId)) {
      console.log(`Badge Unlocked: ${badgeId}`);
      return {
        unlockedBadges: [...state.unlockedBadges, badgeId],
        badgeDates: { ...state.badgeDates, [badgeId]: new Date().toISOString() }
      };
    }
    return {};
  }),

  advanceDay: () => set((state) => {
    const nextDay = state.day + 1;
    const dailyCost = 250000; // Daily Overhead (2.5 Lakhs)

    // 1. Calculate WIP Compliance (Removed penalty for parallel task support)
    const compliance = 100; 

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
    const doingLimit = Math.max(doingCol?.wipLimit || 0, 5); // Minimum capacity of 5 for parallel tasks
    const doingTasks = doingCol?.tasks || [];
    const backlogTasks = state.columns.find(c => c.id === 'backlog')?.tasks || [];

    // Non-waste tasks still in Doing (could have been finished)
    const doingNonWaste = doingTasks.filter(t => !t.id?.startsWith('waste-') && t.title !== 'REWORK').length;

    // Total tasks available across the pipeline (remaining + already completed today)
    const totalAvailableNonWaste = backlogTasks.length + doingNonWaste + valueAddingCompleted;

    // Base potential: WIP limit, but capped by total available tasks
    let potentialCapacity = Math.min(doingLimit, totalAvailableNonWaste);

    // Day 2: Material shortage - only 0-cost tasks can ENTER Doing
    // But tasks already in Doing (from prior day) can still finish
    if (state.day === 2) {
      const zeroCostBacklog = backlogTasks.filter(t => t.cost === 0).length;
      // Available = tasks already in pipeline (doing + completed today) + constrained new entries
      const availableForDay2 = doingNonWaste + valueAddingCompleted + zeroCostBacklog;
      potentialCapacity = Math.min(doingLimit, availableForDay2);
    }

    // Day 3: Weather blocks Structural - only non-structural can ENTER Doing
    // Tasks already in Doing can still finish regardless of type
    if (state.day === 3) {
      const nonStructuralBacklog = backlogTasks.filter(t => t.type !== 'Structural').length;
      const availableForDay3 = doingNonWaste + valueAddingCompleted + nonStructuralBacklog;
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
    let dailyEff = 0;

    // Special Override Flag for Pull Decision
    let forceSafeFlow = false;
    let nextColumns = state.columns;

    // Day-specific insights and adjustments
    if (state.chapter === 3) {
      if (state.day === 12) {
        // Sort Phase
        const allTrash = state.depotItems.filter(i => i.type === 'trash' || i.isBroken);
        const sortedTrash = allTrash.filter(i => i.currentZoneId === 'zone-trash');
        dailyEff = allTrash.length > 0 ? Math.round((sortedTrash.length / allTrash.length) * 100) : 100;
        adjustedPotential = 100;
        adjustedCompleted = dailyEff;
        dayInsight = dailyEff === 100 ? 'Perfect Sort phase. All waste isolated.' : `Sort incomplete. ${allTrash.length - sortedTrash.length} waste items remaining.`;
      } else if (state.day === 13) {
        // Set in Order Phase
        const allUseful = state.depotItems.filter(i => (i.type === 'tool' || i.type === 'material') && !i.isBroken);
        const sortedUseful = allUseful.filter(i => {
          const zone = state.depotZones.find(z => z.id === i.currentZoneId);
          return zone && zone.acceptsType === i.type;
        });
        dailyEff = allUseful.length > 0 ? Math.round((sortedUseful.length / allUseful.length) * 100) : 100;
        adjustedPotential = 100;
        adjustedCompleted = dailyEff;
        dayInsight = dailyEff >= 90 ? 'Set in Order complete. Items assigned.' : `Set in Order incomplete. ${allUseful.length - sortedUseful.length} items unassigned or misplaced.`;
      } else if (state.day === 14) {
        // Shine Phase
        const hazardsRemaining = state.depotItems.filter(i => i.type === 'hazard').length;
        dailyEff = Math.max(0, 100 - (hazardsRemaining * 33));
        adjustedPotential = 100;
        adjustedCompleted = dailyEff;
        dayInsight = hazardsRemaining === 0 ? 'Shine complete. All hazards cleaned.' : `${hazardsRemaining} hazards remaining. Unsafe environment!`;
      } else if (state.day === 15) {
        // Standardize Phase (Delivery Arrival)
        let correct = 0;
        let total = state.depotItems.filter(i => i.type !== 'hazard').length;
        state.depotItems.forEach(item => {
          const zone = state.depotZones.find(z => z.id === item.currentZoneId);
          if (zone && zone.acceptsType === (item.isBroken ? 'trash' : item.type)) correct++;
        });
        const hazLeft = state.depotItems.filter(i => i.type === 'hazard').length;
        dailyEff = total > 0 ? Math.max(0, Math.round((correct / total) * 100) - (hazLeft * 20)) : 100;
        adjustedPotential = 100;
        adjustedCompleted = dailyEff;
        dayInsight = dailyEff >= 90 ? 'Standardization maintained despite new deliveries!' : 'Standards slipping. New deliveries disorganized the depot.';
      } else if (state.day === 16) {
        // Sustain Phase (Final Audit)
        state.evaluate5S(); // Ensure score is up to date
        // Note: The actual state evaluation might not be synchronous here in the read phase,
        // but it was evaluated during the interact. For safety, we can duplicate the calc or read depotScore.
        // We'll read the state.depotScore or re-calc just in case.
        let correct = 0;
        let total = state.depotItems.filter(i => i.type !== 'hazard').length;
        state.depotItems.forEach(item => {
          const zone = state.depotZones.find(z => z.id === item.currentZoneId);
          if (zone && zone.acceptsType === (item.isBroken ? 'trash' : item.type)) correct++;
        });
        const hazLeft = state.depotItems.filter(i => i.type === 'hazard').length;
        const currentDepotScore = total > 0 ? Math.max(0, Math.round((correct / total) * 100) - (hazLeft * 20)) : 100;

        dailyEff = currentDepotScore;
        adjustedPotential = 100;
        adjustedCompleted = dailyEff;
        dayInsight = `Final Audit completed with score: ${dailyEff}%.`;
      }
    } else if (state.chapter === 4) {
      // Chapter 4: Pull & JIT Mechanics 

      // Calculate Demand for the day based on tasks moved or completed
      const demand = tasksCompletedToday * 10; // Simple conversion: 1 task = 10 units demand
      const upstreamOrders = state.deliveries.filter(d => d.etaDay > state.day).reduce((sum, d) => sum + d.amount, 0);

      const metric = { day: state.day, demand, ordersUpstream: upstreamOrders };

      // Process arriving deliveries
      const arriving = state.deliveries.filter(d => d.etaDay === nextDay);
      let missingMaterials = false;

      // Extremely simplified consumption for demo 
      const currentInventory = { ...state.materialsInventory };
      if (tasksCompletedToday > 0) {
        // Just deduct a generic chunk to simulate pull. If stockouts happen, throughput drops.
        ['timber', 'pipes', 'electrical'].forEach(mat => {
          currentInventory[mat] = Math.max(0, (currentInventory[mat] || 0) - (tasksCompletedToday * 5));
          if (currentInventory[mat] === 0) missingMaterials = true;
        });
      }

      // Add arriving
      arriving.forEach(d => {
        currentInventory[d.material] = (currentInventory[d.material] || 0) + d.amount;
      });

      if (state.day === 1) {
        dayInsight = "First Pull scheduling complete. Watch those buffers.";
      } else if (state.day === 2) {
        dayInsight = "Demand spike handled. Monitor inventory levels.";
      } else if (state.day === 3) {
        dayInsight = "Bullwhip test incoming. Smoothing saves costs.";
      } else if (state.day === 4) {
        dayInsight = "Supplier disruption! Those safety buffers were critical.";
      } else if (state.day === 5) {
        dayInsight = "Final review day. How well did your JIT system perform?";
      }

      const onTimeCount = arriving.length;
      const totalPendingBefore = state.deliveries.length;
      const jitAccuracy = totalPendingBefore > 0 ? Math.round((onTimeCount / Math.max(1, totalPendingBefore)) * 100) : 100;

      const totalStock = Object.values(currentInventory).reduce((sum, v) => sum + v, 0);
      const totalDemand = demand > 0 ? demand : 10;
      const dailyTurns = totalDemand / Math.max(1, totalStock);

      if (missingMaterials) {
        dailyEff = 50;
        adjustedCompleted = Math.floor(potentialCapacity / 2);
        dayInsight = "Material Stockout! Throughput crashed. Use buffers next time.";
      } else {
        dailyEff = potentialCapacity > 0 ? Math.round((adjustedCompleted / potentialCapacity) * 100) : 0;
      }

      const pullScoreGain = missingMaterials ? -5 : (dailyEff >= 80 ? 10 : 5);

      set(s => ({
        pullMetrics: [...s.pullMetrics, metric],
        materialsInventory: currentInventory,
        deliveries: s.deliveries.filter(d => d.etaDay > nextDay),
        pullScore: Math.max(0, Math.min(100, s.pullScore + pullScoreGain)),
        inventoryTurns: Math.round(((s.inventoryTurns * (state.day - 1) + dailyTurns) / state.day) * 100) / 100,
        jitOnTimeDelivery: Math.round(((s.jitOnTimeDelivery * (state.day - 1) + jitAccuracy) / state.day)),
      }));

    } else {
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
          forceSafeFlow = true; // Fix: Ensure Day 5 is 100% efficiency for passing inspection
        }
      } else if (state.day === 9) {
        // Day 9: Commitment Day - Efficiency based on Planning Quality
        const weeklyPlan = state.weeklyPlan || [];
        if (weeklyPlan.length > 0) {
          // Calculate how many committed tasks were Sound (no constraints) vs Risky
          const committedTasks = state.columns.flatMap(c => c.tasks).filter(t => weeklyPlan.includes(t.id));
          const riskyCount = committedTasks.filter(t => (t.constraints?.length || 0) > 0 || t.fragile).length;
          const totalCount = committedTasks.length;

          // Base efficiency is 100%, deduct for risky commitments
          // If 0 tasks committed (which shouldn't happen due to UI checks), 0%
          if (totalCount > 0) {
            const riskPenalty = (riskyCount / totalCount) * 50; // Up to 50% penalty if all are risky
            dailyEff = Math.round(100 - riskPenalty);
            adjustedPotential = 100; // Normalized scale for graph
            adjustedCompleted = dailyEff;
            dayInsight = riskyCount === 0
              ? 'Perfect Weekly Work Plan! All promises are sound.'
              : `Plan committed with ${riskyCount} risky tasks. Execution may be unstable.`;
          } else {
            dailyEff = 0;
            adjustedPotential = 100;
            adjustedCompleted = 0;
            dayInsight = 'No tasks committed. Reliability is zero.';
          }
        } else {
          // Fallback if somehow empty
          dailyEff = 0;
          adjustedPotential = 100;
          adjustedCompleted = 0;
          dayInsight = 'No commitment made.';
        }
      } else if (state.day === 10) {
        // Day 10 is Execution. Efficiency is based on how many promises were actually completed.
        const weeklyPlan = state.weeklyPlan || [];
        const doneTasks = state.columns.find(c => c.id === 'done')?.tasks || [];

        let promisedCompleted = 0;
        let promisedTotal = weeklyPlan.length;

        doneTasks.forEach(t => {
          if (weeklyPlan.includes(t.id) || weeklyPlan.includes(t.originalId || '')) {
            promisedCompleted++;
          }
        });

        if (promisedTotal > 0) {
          dailyEff = Math.round((promisedCompleted / promisedTotal) * 100);
          adjustedPotential = promisedTotal;
          adjustedCompleted = promisedCompleted;
          dayInsight = promisedCompleted === promisedTotal
            ? 'All commitments met! Perfect flow.'
            : `${promisedCompleted} out of ${promisedTotal} commitments met. Focus on finishing!`;
        } else {
          dailyEff = 0;
          adjustedPotential = 1;
          adjustedCompleted = 0;
          dayInsight = 'No commitments were made to track execution.';
        }

      } else if (state.day === 11) {
        // Day 11 is PPC Review. Final Efficiency carries over the completion rate.
        const weeklyPlan = state.weeklyPlan || [];
        const doneTasks = state.columns.find(c => c.id === 'done')?.tasks || [];

        let promisedCompleted = 0;
        let promisedTotal = weeklyPlan.length;

        doneTasks.forEach(t => {
          if (weeklyPlan.includes(t.id) || weeklyPlan.includes(t.originalId || '')) {
            promisedCompleted++;
          }
        });

        if (promisedTotal > 0) {
          dailyEff = Math.round((promisedCompleted / promisedTotal) * 100);
          adjustedPotential = promisedTotal;
          adjustedCompleted = promisedCompleted;
          dayInsight = dailyEff === 100
            ? 'PPC Review passed. Exceptional reliability confirmed.'
            : `PPC Review complete. Reliability reached ${dailyEff}%.`;
        } else {
          dailyEff = 0;
          adjustedPotential = 1;
          adjustedCompleted = 0;
          dayInsight = 'PPC Review: No plan to measure against.';
        }
      }
    }

    // Clamp adjustedCompleted to not exceed adjustedPotential
    adjustedCompleted = Math.max(0, Math.min(adjustedCompleted, adjustedPotential));

    // Daily efficiency for the graph


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
      columns: nextColumns,
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

    // 1. WIP Limit — Hard Block (teaching tool: limit full = cannot drag)
    if (destColId === 'doing' && sourceColId !== 'doing' && destCol.wipLimit > 0 && destCol.tasks.length >= destCol.wipLimit) {
      return false; // Blocked — WIP limit reached. Alert sound played by caller.
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
      if (task.costToStart && state.funds < task.costToStart) {
        return false; // Not enough ₹ to start task
      }
      newMaterials -= task.cost;
      if (task.costToStart) newFunds -= task.costToStart;
    }

    // Moving FROM DOING to anything else (except Done) refunds materials (Undo logic)
    if (sourceColId === 'doing' && destColId !== 'doing' && destColId !== 'done') {
      newMaterials += task.cost;
      if (task.costToStart) newFunds += task.costToStart;
    }

    // Fragile task failure check (30% chance of failure when completing)
    if (destColId === 'done' && sourceColId === 'doing' && task.fragile && state.chapter === 2) {
      const failRoll = Math.random();
      if (failRoll < 0.3) {
        const failedTask = { ...task, failed: true, fragile: true };
        set({
          materials: newMaterials,
          funds: newFunds,
          lpi: { ...state.lpi, teamMorale: Math.max(0, state.lpi.teamMorale - 5) },
          columns: state.columns.map(col => {
            if (col.id === sourceColId) {
              return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
            }
            if (col.id === 'ready') {
              return { ...col, tasks: [...col.tasks, { ...failedTask, status: 'ready' as const }] };
            }
            return col;
          }),
          log: [...state.log, `FRAGILE FAILURE: "${task.title}" failed during execution! Constraint was not properly resolved. Task returned to Ready. -5% Morale.`]
        });
        return false;
      }
    }

    // EVM: When a task is completed, increment earnedValue by its completion weight.
    // Budget only flows down (via costToStart on move-to-doing + daily overhead).
    // earnedValue tracks % completion for Planned Value vs Earned Value analysis.
    let newEarnedValue = state.earnedValue;
    if (destColId === 'done' && sourceColId !== 'done') {
      const weight = (task as any).completionWeight || 0;
      newEarnedValue = Math.min(100, newEarnedValue + weight);
    }

    set({
      materials: newMaterials,
      funds: newFunds,
      earnedValue: newEarnedValue,
      columns: state.columns.map(col => {
        if (col.id === sourceColId) {
          return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
        }
        if (col.id === destColId) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      }),
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

  // Custom Task CRUD
  taskModeSelected: false,
  taskMode: 'predefined',
  setTaskModeSelected: (val) => set({ taskModeSelected: val }),
  setTaskMode: (mode) => set({ taskMode: mode }),
  customTasks: loadCustomTasks(),

  clearBacklogForCustomTasks: () => set((state) => ({
    columns: state.columns.map(col =>
      col.id === 'backlog' ? { ...col, tasks: [] } : col
    ),
  })),

  addCustomTask: (task) => set((state) => {
    const updated = [...state.customTasks, task];
    saveCustomTasks(updated);
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      status: 'backlog',
      originalId: task.id,
    };
    return {
      customTasks: updated,
      columns: state.columns.map(col =>
        col.id === 'backlog'
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      ),
    };
  }),

  editCustomTask: (id, updates) => set((state) => {
    const updated = state.customTasks.map(t => t.id === id ? { ...t, ...updates } : t);
    saveCustomTasks(updated);
    // Also update the task on the board if it exists
    return {
      customTasks: updated,
      columns: state.columns.map(col => ({
        ...col,
        tasks: col.tasks.map(t =>
          t.originalId === id ? { ...t, ...updates } : t
        ),
      })),
    };
  }),

  deleteCustomTask: (id) => set((state) => {
    const updated = state.customTasks.filter(t => t.id !== id);
    saveCustomTasks(updated);
    return {
      customTasks: updated,
      columns: state.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.originalId !== id),
      })),
    };
  }),

  replaceTask: (existingTaskOriginalId, newTask) => set((state) => {
    const updated = [...state.customTasks, newTask];
    saveCustomTasks(updated);
    return {
      customTasks: updated,
      columns: state.columns.map(col => ({
        ...col,
        tasks: col.tasks.map(t =>
          t.originalId === existingTaskOriginalId
            ? { ...newTask, id: t.id, status: t.status, originalId: newTask.id }
            : t
        ),
      })),
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
    const existingIds = new Set(state.columns.flatMap(c => c.tasks.map(t => t.originalId)));

    const taskPool = state.taskMode === 'custom' && state.customTasks.length > 0 ? state.customTasks : CONSTRUCTION_TASKS;

    const newTasks: Task[] = taskPool
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

    // Sync custom tasks to local storage if provided by server
    const restoredCustomTasks = ks.customTasks ?? data.customTasks ?? state.customTasks;
    if (ks.customTasks || data.customTasks) {
      saveCustomTasks(restoredCustomTasks);
    }

    return {
      customTasks: restoredCustomTasks,
      taskModeSelected: ks.taskModeSelected ?? data.taskModeSelected ?? state.taskModeSelected,
      taskMode: ks.taskMode ?? data.taskMode ?? state.taskMode,
      chapter: data.chapter ?? state.chapter,
      unlockedChapters: data.completedChapters
        ? [1, ...data.completedChapters.map((c: number) => c + 1)]
        : [1],
      unlockedBadges: data.unlockedBadges ?? [],
      day: restoredDay,
      week: data.week ?? state.week,
      phase: ks.phase ?? data.phase ?? state.phase,
      currentDialogue: ks.currentDialogue ?? state.currentDialogue,
      dialogueIndex: ks.dialogueIndex ?? state.dialogueIndex,
      playerName: data.playerName ?? state.playerName,
      playerGender: ks.playerGender ?? data.playerGender ?? state.playerGender,
      funds: data.resources?.budget ?? state.funds,
      materials: data.resources?.materials ?? data.materials ?? state.materials,
      earnedValue: ks.earnedValue ?? data.earnedValue ?? state.earnedValue,
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
      depotItems: ks.depotItems ?? data.depotItems ?? state.depotItems,
      depotZones: ks.depotZones ?? data.depotZones ?? state.depotZones,
      depotScore: ks.depotScore ?? data.depotScore ?? state.depotScore,
      hoistSlots: ks.hoistSlots ?? data.hoistSlots ?? state.hoistSlots,
      pdi: ks.pdi ?? data.pdi ?? state.pdi,
      reworkRate: ks.reworkRate ?? data.reworkRate ?? state.reworkRate,
      trafficImpact: ks.trafficImpact ?? data.trafficImpact ?? state.trafficImpact,
      segmentBuffers: ks.segmentBuffers ?? data.segmentBuffers ?? state.segmentBuffers,
      bullwhipIndex: ks.bullwhipIndex ?? data.bullwhipIndex ?? state.bullwhipIndex,
      pullScore: ks.pullScore ?? data.pullScore ?? state.pullScore,
      inventoryTurns: ks.inventoryTurns ?? data.inventoryTurns ?? state.inventoryTurns,
      jitOnTimeDelivery: ks.jitOnTimeDelivery ?? data.jitOnTimeDelivery ?? state.jitOnTimeDelivery,
      buffers: ks.buffers ?? data.buffers ?? state.buffers,
      materialsInventory: ks.materialsInventory ?? data.materialsInventory ?? state.materialsInventory,
      kanbanLimits: ks.kanbanLimits ?? data.kanbanLimits ?? state.kanbanLimits,
      deliveries: ks.deliveries ?? data.deliveries ?? state.deliveries,
      pullMetrics: ks.pullMetrics ?? data.pullMetrics ?? state.pullMetrics,
    };
  }),

  // Chapter 3 Actions
  moveDepotItem: (itemId, zoneId) => set((state) => ({
    depotItems: state.depotItems.map(item =>
      item.id === itemId ? { ...item, currentZoneId: zoneId } : item
    )
  })),
  cleanDepotHazard: (itemId) => set((state) => ({
    depotItems: state.depotItems.filter(item => item.id !== itemId),
    lpi: { ...state.lpi, teamMorale: Math.min(100, state.lpi.teamMorale + 2) }
  })),
  evaluate5S: () => set((state) => {
    let score = 0;
    let totalItems = state.depotItems.filter(i => i.type !== 'hazard').length;

    state.depotItems.forEach(item => {
      const isTrash = item.type === 'trash' || item.isBroken;
      if (isTrash && item.currentZoneId === 'zone-trash') score++;
      if (!isTrash && item.type === 'tool' && item.currentZoneId === 'zone-tools') score++;
      if (!isTrash && item.type === 'material' && item.currentZoneId === 'zone-mats') score++;
    });

    const hazardsScore = state.depotItems.filter(i => i.type === 'hazard').length === 0 ? 5 : 0;

    const finalScore = totalItems > 0 ? Math.round((score / totalItems) * 100) : 100;

    // Penalize for hazards
    const hazardsLeft = state.depotItems.filter(i => i.type === 'hazard').length;
    const adjustedScore = Math.max(0, finalScore - (hazardsLeft * 20));

    // Sustain Phase (Day 16) Audit - Life Loss
    if (state.day === 16) {
      if (hazardsLeft > 0) {
        get().loseLife("Safety Audit Failed: Active hazards were left in the workspace during the final inspection.");
      } else if (adjustedScore < 40) {
        get().loseLife("Operational Audit Failed: Workspace organization standards were critically low (below 40%).");
      }
    }

    return {
      depotScore: adjustedScore,
      lpi: { ...state.lpi, teamMorale: Math.min(100, state.lpi.teamMorale + Math.floor(adjustedScore / 10)) }
    };
  }),

  // Chapter 2 Actions
  removeConstraint: (taskId, constraint) => set((state) => {
    const costs: Record<ConstraintType, number> = { material: 200, space: 100, crew: 0, approval: 50, weather: 0 };
    const cost = costs[constraint];

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

  commitPlan: (taskIds) => set((state) => {
    const readyCol = state.columns.find(c => c.id === 'ready');
    const backlogCol = state.columns.find(c => c.id === 'backlog');
    const committedTasks = readyCol?.tasks.filter(t => taskIds.includes(t.id)).map(t => {
      const hasConstraints = (t.constraints?.length || 0) > 0;
      return hasConstraints ? { ...t, fragile: true, constraints: [] } : t;
    }) || [];
    const uncommittedReady = readyCol?.tasks.filter(t => !taskIds.includes(t.id)) || [];

    return {
      weeklyPlan: taskIds,
      phase: 'action',
      columns: state.columns.map(col => {
        if (col.id === 'ready') {
          return { ...col, tasks: committedTasks };
        }
        if (col.id === 'backlog') {
          return { ...col, tasks: [...(backlogCol?.tasks || []), ...uncommittedReady] };
        }
        return col;
      })
    };
  }),

  enterPlanningPhase: () => set({ phase: 'planning' }),

  applyDayEvent: (day: number) => set((state) => {
    if (state.chapter === 3 && day === 15) {
      // Inject new items (Delivery Arrival)
      const newItems: DepotItem[] = [
        { id: `d-17-${Date.now()}`, type: 'material', name: 'New Shipment: Tiles', idealZoneId: 'zone-mats', currentZoneId: 'unassigned' },
        { id: `d-18-${Date.now()}`, type: 'tool', name: 'Replacement Saw', idealZoneId: 'zone-tools', currentZoneId: 'unassigned' },
        { id: `d-19-${Date.now()}`, type: 'trash', name: 'Packaging Waste', currentZoneId: 'unassigned' },
        { id: `d-20-${Date.now()}`, type: 'hazard', name: 'Leaking Paint', currentZoneId: 'unassigned' }
      ];
      return { depotItems: [...state.depotItems, ...newItems] };
    }

    if (state.chapter !== 2) return {};

    if (day === 8) {
      const readyTasks = state.columns.find(c => c.id === 'ready')?.tasks || [];
      const unconstrained = readyTasks.filter(t => (t.constraints?.length || 0) === 0);
      const toAdd = unconstrained.slice(0, 2);
      if (toAdd.length === 0) return {};

      return {
        columns: state.columns.map(col => {
          if (col.id === 'ready') {
            return {
              ...col,
              tasks: col.tasks.map(t => {
                if (toAdd.some(a => a.id === t.id)) {
                  const newConstraint: ConstraintType = t.type === 'Structural' ? 'weather' : 'crew';
                  return { ...t, constraints: [...(t.constraints || []), newConstraint] };
                }
                return t;
              })
            };
          }
          return col;
        })
      };
    }

    if (day === 10) {
      const emergencyTask: Task = {
        id: `emergency-${Date.now()}`,
        title: 'Emergency Pipe Repair',
        description: 'A burst water main threatens the food court area. Immediate repair needed!',
        type: 'Systems',
        cost: 30,
        reward: 1500,
        status: 'ready',
        difficulty: 3,
        leanTip: 'Unplanned work disrupts flow - this is why reliable planning matters.',
      };

      return {
        columns: state.columns.map(col => {
          if (col.id === 'ready') {
            return { ...col, tasks: [...col.tasks, emergencyTask] };
          }
          return col;
        })
      };
    }

    if (day === 11) {
      const doingTasks = state.columns.find(c => c.id === 'doing')?.tasks || [];
      if (doingTasks.length > 0) {
        const targetTask = doingTasks[0];
        return {
          columns: state.columns.map(col => {
            if (col.id === 'doing') {
              return {
                ...col,
                tasks: col.tasks.map(t =>
                  t.id === targetTask.id
                    ? { ...t, constraints: [...(t.constraints || []), 'crew' as ConstraintType] }
                    : t
                )
              };
            }
            return col;
          })
        };
      }
    }

    return {};
  }),

  addConstraintsToRandomTasks: (count: number, constraintType: ConstraintType) => set((state) => {
    const readyTasks = state.columns.find(c => c.id === 'ready')?.tasks || [];
    const unconstrained = readyTasks.filter(t => (t.constraints?.length || 0) === 0);
    const targets = unconstrained.slice(0, count);
    if (targets.length === 0) return {};

    return {
      columns: state.columns.map(col => {
        if (col.id === 'ready') {
          return {
            ...col,
            tasks: col.tasks.map(t => {
              if (targets.some(tgt => tgt.id === t.id)) {
                return { ...t, constraints: [...(t.constraints || []), constraintType] };
              }
              return t;
            })
          };
        }
        return col;
      })
    };
  }),

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
  // Chapter 4 Methods
  setKanbanLimit: (trade, limit) => set((state) => ({ kanbanLimits: { ...state.kanbanLimits, [trade]: limit } })),

  setBuffer: (material, amount) => set((state) => ({ buffers: { ...state.buffers, [material]: amount } })),

  orderMaterial: (material, amount, etaDay) => set((state) => ({
    deliveries: [...state.deliveries, { id: uuidv4(), material, amount, etaDay }]
  })),

  receiveDeliveries: (currentDay) => set((state) => {
    const arriving = state.deliveries.filter(d => d.etaDay <= currentDay);
    const pending = state.deliveries.filter(d => d.etaDay > currentDay);

    // Process arriving inventory
    const newInventory = { ...state.materialsInventory };
    arriving.forEach(d => {
      newInventory[d.material] = (newInventory[d.material] || 0) + d.amount;
    });

    return {
      materialsInventory: newInventory,
      deliveries: pending
    };
  }),

  consumeMaterial: (material, amount) => {
    const state = get();
    const current = state.materialsInventory[material] || 0;
    if (current >= amount) {
      set({ materialsInventory: { ...state.materialsInventory, [material]: current - amount } });
      return true; // Success
    }
    return false; // Stockout
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
