import { useGame } from "@/hooks/use-game";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Play, Settings, CreditCard, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

export default function Home() {
  const [, setLocation] = useLocation();
  const { gameState, isLoading, resetGame, saveGame } = useGame();

  const handleNewGame = async () => {
    // If game exists, we should probably warn (handled by UI below)
    if (gameState) {
      await resetGame.mutateAsync();
    }
    // Initialize new game with defaults
    await saveGame.mutateAsync({
      sessionId: "temp", // Will be overridden by hook
      playerName: "Architect",
      chapter: 1,
      week: 1,
      // Default resource/state handled by backend schema defaults or explicit defaults here if needed
      completedChapters: [],
      unlockedBadges: [],
    });
    setLocation("/game");
  };

  const handleContinue = () => {
    setLocation("/game");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-pink-50 to-white opacity-80" />
        {/* Abstract City Shapes */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[url('https://images.unsplash.com/photo-1518640027989-a30d5d7e498e?w=1920&q=20')] bg-cover bg-bottom opacity-10 mix-blend-overlay" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center space-y-8"
      >
        {/* Title */}
        <div className="space-y-2">
           <h1 className="text-6xl md:text-8xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-sm tracking-tight p-2">
            FLOWSTATE
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-hand">
            Build efficiently. Lead with empathy.
          </p>
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-4 w-64 mx-auto">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse">Loading data...</div>
          ) : (
            <>
              {gameState ? (
                <>
                  <Button onClick={handleContinue} className="w-full btn-primary text-lg h-14">
                    <Play className="mr-2 h-5 w-5" /> Continue
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-12 rounded-full border-2 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
                         <RotateCcw className="mr-2 h-4 w-4" /> New Game
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Start a new journey?</DialogTitle>
                        <DialogDescription>
                          This will overwrite your current progress in Chapter {gameState.chapter}.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleNewGame}>Yes, Restart</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Button onClick={handleNewGame} className="w-full btn-primary text-lg h-14">
                  <Play className="mr-2 h-5 w-5" /> New Game
                </Button>
              )}

              <Button variant="ghost" disabled className="w-full rounded-full text-muted-foreground">
                <CreditCard className="mr-2 h-4 w-4" /> Multiplayer (Coming Soon)
              </Button>
              
              <Button variant="ghost" className="w-full rounded-full">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Footer / Credits */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-center z-10"
      >
        <p className="text-sm text-muted-foreground">
          Made with ❤️ by <a href="https://linkedin.com/in/hemant-kumar" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">Hemant Kumar</a>
        </p>
      </motion.div>
    </div>
  );
}
