// Tekoälyluonnokset: kierroksen 4 kortin tekstit (aihe, koukku, palkinto) motiivin
// mukaan ja visojen fanitasot. Toimitus hyväksyy aina — tekoäly vain luonnostelee.
//
// Designin säännöt (kierros 4, 4k):
//  - Koukku puhuu katsojalle (sinä-muoto, kysymys tai haaste), aina kortin suurin asia.
//  - Palkinto kertoo, mitä pelaaja saa tietää, tuntea tai todistaa — pois, jos koukku
//    jo lupaa sen. Enemmistöväitteitä vain datan tukemina (ei dataa → ei väitteitä).
//  - Aihe on toimituksellinen lyhenne ("JOKERIT", "SALKKARIT"), ei katkaistu visan nimi.
//  - Ei faktaväitteitä, joita visassa ei ole, eikä vihjeitä vastauksiin.

import { getAnthropic, MODEL } from "@juntti/ai";
import { getSupabaseAdmin } from "@juntti/db";
import type { SynttariData, VisaData } from "./data";
import { MOTIIVI, type Pohja } from "./pohjat";

export type Luonnos = { aihe: string; koukku: string; palkinto: string };

const MOTIIVIOHJE: Record<string, string> = {
  identiteetti:
    'Identiteetti ja fanius: kortti ei kysy tietoa vaan asemaa. Haasta lukija todistamaan, kuinka hyvin hän tuntee aiheen. Esim. koukku "Oletko oikea Jokeri|fani?", palkinto "Todista se. Visa kertoo, mille tasolle yllät."',
  uteliaisuus:
    'Uteliaisuus: lupaus on yllätys. Esim. koukku "Tiedätkö ilman Googlea?", palkinto "Selvitä, paljonko pohjoisen taivaasta oikeasti tiedät."',
  tulos: 'Tulos ja suoritus: mitattava pistemäärä. Koukku esim. "Saatko täydet?", palkinto "Montako saat oikein ilman apua?"',
  nostalgia:
    'Nostalgia: oma muisto palaa mieleen. Koukku esim. "Muistatko vielä Salkkareiden alku|kaudet?" — vain jos visan kysymykset oikeasti käsittelevät vanhaa aikaa, muuten "Kuinka hyvin muistat Salkkarit?". Palkintoa ei tarvita.',
  sosiaalinen:
    'Sosiaalinen kilpailu: kaverin voittaminen. Koukku esim. "Kumpi teistä tietää enemmän?", palkinto on kehotus merkitä kaveri, esim. "Merkitse se kaveri."',
  osallistuminen:
    'Osallistuminen: kynnys on yksi kommentti. Koukku lyhyt kysymys lukijalle, esim. "Tiedätkö ilman apua?" tai "Montako näistä tiedät?". Palkintoa ei tarvita.',
  synttari:
    'Syntymäpäivä on syy, visa on aihe. Koukku siltaa henkilöstä visaan, esim. "Tunnetko Suomen F1-kuljettajat?" tai "Kuinka hyvin tunnet hänet?". Palkinto lyhyt, esim. "Häkkinen on vasta alku." Ei ikää eikä päivämäärää koukkuun.',
  muisto: 'Muisto kommenttiin: kortti pyytää lukijan oman muiston. Koukku esim. "Mikä on ensimmäinen muistosi hänestä?". Ei palkintoa.',
};

function lueJson(teksti: string): Record<string, unknown> | null {
  const m = teksti.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as Record<string, unknown>; } catch { return null; }
}

async function kysy(ohje: string, maxTokens = 300): Promise<string | null> {
  try {
    const r = await getAnthropic().messages.create({ model: MODEL, max_tokens: maxTokens, messages: [{ role: "user", content: ohje }] });
    return r.content.filter((c) => c.type === "text").map((c) => (c as { text: string }).text).join("").trim();
  } catch {
    return null;
  }
}

