"use client";
// REITTIPELIT — Kuntaliitos (kunnat, vaakunat), Rajanaapurit (valtiot, liput) ja sen variantti Rajanaapurit:
// Yhdysvallat (osavaltiot, liput; CD-handoff 1.11.2026). Sama näkymä kaikille; pelikohtaiset tekstit, tunnus ja
// osoite tulevat PELIT-asetuksista. Kartta kaikissa vaalea (malli 6c, Heikki 1.11.2026).
//
// KUNTALIITOS — pelinäkymä (CD "Kuntaliitos v0.2", kierros 5: 5a pelitilanne, 5b vaiheittainen
// paljastus, 5c epäonnistunut kierros ja jatko (CD:n "Korjaa katkos" → "Yritä uudelleen", Heikki 27.9.2026), 5d täydellinen onnistuminen, 1d virhetila).
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

import { lisaaPelirivi } from "@/lib/seuranta";
import { pelijakoteksti } from "@/lib/korttinimi";
import { reittiTaso } from "@/lib/pelitasot";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type KeyboardEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { KL_PISTEET, KL_SIVU, KL_YHTEYKSIA, pariAvain, uusiReittiSiemen, type KlKunta, type KlReitti } from "@/lib/kuntaliitos";
import { RN_SIVU, RN_USA_SIVU } from "@/lib/rajanaapurit";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import PeliTulos from "@/components/tn20/pelikehys/PeliTulos";
import { runkoCond } from "@/components/tn20/runko/runkoFontti";
import { seuraavatPelit, viikonKuvat, type Pelimuoto } from "@/lib/pelimuodot";
import { viikonReitti, viikonSiemen } from "@/lib/reittipeli/viikonReitit";

