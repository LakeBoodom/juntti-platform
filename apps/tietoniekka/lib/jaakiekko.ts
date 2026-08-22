// JÄÄKIEKKO — teemasivun data ja kuratointi (CD "TN Jaakiekko -teemasivu"
// 22.8.2026, design_handoff_jaakiekko/README.md). Kahdeksas teemasivu; ainoa
// jossa on interaktiivinen komponentti (Suomi-kaukalokartta, KiekkoKartta.tsx).
//
// - Kartan koordinaatit ovat design/teams.json-tiedostosta VERBATIM — niitä
//   EI pyöristetä eikä lasketa uudelleen (README 1a; sidottu jk-suomi-kaukalo-
//   kuvan tarkkaan rajaukseen 1050×1498).
// - Koukut, badget ja korttien copy referenssistä sanasta sanaan. CD:n
//   huomautus: mitään faktaväittämiä (mestaruusmäärät, vuosiluvut, nimet) EI
//   ole faktatarkistettu → tarkistetaan copy/SEO-passissa, ei korjata itse.
// - quizSlug kytkee kortin kantaan: kortti on pelattava kun slugia vastaava
//   JULKAISTU visa löytyy, muuten "Tulossa"-tila (README luku 3). Kartta ja
//   paitaseinä näyttävät aina kaikki 17 seuraa. TPS:llä ja Lukolla ei ole
//   vielä visaa kannassa (22.8.) → quizSlug silti valmiina odottamassa? EI —
//   niille null kunnes Heikki luo visat (slug ei ole tiedossa etukäteen).

/** ── KAUSICONFIG — kaikki kauden vaihtuessa päivittyvä yhdessä paikassa ── */
export const JK_KAUSI = {
  /** Heron tilamerkki */
  statusPill: "Kausipaketti 2026–27",
  /** Kartan oletosvalinta: hallitseva mestari (README 1c — ei kovakoodata indeksiä) */
  defaultTeamId: "tappara",
};

export const JK_ACCENT = "#4FD1F5";
export const JK_ACCENT_LIGHT = "#8FE4FB";

export const JK_HERO = {
  img: "/20/jaakiekko/jk-hero-arena.webp",
  titleLines: ["Kaikki", "jääkiekosta"] as [string, string],
  intro:
    "Liiga, leijonat, legendat ja tarunhohtoinen NHL. Testaa tietosi Suomen suosituimmasta lajista.",
};

export const JK_PERIODS = [
  { kicker: "1. erä", title: "Liiga", meta: "Seurat, legendat, historialliset saavutukset", href: "#liiga" },
  { kicker: "2. erä", title: "Leijonat", meta: "MM, olympialaiset, nuorten MM", href: "#leijonat" },
  { kicker: "3. erä", title: "NHL", meta: "Suomalaiset NHL:ssä", href: "#nhl" },
];

export const JK_COPY = {
  liigaTitle: "Pelaa seuravisa",
  liigaIntro: "Suomi on yksi iso kaukalo. Etsi joukkueesi kartalta tai paitaseinältä.",
  mapFootnote: (n: number) =>
    `Kaukalo on Suomen kartta: siniviivat, punainen keskiviiva ja ${n} seuraa kotikaupungeissaan. Napauta palloa tai nimeä — pallon koko kertoo kaikkien aikojen SM-kullat.`,
  derbyTitle: "Derbyvisat",
  generalKicker: "Jatkoerä",
  generalTitle: "Liigan kohokohdat",
  generalIntro: "Seurarajat ylittävät klassikot: maalivahdit, pistemiehet, penkin takana kiehuvat valmentajat.",
  lionsTitle: "Leijonien kultavisat",
  lionsIntro: "Kaikki Leijonien kultamitalit: viisi MM-kultaa, olympiavoitto ja kolme nuorten maailmanmestaruutta.",
  nhlTitle: "Suomen NHL historia",
  nhlIntro: "Kolme visaa suomalaisista NHL:ssä — pioneereista ennätyksiin ja unohtuneisiin tilastotarinoihin.",
};

