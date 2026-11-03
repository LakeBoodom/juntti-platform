// JÄRJESTÄ — päivän rivin toistettava arvonta (CD kierros 5a, 31.10.2026).
// Kaikilla on samana päivänä sama rivi ja sama väärä järjestys, joten tuloksia voi verrata.
// Tavallinen moduuli: ei satunnaisuutta Math.randomista, vaan siemen päivästä ja pakasta.

/** Hubin pelattavan rivin pituus. */
export const RIVIN_PITUUS = 5;

/** Päivä Suomen ajassa (YYYY-MM-DD), vaihtuu keskiyöllä. */
export const paivaAvain = (nyt = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(nyt);

/** mulberry32-generaattori merkkijonosiemenestä (FNV-1a-tiiviste). */
export function siemen(teksti: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < teksti.length; i++) h = Math.imul(h ^ teksti.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sekoitaSiemenella<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Väärä järjestys: enintään yksi kohde oikealla paikallaan, ei koskaan oikea eikä käänteinen rivi
 *  (CD: "Mikään rivi ei saa olla vahingossa oikeassa järjestyksessä"). `oikea` = oikea järjestys. */
export function vaaraJarjestys<T extends { id: string }>(oikea: T[], rng: () => number): T[] {
  const n = oikea.length;
  let paras = oikea.slice().reverse();
  let parasOsumat = n;
  for (let yritys = 0; yritys < 60; yritys++) {
    const ehdokas = sekoitaSiemenella(oikea, rng);
    const osumat = ehdokas.filter((k, i) => k.id === oikea[i].id).length;
    const kaanteinen = ehdokas.every((k, i) => k.id === oikea[n - 1 - i].id);
    if (kaanteinen) continue;
    if (osumat < parasOsumat) {
      paras = ehdokas;
      parasOsumat = osumat;
    }
    if (parasOsumat <= 1) break;
  }
  return paras;
}
