"use client";
// JAKOALUE (Tulosnäkymä ja jakaminen, vaihe C, 22.10.2026) — yleiskäyttöinen: tietovisan tulosnäkymä (TulosNakyma)
// ja pelimuodot (pelikehyksen PeliTulos, haasta-paikka). Kanavat: WhatsApp pääpainikkeena; hiirellä Facebook ja
// Kopioi, kosketuslaitteilla "Jaa linkkinä" (navigator.share, Heikki 23.10.2026). Ei muita kanavanappeja.
// Jakoteksti ilman osoitetta tulee kutsujalta (lib/korttinimi.ts: jakoteksti / vastahaasteteksti); osoite lisätään perään.
// Kanava kirjataan onJaettu-kutsulla (quiz_plays.share_channel, viimeisin kanava riittää).
// UI-sääntö 9: ei selitelausetta otsikon alla.
import { useEffect, useRef, useState } from "react";
import "./jakoalue.css";

export type Jakokanava = "whatsapp" | "facebook" | "kopioi" | "jaa";


/** Jaon toiminnot ilman ulkoasua — pelimuodot, joilla on oma haasta-nappinsa, käyttävät tätä suoraan. */
export function useJako({ teksti, url, otsikko, onJaettu }: {
  teksti: string;
  /** null = linkki ei ole vielä valmis (napit pois käytöstä). */
  url: string | null;
  /** navigator.sharen otsikko. */
  otsikko?: string;
  onJaettu?: (kanava: Jakokanava) => void | Promise<unknown>;
}) {
  const [tila, setTila] = useState<"kopioitu" | "virhe" | "jakovirhe" | null>(null);
  const [voiJakaa, setVoiJakaa] = useState(false);
  const ajastin = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    try { setVoiJakaa(typeof navigator.share === "function"); } catch { /* ei navigatoria */ }
    return () => { if (ajastin.current) clearTimeout(ajastin.current); };
  }, []);
  const nayta = (t: typeof tila) => {
    setTila(t);
    if (ajastin.current) clearTimeout(ajastin.current);
    ajastin.current = setTimeout(() => setTila(null), 3000);
  };
  const viesti = url ? `${teksti} ${url}` : teksti;
  function kopioi() {
    if (!url) return;
    if (!navigator.clipboard?.writeText) { nayta("virhe"); return; }
    navigator.clipboard.writeText(viesti).then(() => { nayta("kopioitu"); onJaettu?.("kopioi"); }, () => nayta("virhe"));
  }
  function jaa() {
    if (!url || !navigator.share) return;
    navigator.share({ title: otsikko, text: teksti, url })
      .then(() => onJaettu?.("jaa"))
      .catch((e: { name?: string }) => { if (e?.name !== "AbortError") nayta("jakovirhe"); });
  }
  return {
    valmis: !!url,
    waHref: url ? `https://wa.me/?text=${encodeURIComponent(viesti)}` : undefined,
    kopioi,
    jaa: voiJakaa ? jaa : null,
    kopioitu: tila === "kopioitu",
    /** Ruudunlukijan tila (role=status). */
    tila: tila === "kopioitu" ? "Linkki kopioitu leikepöydälle."
      : tila === "virhe" ? "Linkin kopiointi ei onnistunut. Yritä uudelleen."
      : tila === "jakovirhe" ? "Jakaminen ei onnistunut. Yritä uudelleen."
      : "",
  };
}

export default function Jakoalue(p: {
  otsikko: string;
  /** Pääpainikkeen teksti: "Haasta WhatsAppissa" / "Vastahaaste WhatsAppissa". */
  waNappi: string;
  teksti: string;
  url: string | null;
  /** Facebookin jakama osoite (vaihe E: …&k=<id>). Oletus url; null → ei Facebook-nappia. */
  fbUrl?: string | null;
  natiiviOtsikko?: string;
  /** Kanavan kirjaus; lupaus odotetaan (≤ 0,7 s) ennen kuin sivu vaihtuu samassa välilehdessä. */
  onJaettu?: (kanava: Jakokanava) => void | Promise<unknown>;
  /** Otsikon id (aria-labelledby); sama sivu voi sisältää vain yhden oletus-id:n. */
  id?: string;
  className?: string;
}) {
  const j = useJako({ teksti: p.teksti, url: p.url, otsikko: p.natiiviOtsikko, onJaettu: p.onJaettu });
  const hid = p.id ?? "tn-jako-h";
  const fb = p.fbUrl === undefined ? p.url : p.fbUrl;
  return (
    <section className={p.className ? `tn-jako ${p.className}` : "tn-jako"} aria-labelledby={hid}>
      <h2 id={hid} className="tn-jako-h">{p.otsikko}</h2>
      <a
        className="tn-jako-wa"
        href={j.waHref}
        target="_blank"
        rel="noopener"
        aria-disabled={!j.valmis || undefined}
        onClick={() => p.onJaettu?.("whatsapp")}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22c5.46 0 9.9-4.45 9.9-9.91C21.94 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.47-.72-2.94-1.16-4.78-4.2-4.92-4.4-.14-.2-1.16-1.55-1.16-2.96 0-1.4.73-2.09 1-2.38.26-.29.57-.36.76-.36h.56c.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.14-.3.3-.13.59.17.29.75 1.23 1.6 2 1.1.97 2.03 1.28 2.32 1.42.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.71-.17 1.39z" /></svg>
        {p.waNappi}
      </a>
      {/* Kanavat (Heikki 23.10.2026): Facebook ei mene mobiilissa suoraan sovellukseen (sharer.php pudottaa linkin,
          Share Dialog antoi virheen), joten kosketuslaitteilla vain WhatsApp ja "Jaa linkkinä" (puhelimen jakovalikko,
          jossa Messenger, viestit, kopiointi ja Facebook, jos se on käytössä). Hiirellä Facebook ja Kopioi kuten ennen.
          Näkyvyys CSS:llä (pointer: coarse), jotta Facebook-painike ei välähdä mobiilissa ennen hydraatiota. */}
      <div className="tn-jako-kanavat">
        {fb && (
          <a
            className="tn-jako-kanava tn-jako-hiiri"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fb)}`}
            target="_blank"
            rel="noopener"
            onClick={() => p.onJaettu?.("facebook")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877F2" /><path d="M13.4 19v-6h2l.3-2.4h-2.3V9.1c0-.7.2-1.2 1.2-1.2h1.2V5.8c-.2 0-1-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.8h-2V13h2v6h2.4z" fill="#fff" /></svg>
            Facebook
          </a>
        )}
        <button type="button" className="tn-jako-kanava tn-jako-hiiri" onClick={j.kopioi} disabled={!j.valmis}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2.4" /><path d="M13 4.6A2.6 2.6 0 0010.4 2H5.6A2.6 2.6 0 003 4.6v4.8A2.6 2.6 0 005.6 12" /></svg>
          {j.kopioitu ? "Kopioitu" : "Kopioi"}
        </button>
        {/* Mobiili: puhelimen jakovalikko; jos sitä ei ole, linkki kopioidaan. */}
        <button type="button" className="tn-jako-kanava tn-jako-kosketus" onClick={j.jaa ?? j.kopioi} disabled={!j.valmis}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" /></svg>
          {j.jaa ? "Jaa linkkinä" : j.kopioitu ? "Kopioitu" : "Kopioi linkki"}
        </button>
      </div>
      <p className="tn-jako-sr" role="status" aria-live="polite">{j.tila}</p>
    </section>
  );
}
