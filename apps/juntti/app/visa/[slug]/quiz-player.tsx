"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, Share2, RotateCcw } from "lucide-react";

type Quiz = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  difficulty: string;
  emoji_hint: string | null;
  platform: string;
};

type Question = {
  id: string;
  question_text: string;
  answers: { text: string; is_correct: boolean }[];
  explanation: string | null;
};

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "juntti-session-id";
  let v = localStorage.getItem(key);
  if (!v) {
    v = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, v);
  }
  return v;
}

export function QuizPlayer({
  quiz,
  questions,
}: {
  quiz: Quiz;
  questions: Question[];
}) {
  const total = questions.length;
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [logged, setLogged] = useState(false);

  const q = questions[current];
  const correctIndex = useMemo(
    () => q?.answers.findIndex((a) => a.is_correct) ?? 0,
    [q],
  );

  function pick(idx: number) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === correctIndex) setScore((s) => s + 1);
  }

  async function next() {
    if (current + 1 < total) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setDone(true);
      // Fire-and-forget analytics
      if (!logged) {
        setLogged(true);
        try {
          fetch("/api/quiz-plays", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              quiz_id: quiz.id,
              platform: quiz.platform,
              score: score + (selected === correctIndex ? 0 : 0),
              total,
              session_id: getOrCreateSessionId(),
            }),
          });
        } catch {
          // swallow
        }
      }
    }
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
    setLogged(false);
  }

  async function share() {
    const text = `Sain ${score}/${total} Junttin "${quiz.title}" -visassa`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: quiz.title, text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert("Linkki kopioitu leikepöydälle");
    } catch {}
  }

  if (done) {
    const percent = Math.round((score / total) * 100);
    const verdict =
      percent >= 80
        ? "Huippu!"
        : percent >= 60
          ? "Hyvin meni"
          : percent >= 40
            ? "Ihan kelpo"
            : "Harjoittelua";
    return (
      <section className="mt-4 space-y-6">
        <div className="rounded-2xl bg-ink p-6 text-center text-white">
          <p className="text-sm uppercase tracking-wide text-white/60">
            {quiz.title}
          </p>
          <p className="mt-4 text-5xl font-extrabold">
            {score}/{total}
          </p>
          <p className="mt-2 text-xl font-semibold text-accent">{verdict}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={share}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white"
          >
            <Share2 className="h-4 w-4" /> Jaa tulos
          </button>
          <button
            onClick={restart}
            className="flex items-center justify-center gap-2 rounded-xl border border-ink/10 px-4 py-3 text-sm font-semibold text-ink"
          >
            <RotateCcw className="h-4 w-4" /> Uudestaan
          </button>
        </div>

        <Link
          href="/"
          className="block text-center text-sm text-ink-muted underline"
        >
          Takaisin etusivulle
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-4">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {quiz.category} · {quiz.difficulty}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold leading-tight">{quiz.title}</h1>
      </div>

      <div className="mb-4 h-1.5 w-full rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${((current + (revealed ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
        Kysymys {current + 1} / {total}
      </p>
      <h2 className="mb-4 text-xl font-semibold leading-snug">
        {q.question_text}
      </h2>

      <div className="space-y-2">
        {q.answers.map((a, i) => {
          const isCorrect = i === correctIndex;
          const isChosen = i === selected;
          const cls = revealed
            ? isCorrect
              ? "border-green-500 bg-green-50 text-green-900"
              : isChosen
                ? "border-red-400 bg-red-50 text-red-900"
                : "border-ink/10 bg-white text-ink-muted"
            : "border-ink/10 bg-white hover:border-brand active:bg-brand-soft";
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={revealed}
              className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-base transition ${cls}`}
            >
              <span>{a.text}</span>
              {revealed && isCorrect && <Check className="h-5 w-5" />}
              {revealed && isChosen && !isCorrect && <X className="h-5 w-5" />}
            </button>
          );
        })}
      </div>

      {revealed && q.explanation && (
        <p className="mt-4 rounded-xl bg-ink/5 p-3 text-sm text-ink-muted">
          <strong className="text-ink">Selitys.</strong> {q.explanation}
        </p>
      )}

      {revealed && (
        <button
          onClick={next}
          className="mt-6 w-full rounded-xl bg-ink px-4 py-3 text-base font-semibold text-white"
        >
          {current + 1 < total ? "Seuraava kysymys →" : "Näytä tulos"}
        </button>
      )}
    </section>
  );
}
