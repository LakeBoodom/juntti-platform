// KUVAVISAT 2.0 (2026-09-17) — kokoelmasivun datakerros ja variaatiomalli.
//
// Korvaa vanhan kortistoruudukon (kokoelma/[collection]/page.tsx, kuvavisa-haara):
// jokainen kategoria avaa nyt listan VISAVARIAATIOITA (vaikeustaso + lipuilla
// maanosa) sen sijaan että kortti käynnistäisi pelin suoraan. Design:
// "Kuvavisat-2026-design.html" näkymät 1a (työpöytä) ja 1b (mobiili).
//
// Kaikki luvut tulevat kannasta — designin esimerkkiluvut (2 900 kuvaa,
// 28 variaatiota) EIVÄT ole tuotantototuus. 2026-09-17 aktivoinnin jälkeen
// kannassa on 669 aktiivista kuvaa kahdeksassa kategoriassa.

import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";

/** Pienin kuvamäärä jolla variaatio näytetään. Kierros on enintään 12 kuvaa
    (ks. /peli getKuvavisat(..., 12)), joten alle kymmenen kuvan variaatio
    tuottaisi näkyvästi lyhyen pelin — se piilotetaan listalta kokonaan.
    2026-09-17 tämä pudottaa: kasvit/vaikea (0), linnut/vaikea (6),
    maalaukset/vaikea (7), kasvit/helppo (8). */
export const MIN_VARIAATIO = 10;

/** Vaikeustasot kannan `difficulty`-arvoina. `supervaikea` EI ole käytössä —
    Heikin päätös 2026-09-17: kolme tasoa riittää, designin neljäs taso jää pois. */
export const TASOT = [
  { key: "helppo", label: "Helpot", jarjestys: 1 },
  { key: "keski", label: "Keskivaikeat", jarjestys: 2 },
  { key: "vaikea", label: "Vaikeat", jarjestys: 3 },
] as const;

/** Maanosaryhmät lipuille. Kannan `tag` pitää Oseanian erillään (3 lippua), mutta
    UI yhdistää sen Aasiaan — Heikin päätös 2026-09-17: kolmen kuvan variaatio ei
    ole pelattava. Kun Oseanian lippuja tulee lisää, ryhmä irtoaa omakseen tästä
    taulukosta ILMAN kannan uudelleentagitystä. */
export const MAANOSAT = [
  { key: "eurooppa", label: "Euroopan", tagit: ["Eurooppa"] },
  { key: "aasia", label: "Aasian ja Oseanian", tagit: ["Aasia", "Oseania"] },
  { key: "afrikka", label: "Afrikan", tagit: ["Afrikka"] },
  { key: "amerikka", label: "Amerikan", tagit: ["Amerikka"] },
] as const;

export type KuvaSovitus = "contain" | "cover";

export type KategoriaMeta = {
  /** kannan `type` */
  type: string;
  /** Designin otsikko kortissa (BRAND.md §8: max 45 merkkiä) */
  otsikko: string;
  /** Designin kuvaus (BRAND.md §8: max 60 merkkiä) */
  kuvaus: string;
  /** Yksikkö lukemassa: "143 lippua" */
  yksikko: (n: number) => string;
  /** Variaatioiden nimissä käytetty perussana: "Helpot LIPUT" */
  monikko: string;
  /** Kategoriaväri (BRAND.md §1.3 — vain merkki, hehku ja hairline) */
  accent: string;
  /** BRAND.md §5: grafiikka (lippu, vaakuna) contain vaalealla levyllä,
      valokuva cover. Design käyttää coveria kaikkialla, mutta se rajaisi
      lipun ja vaakunan reunoilta — BRAND.md voittaa (Heikin linjaus). */
  sovitus: KuvaSovitus;
  /** Onko kategorialla maanosaryhmittely (vain liput on tagitettu) */
  maanosat?: boolean;
  /** object-position esikatselukuville. Henkilökuvissa 50% 18% — muuten kasvot
      jäävät 16:10-rajauksen alle (Claude Designin korjaus, kohta 5). */
  kuvaKohdistus?: string;
};

/** Kahdeksan kategoriaa designin järjestyksessä (1a: liput → vaakunat → linnut →
    eläimet → maalaukset → rakennukset → henkilöt → kasvit). Kortiston nimi on
    Rakennukset — EI "nähtävyydet" (Heikin päätös 1, 17.9.2026), vaikka
    kokonaissuunnitelman design käytti sitä sanaa. */
