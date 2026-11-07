"use client";
// REITTIPELIT — Kuntaliitos (kunnat, vaakunat), Rajanaapurit (valtiot, liput) ja sen variantti Rajanaapurit:
// Yhdysvallat (osavaltiot, liput; CD-handoff 1.11.2026). Sama näkymä kaikille; pelikohtaiset tekstit, tunnus ja
// osoite tulevat PELIT-asetuksista. Kartta kaikissa vaalea (malli 6c, Heikki 1.11.2026).
//
// UX-uudistus (CD "Rajanaapurit mobiili ja desktop UX", Heikin päätökset 2.11.2026):
//   - Kartta ja lista näkyvät yhtä aikaa: mobiilissa kartta kiinni ylhäällä, desktopilla kaksi palstaa.
//   - Ensimmäinen tarkistus ja kaksi uutta yritystä, vinkkinä vain väärien rajojen määrä (Korjattavaa). Palat pysyvät siirrettävinä;
//     Yritä uudelleen tarkistaa uuden järjestyksen, eikä samaa järjestystä voi tarkistaa kahdesti. Laskuri näkyy vasta ensimmäisen
//     virheen jälkeen napin vieressä (Heikki testasi 2.11.2026: palkissa sitä ei huomannut, ja "3 yritystä" alussa näytti neljältä).
//   - Kartta piirtää reitin vasta lopussa (onnistui, yritykset loppuivat tai paljastus).
//   - Tulos ilman tasonimeä: mallin näkymä ylimpänä, sen alla sama jakoalue kuin muissa peleissä ja Pelaa seuraavaksi.
//   - Oikea reitti on aina yksikäsitteinen (arvonta takaa tasan yhden ratkaisun).
//
// Raahaus kuten Ikäjärjestyksessä (LIVE-QA 16.9.): kortin päältä lyhyt pyyhkäisy vierittää
// sivua, kosketuksella raahaus alkaa pitkästä painalluksesta, kahvasta heti. Napautus valitsee
// kortin ja toinen napautus vaihtaa paikat. Näppäimistö: välilyönti valitsee, nuolet siirtävät.

import { lisaaPelirivi } from "@/lib/seuranta";
import { jarjestysluvulla, tulosjakoteksti } from "@/lib/korttinimi";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type KeyboardEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { KL_SIVU, KL_YHTEYKSIA, KL_YRITYKSET, pariAvain, reittiPisteet, uusiReittiSiemen, type KlKartta, type KlKunta, type KlReitti } from "@/lib/kuntaliitos";
import { RN_SIVU, RN_USA_SIVU } from "@/lib/rajanaapurit";
import AlueValinta from "./AlueValinta";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import { SeuraavaPeli } from "@/components/tn20/pelikehys/PeliTulos";
import Jakoalue from "@/components/tn20/jako/Jakoalue";
import { runkoCond } from "@/components/tn20/runko/runkoFontti";
import { KARTTAPELIT_SIVU } from "@/lib/karttapelit";
import type { Pelimuoto } from "@/lib/pelimuodot";
import { viikonReitti, viikonSiemen } from "@/lib/reittipeli/viikonReitit";

export type ReittipeliNimi = "kuntaliitos" | "rajanaapurit" | "osavaltiot";
type Peli = {
  nimi: string; sivu: string; param: string; kaikki: string;
  tunnus: "kilpi" | "lippu"; taulu: string; kentta: string;
  /** Pelitaulun datapaketti (rajanaapurit_pelit.aihe): puuttuu = sarakkeen oletus. */
  aihe?: string;
  /** Juuren luokat: Yhdysvallat käyttää Rajanaapurien ilmettä. */
  luokka: string;
  alueet: string; alueiden: string; ketju: string;
  /** Pitkät monisanaiset nimet (Kongon demokraattinen tasavalta) saavat rivittyä sanojen välistä. */
  rivitys: boolean;
  /** Näin pelaat: päät ja järjestäminen pelin sanoilla. */
  info: [string, string, string];
  /** Maakunta kortissa vihjeenä (Kuntaliitos); maanosa olisi Rajanaapureissa turha (Heikki 2.11.2026). */
  vihje: boolean;
  /** Aluevalinta herossa: valikko (18 maakuntaa), pillerit (5 maanosaa) tai ei valintaa (Yhdysvallat). */
  valitsin: "valikko" | "segmentit" | "ei";
  /** Hero (CD "Reittipelit intro v0.2", kierros 3): otsikon loppu ja aluevalinnan nappi. */
  pitkin: string; valitse: string;
};
const PELIT: Record<ReittipeliNimi, Peli> = {
  kuntaliitos: {
    nimi: "Kuntaliitos", sivu: KL_SIVU, param: "maakunta", kaikki: "Koko Suomi",
    tunnus: "kilpi", taulu: "kuntaliitos_pelit", kentta: "kunnat",
    alueet: "kunnat", alueiden: "kunnista", ketju: "Kuntaketju",
    rivitys: false, vihje: true, valitsin: "valikko", luokka: "kl--kuntaliitos",
    info: ["Lähtö- ja maalikunta pysyvät paikallaan.", "Järjestä välikunnat.", "Raahaa tai napauta kahta kuntaa vaihtaaksesi niiden paikat. Vierekkäisillä kunnilla pitää olla yhteinen raja."],
    pitkin: "kuntarajoja pitkin", valitse: "Valitse maakunta",
  },
  rajanaapurit: {
    nimi: "Rajanaapurit", sivu: RN_SIVU, param: "maanosa", kaikki: "Koko maailma",
    tunnus: "lippu", taulu: "rajanaapurit_pelit", kentta: "maat",
    alueet: "valtiot", alueiden: "valtioista", ketju: "Valtioketju",
    rivitys: true, vihje: false, valitsin: "segmentit", luokka: "kl--rajanaapurit",
    info: ["Lähtö- ja maalimaa pysyvät paikallaan.", "Järjestä välimaat.", "Raahaa tai napauta kahta maata vaihtaaksesi niiden paikat. Vierekkäisillä mailla pitää olla yhteinen maaraja."],
    pitkin: "rajoja pitkin", valitse: "Valitse maanosa",
  },
  osavaltiot: {
    nimi: "Rajanaapurit: Yhdysvallat", sivu: RN_USA_SIVU, param: "alue", kaikki: "Yhdysvallat",
    tunnus: "lippu", taulu: "rajanaapurit_pelit", kentta: "maat", aihe: "osavaltiot",
    alueet: "osavaltiot", alueiden: "osavaltioista", ketju: "Osavaltioketju",
    rivitys: true, vihje: false, valitsin: "ei", luokka: "kl--rajanaapurit kl--osavaltiot",
    info: ["Lähtö- ja maaliosavaltio pysyvät paikallaan.", "Järjestä väliosavaltiot.", "Raahaa tai napauta kahta osavaltiota vaihtaaksesi niiden paikat. Vierekkäisillä osavaltioilla pitää olla yhteinen maaraja."],
    pitkin: "rajoja pitkin", valitse: "",
  },
};

