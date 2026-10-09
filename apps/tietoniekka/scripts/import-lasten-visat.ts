// LASTEN VISAT — datan tuonti (TOTEUTUSBRIEF_LASTEN_VISAT.md §3, 9.10.2026).
//
//   node scripts/run-ts.cjs scripts/import-lasten-visat.ts <LASTEN_VISAT_DATA.json> <ulos-kansio> <kuvavisa-kartta.json>
//
// kuvavisa-kartta.json = { "<Laji>": { image_url, source_credit, license_note } } aktiivisista kuvavisas-riveistä
// (haetaan Supabase MCP:llä: select json_object_agg(correct_option, …) from kuvavisas where active …).
// Krediitit kopioituvat tuontihetken tilassa: aja tuonti uudelleen, kun kuvavisan krediittejä tarkennetaan.
//
// Kirjoittaa ulos-kansioon yhden SQL-tiedoston per visa (ajetaan Supabase MCP:llä; koneella ei ole
// service role -avainta, joten skripti ei kirjoita kantaan itse) ja tulostaa raportin.
// Idempotentti: visa upsert slugin mukaan (status säilyy, jos visa on jo julkaistu), kysymykset
// päivitetään/lisätään sort_orderin mukaan ja ylimääräiset poistetaan. Aja uudelleen, kun kuvia tulee.
//
//   * Äänet: public/aanet/lapset/<joulu|elaimet>/<nimi>.mp3 (visan audio_folder), eläinäänet
//     public/aanet/lapset/elainaanet/. Storage-bucketin sijaan sivuston public-kansio (ei kirjoitusavainta).
//   * Kuvat: "kuvavisa:<Laji>" → kuvavisas.image_url (aktiivinen) + source_credit/license_note kartasta.
//     Muut (TUOTETTAVA, kuvatuotannon CSV) → public/20/lapset/<tiedosto>.webp, jos tiedosto on olemassa:
//     kysymyskuva v<n>-k<nn>, vastauskuva v<n>-k<nn>-<vastaus>, pääkuva hero-v<n>. Puuttuva → null + raportti.
import fs from "node:fs";
import path from "node:path";

const SITE_ID = "62d75f45-a857-4fdd-9a45-b70ceeee98a8";
const PUBLIC = path.join(__dirname, "..", "public");

type Vastaus = { text: string; is_correct: boolean; image: string | null };
type Elainaani = { laji: string; tieteellinen: string; tiedosto: string; tekija: string; lisenssi: string; lahde: string; lahde_url: string };
type Kysymys = {
  sort_order: number; question_text: string; question_type: string; question_image: string | null; answers: Vastaus[];
  vihje_laura: string | null; vihje_mikko: string | null; explanation: string | null; animal_sound: Elainaani | null;
  audio: Record<string, string | null> | null; spoken_text: string | null;
};
type Visa = {
  code: string; title: string; slug: string; target_age: string; lukija: string; lasten_aihe: string; description: string;
  status: string; audio_folder: string; questions: Kysymys[];
};

const [dataPolku, ulos, karttaPolku] = process.argv.slice(3);
if (!dataPolku || !ulos || !karttaPolku) {
  console.error("käyttö: import-lasten-visat.ts <LASTEN_VISAT_DATA.json> <ulos-kansio> <kuvavisa-kartta.json>");
  process.exit(1);
}
type KvRivi = { image_url: string; source_credit: string | null; license_note: string | null };
const kartta = JSON.parse(fs.readFileSync(karttaPolku, "utf8")) as Record<string, KvRivi>;
/** Datan lajinimi → kuvavisan correct_option, kun ne eroavat. */
const ALIAS: Record<string, string> = { Karhu: "Ruskeakarhu" };
const data = JSON.parse(fs.readFileSync(dataPolku, "utf8")) as { quizzes: Visa[] };
fs.mkdirSync(ulos, { recursive: true });

