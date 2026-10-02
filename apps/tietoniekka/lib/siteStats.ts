// SEO-erä A8 (2.10.2026): sivuston luvut yhdestä lähteestä. Aiemmin "500+ visaa" oli kovakoodattu
// taglineen, titleen, juuren Organization/WebSite-kuvaukseen, manifestiin ja llms.txt:hen,
// vaikka julkaistuja visoja oli 757. Välimuisti 1 h.
import { unstable_cache } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { NAV_COLLECTIONS } from "@/lib/nav";

export type SiteStats = {
  /** Julkaistut visat (megat mukaan lukien) */
  quizzes: number;
  /** Julkaistujen visojen kysymykset */
  questions: number;
  /** Kokoelmahubit (navigaation kokoelmat) */
  collections: number;
  /** Pyöristetty alaspäin sataan: 757 → 700 */
  quizzesFloor: number;
};

const OLETUS: SiteStats = { quizzes: 700, questions: 5000, collections: NAV_COLLECTIONS.length, quizzesFloor: 700 };

export const getSiteStats = unstable_cache(
  async (): Promise<SiteStats> => {
    const sb = getSupabase();
    if (!sb) return OLETUS;
    const siteId = await getSiteId();
    let q = sb.from("quiz_cards" as never).select("question_count");
    if (siteId) q = q.eq("site_id", siteId);
    const { data, error } = await q;
    if (error || !data) return OLETUS;
    const rivit = data as unknown as Array<{ question_count: number | null }>;
    const quizzes = rivit.length;
    const questions = rivit.reduce((s, r) => s + (r.question_count ?? 0), 0);
    return { quizzes, questions, collections: NAV_COLLECTIONS.length, quizzesFloor: Math.max(100, Math.floor(quizzes / 100) * 100) };
  },
  ["site-stats-v1"],
  { revalidate: 3600 },
);

/** "700+ visaa" */
export const visaMaara = (s: SiteStats) => `${s.quizzesFloor}+ visaa`;
/** "Yli 700 visaa" */
export const yliVisaa = (s: SiteStats) => `Yli ${s.quizzesFloor} visaa`;
