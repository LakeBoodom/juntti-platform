// RAJANAAPURIT: YHDYSVALLAT — osavaltioaineiston generointi (1.11.2026, CD-handoff "Rajanaapurit: Yhdysvallat").
//
// Tuottaa apps/tietoniekka/lib/rajanaapurit/osavaltiot.json samassa muodossa kuin maat.json, joten sama
// reittimoottori (lib/reittipeli/moottori.ts) toimii sellaisenaan:
//   alueet: 48 manner-osavaltiota (nimi, Census-alue, lippu, karttapolku, nastan paikka)
//   rajat:  maarajaparit [a, b, pituus m, "maa"] — alla oleva lista (Wikipedia: List of U.S. states and
//           territories by borders), pituus kartasta
//
// Lähteet: Natural Earth ne_50m_admin_1_states_provinces_lakes (public domain; järvet leikattu, joten
// Suurten järvien vesirajat eivät synny), liput Wikimedia Commons "Flag of <osavaltio>.svg" (public domain)
// → public/20/rajanaapurit/liput/us-<xx>.webp (scripts/rajanaapurit-osavaltioliput.mjs).
// Säännöt (Heikki 1.11.2026): Alaska, Havaiji ja Washington D.C. pois; vain maaraja kelpaa — Four Corners
// -nurkat (Arizona–Colorado, Utah–Uusi-Meksiko) ja vesirajat (Michigan–Minnesota/Illinois, New York–Rhode
// Island) eivät ole naapuruuksia.
//
//   node scripts/rajanaapurit-osavaltiot-data.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../apps/tietoniekka/lib/rajanaapurit/osavaltiot.json");
const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces_lakes.geojson";

const POIS = new Set(["AK", "HI", "DC"]);
/** Suomenkieliset nimet (Kotus); muut englanniksi. */
const NIMI = {
  CA: "Kalifornia", NC: "Pohjois-Carolina", SC: "Etelä-Carolina", ND: "Pohjois-Dakota", SD: "Etelä-Dakota",
  NM: "Uusi-Meksiko", WV: "Länsi-Virginia",
};
/** Census Bureaun alueet (Natural Earth region). Aluevalinta ei ole vielä käytössä (Heikki 1.11.2026). */
const ALUE = { Northeast: "Koillinen", Midwest: "Keskilänsi", South: "Etelä", West: "Länsi" };
/** Maarajat: Wikipedia "List of U.S. states and territories by borders" ilman AK, HI ja DC, 105 paria. */
const NAAPURIT = {
  AL: "FL GA MS TN", AZ: "CA NM NV UT", AR: "LA MO MS OK TN TX", CA: "NV OR", CO: "KS NE NM OK UT WY",
  CT: "MA NY RI", DE: "MD NJ PA", FL: "GA", GA: "NC SC TN", ID: "MT NV OR UT WA WY", IL: "IA IN KY MO WI",
  IN: "KY MI OH", IA: "MN MO NE SD WI", KS: "MO NE OK", KY: "MO OH TN VA WV", LA: "MS TX", ME: "NH",
  MD: "PA VA WV", MA: "NH NY RI VT", MI: "OH WI", MN: "ND SD WI", MS: "TN", MO: "NE OK TN", MT: "ND SD WY",
  NE: "SD WY", NV: "OR UT", NH: "VT", NJ: "NY PA", NM: "OK TX", NY: "PA VT", NC: "SC TN VA", ND: "SD",
  OH: "PA WV", OK: "TX", OR: "WA", PA: "WV", SD: "WY", TN: "VA", UT: "WY", VA: "WV",
};
const RUUTU = 2; // km

// ── Albers-kartioprojektio (d3.geoAlbers: vakioleveydet 29,5° ja 45,5°, keskimeridiaani 96° W), km ──
const R = 6371, rad = Math.PI / 180;
const f1 = 29.5 * rad, f2 = 45.5 * rad, f0 = 38.7 * rad, l0 = -96 * rad;
const nA = (Math.sin(f1) + Math.sin(f2)) / 2, C = Math.cos(f1) ** 2 + 2 * nA * Math.sin(f1);
const rho0 = Math.sqrt(C - 2 * nA * Math.sin(f0)) / nA;
function projisoi([lon, lat]) {
  const rho = Math.sqrt(C - 2 * nA * Math.sin(lat * rad)) / nA, th = nA * (lon * rad - l0);
  return [R * rho * Math.sin(th), -R * (rho0 - rho * Math.cos(th))];
}

