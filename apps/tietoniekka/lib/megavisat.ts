// MEGAVISAT-LANDING — uusi design 26.8.2026 (design_handoff_megavisat/README.md,
// CD "TN Megavisat"). Korvaa 13.–14.8. version (aihekortit ilman kuvia,
// pituusvalitsin piilotettuna Aloita/Tulossa-logiikan taakse).
//
// Uusi malli: kiinteä lista 7 megavisaa (nosto + 6 ruudukossa), jokaisella
// yksi teemakuva ja yksi kiinteä pituus — ei enää pituusvalitsinta eikä
// "Tulossa"-tiloja (README kieltää molemmat nimenomaisesti). Kaikki 7 megaa
// on jo koottu mega_questions-tauluun (Supabase-vahvistettu 26.8.2026:
// 6 kpl × 50 kysymystä + Maailman kolkat × 20) — vain julkaisutila (status)
// on draft, mikä on tarkoituksellista niin kauan kuin koko 2.0 on
// preview-branchilla (Heikin päätös 26.8.: ei julkaista ennen 2.0-launchia).
// Kortit haetaan silti aina slugilla kannasta (peli lukee draft-megan RLS:n
// ansiosta) — jos jokin mega joskus poistuu/nimi vaihtuu, kortti häviää
// automaattisesti hiljaa sen sijaan että linkki 404:ttäisi.

import type { getSupabase } from "@/lib/supabase";

export type MegaCard = {
  slug: string;
  /** Aihetagi kortissa (README:n data-taulukko, sanasta sanaan). */
  tag: string;
  /** Kuvausteksti kortissa (README:n data-taulukko, sanasta sanaan). */
  desc: string;
  img: string;
  /** background-position (CSS object-position-arvona). */
  pos: string;
  /** Aihe perusmuodossa /megavisat-sivun meta descriptioniin ("aiheista X, Y ja Z"). */
  aihe: string;
};

export const MEGA_FEATURED: MegaCard = {
  slug: "suuri-mega-50",
  tag: "Kaikki aiheet",
  desc: "Sekoitus jokaisesta kokoelmasta — kysymykset kaikilta tuotteen alueilta samassa istunnossa.",
  img: "/20/megavisat/mega-yleistieto.webp",
  pos: "center 42%",
  aihe: "yleistieto",
};

export const MEGA_GRID: MegaCard[] = [
  {
    slug: "sm-liiga-megavisa",
    tag: "Urheilu · Jääkiekko",
    desc: "Mestaruudet, legendat ja ulkomaalaisvahvistukset liigan historiassa.",
    img: "/20/megavisat/mega-smliiga.webp",
    pos: "center 22%",
    aihe: "SM-liiga",
  },
  {
    slug: "valioliiga-megavisa",
    tag: "Urheilu · Jalkapallo",
    desc: "Maalikuninkaat, siirrot ja mestaruudet kaudesta 1992 alkaen.",
    img: "/20/megavisat/mega-valioliiga.webp",
    pos: "center 40%",
    aihe: "Valioliiga",
  },
  {
    slug: "tv-ja-suoratoisto-mega",
    tag: "TV ja suoratoisto",
    desc: "Suosituimmat sarjat Suomesta ja maailmalta — sohvaperunoiden loppukoe.",
    img: "/20/megavisat/mega-tv.webp",
    pos: "center 40%",
    aihe: "TV-sarjat",
  },
  {
    slug: "kaikki-suomesta-mega",
    tag: "Suomi",
    desc: "Historia, kulttuuri ja luonto: kuinka hyvin tunnet Suomen?",
    img: "/20/megavisat/mega-suomi.webp",
    pos: "center 55%",
    aihe: "Suomi",
  },
  {
    slug: "viihdemaailman-megavisa",
    tag: "Viihde",
    desc: "Julkkikset, elokuvat ja musiikki samassa istunnossa.",
    img: "/20/megavisat/mega-viihde.webp",
    pos: "center 42%",
    aihe: "viihde",
  },
  {
    slug: "suomen-kaupungit-mega",
    tag: "Suomen kaupungit",
    desc: "Kiertomatka 20 kaupunkiin: vaakunat, kuuluisat asukkaat ja lempinimet.",
    img: "/20/kaupungit/hero-laura-mikko.webp",
    pos: "center 30%",
    aihe: "Suomen kaupungit",
  },
  {
    slug: "maailman-kolkat-mega",
    tag: "Maantieto",
    desc: "Syrjäisimmät saaret, ääripäät ja paikat kartan reunoilla.",
    img: "/20/megavisat/mega-maailmankolkat.webp",
    pos: "center 50%",
    aihe: "maailman kolkat",
  },
];

