// KUNTALIITOS — reitin arvonta ja kartta palvelimella (26.9.2026).
// Kunta-aineisto (kunnat.json, ~420 kt) luetaan vain täällä; selaimelle lähtee yksi reitti
// ja sen alueen kartta. Aineisto generoidaan: scripts/kuntaliitos-data.mjs.

import data from "./kunnat.json";
import { satunnainen } from "@/lib/tuplaTaiKuitti";
import { KL_KUNTIA, pariAvain, type KlKunta, type KlReitti } from "@/lib/kuntaliitos";

type Kunta = { k: string; n: string; m: string; v: string | null; p: [number, number]; b: [number, number, number, number]; d: string };
const KUNNAT = data.kunnat as unknown as Kunta[];
const RAJAT = data.rajat as unknown as Array<[string, string, number, "maa" | "meri"]>;
const PER = new Map(KUNNAT.map((k) => [k.k, k]));

/** Arvonnassa vain selvät maarajat: lyhyt kulmakosketus tai merialueen raja ei ole reiluna ratkaisuna. */
const ARVONTA_MIN_M = 2000;

const naapurit = new Map<string, Set<string>>(); // kaikki yhteiset rajat (tarkistus)
const arvonta = new Map<string, string[]>(); // selvät maarajat (arvonta)
for (const [a, b, l, t] of RAJAT) {
  for (const [x, y] of [[a, b], [b, a]]) {
    if (!naapurit.has(x)) naapurit.set(x, new Set());
    naapurit.get(x)!.add(y);
    if (t === "maa" && l >= ARVONTA_MIN_M) arvonta.set(x, [...(arvonta.get(x) ?? []), y]);
  }
}
const rajaa = (a: string, b: string) => naapurit.get(a)?.has(b) ?? false;
const ALOITUS = KUNNAT.map((k) => k.k).filter((k) => (arvonta.get(k)?.length ?? 0) > 0);

/** Maakunnille neljä karttasävyä niin, ettei kahdella naapurimaakunnalla ole samaa. */
const SAVY = (() => {
  const vierus = new Map<string, Set<string>>();
  for (const [a, b] of RAJAT) {
    const ma = PER.get(a)!.m, mb = PER.get(b)!.m;
    if (ma === mb) continue;
    for (const [x, y] of [[ma, mb], [mb, ma]]) vierus.set(x, (vierus.get(x) ?? new Set()).add(y));
  }
  const maakunnat = [...new Set(KUNNAT.map((k) => k.m))].sort((a, b) => (vierus.get(b)?.size ?? 0) - (vierus.get(a)?.size ?? 0));
  const s = new Map<string, number>();
  for (const m of maakunnat) {
    const varatut = new Set([...(vierus.get(m) ?? [])].map((x) => s.get(x)));
    s.set(m, [0, 1, 2, 3, 4].find((i) => !varatut.has(i)) ?? 0);
  }
  return s;
})();

function sekoita<T>(a: T[], r: () => number): T[] {
  const o = a.slice();
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

/** Montako järjestystä välikunnille muodostaa katkeamattoman ketjun (päätepisteet kiinni). */
function ratkaisuja(reitti: string[]): number {
  const alku = reitti[0], loppu = reitti.at(-1)!;
  const keski = reitti.slice(1, -1);
  let n = 0;
  const kay = (ed: string, jaljella: string[]) => {
    if (!jaljella.length) { if (rajaa(ed, loppu)) n++; return; }
    for (const x of jaljella) if (rajaa(ed, x)) kay(x, jaljella.filter((y) => y !== x));
  };
  kay(alku, keski);
  return n;
}

/** Maakunnat valikkoon: nimi ja osoitteen tunnus (?maakunta=uusimaa). */
const tunnus = (m: string) => m.toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/å/g, "a").replace(/[^a-z]+/g, "-");
// Ahvenanmaa ei ole valikossa: sieltä ei pääse maateitse mantereelle, eikä saarten sisällä
// ole kahdeksan kunnan maarajareittiä (testattu 26.9.2026: 0 / 200 arvontaa).
export const KL_MAAKUNNAT = [...new Set(KUNNAT.map((k) => k.m))]
  .filter((m) => m !== "Ahvenanmaa")
  .sort((a, b) => a.localeCompare(b, "fi"))
  .map((nimi) => ({ nimi, tunnus: tunnus(nimi) }));
export const maakuntaTunnuksella = (t: string | null | undefined) => KL_MAAKUNNAT.find((m) => m.tunnus === t) ?? null;

/** Itseään välttävä kävely selviä maarajoja pitkin. Uusi kunta ei saa rajautua aiempiin
    kuin edelliseen → reitin kunnista muodostuu "käärme", jolla on tasan yksi oikea järjestys.
    Maakunta valittuna (Heikki 26.9.2026): reitti alkaa siitä maakunnasta ja suosii sen kuntia,
    mutta saa jatkua rajan yli (pienissä maakunnissa, kuten Kymenlaaksossa, on vain muutama kunta). */
