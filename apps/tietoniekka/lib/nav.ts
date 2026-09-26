// TIETONIEKKA 2.0 — NAVIGAATION KOKOONPANO (CD:n Navigaatiokonsepti, lukittu 17.8.2026).
// Yksi lähde valikoille, mobiilin Selaa-paneelille ja /kokoelmat-indeksille.
// HUOM: Liput EI ole tässä listassa (Heikki 17.8.: lippuvisat ovat osa Kuvavisoja,
// joiden navigaatio kulkee Pelimuodot-valikon kautta). Visamäärät tulevat AINA
// kannasta (layout laskee quiz_cards-näkymästä) — ei kovakoodattuja lukuja.

export type NavCollection = {
  slug: string;   // quiz_cards.collection-arvo JA hub-URL:n segmentti
  label: string;  // näkyvä nimi (matkakohteet → "Maantieto", lukittu 15.8.2026)
  color: string;  // tunnusväri — valikossa vain 9px pisteenä ja hover-reunuksena
};

export const NAV_COLLECTIONS: NavCollection[] = [
  { slug: "tv", label: "TV & suoratoisto", color: "#FF3D9E" },
  { slug: "urheilu", label: "Urheilu", color: "#B6FF3C" },
  /* Jääkiekko ja Jalkapallo (Heikki 25.8.2026): omat teemakokoelmat, jotka
     nostetaan navigaatioon omina kohtinaan heti Urheilun perään, vaikka
     niiden visat ovat kannassa urheilu-kokoelmaa — /kokoelmat-sivu
     laskee näiden visamäärät teemasivujen visalistoista (ei collectionista). */
  { slug: "jaakiekko", label: "Jääkiekko", color: "#4FD1F5" },
  { slug: "jalkapallo", label: "Jalkapallo", color: "#35D6A0" },
  { slug: "elokuvat", label: "Elokuvat", color: "#FF5C3D" },
  { slug: "musiikki", label: "Musiikki", color: "#A855F7" },
  { slug: "matkakohteet", label: "Maantieto", color: "#46D6C8" },
  /* Suomen kaupungit (Heikki 28.8.2026): oma teemakokoelma matkapassi-
     konseptilla, vaikka visat ovat kannassa yleistieto-kokoelmaa — sama
     nosto-periaate kuin Jääkiekko/Jalkapallo. Visamäärä lasketaan
     lib/kaupungit.ts:n omasta 20 kaupungin slugilistasta (ks. kokoelmat/page.tsx). */
  { slug: "kaupungit", label: "Suomen kaupungit", color: "#E8A320" },
  { slug: "tunnetut-henkilot", label: "Tunnetut henkilöt", color: "#C9A96A" },
  { slug: "kulttuuri", label: "Kulttuuri", color: "#E8A320" },
  { slug: "historia", label: "Historia", color: "#E8A320" },
  { slug: "luonto", label: "Luonto", color: "#3FBF7F" },
  /* Tiede & teknologia (Heikki 20.9.2026): oma teemakokoelma, jonka visat ovat
     kannassa yleistieto-kokoelmaa category='tiede-teknologia' — sama
     nosto-periaate kuin Suomen kaupungeilla. Visamäärä lasketaan kategoriasta
     (ks. kokoelmat/page.tsx). */
  { slug: "tiede", label: "Tiede & teknologia", color: "#5BE1FF" },
];

export type NavMode = {
  href: string;
  label: string;
  desc: string;   // lyhyt kuvaus valikkoriville (copy-passi voi päivittää)
  color: string;
};

/* Klassista ei nosteta navigaatioon (CD:n sääntö: se on visojen oletusmuoto).
   Rakenne kestää uudet rivit sellaisenaan → Kumpi? ja Järjestä lisätään 2.5:ssä. */
export const NAV_MODES: NavMode[] = [
  { href: "/megavisat", label: "Megavisat", desc: "20–50 kysymystä — pitkä peli", color: "#E8A320" },
  { href: "/kokoelma/kuvavisat", label: "Kuvavisat", desc: "Tunnista kuvasta — liput, vaakunat, linnut", color: "#4C9AFF" },
];

export const hubHref = (slug: string) => `/kokoelma/${slug}`;

/* Pelikuoren reitit: niillä on oma header (tng-top), joten sivuston TopBar ja
   alatunniste jäävät pois. /h/<koodi> on haastelinkki, joka renderöi saman
   pelisivun — B1 (18.9.2026): se puuttui listalta, ja haasteen aloitus- ja
   tulosnäkymässä näkyi kaksi yläpalkkia päällekkäin. */
export const isGameRoute = (pathname: string) =>
  // Tupla tai kuitti -aihesivu on kokoelmasivu (sivuston navigaatio), sen pelit eivät
  pathname !== "/peli/tupla-tai-kuitti" &&
  (pathname.startsWith("/peli") || pathname.startsWith("/visa") || pathname.startsWith("/h/"));
