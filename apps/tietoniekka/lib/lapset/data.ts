// LASTEN VISAT — palvelimen datahaku (TOTEUTUSBRIEF_LASTEN_VISAT.md §3–4, 9.10.2026).
//
// Lasten visa = quizzes.target_age in ('4-7', '8-12'). Pelisivu (/visa/<slug>, /peli?visa=|quiz_id=)
// kysyy ensin tätä: jos visa on lasten visa, se renderöidään LastenPeli-komponentilla.
//
// Julkaisu: tuotanto näyttää vain status = 'published'. Vercelin preview (VERCEL_ENV != production)
// näyttää myös luonnokset, jotta Heikki voi testata ne suoralla linkillä ennen julkaisua
// (RLS: migraatio 20261106_lasten_visat_esikatselu.sql).
import { getSupabase } from "@/lib/supabase";
import type { Juontaja } from "@/lib/lapset/valijuonnot";

export const LASTEN_IAT = ["4-7", "8-12"] as const;
export type LastenIka = (typeof LASTEN_IAT)[number];

export const esikatselu = () => process.env.VERCEL_ENV !== "production";

export type LastenVastaus = { teksti: string; oikein: boolean; kuva: string | null; kuvaKrediitti: string | null };
/** kesto_s ja aalto (22 palkkia, 0–1) lasketaan tiedostosta etukäteen: soittopalkki ei luota audio.durationiin. */
export type Elainaani = { url: string; laji: string; tekija: string; lisenssi: string; lahdeUrl: string | null; kesto: number | null; aalto: number[] };
export type LastenKysymys = {
  tyyppi: "teksti" | "kuva" | "kuvavastaukset" | "aani" | "aani_kuvavastaukset";
  teksti: string;
  kuva: string | null;
  kuvaKrediitti: string | null;
  /** CSS object-position kysymyskuvalle (questions.image_position), esim. "center 20%". null = CSS-oletus. */
  kuvaKohdistus: string | null;
  vastaukset: LastenVastaus[];
  vihje: Record<Juontaja, string | null>;
  tiesitko: string | null;
  /** Juontajaklipit (url) */
  audio: { kysymys: string | null; vihje_laura: string | null; vihje_mikko: string | null; tiesitko: string | null };
  elainaani: Elainaani | null;
};
export type LastenVisa = {
  id: string;
  slug: string;
  otsikko: string;
  kuvaus: string | null;
  ika: LastenIka;
  lukija: Juontaja;
  aihe: string | null;
  kokoelma: string | null;
  kuva: string | null;
  julkaistu: boolean;
  kysymykset: LastenKysymys[];
};
export type LastenKortti = { slug: string; otsikko: string; ika: LastenIka; aihe: string | null; kuva: string | null };

type VisaRivi = {
  id: string; slug: string; title: string; display_title: string | null; description: string | null; status: string;
  target_age: string; lukija: string | null; lasten_aihe: string | null; collection: string | null; image_url: string | null;
};
type KysymysRivi = {
  sort_order: number; question_text: string; question_type: string; explanation: string | null; answers: unknown;
  image_url: string | null; image_credit: string | null; image_position: string | null; vihje_laura: string | null; vihje_mikko: string | null;
  audio: unknown; animal_sound: unknown;
};

const onIka = (s: string): s is LastenIka => (LASTEN_IAT as readonly string[]).includes(s);
const str = (o: Record<string, unknown>, k: string) => (typeof o[k] === "string" ? (o[k] as string) : null);

