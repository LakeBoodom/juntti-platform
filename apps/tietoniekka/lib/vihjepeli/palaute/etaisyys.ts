// VIHJEPELI — etäisyys- ja suuntapalaute (maa, myöhemmin kaupunki). Linnuntie aiheen antamien pisteiden välillä
// (maat: pääkaupungit, Heikki 8.11.2026).

import { haversineKm } from "../../duel";
import type { Palaute, Suunta } from "../tyypit";

export type Sijainti = { lat: number; lon: number };

const SUUNNAT: Suunta[] = ["pohjoinen", "koillinen", "itä", "kaakko", "etelä", "lounas", "länsi", "luode"];

/** Suunta pisteestä a pisteeseen b loksodromia pitkin (kompassisuunta kartalla), 0–360° myötäpäivään pohjoisesta.
 *  Ei isoympyrän alkusuuntaa: sen mukaan Brasilia on Japanista koillisessa (napojen kautta), kartalla idässä. */
export function suuntaAsteet(a: Sijainti, b: Sijainti): number {
  const rad = Math.PI / 180;
  const f1 = a.lat * rad, f2 = b.lat * rad;
  let dl = (b.lon - a.lon) * rad;
  if (Math.abs(dl) > Math.PI) dl = dl > 0 ? dl - 2 * Math.PI : dl + 2 * Math.PI; // lyhyempi tie päivämäärärajan yli
  const dpsi = Math.log(Math.tan(Math.PI / 4 + f2 / 2) / Math.tan(Math.PI / 4 + f1 / 2));
  return (Math.atan2(dl, dpsi) / rad + 360) % 360;
}

export const suunta8 = (asteet: number): Suunta => SUUNNAT[Math.round(asteet / 45) % 8];

/** Palaute arvauksesta oikeaan kohteeseen: km pyöristettynä kymmeniin, suunta arvauksesta oikeaa kohti. */
export function etaisyysPalaute(arvaus: Sijainti, oikea: Sijainti, naapuri = false): Palaute {
  const asteet = suuntaAsteet(arvaus, oikea);
  return { tyyppi: "etaisyys", km: Math.round(haversineKm(arvaus, oikea) / 10) * 10, suunta: suunta8(asteet), asteet: Math.round(asteet), naapuri };
}
