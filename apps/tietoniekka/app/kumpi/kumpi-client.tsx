"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  makeDuel,
  revealValue,
  showRoleOnCard,
  DUEL_THEMES,
  type Duel,
  type DuelData,
} from "../../lib/duel";

const ROUND_LEN = 10;
const REVEAL_MS = 2500;

// Yleisövertailu ("48 % valitsi väärin") kytketään päälle vasta kun
// duel_pair_stats-taulussa on tarpeeksi vastauksia per pari.
const SHOW_CROWD_STATS = false;

const DIFF_COLOR: Record<string, string> = {
  helppo: "#4CAF50",
  keski: "#E8A320",
  vaikea: "#C0392B",
};

type Mode = "round" | "endless";
type Phase = "intro" | "play" | "end";

export function KumpiClient({ data }: { data: DuelData }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [theme, setTheme] = useState("sekoitus");
  const [mode, setMode] = useState<Mode>("round");

  const [duel, setDuel] = useState<Duel | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const used = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundOver = useRef(false);

  const themes = useMemo(() => {
    const available = new Set(data.defs.map((d) => d.theme));
    return DUEL_THEMES.filter((t) => t.id === "sekoitus" || available.has(t.id));
  }, [data.defs]);

  const nextDuel = useCallback(
    (t: string) => {
      const d = makeDuel(data, t, used.current);
      if (!d) {
        used.current.clear();
        setDuel(makeDuel(data, t, used.current));
      } else {
        setDuel(d);
      }
      setPicked(null);
    },
    [data],
  );

  const start = (m: Mode) => {
    if (timer.current) clearTimeout(timer.current);
    used.current = new Set();
    roundOver.current = false;
    setMode(m);
    setIndex(0);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setPhase("play");
    nextDuel(theme);
  };

  const advance = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (roundOver.current) {
      setBest((b) => Math.max(b, correctCount));
      setPhase("end");
    } else {
      nextDuel(theme);
    }
  }, [correctCount, nextDuel, theme]);

  const answer = (i: number) => {
    if (!duel || picked !== null) return;
    setPicked(i);
    const right = i === duel.correct;
    if (right) {
      // Striikkipainotteinen pisteytys: arvaamalla saa 50 % oikein,
      // joten pelkkä oikein-laskuri ei erottele osaamista.
      const nextStreak = streak + 1;
      setCorrectCount((c) => c + 1);
      setStreak(nextStreak);
      setScore((sc) => sc + 100 + Math.min(nextStreak - 1, 5) * 40);
    } else {
      setStreak(0);
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    roundOver.current =
      (mode === "round" && nextIndex >= ROUND_LEN) || (mode === "endless" && !right);
    timer.current = setTimeout(advance, REVEAL_MS);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /* ─── Intro ─────────────────────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <main className="kumpi-intro">
        <div className="kumpi-intro-inner">
          <span className="kumpi-eyebrow">Tietoniekka</span>
          <h1 className="kumpi-title">KUMPI?</h1>
          <p className="kumpi-lede">
            Kaksi vaihtoehtoa.
            <br />
            Vain toinen on oikein.
          </p>

          <span className="kumpi-themelabel">Teema</span>
          <div className="kumpi-themes">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`kumpi-theme${t.id === theme ? " is-selected" : ""}`}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="kumpi-modes">
            <button type="button" className="kumpi-mode" onClick={() => start("round")}>
              <span>
                10 kaksintaistelua
                <small>Nopea kierros — montako saat oikein?</small>
              </span>
              <span aria-hidden>→</span>
            </button>
            <button type="button" className="kumpi-mode is-ghost" onClick={() => start("endless")}>
              <span>
                🔥 Putki
                <small>Loputon. Yksi väärin ja peli on ohi.</small>
              </span>
              <span aria-hidden>→</span>
            </button>
          </div>

          {best > 0 && <p className="kumpi-best">Paras putki tässä istunnossa: {best}</p>}
          <Link href="/" className="kumpi-back">
            ← Takaisin etusivulle
          </Link>
        </div>
      </main>
    );
  }

  /* ─── Tulos ─────────────────────────────────────────────────────── */
  if (phase === "end") {
    const ratio = correctCount / ROUND_LEN;
    const title =
      mode === "endless"
        ? correctCount >= 10
          ? "Uskomaton putki!"
          : "Putki katkesi"
        : ratio >= 0.9
          ? "Niekka itse!"
          : ratio >= 0.7
            ? "Hienoa, Niekka!"
            : ratio >= 0.5
              ? "Ihan kiva!"
              : "No voi Niekka…";
    const lead =
      mode === "endless"
        ? `Ennätyksesi tässä istunnossa: ${Math.max(best, correctCount)}`
        : ratio >= 0.7
          ? "Vahva suoritus!"
          : "Huomenna uudestaan.";

    return (
      <main className="kumpi-result">
        <div className="kumpi-result-inner">
          <div className="kumpi-trophy" aria-hidden>
            {mode === "endless" ? "🔥" : "🏆"}
          </div>
          <h1>{title}</h1>
          <p className="kumpi-result-lead">{lead}</p>
          <p className="kumpi-bigscore">
            {mode === "endless"
              ? `${correctCount} oikein putkeen`
              : `${correctCount}/${ROUND_LEN} oikein`}
          </p>
          <p className="kumpi-points">{score.toLocaleString("fi-FI")} pistettä</p>
          <p className="kumpi-putki">
            🔥 Putki avattu! Pelaa huomenna uudestaan, niin se jatkuu.
          </p>
          <div className="kumpi-actions">
            <button type="button" className="btn btn-primary btn-large" onClick={() => start(mode)}>
              Pelaa uudelleen
            </button>
            <button type="button" className="kumpi-secondary" onClick={() => setPhase("intro")}>
              Vaihda teemaa
            </button>
            <Link href="/" className="kumpi-secondary">
              Takaisin etusivulle
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ─── Peli ──────────────────────────────────────────────────────── */
  if (!duel) return null;

  const cards = [duel.a, duel.b];
  const bothImages = !!(duel.a.image && duel.b.image);
  const revealed = picked !== null;

  return (
    <main
      className="kumpi-game"
      onClick={() => {
        if (revealed) advance();
      }}
    >
      <div className="kumpi-topbar">
        <div className="kumpi-toprow">
          <span className="kumpi-minilogo">
            <b>Tieto</b>niekka
          </span>
          <span className="kumpi-badges">
            {streak >= 2 && <span className="kumpi-streak">🔥 {streak}</span>}
            <span className="kumpi-score">
              Pisteet <b>{score.toLocaleString("fi-FI")}</b>
            </span>
          </span>
        </div>
        <div className="kumpi-progress">
          <i style={{ width: mode === "round" ? `${(index / ROUND_LEN) * 100}%` : "100%" }} />
        </div>
        <div className="kumpi-meta">
          <span>
            {mode === "round"
              ? `Kaksintaistelu ${Math.min(index + 1, ROUND_LEN)} / ${ROUND_LEN}`
              : `Putki · ${correctCount} oikein putkeen`}
          </span>
          <span className="kumpi-diff">
            <i style={{ background: DIFF_COLOR[duel.difficulty] }} />
            {duel.difficulty}
          </span>
        </div>
      </div>

      <div className="kumpi-question">
        <span className="kumpi-kicker">{duel.def.subject}</span>
        <h1
          className="kumpi-ask"
          style={{
            fontSize:
              duel.question.length > 24 ? 31 : duel.question.length > 16 ? 35 : 38,
          }}
        >
          {duel.question}
        </h1>
      </div>

      <div className="kumpi-cards">
        {cards.map((e, i) => {
          const state = !revealed
            ? ""
            : i === duel.correct
              ? " is-correct"
              : i === picked
                ? " is-wrong"
                : " is-dim";
          return (
            <div key={e.id} className="kumpi-card-slot">
              {i === 1 && (
                <div className="kumpi-vs" aria-hidden>
                  <i />
                  <span>vs</span>
                  <i />
                </div>
              )}
              <button
                type="button"
                className={`kumpi-card${state}`}
                onClick={(ev) => {
                  ev.stopPropagation();
                  answer(i);
                }}
                disabled={revealed}
              >
                {bothImages ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="kumpi-pic" src={e.image ?? ""} alt="" loading="eager" />
                ) : (
                  <span className="kumpi-mono" aria-hidden>
                    {e.name.charAt(0)}
                  </span>
                )}
                <span className="kumpi-name">
                  {e.name}
                  {showRoleOnCard(duel.def, e) && <small>{e.role}</small>}
                </span>
                <span className="kumpi-value">{revealed ? revealValue(duel, e) : ""}</span>
                <span className="kumpi-mark" aria-hidden>
                  {revealed && i === duel.correct ? "✓" : revealed && i === picked ? "✗" : ""}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="kumpi-reveal">
        {revealed && (
          <>
            <div className="kumpi-fact">
              <span>Tiesitkö?</span>
              <p>{duel.fact}</p>
            </div>
            {SHOW_CROWD_STATS && <div className="kumpi-crowd" />}
            <p className="kumpi-next">
              {roundOver.current ? "Napauta — näytä tulos" : "Napauta — seuraava"}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