/** Kartan pohjakuva — 1050×1498, läpinäkyvä, EI rajattu (koordinaatisto sidottu tähän). */
export const JK_MAP_IMG = "/20/jaakiekko/jk-suomi-kaukalo.webp";
export const JK_MAP_RATIO = "1050 / 1498";

export type JkTeam = {
  id: string;
  name: string;
  short: string;
  city: string;
  arena: string;
  /** Kaikkien aikojen SM-kullat — määrää pallon koon. Kausisidonnainen (joka kevät). */
  sm: number;
  color: string;
  /** Pallon ja nimilapun paikat % kuvasta + lapun ankkuri (design/teams.json verbatim) */
  x: number; y: number; labelX: number; labelY: number; anchor: "l" | "r";
  hook: string;
  /** Osin kausisidonnainen (Tappara "Hallitseva mestari", Jokerit "Paluu 2026") */
  badge: string;
  /** Kannan visa-slug — null = visaa ei vielä ole (CTA "Visa tulossa") */
  quizSlug: string | null;
};

export const JK_TEAMS: JkTeam[] = [
  { id: "tappara", name: "Tappara", short: "Tappara", city: "Tampere", arena: "Nokia Arena", sm: 21, color: "#F07E13", x: 41.5, y: 79.3, labelX: 26.5, labelY: 74, anchor: "l",
    hook: "Kirvesrinnat, 21 mestaruutta ja kevät 2026. Tunnistatko dynastian rakentajat vuosikymmenten yli?", badge: "Hallitseva mestari",
    quizSlug: "tappara-tampere-kirvesrinnat-tietovisa" },
  { id: "ilves", name: "Ilves", short: "Ilves", city: "Tampere", arena: "Nokia Arena", sm: 16, color: "#25A244", x: 35.4, y: 82.9, labelX: 26.5, labelY: 76.8, anchor: "l",
    hook: "16 kultaa — ja viimeinen niistä keväällä 1985. Kuinka tarkkaan muistat vihreävalkoisen historian?", badge: "Perustettu 1931",
    quizSlug: "ilves-tampere-keltamustat-tietovisa" },
  { id: "tps", name: "TPS", short: "TPS", city: "Turku", arena: "Gatorade Center", sm: 11, color: "#D5DCE2", x: 32.2, y: 88.1, labelX: 26.5, labelY: 88.1, anchor: "l",
    hook: "Jortikan valtakausi, kolmen mestaruuden putket ja Kupittaan kaukalo. Turun kiekkoylpeys pähkinänkuoressa.", badge: "11 mestaruutta",
    quizSlug: null },
  { id: "karpat", name: "Kärpät", short: "Kärpät", city: "Oulu", arena: "Oulun Energia Areena", sm: 8, color: "#F0B323", x: 52.2, y: 49, labelX: 54.5, labelY: 49, anchor: "r",
    hook: "Pohjoisen mahti, joka nousi divarista kahdeksan kullan seuraksi. Muistatko mestaruusvuodet oikeassa järjestyksessä?", badge: "Pohjoisin seura",
    quizSlug: "karpat-tietovisa-legendat" },
  { id: "hifk", name: "HIFK", short: "HIFK", city: "Helsinki", arena: "Helsingin jäähalli", sm: 7, color: "#E2231A", x: 48, y: 90.3, labelX: 55, labelY: 92.3, anchor: "r",
    hook: "Nordenskiöldinkatu, punainen meri ja seitsemän kultaa. Stadin ylpein kiekkoseura.", badge: "Nordis",
    quizSlug: "hifk-helsinki-punavalkoiset-tietovisa" },
  { id: "jokerit", name: "Jokerit", short: "Jokerit", city: "Helsinki", arena: "Veikkaus Arena", sm: 6, color: "#35D6A0", x: 53, y: 89.2, labelX: 55, labelY: 95.3, anchor: "r",
    hook: "Narripaita on takaisin Liigassa 12 vuoden tauon jälkeen. Muistatko, mitä välissä tapahtui?", badge: "Paluu 2026",
    quizSlug: "jokerit-helsinki-liigahistoria-tietovisa" },
  { id: "assat", name: "Ässät", short: "Ässät", city: "Pori", arena: "Isomäki Areena", sm: 3, color: "#D81B23", x: 30.2, y: 79.4, labelX: 26.5, labelY: 79.6, anchor: "l",
    hook: "Karhut, RU-38 ja kevät 2013. Porin kiekkosuku on Liigan sekavin ja hienoin sukupuu.", badge: "Mestari 2013",
    quizSlug: "assat-isomaen-ukkoset-tietovisa" },
  { id: "hpk", name: "HPK", short: "HPK", city: "Hämeenlinna", arena: "Ritari Areena", sm: 2, color: "#F26B21", x: 45.4, y: 83.6, labelX: 48.5, labelY: 86.5, anchor: "r",
    hook: "2019: viitostilalta mestariksi vastoin kaikkia ennusteita. Miten Antti Pennanen sen teki?", badge: "Mestari 2019",
    quizSlug: "hpk-rinkelinmaen-ritarit-tietovisa" },
  { id: "lukko", name: "Lukko", short: "Lukko", city: "Rauma", arena: "Kivikylän Areena", sm: 2, color: "#F5C518", x: 28.4, y: 82.7, labelX: 26.5, labelY: 82.7, anchor: "l",
    hook: "58 vuoden odotus päättyi keväällä 2021. Rauman gaala kesti pidempään kuin finaalisarja.", badge: "Mestari 2021",
    quizSlug: null },
  { id: "jyp", name: "JYP", short: "JYP", city: "Jyväskylä", arena: "LaserTec Areena", sm: 2, color: "#C8102E", x: 53, y: 73.1, labelX: 55.5, labelY: 73.1, anchor: "r",
    hook: "2009 ja 2012 — Jyväskylä nousi kiekkokartalle ja voitti myös Euroopan. Muistatko kokoonpanot?", badge: "CHL-voittaja",
    quizSlug: "jyp-hippoksen-hurmaa-tietovisa" },
  { id: "kalpa", name: "KalPa", short: "KalPa", city: "Kuopio", arena: "Olvi Areena", sm: 1, color: "#FFD100", x: 63.7, y: 67.6, labelX: 66, labelY: 67.6, anchor: "r",
    hook: "Kuopio odotti vuosikymmeniä. Sitten tuli kevät 2025 ja Väinölänniemi täyttyi keltamustasta.", badge: "Mestari 2025",
    quizSlug: "kalpa-niiralan-montun-kovin-tietovisa" },
  { id: "pelicans", name: "Pelicans", short: "Pelicans", city: "Lahti", arena: "Isku Areena", sm: 1, color: "#00A3B8", x: 52.5, y: 83.6, labelX: 55, labelY: 80.5, anchor: "r",
    hook: "Viipurin Reippaan perinnöstä Lahden lintuihin. Liigan pisin nimenvaihdosketju.", badge: "Perustettu 1891",
    quizSlug: "pelicans-kolme-kertaa-hopealla-tietovisa" },
  { id: "saipa", name: "SaiPa", short: "SaiPa", city: "Lappeenranta", arena: "Kisapuisto", sm: 0, color: "#FFDD00", x: 67.3, y: 83, labelX: 70, labelY: 83, anchor: "r",
    hook: "Kisapuiston tunnelma on Liigan salainen ase. Mestaruus puuttuu — mitali ei.", badge: "Kisapuisto",
    quizSlug: "saipa-saimaan-syketta-tietovisa" },
  { id: "kookoo", name: "KooKoo", short: "KooKoo", city: "Kouvola", arena: "Lumon Areena", sm: 0, color: "#FF6A13", x: 58.6, y: 84.6, labelX: 62, labelY: 87, anchor: "r",
    hook: "Kouvolan comeback: Mestiksestä Liigan yllättäjäksi. Kuinka hyvin tunnet oranssimustan nousun?", badge: "Nousija 2015",
    quizSlug: "kookoo-kiekko-kimpassa-tietovisa" },
  { id: "sport", name: "Sport", short: "Sport", city: "Vaasa", arena: "Vaasan Sähkö Areena", sm: 0, color: "#E2231A", x: 31, y: 66, labelX: 26.5, labelY: 66, anchor: "l",
    hook: "Kaksikielinen Vaasa, yksi joukkue. Liigan länsirannikon puolustuslinja.", badge: "Vasa Sport",
    quizSlug: "sport-punavalkoinen-tarina-tietovisa" },
  { id: "jukurit", name: "Jukurit", short: "Jukurit", city: "Mikkeli", arena: "Mikkelin jäähalli", sm: 0, color: "#F5C518", x: 61.8, y: 77.7, labelX: 64, labelY: 77.7, anchor: "r",
    hook: "Savon ainoa Liigajoukkue. Mikkelin jäähallissa jokainen ottelu on paikallinen tapahtuma.", badge: "Nousija 2016",
    quizSlug: "jukurit-sisasavolaista-sisua-tietovisa" },
  { id: "kiekko-espoo", name: "Kiekko-Espoo", short: "K-Espoo", city: "Espoo", arena: "Espoo Metro Areena", sm: 0, color: "#1E4FD8", x: 43, y: 90.8, labelX: 26.5, labelY: 91, anchor: "l",
    hook: "Blues, Espoo United, Kiekko-Espoo. Espoon pääsarjakiekko on vaihtanut nimeä useammin kuin Kehä I kaistoja.", badge: "Uusi tulokas",
    quizSlug: "kiekko-espoo-tuhkasta-liigaan-tietovisa" },
];

