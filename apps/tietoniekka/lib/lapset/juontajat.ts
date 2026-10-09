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

/** Aiheen merkki ja aksentti (design-päätökset: joulu #B8432F, luonto #2F6B45; ei uutta palettia). */
export const LASTEN_AIHEET: Record<string, { nimi: string; emoji: string; aksentti: string }> = {
  joulu: { nimi: "Joulu", emoji: "🎄", aksentti: "#B8432F" },
  elaimet: { nimi: "Eläimet", emoji: "🦊", aksentti: "#2F6B45" },
  linnut: { nimi: "Linnut", emoji: "🐦", aksentti: "#2F6B45" },
  kirjat: { nimi: "Kirjat", emoji: "📚", aksentti: "#2F6B45" },
};

export const IKA_MERKKI: Record<"4-7" | "8-12", string> = { "4-7": "🧸 Pienet 4–7", "8-12": "🚀 Isommat 8–12" };
