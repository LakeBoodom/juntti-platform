// LAITA JÄRJESTYKSEEN — pakat (brief TOTEUTUSBRIEF_JARJESTA_JA_KARTTAPELI §2 3.10.2026 + vaalit-brief §2 5.10.2026).
//
// Pakka = konfiguraatio, ei kantataulu. Data tulee fact_entities + fact_attributes -tauluista
// (attrKey + scope). Peli EI riipu fact_attribute_defs.enabled-kytkimestä: se koskee vain
// Kumpi?-peliä. Siksi pakka kantaa itse arvontavälin (`vali`) ja yksikön.
//
// Kaikki pakat: `pick` kohdetta eri arvoilla (tasapelit sallitaan vain, jos muuten ei saada täyttä
// kierrosta), paljastuksessa display_value + lähteen verkkotunnus, kuvat joko kaikille tai ei kenellekään.
//
// Tämä tiedosto on tavallinen moduuli (ei "use server"), joten sitä voi käyttää sekä
// palvelimella (sivu, OG-kuva, sitemap, pelirekisteri) että clientillä.

export type Pakka = {
  slug: string;
  /** false = konfiguraatio valmiina, mutta ei sivua/sitemapia/hubiriviä (odottaa hyväksyntää). */
  julkaistu: boolean;
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
  /** Lisätään arvon eteen ("1899" → "perustettu 1899"). */
  etuliite?: string;
  pick: number;
  pool?: {
    maxProminence?: 1 | 2 | 3;
    /** Vain tänä vuonna tai myöhemmin syntyneet (attr `birth`). Heikki 3.10.: Leijonat ja Tappara 1960+
     *  ≈ ura 1980-luvulta. Kohde, jolta syntymäaika puuttuu, pidetään mukana (ei pudoteta datan aukon takia). */
    syntynytVahintaan?: number;
    /** Vain kohteet, joiden toinen attribuutti on tämä luku (esim. mp_sitting = 1). */
    ehto?: { attrKey: string; num: number };
    /** Kierroksessa vähintään `maara` tunnettua: henkilöllä celebrity_id tai pakan arvo ≥ `arvoVahintaan`. */
    tunnettuja?: { maara: number; arvoVahintaan: number };
  };
  /** Tekstikortit: ei kuvapaikkaa koskaan. Muuten kuvat näytetään vain, jos kaikilla on kuva. */
  piilotaKuva?: boolean;
  /** Näytä kortilla rooli ilman lajia ("kansallispuisto · Lappi" → "Lappi"). Muuten ei roolia. */
  naytaRooli?: boolean;
  /** Kortin rooli toisen attribuutin tekstiarvosta (esim. mp_party → "Kokoomus"). */
  rooliAttr?: string;
  /** Kortin nimi: entiteetin nimi (oletus) tai role_label (vaalipiirit: "Savo-Karjala"). */
  nimiKentta?: "name" | "role_label";
  collection: { slug: string; nimi: string };
  /** Hubin pakkakortti. */
  kortti: { otsikko: string; meta: string };
  /** Jakokuvan taustakuva (public/). */
  kuva: string;
};

const VAALIT = { slug: "vaalit", nimi: "Vaalit ja politiikka" };
const VAALIT_KUVA = "/20/vaalit/hero.webp";
/** Eri arvot (epoch-sekunnit, vuodet, paikat): mikä tahansa ero kelpaa. */
const ERI = { tapa: "absoluuttinen", min: 0.001 } as const;

