// JÄRJESTÄ-HUB /peli/jarjesta (pelimuotosivujen yhtenäistäminen, osa C; CD "Tietoniekka Jarjesta hub v2" kierros 5a,
// Heikki 31.10.2026). Hero on päivän pakan rivi väärässä järjestyksessä ("Tämä rivi on väärin"), toisena aina
// henkilörivi (Tunnetut suomalaiset), lopuksi muut pakat "Lisää järjestettävää". "Korjaa rivi" pelaa täsmälleen näkyvän
// rivin. CD "Järjestä yhtenäinen UX" (Heikki 2.11.2026): sama rivikortti kuin pelissä, vinossa ja ilman kahvaa; pakat
// ryhmissä Paikat ja luonto ensin, Politiikka sitten.
// Rivit ovat samat kaikille koko päivän (lib/jarjesta/siemen.ts). Ei ohjeita eikä aputekstejä (UI-sääntö 9):
// rivin lause on pelin kysymys (peruste ja suunta).

import type { Metadata } from "next";
import Crumbs from "@/components/tn20/Crumbs";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { RankingCard, type RankingCardPerson } from "@/components/tn20/RankingCard";
import { pakkaHref } from "@/lib/jarjesta/pakat";
import { haePaivanRivi } from "@/lib/jarjesta/kierros";
import { getPaivanHenkilot } from "@/lib/ikajarjestys";
import { paivaAvain } from "@/lib/jarjesta/siemen";
import { HENKILOPAKKA, HUB_HREF, KIERRON_PAKAT, aloitaHref, hubPakka, paivanPakka, type HubPakka } from "@/lib/jarjesta/hub";
import "./jarjesta.css";

/* Päivän rivi vaihtuu keskiyöllä → sivu uusitaan tunnin välein. Linkki kantaa rivin id:t, joten välimuistin
   eilinen rivi pelataan silti sellaisena kuin se näkyy. */
export const revalidate = 3600;

const KUVAUS = "Järjestä presidentit, puolueet, tunturit, järvet, kaupungit ja tunnetut suomalaiset oikeaan järjestykseen. Uusi rivi joka päivä.";

export const metadata: Metadata = {
  title: "Järjestä – järjestyspelit ja ikäjärjestys | Tietoniekka",
  description: KUVAUS,
  alternates: { canonical: HUB_HREF },
  ...jakoMeta({ title: "Järjestä", description: KUVAUS, url: HUB_HREF, kuva: "/og/sivu/ikajarjestys" }),
};

/** CD 5a (31.10.2026): "VÄÄRIN" korallina, kirjaimet sekaisin; sisääntulo kerran (transform, porrastettu). */
const SEKAISIN: Array<[string, string]> = [
  ["V", "translate(0, -.05em) rotate(-7deg)"],
  ["Ä", "translate(.02em, .09em) rotate(6deg)"],
  ["Ä", "translate(-.01em, -.11em) rotate(-4deg)"],
  ["R", "translate(.03em, .06em) rotate(10deg)"],
  ["I", "translate(0, -.07em) rotate(-12deg)"],
  ["N", "translate(.05em, .11em) rotate(5deg)"],
];

function Vaarin() {
  return (
    <span className="jh-vaarin">
      <span className="jh-sr">väärin</span>
      {SEKAISIN.map(([k, t], i) => (
        <span key={i} className="jh-vaarin-k" aria-hidden="true" style={{ "--jh-t": t, "--jh-i": i } as React.CSSProperties}>
          {k}
        </span>
      ))}
    </span>
  );
}

/** Hubin rivissä nimi ilman tarkennetta: "Redrama (Lasse Mellberg)" → "Redrama". */
const lyhytNimi = (nimi: string) => nimi.replace(/\s*\([^)]*\)/g, "").trim();

function Rivi({ palat }: { palat: RankingCardPerson[] }) {
  return (
    <ol className="jh-rivi">
      {palat.map((p, i) => (
        <li key={p.id}>
          <RankingCard person={p} position={i + 1} vino readOnly />
        </li>
      ))}
    </ol>
  );
}

