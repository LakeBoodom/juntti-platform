// TIETONIEKKA 2.0 — motiivipolut (CD:n hub-designien M-kirjasto, viewBox 0 0 200 260)
// Lähde: TN *-hub.dc.html 2026-07-31. Stroke-pohjaisia, currentColor.
// + lintu (oma lisäys samaan tyyliin — kannassa on linnut-kuvakortisto jota designissa ei ollut).

export const MOTIF_PATHS: Record<string, string> = {
  klaffi: "M34 96h132v96H34z M34 96l16-34h132l-16 34 M60 62l-8 34 M96 62l-8 34 M132 62l-8 34",
  filmi: "M34 74h132v112H34z M34 100h132 M34 160h132 M58 74v26 M100 74v26 M142 74v26 M58 160v26 M100 160v26 M142 160v26",
  popcorn: "M62 106h76l-10 100H72z M62 106a18 18 0 0 1 18-18 M138 106a18 18 0 0 1-18-18 M80 88a20 20 0 0 1 40 0",
  naamio: "M52 126a48 48 0 1 0 96 0a48 48 0 1 0-96 0 M74 136q26 28 52 0 M80 108v10 M120 108v10 M28 74l14 10 M172 74l-14 10",
  palkinto: "M76 62h48v34a24 24 0 0 1-48 0z M76 74H56v12a20 20 0 0 0 20 20 M124 74h20v12a20 20 0 0 1-20 20 M100 120v34 M76 186h48 M84 154h32l8 32H76z",
  animaatio: "M52 86a20 20 0 1 0 40 0a20 20 0 1 0-40 0 M108 140a20 20 0 1 0 40 0a20 20 0 1 0-40 0 M72 106v20 M128 118v22 M40 200h120",
  lasi: "M62 108a40 40 0 1 0 80 0a40 40 0 1 0-80 0 M170 202l-40-40 M82 108a20 20 0 0 1 40 0",
  silma: "M40 124q60-46 120 0q-60 46-120 0 M84 124a16 16 0 1 0 32 0a16 16 0 1 0-32 0",
  mikki: "M100 62a20 20 0 0 1 20 20v34a20 20 0 0 1-40 0V82a20 20 0 0 1 20-20 M68 116a32 32 0 0 0 64 0 M100 148v34 M76 182h48",
  kitara: "M118 62l30 30 M104 92l-38 38a34 34 0 1 0 42 42l38-38z M112 148a18 18 0 1 0-36 0a18 18 0 1 0 36 0",
  nuotti: "M64 178a20 20 0 1 0 40 0a20 20 0 1 0-40 0 M104 178V70l52-14v34l-52 14",
  vinyyli: "M100 56a74 74 0 1 0 0 148a74 74 0 1 0 0-148 M100 96a34 34 0 1 0 0 68a34 34 0 1 0 0-68 M100 124a6 6 0 1 0 0 12a6 6 0 1 0 0-12",
  piano: "M40 90h120v80H40z M64 90v52 M88 90v52 M112 90v52 M136 90v52 M40 142h120",
  taajuus: "M40 130h16l10-40 12 80 12-56 12 36 12-60 12 44 10-24h24",
  nfl: "M38 130q62-58 124 0q-62 58-124 0 M82 130h36 M92 116v28 M110 116v28 M56 106l-8-14 M144 154l8 14",
  kiekko: "M78 54v92q0 22 22 22h60 M44 196a30 12 0 1 0 60 0a30 12 0 1 0-60 0 M44 196v-10a30 12 0 0 1 60 0v10",
  pallo: "M36 130a64 64 0 1 0 128 0a64 64 0 1 0-128 0 M100 96l30 22-11 36h-38l-11-36z M100 96V66 M130 118l30-10 M119 154l19 26 M81 154l-19 26 M70 118l-30-10",
  juoksu: "M50 206h100 M60 206q12-64 46-64 M106 142l28-32 M106 142l20 36 M134 110l26 10 M142 82a14 14 0 1 0 0-28a14 14 0 1 0 0 28",
  formula: "M32 150h136 M52 150l16-26h64l20 26 M62 168a14 14 0 1 0 28 0a14 14 0 1 0-28 0 M112 168a14 14 0 1 0 28 0a14 14 0 1 0-28 0",
  koris: "M36 130a64 64 0 1 0 128 0a64 64 0 1 0-128 0 M36 130h128 M100 66v128 M62 82q38 48 0 96 M138 82q-38 48 0 96",
  maapallo: "M100 62a44 44 0 1 0 0 88a44 44 0 1 0 0-88 M56 106h88 M100 62q26 44 0 88 M100 62q-26 44 0 88 M100 150v56 M78 206h44",
  kaupunki: "M40 200V110h36v90 M76 200V80h44v120 M120 200V126h40v74 M52 128h12 M52 156h12 M90 104h16 M90 136h16 M132 148h14",
  vuori: "M28 190l44-72 26 40 20-30 54 62z M72 118l14 22",
  torni: "M100 62v22 M76 200l24-116 24 116 M64 200h72 M84 140h32 M74 170h52",
  lentokone: "M100 54l16 62 52 22-52 12-10 56-6-56-52-12 52-22z",
  elain: "M62 116a38 38 0 1 0 76 0a38 38 0 1 0-76 0 M64 88a16 16 0 1 1 22-16 M136 88a16 16 0 1 0-22-16 M84 116h1 M116 116h1 M100 132v10 M86 148q14 12 28 0",
  meri: "M28 116q22-16 44 0t44 0t44 0 M28 152q22-16 44 0t44 0t44 0 M28 188q22-16 44 0t44 0t44 0",
  avaruus: "M100 76a44 44 0 1 0 0 88a44 44 0 1 0 0-88 M40 168q60-40 120-84 M56 66l6 12 M154 186l-6-12",
  saa: "M52 116a28 28 0 0 1 54-10a24 24 0 0 1 30 34H70a20 20 0 0 1-18-24 M78 156l-8 26 M104 156l-8 26 M130 156l-8 26",
  kasvi: "M100 200V96 M100 130q-40-6-46-52 34 2 46 34 M100 148q40-6 46-52-34 2-46 34",
  kattila: "M40 110h120v50a34 34 0 0 1-34 34H74a34 34 0 0 1-34-34z M40 130H26 M160 130h14 M84 86q10-14 0-26 M116 86q10-14 0-26",
  juoma: "M62 74h76l-10 60-8 66h-40l-8-66z M70 116h60",
  kahvi: "M52 96h84v52a34 34 0 0 1-34 34H86a34 34 0 0 1-34-34z M136 108h18a18 18 0 0 1 0 36h-18 M40 196h108",
  leivos: "M60 130a40 40 0 0 1 80 0 M46 130h108l-8 60H54z M100 90V74 M78 100l-8-12 M122 100l8-12",
  aterimet: "M72 62v46a16 16 0 0 0 32 0V62 M88 108v92 M132 62v138 M132 62a18 30 0 0 1 0 60",
  lippu: "M60 62v138 M60 70q38-18 76 0v54q-38 18-76 0z",
  vaakuna: "M100 56l52 20v50q0 52-52 74-52-22-52-74V76z M100 90v72 M74 118h52",
  kasvot: "M100 74a26 26 0 1 0 0 52a26 26 0 1 0 0-52 M52 200q10-52 48-52t48 52",
  kysymys: "M76 96a24 24 0 1 1 48 0c0 20-24 22-24 44 M100 178h1 M60 62a56 56 0 0 1 80 0",
  lintu: "M60 140q-24-8-34-30 20-2 34 8 4-40 40-46 -6 18 2 30 26-10 50 6-18 26-48 26l-8 52 M92 90h1 M104 186h28",
};