export type ReittipeliNimi = "kuntaliitos" | "rajanaapurit" | "osavaltiot";
type Peli = {
  nimi: string; sivu: string; param: string; valinta: string; kaikki: string;
  ok: string; bad: string; tunnus: "kilpi" | "lippu"; taulu: string; kentta: string;
  /** Pelitaulun datapaketti (rajanaapurit_pelit.aihe): puuttuu = sarakkeen oletus. */
  aihe?: string;
  /** Juuren luokat: Yhdysvallat käyttää Rajanaapurien ilmettä. */
  luokka: string;
  alueet: string; alueita: string; alueiden: string; ketju: string; rajoja: string; yksikko: string;
  /** Pitkät monisanaiset nimet (Kongon demokraattinen tasavalta) saavat rivittyä sanojen välistä. */
  rivitys: boolean;
  info: string[]; lisa: string;
  /** Korttien porrastus (Rajanaapurit 0/4/8 %, CD v0.2 3a: nimelle enemmän tilaa). */
  porras: string[];
  /** Aluevalinta: valikko (18 maakuntaa), segmentit (5 maanosaa, CD v0.2 3d) tai ei valintaa (Yhdysvallat). */
  valitsin: "valikko" | "segmentit" | "ei"; kaikkiLyhyt: string;
  valmisNappi: string;
  /** Pelikehys (vaihe 4, 20.10.2026): K2:n yksi lause, K1:n paluu kotikokoelmaan, rekisterin slug. */
  lause: string; koti: { href: string; nimi: string }; slug: string;
  /** Hero (CD "Reittipelit intro v0.2", kierros 3): otsikon loppu ja aluevalinnan nappi. */
  pitkin: string; valitse: string;
};
const PELIT: Record<ReittipeliNimi, Peli> = {
  kuntaliitos: {
    nimi: "Kuntaliitos", sivu: KL_SIVU, param: "maakunta", valinta: "Aloita maakunnasta", kaikki: "Koko Suomi",
    ok: "Yhteinen raja", bad: "Ei yhteistä rajaa", tunnus: "kilpi", taulu: "kuntaliitos_pelit", kentta: "kunnat",
    alueet: "kunnat", alueita: "kuntia", alueiden: "kunnista", ketju: "Kuntaketju", rajoja: "yhteisiä rajoja", yksikko: "kuntaa",
    rivitys: false, porras: ["0%", "6%", "12%", "6%"], valitsin: "valikko", kaikkiLyhyt: "Koko Suomi",
    luokka: "kl--kuntaliitos", valmisNappi: "kl-nappi--teal",
    info: ["Ensimmäinen ja viimeinen kunta pysyvät paikallaan.", "Järjestä välikunnat.", "Jokaisella vierekkäisellä parilla pitää olla yhteinen raja."],
    lause: "Rakenna reitti kahden kunnan välille niin, että jokainen kunta rajautuu seuraavaan.",
    koti: { href: "/kokoelma/kaupungit", nimi: "Suomen kaupungit" }, slug: "kuntaliitos",
    pitkin: "kuntarajoja pitkin", valitse: "Valitse maakunta",
    lisa: "Uusi viikon reitti joka maanantai koko Suomelle ja päivän reitti jokaiselle maakunnalle. Valitse maakunta, niin reitti alkaa sieltä ja kulkee mahdollisimman paljon sen kuntien kautta. Yhteinen raja voi kulkea myös vesialueella, esimerkiksi Naantalin ja Turun välillä.",
  },
  rajanaapurit: {
    nimi: "Rajanaapurit", sivu: RN_SIVU, param: "maanosa", valinta: "Aloita maanosasta", kaikki: "Koko maailma",
    ok: "Maaraja", bad: "Ei maarajaa", tunnus: "lippu", taulu: "rajanaapurit_pelit", kentta: "maat",
    alueet: "valtiot", alueita: "valtioita", alueiden: "valtioista", ketju: "Valtioketju", rajoja: "maarajoja", yksikko: "valtiota",
    rivitys: true, porras: ["0%", "4%", "8%", "4%"], valitsin: "segmentit", kaikkiLyhyt: "Maailma",
    luokka: "kl--rajanaapurit", valmisNappi: "",
    info: ["Ensimmäinen ja viimeinen valtio pysyvät paikallaan.", "Järjestä välivaltiot.", "Jokaisella vierekkäisellä parilla pitää olla yhteinen maaraja."],
    lause: "Rakenna reitti kahden valtion välille niin, että jokainen valtio rajautuu seuraavaan maarajaa pitkin.",
    koti: { href: "/kokoelma/matkakohteet", nimi: "Maantieto" }, slug: "rajanaapurit",
    pitkin: "rajoja pitkin", valitse: "Valitse maanosa",
    lisa: "Uusi viikon reitti joka maanantai koko maailmalle ja päivän reitti jokaiselle maanosalle. Mukana ovat valtiot, joilla on maarajoja; saarivaltiot, merentakaiset alueet sekä Vatikaani, San Marino ja Monaco eivät ole mukana.",
  },
  osavaltiot: {
    nimi: "Rajanaapurit: Yhdysvallat", sivu: RN_USA_SIVU, param: "alue", valinta: "", kaikki: "Yhdysvallat",
    ok: "Maaraja", bad: "Ei maarajaa", tunnus: "lippu", taulu: "rajanaapurit_pelit", kentta: "maat", aihe: "osavaltiot",
    alueet: "osavaltiot", alueita: "osavaltioita", alueiden: "osavaltioista", ketju: "Osavaltioketju", rajoja: "maarajoja", yksikko: "osavaltiota",
    rivitys: true, porras: ["0%", "4%", "8%", "4%"], valitsin: "ei", kaikkiLyhyt: "Yhdysvallat",
    luokka: "kl--rajanaapurit kl--osavaltiot", valmisNappi: "",
    info: ["Ensimmäinen ja viimeinen osavaltio pysyvät paikallaan.", "Järjestä väliosavaltiot.", "Jokaisella vierekkäisellä parilla pitää olla yhteinen maaraja."],
    lause: "Rakenna reitti kahden osavaltion välille niin, että jokainen osavaltio rajautuu seuraavaan maarajaa pitkin.",
    koti: { href: "/kokoelma/matkakohteet", nimi: "Maantieto" }, slug: "rajanaapurit",
    pitkin: "rajoja pitkin", valitse: "",
    lisa: "Uusi viikon reitti joka maanantai. Mukana ovat 48 manner-osavaltiota: Alaska ja Havaiji eivät rajaudu muihin osavaltioihin, eikä Washington D.C. ole osavaltio. Nurkkapiste ei ole raja, joten Arizona ja Colorado eivät ole naapureita.",
  },
};

type Vaihe = "intro" | "peli" | "tarkistus" | "tulos";
type Tila = "ok" | "bad";

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
// Vaalea kartta näkyy kunnolla: valkoinen meri, alueet harmaansinisinä, rakennetun reitin alueet vaalealla
// tealilla ja päätepisteet tummalla. Reittiviiva navy Catmull-Rom-käyränä alueiden keskipisteiden kautta,
// välipisteet ympyröinä ja päätepisteissä tunnus + "Lähtö · nimi" -merkki. Katkos kuten ennen: punaiset
// tyngät ja risti.
type Nasta = { kunta: KlKunta; num: number; laji: "lahto" | "maali" | "solmu"; tila: "ok" | "bad" | "maali" };
/** Jakso a → b; ed/seur = naapuripisteet käyrää varten (ketjun päissä puuttuvat). */
type Jakso = { a: KlKunta; b: KlKunta; tila: Tila; ed?: KlKunta; seur?: KlKunta };

