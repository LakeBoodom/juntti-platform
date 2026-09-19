// HERO_IMAGE-TAUSTATÄYTTÖ (Päivän visa -toteutus, luku 2.1, Heikki 19.9.2026)
//
// quizzes.hero_image on visan oman kuvan ainoa totuus. Ennen tätä kuva
// johdettiin ajossa lib/visanKuva.ts:n kokoelmakohtaisista listoista (slug →
// tiedosto), jolloin slugin muutos rikkoi kuvan hiljaisesti. Tämä skripti
// ajaa saman valitsimen kerran ja tulostaa SQL:n, joka kirjoittaa tuloksen
// kantaan (vain tyhjiin hero_image-kenttiin — käsin asetettu arvo voittaa).
//
// Henkilövisoja ei täytetä: niiden kuva on celebrities.image_url (kannassa jo).
//
// Ajo (apps/tietoniekka): node scripts/run-ts.cjs scripts/hero-image-backfill.ts > out.sql
// Tarkistus: sama ajo ilman kirjoitusta raportoi erot kannan ja listojen välillä
// (esim. kun uusi kuva on lisätty listaan mutta ei kantaan).

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { visanOmaKuva } from "../lib/visanKuva";

const APP = join(__dirname, "..");
const env = Object.fromEntries(
  readFileSync(join(APP, ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]),
);
const SITE_ID = "62d75f45-a857-4fdd-9a45-b70ceeee98a8";

async function main() {
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await sb
    .from("quizzes")
    .select("id, slug, collection, category, hero_image, status")
    .eq("site_id", SITE_ID)
    .eq("status", "published");
  if (error) throw error;
  const rows: Array<{ id: string; slug: string; path: string }> = [];
  const missing: string[] = [];
  const differs: string[] = [];
  for (const q of data ?? []) {
    const path = visanOmaKuva(q.collection, q.category, q.slug);
    if (!path) continue;
    if (!existsSync(join(APP, "public", path))) { missing.push(`${q.slug} → ${path}`); continue; }
    if (q.hero_image) { if (q.hero_image !== path) differs.push(`${q.slug}: kanta ${q.hero_image} / lista ${path}`); continue; }
    rows.push({ id: q.id, slug: q.slug, path });
  }
  console.error(`julkaistuja ${data?.length}, täytettäviä ${rows.length}, tiedosto puuttuu ${missing.length}, eroaa ${differs.length}`);
  for (const m of missing) console.error("PUUTTUU", m);
  for (const d of differs) console.error("EROAA", d);
  if (!rows.length) return;
  const esc = (s: string) => s.replace(/'/g, "''");
  console.log(`update public.quizzes q set hero_image = v.path, updated_at = now()
from (values
${rows.map((r) => `  ('${r.id}'::uuid, '${esc(r.path)}')`).join(",\n")}
) as v(id, path)
where q.id = v.id and q.hero_image is null;`);
}
main().catch((e) => { console.error(e); process.exit(1); });
