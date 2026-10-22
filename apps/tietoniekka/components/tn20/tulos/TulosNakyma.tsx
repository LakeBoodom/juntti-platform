"use client";
// TULOSNÄKYMÄ (Tulosnäkymä ja jakaminen -brief, vaihe B, 22.10.2026; Claude Designin arkki v0.3, näkymät 3a–3c).
// Tavallinen tietovisa, kuvavisa ja viikkovisa. Järjestys kuten pelikehyksen K4:ssä:
//   tulos → (metapeli, lipun takana) → haasta kaveri → seuraava visa → toissijaiset linkit.
// Tulos näkyy kerran (iso n/total, tasonimi, pisteet pienellä, yksi lause). "Vastauksesi" on oma laatikkonsa
// tuloksen alla (✓/✗-ruudut + Näytä); koko laatikko on yksi painike, joka avaa läpikäynnin.
// Jakoalue: WhatsApp pääpainikkeena, Facebook ja Kopioi toissijaisina, Jaa… vain kosketuslaitteilla.
// Desktopilla (≥ 1024 px) tulos, vastaukset ja seuraava visa vasemmassa palstassa, jako oikealla.
// Kova vaatimus: 390 × 844:ssä tulos ja WhatsApp-painike ilman vieritystä.
import { useEffect, useState, type CSSProperties } from "react";
import "@/app/(tn20)/tulosnakyma.css";

export type TulosVastaus = "ok" | "bad" | "skipped" | undefined;
export type TulosSeuraava = { id: string; title: string; href: string; kuva?: string | null; kuvaPos?: string; ala: string };

