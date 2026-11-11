// KARTTAPELIT /peli/karttapelit (CD-handoff "Rajanaapurit: Yhdysvallat", hub 4a; Heikki 1.11.2026). Kortit karttojen
// mukaan: Maailma, Suomi, Yhdysvallat. Kuva on viikon reitin lähtö ja maali vaalealla kartalla (6c, ei ratkaisua), koukku
// viikon reitin otsikko. Desktopilla kortissa myös aluevalinta ja Pelaa. Kokoava sivu, joten ylänavigaatio ja murupolku
// (lib/nav.ts PELIMUOTOHUBIT). Kartat vaaleina (6c). Hub-malli 11.11.2026 (Heikki): h1 + yksi rivi; mobiilissa Mikä maa?
// isona ja reittipelit tiiviinä riveinä; Näin pelaat sekä Lähteet ja rajaukset suljettuina.

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Crumbs from "@/components/tn20/Crumbs";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import { AlueLinkit } from "@/components/tn20/reittipeli/AlueValinta";
import { helsinginPaiva } from "@/lib/aika";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { KARTTAPELIT, KARTTAPELIT_SIVU, karttapelinKoukku, karttapelinKuva } from "@/lib/karttapelit";
import { KL_LAHDE, KL_MAAKUNNAT } from "@/lib/kuntaliitos/reitti";
import { RN_LAHDE, RN_MAANOSAT } from "@/lib/rajanaapurit/reitti";
import { USA_LAHDE } from "@/lib/rajanaapurit/osavaltiot";
import { maanantai } from "@/lib/reittipeli/viikonReitit";
import MikaMaaKortti from "@/components/tn20/vihjepeli/MikaMaaKortti";
import { maaKierros } from "@/lib/vihjepeli/data";
import { MAA_JULKAISU } from "@/lib/vihjepeli/aiheet/maa";
import { MM_SIVU } from "@/lib/vihjepeli/mikamaa";
import "../kuntaliitos/reittihero.css";
import MobiiliRivit from "@/components/tn20/korttirivi/KorttiRivi";
import "./karttapelit.css";

/* Viikon reitti vaihtuu maanantaina ja Mikä maa? -kortin vihje 1 keskiyöllä → sivu uusitaan 10 minuutin välein. */
export const revalidate = 600;

const KUVAUS = "Rakenna reitti naapurista naapuriin maailmankartalla, Suomen kunnissa ja Yhdysvaltain osavaltioissa. Uusi viikon reitti joka maanantai.";

export const metadata: Metadata = {
  title: "Karttapelit – Rajanaapurit ja Kuntaliitos | Tietoniekka",
  description: KUVAUS,
  alternates: { canonical: KARTTAPELIT_SIVU },
  ...jakoMeta({ title: "Karttapelit", description: KUVAUS, url: KARTTAPELIT_SIVU, kuva: "/og/sivu/karttapelit" }),
};

const LAHTEET = { rajanaapurit: RN_LAHDE, kuntaliitos: KL_LAHDE, osavaltiot: USA_LAHDE };

const pisinSana = (t: string) => Math.max(...t.split(/[\s-]+/).map((w) => w.length));

