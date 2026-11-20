// JUNANKULJETTAJA — pelin reittiaineiston generointi (20.11.2026).
//
// Tuottaa apps/tietoniekka/lib/junankuljettaja/reitit.json:
//   reitit: tunnus, taivutettu otsikko, vaikeustaso, lähdejuna ja asemat oikeassa järjestyksessä
//   asema:  koodi, nimi, kunta (koodi ja nimi) ja paikka samassa karttaprojektiossa kuin kunnat.json
//
// Lähteet:
//   - Reitit ja asemat: yhteinen tietomalli (näkymä juna_reitit, attribuutit difficulty ja route_title).
//     Pysähdykset Fintrafficin aikatauluista (rata.digitraffic.fi, CC BY 4.0).
//   - Aseman kunta: piste kunnat.json-polygonissa (Tilastokeskus kunta1000k, CC BY 4.0).
//
// Reitit ovat tietomallissa luonnoksina, eikä julkinen avain näe niitä. Vie ne siksi kannasta JSON-tiedostoksi
// (Supabase SQL, palvelinrooli) ja anna tiedosto skriptille:
//
//   select '[' || string_agg(format('[%s,%s,%s,%s,[%s]]', to_json(r.juna),
//     to_json((select text_value from fact_attributes where entity_id = r.id and attr_key = 'difficulty')),
//     to_json((select text_value from fact_attributes where entity_id = r.id and attr_key = 'route_title')),
//     to_json(r.lahto || '-' || r.maaranpaa),
//     (select string_agg(format('[%s,%s,%s,%s]', to_json(a->>'koodi'), to_json(a->>'nimi'), a->>'lat', a->>'lon'), ','
//       order by (a->>'jarjestys')::int) from jsonb_array_elements(r.asemat) a)), ',') || ']'
//   from juna_reitit r;
//
//   node scripts/junankuljettaja-data.mjs vienti.json

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VIENTI = process.argv[2];
if (!VIENTI) throw new Error("Anna kannan vienti: node scripts/junankuljettaja-data.mjs vienti.json");
const JUURI = join(dirname(fileURLToPath(import.meta.url)), "../apps/tietoniekka/lib");
const OUT = join(JUURI, "junankuljettaja/reitit.json");
const KUNNAT = JSON.parse(readFileSync(join(JUURI, "kuntaliitos/kunnat.json"), "utf8"));

// ── ETRS-TM35FIN (EPSG:3067), JHS 154 -kaavat. kunnat.json: x = E / 100, y = −N / 100 ──
function tm35(lat, lon) {
  const a = 6378137, f = 1 / 298.257222101, k0 = 0.9996, l0 = (27 * Math.PI) / 180;
  const n = f / (2 - f), e = Math.sqrt(2 * f - f * f);
  const A1 = (a / (1 + n)) * (1 + n ** 2 / 4 + n ** 4 / 64);
  const h = [n / 2 - (2 / 3) * n ** 2 + (5 / 16) * n ** 3 + (41 / 180) * n ** 4, (13 / 48) * n ** 2 - (3 / 5) * n ** 3 + (557 / 1440) * n ** 4, (61 / 240) * n ** 3 - (103 / 140) * n ** 4, (49561 / 161280) * n ** 4];
  const fi = (lat * Math.PI) / 180, l = (lon * Math.PI) / 180;
  const Q = Math.asinh(Math.tan(fi)) - e * Math.atanh(e * Math.sin(fi));
  const b = Math.atan(Math.sinh(Q));
  const eta0 = Math.atanh(Math.cos(b) * Math.sin(l - l0));
  const xi0 = Math.asin(Math.sin(b) * Math.cosh(eta0));
  let xi = xi0, eta = eta0;
  h.forEach((hi, i) => { const j = 2 * (i + 1); xi += hi * Math.sin(j * xi0) * Math.cosh(j * eta0); eta += hi * Math.cos(j * xi0) * Math.sinh(j * eta0); });
  return { N: A1 * xi * k0, E: A1 * eta * k0 + 500000 };
}

