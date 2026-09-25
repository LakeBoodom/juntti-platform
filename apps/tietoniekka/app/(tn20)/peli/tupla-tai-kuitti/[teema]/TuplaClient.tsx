"use client";
// TUPLA TAI KUITTI — pelinäkymän tilakone (esikatselu 25.9.2026).
// Vaiheet: alku → kysymys → palaute (oikein: kuittaa tai tuplaa; väärin: jäähy) → loppu.
// Ei kantaan kirjoittamista esikatselussa; paras tulos muistetaan selaimessa sarjakohtaisesti.
// Efektit ovat kevyitä CSS-animaatioita — lopullinen ilme ja animaatiot Claude Designilta.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { POTTI, TURVAT, maara, turvassa, uusiSiemen, type Palkinto, type TuplaKysymys, type TuplaTeema } from "@/lib/tuplaTaiKuitti";

type Vaihe = "alku" | "kysymys" | "palaute" | "loppu";
type Loppu = { syy: "kuittasi" | "jaahy" | "taydet"; saalis: number; oikein: number };

const KIRJAIMET = ["A", "B", "C", "D"];

export function Ikoni({ tyyppi, koko = 28 }: { tyyppi: Palkinto["ikoni"]; koko?: number }) {
  if (tyyppi === "kolikko") {
    return (
      <svg width={koko} height={koko} viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="16" r="14" fill="#E8A320" />
        <circle cx="16" cy="16" r="10" fill="none" stroke="#FFD27A" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width={koko} height={Math.round(koko * 0.7)} viewBox="0 0 32 22" aria-hidden>
      <path d="M2 8v6c0 3.3 6.3 6 14 6s14-2.7 14-6V8" fill="#05080B" />
      <ellipse cx="16" cy="8" rx="14" ry="6" fill="#1B2733" />
      <ellipse cx="16" cy="8" rx="9" ry="3.4" fill="none" stroke="var(--ttk-acc)" strokeWidth="1.4" opacity=".7" />
    </svg>
  );
}

function lueParas(avain: string): number | null {
  try {
    const x = localStorage.getItem(avain);
    return x == null ? null : Number(x);
  } catch {
    return null;
  }
}
function tallennaParas(avain: string, n: number) {
  try {
    const vanha = lueParas(avain);
    if (vanha == null || n > vanha) localStorage.setItem(avain, String(n));
  } catch {
    // selaimen tallennus estetty — paras tulos vain jää muistamatta
  }
}

/** Tikapuut: 10 askelta, turvatasot lukolla, nykyinen korostettuna. */
function Tikapuut({ i, vaihe, oikein }: { i: number; vaihe: Vaihe; oikein: number }) {
  return (
    <ol className="ttk-ladder" aria-label="Potin tikapuut">
      {POTTI.map((p, k) => {
        const tila = k < oikein ? "ok" : k === i && vaihe !== "loppu" ? "nyt" : "";
        const turva = (TURVAT as readonly number[]).includes(k + 1);
        return (
          <li key={p} className={`ttk-step ${tila} ${turva ? "turva" : ""}`}>
            <span>{p}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default function TuplaClient({ teema, sarja, siemen, paivanSarja }: { teema: TuplaTeema; sarja: TuplaKysymys[]; siemen: string; paivanSarja: boolean }) {
  const [vaihe, setVaihe] = useState<Vaihe>("alku");
  const [i, setI] = useState(0);
  const [valinta, setValinta] = useState<string | null>(null);
  const [loppu, setLoppu] = useState<Loppu | null>(null);
  const [paras, setParas] = useState<number | null>(null);
  const [jaettu, setJaettu] = useState(false);
  const p = teema.palkinto;
  const avain = `tk-tupla-${teema.slug}-${siemen}`;
  const q = sarja[i];
  const oikein = valinta != null && valinta === q?.oikea;
  const potti = i > 0 ? POTTI[i - 1] : 0;

  useEffect(() => setParas(lueParas(avain)), [avain]);

  // Päätös (kuittaa/tuplaa) näkyviin heti vastauksen jälkeen — puhelimessa se jää muuten taitteen alle.
  const paatos = useRef<HTMLElement>(null);
  useEffect(() => {
    if (vaihe === "palaute") paatos.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [vaihe]);

  function lopeta(l: Loppu) {
    setLoppu(l);
    tallennaParas(avain, l.saalis);
    setParas(lueParas(avain));
    setVaihe("loppu");
    window.scrollTo({ top: 0 });
  }

  function vastaa(v: string) {
    if (vaihe !== "kysymys") return;
    setValinta(v);
    setVaihe("palaute");
  }

  function tuplaa() {
    setI(i + 1);
    setValinta(null);
    setVaihe("kysymys");
    window.scrollTo({ top: 0 });
  }

  function alusta() {
    setI(0);
    setValinta(null);
    setLoppu(null);
    setJaettu(false);
    setVaihe("kysymys");
    window.scrollTo({ top: 0 });
  }

  async function haasta() {
    const url = `${location.origin}/peli/tupla-tai-kuitti/${teema.slug}?sarja=${encodeURIComponent(siemen)}`;
    const teksti = loppu ? `Sain ${maara(loppu.saalis, p)} Tupla tai kuitti -pelissä (${teema.nimi}). Pystytkö parempaan?` : "Tupla tai kuitti";
    try {
      if (navigator.share) await navigator.share({ title: "Tupla tai kuitti", text: teksti, url });
      else await navigator.clipboard.writeText(`${teksti} ${url}`);
      setJaettu(true);
    } catch {
      // jako peruttu
    }
  }

  const tyyli = { "--ttk-acc": teema.accent } as CSSProperties;

  const Ylapalkki = (
    <div className="ttk-top">
      <a className="ttk-home" href="/" aria-label="Tietoniekka etusivu">
        <b>TIETO</b>
        <span>NIEKKA</span>
      </a>
      <span className="ttk-top-name">Tupla tai kuitti · {teema.nimi}</span>
    </div>
  );

  // Arvotaan vasta painettaessa: renderissä arvottu siemen erottaisi palvelimen ja selaimen HTML:n.
  const arvoUusi = () => location.assign(`?sarja=${uusiSiemen()}`);

  if (vaihe === "alku") {
    return (
      <main className="ttk" style={tyyli}>
        {Ylapalkki}
        <section className="ttk-intro">
          <div className="ttk-eyebrow">{teema.nimi}</div>
          <h1 className="ttk-wordmark">
            <span>Tupla</span>
            <span className="ttk-wordmark-tai">tai</span>
            <span>kuitti</span>
          </h1>
          <p className="ttk-lead">{teema.kuvaus}</p>
          <ol className="ttk-rules">
            <li><b>Vastaa oikein</b> — potti tuplaantuu: 1, 2, 4 … aina {maara(POTTI[POTTI.length - 1], p)} asti.</li>
            <li><b>Tuplaa tai kuittaa.</b> Jokaisen oikean jälkeen päätät: otatko {p.kaikki} talteen vai jatkatko vaikeampaan kysymykseen.</li>
            <li><b>Väärä vastaus vie potin.</b> Kolmannen ja viidennen oikean vastauksen jälkeen osa {p.osa} on turvassa.</li>
          </ol>
          <Tikapuut i={-1} vaihe="alku" oikein={0} />
          <p className="ttk-ladder-note"><i className="ttk-lock" aria-hidden /> Turvataso: {maara(POTTI[TURVAT[0] - 1], p)} ja {maara(POTTI[TURVAT[1] - 1], p)}</p>
          <button className="ttk-btn ttk-btn--primary ttk-btn--wide" onClick={alusta}>Aloita</button>
          <p className="ttk-seed">
            {paivanSarja ? "Päivän sarja — sama kaikille tänään." : "Oma sarja — sama kuin haastajallasi."}{" "}
            <button type="button" className="ttk-link" onClick={arvoUusi}>Arvo uusi sarja</button>
          </p>
          {paras != null && <p className="ttk-seed">Paras tuloksesi tässä sarjassa: {maara(paras, p)}</p>}
        </section>
      </main>
    );
  }

  if (vaihe === "loppu" && loppu) {
    const otsikko = loppu.syy === "taydet" ? "Täydet!" : loppu.syy === "jaahy" ? teema.virhe : "Kuitattu!";
    const selite =
      loppu.syy === "taydet"
        ? `Kaikki kymmenen oikein. Keräsit maksimin.`
        : loppu.syy === "jaahy"
          ? `Kysymys ${loppu.oikein + 1} meni ohi. ${loppu.saalis > 0 ? `Turvassa oli ${maara(loppu.saalis, p)}.` : "Turvatasoa ei ollut vielä saavutettu."}`
          : `Otit ${p.kaikki} talteen ${loppu.oikein} oikean vastauksen jälkeen.`;
    return (
      <main className="ttk" style={tyyli}>
        {Ylapalkki}
        <section className="ttk-end">
          <div className={`ttk-end-kicker ttk-end-kicker--${loppu.syy}`}>{otsikko}</div>
          <div className="ttk-end-score">
            <Ikoni tyyppi={p.ikoni} koko={56} />
            <span className="ttk-count">{loppu.saalis.toLocaleString("fi-FI")}</span>
          </div>
          <div className="ttk-end-unit">{loppu.saalis === 1 ? p.yksi : p.monta}</div>
          <p className="ttk-lead">{selite}</p>
          <Tikapuut i={loppu.oikein} vaihe="loppu" oikein={loppu.oikein} />
          {paras != null && paras > loppu.saalis && <p className="ttk-seed">Paras tuloksesi tässä sarjassa: {maara(paras, p)}</p>}
          <div className="ttk-actions">
            <button className="ttk-btn ttk-btn--primary" onClick={haasta}>{jaettu ? "Linkki jaettu ✓" : "Haasta kaveri"}</button>
            <button className="ttk-btn" onClick={alusta}>Pelaa sama sarja uudelleen</button>
            <button className="ttk-btn" onClick={arvoUusi}>Arvo uusi sarja</button>
          </div>
          <a className="ttk-back" href={teema.paluu.href}>← {teema.paluu.teksti}</a>
        </section>
      </main>
    );
  }

  // kysymys + palaute
  const viimeinen = i === sarja.length - 1;
  const uusiPotti = POTTI[i];
  const turva = turvassa(i + 1);
  return (
    <main className="ttk" style={tyyli}>
      {Ylapalkki}
      <Tikapuut i={i} vaihe={vaihe} oikein={vaihe === "palaute" && oikein ? i + 1 : i} />
      <div className="ttk-hud">
        <div className="ttk-pot">
          <span className="ttk-pot-label">Potissa</span>
          <span className="ttk-pot-value" key={vaihe === "palaute" && oikein ? uusiPotti : potti}>
            <Ikoni tyyppi={p.ikoni} />
            {(vaihe === "palaute" && oikein ? uusiPotti : potti).toLocaleString("fi-FI")}
          </span>
        </div>
        <div className="ttk-meta">
          <span>Kysymys {i + 1}/{sarja.length}</span>
          <span className="ttk-dots" aria-label={`Vaikeus ${q.taso}/5`}>
            {[1, 2, 3, 4, 5].map((d) => <i key={d} className={d <= q.taso ? "on" : ""} />)}
          </span>
        </div>
      </div>

      <section className="ttk-card">
        <div className="ttk-source">{q.visa}</div>
        <h2 className="ttk-q">{q.kysymys}</h2>
        <div className="ttk-options">
          {q.vaihtoehdot.map((v, k) => {
            const tila = vaihe !== "palaute" ? "" : v === q.oikea ? "oikea" : v === valinta ? "vaara" : "himmea";
            return (
              <button key={v} className={`ttk-opt ${tila}`} onClick={() => vastaa(v)} disabled={vaihe !== "kysymys"}>
                <b>{KIRJAIMET[k]}</b>
                <span>{v}</span>
              </button>
            );
          })}
        </div>
      </section>

      {vaihe === "palaute" && (
        <section ref={paatos} className={`ttk-decision ${oikein ? "ok" : "fail"}`} aria-live="polite">
          {oikein ? (
            <>
              <div className="ttk-verdict">{viimeinen ? "Täydet!" : "Oikein!"}</div>
              {q.selitys && <p className="ttk-fact">{q.selitys}</p>}
              {viimeinen ? (
                <button className="ttk-btn ttk-btn--primary ttk-btn--wide" onClick={() => lopeta({ syy: "taydet", saalis: uusiPotti, oikein: i + 1 })}>
                  Katso tulos
                </button>
              ) : (
                <>
                  <p className="ttk-choice-note">
                    Seuraava kysymys on vaikeampi. {turva > 0 ? `Väärällä vastauksella saat turvaan ${maara(turva, p)}.` : `Väärällä vastauksella menetät kaiken.`}
                  </p>
                  <div className="ttk-choice">
                    <button className="ttk-btn ttk-btn--kuitti" onClick={() => lopeta({ syy: "kuittasi", saalis: uusiPotti, oikein: i + 1 })}>
                      <small>Kuittaa</small>
                      {maara(uusiPotti, p)}
                    </button>
                    <button className="ttk-btn ttk-btn--primary ttk-btn--tupla" onClick={tuplaa}>
                      <small>Tuplaa</small>
                      {maara(POTTI[i + 1], p)} →
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="ttk-verdict">{teema.virhe}</div>
              <p className="ttk-fact">
                Oikea vastaus: <b>{q.oikea}</b>. {q.selitys}
              </p>
              <p className="ttk-choice-note">{turvassa(i) > 0 ? `Turvassa ${maara(turvassa(i), p)}.` : `Potti meni.`}</p>
              <button className="ttk-btn ttk-btn--primary ttk-btn--wide" onClick={() => lopeta({ syy: "jaahy", saalis: turvassa(i), oikein: i })}>
                Katso tulos
              </button>
            </>
          )}
        </section>
      )}
    </main>
  );
}
