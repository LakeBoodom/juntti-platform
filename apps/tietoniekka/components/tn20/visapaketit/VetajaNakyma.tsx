"use client";
// VISAPAKETIN JUONTAJAN NÄKYMÄ (V-F, päivitetty brief 29.10.2026): puhelimeen, kysymys ja oikea vastaus yhtä aikaa,
// selitys vastauksen alla. Numerointi on sama kuin televisionäkymässä (kierroksittain 1…n, kierrokset tasonKierrokset).
// Siirtyminen: kiinteä alapalkki, pyyhkäisy, nuolinäppäimet ja kierroslista (<dialog>). Wake Lock pitää näytön päällä,
// kohta tallennetaan localStorageen (paketti + taso). Lasten kierroksilla Kuuntele-nappi, ei automaattista soittoa.
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { kirjaaVp } from "@/lib/vpTapahtuma";
import { kuvaOnKysymys, kysymysTeksti, oikeaVastaus, viittaaVaihtoehtoihin, type Kierros, type PakettiKysymys } from "@/lib/visapaketit";

type Vaihe = { t: "kysymys"; k: Kierros; q: PakettiKysymys; i: number } | { t: "loppu" };

const pisin = (t: string) => Math.max(4, ...t.split(/[\s/–-]+/).map((w) => w.length));

