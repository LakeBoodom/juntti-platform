// VIHJEPELI — päivän kohde, harjoituskohde, haku ja pisteet. Ei aihekohtaista koodia: aihe tulee parametrina.
//
// Päivän kohde (siemen = Helsingin päivä): historia arvotaan julkaisupäivästä alkaen samalla siemenellä, ja
// jokainen päivä valitsee kohteista, jotka eivät ole olleet päivän kohteena toistovälin sisällä. Sama päivä
// antaa siis aina saman kohteen kaikille, ja vaihto tapahtuu keskiyöllä Suomen aikaa (malli Vaalipiiriketju).

import { siemen, sekoitaSiemenella } from "../jarjesta/siemen";
import { ARVAUKSIA, type Kohde, type VihjepeliAihe } from "./tyypit";

const PAIVA_MS = 86_400_000;
const lisaaPaivia = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * PAIVA_MS).toISOString().slice(0, 10);

const historiaValimuisti = new WeakMap<object, { iso: string; ids: string[] }>();

/** Päivän kohteet julkaisusta päivään iso asti (viimeinen = päivän kohde). Ennen julkaisua: vain päivä iso. */
function historia<K extends Kohde>(aihe: VihjepeliAihe<K>, iso: string): string[] {
  const julkaistu = iso >= aihe.julkaisu;
  // Välimuisti vain julkaisun jälkeisille päiville: ennen julkaisua (esikatselu) historia alkaa päivästä iso.
  const muisti = julkaistu ? historiaValimuisti.get(aihe) : undefined;
  if (muisti && muisti.iso >= iso) return muisti.ids.slice(0, Math.round((Date.parse(iso) - Date.parse(aihe.julkaisu)) / PAIVA_MS) + 1);
  const ids = muisti ? muisti.ids.slice() : [];
  let paiva = muisti ? lisaaPaivia(muisti.iso, 1) : julkaistu ? aihe.julkaisu : iso;
  const viimeksi = new Map<string, number>();
  ids.forEach((id, i) => viimeksi.set(id, i));
  for (let i = ids.length; paiva <= iso && i < 20_000; i++, paiva = lisaaPaivia(paiva, 1)) {
    const joukko = aihe.kohteet.filter((k) => aihe.arvottava(k, paiva));
    if (!joukko.length) throw new Error(`vihjepeli/${aihe.avain}: ei arvottavia kohteita ${paiva}`);
    const tuoreet = joukko.filter((k) => i - (viimeksi.get(k.id) ?? -Infinity) > aihe.toistovali);
    // Jos kaikki ovat olleet toistovälin sisällä (pieni joukko), pisimpään tauolla ollut.
    const ehdokkaat = tuoreet.length ? tuoreet : [joukko.reduce((a, b) => ((viimeksi.get(a.id) ?? -1) <= (viimeksi.get(b.id) ?? -1) ? a : b))];
    const valittu = ehdokkaat[Math.floor(siemen(`vihjepeli-${aihe.avain}-${paiva}`)() * ehdokkaat.length)];
    ids.push(valittu.id);
    viimeksi.set(valittu.id, i);
  }
  if (julkaistu) historiaValimuisti.set(aihe, { iso, ids });
  return ids;
}

/** Päivän kohde päivälle iso (YYYY-MM-DD, Helsingin aika). */
export function paivanKohde<K extends Kohde>(aihe: VihjepeliAihe<K>, iso: string): K {
  const ids = historia(aihe, iso);
  return aihe.kohteet.find((k) => k.id === ids[ids.length - 1])!;
}

/** Eilinen päivän kohde (Maantieto-banneri "Eilen: …"); ennen julkaisua null. */
export function eilinenKohde<K extends Kohde>(aihe: VihjepeliAihe<K>, iso: string): K | null {
  const eilen = lisaaPaivia(iso, -1);
  return eilen < aihe.julkaisu ? null : paivanKohde(aihe, eilen);
}

/** Harjoituskohde (?kohde=<siemen>): satunnainen arvottava kohde, ei koskaan päivän kohde.
 *  paivan: päivän kohde, kun aihe on rajattu (esim. vain maat, joilla on tarkistetut vihjeet) eikä sen historia kelpaa. */
export function harjoitusKohde<K extends Kohde>(aihe: VihjepeliAihe<K>, iso: string, s: string, paivan = paivanKohde(aihe, iso).id): K | null {
  const joukko = aihe.kohteet.filter((k) => aihe.arvottava(k, iso) && k.id !== paivan);
  return sekoitaSiemenella(joukko, siemen(`vihjepeli-${aihe.avain}-harjoitus-${s}`))[0] ?? null;
}

// ── Haku ──────────────────────────────────────────────
/** Vertailumuoto: pienet kirjaimet, ei tarkkeita (Tšekki = Tsekki, Itävalta = Itavalta), ei välimerkkejä. */
export const taita = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** Arvaus tekstistä: kohde, jonka nimi tai synonyymi on täsmälleen sama vertailumuodossa. */
export function tunnista<K extends Kohde>(kohteet: K[], teksti: string): K | null {
  const t = taita(teksti);
  if (!t) return null;
  return kohteet.find((k) => taita(k.nimi) === t || k.syn?.some((s) => taita(s) === t)) ?? null;
}

/** Täydennyslista: nimen alku ensin, sitten synonyymin alku, sitten sanan alku nimen keskellä. */
export function ehdotukset<K extends Kohde>(kohteet: K[], teksti: string, max = 6): K[] {
  const t = taita(teksti);
  if (!t) return [];
  const sija = (k: K) => {
    const n = taita(k.nimi);
    if (n.startsWith(t)) return 0;
    if (k.syn?.some((s) => taita(s).startsWith(t))) return 1;
    if (n.split(" ").some((w) => w.startsWith(t)) || k.syn?.some((s) => taita(s).split(" ").some((w) => w.startsWith(t)))) return 2;
    return 3;
  };
  return kohteet
    .map((k) => ({ k, s: sija(k) }))
    .filter((x) => x.s < 3)
    .sort((a, b) => a.s - b.s || a.k.nimi.localeCompare(b.k.nimi, "fi"))
    .slice(0, max)
    .map((x) => x.k);
}

/** Pisteet: 1. arvaus 6 p … 6. arvaus 1 p; arvausnumero null = ei ratkennut, 0 p. */
export const pisteet = (arvausnumero: number | null) => (arvausnumero ? ARVAUKSIA + 1 - arvausnumero : 0);
