// REITTIPELIEN MOOTTORI — Kuntaliitos (kunnat) ja Rajanaapurit (valtiot), 27.9.2026.
// Yhteinen reitin arvonta ja kartan rajaus palvelimella. Pelikohtainen aineisto on
// generoitu JSON (scripts/kuntaliitos-data.mjs, scripts/rajanaapurit-data.mjs), jossa jokaisella
// alueella on projisoitu karttapolku (d), nastan paikka (p) ja rajauslaatikko (b).
// Selaimelle lähtee vain yksi reitti ja sen alueen kartta.

import { satunnainen } from "@/lib/tuplaTaiKuitti";
import { KL_KUNTIA, pariAvain, type KlKunta, type KlReitti } from "@/lib/kuntaliitos";

type Laatikko = [number, number, number, number];
/** Pelin alue (kunta tai valtio). m = näkyvä ryhmä kortissa, r = valikon ryhmä (oletus m), s = karttasävy. */
export type RpAlue = { k: string; n: string; m: string; r?: string; v: string | null; p: [number, number]; b: Laatikko; d: string; s?: number };
/** Kartan taustalle piirrettävä muu alue (esim. saarivaltio tai valtion kaukainen osa). */
export type RpTausta = { k: string; b: Laatikko; d: string; s: number };
export type RpData = { lahde: string; alueet: RpAlue[]; rajat: Array<[string, string, number, string]>; tausta?: RpTausta[] };

export type RpAsetukset = {
  /** Satunnaislukujen etuliite — muuttaminen vaihtaa kaikki reitit (myös päivän reitit). */
  nimi: string;
  /** Arvonnassa vain maarajat, joiden pituus on vähintään tämä (m). Tarkistus hyväksyy kaikki rajat. */
  arvontaMinM: number;
  /** Nastoille jätettävä reunatila ja kartan vähimmäiskoko aineiston yksiköissä. */
  minPad: number;
  minLeveys: number;
  minKorkeus: number;
  /** Aineiston napsautusruudukko (yksiköissä); iso alue karkeistetaan tätä karkeammaksi. */
  ruutu: number;
  /** Kartan tarkkuus: ruutuja kartan korkeudella (oletus 700). Pienempi = kevyempi sivu. */
  solut?: number;
  /** Valikon ryhmät järjestyksessä; oletus kaikki ryhmät aakkosjärjestyksessä. */
  ryhmat?: string[];
  /** Ryhmät, joista reittiä ei voi arpoa (esim. Ahvenanmaa). */
  eiValikkoon?: string[];
};

/** Kartan kuvasuhde (leveys / korkeus) — sama kuin .kl-kartta-alue CSS:ssä. */
export const RP_KARTTA_SUHDE = 4 / 5;

const tunnus = (m: string) => m.toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/å/g, "a").replace(/[^a-z]+/g, "-");

