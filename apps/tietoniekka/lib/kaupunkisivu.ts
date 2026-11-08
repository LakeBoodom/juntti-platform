// KAUPUNKISIVUT v1 (TOTEUTUSBRIEF Kaupunkisivut v1 – rakenne ulos, 7.11.2026; CD "Tietoniekka_Kaupunkisivu" kierros 1).
// Data: taulu kaupungit (migraatio 20261203_kaupunkisivut) + quizzes.paikkakunnat + celebrities.birth_place.
//   /kaupunki/<slug>  kaupunkisivu (vain julkaistu = true; esikatselu- ja kehitysympäristössä myös julkaisemattomat)
//   /kaupunki         lista julkaistuista
//   /<slug>           308 → /kaupunki/<slug> (app/(tn20)/[lyhyt]/page.tsx)
// Visat ryhmitellään kategorian mukaan (RYHMAT). Henkilöt: syntymäpaikka (ennen pilkkua) = inessiivi tai vanha kunta.
// Koukku puuttuu → varateksti "Mitä tiedät {elatiivi}?" (CD:n sääntö). Kausinosto: quizzes.kausi = nykyinen kausi.
import { cache } from "react";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { helsinginPaiva } from "@/lib/aika";
import { visaHref } from "@/lib/visaHref";
import { henkiloHref } from "@/lib/henkiloSlug";
import { visanKorttikuva } from "@/lib/kokoelmat/visanKorttikuva";

export type Kaupunki = {
  slug: string;
  nimi: string;
  inessiivi: string;
  elatiivi: string;
  asukasnimitys: string | null;
  korttinimi: string | null;
  kaupunkivisa_quiz_id: string | null;
  tunnusrivi: string | null;
  hook: string | null;
  hook_og: string | null;
  hero_kuva: string | null;
  vaakuna_url: string | null;
  vanhat_kunnat: string[];
  julkaistu: boolean;
};

const KENTAT =
  "slug, nimi, inessiivi, elatiivi, asukasnimitys, korttinimi, kaupunkivisa_quiz_id, tunnusrivi, hook, hook_og, hero_kuva, vaakuna_url, vanhat_kunnat, julkaistu";

export const kaupunkiHref = (slug: string) => `/kaupunki/${slug}`;
export const KAUPUNGIT_LISTA = "/kaupunki";

/** Julkaisemattomat näkyvät esikatselussa ja kehityksessä (noindex), tuotannossa eivät. */
export const nayttaaJulkaisemattomat = () => process.env.VERCEL_ENV !== "production";

/** Heron koukku: kaupungin oma tai varateksti. */
export const kaupunginKoukku = (k: Pick<Kaupunki, "hook" | "elatiivi">) => k.hook?.trim() || `Mitä tiedät ${k.elatiivi}?`;
/** Jakokuvan koukku (≤ 32 merkkiä): oma tai varateksti. */
export const kaupunginKoukkuOg = (k: Pick<Kaupunki, "hook_og" | "elatiivi">) => k.hook_og?.trim() || `Mitä tiedät ${k.elatiivi}?`;

/* eslint-disable @typescript-eslint/no-explicit-any */
const sbAny = () => getSupabase() as any;

/** Kaikki kaupungit (35 riviä). Pyyntökohtainen välimuisti: sivu, metadata ja OG käyttävät samaa hakua. */
export const haeKaupungit = cache(async (): Promise<Kaupunki[]> => {
  const sb = sbAny();
  if (!sb) return [];
  const { data } = await sb.from("kaupungit").select(KENTAT).order("nimi");
  return (data ?? []) as Kaupunki[];
});

export async function haeKaupunki(slug: string): Promise<Kaupunki | null> {
  return (await haeKaupungit()).find((k) => k.slug === slug) ?? null;
}