export default function TulosNakyma(p: {
  /** Yläotsikko: "Suomen majakat · Tulos" / "Viikkovisa 38 · Kuvat". */
  eyebrow: string;
  right: number;
  total: number;
  score: number;
  /** Tasonimi (quizzes.fanitasot) tai yleinen taso. */
  tasonimi: string;
  lause: string;
  /** Henkilövisan "Lue lisää …" -linkki. */
  lisaLinkki?: { href: string; teksti: string } | null;
  haaste?: { oikein: number; kysymyksia: number } | null;
  vastaukset: TulosVastaus[];
  avaaVastaukset: (i: number, el: HTMLElement) => void;
  jako: {
    valmis: boolean;
    waHref?: string;
    fbHref?: string;
    teksti: string;
    url: string;
    kopioitu: boolean;
    kopioi: () => void;
    jaa: (() => void) | null;
    merkitse: (kanava: "whatsapp" | "facebook") => void;
    tila: string;
  };
  seuraavat: TulosSeuraava[];
  pelaaUudelleen: (() => void) | null;
  kaikki: { href: string; teksti: string };
}) {
  const taydet = p.right === p.total;
  /* Jaa… vain kosketuslaitteilla (brief: "vain mobiilissa"); selain päättää navigator.sharen tuesta. */
  const [kosketus, setKosketus] = useState(false);
  useEffect(() => {
    try { setKosketus(window.matchMedia("(pointer: coarse)").matches); } catch { /* ei matchMediaa */ }
  }, []);
  const ensimmainenVaarin = Math.max(0, p.vastaukset.findIndex((v) => v === "bad"));
  const h = p.haaste;
  const tuomio = h ? (p.right > h.oikein ? "voitto" : p.right < h.oikein ? "havio" : "tasan") : null;

  return (
    <div className="tn-tulos" data-haaste={h ? "1" : undefined}>
      <div className="tn-tulos-vasen">
        <section className="tn-tulos-tulos" aria-labelledby="tn-tulos-h">
          <span className="tn-tulos-eyebrow">{p.eyebrow}</span>
          {h ? (
            <>
              <div className="tn-tulos-vs">
                <div>
                  <span className="tn-tulos-pikku">Sinä</span>
                  <span className="tn-tulos-luku" aria-hidden="true"><b>{p.right}</b><i>/{p.total}</i></span>
                </div>
                <div className="tn-tulos-kaveri">
                  <span className="tn-tulos-pikku">Kaverisi</span>
                  <span className="tn-tulos-luku tn-tulos-luku--pieni" aria-hidden="true">{h.oikein}/{h.kysymyksia}</span>
                </div>
              </div>
              <span className="tn-sr">Sinä {p.right}/{p.total}, kaverisi {h.oikein}/{h.kysymyksia}.</span>
              <h1 id="tn-tulos-h" className="tn-tulos-tuomio" data-tuomio={tuomio}>
                {tuomio === "voitto" ? "Voitit kaverisi" : tuomio === "havio" ? "Kaverisi voitti" : "Tasapeli"}
              </h1>
              <p className="tn-tulos-lause">{p.lause}</p>
            </>
          ) : (
            <>
              <div className="tn-tulos-rivi">
                <span className="tn-tulos-luku" aria-hidden="true"><b>{p.right}</b><i>/{p.total}</i></span>
                <div className="tn-tulos-taso">
                  <span className="tn-sr">{p.right}/{p.total} oikein.</span>
                  <h1 id="tn-tulos-h" className="tn-tulos-tasonimi">
                    {p.tasonimi}
                  </h1>
                  <span className="tn-tulos-pisteet">{p.score} pistettä</span>
                </div>
              </div>
              <p className="tn-tulos-lause">{p.lause}</p>
            </>
          )}
          {p.lisaLinkki && (
            <a className="tn-tulos-lisa" href={p.lisaLinkki.href}>
              {p.lisaLinkki.teksti} <span aria-hidden="true">→</span>
            </a>
          )}
        </section>

        {/* "Vastauksesi": koko laatikko yksi painike (≥ 44 px) — ruudut ovat näyttö, eivät erillisiä kohteita. */}
        <button
          type="button"
          className="tn-tulos-vastaukset"
          onClick={(e) => p.avaaVastaukset(ensimmainenVaarin, e.currentTarget)}
          aria-label={`Vastauksesi: ${p.right} oikein, ${p.total - p.right} väärin. Näytä vastaukset`}
        >
          <span className="tn-tulos-vastaukset-yla">
            <span className="tn-tulos-pikku">Vastauksesi</span>
            <span className="tn-tulos-nayta">Näytä <span aria-hidden="true">▾</span></span>
          </span>
          <span className="tn-tulos-ruudut" aria-hidden="true">
            {p.vastaukset.map((v, i) => (
              <span key={i} className="tn-tulos-ruutu" data-tila={v === "ok" ? "ok" : v === "bad" ? "bad" : "ohi"}>
                {v === "ok" ? "✓" : v === "bad" ? "✕" : "–"}
              </span>
            ))}
          </span>
        </button>

        {/* Metapelilohko: METAPELI_ENABLED-lipun takana (ei vielä toteutettu, ei jätä aukkoa). */}

        {p.seuraavat.length > 0 && (
          <nav className="tn-tulos-seuraava" aria-labelledby="tn-tulos-seuraava-h">
            <h2 id="tn-tulos-seuraava-h" className="tn-tulos-pikku">Seuraava visa</h2>
            <div className="tn-tulos-kortit">
              {p.seuraavat.slice(0, 2).map((s) => (
                <a key={s.id} className="tn-tulos-kortti" href={s.href}>
                  <span className="tn-tulos-kortti-kuva">
                    {s.kuva && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.kuva} alt="" loading="lazy" style={s.kuvaPos ? ({ objectPosition: s.kuvaPos } as CSSProperties) : undefined} />
                    )}
                  </span>
                  <span className="tn-tulos-kortti-teksti">
                    <span className="tn-tulos-kortti-nimi">{s.title}</span>
                    <span className="tn-tulos-kortti-ala">{s.ala}</span>
                    <span className="tn-tulos-kortti-cta">Pelaa →</span>
                  </span>
                </a>
              ))}
            </div>
          </nav>
        )}

        <div className="tn-tulos-linkit">
          {p.pelaaUudelleen && (
            <button type="button" onClick={p.pelaaUudelleen}>
              <span aria-hidden="true">↻</span> Pelaa uudelleen
            </button>
          )}
          <a href={p.kaikki.href}>{p.kaikki.teksti} <span aria-hidden="true">→</span></a>
        </div>
      </div>

      <section className="tn-tulos-jako" aria-labelledby="tn-tulos-jako-h">
        <h2 id="tn-tulos-jako-h" className="tn-tulos-jako-h">
          {h ? "Lähetä vastahaaste" : taydet ? "Pystyykö kaveri samaan?" : "Pystyykö kaveri parempaan?"}
        </h2>
        <p className="tn-tulos-jako-p">{h ? "Kaveri näkee tuloksesi ja saa uuden yrityksen." : "Kaveri pelaa saman visan ja näkee, kumpi voitti."}</p>
        <a
          className="tn-tulos-wa"
          href={p.jako.waHref}
          target="_blank"
          rel="noopener"
          aria-disabled={!p.jako.valmis || undefined}
          onClick={() => p.jako.merkitse("whatsapp")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22c5.46 0 9.9-4.45 9.9-9.91C21.94 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.47-.72-2.94-1.16-4.78-4.2-4.92-4.4-.14-.2-1.16-1.55-1.16-2.96 0-1.4.73-2.09 1-2.38.26-.29.57-.36.76-.36h.56c.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.14-.3.3-.13.59.17.29.75 1.23 1.6 2 1.1.97 2.03 1.28 2.32 1.42.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.71-.17 1.39z" /></svg>
          {h ? "Vastahaaste WhatsAppissa" : "Haasta WhatsAppissa"}
        </a>
        <div className="tn-tulos-kanavat">
          {p.jako.fbHref && (
            <a className="tn-tulos-kanava" href={p.jako.fbHref} target="_blank" rel="noopener" onClick={() => p.jako.merkitse("facebook")}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877F2" /><path d="M13.4 19v-6h2l.3-2.4h-2.3V9.1c0-.7.2-1.2 1.2-1.2h1.2V5.8c-.2 0-1-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.8h-2V13h2v6h2.4z" fill="#fff" /></svg>
              Facebook
            </a>
          )}
          <button type="button" className="tn-tulos-kanava" onClick={p.jako.kopioi} disabled={!p.jako.valmis}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2.4" /><path d="M13 4.6A2.6 2.6 0 0010.4 2H5.6A2.6 2.6 0 003 4.6v4.8A2.6 2.6 0 005.6 12" /></svg>
            {p.jako.kopioitu ? "Kopioitu" : "Kopioi"}
          </button>
          {kosketus && p.jako.jaa && (
            <button type="button" className="tn-tulos-kanava tn-tulos-kanava--ikoni" onClick={p.jako.jaa} aria-label="Jaa…" disabled={!p.jako.valmis}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" /></svg>
            </button>
          )}
        </div>
        <details className="tn-tulos-esikatselu">
          <summary>Mitä kaverille lähtee?</summary>
          <p className="tn-tulos-esikatselu-t">{p.jako.teksti}</p>
          <p className="tn-tulos-esikatselu-u">{p.jako.url}</p>
        </details>
        <p className="tn-sr" role="status" aria-live="polite">{p.jako.tila}</p>
      </section>
    </div>
  );
}
