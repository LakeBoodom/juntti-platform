// Visan pääkuvan mobiilitila (handoff "Visan pääkuva mobiili" 7.10.2026):
//   cover    = malli 3b, kuva rajataan 6:5-alueeseen kohdepisteen (hero_focal_x/y) mukaan
//   fit-blur = malli 4, koko kuva näkyy ja tausta täytetään sumennetulla kopiolla
// Varamalli valitaan, jos kuva on alle 1200 px leveä tai sivusuhde yli 1,9:1.
// Mitat tulevat build-aikaisesta manifestista (scripts/kuvamitat.mjs), ei kannasta.
import mitat from "./kuvamitat.json";

export type HeroTila = "cover" | "fit-blur";

const MITAT = mitat as Record<string, number[]>;

export function heroMode(kuva: string | null | undefined): HeroTila {
  const m = kuva ? MITAT[kuva.split("?")[0]] : undefined;
  if (!m) return "cover";
  const [w, h] = m;
  return w < 1200 || w / h > 1.9 ? "fit-blur" : "cover";
}
