// ÄÄNIVISAT — datan tuonti (brief §3, 8.10.2026).
//
//   node scripts/run-ts.cjs scripts/import-aanivisat.ts <AANIVISAT_DATA.json> > tuonti.sql
//
// Tulostaa SQL:n, joka ajetaan kantaan (Supabase MCP / SQL-editori; koneella ei ole service role
// -avainta, joten skripti ei kirjoita kantaan itse). Idempotentti: upsert (site_id, ryhma, tunniste).
//
//   1. aanivisat-rivit tilassa active=false (julkaisu = Heikin hyväksyntä previewssä → active=true).
//      Äänet ja sonogrammit ovat sivuston omassa public-kansiossa (public/20/aanivisat/<ryhmä>/…),
//      ei Supabase-bucketissa: koneella ei ole kirjoitusavainta storageen. Polut ovat site-relatiivisia.
//   2. Paljastuskuva: "kuvavisa:<Laji>" → kuvavisas.image_url (type linnut, aktiivinen); "HAE_COMMONS"
//      → public/20/aanivisat/<ryhmä>/kuvat/<tunniste>.webp. Tekijä, lisenssi ja Commons-sivu tulevat
//      tiedostosta scripts/data/aanivisat-kuvat.json (haettu Commonsin tiedostosivuilta).
//   3. Commons-kuvat lisätään myös kuvavisas-tauluun (type linnut, active=false — aktivoidaan samalla
//      kun äänivisa julkaistaan), ja olemassa olevien lintukuvien yleinen "Wikipedia / Wikimedia
//      Commons" -krediitti tarkennetaan tekijäksi ja lisenssiksi.
//   4. aani_havainto_url: datassa GBIF-havainto; kantaan päivitettiin 9.10.2026 iNaturalist-havaintosivut
//      (GBIF:n references-kenttä). Uusi tuonti ei korvaa iNaturalist-linkkiä GBIF-linkillä.
import fs from "node:fs";
import path from "node:path";

const SITE_ID = "62d75f45-a857-4fdd-9a45-b70ceeee98a8";

type Aani = {
  tunniste: string; ryhma: string; laji: string; tieteellinen: string; aanityyppi: string; vaikeus: string;
  similarity_group: string; distractor_pool: string[]; fakta: string; audio: string; jakso_s: number; tauko_s: number; kesto_s: number;
  sonogrammi: string; aani_tekija: string; aani_lisenssi: string; aani_lahde_url: string; aani_havainto_url?: string; aani_maa: string; kuva: string;
};
type Kuva = { lahde: "kuvavisa" | "commons"; tekija: string; lisenssi: string; sivu: string; vaikeus_kuva?: string; tag?: string };

// run-ts.cjs: argv[2] = tämä skripti, argv[3] = datatiedosto.
const [dataPolku] = process.argv.slice(3);
if (!dataPolku) throw new Error("Anna AANIVISAT_DATA.json-polku");
const data = JSON.parse(fs.readFileSync(dataPolku, "utf8")) as { sonogrammi: { ticks: unknown }; aanet: Aani[] };
const kuvat = JSON.parse(fs.readFileSync(path.join(__dirname, "data/aanivisat-kuvat.json"), "utf8")) as Record<string, Kuva>;

const q = (s: string | null | undefined) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const j = (x: unknown) => `${q(JSON.stringify(x))}::jsonb`;
const polku = (ryhma: string, alikansio: string, tiedosto: string) => `/20/aanivisat/${ryhma}/${alikansio}/${tiedosto}`;

const aaniRivit: string[] = [];
const uudetKuvat: string[] = [];
const krediitit: string[] = [];