/** MEGA-kuvamerkki heron oikeaan palstaan (kulta teksti mustalla,
    mix-blend-mode: screen syö mustan pohjan hero-taustaan). */
export const MEGA_WORD_MARK = "/20/megavisat/mega-word.webp";

/** Kesto johdetaan kysymysmäärästä (README). */
export function megaDuration(questionCount: number): string {
  if (questionCount <= 20) return "~8 min";
  if (questionCount <= 50) return "~20 min";
  return "~40 min";
}

type Sb = NonNullable<ReturnType<typeof getSupabase>>;

/** Pelattavien kysymysten määrä megaa kohden (Heikki 20.10.2026: luvut datasta, ei kovakoodattuina).
    Lasketaan mega_questions-linkeistä ne, joiden kysymys tai kuva näkyy julkiselle lukijalle — RLS piilottaa
    luonnosvisojen kysymykset, joten Yleistiedon megassa on 50 linkkiä mutta 45 pelattavaa. Sama luku kuin pelissä. */
export async function megaMaarat(sb: Sb, megaIds: string[]): Promise<Map<string, number>> {
  const maarat = new Map<string, number>();
  if (!megaIds.length) return maarat;
  const { data } = await sb.from("mega_questions" as never).select("mega_quiz_id, question_id, kuvavisa_id").in("mega_quiz_id", megaIds);
  const linkit = (data ?? []) as unknown as Array<{ mega_quiz_id: string; question_id: string | null; kuvavisa_id: string | null }>;
  const nakyvat = new Set<string>();
  const hae = async (taulu: "questions" | "kuvavisas", idt: string[]) => {
    for (let i = 0; i < idt.length; i += 100) {
      const { data: rivit } = await sb.from(taulu).select("id").in("id", idt.slice(i, i + 100));
      for (const r of (rivit ?? []) as unknown as Array<{ id: string }>) nakyvat.add(r.id);
    }
  };
  await Promise.all([
    hae("questions", [...new Set(linkit.flatMap((l) => (l.question_id ? [l.question_id] : [])))]),
    hae("kuvavisas", [...new Set(linkit.flatMap((l) => (l.kuvavisa_id ? [l.kuvavisa_id] : [])))]),
  ]);
  for (const l of linkit) {
    const id = l.question_id ?? l.kuvavisa_id;
    if (id && nakyvat.has(id)) maarat.set(l.mega_quiz_id, (maarat.get(l.mega_quiz_id) ?? 0) + 1);
  }
  return maarat;
}

/** Kuvaustekstin kysymysmäärä todelliseksi: "50 kysymystä …" / "… 50 kysymyksessä" → pelattava määrä. */
export const maaraTekstiin = (teksti: string, n: number) => teksti.replace(/\d+(?=\s+kysymy)/g, String(n));

/** "20–50" tai yksi luku, kun kaikissa megoissa on yhtä monta kysymystä. */
export function maaraVali(maarat: number[]): string | null {
  if (!maarat.length) return null;
  const min = Math.min(...maarat), max = Math.max(...maarat);
  return min === max ? String(min) : `${min}–${max}`;
}
