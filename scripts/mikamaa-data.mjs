// MIKÄ MAA? — vihjepelin maa-aiheen valtioaineisto (7.11.2026).
//
// Tuottaa apps/tietoniekka/lib/vihjepeli/maat.json: kaikki YK:n 193 jäsenmaata (Heikki 7.11.2026: YK:n lista).
//   k ISO-3 · n nimi · syn synonyymit (haku) · m maanosa · pk pääkaupunki · pkl pääkaupunki paljastaa nimen → lippu
//   lat/lon (siluetin osien painopiste; Venäjä ja Kanada käsin kuten Rajanaapureissa) · nr maarajanaapurit
//   d siluetti omassa 1000 × 1000 -ruudussaan (tasavälinen projektio maan keskipisteen leveydellä) · b sen laatikko
//   v lippu · taso A/B/C
//
// Lähteet: Natural Earth ne_50m_admin_0_countries (public domain), Wikidata (CC0: YK-jäsenyys, nimet, pääkaupungit),
// Supabase maat + maiden_rajat (Rajanaapurien nimet, maanosat, rajat), liput flag-icons (MIT) →
// public/20/rajanaapurit/liput/<koodi>.webp (sama kansio kuin Rajanaapureilla, puuttuvat lisätään).
//
//   NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/mikamaa-data.mjs
//   node scripts/mikamaa-paakaupungit.mjs   (pääkaupunkien sijainnit etäisyyteen, aina tämän jälkeen)

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SB || !KEY) throw new Error("NEXT_PUBLIC_SUPABASE_URL ja NEXT_PUBLIC_SUPABASE_ANON_KEY tarvitaan");
const juuri = join(dirname(fileURLToPath(import.meta.url)), "..");
const sharp = createRequire(join(juuri, "apps/tietoniekka/package.json"))("sharp");
const OUT = join(juuri, "apps/tietoniekka/lib/vihjepeli/maat.json");
const LIPUT = join(juuri, "apps/tietoniekka/public/20/rajanaapurit/liput");
const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";

/* Vaikeustasot (Heikki hyväksyi 7.11.2026: Venäjä ei arvonnassa, Bulgaria A:han). A ja B ovat aloitusjoukko: päivän maa ja harjoitustila
   arpovat vain niistä, ja vain niille kirjoitetaan vihjeet ensimmäisessä erässä. C-maat ovat täydennyslistassa
   (jokaisen arvauksen etäisyys lasketaan), mutta niitä ei arvota ennen vihje-erää 2. */
const TASO_A = "FIN SWE NOR DNK ISL EST LVA LTU BGR DEU FRA GBR IRL ESP PRT ITA GRC NLD BEL CHE AUT POL CZE HUN UKR TUR HRV USA CAN MEX BRA ARG CHL PER COL CUB JAM CHN JPN IND KOR PRK THA VNM IDN PHL SAU ISR IRN IRQ PAK AFG EGY ZAF MAR KEN NGA ETH AUS NZL".split(" ");
const TASO_B = "ROU SRB SVK SVN BLR LUX CYP MLT ALB BIH VEN BOL ECU URY PRY CRI PAN DOM MNG NPL LKA SGP MYS ARE QAT KAZ SYR LBN JOR GEO ARM TUN DZA LBY GHA SEN TZA MDG UGA".split(" ");

/** Natural Earthin erilliset alueet, jotka kuuluvat YK:n jäsenmaahan. */
const YHDISTA = { SOL: "SOM", CYN: "CYP" };
/** Keskipiste käsin: Venäjä ja Kanada kuten Rajanaapurien nasta (painopiste olisi kaukana asutuksesta). */
const PISTE = { RUS: [40, 57], CAN: [-98, 56], USA: [-98.58, 39.83] }; // Yhdysvallat: mannerosan keskipiste (Alaska vetäisi Montanaan)
/** Siluetista pois: Huippuvuoret ja Kanariansaaret. Ranskan merentakaiset alueet jäävät pois etäisyyssäännöllä. */
const SILUETISTA_POIS = { NOR: ([lon, lat]) => lat > 72, ESP: ([lon, lat]) => lat < 30 };

