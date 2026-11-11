// TUPLA TAI KUITTI — aihesivu /peli/tupla-tai-kuitti hub-mallilla (Heikki 11.11.2026): studiokuva (Mikko ja Laura) ennallaan,
// sen alla erillinen iso logo poistui (logo näkyy studiokuvassa; h1 ruudunlukijalle). Aiheet kuvakortteina samoilla
// kokoelmakuvilla kuin etusivun Pelaa aiheittain (2 saraketta mobiilissa, 4 desktopilla); kortin napautus aloittaa pelin
// suoraan sillä aiheella (/peli/tupla-tai-kuitti/<aihe>?aloita=1), erillistä Aloita-nappia ei ole. Ohjeet suljettuina.
// Aiheen pelisivun oma aloitus (TuplaAloitus, logo + valinta) pysyy ennallaan.
import type { CSSProperties, ReactNode } from "react";
import "./tuplaaloitus.css";

export type HubAihe = { slug: string; nimi: string; accent: string; kuva: string; kuvaPos?: string };

export default function TuplaHub({ aiheet, saannot, tausta }: { aiheet: HubAihe[]; saannot: ReactNode; tausta: ReactNode }) {
  return (
    <>
      <div className="tks-kuva tkh-kuva">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/20/tupla/studio.webp"
          srcSet="/20/tupla/studio-800.webp 800w, /20/tupla/studio.webp 1672w"
          sizes="(max-width: 760px) 100vw, 720px"
          alt="Mikko ja Laura Tupla tai kuitti -studiossa"
          width={1672}
          height={941}
          fetchPriority="high"
        />
      </div>
      <section className="pk-aloitus tkh">
        <h1 className="tkh-sr">Tupla tai kuitti</h1>
        <p className="pk-lause">Valitse aihe, vastaa ja päätä joka kierroksella: tuplaatko vai otatko kuitin.</p>
        <ul className="tkh-aiheet" aria-label="Aiheet">
          {aiheet.map((a) => (
            <li key={a.slug}>
              <a className="tkh-aihe" href={`/peli/tupla-tai-kuitti/${a.slug}?aloita=1`} style={{ "--va": a.accent } as CSSProperties}>
                <span className="tkh-aihe-kuva">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.kuva} alt="" loading="lazy" decoding="async" width={320} height={200} style={a.kuvaPos ? { objectPosition: a.kuvaPos } : undefined} />
                </span>
                <span className="tkh-aihe-nimi" lang="fi">{a.nimi}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="pk-ohjeet">
          {[{ otsikko: "Näin pelaat", sisalto: saannot }, { otsikko: "Pelin tausta", sisalto: tausta }].map((o) => (
            <details key={o.otsikko} className="pk-ohje">
              <summary>
                {o.otsikko}
                <span aria-hidden="true">+</span>
              </summary>
              <div className="pk-ohje-sisalto">{o.sisalto}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