/** Paluu Karttapelit-sivulle (Heikki 1.11.2026: karttapelit yhdistetty). */
const KOTI = { href: KARTTAPELIT_SIVU, nimi: "Karttapelit" };

type Vaihe = "intro" | "peli" | "tarkistus" | "tulos";
type Lopetus = "onnistui" | "loppui" | "paljastus";

const LIIKE_PX = 6;
const PITKA_PAINALLUS_MS = 180;

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

/** Tarkistus tilastoihin (kuntaliitos_pelit / rajanaapurit_pelit). Best-effort: epäonnistuminen ei näy pelaajalle. */
async function tallenna(peli: Peli, r: { siemen: string; ryhma: string | null; paivanReitti: boolean; yritys: number; oikein: number; alueet: string[] }) {
  try {
    const sb = getSupabase();
    if (!sb) return;
    await lisaaPelirivi(sb, peli.taulu, {
      siemen: r.siemen, ...(peli.aihe ? { aihe: peli.aihe } : { [peli.param]: r.ryhma }), paivan_reitti: r.paivanReitti, yritys: r.yritys, oikein: r.oikein,
      [peli.kentta]: r.alueet, session_id: istunto(),
    });
  } catch {
    // tilasto jää saamatta — peli jatkuu normaalisti
  }
}

function estaVieritys(e: TouchEvent) {
  if (e.cancelable) e.preventDefault();
}

// ── Ikonit ────────────────────────────────────────────────
const IKONI = {
  bad: "M6 6l12 12M18 6 6 18",
  kahva: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  varoitus: "M12 8v5m0 3.2v.2M12 3.6 2.6 20h18.8L12 3.6Z",
};
function Ikoni({ d, w = 2.6 }: { d: string; w?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Tunnus: Kuntaliitoksessa kilpikehys (leveys × 1,2), vaakuna contain-periaatteella;
    Rajanaapureissa lippu 4:3-kehyksessä (väliaikainen, kunnes CD:n lippulaatta valmistuu).
    Puuttuvan kuvan tilalla alkukirjain. Kuva on koriste (nimi on vieressä) → alt="". */
function Kilpi({ kunta, className, reuna, muoto = "kilpi" }: { kunta: KlKunta; className?: string; reuna?: string; muoto?: "kilpi" | "lippu" }) {
  const [virhe, setVirhe] = useState(false);
  if (muoto === "lippu") {
    // Rajanaapurit (CD v0.2 3a/3b): kiinteä 4:3-kehys, object-fit cover, hiusviivareuna kaikissa lipuissa
    return (
      <span className={`kl-lippu ${className ?? ""}`} style={reuna ? ({ "--kl-reuna": reuna } as CSSProperties) : undefined}>
        {kunta.v && !virhe ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kunta.v} alt="" onError={() => setVirhe(true)} />
        ) : (
          <span className="kl-kilpi-kirjain" aria-hidden="true">{kunta.n.charAt(0)}</span>
        )}
      </span>
    );
  }
  return (
    <span className={`kl-kilpi ${className ?? ""}`} style={reuna ? ({ "--kl-reuna": reuna } as CSSProperties) : undefined}>
      <span className="kl-kilpi-pohja">
        {kunta.v && !virhe ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kunta.v} alt="" onError={() => setVirhe(true)} />
        ) : (
          <span className="kl-kilpi-kirjain" aria-hidden="true">{kunta.n.charAt(0)}</span>
        )}
      </span>
    </span>
  );
}

// ── Kartta (CD-handoff 1.11.2026, malli 6c; kaikki reittipelit) ───────────────
// Vaalea kartta näkyy kunnolla: valkoinen meri, alueet harmaansinisinä, reitin alueet vaalealla tealilla ja päätepisteet
// tummalla. Reittiviiva navy Catmull-Rom-käyränä alueiden keskipisteiden kautta. Pelin aikana kartalla on vain lähtö ja maali.
/** Merkki kartalla: piste (päätepisteet) ja lappu. tunnus = lappuun lippu tai vaakuna. */
type Merkki = { kunta: KlKunta; teksti: string; tunnus: boolean };

/** Catmull-Rom-käyrän osa b → c kuutiollisena Bézierinä (a ja d naapurit) kartan 0–100-koordinaateissa. */
function kayra(b: KlKunta, c: KlKunta, a: KlKunta = b, d: KlKunta = c) {
  const r = (n: number) => Math.round(n * 100) / 100;
  return `M${r(b.x)} ${r(b.y)}C${r(b.x + (c.x - a.x) / 6)} ${r(b.y + (c.y - a.y) / 6)} ${r(c.x - (d.x - b.x) / 6)} ${r(c.y - (d.y - b.y) / 6)} ${r(c.x)} ${r(c.y)}`;
}

/** Maa-alueet karkeana ruudukkona: kertoo nimilapuille, missä on merta (Heikki 1.11.2026: lappu ei saa peittää
    osavaltioita, joita pelaaja yrittää hahmottaa). Ilman canvasia null → lapuille jää suuntajärjestys. */
function maaRuudukko(k: KlKartta, nakyma: number[], w: number, h: number) {
  try {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g) return null;
    const [vx, vy, vw, vh] = nakyma;
    g.scale(w / vw, h / vh);
    g.translate(-vx, -vy);
    for (const a of k.alueet) g.fill(new Path2D(a.d));
    return g.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }
}

