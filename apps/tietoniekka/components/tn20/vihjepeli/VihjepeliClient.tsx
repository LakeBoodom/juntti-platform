"use client";
// MIKÄ MAA? — pelinäkymä (CD "Tietoniekka - Mika maa paketti" 7.11.2026, osiot 1 ja 2; Heikin päätökset 7.11.).
//   - Kuusi arvausta. Vihje 1 näkyy heti, jokainen väärä arvaus avaa seuraavan: 2, 3, siluetti + maanosa,
//     pääkaupunki (tai lippu, jos pääkaupunki paljastaisi nimen). Kuudes arvaus tehdään kaikilla viidellä vihjeellä.
//   - Ei ingressiä: otsikkorivillä nimi, päivän maan rivi ja kuusi pistettä (Heikki 7.11. kohta 4).
//   - Arvaa-painike on lime-pilleri (UI-laatusääntö 5, Heikki 7.11. kohta 2).
//   - Uusin vihje on valkoinen kortti punaisella reunalla. Vanhemmat tiivistyvät kahdelle riville; napautus avaa.
//   - Väärä arvaus: etäisyys keskipisteiden välillä (10 km:n tarkkuus) ja suunta kahdeksana ilmansuuntana.
//   - Päivän maa kerran päivässä (tulos selaimeen → "jo pelattu"). Arvottu maa (?kohde=, "Arvo uusi maa") ei vaikuta siihen.
//   - Tulos on pelkkä arvausnumero ("3. arvauksella"), ei tasonimeä; jako Jakoalueella (jakotekstit v4).
// Selaimeen tulee vain kevyt maalista ja kierroksen oma maa (siluetti), ei koko aineistoa.

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import { SeuraavaPeli } from "@/components/tn20/pelikehys/PeliTulos";
import Jakoalue from "@/components/tn20/jako/Jakoalue";
import { getSupabase } from "@/lib/supabase";
import { lisaaPelirivi } from "@/lib/seuranta";
import { seuraavatPelit } from "@/lib/pelimuodot";
import { ehdotukset, pisteet, tunnista } from "@/lib/vihjepeli/arvonta";
import { etaisyysPalaute } from "@/lib/vihjepeli/palaute/etaisyys";
import { ARVAUKSIA, type Suunta } from "@/lib/vihjepeli/tyypit";
import type { MaaKohde } from "@/lib/vihjepeli/aiheet/maa";
import MikaMaaTunnus from "./MikaMaaTunnus";
import { MM_KOTI, MM_NIMI, MM_SIVU, jakoteksti, lueTallenne, tallenneAvain, uusiSiemen, type MaaKierros, type MaaTallenne } from "@/lib/vihjepeli/mikamaa";

const VIHJEITA = 5;
/** Ohitettu arvaus (Heikki 7.11.: pelaajaa ei pakoteta arvaamaan): käyttää arvauksen ja avaa seuraavan vihjeen. */
const OHITA = "-";
const SIJAINEN: Record<Suunta, string> = {
  pohjoinen: "pohjoisessa", koillinen: "koillisessa", "itä": "idässä", kaakko: "kaakossa",
  "etelä": "etelässä", lounas: "lounaassa", "länsi": "lännessä", luode: "luoteessa",
};
const SUUNTA_ASTEET: Record<Suunta, number> = { pohjoinen: 0, koillinen: 45, "itä": 90, kaakko: 135, "etelä": 180, lounas: 225, "länsi": 270, luode: 315 };
const km = new Intl.NumberFormat("fi-FI");

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

/** Tilasto (vihjepeli_pelit). Best-effort: epäonnistuminen ei näy pelaajalle. */
async function tallenna(r: { siemen: string; kohde: string; paivan: boolean; arvaukset: string[]; oikein: boolean }) {
  try {
    const sb = getSupabase();
    if (!sb) return;
    await lisaaPelirivi(sb, "vihjepeli_pelit", {
      aihe: "maa", siemen: r.siemen, kohde: r.kohde, paivan_kohde: r.paivan, arvaukset: r.arvaukset,
      oikein: r.oikein, pisteet: pisteet(r.oikein ? r.arvaukset.length : null), session_id: istunto(),
    });
  } catch {
    // tilasto jää saamatta — peli jatkuu normaalisti
  }
}

