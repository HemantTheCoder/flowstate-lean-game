import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  if (process.env.VERCEL) {
    return;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.warn(
      `Could not find the build directory: ${distPath}. Skipping static serving.`,
    );
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
