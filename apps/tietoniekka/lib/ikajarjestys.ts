"use server";
// TIETOKETJU: IKÄJÄRJESTYS — kierroksen data-logiikka (Next.js Server Action).
//
// "use server" tarkoittaa että tätä funktiota voi kutsua suoraan sekä
// palvelinkomponentista (app/(tn20)/peli/ikajarjestys/page.tsx, ensimmäinen
// kierros) että client-komponentista (IkajarjestysClient.tsx, "Arvo 10
// uutta" / "Arvo kierros") ilman erillistä API-reittiä — Next generoi
// RPC-kutsun automaattisesti. HUOM: "use server" -tiedosto saa eksportoida
// vain async-funktioita, siksi ROUND_SIZE ym. jaetut vakiot/tyypit asuvat
// lib/ikajarjestysConstants.ts:ssä eivätkä tässä tiedostossa.
//
// Kysely kulkee aina saman site_id-suodatuksen kautta kuin lib/queries.ts:n
// muutkin haut (CLAUDE.md core rule: site_id KAIKISSA kyselyissä).

import { getSupabase } from "./supabase";
import { getSiteId } from "./queries";
import { roleGroup } from "./personCategories";
import { ROUND_SIZE, shuffleChain, type ChainPerson } from "./ikajarjestysConstants";

type CelebRow = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  birth_date: string;
};

/**
 * Arpoo yhden pelattavan kierroksen: ROUND_SIZE pelikelpoista henkilöä
 * valitusta kategoriasta, site_id='tietoniekka' -suodatuksella.
 *
 * Säännöt (tehtävänanto kohta 5):
 * - Kahdella henkilöllä samalla kierroksella ei saa olla täsmälleen sama
 *   syntymäpäivä (muuten järjestys ei ole yksikäsitteinen).
 * - excludeIds (edellisen kierroksen henkilöt, sessionStorage clientillä)
 *   suljetaan pois PERÄKKÄISELTÄ kierrokselta, mutta vain jos poolissa on
 *   silti tarpeeksi henkilöitä jäljellä — pienessä kategoriassa peli ei saa
 *   jäädä jumiin tyhjään kierrokseen pelkän toistonestosäännön takia.
 */
export async function getChainRound(
  category: string,
  excludeIds: string[] = [],
): Promise<ChainPerson[]> {
  const siteId = await getSiteId();
  const sb = getSupabase();
  if (!siteId || !sb) return [];

  const { data, error } = await sb
    .from("celebrities")
    .select("id, name, role, image_url, birth_date")
    .eq("site_id", siteId)
    .not("birth_date", "is", null)
    .not("name", "is", null);
  if (error || !data) return [];

  const rows = data as unknown as CelebRow[];
  let pool = category === "kaikki" ? rows : rows.filter((r) => roleGroup(r.role) === category);

  if (excludeIds.length > 0) {
    const withoutRecent = pool.filter((r) => !excludeIds.includes(r.id));
    // Vain jos jäljelle jää tarpeeksi henkilöitä yksikäsitteisillä syntymäpäivillä
    // kannattaa suodattaa — muuten pienempi kategoria jäisi jumiin.
    if (withoutRecent.length >= Math.min(ROUND_SIZE, pool.length)) {
      pool = withoutRecent;
    }
  }

  const shuffled = shuffleChain(pool);
  const picked: CelebRow[] = [];
  const seenDates = new Set<string>();
  for (const row of shuffled) {
    if (picked.length >= ROUND_SIZE) break;
    if (seenDates.has(row.birth_date)) continue; // ei kahta samaa syntymäpäivää samalla kierroksella
    seenDates.add(row.birth_date);
    picked.push(row);
  }

  return picked.map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    image_url: r.image_url,
    birthDate: r.birth_date,
  }));
}
