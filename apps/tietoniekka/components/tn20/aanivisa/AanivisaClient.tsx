"use client";
// ÄÄNIVISA — pelinäkymä (CD "TN Aanivisat design" 1a–1i; brief §2.4, 8.10.2026).
//
//   intro (1a) → 10 ääntä (1b/1c/1g → 1d/1e) → tulos (1f). Desktop 1h/1i = kaksi saraketta.
//
// Ääni: yksi <audio>-elementti koko pelille. Aloita-napautus soittaa sen mykistettynä ja pysäyttää heti,
// mikä avaa iOS Safarin äänilukon samalle elementille → kysymyksestä 2 alkaen ääni voi alkaa itsestään
// (~0,6 s kysymyksen vaihtumisen jälkeen), jos yläpalkin Ääni-kytkin on päällä (tila laitteella).
// Kysymys 1 soi aina napautuksella. Tiedostossa sama jakso soi kahdesti tauon kanssa (jakso, tauko):
// sonogrammi pyyhkiytyy esiin kummallakin toistolla. Vastaaminen ei pysäytä ääntä.
// Väärä vastaus kuten aikuisten tavallisessa visassa (korjaukset 9.10.2026): punainen ✕ "Sinun valintasi",
// oikea = lime ✓. Sonogrammissa ei taajuusmerkintöjä, soittorivillä ei toisto- eikä aikatekstejä.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KYTKIN_AVAIN, PERUSPISTEET, PUTKIBONUS, arvio, lueTulos, tulosAvain,
  type AaniKysymys, type AaniTallenne, type AaniViikko,
} from "@/lib/aanivisat";

type Linkki = { otsikko: string; href: string };
type Vaihe = "intro" | "peli" | "tulos";

const PLAY = "M7 4.5v15l12.5-7.5z";