const q = (s: string | null | undefined) => (s == null ? "null" : `'${s.replace(/'/g, "''")}'`);
const ascii = (s: string) => s.normalize("NFC").toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/å/g, "a");
const tiedostoksi = (s: string) => ascii(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kuvaPolku = (nimi: string) => {
  const p = `/20/lapset/${nimi}.webp`;
  return fs.existsSync(path.join(PUBLIC, p)) ? p : null;
};
const nro = (k: Kysymys) => String(k.sort_order + 1).padStart(2, "0");

const raportti: string[] = [];
const kv = (laji: string, kohta: string): KvRivi | null => {
  const r = kartta[ALIAS[laji] ?? laji] ?? null;
  if (!r) raportti.push(`${kohta}: kuvavisasta ei löydy lajia ${laji}`);
  return r;
};

let kysymyksia = 0;

for (const v of data.quizzes) {
  const kansio = v.audio_folder.includes("joulu") ? "joulu" : "elaimet";
  const aani = (nimi: string | null | undefined) => (nimi ? `/aanet/lapset/${kansio}/${nimi}.mp3` : null);
  const collection = v.code.match(/^v[1-4]$/) ? "juhlat" : "luonto";
  const category = collection === "juhlat" ? "juhlat-ja-perinteet" : "luonto";
  const hero = kuvaPolku(`hero-${v.code}`);
  if (!hero) raportti.push(`${v.code}: pääkuva hero-${v.code} puuttuu`);

  const rivit = v.questions.map((k) => {
    kysymyksia++;
    // Kysymyskuva
    let kuva = "null", krediitti = "null", lisenssi = "null";
    const qi = k.question_image ?? "";
    // "PUUTTUU: <Laji> (…)": laji haetaan kuvavisasta, jos se on lisätty sinne myöhemmin (Talitiainen 9.10.).
    const puuttuu = qi.match(/^PUUTTUU:\s*([^\s(]+)/)?.[1];
    if (qi.startsWith("kuvavisa:") || puuttuu) {
      const laji = puuttuu ?? qi.slice("kuvavisa:".length).trim();
      const r = kv(laji, `${v.code} k${nro(k)} kysymyskuva`);
      if (r) { kuva = q(r.image_url); krediitti = q(r.source_credit); lisenssi = q(r.license_note); }
    } else {
      const p = kuvaPolku(`${v.code}-k${nro(k)}`);
      if (p) kuva = q(p);
      else if (qi) raportti.push(`${v.code} k${nro(k)}: kysymyskuva puuttuu (${qi.slice(0, 60)})`);
    }
    // Vastaukset
    const vastaukset = k.answers.map((a) => {
      const osat = [`'text', ${q(a.text)}`, `'is_correct', ${a.is_correct}`];
      const im = a.image ?? "";
      if (im.startsWith("kuvavisa:")) {
        const laji = im.slice("kuvavisa:".length).trim();
        const r = kv(laji, `${v.code} k${nro(k)} vastaus "${a.text}"`);
        if (r) osat.push(`'image_url', ${q(r.image_url)}`, `'image_credit', ${q(r.source_credit)}`);
      } else if (im) {
        const p = kuvaPolku(`${v.code}-k${nro(k)}-${tiedostoksi(a.text)}`);
        if (p) osat.push(`'image_url', ${q(p)}`);
        else raportti.push(`${v.code} k${nro(k)}: vastauskuva "${a.text}" puuttuu (${im.slice(0, 40)})`);
      }
      return `jsonb_strip_nulls(jsonb_build_object(${osat.join(", ")}))`;
    });
    // Äänet + klippien tekstit (editori varoittaa, jos teksti muuttuu)
    const au = k.audio ?? {};
    const audio = {
      kysymys: aani(au.kysymys), vihje_laura: aani(au.vihje_laura), vihje_mikko: aani(au.vihje_mikko), tiesitko: aani(au.tiesitko),
      teksti_kysymys: k.spoken_text ?? k.question_text, teksti_vihje_laura: k.vihje_laura, teksti_vihje_mikko: k.vihje_mikko,
      teksti_tiesitko: au.tiesitko ? k.explanation : null,
    };
    const audioJson = JSON.stringify(Object.fromEntries(Object.entries(audio).filter(([, x]) => x != null)));
    let elain = "null::jsonb";
    if (k.animal_sound) {
      const e = k.animal_sound;
      const url = `/aanet/lapset/elainaanet/${path.basename(e.tiedosto)}`;
      if (!fs.existsSync(path.join(PUBLIC, url))) raportti.push(`${v.code} k${nro(k)}: eläinääni ${url} puuttuu`);
      elain = q(JSON.stringify({ url, laji: e.laji, tieteellinen: e.tieteellinen, tekija: e.tekija, lisenssi: e.lisenssi, lahde: e.lahde, lahde_url: e.lahde_url })) + "::jsonb";
    }
    return `(${k.sort_order}, ${q(k.question_text)}, ${q(k.question_type)}, ${q(k.explanation)}, jsonb_build_array(${vastaukset.join(", ")}), ${kuva}, ${krediitti}, ${lisenssi}, ${q(k.vihje_laura)}, ${q(k.vihje_mikko)}, ${q(audioJson)}::jsonb, ${elain})`;
  });

  const sql = `-- ${v.code} ${v.title} (${v.questions.length} kysymystä)
insert into quizzes (site_id, slug, title, description, platform, category, collection, difficulty, target_age, tone, status, created_by, game_mode, image_url, lukija, lasten_aihe)
values ('${SITE_ID}', ${q(v.slug)}, ${q(v.title)}, ${q(v.description)}, 'tietoniekka', ${q(category)}, ${q(collection)}, 'helppo', ${q(v.target_age)}, 'rento', 'draft', 'ai', 'klassinen', ${q(hero)}, ${q(v.lukija)}, ${q(v.lasten_aihe)})
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, category = excluded.category, collection = excluded.collection,
  target_age = excluded.target_age, image_url = coalesce(excluded.image_url, quizzes.image_url), lukija = excluded.lukija,
  lasten_aihe = excluded.lasten_aihe, updated_at = now();

with v(sort_order, question_text, question_type, explanation, answers, image_url, image_credit, image_license_note, vihje_laura, vihje_mikko, audio, animal_sound) as (values
${rivit.join(",\n")}
), z as (select id from quizzes where slug = ${q(v.slug)}),
paiv as (
  update questions qq set question_text = v.question_text, question_type = v.question_type, explanation = v.explanation,
    answers = v.answers, image_url = v.image_url, image_credit = v.image_credit, image_license_note = v.image_license_note,
    vihje_laura = v.vihje_laura, vihje_mikko = v.vihje_mikko, audio = v.audio, animal_sound = v.animal_sound
  from v, z where qq.quiz_id = z.id and qq.sort_order = v.sort_order
  returning qq.sort_order
), lis as (
  insert into questions (quiz_id, sort_order, question_text, question_type, explanation, answers, image_url, image_credit, image_license_note, vihje_laura, vihje_mikko, audio, animal_sound)
  select z.id, v.sort_order, v.question_text, v.question_type, v.explanation, v.answers, v.image_url, v.image_credit, v.image_license_note, v.vihje_laura, v.vihje_mikko, v.audio, v.animal_sound
    from v, z where not exists (select 1 from questions qq where qq.quiz_id = z.id and qq.sort_order = v.sort_order)
  returning sort_order
), pois as (
  delete from questions qq using z where qq.quiz_id = z.id and qq.sort_order not in (select sort_order from v)
  returning qq.sort_order
)
select ${q(v.code)} as visa, (select count(*) from paiv) as paivitetty, (select count(*) from lis) as lisatty, (select count(*) from pois) as poistettu;
`;
  fs.writeFileSync(path.join(ulos, `${v.code}.sql`), sql);
}

console.log(`${data.quizzes.length} visaa, ${kysymyksia} kysymystä → ${ulos}`);
console.log(raportti.length ? `Puuttuu (${raportti.length}):\n  ` + raportti.join("\n  ") : "Ei puuttuvia kuvia tai ääniä.");