function hiljaa() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function Nuoli({ suunta, koko }: { suunta: Suunta; koko: number }) {
  return (
    <span className="mm-nuoli" role="img" aria-label={`Oikea maa on ${SIJAINEN[suunta]}`}>
      <svg viewBox="0 0 24 24" width={koko} height={koko} aria-hidden="true" style={{ transform: `rotate(${SUUNTA_ASTEET[suunta]}deg)` }}>
        <path d="M12 19.5V5M6 11l6-6 6 6" />
      </svg>
    </span>
  );
}

function Siluetti({ d, laatikko, nimi }: { d: string; laatikko: [number, number, number, number]; nimi?: string }) {
  const [x0, y0, x1, y1] = laatikko;
  const pad = Math.max(x1 - x0, y1 - y0) * 0.04;
  return (
    <svg
      className="mm-siluetti"
      viewBox={`${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`}
      role="img"
      aria-label={nimi ? `${nimi}, siluetti` : "Päivän maan siluetti"}
    >
      <path d={d} fillRule="evenodd" />
    </svg>
  );
}

type Rivi = { maa: MaaKohde | null; oikein: boolean; km: number; suunta: Suunta };

/* Ohjeet kolmessa kohdassa (Heikki 8.11.2026: aloitussivun lede, kolme syytä ja Näin pelaat toistivat samaa).
   Suunnan merkki on SVG: ↗-merkki piirtyy iOS:llä emojina. */
const SAANNOT: Array<{ k: string | null; h: string; s: string; c: string }> = [
  { k: "6", h: "Kuusi arvausta", s: "Ensimmäinen vihje on vaikein. Jokainen väärä arvaus avaa uuden, ja neljäs näyttää maan ääriviivat.", c: "#E8A320" },
  { k: null, h: "Väärä arvaus vie lähemmäs", s: "Näet, kuinka kaukana oikea maa on ja mihin suuntaan.", c: "#F08A5D" },
  { k: "1", h: "Uusi maa joka päivä", s: "Kaikki arvaavat saman maan. Vertaa kavereiden kanssa, monennellako osuit.", c: "#8FD9D0" },
];

/** ALOITUSSIVU (CD-paketti v0.2, 0a/0b; tiivistetty 8.11.): päivän vihje 1 otsikkona ja kysymys perään, tunnus, CTA ja
 *  Näin pelaat kolmessa kohdassa. Jos päivän maa on jo pelattu, CTA vie tulokseen. Otsikon koko lasketaan pisimmästä
 *  sanasta (KORTTISÄÄNTÖ). */