const geo = await (await fetch(NE)).json();
const osat = new Map(); // USPS → { nimi, alue, polygonit }
for (const f of geo.features) {
  const q = f.properties;
  if (q.adm0_a3 !== "USA" || POIS.has(q.postal)) continue;
  const polyt = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  osat.set(q.postal, { en: q.name, alue: ALUE[q.region], polyt });
}
if (osat.size !== 48) throw new Error(`Osavaltioita ${osat.size}, odotettiin 48`);

// ── Rajan pituus kartasta (yhteiset reunat) ──
function pituus([lo1, la1], [lo2, la2]) {
  const dLa = (la2 - la1) * rad, dLo = (lo2 - lo1) * rad;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * rad) * Math.cos(la2 * rad) * Math.sin(dLo / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}
const reunat = new Map();
for (const [k, { polyt }] of osat)
  for (const poly of polyt)
    for (const r of poly)
      for (let i = 1; i < r.length; i++) {
        const a = `${r[i - 1][0].toFixed(5)},${r[i - 1][1].toFixed(5)}`, b = `${r[i][0].toFixed(5)},${r[i][1].toFixed(5)}`;
        if (a === b) continue;
        const avain = a < b ? `${a}|${b}` : `${b}|${a}`;
        const e = reunat.get(avain) ?? { k: new Set(), l: pituus(r[i - 1], r[i]) };
        e.k.add(k);
        reunat.set(avain, e);
      }
const kartalla = new Map();
for (const { k, l } of reunat.values()) {
  if (k.size !== 2) continue;
  const [a, b] = [...k].sort();
  kartalla.set(`${a}-${b}`, (kartalla.get(`${a}-${b}`) ?? 0) + l);
}

const rajat = [];
for (const [a0, lista] of Object.entries(NAAPURIT))
  for (const b0 of lista.split(" ")) {
    const [a, b] = [a0, b0].sort();
    if (!osat.has(a) || !osat.has(b)) throw new Error(`Tuntematon osavaltio parissa ${a}-${b}`);
    rajat.push([a, b, Math.round(kartalla.get(`${a}-${b}`) ?? 0), "maa"]);
  }
const listalla = new Set(rajat.map((r) => `${r[0]}-${r[1]}`));
if (listalla.size !== rajat.length) throw new Error("Rajalistassa on toistoja");
const vainListalla = rajat.filter((r) => !r[2]).map((r) => `${r[0]}–${r[1]}`);
const vainKartalla = [...kartalla.keys()].filter((p) => !listalla.has(p)).map((p) => `${p} ${Math.round(kartalla.get(p))} m`);

// ── Polut: projisointi + ruudukkoon napsautus (sama kuin scripts/rajanaapurit-data.mjs) ──
function siisti(r) {
  const p = [];
  for (const q of r.map(projisoi).map(([x, y]) => [Math.round(x / RUUTU) * RUUTU, Math.round(y / RUUTU) * RUUTU]))
    if (!p.length || p.at(-1)[0] !== q[0] || p.at(-1)[1] !== q[1]) p.push(q);
  if (p.length > 1 && p[0][0] === p.at(-1)[0] && p[0][1] === p.at(-1)[1]) p.pop();
  const o = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[(i - 1 + p.length) % p.length], b = p[i], c = p[(i + 1) % p.length];
    if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) o.push(b);
  }
  return o.length >= 3 ? o : null;
}
const polku = (rs) =>
  rs.map((r) => `M${r[0][0]} ${r[0][1]}l` + r.slice(1).map((q, i) => `${q[0] - r[i][0]} ${q[1] - r[i][1]}`).join(" ").replace(/ -/g, "-") + "z").join("");
