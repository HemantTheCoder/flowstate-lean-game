import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type GameLoadResponse, type GameSaveInput, type UpdateGameRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

// Key for local storage to persist session ID
const SESSION_KEY = "flowstate_session_id";

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useGame() {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const LOCAL_SAVE_KEY = `flowstate_save_${sessionId}`;

  const loadGame = useQuery({
    queryKey: [api.game.load.path, sessionId],
    queryFn: async () => {
      // 1. Try Local First (Faster/Offline Support) or Fallback?
      // Strategy: Try API. If fails, check Local.
      const url = buildUrl(api.game.load.path, { sessionId });

      try {
        const res = await fetch(url);
        if (res.status === 404) {
          // Check local if server doesn't have it (maybe server restarted)
          const local = localStorage.getItem(LOCAL_SAVE_KEY);
          return local ? JSON.parse(local) : null;
        }
        if (!res.ok) throw new Error("Server error");
        return api.game.load.responses[200].parse(await res.json());
      } catch (e) {
        console.warn("Server unreachable, loading from local storage.");
        const local = localStorage.getItem(LOCAL_SAVE_KEY);
        return local ? JSON.parse(local) : null;
      }
    },
    retry: false
  });

  const saveGame = useMutation({
    mutationFn: async (data: GameSaveInput) => {
      const payload = { ...data, sessionId };

      // Save Locally FIRST (Always safe)
      // We mimic the server structure: id, lastPlayed
      // Note: We need the PREVIOUS state to merge properly if we were doing a partial update, 
      // but 'save' is usually a full overwrite or we have the full object.
      // GameSaveInput is usually the full state.

      const mockedServerState = {
        ...payload,
        id: 1, // Mock ID
        lastPlayed: new Date().toISOString() // String for JSON 
      };

      // Update Local immediately
      localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(mockedServerState));

      // Try Server
      try {
        const res = await fetch(api.game.save.path, {
          method: api.game.save.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // If server returns HTML (Vercel error), response.json() will invoke catch
        const text = await res.text();
        if (!res.ok) throw new Error(`Server ${res.status}: ${text.substring(0, 50)}`);

        return api.game.save.responses[200].parse(JSON.parse(text));
      } catch (e) {
        console.warn("Server save failed, using local save.", e);
        // Return the local version so the app thinks it succeeded
        return mockedServerState as any;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.game.load.path, sessionId], data);
    },
    onError: (error) => {
      // Should rarely happen now since we catch fetch errors.
      console.error("Critical Save Error:", error);
    }
  });

  const updateGame = useMutation({
    mutationFn: async (updates: UpdateGameRequest) => {
      // Get current local state to merge
      const currentStr = localStorage.getItem(LOCAL_SAVE_KEY);
      const current = currentStr ? JSON.parse(currentStr) : {};
      const merged = { ...current, ...updates, sessionId, lastPlayed: new Date().toISOString() };

      localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(merged));

      // Try Server
      try {
        const url = buildUrl(api.game.update.path, { sessionId });
        const res = await fetch(url, {
          method: api.game.update.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Server Update Failed");
        return api.game.update.responses[200].parse(await res.json());
      } catch (e) {
        console.warn("Server update failed, using local.", e);
        return merged as any;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.game.load.path, sessionId], data);
    }
  });

  const resetGame = useMutation({
    mutationFn: async () => {
      localStorage.removeItem(LOCAL_SAVE_KEY);
      try {
        const url = buildUrl(api.game.reset.path, { sessionId });
        await fetch(url, { method: api.game.reset.method });
      } catch (e) {
        console.warn("Server reset failed, ignoring.");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData([api.game.load.path, sessionId], null);
      toast({ title: "Game Reset", description: "Your progress has been cleared." });
    }
  });

  return {
    sessionId,
    gameState: loadGame.data,
    isLoading: loadGame.isLoading,
    isError: loadGame.isError,
    saveGame,
    updateGame,
    resetGame
  };
}