const NIMI = { CHN: "Kiina", NLD: "Alankomaat", KOR: "Etelä-Korea", PRK: "Pohjois-Korea", COG: "Kongon tasavalta", ARE: "Arabiemiraatit" };
const SYN = {
  NLD: ["Hollanti"], GBR: ["Britannia", "Iso-Britannia", "Englanti"], USA: ["USA", "Amerikka"], MMR: ["Burma"],
  CZE: ["Tšekin tasavalta", "Tshekki"], BLR: ["Belarus"], SWZ: ["Swazimaa"], KOR: ["Korea"], CHN: ["China"],
  COD: ["Kongo-Kinshasa"], COG: ["Kongo-Brazzaville"], ARE: ["Yhdistyneet arabiemiraatit", "Emiraatit"],
  TLS: ["Timor-Leste"], CPV: ["Cabo Verde"], TUR: ["Türkiye"], MKD: ["Makedonia"], GEO: ["Gruusia"], BIH: ["Bosnia"],
  CIV: ["Côte d’Ivoire"], NOR: ["Norway"], NZL: ["New Zealand"], FSM: ["Mikronesian liittovaltio"],
};
/** Wikidatan virallinen tai kahden pääkaupungin muoto → pelissä näytettävä. */
const PK = {
  NOR: "Oslo", NGA: "Abuja", BEN: "Porto-Novo", NLD: "Amsterdam", LKA: "Sri Jayewardenepura Kotte", ISR: "Jerusalem",
  SWZ: "Mbabane", BOL: "Sucre ja La Paz", ZAF: "Pretoria, Kapkaupunki ja Bloemfontein", MYS: "Kuala Lumpur",
  YEM: "Sanaa", IDN: "Jakarta", CHL: "Santiago", KIR: "Tarawa", MEX: "Méxicon kaupunki",
};
/** Pääkaupunki paljastaa nimen, vaikka alku ei ole sama. */
const PKL_KASIN = ["SLV", "LKA"];
const MAANOSA = { eurooppa: "Eurooppa", aasia: "Aasia", afrikka: "Afrikka", pohjois_amerikka: "Pohjois-Amerikka", etela_amerikka: "Etelä-Amerikka", karibia: "Karibia", oseania: "Oseania" };
/** Saarivaltiot, joita kannan maat-taulussa ei ole: maanosa Natural Earthista, poikkeukset käsin. */
const MAANOSA_KASIN = { CYP: "Eurooppa", MDV: "Aasia", MUS: "Afrikka", SYC: "Afrikka", COM: "Afrikka", CPV: "Afrikka", STP: "Afrikka" };
const VIRALLINEN = /(tasavalta|tasvalta|kuningaskunta|ruhtinaskunta|federaatio|liitto|liittovaltio|valtio|yhteisö|valaliitto|sulttaanikunta|suurherttuakunta|kansainyhteisö)$/i;

async function sb(polku) {
  const r = await fetch(`${SB}/rest/v1/${polku}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!r.ok) throw new Error(`${polku}: ${r.status}`);
  return r.json();
}
async function wikidata() {
  const q = `SELECT ?iso3 ?iso2 ?fi ?en (GROUP_CONCAT(DISTINCT ?alt; separator="|") AS ?alts) (GROUP_CONCAT(DISTINCT ?cap2; separator="|") AS ?caps) WHERE {
    { ?c p:P463 ?st . ?st ps:P463 wd:Q1065 . FILTER NOT EXISTS { ?st pq:P582 ?end } } UNION { VALUES ?c { wd:Q35 } }
    ?c wdt:P298 ?iso3 . OPTIONAL { ?c wdt:P297 ?iso2 }
    OPTIONAL { ?c rdfs:label ?fi FILTER(lang(?fi)="fi") } OPTIONAL { ?c rdfs:label ?en FILTER(lang(?en)="en") }
    OPTIONAL { ?c skos:altLabel ?alt FILTER(lang(?alt)="fi") }
    OPTIONAL { ?c p:P36 ?cs . ?cs ps:P36 ?cap . FILTER NOT EXISTS { ?cs pq:P582 ?e2 }
      OPTIONAL { ?cap rdfs:label ?cfi FILTER(lang(?cfi)="fi") } OPTIONAL { ?cap rdfs:label ?cen FILTER(lang(?cen)="en") }
      BIND(COALESCE(?cfi, ?cen) AS ?cap2) }
  } GROUP BY ?iso3 ?iso2 ?fi ?en`;
  // Tanska (Q35) erikseen: YK:n jäsen on Tanskan kuningaskunta, jolla ei ole omaa ISO-koodia.
  const r = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(q)}`, {
    headers: { Accept: "application/sparql-results+json", "User-Agent": "Tietoniekka/1.0 (tietoniekka.fi; valtioaineisto)" },
  });
  if (!r.ok) throw new Error(`Wikidata: ${r.status}`);
  return (await r.json()).results.bindings.map((b) => ({
    k: b.iso3.value, iso2: b.iso2?.value.toLowerCase(), fi: b.fi?.value, en: b.en?.value,
    alts: b.alts?.value ? b.alts.value.split("|") : [], caps: b.caps?.value ? b.caps.value.split("|") : [],
  }));
}

