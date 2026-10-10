"use client";
// LASTEN VISAT — pelinäkymä (TOTEUTUSBRIEF_LASTEN_VISAT.md §4–5, design v0.3 "studiopöytä" 2a–2n, 9.10.2026).
//
// Pienet (4–7): juontajapari pöydän takana koko ajan, 3 kuvavastausta allekkain (rivi 100 px), ei pisteitä,
// ei väärä-merkintää, tähtiä aina 3, Tiesitkö luetaan ääneen. Isommat (8–12, vaihe 3): hero-intro, kysymyskuva,
// kasvot vihjenapeissa, 3 vihjelamppua per visa (saman juontajan vihje samaan kysymykseen ei kuluta), oikea vihreä
// #2e7d52 + ✓, reaktio + Tiesitkö tekstinä samassa kortissa, tähdet 3 = ≥ 80 %, 2 = ≥ 50 %, 1 = muuten.
//
// Ääni (design-päätökset + äänivisan iPhone-opit 9.10.2026):
//   * Yksi audio-elementti koko visan ajan, vain src vaihtuu. Ensimmäinen ääni (intro + kysymys 1) käynnistetään
//     synkronisesti Aloita-napautuksessa, jolloin iOS avaa äänen samalla napautuksella.
//   * Uusi ääni katkaisee edellisen. Vastaaminen, vihje, ■ ja Seuraava katkaisevat puheen heti.
//   * Klipit ketjutetaan ended-tapahtumasta (intro → kysymys, reaktio → Tiesitkö). Tila päivittyy
//     playing-tapahtumasta, ei play()-lupauksesta.
//   * Seuraavan kysymyksen klippi ladataan etukäteen. Eläinääni soitetaan kerran omasta napistaan omalla
//     elementillään (ei looppia).
//   * Äänipalkit ovat CSS-animaatio eivätkä Web Audio -analyysi: AudioContextin kautta reititetty ääni voi
//     mykistyä iPhonella keskeytyksen jälkeen, joten luotettavuus menee visuaalisen tarkkuuden edelle.
//   * Ääni pois: kuplat ilmestyvät heti ilman puhetilaa. Valinta muistetaan laitteella.
// Väärä vastaus: ei punaista eikä rastia (koskee vain lasten visoja). Valittu himmenee katkoviivaksi,
// oikea korostuu kultaisena ⭐:llä.
import { useCallback, useEffect, useRef, useState } from "react";
import type { LastenKortti, LastenKysymys, LastenVisa } from "@/lib/lapset/data";
import { arvoKlippi, valijuontoUrl, VALIJUONNOT, type Juontaja } from "@/lib/lapset/valijuonnot";
import { IKA_MERKKI, JUONTAJA_ABL, JUONTAJA_NIMI, LASTEN_AIHEET, juontajaKuvat, type Tunnelma } from "@/lib/lapset/juontajat";
import { getSupabase } from "@/lib/supabase";

type Vaihe = "intro" | "peli" | "tulos";
type Laji = "intro" | "kysymys" | "vihje" | "vinkit-loppu" | "reaktio" | "viimeinen" | "tiesitko" | "tulos";
type Klippi = { url: string | null; kuka: Juontaja; laji: Laji; teksti?: string | null };
type Kupla = { kuka: Juontaja; teksti: string; laji: Laji };

const AANI_AVAIN = "tn_lapset_aani";
const TIESITKO_VIIVE = 1400;
/** Isommat: 3 vihjelamppua per visa (saman juontajan vihje samaan kysymykseen uudestaan ei kuluta). */
const LAMPPUJA = 3;

function Palkit({ pieni = false }: { pieni?: boolean }) {
  return (
    <span className={pieni ? "lp-palkit lp-palkit--pieni" : "lp-palkit"} aria-hidden="true">
      <i /><i /><i /><i /><i />
    </span>
  );
}

