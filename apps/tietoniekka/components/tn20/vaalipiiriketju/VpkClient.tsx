"use client";
// VAALIPIIRIKETJU — pelinäkymä (CD "TN Vaalipiiriketju - pelinäkymä" 2a–2i, katselmus kierros 1,
// Heikin muutokset 5.10.2026). Mekaniikka kuten Kuntaliitoksessa:
//   - Ketjun päät (kortit 1 ja 8) ovat lukittuina, niiden vaalipiiri näkyy heti ja ne korostetaan
//     kartalla jo ennen tarkistusta. Pelaaja järjestää 6 keskimmäistä.
//   - Mobiili (< 1080 px): napautus antaa kortille järjestysnumeron 2–7, ruudukko pysyy paikallaan.
//   - Desktop: pino + ketju; raahaus paikalle 2–7 (täyteen paikkaan pudotus vaihtaa kortit),
//     klikkaus lisää seuraavaan vapaaseen paikkaan tai palauttaa pinoon, Enter samoin.
//   - Mikä tahansa ehjä ketju alusta loppuun hyväksytään; pisteet kuudesta kortista (tarkista()).
//   - Päivän ketju kerran päivässä (tulos selaimeen → "jo pelattu", myös hubin kortti).
//     "Pelaa uusi ketju" arpoo harjoitusketjun (?ketju=), tilastoon paivan_reitti = false.
//     Jaettava tulos on aina päivän ketjun tulos.
// Katselmuksen korjaukset: Tarkista-nappi tarttuvassa alapalkissa myös desktopissa (§1), kaari
// väärälle linkille (§2, VpkKartta), SDP → Sosialidemokraatit (§3, data), Visa-linkki vain
// julkaistulle visalle (§4, data), pelilinkki pakkaan vain kun se on julki (§5, sivu),
// yhteinen numerointi (§6), oikea reitti = päivän generoitu reitti (§7).

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  jakoteksti,
  lueTallenne,
  tallenneAvain,
  tarkista,
  uusiKetjuSiemen,
  VPK_JARJESTETTAVIA,
  VPK_KORTTEJA,
  VPK_NIMI,
  VPK_SIVU,
  type VpkEdustaja,
  type VpkKierros,
  type VpkTallenne,
} from "@/lib/vaalipiiriketju";
import VaalipiiriKartta, { type VpkJakso, type VpkSolmu } from "@/components/tn20/vaalipiirit/VaalipiiriKartta";

type Vaihe = "peli" | "tulos";
type KorttiTila = "lepo" | "valittu" | "veto" | "ok" | "bad" | "lukittu";

const TYHJA: Array<string | null> = Array(VPK_JARJESTETTAVIA).fill(null);
const LINKKEJA = VPK_KORTTEJA - 1;
const VALI_MS = 360;
const harjoitusAvain = (iso: string) => `tn-vpk-harjoitus-${iso}`;

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

/** Tilasto (vaalipiiriketju_pelit). Best-effort: epäonnistuminen ei näy pelaajalle. */
async function tallenna(r: { siemen: string; paivanReitti: boolean; yritys: number; oikein: number; edustajat: string[] }) {
  try {
    const sb = getSupabase();
    if (!sb) return;
    await sb.from("vaalipiiriketju_pelit" as never).insert({
      siemen: r.siemen, paivan_reitti: r.paivanReitti, yritys: r.yritys, oikein: r.oikein, edustajat: r.edustajat, session_id: istunto(),
    } as never);
  } catch {
    // tilasto jää saamatta — peli jatkuu normaalisti
  }
}

/** Harjoitusketjujen juokseva laskuri päivältä (yritys kuten Kuntaliitoksessa). */
function seuraavaYritys(iso: string): number {
  try {
    const n = Number(localStorage.getItem(harjoitusAvain(iso)) ?? "0") + 1;
    localStorage.setItem(harjoitusAvain(iso), String(n));
    return n;
  } catch {
    return 1;
  }
}

const OK = "M5 12.6 9.8 17.4 19 7.4";
const RISTI = "M7 7l10 10M17 7 7 17";
const NASTA = "M12 21s-6.5-6.1-6.5-11.2A6.5 6.5 0 0 1 18.5 9.8C18.5 14.9 12 21 12 21Z M12 12.3a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z";
const KAHVA = "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01";
const LUKKO = "M7 10V7.5a5 5 0 0 1 10 0V10M5.5 10h13v10h-13z";

