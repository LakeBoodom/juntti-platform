// VIHJEPELI: MAA ("Mikä maa?") — YK:n 193 jäsenmaata, aineisto scripts/mikamaa-data.mjs → ../maat.json.
// Vihje 4 = siluetti + maanosa, vihje 5 = pääkaupunki tai lippu (pkl: pääkaupunki paljastaisi nimen).
// Arvotaan vain A- ja B-maat (Heikki 7.11.2026: 99 maata, Venäjä ei arvonnassa); C-maat ovat täydennyslistassa.
// Siluetit (≈ 200 kt) jäävät palvelimelle: selaimeen menee kevyt lista ja kierroksen oma kohde.

import aineisto from "../maat.json";
import { etaisyysPalaute } from "../palaute/etaisyys";
import type { Kohde, Vaikeus, VihjepeliAihe } from "../tyypit";

type MaaRivi = {
  k: string; n: string; syn?: string[]; m: string; pk: string; pkl?: true;
  lat: number; lon: number; nr?: string[]; d: string; b: number[]; v: string; taso: string;
};

/** Selaimeen menevä osa: täydennys ja palaute (etäisyys, suunta, naapuri). */
export type MaaKohde = Kohde & { lat: number; lon: number; nr?: string[] };
/** Kierroksen oikea maa: myös vihjeiden 4–5 aineisto ja tulosnäkymä. */
export type MaaTaysi = MaaKohde & { maanosa: string; paakaupunki: string; lippuVihjeena: boolean; siluetti: string; laatikko: [number, number, number, number]; lippu: string };

const rivit = (aineisto as { maat: MaaRivi[] }).maat;
const laatikko = (b: number[]) => b as [number, number, number, number];

export const MAAT: MaaKohde[] = rivit.map((r) => ({ id: r.k, nimi: r.n, ...(r.syn ? { syn: r.syn } : {}), taso: r.taso as Vaikeus, lat: r.lat, lon: r.lon, ...(r.nr ? { nr: r.nr } : {}) }));

export function maaTaysi(id: string): MaaTaysi | null {
  const r = rivit.find((x) => x.k === id);
  return r
    ? { ...MAAT.find((m) => m.id === id)!, maanosa: r.m, paakaupunki: r.pk, lippuVihjeena: !!r.pkl, siluetti: r.d, laatikko: laatikko(r.b), lippu: r.v }
    : null;
}

/** Julkaisupäivä: päivän maan historia alkaa tästä (etusivun Mikä maa? -paikka, lib/pelimuodot.ts). */
export const MAA_JULKAISU = "2026-11-30";

export const MAA_AIHE: VihjepeliAihe<MaaKohde> = {
  avain: "maa",
  kohteet: MAAT,
  julkaisu: MAA_JULKAISU,
  toistovali: 60,
  arvottava: (k) => k.taso !== "C",
  palaute: (arvaus, oikea) => etaisyysPalaute(arvaus, oikea, !!arvaus.nr?.includes(oikea.id)),
};
