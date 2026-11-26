// KUMPI? 2.0 — teemat (brief 20.11.2026, A3). Teema on suodatin: pool (kindit + rajaus) ja sallitut attribuutit.
// Hubin kuusi ryhmää (Heikki 20.11.): jääkiekolla kolme korttia, 17 seuraa vain Oma seura -valinnasta.
// Puhdas moduuli: käytetään palvelimella, selaimessa ja laatuportissa (scripts/kumpi-laatu.ts).

import type { KEnt } from "./tyypit";

/** SM-sarjat-teeman seurojen group_keyt (Heikki 23.11.2026). Myös lib/kumpi/data.ts lataa vain nämä + Liigan. */
export const SM_SARJAT = ["korisliiga", "lentopallo-mestaruusliiga", "superpesis", "veikkausliiga"];

/** Suomalainen järvi tai joki: tags sisältää "suomi" (Cowork 20.11.2026; rajavesillä myös "rajavesi"). Uusi järvi tai
 *  joki menee oikeaan teemaan tagin perusteella, ilman nimilistaa. */
export const suomenVesi = (e: KEnt) => e.tags.includes("suomi");

export type Ryhma = "yleistieto" | "jaakiekko" | "urheilu" | "suomi" | "luonto" | "maailma" | "ihmiset" | "historia" | "viihde";

/** Hubin ryhmäjärjestys (Heikki 20.11.2026): jääkiekko ei alussa, jotta hubi ei näytä jääkiekkopeliltä. */
export const RYHMAT: Array<{ avain: Ryhma; nimi: string }> = [
  { avain: "yleistieto", nimi: "Yleistieto" },
  { avain: "suomi", nimi: "Suomi" },
  { avain: "luonto", nimi: "Luonto" },
  { avain: "urheilu", nimi: "Urheilu" },
  { avain: "jaakiekko", nimi: "Jääkiekko" },
  { avain: "maailma", nimi: "Maailma" },
  { avain: "ihmiset", nimi: "Ihmiset" },
  /* Historia (Heikki 26.11.2026, HISTORIA_TAPAHTUMAT_2026_11_26): tapahtumien vuodet. */
  { avain: "historia", nimi: "Historia" },
  /* Viihde (Heikki 24.11.2026): ensimmäisenä teemana Musiikki. */
  { avain: "viihde", nimi: "Viihde" },
];

/** Hubin rivikuvat (288 × 216, scripts/rivikuvat.py): sivuston omia kopioita, krediitit jo /kuvien-lahteet-sivulla. */
/** Hubin rivin tietorivi (Heikki 20.11.2026: kirjoitetaan, kun kokoelma on vahvistettu). Mitä teemassa verrataan;
 *  ei lukumääriä. */
export const KUVAUKSET: Record<string, string> = {
  yleistieto: "Kaikki aiheet sekaisin luonnosta urheiluun ja politiikkaan",
  suomi: "Kaupunkien ja maakuntien asukasluvut, iät ja pinta-alat",
  luonto: "Eläimet, järvet, joet, tunturit, kansallispuistot ja majakat",
  urheilu: "Olympia- ja MM-mitalit, F1-mestarit ja SM-sarjojen seurat",
  "suomikiekon-legendat": "Stanley Cupit, MM-kullat ja NHL-urat",
  liiga: "Ottelut, maalit, pisteet ja seurat",
  maailma: "Maat, vuoret, järvet ja joet",
  ihmiset: "Tunnetut suomalaiset ja syntymäpaikat, kansanedustajat, pääministerit ja presidentit",
  musiikki: "Spotify-kuuntelut ja yhtyeiden perustamisvuodet",
  historia: "Suomen ja maailman historian tapahtumat aikajärjestyksessä",
};

/* Heikki 22.11.2026: Liiga ja Oma seura Liigan otteluvalokuviin (Manse- ja Satakunnan derby), Barkov Suomikiekon
   legendoille, Luonto ja Suomi samat kuin etusivun Luonto- ja Kaupungit-korteissa, Urheilu Iivo Niskanen. */
