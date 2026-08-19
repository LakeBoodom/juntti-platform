"use client";
// TIETONIEKKA 2.0 — Päivän visa -kortti (design_handoff_etusivu_2026 §3,
// toteutettu 18.8.2026 — korvasi 15.8. CD-paketin kuoren; toimintalogiikka
// säilyi: vastaus käynnistää pelin ja vie kysymykseen 2 samaan sessioon).
//
// Identiteettinauha, kolme tapausta (dataohjattu, README):
//  1. portrait  — henkilökuva NELIÖNÄ 140×140 vasemmalla, violetti duotone
//                 (CSS-filter), tausta violetti liuku + #1B1710. Ei koskaan
//                 venytetä vaakabanneriksi.
//  2. landscape — visan topicImg täyttää 140 px:n nauhan, tumma liuku päällä.
//  3. none      — mediakaistaa EI varata; pelkkä tekstirivi (chip + otsikko).
// Kysymysalue: "KYSYMYS n/N" + N-osainen edistymispalkki + kysymys +
// vastaukset 2×2-ruudukossa (min 64 px). Vastaukset ovat sivun ENSISIJAINEN
// toiminto — kortissa ei ole erillistä pelinappia eikä jatkopolkulinkkiä
// (Heikin C-päätös 17.8.2026 poisti "Katso koko visa ensin →" -linkin).
// Interaktio (README): klikkaus → palautetila (oikea lime + ✓, muut vaimenevat)
// → 900 ms → siirtymä peliin kysymykseen 2 (sessionStorage-silta GameClientiin).
// "Tänään jo pelattu" -tila säilyy 15.8. toteutuksesta (README ei speksaa sitä).

import { useEffect, useState } from "react";

/** Sama avain kuin PutkiCardissa/GameClientissa (tn_paivan_visa_putki). */
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
  collectionName: string;
  accent: string;
  playedToday: boolean;
  person?: {
    name: string;
    age: number;
    birthDateLabel: string;
    role: string;
    portraitUrl: string | null;
    creditUrl: string | null;
    isToday: boolean;
  } | null;
  image?: { url: string; focalX?: number; focalY?: number } | null;
  firstQuestion: {
    text: string;
    options: string[];
    correct: string;
  };
  /** Peliin siirryttäessä käytettävä perus-URL (ilman vastaus-parametria) */
  playHref: string;
};

/** sessionStorage-silta GameClientiin (esitäytetty 1. vastaus → kysymys 2). */
const DAILY_ANSWER_KEY = "tn_daily_card_answer";

/** README: palautetila näkyy 900 ms ennen siirtymää kysymykseen 2. */
const FEEDBACK_MS = 900;

function letterFor(i: number): string {
  return ["A", "B", "C", "D"][i] ?? String(i + 1);
}