/** Catmull-Rom-käyrän osa b → c kuutiollisena Bézierinä (a ja d naapurit) kartan 0–100-koordinaateissa. */
function kayra(b: KlKunta, c: KlKunta, a: KlKunta = b, d: KlKunta = c) {
  const r = (n: number) => Math.round(n * 100) / 100;
  return `M${r(b.x)} ${r(b.y)}C${r(b.x + (c.x - a.x) / 6)} ${r(b.y + (c.y - a.y) / 6)} ${r(c.x - (d.x - b.x) / 6)} ${r(c.y - (d.y - b.y) / 6)} ${r(c.x)} ${r(c.y)}`;
}

/** Päätepisteen merkki: piste + tunnus ja "Lähtö · nimi", jottei lappu peitä reittiä:
    pystysuuntaisella reitillä (Torniosta Utsjoelle) lappu pisteen sivulle kartan keskustaa kohti, muuten
    poispäin toisesta päätepisteestä ylä- tai alapuolelle (reunan lähellä aina kartan sisään). Myös heron kartassa. */
function Merkki({ kunta, laji, muoto, toinen }: { kunta: KlKunta; laji: "lahto" | "maali"; muoto: "kilpi" | "lippu"; toinen: KlKunta }) {
  const pysty = Math.abs(toinen.y - kunta.y) > Math.abs(toinen.x - kunta.x) * 1.3 && (kunta.x < 45 || kunta.x > 55);
  const ala = kunta.y < 26 || (kunta.y <= 74 && toinen.y < kunta.y);
  const paikka = pysty
    ? (kunta.x < 45 ? " kl-merkki--oikealle" : " kl-merkki--vasemmalle")
    : `${ala ? " kl-merkki--ala" : ""}${kunta.x > 74 ? " kl-merkki--oik" : kunta.x < 26 ? " kl-merkki--vas" : ""}`;
  // Pitkä nimi kapealla kartalla (320 px: "Lähtö · Pennsylvania"): lappu siirretään vaakasuunnassa kartan sisään.
  const lappu = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const l = lappu.current, alue = l?.closest(".kl-kartta-alue, .rh-kartta");
    if (!l || !alue) return;
    const sovita = () => {
      l.style.removeProperty("--kl-siirto");
      const lb = l.getBoundingClientRect(), ab = alue.getBoundingClientRect();
      const s = lb.left < ab.left + 4 ? ab.left + 4 - lb.left : lb.right > ab.right - 4 ? ab.right - 4 - lb.right : 0;
      if (s) l.style.setProperty("--kl-siirto", `${Math.round(s)}px`);
    };
    sovita();
    const ro = new ResizeObserver(sovita);
    ro.observe(alue);
    return () => ro.disconnect();
  }, [kunta.k, paikka]);
  return (
    <span className={`kl-merkki${paikka}`} style={{ left: `${kunta.x}%`, top: `${kunta.y}%` }}>
      <span className="kl-merkki-piste" />
      <span className="kl-merkki-lappu" ref={lappu}>
        <Kilpi kunta={kunta} muoto={muoto} />
        <span className="kl-merkki-nimi">{laji === "lahto" ? "Lähtö" : "Maali"} · {kunta.n}</span>
      </span>
    </span>
  );
}

