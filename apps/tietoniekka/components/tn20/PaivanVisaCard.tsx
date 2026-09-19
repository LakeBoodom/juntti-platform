"use client";
// TIETONIEKKA 2.0 — PÄIVÄN VISA -KORTTI (Design v0.3 kierros 14, toteutusohje
// 19.9.2026 luvut 5 ja 7). Korvasi 28.8. kortin, joka oletti päivänsankarin;
// sankari on nyt oma rivinsä kortin alla (PaivanSankari.tsx).
//
// Kolme tilaa (luku 7):
//   A  intro_headline + intro_text → koukkulaatta: päiväleima + koukkurivi +
//      selittävä virke. Laatta KORVAA visan kuvailevan tekstin.
//   B  ei introa → visan oma teaser, ei laattaa; päiväleima osion otsikossa.
//   C  vain intro_text → laatta ilman koukkuriviä.
// Kortin korkeus pysyy samana tilojen välillä (kuva määrää minimikorkeuden).
// Intro on pelkkää tekstiä (React escapettaa; ei markdownia eikä HTML:ää).
// Mobiilissa (kortti < 640 px) laatta on ennen kuvaa: päiväleima + koukkurivi
// laatassa, selittävä virke otsikon alla teaserin paikalla (14b). Tilassa C
// mobiililaatassa on päiväleima + teksti. Laatta renderöidään kahteen kohtaan
// ja piilotetaan container-kyselyllä (display: none → ei ruudunlukijalle).
//
// Pelattu tila luetaan localStoragesta (PAIVAN_VISA_KEY = tämän päivän
// päiväys Suomen aikaan), jonka GameClient kirjoittaa kun Päivän visa
// (?paivan_visa=1) pelataan loppuun. Päivän sankarin pelaaminen ei merkitse
// Päivän visaa pelatuksi.

import { useEffect, useState } from "react";
import { helsinginPaiva } from "@/lib/aika";
import { paivanVisaTila, type PaivanVisaData } from "@/lib/paivanVisa";

export const PAIVAN_VISA_KEY = "tn_paivan_visa_pelattu";

/** Tämän päivän avain Suomen aikaan ("2026-09-19"). */
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

export type { PaivanVisaData };

/** Pisimmän sanan merkkimäärä — otsikon koko sovitetaan sen mukaan. */
export function pisinSana(t: string): number {
  return Math.max(1, ...t.split(/\s+/).map((w) => Array.from(w).length));
}

export default function PaivanVisaCard({ data }: { data: PaivanVisaData }) {
  const [played, setPlayed] = useState(false);
  useEffect(() => setPlayed(isPlayedToday()), []);
  const tila = paivanVisaTila(data);
  const headline = tila === "A" ? data.intro!.headline : null;
  const text = tila === "B" ? null : data.intro!.text;

  const laatta = (mobiili: boolean) => (
    <div className={`tn-es-pv-hook ${mobiili ? "tn-es-v-mob" : "tn-es-v-desk"}`}>
      <span className="tn-es-pv-stamp">{data.stamp}</span>
      {headline && <p className="tn-es-pv-hook-h">{headline}</p>}
      {/* Tila A mobiilissa: selittävä virke otsikon alla, ei laatassa. */}
      {text && (!mobiili || tila === "C") && (
        <p className={tila === "C" ? "tn-es-pv-hook-t tn-es-pv-hook-t--c" : "tn-es-pv-hook-t"}>{text}</p>
      )}
    </div>
  );

  return (
    <div className="tn-es-pv-wrap">
      <div className="tn-es-pv" data-tila={tila} data-played={played ? "" : undefined}>
        {tila !== "B" && laatta(true)}
        <div className="tn-es-pv-media" data-kuva={data.imageUrl ? "1" : "0"}>
          {data.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.imageUrl} alt={data.imageAlt} fetchPriority="high" style={{ objectPosition: data.imagePos }} />
          )}
        </div>
        <div className="tn-es-pv-body">
          <div className="tn-es-pv-metarow">
            {played ? (
              <span className="tn-es-pv-badge tn-es-pv-badge--done">✓ Tämän päivän visa on pelattu</span>
            ) : (
              <a className="tn-es-pv-badge" href={data.badge.href}>{data.badge.label}</a>
            )}
            {data.meta && <span className="tn-es-pv-meta">{data.meta}</span>}
          </div>
          {/* Otsikon koko sovitetaan pisimpään sanaan (KORTTISÄÄNTÖ, etusivu.css). */}
          <div className="tn-es-pv-titlebox" style={{ ["--tnpv-lw" as string]: pisinSana(data.title) }}>
            <h3 className="tn-es-pv-title">{data.title}</h3>
          </div>
          {tila === "B" && data.lede && <p className="tn-es-pv-lede">{data.lede}</p>}
          {tila === "A" && text && <p className="tn-es-pv-lede tn-es-v-mob">{text}</p>}
          {tila !== "B" && laatta(false)}
          <div className="tn-es-pv-actions">
            {played ? (
              <a className="tn-es-pv-btn" href={data.playedHref}>Lisää visoja <span aria-hidden>→</span></a>
            ) : (
              <a className="tn-es-pv-btn" href={data.playHref}>Pelaa päivän visa <span aria-hidden>→</span></a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
