// KUVAVISAT 2.0 (2026-09-17) — kokoelmasivun hub. Design: näkymät 1a (työpöytä)
// ja 1b (mobiili). Server-komponentti: kategorian laajennus on natiivi
// <details>/<summary>, joten koko sivu toimii ilman JavaScriptiä.
//
// EROT DESIGNIIN — kolme tietoista poikkeamaa, kaikki Heikin päätöksiä 2026-09-17:
//  1. Designin sininen (#2C6BE0 painikkeet, #0D1526 viikkovisapaneeli) jää pois.
//     BRAND.md:n token-lohkossa ei ole sinistä, se sallii enintään kaksi
//     taustaväriä per näkymä ja lime on ainoa toimintoväri. BRAND.md voittaa.
//  2. Ylätunnisteen "Kirjaudu" ja "Putki 4 pv" jäävät pois — CLAUDE.md sääntö 7:
//     v1 on täysin anonyymi. Nappi joka ei tee mitään on huonompi kuin ei nappia.
//  3. Viikkovisapaneeli (design 1a) ja "Löydä oikea kuva" -esittely jäävät pois
//     tästä PR:stä: kumpikaan ominaisuus ei ole vielä olemassa, eikä sivulla
//     lueta lupauksia joita tuotanto ei lunasta. Tulevat omina PR:inään.
//
// Designin esimerkkiluvut (2 900 kuvaa, 28 variaatiota) EIVÄT ole tuotannon
// lukuja — kaikki näytettävät määrät tulevat kannasta.

import { ryhmiteltyVariaatiot, type KategoriaData } from "@/lib/kuvavisat2026";

function EsikatseluKuvat({ k }: { k: KategoriaData }) {
  const kuvat = k.esikatselut.slice(0, 2);
  if (kuvat.length === 0) return null;
  return (
    <div className={`kv-peek kv-peek--${k.meta.sovitus}`} aria-hidden="true">
      {kuvat.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`${src}-${i}`} src={src} alt="" loading="lazy" draggable={false} />
      ))}
    </div>
  );
}

function KategoriaKortti({ k, avoin }: { k: KategoriaData; avoin: boolean }) {
  const ryhmat = ryhmiteltyVariaatiot(k.variaatiot);
  const visoja = k.variaatiot.length;
  return (
    <details
      className="kv-card"
      // Ensimmäinen kortti auki (design 1a: liput on <details open>) — pelaaja
      // näkee heti mitä "Valitse visa" tekee, ilman että joutuu arvaamaan.
      open={avoin}
      style={{ ["--kv-accent" as string]: k.meta.accent }}
    >
      <summary className="kv-card-summary">
        <EsikatseluKuvat k={k} />
        <div className="kv-card-body">
          <h3 className="kv-card-title">{k.meta.otsikko}</h3>
          <p className="kv-card-desc">{k.meta.kuvaus}</p>
          <div className="kv-card-meta">
            <span className="kv-card-count">{k.meta.yksikko(k.kuvia)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {visoja} {visoja === 1 ? "visa" : "visaa"}
            </span>
          </div>
          <span className="kv-card-cta">
            Valitse visa
            <span className="kv-caret" aria-hidden="true">
              ▾
            </span>
          </span>
        </div>
      </summary>

      <div className="kv-varlist">
        {ryhmat.map((r, i) => (
          <div className="kv-vargroup" key={r.label ?? `kaikki-${i}`}>
            {r.label && <span className="kv-vargroup-label">{r.label}</span>}
            {r.items.map((v) => (
              <a key={v.key} className={`kv-var${v.kaikki ? " kv-var--kaikki" : ""}`} href={v.href}>
                <span className="kv-var-label">{v.label}</span>
                <span className="kv-var-count">{v.kuvia} kuvaa</span>
              </a>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}

export function KuvavisatHub({
  kategoriat,
  kuviaYhteensa,
  variaatioitaYhteensa,
  satunnainenHref,
  article,
}: {
  kategoriat: KategoriaData[];
  kuviaYhteensa: number;
  variaatioitaYhteensa: number;
  satunnainenHref: string | null;
  article?: React.ReactNode;
}) {
  return (
    <div className="kv-page">
      <header className="kv-hero">
        <h1 className="kv-hero-title">Kuvavisat</h1>
        <p className="kv-hero-lede">
          Tunnista liput, vaakunat, linnut, eläimet, maalaukset, nähtävyydet ja kasvit. Valitse kategoria, sitten sinulle
          sopiva vaikeustaso.
        </p>
        <div className="kv-hero-stats">
          <span className="kv-stat-lead">{kuviaYhteensa} kuvaa</span>
          <span aria-hidden="true">·</span>
          <span>{kategoriat.length} kategoriaa</span>
          <span aria-hidden="true">·</span>
          <span>{variaatioitaYhteensa} visavariaatiota</span>
        </div>
        {satunnainenHref && (
          <a className="kv-hero-random" href={satunnainenHref}>
            Arvo satunnainen kuvavisa
          </a>
        )}
      </header>

      <section className="kv-section">
        <div className="kv-section-head">
          <h2 className="kv-section-title">Valitse kategoria</h2>
          <span className="kv-section-note">Kategoria avaa visavariaatiot — peli ei käynnisty heti</span>
        </div>
        <div className="kv-grid">
          {kategoriat.map((k, i) => (
            <KategoriaKortti key={k.meta.type} k={k} avoin={i === 0} />
          ))}
        </div>
      </section>

      {article}
    </div>
  );
}
