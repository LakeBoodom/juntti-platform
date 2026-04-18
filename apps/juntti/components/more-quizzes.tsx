"use client";

import { useState } from "react";
import Link from "next/link";
import type { QuizSummary } from "@/lib/queries";
import { Shuffle } from "lucide-react";

export function MoreQuizzes({ pool }: { pool: QuizSummary[] }) {
  const [idx, setIdx] = useState(0);
  if (!pool.length) return null;
  const q = pool[idx % pool.length];

  function shuffle() {
    if (pool.length < 2) return;
    let next = idx;
    while (next === idx) {
      next = Math.floor(Math.random() * pool.length);
    }
    setIdx(next);
  }

  return (
    <div className="section">
      <div className="section-title">🎲 Haluatko pelata vielä lisää?</div>
      <div className="more-block">
        <div className="more-eyebrow">Arvottu juuri sinulle</div>
        <div className="more-title">{q.title}</div>
        <Link href={`/visa/${q.slug}`} className="more-pick">
          <div className="more-pick-emoji">{q.emoji_hint || "🎯"}</div>
          <div className="more-pick-info">
            <div className="more-pick-t">{q.title}</div>
            <div className="more-pick-sub">
              {q.category} · {q.difficulty} · {q.question_count} kysymystä
            </div>
          </div>
        </Link>
        <div className="more-actions">
          <Link href={`/visa/${q.slug}`} className="more-btn">
            Pelaa nyt →
          </Link>
          <button
            type="button"
            className="more-btn secondary"
            onClick={shuffle}
            disabled={pool.length < 2}
          >
            <Shuffle
              className="mr-1.5 inline-block"
              style={{ width: 14, height: 14, marginRight: 6 }}
            />
            Arvo uusi
          </button>
        </div>
      </div>
    </div>
  );
}
