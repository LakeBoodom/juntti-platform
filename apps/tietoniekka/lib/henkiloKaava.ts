// Erä B1: Lyhyesti-kaavat ryhmittäin (design-brief §B). Data-ajo (B2) tuottaa celebrities.facts-rivit
// näillä nimiöillä; sivu näyttää rivit sellaisinaan (label tulee datasta), joten kaava on
// generoinnin ja tarkistuksen lähde.
import type { RyhmaKey } from "./henkiloRyhmat";

export const LYHYESTI_KAAVA: Record<RyhmaKey, [string, string, string]> = {
  urheilijat: ["Laji ja sarja", "Huippuhetki", "Ura"],
  muusikot: ["Tyyli / yhtye", "Läpimurto", "Ura"],
  nayttelijat: ["Tunnetuin rooli", "Huippuhetki", "Ura"],
  poliitikot: ["Tehtävä", "Huippuhetki", "Kausi / puolue"],
  media: ["Tunnetuin ohjelma / elokuva", "Huippuhetki", "Ura"],
  kirjailijat: ["Tunnetuin teos", "Tunnustus", "Ura"],
  vaikuttajat: ["Ala", "Huippuhetki", "Ura"],
};

export type Fakta = { label: string; value: string };

/** celebrities.facts (jsonb) → 0–3 siistiä riviä. Hylkää muodoltaan virheelliset. */
export function lueFaktat(raw: unknown): Fakta[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Fakta => !!x && typeof x.label === "string" && typeof x.value === "string" && !!x.label.trim() && !!x.value.trim())
    .slice(0, 3)
    .map((x) => ({ label: x.label.trim(), value: x.value.trim() }));
}
