// KUMPI? 2.0 — teemat (brief 20.11.2026, A3). Teema on suodatin: pool (kindit + rajaus) ja sallitut attribuutit.
// Hubin kuusi ryhmää (Heikki 20.11.): jääkiekolla kolme korttia, 17 seuraa vain Oma seura -valinnasta.
// Puhdas moduuli: käytetään palvelimella, selaimessa ja laatuportissa (scripts/kumpi-laatu.ts).

import type { KEnt } from "./tyypit";

/** Suomen järvet ja joet (kannassa ei maa- eikä sijaintitietoa järville ja joille, 20.11.2026). Laatokka on Venäjällä,
 *  Iso Orjajärvi Kanadassa. Uusi suomalainen järvi tai joki lisätään tähän, muuten se menee Maailma-teemaan. */
export const SUOMEN_VEDET = new Set([
  "Saimaa", "Päijänne", "Inarijärvi", "Pielinen", "Oulujärvi", "Pihlajavesi", "Orivesi", "Haukivesi", "Keitele", "Kallavesi",
  "Puruvesi", "Puula", "Lokan tekojärvi", "Höytiäinen", "Näsijärvi", "Lappajärvi", "Vesijärvi", "Vanajavesi", "Keurusselkä",
  "Kilpisjärvi", "Tuusulanjärvi", "Bodominjärvi",
  "Kemijoki", "Iijoki", "Ounasjoki", "Luttojoki", "Kitinen", "Muonionjoki", "Kymijoki", "Simojoki", "Tornionjoki", "Ivalojoki",
  "Lapuanjoki", "Tenojoki", "Vuoksi", "Porvoonjoki", "Kyrönjoki", "Kokemäenjoki", "Loimijoki", "Paimionjoki", "Oulujoki",
  "Vantaanjoki", "Könkämäeno", "Aurajoki",
]);

export type Ryhma = "jaakiekko" | "urheilu" | "suomi" | "luonto" | "maailma" | "ihmiset";

/** Hubin ryhmäjärjestys (Heikki 20.11.2026): jääkiekko ei alussa, jotta hubi ei näytä jääkiekkopeliltä. */
export const RYHMAT: Array<{ avain: Ryhma; nimi: string }> = [
  { avain: "suomi", nimi: "Suomi" },
  { avain: "luonto", nimi: "Luonto" },
  { avain: "urheilu", nimi: "Urheilu" },
  { avain: "jaakiekko", nimi: "Jääkiekko" },
  { avain: "maailma", nimi: "Maailma" },
  { avain: "ihmiset", nimi: "Ihmiset" },
];

/** Hubin rivikuvat (288 × 216, scripts/rivikuvat.py): sivuston omia kopioita, krediitit jo /kuvien-lahteet-sivulla. */
export const RIVIKUVAT: Record<string, string> = {
  suomi: "/20/rivi/tupla-suomen-kaupungit.webp",
  luonto: "/20/rivi/kumpi-jarvet.webp",
  olympiavoittajat: "/20/rivi/kumpi-olympiavoittajat.webp",
  f1: "/20/rivi/kumpi-f1.webp",
  "suomikiekon-legendat": "/20/rivi/kumpi-suomikiekon-legendat.webp",
  liiga: "/20/rivi/tupla-sm-liiga.webp",
  "oma-seura": "/20/rivi/kokoelma-jaakiekko.webp",
  maailma: "/20/rivi/kumpi-vuoret.webp",
  "tunnetut-suomalaiset": "/20/rivi/kokoelma-tunnetut-henkilot.webp",
  politiikka: "/20/rivi/kokoelma-vaalit.webp",
};

/** Jääkiekon jakauma kymmenen kysymyksen jaksossa (A2): 3 tilasto + 3 ura/seura + 2 saavutus + 2 tausta. */
export type KiekkoLuokka = "tilasto" | "ura" | "saavutus" | "tausta";
export const KIEKKO_JAKAUMA: Record<KiekkoLuokka, number> = { tilasto: 3, ura: 3, saavutus: 2, tausta: 2 };

