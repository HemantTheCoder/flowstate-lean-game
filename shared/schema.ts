import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(), // Identify player by simple token/session
  playerName: text("player_name").default("Architect"),
  chapter: integer("chapter").default(1),
  week: integer("week").default(1),
  
  // Game Systems State
  resources: jsonb("resources").$type<{
    morale: number;
    stress: number;
    trust: number;
    productivity: number;
    quality: number;
    budget: number;
  }>().default({ 
    morale: 50, 
    stress: 20, 
    trust: 50,
    productivity: 40, 
    quality: 80, 
    budget: 10000 
  }),
  
  // Kanban System
  kanbanState: jsonb("kanban_state").$type<{
    columns: { id: string; title: string; wipLimit: number; taskIds: string[] }[];
    tasks: Record<string, { id: string; title: string; type: string; difficulty: number; status: string }>;
  }>(),
  
  // Story & Progression
  flags: jsonb("flags").$type<Record<string, boolean>>(), // Story triggers, tutorial flags
  completedChapters: integer("completed_chapters").array(),
  unlockedBadges: text("unlocked_badges").array(),
  
  // Metrics for "LPI" (Lean Performance Index)
  metrics: jsonb("metrics").$type<{
    flowEfficiency: number[];
    ppc: number[]; // Percent Plan Complete history
    wipCompliance: number[];
  }>(),
  
  lastPlayed: timestamp("last_played").defaultNow(),
});

// === SCHEMAS ===
export const insertGameStateSchema = createInsertSchema(gameStates).omit({ 
  id: true, 
  lastPlayed: true 
});

// === TYPES ===
export type GameState = typeof gameStates.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;

// Request types
export type UpdateGameRequest = Partial<InsertGameState>;
export type SaveGameRequest = InsertGameState;

// API Response types
export type GameStateResponse = GameState;

export const GAME_CONSTANTS = {
  INITIAL_RESOURCES: {
    morale: 50,
    stress: 20,
    trust: 50,
    productivity: 40,
    quality: 80,
    budget: 10000
  },
  CHAPTERS: [
    { id: 1, title: "Welcome to Flowstate", focus: "Kanban Basics" },
    { id: 2, title: "The Overpromised Mall", focus: "Last Planner + PPC" },
    { id: 3, title: "Tangled Depot", focus: "5S" },
    { id: 4, title: "Assembly Alley", focus: "Pull System" },
    { id: 5, title: "Grand Transit", focus: "Integrated Systems" }
  ]
};
