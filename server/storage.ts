import { getDb } from "./db.js";
import { gameStates, users, type GameState, type InsertGameState, type LeaderboardEntry, type InsertLeaderboardEntry, GAME_CONSTANTS, leaderboardEntries, type User, type InsertUser, type UserProfile, type Feedback, type InsertFeedback, feedbacks } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<(User & { lastPlayed?: Date | null })[]>;
  deleteUser(id: number): Promise<void>;
  createUser(user: InsertUser): Promise<User>;
  pingUser(id: number): Promise<void>;

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

  // Feedback
  addFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbacks(): Promise<(Feedback & { user?: User })[]>;
  resolveFeedback(id: number): Promise<void>;
  deleteFeedback(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await getDb().insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<(User & { lastPlayed?: Date | null })[]> {
    const results = await getDb()
      .select({
        user: users,
        gameState: gameStates,
      })
      .from(users)
      .leftJoin(gameStates, eq(users.id, gameStates.userId))
      .orderBy(desc(users.createdAt));

    return results.map((r: any) => ({
      ...r.user,
      lastPlayed: r.gameState?.lastPlayed || null
    }));
  }

  async pingUser(id: number): Promise<void> {
    await getDb().update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<void> {
    // Delete associated game states and feedbacks first due to foreign keys
    await getDb().delete(gameStates).where(eq(gameStates.userId, id));
    await getDb().delete(feedbacks).where(eq(feedbacks.userId, id));
    await getDb().delete(leaderboardEntries).where(eq(leaderboardEntries.userId, id));
    await getDb().delete(users).where(eq(users.id, id));
  }

  async getGameState(sessionId: string): Promise<GameState | undefined> {
    const [state] = await getDb()
      .select()
      .from(gameStates)
      .where(eq(gameStates.sessionId, sessionId));
    return state;
  }

  async getUserGameState(userId: number): Promise<GameState | undefined> {
    const [state] = await getDb()
      .select()
      .from(gameStates)
      .where(eq(gameStates.userId, userId));
    return state; // One save per user for now
  }

  async createOrUpdateGameState(gameState: InsertGameState): Promise<GameState> {
    // Try to find by sessionId OR userId if provided
    let existing: GameState | undefined;

    if (gameState.userId) {
      [existing] = await getDb()
        .select()
        .from(gameStates)
        .where(eq(gameStates.userId, gameState.userId));
    } else {
      [existing] = await getDb()
        .select()
        .from(gameStates)
        .where(eq(gameStates.sessionId, gameState.sessionId));
    }

    if (existing) {
      const [updated] = await getDb()
        .update(gameStates)
        .set({ ...gameState, lastPlayed: new Date() })
        .where(eq(gameStates.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await getDb()
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
    const [updated] = await getDb()
      .update(gameStates)
      .set({ ...updates, lastPlayed: new Date() })
      .where(eq(gameStates.sessionId, sessionId))
      .returning();

    if (!updated) throw new Error("Game state not found");
    return updated;
  }

  async deleteGameState(sessionId: string): Promise<void> {
    await getDb().delete(gameStates).where(eq(gameStates.sessionId, sessionId));
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return await getDb()
      .select()
      .from(leaderboardEntries)
      .orderBy(desc(leaderboardEntries.totalScore));
  }

  async getLeaderboardByChapter(chapter: number): Promise<LeaderboardEntry[]> {
    return await getDb()
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.chapter, chapter))
      .orderBy(desc(leaderboardEntries.totalScore));
  }

  async addLeaderboardEntry(entry: InsertLeaderboardEntry, userId?: number): Promise<LeaderboardEntry> {
    const [newEntry] = await getDb()
      .insert(leaderboardEntries)
      .values({ ...entry, userId })
      .returning();
    return newEntry;
  }

  async clearLeaderboard(): Promise<void> {
    await getDb().delete(leaderboardEntries);
  }

  async getUserProfile(userId: number): Promise<UserProfile> {
    const [user] = await getDb().select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    const [gameState] = await getDb().select().from(gameStates).where(eq(gameStates.userId, userId));

    const scores = await getDb()
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.userId, userId))
      .orderBy(desc(leaderboardEntries.totalScore));

    return { user, gameState, scores };
  }

  async addFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await getDb()
      .insert(feedbacks)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  async getFeedbacks(): Promise<(Feedback & { user?: User })[]> {
    const results = await getDb()
      .select({
        feedback: feedbacks,
        user: users,
      })
      .from(feedbacks)
      .leftJoin(users, eq(feedbacks.userId, users.id))
      .orderBy(desc(feedbacks.createdAt));

    return results.map((row: any) => ({
      ...row.feedback,
      email: row.feedback.email ?? null,
      user: row.user || undefined,
    }));
  }

  async resolveFeedback(id: number): Promise<void> {
    await getDb().update(feedbacks).set({ status: 'resolved', resolvedAt: new Date() }).where(eq(feedbacks.id, id));
  }

  async deleteFeedback(id: number): Promise<void> {
    await getDb().delete(feedbacks).where(eq(feedbacks.id, id));
  }
}

