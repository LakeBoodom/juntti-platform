// TUPLA TAI KUITTI — pelimuodon oma sivu (CD "Tupla tai kuitti v0.2", 3A virallinen design,
// 26.9.2026). Heikin päätös: alkuun kaikki Tupla tai kuitti -pelit ovat tällä sivulla, ja
// myöhemmin ne voidaan nostaa myös teemojen omille kokoelmasivuille.
//
// Rakenne: studiokuva → otsikko ja esittely kolmessa kohdassa → nosto (uusin teema
// virallisella logolla) + Näin pelaat → Aiheet yhtenä listana. Korteissa ei näytetä
// tulosta, tilaa eikä "uusi"-merkintöjä. Navigaatio tulee sivustolta (lib/nav.ts).
// Aiheet ja Arvo teema näkyvät vasta, kun pelattavia teemoja on useampi kuin nosto.

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { POTTI, TEEMAT, TURVAT, TUPLA_SIVU } from "@/lib/tuplaTaiKuitti";
import ArvoTeema from "./ArvoTeema";
import "./tuplasivu.css";

export const metadata: Metadata = {
  title: "Tupla tai kuitti – Tietoniekan versio tietovisaklassikosta | Tietoniekka",
  description:
    "Valitse aihe ja vastaa kymmeneen yhä vaikeampaan kysymykseen. Jokainen oikea vastaus tuplaa potin – kuittaa ajoissa tai pelaa kaikesta.",
  // Esikatselu: ei indeksoida ennen julkaisupäätöstä
  robots: { index: false, follow: false },
};

const ESITTELY = [
  {
    h: "Suomalaisen televisioviihteen klassikko.",
    s: "Tupla tai kuitti nähtiin Suomen televisiossa ensimmäisen kerran vuonna 1958. Pitkäaikaisen juontajansa Kirsti Rautiaisen tutuksi tekemä tietovisa saa nyt Tietoniekan oman version.",
  },
  {
    h: "Oma aihe, oma näytön paikka.",
    s: "Kilpailija valitsee aihealueensa ja pääsee näyttämään, kuinka syvälle hänen tietonsa ulottuvat. Kerrallaan valokeilassa on yksi kilpailija.",
  },
  {
    h: "Tuplaa tai lunasta voittosi.",
    s: "Oikean vastauksen jälkeen edessä on päätös: jatkaako tavoittelemaan kaksinkertaista palkintoa vai lopettaako ja pitääkö jo voitetun summan?",
  },
];

const t1 = POTTI[TURVAT[0] - 1];
const t2 = POTTI[TURVAT[1] - 1];
const SAANNOT = [
  { k: "×2", h: "Oikein tuplaa", s: "1 → 2 → 4 … 512.", c: "#4ADE80" },
  { k: "✓", h: "Kuittaa tai tuplaa", s: "Ota potti tai jatka vaikeampaan.", c: "#E8A320" },
  { k: `${t1}·${t2}`, h: "Väärin vie potin", s: `Turvatasot ${t1} ja ${t2} jäävät sinulle.`, c: "#FF5C3D" },
];

const pelaa = (slug: string) => `${TUPLA_SIVU}/${slug}`;

export default function TuplaTaiKuittiSivu() {
  // Nosto: listan ensimmäinen teema (uusin); kausipainos nousee kärkeen kautensa ajaksi.
  const [nosto, ...muut] = TEEMAT;
  return (
    <main className="tks">
      <div className="tks-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/20/tupla/studio.webp"
          srcSet="/20/tupla/studio-800.webp 800w, /20/tupla/studio.webp 1672w"
          sizes="(max-width: 1120px) 100vw, 1120px"
          alt="Mikko ja Laura Tupla tai kuitti -studiossa"
          width={1672}
          height={941}
          fetchPriority="high"
        />
      </div>

      <div className="tks-in">
        <h1 className="tks-h1">
          <span>Tupla tai kuitti</span> – Tietoniekan versio rakastetusta tietovisaklassikosta
        </h1>

        <ol className="tks-intro">
          {ESITTELY.map((e, i) => (
            <li key={e.h}>
              <span className="tks-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>{e.h}</b>
                <span>{e.s}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="tks-feat">
          <a className="tks-nosto" href={pelaa(nosto.slug)} style={{ "--acc": nosto.accent } as CSSProperties}>
            <span className="tks-nosto-kuvio" aria-hidden="true" />
            <span className="tks-nosto-top">
              <span className="tks-nosto-merkki">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/20/tupla/logo.webp" alt="Tupla tai kuitti" width={640} height={374} />
                <span className="tks-nosto-nimi">{nosto.nimi}</span>
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="tks-nosto-ikoni" src={nosto.kuva} alt="" width={256} height={256} />
            </span>
            <span className="tks-nosto-s">{nosto.nosto}</span>
            <span className="tks-cta">PELAA</span>
          </a>

          <div className="tks-rules">
            <span className="tks-eyebrow">Näin pelaat</span>
            <ul>
              {SAANNOT.map((r) => (
                <li key={r.h}>
                  <span className="tks-rule-k" style={{ borderColor: r.c, color: r.c }}>{r.k}</span>
                  <span className="tks-rule-t">
                    <b>{r.h}</b>
                    <span>{r.s}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {muut.length > 0 && (
          <section className="tks-aiheet" aria-labelledby="tks-aiheet-h">
            <h2 id="tks-aiheet-h">Aiheet</h2>
            <ul>
              {muut.map((t) => (
                <li key={t.slug}>
                  <a href={pelaa(t.slug)} style={{ "--acc": t.accent, "--kuvio": t.kuvio } as CSSProperties}>
                    <span className="tks-kortti-kuvio" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.kuva} alt="" width={256} height={256} loading="lazy" />
                    <span className="tks-kortti-nimi">{t.nimi}</span>
                  </a>
                </li>
              ))}
            </ul>
            <ArvoTeema polut={TEEMAT.map((t) => pelaa(t.slug))} />
          </section>
        )}
      </div>
    </main>
  );
}