export const KIEKKO_LUOKKA: Record<string, KiekkoLuokka> = {
  liiga_games: "tilasto", liiga_goals: "tilasto", liiga_assists: "tilasto", liiga_points: "tilasto",
  liiga_gk_wins: "tilasto", liiga_shutouts: "tilasto",
  nhl_games: "tilasto", nhl_goals: "tilasto", nhl_assists: "tilasto", nhl_points: "tilasto",
  nhl_gk_wins: "tilasto", nhl_shutouts: "tilasto",
  nt_games: "tilasto", nt_goals: "tilasto", nt_assists: "tilasto", nt_points: "tilasto",
  liiga_debut: "ura", liiga_seasons: "ura", liiga_clubs: "ura", nhl_debut: "ura", nhl_draft_pick: "ura",
  played_for_club: "ura", wc_tournaments: "ura",
  has_nhl: "saavutus", has_stanley_cup: "saavutus", has_wc_gold: "saavutus", oly_gold: "saavutus",
  stanley_cups: "saavutus", wc_golds: "saavutus",
  birth: "tausta", height_cm: "tausta",
};

/** Maalivahtien attribuutit: vain kahden maalivahdin pareille. */
export const MV_ATTR = new Set(["liiga_gk_wins", "liiga_shutouts", "nhl_gk_wins", "nhl_shutouts"]);
/** Kenttäpelaajien attribuutit: vain kahden kenttäpelaajan pareille. */
export const KP_ATTR = new Set([
  "liiga_goals", "liiga_assists", "liiga_points", "nhl_goals", "nhl_assists", "nhl_points",
  "nt_goals", "nt_assists", "nt_points", "shoots",
]);

/** Seurakohtaiset (scope = seura) attribuutit seurateemoissa. */
export const SEURA_SCOPE_ATTR = ["liiga_games", "liiga_goals", "liiga_assists", "liiga_points", "liiga_gk_wins", "liiga_shutouts"];

const LIIGA_URA = ["liiga_games", "liiga_goals", "liiga_assists", "liiga_points", "liiga_gk_wins", "liiga_shutouts"];
const NHL = ["nhl_games", "nhl_goals", "nhl_assists", "nhl_points", "nhl_gk_wins", "nhl_shutouts", "nhl_debut", "nhl_draft_pick"];
const SAAVUTUS = ["has_nhl", "has_stanley_cup", "has_wc_gold", "oly_gold", "stanley_cups", "wc_golds"];
const TAUSTA = ["birth", "height_cm"];

export type Pooli =
  | { tapa: "kind"; kinds: string[]; rajaus?: (e: KEnt) => boolean }
  /** Pelaajat, joilla on entity_facts-rivejä (legendat). */
  | { tapa: "legendat" }
  /** Kaikki pelaajat, joilla on uran liiga_games. */
  | { tapa: "liiga" }
  /** Pelaajat, joilla on played_for-suhde seuraan. */
  | { tapa: "seura"; seura: string }
  /** Henkilöt, jotka on merkitty suomalaisiksi (celebrities.suomalainen). */
  | { tapa: "suomalaiset" };

export type Teema = {
  /** Kuvat korteissa vain, jos teeman jokaisessa kysymyksessä on kuva (Heikki 20.11.2026: ei satunnaisesti).
   *  Yksikään nykyinen teema ei täytä ehtoa, joten kaikki ovat kuvattomia. */
  kuvat?: boolean;
  slug: string;
  nimi: string;
  ryhma: Ryhma;
  pooli: Pooli;
  attrs: string[];
  /** Hubin kortin kuvaton merkki (iso alkukirjain/lyhenne). */
  merkki?: string;
};

