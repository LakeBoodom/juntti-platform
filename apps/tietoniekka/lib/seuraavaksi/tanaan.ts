// "PELAA SEURAAVAKSI": PAIKKA 3 "TÄNÄÄN" (Heikki 11.11.2026, kierros 3 kohta 3) kaikissa pilotin visoissa.
// Portaat (ensimmäinen pelaamaton voittaa; pelattu-tieto on selaimessa, joten palvelin antaa kaikki järjestyksessä):
//   a) tämän päivän tapahtuma, joka liittyy lähdevisan aiheeseen → siihen liittyvä visa
//   b) Päivän visa, jos sillä on ajankohtainen syy (uutinen, muistovisa, vuosipäivä, tapahtuma tänään)
//   c) päivän synttärisankarin visa
//   d) Mikä maa? (päivän peli), sitten muut päivän pelit (Päivän visa ilman ajankohtaista syytä)
//   e) jos kaikki pelattu: viikon suosituin visa, merkki "Suosittu"
// Päivän tapahtumat tulevat nyt Päivän visan ajastuksesta (schedule_rules: toimituksen ajankohtaisuusteksti päivälle) ja
// synttärisankarista: ne ovat ainoa päivän data kannassa. Tänään-sivu on vielä CD-luonnos (kierros 3, 6.11.) ilman omaa
// ottelu- ja tapahtumadataa; kun se tulee, sen tapahtumat lisätään paivanTapahtumat-listaan, eikä portaita tarvitse muuttaa.
// Syyrivi tulee aina päivän datasta: "tänään"-väitettä ei koskaan ilman päivän riviä. Muistovisassa ei live-pistettä.
import type { SupabaseClient } from "@supabase/supabase-js";
import { visaHref } from "@/lib/visaHref";
import { visanKorttikuva } from "@/lib/kokoelmat/visanKorttikuva";
import { henkiloKuva } from "@/lib/henkilokuvat";
import { SITE_SLUG } from "@/lib/supabase";
import { muotoileSankari, type SankariRivi } from "@/lib/paivanSankari";
import { MM_JULKAISU, MM_NIMI, MM_SIVU } from "@/lib/vihjepeli/mikamaa";
import { MIKA_MAA_RIVI } from "./pelirivit";
import type { Ehdokas } from "./tyypit";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Sb = SupabaseClient<any, any, any>;

export type KorttiRivi = {
  id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null;
  collection: string | null; category: string | null; genre: string | null; hero_image: string | null;
  hero_focal_x: number | null; hero_focal_y: number | null; game_mode: string | null; target_age: string | null;
  suosio_90pv?: number | null;
};
const KORTTI = "id, slug, custom_slug, title, display_title, collection, category, genre, hero_image, hero_focal_x, hero_focal_y, game_mode, target_age, suosio_90pv";
const kelpaa = (r: KorttiRivi) => r.game_mode !== "mega" && r.target_age !== "4-7" && r.target_age !== "8-12";

type Intro = { headline: string | null; text: string | null; auto: boolean };
/** Päivän raakadata: haetaan ennen paikkoja 1–2, jotta päivän visa ja sankari varataan paikalle 3. */
export type Paiva = {
  iso: string;
  /** "11.11." */
  pvm: string;
  paivanVisa: { id: string; intro: Intro } | null;
  sankari: SankariRivi | null;
  /** RPC suosituimmat_visat_7pv; null = funktiota ei vielä ole (ennen migraatiota) → 90 päivän suosio. */
  suositut7: string[] | null;
};

/** Päivän data. `testipaiva` (vain esikatselussa ja paikallisesti): Päivän visa luetaan ajastuksesta suoraan. */
export async function haePaiva(sb: Sb, iso: string, testipaiva: boolean): Promise<Paiva> {
  const [, kk, pv] = iso.split("-").map(Number);
  const { data: site } = await sb.from("sites").select("id").eq("slug", SITE_SLUG).maybeSingle();
  const siteId = (site as { id: string } | null)?.id ?? null;
  const tyhja = { data: null, error: null };
  const [pvRes, sRes, suosRes] = await Promise.all([
    !siteId ? Promise.resolve(tyhja)
      : testipaiva
        ? sb.from("schedule_rules").select("content_id, intro_headline, intro_text, auto_filled").eq("site_id", siteId)
            .eq("content_type", "quiz").eq("scheduled_date", iso).eq("active", true).limit(1)
        : sb.rpc("paivan_visa_tanaan" as never, { p_site: siteId } as never),
    siteId ? sb.rpc("paivan_sankari" as never, { p_site: siteId, p_date: iso } as never) : Promise.resolve(tyhja),
    sb.rpc("suosituimmat_visat_7pv" as never, { p_n: 15 } as never),
  ]);
  type PvRivi = { quiz_id?: string; content_id?: string; intro_headline: string | null; intro_text: string | null; auto_filled: boolean | null };
  const r = ((pvRes.data ?? []) as PvRivi[])[0];
  const id = r?.quiz_id ?? r?.content_id ?? null;
  return {
    iso,
    pvm: `${pv}.${kk}.`,
    paivanVisa: id ? { id, intro: { headline: r.intro_headline?.trim() || null, text: r.intro_text?.trim() || null, auto: !!r.auto_filled } } : null,
    sankari: ((sRes.data ?? []) as SankariRivi[])[0] ?? null,
    suositut7: suosRes.error ? null : ((suosRes.data ?? []) as Array<{ quiz_id: string }>).map((x) => x.quiz_id),
  };
}

