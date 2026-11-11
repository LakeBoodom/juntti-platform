// TIETOMALLIN VAIHE B — tarkistus (11.11.2026)
//   1. Mittarisääntö: eri metric → ei paria (Kumpi?) eikä samaan ketjuun (Järjestä oikein).
//   2. Monen kindin määrittely: start_year (kinds = recurring_event + attraction) → sekapooli.
//      Pilotin entiteetit ovat luonnoksia, joten aineisto on service rolella haettu ote kannasta
//      (alla, 11.11.2026). Luonnoksia ei julkaista eikä enabled-kytkintä käännetä.
//   3. groupKey rajaa poolin.
//   4. allowedNotability-taulukko kaikille yhdistelmille.
//   5. getFacts anon-avaimella (Jari Litmanen: 5 vihjettä, tasot 1–5) ja getTimeline (RLS piilottaa luonnokset).
//   6. Nykyiset pelit: Kumpi?/Järjestä oikein julkaistulla datalla, Laita järjestykseen -pakat ja päivän rivit.
//   7. Vaihe B2: päivän rivit eivät riipu kannan rivijärjestyksestä (pooli sekoitettu välissä), rajapäivä.
// Ajo (apps/tietoniekka): NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/run-ts.cjs scripts/tietomalli-tarkistus.ts

import { DUEL_THEMES, domainDistance, getDuelData, makeDuel, poolFor, rakennaDuelData } from "@/lib/duel";
import { makeRankTask } from "@/lib/rank";
import { mittaritSopivat, mittariSopiiKaikille, maarittelynKindit } from "@/lib/vertailu";
import { allowedNotability, getFacts, getTimeline, type Level, type PoolScope } from "@/lib/factPool";
import { JULKAISTUT } from "@/lib/jarjesta/pakat";
import { haeJarjestysKierros, haePaivanRivi } from "@/lib/jarjesta/kierros";
import { arvoPaivanRivi } from "@/lib/jarjesta/arvonta";
import { haePool } from "@/lib/jarjesta/pooli";
import { paivaAvain } from "@/lib/jarjesta/siemen";
import { VAKAA_JARJESTYS_ALKAEN, vakaasti } from "@/lib/vakaaJarjestys";
import { arvoSarja, type KysymysRivi } from "@/lib/tuplaTaiKuitti";
import { getSupabase } from "@/lib/supabase";

let virheet = 0;
const virhe = (s: string) => { virheet++; console.log(`  VIRHE: ${s}`); };
const ok = (ehto: boolean, s: string) => (ehto ? console.log(`  ok: ${s}`) : virhe(s));

/* ─── Ote kannasta (service role, 11.11.2026): start_year- ja ev_attendance-rivit ───
   Mittarit siivouksen jälkeen (11.11.): start_year-riveillä ei mittaria, muilla pelkät koodit. */
type A = { attr_key: string; scope: string; num_value: number | null; display_value: string | null; metric: string | null };
const ent = (id: string, name: string, kind: string, group_key: string, domain: string | null, attrs: A[]) =>
  ({ id, name, kind, role_label: null, show_role: true, domain, group_key, image_url: null, lat: null, lon: null, name_partitive: null, fact_attributes: attrs });
