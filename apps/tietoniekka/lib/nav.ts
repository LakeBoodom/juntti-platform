// TIETONIEKKA 2.0 — NAVIGAATION KOKOONPANO (CD:n Navigaatiokonsepti, lukittu 17.8.2026).
// Yksi lähde valikoille, mobiilin Selaa-paneelille ja /2-0/kokoelmat-indeksille.
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
  { slug: "elokuvat", label: "Elokuvat", color: "#FF5C3D" },
  { slug: "musiikki", label: "Musiikki", color: "#A855F7" },
  { slug: "matkakohteet", label: "Maantieto", color: "#46D6C8" },
  { slug: "tunnetut-henkilot", label: "Tunnetut henkilöt", color: "#C9A96A" },
  { slug: "kulttuuri", label: "Kulttuuri", color: "#E8A320" },
  { slug: "historia", label: "Historia", color: "#E8A320" },
  { slug: "luonto", label: "Luonto", color: "#3FBF7F" },
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
  { href: "/2-0/megavisat", label: "Megavisat", desc: "Jopa 100 kysymystä — pitkä peli", color: "#E8A320" },
  { href: "/2-0/kokoelma/kuvavisat", label: "Kuvavisat", desc: "Tunnista kuvasta — liput, vaakunat, linnut", color: "#4C9AFF" },
];

export const hubHref = (slug: string) => `/2-0/kokoelma/${slug}`;
