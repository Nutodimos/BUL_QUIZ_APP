"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Check, AlertCircle } from "lucide-react";
import { Question } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AddQuestion() {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      setStatus("error");
      setErrorMsg("Question text is required.");
      return;
    }

    if (options.some((opt) => !opt.trim())) {
      setStatus("error");
      setErrorMsg("All options must be filled.");
      return;
    }

    try {
      const newQuestion: Question = {
        id: "custom-" + Date.now(),
        question: questionText.trim(),
        // IMPORTANT: According to DEVELOPMENT_PROCESS, the backend expects correctAnswer to always be 0.
        // So we restructure the array such that the correct answer is at index 0.
        options: [
          options[correctAnswerIndex].trim(),
          ...options.filter((_, idx) => idx !== correctAnswerIndex).map(o => o.trim())
        ],
        correctAnswer: 0,
      };

      const existingStr = localStorage.getItem("customQuestions");
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem("customQuestions", JSON.stringify([...existing, newQuestion]));

      setStatus("success");
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswerIndex(0);

      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMsg("Failed to save the question.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Add New Question
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <div className="bg-card rounded-3xl p-6 sm:p-10 shadow-sm border border-border">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Status Message */}
            {status === "success" && (
              <div className="bg-green-500/10 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center gap-2 border border-green-500/20">
                <Check className="w-5 h-5 shrink-0" />
                <p className="font-medium">Question saved successfully!</p>
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-500/10 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-2 border border-red-500/20">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-medium">{errorMsg}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="question">
                Question Text
              </label>
              <textarea
                id="question"
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:border-primary/50 transition-colors bg-transparent"
                placeholder="Enter the question..."
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold">Options</label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3 w-full">
                    <input
                      type="radio"
                      id={`correct-${idx}`}
                      name="correctAnswer"
                      checked={correctAnswerIndex === idx}
                      onChange={() => setCorrectAnswerIndex(idx)}
                      className="w-5 h-5 text-primary bg-secondary border-border focus:ring-primary transition-all"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-colors bg-transparent ${
                          correctAnswerIndex === idx ? 'border-primary/50 bg-primary/5' : 'border-border bg-secondary/30 hover:border-border/80'
                        }`}
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">
                Select the radio button next to the correct answer.
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-medium p-4 rounded-xl hover:bg-primary/90 shadow-md transition-all flex justify-center items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Save Question to Device
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
