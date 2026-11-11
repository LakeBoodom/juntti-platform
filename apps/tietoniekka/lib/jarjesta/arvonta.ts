// LAITA JÄRJESTYKSEEN — poiminta ja päivän rivin arvonta (puhdas moduuli ilman kantaa).
// Erotettu kierros.ts:stä (Server Action -tiedosto saa eksportoida vain async-funktioita), jotta
// päivän rivin arvontaa voi testata sekoitetulla poolilla (scripts/tietomalli-tarkistus.ts, vaihe B2).

import { oikeaJarjestys, type JarjestysKohde, type Pakka } from "./pakat";
import { RIVIN_PITUUS, siemen, vaaraJarjestys } from "./siemen";
import { mittariSopiiKaikille } from "../vertailu";
import { vakaasti } from "../vakaaJarjestys";

export type Ehdokas = JarjestysKohde & { tunnettu: boolean; mittari: string | null };

const relVali = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1);

function riittavaVali(vali: Pakka["vali"], a: number, b: number): boolean {
  const ero = vali.tapa === "suhteellinen" ? relVali(a, b) : Math.abs(a - b);
  return ero >= vali.min;
}

export function sekoita<T>(arr: T[], rng: () => number = Math.random): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Ahne poiminta satunnaisjärjestyksestä; muutama yritys, paras talteen. Tunnettuja-vaatimus:
 *  ehdokasjonon alkuun `maara` satunnaista tunnettua, jolloin ne pääsevät kierrokseen ensin. */
export function poimi(p: Pakka, pool: Ehdokas[], vali: Pakka["vali"], rng: () => number = Math.random, pick = p.pick): Ehdokas[] {
  const tarve = p.pool?.tunnettuja?.maara ?? 0;
  const tunnettuja = (k: Ehdokas[]) => k.filter((x) => x.tunnettu).length;
  let paras: Ehdokas[] = [];
  for (let yritys = 0; yritys < 24; yritys++) {
    const sekaisin = sekoita(pool, rng);
    const jono = tarve ? [...sekaisin.filter((k) => k.tunnettu).slice(0, tarve), ...sekaisin] : sekaisin;
    const valitut: Ehdokas[] = [];
    for (const k of jono) {
      if (valitut.length >= pick) break;
      if (valitut.some((v) => v.id === k.id)) continue;
      if (!valitut.every((v) => riittavaVali(vali, v.value, k.value))) continue;
      // Mittarisääntö (lib/vertailu.ts): eri asiaa mittaavat luvut eivät samaan kierrokseen.
      if (mittariSopiiKaikille(k.mittari, valitut.map((v) => v.mittari))) valitut.push(k);
    }
    const parempi =
      valitut.length > paras.length ||
      (valitut.length === paras.length && tunnettuja(valitut) > tunnettuja(paras));
    if (parempi) paras = valitut;
    if (paras.length >= pick && tunnettuja(paras) >= Math.min(tarve, pick)) break;
  }
  return paras;
}

/** Päivän rivi poolista: RIVIN_PITUUS kohdetta väärässä järjestyksessä, siemen = päivä + pakka.
 *  Pooli järjestetään ensin tunnisteen mukaan (lib/vakaaJarjestys.ts), joten kannan palauttama
 *  rivijärjestys ei vaikuta tulokseen. Ennen rajapäivää kannan järjestys kuten ennen. */
export function arvoPaivanRivi(p: Pakka, kaikki: Ehdokas[], slug: string, paiva: string, vainNimet?: readonly string[]): Ehdokas[] {
  const rajattu = vainNimet ? kaikki.filter((k) => vainNimet.includes(k.name)) : kaikki;
  const pool = vakaasti(rajattu, (k) => `${k.id}|${k.value}`, paiva);
  const rng = siemen(`${paiva}:${slug}`);
  /* Päivän rivissä mieluiten tunnettuja: pakan tunnettuja-ehto (esim. eduskuntavuodet) koskee koko riviä. */
  const tunnetut = p.pool?.tunnettuja ? pool.filter((k) => k.tunnettu) : pool;
  const lahde = tunnetut.length >= RIVIN_PITUUS * 2 ? tunnetut : pool;
  let valitut = poimi(p, lahde, p.vali, rng, RIVIN_PITUUS);
  if (valitut.length < RIVIN_PITUUS) valitut = poimi(p, lahde, { tapa: "absoluuttinen", min: 0 }, rng, RIVIN_PITUUS);
  if (valitut.length < 3) return [];
  return vaaraJarjestys(oikeaJarjestys(valitut as JarjestysKohde[], p.direction) as Ehdokas[], rng);
}
