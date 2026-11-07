// JAKOJEN SEURANTA (Jakotekstit v4 §6, vaihe 4, 7.11.2026). A/B-testin mittarit ennen A/B-testiä: Heikki päätti
// 7.11. "mittaus nyt, A/B myöhemmin", koska jakoja oli kuudessa viikossa 24 (WhatsAppissa yksi).
//
// Jokainen jaettu linkki saa tunnuksen ?j=<8 merkkiä> (useJako lisää sen). Tapahtumat tauluun jako_tapahtumat:
//   jako     – jakaja valitsi kanavan (WhatsApp, Facebook, Kopioi, puhelimen jakovalikko)
//   avaus    – linkki avattiin (ensimmäinen sivulataus tunnuksella tässä selainistunnossa)
//   aloitus  – vastaanottaja aloitti pelin samalla sivulla (ensimmäinen napin painallus pelialueella)
//   valmis   – kierros pelattiin loppuun samalla sivulla (lisaaPelirivi; jokainen kierros oma rivinsä)
// Mittarit: aloitukset / jaetut linkit ja valmiit / jaetut linkit, pelimuodoittain polusta. Variantti-sarake odottaa
// A/B-testiä (share_variant); nyt aina null. Ei henkilötietoja: session_id on sama selaimen satunnaistunniste kuin
// pelikerroissa. Kaikki best-effort: estetty storage tai kannan virhe ei näy pelaajalle.
import { getSupabase } from "@/lib/supabase";

const AKTIIVINEN = "tn_jako";
const TUNNUS = /^[0-9a-z]{8}$/;

export type JakoTapahtuma = "jako" | "avaus" | "aloitus" | "valmis";
type Aktiivinen = { id: string; polku: string; aloitettu?: boolean };

export function uusiJakoId(): string {
  const a = "0123456789abcdefghijklmnopqrstuvwxyz";
  const t = new Uint8Array(8);
  crypto.getRandomValues(t);
  return Array.from(t, (x) => a[x % 36]).join("");
}

/** Jaettava osoite tunnuksella: …?tulos=7-10&j=ab12cd34 (absoluuttinen tai suhteellinen osoite). */
export function jakoLinkki(url: string, id: string | null): string {
  if (!id) return url;
  const [ilman, hash] = url.split("#");
  const puhdas = ilman.replace(/([?&])j=[^&]*(&|$)/, (_, a, b) => (b ? a : "")).replace(/[?&]$/, "");
  return `${puhdas}${puhdas.includes("?") ? "&" : "?"}j=${id}${hash ? `#${hash}` : ""}`;
}

function istunto(): string {
  try {
    let id = localStorage.getItem("tn_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("tn_session_id", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

async function kirjaa(tapahtuma: JakoTapahtuma, jakoId: string, polku: string, kanava: string | null = null) {
  try {
    const sb = getSupabase();
    if (!sb) return;
    // jako_tapahtumat puuttuu generoiduista tyypeistä (packages/db/types.ts on jäljessä).
    await (sb as unknown as { from: (t: string) => { insert: (r: object) => Promise<unknown> } })
      .from("jako_tapahtumat")
      .insert({ tapahtuma, jako_id: jakoId, polku: polku.slice(0, 200), kanava, session_id: istunto() });
  } catch {
    /* seuranta ei saa estää jakoa eikä peliä */
  }
}

/** Jakajan kanavavalinta (useJako). */
export function kirjaaJako(jakoId: string, url: string, kanava: string) {
  let polku = url;
  try { polku = new URL(url, location.origin).pathname; } catch { /* suhteellinen */ }
  void kirjaa("jako", jakoId, polku, kanava);
}

/** Sivulataus (Seuranta): ?j= → aktiivinen jako tälle polulle ja avaus kerran per istunto. */
export function kirjaaAvaus() {
  try {
    const id = new URLSearchParams(location.search).get("j");
    if (!id || !TUNNUS.test(id)) return;
    const vanha = JSON.parse(sessionStorage.getItem(AKTIIVINEN) ?? "null") as Aktiivinen | null;
    if (vanha?.id === id && vanha.polku === location.pathname) return;
    const a: Aktiivinen = { id, polku: location.pathname };
    sessionStorage.setItem(AKTIIVINEN, JSON.stringify(a));
    void kirjaa("avaus", id, a.polku);
  } catch {
    /* estetty storage */
  }
}

function aktiivinen(): Aktiivinen | null {
  try {
    const a = JSON.parse(sessionStorage.getItem(AKTIIVINEN) ?? "null") as Aktiivinen | null;
    return a && a.polku === location.pathname ? a : null;
  } catch {
    return null;
  }
}

/** Kierros valmis (lisaaPelirivi): vain jaetun linkin omalla sivulla. */
export function kirjaaValmis() {
  const a = aktiivinen();
  if (a) void kirjaa("valmis", a.id, a.polku);
}

/** Aloitus = ensimmäinen napin painallus pelialueella (<main>), ei jakoalueella. Pelimuotojen aloitustavat
 *  vaihtelevat (Aloita-nappi, ensimmäinen vastaus, kartan valinta), joten yksi kuuntelija kattaa ne kaikki. */
export function kuunteleAloitus(): () => void {
  const kasittelija = (e: Event) => {
    const el = (e.target as Element | null)?.closest?.("button, [role='button'], [draggable='true']");
    if (!el || !el.closest("main") || el.closest(".tn-jako, header, nav, footer")) return;
    const a = aktiivinen();
    if (!a || a.aloitettu) return;
    try { sessionStorage.setItem(AKTIIVINEN, JSON.stringify({ ...a, aloitettu: true })); } catch { return; }
    void kirjaa("aloitus", a.id, a.polku);
  };
  document.addEventListener("pointerdown", kasittelija, { capture: true });
  document.addEventListener("keydown", kasittelija, { capture: true });
  return () => {
    document.removeEventListener("pointerdown", kasittelija, { capture: true });
    document.removeEventListener("keydown", kasittelija, { capture: true });
  };
}