export const PAKAT: Pakka[] = [
  // ── Vaalit ja politiikka (brief 5.10.2026 §2) ──
  {
    slug: "presidentit",
    julkaistu: true,
    otsikko: "tasavallan presidentit",
    seoTitle: "Laita järjestykseen: Suomen tasavallan presidentit",
    kuvaus: "Laita kahdeksan Suomen presidenttiä järjestykseen sen mukaan, milloin heidän kautensa alkoi.",
    rajaus: "Suomen tasavallan presidentit vuodesta 1919, järjestys virkakauden alkamispäivän mukaan.",
    suunta: "Ensimmäinen ylimmäksi",
    kind: "person",
    attrKey: "pres_start",
    scope: "",
    direction: "asc",
    vali: ERI,
    yksikko: "",
    etuliite: "presidentiksi",
    pick: 8,
    collection: VAALIT,
    kortti: { otsikko: "Presidentit", meta: "Virkaanastumisjärjestys" },
    kuva: VAALIT_KUVA,
  },
  {
    slug: "paaministerit",
    julkaistu: true,
    otsikko: "pääministerit aikajärjestyksessä",
    seoTitle: "Laita järjestykseen: Suomen pääministerit aikajärjestyksessä",
    kuvaus: "Laita kahdeksan Suomen pääministeriä järjestykseen sen mukaan, milloin heidän pääministerikautensa alkoi.",
    rajaus: "Itsenäisen Suomen pääministerit vuodesta 1917. Usean kauden pääministereillä ratkaisee ensimmäisen kauden alku.",
    suunta: "Varhaisin ylimmäksi",
    kind: "person",
    attrKey: "pm_start",
    scope: "",
    direction: "asc",
    vali: ERI,
    yksikko: "",
    etuliite: "pääministeriksi",
    pick: 8,
    collection: VAALIT,
    kortti: { otsikko: "Pääministerit", meta: "Aikajärjestys" },
    kuva: VAALIT_KUVA,
  },
  {
    slug: "paaministerit-kesto",
    julkaistu: true,
    otsikko: "pisimmät pääministerikaudet",
    seoTitle: "Laita järjestykseen: kuka oli pisimpään Suomen pääministerinä?",
    kuvaus: "Laita kahdeksan pääministeriä järjestykseen sen mukaan, kuinka monta päivää he olivat pääministerinä.",
    rajaus: "Pääministerinä vietetyt päivät yhteensä, kaikki kaudet laskettuna. Istuva pääministeri ei ole mukana, koska kausi on kesken.",
    suunta: "Pisin kausi ylimmäksi",
    kind: "person",
    attrKey: "pm_days",
    scope: "",
    direction: "desc",
    vali: { tapa: "absoluuttinen", min: 30 },
    yksikko: "päivää",
    pick: 8,
    collection: VAALIT,
    kortti: { otsikko: "Pääministerikausien pituus", meta: "Päivinä" },
    kuva: VAALIT_KUVA,
  },
  {
    slug: "eduskunta-pisimpaan",
    julkaistu: true,
    otsikko: "pisimpään eduskunnassa",
    seoTitle: "Laita järjestykseen: pisimpään eduskunnassa istuneet kansanedustajat",
    kuvaus: "Laita kahdeksan istuvaa kansanedustajaa järjestykseen sen mukaan, kuinka kauan he ovat olleet eduskunnassa.",
    rajaus: "Istuvat kansanedustajat, kansanedustajavuodet yhteensä eduskunnan avoimen datan mukaan.",
    suunta: "Pisimpään ylimmäksi",
    kind: "person",
    attrKey: "mp_years",
    scope: "",
    direction: "desc",
    vali: ERI,
    yksikko: "vuotta",
    pick: 8,
    pool: { ehto: { attrKey: "mp_sitting", num: 1 }, tunnettuja: { maara: 3, arvoVahintaan: 15 } },
    piilotaKuva: true,
    rooliAttr: "mp_party",
    collection: VAALIT,
    kortti: { otsikko: "Pisimpään eduskunnassa", meta: "Istuvat kansanedustajat" },
    kuva: VAALIT_KUVA,
  },
  {
    slug: "eduskuntaryhmat",
    julkaistu: true,
    otsikko: "eduskuntaryhmien koko",
    seoTitle: "Laita järjestykseen: eduskuntaryhmät koon mukaan",
    kuvaus: "Laita kahdeksan eduskuntapuoluetta järjestykseen sen mukaan, montako kansanedustajaa niillä on.",
    rajaus: "Istuvan eduskunnan puolueet, kansanedustajien määrä eduskunnan avoimen datan mukaan.",
    suunta: "Suurin ylimmäksi",
    kind: "party",
    attrKey: "party_seats",
    scope: "",
    direction: "desc",
    vali: ERI,
    yksikko: "kansanedustajaa",
    pick: 8,
    piilotaKuva: true,
    collection: VAALIT,
    kortti: { otsikko: "Eduskuntaryhmät", meta: "Koon mukaan" },
    kuva: VAALIT_KUVA,
  },
  {
    slug: "puolueet-ika",
    julkaistu: true,
    otsikko: "puolueiden ikäjärjestys",
    seoTitle: "Laita järjestykseen: eduskuntapuolueet perustamisvuoden mukaan",
    kuvaus: "Laita kahdeksan eduskuntapuoluetta järjestykseen perustamisvuoden mukaan.",
    rajaus: "Istuvan eduskunnan puolueet, perustamisvuosi puolueen Wikipedia-artikkelin mukaan.",
    suunta: "Vanhin ylimmäksi",
    kind: "party",
    attrKey: "party_founded",
    scope: "",
    direction: "asc",
    vali: ERI,
    yksikko: "",
    etuliite: "perustettu",
    pick: 8,
    piilotaKuva: true,
    collection: VAALIT,
    kortti: { otsikko: "Puolueiden ikä", meta: "Perustamisvuosi" },
    kuva: VAALIT_KUVA,
  },
  {
    slug: "vaalipiirit-paikat",
    julkaistu: true,
    otsikko: "vaalipiirien paikkamäärät",
    seoTitle: "Laita järjestykseen: vaalipiirit kansanedustajapaikkojen mukaan",
    kuvaus: "Laita kahdeksan vaalipiiriä järjestykseen sen mukaan, montako kansanedustajaa niistä valitaan.",
    rajaus: "Eduskuntavaalien 13 vaalipiiriä, paikkamäärät vuoden 2023 paikkajaon mukaan.",
    suunta: "Eniten paikkoja ylimmäksi",
    kind: "vaalipiiri",
    attrKey: "vp_seats",
    scope: "",
    direction: "desc",
    vali: ERI,
    yksikko: "paikkaa",
    pick: 8,
    piilotaKuva: true,
    nimiKentta: "role_label",
    collection: VAALIT,
    kortti: { otsikko: "Vaalipiirit", meta: "Paikkamäärän mukaan" },
    kuva: VAALIT_KUVA,
  },

  // ── Ensimmäiset pakat (3.10.2026), odottavat omaa hyväksyntäänsä (CD-kuvat, park_landscape) ──
  {
    slug: "kansallispuistot-pinta-ala",
    julkaistu: false,
    otsikko: "kansallispuistot pinta-alan mukaan",
    seoTitle: "Laita järjestykseen: Suomen kansallispuistot pinta-alan mukaan",
    kuvaus: "Järjestä kymmenen Suomen kansallispuistoa pinta-alan mukaan suurimmasta pienimpään.",
    rajaus: "Kaikki Suomen 41 kansallispuistoa, pinta-ala neliökilometreinä (km²).",
    suunta: "Suurin pinta-ala ensin",
    kind: "park",
    attrKey: "park_area_km2",
    scope: "",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.05 },
    yksikko: "km²",
    pick: 10,
    piilotaKuva: true,
    naytaRooli: true,
    collection: { slug: "luonto", nimi: "Luonto" },
    kortti: { otsikko: "Kansallispuistot", meta: "Pinta-alan mukaan" },
    kuva: "/20/teema-luonto.webp",
  },
  {
    slug: "leijonat-maaottelut",
    julkaistu: false,
    otsikko: "Leijonien maaotteluennätykset",
    seoTitle: "Laita järjestykseen: eniten maaotteluita pelanneet Leijonat",
    kuvaus: "Järjestä kymmenen Leijonien pelaajaa maaotteluiden määrän mukaan – eniten pelannut ylimmäksi.",
    rajaus: "Leijonien kaikkien aikojen pistepörssin kärki, 1960 tai myöhemmin syntyneet pelaajat.",
    suunta: "Eniten otteluita ensin",
    kind: "player",
    attrKey: "nt_games",
    scope: "",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.04 },
    yksikko: "maaottelua",
    pick: 10,
    pool: { syntynytVahintaan: 1960 },
    collection: { slug: "jaakiekko", nimi: "Jääkiekko" },
    kortti: { otsikko: "Leijonat", meta: "Maaottelut" },
    kuva: "/20/jaakiekko/jk-leijonat-mm2019-kuva.webp",
  },
  {
    slug: "tappara-pisteet",
    julkaistu: false,
    otsikko: "Tapparan pistepörssi",
    seoTitle: "Laita järjestykseen: Tapparan kaikkien aikojen pistepörssi",
    kuvaus: "Järjestä kymmenen Tapparan pelaajaa SM-liigapisteiden mukaan – eniten pisteitä kerännyt ylimmäksi.",
    rajaus: "SM-liigan runkosarja 1975–, pisteet Tapparan paidassa. 1960 tai myöhemmin syntyneet pelaajat.",
    suunta: "Eniten pisteitä ensin",
    kind: "player",
    attrKey: "liiga_points",
    scope: "Tappara",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.04 },
    yksikko: "pistettä",
    pick: 10,
    pool: { syntynytVahintaan: 1960 },
    collection: { slug: "jaakiekko", nimi: "Jääkiekko" },
    kortti: { otsikko: "Tappara", meta: "Pistepörssi" },
    kuva: "/20/jaakiekko/jk-tappara-kuva.webp",
  },
];

export const JULKAISTUT = PAKAT.filter((p) => p.julkaistu);

export const haePakka = (slug: string) => JULKAISTUT.find((p) => p.slug === slug) ?? null;

export const pakkaHref = (p: Pakka) => `/peli/jarjesta/${p.slug}`;

/** Kokoelman nimi taivutettuna linkkiin: "Jääkiekko-kokoelmaan", "Vaalit ja politiikka -kokoelmaan". */
export const kokoelmaanTeksti = (nimi: string) => `${nimi}${/\s/.test(nimi) ? " -" : "-"}kokoelmaan →`;

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
