// JÄRJESTÄ-HUB /peli/jarjesta (pelimuotosivujen yhtenäistäminen, osa C; CD "Tietoniekka Jarjesta hub v2" kierros 5a,
// Heikki 31.10.2026). Hero on päivän pakan rivi väärässä järjestyksessä ("Tämä rivi on väärin"), toisena aina
// henkilörivi (Tunnetut suomalaiset), lopuksi muut pakat "Lisää rivejä". "Korjaa rivi" pelaa täsmälleen näkyvän rivin.
// Rivit ovat samat kaikille koko päivän (lib/jarjesta/siemen.ts). Ei ohjeita eikä aputekstejä (UI-sääntö 9):
// rivin lause on pelin kysymys (peruste ja suunta).

import type { Metadata } from "next";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { henkiloKuva } from "@/lib/henkilokuvat";
import { JULKAISTUT, pakkaHref } from "@/lib/jarjesta/pakat";
import { haePaivanRivi } from "@/lib/jarjesta/kierros";
import { getPaivanHenkilot } from "@/lib/ikajarjestys";
import { paivaAvain } from "@/lib/jarjesta/siemen";
import { HENKILOPAKKA, HUB_HREF, aloitaHref, hubPakka, paivanPakka } from "@/lib/jarjesta/hub";
import "./jarjesta.css";

/* Päivän rivi vaihtuu keskiyöllä → sivu uusitaan tunnin välein. Linkki kantaa rivin id:t, joten välimuistin
   eilinen rivi pelataan silti sellaisena kuin se näkyy. */
export const revalidate = 3600;

const KUVAUS = "Järjestä presidentit, pääministerit, puolueet ja tunnetut suomalaiset oikeaan järjestykseen. Uusi rivi joka päivä.";

export const metadata: Metadata = {
  title: "Järjestä – järjestyspelit ja ikäjärjestys | Tietoniekka",
  description: KUVAUS,
  alternates: { canonical: HUB_HREF },
  ...jakoMeta({ title: "Järjestä", description: KUVAUS, url: HUB_HREF, kuva: "/og/sivu/ikajarjestys" }),
};

/** CD 5a: palat hieman vinossa (staattinen, ei animaatiota). */
const KALLISTUS = ["-1.2deg", ".9deg", "-.5deg", "1.3deg", "-.9deg"];

/** Hubin rivissä nimi ilman tarkennetta: "Redrama (Lasse Mellberg)" → "Redrama". */
const lyhytNimi = (nimi: string) => nimi.replace(/\s*\([^)]*\)/g, "").trim();

/** KORTTISÄÄNTÖ: pitkät puoluenimet tavutettuina (U+00AD), muuten kapea desktop-pala pienentäisi nimen alle 12 px:n. */
const TAVUTA: Record<string, string> = {
  Kristillisdemokraatit: "Kristillis­demokraatit",
  Perussuomalaiset: "Perus­suomalaiset",
  Vasemmistoliitto: "Vasemmisto­liitto",
  Sosialidemokraatit: "Sosiali­demokraatit",
};

/** KORTTISÄÄNTÖ: pisin rivitettävä osa (välilyönti, yhdysmerkki tai tavuviiva U+00AD jakaa) → nimen koko CSS:ssä. */
const pisinTavu = (nimi: string) => Math.max(...nimi.split(/[\s\-­]+/).map((w) => w.length));

type Pala = { id: string; nimi: string; kuva: string | null };

function Rivi({ palat, kuvat, siirto = 0 }: { palat: Pala[]; kuvat: boolean; siirto?: number }) {
  return (
    <ol className={`jh-rivi${kuvat ? " jh-rivi--kuvat" : ""}`}>
      {palat.map((p, i) => (
        <li key={p.id} className="jh-pala">
          <span className="jh-nro" aria-hidden="true">{i + 1}</span>
          <span className="jh-laatta" style={{ "--jh-kallistus": KALLISTUS[(i + siirto) % KALLISTUS.length] } as React.CSSProperties}>
            {kuvat && p.kuva && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="jh-laatta-kuva" src={p.kuva} alt="" width={240} height={320} loading="lazy" decoding="async" />
            )}
            <span className="jh-laatta-nimi" style={{ "--jh-lw": pisinTavu(p.nimi) } as React.CSSProperties}>{p.nimi}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default async function JarjestaHub() {
  const paiva = paivaAvain();
  const pakka = paivanPakka(paiva);
  const rivi = await haePaivanRivi(pakka.slug, paiva);
  const henkilot = await getPaivanHenkilot(paiva, rivi.map((k) => k.name));

  const rivinPalat: Pala[] = rivi.map((k) => ({ id: k.id, nimi: TAVUTA[k.name] ?? k.name, kuva: henkiloKuva(k.image_url) }));
  const rivinKuvat = rivinPalat.length > 0 && rivinPalat.every((p) => p.kuva);
  const heroHref = rivi.length ? `${pakkaHref(pakka)}?kohteet=${rivi.map((k) => k.id).join(",")}` : aloitaHref(hubPakka(pakka));
  const henkHref = henkilot.length ? `${HENKILOPAKKA.href}?henkilot=${henkilot.map((h) => h.id).join(",")}&rivi=1` : aloitaHref(HENKILOPAKKA);
  const lisaa = JULKAISTUT.filter((p) => p.slug !== pakka.slug).map(hubPakka);

  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Järjestä", url: HUB_HREF, description: KUVAUS })} />
      <Pelipalkki peli="Järjestä" koti={{ href: "/", nimi: "Etusivu" }} />
      <main className="jh">
        <section className="jh-hero" aria-labelledby="jh-h1">
          <header className="jh-otsikko">
            <p className="jh-kicker">Järjestä · {pakka.kortti.otsikko}</p>
            <h1 id="jh-h1" className="jh-h1">Tämä rivi on väärin</h1>
          </header>
          <p className="jh-lause">{pakka.paivanLause}</p>
          {rivinPalat.length > 0 && <Rivi palat={rivinPalat} kuvat={rivinKuvat} />}
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
          {henkilot.length > 0 && <Rivi palat={henkilot.map((h) => ({ id: h.id, nimi: lyhytNimi(h.name), kuva: h.kuva }))} kuvat siirto={2} />}
          <a className="jh-cta jh-cta--toinen" href={henkHref} data-tn-entry="jarjesta:paiva:henkilot">
            Korjaa rivi
          </a>
        </section>

        <section className="jh-lisaa" aria-labelledby="jh-lisaa-h">
          <h2 id="jh-lisaa-h" className="jh-lisaa-h">Lisää rivejä</h2>
          <ul className="jh-ikonit">
            {lisaa.map((p) => (
              <li key={p.slug}>
                <a className="jh-ikoni" href={aloitaHref(p)} data-tn-entry={`jarjesta:${p.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="jh-ikoni-kuva" src={p.kuva} alt="" width={96} height={96} loading="lazy" decoding="async" />
                  <span className="jh-ikoni-nimi">{p.nimi}</span>
                  <span className="jh-ikoni-meta">{p.meta}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PeliKehys>
  );
}

