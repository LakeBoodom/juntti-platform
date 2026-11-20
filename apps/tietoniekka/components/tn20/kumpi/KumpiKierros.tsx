"use client";
// KUMPI? 2.0 — Kierros (brief 20.11.2026, A6 + B). Kymmenen kysymystä, ei pisteitä eikä kelloa. Pelihetki (CD spec):
// napautus kortista → arvot paljastuvat korttiin (✓/✗, ponnahdus/tärähdys) → etenemisrengas 2,5 s → seuraava.
// Napautus mihin tahansa ohittaa renkaan. Faktalause vain ruudunlukijalle (aria-live), koska arvot näkyvät korteissa.
// Tulosnäkymä (UI-sääntö: tulos → tuloskortti ja jako → vastaukset → pelin linkit → muut pelit).
// KORTTISÄÄNTÖ: kysymyksen ja nimien koko sovitetaan Range-mittauksella pisimmän sanan mukaan (sana ei katkea keskeltä).
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Jakoalue from "@/components/tn20/jako/Jakoalue";
import { SeuraavaPeli } from "@/components/tn20/pelikehys/PeliTulos";
import type { Pelimuoto } from "@/lib/pelimuodot";
import { jaaPeliTeksti, tulosjakoteksti } from "@/lib/korttinimi";
import { kirjaaKierrosValmis, kirjaaVastaus, plausible, type Pelitapa } from "@/lib/kumpi/kirjaus";
import type { KumpiKysymys } from "@/lib/kumpi/tyypit";
import KumpiLogo, { KumpiMerkki } from "./KumpiLogo";

type Vaihe = "kysymys" | "auki" | "ulos" | "tulos";

const ETENEMINEN_MS = 2500;
const POISTUMINEN_MS = 170;

const vahennettyLiike = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ─── Sovitus (KORTTISÄÄNTÖ) ──────────────────────────────────────── */

/** Sanan leveys elementin fontilla (Range, ei scrollWidth). */
function sananLeveys(el: HTMLElement, sana: string, lisaEm = 0): number {
  const cs = getComputedStyle(el);
  const s = document.createElement("span");
  s.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:0";
  // Fonttiominaisuudet yksitellen: cs.font on tyhjä, jos fontilla on esim. tabular-nums (ei mahdu lyhenteeseen).
  s.style.fontFamily = cs.fontFamily;
  s.style.fontSize = cs.fontSize;
  s.style.fontWeight = cs.fontWeight;
  s.style.fontStyle = cs.fontStyle;
  s.style.fontStretch = cs.fontStretch;
  s.style.fontVariantNumeric = cs.fontVariantNumeric;
  s.style.letterSpacing = cs.letterSpacing;
  s.style.textTransform = cs.textTransform;
  s.textContent = sana;
  document.body.appendChild(s);
  const r = document.createRange();
  r.selectNodeContents(s);
  const w = r.getBoundingClientRect().width + lisaEm * parseFloat(cs.fontSize);
  s.remove();
  return w;
}

/** Rivinvaihto vain välilyönnistä tai yhdysmerkin jälkeen (CD: sana ei katkea koskaan keskeltä). */
const sanat = (t: string) => t.split(/\s+|(?<=[-–])/).filter(Boolean);

/** Elementin sisältöleveys (clientWidth ilman sisennystä). */
const sisaltoLeveys = (n: HTMLElement) => {
  const cs = getComputedStyle(n);
  return n.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
};

type Osat = (n: HTMLElement) => Array<{ t: string; em?: number }>;
const sanoina: Osat = (n) => sanat(n.textContent ?? "").map((t) => ({ t }));

/** Pienentää fonttia, kunnes jokaisen solmun jokainen osa (sana) mahtuu rajaan. Kaikki solmut saavat saman koon. */
function sovita(nodes: HTMLElement[], max: number, min: number, osat: Osat = sanoina, raja: (n: HTMLElement) => number = sisaltoLeveys) {
  if (!nodes.length) return max;
  let f = max;
  const aseta = (k: number) => nodes.forEach((n) => (n.style.fontSize = `${k}px`));
  aseta(f);
  while (f > min) {
    const yli = nodes.some((n) => {
      const r = raja(n);
      return osat(n).some((o) => sananLeveys(n, o.t, o.em) > r + 0.5);
    });
    if (!yli) break;
    f -= 1;
    aseta(f);
  }
  return f;
}

/** Arvorivin tila: rivin leveys miinus ✓/✗-merkki ja väli (varataan aina, ettei koko vaihdu paljastuksessa). */
const arvonRaja = (b: HTMLElement) => {
  const rivi = b.parentElement as HTMLElement;
  return rivi.clientWidth - 26 - 8;
};

/* ─── Kortti ──────────────────────────────────────────────────────── */