export const TEEMAT: Teema[] = [
  {
    slug: "suomikiekon-legendat", nimi: "Suomikiekon legendat", ryhma: "jaakiekko", pooli: { tapa: "legendat" },
    // Järjestys ratkaisee vain hubin tietorivin (kolme ensimmäistä avainsanaa): legendoille ominaiset ensin.
    attrs: [...new Set(["stanley_cups", "wc_golds", "nhl_points", ...SAAVUTUS, ...NHL, ...LIIGA_URA, "liiga_debut", "liiga_seasons", "nt_games", "nt_points", ...TAUSTA])],
  },
  {
    slug: "liiga", nimi: "Liiga", ryhma: "jaakiekko", pooli: { tapa: "liiga" },
    attrs: [...LIIGA_URA, "liiga_debut", "liiga_seasons", "liiga_clubs", "played_for_club", ...TAUSTA],
  },
  { slug: "olympiavoittajat", nimi: "Olympiavoittajat", ryhma: "urheilu", pooli: { tapa: "kind", kinds: ["person"] }, attrs: ["oly_golds", "oly_medals"] },
  { slug: "f1", nimi: "F1", ryhma: "urheilu", pooli: { tapa: "kind", kinds: ["person"] }, attrs: ["f1_titles", "f1_wins", "f1_poles"] },
  /* Jalkapallo pois (Heikki 20.11.2026), kunnes kannassa on selvästi enemmän legendoja kuin nykypelaajia.
     Kaupungit ja maakunnat yhdeksi Suomi-teemaksi (Heikki 20.11.), kunnes niistä on enemmän erilaista dataa. */
  { slug: "suomi", nimi: "Suomi", ryhma: "suomi", pooli: { tapa: "kind", kinds: ["city", "region"] }, attrs: ["population", "founded_year", "region_pop", "region_area"] },
  /* Luonto ja Maailma yhtenä teemana kumpikin (Heikki 20.11.2026): yksin järvet "eivät kanna", ja yhdistettynä
     kysymyksiin tulee vaihtelua. Luonnossa järvet ja joet vain Suomesta (SUOMEN_VEDET), maailman järvet ja joet
     Maailmassa. Pooli on kindien yhdiste; kukin kysymys vertaa vain saman attribuutin kohteita. */
  {
    slug: "luonto", nimi: "Luonto", ryhma: "luonto",
    pooli: { tapa: "kind", kinds: ["lake", "river", "park", "lighthouse", "fell"], rajaus: (e) => (e.kind !== "lake" && e.kind !== "river") || SUOMEN_VEDET.has(e.nimi) },
    attrs: ["area_km2", "river_length", "height_m", "park_area_km2", "park_founded", "park_visits", "lh_built", "lh_height_m"],
  },
  {
    slug: "maailma", nimi: "Maailma", ryhma: "maailma",
    pooli: { tapa: "kind", kinds: ["country", "mountain", "lake", "river"], rajaus: (e) => (e.kind !== "lake" && e.kind !== "river") || !SUOMEN_VEDET.has(e.nimi) },
    attrs: ["country_area", "country_pop", "mountain_height", "area_km2", "river_length"],
  },
  { slug: "tunnetut-suomalaiset", nimi: "Tunnetut suomalaiset", ryhma: "ihmiset", pooli: { tapa: "suomalaiset" }, attrs: ["birth"] },
  { slug: "politiikka", nimi: "Politiikka", ryhma: "ihmiset", pooli: { tapa: "kind", kinds: ["person"] }, attrs: ["mp_first_year", "mp_years", "pm_days", "pm_start"] },
];

/** Liigaseurat (Oma seura -valinta ja /kumpi/seura/[seura]). Nimi = fact_attributes.scope ja fact_entities.name. */
export const SEURAT: Array<{ slug: string; nimi: string }> = [
  { slug: "assat", nimi: "Ässät" },
  { slug: "hifk", nimi: "HIFK" },
  { slug: "hpk", nimi: "HPK" },
  { slug: "ilves", nimi: "Ilves" },
  { slug: "jokerit", nimi: "Jokerit" },
  { slug: "jukurit", nimi: "Jukurit" },
  { slug: "jyp", nimi: "JYP" },
  { slug: "kalpa", nimi: "KalPa" },
  { slug: "karpat", nimi: "Kärpät" },
  { slug: "kiekko-espoo", nimi: "Kiekko-Espoo" },
  { slug: "kookoo", nimi: "KooKoo" },
  { slug: "lukko", nimi: "Lukko" },
  { slug: "pelicans", nimi: "Pelicans" },
  { slug: "saipa", nimi: "SaiPa" },
  { slug: "sport", nimi: "Sport" },
  { slug: "tappara", nimi: "Tappara" },
  { slug: "tps", nimi: "TPS" },
];

export function seuraTeema(slug: string): Teema | null {
  const s = SEURAT.find((x) => x.slug === slug);
  if (!s) return null;
  return {
    slug: `seura-${s.slug}`,
    nimi: s.nimi,
    ryhma: "jaakiekko",
    pooli: { tapa: "seura", seura: s.nimi },
    // Seurakohtaiset tilastot (scope = seura, kysymykseen seuran inessiivi) + uran kaudet, seurat, debyytti ja tausta.
    attrs: [...SEURA_SCOPE_ATTR.map((k) => `${k}@seura`), "liiga_debut", "liiga_seasons", "liiga_clubs", ...TAUSTA],
  };
}

export const teemaSlugilla = (slug: string): Teema | null => TEEMAT.find((t) => t.slug === slug) ?? null;

/** Kaikki pelattavat teemat (hubin teemat + seurat) laatuporttia varten. */
export const KAIKKI_TEEMAT = (): Teema[] => [...TEEMAT, ...SEURAT.map((s) => seuraTeema(s.slug)!)];

export const onKiekko = (t: Teema) => t.ryhma === "jaakiekko";
