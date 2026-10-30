// K4 v2 TULOS (pelimuotojen kehys ja jako, Heikki 25.10.2026; CD "TN Pelimuodot – kehys ja jako" 2a–2r).
// Järjestys: 1 tulos (iso luku + yksikkö, tasonimi, yksi lause) → pelin oma tulosvisuaali → (2 metapeli, lipun takana)
// → 3 jakoalue (sama Jakoalue kuin tietovisassa; kermaisella iholla vaalea) → 4 seuraava peli → 5 toissijaiset linkit.
// Tulosnäkymässä ei ole lime-painiketta: päätoiminto on WhatsApp-jako, uusi kierros on toissijainen linkki.
// Desktopilla (≥ 1024 px) tulos ja visuaali vasemmalla, jako oikealla; seuraava peli ja linkit koko leveydellä.
// Pelin ja muunnelman nimi on pelipalkissa ("Laita järjestykseen: Presidentit"), ei yläotsikkona (UI-sääntö 9).
import type { CSSProperties, ReactNode } from "react";
import type { Pelimuoto } from "@/lib/pelimuodot";
import { PeliIkoniSvg } from "@/components/tn20/runko/PeliIkoni";
import Jakoalue, { type Jakokanava } from "@/components/tn20/jako/Jakoalue";

export type PeliToiminto = { teksti: string; onClick?: () => void; href?: string };

export default function PeliTulos({
  luku,
  yksikko,
  tasonimi,
  lause,
  lisa,
  lisaJaonJalkeen = false,
  jako,
  seuraavat,
  toiminnot,
}: {
  /** Iso luku: "32", "6/7", "41/50". */
  luku: ReactNode;
  /** Yksikkö luvun perässä: "kiekkoa", "yhteyttä", "oikein". */
  yksikko?: string;
  /** Tasonimi otsikkona (lib/pelitasot.ts). */
  tasonimi: string;
  /** Yksi lause tuloksesta. */
  lause?: ReactNode;
  /** Pelin oma tulosvisuaali (tikapuut, reitti kartalla, ketju, vastausten läpikäynti). */
  lisa?: ReactNode;
  /** Visuaali jakoalueen jälkeen (reittipelien iso kartta, Heikki 30.10.2026): mobiilissa WhatsApp-nappi pysyy
   *  näkyvissä ilman vieritystä. Desktopilla visuaali on silti vasemmassa palstassa tuloksen alla. */
  lisaJaonJalkeen?: boolean;
  /** Jakoteksti ilman osoitetta + jaettava osoite (null = ei vielä valmis). */
  jako: { teksti: string; url: string | null; onJaettu?: (k: Jakokanava) => void | Promise<unknown>; natiiviOtsikko?: string };
  seuraavat: Pelimuoto[];
  /** Toissijaiset toiminnot linkkeinä: "Pelaa uusi kierros", "Pelaa sama sarja uudelleen". */
  toiminnot: PeliToiminto[];
}) {
  return (
    /* Ulompi kääre on container: kaksipalstaisuus seuraa pelin oman sisältöalueen leveyttä (Tupla ~500 px,
       Laita järjestykseen ~600 px), ei ikkunan leveyttä. */
    <div className="pk-tulos-ulko">
    <div className="pk-tulos">
      <div className="pk-tulos-vasen">
        <section className="pk-tulos-tulos" aria-labelledby="pk-tulos-h">
          <div className="pk-tulos-luku" aria-hidden="true">
            <b>{luku}</b>
            {yksikko && <span>{yksikko}</span>}
          </div>
          <span className="pk-sr">{luku} {yksikko}.</span>
          <h1 id="pk-tulos-h" className="pk-tulos-taso">{tasonimi}</h1>
          {lause && <p className="pk-tulos-ala">{lause}</p>}
        </section>
        {lisa && !lisaJaonJalkeen && <div className="pk-tulos-lisa">{lisa}</div>}
        {/* 2 · Metapelilohko: METAPELI_ENABLED-lipun takana (ei vielä toteutettu, ei jätä aukkoa). */}
      </div>
      <Jakoalue
        className="pk-tulos-jako"
        id="pk-jako-h"
        otsikko="Haasta kaveri"
        waNappi="Jaa WhatsAppissa"
        teksti={jako.teksti}
        url={jako.url}
        natiiviOtsikko={jako.natiiviOtsikko}
        onJaettu={jako.onJaettu}
      />
      {lisa && lisaJaonJalkeen && <div className="pk-tulos-lisa pk-tulos-lisa--alle">{lisa}</div>}
      <SeuraavaPeli seuraavat={seuraavat} />
      {toiminnot.length > 0 && (
        <nav className="pk-tulos-linkit" aria-label="Muut toiminnot">
          {toiminnot.map((t) =>
            t.href ? (
              <a key={t.teksti} href={t.href}>{t.teksti}</a>
            ) : (
              <button key={t.teksti} type="button" onClick={t.onClick}>{t.teksti}</button>
            ),
          )}
        </nav>
      )}
    </div>
    </div>
  );
}

/** K4:n viides osa erikseen pelien omiin tulosnäkymiin (Vaalipiiriketju): 2–3 peliä rekisteristä. */
export function SeuraavaPeli({ seuraavat }: { seuraavat: Pelimuoto[] }) {
  if (!seuraavat.length) return null;
  return (
    <nav className="pk-seuraava" aria-labelledby="pk-seuraava-h" data-tn-entry="tulos:seuraava">
      <h2 id="pk-seuraava-h" className="pk-seuraava-h">Pelaa seuraavaksi</h2>
      <Pelikortit pelit={seuraavat} />
    </nav>
  );
}

/** Pelikortit (pikakorjaus 22.10.2026): kuvake yläreunassa, nimi ≥ 16 px ja saa rivittyä, kuvaus enintään
 *  2 rivillä, "Pelaa →" omalla rivillään. Mobiilissa kortit allekkain. Myös Laita järjestykseen -aloituksen
 *  "Muut järjestyspelit". */
export function Pelikortit({ pelit }: { pelit: Pelimuoto[] }) {
  return (
    <div className="pk-seuraava-rivi">
      {pelit.map((p) => (
        <a key={p.slug} className="pk-pelikortti" href={p.href}>
          {/* Pelin oma kuva kortin yläosassa (pelimuotojen kehys, Heikki 25.10.2026); ilman kuvaa kuvake. Ei valinnan syy
              -labelia (UI-sääntö 9). */}
          {p.kuva ? (
            <span className="pk-pelikortti-kuva" data-contain={p.kuva.contain || undefined} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.kuva.src} alt="" loading="lazy" />
            </span>
          ) : (
            <span className="pk-pelikortti-ikoni" aria-hidden="true"><PeliIkoniSvg ikoni={p.ikoni} /></span>
          )}
          <span className="pk-pelikortti-nimi" style={{ "--pk-lw": Math.max(...p.nimi.split(/[\s-]+/).map((w) => w.length)) } as CSSProperties}>{p.nimi}</span>
          <span className="pk-pelikortti-kuvaus">{p.kuvaus}</span>
          <span className="pk-pelikortti-cta">Pelaa →</span>
        </a>
      ))}
    </div>
  );
}
