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
import { ryhmaOf } from "./henkiloRyhmat";
import { ROUND_SIZE, shuffleChain, sortForDirection, DEFAULT_DIRECTION, type ChainPerson } from "./ikajarjestysConstants";
import { henkiloKuva } from "./henkilokuvat";
import { RIVIN_PITUUS, siemen, sekoitaSiemenella, vaaraJarjestys } from "./jarjesta/siemen";

type CelebRow = {
  id: string;
  name: string;
  role: string;
  /** celebrities.ryhma (kategoria kannasta, 19.9.2026) */
  ryhma: string | null;
  image_url: string | null;
  birth_date: string;
  suomalainen: boolean | null;
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
    .select("id, name, role, ryhma, image_url, birth_date, suomalainen")
    .eq("site_id", siteId)
    .not("birth_date", "is", null)
    .not("name", "is", null);
  if (error || !data) return [];

  const rows = data as unknown as CelebRow[];
  // Vanhat avaimet (artistit, muut) promo- ja kirjanmerkkilinkeistä → uudet ryhmät (3.10.2026).
  const kat = category === "artistit" ? "muusikot" : category;
  // "suomalaiset" = Järjestän Tunnetut suomalaiset -pakka (celebrities.suomalainen, 31.10.2026).
  let pool =
    kat === "kaikki" || kat === "muut" ? rows : kat === "suomalaiset" ? rows.filter((r) => r.suomalainen) : rows.filter((r) => ryhmaOf(r.ryhma, null) === kat);

  if (excludeIds.length > 0) {
    const withoutRecent = pool.filter((r) => !excludeIds.includes(r.id));
    // Vain jos jäljelle jää tarpeeksi henkilöitä yksikäsitteisillä syntymäpäivillä
    // kannattaa suodattaa — muuten pienempi kategoria jäisi jumiin.
    if (withoutRecent.length >= Math.min(ROUND_SIZE, pool.length)) {
      pool = withoutRecent;
    }
  }

  // Rivillä ei ole siluetteja (CD 3e): vain henkilöt, joilla on oma kuvakopio, jos heitä riittää.
  const kuvalliset = pool.filter((r) => henkiloKuva(r.image_url));
  const shuffled = shuffleChain(kuvalliset.length >= ROUND_SIZE ? kuvalliset : pool);
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
    suomalainen: !!r.suomalainen,
  }));
}

/**
 * Henkilösivun henkilökohtainen kierros (design v0.3, 4a): täsmälleen nämä henkilöt (2–10 id:tä),
 * jotka henkilösivu on valinnut (sama henkilö + päivä → samat vastustajat, vuotolista huomioitu).
 * Järjestys sekoitetaan; vain saman sivuston henkilöt kelpaavat.
 */
export async function getChainRoundByIds(ids: string[], annettuJarjestys = false): Promise<ChainPerson[]> {
  const siteId = await getSiteId();
  const sb = getSupabase();
  const puhtaat = [...new Set(ids)].filter((x) => /^[0-9a-f-]{36}$/i.test(x)).slice(0, ROUND_SIZE);
  if (!siteId || !sb || puhtaat.length < 2) return [];
  const { data, error } = await sb
    .from("celebrities")
    .select("id, name, role, ryhma, image_url, birth_date, suomalainen")
    .eq("site_id", siteId)
    .in("id", puhtaat)
    .not("birth_date", "is", null);
  if (error || !data) return [];
  // Päivän rivi (?rivi=1): järjestys on osa haastetta, joten se säilytetään.
  const rivit = data as unknown as CelebRow[];
  const jarjestetty = annettuJarjestys
    ? puhtaat.map((id) => rivit.find((r) => r.id === id)).filter((r): r is CelebRow => !!r)
    : shuffleChain(rivit);
  return jarjestetty.map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    image_url: r.image_url,
    birthDate: r.birth_date,
    suomalainen: !!r.suomalainen,
  }));
}

/**
 * Järjestä-hubin päivän henkilörivi (CD kierros 5a, 31.10.2026): RIVIN_PITUUS tunnettua suomalaista,
 * joilla on oma kuvakopio (desktopin kuvakortit), eri syntymävuodet, väärässä järjestyksessä.
 * Sama kaikille koko päivän (siemen = päivä). Hub linkittää rivin ?henkilot=…&rivi=1.
 * `poissa` = heron rivin nimet: sama henkilö ei näy kahdessa rivissä (esim. presidentti).
 */
export async function getPaivanHenkilot(paiva: string, poissa: string[] = []): Promise<Array<ChainPerson & { kuva: string }>> {
  const siteId = await getSiteId();
  const sb = getSupabase();
  if (!siteId || !sb) return [];
  const { data, error } = await sb
    .from("celebrities")
    .select("id, name, role, ryhma, image_url, birth_date, suomalainen")
    .eq("site_id", siteId)
    .eq("suomalainen", true)
    .not("birth_date", "is", null)
    .order("id");
  if (error || !data) return [];
  const rng = siemen(`${paiva}:henkilot`);
  const valitut: Array<ChainPerson & { kuva: string }> = [];
  const vuodet = new Set<string>();
  for (const r of sekoitaSiemenella(data as unknown as CelebRow[], rng)) {
    if (valitut.length >= RIVIN_PITUUS) break;
    const kuva = henkiloKuva(r.image_url);
    const vuosi = r.birth_date.slice(0, 4);
    if (!kuva || vuodet.has(vuosi) || poissa.includes(r.name)) continue;
    vuodet.add(vuosi);
    valitut.push({ id: r.id, name: r.name, role: r.role, image_url: r.image_url, birthDate: r.birth_date, suomalainen: true, kuva });
  }
  if (valitut.length < 3) return [];
  return vaaraJarjestys(sortForDirection(valitut, DEFAULT_DIRECTION) as typeof valitut, rng);
}
