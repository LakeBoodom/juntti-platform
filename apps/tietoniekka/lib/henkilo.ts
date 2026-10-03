// Erä B3 (3.10.2026): henkilösivun /henkilo/<slug> data ja henkilökohtainen laskenta.
// Lohkokomponentit (components/tn20/hub/*) saavat datan propseina eivätkä lue celebrities-taulua,
// jotta samat lohkot käyvät myöhemmin aihesivuille (/aihe/<slug>). Ikä, synttärilaskuri ja
// "Olisi nyt N v" lasketaan palvelimella Suomen ajassa.
import { getSupabase } from "./supabase";
import { getSiteId } from "./queries";
import { lajiMonikko, ryhma, ryhmaOf, type RyhmaKey } from "./henkiloRyhmat";
import { lueFaktat, type Fakta } from "./henkiloKaava";
import { visaHref } from "./visaHref";
import { henkiloSlug } from "./henkiloSlug";

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

export type HenkiloSivu = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  nickname: string | null;
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
  pelit: PeliLinkki[];
  muut: { otsikko: string; laatat: Laatta[]; kaikki: number; kaikkiHref: string | null };
  samanaPaivana: Laatta[];
};

type Rivi = {
  id: string; slug: string | null; name: string; role: string | null; ryhma: string | null; laji: string | null;
  image_url: string | null; birth_date: string | null; death_date: string | null; priority: number | null;
};

const KEVYT = "id, slug, name, role, ryhma, laji, image_url, birth_date, death_date, priority";

/** Aihevisat (ei henkilövisoja) ryhmän / lajin mukaan — "Muista kokoelmista". */
function aiheSuodatin(r: RyhmaKey, laji: string | null): { genre?: string; collections: string[] } {
  if (r === "urheilijat") {
    const lajiGenre = ["jaakiekko", "jalkapallo", "moottoriurheilu", "tennis", "golf"];
    return laji && lajiGenre.includes(laji) ? { genre: laji, collections: ["urheilu"] } : { collections: ["urheilu"] };
  }
  if (r === "muusikot") return { collections: ["musiikki"] };
  if (r === "nayttelijat") return laji === "komedia" ? { genre: "komedia", collections: ["tv"] } : { collections: ["elokuvat", "tv"] };
  if (r === "poliitikot") return { collections: ["historia"] };
  if (r === "media") return { collections: ["tv", "elokuvat"] };
  if (r === "kirjailijat") return { collections: ["kulttuuri"] };
  return { collections: ["yleistieto", "historia"] };
}

function sekoita<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
      "id, slug, name, role, ryhma, laji, image_url, image_focal_x, image_focal_y, birth_date, death_date, bio_short, intro_text, wikipedia_url, trivia_quiz_id, birth_place, death_place, nickname, facts, facts_reviewed_at",
    )
    .eq("id", osuma.id)
    .maybeSingle();
  if (!c) return null;

  const nyt = tanaan();
  const r = ryhmaOf(c.ryhma, c.laji);
  const hyvaksytty = !!c.facts_reviewed_at;

  const [visaRes] = await Promise.all([
    c.trivia_quiz_id
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sb as any)
          .from("quizzes")
          .select("id, slug, custom_slug, title, display_title, fanitasot, game_mode")
          .eq("id", c.trivia_quiz_id)
          .eq("status", "published")
          .maybeSingle()
      : Promise.resolve({ data: null }),
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
    laatat: joukko.slice(0, 6).map((x) => laatta(x, nyt)),
    kaikki: joukko.length + 1,
    kaikkiHref: null as string | null, // /henkilot/<ryhma>/<laji> tulee hakemiston mukana
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

  // Pelihylly: Ikäjärjestys omalla ryhmällä/lajilla + 0–3 aihevisaa.
  const pelit: PeliLinkki[] = [];
  const ikaParams = new URLSearchParams({ category: r, autostart: "1" });
  if (c.laji && lajiRiittaa) ikaParams.set("laji", c.laji);
  pelit.push({
    eyebrow: "Ikäjärjestys",
    otsikko: lajiRiittaa && lajiNimi ? lajiNimi.charAt(0).toUpperCase() + lajiNimi.slice(1) : ryhma(r).nimi,
    href: `/peli/ikajarjestys?${ikaParams}`,
  });
  const f = aiheSuodatin(r, c.laji);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let aq = (sb as any)
    .from("quiz_cards")
    .select("id, slug, custom_slug, title, display_title, collection, game_mode")
    .in("collection", f.collections)
    .neq("game_mode", "mega")
    .limit(60);
  if (f.genre) aq = aq.eq("genre", f.genre);
  const { data: aiheet } = await aq;
  for (const a of sekoita((aiheet ?? []) as Array<{ id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null; collection: string; game_mode: string | null }>).slice(0, 3)) {
    pelit.push({ eyebrow: "Visa", otsikko: a.display_title ?? a.title, href: visaHref(a), meta: KOKOELMA_NIMI[a.collection] ?? undefined });
  }

  return {
    id: c.id,
    slug: henkiloSlug(c.name),
    name: c.name,
    role: c.role,
    nickname: c.nickname,
    ryhma: r,
    laji: c.laji,
    image_url: c.image_url,
    focal: { x: c.image_focal_x ?? 0.5, y: c.image_focal_y ?? 0.25 },
    birth: s,
    death: parsePvm(c.death_date),
    birthIso: c.birth_date,
    deathIso: c.death_date,
    birth_place: c.birth_place,
    death_place: c.death_place,
    // Vuotosääntö (brief B2): intro_text ja facts näkyvät vasta Heikin hyväksynnän jälkeen.
    esittely: (hyvaksytty && c.intro_text) || c.bio_short || null,
    faktat: hyvaksytty ? lueFaktat(c.facts) : [],
    wikipedia_url: c.wikipedia_url,
    visa,
    pelit,
    muut,
    samanaPaivana,
  };
}

const KOKOELMA_NIMI: Record<string, string> = {
  urheilu: "Urheilu",
  musiikki: "Musiikki",
  elokuvat: "Elokuvat",
  tv: "TV-sarjat",
  historia: "Historia",
  kulttuuri: "Kulttuuri",
  yleistieto: "Yleistieto",
};

