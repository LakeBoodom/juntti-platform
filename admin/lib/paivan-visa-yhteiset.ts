// PÄIVÄN VISA -ADMIN — yhteiset tyypit, rajat ja varoitukset (selain + palvelin) (toteutusohje 19.9.2026,
// luku 8). Lista, viikkonäkymä ja päiväsivu käyttävät samaa kokoajaa.
//
// Kaikki päivät Suomen aikaan (Europe/Helsinki) — aiemmin admin laski päivät
// UTC:nä (toISOString), jolloin "tänään" vaihtui klo 02/03.

export const INTRO_OTSIKKO_MAX = 80;
export const INTRO_OTSIKKO_PEHMEA = 60;
export const INTRO_TEKSTI_MAX = 240;
export const INTRO_TEKSTI_PEHMEA = 160;
/** Toistoraja ja kategoriatoisto kuten automaattitäytössä (paivan_visa_ehdokas). */
export const TOISTORAJA_PV = 90;

/** Tietoniekan osoite esikatselua varten (upotus /esikatselu/paivan-visa). */
export const TIETONIEKKA_URL = process.env.NEXT_PUBLIC_TIETONIEKKA_URL ?? "https://tietoniekka.fi";

/** Tämä päivä Suomen aikaan, "2026-09-19". */
export function helsinkiTanaan(nyt: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(nyt);
}

/** Päivämääräaritmetiikka ISO-merkkijonoilla (UTC-keskiyö, ei aikavyöhykevirheitä). */
export function lisaaPaivia(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function paivaEro(a: string, b: string): number {
  return Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86400000);
}

const VIIKONPAIVAT = ["su", "ma", "ti", "ke", "to", "pe", "la"];
export function paivaTeksti(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return { lyhyt: `${d.getUTCDate()}.${d.getUTCMonth() + 1}.`, vp: VIIKONPAIVAT[d.getUTCDay()] };
}

export type VisaValinta = {
  id: string; title: string; status: string;
  /** Kokoelma (tai kategoria) — sama avain kuin automaattitäytön kategoriatoistossa */
  kokoelma: string | null;
  kuva: boolean;
};

export type SaantoRivi = {
  id: string; scheduled_date: string; content_id: string | null; active: boolean;
  auto_filled: boolean; intro_headline: string | null; intro_text: string | null;
  intro_source_url: string | null; editorial_note: string | null;
};

export type Varoitus = { tyyppi: "sankari" | "toisto" | "kategoria" | "luonnos"; teksti: string };

export type Paiva = {
  iso: string;
  saanto: SaantoRivi | null;
  visa: VisaValinta | null;
  sankari: { name: string; quiz_id: string; death_date: string | null; ika: number } | null;
  varoitukset: Varoitus[];
};

/**
 * Varoitukset yhdelle valinnalle. Käytetään sekä palvelimella (lista) että
 * selaimessa (päiväsivun lomake, kun visaa vaihdetaan ennen tallennusta).
 */
export function varoituksetValinnalle(args: {
  iso: string;
  visa: VisaValinta | null;
  sankariQuizId: string | null;
  sankariNimi: string | null;
  /** Saman visan muut Päivän visa -päivät (±90 pv), tämä päivä pois lukien */
  toistot: string[];
  /** Eilisen ja toissapäivän kokoelmat */
  edelliset: Array<{ iso: string; kokoelma: string | null }>;
}): Varoitus[] {
  const v: Varoitus[] = [];
  if (!args.visa) return v;
  if (args.sankariQuizId && args.visa.id === args.sankariQuizId) {
    v.push({
      tyyppi: "sankari",
      teksti: `Sama visa kuin päivän sankarilla (${args.sankariNimi}). Etusivu näyttää Päivän visana automaattisesti toisen visan.`,
    });
  }
  for (const t of args.toistot) {
    const ero = paivaEro(args.iso, t);
    const { lyhyt } = paivaTeksti(t);
    v.push({
      tyyppi: "toisto",
      teksti: ero > 0
        ? `Ollut Päivän visana ${lyhyt} (${ero} pv sitten).`
        : `Ajastettu Päivän visaksi myös ${lyhyt} (${-ero} pv päästä).`,
    });
  }
  const sama = args.edelliset.filter((e) => e.kokoelma && e.kokoelma === args.visa!.kokoelma);
  if (sama.length) {
    v.push({
      tyyppi: "kategoria",
      teksti: `Sama kokoelma (${args.visa.kokoelma}) kuin ${sama.map((e) => paivaTeksti(e.iso).lyhyt).join(" ja ")}`,
    });
  }
  if (args.visa.status !== "published") {
    v.push({ tyyppi: "luonnos", teksti: "Visa ei ole julkaistu — etusivu ei voi näyttää sitä." });
  }
  return v;
}