const ala = (r) => r.reduce((s, p, i) => { const q = r[(i + 1) % r.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
const laatikko = (rs) => {
  const xs = rs.flat().map((p) => p[0]), ys = rs.flat().map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};
function sisalla(x, y, rs) {
  let s = false;
  for (const r of rs)
    for (let i = 0, j = r.length - 1; i < r.length; j = i++)
      if ((r[i][1] > y) !== (r[j][1] > y) && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) s = !s;
  return s;
}
function reunaEt(x, y, rs) {
  let m = Infinity;
  for (const r of rs)
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [ax, ay] = r[j], [bx, by] = r[i], dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
      m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy));
    }
  return m;
}
function keskus(rs) {
  let [x0, y0, x1, y1] = laatikko([rs[0]]);
  let paras = [(x0 + x1) / 2, (y0 + y1) / 2, -1];
  for (let kierros = 0; kierros < 3; kierros++) {
    for (let i = 0; i <= 24; i++)
      for (let j = 0; j <= 24; j++) {
        const x = x0 + ((x1 - x0) * i) / 24, y = y0 + ((y1 - y0) * j) / 24;
        if (!sisalla(x, y, rs)) continue;
        const d = reunaEt(x, y, rs);
        if (d > paras[2]) paras = [x, y, d];
      }
    const w = (x1 - x0) / 6, h = (y1 - y0) / 6;
    [x0, x1, y0, y1] = [paras[0] - w, paras[0] + w, paras[1] - h, paras[1] + h];
  }
  return [Math.round(paras[0]), Math.round(paras[1])];
}

const alueet = [];
for (const [k, o] of osat) {
  const projisoidut = o.polyt.map((poly) => poly.map(siisti).filter(Boolean)).filter((p) => p.length);
  const suurin = projisoidut.reduce((a, b) => (Math.abs(ala(b[0])) > Math.abs(ala(a[0])) ? b : a));
  const kaikki = projisoidut.flat();
  alueet.push({
    k,
    n: NIMI[k] ?? o.en,
    m: o.alue,
    v: `/20/rajanaapurit/liput/us-${k.toLowerCase()}.webp`,
    // Pinta-ala (km²): pienet osavaltiot (Rhode Island, Delaware) saavat kartalla katkoviivarenkaan (7c)
    a: Math.round(kaikki.reduce((s, r) => s + Math.abs(ala(r)), 0)),
    p: keskus(suurin),
    b: laatikko(kaikki),
    d: polku(kaikki),
  });
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({
    lahde: `Osavaltiorajat: Natural Earth 1:50 milj. (public domain). Liput: Wikimedia Commons (public domain). Generoitu ${new Date().toISOString().slice(0, 10)}.`,
    yksikko: 1000,
    alueet: alueet.sort((a, b) => a.k.localeCompare(b.k)),
    rajat: rajat.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1])),
  }),
);
const aste = new Map();
for (const [a, b] of rajat) for (const x of [a, b]) aste.set(x, (aste.get(x) ?? 0) + 1);
const jarj = [...aste].sort((a, b) => a[1] - b[1]);
console.log(`${alueet.length} osavaltiota, ${rajat.length} maarajaa`);
console.log(`Listalla, ei yhteistä reunaa kartalla (${vainListalla.length}): ${vainListalla.join(", ")}`);
console.log(`Kartalla, ei listalla (${vainKartalla.length}): ${vainKartalla.join(", ")}`);
console.log(`Vähiten naapureita: ${jarj.slice(0, 5).map(([k, n]) => `${k} ${n}`).join(", ")}; eniten: ${jarj.slice(-4).map(([k, n]) => `${k} ${n}`).join(", ")}`);
const lyhyet = rajat.filter((r) => r[2] < 50000).map((r) => `${r[0]}–${r[1]} ${(r[2] / 1000).toFixed(1)} km`);
console.log(`Alle 50 km (${lyhyet.length}): ${lyhyet.join(", ")}`);
console.log(`Pienimmät: ${alueet.slice().sort((a, b) => a.a - b.a).slice(0, 6).map((x) => `${x.k} ${x.a} km²`).join(", ")}`);