for (const a of data.aanet) {
  const kv = kuvat[a.tunniste];
  if (!kv) throw new Error(`Kuvan lähdetiedot puuttuvat: ${a.tunniste}`);
  const audio = polku(a.ryhma, "aanet", path.basename(a.audio));
  const sono = polku(a.ryhma, "sono", path.basename(a.sonogrammi).replace(/\.png$/, ".webp"));
  const kuvavisaLaji = a.kuva.startsWith("kuvavisa:") ? a.kuva.slice("kuvavisa:".length) : null;
  const kuvaUrl = kuvavisaLaji
    ? `(select image_url from kuvavisas where site_id = '${SITE_ID}' and type = 'linnut' and correct_option = ${q(kuvavisaLaji)} and active order by sort_order limit 1)`
    : q(polku(a.ryhma, "kuvat", `${a.tunniste}.webp`));
  aaniRivit.push(`('${SITE_ID}', ${q(a.tunniste)}, ${q(a.ryhma)}, ${q(a.laji)}, ${q(a.tieteellinen)}, ${q(a.aanityyppi)}, ${q(a.vaikeus)}, ${q(a.similarity_group)}, ${j(a.distractor_pool)}, ${q(a.fakta)}, ${q(audio)}, ${a.jakso_s}, ${a.tauko_s}, ${a.kesto_s}, ${q(sono)}, ${q(a.aani_tekija)}, ${q(a.aani_lisenssi)}, ${q(a.aani_lahde_url)}, ${q(a.aani_havainto_url ?? null)}, ${q(a.aani_maa)}, ${kuvaUrl}, ${q(kv.tekija)}, ${q(kv.lisenssi)}, ${q(kv.sivu)})`);
  const krediitti = `${kv.tekija} / Wikimedia Commons, ${kv.lisenssi}`;
  const huom = `${kv.lisenssi}, ${kv.sivu}`;
  if (kuvavisaLaji) {
    // Olemassa olevan kuvavisakuvan lähdemerkintä tarkemmaksi (brief §3.2).
    krediitit.push(`(${q(kuvavisaLaji)}, ${q(krediitti)}, ${q(huom)})`);
  } else {
    // Uusi lintukuva myös kuvavisaan (piilossa, kunnes äänivisa julkaistaan).
    uudetKuvat.push(`(${q(a.laji)}, ${q(polku(a.ryhma, "kuvat", `${a.tunniste}.webp`))}, ${j([a.laji, ...a.distractor_pool.slice(0, 3)])}, ${q(a.fakta)}, ${q(kv.vaikeus_kuva ?? "keski")}, ${q(kv.tag ?? "pienet_lauluvarpuslinnut")}, ${q(a.similarity_group)}, ${j(a.distractor_pool)}, ${q(krediitti)}, ${q(huom)})`);
  }
}

const ulos = `-- Äänivisat: tuonti ${new Date().toISOString().slice(0, 10)} (scripts/import-aanivisat.ts)
insert into aanivisat (site_id, tunniste, ryhma, laji, tieteellinen, aanityyppi, vaikeus, similarity_group, distractor_pool, fakta,
  audio_url, jakso_s, tauko_s, kesto_s, sono_url, aani_tekija, aani_lisenssi, aani_lahde_url, aani_havainto_url, aani_maa,
  kuva_url, kuva_tekija, kuva_lisenssi, kuva_lahde_url)
values
${aaniRivit.join(",\n")}
on conflict (site_id, ryhma, tunniste) do update set
  laji = excluded.laji, tieteellinen = excluded.tieteellinen, aanityyppi = excluded.aanityyppi, vaikeus = excluded.vaikeus,
  similarity_group = excluded.similarity_group, distractor_pool = excluded.distractor_pool, fakta = excluded.fakta,
  audio_url = excluded.audio_url, jakso_s = excluded.jakso_s, tauko_s = excluded.tauko_s, kesto_s = excluded.kesto_s,
  sono_url = excluded.sono_url, aani_tekija = excluded.aani_tekija, aani_lisenssi = excluded.aani_lisenssi,
  aani_lahde_url = excluded.aani_lahde_url, aani_havainto_url = case when aanivisat.aani_havainto_url like 'https://www.inaturalist.org/%' and excluded.aani_havainto_url like 'https://www.gbif.org/%' then aanivisat.aani_havainto_url else excluded.aani_havainto_url end, aani_maa = excluded.aani_maa,
  kuva_url = excluded.kuva_url, kuva_tekija = excluded.kuva_tekija, kuva_lisenssi = excluded.kuva_lisenssi, kuva_lahde_url = excluded.kuva_lahde_url,
  updated_at = now();
update aanivisat set sono_ticks = ${j(data.sonogrammi.ticks)} where site_id = '${SITE_ID}';
update kuvavisas k set source_credit = v.krediitti, license_note = v.huom, updated_at = now()
  from (values
${krediitit.join(",\n")}
  ) v(laji, krediitti, huom)
 where k.site_id = '${SITE_ID}' and k.type = 'linnut' and k.correct_option = v.laji;
insert into kuvavisas (site_id, type, question, image_url, options, correct_option, fact, active, difficulty, weight, tags,
  similarity_group, distractor_pool, source_credit, license_note, sort_order)
select '${SITE_ID}', 'linnut', 'Mikä lintu on kuvassa?', v.kuva, v.vaihtoehdot, v.laji, v.fakta, false, v.vaikeus, 1, array[v.tag],
  v.sg, v.dp, v.krediitti, v.huom,
  (select coalesce(max(sort_order), 0) from kuvavisas where site_id = '${SITE_ID}' and type = 'linnut') + row_number() over ()
  from (values
${uudetKuvat.join(",\n")}
  ) v(laji, kuva, vaihtoehdot, fakta, vaikeus, tag, sg, dp, krediitti, huom)
 where not exists (select 1 from kuvavisas where site_id = '${SITE_ID}' and type = 'linnut' and correct_option = v.laji);
`;
process.stdout.write(ulos);
