// Erä B3 (3.10.2026): henkilösivun /henkilo/<slug> data ja henkilökohtainen laskenta.
// Lohkokomponentit (components/tn20/hub/*) saavat datan propseina eivätkä lue celebrities-taulua,
// jotta samat lohkot käyvät myöhemmin aihesivuille (/aihe/<slug>). Ikä, synttärilaskuri ja
// "Olisi nyt N v" lasketaan palvelimella Suomen ajassa.
import { getSupabase } from "./supabase";
import { getSiteId } from "./queries";
import { lajiMonikko, ryhma, ryhmaOf, type RyhmaKey } from "./henkiloRyhmat";
import { lueFaktat, type Fakta } from "./henkiloKaava";
import { visaHref } from "./visaHref";
import { COLLECTION_LABEL } from "./visanKokoelma";
import { henkiloSlug } from "./henkiloSlug";
import { nimiVuotaa, rakennaVuotolista, vastaustenLuvut, type VisanKysymys } from "./vuotolista";
import { haeLaatuArvot, haeLaatuDefit, lukuSana, valitseLaatuPakka, type LaatuArvo, type PoolHenkilo } from "./laadullinen";

/* ── Päivämäärät (Europe/Helsinki) ─────────────────────────────────────── */

export type Pvm = { y: number; m: number; d: number };

export function tanaan(): Pvm {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(new Date()).split("-").map(Number);
  return { y, m, d };
}

export function parsePvm(iso: string | null | undefined): Pvm | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}

export const fiPvm = (p: Pvm) => `${p.d}.${p.m}.${p.y}`;

/** Täydet vuodet a → b. */
export function vuodet(a: Pvm, b: Pvm): number {
  return b.y - a.y - (b.m < a.m || (b.m === a.m && b.d < a.d) ? 1 : 0);
}

const utc = (p: Pvm) => Date.UTC(p.y, p.m - 1, p.d);

/** Päiviä seuraavaan syntymäpäivään (0 = tänään). 29.2. → 28.2. muina vuosina. */
export function paiviaSynttariin(s: Pvm, nyt: Pvm): number {
  const karkaus = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const paiva = (y: number) => (s.m === 2 && s.d === 29 && !karkaus(y) ? 28 : s.d);
  let seur = { y: nyt.y, m: s.m, d: paiva(nyt.y) };
  if (utc(seur) < utc(nyt)) seur = { y: nyt.y + 1, m: s.m, d: paiva(nyt.y + 1) };
  return Math.round((utc(seur) - utc(nyt)) / 86400000);
}

export function paivaaTeksti(n: number): string {
  return n === 0 ? "tänään" : n === 1 ? "huomenna" : `${n} päivän päästä`;
}

/** Laatan alarivi: "46 v" tai "1930–2001". */
export function ikaRivi(birth: string | null, death: string | null, nyt = tanaan()): string {
  const s = parsePvm(birth);
  if (!s) return "";
  const k = parsePvm(death);
  return k ? `${s.y}–${k.y}` : `${vuodet(s, nyt)} v`;
}

/* ── Data ─────────────────────────────────────────────────────────────── */

export type Laatta = { slug: string; name: string; image_url: string | null; ala: string };

export type PeliLinkki = { eyebrow: string; otsikko: string; href: string; meta?: string };

/** Pelihyllyn nosto (design v0.3 4a): laadullinen järjestyspakka (brief 4.10.) tai varalla Ikäjärjestys.
 *  Pooli 8 henkilöä; kortissa näytetään henkilö + 3 laattaa ja "+N". */
export type JarjestysNosto = {
  merkki: string;
  kysymys: string;
  otsikko: string;
  kuvaus: string;
  href: string;
  laatat: Array<{ name: string; image_url: string | null; oma: boolean }>;
  lisaa: number;
  akseli: [string, string];
  /** "Tilastot: 4.10.2026" (laadulliset pakat). */
  tilastot: string | null;
};

