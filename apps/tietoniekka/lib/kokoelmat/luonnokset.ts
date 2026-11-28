// LUONNOSVISAT ESIKATSELUSSA (Euroviisut-kokoelma, CC-brief 28.11.2026 §4). Vercelin preview (VERCEL_ENV ≠ production)
// näyttää kokoelmasivulla myös luonnosvisat, ja niitä voi pelata, jotta Heikki näkee sivun täytenä ennen julkaisua.
// Luonnokset luetaan palvelinpuolella service role -avaimella vain esikatselussa (RLS päästää anonin vain julkaistuihin);
// tuotannossa tämä tiedosto ei avaa mitään. Rajaus: vain visat, joiden section_tags osuu EUROVIISUT-osioihin.
// Euroviisut avautuu tuotannossa, kun julkaistuja visoja on ≥ EUROVIISUT_AUKI (sivu, valikkolinkki, Musiikin V7-tiili).
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { EUROVIISUT, EUROVIISUT_AUKI } from "./euroviisut";

export const esikatselu = () => process.env.VERCEL_ENV !== "production";

/** Osiotagit, joiden luonnosvisat näkyvät ja ovat pelattavissa esikatselussa. */
export const LUONNOS_TAGIT = EUROVIISUT.sections.map((s) => s.slug);

/** Service role -asiakas vain esikatselussa; muuten null. */
export function luonnosAsiakas() {
  if (!esikatselu()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const avain = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !avain) return null;
  return createClient(url, avain, { auth: { persistSession: false } });
}

/** Onko visa esikatselussa pelattava luonnos (osiotagi osuu luonnoskokoelmaan). */
export const luonnosSallittu = (tagit: string[] | null | undefined) => esikatselu() && (tagit ?? []).some((t) => LUONNOS_TAGIT.includes(t));

const julkaistujaTuotannossa = unstable_cache(
  async (): Promise<number> => {
    const sb = getSupabase();
    if (!sb) return 0;
    const { count } = await sb.from("quiz_cards" as never).select("id", { count: "exact", head: true }).overlaps("section_tags", LUONNOS_TAGIT);
    return count ?? 0;
  },
  ["euroviisut-julkaistut-v1"],
  { revalidate: 600 },
);

/** Euroviisut-kokoelman tila: visamäärä (esikatselussa luonnokset mukana) ja onko sivu auki. */
export async function euroviisutTila(): Promise<{ maara: number; auki: boolean }> {
  const palvelu = luonnosAsiakas();
  if (palvelu) {
    const { count } = await palvelu.from("quizzes").select("id", { count: "exact", head: true })
      .in("status", ["published", "draft"]).overlaps("section_tags", LUONNOS_TAGIT);
    return { maara: count ?? 0, auki: true };
  }
  const maara = await julkaistujaTuotannossa();
  return { maara, auki: esikatselu() || maara >= EUROVIISUT_AUKI };
}
