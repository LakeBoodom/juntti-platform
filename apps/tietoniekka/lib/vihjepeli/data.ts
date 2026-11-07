// MIKÄ MAA? — palvelimen kierros: päivän maa tai harjoitusmaa + tarkistetut vihjeet 1–3 (vihjepeli_vihjeet).
// RLS näyttää anonille vain tarkistettu = true -rivit, joten tarkistamaton vihje ei koskaan päädy peliin.
// Harjoitusmaa arvotaan vain maista, joilla on kaikki kolme tarkistettua vihjettä. Päivän maan arvonta ei
// riipu vihjeistä (toistosuojan historia pysyy samana). Ennen julkaisua puuttuvan päivän maan tilalle tulee valmis maa;
// julkaisun jälkeen kaikilla 99 arvottavalla maalla pitää olla vihjeet, muuten sivu näyttää virheen.

import { unstable_cache } from "next/cache";
import { getSupabase } from "../supabase";
import { harjoitusKohde, paivanKohde } from "./arvonta";
import { MAA_AIHE, MAA_JULKAISU, MAAT, maaTaysi } from "./aiheet/maa";
import type { MaaKierros } from "./mikamaa";

type Rivi = { kohde: string; taso: number; teksti: string };

/** Vain paikallinen kehitys: MM_TESTIVIHJEET = polku tarkistamattomaan eräjsoniin ([{k, vihjeet:[{taso, teksti}]}]),
 *  jotta näkymää voi kokeilla ennen kuin vihjeet on hyväksytty. Tuotannossa ei koskaan käytössä. */
async function testivihjeet(): Promise<Record<string, [string, string, string]> | null> {
  const polku = process.env.NODE_ENV === "development" ? process.env.MM_TESTIVIHJEET : undefined;
  if (!polku) return null;
  const { readFile } = await import("node:fs/promises");
  const era = JSON.parse(await readFile(polku, "utf8")) as Array<{ k: string; vihjeet: Array<{ taso: number; teksti: string }> }>;
  return Object.fromEntries(era.map((m) => [m.k, [1, 2, 3].map((t) => m.vihjeet.find((h) => h.taso === t)?.teksti ?? "") as [string, string, string]]));
}

async function lataaVihjeet(): Promise<Record<string, [string, string, string]>> {
  const testi = await testivihjeet();
  if (testi) return testi;
  const sb = getSupabase();
  if (!sb) return {};
  const { data, error } = await sb
    .from("vihjepeli_vihjeet" as never)
    .select("kohde, taso, teksti")
    .eq("aihe", "maa")
    .lte("taso", 3);
  if (error) throw error;
  const kaikki: Record<string, string[]> = {};
  for (const r of (data ?? []) as Rivi[]) (kaikki[r.kohde] ??= [])[r.taso - 1] = r.teksti;
  const valmiit: Record<string, [string, string, string]> = {};
  for (const [k, v] of Object.entries(kaikki)) if (v[0] && v[1] && v[2]) valmiit[k] = [v[0], v[1], v[2]];
  return valmiit;
}

/** Kaikki tarkistetut vihjeet kerralla (≈ 300 riviä), välimuistissa 10 min. */
const vihjeet = unstable_cache(lataaVihjeet, ["vihjepeli-maa-vihjeet-v1"], { revalidate: 600 });

export async function maaKierros(iso: string, siemen: string | null): Promise<MaaKierros | null> {
  let v: Awaited<ReturnType<typeof lataaVihjeet>>;
  try {
    v = await vihjeet();
  } catch {
    return null;
  }
  const valmiit = MAAT.filter((m) => v[m.id]);
  const paivan = paivanKohde(MAA_AIHE, iso);
  const harjoitusMaa = (s: string) => (valmiit.length ? harjoitusKohde({ ...MAA_AIHE, kohteet: valmiit }, iso, s, paivan.id) : null);
  // Ennen julkaisua (esikatselu) vihjeitä on vasta osalla maista: päivän maaksi käy silloin valmis maa päivän siemenellä.
  const kohde = siemen ? harjoitusMaa(siemen) : !v[paivan.id] && iso < MAA_JULKAISU ? harjoitusMaa(`esikatselu-${iso}`) : paivan;
  const oikea = kohde && maaTaysi(kohde.id);
  if (!oikea || !v[oikea.id]) return null;
  const [, kk, pv] = iso.split("-").map(Number);
  return { iso, paiva: `${pv}.${kk}.`, harjoitus: siemen, oikea, vihjeet: v[oikea.id], kohteet: MAAT };
}