const [geo, wd, kanta, dbRajat] = await Promise.all([
  fetch(NE).then((r) => r.json()), wikidata(),
  sb("maat?select=code,name_fi,continent&limit=1000"),
  sb("maiden_rajat?select=country_a,country_b,border_type,accepted&limit=5000"),
]);
if (wd.length !== 193) throw new Error(`Wikidatasta ${wd.length} YK:n jäsenmaata, odotettiin 193`);
const kannasta = new Map(kanta.map((m) => [m.code, m]));
const jasenet = new Set(wd.map((w) => w.k));

// ── Muodot ja nimipisteet Natural Earthista ──
const osat = new Map(), ne = new Map();
for (const f of geo.features) {
  const q = f.properties;
  let k = [q.ISO_A3, q.ISO_A3_EH, q.ADM0_A3].find((x) => x && x !== "-99" && (jasenet.has(x) || YHDISTA[x]));
  if (!k) continue;
  k = YHDISTA[k] ?? k;
  const polyt = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  osat.set(k, [...(osat.get(k) ?? []), ...polyt.flat(1)]); // reiät mukana (Lesotho Etelä-Afrikan sisällä): piirto evenodd-säännöllä
  // Nimipiste vain maan omasta piirteestä: esim. Ashmore- ja Cartiersaarten ISO_A3_EH on AUS.
  if (q.ADM0_A3 === k || q.ISO_A3 === k) ne.set(k, q);
}
const puuttuvat = [...jasenet].filter((k) => !osat.has(k));
if (puuttuvat.length) throw new Error(`Natural Earthista puuttuu: ${puuttuvat}`);

// ── Siluetti: tasavälinen projektio, jonka leveyspiiri kulkee maan keskipisteen kautta. Muoto vastaa tuttuja
//    maailmankarttoja ilman Mercatorin napavenymää; atsimutaalinen kiersi Venäjän ja Kanadan reunat vinoon.
//    Pituusasteet avataan keskipisteen ympäriltä (Fidži, Venäjän Tšukotka, Kiribati päivämäärärajan yli). ──
const R = 6371, rad = Math.PI / 180;
function projektio([lon0, lat0]) {
  const c0 = Math.cos(lat0 * rad);
  return ([lon, lat]) => [R * rad * ((((lon - lon0 + 540) % 360) - 180) * c0), -R * rad * lat];
}
const laatikko = (rs) => {
  const xs = rs.flat().map((p) => p[0]), ys = rs.flat().map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};
