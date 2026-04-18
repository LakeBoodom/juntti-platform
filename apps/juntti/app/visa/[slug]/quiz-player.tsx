"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcw, Share2 } from "lucide-react";

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
  // picks: questionIndex -> chosenAnswerIndex (null while unanswered)
  const [picks, setPicks] = useState<(number | null)[]>(
    () => Array(total).fill(null),
  );
  const answeredCount = picks.filter((p) => p !== null).length;
  const score = useMemo(
    () =>
      picks.reduce<number>((s, pick, qi) => {
        if (pick === null) return s;
        const correct = questions[qi].answers.findIndex((a) => a.is_correct);
        return s + (pick === correct ? 1 : 0);
      }, 0),
    [picks, questions],
  );
  const allDone = answeredCount === total;

  function pick(qIdx: number, aIdx: number) {
    setPicks((prev) => {
      if (prev[qIdx] !== null) return prev; // lock once answered
      const next = [...prev];
      next[qIdx] = aIdx;
      return next;
    });
    // Scroll to next unanswered question after a short beat
    setTimeout(() => {
      const nextEl = document.getElementById(`q-${qIdx + 1}`);
      if (nextEl) {
        nextEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        const result = document.getElementById("q-result");
        if (result)
          result.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 500);
  }

  // Log the play once when all questions are answered
  const [logged, setLogged] = useState(false);
  useEffect(() => {
    if (allDone && !logged) {
      setLogged(true);
      try {
        fetch("/api/quiz-plays", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            quiz_id: quiz.id,
            platform: quiz.platform,
            score,
            total,
            session_id: getOrCreateSessionId(),
          }),
        });
      } catch {
        // ignored
      }
    }
  }, [allDone, logged, quiz.id, quiz.platform, score, total]);

  async function share() {
    const text = `Sain ${score}/${total} Junttin "${quiz.title}" -visassa`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
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

  function restart() {
    setPicks(Array(total).fill(null));
    setLogged(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const progressPct = (answeredCount / total) * 100;
  const verdict =
    score / total >= 0.8
      ? "🔥 Oikea perussuomalainen"
      : score / total >= 0.6
        ? "💪 Hyvin meni"
        : score / total >= 0.4
          ? "🙂 Ihan kelpo"
          : "📚 Harjoittelua";

  return (
    <div className="quiz-page">
      <div className="quiz-head">
        <div className="quiz-head-eyebrow">
          {quiz.category} · {quiz.difficulty} · {total} kysymystä
        </div>
        <div className="quiz-head-title">
          {quiz.emoji_hint && <span className="mr-2">{quiz.emoji_hint}</span>}
          {quiz.title}
        </div>
      </div>
      <div className="quiz-progress">
        <div
          className="quiz-progress-bar"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {questions.map((q, qi) => {
        const chosen = picks[qi];
        const correctIdx = q.answers.findIndex((a) => a.is_correct);
        const revealed = chosen !== null;
        return (
          <div key={q.id} id={`q-${qi}`} className="q-item">
            <div className="q-item-wrap">
              <div className="q-number">{qi + 1}</div>
              <div className="q-text">{q.question_text}</div>
              <div className="q-answers">
                {q.answers.map((a, ai) => {
                  let cls = "q-ans";
                  if (revealed) {
                    if (ai === correctIdx) cls += " correct";
                    else if (ai === chosen) cls += " wrong";
                    else cls += " muted";
                  }
                  return (
                    <button
                      key={ai}
                      type="button"
                      className={cls}
                      disabled={revealed}
                      onClick={() => pick(qi, ai)}
                    >
                      {a.text}
                    </button>
                  );
                })}
              </div>
              {revealed && q.explanation && (
                <div className="q-explain" style={{ width: "100%" }}>
                  <div className="q-explain-lbl">Tiesithän että…</div>
                  <div className="q-explain-txt">{q.explanation}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div id="q-result" className="q-result">
        {allDone ? (
          <>
            <div className="q-result-score">
              {score}
              <span>/{total}</span>
            </div>
            <div className="q-result-title">{verdict}</div>
            <div className="q-result-sub">
              {Math.round((score / total) * 100)}% oikein
            </div>
            <div className="q-result-actions">
              <button type="button" onClick={share} className="q-btn">
                <Share2 style={{ width: 16, height: 16 }} /> Jaa tulos
              </button>
              <button
                type="button"
                onClick={restart}
                className="q-btn secondary"
              >
                <RotateCcw style={{ width: 16, height: 16 }} /> Uudestaan
              </button>
              <Link href="/" className="q-btn secondary">
                Takaisin etusivulle
              </Link>
            </div>
          </>
        ) : (
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Vastaa kysymyksiin yllä ({answeredCount}/{total} valmiina)
          </div>
        )}
      </div>
    </div>
  );
}
