// HAASTETUN POLKU (Jakotekstit ja esikatselut v4 §5, vaihe 3, 7.11.2026): tulosjaon linkki avaa näkymän, jossa kaverin
// tulos on ylimpänä ("Kaverisi sai 3/5.") ja sen alla yksi rivi siitä, mitä tehdään. Oman kierroksen jälkeen tulokset
// rinnakkain ja vastahaaste (lib/korttinimi.ts vastahaasteteksti). Linkki kantaa saman tehtävän (rivi, reitti, sarja)
// ja kaverin tuloksen; tämä moduuli on pelimuodoista riippumaton osa.

import { lukusana } from "@/lib/esikatselu";
import { jarjestysluvulla } from "@/lib/korttinimi";

export type Tuomio = "voitto" | "havio" | "tasan";

/** Suurempi arvo voittaa (pelikohtainen vertailuarvo, ks. reittiArvo). */
export const tuomio = (oma: number, kaveri: number): Tuomio => (oma > kaveri ? "voitto" : oma < kaveri ? "havio" : "tasan");

export const TUOMIOT: Record<Tuomio, string> = { voitto: "Voitit kaverisi", havio: "Kaverisi voitti", tasan: "Tasapeli" };

/** Aloitusnäkymän rivi: "{tehtävä} ja katso, pärjäätkö paremmin." Täydellä tuloksella "saatko saman". */
export const haasterivi = (tehtava: string, taydet: boolean, paremmin = "pärjäätkö paremmin") =>
  `${tehtava} ja katso, ${taydet ? "saatko saman" : paremmin}.`;

/** Kaverin tulos näkymille: aloituksen otsikkorivi, vertailun luku ja vertailuarvo. */
export type KaverinTulos = {
  /** "Kaverisi sai 3/5." */
  otsikko: string;
  /** Aloituksen toinen rivi (haasterivi). */
  rivi: string;
  /** Vertailun luku: "3/5", "4 peräkkäin", "2. yrityksellä". */
  luku: string;
  /** Vastahaasteen lyhyt muoto: "3/5", "4 peräkkäin", "toisella yrityksellä". */
  lyhyt: string;
  /** Vertailuarvo: suurempi on parempi. */
  arvo: number;
};

/** Oma tulos vertailuun ja vastahaasteeseen. */
export type OmaTulos = { luku: string; lyhyt: string; arvo: number };

/** Järjestä-pelien kaverin tulos: "Kaverisi sai 3/8." ja "Laita samat kahdeksan järjestykseen ja katso, …". */
export function jarjestaKaveri(t: { n: number; kaikki: number }, tehtava = `Laita samat ${lukusana(t.kaikki)} järjestykseen`): KaverinTulos {
  const luku = `${t.n}/${t.kaikki}`;
  return { otsikko: `Kaverisi sai ${luku}.`, rivi: haasterivi(tehtava, t.n === t.kaikki), luku, lyhyt: luku, arvo: t.n };
}

/* Reittipelit (Rajanaapurit, Yhdysvallat, Kuntaliitos): löydetty reitti voittaa aina, ja vähemmillä yrityksillä
   löytänyt voittaa; muuten enemmän oikeita rajoja voittaa. Linkki kantaa ?tulos=n-7 ja löydetyllä reitillä &y=yritys. */
const reittiArvo = (oikein: number, yritys: number | null) => (yritys ? 100 - yritys : oikein);

/** Oma reittitulos vertailuun ja vastahaasteeseen. */
export function reittiOma(oikein: number, kaikki: number, yritys: number | null): OmaTulos {
  return yritys
    ? { luku: `${yritys}. yritys`, lyhyt: `${jarjestysluvulla(yritys)} yrityksellä`, arvo: reittiArvo(oikein, yritys) }
    : { luku: `${oikein}/${kaikki}`, lyhyt: `${oikein}/${kaikki}`, arvo: reittiArvo(oikein, null) };
}

/** Kaverin reittitulos osoitteesta; vanha linkki ilman yritystä (?tulos=7-7) ei kerro tarpeeksi → null. */
export function reittiKaveri(tulos: string | string[] | undefined, y: string | string[] | undefined): KaverinTulos | null {
  const m = typeof tulos === "string" ? tulos.match(/^(\d{1,2})-(\d{1,2})$/) : null;
  if (!m) return null;
  const n = Number(m[1]), kaikki = Number(m[2]);
  const yritys = typeof y === "string" && /^[1-9]$/.test(y) ? Number(y) : null;
  if (kaikki < 1 || n > kaikki || (n === kaikki) !== !!yritys) return null;
  const oma = reittiOma(n, kaikki, yritys);
  return {
    otsikko: yritys ? `Kaverisi löysi reitin ${oma.lyhyt}.` : `Kaverisi sai ${n}/${kaikki} rajaa oikein.`,
    rivi: haasterivi("Etsi sama reitti", yritys === 1),
    ...oma,
  };
}
