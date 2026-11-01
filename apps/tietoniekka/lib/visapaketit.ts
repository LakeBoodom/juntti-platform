// Visapaketit (toteutusbrief 28.10.2026): valmiit tietovisat visan vetäjälle — pakettisivu, televisionäkymä,
// tuloste ja landing. Paketit, kierrokset, kaudet ja metarivit tulevat kannasta (quiz_packs*); kysymykset
// ovat viittauksia julkaistujen visojen kysymyksiin. Koko paketti haetaan RPC:llä visapaketti(slug, avain),
// joka palauttaa luonnoksen vain oikealla esikatseluavaimella (?esikatselu=<avain>, admin).

import { getSupabase } from "./supabase";
import { getSiteId } from "./queries";
import { helsinginPaiva } from "./aika";
import { visaHref } from "./visaHref";
import { pieniKuva } from "./pienetKuvat";

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
  /** Landingin kortin kicker, esim. "Juhlat". */
  teema: string | null;
  jarjestys: number;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string | null;
  /** Näkyvä johdanto H1:n alla (SEO-brief 1.11.2026). Paikkamerkit täytetään kannan luvuista (tayta). */
  johdanto: string | null;
  /** 'molemmat'-paketin lastenversio omassa osoitteessa /visapaketti/<slug>/lapset. */
  lasten_otsikko: string | null;
  lasten_seo_title: string | null;
  lasten_seo_description: string | null;
  lasten_johdanto: string | null;
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

/** Tasoittaiset määrät (kierrokset tai kysymykset). */
export type Maarat = { aikuiset: number; lapset: number };

/** Landingin, sarjasivun ja sitemapin rivi: paketti + kierros- ja kysymysmäärät tasoittain. */
export type PakettiRivi = Paketti & { kierroksia: Maarat; kysymyksia: Maarat };