type Laatta = { x: number; y: number; w: number; h: number };
const leikkaa = (a: Laatta, b: Laatta) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Merkit: piste + lappu. Lappu sijoitetaan pisteen viereen sinne, missä se peittää vähiten maata ja reitin pisteitä (meri
    kelpaa aina). Sama mitoitus pelin ja heron kartoissa. Merkit ovat kerroksessa, jonka mitat vastaavat näkymää (nakyma);
    pelilaudalla kerroksen ympärillä näkyy lisää karttaa, ja lappu saa mennä sinnekin. nakyvia = montako lappua näytetään
    järjestyksessä (reitin piirtyessä; päätepisteet aina), paikat lasketaan kaikille kerralla, jotta laput eivät hypi. */
function Merkit({ kartta, nakyma, pisteet, muoto, merkit, nakyvia }: {
  kartta: KlKartta; nakyma: string; pisteet: KlKunta[]; muoto: "kilpi" | "lippu"; merkit: Merkki[]; nakyvia?: number;
}) {
  const juuri = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = juuri.current, kerros = el?.parentElement, alue = el?.closest<HTMLElement>(".kl-kartta-alue") ?? kerros;
    if (!el || !kerros || !alue) return;
    const RW = 120;
    const [vx, vy, vw, vh] = nakyma.split(" ").map(Number);
    let koko = "", ruudukko: Uint8ClampedArray | null = null;
    const sijoita = () => {
      const KW = alue.clientWidth, KH = alue.clientHeight, W = kerros.clientWidth, H = kerros.clientHeight;
      if (!KW || !KH || !W || !H) return; // piilotettu kartta: lasketaan, kun se tulee näkyviin
      const ox = (KW - W) / 2, oy = (KH - H) / 2;
      const RH = Math.max(1, Math.round((RW * KH) / KW));
      if (koko !== `${KW}x${KH}`) {
        koko = `${KW}x${KH}`;
        ruudukko = maaRuudukko(kartta, [vx - (ox / W) * vw, vy - (oy / H) * vh, (vw * KW) / W, (vh * KH) / H], RW, RH);
      }
      const maata = (r: Laatta) => {
        if (!ruudukko) return 0;
        const x0 = Math.max(0, Math.floor((r.x / KW) * RW)), x1 = Math.min(RW - 1, Math.ceil(((r.x + r.w) / KW) * RW));
        const y0 = Math.max(0, Math.floor((r.y / KH) * RH)), y1 = Math.min(RH - 1, Math.ceil(((r.y + r.h) / KH) * RH));
        let n = 0, m = 0;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { n++; if (ruudukko[(y * RW + x) * 4 + 3] > 0) m++; }
        return n ? m / n : 0;
      };
      const kohta = (k: KlKunta) => ({ x: ox + (k.x / 100) * W, y: oy + (k.y / 100) * H });
      const reitti = pisteet.map(kohta);
      const varatut: Laatta[] = [];
      // Päätepisteet ensin, sitten lyhyimmät nimet: lappu, jolle ei jää tilaa, jää pois (nimi näkyy ketjussa kartan alla).
      const laput = [...el.querySelectorAll<HTMLElement>(".kl-merkki-lappu")];
      const jarjestys = laput.map((_, i) => i).sort((p, q) => Number(merkit[q].tunnus) - Number(merkit[p].tunnus) || laput[p].offsetWidth * laput[p].offsetHeight - laput[q].offsetWidth * laput[q].offsetHeight);
      for (const i of jarjestys) {
        const l = laput[i];
        const { x: X, y: Y } = kohta(merkit[i].kunta);
        const w = l.offsetWidth, h = l.offsetHeight, d = merkit[i].tunnus ? 14 : 9, kauas = 12;
        const ehdokkaat = [
          { x: X - w / 2, y: Y - d - h }, { x: X - w / 2, y: Y + d },
          { x: X - d - w, y: Y - h / 2 }, { x: X + d, y: Y - h / 2 },
          { x: X - w + d, y: Y - d - h }, { x: X - d, y: Y - d - h },
          { x: X - w + d, y: Y + d }, { x: X - d, y: Y + d },
          { x: X - w / 2, y: Y - d - kauas - h }, { x: X - w / 2, y: Y + d + kauas },
          { x: X - d - kauas - w, y: Y - h / 2 }, { x: X + d + kauas, y: Y - h / 2 },
        ];
        let paras: Laatta | null = null, pienin = Infinity;
        ehdokkaat.forEach((e, j) => {
          const r = { x: Math.min(Math.max(e.x, 4), Math.max(4, KW - w - 4)), y: Math.min(Math.max(e.y, 4), Math.max(4, KH - h - 4)), w, h };
          const reitilla = reitti.filter((p) => p.x > r.x - 6 && p.x < r.x + r.w + 6 && p.y > r.y - 6 && p.y < r.y + r.h + 6).length;
          const pisteen = X > r.x - 9 && X < r.x + r.w + 9 && Y > r.y - 9 && Y < r.y + r.h + 9;
          const hinta = maata(r) + reitilla * 0.5 + (pisteen ? 3 : 0) + (varatut.some((v) => leikkaa(v, r)) ? 5 : 0) + j * 0.002 + (j >= 8 ? 0.2 : 0);
          if (hinta < pienin) { pienin = hinta; paras = r; }
        });
        const r = paras as Laatta | null;
        if (!r) continue;
        l.style.left = `${Math.round(r.x - ox)}px`;
        l.style.top = `${Math.round(r.y - oy)}px`;
        l.style.transform = "none";
        const eiTilaa = !merkit[i].tunnus && varatut.some((v) => leikkaa(v, r));
        l.style.visibility = eiTilaa ? "hidden" : "";
        if (!eiTilaa) varatut.push(r);
      }
    };
    sijoita();
    const ro = new ResizeObserver(sijoita);
    ro.observe(alue);
    return () => ro.disconnect();
  }, [kartta, nakyma, pisteet, merkit]);
  return (
    <div className="kl-merkit" ref={juuri}>
      {merkit.filter((m) => m.tunnus).map(({ kunta }) => <span key={kunta.k} className="kl-merkki-piste" style={{ left: `${kunta.x}%`, top: `${kunta.y}%` }} />)}
      {merkit.map(({ kunta, teksti, tunnus }, i) => (
        <span key={kunta.k} className="kl-merkki-lappu" data-piilossa={(nakyvia != null && i >= nakyvia && !tunnus) || undefined} style={{ left: `${kunta.x}%`, top: `${kunta.y}%` }}>
          {tunnus && <Kilpi kunta={kunta} muoto={muoto} />}
          <span className="kl-merkki-nimi">{teksti}</span>
        </span>
      ))}
    </div>
  );
}

