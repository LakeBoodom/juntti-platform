// ETUSIVU v5 — näkymä (design Tietoniekka_Etusivu_v5: 5a desktop 1440, 5b mobiili 390, 5c promopaikka; Heikki 28.10.2026).
// v7 (CD "TN Etusivu mobiili v7", Heikki 30.10.2026): Päivän visa kuvakorttina, Synttärit A (iso ikä), aiheet 16:10-kuvina
// kolmeen sarakkeeseen, pelikortit karusellina (< 768 px), juhlabanneri (Promo 1), Lapsille C (kuva pelistä), visapaketti.
// Desktop johdettu mobiilista (ei erillistä CD-mallia).
// Data: lib/etusivu5.ts. CSS: app/(tn20)/etusivu-v5.css (luokat .tn-es-*, mobile-first).
// Seuranta: jokainen osio kantaa data-tn-entry="etusivu:<osio>" (lib/seuranta.ts).
// Ei aputekstejä: otsikko, kortti, nappi (poikkeus: Lapsille-esittely, Heikki 30.10. v9). Osio-otsikon yläpuolella vain kicker-määrä.
import type { CSSProperties } from "react";
import { preload } from "react-dom";
import type { EtusivuData } from "@/lib/etusivu5";
import PelattuTanaan from "./PelattuTanaan";
import PaivanVisaV5 from "./PaivanVisaV5";
import Juhlabanneri from "./Juhlabanneri";
import PeliKuvitus, { KUVITETUT } from "./PeliKuvitus";
import { kuvanSrcSet } from "@/lib/kuvaVariantit";

type D = NonNullable<EtusivuData>;

/** Pisimmän sanan pituus otsikon kokokaavaan (KORTTISÄÄNTÖ): --lw. Yhdysmerkki on katkaisukohta. */
const pisin = (t: string) => Math.max(...t.split(/[\s\u00AD]+/).flatMap((w) => w.split(/(?<=-)/)).map((w) => w.length), 4);
const lw = (t: string) => ({ "--lw": pisin(t) }) as CSSProperties;

/** Kuva: srcset omien kopioiden kokoversioista (lib/kuvaVariantit) — sizes = kuvan leveys näkymässä. */
const KUVA_SIZES = "(min-width: 1100px) 600px, 100vw";

function Kuva({ src, pos, luokka, eager, sizes = KUVA_SIZES }: {
  src: string | null; pos?: string; luokka: string; eager?: boolean; sizes?: string;
}) {
  if (!src) return <span className={luokka} aria-hidden="true" />;
  const srcSet = kuvanSrcSet(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={luokka} src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt="" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} style={pos ? { objectPosition: pos } : undefined} />
  );
}