/** Sivulle näytettävä kaupunki: julkaistu, tai julkaisematon esikatselussa. */
export async function haeNaytettavaKaupunki(slug: string): Promise<Kaupunki | null> {
  const k = await haeKaupunki(slug);
  if (!k) return null;
  return k.julkaistu || nayttaaJulkaisemattomat() ? k : null;
}

/* ── Visat ─────────────────────────────────────────────────────────────────────────────────────────────── */

/** Kategoria → ryhmä (brief §2). Kategoriaton tai tuntematon → kokoelman mukaan → Historia ja maamerkit.
 *  otsikko: näkyvä otsikko, jossa sana "visat" kertoo, että kortit ovat pelejä (Heikki 7.11.2026). */
export const RYHMAT = [
  { nimi: "Historia ja maamerkit", otsikko: "Historia- ja maamerkkivisat", kategoriat: ["kaupungit", "historia", "maantieto", "yleistieto"], kokoelmat: ["historia", "matkakohteet", "yleistieto"] },
  { nimi: "Urheilu", otsikko: "Urheiluvisat", kategoriat: ["urheilu", "jaakiekko"], kokoelmat: ["urheilu", "jaakiekko", "jalkapallo"] },
  { nimi: "Kulttuuri ja kieli", otsikko: "Kulttuuri- ja kielivisat", kategoriat: ["kulttuuri", "musiikki", "tv-sarjat", "elokuvat", "juhlat-ja-perinteet"], kokoelmat: ["kulttuuri", "musiikki", "tv", "elokuvat", "juhlat"] },
] as const;

function ryhmaVisalle(category: string | null, collection: string | null): string {
  const r = RYHMAT.find((g) => (g.kategoriat as readonly string[]).includes(category ?? ""))
    ?? RYHMAT.find((g) => (g.kokoelmat as readonly string[]).includes(collection ?? ""));
  return (r ?? RYHMAT[0]).nimi;
}

/* ── Kaudet (brief 1.11. §1: talvi 1.11.–28.2., kesä 1.5.–31.8.; päivät vain tässä) ───────────────────────── */
export type Kausi = "talvi" | "kesa";
export const KAUDET: Record<Kausi, { nimi: string; alku: [number, number]; loppu: [number, number] }> = {
  talvi: { nimi: "Talvella", alku: [11, 1], loppu: [2, 29] },
  kesa: { nimi: "Kesällä", alku: [5, 1], loppu: [8, 31] },
};

export function nykyinenKausi(nyt: Date = new Date()): Kausi | null {
  const { kk, pv } = helsinginPaiva(nyt);
  const arvo = kk * 100 + pv;
  for (const [avain, k] of Object.entries(KAUDET) as Array<[Kausi, (typeof KAUDET)[Kausi]]>) {
    const a = k.alku[0] * 100 + k.alku[1], l = k.loppu[0] * 100 + k.loppu[1];
    if (a <= l ? arvo >= a && arvo <= l : arvo >= a || arvo <= l) return avain;
  }
  return null;
}

export type KaupunkiVisa = {
  id: string;
  title: string;
  href: string;
  kuva: string | null;
  kuvaPos?: string;
  ryhma: string;
  kuvaus: string | null;
};

type VisaRivi = {
  id: string; slug: string | null; custom_slug: string | null; game_mode: string | null;
  title: string; display_title: string | null; teaser: string | null; description: string | null;
  category: string | null; collection: string | null; hero_image: string | null;
  hero_focal_x: number | null; hero_focal_y: number | null; kausi: string | null; published_at: string | null;
  suosio_90pv: number | null; paikkakunnat: string[] | null; question_count: number;
};
const VISA_KENTAT =
  "id, slug, custom_slug, game_mode, title, display_title, teaser, description, category, collection, hero_image, hero_focal_x, hero_focal_y, kausi, published_at, suosio_90pv, paikkakunnat, question_count";

