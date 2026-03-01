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
import { CHAPTER_3_SCHEDULE } from '@/data/chapters/chapter3';
import { DecisionModal } from '@/components/game/DecisionModal';
import { TransitionScreen } from '@/components/game/TransitionScreen';
import { ChapterIntroModal } from '@/components/game/ChapterIntroModal';
import { CharacterCastModal } from '@/components/game/CharacterCastModal';
import { DayBriefingModal } from '@/components/game/DayBriefingModal';
import { WorkspaceDepot } from '@/components/game/WorkspaceDepot';
import { ChapterCompleteModal } from '@/components/game/ChapterCompleteModal';
import { Chapter2CompleteModal } from '@/components/game/Chapter2CompleteModal';
import { Chapter3CompleteModal } from '@/components/game/Chapter3CompleteModal';
import { SettingsModal } from '@/components/game/SettingsModal';
import { useGame } from '@/hooks/use-game';
import soundManager from '@/lib/soundManager';
import { LayoutDashboard, HardHat, Save, Settings, BookOpen, Package } from 'lucide-react';
import { GlossaryPanel } from '@/components/game/GlossaryPanel';
import { ReflectionQuiz } from '@/components/game/ReflectionQuiz';
import { useAuth } from '@/hooks/use-auth';
import { AuthModal } from '@/components/ui/AuthModal';
import { useToast } from '@/hooks/use-toast';

