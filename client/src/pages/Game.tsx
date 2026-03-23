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
import { PullSystemDashboard } from '@/components/game/PullSystemDashboard';
import { CASE_1_SCHEDULE } from '@/data/cases/case1';
import { CASE_2_SCHEDULE } from '@/data/cases/case2';
import { CoastalView } from '@/components/game/case2/CoastalView';
import { ChapterCompleteModal } from '@/components/game/ChapterCompleteModal';
import { Chapter2CompleteModal } from '@/components/game/Chapter2CompleteModal';
import { Chapter3CompleteModal } from '@/components/game/Chapter3CompleteModal';
import { Chapter4CompleteModal } from '@/components/game/Chapter4CompleteModal';
import { SettingsModal } from '@/components/game/SettingsModal';
import { LeanAIModal } from '@/components/game/LeanAIModal';
import { LoadingScreen } from '@/components/game/LoadingScreen';
import { useGame } from '@/hooks/use-game';
import soundManager from '@/lib/soundManager';
import { LayoutDashboard, HardHat, Save, Settings, BookOpen, Package, Plane, AlertTriangle, Wrench, ArrowUpDown, Brain, Target, ClipboardList } from 'lucide-react';
import { GlossaryPanel } from '@/components/game/GlossaryPanel';
import { ReflectionQuiz } from '@/components/game/ReflectionQuiz';
import { useAuth } from '@/hooks/use-auth';
import { AuthModal } from '@/components/ui/AuthModal';
import { useToast } from '@/hooks/use-toast';
import { LifeHearts } from '@/components/game/LifeHearts';
import { GameOverOverlay } from '@/components/game/GameOverOverlay';
import { TaskModeSelector } from '@/components/game/TaskModeSelector';
import { ProjectStatusSheet } from '@/components/game/ProjectStatusSheet';