export async function listaaVisapaketit(): Promise<PakettiRivi[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  const { data, error } = await sb
    .from("quiz_packs")
    .select("id, slug, sarja, painos_nimi, otsikko, seo_title, seo_description, kohderyhma, kausi_alku, kausi_loppu, kesto_min, hero_image, hero_alt, aksentti, teema, jarjestys, status, published_at, updated_at, johdanto, lasten_otsikko, lasten_seo_title, lasten_seo_description, lasten_johdanto, quiz_pack_rounds(kohderyhma, quiz_pack_items(count))")
    .eq("site_id", siteId)
    .eq("status", "published")
    .order("jarjestys", { ascending: true })
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data.map(({ quiz_pack_rounds, ...p }) => {
    // Kysymysmäärä viittauksista (RPC jättää pois julkaisemattomien visojen kysymykset; julkaistussa paketissa niitä ei ole).
    const kr = ((quiz_pack_rounds ?? []) as { kohderyhma: string; quiz_pack_items: { count: number }[] }[])
      .map((r) => ({ lapset: r.kohderyhma === "lapset", n: r.quiz_pack_items?.[0]?.count ?? 0 }))
      .filter((r) => r.n > 0);
    const summa = (lapset: boolean) => kr.filter((r) => r.lapset === lapset).reduce((a, r) => a + r.n, 0);
    return {
      ...(p as Paketti),
      kierroksia: { aikuiset: kr.filter((r) => !r.lapset).length, lapset: kr.filter((r) => r.lapset).length },
      kysymyksia: { aikuiset: summa(false), lapset: summa(true) },
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

/** Sarjan näyttönimi slugista: 'pubivisa' → 'Pubivisa' (sarjan pääsivun h1). */
export const sarjaNimi = (sarja: string) => sarja.charAt(0).toUpperCase() + sarja.slice(1);

/** ?esikatselu=… pakettisivun, televisionäkymän ja tulosteen välisiin linkkeihin. Taso on osoitteessa
 *  (/visapaketti/<slug>/lapset, 1.11.2026), ei enää ?taso-parametrissa. */
export const hakuosa = (esikatselu: string | null) => (esikatselu ? `?${new URLSearchParams({ esikatselu })}` : "");

/** 'molemmat'-paketin lastenversion osoite. */
export const lapsetHref = (p: Pick<Paketti, "slug" | "sarja">) => `${pakettiHref(p)}/lapset`;

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

/** Kokoelmasivun linkkikortti: julkaistu paketti, jonka teema on kokoelman slug tai nimi ("Juhlat" ↔ juhlat).
 *  Kausipaketti vain kauden aikana (lähin kauden loppu ensin), ajaton aina. Sarjoista vain uusin painos. */
export async function kokoelmanPaketti(kokoelma: { slug: string; nimi: string }, nyt: Date = new Date()): Promise<PakettiRivi | null> {
  const avaimet = [kokoelma.slug, kokoelma.nimi].map((x) => x.toLocaleLowerCase("fi"));
  const omat = landinginPaketit(await listaaVisapaketit()).filter((p) => p.teema && avaimet.includes(p.teema.toLocaleLowerCase("fi")));
  const kaudella = omat
    .map((p) => ({ p, j: kauttaJaljella(p, nyt) }))
    .filter((x): x is { p: PakettiRivi; j: number } => x.j !== null)
    .sort((a, b) => a.j - b.j);
  return kaudella[0]?.p ?? omat.find((p) => !p.kausi_alku) ?? null;
}

/** Visan osiotagi → visapaketti, johon tulosnäkymä linkittää (SEO-brief 1.11.2026: jouluvisojen tulossivut). */
const TAGIN_PAKETTI: Record<string, { slug: string; alku: string }> = {
  joulu: { slug: "joulu", alku: "Pidätkö pikkujoulut? " },
};

/** Tulosnäkymän tekstilinkki: "Pidätkö pikkujoulut? Valmis joulun tietovisa 40 kysymyksellä". Kysymysmäärä kannasta. */
export async function tulosPakettiLinkki(tagit: string[] | null): Promise<{ href: string; teksti: string } | null> {
  const osuma = (tagit ?? []).map((t) => TAGIN_PAKETTI[t]).find(Boolean);
  if (!osuma) return null;
  const p = (await listaaVisapaketit()).find((r) => r.slug === osuma.slug);
  if (!p) return null;
  const n = p.kysymyksia.aikuiset || p.kysymyksia.lapset;
  return { href: korttiHref(p), teksti: `${osuma.alku}Valmis ${p.otsikko.toLocaleLowerCase("fi")} ${n} kysymyksellä` };
}

/* ─── Kysymykset ja tasot ───────────────────────────────────────── */

/** Kysymysteksti paketissa: lähdevisan "BONUS:"-etuliite ei merkitse paketissa mitään (lasten visojen viimeinen kysymys). */
export const kysymysTeksti = (q: Pick<PakettiKysymys, "question_text">) => q.question_text.replace(/^\s*BONUS:\s*/i, "");

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

/** Metarivi datasta: "40 kysymystä · 4 kierrosta · noin 45 min" (SEO-brief 1.11.2026: kysymysmäärä ensin).
 *  Ilman tasoa (kortit): 'molemmat'-paketista aikuisten luvut + "aikuiset ja lapset". Tason kanssa (pakettisivu):
 *  sen tason luvut; lastenversiolla ei kestoa, koska kesto_min on aikuisten kierrosten arvio. */
export function metarivi(p: Pick<Paketti, "kohderyhma" | "kesto_min">, kierroksia: Maarat, kysymyksia: Maarat, taso?: Taso): string[] {
  const t: Taso = taso ?? (p.kohderyhma === "lapset" ? "lapset" : "aikuiset");
  const valitse = (m: Maarat) => (p.kohderyhma === "molemmat" ? m[t] : m[t] || m.aikuiset || m.lapset);
  const n = valitse(kysymyksia), k = valitse(kierroksia);
  const osat = [`${n} kysymystä`, `${k} ${k === 1 ? "kierros" : "kierrosta"}`];
  if (p.kesto_min && !(p.kohderyhma === "molemmat" && t === "lapset")) osat.push(`noin ${p.kesto_min} min`);
  if (p.kohderyhma === "molemmat" && !taso) osat.push("aikuiset ja lapset");
  return osat;
}

export const kierrosmaarat = (vp: Visapaketti): Maarat => ({
  aikuiset: vp.kierrokset.filter((k) => k.kohderyhma !== "lapset" && k.kysymykset.length).length,
  lapset: vp.kierrokset.filter((k) => k.kohderyhma === "lapset" && k.kysymykset.length).length,
});

export const kysymysmaarat = (vp: Visapaketti): Maarat => {
  const summa = (lapset: boolean) =>
    vp.kierrokset.filter((k) => (k.kohderyhma === "lapset") === lapset).reduce((a, k) => a + k.kysymykset.length, 0);
  return { aikuiset: summa(false), lapset: summa(true) };
};

const INESSIIVI = ["", "yhdessä", "kahdessa", "kolmessa", "neljässä", "viidessä", "kuudessa", "seitsemässä", "kahdeksassa", "yhdeksässä", "kymmenessä"];

/** Tekstin paikkamerkit kannan luvuista: {n} = 40, {kysymykset} = "40 kysymystä",
 *  {kierroksissa} = "neljässä kierroksessa" (johdanto, hakuotsikko ja -kuvaus; luvut eivät vanhene käsin kirjoitettuina). */
export function tayta(teksti: string, kysymyksia: number, kierroksia: number): string {
  const kierr = `${INESSIIVI[kierroksia] ?? kierroksia} kierroksessa`;
  return teksti
    .replaceAll("{n}", String(kysymyksia))
    .replaceAll("{kysymykset}", `${kysymyksia} ${kysymyksia === 1 ? "kysymys" : "kysymystä"}`)
    .replaceAll("{kierroksissa}", kierr);
}

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

/** Paketin viimeisin muutos (dateModified, "Päivitetty"): updated_at tai julkaisu, kumpi on myöhempi.
 *  Kierrosten ja kysymysviittausten muutokset päivittävät updated_at-kentän (triggeri 1.11.2026). */
export function muokattu(p: Pick<Paketti, "published_at" | "updated_at">): string | null {
  const t = [p.published_at, p.updated_at].filter((x): x is string => !!x).sort((a, b) => Date.parse(b) - Date.parse(a));
  return t[0] ?? null;
}

/** Kysymys viittaa vaihtoehtoihin ("Mikä seuraavista…"): vaihtoehdot näytetään, muuten kysymykseen ei voi vastata.
 *  Muut kysymykset esitetään avoimina kuten visaillassa (design: kysymys + vastaus, ei vaihtoehtoja). */
export const viittaaVaihtoehtoihin = (q: Pick<PakettiKysymys, "question_text">) =>
  /seuraavista|vaihtoehdo|näistä/i.test(q.question_text);

/** Kuva on osa kysymystä vain kuvakysymyksissä. Lasten tekstikysymysten kuvitus näkyy televisionäkymässä. */
export const kuvaOnKysymys = (q: Pick<PakettiKysymys, "question_type" | "image_url">) =>
  q.question_type === "kuva" && !!q.image_url;

/** Kuvakysymyksen kevyt versio pakettisivulle, juontajalle ja tulosteeseen (esikatselutesti 29.10.: lasten paketti
 *  latasi 2,6 Mt, osa Storagen alkuperäisistä 500–650 kt). Storagen kuvat Supabasen kuvamuunnoksen kautta 640 px
 *  leveinä (selain saa WebP:n), omat kuvat 720 px:n kopioina (pieniKuva). Televisionäkymä käyttää alkuperäisiä.
 *  resize=contain on pakollinen: pelkällä leveydellä Supabase säilyttää alkuperäisen korkeuden ja rajaa kuvan keskeltä
 *  (900 × 675 → 640 × 675, Heikin puhelintesti 29.10.). */
export function kevytKuva(url: string): string {
  const m = url.match(/^(https:\/\/[^/]+\/storage\/v1)\/object\/public\/(.+)$/);
  return m ? `${m[1]}/render/image/public/${m[2]}?width=640&quality=70&resize=contain` : pieniKuva(url);
}

/* ─── Reitit ───────────────────────────────────────────────────── */

export type Sivu = {
  vp: Visapaketti;
  /** Sivun oma osoite ilman parametreja (näkymälinkkien pohja). */
  polku: string;
  /** Kanoninen osoite. Sarjan voimassa oleva painos → sarjan pääsivu (sama sisältö), muuten polku. */
  kanoninen: string;
  /** Sarjan pääsivu: sarjan muut painokset ("Aiemmat painokset"). */
  painokset: PakettiRivi[] | null;
  /** Osoitteen kiinnittämä taso: /visapaketti/<slug>/lapset = lapset, muuten null (paketin oletustaso). */
  taso: Taso | null;
  /** Sarjan arkistoitunut painos (ei uusin): oma otsikko, oma kanoninen osoite, sitemapissa, linkki uusimpaan. */
  arkisto: boolean;
};

/** Lastenversion osoitteen viimeinen osa: /visapaketti/<slug>/lapset. */
export const LAPSET_OSA = "lapset";

/** /visapaketti/<slug>[/<painos>|/lapset] → paketti. Sarjan nimi ilman painosta = uusin julkaistu painos.
 *  SEO-brief 1.11.2026 — sarjan painosten sääntö (toimii automaattisesti joka neljännes):
 *  - voimassa oleva painos (= sarjan uusin julkaistu, jonka /visapaketti/<sarja> näyttää): kanoninen osoite on
 *    sarjan pääsivu, eikä painososoite ole sitemapissa;
 *  - kun uudempi painos julkaistaan, edellinen muuttuu arkistoksi: oma kanoninen osoite, oma otsikko
 *    ("Pubivisa loka–joulukuu 2026 – 40 kysymystä vastauksineen"), sitemapiin ja linkki "Uusin pubivisa →". */
export async function haeSivu(slug: string, painos: string | null, esikatselu?: string | null): Promise<Sivu | null> {
  if (painos === LAPSET_OSA) {
    const vp = await haeVisapaketti(slug, esikatselu);
    if (vp && vp.paketti.kohderyhma === "molemmat" && !vp.paketti.sarja) {
      const polku = lapsetHref(vp.paketti);
      return { vp, polku, kanoninen: polku, painokset: null, taso: "lapset", arkisto: false };
    }
  }
  if (painos) {
    const vp = await haeVisapaketti(`${slug}-${painos}`, esikatselu);
    if (!vp || vp.paketti.sarja !== slug) return null;
    const polku = pakettiHref(vp.paketti);
    const uusin = sarjanPainokset(await listaaVisapaketit(), slug)[0];
    // Luonnoksen esikatselu ei ole arkisto, vaikka julkaistu uusin on toinen painos.
    const voimassa = !uusin || uusin.slug === vp.paketti.slug || vp.paketti.status !== "published";
    return { vp, polku, kanoninen: voimassa ? sarjaHref(slug) : polku, painokset: null, taso: null, arkisto: !voimassa };
  }
  const suora = await haeVisapaketti(slug, esikatselu);
  if (suora) {
    const polku = pakettiHref(suora.paketti);
    return { vp: suora, polku, kanoninen: polku, painokset: null, taso: null, arkisto: false };
  }
  const painokset = sarjanPainokset(await listaaVisapaketit(), slug);
  if (!painokset.length) return null;
  const vp = await haeVisapaketti(painokset[0].slug);
  if (!vp) return null;
  const polku = sarjaHref(slug);
  return { vp, polku, kanoninen: polku, painokset, taso: null, arkisto: false };
}

/** Sivun näkyvä nimi (H1): sarjan pääsivulla sarjan nimi, lastenversiolla lasten_otsikko. */
export function sivunNimi(sivu: Sivu): string {
  const p = sivu.vp.paketti;
  if (sivu.taso === "lapset") return p.lasten_otsikko ?? `${p.otsikko} lapsille`;
  return sivu.painokset && p.sarja ? sarjaNimi(p.sarja) : p.otsikko;
}

/** Sivun taso: osoitteen kiinnittämä tai paketin oma (molemmat → aikuiset). */
export const sivunTaso = (sivu: Sivu): Taso => sivu.taso ?? tasoParametrista(sivu.vp.paketti, null);

/** Sivun tason kysymys- ja kierrosmäärä. */
const sivunLuvut = (sivu: Sivu) => {
  const taso = sivunTaso(sivu);
  return { n: kysymysmaarat(sivu.vp)[taso], k: kierrosmaarat(sivu.vp)[taso] };
};

/** Hakuotsikko ilman " | Tietoniekka" -päätettä. */
export function sivunHakuotsikko(sivu: Sivu): string {
  const p = sivu.vp.paketti;
  const { n, k } = sivunLuvut(sivu);
  if (sivu.taso === "lapset") return tayta(p.lasten_seo_title ?? `${sivunNimi(sivu)} – {kysymykset} vastauksineen`, n, k);
  if (sivu.arkisto) {
    const painos = p.painos_nimi ? ` ${p.painos_nimi.charAt(0).toLocaleLowerCase("fi")}${p.painos_nimi.slice(1)}` : "";
    return `${p.otsikko}${painos} – ${n} kysymystä vastauksineen`;
  }
  return tayta(p.seo_title ?? (p.painos_nimi ? `${p.otsikko} – ${p.painos_nimi}` : p.otsikko), n, k);
}

/** Hakukuvaus ja johdanto sivun tason luvuilla. */
export function sivunTekstit(sivu: Sivu): { kuvaus: string | null; johdanto: string | null } {
  const p = sivu.vp.paketti;
  const { n, k } = sivunLuvut(sivu);
  const lapsille = sivu.taso === "lapset";
  const kuvaus = lapsille ? p.lasten_seo_description : p.seo_description;
  const johdanto = lapsille ? p.lasten_johdanto : p.johdanto;
  return { kuvaus: kuvaus ? tayta(kuvaus, n, k) : null, johdanto: johdanto ? tayta(johdanto, n, k) : null };
}
