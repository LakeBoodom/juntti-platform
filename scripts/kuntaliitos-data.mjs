// KUNTALIITOS — pelin kunta-aineiston generointi (26.9.2026).
//
// Tuottaa apps/tietoniekka/lib/kuntaliitos/kunnat.json:
//   kunnat: nimi, maakunta, vaakuna, karttapolku ja nastan paikka
//   rajat:  naapuriparit tyypillä "maa" (yhteinen maaraja, pituus metreinä) tai
//           "meri" (raja vain merialueella, esim. Naantali–Turku, Hailuoto–Oulu)
//
// Lähteet:
//   - Kuntarajat: Tilastokeskus, kunta1000k_<vuosi> (1:1 milj., CC BY 4.0).
//     Tarkempi kuin kannan kunnat.geom (1:4,5 milj.), jota ei voi zoomata reitin alueelle.
//   - Nimet, maakunnat, vaakunat ja merirajat: Supabase (kunnat, kuntien_rajat).
//     Maarajat lasketaan 1:1 milj. aineiston yhteisistä reunoista; kannan "land"-parit,
//     joilla ei ole yhteistä reunaa maalla, ovat merirajoja. Lauttayhteydet jätetään pois.
//
// Aja uudelleen, kun kuntajako muuttuu (uusi vuosi) tai kannan rajoja/vaakunoita korjataan:
//   NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/kuntaliitos-data.mjs 2026

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VUOSI = process.argv[2] ?? String(new Date().getFullYear());
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SB || !KEY) throw new Error("NEXT_PUBLIC_SUPABASE_URL ja NEXT_PUBLIC_SUPABASE_ANON_KEY tarvitaan");
const OUT = join(dirname(fileURLToPath(import.meta.url)), "../apps/tietoniekka/lib/kuntaliitos/kunnat.json");

/** Kuntien omat vaakunat, jotka puuttuvat kannasta (Humppila: Wikimedia Commons, public domain). */
const VAAKUNA_LISA = { "103": "/20/kuntaliitos/humppila.png" };
/** Koordinaatit 100 m:n yksiköissä, ruudukko 2 = 200 m (alle pikselin reitin mittakaavassa). */
const YKS = 100;
const RUUTU = 2;

async function sb(polku) {
  const r = await fetch(`${SB}/rest/v1/${polku}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!r.ok) throw new Error(`${polku}: ${r.status}`);
  return r.json();
}

const wfs = `https://geo.stat.fi/geoserver/tilastointialueet/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta1000k_${VUOSI}&outputFormat=application/json&srsName=EPSG:3067`;
const geo = await (await fetch(wfs)).json();
const dbKunnat = await sb("kunnat?select=code,name_fi,maakunta,vaakuna_url&limit=1000");
const dbRajat = await sb("kuntien_rajat?select=kunta_a,kunta_b,border_type,accepted&limit=5000");
const perKoodi = new Map(dbKunnat.map((k) => [k.code, k]));

const renkaat = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);

// ── Maarajat: yhteiset reunat alkuperäisestä (yksinkertaistamattomasta) geometriasta ──
const reunat = new Map();
for (const f of geo.features) {
  const k = f.properties.kunta;
  for (const poly of renkaat(f.geometry))
    for (const r of poly)
      for (let i = 1; i < r.length; i++) {
        const a = `${Math.round(r[i - 1][0])},${Math.round(r[i - 1][1])}`;
        const b = `${Math.round(r[i][0])},${Math.round(r[i][1])}`;
        if (a === b) continue;
        const avain = a < b ? `${a}|${b}` : `${b}|${a}`;
        const e = reunat.get(avain) ?? { k: new Set(), l: Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]) };
        e.k.add(k);
        reunat.set(avain, e);
      }
}
const maa = new Map();
for (const { k, l } of reunat.values()) {
  if (k.size !== 2) continue;
  const [a, b] = [...k].sort();
  maa.set(`${a}-${b}`, (maa.get(`${a}-${b}`) ?? 0) + l);
}
const rajat = [...maa].map(([p, l]) => [...p.split("-"), Math.round(l), "maa"]);
for (const r of dbRajat) {
  if (r.border_type !== "land" || !r.accepted) continue;
  const [a, b] = [r.kunta_a, r.kunta_b].sort();
  if (!maa.has(`${a}-${b}`)) rajat.push([a, b, 0, "meri"]);
}

