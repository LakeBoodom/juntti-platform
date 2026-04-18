// Shared types for AI-generated content. Mirrors the Supabase schema
// constraints from supabase/migrations/001_initial_schema.sql.

export type Platform = "juntti" | "tietovisa" | "both";
export type Difficulty = "helppo" | "keski" | "vaikea";
export type TargetAge = "30-50" | "50-70" | "kaikki";
export type Tone = "rento" | "humoristinen" | "asiallinen" | "nostalginen";

export type Answer = {
  text: string;
  is_correct: boolean;
};

export type GeneratedQuestion = {
  question_text: string;
  answers: Answer[]; // 4 answers, exactly one with is_correct = true
  explanation: string;
};

export type GeneratedQuiz = {
  title: string;
  description: string;
  slug: string;
  emoji_hint: string; // short icon hint, e.g. "🎵" or "trophy"
  questions: GeneratedQuestion[];
};

export type GenerateQuizInput = {
  topic: string; // free-text subject
  category: string; // e.g. "musiikki", "urheilu", "historia"
  difficulty: Difficulty;
  questionCount: number; // 5 or 10 (capped 3–15)
  tone: Tone;
  platform: Platform; // usually "juntti" or "tietovisa"
  targetAge?: TargetAge;
};