/* ── Päivän visan ajankohtaisuus ja syyrivi ─────────────────────────────────────────────────────────────────────────
   Ajankohtainen = toimitus on kirjoittanut päivälle syyn (otsikko, ei automaattitäyttö) ja otsikossa tai tekstissä on päivän
   merkki (tänään, eilen, nyt, vuotta, elinvuodet, poissa …). Pelkkä kysymysotsikko ("Kuinka hyvin tunnet …?") ei ole syy. */
const PAIVAN_MERKKI = /\btänään\b|\btänä\s+(iltana|päivänä)|\beilen\b|\bhuomenna\b|\bjuuri nyt\b|\bnyt\b|\bvuotta\b|\bon poissa\b|\bkuoli\b|\b1[89]\d\d–20\d\d\b|\b20\d\d–20\d\d\b/i;
const MUISTO = /\b1[89]\d\d–20\d\d\b|\b20\d\d–20\d\d\b|\bon poissa\b|\bkuoli\b|\bmuistel/i;

export function onAjankohtainen(i: Intro): boolean {
  if (i.auto || !i.headline) return false;
  return PAIVAN_MERKKI.test(i.headline) || PAIVAN_MERKKI.test(i.text ?? "");
}
export const onMuisto = (i: Intro) => MUISTO.test(i.headline ?? "") || MUISTO.test(i.text ?? "");

const lauseet = (s: string | null) => (s ?? "").split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
const siisti = (s: string) => s.replace(/[.]$/, "").trim();
/** Lyhin päivän lause, jossa on "tänään" (≤ 60 merkkiä), muuten otsikko. Muistovisassa aina otsikko (elinvuodet). */
export function syyrivi(i: Intro): string | null {
  if (!i.headline) return null;
  if (onMuisto(i)) return siisti(i.headline);
  const tanaan = [i.headline, ...lauseet(i.text)].filter((s) => /\btänään\b|\btänä\s+iltana\b/i.test(s) && !s.endsWith("?") && s.length <= 60);
  tanaan.sort((a, b) => a.length - b.length);
  return siisti(tanaan[0] ?? i.headline);
}

function sankarinSyy(s: SankariRivi): { rivi: string; muisto: boolean } {
  const m = muotoileSankari(s);
  if (m.tapaus === "muisto") return { rivi: `Syntyi tänään ${s.ika} vuotta sitten`, muisto: true };
  if (m.tapaus === "pyorea") return { rivi: `Täyttää tänään pyöreät ${s.ika} vuotta`, muisto: false };
  return { rivi: `Täyttää tänään ${s.ika} vuotta`, muisto: false };
}

export type TanaanLahde = {
  /** Liittyykö visa (quizzes.id) lähdevisan aiheeseen: sama laji tai yhteinen aihe (hae.ts päättää). */
  liittyy: (quizId: string) => boolean;
};

