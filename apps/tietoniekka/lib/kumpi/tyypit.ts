// KUMPI? 2.0 — datan ja kysymysten tyypit. Puhdas moduuli (ei DB-riippuvuutta).

export type KEnt = {
  id: string;
  nimi: string;
  kind: string;
  /** Oma kuvakopio (henkiloKuva) tai null. Ei koskaan Wikimedia-osoitetta. */
  kuva: string | null;
  /** Uran / oletusarvot (scope = ''). */
  v: Record<string, number>;
  /** Näyttöarvot (display_value). */
  d: Record<string, string>;
  /** Tekstiarvot (text_value), esim. voittovuodet "2022,2024". */
  t: Record<string, string>;
  /** Seurakohtaiset arvot: scope → attr → luku. */
  s: Record<string, Record<string, number>>;
  /** Mittari (fact_attributes.metric) attribuuteittain. */
  m: Record<string, string>;
  /** Seurat (team-entiteettien nimet), joissa pelannut (played_for). Vain pelaajilla. */
  seurat: string[];
  /** Syntymäkaupungin entiteetti-id (born_in, Heikki 24.11.2026). `tarkka` = false, kun henkilö on syntynyt myöhemmin
   *  kaupunkiin liitetyssä kunnassa (detail "Nastola (nyk. Lahti)"): silloin kaupunkia ei kysytä eikä käytetä vääränä. */
  syntyma: { kaupunki: string; tarkka: boolean } | null;
  /** "mv" = maalivahti, "kp" = kenttäpelaaja, null = ei tiedossa / ei pelaaja. */
  paikka: "mv" | "kp" | null;
  /** Saman ihmisen tunniste (same_as-ryhmä): sama henkilö- ja pelaajatietueelle. */
  ihminen: string;
  legenda: boolean;
  suomalainen: boolean;
  /** Painotus arvonnassa (tunnetummat useammin). */
  paino: number;
  lat: number | null;
  lon: number | null;
  partitiivi: string | null;
  /** fact_entities.group_key (seuroilla "liiga", lajeilla "lintu"/"kala"/"nisakas"). */
  ryhma: string | null;
  /** fact_entities.tags (järvillä ja joilla "suomi"/"ulkomaat", Cowork 20.11.2026). */
  tags: string[];
};

export type KDef = {
  key: string;
  mode: "numeric" | "flag" | "distance" | "category";
  winner: "low" | "high";
  easyGap: number | null;
  midGap: number | null;
  minGap: number | null;
  maxGap: number | null;
  gapMode: "relative" | "absolute";
  gapDivisor: number;
  /** fact_attribute_defs.kumpi_kysymys: avainsana hakasulkeissa. */
  kysymys: string;
  /** Vastakkainen muoto ("Kumpi on pienempi?"), kumpi_kysymys_kaanteinen. null = vain perussuunta. */
  kaanteinen: string | null;
  factTemplate: string | null;
  enabled: boolean;
};

/** Tietovisakysymys Kumpi?-muodossa (kumpi_visakysymykset, Heikki 20.11.2026). */
export type KVisa = {
  id: string;
  /** Teemat, joihin kysymys kuuluu (urheilu, ihmiset, liiga, suomikiekon-legendat, seura-<seura>). */
  teemat: string[];
  kysymys: string;
  oikea: string;
  vaara: string;
  oikeaFakta: string | null;
  vaaraFakta: string | null;
  vaikeus: Vaikeus;
};

export type KumpiData = {
  /** Visakysymykset (esikatselussa myös luonnokset). */
  visat: KVisa[];
  entities: KEnt[];
  defs: Record<string, KDef>;
  /** "attr|idA|idB" (id:t järjestettyinä). */
  blocks: string[];
  /** Seuran nimi → inessiivi ("Tapparassa"). */
  inessiivit: Record<string, string>;
  /** Kaupungin entiteetti-id → inessiivi ("Tampereella"), taulusta kaupungit (born_in-kysymykset). */
  kaupunkiInessiivit: Record<string, string>;
};

export type Vaikeus = "helppo" | "keski" | "vaikea";

export type Vaihtoehto = {
  id: string;
  nimi: string;
  /** Lyhyt nimi vastauslistaan (henkilöillä sukunimi). */
  lyhyt: string;
  kuva: string | null;
  /** Kortin arvorivi paljastuksessa ("1 457", "s. 1970", "Voitti 2022", "Ei ole voittanut"). */
  arvo: string;
};

export type KumpiKysymys = {
  /** Parin avain (duel_pair_blocks/-stats -muoto): "attr|idA|idB". */
  pari: string;
  attr: string;
  /** Teeman slug, josta kysymys tuli. */
  teema: string;
  osat: { ennen: string; avain: string; jalkeen: string };
  /** Kysymys kokonaisena tekstinä. */
  lause: string;
  /** Vastauslistan lause nimien kanssa ("Kumpi on vanhempi, Räikkönen vai Selänne?") tai sama kuin lause. */
  listalause: string;
  vaihtoehdot: [Vaihtoehto, Vaihtoehto];
  oikea: 0 | 1;
  /** true = kysytty vastakkaiseen suuntaan (oikea vastaus on määrittelyn "häviäjä"). */
  kaanteinen: boolean;
  vaikeus: Vaikeus;
  /** "luku" = arvorivi 30 px yhdellä rivillä; "lause" = flag/seura-lause, sovitetaan ja saa rivittyä. */
  arvoTyyppi: "luku" | "lause";
  /** Faktalause ruudunlukijalle (aria-live). */
  fakta: string;
};
