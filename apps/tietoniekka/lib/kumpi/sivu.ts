// KUMPI? 2.0 — sivujen palvelinapurit: kierroksen arvonta siemenestä, hubin teemarivit ja teemojen kelpoisuus.
import { haeKumpiData } from "./data";
import { teeKierros, teePutki } from "./generate";
import { tarkistaTeema } from "./laatu";
import { KUVAUKSET, PERUSTEEMAT, SEURAT, TEEMAT, mikaTahansaTeema, seuraTeema, type Teema } from "./teemat";
import type { KumpiKysymys } from "./tyypit";

/** Hubiin otetaan teema vain, jos siitä syntyy vähintään näin monta kelvollista kysymystä (A3). */
export const HUBIN_MINIMI = 30;
const SIEMEN = /^[a-z0-9-]{3,48}$/;

export function sarjaSiemen(teema: Teema, pyydetty: unknown): { siemen: string; pyydetty: boolean } {
  if (typeof pyydetty === "string" && SIEMEN.test(pyydetty)) return { siemen: pyydetty, pyydetty: true };
  const satunnainen = Math.random().toString(36).slice(2, 8);
  return { siemen: `${teema.slug}-${satunnainen}`, pyydetty: false };
}

export async function arvoKierros(teema: Teema, siemen: string): Promise<KumpiKysymys[] | null> {
  const data = await haeKumpiData();
  if (!data) return null;
  const k = teeKierros(data, teema, siemen);
  return k.length >= 10 ? k : null;
}

/* ─── Päivän Kumpi? ja Putki (vaihe 2, Heikki 17.–22.11.2026) ─────────── */

/** Päivän Kumpi? ja Putki pelataan Yleistiedosta (kaikki aiheet, jääkiekkoa enintään 2/10). */
export const PELITAPOJEN_TEEMA = "yleistieto";

/** Päivän Kumpi?: sama kymmenen kysymyksen kierros kaikille koko Helsingin kalenteripäivän (siemen = päivämäärä). */
export const paivanSiemen = (iso: string) => `paivan-${iso}`;

export async function arvoPaivan(iso: string): Promise<KumpiKysymys[] | null> {
  const t = mikaTahansaTeema(PELITAPOJEN_TEEMA);
  return t ? arvoKierros(t, paivanSiemen(iso)) : null;
}

/** Putken erä: sivu antaa ensimmäiset 40, loput haetaan rajapinnasta (/api/kumpi/putki) samalla siemenellä. */
export const PUTKI_ERA = 40;
export const PUTKI_MAX = 400;
const PUTKI_SIEMEN = /^putki-[a-z0-9]{4,12}$/;

export const uusiPutkiSiemen = () => `putki-${Math.random().toString(36).slice(2, 10)}`;
export const kelpaaPutkiSiemen = (s: unknown): s is string => typeof s === "string" && PUTKI_SIEMEN.test(s);

export async function arvoPutki(siemen: string, alku: number, maara: number): Promise<KumpiKysymys[] | null> {
  const data = await haeKumpiData();
  const t = mikaTahansaTeema(PELITAPOJEN_TEEMA);
  if (!data || !t) return null;
  const loppu = Math.min(PUTKI_MAX, alku + maara);
  return teePutki(data, t, siemen, loppu).slice(alku, loppu);
}

/** Kysymyksen teeman nimi pelipalkkiin (Putki: perusteeman nimi, esim. "Luonto"). */
export function teemojenNimet(): Record<string, string> {
  return Object.fromEntries([...PERUSTEEMAT, ...TEEMAT].map((t) => [t.slug, t.nimi]));
}

export type HubTeema = { teema: Teema; rivi: string };

let hubMuisti: { aika: number; arvo: Promise<{ teemat: HubTeema[]; seurat: Array<{ slug: string; nimi: string }> } | null> } | null = null;

/** Hubin teemat ja seurat, joista syntyy ≥ 30 kysymystä. Tarkistus generoi 30 kysymystä per teema (muistetaan tunti). */
export function hubinTeemat() {
  if (hubMuisti && Date.now() - hubMuisti.aika < 3600_000) return hubMuisti.arvo;
  const arvo = (async () => {
    const data = await haeKumpiData();
    if (!data) return null;
    const kelpaa = (t: Teema) => tarkistaTeema(data, t, HUBIN_MINIMI, "hubi").raportti.kysymyksia >= HUBIN_MINIMI;
    return {
      teemat: TEEMAT.filter(kelpaa).map((t) => ({ teema: t, rivi: KUVAUKSET[t.slug] ?? "" })),
      seurat: SEURAT.filter((s) => kelpaa(seuraTeema(s.slug)!)),
    };
  })();
  hubMuisti = { aika: Date.now(), arvo };
  return arvo;
}