function Kortti({ q, ix, valinta, auki, onValitse, kuvat }: {
  q: KumpiKysymys;
  ix: 0 | 1;
  valinta: 0 | 1 | null;
  auki: boolean;
  onValitse: (ix: 0 | 1) => void;
  kuvat: boolean;
}) {
  const v = q.vaihtoehdot[ix];
  const oikea = q.oikea === ix;
  const tila = !auki ? "" : oikea ? "ok" : valinta === ix ? "ng" : "muu";
  const liike = !auki ? "" : oikea && valinta === ix ? " pop" : !oikea && valinta === ix ? " shake" : "";
  return (
    <button
      type="button"
      className={`kp-kortti ${tila}${liike}`}
      data-kirjain={v.nimi.charAt(0)}
      data-ix={ix}
      aria-disabled={auki || undefined}
      onClick={(e) => {
        if (auki) return; // auki-tilassa napautus kuplii juureen ja vie seuraavaan
        e.stopPropagation();
        onValitse(ix);
      }}
    >
      {kuvat && v.kuva ? (
        <span className="kp-kuva" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.kuva} alt="" decoding="async" />
        </span>
      ) : null}
      <span className="kp-txt">
        <span className="kp-nimi">{v.nimi}</span>
        <span className="kp-arvo" data-tyyppi={q.arvoTyyppi} aria-hidden={!auki}>
          <span className="kp-badge" aria-hidden="true">{auki ? (oikea ? "✓" : valinta === ix ? "✗" : "") : ""}</span>
          <b>{v.arvo}</b>
        </span>
      </span>
    </button>
  );
}

/* ─── Peli ────────────────────────────────────────────────────────── */

