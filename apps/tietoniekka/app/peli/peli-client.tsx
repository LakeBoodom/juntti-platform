"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { getSectionAnchor, type QuizConfig, type Question } from "./questions";
import { getSupabase } from "../../lib/supabase";
import { CATEGORIES } from "../../lib/categories";

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

// v1: ei aikalaskuria — säilytetään flag:in takana Speed-mode-laajennusta varten
const TIMER_ENABLED = false;
const TIME_PER_Q = 20;
const BASE_POINTS = 100;
const TIME_BONUS = 0;
const STREAK_BONUS = 50;

/** Tulosporrastus oikeiden vastausten osuuden mukaan. */
function resultTier(correct: number, total: number) {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 1)
    return { emoji: "🏆", heading: "TÄYDELLINEN!", blurb: "Täydet pisteet — todellinen tietoniekka!", celebrate: true };
  if (pct >= 0.8)
    return { emoji: "🏆", heading: "HIENOA, NIEKKA!", blurb: "Vahva suoritus!", celebrate: true };
  if (pct >= 0.6)
    return { emoji: "👏", heading: "IHAN KELPO!", blurb: "Hyvä pohja — vielä vähän hiomista.", celebrate: false };
  if (pct >= 0.4)
    return { emoji: "🙂", heading: "EIPÄ HULLUMMIN", blurb: "Tästä on hyvä parantaa.", celebrate: false };
  if (pct >= 0.2)
    return { emoji: "😞", heading: "NYT TAKKUSI", blurb: "Ei hätää — uusi yritys auttaa.", celebrate: false };
  return { emoji: "😭", heading: "EI MENNYT NAPPIIN, LISÄÄ HARJOITTELUA VAAN", blurb: "", celebrate: false };
}

/** Anonyymi sessio-tunnus pelitulosten ryhmittelyä varten. Pysyy localStoragessa. */
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem("tn_session_id");
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem("tn_session_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

/** Paikallinen päivämäärä muodossa YYYY-MM-DD (ei UTC — putki vaihtuu keskiyöllä Suomen ajassa). */
function localDateStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Päivän visa -putki: kasvaa kun pelaa peräkkäisinä päivinä, nollautuu jos päivä jää väliin.
 * Sama päivä ei kasvata putkea kahdesti. Palauttaa nykyisen putken pituuden (0 jos localStorage ei toimi).
 */
function updateDailyStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const KEY = "tn_paivan_visa_putki";
    const today = localDateStr();
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = localDateStr(y);
    const raw = window.localStorage.getItem(KEY);
    let count = 1;
    if (raw) {
      const data = JSON.parse(raw) as { count?: number; last?: string };
      if (data.last === today) return data.count ?? 1;
      if (data.last === yesterday) count = (data.count ?? 0) + 1;
    }
    window.localStorage.setItem(KEY, JSON.stringify({ count, last: today }));
    return count;
  } catch {
    return 0;
  }
}