export class MemStorage implements IStorage {
  private states: Map<string, GameState>;
  private users: Map<number, User>;
  private currentId: number;
  private currentUserId: number;
  private leaderboard: LeaderboardEntry[];
  private leaderboardId: number;
  private feedbacksList: Feedback[];
  private feedbackId: number;

  constructor() {
    this.states = new Map();
    this.users = new Map();
    this.currentId = 1;
    this.currentUserId = 1;
    this.leaderboard = [];
    this.leaderboardId = 1;
    this.feedbacksList = [];
    this.feedbackId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, role: insertUser.role ?? "user", createdAt: new Date(), lastActiveAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async pingUser(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastActiveAt = new Date();
    }
  }

  async getAllUsers(): Promise<(User & { lastPlayed?: Date | null })[]> {
    const allUsers = Array.from(this.users.values());
    const states = Array.from(this.states.values());

    return allUsers.map(u => {
      const state = states.find(s => s.userId === u.id);
      return {
        ...u,
        lastPlayed: state?.lastPlayed || null
      };
    }).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
    // Find and delete game states
    const entries = Array.from(this.states.entries());
    for (const [key, state] of entries) {
      if (state.userId === id) this.states.delete(key);
    }
    // Filter out feedbacks and leaderboard
    this.feedbacksList = this.feedbacksList.filter(f => f.userId !== id);
    this.leaderboard = this.leaderboard.filter(l => l.userId !== id);
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
        userId: gameState.userId ?? null,
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
    const scores = this.leaderboard.filter(l => l.userId === userId);
    return { user, gameState, scores };
  }

  async addFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackId++;
    const newFeedback: Feedback = {
      ...feedback,
      id,
      userId: feedback.userId ?? null,
      email: feedback.email ?? null,
      status: 'open',
      createdAt: new Date(),
      resolvedAt: null,
    };
    this.feedbacksList.push(newFeedback);
    return newFeedback;
  }

  async getFeedbacks(): Promise<(Feedback & { user?: User })[]> {
    const sorted = [...this.feedbacksList].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return sorted.map(f => ({
      ...f,
      email: f.email ?? null,
      user: f.userId ? this.users.get(f.userId) : undefined
    })) as (Feedback & { user?: User })[];
  }

  async resolveFeedback(id: number): Promise<void> {
    const f = this.feedbacksList.find(f => f.id === id);
    if (f) {
      f.status = 'resolved';
      f.resolvedAt = new Date();
    }
  }

  async deleteFeedback(id: number): Promise<void> {
    this.feedbacksList = this.feedbacksList.filter(f => f.id !== id);
  }
}

export const storage = new DatabaseStorage();
