// VIHJEPELI — aiheesta riippumaton moottori (Mikä maa? -brief 28.10.2026: "uusi aihe ei vaadi uutta pelikoodia,
// vaan datapaketin ja palautetyypin"). Ensimmäinen aihe on maa (aiheet/maa.ts), seuraavaksi henkilö.
//
// Kierros: yksi kohde, enintään 6 arvausta. Vihjeet 1–3 kannasta (vihjepeli_vihjeet), 4–5 aiheen aineistosta.
// Pisteet arvauksen numeron mukaan 6 → 1, epäonnistuminen 0.

export const ARVAUKSIA = 6;

export type Vaikeus = "A" | "B" | "C";

/** Kohdejoukon alkio sellaisena kuin täydennyslista ja palaute sen tarvitsevat (selaimeen menevä osa). */
export type Kohde = {
  /** Pysyvä tunniste: maa ISO-3, henkilö slug. */
  id: string;
  nimi: string;
  /** Muut hyväksyttävät nimet (Hollanti = Alankomaat). Täydennys vertaa myös näihin. */
  syn?: string[];
  taso: Vaikeus;
};

/** Ilmansuunta arvauksesta oikeaan kohteeseen, 8 suuntaa myötäpäivään pohjoisesta. */
export type Suunta = "pohjoinen" | "koillinen" | "itä" | "kaakko" | "etelä" | "lounas" | "länsi" | "luode";

/** Palaute väärästä arvauksesta. Aihe valitsee tyypin; moottori ja client tuntevat molemmat. */
export type Palaute =
  | { tyyppi: "etaisyys"; km: number; suunta: Suunta; asteet: number; naapuri: boolean }
  | { tyyppi: "ruudukko"; sarakkeet: { avain: string; osuma: boolean; suunta?: "ylos" | "alas" }[] };

export type VihjepeliAihe<K extends Kohde = Kohde> = {
  /** vihjepeli_vihjeet.aihe ja vihjepeli_pelit.aihe. */
  avain: "maa" | "henkilo" | "kaupunki" | "elain";
  kohteet: K[];
  /** Päivän kohteen historia lasketaan tästä päivästä alkaen: sama päivä antaa aina saman kohteen. */
  julkaisu: string;
  /** Sama kohde ei ole päivän kohde uudelleen näin monen päivän sisällä (Heikki 7.11.2026: 60). */
  toistovali: number;
  /** Arvotaanko kohde päivänä iso (päivän kohde ja harjoitus). Uusi erä lisätään omalla alkupäivällään,
   *  jotta aiempien päivien kohteet eivät muutu jälkikäteen. */
  arvottava: (k: K, iso: string) => boolean;
  palaute: (arvaus: K, oikea: K) => Palaute;
};
