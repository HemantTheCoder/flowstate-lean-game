import { create } from 'zustand';
import { GameState } from '@shared/schema';

// This store manages optimistic UI state before syncing to backend
// It's useful for instant interactions like dragging cards or clicking dialog options

interface GameStore {
  // UI State
  view: 'visual-novel' | 'management' | 'report' | 'minigame';
  currentDialogueId: string | null;
  isPaused: boolean;
  
  // Actions
  setView: (view: 'visual-novel' | 'management' | 'report' | 'minigame') => void;
  setDialogue: (id: string | null) => void;
  togglePause: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  view: 'visual-novel', // Start with story
  currentDialogueId: 'intro-1',
  isPaused: false,
  
  setView: (view) => set({ view }),
  setDialogue: (id) => set({ currentDialogueId: id }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
}));
