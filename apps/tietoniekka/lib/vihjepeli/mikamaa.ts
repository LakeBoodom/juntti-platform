// MIKÄ MAA? — selaimen ja palvelimen yhteiset vakiot, kierroksen muoto, tallenne ja jakoteksti.
// Ei tuo maat.jsonia: selain saa vain kevyen maalistan propsina (siluetit ≈ 200 kt jäävät palvelimelle).

import { jarjestysluvulla, tulosjakoteksti } from "../korttinimi";
import { ARVAUKSIA } from "./tyypit";
import type { MaaKohde, MaaTaysi } from "./aiheet/maa";

export const MM_NIMI = "Mikä maa?";
export const MM_SIVU = "/peli/mika-maa";
export const MM_KOTI = { href: "/peli/karttapelit", nimi: "Karttapelit" };

/** Kierros palvelimelta pelinäkymälle. vihjeet = tasot 1–3 (null: tarkistettuja vihjeitä ei vielä ole). */
export type MaaKierros = {
  iso: string;
  /** "7.11." */
  paiva: string;
  /** Harjoitusmaan siemen (?kohde=…); null = päivän maa. */
  harjoitus: string | null;
  oikea: MaaTaysi;
  vihjeet: [string, string, string];
  kohteet: MaaKohde[];
};

/** Päivän maan tulos selaimessa ("jo pelattu"). arvaukset = maiden tunnukset järjestyksessä. */
export type MaaTallenne = { kohde: string; arvaukset: string[]; ratkesi: boolean };
export const tallenneAvain = (iso: string) => `tn-mm-${iso}`;

export function lueTallenne(iso: string): MaaTallenne | null {
  try {
    const v = JSON.parse(localStorage.getItem(tallenneAvain(iso)) ?? "null");
    const ok = v && typeof v.kohde === "string" && typeof v.ratkesi === "boolean" && Array.isArray(v.arvaukset) &&
      v.arvaukset.length >= 1 && v.arvaukset.length <= ARVAUKSIA && v.arvaukset.every((x: unknown) => typeof x === "string");
    return ok ? (v as MaaTallenne) : null;
  } catch {
    return null;
  }
}

/** Jakotekstit v4: "Mikä maa?: arvasin kolmannella arvauksella. Kokeile itse:" */
export function jakoteksti(t: Pick<MaaTallenne, "arvaukset" | "ratkesi">): string {
  return tulosjakoteksti(
    MM_NIMI,
    t.ratkesi ? `arvasin ${jarjestysluvulla(t.arvaukset.length)} arvauksella` : "en arvannut kuudella arvauksella" /* ARVAUKSIA = 6 */,
  );
}

/** Harjoitusmaan siemen: arvotaan vasta painettaessa (renderissä arvottu erottaisi palvelimen ja selaimen HTML:n). */
export const uusiSiemen = () => Math.random().toString(36).slice(2, 8);
