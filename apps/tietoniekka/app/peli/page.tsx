"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { resolveQuiz, type QuizConfig, type Question } from "./questions";

/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — Pelinäkymä
   Yksi reitti joka palvelee kaikki etusivun CTA-polut:
   - ?paivan_visa=1 / ?paivan_sankari=1
   - ?event=vappu|jaakiekko_mm|euroviisut
   - ?kat=urheilu|maantieto|...
   - ?kuvavisa=liput|paikkakunta|logot|vaakuna
   - ?random=1
   - lisäksi &first=A|B|C|D esivalitsee ensimmäisen vastauksen
   ───────────────────────────────────────────────────────────────── */

const TIME_PER_Q = 20;
const BASE_POINTS = 200;
const TIME_BONUS = 100;
const STREAK_BONUS = 50;

type Phase = "intro" | "playing" | "end";

function PeliInner() {
  const searchParams = useSearchParams();
  const [quiz, setQuiz] = useState<QuizConfig | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakBump, setStreakBump] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [showFact, setShowFact] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [displayedScore, setDisplayedScore] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* ─── Quiz resolve + first-answer pre-select ─────────────── */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const q = resolveQuiz(params);
    setQuiz(q);
  }, [searchParams]);

  const startGame = useCallback(() => {
    if (!quiz) return;
    soundClick();
    setPhase("playing");
    setIdx(0);
    setScore(0);
    setDisplayedScore(0);
    setStreak(0);
    setAnswered(false);
    setChosen(null);
    setShowFact(false);
    setShowNext(false);
    setTimeLeft(TIME_PER_Q);
    // first-answer pre-select via URL — toimii vain ensimmäiseen kysymykseen
    const first = searchParams.get("first");
    if (first && ["A", "B", "C", "D"].includes(first)) {
      // Anneta DOM:n renderöityä ensin
      setTimeout(() => {
        const btn = optionRefs.current[["A", "B", "C", "D"].indexOf(first)];
        if (btn) btn.click();
      }, 200);
    }
  }, [quiz, searchParams]);

  /* ─── Kun phase = playing ja idx muuttuu, lataa kysymys ─── */
  useEffect(() => {
    if (phase !== "playing" || !quiz) return;
    setAnswered(false);
    setChosen(null);
    setTimeLeft(TIME_PER_Q);
    setShowFact(false);
    setShowNext(false);
  }, [phase, idx, quiz]);

  /* ─── Ajastin ─────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== "playing" || answered) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          timeOut();
          return 0;
        }
        if (t === 6) soundTick();
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, answered]);

  /* ─── Score count-up animation ────────────────────────────── */
  useEffect(() => {
    if (displayedScore === score) return;
    const start = displayedScore;
    const delta = score - start;
    const duration = 700;
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayedScore(Math.round(start + delta * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  /* ─── Helpers — sound + vibration ─────────────────────────── */
  function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  }
  function playTone(freq: number, dur = 0.12, type: OscillatorType = "sine", vol = 0.08) {
    if (!soundOn) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {/* no-op */}
  }
  const soundClick = () => playTone(660, 0.05, "square", 0.04);
  const soundCorrect = () => { playTone(523, 0.1); setTimeout(() => playTone(784, 0.18), 80); };
  const soundWrong = () => playTone(180, 0.2, "sawtooth", 0.06);
  const soundTick = () => playTone(900, 0.04, "triangle", 0.05);

  function vibrate(pattern: number | number[]) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(pattern); } catch {/* no-op */}
    }
  }

  /* ─── Game flow ───────────────────────────────────────────── */
  function timeOut() {
    if (!quiz) return;
    setAnswered(true);
    setStreak(0);
    setShowFact(true);
    setTimeout(() => setShowNext(true), 600);
    soundWrong();
    vibrate([80, 60, 80]);
  }

  function choose(opt: string) {
    if (answered || !quiz) return;
    setAnswered(true);
    setChosen(opt);
    if (timerRef.current) clearInterval(timerRef.current);
    const q = quiz.questions[idx];
    const correct = opt === q.correct;
    if (correct) {
      const timeBonus = Math.round((timeLeft / TIME_PER_Q) * TIME_BONUS);
      const newStreak = streak + 1;
      const streakExtra = newStreak > 1 ? (newStreak - 1) * STREAK_BONUS : 0;
      const gained = BASE_POINTS + timeBonus + streakExtra;
      setStreak(newStreak);
      setStreakBump((b) => b + 1);
      setScore((s) => s + gained);
      // Confetti at button position approximated
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          startVelocity: 35,
          origin: { x: 0.5, y: 0.5 },
          colors: ["#e8a320", "#f5bc45", "#2e7d52", "#ffffff"],
        });
      } catch {/* no-op */}
      soundCorrect();
      vibrate(40);
    } else {
      setStreak(0);
      soundWrong();
      vibrate([60, 40, 60]);
    }
    setTimeout(() => setShowFact(true), 350);
    setTimeout(() => setShowNext(true), 700);
  }

  function nextQuestion() {
    if (!quiz) return;
    soundClick();
    if (idx >= quiz.questions.length - 1) {
      endGame();
    } else {
      setIdx((i) => i + 1);
    }
  }

  function endGame() {
    setPhase("end");
    // Party konfettit
    const duration = 2200;
    const end = Date.now() + duration;
    (function frame() {
      try {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ["#e8a320", "#f5bc45", "#0f1520"] });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ["#e8a320", "#f5bc45", "#0f1520"] });
      } catch {/* no-op */}
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    if (soundOn) {
      setTimeout(() => playTone(523, 0.12), 100);
      setTimeout(() => playTone(659, 0.12), 220);
      setTimeout(() => playTone(784, 0.2), 340);
    }
  }

  function resetGame() { startGame(); }

  function toggleSound() {
    setSoundOn((s) => !s);
    const ctx = getCtx();
    if (ctx?.state === "suspended") ctx.resume();
  }

  function shareResult() {
    if (!quiz) return;
    const text = `Sain ${score} pistettä Tietoniekan ${quiz.title}-visassa! 🏆 Pelaa itse: tietoniekka.vercel.app`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: `Tietoniekka — ${quiz.title}`, text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }

  /* ─── Keyboard ─────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase === "playing" && !answered) {
        if (e.key >= "1" && e.key <= "4") {
          const i = parseInt(e.key, 10) - 1;
          const opt = quiz?.questions[idx]?.options[i];
          if (opt) choose(opt);
        }
      }
      if (e.key === "Enter") {
        if (phase === "intro") startGame();
        else if (phase === "playing" && showNext) nextQuestion();
        else if (phase === "end") resetGame();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, answered, quiz, idx, showNext]);

  if (!quiz) {
    return (
      <main className="peli">
        <div className="peli-app">
          <div className="peli-loading">Ladataan visaa…</div>
        </div>
      </main>
    );
  }

  const totalQ = quiz.questions.length;
  const maxScore = totalQ * (BASE_POINTS + TIME_BONUS);
  const q = quiz.questions[idx];
  const progressPct = phase === "end" ? 100 : (idx / totalQ) * 100;
  const timerPct = (timeLeft / TIME_PER_Q) * 100;
  const timerClass = timeLeft <= 5 ? "danger" : timeLeft <= 10 ? "warn" : "";

  return (
    <main className="peli">
      <div className="peli-vignette" data-active={timeLeft <= 5 && !answered} />

      <div className="peli-app">
        {/* Top bar */}
        <div className="peli-topbar">
          <Link href="/" className="peli-logo" aria-label="Etusivulle">
            <span className="tieto">TIETO</span>
            <span className="niekka">NIEKKA</span>
          </Link>
          <div className="spacer" />
          <button
            className="peli-icon-btn"
            onClick={toggleSound}
            aria-label="Äänet"
            data-on={soundOn}
            type="button"
          >
            {soundOn ? "🔊" : "🔈"}
          </button>
        </div>

        {/* Intro */}
        {phase === "intro" && (
          <div className="peli-intro">
            <div className="peli-kicker">Testaa tietosi</div>
            <h1 className="peli-h1">{quiz.title}</h1>
            <p className="peli-intro-text">{quiz.intro}</p>
            <button className="peli-btn-primary" onClick={startGame} type="button">
              PELAA NYT →
            </button>
          </div>
        )}

        {/* Game */}
        {phase === "playing" && (
          <div className="peli-game">
            <div className="peli-stats-row">
              <div className="peli-progress">
                <div className="peli-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="peli-score-pill">
                PISTEET <span className="score-value">{displayedScore}</span>
              </div>
              {streak >= 2 && (
                <div className={`peli-streak-pill visible ${streakBump ? "bump" : ""}`} key={streakBump}>
                  🔥 <span>{streak}</span>
                </div>
              )}
            </div>

            <div className="peli-card">
              <div className="peli-q-header">
                <div>
                  <div className="peli-q-label">Kysymys</div>
                  <div className="peli-q-counter">
                    <span>{idx + 1}</span> / <span>{totalQ}</span>
                  </div>
                </div>
                <div className="spacer" />
                <div className={`peli-timer ${timerClass}`}>
                  <div className="bg-ring" style={{ ["--pct" as string]: `${timerPct}%` } as React.CSSProperties} />
                  <div className="inner">{Math.max(0, timeLeft)}</div>
                </div>
              </div>

              {quiz.isImageQuiz && q.image && (
                <div className="peli-image-stage">
                  <img className="peli-image" src={q.image} alt="" />
                </div>
              )}

              <div className="peli-q-text">{q.question}</div>

              <div className="peli-options">
                {q.options.map((opt, i) => {
                  const isCorrect = answered && opt === q.correct;
                  const isWrong = answered && chosen === opt && opt !== q.correct;
                  return (
                    <button
                      key={opt}
                      ref={(el) => { optionRefs.current[i] = el; }}
                      className={`peli-opt ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                      onClick={() => choose(opt)}
                      disabled={answered}
                      type="button"
                    >
                      <span className="peli-opt-label">
                        <span className="peli-opt-letter">{String.fromCharCode(65 + i)}</span>
                        <span>{opt}</span>
                      </span>
                      <span className="peli-opt-badge">
                        {isCorrect ? "✓" : isWrong ? "✕" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              {showFact && (
                <div className="peli-fact show">
                  <span className="label">Tiesitkö?</span>
                  <span className="body">{q.fact}</span>
                </div>
              )}

              {showNext && (
                <div className="peli-next-wrap">
                  <button className="peli-btn-primary" onClick={nextQuestion} type="button">
                    {idx === totalQ - 1 ? "NÄYTÄ TULOS →" : "SEURAAVA →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* End */}
        {phase === "end" && (
          <div className="peli-end show">
            <div className="peli-trophy">🏆</div>
            <h2 className="peli-end-h2">HIENOA NIEKKA!</h2>
            <div className="peli-big-score">
              <span>{score}</span>
              <small>/{maxScore}</small>
            </div>
            <div className="peli-percentile">
              Olit parempi kuin{" "}
              <b>
                {Math.min(99, Math.max(10, Math.round((score / maxScore) * 95)))} %
              </b>{" "}
              niekoista
            </div>
            <div className="peli-end-actions">
              <button className="peli-btn-primary" onClick={resetGame} type="button">
                PELAA UUDELLEEN
              </button>
              <button className="peli-btn-ghost" onClick={shareResult} type="button">
                JAA TULOS
              </button>
              <Link href="/" className="peli-btn-ghost">
                TOINEN VISA →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PeliPage() {
  return (
    <Suspense fallback={<main className="peli"><div className="peli-app"><div className="peli-loading">Ladataan…</div></div></main>}>
      <PeliInner />
    </Suspense>
  );
}
