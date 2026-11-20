// JUNANKULJETTAJA — vuoron arvonta ja kartta palvelimella (20.11.2026).
// Reittiaineisto (reitit.json) generoidaan tietomallista: scripts/junankuljettaja-data.mjs. Selaimelle lähtee vain
// yksi vuoro ja sen alueen kuntakartta (sama kartta ja moottori kuin Kuntaliitoksessa).
//
// Vuoro = reitti + kuusi väliasemaa sen ketjusta. Siemen kertoo vuoron suoraan ("seinajoki-oulu-1k3"): reitin tunnus
// ja valittujen väliasemien bittimaski (base36). Näin päivän vuoron haastelinkki toimii myös päivän vaihduttua.
// Muu siemen (Arvo uusi vuoro, 6 merkkiä) arpoo vuoron valitulta tasolta.
//
// Päivän vuoro: tasokohtainen, sama kaikille. Kahtena peräkkäisenä päivänä samalla tasolla ei ole yhteisiä
// väliasemia (reitit jakavat osuuksia: Helsingin radat Pasilan ja Tikkurilan kautta, Haapamäki–Jyväskylä,
// Seinäjoki–Oulu). Siksi päivät lasketaan järjestyksessä alkupäivästä.

import data from "./reitit.json";
import { satunnainen } from "@/lib/tuplaTaiKuitti";
import { KL_KUNTIA, pariAvain, type KlKunta, type KlReitti } from "@/lib/kuntaliitos";
import { karttaPisteista } from "@/lib/kuntaliitos/reitti";
import { JK_TASOT, type JkTaso } from "@/lib/junankuljettaja";

type Asema = { k: string; n: string; ku: string; kn: string; p: [number, number] };
type Reitti = { t: string; otsikko: string; taso: JkTaso; juna: string; asemat: Asema[] };
const REITIT = data.reitit as unknown as Reitti[];
const PER = new Map(REITIT.map((r) => [r.t, r]));
export const JK_LAHDE = data.lahde;

const VALIASEMIA = KL_KUNTIA - 2;
/** Päivän vuorojen laskennan alku (ensimmäinen päivä, jolta vuorot lasketaan; myöhemmät päivät riippuvat siitä). */
const ALKUPAIVA = "2026-11-16";

export type JkValinta = { reitti: Reitti; valitut: number[] };

/** Kuusi väliasemaa tasaisesti ketjun varrelta: ketju jaetaan kuuteen osaan ja jokaisesta otetaan yksi. */
function poimi(reitti: Reitti, r: () => number): number[] {
  const n = reitti.asemat.length - 2;
  const out: number[] = [];
  for (let i = 0; i < VALIASEMIA; i++) {
    const a = Math.floor((i * n) / VALIASEMIA), b = Math.floor(((i + 1) * n) / VALIASEMIA);
    out.push(1 + a + Math.floor(r() * (b - a)));
  }
  return out;
}

function arvoValinta(r: () => number, taso: JkTaso): JkValinta {
  const reitit = REITIT.filter((x) => x.taso === taso);
  const reitti = reitit[Math.floor(r() * reitit.length)];
  return { reitti, valitut: poimi(reitti, r) };
}

export const valinnanSiemen = (v: JkValinta) => `${v.reitti.t}-${v.valitut.reduce((m, i) => m + 2 ** (i - 1), 0).toString(36)}`;

/** "seinajoki-oulu-1k3" → reitti ja väliasemat, tai null. */
function siemenesta(siemen: string): JkValinta | null {
  const m = siemen.match(/^([a-z-]+)-([0-9a-z]+)$/);
  const reitti = m ? PER.get(m[1]) : null;
  if (!m || !reitti) return null;
  const maski = parseInt(m[2], 36), n = reitti.asemat.length - 2;
  const valitut = Array.from({ length: n }, (_, i) => i + 1).filter((i) => Math.floor(maski / 2 ** (i - 1)) % 2 === 1);
  return valitut.length === VALIASEMIA && maski < 2 ** n ? { reitti, valitut } : null;
}

