"use client";
// KUNTALIITOS — pelinäkymä (CD "Kuntaliitos v0.2", kierros 5: 5a pelitilanne, 5b vaiheittainen
// paljastus, 5c epäonnistunut kierros ja jatko, 5d täydellinen onnistuminen, 1d virhetila).
//
// Poikkeamat designista (Heikin hyväksymät suositukset 26.9.2026):
//   - "Maaraja" → "Yhteinen raja": kuntarajat jatkuvat merelle (Naantali–Turku).
//   - Kartta piirretään kuntarajoista reitin alueelle; palapelikuvalla nastat kasautuisivat.
//   - "Karttapelit-kokoelma"-linkin paikalla Haasta kaveri (kokoelmaa ei vielä ole).
//   - Oikea reitti on aina yksikäsitteinen (arvonta takaa tasan yhden ratkaisun).
//
// Raahaus kuten Ikäjärjestyksessä (LIVE-QA 16.9.): kortin päältä lyhyt pyyhkäisy vierittää
// sivua, kosketuksella raahaus alkaa pitkästä painalluksesta, kahvasta heti. Napautus valitsee
// kortin ja toinen napautus vaihtaa paikat. Näppäimistö: välilyönti valitsee, nuolet siirtävät.

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type KeyboardEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { KL_PISTEET, KL_SIVU, KL_YHTEYKSIA, pariAvain, uusiReittiSiemen, type KlKunta, type KlReitti } from "@/lib/kuntaliitos";

type Vaihe = "peli" | "tarkistus" | "tulos";
type Tila = "ok" | "bad";

const LIIKE_PX = 6;
const PITKA_PAINALLUS_MS = 180;
const PORRAS = ["0%", "6%", "12%", "6%"];

function hiljaa() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
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

/** Tarkistus tilastoihin (kuntaliitos_pelit). Best-effort: epäonnistuminen ei näy pelaajalle. */
async function tallenna(r: { siemen: string; paivanReitti: boolean; yritys: number; oikein: number; kunnat: string[] }) {
  try {
    const sb = getSupabase();
    if (!sb) return;
    await sb.from("kuntaliitos_pelit" as never).insert({
      siemen: r.siemen, paivan_reitti: r.paivanReitti, yritys: r.yritys, oikein: r.oikein, kunnat: r.kunnat, session_id: istunto(),
    } as never);
  } catch {
    // tilasto jää saamatta — peli jatkuu normaalisti
  }
}

function estaVieritys(e: TouchEvent) {
  if (e.cancelable) e.preventDefault();
}

// ── Ikonit ────────────────────────────────────────────────
const IKONI = {
  ok: "M4 12.6 9.2 18 20 6.6",
  bad: "M6 6l12 12M18 6 6 18",
  lukko: "M7 10V7.5a5 5 0 0 1 10 0V10M5.5 10h13v10h-13z",
  kahva: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  katkos: "M5 9.5 9 12l-1.5 3M19 9.5 15 12l1.5 3M3.5 6.5h5M15.5 6.5h5M3.5 17.5h5M15.5 17.5h5",
  varoitus: "M12 8v5m0 3.2v.2M12 3.6 2.6 20h18.8L12 3.6Z",
};
function Ikoni({ d, w = 2.6 }: { d: string; w?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Kilpikehys (leveys × 1,2): vaakuna contain-periaatteella, puuttuvan tilalla alkukirjain. */
function Kilpi({ kunta, className, reuna }: { kunta: KlKunta; className?: string; reuna?: string }) {
  const [virhe, setVirhe] = useState(false);
  return (
    <span className={`kl-kilpi ${className ?? ""}`} style={reuna ? ({ "--kl-reuna": reuna } as CSSProperties) : undefined}>
      <span className="kl-kilpi-pohja">
        {kunta.v && !virhe ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kunta.v} alt={`${kunta.n}n vaakuna`} onError={() => setVirhe(true)} />
        ) : (
          <span className="kl-kilpi-kirjain" aria-hidden="true">{kunta.n.charAt(0)}</span>
        )}
      </span>
    </span>
  );
}

