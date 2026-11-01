// REITTIPELIEN KUVAT (CD-handoff "Rajanaapurit: Yhdysvallat" 1.11.2026): jakokortti 7b ja korttikuvat 7a/7d
// piirretään pelin omasta aineistosta mallilla 6c (app/og/reitti). Tämä moduuli kokoaa kolme reittipeliä
// yhteen: reitti siemenestä (viikon reitti tai arvonta) ja kuvan kartta. Vain palvelimelle.

import * as RN from "@/lib/rajanaapurit/reitti";
import * as KL from "@/lib/kuntaliitos/reitti";
import * as USA from "@/lib/rajanaapurit/osavaltiot";
import { RN_SIVU, RN_USA_SIVU } from "@/lib/rajanaapurit";
import { KL_SIVU } from "@/lib/kuntaliitos";
import { VIIKON_REITIT, viikkoSiemenesta, viikonReitti } from "@/lib/reittipeli/viikonReitit";

type Kuvakartta = ReturnType<typeof RN.kuvakartta>;
export type ReittipeliAvain = keyof typeof VIIKON_REITIT;

export const REITTIPELIT: Record<ReittipeliAvain, {
  /** Jakokortin yläotsikko ja otsikko ("RAJANAAPURIT" / "YHDYSVALLAT"). */
  laji: string; kartta: string; sivu: string; tunnus: "lippu" | "kilpi";
  /** Ryhmäparametri (?maanosa=, ?maakunta=) ja sen nimi. */
  param: string | null; ryhma: (tunnus: string | null) => string | null;
  arvo: (siemen: string, ryhma: string | null) => { ratkaisu: Array<{ k: string }> } | null;
  alueista: (ids: string[], siemen: string) => { ratkaisu: Array<{ k: string }> } | null;
  kuvakartta: (ids: string[], ryhma: string | null, o: { suhde: number; minLeveys?: number }) => Kuvakartta;
  /** Kuvan kartan vähimmäisleveys (aineiston yksiköissä): 7b "vähintään 40 % manner-USA:n leveydestä". */
  minLeveys?: number;
}> = {
  rajanaapurit: {
    laji: "Rajanaapurit", kartta: "Maailma", sivu: RN_SIVU, tunnus: "lippu",
    param: "maanosa", ryhma: (t) => RN.maanosaTunnuksella(t)?.nimi ?? null,
    arvo: RN.arvoReitti, alueista: RN.reittiAlueista, kuvakartta: RN.kuvakartta,
  },
  osavaltiot: {
    laji: "Rajanaapurit", kartta: "Yhdysvallat", sivu: RN_USA_SIVU, tunnus: "lippu",
    param: null, ryhma: () => null,
    arvo: USA.arvoUsaReitti, alueista: USA.usaReittiAlueista, kuvakartta: USA.usaKuvakartta, minLeveys: 1900,
  },
  kuntaliitos: {
    laji: "Kuntaliitos", kartta: "Suomi", sivu: KL_SIVU, tunnus: "kilpi",
    param: "maakunta", ryhma: (t) => KL.maakuntaTunnuksella(t)?.nimi ?? null,
    arvo: KL.arvoReitti, alueista: KL.reittiAlueista, kuvakartta: KL.kuvakartta,
  },
};

export const onReittipeli = (p: string): p is ReittipeliAvain => p in REITTIPELIT;

/** Reitti siemenestä kuten pelisivulla: viikko-YYYY-MM-DD = viikon reitti (otsikkoineen), muuten arvonta. */
export function reittiSiemenesta(peli: ReittipeliAvain, siemen: string, ryhmaTunnus: string | null) {
  const g = REITTIPELIT[peli];
  const viikko = viikkoSiemenesta(siemen);
  const v = viikko ? viikonReitti(peli, viikko) : null;
  const ryhma = viikko ? null : g.ryhma(ryhmaTunnus);
  const r = (v && g.alueista(v.reitti, siemen)) || g.arvo(siemen, ryhma);
  return r ? { ids: r.ratkaisu.map((k) => k.k), otsikko: v?.otsikko ?? null, ryhma } : null;
}

/** Pelisivun og:image: jaetulla tuloksella (?tulos=7-7) reitin jakokortti (7b), muuten sivun oma kuva. */
export function reittiJakokuva(peli: ReittipeliAvain, sp: Record<string, string | string[] | undefined>, oletus: string): string {
  if (typeof sp.tulos !== "string" || !/^\d{1,2}-\d{1,2}$/.test(sp.tulos)) return oletus;
  const q = new URLSearchParams();
  for (const k of [REITTIPELIT[peli].param, "reitti", "tulos"]) {
    const v = k ? sp[k] : undefined;
    if (k && typeof v === "string") q.set(k, v);
  }
  return `/og/reitti/${peli}?${q}`;
}