export default function Game() {
  const [showKanban, setShowKanban] = React.useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
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
  const unlockedChapters = useGameStore(s => s.unlockedChapters);
  const depotScore = useGameStore(s => s.depotScore);

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
  const { toast } = useToast();

  // 1. Hydrate Store from Server on Load
  const hydratedRef = React.useRef(false);
  useEffect(() => {
    if (gameState && !hydratedRef.current) {
      if (useGameStore.getState().bypassHydration) {
        // User manually selected a chapter, ignore server state, clear flag, and overwrite save with fresh chapter state
        useGameStore.getState().setBypassHydration(false);
        setFlag('hydrated', true);
        hydratedRef.current = true;
        handleSave(true); // Save the freshly started chapter to cloud
      } else {
        // Normal resume from server
        importState(gameState);
        setFlag('hydrated', true);
        hydratedRef.current = true;
      }
    }
  }, [gameState, importState, setFlag]);

  // Redirect to chapters if character not created
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 500ms grace period to allow local hydration to safely replace flags before redirect checks fire
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isServerLoading || isInitializing) return;
    if (gameState && !hydratedRef.current) return;
    if (!flags['character_created']) {
      navigate('/chapters');
    }
  }, [flags, navigate, isServerLoading, gameState, isInitializing]);

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

  const handleChapter2Continue = () => {
    useGameStore.getState().completeChapter(2);
    handleSave(true);
    navigate('/chapters');
  };

  const handleChapter3Continue = () => {
    useGameStore.getState().completeChapter(3);
    handleSave(true);
    navigate('/chapters');
  };

  // Audio Control Loop
  const audioSettings = useGameStore(s => s.audioSettings);
  useEffect(() => {
    if (chapter === 2 && phase === 'planning') {
      soundManager.playBGM('planning', audioSettings.bgmVolume * 0.8);
    } else if (day === 3) {
      soundManager.playBGM('rain', audioSettings.bgmVolume);
    } else if ((columns.find(c => c.id === 'doing')?.tasks.length || 0) >= 3) {
      soundManager.playBGM('tense', audioSettings.bgmVolume);
    } else {
      soundManager.playBGM('construction', audioSettings.bgmVolume);
    }
  }, [day, chapter, phase, columns, audioSettings.bgmVolume]);

  useEffect(() => {
    soundManager.updateVolumes(audioSettings.bgmVolume, audioSettings.sfxVolume, audioSettings.isMuted);
  }, [audioSettings.bgmVolume, audioSettings.sfxVolume, audioSettings.isMuted]);

  useEffect(() => {
    const handleInteraction = () => {
      soundManager.resumeAudio();
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  // Auth Integration
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSave = async (silent = false) => {
    // If not authenticated, show Auth Modal instead of saving immediately (unless silent auto-save)
    if (!user && !silent) {
      setShowAuthModal(true);
      return;
    }

    try {
      const state = useGameStore.getState();
      await saveGame.mutateAsync({
        sessionId: '', // Handled by hook
        userId: user?.id, // Attach User ID if logged in
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
        kanbanState: {
          columns: state.columns,
          day: state.day,
          playerGender: state.playerGender,
          tutorialActive: state.tutorialActive,
          tutorialStep: state.tutorialStep,
          dailyMetrics: state.dailyMetrics,
          previousDoneCount: state.previousDoneCount,
          previousWasteCount: state.previousWasteCount,
          cumulativeTasksCompleted: state.cumulativeTasksCompleted,
          cumulativePotentialCapacity: state.cumulativePotentialCapacity,
          // Narrative & Phase Persistence
          phase: state.phase,
          currentDialogue: state.currentDialogue,
          dialogueIndex: state.dialogueIndex,
        } as any,
        flags: state.flags,
        metrics: { ...state.lpi, ppcHistory: state.ppcHistory },
        weeklyPlan: state.weeklyPlan,
        completedChapters: state.unlockedChapters.filter(c => c !== 1).map(c => c - 1),
        unlockedBadges: state.unlockedBadges
      });
      if (!silent) {
        toast({ title: "Game Saved!", description: "Progress synced to cloud." });
      }
    } catch (err) {
      console.error("Save failed:", err);
      if (!silent) toast({ title: "Save Failed", description: "Could not sync progress.", variant: "destructive" });
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
          // Good Outcome -> Don't skip to chapter complete here
          // Let the normal flow handle it: End Day -> Summary -> Quiz -> Chapter Complete
        }
      }

      if (day === 9 && chapter === 2 && !flags['overcommitment_accepted'] && !flags['overcommitment_declined']) {
        triggerClientPressureDecision();
      }
    }
    prevDialogueRef.current = currentDialogue;
  }, [currentDialogue, day, flags, setFlag]);

  // Daily Event & Story Loader
  useEffect(() => {
    // Choose Schedule based on Chapter
    const currentSchedule = chapter === 1 ? WEEK_1_SCHEDULE :
      chapter === 2 ? WEEK_2_SCHEDULE :
        CHAPTER_3_SCHEDULE;
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
      // if (dayConfig.event === 'client_pressure' && chapter === 2) {
      //   setTimeout(() => triggerClientPressureDecision(), 1000);
      // }

      // Day 10: Emergency pipe repair injection
      if (day === 10 && chapter === 2) {
        setTimeout(() => {
          useGameStore.getState().applyDayEvent(10);
        }, 2000);
      }

      // Day 11: Crew constraint on active task
      if (day === 11 && chapter === 2) {
        setTimeout(() => {
          useGameStore.getState().applyDayEvent(11);
        }, 2000);
      }

      // Day 11 inspection: Don't auto-show chapter complete here.
      // The flow is: Day 11 dialogue -> End Day -> Summary -> Quiz -> Chapter Complete

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
    // Step 6: Close Kanban to show Advisor Spotlight (after WIP slider step)
    if (tutorialStep === 6 && showKanban) {
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
    const state = useGameStore.getState();
    const previousDoneCount = state.previousDoneCount;
    const currentDoneCount = state.columns.find(c => c.id === 'done')?.tasks.length || 0;
    const todaysCompleted = currentDoneCount - previousDoneCount;
    setCompletedToday(Math.max(0, todaysCompleted));
    advanceDay();
    handleSave(true);
    setShowSummary(true);
  };

  const handleNextDayStart = () => {
    setShowSummary(false);
    const currentDay = useGameStore.getState().day;

    if (currentDay > 5 && chapter === 1) {
      setShowQuiz(true);
      return;
    }

    if (currentDay > 11 && chapter === 2) {
      useGameStore.getState().calculatePPC();
      setShowQuiz(true);
      return;
    }

    if (currentDay > 16 && chapter === 3) {
      setShowQuiz(true);
      return;
    }

    if (chapter === 2 && currentDay >= 6 && currentDay <= 9) {
      return;
    }

    if (chapter === 3 && currentDay >= 12 && currentDay <= 16) {
      return;
    }

    useGameStore.getState().addDailyTasks(3, currentDay);
  };

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    setShowQuiz(false);
    setShowChapterComplete(true);
  };

  // Smart Advisor Logic
  const getSmartObjective = () => {
    if (tutorialStep < 99 && chapter === 1) return "Follow the Tutorial arrows to learn the basics!";

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
      const isPlanning = state.phase === 'planning';

      if (day === 6) {
        if (isPlanning) {
          const lookaheadCount = ready?.tasks.length || 0;
          if (lookaheadCount < 3) return "Day 6: Pull 4-6 tasks from Master Schedule to Lookahead. You cannot fix constraints yet - just review what's available.";
          if (lookaheadCount < 6) return "Good start! Pull a few more tasks to give yourself options. Constraints are hidden today - you'll discover them tomorrow.";
          return "Lookahead is filling up! End Day when you've pulled enough tasks to plan around.";
        }
        return "Planning Room is open. Review your Master Schedule and Lookahead.";
      }
      if (day === 7) {
        if (isPlanning) {
          const blockedTasks = ready?.tasks.filter(t => (t.constraints?.length || 0) > 0) || [];
          const allInspected = blockedTasks.every(t => state.flags[`inspected_${t.id}`]);
          if (blockedTasks.length > 0 && !allInspected) return "Day 7: Click each RED task in Lookahead to DISCOVER its constraints. You must inspect all blocked tasks before moving on.";
          if (allInspected) return "All constraints discovered! You now understand what's blocking your tasks. End Day to start fixing them tomorrow.";
          return "No blocked tasks found. You can End Day and move to the Make Ready phase.";
        }
        return "Constraint Discovery: Find all the blockers before trying to fix them.";
      }
      if (day === 8) {
        if (isPlanning) {
          const greenCount = ready?.tasks.filter(t => (t.constraints?.length || 0) === 0).length || 0;
          const totalInLookahead = ready?.tasks.length || 0;
          if (greenCount < 2) return "Day 8: Make Ready! Click 'Fix' on constraints to turn RED tasks GREEN. Each fix costs budget or morale - choose wisely!";
          if (greenCount < totalInLookahead) return `${greenCount}/${totalInLookahead} tasks are Sound. Keep fixing or pull new tasks. You can also End Day.`;
          return "All tasks are Sound! You're ready for tomorrow's commitment. End Day.";
        }
        return "Make Ready: Remove blockers so tasks can flow.";
      }
      if (day === 9) {
        if (isPlanning) {
          const greenCount = ready?.tasks.filter(t => (t.constraints?.length || 0) === 0).length || 0;
          if (greenCount === 0) return "Day 9: You need GREEN tasks to commit! Fix remaining constraints or pull easier tasks.";
          return `Day 9: ${greenCount} Sound tasks ready. Click 'Start Week' to COMMIT your promises. Only promise what you CAN deliver!`;
        }
        return "Commitment Day: Lock in your Weekly Work Plan.";
      }
      if (day === 10) {
        const doneTasks = state.columns.find(c => c.id === 'done')?.tasks || [];
        const weeklyPlanCount = state.weeklyPlan.length;
        const doneFromPlan = doneTasks.filter(t => state.weeklyPlan.includes(t.id) || state.weeklyPlan.includes(t.originalId || '')).length;
        if (doingCount >= doingLimit) return "WIP limit reached! Finish active tasks before pulling more. Every completed promise improves your PPC.";
        if (doingCount > 0) return `Day 10: Execute! ${doneFromPlan}/${weeklyPlanCount} promises kept. Keep tasks flowing through Doing to Done.`;
        if (readyCount > 0) return `Day 10: Pull tasks from Ready to Doing. You have ${readyCount} tasks waiting. Complete them to keep your promises!`;
        if (doneFromPlan >= weeklyPlanCount) return "All promises kept! Click 'End Day' to see your progress.";
        return `Day 10: Execution Day - ${doneFromPlan}/${weeklyPlanCount} committed tasks completed. Move tasks to finish your promises!`;
      }
      if (day === 11) {
        const doneTasks = state.columns.find(c => c.id === 'done')?.tasks || [];
        const weeklyPlanCount = state.weeklyPlan.length;
        const doneFromPlan = doneTasks.filter(t => state.weeklyPlan.includes(t.id) || state.weeklyPlan.includes(t.originalId || '')).length;
        if (doingCount > 0) return `Day 11: Final push! Finish remaining tasks before the PPC Review. ${doneFromPlan}/${weeklyPlanCount} promises kept.`;
        if (readyCount > 0) return `Day 11: Last chance to complete your commitments! ${readyCount} tasks still in Ready.`;
        return "Day 11: PPC Review time! Click 'Finish Chapter' to see how reliable your promises were.";
      }
    }

    // CHAPTER 3 SPECIFIC GUIDANCE (5S Teaching)
    if (chapter === 3) {
      if (day === 12) return "Day 12: Sort (Seiri). Throw away broken tools and unnecessary trash into the Red Tag bin.";
      if (day === 13) return "Day 13: Set in Order (Seiton). Give every remaining item a home in the correct zone.";
      if (day === 14) return "Day 14: Shine (Seiso). Click the hazard icons on the floor to clean spills and remove trip risks.";
      if (day === 15) return "Day 15: Standardize (Seiketsu). Rules are set. Ensure everything is in its designated place.";
      if (day === 16) return "Day 16: Sustain (Shitsuke). The Inspector is auditing. Ensure no items are out of standard.";
    }

    // 0. NARRATIVE SPECIFIC ADVICE & "END DAY" TRIGGERS

    // Day 1: WIP Limits & Flow
    if (day === 1) {
      if (doingCount === 0 && readyCount === 0) {
        return "Objective Complete! Click 'End Day'. Lean Tip: Finishing beats starting. WIP limits ensure focus.";
      }
      if (doingCount === 0) {
        return "Good job! 'Doing' is clear. Click 'End Day' now.";
      }
      if (doingCount >= doingLimit) {
        return "WIP Limit reached! Finish active tasks before pulling more. This prevents bottlenecks.";
      }
      return "Day 1: Move tasks Ready -> Doing -> Done. Keep 'Doing' under the WIP limit (2). Focus on finishing!";
    }

    // Day 2: Supply Shortage
    if (day === 2) {
      if (doingCount > 0) {
        return "Keep working. Finish active tasks before pulling more.";
      }

      const hasPrep = allPending.some(t => t.cost === 0);
      if (hasPrep) {
        return "SUPPLY DELAY: Materials exhausted! Lean Response: pivot to zero-cost tasks (Prep/Management). Never idle when work exists!";
      }

      if (state.materials < 10) {
        return "Supply Delay Survived! No more work possible. Click 'End Day'. Lean Tip: Buffer management keeps flow alive.";
      }

      return "Day 2: Work normally until materials run out. Then adapt - pull zero-cost tasks to maintain flow.";
    }

    // Day 3: Rain
    if (day === 3) {
      const hasIndoor = allPending.some(t => t.type !== 'Structural' && state.materials >= t.cost);
      if (!hasIndoor && doingCount === 0) {
        return "Rain has stopped all viable work. Click 'End Day'. Lean Tip: keep a backlog of indoor tasks for weather days.";
      }
      const hasStructuralReady = ready?.tasks.some(t => t.type === 'Structural');
      if (hasStructuralReady) {
        return "MONSOON: Structural tasks are BLOCKED by rain. Lean Response: pivot to Interior/Systems work. Adaptation beats idle time.";
      }
      return "Day 3: Heavy rain blocks outdoor work. Pull indoor tasks (Interior, Systems, Management) to maintain flow.";
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
        return "DISCIPLINE: Rao wants to push. Wait for the key decision.";
      }
    }

    // Day 5: Inspection
    if (day === 5) {
      if (doingCount === 0 && readyCount === 0 && backlogCount === 0) {
        return "Inspection complete! Click 'Finish Chapter' to see your results.";
      }
      return "INSPECTION DAY: The outcome depends on your Day 4 choice. Watch the dialogue!";
    }

    // Default Fallbacks
    if (doingCount === 0 && readyCount === 0 && backlogCount === 0) {
      return "All tasks complete! Click 'End Day' to rest.";
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

  const handleSaveAndExit = async () => {
    await handleSave(false);
    navigate('/');
  };

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 bg-slate-900`}>
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
            <div id="smart-advisor-box" className="bg-slate-800/80 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-md border border-slate-700/50 w-full md:min-w-[300px] md:w-auto flex-1">
              <h3 className="font-bold text-slate-300 text-sm md:text-base">Week {week} | Day {day}</h3>
              <div className="text-xs md:text-sm text-slate-400 font-medium">Current Focus:</div>
              <div className="text-xs md:text-sm text-cyan-400 animate-pulse font-bold mt-1 leading-tight">
                {getSmartObjective()}
              </div>
            </div>

            <button
              onClick={handleEndDay}
              data-testid="button-end-day"
              className={`${(day === 5 && chapter === 1) || (day === 11 && chapter === 2) || (day === 16 && chapter === 3) ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-b-4 border-amber-700 ring-2 ring-amber-300/50' : 'bg-cyan-600 hover:bg-cyan-500 border-b-4 border-cyan-800'} text-white font-bold px-3 py-2 md:px-4 rounded-xl shadow-md transition-colors h-fit self-center text-sm md:text-base whitespace-nowrap ${getSmartObjective().includes('End Day') || getSmartObjective().includes('Finish Chapter') ? 'animate-bounce ring-4 ring-amber-400/50' : ''}`}
            >
              {((day === 5 && chapter === 1) || (day === 11 && chapter === 2) || (day === 16 && chapter === 3)) ? 'Finish Chapter' : 'End Day'}
            </button>
          </div>

          <div id="stats-box" className="bg-slate-800/80 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-md border border-slate-700/50 flex gap-4 md:gap-6 w-full md:w-auto justify-around">
            <div className="text-center">
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Funds</div>
              <div className="font-mono font-bold text-emerald-400 text-sm md:text-base">${funds}</div>
            </div>

            {chapter === 3 ? (
              <div className="text-center px-4 border-l border-slate-700/50">
                <div className="text-[10px] md:text-xs font-bold text-amber-500 uppercase">5S Audit</div>
                <div className="font-mono font-black text-amber-400 text-sm md:text-base">{depotScore}%</div>
              </div>
            ) : (
              <div className="text-center px-4 border-l border-slate-700/50">
                <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Morale</div>
                <div className="font-mono font-bold text-emerald-400 text-sm md:text-base">{lpi.teamMorale}%</div>
              </div>
            )}

            <button
              id="btn-save"
              onClick={() => handleSave()}
              disabled={saveGame.isPending}
              className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 p-1.5 sm:p-2 rounded-lg shadow-sm transition-all active:scale-95"
              title="Save Game"
            >
              {saveGame.isPending ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
              )}
            </button>
            <button
              id="btn-settings"
              onClick={() => {
                soundManager.playSFX('click', audioSettings.sfxVolume);
                setShowSettings(true);
              }}
              className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 p-1.5 sm:p-2 rounded-lg shadow-sm transition-all active:scale-95 pointer-events-auto"
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            </button>
          </div>
        </motion.div>

        {/* Bottom Bar: Toolbar */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center pointer-events-auto pb-2 sm:pb-4"
        >
          <div className="bg-slate-800/80 backdrop-blur-md px-2 sm:px-6 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg border border-slate-700/50">
            <div className="flex gap-1.5 sm:gap-4 items-center">
              <button
                id="btn-kanban"
                onClick={() => setShowKanban(true)}
                className="flex flex-col items-center gap-0.5 sm:gap-1 group"
              >
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-colors
                  ${chapter === 3 ? 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white border border-cyan-500/30'}
                `}>
                  {chapter === 3 ? <Package className="w-4 h-4 sm:w-6 sm:h-6" /> : <LayoutDashboard className="w-4 h-4 sm:w-6 sm:h-6" />}
                </div>
                <span className="text-[9px] sm:text-xs font-bold text-slate-400">{chapter === 3 ? 'Depot' : 'Kanban'}</span>
              </button>
              <button
                onClick={() => setShowKanban(false)}
                className="flex flex-col items-center gap-0.5 sm:gap-1 group"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors border border-purple-500/30">
                  <HardHat className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-xs font-bold text-slate-400">Site</span>
              </button>
              <button
                onClick={() => setShowGlossary(true)}
                className="flex flex-col items-center gap-0.5 sm:gap-1 group"
                data-testid="button-glossary"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-xs font-bold text-slate-600">Glossary</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overlays */}
        {/* <CharacterCreationModal /> Moved to ChapterSelect */}
        <PlanningRoom onSave={() => handleSave()} />

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

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSaveAndExit={handleSaveAndExit}
        />

        {/* Auth Modal */}
        <div className={showAuthModal ? "block" : "hidden"}>
          <AuthModal triggerOpen={showAuthModal} onOpenChange={setShowAuthModal} />
        </div>

        {/* Modals & Screens */}
        <AnimatePresence>
          {showKanban && chapter !== 3 && <KanbanBoard onClose={() => setShowKanban(false)} />}
          {showKanban && chapter === 3 && <WorkspaceDepot onClose={() => setShowKanban(false)} />}
        </AnimatePresence>

        <DailySummary
          isOpen={showSummary}
          onClose={handleNextDayStart}
          completedTasks={completedToday}
        />
      </div>

      <GlossaryPanel isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
      <ReflectionQuiz isOpen={showQuiz} onComplete={handleQuizComplete} chapter={chapter} />

      <TransitionScreen
        isOpen={showTransition}
        onComplete={() => setShowTransition(false)}
        title="Plan Committed"
        subtitle="Last Planner System"
        description="Your weekly promises are locked. Time to deliver."
        type="execution"
        committedTasks={useGameStore.getState().weeklyPlan.length}
      />
      {/* Root Level Modals (Interactive) */}
      {flags['character_created'] && !flags['character_cast_seen'] && (
        <CharacterCastModal
          chapter={chapter}
          onContinue={() => setFlag('character_cast_seen', true)}
        />
      )}
      {flags['character_cast_seen'] && !flags['chapter_intro_seen'] && <ChapterIntroModal />}
      {showChapterComplete && chapter === 1 && (
        <ChapterCompleteModal
          isOpen={true}
          onClose={() => setShowChapterComplete(false)}
          onContinue={handleChapterContinue}
          quizScore={quizScore}
        />
      )}
      {showChapterComplete && chapter === 2 && (
        <Chapter2CompleteModal
          isOpen={true}
          onClose={() => setShowChapterComplete(false)}
          onContinue={handleChapter2Continue}
          quizScore={quizScore}
        />
      )}
      {showChapterComplete && chapter === 3 && (
        <Chapter3CompleteModal
          isOpen={true}
          onClose={() => setShowChapterComplete(false)}
          onContinue={handleChapter3Continue}
          quizScore={quizScore}
        />
      )}
    </div>
  );
}
