// JÄRJESTÄ-HUB /peli/jarjesta (pelimuotosivujen yhtenäistäminen, osa C; CD "Järjestä yhtenäinen UX" v0.2 kierros 4,
// Heikki 3.11.2026). Esimerkki on itse peli: hero ja pelattava presidenttirivi (JarjestaHero), seuraava haaste ja
// muut pakat ryhmissä Tunnetut suomalaiset, Paikat ja luonto, Politiikka.
// Presidenttirivi vaihtuu päivittäin ja on sama kaikille koko päivän (lib/jarjesta/siemen.ts). Otsikon alla ei tekstiä
// (UI-sääntö 9): Heikin poikkeus koskee vain heroa ja tehtävää.

import type { Metadata } from "next";
import Crumbs from "@/components/tn20/Crumbs";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { haePakka, pakkaHref } from "@/lib/jarjesta/pakat";
import { haePaivanRivi } from "@/lib/jarjesta/kierros";
import { paivaAvain } from "@/lib/jarjesta/siemen";
import { HENKILOPAKKA, HUB_HREF, IKA_PAKAT, KIERRON_PAKAT, aloitaHref, hubPakka, seuraavaPakka, type HubPakka } from "@/lib/jarjesta/hub";
import JarjestaHero from "./JarjestaHero";
import "./jarjesta.css";

/* Päivän rivi vaihtuu keskiyöllä → sivu uusitaan tunnin välein. */
export const revalidate = 3600;

const KUVAUS = "Järjestä presidentit, puolueet, tunturit, järvet, kaupungit ja tunnetut suomalaiset oikeaan järjestykseen. Uusi rivi joka päivä.";

export const metadata: Metadata = {
  title: "Järjestä – järjestyspelit ja ikäjärjestys | Tietoniekka",
  description: KUVAUS,
  alternates: { canonical: HUB_HREF },
  ...jakoMeta({ title: "Järjestä", description: KUVAUS, url: HUB_HREF, kuva: "/og/sivu/ikajarjestys" }),
};

const ENSIMMAINEN = "presidentit";
const SEURAAVA_NIMI = "Suomen tunturit";

function Ikonit({ pakat }: { pakat: HubPakka[] }) {
  return (
    <ul className="jh-ikonit">
      {pakat.map((p) => (
        <li key={p.slug}>
          <a className="jh-ikoni" href={aloitaHref(p)} data-tn-entry={`jarjesta:${p.slug}`}>
            {p.kolmikko ? (
              <span className="jh-ikoni-kehys jh-ikoni-kolmikko">
                {p.kolmikko.map((k) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={k} src={k} alt="" width={40} height={40} loading="lazy" decoding="async" />
                ))}
              </span>
            ) : (
              <span className="jh-ikoni-kehys" data-tunnus={p.tunnus || undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.kuva} alt="" width={104} height={104} loading="lazy" decoding="async" />
              </span>
            )}
            <span className="jh-ikoni-nimi">{p.hubNimi ?? p.nimi}</span>
            <span className="jh-ikoni-meta">{p.meta}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* Pakat CD:n järjestyksessä. Presidentit on hubin ensimmäinen haaste, joten sillä ei ole omaa pyörylää. */
const RYHMAT = [
  { ryhma: "paikat", nimi: "Paikat ja luonto", pakat: ["tunturit-korkeus", "vuoret-korkeus", "jarvet-pinta-ala", "kansallispuistot-pinta-ala", "kaupungit-asukasluku", "maakunnat-pinta-ala"] },
  { ryhma: "politiikka", nimi: "Politiikka", pakat: ["paaministerit", "paaministerit-kesto", "puolueet-ika", "eduskuntaryhmat", "vaalipiirit-paikat", "eduskunta-pisimpaan"] },
] as const;
const jarjestys = (pakat: readonly string[], slug: string) => (pakat.includes(slug) ? pakat.indexOf(slug) : pakat.length);

export default async function JarjestaHub() {
  const pakka = haePakka(ENSIMMAINEN)!;
  const rivi = await haePaivanRivi(ENSIMMAINEN, paivaAvain());
  const seuraava = seuraavaPakka(ENSIMMAINEN);
  const lisaa = KIERRON_PAKAT.filter((p) => p.slug !== ENSIMMAINEN).map((p) => (p.slug === "paaministerit" ? { ...hubPakka(p), meta: "Ensimmäinen kausi" } : hubPakka(p)));

  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Järjestä", url: HUB_HREF, description: KUVAUS })} />
      <Crumbs items={[{ label: "Järjestä" }]} />
      <main className="jh">
        {rivi.length > 0 ? (
          <JarjestaHero rivi={rivi} slug={pakka.slug} suunta={pakka.direction} href={pakkaHref(pakka)} seuraava={aloitaHref(seuraava)} jakoNimi={pakka.kortti.otsikko} />
        ) : (
          <section className="jh-hero" aria-labelledby="jh-h1">
            <header className="jh-intro">
              <h1 id="jh-h1" className="jh-h1">Järjestä</h1>
            </header>
            <a className="tn-cta-lime jh-cta" href={aloitaHref(hubPakka(pakka))}>Aloita</a>
          </section>
        )}

        <a className="jh-seuraava" href={aloitaHref(seuraava)} data-tn-entry={`jarjesta:seuraava:${seuraava.slug}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="jh-seuraava-kuva" src={seuraava.kuva} alt="" width={72} height={72} loading="lazy" decoding="async" />
          <span className="jh-seuraava-teksti">
            <span className="jh-kicker">Seuraava haaste</span>
            <span className="jh-seuraava-nimi">{SEURAAVA_NIMI}</span>
          </span>
          <span className="jh-seuraava-nappi">Pelaa seuraava</span>
        </a>

        <section className="jh-lisaa" aria-labelledby="jh-lisaa-h">
          <h2 id="jh-lisaa-h" className="jh-lisaa-h">Uskallatko kokeilla seuraavaa?</h2>
          <div className="jh-ryhmat">
            <div id="henkilot" className="jh-ryhma">
              <h3 className="jh-ryhma-h">{HENKILOPAKKA.nimi}</h3>
              <Ikonit pakat={IKA_PAKAT} />
            </div>
            {RYHMAT.map((r) => (
              <div key={r.ryhma} className="jh-ryhma">
                <h3 className="jh-ryhma-h">{r.nimi}</h3>
                <Ikonit pakat={lisaa.filter((p) => p.ryhma === r.ryhma).sort((x, y) => jarjestys(r.pakat, x.slug) - jarjestys(r.pakat, y.slug))} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </PeliKehys>
  );
}
