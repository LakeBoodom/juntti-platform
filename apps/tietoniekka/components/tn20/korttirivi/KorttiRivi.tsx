// KORTTIRIVI (Heikki 11.11.2026, hub-sivujen yhtenäistäminen): "Pelaa seuraavaksi" -rivin ulkoasu omana komponenttinaan.
// Mobiilissa (< 768) tiivis rivi: kuva 96 × 72 vasemmalla, lajimerkki + nimi + yksi rivi, koko rivi linkki (≥ 72 px).
// ≥ 768 kortti (kuva 16:9, merkki kuvan päällä, "Pelaa →"). Käyttäjät: SeuraavaksiRivi (mittaus ja pelattu-logiikka siellä)
// sekä hub-sivujen mobiililistat (Karttapelit, Megavisat). Tyylit: components/tn20/seuraavaksi/seuraavaksi.css (.sk-*).
import type { CSSProperties } from "react";
import { katko } from "@/lib/kokoelmat/data";
import "../seuraavaksi/seuraavaksi.css";

export type RiviKortti = {
  href: string;
  kuva: string | null;
  kuvaPos?: string;
  /** "contain" = läpinäkyvä kuvitus kokonaisena, "logo" = Tupla tai kuitin logo tummalla pohjalla. */
  sovitus?: "contain" | "logo";
  /** Kuvaton kortti: teksti kuva-alueelle aksenttivärillä. */
  kuvaton: string;
  merkki: string;
  /** Pieni live-piste merkin edessä. */
  live?: boolean;
  nimi: string;
  /** Yksi rivi nimen alla. */
  rivi?: string | null;
};

/** Yksi rivi/kortti. `data` = mittauksen data-attribuutit (Seuraavaksi). */
export function RiviLinkki({ k, data }: { k: RiviKortti; data?: Record<string, string | undefined> }) {
  return (
    <a className="sk-kortti" href={k.href} {...data}>
      <span className="sk-kuva" data-sovitus={k.sovitus}>
        {k.kuva ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={k.kuva} alt="" loading="lazy" decoding="async" width={320} height={200} style={k.kuvaPos ? ({ objectPosition: k.kuvaPos } as CSSProperties) : undefined} />
        ) : (
          <span className="sk-kuvaton" aria-hidden="true">{k.kuvaton}</span>
        )}
        {/* Desktop: merkki kuvan päällä. Mobiilin rivissä sama merkki on tekstipuolella (sk-merkki--rivi). */}
        <span className="sk-merkki sk-merkki--kuva">{k.live ? <i className="sk-live" aria-hidden="true" /> : null}{k.merkki}</span>
      </span>
      <span className="sk-teksti">
        <span className="sk-merkki sk-merkki--rivi">{k.live ? <i className="sk-live" aria-hidden="true" /> : null}{k.merkki}</span>
        <span className="sk-nimi">{katko(k.nimi)}</span>
        {k.rivi ? <span className="sk-syy">{k.rivi}</span> : null}
        <span className="sk-cta">Pelaa <span aria-hidden="true">→</span></span>
      </span>
    </a>
  );
}

/** Hub-sivun mobiililista: tiiviit rivit allekkain; ≥ 768 piilossa (sivun omat kortit näkyvät). */
export default function MobiiliRivit({ kortit, nimi }: { kortit: RiviKortti[]; nimi?: string }) {
  if (!kortit.length) return null;
  return (
    <div className="sk-rivi sk-rivi--mobiili" role="list" aria-label={nimi}>
      {kortit.map((k) => (
        <div key={k.href} role="listitem" className="sk-li"><RiviLinkki k={k} /></div>
      ))}
    </div>
  );
}
