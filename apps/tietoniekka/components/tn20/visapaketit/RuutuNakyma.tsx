"use client";
// VISAPAKETIN TELEVISIONÄKYMÄ (V-C; design-kankaan taulu 3, ilme Neon Night). Koko ruudun 16:9-näkymä:
// kierroksen väliruutu → kysymykset (vastaus paljastetaan napista) → kierroksen vastaukset → seuraava kierros.
// Näppäimet: → / välilyönti = seuraava vaihe (ensin vastaus, sitten seuraava kysymys), ← = edellinen, F = koko näyttö.
// Lasten kierroksilla Lauran ja Mikon kysymysääni (questions.audio.kysymys) soi kysymyksen tullessa ruudulle;
// eläinääni soi napista kuten lasten pelissä. Ääni pois -valinta on sama kuin lasten pelissä (tn_lapset_aani).
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { kirjaaVp } from "@/lib/vpTapahtuma";
import { kuvaOnKysymys, kysymysTeksti, oikeaVastaus, viittaaVaihtoehtoihin, type Kierros, type PakettiKysymys } from "@/lib/visapaketit";

const AANI_AVAIN = "tn_lapset_aani";

type Ruutu =
  | { t: "vali"; k: Kierros }
  | { t: "kysymys"; k: Kierros; q: PakettiKysymys; i: number }
  | { t: "kooste"; k: Kierros }
  | { t: "loppu" };

/** Kysymystekstin pituusluokka televisiokokoa varten (KORTTISÄÄNTÖ-kalibrointi, visapaketit.css). */
const pituus = (t: string) => (t.length <= 70 ? "lyhyt" : t.length <= 120 ? "keski" : "pitka");

