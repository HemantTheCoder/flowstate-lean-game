import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Brain, ChevronRight, Award } from 'lucide-react';

interface ReflectionQuizProps {
  isOpen: boolean;
  onComplete: (score: number) => void;
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: QuizOption[];
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'wip-limits',
    text: 'What is the primary benefit of limiting Work-In-Progress (WIP)?',
    options: [
      {
        id: 'a',
        text: 'It makes workers do less work overall',
        isCorrect: false,
      },
      {
        id: 'b',
        text: 'It prevents congestion and improves flow by focusing on finishing tasks',
        isCorrect: true,
      },
      {
        id: 'c',
        text: 'It reduces the number of workers needed on site',
        isCorrect: false,
      },
      {
        id: 'd',
        text: 'It eliminates the need for project planning',
        isCorrect: false,
      },
    ],
    explanation:
      'WIP limits force the team to finish work before starting new work. This reduces congestion, improves focus, and creates smooth flow through the system.',
  },
  {
    id: 'push-vs-pull',
    text: "On Day 4, Rao wanted to 'Push' workers to look busy for the Inspector. Why is this harmful?",
    options: [
      {
        id: 'a',
        text: 'It costs too much money',
        isCorrect: false,
      },
      {
        id: 'b',
        text: "Workers don't like being told what to do",
        isCorrect: false,
      },
      {
        id: 'c',
        text: 'Pushing unready work creates waste and rework that destroys real progress',
        isCorrect: true,
      },
      {
        id: 'd',
        text: 'The Inspector prefers quiet sites',
        isCorrect: false,
      },
    ],
    explanation:
      'Pushing work creates inventory and waste. It leads to rework and delays. Pull-based systems ensure work is done only when the next step is ready.',
  },
  {
    id: 'adaptation',
    text: 'When materials ran out on Day 2 or rain hit on Day 3, what was the best Lean response?',
    options: [
      {
        id: 'a',
        text: 'Stop all work and wait for conditions to improve',
        isCorrect: false,
      },
      {
        id: 'b',
        text: 'Push workers to do the blocked tasks anyway',
        isCorrect: false,
      },
      {
        id: 'c',
        text: "Pivot to available tasks that aren't affected by the constraint",
        isCorrect: true,
      },
      {
        id: 'd',
        text: 'Send workers home to save money',
        isCorrect: false,
      },
    ],
    explanation:
      'When one path is blocked, adapt by working on available tasks. This keeps the team engaged and maintains flow while the constraint resolves.',
  },
];

