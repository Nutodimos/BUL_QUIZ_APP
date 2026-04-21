"use client";

import { useState } from "react";
import Quiz, { QuizMode } from "@/components/Quiz";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, LibraryBig, ChevronRight, Timer } from "lucide-react";

function CategorySelector({ onSelect }: { onSelect: (mode: QuizMode) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Choose Your Quiz
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          Select a quiz mode to test your knowledge of Engineering Law (BUL 506)
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Normal Quiz Card */}
        <button
          onClick={() => onSelect("normal")}
          className="group relative bg-card rounded-2xl p-6 sm:p-8 border border-border hover:border-primary/50 transition-all duration-300 text-left hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Normal Quiz</h3>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                52 core questions covering the fundamental topics of Engineering Law. Perfect for quick revision.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                  52 Questions
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                  Untimed
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Extended Quiz Card */}
        <button
          onClick={() => onSelect("extended")}
          className="group relative bg-card rounded-2xl p-6 sm:p-8 border border-border hover:border-amber-500/50 transition-all duration-300 text-left hover:shadow-lg hover:shadow-amber-500/5"
        >
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <LibraryBig className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Extended Quiz</h3>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                112 comprehensive questions including contract law, torts, company law, employment law, and COREN Act. Full exam preparation.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
                  112 Questions
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                  Untimed
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Timed Quiz Card */}
        <button
          onClick={() => onSelect("timed")}
          className="group relative bg-card rounded-2xl p-6 sm:p-8 border border-border hover:border-purple-500/50 transition-all duration-300 text-left hover:shadow-lg hover:shadow-purple-500/5"
        >
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Timer className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Timed Quiz</h3>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                50 random questions with a 20-minute countdown. Simulates real exam conditions to test your speed and accuracy.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium">
                  50 Questions
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium">
                  20 Minutes
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<QuizMode | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            Engineering Law Quiz
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {selectedMode === null ? (
            <CategorySelector key="selector" onSelect={setSelectedMode} />
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Quiz mode={selectedMode} onBack={() => setSelectedMode(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        <p> © Nutodimos {new Date().getFullYear()}. Built for BUL 506 CBT Examination.</p>
      </footer>
    </div>
  );
}
