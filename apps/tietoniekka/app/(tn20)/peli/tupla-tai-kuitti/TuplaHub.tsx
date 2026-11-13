// TUPLA TAI KUITTI — aihesivu /peli/tupla-tai-kuitti hub-rungolla (Heikki 12.11.2026, vaihe 1 = malli muille hub-sivuille):
// 1) hero: studiokuva (Mikko ja Laura) + pelin nimi (h1) + intro omalla pohjallaan, ensimmäinen lause korostettuna;
// 2) ei nostoa; 3) kahdeksan aihetta jaettuina riveinä (kuva, nimi, aiheen kuvausrivi TEEMAT-datasta), rivin napautus
// aloittaa pelin sillä aiheella (/peli/tupla-tai-kuitti/<aihe>?aloita=1); 4) Näin pelaat ja Pelin tausta suljettuina.
// Aiheen pelisivun oma aloitus (TuplaAloitus, logo + valinta) pysyy ennallaan.
import type { ReactNode } from "react";
import HubHero from "@/components/tn20/korttirivi/HubHero";
import HubRivit, { type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
import HubOhjeet from "@/components/tn20/korttirivi/HubOhjeet";

/* Intro: Heikin hyväksymä suunta 12.11.2026 (sanoja voi vielä hioa). Tarkistettu pelilogiikkaa vasten (lib/tuplaTaiKuitti.ts):
   potti tuplaantuu 1 → 512, väärä vastaus vie potin (turvatasot kerrotaan Näin pelaat -kohdassa), kuittaus/tuplaus
   jokaisen oikean jälkeen paitsi kymmenennen, jolloin peli päättyy täyteen pottiin. */
/* Hero-tekstit 13.11.2026: CC-brief "Hub-sivujen hero-tekstien yhtenäistys" (Heikki hyväksyi). */
const KOROSTUS = "Tuplaatko vai otatko kuitin?";
const INTRO =
  "Tietoniekan versio legendaarisesta Tupla tai kuitti -pelistä. Jokainen oikea vastaus tuplaa potin, ja kysymykset kovenevat loppua kohti. Kuittaa ajoissa – tai pane kaikki yhden vastauksen varaan. Aiheita SM-liigasta ja musiikista historiaan ja maantietoon.";

export default function TuplaHub({ aiheet, saannot, tausta }: { aiheet: RiviKortti[]; saannot: ReactNode; tausta: ReactNode }) {
  return (
    <div className="hub">
      <HubHero
        kuva={{
          src: "/20/tupla/studio.webp",
          srcSet: "/20/tupla/studio-800.webp 800w, /20/tupla/studio.webp 1672w",
          alt: "Mikko ja Laura Tupla tai kuitti -studiossa",
          width: 1672,
          height: 941,
        }}
        nimi="Tupla tai kuitti"
        korostus={KOROSTUS}
        intro={INTRO}
      />
      <HubRivit kortit={aiheet} nimi="Aiheet" />
      <HubOhjeet
        kohdat={[
          { otsikko: "Näin pelaat", sisalto: saannot },
          { otsikko: "Pelin tausta", sisalto: tausta },
        ]}
      />
    </div>
  );
}
