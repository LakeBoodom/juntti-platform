// Diggaa-site-konteksti + formaattirekisteri.
//
// Rekisteri on Diggaa-adminin skaalautuvuuden ydin: lista-, ajastus- ja
// kojelautasivut ovat geneerisiä ja lukevat tätä rekisteriä. Uusi formaatti
// jatkossa = sisältötaulu + editor-komponentti + yksi merkintä tähän.
// Geneerisiin sivuihin ei kosketa.

import { getSupabaseAdmin } from "@juntti/db";

export type SiteRow = { id: string; slug: string; name: string };

export async function getDiggaaSite(): Promise<SiteRow> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("sites")
    .select("id, slug, name")
    .eq("slug", "diggaa")
    .maybeSingle();
  if (!data) throw new Error("Site 'diggaa' ei löydy sites-taulusta");
  return data;
}

export type DiggaaContentType = "duel" | "swipe_deck" | "knockout";

export type DiggaaContentSummary = {
  id: string;
  type: DiggaaContentType;
  title: string;
  detail: string;
  createdAt: string | null;
};

export type DiggaaFormat = {
  key: DiggaaContentType;
  name: string;
  /** Hakee formaatin sisällöt listanäkymää ja julkaisulomakkeen valitsinta varten */
  list: (siteId: string) => Promise<DiggaaContentSummary[]>;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

const duelFormat: DiggaaFormat = {
  key: "duel",
  name: "Duel",
  async list(siteId) {
    const sb = getSupabaseAdmin() as any;
    const { data } = await sb
      .from("diggaa_polls")
      .select("id, category, question, option_a, option_b, created_at")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((p: any) => ({
      id: p.id,
      type: "duel" as const,
      title: p.question,
      detail: `${p.category} · ${p.option_a} vs ${p.option_b}`,
      createdAt: p.created_at ?? null,
    }));
  },
};

const swipeFormat: DiggaaFormat = {
  key: "swipe_deck",
  name: "Swipe-kierros",
  async list(siteId) {
    const sb = getSupabaseAdmin() as any;
    const { data } = await sb
      .from("diggaa_decks")
      .select("id, title, category, created_at, diggaa_swipe_cards ( id )")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((d: any) => ({
      id: d.id,
      type: "swipe_deck" as const,
      title: d.title,
      detail: `${d.category} · ${d.diggaa_swipe_cards?.length ?? 0} korttia`,
      createdAt: d.created_at ?? null,
    }));
  },
};

const knockoutFormat: DiggaaFormat = {
  key: "knockout",
  name: "Knockout",
  async list(siteId) {
    const sb = getSupabaseAdmin() as any;
    const { data } = await sb
      .from("diggaa_knockouts")
      .select("id, question, category, created_at, diggaa_knockout_options ( id )")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((k: any) => ({
      id: k.id,
      type: "knockout" as const,
      title: k.question,
      detail: `${k.category} · ${k.diggaa_knockout_options?.length ?? 0} vaihtoehtoa`,
      createdAt: k.created_at ?? null,
    }));
  },
};

export const DIGGAA_FORMATS: DiggaaFormat[] = [duelFormat, swipeFormat, knockoutFormat];

export const FORMAT_NAMES: Record<string, string> = Object.fromEntries(
  DIGGAA_FORMATS.map((f) => [f.key, f.name]),
);

export async function listAllDiggaaContent(siteId: string): Promise<DiggaaContentSummary[]> {
  const lists = await Promise.all(DIGGAA_FORMATS.map((f) => f.list(siteId)));
  return lists
    .flat()
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

/* ── Julkaisut ── */

export const DURATION_PRESETS: { key: string; label: string; hours: number | null }[] = [
  { key: "1h", label: "1 tunti", hours: 1 },
  { key: "6h", label: "6 tuntia", hours: 6 },
  { key: "24h", label: "Vuorokausi", hours: 24 },
  { key: "7d", label: "Viikko", hours: 24 * 7 },
  { key: "custom", label: "Oma aikaväli", hours: null },
];

export type PublicationRow = {
  id: string;
  content_type: DiggaaContentType;
  content_id: string;
  title: string;
  status: "draft" | "scheduled" | "archived";
  opens_at: string;
  closes_at: string;
  duration_preset: string;
  featured: boolean;
};

export function publicationState(p: PublicationRow, now: Date): "live" | "tulossa" | "päättynyt" | "luonnos" | "arkistoitu" {
  if (p.status === "draft") return "luonnos";
  if (p.status === "archived") return "arkistoitu";
  const opens = new Date(p.opens_at);
  const closes = new Date(p.closes_at);
  if (now < opens) return "tulossa";
  if (now >= closes) return "päättynyt";
  return "live";
}

export async function listPublications(siteId: string): Promise<PublicationRow[]> {
  const sb = getSupabaseAdmin() as any;
  const { data } = await sb
    .from("diggaa_publications")
    .select("id, content_type, content_id, title, status, opens_at, closes_at, duration_preset, featured")
    .eq("site_id", siteId)
    .order("opens_at", { ascending: false });
  return data ?? [];
}
