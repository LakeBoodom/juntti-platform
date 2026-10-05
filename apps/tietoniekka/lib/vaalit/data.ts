// Vaalit ja politiikka -hub (Claude Design 5.10.2026, katselmus kierros 1). Kaikki luvut kannasta:
// kansanedustajat (fact_attributes mp_sitting), vaalipiirit (vaalipiirit.seats_2023), poliitikot
// (celebrities ryhmä poliitikot), visat (quiz_cards category politiikka + ristiinlistatut).
import { getSupabase } from "../supabase";
import { getSiteId } from "../queries";
import { henkiloHref } from "../henkiloSlug";
import { visaHref } from "../visaHref";
import { resolveCollection } from "../visanKokoelma";
import { VAALIPIIRI_GEOM } from "./geometria";

/** Eduskuntavaalit 2027 (vaalilaki: huhtikuun kolmas sunnuntai). */
export const VAALIPAIVA = { y: 2027, m: 4, d: 18 };
export const VAALIEN_VAIHEET: Array<{ nimi: string; milloin: string }> = [
  { nimi: "Ehdokkaat", milloin: "maaliskuu" },
  { nimi: "Ennakko­äänestys", milloin: "7.–13.4." },
  { nimi: "Vaalipäivä", milloin: "18.4." },
  { nimi: "Uusi eduskunta", milloin: "huhtikuu" },
];

/** Ristiinlistatut visat (brief, toteutusmuistio): visa pysyy kotikokoelmassaan, Vaalit-hub näyttää sen. */
export const RISTIIN = [
  "suomen-presidentit-visa",
  "suomen-itsenaistyminen-visa",
  "autonomian-aika-visa",
  "kekkosen-suomi-kylma-sota-idansuhteet",
  "mannerheim-visa",
  "suomi-1980-luvulla",
  "suomen-tunnetuimmat-rakennukset",
];

export type VpRivi = { k: string; nimi: string; alue: string | null; paikat: number; cx: number; cy: number; d: string };
export type PoliitikkoKortti = { href: string; name: string; role: string | null; image_url: string | null };
export type VaalitVisa = { href: string; otsikko: string; meta: string; koti: string | null; kotiKey: string | null };

export type VaalitHub = {
  kansanedustajia: number;
  tilanne: string | null;
  vaalipiirit: VpRivi[];
  poliitikot: PoliitikkoKortti[];
  poliitikkoja: number;
  omatVisat: VaalitVisa[];
  ristiinVisat: VaalitVisa[];
};

type Celeb = { name: string; role: string | null; image_url: string | null; priority: number | null; trivia_quiz_id: string | null };
type Kortti = { id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null; collection: string | null; category: string | null; genre: string | null; question_count: number | null };