export default async function KarttapelitSivu() {
  const iso = helsinginPaiva().iso;
  const viikko = maanantai(iso);
  /* Mikä maa? kokoelman ensimmäiseksi (CD-paketti 7.11.2026 §3, Heikki 7.11.): tuotannossa julkaisupäivästä (MM_JULKAISU). */
  const mm = iso >= MAA_JULKAISU || process.env.VERCEL_ENV !== "production" ? await maaKierros(iso, null) : null;
  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Karttapelit", url: KARTTAPELIT_SIVU, description: KUVAUS })} />
      <Crumbs items={[{ label: "Karttapelit" }]} />
      <main className="kh">
        {/* Hub-malli (Heikki 11.11.2026): h1 + yksi rivi, ei alaotsikoita eikä kuvauskappaletta. */}
        <header className="kh-yla">
          <h1 className="kh-h1">Karttapelit</h1>
          <p className="kh-lause">{mm ? "Arvaa päivän maa tai rakenna reitti naapurista naapuriin." : "Rakenna reitti naapurista naapuriin."}</p>
        </header>
        <ul className="kh-kortit" data-mm={mm ? "" : undefined}>
          {mm && <MikaMaaKortti href={MM_SIVU} paiva={mm.paiva} vihje={mm.vihjeet[0]} />}
          {KARTTAPELIT.map((k) => {
            const koukku = karttapelinKoukku(k, viikko);
            return (
              <li key={k.peli} className="kh-kortti kh-kortti--reitti">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="kh-kuva" src={karttapelinKuva(k, viikko)} alt="" width={640} height={480} loading="lazy" />
                <div className="kh-teksti">
                  <p className="kh-laji">{k.laji}</p>
                  <h2 className="kh-nimi" style={{ "--kh-lw": pisinSana(k.nimi) } as CSSProperties}>
                    {/* Koko kortti on linkki (::after); aluevalinta on sen päällä. */}
                    <a href={k.href} data-tn-entry={`karttapelit:${k.peli}`}>{k.nimi}</a>
                  </h2>
                  {koukku && <p className="kh-koukku" lang="fi">{koukku.replace(/-/g, "-​")}</p>}
                  <p className="kh-kuvaus">{k.kuvaus}</p>
                  <div className="kh-toiminnot">
                    {k.peli === "rajanaapurit" && (
                      <nav className="kh-alueet" aria-label="Valitse maanosa">
                        {RN_MAANOSAT.map((m) => <a key={m.tunnus} href={`${k.href}?${k.param}=${m.tunnus}`}>{m.nimi}</a>)}
                      </nav>
                    )}
                    {k.peli === "kuntaliitos" && (
                      <div className="kh-alueet">
                        <AlueLinkit sivu={k.href} param="maakunta" kaikki="Koko Suomi" alueet={KL_MAAKUNNAT} nappi="Valitse maakunta" />
                      </div>
                    )}
                    <span className="kh-cta tn-cta-lime" aria-hidden="true">Pelaa</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {/* Mobiili (< 768): Mikä maa? isona korttina yllä, reittipelit tiiviinä riveinä (KorttiRivi). Alueen valinta pelin
            omassa aloitusnäkymässä; desktopin korteissa maanosa- ja maakuntavalinta kuten ennen. */}
        <MobiiliRivit
          nimi="Reittipelit"
          kortit={KARTTAPELIT.map((k) => ({
            href: k.href, kuva: karttapelinKuva(k, viikko), kuvaton: "Karttapeli", merkki: k.laji, nimi: k.nimi,
            rivi: karttapelinKoukku(k, viikko) ?? k.kuvaus,
          }))}
        />
        {/* Näin pelaat sekä lähteet ja rajaukset suljettuina (lähdemerkinnät pysyvät sivulla, lisenssiehto). */}
        <div className="pk-ohjeet kh-ohjeet">
          <details className="pk-ohje">
            <summary>Näin pelaat<span aria-hidden="true">+</span></summary>
            <div className="pk-ohje-sisalto kh-ohje">
          <ol>
            <li><b>Aloita</b>Saat lähdön, maalin ja kuusi palaa sekaisin.</li>
            <li><b>Järjestä</b>Raahaa palat niin, että jokainen rajautuu seuraavaan.</li>
            <li><b>Tarkista</b>Näet, montako rajaa on väärin, mutta et sitä, mitkä. Saat kaksi uutta yritystä.</li>
          </ol>
            </div>
          </details>
          <details className="pk-ohje">
            <summary>Lähteet ja rajaukset<span aria-hidden="true">+</span></summary>
            <div className="pk-ohje-sisalto kh-huomautukset">
              <p>Uusi viikon reitti joka maanantai, päivän reitti jokaiselle maanosalle ja maakunnalle.</p>
              {KARTTAPELIT.map((k) => (
                <p key={k.peli}><b>{k.nimi}:</b> {k.huomautus} {LAHTEET[k.peli]}</p>
              ))}
            </div>
          </details>
        </div>
      </main>
    </PeliKehys>
  );
}
