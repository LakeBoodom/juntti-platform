// KORTTIRIVI (Heikki 11.–12.11.2026, hub-sivujen runko): "Pelaa seuraavaksi" -rivin ulkoasu omana komponenttinaan.
// RiviLinkki: kuva 96 × 72 vasemmalla, (lajimerkki) + nimi + yksi tietorivi, koko rivi linkki (≥ 74 px).
// Käyttäjät: SeuraavaksiRivi (≥ 768 kortteina; mittaus ja pelattu-logiikka siellä) ja hub-sivujen laajuuslista HubRivit
// (rivinä kaikilla leveyksillä, ≥ 768 kahdessa sarakkeessa). Tyylit: components/tn20/seuraavaksi/seuraavaksi.css (.sk-*).
// Rivikuvat oikean kokoisina (hub-runko §4): hub-listalle annetaan pieni kopio (public/20/rivi/, 288 × 216), ei korttikuvaa.
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
  /** Lajimerkki; tyhjä = ei merkkiä (esim. Tupla tai kuitin aiheet, joissa laji on sivun nimi). */
  merkki?: string;
  /** Pieni live-piste merkin edessä. */
  live?: boolean;
  nimi: string;
  /** Yksi tietorivi nimen alla. */
  rivi?: string | null;
};

/** Yksi rivi/kortti. `data` = mittauksen data-attribuutit (Seuraavaksi). */
export function RiviLinkki({ k, data, eager }: { k: RiviKortti; data?: Record<string, string | undefined>; eager?: boolean }) {
  const merkki = k.merkki ? (
    <>
      {k.live ? <i className="sk-live" aria-hidden="true" /> : null}
      {k.merkki}
    </>
  ) : null;
  return (
    <a className="sk-kortti" href={k.href} {...data}>
      <span className="sk-kuva" data-sovitus={k.sovitus}>
        {k.kuva ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={k.kuva} alt="" loading={eager ? "eager" : "lazy"} decoding="async" width={320} height={200} style={k.kuvaPos ? ({ objectPosition: k.kuvaPos } as CSSProperties) : undefined} />
        ) : (
          <span className="sk-kuvaton" aria-hidden="true">{k.kuvaton}</span>
        )}
        {/* Desktop-kortti: merkki kuvan päällä. Rivissä sama merkki on tekstipuolella (sk-merkki--rivi). */}
        {merkki ? <span className="sk-merkki sk-merkki--kuva">{merkki}</span> : null}
      </span>
      <span className="sk-teksti">
        {merkki ? <span className="sk-merkki sk-merkki--rivi">{merkki}</span> : null}
        <span className="sk-nimi">{katko(k.nimi)}</span>
        {k.rivi ? <span className="sk-syy">{k.rivi}</span> : null}
        <span className="sk-cta">Pelaa <span aria-hidden="true">→</span></span>
      </span>
    </a>
  );
}

/** Hub-sivun nosto (runko §2, Heikki 12.11.2026): enintään yksi, sama rivi korostettuna — kultareunus, merkki (esim.
 *  "Uusin", "Kaikki aiheet") ja CTA-nappi. Ei täysleveää kuvaa. Mobiilissa merkki + nimi kuvan vieressä kuten tavallisessa
 *  rivissä, kuvaus ja nappi niiden alla koko leveydeltä (Heikki 12.11.); ≥ 768 kuvaus nimen alla ja nappi oikealla. */
export function HubNosto({ k, merkki, cta, entry }: { k: RiviKortti; merkki: string; cta: string; entry?: string }) {
  return (
    <div className="sk-rivi--hub sk-rivi--nosto">
      <a className="sk-kortti sk-kortti--nosto" href={k.href} data-tn-entry={entry}>
        <span className="sk-kuva" data-sovitus={k.sovitus}>
          {k.kuva ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={k.kuva} alt="" loading="eager" decoding="async" width={320} height={200} style={k.kuvaPos ? ({ objectPosition: k.kuvaPos } as CSSProperties) : undefined} />
          ) : (
            <span className="sk-kuvaton" aria-hidden="true">{k.kuvaton}</span>
          )}
        </span>
        <span className="sk-teksti">
          <span className="sk-nosto-yla">
            <span className="sk-nosto-merkki">{merkki}</span>
            {k.merkki ? <span className="sk-merkki sk-merkki--rivi">{k.merkki}</span> : null}
          </span>
          <span className="sk-nimi">{katko(k.nimi)}</span>
        </span>
        <span className="sk-nosto-ala">
          {k.rivi ? <span className="sk-syy">{k.rivi}</span> : null}
          <span className="sk-nosto-cta tn-cta-lime">{cta} <span aria-hidden="true">→</span></span>
        </span>
      </a>
    </div>
  );
}

/** Hub-sivun laajuus (runko §3): rivit allekkain mobiilissa, ≥ 768 kahdessa sarakkeessa; aina sama rivi, ei kuvaruudukkoa.
 *  Ensimmäiset `eager` kuvaa ladataan heti (ensimmäinen ruutu), loput laiskasti. */
export default function HubRivit({ kortit, nimi, eager = 4 }: { kortit: RiviKortti[]; nimi: string; eager?: number }) {
  if (!kortit.length) return null;
  return (
    <ul className="sk-rivi sk-rivi--hub" aria-label={nimi}>
      {kortit.map((k, i) => (
        <li key={k.href} className="sk-li">
          <RiviLinkki k={k} eager={i < eager} />
        </li>
      ))}
    </ul>
  );
}
