import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS, CHAPTER_CHARACTERS } from '@/data/characters';
import { useGameStore } from '@/store/gameStore';
import { User, Briefcase, UserCircle } from 'lucide-react';

interface CharacterCastModalProps {
  chapter: number;
  onContinue: () => void;
}

const getAvatarIcon = (avatarType: string) => {
  switch (avatarType) {
    case 'Mira':
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-2xl">PM</span>
        </div>
      );
    case 'Rao':
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <span className="text-2xl">SS</span>
        </div>
      );
    case 'OldForeman':
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-yellow-700 flex items-center justify-center">
          <span className="text-2xl">FM</span>
        </div>
      );
    case 'Isha':
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <span className="text-2xl">JP</span>
        </div>
      );
    case 'Client':
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
      );
    case 'Advisor':
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <span className="text-2xl">DR</span>
        </div>
      );
    case 'Inspector':
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-2xl">QI</span>
        </div>
      );
    default:
      return (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <UserCircle className="w-8 h-8 text-white" />
        </div>
      );
  }
};

const getPlayerAvatar = (gender: 'male' | 'female') => {
  const gradient = gender === 'male' 
    ? 'from-blue-500 to-indigo-600' 
    : 'from-rose-400 to-pink-500';
  
  return (
    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center ring-4 ring-yellow-400`}>
      <User className="w-10 h-10 text-white" />
    </div>
  );
};

export const CharacterCastModal = ({ chapter, onContinue }: CharacterCastModalProps) => {
  const { playerName, playerGender } = useGameStore();
  const chapterCharacters = CHAPTER_CHARACTERS[chapter] || [];

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
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
            <p className="text-blue-200 text-sm uppercase tracking-widest mb-1">Chapter {chapter}</p>
            <h2 className="text-3xl font-bold text-white">{chapterTitles[chapter] || `Chapter ${chapter}`}</h2>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-4 text-center">Your Character</h3>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                {getPlayerAvatar(playerGender)}
                <p className="text-xl font-bold text-white mt-3">{playerName || 'Engineer'}</p>
                <p className="text-blue-400 text-sm">Flow Architect</p>
                <p className="text-slate-400 text-xs mt-1 text-center max-w-xs">
                  The newly hired Lean Construction specialist. Your mission: transform chaos into flow.
                </p>
              </motion.div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-4 text-center">Key Characters</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chapterCharacters.map((charId, index) => {
                  const character = CHARACTERS[charId];
                  if (!character) return null;
                  
                  return (
                    <motion.div
                      key={charId}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                    >
                      {getAvatarIcon(character.avatar)}
                      <p className="text-white font-medium mt-2 text-sm">{character.name}</p>
                      <p className="text-blue-400 text-xs">{character.role}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 border-t border-slate-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all"
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
