import { useState, useEffect } from 'react';
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
      { id: 'a', text: 'It makes workers do less work overall', isCorrect: false },
      { id: 'b', text: 'It prevents congestion and improves flow by focusing on finishing tasks', isCorrect: true },
      { id: 'c', text: 'It reduces the number of workers needed on site', isCorrect: false },
      { id: 'd', text: 'It eliminates the need for project planning', isCorrect: false },
    ],
    explanation: 'WIP limits force the team to finish work before starting new work. This reduces congestion, improves focus, and creates smooth flow through the system.',
  },
  {
    id: 'push-vs-pull',
    text: "On Day 4, Rao wanted to 'Push' workers to look busy for the Inspector. Why is this harmful?",
    options: [
      { id: 'a', text: 'It costs too much money', isCorrect: false },
      { id: 'b', text: "Workers don't like being told what to do", isCorrect: false },
      { id: 'c', text: 'Pushing unready work creates waste and rework that destroys real progress', isCorrect: true },
      { id: 'd', text: 'The Inspector prefers quiet sites', isCorrect: false },
    ],
    explanation: 'Pushing work that isn\'t ready creates inventory, rework, and waste. Pull-based systems ensure work flows only when the next step has capacity and prerequisites are met.',
  },
  {
    id: 'adaptation',
    text: 'When materials ran out on Day 2 or rain hit on Day 3, what was the best Lean response?',
    options: [
      { id: 'a', text: 'Stop all work and wait for conditions to improve', isCorrect: false },
      { id: 'b', text: 'Push workers to do the blocked tasks anyway', isCorrect: false },
      { id: 'c', text: "Pivot to available tasks that aren't affected by the constraint", isCorrect: true },
      { id: 'd', text: 'Send workers home to save money', isCorrect: false },
    ],
    explanation: 'When one path is blocked, Lean thinking means adapting by working on available tasks. This keeps the team productive and maintains flow while the constraint resolves.',
  },
  {
    id: 'bottleneck',
    text: 'What happens when you ignore the WIP limit and overload the "Doing" column?',
    options: [
      { id: 'a', text: 'Work gets done faster because more tasks are active', isCorrect: false },
      { id: 'b', text: 'A bottleneck forms - tasks pile up, nothing finishes, and flow breaks down', isCorrect: true },
      { id: 'c', text: 'Workers become more motivated due to the challenge', isCorrect: false },
      { id: 'd', text: 'It has no effect on the project timeline', isCorrect: false },
    ],
    explanation: 'Overloading creates a bottleneck. Workers context-switch between tasks, nothing finishes on time, and the entire system slows down. In construction, this means crews tripping over each other in the same zone.',
  },
  {
    id: 'flow-efficiency',
    text: 'In Lean Construction, what does "Flow Efficiency" measure?',
    options: [
      { id: 'a', text: 'How fast individual workers move on site', isCorrect: false },
      { id: 'b', text: 'The percentage of time work is actively progressing vs. waiting', isCorrect: true },
      { id: 'c', text: 'How many workers are on the payroll', isCorrect: false },
      { id: 'd', text: 'The total cost of the project', isCorrect: false },
    ],
    explanation: 'Flow Efficiency tracks how much of a task\'s lifecycle is spent adding value vs. waiting in queues. High flow efficiency means work moves smoothly through the system with minimal idle time.',
  },
];

export const ReflectionQuiz: React.FC<ReflectionQuizProps> = ({ isOpen, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setSelectedOption(null);
      setShowFeedback(false);
      setQuizComplete(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isAnswered = selectedOption !== null;

  const handleSelectOption = (optionId: string) => {
    if (selectedOption) return;
    setSelectedOption(optionId);
    setShowFeedback(true);
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionId;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setQuizComplete(true);
    }
  };

  const getScore = () => {
    return selectedAnswers.filter((answerId, index) => {
      return QUESTIONS[index]?.options.find((o) => o.id === answerId)?.isCorrect;
    }).length;
  };

  const handleComplete = () => {
    onComplete(getScore());
  };

  const score = getScore();
  const isCorrect = selectedOption
    ? currentQuestion.options.find((o) => o.id === selectedOption)?.isCorrect
    : false;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      data-testid="quiz-container"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border-2 border-indigo-200 flex flex-col max-h-[90vh]"
      >
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Brain className="w-7 h-7 text-white" />
              <h2 className="text-xl font-black text-white">Reflection Quiz</h2>
            </div>
            {!quizComplete && (
              <div className="text-indigo-100 font-semibold text-sm">
                {currentQuestionIndex + 1} / {QUESTIONS.length}
              </div>
            )}
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{
                width: quizComplete
                  ? '100%'
                  : `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / QUESTIONS.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!quizComplete ? (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
                  {currentQuestion.text}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === option.id;
                    const isOptionCorrect = option.isCorrect;

                    let borderClass = 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer';
                    if (showFeedback) {
                      if (isSelected && isOptionCorrect) {
                        borderClass = 'border-green-500 bg-green-50 ring-2 ring-green-400';
                      } else if (isSelected && !isOptionCorrect) {
                        borderClass = 'border-red-500 bg-red-50 ring-2 ring-red-400';
                      } else if (isOptionCorrect) {
                        borderClass = 'border-green-300 bg-green-50';
                      } else {
                        borderClass = 'border-slate-200 bg-slate-50 opacity-60';
                      }
                    }

                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => handleSelectOption(option.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        disabled={!!selectedOption}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${borderClass}`}
                        data-testid={`quiz-option-${index}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className="font-bold text-slate-500 mr-2">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className="text-slate-700">{option.text}</span>
                          </div>
                          <div className="flex-shrink-0 mt-0.5">
                            {showFeedback && isSelected && isOptionCorrect && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              </motion.div>
                            )}
                            {showFeedback && isSelected && !isOptionCorrect && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                                <XCircle className="w-5 h-5 text-red-500" />
                              </motion.div>
                            )}
                            {showFeedback && !isSelected && isOptionCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-xl border-l-4 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
                    >
                      <div className={`font-bold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite.'}
                      </div>
                      <div className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {currentQuestion.explanation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {showFeedback && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleNext}
                    className="w-full bg-indigo-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {currentQuestionIndex < QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
                >
                  <Award className="w-16 h-16 text-indigo-500" />
                </motion.div>

                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black text-slate-800">Quiz Complete</h3>
                  <div className="text-5xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    {score}/{QUESTIONS.length}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg font-semibold text-slate-600 text-center"
                >
                  {score === QUESTIONS.length
                    ? 'Perfect Score! Master of Lean principles.'
                    : score >= QUESTIONS.length - 1
                      ? 'Excellent! Strong understanding of Lean concepts.'
                      : score >= Math.ceil(QUESTIONS.length / 2)
                        ? 'Good grasp of the basics. Review the missed concepts.'
                        : 'Keep learning! Review the key principles and try again.'}
                </motion.div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 w-full space-y-2">
                  <div className="font-semibold text-indigo-900 text-sm">Key Takeaways</div>
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
                      <span>Adapt to constraints instead of ignoring them</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Bottlenecks slow everything - fix the system, not the blame</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Flow efficiency measures value-adding time vs. waiting</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  data-testid="button-quiz-continue"
                >
                  View Chapter Results <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
