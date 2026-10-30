// PELIEN LÄHDESEURANTA (brief "Etusivu: seuranta ja Aloita tästä" osa A, 15.10.2026; toteutettu etusivu v5:n
// yhteydessä 28.10.2026). Mittaa, mistä sivuston osasta peli käynnistettiin — ilman analytiikkapalvelua.
//
//   tn_session_entry (sessionStorage) = session ENSIMMÄINEN sivu: polku + normalisoitu viittaaja (+ utm_source).
//   tn_last_entry    (sessionStorage) = viimeksi klikatun osion data-tn-entry-arvo ("etusivu:paivan-pelit").
//
// Pelin tallennus lisää riviin seurantaKentat(): entry, referrer_host, landing_path. Kaikki try/catchissa:
// estetty storage tai yksityinen selaus → kentät null, peli tallentuu silti.

const SESSIO = "tn_session_entry";
const VIIMEISIN = "tn_last_entry";

type Sessio = { landing_path: string; referrer_host: string; ts: number };

/** document.referrer → ryhmä (A4). utm_source voittaa referrerin. */
export function normalisoiViittaaja(referrer: string, utm: string | null, omaHost: string): string {
  if (utm) return utm.toLowerCase().slice(0, 60);
  if (!referrer) return "suora";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "suora";
  }
  if (host === omaHost || host.endsWith("tietoniekka.fi") || host.endsWith(".vercel.app") || host === "localhost") return "tietoniekka";
  if (/(^|\.)google\./.test(host)) return "google";
  if (host.endsWith("bing.com")) return "bing";
  if (host.endsWith("duckduckgo.com")) return "duckduckgo";
  if (host.endsWith("instagram.com")) return "instagram";
  if (host.endsWith("facebook.com") || host === "fb.me") return "facebook";
  if (host === "x.com" || host === "t.co" || host.endsWith("twitter.com")) return "x";
  if (host.endsWith("whatsapp.com") || host === "wa.me") return "whatsapp";
  if (host.endsWith("telegram.org") || host === "t.me") return "telegram";
  if (host.endsWith("linkedin.com") || host === "lnkd.in") return "linkedin";
  if (host.endsWith("reddit.com")) return "reddit";
  return host.slice(0, 120);
}

/** Kerran per sivulataus (Seuranta-komponentti layoutissa): session alkutiedot, jos niitä ei vielä ole. */
export function kirjaaSessionAlku() {
  try {
    if (sessionStorage.getItem(SESSIO)) return;
    const utm = new URLSearchParams(location.search).get("utm_source");
    const s: Sessio = {
      landing_path: location.pathname.slice(0, 300),
      referrer_host: normalisoiViittaaja(document.referrer, utm, location.hostname.replace(/^www\./, "")),
      ts: Date.now(),
    };
    sessionStorage.setItem(SESSIO, JSON.stringify(s));
  } catch {
    /* estetty storage → ei seurantaa */
  }
}

/** Delegoitu klikkikuuntelija: linkin tai napin lähin [data-tn-entry] → tn_last_entry. */
export function kuunteleOsioklikit(): () => void {
  const kasittelija = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.("a, button");
    if (!el) return;
    const osio = el.closest("[data-tn-entry]")?.getAttribute("data-tn-entry");
    if (!osio) return;
    try {
      sessionStorage.setItem(VIIMEISIN, osio.slice(0, 60));
    } catch {
      /* no-op */
    }
  };
  document.addEventListener("click", kasittelija, { capture: true });
  return () => document.removeEventListener("click", kasittelija, { capture: true });
}

/** Pelin tallennukseen lisättävät kentät (A3). Tyhjentää tn_last_entry:n, jotta seuraava peli ei peri sitä. */
export function seurantaKentat(): { entry: string | null; referrer_host: string | null; landing_path: string | null } {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSIO) ?? "null") as Sessio | null;
    const viimeisin = sessionStorage.getItem(VIIMEISIN);
    sessionStorage.removeItem(VIIMEISIN);
    const entry = viimeisin ?? (s && s.landing_path === location.pathname ? "suora" : "muu");
    return { entry, referrer_host: s?.referrer_host ?? null, landing_path: s?.landing_path ?? null };
  } catch {
    return { entry: null, referrer_host: null, landing_path: null };
  }
}

/** Pelirivin tallennus lähdekentillä. Jos kanta hylkää rivin (esim. sarakkeita ei vielä ole), tallennetaan
 *  ilman niitä — seuranta ei saa koskaan estää pelikerran tilastointia. Palauttaa Supabasen virheen tai null. */
export async function lisaaPelirivi(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: { from: (t: any) => any },
  taulu: string,
  rivi: Record<string, unknown>,
): Promise<unknown> {
  const kentat = seurantaKentat();
  const { error } = await sb.from(taulu).insert({ ...rivi, ...kentat });
  if (!error) return null;
  const { error: e2 } = await sb.from(taulu).insert(rivi);
  return e2 ?? null;
}
