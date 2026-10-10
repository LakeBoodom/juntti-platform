"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@juntti/db";

export async function updateQuizMeta(
  id: string,
  input: {
    title: string;
    description: string;
    category?: string;
    difficulty?: "helppo" | "keski" | "vaikea";
    tone?: "rento" | "humoristinen" | "asiallinen" | "nostalginen";
    platform?: "juntti" | "tietoniekka" | "both";
    site_id?: string | null;
  },
) {
  if (!input.title.trim()) return { ok: false as const, error: "Otsikko puuttuu" };
  const sb = getSupabaseAdmin();
  // Älä päivitä saraketta jos sitä ei ole annettu — tukee partiaalia inputtia
  type QuizUpdate = {
    title: string;
    description: string | null;
    category?: string;
    difficulty?: string;
    tone?: string;
    platform?: string;
    site_id?: string | null;
  };
  const update: QuizUpdate = {
    title: input.title.trim(),
    description: input.description?.trim() || null,
  };
  if (input.category !== undefined) update.category = input.category.trim();
  if (input.difficulty !== undefined) update.difficulty = input.difficulty;
  if (input.tone !== undefined) update.tone = input.tone;
  if (input.platform !== undefined) update.platform = input.platform;
  if (input.site_id !== undefined) update.site_id = input.site_id;

  const { error } = await sb.from("quizzes").update(update).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/quizzes/${id}`);
  revalidatePath(`/quizzes`);
  return { ok: true as const };
}

export async function updateQuestion(
  id: string,
  input: {
    question_text: string;
    answers: { text: string; is_correct: boolean }[];
    explanation: string;
  },
) {
  // Validate exactly one correct answer, four answers total.
  if (input.answers.length !== 4)
    return { ok: false as const, error: "Vastauksia pitää olla tasan 4" };
  const correct = input.answers.filter((a) => a.is_correct).length;
  if (correct !== 1)
    return {
      ok: false as const,
      error: "Oikeita vastauksia pitää olla tasan 1",
    };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("questions").update(input).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function togglePublish(id: string, publish: boolean) {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("quizzes")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/quizzes/${id}`);
  revalidatePath(`/quizzes`);
  return { ok: true as const };
}

export async function deleteQuiz(id: string) {
  const sb = getSupabaseAdmin();
  // FK cascade will delete questions.
  const { error } = await sb.from("quizzes").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/quizzes`);
  redirect("/quizzes");
}

export async function reorderQuestion(
  quizId: string,
  questionId: string,
  target: "up" | "down" | "top" | "bottom",
) {
  const sb = getSupabaseAdmin();
  const { data: qs, error } = await sb
    .from("questions")
    .select("id, sort_order")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });
  if (error || !qs) {
    return { ok: false as const, error: error?.message ?? "Kysymysten haku epäonnistui" };
  }

  const idx = qs.findIndex((q) => q.id === questionId);
  if (idx === -1) return { ok: false as const, error: "Kysymystä ei löytynyt" };

  // Rakenna uusi järjestys siirtämällä kysymys haluttuun kohtaan
  const order = qs.map((q) => q.id as string);
  order.splice(idx, 1);
  let newIdx: number;
  if (target === "up") newIdx = Math.max(0, idx - 1);
  else if (target === "down") newIdx = Math.min(order.length, idx + 1);
  else if (target === "top") newIdx = 0;
  else newIdx = order.length; // bottom
  order.splice(newIdx, 0, questionId);

  // Kirjoita sort_order = 0..n-1 vain muuttuneille riveille (ei unique-rajoitetta)
  const current = new Map(qs.map((q) => [q.id as string, q.sort_order as number]));
  for (let i = 0; i < order.length; i++) {
    const id = order[i];
    if (current.get(id) !== i) {
      const { error: e } = await sb.from("questions").update({ sort_order: i }).eq("id", id);
      if (e) return { ok: false as const, error: e.message };
    }
  }

  revalidatePath(`/quizzes/${quizId}`);
  return { ok: true as const };
}

/**
 * Visan oma kuva (quizzes.hero_image) — ainoa totuus pelisivun herolle ja
 * etusivun Päivän visalle (Päivän visa -toteutus 19.9.2026, luku 2.1).
 * Polku on joko sivuston oma ("/20/kokoelma/tiedosto.webp") tai https-osoite.
 * Focal 0–1 (tyhjä = oletus 0.5 / 0.4).
 */
export async function updateQuizHero(
  id: string,
  input: { hero_image: string; hero_alt: string; hero_focal_x: string; hero_focal_y: string },
) {
  const kuva = input.hero_image.trim() || null;
  if (kuva && !/^(\/[\w\-./]+\.(webp|jpe?g|png|avif)|https:\/\/\S+)$/i.test(kuva)) {
    return { ok: false as const, error: "Kuvan polun pitää olla esim. /20/tv/visa.webp tai https://-osoite." };
  }
  const focal = (s: string) => {
    const t = s.trim().replace(",", ".");
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : NaN;
  };
  const fx = focal(input.hero_focal_x);
  const fy = focal(input.hero_focal_y);
  if (Number.isNaN(fx) || Number.isNaN(fy)) {
    return { ok: false as const, error: "Rajauspisteen pitää olla luku väliltä 0–1 (esim. 0.5)." };
  }
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("quizzes")
    .update({ hero_image: kuva, hero_alt: input.hero_alt.trim() || null, hero_focal_x: fx, hero_focal_y: fy } as never)
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/quizzes/${id}`);
  return { ok: true as const };
}

