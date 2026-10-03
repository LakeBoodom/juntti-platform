// LAITA JÄRJESTYKSEEN — pakat (brief TOTEUTUSBRIEF_JARJESTA_JA_KARTTAPELI §2, 3.10.2026).
//
// Pakka = konfiguraatio, ei kantataulu. Data tulee fact_entities + fact_attributes -tauluista
// (attrKey + scope). Peli EI riipu fact_attribute_defs.enabled-kytkimestä: se koskee vain
// Kumpi?-peliä, ja julkinen luku defs-tauluun on sallittu vain enabled-riveille. Siksi pakka
// kantaa itse arvontavälin (`vali`, kopioitu defin min_gap/gap_mode-arvoista) ja yksikön.
//
// Tämä tiedosto on tavallinen moduuli (ei "use server"), joten sitä voi käyttää sekä
// palvelimella (sivu, OG-kuva, sitemap) että clientillä.

export type Pakka = {
  slug: string;
  /** Sivun H1 "Laita järjestykseen: <otsikko>" ja korttien nimi. */
  otsikko: string;
  /** <title> ilman sivuston nimeä. */
  seoTitle: string;
  /** Meta description ja aloitusnäkymän kuvaus. */
  kuvaus: string;
  /** Lähdedatan todellinen kattavuus, näytetään aina (brief §2). */
  rajaus: string;
  /** Suuntamerkin teksti (lyhyt — merkki on 28 px korkea pilleri). */
  suunta: string;
  kind: string;
  attrKey: string;
  /** '' = koko ura / oletus; muuten esim. seura ('Tappara'). */
  scope: string;
  /** desc = suurin ylimpänä, asc = pienin (vanhin) ylimpänä. */
  direction: "asc" | "desc";
  /** Arvottavien kohteiden vähimmäisero, jotta järjestys on yksikäsitteinen. */
  vali: { tapa: "suhteellinen" | "absoluuttinen"; min: number };
  /** Lisätään pelkän luvun perään ("101" → "101 maaottelua"). */
  yksikko: string;
  pick: number;
  pool?: { maxProminence?: 1 | 2 | 3 };
  /** Kohteilla ei ole kuvia → kortti ilman kuvapaikkaa (henkilöillä siluetti riittää). */
  piilotaKuva?: boolean;
  collection: { slug: string; nimi: string };
  /** Jakokuvan taustakuva (public/). */
  kuva: string;
};

export const PAKAT: Pakka[] = [
  {
    slug: "kansallispuistot-pinta-ala",
    otsikko: "kansallispuistot suurimmasta pienimpään",
    seoTitle: "Laita järjestykseen: Suomen kansallispuistot pinta-alan mukaan",
    kuvaus: "Järjestä kymmenen Suomen kansallispuistoa pinta-alan mukaan suurimmasta pienimpään.",
    rajaus: "Kaikki Suomen 41 kansallispuistoa.",
    suunta: "Suurimmasta pienimpään",
    kind: "park",
    attrKey: "park_area_km2",
    scope: "",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.05 },
    yksikko: "km²",
    pick: 10,
    piilotaKuva: true,
    collection: { slug: "luonto", nimi: "Luonto" },
    kuva: "/20/teema-luonto.webp",
  },
  {
    slug: "leijonat-maaottelut",
    otsikko: "Leijonien maaotteluennätykset",
    seoTitle: "Laita järjestykseen: eniten maaotteluita pelanneet Leijonat",
    kuvaus: "Järjestä kymmenen Leijonien pelaajaa maaotteluiden määrän mukaan – eniten pelannut ylimmäksi.",
    rajaus: "Suomen jääkiekkomaajoukkueen kaikkien aikojen tilasto 1928–2025, pelaajat joilla yli 100 maaottelua.",
    suunta: "Eniten otteluita ensin",
    kind: "player",
    attrKey: "nt_games",
    scope: "",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.04 },
    yksikko: "maaottelua",
    pick: 10,
    collection: { slug: "jaakiekko", nimi: "Jääkiekko" },
    kuva: "/20/jaakiekko/jk-leijonat-mm2019-kuva.webp",
  },
  {
    slug: "tappara-pisteet",
    otsikko: "Tapparan pistepörssi",
    seoTitle: "Laita järjestykseen: Tapparan kaikkien aikojen pistepörssi",
    kuvaus: "Järjestä kymmenen Tapparan pelaajaa SM-liigapisteiden mukaan – eniten pisteitä kerännyt ylimmäksi.",
    rajaus: "SM-liigan runkosarja 1975–, pisteet Tapparan paidassa.",
    suunta: "Eniten pisteitä ensin",
    kind: "player",
    attrKey: "liiga_points",
    scope: "Tappara",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.04 },
    yksikko: "pistettä",
    pick: 10,
    collection: { slug: "jaakiekko", nimi: "Jääkiekko" },
    kuva: "/20/jaakiekko/jk-tappara-kuva.webp",
  },
];

export const haePakka = (slug: string) => PAKAT.find((p) => p.slug === slug) ?? null;

export const pakkaHref = (p: Pakka) => `/peli/jarjesta/${p.slug}`;

/** Yksi arvottu kohde. Rakenne on RankingCardPerson-yhteensopiva (id, name, role, image_url). */
export type JarjestysKohde = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  hideThumb?: boolean;
  value: number;
  /** Valmis näyttöteksti ("2 858 km²", "331 maaottelua"). */
  valueLabel: string;
  /** Lähteen verkkotunnus ("liiga.fi") tai null. */
  lahde: string | null;
};

/** Oikea järjestys pakan suunnan mukaan. */
export function oikeaJarjestys(kohteet: JarjestysKohde[], direction: Pakka["direction"]): JarjestysKohde[] {
  const s = [...kohteet].sort((a, b) => a.value - b.value);
  return direction === "asc" ? s : s.reverse();
}
