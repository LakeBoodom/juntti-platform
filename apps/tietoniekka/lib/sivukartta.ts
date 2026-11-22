// SIVUKARTAN RIVIT — yksi lähde sitemap.xml:lle ja IndexNow-ilmoituksille (15.11.2026).
// IndexNow-funktio (supabase/functions/indexnow) lukee valmiin sitemap.xml:n, joten jos osoite on sivukartassa,
// se kuuluu IndexNow'n piiriin, ja päinvastoin.
//
// lastmod (brief 15.11.2026 §3.6): aina todellinen muutospäivä, ei rakennushetki. Jos sivutyypille ei ole
// aikaleimaa, lastmod jätetään pois (koodissa määritellyt sivut: Järjestä-pakat, Lasten visat, tietosuoja …).
//   visat            quizzes.updated_at (kysymysten muutos päivittää sen triggerillä 15.11.2026)
//   megavisat        /peli?mega=<slug>: megan updated_at (Heikki 14.–15.11.: megat haussa ja sivukartassa)
//   henkilöt         celebrities.updated_at tai henkilövisan updated_at, kumpi myöhempi
//   kaupungit        kaupungit.updated_at tai kaupungin visojen updated_at, myöhäisin
//   kokoelmat        page_content.updated_at tai kokoelman visojen updated_at, myöhäisin
//   kuvavisat        kuvavisas.updated_at kortistoittain
//   visapaketit      muokattu() (updated_at tai julkaisu)
//   päivittäin vaihtuvat (etusivu, päivän pelit)  tämä päivä Suomen aikaa
//   viikoittain vaihtuvat (viikon reitit, Viikkovisa)  kuluvan viikon maanantai Suomen aikaa
import type { MetadataRoute } from "next";
import { TEEMAT, TUPLA_SIVU } from "@/lib/tuplaTaiKuitti";
import { KL_SIVU } from "@/lib/kuntaliitos";
import { TEEMAT as KUMPI_TEEMAT, SEURAT as KUMPI_SEURAT } from "@/lib/kumpi/teemat";
import { JK_SIVU } from "@/lib/junankuljettaja";
import { JULKAISTUT, pakkaHref } from "@/lib/jarjesta/pakat";
import { HUB_HREF, IKA_PAKAT } from "@/lib/jarjesta/hub";
import { VPK_SIVU } from "@/lib/vaalipiiriketju";
import { RN_SIVU, RN_USA_SIVU } from "@/lib/rajanaapurit";
import { KARTTAPELIT_SIVU } from "@/lib/karttapelit";
import { MM_SIVU } from "@/lib/vihjepeli/mikamaa";
import { MAA_JULKAISU } from "@/lib/vihjepeli/aiheet/maa";
import { maanantai } from "@/lib/reittipeli/viikonReitit";
import { helsinginPaiva } from "@/lib/aika";
import { NAV_COLLECTIONS } from "@/lib/nav";
import { KATEGORIAT } from "@/lib/kuvavisat2026";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { henkiloSlug } from "@/lib/henkiloSlug";
import { KAUPUNGIT_LISTA, haeKaupunkilista, kaupunkiHref } from "@/lib/kaupunkisivu";
import { KUUKAUDET, kuukausiSlug } from "@/lib/henkiloRyhmat";
import { LAPSET_SIVU, lapsetNakyvissa } from "@/lib/lapset/data";
import {
  VP_LANDING, type PakettiRivi, lapsetHref, listaaVisapaketit, muokattu, pakettiHref, sarjaHref, sarjanPainokset, valitsinNakyy,
} from "@/lib/visapaketit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

/* Kokoelmahubit: navigaation kokoelmat (sama lista kuin /kokoelmat) + Kuvavisat, joka on navigaatiossa pelimuotona
   mutta jolla on oma hub-sivunsa. Omalla osoitteella olevat kokoelmat (Lasten visat → /lapset) ovat omina riveinään. */
const COLLECTION_HUBS = [...NAV_COLLECTIONS.filter((c) => !c.href).map((c) => c.slug), "kuvavisat"];

