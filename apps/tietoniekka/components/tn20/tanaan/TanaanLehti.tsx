"use client";
// TÄNÄÄN · PÄIVÄN VISA 7+1 — lehti (CD Main.dc.html, konsepti A "sivunkääntö"; toteutusbrief 22.11.2026, vaihe 1).
// Yksi juttu per ruutu: osasto, juttu, kysymys ja neljä vaihtoehtoa. Vastaus lukittuu ensimmäisestä napautuksesta,
// sen jälkeen selitys, lähde ja jatkokortti (ei linkki pelin aikana, tallentuu tulosnäkymään) sekä alapalkin nappi.
// Pyyhkäisy vasemmalle = Seuraava, vain vastatulla sivulla. Sivut 1–7 → Päivän pähkinä → tulos.
// Kesken jäänyt lehti jatkuu samalta sivulta; pelattu päivä avautuu tulokseen (ei uutta kierrosta).
// Pelipalkki on pelikehyksen yhteinen (kerma-iho); designin oma X-palkki korvattu sillä.
// Vaihe 3 (CD Aukeama.dc.html): jutulla voi olla pitkä uutisteksti. Mobiilissa se on oma uutissivu ("Kysymykseen"),
// ja kysymyssivulla otsikko kertauksena ja "Juttu" palaa takaisin. Desktopilla (≥ 1024 px) jokainen juttu on aukeama:
// juttu vasemmalla, kysymys oikealla. Sivunumero pysyy jutun numerona molemmilla sivuilla.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import { kirjaaPelimuotoPeli } from "@/lib/pelimuotoPelit";
import { lueEteneminen, luePutki, paivitaPutki, tallennaEteneminen } from "@/lib/tanaan/tallennus";
import type { Eteneminen, Juttu, Lehti, PahkinanTila } from "@/lib/tanaan/tyypit";
import Pahkina, { Nuoli } from "./Pahkina";
import Tulos from "./Tulos";
import Kansi from "./Kansi";
import "./tanaan.css";

const KIRJAIMET = "ABCD";
const VIIKONPAIVAT = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];