/** Paikan 3 ehdokkaat portaittain a–e. `kaytetty` = paikkojen 1–2 ja lähteen visat (ei kahdesti). */
export async function tanaanEhdokkaat(sb: Sb, p: Paiva, l: TanaanLahde, kaytetty: Set<string>, n = 5): Promise<Ehdokas[]> {
  const idt = [...new Set([p.paivanVisa?.id, ...(p.suositut7 ?? [])].filter((x): x is string => !!x))];
  const [{ data: rivit }, { data: varalla }] = await Promise.all([
    idt.length ? sb.from("quiz_cards" as never).select(KORTTI).in("id", idt) : Promise.resolve({ data: [] }),
    p.suositut7 ? Promise.resolve({ data: [] }) : sb.from("quiz_cards" as never).select(KORTTI).order("suosio_90pv", { ascending: false }).limit(20),
  ]);
  const kortit = new Map(((rivit ?? []) as KorttiRivi[]).map((r) => [r.id, r]));
  /* Henkilövisan kuva tulee celebrities-riviltä (kuten etusivun Päivän visa -kortissa), visalla itsellään ei ole kuvaa. */
  const kaikkiRivit = [...kortit.values(), ...((varalla ?? []) as KorttiRivi[])];
  const ilmanKuvaa = kaikkiRivit.filter((r) => !visanKorttikuva(r).kuva).map((r) => r.id);
  const { data: hk } = ilmanKuvaa.length
    ? await sb.from("celebrities").select("trivia_quiz_id, image_url").in("trivia_quiz_id", ilmanKuvaa)
    : { data: [] };
  const hKuvat = new Map(((hk ?? []) as Array<{ trivia_quiz_id: string; image_url: string | null }>).map((h) => [h.trivia_quiz_id, henkiloKuva(h.image_url)]));
  const kuvaa = (r: KorttiRivi) => {
    const k = visanKorttikuva(r);
    return k.kuva ? k : { kuva: hKuvat.get(r.id) ?? null, kuvaPos: "50% 22%" };
  };
  const merkki = `Tänään · ${p.pvm}`;

  const pvKortti = p.paivanVisa ? kortit.get(p.paivanVisa.id) : undefined;
  const pv = pvKortti && kelpaa(pvKortti) && !kaytetty.has(pvKortti.id) ? pvKortti : null;
  const pvIntro = p.paivanVisa?.intro;
  const pvAjank = !!pv && !!pvIntro && onAjankohtainen(pvIntro);
  const pvEhdokas = (porras: string, syy: boolean): Ehdokas => {
    const k = kuvaa(pv!);
    const muisto = syy && onMuisto(pvIntro!);
    return {
      tyyppi: "visa", id: pv!.id, nimi: pv!.display_title ?? pv!.title, href: `${visaHref(pv!)}${pv!.slug ? "?" : "&"}paivan_visa=1`,
      kuva: k.kuva, kuvaPos: k.kuvaPos, merkki, live: !muisto, rivi: syy ? syyrivi(pvIntro!) : null,
      kuvaton: "Päivän visa", porras, pelattu: { tapa: "paivan-visa" },
    };
  };
  const s = p.sankari && !kaytetty.has(p.sankari.quiz_id) ? p.sankari : null;
  const sankariEhdokas = (porras: string): Ehdokas => {
    const m = muotoileSankari(s!);
    const syy = sankarinSyy(s!);
    return {
      tyyppi: "visa", id: s!.quiz_id, nimi: s!.quiz_title, href: m.playHref, kuva: m.kuva, kuvaPos: m.kuvaPos,
      merkki, live: !syy.muisto, rivi: syy.rivi, kuvaton: "Synttärit", porras,
    };
  };

  const ulos: Ehdokas[] = [];
  const lisaa = (e: Ehdokas) => {
    if (kaytetty.has(e.id)) return;
    kaytetty.add(e.id);
    ulos.push(e);
  };
  const pvLiittyy = pvAjank && l.liittyy(pv!.id);
  const sLiittyy = !!s && l.liittyy(s.quiz_id);
  /* a) päivän tapahtuma lähteen aiheesta */
  if (pvLiittyy) lisaa(pvEhdokas("p3.tanaan:aihe", true));
  if (sLiittyy) lisaa(sankariEhdokas("p3.tanaan:aihe-sankari"));
  /* b) Päivän visa, jolla on ajankohtainen syy */
  if (pvAjank && !pvLiittyy) lisaa(pvEhdokas("p3.tanaan:paivan-visa", true));
  /* c) synttärisankari */
  if (s && !sLiittyy) lisaa(sankariEhdokas("p3.tanaan:sankari"));
  /* d) Mikä maa?, sitten muut päivän pelit */
  if (p.iso >= MM_JULKAISU) {
    lisaa({
      tyyppi: "peli", id: "mika-maa", nimi: MM_NIMI, href: MM_SIVU, kuva: "/20/mika-maa/tunnus.webp", kuvaPos: "50% 50%",
      merkki, live: true, rivi: MIKA_MAA_RIVI, kuvaton: "Päivän peli", porras: "p3.tanaan:mika-maa", pelattu: { tapa: "mika-maa" },
    });
  }
  if (pv && !pvAjank) lisaa(pvEhdokas("p3.tanaan:paivan-visa-arki", false));
  /* e) viikon suosituin */
  const suositut = p.suositut7
    ? p.suositut7.map((id) => kortit.get(id)).filter((r): r is KorttiRivi => !!r)
    : ((varalla ?? []) as KorttiRivi[]);
  let lisatty = 0;
  for (const r of suositut.filter(kelpaa)) {
    if (lisatty >= n) break;
    if (kaytetty.has(r.id)) continue;
    const k = kuvaa(r);
    lisaa({
      tyyppi: "visa", id: r.id, nimi: r.display_title ?? r.title, href: visaHref(r), kuva: k.kuva, kuvaPos: k.kuvaPos,
      merkki: "Suosittu", kuvaton: "Suosittu", porras: p.suositut7 ? "p3.suosituin-7pv" : "p3.suosituin-90pv",
    });
    lisatty++;
  }
  return ulos;
}
