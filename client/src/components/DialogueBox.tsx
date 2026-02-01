import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

export interface DialogueOption {
  id: string;
  text: string;
  nextId: string;
  effect?: () => void; // Side effect like changing resources
}

export interface DialogueStep {
  id: string;
  speaker: string;
  text: string;
  expression?: 'neutral' | 'happy' | 'angry' | 'surprised' | 'thinking';
  options?: DialogueOption[];
  nextId?: string; // Auto advance if no options
}

interface DialogueBoxProps {
  dialogue: DialogueStep;
  onNext: (nextId: string) => void;
}

export function DialogueBox({ dialogue, onNext }: DialogueBoxProps) {
  const [visibleText, setVisibleText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Reset when dialogue changes
  useEffect(() => {
    setVisibleText("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < dialogue.text.length) {
        setVisibleText(dialogue.text.substring(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30); // Typing speed

    return () => clearInterval(interval);
  }, [dialogue]);

  const handleSkip = () => {
    if (isTyping) {
      setVisibleText(dialogue.text);
      setIsTyping(false);
    } else if (dialogue.nextId) {
      onNext(dialogue.nextId);
    }
  };

  const getSpeakerColor = (speaker: string) => {
    switch (speaker) {
      case "Mira": return "text-primary border-primary";
      case "Rao": return "text-blue-500 border-blue-500";
      case "Isha": return "text-purple-500 border-purple-500";
      default: return "text-gray-600 border-gray-400";
    }
  };

  const getSpeakerImage = (speaker: string) => {
    switch (speaker) {
      case "Mira": return "/images/mira.png";
      case "Rao": return "/images/rao.png";
      case "Isha": return "/images/isha.png";
      case "Old Foreman": return "/images/foreman.png";
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
      {/* Character Portraits Area */}
      <div className="flex justify-start items-end h-full pb-32 pl-12 space-x-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {dialogue.speaker && getSpeakerImage(dialogue.speaker) && (
            <motion.img
              key={dialogue.speaker}
              initial={{ x: -50, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -50, opacity: 0, scale: 0.9 }}
              src={getSpeakerImage(dialogue.speaker)!}
              alt={dialogue.speaker}
              className="h-[45vh] md:h-[55vh] object-contain drop-shadow-2xl mix-blend-multiply"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Dialogue UI */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="pointer-events-auto w-full max-w-5xl mx-auto mb-8 px-4"
      >
        <div 
          className="bg-white/95 backdrop-blur-xl border-2 border-white/50 shadow-2xl rounded-3xl p-6 md:p-8 relative overflow-visible"
          onClick={handleSkip}
        >
          {/* Speaker Name Tag */}
          <div className={`absolute -top-4 left-8 bg-white px-6 py-1.5 rounded-full border-2 shadow-sm font-display font-bold text-lg z-20 ${getSpeakerColor(dialogue.speaker)}`}>
            {dialogue.speaker}
          </div>

          {/* Text Content */}
          <p className="mt-4 text-lg md:text-xl font-medium text-gray-800 leading-relaxed min-h-[4rem] font-body">
            {visibleText}
            {isTyping && <span className="animate-pulse inline-block w-2 h-4 bg-primary ml-1 align-middle"/>}
          </p>

          {/* Controls / Options */}
          <div className="mt-6 flex justify-end items-center gap-4">
            {!isTyping && dialogue.options ? (
              <div className="flex flex-wrap gap-3 justify-end w-full">
                {dialogue.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (opt.effect) opt.effect();
                      onNext(opt.nextId);
                    }}
                    className="px-6 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold rounded-full transition-colors border border-primary/20"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground text-sm font-bold uppercase tracking-wider animate-bounce">
                {!isTyping && (
                  <>
                    Click to continue <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