const visaksi = (r: VisaRivi): KaupunkiVisa => ({
  id: r.id,
  title: r.display_title ?? r.title,
  href: visaHref(r),
  ...visanKorttikuva(r),
  ryhma: ryhmaVisalle(r.category, r.collection),
  kuvaus: r.description ?? r.teaser,
});

/** Paikkakuntien visat (julkaistut, tämän sivuston, ei megoja). */
async function haePaikkakunnanVisat(slugit: string[]): Promise<VisaRivi[]> {
  const sb = sbAny();
  const siteId = await getSiteId();
  if (!sb || !siteId || !slugit.length) return [];
  const { data } = await sb
    .from("quiz_cards")
    .select(VISA_KENTAT)
    .eq("site_id", siteId)
    .neq("game_mode", "mega")
    .overlaps("paikkakunnat", slugit)
    .limit(200);
  return (data ?? []) as VisaRivi[];
}

/* ── Henkilöt ──────────────────────────────────────────────────────────────────────────────────────────── */

export type KaupunkiHenkilo = { name: string; href: string; image_url: string | null };
/** Henkilöosio näkyy jo yhdellä henkilöllä (Heikki 7.11.2026: yksikin auttaa pientä kaupunkia); enintään 8. */
export const HENKILOT_MIN = 1;
export const HENKILOT_MAX = 8;

async function haeSyntyneet(k: Kaupunki): Promise<KaupunkiHenkilo[]> {
  const sb = sbAny();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  const muodot = [k.inessiivi, ...(k.vanhat_kunnat ?? [])];
  const lainaus = (s: string) => `"${s.replace(/"/g, "")}"`;
  /* "Helsingissä" tai "Helsingissä, Suomessa" (lisäys pilkun jälkeen). celebrities-RLS piilottaa henkilöt, joiden
     visa on luonnos, joten jokaisella rivillä on julkaistu henkilösivu. */
  const ehto = [`birth_place.in.(${muodot.map(lainaus).join(",")})`, ...muodot.map((m) => `birth_place.like.${lainaus(`${m},*`)}`)].join(",");
  const { data } = await sb
    .from("celebrities")
    .select("name, image_url, priority, trivia_quiz_id")
    .eq("site_id", siteId)
    .or(ehto)
    .limit(300);
  const rivit = (data ?? []) as Array<{ name: string; image_url: string | null; priority: number | null; trivia_quiz_id: string | null }>;
  /* Tunnettuus (brief: priority/is_hero ensin): priority on lähes kaikilla 5 ja is_hero tarkoittaa etusivun nostoa,
     joten järjestys on kuvalliset ensin → henkilövisan suosio (eri selaimet 90 pv) → priority → aakkoset. */
  const idt = rivit.flatMap((r) => (r.trivia_quiz_id ? [r.trivia_quiz_id] : []));
  const suosio = new Map<string, number>();
  if (idt.length) {
    const { data: s } = await sb.from("quiz_cards").select("id, suosio_90pv").in("id", idt);
    for (const r of (s ?? []) as Array<{ id: string; suosio_90pv: number | null }>) suosio.set(r.id, r.suosio_90pv ?? 0);
  }
  const pisteet = (r: (typeof rivit)[number]) => (r.trivia_quiz_id ? suosio.get(r.trivia_quiz_id) ?? 0 : 0);
  return rivit
    .sort((a, b) => Number(!!b.image_url) - Number(!!a.image_url) || pisteet(b) - pisteet(a) || (b.priority ?? 0) - (a.priority ?? 0) || a.name.localeCompare(b.name, "fi"))
    .map((r) => ({ name: r.name, href: henkiloHref(r.name), image_url: r.image_url }));
}

/* ── Sivu ──────────────────────────────────────────────────────────────────────────────────────────────── */

