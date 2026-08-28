// TIETONIEKKA 2.0 — ETUSIVUN KURATOITU SISÄLTÖ (design_handoff_etusivu_2026,
// toteutettu 18.8.2026). Nostojen järjestys, tekstit ja kuvat vaihtuvat kauden
// mukaan — README vaatii CMS-ohjatun listan; tämä config on sen ensimmäinen
// versio (copy-passi ja kausivaihdot tehdään tästä yhdestä paikasta, kunnes
// nostot siirretään kantaan/adminiin).
//
// Linkkihuomiot (Heikki 17.8.2026, päivitetty 25.8.2026):
// - Suomilätkä ja Futiskausi olivat placeholder-linkkejä urheiluhubiin kunnes
//   jääkiekko (22.8.) ja jalkapallo (25.8.) saivat omat teemakokoelmasivut —
//   molemmat osoittavat nyt niille.

export type Spotlight = {
  key: string;
  eyebrow: string; // pieni oranssi yläotsikko
  title: string; // iso Archivo-otsikko
  desc: string; // enintään yksi lyhyt kuvaus
  img: string;
  imgPos: string; // object-position (README:n asseteista)
  side: "left" | "right"; // kuvan puoli — vuorottelee riveittäin
  href: string;
  timeline?: boolean; // Suomen historia -noston aikajanaoverlay
};

export const ETUSIVU_HERO = {
  img: "/20/etusivu/hero-duo.webp",
  imgPos: "50% 32%",
  /* Proof pointit (design): yksi inline-rivi, ei pillereitä eikä nappeja */
  proofs: ["Testaa tietosi ja opi samalla", "Valtavasti pelattavaa", "Jatkuvasti uutta sisältöä"],
};

export const SPOTLIGHTS: Spotlight[] = [
  {
    key: "suomilatka",
    eyebrow: "Kotimainen superkausi ja tähtemme maailmalla",
    title: "Suomilätkä",
    desc: "Liigan legendat, leijonat ja ne maalit jotka muistat ulkoa.",
    img: "/20/etusivu/sp-latka.webp",
    imgPos: "50% 40%",
    side: "left",
    // 22.8.2026: Jääkiekko-teemasivu valmistui → placeholder-linkki hubiin vaihdettu
    href: "/2-0/kokoelma/jaakiekko",
  },
  {
    key: "tv",
    eyebrow: "Ahmi vaikka kaikki samana iltana",
    title: "TV & suoratoisto",
    desc: "Sarjat, jotka katsoit loppuun yhdessä illassa — ja ne joita et myönnä.",
    img: "/20/etusivu/sp-tv.webp",
    imgPos: "50% 34%",
    side: "right",
    href: "/2-0/kokoelma/tv",
  },
  {
    key: "futiskausi",
    eyebrow: "Lajitietosi puntarissa",
    title: "Futiskausi",
    desc: "Valioliiga, maajoukkueet ja Euroopan illat. Pelaa kaikki kerralla tai yksitellen.",
    img: "/20/etusivu/sp-futis.webp",
    imgPos: "50% 24%",
    side: "left",
    // 25.8.2026: Jalkapallo-teemasivu valmistui → placeholder-linkki hubiin vaihdettu
    href: "/2-0/kokoelma/jalkapallo",
  },
  {
    key: "luonto",
    eyebrow: "Yöttömästä yöstä kaamoksen pakkasiin",
    title: "Suomen luonto",
    desc: "Kuikan huuto, karhun jäljet ja järvet joiden nimet osaat.",
    img: "/20/etusivu/sp-kuikka.webp",
    imgPos: "50% 46%",
    side: "right",
    href: "/2-0/kokoelma/luonto",
  },
  {
    key: "historia",
    eyebrow: "Pelaa ja opi",
    title: "Suomen historia",
    desc: "Aikamatkusta halki Suomen kehityksen aina nykypäivään asti.",
    img: "/20/etusivu/sp-historia.webp",
    imgPos: "50% 52%",
    side: "left",
    href: "/2-0/kokoelma/historia",
    timeline: true,
  },
];

/* Historia-noston koristeellinen aikajana (README) — ei klikkikohteita,
   koko kortti on yksi linkki. */
export const HISTORIA_STOPS = [
  { label: "Esihistoria", year: "N. 9000 EAA." },
  { label: "Ruotsin aika", year: "1100-LUKU" },
  { label: "Autonomia", year: "1809" },
  { label: "Itsenäisyys", year: "1917" },
  { label: "Sodat", year: "1939" },
  { label: "Jälleenrakennus", year: "1945→" },
];

/* Footerin kokoelmalinkit (README + Heikin 17.8. nimistölinjaus:
   "Maailman ihmeet" → Maantieto; Suomilätkä placeholder-urheilulinkillä). */
export const FOOTER_COLLECTIONS = [
  { label: "Suomilätkä", href: "/2-0/kokoelma/jaakiekko" },
  { label: "Futiskausi", href: "/2-0/kokoelma/jalkapallo" },
  { label: "TV & suoratoisto", href: "/2-0/kokoelma/tv" },
  { label: "Suomen historia", href: "/2-0/kokoelma/historia" },
  { label: "Urheilu", href: "/2-0/kokoelma/urheilu" },
  { label: "Tunnetut henkilöt", href: "/2-0/kokoelma/tunnetut-henkilot" },
  { label: "Elokuvat", href: "/2-0/kokoelma/elokuvat" },
  { label: "Maantieto", href: "/2-0/kokoelma/matkakohteet" },
  { label: "Suomen luonto", href: "/2-0/kokoelma/luonto" },
  { label: "Suomen kaupungit", href: "/2-0/kokoelma/kaupungit" },
];

export const FOOTER_MODES = [
  { label: "Kuvavisat", href: "/2-0/kokoelma/kuvavisat" },
  { label: "Megavisat", href: "/2-0/megavisat" },
];
