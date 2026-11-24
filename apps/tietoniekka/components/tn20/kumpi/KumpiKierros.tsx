"use client";
// KUMPI? 2.0 — Kierros, Päivän Kumpi? ja Putki (brief 20.11.2026, A6 + B; vaihe 2 22.11.2026). Kierros ja Päivän
// Kumpi?: kymmenen kysymystä, ei pisteitä eikä kelloa; Päivän tulos säilyy selaimessa koko päivän. Putki: loputon jono,
// kello 10 s (7 s kysymyksestä 21), väärä vastaus tai loppunut aika katkaisee putken, ennätys selaimessa. Pelihetki (CD spec):
// napautus kortista → arvot paljastuvat korttiin (✓/✗, ponnahdus/tärähdys) → etenemisrengas 2,5 s → seuraava.
// Napautus mihin tahansa ohittaa renkaan. Faktalause vain ruudunlukijalle (aria-live), koska arvot näkyvät korteissa.
// Tulosnäkymä: tulos → tuloskortti ja jako → pelin linkit → muut pelit. Vastauslista poistettu (Heikki 20.11.2026:
// vie paljon tilaa eikä tuo lisäarvoa).
// KORTTISÄÄNTÖ: kysymyksen ja nimien koko sovitetaan Range-mittauksella pisimmän sanan mukaan (sana ei katkea keskeltä).
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Jakoalue from "@/components/tn20/jako/Jakoalue";
import SeuraavaksiRivi, { type SkPaikka } from "@/components/tn20/seuraavaksi/SeuraavaksiRivi";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import { jaaPeliTeksti, tulosjakoteksti } from "@/lib/korttinimi";
import { kirjaaKierrosValmis, kirjaaVastaus, plausible, type Pelitapa } from "@/lib/kumpi/kirjaus";
import { kirjaaPutki, luePaivanTulos, lyhytPvm, tallennaPaivanTulos } from "@/lib/kumpi/tallennus";
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

