// Erä B1 (3.10.2026): henkilöryhmät 4 → 7 (HENKILOT_ROOLIT_JA_RYHMAT_EHDOTUS_2026_10_02.md).
// Cowork ajaa celebrities.ryhma-päivitykset kantaan; siirtymän ajan koodi lukee sekä vanhoja
// (artistit, muut) että uusia arvoja. ryhmaOf() palauttaa aina jonkin seitsemästä.

export type RyhmaKey = "urheilijat" | "muusikot" | "nayttelijat" | "poliitikot" | "media" | "kirjailijat" | "vaikuttajat";

export type Ryhma = {
  key: RyhmaKey;
  /** Sivuston nimi ("Muusikot ja artistit"). */
  nimi: string;
  /** Lyhyt muoto murupolkuun ja chippeihin ("Muusikot"). */
  lyhyt: string;
};

export const RYHMAT: Ryhma[] = [
  { key: "urheilijat", nimi: "Urheilijat", lyhyt: "Urheilijat" },
  { key: "muusikot", nimi: "Muusikot ja artistit", lyhyt: "Muusikot" },
  { key: "nayttelijat", nimi: "Näyttelijät ja koomikot", lyhyt: "Näyttelijät" },
  { key: "poliitikot", nimi: "Poliitikot ja valtionpäämiehet", lyhyt: "Poliitikot" },
  { key: "media", nimi: "Media- ja elokuvantekijät", lyhyt: "Media" },
  { key: "kirjailijat", nimi: "Kirjailijat ja taiteilijat", lyhyt: "Kirjailijat" },
  { key: "vaikuttajat", nimi: "Tiede, talous ja muut vaikuttajat", lyhyt: "Vaikuttajat" },
];

const MUUT_LAJI: Record<string, RyhmaKey> = {
  media: "media",
  elokuva: "media",
  kirjallisuus: "kirjailijat",
  kuvataide: "kirjailijat",
  muotoilu: "kirjailijat",
  tiede: "vaikuttajat",
  talous: "vaikuttajat",
  muoti: "vaikuttajat",
  ruoka: "vaikuttajat",
};

/** Kannan ryhmä (vanha tai uusi) + laji → yksi seitsemästä. */
export function ryhmaOf(ryhma: string | null | undefined, laji: string | null | undefined): RyhmaKey {
  if (ryhma && RYHMAT.some((r) => r.key === ryhma)) return ryhma as RyhmaKey;
  if (ryhma === "artistit") return "muusikot";
  return MUUT_LAJI[laji ?? ""] ?? "vaikuttajat";
}

/** Kannan ryhmäarvot, jotka vastaavat uutta ryhmää (kyselyihin siirtymän aikana). */
export function kannanRyhmat(r: RyhmaKey): string[] {
  if (r === "muusikot") return ["muusikot", "artistit"];
  if (r === "media" || r === "kirjailijat" || r === "vaikuttajat") return [r, "muut"];
  return [r];
}

export const ryhma = (key: RyhmaKey) => RYHMAT.find((r) => r.key === key)!;

/** Lajin monikko "Muut …" -otsikkoon ja Ikäjärjestys-korttiin. */
const LAJI_MONIKKO: Record<string, string> = {
  jaakiekko: "jääkiekkoilijat",
  jalkapallo: "jalkapalloilijat",
  moottoriurheilu: "moottoriurheilijat",
  talviurheilu: "talviurheilijat",
  koripallo: "koripalloilijat",
  yleisurheilu: "yleisurheilijat",
  tennis: "tennispelaajat",
  golf: "golfarit",
  kamppailulajit: "kamppailulajien urheilijat",
  "muu-urheilu": "urheilijat",
  musiikki: "muusikot",
  klassinen: "klassisen musiikin tekijät",
  hiphop: "hiphop-artistit",
  tanssi: "tanssijat",
  nayttelija: "näyttelijät",
  komedia: "koomikot",
  politiikka: "poliitikot",
  kuninkaalliset: "kuninkaalliset",
  maanpuolustus: "maanpuolustuksen henkilöt",
  media: "mediapersoonat",
  elokuva: "elokuvantekijät",
  kirjallisuus: "kirjailijat",
  kuvataide: "kuvataiteilijat",
  muotoilu: "muotoilijat",
  tiede: "tieteentekijät",
  talous: "talouden vaikuttajat",
  muoti: "muodin vaikuttajat",
  ruoka: "ruoan vaikuttajat",
};

export const lajiMonikko = (laji: string | null | undefined) => (laji && LAJI_MONIKKO[laji]) || null;

/** Lajin nimi chippeihin ja otsikoihin ("Moottoriurheilu"). */
const LAJI_NIMI: Record<string, string> = {
  jaakiekko: "Jääkiekko",
  jalkapallo: "Jalkapallo",
  moottoriurheilu: "Moottoriurheilu",
  talviurheilu: "Talviurheilu",
  koripallo: "Koripallo",
  yleisurheilu: "Yleisurheilu",
  tennis: "Tennis",
  golf: "Golf",
  kamppailulajit: "Kamppailulajit",
  "muu-urheilu": "Muu urheilu",
  musiikki: "Musiikki",
  klassinen: "Klassinen musiikki",
  hiphop: "Hiphop",
  tanssi: "Tanssi",
  nayttelija: "Näyttelijät",
  komedia: "Komedia",
  politiikka: "Politiikka",
  kuninkaalliset: "Kuninkaalliset",
  maanpuolustus: "Maanpuolustus",
  media: "Media",
  elokuva: "Elokuva",
  kirjallisuus: "Kirjallisuus",
  kuvataide: "Kuvataide",
  muotoilu: "Muotoilu",
  tiede: "Tiede",
  talous: "Talous",
  muoti: "Muoti",
  ruoka: "Ruoka",
};

export const lajiNimi = (laji: string) => LAJI_NIMI[laji] ?? laji.charAt(0).toUpperCase() + laji.slice(1);

export const KUUKAUDET = [
  "tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu",
  "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu",
] as const;

/** Kuukauden osoiteosa (ilman ääkkösiä): "kesakuu", "heinakuu". */
export const kuukausiSlug = (i: number) => KUUKAUDET[i].replace(/ä/g, "a");