type Muutos = Date | string | null | undefined;
type Tiheys = "daily" | "weekly" | "monthly" | "yearly";

/** Myöhäisin aikaleima; null, jos yhtään ei ole. */
export function myohaisin(...ajat: Muutos[]): Date | null {
  let paras: Date | null = null;
  for (const a of ajat) {
    if (!a) continue;
    const d = a instanceof Date ? a : new Date(a);
    if (!Number.isNaN(d.getTime()) && (!paras || d > paras)) paras = d;
  }
  return paras;
}

type Visa = { slug: string; updated_at: string | null; published_at: string | null; game_mode: string | null; collection: string | null; paikkakunnat: string[] | null };

/** Julkaistut visat sivuittain (PostgREST palauttaa kerralla enintään 1000 riviä). */
async function haeVisat(): Promise<Visa[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const siteId = await getSiteId();
  const kaikki: Visa[] = [];
  for (let alku = 0; alku < 100_000; alku += 1000) {
    let q = sb
      .from("quizzes")
      .select("slug, updated_at, published_at, game_mode, collection, paikkakunnat" as never)
      .eq("status", "published")
      .not("slug", "is", null);
    if (siteId) q = q.eq("site_id", siteId);
    const { data, error } = await q.order("id").range(alku, alku + 999);
    if (error) break;
    const rivit = (data ?? []) as unknown as Visa[];
    kaikki.push(...rivit);
    if (rivit.length < 1000) break;
  }
  return kaikki;
}

type Henkilo = { name: string; updated_at: string | null; birth_date: string | null; trivia_quiz_id: string | null };

async function haeHenkilot(): Promise<Henkilo[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  const { data } = await sb
    .from("celebrities")
    .select("name, updated_at, birth_date, trivia_quiz_id" as never)
    .eq("site_id", siteId)
    .limit(2000);
  return (data ?? []) as unknown as Henkilo[];
}

/** Visojen updated_at id:n mukaan henkilösivuja varten (henkilövisan muutos muuttaa henkilösivua). */
async function haeVisojenMuutokset(idt: string[]): Promise<Map<string, string>> {
  const sb = getSupabase();
  const m = new Map<string, string>();
  if (!sb || !idt.length) return m;
  for (let i = 0; i < idt.length; i += 300) {
    const { data } = await sb.from("quizzes").select("id, updated_at" as never).in("id", idt.slice(i, i + 300));
    for (const r of (data ?? []) as unknown as Array<{ id: string; updated_at: string | null }>) if (r.updated_at) m.set(r.id, r.updated_at);
  }
  return m;
}

async function haeTaulunMuutokset(taulu: "kaupungit" | "page_content" | "kuvavisas", avain: "slug" | "type"): Promise<Map<string, Date>> {
  const sb = getSupabase() as unknown as { from: (t: string) => { select: (s: string) => { limit: (n: number) => PromiseLike<{ data: unknown }> } } } | null;
  const m = new Map<string, Date>();
  if (!sb) return m;
  const { data } = await sb.from(taulu).select(`${avain}, updated_at`).limit(5000);
  for (const r of (data ?? []) as Array<Record<string, string | null>>) {
    const k = r[avain];
    const d = myohaisin(m.get(k ?? ""), r.updated_at);
    if (k && d) m.set(k, d);
  }
  return m;
}

