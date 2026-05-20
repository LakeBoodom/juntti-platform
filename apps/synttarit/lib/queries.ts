// Synttärit-frontin DB-haut. Server-side, anon-client → respektoi RLS.
import { getSupabase, SITE_SLUG } from "./supabase";

let _siteId: string | null = null;
async function getSiteId(): Promise<string | null> {
  if (_siteId) return _siteId;
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("sites")
    .select("id")
    .eq("slug", SITE_SLUG)
    .maybeSingle();
  if (!data) return null;
  _siteId = (data as unknown as { id: string }).id;
  return _siteId;
}

export type CelebrityData = {
  id: string;
  slug: string | null;
  name: string;
  role: string;
  birth_date: string;
  bio_short: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  priority: number;
  is_hero: boolean;
};

export type VoteCounts = {
  ei_tunnista_count: number;
  tuttu_count: number;
  legenda_count: number;
  ei_uppoa_count: number;
  ihan_ok_count: number;
  rakastan_count: number;
  total_count: number;
};

// Hae tänään syntyvät julkkikset (priority 1-5, ei piilotetut)
export async function getTodaysCelebrities(): Promise<CelebrityData[]> {
  const siteId = await getSiteId();
  if (!siteId) return [];
  const sb = getSupabase();
  if (!sb) return [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const { data, error } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, priority, is_hero")
    .eq("site_id", siteId)
    .lt("priority", 99)
    .order("priority", { ascending: true });
  if (error || !data) return [];
  return (data as unknown as CelebrityData[]).filter((c) => {
    const d = new Date(c.birth_date);
    return d.getMonth() + 1 === month && d.getDate() === day;
  });
}

// Hae yksittäinen julkkis slugilla
export async function getCelebrityBySlug(slug: string): Promise<CelebrityData | null> {
  const siteId = await getSiteId();
  if (!siteId) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, priority, is_hero")
    .eq("site_id", siteId)
    .eq("slug", slug)
    .maybeSingle();
  return data as unknown as CelebrityData | null;
}

// Hae kaikki julkkikset vuosikalenteria varten
export async function getAllCelebrities(): Promise<CelebrityData[]> {
  const siteId = await getSiteId();
  if (!siteId) return [];
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, priority, is_hero")
    .eq("site_id", siteId)
    .lt("priority", 99)
    .order("birth_date", { ascending: true });
  return (data as unknown as CelebrityData[]) ?? [];
}

// Hae tietyn päivän julkkikset (kuukausi + päivä)
export async function getCelebritiesByDate(month: number, day: number): Promise<CelebrityData[]> {
  const siteId = await getSiteId();
  if (!siteId) return [];
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, priority, is_hero")
    .eq("site_id", siteId)
    .lt("priority", 99)
    .order("priority", { ascending: true });
  if (!data) return [];
  return (data as unknown as CelebrityData[]).filter((c) => {
    const d = new Date(c.birth_date);
    return d.getMonth() + 1 === month && d.getDate() === day;
  });
}

// Hae äänestystulokset yhdelle julkkikselle tänään
export async function getVoteCounts(
  celebrityId: string,
  voteDate: string
): Promise<{ awareness: VoteCounts | null; favorability: VoteCounts | null }> {
  const sb = getSupabase();
  if (!sb) return { awareness: null, favorability: null };
  const { data } = await sb
    .from("celebrity_vote_counts")
    .select("*")
    .eq("celebrity_id", celebrityId)
    .eq("vote_date", voteDate);
  if (!data) return { awareness: null, favorability: null };
  const awareness = (data as unknown as Array<VoteCounts & { question_type: string }>).find((r) => r.question_type === "awareness") ?? null;
  const favorability = (data as unknown as Array<VoteCounts & { question_type: string }>).find((r) => r.question_type === "favorability") ?? null;
  return { awareness, favorability };
}
