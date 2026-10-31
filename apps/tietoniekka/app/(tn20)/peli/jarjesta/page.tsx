// JÄRJESTÄ-HUB /peli/jarjesta (pelimuotosivujen yhtenäistäminen, osa C; CD "Tietoniekka Jarjesta hub" 28.10.2026,
// Heikki 31.10.2026). Ikäjärjestys ja Laita järjestykseen yhtenä pelimuotona: päivän pakka + kaikki pakat teemoittain.
// Ei kuvaustekstiä eikä ohjeita (UI-sääntö 9); kortti aloittaa pelin suoraan (?aloita=1, kierros arvotaan palvelimella).

import type { Metadata } from "next";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { HUB_HREF, HUB_PAKAT, aloitaHref, hubTeemat, paivanPakka } from "@/lib/jarjesta/hub";
import "./jarjesta.css";

/* Päivän pakka vaihtuu keskiyöllä → sivu uusitaan tunnin välein. */
export const revalidate = 3600;

const KUVAUS = "Järjestä presidentit, pääministerit, puolueet ja tunnetut henkilöt oikeaan järjestykseen. Uusi pakka joka päivä.";

export const metadata: Metadata = {
  title: "Järjestä – järjestyspelit ja ikäjärjestys | Tietoniekka",
  description: KUVAUS,
  alternates: { canonical: HUB_HREF },
  ...jakoMeta({ title: "Järjestä", description: KUVAUS, url: HUB_HREF, kuva: "/og/sivu/ikajarjestys" }),
};

/** KORTTISÄÄNTÖ: pisin rivitettävä osa (välilyönti tai tavuviiva U+00AD jakaa) → otsikon koko CSS:ssä. */
const pisinTavu = (nimi: string) => Math.max(...nimi.split(/[\s­]+/).map((w) => w.length));

const ankkuri = (t: string) => t.toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/[^a-z0-9]+/g, "-");

export default function JarjestaHub() {
  const paiva = paivanPakka();
  const teemat = hubTeemat();
  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Järjestä", url: HUB_HREF, description: KUVAUS })} />
      <Pelipalkki peli="Järjestä" koti={{ href: "/", nimi: "Etusivu" }} />
      <main className="jh">
        <div className="jh-yla">
          <header className="jh-otsikko">
            <p className="jh-kicker">Järjestyspeli</p>
            <h1 className="jh-h1">Järjestä</h1>
            <p className="jh-fakta">{HUB_PAKAT.length} pakkaa</p>
          </header>
          <section className="jh-paiva" aria-labelledby="jh-paiva-h">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="jh-paiva-kuva" src={paiva.kuva} alt="" width={720} height={320} fetchPriority="high" />
            <div className="jh-paiva-teksti">
              <p className="jh-kicker">Päivän pakka</p>
              <h2 id="jh-paiva-h" className="jh-paiva-nimi" style={{ "--jh-lw": pisinTavu(paiva.nimi) } as React.CSSProperties}>{paiva.nimi}</h2>
              <p className="jh-paiva-meta">{paiva.meta}</p>
              <a className="tn-cta-lime jh-paiva-cta" href={aloitaHref(paiva)} data-tn-entry="jarjesta:paiva">
                Pelaa päivän pakka
              </a>
            </div>
          </section>
        </div>

        {teemat.map(({ teema, pakat }, i) => (
          /* Osion id = teeman nimi ilman ääkkösiä (/peli/ikajarjestys ohjaa → #henkilot). */
          <section key={teema} id={ankkuri(teema)} className="jh-teema" aria-labelledby={`${ankkuri(teema)}-h`}>
            <div className="jh-teema-yla">
              <h2 id={`${ankkuri(teema)}-h`} className="jh-teema-h">{teema}</h2>
              <span className="jh-teema-maara" aria-hidden="true">{pakat.length}</span>
            </div>
            <ul className="jh-ruudukko">
              {pakat.map((p) => (
                <li key={p.slug}>
                  <a className="jh-kortti" href={aloitaHref(p)} data-tn-entry={`jarjesta:${p.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="jh-kortti-kuva" src={p.kuva} alt="" width={720} height={320} loading={i === 0 ? undefined : "lazy"} decoding="async" />
                    <span className="jh-kortti-teksti">
                      <span className="jh-kortti-nimi" style={{ "--jh-lw": pisinTavu(p.nimi) } as React.CSSProperties}>
                        {p.nimi}
                      </span>
                      <span className="jh-kortti-meta">{p.meta}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </PeliKehys>
  );
}
