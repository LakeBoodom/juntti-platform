// JÄRJESTÄ-HUB (pelimuotosivujen yhtenäistäminen, osa C, Heikki 31.10.2026).
//
// Ikäjärjestys ja Laita järjestykseen ovat yksi pelimuoto: kaikki pakat yhdellä sivulla /peli/jarjesta teemoittain.
// Ikäjärjestyksen aiheet (Kaikki + seitsemän henkilöryhmää) ovat pakkoja osoitteessa /peli/jarjesta/ikajarjestys-<aihe>;
// muut pakat tulevat pakat.ts:stä (julkaistut). Tavallinen moduuli: käytetään sekä palvelimella että clientillä.

import { CHAIN_CATEGORIES } from "@/lib/personCategories";
import { RYHMAT } from "@/lib/henkiloRyhmat";
import { JULKAISTUT, pakkaHref } from "./pakat";

export const HUB_HREF = "/peli/jarjesta";
export const HUB = { href: HUB_HREF, nimi: "Järjestä" };

/** Ikäjärjestyspakan slugin etuliite: /peli/jarjesta/ikajarjestys-urheilijat. */
export const IKA_ETULIITE = "ikajarjestys-";

export type HubPakka = {
  slug: string;
  /** Kortin nimi; U+00AD-tavuviivat sallittu (KORTTISÄÄNTÖ: pitkät yhdyssanat kapeassa kortissa). */
  nimi: string;
  meta: string;
  kuva: string;
  href: string;
  teema: string;
};

const LYHYT = new Map<string, string>(RYHMAT.map((r) => [r.key as string, r.lyhyt]));

export type IkaPakka = HubPakka & { kategoria: string };

export const IKA_PAKAT: IkaPakka[] = CHAIN_CATEGORIES.map((c) => ({
  slug: `${IKA_ETULIITE}${c.key}`,
  kategoria: c.key,
  nimi: c.key === "kaikki" ? "Kaikki henkilöt" : (LYHYT.get(c.key) ?? c.label),
  meta: "Syntymävuosi",
  kuva: `/20/jarjesta/ikajarjestys-${c.key}.webp`,
  href: `${HUB_HREF}/${IKA_ETULIITE}${c.key}`,
  teema: "Henkilöt",
}));

export const haeIkaPakka = (slug: string) => IKA_PAKAT.find((p) => p.slug === slug) ?? null;

/** Vanhan /peli/ikajarjestys?category= -arvon pakka (vanhat avaimet artistit/muut kuten getChainRound). */
export function ikaPakkaKategoriasta(kategoria: string | undefined): IkaPakka {
  const k = kategoria === "artistit" ? "muusikot" : kategoria === "muut" ? "kaikki" : kategoria;
  return IKA_PAKAT.find((p) => p.kategoria === k) ?? IKA_PAKAT[0];
}

/** Pitkät pakkanimet tavutettuina kapeisiin kortteihin (näkyvä teksti on sama kuin pakat.ts:n kortti.otsikko). */
const TAVUT: Record<string, string> = {
  "Pääministerikaudet": "Pääministeri­kaudet",
  "Eduskuntavuodet": "Eduskunta­vuodet",
  "Eduskuntaryhmät": "Eduskunta­ryhmät",
  "Kansallispuistot": "Kansallis­puistot",
};

export const HUB_PAKAT: HubPakka[] = [
  ...IKA_PAKAT,
  ...JULKAISTUT.map((p) => ({
    slug: p.slug,
    nimi: TAVUT[p.kortti.otsikko] ?? p.kortti.otsikko,
    meta: p.kortti.meta,
    kuva: p.korttikuva,
    href: pakkaHref(p),
    teema: p.teema,
  })),
];

/** Teemat ensiesiintymisjärjestyksessä (Henkilöt, Politiikka, …), kukin pakkoineen. */
export function hubTeemat(): Array<{ teema: string; pakat: HubPakka[] }> {
  const t = new Map<string, HubPakka[]>();
  for (const p of HUB_PAKAT) t.set(p.teema, [...(t.get(p.teema) ?? []), p]);
  return [...t].map(([teema, pakat]) => ({ teema, pakat }));
}

/** Hubin kortti vie suoraan peliin: ensimmäinen kierros arvotaan jo palvelimella. */
export const aloitaHref = (p: HubPakka) => `${p.href}?aloita=1`;

/** Päivän pakka: sama kaikille koko päivän (Suomen aika), vaihtuu keskiyöllä. */
export function paivanPakka(nyt = new Date()): HubPakka {
  const pvm = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(nyt);
  const paiva = Math.floor(Date.parse(`${pvm}T00:00:00Z`) / 86_400_000);
  return HUB_PAKAT[paiva % HUB_PAKAT.length];
}

/** "Seuraava pakka" tulosnäkymässä: saman teeman seuraava, teeman lopusta seuraavan teeman ensimmäinen. */
export function seuraavaPakka(slug: string): HubPakka {
  const i = HUB_PAKAT.findIndex((p) => p.slug === slug);
  return HUB_PAKAT[(i + 1) % HUB_PAKAT.length];
}

export const nakyvaNimi = (nimi: string) => nimi.replace(/­/g, "");
