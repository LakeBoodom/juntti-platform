// VIIKKOVISA — yhteinen formaattilogiikka (kierros 4, 18.9.2026).
//
// Tämä moduuli ei tuo Supabasea eikä muuta palvelinkoodia, joten sitä voi
// käyttää sekä palvelimella (viikkoInfo) että selaimessa (tuloksen luku ja
// tallennus). Kannan haku on lib/kuvavisat2026.ts:n getViikkovisa().
//
// Heikin lukitut linjaukset 18.9.2026:
//  - Yksi Viikkovisa-ilme, kategoria alaotsikkona: "Viikkovisa 38 · Kuvat".
//  - Oma aksenttiväri 10A Sinetti: syaani #22D3EE (ei limeä).
//  - Ei arkistoa: viikon vaihduttua edellistä ei voi pelata.
//  - Yksi yritys viikossa, selainkohtaisesti. Lukitus syntyy vasta
//    läpipelatusta visasta ja purkautuu maanantaina automaattisesti, koska
//    tallennettu avain ei enää vastaa palvelimen antamaa viikkoa.
//  - Aikatiedot (viikko, päivämääräväli, jäljellä olevat päivät) lasketaan
//    PALVELIMELLA viikkoInfo()-funktiolla — selaimen kello voi olla väärässä
//    ja antaisi väärän "3 pv jäljellä" tai purkaisi lukituksen liian aikaisin.

/** Formaatin aksentti (10A Sinetti). Kontrasti #131109-pohjalla ≈ 10:1. */
export const VIIKKO_AKSENTTI = "#22D3EE";

/** Kuvavisojen viikkovisan kategoria-alaotsikko. Myöhemmin esim. "Musiikki". */
export const VIIKKO_KATEGORIA_KUVAT = "Kuvat";

export type ViikkoInfo = {
  /** Lukitusavain ja haastelinkin variaatio: "2026-38" */
  avain: string;
  vuosi: number;
  viikko: number;
  kategoria: string;
  /** "14.9.–20.9.2026" */
  vali: string;
  /** "su 20.9." */
  voimassaAsti: string;
  /** Päiviä sunnuntaihin Suomen aikaa: 0 = tänään viimeinen päivä */
  pvJaljella: number;
  /** "2 pv jäljellä" / "Viimeinen päivä" */
  jaljellaTeksti: string;
};

export const viikkoAvain = (vuosi: number, viikko: number) => `${vuosi}-${viikko}`;

/** "Viikkovisa 38 · Kuvat" — sama nimi otsikossa, tulosnäkymässä ja jaossa. */
export const viikkoNimi = (viikko: number, kategoria = VIIKKO_KATEGORIA_KUVAT) =>
  `Viikkovisa ${viikko} · ${kategoria}`;

/** Haastelinkin taso-kenttä kantaa viikkoavaimen ("2026-38"). */
export function viikkoAvaimesta(avain: string | null | undefined): { vuosi: number; viikko: number } | null {
  const m = /^(\d{4})-(\d{1,2})$/.exec(avain ?? "");
  if (!m) return null;
  const viikko = Number(m[2]);
  if (viikko < 1 || viikko > 53) return null;
  return { vuosi: Number(m[1]), viikko };
}

const PAIVA = 86_400_000;

/** ISO-viikon maanantai UTC-päivänä (1.4. on aina viikolla 1). */
function isoMaanantai(vuosi: number, viikko: number): number {
  const tammi4 = Date.UTC(vuosi, 0, 4);
  const vp = (new Date(tammi4).getUTCDay() + 6) % 7; // ma = 0
  return tammi4 - vp * PAIVA + (viikko - 1) * 7 * PAIVA;
}

/** Kalenteripäivä Suomen aikaa UTC-keskiyönä — päivien erotus ilman kesäaikaongelmia. */
function helsinginPaiva(nyt: Date): number {
  const [v, k, p] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(nyt).split("-").map(Number);
  return Date.UTC(v, k - 1, p);
}

const pvm = (t: number) => { const d = new Date(t); return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.`; };

/** KUTSUTAAN VAIN PALVELIMELLA (sivut ovat force-dynamic). */
export function viikkoInfo(vuosi: number, viikko: number, nyt = new Date(), kategoria = VIIKKO_KATEGORIA_KUVAT): ViikkoInfo {
  const ma = isoMaanantai(vuosi, viikko);
  const su = ma + 6 * PAIVA;
  const pvJaljella = Math.max(0, Math.round((su - helsinginPaiva(nyt)) / PAIVA));
  return {
    avain: viikkoAvain(vuosi, viikko),
    vuosi,
    viikko,
    kategoria,
    vali: `${pvm(ma)}–${pvm(su)}${new Date(su).getUTCFullYear()}`,
    voimassaAsti: `su ${pvm(su)}`,
    pvJaljella,
    jaljellaTeksti: pvJaljella === 0 ? "Viimeinen päivä" : `${pvJaljella} pv jäljellä`,
  };
}

/* ── Selainkohtainen tulos (yksi yritys viikossa) ───────────────────────── */

export const VIIKKO_TULOS_KEY = "tn_viikkovisa_tulos";

export type ViikkoTulos = {
  avain: string;
  oikein: number;
  kysymyksia: number;
  pisteet: number;
  /** Kysymyskohtainen tila tulosnäkymän ruudukkoa ja tarkastelua varten */
  tila: Array<"ok" | "bad" | "skipped" | null>;
  /** Valitun vaihtoehdon TEKSTI: vaihtoehtojen järjestys arvotaan joka
      latauksella, joten indeksi ei kelpaisi tarkasteluun seuraavalla käynnillä. */
  valinnat: Array<string | null>;
};

/** Palauttaa tuloksen vain jos se on KULUVALTA viikolta (avain palvelimelta). */
export function lueViikkoTulos(avain: string): ViikkoTulos | null {
  try {
    const raw = window.localStorage.getItem(VIIKKO_TULOS_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as ViikkoTulos;
    if (!t || t.avain !== avain || typeof t.oikein !== "number" || typeof t.kysymyksia !== "number") return null;
    return { ...t, tila: Array.isArray(t.tila) ? t.tila : [], valinnat: Array.isArray(t.valinnat) ? t.valinnat : [] };
  } catch {
    return null;
  }
}

export function tallennaViikkoTulos(t: ViikkoTulos): void {
  try {
    window.localStorage.setItem(VIIKKO_TULOS_KEY, JSON.stringify(t));
  } catch { /* best-effort: yksityinen selaus tms. — yksi yritys on viesti, ei valvonta */ }
}