function Kartta(p: {
  peli: Peli;
  reitti: KlReitti;
  nastat: Nasta[];
  jaksot: Jakso[];
  haamu: KlKunta[];
  korostetut: Set<string>;
  pari: { a: KlKunta; b: KlKunta; tila: Tila } | null;
  otsikko: string;
  huomio: string;
  aktiivinen: boolean;
}) {
  const vb = p.reitti.kartta.viewBox;
  const paat = new Set([p.reitti.ratkaisu[0]?.k, p.reitti.ratkaisu.at(-1)?.k]);
  return (
    <div className={`kl-kartta${p.aktiivinen ? " kl-kartta--akt" : ""}`}>
      <div className="kl-kartta-yla">
        <span className="kl-pikku">{p.otsikko}</span>
        <span className="kl-selite">
          <span><i className="kl-selite-ok" />{p.peli.ok}</span>
          <span><i className="kl-selite-bad" />Katkos</span>
          {p.peli.tunnus === "lippu" && p.reitti.kartta.alueet.some((a) => a.t) && <span><i className="kl-selite-ulko" />Ei pelissä</span>}
        </span>
      </div>

      {p.pari && (
        <div className={`kl-pari kl-pari--${p.pari.tila}`} role="status" aria-live="polite">
          <Kilpi kunta={p.pari.a} className="kl-kilpi--pari" muoto={p.peli.tunnus} />
          <span className="kl-pari-t">
            <b>{p.pari.a.n} – {p.pari.b.n}</b>
            <span>{p.pari.tila === "bad" ? p.peli.bad : p.peli.ok}</span>
          </span>
          <Kilpi kunta={p.pari.b} className="kl-kilpi--pari" muoto={p.peli.tunnus} />
        </div>
      )}

      <div className="kl-kartta-alue">
        <svg className="kl-maa" viewBox={vb} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Kartta reitin alueen ${p.peli.alueiden}`}>
          {p.reitti.kartta.alueet.map((a) => (
            <path key={a.k} d={a.d} className={`kl-alue${a.t ? " kl-alue--tausta" : ""}${a.u ? " kl-alue--ulko" : ""}${paat.has(a.k) ? " kl-alue--paate" : p.korostetut.has(a.k) ? " kl-alue--reitti" : ""}`} />
          ))}
        </svg>
        <svg className="kl-viivat" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {p.haamu.length > 1 && (
            <path className="kl-haamu" d={p.haamu.slice(1).map((c, i) => kayra(p.haamu[i], c, p.haamu[i - 1], p.haamu[i + 2])).join("")} />
          )}
          {p.jaksot.map((j, i) => {
            if (j.tila === "ok") return <path key={i} className="kl-viiva kl-viiva--ok" d={kayra(j.a, j.b, j.ed, j.seur)} />;
            // Katkos piirretään kahtena tynkänä, väliin risti — ei yhtenäistä viivaa
            const l = (t: number) => [j.a.x + (j.b.x - j.a.x) * t, j.a.y + (j.b.y - j.a.y) * t];
            const [x1, y1] = l(0.34), [x2, y2] = l(0.66);
            return (
              <g key={i}>
                <line className="kl-viiva kl-viiva--bad" x1={j.a.x} y1={j.a.y} x2={x1} y2={y1} />
                <line className="kl-viiva kl-viiva--bad" x1={x2} y1={y2} x2={j.b.x} y2={j.b.y} />
              </g>
            );
          })}
        </svg>
        {p.reitti.kartta.renkaat?.map((r, i) => (
          <span key={`rg${i}`} className={`kl-rengas${r.u ? " kl-rengas--u" : ""}`} style={{ left: `${r.x}%`, top: `${r.y}%` }} aria-hidden="true" />
        ))}
        {p.jaksot.filter((j) => j.tila === "bad").map((j, i) => (
          <span key={`r${i}`} className="kl-risti" style={{ left: `${(j.a.x + j.b.x) / 2}%`, top: `${(j.a.y + j.b.y) / 2}%` }}>
            <Ikoni d={IKONI.bad} w={3.4} />
          </span>
        ))}
        {p.nastat.filter((n) => n.laji === "solmu").map((n) => (
          <span key={n.kunta.k} className={`kl-piste${n.tila === "bad" ? " kl-piste--bad" : ""}`} style={{ left: `${n.kunta.x}%`, top: `${n.kunta.y}%` }} />
        ))}
        {p.nastat.filter((n) => n.laji !== "solmu").map((n) => (
          <Merkki key={n.kunta.k} kunta={n.kunta} laji={n.laji === "lahto" ? "lahto" : "maali"} muoto={p.peli.tunnus}
            toinen={p.nastat.find((m) => m.laji !== "solmu" && m !== n)?.kunta ?? n.kunta} />
        ))}
      </div>

      {p.huomio && <p className="kl-kartta-huomio">{p.huomio}</p>}
    </div>
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
  luvut,
  lahde,
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
  /** Heron luvut: ["152 maata", "4 maanosaa"]. */
  luvut: string[];
  lahde: string;
  /** Kuluvan viikon maanantai (YYYY-MM-DD): Seuraava peli -korttien viikon reitit. */
  viikko: string;
}) {
  const peli = PELIT[peliNimi];
  const [jarjestys, setJarjestys] = useState<string[]>(reitti?.alku ?? []);
  /* Palautus 21.10.2026 (Heikki): peli alkaa suoraan laudalta. Poikkeus 1.11.2026 (CD intro v0.2): viikon
     reitillä ilman parametreja ensin hero (otsikko, palat, Aloita); valinnat ja jaetut linkit suoraan laudalle. */
  const [vaihe, setVaihe] = useState<Vaihe>(intro ? "intro" : "peli");
  const [pelattu, setPelattu] = useState(false);
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
  const maakuntaNimi = maakunnat.find((m) => m.tunnus === maakuntaTunnus)?.nimi ?? null;
  const valitsin = peli.valitsin === "ei" ? (
    // Yhdysvallat: ei aluevalintaa (Heikki 1.11.2026), vain reitin nimi
    <div className="kl-segvalinta">
      <div className="kl-segvalinta-yla">
        <span className="kl-segvalinta-reitti">{paivanReitti ? reittiNimi : "Arvottu reitti"}</span>
      </div>
    </div>
  ) : peli.valitsin === "segmentit" ? (
    // CD Rajanaapurit v0.2 3d: segmenttivalitsin, näkyy vain pelitilassa, valinta arpoo reitin heti
    <div className="kl-segvalinta">
      <div className="kl-segvalinta-yla">
        <span id="kl-valinta-h" className="kl-pikku">{peli.valinta}</span>
        <span className="kl-segvalinta-reitti">{paivanReitti ? reittiNimi : "Arvottu reitti"}</span>
      </div>
      <div className="kl-segmentit" role="group" aria-labelledby="kl-valinta-h">
        {[{ nimi: peli.kaikkiLyhyt, tunnus: null as string | null }, ...maakunnat].map((m) => (
          <button
            key={m.tunnus ?? "kaikki"}
            type="button"
            aria-pressed={(maakuntaTunnus ?? null) === m.tunnus}
            onClick={() => location.assign(osoite(undefined, m.tunnus))}
          >
            {m.nimi}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <div className="kl-valinta">
      <span id="kl-valinta-h">{peli.valinta}</span>
      <AlueValinta peli={peli} alueet={maakunnat} valittu={maakuntaTunnus} nappi={maakuntaNimi ?? peli.kaikki} osoite={(t) => osoite(undefined, t)} kuvaus="kl-valinta-h" />
      <span className="kl-valinta-reitti">{paivanReitti ? reittiNimi : "Arvottu reitti"}</span>
    </div>
  );
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
      if (intro) try { localStorage.setItem(pelattuAvain, siemen); } catch {}
      void tallenna(peli, { siemen, ryhma: reitti.maakunta, paivanReitti, yritys: kerta, oikein: tulokset.filter((t) => t === "ok").length, alueet: jarjestys });
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
  const arvoUusi = () => location.assign(osoite(uusiReittiSiemen()));

  /* Jako: tulos linkkiin (?tulos=n-total), jotta kaveri saa saman reitin ja Facebookin og-kuvaus kertoo tuloksen
     (23.10.2026); tasonimi kuten tulosnäkymässä (25.10.2026). Lasketaan vain tulosvaiheessa selaimessa. */
  const jakoTiedot = () => {
    const polku = osoite(siemen);
    const url = `${location.origin}${polku}${polku.includes("?") ? "&" : "?"}tulos=${oikein}-${KL_YHTEYKSIA}`;
    const nimi = otsikko ? `${peli.nimi}${peli.nimi.includes(":") ? " –" : ":"} ${otsikko} ${peli.pitkin}` : (paivanReitti ? `${peli.nimi}: ${reittiNimi.toLowerCase()}` : peli.nimi) + (maakuntaNimi ? ` (${maakuntaNimi})` : "");
    const teksti = pelijakoteksti(nimi, `${oikein}/${KL_YHTEYKSIA} yhteyttä`, oikein === KL_YHTEYKSIA, reittiTaso(oikein, KL_YHTEYKSIA));
    return { url, teksti };
  };
  async function haasta() {
    const { url, teksti } = jakoTiedot();
    try {
      if (navigator.share) await navigator.share({ title: peli.nimi, text: teksti, url });
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
  const kohta = (i: number) => (i >= 0 && i < jarjestys.length ? kunnat.get(jarjestys[i]) : undefined);
  const jaksot: Jakso[] = nakyvat.map((t, i) => ({ a: kohta(i)!, b: kohta(i + 1)!, tila: t, ed: kohta(i - 1), seur: kohta(i + 2) }));
  const haamu: KlKunta[] = ratkaisuNakyy ? ratkaisu : [];
  const korostetut = new Set(nastat.map((n) => n.kunta.k));
  if (ratkaisuNakyy) ratkaisu.forEach((k) => korostetut.add(k.k));
  const pi = paljastettu - 1;
  const pari = vaihe === "tarkistus" && pi >= 0
    ? { a: kunnat.get(jarjestys[pi])!, b: kunnat.get(jarjestys[pi + 1])!, tila: tulokset[pi] }
    : null;
  const pelissa = vaihe === "peli";
  const kartta = (
    <Kartta
      peli={peli}
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
    ? `Järjestä ${peli.alueet} niin, että jokaisella vierekkäisellä parilla on ${peli.tunnus === "lippu" ? "yhteinen maaraja" : "yhteinen raja"}. Reitti piirtyy kartalle vasta, kun rakennat sen.`
    : vaihe === "tarkistus"
      ? "Reitti rakentuu pari kerrallaan – kartta näyttää, mihin se katkeaa."
      : taydet
        ? `Koko reitti kulki ${peli.rajoja} pitkin päätepisteestä päätepisteeseen.`
        : `Katkokset on merkitty korttien väliin ja kartalle. Yritä uudelleen – järjestys säilyy, joten voit siirtää vain katkosten kohdalla olevia ${peli.alueita}.`;

  /* ── Pelikehys (vaihe 4, 20.10.2026): K1 palkki, K2 aloitus, K4 tulos ── */
  /* Pelin tilanne palkissa kuten ennen pelikehystä: mittari (yhteys kerrallaan) + pisteet (palautus 21.10.2026). */
  const kehysTila =
    vaihe === "peli" || vaihe === "tarkistus" ? (
      <>
        <span className="kl-mittari" role="img" aria-label={`Oikeat yhteydet ${oikein} / ${KL_YHTEYKSIA}`}>
          {mittari.map((t, i) => <span key={i} className={`kl-seg kl-seg--${t}`} />)}
        </span>
        <span className="kl-pisteet">{oikein * KL_PISTEET} p</span>
      </>
    ) : undefined;
  const palkki = <Pelipalkki iho={vaihe === "intro" ? "tumma" : "kerma"} peli={peli.nimi} koti={peli.koti} tila={kehysTila} pelissa={!!kehysTila} />;
  const kotiKokoelma = peli.koti.href.split("/").pop();
  const ohjeet = (
    <>
      <ol>
        <li><b>Reitin päät ovat kiinni.</b> {peli.info[0]}</li>
        <li><b>{peli.info[1]}</b> Raahaa tai napauta kahta korttia vaihtaaksesi niiden paikat. {peli.info[2]}</li>
        <li><b>Rakenna reitti.</b> Kartta piirtää reitin pari kerrallaan. Jokainen oikea yhteys on {KL_PISTEET} pistettä – jos reitti katkeaa, voit yrittää uudelleen samalla järjestyksellä.</li>
        <li><b>Näppäimistö:</b> välilyönti valitsee kortin, nuolinäppäimet siirtävät sitä.</li>
      </ol>
      <p>{peli.lisa}</p>
      <p className="kl-lahde">{lahde}</p>
    </>
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
          <Intro peli={peli} reitti={reitti} otsikko={otsikko} luvut={luvut} pelattu={pelattu} aloita={aloita}
            alueet={maakunnat} osoite={(t) => osoite(undefined, t)} />
        </main>
        <section className="kl-info" aria-labelledby="kl-info-h">
          <h2 id="kl-info-h">Näin pelaat</h2>
          {ohjeet}
        </section>
      </div>
    );
  }

  if (vaihe === "tulos" && taydet) {
    const eka = ratkaisu[0]?.n, vika = ratkaisu.at(-1)?.n;
    return (
      <div className={`kl ${peli.luokka} kl--k4 ${runkoCond.variable}`} data-iho="kerma">
        {palkki}
        <main>
          <PeliTulos
            luku={`${oikein}/${KL_YHTEYKSIA}`}
            yksikko="yhteyttä"
            tasonimi={reittiTaso(oikein, KL_YHTEYKSIA)}
            lause={`${eka} → ${vika} ${peli.rajoja} pitkin, ${yritys <= 1 ? "ensimmäisellä tarkistuksella" : `${yritys}. yrityksellä`}. ${oikein * KL_PISTEET} pistettä.`}
            lisa={
              <>
                <ol className="pk-ketju" aria-label={peli.ketju}>
                  {ratkaisu.map((k) => <li key={k.k}>{k.n}</li>)}
                </ol>
                <div className="kl-k4-kartta">{kartta}</div>
              </>
            }
            lisaJaonJalkeen
            jako={{ ...jakoTiedot(), natiiviOtsikko: peli.nimi }}
            toiminnot={[
              { teksti: "Rakenna uusi reitti", onClick: arvoUusi },
              ...(!paivanReitti ? [{ teksti: reittiNimi, href: osoite() }] : []),
            ]}
            seuraavat={peliNimi === "kuntaliitos" ? seuraavatPelit(peli.slug, kotiKokoelma) : karttapelit(peliNimi, viikko)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={`kl ${peli.luokka} ${runkoCond.variable}`} data-iho="kerma" ref={juuri}>
      {palkki}

      <div className="kl-main">
        <h1 className="kl-sr">{peli.nimi}</h1>
        <div className="kl-peli">
          {(peli.valitsin === "valikko" || vaihe === "peli") && valitsin}
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

          <div className="kl-lista" role="list" aria-label={peli.ketju}>
            {jarjestys.map((k, i) => {
              const kunta = kunnat.get(k)!;
              const lukko = i === 0 || i === viim;
              const tila = i > 0 && i <= paljastettu ? tulokset[i - 1] : "idle";
              const korttiTila = lukko ? "lukittu" : raahattava === k ? "siirtyva" : valittu === k ? "valittu" : "lepo";
              const porras = peli.porras[i % peli.porras.length];
              return (
                <div key={k} className="kl-rivi" style={{ "--kl-porras": porras } as CSSProperties}>
                  {i > 0 && (
                    <div className="kl-liitos" data-tila={tila}>
                      <span className="kl-kisko" />
                      {tila !== "idle" && (
                        <span className="kl-pilleri">
                          <Ikoni d={tila === "ok" ? IKONI.ok : IKONI.bad} w={3} />
                          {tila === "ok" ? peli.ok : peli.bad}
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
                      <Kilpi kunta={kunta} muoto={peli.tunnus} />
                      <span className="kl-kortti-num">{i + 1}</span>
                    </span>
                    <span className="kl-kortti-t">
                      <span
                        className={`kl-nimi${peli.rivitys ? " kl-nimi--rivittyva" : ""}`}
                        style={{ "--kl-len": Math.max(8, peli.rivitys ? Math.max(...kunta.n.split(/[\s-]+/).map((w) => w.length)) : kunta.n.length) } as CSSProperties}
                      >
                        {kunta.n}
                      </span>
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
                    <Kilpi kunta={k} className="kl-kilpi--pieni" muoto={peli.tunnus} />
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
              ? <button type="button" className={`kl-nappi ${peli.valmisNappi}`} onClick={arvoUusi}>Arvo uusi reitti</button>
              : <button type="button" className="kl-nappi" onClick={korjaa}>Yritä uudelleen</button>)}
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
              {!paivanReitti && <a className="kl-linkki kl-linkki--paiva" href={osoite()}>{reittiNimi}</a>}
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
              <b>{pisin === 0 ? "—" : `${pisin + 1} ${peli.yksikko}`}</b>
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
        {ohjeet}
      </section>
    </div>
  );
}

/** Seuraava peli Rajanaapureissa (CD-handoff 1.11.2026, 7d): sama peli toisella kartalla, uusi harjoitusreitti ja
    Kuntaliitos. Kuvat ovat reittejä vaalealla kartalla (6c, vain lähtö ja maali), kuvaus nimeää viikon reitin.
    "Arvo uusi reitti" -kortti: ?reitti=uusi → sivu arpoo siemenen palvelimella (ei hydraatioeroa). */
function karttapelit(peli: "rajanaapurit" | "osavaltiot", viikko: string): Pelimuoto[] {
  const toinen = peli === "osavaltiot" ? "rajanaapurit" : "osavaltiot";
  const ots = (p: "rajanaapurit" | "osavaltiot" | "kuntaliitos") => viikonReitti(p, viikko)?.otsikko ?? null;
  const kortti = (p: ReittipeliNimi, nimi: string, kuvaus: string, href: string, siemen: string): Pelimuoto => ({
    slug: `${p}-${siemen}`, nimi, ikoni: "ketju", kuvaus, href, tila: "pelattava", serves: [], kuva: { src: `/og/reitti/${p}/kortti?reitti=${siemen}` },
  });
  const viikon = viikonSiemen(viikko);
  return [
    toinen === "osavaltiot"
      ? kortti(toinen, "Rajanaapurit: Yhdysvallat", ots(toinen) ? `${ots(toinen)} osavaltio kerrallaan.` : "Uusi reitti joka maanantai.", PELIT.osavaltiot.sivu, viikon)
      : kortti(toinen, "Rajanaapurit: Maailma", ots(toinen) ? `${ots(toinen)} maarajoja pitkin.` : "Uusi reitti joka maanantai.", PELIT.rajanaapurit.sivu, viikon),
    kortti(peli, "Arvo uusi reitti", "Uusi lähtö, uusi maali.", `${PELIT[peli].sivu}?reitti=uusi`, "harjoitus"),
    viikonKuvat({
      slug: "kuntaliitos", nimi: "Kuntaliitos", ikoni: "ketju", href: PELIT.kuntaliitos.sivu, tila: "pelattava", serves: [],
      kuvaus: ots("kuntaliitos") ? `${ots("kuntaliitos")} kunta kerrallaan.` : "Uusi reitti joka maanantai.", kuva: { src: "/og/reitti/kuntaliitos/kortti" },
    }, viikko),
  ];
}

function Virhe({ peli, uusi }: { peli: Peli; uusi: () => void }) {
  return (
    <div className={`kl ${runkoCond.variable}`} data-iho="kerma">
      <Pelipalkki iho="kerma" peli={peli.nimi} koti={peli.koti} />
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
// sekaisin (pelin lähtöjärjestys), Aloita, luvut ja aluevalinta. Desktopilla oikealla kartta lähtö- ja
// maalimerkein; Aloita piilottaa heron, joten sama kartta ei näy kahteen kertaan. Ei ohjetekstiä (UI-sääntö 9).
const KALLISTUS = ["-1.4deg", "1.1deg", ".6deg", "-.8deg", "1.3deg", "-1deg"];
const MOBIILIPALOJA = 4;

/** Pisimmän sanan pituus (yhdysmerkki saa rivittää): otsikon koko mitoitetaan sen mukaan (KORTTISÄÄNTÖ). */
const pisinSana = (t: string) => Math.max(...t.split(/[\s-]+/).map((w) => w.length));
/** WebKit ei katkaise yhdysmerkistä keep-all-otsikossa (KORTTISÄÄNTÖ 4) → leveyttä vailla oleva katko perään. */
const katko = (t: string) => t.replace(/-/g, "-\u200B");

function Intro({ peli, reitti, otsikko, luvut, pelattu, aloita, alueet, osoite }: {
  peli: Peli; reitti: KlReitti; otsikko: string | null; luvut: string[]; pelattu: boolean; aloita: () => void;
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
          <p className="rh-luvut">{luvut.map((l) => <span key={l}>{l}</span>)}</p>
          {peli.valitsin !== "ei" && <div className="rh-alue">
            {peli.valitsin === "segmentit" ? (
              <nav className="rh-pillerit" aria-label={peli.valitse}>
                {alueet.map((m) => <a key={m.tunnus} href={osoite(m.tunnus)}>{m.nimi}</a>)}
              </nav>
            ) : (
              <AlueValinta peli={peli} alueet={alueet} valittu={null} nappi={peli.valitse} osoite={osoite} />
            )}
          </div>}
        </div>
        <HeroKartta peli={peli} reitti={reitti} />
      </div>
    </section>
  );
}

function HeroKartta({ peli, reitti }: { peli: Peli; reitti: KlReitti }) {
  const r = reitti.ratkaisu;
  const paat = [r[0], r[r.length - 1]];
  const [, , w, h] = reitti.kartta.viewBox.split(" ").map(Number);
  // Vaalea kartta myös tummassa herossa (malli 6c: kartta on se vaalea elementti).
  return (
    <div className="rh-kartta" style={{ aspectRatio: `${w} / ${h}` }} aria-hidden="true">
      <svg viewBox={reitti.kartta.viewBox} preserveAspectRatio="xMidYMid slice">
        {reitti.kartta.alueet.map((a) => (
          <path key={a.k} d={a.d} className={`kl-alue${a.t ? " kl-alue--tausta" : ""}${paat.some((k) => k.k === a.k) ? " kl-alue--paate" : ""}`} />
        ))}
      </svg>
      {paat.map((k, i) => <Merkki key={k.k} kunta={k} laji={i ? "maali" : "lahto"} muoto={peli.tunnus} toinen={paat[1 - i]} />)}
    </div>
  );
}

/** Aluevalinta (CD 3c): korvaa natiivin pudotusvalikon. Modaali dialogi: mobiilissa alapaneeli
    (2 saraketta), desktopilla 4 sarakkeen ruudukko; kaikki vaihtoehdot kerralla, valinta ≥ 44 px.
    Valittu oranssilla (lime vain Aloitukselle). Esc ja taustan napautus sulkevat, fokus palaa nappiin. */
function AlueValinta({ peli, alueet, valittu, nappi, osoite, kuvaus }: {
  peli: Peli; alueet: Array<{ nimi: string; tunnus: string }>; valittu: string | null; nappi: string;
  osoite: (tunnus: string | null) => string; kuvaus?: string;
}) {
  const ikkuna = useRef<HTMLDialogElement>(null);
  const sulje = () => ikkuna.current?.close();
  const vaihtoehto = (nimi: string, tunnus: string | null, kaikki = false) => (
    <li key={tunnus ?? "kaikki"} className={kaikki ? "rv-kaikki" : undefined}>
      <a href={osoite(tunnus)} aria-current={valittu === tunnus ? "true" : undefined}>
        {valittu === tunnus && <Ikoni d={IKONI.ok} w={3} />}
        {nimi}
      </a>
    </li>
  );
  return (
    <>
      <button type="button" className="rv-nappi" aria-haspopup="dialog" aria-describedby={kuvaus} onClick={() => ikkuna.current?.showModal()}>
        {nappi}
        <Ikoni d="M6 9l6 6 6-6" w={2.4} />
      </button>
      <dialog ref={ikkuna} className="rv" aria-labelledby="rv-h" onClick={(e) => { if (e.target === ikkuna.current) sulje(); }}>
        <div className="rv-sisus">
          <div className="rv-yla">
            <h2 id="rv-h">Valitse alue</h2>
            <button type="button" className="rv-sulje" aria-label="Sulje" onClick={sulje}><Ikoni d={IKONI.bad} w={2.4} /></button>
          </div>
          <ul className="rv-lista">
            {vaihtoehto(peli.kaikki, null, true)}
            {alueet.map((m) => vaihtoehto(m.nimi, m.tunnus))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
