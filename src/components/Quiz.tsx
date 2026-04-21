"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import normalQuestions from "../../quiz_data_cleaned.json";
import extendedQuestions from "../../bul506_extended_quiz.json";
import { Question } from "@/types";
import { shuffleArray, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, RotateCcw, SkipForward, BookOpen, Trophy, Target, TrendingUp, AlertTriangle, ArrowLeft, Clock } from "lucide-react";

export type QuizMode = "normal" | "extended" | "timed";

const TIMED_QUESTION_COUNT = 50;
const TIMED_DURATION_SECONDS = 20 * 60; // 20 minutes

interface QuizProps {
  mode: QuizMode;
  onBack: () => void;
}

interface ShuffledQuestion extends Question {
  shuffledOptions: string[];
  correctOptionText: string;
}

function getPreparednessData(percentage: number) {
  if (percentage >= 90) {
    return {
      label: "Excellent",
      color: "text-emerald-400",
      bgColor: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/30",
      ringColor: "stroke-emerald-500",
      trackColor: "stroke-emerald-500/15",
      icon: Trophy,
      message: "Outstanding! You have an excellent grasp of Engineering Law. You're well-prepared for the examination.",
    };
  } else if (percentage >= 70) {
    return {
      label: "Good",
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/30",
      ringColor: "stroke-blue-500",
      trackColor: "stroke-blue-500/15",
      icon: Target,
      message: "Great job! You have a solid understanding. Review the topics you missed to push your score even higher.",
    };
  } else if (percentage >= 50) {
    return {
      label: "Fair",
      color: "text-amber-400",
      bgColor: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/30",
      ringColor: "stroke-amber-500",
      trackColor: "stroke-amber-500/15",
      icon: TrendingUp,
      message: "You're getting there! Focus on the areas you struggled with and revisit the lecture notes for better understanding.",
    };
  } else {
    return {
      label: "Needs Improvement",
      color: "text-red-400",
      bgColor: "from-red-500/20 to-red-500/5",
      borderColor: "border-red-500/30",
      ringColor: "stroke-red-500",
      trackColor: "stroke-red-500/15",
      icon: AlertTriangle,
      message: "You need more study time. Go through the lecture notes carefully and retake the quiz to track your improvement.",
    };
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function Quiz({ mode, onBack }: QuizProps) {
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | null>>({});
  const [showReview, setShowReview] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMED_DURATION_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isTimed = mode === "timed";

  const selectedAnswer = userAnswers[currentIndex] || null;
  const score = React.useMemo(() => {
    return questions.reduce((acc, q, idx) => {
      return acc + (userAnswers[idx] === q.correctOptionText ? 1 : 0);
    }, 0);
  }, [userAnswers, questions]);

  // Finish handler (stable ref for timer callback)
  const finishQuiz = useCallback(() => {
    setIsFinished(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize questions based on mode
  useEffect(() => {
    setIsMounted(true);

    // Build the full pool of questions
    const allQuestions: Question[] = [
      ...(normalQuestions as Question[]),
      ...(extendedQuestions as Question[]),
    ];

    let sourceQuestions: Question[];
    if (mode === "timed") {
      // Timed: pick 50 random from the full pool
      const shuffled = shuffleArray([...allQuestions]);
      sourceQuestions = shuffled.slice(0, TIMED_QUESTION_COUNT);
    } else if (mode === "extended") {
      sourceQuestions = [...allQuestions];
    } else {
      sourceQuestions = [...(normalQuestions as Question[])];
    }

    // Load custom questions (not for timed mode to keep it fair at 50)
    if (mode !== "timed") {
      const customQuestionsStr = localStorage.getItem("customQuestions");
      if (customQuestionsStr) {
        try {
          const customQs = JSON.parse(customQuestionsStr) as Question[];
          sourceQuestions = [...sourceQuestions, ...customQs];
        } catch (e) {
          console.error("Failed to parse custom questions", e);
        }
      }
    }

    // Shuffle all questions
    const shuffledBaseQuestions = shuffleArray([...sourceQuestions]);

    // Prepare questions with shuffled options
    const preparedQuestions: ShuffledQuestion[] = shuffledBaseQuestions.map((q) => {
      const correctOptionText = q.options[q.correctAnswer];
      return {
        ...q,
        correctOptionText,
        shuffledOptions: shuffleArray([...q.options]),
      };
    });

    setQuestions(preparedQuestions);

    // Start timer for timed mode
    if (mode === "timed") {
      setTimeLeft(TIMED_DURATION_SECONDS);
      setTimedOut(false);
    }
  }, [mode]);

  // Timer countdown
  useEffect(() => {
    if (!isTimed || isFinished || !isMounted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimedOut(true);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimed, isFinished, isMounted, finishQuiz]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer && !isTimed) return;
    
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (!userAnswers[currentIndex]) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentIndex]: null,
      }));
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const resetQuiz = () => {
    // For timed mode, re-pick 50 random questions
    if (mode === "timed") {
      const allQuestions: Question[] = [
        ...(normalQuestions as Question[]),
        ...(extendedQuestions as Question[]),
      ];
      const shuffled = shuffleArray([...allQuestions]);
      const picked = shuffled.slice(0, TIMED_QUESTION_COUNT);
      const preparedQuestions: ShuffledQuestion[] = shuffleArray(picked).map((q) => {
        const correctOptionText = q.options[q.correctAnswer];
        return {
          ...q,
          correctOptionText,
          shuffledOptions: shuffleArray([...q.options]),
        };
      });
      setQuestions(preparedQuestions);
      setTimeLeft(TIMED_DURATION_SECONDS);
      setTimedOut(false);
    } else {
      const reshuffledQuestions = shuffleArray(questions.map(q => ({
        ...q,
        shuffledOptions: shuffleArray([...q.options])
      })));
      setQuestions(reshuffledQuestions);
    }

    setCurrentIndex(0);
    setUserAnswers({});
    setShowReview(false);
    setIsFinished(false);
  };

  if (!isMounted || questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isFinished && showReview) {
    return (
      <div className="max-w-3xl mx-auto pb-10">
        <div className="flex items-center justify-between mb-8 sticky top-20 z-40 bg-background/80 backdrop-blur-md py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReview(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Results
            </button>
          </div>
          <h2 className="text-xl font-bold">Review Answers</h2>
          <div className="text-sm font-medium text-primary">
            Score: {score}/{questions.length}
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userAnswer = userAnswers[idx];
            const isCorrect = userAnswer === q.correctOptionText;
            const wasSkipped = userAnswer === null;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <h4 className="text-lg font-semibold leading-tight">{q.question}</h4>
                </div>

                <div className="space-y-3 pl-12">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 mb-4">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct
                      </span>
                    ) : wasSkipped ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
                        <SkipForward className="w-3.5 h-3.5" />
                        Skipped
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {/* User's Choice */}
                    {!wasSkipped && (
                      <div className={cn(
                        "p-4 rounded-xl border-2 flex items-center justify-between gap-4",
                        isCorrect
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-300"
                          : "bg-red-500/5 border-red-500/20 text-red-900 dark:text-red-300"
                      )}>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Your Selection</span>
                          <span className="font-medium">{userAnswer}</span>
                        </div>
                        {isCorrect ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
                      </div>
                    )}

                    {/* Correct Answer (if wrong or skipped) */}
                    {!isCorrect && (
                      <div className="p-4 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-300">
                        <span className="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Correct Answer</span>
                        <span className="font-medium">{q.correctOptionText}</span>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-6 p-5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Educational Principle</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => setShowReview(false)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Summary
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const prep = getPreparednessData(percentage);
    const PrepIcon = prep.icon;
    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (percentage / 100) * circumference;
    const timeUsed = TIMED_DURATION_SECONDS - timeLeft;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Main Results Card */}
        <div className={cn(
          "rounded-3xl p-8 sm:p-10 bg-gradient-to-b border shadow-xl text-center",
          prep.bgColor,
          prep.borderColor
        )}>
          {/* Timed Out Banner */}
          {isTimed && timedOut && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium"
            >
              <Clock className="w-4 h-4" />
              Time&apos;s Up!
            </motion.div>
          )}

          {/* Circular Progress */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                strokeWidth="8"
                className={prep.trackColor}
              />
              <motion.circle
                cx="60" cy="60" r="54"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={prep.ringColor}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className={cn("text-4xl font-black", prep.color)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
              >
                {percentage}%
              </motion.span>
            </div>
          </div>

          {/* Preparedness Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border mb-4", prep.borderColor)}>
              <PrepIcon className={cn("w-5 h-5", prep.color)} />
              <span className={cn("font-bold text-lg", prep.color)}>{prep.label}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Quiz Completed!</h2>
            <p className="text-muted-foreground text-sm">
              You scored <span className="font-semibold text-foreground">{score}</span> out of <span className="font-semibold text-foreground">{questions.length}</span> questions
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className={cn("grid gap-3 mb-6", isTimed ? "grid-cols-4" : "grid-cols-3")}
          >
            <div className="bg-background/60 backdrop-blur-sm rounded-xl p-3 border border-border/50">
              <div className="text-2xl font-bold text-emerald-400">{score}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="bg-background/60 backdrop-blur-sm rounded-xl p-3 border border-border/50">
              <div className="text-2xl font-bold text-red-400">{questions.length - score}</div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="bg-background/60 backdrop-blur-sm rounded-xl p-3 border border-border/50">
              <div className="text-2xl font-bold text-foreground">{questions.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            {isTimed && (
              <div className="bg-background/60 backdrop-blur-sm rounded-xl p-3 border border-border/50">
                <div className="text-2xl font-bold text-purple-400">{formatTime(timeUsed)}</div>
                <div className="text-xs text-muted-foreground">Time Used</div>
              </div>
            )}
          </motion.div>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed"
          >
            {prep.message}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-muted-foreground hover:bg-secondary transition-all border border-border/50"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Menu
            </button>
            <button
              onClick={() => setShowReview(true)}
              className="inline-flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-xl font-medium hover:bg-secondary/80 transition-all border border-border/50"
            >
              <BookOpen className="w-5 h-5" />
              Review Answers
            </button>
            <button
              onClick={resetQuiz}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

 

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const modeLabel = mode === "extended" ? "Extended Quiz" : mode === "timed" ? "Timed Quiz" : "Normal Quiz";

  // Timer color based on remaining time
  const timerColor = timeLeft <= 60
    ? "text-red-500 bg-red-500/10 border-red-500/30"
    : timeLeft <= 300
      ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
      : "text-foreground bg-secondary/50 border-border/50";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with Back Button and Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm font-medium text-primary">
              {modeLabel}
            </span>
          </div>

          {/* Timer Display */}
          {isTimed && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-sm font-bold transition-colors",
              timerColor
            )}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="flex justify-between text-sm font-medium text-muted-foreground mb-3">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card rounded-3xl p-6 sm:p-10 shadow-sm border border-border"
        >
          <h3 className="text-2xl sm:text-3xl font-semibold leading-tight mb-8">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4">
            {currentQuestion.shuffledOptions.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctOptionText;

              let optionStateClass = "bg-secondary/50 hover:bg-secondary border-transparent";
              if (selectedAnswer) {
                if (isTimed) {
                  // In Timed Mode, only show the selected state without revealing correctness
                  if (isSelected) {
                    optionStateClass = "bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400";
                  } else {
                    optionStateClass = "opacity-50 border-transparent bg-secondary/50";
                  }
                } else if (isCorrect) {
                  optionStateClass = "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400";
                } else if (isSelected && !isCorrect) {
                  optionStateClass = "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400";
                } else {
                  optionStateClass = "opacity-50 border-transparent bg-secondary/50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={!!selectedAnswer}
                  className={cn(
                    "w-full text-left p-5 rounded-xl border-2 transition-all duration-200",
                    "flex items-center justify-between gap-4 group",
                    optionStateClass
                  )}
                >
                  <span className="text-lg">{option}</span>
                  {!isTimed && selectedAnswer && isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  )}
                  {!isTimed && selectedAnswer && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                  )}
                  {isTimed && selectedAnswer && isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box — hidden in timed mode to keep pace */}
          {!isTimed && (
            <AnimatePresence>
              {selectedAnswer && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-400 mb-1.5">Explanation</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <div className="mt-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isTimed && (
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors border border-transparent",
                    currentIndex === 0 ? "opacity-50 cursor-not-allowed text-muted-foreground" : "text-muted-foreground border-border/50 hover:bg-secondary text-foreground"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Prev
                </button>
              )}
              {!selectedAnswer ? (
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip
                </button>
              ) : (
                <div /> // Spacer
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedAnswer && !isTimed}
              className={cn(
                "flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all",
                selectedAnswer || isTimed
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              {currentIndex === questions.length - 1 ? "Finish" : "Next"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Timed Mode Question Tracker */}
      {isTimed && !isFinished && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-card rounded-3xl p-6 border border-border shadow-sm"
        >
          <h4 className="text-sm font-semibold mb-4 text-muted-foreground px-2">Question Tracker</h4>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const answered = !!userAnswers[idx];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all shadow-sm",
                    isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent" : "",
                    answered 
                      ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" 
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-border/50"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
