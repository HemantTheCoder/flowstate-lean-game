// import { db } from "./db"; // DB Disabled for Local Mode
import { gameStates, type GameState, type InsertGameState } from "@shared/schema";
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
      const created: GameState = { ...gameState, id, lastPlayed: new Date() } as any;
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
