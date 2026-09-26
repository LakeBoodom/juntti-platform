"use client";
// TUPLA TAI KUITTI — pelinäkymä (CD "TN Tupla tai kuitti" kierros 1, 25.9.2026).
// Vaiheet: alku → kysymys → palaute (alapaneeli: oikein → kuittaa/tuplaa, väärin → huudahdus)
// → loppu. Väriparin sääntö: TUPLA = teeman korostusväri, KUITTI = kulta; lime vain sivuston
// päätoiminnolle (Aloita, Katso tulos, Haasta kaveri), yksi per näkymä.
// Ei kantaan kirjoittamista vielä; paras tulos muistetaan selaimessa sarjakohtaisesti.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  LAUSEET_OLETUS,
  POTTI,
  TURVAT,
  maara,
  turvassa,
  uusiSiemen,
  type TuplaKysymys,
  type TuplaTeema,
} from "@/lib/tuplaTaiKuitti";
import { Kasa, Symboli, TuplaSprite } from "@/components/tn20/TuplaIkonit";
import { getSupabase } from "@/lib/supabase";

type Vaihe = "alku" | "kysymys" | "palaute" | "loppu";
type Syy = "kuittasi" | "jaahy" | "taydet";
type Loppu = { syy: Syy; saalis: number; oikein: number; l2: string; uusiEnnatys: boolean };

const KIRJAIMET = ["A", "B", "C", "D"];
/** Oikein-määrä sanana: genetiivi ("seitsemän oikean vastauksen jälkeen") ja nominatiivi. */
const GEN = ["nollan", "yhden", "kahden", "kolmen", "neljän", "viiden", "kuuden", "seitsemän", "kahdeksan", "yhdeksän", "kymmenen"];
const NOM = ["Nolla", "Yksi", "Kaksi", "Kolme", "Neljä", "Viisi", "Kuusi", "Seitsemän", "Kahdeksan", "Yhdeksän", "Kymmenen"];

const potti = (oikein: number) => (oikein > 0 ? POTTI[oikein - 1] : 0);
const onTurva = (askel: number) => (TURVAT as readonly number[]).includes(askel);
const iso = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const hiljaa = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function lueParas(avain: string): number | null {
  try {
    const x = localStorage.getItem(avain);
    return x == null ? null : Number(x);
  } catch {
    return null;
  }
}
/** Tallentaa, jos parempi. Palauttaa true, kun edellinen ennätys ylittyi. */
function tallennaParas(avain: string, n: number): boolean {
  try {
    const vanha = lueParas(avain);
    if (vanha == null || n > vanha) {
      localStorage.setItem(avain, String(n));
      return vanha != null;
    }
  } catch {
    // selaimen tallennus estetty — paras tulos vain jää muistamatta
  }
  return false;
}

/** Sama selaimen satunnaistunniste kuin visapelin quiz_plays-tallennuksessa. */
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

/** Pelikerta tilastoihin (tupla_pelit). Best-effort: epäonnistuminen ei näy pelaajalle. */
async function tallennaPeli(r: { teema: string; siemen: string; paivanSarja: boolean; syy: string; saalis: number; oikein: number; kysymykset: string[] }) {
  try {
    const sb = getSupabase();
    if (!sb) return;
    await sb.from("tupla_pelit" as never).insert({
      teema: r.teema, siemen: r.siemen, paivan_sarja: r.paivanSarja, syy: r.syy, saalis: r.saalis, oikein: r.oikein,
      kysymykset: r.kysymykset, session_id: istunto(),
    } as never);
  } catch {
    // tilasto jää saamatta — peli jatkuu normaalisti
  }
}

