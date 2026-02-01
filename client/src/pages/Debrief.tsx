import { useGame } from "@/hooks/use-game";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Debrief() {
  const { gameState } = useGame();

  if (!gameState) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white"
      >
        <div className="bg-primary p-8 text-white text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-white/90" />
          <h1 className="text-4xl font-display font-bold">Week Complete!</h1>
          <p className="opacity-90 mt-2 font-hand text-xl">Great work, Architect.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl text-center">
              <span className="block text-muted-foreground text-sm font-bold uppercase">Productivity</span>
              <span className="block text-3xl font-display font-bold text-gray-800">
                {gameState.resources?.productivity}%
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl text-center">
              <span className="block text-muted-foreground text-sm font-bold uppercase">Morale</span>
              <span className="block text-3xl font-display font-bold text-pink-500">
                {gameState.resources?.morale}%
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Link href="/game">
              <Button className="w-full btn-primary h-12 text-lg">Next Week</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full rounded-full">
                <Home className="w-4 h-4 mr-2" /> Return Home
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