/** TN-Edustajakortti (CD 2i): laatta (mobiili) tai rivi (pino, ketju, tulos). Lukittu = ketjun pää. */
function Kortti({ e, muoto, tila, num, vp, visa, kahva, salkku }: { e: VpkEdustaja; muoto: "laatta" | "rivi"; tila: KorttiTila; num?: number; vp?: string; visa?: boolean; kahva?: boolean; salkku?: boolean }) {
  // Ministerin salkku vasta tarkistuksen jälkeen (Heikki 5.10.: paljastaisi muuten liikaa).
  const puolue = salkku && e.salkku ? `${e.puolue} · ${e.salkku}` : e.puolue;
  const paljastettu = tila === "ok" || tila === "bad";
  const lukittu = tila === "lukittu";
  const merkki = paljastettu && (
    <span className="vpk-merkki" data-tila={tila}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={tila === "ok" ? OK : RISTI} /></svg>
    </span>
  );
  const piiri = (paljastettu || lukittu) && vp && (
    <span className="vpk-kortti-vp">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={NASTA} /></svg>
      <span>{vp}</span>
    </span>
  );
  const visaLinkki = visa && (paljastettu || lukittu) && e.visa && (
    <a className="vpk-visa" href={e.visa} onClick={(ev) => ev.stopPropagation()}>
      Visa →
    </a>
  );
  if (muoto === "laatta") {
    return (
      <span className="vpk-kortti vpk-kortti--laatta" data-tila={tila}>
        <span className="vpk-kortti-t">
          <span className="vpk-kortti-nimi" lang="fi">{e.nimi}</span>
          <span className="vpk-kortti-puolue">{e.puolue}</span>
        </span>
        {paljastettu && (
          <span className="vpk-kortti-ala">
            {piiri}
            {merkki}
          </span>
        )}
        {!!num && !paljastettu && <span className="vpk-laatta-num">{num}</span>}
        {visaLinkki}
      </span>
    );
  }
  return (
    <span className="vpk-kortti vpk-kortti--rivi" data-tila={tila}>
      {!!num && <span className="vpk-rivi-num">{num}</span>}
      <span className="vpk-kortti-t">
        <span className="vpk-kortti-nimi" lang="fi">{e.nimi}</span>
        <span className="vpk-rivi-ala">
          <span className="vpk-kortti-puolue">{puolue}</span>
          {piiri}
        </span>
      </span>
      {merkki}
      {kahva && !paljastettu && !lukittu && (
        <svg className="vpk-kahva" viewBox="0 0 24 24" aria-hidden="true"><path d={KAHVA} /></svg>
      )}
      {lukittu && !visaLinkki && (
        <svg className="vpk-lukko" viewBox="0 0 24 24" aria-label="Lukittu ketjun pää"><path d={LUKKO} /></svg>
      )}
      {visaLinkki}
    </span>
  );
}

