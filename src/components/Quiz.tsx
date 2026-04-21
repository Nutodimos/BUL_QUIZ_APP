"use client";

import React, { useState, useEffect, useMemo } from "react";
import baseQuestions from "../../quiz_data_cleaned.json";
import { Question } from "@/types";
import { shuffleArray, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, SkipForward, BookOpen, Trophy, Target, TrendingUp, AlertTriangle } from "lucide-react";

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
      message: "Outstanding! You have an excellent grasp of Engineering Law. You're well-prepared for any examination.",
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

export default function Quiz() {
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize questions
  useEffect(() => {
    setIsMounted(true);
    // Load custom questions
    const customQuestionsStr = localStorage.getItem("customQuestions");
    let allQuestions = [...baseQuestions] as Question[];
    
    if (customQuestionsStr) {
      try {
        const customQs = JSON.parse(customQuestionsStr) as Question[];
        allQuestions = [...allQuestions, ...customQs];
      } catch (e) {
        console.error("Failed to parse custom questions", e);
      }
    }

    // Prepare questions with shuffled options
    const preparedQuestions: ShuffledQuestion[] = allQuestions.map((q) => {
      const correctOptionText = q.options[q.correctAnswer];
      return {
        ...q,
        correctOptionText,
        shuffledOptions: shuffleArray([...q.options]),
      };
    });

    setQuestions(preparedQuestions);
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return; // Prevent multiple selections
    setSelectedAnswer(option);

    if (option === currentQuestion.correctOptionText) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      // Skipped questions do not add to score
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    // Optionally reshuffle here
    const reshuffled = questions.map(q => ({
      ...q,
      shuffledOptions: shuffleArray([...q.options])
    }));
    setQuestions(reshuffled);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
  };

  if (!isMounted || questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const prep = getPreparednessData(percentage);
    const PrepIcon = prep.icon;
    const circumference = 2 * Math.PI * 54; // radius = 54
    const dashOffset = circumference - (percentage / 100) * circumference;

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
            className="grid grid-cols-3 gap-3 mb-6"
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

          {/* Retake Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            onClick={resetQuiz}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Quiz
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
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
                if (isCorrect) {
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
                  {selectedAnswer && isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  )}
                  {selectedAnswer && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
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

          <div className="mt-10 flex items-center justify-between">
            {!selectedAnswer ? (
              <button
                onClick={handleSkip}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
              <SkipForward className="w-5 h-5" />
              Skip Question
              </button>
            ) : (
              <div /> // Spacer
            )}
            
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={cn(
                "flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all",
                selectedAnswer
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