export type Kaupunkisivu = {
  kaupunki: Kaupunki;
  kaupunkivisa: (KaupunkiVisa & { kuvaus: string | null }) | null;
  kausinosto: (KaupunkiVisa & { kausi: string }) | null;
  ryhmat: Array<{ nimi: string; otsikko: string; visat: KaupunkiVisa[] }>;
  henkilot: KaupunkiHenkilo[];
  /** Visoja yhteensä (kaupunkivisa + muut) — vain otsikkoon ja kuvaukseen, ei sivulle. */
  visoja: number;
};

export const haeKaupunkisivu = cache(async (slug: string): Promise<Kaupunkisivu | null> => {
  const k = await haeNaytettavaKaupunki(slug);
  if (!k) return null;
  const [visat, henkilot] = await Promise.all([haePaikkakunnanVisat([k.slug]), haeSyntyneet(k)]);
  const kaupunkivisaRivi = visat.find((v) => v.id === k.kaupunkivisa_quiz_id) ?? null;
  const muut = visat
    .filter((v) => v.id !== k.kaupunkivisa_quiz_id)
    .sort((a, b) => (b.suosio_90pv ?? 0) - (a.suosio_90pv ?? 0) || (a.display_title ?? a.title).localeCompare(b.display_title ?? b.title, "fi"));
  const kausi = nykyinenKausi();
  const kausiRivi = kausi
    ? muut.filter((v) => v.kausi === kausi).sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))[0] ?? null
    : null;
  const ryhmiin = muut.filter((v) => v.id !== kausiRivi?.id).map(visaksi);
  const ryhmat = RYHMAT.map((g) => ({ nimi: g.nimi, otsikko: g.otsikko, visat: ryhmiin.filter((v) => v.ryhma === g.nimi) })).filter((g) => g.visat.length);
  return {
    kaupunki: k,
    kaupunkivisa: kaupunkivisaRivi ? visaksi(kaupunkivisaRivi) : null,
    kausinosto: kausiRivi && kausi ? { ...visaksi(kausiRivi), kausi: KAUDET[kausi].nimi } : null,
    ryhmat,
    henkilot: henkilot.length >= HENKILOT_MIN ? henkilot.slice(0, HENKILOT_MAX) : [],
    visoja: (kaupunkivisaRivi ? 1 : 0) + muut.length,
  };
});

/** /kaupunki-lista: julkaistut aakkosjärjestyksessä visamäärineen. */
/** Julkaistut kaupungit visamäärineen A–Ö. julkaisemattomat: myös julkaisemattomat (kokoelmasivun kortit esikatselussa). */
export async function haeKaupunkilista(julkaisemattomat = false): Promise<Array<Kaupunki & { visoja: number }>> {
  const kaupungit = (await haeKaupungit()).filter((k) => k.julkaistu || julkaisemattomat);
  const visat = await haePaikkakunnanVisat(kaupungit.map((k) => k.slug));
  return kaupungit
    .map((k) => ({ ...k, visoja: visat.filter((v) => v.paikkakunnat?.includes(k.slug)).length }))
    .sort((a, b) => a.nimi.localeCompare(b.nimi, "fi"));
}

/* ── Paikkakuntalinkitys visasivuille (brief §2, paikkakuntalinkityksen brief §2) ─────────────────────────── */

export type PaikkakunnanVisat = {
  /** "Lisää Mikkelistä" */
  otsikko: string;
  visat: Array<{ id: string; title: string; href: string; kuva: string | null; kuvaPos?: string; question_count: number }>;
  /** "Kaikki Mikkeli-visat" → kaupunkisivu; vain julkaistulle kaupungille. */
  kaikki: { href: string; teksti: string } | null;
};

