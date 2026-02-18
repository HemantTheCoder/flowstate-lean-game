import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import ws from "ws";

// Set the web socket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.warn(
    "WARNING: DATABASE_URL is not set. Database operations will fail."
  );
}

const connectionString = process.env.DATABASE_URL || "";
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
