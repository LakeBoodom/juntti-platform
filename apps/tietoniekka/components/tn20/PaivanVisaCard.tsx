"use client";
// TIETONIEKKA 2.0 — PÄIVÄN VISA -KORTTI (design_handoff_etusivu_2026_prod,
// toteutettu 28.8.2026 — korvasi 18.8. DailyQuizCardin, jossa oli upotettu
// ensimmäinen kysymys). Designin mukainen vaakakortti: kuva vasemmalla (26/74-
// jako, pinoutuu kapealla) + merkki + otsikko + meta + kuvaus + pelinappi.
//
// Kaksi tilaa (design: fresh / played):
//  - fresh:  "Tänään juhlii" (synttärisankari) tai kokoelman nimi (adminin valitsema
//            visa) → "Pelaa päivän visa →"
//  - played: "✓ Tämän päivän visa on pelattu" → "Pelaa henkilövisoja →" (sankari) /
//            kokoelman hubiin (visa). Tila luetaan omasta localStorage-avaimesta
//            (PAIVAN_VISA_KEY = tämän päivän päiväys), jonka GameClient kirjoittaa
//            kun Päivän visa pelataan loppuun — EI putkiavaimesta, koska putki
//            jatkuu 28.8.2026 alkaen mistä tahansa visasta.
// Kuva: sankarin oma kuva (celebrities.image_url) tai visan teemakuva (topicImg);
// designin "Kuva — päivänsankari" -paikkamerkki näytetään vain jos kuvaa ei ole.

import { useEffect, useState } from "react";

export const PAIVAN_VISA_KEY = "tn_paivan_visa_pelattu";

export function localDateKey(n: Date = new Date()) {
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function isPlayedToday(): boolean {
  try {
    return window.localStorage.getItem(PAIVAN_VISA_KEY) === localDateKey();
  } catch {
    return false;
  }
}

export type PaivanVisaData = {
  badge: string; // "Tänään juhlii" / kokoelman nimi
  title: string; // "62 vuotta — Antti Reini" / visan nimi
  meta: string | null; // "Syntynyt 27.8.1964 · Näyttelijä" / "10 kysymystä"
  lede: string | null;
  imageUrl: string | null;
  imagePos?: string;
  imageAlt: string;
  playHref: string;
  playedHref: string;
  playedCta: string; // "Pelaa henkilövisoja →" / "Lisää visoja →"
};

export default function PaivanVisaCard({ data }: { data: PaivanVisaData }) {
  const [played, setPlayed] = useState(false);
  useEffect(() => setPlayed(isPlayedToday()), []);

  return (
    <div className="tn-es-day" data-played={played ? "" : undefined}>
      <div className="tn-es-day-media" role="img" aria-label={data.imageAlt}>
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.imageUrl} alt="" loading="lazy" style={{ objectPosition: data.imagePos ?? "50% 40%" }} />
        ) : (
          <span className="tn-es-day-ph">Kuva — päivänsankari</span>
        )}
      </div>
      <div className="tn-es-day-body">
        {played ? (
          <span className="tn-es-day-badge tn-es-day-badge--done">✓ Tämän päivän visa on pelattu</span>
        ) : (
          <span className="tn-es-day-badge">{data.badge}</span>
        )}
        <h3 className="tn-es-day-title">{data.title}</h3>
        {data.meta && <div className="tn-es-day-meta">{data.meta}</div>}
        {data.lede && <p className="tn-es-day-lede">{data.lede}</p>}
        <div className="tn-es-day-actions">
          {played ? (
            <a className="tn-es-btn" href={data.playedHref}>{data.playedCta}</a>
          ) : (
            <a className="tn-es-btn" href={data.playHref}>Pelaa päivän visa →</a>
          )}
        </div>
      </div>
    </div>
  );
}
