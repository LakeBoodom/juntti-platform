"use client";
// TIETONIEKKA 2.0 — Klassinen pelikuoressa 1c "Täysi lava" (Heikki vahvisti C 2026-07-31)
// Kysymys on näkymän isoin asia · vastaukset täysleveinä nauhoina · kokoelmaväri
// johtaa · palaute värillä + merkillä · ei tyhjää alalaitaa.
// Mekaniikka identtinen tuotannon kanssa: 100 p + striikkibonus 50/porras,
// Oljenkorsi poistaa 2 väärää (kerran/visa), quiz_plays-tallennus, Putki
// (tn_paivan_visa_putki) päivittyy vain Päivän sankarista. Ei ajastinta (v1).

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { getSupabase } from "../../../lib/supabase";

const BASE_POINTS = 100;
const STREAK_BONUS = 50;

export type GameQuiz = {
  id: string;
  title: string;
  teaser: string | null;
  collectionLabel: string;
  genreLabel: string | null;
  hubHref: string;
  accent: string;
  isSankari: boolean;
  questions: Array<{ question: string; options: string[]; correct: string; fact: string | null }>;
  related: Array<{ id: string; title: string }>;
};

function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Sama putkilogiikka kuin tuotannon pelissä (tn_paivan_visa_putki). */
function updateDailyStreak(): number {
  try {
    const KEY = "tn_paivan_visa_putki";
    const today = localDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yd = localDate(yesterday);
    const raw = window.localStorage.getItem(KEY);
    let count = 1;
    if (raw) {
      const prev = JSON.parse(raw) as { count: number; last: string };
      if (prev.last === today) return prev.count; // sama päivä ei kasvata putkea
      count = prev.last === yd ? prev.count + 1 : 1;
    }
    window.localStorage.setItem(KEY, JSON.stringify({ count, last: today }));
    return count;
  } catch {
    return 0;
  }
}

