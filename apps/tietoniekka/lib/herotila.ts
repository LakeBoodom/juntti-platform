// Visan pääkuvan mobiilitila (handoff "Visan pääkuva mobiili" 7.10.2026):
//   cover    = malli 3b, kuva rajataan 6:5-alueeseen kohdepisteen (hero_focal_x/y) mukaan
//   fit-blur = malli 4, koko kuva näkyy ja tausta täytetään sumennetulla kopiolla
// Varamalli valitaan, jos kuva on alle 1200 px leveä tai sivusuhde yli 1,9:1.
// Mitat tulevat build-aikaisesta manifestista (scripts/kuvamitat.mjs), ei kannasta.
import mitat from "./kuvamitat.json";

export type HeroTila = "cover" | "fit-blur";

const MITAT = mitat as Record<string, number[]>;

/** Automaattinen kohdepiste (0–1) kuvan sisällöstä (scripts/kuvamitat.mjs, sharp attention). */
export function autoFokus(kuva: string | null | undefined): { x: number; y: number } | null {
  const m = kuva ? MITAT[kuva.split("?")[0]] : undefined;
  return m && m.length >= 4 ? { x: m[2], y: m[3] } : null;
}

/** Heron kohdepiste: käsin asetettu (hero_focal_x/y) voittaa. Pelkkä 0.5/0.5 on tuonnin oletusarvo
    eikä valinta, joten silloin käytetään kuvan sisällöstä laskettua pistettä (11.10.2026). */
export function heroFokus(
  kuva: string | null | undefined,
  x: number | string | null | undefined,
  y: number | string | null | undefined,
  oletusY = 0.4,
): { x: number; y: number } {
  const nx = x != null ? Number(x) : null;
  const ny = y != null ? Number(y) : null;
  const asetettu = nx != null && ny != null && !(nx === 0.5 && ny === 0.5);
  if (asetettu) return { x: nx!, y: ny! };
  const auto = autoFokus(kuva);
  if (auto) return auto;
  return { x: nx ?? 0.5, y: ny ?? oletusY };
}

export function heroMode(kuva: string | null | undefined): HeroTila {
  const m = kuva ? MITAT[kuva.split("?")[0]] : undefined;
  if (!m) return "cover";
  const [w, h] = m;
  return w < 1200 || w / h > 1.9 ? "fit-blur" : "cover";
}
