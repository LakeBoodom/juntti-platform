// Visapaketit (toteutusbrief 28.10.2026): valmiit tietovisat visan vetäjälle — pakettisivu, televisionäkymä,
// tuloste ja landing. Paketit, kierrokset, kaudet ja metarivit tulevat kannasta (quiz_packs*); kysymykset
// ovat viittauksia julkaistujen visojen kysymyksiin. Koko paketti haetaan RPC:llä visapaketti(slug, avain),
// joka palauttaa luonnoksen vain oikealla esikatseluavaimella (?esikatselu=<avain>, admin).

import { getSupabase } from "./supabase";
import { getSiteId } from "./queries";
import { helsinginPaiva } from "./aika";
import { visaHref } from "./visaHref";

export const VP_LANDING = "/visapaketit";
export const VP_SARJA_PUBIVISA = "pubivisa";

export type Kohderyhma = "aikuiset" | "lapset" | "molemmat";
export type Taso = "aikuiset" | "lapset";

export type Paketti = {
  id: string;
  slug: string;
  sarja: string | null;
  painos_nimi: string | null;
  otsikko: string;
  seo_title: string | null;
  seo_description: string | null;
  kohderyhma: Kohderyhma;
  kausi_alku: string | null;
  kausi_loppu: string | null;
  kesto_min: number | null;
  hero_image: string | null;
  hero_alt: string | null;
  aksentti: string | null;
  jarjestys: number;
  status: "draft" | "published";
  published_at: string | null;
};

export type PakettiVisa = {
  id: string;
  slug: string | null;
  custom_slug: string | null;
  title: string;
  display_title: string | null;
  collection: string | null;
  target_age: string | null;
  game_mode: string | null;
  hero_image: string | null;
  image_url: string | null;
};

export type Vastausvaihtoehto = { text: string; is_correct?: boolean };

export type ElainAani = { url: string; laji?: string; tekija?: string; lisenssi?: string; lahde?: string };

export type PakettiKysymys = {
  id: string;
  question_text: string;
  explanation: string | null;
  answers: Vastausvaihtoehto[] | null;
  question_type: string | null;
  image_url: string | null;
  image_credit: string | null;
  image_position: string | null;
  audio: { kysymys?: string } | null;
  animal_sound: ElainAani | null;
  /** false vain esikatselussa: visa ei ole julkaistu, joten kysymys putoaisi julkaistusta paketista. */
  visa_julkaistu: boolean;
  visa: PakettiVisa;
};

export type Kierros = { nro: number; nimi: string; kohderyhma: Taso; kysymykset: PakettiKysymys[] };

export type Visapaketti = { paketti: Paketti; esikatselu: boolean; kierrokset: Kierros[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Koko paketti kierroksineen. null = ei ole / ei julkaistu (ilman oikeaa esikatseluavainta). */
export async function haeVisapaketti(slug: string, esikatselu?: string | null): Promise<Visapaketti | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const avain = esikatselu && UUID.test(esikatselu) ? esikatselu : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any).rpc("visapaketti", { p_slug: slug, p_avain: avain });
  if (error || !data?.paketti) return null;
  return data as Visapaketti;
}

/** Landingin, sarjasivun ja sitemapin rivi: paketti + kierrosmäärät tasoittain. */
export type PakettiRivi = Paketti & { kierroksia: { aikuiset: number; lapset: number } };

export async function listaaVisapaketit(): Promise<PakettiRivi[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  const { data, error } = await sb
    .from("quiz_packs")
    .select("id, slug, sarja, painos_nimi, otsikko, seo_title, seo_description, kohderyhma, kausi_alku, kausi_loppu, kesto_min, hero_image, hero_alt, aksentti, jarjestys, status, published_at, quiz_pack_rounds(kohderyhma)")
    .eq("site_id", siteId)
    .eq("status", "published")
    .order("jarjestys", { ascending: true })
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data.map(({ quiz_pack_rounds, ...p }) => {
    const kr = (quiz_pack_rounds ?? []) as { kohderyhma: string }[];
    return {
      ...(p as Paketti),
      kierroksia: { aikuiset: kr.filter((r) => r.kohderyhma !== "lapset").length, lapset: kr.filter((r) => r.kohderyhma === "lapset").length },
    };
  });
}

