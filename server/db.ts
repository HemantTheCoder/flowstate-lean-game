import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";
import ws from "ws";

// Set the web socket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

let cachedPool: Pool | null = null;
let cachedDb: any = null;

export function getPool(): Pool {
  if (cachedPool) return cachedPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Database operations will fail.");
  }

  cachedPool = new Pool({ connectionString });
  return cachedPool;
}

export function getDb() {
  if (cachedDb) return cachedDb;
  const p = getPool();
  cachedDb = drizzle(p, { schema });
  return cachedDb;
}
