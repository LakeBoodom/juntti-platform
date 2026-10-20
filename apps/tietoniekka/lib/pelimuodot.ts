// PELIMUOTOREKISTERI (S4, runko §3 V6 — 19.10.2026). Yksi lista: jokainen pelimuoto ilmoittaa,
// mitä kokoelmia se palvelee (serves). Kokoelmasivun "Pelit tässä kokoelmassa" (V6) ja pelien
// tulosnäkymän "Seuraava peli" (K4) hakevat pelit täältä — kokoelman asetuksessa ei ole pelilistaa.
// Uusi pelimuoto tai Tupla tai kuitin aihe ilmestyy oikeille sivuille itsestään.
import { TEEMAT, TUPLA_SIVU } from "./tuplaTaiKuitti";
import { JULKAISTUT, pakkaHref } from "./jarjesta/pakat";

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
  /* Viikon kuvavisa (15 kuvaa, vaihtuu maanantaisin) — entinen "Tämän viikon visa" -kaista Kuvavisat-sivulla. */
  { slug: "kuvavisa-viikko", nimi: "Viikon kuvavisa", ikoni: "kuva", kuvaus: "15 kuvaa, uusi visa joka maanantai.", href: "/kuvavisa/viikko", tila: "pelattava", serves: ["kuvavisat"] },
  { slug: "kuvavisat", nimi: "Kuvavisat", ikoni: "kuva", kuvaus: "Tunnista liput, vaakunat, eläimet ja maalaukset kuvasta.", href: "/kokoelma/kuvavisat", tila: "pelattava", serves: ["matkakohteet"] },
  { slug: "aanivisat", nimi: "Äänivisa: Suomen linnut", ikoni: "aani", kuvaus: "Tunnista lintu laulusta.", href: "/aanivisa/suomen-linnut", tila: "pelattava", serves: ["luonto"] },
  /* Luonnon kuvavisat omina peleinään (runko vaihe 3, 20.10.2026: Luonto-sivun "Valitse pelimuoto" -kortit → V6). */
  { slug: "kuvavisa-linnut", nimi: "Kuvavisa: Suomen linnut", ikoni: "kuva", kuvaus: "Siivet, nokat ja höyhenpuvut lähikuvassa.", href: "/kuvavisa/linnut", tila: "pelattava", serves: ["luonto"] },
  { slug: "kuvavisa-elaimet", nimi: "Kuvavisa: Suomen eläimet", ikoni: "kuva", kuvaus: "Pedot, sorkkaeläimet, kalat ja matelijat kuvasta.", href: "/kuvavisa/elaimet?alue=suomi", tila: "pelattava", serves: ["luonto"] },
  { slug: "kuvavisa-kasvit", nimi: "Kuvavisa: Suomen kasvit ja puut", ikoni: "kuva", kuvaus: "Lehti, kukka ja kaarna tunnistettavina.", href: "/kuvavisa/kasvit", tila: "pelattava", serves: ["luonto"] },
  /* Suomen kaupungit -megavisa (50 kysymystä) — entisen Kaupungit-sivun nosto (runko vaihe 3, 20.10.2026). */
  { slug: "mega-suomen-kaupungit", nimi: "Megavisa: Suomen kaupungit", ikoni: "jarjestys", kuvaus: "50 kysymystä kaikista 20 kaupungista.", href: "/peli?mega=suomen-kaupungit-mega", tila: "pelattava", serves: ["kaupungit"] },
  /* Laita järjestykseen -pakat (julkaistut, lib/jarjesta/pakat.ts) palvelevat oman kokoelmansa sivua
     (runko vaihe 3, 20.10.2026: Vaalit-hubin pakkakortit → V6). */
  ...JULKAISTUT.map((p) => ({
    slug: `jarjesta-${p.slug}`,
    nimi: `Laita järjestykseen: ${p.kortti.otsikko}`,
    ikoni: "jarjestys" as const,
    kuvaus: p.kortti.meta,
    href: pakkaHref(p),
    tila: "pelattava" as const,
    serves: [p.collection.slug],
  })),
  { slug: "megavisat", nimi: "Megavisat", ikoni: "jarjestys", kuvaus: "20–50 kysymystä yhdellä kertaa.", href: "/megavisat", tila: "pelattava", serves: [] },
];

/** Kokoelman pelit: pelattavat ensin, sitten tulossa olevat. */
export const kokoelmanPelimuodot = (kokoelma: string) =>
  PELIMUODOT.filter((p) => p.serves.includes(kokoelma)).sort((a, b) => Number(a.tila === "tulossa") - Number(b.tila === "tulossa"));