/* ─── Sarjat (pubivisa) ─────────────────────────────────────────── */

/** Painoksen osoitteen loppuosa: 'pubivisa-2026-loka-joulu' → '2026-loka-joulu'. */
export const painosSlug = (p: Pick<Paketti, "slug" | "sarja">) =>
  p.sarja && p.slug.startsWith(`${p.sarja}-`) ? p.slug.slice(p.sarja.length + 1) : p.slug;

/** Paketin oma osoite. Sarjan painos: /visapaketti/<sarja>/<painos>. */
export const pakettiHref = (p: Pick<Paketti, "slug" | "sarja">) =>
  p.sarja ? `/visapaketti/${p.sarja}/${painosSlug(p)}` : `/visapaketti/${p.slug}`;

/** Sarjan pääsivu (uusin painos). Landingin kortti linkkaa tänne, ei yksittäiseen painokseen. */
export const sarjaHref = (sarja: string) => `/visapaketti/${sarja}`;

/** Sarjan painokset uusimmasta vanhimpaan. */
export const sarjanPainokset = (rivit: PakettiRivi[], sarja: string) =>
  rivit.filter((r) => r.sarja === sarja).sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

/** Landingin kortit: erilliset paketit + yksi kortti per sarja (sarjan uusin painos). */
export function landinginPaketit(rivit: PakettiRivi[]): PakettiRivi[] {
  const nahdyt = new Set<string>();
  const out: PakettiRivi[] = [];
  for (const r of rivit) {
    if (!r.sarja) { out.push(r); continue; }
    if (nahdyt.has(r.sarja)) continue;
    nahdyt.add(r.sarja);
    out.push(sarjanPainokset(rivit, r.sarja)[0]);
  }
  return out;
}

/** Kortin ja noston linkki: sarjan painos → sarjan pääsivu. */
export const korttiHref = (p: Pick<Paketti, "slug" | "sarja">) => (p.sarja ? sarjaHref(p.sarja) : pakettiHref(p));

/* ─── Ajankohtaisuus ───────────────────────────────────────────── */

const mmdd = (kk: number, pv: number) => kk * 100 + pv;
const jasenna = (s: string) => { const [kk, pv] = s.split("-").map(Number); return mmdd(kk, pv); };

/** Päiviä kauden loppuun (Suomen aika), tai null jos kausi ei ole käynnissä. Kausi voi ylittää vuodenvaihteen. */
export function kauttaJaljella(p: Pick<Paketti, "kausi_alku" | "kausi_loppu">, nyt: Date = new Date()): number | null {
  if (!p.kausi_alku || !p.kausi_loppu) return null;
  const t = helsinginPaiva(nyt);
  const tanaan = mmdd(t.kk, t.pv);
  const alku = jasenna(p.kausi_alku), loppu = jasenna(p.kausi_loppu);
  const ylittaa = alku > loppu;
  const kaynnissa = ylittaa ? tanaan >= alku || tanaan <= loppu : tanaan >= alku && tanaan <= loppu;
  if (!kaynnissa) return null;
  const [lkk, lpv] = p.kausi_loppu.split("-").map(Number);
  const loppuVuosi = ylittaa && tanaan >= alku ? t.vuosi + 1 : t.vuosi;
  return Math.round((Date.UTC(loppuVuosi, lkk - 1, lpv) - Date.UTC(t.vuosi, t.kk - 1, t.pv)) / 86_400_000);
}

/** Ajankohtainen paketti: kausi kattaa tämän päivän (lähin kauden loppu voittaa);
 *  jos yhdenkään kausi ei ole käynnissä, pubivisan uusin painos. */
