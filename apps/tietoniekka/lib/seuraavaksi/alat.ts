// "PELAA SEURAAVAKSI" HENKILÖVISOISSA (Heikki 11.11.2026, laajennus kaikkiin henkilövisoihin): henkilön ala = sivuston
// henkilöryhmä (lib/henkiloRyhmat.ts, samat ryhmät kuin Ikäjärjestyksessä). Tästä taulukosta tulee paikan 2 peli ja aihevisa
// sekä paikan 3 portaan a "liittyy aiheeseen" -joukko.
//
// Paikka 2 järjestyksessä: alan oma peli (Tupla-teema tai Järjestä-pakka, joka liittyy alaan) → Ikäjärjestys omalla ryhmällä
// (pakat vain urheilijat, muusikot, näyttelijät, kirjailijat) → alan aihevisa (ei henkilö) → Ikäjärjestys · Kaikki alat.
// Urheilijoiden peli tulee lajista kuten pilotissa (hae.ts): jääkiekko → Tupla tai kuitti: SM-liiga.
import type { RyhmaKey } from "@/lib/henkiloRyhmat";

/** Alan aihevisat: kokoelma ja halutessa vain sen alaryhmät (järjestys = suosituimmuus). */
export type AlanKokoelma = { collection: string; sub?: string[] };

export type Ala = {
  /** Pelimuotojen slugit (lib/pelimuodot.ts) järjestyksessä. */
  pelit: string[];
  /** Ikäjärjestyksen alan pakka (lib/jarjesta/hub.ts IKA_PAKAT); null = ryhmällä ei omaa pakkaa. */
  ikaPakka: string | null;
  kokoelmat: AlanKokoelma[];
};

export const KAIKKI_ALAT = "tunnetut-suomalaiset";

const POLITIIKAN_PAKKA: Array<[string, string]> = [
  ["presidentti", "jarjesta-presidentit"],
  ["paaministeri", "jarjesta-paaministerit"],
  ["ministeri_kansanedustaja", "jarjesta-eduskunta-pisimpaan"],
  ["puoluejohtaja", "jarjesta-eduskunta-pisimpaan"],
  ["puoliso", "jarjesta-presidentit"],
];

const TIEDE = ["keksinnot-ja-tiedehistoria", "fysiikka-kemia-matematiikka", "maa-ja-avaruus", "elama-ja-ihminen"];

/** Henkilön ala: ryhmä + laji (+ poliitikon roolit). */
export function alaHenkilolle(ryhma: RyhmaKey, laji: string | null, roolit: string[] | null): Ala {
  switch (ryhma) {
    case "urheilijat":
      return { pelit: [], ikaPakka: "urheilijat", kokoelmat: [{ collection: "urheilu" }] };
    case "muusikot":
      return { pelit: ["tupla-musiikki"], ikaPakka: "muusikot", kokoelmat: [{ collection: "musiikki" }] };
    case "nayttelijat":
      /* Näyttelijät ja koomikot: TV ja suoratoisto (sarjat ja hahmot) on lähin Tupla-teema. */
      return { pelit: ["tupla-tv-ja-suoratoisto"], ikaPakka: "nayttelijat", kokoelmat: [{ collection: "elokuvat" }, { collection: "tv" }] };
    case "kirjailijat":
      return {
        pelit: ["tupla-kulttuuri"],
        ikaPakka: "kirjailijat",
        kokoelmat: [{ collection: "kulttuuri", sub: laji === "kirjallisuus" ? ["kirjallisuus-tarinat", "taide-design"] : ["taide-design", "kirjallisuus-tarinat"] }],
      };
    case "media":
      /* Elokuvantekijät: ei omaa peliä → elokuvavisat. Mediapersoonat: TV ja suoratoisto. */
      return laji === "elokuva"
        ? { pelit: [], ikaPakka: null, kokoelmat: [{ collection: "elokuvat" }, { collection: "tv" }] }
        : { pelit: ["tupla-tv-ja-suoratoisto"], ikaPakka: null, kokoelmat: [{ collection: "tv" }, { collection: "elokuvat" }] };
    case "poliitikot": {
      const r = roolit ?? [];
      /* Kuninkaalliset, maanpuolustus ja ulkomaiset poliitikot: Suomen pakat eivät sovi → Tupla tai kuitti: Historia. */
      if (laji === "kuninkaalliset" || laji === "maanpuolustus" || r.includes("ulkomainen")) {
        return { pelit: ["tupla-historia"], ikaPakka: null, kokoelmat: [{ collection: "historia" }, { collection: "vaalit" }] };
      }
      const oma = POLITIIKAN_PAKKA.find(([rooli]) => r.includes(rooli))?.[1] ?? "jarjesta-presidentit";
      const muut = ["jarjesta-presidentit", "jarjesta-paaministerit", "jarjesta-eduskunta-pisimpaan"].filter((s) => s !== oma);
      return { pelit: [oma, ...muut], ikaPakka: null, kokoelmat: [{ collection: "vaalit" }, { collection: "historia" }] };
    }
    case "vaikuttajat":
      return { pelit: [], ikaPakka: null, kokoelmat: laji === "tiede" ? [{ collection: "yleistieto", sub: TIEDE }] : [] };
  }
}