export default function VetajaNakyma({ packId, otsikko, kierrokset, paluu, avain, mittaa }: {
  packId: string; otsikko: string; kierrokset: Kierros[]; paluu: string; avain: string; mittaa: boolean;
}) {
  const vaiheet = useMemo<Vaihe[]>(() => [
    ...kierrokset.flatMap((k) => k.kysymykset.map((q, i): Vaihe => ({ t: "kysymys", k, q, i }))),
    { t: "loppu" },
  ], [kierrokset]);

  const [n, setN] = useState(0);
  const [soi, setSoi] = useState<"puhe" | "elain" | null>(null);
  const aaniRef = useRef<HTMLAudioElement | null>(null);
  const listaRef = useRef<HTMLDialogElement | null>(null);
  const kosketus = useRef<{ x: number; y: number } | null>(null);
  const aloitettu = useRef(false);
  const lopetettu = useRef(false);
  const v = vaiheet[n];

  const vaikene = () => { aaniRef.current?.pause(); setSoi(null); };

  // Kohta talteen: palataan samaan kysymykseen, jos puhelin lukittuu tai sivu ladataan uudelleen.
  useEffect(() => {
    try {
      const tallessa = Number(localStorage.getItem(avain));
      if (Number.isInteger(tallessa) && tallessa > 0 && tallessa < vaiheet.length) { setN(tallessa); aloitettu.current = true; }
    } catch { /* ei tallennusta */ }
    return () => aaniRef.current?.pause();
  }, [avain, vaiheet.length]);

  // Näyttö päällä visan ajan. Lukitus vapautuu, kun välilehti piiloutuu → pyydetään uudelleen palatessa.
  useEffect(() => {
    let lukko: { release: () => Promise<void> } | null = null;
    const pyyda = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lukko = await (navigator as any).wakeLock?.request("screen") ?? null;
      } catch { /* ei tukea tai virransäästö */ }
    };
    const nakyvyys = () => { if (document.visibilityState === "visible") void pyyda(); };
    void pyyda();
    document.addEventListener("visibilitychange", nakyvyys);
    return () => { document.removeEventListener("visibilitychange", nakyvyys); void lukko?.release().catch(() => {}); };
  }, []);

  const siirry = useCallback((uusi: number) => {
    const i = Math.max(0, Math.min(vaiheet.length - 1, uusi));
    if (i === n) return;
    if (i > 0 && !aloitettu.current) { aloitettu.current = true; if (mittaa) kirjaaVp(packId, "vetaja_aloitus"); }
    if (vaiheet[i].t === "loppu" && !lopetettu.current) { lopetettu.current = true; if (mittaa) kirjaaVp(packId, "vetaja_loppu"); }
    vaikene();
    setN(i);
    try { localStorage.setItem(avain, String(i)); } catch { /* ei tallennusta */ }
    window.scrollTo({ top: 0 });
  }, [n, vaiheet, mittaa, packId, avain]);

  useEffect(() => {
    const kuuntele = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || listaRef.current?.open) return;
      if (e.key === "ArrowRight") { e.preventDefault(); siirry(n + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); siirry(n - 1); }
    };
    window.addEventListener("keydown", kuuntele);
    return () => window.removeEventListener("keydown", kuuntele);
  }, [siirry, n]);

  const alku = (e: TouchEvent) => { const t = e.touches[0]; kosketus.current = { x: t.clientX, y: t.clientY }; };
  const loppu = (e: TouchEvent) => {
    const a = kosketus.current;
    kosketus.current = null;
    if (!a) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - a.x;
    const dy = t.clientY - a.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    siirry(dx < 0 ? n + 1 : n - 1);
  };

  const soita = (laji: "puhe" | "elain", url: string) => {
    const a = aaniRef.current ?? new Audio();
    aaniRef.current = a;
    if (soi === laji && !a.paused) { vaikene(); return; }
    a.pause();
    a.setAttribute("playsinline", "");
    a.onplaying = () => setSoi(laji);
    a.onended = () => setSoi(null);
    a.src = url;
    a.play().catch(() => setSoi(null));
  };

  const avaaLista = () => listaRef.current?.showModal();
  const hyppaa = (k: Kierros) => {
    listaRef.current?.close();
    siirry(vaiheet.findIndex((x) => x.t === "kysymys" && x.k === k));
  };

  const ilmoitus = v.t === "kysymys"
    ? `Kierros ${v.k.nro}, kysymys ${v.i + 1} / ${v.k.kysymykset.length}: ${kysymysTeksti(v.q)}. Vastaus: ${oikeaVastaus(v.q)}`
    : "Visa on valmis";
  const lapsi = v.t === "kysymys" && v.k.kohderyhma === "lapset";

  return (
    <main className="tn-vp-vetaja">
      <header className="tn-vp-vetaja-yla">
        <a className="tn-vp-vetaja-paluu" href={paluu} aria-label="Takaisin pakettisivulle">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </a>
        <button type="button" className="tn-vp-vetaja-kierros" onClick={avaaLista} aria-haspopup="dialog">
          <span className="tn-vp-vetaja-kierros-t">{v.t === "kysymys" ? `Kierros ${v.k.nro} · ${v.k.nimi}` : otsikko}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {v.t === "kysymys" && <span className="tn-vp-vetaja-eteneminen">{v.i + 1}/{v.k.kysymykset.length}</span>}
      </header>

      <p className="tn-vp-sr" aria-live="polite">{ilmoitus}</p>

      <div className="tn-vp-vetaja-sisalto" key={n} onTouchStart={alku} onTouchEnd={loppu}>
        {v.t === "kysymys" ? (
          <article className="tn-vp-vetaja-kortti">
            <h1 className="tn-vp-vetaja-k">
              <span className="tn-vp-vetaja-nro" aria-hidden="true">{v.i + 1}</span>
              {kysymysTeksti(v.q)}
            </h1>
            {viittaaVaihtoehtoihin(v.q) && v.q.answers && (
              <ol className="tn-vp-vetaja-vaihtoehdot" type="A">
                {v.q.answers.map((a) => <li key={a.text}>{a.text}</li>)}
              </ol>
            )}
            {kuvaOnKysymys(v.q) && v.q.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="tn-vp-vetaja-kuva" src={v.q.image_url} alt="" width={1536} height={1024}
                style={v.q.image_position ? ({ objectPosition: v.q.image_position } as CSSProperties) : undefined} />
            )}
            {lapsi && (v.q.audio?.kysymys || v.q.animal_sound?.url) && (
              <div className="tn-vp-vetaja-aanet">
                {v.q.audio?.kysymys && (
                  <button type="button" className="tn-vp-vetaja-nappi" onClick={() => soita("puhe", v.q.audio!.kysymys!)} aria-pressed={soi === "puhe"}>
                    {soi === "puhe" ? "Pysäytä" : "Kuuntele"}
                  </button>
                )}
                {v.q.animal_sound?.url && (
                  <button type="button" className="tn-vp-vetaja-nappi" onClick={() => soita("elain", v.q.animal_sound!.url!)} aria-pressed={soi === "elain"}>
                    {soi === "elain" ? "Pysäytä ääni" : "Soita ääni"}
                  </button>
                )}
              </div>
            )}
            <div className="tn-vp-vetaja-vastaus" style={{ "--lw": pisin(oikeaVastaus(v.q)) } as CSSProperties}>
              <p className="tn-vp-vetaja-vastaus-t">{oikeaVastaus(v.q)}</p>
              {v.q.explanation && <p className="tn-vp-vetaja-selitys">{v.q.explanation}</p>}
            </div>
          </article>
        ) : (
          <div className="tn-vp-vetaja-loppu">
            <h1 className="tn-vp-vetaja-loppu-h">Visa on valmis</h1>
            <p className="tn-vp-vetaja-loppu-p">{otsikko}</p>
          </div>
        )}
      </div>

      <footer className="tn-vp-vetaja-ala">
        <button type="button" className="tn-vp-vetaja-nappi" onClick={() => siirry(n - 1)} disabled={n === 0}>Edellinen</button>
        {v.t === "loppu" ? (
          <button type="button" className="tn-cta-lime tn-vp-vetaja-cta" onClick={() => siirry(0)}>Alkuun</button>
        ) : (
          <button type="button" className="tn-cta-lime tn-vp-vetaja-cta" onClick={() => siirry(n + 1)}>Seuraava →</button>
        )}
      </footer>

      <dialog ref={listaRef} className="tn-vp-vetaja-lista" aria-labelledby="vp-vetaja-lista-h" onClick={(e) => { if (e.target === listaRef.current) listaRef.current?.close(); }}>
        <div className="tn-vp-vetaja-lista-sisa">
          <h2 id="vp-vetaja-lista-h" className="tn-vp-vetaja-lista-h">Kierrokset</h2>
          <ol className="tn-vp-vetaja-lista-ol">
            {kierrokset.map((k) => (
              <li key={k.nro}>
                <button type="button" className="tn-vp-vetaja-lista-k" onClick={() => hyppaa(k)} aria-current={v.t === "kysymys" && v.k === k ? "true" : undefined}>
                  <span className="tn-vp-vetaja-lista-nro">{k.nro}</span>
                  <span className="tn-vp-vetaja-lista-nimi">{k.nimi}</span>
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="tn-vp-vetaja-nappi tn-vp-vetaja-sulje" onClick={() => listaRef.current?.close()}>Sulje</button>
        </div>
      </dialog>
    </main>
  );
}