const sy = (v: number, metric: string | null = null): A => ({ attr_key: "start_year", scope: "", num_value: v, display_value: String(v), metric });
const OTE = [
  ent("85d2accb-667e-4c88-81cc-00451aef3ccb", "Pori Jazz", "recurring_event", "festivaali", "kesa", [sy(1966), { attr_key: "ev_attendance", scope: "", num_value: 32000, display_value: "32 000 (pääkonsertit 2024)", metric: "main_concert_attendance" }]),
  ent("6c004072-4fee-4153-828c-faaa4239dea8", "Eukonkannon MM", "recurring_event", "hauska_mm", "kesa", [{ attr_key: "ev_attendance", scope: "", num_value: 2000, display_value: "noin 2 000 katsojaa (2025)", metric: "spectators" }]),
  ent("f222d18e-6f61-486b-b466-46494618eb90", "Jukolan viesti", "recurring_event", "urheilutapahtuma", "kesa", [sy(1949), { attr_key: "ev_teams", scope: "", num_value: 1879, display_value: "1 879 joukkuetta (2026)", metric: "teams_started" }]),
  ent("2bfbb7f3-2739-49d3-8be8-7463bcbf5bbc", "Rauman Pitsiviikko", "recurring_event", "kaupunkifestivaali", "kesa", [sy(1971)]),
  ent("c28009c3-9b28-4906-bfad-34a6f8becbcf", "Särkänniemi", "attraction", "huvipuisto", "kesa", [sy(1975), { attr_key: "attr_season", scope: "", num_value: null, display_value: "huhti–lokakuu", metric: null }]),
  ent("4c46d32d-154f-4607-8d85-52b8114c74a8", "Tuomaan Markkinat", "recurring_event", "helsinki-talvi", null, [sy(1994)]),
  ent("2fbb91ab-d3e4-4b39-af75-6e37a3d34449", "Joulupukin Pajakylä", "attraction", "rovaniemi-joulu", null, [sy(1985)]),
  ent("e70c10fe-67cc-44eb-85c5-2c000a7f29b4", "Rovaniemen kirkko", "attraction", "rovaniemi-jalleenrakennus", null, [sy(1950)]),
  ent("7b85a117-c6e3-4993-89a1-e27ecc3e288e", "Föri", "attraction", "turun-eriskummallisuudet", null, [sy(1904)]),
];
const START_YEAR = { attr_key: "start_year", kind: "recurring_event", kinds: ["recurring_event", "attraction"], theme: "kesa", question_text: "on vanhempi?", winner: "low", easy_gap: 18, mid_gap: 7, compare_mode: "numeric", fact_template: "{a}: vuodesta {aarvo}, {b}: vuodesta {barvo}.", max_gap: 80, min_gap: 2, gap_mode: "absolute", gap_divisor: 1, max_domain_distance: 1, rank_label: "vanhimmasta uusimpaan", rank_label_rev: "uusimmasta vanhimpaan" };
const EV_ATT = { ...START_YEAR, attr_key: "ev_attendance", kinds: ["recurring_event"], gap_mode: "relative", easy_gap: 0.6, mid_gap: 0.3, max_gap: null, min_gap: null, question_text: "keräsi enemmän yleisöä?", winner: "high" };
const VANHA = { ...START_YEAR, attr_key: "start_year", kinds: null }; // kinds NULL → vain kind
const KATEGORIA = { ...START_YEAR, attr_key: "organizer", compare_mode: "category" };