const ala = (r) => Math.abs(r.reduce((s, p, i) => { const q = r[(i + 1) % r.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
function yksinkertaista(r, tol) { // Douglas–Peucker; suljettu rengas jaetaan kauimmasta pisteestä kahdeksi kaareksi
  if (r.length < 4) return r;
  const pois = new Uint8Array(r.length);
  let kauin = 1;
  for (let i = 1; i < r.length; i++) if (Math.hypot(r[i][0] - r[0][0], r[i][1] - r[0][1]) > Math.hypot(r[kauin][0] - r[0][0], r[kauin][1] - r[0][1])) kauin = i;
  const pino = [[0, kauin], [kauin, r.length - 1]];
  while (pino.length) {
    const [a, b] = pino.pop();
    let max = 0, ix = -1;
    const [ax, ay] = r[a], [bx, by] = r[b], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * r[i][0] - dx * r[i][1] + bx * ay - by * ax) / l;
      if (d > max) { max = d; ix = i; }
    }
    if (max > tol) pino.push([a, ix], [ix, b]);
    else for (let i = a + 1; i < b; i++) pois[i] = 1;
  }
  return r.filter((_, i) => !pois[i]);
}
const polku = (rs) =>
  rs.map((r) => `M${r[0][0]} ${r[0][1]}l` + r.slice(1).map((q, i) => `${q[0] - r[i][0]} ${q[1] - r[i][1]}`).join(" ").replace(/ -/g, "-") + "z").join("");

function siluetti(k, keski) {
  const p = projektio(keski);
  const pois = SILUETISTA_POIS[k];
  let renkaat = osat.get(k).filter((r) => !pois || !pois(r[0])).map((r) => r.map(p));
  // Kaukaiset osat pois: etäisyys suurimman osan laatikosta yli puolet sen koosta + 300 km (Havaiji, Galápagos, Kanariansaaret).
  const suurin = renkaat.reduce((a, b) => (ala(b) > ala(a) ? b : a));
  const [x0, y0, x1, y1] = laatikko([suurin]);
  const raja = Math.max(x1 - x0, y1 - y0) / 2 + 300;
  renkaat = renkaat.filter((r) => {
    const [a, b, c, d] = laatikko([r]);
    return Math.max(a - x1, x0 - c, 0) <= raja && Math.max(b - y1, y0 - d, 0) <= raja;
  });
  // Painopiste (pinta-alalla painotettu) mukana olevista osista → etäisyyksien keskipiste. Nimipiste on
  // kartan nimiötä varten ja voi olla kaukana keskeltä (Ruotsin nimipiste Lapissa: Ruotsi näkyi Suomesta luoteessa).
  let [sa, sx, sy] = [0, 0, 0];
  for (const r of renkaat) {
    const n = r.length;
    for (let i = 0; i < n; i++) {
      const [x1_, y1_] = r[i], [x2_, y2_] = r[(i + 1) % n], c = x1_ * y2_ - x2_ * y1_;
      sa += c; sx += (x1_ + x2_) * c; sy += (y1_ + y2_) * c;
    }
  }
  const pp = [sx / (3 * sa), sy / (3 * sa)];
  const c0 = Math.cos(keski[1] * rad);
  const painopiste = [((pp[0] / (R * rad * c0) + keski[0] + 540) % 360) - 180, -pp[1] / (R * rad)];
  // Mittakaava: pidempi sivu 1000 yksikköä, keskitettynä 1000 × 1000 -ruutuun.
  const [bx0, by0, bx1, by1] = laatikko(renkaat);
  const s = 1000 / Math.max(bx1 - bx0, by1 - by0);
  const ox = (1000 - (bx1 - bx0) * s) / 2, oy = (1000 - (by1 - by0) * s) / 2;
  const valmiit = [];
  for (const r of renkaat) {
    const q = r.map(([x, y]) => [Math.round((x - bx0) * s + ox), Math.round((y - by0) * s + oy)]);
    const siisti = yksinkertaista(q.filter((v, i) => i === 0 || v[0] !== q[i - 1][0] || v[1] !== q[i - 1][1]), 1.2);
    if (siisti.length >= 4 && ala(siisti) >= 20) valmiit.push(siisti.slice(0, -1));
    else {
      // Pikkusaari näkyy pisteenä (atollivaltiot): 6 yksikön vinoneliö keskelle.
      const [a, b, c, d] = laatikko([q]), cx = Math.round((a + c) / 2), cy = Math.round((b + d) / 2);
      valmiit.push([[cx, cy - 6], [cx + 6, cy], [cx, cy + 6], [cx - 6, cy]]);
    }
  }
  return { d: polku(valmiit), b: laatikko(valmiit), painopiste };
}

// ── Lippu: puuttuvat flag-icons-kopiot (4:3) samaan kokoon kuin Rajanaapureissa (240 × 180) ──
async function lippu(k, iso2) {
  const tiedosto = join(LIPUT, `${k.toLowerCase()}.webp`);
  if (!existsSync(tiedosto)) {
    const r = await fetch(`https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${iso2}.svg`);
    if (!r.ok) throw new Error(`lippu ${k}/${iso2}: ${r.status}`);
    await sharp(Buffer.from(await r.arrayBuffer()), { density: 300 }).resize(240, 180).webp({ quality: 86 }).toFile(tiedosto);
    console.log(`lippu lisätty: ${k}`);
  }
  return `/20/rajanaapurit/liput/${k.toLowerCase()}.webp`;
}

const taita = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-zåäö0-9]/g, "");
const naapurit = new Map();
for (const r of dbRajat) {
  if (r.border_type !== "land" || !r.accepted || !jasenet.has(r.country_a) || !jasenet.has(r.country_b)) continue;
  for (const [a, b] of [[r.country_a, r.country_b], [r.country_b, r.country_a]]) naapurit.set(a, [...(naapurit.get(a) ?? []), b]);
}

