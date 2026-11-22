// KUMPI? 2.0 vaihe 2 — Päivän Kumpi?:n tulos ja Putken ennätys selaimen localStorageen (ei kirjautumista, ei PII:tä).
// Kaikki best-effort: estetty storage (yksityinen selaus) ei estä pelaamista, tulos vain ei säily.

const PAIVAN_AVAIN = "kumpi_paivan";
const ENNATYS_AVAIN = "kumpi_putki_ennatys";

export type PaivanTulos = { pvm: string; osumat: boolean[] };

/** Tämän päivän (Helsinki, "2026-11-22") tulos, jos Päivän Kumpi? on jo pelattu. */
export function luePaivanTulos(pvm: string): PaivanTulos | null {
  try {
    const t = JSON.parse(localStorage.getItem(PAIVAN_AVAIN) ?? "null") as PaivanTulos | null;
    return t && t.pvm === pvm && Array.isArray(t.osumat) ? t : null;
  } catch {
    return null;
  }
}

export function tallennaPaivanTulos(t: PaivanTulos) {
  try { localStorage.setItem(PAIVAN_AVAIN, JSON.stringify(t)); } catch { /* ohitetaan */ }
}

export function lueEnnatys(): number {
  try {
    const n = Number(localStorage.getItem(ENNATYS_AVAIN));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

/** Tallentaa putken, jos se on uusi ennätys. Palauttaa edellisen ennätyksen. */
export function kirjaaPutki(n: number): number {
  const edellinen = lueEnnatys();
  if (n > edellinen) {
    try { localStorage.setItem(ENNATYS_AVAIN, String(n)); } catch { /* ohitetaan */ }
  }
  return edellinen;
}

/** Päivämäärä lyhyesti: "2026-11-22" → "22.11." */
export const lyhytPvm = (iso: string) => {
  const [, kk, pv] = iso.split("-").map(Number);
  return `${pv}.${kk}.`;
};