// ── Kartta ────────────────────────────────────────────────
const RENGAS = { ok: "#159A9C", bad: "#D8543C", lahto: "#0E3A5C", maali: "#6A6353" };

type Nasta = { kunta: KlKunta; num: number; laji: "lahto" | "maali" | "solmu"; tila: "ok" | "bad" | "maali" };
type Jakso = { a: KlKunta; b: KlKunta; tila: Tila };

function Kartta(p: {
  reitti: KlReitti;
  nastat: Nasta[];
  jaksot: Jakso[];
  haamu: Jakso[];
  korostetut: Set<string>;
  pari: { a: KlKunta; b: KlKunta; tila: Tila } | null;
  otsikko: string;
  huomio: string;
  aktiivinen: boolean;
}) {
  const vb = p.reitti.kartta.viewBox;
  return (
    <div className={`kl-kartta${p.aktiivinen ? " kl-kartta--akt" : ""}`}>
      <div className="kl-kartta-yla">
        <span className="kl-pikku">{p.otsikko}</span>
        <span className="kl-selite">
          <span><i className="kl-selite-ok" />Yhteinen raja</span>
          <span><i className="kl-selite-bad" />Katkos</span>
        </span>
      </div>

      {p.pari && (
        <div className={`kl-pari kl-pari--${p.pari.tila}`} role="status" aria-live="polite">
          <Kilpi kunta={p.pari.a} className="kl-kilpi--pari" />
          <span className="kl-pari-t">
            <b>{p.pari.a.n} – {p.pari.b.n}</b>
            <span>{p.pari.tila === "bad" ? "Ei yhteistä rajaa" : "Yhteinen raja"}</span>
          </span>
          <Kilpi kunta={p.pari.b} className="kl-kilpi--pari" />
        </div>
      )}

      <div className="kl-kartta-alue">
        <svg className="kl-maa" viewBox={vb} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Kartta reitin alueen kunnista">
          {p.reitti.kartta.alueet.map((a) => (
            <path key={a.k} d={a.d} className={`kl-alue kl-savy${a.s}${p.korostetut.has(a.k) ? " kl-alue--reitti" : ""}`} />
          ))}
        </svg>
        <svg className="kl-viivat" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {p.haamu.map((j, i) => (
            <line key={`h${i}`} className="kl-haamu" x1={j.a.x} y1={j.a.y} x2={j.b.x} y2={j.b.y} />
          ))}
          {p.jaksot.map((j, i) => {
            if (j.tila === "ok") {
              return (
                <g key={i}>
                  <line className="kl-viiva-alla" x1={j.a.x} y1={j.a.y} x2={j.b.x} y2={j.b.y} />
                  <line className="kl-viiva kl-viiva--ok" x1={j.a.x} y1={j.a.y} x2={j.b.x} y2={j.b.y} />
                </g>
              );
            }
            // Katkos piirretään kahtena tynkänä, väliin risti — ei yhtenäistä viivaa
            const l = (t: number) => [j.a.x + (j.b.x - j.a.x) * t, j.a.y + (j.b.y - j.a.y) * t];
            const [x1, y1] = l(0.34), [x2, y2] = l(0.66);
            return (
              <g key={i}>
                <line className="kl-viiva-alla" x1={j.a.x} y1={j.a.y} x2={x1} y2={y1} />
                <line className="kl-viiva-alla" x1={x2} y1={y2} x2={j.b.x} y2={j.b.y} />
                <line className="kl-viiva kl-viiva--bad" x1={j.a.x} y1={j.a.y} x2={x1} y2={y1} />
                <line className="kl-viiva kl-viiva--bad" x1={x2} y1={y2} x2={j.b.x} y2={j.b.y} />
              </g>
            );
          })}
        </svg>
        {p.jaksot.filter((j) => j.tila === "bad").map((j, i) => (
          <span key={`r${i}`} className="kl-risti" style={{ left: `${(j.a.x + j.b.x) / 2}%`, top: `${(j.a.y + j.b.y) / 2}%` }}>
            <Ikoni d={IKONI.bad} w={3.4} />
          </span>
        ))}
        {p.nastat.map((n) => {
          const paate = n.laji !== "solmu";
          const reuna = n.laji === "lahto" ? RENGAS.lahto : n.tila === "maali" ? RENGAS.maali : RENGAS[n.tila];
          return (
            <span key={n.kunta.k} className={`kl-nasta${paate ? " kl-nasta--paate" : ""}`} style={{ left: `${n.kunta.x}%`, top: `${n.kunta.y}%` }}>
              <span className="kl-nasta-kilpi">
                <Kilpi kunta={n.kunta} reuna={reuna} />
                {!paate && <span className="kl-nasta-num" style={{ background: n.tila === "bad" ? "#B0301A" : "#0A6E70" }}>{n.num}</span>}
              </span>
              {paate && (
                <span className="kl-nasta-lappu" style={{ background: n.laji === "lahto" ? "#0E3A5C" : n.tila === "maali" ? "#6A6353" : "#0A6E70" }}>
                  {n.laji === "lahto" ? "Lähtö" : "Maali"}
                </span>
              )}
              <span className="kl-nasta-nimi">{n.kunta.n}</span>
            </span>
          );
        })}
      </div>

      {p.huomio && <p className="kl-kartta-huomio">{p.huomio}</p>}
    </div>
  );
}