/** Pelin kartta. piirretty = montako rajaa oikeasta reitistä on piirretty; nimet = reitin alueiden nimet kartalla (tulos).
    Rajaus on kuvasuhteeton (kartta.tiivis): SVG sovittaa sen alueeseen ja näyttää ympäriltä lisää karttaa; pisteet ja laput
    ovat kerroksessa, joka on täsmälleen rajauksen kokoinen. */
function Kartta({ peli, reitti, piirretty, nimet }: { peli: Peli; reitti: KlReitti; piirretty: number; nimet: boolean }) {
  const { kartta } = reitti;
  const [, , tw, th] = kartta.tiivis.split(" ").map(Number);
  const { pisteet, renkaat } = useMemo(() => {
    const [vx, vy, vw, vh] = kartta.viewBox.split(" ").map(Number);
    const [tx, ty, leveys, korkeus] = kartta.tiivis.split(" ").map(Number);
    const siirra = <T extends { x: number; y: number }>(k: T): T => ({ ...k, x: (((k.x / 100) * vw + vx - tx) / leveys) * 100, y: (((k.y / 100) * vh + vy - ty) / korkeus) * 100 });
    return { pisteet: reitti.ratkaisu.map(siirra), renkaat: kartta.renkaat?.map(siirra) };
  }, [kartta, reitti]);
  const viim = pisteet.length - 1;
  const merkit = useMemo<Merkki[]>(() => pisteet.map((k, i) => (
    { kunta: k, tunnus: i === 0 || i === viim, teksti: nimet ? k.n : i === 0 ? "Lähtö" : "Maali" }
  )).filter((m) => nimet || m.tunnus), [pisteet, viim, nimet]);
  const reitilla = new Set(pisteet.slice(0, piirretty + 1).map((k) => k.k));
  const paat = new Set([pisteet[0]?.k, pisteet[viim]?.k]);
  return (
    <div className="kl-kartta">
      <div className="kl-kartta-alue">
        <svg className="kl-maa" viewBox={kartta.tiivis} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Kartta reitin alueen ${peli.alueiden}`}>
          {kartta.alueet.map((a) => (
            <path key={a.k} d={a.d} className={`kl-alue${a.t ? " kl-alue--tausta" : ""}${a.u ? " kl-alue--ulko" : ""}${paat.has(a.k) ? " kl-alue--paate" : reitilla.has(a.k) && piirretty > 0 ? " kl-alue--reitti" : ""}`} />
          ))}
        </svg>
        <div className="kl-kerros" style={{ "--kl-r": tw / th } as CSSProperties}>
          <svg className="kl-viivat" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {pisteet.slice(1, piirretty + 1).map((k, i) => (
              <path key={k.k} className="kl-viiva" d={kayra(pisteet[i], k, pisteet[i - 1], pisteet[i + 2])} />
            ))}
          </svg>
          {renkaat?.map((r, i) => (
            <span key={`rg${i}`} className={`kl-rengas${r.u ? " kl-rengas--u" : ""}`} style={{ left: `${r.x}%`, top: `${r.y}%` }} aria-hidden="true" />
          ))}
          {pisteet.slice(1, Math.min(piirretty + 1, viim)).map((k) => (
            <span key={k.k} className="kl-piste" style={{ left: `${k.x}%`, top: `${k.y}%` }} />
          ))}
          <Merkit kartta={kartta} nakyma={kartta.tiivis} pisteet={pisteet} muoto={peli.tunnus} merkit={merkit} nakyvia={nimet ? piirretty + 1 : undefined} />
        </div>
      </div>
    </div>
  );
}

/** Reitti lippurivinä (CD 2b/2c): rivittyvä lista, koska 8 nimeä ei mahdu puhelimella yhdelle riville. väärät = ✗ ja punainen,
    ei pelkkä väri. */
function Ketju({ peli, otsikko, huomio, alueet, vaarat, oikein }: {
  peli: Peli; otsikko: string; huomio?: string; alueet: KlKunta[]; vaarat?: Set<string>; oikein?: boolean;
}) {
  return (
    <section className="kl-ketju" data-oikein={oikein || undefined}>
      <h2 className="kl-ketju-h">
        <span>{otsikko}</span>
        {huomio && <span className="kl-ketju-huomio">{huomio}</span>}
      </h2>
      <ol aria-label={otsikko}>
        {alueet.map((k) => {
          const vaara = vaarat?.has(k.k);
          return (
            <li key={k.k} data-vaara={vaara || undefined}>
              <Kilpi kunta={k} className="kl-kilpi--pieni" muoto={peli.tunnus} />
              <span>{k.n}</span>
              {vaara && <span className="kl-ketju-x" role="img" aria-label="väärässä kohdassa"><Ikoni d={IKONI.bad} w={3.4} /></span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ── Peli ──────────────────────────────────────────────────
export default function ReittipeliClient({
  peli: peliNimi,
  reitti,
  siemen,
  paivanReitti,
  reittiNimi,
  otsikko,
  intro,
  maakunnat,
  maakuntaTunnus,
  viikko,
}: {
  peli: ReittipeliNimi;
  reitti: KlReitti | null;
  maakunnat: Array<{ nimi: string; tunnus: string }>;
  maakuntaTunnus: string | null;
  siemen: string;
  paivanReitti: boolean;
  /** "Viikon reitti 2.–8.11." (hero, koko alue) tai "Päivän reitti 1.11." (valittu ryhmä). */
  reittiNimi: string;
  /** Viikon reitin käsin taivutettu otsikko ("Portugalista Viroon"), lib/reittipeli/viikonReitit.ts. */
  otsikko: string | null;
  /** Näytetäänkö hero ennen peliä (viikon reitti ilman parametreja). */
  intro: boolean;
  /** Kuluvan viikon maanantai (YYYY-MM-DD): Seuraava peli -korttien viikon reitit. */
  viikko: string;
}) {
  const peli = PELIT[peliNimi];
  const [jarjestys, setJarjestys] = useState<string[]>(reitti?.alku ?? []);
  /* Palautus 21.10.2026 (Heikki): peli alkaa suoraan laudalta. Poikkeus 1.11.2026 (CD intro v0.2): viikon
     reitillä ilman parametreja ensin hero (otsikko, palat, Aloita); valinnat ja jaetut linkit suoraan laudalle. */
  const [vaihe, setVaihe] = useState<Vaihe>(intro ? "intro" : "peli");
  const [pelattu, setPelattu] = useState(false);
  const [piirretty, setPiirretty] = useState(0);
  const [valittu, setValittu] = useState<string | null>(null);
  const [raahattava, setRaahattava] = useState<string | null>(null);
  const [yritys, setYritys] = useState(0);
  /** Viimeisin tarkistus: palaute, "sama järjestys" -esto ja tuloksen oma reitti. */
  const [tarkistettu, setTarkistettu] = useState<{ jarjestys: string[]; oikein: number } | null>(null);
  const [lopetus, setLopetus] = useState<Lopetus | null>(null);
  const [ilmoitus, setIlmoitus] = useState("");
  const kortit = useRef(new Map<string, HTMLDivElement>());
  const karttaPala = useRef<HTMLDivElement>(null);
  const toiminto = useRef<HTMLDivElement>(null);
  const ajastin = useRef<ReturnType<typeof setInterval> | null>(null);
  const napautusEsto = useRef(false);

  const kunnat = useMemo(() => new Map((reitti?.ratkaisu ?? []).map((k) => [k.k, k])), [reitti]);
  const rajat = useMemo(() => new Set(reitti?.rajat ?? []), [reitti]);
  const ratkaisu = reitti?.ratkaisu ?? [];
  const alkuK = ratkaisu[0]?.k;
  const loppuK = ratkaisu.at(-1)?.k;
  const lukittu = (k: string) => k === alkuK || k === loppuK;

  const oikeita = jarjestys.slice(1).filter((k, i) => rajat.has(pariAvain(jarjestys[i], k))).length;
  const samaJarjestys = tarkistettu?.jarjestys.join() === jarjestys.join();
  /** Yritä uudelleen samalla järjestyksellä: yritys ei kulu, Korjattavaa pyytää siirtämään paloja. */
  const [siirraEnsin, setSiirraEnsin] = useState(false);

  useEffect(() => () => { if (ajastin.current) clearInterval(ajastin.current); }, []);
  const pelattuAvain = `tn_${peliNimi}_viikko`;
  useEffect(() => {
    try { if (intro && localStorage.getItem(pelattuAvain) === siemen) setPelattu(true); } catch {}
  }, [intro, pelattuAvain, siemen]);

  /** Sama sivu valitulla maakunnalla; reitti = tietty reitti, muuten päivän reitti. */
  const osoite = (reittiSiemen?: string, tunnus: string | null = maakuntaTunnus) => {
    const q = new URLSearchParams();
    if (tunnus) q.set(peli.param, tunnus);
    if (reittiSiemen) q.set("reitti", reittiSiemen);
    const h = q.toString();
    return h ? `${peli.sivu}?${h}` : peli.sivu;
  };
  if (!reitti) return <Virhe peli={peli} uusi={() => location.assign(osoite(uusiReittiSiemen()))} />;

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
    if (!valittu) { setValittu(k); setIlmoitus(`${kunnat.get(k)!.n} valittu. Napauta toista korttia vaihtaaksesi paikat.`); return; }
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
    // Automaattinen vieritys: lista ei aina mahdu kartan ja napin väliin. Reunat ovat kiinteän kartan alareuna (kun kartta on
    // listan päällä) ja kiinteän napin yläreuna.
    const rullaa = () => {
      const reuna = 56, kortti = el.getBoundingClientRect(), k = karttaPala.current?.getBoundingClientRect();
      const yla = k && k.left < kortti.right && k.right > kortti.left ? Math.max(0, k.bottom) : 0;
      const ala = Math.min(window.innerHeight, toiminto.current?.getBoundingClientRect().top ?? window.innerHeight);
      const lista = el.closest(".kl-lista")?.getBoundingClientRect();
      // Vain sen verran kuin lista vaatii: muuten raahaus veisi sivun listan ohi ohjeisiin asti.
      const v = viimeY < yla + reuna && lista && lista.top < yla ? -Math.ceil((yla + reuna - viimeY) / 6)
        : viimeY > ala - reuna && lista && lista.bottom > ala ? Math.ceil((viimeY - (ala - reuna)) / 6) : 0;
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
  /** Reitti piirtyy kartalle pari kerrallaan (Heikki 2.11.2026: animaatio säilyy lopussa). */
  const piirra = (valmis?: () => void) => {
    if (ajastin.current) clearInterval(ajastin.current);
    if (hiljaa()) { setPiirretty(KL_YHTEYKSIA); if (valmis) setTimeout(valmis, 300); return; }
    setPiirretty(0);
    let n = 0;
    ajastin.current = setInterval(() => {
      n++;
      setPiirretty(n);
      if (n >= KL_YHTEYKSIA) {
        clearInterval(ajastin.current!);
        if (valmis) setTimeout(valmis, 800);
      }
    }, 520);
  };
  const merkitsePelatuksi = () => {
    if (intro) try { localStorage.setItem(pelattuAvain, siemen); } catch {}
  };
  /** Tuloksen paljastus: yritykset loppuivat tai pelaaja luovutti. Tuloksen kartta piirtää oikean reitin. */
  const lopeta = (syy: Lopetus) => {
    setLopetus(syy);
    setVaihe("tulos");
    setValittu(null);
    merkitsePelatuksi();
    window.scrollTo({ top: 0, behavior: "auto" });
    piirra();
  };
  const tarkista = () => {
    if (samaJarjestys) { setSiirraEnsin(true); setIlmoitus("Siirrä ensin paloja."); return; }
    setSiirraEnsin(false);
    const kerta = yritys + 1;
    setYritys(kerta);
    setTarkistettu({ jarjestys, oikein: oikeita });
    setValittu(null);
    void tallenna(peli, { siemen, ryhma: reitti.maakunta, paivanReitti, yritys: kerta, oikein: oikeita, alueet: jarjestys });
    if (oikeita === KL_YHTEYKSIA) {
      setLopetus("onnistui");
      setVaihe("tarkistus");
      merkitsePelatuksi();
      piirra(() => { setVaihe("tulos"); window.scrollTo({ top: 0, behavior: "auto" }); });
    } else if (kerta >= KL_YRITYKSET) {
      lopeta("loppui");
    } else {
      setIlmoitus(`${vaarinTeksti(KL_YHTEYKSIA - oikeita)}. ${KL_YRITYKSET - kerta} ${KL_YRITYKSET - kerta === 1 ? "yritys" : "yritystä"} jäljellä.`);
    }
  };
  // Arvotaan vasta painettaessa: renderissä arvottu siemen erottaisi palvelimen ja selaimen HTML:n.
  const arvoUusi = () => location.assign(osoite(uusiReittiSiemen()));

  /* ── Pelikehys (vaihe 4, 20.10.2026): K1 palkki. ── */
  const pelissa = vaihe === "peli";
  const jaljella = KL_YRITYKSET - yritys;
  const palkki = <Pelipalkki iho={vaihe === "intro" ? "tumma" : "kerma"} peli={peli.nimi} koti={KOTI} pelissa={pelissa || vaihe === "tarkistus"} paluuNuoli />;
  /* CD 2a/3b: Korjattavaa näkyy mobiilissa kartan yläpuolella ja desktopilla pelipalstan ylimpänä. */
  const korjattava = (paikka: "m" | "d") => pelissa && tarkistettu && (
    <div className={`kl-korjattava kl-korjattava--${paikka}`} key={yritys}>
      <b>Korjattavaa</b>
      <span>{siirraEnsin && samaJarjestys ? "Siirrä ensin paloja" : vaarinTeksti(KL_YHTEYKSIA - tarkistettu.oikein)}</span>
    </div>
  );
  const ohjeet = (
    <ol>
      <li><b>Päät ovat kiinni.</b> {peli.info[0]}</li>
      <li><b>{peli.info[1]}</b> {peli.info[2]}</li>
      <li><b>Tarkista reitti.</b> Jos reitti ei ole oikein, näet montako rajaa on väärin, mutta et sitä, mitkä. Saat kaksi uutta yritystä.</li>
      <li><b>Pisteet.</b> 10 p jokaisesta oikeasta rajasta. Jokainen uusi yritys vähentää 10 p.</li>
      <li><b>Näppäimistö:</b> välilyönti valitsee, nuolinäppäimet siirtävät.</li>
    </ol>
  );

  if (vaihe === "intro") {
    const aloita = () => {
      setVaihe("peli");
      window.scrollTo({ top: 0, behavior: "auto" });
      requestAnimationFrame(() => kortit.current.get(jarjestys[1])?.focus({ preventScroll: true }));
    };
    return (
      <div className={`kl ${peli.luokka} kl--intro ${runkoCond.variable}`} data-iho="kerma">
        {palkki}
        <main>
          <Intro peli={peli} reitti={reitti} otsikko={otsikko} pelattu={pelattu} aloita={aloita}
            alueet={maakunnat} osoite={(t) => osoite(undefined, t)} />
        </main>
        <section className="kl-info" aria-labelledby="kl-info-h">
          <h2 id="kl-info-h">Näin pelaat</h2>
          {ohjeet}
        </section>
      </div>
    );
  }

  /* ── Tulos: mallin 2b/2c ylimpänä, sen alla sama jakoalue kuin muissa peleissä ja Pelaa seuraavaksi (Heikki 2.11.2026).
     Ei tasonimeä: 5/7 tai 7/7 riittää. ── */
  if (vaihe === "tulos" && lopetus && tarkistettu) {
    const onnistui = lopetus === "onnistui";
    const oma = tarkistettu.jarjestys.map((k) => kunnat.get(k)!);
    const vaarat = new Set(oma.filter((k, i) => k.k !== ratkaisu[i]?.k).map((k) => k.k));
    const pisteet = reittiPisteet(tarkistettu.oikein, onnistui ? yritys : KL_YRITYKSET);
    const tulos = `${tarkistettu.oikein}/${KL_YHTEYKSIA} rajaa`;
    const polku = osoite(siemen);
    const url = `${location.origin}${polku}${polku.includes("?") ? "&" : "?"}tulos=${tarkistettu.oikein}-${KL_YHTEYKSIA}`;
    /* Jakotekstit v4 (6.11.2026): nimi on reitti "Portugali → Viro"; löytynyt reitti kertoo yrityksen, muuten oikeat rajat. */
    const nimi = `${ratkaisu[0]?.n ?? ""} → ${ratkaisu.at(-1)?.n ?? ""}`;
    const teksti = tulosjakoteksti(nimi, onnistui ? `löysin reitin ${jarjestysluvulla(yritys)} yrityksellä` : `sain ${tulos} oikein`);
    return (
      <div className={`kl ${peli.luokka} kl--tulos ${runkoCond.variable}`} data-iho="kerma">
        {palkki}
        <main className="pk-tulos-ulko">
          <div className="pk-tulos kl-lopetus">
            <div className="kl-tulos" data-lopetus={lopetus} role="status">
              <h1>{onnistui ? "Onnistuit!" : lopetus === "loppui" ? "Yritykset loppuivat" : "Reitti paljastettu"}</h1>
              <p>{tulos}{onnistui ? ` · ${yritys}. yrityksellä` : ""} · {pisteet} p</p>
            </div>
            <div className="kl-lopetus-kartta"><Kartta peli={peli} reitti={reitti} piirretty={piirretty} nimet /></div>
            <div className="kl-ketjut">
              {onnistui ? (
                <Ketju peli={peli} otsikko="Sinun reittisi · oikein" alueet={oma} oikein />
              ) : (
                <>
                  <Ketju peli={peli} otsikko="Oikea reitti" alueet={ratkaisu} oikein />
                  <Ketju peli={peli} otsikko="Sinun reittisi" huomio={`${vaarat.size} väärässä kohdassa`} alueet={oma} vaarat={vaarat} />
                </>
              )}
            </div>
            <Jakoalue
              className="pk-tulos-jako"
              id="pk-jako-h"
              otsikko="Haasta kaveri"
              waNappi="Jaa WhatsAppissa"
              teksti={teksti}
              url={url}
              natiiviOtsikko={peli.nimi}
            />
            <SeuraavaPeli seuraavat={karttapelit(peliNimi, viikko)} />
            <nav className="pk-tulos-linkit" aria-label="Muut toiminnot">
              <button type="button" onClick={arvoUusi}>Rakenna uusi reitti</button>
              {!paivanReitti && <a href={osoite()}>{reittiNimi}</a>}
              <a href={KARTTAPELIT_SIVU}>Kaikki karttapelit</a>
            </nav>
          </div>
        </main>
      </div>
    );
  }

  const viim = jarjestys.length - 1;
  return (
    <div className={`kl ${peli.luokka} ${runkoCond.variable}`} data-iho="kerma">
      {palkki}

      <div className="kl-main">
        <h1 className="kl-sr">{peli.nimi}</h1>
        <div className="kl-karttapala" ref={karttaPala} data-korjattava={(pelissa && !!tarkistettu) || undefined}>
          {korjattava("m")}
          <Kartta peli={peli} reitti={reitti} piirretty={vaihe === "tarkistus" ? piirretty : 0} nimet={false} />
        </div>

        <div className="kl-peli">
          {korjattava("d")}
          <div className="kl-lista" role="list" aria-label={peli.ketju}>
            {jarjestys.map((k, i) => {
              const kunta = kunnat.get(k)!;
              const lukko = i === 0 || i === viim;
              const korttiTila = lukko ? "lukittu" : raahattava === k ? "siirtyva" : valittu === k ? "valittu" : "lepo";
              const nimiPituus = peli.rivitys ? Math.max(...kunta.n.split(/[\s-]+/).map((w) => w.length)) : kunta.n.length;
              return (
                <div key={k} className="kl-rivi">
                  {i > 0 && <div className="kl-liitos" data-piirretty={(vaihe === "tarkistus" && i <= piirretty) || undefined}><span className="kl-kisko" /></div>}
                  <div
                    ref={(el) => { if (el) kortit.current.set(k, el); else kortit.current.delete(k); }}
                    className="kl-kortti"
                    data-tila={korttiTila}
                    role="listitem"
                    tabIndex={0}
                    aria-label={
                      lukko
                        ? `${kunta.n}${peli.vihje ? `, ${kunta.m}` : ""}. Reitin kiinnitetty ${i === 0 ? "lähtö" : "maali"}, paikka ${i + 1} / ${viim + 1}.`
                        : `${kunta.n}${peli.vihje ? `, ${kunta.m}` : ""}. Paikka ${i + 1} / ${viim + 1}.${pelissa ? " Siirrettävä." : ""}`
                    }
                    aria-pressed={pelissa && !lukko ? valittu === k : undefined}
                    onPointerDown={(e) => alas(k, e, false)}
                    onClick={() => napauta(k)}
                    onKeyDown={(e) => nappain(k, e)}
                  >
                    <Kilpi kunta={kunta} muoto={peli.tunnus} />
                    <span className="kl-kortti-t">
                      <span
                        className={`kl-nimi${peli.rivitys ? " kl-nimi--rivittyva" : ""}`}
                        style={{ "--kl-len": Math.max(8, nimiPituus) } as CSSProperties}
                      >
                        {kunta.n}
                      </span>
                      {peli.vihje && <span className="kl-maakunta">{kunta.m}</span>}
                    </span>
                    {lukko ? (
                      <span className="kl-paate-merkki">{i === 0 ? "Lähtö" : "Maali"}</span>
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

          <div className="kl-toiminto" ref={toiminto}>
            {pelissa && tarkistettu && (
              <div className="kl-yritykset">
                <span className="kl-yritykset-pisteet" aria-hidden="true">
                  {Array.from({ length: jaljella }, (_, i) => <i key={i} />)}
                </span>
                {jaljella} {jaljella === 1 ? "yritys" : "yritystä"} jäljellä
              </div>
            )}
            {pelissa && (
              <div className="kl-napit">
                <button type="button" className="kl-nappi" onClick={tarkista}>{tarkistettu ? "Yritä uudelleen" : "Tarkista reitti"}</button>
                {tarkistettu && <button type="button" className="kl-nappi kl-nappi--2" onClick={() => lopeta("paljastus")}>Paljasta oikea reitti</button>}
              </div>
            )}
            {vaihe === "tarkistus" && <div className="kl-rakentuu">Reittiä rakennetaan · {piirretty}/{KL_YHTEYKSIA}</div>}
          </div>
        </div>
      </div>

      <section className="kl-info" aria-labelledby="kl-info-h">
        <h2 id="kl-info-h">Näin pelaat</h2>
        {ohjeet}
      </section>
    </div>
  );
}

const vaarinTeksti = (n: number) => `${n} ${n === 1 ? "raja" : "rajaa"} väärin`;

/** Seuraava peli (CD-handoff 1.11.2026, 7d): uusi harjoitusreitti ja kaksi muuta karttaa. Kuvat ovat reittejä vaalealla
    kartalla (6c, vain lähtö ja maali), kuvaus nimeää viikon reitin. "Arvo uusi reitti" -kortti: ?reitti=uusi → sivu arpoo
    siemenen palvelimella (ei hydraatioeroa). Uusi kartta rekisterissä (lib/karttapelit.ts) näkyy täällä vain, jos sen lisää. */
function karttapelit(peli: ReittipeliNimi, viikko: string): Pelimuoto[] {
  const kortti = (p: ReittipeliNimi, nimi: string, kuvaus: string, href: string, siemen: string): Pelimuoto => ({
    slug: `${p}-${siemen}`, nimi, ikoni: "ketju", kuvaus, href, tila: "pelattava", serves: [], kuva: { src: `/og/reitti/${p}/kortti?reitti=${siemen}` },
  });
  const viikon = viikonSiemen(viikko);
  const toinen = (p: ReittipeliNimi, nimi: string, loppu: string) => {
    const o = viikonReitti(p, viikko)?.otsikko;
    return kortti(p, nimi, o ? `${o} ${loppu}.` : "Uusi reitti joka maanantai.", PELIT[p].sivu, viikon);
  };
  const KARTAT: Record<ReittipeliNimi, () => Pelimuoto> = {
    rajanaapurit: () => toinen("rajanaapurit", "Rajanaapurit: Maailma", "maarajoja pitkin"),
    osavaltiot: () => toinen("osavaltiot", "Rajanaapurit: Yhdysvallat", "osavaltio kerrallaan"),
    kuntaliitos: () => toinen("kuntaliitos", "Kuntaliitos", "kunta kerrallaan"),
  };
  const muut = (Object.keys(KARTAT) as ReittipeliNimi[]).filter((p) => p !== peli);
  return [KARTAT[muut[0]](), kortti(peli, "Arvo uusi reitti", "Uusi lähtö, uusi maali.", `${PELIT[peli].sivu}?reitti=uusi`, "harjoitus"), KARTAT[muut[1]]()];
}

function Virhe({ peli, uusi }: { peli: Peli; uusi: () => void }) {
  return (
    <div className={`kl ${runkoCond.variable}`} data-iho="kerma">
      <Pelipalkki iho="kerma" peli={peli.nimi} koti={KOTI} />
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

// ── Hero (CD "Reittipelit intro v0.2", kierros 3, 1.11.2026) ──────────────
// Viikon reitti otsikkona ("Portugalista Viroon rajoja pitkin"), lähtö ja maali paloina, välipalat
// sekaisin (pelin lähtöjärjestys), Aloita ja aluevalinta. Desktopilla oikealla kartta lähtö- ja
// maalimerkein; Aloita piilottaa heron, joten sama kartta ei näy kahteen kertaan. Ei ohjetekstiä (UI-sääntö 9).
const KALLISTUS = ["-1.4deg", "1.1deg", ".6deg", "-.8deg", "1.3deg", "-1deg"];
const MOBIILIPALOJA = 4;

/** Pisimmän sanan pituus (yhdysmerkki saa rivittää): otsikon koko mitoitetaan sen mukaan (KORTTISÄÄNTÖ). */
const pisinSana = (t: string) => Math.max(...t.split(/[\s-]+/).map((w) => w.length));
/** WebKit ei katkaise yhdysmerkistä keep-all-otsikossa (KORTTISÄÄNTÖ 4) → leveyttä vailla oleva katko perään. */
const katko = (t: string) => t.replace(/-/g, "-\u200B");

function Intro({ peli, reitti, otsikko, pelattu, aloita, alueet, osoite }: {
  peli: Peli; reitti: KlReitti; otsikko: string | null; pelattu: boolean; aloita: () => void;
  alueet: Array<{ nimi: string; tunnus: string }>; osoite: (tunnus: string | null) => string;
}) {
  const r = reitti.ratkaisu;
  const alku = r[0], loppu = r[r.length - 1];
  const per = new Map(r.map((k) => [k.k, k]));
  const valit = reitti.alku.slice(1, -1).map((k) => per.get(k)!);
  const teksti = `${otsikko ?? `${alku.n} – ${loppu.n}`} ${peli.pitkin}`;
  const paate = (k: KlKunta) => (
    <div className="rh-paate">
      <Kilpi kunta={k} muoto={peli.tunnus} />
      <span>{k.n}</span>
    </div>
  );
  return (
    <section className="rh" aria-labelledby="rh-h">
      <div className="rh-sisus">
        <div className="rh-teksti">
          <h1 id="rh-h" className="rh-h1" style={{ "--rh-lw": pisinSana(teksti) } as CSSProperties}>
            {katko(otsikko ?? `${alku.n} – ${loppu.n}`)} <span>{peli.pitkin}</span>
          </h1>
          <div className="rh-palat">
            {paate(alku)}
            <ul className="rh-valit" aria-label={`Reitin ${peli.alueet} sekaisin`}>
              {valit.map((k, i) => (
                <li key={k.k} className="rh-pala" data-yli={i >= MOBIILIPALOJA || undefined} style={{ "--rh-k": KALLISTUS[i % KALLISTUS.length] } as CSSProperties}>
                  <Kilpi kunta={k} muoto={peli.tunnus} />
                  <span>{k.n}</span>
                </li>
              ))}
              {valit.length > MOBIILIPALOJA && <li className="rh-pala rh-pala--lisa" aria-hidden="true">+{valit.length - MOBIILIPALOJA}</li>}
            </ul>
            {paate(loppu)}
          </div>
          <button type="button" className="rh-cta tn-cta-lime" onClick={aloita}>{pelattu ? "Pelaa uudelleen" : "Aloita"}</button>
          {peli.valitsin !== "ei" && <div className="rh-alue">
            {peli.valitsin === "segmentit" ? (
              <nav className="rh-pillerit" aria-label={peli.valitse}>
                {alueet.map((m) => <a key={m.tunnus} href={osoite(m.tunnus)}>{m.nimi}</a>)}
              </nav>
            ) : (
              <AlueValinta kaikki={peli.kaikki} alueet={alueet} valittu={null} nappi={peli.valitse} osoite={osoite} />
            )}
          </div>}
        </div>
        <HeroKartta peli={peli} reitti={reitti} />
      </div>
    </section>
  );
}

function HeroKartta({ peli, reitti }: { peli: Peli; reitti: KlReitti }) {
  const merkit = useMemo<Merkki[]>(() => {
    const r = reitti.ratkaisu;
    return [{ kunta: r[0], teksti: `Lähtö · ${r[0].n}`, tunnus: true }, { kunta: r[r.length - 1], teksti: `Maali · ${r[r.length - 1].n}`, tunnus: true }];
  }, [reitti]);
  const [, , w, h] = reitti.kartta.viewBox.split(" ").map(Number);
  // Vaalea kartta myös tummassa herossa (malli 6c: kartta on se vaalea elementti).
  return (
    <div className="rh-kartta" style={{ aspectRatio: `${w} / ${h}` }} aria-hidden="true">
      <svg viewBox={reitti.kartta.viewBox} preserveAspectRatio="xMidYMid slice">
        {reitti.kartta.alueet.map((a) => (
          <path key={a.k} d={a.d} className={`kl-alue${a.t ? " kl-alue--tausta" : ""}${merkit.some((m) => m.kunta.k === a.k) ? " kl-alue--paate" : ""}`} />
        ))}
      </svg>
      <Merkit kartta={reitti.kartta} nakyma={reitti.kartta.viewBox} pisteet={reitti.ratkaisu} muoto={peli.tunnus} merkit={merkit} />
    </div>
  );
}
