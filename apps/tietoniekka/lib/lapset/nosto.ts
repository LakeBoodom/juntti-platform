// LASTEN VISAT — ajankohtainen nosto (/lapset-sivu, etusivun kaista, Juhlat-levy; brief §6–7).
//
// Brief: "jouluna lasten jouluvisat, muuten uusin aihe". Tarkka ikkuna ei ole briefissä, joten oletus:
// juhla-aihe (lasten_aihe = juhlan slug lib/juhlat.ts:ssä, esim. joulu) on ajankohtainen 8 viikkoa ennen
// juhlaa ja juhlan loppuun asti (joulu ≈ 29.10.–26.12.). Muulloin nostetaan uusimman visan aihe.
// Puhdas moduuli: päivä annetaan parametrina (UTC-keskiyön ms, lib/juhlat.ts:n pvm()).
import { JUHLAT } from "@/lib/juhlat";
import type { LastenListaKortti } from "@/lib/lapset/data";

export const JUHLA_NOSTO_PAIVAA = 56;
const PV = 864e5;

export type Ajankohtainen = { aihe: string; juhla: boolean };

/** Juhla-aihe, jos jokin lasten visojen juhla on nyt ikkunassaan, muuten null. */
export function ajankohtainenJuhla(aiheet: Set<string>, tanaan: number): string | null {
  const vuosi = new Date(tanaan).getUTCFullYear();
  for (const j of JUHLAT) {
    if (!aiheet.has(j.slug)) continue;
    for (const y of [vuosi - 1, vuosi, vuosi + 1]) {
      const alku = j.paiva(y), loppu = alku + (j.loppu ?? 0) * PV;
      if (tanaan <= loppu && alku - tanaan <= JUHLA_NOSTO_PAIVAA * PV) return j.slug;
    }
  }
  return null;
}

export function ajankohtainen(visat: LastenListaKortti[], tanaan: number): Ajankohtainen | null {
  const aiheet = new Set(visat.map((v) => v.aihe).filter((a): a is string => !!a));
  const juhla = ajankohtainenJuhla(aiheet, tanaan);
  if (juhla) return { aihe: juhla, juhla: true };
  const uusin = visat.find((v) => v.aihe)?.aihe;
  return uusin ? { aihe: uusin, juhla: false } : null;
}
