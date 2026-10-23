"use client";
// TULOSNÄKYMÄ (Tulosnäkymä ja jakaminen -brief, vaihe B, 22.10.2026; Claude Designin arkki v0.3, näkymät 3a–3c).
// Tavallinen tietovisa, kuvavisa ja viikkovisa. Järjestys kuten pelikehyksen K4:ssä:
//   tulos → (metapeli, lipun takana) → haasta kaveri → seuraava visa → toissijaiset linkit.
// Tulos näkyy kerran (iso n/total, tasonimi, pisteet pienellä, yksi lause). "Vastauksesi" on oma laatikkonsa
// tuloksen alla (✓/✗-ruudut + Näytä); koko laatikko on yksi painike, joka avaa läpikäynnin.
// Jakoalue: yleiskäyttöinen Jakoalue-komponentti (vaihe C) — WhatsApp pääpainikkeena, Facebook ja Kopioi, Jaa… kosketuslaitteilla.
// Desktopilla (≥ 1024 px) tulos, vastaukset ja seuraava visa vasemmassa palstassa, jako oikealla.
// Kova vaatimus: 390 × 844:ssä tulos ja WhatsApp-painike ilman vieritystä.
import type { CSSProperties } from "react";
import Jakoalue, { type Jakokanava } from "@/components/tn20/jako/Jakoalue";
import "@/app/(tn20)/tulosnakyma.css";

export type TulosVastaus = "ok" | "bad" | "skipped" | undefined;
export type TulosSeuraava = { id: string; title: string; href: string; kuva?: string | null; kuvaPos?: string; ala: string };