function paivays(pvm: string) {
  const [y, m, d] = pvm.split("-").map(Number);
  const vp = VIIKONPAIVAT[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return { lyhyt: `${vp.slice(0, 2).toLowerCase()} ${d}.${m}.`, pitka: `${vp} ${d}.${m}.${y}` };
}

const tyhja = (): Eteneminen => ({ valinnat: Array(7).fill(null), sivu: 0, pahkina: null, valmis: false });

/** Pisin sana (merkkeinä) otsikon koon laskuun: suomen sanat eivät katkea keskeltä (KORTTISÄÄNTÖ). */
const pisinSana = (t: string) => Math.max(...t.split(/[\s\-–]+/).map((w) => w.length));

type Osa = "uutinen" | "visa";

/** Uutistekstin kuva: tekstin oma kuva (vaaka/pysty) tai jutun kuva pystykuvana. */
function tekstinKuva(j: Juttu): { src: string; alt: string; muoto: "vaaka" | "pysty" } | null {
  const t = j.teksti;
  if (t?.kuva) return { src: t.kuva, alt: t.kuva_alt ?? "", muoto: t.kuva_muoto ?? "vaaka" };
  if (j.kuva) return { src: j.kuva, alt: j.kuvaAlt ?? "", muoto: "pysty" };
  return null;
}

export default function TanaanLehti({ lehti, julkaisija, arkisto, jakoPolku }: {
  lehti: Lehti;
  julkaisija: string;
  /** Menneen päivän lehti (arkisto). */
  arkisto: boolean;
  /** Jaettava polku (/paivan-visa/tanaan tai esikatselussa ?pvm=…). */
  jakoPolku: string;
}) {
  const [e, setE] = useState<Eteneminen>(tyhja);
  const [ladattu, setLadattu] = useState(false);
  const [palaute, setPalaute] = useState<number | null>(null);
  const [kaanto, setKaanto] = useState<"a" | "b">("a");
  const [putki, setPutki] = useState(0);
  const [jakoUrl, setJakoUrl] = useState<string | null>(null);
  /* Kansi (vaihe 2): lehden ensimmäinen ruutu pelaamattomalle ja pelatulle päivälle; kesken jäänyt jatkuu sivulta.
     Palvelin piirtää kannen heti (LCP), selain siirtyy sivulle, jos lehti on kesken. */
  const [kannessa, setKannessa] = useState(!!lehti.kansi);
  /* Vaihe 3: mobiilissa tekstillinen juttu on kaksi sivua (uutinen → visa); desktopilla aukeama. */
  const osaSivulle = useCallback((s: number, valinnat: Array<number | null>): Osa =>
    s < lehti.jutut.length && lehti.jutut[s].teksti && valinnat[s] == null ? "uutinen" : "visa", [lehti.jutut]);
  const [osa, setOsa] = useState<Osa>(() => (lehti.jutut[0]?.teksti ? "uutinen" : "visa"));
  const [leve, setLeve] = useState(false);
  const otsikkoRef = useRef<HTMLElement | null>(null);
  const vierRef = useRef<HTMLDivElement | null>(null);
  const kosketus = useRef<number | null>(null);
  const siirretty = useRef(false);
  const n = lehti.jutut.length;
  const pv = paivays(lehti.pvm);

  useEffect(() => {
    const t = lueEteneminen(lehti.pvm);
    if (t) setE(t.valmis ? { ...t, sivu: n + 1 } : t);
    if (t && !t.valmis) setOsa(osaSivulle(t.sivu, t.valinnat));
    const aloitettu = !!t && (t.sivu > 0 || t.valinnat.some((v) => v != null));
    if (aloitettu && !t.valmis) setKannessa(false);
    setPutki(luePutki(lehti.pvm));
    setJakoUrl(`${location.origin}${jakoPolku}`);
    setLadattu(true);
  }, [lehti.pvm, n, jakoPolku, osaSivulle]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const f = () => setLeve(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  const paivita = useCallback((uusi: Eteneminen) => {
    setE(uusi);
    tallennaEteneminen(lehti.pvm, uusi);
  }, [lehti.pvm]);

  /* Sivun vaihtuessa: vieritys ylös ja fokus otsikkoon (ruudunlukija kuulee uuden sivun). */
  useEffect(() => {
    if (!siirretty.current) return;
    vierRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
    otsikkoRef.current?.focus({ preventScroll: true });
  }, [e.sivu, kannessa, osa]);

  const sivu = e.sivu;
  const juttu = sivu < n ? lehti.jutut[sivu] : null;
  const valinta = juttu ? e.valinnat[sivu] : null;
  const vastattu = valinta != null;

  function valitse(i: number) {
    if (!juttu || vastattu || e.valmis) return;
    const valinnat = e.valinnat.slice();
    valinnat[sivu] = i;
    setPalaute(sivu);
    paivita({ ...e, valinnat });
    // Selitys näkyviin vastauksen alle (ei koko sivun hyppäystä).
    setTimeout(() => {
      const el = document.querySelector(".tv-sel");
      const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      el?.scrollIntoView({ block: "nearest", behavior: rm ? "auto" : "smooth" });
    }, 60);
  }

  function seuraava() {
    if (sivu >= n || !vastattu) return;
    siirretty.current = true;
    setPalaute(null);
    setKaanto((k) => (k === "a" ? "b" : "a"));
    setOsa(osaSivulle(sivu + 1, e.valinnat));
    paivita({ ...e, sivu: sivu + 1 });
  }

  /* Mobiili: uutissivulta kysymykseen ja takaisin juttuun (sivunumero ei muutu). */
  function vaihdaOsa(uusi: Osa) {
    if (!juttu?.teksti || leve || uusi === osa) return;
    siirretty.current = true;
    setKaanto((k) => (k === "a" ? "b" : "a"));
    setOsa(uusi);
  }

  function pahkinaValmis(tila: PahkinanTila) {
    siirretty.current = true;
    setKaanto((k) => (k === "a" ? "b" : "a"));
    const ensimmainen = !e.valmis;
    const uusi = { ...e, sivu: n + 1, pahkina: tila, valmis: true };
    paivita(uusi);
    if (!ensimmainen) return;
    // Arkistolehti ei kasvata putkea (putki = peräkkäiset päivät omana päivänään).
    if (!arkisto) setPutki(paivitaPutki(lehti.pvm));
    const oikein = lehti.jutut.filter((j, i) => uusi.valinnat[i] === j.oikea).length;
    void kirjaaPelimuotoPeli({ pelimuoto: "tanaan", avain: lehti.pvm, taso: tila, oikein, yhteensa: n });
  }

  /* Ohitettu pähkinä: tulosnäkymästä takaisin pähkinään. Tulos päivittyy, kun pähkinä ratkeaa. */
  function ratkaisePahkina() {
    siirretty.current = true;
    setKaanto((k) => (k === "a" ? "b" : "a"));
    paivita({ ...e, sivu: n });
  }

  const tila = sivu < n ? `${sivu + 1}/${n}` : sivu === n ? "+1" : undefined;
  // Nimiö sivulla 1 vain ilman kantta (kansi toistaisi sen, brief luku 3).
  const ensimmainen = sivu === 0 && !lehti.kansi;

  function avaaLehti() {
    siirretty.current = true;
    setKaanto((k) => (k === "a" ? "b" : "a"));
    setKannessa(false);
  }

  if (kannessa && lehti.kansi) {
    const oikein = lehti.jutut.filter((j, i) => e.valinnat[i] === j.oikea).length;
    const leima = e.valmis
      ? `${oikein}/${n} ${e.pahkina === "ok" ? "+ pähkinä ✓" : e.pahkina === "fail" ? "· pähkinä ✗" : "· pähkinä auki"}`
      : null;
    return (
      <div className="tv" data-iho="kerma" data-sivu="kansi">
        <h1 className="tv-sr">Päivän visa · Tänään {pv.lyhyt} · päivän lehden kansi</h1>
        {/* Kannella nimiö ja päiväys ovat jo kannessa: palkissa vain pelin nimi (ei toistoa). */}
        <Pelipalkki peli="Päivän visa" iho="tumma" pelissa koti={{ href: "/", nimi: "Etusivu" }} />
        <main id="main" className="tv-kn-runko">
          <Kansi
            kansi={lehti.kansi}
            pvLyhyt={pv.lyhyt}
            juhla={lehti.juhla}
            julkaisija={julkaisija}
            arkisto={arkisto}
            luonnos={lehti.luonnos}
            leima={leima}
            onPelaa={avaaLehti}
            onVastaukset={avaaLehti}
          />
        </main>
      </div>
    );
  }

  // Mobiili: tekstillisen jutun uutissivu ja kysymyssivu (otsikko kertauksena). Desktopilla aina aukeama.
  const uutissivu = !leve && !!juttu?.teksti && osa === "uutinen";
  const kertaus = !leve && !!juttu?.teksti && osa === "visa";
  const seuraavaTeksti = sivu < n - 1 ? "Seuraava sivu" : "Päivän pähkinä";
  // Desktopilla pystykuva otsikon viereen (kahden palstan tekstissä kelluva kuva jättäisi kapean rivin);
  // lyhyellä jutulla jutun oma kuva.
  const tk = juttu ? tekstinKuva(juttu) : null;
  const otsikkoKuva = !juttu ? null : juttu.teksti ? (tk?.muoto === "pysty" ? tk : null)
    : juttu.kuva ? { src: juttu.kuva, alt: juttu.kuvaAlt ?? "" } : null;

  const nimio = ensimmainen && (
    <header className="tv-mh">
      <div className="tv-mh-pub">{julkaisija}{arkisto && <span className="tv-mh-ark">Arkisto</span>}{lehti.luonnos && <span className="tv-mh-ark">Luonnos</span>}</div>
      <div className="tv-mh-r" />
      <div className="tv-mh-name" aria-hidden="true">TÄNÄÄN</div>
      <div className="tv-mh-r b" />
      <div className="tv-mh-meta"><span>{pv.pitka}</span>{lehti.juhla && <span>{lehti.juhla}</span>}</div>
    </header>
  );
  const otsikko = juttu && (
    <h2 className="tv-jt" tabIndex={-1} ref={(el) => { otsikkoRef.current = el; }}>{juttu.juttu}</h2>
  );
  const kysymys = juttu && (
    <>
      <p className="tv-q" id="tv-kys">{juttu.kysymys}</p>
      <div className="tv-opts" role="group" aria-labelledby="tv-kys">
        {juttu.vaihtoehdot.map((t, i) => {
          let cls = "", merkki = "", aria = `${KIRJAIMET[i]}: ${t}`;
          if (vastattu) {
            if (i === juttu.oikea) { cls = "ok" + (i === valinta && palaute === sivu ? " pop" : ""); merkki = "✓"; aria += ", oikea vastaus"; }
            else if (i === valinta) { cls = "no" + (palaute === sivu ? " shake" : ""); merkki = "✗"; aria += ", valintasi, väärin"; }
            else cls = "dim";
          }
          return (
            <button key={i} type="button" className={`tv-opt ${cls}`} onClick={() => valitse(i)} aria-label={aria} aria-disabled={vastattu || undefined}>
              <span className="tv-ol" aria-hidden="true">{KIRJAIMET[i]}</span>
              <span className="tv-ot">{t}</span>
              <span className="tv-mk" aria-hidden="true">{merkki}</span>
            </button>
          );
        })}
      </div>
      {vastattu && (
        <div className="tv-sel" role="status">
          <span className="tv-sr">{valinta === juttu.oikea ? "Oikein." : `Väärin. Oikea vastaus: ${juttu.vaihtoehdot[juttu.oikea]}.`}</span>
          <p>{juttu.selitys}</p>
          {(juttu.lahde || juttu.jatko) && (
            <div className="tv-sel-meta">
              {juttu.lahde && <span className="tv-src">Lähde: {juttu.lahde}</span>}
              {juttu.jatko && (
                <span className="tv-jatko">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
                  <span><span className="tv-sr">Tallennettu tulokseen: </span>{juttu.jatko.teksti}</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="tv" data-iho="kerma" data-sivu={sivu < n ? "juttu" : sivu === n ? "pahkina" : "tulos"}>
      <h1 className="tv-sr">Päivän visa · Tänään {pv.lyhyt}</h1>
      <Pelipalkki peli="Päivän visa" muunnelma={pv.lyhyt} iho="kerma" tila={tila} pelissa={sivu <= n} koti={{ href: "/", nimi: "Etusivu" }} />
      {sivu <= n && (
        <div className="tv-prog" aria-hidden="true">
          {Array.from({ length: n + 1 }, (_, i) => (
            <span key={i} className={`tv-seg${i < sivu ? " done" : i === sivu ? " cur" : ""}${i === n ? " nut" : ""}`} />
          ))}
        </div>
      )}
      <main id="main" className="tv-body">
        <div
          className="tv-col"
          ref={vierRef}
          onPointerDown={(ev) => { kosketus.current = ev.clientX; }}
          onPointerUp={(ev) => {
            if (kosketus.current == null) return;
            const dx = ev.clientX - kosketus.current;
            kosketus.current = null;
            if (leve) return;
            if (dx < -60) { if (uutissivu) vaihdaOsa("visa"); else if (vastattu) seuraava(); }
            else if (dx > 60 && kertaus) vaihdaOsa("uutinen");
          }}
        >
          {/* Ennen latausta (localStorage) ei näytetä mitään pelattavaa, jotta pelattu päivä ei välähdä sivulla 1. */}
          {!ladattu ? (
            <div className="tv-pg" aria-busy="true" />
          ) : juttu && leve ? (
            <div className={`tv-turn t-${kaanto}`} key={`s${sivu}`}>
              {nimio}
              <div className="tv-au">
                <article
                  className={`tv-au-l${juttu.teksti ? "" : " lyhyt"}`}
                  style={{ "--lw": pisinSana(juttu.juttu) } as CSSProperties}
                >
                  <div className="tv-kick">{juttu.osasto}</div>
                  {/* Pystykuva kelluu otsikon oikealla puolella (myös mobiilissa): pitkä sana siirtyy kuvan alle eikä pienennä otsikkoa. */}
                  {otsikkoKuva && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="tv-kuva" src={otsikkoKuva.src} alt={otsikkoKuva.alt} width={150} height={184} />
                  )}
                  {otsikko}
                  {juttu.teksti && <Uutisteksti juttu={juttu} pystyTekstissa={false} />}
                </article>
                <section className="tv-au-r" aria-label="Kysymys">
                  <div className="tv-kick">Kysymys</div>
                  {kysymys}
                  {vastattu && (
                    <div className="tv-au-next">
                      <button type="button" className="tv-cta" onClick={seuraava}>{seuraavaTeksti} <Nuoli /></button>
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : juttu && uutissivu ? (
            <article className={`tv-pg tv-turn t-${kaanto}`} key={`s${sivu}-u`} style={{ "--lw": pisinSana(juttu.juttu) } as CSSProperties}>
              {nimio}
              <div className="tv-kick">{juttu.osasto}</div>
              {otsikko}
              <Uutisteksti juttu={juttu} pystyTekstissa />
            </article>
          ) : juttu ? (
            <article className={`tv-pg tv-turn t-${kaanto}`} key={`s${sivu}-v`} style={{ "--lw": pisinSana(juttu.juttu) } as CSSProperties}>
              {!kertaus && nimio}
              <div className="tv-kick">{juttu.osasto}</div>
              {kertaus ? (
                <h2 className="tv-au-recap" tabIndex={-1} ref={(el) => { otsikkoRef.current = el; }}>{juttu.juttu}</h2>
              ) : (
                <>
                  {juttu.kuva && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="tv-kuva" src={juttu.kuva} alt={juttu.kuvaAlt ?? ""} width={84} height={104} />
                  )}
                  {otsikko}
                </>
              )}
              {kysymys}
            </article>
          ) : sivu === n ? (
            <div className={`tv-pg tv-turn t-${kaanto}`} key="pahkina">
              <Pahkina data={lehti.pahkina} pvm={lehti.pvm} onValmis={pahkinaValmis} />
            </div>
          ) : (
            <div className={`tv-turn t-${kaanto}`} key="tulos">
              <Tulos lehti={lehti} valinnat={e.valinnat} pahkina={e.pahkina} putki={putki} arkisto={arkisto} onRatkaise={ratkaisePahkina} jakoUrl={jakoUrl} />
            </div>
          )}
        </div>
      </main>
      {ladattu && juttu && !leve && (uutissivu || kertaus || vastattu) && (
        <div className="tv-foot">
          <div className="tv-foot-in">
            {kertaus && <button type="button" className="tv-sec" onClick={() => vaihdaOsa("uutinen")}>Juttu</button>}
            {uutissivu ? (
              <button type="button" className="tv-cta" onClick={() => vaihdaOsa("visa")}>Kysymykseen <Nuoli /></button>
            ) : vastattu && (
              <button type="button" className="tv-cta" onClick={seuraava}>{seuraavaTeksti} <Nuoli /></button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Pitkä uutisteksti: vaakakuva, ingressi ja 2–3 kappaletta. Pystykuva kelluu tekstissä mobiilissa;
 *  desktopilla se on otsikon vieressä (pystyTekstissa false). */
function Uutisteksti({ juttu, pystyTekstissa }: { juttu: Juttu; pystyTekstissa: boolean }) {
  const t = juttu.teksti!;
  const kuva = tekstinKuva(juttu);
  return (
    <>
      {kuva?.muoto === "vaaka" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tv-au-img vaaka" src={kuva.src} alt={kuva.alt} width={800} height={400} decoding="async" />
      )}
      <p className="tv-au-ing">{t.ingressi}</p>
      <div className="tv-au-teksti">
        {kuva?.muoto === "pysty" && pystyTekstissa && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="tv-au-img pysty" src={kuva.src} alt={kuva.alt} width={112} height={140} decoding="async" />
        )}
        {t.kappaleet.map((k, i) => <p key={i} className="tv-au-p">{k}</p>)}
      </div>
    </>
  );
}
