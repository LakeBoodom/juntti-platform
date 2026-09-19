"use client";
// TIETONIEKKA 2.0 — PÄIVÄN VISA -KORTTI (design_handoff_etusivu_2026_prod,
// toteutettu 28.8.2026 — korvasi 18.8. DailyQuizCardin, jossa oli upotettu
// ensimmäinen kysymys). Designin mukainen vaakakortti: kuva vasemmalla (26/74-
// jako, pinoutuu kapealla) + merkki + otsikko + meta + kuvaus + pelinappi.
//
// Heikin linjaus 19.9.2026: Päivän visa EI ole päivänsankarikortti. Kierrossa
// voi olla synttäri-, kaupunki-, luonto- tai mikä tahansa visa, ja sen visan
// oma kuva näytetään aina. Kortti ei oleta julkkista:
//  - Merkki on visan kategoria (sama resolveri kuin pelisivun .tng-cat,
//    lib/visanKokoelma.ts) ja linkki sen kokoelmasivulle. Aiemmin merkki oli
//    `collection` ("Yleistieto" → 404) tai "Tänään juhlii".
//  - Kuva ratkaistaan palvelimella (app/(tn20)/page.tsx, paivanVisanKuva):
//    quizzes.image_url → julkkiksen kuva → visan teemakuva → kaupunkikuva →
//    kokoelmakuva. Jos mitään ei ole, näytetään brändipinta ilman tekstiä —
//    designin sisäinen "Kuva — päivänsankari" -työnimi ei näy koskaan.
//  - Kuva on koristeellinen (otsikko kertoo aiheen vieressä), joten se on
//    aria-hidden eikä role="img" + epämääräinen aria-label.
//
// Kaksi tilaa (design: fresh / played). Played-tila luetaan omasta
// localStorage-avaimesta (PAIVAN_VISA_KEY = tämän päivän päiväys), jonka
// GameClient kirjoittaa kun Päivän visa pelataan loppuun.

import { useEffect, useState } from "react";
import { helsinginPaiva } from "@/lib/aika";

export const PAIVAN_VISA_KEY = "tn_paivan_visa_pelattu";

/** Tämän päivän avain Suomen aikaan ("2026-09-19"). 19.9.2026: aiemmin
    selaimen oma aikavyöhyke — ulkomailla pelattu tila vaihtui eri hetkellä kuin
    etusivun Päivän visa, joka lasketaan palvelimella Suomen aikaan
    (lib/aika.ts). Muoto on sama, joten jo tallennetut merkinnät kelpaavat. */
export function localDateKey(n: Date = new Date()) {
  return helsinginPaiva(n).iso;
}

function isPlayedToday(): boolean {
  try {
    return window.localStorage.getItem(PAIVAN_VISA_KEY) === localDateKey();
  } catch {
    return false;
  }
}

export type PaivanVisaData = {
  /** Visan kategoria ja sen kokoelmasivu: "Suomen kaupungit" → /kokoelma/kaupungit */
  badge: { label: string; href: string };
  title: string; // "62 vuotta — Antti Reini" / visan nimi
  meta: string | null; // "Tänään juhlii · Syntynyt 27.8.1964 · Näyttelijä" / "10 kysymystä"
  lede: string | null;
  /** Ratkaistu kuva; null → brändipinta */
  imageUrl: string | null;
  imagePos?: string;
  playHref: string;
  playedHref: string;
  playedCta: string; // "Pelaa henkilövisoja →" / "Lisää visoja →"
};

export default function PaivanVisaCard({ data }: { data: PaivanVisaData }) {
  const [played, setPlayed] = useState(false);
  useEffect(() => setPlayed(isPlayedToday()), []);

  return (
    <div className="tn-es-day" data-played={played ? "" : undefined}>
      <div className="tn-es-day-media" data-kuva={data.imageUrl ? "1" : "0"} aria-hidden="true">
        {data.imageUrl && (
          <>
            {/* Sama kuvio kuin etusivun muissa korteissa (.tn-es-card-bg). */}
            <span
              className="tn-es-card-bg"
              style={{ backgroundImage: `url(${data.imageUrl})`, backgroundPosition: data.imagePos ?? "50% 40%" }}
            />
            <span className="tn-es-day-shade" />
          </>
        )}
      </div>
      <div className="tn-es-day-body">
        {played ? (
          <span className="tn-es-day-badge tn-es-day-badge--done">✓ Tämän päivän visa on pelattu</span>
        ) : (
          <a className="tn-es-day-badge" href={data.badge.href}>{data.badge.label}</a>
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