const maat = [];
for (const w of wd.sort((a, b) => a.k.localeCompare(b.k))) {
  const db = kannasta.get(w.k), q = ne.get(w.k);
  const n = NIMI[w.k] ?? db?.name_fi.replace(/\s*\(.*\)$/, "") ?? w.fi;
  const m = MAANOSA_KASIN[w.k] ?? (db ? MAANOSA[db.continent] : null) ??
    { Europe: "Eurooppa", Asia: "Aasia", Africa: "Afrikka", Oceania: "Oseania", "South America": "Etelä-Amerikka" }[q.CONTINENT] ??
    (q.SUBREGION === "Caribbean" ? "Karibia" : "Pohjois-Amerikka");
  if (!m) throw new Error(`maanosa puuttuu: ${w.k}`);
  if (!q) throw new Error(`nimipiste puuttuu: ${w.k}`);
  const pk = PK[w.k] ?? (w.caps.length === 1 ? w.caps[0] : null);
  if (!pk) throw new Error(`pääkaupunki epäselvä: ${w.k} ${w.caps}`);
  // Synonyymit: käsin + Wikidatan suomenkieliset muut nimet (ei virallisia muotoja) + englanninkielinen nimi + Wikidatan nimi.
  const syn = [...new Set([...(SYN[w.k] ?? []), ...w.alts.filter((a) => !VIRALLINEN.test(a)), w.en, w.fi, db?.name_fi.replace(/\s*\(.*\)$/, "")])]
    .filter((s) => s && taita(s) !== taita(n));
  // Pääkaupunki paljastaa nimen (Guatemala, Kuwait, Djibouti, Brasília…) → vihje 5 on lippu.
  const pkl = PKL_KASIN.includes(w.k) || [n, ...syn].some((s) => { const a = taita(s), b = taita(pk); return a.length >= 4 && (b.includes(a.slice(0, 5)) || a.includes(b.slice(0, 5))); });
  const { painopiste, ...muoto } = siluetti(w.k, [q.LABEL_X, q.LABEL_Y]); // projektion keskus nimipisteestä
  const keski = PISTE[w.k] ?? painopiste;
  maat.push({
    k: w.k, n, ...(syn.length ? { syn } : {}), m, pk, ...(pkl ? { pkl: true } : {}),
    lat: +keski[1].toFixed(3), lon: +keski[0].toFixed(3),
    ...(naapurit.has(w.k) ? { nr: [...new Set(naapurit.get(w.k))].sort() } : {}),
    ...muoto,
    v: await lippu(w.k, w.iso2),
    taso: TASO_A.includes(w.k) ? "A" : TASO_B.includes(w.k) ? "B" : "C",
  });
}
// Synonyymi, joka sopii kahteen maahan ("Kongo"), ei kelpaa kummallekaan: pelaaja valitsee listasta.
const kaytot = new Map();
for (const m of maat) for (const x of [m.n, ...(m.syn ?? [])]) kaytot.set(taita(x), (kaytot.get(taita(x)) ?? 0) + 1);
for (const m of maat) if (m.syn) {
  m.syn = m.syn.filter((x) => kaytot.get(taita(x)) === 1);
  if (!m.syn.length) delete m.syn;
}
for (const k of [...TASO_A, ...TASO_B]) if (!jasenet.has(k)) throw new Error(`tasolistassa tuntematon koodi: ${k}`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  lahde: `Muodot: Natural Earth 1:50 milj. (public domain). Nimet ja pääkaupungit: Wikidata (CC0) ja Tietoniekan maat-taulu. Liput: flag-icons (MIT). Generoitu ${new Date().toISOString().slice(0, 10)}.`,
  maat,
}));
const t = (x) => maat.filter((m) => m.taso === x).length;
console.log(`${maat.length} maata (A ${t("A")}, B ${t("B")}, C ${t("C")}), ${Math.round(JSON.stringify(maat).length / 1024)} kt`);
console.log(`Lippu vihjeenä 5 (pääkaupunki paljastaa): ${maat.filter((m) => m.pkl).map((m) => `${m.n}/${m.pk}`).join(", ")}`);