export default function TulosNakyma(p: {
  /** Poistettu näkyvistä 23.10.2026 (UI-sääntö 9: visan nimi on jo yläpalkissa); ei enää käytössä. */
  eyebrow?: string;
  right: number;
  total: number;
  score: number;
  /** Tasonimi (quizzes.fanitasot) tai yleinen taso. */
  tasonimi: string;
  lause: string;
  /** Henkilövisan "Lue lisää …" -linkki. */
  lisaLinkki?: { href: string; teksti: string } | null;
  haaste?: { oikein: number; kysymyksia: number } | null;
  vastaukset: TulosVastaus[];
  avaaVastaukset: (i: number, el: HTMLElement) => void;
  /** Jakoalue (components/tn20/jako/Jakoalue.tsx): teksti ilman osoitetta, url null = ei vielä valmis. */
  jako: { teksti: string; url: string | null; fbUrl?: string | null; natiiviOtsikko?: string; onJaettu?: (k: Jakokanava) => void | Promise<unknown> };
  seuraavat: TulosSeuraava[];
  pelaaUudelleen: (() => void) | null;
  kaikki: { href: string; teksti: string };
}) {
  const taydet = p.right === p.total;
  const ensimmainenVaarin = Math.max(0, p.vastaukset.findIndex((v) => v === "bad"));
  const h = p.haaste;
  const tuomio = h ? (p.right > h.oikein ? "voitto" : p.right < h.oikein ? "havio" : "tasan") : null;

  return (
    <div className="tn-tulos" data-haaste={h ? "1" : undefined}>
      <div className="tn-tulos-vasen">
        <section className="tn-tulos-tulos" aria-labelledby="tn-tulos-h">
          {h ? (
            <>
              <div className="tn-tulos-vs">
                <div>
                  <span className="tn-tulos-pikku">Sinä</span>
                  <span className="tn-tulos-luku" aria-hidden="true"><b>{p.right}</b><i>/{p.total}</i></span>
                </div>
                <div className="tn-tulos-kaveri">
                  <span className="tn-tulos-pikku">Kaverisi</span>
                  <span className="tn-tulos-luku tn-tulos-luku--pieni" aria-hidden="true">{h.oikein}/{h.kysymyksia}</span>
                </div>
              </div>
              <span className="tn-sr">Sinä {p.right}/{p.total}, kaverisi {h.oikein}/{h.kysymyksia}.</span>
              <h1 id="tn-tulos-h" className="tn-tulos-tuomio" data-tuomio={tuomio}>
                {tuomio === "voitto" ? "Voitit kaverisi" : tuomio === "havio" ? "Kaverisi voitti" : "Tasapeli"}
              </h1>
              <p className="tn-tulos-lause">{p.lause}</p>
            </>
          ) : (
            <>
              <div className="tn-tulos-rivi">
                <span className="tn-tulos-luku" aria-hidden="true"><b>{p.right}</b><i>/{p.total}</i></span>
                <div className="tn-tulos-taso">
                  <span className="tn-sr">{p.right}/{p.total} oikein.</span>
                  <h1 id="tn-tulos-h" className="tn-tulos-tasonimi">
                    {p.tasonimi}
                  </h1>
                  <span className="tn-tulos-pisteet">{p.score} pistettä</span>
                </div>
              </div>
              <p className="tn-tulos-lause">{p.lause}</p>
            </>
          )}
          {p.lisaLinkki && (
            <a className="tn-tulos-lisa" href={p.lisaLinkki.href}>
              {p.lisaLinkki.teksti} <span aria-hidden="true">→</span>
            </a>
          )}
        </section>

        {/* "Vastauksesi": koko laatikko yksi painike (≥ 44 px) — ruudut ovat näyttö, eivät erillisiä kohteita. */}
        <button
          type="button"
          className="tn-tulos-vastaukset"
          onClick={(e) => p.avaaVastaukset(ensimmainenVaarin, e.currentTarget)}
          aria-label={`Vastauksesi: ${p.right} oikein, ${p.total - p.right} väärin`}
        >
          {/* UI-sääntö 9 (Heikki 23.10.2026): "Vastauksesi"-otsikko pois; ✓/✗-rivi ja "Näytä ▾" riittävät. */}
          <span className="tn-tulos-vastaukset-yla">
            <span className="tn-tulos-nayta">Näytä <span aria-hidden="true">▾</span></span>
          </span>
          <span className="tn-tulos-ruudut" aria-hidden="true">
            {p.vastaukset.map((v, i) => (
              <span key={i} className="tn-tulos-ruutu" data-tila={v === "ok" ? "ok" : v === "bad" ? "bad" : "ohi"}>
                {v === "ok" ? "✓" : v === "bad" ? "✕" : "–"}
              </span>
            ))}
          </span>
        </button>

        {/* Metapelilohko: METAPELI_ENABLED-lipun takana (ei vielä toteutettu, ei jätä aukkoa). */}

        {p.seuraavat.length > 0 && (
          <nav className="tn-tulos-seuraava" aria-labelledby="tn-tulos-seuraava-h">
            <h2 id="tn-tulos-seuraava-h" className="tn-tulos-pikku">Seuraava visa</h2>
            <div className="tn-tulos-kortit">
              {p.seuraavat.slice(0, 2).map((s) => (
                <a key={s.id} className="tn-tulos-kortti" href={s.href}>
                  <span className="tn-tulos-kortti-kuva">
                    {s.kuva && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.kuva} alt="" loading="lazy" style={s.kuvaPos ? ({ objectPosition: s.kuvaPos } as CSSProperties) : undefined} />
                    )}
                  </span>
                  <span className="tn-tulos-kortti-teksti">
                    <span className="tn-tulos-kortti-nimi">{s.title}</span>
                    <span className="tn-tulos-kortti-ala">{s.ala}</span>
                    <span className="tn-tulos-kortti-cta">Pelaa →</span>
                  </span>
                </a>
              ))}
            </div>
          </nav>
        )}

        <div className="tn-tulos-linkit">
          {p.pelaaUudelleen && (
            <button type="button" onClick={p.pelaaUudelleen}>
              <span aria-hidden="true">↻</span> Pelaa uudelleen
            </button>
          )}
          <a href={p.kaikki.href}>{p.kaikki.teksti} <span aria-hidden="true">→</span></a>
        </div>
      </div>

      <Jakoalue
        otsikko={h ? "Lähetä vastahaaste" : taydet ? "Pystyykö kaveri samaan?" : "Pystyykö kaveri parempaan?"}
        waNappi="Jaa WhatsAppissa"
        teksti={p.jako.teksti}
        url={p.jako.url}
        fbUrl={p.jako.fbUrl}
        natiiviOtsikko={p.jako.natiiviOtsikko}
        onJaettu={p.jako.onJaettu}
      />
    </div>
  );
}
