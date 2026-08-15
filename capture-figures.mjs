/**
 * capture-figures.mjs  (v2)
 *
 * Captures Figures 2, 3, 4 for the FlowState conference paper.
 *
 * ⚠️  BRANCH: figure-capture ONLY — never merge to main.
 *     Pre-seeds game state via localStorage before page load, matching the
 *     exact format useGame.ts / importState() expects. Zero source changes.
 *
 * Prerequisites:
 *   1. `npm run dev` is running (http://localhost:5000)
 *   2. `npx playwright install chromium` has been run once
 *
 * Usage:
 *   node capture-figures.mjs
 *
 * Output (all 3200×2000 px, 16:10):
 *   ./figures/figure2_wip_block.png
 *   ./figures/figure3_project_status_sheet.png
 *   ./figures/figure4_reactive_toast.png
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'figures');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:5000';
const VIEWPORT = { width: 1600, height: 1000 };
const SCALE = 2; // deviceScaleFactor → 3200×2000 actual pixels

// Fixed session ID so LOCAL_SAVE_KEY is deterministic across all runs
const CAPTURE_SESSION_ID = 'capture-session-figures-2024';
const LOCAL_SAVE_KEY = `flowstate_save_${CAPTURE_SESSION_ID}`;

// ─── Build a localStorage save payload in the shape importState() expects ────
// importState reads: data.chapter, data.resources.budget, data.resources.materials,
// data.flags, data.playerName, data.kanbanState.columns, data.kanbanState.day,
// data.kanbanState.phase, data.kanbanState.tutorialStep, etc.
function buildSave({ chapter, day, week, phase, funds, materials, earnedValue, columns, flags, lpi }) {
  // Pre-mark all day briefings as seen so DayBriefingModal never shows
  const briefingFlags = {};
  for (let d = 1; d <= 22; d++) briefingFlags[`day_${d}_briefing_seen`] = true;

  return JSON.stringify({
    id: 1,
    sessionId: CAPTURE_SESSION_ID,
    lastPlayed: new Date().toISOString(),
    playerName: 'Riya Sharma',
    chapter,
    week,
    resources: {
      budget: funds,
      materials,
      morale: lpi.teamMorale,
      stress: 0,
      trust: 50,
      productivity: 60,
      quality: 80,
    },
    flags: {
      // Must have character_created=true to bypass the /chapters redirect
      character_created: true,
      hydrated: true,
      chapter_intro_seen: true,
      character_cast_seen: true,
      task_mode_seen: true,
      taskModeSelected: true,
      game_over: false,
      // Mark all day briefings as seen so DayBriefingModal doesn't block
      ...briefingFlags,
      // Chapter-specific flags to prevent pop-ups
      decision_push_made: false,
      decision_pull_enforced: false,
      ...flags,
    },
    metrics: {
      flowEfficiency: lpi.flowEfficiency,
      ppc: lpi.ppc,
      wipCompliance: lpi.wipCompliance,
      wasteRemoved: lpi.wasteRemoved,
      teamMorale: lpi.teamMorale,
    },
    kanbanState: {
      columns,
      day,
      week,
      phase,
      playerGender: 'female',
      tutorialActive: false,
      tutorialStep: 99,
      dailyMetrics: [],
      previousDoneCount: 0,
      previousWasteCount: 0,
      cumulativeTasksCompleted: 0,
      cumulativePotentialCapacity: 0,
      earnedValue,
      currentDialogue: null,
      dialogueIndex: 0,
      customTasks: [],
      taskModeSelected: true,
      taskMode: 'predefined',
      depotItems: [],
      depotZones: [],
      depotScore: 0,
    },
    completedChapters: [],
    unlockedBadges: [],
    weeklyPlan: [],
  });
}

// ─── Column definitions ────────────────────────────────────────────────────────

// Figure 2: 3 tasks in doing (at WIP limit of 3), 5 in backlog
const FIG2_COLUMNS = [
  {
    id: 'backlog', title: 'To-Do List', wipLimit: 0,
    tasks: [
      { id: 'b-task-4', originalId: 'task-4', title: 'Foundation Concrete Pour', type: 'Structural', cost: 150, reward: 517500, difficulty: 4, status: 'backlog', description: 'Pouring the heavy concrete base of the building. This is where the real structure begins.', completionWeight: 6, costToStart: 450000, materialsRequired: [{ name: 'Concrete', amount: 100 }, { name: 'Steel', amount: 50 }] },
      { id: 'b-task-5', originalId: 'task-5', title: 'Foundation Curing', type: 'Structural', cost: 10, reward: 13800, difficulty: 1, status: 'backlog', description: 'Keeping the concrete wet so it reaches maximum strength.', completionWeight: 2, costToStart: 12000 },
      { id: 'b-task-6', originalId: 'task-6', title: 'Plinth Beam Construction', type: 'Structural', cost: 140, reward: 322000, difficulty: 3, status: 'backlog', description: 'Building the horizontal support beams that connect foundation columns.', completionWeight: 5, costToStart: 280000 },
      { id: 'b-task-7', originalId: 'task-7', title: 'Backfilling & Compaction', type: 'Structural', cost: 40, reward: 86250, difficulty: 2, status: 'backlog', description: 'Filling soil back into foundation gaps and packing it tight.', completionWeight: 3, costToStart: 75000 },
      { id: 'b-task-8', originalId: 'task-8', title: 'Ground Floor Slab Casting', type: 'Structural', cost: 220, reward: 632500, difficulty: 5, status: 'backlog', description: 'Creating the floor surface for the ground level.', completionWeight: 7, costToStart: 550000 },
    ]
  },
  {
    id: 'doing', title: 'In Progress', wipLimit: 3,
    tasks: [
      { id: 'd-task-1', originalId: 'task-1', title: 'Site Clearance & Preparation', type: 'Exterior', cost: 0, reward: 97750, difficulty: 1, status: 'doing', description: 'Level the ground, remove debris, and setup fences. This is the first step to ensure a safe and organized workspace.', completionWeight: 2, costToStart: 85000 },
      { id: 'd-task-2', originalId: 'task-2', title: 'Excavation & Trenching', type: 'Structural', cost: 0, reward: 172500, difficulty: 2, status: 'doing', description: 'Digging deep trenches for the building foundations. Vital for stability.', completionWeight: 3, costToStart: 150000 },
      { id: 'd-task-3', originalId: 'task-3', title: 'Anti-Termite Treatment', type: 'Exterior', cost: 20, reward: 51750, difficulty: 1, status: 'doing', description: 'Applying chemicals to the soil to prevent future structural damage from pests.', completionWeight: 1, costToStart: 45000 },
    ]
  },
  { id: 'done', title: 'Completed', wipLimit: 0, tasks: [] }
];

// Figure 3: 8 done, 2 doing, 12 backlog — mid-chapter state
const FIG3_COLUMNS = [
  {
    id: 'backlog', title: 'To-Do List', wipLimit: 0,
    tasks: [
      { id: 'f3b-11', originalId: 'task-11', title: 'Superstructure Brickwork', type: 'Structural', cost: 150, reward: 747500, difficulty: 3, status: 'backlog', description: 'Laying out the walls using bricks/blocks.', completionWeight: 10, costToStart: 650000 },
      { id: 'f3b-12', originalId: 'task-12', title: 'Lintel & Chajja Casting', type: 'Structural', cost: 50, reward: 138000, difficulty: 2, status: 'backlog', description: 'Horizontal supports over door/window openings.', completionWeight: 3, costToStart: 120000 },
      { id: 'f3b-13', originalId: 'task-13', title: 'Roofing / Top Slab', type: 'Structural', cost: 180, reward: 575000, difficulty: 4, status: 'backlog', description: 'Casting the final roof slab.', completionWeight: 8, costToStart: 480000 },
      { id: 'f3b-14', originalId: 'task-14', title: 'External Plastering', type: 'Exterior', cost: 80, reward: 230000, difficulty: 2, status: 'backlog', description: '', completionWeight: 4, costToStart: 180000 },
      { id: 'f3b-15', originalId: 'task-15', title: 'Internal Plastering', type: 'Interior', cost: 60, reward: 172500, difficulty: 2, status: 'backlog', description: '', completionWeight: 4, costToStart: 140000 },
      { id: 'f3b-16', originalId: 'task-16', title: 'Electrical Wiring', type: 'Systems', cost: 100, reward: 287500, difficulty: 3, status: 'backlog', description: '', completionWeight: 5, costToStart: 220000 },
      { id: 'f3b-17', originalId: 'task-17', title: 'Plumbing Rough-In', type: 'Systems', cost: 90, reward: 258750, difficulty: 3, status: 'backlog', description: '', completionWeight: 5, costToStart: 200000 },
      { id: 'f3b-18', originalId: 'task-18', title: 'Flooring', type: 'Interior', cost: 120, reward: 345000, difficulty: 3, status: 'backlog', description: '', completionWeight: 6, costToStart: 260000 },
      { id: 'f3b-19', originalId: 'task-19', title: 'Door & Window Installation', type: 'Interior', cost: 110, reward: 316250, difficulty: 3, status: 'backlog', description: '', completionWeight: 5, costToStart: 240000 },
      { id: 'f3b-20', originalId: 'task-20', title: 'Painting & Finishing', type: 'Interior', cost: 70, reward: 201250, difficulty: 2, status: 'backlog', description: '', completionWeight: 4, costToStart: 160000 },
      { id: 'f3b-21', originalId: 'task-21', title: 'Final Inspection & Snag List', type: 'Management', cost: 0, reward: 57500, difficulty: 1, status: 'backlog', description: '', completionWeight: 2, costToStart: 0 },
      { id: 'f3b-22', originalId: 'task-22', title: 'Handover & Documentation', type: 'Management', cost: 0, reward: 115000, difficulty: 1, status: 'backlog', description: '', completionWeight: 2, costToStart: 0 },
    ]
  },
  {
    id: 'doing', title: 'In Progress', wipLimit: 3,
    tasks: [
      { id: 'f3i-9', originalId: 'task-9', title: 'Column Erection', type: 'Structural', cost: 200, reward: 437000, difficulty: 4, status: 'doing', description: 'Setting up the vertical pillars for the next floor.', completionWeight: 6, costToStart: 380000 },
      { id: 'f3i-10', originalId: 'task-10', title: 'First Floor Slab & Beams', type: 'Structural', cost: 220, reward: 632500, difficulty: 5, status: 'doing', description: 'Casting the ceiling of the ground floor / floor of the first level.', completionWeight: 7, costToStart: 550000 },
    ]
  },
  {
    id: 'done', title: 'Completed', wipLimit: 0,
    tasks: [
      { id: 'f3d-1', originalId: 'task-1', title: 'Site Clearance & Preparation', type: 'Exterior', cost: 0, reward: 97750, difficulty: 1, status: 'done', description: '', completionWeight: 2, costToStart: 85000 },
      { id: 'f3d-2', originalId: 'task-2', title: 'Excavation & Trenching', type: 'Structural', cost: 0, reward: 172500, difficulty: 2, status: 'done', description: '', completionWeight: 3, costToStart: 150000 },
      { id: 'f3d-3', originalId: 'task-3', title: 'Anti-Termite Treatment', type: 'Exterior', cost: 20, reward: 51750, difficulty: 1, status: 'done', description: '', completionWeight: 1, costToStart: 45000 },
      { id: 'f3d-4', originalId: 'task-4', title: 'Foundation Concrete Pour', type: 'Structural', cost: 150, reward: 517500, difficulty: 4, status: 'done', description: 'Pouring the heavy concrete base.', completionWeight: 6, costToStart: 450000 },
      { id: 'f3d-5', originalId: 'task-5', title: 'Foundation Curing', type: 'Structural', cost: 10, reward: 13800, difficulty: 1, status: 'done', description: '', completionWeight: 2, costToStart: 12000 },
      { id: 'f3d-6', originalId: 'task-6', title: 'Plinth Beam Construction', type: 'Structural', cost: 140, reward: 322000, difficulty: 3, status: 'done', description: '', completionWeight: 5, costToStart: 280000 },
      { id: 'f3d-7', originalId: 'task-7', title: 'Backfilling & Compaction', type: 'Structural', cost: 40, reward: 86250, difficulty: 2, status: 'done', description: '', completionWeight: 3, costToStart: 75000 },
      { id: 'f3d-8', originalId: 'task-8', title: 'Ground Floor Slab Casting', type: 'Structural', cost: 220, reward: 632500, difficulty: 5, status: 'done', description: '', completionWeight: 7, costToStart: 550000 },
    ]
  },
];

// Figure 4: task-4 in doing (id MUST be 'task-4' for the KanbanBoard toast check)
const FIG4_COLUMNS = [
  {
    id: 'backlog', title: 'To-Do List', wipLimit: 0,
    tasks: [
      { id: 'f4b-3', originalId: 'task-3', title: 'Anti-Termite Treatment', type: 'Exterior', cost: 20, reward: 51750, difficulty: 1, status: 'backlog', description: '', completionWeight: 1, costToStart: 45000 },
      { id: 'f4b-5', originalId: 'task-5', title: 'Foundation Curing', type: 'Structural', cost: 10, reward: 13800, difficulty: 1, status: 'backlog', description: '', completionWeight: 2, costToStart: 12000 },
      { id: 'f4b-6', originalId: 'task-6', title: 'Plinth Beam Construction', type: 'Structural', cost: 140, reward: 322000, difficulty: 3, status: 'backlog', description: '', completionWeight: 5, costToStart: 280000 },
    ]
  },
  {
    id: 'doing', title: 'In Progress', wipLimit: 3,
    tasks: [
      // id: 'task-4' — KanbanBoard.tsx line 238 checks task.id === 'task-4'
      { id: 'task-4', originalId: 'task-4', title: 'Foundation Concrete Pour', type: 'Structural', cost: 150, reward: 517500, difficulty: 4, status: 'doing', description: 'Pouring the heavy concrete base of the building. This is where the real structure begins.', completionWeight: 6, costToStart: 450000, materialsRequired: [{ name: 'Concrete', amount: 100 }, { name: 'Steel', amount: 50 }] },
    ]
  },
  {
    id: 'done', title: 'Completed', wipLimit: 0,
    tasks: [
      { id: 'f4d-1', originalId: 'task-1', title: 'Site Clearance & Preparation', type: 'Exterior', cost: 0, reward: 97750, difficulty: 1, status: 'done', description: '', completionWeight: 2, costToStart: 85000 },
      { id: 'f4d-2', originalId: 'task-2', title: 'Excavation & Trenching', type: 'Structural', cost: 0, reward: 172500, difficulty: 2, status: 'done', description: '', completionWeight: 3, costToStart: 150000 },
    ]
  },
];

// ─── Page factory: creates a browser context with pre-seeded localStorage ─────
async function newGamePage(browser, saveData) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE });

  // Block audio
  await ctx.route('**/*.mp3', r => r.abort());
  await ctx.route('**/*.ogg', r => r.abort());
  await ctx.route('**/*.wav', r => r.abort());

  // Pre-seed localStorage BEFORE any navigation (addInitScript runs before page JS)
  // sessionId: the UUID stored under 'flowstate_session_id'
  // saveKey: 'flowstate_save_<sessionId>'
  await ctx.addInitScript(({ sessionId, saveKey, savePayload }) => {
    try {
      localStorage.setItem('flowstate_session_id', sessionId);
      localStorage.setItem(saveKey, savePayload);
      console.log('[capture-init] localStorage seeded. sessionId:', sessionId, 'saveKey:', saveKey);
    } catch (e) {
      console.error('[capture-init] localStorage pre-seed failed:', e);
    }
  }, {
    sessionId: CAPTURE_SESSION_ID,
    saveKey: LOCAL_SAVE_KEY,
    savePayload: saveData,
  });

  const page = await ctx.newPage();
  return { page, ctx };
}

