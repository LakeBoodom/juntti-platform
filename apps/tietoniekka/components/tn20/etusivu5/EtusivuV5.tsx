// ETUSIVU v5 — näkymä (design Tietoniekka_Etusivu_v5: 5a desktop 1440, 5b mobiili 390, 5c promopaikka; Heikki 28.10.2026).
// Data: lib/etusivu5.ts. CSS: app/(tn20)/etusivu-v5.css (luokat .tn-es-*, mobile-first).
// Seuranta: jokainen osio kantaa data-tn-entry="etusivu:<osio>" (lib/seuranta.ts).
// Ei aputekstejä: otsikko, kortti, nappi. Osio-otsikon yläpuolella vain kicker-määrä.
import type { CSSProperties } from "react";
import type { EtusivuData } from "@/lib/etusivu5";
import PelattuTanaan from "./PelattuTanaan";
import PaivanVisaV5 from "./PaivanVisaV5";
import { kuvanSrcSet } from "@/lib/kuvaVariantit";

type D = NonNullable<EtusivuData>;

/** Pisimmän sanan pituus otsikon kokokaavaan (KORTTISÄÄNTÖ): --lw. Yhdysmerkki on katkaisukohta. */
const pisin = (t: string) => Math.max(...t.split(/[\s\u00AD]+/).flatMap((w) => w.split(/(?<=-)/)).map((w) => w.length), 4);
const lw = (t: string) => ({ "--lw": pisin(t) }) as CSSProperties;
/** Mobiilin pelitiilen nimi: yhdyssanarajoilla tavuviivakohdat (U+00AD, config `tavut`) — 2 sarakkeen tiilessä
 *  nimelle jää 68–95 px. --lw-t = pisin osa, --lw = koko sana (desktopin kortti, ei katkea). */
const tavutettu = (m: { nimi: string; tavut?: string }) => (m.tavut ?? m.nimi).replace(/\|/g, "\u00AD");

