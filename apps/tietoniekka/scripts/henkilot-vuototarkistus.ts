// HENKILÖSIVUN VUOTOTARKISTUS (erä B2, Cowork 3.10.2026)
//
// Vertaa jokaisen henkilön sivulle tulevia tekstejä hänen OMAN visansa kysymyksiin ja raportoi osumat
// ryhmittäin, jotta Cowork voi korjata ne ennen Heikin hyväksyntää (facts_reviewed_at).
//   Kentät: bio_intro (henkilösivun esittely), facts (label + value), nickname, bio_short (+ birth_place tiedoksi)
//   Vertailu (lib/vuotolista.ts, sama lista kuin henkilösivun Ikäjärjestys-vastustajilla):
//     - oikeat vastaukset (karkea taivutusvertailu: "Ferrarilla" osuu "Ferrari")
//     - vuosiluvut oikeissa vastauksissa → kielletty kaikissa kentissä
//     - vuosiluvut kysymyksissä → kielletty muualla, SALLITTU facts-riveillä (Cowork 3.10.)
//     - erisnimet kysymyksissä (ilman henkilön omaa nimeä)
//
// Ajo (apps/tietoniekka):
//   node scripts/run-ts.cjs scripts/henkilot-vuototarkistus.ts [raportti.md] [--vain-tarkistamattomat] [--vain-erat]
// Oletuksena raportti kirjoitetaan tiedostoon HENKILOSIVU_VUOTORAPORTTI.md nykyiseen kansioon.
// Ympäristö: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (prosessista tai .env.local).
// Vain luku — skripti ei kirjoita kantaan mitään.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { rakennaVuotolista, vuodot, type VisanKysymys, type VuotoOsuma } from "../lib/vuotolista";
import { RYHMAT, ryhmaOf, type RyhmaKey } from "../lib/henkiloRyhmat";

const APP = join(__dirname, "..");
const SITE_ID = "62d75f45-a857-4fdd-9a45-b70ceeee98a8";

function lueEnv(): Record<string, string> {
  const env: Record<string, string> = { ...(process.env as Record<string, string>) };
  const tiedosto = join(APP, ".env.local");
  if (existsSync(tiedosto)) {
    for (const l of readFileSync(tiedosto, "utf8").split("\n")) {
      if (!l.includes("=") || l.startsWith("#")) continue;
      const k = l.slice(0, l.indexOf("=")).trim();
      env[k] ??= l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "");
    }
  }
  return env;
}

type Henkilo = {
  name: string; ryhma: string | null; laji: string | null; trivia_quiz_id: string | null;
  bio_intro: string | null; facts: unknown; nickname: string | null; bio_short: string | null;
  birth_place: string | null; facts_reviewed_at: string | null;
};

type Rivi = { henkilo: string; kentta: string; teksti: string; osuma: VuotoOsuma; kysymys: string };

const lyhenna = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const md = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

