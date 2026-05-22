// Synttärit-frontin DB-haut. Server-side, anon-client → respektoi RLS.
// Näyttää julkkikset joilla platform = 'synttarit' TAI 'both'
import { getSupabase } from "./supabase";

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

// Hae tänään syntyvät julkkikset (platform = synttarit tai both, priority < 99)
export async function getTodaysCelebrities(): Promise<CelebrityData[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const { data, error } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, priority, is_hero")
    .in("platform", ["synttarit", "both"])
    .lt("priority", 99)
    .order("priority", { ascending: true });

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const celebs = (data as any) as CelebrityData[];
  return celebs.filter((c) => {
    const d = new Date(c.birth_date);
    return d.getMonth() + 1 === month && d.getDate() === day;
  });
}

// Hae yksittäinen julkkis slugilla
export async function getCelebrityBySlug(slug: string): Promise<CelebrityData | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, priority, is_hero")
    .in("platform", ["synttarit", "both"])
    .eq("slug", slug)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any) as CelebrityData | null;
}

// Hae kaikki julkkikset vuosikalenteria varten
export async function getAllCelebrities(): Promise<CelebrityData[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, priority, is_hero")
    .in("platform", ["synttarit", "both"])
    .lt("priority", 99)
    .order("birth_date", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any) as CelebrityData[]) ?? [];
}

// Hae tietyn päivän julkkikset
export async function getCelebritiesByDate(month: number, day: number): Promise<CelebrityData[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, priority, is_hero")
    .in("platform", ["synttarit", "both"])
    .lt("priority", 99)
    .order("priority", { ascending: true });

  if (!data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const celebs = (data as any) as CelebrityData[];
  return celebs.filter((c) => {
    const d = new Date(c.birth_date);
    return d.getMonth() + 1 === month && d.getDate() === day;
  });
}

// Hae äänestystulokset
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = data as any[];
  const awareness = rows.find((r) => r.question_type === "awareness") ?? null;
  const favorability = rows.find((r) => r.question_type === "favorability") ?? null;

  return { awareness, favorability };
}
