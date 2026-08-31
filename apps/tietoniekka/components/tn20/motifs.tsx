// TIETONIEKKA 2.0 — SVG-motiivikirjasto (KORTTIJARJESTELMA.md §6, §10 Option A)
// Neon-viivatyyli: stroke = currentColor, hehku SVG-filtterillä.
// Motiivi on GENREN ominaisuus — uusi visa ei koskaan vaadi uutta grafiikkaa.
// Fallback-takuu: tuntematon genre → kokoelman yleismotiivi → yleinen "?".

import type { ReactElement } from "react";

type MotifProps = { id: string };

/** Yhteinen hehkufiltteri. id:n pitää olla uniikki per instanssi (SVG id -törmäykset). */
function Glow({ id }: MotifProps) {
  return (
    <defs>
      <filter id={`g-${id}`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ---------------- TV-genret (8) ---------------- */

const tvMotifs: Record<string, (p: MotifProps) => ReactElement> = {
  komedia: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <circle cx="60" cy="60" r="38" />
        <path d="M42 66 q18 22 36 0" strokeWidth={4} />
        <path d="M44 48 q5 -6 10 0 M66 48 q5 -6 10 0" />
        <path d="M97 28 l6 -10 M104 40 l11 -4 M90 20 l1 -12" opacity={0.7} />
      </g>
    </svg>
  ),
  draama: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M30 30 q30 14 60 0 q2 34 -30 52 q-32 -18 -30 -52 z" />
        <path d="M45 52 q5 6 10 0 M65 52 q5 6 10 0" />
        <path d="M46 70 q14 -8 28 0" />
      </g>
    </svg>
  ),
  rikosdraama: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} strokeWidth={2.6} filter={`url(#g-${id})`}>
        <path d="M60 22 a38 38 0 0 1 38 38 M60 34 a26 26 0 0 1 26 26 M60 46 a14 14 0 0 1 14 14" />
        <path d="M60 98 a38 38 0 0 1 -38 -38 M60 86 a26 26 0 0 1 -26 -26 M60 74 a14 14 0 0 1 -14 -14" />
        <circle cx="60" cy="60" r="4" />
      </g>
    </svg>
  ),
  scifi: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <circle cx="60" cy="60" r="24" />
        <ellipse cx="60" cy="60" rx="48" ry="14" transform="rotate(-18 60 60)" />
        <circle cx="26" cy="34" r="2" fill="currentColor" stroke="none" />
        <circle cx="98" cy="26" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="94" cy="92" r="2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  ),
  kauhu: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M38 96 V54 a22 22 0 0 1 44 0 v42" />
        <path d="M38 96 l7 -9 7 9 8 -9 8 9 8 -9 6 9" />
        <circle cx="52" cy="56" r="4" />
        <circle cx="68" cy="56" r="4" />
      </g>
    </svg>
  ),
  "tosi-tv": ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <rect x="26" y="38" width="52" height="44" rx="8" />
        <path d="M78 52 l20 -10 v36 l-20 -10 z" />
        <circle cx="52" cy="60" r="10" />
        <path d="M100 26 l4 -8 M108 36 l9 -3" opacity={0.7} />
      </g>
    </svg>
  ),
  dokumentti: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <circle cx="52" cy="52" r="26" />
        <path d="M71 71 l24 24" strokeWidth={5} />
        <path d="M40 52 h24 M52 40 v24" opacity={0.8} />
      </g>
    </svg>
  ),
  animaatio: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M22 88 q18 -52 38 -30 q20 22 38 -34" />
        <circle cx="60" cy="58" r="9" />
        <path d="M88 30 l5 -5 m-5 0 l5 5" opacity={0.8} />
        <path d="M30 42 l4 -4 m-4 0 l4 4" opacity={0.6} />
      </g>
    </svg>
  ),
};

/* ---------------- Urheilun laji-motiivit ---------------- */

const sportMotifs: Record<string, (p: MotifProps) => ReactElement> = {
  jalkapallo: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <circle cx="60" cy="60" r="36" />
        <path d="M60 42 l17 12 -6 20 h-22 l-6 -20 z" />
        <path d="M60 42 V24 M77 54 l17 -6 M71 74 l10 15 M49 74 l-10 15 M43 54 l-17 -6" />
      </g>
    </svg>
  ),
  jaakiekko: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M30 22 l26 52 q6 12 20 12 h16" />
        <path d="M90 22 l-26 52 q-6 12 -20 12 h-16" opacity={0.65} />
        <ellipse cx="60" cy="98" rx="14" ry="5" />
      </g>
    </svg>
  ),
  f1: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M18 74 h56 q12 0 18 -10 l10 -16" />
        <circle cx="40" cy="86" r="10" />
        <circle cx="84" cy="86" r="10" />
        <path d="M30 58 h28 M38 46 h30" opacity={0.7} />
      </g>
    </svg>
  ),
  tennis: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <ellipse cx="52" cy="46" rx="26" ry="32" transform="rotate(-24 52 46)" />
        <path d="M64 74 l26 26" strokeWidth={5} />
        <circle cx="92" cy="44" r="8" />
      </g>
    </svg>
  ),
  golf: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M52 96 V24 l28 10 -28 10" />
        <ellipse cx="60" cy="100" rx="26" ry="7" />
        <circle cx="84" cy="88" r="5" />
      </g>
    </svg>
  ),
  ralli: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M20 100 q30 -14 34 -40 q3 -22 24 -30" />
        <path d="M36 100 q22 -12 26 -36" opacity={0.5} />
        <path d="M86 22 h18 v14 h-18 z M86 36 h9 v-7 h9" strokeWidth={2.4} />
      </g>
    </svg>
  ),
  yleisurheilu: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <circle cx="74" cy="30" r="8" />
        <path d="M42 58 l20 -14 16 10 M62 44 l-6 26 14 24 M56 70 l-18 22" />
        <path d="M20 100 h80" opacity={0.5} />
      </g>
    </svg>
  ),
  stadion: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M20 84 a40 24 0 0 1 80 0" />
        <path d="M28 84 a32 18 0 0 1 64 0" opacity={0.6} />
        <path d="M24 60 l-6 -18 M60 50 v-20 M96 60 l6 -18" />
        <circle cx="54" cy="26" r="3" fill="currentColor" stroke="none" />
      </g>
    </svg>
  ),
};

