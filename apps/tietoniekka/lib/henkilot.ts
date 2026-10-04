// Erä B3 (3.10.2026): henkilöhakemisto /henkilot, ryhmä- ja lajisivut sekä synttärikalenteri.
// Kaikki näkyvät henkilöt (RLS piilottaa luonnosvisojen henkilöt) yhdellä kevyellä haulla; ikä
// lasketaan palvelimella Suomen ajassa (ISR 1 h). Rivit linkittävät nimestä johdettuun osoitteeseen.
import { getSupabase } from "./supabase";
import { getSiteId } from "./queries";
import { ryhmaOf, type RyhmaKey } from "./henkiloRyhmat";
import { henkiloSlug } from "./henkiloSlug";
import { ikaRivi, parsePvm, tanaan, type Pvm } from "./henkilo";

export type HakemistoRivi = {
  href: string;
  name: string;
  /** Lajitteluavain: sukunimi + etunimet ("raikkonen kimi"). */
  avain: string;
  /** Hakemiston kirjain (sukunimen alkukirjain, A–Ö). */
  kirjain: string;
  meta: string;
  image_url: string | null;
  ryhma: RyhmaKey;
  laji: string | null;
  synt: Pvm | null;
};

const KIRJAIMET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ";
const vertaa = new Intl.Collator("fi").compare;

/** Sukunimi = viimeinen sana ennen sulkeita (Sanni (laulaja) → Sanni; Lauri "Tahko" Pihkala → Pihkala). */
function sukunimi(nimi: string): string {
  const ilman = nimi.replace(/\s*\(.*?\)\s*/g, " ").replace(/["”“]/g, "").trim();
  const osat = ilman.split(/\s+/);
  if (/^(III?|IV|V|Jr\.?|Sr\.?)$/.test(osat[osat.length - 1]) && osat.length > 1) osat.pop();
  return osat[osat.length - 1] ?? nimi;
}

export async function haeHakemisto(): Promise<HakemistoRivi[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  const { data } = await sb
    .from("celebrities")
    .select("name, role, ryhma, laji, image_url, birth_date, death_date")
    .eq("site_id", siteId)
    .limit(2000);
  const nyt = tanaan();
  const rivit = ((data ?? []) as Array<{
    name: string; role: string | null; ryhma: string | null; laji: string | null;
    image_url: string | null; birth_date: string | null; death_date: string | null;
  }>).map((c) => {
    const suku = sukunimi(c.name);
    const eka = suku.charAt(0).toUpperCase();
    return {
      href: `/henkilo/${henkiloSlug(c.name)}`,
      name: c.name,
      avain: `${suku} ${c.name}`.toLowerCase(),
      kirjain: KIRJAIMET.includes(eka) ? eka : "#",
      meta: [c.role, ikaRivi(c.birth_date, c.death_date, nyt)].filter(Boolean).join(" · "),
      image_url: c.image_url,
      ryhma: ryhmaOf(c.ryhma, c.laji),
      laji: c.laji,
      synt: parsePvm(c.birth_date),
    };
  });
  return rivit.sort((a, b) => vertaa(a.avain, b.avain));
}

/** Kirjaimittain ryhmitelty lista (tyhjät kirjaimet pois). */
export function kirjaimittain(rivit: HakemistoRivi[]): Array<{ k: string; rivit: HakemistoRivi[] }> {
  const m = new Map<string, HakemistoRivi[]>();
  for (const r of rivit) m.set(r.kirjain, [...(m.get(r.kirjain) ?? []), r]);
  return [...m.entries()].sort((a, b) => vertaa(a[0], b[0])).map(([k, rivit]) => ({ k, rivit }));
}
