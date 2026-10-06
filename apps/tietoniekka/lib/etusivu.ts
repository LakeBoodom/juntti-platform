// TIETONIEKKA 2.0 — ETUSIVUN KURATOITU SISÄLTÖ (design_handoff_etusivu_2026_prod,
// toteutettu 28.8.2026 — korvasi 18.8. version: hero-duo, viisi nostoa, aikajana
// ja putkinauha poistuivat). Kaikki etusivun kuratoidut listat yhdestä paikasta:
// ylätunnisteen nostot, kategoriarivi, lippuhero, Suositut kokoelmat, Laura &
// Mikko -kortit ja footer. Kausivaihdot ja copy-passi tehdään tästä tiedostosta.
//
// Kuvat: public/20/etusivu/*.webp (CD-paketin img/, muunnettu 28.8.2026; kortit
// 960 px, hero 1600 px, juontajat 300 px neliö). `pos` = designin
// background-position per kuva (README: "kuvien rajaukset — älä arvaa").

import { NAV_COLLECTIONS, NAV_MODES } from "./nav";

/** Ylätunnisteen tagline (design: "500+ visaa" = enemmän kuin 500, Heikki 28.8.:
    riittävä tarkkuus — ei lasketa kannasta). */
export const SITE_TAGLINE = "Suomalainen tietovisasivusto · 500+ visaa";

export type HeaderPromo = { key: "uusin" | "suosittu"; kicker: string; label: string; href: string };

/* Ylätunnisteen nostot: "Uusin kokoelma" näkyy ≥ 1560 px, "Suosittu nyt" ≥ 700 px
   (mitattu raja, ks. topbar.css). */
export const HEADER_PROMOS: HeaderPromo[] = [
  { key: "uusin", kicker: "Uusin kokoelma", label: "Vaalit ja politiikka", href: "/kokoelma/vaalit" },
  { key: "suosittu", kicker: "Suosittu nyt", label: "Suomen kaupungit", href: "/kokoelma/kaupungit" },
];

/* Kategoriarivi (designin lopullisen HTML:n mukaan — README:n 9:n lista hävisi
   HTML:lle, CD:n sääntö). Tiede lisätty 20.9.2026 uuden kokoelman myötä;
   rivi vierii vaakasuunnassa, joten pituus ei ole rajoite. */
export const CATEGORY_CHIPS = [
  { label: "Urheilu", href: "/kokoelma/urheilu" },
  { label: "Historia", href: "/kokoelma/historia" },
  { label: "Luonto", href: "/kokoelma/luonto" },
  { label: "Maantieto", href: "/kokoelma/matkakohteet" },
  { label: "Tiede", href: "/kokoelma/tiede" },
  { label: "Elokuvat", href: "/kokoelma/elokuvat" },
  { label: "Kuvavisat", href: "/kokoelma/kuvavisat" },
  { label: "Kaikki", href: "/kokoelmat" },
];

/* Lippuvisa-hero (ETUSIVU_HERO) poistettu 18.9.2026: etusivun yläosan korvasi
   Kuvavisat-banneri (components/tn20/EtusivunBannerit.tsx, Design kierros 12A). */

export type CollectionCard = { key: string; title: string; href: string; img: string; pos: string; desc?: string };

/* Suositut kokoelmat — 6 korttia (4:3), ei visamääriä (HTML voittaa README:n).
   desc = lyhyt intro otsikon alla (Heikki 6.10.2026): "X, Y ja Z" -rakenne, ei lauseita eikä huutomerkkejä. */
export const POPULAR_COLLECTIONS: CollectionCard[] = [
  /* 6.10.2026 (Heikki): AI-kuvien tilalle oikeat valokuvat kokoelmien omista visoista; Vaalit ja politiikka
     Elokuvien tilalle. Jääkiekko = Leijonien MM-kulta 2026 -visan kuva, Luonto = Suomen marjat,
     Suomen kaupungit = Helsinki (Senaatintori, sama kuva kuin kaupungit-kokoelmassa, isompana),
     Maantieto = Bengtskärin majakka (Suomen majakat -visan kuva, oikea valokuva AI-kuvan tilalle),
     Historia = Turun linna (Commons, CC BY-SA 4.0). */
  { key: "jaakiekko", title: "Jääkiekko", href: "/kokoelma/jaakiekko", img: "/20/jaakiekko/jk-leijonat-mm2026-kuva.webp", pos: "center 40%", desc: "SM-liiga, Leijonat ja NHL" },
  { key: "historia", title: "Historia", href: "/kokoelma/historia", img: "/20/etusivu/sp-turun-linna.webp", pos: "center 45%", desc: "Linnat, sodat ja presidentit" },
  { key: "luonto", title: "Luonto", href: "/kokoelma/luonto", img: "/20/luonto/suomen-marjat-visa.webp", pos: "center 50%", desc: "Linnut, eläimet ja ilmiöt" },
  { key: "maantieto", title: "Maantieto", href: "/kokoelma/matkakohteet", img: "/20/maantieto/suomen-majakat.webp", pos: "56% 50%", desc: "Majakat, saaret ja maailman ääret" },
  { key: "kaupungit", title: "Suomen kaupungit", href: "/kokoelma/kaupungit", img: "/20/etusivu/sp-helsinki.webp", pos: "center 55%", desc: "Helsingistä Rovaniemelle" },
  { key: "vaalit", title: "Vaalit ja politiikka", href: "/kokoelma/vaalit", img: "/20/vaalit/hero.webp", pos: "center 45%", desc: "Vaalit, puolueet ja pääministerit" },
];

