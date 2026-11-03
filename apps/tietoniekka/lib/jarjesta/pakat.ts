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
    /** Vain nämä entiteetit nimen mukaan (esim. Suomen järvet maailman järvien joukosta). */
    vainNimet?: string[];
    /** Nämä pois (esim. Ukko-Koli on vaara, ei tunturi). */
    poisNimet?: string[];
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
  /** Hubin pakkakortti. `kuvat`: kolme kasvoa (public/, 240×320) rinnakkain tai yksi valokuva (16:10).
   *  Ilman kuvia kortti näyttää puolikaarimotiivin. Krediitit lib/kuvalahteet.ts. */
  kortti: { otsikko: string; meta: string; kuvat?: string[] };
  /** Pelimuotokorttien kuva (public/, n. 720 px leveä). */
  korttikuva: string;
  /** Hubin pyörylän kuva, jos eri kuin korttikuva: yksi kasvo tai kokonainen vaakuna (CD 2a, Heikki 2.11.2026). */
  hubKuva?: string;
  /** Kuvana tunnus (vaakuna): näytetään kokonaisena, ei rajausta (CD 3e). */
  tunnus?: boolean;
  /** Hubin "Lisää järjestettävää" -ryhmä. */
  ryhma: "paikat" | "politiikka";
  /** Pelin lause (CD 3d): peruste ja suunta. */
  pelilause: string;
  /** Listan ylä- ja alapään merkit ("↑ Korkein", "↓ Matalin"). */
  ylin: string;
  alin: string;
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
    pick: 8,
    collection: VAALIT,
    kortti: { otsikko: "Presidentit", meta: "Virkaanastuminen", kuvat: ["/20/vaalit/kasvot/paasikivi.webp", "/20/vaalit/kasvot/koivisto.webp", "/20/vaalit/kasvot/niinisto.webp"] },
    kuva: VAALIT_KUVA,
    korttikuva: "/20/vaalit/pakat/presidentit.webp",
    pelilause: "Presidentit virkaanastumisen mukaan, ensimmäinen ensin.",
    ylin: "Ensimmäinen",
    alin: "Viimeisin",
    ryhma: "politiikka",
    hubKuva: "/20/vaalit/kasvot/halonen.webp",
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
    pick: 8,
    collection: VAALIT,
    kortti: { otsikko: "Pääministerit", meta: "Aikajärjestys", kuvat: ["/20/vaalit/kasvot/holkeri.webp", "/20/vaalit/kasvot/aho.webp", "/20/vaalit/kasvot/marin.webp"] },
    kuva: VAALIT_KUVA,
    korttikuva: "/20/vaalit/pakat/paaministerit.webp",
    pelilause: "Pääministerit ensimmäisen kauden mukaan, varhaisin ensin.",
    ylin: "Varhaisin",
    alin: "Viimeisin",
    ryhma: "politiikka",
    hubKuva: "/20/vaalit/kasvot/holkeri.webp",
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
    kortti: { otsikko: "Pääministerikaudet", meta: "Kauden pituus", kuvat: ["/20/vaalit/kasvot/kallio.webp", "/20/vaalit/kasvot/lipponen.webp", "/20/vaalit/kasvot/vanhanen.webp"] },
    kuva: VAALIT_KUVA,
    korttikuva: "/20/vaalit/pakat/paaministerit-kesto.webp",
    pelilause: "Pääministerit kausien yhteispituuden mukaan, pisin ensin.",
    ylin: "Pisin",
    alin: "Lyhin",
    ryhma: "politiikka",
    hubKuva: "/20/vaalit/kasvot/vanhanen.webp",
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
    kortti: { otsikko: "Eduskuntavuodet", meta: "Vuosia talossa", kuvat: ["/20/vaalit/kasvot/zyskowicz.webp", "/20/vaalit/kasvot/tuomioja.webp", "/20/vaalit/kasvot/rasanen.webp"] },
    kuva: VAALIT_KUVA,
    korttikuva: "/20/vaalit/pakat/eduskunta-pisimpaan.webp",
    pelilause: "Kansanedustajat eduskuntavuosien mukaan, pisimpään ollut ensin.",
    ylin: "Eniten vuosia",
    alin: "Vähiten vuosia",
    ryhma: "politiikka",
    hubKuva: "/20/vaalit/kasvot/tuomioja.webp",
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
    kortti: { otsikko: "Eduskuntaryhmät", meta: "Paikkamäärä", kuvat: ["/20/vaalit/pakat/eduskuntaryhmat.webp"] },
    kuva: VAALIT_KUVA,
    korttikuva: "/20/vaalit/pakat/eduskuntaryhmat.webp",
    hubKuva: "/20/jarjesta/pyorylat/eduskuntaryhmat.webp",
    pelilause: "Eduskuntaryhmät koon mukaan, suurin ensin.",
    ylin: "Suurin",
    alin: "Pienin",
    ryhma: "politiikka",
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
    pick: 8,
    piilotaKuva: true,
    collection: VAALIT,
    kortti: { otsikko: "Puolueiden ikä", meta: "Perustamisvuosi", kuvat: ["/20/vaalit/pakat/puolueet-ika.webp"] },
    kuva: VAALIT_KUVA,
    korttikuva: "/20/vaalit/pakat/puolueet-ika.webp",
    hubKuva: "/20/jarjesta/pyorylat/puolueet-ika.webp",
    pelilause: "Puolueet perustamisvuoden mukaan, vanhin ensin.",
    ylin: "Vanhin",
    alin: "Nuorin",
    ryhma: "politiikka",
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
    kortti: { otsikko: "Vaalipiirit", meta: "Paikkamäärä", kuvat: ["/20/vaalit/pakat/vaalipiirit-paikat.webp"] },
    kuva: VAALIT_KUVA,
    korttikuva: "/20/vaalit/pakat/vaalipiirit-paikat.webp",
    hubKuva: "/20/jarjesta/pyorylat/vaalipiirit-paikat.webp",
    pelilause: "Vaalipiirit paikkamäärän mukaan, eniten paikkoja ensin.",
    ylin: "Eniten paikkoja",
    alin: "Vähiten paikkoja",
    ryhma: "politiikka",
  },

  // ── Luonto ja maantieto (Heikki 31.10.2026: "ei ihmisiä – tuntureita ja niiden korkeus jne.") ──
  {
    slug: "tunturit-korkeus",
    julkaistu: true,
    otsikko: "tunturit korkeuden mukaan",
    seoTitle: "Järjestä: Suomen tunturit korkeuden mukaan",
    kuvaus: "Järjestä kahdeksan Suomen tunturia korkeuden mukaan korkeimmasta matalimpaan.",
    rajaus: "Suomen tunnetuimmat tunturit, korkein huippu metreinä merenpinnasta (Wikidata).",
    suunta: "Korkein ylimmäksi",
    kind: "fell",
    attrKey: "height_m",
    scope: "",
    direction: "desc",
    /* Alle 10 m:n erot (Halti 1 324 / Ridnitšohkka 1 317, Pyhä 540 / Kiilopää 546) eivät samaan kierrokseen. */
    vali: { tapa: "absoluuttinen", min: 10 },
    yksikko: "m",
    pick: 8,
    pool: { poisNimet: ["Ukko-Koli"] },
    piilotaKuva: true,
    rooliAttr: "fell_kunta",
    collection: { slug: "luonto", nimi: "Luonto" },
    kortti: { otsikko: "Tunturit", meta: "Korkeus" },
    kuva: "/20/luonto/tunturin-salainen-elama-lappi-visa.webp",
    korttikuva: "/20/luonto/k/tunturin-salainen-elama-lappi-visa.webp",
    hubKuva: "/20/jarjesta/pyorylat/tunturit-korkeus.webp",
    pelilause: "Tunturit korkeuden mukaan, korkein ensin.",
    ylin: "Korkein",
    alin: "Matalin",
    ryhma: "paikat",
  },
  {
    slug: "vuoret-korkeus",
    julkaistu: true,
    otsikko: "maailman vuoret korkeuden mukaan",
    seoTitle: "Järjestä: maailman vuoret korkeuden mukaan",
    kuvaus: "Järjestä kahdeksan maailman tunnettua vuorta korkeuden mukaan korkeimmasta matalimpaan.",
    rajaus: "Tunnettuja vuoria eri mantereilta, korkeus metreinä merenpinnasta (Wikidata).",
    suunta: "Korkein ylimmäksi",
    kind: "mountain",
    attrKey: "mountain_height",
    scope: "",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.03 },
    yksikko: "m",
    pick: 8,
    piilotaKuva: true,
    collection: { slug: "matkakohteet", nimi: "Maantieto" },
    kortti: { otsikko: "Vuoret", meta: "Korkeus" },
    kuva: "/20/maantieto/maailman-korkeimmat-vuoret-visa.webp",
    korttikuva: "/20/maantieto/k/maailman-korkeimmat-vuoret-visa.webp",
    hubKuva: "/20/jarjesta/pyorylat/vuoret-korkeus.webp",
    pelilause: "Vuoret korkeuden mukaan, korkein ensin.",
    ylin: "Korkein",
    alin: "Matalin",
    ryhma: "paikat",
  },
  {
    slug: "jarvet-pinta-ala",
    julkaistu: true,
    otsikko: "Suomen järvet pinta-alan mukaan",
    seoTitle: "Järjestä: Suomen järvet pinta-alan mukaan",
    kuvaus: "Järjestä kahdeksan Suomen järveä pinta-alan mukaan suurimmasta pienimpään.",
    rajaus: "Suomen tunnettuja järviä, pinta-ala neliökilometreinä (km²).",
    suunta: "Suurin ylimmäksi",
    kind: "lake",
    attrKey: "area_km2",
    scope: "",
    direction: "desc",
    /* Lähteet eroavat muutamalla prosentilla (Inarijärvi 1 040–1 082 km²) → vähintään 8 %:n ero. */
    vali: { tapa: "suhteellinen", min: 0.08 },
    yksikko: "km²",
    pick: 8,
    /* Kilpisjärvi pois: lähteiden pinta-alat eroavat (15 / 37 km²). */
    pool: { vainNimet: ["Saimaa", "Päijänne", "Inarijärvi", "Pielinen", "Oulujärvi", "Pihlajavesi", "Orivesi", "Haukivesi", "Keitele", "Kallavesi", "Puruvesi", "Puula", "Lokan tekojärvi", "Höytiäinen", "Näsijärvi", "Lappajärvi", "Vesijärvi", "Vanajavesi", "Keurusselkä", "Tuusulanjärvi", "Bodominjärvi"] },
    piilotaKuva: true,
    collection: { slug: "luonto", nimi: "Luonto" },
    kortti: { otsikko: "Järvet", meta: "Pinta-ala" },
    kuva: "/20/luonto/jarvien-katketyt-ihmeet-visa.webp",
    korttikuva: "/20/luonto/k/jarvien-katketyt-ihmeet-visa.webp",
    hubKuva: "/20/jarjesta/pyorylat/jarvet-pinta-ala.webp",
    pelilause: "Järvet pinta-alan mukaan, suurin ensin.",
    ylin: "Suurin",
    alin: "Pienin",
    ryhma: "paikat",
  },
  {
    slug: "kaupungit-asukasluku",
    julkaistu: true,
    otsikko: "kaupungit asukasluvun mukaan",
    seoTitle: "Järjestä: Suomen kaupungit asukasluvun mukaan",
    kuvaus: "Järjestä kahdeksan Suomen kaupunkia asukasluvun mukaan suurimmasta pienimpään.",
    rajaus: "Suomen kaupungit, asukasluku Tilastokeskuksen mukaan 31.12.2025.",
    suunta: "Suurin ylimmäksi",
    kind: "city",
    attrKey: "population",
    scope: "",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.05 },
    yksikko: "asukasta",
    pick: 8,
    piilotaKuva: true,
    naytaRooli: true,
    collection: { slug: "kaupungit", nimi: "Suomen kaupungit" },
    kortti: { otsikko: "Kaupungit", meta: "Asukasluku" },
    kuva: "/20/kaupungit/helsinki.webp",
    korttikuva: "/20/kaupungit/k/helsinki.webp",
    hubKuva: "/20/jarjesta/pyorylat/kaupungit-asukasluku.webp",
    pelilause: "Kaupungit asukasluvun mukaan, suurin ensin.",
    ylin: "Suurin",
    alin: "Pienin",
    ryhma: "paikat",
  },
  {
    slug: "maakunnat-pinta-ala",
    julkaistu: true,
    otsikko: "maakunnat pinta-alan mukaan",
    seoTitle: "Järjestä: Suomen maakunnat pinta-alan mukaan",
    kuvaus: "Järjestä kahdeksan Suomen maakuntaa maa-alan mukaan suurimmasta pienimpään.",
    rajaus: "Suomen 19 maakuntaa, maa-ala neliökilometreinä Maanmittauslaitoksen mukaan.",
    suunta: "Suurin ylimmäksi",
    kind: "region",
    attrKey: "region_area",
    scope: "",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.04 },
    yksikko: "km²",
    pick: 8,
    collection: { slug: "kaupungit", nimi: "Suomen kaupungit" },
    kortti: { otsikko: "Maakunnat", meta: "Pinta-ala" },
    kuva: "/20/jarjesta/maakunnat.webp",
    korttikuva: "/20/jarjesta/maakunnat.webp",
    pelilause: "Maakunnat pinta-alan mukaan, suurin ensin.",
    ylin: "Suurin",
    alin: "Pienin",
    ryhma: "paikat",
    hubKuva: "/20/jarjesta/vaakunat/uusimaa.webp",
    tunnus: true,
  },
  // ── Ensimmäiset pakat (3.10.2026): Kansallispuistot julkaistu 31.10.2026 (Järjestä-hub), Leijonat ja Tappara odottavat hyväksyntää ──
  {
    slug: "kansallispuistot-pinta-ala",
    julkaistu: true,
    otsikko: "kansallispuistot pinta-alan mukaan",
    seoTitle: "Laita järjestykseen: Suomen kansallispuistot pinta-alan mukaan",
    kuvaus: "Järjestä kahdeksan Suomen kansallispuistoa pinta-alan mukaan suurimmasta pienimpään.",
    rajaus: "Kaikki Suomen 41 kansallispuistoa, pinta-ala neliökilometreinä (km²).",
    suunta: "Suurin pinta-ala ensin",
    kind: "park",
    attrKey: "park_area_km2",
    scope: "",
    direction: "desc",
    vali: { tapa: "suhteellinen", min: 0.05 },
    yksikko: "km²",
    pick: 8,
    piilotaKuva: true,
    naytaRooli: true,
    collection: { slug: "luonto", nimi: "Luonto" },
    kortti: { otsikko: "Kansallispuistot", meta: "Pinta-ala" },
    kuva: "/20/luonto/suomen-kansallispuistot-visa.webp",
    korttikuva: "/20/luonto/k/suomen-kansallispuistot-visa.webp",
    hubKuva: "/20/jarjesta/pyorylat/kansallispuistot-pinta-ala.webp",
    pelilause: "Kansallispuistot pinta-alan mukaan, suurin ensin.",
    ylin: "Suurin",
    alin: "Pienin",
    ryhma: "paikat",
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
    pick: 8,
    pool: { syntynytVahintaan: 1960 },
    collection: { slug: "jaakiekko", nimi: "Jääkiekko" },
    kortti: { otsikko: "Leijonat", meta: "Maaottelut" },
    kuva: "/20/jaakiekko/jk-leijonat-mm2019-kuva.webp",
    korttikuva: "/20/jaakiekko/jk-leijonat-mm2019-kuva.webp",
    pelilause: "Leijonat maaottelujen mukaan, eniten pelannut ensin.",
    ylin: "Eniten",
    alin: "Vähiten",
    ryhma: "paikat",
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
    pick: 8,
    pool: { syntynytVahintaan: 1960 },
    collection: { slug: "jaakiekko", nimi: "Jääkiekko" },
    kortti: { otsikko: "Tappara", meta: "Pistepörssi" },
    kuva: "/20/jaakiekko/jk-tappara-kuva.webp",
    korttikuva: "/20/jaakiekko/jk-tappara-kuva.webp",
    pelilause: "Tapparalaiset pisteiden mukaan, eniten tehnyt ensin.",
    ylin: "Eniten",
    alin: "Vähiten",
    ryhma: "paikat",
  },
];

export const JULKAISTUT = PAKAT.filter((p) => p.julkaistu);

export const haePakka = (slug: string) => JULKAISTUT.find((p) => p.slug === slug) ?? null;

export const pakkaHref = (p: Pakka) => `/peli/jarjesta/${p.slug}`;

/** Yksi arvottu kohde. Rakenne on RankingCardPerson-yhteensopiva (id, name, role, image_url). */
export type JarjestysKohde = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  hideThumb?: boolean;
  /** Kuva on tunnus (vaakuna): kokonaisena, ei rajausta. */
  tunnus?: boolean;
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