async function main() {
  const args = process.argv.slice(3);
  const vainTarkistamattomat = args.includes("--vain-tarkistamattomat");
  /** Vain henkilöt, joille Cowork on jo kirjoittanut bio_intro- tai facts-tiedot (erät). */
  const vainUudet = args.includes("--vain-erat");
  const ulos = args.find((a) => !a.startsWith("--")) ?? "HENKILOSIVU_VUOTORAPORTTI.md";
  const env = lueEnv();
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data: hData, error } = await sb
    .from("celebrities")
    .select("name, ryhma, laji, trivia_quiz_id, bio_intro, facts, nickname, bio_short, birth_place, facts_reviewed_at" as never)
    .eq("site_id", SITE_ID)
    .limit(2000);
  if (error) throw error;
  const henkilot = (hData ?? []) as unknown as Henkilo[];

  const quizIdt = [...new Set(henkilot.map((h) => h.trivia_quiz_id).filter(Boolean))] as string[];
  const kysymykset = new Map<string, VisanKysymys[]>();
  for (let i = 0; i < quizIdt.length; i += 100) {
    const { data } = await sb.from("questions").select("quiz_id, question_text, answers").in("quiz_id", quizIdt.slice(i, i + 100));
    for (const q of (data ?? []) as Array<VisanKysymys & { quiz_id: string }>) {
      kysymykset.set(q.quiz_id, [...(kysymykset.get(q.quiz_id) ?? []), q]);
    }
  }

  const osumat = new Map<RyhmaKey, Rivi[]>();
  const tarkistettu: Record<RyhmaKey, number> = Object.fromEntries(RYHMAT.map((r) => [r.key, 0])) as Record<RyhmaKey, number>;
  const ilmanVisaa: string[] = [];
  const syntymapaikka: Rivi[] = [];

  for (const h of henkilot) {
    if (vainTarkistamattomat && h.facts_reviewed_at) continue;
    const kentat: Array<{ kentta: string; teksti: string; fakta: boolean }> = [];
    if (vainUudet && !h.bio_intro && !Array.isArray(h.facts)) continue;
    if (h.bio_intro) kentat.push({ kentta: "bio_intro", teksti: h.bio_intro, fakta: false });
    if (h.bio_short) kentat.push({ kentta: "bio_short", teksti: h.bio_short, fakta: false });
    if (h.nickname) kentat.push({ kentta: "nickname", teksti: h.nickname, fakta: false });
    if (Array.isArray(h.facts))
      for (const f of h.facts as Array<{ label?: string; value?: string }>)
        if (f?.value) kentat.push({ kentta: `facts: ${f.label ?? "?"}`, teksti: f.value, fakta: true });
    if (!kentat.length) continue;
    const r = ryhmaOf(h.ryhma, h.laji);
    tarkistettu[r]++;
    const qs = h.trivia_quiz_id ? kysymykset.get(h.trivia_quiz_id) ?? [] : [];
    if (!qs.length) {
      ilmanVisaa.push(h.name);
      continue;
    }
    // Kysymys kerrallaan, jotta raportti kertoo mihin kysymykseen osuma liittyy.
    for (const q of qs) {
      const lista = rakennaVuotolista([q], h.name);
      for (const k of kentat) {
        for (const o of vuodot(k.teksti, lista, k.fakta)) {
          osumat.set(r, [...(osumat.get(r) ?? []), { henkilo: h.name, kentta: k.kentta, teksti: k.teksti, osuma: o, kysymys: q.question_text }]);
        }
      }
      if (h.birth_place) for (const o of vuodot(h.birth_place, lista, false))
        syntymapaikka.push({ henkilo: h.name, kentta: "birth_place", teksti: h.birth_place, osuma: o, kysymys: q.question_text });
    }
  }

  const pvm = new Intl.DateTimeFormat("fi-FI", { timeZone: "Europe/Helsinki", dateStyle: "short", timeStyle: "short" }).format(new Date());
  const kaikki = [...osumat.values()].flat();
  const yhteensa = kaikki.length;
  const korjattavia = kaikki.filter((x) => x.osuma.tyyppi !== "nimi").length;
  const out: string[] = [
    "# Henkilösivun vuotoraportti",
    "",
    `> Ajettu ${pvm}${vainTarkistamattomat ? " · vain tarkistamattomat (facts_reviewed_at tyhjä)" : ""}${vainUudet ? " · vain henkilöt, joilla bio_intro tai facts" : ""}. Skripti: apps/tietoniekka/scripts/henkilot-vuototarkistus.ts.`,
    "> Osuma = sivun teksti sisältää oman visan oikean vastauksen, vuosiluvun tai kysymyksen erisnimen. Vertailu on karkea: tarkista jokainen osuma ja korjaa teksti, jos se paljastaa vastauksen.",
    "> Vuosiluvut: kysymysten vuosiluvut ovat sallittuja facts-riveillä, oikeiden vastausten vuosiluvut eivät missään.",
    "",
    `**Korjattavia ${korjattavia}** (vastaus tai vuosiluku) · tarkistettavia ${yhteensa - korjattavia} (kysymyksen erisnimi) · henkilöitä tarkistettu ${Object.values(tarkistettu).reduce((a, b) => a + b, 0)}.`,
    "",
  ];
  const taulukko = (rr: Rivi[]) => {
    out.push("| Henkilö | Kenttä | Osuma | Teksti | Kysymys |", "|---|---|---|---|---|");
    for (const x of rr.sort((a, b) => a.henkilo.localeCompare(b.henkilo, "fi")))
      out.push(`| ${md(x.henkilo)} | ${md(x.kentta)} | ${x.osuma.tyyppi}: **${md(x.osuma.arvo)}** | ${md(lyhenna(x.teksti))} | ${md(lyhenna(x.kysymys, 70))} |`);
    out.push("");
  };
  for (const g of RYHMAT) {
    const rr = osumat.get(g.key) ?? [];
    const korjaa = rr.filter((x) => x.osuma.tyyppi !== "nimi");
    const tarkista = rr.filter((x) => x.osuma.tyyppi === "nimi");
    out.push(`## ${g.nimi} — korjattavia ${korjaa.length}, tarkistettavia ${tarkista.length} (${tarkistettu[g.key]} henkilöä)`, "");
    if (!rr.length) {
      out.push("Ei osumia.", "");
      continue;
    }
    if (korjaa.length) {
      out.push("### Korjaa: oikea vastaus tai vuosiluku näkyy sivulla", "");
      taulukko(korjaa);
    }
    if (tarkista.length) {
      out.push("### Tarkista: kysymyksen erisnimi näkyy sivulla (vuoto vain, jos nimi paljastaa vastauksen)", "");
      taulukko(tarkista);
    }
  }
  if (syntymapaikka.length) {
    out.push("## Tiedoksi: syntymäpaikka visan vastauksena", "", "Syntymäpaikka näkyy faktarivillä aina. Jos se on visan vastaus, kysymys paljastuu sivulla.", "");
    out.push("| Henkilö | Syntymäpaikka | Kysymys |", "|---|---|---|");
    for (const x of syntymapaikka) out.push(`| ${md(x.henkilo)} | ${md(x.teksti)} | ${md(lyhenna(x.kysymys, 80))} |`);
    out.push("");
  }
  if (ilmanVisaa.length) out.push("## Ilman julkaistua visaa (ei verrattavaa)", "", ilmanVisaa.sort((a, b) => a.localeCompare(b, "fi")).join(", "), "");
  writeFileSync(ulos, out.join("\n"));
  console.log(`Vuotoraportti: ${ulos} — ${yhteensa} osumaa.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
