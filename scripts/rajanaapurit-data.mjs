// RAJANAAPURIT — pelin valtioaineiston generointi (27.9.2026).
//
// Projektio Mercator (CD v0.2, 27.9.2026). Tuottaa apps/tietoniekka/lib/rajanaapurit/maat.json samassa muodossa kuin Kuntaliitoksen
// kunnat.json, joten sama reittimoottori (lib/reittipeli.ts) toimii molemmille:
//   alueet: pelin valtiot (nimi, maanosa, lippu, karttapolku, nastan paikka)
//   rajat:  maarajaparit [a, b, pituus m, "maa"] — kannan maiden_rajat (accepted), pituus kartasta
//   tausta: kartalle piirrettävät muut maat (saarivaltiot, kiistanalaiset) ja kaukaiset osat
//
// Lähteet: Natural Earth ne_50m_admin_0_countries (public domain), Supabase maat + maiden_rajat,
// liput flag-icons (MIT) → public/20/rajanaapurit/liput/<koodi>.webp.
// Säännöt (Heikki 27.9.2026): vain maarajat, vain emämaan rajat (Espanja–Marokko pois kannassa),
// Vatikaani, San Marino ja Monaco pois pelistä.
//
//   NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/rajanaapurit-data.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SB || !KEY) throw new Error("NEXT_PUBLIC_SUPABASE_URL ja NEXT_PUBLIC_SUPABASE_ANON_KEY tarvitaan");
const OUT = join(dirname(fileURLToPath(import.meta.url)), "../apps/tietoniekka/lib/rajanaapurit/maat.json");
const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";

const POIS = new Set(["VAT", "SMR", "MCO"]); // liian pieniä kartalle, yksi naapuri
const YHDISTA = { SOL: "SOM" }; // Natural Earthin Somalimaa kuuluu Somaliaan
/** Nastan paikka käsin: Venäjän sisäpiste olisi Siperiassa → Euroopan reitit venyisivät. */
const NASTA = { RUS: [40, 57], CAN: [-98, 56] };
const MAANOSA = {
  eurooppa: ["Eurooppa", "Eurooppa"], aasia: ["Aasia", "Aasia"], afrikka: ["Afrikka", "Afrikka"],
  pohjois_amerikka: ["Pohjois-Amerikka", "Amerikka"], etela_amerikka: ["Etelä-Amerikka", "Amerikka"],
  karibia: ["Karibia", "Amerikka"], oseania: ["Oseania", "Oseania"],
};
const RUUTU = 3; // km — alle pikselin Euroopan mittakaavassa
/** Mannertenväliset maat korostuvat kummassakin maanosassa (CD v0.2 3c). */
const MANTEREET = { RUS: ["Eurooppa", "Aasia"], TUR: ["Eurooppa", "Aasia"], KAZ: ["Eurooppa", "Aasia"], GEO: ["Eurooppa", "Aasia"], AZE: ["Eurooppa", "Aasia"], ARM: ["Eurooppa", "Aasia"], EGY: ["Afrikka", "Aasia"] };

