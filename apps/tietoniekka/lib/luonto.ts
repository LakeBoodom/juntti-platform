// LUONTO — flagship-teemakokoelma (Heikki 7.8.2026)
// Sama malli kuin Kulttuuri (lib/kulttuuri.ts): jokaisella luontovisalla on
// oma AI-kuva (public/20/luonto/<slug>.webp). Kuvaa käytetään landingin
// korteissa JA pelinäkymässä — sama tietoinen poikkeus SVG-korttisääntöön.
// Uusi visa ilman kuvaa toimii silti: luontoImg palauttaa null → pelikuori
// käyttää kokoelman herokuvaa.

export const LUONTO_HERO = "/20/luonto/hero-landing.webp";

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "itameri-visa",
  "jarvien-katketyt-ihmeet-visa",
  "jokien-salainen-elama-visa",
  "karhu-suomen-metsien-kuningas",
  "kuikka-visa",
  "merikotka-visa",
  "naali-tunturien-salaperainen-kettu",
  "revontulet-tiedatko-mista-ne-tulevat",
  "saimaan-norppa",
  "suomen-elaimet-visa",
  "suomen-hyonteiset-pienen-vaen-suuret-temput",
  "suomen-kalat-visa",
  "suomen-kansallispuistot-visa",
  "suomen-kasvit-myrkkyja-taikaa-ja-pelastavia-jauhoja",
  "suomen-linnut-visa",
  "suomen-marjat-visa",
  "suomen-matelijat-ja-sammakot-selviytyjien-salaisuudet",
  "suomen-metsat-visa",
  "suomen-pollot-yon-aanettomat-mestarit",
  "suomen-sienet-visa",
  "suomen-suot-visa",
  "suomen-suurpedot-visa-tunnetko-huippupedot",
  "tiedatko-metsosta-kaiken",
  "tunturin-salainen-elama-lappi-visa",
]);

export function luontoImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/luonto/${slug}.webp` : null;
}

/** Aiheet (quizzes.subcollection). Luonto v3.0 (8.10.2026): aihesuodatin piilotetaan, jos aiheessa on
 *  alle LUONTO_AIHE_MIN visaa (Ilmiöt = vain Revontulet); visa näkyy silti Kaikki-listassa.
 *  `sana` = tilastorivin luettelo ("eläimet, kasvit, maastot ja ilmiöt"). Uusi aihe (esim. "Maailman
 *  luonto") lisätään tähän riviksi — layout ei muutu. */
export const LUONTO_SUBS: Array<{ key: string; label: string; sana: string }> = [
  { key: "elaimet", label: "Eläimet", sana: "eläimet" },
  { key: "kasvit-sienet", label: "Kasvit & sienet", sana: "kasvit" },
  { key: "maastot-vedet", label: "Maastot & vedet", sana: "maastot" },
  { key: "ilmiot", label: "Ilmiöt", sana: "ilmiöt" },
];
export const LUONTO_AIHE_MIN = 3;

/** Luonnon kuvavisat (Luonto v3.0 §1.2). Kortit vievät samoihin osoitteisiin kuin Kuvavisat-kokoelma;
 *  Suomen eläimet on rajattu (?alue=suomi, lib/kuvavisat2026.ts ALUEET). Uusi kuvavisa = uusi rivi. */
export type LuontoKuvavisa = { key: string; type: string; tag?: string; otsikko: string; kuvaus: string; href: string };
export const LUONTO_KUVAVISAT: LuontoKuvavisa[] = [
  { key: "linnut", type: "linnut", otsikko: "Suomen linnut", kuvaus: "Siivet, nokat ja höyhenpuvut lähikuvassa.", href: "/kuvavisa/linnut" },
  { key: "elaimet-suomi", type: "elaimet", tag: "suomen_luonto", otsikko: "Suomen eläimet", kuvaus: "Pedot, sorkkaeläimet, kalat ja matelijat kuvasta tunnistettavina.", href: "/kuvavisa/elaimet?alue=suomi" },
  { key: "kasvit", type: "kasvit", otsikko: "Suomen kasvit ja puut", kuvaus: "Lehti, kukka ja kaarna tunnistettavina.", href: "/kuvavisa/kasvit" },
];
/** "Valitse pelimuoto" -osion Kuvavisa-kortti. */
export const LUONTO_NOSTO_KUVAVISA = "linnut";

/** Kuratointi (Heikin vaihdettavissa): CTA-kohde, Lauran ja Mikon valinta,
    "Aloita näistä" -nostot. */
/** Luonto v3.0: "Valitse pelimuoto" -osion Tietovisa-kortti = lauranJaMikon. cta ja features ovat
 *  v2:n ("Aloita näistä") jäänteitä, joita sivu ei enää käytä. */
export const LUONTO_CURATED = {
  cta: "suomen-suurpedot-visa-tunnetko-huippupedot",
  lauranJaMikon: "suomen-kansallispuistot-visa",
  features: [
    "suomen-suurpedot-visa-tunnetko-huippupedot",
    "revontulet-tiedatko-mista-ne-tulevat",
    "saimaan-norppa",
  ],
};
