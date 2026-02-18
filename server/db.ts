import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import ws from "ws";

// Set the web socket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

let cachedPool: Pool | null = null;

export function getPool() {
  if (cachedPool) return cachedPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      console.warn("WARNING: DATABASE_URL is not set. Database operations will fail.");
    }
    // Return a dummy pool that will throw only on connection
    cachedPool = new Pool({ connectionString: "" });
    return cachedPool;
  }

  cachedPool = new Pool({ connectionString });
  return cachedPool;
}

export const pool = getPool();
export const db = drizzle(pool, { schema });