async function main() {
  console.log("1. Mittarisääntö (yksikkötestit)");
  ok(mittaritSopivat(null, null), "NULL + NULL → pari sallittu");
  ok(mittaritSopivat("spectators", null), "mittari + NULL → pari sallittu (vanha rivi)");
  ok(mittaritSopivat("spectators", "spectators"), "sama mittari → pari sallittu");
  ok(!mittaritSopivat("main_concert_attendance", "spectators"), "eri mittari → EI paria");
  ok(!mittariSopiiKaikille("x", ["y", null]), "ketju: x ei sovi joukkoon [y, NULL]");
  ok(mittariSopiiKaikille(null, ["x", "y"]), "ketju: NULL sopii joukkoon [x, y]");
  ok(maarittelynKindit("person", null).join() === "person" && maarittelynKindit("a", ["b", "c"]).join() === "b,c", "kinds NULL → [kind], muuten kinds");

  const ev = rakennaDuelData(OTE, [EV_ATT]);
  ok(ev.defs.length === 0, "ev_attendance: Pori Jazz (main_concert_attendance) vs Eukonkanto (spectators) → määrittely ei käyttökelpoinen");
  // Kolmas festivaali samalla mittarilla → määrittely kelpaa, mutta Eukonkanto (spectators) ei saa pariksi kummallekaan.
  const KOPIO = ent("00000000-0000-4000-8000-000000000001", "Testifestivaali", "recurring_event", "festivaali", "kesa", [{ attr_key: "ev_attendance", scope: "", num_value: 12000, display_value: "12 000", metric: "main_concert_attendance" }]);
  const ev3 = rakennaDuelData([...OTE, KOPIO], [EV_ATT]);
  ok(ev3.defs.length === 1, "ev_attendance + samanmittarinen kolmas → määrittely käyttökelpoinen");
  const EUKKO = "6c004072-4fee-4153-828c-faaa4239dea8";
  let parit = 0;
  let eukko = 0;
  for (let i = 0; i < 300; i++) {
    const x = makeDuel(ev3, "sekoitus", new Set());
    if (!x) continue;
    parit++;
    if (x.a.id === EUKKO || x.b.id === EUKKO) eukko++;
  }
  ok(parit > 0 && eukko === 0, `makeDuel 300 kertaa: ${parit} paria, joista Eukonkannon MM mukana ${eukko} (odotus 0)`);
  const rankData = { ...ev3, defs: ev3.defs.map((x) => ({ ...x, rankLabel: "suurimmasta pienimpään" })) };
  let ketjut = 0;
  for (let i = 0; i < 100; i++) {
    const r = makeRankTask(rankData, "sekoitus", new Set());
    if (r && r.solution.some((x) => x.entity.id === EUKKO)) ketjut++;
  }
  ok(ketjut === 0, `makeRankTask: Eukonkanto samassa ketjussa eri mittarin kanssa ${ketjut} kertaa (odotus 0)`);

  console.log("2. Monen kindin määrittely: start_year (kinds = recurring_event + attraction)");
  const d = rakennaDuelData(OTE, [START_YEAR, KATEGORIA]);
  ok(d.defs.length === 1 && d.defs[0].key === "start_year", "category-moodin määrittely ohitetaan, start_year käyttökelpoinen");
  const pool = poolFor(d.entities, d.defs[0]);
  const kindit = new Set(pool.map((e) => e.kind));
  console.log(`  pooli (${pool.length}): ${pool.map((e) => `${e.name} [${e.kind}${e.m.start_year ? ", " + e.m.start_year : ""}]`).join(", ")}`);
  ok(kindit.has("recurring_event") && kindit.has("attraction"), "poolissa sekä recurring_event että attraction");
  const vanha = rakennaDuelData(OTE, [VANHA]);
  ok(poolFor(vanha.entities, vanha.defs[0]).every((e) => e.kind === "recurring_event"), "kinds NULL → vain kind (recurring_event)");
  const nahty = new Set<string>();
  let sekapareja = 0;
  let kiellettyja = 0;
  for (let i = 0; i < 400; i++) {
    const duel = makeDuel(d, "kesa", nahty);
    if (!duel) break;
    if (duel.a.kind !== duel.b.kind) sekapareja++;
    if (!mittaritSopivat(duel.a.m.start_year, duel.b.m.start_year)) kiellettyja++;
    if (i < 3) console.log(`  esim: ${duel.def.subject} ${duel.a.name} vai ${duel.b.name} ${duel.question} → ${duel.correct === 0 ? duel.a.name : duel.b.name} (${duel.difficulty}); ${duel.fact}`);
  }
  ok(nahty.size > 0 && sekapareja > 0, `${nahty.size} eri paria, joista ${sekapareja} recurring_event × attraction`);
  ok(kiellettyja === 0, `ei yhtään paria eri mittareilla (avausvuosi × valmistumisvuosi tms.): ${kiellettyja}`);
  ok(domainDistance("kesa", "kesa") === 0 && 0 <= d.defs[0].maxDomainDistance, "domain 'kesa' × 'kesa' = etäisyys 0 (max_domain_distance 1 sallii)");
  const rank = makeRankTask(d, "kesa", new Set());
  ok(!!rank, `Järjestä oikein start_year: ${rank ? rank.solution.map((x) => `${x.entity.name} ${x.display}`).join(" → ") : "ei tehtävää"}`);
  if (rank) {
    const m = rank.solution.map((x) => x.entity.m.start_year ?? null);
    ok(m.every((a, i) => m.every((b, j) => i === j || mittaritSopivat(a, b))), "ketjussa vain yhteensopivat mittarit");
  }

  console.log("3. groupKey");
  const fest = poolFor(d.entities, d.defs[0], { groupKey: "festivaali" });
  ok(fest.length === 1 && fest[0].name === "Pori Jazz", `groupKey 'festivaali' → ${fest.map((e) => e.name).join(", ")}`);
  ok(makeDuel(d, "kesa", new Set(), { groupKey: "festivaali" }) === null, "yhden festivaalin ryhmästä ei synny paria");
  const huvi = poolFor(d.entities, d.defs[0], { groupKey: "huvipuisto" });
  ok(huvi.length === 1 && huvi[0].kind === "attraction", "groupKey 'huvipuisto' → Särkänniemi");

  console.log("4. allowedNotability");
  const tasot: Level[] = ["helppo", "keski", "vaikea"];
  console.log("  scope   mode       helppo   keski    vaikea");
  for (const scope of ["entity", "group", "mixed"] as PoolScope[])
    for (const mode of ["recall", "deduction"] as const)
      console.log(`  ${scope.padEnd(7)} ${mode.padEnd(10)} ${tasot.map((t) => `[${allowedNotability(scope, t, mode).join(",")}]`.padEnd(8)).join(" ")}`);
  ok(allowedNotability("entity", "vaikea", "deduction").join() === "3,2,1", "entity/vaikea/deduction = [3,2,1]");
  ok(allowedNotability("entity", "vaikea", "recall").join() === "3,2", "entity/vaikea/recall = [3,2]");
  ok(allowedNotability("mixed", "vaikea", "deduction").join() === "3", "mixed = aina [3]");

  console.log("5. getFacts ja getTimeline (anon-avain)");
  const LITMANEN = "65244b57-2ebe-43cd-ab14-669cad9abcab";
  const vihjeet = await getFacts([LITMANEN], { factType: "clue", notability: [1, 2, 3] });
  for (const v of vihjeet) console.log(`  taso ${v.clue_level} (notability ${v.notability}): ${v.text}`);
  ok(vihjeet.length === 5 && vihjeet.map((v) => v.clue_level).join() === "1,2,3,4,5", `Litmanen: ${vihjeet.length} vihjettä, tasot ${vihjeet.map((v) => v.clue_level).join(",")}`);
  const helpot = await getFacts([LITMANEN], { factType: "clue", notability: allowedNotability("entity", "helppo", "recall") });
  ok(helpot.every((v) => v.notability === 3) && helpot.length > 0, `entity/helppo → vain notability 3: ${helpot.length} vihjettä`);
  const tarinat = await getFacts([LITMANEN], { factType: "story", notability: [1, 2, 3] });
  ok(tarinat.length > 0 && tarinat.every((t) => t.clue_level === null), `Litmanen: ${tarinat.length} tarinaa`);
  const pilotti = OTE.slice(0, 5).map((e) => e.id);
  const aikajana = await getTimeline(pilotti, { notability: [1, 2, 3] });
  const pilottiFaktat = await getFacts(pilotti, { factType: "story", notability: [1, 2, 3] });
  ok(aikajana.length === 0 && pilottiFaktat.length === 0, `pilotin luonnokset eivät näy anonille (aikajana ${aikajana.length}, faktat ${pilottiFaktat.length})`);

  console.log("6. Nykyiset pelit julkaistulla datalla (anon)");
  const live = await getDuelData();
  if (!live) virhe("getDuelData palautti null");
  else {
    const kinds = [...new Set(live.entities.map((e) => e.kind))].sort();
    console.log(`  ${live.entities.length} entiteettiä (${kinds.join(", ")}), ${live.defs.length} käytössä olevaa määrittelyä: ${live.defs.map((x) => x.key).join(", ")}`);
    ok(!kinds.includes("recurring_event") && !kinds.includes("attraction"), "luonnoskindit eivät näy julkiselle Kumpi?-datalle");
    for (const t of DUEL_THEMES) {
      const used = new Set<string>();
      let n = 0;
      for (let i = 0; i < 40; i++) if (makeDuel(live, t.id, used)) n++;
      const r = makeRankTask(live, t.id, new Set());
      const odotus = live.defs.some((x) => t.id === "sekoitus" || x.theme === t.id);
      ok(!odotus || n > 0, `Kumpi? ${t.id}: ${n}/40 kysymystä, Järjestä oikein: ${r ? r.solution.length + " kohdetta" : "ei"}`);
    }
    // scope='' : seurakohtaiset rivit eivät ylikirjoita uran arvoa
    const seura = live.entities.filter((e) => e.v.liiga_points !== undefined).length;
    console.log(`  (B1) uran liiga_points ${seura} pelaajalla; Tappara-rivit eivät ole Kumpi?-datassa`);
  }
  for (const p of JULKAISTUT) {
    const k = await haeJarjestysKierros(p.slug);
    const rivi = await haePaivanRivi(p.slug, "2026-11-11");
    ok(k.length === p.pick, `Laita järjestykseen ${p.slug}: kierros ${k.length}/${p.pick}, päivän rivi ${rivi.map((x) => x.name).join(" | ")}`);
  }

  console.log("7. Vaihe B2: päivän rivien vakaa järjestys");
  const ennen = new Date(Date.parse(`${VAKAA_JARJESTYS_ALKAEN}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  const kaanteinen = [{ id: "b" }, { id: "a" }];
  ok(vakaasti(kaanteinen, (x) => x.id, ennen).map((x) => x.id).join() === "b,a", `ennen rajaa (${ennen}): kannan järjestys kuten ennen`);
  ok(vakaasti(kaanteinen, (x) => x.id, VAKAA_JARJESTYS_ALKAEN).map((x) => x.id).join() === "a,b", `rajasta (${VAKAA_JARJESTYS_ALKAEN}) alkaen: id-järjestys`);
  /** Sekoitus Math.randomilla: eri järjestys joka ajolla, kuten kannan vaihtuva rivijärjestys. */
  const sekaisin = <T,>(a: T[]) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const huomenna = new Date(Date.now() + 86_400_000);
  const alku = paivaAvain(huomenna) > VAKAA_JARJESTYS_ALKAEN ? paivaAvain(huomenna) : VAKAA_JARJESTYS_ALKAEN;
  const paivat = [0, 1, 2].map((n) => new Date(Date.parse(`${alku}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10));
  let eroja = 0;
  let riveja = 0;
  for (const p of JULKAISTUT) {
    const pooli = await haePool(p);
    for (const pv of paivat) {
      const a = arvoPaivanRivi(p, pooli, p.slug, pv).map((x) => x.id).join();
      for (const toinen of [sekaisin(pooli), pooli.slice().reverse()]) {
        riveja++;
        if (arvoPaivanRivi(p, toinen, p.slug, pv).map((x) => x.id).join() !== a) {
          eroja++;
          virhe(`${p.slug} ${pv}: rivi muuttui, kun pooli sekoitettiin`);
        }
      }
      if (p.slug === "presidentit")
        console.log(`  ${pv} presidentit: ${arvoPaivanRivi(p, pooli, p.slug, pv).map((x) => x.name).join(" | ")}`);
    }
  }
  // Kontrolli: ennen rajaa (vanha käytös) sama sekoitus muuttaa rivejä, eli testi todella mittaa järjestysriippuvuutta.
  let kontrolli = 0;
  for (const p of JULKAISTUT) {
    const pooli = await haePool(p);
    if (arvoPaivanRivi(p, pooli, p.slug, ennen).map((x) => x.id).join() !== arvoPaivanRivi(p, pooli.slice().reverse(), p.slug, ennen).map((x) => x.id).join()) kontrolli++;
  }
  ok(kontrolli > 0, `kontrolli: ilman vakaata järjestystä käänteinen pooli muuttaa ${kontrolli}/${JULKAISTUT.length} pakan rivin`);
  ok(eroja === 0, `Laita järjestykseen: ${JULKAISTUT.length} pakkaa × ${paivat.length} päivää (${paivat.join(", ")}), ${riveja} vertailua sekoitettuun pooliin, eroja ${eroja}`);
  // Ennen rajaa sama kuin ennen muutosta: kannan järjestyksessä (haePaivanRivi = arvoPaivanRivi kannan poolilla).
  const pres = JULKAISTUT.find((p) => p.slug === "presidentit")!;
  ok((await haePaivanRivi(pres.slug, ennen)).map((x) => x.id).join() === arvoPaivanRivi(pres, await haePool(pres), pres.slug, ennen).map((x) => x.id).join(), `presidentit ${ennen}: ennen rajaa kannan järjestys (ennallaan)`);

  const sb = getSupabase()!;
  const { data: kys } = await sb.from("questions").select("id, quiz_id, question_text, explanation, answers, taso").not("taso", "is", null).is("image_url", null).limit(600);
  const kysRivit = (kys ?? []) as unknown as KysymysRivi[];
  let tuplaErot = 0;
  for (const pv of paivat) {
    const siem = `testi-${pv}`;
    const a = arvoSarja(kysRivit, new Map(), siem, pv).map((x) => x.id).join();
    if (arvoSarja(sekaisin(kysRivit), new Map(), siem, pv).map((x) => x.id).join() !== a) tuplaErot++;
  }
  ok(kysRivit.length > 50 && tuplaErot === 0, `Tupla tai kuitti: ${kysRivit.length} kysymystä, sarja sama sekoitetulla poolilla ${paivat.length} päivänä (eroja ${tuplaErot})`);

  console.log(virheet ? `\n${virheet} VIRHETTÄ` : "\nKaikki tarkistukset ok");
  process.exit(virheet ? 1 : 0);
}

main();