/* ---------------- Fallbackit ---------------- */

const collectionFallback: Record<string, (p: MotifProps) => ReactElement> = {
  tv: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <rect x="24" y="40" width="72" height="52" rx="10" />
        <path d="M44 40 L60 22 L76 40" />
        <circle cx="60" cy="66" r="12" opacity={0.8} />
      </g>
    </svg>
  ),
  urheilu: sportMotifs.stadion,
  musiikki: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M48 88 V32 l36 -8 v56" />
        <circle cx="40" cy="88" r="9" />
        <circle cx="76" cy="80" r="9" />
      </g>
    </svg>
  ),
  elokuvat: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <rect x="24" y="34" width="72" height="56" rx="8" />
        <path d="M24 48 h72 M38 34 l8 14 M56 34 l8 14 M74 34 l8 14" />
        <path d="M52 62 l20 12 -20 12 z" />
      </g>
    </svg>
  ),
  matkakohteet: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <circle cx="60" cy="56" r="32" />
        <path d="M28 56 h64 M60 24 q16 14 16 32 t-16 32 M60 24 q-16 14 -16 32 t16 32" opacity={0.85} />
      </g>
    </svg>
  ),
  "tunnetut-henkilot": ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <circle cx="60" cy="46" r="16" />
        <path d="M32 96 q4 -26 28 -26 t28 26" />
        <path d="M88 28 l4 -8 M96 40 l9 -2" opacity={0.7} />
      </g>
    </svg>
  ),
  yleistieto: ({ id }) => (
    <svg viewBox="0 0 120 120" aria-hidden>
      <Glow id={id} />
      <g {...base} filter={`url(#g-${id})`}>
        <path d="M42 46 a18 18 0 1 1 24 17 q-6 3 -6 11" strokeWidth={4} />
        <circle cx="60" cy="92" r="3.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  ),
};

const genericFallback = collectionFallback.yleistieto;

/**
 * Palauttaa motiivin (collection, genre) -parille.
 * Takuu (KORTTIJARJESTELMA §6.3): palauttaa AINA jotain — kortti ei voi jäädä syntymättä.
 */
export function Motif({
  collection,
  genre,
  uid,
}: {
  collection: string | null;
  genre?: string | null;
  uid: string;
}) {
  const id = uid.slice(0, 8);
  if (collection === "tv" && genre && tvMotifs[genre]) return tvMotifs[genre]({ id });
  if (collection === "urheilu" && genre && sportMotifs[genre]) return sportMotifs[genre]({ id });
  if (collection && collectionFallback[collection]) return collectionFallback[collection]({ id });
  return genericFallback({ id });
}

/** Silhuetti henkilökortin fallbackiksi kun kuva puuttuu. */
export function PersonSilhouette() {
  return (
    <svg viewBox="0 0 120 160" aria-hidden>
      <g fill="currentColor">
        <circle cx="60" cy="56" r="26" />
        <path d="M14 160 q6 -52 46 -52 t46 52 z" />
      </g>
    </svg>
  );
}

/** Pelimuotomotiivit (etusivun Selaa lisää -kortit): Kumpi = kaksi vaihtoehtoa, Järjestä = rivit. */
export function ModeMotif({ mode }: { mode: "kumpi" | "jarjesta" }) {
  if (mode === "kumpi") {
    return (
      <svg viewBox="0 0 120 120" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <rect x="18" y="30" width="36" height="60" rx="8" />
          <rect x="66" y="30" width="36" height="60" rx="8" />
          <path d="M60 46 v28" opacity={0.5} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <rect x="26" y="26" width="68" height="16" rx="8" />
        <rect x="26" y="52" width="68" height="16" rx="8" />
        <rect x="26" y="78" width="68" height="16" rx="8" />
        <path d="M104 34 v52 m0 0 l-5 -6 m5 6 l5 -6" opacity={0.7} />
      </g>
    </svg>
  );
}