export type JkCard = {
  /** Kannan visa-slug (kytkös; null = ei vielä luotu) */
  quizSlug: string | null;
  tag: string;
  title: string;
  /** Koukku kuvan alla otsikon jälkeen; derby/yleisvisa/leijonat/nhl-korteissa */
  desc?: string;
  img: string;
  accent: string;
  /** 5 px currentColor-alapalkki (vain 2. ja 3. erässä, README) */
  bar?: boolean;
};

const IMG = (n: string) => `/20/jaakiekko/${n}.webp`;

export const JK_DERBIES: JkCard[] = [
  { quizSlug: "sm-liiga-stadin-derby-hifk-jokerit", tag: "Stadin derby", title: "HIFK vs. Jokerit",
    desc: "Kausi 2026-27 tuo stadin derbyt takaisin. Uutta historiaa luodaan, vanha on täynnä uskomattomia tapahtumia.",
    img: IMG("jk-derby-stadi"), accent: "#E2231A" },
  { quizSlug: "sm-liiga-tampereen-derby-ilves-tappara", tag: "Tampereen paikallishegemonia", title: "Ilves vs. Tappara",
    desc: "Tampereella sinulta kysytään - Ilves vai Tappara?",
    img: IMG("jk-derby-manse"), accent: "#25A244" },
  { quizSlug: "sm-liiga-satakunnan-derby-assat-lukko", tag: "Satakunta", title: "Ässät vs. Lukko",
    desc: "Kahden länsirannikon teollisuuskaupungin vanhin riita jäällä.",
    img: IMG("jk-derby-satakunta"), accent: "#F5C518" },
];