function sekoita<T>(a: T[], r: () => number): T[] {
  const o = a.slice();
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

/** Polku uudelleen karkeampaan ruudukkoon. Sama napsautus kaikille alueille → naapurien
    yhteiset reunat pysyvät identtisinä, eikä kartalle synny rakoja. */
function karkeista(d: string, g: number): string {
  const osat: string[] = [];
  for (const rengas of d.split("z")) {
    const m = rengas.match(/^M(-?\d+) (-?\d+)l?(.*)$/);
    if (!m) continue;
    let x = +m[1], y = +m[2];
    const pisteet: Array<[number, number]> = [[x, y]];
    const luvut = (m[3].match(/-?\d+/g) ?? []).map(Number);
    for (let i = 0; i + 1 < luvut.length; i += 2) pisteet.push([(x += luvut[i]), (y += luvut[i + 1])]);
    const p: Array<[number, number]> = [];
    for (const [px, py] of pisteet) {
      const q: [number, number] = [Math.round(px / g) * g, Math.round(py / g) * g];
      if (!p.length || p.at(-1)![0] !== q[0] || p.at(-1)![1] !== q[1]) p.push(q);
    }
    if (p.length > 1 && p[0][0] === p.at(-1)![0] && p[0][1] === p.at(-1)![1]) p.pop();
    if (p.length < 3) continue;
    osat.push(`M${p[0][0]} ${p[0][1]}l` + p.slice(1).map((q, i) => `${q[0] - p[i][0]} ${q[1] - p[i][1]}`).join(" ").replace(/ -/g, "-") + "z");
  }
  return osat.join("");
}

export function luoReittimoottori(data: RpData, a: RpAsetukset) {
  const ALUEET = data.alueet;
  const TAUSTA = data.tausta ?? [];
  const PER = new Map(ALUEET.map((k) => [k.k, k]));
  const ryhma = (k: RpAlue) => k.r ?? k.m;

  const naapurit = new Map<string, Set<string>>(); // kaikki rajat (tarkistus)
  const arvonta = new Map<string, string[]>(); // selvät maarajat (arvonta)
  for (const [x0, y0, l, t] of data.rajat) {
    for (const [x, y] of [[x0, y0], [y0, x0]]) {
      if (!naapurit.has(x)) naapurit.set(x, new Set());
      naapurit.get(x)!.add(y);
      if (t === "maa" && l >= a.arvontaMinM) arvonta.set(x, [...(arvonta.get(x) ?? []), y]);
    }
  }
  const rajaa = (x: string, y: string) => naapurit.get(x)?.has(y) ?? false;
  const ALOITUS = ALUEET.map((k) => k.k).filter((k) => (arvonta.get(k)?.length ?? 0) > 0);

  /** Sävy: aineiston oma (valtiot) tai ryhmittäin niin, ettei naapuriryhmillä ole samaa (maakunnat). */
  const SAVY = (() => {
    const vierus = new Map<string, Set<string>>();
    for (const [x, y] of data.rajat) {
      const mx = PER.get(x)!.m, my = PER.get(y)!.m;
      if (mx === my) continue;
      for (const [p, q] of [[mx, my], [my, mx]]) vierus.set(p, (vierus.get(p) ?? new Set()).add(q));
    }
    const ryhmat = [...new Set(ALUEET.map((k) => k.m))].sort((p, q) => (vierus.get(q)?.size ?? 0) - (vierus.get(p)?.size ?? 0));
    const s = new Map<string, number>();
    for (const m of ryhmat) {
      const varatut = new Set([...(vierus.get(m) ?? [])].map((x) => s.get(x)));
      s.set(m, [0, 1, 2, 3, 4].find((i) => !varatut.has(i)) ?? 0);
    }
    return s;
  })();
  const savy = (k: RpAlue) => k.s ?? SAVY.get(k.m) ?? 0;

  /** Montako järjestystä välialueille muodostaa katkeamattoman ketjun (päätepisteet kiinni). */
  function ratkaisuja(reitti: string[]): number {
    const alku = reitti[0], loppu = reitti.at(-1)!;
    let n = 0;
    const kay = (ed: string, jaljella: string[]) => {
      if (!jaljella.length) { if (rajaa(ed, loppu)) n++; return; }
      for (const x of jaljella) if (rajaa(ed, x)) kay(x, jaljella.filter((y) => y !== x));
    };
    kay(alku, reitti.slice(1, -1));
    return n;
  }

  const kaikkiRyhmat = [...new Set(ALUEET.map(ryhma))];
  const valikko = (a.ryhmat ?? kaikkiRyhmat.sort((p, q) => p.localeCompare(q, "fi")))
    .filter((m) => kaikkiRyhmat.includes(m) && !a.eiValikkoon?.includes(m))
    .map((nimi) => ({ nimi, tunnus: tunnus(nimi) }));

  /** Itseään välttävä kävely selviä maarajoja pitkin. Uusi alue ei saa rajautua aiempiin
      kuin edelliseen → reitistä muodostuu "käärme", jolla on tasan yksi oikea järjestys.
      Ryhmä valittuna: reitti alkaa ryhmästä ja suosii sen alueita, mutta saa ylittää rajan. */
  function kavele(r: () => number, valittu: string | null): string[] | null {
    const lahdot = valittu ? ALOITUS.filter((k) => ryhma(PER.get(k)!) === valittu) : ALOITUS;
    if (!lahdot.length) return null;
    const reitti = [lahdot[Math.floor(r() * lahdot.length)]];
    while (reitti.length < KL_KUNTIA) {
      const nyk = reitti.at(-1)!;
      const ehdokkaat = (arvonta.get(nyk) ?? []).filter((x) => !reitti.includes(x) && !reitti.slice(0, -1).some((y) => rajaa(x, y)));
      if (!ehdokkaat.length) return null;
      const paino = (x: string) => (valittu && ryhma(PER.get(x)!) === valittu ? 6 : 1);
      let arpa = r() * ehdokkaat.reduce((s, x) => s + paino(x), 0);
      reitti.push(ehdokkaat.find((x) => (arpa -= paino(x)) < 0) ?? ehdokkaat.at(-1)!);
    }
    return reitti;
  }

  function kartta(reitti: RpAlue[], valittu: string | null) {
    const xs = reitti.map((k) => k.p[0]), ys = reitti.map((k) => k.p[1]);
    let [x0, y0, x1, y1] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    // Reunoille tilaa nastoille (tunnus + nimilappu)
    const pad = Math.max(a.minPad, 0.2 * Math.max(x1 - x0, y1 - y0));
    [x0, y0, x1, y1] = [x0 - pad, y0 - pad * 0.9, x1 + pad, y1 + pad * 1.2];
    let w = Math.max(x1 - x0, a.minLeveys), h = Math.max(y1 - y0, a.minKorkeus);
    if (w / h > RP_KARTTA_SUHDE) h = w / RP_KARTTA_SUHDE;
    else w = h * RP_KARTTA_SUHDE;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const vb: Laatikko = [Math.round(cx - w / 2), Math.round(cy - h / 2), Math.round(w), Math.round(h)];
    // Iso alue karkeistetaan näytön tarkkuuteen: ~700 ruutua kartan korkeudella.
    const g = Math.max(a.ruutu, Math.round(vb[3] / (a.solut ?? 700)));
    const nakyy = (b: Laatikko) => b[2] >= vb[0] && b[0] <= vb[0] + vb[2] && b[3] >= vb[1] && b[1] <= vb[1] + vb[3];
    const polku = (d: string) => (g > a.ruutu ? karkeista(d, g) : d);
    const alueet: KlReitti["kartta"]["alueet"] = [
      ...TAUSTA.filter((t) => nakyy(t.b)).map((t) => ({ k: t.k, d: polku(t.d), s: t.s, t: true as const, ...(valittu ? { u: true } : {}) })),
      ...ALUEET.filter((k) => nakyy(k.b)).map((k) => ({ k: k.k, d: polku(k.d), s: savy(k), ...(valittu && ryhma(k) !== valittu ? { u: true } : {}) })),
    ];
    return { viewBox: vb, alueet };
  }

  function arvoReitti(siemen: string, valittu: string | null = null): KlReitti | null {
    const r = satunnainen(`${a.nimi}:${valittu ?? ""}:${siemen}`);
    // Ryhmän kanssa otetaan 40 kelvollisesta ehdokkaasta se, jossa on eniten ryhmän omia
    // alueita (tutuimmat); ilman ryhmää ensimmäinen kelvollinen.
    const tavoite = valittu ? 40 : 1;
    const omia = (x: string[]) => x.filter((k) => ryhma(PER.get(k)!) === valittu).length;
    let reitti: string[] | null = null;
    let loydetty = 0;
    for (let i = 0; i < 2000 && loydetty < tavoite; i++) {
      const ehdokas = kavele(r, valittu);
      if (!ehdokas || ratkaisuja(ehdokas) !== 1) continue;
      loydetty++;
      if (!reitti || omia(ehdokas) > omia(reitti)) reitti = ehdokas;
    }
    if (!reitti) return null;
    const alueet = reitti.map((k) => PER.get(k)!);

    // Lähtöjärjestys: välialueet sekaisin niin, että oikeita pareja on korkeintaan kaksi.
    const keski = reitti.slice(1, -1);
    let alku = reitti;
    for (let i = 0; i < 50; i++) {
      const ehdokas = [reitti[0], ...sekoita(keski, r), reitti.at(-1)!];
      const oikein = ehdokas.slice(1).filter((k, j) => rajaa(ehdokas[j], k)).length;
      alku = ehdokas;
      if (oikein <= 2) break;
    }

    const rajat: string[] = [];
    for (const x of reitti) for (const y of reitti) if (x < y && rajaa(x, y)) rajat.push(pariAvain(x, y));

    const { viewBox, alueet: karttaAlueet } = kartta(alueet, valittu);
    const [vx, vy, vw, vh] = viewBox;
    const ratkaisu: KlKunta[] = alueet.map((k) => ({
      k: k.k, n: k.n, m: k.m, v: k.v,
      x: Math.round(((k.p[0] - vx) / vw) * 1000) / 10,
      y: Math.round(((k.p[1] - vy) / vh) * 1000) / 10,
    }));
    return { siemen, maakunta: valittu, ratkaisu, alku, rajat, kartta: { viewBox: viewBox.join(" "), alueet: karttaAlueet } };
  }

  return {
    arvoReitti,
    valikko,
    ryhmaTunnuksella: (t: string | null | undefined) => valikko.find((m) => m.tunnus === t) ?? null,
    lahde: data.lahde,
  };
}
