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

  const loadGame = useQuery({
    queryKey: [api.game.load.path, sessionId],
    queryFn: async () => {
      const url = buildUrl(api.game.load.path, { sessionId });
      const res = await fetch(url);
      if (res.status === 404) return null; // No game found is valid state
      if (!res.ok) throw new Error("Failed to load game");
      return api.game.load.responses[200].parse(await res.json());
    },
    // Don't retry on 404, just return null so we can show "New Game"
    retry: (failureCount, error: any) => {
       if (error?.message?.includes("404")) return false;
       return failureCount < 3;
    }
  });

  const saveGame = useMutation({
    mutationFn: async (data: GameSaveInput) => {
      // Ensure session ID matches
      const payload = { ...data, sessionId };
      const res = await fetch(api.game.save.path, {
        method: api.game.save.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save game");
      }
      return api.game.save.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.game.load.path, sessionId], data);
      // Optional: silent save, or minimal toast
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateGame = useMutation({
    mutationFn: async (updates: UpdateGameRequest) => {
      const url = buildUrl(api.game.update.path, { sessionId });
      const res = await fetch(url, {
        method: api.game.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update game state");
      return api.game.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.game.load.path, sessionId], data);
    }
  });

  const resetGame = useMutation({
    mutationFn: async () => {
      const url = buildUrl(api.game.reset.path, { sessionId });
      const res = await fetch(url, { method: api.game.reset.method });
      if (!res.ok) throw new Error("Failed to reset game");
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