export async function sivukartanRivit(): Promise<MetadataRoute.Sitemap> {
  /* muutos: Date, ISO-aikaleima tai päivämäärä ("2026-11-15"); puuttuessa lastmod jää pois. */
  const u = (polku: string, changeFrequency: Tiheys, priority: number, muutos?: Muutos): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${polku}`, ...(muutos ? { lastModified: muutos } : {}), changeFrequency, priority,
  });
  const tanaan = helsinginPaiva().iso;
  const viikko = maanantai(tanaan);

  const [visat, henkilot, kaupunkiMuutos, sivuMuutos, kuvavisaMuutos, paketit, kaupungit] = await Promise.all([
    haeVisat(), haeHenkilot(), haeTaulunMuutokset("kaupungit", "slug"), haeTaulunMuutokset("page_content", "slug"),
    haeTaulunMuutokset("kuvavisas", "type"), listaaVisapaketit(), haeKaupunkilista(),
  ]);
  const tavalliset = visat.filter((q) => q.game_mode !== "mega");
  const megat = visat.filter((q) => q.game_mode === "mega");
  const kaikkiKuvavisat = myohaisin(...kuvavisaMuutos.values());

  const staticPages: MetadataRoute.Sitemap = [
    u("/", "daily", 1.0, tanaan),
    u("/kokoelmat", "weekly", 0.9, myohaisin(...tavalliset.map((q) => q.published_at))),
    u("/megavisat", "weekly", 0.8, myohaisin(...megat.map((q) => q.updated_at))),
    u(TUPLA_SIVU, "weekly", 0.8),
    ...TEEMAT.map((t) => u(`${TUPLA_SIVU}/${t.slug}`, "daily", 0.6, tanaan)),
    /* Kumpi? 2.0 (julkaistu 20.11.2026): hubi, teemat, Oma seura -valinta ja 17 seurasivua. */
    u("/kumpi", "weekly", 0.8),
    u("/kumpi/paivan", "daily", 0.7),
    u("/kumpi/putki", "monthly", 0.6),
    ...KUMPI_TEEMAT.map((t) => u(`/kumpi/${t.slug}`, "weekly", 0.6)),
    u("/kumpi/seura", "monthly", 0.5),
    ...KUMPI_SEURAT.map((s) => u(`/kumpi/seura/${s.slug}`, "weekly", 0.5)),
    u(KL_SIVU, "daily", 0.7, viikko),
    u(KARTTAPELIT_SIVU, "weekly", 0.7, viikko),
    u(RN_SIVU, "daily", 0.7, viikko),
    u(RN_USA_SIVU, "weekly", 0.6, viikko),
    u(JK_SIVU, "daily", 0.7, tanaan),
    /* Järjestä-hub (päivän väärä rivi) ja kaikki pakat (osa C 31.10.2026: Ikäjärjestyksen aiheet pakkoina). */
    u(HUB_HREF, "daily", 0.7, tanaan),
    ...IKA_PAKAT.map((p) => u(p.href, "weekly", 0.6)),
    ...JULKAISTUT.map((p) => u(pakkaHref(p), "monthly", 0.6)),
    u(VPK_SIVU, "daily", 0.7, tanaan),
    /* Mikä maa? julkaisupäivästä (MM_JULKAISU, 7.11.2026) alkaen; sitä ennen sivu oli noindex. */
    ...(tanaan >= MAA_JULKAISU ? [u(MM_SIVU, "daily", 0.7, tanaan)] : []),
    u("/kuvavisa/viikko", "weekly", 0.7, viikko),
    /* Lasten visat (vaihe 5): /lapset vasta kun LAPSET_ENABLED; julkaistut lasten visat tulevat visasivuista. */
    ...(lapsetNakyvissa() ? [u(LAPSET_SIVU, "weekly", 0.8)] : []),
    u("/kuvien-lahteet", "monthly", 0.2),
    u("/tietosuoja", "yearly", 0.2),
  ];

  const collectionPages = COLLECTION_HUBS.map((slug) =>
    u(`/kokoelma/${slug}`, "weekly", 0.9,
      slug === "kuvavisat"
        ? myohaisin(kaikkiKuvavisat, sivuMuutos.get(slug))
        : myohaisin(sivuMuutos.get(slug), ...tavalliset.filter((q) => q.collection === slug).map((q) => q.updated_at))),
  );
  const kuvavisaPages = [...KATEGORIAT.map((k) => k.type), "kaupungit"].map((k) =>
    u(`/kuvavisa/${k}`, "weekly", 0.7, kuvavisaMuutos.get(k) ?? null));

  /* Visasivut /visa/<slug>. Megoilla ei ole /visa/-sivua (404); niiden indeksoitava osoite on pelkkä /peli?mega=<slug>
     (Heikki 14.11.2026: megat haussa, 15.11.2026: megat sivukarttaan). Muita /peli?…-osoitteita ei ole koskaan täällä. */
  const quizPages = tavalliset.map((q) => u(`/visa/${q.slug}`, "monthly", 0.7, q.updated_at));
  const megaPages = megat.map((q) => u(`/peli?mega=${encodeURIComponent(q.slug)}`, "monthly", 0.6, q.updated_at));

  // Henkilöhakemisto, synttärikuukaudet ja henkilösivut (erä B3; ryhmä- ja lajisivut poistuivat 25.10.2026).
  const visaMuutos = await haeVisojenMuutokset(henkilot.flatMap((h) => (h.trivia_quiz_id ? [h.trivia_quiz_id] : [])));
  const henkilonMuutos = (h: Henkilo) => myohaisin(h.updated_at, h.trivia_quiz_id ? visaMuutos.get(h.trivia_quiz_id) : null);
  const kuukausi = (h: Henkilo) => (h.birth_date ? Number(h.birth_date.slice(5, 7)) : 0);
  const henkiloPages: MetadataRoute.Sitemap = [
    u("/henkilot", "weekly", 0.8, myohaisin(...henkilot.map(henkilonMuutos))),
    ...KUUKAUDET.map((_, i) =>
      u(`/henkilot/kuukausi/${kuukausiSlug(i)}`, "monthly", 0.5, myohaisin(...henkilot.filter((h) => kuukausi(h) === i + 1).map(henkilonMuutos)))),
    ...henkilot.map((h) => u(`/henkilo/${henkiloSlug(h.name)}`, "weekly", 0.6, henkilonMuutos(h))),
  ];

  // Visapaketit (28.10.2026): landing, paketit ja sarjojen pääsivut. Ruutu- ja tulostenäkymät ovat noindex.
  // SEO-brief 1.11.2026: sarjan voimassa oleva painos ei ole sitemapissa (kanoninen = sarjan pääsivu), arkistoituneet
  // painokset ovat; 'molemmat'-paketin lastenversio omalla osoitteellaan (/visapaketti/<slug>/lapset).
  const sarjat = [...new Set(paketit.flatMap((p) => (p.sarja ? [p.sarja] : [])))];
  const voimassa = new Set(sarjat.map((s) => sarjanPainokset(paketit, s)[0]?.slug));
  const pvm = (p: PakettiRivi | undefined) => (p ? muokattu(p) : null);
  const pakettiPages: MetadataRoute.Sitemap = paketit.length
    ? [
        u(VP_LANDING, "weekly", 0.8, myohaisin(...paketit.map(pvm))),
        ...sarjat.map((s) => u(sarjaHref(s), "weekly", 0.8, pvm(sarjanPainokset(paketit, s)[0]))),
        ...paketit.flatMap((p) => {
          if (p.sarja) return voimassa.has(p.slug) ? [] : [u(pakettiHref(p), "monthly", 0.5, pvm(p))];
          return [
            u(pakettiHref(p), "weekly", 0.8, pvm(p)),
            ...(valitsinNakyy(p) ? [u(lapsetHref(p), "weekly", 0.8, pvm(p))] : []),
          ];
        }),
      ]
    : [];

  // Kaupunkisivut (7.11.2026): lista ja julkaistut kanoniset /kaupunki/<slug>; lyhyet /<slug>-osoitteet eivät ole täällä.
  const kaupunginMuutos = (slug: string) =>
    myohaisin(kaupunkiMuutos.get(slug), ...tavalliset.filter((q) => q.paikkakunnat?.includes(slug)).map((q) => q.updated_at));
  const kaupunkiPages: MetadataRoute.Sitemap = kaupungit.length
    ? [
        u(KAUPUNGIT_LISTA, "weekly", 0.8, myohaisin(...kaupungit.map((k) => kaupunginMuutos(k.slug)))),
        ...kaupungit.map((k) => u(kaupunkiHref(k.slug), "weekly", 0.8, kaupunginMuutos(k.slug))),
      ]
    : [];

  return [...staticPages, ...collectionPages, ...kaupunkiPages, ...kuvavisaPages, ...pakettiPages, ...henkiloPages, ...megaPages, ...quizPages];
}