function PaivanPelit({ d }: { d: D }) {
  const { pvm, visa, mikaMaa, sankari } = d.paivanPelit;
  const mmPelattava = mikaMaa?.tila === "pelattava";
  /* "n/3 pelattu tänään" vasta kun päiväpelejä (Päivän visa, Mikä maa?) on ≥ 2 pelattavana; Synttärit ei ole päiväpeli. */
  const paivapeleja = [visa, mmPelattava].filter(Boolean).length;
  const maara = [visa, mmPelattava, sankari].filter(Boolean).length;
  return (
    <section className="tn-es-pp" aria-labelledby="tn-es-pp-h" data-tn-entry="etusivu:paivan-pelit">
      {/* v7: otsikko ja päivämäärä samalla rivillä (päivämäärä ei enää kickerinä otsikon yläpuolella). */}
      <div className="tn-es-pp-paa">
        <h2 id="tn-es-pp-h" className="tn-es-h2 tn-es-h2--iso">Päivän pelit</h2>
        <span className="tn-es-pp-pvm">{pvm.pitka}</span>
        {paivapeleja >= 2 && (
          <PelattuTanaan visaId={visa?.quizId ?? null} sankariId={sankari?.quizId ?? null} slotti={mmPelattava ? "mika-maa" : null} tanaan={d.today.iso} maara={maara} />
        )}
      </div>
      <div className="tn-es-pp-ruudukko">
        {visa && <PaivanVisaV5 k={visa} />}
        <div className="tn-es-pp-sivu" data-yksi={!mikaMaa || undefined}>
          {/* Synttärit A (v7 1b): iso ikä täyttää oikean puolen. Muistopäivänä "vuotta syntymästä". */}
          {sankari && (
            <a className="tn-es-synt" href={sankari.playHref} data-tn-entry="etusivu:synttarit">
              <span className="tn-es-synt-kuva">
                <Kuva src={sankari.kuva} pos={sankari.kuvaPos} luokka="tn-es-synt-img" sizes="(min-width: 1100px) 180px, 132px" />
              </span>
              <span className="tn-es-synt-teksti">
                <span className="tn-es-synt-yla">
                  <span className="tn-es-kicker tn-es-kicker--oranssi">
                    {sankari.tapaus === "muisto" ? "Muistopäivä" : sankari.tapaus === "pyorea" ? "Pyöreät synttärit" : "Synttärit tänään"}
                  </span>
                  <span className="tn-es-synt-ika">
                    <b>{sankari.ika}</b>
                    <span>{sankari.tapaus === "muisto" ? "vuotta syntymästä" : "vuotta"}</span>
                  </span>
                  <span className="tn-es-synt-h" style={lw(sankari.nimi)}>{sankari.nimi}</span>
                </span>
                <span className="tn-es-nappi tn-es-synt-nappi">Pelaa visa</span>
              </span>
            </a>
          )}
          {mikaMaa && <MikaMaa m={mikaMaa} />}
        </div>
      </div>
    </section>
  );
}

/** Päivän pelit, kolmas paikka: Mikä maa? (kompassinpunainen). Tulossa-kortti ei ole klikattava. */
function MikaMaa({ m }: { m: NonNullable<D["paivanPelit"]["mikaMaa"]> }) {
  const tulossa = m.tila === "tulossa";
  const [, kk, pv] = (m.julkaisu ?? "").split("-").map(Number);
  const sisus = (
    <>
      <span className="tn-es-mm-merkki" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </span>
      <span className="tn-es-slot-teksti">
        <span className="tn-es-laji"><i aria-hidden="true" /><span>{m.nimi}</span></span>
        <span className="tn-es-slot-h" style={lw("Päivän maa")}>Päivän maa</span>
        <span className="tn-es-slot-rivi">{m.etusivu_rivi}</span>
        {tulossa
          ? <span className="tn-es-mm-leima">Tulossa{m.julkaisu ? ` ${pv}.${kk}.` : ""}</span>
          : <span className="tn-es-nappi tn-es-nappi--acc">Arvaa</span>}
      </span>
    </>
  );
  const tyyli = { "--acc": m.aksentti } as CSSProperties;
  return tulossa ? (
    <div className="tn-es-slot tn-es-mm" data-tulossa aria-disabled="true" style={tyyli}>{sisus}</div>
  ) : (
    <a className="tn-es-slot tn-es-mm" href={m.href} data-paivan-peli="slotti" data-tn-entry="etusivu:mika-maa" style={tyyli}>{sisus}</a>
  );
}

