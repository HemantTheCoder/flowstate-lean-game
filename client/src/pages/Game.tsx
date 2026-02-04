import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { GameCanvas } from '@/components/game/GameCanvas';
import { PlanningRoom } from '@/components/game/PlanningRoom';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanBoard } from '@/components/game/KanbanBoard';
import { DialogueBox } from '@/components/game/DialogueBox';
import { TutorialOverlay } from '@/components/game/TutorialOverlay';
import { DailySummary } from '@/components/game/DailySummary';
import { useGameStore } from '@/store/gameStore';
import { WEEK_1_SCHEDULE, DAY_5_GOOD, DAY_5_BAD } from '@/data/chapters/chapter1';
import { WEEK_2_SCHEDULE } from '@/data/chapters/chapter2';
import { DecisionModal } from '@/components/game/DecisionModal';
import { TransitionScreen } from '@/components/game/TransitionScreen';
import { ChapterIntroModal } from '@/components/game/ChapterIntroModal';
import { CharacterCastModal } from '@/components/game/CharacterCastModal';
import { DayBriefingModal } from '@/components/game/DayBriefingModal';
import { ChapterCompleteModal } from '@/components/game/ChapterCompleteModal';
import { Chapter2CompleteModal } from '@/components/game/Chapter2CompleteModal';
import { SettingsModal } from '@/components/game/SettingsModal';
import { useGame } from '@/hooks/use-game';
import soundManager from '@/lib/soundManager';
import { LayoutDashboard, HardHat, Save, Settings } from 'lucide-react';