export function ajankohtainen(rivit: PakettiRivi[], nyt: Date = new Date()): PakettiRivi | null {
  const kaynnissa = rivit
    .map((r) => ({ r, jaljella: kauttaJaljella(r, nyt) }))
    .filter((x): x is { r: PakettiRivi; jaljella: number } => x.jaljella !== null)
    .sort((a, b) => a.jaljella - b.jaljella);
  if (kaynnissa.length) return kaynnissa[0].r;
  return sarjanPainokset(rivit, VP_SARJA_PUBIVISA)[0] ?? null;
}

/* ─── Kysymykset ja tasot ───────────────────────────────────────── */

export const oikeaVastaus = (q: Pick<PakettiKysymys, "answers">): string =>
  (q.answers ?? []).find((a) => a.is_correct)?.text ?? "";

/** Aikuiset/Lapset-valitsin vain 'molemmat'-paketeissa; muuten paketin oma taso. */
export const valitsinNakyy = (p: Pick<Paketti, "kohderyhma">) => p.kohderyhma === "molemmat";

export function tasoParametrista(p: Pick<Paketti, "kohderyhma">, taso?: string | string[] | null): Taso {
  if (p.kohderyhma === "lapset") return "lapset";
  if (p.kohderyhma === "aikuiset") return "aikuiset";
  return taso === "lapset" ? "lapset" : "aikuiset";
}

/** Valitun tason kierrokset, numeroituna uudelleen 1…n (Kierros 1 on aina ensimmäinen näkyvä). */
export function tasonKierrokset(vp: Visapaketti, taso: Taso): Kierros[] {
  const omat = vp.paketti.kohderyhma === "molemmat" ? vp.kierrokset.filter((k) => k.kohderyhma === taso) : vp.kierrokset;
  return omat.filter((k) => k.kysymykset.length > 0).map((k, i) => ({ ...k, nro: i + 1 }));
}

/** Metarivi datasta: "4 kierrosta · noin 45 min" (+ "aikuiset ja lapset" molemmille).
 *  'molemmat'-paketissa kierrosmäärä on aikuisten (valitsimen oletus); lasten kierrokset ovat vaihtoehto. */
export function metarivi(p: Pick<Paketti, "kohderyhma" | "kesto_min">, kierroksia: { aikuiset: number; lapset: number }): string[] {
  const n = p.kohderyhma === "lapset" ? kierroksia.lapset || kierroksia.aikuiset : kierroksia.aikuiset || kierroksia.lapset;
  const osat = [`${n} ${n === 1 ? "kierros" : "kierrosta"}`];
  if (p.kesto_min) osat.push(`noin ${p.kesto_min} min`);
  if (p.kohderyhma === "molemmat") osat.push("aikuiset ja lapset");
  return osat;
}

export const kierrosmaarat = (vp: Visapaketti) => ({
  aikuiset: vp.kierrokset.filter((k) => k.kohderyhma !== "lapset" && k.kysymykset.length).length,
  lapset: vp.kierrokset.filter((k) => k.kohderyhma === "lapset" && k.kysymykset.length).length,
});

/** Paketin lähdevisat ("Pelaa visoina"), ensiesiintymisjärjestyksessä. */
export function lahdevisat(kierrokset: Kierros[]): (PakettiVisa & { href: string })[] {
  const nahdyt = new Map<string, PakettiVisa & { href: string }>();
  for (const k of kierrokset) for (const q of k.kysymykset) {
    if (!q.visa_julkaistu || nahdyt.has(q.visa.id)) continue;
    nahdyt.set(q.visa.id, { ...q.visa, href: visaHref(q.visa) });
  }
  return [...nahdyt.values()];
}

/** Painoksen päivämäärä näkyviin ("Julkaistu 1.10.2026"), jotta arkistossa vanhentunut kysymys ei näytä virheeltä. */
export function julkaisuPvm(iso: string | null): string | null {
  if (!iso) return null;
  const t = helsinginPaiva(new Date(iso));
  return `${t.pv}.${t.kk}.${t.vuosi}`;
}
