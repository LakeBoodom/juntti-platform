// Sivuston haku (Heikki 16.11.2026): hakumoottori, sama selaimessa (HakuDialogi) ja palvelimella (/haku).
// Ei riippuvuuksia: indeksi on ~1 300 riviä, joten yksinkertainen sanapisteytys riittää ja on nopea.
// Säännöt:
//   - kirjainkoko ja ääkköset eivät haittaa ("aanivisa" löytää Äänivisan), välimerkit ohitetaan
//   - "talvisotavisa", "kummeli visa", "joulu tietovisa": visa-häntä pois hakusanasta
//   - jokaisen hakusanan pitää osua (nimeen tai lisäsanoihin); sanan alku riittää ("kumm" → Kummeli)
//   - taivutettu hakusana osuu perusmuotoon ("kummelista" → Kummeli), kun perusmuoto on vähintään 4 merkkiä

export type HakuTyyppi = "v" | "h" | "k" | "c" | "p";

/** Indeksin rivi. t = tyyppi (visa, henkilö, kaupunki, kokoelma, peli), n = näkyvä nimi, h = osoite,
 *  a = lisähakusanat (eivät näy), s = suosio (järjestyksen tasapeli), c = kokoelman nimi rivin perässä (erottaa
 *  samannimiset visat, esim. Talvisota-elokuva ja Talvisota-historia). */
export type HakuKohde = { t: HakuTyyppi; n: string; h: string; a?: string; s?: number; c?: string };

export const HAKU_RYHMAT: { t: HakuTyyppi; otsikko: string; max: number }[] = [
  { t: "v", otsikko: "Visat", max: 8 },
  { t: "p", otsikko: "Pelit", max: 4 },
  { t: "h", otsikko: "Henkilöt", max: 5 },
  { t: "k", otsikko: "Kaupungit", max: 3 },
  { t: "c", otsikko: "Kokoelmat", max: 3 },
];

export const normalisoi = (s: string) =>
  s
    .toLocaleLowerCase("fi")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const sanat = (s: string) => normalisoi(s).split(" ").filter(Boolean);

/** Hakusanat: visa-hännät pois ("talvisotavisa" → "talvisota"), pelkät "visa"/"tietovisa"/"peli" pois. */
export function hakusanat(q: string): string[] {
  return sanat(q)
    .map((w) => {
      const ilman = w.replace(/(tieto)?visa(t|a|n)?$/, "");
      return ilman.length >= 4 ? ilman : w;
    })
    .filter((w) => w.length > 0 && !["visa", "visat", "tietovisa", "tietovisat", "peli", "pelit"].includes(w));
}

type Valmis = HakuKohde & { nt: string[]; at: string[]; nn: string };

export function valmistele(kohteet: HakuKohde[]): Valmis[] {
  return kohteet.map((k) => ({ ...k, nt: sanat(k.n), at: k.a ? sanat(k.a) : [], nn: normalisoi(k.n) }));
}

/** Yhden hakusanan paras osuma sanalistaan: tarkka 10, alku 7, taivutettu 6, sanan sisällä 4 (yhdyssanat). */
function osuma(w: string, tokens: string[]): number {
  let paras = 0;
  for (const t of tokens) {
    if (t === w) return 10;
    if (t.startsWith(w)) paras = Math.max(paras, 7);
    else if (t.length >= 4 && w.startsWith(t) && w.length - t.length <= 5) paras = Math.max(paras, 6);
    else if (w.length >= 4 && t.includes(w)) paras = Math.max(paras, 4);
  }
  return paras;
}

export function hae(indeksi: Valmis[], q: string): Map<HakuTyyppi, HakuKohde[]> {
  const ws = hakusanat(q);
  const tulos = new Map<HakuTyyppi, HakuKohde[]>();
  if (!ws.length || ws.join("").length < 2) return tulos;
  const pisteet: { k: Valmis; p: number }[] = [];
  for (const k of indeksi) {
    let p = 0;
    let ok = true;
    for (const w of ws) {
      const n = osuma(w, k.nt);
      const a = n ? 0 : osuma(w, k.at) / 2;
      if (!n && !a) { ok = false; break; }
      p += n || a;
    }
    if (!ok) continue;
    if (k.nn.startsWith(ws[0])) p += 5;
    if (k.nn === ws.join(" ")) p += 10;
    p += Math.min(3, Math.log10(1 + (k.s ?? 0)));
    pisteet.push({ k, p });
  }
  pisteet.sort((x, y) => y.p - x.p || x.k.n.localeCompare(y.k.n, "fi"));
  for (const { k } of pisteet) {
    const r = HAKU_RYHMAT.find((g) => g.t === k.t)!;
    const lista = tulos.get(k.t) ?? [];
    if (lista.length < r.max) lista.push({ t: k.t, n: k.n, h: k.h, c: k.c });
    tulos.set(k.t, lista);
  }
  return tulos;
}

/** Ryhmät näyttöjärjestyksessä: ryhmä, jonka paras osuma on vahvin, ensin; tasapelissä HAKU_RYHMAT-järjestys. */
export function ryhmitellyt(tulos: Map<HakuTyyppi, HakuKohde[]>) {
  const jarj = [...tulos.keys()];
  return HAKU_RYHMAT.filter((g) => tulos.get(g.t)?.length)
    .map((g) => ({ ...g, rivit: tulos.get(g.t)!, eka: jarj.indexOf(g.t) }))
    .sort((a, b) => a.eka - b.eka);
}
