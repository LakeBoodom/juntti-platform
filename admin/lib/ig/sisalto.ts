// Julkaisurivin sisältö piirtoa ja tarkistusta varten: Päivän visa ja synttärit
// tulevat päivän aikataulusta, oma julkaisu rivin omasta visasta. Toimituksen
// korvaava kuva (kentat.kuva) sovelletaan kaikkiin.

import { haePaivanSynttarit, haePaivanVisa, haeVisa, korvaaKuva, type SynttariData, type VisaData } from "./data";
import type { Kentat } from "./pohjat";

export type RivinLahde = {
  site_id: string;
  paiva: string;
  slotti: "paivan_visa" | "synttarit" | "oma";
  quiz_id: string | null;
};

export type Sisalto = { tyyppi: "visa"; v: VisaData } | { tyyppi: "synttarit"; s: SynttariData };

export async function rivinSisalto(r: RivinLahde, k: Kentat, lataaKuvat = true): Promise<Sisalto | null> {
  if (r.slotti === "synttarit") {
    const s = await haePaivanSynttarit(r.site_id, r.paiva, lataaKuvat);
    if (!s) return null;
    return { tyyppi: "synttarit", s: lataaKuvat ? await korvaaKuva(s, k.kuva) : s };
  }
  const v =
    r.slotti === "oma"
      ? r.quiz_id
        ? await haeVisa(r.quiz_id, r.paiva, { oma: true, otsake: k.otsake, lataaKuvat })
        : null
      : await haePaivanVisa(r.site_id, r.paiva, lataaKuvat);
  if (!v) return null;
  return { tyyppi: "visa", v: lataaKuvat ? await korvaaKuva(v, k.kuva) : v };
}