export const ReflectionQuiz: React.FC<ReflectionQuizProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const currentAnswer = selectedAnswers[currentQuestionIndex];
  const isAnswered = currentAnswer !== undefined;
  const isCorrect =
    currentAnswer &&
    QUESTIONS[currentQuestionIndex].options.find((o) => o.id === currentAnswer)
      ?.isCorrect;

  const handleSelectOption = (optionId: string) => {
    if (!selectedOption) {
      setSelectedOption(optionId);
      setShowFeedback(true);
      const newAnswers = [...selectedAnswers];
      newAnswers[currentQuestionIndex] = optionId;
      setSelectedAnswers(newAnswers);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      const score = selectedAnswers.filter((answerId, index) => {
        const question = QUESTIONS[index];
        return question.options.find((o) => o.id === answerId)?.isCorrect;
      }).length;
      setQuizComplete(true);
    }
  };

  const handleComplete = () => {
    const score = selectedAnswers.filter((answerId, index) => {
      const question = QUESTIONS[index];
      return question.options.find((o) => o.id === answerId)?.isCorrect;
    }).length;
    onComplete(score);
  };

  const handleClose = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setSelectedOption(null);
    setShowFeedback(false);
    setQuizComplete(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto"
          data-testid="quiz-container"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border-2 border-indigo-200 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-8 h-8 text-white" />
                  <h2 className="text-2xl font-black text-white">
                    Reflection Quiz
                  </h2>
                </div>
                <div className="text-indigo-100 font-semibold text-sm">
                  Question {currentQuestionIndex + 1} of {QUESTIONS.length}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: '0%' }}
                  animate={{
                    width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <AnimatePresence mode="wait">
                {!quizComplete ? (
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Question */}
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 leading-relaxed">
                        {currentQuestion.text}
                      </h3>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedOption === option.id;
                        const isOptionCorrect = option.isCorrect;
                        const showCorrect =
                          showFeedback && isSelected && isOptionCorrect;
                        const showIncorrect =
                          showFeedback && isSelected && !isOptionCorrect;

                        return (
                          <motion.button
                            key={option.id}
                            onClick={() => handleSelectOption(option.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            disabled={isAnswered}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                              !isAnswered
                                ? 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
                                : isSelected && isOptionCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : isSelected && !isOptionCorrect
                                    ? 'border-red-500 bg-red-50'
                                    : isOptionCorrect
                                      ? 'border-green-300 bg-green-50'
                                      : 'border-slate-200 bg-slate-50 opacity-60'
                            } ${showCorrect ? 'ring-2 ring-green-400' : ''} ${showIncorrect ? 'ring-2 ring-red-400' : ''}`}
                            data-testid={`quiz-option-${index}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="font-semibold text-slate-800 mb-1">
                                  {String.fromCharCode(65 + index)})
                                </div>
                                <div className="text-slate-700">
                                  {option.text}
                                </div>
                              </div>
                              <div className="flex-shrink-0 mt-1">
                                {isSelected && isOptionCorrect && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: 'spring',
                                      bounce: 0.5,
                                    }}
                                  >
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                  </motion.div>
                                )}
                                {isSelected && !isOptionCorrect && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: 'spring',
                                      bounce: 0.5,
                                    }}
                                  >
                                    <XCircle className="w-6 h-6 text-red-500" />
                                  </motion.div>
                                )}
                                {isAnswered &&
                                  !isSelected &&
                                  isOptionCorrect && (
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                  )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Feedback */}
                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`p-4 rounded-xl border-l-4 ${
                            isCorrect
                              ? 'bg-green-50 border-green-500'
                              : 'bg-red-50 border-red-500'
                          }`}
                        >
                          <div
                            className={`font-bold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                          >
                            {isCorrect ? 'Correct!' : 'Not quite.'}
                          </div>
                          <div
                            className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                          >
                            {currentQuestion.explanation}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  /* Results Screen */
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-8 space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        bounce: 0.6,
                        delay: 0.2,
                      }}
                    >
                      <Award className="w-16 h-16 text-indigo-500" />
                    </motion.div>

                    <div className="text-center space-y-2">
                      <h3 className="text-3xl font-black text-slate-800">
                        Quiz Complete
                      </h3>
                      <div className="text-5xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        {selectedAnswers.filter((answerId, index) => {
                          return QUESTIONS[index].options.find(
                            (o) => o.id === answerId
                          )?.isCorrect;
                        }).length}
                        /{QUESTIONS.length}
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-lg font-semibold text-slate-600 text-center"
                    >
                      {selectedAnswers.filter((answerId, index) => {
                        return QUESTIONS[index].options.find(
                          (o) => o.id === answerId
                        )?.isCorrect;
                      }).length === QUESTIONS.length
                        ? 'Perfect Score! Master of Lean principles.'
                        : selectedAnswers.filter((answerId, index) => {
                            return QUESTIONS[index].options.find(
                              (o) => o.id === answerId
                            )?.isCorrect;
                          }).length >= QUESTIONS.length - 1
                          ? 'Excellent! Strong understanding of Lean concepts.'
                          : 'Good effort! Review the key learnings.'}
                    </motion.div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 w-full space-y-2">
                      <div className="font-semibold text-indigo-900 text-sm">
                        Key Takeaways
                      </div>
                      <ul className="text-sm text-indigo-800 space-y-1">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>WIP limits prevent congestion and improve flow</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Pull systems eliminate waste better than push</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Adapt to constraints, don't ignore them</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex justify-between items-center">
              <div className="text-sm text-slate-500">
                {!quizComplete &&
                  `Question ${currentQuestionIndex + 1} of ${QUESTIONS.length}`}
              </div>
              <motion.button
                onClick={quizComplete ? handleComplete : handleNext}
                disabled={!isAnswered && !quizComplete}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                  !isAnswered && !quizComplete
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95'
                }`}
                whileHover={!isAnswered && !quizComplete ? {} : { scale: 1.05 }}
                whileTap={!isAnswered && !quizComplete ? {} : { scale: 0.95 }}
              >
                {quizComplete ? 'Continue' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