async function sb(polku) {
  const r = await fetch(`${SB}/rest/v1/${polku}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!r.ok) throw new Error(`${polku}: ${r.status}`);
  return r.json();
}
const geo = await (await fetch(NE)).json();
const maat = await sb("maat?select=code,name_fi,continent&limit=1000");
const dbRajat = await sb("maiden_rajat?select=country_a,country_b,border_type,accepted&limit=5000");
const pelissa = new Map(maat.filter((m) => !POIS.has(m.code)).map((m) => [m.code, m]));

// ── Mercator-projektio (km päiväntasaajalla) — CD v0.2 3c: alueet näyttävät tutuilta ──
function projisoi([lon, lat]) {
  const l = Math.max(-85, Math.min(85, lat)) * Math.PI / 180;
  return [6371 * lon * Math.PI / 180, -6371 * Math.log(Math.tan(Math.PI / 4 + l / 2))];
}

// ── Valtiot ja niiden osat ──
const koodi = (q) => {
  for (const k of [q.ADM0_A3, q.ISO_A3_EH, q.ISO_A3]) if (k && k !== "-99" && (pelissa.has(YHDISTA[k] ?? k) || POIS.has(k))) return YHDISTA[k] ?? k;
  return q.ADM0_A3;
};
const osat = new Map(); // koodi → polygonit (lon/lat)
for (const f of geo.features) {
  const k = koodi(f.properties);
  if (k === "ATA") continue;
  const polyt = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  osat.set(k, [...(osat.get(k) ?? []), ...polyt]);
}
const puuttuvat = [...pelissa.keys()].filter((k) => !osat.has(k));
if (puuttuvat.length) throw new Error(`Natural Earthista puuttuu: ${puuttuvat}`);

// ── Naapuruus ja rajan pituus kartasta (yhteiset reunat) ──
const reunat = new Map();
for (const [k, polyt] of osat)
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
function pituus([lo1, la1], [lo2, la2]) {
  const r = Math.PI / 180, dLa = (la2 - la1) * r, dLo = (lo2 - lo1) * r;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dLo / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}
const kartalla = new Map();
for (const { k, l } of reunat.values()) {
  if (k.size !== 2) continue;
  const [a, b] = [...k].sort();
  kartalla.set(`${a}-${b}`, (kartalla.get(`${a}-${b}`) ?? 0) + l);
}

const rajat = [];
const vainKannassa = [];
for (const r of dbRajat) {
  if (r.border_type !== "land" || !r.accepted) continue;
  const [a, b] = [r.country_a, r.country_b].sort();
  if (!pelissa.has(a) || !pelissa.has(b)) continue;
  const l = kartalla.get(`${a}-${b}`);
  if (l == null) vainKannassa.push(`${pelissa.get(a).name_fi}–${pelissa.get(b).name_fi}`);
  rajat.push([a, b, Math.round(l ?? 0), "maa"]);
}
const kannassa = new Set(rajat.map((r) => `${r[0]}-${r[1]}`));
const vainKartalla = [...kartalla.keys()].filter((p) => !kannassa.has(p) && p.split("-").every((k) => pelissa.has(k)))
  .map((p) => p.split("-").map((k) => pelissa.get(k).name_fi).join("–") + ` ${Math.round(kartalla.get(p) / 1000)} km`);

// ── Sävyt: naapurimaat eri värein (kaikki kartan maat, myös tausta) ──
const vierus = new Map();
for (const p of kartalla.keys()) {
  const [a, b] = p.split("-");
  for (const [x, y] of [[a, b], [b, a]]) vierus.set(x, (vierus.get(x) ?? new Set()).add(y));
}
const savy = new Map();
for (const k of [...osat.keys()].sort((a, b) => (vierus.get(b)?.size ?? 0) - (vierus.get(a)?.size ?? 0))) {
  const varatut = new Set([...(vierus.get(k) ?? [])].map((x) => savy.get(x)));
  savy.set(k, [0, 1, 2, 3, 4].find((i) => !varatut.has(i)) ?? 0);
}

// ── Polut: projisointi + ruudukkoon napsautus (naapurien yhteiset reunat pysyvät identtisinä) ──
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

const alueet = [], tausta = [];
for (const [k, polyt] of osat) {
  const projisoidut = polyt.map((poly) => poly.map(siisti).filter(Boolean)).filter((p) => p.length);
  if (!projisoidut.length) continue;
  const suurin = projisoidut.reduce((a, b) => (Math.abs(ala(b[0])) > Math.abs(ala(a[0])) ? b : a));
  const [mx0, my0, mx1, my1] = laatikko(suurin);
  const lahella = (p) => { const [a, b, c, d] = laatikko(p); return c >= mx0 - 1500 && a <= mx1 + 1500 && d >= my0 - 1500 && b <= my1 + 1500; };
  const paa = projisoidut.filter(lahella), kaukana = projisoidut.filter((p) => !lahella(p));
  const m = pelissa.get(k);
  kaukana.forEach((p, i) => tausta.push({ k: `${k}-${i}`, b: laatikko(p), d: polku(p), s: savy.get(k) ?? 0 }));
  if (!m) {
    tausta.push({ k, b: laatikko(paa.flat()), d: polku(paa.flat()), s: savy.get(k) ?? 0 });
    continue;
  }
  const [maanosa, ryhma] = MAANOSA[m.continent] ?? [m.continent, m.continent];
  alueet.push({
    k,
    n: m.name_fi.replace(/\s*\(.*\)$/, ""),
    m: maanosa,
    r: ryhma,
    ...(MANTEREET[k] ? { rr: MANTEREET[k] } : {}),
    v: `/20/rajanaapurit/liput/${k.toLowerCase()}.webp`,
    // Pinta-ala (yksikkö²): pikkuvaltiot saavat kartalla katkoviivarenkaan (CD v0.2 3c)
    a: Math.round(paa.flat().reduce((s, r) => s + Math.abs(ala(r)), 0)),
    p: NASTA[k] ? projisoi(NASTA[k]).map(Math.round) : keskus(suurin),
    b: laatikko(paa.flat()),
    d: polku(paa.flat()),
    s: savy.get(k) ?? 0,
  });
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({
    lahde: `Valtiorajat: Natural Earth 1:50 milj. (public domain). Liput: flag-icons (MIT). Generoitu ${new Date().toISOString().slice(0, 10)}.`,
    yksikko: 1000,
    alueet: alueet.sort((a, b) => a.k.localeCompare(b.k)),
    rajat: rajat.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1])),
    tausta,
  }),
);
console.log(`${alueet.length} valtiota, ${rajat.length} maarajaa, taustalla ${tausta.length} aluetta`);
console.log(`Kannassa, ei kartalla (${vainKannassa.length}): ${vainKannassa.join(", ")}`);
console.log(`Kartalla, ei kannassa (${vainKartalla.length}): ${vainKartalla.join(", ")}`);
const lyhyet = rajat.filter((r) => r[2] > 0 && r[2] < 10000).map((r) => `${pelissa.get(r[0]).name_fi}–${pelissa.get(r[1]).name_fi} ${(r[2] / 1000).toFixed(1)} km`);
console.log(`Alle 10 km (${lyhyet.length}): ${lyhyet.join(", ")}`);
