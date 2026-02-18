import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage.js";
import { api } from "@shared/routes";
import { z } from "zod";

export function registerRoutes(app: Express) {
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Server] Database URL Status: ${process.env.DATABASE_URL ? "Present (Starts with " + process.env.DATABASE_URL.substring(0, 10) + "...)" : "MISSING"}`);
  console.log("[Server] Registering routes...");

  // Load Game State
  app.get(api.game.load.path, async (req, res) => {
    try {
      const { sessionId } = req.params as { sessionId: string };


      let gameState;
      if (req.isAuthenticated() && req.user) {
        gameState = await storage.getUserGameState(req.user.id);
      }

      // Fallback to session ID if no user save or not logged in
      if (!gameState) {
        gameState = await storage.getGameState(sessionId);
      }

      if (!gameState) {
        return res.status(404).json({ message: "Save file not found" });
      }

      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save Game State (Create or Overwrite)
  app.post(api.game.save.path, async (req, res) => {
    try {
      const input = api.game.save.input.parse(req.body);
      // If user is logged in, attach their userId to the save
      if (req.isAuthenticated() && req.user) {
        input.userId = req.user.id;
      }
      const gameState = await storage.createOrUpdateGameState(input);

      if (!gameState) {
        throw new Error("Failed to persist game state");
      }

      // Determine if created (201) or updated (200) - simplified to 200 for now or strictly following REST
      // Since our storage handles both, we'll return 200 usually, but let's check
      res.status(200).json(gameState);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to save game" });
    }
  });

  // Update Game State (Partial)
  app.patch(api.game.update.path, async (req, res) => {
    try {
      const { sessionId } = req.params as { sessionId: string };
      const input = api.game.update.input.parse(req.body);

      const gameState = await storage.updateGameState(sessionId, input);
      res.json(gameState);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      // If not found in storage, it throws
      res.status(404).json({ message: "Game session not found" });
    }
  });

  // Reset/Delete Game
  app.delete(api.game.reset.path, async (req, res) => {
    try {
      const { sessionId } = req.params as { sessionId: string };
      await storage.deleteGameState(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to reset game" });
    }
  });

  // Get Leaderboard (all chapters)
  app.get(api.leaderboard.list.path, async (_req, res) => {
    try {
      const entries = await storage.getLeaderboard();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get Leaderboard by Chapter
  app.get(api.leaderboard.byChapter.path, async (req, res) => {
    try {
      const chapter = parseInt(req.params.chapter as string, 10);
      if (isNaN(chapter)) {
        return res.status(400).json({ message: "Invalid chapter number" });
      }
      const entries = await storage.getLeaderboardByChapter(chapter);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Submit Leaderboard Entry
  app.post(api.leaderboard.submit.path, async (req, res) => {
    try {
      const input = api.leaderboard.submit.input.parse(req.body);
      const userId = (req.isAuthenticated() && req.user) ? req.user.id : undefined;
      const entry = await storage.addLeaderboardEntry(input, userId);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("[API] Leaderboard Submission Error:", err);
      res.status(500).json({ message: "Failed to submit leaderboard entry", details: err instanceof Error ? err.message : String(err) });
    }
  });

  // Clear Leaderboard (Dev Tool)
  app.delete(api.leaderboard.submit.path, async (_req, res) => {
    try {
      await storage.clearLeaderboard();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear leaderboard" });
    }
  });

  // Get User Profile
  app.get("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const profile = await storage.getUserProfile(req.user.id);
      // Don't modify the user object directly if it comes from storage, clone it
      const safeUser = { ...profile.user };
      // @ts-ignore
      delete safeUser.password;
      res.json({ ...profile, user: safeUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

}