/** Liigan yleisvisat — README:n poisjättö: kysymysmääriä EI näytetä korteissa
    (referenssin "20 kysymystä" -metat jätetty pois, avoin kohta 5). */
export const JK_GENERAL: JkCard[] = [
  { quizSlug: "sm-liiga-maalivahtilegendat", tag: "Maalivahdit", title: "Muurit ja mestariotteet", img: IMG("jk-liiga-maalivahdit"), accent: "#FFD100" },
  { quizSlug: "sm-liiga-kaikkien-aikojen-pistekuninkaat", tag: "Pistepörssi", title: "Maalitehtaat ja syöttökoneet", img: IMG("jk-liiga-pistekuninkaat"), accent: "#4FD1F5" },
  { quizSlug: "sm-liiga-finaalidraamat", tag: "Finaalit", title: "Kolmannen jatkoerän sankarit", img: IMG("jk-liiga-finaalidraamat"), accent: "#E8A320" },
  { quizSlug: "sm-liiga-valmentajadraamat-tulisielut", tag: "Penkin takana", title: "Aidot tulisielut", img: IMG("jk-liiga-valmentajat"), accent: "#E2231A" },
  { quizSlug: "sm-liiga-ulkomaalaisvahvistukset", tag: "Tuontitavara", title: "Liigan ulkomaalaislegendat", img: IMG("jk-liiga-ulkomaalaiset"), accent: "#F26B21" },
];

