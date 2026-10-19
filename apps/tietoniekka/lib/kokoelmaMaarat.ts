// KOKOELMIEN VISAMÄÄRÄT — /kokoelmat-sivun ja kokoelmarungon V7-korttien yhteinen laskenta
// (siirretty app/(tn20)/kokoelmat/page.tsx:stä 19.10.2026, runko vaihe 1). Logiikka ennallaan.
import { getSupabase } from "@/lib/supabase";
import { JP_CLUBS, JP_EURO, JP_PL_GENERAL, JP_CL, JP_FINNS } from "@/lib/jalkapallo";
import { JK_TEAMS, JK_DERBIES, JK_GENERAL, JK_LIONS, JK_NHL } from "@/lib/jaakiekko";
import { KAUPUNGIT } from "@/lib/kaupungit";
import { RISTIIN } from "@/lib/vaalit/data";

/* Jääkiekko ja Jalkapallo eivät ole kannassa omia kokoelmia (visat ovat
   urheilua) — niiden visamäärät lasketaan teemasivujen visalistoista
   (julkaistut slugit), samat listat jotka sivut itse renderöivät. */
const JP_SLUGS = new Set(
  [...JP_CLUBS, ...JP_EURO, ...JP_PL_GENERAL, ...JP_CL, ...JP_FINNS].map((c) => c.quizSlug),
);
const JK_SLUGS = new Set(
  [
    ...JK_TEAMS.map((t) => t.quizSlug),
    ...[...JK_DERBIES, ...JK_GENERAL, ...JK_LIONS, ...JK_NHL].map((c) => c.quizSlug),
  ].filter((s): s is string => Boolean(s)),
);
/* Suomen kaupungit (28.8.2026): visat ovat kannassa yleistieto-kokoelmaa,
   sama laskentaperiaate kuin Jääkiekko/Jalkapallo. */
const KAUPUNGIT_SLUGS = new Set(KAUPUNGIT.map((c) => c.quizSlug));
const VAALIT_RISTIIN = new Set(RISTIIN);

export async function getCounts(): Promise<Record<string, number>> {
  try {
    const sb = getSupabase();
    if (!sb) return {};
    const { data } = await sb.from("quiz_cards" as never).select("collection, category, slug, target_age");
    const counts: Record<string, number> = {};
    for (const r of (data ?? []) as Array<{ collection: string | null; category: string | null; slug: string | null; target_age: string | null }>) {
      /* Lasten visat (11.10.2026) lasketaan vain Lasten visat -kokoelmaan, ei Luontoon tai Juhliin. */
      if (r.target_age === "4-7" || r.target_age === "8-12") { counts.lapset = (counts.lapset ?? 0) + 1; continue; }
      if (r.collection) counts[r.collection] = (counts[r.collection] ?? 0) + 1;
      if (r.slug && JP_SLUGS.has(r.slug)) counts.jalkapallo = (counts.jalkapallo ?? 0) + 1;
      if (r.slug && JK_SLUGS.has(r.slug)) counts.jaakiekko = (counts.jaakiekko ?? 0) + 1;
      if (r.slug && KAUPUNGIT_SLUGS.has(r.slug)) counts.kaupungit = (counts.kaupungit ?? 0) + 1;
      /* Tiede & teknologia (20.9.2026): visat ovat yleistietoa, kokoelma
         tunnistetaan kategoriasta. */
      if (r.category === "tiede-teknologia") counts.tiede = (counts.tiede ?? 0) + 1;
      /* Vaalit ja politiikka (5.10.2026): omat visat category=politiikka + ristiinlistatut. */
      /* collection='vaalit' on jo laskettu yllä; tässä vain muualle kirjatut politiikkavisat ja ristiinlistatut. */
      if ((r.category === "politiikka" && r.collection !== "vaalit") || (r.slug && VAALIT_RISTIIN.has(r.slug))) counts.vaalit = (counts.vaalit ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