export type HenkiloSivu = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  nickname: string | null;
  /** "Kimistä" (Cowork täyttää); tyhjä → sivu käyttää koko nimeä, ei koskaan generoitua muotoa. */
  elatiivi: string | null;
  ryhma: RyhmaKey;
  laji: string | null;
  image_url: string | null;
  focal: { x: number; y: number };
  birth: Pvm | null;
  death: Pvm | null;
  birthIso: string | null;
  deathIso: string | null;
  birth_place: string | null;
  death_place: string | null;
  esittely: string | null;
  faktat: Fakta[];
  wikipedia_url: string | null;
  visa: { id: string; href: string; otsikko: string; fanitasot: string[] | null } | null;
  nosto: JarjestysNosto | null;
  /** "Liittyvät visat" (8.10.2026): celebrity_related_quizzes (score > 0, score desc, enintään 4),
   *  täydennettynä saman lajin / ryhmän henkilövisoilla. */
  aiheet: PeliLinkki[];
  muut: { otsikko: string; laatat: Laatta[]; kaikki: number; kaikkiHref: string | null };
  samanaPaivana: Laatta[];
};

type Rivi = {
  id: string; slug: string | null; name: string; role: string | null; ryhma: string | null; laji: string | null;
  image_url: string | null; birth_date: string | null; death_date: string | null; priority: number | null;
  trivia_quiz_id: string | null;
};

const KEVYT = "id, slug, name, role, ryhma, laji, image_url, birth_date, death_date, priority, trivia_quiz_id";

/** Ryhmän monikko Ikäjärjestys-otsikkoon ("Jare Brand ja muut muusikot"). null = ei taivu luontevasti
 *  → otsikkona fact_attribute_defs.jarjesta_title ("Ikäjärjestys"). */
const RYHMA_MONIKKO: Record<RyhmaKey, string | null> = {
  urheilijat: "urheilijat",
  muusikot: "muusikot",
  nayttelijat: "näyttelijät",
  poliitikot: "poliitikot",
  media: null,
  kirjailijat: "kirjailijat ja taiteilijat",
  vaikuttajat: null,
};

type VisaKortti = { id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null; collection: string | null };

/* Päivän siemen: sama henkilö + sama päivä → samat vastustajat kortilla ja pelissä (Cowork 3.10.). */
function siemen(s: string): () => number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19));
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sekoitaSiemenella<T>(a: T[], rnd: () => number): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const laatta = (c: Rivi, nyt: Pvm): Laatta => ({
  slug: henkiloSlug(c.name),
  name: c.name,
  image_url: c.image_url,
  ala: ikaRivi(c.birth_date, c.death_date, nyt),
});

/** Kuvalliset ensin, sitten prioriteetti. */
const jarjesta = (a: Rivi, b: Rivi) => (b.image_url ? 1 : 0) - (a.image_url ? 1 : 0) || (b.priority ?? 0) - (a.priority ?? 0);

