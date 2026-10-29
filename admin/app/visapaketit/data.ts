// Visapakettien hallinnan haut (palvelin, service role). Ei "use server" -tiedosto: tavallisia apufunktioita.
import type { getSupabaseAdmin } from "@juntti/db";
import { TIETONIEKKA_URL } from "@/lib/paivan-visa-yhteiset";

type Sb = ReturnType<typeof getSupabaseAdmin>;

export type PakettiAdmin = {
  id: string; slug: string; sarja: string | null; painos_nimi: string | null; otsikko: string;
  seo_title: string | null; seo_description: string | null; kohderyhma: string; teema: string | null;
  kausi_alku: string | null; kausi_loppu: string | null; kesto_min: number | null;
  hero_image: string | null; hero_alt: string | null; aksentti: string | null; jarjestys: number;
  status: string; published_at: string | null;
};

export type KysymysAdmin = {
  question_id: string; sort: number; question_text: string; question_type: string | null; oikea: string;
  quiz_id: string; visa: string; visa_slug: string | null; visa_status: string; target_age: string | null;
};

export type KierrosAdmin = { id: string; nro: number; nimi: string; kohderyhma: string; kysymykset: KysymysAdmin[] };

const PAKETTI = "id, slug, sarja, painos_nimi, otsikko, seo_title, seo_description, kohderyhma, teema, kausi_alku, kausi_loppu, kesto_min, hero_image, hero_alt, aksentti, jarjestys, status, published_at";

/** Paketin julkinen osoite (sarjan painos /visapaketti/<sarja>/<painos>) + esikatseluavain. */
export function esikatseluUrl(p: Pick<PakettiAdmin, "slug" | "sarja"> & { avain?: string | null }): string {
  const polku = p.sarja && p.slug.startsWith(`${p.sarja}-`) ? `/visapaketti/${p.sarja}/${p.slug.slice(p.sarja.length + 1)}` : `/visapaketti/${p.slug}`;
  return `${TIETONIEKKA_URL}${polku}${p.avain ? `?esikatselu=${p.avain}` : ""}`;
}

export async function haePakettienTila(sb: Sb, siteId: string) {
  const { data } = await sb.from("quiz_packs").select(`${PAKETTI}, quiz_pack_esikatselu(avain), quiz_pack_rounds(id, quiz_pack_items(question_id, questions(quizzes(status))))`)
    .eq("site_id", siteId).order("jarjestys").order("published_at", { ascending: false });
  type Rivi = PakettiAdmin & {
    quiz_pack_esikatselu: { avain: string } | { avain: string }[] | null;
    quiz_pack_rounds: { id: string; quiz_pack_items: { question_id: string; questions: { quizzes: { status: string } | null } | null }[] }[];
  };
  return ((data ?? []) as unknown as Rivi[]).map(({ quiz_pack_esikatselu: e, quiz_pack_rounds: kr, ...p }) => {
    const items = kr.flatMap((r) => r.quiz_pack_items);
    return {
      ...p,
      avain: Array.isArray(e) ? e[0]?.avain ?? null : e?.avain ?? null,
      kierroksia: kr.length,
      kysymyksia: items.length,
      luonnosKysymyksia: items.filter((i) => i.questions?.quizzes?.status !== "published").length,
    };
  });
}

export async function haePaketti(sb: Sb, id: string): Promise<{ p: PakettiAdmin; avain: string | null; kierrokset: KierrosAdmin[] } | null> {
  const [{ data: p }, { data: e }, { data: kr }] = await Promise.all([
    sb.from("quiz_packs").select(PAKETTI).eq("id", id).maybeSingle(),
    sb.from("quiz_pack_esikatselu").select("avain").eq("pack_id", id).maybeSingle(),
    sb.from("quiz_pack_rounds")
      .select("id, nro, nimi, kohderyhma, quiz_pack_items(question_id, sort, questions(question_text, question_type, answers, quiz_id, quizzes(title, slug, status, target_age)))")
      .eq("pack_id", id).order("nro"),
  ]);
  if (!p) return null;
  type Item = { question_id: string; sort: number; questions: { question_text: string; question_type: string | null; answers: { text: string; is_correct?: boolean }[] | null; quiz_id: string; quizzes: { title: string; slug: string | null; status: string; target_age: string | null } | null } | null };
  const kierrokset = ((kr ?? []) as unknown as Array<{ id: string; nro: number; nimi: string; kohderyhma: string; quiz_pack_items: Item[] }>).map((r) => ({
    id: r.id, nro: r.nro, nimi: r.nimi, kohderyhma: r.kohderyhma,
    kysymykset: [...r.quiz_pack_items].sort((a, b) => a.sort - b.sort).map((i) => ({
      question_id: i.question_id, sort: i.sort,
      question_text: i.questions?.question_text ?? "(poistettu)",
      question_type: i.questions?.question_type ?? null,
      oikea: (i.questions?.answers ?? []).find((a) => a.is_correct)?.text ?? "",
      quiz_id: i.questions?.quiz_id ?? "",
      visa: i.questions?.quizzes?.title ?? "",
      visa_slug: i.questions?.quizzes?.slug ?? null,
      visa_status: i.questions?.quizzes?.status ?? "draft",
      target_age: i.questions?.quizzes?.target_age ?? null,
    })),
  }));
  return { p: p as unknown as PakettiAdmin, avain: (e as { avain: string } | null)?.avain ?? null, kierrokset };
}

export type HakuTulos = { id: string; question_text: string; question_type: string | null; oikea: string; quiz_id: string; visa: string; collection: string | null; target_age: string | null };

/** Kysymyshaku: visan nimi, kokoelma, section_tags-tagi ja teksti. Vain julkaistut visat. */
export async function haeKysymyksia(sb: Sb, siteId: string, h: { visa?: string; kokoelma?: string; tagi?: string; teksti?: string }): Promise<HakuTulos[]> {
  if (!h.visa && !h.kokoelma && !h.tagi && !h.teksti) return [];
  let qz = sb.from("quizzes").select("id").eq("site_id", siteId).eq("status", "published").neq("game_mode", "mega");
  if (h.visa) qz = qz.ilike("title", `%${h.visa}%`);
  if (h.kokoelma) qz = qz.eq("collection", h.kokoelma);
  if (h.tagi) qz = qz.contains("section_tags", [h.tagi]);
  const { data: visat } = await qz.limit(200);
  const ids = (visat ?? []).map((v) => v.id);
  if (!ids.length) return [];
  let q = sb.from("questions").select("id, question_text, question_type, answers, quiz_id, quizzes(title, collection, target_age)").in("quiz_id", ids);
  if (h.teksti) q = q.ilike("question_text", `%${h.teksti}%`);
  const { data } = await q.order("quiz_id").order("sort_order").limit(120);
  type R = { id: string; question_text: string; question_type: string | null; answers: { text: string; is_correct?: boolean }[] | null; quiz_id: string; quizzes: { title: string; collection: string | null; target_age: string | null } | null };
  return ((data ?? []) as unknown as R[]).map((r) => ({
    id: r.id, question_text: r.question_text, question_type: r.question_type, quiz_id: r.quiz_id,
    oikea: (r.answers ?? []).find((a) => a.is_correct)?.text ?? "",
    visa: r.quizzes?.title ?? "", collection: r.quizzes?.collection ?? null, target_age: r.quizzes?.target_age ?? null,
  }));
}