export const RIVIKUVAT: Record<string, string> = {
  suomi: "/20/rivi/kokoelma-kaupungit.webp",
  luonto: "/20/rivi/kokoelma-luonto.webp",
  "suomikiekon-legendat": "/20/rivi/kokoelma-jaakiekko.webp",
  liiga: "/20/rivi/kumpi-liiga.webp",
  "oma-seura": "/20/rivi/kumpi-oma-seura.webp",
  yleistieto: "/20/rivi/mega-suuri-mega-50.webp",
  urheilu: "/20/rivi/kumpi-urheilu.webp",
  ihmiset: "/20/rivi/kokoelma-tunnetut-henkilot.webp",
  maailma: "/20/rivi/kumpi-vuoret.webp",
  // Eppu Normaali, Rakuuna Rock 2014 (Heikki 24.11.2026); krediitti rivillä eppu-normaali-tietovisa.
  musiikki: "/20/rivi/kumpi-musiikki.webp",
  // Sama kuin kokoelmasivun Historia-kortissa (Mannerheim, SA-kuva); krediitti rivillä aihe-historia.
  historia: "/20/rivi/kokoelma-historia.webp",
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
  /** Paino yhdistelmäteemassa (oletus 1): Liiga-seurat 0,4, jotta seurakysymyksiä on noin kolmannes Liigasta. */
  paino?: number;
  /** Yhdistelmäteema (Yleistieto, Ihmiset, Urheilu): kysymykset arvotaan näistä perusteemoista (slugit), kukin oman
   *  poolinsa säännöillä. pooli ja attrs eivät silloin ole käytössä. */
  osat?: string[];
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

/** Perusteemat: yksi pooli ja omat attribuutit. Hubissa näkyvät Suomi, Luonto, Maailma, Legendat ja Liiga; muut ovat
 *  yhdistelmäteemojen osia (Heikki 20.11.2026: kokoelma tiivistetään, jotta kierroksessa on vaihtelua). */
export const PERUSTEEMAT: Teema[] = [
  {
    slug: "suomikiekon-legendat", nimi: "Suomikiekon legendat", ryhma: "jaakiekko", pooli: { tapa: "legendat" },
    // Järjestys ratkaisee vain hubin tietorivin (kolme ensimmäistä avainsanaa): legendoille ominaiset ensin.
    attrs: [...new Set(["stanley_cups", "wc_golds", "nhl_points", ...SAAVUTUS, ...NHL, ...LIIGA_URA, "liiga_debut", "liiga_seasons", "nt_games", "nt_points", ...TAUSTA])],
  },
  {
    slug: "liiga-pelaajat", nimi: "Liiga", ryhma: "jaakiekko", pooli: { tapa: "liiga" },
    attrs: [...LIIGA_URA, "liiga_debut", "liiga_seasons", "liiga_clubs", "played_for_club", ...TAUSTA],
  },
  /* Liigan 17 nykyistä seuraa (Cowork 20.11.2026). founded_hockey jää pois: perustamisvuosi on osalla emoseuran
     (JYP, HPK) tai edeltäjän vuosi (Kiekko-Espoo, Pelicans, Tappara-nimi 1955), joten vertailu ei ole yksiselitteinen. */
  {
    slug: "liiga-seurat", nimi: "Liiga-seurat", ryhma: "jaakiekko", paino: 0.4,
    pooli: { tapa: "kind", kinds: ["team"], rajaus: (e) => e.ryhma === "liiga" },
    attrs: ["titles", "has_title", "first_title_year", "latest_title_year", "home_capacity", "is_founding_member", "liiga_since", "city_pop"],
  },
  /* MM-attribuutit (Heikki 22.11.2026) ovat vain osalla urheilijoista: pari arvotaan vain niistä, joilla arvo on
     (kelpaa() generaattorissa), puuttuvaa ei lueta nollaksi. Kannassa oleva 0 MM-kultaa on oikea arvo (mitalisti ilman kultaa). */
  { slug: "olympiavoittajat", nimi: "Olympiavoittajat", ryhma: "urheilu", pooli: { tapa: "kind", kinds: ["person"] },
    attrs: ["oly_golds", "oly_medals", "oly_games", "wch_golds", "wch_medals"] },
  /* SM-sarjat (Heikki 23.11.2026, URHEILU_SEURAMESTARUUDET_2026_11_23): koris-, lentis-, pesis- ja jalkapalloseurojen
     miesten Suomen mestaruudet. Laji on aina kysymyksessä, ja kukin attribuutti on vain oman lajinsa seuroilla, joten
     pari on aina saman lajin seurat. Viimeisin mestaruus vain seuroilla, joilla mestaruus on. */
  {
    slug: "sm-seurat", nimi: "SM-sarjat", ryhma: "urheilu",
    pooli: { tapa: "kind", kinds: ["team"], rajaus: (e) => SM_SARJAT.includes(e.ryhma ?? "") },
    attrs: ["koripallo_titles_m", "lentopallo_titles_m", "pesapallo_titles_m", "jalkapallo_titles_m",
      "koripallo_latest_title_m", "lentopallo_latest_title_m", "pesapallo_latest_title_m", "jalkapallo_latest_title_m"],
  },
  { slug: "f1", nimi: "F1", ryhma: "urheilu", pooli: { tapa: "kind", kinds: ["person"] }, attrs: ["f1_titles", "f1_wins", "f1_poles"] },
  /* Jalkapallo pois (Heikki 20.11.2026), kunnes kannassa on selvästi enemmän legendoja kuin nykypelaajia.
     Kaupungit ja maakunnat yhdeksi Suomi-teemaksi (Heikki 20.11.), kunnes niistä on enemmän erilaista dataa. */
  { slug: "suomi", nimi: "Suomi", ryhma: "suomi", pooli: { tapa: "kind", kinds: ["city", "region"] }, attrs: ["population", "founded_year", "region_pop", "region_area"] },
  /* Luonto ja Maailma yhtenä teemana kumpikin (Heikki 20.11.2026): yksin järvet "eivät kanna", ja yhdistettynä
     kysymyksiin tulee vaihtelua. Luonnossa järvet ja joet vain Suomesta (tags "suomi"), maailman järvet ja joet
     Maailmassa. Pooli on kindien yhdiste; kukin kysymys vertaa vain saman attribuutin kohteita. */
  {
    slug: "luonto", nimi: "Luonto", ryhma: "luonto",
    pooli: { tapa: "kind", kinds: ["lake", "river", "park", "lighthouse", "fell", "species"], rajaus: (e) => (e.kind !== "lake" && e.kind !== "river") || suomenVesi(e) },
    // Eläimet (Cowork 20.11.2026): elinikä ja kanta verrataan vain saman mittarin lajien kesken (metric: pisin_todettu /
    // tyypillinen, paria / yksilöä), ks. mittaritSopivat generaattorissa. Huippunopeus (4 lajia) jää pois.
    attrs: ["area_km2", "river_length", "height_m", "park_area_km2", "park_founded", "park_visits", "lh_built", "lh_height_m",
      "length_cm", "species_weight_kg", "lifespan_years", "wingspan_cm", "population_fi"],
  },
  {
    slug: "maailma", nimi: "Maailma", ryhma: "maailma",
    pooli: { tapa: "kind", kinds: ["country", "mountain", "lake", "river"], rajaus: (e) => (e.kind !== "lake" && e.kind !== "river") || !suomenVesi(e) },
    // Maiden lisätiedot (Heikki 26.11.2026, MAAT_DATA_2026_11_26): EU- ja Nato-vuosi vain jäsenmailla ja korkein kohta
    // 118 maalla, joten näissä pari on aina kaksi jäsenmaata tai kaksi maata, joilla tieto on.
    attrs: ["country_area", "country_pop", "gdp_per_capita", "life_expectancy", "country_highpoint", "eu_join_year", "nato_join_year",
      "mountain_height", "area_km2", "river_length"],
  },
  /* Musiikki (Heikki 24.11.2026, VIIHDE_ERA3_SPOTIFY_2026_11_23): kappaleiden Spotify-kuuntelut Suomessa ja maailmalla
     (kind song) sekä yhtyeiden perustamisvuodet (kind artist). music_sales_fi on kannassa pois käytöstä. Kukin attribuutti
     on vain osalla kohteista, joten pari on aina kaksi kappaletta tai kaksi yhtyettä. */
  {
    // Kappaleen nimessä on esittäjä ja nimi ("Gettomasa: Shamppanjadieetillä"): sana yli 18 merkkiä (laatu.ts MAX_SANA)
    // ei mahdu korttiin @320, joten tällainen kappale jää pois.
    slug: "musiikki", nimi: "Musiikki", ryhma: "viihde",
    pooli: { tapa: "kind", kinds: ["song", "artist"], rajaus: (e) => e.nimi.split(/[\s\-–]+/).every((w) => w.length <= 18) },
    attrs: ["spotify_streams_fi", "spotify_streams_global", "band_founded"],
  },
  // Syntymäpaikka (Heikki 24.11.2026): born_in-suhteet, kysymys "Kumpi heistä on syntynyt Tampereella?".
  { slug: "tunnetut-suomalaiset", nimi: "Tunnetut suomalaiset", ryhma: "ihmiset", pooli: { tapa: "suomalaiset" }, attrs: ["birth", "born_in_city"] },
  /* Historia (Heikki 26.11.2026): tapahtumat (kind event, group_key historia), attribuutti year. Saman vuoden parit
     eivät synny (tasapeli ja min_gap 2), eikä saman aiheen alku ja loppu ("maailmansota alkoi / päättyi") muodosta paria
     (samaAihe generaattorissa). */
  {
    slug: "historia", nimi: "Historia", ryhma: "historia",
    // Nimen sana yli 18 merkkiä ("F1-maailmanmestaruuden", laatu.ts MAX_SANA) ei mahdu korttiin @320: jää pois kuten Musiikissa.
    pooli: { tapa: "kind", kinds: ["event"], rajaus: (e) => e.ryhma === "historia" && e.nimi.split(/[\s\-–]+/).every((w) => w.length <= 18) },
    attrs: ["year"],
  },
  { slug: "politiikka", nimi: "Politiikka", ryhma: "ihmiset", pooli: { tapa: "kind", kinds: ["person"] }, attrs: ["mp_first_year", "mp_years", "pm_days", "pm_start", "pres_start"] },
];


const sekoitus = (slug: string, nimi: string, ryhma: Ryhma, osat: string[]): Teema => ({
  slug, nimi, ryhma, osat, pooli: { tapa: "kind", kinds: [] }, attrs: [],
});

/** Yleistiedon osat: kaikki perusteemat. Jääkiekkoa enintään 2/10 ja kustakin muusta ryhmästä enintään 3/10. */
export const YLEISTIETO_OSAT = ["suomi", "luonto", "maailma", "tunnetut-suomalaiset", "politiikka", "olympiavoittajat", "f1", "suomikiekon-legendat", "liiga-pelaajat", "liiga-seurat", "historia"];

/** Hubin seitsemän riviä (Heikki 20.11.2026) + Oma seura. Järjestys hubissa tulee RYHMAT-listasta. */
export const TEEMAT: Teema[] = [
  sekoitus("yleistieto", "Yleistieto", "yleistieto", YLEISTIETO_OSAT),
  PERUSTEEMAT.find((t) => t.slug === "suomi")!,
  PERUSTEEMAT.find((t) => t.slug === "luonto")!,
  sekoitus("urheilu", "Urheilu", "urheilu", ["olympiavoittajat", "f1", "sm-seurat"]),
  PERUSTEEMAT.find((t) => t.slug === "suomikiekon-legendat")!,
  /* Liiga = pelaajat + seurat (Heikki 21.11.2026: Coworkin seuradata). Slug pysyy "liiga" (sivu, visakysymykset). */
  sekoitus("liiga", "Liiga", "jaakiekko", ["liiga-pelaajat", "liiga-seurat"]),
  PERUSTEEMAT.find((t) => t.slug === "maailma")!,
  sekoitus("ihmiset", "Ihmiset", "ihmiset", ["tunnetut-suomalaiset", "politiikka"]),
  PERUSTEEMAT.find((t) => t.slug === "historia")!,
  PERUSTEEMAT.find((t) => t.slug === "musiikki")!,
];

/** Ryhmän enimmäismäärä yhdistelmäkierroksessa (Yleistieto). */
export const RYHMAN_MAKSIMI: Partial<Record<Ryhma, number>> = { jaakiekko: 2 };
export const RYHMAN_OLETUSMAKSIMI = 3;

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

/** Hubin teema slugilla (sivut /kumpi/[teema]). */
export const teemaSlugilla = (slug: string): Teema | null => TEEMAT.find((t) => t.slug === slug) ?? null;

/** Mikä tahansa teema (myös yhdistelmän osa ja seura) slugilla: generaattori ja laatuportti. */
export function mikaTahansaTeema(slug: string): Teema | null {
  if (slug.startsWith("seura-")) return seuraTeema(slug.slice(6));
  return TEEMAT.find((t) => t.slug === slug) ?? PERUSTEEMAT.find((t) => t.slug === slug) ?? null;
}

/** Kaikki pelattavat teemat (hubin teemat + seurat) laatuporttia varten. */
export const KAIKKI_TEEMAT = (): Teema[] => [...TEEMAT, ...SEURAT.map((s) => seuraTeema(s.slug)!)];

export const onKiekko = (t: Teema) => t.ryhma === "jaakiekko";