// ── Peli ──────────────────────────────────────────────────
export default function KuntaliitosClient({
  reitti,
  siemen,
  paivanReitti,
  paivays,
  lahde,
}: {
  reitti: KlReitti | null;
  siemen: string;
  paivanReitti: boolean;
  paivays: string;
  lahde: string;
}) {
  const [jarjestys, setJarjestys] = useState<string[]>(reitti?.alku ?? []);
  const [vaihe, setVaihe] = useState<Vaihe>("peli");
  const [paljastettu, setPaljastettu] = useState(0);
  const [valittu, setValittu] = useState<string | null>(null);
  const [raahattava, setRaahattava] = useState<string | null>(null);
  const [ratkaisuNakyy, setRatkaisuNakyy] = useState(false);
  const [yritys, setYritys] = useState(0);
  const [jaettu, setJaettu] = useState(false);
  const [ilmoitus, setIlmoitus] = useState("");
  const juuri = useRef<HTMLDivElement>(null);
  const kortit = useRef(new Map<string, HTMLDivElement>());
  const ajastin = useRef<ReturnType<typeof setInterval> | null>(null);
  const napautusEsto = useRef(false);

  const kunnat = useMemo(() => new Map((reitti?.ratkaisu ?? []).map((k) => [k.k, k])), [reitti]);
  const rajat = useMemo(() => new Set(reitti?.rajat ?? []), [reitti]);
  const ratkaisu = reitti?.ratkaisu ?? [];
  const alkuK = ratkaisu[0]?.k;
  const loppuK = ratkaisu.at(-1)?.k;
  const lukittu = (k: string) => k === alkuK || k === loppuK;

  const tulokset: Tila[] = jarjestys.slice(1).map((k, i) => (rajat.has(pariAvain(jarjestys[i], k)) ? "ok" : "bad"));
  const nakyvat = tulokset.slice(0, paljastettu);
  const oikein = nakyvat.filter((t) => t === "ok").length;
  const taydet = vaihe === "tulos" && oikein === KL_YHTEYKSIA;
  const pisin = (() => {
    let paras = 0, nyt = 0;
    for (const t of nakyvat) { nyt = t === "ok" ? nyt + 1 : 0; paras = Math.max(paras, nyt); }
    return paras;
  })();

  useEffect(() => () => { if (ajastin.current) clearInterval(ajastin.current); }, []);

  if (!reitti) return <Virhe />;

  // ── Siirrot ──
  const siirra = (mista: number, mihin: number) => {
    if (mihin < 1 || mihin > jarjestys.length - 2 || mista === mihin) return;
    setJarjestys((o) => {
      const n = o.slice();
      const [x] = n.splice(mista, 1);
      n.splice(mihin, 0, x);
      return n;
    });
  };
  const napauta = (k: string) => {
    if (napautusEsto.current) { napautusEsto.current = false; return; }
    if (vaihe !== "peli" || lukittu(k)) return;
    if (!valittu) { setValittu(k); setIlmoitus(`${kunnat.get(k)!.n} valittu. Napauta toista kuntaa vaihtaaksesi paikat.`); return; }
    if (valittu === k) { setValittu(null); setIlmoitus(""); return; }
    setJarjestys((o) => {
      const n = o.slice();
      const a = n.indexOf(valittu), b = n.indexOf(k);
      [n[a], n[b]] = [n[b], n[a]];
      return n;
    });
    setIlmoitus(`${kunnat.get(valittu)!.n} ja ${kunnat.get(k)!.n} vaihtoivat paikkaa.`);
    setValittu(null);
  };
  const nappain = (k: string, e: KeyboardEvent) => {
    if (vaihe !== "peli") return;
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); napauta(k); return; }
    if (lukittu(k)) return;
    const i = jarjestys.indexOf(k);
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const j = e.key === "ArrowUp" ? i - 1 : i + 1;
      if (j < 1 || j > jarjestys.length - 2) return;
      siirra(i, j);
      setIlmoitus(`${kunnat.get(k)!.n} siirtyi paikalle ${j + 1}.`);
      requestAnimationFrame(() => kortit.current.get(k)?.focus());
    }
  };

  /** Raahaus: hiiri liikkeestä, kosketus pitkästä painalluksesta, kahva heti. */
  const alas = (k: string, e: RPointerEvent<HTMLDivElement>, kahvasta: boolean) => {
    if (vaihe !== "peli" || lukittu(k) || (e.pointerType === "mouse" && e.button !== 0)) return;
    const el = e.currentTarget;
    const x0 = e.clientX, y0 = e.clientY;
    const kosketus = e.pointerType === "touch";
    let kaynnissa = false;
    let viimeY = y0;
    let rulla = 0;
    const aloita = () => {
      if (kaynnissa) return;
      kaynnissa = true;
      try { el.setPointerCapture(e.pointerId); } catch {}
      if (kosketus) window.addEventListener("touchmove", estaVieritys, { passive: false });
      setRaahattava(k);
      setValittu(null);
      rullaa();
    };
    const pito = kosketus && !kahvasta ? setTimeout(aloita, PITKA_PAINALLUS_MS) : null;
    const sijoita = (y: number) => {
      setJarjestys((o) => {
        const nyk = o.indexOf(k);
        for (let i = 1; i < o.length - 1; i++) {
          if (i === nyk) continue;
          const r = kortit.current.get(o[i])?.getBoundingClientRect();
          if (r && y > r.top && y < r.bottom) {
            const n = o.slice();
            const [x] = n.splice(nyk, 1);
            n.splice(i, 0, x);
            return n;
          }
        }
        return o;
      });
    };
    // Automaattinen vieritys reunoilla (lista ei mahdu puhelimen näytölle kokonaan)
    const rullaa = () => {
      const h = window.innerHeight, reuna = 80;
      const v = viimeY < reuna ? -Math.ceil((reuna - viimeY) / 6) : viimeY > h - reuna ? Math.ceil((viimeY - (h - reuna)) / 6) : 0;
      if (v) { window.scrollBy(0, v); sijoita(viimeY); }
      rulla = requestAnimationFrame(rullaa);
    };
    const liike = (ev: PointerEvent) => {
      viimeY = ev.clientY;
      if (!kaynnissa) {
        const siirtyi = Math.hypot(ev.clientX - x0, ev.clientY - y0) > LIIKE_PX;
        if (!siirtyi) return;
        if (kosketus && !kahvasta) { lopeta(); return; } // pyyhkäisy = vieritys
        aloita();
      }
      sijoita(ev.clientY);
    };
    const lopeta = () => {
      if (pito) clearTimeout(pito);
      cancelAnimationFrame(rulla);
      window.removeEventListener("pointermove", liike);
      window.removeEventListener("pointerup", lopeta);
      window.removeEventListener("pointercancel", lopeta);
      window.removeEventListener("touchmove", estaVieritys);
      if (kaynnissa) {
        napautusEsto.current = true;
        setTimeout(() => { napautusEsto.current = false; }, 0);
        setRaahattava(null);
      }
    };
    window.addEventListener("pointermove", liike);
    window.addEventListener("pointerup", lopeta);
    window.addEventListener("pointercancel", lopeta);
  };

  // ── Tarkistus ──
  const ylos = () => juuri.current?.scrollIntoView({ block: "start", behavior: hiljaa() ? "auto" : "smooth" });
  const rakenna = () => {
    const kerta = yritys + 1;
    setYritys(kerta);
    setValittu(null);
    setVaihe("tarkistus");
    setRatkaisuNakyy(false);
    ylos();
    const valmis = () => {
      setVaihe("tulos");
      void tallenna({ siemen, paivanReitti, yritys: kerta, oikein: tulokset.filter((t) => t === "ok").length, kunnat: jarjestys });
    };
    if (hiljaa()) { setPaljastettu(KL_YHTEYKSIA); setTimeout(valmis, 300); return; }
    setPaljastettu(0);
    let n = 0;
    if (ajastin.current) clearInterval(ajastin.current);
    ajastin.current = setInterval(() => {
      n++;
      setPaljastettu(n);
      if (n >= KL_YHTEYKSIA) {
        clearInterval(ajastin.current!);
        setTimeout(valmis, 800);
      }
    }, 520);
  };
  const korjaa = () => {
    setVaihe("peli");
    setPaljastettu(0);
    setRatkaisuNakyy(false);
    setJaettu(false);
    ylos();
  };
  // Arvotaan vasta painettaessa: renderissä arvottu siemen erottaisi palvelimen ja selaimen HTML:n.
  const arvoUusi = () => location.assign(`${KL_SIVU}?reitti=${uusiReittiSiemen()}`);

  async function haasta() {
    const url = `${location.origin}${KL_SIVU}?reitti=${encodeURIComponent(siemen)}`;
    const rivi = tulokset.map((t) => (t === "ok" ? "🟩" : "🟥")).join("");
    const nimi = paivanReitti ? `Päivän reitti ${paivays}` : "Kuntaliitos";
    const teksti = `${nimi}: ${rivi} ${oikein}/${KL_YHTEYKSIA}${yritys > 1 ? ` (${yritys}. yritys)` : ""}. Pystytkö rakentamaan reitin ${ratkaisu[0].n} – ${ratkaisu.at(-1)!.n}?`;
    try {
      if (navigator.share) await navigator.share({ title: "Kuntaliitos", text: teksti, url });
      else await navigator.clipboard.writeText(`${teksti} ${url}`);
      setJaettu(true);
    } catch {
      // jako peruttu
    }
  }

  // ── Kartan sisältö ──
  const viim = jarjestys.length - 1;
  const nastat: Nasta[] = jarjestys
    .map((k, i): Nasta | null => {
      const paate = i === 0 || i === viim;
      if (!paate && i > paljastettu) return null;
      const tulo = i > 0 && i <= paljastettu ? tulokset[i - 1] : null;
      return {
        kunta: kunnat.get(k)!,
        num: i + 1,
        laji: i === 0 ? "lahto" : i === viim ? "maali" : "solmu",
        tila: i === 0 ? "ok" : tulo ?? "maali",
      };
    })
    .filter((n): n is Nasta => n !== null);
  const jaksot: Jakso[] = nakyvat.map((t, i) => ({ a: kunnat.get(jarjestys[i])!, b: kunnat.get(jarjestys[i + 1])!, tila: t }));
  const haamu: Jakso[] = ratkaisuNakyy ? ratkaisu.slice(1).map((b, i) => ({ a: ratkaisu[i], b, tila: "ok" })) : [];
  const korostetut = new Set(nastat.map((n) => n.kunta.k));
  if (ratkaisuNakyy) ratkaisu.forEach((k) => korostetut.add(k.k));
  const pi = paljastettu - 1;
  const pari = vaihe === "tarkistus" && pi >= 0
    ? { a: kunnat.get(jarjestys[pi])!, b: kunnat.get(jarjestys[pi + 1])!, tila: tulokset[pi] }
    : null;
  const pelissa = vaihe === "peli";
  const kartta = (
    <Kartta
      reitti={reitti}
      nastat={nastat}
      jaksot={jaksot}
      haamu={haamu}
      korostetut={korostetut}
      pari={pari}
      aktiivinen={vaihe === "tarkistus"}
      otsikko={pelissa ? "Reitin päätepisteet" : taydet ? "Valmis reitti" : "Rakennettu reitti"}
      huomio={pelissa ? "Reitti piirtyy kartalle vasta, kun rakennat sen." : ratkaisuNakyy ? "Katkoviiva näyttää oikean reitin." : ""}
    />
  );
  const mittari = Array.from({ length: KL_YHTEYKSIA }, (_, i) => (i < paljastettu ? tulokset[i] : "idle"));
  const vihje = pelissa
    ? "Järjestä kunnat niin, että jokaisella vierekkäisellä parilla on yhteinen raja. Reitti piirtyy kartalle vasta, kun rakennat sen."
    : vaihe === "tarkistus"
      ? "Reitti rakentuu pari kerrallaan – kartta näyttää, mihin se katkeaa."
      : taydet
        ? "Koko reitti kulki yhteisiä rajoja pitkin päätepisteestä päätepisteeseen."
        : "Katkokset on merkitty korttien väliin ja kartalle. Korjaa katkos ja rakenna reitti uudelleen.";

  return (
    <div className="kl" ref={juuri}>
      <header className="kl-bar">
        <span className="kl-bar-l">
          <a className="kl-logo" href="/" aria-label="Tietoniekka etusivulle"><span>TIETO</span>NIEKKA</a>
          <span className="kl-bar-sep" aria-hidden="true" />
          <span className="kl-bar-nimi">
            <h1>Kuntaliitos</h1>
            <span className="kl-bar-laji">{paivanReitti ? `Päivän reitti ${paivays}` : "Reittipeli"}</span>
          </span>
        </span>
        <span className="kl-bar-r">
          <span className="kl-mittari" role="img" aria-label={`Oikeat yhteydet ${oikein} / ${KL_YHTEYKSIA}`}>
            {mittari.map((t, i) => <span key={i} className={`kl-seg kl-seg--${t}`} />)}
          </span>
          <span className="kl-pisteet">{oikein * KL_PISTEET} p</span>
        </span>
      </header>

      <div className="kl-main">
        <div className="kl-peli">
          {vaihe === "tulos" && (
            <div className={`kl-tulos kl-tulos--${taydet ? "ok" : "bad"}`} role="status">
              <span className="kl-tulos-ik"><Ikoni d={taydet ? IKONI.ok : IKONI.katkos} w={2.8} /></span>
              <span className="kl-tulos-t">
                <b>{taydet ? "Reitti valmis" : "Reitti katkesi"}</b>
                <span>
                  {taydet ? `Kaikki ${KL_YHTEYKSIA} yhteyttä oikein` : `${oikein}/${KL_YHTEYKSIA} yhteyttä oikein`} · {oikein * KL_PISTEET} pistettä
                  {yritys > 1 ? ` · ${yritys}. yritys` : ""}
                </span>
              </span>
            </div>
          )}

          {!pelissa && <div className="kl-mkartta">{kartta}</div>}

          <p className="kl-vihje">{vihje}</p>

          <div className="kl-lista" role="list" aria-label="Kuntaketju">
            {jarjestys.map((k, i) => {
              const kunta = kunnat.get(k)!;
              const lukko = i === 0 || i === viim;
              const tila = i > 0 && i <= paljastettu ? tulokset[i - 1] : "idle";
              const korttiTila = lukko ? "lukittu" : raahattava === k ? "siirtyva" : valittu === k ? "valittu" : "lepo";
              const porras = PORRAS[i % PORRAS.length];
              return (
                <div key={k} className="kl-rivi" style={{ "--kl-porras": porras } as CSSProperties}>
                  {i > 0 && (
                    <div className="kl-liitos" data-tila={tila}>
                      <span className="kl-kisko" />
                      {tila !== "idle" && (
                        <span className="kl-pilleri">
                          <Ikoni d={tila === "ok" ? IKONI.ok : IKONI.bad} w={3} />
                          {tila === "ok" ? "Yhteinen raja" : "Ei yhteistä rajaa"}
                        </span>
                      )}
                    </div>
                  )}
                  <div
                    ref={(el) => { if (el) kortit.current.set(k, el); else kortit.current.delete(k); }}
                    className="kl-kortti"
                    data-tila={korttiTila}
                    role="listitem"
                    tabIndex={0}
                    aria-label={
                      lukko
                        ? `${kunta.n}, ${kunta.m}. Reitin kiinnitetty ${i === 0 ? "lähtö" : "maali"}, paikka ${i + 1} / ${viim + 1}.`
                        : `${kunta.n}, ${kunta.m}. Paikka ${i + 1} / ${viim + 1}.${pelissa ? " Siirrettävä." : ""}`
                    }
                    aria-pressed={pelissa && !lukko ? valittu === k : undefined}
                    onPointerDown={(e) => alas(k, e, false)}
                    onClick={() => napauta(k)}
                    onKeyDown={(e) => nappain(k, e)}
                  >
                    <span className="kl-kortti-kilpi">
                      <Kilpi kunta={kunta} />
                      <span className="kl-kortti-num">{i + 1}</span>
                    </span>
                    <span className="kl-kortti-t">
                      <span className="kl-nimi" style={{ "--kl-len": Math.max(8, kunta.n.length) } as CSSProperties}>{kunta.n}</span>
                      <span className="kl-maakunta">{kunta.m}</span>
                    </span>
                    {lukko ? (
                      <span className="kl-kahva kl-kahva--lukko" title="Kiinnitetty päätepiste"><Ikoni d={IKONI.lukko} w={1.9} /></span>
                    ) : (
                      <span
                        className="kl-kahva"
                        title="Siirrä"
                        onPointerDown={(e) => { e.stopPropagation(); alas(k, e as unknown as RPointerEvent<HTMLDivElement>, true); }}
                      >
                        <Ikoni d={IKONI.kahva} w={2.8} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="kl-sr" aria-live="polite">{ilmoitus}</p>

          {ratkaisuNakyy && (
            <div className="kl-ratkaisu">
              <div className="kl-pikku">Oikea reitti</div>
              <ol>
                {ratkaisu.map((k) => (
                  <li key={k.k}>
                    <Kilpi kunta={k} className="kl-kilpi--pieni" />
                    <span>{k.n}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {pelissa && <div className="kl-mkartta kl-mkartta--ala">{kartta}</div>}

          <div className="kl-toiminto">
            {pelissa && <button type="button" className="kl-nappi" onClick={rakenna}>Rakenna reitti</button>}
            {vaihe === "tarkistus" && <div className="kl-rakentuu">Reittiä rakennetaan · {oikein}/{KL_YHTEYKSIA}</div>}
            {vaihe === "tulos" && (taydet
              ? <button type="button" className="kl-nappi kl-nappi--teal" onClick={arvoUusi}>Arvo uusi reitti</button>
              : <button type="button" className="kl-nappi" onClick={korjaa}>Korjaa katkos</button>)}
          </div>
          {vaihe === "tulos" && (
            <div className="kl-lisat">
              {!taydet && (
                <button type="button" className="kl-nappi kl-nappi--2" onClick={() => setRatkaisuNakyy(true)} disabled={ratkaisuNakyy}>
                  {ratkaisuNakyy ? "Oikea reitti näkyvissä" : "Näytä oikea reitti"}
                </button>
              )}
              {taydet && <button type="button" className="kl-nappi kl-nappi--2" onClick={haasta}>{jaettu ? "Linkki jaettu" : "Haasta kaveri"}</button>}
              {!taydet && <button type="button" className="kl-linkki" onClick={arvoUusi}>Arvo uusi reitti</button>}
              {!taydet && <button type="button" className="kl-linkki" onClick={haasta}>{jaettu ? "Linkki jaettu" : "Haasta kaveri"}</button>}
              {!paivanReitti && <a className="kl-linkki kl-linkki--paiva" href={KL_SIVU}>Päivän reitti {paivays}</a>}
            </div>
          )}
        </div>

        <aside className="kl-sivu">
          {kartta}
          <div className="kl-tilanne">
            <div className="kl-pikku">Tilanne</div>
            <div className="kl-tilanne-rivi">
              <span>Oikeat yhteydet</span>
              <b className="kl-iso">{oikein}/{KL_YHTEYKSIA}</b>
            </div>
            <span className="kl-mittari kl-mittari--levea" aria-hidden="true">
              {mittari.map((t, i) => <span key={i} className={`kl-seg kl-seg--${t}`} />)}
            </span>
            <div className="kl-tilanne-rivi kl-tilanne-rivi--viiva">
              <span>Pisin reitti</span>
              <b>{pisin === 0 ? "—" : `${pisin + 1} kuntaa`}</b>
            </div>
            <div className="kl-tilanne-rivi">
              <span>Pisteet</span>
              <b className="kl-teal">{oikein * KL_PISTEET} p</b>
            </div>
          </div>
        </aside>
      </div>

      <section className="kl-info" aria-labelledby="kl-info-h">
        <h2 id="kl-info-h">Näin pelaat</h2>
        <ol>
          <li><b>Reitin päät ovat kiinni.</b> Ensimmäinen ja viimeinen kunta pysyvät paikallaan.</li>
          <li><b>Järjestä välikunnat.</b> Raahaa tai napauta kahta korttia vaihtaaksesi niiden paikat. Jokaisella vierekkäisellä parilla pitää olla yhteinen raja.</li>
          <li><b>Rakenna reitti.</b> Kartta piirtää reitin pari kerrallaan. Jokainen oikea yhteys on {KL_PISTEET} pistettä – katkoksen voi korjata ja yrittää uudelleen.</li>
        </ol>
        <p>Uusi päivän reitti joka päivä. Yhteinen raja voi kulkea myös vesialueella, esimerkiksi Naantalin ja Turun välillä.</p>
        <p className="kl-lahde">{lahde}</p>
      </section>
    </div>
  );
}

function Virhe() {
  const uusi = () => location.assign(`${KL_SIVU}?reitti=${uusiReittiSiemen()}`);
  return (
    <div className="kl">
      <header className="kl-bar">
        <span className="kl-bar-l">
          <a className="kl-logo" href="/" aria-label="Tietoniekka etusivulle"><span>TIETO</span>NIEKKA</a>
          <span className="kl-bar-sep" aria-hidden="true" />
          <span className="kl-bar-nimi"><h1>Kuntaliitos</h1></span>
        </span>
      </header>
      <div className="kl-virhe">
        <div className="kl-virhe-laatikko">
          <span className="kl-virhe-ik"><Ikoni d={IKONI.varoitus} w={1.8} /></span>
          <b>Reittiä ei saatu haettua</b>
          <span>Kokeile hakea uusi reitti. Jos ongelma jatkuu, palaa hetken päästä.</span>
          <button type="button" className="kl-nappi" onClick={uusi}>Hae uusi reitti</button>
          <a className="kl-linkki" href="/">Tietoniekan etusivulle</a>
        </div>
      </div>
    </div>
  );
}