/* TV-genre → motiivi (uusi leveä korttityyli) */
const TV_GENRE_MOTIF: Record<string, string> = {
  komedia: "naamio",
  draama: "filmi",
  rikosdraama: "lasi",
  scifi: "avaruus",
  kauhu: "silma",
  "tosi-tv": "mikki",
  dokumentti: "klaffi",
  animaatio: "animaatio",
};

/* Urheilun laji titlestä (kunnes lajibackfill on kannassa) */
const SPORT_MOTIF: Array<[RegExp, string]> = [
  [/formula|f1/i, "formula"],
  [/ralli/i, "formula"],
  [/tennik|federer|us open/i, "palkinto"],
  [/golf|the open/i, "palkinto"],
  [/koripallo|nba|susijengi/i, "koris"],
  [/kiekko|nhl|liiga|leijon/i, "kiekko"],
  [/yleisurheilu|juoksu|keihä/i, "juoksu"],
  [/stadion/i, "torni"],
];

const COLLECTION_MOTIF: Record<string, string> = {
  tv: "klaffi",
  elokuvat: "klaffi",
  musiikki: "nuotti",
  urheilu: "pallo",
  matkakohteet: "maapallo",
  yleistieto: "kysymys",
  "tunnetut-henkilot": "kasvot",
};

/** Motiivipolku visalle: genre → laji → kokoelma → kysymysmerkki. Ei voi epäonnistua. */
export function motifPathFor(collection: string | null, genre: string | null, title: string): string {
  if (collection === "tv" && genre && TV_GENRE_MOTIF[genre]) return MOTIF_PATHS[TV_GENRE_MOTIF[genre]];
  if (collection === "urheilu") {
    for (const [re, key] of SPORT_MOTIF) if (re.test(title)) return MOTIF_PATHS[key];
    return MOTIF_PATHS.pallo;
  }
  if (collection === "matkakohteet") {
    if (/vuori|tunturi|alpp/i.test(title)) return MOTIF_PATHS.vuori;
    if (/kaupun|pääkaupun/i.test(title)) return MOTIF_PATHS.kaupunki;
    if (/luonto|eläi|lintu|karhu/i.test(title)) return MOTIF_PATHS.kasvi;
    return MOTIF_PATHS.maapallo;
  }
  if (collection === "yleistieto") {
    if (/ruoka|juoma|keitt|resepti|viini|olut|kahvi/i.test(title)) return MOTIF_PATHS.kattila;
    if (/histor/i.test(title)) return MOTIF_PATHS.torni;
    return MOTIF_PATHS.kysymys;
  }
  if (collection === "musiikki") {
    if (/kitara|rock|metalli/i.test(title)) return MOTIF_PATHS.kitara;
    if (/festari|festivaali|lava/i.test(title)) return MOTIF_PATHS.mikki;
    if (/levy|albumi|vinyyli/i.test(title)) return MOTIF_PATHS.vinyyli;
    return MOTIF_PATHS.nuotti;
  }
  return MOTIF_PATHS[COLLECTION_MOTIF[collection ?? ""] ?? "kysymys"];
}
