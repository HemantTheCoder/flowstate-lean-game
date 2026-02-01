import { z } from 'zod';
import { insertGameStateSchema, gameStates } from './schema';
export type { UpdateGameRequest } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  game: {
    // Get current game state by session ID (passed as query param or header in real app, here we might use a simple token)
    load: {
      method: 'GET' as const,
      path: '/api/game/:sessionId',
      responses: {
        200: z.custom<typeof gameStates.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Create new game or overwrite
    save: {
      method: 'POST' as const,
      path: '/api/game',
      input: insertGameStateSchema,
      responses: {
        201: z.custom<typeof gameStates.$inferSelect>(), // Created
        200: z.custom<typeof gameStates.$inferSelect>(), // Updated
        400: errorSchemas.validation,
      },
    },
    // Update specific fields (e.g. auto-save)
    update: {
      method: 'PATCH' as const,
      path: '/api/game/:sessionId',
      input: insertGameStateSchema.partial(),
      responses: {
        200: z.custom<typeof gameStates.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Reset game
    reset: {
      method: 'DELETE' as const,
      path: '/api/game/:sessionId',
      responses: {
        204: z.void(),
      },
    }
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPES
// ============================================
export type GameLoadResponse = z.infer<typeof api.game.load.responses[200]>;
export type GameSaveInput = z.infer<typeof api.game.save.input>;
