// PÄIVÄN VISA -ADMIN — päivien kokoaja (vain palvelin; service role).
// Tyypit, rajat ja varoituslogiikka: lib/paivan-visa-yhteiset.ts.

import { getSupabaseAdmin } from "@juntti/db";
import {
  TOISTORAJA_PV, lisaaPaivia, paivaEro, varoituksetValinnalle,
  type Paiva, type SaantoRivi, type VisaValinta,
} from "@/lib/paivan-visa-yhteiset";

export * from "@/lib/paivan-visa-yhteiset";

type SankariRpc = { paiva: string; name: string; quiz_id: string; death_date: string | null; ika: number };

/** Kokoaa päivät [alku, loppu] saantöineen, sankareineen ja varoituksineen. */
export async function haePaivat(siteId: string, alku: string, loppu: string) {
  const sb = getSupabaseAdmin();
  const hakuAlku = lisaaPaivia(alku, -TOISTORAJA_PV);
  const hakuLoppu = lisaaPaivia(loppu, TOISTORAJA_PV);

  const [saannotRes, visatRes, sankaritRes] = await Promise.all([
    sb
      .from("schedule_rules")
      .select("id, scheduled_date, content_id, active, auto_filled, intro_headline, intro_text, intro_source_url, editorial_note" as never)
      .eq("site_id", siteId)
      .eq("content_type", "quiz")
      .eq("active", true)
      .gte("scheduled_date", hakuAlku)
      .lte("scheduled_date", hakuLoppu),
    sb
      .from("quizzes")
      .select("id, title, display_title, collection, category, status, hero_image" as never)
      .eq("site_id", siteId)
      .order("title", { ascending: true }),
    sb.rpc("paivan_sankarit" as never, { p_site: siteId, p_from: alku, p_to: loppu } as never),
  ]);

  const saannot = ((saannotRes.data ?? []) as unknown as SaantoRivi[]).filter((r) => r.scheduled_date);
  const visat: VisaValinta[] = ((visatRes.data ?? []) as unknown as Array<{
    id: string; title: string; display_title: string | null; collection: string | null;
    category: string | null; status: string; hero_image: string | null;
  }>).map((q) => ({
    id: q.id,
    title: q.display_title ?? q.title,
    status: q.status,
    kokoelma: q.collection ?? q.category,
    kuva: Boolean(q.hero_image) || q.collection === "tunnetut-henkilot",
  }));
  const visaById = new Map(visat.map((q) => [q.id, q]));
  const saantoByDate = new Map(saannot.map((r) => [r.scheduled_date, r]));
  const sankariByDate = new Map(((sankaritRes.data ?? []) as unknown as SankariRpc[]).map((s) => [s.paiva, s]));
  /** visa-id → Päivän visa -päivät (koko hakuikkuna) */
  const paivatByVisa = new Map<string, string[]>();
  for (const r of saannot) {
    if (!r.content_id) continue;
    const l = paivatByVisa.get(r.content_id) ?? [];
    l.push(r.scheduled_date);
    paivatByVisa.set(r.content_id, l);
  }

  const paivat: Paiva[] = [];
  for (let iso = alku; iso <= loppu; iso = lisaaPaivia(iso, 1)) {
    const saanto = saantoByDate.get(iso) ?? null;
    const visa = saanto?.content_id ? visaById.get(saanto.content_id) ?? null : null;
    const s = sankariByDate.get(iso) ?? null;
    const edelliset = [1, 2].map((n) => {
      const e = lisaaPaivia(iso, -n);
      const r = saantoByDate.get(e);
      return { iso: e, kokoelma: r?.content_id ? visaById.get(r.content_id)?.kokoelma ?? null : null };
    });
    const toistot = visa
      ? (paivatByVisa.get(visa.id) ?? []).filter((d) => d !== iso && Math.abs(paivaEro(iso, d)) <= TOISTORAJA_PV)
      : [];
    paivat.push({
      iso,
      saanto,
      visa,
      sankari: s ? { name: s.name, quiz_id: s.quiz_id, death_date: s.death_date, ika: s.ika } : null,
      varoitukset: varoituksetValinnalle({
        iso, visa, sankariQuizId: s?.quiz_id ?? null, sankariNimi: s?.name ?? null, toistot, edelliset,
      }),
    });
  }
  return { paivat, visat, paivatByVisa: Object.fromEntries(paivatByVisa), saantoByDate };
}
