// KUMPI? 2.0 — teemat (brief 20.11.2026, A3). Teema on suodatin: pool (kindit + rajaus) ja sallitut attribuutit.
// Hubin kuusi ryhmää (Heikki 20.11.): jääkiekolla kolme korttia, 17 seuraa vain Oma seura -valinnasta.
// Puhdas moduuli: käytetään palvelimella, selaimessa ja laatuportissa (scripts/kumpi-laatu.ts).

export type Ryhma = "jaakiekko" | "urheilu" | "suomi" | "luonto" | "maailma" | "ihmiset";

export const RYHMAT: Array<{ avain: Ryhma; nimi: string }> = [
  { avain: "jaakiekko", nimi: "Jääkiekko" },
  { avain: "urheilu", nimi: "Urheilu" },
  { avain: "suomi", nimi: "Suomi" },
  { avain: "luonto", nimi: "Luonto" },
  { avain: "maailma", nimi: "Maailma" },
  { avain: "ihmiset", nimi: "Ihmiset" },
];

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
  | { tapa: "kind"; kinds: string[] }
  /** Pelaajat, joilla on entity_facts-rivejä (legendat). */
  | { tapa: "legendat" }
  /** Kaikki pelaajat, joilla on uran liiga_games. */
  | { tapa: "liiga" }
  /** Pelaajat, joilla on played_for-suhde seuraan. */
  | { tapa: "seura"; seura: string }
  /** Henkilöt, jotka on merkitty suomalaisiksi (celebrities.suomalainen). */
  | { tapa: "suomalaiset" };

export type Teema = {
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
    attrs: [...LIIGA_URA, "liiga_debut", "liiga_seasons", ...NHL, ...SAAVUTUS, "nt_games", "nt_points", ...TAUSTA],
  },
  {
    slug: "liiga", nimi: "Liiga", ryhma: "jaakiekko", pooli: { tapa: "liiga" },
    attrs: [...LIIGA_URA, "liiga_debut", "liiga_seasons", "liiga_clubs", "played_for_club", ...TAUSTA],
  },
  { slug: "olympiavoittajat", nimi: "Olympiavoittajat", ryhma: "urheilu", pooli: { tapa: "kind", kinds: ["person"] }, attrs: ["oly_golds", "oly_medals"] },
  { slug: "f1", nimi: "F1", ryhma: "urheilu", pooli: { tapa: "kind", kinds: ["person"] }, attrs: ["f1_titles", "f1_wins", "f1_poles"] },
  { slug: "jalkapallo", nimi: "Jalkapallo", ryhma: "urheilu", pooli: { tapa: "kind", kinds: ["person"] }, attrs: ["fb_caps", "fb_intl_goals"] },
  { slug: "kaupungit", nimi: "Kaupungit", ryhma: "suomi", pooli: { tapa: "kind", kinds: ["city"] }, attrs: ["population", "founded_year"] },
  { slug: "maakunnat", nimi: "Maakunnat", ryhma: "suomi", pooli: { tapa: "kind", kinds: ["region"] }, attrs: ["region_pop", "region_area"] },
  { slug: "jarvet", nimi: "Järvet", ryhma: "luonto", pooli: { tapa: "kind", kinds: ["lake"] }, attrs: ["area_km2"] },
  { slug: "joet", nimi: "Joet", ryhma: "luonto", pooli: { tapa: "kind", kinds: ["river"] }, attrs: ["river_length"] },
  { slug: "kansallispuistot", nimi: "Kansallispuistot", ryhma: "luonto", pooli: { tapa: "kind", kinds: ["park"] }, attrs: ["park_area_km2", "park_founded", "park_visits"] },
  { slug: "majakat", nimi: "Majakat", ryhma: "luonto", pooli: { tapa: "kind", kinds: ["lighthouse"] }, attrs: ["lh_built", "lh_height_m"] },
  { slug: "tunturit", nimi: "Tunturit", ryhma: "luonto", pooli: { tapa: "kind", kinds: ["fell"] }, attrs: ["height_m"] },
  { slug: "maat", nimi: "Maat", ryhma: "maailma", pooli: { tapa: "kind", kinds: ["country"] }, attrs: ["country_area", "country_pop"] },
  { slug: "vuoret", nimi: "Vuoret", ryhma: "maailma", pooli: { tapa: "kind", kinds: ["mountain"] }, attrs: ["mountain_height"] },
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
