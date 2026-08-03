"use client";
// TIETONIEKKA 2.0 — pelikuori 2A "Jaettu lava" + Tuloskortti A + Logo C
// (CD pelinäkymä2, Heikki vahvisti 2026-08-01)
// Mobiili: kysymys keskittyy vapaaseen tilaan, nauhat ankkuroituvat alas.
// Desktop: vasen puoli = kysymys + kokoelmakuva, oikea = nauhat täyskorkeana.
// Logo = hiljainen allekirjoitus alalaidassa; täysi merkki palaa tuloskorttiin.
// Tuloskortti A: jaettava kortti on sisältö; WhatsApp pääkanava, muut jaot
// NYKYISET kanavat (Facebook · Telegram · X · Kopioi linkki) — Instagram Story
// lisätään myöhemmin kuvajaon kautta.
// Mekaniikka identtinen tuotannon kanssa: 100 p + striikkibonus 50/porras,
// Oljenkorsi 2 väärää pois, quiz_plays-tallennus + shared-merkintä, Putki
// (tn_paivan_visa_putki) vain Päivän sankarista. Ei ajastinta (v1).

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { getSupabase } from "../../../lib/supabase";
import { MOTIF_PATHS } from "../../../components/tn20/motif-paths";
import { LearnArticle, type Learn } from "../../../components/tn20/LearnArticle";

const BASE_POINTS = 100;
const STREAK_BONUS = 50;

export type GameQuiz = {
  id: string;
  title: string;
  teaser: string | null;
  /* TIETOMEDIA (1.8.2026): loppunäkymän oppimisyhteenveto + aiheopas */
  learnHeading: string | null;
  keyFacts: Array<{ k: string; v: string; qi?: number }>;
  learn: Learn | null;
  collectionLabel: string;
  genreLabel: string | null;
  hubHref: string;
  bgImg: string;
  accent: string;
  isSankari: boolean;
  /* image = kuvavisan tunnistettava kuva (Heikki 3.8.2026) */
  questions: Array<{ question: string; options: string[]; correct: string; fact: string | null; image?: string }>;
  related: Array<{ id: string; title: string; teaser: string | null; color: string; motifPath: string; meta: string; href?: string }>;
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
      if (prev.last === today) return prev.count;
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

/* Ei emojeita tuloksissa (Heikki 1.8.2026) */
function resultTier(correct: number, total: number) {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 1) return { heading: "Täydellinen!", blurb: "Täydet pisteet — todellinen tietoniekka!" };
  if (pct >= 0.8) return { heading: "Hienoa, niekka!", blurb: "Vahva suoritus!" };
  if (pct >= 0.6) return { heading: "Ihan kelpo!", blurb: "Hyvä pohja — vielä vähän hiomista." };
  if (pct >= 0.4) return { heading: "Eipä hullummin", blurb: "Tästä on hyvä parantaa." };
  if (pct >= 0.2) return { heading: "Nyt takkusi", blurb: "Ei hätää — uusi yritys auttaa." };
  return { heading: "Lisää harjoittelua vaan", blurb: "Uusi yritys auttaa." };
}