const paivaLisaa = (iso: string, n: number) => new Date(Date.parse(`${iso}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const valiKoodit = (v: JkValinta) => new Set(v.valitut.map((i) => v.reitti.asemat[i].k));

const PAIVAT = new Map<JkTaso, JkValinta[]>();
/** Päivän vuoro tasolle. Peräkkäisinä päivinä ei yhteisiä väliasemia eikä samaa reittiä (jos tasolla on muita). */
export function paivanValinta(iso: string, taso: JkTaso): JkValinta {
  const lista = PAIVAT.get(taso) ?? [];
  PAIVAT.set(taso, lista);
  const paivia = Math.max(0, Math.round((Date.parse(iso) - Date.parse(ALKUPAIVA)) / 864e5));
  while (lista.length <= paivia) {
    const pv = paivaLisaa(ALKUPAIVA, lista.length);
    const ed = lista.at(-1);
    const edKoodit = ed ? valiKoodit(ed) : new Set<string>();
    let paras: JkValinta | null = null;
    for (let k = 0; k < 40 && !paras; k++) {
      const v = arvoValinta(satunnainen(`junankuljettaja:paiva:${taso}:${pv}:${k}`), taso);
      if (ed && v.reitti.t === ed.reitti.t) continue;
      if ([...valiKoodit(v)].some((x) => edKoodit.has(x))) continue;
      paras = v;
    }
    lista.push(paras ?? arvoValinta(satunnainen(`junankuljettaja:paiva:${taso}:${pv}`), taso));
  }
  return lista[paivia];
}

/** Vuoro siemenestä: suora vuoro ("seinajoki-oulu-1k3") tai arvonta valitulta tasolta. */
export function valintaSiemenesta(siemen: string, taso: JkTaso): JkValinta {
  return siemenesta(siemen) ?? arvoValinta(satunnainen(`junankuljettaja:arvo:${taso}:${siemen}`), taso);
}

/** Pelin reitti ja kartta vuorosta. maakunta-kenttä kantaa tason (tallennus ja osoitteet). */
export function rakennaVuoro(v: JkValinta, siemen: string): KlReitti {
  const asemat = [0, ...v.valitut, v.reitti.asemat.length - 1].map((i) => v.reitti.asemat[i]);
  const { kartta, pisteet } = karttaPisteista(asemat.map((a) => a.p));
  const ratkaisu: KlKunta[] = asemat.map((a, i) => ({ k: a.k, n: a.n, m: "", v: null, a: a.ku, ...pisteet[i] }));
  const ids = asemat.map((a) => a.k);
  // Lähtöjärjestys: väliasemat sekaisin niin, että oikeita välejä on korkeintaan kaksi (kuten Kuntaliitoksessa).
  const r = satunnainen(`junankuljettaja:alku:${siemen}`);
  const rajat = ids.slice(1).map((k, i) => pariAvain(ids[i], k));
  const oikeat = new Set(rajat);
  let alku = ids;
  for (let i = 0; i < 50; i++) {
    const keski = ids.slice(1, -1);
    for (let j = keski.length - 1; j > 0; j--) {
      const x = Math.floor(r() * (j + 1));
      [keski[j], keski[x]] = [keski[x], keski[j]];
    }
    alku = [ids[0], ...keski, ids.at(-1)!];
    if (alku.slice(1).filter((k, j) => oikeat.has(pariAvain(alku[j], k))).length <= 2) break;
  }
  return { siemen, maakunta: v.reitti.taso, ratkaisu, alku, rajat, kartta };
}

export type JkVuoro = { reitti: KlReitti; siemen: string; otsikko: string; taso: JkTaso; lahto: string; maaranpaa: string };

export function vuoro(v: JkValinta): JkVuoro {
  const siemen = valinnanSiemen(v);
  const a = v.reitti.asemat;
  return { reitti: rakennaVuoro(v, siemen), siemen, otsikko: v.reitti.otsikko, taso: v.reitti.taso, lahto: a[0].n, maaranpaa: a[a.length - 1].n };
}

/** Kevyt kuvaus ilman karttaa (jakokuva, rivit): otsikko ja päätepisteet. */
export function vuoronNimet(v: JkValinta) {
  const a = v.reitti.asemat;
  return { siemen: valinnanSiemen(v), otsikko: v.reitti.otsikko, taso: v.reitti.taso, lahto: a[0].n, maaranpaa: a[a.length - 1].n };
}

export const JK_REITTEJA = REITIT.length;
export const tasonReitit = (taso: JkTaso) => REITIT.filter((r) => r.taso === taso).length;
export const kaikkiTasot = JK_TASOT.map((t) => t.taso);