export const KATEGORIAT: KategoriaMeta[] = [
  {
    type: "liput",
    otsikko: "Maiden liput",
    kuvaus: "Tunnista maailman liput maanosittain.",
    yksikko: (n) => `${n} lippua`,
    monikko: "liput",
    accent: "#22D3EE",
    sovitus: "contain",
    maanosat: true,
  },
  {
    type: "vaakunat",
    otsikko: "Vaakunat",
    kuvaus: "Maakuntien, kaupunkien ja kuntien vaakunat.",
    yksikko: (n) => `${n} vaakunaa`,
    monikko: "vaakunat",
    accent: "#F2C874",
    sovitus: "contain",
  },
  {
    type: "linnut",
    otsikko: "Suomen linnut",
    kuvaus: "Siivet, nokat ja höyhenpuvut lähikuvassa.",
    yksikko: (n) => `${n} lintua`,
    monikko: "linnut",
    accent: "#4ADE80",
    sovitus: "cover",
  },
  {
    type: "elaimet",
    otsikko: "Eläimet",
    kuvaus: "Lajit lähikuvassa — tutuista harvinaisiin.",
    yksikko: (n) => `${n} eläintä`,
    monikko: "eläimet",
    accent: "#2FD9A5",
    sovitus: "cover",
  },
  {
    type: "maalaukset",
    otsikko: "Maalaukset",
    kuvaus: "Klassikot ja tekijät tunnistettavana.",
    yksikko: (n) => `${n} maalausta`,
    monikko: "maalaukset",
    accent: "#E85D9E",
    sovitus: "contain",
  },
  {
    type: "rakennukset",
    otsikko: "Rakennukset",
    kuvaus: "Torneista temppeleihin — tunnista rakennus kuvasta.",
    yksikko: (n) => `${n} rakennusta`,
    monikko: "rakennukset",
    accent: "#F5C462",
    sovitus: "cover",
  },
  {
    type: "henkilot",
    otsikko: "Henkilöt",
    kuvaus: "Kasvot ja nimet historiasta nykypäivään.",
    yksikko: (n) => `${n} henkilöä`,
    monikko: "henkilöt",
    accent: "#F0A24B",
    sovitus: "cover",
    kuvaKohdistus: "50% 18%",
  },
  {
    type: "kasvit",
    otsikko: "Suomen kasvit ja puut",
    kuvaus: "Lehti, kukka ja kaarna tunnistettavana.",
    yksikko: (n) => `${n} kasvia`,
    monikko: "kasvit",
    accent: "#B6FF3C",
    sovitus: "cover",
  },
];

export type Variaatio = {
  key: string;
  /** "Helpot liput", "Euroopan liput", "Kaikki liput" */
  label: string;
  kuvia: number;
  href: string;
  /** Kaikki-variaatio korostuu listan lopussa (design 1a) */
  kaikki?: boolean;
};

export type KategoriaData = {
  meta: KategoriaMeta;
  kuvia: number;
  /** Kaksi esikatselukuvaa kortin ylälaitaan (design 1a: 2 kuvan ruudukko) */
  esikatselut: string[];
  variaatiot: Variaatio[];
};

type Rivi = { type: string; difficulty: string | null; tag: string | null; image_url: string; sort_order: number };

/**
 * Hakee kokoelmasivun koko datan yhdellä kyselyllä ja aggregoi sen selaimen
 * ulkopuolella. 669 riviä × 5 kenttää on pieni — kahdeksan erillistä
 * count-kyselyä olisi kalliimpi ja hitaampi kuin yksi haku + JS-laskenta.
 */
export async function getKuvavisatHub(): Promise<{ kategoriat: KategoriaData[]; kuviaYhteensa: number; variaatioitaYhteensa: number }> {
  const sb = getSupabase();
  if (!sb) return { kategoriat: [], kuviaYhteensa: 0, variaatioitaYhteensa: 0 };
  const siteId = await getSiteId();
  if (!siteId) return { kategoriat: [], kuviaYhteensa: 0, variaatioitaYhteensa: 0 };

  const { data } = await sb
    .from("kuvavisas")
    .select("type, difficulty, tag, image_url, sort_order")
    .eq("site_id", siteId)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const rivit = (data ?? []) as Rivi[];

  const kategoriat: KategoriaData[] = [];
  for (const meta of KATEGORIAT) {
    const omat = rivit.filter((r) => r.type === meta.type);
    if (omat.length === 0) continue; // tyhjä kategoria ei näy lainkaan

    const variaatiot: Variaatio[] = [];

    for (const taso of TASOT) {
      const n = omat.filter((r) => r.difficulty === taso.key).length;
      if (n < MIN_VARIAATIO) continue;
      variaatiot.push({
        key: `taso-${taso.key}`,
        label: `${taso.label} ${meta.monikko}`,
        kuvia: n,
        href: `/peli?kuvavisa=${meta.type}&taso=${taso.key}`,
      });
    }

    if (meta.maanosat) {
      for (const m of MAANOSAT) {
        const n = omat.filter((r) => r.tag && (m.tagit as readonly string[]).includes(r.tag)).length;
        if (n < MIN_VARIAATIO) continue;
        variaatiot.push({
          key: `maanosa-${m.key}`,
          label: `${m.label} ${meta.monikko}`,
          kuvia: n,
          href: `/peli?kuvavisa=${meta.type}&maanosa=${m.key}`,
        });
      }
    }

    variaatiot.push({
      key: "kaikki",
      label: `Kaikki ${meta.monikko}`,
      kuvia: omat.length,
      href: `/peli?kuvavisa=${meta.type}`,
      kaikki: true,
    });

    kategoriat.push({
      meta,
      kuvia: omat.length,
      esikatselut: omat.slice(0, 2).map((r) => r.image_url),
      variaatiot,
    });
  }

  return {
    kategoriat,
    kuviaYhteensa: kategoriat.reduce((s, k) => s + k.kuvia, 0),
    variaatioitaYhteensa: kategoriat.reduce((s, k) => s + k.variaatiot.length, 0),
  };
}