/** Parsii jakolinkin "8-10"-tulosparametrin haastebanneria varten. */
function parseTulosParam(raw: string | null): { score: number; total: number } | null {
  if (!raw) return null;
  const m = /^(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (!m) return null;
  const score = Number(m[1]);
  const total = Number(m[2]);
  if (total < 1 || total > 30 || score < 0 || score > total) return null;
  return { score, total };
}

type Phase = "intro" | "playing" | "end";

function PeliInner({ preloadedQuiz }: { preloadedQuiz: QuizConfig | null }) {
  console.log("[DEBUG peli] PeliInner render, preloadedQuiz.id=", preloadedQuiz?.id, preloadedQuiz?.title);
  const searchParams = useSearchParams();
  const [quiz, setQuiz] = useState<QuizConfig | null>(preloadedQuiz);
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
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answerLog, setAnswerLog] = useState<boolean[]>([]);
  const [dailyStreak, setDailyStreak] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<0 | 1 | -1>(0);
  // Oljenkorsi: kerran per pelikerta (ei per kysymys) saa poistaa 2 väärää vaihtoehtoa nykyisestä kysymyksestä.
  const [oljenkorsiUsed, setOljenkorsiUsed] = useState(false);
  const [hiddenOpts, setHiddenOpts] = useState<Set<string>>(new Set());
  const playIdRef = useRef<string | null>(null);
  // Jaetun linkin haaste: ?tulos=8-10 → "Kaverisi sai 8/10 — pystytkö parempaan?"
  // (parametrin nimi EI saa olla "t" — linkkisiivoajat poistavat sen seurantaparametrina)
  const challenge = parseTulosParam(searchParams.get("tulos"));
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shareWrapRef = useRef<HTMLDivElement>(null);
  // Seuraa mikä visa on viimeksi ladattu — sama /peli-reitti pysyy samana React-komponenttina
  // kun vaihdetaan vain hakuparametreja (esim. "UUSI X-VISA" tulosnäytöltä), joten pelkkä
  // setQuiz() alla EI riitä: ilman tätä idx/phase/score jäävät jumiin edellisen pelin tilaan
  // ja käyttäjä näkee saman tulosruudun vaikka uusi visa on jo ladattu taustalla.
  const loadedQuizIdRef = useRef<string | null>(preloadedQuiz?.id ?? null);

  /* ─── Quiz resolve — käyttää AINOASTAAN server-side preloadedQuiz:ia (Supabasesta).
     resolveQuiz-fallback hardcoded-questions.ts:stä poistettu Heikin pyynnöstä — kaikki
     visat tulevat admin-toolista. ─────────────────────────────────────────────── */
  useEffect(() => {
    console.log("[DEBUG peli] effect fired, preloadedQuiz.id=", preloadedQuiz?.id, "loadedQuizIdRef=", loadedQuizIdRef.current, "current phase=", phase);
    if (!preloadedQuiz) return;
    if (preloadedQuiz.id === loadedQuizIdRef.current) return; // sama visa jo ladattu — ei nollata pelitilaa turhaan
    loadedQuizIdRef.current = preloadedQuiz.id;
    console.log("[DEBUG peli] resetting to new quiz", preloadedQuiz.id, preloadedQuiz.title);
    setQuiz(preloadedQuiz);
    // Uusi visa eri /peli-hakuparametreilla (esim. "UUSI X-VISA", satunnaisvisa) — nollaa koko
    // pelitila kuten startGame() tekisi, jotta ruutu palaa intro-näkymään eikä jää tulosnäytölle.
    setPhase("intro");
    setIdx(0);
    setScore(0);
    setCorrectCount(0);
    setAnswerLog([]);
    setFeedback(0);
    playIdRef.current = null;
    setStreak(0);
    setStreakBump(0);
    setAnswered(false);
    setChosen(null);
    setShowFact(false);
    setShowNext(false);
    setTimeLeft(TIME_PER_Q);
    setOljenkorsiUsed(false);
    setHiddenOpts(new Set());
    setShareOpen(false);
    setCopied(false);
  }, [preloadedQuiz]);

  const startGame = useCallback(() => {
    if (!quiz) return;
    soundClick();
    setPhase("playing");
    setIdx(0);
    setScore(0);
    setCorrectCount(0);
    setAnswerLog([]);
    setFeedback(0);
    playIdRef.current = null;
    setStreak(0);
    setAnswered(false);
    setChosen(null);
    setShowFact(false);
    setShowNext(false);
    setTimeLeft(TIME_PER_Q);
    setOljenkorsiUsed(false);
    setHiddenOpts(new Set());
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
    setHiddenOpts(new Set());
  }, [phase, idx, quiz]);

  /* ─── Ajastin ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!TIMER_ENABLED) return;
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
    setAnswerLog((log) => [...log, false]);
    setStreak(0);
    setShowFact(true);
    setTimeout(() => setShowNext(true), 600);
    soundWrong();
    vibrate([80, 60, 80]);
  }

  function choose(opt: string) {
    if (answered || !quiz || hiddenOpts.has(opt)) return;
    setAnswered(true);
    setChosen(opt);
    if (timerRef.current) clearInterval(timerRef.current);
    const q = quiz.questions[idx];
    const correct = opt === q.correct;
    setAnswerLog((log) => [...log, correct]);
    if (correct) {
      const timeBonus = TIMER_ENABLED ? Math.round((timeLeft / TIME_PER_Q) * TIME_BONUS) : 0;
      const newStreak = streak + 1;
      const streakExtra = newStreak > 1 ? (newStreak - 1) * STREAK_BONUS : 0;
      const gained = BASE_POINTS + timeBonus + streakExtra;
      setStreak(newStreak);
      setStreakBump((b) => b + 1);
      setScore((s) => s + gained);
      setCorrectCount((c) => c + 1);
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

  /** Oljenkorsi: kerran per pelikerta — poistaa 2 satunnaista väärää vaihtoehtoa nykyisestä kysymyksestä. */
  function useOljenkorsi() {
    if (oljenkorsiUsed || answered || !quiz) return;
    const q = quiz.questions[idx];
    const wrongOpts = q.options.filter((o) => o !== q.correct);
    if (wrongOpts.length < 2) return; // ei tarpeeksi vääriä vaihtoehtoja poistettavaksi
    const shuffled = [...wrongOpts].sort(() => Math.random() - 0.5);
    setHiddenOpts(new Set(shuffled.slice(0, 2)));
    setOljenkorsiUsed(true);
    soundClick();
    vibrate(30);
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

  /** Tallenna pelitulos Supabase quiz_plays-tauluun (best-effort, ei estä UI:ta). */
  async function recordPlay() {
    if (typeof window === "undefined") return;
    const dbQuizId = searchParams.get("quiz_id");
    if (!dbQuizId) return; // hardcoded fallback-visat eivät tallennu
    try {
      const sb = getSupabase();
      if (!sb) return;
      const playId = crypto.randomUUID();
      const { error } = await sb.from("quiz_plays").insert({
        id: playId,
        quiz_id: dbQuizId,
        platform: "tietoniekka",
        score,
        total: maxScore,
        session_id: getOrCreateSessionId(),
        shared: false,
      });
      if (!error) playIdRef.current = playId;
    } catch (e) {
      // best-effort: ei kaadeta tulosnäkymää jos tallennus epäonnistuu
      console.error("recordPlay failed", e);
    }
  }

  function endGame() {
    setPhase("end");
    void recordPlay();
    // Päivän visa -putki: päivittyy vain Päivän visan pelaamisesta
    if (searchParams.get("paivan_visa") === "1") {
      const s = updateDailyStreak();
      if (s > 0) setDailyStreak(s);
    }
    // Juhlinta vain hyvästä tuloksesta (≥80 % oikein) — ei joka kerta.
    const total = quiz?.questions.length ?? 0;
    const celebrate = total > 0 && correctCount / total >= 0.8;
    if (!celebrate) return;
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

  useEffect(() => {
    if (!shareOpen) return;
    function onDocClick(e: MouseEvent) {
      if (shareWrapRef.current && !shareWrapRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [shareOpen]);

  function getShareData() {
    const quizId = searchParams.get("quiz_id");
    const base = quiz?.slug
      ? `https://tietoniekka.fi/visa/${quiz.slug}`
      : quizId
        ? `https://tietoniekka.fi/peli?quiz_id=${quizId}`
        : "https://tietoniekka.fi";
    const niceTitle = quiz?.titleRaw ?? quiz?.title ?? "";
    const total = quiz?.questions.length ?? 0;
    // Tulos mukaan linkkiin → esikatselukuvaksi tulee jaettava tuloskortti (?tulos=8-10)
    const url =
      total > 0 && base !== "https://tietoniekka.fi"
        ? `${base}${base.includes("?") ? "&" : "?"}tulos=${correctCount}-${total}`
        : base;
    // Wordle-tyylinen emoji-rivi: 🟩 oikein, 🟥 väärin — kysymysjärjestyksessä
    const emojiRow = answerLog.map((ok) => (ok ? "🟩" : "🟥")).join("");
    const perfect = total > 0 && correctCount === total;
    const isDaily = searchParams.get("paivan_visa") === "1";
    const streakLine =
      isDaily && dailyStreak !== null && dailyStreak >= 2
        ? `\n🔥 ${dailyStreak} päivän putki!`
        : "";
    const text = `Sain ${correctCount}/${total} oikein Tietoniekan visassa "${niceTitle}"${perfect ? " 🏆" : ""}\n${emojiRow}${streakLine}\nPystytkö parempaan?`;
    return { url, text };
  }

  function copyShareLink() {
    const { url, text } = getShareData();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(`${text} ${url}`)
        .then(() => {
          setCopied(true);
          setShareOpen(false);
          setTimeout(() => setCopied(false), 2200);
        })
        .catch(() => {});
    }
    void markShared();
  }

  function shareResult() {
    if (!quiz) return;
    const { url, text } = getShareData();
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    // Mobiilissa natiivijako (WhatsApp, Viestit…); desktopilla avaa pieni valikko
    // suorilla napeilla — macin natiivi jakovalikko on siellä kömpelö.
    if (isMobile && typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: `Tietoniekka — ${quiz.title}`, text, url }).catch(() => {});
      void markShared();
    } else {
      setShareOpen((o) => !o);
    }
  }

  async function markShared() {
    if (typeof window === "undefined" || !playIdRef.current) return;
    try {
      const sb = getSupabase();
      if (!sb) return;
      await sb.from("quiz_plays").update({ shared: true }).eq("id", playIdRef.current);
    } catch (e) {
      console.error("markShared failed", e);
    }
  }

  /** Visapalaute: 1 = 👍, -1 = 👎. Tallentuu pelikertaan (quiz_plays.feedback). */
  function giveFeedback(value: 1 | -1) {
    if (feedback !== 0) return;
    setFeedback(value);
    soundClick();
    if (typeof window === "undefined" || !playIdRef.current) return;
    try {
      const sb = getSupabase();
      if (!sb) return;
      void sb.from("quiz_plays").update({ feedback: value }).eq("id", playIdRef.current);
    } catch (e) {
      console.error("giveFeedback failed", e);
    }
  }

  /* ─── Keyboard ─────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase === "playing" && !answered) {
        if (e.key >= "1" && e.key <= "4") {
          const i = parseInt(e.key, 10) - 1;
          const opt = quiz?.questions[idx]?.options[i];
          if (opt && !hiddenOpts.has(opt)) choose(opt);
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
  }, [phase, answered, quiz, idx, showNext, hiddenOpts]);

  if (!quiz) {
    return (
      <main className="peli">
        <div className="peli-app">
          <div className="peli-loading">
            Visaa ei löytynyt.{" "}
            <Link href="/" style={{ color: "var(--peli-gold)", textDecoration: "underline" }}>
              Palaa etusivulle →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalQ = quiz.questions.length;
  // Max = base+time per Q + summa streak-bonuksista (Σ i*STREAK_BONUS, i=1..totalQ-1)
  const maxScore = totalQ * (BASE_POINTS + TIME_BONUS) + (totalQ * (totalQ - 1) / 2) * STREAK_BONUS;
  const q = quiz.questions[idx];
  const progressPct = phase === "end" ? 100 : (idx / totalQ) * 100;
  const result = resultTier(correctCount, totalQ);
  const currentCatSlug = quiz.categorySlug ?? null;
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
            {challenge && (
              <div className="peli-challenge">
                🏆 Kaverisi sai <strong>{challenge.score}/{challenge.total}</strong> — pystytkö parempaan?
              </div>
            )}
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
                PISTEET <span className="score-value">{score}</span>
              </div>
              {streak >= 2 && (
                <div className={`peli-streak-pill visible ${streakBump ? "bump" : ""}`} key={streakBump}>
                  🔥 <span>{streak}</span>
                </div>
              )}
            </div>

            <div className="peli-card">
              <div className="peli-card-left">
                <div className="peli-q-header">
                  <div className="peli-q-meta">
                    <span className="peli-q-label">Kysymys</span>
                    <span className="peli-q-counter">{idx + 1} / {totalQ}</span>
                  </div>
                  <div className="spacer" />
                  {TIMER_ENABLED && (
                    <div className={`peli-timer ${timerClass}`}>
                      <div className="bg-ring" style={{ ["--pct" as string]: `${timerPct}%` } as React.CSSProperties} />
                      <div className="inner">{Math.max(0, timeLeft)}</div>
                    </div>
                  )}
                </div>

                {quiz.isImageQuiz && q.image && (
                  <div className="peli-image-stage">
                    <img className="peli-image" src={q.image} alt="" />
                  </div>
                )}

                <div className="peli-q-text">{q.question}</div>

                {showFact && (
                  <div className="peli-fact show">
                    <span className="label">Tiesitkö?</span>
                    <span className="body">{q.fact}</span>
                  </div>
                )}
              </div>

              <div className="peli-card-right">
                {!answered && !oljenkorsiUsed && q.options.filter((o) => o !== q.correct).length >= 2 && (
                  <div className="peli-options-toolbar">
                    <button
                      className="peli-joker-btn"
                      onClick={useOljenkorsi}
                      type="button"
                      aria-label="Käytä oljenkorsi — poista kaksi väärää vaihtoehtoa"
                    >
                      🌾 Oljenkorsi
                      <span className="peli-joker-sub">poista 2 väärää · kerran per visa</span>
                    </button>
                  </div>
                )}
                <div className="peli-options">
                  {q.options.map((opt, i) => {
                    if (hiddenOpts.has(opt)) return null;
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
              </div>
            </div>

            {showNext && (
              <div className="peli-next-wrap">
                <button className="peli-btn-primary" onClick={nextQuestion} type="button">
                  {idx === totalQ - 1 ? "NÄYTÄ TULOS →" : "SEURAAVA →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* End */}
        {phase === "end" && (
          <div className="peli-end show">
            <div className="peli-trophy">{result.emoji}</div>
            <h2 className="peli-end-h2">{result.heading}</h2>
            {result.blurb && <p className="peli-end-blurb">{result.blurb}</p>}
            <div className="peli-big-score">
              <span>{correctCount}</span>
              <small>/{totalQ} oikein</small>
            </div>
            <div className="peli-points-sub">{score} pistettä</div>
            {dailyStreak !== null && dailyStreak > 0 && (
              <div className="peli-putki">
                {dailyStreak === 1
                  ? "🔥 Putki avattu! Pelaa huomenna uudestaan, niin se jatkuu."
                  : `🔥 ${dailyStreak} päivän putki! Huomenna uusi visa — pidä liekki elossa.`}
              </div>
            )}
            <div className="peli-feedback">
              {feedback !== 0 ? (
                <span className="peli-feedback-thanks">Kiitos palautteesta! 🙏</span>
              ) : (
                <>
                  <span className="peli-feedback-label">Oliko hyvä visa?</span>
                  <button className="peli-feedback-btn" onClick={() => giveFeedback(1)} type="button" aria-label="Hyvä visa">👍</button>
                  <button className="peli-feedback-btn" onClick={() => giveFeedback(-1)} type="button" aria-label="Huono visa">👎</button>
                </>
              )}
            </div>
            <div className="peli-end-actions">
              {quiz.categoryLabel && currentCatSlug && (
                <Link
                  href={`/peli?kat=${encodeURIComponent(currentCatSlug)}${quiz.dbId ? `&exclude=${quiz.dbId}` : ""}`}
                  className="peli-btn-primary"
                  prefetch={false}
                >
                  UUSI {quiz.categoryLabel}-VISA →
                </Link>
              )}
              <button className="peli-btn-primary" onClick={resetGame} type="button">
                PELAA UUDELLEEN
              </button>
              <div ref={shareWrapRef} style={{ position: "relative", display: "inline-block" }}>
                <button className="peli-btn-ghost" onClick={shareResult} type="button">
                  {copied ? "LINKKI KOPIOITU ✓" : "JAA TULOS"}
                </button>
                {shareOpen && (() => {
                  const { url, text } = getShareData();
                  const enc = encodeURIComponent;
                  const item: CSSProperties = {
                    padding: "10px 12px",
                    borderRadius: 8,
                    color: "white",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 14,
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  };
                  return (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#1b2433",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 12,
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        minWidth: 190,
                        zIndex: 20,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      }}
                    >
                      <a style={item} href={`https://wa.me/?text=${enc(`${text}\n${url}`)}`} target="_blank" rel="noopener noreferrer" onClick={() => { setShareOpen(false); void markShared(); }}>📱  WhatsApp</a>
                      <a style={item} href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer" onClick={() => { setShareOpen(false); void markShared(); }}>📘  Facebook</a>
                      <a style={item} href={`https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`} target="_blank" rel="noopener noreferrer" onClick={() => { setShareOpen(false); void markShared(); }}>✈️  Telegram</a>
                      <a style={item} href={`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`} target="_blank" rel="noopener noreferrer" onClick={() => { setShareOpen(false); void markShared(); }}>𝕏   Jaa X:ssä</a>
                      <button style={item} onClick={copyShareLink} type="button">🔗  Kopioi linkki</button>
                    </div>
                  );
                })()}
              </div>
              <Link href={getSectionAnchor(quiz)} className="peli-btn-ghost">
                TAKAISIN ETUSIVULLE
              </Link>
            </div>

            {quiz.relatedQuizzes && quiz.relatedQuizzes.length > 0 && (
              <div className="peli-end-more">
                <div className="peli-end-more-label">Pelaa lisää samasta aiheesta</div>
                <div className="peli-end-cats">
                  {quiz.relatedQuizzes.map((rq) => (
                    <Link
                      key={rq.id}
                      href={rq.slug ? `/visa/${rq.slug}` : `/peli?quiz_id=${rq.id}`}
                      className="peli-cat-chip"
                      prefetch={false}
                    >
                      {rq.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="peli-end-more">
              <div className="peli-end-more-label">Kokeile toista aihetta</div>
              <div className="peli-end-cats">
                {CATEGORIES.filter((c) => c.slug !== currentCatSlug).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/kategoria/${c.slug}`}
                    className="peli-cat-chip"
                    prefetch={false}
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export function PeliClient({ preloadedQuiz }: { preloadedQuiz: QuizConfig | null }) {
  return (
    <Suspense fallback={<main className="peli"><div className="peli-app"><div className="peli-loading">Ladataan…</div></div></main>}>
      <PeliInner preloadedQuiz={preloadedQuiz} />
    </Suspense>
  );
}
