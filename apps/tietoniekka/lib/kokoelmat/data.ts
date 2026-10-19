// KOKOELMARUNKO — datakerros (runko §1 + §3, 19.10.2026). Hakee kokoelman visat, jakaa ne osioihin
// tagista (S3) ja laskee korttianatomian (S1) sekä katkaisun (S2). Komponentit vain piirtävät.
import { getSupabase } from "@/lib/supabase";
import { visaHref } from "@/lib/visaHref";
import { getCounts } from "@/lib/kokoelmaMaarat";
import { kokoelmanPelimuodot, type Pelimuoto } from "@/lib/pelimuodot";
import { naapurit, type KokoelmaKortti } from "./rekisteri";
import type { Kokoelma, KokoelmaOsio, RunkoVisa } from "./tyypit";

/** S2: ennen "Näytä kaikki" -nappia näkyy B + tämä määrä. */
export const KATKAISU = { mobiili: 6, desktop: 8 } as const;
/** S1: osion 9. visasta alkaen kaikki ovat C-rivejä. */
const A_ENINTAAN_PAIKKA = 8;

export type RunkoKortti = RunkoVisa & {
  /** A = kuva + teksti, C = listarivi. B on osion oma kenttä. */
  muoto: "A" | "C";
  /** Järjestysnumero B:n jälkeen (1 = ensimmäinen B:n jälkeen) — CSS-katkaisu (S2). */
  nro: number;
};

export type RunkoOsio = KokoelmaOsio & {
  b: RunkoVisa | null;
  kortit: RunkoKortti[];
  /** Julkaistujen visojen määrä osiossa. */
  maara: number;
  /** Piiloon jää vähintään yksi visa (näytetäänkö "Näytä kaikki" -nappi). */
  piilossaMobiili: number;
  piilossaDesktop: number;
};

export type RunkoData = {
  k: Kokoelma;
  osiot: RunkoOsio[];
  visoja: number;
  /** Heron Pelaa-nappi: palvelimella suosituin; selain vaihtaa palaavalle seuraavaan pelaamattomaan. */
  suosituin: { id: string; nimi: string; href: string } | null;
  jarjestys: Array<{ id: string; nimi: string; href: string }>;
  pelit: Pelimuoto[];
  lisaa: Array<KokoelmaKortti & { maara: number }>;
};

type Rivi = {
  id: string; slug: string | null; custom_slug: string | null; game_mode: string | null; title: string; display_title: string | null;
  genre: string | null; subcollection: string | null; category: string | null; play_count: number | null;
  question_count: number | null; section_tags: string[] | null; hero_image: string | null;
  hero_focal_x: number | null; hero_focal_y: number | null; target_age: string | null;
};

/** Näkymätön katkaisukohta (U+200B) jokaisen yhdysmerkin jälkeen — vain renderöinnissä, data ennallaan.
 *  Safari ei katkaise yhdysmerkistä, kun otsikossa on word-break: keep-all (Heikki 19.10.2026:
 *  "HÄMÄHÄKKIMIES-ELOKUVAT" leikkautui iPhonessa). Koko lasketaan pisinSana:lla yhdysmerkin osista. */
/*  Vain yhdyssanan sisällä (kirjain ennen viivaa): "Uuno Turhapuro -elokuvat" ei saa jättää viivaa rivin loppuun. */
/*  Yli TAVUTUSRAJA-kirjaimiset sanat saavat tavuviivamahdollisuudet (U+00AD, tavuta) — muuten koko kutistui
    alle 11 px:n ("ulkomaalaisvahvistukset" 320 px:n kortissa, 19.10.2026). */
export const katko = (t: string) =>
  t.replace(/(?<=\p{L})-(?=\p{L})/gu, "-\u200B").replace(new RegExp(`\\p{L}{${TAVUTUSRAJA + 1},}`, "gu"), tavuta);

/** Sanat, joita pidemmät tavutetaan; KORTTISÄÄNTÖ-koko lasketaan enintään tämän mittaisesta sanasta. */
export const TAVUTUSRAJA = 14;
const VOKAALI = /[aeiouyäöå]/i;
/** Suomen tavusääntö (yksinkertaistettu): tavuraja konsonantin eteen, kun konsonanttia seuraa vokaali
 *  ("ul-ko-maa-lais-vah-vis-tuk-set"). Vähintään 3 kirjainta tavuviivan kummallekin puolelle. */
export function tavuta(sana: string): string {
  const k = [...sana];
  let out = "";
  k.forEach((c, i) => {
    const raja = i >= 3 && k.length - i >= 3 && !VOKAALI.test(c) && VOKAALI.test(k[i + 1] ?? "") && /\p{L}/u.test(c);
    out += (raja ? "\u00AD" : "") + c;
  });
  return out;
}

