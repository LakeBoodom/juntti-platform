// ÄÄNIVISAT (toteutusbrief TOTEUTUSBRIEF_LUONTO_JA_AANIVISAT.md vaiheet 2–4, 8.10.2026).
// Tämä tiedosto kelpaa myös selaimeen: tyypit, ryhmien tekstit, arviotekstit ja tallenneavain.
// Kanta-haut ovat palvelimella (lib/aanivisat/data.ts).

export type AaniRyhma = "suomen_linnut" | "suomen_elaimet" | "meren_aanet" | "maailman_linnut" | "maailman_elaimet";

export type RyhmaMeta = {
  key: AaniRyhma;
  /** URL-osa: /aanivisa/<polku> */
  polku: string;
  nimi: string;
  /** "Tunnistin 7/10 lintua äänestä" */
  monikko: string;
  /** Pelin ja kortin otsikko: "Suomen linnut" (Heikki 11.10.2026: "äänestä" pois) */
  otsikko: string;
  /** Introteksti (ei lajinimiä) */
  kuvaus: string;
  /** Luonto-kortin lyhyt kuvaus */
  kortti: string;
  /** Etusivun bannerin otsikko ja ingressi (ei lajinimeä) */
  banneri: string;
  banneriIngressi: string;
  /** Aloitusnäkymän kuva (design "TN Aanivisat – bannerit ja hero" 11.10.2026): leveä ≥ 1100 px, pysty kapeammilla.
      Kuplien tekstit ovat HTML:ää kuvan päällä (sijainti % kuvan alueesta, fonttikoko cqw kuvan leveydestä). */
  hero?: { levea: KuvaKuplat; pysty: KuvaKuplat };
};

export type Kupla = { teksti: string; x: number; y: number; w: number; h: number; fs: number };
export type KuvaKuplat = { src: string; pieni: string; leveys: number; korkeus: number; kuplat: Kupla[] };

/** Uusi ryhmä = uusi rivi; näkyy vasta, kun kannassa on ≥ AANIVISA_MIN aktiivista ääntä. */
export const AANI_RYHMAT: RyhmaMeta[] = [
  {
    key: "suomen_linnut",
    polku: "suomen-linnut",
    nimi: "Suomen linnut",
    monikko: "lintua",
    otsikko: "Suomen linnut",
    kuvaus: "Kymmenen lintua, kymmenen ääntä. Tunnistatko lajin pelkästä laulusta?",
    kortti: "Tunnistatko lajin pelkästä laulusta? Uudet äänet maanantaisin.",
    banneri: "Kuka siellä laulaa?",
    banneriIngressi: "Tunnista Suomen linnut äänestä.",
    /* Kuvan linnut (käki, talitiainen, varis, huuhkaja) ovat myös visan poolissa. Siksi kuplat eivät soita ääntä
       (design suositteli; odottaa Heikin päätöstä), vain ääntä kuvaava sana. Sama kuva on etusivun bannerissa. */
    hero: {
      levea: {
        src: "/20/aanivisat/hero/suomen_linnut-levea.webp", pieni: "/20/aanivisat/hero/suomen_linnut-levea-1200.webp", leveys: 1916, korkeus: 821,
        kuplat: [
          { teksti: "Kukkuu", x: 67.4, y: 8.4, w: 11.8, h: 14.4, fs: 1.79 },
          { teksti: "Ti-ti-tyy", x: 84.3, y: 15.2, w: 8.7, h: 12.9, fs: 1.21 },
          { teksti: "Kraa kraa", x: 69.3, y: 52, w: 10.3, h: 14.6, fs: 1.36 },
          { teksti: "Huu-u", x: 94.2, y: 28.7, w: 10.8, h: 14.3, fs: 1.72 },
        ],
      },
      pysty: {
        src: "/20/aanivisat/hero/suomen_linnut-pysty.webp", pieni: "/20/aanivisat/hero/suomen_linnut-pysty-780.webp", leveys: 1122, korkeus: 1402,
        kuplat: [
          { teksti: "Kukkuu", x: 85.8, y: 13.3, w: 22, h: 10, fs: 3.43 },
          { teksti: "Ti-ti-tyy", x: 89, y: 44, w: 18.1, h: 8.9, fs: 2.42 },
        ],
      },
    },
  },
];

export const AANIVISA_MIN = 10;
export const AANIVISA_KYSYMYKSIA = 10;

export const ryhmaPolusta = (polku: string) => AANI_RYHMAT.find((r) => r.polku === polku) ?? null;
export const ryhmaAvaimella = (key: string) => AANI_RYHMAT.find((r) => r.key === key) ?? null;
export const aanivisaHref = (r: RyhmaMeta) => `/aanivisa/${r.polku}`;

export type SonoTick = { hz: number; y: number };

export type AaniKysymys = {
  id: string;
  laji: string;
  tieteellinen: string | null;
  aanityyppi: string | null;
  vaihtoehdot: string[];
  fakta: string | null;
  audio: string;
  /** Yhden toiston pituus (s); tiedostossa sama jakso kahdesti + tauko. */
  jakso: number;
  tauko: number;
  sono: string;
  ticks: SonoTick[];
  /** lahde = lähdesivu (GBIF-havainto, varalla äänitiedosto) */
  aani: { tekija: string; lisenssi: string; lahde: string; maa: string | null };
  kuva: { url: string; tekija: string | null; lisenssi: string | null; lahde: string | null } | null;
};

export type AaniViikko = {
  ryhma: RyhmaMeta;
  vuosi: number;
  viikko: number;
  kysymykset: AaniKysymys[];
};

/** Tulosruudun arvio (brief §2.4). */
export function arvio(oikein: number, kaikki = AANIVISA_KYSYMYKSIA): string {
  if (oikein >= kaikki) return "Täydellinen korva!";
  if (oikein >= 8) return "Erinomainen korva!";
  if (oikein >= 6) return "Hyvä korva!";
  if (oikein >= 4) return "Korva herää!";
  return "Hyvä alku – nyt tunnet uusia ääniä.";
}

/** Oma tulos laitteelle: Luonnon kortti näyttää "Tuloksesi 7/10". */
export const tulosAvain = (ryhma: AaniRyhma, vuosi: number, viikko: number) => `tn-aani-${ryhma}-${vuosi}-${viikko}`;
export type AaniTallenne = { oikein: number; kaikki: number; vastaukset: boolean[] };

export function lueTulos(ryhma: AaniRyhma, vuosi: number, viikko: number): AaniTallenne | null {
  try {
    const v = JSON.parse(localStorage.getItem(tulosAvain(ryhma, vuosi, viikko)) ?? "null");
    return v && typeof v.oikein === "number" && typeof v.kaikki === "number" ? (v as AaniTallenne) : null;
  } catch {
    return null;
  }
}

/** Ääni-kytkimen tila laitteella (oletus päällä). */
export const KYTKIN_AVAIN = "tn-aani-autosoitto";

/** Pisteet kuten aikuisten tavallisessa visassa (GameClient: 100 + putkibonus 50/oikein putkessa). */
export const PERUSPISTEET = 100;
export const PUTKIBONUS = 50;

export const aika = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