const siisti = (x: unknown, max: number) => {
  const s = typeof x === "string" ? x.replace(/^["“”']+|["“”']+$/g, "").replace(/\s+/g, " ").trim() : "";
  return s.length <= max ? s : "";
};

/** Luonnos kortin teksteiksi. Palauttaa null, jos tekoäly ei vastaa. */
export async function luonnosteleTekstit(pohja: Pohja, o: { visa?: VisaData | null; synttarit?: SynttariData | null }): Promise<Luonnos | null> {
  const motiivi = MOTIIVI[pohja];
  const v = o.visa;
  const s = o.synttarit;
  const kysymykset = (v?.kysymykset ?? []).slice(0, 5).map((q) => `- ${q.teksti}`).join("\n");
  const aineisto = s
    ? `Henkilö: ${s.nimi}${s.rooli ? ` (${s.rooli})` : ""}, ${s.muisto ? `olisi täyttänyt tänään ${s.ika} (kuollut)` : `täyttää tänään ${s.ika}`}.
Henkilön visa: ${s.visaNimi ?? "(ei visaa — kortti ohjaa kommentteihin)"}`
    : `Visa: ${v?.nimi ?? ""} (kokoelma ${v?.kokoelma ?? ""}, ${v?.kysymyksia ?? 10} kysymystä)
${v?.introOtsikko ? `Päivän tapahtuma (vain taustaksi, EI koukkuun): ${v.introOtsikko}` : ""}
Esimerkkikysymyksiä visasta (älä paljasta vastauksia, älä kopioi kysymyksiä koukuksi):
${kysymykset || "- (ei saatavilla)"}`;

  const ohje = `Kirjoitat Tietoniekka.fi:n Instagram-kortin tekstit suomeksi. Kortti puhuu katsojalle, ei tietokannasta.

Motiivi: ${MOTIIVIOHJE[motiivi] ?? motiivi}
${pohja === "4n" ? 'Juontaja Mikko haastaa katsojan provokaatiolla, esim. "Sinä et ole oikea Jokeri|fani." — persoonan heitto, ei faktaväite.' : ""}

Säännöt:
- koukku: enintään 45 merkkiä, sinä-muoto, kysymys tai haaste. Ei faktaväitteitä, lukuja tai nimiä, joita alla ei mainita. Ei vihjeitä vastauksiin. Älä kysy yksittäistä visan tietokysymystä.
- palkinto: enintään 60 merkkiä tai tyhjä, jos koukku jo lupaa palkinnon. Ei väitteitä muiden pelaajien tuloksista.
- aihe: 1–2 sanaa isoilla kirjaimilla, toimituksellinen lyhenne aiheesta (esim. JOKERIT, SALKKARIT, REVONTULET, PORI). Ei katkaistu visan nimi.
- Merkitse yli 11-kirjaimisten YHDYSSANOJEN osien raja pystyviivalla, esim. Jokeri|fani, revontuli|ekspertti. Vain yhdyssanan osien väliin — ei koskaan tavun keskelle (EI "kuljet|tajat").
- Ei emojeja, ei hashtageja, ei lainausmerkkejä.

${aineisto}

Vastaa pelkkänä JSON-oliona: {"aihe": "...", "koukku": "...", "palkinto": "..."}`;

  const vastaus = await kysy(ohje);
  const j = vastaus ? lueJson(vastaus) : null;
  if (!j) return null;
  const koukku = siisti(j.koukku, 60);
  if (!koukku) return null;
  return { aihe: siisti(j.aihe, 24).toLocaleUpperCase("fi-FI"), koukku, palkinto: siisti(j.palkinto, 80) };
}

/* ── Fanitasot ───────────────────────────────────────────────────────── */

/** Tulosruudun otsikko (.tng-restitle) on mitoitettu sanalle "Harjoiteltavaa"
    (14 merkkiä) — sama raja jokaiselle sanalle ja tavuviivan osalle. */
export function fanitasotKelpaavat(x: unknown): x is string[] {
  return (
    Array.isArray(x) &&
    x.length === 5 &&
    x.every((t) => typeof t === "string" && t.trim().length >= 3 && t.trim().length <= 28 && t.trim().split(/[\s-]+/).every((o) => o.length <= 14)) &&
    new Set(x.map((t) => (t as string).trim().toLowerCase())).size === 5
  );
}

/** Luo visalle viisi aihekohtaista tasonimeä heikoimmasta parhaaseen. */
export async function luoFanitasot(quizId: string): Promise<string[] | null> {
  const sb = getSupabaseAdmin();
  const [{ data: q }, { data: kys }] = await Promise.all([
    sb.from("quizzes").select("title, display_title, collection, category").eq("id", quizId).maybeSingle(),
    sb.from("questions").select("question_text").eq("quiz_id", quizId).order("sort_order").limit(4),
  ]);
  const visa = q as unknown as { title: string; display_title: string | null; collection: string | null; category: string | null } | null;
  if (!visa) return null;
  const esimerkit = ((kys ?? []) as unknown as Array<{ question_text: string }>).map((r) => `- ${r.question_text}`).join("\n");
  const ohje = `Keksi Tietoniekka.fi:n visalle viisi aihekohtaista TULOSTASOA suomeksi, heikoimmasta parhaaseen. Pelaaja näkee tasonsa visan lopussa ("Visa kertoo, mille tasolle yllät").

Esimerkki Helsingin Jokerit -visalle: ["Sohvakatsoja", "Satunnainen fani", "Katsomon kanta", "Jokeri-tietäjä", "Jokeri-ekspertti"]

Säännöt:
- Jokainen taso 1–3 sanaa, leikkisä mutta ei koskaan loukkaava — heikoinkin taso on myönteinen.
- Tasot liittyvät visan aiheeseen (laji, sarja, paikka, ilmiö…). Nousujohteinen järjestys.
- Yksikään sana (tai yhdysmerkin osa) ei saa olla yli 14 merkkiä pitkä.
- Ei emojeja.

Visa: ${visa.display_title ?? visa.title} (kokoelma: ${visa.collection ?? visa.category ?? "-"})
${esimerkit ? `Kysymyksiä visasta:\n${esimerkit}` : ""}

Vastaa pelkkänä JSON-oliona: {"tasot": ["…", "…", "…", "…", "…"]}`;
  for (let yritys = 0; yritys < 2; yritys++) {
    const vastaus = await kysy(ohje, 200);
    const j = vastaus ? lueJson(vastaus) : null;
    const tasot = Array.isArray(j?.tasot) ? (j!.tasot as unknown[]).map((x) => (typeof x === "string" ? x.trim() : x)) : null;
    if (fanitasotKelpaavat(tasot)) {
      await sb.from("quizzes").update({ fanitasot: tasot } as never).eq("id", quizId);
      return tasot;
    }
  }
  return null;
}

/** Täyttää puuttuvia fanitasoja vähitellen (ajastin): julkaistut visat, uusin ensin. */
export async function taytaFanitasoja(siteId: string, enintaan: number): Promise<number> {
  const { data } = await getSupabaseAdmin()
    .from("quizzes")
    .select("id")
    .eq("site_id", siteId)
    .eq("status", "published")
    .is("fanitasot" as never, null)
    .order("published_at", { ascending: false })
    .limit(60);
  // Satunnainen otos, jottei tekoälyn toistuvasti hylkäämä visa tuki jonoa.
  const ehdokkaat = ((data ?? []) as unknown as Array<{ id: string }>).sort(() => Math.random() - 0.5).slice(0, enintaan);
  let n = 0;
  for (const r of ehdokkaat) {
    if (await luoFanitasot(r.id)) n++;
  }
  return n;
}
