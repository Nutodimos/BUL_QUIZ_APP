export interface Question {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}
