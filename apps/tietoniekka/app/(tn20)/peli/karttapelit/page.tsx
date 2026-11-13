// KARTTAPELIT /peli/karttapelit hub-rungolla (Heikki 12.11.2026, vaiheet 2–3; aiemmin CD-handoff "Rajanaapurit: Yhdysvallat" 4a).
// 1) hero = kuva + nimi + intro (Heikin teksti 12.11., ensimmäinen lause korostettuna). Kuva on väliaikaisesti etusivun
//    Rajanaapurit-kortin kuvitus (Viro–Latvia–?–Puola, PeliKuvitus "rajanaapurit" kuvana); lopullinen kuva teetetään erikseen.
// 2) ei nostoa (vaihe 3): päivittäin vaihtuva Mikä maa? on listan ensimmäinen rivi merkillä "Päivän peli", sitten kartat:
//    Maailma, Suomi, Yhdysvallat (merkki = pelin nimi, rivi = viikon reitin koukku, kuva = /og/reitti/<peli>/rivi).
// 3) Näin pelaat sekä Lähteet ja rajaukset suljettuina. Aluevalinta (maanosa, maakunta) on pelien omalla aloitussivulla.
// Kokoava sivu, joten ylänavigaatio ja murupolku (lib/nav.ts PELIMUOTOHUBIT).

import type { Metadata } from "next";
import Crumbs from "@/components/tn20/Crumbs";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import HubHero from "@/components/tn20/korttirivi/HubHero";
import HubRivit, { type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
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
import { ETUSIVUN_PELIMUODOT } from "@/lib/pelimuodot";

/* Viikon reitti vaihtuu maanantaina ja Mikä maa? -päivä keskiyöllä → sivu uusitaan 10 minuutin välein. */
export const revalidate = 600;

const KUVAUS = "Rakenna reitti naapurista naapuriin maailmankartalla, Suomen kunnissa ja Yhdysvaltain osavaltioissa. Uusi viikon reitti joka maanantai.";

export const metadata: Metadata = {
  title: "Karttapelit – Rajanaapurit ja Kuntaliitos | Tietoniekka",
  description: KUVAUS,
  alternates: { canonical: KARTTAPELIT_SIVU },
  ...jakoMeta({ title: "Karttapelit", description: KUVAUS, url: KARTTAPELIT_SIVU, kuva: "/og/sivu/karttapelit" }),
};

const LAHTEET = { rajanaapurit: RN_LAHDE, kuntaliitos: KL_LAHDE, osavaltiot: USA_LAHDE };

/* Intro: Heikin teksti 12.11.2026 (vaihe 3), ensimmäinen lause korostettuna. */
const KOROSTUS = "Mikä maa on minkäkin vieressä?";
const INTRO = "Tunnista päivän maa vihjeistä. Rakenna reitti maasta toiseen rajanaapuri kerrallaan, maailmalla tai Yhdysvaltain osavaltioissa. Tai kulje Suomen halki kunta kunnalta. Kartta on tuttu, kunnes pitää muistaa naapurit.";
/** Mikä maa? -rivin tietorivi = etusivun pelikortin rivi (sama teksti kaikkialla). */
const MM_RIVI = ETUSIVUN_PELIMUODOT.find((p) => p.slug === "mika-maa")?.etusivu_rivi ?? null;

export default async function KarttapelitSivu() {
  const iso = helsinginPaiva().iso;
  const viikko = maanantai(iso);
  /* Mikä maa? tuotannossa julkaisupäivästä (MAA_JULKAISU). Kierros haetaan, jotta rivi näkyy vain kun päivän maa on olemassa. */
  const mm = iso >= MAA_JULKAISU || process.env.VERCEL_ENV !== "production" ? await maaKierros(iso, null) : null;
  const paivan: RiviKortti[] = mm ? [{ href: MM_SIVU, kuva: "/20/rivi/peli-mika-maa.webp", kuvaton: "Mikä maa?", merkki: "Päivän peli", nimi: "Mikä maa?", rivi: MM_RIVI }] : [];
  const kartat: RiviKortti[] = KARTTAPELIT.map((k) => ({
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
              src: "/20/karttapelit/hero-valiaikainen.webp",
              srcSet: "/20/karttapelit/hero-valiaikainen-800.webp 800w, /20/karttapelit/hero-valiaikainen.webp 1600w",
              alt: "Rajanaapurit-pelin reitti: Virosta Latvian kautta Puolaan",
              width: 1600,
              height: 900,
            }}
            nimi="Karttapelit"
            korostus={KOROSTUS}
            intro={INTRO}
          />
          <HubRivit kortit={[...paivan, ...kartat]} nimi="Karttapelit" />
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
            }, {
              otsikko: "Lähteet ja rajaukset",
              sisalto: (
                <ul>
                  {KARTTAPELIT.map((k) => (
                    <li key={k.peli}><b>{k.laji === k.nimi ? k.nimi : `${k.laji}: ${k.nimi}`}.</b> {k.huomautus} {LAHTEET[k.peli]}</li>
                  ))}
                </ul>
              ),
            }]}
          />
        </div>
      </main>
    </PeliKehys>
  );
}