function sessionId(): string {
  try {
    let id = window.localStorage.getItem("tn_session_id");
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem("tn_session_id", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export default function LastenPeli({ visa, muut, takaisin }: { visa: LastenVisa; muut: LastenKortti[]; takaisin: string }) {
  const { kysymykset, lukija } = visa;
  const N = kysymykset.length;
  const pienet = visa.ika === "4-7";
  const kuvat = juontajaKuvat(visa.aihe);
  const aihe = visa.aihe ? LASTEN_AIHEET[visa.aihe] : null;
  /** Luontoerä: pöydän reuna ja aksentti metsänvihreä #2F6B45 (design 2l); joulu pysyy kultaisena. */
  const luontoAksentti = visa.kokoelma === "luonto";

  const [vaihe, setVaihe] = useState<Vaihe>("intro");
  const [qi, setQi] = useState(0);
  const [valittu, setValittu] = useState<number | null>(null);
  const [tiesitko, setTiesitko] = useState(false);
  const [oikeita, setOikeita] = useState(0);
  const [puhe, setPuhe] = useState<Klippi | null>(null);
  const [kupla, setKupla] = useState<Kupla | null>(null);
  const [aani, setAani] = useState(true);
  const [elainSoi, setElainSoi] = useState(false);
  const [elainT, setElainT] = useState(0);
  const [elainSoitettu, setElainSoitettu] = useState(false);
  const [jaettu, setJaettu] = useState<string | null>(null);
  const [lamput, setLamput] = useState(LAMPPUJA);
  const [kysytyt, setKysytyt] = useState<string[]>([]);
  const [tulokset, setTulokset] = useState<(boolean | null)[]>(() => kysymykset.map(() => null));
  const [reaktio, setReaktio] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const elainRef = useRef<HTMLAudioElement | null>(null);
  const ennakkoRef = useRef<HTMLAudioElement | null>(null);
  const jonoRef = useRef<Klippi[]>([]);
  const nykyinenRef = useRef<Klippi | null>(null);
  const aaniRef = useRef(true);
  const edellinenReaktio = useRef<string | null>(null);
  const tiesitkoAjastin = useRef<number | null>(null);
  const tallennettu = useRef(false);
  const elainRaf = useRef<number | null>(null);

  const k: LastenKysymys | undefined = kysymykset[qi];
  const vastattu = valittu != null;

  useEffect(() => {
    try {
      if (localStorage.getItem(AANI_AVAIN) === "0") { setAani(false); aaniRef.current = false; }
    } catch { /* ei tallennusta */ }
    return () => {
      audioRef.current?.pause();
      elainRef.current?.pause();
      if (tiesitkoAjastin.current) window.clearTimeout(tiesitkoAjastin.current);
    };
  }, []);

  /* ── Äänimoottori ─────────────────────────────────────────────── */
  const aloitaKlippi = useCallback((kl: Klippi) => {
    nykyinenRef.current = kl;
    const naytaKupla = kl.teksti && kl.laji !== "kysymys" && kl.laji !== "tiesitko";
    setKupla(naytaKupla ? { kuka: kl.kuka, teksti: kl.teksti!, laji: kl.laji } : null);
    if (!kl.url) { seuraavaKlippi(); return; }
    const a = audioRef.current!;
    a.src = kl.url;
    try { a.currentTime = 0; } catch { /* metatiedot latautumatta */ }
    const lupaus = a.play();
    if (lupaus) lupaus.catch(() => { nykyinenRef.current = null; setPuhe(null); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seuraavaKlippi = useCallback(() => {
    const seur = jonoRef.current.shift();
    if (seur) aloitaKlippi(seur);
    else { nykyinenRef.current = null; setPuhe(null); }
  }, [aloitaKlippi]);

  const audio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const a = new Audio();
    a.preload = "auto";
    a.setAttribute("playsinline", "");
    a.addEventListener("playing", () => setPuhe(nykyinenRef.current));
    a.addEventListener("ended", () => seuraavaKlippi());
    a.addEventListener("error", () => seuraavaKlippi());
    audioRef.current = a;
    return a;
  }, [seuraavaKlippi]);

  /** Soittaa klipit järjestyksessä. Kutsutaan suoraan napautuksesta (synkroninen play iOS:lle). */
  const soita = useCallback((klipit: Klippi[]) => {
    elainRef.current?.pause();
    setElainSoi(false);
    const a = audio();
    a.pause();
    if (!aaniRef.current) {
      // Ääni pois: kupla heti ilman puhetilaa (viimeinen kuplallinen klippi jää näkyviin).
      jonoRef.current = [];
      nykyinenRef.current = null;
      setPuhe(null);
      const viimeinen = [...klipit].reverse().find((kl) => kl.teksti && kl.laji !== "kysymys" && kl.laji !== "tiesitko");
      setKupla(viimeinen ? { kuka: viimeinen.kuka, teksti: viimeinen.teksti!, laji: viimeinen.laji } : null);
      return;
    }
    jonoRef.current = klipit.slice(1);
    if (klipit[0]) aloitaKlippi(klipit[0]);
  }, [audio, aloitaKlippi]);

  const vaikene = useCallback(() => {
    jonoRef.current = [];
    nykyinenRef.current = null;
    audioRef.current?.pause();
    setPuhe(null);
  }, []);

  const ennakoi = (url: string | null) => {
    if (!url) return;
    if (!ennakkoRef.current) ennakkoRef.current = new Audio();
    ennakkoRef.current.preload = "auto";
    ennakkoRef.current.src = url;
    ennakkoRef.current.load();
  };

  /* ── Klipit ───────────────────────────────────────────────────── */
  const valijuonto = (tyyppi: string, laji: Laji): Klippi | null => {
    const avain = arvoKlippi(tyyppi, lukija, tyyppi === "oikein" || tyyppi === "melkein" || tyyppi === "vaarin" ? edellinenReaktio.current : null);
    if (!avain) return null;
    if (laji === "reaktio") edellinenReaktio.current = avain;
    return { url: valijuontoUrl(avain), kuka: lukija, laji, teksti: VALIJUONNOT[avain] };
  };
  const kysymysKlippi = (i: number): Klippi | null => {
    const q = kysymykset[i];
    return q?.audio.kysymys ? { url: q.audio.kysymys, kuka: lukija, laji: "kysymys", teksti: q.teksti } : null;
  };
  const kysymyksenKlipit = (i: number): Klippi[] => {
    const lista: Klippi[] = [];
    if (i === N - 1 && N > 1) { const v = valijuonto("viimeinen", "viimeinen"); if (v) lista.push(v); }
    const kk = kysymysKlippi(i);
    if (kk) lista.push(kk);
    return lista;
  };

  /* ── Toiminnot ────────────────────────────────────────────────── */
  const aloitaVisa = () => {
    // Synkroninen play samassa napautuksessa: avaa iOS:n äänen ja soittaa intron + kysymyksen 1.
    audio();
    setQi(0);
    setValittu(null);
    setTiesitko(false);
    setOikeita(0);
    setLamput(LAMPPUJA);
    setKysytyt([]);
    setTulokset(kysymykset.map(() => null));
    setReaktio(null);
    tallennettu.current = false;
    setVaihe("peli");
    const intro = valijuonto(`intro-${pienet ? "pienet" : "isommat"}`, "intro");
    soita([...(intro ? [intro] : []), ...kysymyksenKlipit(0)]);
    ennakoi(kysymykset[1]?.audio.kysymys ?? null);
    window.scrollTo({ top: 0 });
  };

  const kuunteleUudelleen = () => {
    if (puhe?.laji === "kysymys") { vaikene(); return; }
    const kk = k ? kysymysKlippi(qi) : null;
    if (!kk) return;
    // Nimenomainen napautus soittaa myös, kun ääni on pois.
    const oli = aaniRef.current;
    aaniRef.current = true;
    soita([kk]);
    aaniRef.current = oli;
  };

  const kysyVihje = (kuka: Juontaja) => {
    if (!k || vastattu) return;
    if (puhe?.laji === "vihje" && puhe.kuka === kuka) { vaikene(); return; }
    const teksti = k.vihje[kuka];
    if (!teksti) return;
    if (!pienet) {
      // Isommat: lamppu kuluu vain uudesta vihjeestä; loppuneista kertoo visan lukija.
      const avain = `${qi}:${kuka}`;
      if (!kysytyt.includes(avain)) {
        if (lamput <= 0) {
          const loppu = valijuonto("vinkit-loppu", "vinkit-loppu");
          if (loppu) soita([loppu]);
          return;
        }
        setLamput((n) => n - 1);
        setKysytyt((l) => [...l, avain]);
      }
    }
    soita([{ url: kuka === "laura" ? k.audio.vihje_laura : k.audio.vihje_mikko, kuka, laji: "vihje", teksti }]);
  };

  const vastaa = (i: number) => {
    if (!k || vastattu) return;
    const ok = k.vastaukset[i]?.oikein ?? false;
    setValittu(i);
    if (ok) setOikeita((n) => n + 1);
    setTulokset((t) => t.map((x, j) => (j === qi ? ok : x)));
    const reaktioKlippi = valijuonto(ok ? "oikein" : pienet ? "melkein" : "vaarin", "reaktio");
    setReaktio(reaktioKlippi?.teksti ?? null);
    if (!pienet) {
      // Isommat: reaktio kuuluu ääneen, mutta teksti on Tiesitkö-kortissa (ei kuplaa); Tiesitkö vain tekstiä.
      soita(reaktioKlippi ? [{ ...reaktioKlippi, teksti: null }] : []);
      setTiesitko(true);
      return;
    }
    const lista: Klippi[] = reaktioKlippi ? [reaktioKlippi] : [];
    if (k.audio.tiesitko && k.tiesitko) lista.push({ url: k.audio.tiesitko, kuka: lukija, laji: "tiesitko", teksti: k.tiesitko });
    soita(lista);
    if (tiesitkoAjastin.current) window.clearTimeout(tiesitkoAjastin.current);
    tiesitkoAjastin.current = window.setTimeout(() => setTiesitko(true), TIESITKO_VIIVE);
  };

  const tallennaPeli = async (oikein: number) => {
    if (tallennettu.current || !visa.julkaistu) return; // luonnoksia (esikatselu) ei tilastoida
    tallennettu.current = true;
    try {
      const sb = getSupabase();
      if (!sb) return;
      await sb.from("quiz_plays").insert({
        id: crypto.randomUUID(), quiz_id: visa.id, platform: "tietoniekka", score: oikein, total: N,
        session_id: sessionId(), shared: false,
      });
    } catch { /* best-effort */ }
  };

  const seuraava = () => {
    if (tiesitkoAjastin.current) window.clearTimeout(tiesitkoAjastin.current);
    if (qi + 1 < N) {
      const i = qi + 1;
      setQi(i);
      setValittu(null);
      setTiesitko(false);
      setReaktio(null);
      setElainT(0);
      setElainSoitettu(false);
      soita(kysymyksenKlipit(i));
      ennakoi(kysymykset[i + 1]?.audio.kysymys ?? null);
      window.scrollTo({ top: 0 });
      return;
    }
    setVaihe("tulos");
    setValittu(null);
    setTiesitko(false);
    const tyyppi = pienet ? "tulos-pienet" : oikeita >= 8 ? "tulos-hyva" : oikeita >= 5 ? "tulos-keski" : "tulos-heikko";
    const t = valijuonto(tyyppi, "tulos");
    soita(t ? [t] : []);
    void tallennaPeli(oikeita);
    window.scrollTo({ top: 0 });
  };

  const vaihdaAani = () => {
    const uusi = !aaniRef.current;
    aaniRef.current = uusi;
    setAani(uusi);
    try { localStorage.setItem(AANI_AVAIN, uusi ? "1" : "0"); } catch { /* ei tallennusta */ }
    if (!uusi) vaikene();
  };

  /** Eläinääni (design 2l): oma soitin, ei soi itsestään; soi kerran (tiedostossa ääni on kahdesti).
   *  Edistyminen currentTime-arvosta ja datan kestosta, animaatio playing-tapahtumasta (iPhone-oppi). */
  const lopetaElainSeuranta = () => {
    if (elainRaf.current != null) cancelAnimationFrame(elainRaf.current);
    elainRaf.current = null;
  };
  const soitaElainaani = () => {
    if (!k?.elainaani) return;
    const e = elainRef.current ?? new Audio();
    elainRef.current = e;
    if (!e.paused) { e.pause(); lopetaElainSeuranta(); setElainSoi(false); return; }
    vaikene();
    const kesto = k.elainaani.kesto ?? 10;
    const seuraa = () => {
      if (e.paused) { elainRaf.current = null; return; }
      setElainT(Math.min(e.currentTime, kesto));
      elainRaf.current = requestAnimationFrame(seuraa);
    };
    e.onplaying = () => { setElainSoi(true); setElainSoitettu(true); lopetaElainSeuranta(); elainRaf.current = requestAnimationFrame(seuraa); };
    e.onended = () => { lopetaElainSeuranta(); setElainSoi(false); setElainT(kesto); };
    e.onpause = () => { lopetaElainSeuranta(); setElainSoi(false); };
    e.setAttribute("playsinline", "");
    if (!e.src.endsWith(k.elainaani.url)) e.src = k.elainaani.url;
    try { e.currentTime = 0; } catch { /* metatiedot latautumatta */ }
    setElainT(0);
    e.play().catch(() => setElainSoi(false));
  };

  const jaa = async () => {
    const url = `${window.location.origin}/visa/${visa.slug}`;
    const teksti = `Pelasimme ${visa.otsikko} -visan Tietoniekassa. Pelaa sinäkin!`;
    try {
      if (navigator.share) { await navigator.share({ title: visa.otsikko, text: teksti, url }); return; }
    } catch { return; }
    try { await navigator.clipboard.writeText(`${teksti} ${url}`); setJaettu("Linkki kopioitu"); } catch { /* */ }
  };

  /* ── Näkymän osat ─────────────────────────────────────────────── */
  const puhuja = puhe?.kuka ?? null;
  const tunnelma: Tunnelma = vaihe === "tulos" ? "onnittelee" : vaihe === "intro" ? "innoissaan" : vastattu && k?.vastaukset[valittu!]?.oikein ? "innoissaan" : "miettii";

  const ylapalkki = (
    <div className="lp-yla">
      <a className="lp-sulje" href={takaisin} aria-label="Lopeta visa">✕</a>
      {vaihe !== "tulos" && <span className="lp-ika">{IKA_MERKKI[visa.ika]}</span>}
      <span className="lp-tyhja" />
      {!pienet && vaihe === "peli" && (
        <span className="lp-lamput" role="img" aria-label={lamput > 0 ? `${lamput} ${lamput === 1 ? "vihje" : "vihjettä"} jäljellä` : "Vihjeet käytetty"}>
          {Array.from({ length: LAMPPUJA }, (_, i) => <span key={i} data-kaytetty={i >= lamput || undefined} aria-hidden="true">💡</span>)}
          <span className="lp-lamput-t" aria-hidden="true">{lamput > 0 ? `${lamput} ${lamput === 1 ? "vihje" : "vihjettä"}` : "Vihjeet käytetty"}</span>
        </span>
      )}
      <button type="button" className="lp-aani" aria-pressed={aani} onClick={vaihdaAani} aria-label={aani ? "Ääni päällä – mykistä" : "Ääni pois – laita päälle"}>
        <span aria-hidden="true">{aani ? "🔊" : "🔇"}</span>
        <span className="lp-aani-t">{aani ? "Ääni päällä" : "Ääni pois"}</span>
      </button>
    </div>
  );

  /** Juontajakaistale: duokuva kahtena puolikkaana; puhuja täydessä värissä, toinen himmenee. */
  const kaistale = (alapalkki: React.ReactNode, opts: { kupla?: boolean } = {}) => (
    <div className="lp-kaista" data-puhuja={puhuja ?? undefined}>
      <div className="lp-hehku" aria-hidden="true" />
      <div className="lp-duo lp-duo--laura" data-hiljaa={puhuja === "mikko" || undefined} style={{ backgroundImage: `url(${kuvat.duo[tunnelma]})` }} aria-hidden="true" />
      <div className="lp-duo lp-duo--mikko" data-hiljaa={puhuja === "laura" || undefined} style={{ backgroundImage: `url(${kuvat.duo[tunnelma]})` }} aria-hidden="true" />
      {puhuja && (
        <span className="lp-nimilappu" data-kuka={puhuja}><Palkit pieni />{JUONTAJA_NIMI[puhuja]}</span>
      )}
      {opts.kupla !== false && kupla && (
        <div className="lp-kupla" data-kuka={kupla.kuka} data-laji={kupla.laji} data-pitka={kupla.teksti.length > 70 || undefined} role="status" aria-live="polite">
          <div className="lp-kupla-yla">
            <span className="lp-kupla-nimi">{JUONTAJA_NIMI[kupla.kuka]}</span>
            {puhe && puhe.laji === kupla.laji && (
              <button type="button" className="lp-stop" onClick={vaikene} aria-label="Lopeta puhe">■</button>
            )}
          </div>
          <p>{kupla.teksti}</p>
        </div>
      )}
      <div className="lp-ala">{alapalkki}</div>
    </div>
  );

  const avatar = (kuka: Juontaja, puhuu = false) => (
    <span className="lp-i-avatar" data-kuka={kuka} data-puhuu={puhuu || undefined} style={{ backgroundImage: `url(${kuvat.avatar[kuka]})` }} aria-hidden="true" />
  );
  /** Kuvavisan valokuvien tekijätiedot (CC BY/BY-SA vaatii näkyvän merkinnän). Omat kuvitukset: ei merkintää. */
  const kuvaLahteet = (q: LastenKysymys) => [...new Set([q.kuvaKrediitti, ...q.vastaukset.map((v) => v.kuvaKrediitti)].filter((x): x is string => !!x))];
  const kynnys3 = Math.ceil(N * 0.8), kynnys2 = Math.ceil(N * 0.5);
  const tahdet = pienet ? 3 : oikeita >= kynnys3 ? 3 : oikeita >= kynnys2 ? 2 : 1;

  const aika = (sek: number) => `0:${String(Math.floor(sek)).padStart(2, "0")}`;
  /** Äänikortti (design 2l): 104 px nappi + aaltomuoto + aika; kuultu osa vihreänä. */
  const elainKortti = (e: NonNullable<LastenKysymys["elainaani"]>) => {
    const kesto = e.kesto ?? 10;
    const osuus = elainSoitettu ? Math.min(1, elainT / kesto) : 0;
    const palkit = e.aalto.length ? e.aalto : Array.from({ length: 22 }, (_, i) => 0.3 + 0.5 * Math.abs(Math.sin(i * 1.7)));
    return (
      <div className="lp-aanikortti" data-soi={elainSoi || undefined}>
        <button type="button" className="lp-aanikortti-nappi" onClick={soitaElainaani} aria-label={elainSoi ? "Lopeta eläinääni" : "Kuuntele eläinääni"}>
          <span className="lp-aanikortti-ikoni" aria-hidden="true">{elainSoi ? "■" : "▶"}</span>
          <span className="lp-aanikortti-nt">{elainSoi ? "Lopeta" : elainSoitettu ? "Uudelleen" : "Kuuntele"}</span>
        </button>
        <div className="lp-aanikortti-oikea">
          <div className="lp-aalto" aria-hidden="true">
            {palkit.map((h, i) => (
              <span key={i} style={{ height: `${Math.round((0.2 + 0.8 * Math.sqrt(h)) * 100)}%` }} data-kuultu={(i + 0.5) / palkit.length <= osuus || undefined} />
            ))}
          </div>
          <span className="lp-aanikortti-tila" aria-live="polite">
            {elainSoi ? `${aika(elainT)} / ${aika(kesto)}` : elainSoitettu ? "Kuuntele uudelleen, jos haluat" : "Napauta ja kuuntele"}
          </span>
        </div>
      </div>
    );
  };

  /* ── Intro, isommat (2b): hero kuten aikuisilla, ei juontajaparia ── */
  if (vaihe === "intro" && !pienet) {
    return (
      <main className="lp" data-ika={visa.ika} data-aksentti={luontoAksentti ? "luonto" : undefined} data-vaihe="intro">
        <div className="lp-kehys">
          <div className="lp-i-hero">
            {visa.kuva && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={visa.kuva} alt="" />
            )}
            <span className="lp-i-hero-varjo" aria-hidden="true" />
            <div className="lp-i-hero-yla">{ylapalkki}</div>
            <div className="lp-i-hero-ala">
              <span className="lp-ika">{IKA_MERKKI[visa.ika]}</span>
              <h1 className="lp-i-h1">{visa.otsikko}</h1>
            </div>
          </div>
          <div className="lp-i-intro">
            {visa.kuvaus && <p>{visa.kuvaus}</p>}
            <div className="lp-i-lamppukortti">
              <span aria-hidden="true">💡💡💡</span>
              <span>Käytössäsi on {LAMPPUJA} vihjettä. Käytä ne viisaasti!</span>
            </div>
          </div>
          <div className="lp-venyke" />
          <div className="lp-i-aloitus">
            <span className="lp-i-lukija">{avatar(lukija)}{JUONTAJA_NIMI[lukija]} lukee kysymykset ääneen. Voit vastata heti.</span>
            <button type="button" className="lp-cta lp-i-cta" onClick={aloitaVisa}>Aloita visa →</button>
          </div>
        </div>
      </main>
    );
  }

  /* ── Intro (2a) ── */
  if (vaihe === "intro") {
    return (
      <main className="lp" data-ika={visa.ika} data-aksentti={luontoAksentti ? "luonto" : undefined} data-vaihe="intro">
        <div className="lp-kehys">
          {ylapalkki}
          <div className="lp-intro-kuva">
            {visa.kuva && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={visa.kuva} alt="" />
            )}
          </div>
          <div className="lp-intro-teksti">
            <div className="lp-pillerit">
              <span className="lp-ika">{IKA_MERKKI[visa.ika]}</span>
              {aihe && <span className="lp-aihe" style={{ color: aihe.aksentti, borderColor: aihe.aksentti }}>{aihe.emoji} {aihe.nimi}</span>}
            </div>
            <h1 className="lp-intro-h1">{visa.otsikko}</h1>
            {visa.kuvaus && <p className="lp-intro-p">{visa.kuvaus}</p>}
          </div>
          <div className="lp-venyke" />
          {kaistale(
            <button type="button" className="lp-cta" onClick={aloitaVisa}>Aloitetaan! →</button>,
            { kupla: false },
          )}
        </div>
      </main>
    );
  }

  /* ── Tulos (2m) ── */
  if (vaihe === "tulos") {
    return (
      <main className="lp" data-ika={visa.ika} data-aksentti={luontoAksentti ? "luonto" : undefined} data-vaihe="tulos">
        <div className="lp-kehys">
          <div className="lp-tulos-hehku" aria-hidden="true" />
          {ylapalkki}
          <div className="lp-tulos-duo" style={{ backgroundImage: `url(${kuvat.duo.onnittelee})` }} aria-hidden="true" />
          {kupla && (
            <div className="lp-tulos-kupla" role="status" aria-live="polite">
              <span className="lp-kupla-nimi">{JUONTAJA_NIMI[kupla.kuka]}</span>
              <span>{kupla.teksti}</span>
            </div>
          )}
          <h1 className="lp-tulos-h1">{tahdet === 3 ? "Mahtavaa!" : tahdet === 2 ? "Hienosti!" : "Hyvä yritys!"}</h1>
          <div className="lp-tahdet" role="img" aria-label={`${tahdet} / 3 tähteä`}>
            {[0, 1, 2].map((i) => <span key={i} data-sammunut={i >= tahdet || undefined}>⭐</span>)}
          </div>
          <p className="lp-tulos-p">{pienet ? "Pelasitte koko visan yhdessä." : `Tiesit ${oikeita}/${N}`}</p>
          <div className="lp-tulos-napit">
            <button type="button" className="lp-cta lp-cta--pieni" onClick={aloitaVisa}>Pelaa uudestaan</button>
            <button type="button" className="lp-toissijainen" onClick={jaa}>{jaettu ?? "Jaa perheelle"}</button>
          </div>
          {muut.length > 0 && (
            <nav className="lp-lisaa" aria-label="Lisää lasten visoja">
              <h2>Lisää lasten visoja</h2>
              <div className="lp-lisaa-rivi">
                {muut.map((m) => {
                  const ma = m.aihe ? LASTEN_AIHEET[m.aihe] : null;
                  return (
                    <a key={m.slug} className="lp-lisaa-kortti" href={`/visa/${m.slug}`}>
                      <span className="lp-lisaa-kuva" style={m.kuva ? { backgroundImage: `url(${m.kuva})` } : { background: ma?.aksentti ?? "#2F6B45" }}>
                        {!m.kuva && ma ? <span aria-hidden="true">{ma.emoji}</span> : null}
                      </span>
                      <span className="lp-lisaa-t">
                        <span className="lp-ika lp-ika--pieni">{IKA_MERKKI[m.ika]}</span>
                        <span className="lp-lisaa-nimi">{m.otsikko}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </main>
    );
  }

  /* ── Peli (2c, 2e, 2h–2j, 2l, 2n) ── */
  if (!k) return null;

  /* ── Peli, isommat (2f, 2g, 2k, 2o): kasvot vihjenappien sisällä, kupla nappien yläpuolella ── */
  if (!pienet) {
    const oikeaI = k.vastaukset.findIndex((v) => v.oikein);
    const lukee = puhe?.laji === "kysymys";
    return (
      <main className="lp" data-ika={visa.ika} data-aksentti={luontoAksentti ? "luonto" : undefined} data-vaihe="peli" data-vastattu={vastattu || undefined}>
        <div className="lp-kehys">
          {ylapalkki}
          <div className="lp-i-edistys" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }} role="progressbar" aria-label="Edistyminen" aria-valuemin={1} aria-valuemax={N} aria-valuenow={qi + 1}>
            {tulokset.map((t, i) => (
              <span key={i} data-tila={i === qi && !vastattu ? "nyt" : t === true ? "oikein" : t === false ? "ohi" : undefined} />
            ))}
          </div>
          <div className="lp-i-runko">
            {k.kuva && (
              <div className="lp-i-kuva">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={k.kuva} alt="" style={k.kuvaKohdistus ? { objectPosition: k.kuvaKohdistus } : undefined} />
                {k.kuvaKrediitti && <span className="lp-i-krediitti">{k.kuvaKrediitti}</span>}
              </div>
            )}
            <div className="lp-i-oikea">
              <div className="lp-i-kysymysrivi">
                <h1 className="lp-i-kysymys">{k.teksti}</h1>
                {!vastattu && (
                  <button type="button" className="lp-i-kuuntele" data-lukee={lukee || undefined} onClick={kuunteleUudelleen} aria-label={lukee ? "Lopeta lukeminen" : "Kuuntele kysymys uudelleen"}>
                    {lukee ? <Palkit pieni /> : <span aria-hidden="true">🔁</span>}
                  </button>
                )}
              </div>

              {k.elainaani && !vastattu && elainKortti(k.elainaani)}

              <div className="lp-i-vastaukset" role="group" aria-label="Vaihtoehdot">
                {k.vastaukset.map((v, i) => {
                  const tila = !vastattu ? undefined : i === oikeaI ? "oikea" : i === valittu ? "valittu" : "muu";
                  return (
                    <button key={i} type="button" className="lp-i-vastaus" data-tila={tila} disabled={vastattu} onClick={() => vastaa(i)}>
                      {v.kuva && (
                        <span className="lp-i-vastaus-kuva">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={v.kuva} alt="" />
                        </span>
                      )}
                      <span className="lp-i-vastaus-n">{v.teksti}</span>
                      {tila === "oikea" && <span className="lp-i-oikein" aria-label="Oikea vastaus">✓</span>}
                      {tila === "valittu" && <span className="lp-i-valintasi">Sinun valintasi</span>}
                    </button>
                  );
                })}
              </div>

              {tiesitko && (
                <section className="lp-i-tiesitko" aria-label="Tiesitkö">
                  {reaktio && (
                    <div className="lp-i-reaktio">
                      {avatar(lukija, puhe?.laji === "reaktio")}
                      <span>{reaktio}</span>
                    </div>
                  )}
                  {k.tiesitko && <p><strong>Tiesitkö?</strong> {k.tiesitko}</p>}
                </section>
              )}

              {vastattu && (kuvaLahteet(k).filter((x) => x !== k.kuvaKrediitti).length > 0 || k.elainaani) && (
                <p className="lp-lahde">
                  {kuvaLahteet(k).filter((x) => x !== k.kuvaKrediitti).length > 0 && <>Kuvat: {kuvaLahteet(k).filter((x) => x !== k.kuvaKrediitti).join(" · ")}{k.elainaani ? " · " : ""}</>}
                  {k.elainaani && (
                    <>Ääni:{" "}
                      {k.elainaani.lahdeUrl
                        ? <a href={k.elainaani.lahdeUrl} target="_blank" rel="noopener noreferrer">{k.elainaani.tekija} / iNaturalist, {k.elainaani.lisenssi}</a>
                        : <>{k.elainaani.tekija} / iNaturalist, {k.elainaani.lisenssi}</>}
                    </>
                  )}
                </p>
              )}

              <div className="lp-venyke" />
              <div className="lp-i-ala">
                {!vastattu && kupla && (
                  <div className="lp-i-kupla" data-kuka={kupla.kuka} data-pitka={kupla.teksti.length > 70 || undefined} role="status" aria-live="polite">
                    <div className="lp-kupla-yla">
                      <span className="lp-kupla-nimi">{JUONTAJA_NIMI[kupla.kuka]}{kupla.kuka === "mikko" ? " 😄" : ""}</span>
                      {puhe && puhe.laji === kupla.laji && (
                        <button type="button" className="lp-stop" onClick={vaikene} aria-label="Lopeta puhe">■</button>
                      )}
                    </div>
                    <p>{kupla.teksti}</p>
                  </div>
                )}
                {!vastattu ? (
                  <div className="lp-i-vihjenapit">
                    {(["laura", "mikko"] as Juontaja[]).map((kuka) => {
                      const kertoo = puhe?.laji === "vihje" && puhe.kuka === kuka;
                      const lukeeNyt = lukee && kuka === lukija;
                      const aktiivinen = kertoo || lukeeNyt;
                      const kaytetty = lamput <= 0 && !kysytyt.includes(`${qi}:${kuka}`);
                      const toinenPuhuu = !!puhe && (puhe.laji === "vihje" || puhe.laji === "kysymys") && !aktiivinen;
                      return (
                        <button
                          key={kuka}
                          type="button"
                          className="lp-i-vihje"
                          data-kuka={kuka}
                          data-aktiivinen={aktiivinen || undefined}
                          data-himmea={toinenPuhuu || kaytetty || undefined}
                          disabled={!k.vihje[kuka]}
                          onClick={() => kysyVihje(kuka)}
                        >
                          {avatar(kuka, puhe?.kuka === kuka)}
                          <span>
                            {kertoo ? `${JUONTAJA_NIMI[kuka]} kertoo` : lukeeNyt ? `${JUONTAJA_NIMI[kuka]} lukee…` : kaytetty ? "Vihjeet käytetty" : `Kysy ${JUONTAJA_ABL[kuka]}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <button type="button" className="lp-cta lp-seuraava" onClick={seuraava}>
                    {qi + 1 < N ? "Seuraava →" : "Katso tulos →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  const oikeaIndeksi = k.vastaukset.findIndex((v) => v.oikein);
  const lukeeKysymysta = puhe?.laji === "kysymys";

  return (
    <main className="lp" data-ika={visa.ika} data-aksentti={luontoAksentti ? "luonto" : undefined} data-vaihe="peli" data-vastattu={vastattu || undefined}>
      <div className="lp-kehys">
        {ylapalkki}
        <div className="lp-edistysrivi">
          <div className="lp-edistys" role="progressbar" aria-label="Edistyminen" aria-valuemin={1} aria-valuemax={N} aria-valuenow={qi + 1}>
            <span style={{ width: `${((qi + 1) / N) * 100}%` }} />
          </div>
          {qi === N - 1 && N > 1 && <span className="lp-viimeinen">Viimeinen!</span>}
        </div>
        <h1 className="lp-kysymys">{k.teksti}</h1>

        {!vastattu && (
          <button type="button" className="lp-kuuntele" data-lukee={lukeeKysymysta || undefined} onClick={kuunteleUudelleen}>
            {lukeeKysymysta ? (
              <><Palkit />{JUONTAJA_NIMI[lukija]} lukee… <span className="lp-kuuntele-vihje">napauta: lopeta</span></>
            ) : (
              <>🔁 Kuuntele uudelleen</>
            )}
          </button>
        )}

        {k.elainaani && !vastattu && elainKortti(k.elainaani)}

        {k.kuva && k.tyyppi === "kuva" && (
          <div className="lp-kysymyskuva">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={k.kuva} alt="" style={k.kuvaKohdistus ? { objectPosition: k.kuvaKohdistus } : undefined} />
          </div>
        )}

        <div className="lp-vastaukset" role="group" aria-label="Vaihtoehdot" data-ruudukko={(k.tyyppi === "aani_kuvavastaukset" && !tiesitko && k.vastaukset.every((v) => v.kuva)) || undefined}>
          {k.vastaukset.map((v, i) => {
            const tila = !vastattu ? undefined : i === oikeaIndeksi ? "oikea" : i === valittu ? "valittu" : "muu";
            if (tiesitko && tila !== "oikea") return null;
            return (
              <button
                key={i}
                type="button"
                className="lp-vastaus"
                data-tila={tila}
                data-kuvaton={!v.kuva || undefined}
                disabled={vastattu}
                onClick={() => vastaa(i)}
              >
                {v.kuva && (
                  <span className="lp-vastaus-kuva">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.kuva} alt="" loading={qi === 0 ? "eager" : "lazy"} />
                  </span>
                )}
                <span className="lp-vastaus-n">{v.teksti}</span>
                {tila === "oikea" && <span className="lp-tahti" aria-label="Oikea vastaus">⭐</span>}
              </button>
            );
          })}
        </div>

        {tiesitko && k.tiesitko && (
          <section className="lp-tiesitko" aria-label="Tiesitkö">
            <div className="lp-tiesitko-yla">
              <span className="lp-avatar" data-kuka={lukija} data-puhuu={puhe?.laji === "tiesitko" || undefined} style={{ backgroundImage: `url(${kuvat.avatar[lukija]})` }} aria-hidden="true" />
              <span className="lp-tiesitko-otsikko">💡 Tiesitkö?</span>
              <span className="lp-tyhja" />
              {puhe?.laji === "tiesitko" && <button type="button" className="lp-stop" onClick={vaikene} aria-label="Lopeta puhe">■</button>}
            </div>
            <p>{k.tiesitko}</p>
          </section>
        )}

        {vastattu && kuvaLahteet(k).length > 0 && (
          <p className="lp-lahde">Kuvat: {kuvaLahteet(k).join(" · ")}</p>
        )}
        {k.elainaani && vastattu && (
          <p className="lp-lahde">
            Ääni:{" "}
            {k.elainaani.lahdeUrl ? (
              <a href={k.elainaani.lahdeUrl} target="_blank" rel="noopener noreferrer">{k.elainaani.tekija} / iNaturalist, {k.elainaani.lisenssi}</a>
            ) : (
              <>{k.elainaani.tekija} / iNaturalist, {k.elainaani.lisenssi}</>
            )}
          </p>
        )}

        <div className="lp-venyke" />
        {kaistale(
          !vastattu ? (
            <div className="lp-vihjenapit">
              {(["laura", "mikko"] as Juontaja[]).map((kuka) => {
                const kertoo = puhe?.laji === "vihje" && puhe.kuka === kuka;
                const muuKertoo = puhe?.laji === "vihje" && puhe.kuka !== kuka;
                return (
                  <button
                    key={kuka}
                    type="button"
                    className="lp-vihje"
                    data-kuka={kuka}
                    data-kertoo={kertoo || undefined}
                    data-himmea={muuKertoo || undefined}
                    disabled={!k.vihje[kuka]}
                    onClick={() => kysyVihje(kuka)}
                  >
                    {kertoo ? <><Palkit pieni />{JUONTAJA_NIMI[kuka]} kertoo</> : <>Kysy {JUONTAJA_ABL[kuka]}</>}
                  </button>
                );
              })}
            </div>
          ) : tiesitko || !k.tiesitko ? (
            <button type="button" className="lp-cta lp-seuraava" onClick={seuraava}>
              {qi + 1 < N ? "Seuraava →" : "Katso tulos →"}
            </button>
          ) : (
            <span className="lp-odota">Tiesitkö-kortti tulee…</span>
          ),
          { kupla: !tiesitko },
        )}
      </div>
    </main>
  );
}
