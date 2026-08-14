// MEGAVISAT-LANDING — aiheet ja juontajanostot (CD:n design 13.8.2026,
// design_handoff_megavisat/README.md; Heikki lukitsi 14.8.2026:
// aihekortit näkyvät heti oikealla saatavuudella, Aloita vain kun mega on
// koottu adminissa — muut kortit himmennettyinä designin säännön mukaan).
// Kun Heikki koostaa uuden megan adminissa, se herää tässä eloon lisäämällä
// slug oikean aiheen megaSlugs-kenttään (tai uusi aihe listaan).

export type MegaLength = 20 | 50 | 100;
export const MEGA_LENGTHS: MegaLength[] = [20, 50, 100];

export type MegaTopic = {
  key: string;
  title: string;
  tag: string;
  /** Aiheväri vain tunnistepisteessä (CD:n tokenlista). */
  tagColor: string;
  desc: string;
  /** Koottujen megojen slugit pituuksittain — puuttuva pituus = ei saatavilla. */
  megaSlugs: Partial<Record<MegaLength, string>>;
};

export const MEGA_TOPICS: MegaTopic[] = [
  {
    key: "viihde", title: "Viihteen mega", tag: "Viihde", tagColor: "#E8A320",
    desc: "TV, elokuvat, musiikki ja julkkikset samassa istunnossa.",
    megaSlugs: { 50: "viihdemaailman-megavisa" },
  },
  {
    key: "tv", title: "TV ja suoratoisto", tag: "TV & suoratoisto", tagColor: "#FF5CA8",
    desc: "Suosituimmat sarjat Suomesta ja maailmalta.",
    megaSlugs: { 50: "tv-ja-suoratoisto-mega" },
  },
  {
    key: "suomi", title: "Suomi-mega", tag: "Suomi", tagColor: "#E8A320",
    desc: "Historia, kulttuuri ja luonto — kuinka hyvin tunnet Suomen?",
    megaSlugs: { 50: "kaikki-suomesta-mega" },
  },
  {
    key: "yleistieto", title: "Yleistiedon mega", tag: "Kaikki kokoelmat", tagColor: "#F5F0E6",
    desc: "Sekoitus jokaisesta kokoelmasta — vaikein läpäistä.",
    megaSlugs: { 50: "suuri-mega-50" },
  },
  {
    key: "urheilu", title: "Urheilun mega", tag: "Urheilu", tagColor: "#B6FF3C",
    desc: "Kaikki lajit Lahden laduilta Tokion kaukaloihin.",
    megaSlugs: {},
  },
  {
    key: "valioliiga", title: "Valioliigan mega", tag: "Urheilu · Jalkapallo", tagColor: "#B6FF3C",
    desc: "Maalikuninkaat, siirrot ja mestaruudet 1992→.",
    megaSlugs: {},
  },
  {
    key: "musiikki", title: "Musiikin mega", tag: "Musiikki", tagColor: "#C79BFB",
    desc: "Iskelmästä metalliin, vinyyleistä Spotifyyn.",
    megaSlugs: {},
  },
  {
    key: "elokuvat", title: "Elokuvien mega", tag: "Elokuvat", tagColor: "#FF8A5C",
    desc: "Ohjaajat, repliikit ja Oscar-gaalat.",
    megaSlugs: {},
  },
  {
    key: "historia", title: "Historian mega", tag: "Historia", tagColor: "#E8A320",
    desc: "Suomen ja maailman käänteet aikajärjestyksessä.",
    megaSlugs: {},
  },
  {
    key: "kulttuuri", title: "Kulttuurin mega", tag: "Kulttuuri", tagColor: "#7FA8FF",
    desc: "Kirjallisuus, taide, design ja kansanperinne.",
    megaSlugs: {},
  },
  {
    key: "maantieto", title: "Maantiedon mega", tag: "Matkakohteet", tagColor: "#4FD1C5",
    desc: "Pääkaupungit, liput ja maailman ääripäät.",
    megaSlugs: {},
  },
  {
    key: "luonto", title: "Luonnon mega", tag: "Luonto", tagColor: "#8FD14F",
    desc: "Eläimet, kasvit ja planeetan äärimmäisyydet.",
    megaSlugs: {},
  },
  {
    key: "tunnetut", title: "Tunnettujen mega", tag: "Tunnetut henkilöt", tagColor: "#E8A320",
    desc: "Kasvot, nimet ja saavutukset vuosisadan ajalta.",
    megaSlugs: {},
  },
];

/** Juontajanostot (3 kpl) — vain oikeisiin, koottuihin megoihin. Lauran
    sitaatti CD:ltä; Mikon ja duon sitaatit sovitettu oikeaan sisältöön
    (CD:n Valioliiga- ja 100-nostoja ei voi käyttää ennen kuin megat ovat
    olemassa). Heikin vaihdettavissa. */
export const MEGA_NOSTOT: Array<{
  img: string; attribution: string; megaSlug: string; length: MegaLength; quote: string;
}> = [
  {
    img: "/20/megavisat/host-laura.webp", attribution: "Lauran valinta",
    megaSlug: "viihdemaailman-megavisa", length: 50,
    quote: "”Kaikki ne tunnit Netflixin sarjoja ahmiessa eivät ole menneet hukkaan.”",
  },
  {
    img: "/20/megavisat/host-mikko.webp", attribution: "Mikon valinta",
    megaSlug: "kaikki-suomesta-mega", length: 50,
    quote: "”Suomi-tietous on kansalaistaito. Katsotaan kuinka hyvin sinulla on hallussa.”",
  },
  {
    img: "/20/megavisat/hosts-duo.webp", attribution: "Lauran ja Mikon yhteissuositus",
    megaSlug: "tv-ja-suoratoisto-mega", length: 50,
    quote: "”Sohvaperunoiden todellinen loppukoe.”",
  },
];

export const MEGA_POSTER = "/20/megavisat/mega-hero.webp";
export const MEGA_HERO_CTA_SLUG = "suuri-mega-50";
