// SEO-erä A4 (2.10.2026): /visa/<slug> välimuistiin (ISR 3600) ilman että parametreja vaativat
// toiminnot rikkoutuvat. Next ei voi välimuistittaa sivua, joka lukee searchParamsia, joten:
//   • /visa/<slug> ilman merkityksellisiä parametreja → ISR-sivu (ei lue parametreja)
//   • /visa/<slug>?tulos=… / ?paivan_visa=1 / ?hero=… → kirjoitetaan sisäisesti /peli?visa=<slug>&…
//     (dynaaminen; esim. tulosvariantin jakokuva og:image tarvitsee ?tulos=)
//   • /peli?visa=<slug> (ei muita parametreja) → kirjoitetaan sisäisesti /visa/<slug> (ISR)
//   • /kokoelma/<luonto|kuvavisat|tunnetut-henkilot>?suodata=… → /suodatettu/…
//   • rungolle siirtyneiden kokoelmien vanhat parametrit → 308 osion ankkuriin (runko 19.10.2026):
//     kulttuuri?suodata=<alakokoelma> → #osio-<alakokoelma>, jalkapallo?seura=… → #osio-valioliigan-seurat
// Osoite selaimessa ei muutu (paitsi runko-ohjauksissa). Seurantaparametrit (fbclid, utm_*) eivät
// tee sivusta dynaamista — Facebook lisää fbclid:n jokaiseen jaettuun linkkiin.
import { NextResponse, type NextRequest } from "next/server";

/** Rungolle siirtyneiden kokoelmien vanhat parametrit → osion tunniste (#osio-<tunniste>);
 *  osiot lib/kokoelmat/<slug>.ts. null = parametri ei kuulu tälle sivulle. */
const KULTTUURIN_OSIOT = new Set(["taide-design", "kirjallisuus-tarinat", "musiikki-nayttamo", "elamantapa-ilmiot"]);
const RUNKO_PARAMIT: Record<string, (p: URLSearchParams) => string | null> = {
  kulttuuri: (p) => { const v = p.get("suodata"); return v && KULTTUURIN_OSIOT.has(v) ? v : null; },
  jalkapallo: (p) => (p.get("seura") ? "valioliigan-seurat" : p.get("suodata") ? "suurseurat" : null),
};

const SEURANTA = /^(fbclid|gclid|msclkid|igshid|ref|utm_.+)$/i;

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const avaimet = [...url.searchParams.keys()].filter((k) => !SEURANTA.test(k));

  if (url.pathname.startsWith("/visa/")) {
    if (avaimet.length === 0) return NextResponse.next();
    const slug = decodeURIComponent(url.pathname.slice("/visa/".length).replace(/\/$/, ""));
    if (!slug || slug.includes("/")) return NextResponse.next();
    const r = url.clone();
    r.pathname = "/peli";
    r.searchParams.set("visa", slug);
    return NextResponse.rewrite(r);
  }

  /* Rungolle siirtyneet kokoelmat: vanha suodatinlinkki → osion ankkuri (ei dynaamista reittiä). */
  const runko = url.pathname.match(/^\/kokoelma\/(kulttuuri|jalkapallo)\/?$/);
  if (runko) {
    if (!url.searchParams.has("suodata") && !url.searchParams.has("seura")) return NextResponse.next();
    const osio = RUNKO_PARAMIT[runko[1]](url.searchParams);
    const r = url.clone();
    r.searchParams.delete("suodata");
    r.searchParams.delete("seura");
    r.hash = osio ? `osio-${osio}` : "";
    return NextResponse.redirect(r, 308);
  }

  /* Suodatinparametrilliset hubit → dynaaminen /suodatettu/kokoelma/<x> (ISR-hub ei lue parametreja). */
  const hub = url.pathname.match(/^\/kokoelma\/(luonto|kuvavisat|tunnetut-henkilot)\/?$/);
  if (hub) {
    if (avaimet.length === 0) return NextResponse.next();
    const r = url.clone();
    r.pathname = `/suodatettu/kokoelma/${hub[1]}`;
    return NextResponse.rewrite(r);
  }

  if (url.pathname === "/peli" && avaimet.length === 1 && avaimet[0] === "visa") {
    const slug = url.searchParams.get("visa");
    if (!slug) return NextResponse.next();
    const r = url.clone();
    r.pathname = `/visa/${encodeURIComponent(slug)}`;
    r.search = "";
    return NextResponse.rewrite(r);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/visa/:path*", "/peli", "/kokoelma/:path*"] };
