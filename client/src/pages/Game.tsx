import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { GameCanvas } from '@/components/game/GameCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanBoard } from '@/components/game/KanbanBoard';
import { DialogueBox } from '@/components/game/DialogueBox';
import { TutorialOverlay } from '@/components/game/TutorialOverlay';
import { DailySummary } from '@/components/game/DailySummary'; // Import
import { useGameStore } from '@/store/gameStore';
import { WEEK_1_SCHEDULE } from '@/data/chapters/chapter1';
import { DecisionModal } from '@/components/game/DecisionModal';
import { CharacterCreationModal } from '@/components/game/CharacterCreationModal';
import { ChapterIntroModal } from '@/components/game/ChapterIntroModal';
import { DayBriefingModal } from '@/components/game/DayBriefingModal';
import { SettingsModal } from '@/components/game/SettingsModal';
import { useGame } from '@/hooks/use-game';
import soundManager from '@/lib/soundManager';

export default function Game() {
  const [showKanban, setShowKanban] = React.useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);

  // Decision State
  const [showDecision, setShowDecision] = useState(false);
  const [decisionProps, setDecisionProps] = useState<any>(null);

  const {
    startDialogue, currentDialogue, day, advanceDay, week,
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

  // Daily Event & Story Loader
  useEffect(() => {
    // Check if we have config for this day
    const dayConfig = WEEK_1_SCHEDULE.find(d => d.day === day);
    const dayKey = `day_${day}_started`;

    if (dayConfig && !flags[dayKey] && flags['character_created'] && flags['chapter_intro_seen']) {
      // 1. Play Dialogue
      setTimeout(() => {
        startDialogue(dayConfig.dialogue);
        setFlag(dayKey, true);

        // 2. Trigger Event Effects
        if (dayConfig.event === 'supply_delay') {
          useGameStore.setState({ materials: 0 }); // Hard constraint!
        }
        if (dayConfig.day === 3) {
          soundManager.playSFX('storm', audioSettings.sfxVolume);
        }
        if (dayConfig.event === 'decision_push') {
          // Trigger decision AFTER dialogue? Or parallel. 
          // Let's trigger it after a short delay or checking dialogue end.
          // For simplicity, we'll trigger it via a separate effect or timeout
          setTimeout(() => triggerPushDecision(), 5000);
        }
      }, 1000);
    }
  }, [day, flags, startDialogue, setFlag]);

  // Tutorial Logic: Step 1 -> 2 (Open Kanban)
  useEffect(() => {
    if (showKanban && tutorialStep === 1) {
      setTutorialStep(2);
    }
  }, [showKanban, tutorialStep, setTutorialStep]);

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

    // Check for Friday
    const isFriday = day % 5 === 0;
    if (isFriday) {
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

    // 1. End Day Condition
    if (doingCount === 0 && readyCount === 0 && backlogCount === 0) {
      return "All tasks complete! Click 'End Day' to rest. 🌙";
    }

    // 2. Starvation
    if (doingCount === 0 && readyCount > 0) {
      return "⚠️ IDLE CREWS! Move a task from 'Ready' to 'Doing'.";
    }

    // 3. Bottleneck
    if (doingCount >= doingLimit) {
      return "⛔ BOTTLENECK detected! Finish tasks in 'Doing' to clear space.";
    }

    // 4. Prep Work
    if (readyCount === 0 && backlogCount > 0) {
      // Check if we can actually PULL anything
      const affordAnything = backlog?.tasks.some(t => state.materials >= t.cost);
      if (affordAnything) {
        return "📋 PLAN NEXT: Pull a task from Backlog to 'Ready'.";
      }
    }

    // 5. RESOURCE/STORY LOCK (The user requests this prompt)
    // If we have no affordable tasks and nothing in progress, force End Day.
    const allPending = [...(backlog?.tasks || []), ...(ready?.tasks || [])];
    const canPlayAny = allPending.some(t => {
      const isAffordable = state.materials >= t.cost;
      const isRainBlocked = day === 3 && t.type === 'Structural';
      return isAffordable && !isRainBlocked;
    });

    if (!canPlayAny && doingCount === 0) {
      return "⛔ NO MOVES LEFT! (Materials/Weather). End the Day to continue. 🌙";
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
            <div className="bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-md border-2 border-slate-100 w-full md:min-w-[300px] md:w-auto flex-1">
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

          <div className="bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-md border-2 border-slate-100 flex gap-4 md:gap-6 w-full md:w-auto justify-around">
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
