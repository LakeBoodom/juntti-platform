// KUVAVISAT 2.0 (2026-09-17) — kokoelmasivun hub. Design: näkymät 1a (työpöytä)
// ja 1b (mobiili). Server-komponentti: kategorian laajennus on natiivi
// <details>/<summary>, joten koko sivu toimii ilman JavaScriptiä (viikkovisakortti
// on oma pieni asiakaskomponenttinsa, koska oma tulos luetaan selaimesta).
//
// KIERROS 4 (18.9.2026, Heikin muutospyynnöt + viikkovisan 10A Sinetti):
//  - Herokuva kuten muilla kokoelmasivuilla (vrt. /kokoelma/historia). Hero on
//    leveä ja kuvallinen, ja se pitää limen: "Arvo satunnainen kuvavisa" on
//    näkymän ainoa täytetty lime-nappi.
//  - Viikkovisa on kapea, kuvaton kortti kategoriaruudukon vasemmassa laidassa,
//    syaani ääriviivanappi — hero ja kortti eivät kilpaile samalla värillä.
//  - Ei eksakteja kuvamääriä (hero, kortit, variaatiorivit) eikä variaatiolukua:
//    tilalla kuvaava teksti (variaatioKuvaus).
//  - Tyyppimerkki (GRAFIIKKA / VALOKUVA) pois kuvan päältä — kuvan päällä ei
//    ole nyt mitään. Kuvatyyppi (KategoriaMeta.sovitus) ohjaa yhä layoutia.
//  - FAQ-osio ("Kuvavisat pähkinänkuoressa") pois sivun alalaidasta.
//
// Ylätunnisteen "Kirjaudu" ja "Putki 4 pv" jäävät yhä pois — CLAUDE.md sääntö 7:
// v1 on täysin anonyymi.

import { ryhmiteltyVariaatiot, variaatioKuvaus, type KategoriaData } from "@/lib/kuvavisat2026";
import { ViikkovisaKortti, type ViikkoPromoData } from "./ViikkovisaPromo";
import Crumbs from "./Crumbs";

/* Kuvalaatikko — Claude Designin korjaus (README "Kategorianäkymä, korjaus", 17.9.2026).
   Laatikko on aina 16:10 ja teksti on sen ULKOPUOLELLA omana sisaruksenaan. */
function KuvaLaatikko({ k }: { k: KategoriaData }) {
  const kuvat = k.esikatselut.slice(0, 2);
  if (kuvat.length === 0) return null;
  const grafiikka = k.meta.sovitus === "contain";
  return (
    <div className="kv-media">
      <div className={grafiikka ? "kv-media-plate" : "kv-media-photos"} aria-hidden="true">
        {kuvat.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            loading="lazy"
            draggable={false}
            style={grafiikka || !k.meta.kuvaKohdistus ? undefined : { objectPosition: k.meta.kuvaKohdistus }}
          />
        ))}
      </div>
    </div>
  );
}

function KategoriaKortti({ k }: { k: KategoriaData }) {
  const ryhmat = ryhmiteltyVariaatiot(k.variaatiot);
  /* Kaikki kortit kiinni oletuksena (Heikin QA 17.9.2026). */
  return (
    <details
      className="kv-card"
      style={{ ["--kv-accent" as string]: k.meta.accent }}
    >
      <summary className="kv-card-summary">
        <KuvaLaatikko k={k} />
        <div className="kv-card-body">
          <h3 className="kv-card-title">{k.meta.otsikko}</h3>
          <p className="kv-card-desc">{k.meta.kuvaus}</p>
          <div className="kv-card-meta">{variaatioKuvaus(k.variaatiot)}</div>
          {/* margin-top:auto pitää napit samalla linjalla vaikka otsikot ja
              kuvaukset ovat eri pituisia (Designin korjaus, kohta 3). */}
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
                <span className="kv-var-arrow" aria-hidden="true">→</span>
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
  satunnainenHref,
  viikkovisa,
}: {
  kategoriat: KategoriaData[];
  satunnainenHref: string | null;
  /** Kuluvan viikon viikkovisa. null = ei vielä olemassa → kortti jää pois. */
  viikkovisa?: ViikkoPromoData | null;
}) {
  return (
    <>
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: "Kuvavisat" }]} />
      <header className="kv-hero">
        <div className="kv-hero-media" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/20/kuvavisat/hero.webp" alt="" fetchPriority="high" />
        </div>
        <div className="tn-shell kv-hero-shell">
          <div className="kv-hero-in">
            <h1 className="kv-hero-title">Kuvavisat</h1>
            <p className="kv-hero-lede">
              Tunnista liput, vaakunat, linnut, eläimet, maalaukset, rakennukset ja kasvit. Valitse kategoria, sitten
              sinulle sopiva vaikeustaso.
            </p>
            {satunnainenHref && (
              <a className="kv-hero-random" href={satunnainenHref}>
                Arvo satunnainen kuvavisa <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="tn-shell">
        <div className="kv-page">
          <section className="kv-section">
            <div className="kv-section-head">
              <h2 className="kv-section-title">Valitse kategoria</h2>
              <span className="kv-section-note">Kategoria avaa visavariaatiot — peli ei käynnisty heti</span>
            </div>
            <div className="kv-layout" data-viikko={viikkovisa ? "1" : undefined}>
              {viikkovisa && <ViikkovisaKortti data={viikkovisa} />}
              <div className="kv-grid">
                {kategoriat.map((k) => (
                  <KategoriaKortti key={k.meta.type} k={k} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