/** Kuva: srcset omien kopioiden kokoversioista (lib/kuvaVariantit) — sizes = kuvan leveys näkymässä. */
function Kuva({ src, pos, luokka, eager, sizes = "(min-width: 1100px) 600px, 100vw" }: {
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
      <div className="tn-es-pp-paa">
        <div className="tn-es-otsake">
          <span className="tn-es-kicker tn-es-kicker--kulta">
            <span className="tn-es-vain-desk">{pvm.pitka}</span>
            <span className="tn-es-vain-mob">{pvm.lyhyt}</span>
          </span>
          <h2 id="tn-es-pp-h" className="tn-es-h2 tn-es-h2--iso">Päivän pelit</h2>
        </div>
        {paivapeleja >= 2 && (
          <PelattuTanaan visaId={visa?.quizId ?? null} sankariId={sankari?.quizId ?? null} slotti={mmPelattava ? "mika-maa" : null} tanaan={d.today.iso} maara={maara} />
        )}
      </div>
      <div className="tn-es-pp-ruudukko">
        {visa && <PaivanVisaV5 k={visa} />}
        <div className="tn-es-pp-sivu" data-yksi={!mikaMaa || undefined}>
          {sankari && (
            <a className="tn-es-synt" href={sankari.playHref} data-tn-entry="etusivu:synttarit">
              <span className="tn-es-synt-kuva">
                <Kuva src={sankari.kuva} pos={sankari.kuvaPos} luokka="tn-es-synt-img" />
              </span>
              <span className="tn-es-synt-teksti">
                <span className="tn-es-kicker tn-es-kicker--oranssi">{sankari.kicker.mobile}</span>
                <span className="tn-es-synt-h" style={lw(sankari.nimi)}>{sankari.nimi}</span>
                <span className="tn-es-nappi">Pelaa visa</span>
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

function Tiesitko({ t }: { t: NonNullable<D["tiesitko"]> }) {
  const i = t.kysymys.lastIndexOf(t.korostus);
  const alku = i >= 0 ? t.kysymys.slice(0, i) : t.kysymys;
  const loppu = i >= 0 ? t.kysymys.slice(i + t.korostus.length) : "";
  return (
    <a className="tn-es-tt" href={t.href} data-tn-entry="etusivu:tiesitko">
      <span className="tn-es-tt-kuva">
        <Kuva src={t.kuva} pos={t.kuvaPos} luokka="tn-es-tt-img" eager />
      </span>
      <span className="tn-es-tt-teksti">
        <span className="tn-es-tt-yla">
          <span className="tn-es-tag tn-es-tag--syaani">Tiesitkö?</span>
          <span className="tn-es-tt-kicker tn-es-vain-desk">{t.kicker}</span>
        </span>
        <span className="tn-es-tt-h" style={{ "--lw": Math.max(pisin(t.kysymys.replace(/[?.,!:;”"]/g, "")), t.korostus.length + 2) } as CSSProperties}>
          {alku}
          {i >= 0 && <mark>{t.korostus}</mark>}
          {loppu}
        </span>
        <span className="tn-es-cta tn-cta-lime">Ota selvää</span>
      </span>
    </a>
  );
}

function Aiheet({ a }: { a: D["aiheet"] }) {
  return (
    <section className="tn-es-osio" aria-labelledby="tn-es-aiheet-h" data-tn-entry="etusivu:kokoelmat">
      <div className="tn-es-otsake">
        <span className="tn-es-kicker">{a.kicker}</span>
        <h2 id="tn-es-aiheet-h" className="tn-es-h2">Selaa aiheittain</h2>
      </div>
      <div className="tn-es-aiheet">
        {a.tiilet.map((x) => (
          <a key={x.slug} className="tn-es-aihe" href={x.href}>
            <Kuva src={x.kuva} pos={x.kuvaPos} luokka="tn-es-aihe-img" sizes="(min-width: 1100px) 280px, 50vw" />
            <span className="tn-es-aihe-nimi" lang="fi" style={lw(x.nimi)}>{x.nimi}</span>
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
          <div className="tn-es-rivi" data-ryhma={g.avain}>
            {g.kortit.map((m) => {
              const sisus = (
                <>
                  <span className="tn-es-peli-kuva">
                    <Kuva src={m.kuva} pos={m.kuvaPos} luokka="tn-es-peli-img" sizes="(min-width: 768px) 320px, 56px" />
                  </span>
                  {m.tila === "tulossa" && <span className="tn-es-leima">Tulossa</span>}
                  <span className="tn-es-peli-teksti">
                    <span className="tn-es-laji" style={{ "--acc": m.aksentti } as CSSProperties}>
                      <i aria-hidden="true" />
                      <span className="tn-es-laji-teksti">{m.laji}</span>
                    </span>
                    <span className="tn-es-peli-h" lang="fi" style={{ ...lw(m.nimi), "--lw-t": pisin(tavutettu(m)) } as CSSProperties}>
                      {tavutettu(m)}
                    </span>
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
  return (
    <div className="tn-es-promo-paikka" data-tn-entry="etusivu:promo1">
      <a className="tn-es-promo tn-es-promo--1" href={p.href}>
        <span className="tn-es-promo-kuva">
          <Kuva src={p.kuva} pos={p.kuvaPos} luokka="tn-es-promo-img" sizes="(min-width: 1100px) 970px, 100vw" />
        </span>
        <span className="tn-es-promo-teksti">
          <span className="tn-es-promo-yla">
            <span className="tn-es-kicker tn-es-kicker--oranssi">{p.kicker}</span>
            {p.tila === "countdown" && (
              <span className="tn-es-promo-laskuri">
                {p.paivia === 0 ? "Tänään" : (
                  <>
                    <b>{p.paivia}</b> <span className="tn-es-vain-desk">{p.paivia === 1 ? "päivä" : "päivää"}</span>
                    <span className="tn-es-vain-mob">pv</span>
                  </>
                )}
              </span>
            )}
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
              <span className="tn-es-kicker" style={{ color: h.aksentti }}>{h.nimi} suosittelee</span>
              <span className="tn-es-juontaja-h" style={lw(h.visa)}>{h.visa}</span>
              <span className="tn-es-juontaja-sitaatti">”{h.teaser}”</span>
              <span className="tn-es-nappi">Pelaa</span>
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

function LapsetJaPaketit({ l, paketit }: { l: D["lapset"]; paketit: D["paketit"] }) {
  if (!l && !paketit.length) return null;
  return (
    <div className="tn-es-lp" data-tn-entry="etusivu:lapset">
      {l && (
        <div className="tn-es-lapset">
          <a className="tn-es-lapset-paa" href={l.href}>
            <span className="tn-es-kicker tn-es-kicker--vihrea">Lapsille</span>
            <span className="tn-es-lp-h">Tietoniekka lapsille</span>
          </a>
          <div className="tn-es-lapset-iat">
            <a className="tn-es-nappi" href={`${l.href}?ika=4-7`}>4–7 v</a>
            <a className="tn-es-nappi" href={`${l.href}?ika=8-12`}>8–12 v</a>
          </div>
          <Kuva src="/20/lapset/hero-v1.webp" luokka="tn-es-lp-kuva" />
        </div>
      )}
      {paketit.map((p) => (
        <div key={p.avain} className="tn-es-paketti" data-tulossa={p.tila === "tulossa" || undefined} aria-disabled={p.tila === "tulossa" || undefined}>
          <span className="tn-es-paketti-teksti">
            <span className="tn-es-kicker tn-es-kicker--kulta2">{p.kicker}</span>
            <span className="tn-es-lp-h">{p.otsikko}</span>
            <span className="tn-es-paketti-rivi tn-es-vain-desk">{p.rivi}</span>
          </span>
          <Kuva src={p.kuva} luokka="tn-es-lp-kuva" />
        </div>
      ))}
    </div>
  );
}

export default function EtusivuV5({ d }: { d: D }) {
  return (
    <div className="tn-es5" data-tn-entry="etusivu:muu">
      <PaivanPelit d={d} />
      {d.tiesitko && <Tiesitko t={d.tiesitko} />}
      <Aiheet a={d.aiheet} />
      <Pelit p={d.pelit} />
      {d.promo1 && <Promo1 p={d.promo1} />}
      {d.juontajat.length > 0 && <Juontajat j={d.juontajat} />}
      {d.promo2 && <Promo2 p={d.promo2} />}
      <LapsetJaPaketit l={d.lapset} paketit={d.paketit} />
    </div>
  );
}
