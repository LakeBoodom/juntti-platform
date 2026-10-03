// SEO-erä A4 (2.10.2026): /visa/<slug> välimuistiin (ISR 3600) ilman että parametreja vaativat
// toiminnot rikkoutuvat. Next ei voi välimuistittaa sivua, joka lukee searchParamsia, joten:
//   • /visa/<slug> ilman merkityksellisiä parametreja → ISR-sivu (ei lue parametreja)
//   • /visa/<slug>?tulos=… / ?paivan_visa=1 / ?hero=… → kirjoitetaan sisäisesti /peli?visa=<slug>&…
//     (dynaaminen; esim. tulosvariantin jakokuva og:image tarvitsee ?tulos=)
//   • /peli?visa=<slug> (ei muita parametreja) → kirjoitetaan sisäisesti /visa/<slug> (ISR)
//   • /kokoelma/<luonto|kulttuuri|jalkapallo|kuvavisat|tunnetut-henkilot>?suodata=… → /suodatettu/…
// Osoite selaimessa ei muutu missään tapauksessa. Seurantaparametrit (fbclid, utm_*) eivät
// tee sivusta dynaamista — Facebook lisää fbclid:n jokaiseen jaettuun linkkiin.
import { NextResponse, type NextRequest } from "next/server";

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

  /* Suodatinparametrilliset hubit → dynaaminen /suodatettu/kokoelma/<x> (ISR-hub ei lue parametreja). */
  const hub = url.pathname.match(/^\/kokoelma\/(luonto|kulttuuri|jalkapallo|kuvavisat|tunnetut-henkilot)\/?$/);
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