export default function KumpiKierros({
  kysymykset,
  teema,
  siemen,
  polku,
  pelitapa = "kierros",
  seuraavat,
}: {
  kysymykset: KumpiKysymys[];
  teema: { slug: string; nimi: string };
  siemen: string;
  /** Teemasivun polku ("/kumpi/liiga"): uusi kierros ja jaettava osoite. */
  polku: string;
  pelitapa?: Pelitapa;
  seuraavat: Pelimuoto[];
}) {
  const n = kysymykset.length;
  const [i, setI] = useState(0);
  const [vaihe, setVaihe] = useState<Vaihe>("kysymys");
  const [valinnat, setValinnat] = useState<Array<0 | 1 | null>>([]);
  const [ilmoitus, setIlmoitus] = useState("");
  const ajastin = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alku = useRef(0);
  const juuri = useRef<HTMLDivElement>(null);
  const kysRef = useRef<HTMLParagraphElement>(null);
  const kortitRef = useRef<HTMLDivElement>(null);
  const fokusKorteissa = useRef(false);

  const q = kysymykset[Math.min(i, n - 1)];
  const valinta = valinnat[i] ?? null;
  const auki = vaihe === "auki" || vaihe === "ulos";
  const kuvat = !!q.vaihtoehdot[0].kuva && !!q.vaihtoehdot[1].kuva;

  useEffect(() => {
    plausible("kumpi_start", { pelitapa, teema: teema.slug });
    return () => { if (ajastin.current) clearTimeout(ajastin.current); };
  }, [pelitapa, teema.slug]);

  // Sisääntulo (240 ms) päättyy → vastausaika alkaa.
  useEffect(() => {
    if (vaihe === "kysymys") alku.current = performance.now();
  }, [i, vaihe]);

  // KORTTISÄÄNTÖ: kysymys 40 → 26 px (desktop 72), nimet kuvilla 22 → 15 / ilman 36 → 20 (desktop 30/40 → 20).
  const sovitaKaikki = useCallback(() => {
    const desk = window.innerWidth >= 1024;
    const kys = kysRef.current;
    if (kys) {
      sovita([kys], desk ? 72 : 40, 26, (el) => {
        const avain = el.querySelector<HTMLElement>(".kp-avain");
        const muut = Array.from(el.childNodes).filter((x) => x !== avain).map((x) => x.textContent ?? "").join(" ");
        return [...sanat(muut).map((t) => ({ t })), ...(avain ? [{ t: avain.textContent ?? "", em: 0.3 }] : [])];
      });
    }
    const k = kortitRef.current;
    if (k) {
      const nimet = Array.from(k.querySelectorAll<HTMLElement>(".kp-nimi"));
      const max = kuvat ? (desk ? 30 : 22) : desk ? 40 : 36;
      const min = kuvat ? 15 : 20;
      if (sovita(nimet, max, min) <= min) sovita(nimet, min, 13); // äärimmäinen varakoko: ei koskaan leikkautumista
      // Lukuarvot yhdelle riville (30 px → 18), lauseet ("Voitti 2024 ja 2025") sanoittain (22 → 15, saa rivittyä).
      const luvut = Array.from(k.querySelectorAll<HTMLElement>('.kp-arvo[data-tyyppi="luku"] b'));
      sovita(luvut, 30, 18, (n) => [{ t: n.textContent ?? "" }], arvonRaja);
      const lauseet = Array.from(k.querySelectorAll<HTMLElement>('.kp-arvo[data-tyyppi="lause"] b'));
      sovita(lauseet, 22, 15, sanoina, arvonRaja);
    }
  }, [kuvat]);

  useLayoutEffect(() => {
    if (vaihe === "tulos") return;
    sovitaKaikki();
  }, [i, vaihe, sovitaKaikki]);

  useEffect(() => {
    const kuuntele = () => sovitaKaikki();
    window.addEventListener("resize", kuuntele);
    document.fonts?.ready.then(kuuntele).catch(() => {});
    return () => window.removeEventListener("resize", kuuntele);
  }, [sovitaKaikki]);

  // Näppäimistö: fokus uuden kysymyksen ensimmäiseen korttiin, jos se oli korteissa.
  useEffect(() => {
    if (vaihe === "kysymys" && fokusKorteissa.current) kortitRef.current?.querySelector<HTMLElement>(".kp-kortti")?.focus();
  }, [i, vaihe]);

  const seuraava = useCallback(() => {
    if (ajastin.current) clearTimeout(ajastin.current);
    fokusKorteissa.current = !!kortitRef.current?.contains(document.activeElement);
    setVaihe("ulos");
    ajastin.current = setTimeout(() => {
      if (i + 1 >= n) {
        setVaihe("tulos");
        const oikein = kysymykset.filter((x, j) => valinnat[j] === x.oikea).length;
        plausible("kumpi_finish", { pelitapa, teema: teema.slug, tulos: oikein });
        kirjaaKierrosValmis();
        window.scrollTo({ top: 0 });
      } else {
        setI(i + 1);
        setVaihe("kysymys");
        setIlmoitus("");
      }
    }, vahennettyLiike() ? 0 : POISTUMINEN_MS);
  }, [i, n, kysymykset, valinnat, pelitapa, teema.slug]);

  const valitse = (ix: 0 | 1) => {
    if (vaihe !== "kysymys") return;
    const uudet = [...valinnat];
    uudet[i] = ix;
    setValinnat(uudet);
    setVaihe("auki");
    setIlmoitus(`${ix === q.oikea ? "Oikein." : "Väärin."} ${q.fakta}`);
    kirjaaVastaus(q, pelitapa, ix, performance.now() - alku.current, i + 1);
    if (ajastin.current) clearTimeout(ajastin.current);
    ajastin.current = setTimeout(seuraavaRef.current, ETENEMINEN_MS);
  };
  // Ajastin kutsuu aina tuoreinta seuraava-funktiota (valinnat päivittyvät samassa renderöinnissä).
  const seuraavaRef = useRef(seuraava);
  useEffect(() => { seuraavaRef.current = seuraava; }, [seuraava]);

  const nuolet = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    const kortit = Array.from(kortitRef.current?.querySelectorAll<HTMLElement>(".kp-kortti") ?? []);
    const nyt = kortit.indexOf(document.activeElement as HTMLElement);
    const seur = e.key === "ArrowLeft" || e.key === "ArrowUp" ? 0 : 1;
    if (nyt !== seur) { kortit[seur]?.focus(); e.preventDefault(); }
  };

  if (vaihe === "tulos") {
    return <Tulos kysymykset={kysymykset} valinnat={valinnat} teema={teema} siemen={siemen} polku={polku} seuraavat={seuraavat} />;
  }

  const juuriLuokka = ["kp-peli", kuvat ? "kuvat" : "ilman", auki ? "auki" : "", vaihe === "ulos" ? "ulos" : ""].filter(Boolean).join(" ");
  return (
    <div
      ref={juuri}
      className={juuriLuokka}
      onClick={() => { if (vaihe === "auki") seuraava(); }}
      onKeyDown={(e) => { if (vaihe === "auki" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); seuraava(); } }}
    >
      <Palkki teema={teema.nimi} tila={`${i + 1}/${n}`} />
      <h1 className="kp-sr">Kumpi? – {teema.nimi}</h1>
      <main id="main" className="kp-paa" key={i}>
        <div className="kp-pino">
          <KumpiMerkki className="kp-taustamerkki" />
          <p className="kp-kys" ref={kysRef}>
            {q.osat.ennen}
            {q.osat.avain ? <span className="kp-avain">{q.osat.avain}</span> : null}
            {q.osat.jalkeen}
          </p>
          <div className="kp-kortit" ref={kortitRef} role="group" aria-label="Vaihtoehdot" onKeyDown={nuolet}>
            {([0, 1] as const).map((ix) => (
              <Kortti key={ix} q={q} ix={ix} valinta={valinta} auki={auki} onValitse={valitse} kuvat={kuvat} />
            ))}
          </div>
        </div>
        <div className="kp-fakta">
          <p className="kp-sr" aria-live="polite">{ilmoitus}</p>
          <button type="button" className="kp-etene" aria-label="Seuraava kysymys" tabIndex={auki ? 0 : -1} aria-hidden={!auki}>
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(244,237,224,.16)" strokeWidth="3" />
              <circle className="kp-rengas" cx="20" cy="20" r="17" fill="none" stroke="#E8A320" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </main>
    </div>
  );
}

