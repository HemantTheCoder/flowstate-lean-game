import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Load Game State
  app.get(api.game.load.path, async (req, res) => {
    try {
      const { sessionId } = req.params as { sessionId: string };
      const gameState = await storage.getGameState(sessionId);

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
      const entry = await storage.addLeaderboardEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to submit leaderboard entry" });
    }
  });

  return httpServer;
}