export default function Game() {
  const [showKanban, setShowKanban] = React.useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeanAI, setShowLeanAI] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showTransition, setShowTransition] = useState(false);

  // Decision State
  const [showDecision, setShowDecision] = useState(false);
  const [decisionProps, setDecisionProps] = useState<any>(null);
  const [showProjectSheet, setShowProjectSheet] = useState(false);

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
  const loseLife = useGameStore(s => s.loseLife);
  const taskModeSelected = useGameStore(s => s.taskModeSelected);
  const setTaskModeSelected = useGameStore(s => s.setTaskModeSelected);
  const gameOverReason = useGameStore(s => s.gameOverReason);
  const pdi = useGameStore(s => s.pdi);
  const hoistSlots = useGameStore(s => s.hoistSlots);
  const reworkRate = useGameStore(s => s.reworkRate);

  // Phase Change Detection for Transition Screen
  const prevPhaseRef = React.useRef(phase);
  useEffect(() => {
    if (prevPhaseRef.current === 'planning' && phase === 'action') {
      soundManager.playSFX('phase_change');
      setShowTransition(true);
    }
    prevPhaseRef.current = phase;
  }, [phase]);


  // 1. Hydrate Store from Server on Load
  const hydratedRef = React.useRef(false);
  const { saveGame, gameState, isLoading: isServerLoading } = useGame();
  console.log("[Game] Render. gameState present?", !!gameState, "hydrated?", hydratedRef.current);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  useEffect(() => {
    if (gameState && !hydratedRef.current) {
      console.log("[Game] Hydration Effect running...");
      if (useGameStore.getState().bypassHydration) {
        // User manually selected a chapter, ignore server state, clear flag, and overwrite save with fresh chapter state
        console.log("[Game] Bypassing hydration, trigger initial cloud save...");
        useGameStore.getState().setBypassHydration(false);
        setFlag('hydrated', true);
        hydratedRef.current = true;
        handleSave(true); // Save the freshly started chapter to cloud
      } else {
        // Normal resume from server
        console.log("[Game] Normal hydration from gameState", (gameState as any).id);
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
    // Prevent unauthorized access to Case Studies (Chapter 5 remains locked)
    if (chapter >= 5 && !flags['admin_unlocked']) {
      navigate('/chapters');
    }
  }, [flags, navigate, isServerLoading, gameState, isInitializing, chapter]);

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
      useGameStore.getState().completeChapter(2);
      await handleSave(true);
      navigate('/chapters');
    } catch (e: any) {
      console.error("Transition Error:", e);
    }
  };

  const handleChapter3Continue = async () => {
    try {
      useGameStore.getState().completeChapter(3);
      await handleSave(true);
      navigate('/chapters');
    } catch (e: any) {
      console.error("Transition Error:", e);
    }
  };

  const handleChapter4Continue = async () => {
    try {
      useGameStore.getState().completeChapter(4);
      await handleSave(true);
      navigate('/chapters');
    } catch (e: any) {
      console.error("Transition Error:", e);
    }
  };

  // Audio Control Loop
  const audioSettings = useGameStore(s => s.audioSettings);
  useEffect(() => {
    if (chapter === 3) {
      if (phase === 'planning') {
        soundManager.playBGM('planning', audioSettings.bgmVolume * 0.8);
      } else {
        soundManager.playBGM('depot', audioSettings.bgmVolume);
      }
    } else if (chapter === 4) {
      if (phase === 'planning') {
        soundManager.playBGM('planning', audioSettings.bgmVolume * 0.8);
      } else {
        soundManager.playBGM('logistics', audioSettings.bgmVolume);
      }
    } else if (chapter === 2 && phase === 'planning') {
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

  // Listeners for Case Studies Custom Events
  useEffect(() => {
    const onCaseEndDay = () => handleEndDay();
    const onCaseSaveGame = () => handleSave(false);
    const onCaseOpenSettings = () => {
      soundManager.playSFX('click', audioSettings.sfxVolume);
      setShowSettings(true);
    };

    window.addEventListener('case-end-day', onCaseEndDay);
    window.addEventListener('case-save-game', onCaseSaveGame);
    window.addEventListener('case-open-settings', onCaseOpenSettings);

    return () => {
      window.removeEventListener('case-end-day', onCaseEndDay);
      window.removeEventListener('case-save-game', onCaseSaveGame);
      window.removeEventListener('case-open-settings', onCaseOpenSettings);
    };
  }, [audioSettings.sfxVolume]);

  // Auth Integration
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const buildSavePayload = () => {
    const state = useGameStore.getState();
    return {
      sessionId: '',
      userId: user?.id,
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
        phase: state.phase,
        currentDialogue: state.currentDialogue,
        dialogueIndex: state.dialogueIndex,
        customTasks: state.customTasks,
        taskModeSelected: state.taskModeSelected,
        taskMode: state.taskMode,
        depotItems: state.depotItems,
        depotZones: state.depotZones,
        depotScore: state.depotScore,
        bullwhipIndex: state.bullwhipIndex,
        pullScore: state.pullScore,
        inventoryTurns: state.inventoryTurns,
        jitOnTimeDelivery: state.jitOnTimeDelivery,
        buffers: state.buffers,
        materialsInventory: state.materialsInventory,
        kanbanLimits: state.kanbanLimits,
        deliveries: state.deliveries,
        pullMetrics: state.pullMetrics,
        hoistSlots: state.hoistSlots,
        pdi: state.pdi,
        reworkRate: state.reworkRate,
        trafficImpact: state.trafficImpact,
        segmentBuffers: state.segmentBuffers,
      } as any,
      flags: state.flags,
      metrics: { ...state.lpi, ppcHistory: state.ppcHistory },
      weeklyPlan: state.weeklyPlan,
      completedChapters: state.unlockedChapters.filter(c => c !== 1).map(c => c - 1),
      unlockedBadges: state.unlockedBadges,
      badgeDates: state.badgeDates,
      lives: state.lives,
      playerGender: state.playerGender,
    };
  };

  const handleSave = async (silent = false) => {
    if (!user && !silent) {
      setShowAuthModal(true);
      return;
    }

    try {
      await saveGame.mutateAsync(buildSavePayload());
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

      if (chapter === 4) {
        if (day === 2 && !flags['ch4_d2_decision']) {
          setFlag('ch4_d2_decision', true);
          triggerChapter4Day2Decision();
        }
        if (day === 3 && !flags['ch4_d3_decision']) {
          setFlag('ch4_d3_decision', true);
          triggerChapter4Day3Decision();
        }
        if (day === 4 && !flags['ch4_d4_decision']) {
          setFlag('ch4_d4_decision', true);
          triggerChapter4Day4Decision();
        }
      }
    }
    prevDialogueRef.current = currentDialogue;
  }, [currentDialogue, day, flags, setFlag]);

  // Daily Event & Story Loader
  useEffect(() => {
    // Choose Schedule based on Chapter
    const currentSchedule = chapter === 1 ? WEEK_1_SCHEDULE :
      chapter === 2 ? WEEK_2_SCHEDULE :
        chapter === 3 ? CHAPTER_3_SCHEDULE :
          chapter === 4 ? CASE_1_SCHEDULE :
            CASE_2_SCHEDULE;
    // Check if we have config for this day
    const dayConfig = currentSchedule.find(d => d.day === day);
    const dayKey = `ch${chapter}_day_${day}_started`;

    // Only block dialogue for Chapter 5's case tutorial now
    const tutorialPending = chapter === 5 && !flags['case2_tutorial_seen'];

    if (dayConfig && !flags[dayKey] && flags['character_created'] && flags['chapter_intro_seen'] && !tutorialPending) {
      // 1. Play Dialogue
      let dialogue = dayConfig.dialogue;

      if (day === 5 && chapter === 1) {
        const pushed = flags['decision_push_made'];
        const branch = pushed ? DAY_5_BAD : DAY_5_GOOD;
        dialogue = [...dialogue, ...branch];

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

      // Chapter 3 Day 15: New Delivery
      if (day === 15 && chapter === 3) {
        setTimeout(() => {
          useGameStore.getState().applyDayEvent(15);
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

  useEffect(() => {
    if (chapter === 4 && phase === 'planning' && flags['chapter4_tutorial_seen'] && !currentDialogue) {
      useGameStore.setState({ phase: 'action' });
    }
  }, [chapter, phase, flags, currentDialogue]);

  // Bankruptcy Check
  useEffect(() => {
    if (funds < 0 && !flags.game_over) {
      useGameStore.setState({
        gameOverReason: "BANKRUPTCY: You ran out of funds! The project has been shut down. Tip: Keep the flow moving to generate revenue faster than the Daily Overhead expenses.",
        flags: { ...useGameStore.getState().flags, game_over: true }
      });
    }
  }, [funds, flags.game_over]);

  // Tutorial Logic
  useEffect(() => {
    // Step 1: User opens project sheet
    if (showProjectSheet && tutorialStep === 1) {
      setTutorialStep(1.2);
    }
    // Step 1.2: Closing Project Sheet goes to Kanban prompt
    if (!showProjectSheet && tutorialStep === 1.2) {
      setTutorialStep(1.5);
    }
    // Step 1.5 -> 2 (Open Kanban)
    if (showKanban && (tutorialStep === 1 || tutorialStep === 1.5)) {
      setTutorialStep(2);
    }
    // Step 6: Close Kanban to show Advisor Spotlight (after WIP slider step)
    if (tutorialStep === 6 && showKanban) {
      setShowKanban(false);
    }
  }, [showKanban, showProjectSheet, tutorialStep, setTutorialStep]);

  const triggerRetryDecision = () => {
    setDecisionProps({
      title: "Inspection Failed",
      prompt: "The Inspector flagged the project for 'Excessive Waste' due to your Push decision. Relying on false demand has put the project at risk.",
      options: [
        { id: 'retry', text: "Replay Day 4 (Fix Mistake)", type: 'safe', description: "Go back in time. Choose 'Pull' this time." },
        { id: 'accept', text: "Accept Consequences", type: 'risky', description: "Funding stops. Project fails. (GAME OVER)" }
      ],
      onSelect: async (id: string) => {
        if (id === 'retry') {
          useGameStore.setState(s => ({
            day: 4,
            flags: { ...s.flags, decision_push_made: false, decision_push_seen: false, decision_retry_seen: false, [`day_4_started`]: false, [`day_5_started`]: false },
            columns: s.columns.map(c =>
              c.id === 'doing' ? { ...c, tasks: [] } : c
            )
          }));
          setShowDecision(false);
        } else {
          setShowDecision(false);
          useGameStore.setState({
            gameOverReason: "The funding was pulled due to poor management and excessive waste. The project has been cancelled.",
            flags: { ...useGameStore.getState().flags, game_over: true }
          });
        }
      }
    });
    setShowDecision(true);
  };


  const triggerCase1Day2Decision = () => {
    setDecisionProps({
      title: "Broken Elevator (Vertical Limits)",
      prompt: "One of the freight elevators' winch motors has burnt out, halving vertical capacity. Trucks are waiting downstairs.",
      options: [
        { id: 'pay', text: "Emergency Fix (₹2k)", type: 'safe', description: "Pay expedited fee. Restores capacity immediately." },
        { id: 'reroute', text: "Reroute Schedule (Risky)", type: 'risky', description: "Save money, but increase passenger disruption by 5%." }
      ],
      onSelect: (id: string) => {
        if (id === 'pay') {
          useGameStore.setState(s => ({ funds: Math.max(0, s.funds - 2000) }));
          soundManager.playSFX('success');
        } else {
          useGameStore.setState(s => ({ pdi: Math.min(100, s.pdi + 5), hoistSlots: Math.max(1, s.hoistSlots - 1) }));
          soundManager.playSFX('click');
        }
        setShowDecision(false);
      }
    });
    setShowDecision(true);
  };

  const triggerCase1Day4Decision = () => {
    setDecisionProps({
      title: "Security Sweep",
      prompt: "TSA is performing an unannounced audit of all access logs. Workers are stuck at the sterile boundary.",
      options: [
        { id: 'expedite', text: "Hire Expediter (₹1k)", type: 'risky', description: "Pay administrative fee to fast-track our crews." },
        { id: 'wait', text: "Accept Delay (Safe)", type: 'safe', description: "Focus only on WIP tasks inside. Lose 1 hoist slot today." }
      ],
      onSelect: (id: string) => {
        if (id === 'expedite') {
          useGameStore.setState(s => ({ funds: Math.max(0, s.funds - 1000) }));
          soundManager.playSFX('click');
        } else {
          useGameStore.setState(s => ({ hoistSlots: Math.max(1, s.hoistSlots - 1) }));
          soundManager.playSFX('success');
        }
        setShowDecision(false);
      }
    });
    setShowDecision(true);
  };

  const triggerCase1Day6Decision = () => {
    setDecisionProps({
      title: "Supplier Mix-up",
      prompt: "The HVAC supplier sent round duct fittings instead of rectangular ones. The crew is already hanging them!",
      options: [
        { id: 'rework', text: "Tear Down (₹1.5k)", type: 'safe', description: "Stop the line and fix it now. Reduces rework rate by 5%." },
        { id: 'patch', text: "Patch it Later", type: 'risky', description: "Keep hanging them. Adds 10% to Rework Rate risk." }
      ],
      onSelect: (id: string) => {
        if (id === 'rework') {
          useGameStore.setState(s => ({ funds: Math.max(0, s.funds - 1500), reworkRate: Math.max(0, s.reworkRate - 5) }));
          soundManager.playSFX('success');
        } else {
          useGameStore.setState(s => ({ reworkRate: Math.min(100, s.reworkRate + 10) }));
          soundManager.playSFX('click');
        }
        setShowDecision(false);
      }
    });
    setShowDecision(true);
  };

  const triggerCase1Day9Decision = () => {
    setDecisionProps({
      title: "The VIP Surge",
      prompt: "A massive conference hit town. Operations demands absolute silence in the terminal for the next 24 hours.",
      options: [
        { id: 'halt', text: "Halt All Noisy Work", type: 'safe', description: "Lose 1 Hoist Slot, protect PDI." },
        { id: 'push', text: "Ignore Operations", type: 'risky', description: "Keep working at full speed. +15% PDI penalty." }
      ],
      onSelect: (id: string) => {
        if (id === 'halt') {
          useGameStore.setState(s => ({ hoistSlots: Math.max(1, s.hoistSlots - 1) }));
          soundManager.playSFX('click');
        } else {
          useGameStore.setState(s => ({ pdi: Math.min(100, s.pdi + 15) }));
          soundManager.playSFX('click');
        }
        setShowDecision(false);
      }
    });
    setShowDecision(true);
  };

  const triggerCase1Day11Decision = () => {
    setDecisionProps({
      title: "Power Emergency",
      prompt: "The temporary breaker panel blew, cutting power to the East side. We need an immediate workaround.",
      options: [
        { id: 'gen', text: "Rent Generator (₹3k)", type: 'safe', description: "Keep power flowing, lose cash." },
        { id: 'manual', text: "Manual Labour", type: 'risky', description: "Free, but exhausts the crew. +5% Rework Risk." }
      ],
      onSelect: (id: string) => {
        if (id === 'gen') {
          useGameStore.setState(s => ({ funds: Math.max(0, s.funds - 3000) }));
          soundManager.playSFX('success');
        } else {
          useGameStore.setState(s => ({ reworkRate: Math.min(100, s.reworkRate + 5) }));
          soundManager.playSFX('alert');
        }
        setShowDecision(false);
      }
    });
    setShowDecision(true);
  };


  const triggerPushDecision = () => {
    setDecisionProps({
      title: "Rajiv's Ultimatum",
      prompt: "Rajiv is furious about the client visit. He wants to push unready tasks to 'Doing' to look busy. This violates WIP limits.",
      options: [
        { id: 'push', text: "Allow Push (Risky)", type: 'risky', description: "Morale drops, but Rajiv is happy. Generates Waste." },
        { id: 'pull', text: "Enforce Pull (Safe)", type: 'safe', description: "Rajiv is angry, but Flow remains stable." }
      ],
      onSelect: (id: string) => {
        if (id === 'push') {
          useGameStore.getState().addLog("Decision: Pushed work. Created Waste.");
          useGameStore.getState().addLog("NEXT STEP: A 'REWORK' task was added. Finish it IMMEDIATELY to clear the waste!");
          loseLife("Allowing 'Push' creation of unready work caused a system failure and rework loop.");
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
          loseLife("Overcommitting to unplanned client requests destabilized the production flow.");
          setFlag('overcommitment_accepted', true);
          const state = useGameStore.getState();
          const extraTaskId = `extra-${Date.now()}`;
          useGameStore.setState({
            weeklyPlan: [...state.weeklyPlan, extraTaskId],
            columns: state.columns.map(col =>
              col.id === 'backlog' ? {
                ...col,
                tasks: [...col.tasks, {
                  id: extraTaskId,
                  title: 'Cafe Roofing (Rush)',
                  description: 'Unplanned work added at client request.',
                  type: 'Structural' as const,
                  cost: 100,
                  reward: 2000,
                  status: 'backlog' as const,
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

  const triggerChapter4Day2Decision = () => {
    setDecisionProps({
      title: "VIP Demand Spike",
      prompt: "The client wants the VIP lounge finished early. Finish materials demand is doubling for the next 48 hours.",
      options: [
        { id: 'limit', text: "Rush Setup (₹500)", type: 'safe', description: "Increase Carpentry & Finishing limits. Faster flow, small cost." },
        { id: 'expedite', text: "Expedite Log (₹1k)", type: 'risky', description: "Order immediate delivery of extra materials. High cost, prevents stockout." },
        { id: 'nothing', text: "Hold the Line", type: 'risky', description: "Risk running out of materials. Zero cost today." }
      ],
      onSelect: (id: string) => {
        const state = useGameStore.getState();
        if (id === 'limit') {
          useGameStore.setState(s => ({
            funds: Math.max(0, s.funds - 500),
            kanbanLimits: { ...s.kanbanLimits, 'carpentry': (s.kanbanLimits['carpentry'] || 4) + 2, 'finish': (s.kanbanLimits['finish'] || 4) + 2 }
          }));
          soundManager.playSFX('success');
        } else if (id === 'expedite') {
          state.orderMaterial('timber', 50, state.day + 1);
          useGameStore.setState(s => ({ funds: Math.max(0, s.funds - 1000) }));
          soundManager.playSFX('success');
        } else {
          soundManager.playSFX('click');
        }
        setShowDecision(false);
      }
    });
    setShowDecision(true);
  };

  const triggerChapter4Day3Decision = () => {
    setDecisionProps({
      title: "Bullwhip Warning",
      prompt: "Local demand spiked. Mira warns that over-ordering now will cause a 'Bullwhip' chaos for suppliers. What's your strategy?",
      options: [
        { id: 'smooth', text: "Demand Smoothing", type: 'safe', description: "Order slightly less than max demand. Stabilizes supply chain. (+10 Pull Score)" },
        { id: 'panic', text: "Safety Surge", type: 'risky', description: "Order 3x expected demand. Prevents stockout, but increases Bullwhip Index." }
      ],
      onSelect: (id: string) => {
        const state = useGameStore.getState();
        if (id === 'smooth') {
          useGameStore.setState(s => ({ pullScore: s.pullScore + 10 }));
          state.orderMaterial('pipes', 20, state.day + 2);
          soundManager.playSFX('success');
        } else {
          useGameStore.setState(s => ({ bullwhipIndex: s.bullwhipIndex + 25 }));
          state.orderMaterial('pipes', 80, state.day + 1);
          soundManager.playSFX('alert');
        }
        setShowDecision(false);
      }
    });
    setShowDecision(true);
  };

  const triggerChapter4Day4Decision = () => {
    setDecisionProps({
      title: "Truck Breakdown",
      prompt: "A major delivery is stuck on the highway. 24-hour delay. Your JIT system is at breaking point!",
      options: [
        { id: 'buffer', text: "Rely on Buffer", type: 'safe', description: "Use existing safety stock. Zero cost if you planned well." },
        { id: 'sub', text: "Emergency Courier (₹2k)", type: 'risky', description: "Expensive same-day delivery. Guaranteed materials." }
      ],
      onSelect: (id: string) => {
        if (id === 'sub') {
          useGameStore.setState(s => ({
            funds: Math.max(0, s.funds - 2000),
            materialsInventory: {
              ...s.materialsInventory,
              electrical: (s.materialsInventory['electrical'] || 0) + 30
            }
          }));
          soundManager.playSFX('success');
        } else {
          soundManager.playSFX('click');
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

    if (currentDay > 5 && chapter === 4) {
      setShowQuiz(true);
      return;
    }

    if (currentDay > 14 && chapter === 5) {
      setShowChapterComplete(true);
      return;
    }

    if (chapter === 2 && currentDay >= 6 && currentDay <= 9) {
      return;
    }

    if (chapter === 3 && currentDay >= 12 && currentDay <= 16) {
      return;
    }

    if (chapter === 4) {
      useGameStore.getState().receiveDeliveries(currentDay);
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
    const backlog = cols.find(c => c.id === 'backlog');
    const doingCount = doing?.tasks.length || 0;
    const backlogCount = backlog?.tasks.length || 0;
    const readyCount = 0; // Deprecated
    const doingLimit = doing?.wipLimit || 3;

    // Define helper variables early for use in checks
    const allPending = [...(backlog?.tasks || [])];
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
          const lookaheadCount = backlog?.tasks.length || 0;
          if (lookaheadCount < 3) return "Day 6: Review 4-6 tasks in the Master Schedule. You cannot fix constraints yet - just see what's available.";
          if (lookaheadCount < 6) return "Good start! Constraints are hidden today - you'll discover them tomorrow.";
          return "Schedule is filling up! End Day when you're ready.";
        }
        return "Planning Room is open. Review your Master Schedule and Lookahead.";
      }
      if (day === 7) {
        if (isPlanning) {
          const blockedTasks = backlog?.tasks.filter(t => (t.constraints?.length || 0) > 0) || [];
          const allInspected = blockedTasks.every(t => state.flags[`inspected_${t.id}`]);
          if (blockedTasks.length > 0 && !allInspected) return "Day 7: Click each RED task in Backlog to DISCOVER its constraints. You must inspect all blocked tasks before moving on.";
          if (allInspected) return "All constraints discovered! You now understand what's blocking your tasks. End Day to start fixing them tomorrow.";
          return "No blocked tasks found. You can End Day and move to the Make Ready phase.";
        }
        return "Constraint Discovery: Find all the blockers before trying to fix them.";
      }
      if (day === 8) {
        if (isPlanning) {
          const greenCount = backlog?.tasks.filter(t => (t.constraints?.length || 0) === 0).length || 0;
          const totalInLookahead = backlog?.tasks.length || 0;
          if (greenCount < 2) return "Day 8: Make Ready! Click 'Fix' on constraints to turn RED tasks GREEN. Each fix costs budget or morale - choose wisely!";
          if (greenCount < totalInLookahead) return `${greenCount}/${totalInLookahead} tasks are Sound. Keep fixing constraints. You can also End Day.`;
          return "All tasks are Sound! You're ready for tomorrow's commitment. End Day.";
        }
        return "Make Ready: Remove blockers so tasks can flow.";
      }
      if (day === 9) {
        if (isPlanning) {
          const greenCount = backlog?.tasks.filter(t => (t.constraints?.length || 0) === 0).length || 0;
          if (greenCount === 0) return "Day 9: You need GREEN tasks to commit! Fix remaining constraints or choose easier tasks.";
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
      const depotItems = state.depotItems || [];
      const depotZones = state.depotZones || [];
      let isComplete = false;

      if (day === 12) {
        const allTrash = depotItems.filter(i => i.type === 'trash' || i.isBroken);
        const sortedTrash = allTrash.filter(i => i.currentZoneId === 'zone-trash');
        isComplete = allTrash.length > 0 && sortedTrash.length === allTrash.length;
        if (isComplete) return "Sort complete. All waste isolated. Click 'End Day'.";
        return "Day 12: Sort (Seiri). Throw away broken tools and unnecessary trash into the Red Tag bin.";
      }
      if (day === 13) {
        const allUseful = depotItems.filter(i => (i.type === 'tool' || i.type === 'material') && !i.isBroken);
        const sortedUseful = allUseful.filter(i => {
          const zone = depotZones.find(z => z.id === i.currentZoneId);
          return zone && zone.acceptsType === i.type;
        });
        isComplete = allUseful.length > 0 && sortedUseful.length === allUseful.length;
        if (isComplete) return "Set in Order complete. Items assigned. Click 'End Day'.";
        return "Day 13: Set in Order (Seiton). Give every remaining item a home in the correct zone.";
      }
      if (day === 14) {
        const hazardsRemaining = depotItems.filter(i => i.type === 'hazard').length;
        isComplete = hazardsRemaining === 0;
        if (isComplete) return "Shine complete. All hazards cleaned. Click 'End Day'.";
        return "Day 14: Shine (Seiso). Click the hazard icons on the floor to clean spills and remove trip risks.";
      }
      if (day === 15) {
        let correct = 0;
        let total = depotItems.filter(i => i.type !== 'hazard').length;
        depotItems.forEach(item => {
          const zone = depotZones.find(z => z.id === item.currentZoneId);
          if (zone && zone.acceptsType === (item.isBroken ? 'trash' : item.type)) correct++;
        });
        const hazLeft = depotItems.filter(i => i.type === 'hazard').length;
        isComplete = total > 0 && correct === total && hazLeft === 0;
        if (isComplete) return "Standardization maintained. Click 'End Day'.";
        return "Day 15: Standardize (Seiketsu). A new delivery arrived! Sort the waste, clean leaks, and set items in order immediately.";
      }
      if (day === 16) {
        let correct = 0;
        let total = depotItems.filter(i => i.type !== 'hazard').length;
        depotItems.forEach(item => {
          const zone = depotZones.find(z => z.id === item.currentZoneId);
          if (zone && zone.acceptsType === (item.isBroken ? 'trash' : item.type)) correct++;
        });
        const hazLeft = depotItems.filter(i => i.type === 'hazard').length;
        isComplete = total > 0 && correct === total && hazLeft === 0;
        if (isComplete) return "Audit ready. Click 'Finish Chapter'.";
        return "Day 16: Sustain (Shitsuke). The Inspector is auditing. Ensure no items are out of standard.";
      }
    }

    // CASE STUDY 1 (CHAPTER 4) SPECIFIC GUIDANCE
    if (chapter === 4) {
      if (day === 1) return "Day 1: Intro to Pull. Set Kanban limits for trades and order your first JIT delivery in the Scheduler.";

      const lowInventory = Object.entries(state.materialsInventory).find(([_, qty]) => (qty as number) < 10);
      if (lowInventory) return `Warning: ${lowInventory[0]} stock is LOW! Open Scheduler and order a JIT delivery immediately.`;

      const pendingDeliveries = state.deliveries.length;
      if (pendingDeliveries === 0 && day < 5) return "Your site is running! Keep monitoring inventory and schedule deliveries to arrive just before stockouts.";

      return "Flow is steady. Monitor the Bullwhip Index – try not to over-order when demand fluctuates.";
    }

    // CASE STUDY 2 (CHAPTER 5) SPECIFIC GUIDANCE
    if (chapter === 5) {
      const currentDayConfig = CASE_2_SCHEDULE.find(d => d.day === day);
      if (currentDayConfig?.briefing) {
        return `[Coastal Link]: ${currentDayConfig.briefing.action}`;
      }
      return "Balance the buffers and minimize traffic impact.";
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
      const hasStructuralReady = backlog?.tasks.some(t => t.type === 'Structural');
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
          return "Flow Protected. Rajiv is annoyed, but the site is stable. Click 'End Day'.";
        }
        return "Good Choice! Now, ONLY pull work if you have space. Don't let Rajiv pressure you.";
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
        return "DISCIPLINE: Rajiv wants to push. Wait for the key decision.";
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
    try {
      await saveGame.mutateAsync(buildSavePayload());
      toast({ title: "Game Saved!", description: user ? "Progress synced to cloud." : "Progress saved locally." });
    } catch (err) {
      console.error("Save failed on exit:", err);
      toast({ title: "Progress Saved Locally", description: "Cloud sync unavailable. Your progress is safe on this device.", variant: "destructive" });
    }
    navigate('/');
  };
  if (isServerLoading || isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div 
      className={`w-full h-screen relative overflow-hidden transition-colors duration-1000 bg-slate-950/60`}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowLeanAI(true);
      }}
    >
      {/* 1. Phaser Layer (Background) */}
      <GameCanvas />

      {/* 2. UI Overlay Layer (HUD, Dialogues, Windows) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">

        {/* Top Bar: Resources & Stats */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`flex flex-col md:flex-row justify-between items-start pointer-events-auto gap-4 w-full md:w-auto ${chapter >= 4 ? 'hidden' : ''}`}
        >
          <div className="flex gap-4 w-full md:w-auto">
            <div id="smart-advisor-box" className="bg-slate-900/95 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.15)] border-2 border-cyan-500/40 w-full md:min-w-[350px] md:w-auto flex-1 transform transition-transform animate-pulse-slow">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-white text-base md:text-lg tracking-wider">CORE OBJECTIVE</h3>
                <span className="text-xs font-bold text-slate-400 ml-auto">Week {week} | Month {day}</span>
              </div>
              <div className="text-sm md:text-base text-cyan-300 font-bold mt-2 leading-snug drop-shadow-md bg-cyan-950/50 p-2 rounded-lg border border-cyan-900/50">
                {getSmartObjective()}
              </div>
            </div>

            <button
              onClick={handleEndDay}
              data-testid="button-end-day"
              className={`${((day === 5 && chapter === 1) || (day === 11 && chapter === 2) || (day === 16 && chapter === 3) || (day === 5 && chapter === 4) || (day === 14 && chapter === 5)) ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-b-4 border-amber-700 ring-2 ring-amber-300/50' : 'bg-cyan-600 hover:bg-cyan-500 border-b-4 border-cyan-800'} text-white font-bold px-3 py-2 md:px-4 rounded-xl shadow-md transition-colors h-fit self-center text-sm md:text-base whitespace-nowrap ${getSmartObjective().includes('End Day') || getSmartObjective().includes('Finish Chapter') || getSmartObjective().includes('Project Complete') ? 'animate-bounce ring-4 ring-amber-400/50' : ''}`}
            >
              {(((day === 5 && chapter === 1) || (day === 11 && chapter === 2) || (day === 16 && chapter === 3) || (day === 5 && chapter === 4) || (day === 14 && chapter === 5))) ? 'Finish Chapter' : 'End Day'}
            </button>
          </div>

          <div id="stats-box" className="bg-slate-800/80 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-md border border-slate-700/50 flex gap-4 md:gap-6 w-full md:w-auto justify-around">
            <div className="text-center">
              <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Funds</div>
              <div className="font-mono font-bold text-emerald-400 text-sm md:text-base">₹{funds}</div>
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
          className={`flex justify-center pointer-events-auto pb-2 sm:pb-4 ${chapter >= 4 ? 'hidden' : ''}`}
        >
          {/* Stats Bar */}
          <div className="flex items-center gap-3 sm:gap-6 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 py-3 rounded-2xl border border-white/5 shadow-2xl">
            <div id="lives-box">
              <LifeHearts />
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
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
                onClick={() => setShowGlossary(true)}
                className="flex flex-col items-center gap-0.5 sm:gap-1 group"
                data-testid="button-glossary"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors border border-emerald-500/30">
                  <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-xs font-bold text-slate-400">Glossary</span>
              </button>
              <button
                id="btn-project-sheet"
                onClick={() => setShowProjectSheet(true)}
                className="flex flex-col items-center gap-0.5 sm:gap-1 group"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors border border-blue-500/30">
                  <ClipboardList className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-xs font-bold text-slate-400">Project</span>
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
          {showKanban && chapter !== 3 && chapter < 4 && <KanbanBoard onClose={() => setShowKanban(false)} />}
          {showKanban && chapter === 3 && <WorkspaceDepot onClose={() => setShowKanban(false)} />}
        </AnimatePresence>

        {chapter === 4 && (
          <div className="absolute inset-0 pointer-events-auto bg-slate-950/90 z-20 backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/95 border-b border-slate-700/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
                  <Plane className="w-4 h-4 text-cyan-400" />
                  <span className="font-black text-white text-sm">Day {day}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">/ 5</span>
                </div>
                <div className="hidden sm:block bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1.5">Funds</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">${funds.toLocaleString()}</span>
                </div>
                <div className="hidden sm:block bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1.5">PDI</span>
                  <span className={`font-mono font-bold text-sm ${pdi > 40 ? 'text-red-400' : pdi > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>{pdi}%</span>
                </div>
                <div className="hidden md:block bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
                  <ArrowUpDown className="w-3 h-3 text-indigo-400 inline mr-1" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Hoists</span>
                  <span className="font-mono font-bold text-indigo-300 text-sm">{hoistSlots}</span>
                </div>
                {reworkRate > 0 && (
                  <div className="hidden md:flex items-center gap-1 bg-red-900/30 px-3 py-1.5 rounded-xl border border-red-700/50">
                    <Wrench className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] text-red-400 font-bold">{reworkRate}% Rework</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right mr-2 max-w-[200px]">
                  <div className="text-[10px] text-cyan-400 font-bold leading-tight truncate">{getSmartObjective()}</div>
                </div>
                <button
                  onClick={() => handleSave()}
                  disabled={saveGame.isPending}
                  className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 p-1.5 rounded-lg shadow-sm transition-all active:scale-95"
                  title="Save Game"
                  data-testid="button-save-ch4"
                >
                  {saveGame.isPending ? (
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-slate-300" />
                  )}
                </button>
                <button
                  onClick={() => {
                    soundManager.playSFX('click', audioSettings.sfxVolume);
                    setShowSettings(true);
                  }}
                  className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 p-1.5 rounded-lg shadow-sm transition-all active:scale-95"
                  title="Settings"
                  data-testid="button-settings-ch4"
                >
                  <Settings className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={handleEndDay}
                  data-testid="button-end-day-ch4"
                  className={`${day === 5 ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 ring-2 ring-amber-300/50' : 'bg-cyan-600 hover:bg-cyan-500'} text-white font-bold px-4 py-1.5 rounded-xl shadow-md transition-colors text-sm whitespace-nowrap`}
                >
                  {day === 5 ? 'Finish Chapter' : 'End Day'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <PullSystemDashboard />
            </div>
          </div>
        )}
        {chapter === 5 && <div className="absolute inset-0 pointer-events-auto bg-slate-950 z-20"><CoastalView objective={getSmartObjective()} /></div>}

        <DailySummary
          isOpen={showSummary}
          onClose={handleNextDayStart}
          completedTasks={completedToday}
        />
      </div>

      <GlossaryPanel isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
      <ProjectStatusSheet isOpen={showProjectSheet} onClose={() => setShowProjectSheet(false)} />
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
      {chapter < 4 && flags['character_created'] && !flags['character_cast_seen'] && (
        <CharacterCastModal
          chapter={chapter}
          onContinue={() => setFlag('character_cast_seen', true)}
        />
      )}
      {chapter < 4 && flags['character_cast_seen'] && !flags['chapter_intro_seen'] && <ChapterIntroModal />}
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
      {showChapterComplete && chapter === 4 && (
        <Chapter4CompleteModal
          isOpen={true}
          onClose={() => setShowChapterComplete(false)}
          onContinue={handleChapter4Continue}
          quizScore={quizScore}
        />
      )}
      {/* Game Over Overlay */}
      {flags.game_over && (
        <GameOverOverlay
          reason={gameOverReason || "The project has been cancelled due to excessive waste."}
          chapter={chapter}
        />
      )}
      {/* Task Mode Selector — shown once at start of a Kanban chapter (1 or 2) */}
      <TaskModeSelector
        isOpen={chapter < 3 && ((chapter === 1 && day === 1) || (chapter === 2 && day === 6)) && !taskModeSelected && !flags.game_over}
        onSelect={(mode) => {
          useGameStore.getState().setTaskMode(mode);
          setTaskModeSelected(true);
        }}
      />


    </div>
  );
}