/**
 * T4 (UX-korjaus 17.9.2026): variaation nimi pelisivulle. Kokoelmasivun linkki lupaa
 * "Afrikan liput", mutta pelisivu näytti silti "Lippuvisa" — sama nimi molemmissa,
 * myös <title>-tagissa ja jakoteksteissä. Palauttaa null kun kortisto pelataan
 * kokonaan (silloin käytetään kortiston omaa nimeä).
 */
export function variaationNimi(type: string, taso?: string | null, maanosaKey?: string | null): string | null {
  const meta = KATEGORIAT.find((k) => k.type === type);
  if (!meta) return null;
  if (maanosaKey) {
    const m = MAANOSAT.find((x) => x.key === maanosaKey);
    if (m) return `${m.label} ${meta.monikko}`;
  }
  if (taso) {
    const t = TASOT.find((x) => x.key === taso);
    if (t) return `${t.label} ${meta.monikko}`;
  }
  return null;
}

/** Variaatioiden ryhmittely designin 1a-listaan: vaikeustasot ensin, sitten maanosat. */
export function ryhmiteltyVariaatiot(v: Variaatio[]): Array<{ label: string | null; items: Variaatio[] }> {
  const tasot = v.filter((x) => x.key.startsWith("taso-"));
  const maanosat = v.filter((x) => x.key.startsWith("maanosa-"));
  const kaikki = v.filter((x) => x.kaikki);
  const ryhmat: Array<{ label: string | null; items: Variaatio[] }> = [];
  if (tasot.length > 0) ryhmat.push({ label: "Vaikeustaso", items: tasot });
  if (maanosat.length > 0) ryhmat.push({ label: "Maanosat", items: maanosat });
  if (kaikki.length > 0) ryhmat.push({ label: null, items: kaikki });
  return ryhmat;
}

/* ── VIIKKOVISA (17.9.2026, Heikin pyyntö: "tee viikkovisa taulupohjaisena") ──
   15 kuvaa kaikista kahdeksasta kortistosta, sama visa kaikille koko viikon,
   vaihtuu maanantaina Suomen aikaa. Sarja on lukittu kantaan
   (kuvavisa_viikot); arvonnan tekee kuvavisa_viikon_kuvat(), joka luo rivin
   laiskasti ensimmäisellä pyynnöllä — alustalla ei ole vielä ajastimia.
   Ks. supabase/migrations/20260917_kuvavisa_viikkovisa.sql. */

export const VIIKKOVISA_KUVIA = 15;

export type Viikkovisa = { vuosi: number; viikko: number; kuvaIdt: string[] };

export async function getViikkovisa(): Promise<Viikkovisa | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const siteId = await getSiteId();
  if (!siteId) return null;

  /* packages/db/types.ts ei tunne funktiota (generoitu tiedosto on jäljessä:
     38 taulua, kannassa 149) → tyypittämätön rpc-kutsu ja käsin kuvattu rivi.
     Sama kierto kuin lib/haaste.ts:ssä; types.ts generoidaan omana passinaan. */
  const rpc = (sb as unknown as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  }).rpc;
  const { data, error } = await rpc("kuvavisa_viikon_kuvat", { p_site_id: siteId });
  if (error) return null;
  const rivi = (Array.isArray(data) ? data[0] : data) as
    | { vuosi: number; viikko: number; idt: string[] | null }
    | null
    | undefined;
  if (!rivi || !rivi.idt || rivi.idt.length === 0) return null;
  return { vuosi: rivi.vuosi, viikko: rivi.viikko, kuvaIdt: rivi.idt };
}

/** Kuvalevyn sävy kortiston tyypin mukaan — viikkovisassa kuvat tulevat
    kaikista kortistoista, joten sävy ratkaistaan kysymys kerrallaan. */
export function levynSavy(type: string): "vaalea" | "tumma" {
  return KATEGORIAT.find((k) => k.type === type)?.sovitus === "contain" ? "vaalea" : "tumma";
}