/* ─── Pelipalkki (CD: paluu · logo · teema · tila, 56 px) ─────────── */

function Palkki({ teema, tila }: { teema: string; tila?: string }) {
  return (
    <header className="kp-palkki">
      <a className="kp-paluu" href="/kumpi" aria-label="Kumpi?-etusivulle">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
      <KumpiLogo className="kp-logo--palkki" />
      <span className="kp-palkki-teema">{teema}</span>
      {tila ? (
        <span className="kp-palkki-tila" role="status" aria-label={`Kysymys ${tila}`}>
          <span className="kp-palkki-sana" aria-hidden="true">Kysymys </span>
          <span aria-hidden="true">{tila}</span>
        </span>
      ) : null}
    </header>
  );
}

/* ─── Tulos ───────────────────────────────────────────────────────── */

function Tulos({ kysymykset, valinnat, teema, siemen, polku, seuraavat }: {
  kysymykset: KumpiKysymys[];
  valinnat: Array<0 | 1 | null>;
  teema: { slug: string; nimi: string };
  siemen: string;
  polku: string;
  seuraavat: Pelimuoto[];
}) {
  const n = kysymykset.length;
  const osumat = kysymykset.map((q, j) => valinnat[j] === q.oikea);
  const oikein = osumat.filter(Boolean).length;
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => setOrigin(location.origin), []);
  const nimi = `Kumpi? ${teema.nimi}`;
  const url = origin ? `${origin}${polku}?sarja=${encodeURIComponent(siemen)}&oikein=${oikein}` : null;
  return (
    <div className="kp-peli kp-peli--tulos">
      <Palkki teema={teema.nimi} />
      <main id="main" className="kp-tulos">
        <h1 className="kp-tulos-h"><b>{oikein}/{n}</b> oikein</h1>
        <div className="kp-tuloskortti" aria-hidden="true">
          <div className="kp-tuloskortti-yla">
            <KumpiLogo className="kp-logo--kortti" />
            <span>{teema.nimi}</span>
          </div>
          <b className="kp-tuloskortti-luku">{oikein}/{n}</b>
          <div className="kp-tuloskortti-rivi">
            {osumat.map((ok, j) => (
              <span key={j} className={ok ? "ok" : "ng"}>{ok ? "✓" : "✗"}</span>
            ))}
          </div>
        </div>
        <Jakoalue
          className="kp-jako"
          id="kp-jako-h"
          otsikko="Haasta kaveri"
          waNappi="Jaa WhatsAppissa"
          teksti={oikein > 0 ? tulosjakoteksti(nimi, `sain ${oikein}/${n} oikein`) : jaaPeliTeksti(nimi)}
          url={url}
          natiiviOtsikko={nimi}
          onJaettu={(k) => plausible("kumpi_share", { kanava: k, teema: teema.slug })}
        />
        <section className="kp-vastaukset" aria-labelledby="kp-vastaukset-h">
          <h2 id="kp-vastaukset-h">Vastauksesi</h2>
          <ol>
            {kysymykset.map((q, j) => {
              const ok = osumat[j];
              const v = valinnat[j];
              const oikeaNimi = q.vaihtoehdot[q.oikea].lyhyt;
              return (
                <li key={q.pari} className={ok ? "ok" : "ng"}>
                  <span className="kp-merkki" aria-hidden="true">{ok ? "✓" : "✗"}</span>
                  <span className="kp-sr">{ok ? "Oikein: " : "Väärin: "}</span>
                  <span className="kp-vastaus">
                    <b>{q.listalause}</b>
                    <span>
                      {ok || v === null ? oikeaNimi : <>Oikea: {oikeaNimi} · Valitsit: {q.vaihtoehdot[v].lyhyt}</>}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
        <nav className="kp-tulos-linkit" aria-label="Kumpi?">
          <a className="tn-cta-lime kp-cta" href="/kumpi">Pelaa teemoittain</a>
          <a className="kp-nappi" href={polku}>Uusi kierros: {teema.nimi}</a>
        </nav>
        <SeuraavaPeli seuraavat={seuraavat} />
      </main>
    </div>
  );
}