// ── Karttapolut: ruudukkoon napsautus pitää naapurien yhteiset reunat identtisinä ──
const napsauta = ([x, y]) => [Math.round(x / YKS / RUUTU) * RUUTU, Math.round(-y / YKS / RUUTU) * RUUTU];
function siisti(r) {
  const p = [];
  for (const q of r.map(napsauta)) if (!p.length || p.at(-1)[0] !== q[0] || p.at(-1)[1] !== q[1]) p.push(q);
  if (p.length > 1 && p[0][0] === p.at(-1)[0] && p[0][1] === p.at(-1)[1]) p.pop();
  // suoralla janalla olevat välipisteet pois
  const o = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[(i - 1 + p.length) % p.length], b = p[i], c = p[(i + 1) % p.length];
    if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) o.push(b);
  }
  return o.length >= 3 ? o : null;
}
const polku = (rs) =>
  rs.map((r) => `M${r[0][0]} ${r[0][1]}` + "l" + r.slice(1).map((q, i) => `${q[0] - r[i][0]} ${q[1] - r[i][1]}`).join(" ").replace(/ -/g, "-") + "z").join("");

// ── Nastan paikka: sisäpiste, joka on kauimpana reunasta (suurimman osan "keskus") ──
const ala = (r) => r.reduce((s, p, i) => { const q = r[(i + 1) % r.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
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
      const [ax, ay] = r[j], [bx, by] = r[i];
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
      m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy));
    }
  return m;
}
function keskus(rs) {
  const xs = rs[0].map((p) => p[0]), ys = rs[0].map((p) => p[1]);
  let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let paras = [(x0 + x1) / 2, (y0 + y1) / 2, -1];
  for (let kierros = 0; kierros < 3; kierros++) {
    const n = 24;
    for (let i = 0; i <= n; i++)
      for (let j = 0; j <= n; j++) {
        const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * j) / n;
        if (!sisalla(x, y, rs)) continue;
        const d = reunaEt(x, y, rs);
        if (d > paras[2]) paras = [x, y, d];
      }
    const w = (x1 - x0) / 6, h = (y1 - y0) / 6;
    [x0, x1, y0, y1] = [paras[0] - w, paras[0] + w, paras[1] - h, paras[1] + h];
  }
  return [Math.round(paras[0]), Math.round(paras[1])];
}

const kunnat = geo.features
  .map((f) => {
    const k = f.properties.kunta;
    const db = perKoodi.get(k);
    if (!db) throw new Error(`Kunta ${k} (${f.properties.nimi}) puuttuu kannasta`);
    const polyt = renkaat(f.geometry).map((poly) => poly.map(siisti).filter(Boolean)).filter((p) => p.length);
    const kaikki = polyt.flat();
    const suurin = polyt.reduce((a, b) => (Math.abs(ala(b[0])) > Math.abs(ala(a[0])) ? b : a));
    const xs = kaikki.flat().map((p) => p[0]), ys = kaikki.flat().map((p) => p[1]);
    return {
      k,
      n: db.name_fi,
      m: db.maakunta.replace(/ maakunta$/, ""),
      v: db.vaakuna_url ?? VAAKUNA_LISA[k] ?? null,
      p: keskus(suurin),
      b: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
      d: polku(kaikki),
    };
  })
  .sort((a, b) => a.k.localeCompare(b.k));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({
    lahde: `Kuntarajat: Tilastokeskus kunta1000k_${VUOSI} (CC BY 4.0). Vaakunat: Wikimedia Commons. Generoitu ${new Date().toISOString().slice(0, 10)}.`,
    yksikko: YKS,
    kunnat,
    rajat: rajat.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1])),
  }),
);
const tyypit = rajat.reduce((s, r) => ({ ...s, [r[3]]: (s[r[3]] ?? 0) + 1 }), {});
console.log(`${kunnat.length} kuntaa, rajat ${JSON.stringify(tyypit)}, ilman vaakunaa: ${kunnat.filter((k) => !k.v).map((k) => k.n).join(", ") || "–"}`);
