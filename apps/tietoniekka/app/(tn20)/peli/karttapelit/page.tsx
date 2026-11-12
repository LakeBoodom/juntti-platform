// KARTTAPELIT /peli/karttapelit hub-rungolla (Heikki 12.11.2026, vaihe 2; aiemmin CD-handoff "Rajanaapurit: Yhdysvallat" 4a,
// 1.11.2026). 1) hero = karttakuvitus + nimi + intro (Heikin luonnos 12.11. korostettuna); 2) nosto = Mikä maa? korostettuna
// rivinä (päivän vihje 1 koukkuna, CD 7.11. §3: kokoelman ensimmäinen); 3) kartat jaettuina riveinä: Maailma, Suomi,
// Yhdysvallat (merkki = pelin nimi, rivi = viikon reitin koukku, kuva = viikon reitin lähtö ja maali, /og/reitti/<peli>/rivi);
// 4) Näin pelaat suljettuna, rajaukset ja lähteet alalaidassa. Aluevalinta (maanosa, maakunta) on pelien omalla aloitussivulla.
// Kokoava sivu, joten ylänavigaatio ja murupolku (lib/nav.ts PELIMUOTOHUBIT).

import type { Metadata } from "next";
import Crumbs from "@/components/tn20/Crumbs";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import HubHero from "@/components/tn20/korttirivi/HubHero";
import HubRivit, { HubNosto } from "@/components/tn20/korttirivi/KorttiRivi";
import HubOhjeet from "@/components/tn20/korttirivi/HubOhjeet";
import { helsinginPaiva } from "@/lib/aika";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { KARTTAPELIT, KARTTAPELIT_SIVU, karttapelinKoukku, karttapelinRivikuva } from "@/lib/karttapelit";
import { KL_LAHDE } from "@/lib/kuntaliitos/reitti";
import { RN_LAHDE } from "@/lib/rajanaapurit/reitti";
import { USA_LAHDE } from "@/lib/rajanaapurit/osavaltiot";
import { maanantai } from "@/lib/reittipeli/viikonReitit";
import { maaKierros } from "@/lib/vihjepeli/data";
import { MAA_JULKAISU } from "@/lib/vihjepeli/aiheet/maa";
import { MM_SIVU } from "@/lib/vihjepeli/mikamaa";

/* Viikon reitti vaihtuu maanantaina ja Mikä maa? -rivin vihje 1 keskiyöllä → sivu uusitaan 10 minuutin välein. */
export const revalidate = 600;

const KUVAUS = "Rakenna reitti naapurista naapuriin maailmankartalla, Suomen kunnissa ja Yhdysvaltain osavaltioissa. Uusi viikon reitti joka maanantai.";

export const metadata: Metadata = {
  title: "Karttapelit – Rajanaapurit ja Kuntaliitos | Tietoniekka",
  description: KUVAUS,
  alternates: { canonical: KARTTAPELIT_SIVU },
  ...jakoMeta({ title: "Karttapelit", description: KUVAUS, url: KARTTAPELIT_SIVU, kuva: "/og/sivu/karttapelit" }),
};

const LAHTEET = { rajanaapurit: RN_LAHDE, kuntaliitos: KL_LAHDE, osavaltiot: USA_LAHDE };

/* Intro: Heikin luonnos 12.11.2026 korostettuna + viikon ja päivän reitit (entinen alalaidan huomautus). */
const INTRO = "Joka maanantai alkaa uusi viikon reitti, ja jokaisella maanosalla ja maakunnalla on lisäksi oma päivän reittinsä.";

export default async function KarttapelitSivu() {
  const iso = helsinginPaiva().iso;
  const viikko = maanantai(iso);
  /* Mikä maa? tuotannossa julkaisupäivästä (MAA_JULKAISU). */
  const mm = iso >= MAA_JULKAISU || process.env.VERCEL_ENV !== "production" ? await maaKierros(iso, null) : null;
  const kartat = KARTTAPELIT.map((k) => ({
    href: k.href,
    kuva: karttapelinRivikuva(k, viikko),
    kuvaton: k.nimi,
    merkki: k.laji,
    nimi: k.nimi,
    rivi: karttapelinKoukku(k, viikko) ?? k.kuvaus,
  }));
  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Karttapelit", url: KARTTAPELIT_SIVU, description: KUVAUS })} />
      <Crumbs items={[{ label: "Karttapelit" }]} />
      <main>
        <div className="hub">
          <HubHero
            kuva={{
              src: "/20/rajanaapurit/banneri-kartta.webp",
              srcSet: "/20/rajanaapurit/banneri-kartta-600.webp 600w, /20/rajanaapurit/banneri-kartta.webp 1520w",
              alt: "Keski-Euroopan valtiot kartalla",
              width: 1520,
              height: 987,
              pos: "50% 45%",
            }}
            nimi="Karttapelit"
            korostus={mm ? "Tunnista päivän maa vihjeistä tai rakenna reitti rajanaapurista toiseen." : "Rakenna reitti rajanaapurista toiseen."}
            intro={INTRO}
          />
          {mm ? (
            <HubNosto
              k={{ href: MM_SIVU, kuva: "/20/rivi/peli-mika-maa.webp", kuvaton: "Mikä maa?", nimi: "Mikä maa?", rivi: mm.vihjeet[0] }}
              merkki="Päivän peli"
              cta="Arvaa maa"
              entry="karttapelit:mika-maa"
            />
          ) : null}
          <HubRivit kortit={kartat} nimi="Karttapelit" />
          <HubOhjeet
            kohdat={[{
              otsikko: "Näin pelaat",
              sisalto: (
                <ul>
                  <li><b>Aloita.</b> Saat lähdön, maalin ja kuusi palaa sekaisin.</li>
                  <li><b>Järjestä.</b> Raahaa palat niin, että jokainen rajautuu seuraavaan.</li>
                  <li><b>Tarkista.</b> Näet, montako rajaa on väärin, mutta et sitä, mitkä. Saat kaksi uutta yritystä.</li>
                </ul>
              ),
            }]}
          />
          <footer className="hub-huom">
            {KARTTAPELIT.map((k) => (
              <p key={k.peli}><b>{k.laji === k.nimi ? k.nimi : `${k.laji}: ${k.nimi}`}.</b> {k.huomautus} {LAHTEET[k.peli]}</p>
            ))}
          </footer>
        </div>
      </main>
    </PeliKehys>
  );
}
