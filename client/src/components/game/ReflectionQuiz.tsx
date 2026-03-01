import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Brain, ChevronRight, Award } from 'lucide-react';
import soundManager from '@/lib/soundManager';

interface ReflectionQuizProps {
  isOpen: boolean;
  onComplete: (score: number) => void;
  chapter?: number;
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

const CHAPTER_1_QUESTIONS: Question[] = [
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

const CHAPTER_2_QUESTIONS: Question[] = [
  {
    id: 'should-can-will',
    text: 'In the Last Planner System, what do SHOULD, CAN, and WILL represent?',
    options: [
      { id: 'a', text: 'Three different types of construction workers', isCorrect: false },
      { id: 'b', text: 'Three levels of planning: Master Schedule, Lookahead (constraint check), and Weekly Commitment', isCorrect: true },
      { id: 'c', text: 'Three phases of building: Design, Build, Inspect', isCorrect: false },
      { id: 'd', text: 'Three ways to measure project speed', isCorrect: false },
    ],
    explanation: 'SHOULD = what the Master Schedule says needs to happen. CAN = what is actually possible after checking constraints in the Lookahead. WILL = what you commit to deliver in the Weekly Work Plan. Only Sound (green) tasks should become WILL commitments.',
  },
  {
    id: 'constraints',
    text: 'What is a "constraint" in the Last Planner System?',
    options: [
      { id: 'a', text: 'A budget limit set by the client', isCorrect: false },
      { id: 'b', text: 'Any prerequisite that prevents a task from being executed - like missing materials, unavailable crew, or pending approvals', isCorrect: true },
      { id: 'c', text: 'A rule that says workers cannot work overtime', isCorrect: false },
      { id: 'd', text: 'The maximum number of tasks allowed per week', isCorrect: false },
    ],
    explanation: 'Constraints are the hidden reasons tasks fail. They include missing materials, unavailable crews, pending design approvals, incomplete prerequisite work, and weather. Identifying constraints BEFORE committing is what makes LPS reliable.',
  },
  {
    id: 'ppc',
    text: 'What does PPC (Percent Plan Complete) actually measure?',
    options: [
      { id: 'a', text: 'How much of the total project is finished', isCorrect: false },
      { id: 'b', text: 'How fast the workers are building', isCorrect: false },
      { id: 'c', text: 'The percentage of PROMISES that were KEPT - tasks committed vs. tasks completed', isCorrect: true },
      { id: 'd', text: 'The percentage of the budget that has been spent', isCorrect: false },
    ],
    explanation: 'PPC = (Tasks Completed / Tasks Promised) x 100. It measures RELIABILITY, not productivity. A team that promises 5 tasks and completes all 5 (100% PPC) is more valuable than a team that promises 10 and completes 7 (70% PPC), because downstream trades can trust their schedule.',
  },
  {
    id: 'overcommitment',
    text: 'When the Client pressured you to add extra work, why is accepting risky?',
    options: [
      { id: 'a', text: 'Because the Client might change their mind later', isCorrect: false },
      { id: 'b', text: 'Because extra work costs more money', isCorrect: false },
      { id: 'c', text: 'Because adding unverified work increases your PPC denominator, making failure more likely and damaging team trust', isCorrect: true },
      { id: 'd', text: 'Because the Inspector does not allow changes to the plan', isCorrect: false },
    ],
    explanation: 'Overcommitment is the #1 enemy of reliable planning. When you add tasks without checking constraints, you inflate your promise list. If those tasks fail (which unchecked tasks often do), your PPC drops and the entire team loses trust in your planning.',
  },
  {
    id: 'make-ready',
    text: 'What is the "Make Ready" process?',
    options: [
      { id: 'a', text: 'Cleaning the construction site before work begins', isCorrect: false },
      { id: 'b', text: 'Training new workers on safety procedures', isCorrect: false },
      { id: 'c', text: 'Actively removing constraints (calling suppliers, reassigning crews, getting approvals) so tasks become Sound and executable', isCorrect: true },
      { id: 'd', text: 'Writing a detailed project schedule with milestones', isCorrect: false },
    ],
    explanation: 'Make Ready is the proactive process of removing every constraint that blocks a task. Instead of waiting for problems during execution, you solve them during planning. Call the supplier, book the crane, reassign the crew, expedite the approval. Only when ALL constraints are removed is a task "Sound" (green).',
  },
];

export const ReflectionQuiz: React.FC<ReflectionQuizProps> = ({ isOpen, onComplete, chapter = 1 }) => {
  const QUESTIONS = chapter === 2 ? CHAPTER_2_QUESTIONS : CHAPTER_1_QUESTIONS;
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
    const isOptionCorrect = currentQuestion.options.find((o) => o.id === optionId)?.isCorrect;
    soundManager.playSFX(isOptionCorrect ? 'quiz_correct' : 'quiz_wrong', 0.7);
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setQuizComplete(true);
      soundManager.playSFX('fanfare', 0.7);
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
        className="bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 flex flex-col max-h-[90vh]"
      >
        <div className="bg-slate-900/50 border-b border-slate-700/50 px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Brain className="w-7 h-7 text-cyan-400" />
              <h2 className="text-xl font-black text-white">Reflection Quiz</h2>
            </div>
            {!quizComplete && (
              <div className="text-slate-400 font-semibold text-sm">
                {currentQuestionIndex + 1} / {QUESTIONS.length}
              </div>
            )}
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
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
                <h3 className="text-xl font-bold text-slate-200 leading-relaxed">
                  {currentQuestion.text}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === option.id;
                    const isOptionCorrect = option.isCorrect;

                    let borderClass = 'border-slate-700/50 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-cyan-900/10 cursor-pointer';
                    if (showFeedback) {
                      if (isSelected && isOptionCorrect) {
                        borderClass = 'border-emerald-500/50 bg-emerald-900/20 ring-1 ring-emerald-500/50';
                      } else if (isSelected && !isOptionCorrect) {
                        borderClass = 'border-red-500/50 bg-red-900/20 ring-1 ring-red-500/50';
                      } else if (isOptionCorrect) {
                        borderClass = 'border-emerald-500/30 bg-emerald-900/10';
                      } else {
                        borderClass = 'border-slate-700/30 bg-slate-800/30 opacity-50';
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
                            <span className="font-bold text-slate-400 mr-2">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className="text-slate-300">{option.text}</span>
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
                      className={`p-4 rounded-xl border-l-4 bg-slate-800 ${isCorrect ? 'border-emerald-500' : 'border-red-500'}`}
                    >
                      <div className={`font-bold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite.'}
                      </div>
                      <div className={`text-sm ${isCorrect ? 'text-emerald-100' : 'text-red-100'}`}>
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
                    className="w-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 py-3 rounded-xl font-bold text-lg hover:bg-cyan-600/40 hover:text-white transition-colors flex items-center justify-center gap-2"
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
                  <Award className="w-16 h-16 text-cyan-400" />
                </motion.div>

                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black text-slate-200">Quiz Complete</h3>
                  <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    {score}/{QUESTIONS.length}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg font-semibold text-slate-400 text-center"
                >
                  {score === QUESTIONS.length
                    ? 'Perfect Score! Master of Lean principles.'
                    : score >= QUESTIONS.length - 1
                      ? 'Excellent! Strong understanding of Lean concepts.'
                      : score >= Math.ceil(QUESTIONS.length / 2)
                        ? 'Good grasp of the basics. Review the missed concepts below.'
                        : 'Keep learning! Review the concepts you missed below.'}
                </motion.div>

                {score < QUESTIONS.length && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 w-full space-y-3">
                    <div className="font-semibold text-red-400 text-sm flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Concepts to Review
                    </div>
                    {QUESTIONS.map((q, idx) => {
                      const playerAnswer = selectedAnswers[idx];
                      const wasCorrect = q.options.find(o => o.id === playerAnswer)?.isCorrect;
                      if (wasCorrect) return null;
                      const correctOption = q.options.find(o => o.isCorrect);
                      return (
                        <div key={q.id} className="border-t border-red-500/20 pt-2 first:border-0 first:pt-0">
                          <div className="text-sm font-bold text-red-300">{q.text}</div>
                          <div className="text-xs text-red-400 mt-1">
                            Correct answer: <span className="font-semibold text-emerald-400">{correctOption?.text}</span>
                          </div>
                          <div className="text-xs text-red-200 mt-0.5 italic opacity-80">{q.explanation}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4 w-full space-y-2">
                  <div className="font-semibold text-cyan-400 text-sm">Key Takeaways</div>
                  <ul className="text-sm text-cyan-100 space-y-1">
                    {chapter === 2 ? (
                      <>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>SHOULD, CAN, WILL - three levels of reliable planning</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Identify and remove constraints BEFORE committing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>PPC measures promises kept, not total productivity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Overcommitment destroys trust - say no to protect your promises</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Make Ready turns blocked tasks into Sound, executable work</span>
                        </li>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </ul>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 py-4 rounded-xl font-bold text-lg hover:bg-cyan-500/40 hover:text-white transition-all flex items-center justify-center gap-2"
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