/** Kevyt tarkistus: onko tunniste lasten visa (ja saako sen näyttää tässä ympäristössä)? */
export async function haeLastenVisa(opts: { slug?: string | null; quizId?: string | null }): Promise<LastenVisa | null> {
  const sb = getSupabase();
  if (!sb || (!opts.slug && !opts.quizId)) return null;
  let q = sb
    .from("quizzes")
    .select("id, slug, title, display_title, description, status, target_age, lukija, lasten_aihe, collection, image_url")
    .in("target_age", [...LASTEN_IAT]);
  q = opts.quizId ? q.eq("id", opts.quizId) : q.eq("slug", opts.slug!);
  if (!esikatselu()) q = q.eq("status", "published");
  const { data: visa } = await q.maybeSingle<VisaRivi>();
  if (!visa || !onIka(visa.target_age)) return null;

  const { data: rivit } = await sb
    .from("questions")
    .select("sort_order, question_text, question_type, explanation, answers, image_url, image_credit, image_position, vihje_laura, vihje_mikko, audio, animal_sound")
    .eq("quiz_id", visa.id)
    .order("sort_order", { ascending: true });

  const kysymykset: LastenKysymys[] = ((rivit ?? []) as KysymysRivi[]).map((r) => {
    const au = (r.audio && typeof r.audio === "object" ? r.audio : {}) as Record<string, unknown>;
    const ea = (r.animal_sound && typeof r.animal_sound === "object" ? r.animal_sound : null) as Record<string, unknown> | null;
    const vastaukset = (Array.isArray(r.answers) ? r.answers : []).map((a) => {
      const o = (a ?? {}) as Record<string, unknown>;
      return { teksti: str(o, "text") ?? "", oikein: o.is_correct === true, kuva: str(o, "image_url"), kuvaKrediitti: str(o, "image_credit") };
    });
    return {
      tyyppi: (["teksti", "kuva", "kuvavastaukset", "aani", "aani_kuvavastaukset"].includes(r.question_type) ? r.question_type : "teksti") as LastenKysymys["tyyppi"],
      teksti: r.question_text,
      kuva: r.image_url,
      kuvaKrediitti: r.image_credit,
      kuvaKohdistus: r.image_position,
      vastaukset,
      vihje: { laura: r.vihje_laura, mikko: r.vihje_mikko },
      tiesitko: r.explanation,
      audio: { kysymys: str(au, "kysymys"), vihje_laura: str(au, "vihje_laura"), vihje_mikko: str(au, "vihje_mikko"), tiesitko: str(au, "tiesitko") },
      elainaani: ea && str(ea, "url")
        ? {
            url: str(ea, "url")!, laji: str(ea, "laji") ?? "", tekija: str(ea, "tekija") ?? "", lisenssi: str(ea, "lisenssi") ?? "",
            lahdeUrl: str(ea, "lahde_url"),
            kesto: typeof ea.kesto_s === "number" ? ea.kesto_s : null,
            aalto: Array.isArray(ea.aalto) ? (ea.aalto as unknown[]).filter((x): x is number => typeof x === "number") : [],
          }
        : null,
    };
  });

  return {
    id: visa.id,
    slug: visa.slug,
    otsikko: visa.display_title ?? visa.title,
    kuvaus: visa.description,
    ika: visa.target_age,
    lukija: visa.lukija === "mikko" ? "mikko" : "laura",
    aihe: visa.lasten_aihe,
    kokoelma: visa.collection,
    kuva: visa.image_url,
    julkaistu: visa.status === "published",
    kysymykset,
  };
}

/** Tulosruudun "Lisää lasten visoja": vain toisia lasten visoja (brief §7), saman ikäryhmän ensin. */
export async function haeMuutLastenVisat(nykyinen: LastenVisa, maara = 6): Promise<LastenKortti[]> {
  const sb = getSupabase();
  if (!sb) return [];
  let q = sb
    .from("quizzes")
    .select("slug, title, display_title, target_age, lasten_aihe, image_url, status, created_at")
    .in("target_age", [...LASTEN_IAT])
    .neq("id", nykyinen.id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (!esikatselu()) q = q.eq("status", "published");
  const { data } = await q;
  const kortit = ((data ?? []) as Array<{ slug: string; title: string; display_title: string | null; target_age: string; lasten_aihe: string | null; image_url: string | null }>)
    .filter((r) => onIka(r.target_age))
    .map((r) => ({ slug: r.slug, otsikko: r.display_title ?? r.title, ika: r.target_age as LastenIka, aihe: r.lasten_aihe, kuva: r.image_url }));
  const sama = kortit.filter((k) => k.ika === nykyinen.ika);
  const muut = kortit.filter((k) => k.ika !== nykyinen.ika);
  return [...sama, ...muut].slice(0, maara);
}
