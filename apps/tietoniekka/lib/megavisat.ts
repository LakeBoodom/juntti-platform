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

export type MegaCard = {
  slug: string;
  /** Aihetagi kortissa (README:n data-taulukko, sanasta sanaan). */
  tag: string;
  /** Kuvausteksti kortissa (README:n data-taulukko, sanasta sanaan). */
  desc: string;
  img: string;
  /** background-position (CSS object-position-arvona). */
  pos: string;
};

export const MEGA_FEATURED: MegaCard = {
  slug: "suuri-mega-50",
  tag: "Kaikki aiheet",
  desc: "Sekoitus jokaisesta kokoelmasta — kysymykset kaikilta tuotteen alueilta samassa istunnossa.",
  img: "/20/megavisat/mega-yleistieto.webp",
  pos: "center 42%",
};

export const MEGA_GRID: MegaCard[] = [
  {
    slug: "sm-liiga-megavisa",
    tag: "Urheilu · Jääkiekko",
    desc: "Mestaruudet, legendat ja ulkomaalaisvahvistukset liigan historiassa.",
    img: "/20/megavisat/mega-smliiga.webp",
    pos: "center 22%",
  },
  {
    slug: "valioliiga-megavisa",
    tag: "Urheilu · Jalkapallo",
    desc: "Maalikuninkaat, siirrot ja mestaruudet kaudesta 1992 alkaen.",
    img: "/20/megavisat/mega-valioliiga.webp",
    pos: "center 40%",
  },
  {
    slug: "tv-ja-suoratoisto-mega",
    tag: "TV & suoratoisto",
    desc: "Suosituimmat sarjat Suomesta ja maailmalta — sohvaperunoiden loppukoe.",
    img: "/20/megavisat/mega-tv.webp",
    pos: "center 40%",
  },
  {
    slug: "kaikki-suomesta-mega",
    tag: "Suomi",
    desc: "Historia, kulttuuri ja luonto: kuinka hyvin tunnet Suomen?",
    img: "/20/megavisat/mega-suomi.webp",
    pos: "center 55%",
  },
  {
    slug: "viihdemaailman-megavisa",
    tag: "Viihde",
    desc: "Julkkikset, elokuvat ja musiikki samassa istunnossa.",
    img: "/20/megavisat/mega-viihde.webp",
    pos: "center 42%",
  },
  {
    slug: "suomen-kaupungit-mega",
    tag: "Suomen kaupungit",
    desc: "Kiertomatka 20 kaupunkiin: vaakunat, kuuluisat asukkaat ja lempinimet.",
    img: "/20/kaupungit/hero-laura-mikko.webp",
    pos: "center 30%",
  },
  {
    slug: "maailman-kolkat-mega",
    tag: "Maantieto",
    desc: "Syrjäisimmät saaret, ääripäät ja paikat kartan reunoilla.",
    img: "/20/megavisat/mega-maailmankolkat.webp",
    pos: "center 50%",
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
