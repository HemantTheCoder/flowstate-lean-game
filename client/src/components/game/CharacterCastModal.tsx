import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS, CHAPTER_CHARACTERS } from '@/data/characters';
import { useGameStore } from '@/store/gameStore';

interface CharacterCastModalProps {
  chapter: number;
  onContinue: () => void;
}

const CHARACTER_IMAGES: Record<string, string> = {
  'Mira': 'mira.png',
  'Rao': 'rao.png',
  'Old Foreman': 'foreman.png',
  'Isha': 'isha.png',
  'Client': 'client.png',
  'Advisor': 'advisor.png',
  'Inspector': 'client.png',
  'Engineer': 'architect.png'
};

export const CharacterCastModal = ({ chapter, onContinue }: CharacterCastModalProps) => {
  const { playerName, playerGender } = useGameStore();
  const chapterCharacters = CHAPTER_CHARACTERS[chapter] || [];

  const playerImage = playerGender === 'female' ? 'architect_female.png' : 'architect.png';

  const chapterTitles: Record<number, string> = {
    1: 'The Kanban Chronicles',
    2: 'The Promise System'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 md:p-6 text-center shrink-0">
            <p className="text-blue-200 text-xs md:text-sm uppercase tracking-widest mb-1">Chapter {chapter}</p>
            <h2 className="text-xl md:text-3xl font-bold text-white">{chapterTitles[chapter] || `Chapter ${chapter}`}</h2>
          </div>

          <div className="p-4 md:p-6 overflow-y-auto flex-1">
            <div className="mb-4 md:mb-6">
              <h3 className="text-slate-400 text-xs md:text-sm uppercase tracking-wider mb-3 text-center">Your Character</h3>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <img
                    src={`/assets/${playerImage}`}
                    alt="Your Character"
                    className="h-20 md:h-32 object-contain drop-shadow-xl"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-900 text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                    YOU
                  </div>
                </div>
                <p className="text-lg md:text-xl font-bold text-white mt-3">{playerName || 'Engineer'}</p>
                <p className="text-blue-400 text-xs md:text-sm">Flow Architect</p>
              </motion.div>
            </div>

            <div className="border-t border-slate-700 pt-4 md:pt-6">
              <h3 className="text-slate-400 text-xs md:text-sm uppercase tracking-wider mb-3 text-center">Key Characters</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                {chapterCharacters.map((charId, index) => {
                  const character = CHARACTERS[charId];
                  if (!character) return null;
                  const imagePath = CHARACTER_IMAGES[charId] || 'worker.png';
                  
                  return (
                    <motion.div
                      key={charId}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex flex-col items-center text-center p-2 md:p-3 rounded-lg bg-slate-800/50"
                    >
                      <img
                        src={`/assets/${imagePath}`}
                        alt={character.name}
                        className="h-16 md:h-24 object-contain drop-shadow-lg"
                      />
                      <p className="text-white font-medium mt-1 md:mt-2 text-xs md:text-sm">{character.name}</p>
                      <p className="text-blue-400 text-[10px] md:text-xs">{character.role}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-slate-900/50 border-t border-slate-700 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 md:py-4 rounded-xl text-base md:text-lg shadow-lg transition-all"
              data-testid="button-start-chapter"
            >
              Begin Chapter {chapter}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
