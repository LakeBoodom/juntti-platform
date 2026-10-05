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
export type Kasvo = { href: string; name: string; ala: string | null; image_url: string | null };
export type KasvoRivi = { avain: string; otsikko: string; kasvot: Kasvo[] };

/** Puolueen näyttönimi (Vaalipiiriketju-katselmus §3): kannassa lyhyt muoto, vain SDP avataan. */
export const puolueNimi = (p: string | null | undefined) => (p === "SDP" ? "Sosialidemokraatit" : p ?? null);
export type VaalitVisa = { href: string; otsikko: string; meta: string; koti: string | null; kotiKey: string | null };

export type VaalitHub = {
  kansanedustajia: number;
  tilanne: string | null;
  vaalipiirit: VpRivi[];
  /** Vallan kasvot (toteutusbrief 5.10. §1): puoluejohtajat, pääministerit 1987–, presidentit. */
  kasvot: KasvoRivi[];
  omatVisat: VaalitVisa[];
  ristiinVisat: VaalitVisa[];
};

type Celeb = { id: string; name: string; role: string | null; image_url: string | null; politiikka_roolit: string[] | null };
type Kortti = { id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null; collection: string | null; category: string | null; genre: string | null; question_count: number | null };

export async function haeVaalitHub(): Promise<VaalitHub> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  const tyhja: VaalitHub = { kansanedustajia: 0, tilanne: null, vaalipiirit: [], kasvot: [], omatVisat: [], ristiinVisat: [] };
  if (!sb || !siteId) return tyhja;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const db = sb as any;
  const SEL = "id, slug, custom_slug, title, display_title, collection, category, genre, question_count";
  const [istuvat, vp, celebs, omat, ristiin, puolueet] = await Promise.all([
    db.from("fact_attributes").select("as_of", { count: "exact" }).eq("attr_key", "mp_sitting").eq("num_value", 1).order("as_of", { ascending: false }).limit(1),
    // Paikat vaalipiiri-entiteeteistä (julkisesti luettavissa; role_label = lyhyt nimi, vp_seats).
    db.from("fact_attributes").select("num_value, fact_entities!inner(role_label, kind, status)").eq("attr_key", "vp_seats").eq("fact_entities.kind", "vaalipiiri"),
    // RLS piilottaa henkilöt, joiden visa on luonnos → rivit täyttyvät julkaisun myötä.
    db.from("celebrities").select("id, name, role, image_url, politiikka_roolit").eq("site_id", siteId).not("politiikka_roolit", "is", null).limit(500),
    db.from("quiz_cards").select(SEL).eq("site_id", siteId).eq("category", "politiikka").eq("collection", "vaalit").order("title"),
    db.from("quiz_cards").select(SEL).eq("site_id", siteId).in("slug", RISTIIN),
    db.from("fact_attributes").select("num_value, fact_entities!inner(name, kind)").eq("attr_key", "party_seats").eq("fact_entities.kind", "party"),
  ]);
  const paikat = new Map(
    ((vp.data ?? []) as Array<{ num_value: number; fact_entities: { role_label: string } }>).map((r) => [r.fact_entities.role_label, Number(r.num_value)]),
  );
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

  // Vallan kasvot: henkilöiden person-entiteettien attribuutit (pm_start, pres_start, mp_party).
  const henkilot = (celebs.data ?? []) as Celeb[];
  const idt = henkilot.map((c) => c.id);
  const attrs = new Map<string, Record<string, { num: number; text: string | null }>>();
  if (idt.length) {
    const { data } = await db
      .from("fact_attributes")
      .select("attr_key, num_value, text_value, display_value, fact_entities!inner(celebrity_id, kind)")
      .in("attr_key", ["pm_start", "pm_days", "pres_start", "mp_party"])
      .eq("fact_entities.kind", "person")
      .in("fact_entities.celebrity_id", idt);
    for (const r of (data ?? []) as Array<{ attr_key: string; num_value: number | null; text_value: string | null; display_value: string | null; fact_entities: { celebrity_id: string } }>) {
      const m = attrs.get(r.fact_entities.celebrity_id) ?? {};
      m[r.attr_key] = { num: Number(r.num_value), text: r.text_value ?? r.display_value };
      attrs.set(r.fact_entities.celebrity_id, m);
    }
  }
  const paikkoja = new Map(((puolueet.data ?? []) as Array<{ num_value: number; fact_entities: { name: string } }>).map((r) => [r.fact_entities.name, Number(r.num_value)]));
  const kasvo = (c: Celeb, ala: string | null): Kasvo => ({ href: henkiloHref(c.name), name: c.name, ala, image_url: c.image_url });
  const roolissa = (r: string) => henkilot.filter((c) => c.politiikka_roolit?.includes(r));
  const vuosi = (n: number | undefined) => (Number.isFinite(n) ? new Date((n as number) * 1000).getUTCFullYear() : 0);
  const puolue = (c: Celeb) => attrs.get(c.id)?.mp_party?.text ?? null;
  // Pääministeririvin alarivi = pääministerikausi (ei celebrities.role, joka on esim. Stubbilla presidentti).
  // Kannassa ei ole päättymispäivää: loppu = pm_start + pm_days; istuvalla (ei pm_days) "2023–".
  // 1987– kaudet ovat yhtenäisiä, joten summa = kausi.
  const pmKausi = (c: Celeb) => {
    const a = attrs.get(c.id);
    const alku = a?.pm_start?.num;
    if (!Number.isFinite(alku)) return c.role;
    const paivat = a?.pm_days?.num;
    const loppu = Number.isFinite(paivat) ? vuosi((alku as number) + (paivat as number) * 86400) : null;
    return `Pääministeri ${vuosi(alku)}–${loppu ?? ""}`;
  };
  const kasvot: KasvoRivi[] = [
    {
      avain: "puoluejohtajat",
      otsikko: "Puoluejohtajat 2027 vaaleissa",
      kasvot: roolissa("puoluejohtaja")
        .sort((a, b) => (paikkoja.get(puolue(b) ?? "") ?? 0) - (paikkoja.get(puolue(a) ?? "") ?? 0))
        .map((c) => kasvo(c, puolueNimi(puolue(c)))),
    },
    {
      avain: "paaministerit",
      otsikko: "Pääministerit Holkerista Orpoon",
      kasvot: roolissa("paaministeri")
        .filter((c) => vuosi(attrs.get(c.id)?.pm_start?.num) >= 1987)
        .sort((a, b) => (attrs.get(a.id)?.pm_start?.num ?? 0) - (attrs.get(b.id)?.pm_start?.num ?? 0))
        .map((c) => kasvo(c, pmKausi(c))),
    },
    {
      avain: "presidentit",
      otsikko: "Tasavallan presidentit",
      kasvot: roolissa("presidentti")
        .sort((a, b) => (attrs.get(a.id)?.pres_start?.num ?? 0) - (attrs.get(b.id)?.pres_start?.num ?? 0))
        .map((c) => kasvo(c, c.role)),
    },
  ].filter((r) => r.kasvot.length > 0);

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
    kasvot,
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