export default function VpkClient({
  k,
  pakka,
  hubHref,
  lahde,
}: {
  k: VpkKierros;
  /** Tuloksen pelilinkki: Pääministerit-pakka, kun se on julki; muuten hubin pakkarivi (katselmus §5). */
  pakka: { href: string; teksti: string };
  hubHref: string;
  lahde: string;
}) {
  const [slots, setSlots] = useState<Array<string | null>>(TYHJA);
  const [vaihe, setVaihe] = useState<Vaihe>("peli");
  const [paljastettu, setPaljastettu] = useState(0);
  const [pelattu, setPelattu] = useState(false);
  const [paivanTulos, setPaivanTulos] = useState<VpkTallenne | null>(null);
  const [nakyma, setNakyma] = useState<"oma" | "oikea">("oma");
  const [veto, setVeto] = useState<{ id: string; dx: number; dy: number; liikkui: boolean } | null>(null);
  const [yli, setYli] = useState<number | null>(null);
  const [jaettu, setJaettu] = useState(false);
  const ajastin = useRef<ReturnType<typeof setInterval> | null>(null);
  const irrota = useRef<(() => void) | null>(null);
  const juuri = useRef<HTMLDivElement>(null);

  const harjoitus = k.harjoitus !== null;
  const edustajat = useMemo(() => new Map(k.reitti.map((e) => [e.id, e])), [k.reitti]);
  const vpt = useMemo(() => new Map(k.vaalipiirit.map((v) => [v.id, v])), [k.vaalipiirit]);
  const geomNimi = useMemo(() => new Map(k.vaalipiirit.map((v) => [v.k, v.nimi])), [k.vaalipiirit]);
  const nimi = (g: string) => geomNimi.get(g) ?? g;
  const vpNimi = (id: string) => vpt.get(id)?.nimi ?? id;
  const vpK = (id: string) => vpt.get(id)?.k ?? "";
  const alku = k.reitti[0];
  const loppu = k.reitti[VPK_KORTTEJA - 1];

  // Päivän ketju jo pelattu → tulos suoraan (ei animaatiota). Harjoituksessa luetaan päivän tulos jakoa varten.
  useEffect(() => {
    const t = lueTallenne(k.iso);
    setPaivanTulos(t);
    if (!harjoitus && t && t.jarjestys.every((id) => k.pino.includes(id))) {
      setSlots(t.jarjestys);
      setVaihe("tulos");
      setPaljastettu(LINKKEJA);
      setPelattu(true);
    }
    return () => {
      if (ajastin.current) clearInterval(ajastin.current);
      irrota.current?.();
    };
  }, [k.iso, k.pino, harjoitus]);

  const sijoitettu = slots.filter(Boolean).length;
  const pelissa = vaihe === "peli";

  // ── Siirrot ──
  const vaihda = (id: string) => {
    if (!pelissa) return;
    setSlots((s) => {
      const n = s.slice();
      const i = n.indexOf(id);
      if (i >= 0) n[i] = null;
      else {
        const vapaa = n.indexOf(null);
        if (vapaa >= 0) n[vapaa] = id;
      }
      return n;
    });
  };
  const pudota = (id: string, paikka: number) =>
    setSlots((s) => {
      const n = s.slice();
      const mista = n.indexOf(id);
      if (paikka === -1) {
        if (mista >= 0) n[mista] = null;
        return n;
      }
      const vanha = n[paikka];
      if (mista >= 0) n[mista] = vanha;
      n[paikka] = id;
      return n;
    });
  const nappain = (id: string, e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      vaihda(id);
    }
  };
  /** Desktop-raahaus (CD): kohde pisteen alta, [data-slot] = ketjun paikka, [data-pool] = pino. */
  const alas = (id: string, e: RPointerEvent<HTMLDivElement>) => {
    if (!pelissa || (e.pointerType === "mouse" && e.button > 0)) return;
    const [x0, y0] = [e.clientX, e.clientY];
    let liikkui = false;
    const kohde = (ev: PointerEvent): number | null => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const s = el?.closest("[data-slot]");
      if (s) return Number(s.getAttribute("data-slot"));
      return el?.closest("[data-pool]") ? -1 : null;
    };
    const liike = (ev: PointerEvent) => {
      const [dx, dy] = [ev.clientX - x0, ev.clientY - y0];
      liikkui = liikkui || Math.hypot(dx, dy) > 6;
      setVeto({ id, dx, dy, liikkui });
      setYli(liikkui ? kohde(ev) : null);
    };
    const ylos = (ev: PointerEvent) => {
      irrota.current?.();
      if (liikkui) {
        const t = kohde(ev);
        if (t !== null) pudota(id, t);
      } else vaihda(id);
      setVeto(null);
      setYli(null);
    };
    window.addEventListener("pointermove", liike);
    window.addEventListener("pointerup", ylos);
    window.addEventListener("pointercancel", ylos);
    irrota.current = () => {
      window.removeEventListener("pointermove", liike);
      window.removeEventListener("pointerup", ylos);
      window.removeEventListener("pointercancel", ylos);
      irrota.current = null;
    };
  };
  const vetoTyyli = (id: string): CSSProperties | undefined =>
    veto?.id === id && veto.liikkui ? { transform: `translate(${veto.dx}px, ${veto.dy}px)`, zIndex: 20, pointerEvents: "none" } : undefined;

  // ── Tulos ──
  const koko = useMemo(() => (slots.every(Boolean) ? [alku.id, ...(slots as string[]), loppu.id] : null), [slots, alku.id, loppu.id]);
  const tulos = useMemo(() => (koko ? tarkista(koko.map((id) => edustajat.get(id)!.vp), k.linkit) : null), [koko, edustajat, k.linkit]);
  const valmis = vaihe === "tulos" && paljastettu >= LINKKEJA;

  const tarkistaKetju = () => {
    if (!tulos || !koko) return;
    setVaihe("tulos");
    setNakyma("oma");
    if (harjoitus) {
      void tallenna({ siemen: k.harjoitus!, paivanReitti: false, yritys: seuraavaYritys(k.iso), oikein: tulos.oikein, edustajat: koko });
    } else {
      const t: VpkTallenne = { numero: k.numero, jarjestys: slots as string[], kortit: tulos.kortit, oikein: tulos.oikein };
      try {
        localStorage.setItem(tallenneAvain(k.iso), JSON.stringify(t));
      } catch {
        // ei tallennusta selaimeen
      }
      setPaivanTulos(t);
      void tallenna({ siemen: k.iso, paivanReitti: true, yritys: 1, oikein: tulos.oikein, edustajat: koko });
    }
    juuri.current?.scrollIntoView({ block: "start", behavior: hiljaa() ? "auto" : "smooth" });
    if (hiljaa()) {
      setPaljastettu(LINKKEJA);
      return;
    }
    setPaljastettu(0);
    let n = 0;
    if (ajastin.current) clearInterval(ajastin.current);
    ajastin.current = setInterval(() => {
      n++;
      setPaljastettu(n);
      if (n >= LINKKEJA && ajastin.current) clearInterval(ajastin.current);
    }, VALI_MS);
  };

  // Arvotaan vasta painettaessa: renderissä arvottu siemen erottaisi palvelimen ja selaimen HTML:n.
  const uusiKetju = () => location.assign(`${VPK_SIVU}?ketju=${uusiKetjuSiemen()}`);

  /** Jaetaan aina päivän ketjun tulos (myös harjoitusketjun tulosnäkymästä). */
  async function jaa() {
    if (!paivanTulos) return;
    const teksti = jakoteksti(paivanTulos.numero, paivanTulos.kortit);
    const url = `${location.origin}${VPK_SIVU}`;
    try {
      if (navigator.share) await navigator.share({ title: `${VPK_NIMI} #${paivanTulos.numero}`, text: teksti, url });
      else await navigator.clipboard.writeText(`${teksti}\n${url}`);
      setJaettu(true);
    } catch {
      // jako peruttu
    }
  }

  // ── Yläpalkin tilanne ──
  const meta = pelissa
    ? { nimi: "Ketjussa", arvo: `${sijoitettu}/${VPK_JARJESTETTAVIA}`, vari: "#F5F0E6" }
    : { nimi: "Tulos", arvo: valmis && tulos ? `${tulos.oikein}/${VPK_JARJESTETTAVIA}` : "…", vari: "#B6FF3C" };

  const paat: VpkSolmu[] = [
    { k: vpK(alku.vp), num: 1, tila: "lukittu" },
    { k: vpK(loppu.vp), num: VPK_KORTTEJA, tila: "lukittu" },
  ];

  const otsikko = (
    <div className="vpk-otsake">
      <div className="vpk-polku">
        <a href={hubHref}>← Vaalit ja politiikka</a>
        <span aria-hidden="true">·</span>
        {harjoitus ? (
          <>
            <span>Harjoitusketju</span>
            <span aria-hidden="true">·</span>
            <a href={VPK_SIVU}>Päivän ketju #{k.numero} →</a>
          </>
        ) : (
          <span>{k.paivays}</span>
        )}
      </div>
      <h1 className="vpk-h1">
        {VPK_NIMI} <span>{harjoitus ? "Harjoitus" : `#${k.numero}`}</span>
      </h1>
      <p className="vpk-lede">
        Ketjun alku ja loppu ovat valmiina. Järjestä kuusi kansanedustajaa väliin niin, että jokaisen vaalipiiri rajautuu edellisen vaalipiiriin.
      </p>
      <p className="vpk-ohje">
        <span className="vpk-vain-kapea">Napauta kortteja ketjun järjestyksessä. Napauta uudelleen poistaaksesi.</span>
        <span className="vpk-vain-levea">Raahaa kortti ketjuun tai klikkaa sitä. Klikkaus ketjussa palauttaa kortin pinoon. Näppäimistöllä Enter.</span>
      </p>
    </div>
  );

  const pino = k.pino.filter((id) => !slots.includes(id));
  const lukittuKortti = (e: VpkEdustaja, num: number) => (
    <div className="vpk-lukittu" aria-label={`${e.nimi}, ${e.puolue}, ${vpNimi(e.vp)}. Ketjun ${num === 1 ? "alku" : "loppu"}, lukittu paikalle ${num}.`}>
      <Kortti e={e} muoto="rivi" tila="lukittu" num={num} vp={vpNimi(e.vp)} />
    </div>
  );

  return (
    <div className="vpk" ref={juuri}>
      <header className="vpk-bar">
        <span className="vpk-bar-l">
          <a className="vpk-logo" href="/" aria-label="Tietoniekka etusivulle">
            <span>TIETO</span>NIEKKA
          </a>
          <span className="vpk-bar-sep" aria-hidden="true" />
          <span className="vpk-bar-nimi">{VPK_NIMI}</span>
        </span>
        <span className="vpk-bar-r">
          <span className="vpk-bar-pikku">{meta.nimi}</span>
          <span className="vpk-bar-arvo" style={{ color: meta.vari }}>{meta.arvo}</span>
        </span>
      </header>

      {pelissa ? (
        <div className="vpk-main vpk-main--peli">
          <div className="vpk-peli">
            {otsikko}

            {/* Mobiili: lukittu alku, napautusruudukko (paikat 2–7), lukittu loppu */}
            <div className="vpk-mobiili vpk-vain-kapea">
              {lukittuKortti(alku, 1)}
              <div className="vpk-ruudukko" role="list" aria-label="Järjestettävät kansanedustajat">
                {k.pino.map((id) => {
                  const e = edustajat.get(id)!;
                  const i = slots.indexOf(id);
                  return (
                    <div
                      key={id}
                      role="listitem"
                      tabIndex={0}
                      className="vpk-napautus"
                      aria-label={`${e.nimi}, ${e.puolue}.${i >= 0 ? ` Ketjussa sijalla ${i + 2}. Napauta poistaaksesi.` : " Napauta lisätäksesi ketjuun."}`}
                      onClick={() => vaihda(id)}
                      onKeyDown={(ev) => nappain(id, ev)}
                    >
                      <Kortti e={e} muoto="laatta" tila={i >= 0 ? "valittu" : "lepo"} num={i >= 0 ? i + 2 : 0} />
                    </div>
                  );
                })}
              </div>
              {lukittuKortti(loppu, VPK_KORTTEJA)}
            </div>

            {/* Desktop: pino + ketju */}
            <div className="vpk-kaksi vpk-vain-levea">
              <div className="vpk-pino" data-pool="1">
                <div className="vpk-sarake-yla">
                  <span className="vpk-pikku">Kansanedustajat</span>
                  <span className="vpk-laskuri">{pino.length} jäljellä</span>
                </div>
                {pino.map((id) => {
                  const e = edustajat.get(id)!;
                  return (
                    <div
                      key={id}
                      tabIndex={0}
                      className="vpk-vedettava"
                      aria-label={`${e.nimi}, ${e.puolue}. Raahaa ketjuun tai paina Enter.`}
                      onPointerDown={(ev) => alas(id, ev)}
                      onKeyDown={(ev) => nappain(id, ev)}
                      style={vetoTyyli(id)}
                    >
                      <Kortti e={e} muoto="rivi" tila={veto?.id === id && veto.liikkui ? "veto" : "lepo"} kahva />
                    </div>
                  );
                })}
                {!pino.length && <div className="vpk-pino-tyhja">Kaikki kuusi ovat ketjussa.</div>}
              </div>
              <ol className="vpk-ketju" aria-label="Ketju">
                <li className="vpk-sarake-yla">
                  <span className="vpk-pikku vpk-pikku--lila">Ketju</span>
                  <span className="vpk-laskuri">{sijoitettu}/{VPK_JARJESTETTAVIA}</span>
                </li>
                <li>{lukittuKortti(alku, 1)}</li>
                {slots.map((id, i) => (
                  <li key={i} data-slot={i}>
                    {id ? (
                      <div
                        tabIndex={0}
                        className="vpk-vedettava"
                        aria-label={`${edustajat.get(id)!.nimi}. Ketjussa sijalla ${i + 2}. Enter poistaa.`}
                        onPointerDown={(ev) => alas(id, ev)}
                        onKeyDown={(ev) => nappain(id, ev)}
                        style={vetoTyyli(id)}
                      >
                        <Kortti e={edustajat.get(id)!} muoto="rivi" tila={veto?.id === id && veto.liikkui ? "veto" : yli === i ? "valittu" : "lepo"} num={i + 2} kahva />
                      </div>
                    ) : (
                      <div className="vpk-paikka" data-yli={yli === i || undefined}>
                        <span className="vpk-paikka-num">{i + 2}</span>
                        <span>{yli === i ? "Pudota tähän" : ""}</span>
                      </div>
                    )}
                  </li>
                ))}
                <li>{lukittuKortti(loppu, VPK_KORTTEJA)}</li>
              </ol>
            </div>

            <div className="vpk-toiminto">
              <button type="button" className="vpk-tarkista" disabled={sijoitettu < VPK_JARJESTETTAVIA} onClick={tarkistaKetju}>
                {sijoitettu === 0 ? `Järjestä ${VPK_JARJESTETTAVIA} kansanedustajaa` : sijoitettu < VPK_JARJESTETTAVIA ? `Vielä ${VPK_JARJESTETTAVIA - sijoitettu}` : "Tarkista ketju"}
              </button>
              {sijoitettu > 0 && (
                <button type="button" className="vpk-tyhjenna" onClick={() => setSlots(TYHJA)}>
                  Tyhjennä
                </button>
              )}
            </div>

            {/* Mobiili: ketjun päät kartalla (Kuntaliitoksen tapaan kartta listan alla) */}
            <div className="vpk-mkartta vpk-vain-kapea">
              <span className="vpk-pikku">Ketjun päät</span>
              <div className="vpk-kartta-kehys vpk-kartta-kehys--tulos">
                <VaalipiiriKartta mode="reitti" solmut={paat} nimi={nimi} />
              </div>
            </div>
          </div>

          <aside className="vpk-sivukartta vpk-vain-levea">
            <span className="vpk-pikku">Kartta</span>
            <div className="vpk-kartta-kehys">
              <VaalipiiriKartta mode="reitti" solmut={paat} nimi={nimi} />
            </div>
            <p>Ketjun alku ja loppu näkyvät kartalla. Reitti piirtyy, kun tarkistat ketjun.</p>
          </aside>
        </div>
      ) : (
        tulos &&
        koko && (
          <Tulos
            k={k}
            tulos={tulos}
            koko={koko}
            edustajat={edustajat}
            vpNimi={vpNimi}
            vpK={vpK}
            nimi={nimi}
            paljastettu={paljastettu}
            valmis={valmis}
            pelattu={pelattu}
            harjoitus={harjoitus}
            nakyma={nakyma}
            setNakyma={setNakyma}
            uusiKetju={uusiKetju}
            jaa={paivanTulos ? jaa : null}
            jaettu={jaettu}
            pakka={pakka}
            hubHref={hubHref}
          />
        )
      )}

      <section className="vpk-info" aria-labelledby="vpk-info-h">
        <h2 id="vpk-info-h">Näin pelaat</h2>
        <ol>
          <li><b>Ketjun päät ovat valmiina.</b> Ensimmäinen ja viimeinen kansanedustaja on lukittu paikoilleen, ja heidän vaalipiirinsä näkyy kartalla.</li>
          <li><b>Järjestä kuusi väliin.</b> Jokainen kortti on istuva kansanedustaja eri vaalipiiristä. Vaalipiiri paljastuu vasta tarkistuksessa. Ahvenanmaalta pääsee lautalla Varsinais-Suomeen.</li>
          <li><b>Mikä tahansa ehjä ketju kelpaa.</b> Kortti on oikein, jos sen vaalipiiri rajautuu edelliseen; viimeisen pitää rajautua myös ketjun loppuun. Uusi päivän ketju joka päivä, ja harjoitusketjuja voi pelata niin monta kuin haluaa.</li>
        </ol>
        <p className="vpk-lahde">{lahde}</p>
      </section>
    </div>
  );
}