function Ikonit({ pakat }: { pakat: HubPakka[] }) {
  return (
    <ul className="jh-ikonit" style={{ "--jh-n": pakat.length } as React.CSSProperties}>
      {pakat.map((p) => (
        <li key={p.slug}>
          <a className="jh-ikoni" href={aloitaHref(p)} data-tn-entry={`jarjesta:${p.slug}`}>
            <span className="jh-ikoni-kehys" data-tunnus={p.tunnus || undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.kuva} alt="" width={96} height={96} loading="lazy" decoding="async" />
            </span>
            <span className="jh-ikoni-nimi">{p.nimi}</span>
            <span className="jh-ikoni-meta">{p.meta}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* Paikat ja luonto ensin (Heikki 2.11.2026); pakat CD:n järjestyksessä, ei päivän kierron. */
const RYHMAT = [
  { ryhma: "paikat", nimi: "Paikat ja luonto", pakat: ["tunturit-korkeus", "vuoret-korkeus", "jarvet-pinta-ala", "kansallispuistot-pinta-ala", "kaupungit-asukasluku", "maakunnat-pinta-ala"] },
  { ryhma: "politiikka", nimi: "Politiikka", pakat: ["presidentit", "paaministerit", "paaministerit-kesto", "puolueet-ika", "eduskuntaryhmat", "vaalipiirit-paikat", "eduskunta-pisimpaan"] },
] as const;
const jarjestys = (pakat: readonly string[], slug: string) => (pakat.includes(slug) ? pakat.indexOf(slug) : pakat.length);

export default async function JarjestaHub() {
  const paiva = paivaAvain();
  const pakka = paivanPakka(paiva);
  const rivi = await haePaivanRivi(pakka.slug, paiva);
  const henkilot = await getPaivanHenkilot(paiva, rivi.map((k) => k.name));

  const heroHref = rivi.length ? `${pakkaHref(pakka)}?kohteet=${rivi.map((k) => k.id).join(",")}` : aloitaHref(hubPakka(pakka));
  const henkHref = henkilot.length ? `${HENKILOPAKKA.href}?henkilot=${henkilot.map((h) => h.id).join(",")}&rivi=1` : aloitaHref(HENKILOPAKKA);
  const lisaa = KIERRON_PAKAT.filter((p) => p.slug !== pakka.slug).map(hubPakka);

  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Järjestä", url: HUB_HREF, description: KUVAUS })} />
      <Crumbs items={[{ label: "Järjestä" }]} />
      <main className="jh">
        <section className="jh-hero" aria-labelledby="jh-h1">
          <header className="jh-otsikko">
            <p className="jh-kicker">Järjestä · {pakka.kortti.otsikko}</p>
            <h1 id="jh-h1" className="jh-h1">Tämä rivi on <Vaarin /></h1>
          </header>
          <p className="jh-lause">{pakka.paivanLause}</p>
          {rivi.length > 0 && <Rivi palat={rivi} />}
          <a className="tn-cta-lime jh-cta" href={heroHref} data-tn-entry={`jarjesta:paiva:${pakka.slug}`}>
            Korjaa rivi
          </a>
        </section>

        <section id="henkilot" className="jh-henkilot" aria-labelledby="jh-henkilot-h">
          <header className="jh-otsikko">
            <p className="jh-kicker">Järjestä · {HENKILOPAKKA.nimi}</p>
            <h2 id="jh-henkilot-h" className="jh-h2">Tämäkin on väärin</h2>
          </header>
          <p className="jh-lause">{HENKILOPAKKA.paivanLause}</p>
          {henkilot.length > 0 && <Rivi palat={henkilot.map((h) => ({ id: h.id, name: lyhytNimi(h.name), role: h.role, image_url: h.kuva }))} />}
          <a className="jh-cta jh-cta--toinen" href={henkHref} data-tn-entry="jarjesta:paiva:henkilot">
            Korjaa rivi
          </a>
        </section>

        <section className="jh-lisaa" aria-labelledby="jh-lisaa-h">
          <h2 id="jh-lisaa-h" className="jh-lisaa-h">Lisää järjestettävää</h2>
          {RYHMAT.map((r) => {
            const pakat = lisaa.filter((p) => p.ryhma === r.ryhma).sort((x, y) => jarjestys(r.pakat, x.slug) - jarjestys(r.pakat, y.slug));
            return pakat.length > 0 ? (
              <div key={r.ryhma} className="jh-ryhma">
                <h3 className="jh-ryhma-h">{r.nimi}</h3>
                <Ikonit pakat={pakat} />
              </div>
            ) : null;
          })}
        </section>
      </main>
    </PeliKehys>
  );
}