// ── Kunnan polygonit kunnat.json-poluista (M x y l dx dy … z) ──
function renkaat(d) {
  const out = [];
  for (const osa of d.split("z")) {
    const m = osa.match(/^M(-?\d+) (-?\d+)l?(.*)$/);
    if (!m) continue;
    let x = +m[1], y = +m[2];
    const r = [[x, y]];
    const luvut = (m[3].match(/-?\d+/g) ?? []).map(Number);
    for (let i = 0; i + 1 < luvut.length; i += 2) r.push([(x += luvut[i]), (y += luvut[i + 1])]);
    out.push(r);
  }
  return out;
}
const POLYT = KUNNAT.kunnat.map((k) => ({ k: k.k, n: k.n, b: k.b, r: renkaat(k.d) }));
function sisalla(x, y, rs) {
  let s = false;
  for (const r of rs)
    for (let i = 0, j = r.length - 1; i < r.length; j = i++)
      if ((r[i][1] > y) !== (r[j][1] > y) && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) s = !s;
  return s;
}
function kunta(x, y) {
  const osuma = POLYT.find((k) => x >= k.b[0] && x <= k.b[2] && y >= k.b[1] && y <= k.b[3] && sisalla(x, y, k.r));
  if (osuma) return osuma;
  // Rantaviivan asema (200 m:n ruudukko voi jättää sen mereen): lähin kunta pisteen mukaan
  return POLYT.reduce((p, q) => (Math.hypot(q.b[0] / 2 + q.b[2] / 2 - x, q.b[1] / 2 + q.b[3] / 2 - y) < Math.hypot(p.b[0] / 2 + p.b[2] / 2 - x, p.b[1] / 2 + p.b[3] / 2 - y) ? q : p));
}

const tunnus = (s) => s.toLowerCase().replace(/[äå]/g, "a").replace(/ö/g, "o").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

const reitit = JSON.parse(readFileSync(VIENTI, "utf8")).map(([juna, taso, otsikko, pari, asemat]) => ({
  reitti: pari, juna, taso, otsikko, asemat: asemat.map(([koodi, nimi, lat, lon]) => ({ koodi, nimi, lat, lon })),
}));
const TASOT = ["helppo", "keski", "vaikea"];

const ulos = reitit
  .map((r) => {
    const { taso, otsikko } = r;
    if (!TASOT.includes(taso) || !otsikko) throw new Error(`${r.reitti}: taso tai otsikko puuttuu`);
    const asemat = r.asemat.map((s) => {
      const { N, E } = tm35(s.lat, s.lon);
      const x = Math.round(E) / 100, y = -Math.round(N) / 100;
      const ku = kunta(x, y);
      return { k: s.koodi, n: s.nimi, ku: ku.k, kn: ku.n, p: [Math.round(x * 10) / 10, Math.round(y * 10) / 10] };
    });
    if (asemat.length < 8) throw new Error(`${r.reitti}: alle 6 väliasemaa`);
    return { t: tunnus(r.reitti), otsikko, taso, juna: r.juna, asemat };
  })
  .sort((p, q) => TASOT.indexOf(p.taso) - TASOT.indexOf(q.taso) || p.t.localeCompare(q.t));

if (new Set(ulos.map((r) => r.t)).size !== ulos.length) throw new Error("Kaksi reittiä samalla tunnuksella");
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({
    lahde: `Asemat ja pysähdykset: Fintraffic / Digitraffic, rata.digitraffic.fi (CC BY 4.0). Kuntarajat: Tilastokeskus (CC BY 4.0). Generoitu ${new Date().toISOString().slice(0, 10)}.`,
    reitit: ulos,
  }),
);
console.log(`${ulos.length} reittiä → ${OUT}`);
for (const r of ulos) console.log(`${r.taso.padEnd(6)} ${r.t.padEnd(22)} ${r.asemat.map((a) => (a.n === a.kn ? a.n : `${a.n}·${a.kn}`)).join(", ")}`);
