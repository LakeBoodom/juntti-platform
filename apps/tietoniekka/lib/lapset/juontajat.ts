// LASTEN VISAT — juontajakuvat ja aiheiden ulkoasu (brief §4 "Juontajakuvat", design-päätökset "Aksentit").
//
// Kuvat: public/juontajat/*.webp (sama aineisto kuin ig_juontajakuvat-taulussa, 1122 × 1402, läpinäkyvä tausta).
// Mietteliäinä kysymykseen ja väärään vastaukseen, innoissaan oikeaan vastaukseen ja introon,
// onnittelevat tulokseen. Jouluasuiset versiot tulevat myöhemmin: lisää teema tähän (esim. joulu),
// niin aiheen visat käyttävät sitä automaattisesti.
import type { Juontaja } from "@/lib/lapset/valijuonnot";

export type Tunnelma = "miettii" | "innoissaan" | "onnittelee";

type Kuvasarja = { duo: Record<Tunnelma, string>; avatar: Record<Juontaja, string> };

const PERUS: Kuvasarja = {
  duo: {
    miettii: "/juontajat/molemmat-miettivat.webp",
    innoissaan: "/juontajat/molemmat-innostuneet.webp",
    onnittelee: "/juontajat/molemmat-onnittelevat.webp",
  },
  avatar: { laura: "/juontajat/laura-neutraali.webp", mikko: "/juontajat/mikko-innostunut.webp" },
};

/** Aihekohtaiset kuvasarjat (esim. joulu: tonttulakit). Puuttuva aihe → perussarja. */
const TEEMAT: Record<string, Kuvasarja> = {};

export const juontajaKuvat = (aihe: string | null): Kuvasarja => (aihe && TEEMAT[aihe]) || PERUS;

export const JUONTAJA_NIMI: Record<Juontaja, string> = { laura: "Laura", mikko: "Mikko" };
/** Ablatiivi napin tekstiin: "Kysy Lauralta" / "Kysy Mikolta". */
export const JUONTAJA_ABL: Record<Juontaja, string> = { laura: "Lauralta", mikko: "Mikolta" };

/** Aiheen merkki ja aksentti (design-päätökset: joulu #B8432F, luonto #2F6B45; ei uutta palettia).
    kuva = /lapset-sivun aihekortti, nosto = ajankohtaisen noston otsikko ja kuvaus (design v0.2 3a–3d).
    Emojit /lapset-designin mukaan (Eläimet 🦔). */
export type LastenAihe = {
  nimi: string; emoji: string; aksentti: string; kuva: string | null; kuvaKohdistus?: string;
  nosto: { otsikko: string; kuvaus: string; kuva: string | null };
};
export const LASTEN_AIHEET: Record<string, LastenAihe> = {
  joulu: {
    nimi: "Joulu", emoji: "🎄", aksentti: "#B8432F", kuva: "/20/lapset/hero-v2.webp", kuvaKohdistus: "62% 50%",
    nosto: { otsikko: "Lasten jouluvisat", kuvaus: "Pukki, tontut ja joulun perinteet – pienille ja isommille.", kuva: "/20/lapset/hero-v4.webp" },
  },
  elaimet: {
    nimi: "Eläimet", emoji: "🦔", aksentti: "#2F6B45", kuva: "/20/lapset/hero-v6.webp", kuvaKohdistus: "72% 60%",
    nosto: { otsikko: "Lasten eläinvisat", kuvaus: "Metsän ja talven eläimet – pienille ja isommille.", kuva: "/20/lapset/hero-v6.webp" },
  },
  linnut: {
    nimi: "Linnut", emoji: "🐦", aksentti: "#2F6B45", kuva: "/20/lapset/hero-v8.webp", kuvaKohdistus: "84% 50%",
    nosto: { otsikko: "Lasten lintuvisat", kuvaus: "Suomen linnut kuvina ja ääninä – pienille ja isommille.", kuva: "/20/lapset/hero-v8.webp" },
  },
  kirjat: {
    nimi: "Kirjat", emoji: "📚", aksentti: "#2F6B45", kuva: null,
    nosto: { otsikko: "Lasten kirjavisat", kuvaus: "Kirjat, sadut ja kirjasto.", kuva: null },
  },
};
/** /lapset-sivun aiheiden järjestys (design: Joulu, Eläimet, Linnut, Kirjat). */
export const AIHEJARJESTYS = ["joulu", "elaimet", "linnut", "kirjat"];

export const IKA_MERKKI: Record<"4-7" | "8-12", string> = { "4-7": "🧸 Pienet 4–7", "8-12": "🚀 Isommat 8–12" };
/** Lyhyt ikämerkki korttien kulmaan ja listoihin (design: "🧸 4–7" / "🚀 8–12"). */
export const IKA_LYHYT: Record<"4-7" | "8-12", string> = { "4-7": "🧸 4–7", "8-12": "🚀 8–12" };
export const IKA_VALINTA: Record<"4-7" | "8-12", { emoji: string; nimi: string; tapa: string }> = {
  "4-7": { emoji: "🧸", nimi: "Pienet 4–7", tapa: "Pelataan yhdessä" },
  "8-12": { emoji: "🚀", nimi: "Isommat 8–12", tapa: "Pelaan itse" },
};
