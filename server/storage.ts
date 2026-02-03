// import { db } from "./db"; // DB Disabled for Local Mode
import { gameStates, type GameState, type InsertGameState, GAME_CONSTANTS } from "@shared/schema";
// import { eq } from "drizzle-orm"; // DB Disabled

export interface IStorage {
  getGameState(sessionId: string): Promise<GameState | undefined>;
  createOrUpdateGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(sessionId: string, updates: Partial<InsertGameState>): Promise<GameState>;
  deleteGameState(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private states: Map<string, GameState>;
  private currentId: number;

  constructor() {
    this.states = new Map();
    this.currentId = 1;
  }

  async getGameState(sessionId: string): Promise<GameState | undefined> {
    return this.states.get(sessionId);
  }

  async createOrUpdateGameState(gameState: InsertGameState): Promise<GameState> {
    const existing = this.states.get(gameState.sessionId);
    if (existing) {
      const updated = { ...existing, ...gameState, lastPlayed: new Date() };
      this.states.set(gameState.sessionId, updated);
      return updated;
    } else {
      const id = this.currentId++;
      const created: GameState = {
        ...gameState,
        id,
        lastPlayed: new Date(),
        playerName: gameState.playerName ?? "Architect",
        chapter: gameState.chapter ?? 1,
        week: gameState.week ?? 1,
        resources: (gameState.resources as any) ?? GAME_CONSTANTS.INITIAL_RESOURCES,
        kanbanState: gameState.kanbanState ?? null,
        flags: gameState.flags ?? null,
        metrics: gameState.metrics ?? null,
        completedChapters: gameState.completedChapters ?? null,
        unlockedBadges: gameState.unlockedBadges ?? null,
        weeklyPlan: gameState.weeklyPlan ?? null,
      };
      this.states.set(gameState.sessionId, created);
      return created;
    }
  }

  async updateGameState(sessionId: string, updates: Partial<InsertGameState>): Promise<GameState> {
    const existing = this.states.get(sessionId);
    if (!existing) throw new Error("Game state not found");

    const updated = { ...existing, ...updates, lastPlayed: new Date() };
    this.states.set(sessionId, updated);
    return updated;
  }

  async deleteGameState(sessionId: string): Promise<void> {
    this.states.delete(sessionId);
  }
}

export const storage = new MemStorage();