/** Osoite → henkilö. Ensisijaisesti nimestä johdettu slug; kannan vanha slug palauttaa ohjauksen. */
export async function haeHenkiloSivu(slug: string): Promise<HenkiloSivu | { ohjaa: string } | null> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return null;

  // Kaikki henkilöt kevyesti (≈ 380 riviä, ISR-välimuistissa): osoitteen ratkaisu, muut-laatat ja
  // samana päivänä syntyneet. DATE-sarakkeeseen ei voi käyttää like-hakua (CLAUDE.md) → suodatus JS:ssä.
  const { data: kaikkiData } = await sb.from("celebrities").select(KEVYT).eq("site_id", siteId).limit(2000);
  const kaikkiRivit = (kaikkiData ?? []) as unknown as Rivi[];
  const osuma = kaikkiRivit.find((x) => henkiloSlug(x.name) === slug);
  if (!osuma) {
    const vanha = kaikkiRivit.find((x) => x.slug === slug);
    return vanha ? { ohjaa: henkiloSlug(vanha.name) } : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: c } = await (sb as any)
    .from("celebrities")
    .select(
      "id, slug, name, role, ryhma, laji, image_url, image_focal_x, image_focal_y, birth_date, death_date, bio_intro, wikipedia_url, trivia_quiz_id, birth_place, death_place, nickname, nimi_elatiivi, facts, facts_reviewed_at",
    )
    .eq("id", osuma.id)
    .maybeSingle();
  if (!c) return null;

  const nyt = tanaan();
  const r = ryhmaOf(c.ryhma, c.laji);
  const hyvaksytty = !!c.facts_reviewed_at;

  const [visaRes, kysRes] = await Promise.all([
    c.trivia_quiz_id
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sb as any)
          .from("quizzes")
          .select("id, slug, custom_slug, title, display_title, fanitasot, game_mode")
          .eq("id", c.trivia_quiz_id)
          .eq("status", "published")
          .maybeSingle()
      : Promise.resolve({ data: null }),
    c.trivia_quiz_id
      ? sb.from("questions").select("question_text, answers").eq("quiz_id", c.trivia_quiz_id)
      : Promise.resolve({ data: [] }),
  ]);
  const kaikki = kaikkiRivit.filter((x) => x.id !== c.id);

  // Muut <laji>: vähintään 3 samasta lajista, muuten ryhmä.
  const samaLaji = c.laji ? kaikki.filter((x) => x.laji === c.laji) : [];
  const samaRyhma = kaikki.filter((x) => ryhmaOf(x.ryhma, x.laji) === r);
  const lajiRiittaa = samaLaji.length >= 3;
  const joukko = (lajiRiittaa ? samaLaji : samaRyhma).sort(jarjesta);
  const lajiNimi = lajiMonikko(c.laji);
  const muut = {
    otsikko: lajiRiittaa && lajiNimi ? `Muut ${lajiNimi}` : `Muut: ${ryhma(r).nimi.toLowerCase()}`,
    laatat: joukko.slice(0, 8).map((x) => laatta(x, nyt)),
    kaikki: joukko.length + 1,
    kaikkiHref: lajiRiittaa && c.laji ? `/henkilot/${r}/${c.laji}` : `/henkilot/${r}`,
  };

  const s = parsePvm(c.birth_date);
  const samanaPaivana = s
    ? kaikki
        .filter((x) => {
          const p = parsePvm(x.birth_date);
          return p && p.m === s.m && p.d === s.d;
        })
        .sort(jarjesta)
        .slice(0, 6)
        .map((x) => laatta(x, nyt))
    : [];

  const q = visaRes?.data as
    | { id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null; fanitasot: unknown; game_mode: string | null }
    | null;
  const visa = q
    ? {
        id: q.id,
        href: visaHref(q),
        otsikko: q.display_title ?? q.title,
        fanitasot:
          Array.isArray(q.fanitasot) && q.fanitasot.length === 5 && q.fanitasot.every((t) => typeof t === "string")
            ? (q.fanitasot as string[])
            : null,
      }
    : null;

  // Pelihyllyn nosto: 1) laadullinen järjestyspakka (brief 4.10.), 2) varalla Ikäjärjestys. Molemmissa
  // pooli 8 = henkilö + 7 (sama laji → sama ryhmä → muut), siemen henkilö + päivä (sivu on cacheable),
  // vastustajaksi ei henkilöä, jonka nimi on oman visan vastaus tai kysymyksen erisnimi.
  const kysymykset = (kysRes?.data ?? []) as unknown as VisanKysymys[];
  const lista = rakennaVuotolista(kysymykset, c.name);
  const rnd = siemen(`${henkiloSlug(c.name)}|${nyt.y}-${nyt.m}-${nyt.d}`);
  const pool = (x: Rivi): PoolHenkilo => ({ id: x.id, name: x.name, laji: x.laji, ryhma: ryhmaOf(x.ryhma, x.laji), image_url: x.image_url });
  const itse: PoolHenkilo = { id: c.id, name: c.name, laji: c.laji, ryhma: r, image_url: c.image_url };
  const nostoLaatat = (jasenet: PoolHenkilo[]) => {
    const nakyvat = sekoitaSiemenella(jasenet.slice(0, 4), rnd);
    return nakyvat.map((x) => ({ name: x.name, image_url: x.image_url, oma: x.id === c.id }));
  };
  let nosto: JarjestysNosto | null = null;

  const defit = await haeLaatuDefit(sb);
  if (defit.size) {
    // Henkilön omat mittarit → kaikkien niiden arvot (pieni joukko: kymmeniä rivejä per mittari).
    const omat = await haeLaatuArvot(sb, [...defit.keys()], [c.id]);
    const arvot = omat.size ? await haeLaatuArvot(sb, [...omat.keys()]) : new Map();
    const pakka = valitseLaatuPakka({
      henkilo: itse,
      kaikki: kaikkiRivit.map(pool),
      defit,
      arvot,
      lista,
      vastausLuvut: vastaustenLuvut(kysymykset),
      rnd,
      sekoita: sekoitaSiemenella,
    });
    if (pakka) {
      const asOf = (arvot.get(pakka.def.attr_key) ?? []).map((a: LaatuArvo) => a.asOf).filter(Boolean).sort().pop() ?? null;
      const p = parsePvm(asOf);
      const muita = pakka.jasenet.length - 1;
      nosto = {
        merkki: "Laita järjestykseen",
        kysymys: pakka.def.winner === "high" ? "Kuka on kärjessä?" : "Kuka on ensimmäinen?",
        otsikko: pakka.def.otsikko.charAt(0).toUpperCase() + pakka.def.otsikko.slice(1),
        kuvaus: `Järjestä ${c.name} ja ${lukuSana(muita)} muuta: ${pakka.def.jarjestys}.`,
        href: `/peli/jarjesta/oma?a=${pakka.def.attr_key}&h=${pakka.jasenet.map((x) => x.id).join(",")}&p=${henkiloSlug(c.name)}`,
        laatat: nostoLaatat(pakka.jasenet),
        lisaa: Math.max(0, pakka.jasenet.length - 4),
        akseli: pakka.def.akseli,
        tilastot: p ? `Tilastot: ${fiPvm(p)}` : null,
      };
    }
  }

  if (!nosto && s) {
    const taso = (x: Rivi) => (c.laji && x.laji === c.laji ? 0 : ryhmaOf(x.ryhma, x.laji) === r ? 1 : 2);
    const ehdokkaat = kaikki.filter((x) => x.birth_date && !nimiVuotaa(x.name, lista));
    const jarjestetty = [0, 1, 2].flatMap((t) =>
      sekoitaSiemenella(ehdokkaat.filter((x) => taso(x) === t), rnd).sort((a, b) => (b.image_url ? 1 : 0) - (a.image_url ? 1 : 0)),
    );
    const valitut: Rivi[] = [];
    const paivat = new Set([c.birth_date]);
    for (const x of jarjestetty) {
      if (valitut.length >= 7) break;
      if (paivat.has(x.birth_date)) continue;
      paivat.add(x.birth_date);
      valitut.push(x);
    }
    if (valitut.length >= 4) {
      const jasenet = [itse, ...valitut.map(pool)];
      // 8.10.2026: "Jare Brand ja muusikot ja artistit" → "Jare Brand ja muut muusikot". Kysymys
      // "Kuka on vanhin?" on kortin merkkirivillä heti otsikon yllä. Jos ryhmän nimi ei taivu
      // ("Media- ja elokuvantekijät"), otsikko on fact_attribute_defs.jarjesta_title.
      const monikko = lajiRiittaa && lajiNimi ? lajiNimi : RYHMA_MONIKKO[r];
      let otsikko = monikko ? `${c.name} ja muut ${monikko}` : "";
      if (!otsikko) {
        const { data: def } = await sb.from("fact_attribute_defs").select("jarjesta_title").eq("attr_key", "birth").maybeSingle();
        otsikko = (def as { jarjesta_title: string | null } | null)?.jarjesta_title || "Ikäjärjestys";
      }
      nosto = {
        merkki: "Ikäjärjestys",
        kysymys: "Kuka on vanhin?",
        otsikko,
        kuvaus: `Järjestä ${c.name} ja ${lukuSana(valitut.length)} muuta syntymäpäivän mukaan.`,
        // category: "Arvo 10 uutta" jatkaa saman ryhmän kierroksilla.
        href: `/peli/ikajarjestys?henkilot=${jasenet.map((x) => x.id).join(",")}&category=${r}`,
        laatat: nostoLaatat(jasenet),
        lisaa: Math.max(0, jasenet.length - 4),
        akseli: ["Vanhin", "Nuorin"],
        tilastot: null,
      };
    }
  }

  // Liittyvät visat (8.10.2026): visat, joiden kysymyksissä henkilö mainitaan (celebrity_related_quizzes,
  // vain score > 0 — 0-rivit ovat vanhoja ajoja). Enintään 4, score desc, vain julkaistut (quiz_cards).
  // Täyttö saman lajin, sitten saman ryhmän henkilöiden omilla visoilla (prioriteettijärjestys). Satunnaisia
  // saman kokoelman visoja ei enää näytetä (Hyypiällä oli Leeds United).
  const aiheet: PeliLinkki[] = [];
  const MAX_AIHEET = 4;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: linkit } = await (sb as any)
    .from("celebrity_related_quizzes")
    .select("quiz_id, score")
    .eq("celebrity_id", c.id)
    .gt("score", 0)
    .order("score", { ascending: false })
    .limit(20);
  const linkkiIdt = ((linkit ?? []) as Array<{ quiz_id: string }>).map((l) => l.quiz_id).filter((id) => id !== c.trivia_quiz_id);
  const taytto = [
    ...kaikki.filter((x) => c.laji && x.laji === c.laji).sort(jarjesta),
    ...kaikki.filter((x) => !(c.laji && x.laji === c.laji) && ryhmaOf(x.ryhma, x.laji) === r).sort(jarjesta),
  ].filter((x) => x.trivia_quiz_id && x.trivia_quiz_id !== c.trivia_quiz_id);
  const tayttoIdt = taytto.slice(0, 12).map((x) => x.trivia_quiz_id!);
  const haettavat = [...new Set([...linkkiIdt, ...tayttoIdt])];
  if (haettavat.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kortit } = await (sb as any)
      .from("quiz_cards")
      .select("id, slug, custom_slug, title, display_title, collection")
      .in("id", haettavat);
    const julkaistu = new Map(((kortit ?? []) as VisaKortti[]).map((k) => [k.id, k]));
    const lisaa = (id: string, meta: string | undefined) => {
      const k = julkaistu.get(id);
      if (!k || aiheet.length >= MAX_AIHEET || aiheet.some((a) => a.href === visaHref(k))) return;
      aiheet.push({ eyebrow: "Visa", otsikko: k.display_title ?? k.title, href: visaHref(k), meta });
    };
    for (const id of linkkiIdt) {
      const col = julkaistu.get(id)?.collection ?? "";
      lisaa(id, KOKOELMA_NIMI[col] ?? COLLECTION_LABEL[col] ?? undefined);
    }
    for (const id of tayttoIdt) lisaa(id, "Henkilövisa");
  }

  return {
    id: c.id,
    slug: henkiloSlug(c.name),
    name: c.name,
    role: c.role,
    // Lempinimi voi olla visan vastaus → näkyy vasta vuototarkistetun erän hyväksynnän jälkeen.
    nickname: hyvaksytty ? c.nickname : null,
    elatiivi: c.nimi_elatiivi?.trim() || null,
    ryhma: r,
    laji: c.laji,
    image_url: c.image_url,
    focal: { x: c.image_focal_x ?? 0.5, y: c.image_focal_y ?? 0.25 },
    birth: s,
    death: parsePvm(c.death_date),
    birthIso: c.birth_date,
    deathIso: c.death_date,
    // Syntymä-/kuolinpaikka tulee Coworkin erissä ja voi olla visan vastaus (erä 1: Jonne Aaron
    // "Tampereella", Zlatan "Malmössä") → näkyy vasta hyväksynnän jälkeen kuten esittely ja Lyhyesti.
    birth_place: hyvaksytty ? c.birth_place : null,
    death_place: hyvaksytty ? c.death_place : null,
    // Vuotosääntö (brief B2, Cowork 3.10. vaihtoehto b): ennen hyväksyntää vain faktarivi, ei bio_shortia.
    // Esittely = bio_intro (max 600). intro_text on Päivän sankari -rivin poikkeusteksti (max 240), ei tämä.
    esittely: hyvaksytty ? c.bio_intro || null : null,
    faktat: hyvaksytty ? lueFaktat(c.facts) : [],
    wikipedia_url: c.wikipedia_url,
    visa,
    nosto,
    aiheet,
    muut,
    samanaPaivana,
  };
}

const KOKOELMA_NIMI: Record<string, string> = {
  "tunnetut-henkilot": "Henkilövisa",
  maantieto: "Maantieto",
  luonto: "Luonto",
  tiede: "Tiede",
  juhlat: "Juhlat",
  politiikka: "Politiikka",
  urheilu: "Urheilu",
  musiikki: "Musiikki",
  elokuvat: "Elokuvat",
  tv: "TV-sarjat",
  historia: "Historia",
  kulttuuri: "Kulttuuri",
  yleistieto: "Yleistieto",
};