export async function haeVaalitHub(): Promise<VaalitHub> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  const tyhja: VaalitHub = { kansanedustajia: 0, tilanne: null, vaalipiirit: [], poliitikot: [], poliitikkoja: 0, omatVisat: [], ristiinVisat: [] };
  if (!sb || !siteId) return tyhja;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const db = sb as any;
  const SEL = "id, slug, custom_slug, title, display_title, collection, category, genre, question_count";
  const [istuvat, vp, celebs, omat, ristiin] = await Promise.all([
    db.from("fact_attributes").select("as_of", { count: "exact" }).eq("attr_key", "mp_sitting").eq("num_value", 1).order("as_of", { ascending: false }).limit(1),
    db.from("vaalipiirit").select("short_name, seats_2023"),
    db.from("celebrities").select("name, role, image_url, priority, trivia_quiz_id").eq("site_id", siteId).eq("ryhma", "poliitikot").limit(500),
    db.from("quiz_cards").select(SEL).eq("site_id", siteId).eq("category", "politiikka").order("title"),
    db.from("quiz_cards").select(SEL).eq("site_id", siteId).in("slug", RISTIIN),
  ]);
  const paikat = new Map(((vp.data ?? []) as Array<{ short_name: string; seats_2023: number }>).map((r) => [r.short_name, r.seats_2023]));
  const vaalipiirit = VAALIPIIRI_GEOM.filter((g) => paikat.has(g.nimi)).map((g) => ({
    k: g.k,
    nimi: g.nimi,
    // Alarivi vain kun se eroaa nimestä (katselmus §2.4: ei "Helsinki / Helsinki").
    alue: g.alue && g.alue !== g.nimi ? g.alue : null,
    paikat: paikat.get(g.nimi)!,
    cx: g.cx,
    cy: g.cy,
    d: g.d,
  }));

  const kaikki = (celebs.data ?? []) as Celeb[];
  // 12 kuvallista poliitikkoa, järjestys vaihtuu päivittäin (aakkosjärjestys toi joka päivä samat
  // A-alkuiset, ensimmäisenä Abraham Lincolnin). Siemen = päivä → ISR-sivu pysyy samana koko päivän.
  const t = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(new Date());
  let siemen = [...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((siemen = (siemen * 1664525 + 1013904223) >>> 0) / 4294967296);
  const kuvalliset = kaikki.filter((c) => c.image_url).map((c) => ({ c, r: rnd() })).sort((a, b) => a.r - b.r).map((x) => x.c);
  const poliitikot = [...kuvalliset, ...kaikki.filter((c) => !c.image_url)]
    .slice(0, 12)
    .map((c) => ({ href: henkiloHref(c.name), name: c.name, role: c.role, image_url: c.image_url }));

  const kortti = (q: Kortti): VaalitVisa => {
    const r = resolveCollection(q);
    return {
      href: visaHref(q),
      otsikko: q.display_title ?? q.title,
      meta: q.question_count ? `${q.question_count} kysymystä` : "Visa",
      koti: r.key === "vaalit" ? null : r.label,
      kotiKey: r.key === "vaalit" ? null : r.key,
    };
  };
  const ristiinRivit = (ristiin.data ?? []) as Kortti[];
  const ristiinJarj = RISTIIN.map((s) => ristiinRivit.find((q) => q.slug === s)).filter((q): q is Kortti => !!q);

  return {
    kansanedustajia: istuvat.count ?? 0,
    tilanne: (istuvat.data?.[0]?.as_of as string | undefined) ?? null,
    vaalipiirit,
    poliitikot,
    poliitikkoja: kaikki.length,
    omatVisat: ((omat.data ?? []) as Kortti[]).map(kortti),
    ristiinVisat: ristiinJarj.map(kortti),
  };
}

/** Puolikaaren 200 paikkaa (CD:n hemicycle): pisteet vasemmalta oikealle. */
export function puolikaari(n = 200, W = 200, H = 104): Array<{ x: number; y: number }> {
  const rows = 8, r0 = 38, r1 = 96;
  const radii: number[] = [];
  let tot = 0;
  for (let i = 0; i < rows; i++) {
    const r = r0 + ((r1 - r0) * i) / (rows - 1);
    radii.push(r);
    tot += r;
  }
  const pts: Array<{ x: number; y: number; a: number }> = [];
  let left = n;
  for (let i = 0; i < rows; i++) {
    const c = i === rows - 1 ? left : Math.round((n * radii[i]) / tot);
    left -= c;
    for (let k = 0; k < c; k++) {
      const a = Math.PI - (Math.PI * (k + 0.5)) / c;
      pts.push({ x: +(W / 2 + radii[i] * Math.cos(a)).toFixed(2), y: +(H - 2 - radii[i] * Math.sin(a)).toFixed(2), a });
    }
  }
  return pts.sort((p, q) => q.a - p.a).map(({ x, y }) => ({ x, y }));
}

export const pisteetPolkuna = (pts: Array<{ x: number; y: number }>) => pts.map((p) => `M${p.x} ${p.y}h0`).join("");