function Tiesitko({ t, lcp }: { t: NonNullable<D["tiesitko"]>; lcp: boolean }) {
  /* Mobiilin LCP (Lighthouse 29.10.): esilataus vain, jos Päivän visa -kortissa ei ole kuvaa (v7: kuvakortti on LCP). */
  if (lcp && t.kuva) preload(t.kuva, { as: "image", fetchPriority: "high", imageSrcSet: kuvanSrcSet(t.kuva), imageSizes: KUVA_SIZES });
  const i = t.kysymys.lastIndexOf(t.korostus);
  const alku = i >= 0 ? t.kysymys.slice(0, i) : t.kysymys;
  const loppu = i >= 0 ? t.kysymys.slice(i + t.korostus.length) : "";
  return (
    <a className="tn-es-tt" href={t.href} data-tn-entry="etusivu:tiesitko">
      <span className="tn-es-tt-kuva">
        <Kuva src={t.kuva} pos={t.kuvaPos} luokka="tn-es-tt-img" eager={lcp} />
      </span>
      <span className="tn-es-tt-teksti">
        <span className="tn-es-tt-yla">
          <span className="tn-es-tag tn-es-tag--syaani">Tiesitkö?</span>
          <span className="tn-es-tt-kicker">{t.kicker}</span>
        </span>
        <span className="tn-es-tt-h" style={{ "--lw": Math.max(pisin(t.kysymys.replace(/[?.,!:;”"]/g, "")), t.korostus.length + 2) } as CSSProperties}>
          {alku}
          {i >= 0 && <mark>{t.korostus}</mark>}
          {loppu}
        </span>
        {/* v7: ääriviivanappi syaanina — lime on varattu Päivän visalle ja juhlabannerille. */}
        <span className="tn-es-nappi tn-es-tt-nappi">Ota selvää</span>
      </span>
    </a>
  );
}

function Aiheet({ a }: { a: D["aiheet"] }) {
  return (
    <section className="tn-es-osio" aria-labelledby="tn-es-aiheet-h" data-tn-entry="etusivu:kokoelmat">
      <div className="tn-es-otsake">
        <span className="tn-es-kicker">{a.kicker}</span>
        <h2 id="tn-es-aiheet-h" className="tn-es-h2">Pelaa aiheittain</h2>
      </div>
      <div className="tn-es-aiheet">
        {a.tiilet.map((x) => (
          <a key={x.slug} className="tn-es-aihe" href={x.href}>
            <span className="tn-es-aihe-kuva">
              <Kuva src={x.kuva} pos={x.kuvaPos} luokka="tn-es-aihe-img" sizes="(min-width: 1100px) 220px, (min-width: 700px) 25vw, 33vw" />
            </span>
            <span className="tn-es-aihe-nimi" lang="fi">{x.nimi}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Pelit({ p }: { p: D["pelit"] }) {
  return (
    <section className="tn-es-osio" aria-labelledby="tn-es-pelit-h" data-tn-entry="etusivu:pelimuodot">
      <div className="tn-es-otsake">
        <span className="tn-es-kicker">{p.kicker}</span>
        <h2 id="tn-es-pelit-h" className="tn-es-h2">Valitse peli</h2>
      </div>
      {p.ryhmat.map((g) => (
        <div key={g.avain} className="tn-es-ryhma">
          <h3 className="tn-es-ryhma-h"><span>{g.nimi}</span></h3>
          {/* < 768 px karuselli (v7: kortti 242 px, seuraava näkyy reunassa); ≥ 768 px ruudukko, sarakkeet korttimäärästä
              (analyysi 30.10.): 3 korttia = 3 saraketta; kuvan sizes palstan maksimista 1120 px. */}
          <div className="tn-es-rivi" data-ryhma={g.avain} data-sar={Math.min(g.kortit.length, 4)} style={{ "--sar": Math.min(g.kortit.length, 4) } as CSSProperties}>
            {g.kortit.map((m) => {
              const sisus = (
                <>
                  <span className="tn-es-peli-kuva">
                    {/* v8: kuvitus (pieni näkymä pelistä) niille peleille, joilla se on; muuten valokuva. */}
                    {KUVITETUT.has(m.slug)
                      ? <PeliKuvitus slug={m.slug} />
                      : <Kuva src={m.kuva} pos={m.kuvaPos} luokka="tn-es-peli-img" sizes={`(min-width: 768px) ${Math.round(1120 / Math.min(g.kortit.length, 4))}px, 242px`} />}
                  </span>
                  {m.tila === "tulossa" && <span className="tn-es-leima">Tulossa</span>}
                  <span className="tn-es-peli-teksti">
                    <span className="tn-es-laji" style={{ "--acc": m.aksentti } as CSSProperties}>
                      <i aria-hidden="true" />
                      <span className="tn-es-laji-teksti">{m.laji}</span>
                    </span>
                    <span className="tn-es-peli-h" lang="fi" style={lw(m.nimi)}>{m.nimi}</span>
                    <span className="tn-es-peli-rivi">{m.etusivu_rivi}</span>
                  </span>
                </>
              );
              return m.tila === "tulossa" ? (
                <div key={m.slug} className="tn-es-peli" data-tulossa aria-disabled="true">{sisus}</div>
              ) : (
                <a key={m.slug} className="tn-es-peli" href={m.href}>{sisus}</a>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function Promo1({ p }: { p: NonNullable<D["promo1"]> }) {
  if (p.tila === "countdown") return <Juhlabanneri b={p} />;
  return (
    <div className="tn-es-promo-paikka" data-tn-entry="etusivu:promo1">
      <a className="tn-es-promo tn-es-promo--1" href={p.href}>
        <span className="tn-es-promo-kuva">
          <Kuva src={p.kuva} pos={p.kuvaPos} luokka="tn-es-promo-img" sizes="(min-width: 1100px) 970px, 100vw" />
        </span>
        <span className="tn-es-promo-teksti">
          <span className="tn-es-promo-yla">
            <span className="tn-es-kicker tn-es-kicker--oranssi">{p.kicker}</span>
          </span>
          <span className="tn-es-promo-ala">
            <span className="tn-es-promo-h" style={lw(p.otsikko)}>{p.otsikko}</span>
            <span className="tn-es-nappi">Pelaa</span>
          </span>
        </span>
      </a>
    </div>
  );
}

function Juontajat({ j }: { j: D["juontajat"] }) {
  return (
    <section className="tn-es-osio" aria-labelledby="tn-es-juontajat-h" data-tn-entry="etusivu:juontajat">
      <div className="tn-es-otsake">
        <span className="tn-es-kicker">Visajuontajat</span>
        <h2 id="tn-es-juontajat-h" className="tn-es-h2">Laura ja Mikko suosittelevat</h2>
      </div>
      <div className="tn-es-juontajat">
        {j.map((h) => (
          <a key={h.key} className="tn-es-juontaja" href={h.href}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tn-es-juontaja-img" src={h.kuva} alt={h.nimi} loading="lazy" />
            <span className="tn-es-juontaja-teksti">
              {/* v9: yläotsikko "Tietovisa" + visan nimi; koukkukysymys visasta (ei sitaattimerkkejä). */}
              <span className="tn-es-juontaja-otsake">
                <span className="tn-es-juontaja-laji">Tietovisa</span>
                <span className="tn-es-juontaja-h" style={lw(h.visa)}>{h.visa}</span>
              </span>
              <span className="tn-es-juontaja-koukku">{h.koukku ? h.teaser : `”${h.teaser}”`}</span>
              <span className="tn-es-nappi tn-es-nappi--lime">Pelaa</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Promo2({ p }: { p: NonNullable<D["promo2"]> }) {
  return (
    <div className="tn-es-promo-paikka" data-tn-entry="etusivu:promo2">
      <a className="tn-es-promo tn-es-promo--2" href={p.href} rel="noopener">
        <span className="tn-es-promo-kuva">
          <Kuva src={p.kuva} luokka="tn-es-promo-img" />
        </span>
        <span className="tn-es-promo-teksti">
          <span className="tn-es-kicker">{p.kicker}</span>
          <span className="tn-es-ootko-h">{p.otsikko}</span>
          <span className="tn-es-ootko-cta">{p.cta}</span>
        </span>
      </a>
    </div>
  );
}

function LapsetJaPaketit({ l, vp }: { l: D["lapset"]; vp: D["visapaketit"] }) {
  const paketteja = (vp.iso ? 1 : 0) + vp.rivit.length;
  if (!l && !paketteja) return null;
  return (
    <div className="tn-es-lp">
      {l && (
        <div className="tn-es-lapset" data-tn-entry="etusivu:lapset">
          {/* Lapsille C (v7 1i): kuva pelistä, otsikko, ikäryhmät — ei kausikuvaa. */}
          <a className="tn-es-lapset-kuva" href={l.href} tabIndex={-1} aria-hidden="true">
            <Kuva src="/20/lapset/etusivu-peli.webp" luokka="tn-es-lapset-img" sizes="(min-width: 1100px) 200px, 132px" />
          </a>
          <div className="tn-es-lapset-teksti">
            {/* v9 (Heikki 30.10.): lyhyt esittelyteksti otsikon alla. */}
            <span className="tn-es-lapset-otsake">
              <a className="tn-es-lp-h" href={l.href}>Tietoniekka lapsille</a>
              <span className="tn-es-lapset-rivi">Kuva- ja äänivisoja <span className="tn-es-ehja">4–12-vuotiaille</span>. Vinkit auttavat, jos vastaus ei heti löydy.</span>
            </span>
            <div className="tn-es-lapset-iat">
              <a className="tn-es-nappi tn-es-nappi--lime" href={`${l.href}?ika=4-7`}>4–7 v</a>
              <a className="tn-es-nappi tn-es-nappi--lime" href={`${l.href}?ika=8-12`}>8–12 v</a>
            </div>
          </div>
        </div>
      )}
      {/* Visapaketit "Visailta valmiina" (CD v10): kauden paketti isona, muut riveinä. */}
      {paketteja > 0 && (
        <section className="tn-es-osio tn-es-vp" aria-labelledby="tn-es-vp-h" data-tn-entry="etusivu:visapaketit">
          <div className="tn-es-otsake">
            <span className="tn-es-kicker">Visapaketit · ilmainen</span>
            <h2 id="tn-es-vp-h" className="tn-es-h2">Visailta valmiina</h2>
            <p className="tn-es-vp-ingressi">Valmiit kierrokset vastauksineen. Pelaa yhdessä, näytä ruudulta tai tulosta joukkueille.</p>
          </div>
          {vp.iso && (
            <a className="tn-es-vp-iso" href={vp.iso.href}>
              <span className="tn-es-vp-iso-kuva"><Kuva src={vp.iso.kuva} luokka="tn-es-vp-iso-img" pos="50% 55%" sizes="(min-width: 1100px) 540px, 100vw" /></span>
              <span className="tn-es-vp-iso-teksti">
                <span className="tn-es-vp-iso-h">{vp.iso.otsikko}</span>
                <span className="tn-es-nappi tn-es-vp-nappi">Katso paketti</span>
              </span>
            </a>
          )}
          {vp.rivit.length > 0 && (
            <div className="tn-es-vp-rivit">
              {vp.rivit.map((p) => (
                <a key={p.avain} className="tn-es-vp-rivi" href={p.href}>
                  <Kuva src={p.kuva} luokka="tn-es-vp-rivi-img" pos="30% 40%" sizes="64px" />
                  <span className="tn-es-vp-rivi-teksti">
                    <span className="tn-es-vp-rivi-h">{p.otsikko}</span>
                    {p.alarivi && <span className="tn-es-vp-rivi-ala">{p.alarivi}</span>}
                  </span>
                  <span className="tn-es-vp-nuoli" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          )}
          {vp.kaikki && <a className="tn-es-nappi" href="/visapaketit">Kaikki visapaketit</a>}
        </section>
      )}
    </div>
  );
}

export default function EtusivuV5({ d }: { d: D }) {
  return (
    <div className="tn-es5" data-tn-entry="etusivu:muu">
      <PaivanPelit d={d} />
      {d.tiesitko && <Tiesitko t={d.tiesitko} lcp={!d.paivanPelit.visa?.kuva} />}
      <Aiheet a={d.aiheet} />
      <Pelit p={d.pelit} />
      {d.promo1 && <Promo1 p={d.promo1} />}
      {d.juontajat.length > 0 && <Juontajat j={d.juontajat} />}
      {d.promo2 && <Promo2 p={d.promo2} />}
      <LapsetJaPaketit l={d.lapset} vp={d.visapaketit} />
    </div>
  );
}
