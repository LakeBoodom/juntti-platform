"use server";

// VISAPAKETIT — hallinta (toteutusbrief 28.10.2026, V-D). Paketti = kierroksia, kierros = viittauksia julkaistujen
// visojen kysymyksiin (quiz_pack_items), ei kopioita. Kaikki kirjoitukset service rolella.
// HUOM: tästä tiedostosta saa exportata VAIN async-funktioita.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@juntti/db";
import { getCurrentSite } from "@/lib/sites";

const t = (v: FormDataEntryValue | null) => (typeof v === "string" && v.trim() ? v.trim() : null);
const MMDD = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

function polut(id?: string) {
  revalidatePath("/visapaketit");
  if (id) revalidatePath(`/visapaketit/${id}`);
}

export async function asetaJulkaisu(id: string, julkaise: boolean) {
  const sb = getSupabaseAdmin();
  const { data: p } = await sb.from("quiz_packs").select("published_at").eq("id", id).single();
  await sb.from("quiz_packs").update({
    status: julkaise ? "published" : "draft",
    published_at: julkaise ? p?.published_at ?? new Date().toISOString() : p?.published_at ?? null,
  }).eq("id", id);
  polut(id);
}

export async function luoPaketti(formData: FormData) {
  const sb = getSupabaseAdmin();
  const site = await getCurrentSite();
  const slug = t(formData.get("slug"))?.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  const otsikko = t(formData.get("otsikko"));
  if (!slug || !otsikko) return;
  const { data, error } = await sb.from("quiz_packs").insert({ site_id: site.id, slug, otsikko }).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "Paketin luonti epäonnistui");
  polut();
  redirect(`/visapaketit/${data.id}`);
}

export async function tallennaPaketti(id: string, formData: FormData) {
  const sb = getSupabaseAdmin();
  const alku = t(formData.get("kausi_alku"));
  const loppu = t(formData.get("kausi_loppu"));
  if ((alku && !MMDD.test(alku)) || (loppu && !MMDD.test(loppu)) || (!alku !== !loppu)) {
    throw new Error("Kausi muodossa KK-PP, molemmat tai ei kumpaakaan");
  }
  const kesto = t(formData.get("kesto_min"));
  await sb.from("quiz_packs").update({
    otsikko: t(formData.get("otsikko")) ?? "Nimetön",
    slug: t(formData.get("slug"))?.toLowerCase().replace(/[^a-z0-9-]+/g, "-") ?? undefined,
    sarja: t(formData.get("sarja")),
    painos_nimi: t(formData.get("painos_nimi")),
    seo_title: t(formData.get("seo_title")),
    seo_description: t(formData.get("seo_description")),
    kohderyhma: (t(formData.get("kohderyhma")) ?? "aikuiset") as "aikuiset" | "lapset" | "molemmat",
    teema: t(formData.get("teema")),
    kausi_alku: alku,
    kausi_loppu: loppu,
    kesto_min: kesto ? Number(kesto) : null,
    hero_image: t(formData.get("hero_image")),
    hero_alt: t(formData.get("hero_alt")),
    aksentti: t(formData.get("aksentti")),
    jarjestys: Number(t(formData.get("jarjestys")) ?? 100),
  }).eq("id", id);
  polut(id);
}

/* ─── Kierrokset ─────────────────────────────────────────────── */

export async function lisaaKierros(packId: string, formData: FormData) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("quiz_pack_rounds").select("nro").eq("pack_id", packId).order("nro", { ascending: false }).limit(1);
  const nro = (data?.[0]?.nro ?? 0) + 1;
  await sb.from("quiz_pack_rounds").insert({
    pack_id: packId, nro,
    nimi: t(formData.get("nimi")) ?? `Kierros ${nro}`,
    kohderyhma: (t(formData.get("kohderyhma")) ?? "aikuiset") as "aikuiset" | "lapset",
  });
  polut(packId);
}

export async function tallennaKierros(packId: string, roundId: string, formData: FormData) {
  const sb = getSupabaseAdmin();
  await sb.from("quiz_pack_rounds").update({
    nimi: t(formData.get("nimi")) ?? "Kierros",
    kohderyhma: (t(formData.get("kohderyhma")) ?? "aikuiset") as "aikuiset" | "lapset",
  }).eq("id", roundId);
  polut(packId);
}

/** Kierroksen siirto: vaihda nro naapurin kanssa (unique (pack_id, nro) → väliaikainen negatiivinen numero). */
export async function siirraKierros(packId: string, roundId: string, suunta: -1 | 1) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("quiz_pack_rounds").select("id, nro").eq("pack_id", packId).order("nro");
  const rivit = data ?? [];
  const i = rivit.findIndex((r) => r.id === roundId);
  const j = i + suunta;
  if (i < 0 || j < 0 || j >= rivit.length) return;
  const [a, b] = [rivit[i], rivit[j]];
  await sb.from("quiz_pack_rounds").update({ nro: -a.nro }).eq("id", a.id);
  await sb.from("quiz_pack_rounds").update({ nro: a.nro }).eq("id", b.id);
  await sb.from("quiz_pack_rounds").update({ nro: b.nro }).eq("id", a.id);
  polut(packId);
}

export async function poistaKierros(packId: string, roundId: string) {
  const sb = getSupabaseAdmin();
  await sb.from("quiz_pack_rounds").delete().eq("id", roundId);
  // Numerot taas 1…n
  const { data } = await sb.from("quiz_pack_rounds").select("id, nro").eq("pack_id", packId).order("nro");
  for (const [i, r] of (data ?? []).entries()) if (r.nro !== i + 1) {
    await sb.from("quiz_pack_rounds").update({ nro: i + 1 }).eq("id", r.id);
  }
  polut(packId);
}

/* ─── Kysymykset ─────────────────────────────────────────────── */

export async function lisaaKysymys(packId: string, roundId: string, questionId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("quiz_pack_items").select("sort").eq("round_id", roundId).order("sort", { ascending: false }).limit(1);
  await sb.from("quiz_pack_items").upsert({ round_id: roundId, question_id: questionId, sort: (data?.[0]?.sort ?? 0) + 1 }, { onConflict: "round_id,question_id", ignoreDuplicates: true });
  polut(packId);
}

export async function poistaKysymys(packId: string, roundId: string, questionId: string) {
  const sb = getSupabaseAdmin();
  await sb.from("quiz_pack_items").delete().eq("round_id", roundId).eq("question_id", questionId);
  polut(packId);
}

export async function siirraKysymys(packId: string, roundId: string, questionId: string, suunta: -1 | 1) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("quiz_pack_items").select("question_id, sort").eq("round_id", roundId).order("sort");
  const rivit = (data ?? []).map((r, i) => ({ ...r, sort: i + 1 }));
  const i = rivit.findIndex((r) => r.question_id === questionId);
  const j = i + suunta;
  if (i < 0 || j < 0 || j >= rivit.length) return;
  [rivit[i], rivit[j]] = [rivit[j], rivit[i]];
  for (const [k, r] of rivit.entries()) {
    await sb.from("quiz_pack_items").update({ sort: k + 1 }).eq("round_id", roundId).eq("question_id", r.question_id);
  }
  polut(packId);
}
