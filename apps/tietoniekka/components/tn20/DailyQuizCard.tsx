"use client";
// TIETONIEKKA 2.0 — Päivän visa: yhtenäinen kortti, 3 tilaa (CD-design 15.8.2026)
// design_handoff_paivan_visa/README.md — yksi komponentti, kolme skiniä.
// Vain aihenauha (vyöhyke 1) vaihtuu tilan mukaan; kysymys (vyöhyke 2) ja
// jatkopolku (vyöhyke 3) ovat identtiset kaikissa tiloissa. Kuva ei enää vie
// puolta ruudusta — kiinteän korkuinen nauha (150px / 104px mobiili), josta
// ensimmäinen kysymys näkyy heti. Vastaus kortista käynnistää pelin
// kysymyksestä 2 samassa sessiossa kuin "Pelaa päivän visa" (ks. GameClient
// DAILY_ANSWER_KEY-sessionStorage-silta).
//
// Variantin päättely tehdään YHDESSÄ paikassa (app/2-0/page.tsx:n getData/
// render), ei täällä — tämä komponentti vain piirtää sen minkä propina saa.

import { useEffect, useState } from "react";

/** Sama avain kuin PutkiCardissa/GameClientissa (tn_paivan_visa_putki).
    Client-only tieto — SSR ei tiedä onko tänään jo pelattu, joten kortti
    tarkistaa sen itse mountissa ja vaihtaa kysymysalueen "pelattu"-tekstiksi.
    VÄLIAIKAINEN RATKAISU (Heikki 15.8.2026): README:n mukaan tälle tilalle
    ei ole vielä designia — vaihdetaan pois kun CD toimittaa sen. */
