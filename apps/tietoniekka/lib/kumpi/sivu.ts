// KUMPI? 2.0 — sivujen palvelinapurit: kierroksen arvonta siemenestä, hubin teemarivit ja teemojen kelpoisuus.
import { haeKumpiData } from "./data";
import { jaaKysymys, teeKierros, teemanSpecit, uusiKonteksti } from "./generate";
import { tarkistaTeema } from "./laatu";
import { SEURAT, TEEMAT, seuraTeema, type Teema } from "./teemat";
import type { KumpiData, KumpiKysymys } from "./tyypit";

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

/** Hubin rivin tietorivi: teeman ensimmäinen kysymyslause kannasta ilman hakasulkeita ("Kumpi järvi on suurempi?").
 *  Testipalaute 20.11.: pelkät avainsanat ("Suurempi · Korkeammalle") eivät kertoneet, mitä teemassa kysytään. */
function esimerkkikysymys(data: KumpiData, teema: Teema): string {
  const ctx = uusiKonteksti(data, teema, "hubi");
  const lause = teemanSpecit(ctx)
    .map((s) => data.defs[s.key].kysymys)
    .find((k) => !k.includes("{"));
  if (!lause) return "";
  const o = jaaKysymys(lause);
  return `${o.ennen}${o.avain}${o.jalkeen}`;
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
      teemat: TEEMAT.filter(kelpaa).map((t) => ({ teema: t, rivi: esimerkkikysymys(data, t) })),
      seurat: SEURAT.filter((s) => kelpaa(seuraTeema(s.slug)!)),
    };
  })();
  hubMuisti = { aika: Date.now(), arvo };
  return arvo;
}
