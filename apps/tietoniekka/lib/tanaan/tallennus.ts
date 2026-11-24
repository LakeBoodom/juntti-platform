// TÄNÄÄN — pelaajan eteneminen, tulos ja putki selaimessa. Kuten muut päiväpelit (Kumpi?, Mikä maa?): oma
// localStorage-avain per päivä, ei kirjautumista. Putki = peräkkäiset päivät, joina lehti on pelattu loppuun
// (Heikki 24.11.2026). Pelikerta kirjataan nimettömänä pelimuoto_pelit-tauluun. Kaikki best-effort.
import type { Eteneminen } from "./tyypit";

const avain = (pvm: string) => `tn_tanaan_${pvm}`;
const PUTKI = "tn_tanaan_putki";

export function lueEteneminen(pvm: string): Eteneminen | null {
  try {
    const v = JSON.parse(localStorage.getItem(avain(pvm)) ?? "null");
    if (!v || !Array.isArray(v.valinnat) || v.valinnat.length !== 7 || typeof v.sivu !== "number") return null;
    return {
      valinnat: v.valinnat.map((x: unknown) => (typeof x === "number" && x >= 0 && x <= 3 ? x : null)),
      sivu: Math.max(0, Math.min(8, v.sivu)),
      pahkina: v.pahkina === "ok" || v.pahkina === "fail" || v.pahkina === "skip" ? v.pahkina : null,
      valmis: v.valmis === true,
    };
  } catch {
    return null;
  }
}

export function tallennaEteneminen(pvm: string, e: Eteneminen) {
  try { localStorage.setItem(avain(pvm), JSON.stringify(e)); } catch { /* estetty storage */ }
}

const edellinenPaiva = (pvm: string) => {
  const d = new Date(`${pvm}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

/** Kirjaa pelatun päivän putkeen ja palauttaa putken pituuden. Saman päivän toisto ei kasvata putkea. */
export function paivitaPutki(pvm: string): number {
  try {
    const v = JSON.parse(localStorage.getItem(PUTKI) ?? "null") as { viimeisin?: string; pituus?: number } | null;
    let pituus = 1;
    if (v?.viimeisin === pvm) pituus = v.pituus ?? 1;
    else if (v?.viimeisin === edellinenPaiva(pvm)) pituus = (v.pituus ?? 0) + 1;
    localStorage.setItem(PUTKI, JSON.stringify({ viimeisin: pvm, pituus }));
    return pituus;
  } catch {
    return 0;
  }
}

/** Putken pituus päivälle: voimassa, jos viimeisin pelattu päivä on tämä tai edellinen. */
export function luePutki(pvm: string): number {
  try {
    const v = JSON.parse(localStorage.getItem(PUTKI) ?? "null") as { viimeisin?: string; pituus?: number } | null;
    if (!v?.viimeisin) return 0;
    return v.viimeisin === pvm || v.viimeisin === edellinenPaiva(pvm) ? v.pituus ?? 0 : 0;
  } catch {
    return 0;
  }
}

/** Mikä maa? -pähkinän paluulinkki lehteen (sessionStorage: lehden osoite). */
export const TANAAN_PALUU = "tn_tanaan_paluu";
