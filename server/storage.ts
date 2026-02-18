import { db } from "./db";
import { gameStates, users, type GameState, type InsertGameState, type LeaderboardEntry, type InsertLeaderboardEntry, GAME_CONSTANTS, leaderboardEntries, type User, type InsertUser, type UserProfile } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getGameState(sessionId: string): Promise<GameState | undefined>;
  getUserGameState(userId: number): Promise<GameState | undefined>;
  createOrUpdateGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(sessionId: string, updates: Partial<InsertGameState>): Promise<GameState>;
  deleteGameState(sessionId: string): Promise<void>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getLeaderboardByChapter(chapter: number): Promise<LeaderboardEntry[]>;
  addLeaderboardEntry(entry: InsertLeaderboardEntry, userId?: number): Promise<LeaderboardEntry>;
  clearLeaderboard(): Promise<void>;
  getUserProfile(userId: number): Promise<UserProfile>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getGameState(sessionId: string): Promise<GameState | undefined> {
    const [state] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.sessionId, sessionId));
    return state;
  }

  async getUserGameState(userId: number): Promise<GameState | undefined> {
    const [state] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.userId, userId));
    return state; // One save per user for now
  }

  async createOrUpdateGameState(gameState: InsertGameState): Promise<GameState> {
    // Try to find by sessionId OR userId if provided
    let existing: GameState | undefined;

    if (gameState.userId) {
      [existing] = await db
        .select()
        .from(gameStates)
        .where(eq(gameStates.userId, gameState.userId));
    } else {
      [existing] = await db
        .select()
        .from(gameStates)
        .where(eq(gameStates.sessionId, gameState.sessionId));
    }

    if (existing) {
      const [updated] = await db
        .update(gameStates)
        .set({ ...gameState, lastPlayed: new Date() })
        .where(eq(gameStates.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(gameStates)
      .values({
        ...gameState,
        lastPlayed: new Date(),
        playerName: gameState.playerName ?? "Architect",
        chapter: gameState.chapter ?? 1,
        day: gameState.day ?? 1,
        week: gameState.week ?? 1,
        resources: (gameState.resources as any) ?? GAME_CONSTANTS.INITIAL_RESOURCES,
      })
      .returning();
    return created;
  }

  async updateGameState(sessionId: string, updates: Partial<InsertGameState>): Promise<GameState> {
    // Note: This method specifically updates by SESSION ID. 
    // If we want to support user updates here, we might need a different method or check if sessionId is null.
    // For now, logged in users will use createOrUpdateGameState mostly.
    const [updated] = await db
      .update(gameStates)
      .set({ ...updates, lastPlayed: new Date() })
      .where(eq(gameStates.sessionId, sessionId))
      .returning();

    if (!updated) throw new Error("Game state not found");
    return updated;
  }

  async deleteGameState(sessionId: string): Promise<void> {
    await db.delete(gameStates).where(eq(gameStates.sessionId, sessionId));
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return await db
      .select()
      .from(leaderboardEntries)
      .orderBy(desc(leaderboardEntries.totalScore));
  }

  async getLeaderboardByChapter(chapter: number): Promise<LeaderboardEntry[]> {
    return await db
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.chapter, chapter))
      .orderBy(desc(leaderboardEntries.totalScore));
  }

  async addLeaderboardEntry(entry: InsertLeaderboardEntry, userId?: number): Promise<LeaderboardEntry> {
    const [newEntry] = await db
      .insert(leaderboardEntries)
      .values({ ...entry, userId })
      .returning();
    return newEntry;
  }

  async clearLeaderboard(): Promise<void> {
    await db.delete(leaderboardEntries);
  }

  async getUserProfile(userId: number): Promise<UserProfile> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    const [gameState] = await db.select().from(gameStates).where(eq(gameStates.userId, userId));

    const scores = await db
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.userId, userId))
      .orderBy(desc(leaderboardEntries.totalScore));

    return { user, gameState, scores };
  }
}

export class MemStorage implements IStorage {
  private states: Map<string, GameState>;
  private users: Map<number, User>;
  private currentId: number;
  private currentUserId: number;
  private leaderboard: LeaderboardEntry[];
  private leaderboardId: number;

  constructor() {
    this.states = new Map();
    this.users = new Map();
    this.currentId = 1;
    this.currentUserId = 1;
    this.leaderboard = [];
    this.leaderboardId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, role: insertUser.role ?? "user", createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getGameState(sessionId: string): Promise<GameState | undefined> {
    return this.states.get(sessionId);
  }

  async getUserGameState(userId: number): Promise<GameState | undefined> {
    return Array.from(this.states.values()).find(s => s.userId === userId);
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
        userId: gameState.userId ?? null, // Fix typings
        lastPlayed: new Date(),
        playerName: gameState.playerName ?? "Architect",
        chapter: gameState.chapter ?? 1,
        day: gameState.day ?? 1,
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

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.leaderboard.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }

  async getLeaderboardByChapter(chapter: number): Promise<LeaderboardEntry[]> {
    return this.leaderboard
      .filter(entry => entry.chapter === chapter)
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }

  async addLeaderboardEntry(entry: InsertLeaderboardEntry, userId?: number): Promise<LeaderboardEntry> {
    const id = this.leaderboardId++;
    const newEntry: LeaderboardEntry = {
      ...entry,
      id,
      userId: userId || null,
      efficiency: entry.efficiency ?? 0,
      ppc: entry.ppc ?? 0,
      quizScore: entry.quizScore ?? 0,
      totalScore: entry.totalScore ?? 0,
      completedAt: new Date(),
    };
    this.leaderboard.push(newEntry);
    return newEntry;
  }

  async clearLeaderboard(): Promise<void> {
    this.leaderboard = [];
  }

  async getUserProfile(userId: number): Promise<UserProfile> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const gameState = await this.getUserGameState(userId);
    // Filter leaderboard by user (mock implementation needs userId on entries)
    const scores = this.leaderboard.filter(l => l.userId === userId);
    return { user, gameState, scores };
  }
}

export const storage = new DatabaseStorage();
