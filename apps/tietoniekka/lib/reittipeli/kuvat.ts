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

/** Jaetun reitin siemen ja ryhmä osoitteesta (?reitti=, ?maanosa=/?maakunta=), tai null. */
function jaettuReitti(peli: ReittipeliAvain, sp: Record<string, string | string[] | undefined>) {
  const siemen = typeof sp.reitti === "string" && /^[a-z0-9-]{3,40}$/.test(sp.reitti) ? sp.reitti : null;
  if (!siemen) return null;
  const param = REITTIPELIT[peli].param;
  const ryhma = param && typeof sp[param] === "string" ? (sp[param] as string) : null;
  return { siemen, param, ryhma };
}

/** Pelisivun og:image (Jakotekstit v4 §4, vaihe 2): jaetulla reitillä (?reitti=) reitin jakokortti ilman tulosta,
 *  muuten sivun oma kuva. Tulos on viestissä, ei kortissa. */
export function reittiJakokuva(peli: ReittipeliAvain, sp: Record<string, string | string[] | undefined>, oletus: string): string {
  const j = jaettuReitti(peli, sp);
  if (!j) return oletus;
  const q = new URLSearchParams();
  if (j.param && j.ryhma) q.set(j.param, j.ryhma);
  q.set("reitti", j.siemen);
  return `/og/reitti/${peli}?${q}`;
}

/** Jaetun reitin korttinimi "Portugali → Viro" (sama kuin jakotekstissä), tai null. */
export function reittiKorttinimi(peli: ReittipeliAvain, sp: Record<string, string | string[] | undefined>): string | null {
  const j = jaettuReitti(peli, sp);
  const r = j ? reittiSiemenesta(peli, j.siemen, j.ryhma) : null;
  if (!r) return null;
  const pisteet = REITTIPELIT[peli].kuvakartta(r.ids, r.ryhma, { suhde: 1 }).pisteet;
  const a = pisteet[0]?.n, b = pisteet[pisteet.length - 1]?.n;
  return a && b ? `${a} → ${b}` : null;
}

/* Koukku (Jakotekstit v4 §4, vaihe 4: "rajanaapureissa ja kuntaliitoksessa lähtö ja maali"). Viikon reitillä on
   käsin taivutettu otsikko ("Portugalista Viroon"), joten koukku voi nimetä päätepisteet; arvotulla reitillä nimet
   ovat vain perusmuodossa (kortin otsikko "Portugali → Viro"), joten koukku viittaa niihin taivuttamatta. */
const KAUTTA: Record<ReittipeliAvain, { kautta: string; valissa: string }> = {
  rajanaapurit: { kautta: "naapurimaiden kautta", valissa: "Mitkä maat ovat välissä?" },
  osavaltiot: { kautta: "naapuriosavaltioiden kautta", valissa: "Mitkä osavaltiot ovat välissä?" },
  kuntaliitos: { kautta: "naapurikuntien kautta", valissa: "Mitkä kunnat ovat välissä?" },
};

/** Jaetun reitin koukku, tai null ilman jaettua reittiä. */
export function reittiKoukku(peli: ReittipeliAvain, sp: Record<string, string | string[] | undefined>): string | null {
  const j = jaettuReitti(peli, sp);
  const r = j ? reittiSiemenesta(peli, j.siemen, j.ryhma) : null;
  return r ? reitinKoukku(peli, r) : null;
}

/** Reitin koukku (sama kortissa ja og:descriptionissa). */
export const reitinKoukku = (peli: ReittipeliAvain, r: { otsikko: string | null }) =>
  r.otsikko ? `Pääsetkö ${r.otsikko} ${KAUTTA[peli].kautta}?` : KAUTTA[peli].valissa;
