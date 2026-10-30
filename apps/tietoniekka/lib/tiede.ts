// TIEDE JA TEKNOLOGIA — kuvat ja etusivun banneri (CD "Tietoniekka – Tiede ja teknologia -teemasivu",
// 20.9.2026). Kokoelmasivu on rungolla 19.10.2026 alkaen (lib/kokoelmat/tiede.ts); aihepiirit tulevat
// section_tags-tagista (= subcollection).
//
// Visat ovat kannassa collection='yleistieto', category='tiede-teknologia'
// (20 kpl). Kokoelma tunnistetaan kategoriasta, ks. lib/visanKokoelma.ts.
// Kuvat: public/20/tiede/<slug>.webp (640×360, designin kuvat 20.9.2026).

export const TIEDE_ACCENT = "#5BE1FF";
export const TIEDE_KATEGORIA = "tiede-teknologia";

export const tiedeImg = (slug: string) => `/20/tiede/${slug}.webp`;

/** Visat, joilla on oma kuva (public/20/tiede/<slug>.webp). */
const TIEDE_KUVAT = new Set([
  "arjen-fysiikka-salamoista-sireeneihin",
  "arkijarki-vastaan-matematiikka",
  "elainten-supervoimat-aistit-ja-ennatykset",
  "elava-planeetta-liikkuu-jalkojesi-alla",
  "evoluutio-ja-biodiversiteetti-visa",
  "kadonneen-ajan-jattilaiset",
  "kasvit-ja-sienet-ansoja-kauppoja-jattilaisia",
  "kehosi-katketyt-kummallisuudet",
  "kemia-ja-alkuaineet-visa",
  "laaketieteen-lapimurrot-visa",
  "matka-planeetoilta-kuun-kraattereihin",
  "meret-ja-merentutkimus-visa",
  "mikroskooppinen-maailma-nakymaton-elama",
  "mista-olet-tehty-oikeasti-genetiikka",
  "neroja-omenoita-ja-yllattavia-kaanteita",
  "nerokkaita-oivalluksia-ja-onnekkaita-sattumia",
  "paan-sisalla-tapahtuu-enemman-kuin-huomaat",
  "saa-ja-ilmakeha-taivaan-pikkuprintti",
  "teknologian-ensimmaiset-hetket-visa",
  "tiedemyyttien-tarkastus-visa",
]);
/** Kokoelmasivun (runko) korttikuva — kevennetty kopio (public/20/tiede/k/, 19.10.2026); null, jos visalla
    ei ole omaa kuvaa. */
export const tiedeKorttikuva = (slug: string) => (TIEDE_KUVAT.has(slug) ? `/20/tiede/k/${slug}.webp` : null);

export const TIEDE_HERO = {
  img: "/20/tiede/hero.webp",
  /** Kollaasin painopiste (design: object-position 22% center) */
  pos: "22% center",
  kicker: "Teemakokoelma",
  titleLines: ["Tiede ja", "teknologia"] as const,
  lead: "Maailma on kummallisempi kuin luulet.",
  intro:
    "Kehosta avaruuteen, mikrobeista matematiikkaan ja sattumalta syntyneistä keksinnöistä tieteen suuriin läpimurtoihin.",
  cta: "Aloita tutkimusmatka",
  /** Toinen luku täydennetään kysymysmäärästä kannassa. */
  meta: ["20 tietovisaa", "satoja kysymyksiä"] as const,
};

/** Etusivun mainosbanneri (design: "Etusivun mainosbanneri"). */
export const TIEDE_BANNERI = {
  kicker: "Uusi kokoelma",
  title: "Tiede ja teknologia",
  text: "Maailma on kummallisempi kuin luulet. 20 uutta visaa kehosta avaruuteen.",
  cta: "Aloita tutkimusmatka",
  meta: "20 visaa",
  href: "/kokoelma/tiede",
};