export default function RuutuNakyma({ packId, otsikko, kierrokset, paluu, mittaa }: {
  packId: string; otsikko: string; kierrokset: Kierros[]; paluu: string; mittaa: boolean;
}) {
  const ruudut = useMemo<Ruutu[]>(() => [
    ...kierrokset.flatMap((k): Ruutu[] => [
      { t: "vali", k },
      ...k.kysymykset.map((q, i): Ruutu => ({ t: "kysymys", k, q, i })),
      { t: "kooste", k },
    ]),
    { t: "loppu" },
  ], [kierrokset]);

  const [n, setN] = useState(0);
  const [auki, setAuki] = useState(false);
  const [aani, setAani] = useState(true);
  const [elainSoi, setElainSoi] = useState(false);
  const aaniRef = useRef(true);
  const puheRef = useRef<HTMLAudioElement | null>(null);
  const elainRef = useRef<HTMLAudioElement | null>(null);
  const aloitettu = useRef(false);
  const lopetettu = useRef(false);
  const r = ruudut[n];
  const lastenAania = kierrokset.some((k) => k.kohderyhma === "lapset" && k.kysymykset.some((q) => q.audio?.kysymys || q.animal_sound?.url));

  useEffect(() => {
    try { if (localStorage.getItem(AANI_AVAIN) === "0") { setAani(false); aaniRef.current = false; } } catch { /* ei tallennusta */ }
    return () => { puheRef.current?.pause(); elainRef.current?.pause(); };
  }, []);

  const vaikene = () => { puheRef.current?.pause(); elainRef.current?.pause(); setElainSoi(false); };

  /** Kutsutaan suoraan näppäimestä tai napista (synkroninen play iOS:lle ja selainten autoplay-säännöille). */
  const soitaKysymys = (ru: Ruutu | undefined) => {
    vaikene();
    if (!aaniRef.current || ru?.t !== "kysymys" || ru.k.kohderyhma !== "lapset" || !ru.q.audio?.kysymys) return;
    const a = puheRef.current ?? new Audio();
    puheRef.current = a;
    a.setAttribute("playsinline", "");
    a.src = ru.q.audio.kysymys;
    a.play().catch(() => {});
  };

  const siirry = useCallback((uusi: number) => {
    const i = Math.max(0, Math.min(ruudut.length - 1, uusi));
    if (i === n) return;
    if (i > 0 && !aloitettu.current) { aloitettu.current = true; if (mittaa) kirjaaVp(packId, "ruutu_aloitus"); }
    if (ruudut[i].t === "loppu" && !lopetettu.current) { lopetettu.current = true; if (mittaa) kirjaaVp(packId, "ruutu_loppu"); }
    setN(i);
    setAuki(false);
    soitaKysymys(ruudut[i]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, ruudut, mittaa, packId]);

  const eteenpain = useCallback(() => {
    if (r.t === "kysymys" && !auki) { setAuki(true); return; }
    siirry(n + 1);
  }, [r, auki, n, siirry]);

  const kokoNaytto = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  useEffect(() => {
    const kuuntele = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const kohde = e.target as HTMLElement;
      // Napin päällä välilyönti painaa nappia — ei tuplaa vaihetta.
      if ((e.key === " " || e.key === "Enter") && kohde.closest("button, a")) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); eteenpain(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); siirry(n - 1); }
      else if (e.key === "f" || e.key === "F") { e.preventDefault(); kokoNaytto(); }
    };
    window.addEventListener("keydown", kuuntele);
    return () => window.removeEventListener("keydown", kuuntele);
  }, [eteenpain, siirry, n]);

  const vaihdaAani = () => {
    const uusi = !aaniRef.current;
    aaniRef.current = uusi;
    setAani(uusi);
    try { localStorage.setItem(AANI_AVAIN, uusi ? "1" : "0"); } catch { /* ei tallennusta */ }
    if (!uusi) vaikene();
  };

  const soitaElain = (q: PakettiKysymys) => {
    if (!q.animal_sound?.url) return;
    const e = elainRef.current ?? new Audio();
    elainRef.current = e;
    if (!e.paused) { e.pause(); setElainSoi(false); return; }
    puheRef.current?.pause();
    e.setAttribute("playsinline", "");
    e.onplaying = () => setElainSoi(true);
    e.onended = e.onpause = () => setElainSoi(false);
    if (!e.src.endsWith(q.animal_sound.url)) e.src = q.animal_sound.url;
    try { e.currentTime = 0; } catch { /* metatiedot latautumatta */ }
    e.play().catch(() => setElainSoi(false));
  };

  const kierrosNro = r.t === "loppu" ? kierrokset.length : r.k.nro;
  const ilmoitus =
    r.t === "vali" ? `Kierros ${r.k.nro}: ${r.k.nimi}` :
    r.t === "kysymys" ? `Kysymys ${r.i + 1} / ${r.k.kysymykset.length}: ${kysymysTeksti(r.q)}${auki ? `. Vastaus: ${oikeaVastaus(r.q)}` : ""}` :
    r.t === "kooste" ? `Kierroksen ${r.k.nro} vastaukset` : "Visa on valmis";

  return (
    <main className="tn-vp-ruutu" data-ruutu={r.t}>
      <header className="tn-vp-ruutu-yla">
        <span className="tn-vp-ruutu-logo" aria-hidden="true"><span>TIETO</span>NIEKKA</span>
        {r.t !== "loppu" && <span className="tn-vp-ruutu-kierros">Kierros {kierrosNro} · {r.k.nimi}</span>}
        {r.t === "kysymys" && <span className="tn-vp-ruutu-eteneminen">{r.i + 1}/{r.k.kysymykset.length}</span>}
      </header>

      <p className="tn-vp-sr" aria-live="polite">{ilmoitus}</p>

      <div className="tn-vp-ruutu-sisalto" key={n}>
        {r.t === "vali" && (
          <div className="tn-vp-ruutu-vali">
            <span className="tn-vp-ruutu-vali-nro">Kierros {r.k.nro}</span>
            <h1 className="tn-vp-ruutu-vali-nimi">{r.k.nimi}</h1>
            {r.k.nro === 1 && <span className="tn-vp-ruutu-vali-paketti">{otsikko}</span>}
          </div>
        )}

        {r.t === "kysymys" && (
          <div className="tn-vp-ruutu-kysymys" data-kuva={r.q.image_url ? "" : undefined}>
            <div className="tn-vp-ruutu-teksti">
              <h1 className="tn-vp-ruutu-k" data-pituus={pituus(kysymysTeksti(r.q))}>{kysymysTeksti(r.q)}</h1>
              {viittaaVaihtoehtoihin(r.q) && r.q.answers && (
                <ol className="tn-vp-ruutu-vaihtoehdot" type="A">
                  {r.q.answers.map((a) => <li key={a.text}>{a.text}</li>)}
                </ol>
              )}
              {r.q.animal_sound?.url && (
                <button type="button" className="tn-vp-ruutu-nappi tn-vp-ruutu-elain" onClick={() => soitaElain(r.q)} aria-pressed={elainSoi}>
                  {elainSoi ? "Pysäytä ääni" : "Soita ääni"}
                </button>
              )}
              {auki && (
                <div className="tn-vp-ruutu-vastaus">
                  <p className="tn-vp-ruutu-vastaus-t">{oikeaVastaus(r.q)}</p>
                  {r.q.explanation && <p className="tn-vp-ruutu-selitys">{r.q.explanation}</p>}
                </div>
              )}
            </div>
            {r.q.image_url && (
              <figure className="tn-vp-ruutu-kuva" data-kysymys={kuvaOnKysymys(r.q) ? "" : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.q.image_url} alt="" width={1536} height={1024}
                  style={r.q.image_position ? ({ objectPosition: r.q.image_position } as CSSProperties) : undefined} />
                {r.q.image_credit && <figcaption>{r.q.image_credit}</figcaption>}
              </figure>
            )}
          </div>
        )}

        {r.t === "kooste" && (
          <div className="tn-vp-ruutu-kooste">
            <h1 className="tn-vp-ruutu-kooste-h">Kierroksen vastaukset</h1>
            <ol className="tn-vp-ruutu-kooste-lista" style={{ "--rivit": Math.ceil(r.k.kysymykset.length / 2) } as CSSProperties}>
              {r.k.kysymykset.map((q) => (
                <li key={q.id}><span className="tn-vp-ruutu-kooste-k">{kysymysTeksti(q)}</span> <b>{oikeaVastaus(q)}</b></li>
              ))}
            </ol>
          </div>
        )}

        {r.t === "loppu" && (
          <div className="tn-vp-ruutu-vali">
            <h1 className="tn-vp-ruutu-vali-nimi">Visa on valmis</h1>
            <span className="tn-vp-ruutu-vali-paketti">{otsikko}</span>
          </div>
        )}
      </div>

      <footer className="tn-vp-ruutu-ala">
        <a className="tn-vp-ruutu-paluu" href={paluu}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          Takaisin
        </a>
        <div className="tn-vp-ruutu-napit">
          {lastenAania && (
            <button type="button" className="tn-vp-ruutu-nappi" onClick={vaihdaAani} aria-pressed={!aani}>
              {aani ? "Ääni pois" : "Ääni päälle"}
            </button>
          )}
          <button type="button" className="tn-vp-ruutu-nappi" onClick={kokoNaytto}>Koko näyttö</button>
          <button type="button" className="tn-vp-ruutu-nappi" onClick={() => siirry(n - 1)} disabled={n === 0}>Edellinen</button>
          {r.t === "kysymys" && !auki && (
            <button type="button" className="tn-vp-ruutu-nappi tn-vp-ruutu-nappi--kulta" onClick={() => setAuki(true)}>Näytä vastaus</button>
          )}
          {r.t === "loppu" ? (
            <button type="button" className="tn-cta-lime tn-vp-ruutu-cta" onClick={() => siirry(0)}>Alkuun</button>
          ) : (
            <button type="button" className="tn-cta-lime tn-vp-ruutu-cta" onClick={() => siirry(n + 1)}>Seuraava →</button>
          )}
        </div>
      </footer>
    </main>
  );
}
