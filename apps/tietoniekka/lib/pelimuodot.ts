// PELIMUOTOREKISTERI (S4, runko §3 V6 — 19.10.2026). Yksi lista: jokainen pelimuoto ilmoittaa,
// mitä kokoelmia se palvelee (serves). Kokoelmasivun "Pelit tässä kokoelmassa" (V6) ja pelien
// tulosnäkymän "Seuraava peli" (K4) hakevat pelit täältä — kokoelman asetuksessa ei ole pelilistaa.
// Uusi pelimuoto tai Tupla tai kuitin aihe ilmestyy oikeille sivuille itsestään.
import { TEEMAT, TUPLA_SIVU } from "./tuplaTaiKuitti";

export type PeliIkoni = "kuva" | "aani" | "ika" | "jarjestys" | "kartta" | "tupla" | "kumpi" | "ketju";

export type Pelimuoto = {
  slug: string;
  /** Pelin oma nimi otsikkona ("Tupla tai kuitti: SM-liiga"). */
  nimi: string;
  ikoni: PeliIkoni;
  /** Yksi rivi. */
  kuvaus: string;
  href: string;
  tila: "pelattava" | "tulossa";
  /** Kokoelmat (kokoelmasivun slug), joita peli palvelee. */
  serves: string[];
};

/** Tupla tai kuitin aihe → kokoelma. Kausipainokset (Halloween, joulu) palvelevat Juhlia. */
const TUPLA_KOKOELMA: Record<string, string> = {
  "sm-liiga": "jaakiekko",
  "suomen-kaupungit": "kaupungit",
  luonto: "luonto",
  musiikki: "musiikki",
  kulttuuri: "kulttuuri",
  "tv-ja-suoratoisto": "tv",
  historia: "historia",
  maantieto: "matkakohteet",
};

export const PELIMUODOT: Pelimuoto[] = [
  ...TEEMAT.map((t) => ({
    slug: `tupla-${t.slug}`,
    nimi: `Tupla tai kuitti: ${t.nimi}`,
    ikoni: "tupla" as const,
    kuvaus: "Tuplaa potti tai kuittaa ajoissa.",
    href: `${TUPLA_SIVU}/${t.slug}`,
    tila: "pelattava" as const,
    serves: [TUPLA_KOKOELMA[t.slug] ?? (t.painos ? "juhlat" : "")].filter(Boolean),
  })),
  { slug: "kuntaliitos", nimi: "Kuntaliitos", ikoni: "ketju", kuvaus: "Rakenna reitti naapurikuntien kautta.", href: "/peli/kuntaliitos", tila: "pelattava", serves: ["kaupungit", "matkakohteet"] },
  { slug: "rajanaapurit", nimi: "Rajanaapurit", ikoni: "ketju", kuvaus: "Ketjuta maat yhteisen rajan kautta.", href: "/peli/rajanaapurit", tila: "pelattava", serves: ["matkakohteet"] },
  { slug: "vaalipiiriketju", nimi: "Vaalipiiriketju", ikoni: "ketju", kuvaus: "Kulje vaalipiiristä toiseen kansanedustajien kautta.", href: "/peli/vaalipiiriketju", tila: "pelattava", serves: ["vaalit"] },
  { slug: "ikajarjestys", nimi: "Ikäjärjestys", ikoni: "ika", kuvaus: "Järjestä tunnetut henkilöt iän mukaan.", href: "/peli/ikajarjestys", tila: "pelattava", serves: ["tunnetut-henkilot"] },
  { slug: "kuvavisat", nimi: "Kuvavisat", ikoni: "kuva", kuvaus: "Tunnista liput, vaakunat, eläimet ja maalaukset kuvasta.", href: "/kokoelma/kuvavisat", tila: "pelattava", serves: ["luonto", "matkakohteet"] },
  { slug: "aanivisat", nimi: "Äänivisa: Suomen linnut", ikoni: "aani", kuvaus: "Tunnista lintu laulusta.", href: "/aanivisa/suomen-linnut", tila: "pelattava", serves: ["luonto"] },
  { slug: "megavisat", nimi: "Megavisat", ikoni: "jarjestys", kuvaus: "20–50 kysymystä yhdellä kertaa.", href: "/megavisat", tila: "pelattava", serves: [] },
];

/** Kokoelman pelit: pelattavat ensin, sitten tulossa olevat. */
export const kokoelmanPelimuodot = (kokoelma: string) =>
  PELIMUODOT.filter((p) => p.serves.includes(kokoelma)).sort((a, b) => Number(a.tila === "tulossa") - Number(b.tila === "tulossa"));
