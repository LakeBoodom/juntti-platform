// HUB-SIVUN RUNKO (Heikki 12.11.2026): sama kaikilla hub-sivuilla (vaihe 1 Tupla tai kuitti, vaihe 2 Megavisat,
// Karttapelit, Kokoelmat).
//   1. HERO = markkinointipaikka: kuva + pelin nimi (h1) + intro. Teksti omalla pohjallaan kuvan alla (ei kuvan päällä).
//      Pelimuodon hubissa intro 2–4 lausetta, ensimmäinen korostettuna (poikkeus UI-sääntöön 9, kirjattu CLAUDE.md:hen).
//      Kokoelmat ja tavalliset sivut: enintään yksi rivi (`intro` yhtenä lauseena).
//   2. NOSTO (enintään yksi) = sama rivikomponentti korostettuna — tulee vaiheessa 2.
//   3. LAAJUUS = HubRivit (KorttiRivi.tsx), sama rivi kaikilla leveyksillä.
//   4. Ohjeet suljettuina (HubOhjeet).
// Desktop ≥ 1024: kuva ja teksti rinnakkain, sivun sisältö .tn-shellin levyinen.
import type { ReactNode } from "react";
import "./hub.css";

export type HubKuva = { src: string; srcSet?: string; sizes?: string; alt: string; width: number; height: number; pos?: string };

export default function HubHero({ kuva, nimi, korostus, intro, lisa, cta }: {
  kuva?: HubKuva;
  nimi: string;
  /** Intron ensimmäinen lause, korostettuna. */
  korostus?: string;
  /** Loput introsta (1–3 lausetta) tai kokoelmasivun yksi rivi. */
  intro?: string;
  /** Datasta laskettu rivi introsta erillään (esim. "8 megavisaa · 20–50 kysymystä"). */
  lisa?: ReactNode;
  /** Heron ainoa nappi (.tn-cta-lime) intron alla — vain sivuilla, joilla on päivän tai viikon peli (Heikki 13.11.2026). */
  cta?: ReactNode;
}) {
  return (
    <header className={`hub-hero${kuva ? "" : " hub-hero--ilman"}`}>
      {kuva ? (
        <div className="hub-hero-kuva">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={kuva.src}
            srcSet={kuva.srcSet}
            sizes={kuva.sizes ?? "(max-width: 1023px) 100vw, 560px"}
            alt={kuva.alt}
            width={kuva.width}
            height={kuva.height}
            fetchPriority="high"
            style={kuva.pos ? { objectPosition: kuva.pos } : undefined}
          />
        </div>
      ) : null}
      <div className="hub-hero-teksti">
        <h1 className="hub-h1">{nimi}</h1>
        {korostus || intro ? (
          <p className="hub-intro">
            {korostus ? <strong>{korostus}</strong> : null}
            {korostus && intro ? " " : null}
            {intro}
          </p>
        ) : null}
        {lisa ? <p className="hub-lisa">{lisa}</p> : null}
        {cta ?? null}
      </div>
    </header>
  );
}
