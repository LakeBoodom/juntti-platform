"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DUEL_THEMES, type DuelData } from "../../lib/duel";
import { makeRankTask, scoreOrder, type RankItem, type RankTask } from "../../lib/rank";

const ROUND_LEN = 5;

type Phase = "intro" | "play" | "end";

export function JarjestaClient({ data }: { data: DuelData }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [theme, setTheme] = useState("sekoitus");

  const [task, setTask] = useState<RankTask | null>(null);
  const [order, setOrder] = useState<RankItem[]>([]);
  const [checked, setChecked] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [perfect, setPerfect] = useState(0);

  const used = useRef<Set<string>>(new Set());

  const themes = useMemo(() => {
    const available = new Set(
      data.defs.filter((d) => d.rankLabel !== null && d.mode !== "flag").map((d) => d.theme),
    );
    return DUEL_THEMES.filter((t) => t.id === "sekoitus" || available.has(t.id));
  }, [data.defs]);

  const nextTask = useCallback(
    (t: string) => {
      let next = makeRankTask(data, t, used.current);
      if (!next) {
        // Aineisto käytiin läpi — aloitetaan kierrätys alusta.
        used.current.clear();
        next = makeRankTask(data, t, used.current);
      }
      setTask(next);
      setOrder(next ? next.shuffled : []);
      setChecked(false);
    },
    [data],
  );

  const start = (t: string) => {
    setTheme(t);
    setIndex(0);
    setScore(0);
    setPerfect(0);
    used.current.clear();
    setPhase("play");
    nextTask(t);
  };

  const move = (from: number, dir: -1 | 1) => {
    if (checked) return;
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    setOrder(next);
  };

  const check = () => {
    if (!task || checked) return;
    const right = scoreOrder(order, task.solution);
    setScore((s) => s + right);
    if (right === task.solution.length) setPerfect((p) => p + 1);
    setChecked(true);
  };

  const advance = () => {
    const n = index + 1;
    if (n >= ROUND_LEN) {
      setPhase("end");
      return;
    }
    setIndex(n);
    nextTask(theme);
  };

  /* ── Aloitus ─────────────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <main className="jrj-intro">
        <div className="jrj-intro-inner">
          <span className="jrj-eyebrow">Tietoniekka</span>
          <h1 className="jrj-title">JÄRJESTÄ OIKEIN</h1>
          <p className="jrj-lede">
            Viisi asiaa, yksi oikea järjestys. Tiedät varmasti ensimmäisen ja viimeisen —
            mutta entä ne siltä väliltä?
          </p>

          <span className="jrj-themelabel">Teema</span>
          <div className="jrj-themes">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`jrj-theme${t.id === theme ? " is-selected" : ""}`}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button type="button" className="jrj-cta" onClick={() => start(theme)}>
            PELAA →
          </button>
          <Link href="/kumpi" className="jrj-sidelink">
            Kokeile myös Kumpi?
          </Link>
        </div>
      </main>
    );
  }

  /* ── Loppuruutu ──────────────────────────────────────────── */
  if (phase === "end") {
    const max = ROUND_LEN * 5;
    return (
      <main className="jrj-result">
        <div className="jrj-result-inner">
          <span className="jrj-eyebrow">Tulos</span>
          <p className="jrj-bigscore">
            {score}
            <span>/ {max}</span>
          </p>
          <p className="jrj-resulttext">
            {perfect === ROUND_LEN
              ? "Kaikki viisi täydellisesti. Tämä ei ollut tuuria."
              : perfect > 0
                ? `${perfect} ${perfect === 1 ? "tehtävä" : "tehtävää"} täysin oikein.`
                : "Oikeita sijoituksia kertyi, vaikka täysosuma jäi uupumaan."}
          </p>
          <button type="button" className="jrj-cta" onClick={() => start(theme)}>
            PELAA UUDESTAAN →
          </button>
          <Link href="/" className="jrj-sidelink">
            Takaisin etusivulle
          </Link>
        </div>
      </main>
    );
  }

  /* ── Peli ────────────────────────────────────────────────── */
  if (!task) {
    return (
      <main className="jrj-intro">
        <div className="jrj-intro-inner">
          <p className="jrj-lede">Tälle teemalle ei löytynyt tehtäviä.</p>
          <button type="button" className="jrj-cta" onClick={() => setPhase("intro")}>
            Takaisin
          </button>
        </div>
      </main>
    );
  }

  const rightCount = checked ? scoreOrder(order, task.solution) : 0;
  const shown = checked ? task.solution : order;

  return (
    <main className="jrj-play">
      <header className="jrj-bar">
        <span className="jrj-progress">
          {index + 1} / {ROUND_LEN}
        </span>
        <span className={`jrj-diff jrj-diff--${task.difficulty}`}>{task.difficulty}</span>
        <span className="jrj-score">{score} p</span>
      </header>

      <p className="jrj-instruction">
        Järjestä <strong>{task.label}</strong>
      </p>

      <ol className="jrj-list">
        {shown.map((item, i) => {
          const wasRight = checked && order[i]?.entity.id === task.solution[i].entity.id;
          return (
            <li
              key={item.entity.id}
              className={`jrj-row${checked ? (wasRight ? " is-right" : " is-wrong") : ""}`}
            >
              <span className="jrj-pos">{i + 1}</span>
              <span className="jrj-name">{item.entity.name}</span>
              {checked ? (
                <span className="jrj-value">{item.display}</span>
              ) : (
                <span className="jrj-moves">
                  <button
                    type="button"
                    aria-label={`Siirrä ${item.entity.name} ylöspäin`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Siirrä ${item.entity.name} alaspäin`}
                    disabled={i === order.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    ↓
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {checked ? (
        <div className="jrj-reveal">
          <p className="jrj-revealtext">
            {rightCount === task.solution.length
              ? "Täydellinen järjestys."
              : `${rightCount} / ${task.solution.length} oikeassa kohdassa.`}
          </p>
          <button type="button" className="jrj-cta" onClick={advance}>
            {index + 1 >= ROUND_LEN ? "NÄYTÄ TULOS →" : "SEURAAVA →"}
          </button>
        </div>
      ) : (
        <button type="button" className="jrj-cta" onClick={check}>
          TARKISTA →
        </button>
      )}
    </main>
  );
}