function Kaiutin({ koko = 20 }: { koko?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={koko} height={koko} aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="#4ADE80" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#4ADE80" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function Toisto({ soi, koko = 24 }: { soi: boolean; koko?: number }) {
  return soi ? (
    <svg viewBox="0 0 24 24" width={koko} height={koko} aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="#0F0D07" /><rect x="14" y="5" width="4" height="14" rx="1" fill="#0F0D07" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" width={koko} height={koko} aria-hidden="true" style={{ marginLeft: koko * 0.12 }}><path d={PLAY} fill="#0F0D07" /></svg>
  );
}

/** Soittokohta → pyyhkiytymisen tila: toisto 1 (0…jakso), tauko, toisto 2. */
function edistyminen(t: number, jakso: number, tauko: number) {
  if (t <= jakso) return { toisto: 1, p: t / jakso, p1: t / jakso, p2: 0 };
  if (t < jakso + tauko) return { toisto: 1, p: 1, p1: 1, p2: 0 };
  const p2 = Math.min(1, (t - jakso - tauko) / jakso);
  return { toisto: 2, p: p2, p1: 1, p2 };
}

function Sonogrammi({ k, t, soitettu, soi }: { k: AaniKysymys; t: number; soitettu: boolean; soi: boolean }) {
  const e = edistyminen(t, k.jakso, k.tauko);
  // Ennen ensimmäistä soittoa vain harmaa kuva; soiton jälkeen väri jää soittokohtaan asti.
  const p = soitettu ? e.p : 0;
  return (
    <div className="av-sono" data-soi={soi || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="av-sono-harmaa" src={k.sono} alt="" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="av-sono-vari" src={k.sono} alt="" draggable={false} style={{ clipPath: `inset(0 ${100 - p * 100}% 0 0)` }} />
      {soi && <span className="av-sono-kohta" style={{ left: `${p * 100}%` }} aria-hidden="true" />}
    </div>
  );
}

function MiniSono({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="av-minisono" src={src} alt="" draggable={false} />;
}

function Lahteet({ k }: { k: AaniKysymys }) {
  return (
    <div className="av-lahteet">
      <div>
        <span className="av-lahde-l">Ääni</span>
        <a href={k.aani.lahde} target="_blank" rel="noopener noreferrer">
          {k.aani.tekija} · {k.aani.lisenssi}
        </a>
      </div>
      {k.kuva && (
        <div>
          <span className="av-lahde-l">Kuva</span>
          {k.kuva.lahde ? (
            <a href={k.kuva.lahde} target="_blank" rel="noopener noreferrer">
              {k.kuva.tekija ?? "Wikimedia Commons"}{k.kuva.lisenssi ? ` · ${k.kuva.lisenssi}` : ""}
            </a>
          ) : (
            <span>{k.kuva.tekija ?? "Wikimedia Commons"}{k.kuva.lisenssi ? ` · ${k.kuva.lisenssi}` : ""}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function AanivisaClient({ viikko, jatka, sivu }: { viikko: AaniViikko; jatka: Linkki[]; sivu: string }) {
  const { ryhma, kysymykset } = viikko;
  const N = kysymykset.length;
  const [vaihe, setVaihe] = useState<Vaihe>("intro");
  const [qi, setQi] = useState(0);
  const [valinnat, setValinnat] = useState<(string | null)[]>(() => kysymykset.map(() => null));
  const [pisteet, setPisteet] = useState(0);
  const [putki, setPutki] = useState(0);
  const [saadut, setSaadut] = useState(0);
  const [autosoitto, setAutosoitto] = useState(true);
  const [aiempi, setAiempi] = useState<AaniTallenne | null>(null);
  const [soi, setSoi] = useState(false);
  const [t, setT] = useState(0);
  const [soitettu, setSoitettu] = useState(false);
  const [kesto, setKesto] = useState(0);
  const [soivaKortti, setSoivaKortti] = useState<number | null>(null);
  const [jaettu, setJaettu] = useState<string | null>(null);
  const [voiJakaa, setVoiJakaa] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const autoRef = useRef<number | null>(null);
  const vahennaLiiketta = useRef(false);

  const k = kysymykset[qi];
  const valittu = valinnat[qi];
  const vastattu = valittu != null;
  const oikein = valinnat.filter((v, i) => v === kysymykset[i].laji).length;

  useEffect(() => {
    try {
      const v = localStorage.getItem(KYTKIN_AVAIN);
      if (v === "0") setAutosoitto(false);
    } catch { /* ei tallennusta */ }
    setAiempi(lueTulos(ryhma.key, viikko.vuosi, viikko.viikko));
    vahennaLiiketta.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setVoiJakaa(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, [ryhma.key, viikko.vuosi, viikko.viikko]);

  const audio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const pysaytaSeuranta = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };
  const seuraa = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setT(a.currentTime);
    if (a.duration && Number.isFinite(a.duration)) setKesto(a.duration);
    rafRef.current = requestAnimationFrame(seuraa);
  }, []);

  /** Soittaa annetun tiedoston alusta (uusi soitto aloittaa aina alusta). */
  const soita = useCallback(
    (src: string, kortti: number | null = null) => {
      const a = audio();
      if (autoRef.current) window.clearTimeout(autoRef.current);
      if (!a.src.endsWith(src)) a.src = src;
      a.currentTime = 0;
      a.muted = false;
      a.onended = () => {
        pysaytaSeuranta();
        setSoi(false);
        setSoivaKortti(null);
        setT(a.duration || 0);
      };
      a.play()
        .then(() => {
          setSoi(kortti == null);
          setSoivaKortti(kortti);
          if (kortti == null) setSoitettu(true);
          pysaytaSeuranta();
          rafRef.current = requestAnimationFrame(seuraa);
        })
        .catch(() => {
          setSoi(false);
          setSoivaKortti(null);
        });
    },
    [audio, seuraa],
  );

  const pysayta = useCallback(() => {
    audioRef.current?.pause();
    pysaytaSeuranta();
    setSoi(false);
    setSoivaKortti(null);
  }, []);

  const vaihdaSoitto = useCallback(() => {
    if (soi) pysayta();
    else if (k) soita(k.audio);
  }, [soi, k, soita, pysayta]);

  // Välilyönti soittaa ja pysäyttää (desktop).
  useEffect(() => {
    if (vaihe !== "peli") return;
    const kasittele = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const kohde = e.target as HTMLElement | null;
      if (kohde && (kohde.tagName === "INPUT" || kohde.tagName === "TEXTAREA")) return;
      e.preventDefault();
      vaihdaSoitto();
    };
    window.addEventListener("keydown", kasittele);
    return () => window.removeEventListener("keydown", kasittele);
  }, [vaihe, vaihdaSoitto]);

  // Kysymyksen vaihtuessa: nollaus ja automaattisoitto kysymyksestä 2 alkaen.
  useEffect(() => {
    if (vaihe !== "peli" || !k) return;
    setT(0);
    setSoitettu(false);
    setKesto(k.jakso * 2 + k.tauko);
    if (qi > 0 && autosoitto) {
      autoRef.current = window.setTimeout(() => soita(k.audio), 600);
    }
    return () => {
      if (autoRef.current) window.clearTimeout(autoRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, vaihe]);

  useEffect(() => () => {
    pysaytaSeuranta();
    audioRef.current?.pause();
  }, []);

  const aloita = () => {
    // Äänilukko: soitetaan mykistettynä ja pysäytetään heti saman napautuksen sisällä.
    const a = audio();
    a.src = kysymykset[0].audio;
    a.muted = true;
    const lupaus = a.play();
    if (lupaus) lupaus.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; });
    setValinnat(kysymykset.map(() => null));
    setPisteet(0);
    setPutki(0);
    setQi(0);
    setVaihe("peli");
    window.scrollTo({ top: 0 });
  };

  const vastaa = (nimi: string) => {
    if (vastattu || !k) return;
    const ok = nimi === k.laji;
    const uusiPutki = ok ? putki + 1 : 0;
    const p = ok ? PERUSPISTEET + (uusiPutki > 1 ? (uusiPutki - 1) * PUTKIBONUS : 0) : 0;
    setValinnat((v) => v.map((x, i) => (i === qi ? nimi : x)));
    setPutki(uusiPutki);
    setSaadut(p);
    setPisteet((s) => s + p);
  };

  const seuraava = () => {
    pysayta();
    if (qi + 1 < N) {
      setQi(qi + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    const vastaukset = kysymykset.map((q, i) => valinnat[i] === q.laji);
    const tallenne: AaniTallenne = { oikein: vastaukset.filter(Boolean).length, kaikki: N, vastaukset };
    try { localStorage.setItem(tulosAvain(ryhma.key, viikko.vuosi, viikko.viikko), JSON.stringify(tallenne)); } catch { /* ei tallennusta */ }
    setAiempi(tallenne);
    setVaihe("tulos");
    window.scrollTo({ top: 0 });
  };

  const vaihdaKytkin = () => {
    const uusi = !autosoitto;
    setAutosoitto(uusi);
    try { localStorage.setItem(KYTKIN_AVAIN, uusi ? "1" : "0"); } catch { /* ei tallennusta */ }
    if (!uusi && autoRef.current) window.clearTimeout(autoRef.current);
  };

  const jakoteksti = `Tunnistin ${oikein}/${N} ${ryhma.monikko} äänestä. Pystytkö parempaan?`;
  const jakoUrl = typeof window !== "undefined" ? `${window.location.origin}${sivu}` : sivu;
  const jaa = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: ryhma.otsikko, text: jakoteksti, url: jakoUrl });
        return;
      }
    } catch { return; }
    try {
      await navigator.clipboard.writeText(`${jakoteksti} ${jakoUrl}`);
      setJaettu("Linkki kopioitu");
    } catch { setJaettu(null); }
  };

  const pipit = useMemo(
    () =>
      kysymykset.map((q, i) => {
        if (vaihe === "tulos") return valinnat[i] === q.laji ? "ok" : "ohi";
        if (i < qi || (i === qi && vastattu)) return valinnat[i] === q.laji ? "ok" : "ohi";
        return i === qi ? "nyt" : "tulossa";
      }),
    [kysymykset, valinnat, qi, vaihe, vastattu],
  );

  const e = k ? edistyminen(t, k.jakso, k.tauko) : { toisto: 1, p1: 0, p2: 0, p: 0 };
  const kokoKesto = kesto || (k ? k.jakso * 2 + k.tauko : 0);

  /* ── Yläpalkki ── */
  const ylapalkki = (
    <div className="av-yla">
      <a className="av-sulje" href="/kokoelma/luonto" aria-label="Sulje äänivisa">✕</a>
      <div className="av-yla-tila">
        <span className="av-yla-merkki">Luonto · Äänivisa</span>
        <span className="av-yla-teksti" data-valmis={vaihe === "tulos" || undefined}>
          {vaihe === "tulos" ? "✓ Visa valmis" : `Ääni ${qi + 1} / ${N} · ${oikein} oikein`}
        </span>
        <span className="av-pipit" aria-hidden="true">
          {pipit.map((p, i) => <span key={i} data-tila={p} />)}
        </span>
      </div>
      {vaihe !== "tulos" && (
        <button type="button" className="av-kytkin" aria-pressed={autosoitto} onClick={vaihdaKytkin}
          title={autosoitto ? "Ääni soi itsestään kysymyksestä 2 alkaen" : "Ääni soi vain napautuksella"}>
          <Kaiutin />
          Ääni
          <span className="av-kytkin-tila">{autosoitto ? "päällä" : "pois"}</span>
        </button>
      )}
    </div>
  );

  /* ── Intro (1a) ── */
  if (vaihe === "intro") {
    const tausta = kysymykset[N - 1] ?? kysymykset[0];
    return (
      <main className="av av--intro">
        <div className="av-intro">
          <div className="av-intro-tausta" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {tausta && <img src={tausta.sono} alt="" />}
          </div>
          <div className="av-intro-sisalto">
            <span className="av-merkki"><i />Luonto · Äänivisa</span>
            <h1 className="av-intro-h1">{ryhma.otsikko}</h1>
            <p className="av-intro-p">{ryhma.kuvaus}</p>
            <div className="av-intro-rivit">
              <span>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3" stroke="#4ADE80" strokeWidth="2" fill="none" /><rect x="3" y="14" width="5" height="7" rx="2" fill="#4ADE80" /><rect x="16" y="14" width="5" height="7" rx="2" fill="#4ADE80" /></svg>
                Kuulokkeilla kuulee parhaiten
              </span>
              <span>
                <b>{viikko.viikko}</b>
                Viikon {viikko.viikko} äänet · uudet äänet maanantaina
              </span>
              {aiempi && (
                <span>
                  <b>✓</b>
                  Tuloksesi tällä viikolla: {aiempi.oikein}/{aiempi.kaikki}
                </span>
              )}
            </div>
            <button type="button" className="av-cta" onClick={aloita}>
              {aiempi ? "Pelaa uudelleen" : "Aloita visa"}
            </button>
            <span className="av-intro-ala">{N} ääntä · ääni soi kahdesti, voit kuunnella uudelleen</span>
          </div>
        </div>
      </main>
    );
  }

  /* ── Tulos (1f) ── */
  if (vaihe === "tulos") {
    return (
      <main className="av av--tulos">
        {ylapalkki}
        <div className="av-tulos">
          <section className="av-tuloskortti" aria-label="Tulos">
            <span className="av-tulos-merkki">Luonto · Viikon {viikko.viikko} äänet</span>
            <div className="av-tulos-rivi">
              <span className="av-tulos-luku">{oikein}/{N}</span>
              <span className="av-tulos-arvio">{arvio(oikein, N)}</span>
            </div>
            <span className="av-tulos-teksti">Tunnistit {oikein}/{N} {ryhma.monikko} äänestä. Uudet äänet maanantaina.</span>
          </section>

          <section className="av-kortisto" aria-label="Viikon äänet">
            <div className="av-kortisto-head">
              <h2>Viikon äänet</h2>
              <span>Kuuntele uudelleen</span>
            </div>
            <div className="av-kortisto-grid">
              {kysymykset.map((q, i) => {
                const ok = valinnat[i] === q.laji;
                const soiNyt = soivaKortti === i;
                return (
                  <div key={q.id} className="av-aanikortti" data-ok={ok || undefined}>
                    <div className="av-aanikortti-kuva">
                      {q.kuva ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={q.kuva.url} alt={q.laji} loading="lazy" />
                      ) : (
                        <MiniSono src={q.sono} />
                      )}
                      <button type="button" className="av-aanikortti-soita" aria-label={soiNyt ? `Pysäytä: ${q.laji}` : `Soita: ${q.laji}`}
                        onClick={() => (soiNyt ? pysayta() : soita(q.audio, i))}>
                        <Toisto soi={soiNyt} koko={18} />
                      </button>
                      <span className="av-aanikortti-ok" data-ok={ok || undefined} aria-hidden="true">{ok ? "✓" : "✕"}</span>
                    </div>
                    <div className="av-aanikortti-teksti">
                      <span className="av-aanikortti-nimi">{q.laji}</span>
                      <span className="av-aanikortti-tila">{ok ? "Tunnistit" : "Opittu tänään"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="av-jaa" aria-label="Jaa haaste">
            <h2>Jaa haaste</h2>
            <div className="av-jaa-esikatselu">
              <span className="av-jaa-sono"><MiniSono src={kysymykset[0].sono} /></span>
              <span>”{jakoteksti}”</span>
            </div>
            <a className="av-jaa-wa" href={`https://wa.me/?text=${encodeURIComponent(`${jakoteksti} ${jakoUrl}`)}`} target="_blank" rel="noopener noreferrer">
              Haasta WhatsAppissa
            </a>
            <div className="av-jaa-rivi">
              <button type="button" onClick={aloita}>Pelaa uudelleen</button>
              <button type="button" onClick={jaa}>{voiJakaa ? "Muut jakotavat" : jaettu ?? "Kopioi linkki"}</button>
            </div>
          </section>

          {jatka.length > 0 && (
            <nav className="av-jatka" aria-label="Jatka aiheesta">
              <h2>Jatka aiheesta</h2>
              {jatka.map((l) => (
                <a key={l.href} href={l.href}>
                  <span>{l.otsikko}</span>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </nav>
          )}
        </div>
      </main>
    );
  }

  /* ── Peli (1b–1e, 1g–1i) ── */
  const ok = vastattu && valittu === k.laji;
  return (
    <main className="av av--peli" data-vastattu={vastattu || undefined}>
      {ylapalkki}
      <div className="av-peli">
        <div className="av-vasen">
          {!vastattu ? (
            <div className="av-media">
              <Sonogrammi k={k} t={t} soitettu={soitettu} soi={soi} />
              {soi && qi > 0 && autosoitto && t < 1.5 && <span className="av-auto">Soi automaattisesti</span>}
            </div>
          ) : (
            <div className="av-media av-media--kuva">
              {k.kuva ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="av-paljastus" src={k.kuva.url} alt={k.laji} />
              ) : (
                <Sonogrammi k={k} t={k.jakso} soitettu soi={false} />
              )}
              <span className="av-paljastus-varjo" aria-hidden="true" />
              <span className="av-paljastus-merkki" data-ok={ok || undefined}>
                {ok ? `✓ Oikein · +${saadut}` : `Se oli ${k.laji.toLowerCase()}`}
              </span>
              <span className="av-paljastus-nimi">
                <span className="av-paljastus-laji">{k.laji}</span>
                {k.tieteellinen && <span className="av-paljastus-tiet">{k.tieteellinen}</span>}
              </span>
              {k.aani.maa && <span className="av-paljastus-maa">Äänitetty: {k.aani.maa}</span>}
            </div>
          )}

          {!vastattu ? (
            <div className="av-soitin">
              <button type="button" className="av-soitin-nappi" data-odottaa={!soitettu && !soi ? "" : undefined} onClick={vaihdaSoitto} aria-label={soi ? "Pysäytä ääni" : "Soita ääni"}>
                <Toisto soi={soi} />
              </button>
              {/* Kaksi toistoa = palkin kaksi osaa; ei toisto- eikä aikatekstiä (korjaukset 9.10.2026). */}
              <div className="av-palkit" role="progressbar" aria-label="Äänen eteneminen" aria-valuemin={0} aria-valuemax={Math.round(kokoKesto)} aria-valuenow={Math.round(soitettu ? t : 0)}>
                <span><span style={{ width: `${(soitettu ? e.p1 : 0) * 100}%` }} /></span>
                <span><span style={{ width: `${(soitettu ? e.p2 : 0) * 100}%` }} /></span>
              </div>
              <span className="av-vain-desk av-vihje">Välilyönti toistaa</span>
            </div>
          ) : (
            <div className="av-uudelleen">
              <button type="button" className="av-uudelleen-nappi" onClick={vaihdaSoitto} aria-label={soi ? "Pysäytä ääni" : "Kuuntele uudelleen"}>
                <Toisto soi={soi} koko={22} />
              </button>
              <span className="av-uudelleen-t">Kuuntele uudelleen</span>
              <span className="av-uudelleen-sono"><MiniSono src={k.sono} /></span>
              {k.aani.maa && <span className="av-uudelleen-maa">Äänitetty: {k.aani.maa}</span>}
            </div>
          )}
        </div>

        <div className="av-oikea">
          {/* Otsikko vain ruudunlukijoille: tehtävä on sama joka kysymyksessä (korjaukset 9.10.2026). */}
          {!vastattu && <h2 className="av-sr">Kenen ääni? Ääni {qi + 1} / {N}</h2>}
          <div className="av-vaihtoehdot" role="group" aria-label="Vaihtoehdot">
            {k.vaihtoehdot.map((v, i) => {
              const onOikea = v === k.laji;
              const onValittu = v === valittu;
              const tila = !vastattu ? undefined : onOikea ? "oikea" : onValittu ? "vaara" : "muu";
              return (
                <button key={v} type="button" className="av-vaihtoehto" data-tila={tila} disabled={vastattu} onClick={() => vastaa(v)}>
                  <span className="av-vaihtoehto-k">{"ABCD"[i]}</span>
                  <span className="av-vaihtoehto-n">{v}</span>
                  {tila === "oikea" && <span className="av-vaihtoehto-t"><i aria-hidden="true">✓</i>{onValittu ? "Oikein" : "Oikea vastaus"}</span>}
                  {tila === "vaara" && <span className="av-vaihtoehto-t"><i aria-hidden="true">✕</i>Sinun valintasi</span>}
                </button>
              );
            })}
          </div>
          {vastattu && (
            <>
              {k.fakta && (
                <div className="av-tiesitko">
                  <span>Tiesitkö?</span>
                  <p>{k.fakta}</p>
                </div>
              )}
              <div className="av-seuraava-rivi">
                <Lahteet k={k} />
                <div className="av-seuraava-palkki">
                  <button type="button" className="av-cta av-seuraava" onClick={seuraava}>
                    {qi + 1 < N ? "Seuraava ääni →" : "Katso tulos →"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {pisteet > 0 && <span className="av-sr" aria-live="polite">{pisteet} pistettä</span>}
    </main>
  );
}