const enc = encodeURIComponent;

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
  const [ansLog, setAnsLog] = useState<boolean[]>([]);
  const [copied, setCopied] = useState(false);
  const recorded = useRef(false);
  const playIdRef = useRef<string | null>(null);

  const q = quiz.questions[idx];
  const answered = picked !== null;
  const maxScore = total * BASE_POINTS + ((total * (total - 1)) / 2) * STREAK_BONUS;

  function pick(option: string) {
    if (answered) return;
    setPicked(option);
    const ok = option === q.correct;
    setAnsLog((l) => [...l, ok]);
    if (ok) {
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
    if (!quiz.id) return; // kuvavisat: ei quizzes-riviä → ei tallennusta (kuten tuotannossa)
    recorded.current = true;
    try {
      const sb = getSupabase();
      if (!sb) return;
      const playId = crypto.randomUUID();
      const { error } = await sb.from("quiz_plays").insert({
        id: playId,
        quiz_id: quiz.id,
        platform: "tietoniekka",
        score: finalScore,
        total: maxScore,
        session_id: getOrCreateSessionId(),
        shared: false,
      });
      if (!error) playIdRef.current = playId;
    } catch { /* best-effort */ }
  }

  /** Sama shared-merkintä kuin tuotannossa — best-effort. */
  async function markShared() {
    try {
      const sb = getSupabase();
      if (!sb || !playIdRef.current) return;
      await sb.from("quiz_plays").update({ shared: true }).eq("id", playIdRef.current);
    } catch { /* no-op */ }
  }

  function endGame() {
    setPhase("end");
    try { window.scrollTo(0, 0); } catch { /* no-op */ }
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
    try { window.scrollTo(0, 0); } catch { /* no-op */ }
    setIdx(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setPicked(null);
    setHidden(new Set());
    setOljenkorsiUsed(false);
    setAnsLog([]);
    setCopied(false);
    recorded.current = false;
    playIdRef.current = null;
  }

  const shareText = () =>
    `Sain ${correctCount}/${total} oikein Tietoniekan visassa "${quiz.title}" — pystytkö parempaan?`;
  const shareUrl = () => (typeof window !== "undefined" ? window.location.href : "https://tietoniekka.fi");

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(`${shareText()}\n${shareUrl()}`);
      setCopied(true);
      void markShared();
      setTimeout(() => setCopied(false), 2000);
    } catch { /* no-op */ }
  }

  /* SEO-kopio artikkelista (SSR pelin alla) piilotetaan VAIN silloin kun se
     häiritsisi: pelin aikana (vastaukset luettavissa) ja loppunäkymässä
     (sama sisältö näkyy siellä kohdassa 5.). Aloitusnäkymässä opas jää
     näkyviin — se on samaa sisältöä sekä kävijälle että hakukoneelle,
     eikä sivulla ole koskaan kahta näkyvää kopiota.
     HUOM: aiempi versio lisäsi luokan mount-hetkellä tyhjällä riippuvuus-
     listalla, jolloin opas oli piilossa kaikilta selaimen käyttäjiltä koko
     ajan — myös Googlebotilta, joka suorittaa JS:n ja indeksoi renderöidyn
     DOM:in. (SEO_STRATEGIA.md §13.2) */
  useEffect(() => {
    const hide = phase !== "intro";
    document.body.classList.toggle("tn-game-playing", hide);
    return () => document.body.classList.remove("tn-game-playing");
  }, [phase]);

  useEffect(() => {
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
  /* Logo toimii aina linkkinä etusivulle (Heikki 1.8.2026) */
  const Signature = ({ className }: { className?: string }) => (
    <a className={`tn-game-signature${className ? ` ${className}` : ""}`} href="/2-0">
      <b>TIETO</b>
      <b>NIEKKA</b>
    </a>
  );
  const collLine = `${quiz.collectionLabel}${quiz.genreLabel ? ` · ${quiz.genreLabel}` : ""}`;

  /* ─── Aloitus: julistemainen intro — logo vasemmassa yläkulmassa,
         ei Oljenkorsi-mainintaa, ei "ei kirjautumista", ei paluulinkkiä ─── */
  if (phase === "intro") {
    return (
      <main className="tn-game tn-intro" style={shellStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="tn-intro-bg" src={quiz.bgImg} alt="" />
        <div className="tn-intro-grad" />
        <div className="tn-game2-top" style={{ position: "relative" }}>
          <a className="tn-logo tn-logo-game" href="/2-0"><b>TIETO</b><span>NIEKKA</span></a>
          <span className="tn-game2-meta">{total} kysymystä</span>
        </div>
        <div className="tn-intro-wrap">
          <a className="tn-game2-coll" href={quiz.hubHref} style={{ marginBottom: 18 }}><i />{collLine}</a>
          <h1 className="tn-intro-title">{quiz.title}</h1>
          {quiz.teaser && <p className="tn-intro-teaser">{quiz.teaser}</p>}
          <button className="tn-game-next tn-intro-cta" onClick={() => setPhase("play")}>
            Aloita visa →
          </button>
        </div>
      </main>
    );
  }

  /* ─── Tulos: Tuloskortti A ─── */
  if (phase === "end") {
    const tier = resultTier(correctCount, total);
    const today = new Date();
    const wa = `https://wa.me/?text=${enc(`${shareText()}\n${shareUrl()}`)}`;
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl())}`;
    const tg = `https://t.me/share/url?url=${enc(shareUrl())}&text=${enc(shareText())}`;
    const x = `https://twitter.com/intent/tweet?text=${enc(shareText())}&url=${enc(shareUrl())}`;

    return (
      <main className="tn-game" style={shellStyle}>
        <div className="tn-game-segs">{Array.from({ length: total }, (_, i) => <i key={i} data-on="true" />)}</div>
        <div className="tn-game2-top">
          <a className="tn-game2-coll" href={quiz.hubHref}><i />{collLine} · valmis</a>
          <span className="tn-game2-meta">Pisteet <b>{score}</b>{quiz.isSankari && dailyStreak > 0 ? <> · 🔥 {dailyStreak}</> : null}</span>
        </div>

        {/* Loppunäkymän järjestys (Heikki 2.8.2026): 1 tuloskortti ·
            2 Vastauksesi · 3 Nyt tiedät nämä · 4 Kertaa vielä nämä ·
            5 aiheopas + UKK · 6 Haasta kaveri + toiminnot · 7 Lisää */}
        <div className="tn-res-flow">
          {/* 1. Jaettava tuloskortti */}
          <div className="tn-rescard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tn-rescard-bg" src={quiz.bgImg} alt="" />
            <div className="tn-rescard-in">
              <div className="tn-rescard-toprow">
                <span style={{ color: quiz.accent }}>{collLine}</span>
                <span style={{ color: "#5F594C" }}>{today.getDate()}.{today.getMonth() + 1}.{today.getFullYear()}</span>
              </div>
              <div className="tn-rescard-score">
                {correctCount}
                <i>/</i>
                <b>{total}</b>
              </div>
              <div className="tn-rescard-tier">{tier.heading}</div>
              <div className="tn-rescard-sub">{quiz.title} · {score} pistettä</div>
            </div>
          </div>

          {/* 2. Vastauksesi-rivi */}
          {ansLog.length === total && (
            <div>
              <div className="tn-res-more-label" style={{ marginBottom: 8 }}>Vastauksesi</div>
              <div className="tn-res-recap">
                {ansLog.map((ok, i) => (
                  <span key={i} style={{ background: ok ? "rgba(182,255,60,.18)" : "rgba(255,92,61,.16)", color: ok ? "var(--tn-lime)" : "#FF8566" }}>
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3.–4. Nyt tiedät nämä + Kertaa vielä nämä */}
        {quiz.keyFacts.length > 0 && (
          <section className="tn-know">
            <div className="tn-know-in">
              <h2 className="tn-know-title">{quiz.learnHeading ?? `Nyt tiedät nämä`}</h2>
              <div className="tn-know-facts">
                {quiz.keyFacts.map((f) => {
                  const knew = typeof f.qi === "number" && ansLog[f.qi] === true;
                  return (
                    <div key={f.k} className="tn-know-fact" data-knew={knew || undefined}>
                      <b>{f.k}</b>
                      <p>{f.v}</p>
                      {knew && <span className="tn-know-badge">✓ Tiesit tämän</span>}
                    </div>
                  );
                })}
              </div>
              {ansLog.length === total && ansLog.some((ok) => !ok) && (
                <div className="tn-know-review">
                  <h3>Kertaa vielä nämä</h3>
                  {quiz.questions.map((qq, i) =>
                    ansLog[i] === false && qq.fact ? (
                      <div key={i} className="tn-know-review-item">
                        <b>{qq.question}</b>
                        <p>{qq.fact}</p>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Aiheopas + UKK (sama sisältö kuin SSR-kopio hakukoneille) */}
        {quiz.learn && (
          <LearnArticle learn={quiz.learn} fallbackTitle={quiz.title} accent={quiz.accent} />
        )}

        {/* 6. Haasta kaveri + toiminnot */}
        <section className="tn-res-share">
          <div className="tn-res-share-in">
            <div>
              <div className="tn-display tn-res-headline" style={{ fontSize: "clamp(24px, 2.6vw, 40px)", lineHeight: 0.98 }}>
                Haasta kaveri — kumpi tietää enemmän?
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8E8676", marginTop: 8 }}>
                Kaveri saa saman visan ja sama pistelasku ratkaisee.
              </div>
            </div>
            <a className="tn-share-wa" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => void markShared()}>
              Haasta kaveri WhatsAppissa
            </a>
            <div className="tn-share-grid">
              <a className="tn-share-chip" href={fb} target="_blank" rel="noopener noreferrer" onClick={() => void markShared()}>📘 Facebook</a>
              <a className="tn-share-chip" href={tg} target="_blank" rel="noopener noreferrer" onClick={() => void markShared()}>✈️ Telegram</a>
              <a className="tn-share-chip" href={x} target="_blank" rel="noopener noreferrer" onClick={() => void markShared()}>𝕏 Jaa X:ssä</a>
              <button className="tn-share-chip" type="button" onClick={() => void copyShareLink()}>
                {copied ? "✓ Kopioitu!" : "🔗 Kopioi linkki"}
              </button>
            </div>
            <div className="tn-res-actions">
              <button className="tn-primary" type="button" onClick={restart}>↻ Pelaa uudelleen</button>
              <a className="tn-ghost" href="/2-0">Etusivu</a>
            </div>
          </div>
        </section>

        {/* 7. Muut saman teeman visat */}
        {quiz.related.length > 0 && (
          <section className="tn-res-morewrap">
            <div className="tn-res-more-in">
              <div className="tn-res-more-label">Lisää: {quiz.collectionLabel}</div>
              <div className="tn-res-more-grid">
                {quiz.related.map((r) => (
                  <a key={r.id} className="tn-res-mini" href={r.href ?? `/2-0/peli?quiz_id=${r.id}`}>
                    <span className="tn-res-mini-thumb" style={{ color: r.color }}>
                      <span className="wash" />
                      <svg viewBox="0 0 200 260" aria-hidden>
                        <path d={r.motifPath} fill="none" stroke="currentColor" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                      <span className="tn-res-mini-title" style={{ display: "block" }}>{r.title}</span>
                      <span className="tn-res-mini-meta" style={{ display: "block" }}>{r.meta}</span>
                    </span>
                    <span style={{ color: "#3A3122", fontSize: 16, paddingRight: 6 }}>›</span>
                  </a>
                ))}
              </div>
              <a href={quiz.hubHref} className="tn-morelink" style={{ color: quiz.accent, marginTop: 12, display: "inline-block" }}>
                Selaa koko kokoelma →
              </a>
            </div>
          </section>
        )}
      </main>
    );
  }

  /* ─── Peli: 2A jaettu lava ─── */
  const qLen = q.question.length > 140 ? "xlong" : q.question.length > 85 ? "long" : "normal";
  return (
    <main className="tn-game" style={shellStyle}>
      <div className="tn-game-segs">
        {Array.from({ length: total }, (_, i) => (
          <i key={i} data-on={i < idx + (answered ? 1 : 0)} />
        ))}
      </div>
      <div className="tn-game-stage">
        {/* Vasen lava: kokoelma, kysymys, allekirjoitus */}
        <div className="tn-game-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="tn-game-left-bg" src={quiz.bgImg} alt="" />
          <div className="tn-game-left-grad" />
          <div className="tn-game2-top" style={{ position: "relative" }}>
            <a className="tn-game2-coll" href={quiz.hubHref}><i />{collLine}</a>
            <span className="tn-game2-meta tn-game2-meta-mobile">
              Pisteet <b>{score}</b>
              {streak >= 2 ? <> · 🔥 {streak}</> : null}
            </span>
          </div>
          <div className="tn-game-qwrap" data-img={q.image ? "true" : undefined}>
            {/* Kuvavisa: tunnistettava kuva on pääosassa, kysymysteksti pieneksi */}
            {q.image && (
              <div className="tn-game-imgstage">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.image} alt="" />
              </div>
            )}
            <div className="tn-game-qnum">Kysymys {idx + 1} / {total}</div>
            <h1 className="tn-game-qtext" data-len={q.image ? "img" : qLen}>{q.question}</h1>
          </div>
          <div className="tn-game-leftfoot">
            <Signature />
            <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {quiz.isSankari && <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--tn-gold)" }}>🔥 Putki</span>}
              <span className="tn-game-scorebig">
                {score}
                <small>pistettä{streak >= 2 ? ` · 🔥 ${streak}` : ""}</small>
              </span>
            </span>
          </div>
        </div>

        {/* Oikea lava: nauhat täyskorkeana + fakta + alalaita */}
        <div className="tn-game-right">
          <div className="tn-game-bands" style={{ marginTop: "auto" }}>
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
                  data-long={opt.length > 42}
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
          </div>
          {/* TIETOMEDIA kerros 2: väärän vastauksen jälkeen kerrotaan aina
              suoraan mikä oli oikein; selitys opettaa muistettavan faktan */}
          {answered && (q.fact || picked !== q.correct) && (
            <div className="tn-game2-fact">
              {picked !== q.correct
                ? <b className="tn-fact-answer">Oikea vastaus: {q.correct}</b>
                : <b>Tiesitkö?</b>}
              {q.fact && <p>{q.fact}</p>}
            </div>
          )}
          {/* Alalaita: Oljenkorsi vasen · logo keskellä (mobiili) · Seuraava oikea */}
          <div className="tn-game-foot">
            <button className="tn-game-lifeline" onClick={oljenkorsi} disabled={oljenkorsiUsed || answered}>
              🌾 {oljenkorsiUsed ? "Käytetty" : "Oljenkorsi"}
            </button>
            <Signature className="tn-game-sig-center" />
            {answered && (
              <button className="tn-game-next" onClick={next}>
                {idx >= total - 1 ? "Näytä tulos →" : "Seuraava →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
