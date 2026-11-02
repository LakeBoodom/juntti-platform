// JÄRJESTÄ-HUB (pelimuotosivujen yhtenäistäminen, osa C, Heikki 31.10.2026; CD kierros 5a 31.10.2026).
//
// Ikäjärjestys ja Laita järjestykseen ovat yksi pelimuoto /peli/jarjesta. Hubissa: päivän rivi (pakka vaihtuu
// keskiyöllä), aina toisena henkilörivi (Tunnetut suomalaiset) ja muut pakat "Lisää rivejä" -osiossa.
// Ammattikohtaiset ikäjärjestyspakat poistuivat (CD 5a); niiden osoitteet ohjataan henkilöpakkaan (next.config.mjs).
// Tavallinen moduuli: käytetään sekä palvelimella että clientillä.

import { CHAIN_CATEGORIES } from "@/lib/personCategories";
import { JULKAISTUT, pakkaHref, type Pakka } from "./pakat";
import { paivaAvain, paivaNumero } from "./siemen";

export const HUB_HREF = "/peli/jarjesta";
export const HUB = { href: HUB_HREF, nimi: "Järjestä" };

export type HubPakka = {
  slug: string;
  /** Hubin "Lisää järjestettävää" -ryhmä. */
  ryhma?: Pakka["ryhma"];
  /** Kuvana kokonainen tunnus (vaakuna), ei rajausta. */
  tunnus?: boolean;
  /** Kortin nimi; U+00AD-tavuviivat sallittu (KORTTISÄÄNTÖ: pitkät yhdyssanat kapeassa kortissa). */
  nimi: string;
  meta: string;
  kuva: string;
  href: string;
};

export type IkaPakka = HubPakka & { kategoria: string; paivanLause: string; pelilause: string };

/** Henkilöpakka: suomalaiset (celebrities.suomalainen), ikäjärjestys syntymäpäivän mukaan. */
export const HENKILOPAKKA: IkaPakka = {
  slug: "tunnetut-suomalaiset",
  kategoria: "suomalaiset",
  nimi: "Tunnetut suomalaiset",
  meta: "Syntymävuosi",
  kuva: "/20/jarjesta/tunnetut-suomalaiset.webp",
  href: `${HUB_HREF}/tunnetut-suomalaiset`,
  paivanLause: "Viisi suomalaista syntymävuoden mukaan, vanhin ensin.",
  pelilause: "Suomalaiset syntymävuoden mukaan, vanhin ensin.",
};

export const IKA_PAKAT: IkaPakka[] = [HENKILOPAKKA];

export const haeIkaPakka = (slug: string) => IKA_PAKAT.find((p) => p.slug === slug) ?? null;

/** Osan C ensimmäisen version ammattipakat (/peli/jarjesta/ikajarjestys-<aihe>) → henkilöpakka (next.config.mjs). */
export const VANHAT_IKA_SLUGIT = CHAIN_CATEGORIES.map((c) => `ikajarjestys-${c.key}`);

/** Pitkät pakkanimet tavutettuina kapeisiin kortteihin (näkyvä teksti on sama kuin pakat.ts:n kortti.otsikko). */
const TAVUT: Record<string, string> = {
  "Pääministerit": "Päämi­nisterit",
  "Pääministerikaudet": "Pääministeri­kaudet",
  "Eduskuntavuodet": "Eduskunta­vuodet",
  "Eduskuntaryhmät": "Eduskunta­ryhmät",
  "Kansallispuistot": "Kansallis­puistot",
};

export const hubPakka = (p: Pakka): HubPakka => ({
  slug: p.slug,
  ryhma: p.ryhma,
  tunnus: p.tunnus,
  nimi: TAVUT[p.kortti.otsikko] ?? p.kortti.otsikko,
  meta: p.kortti.meta.replace("Virkaanastuminen", "Virkaan\u00ADastuminen"), // KORTTISÄÄNTÖ: 320 px
  kuva: p.hubKuva ?? p.korttikuva,
  href: pakkaHref(p),
});

/** Kierto (Heikki 31.10.2026): Presidentit ensin, sitten politiikka ja luonto/maantieto vuorotellen, jotta peräkkäiset
 *  päivät eivät ole samaa aihetta. Myöhemmin julkaistut pakat tulevat loppuun. Sama järjestys "Lisää rivejä" -osiossa. */
const KIERTO = [
  "presidentit", "tunturit-korkeus", "paaministerit", "kaupungit-asukasluku", "eduskuntaryhmat", "vuoret-korkeus",
  "puolueet-ika", "jarvet-pinta-ala", "paaministerit-kesto", "maakunnat-pinta-ala", "vaalipiirit-paikat",
  "kansallispuistot-pinta-ala", "eduskunta-pisimpaan",
];
const kiertoIndeksi = (p: Pakka) => (KIERTO.includes(p.slug) ? KIERTO.indexOf(p.slug) : KIERTO.length);
export const KIERRON_PAKAT: Pakka[] = [...JULKAISTUT].sort((a, b) => kiertoIndeksi(a) - kiertoIndeksi(b));

/** Kaikki pelattavat pakat ("Seuraava pakka", sivukartta): henkilöpakka + julkaistut kierron järjestyksessä. */
export const HUB_PAKAT: HubPakka[] = [HENKILOPAKKA, ...KIERRON_PAKAT.map(hubPakka)];

/** Hubin kortti vie suoraan peliin: ensimmäinen kierros arvotaan jo palvelimella. */
export const aloitaHref = (p: HubPakka) => `${p.href}?aloita=1`;

/** Kierron ensimmäinen päivä: silloin heron pakka on Presidentit (CD 5a), sen jälkeen pakat vuorotellen. */
const KIERRON_ALKU = "2026-10-31";

/** Päivän pakka heroon: sama kaikille koko päivän (Suomen aika), vaihtuu keskiyöllä. Henkilöpakka ei kierrä. */
export function paivanPakka(paiva = paivaAvain()): Pakka {
  const i = paivaNumero(paiva) - paivaNumero(KIERRON_ALKU);
  const n = KIERRON_PAKAT.length;
  return KIERRON_PAKAT[((i % n) + n) % n];
}

/** "Seuraava pakka" tulosnäkymässä: listan seuraava, lopusta alkuun. */
export function seuraavaPakka(slug: string): HubPakka {
  const i = HUB_PAKAT.findIndex((p) => p.slug === slug);
  return HUB_PAKAT[(i + 1) % HUB_PAKAT.length];
}

export const nakyvaNimi = (nimi: string) => nimi.replace(/­/g, "");
