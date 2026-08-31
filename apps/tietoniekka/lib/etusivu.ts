// TIETONIEKKA 2.0 — ETUSIVUN KURATOITU SISÄLTÖ (design_handoff_etusivu_2026_prod,
// toteutettu 28.8.2026 — korvasi 18.8. version: hero-duo, viisi nostoa, aikajana
// ja putkinauha poistuivat). Kaikki etusivun kuratoidut listat yhdestä paikasta:
// ylätunnisteen nostot, kategoriarivi, lippuhero, Suositut kokoelmat, Laura &
// Mikko -kortit ja footer. Kausivaihdot ja copy-passi tehdään tästä tiedostosta.
//
// Kuvat: public/20/etusivu/*.webp (CD-paketin img/, muunnettu 28.8.2026; kortit
// 960 px, hero 1600 px, juontajat 300 px neliö). `pos` = designin
// background-position per kuva (README: "kuvien rajaukset — älä arvaa").

/** Ylätunnisteen tagline (design: "500+ visaa" = enemmän kuin 500, Heikki 28.8.:
    riittävä tarkkuus — ei lasketa kannasta). */
export const SITE_TAGLINE = "Suomalainen tietovisasivusto · 500+ visaa";

export type HeaderPromo = { key: "uusin" | "suosittu"; kicker: string; label: string; href: string };

/* Ylätunnisteen nostot: "Uusin kokoelma" näkyy ≥ 1100 px, "Suosittu nyt" ≥ 700 px. */
export const HEADER_PROMOS: HeaderPromo[] = [
  { key: "uusin", kicker: "Uusin kokoelma", label: "Suomen historia", href: "/kokoelma/historia" },
  { key: "suosittu", kicker: "Suosittu nyt", label: "Elokuvat", href: "/kokoelma/elokuvat" },
];

/* Kategoriarivi (7 chippiä designin lopullisen HTML:n mukaan — README:n 9:n lista
   hävisi HTML:lle, CD:n sääntö). */
export const CATEGORY_CHIPS = [
  { label: "Urheilu", href: "/kokoelma/urheilu" },
  { label: "Historia", href: "/kokoelma/historia" },
  { label: "Luonto", href: "/kokoelma/luonto" },
  { label: "Maantieto", href: "/kokoelma/matkakohteet" },
  { label: "Elokuvat", href: "/kokoelma/elokuvat" },
  { label: "Kuvavisat", href: "/kokoelma/kuvavisat" },
  { label: "Kaikki", href: "/kokoelmat" },
];

/* Lippuvisa-hero: CTA vie suoraan lippukortistoon (kuvavisas.type = liput). */
export const ETUSIVU_HERO = {
  title: "Tunnistatko tämän maan lipun?",
  lede: "Testaa, tiedätkö vastauksen.",
  cta: "Aloita visa →",
  href: "/peli?kuvavisa=liput",
  img: "/20/etusivu/hero-lippu-namibia.webp",
  pos: "55% 48%",
};

export type CollectionCard = { key: string; title: string; href: string; img: string; pos: string; desc?: string };

/* Suositut kokoelmat — 6 korttia (4:3), ei visamääriä (HTML voittaa README:n). */
export const POPULAR_COLLECTIONS: CollectionCard[] = [
  { key: "jaakiekko", title: "Jääkiekko", href: "/kokoelma/jaakiekko", img: "/20/etusivu/sp-latka.webp", pos: "center 28%" },
  { key: "historia", title: "Historia", href: "/kokoelma/historia", img: "/20/etusivu/sp-historia-2026.webp", pos: "center 40%" },
  { key: "luonto", title: "Luonto", href: "/kokoelma/luonto", img: "/20/etusivu/sp-kuikka.webp", pos: "center 46%" },
  { key: "maantieto", title: "Maantieto", href: "/kokoelma/matkakohteet", img: "/20/etusivu/coll-maantieto.webp", pos: "center 46%" },
  { key: "kaupungit", title: "Suomen kaupungit", href: "/kokoelma/kaupungit", img: "/20/etusivu/coll-kaupungit.webp", pos: "center 46%" },
  { key: "elokuvat", title: "Elokuvat", href: "/kokoelma/elokuvat", img: "/20/etusivu/coll-elokuvat.webp", pos: "center 44%" },
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
      { key: "tv", title: "TV & suoratoisto", desc: "Sarjat, tähdet ja suoratoistohitit", href: "/kokoelma/tv", img: "/20/etusivu/l-tv.webp", pos: "center 34%" },
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
      { key: "urheilu", title: "Urheilu", desc: "Lajit, legendat ja ennätykset", href: "/kokoelma/urheilu", img: "/20/etusivu/m-urheilu.webp", pos: "center 42%" },
    ],
  },
];

export const HOSTS_INTRO = {
  title: "Laura ja Mikko – Tietoniekan visajuontajat",
  lede: "Laura ja Mikko johdattavat Tietoniekan visoihin ja nostavat esiin omat suosikkiaiheensa.",
};

/* Footerin kokoelmalinkit — KAIKKI kokoelmat (Heikki 28.8.2026, designin
   "Suomi"-rivin tilalle täysi lista teemasivujen järjestyksessä). */
export const FOOTER_COLLECTIONS = [
  { label: "TV & suoratoisto", href: "/kokoelma/tv" },
  { label: "Urheilu", href: "/kokoelma/urheilu" },
  { label: "Jääkiekko", href: "/kokoelma/jaakiekko" },
  { label: "Jalkapallo", href: "/kokoelma/jalkapallo" },
  { label: "Elokuvat", href: "/kokoelma/elokuvat" },
  { label: "Musiikki", href: "/kokoelma/musiikki" },
  { label: "Maantieto", href: "/kokoelma/matkakohteet" },
  { label: "Suomen kaupungit", href: "/kokoelma/kaupungit" },
  { label: "Tunnetut henkilöt", href: "/kokoelma/tunnetut-henkilot" },
  { label: "Kulttuuri", href: "/kokoelma/kulttuuri" },
  { label: "Historia", href: "/kokoelma/historia" },
  { label: "Luonto", href: "/kokoelma/luonto" },
];

export const FOOTER_MODES = [
  { label: "Kuvavisat", href: "/kokoelma/kuvavisat" },
  { label: "Megavisat", href: "/megavisat" },
  { label: "Päivän visa", href: "/#paivan-visa" },
  { label: "Henkilövisat", href: "/kokoelma/tunnetut-henkilot" },
];

/* Tietoniekka-sarake: samat linkit kuin nykyisellä tietoniekka.fi:llä (Heikki
   28.8.2026 — Tietoa/Yhteystiedot/Käyttöehdot/Saavutettavuus/Evästeet lisätään
   vasta kun sivut ovat olemassa). */
export const FOOTER_SITE = [{ label: "Tietosuoja", href: "/tietosuoja" }];

export const FOOTER_INSTAGRAM = "https://www.instagram.com/tietoniekka/";
