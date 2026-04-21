import Quiz from "@/components/Quiz";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
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
        <Quiz />
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        <p> © Nutodimos. Built for BUL 506 CBT Examination.</p>
      </footer>
    </div>
  );
}
