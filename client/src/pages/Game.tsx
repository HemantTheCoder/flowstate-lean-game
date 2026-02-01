import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { GameCanvas } from '@/components/game/GameCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanBoard } from '@/components/game/KanbanBoard';
import { DialogueBox } from '@/components/game/DialogueBox';
import { TutorialOverlay } from '@/components/game/TutorialOverlay';
import { DailySummary } from '@/components/game/DailySummary'; // Import
import { useGameStore } from '@/store/gameStore';
import { CHAPTER_1_INTRO, CHAPTER_1_MID, CHAPTER_1_END } from '@/data/story';

export default function Game() {
  const [showKanban, setShowKanban] = React.useState(false);
  const [showSummary, setShowSummary] = useState(false); // Summary State
  const [completedToday, setCompletedToday] = useState(0);

  const { startDialogue, currentDialogue, day, advanceDay, week, tutorialStep, setTutorialStep, flags, setFlag } = useGameStore();
  const [_, navigate] = useLocation();

  // Tutorial Hook
  React.useEffect(() => {
    if (showKanban && tutorialStep === 1) {
      setTutorialStep(2);
    }
  }, [showKanban, tutorialStep, setTutorialStep]);

  // Intro Dialogue Hook
  useEffect(() => {
    // Check if we haven't seen intro yet
    if (!flags['intro_seen'] && day === 1) {
      setTimeout(() => {
        startDialogue(CHAPTER_1_INTRO);
        setFlag('intro_seen', true);
      }, 1000);
    }
  }, [flags, day, startDialogue, setFlag]);

  // Story Progression Hook (Chapter 1 End)
  useEffect(() => {
    if (tutorialStep === 99 && !currentDialogue && !flags['ch1_end_seen']) {
      // Tutorial finished, trigger end of chapter dialogue
      setTimeout(() => {
        startDialogue(CHAPTER_1_END);
        setFlag('ch1_end_seen', true);
      }, 500);
    }
  }, [tutorialStep, currentDialogue, startDialogue, flags, setFlag]);

  // Educational Moment: Bottleneck Warning (Mid-Chapter)
  useEffect(() => {
    const state = useGameStore.getState();
    const doingCount = state.columns.find(c => c.id === 'doing')?.tasks.length || 0;

    if (tutorialStep === 99 && doingCount >= 2 && !flags['ch1_mid_seen'] && !currentDialogue) {
      setTimeout(() => {
        startDialogue(CHAPTER_1_MID);
        setFlag('ch1_mid_seen', true);
      }, 1000);
    }
  }, [day, tutorialStep, currentDialogue, startDialogue, flags, setFlag]); // Check on day change or updates

  const handleEndDay = () => {
    const todaysCompleted = useGameStore.getState().columns.find(c => c.id === 'done')?.tasks.length || 0;
    setCompletedToday(todaysCompleted);
    setShowSummary(true); // Show Modal instead of immediate advance
  };

  const handleNextDayStart = () => {
    setShowSummary(false);
    advanceDay();
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
      return "📋 PLAN NEXT: Pull a task from Backlog to 'Ready'.";
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
              <div className="font-mono font-bold text-green-500 text-sm md:text-base">{useGameStore(s => s.lpi.teamMorale)}%</div>
            </div>
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

        {/* Modals & Screens */}
        <AnimatePresence>
          {showKanban && <KanbanBoard onClose={() => setShowKanban(false)} />}
        </AnimatePresence>

        <DailySummary
          isOpen={showSummary}
          onClose={handleNextDayStart}
          completedTasks={completedToday}
        />

      </div>
    </div>
  );
}