/* ── LASTEN VISAT (vaihe 6, TOTEUTUSBRIEF_LASTEN_VISAT.md §8, 10.10.2026) ── */

const KOHDERYHMA_ARVOT = ["30-50", "50-70", "kaikki", "4-7", "8-12"];
const KUVAPOLKU = /^(\/[\w\-./]+\.(webp|jpe?g|png|avif)|https:\/\/\S+)$/i;
const AANIPOLKU = /^(\/[\w\-./]+\.(mp3|m4a|ogg|wav)|https:\/\/\S+)$/i;
const tai = (s: string | null | undefined) => (s ?? "").trim() || null;

/** Kohderyhmä (target_age), juontaja (lukija) ja /lapset-sivun aihe (lasten_aihe). */
export async function updateLastenMeta(
  id: string,
  input: { target_age: string; lukija: string; lasten_aihe: string },
) {
  if (!KOHDERYHMA_ARVOT.includes(input.target_age)) return { ok: false as const, error: "Tuntematon kohderyhmä" };
  const lapset = input.target_age === "4-7" || input.target_age === "8-12";
  if (lapset && !["laura", "mikko"].includes(input.lukija)) {
    return { ok: false as const, error: "Valitse lukija (Laura tai Mikko) – lasten visassa juontaja lukee kysymykset." };
  }
  const aihe = tai(input.lasten_aihe);
  if (aihe && !/^[a-z0-9-]+$/.test(aihe)) return { ok: false as const, error: "Aiheen pitää olla pienin kirjaimin ilman ääkkösiä, esim. joulu." };
  const sb = getSupabaseAdmin();
  const update: Record<string, unknown> = { target_age: input.target_age };
  /* Aikuisten visaksi vaihdettaessa lukija ja aihe jäävät talteen (eivät vaikuta aikuisten visaan). */
  if (lapset) { update.lukija = input.lukija; update.lasten_aihe = aihe; }
  const { error } = await sb.from("quizzes").update(update as never).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/quizzes/${id}`);
  revalidatePath(`/quizzes`);
  return { ok: true as const };
}

export type LastenVastausSyote = { text: string; is_correct: boolean; image_url: string; image_credit: string };
export type ElainaaniSyote = { url: string; laji: string; tieteellinen: string; tekija: string; lisenssi: string; lahde: string; lahde_url: string };

/** Lasten kysymys: tyyppi, tekstit, vihjeet, kuvat, vastauskuvat ja eläinääni. Juontajaklipit (audio) eivät muutu. */
export async function updateLastenKysymys(
  id: string,
  input: {
    question_type: string;
    question_text: string;
    explanation: string;
    vihje_laura: string;
    vihje_mikko: string;
    answers: LastenVastausSyote[];
    image_url: string;
    image_credit: string;
    image_license_note: string;
    image_position: string;
    animal_sound: ElainaaniSyote;
  },
) {
  const tyypit = ["teksti", "kuva", "kuvavastaukset", "aani", "aani_kuvavastaukset"];
  if (!tyypit.includes(input.question_type)) return { ok: false as const, error: "Tuntematon kysymystyyppi" };
  if (!input.question_text.trim()) return { ok: false as const, error: "Kysymyksen teksti puuttuu" };
  if (input.answers.length < 2 || input.answers.length > 4) return { ok: false as const, error: "Vastauksia pitää olla 2–4" };
  if (input.answers.some((a) => !a.text.trim())) return { ok: false as const, error: "Jokaisella vastauksella pitää olla teksti (näkyy ja luetaan myös kuvavastauksissa)" };
  if (input.answers.filter((a) => a.is_correct).length !== 1) return { ok: false as const, error: "Oikeita vastauksia pitää olla tasan 1" };

  const kuvavastaukset = input.question_type === "kuvavastaukset" || input.question_type === "aani_kuvavastaukset";
  const aani = input.question_type === "aani" || input.question_type === "aani_kuvavastaukset";
  for (const [i, a] of input.answers.entries()) {
    const k = a.image_url.trim();
    if (kuvavastaukset && !k) return { ok: false as const, error: `Vastaus ${i + 1}: kuvavastauksissa jokaisella vastauksella pitää olla kuva` };
    if (k && !KUVAPOLKU.test(k)) return { ok: false as const, error: `Vastaus ${i + 1}: kuvan polku esim. /20/lapset/kuva.webp tai https://-osoite` };
  }
  const kuva = input.image_url.trim();
  if (input.question_type === "kuva" && !kuva) return { ok: false as const, error: "Kysymyskuva puuttuu (tyyppi Kysymyskuva)" };
  if (kuva && !KUVAPOLKU.test(kuva)) return { ok: false as const, error: "Kysymyskuvan polku esim. /20/lapset/kuva.webp tai https://-osoite" };
  const ea = input.animal_sound;
  if (aani && !ea.url.trim()) return { ok: false as const, error: "Eläinäänen tiedosto puuttuu (tyyppi Eläinääni)" };
  if (ea.url.trim() && !AANIPOLKU.test(ea.url.trim())) return { ok: false as const, error: "Eläinäänen polku esim. /aanet/lapset/elainaanet/elainaani-kaki.mp3" };
  if (ea.url.trim() && (!ea.tekija.trim() || !ea.lisenssi.trim())) {
    return { ok: false as const, error: "Eläinäänelle tarvitaan tekijä ja lisenssi (lähdemerkintä näkyy pelissä)" };
  }

  const sb = getSupabaseAdmin();
  const { data: nyt, error: hakuVirhe } = await sb.from("questions").select("animal_sound, quiz_id").eq("id", id).maybeSingle();
  if (hakuVirhe || !nyt) return { ok: false as const, error: hakuVirhe?.message ?? "Kysymystä ei löytynyt" };
  const vanha = ((nyt as { animal_sound: unknown }).animal_sound ?? null) as Record<string, unknown> | null;

  /* Eläinääni: kesto_s ja aalto (soittopalkki) on laskettu tiedostosta. Ne säilyvät, kun tiedosto pysyy samana;
     uudella tiedostolla ne jätetään pois, jolloin peli näyttää soittopalkin ilman aaltomuotoa. */
  let animal_sound: Record<string, unknown> | null = null;
  if (ea.url.trim()) {
    animal_sound = {
      url: ea.url.trim(), laji: ea.laji.trim(), tieteellinen: ea.tieteellinen.trim(), tekija: ea.tekija.trim(),
      lisenssi: ea.lisenssi.trim(), lahde: ea.lahde.trim(), lahde_url: tai(ea.lahde_url),
    };
    if (vanha && vanha.url === animal_sound.url) {
      if (vanha.kesto_s !== undefined) animal_sound.kesto_s = vanha.kesto_s;
      if (vanha.aalto !== undefined) animal_sound.aalto = vanha.aalto;
    }
  }

  const update = {
    question_type: input.question_type,
    question_text: input.question_text.trim(),
    explanation: tai(input.explanation),
    vihje_laura: tai(input.vihje_laura),
    vihje_mikko: tai(input.vihje_mikko),
    answers: input.answers.map((a) => ({
      text: a.text.trim(),
      is_correct: a.is_correct,
      ...(a.image_url.trim() ? { image_url: a.image_url.trim() } : {}),
      ...(a.image_credit.trim() ? { image_credit: a.image_credit.trim() } : {}),
    })),
    image_url: kuva || null,
    image_credit: tai(input.image_credit),
    image_license_note: tai(input.image_license_note),
    image_position: tai(input.image_position),
    animal_sound,
  };
  const { error } = await sb.from("questions").update(update as never).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/quizzes/${(nyt as { quiz_id: string }).quiz_id}`);
  return { ok: true as const };
}