function isPlayedToday(): boolean {
  try {
    const d = (n: Date) => `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    const raw = window.localStorage.getItem("tn_paivan_visa_putki");
    if (!raw) return false;
    const { last } = JSON.parse(raw) as { last: string };
    return last === d(new Date());
  } catch {
    return false;
  }
}

export type DailyQuizVariant = "birthday" | "image" | "plain";

export type DailyQuizCardData = {
  quizId: string;
  title: string;
  tagline?: string | null;
  questionCount: number;
  collectionName: string; // chipin teksti plain/image-tilassa
  accent: string; // kokoelmaväri hex, esim. "#46D6C8"
  playedToday: boolean;
  /** birthday-tilan lisätiedot */
  person?: {
    name: string;
    age: number;
    birthDateLabel: string; // "14.8.1971"
    role: string;
    portraitUrl: string | null;
    creditUrl: string | null;
    isToday: boolean;
  } | null;
  /** image-tilan kuva (kulttuuri/luonto/urheilu/matkakohteet topicImg) */
  image?: { url: string; focalX?: number; focalY?: number } | null;
  firstQuestion: {
    text: string;
    options: string[]; // A–D järjestyksessä, kirjain päätellään indeksistä
    correct: string;
  };
  /** Kuvaton/synttäri ilman kuvaa -tilan jatkolinkki oikealla (vyöhyke 3) */
  browseHref: string;
  browseLabel: string; // "Lisää tunnettuja henkilöitä →" | "Katso koko visa ensin →"
  /** Peliin siirryttäessä käytettävä perus-URL (ilman vastaus-parametria) */
  playHref: string;
};

/** sessionStorage-silta: kortin vastaus siirtyy GameClientille, joka
    käynnistyy suoraan play-vaiheesta esitäytetyllä 1. vastauksella sen
    sijaan että näyttäisi intron uudelleen. Avain jaettu GameClient.tsx:n
    kanssa (DAILY_ANSWER_KEY). */
const DAILY_ANSWER_KEY = "tn_daily_card_answer";

function letterFor(i: number): string {
  return ["A", "B", "C", "D"][i] ?? String(i + 1);
}

export function DailyQuizCard({ variant, data }: { variant: DailyQuizVariant; data: DailyQuizCardData }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [playedToday, setPlayedToday] = useState(false);
  useEffect(() => setPlayedToday(isPlayedToday()), []);

  function pick(option: string) {
    if (picked || navigating) return;
    setPicked(option);
    setNavigating(true);
    try {
      window.sessionStorage.setItem(
        DAILY_ANSWER_KEY,
        JSON.stringify({ quizId: data.quizId, option, ts: Date.now() })
      );
    } catch {
      /* no-op */
    }
    // Optimistinen siirtymä — ei odoteta mitään verkkokutsua. GameClient
    // tekee varsinaisen quiz_plays-tallennuksen kuten ennenkin.
    window.location.href = `${data.playHref}${data.playHref.includes("?") ? "&" : "?"}kortista=1`;
  }

  const q = data.firstQuestion;

  return (
    <article className="tn-dqc" style={{ ["--tn-dqc-accent" as string]: data.accent }}>
      {/* ─── Vyöhyke 1 · Aihenauha — ainoa muuttuva osa ─── */}
      {variant === "birthday" && data.person ? (
        <div className="tn-dqc-band tn-dqc-band-birthday">
          {data.person.portraitUrl ? (
            <div className="tn-dqc-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.person.portraitUrl} alt={data.person.name} />
              {data.person.creditUrl && (
                <a
                  className="tn-dqc-credit"
                  href={data.person.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  Wikipedia
                </a>
              )}
            </div>
          ) : null}
          <div className="tn-dqc-band-text">
            <span className="tn-dqc-chip tn-dqc-chip-birthday">Tänään juhlii</span>
            <h2 className="tn-dqc-title">
              <b>{data.person.age} vuotta</b> — {data.person.name}
            </h2>
            <div className="tn-dqc-sub">
              Syntynyt {data.person.birthDateLabel} · {data.person.role}
            </div>
          </div>
        </div>
      ) : variant === "image" && data.image ? (
        <div className="tn-dqc-band tn-dqc-band-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="tn-dqc-bandimg"
            src={data.image.url}
            alt=""
            style={{
              objectPosition: `${(data.image.focalX ?? 0.5) * 100}% ${(data.image.focalY ?? 0.46) * 100}%`,
            }}
          />
          <div className="tn-dqc-scrim" aria-hidden />
          <div className="tn-dqc-band-text">
            <span className="tn-dqc-chip">{data.collectionName}</span>
            <h2 className="tn-dqc-title">{data.title}</h2>
            {data.tagline && <div className="tn-dqc-sub tn-dqc-clamp1">{data.tagline}</div>}
          </div>
        </div>
      ) : (
        <div className="tn-dqc-band tn-dqc-band-plain">
          <div className="tn-dqc-plain-lines" aria-hidden />
          <div className="tn-dqc-band-text">
            <span className="tn-dqc-chip">{data.collectionName}</span>
            <h2 className="tn-dqc-title">{data.title}</h2>
            {data.tagline && <div className="tn-dqc-sub tn-dqc-clamp1">{data.tagline}</div>}
          </div>
        </div>
      )}

      {/* ─── Vyöhyke 2 · Kysymys — identtinen kaikissa tiloissa,
             PAITSI kun päivän visa on jo pelattu tänään (väliaikainen
             ratkaisu, ei vielä CD-designattu — Heikki 15.8.2026). ─── */}
      {playedToday ? (
        <div className="tn-dqc-question tn-dqc-played">
          <div className="tn-dqc-meta">Tänään pelattu</div>
          <p className="tn-dqc-played-msg">Palaat huomenna uuteen päivän visaan.</p>
        </div>
      ) : (
        <div className="tn-dqc-question">
          <div className="tn-dqc-meta">Kysymys 1/{data.questionCount}</div>
          <div className="tn-dqc-bars" aria-hidden>
            {Array.from({ length: data.questionCount }, (_, i) => (
              <span key={i} className="tn-dqc-bar" data-active={i === 0 || undefined} />
            ))}
          </div>
          <h3 className="tn-dqc-qtext">{q.text}</h3>
          <div className="tn-dqc-options">
            {q.options.map((opt, i) => (
              <button
                key={opt}
                type="button"
                className="tn-dqc-opt"
                data-picked={picked === opt || undefined}
                aria-label={`Vaihtoehto ${letterFor(i)}: ${opt}`}
                onClick={() => pick(opt)}
                disabled={navigating}
              >
                <span className="tn-dqc-optletter">{letterFor(i)}</span>
                <span className="tn-dqc-opttext">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Vyöhyke 3 · Jatkopolku ─── */}
      <div className="tn-dqc-foot">
        <span className="tn-dqc-foot-hint">
          {playedToday ? "Putki jatkuu huomenna." : "Vastaus aloittaa päivän visan ja kirjaa putken."}
        </span>
        <a className="tn-dqc-foot-link" href={data.browseHref}>
          {data.browseLabel}
        </a>
      </div>
    </article>
  );
}

export { DAILY_ANSWER_KEY };