/** Visan ensimmäisen paikkakunnan (jolla on kaupunkirivi) muut visat, enintään 3. Kaupunkivisa ensin. */
export async function haePaikkakunnanMuutVisat(quiz: { id: string; paikkakunnat?: string[] | null }, n = 3): Promise<PaikkakunnanVisat | null> {
  const pk = quiz.paikkakunnat ?? [];
  if (!pk.length) return null;
  const kaupungit = await haeKaupungit();
  const k = pk.map((s) => kaupungit.find((x) => x.slug === s)).find(Boolean);
  if (!k) return null;
  const rivit = (await haePaikkakunnanVisat([k.slug])).filter((v) => v.id !== quiz.id);
  if (!rivit.length) return null;
  const kaupunkivisa = rivit.filter((v) => v.id === k.kaupunkivisa_quiz_id);
  const muut = rivit.filter((v) => v.id !== k.kaupunkivisa_quiz_id);
  for (let i = muut.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [muut[i], muut[j]] = [muut[j], muut[i]];
  }
  const julkinen = k.julkaistu || nayttaaJulkaisemattomat();
  return {
    otsikko: `Lisää ${k.elatiivi}`,
    visat: [...kaupunkivisa, ...muut].slice(0, n).map((r) => ({
      id: r.id, title: r.display_title ?? r.title, href: visaHref(r), ...visanKorttikuva(r), question_count: r.question_count,
    })),
    kaikki: julkinen ? { href: kaupunkiHref(k.slug), teksti: `Kaikki ${k.nimi}-visat` } : null,
  };
}

/** Lyhyen osoitteen kohde: julkaistu kaupunki → kanoninen polku. */
export async function lyhyenOsoitteenKohde(slug: string): Promise<string | null> {
  if (!/^[a-z]+$/.test(slug)) return null;
  const k = await haeKaupunki(slug);
  return k && (k.julkaistu || nayttaaJulkaisemattomat()) ? kaupunkiHref(k.slug) : null;
}

/* ── Otsikoiden mitoitus (KORTTISÄÄNTÖ) ────────────────────────────────────────────────────────────────── */
/* Staattisen Archivo 900:n isojen kirjainten leveydet em-yksiköinä (mitattu Chromiumissa 7.11.2026, 100 px:n koko).
   Keskimääräinen merkkileveys ei riitä: M, W, Ä ja O ovat yli kaksi kertaa I:n levyisiä (Maarianhamina 9,6 em,
   Helsinki 5,2 em). CSS laskee koon säiliön leveydestä: min(katto, 100cqw × 0,97 / em). */
const ARCHIVO_900: Record<string, number> = {
  A: 0.778, B: 0.778, C: 0.778, D: 0.778, E: 0.722, F: 0.667, G: 0.833, H: 0.833, I: 0.369, J: 0.667, K: 0.833, L: 0.667,
  M: 0.972, N: 0.833, O: 0.833, P: 0.722, Q: 0.833, R: 0.778, S: 0.722, T: 0.722, U: 0.833, V: 0.778, W: 1, X: 0.778,
  Y: 0.778, Z: 0.722, Å: 0.778, Ä: 0.778, Ö: 0.833, " ": 0.18, "–": 0.5, "-": 0.333,
};

/** Tekstin leveys em-yksiköinä isoin kirjaimin (letter-spacing em-yksiköinä mukaan). */
export function archivoEm(teksti: string, letterSpacing = 0): number {
  const t = teksti.toUpperCase();
  let em = 0;
  for (const m of t) em += (ARCHIVO_900[m] ?? 0.78) + letterSpacing;
  return Math.round(Math.max(em, 2) * 1000) / 1000;
}

/** Pisimmän sanan leveys em-yksiköinä (rivittyvät otsikot: sana ei saa katketa). */
export const pisimmanSananEm = (teksti: string, letterSpacing = 0) =>
  Math.max(2, ...teksti.split(/[\s–]+/).filter(Boolean).map((w) => archivoEm(w, letterSpacing)));

/** Tunnusrivi näkyviin: luku ei katkea ("694 000 asukasta", "perustettu 1550", "vuodesta 1972" pysyvät koossa). */
export const tunnusriviNakyviin = (t: string) => t.replace(/ (?=\d)/g, " ").replace(/(\d) (asukasta)/g, "$1 $2");