/** Kortti on jaettu Tänään-lehden Kumpi?-pähkinälle (Heikki 24.11.2026). */
export function Kortti({ q, ix, valinta, auki, onValitse, kuvat }: {
  q: KumpiKysymys;
  ix: 0 | 1;
  valinta: 0 | 1 | null;
  auki: boolean;
  onValitse: (ix: 0 | 1 | null) => void;
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

/** Putken asetukset (vaihe 2): siemen jatkoerien hakuun ja kysymysten teemojen nimet pelipalkkiin. */
export type PutkiAsetus = { siemen: string; teemaNimet: Record<string, string> };

/** Putken kello: 10 s per kysymys, 7 s kysymyksestä 21 alkaen (Heikki 17.11.2026). Viimeiset 3 s oranssina. */
export const putkenKesto = (i: number) => (i >= 20 ? 7000 : 10000);
const KELLO_VAROITUS_MS = 3000;
const PUTKI_HAE_KUN_JALJELLA = 10;

export default function KumpiKierros({
  kysymykset,
  teema,
  siemen,
  polku,
  pelitapa = "kierros",
  pvm,
  putki,
  seuraavat,
}: {
  kysymykset: KumpiKysymys[];
  teema: { slug: string; nimi: string };
  siemen: string;
  /** Pelin polku ("/kumpi/liiga", "/kumpi/paivan", "/kumpi/putki"): uusi kierros ja jaettava osoite. */
  polku: string;
  pelitapa?: Pelitapa;
  /** Päivän Kumpi?: Helsingin päivä ("2026-11-22"); tulos tallennetaan ja näytetään saman päivän uusilla käynneillä. */
  pvm?: string;
  putki?: PutkiAsetus;
  seuraavat: SkPaikka[];
}) {
  const onPutki = pelitapa === "putki" && !!putki;
  const [lista, setLista] = useState(kysymykset);
  const n = lista.length;
  const [i, setI] = useState(0);
  const [vaihe, setVaihe] = useState<Vaihe>("kysymys");
  const [valinnat, setValinnat] = useState<Array<0 | 1 | null>>([]);
  const [ilmoitus, setIlmoitus] = useState("");
  /** Päivän Kumpi?: aiemmin tänään pelattu tulos (luetaan selaimessa ennen kuin peli näytetään). */
  const [paivanTulos, setPaivanTulos] = useState<boolean[] | null>(null);
  const [tarkistettu, setTarkistettu] = useState(pelitapa !== "paivan");
  const [putkenLoppu, setPutkenLoppu] = useState<{ n: number; edellinen: number } | null>(null);
  const [jaljella, setJaljella] = useState<number | null>(null);
  const [aikaLoppui, setAikaLoppui] = useState(false);
  const ajastin = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kello = useRef<{ loppu: ReturnType<typeof setTimeout> | null; tikki: ReturnType<typeof setInterval> | null }>({ loppu: null, tikki: null });
  const haetaan = useRef(false);
  const palkkiRef = useRef<HTMLElement>(null);
  const alku = useRef(0);
  const juuri = useRef<HTMLDivElement>(null);
  const kysRef = useRef<HTMLParagraphElement>(null);
  const kortitRef = useRef<HTMLDivElement>(null);
  // Sisääntuloanimaatio käynnistetään vasta ensimmäisessä ruudunpäivityksessä: taustavälilehdessä (ei rAF:ia) kysymys
  // näkyy suoraan eikä jää animaation alkutilaan himmeäksi (testipalaute 20.11.2026, kohta 8).
  const sisaanRef = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    requestAnimationFrame(() => el.classList.add("kp-sisaan"));
  }, []);
  const fokusKorteissa = useRef(false);
  /** Paljastuksen hetki: sitä seuraava 400 ms:n napautus ei ohita (tuplanapautus, testipalaute 20.11.2026). */
  const avattu = useRef(0);

  const q = lista[Math.min(i, n - 1)];
  const valinta = valinnat[i] ?? null;
  const auki = vaihe === "auki" || vaihe === "ulos";
  const kuvat = !!q.vaihtoehdot[0].kuva && !!q.vaihtoehdot[1].kuva;
  /** Putkessa oikeita vastauksia peräkkäin (putki katkeaa ensimmäiseen virheeseen, joten = oikeiden määrä). */
  const putkessa = valinnat.filter((v, j) => v !== null && v === lista[j]?.oikea).length;

  // Päivän Kumpi?: jos tämä päivä on jo pelattu, näytetään tulos suoraan (ei uutta yritystä samana päivänä).
  useLayoutEffect(() => {
    if (pelitapa !== "paivan" || !pvm) return;
    const t = luePaivanTulos(pvm);
    if (t) {
      setPaivanTulos(t.osumat);
      setVaihe("tulos");
    }
    setTarkistettu(true);
  }, [pelitapa, pvm]);

  useEffect(() => {
    if (!tarkistettu || paivanTulos) return;
    plausible("kumpi_start", { pelitapa, teema: teema.slug });
  }, [tarkistettu, paivanTulos, pelitapa, teema.slug]);

  const pysaytaKello = useCallback(() => {
    if (kello.current.loppu) clearTimeout(kello.current.loppu);
    if (kello.current.tikki) clearInterval(kello.current.tikki);
    kello.current = { loppu: null, tikki: null };
  }, []);

  useEffect(() => () => {
    if (ajastin.current) clearTimeout(ajastin.current);
    pysaytaKello();
  }, [pysaytaKello]);

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
  }, [i, vaihe, sovitaKaikki, tarkistettu]);

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

  // Putki: jatkoerä, kun jäljellä on alle kymmenen kysymystä (sama siemen → sama jono palvelimella).
  useEffect(() => {
    if (!onPutki || haetaan.current || n - i > PUTKI_HAE_KUN_JALJELLA) return;
    haetaan.current = true;
    fetch(`/api/kumpi/putki?sarja=${encodeURIComponent(putki!.siemen)}&alku=${n}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { kysymykset?: KumpiKysymys[] } | null) => {
        const uudet = j?.kysymykset ?? [];
        if (uudet.length) setLista((l) => (l.length === n ? [...l, ...uudet] : l));
        haetaan.current = !uudet.length; // tyhjä erä: jono loppui, ei haeta uudelleen
      })
      .catch(() => { haetaan.current = false; });
  }, [onPutki, putki, i, n]);

  const lopeta = useCallback((viimeiset: Array<0 | 1 | null>) => {
    pysaytaKello();
    setVaihe("tulos");
    const osumat = lista.slice(0, viimeiset.length).map((x, j) => viimeiset[j] === x.oikea);
    const oikein = osumat.filter(Boolean).length;
    if (onPutki) {
      setPutkenLoppu({ n: oikein, edellinen: kirjaaPutki(oikein) });
    } else if (pelitapa === "paivan" && pvm) {
      tallennaPaivanTulos({ pvm, osumat });
    }
    plausible("kumpi_finish", { pelitapa, teema: teema.slug, tulos: oikein });
    kirjaaKierrosValmis();
    window.scrollTo({ top: 0 });
  }, [lista, onPutki, pelitapa, pvm, teema.slug, pysaytaKello]);

  const seuraava = useCallback(() => {
    if (ajastin.current) clearTimeout(ajastin.current);
    fokusKorteissa.current = !!kortitRef.current?.contains(document.activeElement);
    setVaihe("ulos");
    const katkesi = onPutki && valinnat[i] !== lista[i]?.oikea;
    ajastin.current = setTimeout(() => {
      if (katkesi || i + 1 >= n) {
        lopeta(valinnat);
      } else {
        setI(i + 1);
        setVaihe("kysymys");
        setIlmoitus("");
        setAikaLoppui(false);
      }
    }, vahennettyLiike() ? 0 : POISTUMINEN_MS);
  }, [i, n, lista, valinnat, onPutki, lopeta]);

  // Ajastin kutsuu aina tuoreinta seuraava-funktiota (valinnat päivittyvät samassa renderöinnissä).
  const seuraavaRef = useRef(seuraava);
  useEffect(() => { seuraavaRef.current = seuraava; }, [seuraava]);

  const valitse = (ix: 0 | 1 | null) => {
    if (vaihe !== "kysymys") return;
    pysaytaKello();
    const uudet = [...valinnat];
    uudet[i] = ix;
    setValinnat(uudet);
    setVaihe("auki");
    avattu.current = performance.now();
    const osui = ix === q.oikea;
    const tilanne = ix === null ? "Aika loppui." : osui ? "Oikein." : "Väärin.";
    const putkiLause = onPutki ? (osui ? ` Putki ${putkessa + 1}.` : " Putki katkesi.") : "";
    setIlmoitus(`${tilanne} ${q.fakta}${putkiLause}`);
    kirjaaVastaus(q, pelitapa, ix, performance.now() - alku.current, i + 1);
    if (ajastin.current) clearTimeout(ajastin.current);
    ajastin.current = setTimeout(() => seuraavaRef.current(), ETENEMINEN_MS);
  };
  const valitseRef = useRef(valitse);
  valitseRef.current = valitse;

  // Putken kello: käynnistyy, kun kysymys on tullut sisään (240 ms), ja aikakatkaisu on virhe.
  useEffect(() => {
    if (!onPutki || vaihe !== "kysymys" || !tarkistettu) return;
    const kesto = putkenKesto(i);
    const viive = vahennettyLiike() ? 0 : 240;
    const alkuHetki = performance.now() + viive;
    setJaljella(kesto);
    kello.current.tikki = setInterval(() => {
      const kulunut = Math.max(0, performance.now() - alkuHetki);
      setJaljella(Math.max(0, kesto - kulunut));
      // Palkki kellon tahtiin: taustavälilehdessä selain pysäyttää CSS-animaation, mutta kello käy (aikakatkaisu).
      const anim = palkkiRef.current?.getAnimations?.()[0];
      if (anim) anim.currentTime = kulunut + viive;
    }, 200);
    kello.current.loppu = setTimeout(() => {
      setJaljella(0);
      setAikaLoppui(true);
      valitseRef.current(null);
    }, kesto + viive);
    return pysaytaKello;
  }, [onPutki, vaihe, i, tarkistettu, pysaytaKello]);

  const nuolet = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    const kortit = Array.from(kortitRef.current?.querySelectorAll<HTMLElement>(".kp-kortti") ?? []);
    const nyt = kortit.indexOf(document.activeElement as HTMLElement);
    const seur = e.key === "ArrowLeft" || e.key === "ArrowUp" ? 0 : 1;
    if (nyt !== seur) { kortit[seur]?.focus(); e.preventDefault(); }
  };

  if (vaihe === "tulos") {
    if (onPutki) {
      return <PutkiTulos tulos={putkenLoppu ?? { n: putkessa, edellinen: 0 }} seuraavat={seuraavat} />;
    }
    const osumat = paivanTulos ?? lista.map((x, j) => valinnat[j] === x.oikea);
    return <Tulos osumat={osumat} teema={teema} siemen={siemen} polku={polku} pelitapa={pelitapa} pvm={pvm} seuraavat={seuraavat} />;
  }

  const palkinTeema = onPutki ? putki!.teemaNimet[q.teema] ?? teema.nimi : teema.nimi;
  const juuriLuokka = ["kp-peli", kuvat ? "kuvat" : "ilman", auki ? "auki" : "", vaihe === "ulos" ? "ulos" : "", onPutki ? "putki" : "", tarkistettu ? "" : "kp-odottaa"]
    .filter(Boolean).join(" ");
  const sekunnit = jaljella === null ? null : Math.ceil(jaljella / 1000);
  return (
    <div
      ref={juuri}
      className={juuriLuokka}
      onClick={() => { if (vaihe === "auki" && performance.now() - avattu.current > 400) seuraava(); }}
      onKeyDown={(e) => { if (vaihe === "auki" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); seuraava(); } }}
    >
      {onPutki ? (
        <Palkki teema={palkinTeema} tila={String(putkessa)} tilaSana="Putki" />
      ) : (
        <Palkki teema={teema.nimi} tila={`${i + 1}/${n}`} />
      )}
      {onPutki ? (
        <div
          className={`kp-kello${!auki && jaljella !== null && jaljella <= KELLO_VAROITUS_MS ? " loppu" : ""}${auki ? " seis" : ""}`}
          role="timer"
          aria-label={aikaLoppui ? "Aika loppui" : `Aikaa ${sekunnit ?? ""} sekuntia`}
        >
          <span className="kp-kello-palkki" aria-hidden="true">
            <i key={i} ref={palkkiRef} style={{ animationDuration: `${putkenKesto(i)}ms` }} />
          </span>
          <b aria-hidden="true">{aikaLoppui ? "Aika loppui" : sekunnit}</b>
        </div>
      ) : null}
      <h1 className="kp-sr">{pelitapa === "paivan" ? "Päivän Kumpi?" : onPutki ? "Kumpi? – Putki" : `Kumpi? – ${teema.nimi}`}</h1>
      <main id="main" className="kp-paa" key={i} ref={sisaanRef}>
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
          <button type="button" className="kp-etene" aria-label={onPutki && valinta !== q.oikea ? "Katso tulos" : "Seuraava kysymys"} tabIndex={auki ? 0 : -1} aria-hidden={!auki}>
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

function Palkki({ teema, tila, tilaSana = "Kysymys" }: { teema: string; tila?: string; tilaSana?: string }) {
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
        <span className="kp-palkki-tila" role="status" aria-label={`${tilaSana} ${tila}`}>
          <span className="kp-palkki-sana" aria-hidden="true">{tilaSana} </span>
          <span aria-hidden="true">{tila}</span>
        </span>
      ) : null}
    </header>
  );
}

/* ─── Tulos: Kierros ja Päivän Kumpi? ─────────────────────────────── */

function Tulos({ osumat, teema, siemen, polku, pelitapa, pvm, seuraavat }: {
  osumat: boolean[];
  teema: { slug: string; nimi: string };
  siemen: string;
  polku: string;
  pelitapa: Pelitapa;
  pvm?: string;
  seuraavat: SkPaikka[];
}) {
  const n = osumat.length;
  const oikein = osumat.filter(Boolean).length;
  const paivan = pelitapa === "paivan";
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => setOrigin(location.origin), []);
  const nimi = paivan ? "Päivän Kumpi?" : `Kumpi? ${teema.nimi}`;
  const kortinNimi = paivan && pvm ? `Päivän peli ${lyhytPvm(pvm)}` : teema.nimi;
  const url = origin ? (paivan ? `${origin}${polku}?oikein=${oikein}` : `${origin}${polku}?sarja=${encodeURIComponent(siemen)}&oikein=${oikein}`) : null;
  return (
    /* PeliKehys: pelikehyksen tyylit ja tumma iho "Pelaa seuraavaksi" -korteille (sama kuin muiden pelien tuloksissa). */
    <PeliKehys iho="tumma" className="kp-peli kp-peli--tulos">
      <Palkki teema={paivan ? "Päivän peli" : teema.nimi} />
      <main id="main" className="kp-tulos">
        {/* Tulos näkyy kerran, tuloskortissa (Heikki 22.11.2026: iso luku ja kortti toistivat samaa). Otsikko ruudunlukijalle. */}
        <h1 className="kp-sr">{paivan ? "Päivän Kumpi?: " : ""}{oikein}/{n} oikein</h1>
        <div className="kp-tuloskortti" aria-hidden="true">
          <div className="kp-tuloskortti-yla">
            <KumpiLogo className="kp-logo--kortti" />
            <span>{kortinNimi}</span>
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
          onJaettu={(k) => plausible("kumpi_share", { kanava: k, teema: teema.slug, pelitapa })}
        />
        <nav className="kp-tulos-linkit" aria-label="Kumpi?">
          {/* Päivän Kumpi?:a ei voi pelata uudelleen, joten ensisijaista (lime) nappia ei ole: kaksi kevyttä nappia (Heikki 22.11.). */}
          {paivan ? (
            <>
              <a className="kp-nappi" href="/kumpi">Valitse aihe</a>
              <a className="kp-nappi" href="/kumpi/putki">Kokeile Putkea</a>
            </>
          ) : (
            <>
              <a className="tn-cta-lime kp-cta" href="/kumpi">Valitse aihe</a>
              <a className="kp-nappi" href={polku}>Uusi kierros: {teema.nimi}</a>
            </>
          )}
        </nav>
        {/* Sama "Pelaa seuraavaksi" -rivi kuin tietovisan tuloksessa (Heikki 20.11.2026). */}
        <SeuraavaksiRivi otsikko="Pelaa seuraavaksi" paikat={seuraavat} meta={{ pilotti: null, nakyma: "tulos", lahde: `kumpi-${paivan ? "paivan" : teema.slug}` }} id="kp-sk" />
      </main>
    </PeliKehys>
  );
}

/* ─── Tulos: Putki ────────────────────────────────────────────────── */

function PutkiTulos({ tulos, seuraavat }: { tulos: { n: number; edellinen: number }; seuraavat: SkPaikka[] }) {
  const { n, edellinen } = tulos;
  const uusi = n > edellinen && n > 0;
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => setOrigin(location.origin), []);
  const nimi = "Kumpi? Putki";
  const url = origin ? `${origin}/kumpi/putki?oikein=${n}` : null;
  return (
    <PeliKehys iho="tumma" className="kp-peli kp-peli--tulos">
      <Palkki teema="Putki" />
      <main id="main" className="kp-tulos">
        <h1 className="kp-sr">{n} oikein putkeen</h1>
        {/* Tulos kerran, tuloskortissa (Heikki 22.11.2026). Ennätysmerkki ja edellinen ennätys kortin alla. */}
        <div className="kp-tuloskortti" aria-hidden="true">
          <div className="kp-tuloskortti-yla">
            <KumpiLogo className="kp-logo--kortti" />
            <span>Putki</span>
          </div>
          <b className="kp-tuloskortti-luku">{n}</b>
          <span className="kp-tuloskortti-ala">oikein putkeen</span>
        </div>
        {uusi || edellinen > 0 ? (
          <div className="kp-putki-tulos">
            {uusi ? (
              <>
                <p className="kp-ennatys"><span aria-hidden="true">★</span>Uusi ennätys</p>
                {edellinen > 0 ? <p className="kp-ennatys-ed">Edellinen ennätys {edellinen}</p> : null}
              </>
            ) : (
              <p className="kp-ennatys-ed">Ennätyksesi {edellinen}</p>
            )}
          </div>
        ) : null}
        <Jakoalue
          className="kp-jako"
          id="kp-jako-h"
          otsikko="Haasta kaveri"
          waNappi="Jaa WhatsAppissa"
          teksti={n > 0 ? tulosjakoteksti(nimi, `sain ${n} oikein putkeen`) : jaaPeliTeksti(nimi)}
          url={url}
          natiiviOtsikko={nimi}
          onJaettu={(k) => plausible("kumpi_share", { kanava: k, teema: "putki", pelitapa: "putki" })}
        />
        <nav className="kp-tulos-linkit" aria-label="Kumpi?">
          <a className="tn-cta-lime kp-cta" href="/kumpi/putki">Yritä uudelleen</a>
          <a className="kp-nappi" href="/kumpi/paivan">Päivän Kumpi?</a>
          <a className="kp-nappi" href="/kumpi">Valitse aihe</a>
        </nav>
        <SeuraavaksiRivi otsikko="Pelaa seuraavaksi" paikat={seuraavat} meta={{ pilotti: null, nakyma: "tulos", lahde: "kumpi-putki" }} id="kp-sk" />
      </main>
    </PeliKehys>
  );
}