function Aloitus({ paiva, vihje, pelattu, aloita }: { paiva: string; vihje: string; pelattu: boolean; aloita: () => void }) {
  const pisin = Math.max(4, ...vihje.split(/[\s-]+/).map((w) => w.replace(/[.,:;]/g, "").length));
  return (
    <div className="mm-in-sivu" data-iho="tumma">
      <Pelipalkki iho="tumma" peli={MM_NIMI} koti={MM_KOTI} />
      <main className="mm-in">
        <div className="mm-in-yla">
          <span className="mm-in-eyebrow">Päivän maa · {paiva}</span>
          <div className="mm-in-otsikko">
            <h1 className="mm-in-h1" data-pitka={vihje.length > 50 ? "" : undefined} style={{ "--mm-in-lw": pisin } as CSSProperties}>
              {vihje} <span>{MM_NIMI}</span>
            </h1>
          </div>
          <div className="mm-in-kuva">
            <MikaMaaTunnus sanamerkki />
          </div>
          <div className="mm-in-toiminto">
            <button type="button" className="tn-cta-lime mm-in-cta" onClick={aloita}>{pelattu ? "Katso tuloksesi" : "Arvaa päivän maa"}</button>
          </div>
        </div>
        <section className="mm-in-ohje" aria-labelledby="mm-in-ohje-h">
          <h2 id="mm-in-ohje-h">Näin pelaat</h2>
          <ol>
            {SAANNOT.map((x) => (
              <li key={x.h}>
                <span className="mm-in-merkki" style={{ color: x.c, borderColor: x.c }} aria-hidden="true">
                  {x.k ?? (
                    <svg viewBox="0 0 24 24" width={18} height={18}>
                      <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <div>
                  <b>{x.h}</b>
                  <span>{x.s}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}

export default function VihjepeliClient({ k }: { k: MaaKierros }) {
  const [arvaukset, setArvaukset] = useState<string[]>([]);
  const [syote, setSyote] = useState("");
  const [lista, setLista] = useState(false);
  const [valittu, setValittu] = useState(0);
  const [viesti, setViesti] = useState("");
  const [auki, setAuki] = useState<Set<number>>(new Set());
  const [kaikki, setKaikki] = useState(false);
  const [paivanTulos, setPaivanTulos] = useState<MaaTallenne | null>(null);
  /* Päivän maa alkaa aloitussivulta (CD v0.2); arvottu maa ("Arvo uusi maa") suoraan laudalle. */
  const [aloitus, setAloitus] = useState(k.harjoitus === null);
  const kentta = useRef<HTMLInputElement>(null);
  const juuri = useRef<HTMLDivElement>(null);

  const harjoitus = k.harjoitus !== null;
  const o = k.oikea;
  const maat = useMemo(() => new Map(k.kohteet.map((m) => [m.id, m])), [k.kohteet]);

  // Päivän maa jo pelattu → tulos suoraan. Harjoituksessa luetaan päivän tulos jakoa varten (jos se on tältä päivältä).
  useEffect(() => {
    const t = lueTallenne(k.iso);
    setPaivanTulos(t);
    if (!harjoitus && t && t.kohde === o.id && t.arvaukset.every((id) => id === OHITA || maat.has(id))) setArvaukset(t.arvaukset);
  }, [k.iso, o.id, harjoitus, maat]);

  const rivit: Rivi[] = useMemo(
    () =>
      arvaukset.map((id): Rivi => {
        if (id === OHITA) return { maa: null, oikein: false, km: 0, suunta: "pohjoinen" };
        const maa = maat.get(id)!;
        const p = etaisyysPalaute(maa, o, !!maa.nr?.includes(o.id));
        return { maa, oikein: id === o.id, km: p.tyyppi === "etaisyys" ? p.km : 0, suunta: p.tyyppi === "etaisyys" ? p.suunta : "pohjoinen" };
      }),
    [arvaukset, maat, o],
  );
  const ratkesi = arvaukset.includes(o.id);
  const valmis = ratkesi || arvaukset.length >= ARVAUKSIA;
  const vaarat = rivit.filter((r) => !r.oikein);
  const avattu = Math.min(1 + vaarat.length, VIHJEITA);

  // ── Haku ──
  const arvatut = useMemo(() => new Set(arvaukset), [arvaukset]);
  const ehdot = useMemo(() => (syote.trim() ? ehdotukset(k.kohteet, syote, 8).filter((m) => !arvatut.has(m.id)).slice(0, 5) : []), [syote, k.kohteet, arvatut]);
  const listaAuki = lista && ehdot.length > 0 && !valmis;

  const valitse = (m: MaaKohde) => {
    setSyote(m.nimi);
    setLista(false);
    setViesti("");
    kentta.current?.focus();
  };

  const arvaa = () => {
    if (valmis) return;
    const m = tunnista(k.kohteet, syote) ?? (ehdot.length === 1 ? ehdot[0] : null);
    if (!m) {
      setViesti(syote.trim() ? "Maata ei löytynyt. Valitse nimi listasta." : "Kirjoita maan nimi.");
      setLista(true);
      return;
    }
    if (arvatut.has(m.id)) {
      setViesti(`Arvasit jo: ${m.nimi}.`);
      return;
    }
    kirjaa([...arvaukset, m.id], m.id === o.id ? `Oikein: ${o.nimi}.` : `Väärin: ${m.nimi}.`);
  };

  /** Arvaus tai ohitus listaan; viimeinen tallennetaan selaimeen ja tilastoon. */
  const kirjaa = (uudet: string[], alku: string) => {
    setArvaukset(uudet);
    setSyote("");
    setLista(false);
    setValittu(0);
    const ratkesiNyt = uudet[uudet.length - 1] === o.id;
    const loppui = ratkesiNyt || uudet.length >= ARVAUKSIA;
    const vaaria = uudet.filter((id) => id !== o.id).length;
    setViesti(ratkesiNyt ? alku : loppui ? `Oikea maa oli ${o.nimi}.` : vaaria < VIHJEITA ? `${alku} Uusi vihje avautui.` : `${alku} Viimeinen arvaus.`);
    if (!loppui) return;
    const t: MaaTallenne = { kohde: o.id, arvaukset: uudet, ratkesi: ratkesiNyt };
    if (!harjoitus) {
      try {
        localStorage.setItem(tallenneAvain(k.iso), JSON.stringify(t));
      } catch {
        // ei tallennusta selaimeen
      }
      setPaivanTulos(t);
    }
    void tallenna({ siemen: k.harjoitus ?? k.iso, kohde: o.id, paivan: !harjoitus, arvaukset: uudet, oikein: t.ratkesi });
    requestAnimationFrame(() => juuri.current?.scrollIntoView({ block: "start", behavior: hiljaa() ? "auto" : "smooth" }));
  };

  const ohita = () => {
    if (!valmis) kirjaa([...arvaukset, OHITA], "Ohitit.");
  };

  const nappain = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && ehdot.length) {
      e.preventDefault();
      setLista(true);
      setValittu((v) => (listaAuki ? (v + 1) % ehdot.length : 0));
    } else if (e.key === "ArrowUp" && listaAuki) {
      e.preventDefault();
      setValittu((v) => (v - 1 + ehdot.length) % ehdot.length);
    } else if (e.key === "Escape") {
      setLista(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const tasan = tunnista(k.kohteet, syote);
      if (listaAuki && !tasan) valitse(ehdot[Math.min(valittu, ehdot.length - 1)]);
      else arvaa();
    }
  };

  const uusiHarjoitus = () => location.assign(`${MM_SIVU}?kohde=${uusiSiemen()}`);

  // ── Vihjeet ──
  const vihjeTeksti = (i: number) => (i < 3 ? k.vihjeet[i] : i === 4 && !o.lippuVihjeena ? `Pääkaupunki on ${o.paakaupunki}.` : null);
  const lippu = <img className="mm-lippu" src={o.lippu} alt="Päivän maan lippu" width={120} height={90} />;
  const siluettiAuki = avattu >= 4;
  /** Vihje 4 on siluetti omana uusimpana korttinaan (Heikki 7.11.: vihje 3 siluetin vieressä hämmensi); vihjeen 5
   *  avauduttua siluetti pienenee laataksi uusimman vihjeen viereen. Tekstivihjeet 1–3 tiivistyvät pinoon. */
  const uusinTeksti = avattu === 4 ? null : avattu - 1;
  const vanhat = Array.from({ length: Math.min(avattu - 1, 3) }, (_, i) => i);

  const vihjeKortti = (i: number) => (
    <div className="mm-uusin" key={`u${i}-${avattu}`} data-uusi={avattu - 1 === i ? "" : undefined}>
      <span className="mm-sr">Vihje {i + 1}: </span>
      {i === 4 && o.lippuVihjeena ? (
        <span className="mm-lippuvihje">{lippu}</span>
      ) : (
        <span className="mm-uusin-t">{vihjeTeksti(i)}</span>
      )}
    </div>
  );

  const tila = valmis ? undefined : `Arvaus ${arvaukset.length + 1}/${ARVAUKSIA}`;
  const jaljella = ARVAUKSIA - arvaukset.length;

  const otsake = (
    <header className="mm-otsake">
      <div className="mm-otsake-t">
        <h1 className="mm-h1">{MM_NIMI}</h1>
        <span className="mm-paiva">
          {harjoitus ? (
            <>
              Arvottu maa · <a href={MM_SIVU}>Päivän maa {k.paiva}</a>
            </>
          ) : (
            `Päivän maa ${k.paiva}`
          )}
        </span>
      </div>
      <span className="mm-pisteet" role="img" aria-label={`${jaljella} arvausta jäljellä`}>
        {Array.from({ length: ARVAUKSIA }, (_, i) => (
          <span key={i} data-kaytetty={i < arvaukset.length ? "" : undefined} />
        ))}
      </span>
    </header>
  );

  if (aloitus) {
    return (
      <Aloitus
        paiva={k.paiva}
        vihje={k.vihjeet[0]}
        pelattu={valmis}
        aloita={() => {
          setAloitus(false);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  if (valmis) {
    const pisinSana = Math.max(...o.nimi.split(/\s+/).map((w) => w.length));
    /* Lähin väärä arvaus vain, jos maa jäi arvaamatta (Heikki 7.11.: oikean vastauksen jälkeen turha). */
    const lahin = ratkesi ? null : vaarat.reduce<(Rivi & { maa: MaaKohde }) | null>((a, r) => (r.maa && (!a || r.km < a.km) ? (r as Rivi & { maa: MaaKohde }) : a), null);
    const n = arvaukset.length;
    const jakoTulos = paivanTulos;
    const jako = jakoTulos && typeof location !== "undefined"
      ? { teksti: jakoteksti(jakoTulos), url: `${location.origin}${MM_SIVU}?tulos=${jakoTulos.ratkesi ? jakoTulos.arvaukset.length : 0}-${ARVAUKSIA}` }
      : null;
    return (
      <div className="mm" data-iho="kerma" ref={juuri}>
        <Pelipalkki iho="kerma" peli={MM_NIMI} koti={MM_KOTI} />
        <div className="mm-main mm-main--tulos">
          <div className="mm-tulos-yla">
            <div className="mm-tulos-vasen">
              <section className="mm-tulos-otsake" aria-live="polite">
                <h1 className="mm-eyebrow">
                  {harjoitus ? "Arvottu maa" : `Päivän maa ${k.paiva}`}
                  {!ratkesi && " oli"}
                </h1>
                <p className="mm-iso">
                  {ratkesi ? (
                    <>
                      <span className="mm-iso-luku">{n}.</span> <span className="mm-iso-yks">arvauksella</span>
                    </>
                  ) : (
                    <span className="mm-iso-nimi" style={{ "--mm-len": pisinSana } as CSSProperties}>{o.nimi}</span>
                  )}
                </p>
                {lahin && (
                  <p className="mm-tulos-rivi">
                    {`${lahin.maa.nimi} oli lähin, ${km.format(lahin.km)} km:n päässä.`}
                  </p>
                )}
              </section>
              <div className="mm-tulos-kortit">
                <div className="mm-maakortti">
                  <div className="mm-maakortti-sil">
                    <Siluetti d={o.siluetti} laatikko={o.laatikko} nimi={o.nimi} />
                  </div>
                  <div className="mm-maakortti-t">
                    <img className="mm-maakortti-lippu" src={o.lippu} alt={`${o.nimi}, lippu`} width={64} height={48} />
                    <span className="mm-maakortti-nimi" style={{ "--mm-len": pisinSana } as CSSProperties}>{o.nimi}</span>
                    <span className="mm-maakortti-tiedot">
                      <span>
                        Pääkaupunki <b>{o.paakaupunki}</b>
                      </span>
                      <span>{o.maanosa}</span>
                    </span>
                  </div>
                </div>
                <div className="mm-polku">
                  <h2 className="mm-pikku">Arvauksesi</h2>
                  <ol>
                    {rivit.map((r, i) => (
                      <li key={r.maa?.id ?? `o${i}`} data-oikein={r.oikein ? "" : undefined} data-ohitettu={r.maa ? undefined : ""}>
                        <span className="mm-merkki" aria-label={r.oikein ? "Oikein" : r.maa ? "Väärin" : undefined} aria-hidden={r.maa ? undefined : true}>{r.oikein ? "✓" : r.maa ? "✗" : "–"}</span>
                        <span className="mm-rivi-nimi">{r.maa?.nimi ?? "Ohitettu"}</span>
                        {!r.oikein && r.maa && (
                          <>
                            <span className="mm-km">{km.format(r.km)} km</span>
                            <Nuoli suunta={r.suunta} koko={15} />
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            {jako && (
              <Jakoalue className="mm-jako" id="mm-jako-h" otsikko="Haasta kaveri" waNappi="Jaa WhatsAppissa" teksti={jako.teksti} url={jako.url} natiiviOtsikko={MM_NIMI} />
            )}
          </div>

          {/* Heikki 8.11.: pelin jälkeen voi pelata toisen maan (98 muuta maata, ei päivän maata). */}
          <button type="button" className="mm-uusi-maa" onClick={uusiHarjoitus}>Arvo uusi maa</button>
          {kaikki && (
            <section className="mm-kaikki" aria-labelledby="mm-kaikki-h">
              <h2 className="mm-pikku" id="mm-kaikki-h">Vihjeet</h2>
              <ol>
                {[0, 1, 2].map((i) => (
                  <li key={i}>{k.vihjeet[i]}</li>
                ))}
                <li>Siluetti ja maanosa: {o.maanosa}</li>
                <li>{o.lippuVihjeena ? "Lippu" : `Pääkaupunki on ${o.paakaupunki}.`}</li>
              </ol>
            </section>
          )}

          <nav className="pk-tulos-linkit mm-linkit" aria-label="Muut toiminnot">
            <a href={MM_KOTI.href}>Kaikki karttapelit</a>
            <button type="button" aria-expanded={kaikki} onClick={() => setKaikki((v) => !v)}>
              {kaikki ? "Piilota vihjeet" : "Näytä kaikki vihjeet"}
            </button>
            {harjoitus && <a href={MM_SIVU}>Päivän maa {k.paiva}</a>}
          </nav>
        </div>
        <SeuraavaPeli seuraavat={seuraavatPelit("mika-maa", "matkakohteet")} />
      </div>
    );
  }

  return (
    <div className="mm" data-iho="kerma" ref={juuri}>
      <Pelipalkki iho="kerma" peli={MM_NIMI} koti={MM_KOTI} tila={tila} pelissa paluuNuoli />
      <div className="mm-main">
        {otsake}
        <div className="mm-lauta">
          <section className="mm-vihjeet" aria-label="Vihjeet">
            {vanhat.map((i) => (
              <button
                key={i}
                type="button"
                className="mm-vanha"
                aria-expanded={auki.has(i)}
                onClick={() => setAuki((s) => {
                  const n = new Set(s);
                  if (n.has(i)) n.delete(i);
                  else n.add(i);
                  return n;
                })}
              >
                <span className="mm-sr">Vihje {i + 1}: </span>
                {vihjeTeksti(i)}
              </button>
            ))}
            {siluettiAuki ? (
              <div className="mm-silrivi" data-yksin={uusinTeksti === null ? "" : undefined}>
                <div className="mm-siltaulu" key={`s${avattu}`} data-uusi={avattu === 4 ? "" : undefined}>
                  <span className="mm-sr">Vihje 4: </span>
                  <span className="mm-siltaulu-otsikko">Maan ääriviivat</span>
                  <Siluetti d={o.siluetti} laatikko={o.laatikko} />
                  <span className="mm-maanosa">{o.maanosa}</span>
                </div>
                {uusinTeksti !== null && vihjeKortti(uusinTeksti)}
              </div>
            ) : (
              uusinTeksti !== null && vihjeKortti(uusinTeksti)
            )}
          </section>

          <section className="mm-pelialue" aria-label="Arvaukset">
            {rivit.length > 0 && (
              <ol className="mm-rivit">
                {rivit.map((r, i) =>
                  r.maa ? (
                    <li key={r.maa.id}>
                      <span className="mm-merkki" aria-label="Väärin">✗</span>
                      <span className="mm-rivi-nimi">{r.maa.nimi}</span>
                      <span className="mm-palaute">
                        <span className="mm-km">{km.format(r.km)} km</span>
                        <Nuoli suunta={r.suunta} koko={20} />
                      </span>
                    </li>
                  ) : (
                    <li key={`o${i}`} data-ohitettu="">
                      <span className="mm-merkki" aria-hidden="true">–</span>
                      <span className="mm-rivi-nimi">Ohitettu</span>
                    </li>
                  ),
                )}
              </ol>
            )}
            <form
              className="mm-syoterivi"
              onSubmit={(e) => {
                e.preventDefault();
                arvaa();
              }}
            >
              <div className="mm-haku">
                <input
                  ref={kentta}
                  className="mm-kentta"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  enterKeyHint="go"
                  placeholder="Maan nimi"
                  aria-label="Maan nimi"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={listaAuki}
                  aria-controls="mm-ehdotukset"
                  aria-activedescendant={listaAuki ? `mm-e-${ehdot[Math.min(valittu, ehdot.length - 1)].id}` : undefined}
                  value={syote}
                  onChange={(e) => {
                    setSyote(e.target.value);
                    setLista(true);
                    setValittu(0);
                    setViesti("");
                  }}
                  onKeyDown={nappain}
                  onFocus={() => setLista(true)}
                  onBlur={() => setTimeout(() => setLista(false), 150)}
                />
                {listaAuki && (
                  <ul className="mm-ehdotukset" id="mm-ehdotukset" role="listbox" aria-label="Ehdotukset">
                    {ehdot.map((m, i) => (
                      <li
                        key={m.id}
                        id={`mm-e-${m.id}`}
                        role="option"
                        aria-selected={i === valittu}
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => valitse(m)}
                      >
                        {m.nimi}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="submit" className="tn-cta-lime mm-arvaa">Arvaa</button>
            </form>
            <div className="mm-alarivi">
              <p className="mm-viesti" role="status" aria-live="polite">{viesti}</p>
              <button type="button" className="mm-ohita" onClick={ohita}>{jaljella === 1 ? "Näytä vastaus" : "Ohita"}</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