export default function Game() {
  const [showKanban, setShowKanban] = React.useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  // Decision State
  const [showDecision, setShowDecision] = useState(false);
  const [decisionProps, setDecisionProps] = useState<any>(null);

  // State Selectors (Split to prevent unnecessary re-renders)
  const startDialogue = useGameStore(s => s.startDialogue);
  const currentDialogue = useGameStore(s => s.currentDialogue);
  const day = useGameStore(s => s.day);
  const advanceDay = useGameStore(s => s.advanceDay);
  const week = useGameStore(s => s.week);
  const chapter = useGameStore(s => s.chapter);
  const tutorialStep = useGameStore(s => s.tutorialStep);
  const setTutorialStep = useGameStore(s => s.setTutorialStep);
  const flags = useGameStore(s => s.flags);
  const setFlag = useGameStore(s => s.setFlag);
  const importState = useGameStore(s => s.importState);
  const playerName = useGameStore(s => s.playerName);
  const playerGender = useGameStore(s => s.playerGender);
  const funds = useGameStore(s => s.funds);
  const materials = useGameStore(s => s.materials);
  const columns = useGameStore(s => s.columns);
  const lpi = useGameStore(s => s.lpi);
  const phase = useGameStore(s => s.phase);
  const unlockedChapters = useGameStore(s => s.unlockedChapters); // Added since used in save

  // Phase Change Detection for Transition Screen
  const prevPhaseRef = React.useRef(phase);
  useEffect(() => {
    if (prevPhaseRef.current === 'planning' && phase === 'action') {
      setShowTransition(true);
    }
    prevPhaseRef.current = phase;
  }, [phase]);


  const { saveGame, gameState, isLoading: isServerLoading } = useGame();
  const [_, navigate] = useLocation();

  // Redirect to chapters if character not created
  useEffect(() => {
    if (!flags['character_created']) {
      navigate('/chapters');
    }
  }, [flags, navigate]);

  const handleChapterContinue = async () => {
    try {
      console.log("Completing Chapter 1...");
      useGameStore.getState().completeChapter(1);
      await handleSave(true);
      navigate('/chapters');
    } catch (e: any) {
      console.error("Transition Error:", e);
    }
  };

  const handleChapter2Continue = async () => {
    try {
      console.log("Completing Chapter 2...");
      useGameStore.getState().completeChapter(2);
      await handleSave(true);
      navigate('/chapters');
    } catch (e: any) {
      console.error("Transition Error:", e);
    }
  };

  // 1. Hydrate Store from Server on Load
  const hydratedRef = React.useRef(false);
  useEffect(() => {
    if (gameState && !hydratedRef.current) {
      // Logic Check: If loaded state claims Day 5+ but flag says we are new, trust server.
      // BUT if we want to FORCE new game behavior when requested...
      // The issue user reported: "skips name/story -> goes to construction complete".
      // This implies `chapter` or `day` is loaded as High Value.
      // Or `character_created` flag is missing but other things are present.

      importState(gameState);
      setFlag('hydrated', true);
      hydratedRef.current = true;
    }
  }, [gameState, importState, setFlag]);

  // Audio Control Loop
  const audioSettings = useGameStore(s => s.audioSettings);
  useEffect(() => {
    // Choose BGM based on situation
    if (day === 3) {
      soundManager.playBGM('rain', audioSettings.bgmVolume);
    } else if (columns.find(c => c.id === 'doing')?.tasks.length || 0 >= 3) {
      soundManager.playBGM('tense', audioSettings.bgmVolume);
    } else {
      soundManager.playBGM('construction', audioSettings.bgmVolume);
    }
  }, [day, columns, audioSettings.bgmVolume]);

  // Unlock Audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      soundManager.resumeAudio();
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  const handleSave = async (silent = false) => {
    try {
      const state = useGameStore.getState();
      await saveGame.mutateAsync({
        sessionId: '', // Handled by hook
        playerName: state.playerName,
        chapter: state.chapter,
        week: state.week,
        resources: {
          morale: state.lpi.teamMorale,
          stress: 0,
          trust: 50,
          productivity: 40,
          quality: 80,
          budget: state.funds,
          materials: state.materials
        },
        kanbanState: { columns: state.columns } as any,
        flags: state.flags,
        metrics: { ...state.lpi, ppcHistory: state.ppcHistory },
        weeklyPlan: state.weeklyPlan,
        completedChapters: state.unlockedChapters.filter(c => c !== 1).map(c => c - 1),
        unlockedBadges: []
      });
      if (!silent) {
        alert("Game Saved Successfully! 💾");
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // Track previous dialogue state to detect completion
  const prevDialogueRef = React.useRef(currentDialogue);

  useEffect(() => {
    // Check if dialogue just finished (was active, now null)
    if (prevDialogueRef.current && !currentDialogue) {
      // Dialogue Ended Logic
      if (day === 4 && !flags['decision_push_seen']) {
        // Day 4: Trigger Push Decision immediately after dialogue
        setFlag('decision_push_seen', true); // Prevent re-trigger
        triggerPushDecision();
      }

      if (day === 5) {
        if (flags['decision_push_made'] && !flags['decision_retry_seen']) {
          // Bad Outcome -> Retry
          setFlag('decision_retry_seen', true);
          triggerRetryDecision();
        } else if (!flags['decision_push_made']) {
          // Good Outcome -> Chapter Complete!
          // Good Outcome -> Chapter Complete!
          setTimeout(() => {
            setShowKanban(false);
            setShowSummary(false);
            setShowDecision(false);
            setShowChapterComplete(true);
          }, 1000);
        }
      }
    }
    prevDialogueRef.current = currentDialogue;
  }, [currentDialogue, day, flags, setFlag]);

  // Daily Event & Story Loader
  useEffect(() => {
    // Choose Schedule based on Chapter
    const currentSchedule = chapter === 1 ? WEEK_1_SCHEDULE : WEEK_2_SCHEDULE;
    // Check if we have config for this day
    const dayConfig = currentSchedule.find(d => d.day === day);
    const dayKey = `day_${day}_started`;

    if (dayConfig && !flags[dayKey] && flags['character_created'] && flags['chapter_intro_seen']) {
      // 1. Play Dialogue
      let dialogue = dayConfig.dialogue;

      // Day 5 Branching Logic
      if (day === 5) {
        const pushed = flags['decision_push_made'];
        const branch = pushed ? DAY_5_BAD : DAY_5_GOOD;
        dialogue = [...dialogue, ...branch];

        // If Good Outcome, trigger Celebration Flag for Visuals AND Audio
        if (!pushed) {
          setTimeout(() => setFlag('celebration_triggered', true), 500);
        }
      }

      startDialogue(dialogue);
      setFlag(dayKey, true);

      // 2. Trigger Event Effects
      if (dayConfig.event === 'supply_delay') {
        useGameStore.setState({ materials: 0 }); // Hard constraint!
      }

      // Chapter 2 Events
      if (dayConfig.event === 'client_pressure' && chapter === 2) {
        setTimeout(() => triggerClientPressureDecision(), 1000);
      }
      if (dayConfig.event === 'inspection' && chapter === 2) {
        useGameStore.getState().calculatePPC();
        setTimeout(() => {
          setShowChapterComplete(true);
        }, 2000);
      }

      if (dayConfig.day === 3) {
        soundManager.playSFX('storm', audioSettings.sfxVolume);
      }
      // NOTE: Decisions are now triggered by the dialogue completion effect above!
    }
  }, [day, chapter, flags, startDialogue, setFlag]);

  // Bankruptcy Check
  useEffect(() => {
    if (funds < 0) {
      alert("BANKRUPTCY\n\nYou ran out of funds! The project has been shut down.\n\nTip: Keep the flow moving to generate revenue faster than the Daily Overhead expenses.");
      window.location.reload();
    }
  }, [funds]);

  // Tutorial Logic
  useEffect(() => {
    // Step 1 -> 2 (Open Kanban)
    if (showKanban && tutorialStep === 1) {
      setTutorialStep(2);
    }
    // Step 5: Close Kanban to show Advisor Spotlight
    if (tutorialStep === 5 && showKanban) {
      setShowKanban(false);
    }
  }, [showKanban, tutorialStep, setTutorialStep]);

  const triggerRetryDecision = () => {
    setDecisionProps({
      title: "Inspection Failed ❌",
      prompt: "The Inspector flagged the project for 'Excessive Waste' due to your Push decision. Relying on false demand has put the project at risk.",
      options: [
        { id: 'retry', text: "🔄 Replay Day 4 (Fix Mistake)", type: 'safe', description: "Go back in time. Choose 'Pull' this time." },
        { id: 'accept', text: "Accept Consequences", type: 'risky', description: "Funding stops. Project fails. (GAME OVER)" }
      ],
      onSelect: async (id: string) => {
        if (id === 'retry') {
          // Reset to Day 4 Start
          useGameStore.setState(s => ({
            day: 4,
            // Reset flags related to Day 4/5
            flags: { ...s.flags, decision_push_made: false, [`day_4_started`]: false, [`day_5_started`]: false },
            // Clear 'Doing' tasks to remove the "Waste" created by Push
            columns: s.columns.map(c =>
              c.id === 'doing' ? { ...c, tasks: [] } : c
            )
          }));
          // Force a UI refresh by invalidating current day view logic? 
          // The store update should trigger re-render.
          alert("Rewinding to Day 4... Make the Lean choice this time!");
          window.location.reload(); // Cleanest way to restart day logic
        } else {
          // GAME OVER
          alert("GAME OVER\n\nThe funding was pulled due to poor management and excessive waste. The project has been cancelled.\n\nReturning to Title Screen...");
          // Reset Game State completely
          useGameStore.getState().startChapter(1); // Reset store basics if needed, or just let server reset
          // Use the mutation if available or just hard reload to clear session if local?
          // Simple approach: Reload to root, user can restart.
          // Ideally we call the `resetGame` hook if we had it exposed here, but a reload works for now or forcing chapter 1.
          localStorage.clear(); // Clear local client state if any
          window.location.reload();
        }
      }
    });
    setShowDecision(true);
  };

  const triggerPushDecision = () => {
    setDecisionProps({
      title: "Rao's Ultimatum",
      prompt: "Rao is furious about the client visit. He wants to push unready tasks to 'Doing' to look busy. This violates WIP limits.",
      options: [
        { id: 'push', text: "Allow Push (Risky)", type: 'risky', description: "Morale drops, but Rao is happy. Generates Waste." },
        { id: 'pull', text: "Enforce Pull (Safe)", type: 'safe', description: "Rao is angry, but Flow remains stable." }
      ],
      onSelect: (id: string) => {
        if (id === 'push') {
          useGameStore.getState().addLog("Decision: Pushed work. Created Waste.");
          useGameStore.getState().addLog("NEXT STEP: A 'Rework' task was added. Finish it IMMEDIATELY to clear the waste!");
          setFlag('decision_push_made', true);
          useGameStore.getState().injectWaste();
        } else {
          useGameStore.getState().addLog("Decision: Enforced Pull. Flow protected.");
          useGameStore.getState().addLog("NEXT STEP: Maintain flow. Move tasks to 'Doing' ONLY when space is free.");
          setFlag('decision_pull_enforced', true);
        }
        setShowDecision(false);
      }
    });
    setShowDecision(true);
  };

  const triggerClientPressureDecision = () => {
    setDecisionProps({
      title: "Client Request",
      prompt: "The Client is asking you to add extra work (Cafe Roofing) to this week's plan. It was scheduled for next week but the investors want to see it.",
      options: [
        { id: 'accept', text: "Accept Extra Work", type: 'risky', description: "Adds unplanned work. Increases PPC denominator. High risk of failure." },
        { id: 'decline', text: "Decline Politely", type: 'safe', description: "Protects your plan. Client may be disappointed but will respect honesty." }
      ],
      onSelect: (id: string) => {
        if (id === 'accept') {
          useGameStore.getState().addLog("Decision: Accepted extra work. Overcommitment risk!");
          setFlag('overcommitment_accepted', true);
          const state = useGameStore.getState();
          const extraTaskId = `extra-${Date.now()}`;
          useGameStore.setState({
            weeklyPlan: [...state.weeklyPlan, extraTaskId],
            columns: state.columns.map(col =>
              col.id === 'ready' ? {
                ...col,
                tasks: [...col.tasks, {
                  id: extraTaskId,
                  title: 'Cafe Roofing (Rush)',
                  description: 'Unplanned work added at client request.',
                  type: 'Structural' as const,
                  cost: 100,
                  reward: 2000,
                  status: 'ready' as const,
                  difficulty: 4,
                  constraints: ['material', 'crew'] as any[]
                }]
              } : col
            )
          });
          useGameStore.getState().updateMorale(-5);
        } else {
          useGameStore.getState().addLog("Decision: Declined extra work. Plan protected.");
          setFlag('overcommitment_declined', true);
        }
        setShowDecision(false);
      }
    });
    setShowDecision(true);
  };

  const handleEndDay = () => {
    const todaysCompleted = useGameStore.getState().columns.find(c => c.id === 'done')?.tasks.length || 0;
    setCompletedToday(todaysCompleted);
    setShowSummary(true); // Show Modal instead of immediate advance
  };

  const handleNextDayStart = () => {
    setShowSummary(false);
    advanceDay();
    // Auto-save progress
    handleSave(true);
    // Use NEXT day (current day + 1) logic, but 'day' state updates in advanceDay?
    // advanceDay updates store, but 'day' local var here is old?
    // Better to use getState().day inside the action or pass calculated next day.
    // simpler: allow addDailyTasks to read state.day if not passed, OR pass day + 1.
    useGameStore.getState().addDailyTasks(3, day + 1);

    // Check for Friday end (End of Chapter 1)
    if (day === 5) {
      navigate('/debrief');
    }

    // Check for Week 2 End (PPC Review)
    if (day === 10) {
      // Trigger PPC Calculation
      const ppc = useGameStore.getState().calculatePPC();
      // Show Chapter Complete / Weekly Review Modal
      setShowChapterComplete(true);
    }
  };

  // Smart Advisor Logic
  const getSmartObjective = () => {
    if (tutorialStep < 99) return "Follow the Tutorial arrows to learn the basics! ⬇️";

    const state = useGameStore.getState();
    const cols = state.columns;
    const doing = cols.find(c => c.id === 'doing');
    const ready = cols.find(c => c.id === 'ready');
    const backlog = cols.find(c => c.id === 'backlog');

    const doingCount = doing?.tasks.length || 0;
    const readyCount = ready?.tasks.length || 0;
    const backlogCount = backlog?.tasks.length || 0;
    const doingLimit = doing?.wipLimit || 3;

    // Define helper variables early for use in checks
    const allPending = [...(backlog?.tasks || []), ...(ready?.tasks || [])];
    const canPlayAny = allPending.some(t => {
      const isAffordable = state.materials >= t.cost;
      const isRainBlocked = day === 3 && t.type === 'Structural';
      return isAffordable && !isRainBlocked;
    });

    // CHAPTER 2 SPECIFIC GUIDANCE (LPS Teaching)
    if (chapter === 2) {
      if (day === 6) {
        if (readyCount < 3) return "Monday Goal: Check the Backlog. Pull at least 3 tasks to 'Looking Ahead'.";
        return "Good. We have a Lookahead plan. End the day to let the Foreman check it.";
      }
      if (day === 7) {
        return "Tuesday Goal: Click tasks in Lookahead. Find the RED constraints.";
      }
      if (day === 8) {
        const hasGreen = ready?.tasks.some(t => (t.constraints?.length || 0) === 0);
        if (!hasGreen) return "Wednesday Goal: Use Funds/Action to FIX constraints. Make tasks Green.";
        return "Constraints removed! We are ready to commit tomorrow.";
      }
      if (day === 9) {
        return "Thursday Goal: COMMIT! Click 'Run Week'. Do NOT commit Red tasks!";
      }
      if (day === 10) return "Friday Goal: Check PPC. Did we deliver our promise?";
    }

    // 0. NARRATIVE SPECIFIC ADVICE & "END DAY" TRIGGERS

    // Day 1: WIP Limits & Flow
    if (day === 1) {
      if (doingCount === 0 && readyCount === 0) { // Simple start
        return "Objective Complete! Click 'End Day' to finish Day 1.";
      }
      if (doingCount === 0) {
        return "Good job! 'Doing' is clear. Click 'End Day' now. (No need to clear the backlog yet!)";
      }
      return "Day 1 Goal: Move tasks from 'Ready' to 'Doing' and finish them. Keep 'Doing' under limit (2).";
    }

    // Day 2: Supply Shortage
    if (day === 2) {
      if (doingCount > 0) {
        return "Keep working. Finish active tasks.";
      }

      const hasPrep = allPending.some(t => t.cost === 0);
      if (hasPrep) {
        return "SUPPLY DELAY: Materials 0! But you can still do 'Prep' tasks (0 Cost). Pull them now!";
      }

      // Only if NO DOING and NO PREP and NO MATERIALS
      if (state.materials < 10) {
        return "Supply Delay Survived! No more work possible. Click 'End Day'.";
      }

      // Fallback
      return "Day 2 Goal: Keep working until materials run out.";
    }

    // Day 3: Rain
    if (day === 3) {
      const hasIndoor = allPending.some(t => t.type !== 'Structural' && state.materials >= t.cost);
      if (!hasIndoor && doingCount === 0) {
        return "Rain has stopped outdoor work. Click 'End Day' to wait for clear skies.";
      }
      const hasStructuralReady = ready?.tasks.some(t => t.type === 'Structural');
      if (hasStructuralReady) {
        return "RAIN ALERT: Structural tasks are BLOCKED. Focus on Interior/Systems or End Day.";
      }
      return "Day 3 Goal: Do what you can indoors. Don't force outdoor work.";
    }

    // Day 4: Push vs Pull
    if (day === 4) {
      // Prioritize the decision advice logic specific to the choice made
      if (flags['decision_pull_enforced']) {
        if (doingCount === 0 && readyCount === 0) {
          return "Flow Protected. Rao is annoyed, but the site is stable. Click 'End Day'.";
        }
        return "Good Choice! Now, ONLY pull work if you have space. Don't let Rao pressure you.";
      }

      if (flags['decision_push_made']) {
        const hasWaste = doing?.tasks.some(t => t.id.includes('waste'));
        if (hasWaste) {
          return "REWORK DETECTED: You pushed! Finish the 'Rework' task IMMEDIATELY to fix the waste.";
        }
        if (doingCount === 0) {
          return "Waste cleared. hopefully the Inspector is lenient. Click 'End Day'.";
        }
      }

      if (!state.flags.decision_push_made && !state.flags.decision_pull_enforced) {
        return "🛑 DISCIPLINE! Rao wants to push. Wait for the dialogue key decision.";
      }
    }

    // Day 5: Inspection
    if (day === 5) {
      return "🕵️ INSPECTION DAY: The outcome depends on your Day 4 choice. Watch the dialogue!";
    }

    // Default Fallbacks
    if (doingCount === 0 && readyCount === 0 && backlogCount === 0) {
      return "🌙 All tasks complete! Click 'End Day' to rest.";
    }

    // 3. Bottleneck
    if (doingCount >= doingLimit) {
      return "BOTTLENECK: 'Doing' is full! Finish current work before pulling more.";
    }

    // 4. Starvation
    if (doingCount === 0 && readyCount > 0) {
      return "STARVATION: Workers are idle. Pull a task!";
    }

    return "Flow is stable. Keep moving tasks to 'Done'.";
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* 1. Phaser Layer (Background) */}
      <GameCanvas />

      {/* 2. UI Overlay Layer (HUD, Dialogues, Windows) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">

        {/* Top Bar: Resources & Stats */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row justify-between items-start pointer-events-auto gap-4 w-full md:w-auto"
        >
          <div className="flex gap-4 w-full md:w-auto">
            <div id="smart-advisor-box" className="bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-md border-2 border-slate-100 w-full md:min-w-[300px] md:w-auto flex-1">
              <h3 className="font-bold text-slate-700 text-sm md:text-base">Week {week} | Day {day}</h3>
              <div className="text-xs md:text-sm text-slate-500 font-medium">Current Focus:</div>
              <div className="text-xs md:text-sm text-blue-600 animate-pulse font-bold mt-1 leading-tight">
                {getSmartObjective()}
              </div>
            </div>

            <button
              onClick={handleEndDay}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-2 md:px-4 rounded-xl shadow-md transition-colors h-fit self-center border-b-4 border-blue-700 text-sm md:text-base whitespace-nowrap ${getSmartObjective().includes('End Day') ? 'animate-bounce ring-4 ring-yellow-400' : ''}`}
            >
              End Day
            </button>
          </div>

          <div id="stats-box" className="bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-md border-2 border-slate-100 flex gap-4 md:gap-6 w-full md:w-auto justify-around">
            <div className="text-center">
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Funds</div>
              <div className="font-mono font-bold text-blue-600 text-sm md:text-base">${funds}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Morale</div>
              <div className="font-mono font-bold text-green-500 text-sm md:text-base">{lpi.teamMorale}%</div>
            </div>
            <button
              onClick={() => handleSave()}
              disabled={saveGame.isPending}
              className="bg-white hover:bg-slate-50 border-2 border-slate-200 p-1.5 sm:p-2 rounded-lg shadow-sm transition-all active:scale-95"
              title="Save Game"
            >
              {saveGame.isPending ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              )}
            </button>
            <button
              id="btn-settings"
              onClick={() => {
                soundManager.playSFX('click', audioSettings.sfxVolume);
                setShowSettings(true);
              }}
              className="bg-white hover:bg-slate-50 border-2 border-slate-200 p-1.5 sm:p-2 rounded-lg shadow-sm transition-all active:scale-95 pointer-events-auto"
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            </button>
          </div>
        </motion.div>

        {/* Bottom Bar: Toolbar */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center pointer-events-auto pb-2 sm:pb-4"
        >
          <div className="bg-white/90 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg border-2 border-slate-100">
            <div className="flex gap-2 sm:gap-4 items-center">
              <button
                id="btn-kanban"
                onClick={() => setShowKanban(true)}
                className="bg-white/90 backdrop-blur-sm p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:scale-105 transition-transform group relative"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors text-sm sm:text-base">
                  <LayoutDashboard className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600">Kanban</span>
              </button>
              <button
                onClick={() => setShowKanban(false)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <HardHat className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600">Site</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overlays */}
        {/* <CharacterCreationModal /> Moved to ChapterSelect */}
        <PlanningRoom />

        <DialogueBox />

        <TutorialOverlay showKanban={showKanban} />

        <DecisionModal
          isOpen={showDecision}
          title={decisionProps?.title || ''}
          prompt={decisionProps?.prompt || ''}
          options={decisionProps?.options || []}
          onSelect={decisionProps?.onSelect || (() => { })}
        />

        <DayBriefingModal />
        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        {/* Modals & Screens */}
        <AnimatePresence>
          {showKanban && <KanbanBoard onClose={() => setShowKanban(false)} />}
        </AnimatePresence>

        <DailySummary
          isOpen={showSummary}
          onClose={handleNextDayStart}
          completedTasks={completedToday}
        />

      </div >

      <TransitionScreen
        isOpen={showTransition}
        onComplete={() => setShowTransition(false)}
        title="Plan Committed"
        subtitle="Phase Complete"
        description="The weekly plan is set. The crew is ready to execute. Let's build!"
        type="execution"
      />
      {/* Root Level Modals (Interactive) */}
      {flags['character_created'] && !flags['character_cast_seen'] && (
        <CharacterCastModal 
          chapter={chapter} 
          onContinue={() => setFlag('character_cast_seen', true)} 
        />
      )}
      {flags['character_cast_seen'] && !flags['chapter_intro_seen'] && <ChapterIntroModal />}
      {showChapterComplete && chapter === 1 && day === 5 && (
        <ChapterCompleteModal
          isOpen={true}
          onClose={() => setShowChapterComplete(false)}
          onContinue={handleChapterContinue}
        />
      )}
      {showChapterComplete && chapter === 2 && day === 11 && (
        <Chapter2CompleteModal
          isOpen={true}
          onClose={() => setShowChapterComplete(false)}
          onContinue={handleChapter2Continue}
        />
      )}
    </div >
  );
}
