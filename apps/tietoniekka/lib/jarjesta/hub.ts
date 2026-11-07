// JÄRJESTÄ-HUB (pelimuotosivujen yhtenäistäminen, osa C, Heikki 31.10.2026; CD kierros 5a 31.10.2026).
//
// Ikäjärjestys ja Laita järjestykseen ovat yksi pelimuoto /peli/jarjesta. CD "Järjestä yhtenäinen UX" v0.2 (Heikki
// 3.11.2026): hubin ensimmäinen haaste on pelattava presidenttirivi, Tunnetut suomalaiset jakautuu aloihin (vain
// suomalaiset, vanhat ikajarjestys-<aihe>-osoitteet ohjataan vastaavaan pakkaan, next.config.mjs).
// Tavallinen moduuli: käytetään sekä palvelimella että clientillä.

import { JULKAISTUT, pakkaHref, type Pakka } from "./pakat";
import type { KasinKoukku } from "@/lib/koukku";

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
  /** Hubin pyörylän nimi, jos eri kuin pakan nimi. */
  hubNimi?: string;
  meta: string;
  kuva: string;
  /** Hubin pyörylässä kolme pientä kasvoa yhden kuvan sijaan. */
  kolmikko?: string[];
  href: string;
};

export type IkaPakka = HubPakka & { kategoria: string; kuvaus: string; pelilause: string; koukku?: KasinKoukku };

/* Hubin pyörylät: omat kopiot (henkilokuvat.ts), krediitit henkilokuvalahteet.ts → /kuvien-lahteet. */
const SELANNE = "/20/henkilot/k/teemu-selanne-on-the-ice-november-2010-8f51e8.webp";
const TAHKA = "/20/henkilot/k/lauri-tahka-407-e310c0.webp";
const SALMINEN = "/20/henkilot/k/esko-salminen-2-d1cf20.webp";
const OKSANEN = "/20/henkilot/k/sofia-oksanen-vinnare-av-nordiska-radets-littera-d7443a.webp";
const SAARILUOMA = "/20/henkilot/k/jaakko-saariluoma-779a95.webp";

/** Henkilöpakka: suomalaiset (celebrities.suomalainen), ikäjärjestys syntymäpäivän mukaan. */
export const HENKILOPAKKA: IkaPakka = {
  slug: "tunnetut-suomalaiset",
  kategoria: "suomalaiset",
  nimi: "Tunnetut suomalaiset",
  hubNimi: "Kaikki alat",
  meta: "Syntymävuosi",
  kuva: "/20/jarjesta/tunnetut-suomalaiset.webp",
  kolmikko: [SELANNE, TAHKA, SAARILUOMA],
  href: `${HUB_HREF}/tunnetut-suomalaiset`,
  kuvaus: "Aseta kahdeksan tunnettua henkilöä syntymävuoden mukaan vanhimmasta nuorimpaan.",
  pelilause: "Suomalaiset syntymävuoden mukaan, vanhin ensin.",
  koukku: { kysymys: "Kumpi syntyi ensin?", vaihtoehdot: ["Sauli Niinistö", "Tarja Halonen"] },
};

/** Alan pakka: sivuston henkilöryhmä, vain suomalaiset. Media, vaikuttajat ja poliitikot vain Kaikki alat -pakassa (CD 4a). */
const alanPakka = (slug: string, nimi: string, kohde: string, kuva: string, koukku: KasinKoukku): IkaPakka => ({
  slug,
  kategoria: `suomalaiset:${slug}`,
  nimi,
  meta: "Syntymävuosi",
  kuva,
  href: `${HUB_HREF}/${slug}`,
  kuvaus: `Aseta kahdeksan tunnettua suomalaista ${kohde} syntymävuoden mukaan vanhimmasta nuorimpaan.`,
  pelilause: `${nimi} syntymävuoden mukaan, vanhin ensin.`,
  koukku,
});

export const IKA_PAKAT: IkaPakka[] = [
  /* Koukut (v4 §4, vaihe 4): syntymäpäivät tarkistettu celebrities-taulusta 7.11.2026. */
  alanPakka("urheilijat", "Urheilijat", "urheilijaa", SELANNE, { kysymys: "Kumpi syntyi ensin?", vaihtoehdot: ["Jari Litmanen", "Teemu Selänne"] }),
  alanPakka("muusikot", "Muusikot", "muusikkoa", TAHKA, { kysymys: "Kumpi syntyi ensin?", vaihtoehdot: ["Arja Koriseva", "Jari Sillanpää"] }),
  alanPakka("nayttelijat", "Näyttelijät", "näyttelijää", SALMINEN, { kysymys: "Kumpi syntyi ensin?", vaihtoehdot: ["Laura Malmivaara", "Peter Franzén"] }),
  alanPakka("kirjailijat", "Kirjailijat", "kirjailijaa", OKSANEN, { kysymys: "Kumpi syntyi ensin?", vaihtoehdot: ["Jari Tervo", "Kari Hotakainen"] }),
  HENKILOPAKKA,
];

export const haeIkaPakka = (slug: string) => IKA_PAKAT.find((p) => p.slug === slug) ?? null;

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

/** Pakkojen kierto (Heikki 31.10.2026): Presidentit ensin, sitten politiikka ja luonto/maantieto vuorotellen, jotta
 *  "Seuraava rivi" vaihtaa aihetta. Myöhemmin julkaistut pakat tulevat loppuun. */
const KIERTO = [
  "presidentit", "tunturit-korkeus", "paaministerit", "kaupungit-asukasluku", "eduskuntaryhmat", "vuoret-korkeus",
  "puolueet-ika", "jarvet-pinta-ala", "paaministerit-kesto", "maakunnat-pinta-ala", "vaalipiirit-paikat",
  "kansallispuistot-pinta-ala", "eduskunta-pisimpaan",
];
const kiertoIndeksi = (p: Pakka) => (KIERTO.includes(p.slug) ? KIERTO.indexOf(p.slug) : KIERTO.length);
export const KIERRON_PAKAT: Pakka[] = [...JULKAISTUT].sort((a, b) => kiertoIndeksi(a) - kiertoIndeksi(b));

/** Kaikki pelattavat pakat ("Seuraava rivi"): henkilöpakat + julkaistut kierron järjestyksessä. */
export const HUB_PAKAT: HubPakka[] = [...IKA_PAKAT, ...KIERRON_PAKAT.map(hubPakka)];

/** Hubin kortti vie suoraan peliin: ensimmäinen kierros arvotaan jo palvelimella. */
export const aloitaHref = (p: HubPakka) => `${p.href}?aloita=1`;

/** "Seuraava pakka" tulosnäkymässä: listan seuraava, lopusta alkuun. */
export function seuraavaPakka(slug: string): HubPakka {
  const i = HUB_PAKAT.findIndex((p) => p.slug === slug);
  return HUB_PAKAT[(i + 1) % HUB_PAKAT.length];
}

export const nakyvaNimi = (nimi: string) => nimi.replace(/­/g, "");