function kavele(r: () => number, maakunta: string | null): string[] | null {
  const lahdot = maakunta ? ALOITUS.filter((k) => PER.get(k)!.m === maakunta) : ALOITUS;
  if (!lahdot.length) return null;
  const reitti = [lahdot[Math.floor(r() * lahdot.length)]];
  while (reitti.length < KL_KUNTIA) {
    const nyk = reitti.at(-1)!;
    const ehdokkaat = (arvonta.get(nyk) ?? []).filter(
      (x) => !reitti.includes(x) && !reitti.slice(0, -1).some((y) => rajaa(x, y)),
    );
    if (!ehdokkaat.length) return null;
    const paino = (x: string) => (maakunta && PER.get(x)!.m === maakunta ? 6 : 1);
    let arpa = r() * ehdokkaat.reduce((s, x) => s + paino(x), 0);
    const valinta = ehdokkaat.find((x) => (arpa -= paino(x)) < 0) ?? ehdokkaat.at(-1)!;
    reitti.push(valinta);
  }
  return reitti;
}

/** Kartan kuvasuhde (leveys / korkeus) — sama kuin .kl-kartta-alue CSS:ssä. */
export const KL_KARTTA_SUHDE = 4 / 5;

function kartta(reitti: Kunta[], maakunta: string | null): { viewBox: [number, number, number, number]; alueet: KlReitti["kartta"]["alueet"] } {
  const xs = reitti.map((k) => k.p[0]), ys = reitti.map((k) => k.p[1]);
  let [x0, y0, x1, y1] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  // Reunoille tilaa nastoille (vaakuna + nimilappu), vähintään 12 km
  const pad = Math.max(120, 0.2 * Math.max(x1 - x0, y1 - y0));
  [x0, y0, x1, y1] = [x0 - pad, y0 - pad * 0.9, x1 + pad, y1 + pad * 1.2];
  let w = Math.max(x1 - x0, 400), h = Math.max(y1 - y0, 500);
  if (w / h > KL_KARTTA_SUHDE) h = w / KL_KARTTA_SUHDE;
  else w = h * KL_KARTTA_SUHDE;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const vb: [number, number, number, number] = [Math.round(cx - w / 2), Math.round(cy - h / 2), Math.round(w), Math.round(h)];
  // Iso alue (Lappi) karkeistetaan näytön tarkkuuteen: ~700 ruutua kartan korkeudella.
  const ruutu = Math.max(2, Math.round(vb[3] / 700));
  const alueet = KUNNAT.filter((k) => k.b[2] >= vb[0] && k.b[0] <= vb[0] + vb[2] && k.b[3] >= vb[1] && k.b[1] <= vb[1] + vb[3]).map(
    (k) => ({ k: k.k, d: ruutu > 2 ? karkeista(k.d, ruutu) : k.d, s: SAVY.get(k.m) ?? 0, ...(maakunta && k.m !== maakunta ? { u: true } : {}) }),
  );
  return { viewBox: vb, alueet };
}

/** Polku uudelleen karkeampaan ruudukkoon. Sama napsautus kaikille kunnille → naapurien
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

export function arvoReitti(siemen: string, maakunta: string | null = null): KlReitti | null {
  const r = satunnainen(`kuntaliitos:${maakunta ?? ""}:${siemen}`);
  // Maakunnan kanssa otetaan 40 kelvollisesta ehdokkaasta se, jossa on eniten maakunnan
  // omia kuntia (tutuimmat); ilman maakuntaa ensimmäinen kelvollinen.
  const tavoite = maakunta ? 40 : 1;
  const omia = (x: string[]) => x.filter((k) => PER.get(k)!.m === maakunta).length;
  let reitti: string[] | null = null;
  let loydetty = 0;
  for (let i = 0; i < 2000 && loydetty < tavoite; i++) {
    const ehdokas = kavele(r, maakunta);
    if (!ehdokas || ratkaisuja(ehdokas) !== 1) continue;
    loydetty++;
    if (!reitti || omia(ehdokas) > omia(reitti)) reitti = ehdokas;
  }
  if (!reitti) return null;
  const kunnat = reitti.map((k) => PER.get(k)!);

  // Lähtöjärjestys: välikunnat sekaisin niin, että oikeita pareja on korkeintaan kaksi.
  const keski = reitti.slice(1, -1);
  let alku = reitti;
  for (let i = 0; i < 50; i++) {
    const ehdokas = [reitti[0], ...sekoita(keski, r), reitti.at(-1)!];
    const oikein = ehdokas.slice(1).filter((k, j) => rajaa(ehdokas[j], k)).length;
    alku = ehdokas;
    if (oikein <= 2) break;
  }

  const rajat: string[] = [];
  for (const a of reitti) for (const b of reitti) if (a < b && rajaa(a, b)) rajat.push(pariAvain(a, b));

  const { viewBox, alueet } = kartta(kunnat, maakunta);
  const [vx, vy, vw, vh] = viewBox;
  const ratkaisu: KlKunta[] = kunnat.map((k) => ({
    k: k.k, n: k.n, m: k.m, v: k.v,
    x: Math.round(((k.p[0] - vx) / vw) * 1000) / 10,
    y: Math.round(((k.p[1] - vy) / vh) * 1000) / 10,
  }));
  return { siemen, maakunta, ratkaisu, alku, rajat, kartta: { viewBox: viewBox.join(" "), alueet } };
}

export const KL_LAHDE = data.lahde as string;