/** Pisin sana (kirjaimia, enintään TAVUTUSRAJA) — KORTTISÄÄNTÖ-koon laskentaan. Yhdysmerkki erottaa osat. */
export const pisinSana = (t: string) =>
  Math.min(TAVUTUSRAJA, Math.max(4, ...t.split(/[\s–—-]+/).map((w) => w.replace(/[^\p{L}\d]/gu, "").length)));

export async function haeRunkoData(k: Kokoelma): Promise<RunkoData | null> {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb
    .from("quiz_cards" as never)
    .select("id, slug, custom_slug, game_mode, title, display_title, genre, subcollection, category, play_count, question_count, section_tags, hero_image, hero_focal_x, hero_focal_y, target_age");
  if (k.haku.collection) q = q.eq("collection", k.haku.collection);
  if (k.haku.category) q = q.eq("category", k.haku.category);
  if (k.haku.sectionTags) q = q.overlaps("section_tags", k.sections.map((s) => s.slug));
  const [{ data }, maarat] = await Promise.all([q, getCounts()]);
  const rivit = ((data ?? []) as unknown as Rivi[]).filter((r) => r.target_age !== "4-7" && r.target_age !== "8-12");

  const visa = (r: Rivi): RunkoVisa => {
    const kuva = (r.slug && k.korttikuva?.(r.slug)) || r.hero_image || null;
    const metaOsat = [k.metarivi?.(r) ?? ""];
    /* Heikin päätös 19.10.2026: kysymysmäärä vain, kun se poikkeaa kymmenestä. Vaikeustasoa ei koskaan. */
    if (r.question_count && r.question_count !== 10) metaOsat.push(`${r.question_count} kysymystä`);
    return {
      id: r.id,
      slug: r.slug ?? "",
      nimi: r.display_title ?? r.title,
      href: visaHref(r),
      kuva,
      kuvaPos: r.slug && k.korttikuva?.(r.slug)
        ? k.korttikuvaPos?.(r.slug)
        : r.hero_image && r.hero_focal_x != null
          ? `${Math.round(Number(r.hero_focal_x) * 100)}% ${Math.round(Number(r.hero_focal_y ?? 0.5) * 100)}%`
          : undefined,
      meta: metaOsat.filter(Boolean).join(" · "),
      playCount: r.play_count ?? 0,
    };
  };

  const osiot: RunkoOsio[] = k.sections
    .map((s) => {
      let vs = rivit
        .filter((r) => r.section_tags?.includes(s.slug))
        .map(visa)
        .sort((a, b) => b.playCount - a.playCount || a.nimi.localeCompare(b.nimi, "fi"));
      const fi = s.featured ? vs.findIndex((v) => v.slug === s.featured) : -1;
      if (fi > 0) vs = [vs[fi], ...vs.slice(0, fi), ...vs.slice(fi + 1)];
      /* S1: ensimmäinen (tai nostettu) on B, jos sillä on kuva. */
      const b = vs[0]?.kuva ? vs[0] : null;
      const loput = b ? vs.slice(1) : vs;
      /* S1-tarkennus: jos B:n jälkeen on alle 2 kuvallista visaa, kaikki muut ovat C-rivejä. */
      const kuvallisia = loput.slice(0, A_ENINTAAN_PAIKKA - (b ? 1 : 0)).filter((v) => v.kuva).length;
      const kortit: RunkoKortti[] = loput.map((v, i) => {
        const paikka = i + (b ? 2 : 1);
        const muoto = v.kuva && paikka <= A_ENINTAAN_PAIKKA && kuvallisia >= 2 ? "A" : "C";
        return { ...v, muoto, nro: i + 1 };
      });
      return {
        ...s,
        b,
        kortit,
        maara: vs.length,
        piilossaMobiili: Math.max(0, kortit.length - KATKAISU.mobiili),
        piilossaDesktop: Math.max(0, kortit.length - KATKAISU.desktop),
      };
    })
    /* S3: osio ilman julkaistuja visoja piilotetaan sivulta ja chipeistä. */
    .filter((o) => o.maara > 0);

  const kaikki = osiot.flatMap((o) => [...(o.b ? [o.b] : []), ...o.kortit]);
  const uniikit = [...new Map(kaikki.map((v) => [v.id, v])).values()];
  const top = [...uniikit].sort((a, b) => b.playCount - a.playCount)[0] ?? null;

  return {
    k,
    osiot,
    visoja: uniikit.length,
    suosituin: top ? { id: top.id, nimi: top.nimi, href: top.href } : null,
    jarjestys: uniikit.map((v) => ({ id: v.id, nimi: v.nimi, href: v.href })),
    pelit: kokoelmanPelimuodot(k.slug),
    lisaa: naapurit(k.slug, k.related).map((n) => ({ ...n, maara: maarat[n.slug] ?? 0 })),
  };
}