function getOrCreateSessionId(): string {
  try {
    let id = window.localStorage.getItem("tn_session_id");
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem("tn_session_id", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

function resultTier(correct: number, total: number) {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 1) return { emoji: "🏆", heading: "Täydellinen!", blurb: "Täydet pisteet — todellinen tietoniekka!" };
  if (pct >= 0.8) return { emoji: "🏆", heading: "Hienoa, niekka!", blurb: "Vahva suoritus!" };
  if (pct >= 0.6) return { emoji: "👏", heading: "Ihan kelpo!", blurb: "Hyvä pohja — vielä vähän hiomista." };
  if (pct >= 0.4) return { emoji: "🙂", heading: "Eipä hullummin", blurb: "Tästä on hyvä parantaa." };
  if (pct >= 0.2) return { emoji: "😞", heading: "Nyt takkusi", blurb: "Ei hätää — uusi yritys auttaa." };
  return { emoji: "😭", heading: "Lisää harjoittelua vaan", blurb: "Uusi yritys auttaa." };
}

export default function GameClient({ quiz }: { quiz: GameQuiz }) {
  const total = quiz.questions.length;
  const [phase, setPhase] = useState<"intro" | "play" | "end">("intro");
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [oljenkorsiUsed, setOljenkorsiUsed] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(0);
  const recorded = useRef(false);

  const q = quiz.questions[idx];
  const answered = picked !== null;
  // Sama maksimikaava kuin tuotannossa (TIME_BONUS = 0)
  const maxScore = total * BASE_POINTS + ((total * (total - 1)) / 2) * STREAK_BONUS;

  function pick(option: string) {
    if (answered) return;
    setPicked(option);
    if (option === q.correct) {
      const ns = streak + 1;
      const gained = BASE_POINTS + (ns > 1 ? (ns - 1) * STREAK_BONUS : 0);
      setStreak(ns);
      setScore((s) => s + gained);
      setCorrectCount((c) => c + 1);
      try {
        confetti({ particleCount: 50, spread: 65, startVelocity: 32, origin: { x: 0.5, y: 0.55 }, colors: [quiz.accent, "#B6FF3C", "#F5F0E6"] });
      } catch { /* no-op */ }
    } else {
      setStreak(0);
    }
  }

  function oljenkorsi() {
    if (oljenkorsiUsed || answered) return;
    const wrong = q.options.filter((o) => o !== q.correct);
    if (wrong.length < 2) return;
    const shuffled = [...wrong].sort(() => Math.random() - 0.5);
    setHidden(new Set(shuffled.slice(0, 2)));
    setOljenkorsiUsed(true);
  }

  function next() {
    if (idx >= total - 1) {
      endGame();
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
      setHidden(new Set());
    }
  }

  async function recordPlay(finalScore: number) {
    if (recorded.current) return;
    recorded.current = true;
    try {
      const sb = getSupabase();
      if (!sb) return;
      await sb.from("quiz_plays").insert({
        id: crypto.randomUUID(),
        quiz_id: quiz.id,
        platform: "tietoniekka",
        score: finalScore,
        total: maxScore,
        session_id: getOrCreateSessionId(),
        shared: false,
      });
    } catch { /* best-effort */ }
  }

  function endGame() {
    setPhase("end");
    void recordPlay(score);
    if (quiz.isSankari) {
      const s = updateDailyStreak();
      if (s > 0) setDailyStreak(s);
    }
    if (total > 0 && correctCount / total >= 0.8) {
      try {
        confetti({ particleCount: 90, spread: 100, origin: { x: 0.5, y: 0.4 }, colors: [quiz.accent, "#B6FF3C", "#E8A320"] });
      } catch { /* no-op */ }
    }
  }

  function restart() {
    setPhase("play");
    setIdx(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setPicked(null);
    setHidden(new Set());
    setOljenkorsiUsed(false);
    recorded.current = false;
  }

  async function share() {
    const text = `Sain ${correctCount}/${total} oikein Tietoniekan visassa "${quiz.title}" — pystytkö parempaan?`;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("Linkki kopioitu!");
      }
    } catch { /* peruttu */ }
  }

  useEffect(() => {
    // Näppäimistö: A–D valitsee, Enter jatkaa
    function onKey(e: KeyboardEvent) {
      if (phase !== "play") return;
      const i = ["a", "b", "c", "d"].indexOf(e.key.toLowerCase());
      if (i >= 0 && q.options[i] && !hidden.has(q.options[i])) pick(q.options[i]);
      if (e.key === "Enter" && answered) next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const shellStyle = { ["--tn-game-accent" as string]: quiz.accent };
  const letters = ["A", "B", "C", "D"];

  /* ─── Aloitus ─── */
  if (phase === "intro") {
    return (
      <main className="tn-game" style={shellStyle}>
        <div className="tn-game-segs">{Array.from({ length: total }, (_, i) => <i key={i} />)}</div>
        <Header quiz={quiz} right={`${total} kysymystä`} />
        <div className="tn-game-center">
          <span className="tn-eyebrow" style={{ color: quiz.accent }}>{quiz.collectionLabel}{quiz.genreLabel ? ` · ${quiz.genreLabel}` : ""}</span>
          <h1 className="tn-display" style={{ fontSize: "clamp(34px, 7vw, 64px)", lineHeight: 0.94, margin: "14px 0 12px", maxWidth: "18ch" }}>
            {quiz.title}
          </h1>
          {quiz.teaser && <p style={{ color: "var(--tn-text-soft)", fontSize: 15, maxWidth: "44ch", margin: "0 0 22px" }}>{quiz.teaser}</p>}
          <button className="tn-game-next" style={{ alignSelf: "flex-start", padding: "15px 30px", fontSize: 16 }} onClick={() => setPhase("play")}>
            Aloita visa →
          </button>
        </div>
        <div className="tn-game-foot">
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#5F594C" }}>🌾 Oljenkorsi käytettävissä kerran · ei kirjautumista</span>
          <a href={quiz.hubHref} style={{ fontSize: 11.5, fontWeight: 700, color: "#8E8676", textDecoration: "none" }}>Takaisin kokoelmaan</a>
        </div>
      </main>
    );
  }

  /* ─── Tulos ─── */
  if (phase === "end") {
    const tier = resultTier(correctCount, total);
    return (
      <main className="tn-game" style={shellStyle}>
        <div className="tn-game-segs">{Array.from({ length: total }, (_, i) => <i key={i} data-on="true" />)}</div>
        <Header quiz={quiz} right={`Pisteet ${score}`} />
        <div className="tn-game-center">
          <span className="tn-eyebrow" style={{ color: quiz.accent }}>Tulos · {quiz.title}</span>
          <h1 className="tn-display" style={{ fontSize: "clamp(30px, 6vw, 54px)", margin: "14px 0 4px" }}>
            {tier.emoji} {tier.heading}
          </h1>
          <div className="tn-game-bigscore">{correctCount}/{total}</div>
          <p style={{ color: "var(--tn-text-soft)", margin: "10px 0 0" }}>
            {score} pistettä{tier.blurb ? ` · ${tier.blurb}` : ""}
            {quiz.isSankari && dailyStreak > 0 && <> · 🔥 {dailyStreak} päivän putki</>}
          </p>

          <div className="tn-game-crosslinks">
            <a href="#" onClick={(e) => { e.preventDefault(); restart(); }}>
              <span className="tn-cross-tag">Uudestaan</span>Pelaa sama visa uudestaan
            </a>
            {quiz.related.map((r) => (
              <a key={r.id} href={`/2-0/peli?quiz_id=${r.id}`}>
                <span className="tn-cross-tag">Sama teema</span>{r.title}
              </a>
            ))}
            <a href={quiz.hubHref}>
              <span className="tn-cross-tag">Kokoelma</span>Selaa: {quiz.collectionLabel}
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); void share(); }}>
              <span className="tn-cross-tag">Haasta</span>Haasta kaveri — jaa tulos
            </a>
          </div>
        </div>
      </main>
    );
  }

  /* ─── Peli ─── */
  return (
    <main className="tn-game" style={shellStyle}>
      <div className="tn-game-segs">
        {Array.from({ length: total }, (_, i) => (
          <i key={i} data-on={i < idx + (answered ? 1 : 0)} />
        ))}
      </div>
      <Header quiz={quiz} right={<>Pisteet <b style={{ color: "var(--tn-text)" }}>{score}</b>{streak >= 2 ? <> · 🔥 {streak}</> : null}</>} />
      <div className="tn-game-q">
        <h1>{q.question}</h1>
        <div className="tn-game-sub">
          Kysymys {idx + 1} / {total}
          {quiz.genreLabel ? ` · ${quiz.genreLabel.toLowerCase()}` : ""}
        </div>
      </div>
      <div className="tn-game-bands">
        {q.options.map((opt, i) => {
          let state: string | undefined;
          if (answered) {
            if (opt === q.correct) state = "correct";
            else if (opt === picked) state = "wrong";
            else state = "dim";
          }
          return (
            <button
              key={opt + i}
              className="tn-band"
              data-state={state}
              data-hidden={!answered && hidden.has(opt)}
              disabled={answered || hidden.has(opt)}
              onClick={() => pick(opt)}
            >
              <span className="tn-band-k">{letters[i]}</span>
              <span className="tn-band-label">{opt}</span>
              <span className="tn-band-mark">
                {state === "correct" ? "✓" : state === "wrong" ? "✕" : ""}
              </span>
            </button>
          );
        })}
        <div style={{ borderTop: "1px solid #241E13" }} />
      </div>
      {answered && q.fact && (
        <div className="tn-game-fact">
          <b>Tiesitkö?</b>
          <p>{q.fact}</p>
        </div>
      )}
      <div className="tn-game-foot">
        <button className="tn-game-lifeline" onClick={oljenkorsi} disabled={oljenkorsiUsed || answered}>
          🌾 Oljenkorsi {oljenkorsiUsed ? "· käytetty" : "· poista 2 väärää"}
        </button>
        {answered && (
          <button className="tn-game-next" onClick={next}>
            {idx >= total - 1 ? "Näytä tulos →" : "Seuraava →"}
          </button>
        )}
      </div>
    </main>
  );
}

function Header({ quiz, right }: { quiz: GameQuiz; right: React.ReactNode }) {
  return (
    <div className="tn-game-top">
      <span>
        <a href="/2-0"><b style={{ color: "var(--tn-gold)" }}>TIETO</b><b style={{ color: "var(--tn-text)" }}>NIEKKA</b></a>
        <span style={{ color: "#3A3122", margin: "0 7px" }}>/</span>
        <a href={quiz.hubHref} style={{ color: "var(--tn-game-accent)" }}>{quiz.collectionLabel}</a>
      </span>
      <span>{right}</span>
    </div>
  );
}