export type Host = {
  key: "laura" | "mikko";
  name: string;
  heading: string;
  role: string;
  img: string;
  accent: "gold" | "lime";
  cards: CollectionCard[];
};

/* Laura ja Mikko — juontajaprofiilit + 2 kokoelmakorttia kummallekin. */
export const HOSTS: Host[] = [
  {
    key: "laura",
    name: "Laura",
    heading: "Laura suosittelee",
    role: "Tietoniekan visaemäntä",
    img: "/20/etusivu/host-laura.webp",
    accent: "gold",
    cards: [
      { key: "tv", title: "TV & suoratoisto", desc: "Sarjat, tähdet ja suoratoistohitit", href: "/kokoelma/tv", img: "/20/etusivu/l-tv-masked-singer.webp", pos: "center 35%" },
      { key: "jalkapallo", title: "Jalkapallo", desc: "Seurat, pelaajat ja arvokisat", href: "/kokoelma/jalkapallo", img: "/20/etusivu/l-jalkapallo.webp", pos: "center 38%" },
    ],
  },
  {
    key: "mikko",
    name: "Mikko",
    heading: "Mikko suosittelee",
    role: "Tietoniekan visaisäntä",
    img: "/20/etusivu/host-mikko.webp",
    accent: "lime",
    cards: [
      { key: "megavisat", title: "Megavisat", desc: "Pitkät visat todellisille tietoniekoille", href: "/megavisat", img: "/20/etusivu/coll-megavisat.webp", pos: "center 50%" },
      { key: "urheilu", title: "Urheilu", desc: "Lajit, legendat ja ennätykset", href: "/kokoelma/urheilu", img: "/20/urheilulajit/f1-kaikki.webp", pos: "center 50%" },
    ],
  },
];

export const HOSTS_INTRO = {
  title: "Laura ja Mikko – Tietoniekan visajuontajat",
  lede: "Laura ja Mikko johdattavat Tietoniekan visoihin ja nostavat esiin omat suosikkiaiheensa.",
};

/* Footerin kokoelma- ja pelimuotolinkit johdetaan navigaation rekisteristä (lib/nav.ts), jotta
   uudet kokoelmat ja pelimuodot tulevat alatunnisteeseen automaattisesti (Heikki 6.10.2026:
   Vaalit, Tiede, Juhlat ja reittipelit puuttuivat käsin ylläpidetystä listasta). */
export const FOOTER_COLLECTIONS = NAV_COLLECTIONS.map((c) => ({ label: c.label, href: `/kokoelma/${c.slug}` }));

/* Pelimuodot = navigaation pelimuodot + etusivun omat nostot (Päivän visa, Henkilövisat). */
export const FOOTER_MODES = [
  ...NAV_MODES.map((m) => ({ label: m.label, href: m.href })),
  { label: "Päivän visa", href: "/#paivan-visa" },
  { label: "Henkilövisat", href: "/kokoelma/tunnetut-henkilot" },
];

/* Tietoniekka-sarake: samat linkit kuin nykyisellä tietoniekka.fi:llä (Heikki
   28.8.2026 — Tietoa/Yhteystiedot/Käyttöehdot/Saavutettavuus/Evästeet lisätään
   vasta kun sivut ovat olemassa). */
export const FOOTER_SITE = [
  { label: "Tietosuoja", href: "/tietosuoja" },
  { label: "Kuvien lähteet", href: "/kuvien-lahteet" },
];

export const FOOTER_INSTAGRAM = "https://www.instagram.com/tietoniekka/";
