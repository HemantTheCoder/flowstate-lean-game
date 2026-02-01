import { db } from "./db";
import { gameStates, type GameState, type InsertGameState } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getGameState(sessionId: string): Promise<GameState | undefined>;
  createOrUpdateGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(sessionId: string, updates: Partial<InsertGameState>): Promise<GameState>;
  deleteGameState(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getGameState(sessionId: string): Promise<GameState | undefined> {
    const [state] = await db.select().from(gameStates).where(eq(gameStates.sessionId, sessionId));
    return state;
  }

  async createOrUpdateGameState(gameState: InsertGameState): Promise<GameState> {
    // Check if exists first to handle "save" logic cleanly
    const existing = await this.getGameState(gameState.sessionId);
    
    if (existing) {
      const [updated] = await db.update(gameStates)
        .set({ ...gameState, lastPlayed: new Date() })
        .where(eq(gameStates.sessionId, gameState.sessionId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(gameStates)
        .values(gameState)
        .returning();
      return created;
    }
  }

  async updateGameState(sessionId: string, updates: Partial<InsertGameState>): Promise<GameState> {
    const [updated] = await db.update(gameStates)
      .set({ ...updates, lastPlayed: new Date() })
      .where(eq(gameStates.sessionId, sessionId))
      .returning();
    
    if (!updated) throw new Error("Game state not found");
    return updated;
  }

  async deleteGameState(sessionId: string): Promise<void> {
    await db.delete(gameStates).where(eq(gameStates.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