export function DailyQuizCard({ variant, data }: { variant: DailyQuizVariant; data: DailyQuizCardData }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [playedToday, setPlayedToday] = useState(false);
  useEffect(() => setPlayedToday(isPlayedToday()), []);

  function pick(option: string) {
    if (picked) return;
    setPicked(option);
    try {
      window.sessionStorage.setItem(
        DAILY_ANSWER_KEY,
        JSON.stringify({ quizId: data.quizId, option, ts: Date.now() })
      );
    } catch {
      /* no-op */
    }
    // Palautetila 900 ms (README) → sitten peliin kysymykseen 2. GameClient
    // tekee varsinaisen quiz_plays-tallennuksen kuten ennenkin.
    window.setTimeout(() => {
      window.location.href = `${data.playHref}${data.playHref.includes("?") ? "&" : "?"}kortista=1`;
    }, FEEDBACK_MS);
  }

  const q = data.firstQuestion;
  const feedback = picked !== null;

  /* Pelattu tänään -tila (Heikin katselmus 18.8.2026): tekstit kortin KUVAN
     päälle — kompakti kortti ilman tyhjää tilaa.
     Henkilövisa (Heikin katselmus 19.8.2026): duotone-kuva EI toimi koko
     kortin taustana (rajaus leikkaa henkilön) → sama asettelu kuin
     alkunäkymässä: pieni neliökuva vasemmalla, lopputekstit oikealla. */
  if (playedToday) {
    if (variant === "birthday" && data.person) {
      return (
        <article className="tn-es-dq tn-es-dq-done tn-es-dq-doneperson" style={{ ["--dq-accent" as string]: data.accent }}>
          {data.person.portraitUrl && (
            <div className="tn-es-dq-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.person.portraitUrl} alt={data.person.name} />
            </div>
          )}
          <div className="tn-es-dq-doneside">
            <span className="tn-es-dq-chip">Tänään juhlii</span>
            <h2 className="tn-es-dq-name">
              <b>{data.person.age} vuotta</b> — {data.person.name}
            </h2>
            <div className="tn-es-dq-meta2">
              Syntynyt {data.person.birthDateLabel} · {data.person.role}
            </div>
            <div className="tn-es-dq-donerow">
              <div className="tn-es-dq-played-icon" aria-hidden>
                ✓
              </div>
              <div>
                <div className="tn-es-dq-label">Tämän päivän visa on pelattu</div>
                <p className="tn-es-dq-played-msg">Muista palata huomenna jatkamaan putkea!</p>
              </div>
            </div>
          </div>
        </article>
      );
    }
    const coverUrl = variant === "image" && data.image ? data.image.url : null;
    return (
      <article className="tn-es-dq tn-es-dq-done" style={{ ["--dq-accent" as string]: data.accent }}>
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="tn-es-dq-donebg"
            src={coverUrl}
            alt=""
            style={
              data.image
                ? { objectPosition: `${(data.image.focalX ?? 0.5) * 100}% ${(data.image.focalY ?? 0.46) * 100}%` }
                : undefined
            }
          />
        )}
        <div className="tn-es-dq-donescrim" aria-hidden />
        <div className="tn-es-dq-donehead">
          <span className="tn-es-dq-chip">{data.collectionName}</span>
          <h2 className="tn-es-dq-name">{data.title}</h2>
        </div>
        <div className="tn-es-dq-donemsg">
          <div className="tn-es-dq-played-icon" aria-hidden>
            ✓
          </div>
          <div className="tn-es-dq-label">Tämän päivän visa on pelattu</div>
          <p className="tn-es-dq-played-msg">Muista palata huomenna jatkamaan putkea!</p>
        </div>
      </article>
    );
  }

  return (
    <article className="tn-es-dq" style={{ ["--dq-accent" as string]: data.accent }}>
      {/* ─── Identiteettinauha (3 tapausta) ─── */}
      {variant === "birthday" && data.person ? (
        <div className="tn-es-dq-band tn-es-dq-band-portrait">
          {data.person.portraitUrl && (
            <div className="tn-es-dq-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.person.portraitUrl} alt={data.person.name} />
              {data.person.creditUrl && (
                <a
                  className="tn-es-dq-credit"
                  href={data.person.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${data.person.name} — kuva: Wikipedia`}
                >
                  Wikipedia
                </a>
              )}
            </div>
          )}
          <div className="tn-es-dq-band-text">
            <span className="tn-es-dq-chip">Tänään juhlii</span>
            <h2 className="tn-es-dq-name">
              <b>{data.person.age} vuotta</b> — {data.person.name}
            </h2>
            <div className="tn-es-dq-meta2">
              Syntynyt {data.person.birthDateLabel} · {data.person.role}
            </div>
          </div>
        </div>
      ) : variant === "image" && data.image ? (
        <div className="tn-es-dq-band tn-es-dq-band-landscape">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="tn-es-dq-bandimg"
            src={data.image.url}
            alt=""
            style={{ objectPosition: `${(data.image.focalX ?? 0.5) * 100}% ${(data.image.focalY ?? 0.46) * 100}%` }}
          />
          <div className="tn-es-dq-scrim" aria-hidden />
          <div className="tn-es-dq-band-text">
            <span className="tn-es-dq-chip">{data.collectionName}</span>
            <h2 className="tn-es-dq-name">{data.title}</h2>
            {data.tagline && <div className="tn-es-dq-meta2">{data.tagline}</div>}
          </div>
        </div>
      ) : (
        /* Ei kuvaa → mediakaistaa ei varata (README) — pelkkä tekstirivi */
        <div className="tn-es-dq-band tn-es-dq-band-none">
          <div className="tn-es-dq-band-text">
            <span className="tn-es-dq-chip">{data.collectionName}</span>
            <h2 className="tn-es-dq-name">{data.title}</h2>
            {data.tagline && <div className="tn-es-dq-meta2">{data.tagline}</div>}
          </div>
        </div>
      )}

      {/* ─── Kysymysalue ─── */}
      {(
        <div className="tn-es-dq-q">
          <div className="tn-es-dq-label">Kysymys 1/{data.questionCount}</div>
          <div className="tn-es-dq-bars" aria-hidden>
            {Array.from({ length: data.questionCount }, (_, i) => (
              <span key={i} className="tn-es-dq-bar" data-state={i === 0 ? "current" : undefined} />
            ))}
          </div>
          <h3 className="tn-es-dq-qtext">{q.text}</h3>
          <div className="tn-es-dq-opts">
            {q.options.map((opt, i) => {
              const isCorrect = opt === q.correct;
              const state = !feedback ? undefined : isCorrect ? "correct" : "dim";
              return (
                <button
                  key={opt}
                  type="button"
                  className="tn-es-dq-opt"
                  data-state={state}
                  aria-label={`Vaihtoehto ${letterFor(i)}: ${opt}`}
                  onClick={() => pick(opt)}
                  disabled={feedback}
                >
                  <span className="tn-es-dq-optletter">{letterFor(i)}</span>
                  <span className="tn-es-dq-opttext">{opt}</span>
                  {feedback && isCorrect && (
                    <span className="tn-es-dq-optcheck" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

export { DAILY_ANSWER_KEY };
