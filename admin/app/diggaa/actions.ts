"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";
import { getDiggaaSite, DURATION_PRESETS, type DiggaaContentType } from "@/lib/diggaa";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CATEGORIES = ["ennuste", "mielipide", "brandi", "urheilu", "viihde"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function revalidateDiggaa() {
  revalidatePath("/diggaa");
  revalidatePath("/diggaa/sisallot");
  revalidatePath("/diggaa/ajastus");
}

/* ── Duel ── */

export type DuelInput = {
  category: string;
  question: string;
  option_a: string;
  option_b: string;
};

function validateDuel(i: DuelInput): string | null {
  if (!CATEGORIES.includes(i.category)) return "Virheellinen kategoria";
  if (!i.question.trim()) return "Kysymys puuttuu";
  if (!i.option_a.trim() || !i.option_b.trim()) return "Molemmat vaihtoehdot tarvitaan";
  return null;
}

export async function createDuel(input: DuelInput) {
  const err = validateDuel(input);
  if (err) return { ok: false as const, error: err };
  const site = await getDiggaaSite();
  const sb = getSupabaseAdmin() as any;
  const { error } = await sb.from("diggaa_polls").insert({
    site_id: site.id,
    category: input.category,
    question: input.question.trim(),
    option_a: input.option_a.trim(),
    option_b: input.option_b.trim(),
    poll_date: new Date().toISOString().slice(0, 10),
  });
  if (error) return { ok: false as const, error: error.message };
  revalidateDiggaa();
  return { ok: true as const };
}

export async function updateDuel(id: string, input: DuelInput) {
  const err = validateDuel(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin() as any;
  const { error } = await sb
    .from("diggaa_polls")
    .update({
      category: input.category,
      question: input.question.trim(),
      option_a: input.option_a.trim(),
      option_b: input.option_b.trim(),
    })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateDiggaa();
  return { ok: true as const };
}

/* ── Knockout ── */

export type KnockoutOptionInput = {
  id?: string;
  label: string;
  label_genitive: string;
};

export type KnockoutInput = {
  category: string;
  question: string;
  options: KnockoutOptionInput[]; // tasan 8, järjestyksessä
};

// Väriparit kierrätetään brändipaletista (sama malli kuin demo-Knockoutissa)
const OPTION_PALETTES = [
  { bg: "#FFE1DB", accent: "#FF5A45" },
  { bg: "#E7F6B8", accent: "#5E6E12" },
  { bg: "#EFE7FF", accent: "#6C4CF5" },
  { bg: "#E7E1D4", accent: "#1C1A17" },
];

function validateKnockout(i: KnockoutInput): string | null {
  if (!CATEGORIES.includes(i.category)) return "Virheellinen kategoria";
  if (!i.question.trim()) return "Kysymys puuttuu";
  if (i.options.length !== 8) return "Knockout vaatii tasan 8 vaihtoehtoa";
  for (const [idx, o] of i.options.entries()) {
    if (!o.label.trim()) return `Vaihtoehdon ${idx + 1} nimi puuttuu`;
    if (!o.label_genitive.trim())
      return `Vaihtoehdon ${idx + 1} genetiivi puuttuu (esim. "Mintun") — käytetään recap-tekstissä "voitti X"`;
  }
  return null;
}

export async function createKnockout(input: KnockoutInput) {
  const err = validateKnockout(input);
  if (err) return { ok: false as const, error: err };
  const site = await getDiggaaSite();
  const sb = getSupabaseAdmin() as any;
  const { data: ko, error } = await sb
    .from("diggaa_knockouts")
    .insert({
      site_id: site.id,
      slug: `${slugify(input.question)}-${Date.now().toString(36)}`,
      category: input.category,
      question: input.question.trim(),
      knockout_date: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error) return { ok: false as const, error: error.message };

  const rows = input.options.map((o, idx) => ({
    knockout_id: ko.id,
    position: idx + 1,
    label: o.label.trim(),
    label_genitive: o.label_genitive.trim(),
    letter: o.label.trim().charAt(0).toUpperCase(),
    bg_color: OPTION_PALETTES[idx % 4].bg,
    accent_color: OPTION_PALETTES[idx % 4].accent,
  }));
  const { error: optError } = await sb.from("diggaa_knockout_options").insert(rows);
  if (optError) return { ok: false as const, error: optError.message };
  revalidateDiggaa();
  return { ok: true as const };
}

export async function updateKnockout(id: string, input: KnockoutInput) {
  const err = validateKnockout(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin() as any;
  const { error } = await sb
    .from("diggaa_knockouts")
    .update({ category: input.category, question: input.question.trim() })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  // Päivitä optiot paikallaan (id säilyy → äänet/battlet eivät katkea).
  // Optioita EI poisteta/lisätä jos knockoutilla on jo pelattuja sessioita.
  for (const [idx, o] of input.options.entries()) {
    if (!o.id) continue;
    const { error: optError } = await sb
      .from("diggaa_knockout_options")
      .update({
        label: o.label.trim(),
        label_genitive: o.label_genitive.trim(),
        letter: o.label.trim().charAt(0).toUpperCase(),
        position: idx + 1,
      })
      .eq("id", o.id);
    if (optError) return { ok: false as const, error: optError.message };
  }
  revalidateDiggaa();
  return { ok: true as const };
}

/* ── Swipe-kierros ── */

export type SwipeCardInput = {
  id?: string;
  card_type: "opinion" | "visual";
  kicker: string;
  title: string;
  subtitle: string;
  emblem: string;
};

export type SwipeDeckInput = {
  title: string;
  category: string;
  cards: SwipeCardInput[];
};

function validateSwipe(i: SwipeDeckInput): string | null {
  if (!i.title.trim()) return "Otsikko puuttuu";
  if (!CATEGORIES.includes(i.category)) return "Virheellinen kategoria";
  if (i.cards.length < 3) return "Kierros vaatii vähintään 3 korttia";
  for (const [idx, c] of i.cards.entries()) {
    if (!c.title.trim()) return `Kortin ${idx + 1} otsikko puuttuu`;
  }
  return null;
}

export async function createSwipeDeck(input: SwipeDeckInput) {
  const err = validateSwipe(input);
  if (err) return { ok: false as const, error: err };
  const site = await getDiggaaSite();
  const sb = getSupabaseAdmin() as any;
  const { data: deck, error } = await sb
    .from("diggaa_decks")
    .insert({
      site_id: site.id,
      slug: `${slugify(input.title)}-${Date.now().toString(36)}`,
      title: input.title.trim(),
      category: input.category,
      deck_date: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error) return { ok: false as const, error: error.message };

  const rows = input.cards.map((c, idx) => ({
    deck_id: deck.id,
    position: idx + 1,
    card_type: c.card_type,
    kicker: c.kicker.trim() || null,
    title: c.title.trim(),
    subtitle: c.subtitle.trim() || null,
    emblem: c.emblem.trim() || null,
  }));
  const { error: cardError } = await sb.from("diggaa_swipe_cards").insert(rows);
  if (cardError) return { ok: false as const, error: cardError.message };
  revalidateDiggaa();
  return { ok: true as const };
}

export async function updateSwipeDeck(id: string, input: SwipeDeckInput) {
  const err = validateSwipe(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin() as any;
  const { error } = await sb
    .from("diggaa_decks")
    .update({ title: input.title.trim(), category: input.category })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  // Olemassa olevat kortit päivitetään paikallaan (id säilyy → äänet säilyvät);
  // uudet lisätään loppuun. Kortteja ei poisteta täältä v1:ssä.
  for (const [idx, c] of input.cards.entries()) {
    const payload = {
      position: idx + 1,
      card_type: c.card_type,
      kicker: c.kicker.trim() || null,
      title: c.title.trim(),
      subtitle: c.subtitle.trim() || null,
      emblem: c.emblem.trim() || null,
    };
    if (c.id) {
      const { error: e } = await sb.from("diggaa_swipe_cards").update(payload).eq("id", c.id);
      if (e) return { ok: false as const, error: e.message };
    } else {
      const { error: e } = await sb.from("diggaa_swipe_cards").insert({ ...payload, deck_id: id });
      if (e) return { ok: false as const, error: e.message };
    }
  }
  revalidateDiggaa();
  return { ok: true as const };
}

/* ── Julkaisut (ajastus + live-kesto) ── */

export type PublicationInput = {
  content_type: DiggaaContentType;
  content_id: string;
  title: string;
  opens_at: string; // ISO
  duration_preset: string;
  closes_at: string | null; // ISO, käytetään kun preset = custom
  status: "draft" | "scheduled";
};

export async function createPublication(input: PublicationInput) {
  if (!input.content_id) return { ok: false as const, error: "Valitse sisältö" };
  if (!input.opens_at) return { ok: false as const, error: "Aseta avautumisaika" };
  const preset = DURATION_PRESETS.find((p) => p.key === input.duration_preset);
  if (!preset) return { ok: false as const, error: "Virheellinen kesto" };

  const opens = new Date(input.opens_at);
  let closes: Date;
  if (preset.hours !== null) {
    closes = new Date(opens.getTime() + preset.hours * 3600_000);
  } else {
    if (!input.closes_at) return { ok: false as const, error: "Aseta sulkeutumisaika" };
    closes = new Date(input.closes_at);
  }
  if (closes <= opens) return { ok: false as const, error: "Sulkeutumisen pitää olla avautumisen jälkeen" };

  const site = await getDiggaaSite();
  const sb = getSupabaseAdmin() as any;
  const { error } = await sb.from("diggaa_publications").insert({
    site_id: site.id,
    content_type: input.content_type,
    content_id: input.content_id,
    title: input.title,
    status: input.status,
    opens_at: opens.toISOString(),
    closes_at: closes.toISOString(),
    duration_preset: input.duration_preset,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidateDiggaa();
  return { ok: true as const };
}

export async function closePublicationNow(id: string) {
  const sb = getSupabaseAdmin() as any;
  const { error } = await sb
    .from("diggaa_publications")
    .update({ closes_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateDiggaa();
  return { ok: true as const };
}

export async function archivePublication(id: string) {
  const sb = getSupabaseAdmin() as any;
  const { error } = await sb
    .from("diggaa_publications")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateDiggaa();
  return { ok: true as const };
}

export async function deletePublication(id: string) {
  const sb = getSupabaseAdmin() as any;
  const { error } = await sb.from("diggaa_publications").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidateDiggaa();
  return { ok: true as const };
}

/* ── Demo-datan siivous ── */

export async function cleanupDemoData() {
  const sb = getSupabaseAdmin() as any;
  // Knockoutin synteettiset sessiot (battle-rivit poistuvat cascadella)
  const { error, count } = await sb
    .from("diggaa_knockout_sessions")
    .delete({ count: "exact" })
    .like("session_id", "demo-%");
  if (error) return { ok: false as const, error: error.message };
  revalidateDiggaa();
  return { ok: true as const, removed: count ?? 0 };
}
