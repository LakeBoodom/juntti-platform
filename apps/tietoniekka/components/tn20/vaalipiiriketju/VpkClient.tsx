"use client";
// VAALIPIIRIKETJU — pelinäkymä (CD "TN Vaalipiiriketju - pelinäkymä" 2a–2i, katselmus kierros 1).
// Mekaniikka kuten Kuntaliitoksessa (päivän siemen, tarkistus linkki kerrallaan, tilasto
// vaalipiiriketju_pelit), mutta CD:n mukaan:
//   - Mobiili (< 1080 px): napautus antaa kortille järjestysnumeron 1–8, ruudukko pysyy paikallaan.
//   - Desktop: pino + ketju; raahaus paikalle 1–8 (täyteen paikkaan pudotus vaihtaa kortit),
//     klikkaus lisää seuraavaan vapaaseen paikkaan tai palauttaa pinoon, Enter samoin.
//   - Mikä tahansa kelvollinen ketju hyväksytään (lib/vaalipiiriketju.ts tarkista()).
//   - Yksi yritys päivässä: tulos tallentuu selaimeen ja sivu avautuu "jo pelattu" -tilaan.
// Katselmuksen korjaukset: Tarkista-nappi tarttuvassa alapalkissa myös desktopissa (§1), kaari
// väärälle linkille (§2, VpkKartta), SDP → Sosialidemokraatit (§3, data), Visa-linkki vain
// julkaistulle visalle (§4, data), pelilinkki pakkaan vain kun se on julki (§5, sivu),
// yhteinen numerointi (§6), oikea reitti = päivän generoitu reitti (§7).

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { jakoteksti, tarkista, VPK_KORTTEJA, VPK_NIMI, VPK_SIVU, type VpkEdustaja, type VpkKierros } from "@/lib/vaalipiiriketju";
import VpkKartta from "./VpkKartta";

type Vaihe = "peli" | "tulos";
type KorttiTila = "lepo" | "valittu" | "veto" | "ok" | "bad";

const TYHJA: Array<string | null> = Array(VPK_KORTTEJA).fill(null);
const VALI_MS = 360;
const avain = (iso: string) => `tn-vpk-${iso}`;

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
async function tallenna(iso: string, oikein: number, edustajat: string[]) {
  try {
    const sb = getSupabase();
    if (!sb) return;
    await sb.from("vaalipiiriketju_pelit" as never).insert({
      siemen: iso, paivan_reitti: true, yritys: 1, oikein, edustajat, session_id: istunto(),
    } as never);
  } catch {
    // tilasto jää saamatta — peli jatkuu normaalisti
  }
}

const OK = "M5 12.6 9.8 17.4 19 7.4";
const RISTI = "M7 7l10 10M17 7 7 17";
const NASTA = "M12 21s-6.5-6.1-6.5-11.2A6.5 6.5 0 0 1 18.5 9.8C18.5 14.9 12 21 12 21Z M12 12.3a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z";
const KAHVA = "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01";

