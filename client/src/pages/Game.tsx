import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { GameCanvas } from '@/components/game/GameCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanBoard } from '@/components/game/KanbanBoard';
import { DialogueBox } from '@/components/game/DialogueBox';
import { TutorialOverlay } from '@/components/game/TutorialOverlay';
import { DailySummary } from '@/components/game/DailySummary'; // Import
import { useGameStore } from '@/store/gameStore';
import { WEEK_1_SCHEDULE, DAY_5_GOOD, DAY_5_BAD } from '@/data/chapters/chapter1';
import { WEEK_2_SCHEDULE } from '@/data/chapters/chapter2';
import { DecisionModal } from '@/components/game/DecisionModal';
import { CharacterCreationModal } from '@/components/game/CharacterCreationModal';
import { ChapterIntroModal } from '@/components/game/ChapterIntroModal';
import { DayBriefingModal } from '@/components/game/DayBriefingModal';
import { ChapterCompleteModal } from '@/components/game/ChapterCompleteModal';
import { SettingsModal } from '@/components/game/SettingsModal';
import { useGame } from '@/hooks/use-game';
import soundManager from '@/lib/soundManager';

export default function Game() {
  const [showKanban, setShowKanban] = React.useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [showChapterComplete, setShowChapterComplete] = useState(false);

  // Decision State
  const [showDecision, setShowDecision] = useState(false);
  const [decisionProps, setDecisionProps] = useState<any>(null);

  const {
    startDialogue, currentDialogue, day, advanceDay, week, chapter,
    tutorialStep, setTutorialStep, flags, setFlag, importState,
    playerName, playerGender, funds, materials, columns, lpi
  } = useGameStore();
  const { saveGame, gameState, isLoading: isServerLoading } = useGame();
  const [_, navigate] = useLocation();

  // 1. Hydrate Store from Server on Load
  useEffect(() => {
    if (gameState && !flags['hydrated']) {
      importState(gameState);
      setFlag('hydrated', true);
    }
  }, [gameState, flags, importState, setFlag]);

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
      await saveGame.mutateAsync({
        sessionId: '', // Handled by hook
        playerName,
        chapter: useGameStore.getState().chapter,
        week,
        resources: {
          morale: lpi.teamMorale,
          stress: 0,
          trust: 50,
          productivity: 40,
          quality: 80,
          budget: funds
        },
        kanbanState: { columns } as any,
        flags,
        metrics: lpi as any,
        completedChapters: [],
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
          setTimeout(() => setShowChapterComplete(true), 1000); // Slight delay for impact
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
      if (dayConfig.day === 3) {
        soundManager.playSFX('storm', audioSettings.sfxVolume);
      }
      // NOTE: Decisions are now triggered by the dialogue completion effect above!
    }
  }, [day, chapter, flags, startDialogue, setFlag]);

  // Bankruptcy Check
  useEffect(() => {
    if (funds < 0) {
      alert("💸 BANKRUPTCY 💸\n\nYou ran out of funds! The project has been shut down.\n\nTip: Keep the flow moving to generate revenue faster than the Daily Overhead expenses.");
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
          alert("⛔ GAME OVER ⛔\n\nThe funding was pulled due to poor management and excessive waste. The project has been cancelled.\n\nReturning to Title Screen...");
          // Reset Game State completely
          await useGameStore.getState().setChapter(1); // Reset store basics if needed, or just let server reset
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
          useGameStore.getState().addLog("Decision: Pushed work. created Waste.");
          setFlag('decision_push_made', true);
          useGameStore.getState().injectWaste();
          // Add penalty logic here later
        } else {
          useGameStore.getState().addLog("Decision: Enforced Pull. Flow protected.");
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

    // 0. NARRATIVE SPECIFIC ADVICE (User requested better guidance)
    if (day === 2 && state.materials === 0) {
      return "🚚 SUPPLY DELAY: Material is 0! Pull 'Prep' or 'Management' tasks (0 Cost) to keep the flow moving.";
    }
    if (day === 3) {
      const hasStructuralReady = ready?.tasks.some(t => t.type === 'Structural');
      if (hasStructuralReady) {
        return "🌧️ RAIN WARNING: You have Structural work in 'Ready', but it is BLOCKED. Switch to Systems/Interior!";
      }
      return "🌧️ RAIN: Outdoor work is blocked. Focus on Indoor 'System' or 'Interior' tasks.";
    }

    if (day === 4 && !state.flags.decision_push_made) {
      return "🛑 DISCIPLINE! Rao wants to push unready work. Enforce 'Pull' logic to keep the flow stable.";
    }

    // 1. END DAY & NARRATIVE COMPLETION CHECKS
    // Day 1: Narrative says "Stop starting new things". If 'Doing' is empty, we are done, even if Backlog has items.
    if (day === 1 && doingCount === 0) {
      return "🌙 Day 1 Complete! You stabilized the flow by finishing active work. Click 'End Day'.";
    }

    // Day 2 (Supply Delay): If we have no materials and no 0-cost (Prep) tasks left, we are done.
    if (day === 2 && state.materials < 10 && doingCount === 0) { // <10 buffer
      const hasPrep = allPending.some(t => t.cost === 0);
      if (!hasPrep) {
        return "🌙 Day 2 Complete! No more Prep tasks available. Supply truck arrives tomorrow. End Day.";
      }
    }

    // Day 3 (Rain): If we have no Indoor tasks left and Outdoor is blocked.
    if (day === 3 && doingCount === 0) {
      const hasIndoor = allPending.some(t => t.type !== 'Structural' && state.materials >= t.cost);
      if (!hasIndoor) {
        return "🌙 Day 3 Complete! Rain blocks all remaining structural work. End Day.";
      }
    }

    // Generic "All Done" (Total Empty)
    if (doingCount === 0 && readyCount === 0 && backlogCount === 0) {
      return "🌙 All tasks complete! Click 'End Day' to rest and get paid.";
    }

    // 2. Resource/Constraint Lock (Generic)
    if (!canPlayAny && doingCount === 0) {
      return "🌙 Day Complete! No actvity possible (Materials/Weather). Click 'End Day'.";
    }

    // 3. Bottleneck (High Priority Alert)
    if (doingCount >= doingLimit) {
      return "⛔ BOTTLENECK: The 'Doing' column is full! You cannot start new cards. Focus on finishing current work.";
    }

    // 4. Starvation (Alert)
    if (doingCount === 0 && readyCount > 0) {
      return "⚠️ STARVATION: 'Doing' is empty! Workers are idle. Pull a card from 'Ready' to keep flow moving.";
    }

    // 5. General Advice
    if (readyCount === 0 && backlogCount > 0) {
      const affordAnything = backlog?.tasks.some(t => state.materials >= t.cost);
      if (affordAnything) {
        return "📋 PLAN NEXT: Pull a task from Backlog to 'Ready'.";
      }
    }

    return "✅ Flow is stable. Keep moving tasks to 'Done' to earn funds!";
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
              End Day ☀️
            </button>
          </div>

          <div id="stats-box" className="bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-md border-2 border-slate-100 flex gap-4 md:gap-6 w-full md:w-auto justify-around">
            <div className="text-center">
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Funds</div>
              <div className="font-mono font-bold text-blue-600 text-sm md:text-base">${useGameStore(s => s.funds)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Morale</div>
              <div className="font-mono font-bold text-green-500 text-sm md:text-base">{lpi.teamMorale}%</div>
            </div>
            <button
              onClick={() => handleSave()}
              disabled={saveGame.isPending}
              className="bg-white hover:bg-slate-50 border-2 border-slate-200 p-2 rounded-lg shadow-sm transition-all active:scale-95"
              title="Save Game"
            >
              {saveGame.isPending ? '⏳' : '💾'}
            </button>
            <button
              id="btn-settings"
              onClick={() => {
                soundManager.playSFX('click', audioSettings.sfxVolume);
                setShowSettings(true);
              }}
              className="bg-white hover:bg-slate-50 border-2 border-slate-200 p-2 rounded-lg shadow-sm transition-all active:scale-95 pointer-events-auto"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </motion.div>

        {/* Bottom Bar: Toolbar */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center pointer-events-auto pb-4"
        >
          <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border-2 border-slate-100">
            <div className="flex gap-4 items-center">
              <button
                id="btn-kanban"
                onClick={() => setShowKanban(true)}
                className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform group relative"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  📊
                </div>
                <span className="text-xs font-bold text-slate-600">Kanban</span>
              </button>
              <button
                onClick={() => setShowKanban(false)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  🏗️
                </div>
                <span className="text-xs font-bold text-slate-600">Site</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overlays */}
        <DialogueBox />

        <TutorialOverlay showKanban={showKanban} />

        <DecisionModal
          isOpen={showDecision}
          title={decisionProps?.title || ''}
          prompt={decisionProps?.prompt || ''}
          options={decisionProps?.options || []}
          onSelect={decisionProps?.onSelect || (() => { })}
        />

        <CharacterCreationModal />
        <ChapterIntroModal />
        <DayBriefingModal />
        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <ChapterCompleteModal isOpen={showChapterComplete} onClose={() => setShowChapterComplete(false)} />

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
    </div >
  );
}
