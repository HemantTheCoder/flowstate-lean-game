import { useEffect } from "react";
import { useGame } from "@/hooks/use-game";
import { useGameStore } from "@/store/gameStore";
import { ResourceBar } from "@/components/ResourceBar";
import { DialogueBox, DialogueStep } from "@/components/DialogueBox";
import { KanbanBoard } from "@/components/KanbanBoard";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Loader2, AlertCircle } from "lucide-react";
import { GameState } from "@shared/schema";

// --- MOCK DIALOGUE DATA (In real app, fetch this or move to separate file) ---
const CHAPTER_1_DIALOGUE: Record<string, DialogueStep> = {
  "intro-1": {
    id: "intro-1",
    speaker: "Mira",
    text: "So this is the new site... It's quieter than I expected.",
    nextId: "intro-2"
  },
  "intro-2": {
    id: "intro-2",
    speaker: "Rao",
    text: "Quiet? Hah! Wait until the materials arrive. If they arrive.",
    expression: "angry",
    options: [
      { id: "opt1", text: "We have a schedule, Rao.", nextId: "intro-3a" },
      { id: "opt2", text: "What seems to be the problem?", nextId: "intro-3b" }
    ]
  },
  "intro-3a": {
    id: "intro-3a",
    speaker: "Rao",
    text: "Schedules don't move steel beams, Architect. People do. And right now, my people are confused.",
    nextId: "intro-kanban-tutorial"
  },
  "intro-3b": {
    id: "intro-3b",
    speaker: "Rao",
    text: "Confusion. Nobody knows what to do next. We're stepping on each other's toes.",
    nextId: "intro-kanban-tutorial"
  },
  "intro-kanban-tutorial": {
    id: "intro-kanban-tutorial",
    speaker: "System",
    text: "Tutorial: Use the Kanban board to visualize work. Don't overload your team.",
    options: [
      { id: "start", text: "Open Board", nextId: "END_DIALOGUE", effect: () => {} }
    ]
  }
};

export default function Game() {
  const [, setLocation] = useLocation();
  const { gameState, isLoading, updateGame } = useGame();
  const { view, setView, currentDialogueId, setDialogue } = useGameStore();

  // Redirect if no game
  useEffect(() => {
    if (!isLoading && !gameState) {
      setLocation("/");
    }
  }, [isLoading, gameState, setLocation]);

  // Initial setup for new game
  useEffect(() => {
    if (gameState && gameState.chapter === 1 && !gameState.flags?.tutorialComplete) {
      setDialogue("intro-1");
      setView("visual-novel");
    }
  }, [gameState, setDialogue, setView]);

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const handleDialogueNext = (nextId: string) => {
    if (nextId === "END_DIALOGUE") {
      setDialogue(null);
      setView("management");
      // Could trigger a flag update here
      if (!gameState.flags?.tutorialComplete) {
         updateGame.mutate({ 
           flags: { ...gameState.flags, tutorialComplete: true },
           // Initialize Kanban for Chapter 1 if empty
           kanbanState: gameState.kanbanState || {
             columns: [
               { id: "todo", title: "To Do", wipLimit: 5, taskIds: ["t1", "t2"] },
               { id: "doing", title: "In Progress", wipLimit: 3, taskIds: [] },
               { id: "done", title: "Done", wipLimit: 10, taskIds: [] }
             ],
             tasks: {
               "t1": { id: "t1", title: "Site Survey", type: "task", difficulty: 1, status: "todo" },
               "t2": { id: "t2", title: "Material Check", type: "task", difficulty: 1, status: "todo" }
             }
           }
         });
      }
    } else {
      setDialogue(nextId);
    }
  };

  const handleKanbanUpdate = (newKanbanState: NonNullable<GameState["kanbanState"]>) => {
    // Optimistic update would go here if we were syncing real-time
    updateGame.mutate({ kanbanState: newKanbanState });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Persistent Resource Bar */}
      {gameState.resources && <ResourceBar resources={gameState.resources} />}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        
        {/* Visual Novel View */}
        {view === "visual-novel" && currentDialogueId && (
          <motion.div
            key="vn-view"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background Image for VN */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1920&q=80')] bg-cover bg-center opacity-50" />
            
            <DialogueBox 
              dialogue={CHAPTER_1_DIALOGUE[currentDialogueId] || { id: "err", speaker: "Error", text: "Missing dialogue ID" }} 
              onNext={handleDialogueNext}
            />
          </motion.div>
        )}

        {/* Management View (Kanban) */}
        {view === "management" && gameState.kanbanState && (
          <motion.div
            key="mgmt-view"
            className="absolute inset-0 pt-20 pb-4 bg-gradient-to-br from-blue-50 to-indigo-50/50"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
          >
            <div className="container mx-auto h-full flex flex-col">
              <div className="px-8 mb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-800">Site Management</h2>
                  <p className="text-muted-foreground">Week {gameState.week} • {gameState.chapter === 1 ? "Basics" : "Advanced"}</p>
                </div>
                <div className="bg-white/50 px-4 py-2 rounded-xl text-sm font-bold text-primary border border-white/50">
                   Target: Complete all "To Do" items
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <KanbanBoard 
                  kanbanState={gameState.kanbanState} 
                  onUpdate={handleKanbanUpdate} 
                />
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