export const JK_LIONS: JkCard[] = [
  { quizSlug: "leijonat-mm-1995-kulta", tag: "MM 1995", title: "Ensimmäinen kulta", desc: "Tukholma, Ville Peltosen hattutemppu ja koko kansan yö.", img: IMG("jk-leijonat-mm1995"), accent: "#4FD1F5", bar: true },
  { quizSlug: "leijonat-mm-2011-kulta", tag: "MM 2011", title: "Bratislavan yö", desc: "Jalonen, Jokinen ja 6–1. Suomen selkein MM-finaali.", img: IMG("jk-leijonat-mm2011"), accent: "#E8A320", bar: true },
  { quizSlug: "leijonat-mm-2019-kulta", tag: "MM 2019", title: "Ei ketään tähteä", desc: "Kokoonpano, jota kukaan ei uskonut. Ja Marko Anttila.", img: IMG("jk-leijonat-mm2019"), accent: "#B6FF3C", bar: true },
  { quizSlug: "leijonat-mm-2022-kulta", tag: "MM 2022", title: "Kulta kotikisoista", desc: "Tampere, jatkoaika ja Sakari Mannisen ratkaisuosuma.", img: IMG("jk-leijonat-mm2022"), accent: "#4FD1F5", bar: true },
  { quizSlug: "leijonat-mm-2026-kulta", tag: "MM 2026", title: "Tuorein kulta", desc: "Uusi sukupolvi, uusi mestaruus. Muistatko jo kokoonpanon?", img: IMG("jk-leijonat-mm2026"), accent: "#F5F0E6", bar: true },
  { quizSlug: "leijonat-olympiakulta-2022", tag: "Peking 2022", title: "Olympiakulta", desc: "Hannes Björninen ja lopulta se ainoa puuttuva mitali.", img: IMG("jk-leijonat-olympia2022"), accent: "#E8A320", bar: true },
  { quizSlug: "nuoret-leijonat-mm-2014-kulta", tag: "Nuorten MM 2014", title: "Malmön kulta", desc: "Rasmus Ristolainen ja jatkoajan ratkaisu Ruotsista.", img: IMG("jk-leijonat-nuoret2014"), accent: "#35D6A0", bar: true },
  { quizSlug: "nuoret-leijonat-mm-2016-kulta", tag: "Nuorten MM 2016", title: "Kulta kotikaukalossa", desc: "Laine, Puljujärvi, Aho — ja Kapasen jatkoaikamaali.", img: IMG("jk-leijonat-nuoret2016"), accent: "#4FD1F5", bar: true },
  { quizSlug: "nuoret-leijonat-mm-2019-kulta", tag: "Nuorten MM 2019", title: "Victorian voitto", desc: "Kaapo Kakko ja käänne finaalin loppuminuuteilla.", img: IMG("jk-leijonat-nuoret2019"), accent: "#E8A320", bar: true },
];

export const JK_NHL: JkCard[] = [
  { quizSlug: "suomalaiset-nhl-pioneerit", tag: "Pioneerit", title: "Suomalaiset pioneerit", desc: "Pentti Lund, Matti Hagman ja ne, jotka avasivat oven muille.", img: IMG("jk-nhl-pioneerit"), accent: "#4FD1F5", bar: true },
  { quizSlug: "suomalaiset-nhl-ennatykset", tag: "Ennätykset", title: "Ennätykset ja saavutukset", desc: "Selänteen tulokaskausi, Stanley Cupit ja pisterajat.", img: IMG("jk-nhl-ennatykset"), accent: "#E8A320", bar: true },
  { quizSlug: "suomalaiset-nhl-kuriositeetit", tag: "Tilastotarinat", title: "Kuriositeetit ja tilastotarinat", desc: "Oudot luvut ja unohdetut suomalaissaavutukset NHL-historiassa.", img: IMG("jk-nhl-kuriositeetit"), accent: "#D5DCE2", bar: true },
];

export function jkTeamImg(id: string): string {
  return `/20/jaakiekko/jk-${id}.webp`;
}