/** Luku laskee kohti kohdetta (tuplaus, jäähy, tulos). Vähennetty liike → suoraan lopulliseen. */
function useLaskuri(kohde: number, alku: number, kesto: number, viive = 0) {
  const [arvo, setArvo] = useState(kohde);
  useEffect(() => {
    if (hiljaa() || kohde === alku) {
      setArvo(kohde);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + viive;
    const askel = (nyt: number) => {
      const k = Math.min(1, Math.max(0, (nyt - t0) / kesto));
      const e = 1 - Math.pow(1 - k, 3);
      setArvo(Math.round(alku + (kohde - alku) * e));
      if (k < 1) raf = requestAnimationFrame(askel);
    };
    setArvo(alku);
    raf = requestAnimationFrame(askel);
    return () => cancelAnimationFrame(raf);
  }, [kohde, alku, kesto, viive]);
  return arvo;
}

type LadTila = "kysymys" | "hukka" | "kuitti" | "taydet" | "alku";
type Solu = { arvo: number; askel: number; tila: string; lukko: boolean; kiinni: boolean };

/** Tikapuiden solut (CD:n lad()): ohitettu vihreä, turvataso kulta, nykyinen teemaväri. */
function solut(oikein: number, tila: LadTila): Solu[] {
  return POTTI.map((arvo, i) => {
    const turva = onTurva(i + 1);
    let t = i < oikein ? (turva ? "turva-ok" : "ok") : turva ? "turva" : "";
    if (tila === "kysymys" && i === oikein) t = "nyt";
    if (tila === "hukka" && i === oikein) t = "hukka";
    if (tila === "kuitti" && i === oikein - 1) t = "kuitti";
    if (tila === "taydet" && i === 9) t = "nyt";
    if (tila === "alku" && i === 9) t = "huippu";
    return { arvo, askel: i + 1, tila: t, lukko: turva, kiinni: turva && i < oikein };
  });
}

function Tikapuut({ oikein, tila, napsahtaa }: { oikein: number; tila: LadTila; napsahtaa?: number }) {
  return (
    <ol className="ttk-lad" aria-label={`Tikapuut: ${oikein} oikein`}>
      {solut(oikein, tila).map((c) => (
        <li key={c.askel} className={`ttk-lad-c ${c.tila} ${napsahtaa === c.askel ? "snap" : ""}`}>
          <Symboli id={c.kiinni ? "ttk-lukko" : "ttk-lukko-auki"} koko={[9, 10]} className="ttk-lad-lock" style={{ opacity: c.lukko ? 1 : 0 }} />
          <span>{c.arvo}</span>
        </li>
      ))}
    </ol>
  );
}

function Ylapalkki({ t }: { t: TuplaTeema }) {
  return (
    <header className="ttk-bar">
      <a className="ttk-logo" href="/" aria-label="Tietoniekka etusivu">
        <span>TIETO</span>NIEKKA
      </a>
      <span className="ttk-bar-r">
        <span className="ttk-bar-top">{t.painos ? `${t.painos.x} vai ${t.painos.y}` : "Tupla tai kuitti"}</span>
        <span className="ttk-bar-name">{t.painos?.nimi ?? t.nimi}</span>
      </span>
    </header>
  );
}

/** Sanamerkki: TUPLA / tai / KUITTI + teeman nimi, tai kausipainoksen X / vai / Y. */
function Sanamerkki({ t }: { t: TuplaTeema }) {
  if (t.painos) {
    return (
      <div className="ttk-lockup ttk-lockup--ed">
        <h1 className="ttk-wm">
          <span className="ttk-wm-x">{t.painos.x}</span>
          <span className="ttk-wm-sep"><span>vai</span><i /></span>
          <span className="ttk-wm-y">{t.painos.y}</span>
        </h1>
        <span className="ttk-edtag">
          <b className="acc">Tupla</b> <small>tai</small> <b className="kulta">Kuitti</b> <em>{t.painos.tag}</em>
        </span>
      </div>
    );
  }
  // Virallinen logo (CD v0.2, 26.9.2026) korvaa tekstisanamerkin; teemarivi pysyy.
  return (
    <div className="ttk-lockup">
      <h1 className="ttk-logo-h">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/20/tupla/logo.webp" alt={`Tupla tai kuitti – ${t.nimi}`} width={640} height={374} fetchPriority="high" />
      </h1>
      <span className="ttk-theme"><i />{t.nimi}</span>
    </div>
  );
}

export default function TuplaClient({ teema: t, sarja, siemen, paivanSarja, paivays }: { teema: TuplaTeema; sarja: TuplaKysymys[]; siemen: string; paivanSarja: boolean; /** "26.9." */ paivays: string }) {
  const [vaihe, setVaihe] = useState<Vaihe>("alku");
  const [i, setI] = useState(0);
  const [valinta, setValinta] = useState<string | null>(null);
  const [loppu, setLoppu] = useState<Loppu | null>(null);
  const [paras, setParas] = useState<number | null>(null);
  const [jaettu, setJaettu] = useState(false);
  const p = t.palkinto;
  const L = t.lauseet ?? LAUSEET_OLETUS;
  const avain = `tk-tupla-${t.slug}-${siemen}`;
  const q = sarja[i];
  const vastattu = vaihe === "palaute";
  const oikein = vastattu && valinta === q?.oikea;
  const vaara = vastattu && !oikein;
  // Oikeat vastaukset tähän mennessä (palautteessa tämänkertainen oikea lasketaan mukaan)
  const oikeat = oikein ? i + 1 : i;
  const pot = potti(oikeat);
  const turva = turvassa(oikeat);
  const turvaNyt = turvassa(i);
  // HUD:n luku: tuplaus laskee ylös, jäähy laskee turvatasolle (CD animaatiot 1 ja 3)
  const hudLuku = vaara ? turvaNyt : pot;
  const hudNayta = useLaskuri(hudLuku, vastattu ? potti(i) : hudLuku, vaara ? 450 : 300, vaara ? 150 : 0);

  useEffect(() => setParas(lueParas(avain)), [avain]);

  function lopeta(syy: Syy, saalis: number, oik: number) {
    const lista = syy === "taydet" ? L.taydet : syy === "jaahy" ? (saalis > 0 ? L.turva : L.nolla) : saalis <= 4 ? L.pieni : L.kuitattu;
    const l2 = (lista[Math.floor(Math.random() * lista.length)] ?? "").replace("{N}", NOM[oik]).replace("{n}", NOM[oik].toLowerCase()).replace("{turva}", maara(saalis, p));
    const uusiEnnatys = tallennaParas(avain, saalis);
    // Pelatut kysymykset: oikein menneet + jäähyllä se, joka meni väärin
    const pelatut = sarja.slice(0, syy === "jaahy" ? oik + 1 : oik).map((x) => x.id);
    void tallennaPeli({ teema: t.slug, siemen, paivanSarja, syy, saalis, oikein: oik, kysymykset: pelatut });
    setParas(lueParas(avain));
    setLoppu({ syy, saalis, oikein: oik, l2, uusiEnnatys });
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

  // Arvotaan vasta painettaessa: renderissä arvottu siemen erottaisi palvelimen ja selaimen HTML:n.
  const arvoUusi = () => location.assign(`?sarja=${uusiSiemen()}`);

  async function haasta() {
    const url = `${location.origin}/peli/tupla-tai-kuitti/${t.slug}?sarja=${encodeURIComponent(siemen)}`;
    const teksti = loppu ? `Sain ${maara(loppu.saalis, p)} Tupla tai kuitti -pelissä (${t.nimi}). Pystytkö parempaan?` : "Tupla tai kuitti";
    try {
      if (navigator.share) await navigator.share({ title: "Tupla tai kuitti", text: teksti, url });
      else await navigator.clipboard.writeText(`${teksti} ${url}`);
      setJaettu(true);
    } catch {
      // jako peruttu
    }
  }

  // Päätöspaneeli saa fokuksen (ruudunlukija ja näppäimistö) — sivua ei vieritetä.
  const paneeli = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (vastattu) paneeli.current?.focus({ preventScroll: true });
  }, [vastattu]);

  const tyyli = { "--acc": t.accent, "--ttk-kuvio": t.kuvio } as CSSProperties;

  /* ── Aloitus ──────────────────────────────────────────────────────── */
  if (vaihe === "alku") {
    const saannot = [
      { n: 1, h: "Oikein tuplaa potin", s: `1 → 2 → 4 … 512 ${p.monta}.`, c: "var(--ttk-ok)", napit: false },
      { n: 2, h: "Kuittaa tai tuplaa", s: "Ota potti tai jatka vaikeampaan.", c: "var(--acc)", napit: true },
      { n: 3, h: t.painos ? `${t.painos.y} vie ${p.kaikki}` : "Väärin vie potin", s: `Turvatasot ${POTTI[TURVAT[0] - 1]} ja ${POTTI[TURVAT[1] - 1]} jäävät sinulle.`, c: "var(--ttk-red)", napit: false },
    ];
    return (
      <main className="ttk" style={tyyli}>
        <TuplaSprite />
        <div className="ttk-kuvio" aria-hidden="true" />
        <Ylapalkki t={t} />
        <section className="ttk-intro">
          <Sanamerkki t={t} />
          <p className="ttk-ingress">{t.kuvaus}</p>
          <div className="ttk-rules">
            <ol className="ttk-rules-l">
              {saannot.map((r) => (
                <li key={r.n}>
                  <span className="ttk-rule-h">
                    <b style={{ borderColor: r.c, color: r.c }}>{r.n}</b>
                    {r.h}
                  </span>
                  <span className="ttk-rule-s">{r.s}</span>
                  {r.napit && (
                    <span className="ttk-chips" aria-hidden="true">
                      <span className="ttk-chip ttk-chip--k">KUITTAA</span>
                      <span className="ttk-chip ttk-chip--t">TUPLAA →</span>
                    </span>
                  )}
                </li>
              ))}
            </ol>
            <ol className="ttk-vlad" aria-label="Tikapuut 1–512">
              {solut(0, "alku")
                .reverse()
                .map((c) => (
                  <li key={c.askel} className={c.tila}>
                    <span className="ttk-vlad-n">{c.askel}</span>
                    <Symboli id="ttk-lukko" koko={[10, 11]} style={{ opacity: c.lukko ? 1 : 0, color: "var(--ttk-gold)" }} />
                    <b>{c.arvo}</b>
                  </li>
                ))}
            </ol>
          </div>
          <div className="ttk-start">
            <button className="ttk-cta" onClick={alusta}>ALOITA</button>
            <p className="ttk-seed">
              <span>
                <b>{paivanSarja ? `Päivän sarja ${paivays}` : "Oma sarja"}</b> · {paivanSarja ? "sama kaikille tänään" : "sama kuin haastajallasi"}
              </span>
              <button type="button" className="ttk-link" onClick={arvoUusi}>Arvo uusi sarja</button>
            </p>
            {paras != null && paras > 0 && (
              <p className="ttk-best">
                <Symboli id={`ttk-${p.ikoni}`} koko={20} />
                Paras tuloksesi tässä sarjassa: {maara(paras, p)}
              </p>
            )}
          </div>
        </section>
      </main>
    );
  }

  /* ── Tulos ────────────────────────────────────────────────────────── */
  if (vaihe === "loppu" && loppu) {
    return <Tulos t={t} loppu={loppu} paras={paras} jaettu={jaettu} haasta={haasta} alusta={alusta} arvoUusi={arvoUusi} tyyli={tyyli} />;
  }

  /* ── Kysymys + palaute ───────────────────────────────────────────── */
  const viimeinen = i === sarja.length - 1;
  const seuraava = potti(i + 2);
  const vapaa = oikein && !viimeinen && turva > 0 && turva === pot;
  const lukittuu = oikein && !viimeinen && turva === 0 && onTurva(i + 2);
  let riski = "Seuraava kysymys on vaikeampi. Väärällä vastauksella menetät kaiken.";
  if (vapaa) riski = `Seuraava kysymys on vaikeampi, mutta turvassa on jo ${maara(turva, p)}. Väärä vastaus ei vie mitään.`;
  else if (turva > 0) riski = `Seuraava kysymys on vaikeampi. Väärällä vastauksella saat turvaan ${maara(turva, p)}.`;
  if (lukittuu) riski += ` Oikealla vastauksella ${seuraava} lukittuu turvaan.`;
  // Pyramidipalkinnot (pallo, karkki, käpy) levenevät, tornit kasvavat ylöspäin
  const kasaS = p.ikoni === "karkki" || p.ikoni === "pallo" || p.ikoni === "kapy" || p.ikoni === "popcorn" ? 14 : 22;
  const turvaHud = turvassa(oikeat);

  return (
    <main className={`ttk ttk--peli ${vaara ? "ttk--hukka" : ""}`} style={tyyli}>
      <TuplaSprite />
      <div className="ttk-kuvio ttk-kuvio--matala" aria-hidden="true" />
      <Ylapalkki t={t} />
      <div className="ttk-hud">
        <div className="ttk-hud-row">
          <div className="ttk-pot">
            <Symboli id={`ttk-${p.ikoni}`} koko={30} style={{ opacity: hudLuku ? 1 : 0.25 }} />
            <span className="ttk-pot-c">
              <span className="ttk-eyebrow">{vaara ? (turvaNyt ? "Turvassa" : "Potti meni") : "Potti"}</span>
              <span className="ttk-pot-v">
                <b key={`${oikeat}-${vaihe}`} className={`ttk-pot-n ${oikein ? "pop" : ""} ${vaara ? (turvaNyt ? "kulta" : "puna") : ""}`}>{hudNayta}</b>
                <span>{hudLuku === 1 ? p.yksi : p.monta}</span>
                {oikein && <span className="ttk-x2" aria-hidden="true">×2</span>}
              </span>
            </span>
          </div>
          <div className="ttk-hud-r">
            {!vastattu && (
              <span>
                Oikein → <b>{potti(i + 1)}</b>
              </span>
            )}
            <span className={`ttk-safe ${turvaHud ? "on" : ""}`}>
              <Symboli id={turvaHud ? "ttk-lukko" : "ttk-lukko-auki"} koko={[11, 12]} />
              {turvaHud ? `Turvassa ${turvaHud}` : "Ei turvaa vielä"}
            </span>
          </div>
        </div>
        <Tikapuut oikein={oikeat} tila={vaara ? "hukka" : oikein && viimeinen ? "taydet" : "kysymys"} napsahtaa={oikein && onTurva(i + 1) ? i + 1 : undefined} />
      </div>

      <section className={`ttk-q ${vastattu ? "himmea" : ""}`}>
        <div className="ttk-q-meta">
          <span className="ttk-eyebrow ttk-eyebrow--w">Kysymys {i + 1}/10</span>
          <span className="ttk-dots" aria-label={`Vaikeus ${q.taso}/5`}>
            {[1, 2, 3, 4, 5].map((d) => <i key={d} className={d <= q.taso ? "on" : ""} />)}
          </span>
          <span className="ttk-src">{q.visa}</span>
        </div>
        <h2 className={`ttk-q-h ${q.kysymys.length > 60 ? "pitka" : ""}`}>{q.kysymys}</h2>
        <div className="ttk-opts">
          {q.vaihtoehdot.map((v, k) => {
            const tila = !vastattu ? "" : v === q.oikea ? "oikea" : v === valinta ? "vaara" : "himmea";
            return (
              <button key={v} className={`ttk-opt ${tila}`} onClick={() => vastaa(v)} disabled={vaihe !== "kysymys"}>
                <b>{KIRJAIMET[k]}</b>
                <span>{v}</span>
              </button>
            );
          })}
        </div>
      </section>

      {vastattu && (
        <>
          <div className={`ttk-scrim ${vaara ? "puna" : ""}`} aria-hidden="true" />
          <div
            ref={paneeli}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={oikein ? "Oikein – kuittaa vai tuplaa" : t.virhe}
            className={`ttk-sheet ${vaara ? "ttk-sheet--hukka" : ""}`}
          >
            <span className="ttk-grip" aria-hidden="true" />
            {oikein ? (
              <>
                <div className="ttk-fb">
                  <div className="ttk-fb-h">
                    <span className="ttk-badge ok" aria-hidden="true">
                      <svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="ttk-fb-t">{viimeinen ? "Täydet!" : "Oikein!"}</span>
                    <span className="ttk-fb-a">{q.oikea}</span>
                  </div>
                  {q.selitys && <p className="ttk-fact">{q.selitys}</p>}
                </div>
                {viimeinen ? (
                  <button className="ttk-cta" onClick={() => lopeta("taydet", POTTI[9], 10)}>KATSO TULOS</button>
                ) : (
                  <>
                    <hr />
                    <div className="ttk-next">
                      <div className="ttk-next-h">
                        <span className="ttk-eyebrow">Seuraavaksi kysymys {i + 2}/10</span>
                        <span className="ttk-dots" aria-hidden="true">
                          {[1, 2, 3, 4, 5].map((d) => <i key={d} className={d <= (sarja[i + 1]?.taso ?? 0) ? "on" : ""} />)}
                        </span>
                        {vapaa && <span className="ttk-pill">Riskitön tuplaus</span>}
                      </div>
                      <p>{riski}</p>
                    </div>
                    <div className="ttk-choice">
                      <button className="ttk-card ttk-card--k" onClick={() => lopeta("kuittasi", pot, oikeat)}>
                        <span className="ttk-card-top">
                          <span className="ttk-card-t">KUITTAA</span>
                          <Kasa p={p.ikoni} n={oikeat} s={kasaS} />
                        </span>
                        <span className="ttk-card-v"><b>{pot}</b> {pot === 1 ? p.yksi : p.monta}</span>
                        <span className="ttk-card-s">Talteen nyt</span>
                      </button>
                      <button className="ttk-card ttk-card--t" onClick={tuplaa}>
                        <span className="ttk-card-top">
                          <span className="ttk-card-t">TUPLAA →</span>
                          <Kasa p={p.ikoni} n={oikeat + 1} s={kasaS} tavoite />
                        </span>
                        <span className="ttk-card-v"><b>{seuraava}</b> {p.monta}</span>
                        <span className={`ttk-card-s ${turva ? "kulta" : "puna"}`}>
                          Väärin →
                          <Symboli id={turva ? "ttk-lukko" : "ttk-lukko-auki"} koko={[10, 11]} />
                          <b>{maara(turva, p)}</b>
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="ttk-fb-h">
                  <span className="ttk-badge puna" aria-hidden="true">
                    <svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
                  </span>
                  <span className="ttk-ouch">{t.virhe}</span>
                </div>
                <div className="ttk-fb">
                  <span className="ttk-fb-oikea">Oikea vastaus: <b>{q.oikea}</b></span>
                  {q.selitys && <p className="ttk-fact">{q.selitys}</p>}
                </div>
                <div className={`ttk-box ${turvaNyt ? "turva" : ""}`}>
                  <Symboli id={`ttk-${p.ikoni}`} koko={34} style={{ opacity: turvaNyt ? 1 : 0.22 }} />
                  <span>{turvaNyt ? `Turvassa ${maara(turvaNyt, p)}.` : "Potti meni."}</span>
                  {turvaNyt > 0 && <Symboli id="ttk-lukko" koko={[16, 18]} style={{ color: "var(--ttk-gold)" }} />}
                </div>
                <button className="ttk-cta" onClick={() => lopeta("jaahy", turvaNyt, i)}>KATSO TULOS</button>
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}

function Tulos({ t, loppu, paras, jaettu, haasta, alusta, arvoUusi, tyyli }: {
  t: TuplaTeema; loppu: Loppu; paras: number | null; jaettu: boolean;
  haasta: () => void; alusta: () => void; arvoUusi: () => void; tyyli: CSSProperties;
}) {
  const p = t.palkinto;
  const { syy, saalis, oikein } = loppu;
  const luku = useLaskuri(saalis, syy === "jaahy" ? saalis : 0, 600, 250);
  const otsikko = syy === "taydet" ? "Täydet" : syy === "jaahy" ? t.virhe.replace(/!$/, "") : t.painos ? `${iso(p.kaikki)} talteen` : "Kuitattu";
  // Oikein-määrä sanana: "yhden oikean vastauksen jälkeen" eikä "1 oikean vastauksen jälkeen"
  const l1 =
    syy === "taydet"
      ? "Kaikki 10 oikein."
      : syy === "jaahy"
        ? `Kysymys ${oikein + 1} meni ohi.${saalis ? ` Turvassa oli ${maara(saalis, p)}.` : ""}`
        : `Otit ${saalis === 1 ? p.yhden : p.kaikki} talteen ${GEN[oikein]} oikean vastauksen jälkeen.`;
  // Kasan korkeus kertoo matkan (jäähyllä turvatun osan korkeus)
  const kasaN = syy === "taydet" ? 10 : syy === "jaahy" ? (saalis >= POTTI[TURVAT[1] - 1] ? TURVAT[1] : saalis > 0 ? TURVAT[0] : 0) : oikein;
  const ladTila: LadTila = syy === "taydet" ? "taydet" : syy === "jaahy" ? "hukka" : "kuitti";
  return (
    <main className={`ttk ttk--tulos ttk--${syy}`} style={tyyli}>
      <TuplaSprite />
      <div className="ttk-glow" aria-hidden="true" />
      <Ylapalkki t={t} />
      <section className="ttk-res">
        <span className="ttk-res-h">{otsikko}</span>
        <div className="ttk-res-row">
          <div className="ttk-res-n">
            <b className={syy === "jaahy" && saalis ? "kulta" : ""}>{luku}</b>
            <span>{saalis === 1 ? p.yksi : p.monta}</span>
          </div>
          <span className="ttk-res-kasa">
            <Kasa p={p.ikoni} n={kasaN} s={58} className="ttk-kasa--tulos" />
            {syy === "taydet" && (
              <span className="ttk-burst" aria-hidden="true">
                {Array.from({ length: 12 }, (_, k) => (
                  <svg key={k} style={{ ["--a" as string]: `${(k / 12) * 360}deg`, ["--d" as string]: `${110 + (k % 3) * 20}px` }}>
                    <use href={`#ttk-${p.ikoni}`} />
                  </svg>
                ))}
              </span>
            )}
          </span>
        </div>
        <div className="ttk-res-l">
          <span className="ttk-res-l1">{l1}</span>
          {loppu.l2 && <span className="ttk-res-l2">{loppu.l2}</span>}
        </div>
        <Tikapuut oikein={syy === "taydet" ? 10 : oikein} tila={ladTila} />
        {paras != null && paras > 0 && (
          <p className="ttk-res-best">
            <span>Paras tuloksesi tässä sarjassa: {maara(paras, p)}</span>
            {loppu.uusiEnnatys && <span className="ttk-pill">Uusi ennätys</span>}
          </p>
        )}
        <div className="ttk-actions">
          <button className="ttk-cta" onClick={haasta}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 13V3M6 6.5L10 2.5l4 4M4 11v5.5h12V11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {jaettu ? "LINKKI JAETTU ✓" : "HAASTA KAVERI"}
          </button>
          <button className="ttk-btn2" onClick={alusta}>Pelaa sama sarja uudelleen</button>
          <button className="ttk-btn2" onClick={arvoUusi}>Arvo uusi sarja</button>
        </div>
        <a className="ttk-back" href={t.paluu.href}>← {t.paluu.teksti}</a>
      </section>
    </main>
  );
}