/** TN-Edustajakortti (CD 2i): laatta (mobiili) tai rivi (pino, ketju, tulos). */
function Kortti({ e, muoto, tila, num, vp, visa, kahva }: { e: VpkEdustaja; muoto: "laatta" | "rivi"; tila: KorttiTila; num?: number; vp?: string; visa?: boolean; kahva?: boolean }) {
  const paljastettu = tila === "ok" || tila === "bad";
  const merkki = paljastettu && (
    <span className="vpk-merkki" data-tila={tila}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={tila === "ok" ? OK : RISTI} /></svg>
    </span>
  );
  const piiri = paljastettu && vp && (
    <span className="vpk-kortti-vp">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={NASTA} /></svg>
      <span>{vp}</span>
    </span>
  );
  const visaLinkki = visa && paljastettu && e.visa && (
    <a className="vpk-visa" href={e.visa} onClick={(ev) => ev.stopPropagation()}>
      Visa →
    </a>
  );
  if (muoto === "laatta") {
    return (
      <span className="vpk-kortti vpk-kortti--laatta" data-tila={tila}>
        <span className="vpk-kortti-t" style={num ? { paddingRight: 30 } : undefined}>
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
          <span className="vpk-kortti-puolue">{e.puolue}</span>
          {piiri}
        </span>
      </span>
      {merkki}
      {kahva && !paljastettu && (
        <svg className="vpk-kahva" viewBox="0 0 24 24" aria-hidden="true"><path d={KAHVA} /></svg>
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
  const [nakyma, setNakyma] = useState<"oma" | "oikea">("oma");
  const [veto, setVeto] = useState<{ id: string; dx: number; dy: number; liikkui: boolean } | null>(null);
  const [yli, setYli] = useState<number | null>(null);
  const [jaettu, setJaettu] = useState(false);
  const ajastin = useRef<ReturnType<typeof setInterval> | null>(null);
  const irrota = useRef<(() => void) | null>(null);
  const juuri = useRef<HTMLDivElement>(null);

  const edustajat = useMemo(() => new Map(k.reitti.map((e) => [e.id, e])), [k.reitti]);
  const vpt = useMemo(() => new Map(k.vaalipiirit.map((v) => [v.id, v])), [k.vaalipiirit]);
  const geomNimi = useMemo(() => new Map(k.vaalipiirit.map((v) => [v.k, v.nimi])), [k.vaalipiirit]);
  const nimi = (g: string) => geomNimi.get(g) ?? g;

  // Jo pelattu tänään → tulos suoraan (ei animaatiota).
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(avain(k.iso)) ?? "null");
      const ids: unknown = v?.jarjestys;
      if (Array.isArray(ids) && ids.length === VPK_KORTTEJA && ids.every((x) => typeof x === "string" && edustajat.has(x))) {
        setSlots(ids as string[]);
        setVaihe("tulos");
        setPaljastettu(VPK_KORTTEJA);
        setPelattu(true);
      }
    } catch {
      // estetty localStorage → pelataan normaalisti
    }
    return () => {
      if (ajastin.current) clearInterval(ajastin.current);
      irrota.current?.();
    };
  }, [k.iso, edustajat]);

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
  const vetoTila = (id: string): KorttiTila => (veto?.id === id && veto.liikkui ? "veto" : "lepo");

  // ── Tulos ──
  const jarjestys = slots.map((x) => x ?? "");
  const tulos = useMemo(
    () => (slots.every(Boolean) ? tarkista(slots.map((id) => edustajat.get(id!)!.vp), k.linkit) : null),
    [slots, k.linkit, edustajat],
  );
  const valmis = vaihe === "tulos" && paljastettu >= VPK_KORTTEJA;

  const tarkistaKetju = () => {
    if (sijoitettu < VPK_KORTTEJA || !tulos) return;
    setVaihe("tulos");
    setNakyma("oma");
    try {
      localStorage.setItem(avain(k.iso), JSON.stringify({ jarjestys: slots }));
    } catch {
      // ei tallennusta selaimeen
    }
    void tallenna(k.iso, tulos.oikein, slots as string[]);
    juuri.current?.scrollIntoView({ block: "start", behavior: hiljaa() ? "auto" : "smooth" });
    if (hiljaa()) {
      setPaljastettu(VPK_KORTTEJA);
      return;
    }
    setPaljastettu(0);
    let n = 0;
    if (ajastin.current) clearInterval(ajastin.current);
    ajastin.current = setInterval(() => {
      n++;
      setPaljastettu(n);
      if (n >= VPK_KORTTEJA && ajastin.current) clearInterval(ajastin.current);
    }, VALI_MS);
  };

  async function jaa() {
    if (!tulos) return;
    const teksti = jakoteksti(k.numero, tulos.kortit);
    const url = `${location.origin}${VPK_SIVU}`;
    try {
      if (navigator.share) await navigator.share({ title: `${VPK_NIMI} #${k.numero}`, text: teksti, url });
      else await navigator.clipboard.writeText(`${teksti}\n${url}`);
      setJaettu(true);
    } catch {
      // jako peruttu
    }
  }

  // ── Yläpalkin tilanne ──
  const meta = pelissa
    ? { nimi: "Ketjussa", arvo: `${sijoitettu}/${VPK_KORTTEJA}`, vari: "#F5F0E6" }
    : { nimi: "Tulos", arvo: valmis && tulos ? `${tulos.oikein}/${VPK_KORTTEJA}` : "…", vari: "#B6FF3C" };

  const otsikko = (
    <div className="vpk-otsake">
      <div className="vpk-polku">
        <a href={hubHref}>← Vaalit ja politiikka</a>
        <span aria-hidden="true">·</span>
        <span>{k.paivays}</span>
      </div>
      <h1 className="vpk-h1">
        {VPK_NIMI} <span>#{k.numero}</span>
      </h1>
      <p className="vpk-lede">Järjestä kansanedustajat niin, että jokaisen vaalipiiri rajautuu edellisen vaalipiiriin.</p>
      <p className="vpk-ohje">
        <span className="vpk-vain-kapea">Napauta kortteja ketjun järjestyksessä. Napauta uudelleen poistaaksesi.</span>
        <span className="vpk-vain-levea">Raahaa kortti ketjuun tai klikkaa sitä. Klikkaus ketjussa palauttaa kortin pinoon. Näppäimistöllä Enter.</span>
      </p>
    </div>
  );

  const pino = k.pino.filter((id) => !slots.includes(id));

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

            {/* Mobiili: napautusjärjestys */}
            <div className="vpk-ruudukko vpk-vain-kapea" role="list" aria-label="Kansanedustajat">
              {k.pino.map((id) => {
                const e = edustajat.get(id)!;
                const i = slots.indexOf(id);
                return (
                  <div
                    key={id}
                    role="listitem"
                    tabIndex={0}
                    className="vpk-napautus"
                    aria-label={`${e.nimi}, ${e.puolue}.${i >= 0 ? ` Ketjussa sijalla ${i + 1}. Napauta poistaaksesi.` : " Napauta lisätäksesi ketjuun."}`}
                    onClick={() => vaihda(id)}
                    onKeyDown={(ev) => nappain(id, ev)}
                  >
                    <Kortti e={e} muoto="laatta" tila={i >= 0 ? "valittu" : "lepo"} num={i >= 0 ? i + 1 : 0} />
                  </div>
                );
              })}
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
                      <Kortti e={e} muoto="rivi" tila={vetoTila(id)} kahva />
                    </div>
                  );
                })}
                {!pino.length && <div className="vpk-pino-tyhja">Kaikki kahdeksan ovat ketjussa.</div>}
              </div>
              <ol className="vpk-ketju" aria-label="Ketju">
                <li className="vpk-sarake-yla">
                  <span className="vpk-pikku vpk-pikku--lila">Ketju</span>
                  <span className="vpk-laskuri">{sijoitettu}/{VPK_KORTTEJA}</span>
                </li>
                {slots.map((id, i) => (
                  <li key={i} data-slot={i}>
                    {id ? (
                      <div
                        tabIndex={0}
                        className="vpk-vedettava"
                        aria-label={`${edustajat.get(id)!.nimi}. Ketjussa sijalla ${i + 1}. Enter poistaa.`}
                        onPointerDown={(ev) => alas(id, ev)}
                        onKeyDown={(ev) => nappain(id, ev)}
                        style={vetoTyyli(id)}
                      >
                        <Kortti e={edustajat.get(id)!} muoto="rivi" tila={veto?.id === id && veto.liikkui ? "veto" : yli === i ? "valittu" : "lepo"} num={i + 1} kahva />
                      </div>
                    ) : (
                      <div className="vpk-paikka" data-yli={yli === i || undefined}>
                        <span className="vpk-paikka-num">{i + 1}</span>
                        <span>{yli === i ? "Pudota tähän" : i === 0 ? "Ketjun alku" : i === VPK_KORTTEJA - 1 ? "Ketjun loppu" : ""}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div className="vpk-toiminto">
              <button type="button" className="vpk-tarkista" disabled={sijoitettu < VPK_KORTTEJA} onClick={tarkistaKetju}>
                {sijoitettu === 0 ? `Valitse ${VPK_KORTTEJA} kansanedustajaa` : sijoitettu < VPK_KORTTEJA ? `Vielä ${VPK_KORTTEJA - sijoitettu}` : "Tarkista ketju"}
              </button>
              {sijoitettu > 0 && (
                <button type="button" className="vpk-tyhjenna" onClick={() => setSlots(TYHJA)}>
                  Tyhjennä
                </button>
              )}
            </div>
          </div>

          <aside className="vpk-sivukartta vpk-vain-levea">
            <span className="vpk-pikku">Kartta</span>
            <div className="vpk-kartta-kehys">
              <VpkKartta reitti={[]} nimi={nimi} />
            </div>
            <p>Kartassa ei ole nimiä ennen tarkistusta. Reitti piirtyy, kun tarkistat ketjun.</p>
          </aside>
        </div>
      ) : (
        tulos && (
          <Tulos
            k={k}
            tulos={tulos}
            jarjestys={jarjestys}
            edustajat={edustajat}
            vpNimi={(id) => vpt.get(id)?.nimi ?? id}
            vpK={(id) => vpt.get(id)?.k ?? ""}
            nimi={nimi}
            paljastettu={paljastettu}
            valmis={valmis}
            pelattu={pelattu}
            nakyma={nakyma}
            setNakyma={setNakyma}
            jaa={jaa}
            jaettu={jaettu}
            pakka={pakka}
            hubHref={hubHref}
          />
        )
      )}

      <section className="vpk-info" aria-labelledby="vpk-info-h">
        <h2 id="vpk-info-h">Näin pelaat</h2>
        <ol>
          <li><b>Kahdeksan kansanedustajaa, kahdeksan vaalipiiriä.</b> Jokainen kortti on istuva kansanedustaja eri vaalipiiristä. Vaalipiiri paljastuu vasta tarkistuksessa.</li>
          <li><b>Rakenna ketju.</b> Järjestä kortit niin, että jokaisen kansanedustajan vaalipiiri rajautuu edellisen vaalipiiriin. Ahvenanmaalta pääsee lautalla Varsinais-Suomeen.</li>
          <li><b>Mikä tahansa ehjä ketju kelpaa.</b> Kortti on oikein, jos sen vaalipiiri rajautuu edelliseen; ensimmäinen kortti, jos se rajautuu seuraavaan. Uusi ketju joka päivä.</li>
        </ol>
        <p className="vpk-lahde">{lahde}</p>
      </section>
    </div>
  );
}

function Tulos(p: {
  k: VpkKierros;
  tulos: ReturnType<typeof tarkista>;
  jarjestys: string[];
  edustajat: Map<string, VpkEdustaja>;
  vpNimi: (id: string) => string;
  vpK: (id: string) => string;
  nimi: (k: string) => string;
  paljastettu: number;
  valmis: boolean;
  pelattu: boolean;
  nakyma: "oma" | "oikea";
  setNakyma: (n: "oma" | "oikea") => void;
  jaa: () => void;
  jaettu: boolean;
  pakka: { href: string; teksti: string };
  hubHref: string;
}) {
  const { k, tulos, jarjestys, edustajat, paljastettu, valmis } = p;
  const vp = jarjestys.map((id) => edustajat.get(id)!.vp);
  const nakyma = tulos.kelpaa ? "oma" : p.nakyma;
  const reitinVp = k.reitti.map((e) => e.vp);
  const kartta =
    nakyma === "oikea"
      ? {
          reitti: reitinVp.map(p.vpK),
          tilat: reitinVp.map(() => "ok" as const),
          valit: tarkista(reitinVp, k.linkit).valit,
        }
      : {
          reitti: vp.slice(0, paljastettu).map(p.vpK),
          tilat: tulos.kortit.slice(0, paljastettu).map((b) => (b ? ("ok" as const) : ("bad" as const))),
          valit: tulos.valit.slice(0, Math.max(0, paljastettu - 1)),
        };
  const katkos = tulos.ensimmainenKatkos;
  const tuomio = !valmis
    ? "Tarkistetaan linkki kerrallaan…"
    : tulos.kelpaa
      ? "Jokainen vaalipiiri rajautuu edelliseen. Täysi ketju."
      : `Ketju katkesi kohdassa ${p.vpNimi(vp[katkos])} → ${p.vpNimi(vp[katkos + 1])}: näillä vaalipiireillä ei ole yhteistä rajaa.`;

  return (
    <div className="vpk-main vpk-main--tulos">
      {p.pelattu && (
        <div className="vpk-pelattu" role="status">
          <span>
            <b>Pelasit tämän päivän ketjun.</b>
            <span>Uusi ketju huomenna klo 00.00</span>
          </span>
          <span className="vpk-pelattu-seur">{k.huomenna}</span>
        </div>
      )}

      <div className="vpk-banneri" data-tila={valmis ? (tulos.kelpaa ? "ok" : "valmis") : "kesken"}>
        <div className="vpk-polku">
          <span className="vpk-lila">{VPK_NIMI} #{k.numero}</span>
          <span aria-hidden="true">·</span>
          <span>{k.paivays}</span>
        </div>
        <div className="vpk-tulosrivi" role="status" aria-live="polite">
          <span className="vpk-pisteet">{valmis ? `${tulos.oikein}/${VPK_KORTTEJA} oikein` : "Tarkistetaan"}</span>
          <span className="vpk-ruudut" aria-hidden="true">
            {jarjestys.map((_, i) => (
              <span key={i}>
                <span className="vpk-ruutu" style={{ background: i < paljastettu ? (tulos.kortit[i] ? "#B6FF3C" : "#FF6B4A") : "#2B2317" }} />
                {i < VPK_KORTTEJA - 1 && (
                  <span className="vpk-ruutuvali" style={{ background: i + 1 < paljastettu ? (tulos.valit[i] ? "#5C7A2A" : "#7A3426") : "#2B2317" }} />
                )}
              </span>
            ))}
          </span>
        </div>
        <p className="vpk-tuomio">{tuomio}</p>
        {valmis && (
          <div className="vpk-napit">
            <button type="button" className="vpk-jaa" onClick={p.jaa}>
              {p.jaettu ? "Tulos jaettu" : "Jaa tulos"}
            </button>
            <a className="vpk-toissija" href={p.pakka.href}>
              {p.pakka.teksti}
            </a>
          </div>
        )}
      </div>

      <div className="vpk-tulos-grid">
        <div className="vpk-oma">
          <div className="vpk-pikku vpk-pikku--vali">Sinun ketjusi</div>
          <ol aria-label="Sinun ketjusi">
            {jarjestys.map((id, i) => {
              const nakyy = i < paljastettu;
              const l = i > 0 ? tulos.valit[i - 1] : null;
              const lNakyy = i > 0 && i < paljastettu;
              const liitos = !lNakyy ? "odottaa" : l === "lautta" ? "lautta" : l ? "ok" : "bad";
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
                  <Kortti
                    e={edustajat.get(id)!}
                    muoto="rivi"
                    tila={nakyy ? (tulos.kortit[i] ? "ok" : "bad") : "lepo"}
                    num={i + 1}
                    vp={p.vpNimi(vp[i])}
                    visa={valmis}
                  />
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
              <VpkKartta reitti={kartta.reitti} tilat={kartta.tilat} valit={kartta.valit} nimi={p.nimi} />
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