function Tulos(p: {
  k: VpkKierros;
  tulos: ReturnType<typeof tarkista>;
  koko: string[];
  edustajat: Map<string, VpkEdustaja>;
  vpNimi: (id: string) => string;
  vpK: (id: string) => string;
  nimi: (k: string) => string;
  paljastettu: number;
  valmis: boolean;
  pelattu: boolean;
  harjoitus: boolean;
  nakyma: "oma" | "oikea";
  setNakyma: (n: "oma" | "oikea") => void;
  uusiKetju: () => void;
  jaa: (() => void) | null;
  jaettu: boolean;
  pakka: { href: string; teksti: string };
  hubHref: string;
}) {
  const { k, tulos, koko, edustajat, paljastettu, valmis } = p;
  const vp = koko.map((id) => edustajat.get(id)!.vp);
  const nakyma = tulos.kelpaa ? "oma" : p.nakyma;
  /** Keskimmäinen kortti j (paikka j + 2) paljastuu, kun sen linkit on tarkistettu. */
  const nakyy = (j: number) => paljastettu >= (j === VPK_JARJESTETTAVIA - 1 ? LINKKEJA : j + 1);
  const reitinValit = tarkista(k.reitti.map((x) => x.vp), k.linkit).valit;

  const kartta: { solmut: VpkSolmu[]; jaksot: VpkJakso[] } =
    nakyma === "oikea"
      ? {
          solmut: k.reitti.map((e, i) => ({ k: p.vpK(e.vp), num: i + 1, tila: i === 0 || i === VPK_KORTTEJA - 1 ? "lukittu" : "ok" })),
          jaksot: k.reitti.slice(1).map((e, i) => ({ a: p.vpK(k.reitti[i].vp), b: p.vpK(e.vp), tyyppi: reitinValit[i] })),
        }
      : {
          solmut: vp.flatMap((v, i): VpkSolmu[] => {
            if (i === 0 || i === VPK_KORTTEJA - 1) return [{ k: p.vpK(v), num: i + 1, tila: "lukittu" }];
            return nakyy(i - 1) ? [{ k: p.vpK(v), num: i + 1, tila: tulos.kortit[i - 1] ? "ok" : "bad" }] : [];
          }),
          jaksot: tulos.valit.slice(0, paljastettu).map((t, i) => ({ a: p.vpK(vp[i]), b: p.vpK(vp[i + 1]), tyyppi: t })),
        };
  const katkos = tulos.ensimmainenKatkos;
  const tuomio = !valmis
    ? "Tarkistetaan linkki kerrallaan…"
    : tulos.kelpaa
      ? "Jokainen vaalipiiri rajautuu edelliseen. Ehjä ketju alusta loppuun."
      : `Ketju katkesi kohdassa ${p.vpNimi(vp[katkos])} → ${p.vpNimi(vp[katkos + 1])}: näillä vaalipiireillä ei ole yhteistä rajaa.`;

  return (
    <div className="vpk-main vpk-main--tulos">
      {p.pelattu && (
        <div className="vpk-pelattu" role="status">
          <span>
            <b>Pelasit tämän päivän ketjun.</b>
            <span>Uusi päivän ketju huomenna klo 00.00</span>
          </span>
          <span className="vpk-pelattu-seur">{k.huomenna}</span>
        </div>
      )}

      <div className="vpk-banneri" data-tila={valmis ? (tulos.kelpaa ? "ok" : "valmis") : "kesken"}>
        <div className="vpk-polku">
          {p.harjoitus ? (
            <>
              <span className="vpk-lila">Harjoitusketju</span>
              <span aria-hidden="true">·</span>
              <span>Ei vaikuta päivän tulokseen</span>
            </>
          ) : (
            <>
              <span className="vpk-lila">{VPK_NIMI} #{k.numero}</span>
              <span aria-hidden="true">·</span>
              <span>{k.paivays}</span>
            </>
          )}
        </div>
        <div className="vpk-tulosrivi" role="status" aria-live="polite">
          <span className="vpk-pisteet">{valmis ? `${tulos.oikein}/${VPK_JARJESTETTAVIA} oikein` : "Tarkistetaan"}</span>
          <span className="vpk-ruudut" aria-hidden="true">
            {tulos.kortit.map((ok, j) => (
              <span key={j}>
                <span className="vpk-ruutu" style={{ background: nakyy(j) ? (ok ? "#B6FF3C" : "#FF6B4A") : "#2B2317" }} />
                {j < VPK_JARJESTETTAVIA - 1 && (
                  <span className="vpk-ruutuvali" style={{ background: paljastettu > j + 1 ? (tulos.valit[j + 1] ? "#5C7A2A" : "#7A3426") : "#2B2317" }} />
                )}
              </span>
            ))}
          </span>
        </div>
        <p className="vpk-tuomio">{tuomio}</p>
        {valmis && (
          <div className="vpk-napit">
            <button type="button" className="vpk-jaa" onClick={p.uusiKetju}>
              Pelaa uusi ketju
            </button>
            {p.jaa ? (
              <button type="button" className="vpk-toissija" onClick={p.jaa}>
                {p.jaettu ? "Tulos jaettu" : p.harjoitus ? `Jaa päivän tulos #${k.numero}` : "Jaa tulos"}
              </button>
            ) : (
              <a className="vpk-toissija" href={VPK_SIVU}>
                Pelaa päivän ketju #{k.numero}
              </a>
            )}
            <a className="vpk-kolmas" href={p.pakka.href}>
              {p.pakka.teksti} →
            </a>
          </div>
        )}
      </div>

      <div className="vpk-tulos-grid">
        <div className="vpk-oma">
          <div className="vpk-pikku vpk-pikku--vali">Sinun ketjusi</div>
          <ol aria-label="Sinun ketjusi">
            {koko.map((id, i) => {
              const paa = i === 0 || i === VPK_KORTTEJA - 1;
              const l = i > 0 ? tulos.valit[i - 1] : null;
              const lNakyy = i > 0 && paljastettu >= i;
              const liitos = !lNakyy ? "odottaa" : l === "lautta" ? "lautta" : l ? "ok" : "bad";
              const tila: KorttiTila = paa ? "lukittu" : nakyy(i - 1) ? (tulos.kortit[i - 1] ? "ok" : "bad") : "lepo";
              return (
                <li key={id}>
                  {i > 0 && (
                    <div className="vpk-liitos" data-tila={liitos}>
                      <span className="vpk-kisko" />
                      <span className="vpk-pilleri">
                        {liitos === "odottaa" ? "Tarkistetaan" : liitos === "lautta" ? "Lauttayhteys" : liitos === "ok" ? "Yhteinen raja" : "Ei yhteistä rajaa"}
                      </span>
                    </div>
                  )}
                  <Kortti e={edustajat.get(id)!} muoto="rivi" tila={tila} num={i + 1} vp={p.vpNimi(vp[i])} visa={valmis} salkku={valmis} />
                </li>
              );
            })}
          </ol>
        </div>

        <div className="vpk-oikea-sarake">
          <div className="vpk-paneeli">
            <div className="vpk-paneeli-yla">
              <span className="vpk-pikku">Ketju kartalla</span>
              {valmis && !tulos.kelpaa && (
                <span className="vpk-valitsin" role="tablist">
                  <button type="button" role="tab" aria-selected={nakyma === "oma"} onClick={() => p.setNakyma("oma")}>
                    Sinun reittisi
                  </button>
                  <button type="button" role="tab" aria-selected={nakyma === "oikea"} onClick={() => p.setNakyma("oikea")}>
                    Oikea reitti
                  </button>
                </span>
              )}
            </div>
            <div className="vpk-kartta-kehys vpk-kartta-kehys--tulos">
              <VaalipiiriKartta mode="reitti" solmut={kartta.solmut} jaksot={kartta.jaksot} nimi={p.nimi} />
            </div>
            <div className="vpk-selite">
              <span><i className="vpk-selite-ok" />Raja</span>
              <span><i className="vpk-selite-bad" />Ei rajaa</span>
              <span><i className="vpk-selite-lautta" />Lautta (Ahvenanmaa)</span>
            </div>
          </div>

          {valmis && !tulos.kelpaa && (
            <div className="vpk-ratkaisu">
              <div className="vpk-pikku vpk-pikku--vali">Yksi kelvollinen ketju</div>
              <ol>
                {k.reitti.map((e) => (
                  <li key={e.id}>
                    <b>{e.nimi}</b> <span>· {p.vpNimi(e.vp)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <a className="vpk-takaisin" href={p.hubHref}>
            ← Takaisin Vaalit ja politiikka
          </a>
        </div>
      </div>
    </div>
  );
}
