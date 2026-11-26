// TÄNÄÄN · PÄIVÄN VISA 7+1 — tyypit (toteutusbrief 22.11.2026, Heikin päätökset 24.11.2026).
// Kanta: tanaan_lehdet (yksi lehti per päivä) + tanaan_jutut (sivut 1–7). Merkkirajat tarkistetaan kannassa.

export type Juttu = {
  sivu: number;
  osasto: string;
  juttu: string;
  /** Pitkä uutisteksti (vaihe 3): mobiilissa oma uutissivu ennen kysymystä, desktopilla aukeaman vasen sivu.
   *  Kuva: teksti.kuva (vaaka/pysty); ilman sitä jutun oma kuva pystykuvana tekstin vieressä. */
  teksti: { ingressi: string; kappaleet: string[]; kuva?: string | null; kuva_alt?: string | null; kuva_muoto?: "vaaka" | "pysty" } | null;
  kuva: string | null;
  kuvaAlt: string | null;
  kysymys: string;
  vaihtoehdot: [string, string, string, string];
  oikea: number;
  selitys: string;
  lahde: string | null;
  jatko: { teksti: string; url: string } | null;
};

/** Päivän pähkinä vuorottelee (Heikki 24.11.2026): Järjestä neljä, Kumpi?-pari tai olemassa oleva päiväpeli. */
export type Pahkina =
  | { muoto: "jarjesta"; saanto: string; ylin: string; alin: string; kohteet: Array<{ teksti: string; arvo: string; sija: number }> }
  | { muoto: "kumpi"; kysymys: string; a: { teksti: string; arvo: string }; b: { teksti: string; arvo: string }; oikea: 0 | 1 }
  | { muoto: "peli"; peli: "mika-maa" };

/** Lehden kansi (CD Kansi.dc.html). Malli valitsee paikat; tyhjä paikka jää pois ja pääjuttu ottaa tilan. */
export type Kansi = {
  malli: "taysi" | "kaksi" | "yksi";
  paajuttu: { karki: string; rivit: string[]; tarra: string | null; kuva: string | null; kuva_alt: string | null };
  nauha: { a: string; b: string } | null;
  laatat: Array<{ otsikko: string; alarivi: string; koukku: string | null; kuva: string | null; kuva_alt?: string | null }>;
  myos: string[] | null;
  pahkina: string;
};

export type Lehti = {
  /** YYYY-MM-DD (Suomen päivä) */
  pvm: string;
  juhla: string | null;
  jutut: Juttu[];
  pahkina: Pahkina;
  /** Kansi; luonnoksella voi puuttua (silloin sivulla 1 nimiö). */
  kansi: Kansi | null;
  loppi: string[];
  /** Esikatselu: luonnos näytetään (ei koskaan tuotannossa). */
  luonnos: boolean;
};

export type PahkinanTila = "ok" | "fail" | "skip";

/** Pelaajan eteneminen selaimessa (localStorage), yksi avain per päivä. */
export type Eteneminen = {
  /** Valinnat sivuittain (vaihtoehdon indeksi tai null). */
  valinnat: Array<number | null>;
  /** 0–6 juttu, 7 pähkinä, 8 tulos */
  sivu: number;
  pahkina: PahkinanTila | null;
  valmis: boolean;
};

/** Pähkinän nimi pelaajalle ja tuloslistaan. */
export function pahkinanNimi(p: Pahkina): string {
  if (p.muoto === "jarjesta") return "Järjestä neljä";
  if (p.muoto === "kumpi") return "Kumpi?";
  return "Mikä maa?";
}