// Wait for the Game component to fully hydrate and ALL blocking overlays to clear
async function waitForGameHUD(page) {
  // 1. Wait for #btn-kanban to exist in DOM (game page mounted)
  await page.waitForSelector('#btn-kanban', { timeout: 20000 });

  // 2. Wait for splash screen to clear — App.tsx min display is 3000ms + 600ms fade
  // Poll until id="splash-screen" is gone or has opacity 0 / visibility hidden
  await page.waitForFunction(() => {
    const splash = document.getElementById('splash-screen');
    if (!splash) return true;
    const style = window.getComputedStyle(splash);
    return style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none';
  }, { timeout: 10000 }).catch(() => {
    // If splash doesn't clear in 10s, force-remove it
    return page.evaluate(() => {
      const s = document.getElementById('splash-screen');
      if (s) s.remove();
    });
  });
  await page.waitForTimeout(200);

  // 3. Dismiss any z-[80] blocking modal (ChapterIntro, DayBriefing, TaskModeSelector etc.)
  // These modals either have a close button, or can be dismissed by pressing Escape or
  // clicking their backdrop. We try Escape first, then look for close/skip buttons.
  for (let i = 0; i < 8; i++) {
    const blocked = await page.evaluate(() => {
      // Check if any full-screen overlay with pointer-events-auto is blocking
      const overlays = Array.from(document.querySelectorAll('[class*="inset-0"]'))
        .filter(el => {
          const s = window.getComputedStyle(el);
          return s.pointerEvents !== 'none' && s.position === 'absolute' || s.position === 'fixed';
        });
      // Check for the specific blocking div the error shows
      const blocking = Array.from(document.querySelectorAll('div')).find(el => {
        const cl = el.className || '';
        return cl.includes('z-[80]') && cl.includes('inset-0') && cl.includes('pointer-events-auto');
      });
      return !!blocking;
    });
    if (!blocked) break;
    // Dismiss by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // Also try clicking a 'close', 'skip', 'got it', or 'begin' button
    const dismissed = await page.evaluate(() => {
      const skipWords = ['skip', 'close', 'got it', 'begin', 'start', 'continue', 'ok', 'dismiss', 'later', 'work', 'let'];
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => skipWords.some(w => (b.textContent || '').toLowerCase().includes(w)));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (dismissed) await page.waitForTimeout(400);
  }

  // Extra settle time
  await page.waitForTimeout(400);
}

// ─── Zustand store accessor via fiber walk (used AFTER game has hydrated) ─────
async function exposeStore(page) {
  const SCRIPT = `
    (() => {
      function findStore(root) {
        const stack = [root];
        while (stack.length) {
          const fiber = stack.pop();
          if (!fiber) continue;
          let hook = fiber.memoizedState;
          while (hook) {
            const ms = hook.memoizedState;
            if (ms && typeof ms === 'object'
                && typeof ms.getState === 'function'
                && typeof ms.setState === 'function'
                && typeof ms.subscribe === 'function') {
              const s = ms.getState();
              if (s && typeof s.chapter === 'number' && Array.isArray(s.columns)) return ms;
            }
            hook = hook.next;
          }
          if (fiber.child) stack.push(fiber.child);
          if (fiber.sibling) stack.push(fiber.sibling);
        }
        return null;
      }
      const rootEl = document.getElementById('root');
      if (!rootEl) return 'no-root';
      const fiberKey = Object.keys(rootEl).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return 'no-fiber';
      const store = findStore(rootEl[fiberKey]);
      if (!store) return 'no-store';
      window.__gs = store;
      const s = store.getState();
      return \`ok:ch\${s.chapter}:day\${s.day}:flags:\${JSON.stringify(Object.keys(s.flags || {}))}\`;
    })()
  `;
  const result = await page.evaluate(SCRIPT);
  console.log(`  [store] ${result}`);
  return result.startsWith('ok');
}

// ─────────────────────────────────────────────────────────────────────────────
// FIGURE 2: WIP Block
// ─────────────────────────────────────────────────────────────────────────────
async function captureFigure2(browser) {
  console.log('\n━━━ Figure 2: WIP Block ━━━');

  const saveData = buildSave({
    // day: 2 avoids the TaskModeSelector modal (only shows on chapter===1 && day===1)
    chapter: 1, day: 2, week: 1, phase: 'action',
    funds: 14000000, materials: 900, earnedValue: 0,
    columns: FIG2_COLUMNS,
    flags: {},
    lpi: { flowEfficiency: 62, ppc: 75, wipCompliance: 100, wasteRemoved: 2, teamMorale: 65 },
  });

  const { page, ctx } = await newGamePage(browser, saveData);

  await page.goto(`${BASE_URL}/game`, { waitUntil: 'domcontentloaded' });
  console.log('  [fig2] Navigated. URL:', page.url());

  // Wait for Game HUD (means character_created=true worked, no redirect)
  try {
    await waitForGameHUD(page);
    console.log('  [fig2] HUD loaded ✓ | URL:', page.url());
  } catch (e) {
    console.error('  [fig2] HUD not found — URL:', page.url());
    const html = await page.evaluate(() => document.body.innerText.substring(0, 400));
    console.error('  [fig2] Page text:', html);
    await ctx.close();
    return null;
  }

  // Expose store for any post-hoc state checks
  await exposeStore(page);

  // Open Kanban board
  await page.click('#btn-kanban');
  console.log('  [fig2] Clicked #btn-kanban');
  try {
    await page.waitForSelector('#col-doing', { timeout: 10000 });
    console.log('  [fig2] Board open (#col-doing visible)');
  } catch (e) {
    console.error('  [fig2] Board did not open — URL:', page.url());
    // Log what DOM elements exist
    const btns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.id || b.textContent?.trim().substring(0,30)).filter(Boolean));
    console.error('  [fig2] Buttons:', btns);
    await ctx.close();
    return null;
  }
  await page.waitForTimeout(700); // board entrance animation

  // ── Drag the first backlog card into the full doing column ────────────────
  const backlogCard = page.locator('[data-rfd-draggable-id="b-task-4"]');
  const doingColEl = page.locator('#col-doing');

  const cardBox = await backlogCard.boundingBox();
  const doingBox = await doingColEl.boundingBox();

  if (!cardBox || !doingBox) {
    console.warn('  [fig2] Drag elements not found — capturing board as-is (3 tasks in doing visible)');
  } else {
    const sx = cardBox.x + cardBox.width / 2;
    const sy = cardBox.y + cardBox.height / 2;
    const ex = doingBox.x + doingBox.width / 2;
    const ey = doingBox.y + doingBox.height / 2;

    // @hello-pangea/dnd drag sequence: mousedown → tiny wiggle → move → mouseup
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.waitForTimeout(60);
    await page.mouse.move(sx + 3, sy + 3, { steps: 3 });
    await page.waitForTimeout(60);
    await page.mouse.move(ex, ey, { steps: 30 });
    await page.waitForTimeout(120);
    await page.mouse.up();

    // onDragEnd fires on mouseup → moveTask returns false (WIP full) →
    // shake class applied (500ms), toast appears.
    // Capture at 180ms: shake is mid-animation, toast is visible.
    await page.waitForTimeout(180);
    console.log('  [fig2] Drag complete — capturing mid-shake');
  }

  const out = path.join(OUT_DIR, 'figure2_wip_block.png');
  await page.screenshot({ path: out, type: 'png' });
  console.log(`  [fig2] ✅ Saved: ${out}`);
  await ctx.close();
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIGURE 3: Project Status Sheet
// ─────────────────────────────────────────────────────────────────────────────
async function captureFigure3(browser) {
  console.log('\n━━━ Figure 3: Project Status Sheet ━━━');

  // PV = ₹1.5Cr | EV = ₹54.6L (earnedValue 36.4%) | AC = ₹26.6L (spent)
  const saveData = buildSave({
    chapter: 1, day: 4, week: 1, phase: 'action',
    funds: 12340000, materials: 280, earnedValue: 36.4,
    columns: FIG3_COLUMNS,
    flags: {},
    lpi: { flowEfficiency: 68, ppc: 80, wipCompliance: 100, wasteRemoved: 3, teamMorale: 72 },
  });

  const { page, ctx } = await newGamePage(browser, saveData);
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'domcontentloaded' });
  console.log('  [fig3] Navigated. URL:', page.url());

  try {
    await waitForGameHUD(page);
    console.log('  [fig3] HUD loaded ✓ | URL:', page.url());
  } catch (e) {
    console.error('  [fig3] HUD not found — URL:', page.url());
    const html = await page.evaluate(() => document.body.innerText.substring(0, 400));
    console.error('  [fig3] Page text:', html);
    await ctx.close();
    return null;
  }

  await exposeStore(page);

  // Open Project Status Sheet — id="btn-project-sheet"
  await page.click('#btn-project-sheet');
  console.log('  [fig3] Opened Project Status Sheet');

  // Wait for the modal to animate in and the h2 to appear
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('h2')).some(h => h.textContent?.includes('Project Status Sheet')),
    { timeout: 8000 }
  );
  await page.waitForTimeout(500); // let the spring animation settle

  const heading = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Project Status'))?.textContent || 'not found'
  );
  console.log(`  [fig3] Sheet heading: "${heading.trim()}"`);

  const out = path.join(OUT_DIR, 'figure3_project_status_sheet.png');
  await page.screenshot({ path: out, type: 'png' });
  console.log(`  [fig3] ✅ Saved: ${out}`);
  await ctx.close();
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIGURE 4: Reactive Narrative Toast
// ─────────────────────────────────────────────────────────────────────────────
async function captureFigure4(browser) {
  console.log('\n━━━ Figure 4: Reactive Narrative Toast ━━━');

  // task-4 is in doing with id='task-4' — KanbanBoard line 238 checks this exact id
  const saveData = buildSave({
    chapter: 1, day: 2, week: 1, phase: 'action',
    funds: 14200000, materials: 700, earnedValue: 9.1,
    columns: FIG4_COLUMNS,
    flags: {},
    lpi: { flowEfficiency: 55, ppc: 60, wipCompliance: 100, wasteRemoved: 0, teamMorale: 60 },
  });

  const { page, ctx } = await newGamePage(browser, saveData);
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'domcontentloaded' });
  console.log('  [fig4] Navigated. URL:', page.url());

  try {
    await waitForGameHUD(page);
    console.log('  [fig4] HUD loaded ✓ | URL:', page.url());
  } catch (e) {
    console.error('  [fig4] HUD not found — URL:', page.url());
    const html = await page.evaluate(() => document.body.innerText.substring(0, 400));
    console.error('  [fig4] Page text:', html);
    await ctx.close();
    return null;
  }

  await exposeStore(page);

  // Open Kanban board
  await page.click('#btn-kanban');
  console.log('  [fig4] Clicked #btn-kanban');
  try {
    await page.waitForSelector('#col-done', { timeout: 10000 });
    console.log('  [fig4] Board open (#col-done visible)');
  } catch (e) {
    console.error('  [fig4] Board did not open — URL:', page.url());
    await ctx.close();
    return null;
  }
  await page.waitForTimeout(700);

  // Verify task-4 is in the doing column
  const task4 = page.locator('[data-rfd-draggable-id="task-4"]');
  const doneCol = page.locator('#col-done');

  const t4Box = await task4.boundingBox();
  const doneBox = await doneCol.boundingBox();

  if (!t4Box || !doneBox) {
    const draggables = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-rfd-draggable-id]'))
        .map(el => ({ id: el.getAttribute('data-rfd-draggable-id'), text: el.textContent?.trim().substring(0, 30) }))
    );
    console.error('  [fig4] task-4 not found. Draggables present:', JSON.stringify(draggables, null, 2));
    await ctx.close();
    return null;
  }

  const sx = t4Box.x + t4Box.width / 2;
  const sy = t4Box.y + t4Box.height / 2;
  const ex = doneBox.x + doneBox.width / 2;
  const ey = doneBox.y + 80; // drop near top of done column

  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.waitForTimeout(60);
  await page.mouse.move(sx + 3, sy + 3, { steps: 3 });
  await page.waitForTimeout(60);
  await page.mouse.move(ex, ey, { steps: 30 });
  await page.waitForTimeout(120);
  await page.mouse.up();

  // Wait for toast to fully enter (Radix enter animation ~300ms)
  // Toast stays for 5 seconds — plenty of time to capture
  await page.waitForTimeout(450);

  const toastVisible = await page.evaluate(() => document.body.innerText.includes('Foundation'));
  console.log(`  [fig4] Foundation toast present: ${toastVisible}`);

  if (!toastVisible) {
    // Check what's in the toast viewport
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.warn('  [fig4] Toast not found. Page text snippet:', bodyText.replace(/\n/g, ' '));
  }

  const out = path.join(OUT_DIR, 'figure4_reactive_toast.png');
  await page.screenshot({ path: out, type: 'png' });
  console.log(`  [fig4] ✅ Saved: ${out}`);
  await ctx.close();
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  FlowState — Publication Figure Capture  (v2)       ║');
  console.log('║  Branch: figure-capture | NEVER merge to main       ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\nResolution: ${VIEWPORT.width * SCALE}×${VIEWPORT.height * SCALE}px | Ratio: 16:10`);
  console.log(`Output: ${OUT_DIR}\n`);

  // Ping server
  try {
    const { default: http } = await import('http');
    await new Promise((res, rej) => {
      const req = http.get(BASE_URL, r => { r.destroy(); res(); });
      req.on('error', rej);
      req.setTimeout(4000, () => { req.destroy(); rej(new Error('timeout')); });
    });
    console.log(`✅ Dev server up at ${BASE_URL}`);
  } catch {
    console.error(`\n❌ Dev server not reachable at ${BASE_URL}`);
    console.error('   Run: npm run dev\n');
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });

  const results = {};
  try {
    results.fig2 = await captureFigure2(browser);
    results.fig3 = await captureFigure3(browser);
    results.fig4 = await captureFigure4(browser);
  } finally {
    await browser.close();
  }

  console.log('\n━━━ Resolution Check ━━━');
  const labels = { fig2: 'Figure 2 (WIP Block)', fig3: 'Figure 3 (Status Sheet)', fig4: 'Figure 4 (Toast)' };
  let allOk = true;
  for (const [key, p] of Object.entries(results)) {
    if (p && fs.existsSync(p)) {
      const buf = fs.readFileSync(p);
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      const ok = w === VIEWPORT.width * SCALE && h === VIEWPORT.height * SCALE;
      if (!ok) allOk = false;
      console.log(`${labels[key]}: ${w}×${h} ${ok ? '✅' : `❌ (expected ${VIEWPORT.width * SCALE}×${VIEWPORT.height * SCALE})`} | ${(fs.statSync(p).size / 1024).toFixed(0)} KB`);
      console.log(`  → ${p}`);
    } else {
      allOk = false;
      console.log(`${labels[key]}: ❌ NOT CAPTURED`);
    }
  }

  console.log(`\n${allOk ? '✅ All three captured at correct resolution.' : '⚠️  Capture incomplete — see logs above.'}`);
  console.log('\n⚠️  Review all three PNGs before placing in the paper.');
  console.log(`   ${OUT_DIR}`);
  console.log('\n⚠️  figure-capture branch must NOT be merged to main.');
}

main().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
